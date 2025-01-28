from datetime import datetime, timedelta
from typing import List, Optional
import pandas as pd
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, Field, EmailStr
import os
from db.create_db import BusStopDatabase
from services.bus_data_fetcher import BusDataFetcher
from services.travel_time_service import TravelTimeService
from utils.tokenizer import (
    generate_verification_token,
    confirm_verification_token,
    generate_reset_token,
    confirm_reset_token,
)
from services.email_service import send_verification_email, send_password_reset_email
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
import time

class BusTravelTime(BaseModel):
    latitude: float = Field(..., description="Latitude of the bus stop")
    longitude: float = Field(..., description="Longitude of the bus stop")
    distance: float = Field(..., description="Distance to the bus in kilometers")
    speed: float = Field(..., description="Speed of the bus in km/h")
    order: str = Field(..., description="Order of the bus")


class TravelTimeResponse(BaseModel):
    buses: List[BusTravelTime] = Field(
        ..., description="List of buses with travel times"
    )


SECRET_KEY = os.getenv("SECRET_KEY", "SKW")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


db = BusStopDatabase()


def authenticate_user(email: str, password: str):
    user = db.get_user(email)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Usuário ou senha inválidos.")
        user = db.get_user(email)
        if user is None:
            raise HTTPException(status_code=401, detail="Usuário ou senha inválidos.")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos.")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")


STOPS_CSV = "./data/stops_updated.csv"


def load_stops():
    df = pd.read_csv(STOPS_CSV)
    df = df[["stop_name", "stop_lat", "stop_lon"]]
    return df


def get_stop_coords(stop_name: str):
    stops_df = load_stops()
    stop = stops_df[stops_df["stop_name"] == stop_name]
    if not stop.empty:
        stop_info = stop.iloc[0]
        bus_stops_infos = {
            "bus_stop": stop_info["stop_name"],
            "lat": stop_info["stop_lat"],
            "lon": stop_info["stop_lon"],
        }
        return bus_stops_infos

    raise HTTPException(status_code=404, detail="Ponto de ônibus não encontrado.")


def parse_stops():
    stops_df = load_stops()
    filtered_stops = [row.to_dict() for _, row in stops_df.iterrows()]
    return filtered_stops


def parse_coords(coord: str):
    return float(coord.replace(",", "."))


def get_bus_data_fetcher() -> BusDataFetcher:
    return BusDataFetcher()


def get_travel_time_service() -> TravelTimeService:
    return TravelTimeService()


async def get_filtered_bus_line(
    bus_line: str,
    start_time: str,
    end_time: str,
    bus_stop_name: str,
):
    service = TravelTimeService()
    fetcher = BusDataFetcher()
    bus_stop_coords = get_stop_coords(bus_stop_name)
    buses_data = fetcher.get_buses_data(start_time, end_time)

    if bus_line is not None:
        seen_ordem = set()
        filtered_bus_line = []

        for line_data in buses_data:
            if (
                str(line_data["linha"]) == str(bus_line)
                and line_data["ordem"] not in seen_ordem
                and not seen_ordem.add(line_data["ordem"])
            ):
                bus_info = {
                    "linha": line_data.get("linha"),
                    "velocidade": line_data.get("velocidade"),
                    "latitude": parse_coords(line_data.get("latitude")),
                    "longitude": parse_coords(line_data.get("longitude")),
                    "ordem": line_data.get("ordem"),
                }

                filtered_bus_line.append(bus_info)

    else:
        filtered_bus_line = buses_data

    if not filtered_bus_line:
        return filtered_bus_line

    filtered_bus_line = service.get_travel_times(bus_stop_coords, filtered_bus_line)

    return filtered_bus_line


@app.get("/infos/")
@cache(expire=300)
async def read_info(
    bus_line: str, start_time: str, end_time: str, bus_stop: str
):
    return await get_filtered_bus_line(bus_line, start_time, end_time, bus_stop)


@app.get("/stops/")
def read_stops():
    return parse_stops()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


@app.post("/register/")
async def register_user(request: RegisterRequest):
    hashed_password = get_password_hash(request.password)
    token = generate_verification_token(request.email)
    try:
        db.register_user(request.email, hashed_password, token)
        send_verification_email(request.email, token)
        return {
            "status": "success",
            "message": "Usuário cadastrado com sucesso! Por favor, verifique seu email para confirmar seu cadastro.",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/verify/")
async def verify_email(token: str):
    try:
        email = confirm_verification_token(token)
        success = db.verify_user(token)
        if not success:
            raise HTTPException(
                status_code=400, detail="Token de verificação inválido ou expirado."
            )
        return {"status": "success", "message": "Email verificado com sucesso!"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")


class ResendVerificationRequest(BaseModel):
    email: EmailStr


@app.post("/resend-verification/")
async def resend_verification(request: ResendVerificationRequest):
    user = db.get_user(request.email)
    if not user:
        raise HTTPException(status_code=400, detail="Usuário não encontrado.")
    if user["is_verified"]:
        raise HTTPException(status_code=400, detail="Usuário já verificado.")

    new_token = generate_verification_token(request.email)
    db.update_verification_token(request.email, new_token)

    try:
        send_verification_email(request.email, new_token)
        return {
            "status": "success",
            "message": "Email de verificação reenviado com sucesso.",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Erro ao enviar email de verificação. Por favor, tente novamente mais tarde!",
        )


@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
    if not user["is_verified"]:
        raise HTTPException(
            status_code=400,
            detail="Email não verificado. Por favor, verifique seu email antes de entrar.",
        )
    access_token = create_access_token(
        {"sub": form_data.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me")
async def read_current_user(current_user: dict = Depends(get_current_user)):
    return {"email": current_user["email"]}


class StopRegistration(BaseModel):
    bus_line: str
    stop_name: str
    latitude: float
    longitude: float
    start_time: str
    end_time: str
    max_distance: int


@app.post("/stops/register/")
async def register_stop(
    stop: StopRegistration,
    current_user: dict = Depends(get_current_user),
):
    db = BusStopDatabase()
    try:
        db.insert_bus_stop(
            email=current_user["email"],
            bus_line=stop.bus_line,
            stop_name=stop.stop_name,
            latitude=stop.latitude,
            longitude=stop.longitude,
            start_time=stop.start_time,
            end_time=stop.end_time,
            max_distance=stop.max_distance,
        )
        return {"status": "success", "message": "Bus stop registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error registering stop: {str(e)}")


@app.get("/travel_times/", response_model=TravelTimeResponse)
async def get_travel_times(
    bus_line: Optional[str] = Query(None, description="Bus line identifier"),
    stop_name: str = Query(..., description="Name of the bus stop"),
    latitude: float = Query(..., description="Latitude of the bus stop"),
    longitude: float = Query(..., description="Longitude of the bus stop"),
    start_time: str = Query(..., description="Start time in HH:MM:SS format"),
    end_time: str = Query(..., description="End time in HH:MM:SS format"),
):
    try:
        fetcher = BusDataFetcher()
        service = TravelTimeService()

        buses_data = fetcher.get_buses_data(start_time, end_time)

        if not buses_data:
            return {"buses": []}

        if bus_line:
            seen_ordem = set()
            filtered_buses = []
            for line_data in buses_data:
                if (
                    str(line_data.get("linha")) == str(bus_line)
                    and line_data.get("ordem") not in seen_ordem
                ):
                    seen_ordem.add(line_data.get("ordem"))
                    bus_info = {
                        "linha": line_data.get("linha"),
                        "velocidade": line_data.get("velocidade"),
                        "latitude": parse_coords(line_data.get("latitude")),
                        "longitude": parse_coords(line_data.get("longitude")),
                        "ordem": line_data.get("ordem"),
                    }
                    filtered_buses.append(bus_info)
        else:
            filtered_buses = [
                {
                    "linha": bus.get("linha"),
                    "velocidade": bus.get("velocidade"),
                    "latitude": parse_coords(bus.get("latitude")),
                    "longitude": parse_coords(bus.get("longitude")),
                    "ordem": bus.get("ordem"),
                }
                for bus in buses_data
            ]

        if not filtered_buses:
            return {"buses": []}

        bus_stop_coords = {"lat": latitude, "lon": longitude}

        travel_times = service.get_travel_times(bus_stop_coords, filtered_buses)

        for bus in travel_times:
            if bus["distancia"] == "Not found":
                bus["distancia"] = "-"

        response_buses = [
            BusTravelTime(
                latitude=bus["latitude"],
                longitude=bus["longitude"],
                distance=bus["distancia"],
                speed=bus["velocidade"],
                order=bus["ordem"],
            )
            for bus in travel_times
        ]

        print(f"Response: {response_buses}")

        return {"buses": response_buses}

    except Exception as e:
        import logging

        logging.error(f"Error in /travel_times/ endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


class StopIdentifier(BaseModel):
    stop_name: str
    latitude: float
    longitude: float
    start_time: str
    end_time: str
    max_distance: int


def timedelta_to_str(td: timedelta) -> str:
    seconds = int(td.total_seconds())
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02}:{minutes:02}:{seconds:02}"


@app.get("/stops/registered/", response_model=List[StopRegistration])
async def get_registered_stops(current_user: dict = Depends(get_current_user)):
    raw_stops = db.get_stops_by_user(current_user["email"])

    stops = [
        {
            "bus_line": stop["linha"],
            "email": stop["email"],
            "stop_name": stop["stop_name"],
            "latitude": stop["latitude"],
            "longitude": stop["longitude"],
            "start_time": timedelta_to_str(stop["start_time"]),
            "end_time": timedelta_to_str(stop["end_time"]),
            "max_distance": stop["max_distance"],
        }
        for stop in raw_stops
    ]
    return stops


@app.delete("/stops/registered/")
async def delete_registered_stop(
    stop: StopIdentifier,
    current_user: dict = Depends(get_current_user),
):
    try:
        start_time_td = timedelta(
            hours=int(stop.start_time.split(":")[0]),
            minutes=int(stop.start_time.split(":")[1]),
            seconds=int(stop.start_time.split(":")[2]),
        )
        end_time_td = timedelta(
            hours=int(stop.end_time.split(":")[0]),
            minutes=int(stop.end_time.split(":")[1]),
            seconds=int(stop.end_time.split(":")[2]),
        )

        db.delete_stop(
            email=current_user["email"],
            stop_name=stop.stop_name,
            latitude=stop.latitude,
            longitude=stop.longitude,
            start_time=start_time_td,
            end_time=end_time_td,
            max_distance=stop.max_distance,
        )
        return {"status": "success", "message": "Stop deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao deletar ponto de ônibus: {str(e)}"
        )


def timedelta_to_str(td: timedelta) -> str:
    seconds = int(td.total_seconds())
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02}:{minutes:02}:{seconds:02}"


class PasswordResetRequest(BaseModel):
    email: EmailStr


@app.post("/request-password-reset/", summary="Request a password reset")
async def request_password_reset(request: PasswordResetRequest):
    user = db.get_user(request.email)
    if not user:
        return {
            "status": "success",
            "message": "If the email is registered, a password reset link has been sent.",
        }

    reset_token = generate_reset_token(request.email)

    db.set_reset_token(request.email, reset_token)

    try:
        send_password_reset_email(request.email, reset_token)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Falha ao enviar email de redefinição de senha."
        )

    return {
        "status": "success",
        "message": "If the email is registered, a password reset link has been sent.",
    }


class PasswordReset(BaseModel):
    token: str
    new_password: str


@app.post("/reset-password/", summary="Reset your password")
async def reset_password(reset: PasswordReset):
    try:
        email = confirm_reset_token(reset.token)

        user = db.get_user_by_reset_token(reset.token)
        if not user:
            raise HTTPException(
                status_code=400, detail="Token de verificação inválido ou expirado."
            )

        hashed_password = get_password_hash(reset.new_password)

        db.update_user(email=email, hashed_password=hashed_password)

        db.clear_reset_token(email)

        return {
            "status": "success",
            "message": "Your password has been reset successfully.",
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

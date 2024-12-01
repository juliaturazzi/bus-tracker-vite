from datetime import datetime, timedelta
from typing import Dict, Any
import pandas as pd
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext

from db.create_db import BusStopDatabase
from services.bus_data_fetcher import BusDataFetcher
from services.travel_time_service import TravelTimeService
from typing import List, Optional
from pydantic import BaseModel, Field

# Pydantic model for travel time response
class BusTravelTime(BaseModel):
    distance: float = Field(..., description="Distance to the bus in kilometers")
    speed: float = Field(..., description="Speed of the bus in km/h")
    order: str = Field(..., description="Order of the bus")

class TravelTimeResponse(BaseModel):
    buses: List[BusTravelTime] = Field(..., description="List of buses with travel times")



# Constants
SECRET_KEY = "SKW"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
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


# Database instance
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
            raise HTTPException(status_code=401, detail="Invalid credentials")
        user = db.get_user(email)
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")


# Initialize FastAPI app
app = FastAPI()

# Fixing CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CSV bus stops
STOPS_CSV = "./data/stops_updated.csv"


# Load bus stops from CSV
def load_stops():
    df = pd.read_csv(STOPS_CSV)
    df = df[["stop_name", "stop_lat", "stop_lon"]]
    return df


# Get coordinates of a bus stop by name
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

    raise HTTPException(status_code=404, detail="Bus stop not found")


# Filter stops within a radius from coordinate
def parse_stops():
    stops_df = load_stops()
    filtered_stops = [row.to_dict() for _, row in stops_df.iterrows()]
    return filtered_stops


# Parse coordinates from string to float
def parse_coords(coord: str):
    return float(coord.replace(",", "."))


# Dependency provider for BusDataFetcher
def get_bus_data_fetcher() -> BusDataFetcher:
    return BusDataFetcher()


# Dependency provider for TravelTimeService
def get_travel_time_service() -> TravelTimeService:
    return TravelTimeService()


# Get user filtered bus lines
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


# Endpoints


# Get bus lines information
@app.get("/infos/")
async def read_info(bus_line: str, start_time: str, end_time: str, bus_stop: str):
    return await get_filtered_bus_line(bus_line, start_time, end_time, bus_stop)


# Get bus stops within a radius of coordinates
@app.get("/stops/")
def read_stops():
    return parse_stops()


@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register/")
async def register_user(data: Dict[Any, Any]):
    hashed_password = get_password_hash(data["password"])
    try:
        db.register_user(data["email"], data["username"], hashed_password)
        return {"status": "success", "message": "User registered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/users/me")
async def read_current_user(current_user: dict = Depends(get_current_user)):
    return {"email": current_user["email"], "username": current_user["username"]}


# Pydantic model for bus stop registration
class StopRegistration(BaseModel):
    bus_line: str
    stop_name: str
    latitude: float
    longitude: float
    start_time: str
    end_time: str


@app.post("/stops/register/")
async def register_stop(
    stop: StopRegistration,
    current_user: dict = Depends(get_current_user),  # Ensure the user is authenticated
):
    db = BusStopDatabase()

    # Insert the stop into the database, associating it with the user's email
    try:
        db.insert_bus_stop(
            email=current_user["email"],
            bus_line=stop.bus_line,
            stop_name=stop.stop_name,
            latitude=stop.latitude,
            longitude=stop.longitude,
            start_time=stop.start_time,
            end_time=stop.end_time,
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
    """
    GET endpoint to retrieve buses and their travel times from a bus stop.

    Parameters:
    - bus_line: (Optional) Filter buses by this bus line.
    - stop_name: Name of the bus stop.
    - latitude: Latitude of the bus stop.
    - longitude: Longitude of the bus stop.
    - start_time: Start time for fetching bus data (format: HH:MM:SS).
    - end_time: End time for fetching bus data (format: HH:MM:SS).

    Returns:
    - buses: List of buses with their distance, speed, and order.
    """
    try:
        # Initialize services
        fetcher = BusDataFetcher()
        service = TravelTimeService()

        # Fetch bus data within the specified time range
        buses_data = fetcher.get_buses_data(start_time, end_time)

        if not buses_data:
            return {"buses": []}

        # Filter buses by bus_line if provided
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
            # If no bus_line filter is applied, include all buses
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

        # Prepare bus stop coordinates
        bus_stop_coords = {"lat": latitude, "lon": longitude}

        # Calculate travel times using TravelTimeService
        travel_times = service.get_travel_times(bus_stop_coords, filtered_buses)

        # Format the response to match MOCK_BUS_DATA structure
        response_buses = [
            BusTravelTime(
                distance=bus["distancia"],
                speed=bus["velocidade"],
                order=bus["ordem"],
            )
            for bus in travel_times
        ]

        return {"buses": response_buses}

    except Exception as e:
        # Log the error details (optional)
        import logging
        logging.error(f"Error in /travel_times/ endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
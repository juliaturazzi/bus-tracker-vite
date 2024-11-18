from typing import Dict, Any

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db.create_db import BusStopDatabase
from services.bus_data_fetcher import BusDataFetcher
from services.travel_time_service import TravelTimeService

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


# Get bus lines information
@app.get("/infos/")
async def read_info(bus_line: str, start_time: str, end_time: str, bus_stop: str):
    return await get_filtered_bus_line(bus_line, start_time, end_time, bus_stop)


# Get bus stops within a radius of coordinates
@app.get("/stops/")
def read_stops():
    return parse_stops()


# Register bus stop with details
@app.post("/register/")
async def send_email_endpoint(data: Dict[Any, Any]):
    bus_stop_info = get_stop_coords(data["bus_stop"])
    bus_stop_name = data["bus_stop"]
    bus_line = data["bus_line"]
    lat = bus_stop_info["lat"]
    lon = bus_stop_info["lon"]
    start_time = data["start_time"]
    end_time = data["end_time"]
    email = data["email"]
    db = BusStopDatabase()
    db.insert_bus_stop(email, bus_line, bus_stop_name, lat, lon, start_time, end_time)
    return {"status": "success", "message": "Bus stop registered successfully"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost",
    "http://127.0.0.1:8000",  # Add this explicitly
    "http://localhost:5173",  # If the frontend runs on port 8080
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define your data model
class Bus(BaseModel):
    distance: float
    speed: float
    order: int


MOCK_BUS_DATA = [
    {"distance": 3.5, "speed": 40.0, "order": 1},
    {"distance": 5.0, "speed": 35.0, "order": 2},
    {"distance": 2.0, "speed": 50.0, "order": 3},
    {"distance": 8.0, "speed": 45.0, "order": 4},
    {"distance": 1.0, "speed": 30.0, "order": 5},
    {"distance": 4.0, "speed": 55.0, "order": 6},
    {"distance": 6.0, "speed": 60.0, "order": 7},
    {"distance": 7.0, "speed": 25.0, "order": 8},
    {"distance": 9.0, "speed": 20.0, "order": 9},
    {"distance": 10.0, "speed": 15.0, "order": 10},
    {"distance": 11.0, "speed": 10.0, "order": 11},
    {"distance": 12.0, "speed": 5.0, "order": 12},
    {"distance": 13.0, "speed": 0.0, "order": 13},
]


@app.post("/api/bus-data", response_model=List[Bus])
async def get_bus_data():
    return MOCK_BUS_DATA

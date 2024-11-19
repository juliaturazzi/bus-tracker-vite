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
]


@app.post("/api/bus-data", response_model=List[Bus])
async def get_bus_data():
    return MOCK_BUS_DATA

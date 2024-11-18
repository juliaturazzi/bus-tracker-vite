from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()


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

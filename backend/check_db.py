import asyncio
import time
from datetime import datetime

from dotenv import load_dotenv

from app import get_filtered_bus_line
from db.create_db import BusStopDatabase
from services.email_service import send_email
from services.travel_time_service import TravelTimeService

load_dotenv()

# Ten-minute range
NEARBY_BUSES_MINUTES_MIN = 0
NEARBY_BUSES_MINUTES_MAX = 11.00

# Check if the current time is within a specified interval
def check_time(start, end):
    current_time = datetime.now().time()

    # If end time is before start time, the interval crosses midnight
    if end < start:
        return current_time >= start or current_time < end
    else:
        return start <= current_time < end

# Convert stop data to a dictionary
def stop_to_dict(stop):
    start_time = str(stop[5])
    end_time = str(stop[6])
    return {
        "email": stop[0],
        "bus_line": stop[1],
        "stop_name": stop[2],
        "lat": stop[3],
        "lon": stop[4],
        "start_time": datetime.strptime(start_time, "%H:%M:%S").time(),
        "end_time": datetime.strptime(end_time, "%H:%M:%S").time(),
    }

# Evaluate travel time to multiple buses asynchronously
async def evaluate_travel_time(stop, buses, service):
    bus_stop_info = {
        "bus_stop": stop["stop_name"],
        "lat": stop["lat"],
        "lon": stop["lon"],
    }
    # Run the synchronous get_travel_times in a separate thread
    updated_buses = await asyncio.to_thread(service.get_travel_times, bus_stop_info, buses)
    return updated_buses

# Collect and filter bus data based on travel times
async def collect_bus_data(stop, buses, service):
    bus_data = {}
    updated_buses = await evaluate_travel_time(stop, buses, service)
    for bus in updated_buses:
        distancia = bus.get("distancia")
        # Ensure 'id' exists; adjust if your identifier is different
        bus_id = bus.get("id") or bus.get("ordem")
        if distancia != "Not found" and bus_id:
            if NEARBY_BUSES_MINUTES_MIN <= float(distancia) < NEARBY_BUSES_MINUTES_MAX:
                bus_data[bus_id] = distancia
    return bus_data

# Process a single bus stop
async def process_stop(stop, service):
    if check_time(stop["start_time"], stop["end_time"]):
        buses = await get_filtered_bus_line(
            stop["bus_line"],
            stop["start_time"],
            stop["end_time"],
            stop["stop_name"],
        )
        if not buses:
            return  # No buses to process

        bus_data = await collect_bus_data(stop, buses, service)
        if bus_data:
            await asyncio.to_thread(send_email, stop["email"], stop["bus_line"], stop["stop_name"], bus_data)

# Fetch and process all bus stops
def process_all_bus_stops():
    db = BusStopDatabase()
    raw_stops = db.get_all_bus_stops()
    if raw_stops:
        for raw_stop in raw_stops:
            stop = stop_to_dict(raw_stop)
            yield stop

# Main asynchronous loop
async def main():
    service = TravelTimeService()
    while True:
        tasks = []
        for stop in process_all_bus_stops():
            tasks.append(process_stop(stop, service))
        if tasks:
            # Run all tasks concurrently
            await asyncio.gather(*tasks)
        await asyncio.sleep(60)  # Wait for a minute before the next check

if __name__ == "__main__":
    asyncio.run(main())

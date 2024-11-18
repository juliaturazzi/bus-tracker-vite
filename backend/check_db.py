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
    print(f"[{datetime.now()}] Checking time: {current_time} against start: {start} and end: {end}")

    # If end time is before start time, the interval crosses midnight
    if end < start:
        result = current_time >= start or current_time < end
    else:
        result = start <= current_time < end

    print(f"[{datetime.now()}] Time check result: {result}")
    return result


# Convert stop data to a dictionary
def stop_to_dict(stop):
    start_time = str(stop[5])
    end_time = str(stop[6])
    stop_dict = {
        "email": stop[0],
        "bus_line": stop[1],
        "stop_name": stop[2],
        "lat": stop[3],
        "lon": stop[4],
        "start_time": datetime.strptime(start_time, "%H:%M:%S").time(),
        "end_time": datetime.strptime(end_time, "%H:%M:%S").time(),
    }
    print(f"[{datetime.now()}] Converted stop to dict: {stop_dict}")
    return stop_dict


# Evaluate travel time to multiple buses asynchronously
async def evaluate_travel_time(stop, buses, service):
    bus_stop_info = {
        "bus_stop": stop["stop_name"],
        "lat": stop["lat"],
        "lon": stop["lon"],
    }
    print(f"[{datetime.now()}] Evaluating travel time for stop: {stop['stop_name']} with buses: {buses}")

    # Run the synchronous get_travel_times in a separate thread
    updated_buses = await asyncio.to_thread(service.get_travel_times, bus_stop_info, buses)
    print(f"[{datetime.now()}] Updated buses with travel times: {updated_buses}")
    return updated_buses


# Collect and filter bus data based on travel times
async def collect_bus_data(stop, buses, service):
    print(f"[{datetime.now()}] Collecting bus data for stop: {stop['stop_name']}")
    bus_data = {}
    updated_buses = await evaluate_travel_time(stop, buses, service)
    for bus in updated_buses:
        distancia = bus.get("distancia")
        # Ensure 'id' exists; adjust if your identifier is different
        bus_id = bus.get("id") or bus.get("ordem")
        print(f"[{datetime.now()}] Processing bus ID: {bus_id}, Distance: {distancia}")
        if distancia != "Not found" and bus_id:
            if NEARBY_BUSES_MINUTES_MIN <= float(distancia) < NEARBY_BUSES_MINUTES_MAX:
                bus_data[bus_id] = distancia
                print(f"[{datetime.now()}] Bus ID {bus_id} is within range: {distancia} minutes")
            else:
                print(f"[{datetime.now()}] Bus ID {bus_id} is out of range: {distancia} minutes")
    print(f"[{datetime.now()}] Collected bus data: {bus_data}")
    return bus_data


# Process a single bus stop
async def process_stop(stop, service):
    print(f"[{datetime.now()}] Processing stop: {stop['stop_name']} for email: {stop['email']}")
    if check_time(stop["start_time"], stop["end_time"]):
        print(f"[{datetime.now()}] Current time is within the interval for stop: {stop['stop_name']}")
        buses = await get_filtered_bus_line(
            stop["bus_line"],
            stop["start_time"],
            stop["end_time"],
            stop["stop_name"],
        )
        print(f"[{datetime.now()}] Retrieved filtered buses: {buses}")
        if not buses:
            print(f"[{datetime.now()}] No buses found for stop: {stop['stop_name']}")
            return  # No buses to process

        bus_data = await collect_bus_data(stop, buses, service)
        if bus_data:
            print(f"[{datetime.now()}] Sending email to {stop['email']} with bus data: {bus_data}")
            await asyncio.to_thread(send_email, stop["email"], stop["bus_line"], stop["stop_name"], bus_data)
            print(f"[{datetime.now()}] Email sent to {stop['email']}")
        else:
            print(f"[{datetime.now()}] No relevant bus data to send for stop: {stop['stop_name']}")
    else:
        print(f"[{datetime.now()}] Current time is outside the interval for stop: {stop['stop_name']}")


# Fetch and process all bus stops
def process_all_bus_stops():
    print(f"[{datetime.now()}] Fetching all bus stops from the database")
    db = BusStopDatabase()
    raw_stops = db.get_all_bus_stops()
    if raw_stops:
        print(f"[{datetime.now()}] Retrieved {len(raw_stops)} bus stops")
        for raw_stop in raw_stops:
            stop = stop_to_dict(raw_stop)
            yield stop
    else:
        print(f"[{datetime.now()}] No bus stops found in the database")


# Main asynchronous loop
async def main():
    print(f"[{datetime.now()}] Starting main loop")
    service = TravelTimeService()
    while True:
        print(f"[{datetime.now()}] Beginning a new iteration of the main loop")
        tasks = []
        for stop in process_all_bus_stops():
            tasks.append(process_stop(stop, service))
        if tasks:
            print(f"[{datetime.now()}] Running {len(tasks)} tasks concurrently")
            # Run all tasks concurrently
            await asyncio.gather(*tasks)
            print(f"[{datetime.now()}] Completed all tasks in this iteration")
        else:
            print(f"[{datetime.now()}] No tasks to run in this iteration")
        print(f"[{datetime.now()}] Sleeping for 60 seconds before the next check")
        await asyncio.sleep(60)  # Wait for a minute before the next check


if __name__ == "__main__":
    print(" CHECK_DB STARTED ".center(20, '*'))
    print(f"[{datetime.now()}] Starting the bus monitoring application")
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"[{datetime.now()}] An error occurred: {e}")

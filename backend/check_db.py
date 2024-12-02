import asyncio
import time
import json  # Added import for JSON handling
from datetime import datetime

from dotenv import load_dotenv
import logging
import sys

from app import get_filtered_bus_line
from db.create_db import BusStopDatabase
from services.email_service import send_email
from services.travel_time_service import TravelTimeService

# Load environment variables from a .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,  # Set the logging level to INFO
    format="%(asctime)s - %(levelname)s - %(message)s",  # Define the log message format
    handlers=[logging.StreamHandler(sys.stdout)],  # Output logs to stdout
)

# Constants for bus time range
NEARBY_BUSES_MINUTES_MIN = 0
NEARBY_BUSES_MINUTES_MAX = 11.00


def check_time(start, end):
    current_time = datetime.now().time()
    logging.info(f"Checking time: {current_time} against start: {start} and end: {end}")

    # If end time is before start time, the interval crosses midnight
    if end < start:
        result = current_time >= start or current_time < end
    else:
        result = start <= current_time < end

    logging.info(f"Time check result: {result}")
    return result


def stop_to_dict(stop):
    stop_dict = stop
    start_time = str(stop.get("start_time"))
    end_time = str(stop.get("end_time"))
    stop_dict["start_time"] = datetime.strptime(start_time, "%H:%M:%S").time()
    stop_dict["end_time"] = datetime.strptime(end_time, "%H:%M:%S").time()
    return stop_dict


async def evaluate_travel_time(stop, buses, service):
    bus_stop_info = {
        "bus_stop": stop["stop_name"],
        "lat": stop["latitude"],
        "lon": stop["longitude"],
    }
    logging.info(
        f"Evaluating travel time for stop: {stop['stop_name']} with buses: {[bus['ordem'] for bus in buses]}"
    )  # Updated

    # Run the synchronous get_travel_times in a separate thread
    updated_buses = await asyncio.to_thread(
        service.get_travel_times, bus_stop_info, buses
    )
    logging.info(f"Updated buses with travel times: {[bus['distancia'] for bus in updated_buses]}")  # Updated
    return updated_buses


async def collect_bus_data(stop, buses, service):
    logging.info(f"Collecting bus data for stop: {stop['stop_name']}")
    bus_data = {}
    updated_buses = await evaluate_travel_time(stop, buses, service)
    for bus in updated_buses:
        distancia = bus.get("distancia")
        max_distance = stop.get("max_distance")
        # Ensure 'id' exists; adjust if your identifier is different
        bus_id = bus.get("id") or bus.get("ordem")
        logging.info(f"Processing bus ID: {bus_id}, Distance: {distancia}")
        if distancia != "Not found" and bus_id:
            if 0 <= float(distancia) < max_distance:
                bus_data[bus_id] = distancia
                logging.info(f"Bus ID {bus_id} is within range: {distancia} minutes")
            else:
                logging.info(f"Bus ID {bus_id} is out of range: {distancia} minutes")
    logging.info(f"Collected bus data! Bus data is {'ok' if bus_data else 'not ok'}")  # Updated
    return bus_data


async def process_stop(stop, service):
    logging.info(f"Processing stop: {stop['stop_name']} for email: {stop['email']}")
    if check_time(stop["start_time"], stop["end_time"]):
        logging.info(
            f"Current time is within the interval for stop: {stop['stop_name']}"
        )
        buses = await get_filtered_bus_line(
            stop["linha"],
            stop["start_time"],
            stop["end_time"],
            stop["stop_name"],
        )
        logging.info(f"Retrieved filtered buses: DATA is {'ok' if buses else 'not ok'}")  # Updated
        if not buses:
            logging.info(f"No buses found for stop: {stop['stop_name']}")
            return  # No buses to process

        bus_data = await collect_bus_data(stop, buses, service)
        if bus_data:
            logging.info(f"Sending email to {stop['email']} with bus data!")  # Updated
            await asyncio.to_thread(
                send_email, stop["email"], stop["linha"], stop["stop_name"], bus_data
            )
            logging.info(f"Email sent to {stop['email']}")
        else:
            logging.info(f"No relevant bus data to send for stop: {stop['stop_name']}")
    else:
        logging.info(
            f"Current time is outside the interval for stop: {stop['stop_name']}"
        )


def process_all_bus_stops():
    logging.info("Fetching all bus stops from the database")
    db = BusStopDatabase()
    raw_stops = db.get_all_bus_stops()
    if raw_stops:
        logging.info(f"Retrieved {len(raw_stops)} bus stops")
        for raw_stop in raw_stops:
            stop = stop_to_dict(raw_stop)
            yield stop
    else:
        logging.info("No bus stops found in the database")


async def main():
    logging.info("Starting main loop")
    service = TravelTimeService()
    while True:
        logging.info("Beginning a new iteration of the main loop")
        tasks = []
        for stop in process_all_bus_stops():
            tasks.append(process_stop(stop, service))
        if tasks:
            logging.info(f"Running {len(tasks)} tasks concurrently")
            # Run all tasks concurrently
            await asyncio.gather(*tasks)
            logging.info("Completed all tasks in this iteration")
        else:
            logging.info("No tasks to run in this iteration")
        logging.info("Sleeping for 60 seconds before the next check")
        await asyncio.sleep(60)  # Wait for a minute before the next check


if __name__ == "__main__":
    logging.info(" CHECK_DB STARTED ".center(50, "*"))
    logging.info("Starting the bus monitoring application")
    try:
        asyncio.run(main())
    except Exception as e:
        logging.exception(f"An error occurred: {e}")

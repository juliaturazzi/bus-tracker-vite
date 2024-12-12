import os
from dotenv import load_dotenv
import openrouteservice
from typing import List, Dict, Any

# Ensure you have these imports
import asyncio

class TravelTimeService:
    def __init__(self):
        # Load API key from environment variable
        load_dotenv()
        self.api_key = os.getenv("OPENROUTE_KEY")
        if not self.api_key:
            raise ValueError("OPENROUTE_KEY not found in environment variables.")
        self.client = openrouteservice.Client(key=self.api_key)

    def get_travel_times(self, bus_stop_coords: Dict[str, float], buses_info: List[Dict[str, Any]]) -> List[Any]:
        """
        Calculate travel times between the bus stop and multiple bus locations using the OpenRouteService Matrix API.
        """
        try:
            # Prepare locations: first is origin, followed by destinations
            locations = [
                [bus_stop_coords["lon"], bus_stop_coords["lat"]]  # Origin
            ] + [
                [bus["longitude"], bus["latitude"]] for bus in buses_info  # Destinations
            ]

            # Define sources and destinations indices
            sources = [0]  # Only the first location is the source
            destinations = list(range(1, len(locations)))  # The rest are destinations

            # Request durations using the ORS matrix service
            result = self.client.distance_matrix(
                locations=locations,
                sources=sources,
                destinations=destinations,
                metrics=["duration"],  # Request travel duration
                units="m", # Result in metric units
                profile="driving-car"
            )

            # Parse the durations
            durations = self.parse_travel_times(result)

            # Assign durations to each bus_info
            for bus, duration in zip(buses_info, durations):
                bus["distancia"] = duration

            return buses_info

        except openrouteservice.exceptions.ApiError as e:
            print(f"API Error: {e}")
        except Exception as e:
            print(f"Error of type: {type(e).__name__} has occurred!")
        # Assign "Not found" if there's an error
        for bus in buses_info:
            bus["distancia"] = "Not found"
        return buses_info

    @staticmethod
    def parse_travel_times(result: Dict[str, Any]) -> List[Any]:
        """
        Extract and return travel times in minutes from the API response.
        """
        try:
            durations_matrix = result.get("durations", [])
            if not durations_matrix:
                return ["Not found"] * (len(result.get("destinations", [])))

            # Since we have only one source, durations_matrix has one list
            durations = durations_matrix[0]  # List of durations to each destination

            # Convert durations from seconds to minutes
            durations_in_minutes = [
                round(duration / 60, 2) if duration is not None else "Not found"
                for duration in durations
            ]
            return durations_in_minutes
        except Exception as e:
            print(f"Error parsing result: {e}")
            return ["Not found"] * (len(result.get("destinations", [])))

def main():
    # Define a sample bus stop coordinates (e.g., Central Park, New York)
    bus_stop_coords = {
        "lat": 40.785091,   # Latitude for Central Park
        "lon": -73.968285    # Longitude for Central Park
    }

    # Define a list of buses with their coordinates
    buses_info = [
        {"id": "Bus1", "latitude": 40.748817, "longitude": -73.985428},  # Empire State Building
        {"id": "Bus2", "latitude": 40.730610, "longitude": -73.935242},  # East Village
        {"id": "Bus3", "latitude": 40.706192, "longitude": -74.009160},  # Wall Street
    ]

    # Create an instance of TravelTimeService
    try:
        service = TravelTimeService()
    except ValueError as ve:
        print(ve)
        return

    # Get travel times
    updated_buses_info = service.get_travel_times(bus_stop_coords, buses_info)

    # Print the results
    print("Travel Times from Bus Stop to Each Bus:")
    for bus in updated_buses_info:
        distancia = bus.get("distancia", "Not found")
        print(f"  - {bus['id']} is {distancia} minutes away.")

if __name__ == "__main__":
    main()

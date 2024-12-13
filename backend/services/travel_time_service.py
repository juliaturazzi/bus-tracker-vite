import os
from dotenv import load_dotenv
import openrouteservice
from typing import List, Dict, Any

class TravelTimeService:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("OPENROUTE_KEY")
        if not self.api_key:
            raise ValueError("OPENROUTE_KEY not found in environment variables.")
        self.client = openrouteservice.Client(key=self.api_key)

    def get_travel_times(self, bus_stop_coords: Dict[str, float], buses_info: List[Dict[str, Any]]) -> List[Any]:
        try:
            locations = [
                [bus_stop_coords["lon"], bus_stop_coords["lat"]] 
            ] + [
                [bus["longitude"], bus["latitude"]] for bus in buses_info 
            ]

            sources = [0] 
            destinations = list(range(1, len(locations)))  

            result = self.client.distance_matrix(
                locations=locations,
                sources=sources,
                destinations=destinations,
                metrics=["duration"],  
                units="m", 
                profile="driving-car"
            )

            durations = self.parse_travel_times(result)

            for bus, duration in zip(buses_info, durations):
                bus["distancia"] = duration

            return buses_info

        except openrouteservice.exceptions.ApiError as e:
            print(f"API Error: {e}")
        except Exception as e:
            print(f"Error of type: {type(e).__name__} has occurred!")
        for bus in buses_info:
            bus["distancia"] = "Not found"
        return buses_info

    @staticmethod
    def parse_travel_times(result: Dict[str, Any]) -> List[Any]:
        try:
            durations_matrix = result.get("durations", [])
            if not durations_matrix:
                return ["Not found"] * (len(result.get("destinations", [])))

            durations = durations_matrix[0]  

            durations_in_minutes = [
                round(duration / 60, 2) if duration is not None else "Not found"
                for duration in durations
            ]
            return durations_in_minutes
        except Exception as e:
            print(f"Error parsing result: {e}")
            return ["Not found"] * (len(result.get("destinations", [])))

def main():
    bus_stop_coords = {
        "lat": 40.785091,   
        "lon": -73.968285   
    }

    buses_info = [
        {"id": "Bus1", "latitude": 40.748817, "longitude": -73.985428},  
        {"id": "Bus2", "latitude": 40.730610, "longitude": -73.935242},  
        {"id": "Bus3", "latitude": 40.706192, "longitude": -74.009160},  
    ]

    try:
        service = TravelTimeService()
    except ValueError as ve:
        print(ve)
        return

    updated_buses_info = service.get_travel_times(bus_stop_coords, buses_info)

    print("Travel Times from Bus Stop to Each Bus:")
    for bus in updated_buses_info:
        distancia = bus.get("distancia", "Not found")
        print(f"  - {bus['id']} is {distancia} minutes away.")

if __name__ == "__main__":
    main()

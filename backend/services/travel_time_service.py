import os
from dotenv import load_dotenv
import openrouteservice


class TravelTimeService:
    def __init__(self):
        # Load API key from environment variable
        load_dotenv()
        self.api_key = os.getenv("OPENROUTE_KEY")
        self.client = openrouteservice.Client(key=self.api_key)

    def get_travel_time(self, bus_stop_coords, bus_info):
        """
        Calculate travel time between the bus stop and the bus location using the OpenRouteService API.
        """
        try:
            # Define coordinates in the format [longitude, latitude]
            locations = [
                [bus_stop_coords["lon"], bus_stop_coords["lat"]],
                [bus_info["longitude"], bus_info["latitude"]],
            ]

            # Request duration using the ORS matrix service
            result = self.client.distance_matrix(
                locations=locations,
                metrics=["duration"],  # Request travel duration
                units="m"  # Result in metric units
            )

            return self.parse_travel_time(result)
        except openrouteservice.exceptions.ApiError as e:
            print(f"API Error: {e}")
        except Exception as e:
            print(f"Unexpected Error: {e}")
        return "Not found"

    @staticmethod
    def parse_travel_time(result):
        """
        Extract and return travel time in minutes from the API response.
        """
        try:
            durations = result.get("durations", [])
            if durations and len(durations) > 0 and len(durations[0]) > 1:
                travel_time_seconds = durations[0][1]
                return round(travel_time_seconds / 60, 2)  # Convert to minutes
        except Exception as e:
            print(f"Error parsing result: {e}")
        return "Not found"


if __name__ == "__main__":
    # Sample data
    bus_stop_coords = {"bus_stop": "123", "lat": 40.7128, "lon": -74.0060}  # Example: New York City
    bus_info = {"ordem": "456", "latitude": 40.73061, "longitude": -73.935242}  # Example: Somewhere in NYC

    # Initialize the TravelTimeService class
    service = TravelTimeService()

    # Calculate travel time
    travel_time = service.get_travel_time(bus_stop_coords, bus_info)

    # Print the result
    print(f"Travel time: {travel_time} minutes")

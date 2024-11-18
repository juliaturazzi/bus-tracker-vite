import os
from datetime import datetime

from celery.utils.functional import first
from dotenv import load_dotenv
from traveltimepy import Location, Coordinates, TravelTimeSdk, PublicTransport


class TravelTimeService:
    def __init__(self):
        load_dotenv()
        self.api_id = os.getenv("TRAVEL_TIME_API_ID")
        self.api_key = os.getenv("TRAVEL_TIME_API_KEY")
        self.sdk = TravelTimeSdk(self.api_id, self.api_key)

    async def get_travel_time(self, bus_stop_coords, bus_info):
        bus_stop_location = Location(
            id=bus_stop_coords["bus_stop"],
            coords=Coordinates(lat=bus_stop_coords["lat"], lng=bus_stop_coords["lon"]),
        )

        bus_location = Location(
            id=bus_info["ordem"],
            coords=Coordinates(lat=bus_info["latitude"], lng=bus_info["longitude"]),
        )

        result = await self.sdk.time_filter_async(
            locations=[bus_stop_location, bus_location],
            search_ids={bus_stop_location.id: [bus_location.id]},
            transportation=PublicTransport(type="bus"),
            travel_time=3600,  # max travel time
            departure_time=datetime.now(),
        )

        return self.parse_travel_time(result)

    @staticmethod
    def parse_travel_time(result):
        locations = TravelTimeService.get_locations(result)
        if not locations:
            return "Not found"

        properties = TravelTimeService.get_properties(locations)
        if not properties:
            return "Not found"

        travel_time = TravelTimeService.get_travel_time(properties)
        if not travel_time:
            return "Not found"

        return round(travel_time / 60, 2)  # Convert travel time to minutes

    @staticmethod
    def get_locations(result):
        # Check if result and locations are available
        if result and len(result) > 0:
            first_result = result[0]
            if first_result.get("locations", None) is not None:
                locations = first_result.get("locations", None)
                return locations
        return None

    @staticmethod
    def get_properties(locations):
        # Check if locations and properties are available
        if locations and len(locations) > 0:
            if locations[0].get("properties", None) is not None:
                properties = locations[0].get("properties", None)
                return properties
        return None


    @staticmethod
    def get_travel_time(properties):
        # Check if properties and travel_time are available
        if properties and len(properties) > 0:
            if properties[0].get("travel_time", None) is not None:
                travel_time = properties[0].get("travel_time", None)
                return travel_time
        return None

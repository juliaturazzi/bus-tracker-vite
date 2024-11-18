import sys
import os
import unittest
from unittest.mock import patch
import pytest

# Add the parent directory to the system path to allow imports from utils
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

# Import the target class
from services.travel_time_service import TravelTimeService

class TestTravelTimeService(unittest.TestCase):
    @pytest.mark.asyncio
    @patch("utils.travel_time_service.TravelTimeService.parse_travel_time")
    @patch("utils.travel_time_service.TravelTimeSdk.time_filter_async")
    async def test_get_travel_time(self, mock_time_filter_async, mock_parse_travel_time):
        # Set up mock return values
        mock_time_filter_async.return_value = "mock_result"
        mock_parse_travel_time.return_value = 20.5

        # Mock input data
        bus_stop_coords = {"bus_stop": "stop1", "lat": 52.52, "lon": 13.405}
        bus_info = {"ordem": "bus1", "latitude": 52.519, "longitude": 13.406}

        # Instantiate the service
        service = TravelTimeService()

        # Call the async method
        travel_time = await service.get_travel_time(bus_stop_coords, bus_info)

        self.assertEqual(travel_time, 20.5)


    def test_parse_travel_time(self):
        # Mock a result structure with travel_time
        result = [{
            "locations": [{
                "properties": [{"travel_time": 1234}]
            }]
        }]

        # Directly test the parse_travel_time method
        parsed_time = TravelTimeService.parse_travel_time(result)

        self.assertEqual(parsed_time, 20.57)
        self.assertEqual(TravelTimeService.parse_travel_time(None), "Not found")
        self.assertEqual(TravelTimeService.parse_travel_time([]), "Not found")

if __name__ == "__main__":
    unittest.main()

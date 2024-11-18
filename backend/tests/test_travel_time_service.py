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
    def setUp(self):
        """Set up the service instance for testing."""
        self.service = TravelTimeService()
        self.bus_stop_coords = {"bus_stop": "123", "lat": 40.7128, "lon": -74.0060}
        self.bus_info = {"ordem": "456", "latitude": 40.73061, "longitude": -73.935242}

    @patch("services.travel_time_service.openrouteservice.Client.distance_matrix")
    def test_get_travel_time_success(self, mock_distance_matrix):
        """Test get_travel_time with a successful API response."""
        # Mock response
        mock_response = {
            "durations": [[0, 600]]  # 600 seconds = 10 minutes
        }
        mock_distance_matrix.return_value = mock_response

        # Call the method
        travel_time = self.service.get_travel_time(self.bus_stop_coords, self.bus_info)

        # Assertions
        self.assertEqual(travel_time, 10.0)  # Expect 10 minutes
        mock_distance_matrix.assert_called_once()

    @patch("services.travel_time_service.openrouteservice.Client.distance_matrix")
    def test_get_travel_time_no_durations(self, mock_distance_matrix):
        """Test get_travel_time when the API response contains no durations."""
        # Mock response with missing durations
        mock_response = {"durations": []}
        mock_distance_matrix.return_value = mock_response

        # Call the method
        travel_time = self.service.get_travel_time(self.bus_stop_coords, self.bus_info)

        # Assertions
        self.assertEqual(travel_time, "Not found")

    @patch("services.travel_time_service.openrouteservice.Client.distance_matrix")
    def test_get_travel_time_api_error(self, mock_distance_matrix):
        """Test get_travel_time when an API error occurs."""
        # Simulate API error
        mock_distance_matrix.side_effect = Exception("API Error")

        # Call the method
        travel_time = self.service.get_travel_time(self.bus_stop_coords, self.bus_info)

        # Assertions
        self.assertEqual(travel_time, "Not found")

    def test_parse_travel_time_invalid_response(self):
        """Test parse_travel_time with an invalid response."""
        invalid_response = {}
        travel_time = self.service.parse_travel_time(invalid_response)
        self.assertEqual(travel_time, "Not found")


if __name__ == "__main__":
    unittest.main()


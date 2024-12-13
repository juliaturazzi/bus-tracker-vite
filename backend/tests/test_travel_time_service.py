import unittest
from unittest.mock import patch, MagicMock
import os
import sys

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

from services.travel_time_service import TravelTimeService

class TestTravelTimeService(unittest.TestCase):
    def setUp(self):
        self.bus_stop_coords = {"lat": 40.7128, "lon": -74.0060}  

        self.buses_info = [
            {"id": "456", "latitude": 40.73061, "longitude": -73.935242}
        ]

        patcher = patch('services.travel_time_service.os.getenv', return_value='fake_api_key')
        self.addCleanup(patcher.stop)
        self.mock_getenv = patcher.start()

        self.service = TravelTimeService()

    @patch("services.travel_time_service.openrouteservice.Client.distance_matrix")
    def test_get_travel_time_success(self, mock_distance_matrix):
        mock_distance_matrix.return_value = {
            "durations": [[600]]  
        }

        updated_buses = self.service.get_travel_times(self.bus_stop_coords, self.buses_info)

        expected_buses = [
            {"id": "456", "latitude": 40.73061, "longitude": -73.935242, "distancia": 10.0}
        ]
        self.assertEqual(updated_buses, expected_buses)

        mock_distance_matrix.assert_called_once_with(
            locations=[
                [self.bus_stop_coords["lon"], self.bus_stop_coords["lat"]],
                [self.buses_info[0]["longitude"], self.buses_info[0]["latitude"]]
            ],
            sources=[0],
            destinations=[1],
            metrics=["duration"],
            units="m",
            profile="driving-car"
        )

    @patch("services.travel_time_service.openrouteservice.Client.distance_matrix")
    def test_get_travel_time_api_error(self, mock_distance_matrix):
        mock_distance_matrix.side_effect = Exception("API Error")

        updated_buses = self.service.get_travel_times(self.bus_stop_coords, self.buses_info)

        expected_buses = [
            {"id": "456", "latitude": 40.73061, "longitude": -73.935242, "distancia": "Not found"}
        ]
        self.assertEqual(updated_buses, expected_buses)

        mock_distance_matrix.assert_called_once()

    @patch("services.travel_time_service.openrouteservice.Client.distance_matrix")
    def test_get_travel_time_partial_none_durations(self, mock_distance_matrix):
        mock_distance_matrix.return_value = {
            "durations": [[None]]
        }

        updated_buses = self.service.get_travel_times(self.bus_stop_coords, self.buses_info)

        expected_buses = [
            {"id": "456", "latitude": 40.73061, "longitude": -73.935242, "distancia": "Not found"}
        ]
        self.assertEqual(updated_buses, expected_buses)

        mock_distance_matrix.assert_called_once()

    @patch("services.travel_time_service.openrouteservice.Client.distance_matrix")
    def test_get_travel_time_multiple_buses(self, mock_distance_matrix):
        multiple_buses = [
            {"id": "Bus1", "latitude": 40.748817, "longitude": -73.985428},
            {"id": "Bus2", "latitude": 40.730610, "longitude": -73.935242},
            {"id": "Bus3", "latitude": 40.706192, "longitude": -74.009160},
        ]

        mock_distance_matrix.return_value = {
            "durations": [
                [600, 945, 738]  # [Bus1, Bus2, Bus3]
            ]
        }

        updated_buses = self.service.get_travel_times(self.bus_stop_coords, multiple_buses)

        expected_buses = [
            {"id": "Bus1", "latitude": 40.748817, "longitude": -73.985428, "distancia": 10.0},
            {"id": "Bus2", "latitude": 40.730610, "longitude": -73.935242, "distancia": 15.75},
            {"id": "Bus3", "latitude": 40.706192, "longitude": -74.009160, "distancia": 12.3},
        ]
        self.assertEqual(updated_buses, expected_buses)

        mock_distance_matrix.assert_called_once_with(
            locations=[
                [self.bus_stop_coords["lon"], self.bus_stop_coords["lat"]],
                [multiple_buses[0]["longitude"], multiple_buses[0]["latitude"]],
                [multiple_buses[1]["longitude"], multiple_buses[1]["latitude"]],
                [multiple_buses[2]["longitude"], multiple_buses[2]["latitude"]],
            ],
            sources=[0],
            destinations=[1, 2, 3],
            metrics=["duration"],
            units="m",
            profile="driving-car"
        )

    def test_parse_travel_times_invalid_response(self):
        invalid_response = {}
        durations = self.service.parse_travel_times(invalid_response)
        self.assertEqual(durations, [])

    @patch("services.travel_time_service.openrouteservice.Client.distance_matrix")
    def test_get_travel_time_extra_buses(self, mock_distance_matrix):
        extended_buses_info = [
            {"id": f"Bus{i}", "latitude": 40.700000 + i*0.01, "longitude": -74.000000 - i*0.01}
            for i in range(10)
        ]

        mock_distance_matrix.return_value = {
            "durations": [
                [600 + i*120 for i in range(10)]  
            ]
        }

        updated_buses = self.service.get_travel_times(self.bus_stop_coords, extended_buses_info)

        expected_buses = [
            {"id": f"Bus{i}", "latitude": 40.700000 + i*0.01, "longitude": -74.000000 - i*0.01, "distancia": round((600 + i*120)/60, 2)}
            for i in range(10)
        ]
        self.assertEqual(updated_buses, expected_buses)

        expected_locations = [
            [self.bus_stop_coords["lon"], self.bus_stop_coords["lat"]],
        ] + [
            [bus["longitude"], bus["latitude"]] for bus in extended_buses_info
        ]
        mock_distance_matrix.assert_called_once_with(
            locations=expected_locations,
            sources=[0],
            destinations=list(range(1, 11)),
            metrics=["duration"],
            units="m",
            profile="driving-car"
        )

if __name__ == "__main__":
    unittest.main()

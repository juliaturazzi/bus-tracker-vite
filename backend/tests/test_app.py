import os
import sys
import unittest
from unittest.mock import patch

import pandas as pd
from fastapi import HTTPException
from fastapi.testclient import TestClient

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

from app import app, get_stop_coords, parse_coords

class TestApp(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    @patch("app.load_stops")
    def test_get_stop_coords_valid(self, mock_load_stops):
        mock_load_stops.return_value = pd.DataFrame({
            "stop_name": ["Stop A"],
            "stop_lat": [12.34],
            "stop_lon": [56.78]
        })

        result = get_stop_coords("Stop A")
        self.assertEqual(result["bus_stop"], "Stop A")
        self.assertEqual(result["lat"], 12.34)
        self.assertEqual(result["lon"], 56.78)

    @patch("app.load_stops")
    def test_get_stop_coords_invalid(self, mock_load_stops):
        mock_load_stops.return_value = pd.DataFrame({
            "stop_name": ["Stop A"],
            "stop_lat": [12.34],
            "stop_lon": [56.78]
        })

        with self.assertRaises(HTTPException) as context:
            get_stop_coords("Stop B")
        self.assertEqual(context.exception.status_code, 404)
        self.assertEqual(context.exception.detail, "Bus stop not found")

    def test_parse_coords_valid(self):
        self.assertEqual(parse_coords("12,34"), 12.34)

    def test_parse_coords_invalid(self):
        with self.assertRaises(ValueError):
            parse_coords("invalid")

    @patch("app.load_stops")
    def test_read_stops(self, mock_load_stops):
        mock_load_stops.return_value = pd.DataFrame({
            "stop_name": ["Stop A", "Stop B"],
            "stop_lat": [12.34, 23.45],
            "stop_lon": [56.78, 67.89]
        })

        response = self.client.get("/stops/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]["stop_name"], "Stop A")

    @patch("app.get_filtered_bus_line")
    async def test_read_info(self, mock_get_filtered_bus_line):
        mock_get_filtered_bus_line.return_value = [{"linha": "123", "ordem": "1"}]

        response = self.client.get(
            "/infos/",
            params={
                "bus_line": "123",
                "start_time": "08:00",
                "end_time": "10:00",
                "bus_stop": "Stop A"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [{"linha": "123", "ordem": "1"}])

    @patch("app.load_stops")
    @patch("app.BusStopDatabase")
    def test_register_endpoint(self, mock_db, mock_load_stops):
        mock_load_stops.return_value = pd.DataFrame({
            "stop_name": ["Stop A"],
            "stop_lat": [12.34],
            "stop_lon": [56.78]
        })

        mock_db_instance = mock_db.return_value
        mock_db_instance.insert_bus_stop.return_value = None

        response = self.client.post(
            "/register/",
            json={
                "email": "test@example.com",
                "bus_line": "123",
                "bus_stop": "Stop A",
                "start_time": "08:00",
                "end_time": "10:00"
            }
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "success", "message": "Email sent successfully"})

        mock_db_instance.insert_bus_stop.assert_called_once_with(
            "test@example.com", "123", "Stop A", 12.34, 56.78, "08:00", "10:00"
        )


if __name__ == "__main__":
    unittest.main()

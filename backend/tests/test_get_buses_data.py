import unittest
from unittest.mock import patch, MagicMock
import os
import sys
import requests  

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

from services.bus_data_fetcher import BusDataFetcher


class TestBusDataFetcher(unittest.TestCase):
   

    def setUp(self):
        self.fetcher = BusDataFetcher()

    def test_get_buses_data_success(self):
        with patch("services.bus_data_fetcher.requests.get") as mock_get:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = [{
                "latitude": 40.7128,
                "longitude": -74.0060,
                "ordem": "A123",
                "velocidade": 50,
                "linha": "Route 66"
            }]
            mock_get.return_value = mock_response

            data = self.fetcher.get_buses_data("10:00:00", "11:00:00")[0]

            for field in ["latitude", "longitude", "ordem", "velocidade", "linha"]:
                self.assertIsNotNone(data.get(field))

    @patch("services.bus_data_fetcher.requests.get")
    def test_get_buses_data_failure(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = requests.RequestException("Server error")
        mock_get.return_value = mock_response

        data = self.fetcher.get_buses_data("10:00:00", "11:00:00")

        mock_get.assert_called_once()
        self.assertEqual(data, {})  


if __name__ == "__main__":
    unittest.main()

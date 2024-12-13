import unittest
from unittest.mock import patch, MagicMock
import sys
import os

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

from db.create_db import BusStopDatabase

class TestBusStopDatabase(unittest.TestCase):
    @patch('mysql.connector.connect')
    def setUp(self, mock_connect):
        self.mock_conn = MagicMock()
        mock_connect.return_value = self.mock_conn
        self.mock_cursor = MagicMock()
        self.mock_conn.cursor.return_value = self.mock_cursor

        with patch.object(BusStopDatabase, '_create_database'), patch.object(BusStopDatabase, '_create_table'):
            self.db = BusStopDatabase()

    @patch('mysql.connector.connect')
    def test_create_database(self, mock_connect):
        mock_connect.return_value = self.mock_conn

        self.db._create_database()

        self.mock_cursor.execute.assert_called_once_with(f"CREATE DATABASE IF NOT EXISTS {self.db.database}")
        self.mock_conn.commit.assert_called_once()

    @patch('mysql.connector.connect')
    def test_create_table(self, mock_connect):
        mock_connect.return_value = self.mock_conn

        self.db._create_table()

        self.mock_cursor.execute.assert_called_once()
        self.assertIn("CREATE TABLE IF NOT EXISTS", self.mock_cursor.execute.call_args[0][0])
        self.mock_conn.commit.assert_called_once()

    @patch('mysql.connector.connect')
    def test_insert_bus_stop(self, mock_connect):
        mock_connect.return_value = self.mock_conn

        email = "test@example.com"
        linha = "Line 1"
        stop_name = "Stop A"
        latitude = 12.345678
        longitude = -98.765432
        start_time = "08:00:00"
        end_time = "18:00:00"

        self.db.insert_bus_stop(email, linha, stop_name, latitude, longitude, start_time, end_time)

        self.mock_cursor.execute.assert_called_once()
        query = self.mock_cursor.execute.call_args[0][0]
        values = self.mock_cursor.execute.call_args[0][1]
        self.assertIn("INSERT INTO", query)
        self.assertEqual(values, (email, linha, stop_name, latitude, longitude, start_time, end_time))
        self.mock_conn.commit.assert_called_once()

    @patch('mysql.connector.connect')
    def test_get_all_bus_stops(self, mock_connect):
        mock_connect.return_value = self.mock_conn

        expected_results = [
            ("test@example.com", "Line 1", "Stop A", 12.345678, -98.765432, "08:00:00", "18:00:00")
        ]
        self.mock_cursor.fetchall.return_value = expected_results

        results = self.db.get_all_bus_stops()

        self.mock_cursor.execute.assert_called_once_with(f"SELECT * FROM {self.db.database}.stops")
        self.mock_cursor.fetchall.assert_called_once()
        self.assertEqual(results, expected_results)

    @patch('mysql.connector.connect')
    def tearDown(self, mock_connect):
        self.mock_conn.close.assert_called_once()


if __name__ == '__main__':
    unittest.main()

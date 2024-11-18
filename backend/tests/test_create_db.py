import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to the system path to allow imports from utils
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

# Import the target class
from db.create_db import BusStopDatabase

class TestBusStopDatabase(unittest.TestCase):
    @patch('mysql.connector.connect')
    def setUp(self, mock_connect):
        # Mock the database connection
        self.mock_conn = MagicMock()
        mock_connect.return_value = self.mock_conn
        self.mock_cursor = MagicMock()
        self.mock_conn.cursor.return_value = self.mock_cursor

        # Initialize the database object without triggering database/table creation
        with patch.object(BusStopDatabase, '_create_database'), patch.object(BusStopDatabase, '_create_table'):
            self.db = BusStopDatabase()

    @patch('mysql.connector.connect')
    def test_create_database(self, mock_connect):
        mock_connect.return_value = self.mock_conn

        # Explicitly call the _create_database method
        self.db._create_database()

        # Verify SQL execution for creating the database
        self.mock_cursor.execute.assert_called_once_with(f"CREATE DATABASE IF NOT EXISTS {self.db.database}")
        self.mock_conn.commit.assert_called_once()

    @patch('mysql.connector.connect')
    def test_create_table(self, mock_connect):
        mock_connect.return_value = self.mock_conn

        # Explicitly call the _create_table method
        self.db._create_table()

        # Verify SQL execution for creating the table
        self.mock_cursor.execute.assert_called_once()
        self.assertIn("CREATE TABLE IF NOT EXISTS", self.mock_cursor.execute.call_args[0][0])
        self.mock_conn.commit.assert_called_once()

    @patch('mysql.connector.connect')
    def test_insert_bus_stop(self, mock_connect):
        mock_connect.return_value = self.mock_conn

        # Test data
        email = "test@example.com"
        linha = "Line 1"
        stop_name = "Stop A"
        latitude = 12.345678
        longitude = -98.765432
        start_time = "08:00:00"
        end_time = "18:00:00"

        # Call the insert_bus_stop method
        self.db.insert_bus_stop(email, linha, stop_name, latitude, longitude, start_time, end_time)

        # Verify the SQL execution for insertion
        self.mock_cursor.execute.assert_called_once()
        query = self.mock_cursor.execute.call_args[0][0]
        values = self.mock_cursor.execute.call_args[0][1]
        self.assertIn("INSERT INTO", query)
        self.assertEqual(values, (email, linha, stop_name, latitude, longitude, start_time, end_time))
        self.mock_conn.commit.assert_called_once()

    @patch('mysql.connector.connect')
    def test_get_all_bus_stops(self, mock_connect):
        mock_connect.return_value = self.mock_conn

        # Mock the fetchall return value
        expected_results = [
            ("test@example.com", "Line 1", "Stop A", 12.345678, -98.765432, "08:00:00", "18:00:00")
        ]
        self.mock_cursor.fetchall.return_value = expected_results

        # Call the get_all_bus_stops method
        results = self.db.get_all_bus_stops()

        # Verify the SQL execution and fetched results
        self.mock_cursor.execute.assert_called_once_with(f"SELECT * FROM {self.db.database}.stops")
        self.mock_cursor.fetchall.assert_called_once()
        self.assertEqual(results, expected_results)

    @patch('mysql.connector.connect')
    def tearDown(self, mock_connect):
        # Ensure database connections are closed properly
        self.mock_conn.close.assert_called_once()


if __name__ == '__main__':
    unittest.main()

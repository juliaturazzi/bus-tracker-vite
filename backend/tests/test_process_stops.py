import os
import csv
import json
import unittest
import sys
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

from utils.process_stops_script import process_stops

INPUT_FILE = "../data/test_stops.csv"
OUTPUT_FILE = "../data/test_stops_updated.jsx"


class TestProcessStops(unittest.TestCase):

    def setUp(self):
        self.input_file = INPUT_FILE
        self.output_file = OUTPUT_FILE

    def tearDown(self):
        if os.path.exists(self.input_file):
            os.remove(self.input_file)
        if os.path.exists(self.output_file):
            os.remove(self.output_file)

    def setup_csv(self, stops_data, header=["stop_name", "stop_lat", "stop_lon", "extra_column"]):
        with open(self.input_file, mode="w", newline="", encoding="utf-8") as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(header)
            writer.writerows(stops_data)

    def read_jsx(self, file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()
            json_data = content.split("const stopsData = ", 1)[1].rsplit(";\n\nexport default stopsData;\n", 1)[0]
            return json.loads(json_data)

    def test_basic_functionality(self):
        stops_data = [
            ["Main St", "40.7128", "-74.0060", "Extra 1"],
            ["Main St", "40.7138", "-74.0070", "Extra 2"],
            ["Main St", "40.7148", "-74.0080", "Extra 3"],
            ["Second St", "40.7158", "-74.0090", "Extra 4"],
        ]
        self.setup_csv(stops_data)
        process_stops(self.input_file, self.output_file)

        stops_dict = self.read_jsx(self.output_file)

        self.assertEqual(stops_dict[0]["stop_name"], "Main St")
        self.assertEqual(stops_dict[1]["stop_name"], "Main St 2")
        self.assertEqual(stops_dict[2]["stop_name"], "Main St 3")
        self.assertEqual(stops_dict[3]["stop_name"], "Second St")
        self.assertEqual(stops_dict[0]["stop_lat"], "40.7128")
        self.assertEqual(stops_dict[0]["stop_lon"], "-74.0060")
        self.assertNotIn("extra_column", stops_dict[0])

    def test_no_duplicates(self):
        stops_data = [
            ["First St", "40.7128", "-74.0060", "Extra 1"],
            ["Second St", "40.7138", "-74.0070", "Extra 2"],
        ]
        self.setup_csv(stops_data)
        process_stops(self.input_file, self.output_file)

        stops_dict = self.read_jsx(self.output_file)

        self.assertEqual(stops_dict[0]["stop_name"], "First St")
        self.assertEqual(stops_dict[1]["stop_name"], "Second St")
        self.assertEqual(stops_dict[0]["stop_lat"], "40.7128")
        self.assertEqual(stops_dict[1]["stop_lon"], "-74.0070")

    def test_duplicates_with_numbers(self):
        stops_data = [
            ["Main St", "40.7128", "-74.0060", "Extra 1"],
            ["Main St 2", "40.7138", "-74.0070", "Extra 2"],
            ["Main St", "40.7148", "-74.0080", "Extra 3"],
        ]
        self.setup_csv(stops_data)
        process_stops(self.input_file, self.output_file)

        stops_dict = self.read_jsx(self.output_file)

        self.assertEqual(stops_dict[0]["stop_name"], "Main St")
        self.assertEqual(stops_dict[1]["stop_name"], "Main St 2")
        self.assertEqual(stops_dict[2]["stop_name"], "Main St 3")

    def test_only_relevant_columns(self):
        stops_data = [
            ["Main St", "40.7128", "-74.0060", "Extra Data"],
            ["Second St", "40.7138", "-74.0070", "Extra Data"],
        ]
        self.setup_csv(stops_data)
        process_stops(self.input_file, self.output_file)

        stops_dict = self.read_jsx(self.output_file)

        for stop in stops_dict:
            self.assertNotIn("extra_column", stop)
            self.assertIn("stop_name", stop)
            self.assertIn("stop_lat", stop)
            self.assertIn("stop_lon", stop)


if __name__ == "__main__":
    unittest.main()

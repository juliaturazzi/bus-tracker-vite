# script to process CSV file with duplicate bus stop names, remove columns not needed, and write to JSX file

import re
import csv
import json


# process CSV file with duplicate bus stops names
def process_stops(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as infile:
        reader = csv.reader(infile)
        header = next(reader)
        stops = list(reader)

    # keep only the columns stop_name, stop_lat, stop_lon
    stop_name_index = header.index("stop_name")
    stop_lat_index = header.index("stop_lat")
    stop_lon_index = header.index("stop_lon")
    header = ["stop_name", "stop_lat", "stop_lon"]
    stops = [[stop[stop_name_index], stop[stop_lat_index], stop[stop_lon_index]] for stop in stops]

    stop_name_counts = {}
    for stop in stops:
        stop_name = stop[0]
        base_name = re.sub(r" \d+$", "", stop_name)

        # append numeric suffix if duplicated
        if base_name in stop_name_counts:
            stop_name_counts[base_name] += 1
        else:
            stop_name_counts[base_name] = 1

        if stop_name != base_name:
            current_number = int(stop_name.split()[-1])
            new_number = max(current_number, stop_name_counts[base_name])
            stop[0] = f"{base_name} {new_number}"
        elif stop_name_counts[base_name] > 1:
            stop[0] = f"{base_name} {stop_name_counts[base_name]}"

    # convert stops to a list of dictionaries
    stops_dict = [dict(zip(header, stop)) for stop in stops]

    # write to JSX file
    with open(output_file, "w", encoding="utf-8") as outfile:
        outfile.write("const stopsData = ")
        json.dump(stops_dict, outfile, ensure_ascii=False, indent=4)
        outfile.write(";\n\nexport default stopsData;\n")


if __name__ == "__main__":
    input_file = "../data/stops.csv"  # input CSV
    output_file = "../data/stops_updated.jsx"  # output JSX
    process_stops(input_file, output_file)

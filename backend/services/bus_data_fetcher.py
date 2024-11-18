import requests
from datetime import datetime
from json import dumps
class BusDataFetcher:
    """
    A class to fetch bus data from an API for a specified time range.
    """

    BASE_API_URL = "https://dados.mobilidade.rio/gps/sppo?"

    def __init__(self):
        """
        Initializes the BusDataFetcher class.
        """
        self.today = datetime.now().strftime("%d-%m-%Y")

    def get_buses_data(self, start_time: str, end_time: str):
        """
        Fetch bus data from the API for a specified time range.

        Args:
            start_time (str): The start time in HH:MM:SS format.
            end_time (str): The end time in HH:MM:SS format.

        Returns:
            dict: The bus data returned by the API in JSON format.
        """
        # Prepare the time range for the API query
        formatted_start_time = f"{self.today}+{start_time}"
        formatted_end_time = f"{self.today}+{end_time}"

        # Construct the API query URL
        date_query = f"{self.BASE_API_URL}dataInicial={formatted_start_time}&dataFinal={formatted_end_time}"

        # Make the request and return the JSON response
        try:
            response = requests.get(date_query)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching bus data: {e}")
            return {}

# Example usage
if __name__ == "__main__":
    fetcher = BusDataFetcher()
    data = fetcher.get_buses_data("10:00:00", "11:00:00")
    print(dumps(data[0], indent=4))

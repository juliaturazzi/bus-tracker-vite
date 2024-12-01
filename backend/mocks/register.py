import requests

# Step 1: Register a new user
register_url = "http://localhost:8000/register/"
register_data = {
    "email": "juliaturazzi@gmail.com",
    "username": "juliaturazzi",
    "password": "melusca",
}
headers = {"Content-Type": "application/json"}

response = requests.post(register_url, json=register_data, headers=headers)
print(f"Registration Response: {response.json()}")

# Step 2: Obtain the access token
token_url = "http://localhost:8000/token"
token_data = {"username": "juliaturazzi@gmail.com", "password": "melusca"}
headers = {"Content-Type": "application/x-www-form-urlencoded"}

response = requests.post(token_url, data=token_data, headers=headers)
token_response = response.json()
print(f"Token Response: {token_response}")

# Extract the access token
access_token = token_response.get("access_token")
if not access_token:
    raise ValueError("Failed to retrieve access token.")

# Step 3: Register a bus stop
stops_register_url = "http://localhost:8000/stops/register/"
stops_data = {
    "bus_line": "123",
    "stop_name": "Central Station",
    "latitude": -22.912,
    "longitude": -43.230,
    "start_time": "08:00:00",
    "end_time": "09:00:00",
}
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json",
}

response = requests.post(stops_register_url, json=stops_data, headers=headers)
print(f"Stops Registration Response: {response.json()}")

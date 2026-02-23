import requests
import os
from dotenv import load_dotenv

load_dotenv()

def test_nominatim():
    print("Testing Nominatim...")
    headers = {'User-Agent': 'ClimateCreditScoreEngine/1.0'}
    params = {'q': 'Miami, FL', 'format': 'json', 'limit': 1}
    try:
        response = requests.get("https://nominatim.openstreetmap.org/search", params=params, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Result: {response.json()[0]['lat']}, {response.json()[0]['lon']}")
    except Exception as e:
        print(f"Error: {e}")

def test_open_meteo():
    print("\nTesting Open-Meteo...")
    params = {
        "latitude": 25.7617, "longitude": -80.1918,
        "start_date": "2023-01-01", "end_date": "2023-01-10",
        "daily": "temperature_2m_max", "timezone": "GMT"
    }
    try:
        response = requests.get("https://archive-api.open-meteo.com/v1/archive", params=params)
        print(f"Status: {response.status_code}")
        print(f"Data points: {len(response.json().get('daily', {}).get('temperature_2m_max', []))}")
    except Exception as e:
        print(f"Error: {e}")

def test_open_elevation():
    print("\nTesting Open-Elevation...")
    params = {'locations': '25.7617,-80.1918'}
    try:
        response = requests.get("https://api.open-elevation.com/api/v1/lookup", params=params)
        print(f"Status: {response.status_code}")
        print(f"Elevation: {response.json()['results'][0]['elevation']}")
    except Exception as e:
        print(f"Error: {e}")

def test_nasa_power():
    print("\nTesting NASA POWER...")
    params = {
        "latitude": 25.7617, "longitude": -80.1918,
        "start_date": "20230101", "end_date": "20230110",
        "parameters": "PRECTOTCORR", "community": "AG", "format": "JSON"
    }
    try:
        response = requests.get("https://power.larc.nasa.gov/api/temporal/daily/point", params=params)
        print(f"Status: {response.status_code}")
        daily_precip = response.json()['properties']['parameter']['PRECTOTCORR']
        print(f"Data points: {len(daily_precip)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_nominatim()
    test_open_meteo()
    test_open_elevation()
    test_nasa_power()

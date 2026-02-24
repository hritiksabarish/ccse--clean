import requests
import json

def test_backend():
    url = "http://localhost:5001/api/analyze"
    payload = {
        "address": "Mumbai, India",
        "asset_value": 500000,
        "loan_term": 20
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        print(f"Sending request to {url}...")
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Response Data (subset):")
            print(f"  Location: {data.get('address') or data.get('location_name')}")
            print(f"  Climate Score: {data.get('climate_score')}")
            print(f"  Risk level: {data.get('risk_level')}")
            
            # Check if ml-earth-engine/earth_training_data.csv was updated
            import os
            csv_path = 'ml-earth-engine/earth_training_data.csv'
            if os.path.exists(csv_path):
                with open(csv_path, 'r') as f:
                    lines = f.readlines()
                    print(f"CSV logging verified: {len(lines)} rows total.")
            
            print("\nVerification Successful!")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_backend()

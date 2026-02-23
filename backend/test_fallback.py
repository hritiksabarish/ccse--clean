import requests
import json

def test_robust_fallback():
    url = "http://localhost:5001/api/analyze"
    payload = {
        "property_id": "TEST-FALLBACK",
        "address": "Invalid Location XYZ",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "asset_value": 500000,
        "loan_term": 15
    }
    
    print(f"Testing Analysis with robust fallback for: {payload['address']}")
    try:
        response = requests.post(url, json=payload, timeout=20)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\nResponse Analysis:")
            print(f"- Climate Score: {data.get('climate_score')}")
            
            # Check Risk Profile
            rp = data.get('risk_profile', {})
            print(f"- Risk Profile (numeric only): {all(isinstance(v, (int, float)) for v in rp.values())}")
            print(f"  Values: {rp}")
            
            # Check Temperature Trend (Array of Numbers for Frontend)
            tt = data.get('temperature_trend', [])
            print(f"- Temperature Trend (list of numbers): {all(isinstance(v, (int, float)) for v in tt)}")
            print(f"  Values: {tt}")
            
            # Check Environmental Composition (Sum to 100)
            ec = data.get('environmental_composition', {})
            total = sum(ec.values())
            print(f"- Environmental Composition Sum (should be 100): {total}")
            print(f"  Values: {ec}")
            
            # Check Projection (Structured for requirement)
            tp = data.get('temperature_projection', [])
            print(f"- Temperature Projection (structured): {tp}")
            
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_robust_fallback()

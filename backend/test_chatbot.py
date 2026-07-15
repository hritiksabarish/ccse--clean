import requests

url = "http://localhost:5001/api/ai-chat"
payload = {
    "message": "Hello, how are you?",
    "analysis_data": {
        "climate_score": 50,
        "risk_profile": {"heat": 50, "flood": 50},
        "temperature_projection": []
    }
}
try:
    response = requests.post(url, json=payload, timeout=10)
    print("Status:", response.status_code)
    try:
        data = response.json()
        print("Error Details:\n", data.get("details", data))
    except:
        print("Raw:", response.text)
except Exception as e:
    print(f"Error: {e}")

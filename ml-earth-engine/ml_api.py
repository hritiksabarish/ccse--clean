from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Constants
MODEL_PATH = os.path.join(script_dir, 'earth_model.pkl')
PORT = 5050

# Load model globally
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("🌍 Global Earth Intelligence ML Model loaded successfully.")
else:
    print("⚠️ Warning: earth_model.pkl not found. Using simple fallback model for now.")

def fallback_predict(data):
    # Simple weighted average as a "mock" ML model
    score = 100 - (
        data.get('heat_risk', 50) * 0.3 +
        data.get('flood_risk', 50) * 0.3 +
        data.get('storm_risk', 50) * 0.2 +
        (100 - data.get('green_cover_ratio', 30)) * 0.2
    )
    return round(float(max(0, min(100, score))), 1)

# ---------- HOME ROUTE (for browser testing) ----------
@app.route("/")
def home():
    return "🌍 Global Earth ML Model Running Successfully"


# ---------- ML PREDICTION ROUTE ----------
@app.route('/ml-predict', methods=['POST'])
def predict():
    global model

    try:
        data = request.json

        if model is not None:
            # Prepare feature vector
            features = pd.DataFrame([{
                'heat_risk': data.get('heat_risk', 50),
                'flood_risk': data.get('flood_risk', 50),
                'storm_risk': data.get('storm_risk', 50),
                'elevation': data.get('elevation', 10),
                'temperature_trend': data.get('temperature_trend', 1.0),
                'green_cover_ratio': data.get('green_cover_ratio', 30)
            }])

            prediction = model.predict(features)[0]
            ml_score = round(float(prediction), 1)

        else:
            ml_score = fallback_predict(data)

        ml_score = max(0.0, min(100.0, ml_score))

        print("🌍 Earth ML Prediction Executed")

        return jsonify({"ml_score": ml_score})

    except Exception as e:
        return jsonify({"error": str(e)}), 400
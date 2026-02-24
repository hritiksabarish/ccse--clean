import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

def train_model():
    print("Starting training script...")
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # File paths relative to script location
    data_path = os.path.join(script_dir, 'earth_training_data.csv')
    model_path = os.path.join(script_dir, 'earth_model.pkl')
    
    print(f"Checking for data at {data_path}...")

    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    # Load data
    df = pd.read_csv(data_path)
    
    if len(df) < 5:
        print("Not enough data to train. Need at least 5 rows.")
        return

    # Split features and target
    # Features: heat_risk, flood_risk, storm_risk, elevation, temperature_trend, green_cover_ratio
    # Target: final_climate_score
    X = df[['heat_risk', 'flood_risk', 'storm_risk', 'elevation', 'temperature_trend', 'green_cover_ratio']]
    y = df['final_climate_score']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Initialize and train model
    print("Training Global Earth Intelligence ML Model...")
    model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
    model.fit(X_train, y_train)

    # Save model
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

    # Evaluate
    score = model.score(X_test, y_test)
    print(f"Model R^2 score on test set: {score:.4f}")

if __name__ == "__main__":
    train_model()

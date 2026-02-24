import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
import os

# Create synthetic data explicitly designed for the Climate Credit Score Engine
def generate_synthetic_data(num_samples=2000):
    np.random.seed(42)
    
    # Features as expected by the backend
    heat_risk = np.random.uniform(20, 95, num_samples)
    flood_risk = np.random.uniform(10, 90, num_samples)
    storm_risk = np.random.uniform(5, 80, num_samples)
    elevation = np.random.uniform(0, 500, num_samples)
    temperature_trend = np.random.uniform(0.1, 2.5, num_samples)
    green_cover_ratio = np.random.uniform(5, 60, num_samples)
    
    # Synthetic formula based vaguely on the original heuristic but with noise for realism
    # Note: Using 100 - Risks structure.
    base_score = 100 - (
        (heat_risk * 0.25) + 
        (flood_risk * 0.3) + 
        (storm_risk * 0.15) - 
        (elevation * 0.05) + 
        (temperature_trend * 2.0) - 
        (green_cover_ratio * 0.1)
    )
    
    # Add non-linear interactions & noise mimicking complex ML behavior
    noise = np.random.normal(0, 3, num_samples)
    interaction = (heat_risk * temperature_trend * 0.05)
    
    final_score = base_score - interaction + noise
    # Constrain to 0-100 logically
    final_score = np.clip(final_score, 0, 100)
    
    df = pd.DataFrame({
        'heat_risk': heat_risk,
        'flood_risk': flood_risk,
        'storm_risk': storm_risk,
        'elevation': elevation,
        'temperature_trend': temperature_trend,
        'green_cover_ratio': green_cover_ratio,
        'climate_score': final_score
    })
    
    return df

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    ml_dir = os.path.join(current_dir, "ml-earth-engine")
    os.makedirs(ml_dir, exist_ok=True)
    
    print("Generating synthetic climate data...")
    df = generate_synthetic_data()
    
    # Optional: Append to existing data if desired, but synthetic ensures 2k strong dataset
    csv_path = os.path.join(ml_dir, "earth_training_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"Data saved to {csv_path}")
    
    X = df[['heat_risk', 'flood_risk', 'storm_risk', 'elevation', 'temperature_trend', 'green_cover_ratio']]
    y = df['climate_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    print(f"Model MSE on test set: {mse:.2f}")
    
    model_path = os.path.join(ml_dir, "climate_model.pkl")
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}!")

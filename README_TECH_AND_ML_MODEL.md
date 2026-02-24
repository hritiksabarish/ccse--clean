# Climate Credit Score Engine
## Technology Stack, Tools, and ML Model Architecture

This document outlines the core technologies and tools used within the Climate Credit Score Engine (CCSE), as well as a detailed explanation of how the Machine Learning model processes physical data to assign a climate risk credit score.

---

### 1. Technology Stack and Tools

#### Frontend
- **React.js & Vite:** The core framework and build tool used for generating a fast, responsive user interface.
- **Leaflet & React-Leaflet:** The mapping engine used to visualize geographical assets interactively.
- **Leaflet.heat:** A specialized plugin used to overlay heatmaps based on area risk intensity.
- **Chart.js & React-Chartjs-2:** Used for data visualization, specifically the radar risk profiles, historical temperature trend lines, and environmental composition pie charts.
- **Tailwind CSS / Custom CSS:** Styling the application using modern glass-morphism techniques and responsive design grids.
- **Lucide React:** A clean, minimal iconography library used for UI elements.
- **PapaParse:** Used in the portfolio view to rapidly process and parse batch CSV uploads on the client side without needing backend buffering.

#### Backend
- **Python Flask:** A lightweight web framework serving as the engine's core REST API.
- **SQLite / SQLAlchemy:** A lightweight SQL database mapping ORM used to track property analysis history and portfolio assets.
- **Flask-CORS / Flask-JWT-Extended:** Handling cross-origin requests securely and issuing JWT tokens for user authentication.

#### AI and Machine Learning Core
- **Scikit-Learn:** The workhorse ML library used to train a `RandomForestRegressor`. Selected due to its powerful handling of non-linear environmental variables and resistance to overfitting on tabular data.
- **Joblib:** An optimization tool used over standard `pickle` to rapidly serialize and deserialize the trained `RandomForestRegressor` model into memory during API requests.
- **Pandas & NumPy:** Data manipulation libraries used in the ML training pipeline (`ml_training.py`) to generate robust synthetic environments, simulate climate variance, and prepare dataframes for model consumption.
- **Google Gemini API (Generative AI):** Used in the `ClimateEngine` service to parse the resulting numerical scores and real-world metrics into dynamic, human-readable explanations ("Why this score?").

#### External APIs
- **Nominatim (OpenStreetMap):** Free, rate-limited geocoding to resolve text addresses into Lat/Lng coordinates.
- **Open-Meteo & Open-Elevation:** Free access APIs providing historical temperature trends, elevation topologies, and simulated flood mappings.
- **NASA POWER:** High-level environmental data API used to estimate regional risk limits based on solar and meteorological patterns.

---

### 2. Machine Learning Model Scoring Logic

The ML system replaces a static heuristic equation with an intelligent `RandomForestRegressor`. To train this model, the `ml_training.py` script generates an extensive dataset of 2,000 synthetic property profiles mimicking realistic climate conditions. 

Here is exactly how the base data influences the score before the Random Forest algorithm maps the complex non-linear decision trees:

#### The Features
The model ingests 6 core metrics:
1. **Heat Risk** (Range: 20 - 95)
2. **Flood Risk** (Range: 10 - 90)
3. **Storm Risk** (Range: 5 - 80)
4. **Elevation (meters)** (Range: ~0 - 500)
5. **Temperature Trend (°C increase over 20 years)** (Range: 0.1 - 2.5)
6. **Green Cover Ratio (%)** (Range: 5 - 60)

#### How Risks Penalize the Score
Every property starts with a hypothetical perfect score of **100**. Risk factors deduct points, while protective factors add points back:

- **Heat Risk Penalty:** For every unit of heat risk, the score drops by **0.25** points.
- **Flood Risk Penalty:** The most destructive factor. For every unit of flood risk, the score drops by **0.30** points.
- **Storm Risk Penalty:** For every unit of storm risk, the score drops by **0.15** points.
- **Temperature Trend Penalty:** Long-term climate shifting is heavily weighed. Every 1°C increase over the trailing 20 years subtracts **2.0** full points off the score.

#### How Protections Buffer the Score
- **Elevation Buffer:** Higher ground mitigates flooding and storm surges. Every meter of elevation adds **0.05** points back to the score.
- **Green Cover Buffer:** Greenery regulates micro-climates and absorbs excess water. Every 1% of green cover adds **0.10** points back.

#### Non-Linear Interaction and Noise Mapping
Because real-world climate isn't perfectly linear, the synthetic data injects the following to train the Random Forest effectively:
- **Interaction Penalties:** As temperatures rise, existing heat risks multiply exponentially. The model observes an interaction penalty where `Heat Risk × Temperature Trend × 0.05` is subtracted from the final score.
- **Gaussian Noise:** Real life has unpredictable variables. A random modifier between -3 and +3 points is added to simulate variance.

#### Final Processing
The algorithm calculates the final number and firmly **clips it between 0 and 100**. 

Once the `RandomForestRegressor` trains on these 2,000 generated profiles, it stops using the mathematical formula entirely. Instead, it learns the relationships (e.g., *High elevation mitigates flood risk but doesn't stop temperature trending*) and builds 100 decision trees to vote on the most accurate final Climate Credit Score for any new property fed into the system via the Web App.

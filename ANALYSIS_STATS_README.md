# Climate Credit Score Engine: Tech Stack & API Analysis

This document provides a comprehensive breakdown of all the tools, technologies, frameworks, and open-source APIs used in the Climate Credit Score Engine project. It explains why each component was chosen, its specific purpose within the system, and the exact output or value it contributes.

---

## 1. Frontend Technologies (User Interface)

### React (`react`, `react-dom`)
- **Purpose:** Core UI library for building component-based, single-page web applications.
- **Why it's used:** Allows for modular, reusable UI components (like dashboards, charts, and animations) and efficient DOM updates via the Virtual DOM.
- **Output:** The dynamic, responsive web interface that the user interacts with.

### Vite (`vite`, `@vitejs/plugin-react`)
- **Purpose:** Frontend build tool and development server.
- **Why it's used:** Provides lightning-fast Hot Module Replacement (HMR) during development and highly optimized static assets for production deployment compared to older tools like Webpack.
- **Output:** Optimized, minified frontend bundles (HTML, CSS, JS) ready for production deployment.

### React Router (`react-router-dom`)
- **Purpose:** Client-side routing library.
- **Why it's used:** Enables navigation between different views (Home, Analysis, Results, Portfolio) without triggering full page reloads.
- **Output:** Seamless page transitions and URL state management (e.g., navigating to `/results?id=123`).

### Three.js & React-Three-Fiber (`three`, `@react-three/fiber`, `@react-three/drei`)
- **Purpose:** 3D graphics rendering in the browser.
- **Why it's used:** Used to create highly engaging, interactive 3D elements (like a dynamic 3D globe or particle systems) right on the canvas to elevate the visual aesthetic of the climate platform.
- **Output:** 3D WebGL scenes rendered inside standard HTML elements.

### Framer Motion (`framer-motion`)
- **Purpose:** Advanced animation library for React.
- **Why it's used:** Simplifies the creation of complex, physics-based animations (like page transitions, modal pop-ups, and the subtle cursor glow effect) to make the UI feel premium and responsive.
- **Output:** Smooth, hardware-accelerated CSS/JS animations on components.

### Chart.js & React-Chartjs-2 (`chart.js`, `react-chartjs-2`)
- **Purpose:** Data visualization library.
- **Why it's used:** Needed to render complex climate statistical data clearly. It supports various chart types out of the box with responsive behaviors.
- **Output:** The Regional Risk Profile (Radar Chart), Historical Temp Trend (Line Chart), and Environmental Composition (Pie Chart) displayed on the Analysis page.

### React Leaflet (`leaflet`, `react-leaflet`)
- **Purpose:** Interactive mapping library.
- **Why it's used:** To provide geographical context by plotting property coordinates on an interactive world map.
- **Output:** Draggable, zoomable 2D maps displaying target locations.

### Tailwind CSS / Vanilla CSS (Styling)
- **Purpose:** UI styling language.
- **Why it's used:** To design modern aesthetics (glassmorphism, dark modes, vibrant gradients) that make the application feel robust and visually striking.
- **Output:** The visual design and responsive layout of the application.

---

## 2. Backend Technologies (Server & Logic)

### Python
- **Purpose:** Core backend programming language.
- **Why it's used:** Excellent ecosystem for data processing, AI integration (Gemini), and rapid API development.
- **Output:** The backend scripts that process logic, integrate with APIs, and handle authentication.

### Flask (`Flask`)
- **Purpose:** Lightweight Python web framework.
- **Why it's used:** Perfect for serving simple, fast RESTful APIs (`/api/analyze`, `/api/portfolio`) that react quickly to frontend requests without the overhead of bulkier frameworks.
- **Output:** JSON API responses that supply the frontend with calculated climate scores and data.

### Firebase Admin SDK (`firebase-admin`)
- **Purpose:** Server-side connection to Google Firebase.
- **Why it's used:** To securely interact with Firebase Firestore (database) and Authentication systems bypassing the client.
- **Output:** Secure data reads and writes for property records, analysis results, and user profiles.

### Python Dotenv (`python-dotenv`)
- **Purpose:** Environment variable management.
- **Why it's used:** To load sensitive keys (like API tokens and database credentials) from a local `.env` file instead of hardcoding them into scripts.
- **Output:** In-memory secure runtime environment variables.

### Requests (`requests`)
- **Purpose:** HTTP library for Python.
- **Why it's used:** Allows the Flask backend to query third-party APIs (NASA, open-meteo) efficiently to fetch geographical and climate data.
- **Output:** JSON payloads retrieved from external data providers.

### Gunicorn (`gunicorn`)
- **Purpose:** Production Web Server Gateway Interface (WSGI) HTTP server.
- **Why it's used:** Flask's built-in server is not meant for production. Gunicorn handles concurrent requests efficiently when deployed.
- **Output:** A robust, production-ready server environment for the Flask app.

---

## 3. APIs and Open Source Data Services

### Google Gemini API (Key: `GEMINI_API_KEY`)
- **Purpose:** Large Language Model AI service via `google-generativeai`.
- **Why it's used:** Powers the AI Chatbot Analysis feature on the frontend. It interprets complex climate risk arrays and generates natural language explanations for the user.
- **Output:** Textual, context-aware AI responses acting as a professional climate risk assistant.

### Firebase Credentials (`FIREBASE_CREDENTIALS_PATH` / `serviceAccountKey.json`)
- **Purpose:** Authentication token for Firebase.
- **Why it's used:** Authorizes the backend server to act as an admin, bypassing regular user security rules to reliably perform full CRUD operations on properties.
- **Output:** Granted server access to Cloud Firestore and Firebase Auth.

### NASA POWER API (No Key Required)
- **Purpose:** Global meteorological and solar data service.
- **Why it's used:** Used to fetch historical precipitation and solar irradiance data necessary for calculating flood/heat risks.
- **Output:** Raw climate data endpoints used heavily in generating the Risk Profile Radar Chart.

### Open-Meteo API (No Key Required)
- **Purpose:** Open-source weather API providing historical archives.
- **Why it's used:** Queried for daily mean temperatures over the last two decades.
- **Output:** Data arrays that fuel the Historical Temperature Trend Line Chart, illustrating long-term climate warming.

### OpenStreetMap (OSM) Overpass API (No Key Required)
- **Purpose:** Global open-source map database querying API.
- **Why it's used:** Allows the backend to run spatial queries (within a 5km radius) to identify land use types (forests, water bodies, urban zones).
- **Output:** Tag counts and polygon data that define the environmental footprint used in the Environmental Composition Pie Chart.

### Open-Elevation API (No Key Required)
- **Purpose:** Global digital elevation model API.
- **Why it's used:** Fetches the altitude of the target property to factor in coastal vulnerability and sea-level rise risk.
- **Output:** Elevation in meters above sea level used for flood risk calculations.

---

## 4. Overall Data Generation Workflow Summary

1. **User Request:** Frontend sends coordinates via React to the Flask backend (`/api/analyze`).
2. **Data Aggregation:** The Python backend concurrently fires requests using `requests` to NASA POWER, Open-Meteo, OSM Overpass, and Open-Elevation to gather physical climate data.
3. **Data Processing:** The data is transformed mathematically to define risk scores (Heat, Flood, Storm) out of 100.
4. **Database Storage:** The parsed result is securely written to Firebase via the `firebase-admin` SDK.
5. **Visualization:** The Flask app returns a JSON payload to Vite/React, where `react-chartjs-2` maps the data arrays to interactive charts on the end-user's screen.
6. **AI Contextualization:** (Optional) The user engages the `/api/ai-chat`, sending the JSON payload back to the server where the Google Gemini API translates the raw numeric data into actionable climate risk advice.

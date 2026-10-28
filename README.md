# CO2 Digital Twin — Digital Twin for CO₂ Capture in Urban Setting

A full-stack application for monitoring, analyzing, and simulating CO₂ emissions in urban areas. Uses a trained Random Forest ML model for real CO₂ predictions.

## Architecture

```
React Frontend (Vite)
       |
       | REST API (browser 5173 → backend 8085, proxied by Vite at /api)
       v
Spring Boot Backend (port 8085)
       |
       | HTTP (8085 → 8001)
       v
Python FastAPI ML Service (port 8001)
       |
       v
Random Forest .joblib model
```

## Prerequisites

- **Node.js** ≥ 18 and npm
- **Java** 17+ (JDK)
- **Python** 3.10+
- **Maven** (included via wrapper)

## Port Summary

| Service | Port | URL |
|---------|------|-----|
| React Frontend (Vite) | 5173 | http://localhost:5173 |
| Spring Boot Backend | 8085 | http://localhost:8085 |
| Python FastAPI ML Service | 8001 | http://localhost:8001 |

Ports come from `backend/src/main/resources/application.properties` (`server.port`,
`ml.service.url`), `frontend/vite.config.js` (dev server + `/api` proxy target), and
the ML start command below. Keep all three in step if you ever change one.

---

## Quick Start

### 1. ML Service (start first — model takes time to load)

```bash
cd ml-service

# A virtual environment is already committed-ready in this project (venv/).
# Only create/install when it is missing:
#   python -m venv venv
#   .\venv\Scripts\activate        (Windows)
#   source venv/bin/activate       (macOS/Linux)
#   pip install -r requirements.txt

# Start the service (Windows - use the venv's uvicorn so it does not depend on PATH)
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001
```

Wait for `"Model loaded successfully"` before proceeding, then confirm:
`http://localhost:8001/health` → `{"status":"UP","model_loaded":true}`

### 2. Spring Boot Backend

```bash
cd backend

# Windows
.\mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

Confirm it is up: `http://localhost:8085/api/health` → `{"status":"UP",...}`

### 3. React Frontend

```bash
cd frontend

npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Starting everything at once

`run_all.bat` opens all three services in separate windows. On this machine the
plain `uvicorn` command in that script is not always on `PATH`, so if the ML window
reports *"'uvicorn' is not recognized"*, start the ML service with the venv command
from step 1 instead, or run:

```
D:\Projects\co2-digital-twin\ml-service\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001
```

---

## API Endpoints

### Health Check
```
GET /api/health
→ { "status": "UP", "timestamp": "..." }
```

### Dashboard KPIs
```
GET /api/kpi
→ { totalEmissions: {...}, averageCo2: {...}, activeHotspots: {...}, capturePotential: {...} }
```

### Emissions
```
GET /api/emissions/trends    → [{ month, emissions, captured }]
GET /api/emissions/areas     → [{ area, emissions, risk }]
GET /api/emissions/sources   → [{ source, value, color }]
```

### Hotspots
```
GET /api/hotspots            → [{ id, area, co2Level, risk, trend, lat, lng }]
GET /api/hotspots/{id}       → { area, co2Level, severity, mainFactor, trafficLevel, ... }
```

### Simulation
```
POST /api/simulation/run
Body: { "area": "Electronic City", "interventionType": "green-corridor", "intensity": 75 }
→ { before, after, reduction, reductionPercent, area, intervention }
```

### Scenarios & Recommendations
```
GET /api/scenarios           → [{ scenario, co2, reduction, cost, efficiency, status }]
GET /api/recommendations     → [{ id, hotspot, co2Level, traffic, risk, recommended, ... }]
```

### Map & Analytics
```
GET /api/map/markers         → [{ id, area, lat, lng, co2, risk, traffic, estimatedEmissions }]
GET /api/analytics/traffic   → [{ hour, traffic, co2 }]
```

### ML Prediction
```
POST /api/prediction
Body: {
  "latitude": 12.8399,
  "longitude": 77.677,
  "dayOfWeek": 3,
  "month": 9,
  "dayOfYear": 254,
  "isWeekend": 0,
  "population2011": 500000,
  "populationGrowthRate": 2.5,
  "population2021Est": 640000,
  "areaKm2": 50.0,
  "populationDensity2021": 12800,
  "stateVehiclesPer1000": 200,
  "estimatedCityVehicles": 128000,
  "vehicleDensityKm2": 2560,
  "electricityKwhPerCapita": 1200,
  "estimatedCityElectricityKwh": 768000000,
  "industrialElectricityKwhPerCapita": 450,
  "temperatureMean": 28.0,
  "temperatureMax": 35.0,
  "temperatureMin": 22.0,
  "precipitationMm": 5.0,
  "windSpeedMaxKmh": 15.0
}
→ { "predicted_co2_tonnes": 2.35 }
```

### FastAPI ML Service (Direct)
```
POST http://localhost:8001/predict
→ Same 22-feature body as above (with snake_case field names)
→ { "predicted_co2_tonnes": 2.35 }

GET http://localhost:8001/health
→ { "status": "UP", "model_loaded": true }
```

---

## ML Model

- **Algorithm**: Random Forest Regression
- **File**: `ml-service/final_co2_random_forest.joblib` (~578 MB)
- **Target**: `co2_tonnes`
- **Features**: 22 (see prediction endpoint above)
- **Performance**: R² = 0.8542, MAE = 0.3249, RMSE = 0.6623

⚠️ Do NOT retrain, replace, or modify the model file.

---

## Project Structure

```
co2-digital-twin/
├── frontend/                   # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   ├── components/         # Reusable components
│   │   ├── services/api.js     # API abstraction layer
│   │   ├── data/mockData.js    # Reference mock data (not used at runtime)
│   │   ├── hooks/              # Custom hooks
│   │   └── utils/              # Constants, formatters
│   └── package.json
│
├── backend/                    # Spring Boot 4.1.1
│   └── src/main/java/com/co2digitaltwin/backend/
│       ├── controller/         # REST controllers
│       ├── service/            # Business logic
│       ├── dto/                # Request/response DTOs
│       ├── data/               # Static data provider
│       ├── client/             # ML service client
│       └── config/             # CORS, RestClient config
│
└── ml-service/                 # Python FastAPI
    ├── main.py                 # FastAPI app with /predict endpoint
    ├── requirements.txt
    └── final_co2_random_forest.joblib
```

---

## CORS Configuration

Spring Boot is configured to allow requests from `http://localhost:5173` (Vite dev server).

---

## Error Handling

- **400 Bad Request**: Missing/invalid fields in prediction or simulation requests
- **404 Not Found**: Hotspot ID not found
- **503 Service Unavailable**: ML service is down (returned when prediction fails)
- **500 Internal Server Error**: Unexpected errors

All error responses follow the format:
```json
{
  "status": 400,
  "message": "Descriptive error message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

"""
CO2 Digital Twin - ML Prediction Service

FastAPI service that loads a trained Random Forest model and serves CO2 predictions.
The model predicts `co2_tonnes` using exactly 22 features.

Do NOT retrain or modify the model.
"""

import os
import warnings
from contextlib import asynccontextmanager
from typing import Optional

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# The model was fitted with a named DataFrame, but we deliberately build the feature
# matrix as a positional numpy array in the exact training order (FEATURE_NAMES).
# sklearn therefore warns that the array has no feature names, which is expected and
# harmless for this contract. Silence only that specific warning.
warnings.filterwarnings(
    "ignore",
    message="X does not have valid feature names",
    category=UserWarning,
)

# Global reference to the loaded model
model = None

# The exact 22 feature names in the order the model was trained on
FEATURE_NAMES = [
    "latitude",
    "longitude",
    "day_of_week",
    "month",
    "day_of_year",
    "is_weekend",
    "population_2011",
    "population_growth_rate",
    "population_2021_est",
    "area_km2",
    "population_density_2021",
    "state_vehicles_per_1000",
    "estimated_city_vehicles",
    "vehicle_density_km2",
    "electricity_kwh_per_capita",
    "estimated_city_electricity_kwh",
    "industrial_electricity_kwh_per_capita",
    "temperature_mean",
    "temperature_max",
    "temperature_min",
    "precipitation_mm",
    "wind_speed_max_kmh",
]


class PredictionRequest(BaseModel):
    """Request body with the 22 features required by the model."""
    latitude: float = Field(..., description="Latitude of the location")
    longitude: float = Field(..., description="Longitude of the location")
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    day_of_year: int = Field(..., ge=1, le=366, description="Day of year (1-366)")
    is_weekend: int = Field(..., ge=0, le=1, description="Is weekend (0 or 1)")
    population_2011: float = Field(..., description="Population from 2011 census")
    population_growth_rate: float = Field(..., description="Population growth rate")
    population_2021_est: float = Field(..., description="Estimated 2021 population")
    area_km2: float = Field(..., gt=0, description="Area in square kilometers")
    population_density_2021: float = Field(..., description="Population density in 2021")
    state_vehicles_per_1000: float = Field(..., description="Vehicles per 1000 people (state level)")
    estimated_city_vehicles: float = Field(..., description="Estimated city vehicle count")
    vehicle_density_km2: float = Field(..., description="Vehicle density per km²")
    electricity_kwh_per_capita: float = Field(..., description="Electricity consumption kWh per capita")
    estimated_city_electricity_kwh: float = Field(..., description="Estimated city electricity consumption kWh")
    industrial_electricity_kwh_per_capita: float = Field(..., description="Industrial electricity kWh per capita")
    temperature_mean: float = Field(..., description="Mean temperature °C")
    temperature_max: float = Field(..., description="Max temperature °C")
    temperature_min: float = Field(..., description="Min temperature °C")
    precipitation_mm: float = Field(..., ge=0, description="Precipitation in mm")
    wind_speed_max_kmh: float = Field(..., ge=0, description="Max wind speed in km/h")


class PredictionResponse(BaseModel):
    """Response containing the predicted CO2 in tonnes."""
    predicted_co2_tonnes: float


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model once at startup."""
    global model
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "final_co2_random_forest.joblib")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")
    
    print(f"Loading model from {model_path}...")
    model = joblib.load(model_path)
    print(f"Model loaded successfully. Type: {type(model).__name__}")

    # The trained model was persisted with n_jobs=-1, which makes sklearn hand every
    # predict() call to joblib. joblib then spins up a multiprocessing pool, and on
    # this host creating that pool's IPC pipe fails with
    # "PermissionError: [WinError 5] Access is denied", so the service answered HTTP
    # 500 for every prediction instead of returning a result.
    #
    # Predicting a single sample through 150 trees costs milliseconds, so run it
    # in-process. This changes only how the forest averages its trees - the trained
    # model itself, its fitted estimators and the 22-feature contract are untouched.
    original_n_jobs = getattr(model, "n_jobs", None)
    model.n_jobs = 1
    print(f"Prediction parallelism pinned to n_jobs=1 (model was persisted as n_jobs={original_n_jobs}).")
    
    yield  # Application runs here
    
    # Cleanup
    model = None
    print("Model unloaded.")


app = FastAPI(
    title="CO2 Digital Twin - ML Prediction Service",
    description="Serves CO2 predictions using a trained Random Forest model",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow Spring Boot backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Health check endpoint."""
    return {
        "status": "UP",
        "model_loaded": model is not None,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """Generate a CO2 prediction using the trained Random Forest model."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Build feature array in the exact order the model expects
    features = np.array([[
        request.latitude,
        request.longitude,
        request.day_of_week,
        request.month,
        request.day_of_year,
        request.is_weekend,
        request.population_2011,
        request.population_growth_rate,
        request.population_2021_est,
        request.area_km2,
        request.population_density_2021,
        request.state_vehicles_per_1000,
        request.estimated_city_vehicles,
        request.vehicle_density_km2,
        request.electricity_kwh_per_capita,
        request.estimated_city_electricity_kwh,
        request.industrial_electricity_kwh_per_capita,
        request.temperature_mean,
        request.temperature_max,
        request.temperature_min,
        request.precipitation_mm,
        request.wind_speed_max_kmh,
    ]])
    
    prediction = model.predict(features)
    predicted_value = float(prediction[0])
    
    return PredictionResponse(predicted_co2_tonnes=round(predicted_value, 4))

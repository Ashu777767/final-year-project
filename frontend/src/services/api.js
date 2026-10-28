/**
 * API Service Layer
 *
 * Connected to Spring Boot REST backend.
 *
 * Base URL resolution:
 *   - Development (Vite dev server): empty string, so every request goes to the
 *     dev server's own origin and is proxied to the backend by vite.config.js.
 *     This keeps the app working on whatever port Vite uses and avoids CORS
 *     failures entirely.
 *   - Production build: VITE_API_BASE_URL when provided, otherwise the backend's
 *     default origin.
 *
 * Endpoints:
 *   GET  /api/health            → healthCheck()
 *   GET  /api/kpi               → getKpiData()
 *   GET  /api/emissions/trends  → getEmissionTrends()
 *   GET  /api/emissions/areas   → getAreaEmissions()
 *   GET  /api/emissions/sources → getSourceDistribution()
 *   GET  /api/hotspots          → getHotspots()
 *   GET  /api/hotspots/:id      → getHotspotDetail(id)
 *   POST /api/simulation/run    → runSimulation(params)
 *   GET  /api/scenarios         → getScenarios()
 *   GET  /api/recommendations   → getRecommendations()
 *   GET  /api/map/markers       → getMapMarkers()
 *   GET  /api/analytics/traffic → getTrafficVsCo2()
 *   POST /api/prediction        → getPrediction(features)
 */

const DEFAULT_BACKEND_ORIGIN = 'http://localhost:8085';

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || DEFAULT_BACKEND_ORIGIN);

/**
 * Generic fetch wrapper with error handling.
 */
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error: ${response.status}`);
  }

  return response.json();
};

export const healthCheck = async () => {
  return apiFetch('/api/health');
};

export const getKpiData = async (city, baseline) => {
  return apiFetch(`/api/kpi?city=${encodeURIComponent(city || '')}&baseline=${baseline || ''}`);
};

const dateParams = (startDate, endDate) => {
  const parts = [];
  if (startDate) parts.push(`startDate=${encodeURIComponent(startDate)}`);
  if (endDate) parts.push(`endDate=${encodeURIComponent(endDate)}`);
  return parts.length ? `&${parts.join('&')}` : '';
};

export const getEmissionTrends = async (city, startDate, endDate) => {
  return apiFetch(`/api/emissions/trends?city=${encodeURIComponent(city || '')}${dateParams(startDate, endDate)}`);
};

export const getAreaEmissions = async (city) => {
  return apiFetch(`/api/emissions/areas?city=${encodeURIComponent(city || '')}`);
};

export const getSourceDistribution = async (city, startDate, endDate) => {
  return apiFetch(`/api/emissions/sources?city=${encodeURIComponent(city || '')}${dateParams(startDate, endDate)}`);
};

export const searchLocations = async (query) => {
  return apiFetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
};

export const getLocationDetails = async (city, lat, lng, state) => {
  const stateParam = state ? `&state=${encodeURIComponent(state)}` : '';
  return apiFetch(`/api/locations/details?city=${encodeURIComponent(city)}&lat=${lat}&lng=${lng}${stateParam}`);
};

/**
 * Assisted location lookup for areas that cannot be found by name (societies,
 * colonies, campuses, small businesses). Never returns invented coordinates.
 */
export const resolveLocation = async (payload) => {
  return apiFetch('/api/locations/resolve', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
};

export const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'CO2DigitalTwin/1.0' }});
  if (!res.ok) throw new Error('Reverse geocode failed');
  return res.json();
};

export const submitSurvey = async (surveyData) => {
  return apiFetch('/api/survey/predict', {
    method: 'POST',
    body: JSON.stringify(surveyData),
  });
};

export const getHotspots = async (city, lat, lng, dataSource, baseline) => {
  const baselineParam = baseline ? `&baseline=${baseline}` : '';
  return apiFetch(`/api/hotspots?city=${encodeURIComponent(city || '')}&lat=${lat || ''}&lng=${lng || ''}&dataSource=${encodeURIComponent(dataSource || '')}${baselineParam}`);
};

export const getHotspotDetail = async (id, city, lat, lng, dataSource, baseline) => {
  const baselineParam = baseline ? `&baseline=${baseline}` : '';
  return apiFetch(`/api/hotspots/${id}?city=${encodeURIComponent(city || '')}&lat=${lat || ''}&lng=${lng || ''}&dataSource=${encodeURIComponent(dataSource || '')}${baselineParam}`);
};

export const runSimulation = async (params) => {
  return apiFetch('/api/simulation/run', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const getScenarios = async (city) => {
  return apiFetch(`/api/scenarios?city=${encodeURIComponent(city || '')}`);
};

export const getRecommendations = async (features, city) => {
  return apiFetch(`/api/recommendations?city=${encodeURIComponent(city || '')}`, {
    method: 'POST',
    body: JSON.stringify(features || {})
  });
};

export const getMapMarkers = async (city, lat, lng, dataSource, baseline) => {
  const baselineParam = baseline ? `&baseline=${baseline}` : '';
  return apiFetch(`/api/map/markers?city=${encodeURIComponent(city || '')}&lat=${lat || ''}&lng=${lng || ''}&dataSource=${encodeURIComponent(dataSource || '')}${baselineParam}`);
};

export const getTrafficVsCo2 = async (city, startDate, endDate) => {
  return apiFetch(`/api/analytics/traffic?city=${encodeURIComponent(city || '')}${dateParams(startDate, endDate)}`);
};

export const getPrediction = async (features) => {
  return apiFetch('/api/prediction', {
    method: 'POST',
    body: JSON.stringify(features),
  });
};

/**
 * Plan a proposed residential society.
 *
 * This is a DIFFERENT calculation from /api/survey/predict and /api/prediction: it
 * returns an activity-based operational estimate for the society itself (measured or
 * user-supplied activity x published emission factors), not the model's city-scale
 * "modelled area CO2". The two are never combined in the UI.
 */
export const getSocietyPlan = async (design) => {
  return apiFetch('/api/society/plan', {
    method: 'POST',
    body: JSON.stringify(design),
  });
};

/** Recalculate the plan under each what-if adjustment, using the same documented method. */
export const getSocietyScenarios = async (payload) => {
  return apiFetch('/api/society/scenarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// src/hooks/useLocationProfile.js
//
// Shared location search + area-profile/survey logic.
//
// Extracted from the navbar LocationSearch so the dedicated "Area Profile" page can
// reuse the exact same search, survey and persistence behaviour instead of creating
// a second survey system. Both consumers use the one global LocationContext.

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchLocations, getLocationDetails, submitSurvey, resolveLocation } from '../services/api';
import { useLocation } from '../context/LocationContext';

// Bumped when the stored area-profile shape or the values it holds change.
// Older cached entries are discarded so stale/garbage numbers cannot be reused.
export const PROFILE_SCHEMA_VERSION = 2;

export const profileStorageKey = (name) => `survey_v${PROFILE_SCHEMA_VERSION}_${name}`;

export const readSavedProfile = (name) => {
  try {
    const raw = localStorage.getItem(profileStorageKey(name));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.city !== name) return null;
    if (typeof parsed.baselineCo2 !== 'number') return null;
    return parsed;
  } catch (e) {
    console.error('Failed to parse saved profile', e);
    return null;
  }
};

const saveProfile = (profile) => {
  try {
    localStorage.setItem(profileStorageKey(profile.city), JSON.stringify(profile));
    return true;
  } catch (e) {
    console.error('Failed to save area profile', e);
    return false;
  }
};

const useLocationProfile = () => {
  const { location, setLocation } = useLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | needs_location | loading | ready | needs_survey | error
  const [statusMessage, setStatusMessage] = useState(null);
  /** How the coordinates were obtained: exact | pincode | address | locality | landmark | manual */
  const [resolution, setResolution] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState(null);

  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyError, setSurveyError] = useState(null);

  // Guards against a slow earlier search overwriting a newer one.
  const searchToken = useRef(0);

  useEffect(() => {
    setSearchError(null);

    if (!query || query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const token = ++searchToken.current;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchLocations(query);
        if (token !== searchToken.current) return;
        setResults(Array.isArray(res) ? res : []);
      } catch (err) {
        if (token !== searchToken.current) return;
        console.error('Search error', err);
        setResults([]);
        setSearchError(`Could not search for "${query}". Please check that the backend is running and try again.`);
      } finally {
        if (token === searchToken.current) setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const clearSelection = useCallback(() => {
    setSelected(null);
    setStatus('idle');
    setStatusMessage(null);
    setResolution(null);
    setResolveError(null);
    setResults([]);
    setQuery('');
  }, []);

  const openSurvey = useCallback((loc, weather) => {
    setSurveyData({
      city: loc.name,
      state: loc.state,
      lat: loc.lat,
      lng: loc.lng,
      weather,
      resolution: loc.resolution || null,
    });
    setSurveyError(null);
    setShowSurvey(true);
    setStatus('needs_survey');
    setStatusMessage(
      loc.resolution && loc.resolution !== 'exact'
        ? `Coordinates obtained via ${loc.resolution}. This area has no stored data yet — complete the area profile to generate its digital twin.`
        : 'This area has no data yet. Complete the area profile to generate its digital twin.'
    );
  }, []);

  /**
   * Shared continuation once valid coordinates are known (from a search result or
   * from the assisted lookup). Checks for existing data before opening the survey.
   */
  const proceedWithCoordinates = useCallback(async ({ name, state, lat, lng, resolution: how }) => {
    setSelected({ name, state, lat, lng, resolution: how });
    setResolution(how || 'exact');

    // Reuse a previously generated profile for this exact area when present.
    const savedProfile = readSavedProfile(name);
    if (savedProfile) {
      setLocation(savedProfile);
      setStatus('ready');
      setStatusMessage('Using the area profile saved on this device.');
      setQuery('');
      return;
    }

    // Make the selection take effect immediately so the map recenters and other
    // pages stop showing the previous area while details are being fetched.
    setStatus('loading');
    setStatusMessage('Checking data availability…');
    setLocation({
      city: name,
      state,
      lat,
      lng,
      status: 'LOADING',
      dataSource: 'Loading area data',
      resolution: how || 'exact',
      features: null,
      baselineCo2: null,
    });

    try {
      const details = await getLocationDetails(name, lat, lng, state);
      if (details && details.status === 'READY') {
        setLocation({ ...details, resolution: how || 'exact' });
        setStatus('ready');
        setStatusMessage('Existing data available for this area.');
        setQuery('');
      } else {
        openSurvey({ name, state, lat, lng, resolution: how }, details ? details.weather : null);
      }
    } catch (err) {
      console.error('Failed to load location details', err);
      setQuery('');
      setStatus('error');
      setStatusMessage(`Could not load data for ${name}. ${err.message}`);
    }
  }, [setLocation, openSurvey]);

  const selectLocation = useCallback(async (loc) => {
    setResults([]);
    setQuery(loc.name);
    setSearchError(null);

    // A search result without coordinates cannot be used by the model, so ask for
    // more information rather than substituting an approximate point silently.
    if (!Number.isFinite(Number(loc.lat)) || !Number.isFinite(Number(loc.lng))) {
      setSelected({ name: loc.name, state: loc.state, lat: null, lng: null });
      setStatus('needs_location');
      setStatusMessage(`We couldn't resolve coordinates for ${loc.name}. Help us locate your area.`);
      return;
    }

    await proceedWithCoordinates({
      name: loc.name,
      state: loc.state,
      lat: Number(loc.lat),
      lng: Number(loc.lng),
      resolution: 'exact',
    });
  }, [proceedWithCoordinates]);

  /**
   * Attempts to resolve a custom/small area (society, colony, campus, business) from
   * extra information the user provides. Never fabricates coordinates: an unresolved
   * result keeps the form open and blocks the model.
   */
  const resolveWithAssistance = useCallback(async (payload) => {
    setIsResolving(true);
    setResolveError(null);
    try {
      const res = await resolveLocation(payload);
      if (!res || !res.resolved) {
        setStatus('needs_location');
        setStatusMessage(null);
        setResolveError(res && res.message
          ? res.message
          : "We still couldn't locate this area. Please provide a valid pincode, address, or coordinates to continue.");
        return;
      }

      const how = res.resolution || 'manual';
      // Keep the user's original area name when they gave one (e.g. a society),
      // so the active area reflects what they were analysing.
      const name = (payload && payload.areaName && payload.areaName.trim())
        ? payload.areaName.trim()
        : (res.name || 'Custom area');

      setResolveError(null);
      await proceedWithCoordinates({
        name,
        // Prefer the administrative state the geocoder actually resolved; fall back
        // to what the user typed only when the result has none.
        state: res.state || (payload && payload.state) || (selected && selected.state) || '',
        lat: Number(res.latitude),
        lng: Number(res.longitude),
        resolution: how,
      });
    } catch (err) {
      console.error('Location resolve error', err);
      setResolveError(`Could not resolve the location. ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  }, [proceedWithCoordinates]);

  /** Opens the location-assistance step for the area the user typed. */
  const requestLocationHelp = useCallback((name) => {
    const areaName = (name || query || '').trim();
    if (!areaName) return;
    setResults([]);
    setSearchError(null);
    setSelected({ name: areaName, state: '', lat: null, lng: null });
    setStatus('needs_location');
    setStatusMessage(null);
    setResolveError(null);
  }, [query]);

  const closeSurvey = useCallback(() => {
    setShowSurvey(false);
    setSurveyError(null);
  }, []);

  const handleSurveySubmit = useCallback(async (formData) => {
    if (!surveyData) return;
    setIsSubmitting(true);
    setSurveyError(null);
    try {
      const finalRes = await submitSurvey({
        city: surveyData.city,
        state: surveyData.state,
        lat: surveyData.lat,
        lng: surveyData.lng,
        weather: surveyData.weather,
        resolution: surveyData.resolution || 'exact',
        // Population and electricity are required: the model's population and
        // electricity features are derived from them. A blank answer is sent as null
        // so the backend reports exactly what is missing, instead of the categorical
        // fallback being substituted for a figure the user never supplied.
        population: formData.population_est === '' ? null : formData.population_est,
        traffic: formData.vehicles_est || formData.traffic_level,
        industry: formData.industry_level,
        electricity: formData.electricity_kwh === '' ? null : formData.electricity_kwh,
        area_km2: formData.area_km2 === '' ? null : Number(formData.area_km2),
      });

      setLocation(finalRes);
      saveProfile(finalRes);
      setShowSurvey(false);
      setQuery('');
      setStatus('ready');
      setStatusMessage('Area profile generated and saved. This area is now the active area.');    } catch (err) {
      console.error('Survey error', err);
      setSurveyError(`Could not build the digital twin for ${surveyData?.city}. ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [surveyData, setLocation]);

  return {
    // search
    query,
    setQuery,
    results,
    isSearching,
    searchError,
    // selection + data status
    selected,
    status,
    statusMessage,
    resolution,
    activeLocation: location,
    // location assistance
    isResolving,
    resolveError,
    resolveWithAssistance,
    requestLocationHelp,
    // survey
    showSurvey,
    surveyData,
    isSubmitting,
    surveyError,
    handleSurveySubmit,
    closeSurvey,
    openSurvey,
    // actions
    selectLocation,
    clearSelection,
    requestProfile: () => {
      if (selected && Number.isFinite(Number(selected.lat)) && Number.isFinite(Number(selected.lng))) {
        openSurvey(selected, null);
      }
    },
  };
};

export default useLocationProfile;

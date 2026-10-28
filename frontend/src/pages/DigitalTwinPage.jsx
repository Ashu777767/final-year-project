import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/map/MapContainer';
import MapLayerControls from '../components/map/MapLayerControls';
import MapLegends from '../components/map/MapLegends';
import AreaInfoPanel from '../components/map/AreaInfoPanel';
import SectionHeader from '../components/common/SectionHeader';
import SurveyModal from '../components/layout/SurveyModal';
import { MapPin } from 'lucide-react';
import { submitSurvey } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { CO2_SCOPE, CO2_UNIT } from '../utils/co2Scope';

const DigitalTwinPage = () => {
  const navigate = useNavigate();
  const { location, setLocation } = useLocation();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyError, setSurveyError] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    co2: true,
    traffic: false,
    hotspots: true,
    capture: false,
  });

  // Load persisted layer preferences
  useEffect(() => {
    const saved = localStorage.getItem('activeLayers');
    if (saved) {
      try {
        setActiveLayers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse activeLayers from localStorage', e);
      }
    }
  }, []);

  // Save when changed
  useEffect(() => {
    localStorage.setItem('activeLayers', JSON.stringify(activeLayers));
  }, [activeLayers]);

  const handleLayerToggle = (key) => {
    setActiveLayers({
      co2: key === 'co2',
      traffic: key === 'traffic',
      hotspots: key === 'hotspots',
      capture: key === 'capture',
    });
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleSimulate = (marker) => {
    navigate('/simulator', { state: { marker } });
  };

  const handleClosePanel = () => setSelectedMarker(null);

  // Never render a map for an area without valid coordinates (no 0,0, no fake markers).
  const hasValidCoordinates = Boolean(
    location
    && Number.isFinite(Number(location.lat))
    && Number.isFinite(Number(location.lng))
    && !(Math.abs(Number(location.lat)) < 0.0001 && Math.abs(Number(location.lng)) < 0.0001)
  );
  const handleRequireSurvey = (data) => {
    setSurveyData(data);
    setSurveyError(null);
    setShowSurvey(true);
  };
  const handleSurveySubmit = async (formData) => {
    setIsSubmitting(true);
    setSurveyError(null);
    try {
      const finalRes = await submitSurvey({
        city: surveyData.city,
        state: surveyData.state,
        lat: surveyData.lat,
        lng: surveyData.lng,
        weather: surveyData.weather,
        population: formData.population_est || formData.population_level,
        traffic: formData.vehicles_est || formData.traffic_level,
        industry: formData.industry_level,
        electricity: formData.electricity_kwh || formData.electricity_level,
        area_km2: formData.area_km2 === '' ? null : Number(formData.area_km2)
      });
      setLocation(finalRes);
      setShowSurvey(false);
    } catch (err) {
      console.error('Survey error', err);
      setSurveyError(`Could not build the digital twin for ${surveyData?.city}. ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 shrink-0">
        <div>
          <SectionHeader
            title="Digital Twin Map"
            subtitle="Interactive urban CO₂ visualization"
            className="mb-0"
          />
          <p className="text-xs text-slate-500 mt-1">
            {location?.city
              ? <>Active area: <span className="font-medium text-slate-700">{location.city}{location.state ? `, ${location.state}` : ''}</span></>
              : 'No area selected — showing the default area.'}
            {' '}Values are {CO2_SCOPE.label.toLowerCase()}, in {CO2_UNIT}.
          </p>
        </div>
        <MapLayerControls activeLayers={activeLayers} onToggle={handleLayerToggle} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative z-0">
          {hasValidCoordinates ? (
            <>
              <MapView
                activeLayers={activeLayers}
                onMarkerClick={handleMarkerClick}
                selectedMarkerId={selectedMarker?.id}
                onRequireSurvey={handleRequireSurvey}
              />
              <MapLegends activeLayers={activeLayers} />
            </>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
              <MapPin className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-700 font-medium">Map visualization is not available for this location yet.</p>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                This area has no valid coordinates, so no map markers are shown. Use{' '}
                <button
                  type="button"
                  onClick={() => navigate('/area-profile')}
                  className="font-medium text-primary-700 hover:underline"
                >
                  Area Profile
                </button>{' '}
                to provide a pincode, address or coordinates.
              </p>
            </div>
          )}
        </div>
        <div className="w-full md:w-80 h-auto md:h-full shrink-0">
          <AreaInfoPanel marker={selectedMarker} onClose={handleClosePanel} onSimulate={handleSimulate} />
        </div>
      </div>
      <SurveyModal
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        onSubmit={handleSurveySubmit}
        locationData={surveyData}
        submitting={isSubmitting}
        error={surveyError}
      />
    </div>
  );
};

export default DigitalTwinPage;

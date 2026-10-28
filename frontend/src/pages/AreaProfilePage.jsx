import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle2, AlertCircle, Loader2, Database, ArrowRight, Map, Compass } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import Button from '../components/common/Button';
import SurveyModal from '../components/layout/SurveyModal';
import LocationAssistForm from '../components/layout/LocationAssistForm';
import useLocationProfile from '../hooks/useLocationProfile';
import { CO2_SCOPE, CO2_UNIT, formatTonnesPerDay } from '../utils/co2Scope';

/**
 * Dedicated entry point for searching an area, reviewing its existing profile and -
 * when no data exists - completing the existing "Complete Area Profile" survey.
 *
 * Uses the shared useLocationProfile hook, so the survey, the survey API and the
 * global LocationContext are exactly the same as the navbar search.
 */
const AreaProfilePage = () => {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    results,
    isSearching,
    searchError,
    selected,
    status,
    statusMessage,
    resolution,
    activeLocation,
    isResolving,
    resolveError,
    resolveWithAssistance,
    requestLocationHelp,
    showSurvey,
    surveyData,
    isSubmitting,
    surveyError,
    selectLocation,
    handleSurveySubmit,
    closeSurvey,
    requestProfile,
    clearSelection,
  } = useLocationProfile();

  const activeArea = activeLocation && activeLocation.city ? activeLocation : null;
  const hasPrediction = activeArea && typeof activeArea.baselineCo2 === 'number' && activeArea.baselineCo2 > 0;
  const activeResolution = activeArea && activeArea.resolution ? activeArea.resolution : resolution;

  const resolutionNote = () => {
    if (!activeResolution || activeResolution === 'exact') return null;
    if (activeResolution === 'manual') {
      return { tone: 'amber', text: 'Location entered manually' };
    }
    if (activeResolution === 'pincode') {
      return { tone: 'amber', text: 'Location resolved using pincode — this is an approximate area location, not the exact building.' };
    }
    if (activeResolution === 'address') {
      return { tone: 'amber', text: 'Location resolved using the address you provided — approximate area location.' };
    }
    if (activeResolution === 'locality') {
      return { tone: 'amber', text: 'Approximate area location resolved from locality/city.' };
    }
    if (activeResolution === 'landmark') {
      return { tone: 'amber', text: 'Approximate area location resolved from the landmark you provided.' };
    }
    return null;
  };

  const note = resolutionNote();

  const statusBadge = () => {
    if (status === 'loading') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
          <Loader2 size={12} className="animate-spin" /> Checking
        </span>
      );
    }
    if (status === 'ready') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
          <CheckCircle2 size={12} /> Data available
        </span>
      );
    }
    if (status === 'needs_location') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
          <Compass size={12} /> Location needed
        </span>
      );
    }
    if (status === 'needs_survey') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
          <AlertCircle size={12} /> Profile required
        </span>
      );
    }
    if (status === 'error') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
          <AlertCircle size={12} /> Error
        </span>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <SectionHeader
        title="Area Profile"
        subtitle="Search an area to review its profile, or complete a new area profile when no data exists"
      />

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <label htmlFor="area-profile-search" className="block text-sm font-medium text-slate-700 mb-2">
          Search Indian City or Area
        </label>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="area-profile-search"
            name="areaSearch"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Pune, Coimbatore, Kothrud"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {isSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
        </div>

        {results.length > 0 && (
          <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-sm max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={`${r.name}-${r.state}-${i}`}
                type="button"
                onClick={() => selectLocation(r)}
                className="w-full text-left p-3 hover:bg-slate-50 border-b last:border-0 transition-colors"
              >
                <div className="font-medium text-slate-800 text-sm">{r.name}</div>
                <div className="text-xs text-slate-500">{r.state}</div>
              </button>
            ))}
          </div>
        )}

        {searchError && (
          <p role="alert" className="mt-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
            {searchError}
          </p>
        )}

        {!(selected && status === 'needs_location') && (query || '').trim().length >= 2 && !isSearching && (
          <div className="mt-3 text-sm text-slate-600">
            Not the area you meant, or can't find it?{' '}
            <button
              type="button"
              onClick={() => requestLocationHelp(query)}
              className="font-medium text-primary-700 hover:underline"
            >
              Help us locate your area
            </button>
          </div>
        )}
      </div>

      {/* Location assistance - shown when the exact area cannot be resolved */}
      {status === 'needs_location' && selected && (
        <div className="mb-6">
          <LocationAssistForm
            areaName={selected.name}
            onSubmit={resolveWithAssistance}
            onCancel={clearSelection}
            submitting={isResolving}
            error={resolveError}
          />
        </div>
      )}

      {/* Selected area */}
      {!selected && !activeArea && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No area selected</p>
          <p className="text-sm text-slate-500 mt-1">
            Search above to select an area. If the area has no data yet, the area profile survey will open.
          </p>
        </div>
      )}

      {selected && status !== 'needs_location' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-xs text-slate-500 mb-1">Selected Area</p>
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <MapPin size={18} className="text-primary-600" />
                {selected.name}{selected.state ? `, ${selected.state}` : ''}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge()}
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Clear
              </button>
            </div>
          </div>

          {statusMessage && (
            <p className={`text-sm rounded-lg p-3 mb-5 border ${
              status === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : status === 'needs_survey'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              {statusMessage}
            </p>
          )}

          {note && (
            <p role="status" className="text-sm rounded-lg p-3 mb-5 border bg-amber-50 border-amber-200 text-amber-800 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{note.text}</span>
            </p>
          )}

          {/* Profile summary for a READY area */}
          {status === 'ready' && activeArea && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Data source</p>
                  <p className="text-sm font-medium text-slate-900">{activeArea.dataSource || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Coordinates</p>
                  <p className="text-sm font-medium text-slate-900">
                    {Number(activeArea.lat).toFixed(4)}, {Number(activeArea.lng).toFixed(4)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <p className="text-sm font-medium text-slate-900">{activeArea.status || 'READY'}</p>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-5">
                <p className="text-xs text-slate-600 mb-1">{CO2_SCOPE.label}</p>
                <p className="text-2xl font-bold text-primary-800">
                  {hasPrediction ? `${formatTonnesPerDay(activeArea.baselineCo2)} ${CO2_UNIT}` : 'Not available'}
                </p>
                <p className="text-xs text-slate-600 mt-2">{CO2_SCOPE.description}</p>
              </div>

              {activeArea.features && (
                <details className="mb-5">
                  <summary className="text-sm font-medium text-slate-700 cursor-pointer">
                    View area inputs used for the prediction
                  </summary>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    {[
                      ['Population (2021 est.)', activeArea.features.population_2021_est, 'people'],
                      ['Area', activeArea.features.area_km2, 'km²'],
                      ['Population density', activeArea.features.population_density_2021, 'people/km²'],
                      ['Estimated vehicles', activeArea.features.estimated_city_vehicles, 'vehicles'],
                      ['Vehicle density', activeArea.features.vehicle_density_km2, 'vehicles/km²'],
                      ['Electricity per capita', activeArea.features.electricity_kwh_per_capita, 'kWh'],
                      ['Industrial electricity per capita', activeArea.features.industrial_electricity_kwh_per_capita, 'kWh'],
                      ['Mean temperature', activeArea.features.temperature_mean, '°C'],
                    ].map(([label, value, unit]) => (
                      <div key={label} className="flex justify-between border-b border-slate-100 py-1">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-medium text-slate-800">
                          {value === null || value === undefined
                            ? '—'
                            : `${Number(value).toLocaleString('en-IN')} ${unit}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" icon={Map} onClick={() => navigate('/digital-twin')}>
                  Open Digital Twin
                </Button>
                <Button variant="outline" icon={ArrowRight} onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}

          {/* Prompt to run the survey */}
          {status === 'needs_survey' && (
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={Database} onClick={requestProfile}>
                Complete Area Profile
              </Button>
              <Button variant="outline" onClick={() => navigate('/digital-twin')}>
                Open Digital Twin
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Fetching data for this area…
            </p>
          )}
        </div>
      )}

      <SurveyModal
        isOpen={showSurvey}
        onClose={closeSurvey}
        onSubmit={handleSurveySubmit}
        locationData={surveyData}
        submitting={isSubmitting}
        error={surveyError}
      />
    </div>
  );
};

export default AreaProfilePage;

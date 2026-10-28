import React from 'react';
import { Search } from 'lucide-react';
import SurveyModal from './SurveyModal';
import useLocationProfile from '../../hooks/useLocationProfile';

const LocationSearch = () => {
  const {
    query,
    setQuery,
    results,
    isSearching,
    searchError,
    showSurvey,
    surveyData,
    isSubmitting,
    surveyError,
    selectLocation,
    handleSurveySubmit,
    closeSurvey,
  } = useLocationProfile();

  return (
    <div className="relative">
      <div className="hidden md:flex items-center relative z-20">
        <Search size={18} className="absolute left-3 text-slate-400" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Indian City..." 
          className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
        />
        {isSearching && <div className="absolute right-3 text-xs text-slate-400">...</div>}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <div 
              key={`${r.name}-${r.state}-${i}`} 
              className="p-2 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-0"
              onClick={() => selectLocation(r)}
            >
              <div className="font-medium text-slate-800">{r.name}</div>
              <div className="text-xs text-slate-500">{r.state}</div>
            </div>
          ))}
        </div>
      )}

      {searchError && (
        <div role="alert" className="absolute top-full left-0 mt-1 w-72 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2 z-50">
          {searchError}
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

export default LocationSearch;

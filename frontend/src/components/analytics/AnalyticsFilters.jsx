import React, { useState, useEffect } from 'react';
import Dropdown from '../common/Dropdown';
import { getAreaEmissions } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useAnalyticsFilters } from '../../context/AnalyticsFiltersContext';

const AnalyticsFilters = () => {
  const { location } = useLocation();
  const { area, setArea, startDate, endDate, setStartDate, setEndDate } = useAnalyticsFilters();
  const [areaEmissions, setAreaEmissions] = useState([]);
  const [draft, setDraft] = useState({ area: 'all', startDate: '', endDate: '' });

  useEffect(() => {
    let cancelled = false;
    getAreaEmissions(location?.city)
      .then((res) => { if (!cancelled) setAreaEmissions(Array.isArray(res) ? res : []); })
      .catch((e) => { console.error(e); if (!cancelled) setAreaEmissions([]); });
    return () => { cancelled = true; };
  }, [location]);

  // Keep the draft in sync with the applied filters.
  useEffect(() => {
    setDraft({ area, startDate, endDate });
  }, [area, startDate, endDate]);

  // A specific area belongs to one city, so clear it when the active area changes.
  useEffect(() => {
    setArea('all');
  }, [location?.city, setArea]);

  const areas = [
    { value: 'all', label: 'All Areas' },
    ...areaEmissions.map((a) => ({ value: a.area, label: a.area })),
  ];

  const invalidRange = draft.startDate && draft.endDate && draft.startDate > draft.endDate;

  const apply = () => {
    if (invalidRange) return;
    setArea(draft.area);
    setStartDate(draft.startDate);
    setEndDate(draft.endDate);
  };

  const reset = () => {
    setDraft({ area: 'all', startDate: '', endDate: '' });
    setArea('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-row flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="analytics-from">From Date</label>
        <input
          id="analytics-from"
          name="fromDate"
          type="date"
          value={draft.startDate}
          onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
          className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="analytics-to">To Date</label>
        <input
          id="analytics-to"
          name="toDate"
          type="date"
          value={draft.endDate}
          onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
          className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-900"
        />
      </div>
      <div className="flex flex-col gap-1 min-w-[200px]">
        <label className="text-sm font-medium text-slate-700" htmlFor="analytics-area">Area</label>
        <Dropdown
          value={draft.area}
          onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}
          options={areas}
        />
      </div>
      <button
        type="button"
        onClick={apply}
        disabled={invalidRange}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Apply Filters
      </button>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
      >
        Reset
      </button>
      {invalidRange && (
        <p role="alert" className="text-xs text-red-600 w-full">"From Date" must not be after "To Date".</p>
      )}
    </div>
  );
};

export default AnalyticsFilters;

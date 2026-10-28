// src/context/AnalyticsFiltersContext.jsx
import React, { createContext, useContext, useMemo, useState } from 'react';

const AnalyticsFiltersContext = createContext(null);

export const useAnalyticsFilters = () =>
  useContext(AnalyticsFiltersContext) || { area: 'all', startDate: '', endDate: '', setArea: () => {}, setStartDate: () => {}, setEndDate: () => {} };

export const AnalyticsFiltersProvider = ({ children }) => {
  const [area, setArea] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const value = useMemo(
    () => ({ area, setArea, startDate, setStartDate, endDate, setEndDate }),
    [area, startDate, endDate]
  );

  return (
    <AnalyticsFiltersContext.Provider value={value}>
      {children}
    </AnalyticsFiltersContext.Provider>
  );
};

export default AnalyticsFiltersContext;

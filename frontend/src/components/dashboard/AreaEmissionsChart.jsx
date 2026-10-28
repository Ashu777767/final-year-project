import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { getAreaEmissions } from '../../services/api';
import ChartCard from '../common/ChartCard';

import { useLocation } from '../../context/LocationContext';
import { useAnalyticsFilters } from '../../context/AnalyticsFiltersContext';

const AreaEmissionsChart = () => {
  const { location } = useLocation();
  const { area: selectedArea } = useAnalyticsFilters();
  const [areaEmissions, setAreaEmissions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getAreaEmissions(location?.city)
      .then((res) => { if (!cancelled) setAreaEmissions(Array.isArray(res) ? res : []); })
      .catch((e) => { console.error(e); if (!cancelled) setAreaEmissions([]); });
    return () => { cancelled = true; };
  }, [location]);

  // When a specific area is selected, keep the bar slot but hide the others so
  // the axis stays stable and the change is obvious.
  const isDimmed = (entry) => selectedArea && selectedArea !== 'all' && entry.area !== selectedArea;

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return '#dc2626';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#16a34a';
      default: return '#94a3b8';
    }
  };

  return (
    <ChartCard
      title="Modelled CO₂ by Zone"
      subtitle={location?.city ? `Derived zones for ${location.city} — not neighbourhood boundaries` : 'Derived modelled zones'}
    >
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={areaEmissions} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="area" angle={-35} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
            <YAxis
              label={{ value: 'Tonnes CO₂/day', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              formatter={(value) => [`${Number(value).toFixed(2)} tonnes/day`, 'Modelled area CO₂']}
              contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
            />
            <Bar dataKey="emissions">
              {areaEmissions.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} fillOpacity={isDimmed(entry) ? 0.18 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        The dataset has no locality names, so these are modelled zones derived from the area's observed
        mean — not real neighbourhoods or administrative wards.
      </p>
    </ChartCard>
  );
};

export default AreaEmissionsChart;

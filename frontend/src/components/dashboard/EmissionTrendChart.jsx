import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip, Legend } from 'recharts';
import { getEmissionTrends } from '../../services/api';
import ChartCard from '../common/ChartCard';

import { useLocation } from '../../context/LocationContext';
import { useAnalyticsFilters } from '../../context/AnalyticsFiltersContext';
import { CO2_UNIT } from '../../utils/co2Scope';

/**
 * Each point is the MEAN modelled CO2 of the sampled locations in that month, in
 * tonnes/day - the same scope and unit as the headline prediction. It is not a
 * monthly total and not a city-wide inventory.
 */
const EmissionTrendChart = () => {
  const { location } = useLocation();
  const { startDate, endDate } = useAnalyticsFilters();
  const [emissionTrends, setEmissionTrends] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getEmissionTrends(location?.city, startDate, endDate)
      .then((res) => { if (!cancelled) setEmissionTrends(Array.isArray(res) ? res : []); })
      .catch((e) => { console.error(e); if (!cancelled) setEmissionTrends([]); });
    return () => { cancelled = true; };
  }, [location, startDate, endDate]);

  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    const emission = payload.find((p) => p.dataKey === 'emissions');
    const capture = payload.find((p) => p.dataKey === 'captured');
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 text-xs">
        <p className="font-medium text-slate-800 mb-1">{label}</p>
        {emission && (
          <p className="text-slate-700">
            Modelled area CO₂: <span className="font-medium">{Number(emission.value).toFixed(2)}</span> {CO2_UNIT}
          </p>
        )}
        {capture && (
          <p className="text-slate-500">
            Estimated capture (scenario): <span className="font-medium">{Number(capture.value).toFixed(2)}</span> {CO2_UNIT}
          </p>
        )}
        <p className="text-slate-400 mt-1">Monthly mean of sampled locations</p>
      </div>
    );
  };

  return (
    <ChartCard
      title="Modelled Area CO₂ Trend"
      subtitle="Monthly mean of sampled locations for the active area"
    >
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={emissionTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" />
            <YAxis
              label={{ value: `Tonnes CO₂/day`, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={renderTooltip} />
            <Legend verticalAlign="bottom" height={36}/>
            <Line type="monotone" dataKey="emissions" name="Modelled area CO₂ (t/day)" stroke="#16a34a" strokeWidth={2} />
            <Line type="monotone" dataKey="captured" name="Estimated capture (scenario, t/day)" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Each point is the mean modelled CO₂ of the sampled locations in that month, in tonnes CO₂/day —
        the same scope and unit as the headline prediction. "Estimated capture" is a derived scenario
        assumption; it is not measured capture data.
      </p>
    </ChartCard>
  );
};

export default EmissionTrendChart;

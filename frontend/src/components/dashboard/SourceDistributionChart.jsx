import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { getSourceDistribution } from '../../services/api';
import ChartCard from '../common/ChartCard';

import { useLocation } from '../../context/LocationContext';
import { useAnalyticsFilters } from '../../context/AnalyticsFiltersContext';

const SourceDistributionChart = () => {
  const { location } = useLocation();
  const { startDate, endDate } = useAnalyticsFilters();
  const [sourceDistribution, setSourceDistribution] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getSourceDistribution(location?.city, startDate, endDate)
      .then((res) => { if (!cancelled) setSourceDistribution(Array.isArray(res) ? res : []); })
      .catch((e) => { console.error(e); if (!cancelled) setSourceDistribution([]); });
    return () => { cancelled = true; };
  }, [location, startDate, endDate]);

  const total = sourceDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard title="Modelled Emission Sources" subtitle="Modelled share by sector">
      <div className="h-[280px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sourceDistribution}
              dataKey="value"
              nameKey="source"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
            >
              {sourceDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-sm text-slate-500 font-medium">Total</span>
          <span className="text-xl font-bold text-slate-900">{total}%</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Shares are modelled: transport and industrial are derived from the area's vehicle density and
        industrial electricity use; residential and commercial take the remainder. Not a measured inventory.
      </p>
    </ChartCard>
  );
};

export default SourceDistributionChart;

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { getTrafficVsCo2 } from '../../services/api';
import ChartCard from '../common/ChartCard';

import { useLocation } from '../../context/LocationContext';
import { useAnalyticsFilters } from '../../context/AnalyticsFiltersContext';

const TrafficVsCo2Chart = () => {
  const { location } = useLocation();
  const { startDate, endDate } = useAnalyticsFilters();
  const [trafficVsCo2Data, setTrafficVsCo2Data] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getTrafficVsCo2(location?.city, startDate, endDate)
      .then((res) => { if (!cancelled) setTrafficVsCo2Data(Array.isArray(res) ? res : []); })
      .catch((e) => { console.error(e); if (!cancelled) setTrafficVsCo2Data([]); });
    return () => { cancelled = true; };
  }, [location, startDate, endDate]);

  return (
    <ChartCard title="Traffic vs CO₂ Correlation">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trafficVsCo2Data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="hour" />
            <YAxis yAxisId="left" stroke="#0ea5e9" />
            <YAxis yAxisId="right" orientation="right" stroke="#16a34a" />
            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} />
            <Legend verticalAlign="bottom" height={36} />
            <Line yAxisId="left" type="monotone" dataKey="traffic" name="Traffic Volume" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="co2" name="CO₂ Level" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default TrafficVsCo2Chart;

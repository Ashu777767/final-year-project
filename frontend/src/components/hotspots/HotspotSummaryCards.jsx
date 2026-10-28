import React, { useState, useEffect } from 'react';
import { Flame, AlertTriangle, Activity } from 'lucide-react';
import KpiCard from '../common/KpiCard';
import { getHotspots } from '../../services/api';
import { useLocation } from '../../context/LocationContext';

const HotspotSummaryCards = () => {
  const { location } = useLocation();
  const [recentHotspots, setRecentHotspots] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getHotspots(location?.city, location?.lat, location?.lng, location?.dataSource, location?.baselineCo2 || undefined)
      .then((res) => { if (!cancelled) setRecentHotspots(Array.isArray(res) ? res : []); })
      .catch((e) => { console.error(e); if (!cancelled) setRecentHotspots([]); });
    return () => { cancelled = true; };
  }, [location]);

  const totalHotspots = recentHotspots.length;
  const highestCo2Hotspot = recentHotspots.reduce(
    (max, current) => (current.co2Level > max.co2Level ? current : max),
    recentHotspots[0] || { area: 'N/A', co2Level: 0 }
  );
  const averageCo2 =
    totalHotspots > 0
      ? Math.round(
          recentHotspots.reduce((sum, h) => sum + h.co2Level, 0) / totalHotspots
        )
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <KpiCard
        label="Total Hotspots"
        value={totalHotspots}
        unit="areas"
        icon={Flame}
        iconBg="bg-orange-50"
      />
      <KpiCard
        label="Highest Modelled CO₂ Area"
        value={highestCo2Hotspot.area}
        unit={`${(highestCo2Hotspot.co2Level / 1000).toFixed(2)} tonnes/day`}
        icon={AlertTriangle}
        iconBg="bg-red-50"
      />
      <KpiCard
        label="Average Modelled CO₂"
        value={(averageCo2 / 1000).toFixed(2)}
        unit="tonnes/day"
        icon={Activity}
        iconBg="bg-blue-50"
      />
    </div>
  );
};

export default HotspotSummaryCards;

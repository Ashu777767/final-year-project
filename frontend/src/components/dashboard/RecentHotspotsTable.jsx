import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import { getHotspots } from '../../services/api';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { useLocation } from '../../context/LocationContext';
import { formatZoneCo2 } from '../../utils/co2Scope';

const RecentHotspotsTable = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getHotspots(location?.city, location?.lat, location?.lng, location?.dataSource, location?.baselineCo2 || undefined)
      .then((res) => { if (!cancelled) setHotspots(Array.isArray(res) ? res : []); })
      .catch((e) => { console.error(e); if (!cancelled) setHotspots([]); });
    return () => { cancelled = true; };
  }, [location]);

  const displayHotspots = hotspots.slice(0, 5);

  const getTrendDisplay = (trend) => {
    switch (trend) {
      case 'Rising':
        return <span className="flex items-center text-red-600"><TrendingUp className="w-4 h-4 mr-1" /> Rising</span>;
      case 'Falling':
        return <span className="flex items-center text-green-600"><TrendingDown className="w-4 h-4 mr-1" /> Falling</span>;
      case 'Stable':
      default:
        return <span className="flex items-center text-amber-600"><Minus className="w-4 h-4 mr-1" /> Stable</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-900">Recent Hotspots</h3>
        <button onClick={() => navigate('/hotspots')} className="text-sm text-green-600 hover:text-green-700 font-medium">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Area</th>
              <th className="px-6 py-3 font-medium">Modelled area CO₂</th>
              <th className="px-6 py-3 font-medium">Risk</th>
              <th className="px-6 py-3 font-medium">Trend</th>
              <th className="px-6 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {displayHotspots.map((hotspot) => (
              <tr key={hotspot.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-900">{hotspot.area}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{formatZoneCo2(hotspot.co2Level)} <span className="text-xs font-normal text-slate-500">t/day</span></td>
                <td className="px-6 py-4">
                  <StatusBadge status={hotspot.risk} />
                </td>
                <td className="px-6 py-4">{getTrendDisplay(hotspot.trend)}</td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/hotspots')} className="text-slate-500 hover:text-slate-700">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentHotspotsTable;

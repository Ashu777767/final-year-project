import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { getHotspots, getHotspotDetail } from '../../services/api';
import { useLocation } from '../../context/LocationContext';

const HotspotTable = ({ onSelectHotspot }) => {
  const { location } = useLocation();
  const [recentHotspots, setRecentHotspots] = useState([]);
  const [hotspotDetails, setHotspotDetails] = useState({});

  useEffect(() => {
    let cancelled = false;
    setHotspotDetails({});
    const baseline = location?.baselineCo2 || undefined;
    getHotspots(location?.city, location?.lat, location?.lng, location?.dataSource, baseline).then(async (hotspots) => {
      if (cancelled) return;
      const list = Array.isArray(hotspots) ? hotspots : [];
      setRecentHotspots(list);
      const details = {};
      await Promise.all(
        list.map(async (h) => {
          try {
            const detail = await getHotspotDetail(h.id, location?.city, location?.lat, location?.lng, location?.dataSource, baseline);
            if (detail) details[h.id] = detail;
          } catch (e) {
            console.error(`Failed to fetch detail for hotspot ${h.id}`, e);
          }
        })
      );
      if (!cancelled) setHotspotDetails(details);
    }).catch((e) => {
      console.error(e);
      if (!cancelled) setRecentHotspots([]);
    });
    return () => { cancelled = true; };
  }, [location]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">Hotspot Analysis</h2>
        <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {recentHotspots.length} Total
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-medium">Area</th>
              <th className="px-6 py-3 font-medium">Modelled area CO₂ (tonnes/day)</th>
              <th className="px-6 py-3 font-medium">Severity</th>
              <th className="px-6 py-3 font-medium">Main Factor</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {recentHotspots.map((hotspot) => {
              const details = hotspotDetails[hotspot.id] || {};
              const mainFactor = details.factors ? details.factors[0] : hotspot.risk;
              
              return (
                <tr
                  key={hotspot.id}
                  className="bg-white border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onSelectHotspot(hotspot.id)}
                >
                  <td className="px-6 py-4 font-medium text-slate-900">{hotspot.area}</td>
                  <td className="px-6 py-4 text-slate-600">{(hotspot.co2Level / 1000).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={hotspot.risk} />
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{mainFactor}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHotspot(hotspot.id);
                      }}
                      icon={Eye}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotspotTable;

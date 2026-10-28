import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, TrendingUp, TrendingDown, TreePine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { getHotspotDetail } from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { CO2_SCOPE, formatZoneCo2 } from '../../utils/co2Scope';

const HotspotDetailPanel = ({ hotspotId, onClose }) => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!hotspotId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    getHotspotDetail(hotspotId, location?.city, location?.lat, location?.lng, location?.dataSource, location?.baselineCo2 || undefined)
      .then((res) => { if (!cancelled) setDetail(res); })
      .catch((e) => { console.error(e); if (!cancelled) setDetail(null); });
    return () => { cancelled = true; };
  }, [hotspotId, location]);

  if (!hotspotId || !detail) return null;

  const trendData = detail.trend?.map((value, i) => ({ day: i, value })) || [];

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl border-l border-slate-200 overflow-y-auto z-40 transform transition-transform">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900">{detail.area}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-500 mb-1">
            {detail.zoneKind === 'modelled' ? 'Modelled hotspot zone — modelled area CO₂' : 'Modelled hotspot at sampled location'}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900">{formatZoneCo2(detail.co2Level)}</span>
            <span className="text-slate-500 font-medium">tonnes/day</span>
            <StatusBadge status={detail.severity} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{CO2_SCOPE.notCityTotal}</p>
        </div>

        {trendData.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700 mb-2">Indicative Trend</p>
            <div className="h-20 bg-slate-50 rounded-lg p-2 border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#16a34a"
                    fill="#dcfce7"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Illustrative shape around the sampled level — the dataset has no recorded history for this location.
            </p>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Traffic Level</span>
            <span className="text-sm font-medium text-slate-900 capitalize">{detail.trafficLevel}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Industrial Activity</span>
            <span className="text-sm font-medium text-slate-900 capitalize">{detail.industrialActivity}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Green Cover</span>
            <span className="text-sm font-medium text-slate-900">{detail.greenCover}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Contributing Factors</h3>
          <ul className="space-y-2">
            {detail.factors?.map((factor, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="capitalize">{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-900 mb-2">Recommended Intervention</h3>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-800">{detail.recommendedIntervention}</p>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={() => navigate('/simulator')}
        >
          Simulate Intervention
        </Button>
      </div>
    </div>
  );
};

export default HotspotDetailPanel;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, AlertTriangle, TrendingDown, Clock, DollarSign, Wrench, ChevronRight, Brain } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import { getRecommendations } from '../services/api';

import { useLocation } from '../context/LocationContext';
import { formatZoneCo2 } from '../utils/co2Scope';

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getRecommendations(location?.features, location?.city)
      .then((res) => { if (!cancelled) setRecommendations(Array.isArray(res) ? res : []); })
      .catch((e) => { console.error(e); if (!cancelled) setRecommendations([]); });
    return () => { cancelled = true; };
  }, [location]);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader
        title="AI Recommendations"
        subtitle="Intelligent intervention suggestions based on emission analysis"
      />

      <div className="space-y-6">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{rec.hotspot}</h3>
                <StatusBadge status={rec.risk} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-sm font-medium text-slate-700">
                <span className="text-slate-500">Estimated impact:</span>
                <span className="text-primary-700">{rec.expectedImpact}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Modelled area CO₂</p>
                <p className="text-sm font-medium text-slate-900">{formatZoneCo2(rec.co2Level)} tonnes/day</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Traffic</p>
                <p className="text-sm font-medium text-slate-900 capitalize">{rec.traffic}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Risk</p>
                <p className={`text-sm font-medium capitalize ${
                  rec.risk === 'Critical' || rec.risk === 'High' ? 'text-red-600' :
                  rec.risk === 'Medium' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {rec.risk}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Recommended</p>
                <p className="text-sm font-medium text-primary-700 capitalize">{rec.recommended}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-900">Why This Intervention?</h4>
                </div>
                <p className="text-sm text-slate-600">{rec.reasoning}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-green-100 text-green-600 rounded-full">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-900">Estimated CO₂ Reduction (model-based)</h4>
                </div>
                <p className="text-sm text-green-700 font-medium">{rec.expectedReduction}</p>
                <p className="text-xs text-slate-500 mt-1">Projected from the modelled area value; not a measured result.</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-900">Implementation Difficulty</h4>
                </div>
                <p className="text-sm text-slate-600 capitalize">{rec.difficulty}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-purple-100 text-purple-600 rounded-full">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-900">Estimated Cost & Timeline</h4>
                </div>
                <p className="text-sm text-slate-600">
                  {rec.estimatedCost} | <Clock className="w-3 h-3 inline mr-1 text-slate-400" />{rec.timeframe}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => navigate('/digital-twin', { state: { lat: rec.lat, lng: rec.lng }})} className="mr-2">View on Map</Button> <Button variant="primary" onClick={() => navigate('/simulator', { state: { interventionType: rec.recommended }})} icon={ChevronRight}>
                Simulate This Intervention
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPage;


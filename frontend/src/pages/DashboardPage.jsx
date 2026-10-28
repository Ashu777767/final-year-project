import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Wind, Flame, TrendingUp, Building2, ArrowRight } from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import EmissionTrendChart from '../components/dashboard/EmissionTrendChart';
import SourceDistributionChart from '../components/dashboard/SourceDistributionChart';
import AreaEmissionsChart from '../components/dashboard/AreaEmissionsChart';
import RecentHotspotsTable from '../components/dashboard/RecentHotspotsTable';
import Button from '../components/common/Button';
import { getKpiData } from '../services/api';
import { CO2_SCOPE } from '../utils/co2Scope';

import { useLocation } from '../context/LocationContext';

const DashboardPage = () => {
  const { location } = useLocation();
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState(null);

  useEffect(() => {
    const city = location?.city || '';
    const baseline = location?.baselineCo2 || '';
    getKpiData(city, baseline).then(setKpiData).catch(console.error);
  }, [location]);

  if (!kpiData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Entry point for planning a society that has no dataset coverage yet. */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-5 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Plan a New Society</h3>
              <p className="text-sm text-white/85 mt-0.5">
                Estimate the operational CO₂ of a proposed residential society — works even where no city
                dataset exists.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            icon={ArrowRight}
            className="flex-shrink-0 bg-white text-primary-700 hover:bg-white/90"
            onClick={() => navigate('/society-planner')}
          >
            Open Society Planner
          </Button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-800">Scope:</span> {CO2_SCOPE.description}
        </p>
        {location?.city && (
          <p className="text-xs text-slate-500 mt-1">Active area: {location.city}{location.state ? `, ${location.state}` : ''}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={kpiData.totalEmissions.label}
          value={kpiData.totalEmissions.value}
          unit={kpiData.totalEmissions.unit}
          trend={kpiData.totalEmissions.trend}
          icon={Activity}
          iconBg="bg-red-50"
        />
        <KpiCard
          label={kpiData.averageCo2.label}
          value={kpiData.averageCo2.value}
          unit={kpiData.averageCo2.unit}
          trend={kpiData.averageCo2.trend}
          icon={Wind}
          iconBg="bg-blue-50"
        />
        <KpiCard
          label={kpiData.activeHotspots.label}
          value={kpiData.activeHotspots.value}
          unit={kpiData.activeHotspots.unit}
          trend={kpiData.activeHotspots.trend}
          icon={Flame}
          iconBg="bg-orange-50"
        />
        <KpiCard
          label={kpiData.capturePotential.label}
          value={kpiData.capturePotential.value}
          unit={kpiData.capturePotential.unit}
          trend={kpiData.capturePotential.trend}
          icon={TrendingUp}
          iconBg="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmissionTrendChart />
        </div>
        <div className="lg:col-span-1">
          <SourceDistributionChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AreaEmissionsChart />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RecentHotspotsTable />
      </div>
    </div>
  );
};

export default DashboardPage;

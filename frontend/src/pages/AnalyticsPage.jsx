import React from 'react';
import SectionHeader from '../components/common/SectionHeader';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import EmissionTrendChart from '../components/dashboard/EmissionTrendChart';
import SourceDistributionChart from '../components/dashboard/SourceDistributionChart';
import AreaEmissionsChart from '../components/dashboard/AreaEmissionsChart';
import TrafficVsCo2Chart from '../components/analytics/TrafficVsCo2Chart';
import PredictionPlaceholder from '../components/analytics/PredictionPlaceholder';
import { AnalyticsFiltersProvider } from '../context/AnalyticsFiltersContext';

const AnalyticsPage = () => {
  return (
    <AnalyticsFiltersProvider>
      <div className="space-y-6">
        <SectionHeader title="CO₂ Analytics" subtitle="Comprehensive emission analysis and trends" />
        
        <AnalyticsFilters />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmissionTrendChart />
          </div>
          <div className="lg:col-span-1">
            <SourceDistributionChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AreaEmissionsChart />
          <TrafficVsCo2Chart />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <PredictionPlaceholder />
        </div>
      </div>
    </AnalyticsFiltersProvider>
  );
};

export default AnalyticsPage;

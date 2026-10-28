import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HotspotsPage from './pages/HotspotsPage';
import SimulatorPage from './pages/SimulatorPage';
import ScenariosPage from './pages/ScenariosPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AreaProfilePage from './pages/AreaProfilePage';
import SocietyPlannerPage from './pages/SocietyPlannerPage';

import { LocationProvider } from './context/LocationContext';

export default function App() {
  return (
    <LocationProvider>
      <Routes>
        {/* Landing page - no sidebar */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard routes - with sidebar layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/digital-twin" element={<DigitalTwinPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/hotspots" element={<HotspotsPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/area-profile" element={<AreaProfilePage />} />
          <Route path="/society-planner" element={<SocietyPlannerPage />} />
        </Route>
      </Routes>
    </LocationProvider>
  );
}

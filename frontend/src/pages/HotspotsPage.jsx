import React, { useState } from 'react';
import SectionHeader from '../components/common/SectionHeader';
import HotspotSummaryCards from '../components/hotspots/HotspotSummaryCards';
import HotspotTable from '../components/hotspots/HotspotTable';
import HotspotDetailPanel from '../components/hotspots/HotspotDetailPanel';

const HotspotsPage = () => {
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);

  return (
    <div className="relative min-h-full">
      <SectionHeader
        title="CO₂ Hotspots"
        subtitle="Monitor and analyze emission hotspots across the urban area"
      />
      
      <div className="max-w-7xl mx-auto pb-12">
        <HotspotSummaryCards />
        <HotspotTable onSelectHotspot={setSelectedHotspotId} />
      </div>

      {/* Overlay for mobile when panel is open */}
      {selectedHotspotId && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSelectedHotspotId(null)}
        />
      )}

      <HotspotDetailPanel
        hotspotId={selectedHotspotId}
        onClose={() => setSelectedHotspotId(null)}
      />
    </div>
  );
};

export default HotspotsPage;

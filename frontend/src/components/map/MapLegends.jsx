import React from 'react';

const MapLegends = ({ activeLayers }) => {
  return (
    <div className="flex flex-col gap-1 p-2 bg-white bg-opacity-80 rounded-md shadow-sm border border-slate-200 mt-2 max-w-xs">
      {activeLayers.co2 && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#dc2626' }}></span>
          <span>Critical (Red)</span>
          <span className="ml-2 w-4 h-4 inline-block" style={{ backgroundColor: '#ea580c' }}></span>
          <span>High (Orange)</span>
          <span className="ml-2 w-4 h-4 inline-block" style={{ backgroundColor: '#d97706' }}></span>
          <span>Medium (Amber)</span>
          <span className="ml-2 w-4 h-4 inline-block" style={{ backgroundColor: '#16a34a' }}></span>
          <span>Low (Green)</span>
        </div>
      )}
      {activeLayers.traffic && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#dc2626' }}></span>
          <span>Very High Traffic</span>
          <span className="ml-2 w-4 h-4 inline-block" style={{ backgroundColor: '#ea580c' }}></span>
          <span>High Traffic</span>
          <span className="ml-2 w-4 h-4 inline-block" style={{ backgroundColor: '#d97706' }}></span>
          <span>Medium Traffic</span>
          <span className="ml-2 w-4 h-4 inline-block" style={{ backgroundColor: '#16a34a' }}></span>
          <span>Low Traffic</span>
        </div>
      )}
      {activeLayers.hotspots && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#0ea5e9' }}></span>
          <span>Hotspot (Dataset)</span>
          <span className="ml-2 w-4 h-4 inline-block" style={{ backgroundColor: '#6b7280' }}></span>
          <span>Model‑estimated zone</span>
        </div>
      )}
      {activeLayers.capture && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 inline-block" style={{ backgroundColor: '#7c3aed' }}></span>
          <span>Capture Location</span>
        </div>
      )}
    </div>
  );
};

export default MapLegends;

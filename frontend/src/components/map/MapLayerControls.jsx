import React from 'react';
import { Wind, Car, Flame, MapPin } from 'lucide-react';

const MapLayerControls = ({ activeLayers, onToggle }) => {
  const layers = [
    { key: 'co2', label: 'CO₂', icon: Wind },
    { key: 'traffic', label: 'Traffic', icon: Car },
    { key: 'hotspots', label: 'Hotspots', icon: Flame },
    { key: 'capture', label: 'Capture Locations', icon: MapPin }
  ];

  return (
    <div className="flex flex-row gap-2 flex-wrap">
      {layers.map(layer => {
        const Icon = layer.icon;
        const isActive = activeLayers[layer.key];
        
        return (
          <button
            key={layer.key} data-mode={layer.key}
            onClick={() => onToggle(layer.key)}
            className={`
              flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors
              ${isActive 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }
            `}
          >
            <Icon size={16} />
            {layer.label}
          </button>
        );
      })}
    </div>
  );
};

export default MapLayerControls;

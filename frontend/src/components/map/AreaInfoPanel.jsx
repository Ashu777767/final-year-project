import React from 'react';
import { X } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { CO2_SCOPE, CO2_UNIT, tonnesToKg, formatTonnesPerDay } from '../../utils/co2Scope';

const AreaInfoPanel = ({ marker, onClose, onSimulate }) => {
  if (!marker) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full flex items-center justify-center text-center">
        <p className="text-slate-500">Select an area on the map to view details</p>
      </div>
    );
  }

  // marker.co2 arrives in kg/day; the canonical display unit is tonnes/day.
  const tonnesPerDay = Number(marker.co2) / 1000;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 w-full md:w-80 h-full overflow-y-auto flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{marker.area}</h2>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-sm">
        <div className="text-slate-500">{CO2_SCOPE.short}</div>
        <div className="font-medium text-slate-900">{formatTonnesPerDay(tonnesPerDay)} {CO2_UNIT}</div>

        <div className="text-slate-500">Equivalent</div>
        <div className="font-medium text-slate-500">{Math.round(tonnesToKg(tonnesPerDay)).toLocaleString('en-IN')} kg/day</div>
        
        <div className="text-slate-500">Traffic Level</div>
        <div className="font-medium text-slate-900">{marker.traffic}</div>
        
        <div className="text-slate-500">Risk Level</div>
        <div><StatusBadge status={marker.risk} type="risk" /></div>
        
        <div className="text-slate-500">Estimated Emissions</div>
        <div className="font-medium text-slate-900">{marker.estimatedEmissions}</div>
      </div>

      <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2 mb-6">
        {CO2_SCOPE.notCityTotal}
      </p>

      <hr className="border-slate-100 mb-6" />

      <Button variant="primary" className="w-full" onClick={() => onSimulate(marker)}>
        Run Simulation
      </Button>
    </div>
  );
};

export default AreaInfoPanel;

import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { useLocation } from '../../context/LocationContext';
import { CO2_SCOPE, CO2_UNIT, formatTonnesPerDay } from '../../utils/co2Scope';

const interventionTypes = [
  { id: 'Tree Plantation', label: 'Tree Plantation', unit: 'trees', min: 100, max: 100000, step: 100 },
  { id: 'Green Corridor', label: 'Green Corridor', unit: 'km²', min: 1, max: 100, step: 1 },
  { id: 'Traffic Reduction', label: 'Traffic Reduction', unit: '% reduction', min: 5, max: 50, step: 5 },
  { id: 'CO2 Capture Unit', label: 'CO2 Capture Unit', unit: 'units', min: 1, max: 100, step: 1 },
  { id: 'Biofilter', label: 'Biofilter', unit: 'm²', min: 100, max: 50000, step: 100 },
  { id: 'Energy Efficiency', label: 'Energy Efficiency', unit: '% reduction', min: 5, max: 50, step: 5 },
];

const SimulationForm = ({
  area,
  interventionType,
  setInterventionType,
  parameterValue,
  setParameterValue,
  simulate,
  loading,
  reset
}) => {
  const { location } = useLocation();

  const handleInterventionSelect = (id) => {
    setInterventionType(id);
    const selected = interventionTypes.find(t => t.id === id);
    if (selected) {
      setParameterValue(selected.min);
    }
  };

  const selectedType = interventionTypes.find(t => t.id === interventionType);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">Simulation Parameters</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Selected Location</label>
          <div className="w-full border rounded-lg p-3 bg-slate-50 text-slate-700 font-medium text-sm">
            {location ? `${location.city}, ${location.state || 'India'}` : 'No location selected'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Change location from the top search bar.</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">{CO2_SCOPE.label}:</span>
            <span className="text-sm font-bold text-slate-900">
              {location && location.baselineCo2
                ? `${formatTonnesPerDay(location.baselineCo2)} ${CO2_UNIT}`
                : 'Not available for this area'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{CO2_SCOPE.notCityTotal}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Intervention Type</label>
          <div className="grid grid-cols-2 gap-2">
            {interventionTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => handleInterventionSelect(type.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-colors flex items-center justify-center text-center ${
                  interventionType === type.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className={`text-sm font-medium ${
                  interventionType === type.id ? 'text-primary-800' : 'text-slate-700'
                }`}>
                  {type.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {selectedType && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Parameter ({selectedType.unit})
            </label>
            <input 
              type="number"
              min={selectedType.min}
              max={selectedType.max}
              step={selectedType.step}
              value={parameterValue || selectedType.min}
              onChange={(e) => setParameterValue(Number(e.target.value))}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Min: {selectedType.min}</span>
              <span>Max: {selectedType.max}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="primary"
            className="flex-1 justify-center"
            onClick={simulate}
            disabled={!location || !interventionType || loading}
            loading={loading}
          >
            Run Simulation
          </Button>
          <Button
            variant="outline"
            onClick={reset}
            disabled={loading}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimulationForm;

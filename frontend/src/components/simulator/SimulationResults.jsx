import React from 'react';
import { FlaskConical, Loader2 } from 'lucide-react';
import SimulationResultCard from '../common/SimulationResultCard';
import EmptyState from '../common/EmptyState';

const SimulationResults = ({ result, hasRun, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">Simulation Results</h2>
      
      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-slate-500 py-12">
            <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary-500" />
            <p className="text-sm font-medium">Running simulation...</p>
          </div>
        ) : !hasRun ? (
          <EmptyState
            icon={FlaskConical}
            title="No Simulation Run"
            description="Configure parameters and run a simulation to see projected CO₂ reduction results."
          />
        ) : result ? (
          <div className="space-y-4">
             <SimulationResultCard result={result} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SimulationResults;

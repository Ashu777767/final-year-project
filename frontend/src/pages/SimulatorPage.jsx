import React from 'react';
import SectionHeader from '../components/common/SectionHeader';
import SimulationForm from '../components/simulator/SimulationForm';
import SimulationResults from '../components/simulator/SimulationResults';
import useSimulation from '../hooks/useSimulation';

const SimulatorPage = () => {
  const {
    area,
    setArea,
    interventionType,
    setInterventionType,
    intensity, setIntensity, parameterValue, setParameterValue, simulate,
    loading,
    result,
    hasRun,
    reset
  } = useSimulation();

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader
        title="CO₂ Capture Simulator"
        subtitle="Simulate urban interventions and evaluate CO₂ reduction potential"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SimulationForm
            area={area}
            setArea={setArea}
            interventionType={interventionType}
            setInterventionType={setInterventionType}
            intensity={intensity} setIntensity={setIntensity} parameterValue={parameterValue} setParameterValue={setParameterValue}
            simulate={simulate}
            loading={loading}
            reset={reset}
          />
        </div>
        <div>
          <SimulationResults
            result={result}
            hasRun={hasRun}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;


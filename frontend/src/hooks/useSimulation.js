import { useState, useCallback, useEffect } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { runSimulation } from '../services/api';
import { useLocation } from '../context/LocationContext';

// Maps recommendation labels onto the simulator's intervention ids.
const INTERVENTION_ALIASES = {
  'traffic optimization': 'Traffic Reduction',
  'traffic reduction': 'Traffic Reduction',
  'tree plantation': 'Tree Plantation',
  'tree plantation / green corridor': 'Green Corridor',
  'green corridor': 'Green Corridor',
  'co2 capture unit': 'CO2 Capture Unit',
  'biofilter': 'Biofilter',
  'energy efficiency': 'Energy Efficiency',
};

const resolveInterventionId = (label) => {
  if (!label) return null;
  return INTERVENTION_ALIASES[String(label).trim().toLowerCase()] || null;
};

const useSimulation = () => {
  const { location } = useLocation();
  const routerLocation = useRouterLocation();
  const [area, setArea] = useState('');
  const [interventionType, setInterventionType] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [parameterValue, setParameterValue] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (location) {
      setArea(location.city);
    }
  }, [location]);

  // Honour the "Simulate This Intervention" hand-off from Recommendations.
  useEffect(() => {
    const requested = resolveInterventionId(routerLocation.state?.interventionType);
    if (requested) {
      setInterventionType(requested);
    }
  }, [routerLocation.state]);

  const simulate = useCallback(async () => {
    if (!area || !interventionType) return;
    setLoading(true);
    try {
      const res = await runSimulation({ 
        area, 
        interventionType, 
        intensity,
        parameterValue,
        baselineCo2: location ? location.baselineCo2 : 3.0
      });
      setResult(res);
      setHasRun(true);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  }, [area, interventionType, intensity, parameterValue, location]);

  const reset = useCallback(() => {
    setArea(location ? location.city : '');
    setInterventionType('');
    setIntensity(50);
    setParameterValue(null);
    setResult(null);
    setHasRun(false);
  }, [location]);

  return {
    area,
    setArea,
    interventionType,
    setInterventionType,
    intensity,
    setIntensity,
    parameterValue,
    setParameterValue,
    result,
    loading,
    hasRun,
    simulate,
    reset,
  };
};

export default useSimulation;

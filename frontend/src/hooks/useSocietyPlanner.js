// src/hooks/useSocietyPlanner.js
//
// State for the "Plan a New Society" flow.
//
// Deliberately independent of LocationContext: planning a proposed society must NOT
// change the app's active city, and the active city must not leak into the plan. The
// hook owns its own form state, validation and persistence, while reusing the app's
// existing location-resolution API to turn a locality/PIN into coordinates.

import { useCallback, useEffect, useState } from 'react';
import { getSocietyPlan, getSocietyScenarios, resolveLocation } from '../services/api';

/** Bumped when the stored design shape changes, so stale designs are discarded. */
const STORAGE_KEY = 'society_plan_v1_design';

export const EMPTY_SOCIETY_DESIGN = {
  societyName: '',
  locationQuery: '',
  city: '',
  state: '',
  latitude: '',
  longitude: '',
  resolution: null,

  population: '',
  households: '',

  area: '',
  areaUnit: 'acres',

  petrolVehicles: '',
  dieselVehicles: '',
  electricVehicles: '',

  // Labelled assumptions: shown in the form, pre-filled, and editable.
  kmPerVehiclePerDay: '30',
  petrolKmPerLitre: '15',
  dieselKmPerLitre: '17',
  electricKwhPerKm: '0.15',

  electricityKwhPerDay: '',
  commonFacilityElectricityKwhPerDay: '',
  solarGenerationKwhPerDay: '',

  treeCount: '',
  greenCoverArea: '',

  treeSequestrationKgPerTreePerYear: '',
  treeSequestrationSource: '',

  additionalFuelLitresPerDay: '',
  additionalFuelType: 'diesel',

  includeModelEstimate: false,
};

export const DEFAULT_SCENARIO_INPUTS = {
  electricityReductionPercent: 20,
  solarMultiplier: 2,
  evShiftPercent: 50,
  travelReductionPercent: 10,
  additionalTrees: 500,
};

const numeric = (v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** Turns the string form state into the API payload, omitting blanks rather than zeroing them. */
export const toPlanPayload = (form) => ({
  societyName: String(form.societyName || '').trim(),
  locationQuery: String(form.locationQuery || '').trim() || undefined,
  city: String(form.city || '').trim() || undefined,
  state: String(form.state || '').trim() || undefined,
  latitude: numeric(form.latitude),
  longitude: numeric(form.longitude),
  resolution: form.resolution || 'manual',

  population: numeric(form.population),
  households: numeric(form.households),

  area: numeric(form.area),
  areaUnit: form.areaUnit,

  petrolVehicles: numeric(form.petrolVehicles),
  dieselVehicles: numeric(form.dieselVehicles),
  electricVehicles: numeric(form.electricVehicles),

  kmPerVehiclePerDay: numeric(form.kmPerVehiclePerDay),
  petrolKmPerLitre: numeric(form.petrolKmPerLitre),
  dieselKmPerLitre: numeric(form.dieselKmPerLitre),
  electricKwhPerKm: numeric(form.electricKwhPerKm),

  electricityKwhPerDay: numeric(form.electricityKwhPerDay),
  commonFacilityElectricityKwhPerDay: numeric(form.commonFacilityElectricityKwhPerDay),
  solarGenerationKwhPerDay: numeric(form.solarGenerationKwhPerDay),

  treeCount: numeric(form.treeCount),
  greenCoverArea: numeric(form.greenCoverArea),

  treeSequestrationKgPerTreePerYear: numeric(form.treeSequestrationKgPerTreePerYear),
  treeSequestrationSource: String(form.treeSequestrationSource || '').trim() || undefined,

  additionalFuelLitresPerDay: numeric(form.additionalFuelLitresPerDay),
  additionalFuelType: form.additionalFuelType,

  includeModelEstimate: Boolean(form.includeModelEstimate),
});

/** Client-side checks that mirror the backend, so obvious mistakes are caught instantly. */
export const validateDesign = (form) => {
  const errors = {};

  if (!String(form.societyName || '').trim()) {
    errors.societyName = 'Give the society a name so the plan is identifiable.';
  }

  const lat = numeric(form.latitude);
  const lng = numeric(form.longitude);
  if (lat === undefined || lng === undefined) {
    errors.location = 'Resolve the location, or enter latitude and longitude manually.';
  } else if (lat < 6 || lat > 38 || lng < 68 || lng > 98) {
    errors.location = 'Coordinates must be inside India (latitude 6–38, longitude 68–98).';
  }

  const pop = numeric(form.population);
  if (pop === undefined) errors.population = 'Planned resident population is required.';
  else if (pop <= 0) errors.population = 'Population must be greater than zero.';

  const hh = numeric(form.households);
  if (hh === undefined) errors.households = 'Number of houses/flats is required.';
  else if (hh <= 0) errors.households = 'Houses/flats must be greater than zero.';

  const area = numeric(form.area);
  if (area === undefined) errors.area = 'Total land area is required.';
  else if (area <= 0) errors.area = 'Land area must be greater than zero.';

  if (!['acres', 'hectares', 'km2'].includes(form.areaUnit)) {
    errors.areaUnit = 'Choose acres, hectares or km².';
  }

  const elec = numeric(form.electricityKwhPerDay);
  if (elec === undefined) errors.electricityKwhPerDay = 'Daily electricity consumption is required (enter 0 if none).';
  else if (elec < 0) errors.electricityKwhPerDay = 'Electricity cannot be negative.';

  const nonNegative = [
    ['commonFacilityElectricityKwhPerDay', 'Common-facility electricity'],
    ['solarGenerationKwhPerDay', 'Solar generation'],
    ['greenCoverArea', 'Green-cover area'],
    ['additionalFuelLitresPerDay', 'Additional fuel'],
    ['treeCount', 'Tree count'],
  ];
  nonNegative.forEach(([key, label]) => {
    const v = numeric(form[key]);
    if (v !== undefined && v < 0) errors[key] = `${label} cannot be negative.`;
  });

  ['petrolVehicles', 'dieselVehicles', 'electricVehicles'].forEach((key) => {
    const v = numeric(form[key]);
    if (v !== undefined && v < 0) errors[key] = 'Vehicle counts cannot be negative.';
  });

  // A vehicle count with no daily distance would silently fall back to an assumption;
  // the backend labels that, so only guard against impossible values here.
  ['kmPerVehiclePerDay', 'petrolKmPerLitre', 'dieselKmPerLitre', 'electricKwhPerKm'].forEach((key) => {
    const v = numeric(form[key]);
    if (v !== undefined && v <= 0) errors[key] = 'Must be greater than zero.';
  });

  const seq = numeric(form.treeSequestrationKgPerTreePerYear);
  if (seq !== undefined && seq <= 0) {
    errors.treeSequestrationKgPerTreePerYear = 'Must be greater than zero, or left blank.';
  }
  if (seq !== undefined && !String(form.treeSequestrationSource || '').trim()) {
    errors.treeSequestrationSource = 'State where this sequestration factor comes from, so it can be reviewed.';
  }

  return errors;
};

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return { ...EMPTY_SOCIETY_DESIGN, ...parsed };
  } catch (e) {
    console.error('Failed to read the saved society design', e);
    return null;
  }
};

const useSocietyPlanner = () => {
  const [form, setForm] = useState(() => readStored() || EMPTY_SOCIETY_DESIGN);
  const [errors, setErrors] = useState({});
  const [plan, setPlan] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [scenarioInputs, setScenarioInputs] = useState(DEFAULT_SCENARIO_INPUTS);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isScenariosLoading, setIsScenariosLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const [isResolving, setIsResolving] = useState(false);
  const [resolveMessage, setResolveMessage] = useState(null);
  const [resolveError, setResolveError] = useState(null);

  // Persist the design as it is edited, so a page switch does not lose the work.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch (e) {
      console.error('Failed to save the society design', e);
    }
  }, [form]);

  const updateField = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setForm(EMPTY_SOCIETY_DESIGN);
    setErrors({});
    setPlan(null);
    setScenarios([]);
    setServerError(null);
    setResolveError(null);
    setResolveMessage(null);
  }, []);

  /** Resolves the typed locality / PIN / city into coordinates using the existing API. */
  const resolveCoordinates = useCallback(async () => {
    const query = String(form.locationQuery || '').trim();
    if (!query) {
      setResolveError('Enter a locality, city or PIN code first, or type the coordinates manually.');
      return;
    }
    setIsResolving(true);
    setResolveError(null);
    setResolveMessage(null);
    try {
      // The query may be a PIN, a locality, or a city; the resolver tries each interpretation
      // in order and reports which one worked. It never invents coordinates.
      const isPincode = /^\d{6}$/.test(query);
      const res = await resolveLocation({
        areaName: form.societyName || query,
        pincode: isPincode ? query : undefined,
        locality: isPincode ? undefined : query,
        city: form.city || undefined,
        state: form.state || undefined,
      });

      if (!res || !res.resolved) {
        setResolveError(res && res.message
          ? res.message
          : 'We could not locate that area. Enter latitude and longitude manually to continue.');
        return;
      }

      setForm((f) => ({
        ...f,
        latitude: String(res.latitude),
        longitude: String(res.longitude),
        city: f.city || res.city || res.name || '',
        state: f.state || res.state || '',
        resolution: res.resolution || 'locality',
      }));
      setErrors((e) => {
        const next = { ...e };
        delete next.location;
        return next;
      });
      setResolveMessage(
        `Located via ${res.resolution || 'lookup'}: ${Number(res.latitude).toFixed(4)}, ${Number(res.longitude).toFixed(4)}`
      );
    } catch (e) {
      console.error('Society location resolve failed', e);
      setResolveError(`Could not resolve the location. ${e.message}`);
    } finally {
      setIsResolving(false);
    }
  }, [form.locationQuery, form.societyName, form.city, form.state]);

  const runPlan = useCallback(async () => {
    const validation = validateDesign(form);
    setErrors(validation);
    setServerError(null);
    if (Object.keys(validation).length > 0) {
      return null;
    }
    setIsPlanning(true);
    try {
      const payload = toPlanPayload(form);
      const result = await getSocietyPlan(payload);
      setPlan(result);
      // Scenarios use the same design; recalculate them so the comparison stays in step.
      try {
        setIsScenariosLoading(true);
        const scenarioResult = await getSocietyScenarios({ design: payload, ...scenarioInputs });
        setScenarios(Array.isArray(scenarioResult) ? scenarioResult : []);
      } catch (e) {
        console.error('Scenario calculation failed', e);
        setScenarios([]);
      } finally {
        setIsScenariosLoading(false);
      }
      return result;
    } catch (e) {
      console.error('Society plan failed', e);
      setServerError(e.message || 'The estimate could not be calculated.');
      setPlan(null);
      setScenarios([]);
      return null;
    } finally {
      setIsPlanning(false);
    }
  }, [form, scenarioInputs]);

  const runScenarios = useCallback(async () => {
    if (!plan) return;
    setIsScenariosLoading(true);
    setServerError(null);
    try {
      const payload = toPlanPayload(form);
      const result = await getSocietyScenarios({ design: payload, ...scenarioInputs });
      setScenarios(Array.isArray(result) ? result : []);
    } catch (e) {
      console.error('Scenario calculation failed', e);
      setServerError(e.message || 'The scenarios could not be calculated.');
    } finally {
      setIsScenariosLoading(false);
    }
  }, [form, plan, scenarioInputs]);

  const setScenarioInput = useCallback((key, value) => {
    setScenarioInputs((s) => ({ ...s, [key]: value }));
  }, []);

  return {
    form,
    errors,
    updateField,
    reset,
    // location
    resolveCoordinates,
    isResolving,
    resolveMessage,
    resolveError,
    // estimate
    plan,
    runPlan,
    isPlanning,
    serverError,
    // scenarios
    scenarios,
    scenarioInputs,
    setScenarioInput,
    runScenarios,
    isScenariosLoading,
  };
};

export default useSocietyPlanner;

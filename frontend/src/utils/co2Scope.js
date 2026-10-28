// src/utils/co2Scope.js
//
// Single source of truth for how modelled CO2 is described and formatted.
//
// Why this exists:
// The Random Forest target (`co2_tonnes`) is a modelled CO2 emission rate for ONE
// sampled location - a local, area-level estimate in tonnes per day. It is NOT a
// city-wide emissions inventory, and the dataset cannot be validly aggregated into
// one (each date samples a different sparse set of points). Keeping the wording in
// one place stops any page from presenting a local estimate as a city total.

/** What the model actually predicts. */
export const CO2_SCOPE = {
  short: 'Modelled area CO₂',
  label: 'Modelled CO₂ — selected area',
  description:
    'Model estimate for a single sampled location in this area, in tonnes of CO₂ per day. Not a city-wide emissions inventory.',
  /** Explicit note for pages that could otherwise be read as a city total. */
  notCityTotal:
    'This is a modelled value for one sampled location, not the total emissions of the whole city.',
};

/** Canonical unit. All CO2 values in the API are tonnes/day unless stated. */
export const CO2_UNIT = 'tonnes/day';
export const CO2_UNIT_KG = 'kg/day';

export const TONNES_TO_KG = 1000;

/** Formats a tonnes/day value with sensible precision. */
export const formatTonnesPerDay = (value, digits = 2) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(digits);
};

/** Correctly converts tonnes/day to kg/day (x1000). */
export const tonnesToKg = (tonnes) => {
  const n = Number(tonnes);
  if (!Number.isFinite(n)) return NaN;
  return n * TONNES_TO_KG;
};

/** Formats a tonnes/day value as its kg/day equivalent. */
export const formatKgPerDay = (tonnes, digits = 0) => {
  const kg = tonnesToKg(tonnes);
  if (!Number.isFinite(kg)) return '—';
  return kg.toFixed(digits);
};

/**
 * Formats a hotspot/zone CO2 value, which the API reports in kg/day, as tonnes/day.
 */
export const formatZoneCo2 = (kgPerDay, digits = 2) => {
  const n = Number(kgPerDay);
  if (!Number.isFinite(n)) return '—';
  return (n / TONNES_TO_KG).toFixed(digits);
};

export default CO2_SCOPE;

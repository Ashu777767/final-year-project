/**
 * Format CO₂ value with unit
 * @param {number} value - CO₂ value
 * @param {string} unit - Unit string (default: 'kg/day')
 * @returns {string}
 */
export const formatCO2 = (value, unit = 'kg/day') => {
  if (value === null || value === undefined) return '—';
  return `${value.toLocaleString()} ${unit}`;
};

/**
 * Format percentage value
 * @param {number} value - Percentage value
 * @returns {string}
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined) return '—';
  return `${value}%`;
};

/**
 * Format currency in Indian Rupees (Lakhs)
 * @param {string} value - Cost string
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (!value || value === '—') return '—';
  return value;
};

/**
 * Get risk level from CO₂ value
 * @param {number} co2 - CO₂ level
 * @returns {string}
 */
export const getRiskLevel = (co2) => {
  if (co2 >= 800) return 'Critical';
  if (co2 >= 650) return 'High';
  if (co2 >= 500) return 'Medium';
  return 'Low';
};

/**
 * Format trend percentage with sign
 * @param {number} value - Trend percentage
 * @returns {string}
 */
export const formatTrend = (value) => {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
};

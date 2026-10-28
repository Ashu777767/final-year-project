// Map configuration - Bengaluru, Electronic City area
export const MAP_CONFIG = {
  defaultCenter: [12.9141, 77.6370], // Bengaluru center
  defaultZoom: 12,
  minZoom: 10,
  maxZoom: 18,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// Risk level colors and thresholds
export const RISK_LEVELS = {
  Critical: { color: '#dc2626', bg: '#fef2f2', threshold: 800 },
  High: { color: '#ea580c', bg: '#fff7ed', threshold: 650 },
  Medium: { color: '#d97706', bg: '#fffbeb', threshold: 500 },
  Low: { color: '#16a34a', bg: '#f0fdf4', threshold: 0 },
};

// Chart colors
export const CHART_COLORS = {
  primary: '#16a34a',
  secondary: '#0ea5e9',
  warning: '#f59e0b',
  danger: '#dc2626',
  purple: '#8b5cf6',
  slate: '#64748b',
};

// Trend icons mapping
export const TREND_ICONS = {
  Rising: { icon: 'TrendingUp', color: '#dc2626' },
  Stable: { icon: 'Minus', color: '#d97706' },
  Falling: { icon: 'TrendingDown', color: '#16a34a' },
};

// Navigation items for sidebar
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
  { path: '/digital-twin', label: 'Digital Twin', icon: 'Map' },
  { path: '/area-profile', label: 'Area Profile', icon: 'MapPin' },
  { path: '/society-planner', label: 'Plan a New Society', icon: 'Building2' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/hotspots', label: 'Hotspots', icon: 'Flame' },
  { path: '/simulator', label: 'Capture Simulator', icon: 'FlaskConical' },
  { path: '/scenarios', label: 'Scenarios', icon: 'GitCompareArrows' },
  { path: '/recommendations', label: 'Recommendations', icon: 'Lightbulb' },
];

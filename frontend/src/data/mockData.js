// KPI data
export const kpiData = {
  totalEmissions: { value: 842, unit: 'kg/day', trend: 3.2, label: 'Total CO₂ Emissions' },
  averageCo2: { value: 526, unit: 'kg/day', trend: -1.5, label: 'Average CO₂' },
  activeHotspots: { value: 12, unit: 'areas', trend: 2, label: 'Active Hotspots' },
  capturePotential: { value: 27, unit: '%', trend: 5.1, label: 'Capture Potential' },
};

// Monthly emission trends (12 months)
export const emissionTrends = [
  { month: 'Jan', emissions: 720, captured: 180 },
  { month: 'Feb', emissions: 690, captured: 190 },
  { month: 'Mar', emissions: 750, captured: 200 },
  { month: 'Apr', emissions: 780, captured: 210 },
  { month: 'May', emissions: 810, captured: 220 },
  { month: 'Jun', emissions: 830, captured: 230 },
  { month: 'Jul', emissions: 860, captured: 225 },
  { month: 'Aug', emissions: 842, captured: 235 },
  { month: 'Sep', emissions: 800, captured: 240 },
  { month: 'Oct', emissions: 770, captured: 245 },
  { month: 'Nov', emissions: 740, captured: 250 },
  { month: 'Dec', emissions: 710, captured: 260 },
];

// Area-wise emissions
export const areaEmissions = [
  { area: 'Electronic City', emissions: 842, risk: 'High' },
  { area: 'Whitefield', emissions: 756, risk: 'High' },
  { area: 'Koramangala', emissions: 623, risk: 'Medium' },
  { area: 'Indiranagar', emissions: 580, risk: 'Medium' },
  { area: 'Jayanagar', emissions: 445, risk: 'Low' },
  { area: 'Marathahalli', emissions: 698, risk: 'High' },
  { area: 'HSR Layout', emissions: 512, risk: 'Medium' },
  { area: 'BTM Layout', emissions: 467, risk: 'Low' },
];

// Source distribution
export const sourceDistribution = [
  { source: 'Transport', value: 42, color: '#16a34a' },
  { source: 'Industry', value: 28, color: '#0ea5e9' },
  { source: 'Residential', value: 18, color: '#f59e0b' },
  { source: 'Commercial', value: 12, color: '#8b5cf6' },
];

// Recent hotspots for dashboard table
export const recentHotspots = [
  { id: 1, area: 'Electronic City', co2Level: 842, risk: 'Critical', trend: 'Rising', lat: 12.8399, lng: 77.6770 },
  { id: 2, area: 'Whitefield', co2Level: 756, risk: 'High', trend: 'Stable', lat: 12.9698, lng: 77.7500 },
  { id: 3, area: 'Marathahalli', co2Level: 698, risk: 'High', trend: 'Rising', lat: 12.9591, lng: 77.6974 },
  { id: 4, area: 'Koramangala', co2Level: 623, risk: 'Medium', trend: 'Falling', lat: 12.9352, lng: 77.6245 },
  { id: 5, area: 'Indiranagar', co2Level: 580, risk: 'Medium', trend: 'Stable', lat: 12.9784, lng: 77.6408 },
  { id: 6, area: 'HSR Layout', co2Level: 512, risk: 'Medium', trend: 'Falling', lat: 12.9116, lng: 77.6389 },
  { id: 7, area: 'Jayanagar', co2Level: 445, risk: 'Low', trend: 'Falling', lat: 12.9308, lng: 77.5838 },
  { id: 8, area: 'BTM Layout', co2Level: 467, risk: 'Low', trend: 'Stable', lat: 12.9166, lng: 77.6101 },
];

// Hotspot detail records
export const hotspotDetails = {
  1: {
    area: 'Electronic City',
    co2Level: 842,
    severity: 'Critical',
    mainFactor: 'Heavy Traffic + IT Parks',
    trafficLevel: 'Very High',
    industrialActivity: 'High',
    greenCover: 'Low',
    trend: [680, 720, 750, 790, 810, 842],
    factors: ['Heavy vehicular traffic', 'Large IT campus emissions', 'Construction activity', 'Low green cover'],
    recommendedIntervention: 'Green Corridor + Traffic Reduction',
  },
  2: {
    area: 'Whitefield',
    co2Level: 756,
    severity: 'High',
    mainFactor: 'Industrial + Traffic',
    trafficLevel: 'High',
    industrialActivity: 'Medium',
    greenCover: 'Medium',
    trend: [700, 710, 730, 740, 750, 756],
    factors: ['IT corridor traffic', 'Commercial emissions', 'Rapid urbanization'],
    recommendedIntervention: 'Tree Plantation + CO₂ Capture Unit',
  },
  3: {
    area: 'Marathahalli',
    co2Level: 698,
    severity: 'High',
    mainFactor: 'Traffic Congestion',
    trafficLevel: 'Very High',
    industrialActivity: 'Low',
    greenCover: 'Low',
    trend: [620, 640, 660, 680, 690, 698],
    factors: ['Outer Ring Road congestion', 'Dense residential area', 'Limited public transport'],
    recommendedIntervention: 'Traffic Reduction + Biofilter',
  },
  4: {
    area: 'Koramangala',
    co2Level: 623,
    severity: 'Medium',
    mainFactor: 'Commercial Activity',
    trafficLevel: 'High',
    industrialActivity: 'Low',
    greenCover: 'Medium',
    trend: [650, 640, 635, 630, 625, 623],
    factors: ['Commercial district emissions', 'Moderate traffic', 'Growing restaurant sector'],
    recommendedIntervention: 'Green Corridor',
  },
  5: {
    area: 'Indiranagar',
    co2Level: 580,
    severity: 'Medium',
    mainFactor: 'Mixed Use',
    trafficLevel: 'Medium',
    industrialActivity: 'Low',
    greenCover: 'Medium',
    trend: [590, 585, 582, 580, 580, 580],
    factors: ['Commercial + residential mix', 'Moderate traffic'],
    recommendedIntervention: 'Tree Plantation',
  },
  6: {
    area: 'HSR Layout',
    co2Level: 512,
    severity: 'Medium',
    mainFactor: 'Residential Growth',
    trafficLevel: 'Medium',
    industrialActivity: 'Low',
    greenCover: 'Medium',
    trend: [530, 525, 520, 518, 515, 512],
    factors: ['Rapid residential development', 'Moderate traffic'],
    recommendedIntervention: 'Tree Plantation + Biofilter',
  },
  7: {
    area: 'Jayanagar',
    co2Level: 445,
    severity: 'Low',
    mainFactor: 'Residential',
    trafficLevel: 'Low',
    industrialActivity: 'Low',
    greenCover: 'High',
    trend: [470, 465, 460, 455, 450, 445],
    factors: ['Primarily residential', 'Good green cover'],
    recommendedIntervention: 'Biofilter',
  },
  8: {
    area: 'BTM Layout',
    co2Level: 467,
    severity: 'Low',
    mainFactor: 'Moderate Traffic',
    trafficLevel: 'Medium',
    industrialActivity: 'Low',
    greenCover: 'Medium',
    trend: [480, 475, 472, 470, 468, 467],
    factors: ['Metro corridor nearby', 'Growing commercial activity'],
    recommendedIntervention: 'Tree Plantation',
  },
};

// Map markers for Leaflet
export const mapMarkers = [
  { id: 1, area: 'Electronic City', lat: 12.8399, lng: 77.6770, co2: 842, risk: 'Critical', traffic: 'Very High', estimatedEmissions: '842 kg/day' },
  { id: 2, area: 'Whitefield', lat: 12.9698, lng: 77.7500, co2: 756, risk: 'High', traffic: 'High', estimatedEmissions: '756 kg/day' },
  { id: 3, area: 'Marathahalli', lat: 12.9591, lng: 77.6974, co2: 698, risk: 'High', traffic: 'Very High', estimatedEmissions: '698 kg/day' },
  { id: 4, area: 'Koramangala', lat: 12.9352, lng: 77.6245, co2: 623, risk: 'Medium', traffic: 'High', estimatedEmissions: '623 kg/day' },
  { id: 5, area: 'Indiranagar', lat: 12.9784, lng: 77.6408, co2: 580, risk: 'Medium', traffic: 'Medium', estimatedEmissions: '580 kg/day' },
  { id: 6, area: 'HSR Layout', lat: 12.9116, lng: 77.6389, co2: 512, risk: 'Medium', traffic: 'Medium', estimatedEmissions: '512 kg/day' },
  { id: 7, area: 'Jayanagar', lat: 12.9308, lng: 77.5838, co2: 445, risk: 'Low', traffic: 'Low', estimatedEmissions: '445 kg/day' },
  { id: 8, area: 'BTM Layout', lat: 12.9166, lng: 77.6101, co2: 467, risk: 'Low', traffic: 'Medium', estimatedEmissions: '467 kg/day' },
];

// Areas dropdown
export const areas = [
  'Electronic City',
  'Whitefield',
  'Marathahalli',
  'Koramangala',
  'Indiranagar',
  'HSR Layout',
  'Jayanagar',
  'BTM Layout',
];

// Intervention types
export const interventionTypes = [
  { id: 'tree-plantation', label: 'Tree Plantation', icon: 'Trees', reductionFactor: 0.08 },
  { id: 'green-corridor', label: 'Green Corridor', icon: 'Leaf', reductionFactor: 0.12 },
  { id: 'traffic-reduction', label: 'Traffic Reduction', icon: 'Car', reductionFactor: 0.15 },
  { id: 'co2-capture-unit', label: 'CO₂ Capture Unit', icon: 'Factory', reductionFactor: 0.20 },
  { id: 'biofilter', label: 'Biofilter', icon: 'Flower2', reductionFactor: 0.10 },
];

// Scenario comparison data
export const scenarioData = [
  { scenario: 'Current State', co2: 842, reduction: 0, cost: '—', efficiency: '—', status: 'Baseline' },
  { scenario: 'Tree Plantation', co2: 775, reduction: 67, cost: '₹15L', efficiency: '8.0%', status: 'Moderate' },
  { scenario: 'Green Corridor', co2: 741, reduction: 101, cost: '₹28L', efficiency: '12.0%', status: 'High' },
  { scenario: 'Traffic Reduction', co2: 716, reduction: 126, cost: '₹42L', efficiency: '15.0%', status: 'High' },
  { scenario: 'CO₂ Capture Units', co2: 674, reduction: 168, cost: '₹65L', efficiency: '20.0%', status: 'Very High' },
];

// AI Recommendations
export const recommendations = [
  {
    id: 1,
    hotspot: 'Electronic City',
    co2Level: 842,
    traffic: 'Very High',
    risk: 'Critical',
    recommended: 'Green Corridor + Traffic Reduction',
    expectedImpact: 'High',
    reasoning: 'Electronic City experiences the highest CO₂ levels in the urban area, primarily driven by heavy vehicular traffic from IT parks and limited green cover. A combined approach of establishing green corridors along major roads and implementing traffic management measures would yield the highest reduction.',
    expectedReduction: '22-27%',
    difficulty: 'Medium-High',
    estimatedCost: '₹45-55L',
    timeframe: '12-18 months',
  },
  {
    id: 2,
    hotspot: 'Whitefield',
    co2Level: 756,
    traffic: 'High',
    risk: 'High',
    recommended: 'Tree Plantation + CO₂ Capture Unit',
    expectedImpact: 'High',
    reasoning: 'Whitefield\'s emissions are driven by a combination of IT corridor traffic and commercial activity. Strategic tree plantation along main roads combined with CO₂ capture units near major emission sources would provide both immediate and long-term benefits.',
    expectedReduction: '18-24%',
    difficulty: 'Medium',
    estimatedCost: '₹35-45L',
    timeframe: '8-14 months',
  },
  {
    id: 3,
    hotspot: 'Marathahalli',
    co2Level: 698,
    traffic: 'Very High',
    risk: 'High',
    recommended: 'Traffic Reduction + Biofilter',
    expectedImpact: 'Medium-High',
    reasoning: 'Marathahalli\'s primary emission driver is the severe traffic congestion on the Outer Ring Road. Traffic management solutions combined with biofilters along the congested corridor would address the root cause while providing passive air purification.',
    expectedReduction: '15-20%',
    difficulty: 'High',
    estimatedCost: '₹50-60L',
    timeframe: '14-20 months',
  },
];

// Traffic vs CO2 correlation data
export const trafficVsCo2Data = [
  { hour: '6 AM', traffic: 120, co2: 310 },
  { hour: '7 AM', traffic: 280, co2: 420 },
  { hour: '8 AM', traffic: 520, co2: 610 },
  { hour: '9 AM', traffic: 680, co2: 750 },
  { hour: '10 AM', traffic: 580, co2: 690 },
  { hour: '11 AM', traffic: 450, co2: 580 },
  { hour: '12 PM', traffic: 500, co2: 620 },
  { hour: '1 PM', traffic: 520, co2: 640 },
  { hour: '2 PM', traffic: 480, co2: 600 },
  { hour: '3 PM', traffic: 440, co2: 570 },
  { hour: '4 PM', traffic: 550, co2: 660 },
  { hour: '5 PM', traffic: 720, co2: 800 },
  { hour: '6 PM', traffic: 780, co2: 842 },
  { hour: '7 PM', traffic: 620, co2: 710 },
  { hour: '8 PM', traffic: 380, co2: 490 },
  { hour: '9 PM', traffic: 250, co2: 380 },
];

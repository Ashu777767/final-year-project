(async () => {
  // Dynamically import Puppeteer (ESM) to avoid the experimental warning
  const puppeteerMod = await import('puppeteer');
  const puppeteer = puppeteerMod.default || puppeteerMod;
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  const base = 'http://localhost:5173';

  // Helper to capture outerHTML of an element via CSS selector or text search
  const captureBySelector = async (url, selector) => {
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 15000});
    await delay(2000);
    const el = await page.$(selector);
    return el ? await page.evaluate(e => e.outerHTML, el) : null;
  };

  const captureButtonByText = async (url, text) => {
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 15000});
    await delay(2000);
    const html = await page.evaluate(t => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes(t));
      return btn ? btn.outerHTML : null;
    }, text);
    return html;
  };

  const results = {};

  // Digital Twin page selectors
  const dtUrl = `${base}/digital-twin`;
  results.digitalTwin = {};
  results.digitalTwin.mapContainer = await captureBySelector(dtUrl, '.leaflet-container');
  results.digitalTwin.co2Button = await captureButtonByText(dtUrl, 'CO₂');
  results.digitalTwin.trafficButton = await captureButtonByText(dtUrl, 'Traffic');
  results.digitalTwin.hotspotsButton = await captureButtonByText(dtUrl, 'Hotspots');
  results.digitalTwin.captureButton = await captureButtonByText(dtUrl, 'Capture Locations');
  results.digitalTwin.searchInput = await captureBySelector(dtUrl, 'input[placeholder="Search Indian City..."]');

  // Simulator page selectors
  const simUrl = `${base}/simulator`;
  results.simulator = {};
  results.simulator.runButton = await captureButtonByText(simUrl, 'Run Simulation');
  results.simulator.parameterInput = await captureBySelector(simUrl, 'input[type="number"]');
  results.simulator.citySelect = await captureBySelector(simUrl, 'select[name="city"]');

  // Analytics page selectors
  const analyticsUrl = `${base}/analytics`;
  results.analytics = {};
  results.analytics.rechartsWrapper = await captureBySelector(analyticsUrl, '.recharts-wrapper');
  results.analytics.citySelect = await captureBySelector(analyticsUrl, 'select');

  // Hotspots page selectors
  const hotspotsUrl = `${base}/hotspots`;
  results.hotspots = {};
  results.hotspots.table = await captureBySelector(hotspotsUrl, 'table');
  results.hotspots.firstRow = await captureBySelector(hotspotsUrl, 'table tbody tr');

  // Recommendations page selectors
  const recUrl = `${base}/recommendations`;
  results.recommendations = {};
  results.recommendations.cards = await captureBySelector(recUrl, '.recommendation-card');
  results.recommendations.viewMapButton = await captureButtonByText(recUrl, 'View on Map');

  // Scenarios page selectors
  const scUrl = `${base}/scenarios`;
  results.scenarios = {};
  results.scenarios.cards = await captureBySelector(scUrl, '.scenario-card');

  const fs = require('fs');
  const outPath = 'C:/Users/amank/.gemini/antigravity/brain/34f82c5c-1bef-44a0-a6a7-b1b4979cfb61/selector_report.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('Selector report written to', outPath);

  await browser.close();
})();

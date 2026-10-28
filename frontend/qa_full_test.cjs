const puppeteer = require('D:/Projects/co2-digital-twin/node_modules/puppeteer');

(async () => {
  const results = [];
  const errors = [];

  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  // capture console errors
  page.on('pageerror', err => errors.push(`PageError: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`ConsoleError: ${msg.text()}`);
  });
  page.on('requestfailed', req => {
    const failure = req.failure();
    errors.push(`RequestFailed: ${req.url()} - ${failure && failure.errorText}`);
  });

  async function record(step, fn) {
    try {
      await fn();
      results.push({feature: step, status: 'PASS'});
    } catch (e) {
      results.push({feature: step, status: 'FAIL', error: e.message});
    }
  }

  // 1. Open landing page
  await record('Landing page load', async () => {
    await page.goto('http://localhost:5173', {waitUntil: 'networkidle2', timeout: 15000});
    const nav = await page.$('nav');
    if (!nav) throw new Error('Nav not found');
  });

  // 2. Open Digital Twin page
  await record('Open Digital Twin', async () => {
    await page.goto('http://localhost:5173/map', {waitUntil: 'networkidle2'});
    const map = await page.$('#map');
    if (!map) throw new Error('Map element #map missing');
  });

  // Helper to click mode button and verify layer change
  async function testMode(name, btnSelector, layerSelector) {
    await record(`Map mode ${name}`, async () => {
      await page.waitForSelector(btnSelector, {timeout: 5000});
      await page.click(btnSelector);
      await page.waitForTimeout(1000);
      const layer = await page.$(layerSelector);
      if (!layer) throw new Error(`${name} layer not found`);
    });
  }

  // 3. CO2 mode
  await testMode('CO2', 'button[data-mode="co2"]', '.leaflet-interactive');
  // 4. Traffic mode
  await testMode('Traffic', 'button[data-mode="traffic"]', '.leaflet-interactive');
  // 5. Hotspots mode
  await testMode('Hotspots', 'button[data-mode="hotspots"]', '.leaflet-marker-icon');
  // 6. Capture Locations mode
  await testMode('Capture', 'button[data-mode="capture"]', '.leaflet-marker-icon');

  // 7. Map interaction - click first marker
  await record('Map click interaction', async () => {
    const marker = await page.$('.leaflet-marker-icon');
    if (!marker) throw new Error('No marker found');
    await marker.click({clickCount: 1});
    await page.waitForTimeout(1000);
    const panel = await page.$('.details-panel');
    if (!panel) throw new Error('Details panel not found after click');
  });

  // 8. Search locations
  const locations = ['Pune', 'Mumbai', 'Delhi', 'Bengaluru'];
  for (const city of locations) {
    await record(`Search ${city}`, async () => {
      const input = await page.$('input[placeholder="Search Indian City..."]');
      if (!input) throw new Error('Search input not found');
      await input.click({clickCount: 3});
      await input.type(city, {delay: 50});
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      const panel = await page.$('.details-panel');
      if (!panel) throw new Error('Details panel missing after search');
      const text = await page.evaluate(el => el.innerText, panel);
      if (!text.toLowerCase().includes(city.toLowerCase())) {
        throw new Error(`Details panel does not show ${city}`);
      }
    });
  }

  // 9. Simulator tests
  await record('Open Simulator', async () => {
    await page.goto('http://localhost:5173/simulator', {waitUntil: 'networkidle2'});
    const form = await page.$('form');
    if (!form) throw new Error('Simulator form not found');
  });

  async function runSimulationTest(city) {
    await page.select('select[name="city"]', city);
    await page.waitForTimeout(500);
    const sliders = await page.$$('input[type="range"]');
    if (sliders.length === 0) throw new Error('No sliders found');
    await sliders[0].click({clickCount: 1});
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const result = await page.$('.simulation-result');
    if (!result) throw new Error('Result element missing');
    const txt = await page.evaluate(el => el.innerText, result);
    if (!txt) throw new Error('Empty simulation result');
  }

  await record('Simulator first run (Pune)', async () => {
    await runSimulationTest('Pune');
  });

  await record('Simulator second run (Pune, changed intensity)', async () => {
    await page.evaluate(() => {
      const slider = document.querySelector('input[type="range"]');
      if (slider) slider.value = 80;
    });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const result = await page.$('.simulation-result');
    if (!result) throw new Error('Result missing after second run');
  });

  // Verify no Sample Data banner & currency
  await record('Simulator UI checks', async () => {
    const banner = await page.$('.sample-data-banner');
    if (banner) throw new Error('Sample Data banner present');
    const text = await page.content();
    if (!text.includes('₹')) throw new Error('Currency ₹ not found');
  });

  // 10. Analytics page
  await record('Analytics page', async () => {
    await page.goto('http://localhost:5173/analytics', {waitUntil: 'networkidle2'});
    const chart = await page.$('.recharts-wrapper');
    if (!chart) throw new Error('Analytics chart missing');
    await page.select('select[name="city"]', 'Mumbai');
    await page.waitForTimeout(1000);
    const chart2 = await page.$('.recharts-wrapper');
    if (!chart2) throw new Error('Chart disappeared after filter');
  });

  // 11. Hotspots page
  await record('Hotspots page', async () => {
    await page.goto('http://localhost:5173/hotspots', {waitUntil: 'networkidle2'});
    const table = await page.$('table');
    if (!table) throw new Error('Hotspots table missing');
    const firstRow = await page.$('table tbody tr');
    if (!firstRow) throw new Error('No hotspot rows');
    await firstRow.click();
    await page.waitForTimeout(1000);
    const mapMarker = await page.$('.leaflet-marker-icon');
    if (!mapMarker) throw new Error('Map marker not shown after hotspot click');
  });

  // 12. Recommendations page
  await record('Recommendations page', async () => {
    await page.goto('http://localhost:5173/recommendations', {waitUntil: 'networkidle2'});
    const recs = await page.$$('.recommendation-card');
    if (recs.length === 0) throw new Error('No recommendations rendered');
    const viewBtn = await page.$x("//button[contains(., 'View on Map')]");
    if (viewBtn.length > 0) await viewBtn[0].click();
    await page.waitForTimeout(1000);
  });

  // 13. Scenarios page
  await record('Scenarios page', async () => {
    await page.goto('http://localhost:5173/scenarios', {waitUntil: 'networkidle2'});
    const cards = await page.$$('.scenario-card');
    if (cards.length === 0) throw new Error('No scenario cards');
    await cards[0].click();
    await page.waitForTimeout(1000);
    const result = await page.$('.scenario-result');
    if (!result) throw new Error('Scenario result missing');
  });

  // 14. Refresh checks
  await record('Refresh Digital Twin', async () => {
    await page.goto('http://localhost:5173/map', {waitUntil: 'networkidle2'});
    const map = await page.$('#map');
    if (!map) throw new Error('Map missing after refresh');
  });

  await record('Refresh Simulator', async () => {
    await page.goto('http://localhost:5173/simulator', {waitUntil: 'networkidle2'});
    const form = await page.$('form');
    if (!form) throw new Error('Simulator form missing after refresh');
  });

  await browser.close();

  const fs = require('fs');
  const output = {results, errors};
  fs.writeFileSync('qa_output.json', JSON.stringify(output, null, 2));
})();

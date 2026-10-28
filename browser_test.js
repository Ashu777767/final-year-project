/*
  Updated browser_test.js – replaces fixed delays with explicit waits.
  No source code of the application is changed; only the test script is refined.
*/

(async () => {
  // Dynamically import Puppeteer (ESM) to avoid experimental warning
  const puppeteerMod = await import('puppeteer');
  const puppeteer = puppeteerMod.default || puppeteerMod;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  const errors = [];

  // Helper to record pass/fail of a feature
  const record = async (feat, fn) => {
    try {
      await fn();
      results.push({ feature: feat, status: 'PASS' });
    } catch (e) {
      results.push({ feature: feat, status: 'FAIL', error: e.message });
      errors.push(e.message);
    }
  };

  // Helper to take screenshots in the shared artifact folder
  const screenshot = async name => {
    try {
      await page.screenshot({ path: `C:/Users/amank/.gemini/antigravity/brain/34f82c5c-1bef-44a0-a6a7-b1b4979cfb61/${name}.png` });
    } catch (e) { /* ignore screenshot failures */ }
  };

  // Click the first button whose innerText includes the given text
  const clickButtonByText = async text => {
    const btnHandle = await page.evaluateHandle(t => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes(t)) || null;
    }, text);
    if (!btnHandle) throw new Error(`Button "${text}" not found`);
    const element = await btnHandle.asElement();
    await element.click();
    await btnHandle.dispose();
  };

  const base = 'http://localhost:5173';

  // ---------------------------------------------------
  // 1. Landing page – wait for navigation bar
  // ---------------------------------------------------
  await record('Landing page load', async () => {
    await page.goto(base, { waitUntil: 'networkidle2', timeout: 15000 });
    await page.waitForSelector('nav', { timeout: 8000 });
    await screenshot('landing_page');
  });

  // ---------------------------------------------------
  // 2. Digital Twin page – wait for map container
  // ---------------------------------------------------
  await record('Open Digital Twin', async () => {
    await page.goto(`${base}/digital-twin`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await screenshot('digital_twin_page');
  });

  // Helper to verify a map mode – click button then wait for circles
  const verifyMapMode = async modeName => {
    await clickButtonByText(modeName);
    // wait for at least one interactive element (circle/marker) to appear
    await page.waitForFunction(
      name => !!document.querySelectorAll('.leaflet-interactive').length,
      { timeout: 8000 },
      modeName
    );
    await screenshot(`map_mode_${modeName.replace(/\s+/g, '_')}`);
  };

  // ---------------------------------------------------
  // 3. Map modes
  // ---------------------------------------------------
  await record('Map mode CO₂', async () => await verifyMapMode('CO₂'));
  await record('Map mode Traffic', async () => await verifyMapMode('Traffic'));
  await record('Map mode Hotspots', async () => await verifyMapMode('Hotspots'));
  await record('Map mode Capture Locations', async () => await verifyMapMode('Capture Locations'));

  // ---------------------------------------------------
  // 4. Map click interaction (first marker)
  // ---------------------------------------------------
  await record('Map click interaction', async () => {
    const marker = await page.waitForSelector('.leaflet-interactive', { timeout: 8000 });
    await marker.click();
    // details panel can have one of several class names – wait for any of them
    await page.waitForFunction(
      () => !!document.querySelector('.details-panel, .area-info-panel, .bg-white'),
      { timeout: 8000 }
    );
    await screenshot('map_click');
  });

  // ---------------------------------------------------
  // 5. Search locations – wait for result containing city name
  // ---------------------------------------------------
  const searchAndValidate = async city => {
    const input = await page.waitForSelector('input[placeholder="Search Indian City..."]', { timeout: 8000 });
    await input.click({ clickCount: 3 });
    await input.type(city, { delay: 50 });
    await page.keyboard.press('Enter');
    // wait until some div on the page includes the city name
    await page.waitForFunction(
      c => Array.from(document.querySelectorAll('div')).some(d => d.innerText.includes(c)),
      { timeout: 8000 },
      city
    );
    await screenshot(`search_${city}`);
  };

  for (const city of ['Pune', 'Mumbai', 'Delhi', 'Bengaluru']) {
    await record(`Search ${city}`, async () => await searchAndValidate(city));
  }

  // ---------------------------------------------------
  // 6. Simulator page – wait for Run Simulation button
  // ---------------------------------------------------
  await record('Open Simulator', async () => {
    await page.goto(`${base}/simulator`, { waitUntil: 'networkidle2' });
    const runBtnHandle = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Run Simulation')) || null;
    });
    if (!runBtnHandle) throw new Error('Run Simulation button not found');
    const runBtn = runBtnHandle.asElement();
    await runBtn.click();
    await page.waitForTimeout(2000); // short pause for simulation start UI
    await screenshot('simulator_page');
    await runBtnHandle.dispose();
  });

  // ---------------------------------------------------
  // 7. Analytics page – wait for chart
  // ---------------------------------------------------
  await record('Analytics page', async () => {
    await page.goto(`${base}/analytics`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.recharts-wrapper', { timeout: 8000 });
    await screenshot('analytics_page');
  });

  // ---------------------------------------------------
  // 8. Hotspots page – wait for table and marker after row click
  // ---------------------------------------------------
  await record('Hotspots page', async () => {
    await page.goto(`${base}/hotspots`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('table', { timeout: 8000 });
    const firstRow = await page.waitForSelector('table tbody tr', { timeout: 8000 });
    await firstRow.click();
    // after clicking a row, a map marker should appear
    await page.waitForSelector('.leaflet-interactive', { timeout: 8000 });
    await screenshot('hotspots_page');
  });

  // ---------------------------------------------------
  // 9. Recommendations page – wait for cards and optional view button
  // ---------------------------------------------------
  await record('Recommendations page', async () => {
    await page.goto(`${base}/recommendations`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.recommendation-card', { timeout: 8000 });
    const viewBtnHandle = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('View on Map')) || null;
    });
    if (viewBtnHandle) {
      const viewBtn = viewBtnHandle.asElement();
      await viewBtn.click();
      await page.waitForTimeout(800);
      viewBtnHandle.dispose();
    }
    await screenshot('recommendations_page');
  });

  // ---------------------------------------------------
  // 10. Scenarios page – wait for cards and result after click
  // ---------------------------------------------------
  await record('Scenarios page', async () => {
    await page.goto(`${base}/scenarios`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.scenario-card', { timeout: 8000 });
    const cards = await page.$$('.scenario-card');
    await cards[0].click();
    await page.waitForSelector('.scenario-result, .text-green-600', { timeout: 8000 });
    await screenshot('scenarios_page');
  });

  // ---------------------------------------------------
  // 11. Refresh checks – re‑load pages and verify key elements
  // ---------------------------------------------------
  await record('Refresh Digital Twin', async () => {
    await page.goto(`${base}/digital-twin`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.leaflet-container', { timeout: 8000 });
    await screenshot('refresh_digital_twin');
  });

  await record('Refresh Simulator', async () => {
    await page.goto(`${base}/simulator`, { waitUntil: 'networkidle2' });
    const btnHandle = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Run Simulation')) || null;
    });
    if (!btnHandle) throw new Error('Run Simulation button missing after refresh');
    btnHandle.dispose();
  });

  await browser.close();
  console.log(JSON.stringify({ results, errors }, null, 2));
})();

/**
 * Browser verification for the Anekal custom-area flow and Pune regression.
 * Drives the real app at http://localhost:5173 the same way a user does and records
 * the HTTP status of every /api request plus all console errors.
 */
const puppeteer = require('./frontend/node_modules/puppeteer');

const BASE = 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const record = [];
const consoleErrors = [];
const pageErrors = [];

function logApi(entry) {
  record.push(entry);
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(String(err && err.message ? err.message : err)));

  page.on('response', async (res) => {
    const url = res.url();
    if (!url.includes('/api/')) return;
    const status = res.status();
    let body = '';
    try {
      body = (await res.text()).slice(0, 400);
    } catch (e) {
      body = '<unreadable>';
    }
    logApi({ method: res.request().method(), url: url.replace('http://localhost:5173', ''), status, body });
  });

  // ---------- Test A: Anekal survey generation through the real UI ----------
  await page.goto(`${BASE}/area-profile`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });

  await page.waitForSelector('#area-profile-search', { timeout: 15000 });
  await page.click('#area-profile-search');
  await page.type('#area-profile-search', 'Anekal', { delay: 40 });

  // Wait for the search results dropdown from /api/locations/search.
  let picked = false;
  for (let i = 0; i < 40; i++) {
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate((el) => el.textContent || '', b);
      if (/Anekal/i.test(text) && text.length < 120) {
        await b.click();
        picked = true;
        break;
      }
    }
    if (picked) break;
    await sleep(400);
  }
  if (!picked) throw new Error('Anekal search result was never offered');
  await sleep(2500);

  const statusMessage = await page.evaluate(() => {
    const el = document.querySelector('p');
    const all = Array.from(document.querySelectorAll('p')).map((p) => p.textContent);
    return all.filter((t) => t && /profile|data|coordinates|survey/i.test(t)).slice(0, 3);
  });

  // If the profile survey did not auto-open, click "Complete Area Profile".
  let modalOpen = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h2')).some((h) => /Complete Area Profile/.test(h.textContent))
  );
  if (!modalOpen) {
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find((x) => /Complete Area Profile/i.test(x.textContent));
      if (b) { b.click(); return true; }
      return false;
    });
    if (clicked) await sleep(1200);
    modalOpen = await page.evaluate(() =>
      Array.from(document.querySelectorAll('h2')).some((h) => /Complete Area Profile/.test(h.textContent))
    );
  }
  if (!modalOpen) throw new Error('The Complete Area Profile survey never opened for Anekal');

  const clickButtonByText = async (text) => {
    const ok = await page.evaluate((t) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find((x) => x.textContent && x.textContent.trim().includes(t));
      if (b) { b.click(); return true; }
      return false;
    }, text);
    await sleep(600);
    return ok;
  };

  const typeInto = async (placeholder, value) => {
    const ok = await page.evaluate((ph) => {
      const el = document.querySelector(`input[placeholder="${ph}"]`);
      if (!el) return false;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, '');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.focus();
      return true;
    }, placeholder);
    if (!ok) return false;
    await page.type(`input[placeholder="${placeholder}"]`, String(value), { delay: 20 });
    await sleep(150);
    return true;
  };

  // Step 1: Population & Area
  const filledPopulation = await typeInto('e.g. 500000', '500000');
  const filledArea = await typeInto('e.g. 150', '1500');
  await clickButtonByText('Next Step');

  // Step 2: Transport & Traffic
  const filledVehicles = await typeInto('e.g. 200000', '2000000');
  await clickButtonByText('Next Step');

  // Step 3: Industry & Electricity
  const filledElectricity = await typeInto('e.g. 1000000', '1000000');
  const pickedIndustry = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    const s = selects[0];
    if (!s) return null;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    setter.call(s, 'Very High');
    s.dispatchEvent(new Event('change', { bubbles: true }));
    return s.value;
  });
  await sleep(300);
  await clickButtonByText('Next Step');

  // Step 4: Review - capture exactly what the review screen displays.
  const reviewRows = await page.evaluate(() => {
    const rows = [];
    document.querySelectorAll('div.flex.justify-between').forEach((d) => {
      const spans = d.querySelectorAll('span');
      if (spans.length === 2) rows.push([spans[0].textContent.trim(), spans[1].textContent.trim()]);
    });
    return rows;
  });

  const beforeCount = record.length;
  await clickButtonByText('Generate Digital Twin');
  await sleep(5000);

  const afterProfile = await page.evaluate(() => ({
    saved: Object.keys(localStorage).filter((k) => k.startsWith('survey_v')).map((k) => k),
    activeLocation: localStorage.getItem('co2_location'),
    surveyErrorText: (() => {
      const alert = document.querySelector('[role="alert"]');
      return alert ? alert.textContent.trim() : null;
    })(),
    modalStillOpen: Array.from(document.querySelectorAll('h2')).some((h) => /Complete Area Profile/.test(h.textContent)),
    bodySnippet: document.body.innerText.slice(0, 700),
  }));

  const surveyRequests = record.slice(beforeCount);

  // ---------- Test B: Digital Twin map ----------
  await page.goto(`${BASE}/digital-twin`, { waitUntil: 'networkidle2' });
  await sleep(3500);

  const mapState = await page.evaluate(() => ({
    activeAreaText: (() => {
      const p = Array.from(document.querySelectorAll('p')).find((x) => /Active area/.test(x.textContent));
      return p ? p.textContent.trim() : null;
    })(),
    hasLeaflet: !!document.querySelector('#map .leaflet-container, .leaflet-container'),
    circleMarkers: document.querySelectorAll('.leaflet-interactive').length,
    mapFallbackShown: /Map visualization is not available/.test(document.body.innerText),
  }));

  // Four map modes
  const modes = {};
  for (const mode of ['co2', 'traffic', 'hotspots', 'capture']) {
    await page.click(`button[data-mode="${mode}"]`);
    await sleep(1200);
    modes[mode] = await page.evaluate(() => ({
      markers: document.querySelectorAll('.leaflet-interactive').length,
      crash: /Map visualization is not available/.test(document.body.innerText),
    }));
  }
  await page.click('button[data-mode="co2"]');
  await sleep(800);

  // ---------- Test C: Hotspots page ----------
  await page.goto(`${BASE}/hotspots`, { waitUntil: 'networkidle2' });
  await sleep(3000);
  const hotspotsPage = await page.evaluate(() => ({
    tableRows: document.querySelectorAll('table tbody tr').length,
    emptyState: /No .*hotspot|No data|not available/i.test(document.body.innerText),
    bodySnippet: document.body.innerText.slice(0, 400),
  }));

  // ---------- All pages use the active area ----------
  const pageChecks = {};
  for (const p of ['/dashboard', '/digital-twin', '/area-profile', '/analytics', '/hotspots', '/simulator', '/scenarios', '/recommendations']) {
    await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle2' });
    await sleep(1800);
    pageChecks[p] = await page.evaluate(() => ({
      mentionsActiveCity: /Anekal/.test(document.body.innerText),
      blank: document.body.innerText.trim().length < 40,
    }));
  }

  // ---------- Pune regression through the UI ----------
  await page.goto(`${BASE}/area-profile`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForSelector('#area-profile-search', { timeout: 15000 });
  await page.click('#area-profile-search');
  await page.type('#area-profile-search', 'Pune', { delay: 40 });
  let punePicked = false;
  for (let i = 0; i < 40; i++) {
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate((el) => el.textContent || '', b);
      if (/^Pune/i.test(text.trim()) && text.length < 120) {
        await b.click();
        punePicked = true;
        break;
      }
    }
    if (punePicked) break;
    await sleep(400);
  }
  await sleep(3000);
  const puneState = await page.evaluate(() => ({
    bodySnippet: document.body.innerText.slice(0, 900),
    surveyOpened: Array.from(document.querySelectorAll('h2')).some((h) => /Complete Area Profile/.test(h.textContent)),
    hasPrediction: /tonnes\/day/.test(document.body.innerText),
  }));

  await browser.close();

  const apiFailures = record.filter((r) => r.status >= 400);
  console.log('\n================ API CALLS (in order) ================');
  record.forEach((r) => {
    console.log(`${String(r.status).padEnd(4)} ${r.method.padEnd(5)} ${r.url}`);
  });
  console.log('\n================ API FAILURES ================');
  console.log(apiFailures.length === 0 ? 'NONE' : JSON.stringify(apiFailures, null, 2));
  console.log('\n================ BROWSER CONSOLE ERRORS ================');
  console.log(consoleErrors.length === 0 ? 'NONE' : JSON.stringify(consoleErrors, null, 2));
  console.log('\n================ PAGE ERRORS ================');
  console.log(pageErrors.length === 0 ? 'NONE' : JSON.stringify(pageErrors, null, 2));
  console.log('\n================ ANEKAL SURVEY ================');
  console.log('fields filled:', JSON.stringify({ filledPopulation, filledArea, filledVehicles, filledElectricity, pickedIndustry }));
  console.log('status messages:', JSON.stringify(statusMessage));
  console.log('review rows:', JSON.stringify(reviewRows, null, 2));
  console.log('requests during generate:', JSON.stringify(surveyRequests, null, 2));
  console.log('profile after generate:', JSON.stringify(afterProfile, null, 2));
  console.log('\n================ DIGITAL TWIN ================');
  console.log(JSON.stringify(mapState, null, 2));
  console.log('modes:', JSON.stringify(modes, null, 2));
  console.log('\n================ HOTSPOTS PAGE ================');
  console.log(JSON.stringify(hotspotsPage, null, 2));
  console.log('\n================ PAGE / ACTIVE AREA CHECKS ================');
  console.log(JSON.stringify(pageChecks, null, 2));
  console.log('\n================ PUNE REGRESSION ================');
  console.log(JSON.stringify(puneState, null, 2));
}

run().catch((e) => {
  console.error('TEST RUN FAILED:', e);
  console.log('partial API record:', JSON.stringify(record, null, 2));
  process.exit(1);
});

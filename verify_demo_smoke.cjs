/**
 * Demo-readiness smoke test, run in the exact order the demo will follow.
 * A location is established first so map/simulator/scenario flows are exercised
 * against a real active area.
 */
const puppeteer = require('./frontend/node_modules/puppeteer');

const BASE = 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const api = [];
const consoleErrors = [];
const pageErrors = [];
const R = {};

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e && e.message ? e.message : e)));
  page.on('response', async (res) => {
    const url = res.url();
    if (!url.includes('/api/')) return;
    let b = '';
    try { b = (await res.text()).slice(0, 200); } catch (e) { b = '<unreadable>'; }
    api.push({ m: res.request().method(), u: url.replace(BASE, ''), s: res.status(), b });
  });

  const snap = () => page.evaluate(() => ({
    path: location.pathname,
    chars: document.body.innerText.trim().length,
    blank: document.body.innerText.trim().length < 40,
    jsErrorText: /Cannot read propert|is not a function|Something went wrong/i.test(document.body.innerText),
  }));

  const activeAreaHeader = () => page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('p')).find((x) => /Active area/.test(x.textContent));
    return p ? p.textContent.trim().slice(0, 90) : null;
  });

  // ---- 1. Landing ----
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await sleep(1800);
  R['1_landing'] = { ...(await snap()), openDashboard: await page.evaluate(() => !!Array.from(document.querySelectorAll('a,button')).find((x) => /Open Dashboard/.test(x.textContent))) };

  // ---- 2. Dashboard (via the landing button) ----
  const dashClicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a,button')).find((x) => /Open Dashboard/.test(x.textContent));
    if (el) { el.click(); return true; }
    return false;
  });
  await sleep(3000);
  R['2_dashboard'] = { dashClicked, ...(await snap()) };

  // Establish a deterministic dataset-backed area before the map steps.
  await page.goto(`${BASE}/area-profile`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  await page.click('#area-profile-search');
  await page.type('#area-profile-search', 'Pune', { delay: 25 });
  const puneRow = await page.waitForFunction(
    () => {
      const tbody = document.querySelector('table tbody');
      if (!tbody) return null;
      const tr = Array.from(tbody.querySelectorAll('tr')).find((r) => /^Pune\b/.test(r.textContent.trim()));
      return tr ? true : null;
    },
    { timeout: 25000 }
  ).then(() => true).catch(() => false);
  // Pune is selected from the search dropdown on the Area Profile page.
  const punePicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => {
      const t = (b.textContent || '').trim();
      return t.startsWith('Pune') && t.length < 60 && /Maharashtra/.test(t);
    });
    if (btn) { btn.click(); return (btn.textContent || '').trim().slice(0, 40); }
    return null;
  });
  await sleep(4000);

  // ---- 3+4. Area Profile with Pune ----
  R['3_4_pune'] = {
    punePicked,
    surveyForcedOpen: await page.evaluate(() => Array.from(document.querySelectorAll('h2')).some((h) => /Complete Area Profile/.test(h.textContent))),
    view: await page.evaluate(() => {
      const t = document.body.innerText;
      const one = (re) => (t.match(re) || [])[1] || null;
      return {
        selectedArea: one(/Selected Area\s*\n?\s*([^\n]+)/),
        dataSource: one(/Data source\s*\n?\s*([^\n]+)/),
        status: one(/Status\s*\n?\s*([^\n]+)/),
        prediction: (t.match(/[\d.]+ tonnes\/day/) || [])[0] || null,
        datasetBacked: /Dataset-backed/.test(t),
        inputsShown: /View area inputs used for the prediction/.test(t),
      };
    }),
    activeLocation: await page.evaluate(() => { try { const l = JSON.parse(localStorage.getItem('co2_location')); return { city: l.city, baseline: l.baselineCo2, source: l.dataSource }; } catch (e) { return null; } }),
  };

  // ---- 5+6. Digital Twin and the four modes ----
  await page.goto(`${BASE}/digital-twin`, { waitUntil: 'networkidle2' });
  await sleep(4000);
  const modes = {};
  for (const mode of ['co2', 'traffic', 'hotspots', 'capture']) {
    await page.click(`button[data-mode="${mode}"]`).catch(() => {});
    await sleep(1400);
    modes[mode] = await page.evaluate((m) => {
      const btn = document.querySelector(`button[data-mode="${m}"]`);
      return {
        buttonActive: btn ? /bg-green-600/.test(btn.className) : false,
        markers: document.querySelectorAll('.leaflet-interactive').length,
      };
    }, mode);
  }
  await page.click('button[data-mode="co2"]').catch(() => {});
  await sleep(1200);
  R['5_6_digital_twin'] = {
    mapRendered: await page.evaluate(() => !!document.querySelector('.leaflet-container')),
    mapFallback: await page.evaluate(() => /Map visualization is not available/.test(document.body.innerText)),
    activeArea: await activeAreaHeader(),
    modes,
  };

  // ---- 7. Analytics ----
  await page.goto(`${BASE}/analytics`, { waitUntil: 'networkidle2' });
  await sleep(3500);
  R['7_analytics'] = { ...(await snap()), charts: await page.evaluate(() => document.querySelectorAll('svg.recharts-surface').length) };

  // ---- 8. Hotspots ----
  await page.goto(`${BASE}/hotspots`, { waitUntil: 'networkidle2' });
  await sleep(3500);
  R['8_hotspots'] = { ...(await snap()), rows: await page.evaluate(() => document.querySelectorAll('table tbody tr').length) };
  const hotspotRowClickable = await page.evaluate(() => {
    const tr = document.querySelector('table tbody tr');
    if (tr) { tr.click(); return true; }
    return false;
  });
  await sleep(2500);
  R['8b_hotspot_detail'] = {
    rowClicked: hotspotRowClickable,
    detailPanel: await page.evaluate(() => /Recommended intervention|traffic level|Main factor/i.test(document.body.innerText)),
    detailRequests: api.filter((r) => /\/api\/hotspots\/\d/.test(r.u)).length,
  };

  // ---- 9. Simulator: run one simulation ----
  await page.goto(`${BASE}/simulator`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  const interventionPicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('div')).find((d) => (d.textContent || '').trim() === 'Tree Plantation');
    if (el) { el.click(); return true; }
    return false;
  });
  await sleep(1000);
  const beforeSim = api.length;
  const runClicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => /Run Simulation/.test(x.textContent));
    if (!b) return 'not-found';
    if (b.disabled) return 'disabled';
    b.click();
    return 'clicked';
  });
  await sleep(8000);
  R['9_simulator'] = {
    interventionPicked,
    runClicked,
    simRequests: api.slice(beforeSim).filter((r) => r.u.includes('simulation')),
    resultsShown: await page.evaluate(() => /Capture Potential|Reduction|Projected|trees|kg\/day|tonnes\/day/i.test(document.body.innerText)),
    activeArea: await page.evaluate(() => {
      const t = document.body.innerText;
      return (t.match(/Selected Location\s*\n?\s*([^\n]+)/) || [])[1] || null;
    }),
  };

  // ---- 10. Scenarios: select one scenario row ----
  await page.goto(`${BASE}/scenarios`, { waitUntil: 'networkidle2' });
  await sleep(3500);
  const scenarioRows = await page.evaluate(() => document.querySelectorAll('table tbody tr').length);
  const scenarioSelected = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    const target = rows[1] || rows[0];
    if (!target) return null;
    const name = target.querySelector('td') ? target.querySelector('td').textContent.trim() : '';
    target.click();
    return name;
  });
  await sleep(2500);
  R['10_scenarios'] = {
    scenarioRows,
    scenarioSelected,
    comparisonShown: await page.evaluate(() => /vs Current State/.test(document.body.innerText)),
    chart: await page.evaluate(() => document.querySelectorAll('svg.recharts-surface').length),
  };

  // ---- 11. Recommendations ----
  await page.goto(`${BASE}/recommendations`, { waitUntil: 'networkidle2' });
  await sleep(4000);
  const recCount = await page.evaluate(() => document.querySelectorAll('div[class*="rounded"]').length);
  R['11_recommendations'] = {
    ...(await snap()),
    cardCount: recCount,
    recRequest: api.filter((r) => r.u.includes('recommendations')).slice(-1)[0] || null,
  };

  // ---- 12. Home navigation ----
  const homeClicked = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find((x) => x.textContent.trim() === 'Home');
    if (a) { a.click(); return true; }
    return false;
  });
  await sleep(2500);
  R['12_home'] = { homeClicked, ...(await snap()) };

  await browser.close();

  console.log('================ SMOKE RESULTS ================');
  console.log(JSON.stringify(R, null, 2));
  const fails = api.filter((r) => r.s >= 400);
  console.log('\nAPI FAILURES:', fails.length === 0 ? 'NONE' : JSON.stringify(fails, null, 2));
  console.log('API 500s:', api.filter((r) => r.s >= 500).length);
  console.log('CONSOLE ERRORS:', consoleErrors.length === 0 ? 'NONE' : JSON.stringify(consoleErrors, null, 2));
  console.log('PAGE ERRORS:', pageErrors.length === 0 ? 'NONE' : JSON.stringify(pageErrors, null, 2));
  console.log('\nRELEVANT API CALLS:');
  api.filter((r) => /simulation|scenarios|recommendations|survey|locations\/details|map\/markers|kpi\?city=Pune|hotspots\?city=Pune/.test(r.u))
     .forEach((r) => console.log(`${String(r.s).padEnd(4)} ${r.m.padEnd(5)} ${r.u}`));
}

run().catch((e) => { console.error('SMOKE FAILED:', e); console.log(JSON.stringify(api, null, 2)); process.exit(1); });

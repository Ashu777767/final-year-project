/**
 * Regression verification: Coimbatore survey -> Generate -> prediction (+ Home nav).
 * Drives the real app at http://localhost:5173 exactly as a user does.
 */
const puppeteer = require('./frontend/node_modules/puppeteer');

const BASE = 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const record = [];
const consoleErrors = [];
const pageErrors = [];

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(String(err && err.message ? err.message : err)));
  page.on('response', async (res) => {
    const url = res.url();
    if (!url.includes('/api/')) return;
    let body = '';
    try { body = (await res.text()).slice(0, 300); } catch (e) { body = '<unreadable>'; }
    record.push({ method: res.request().method(), url: url.replace(BASE, ''), status: res.status(), body });
  });

  const clickButtonByText = async (text) => {
    const ok = await page.evaluate((t) => {
      const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent && x.textContent.trim().includes(t));
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

  const selectResult = async (re) => {
    for (let i = 0; i < 40; i++) {
      const buttons = await page.$$('button');
      for (const b of buttons) {
        const text = await page.evaluate((el) => el.textContent || '', b);
        if (re.test(text.trim()) && text.length < 120) { await b.click(); return true; }
      }
      await sleep(400);
    }
    return false;
  };

  const modalOpen = () => page.evaluate(() =>
    Array.from(document.querySelectorAll('h2')).some((h) => /Complete Area Profile/.test(h.textContent))
  );

  // ---------- Coimbatore survey ----------
  await page.goto(`${BASE}/area-profile`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForSelector('#area-profile-search', { timeout: 15000 });
  await page.click('#area-profile-search');
  await page.type('#area-profile-search', 'Coimbatore', { delay: 40 });

  const picked = await selectResult(/^Coimbatore/i);
  await sleep(3000);

  let opened = await modalOpen();
  if (!opened) {
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find((x) => /Complete Area Profile/i.test(x.textContent));
      if (b) b.click();
    });
    await sleep(1500);
    opened = await modalOpen();
  }

  const coimbatore = { picked, surveyOpened: opened };

  if (opened) {
    await typeInto('e.g. 500000', '1800000');
    await typeInto('e.g. 150', '246.75');
    await clickButtonByText('Next Step');
    await typeInto('e.g. 200000', '900000');
    await clickButtonByText('Next Step');
    await typeInto('e.g. 1000000', '4500000');
    await page.evaluate(() => {
      const s = document.querySelectorAll('select')[0];
      if (s) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        setter.call(s, 'High');
        s.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(300);
    await clickButtonByText('Next Step');

    const before = record.length;
    await clickButtonByText('Generate Digital Twin');
    await sleep(5000);
    coimbatore.generateRequests = record.slice(before);
    coimbatore.state = await page.evaluate(() => ({
      error: (() => { const a = document.querySelector('[role="alert"]'); return a ? a.textContent.trim() : null; })(),
      savedKeys: Object.keys(localStorage).filter((k) => k.startsWith('survey_v')),
      activeCity: (() => { try { return JSON.parse(localStorage.getItem('co2_location')).city; } catch (e) { return null; } })(),
      baseline: (() => { try { return JSON.parse(localStorage.getItem('co2_location')).baselineCo2; } catch (e) { return null; } })(),
      snippet: document.body.innerText.slice(0, 500),
    }));
  }

  // ---------- Home navigation ----------
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  const landing = await page.evaluate(() => ({ text: document.body.innerText.slice(0, 300), buttons: Array.from(document.querySelectorAll('button, a')).map((b) => b.textContent.trim()).filter(Boolean).slice(0, 12) }));
  const homeNav = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('button, a')).find((x) => /home/i.test(x.textContent || ''));
    if (el) { el.click(); return true; }
    return false;
  });
  await sleep(2000);
  const afterHome = await page.evaluate(() => ({ url: location.pathname, text: document.body.innerText.slice(0, 200) }));

  await browser.close();

  console.log('================ COIMBATORE ================');
  console.log(JSON.stringify(coimbatore, null, 2));
  console.log('\n================ HOME NAV ================');
  console.log('landing:', JSON.stringify(landing));
  console.log('homeButtonFound:', homeNav, '-> after:', JSON.stringify(afterHome));
  console.log('\n================ ALL API CALLS ================');
  record.forEach((r) => console.log(`${String(r.status).padEnd(4)} ${r.method.padEnd(5)} ${r.url}`));
  console.log('\nAPI FAILURES:', record.filter((r) => r.status >= 400).length);
  console.log('CONSOLE ERRORS:', consoleErrors.length === 0 ? 'NONE' : JSON.stringify(consoleErrors, null, 2));
  console.log('PAGE ERRORS:', pageErrors.length === 0 ? 'NONE' : JSON.stringify(pageErrors, null, 2));
}

run().catch((e) => {
  console.error('TEST RUN FAILED:', e);
  console.log('partial API record:', JSON.stringify(record, null, 2));
  process.exit(1);
});

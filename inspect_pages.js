const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const routes = ['/', '/digital-twin', '/simulator', '/analytics', '/hotspots', '/recommendations', '/scenarios'];
  for (const r of routes) {
    const url = `http://localhost:5173${r}`;
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 15000});
    await page.waitForTimeout(2000);
    const html = await page.content();
    const safeRoute = r.replace(/\//g, '_') || 'root';
    const filePath = `C:/Users/amank/.gemini/antigravity/brain/34f82c5c-1bef-44a0-a6a7-b1b4979cfb61/${safeRoute}.html`;
    fs.writeFileSync(filePath, html);
    await page.screenshot({path: `C:/Users/amank/.gemini/antigravity/brain/34f82c5c-1bef-44a0-a6a7-b1b4979cfb61/${safeRoute}.png`});
    console.log(`Saved ${filePath}`);
  }
  await browser.close();
})();

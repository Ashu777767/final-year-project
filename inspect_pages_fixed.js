(async () => {
  const puppeteerModule = await import('puppeteer');
  const puppeteer = puppeteerModule.default || puppeteerModule;
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const routes = ['/', '/digital-twin', '/simulator', '/analytics', '/hotspots', '/recommendations', '/scenarios'];
  const fs = require('fs');
  for (const r of routes) {
    const url = `http://localhost:5173${r}`;
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 15000});
    await new Promise(r => setTimeout(r, 2000));
    const html = await page.content();
    const safeRoute = r === '/' ? 'root' : r.replace(/\//g, '_');
    const htmlPath = `C:/Users/amank/.gemini/antigravity/brain/34f82c5c-1bef-44a0-a6a7-b1b4979cfb61/${safeRoute}.html`;
    const pngPath = `C:/Users/amank/.gemini/antigravity/brain/34f82c5c-1bef-44a0-a6a7-b1b4979cfb61/${safeRoute}.png`;
    fs.writeFileSync(htmlPath, html);
    await page.screenshot({path: pngPath});
    console.log(`Saved ${htmlPath} and screenshot`);
  }
  await browser.close();
})();

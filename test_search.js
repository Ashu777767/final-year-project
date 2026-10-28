const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Type in search bar
    await page.type('input[placeholder="Search Indian City..."]', 'Surat');
    
    // Wait for dropdown results
    await page.waitForSelector('.absolute.top-full.left-0', { timeout: 5000 });
    
    // Click the first result
    await page.click('.absolute.top-full.left-0 > div:first-child');
    
    // Wait for SurveyModal
    await page.waitForSelector('h2:contains("Location Survey")', { timeout: 5000 }).catch(() => {});
    
    // Just take a screenshot
    await page.screenshot({ path: 'C:\\Users\\amank\\.gemini\\antigravity\\brain\\34f82c5c-1bef-44a0-a6a7-b1b4979cfb61\\artifacts\\survey_modal.png', fullPage: true });
    
    console.log("Screenshot taken.");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
})();

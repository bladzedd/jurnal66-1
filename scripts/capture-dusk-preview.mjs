import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';
const BASE_URL = 'http://localhost:4173';

async function preview() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  // 1. Capture Login Screen in Dusk Theme
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'dusk_preview_login.png'),
    fullPage: false
  });
  console.log('✓ Captured dusk_preview_login.png');

  // 2. Click "BUKA MEJA" to enter Dashboard
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const bukaBtn = btns.find(b => b.innerText.includes('BUKA MEJA'));
    if (bukaBtn) bukaBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'dusk_preview_dashboard.png'),
    fullPage: false
  });
  console.log('✓ Captured dusk_preview_dashboard.png');

  // 3. Open Admin Page
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find(b => b.innerText.includes('Meja Guru'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    await pinInput.type('GURU2026');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'dusk_preview_admin.png'),
      fullPage: false
    });
    console.log('✓ Captured dusk_preview_admin.png');
  }

  await browser.close();
}

preview().catch(err => {
  console.error(err);
  process.exit(1);
});

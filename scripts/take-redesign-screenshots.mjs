import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';
const BASE_URL = 'http://localhost:4173';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Screenshot Login Screen
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'redesign_01_login_screen.png'), fullPage: false });
  console.log('Saved redesign_01_login_screen.png');

  // 2. Open Admin
  await page.evaluate(() => {
    sessionStorage.setItem('redaksi_admin_auth', 'true');
    const links = Array.from(document.querySelectorAll('button, a'));
    const target = links.find(el => el.textContent.includes('Meja Guru'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'redesign_02_admin_dashboard.png'), fullPage: true });
  console.log('Saved redesign_02_admin_dashboard.png');

  await browser.close();
})();

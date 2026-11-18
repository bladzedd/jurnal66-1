import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';
const BASE_URL = 'http://localhost:4173';

async function captureDuskSuite() {
  console.log('🚀 Starting Dusk Theme Screenshot Suite...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  // 1. Login Screen
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_dusk_login.png'),
    fullPage: false
  });
  console.log('✓ 1. screenshot_dusk_login.png');

  // 2. Open Admin PIN Gatekeeper
  const adminBtn = await page.waitForSelector('button[title*="Meja Guru"], button[title*="Pusat Komando"]');
  await adminBtn.click();
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_dusk_admin_pin.png'),
    fullPage: false
  });
  console.log('✓ 2. screenshot_dusk_admin_pin.png');

  // 3. Enter PIN & capture Admin Command Center
  const pinInput = await page.waitForSelector('input[type="password"]');
  await pinInput.type('GURU2026');
  const submitBtn = await page.waitForSelector('button[type="submit"]');
  await submitBtn.click();
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_dusk_admin_command.png'),
    fullPage: false
  });
  console.log('✓ 3. screenshot_dusk_admin_command.png');

  // 4. Return to Student view & enter Dashboard
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const backBtn = btns.find(b => b.innerText.toLowerCase().includes('kembali ke siswa') || b.innerText.toLowerCase().includes('kembali'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const bukaBtn = btns.find(b => b.innerText.toLowerCase().includes('buka meja'));
    if (bukaBtn) bukaBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_dusk_dashboard.png'),
    fullPage: false
  });
  console.log('✓ 4. screenshot_dusk_dashboard.png');

  // 5. Open Shop Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const shopBtn = btns.find(b => b.innerText.includes('Koin') || b.title?.includes('Toko'));
    if (shopBtn) shopBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_dusk_shop_modal.png'),
    fullPage: false
  });
  console.log('✓ 5. screenshot_dusk_shop_modal.png');

  // Close shop modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Tutup Toko"], button[aria-label="Tutup"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 6. Enter Stage 1 (5W+1H)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const stageBtn = btns.find(b => b.innerText.toLowerCase().includes('kerjakan tahap ini'));
    if (stageBtn) stageBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_dusk_stage1.png'),
    fullPage: false
  });
  console.log('✓ 6. screenshot_dusk_stage1.png');

  await browser.close();
  console.log('🎉 Dusk Theme Suite Captured Successfully!');
}

captureDuskSuite().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';
const BASE_URL = 'http://localhost:4173';

async function verifyGuestPrivacy() {
  console.log('🚀 Verifying guest & unassigned student privacy...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  const pageText = await page.evaluate(() => document.body.innerText);

  // Assert that other groups are NOT listed
  if (pageText.includes('Sesi Biro Terdaftar') || pageText.includes('BUKA MEJA')) {
    throw new Error('FAILED: Registered groups list or "BUKA MEJA" is still visible to guests!');
  }

  // Assert that privacy statement is present
  if (!pageText.includes('Kerahasiaan Ruang Redaksi Terjaga')) {
    throw new Error('FAILED: Privacy notice not found!');
  }

  console.log('✓ Verified: No other groups or secret codes are leaked to guests!');

  // Capture screenshot of guest screen
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_guest_privacy_guaranteed.png'),
    fullPage: false
  });
  console.log('✓ Captured screenshot_guest_privacy_guaranteed.png');

  // Verify that legitimate login still works with 5-character code
  const memberCodeInput = await page.$('input[placeholder*="UD19J"]');
  const nameInput = await page.$('input[placeholder*="Nama Lengkap"]');
  const classInput = await page.$('input[placeholder*="8A"]');
  const submitBtn = await page.$('button[type="submit"]');

  await memberCodeInput.type('UD19J');
  await nameInput.type('Zahra Aurelia');
  await classInput.type('8B');
  await submitBtn.click();
  await new Promise(r => setTimeout(r, 800));

  const dashboardText = await page.evaluate(() => document.body.innerText);
  if (!dashboardText.includes('Biro Redaksi Garuda') || !dashboardText.includes('Zahra Aurelia')) {
    throw new Error('FAILED: Authorized login via 5-character code failed!');
  }

  console.log('✓ Verified: Legitimate student entry with code UD19J succeeded!');

  await browser.close();
  console.log('🎉 Guest Privacy Verification Passed with 100% success!');
}

verifyGuestPrivacy().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

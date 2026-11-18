import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';
const BASE_URL = 'http://localhost:4173';

async function captureAllDusk() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  // 1. Enter Admin and unlock Stage 2
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  const adminBtn = await page.waitForSelector('button[title*="Meja Guru"], button[title*="Pusat Komando"]');
  await adminBtn.click();
  const pinInput = await page.waitForSelector('input[type="password"]');
  await pinInput.type('GURU2026');
  const submitBtn = await page.waitForSelector('button[type="submit"]');
  await submitBtn.click();
  await new Promise(r => setTimeout(r, 600));

  // Switch to Tab 2 and unlock Stage 2
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab2 = btns.find(b => b.innerText.includes('2. Orkestrasi Tahap'));
    if (tab2) tab2.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const s2 = btns.find(b => b.innerText.includes('Buka Tahap 2: Piramida Terbalik'));
    if (s2) s2.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Return to student view
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const backBtn = btns.find(b => b.innerText.toLowerCase().includes('kembali ke siswa') || b.innerText.toLowerCase().includes('kembali'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Enter Dashboard
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const bukaBtn = btns.find(b => b.innerText.toLowerCase().includes('buka meja'));
    if (bukaBtn) bukaBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Kerjakan Tahap 2
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const stageBtn = btns.find(b => b.innerText.toLowerCase().includes('kerjakan tahap ini'));
    if (stageBtn) stageBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_dusk_stage2_pyramid.png'),
    fullPage: false
  });
  console.log('✓ Captured screenshot_dusk_stage2_pyramid.png');

  // Go back to home, then unlock Stage 3 in admin
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const backHome = btns.find(b => b.innerText.toLowerCase().includes('kembali ke meja redaksi') || b.innerText.toLowerCase().includes('kembali'));
    if (backHome) backHome.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const adminHeaderBtn = await page.$('button[title*="Panel Guru"], button[title*="Meja Guru"]');
  if (adminHeaderBtn) await adminHeaderBtn.click();
  await new Promise(r => setTimeout(r, 600));

  // Tab 2 -> Unlock Stage 3
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab2 = btns.find(b => b.innerText.includes('2. Orkestrasi Tahap'));
    if (tab2) tab2.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const s3 = btns.find(b => b.innerText.includes('Buka Tahap 3: Menulis Berita Utuh'));
    if (s3) s3.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Return to student view
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const backBtn = btns.find(b => b.innerText.toLowerCase().includes('kembali ke siswa') || b.innerText.toLowerCase().includes('kembali'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Kerjakan Tahap 3
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const stageBtn = btns.find(b => b.innerText.toLowerCase().includes('kerjakan tahap ini'));
    if (stageBtn) stageBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_dusk_stage3_writing.png'),
    fullPage: false
  });
  console.log('✓ Captured screenshot_dusk_stage3_writing.png');

  await browser.close();
}

captureAllDusk().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

import puppeteer from 'puppeteer';
import path from 'path';

const outDir = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Standard mobile phone viewport: 390 x 844
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // 1. Mobile Login
  console.log("Capturing mobile_login.png...");
  await page.screenshot({ path: path.join(outDir, 'mobile_login.png') });

  // Register Team
  await page.type('input[placeholder*="Kelompok 1"]', 'Biro Investigasi Garuda');
  await page.type('input[placeholder*="Nama Lengkap Siswa"]', 'Ahmad Pratama');
  await page.type('input[placeholder*="Kelas (cth: 8A, 9B)"]', '8-A');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('BUKA MEJA REDAKSI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. Mobile Dashboard
  console.log("Capturing mobile_dashboard.png...");
  await page.screenshot({ path: path.join(outDir, 'mobile_dashboard.png') });

  // 3. Mobile Stage 1
  console.log("Capturing mobile_stage1_5w1h.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_stage1_5w1h.png') });

  // 4. Mobile Stage 2
  console.log("Capturing mobile_stage2_pyramid.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KEMBALI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    localStorage.setItem('redaksi_classroom_stage_v5', '2');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_stage2_pyramid.png') });

  // 5. Mobile Stage 3
  console.log("Capturing mobile_stage3_writing.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KEMBALI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    localStorage.setItem('redaksi_classroom_stage_v5', '3');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_stage3_writing.png') });

  // 6. Mobile Toko Modal
  console.log("Capturing mobile_toko_modal.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KEMBALI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KOIN'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_toko_modal.png') });

  // 7. Mobile Kartu Pers Modal
  console.log("Capturing mobile_kartupers_modal.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Tutup Toko');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KARTU PERS') || b.getAttribute('title') === 'Kartu Biro Pers');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_kartupers_modal.png') });

  await browser.close();
  console.log("ALL MOBILE SCREENSHOTS CAPTURED!");
}

run().catch(err => {
  console.error("Capture failed:", err);
  process.exit(1);
});

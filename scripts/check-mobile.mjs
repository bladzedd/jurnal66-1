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
  // Mobile viewport: iPhone 12 / 13 / 14 dimensions: 390 x 844
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  console.log("1. Checking Mobile Login...");
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'mobile_check_login.png'), fullPage: false });

  // Check horizontal overflow
  const loginOverflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });
  console.log("Login overflow stats:", loginOverflow);

  // Register a team
  await page.type('input[placeholder*="Kelompok 1"]', 'Tim Elang Mobile');
  await page.type('input[placeholder*="Nama Lengkap Siswa"]', 'Rian Hidayat');
  await page.type('input[placeholder*="Kelas (cth: 8A, 9B)"]', '8-B');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('BUKA MEJA REDAKSI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. Check Mobile Dashboard
  console.log("2. Checking Mobile Dashboard...");
  await page.screenshot({ path: path.join(outDir, 'mobile_check_dashboard.png'), fullPage: false });
  const dashOverflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  console.log("Dashboard overflow stats:", dashOverflow);

  // 3. Check Mobile Stage 1 (Game 5W1H)
  console.log("3. Checking Mobile Stage 1...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_check_stage1.png'), fullPage: false });
  const stage1Overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  console.log("Stage 1 overflow stats:", stage1Overflow);

  // Go back to dashboard and switch to Stage 2
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Kembali ke Meja Redaksi'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    localStorage.setItem('redaksi_classroom_stage_v5', '2');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 4. Check Mobile Stage 2 (Game Pyramid)
  console.log("4. Checking Mobile Stage 2...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_check_stage2.png'), fullPage: false });
  const stage2Overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  console.log("Stage 2 overflow stats:", stage2Overflow);

  // Go back and switch to Stage 3
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Kembali ke Meja Redaksi'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    localStorage.setItem('redaksi_classroom_stage_v5', '3');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 5. Check Mobile Stage 3 (Game Write News)
  console.log("5. Checking Mobile Stage 3...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_check_stage3.png'), fullPage: false });
  const stage3Overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  console.log("Stage 3 overflow stats:", stage3Overflow);

  // Go back to dashboard and open modals (Toko Redaksi and Kartu Pers)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Kembali ke Meja Redaksi'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Check Toko Modal
  console.log("6. Checking Mobile Toko Modal...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Toko Redaksi'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_check_modal_toko.png'), fullPage: false });

  // Close Toko and open Kartu Pers
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('TUTUP'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  console.log("7. Checking Mobile Kartu Pers Modal...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KARTU PERS'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'mobile_check_modal_kartupers.png'), fullPage: false });

  await browser.close();
  console.log("MOBILE CHECKS FINISHED!");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

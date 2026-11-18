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
  await page.setViewport({ width: 1280, height: 950 });

  console.log("Navigating to http://localhost:4173/ ...");
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // Reset localStorage
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // 1. Register Team "Biro Investigasi Garuda"
  console.log("1. Registering Team 1...");
  await page.type('input[placeholder*="Kelompok 1"]', 'Biro Investigasi Garuda');
  await page.type('input[placeholder*="Nama Lengkap Siswa"]', 'Ahmad Pratama');
  await page.type('input[placeholder*="Kelas (cth: 8A, 9B)"]', '8-A');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Tambah Anggota'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  // Add 2nd member
  const memberInputs = await page.$$('input[placeholder*="Nama Lengkap Siswa"]');
  const classInputs = await page.$$('input[placeholder*="Kelas (cth: 8A, 9B)"]');
  if (memberInputs.length > 1 && classInputs.length > 1) {
    await memberInputs[1].type('Siti Nurhaliza');
    await classInputs[1].type('9-B');
  }

  // Click Buka Meja Redaksi
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('BUKA MEJA REDAKSI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Capture Dashboard Stage 1
  console.log("2. Capturing Dashboard Stage 1...");
  await page.screenshot({ path: path.join(outDir, 'screenshot_30min_dashboard_stage1.png') });

  // Open Stage 1 Game
  console.log("3. Opening Stage 1 (3 Kasus Investigasi 5W+1H)...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'screenshot_stage1_multicase.png') });

  // Return to Dashboard and simulate Classroom Stage 2
  console.log("4. Simulating Classroom Stage 2 (Piramida Terbalik)...");
  await page.evaluate(() => {
    const raw = localStorage.getItem('redaksi_siswa_teams_v5');
    if (raw) {
      const teams = JSON.parse(raw);
      if (teams.length > 0) {
        teams[0].completedStages = [1];
        localStorage.setItem('redaksi_siswa_teams_v5', JSON.stringify(teams));
      }
    }
    localStorage.setItem('redaksi_classroom_stage_v5', '2');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  // Open Stage 2 Game
  console.log("5. Opening Stage 2 Game (5-Tier Inverted Pyramid)...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'screenshot_stage2_pyramid_5tiers.png') });

  // Simulate Classroom Stage 3
  console.log("6. Simulating Classroom Stage 3 (Menulis Berita Utuh)...");
  await page.evaluate(() => {
    const raw = localStorage.getItem('redaksi_siswa_teams_v5');
    if (raw) {
      const teams = JSON.parse(raw);
      if (teams.length > 0) {
        teams[0].completedStages = [1, 2];
        localStorage.setItem('redaksi_siswa_teams_v5', JSON.stringify(teams));
      }
    }
    localStorage.setItem('redaksi_classroom_stage_v5', '3');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  // Open Stage 3 Game
  console.log("7. Opening Stage 3 Game (4 Langkah Editorial Straight News)...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'screenshot_stage3_writing_newsroom.png') });

  await browser.close();
  console.log("ALL STAGE SCREENSHOTS CAPTURED!");
}

run().catch(err => {
  console.error("Capture failed:", err);
  process.exit(1);
});

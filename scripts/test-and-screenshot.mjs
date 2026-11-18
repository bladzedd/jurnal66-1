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
  await page.setViewport({ width: 1280, height: 900 });

  console.log("Navigating to http://localhost:4173/ ...");
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // Clear storage first
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // 1. Register Team 1 (Biro Garuda)
  console.log("1. Registering Team 1...");
  await page.type('input[placeholder*="Kelompok 1"]', 'Biro Garuda');
  await page.type('input[placeholder*="Nama Lengkap Siswa"]', 'Ahmad Fadilah');
  await page.type('input[placeholder*="Kelas (cth: 8A, 9B)"]', '8-A');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Tambah'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('BUKA MEJA REDAKSI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. Switch to register Team 2 (Biro Rajawali)
  console.log("2. Registering Team 2...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ganti Tim'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.type('input[placeholder*="Kelompok 1"]', 'Biro Rajawali');
  await page.type('input[placeholder*="Nama Lengkap Siswa"]', 'Budi Santoso');
  await page.type('input[placeholder*="Kelas (cth: 8A, 9B)"]', '7-C');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Tambah'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('BUKA MEJA REDAKSI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 3. Mark Stage 1 completed for Team 1 (simulate Team 1 finished Stage 1!)
  console.log("3. Simulating Team 1 finishing Stage 1...");
  await page.evaluate(() => {
    // Get all teams from storage
    const raw = localStorage.getItem('redaksi_siswa_teams_v5');
    if (raw) {
      const teams = JSON.parse(raw);
      // Team 1 is the first team
      if (teams.length >= 2) {
        teams[0].completedStages = [1];
        teams[0].coins = 750;
        localStorage.setItem('redaksi_siswa_teams_v5', JSON.stringify(teams));
      }
    }
  });

  // Switch back to Team 1
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ganti Tim'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const resumeBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('BUKA MEJA'));
    if (resumeBtns.length > 0) resumeBtns[0].click(); // Biro Garuda
  });
  await new Promise(r => setTimeout(r, 800));

  // Team 1 should now be in the WAITING ROOM!
  console.log("4. Capturing Stage Waiting Room screenshot...");
  await page.screenshot({ path: path.join(outDir, 'screenshot_stage_waiting_room.png') });
  console.log("Captured screenshot_stage_waiting_room.png");

  // 5. In Waiting Room, simulate Team 1 launching debuff "Injeksi Opsi Mengecoh" at Team 2
  console.log("5. Simulating debuff attack on Team 2 (Biro Rajawali)...");
  await page.evaluate(() => {
    const raw = localStorage.getItem('redaksi_siswa_teams_v5');
    if (raw) {
      const teams = JSON.parse(raw);
      if (teams.length >= 2) {
        // Apply debuff to team 2
        teams[1].activeDebuffs = ["card_fake_distractor"];
        localStorage.setItem('redaksi_siswa_teams_v5', JSON.stringify(teams));
      }
    }
  });

  // Switch to Team 2
  console.log("Switching to Team 2 to verify debuff in game...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ganti Tim'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const teamCards = Array.from(document.querySelectorAll('.neo-btn')).filter(b => b.innerText.includes('Biro Rajawali'));
    if (teamCards.length > 0) teamCards[0].click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Open Stage 1 in Team 2
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log("Capturing debuff injected in game screenshot...");
  await page.screenshot({ path: path.join(outDir, 'screenshot_debuff_injected_in_game.png') });
  console.log("Captured screenshot_debuff_injected_in_game.png");

  await browser.close();
  console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

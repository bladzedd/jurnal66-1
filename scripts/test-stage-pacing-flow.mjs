import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";

async function run() {
  console.log("=== COMPREHENSIVE E2E: TEACHER STAGE PACING & SYNCHRONIZATION FLOW ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // 1. Visit App
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  console.log("1. App loaded.");

  // Clear storage and set clean state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("redaksi_siswa_initialized_v5", "true");
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // 2. Open Admin (PIN 040498) to create group and set Stage 0 (Ruang Persiapan)
  console.log("2. Opening Admin Meja Guru to prepare slot and lock stage to 0...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find(b => b.textContent.includes('Meja Guru'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    await pinInput.type('040498');
    await page.keyboard.press('Enter');
  }
  await new Promise(r => setTimeout(r, 800));

  // In Admin, click "+ Terbitkan 1 Kode Ketua"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fastMintBtn = btns.find(b => b.textContent.includes('Terbitkan 1 Kode Ketua') || b.textContent.includes('Terbitkan Slot Cepat'));
    if (fastMintBtn) fastMintBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Retrieve the generated team codes from storage
  const createdTeam = await page.evaluate(() => {
    const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
    return teams[teams.length - 1];
  });
  console.log("Admin generated slot:", {
    name: createdTeam.name,
    leaderCode: createdTeam.leaderCode
  });

  // In Admin, set classroomStage to 0 (Persiapan)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const prepBtn = btns.find(b => b.textContent.includes('Persiapan (0)'));
    if (prepBtn) prepBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Exit Admin back to Landing Page
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 3. Log in as Ketua using Leader Code
  console.log(`3. Entering Leader Code: ${createdTeam.leaderCode}`);
  const leaderInput = await page.$('input[placeholder*="1X88H"]');
  await leaderInput.type(createdTeam.leaderCode);
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 600));

  // Fill Bureau Setup Form
  await page.evaluate(() => {
    const setVal = (el, val) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const inputs = Array.from(document.querySelectorAll('input'));
    if (inputs[0]) setVal(inputs[0], "Dewi Kartika");
    if (inputs[1]) setVal(inputs[1], "8A");
    if (inputs[2]) setVal(inputs[2], "Biro Garda Merdeka");
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  // 4. Verify Student Dashboard is in Pre-Session Lobby (Stage 0)
  const isPreSessionLobby = await page.evaluate(() => {
    const text = document.body.textContent;
    return text.includes("Ruang Persiapan Redaksi (Menunggu Guru)") ||
           text.includes("Lobi Pra-Sesi");
  });
  console.log("4. Pre-Session Lobby visible on Dashboard:", isPreSessionLobby);
  if (!isPreSessionLobby) {
    throw new Error("FAIL: Pre-Session Lobby banner not visible on Student Dashboard!");
  }

  const isStartLocked = await page.evaluate(() => {
    return document.body.textContent.includes("Menunggu Guru Membuka Tahap 1");
  });
  console.log("5. Start notice locked with teacher waiting message:", isStartLocked);
  if (!isStartLocked) {
    throw new Error("FAIL: Start notice should show teacher waiting message!");
  }

  // Verify there is NO Start Button on the dashboard in Stage 0
  const hasStartButton = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.textContent.includes("Mulai & Jawab Tugas"));
  });
  console.log("Verified 'Mulai & Jawab Tugas' button does NOT exist in Stage 0:", !hasStartButton);
  if (hasStartButton) {
    throw new Error("FAIL: Start button should not exist while in pre-session lobby!");
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_pacing_01_presession_locked.png'), fullPage: false });
  console.log("Saved verify_pacing_01_presession_locked.png");

  // 6. Teacher unlocks Tahap 1
  console.log("6. Teacher clicks 'Buka Tahap 1 Serentak'...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mejaGuruBtn = btns.find(b => b.textContent.includes('Meja Guru') || b.textContent.includes('Guru'));
    if (mejaGuruBtn) mejaGuruBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const pinInput2 = await page.$('input[type="password"]');
  if (pinInput2) {
    await pinInput2.type('040498');
    await page.keyboard.press('Enter');
  }
  await new Promise(r => setTimeout(r, 800));

  // Click 'Buka Tahap 1 Serentak'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const openStage1Btn = btns.find(b => b.textContent.includes('Buka Tahap 1 Serentak'));
    if (openStage1Btn) openStage1Btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Exit Admin back to Dashboard
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 7. Verify Tahap 1 Start Button is unlocked on Student Dashboard
  const stage1Unlocked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.textContent.includes("Mulai & Jawab Tugas (Ketua)") || b.textContent.includes("Buka Berkas Liputan 5W+1H"));
  });
  console.log("7. Stage 1 Start Button unlocked:", stage1Unlocked);
  if (!stage1Unlocked) {
    throw new Error("FAIL: Stage 1 start button not unlocked after teacher opened Tahap 1!");
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_pacing_02_stage1_unlocked.png'), fullPage: false });
  console.log("Saved verify_pacing_02_stage1_unlocked.png");

  // 8. Complete Stage 1 and return to Dashboard
  console.log("8. Completing Stage 1...");
  await page.evaluate(() => {
    const activeTeamId = localStorage.getItem("redaksi_siswa_active_team_id_v5");
    const teams = JSON.parse(localStorage.getItem("redaksi_siswa_teams_v5") || "[]");
    const t = teams.find(item => item.id === activeTeamId);
    if (t) {
      t.completedStages = [1];
      t.stageScores = { 1: 100 };
      t.stageTimers = { 1: { durationSeconds: 125, isPaused: true, isCompleted: true } };
      localStorage.setItem("redaksi_siswa_teams_v5", JSON.stringify(teams));
    }
    localStorage.removeItem("redaksi_siswa_active_module_v5");
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 9. Verify Team is held in StageWaitingRoom for Tahap 2
  const inWaitingRoom1 = await page.evaluate(() => {
    const text = document.body.textContent;
    return text.includes("Tahap #1 Tuntas & Terkunci!") &&
           text.includes("Waktu kerja biro resmi di-pause");
  });
  console.log("9. Team entered StageWaitingRoom waiting for Tahap 2:", inWaitingRoom1);
  if (!inWaitingRoom1) {
    throw new Error("FAIL: Team did not enter StageWaitingRoom after completing Stage 1!");
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_pacing_03_stage1_waiting_room.png'), fullPage: false });
  console.log("Saved verify_pacing_03_stage1_waiting_room.png");

  // 10. Teacher opens Tahap 2
  console.log("10. Teacher opens Tahap 2 Serentak from Admin...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mejaGuruBtn = btns.find(b => b.textContent.includes('Meja Guru') || b.textContent.includes('Guru'));
    if (mejaGuruBtn) mejaGuruBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const pinInput3 = await page.$('input[type="password"]');
  if (pinInput3) {
    await pinInput3.type('040498');
    await page.keyboard.press('Enter');
  }
  await new Promise(r => setTimeout(r, 800));

  // In Admin, click 'Buka Tahap 2 Serentak'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const openStage2Btn = btns.find(b => b.textContent.includes('Buka Tahap 2 Serentak'));
    if (openStage2Btn) openStage2Btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Exit Admin
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 11. Verify Team automatically advances to Tahap 2 on Student Dashboard
  const stage2Unlocked = await page.evaluate(() => {
    const text = document.body.textContent;
    return text.includes("Tahap 2: Struktur Berita Piramida Terbalik") ||
           text.includes("Piramida Terbalik");
  });
  console.log("11. Team successfully advanced to Tahap 2:", stage2Unlocked);
  if (!stage2Unlocked) {
    throw new Error("FAIL: Team did not advance to Tahap 2 after teacher unlocked Tahap 2!");
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_pacing_04_stage2_unlocked.png'), fullPage: false });
  console.log("Saved verify_pacing_04_stage2_unlocked.png");

  // 12. Complete Stage 2
  console.log("12. Completing Stage 2...");
  await page.evaluate(() => {
    const activeTeamId = localStorage.getItem("redaksi_siswa_active_team_id_v5");
    const teams = JSON.parse(localStorage.getItem("redaksi_siswa_teams_v5") || "[]");
    const t = teams.find(item => item.id === activeTeamId);
    if (t) {
      t.completedStages = [1, 2];
      t.stageScores = { 1: 100, 2: 95 };
      t.stageTimers = { 
        1: { durationSeconds: 125, isPaused: true, isCompleted: true },
        2: { durationSeconds: 180, isPaused: true, isCompleted: true }
      };
      localStorage.setItem("redaksi_siswa_teams_v5", JSON.stringify(teams));
    }
    localStorage.removeItem("redaksi_siswa_active_module_v5");
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 13. Verify StageWaitingRoom waiting for Tahap 3
  const inWaitingRoom2 = await page.evaluate(() => {
    const text = document.body.textContent;
    return text.includes("Tahap #2 Tuntas & Terkunci!") &&
           text.includes("Waktu kerja biro resmi di-pause");
  });
  console.log("13. Team entered StageWaitingRoom waiting for Tahap 3:", inWaitingRoom2);
  if (!inWaitingRoom2) {
    throw new Error("FAIL: Team did not enter StageWaitingRoom after completing Stage 2!");
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_pacing_05_stage2_waiting_room.png'), fullPage: false });
  console.log("Saved verify_pacing_05_stage2_waiting_room.png");

  // 14. Teacher opens Tahap 3
  console.log("14. Teacher opens Tahap 3 Serentak from Admin...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mejaGuruBtn = btns.find(b => b.textContent.includes('Meja Guru') || b.textContent.includes('Guru'));
    if (mejaGuruBtn) mejaGuruBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const pinInput4 = await page.$('input[type="password"]');
  if (pinInput4) {
    await pinInput4.type('040498');
    await page.keyboard.press('Enter');
  }
  await new Promise(r => setTimeout(r, 800));

  // Click 'Buka Tahap 3 Serentak'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const openStage3Btn = btns.find(b => b.textContent.includes('Buka Tahap 3 Serentak'));
    if (openStage3Btn) openStage3Btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Exit Admin
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 15. Verify Team advances to Tahap 3
  const stage3Unlocked = await page.evaluate(() => {
    const text = document.body.textContent;
    return text.includes("Tahap 3: Menulis Berita Utuh") ||
           text.includes("Menulis Berita Utuh");
  });
  console.log("15. Team successfully advanced to Tahap 3:", stage3Unlocked);
  if (!stage3Unlocked) {
    throw new Error("FAIL: Team did not advance to Tahap 3 after teacher unlocked Tahap 3!");
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_pacing_06_stage3_unlocked.png'), fullPage: false });
  console.log("Saved verify_pacing_06_stage3_unlocked.png");

  // 16. Teacher Resets Exercise (Option A: Keep Teams)
  console.log("16. Teacher clicks Reset Exercise in Admin...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mejaGuruBtn = btns.find(b => b.textContent.includes('Meja Guru') || b.textContent.includes('Guru'));
    if (mejaGuruBtn) mejaGuruBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const pinInput5 = await page.$('input[type="password"]');
  if (pinInput5) {
    await pinInput5.type('040498');
    await page.keyboard.press('Enter');
  }
  await new Promise(r => setTimeout(r, 800));

  // Click Reset Latihan button in Admin
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const resetTrigger = btns.find(b => b.textContent.includes('Reset Latihan'));
    if (resetTrigger) resetTrigger.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // In Confirmation Modal, click Option A: "Ulang Latihan dari Tahap 1"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmResetBtn = btns.find(b => b.textContent.includes('Ulang Latihan') || b.textContent.includes('Biro & Kode Tetap Aktif'));
    if (confirmResetBtn) confirmResetBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Exit Admin
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 17. Verify Student Dashboard is back to Stage 0 (Ruang Persiapan / Lobi Pra-Sesi)
  const isBackToLobby = await page.evaluate(() => {
    return document.body.textContent.includes("Menunggu Guru Membuka Tahap 1");
  });
  console.log("17. Reset successfully returned classroom back to Pre-Session Lobby (Stage 0):", isBackToLobby);
  if (!isBackToLobby) {
    throw new Error("FAIL: Reset did not return classroom back to Pre-Session Lobby!");
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_pacing_07_reset_back_to_lobby.png'), fullPage: false });
  console.log("Saved verify_pacing_07_reset_back_to_lobby.png");

  console.log("🎉 ALL TEACHER PACING & SYNCHRONIZATION E2E TESTS PASSED WITH 100% SUCCESS!");
  await browser.close();
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

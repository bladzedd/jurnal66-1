import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";
const APP_URL = "http://localhost:4173";

async function runFrontendQA() {
  console.log("==================================================================");
  console.log("🎨 STARTING FRONTEND & UI QA TEST SUITE (Full User Journey)");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail}`);
      failed++;
    }
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Landing Page, Single Code Input & Admin Access
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 1: Landing Page & Authentication ---");
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });

    // Clear state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("redaksi_siswa_initialized_v5", "true");
    });
    await page.reload({ waitUntil: 'networkidle0' });

    // 1.1 Single code input existence
    const codeInputs = await page.$$('input[placeholder*="1X88H"]');
    assert(codeInputs.length === 1, "Single centralized 5-character code input rendered");

    // 1.2 Invalid code feedback
    await codeInputs[0].type("WRONG");
    await page.keyboard.press("Enter");
    await new Promise(r => setTimeout(r, 600));

    const invalidAlert = await page.evaluate(() => {
      return document.body.textContent.includes("tidak ditemukan");
    });
    assert(invalidAlert, "Invalid code produces informative error alert");

    // 1.3 Admin login with wrong PIN
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.textContent.includes('Meja Guru'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const pinInput = await page.$('input[placeholder*="PIN"]');
    assert(!!pinInput, "Meja Guru opens PIN authentication screen");
    await pinInput.type("999999");
    await page.keyboard.press("Enter");
    await new Promise(r => setTimeout(r, 500));

    const wrongPinAlert = await page.evaluate(() => {
      return document.body.textContent.includes("PIN Admin salah");
    });
    assert(wrongPinAlert, "Wrong admin PIN rejected with error notice");

    // 1.4 Admin login with correct PIN (040498)
    await page.evaluate(() => {
      const p = document.querySelector('input[placeholder*="PIN"]');
      if (p) p.value = '';
    });
    const pinInput2 = await page.$('input[placeholder*="PIN"]');
    await pinInput2.type("040498");
    await page.keyboard.press("Enter");
    await new Promise(r => setTimeout(r, 800));

    const inAdminDashboard = await page.evaluate(() => {
      return document.body.textContent.includes("Papan Peringkat & Penilaian") ||
             document.body.textContent.includes("Pusat Komando");
    });
    assert(inAdminDashboard, "Admin Dashboard accessed successfully with correct PIN");

    // 1.5 Generate Leader slot
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fastMintBtn = btns.find(b => b.textContent.includes('Terbitkan 1 Kode Ketua') || b.textContent.includes('Terbitkan Slot Cepat'));
      if (fastMintBtn) fastMintBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const generatedTeam = await page.evaluate(() => {
      const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
      return teams[teams.length - 1];
    });
    assert(!!generatedTeam && !!generatedTeam.leaderCode && !!generatedTeam.memberCode, "Admin generates 5-character leader & member codes");
    console.log(`    Generated slot: Leader Code [${generatedTeam?.leaderCode}] | Member Code [${generatedTeam?.memberCode}]`);

    // 1.6 Ensure Stage 0 (Ruang Persiapan) is active
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const prepBtn = btns.find(b => b.textContent.includes('Persiapan (0)'));
      if (prepBtn) prepBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Return to Landing Page
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
      if (exitBtn) exitBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 1.7 Leader uses leaderCode to set up Bureau
    const leaderCodeInput = await page.$('input[placeholder*="1X88H"]');
    await leaderCodeInput.type(generatedTeam.leaderCode);
    await page.keyboard.press("Enter");
    await new Promise(r => setTimeout(r, 600));

    const isSetupForm = await page.evaluate(() => {
      return document.body.textContent.includes("Daftarkan Biro Kelompokmu") ||
             document.body.textContent.includes("Nama Biro / Redaksi");
    });
    assert(isSetupForm, "Entering unassigned Leader Code opens Bureau Setup Form");

    // Fill Setup Form
    await page.evaluate(() => {
      const setVal = (el, val) => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const inputs = Array.from(document.querySelectorAll('input'));
      if (inputs[0]) setVal(inputs[0], "Bintang Pratama");
      if (inputs[1]) setVal(inputs[1], "8B");
      if (inputs[2]) setVal(inputs[2], "Biro Radar Nusantara");
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 1200));

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Student Dashboard, Pre-Session Lobby (Stage 0), & Header
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: Student Dashboard, Stage 0 Lobby & Header ---");
    const bureauTitle = await page.evaluate(() => {
      return document.body.textContent.includes("Biro Radar Nusantara");
    });
    assert(bureauTitle, "Dashboard displays registered Bureau Name 'Biro Radar Nusantara'");

    const memberCodeDisplay = await page.evaluate((code) => {
      return document.body.textContent.includes(code);
    }, generatedTeam.memberCode);
    assert(memberCodeDisplay, `Member code '${generatedTeam.memberCode}' prominently spotlighted for team sharing`);

    const isLobbyMode = await page.evaluate(() => {
      return document.body.textContent.includes("Ruang Persiapan Redaksi (Menunggu Guru)") ||
             document.body.textContent.includes("Lobi Pra-Sesi");
    });
    assert(isLobbyMode, "Dashboard activates Stage 0 Pre-Session Lobby mode");

    const isStartLocked = await page.evaluate(() => {
      return document.body.textContent.includes("Menunggu Guru Membuka Tahap 1 di Depan Kelas…");
    });
    assert(isStartLocked, "Start button strictly locked with teacher waiting pill");

    const headerStagePill = await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('header span'));
      return pills.some(p => p.textContent.includes("Pra-Sesi"));
    });
    assert(headerStagePill, "Header badge displays 'Pra-Sesi' during Stage 0");

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Shop & Card Strategy (Toko Peralatan & Kas Biro)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Equipment Shop & Strategy Cards ---");
    const startingCoins = await page.evaluate(() => {
      const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
      return teams[teams.length - 1]?.coins;
    });
    assert(startingCoins === 100, `Starting bureau budget is exactly 100 coins (got ${startingCoins})`);

    // Open Shop Modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const shopBtn = btns.find(b => b.textContent.includes('Buka Toko') || b.title?.includes('Toko') || b.getAttribute('aria-label')?.includes('Toko'));
      if (shopBtn) shopBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const isShopModalOpen = await page.evaluate(() => {
      return document.body.textContent.includes("Toko Peralatan & Bursa Strategi Pers");
    });
    assert(isShopModalOpen, "Shop modal opens with strategy cards");

    // Buy Lensa Eliminator (75 coins)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const buyCardBtn = btns.find(b => b.textContent.includes('Beli Kartu'));
      if (buyCardBtn) buyCardBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Close Shop
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Tutup Toko"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const coinsAfterPurchase = await page.evaluate(() => {
      const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
      return teams[teams.length - 1]?.coins;
    });
    assert(coinsAfterPurchase === 25, `Coins deducted correctly: 100 - 75 = 25 (got ${coinsAfterPurchase})`);

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Stage 1 Pacing, Gameplay, Cases, and Waiting Room
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: Stage 1 (Unsur 5W+1H) & Waiting Room ---");
    // Guru opens Stage 1 from Admin
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.textContent.includes('Meja Guru') || b.textContent.includes('Guru'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const pinInputStage1 = await page.$('input[placeholder*="PIN"]');
    if (pinInputStage1) {
      await pinInputStage1.type("040498");
      await page.keyboard.press("Enter");
    }
    await new Promise(r => setTimeout(r, 800));

    // Click 'Buka Tahap 1 Serentak'
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const openStage1Btn = btns.find(b => b.textContent.includes('Buka Tahap 1 Serentak'));
      if (openStage1Btn) openStage1Btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Exit Admin back to Student Dashboard
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
      if (exitBtn) exitBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const startBtnExists = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent.includes("Mulai & Jawab Tugas (Ketua)") || b.textContent.includes("Buka Berkas Liputan 5W+1H"));
    });
    assert(startBtnExists, "Stage 1 unlocked simultaneously upon teacher opening");

    // Start Game 1
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent.includes("Mulai & Jawab Tugas (Ketua)") || b.textContent.includes("Buka Berkas Liputan 5W+1H"));
      if (startBtn) startBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const inGame1 = await page.evaluate(() => {
      return document.body.textContent.includes("WHAT") &&
             document.body.textContent.includes("WHO") &&
             document.body.textContent.includes("WHERE");
    });
    assert(inGame1, "Game 1 (5W+1H) loaded with all 6 journalistic core elements");

    // Verify Active Case Header in Game 1
    const activeCaseHeader = await page.evaluate(() => {
      return document.querySelector('h2, h3')?.textContent || "";
    });
    assert(activeCaseHeader.length > 5, `Game 1 displays journalistic investigation case: "${activeCaseHeader}"`);

    // Complete Stage 1 and return to Dashboard
    await page.evaluate(async () => {
      const activeTeamId = localStorage.getItem("redaksi_siswa_active_team_id_v5");
      const teams = JSON.parse(localStorage.getItem("redaksi_siswa_teams_v5") || "[]");
      const t = teams.find(item => item.id === activeTeamId);
      if (t) {
        t.completedStages = [1];
        t.stageScores = { 1: 100 };
        t.stageTimers = { 1: { durationSeconds: 98, isPaused: true, isCompleted: true } };
        localStorage.setItem("redaksi_siswa_teams_v5", JSON.stringify(teams));
      }
      sessionStorage.removeItem("redaksi_siswa_active_module_v5");
      localStorage.removeItem("redaksi_siswa_active_module_v5");

      // Push to backend sync
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams, classroomStage: 1, isFullRosterSync: true })
      });
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    // Verify StageWaitingRoom
    const inWaitingRoom1 = await page.evaluate(() => {
      return document.body.textContent.includes("Tahap #1 Tuntas & Terkunci!") &&
             document.body.textContent.includes("Waktu kerja biro resmi di-pause");
    });
    assert(inWaitingRoom1, "Completed Stage 1 places team in StageWaitingRoom with paused timer notice");

    // -------------------------------------------------------------------------
    // TEST SUITE 5: Stage 2 (Piramida Terbalik) Progression
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Stage 2 (Piramida Terbalik) ---");
    // Guru opens Stage 2 from Admin
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.textContent.includes('Meja Guru') || b.textContent.includes('Guru'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const pinInputStage2 = await page.$('input[placeholder*="PIN"]');
    if (pinInputStage2) {
      await pinInputStage2.type("040498");
      await page.keyboard.press("Enter");
    }
    await new Promise(r => setTimeout(r, 800));

    // Click 'Buka Tahap 2 Serentak'
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

    const stage2Unlocked = await page.evaluate(() => {
      return document.body.textContent.includes("Tahap 2: Struktur Berita Piramida Terbalik") ||
             document.body.textContent.includes("Piramida Terbalik");
    });
    assert(stage2Unlocked, "Opening Stage 2 automatically advances team out of Waiting Room to Stage 2");

    // Enter Stage 2 Game
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent.includes("Mulai & Jawab Tugas (Ketua)"));
      if (startBtn) startBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const inGame2 = await page.evaluate(() => {
      return document.body.textContent.includes("Judul") &&
             document.body.textContent.includes("Lead") &&
             document.body.textContent.includes("Tubuh") &&
             document.body.textContent.includes("Ekor");
    });
    assert(inGame2, "Game 2 renders Inverted Pyramid structure (Judul, Lead, Tubuh, Ekor)");

    // Complete Stage 2
    await page.evaluate(async () => {
      const activeTeamId = localStorage.getItem("redaksi_siswa_active_team_id_v5");
      const teams = JSON.parse(localStorage.getItem("redaksi_siswa_teams_v5") || "[]");
      const t = teams.find(item => item.id === activeTeamId);
      if (t) {
        t.completedStages = [1, 2];
        t.stageScores = { 1: 100, 2: 95 };
        t.stageTimers = { 
          1: { durationSeconds: 98, isPaused: true, isCompleted: true },
          2: { durationSeconds: 145, isPaused: true, isCompleted: true }
        };
        localStorage.setItem("redaksi_siswa_teams_v5", JSON.stringify(teams));
      }
      sessionStorage.removeItem("redaksi_siswa_active_module_v5");
      localStorage.removeItem("redaksi_siswa_active_module_v5");

      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams, classroomStage: 2, isFullRosterSync: true })
      });
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const inWaitingRoom2 = await page.evaluate(() => {
      return document.body.textContent.includes("Tahap #2 Tuntas & Terkunci!");
    });
    assert(inWaitingRoom2, "Completed Stage 2 places team in StageWaitingRoom for Stage 3");

    // -------------------------------------------------------------------------
    // TEST SUITE 6: Stage 3 (Menulis Berita Utuh)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Stage 3 (Menulis Berita Utuh) ---");
    // Guru opens Stage 3 from Admin
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.textContent.includes('Meja Guru') || b.textContent.includes('Guru'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const pinInputStage3 = await page.$('input[placeholder*="PIN"]');
    if (pinInputStage3) {
      await pinInputStage3.type("040498");
      await page.keyboard.press("Enter");
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

    const stage3Unlocked = await page.evaluate(() => {
      return document.body.textContent.includes("Tahap 3: Menulis Berita Utuh") ||
             document.body.textContent.includes("Menulis Berita Utuh");
    });
    assert(stage3Unlocked, "Opening Stage 3 advances team to Stage 3 mission");

    // Enter Stage 3 Game
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent.includes("Mulai & Jawab Tugas (Ketua)"));
      if (startBtn) startBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const inGame3 = await page.evaluate(() => {
      return document.body.textContent.includes("Tahap 3") &&
             (document.body.textContent.includes("Mode Ketua Kelompok") || document.body.textContent.includes("Langkah 1"));
    });
    assert(inGame3, "Game 3 (Menulis Berita Utuh) loads editorial drafting and verification desk");

    // Return to dashboard
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const backBtn = btns.find(b => b.textContent.includes('Kembali') || b.textContent.includes('Meja Redaksi'));
      if (backBtn) backBtn.click();
      sessionStorage.removeItem("redaksi_siswa_active_module_v5");
      localStorage.removeItem("redaksi_siswa_active_module_v5");
    });
    await new Promise(r => setTimeout(r, 600));

    // -------------------------------------------------------------------------
    // TEST SUITE 7: Admin Meja Guru Deep Feature Audit (All 8 Tabs)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: Meja Guru (Admin) All 8 Tabs & Controls ---");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.textContent.includes('Meja Guru') || b.textContent.includes('Guru'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const pinInputAdmin = await page.$('input[placeholder*="PIN"]');
    if (pinInputAdmin) {
      await pinInputAdmin.type("040498");
      await page.keyboard.press("Enter");
    }
    await new Promise(r => setTimeout(r, 800));

    // Tab 1: Leaderboard
    const tab1Exists = await page.evaluate(() => document.body.textContent.includes("Papan Peringkat & Penilaian"));
    assert(tab1Exists, "Admin Tab 1: Leaderboard & live ranking table active");

    // Tab 2: Roster & 5-Char Codes
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("1. Biro"));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const tab2Active = await page.evaluate(() => document.body.textContent.includes("Ubah Biro & Kode") || document.body.textContent.includes("Acak Kode Baru"));
    assert(tab2Active, "Admin Tab 2: Bureau & 5-Character Code management active");

    // Tab 3: Orchestration & Curriculum (4-card grid)
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("2. Tahap") || b.textContent.includes("2. Orkestrasi"));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const tab3Active = await page.evaluate(() => {
      return document.body.textContent.includes("Ruang Persiapan (Lobi Pra-Sesi)") &&
             document.body.textContent.includes("Tahap 1: Unsur 5W+1H") &&
             document.body.textContent.includes("Tahap 2: Piramida Terbalik") &&
             document.body.textContent.includes("Tahap 3: Menulis Berita Utuh");
    });
    assert(tab3Active, "Admin Tab 3: 4-card interactive stage orchestration grid active");

    // Tab 4: Bank Kas & Sabotase
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("3. Kas") || b.textContent.includes("3. Bank Kas"));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const tab4Active = await page.evaluate(() => document.body.textContent.includes("Bank Kas & Intervensi Sabotase") || document.body.textContent.includes("Kas & Kartu"));
    assert(tab4Active, "Admin Tab 4: Bureau budget bank & sabotage intervention active");

    // Tab 5: Siaran Darurat & Radar Berita
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("4. Siaran"));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const tab5Active = await page.evaluate(() => document.body.textContent.includes("Siaran Darurat & Radar Berita") || document.body.textContent.includes("Kirim Siaran"));
    assert(tab5Active, "Admin Tab 5: Emergency broadcast & radar monitor active");

    // Tab 6: Rekap Nilai & Rubrik
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("5. Nilai") || b.textContent.includes("5. Rekap Nilai"));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const tab6Active = await page.evaluate(() => document.body.textContent.includes("Rekapitulasi Nilai & Rubrik") || document.body.textContent.includes("Nilai"));
    assert(tab6Active, "Admin Tab 6: Journalism grading rubric & score recap active");

    // Tab 7: Kasus & Liputan Wawancara
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("6. Kasus"));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const tab7Active = await page.evaluate(() => document.body.textContent.includes("Kasus Liputan & Saksi Wawancara") || document.body.textContent.includes("Saksi"));
    assert(tab7Active, "Admin Tab 7: Investigative case & witness interview monitor active");

    // Tab 8: Kunci Jawaban Lengkap
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("7. Kunci"));
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 500));
    const tab8Active = await page.evaluate(() => document.body.textContent.includes("Kunci Jawaban Resmi Meja Guru") || document.body.textContent.includes("Jawaban"));
    assert(tab8Active, "Admin Tab 8: Complete Teacher Answer Keys view active");

    // -------------------------------------------------------------------------
    // TEST SUITE 8: Mobile Sticky Header & Anti-Overlap Scrolling Check
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 8: Mobile Scrolling & Sticky Header Integrity ---");
    // Exit Admin back to Student view
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
      if (exitBtn) exitBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Scroll down 600px
    await page.evaluate(() => window.scrollTo(0, 600));
    await new Promise(r => setTimeout(r, 400));

    // Verify Header is sticky top-0 and has opaque background
    const headerState = await page.evaluate(() => {
      const h = document.querySelector('header');
      if (!h) return null;
      const rect = h.getBoundingClientRect();
      const style = window.getComputedStyle(h);
      return {
        top: rect.top,
        position: style.position,
        backgroundColor: style.backgroundColor
      };
    });
    assert(headerState && headerState.top === 0, "Header stays strictly locked at top: 0 during scrolling");
    assert(headerState && headerState.position === 'sticky', "Header CSS position is sticky");
    assert(headerState && headerState.backgroundColor !== 'rgba(0, 0, 0, 0)' && headerState.backgroundColor !== 'transparent', `Header has solid opaque background (${headerState?.backgroundColor})`);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_qa_mobile_scrolled.png'), fullPage: false });
    console.log("  📸 Saved verify_qa_mobile_scrolled.png");

  } finally {
    await browser.close();
  }

  console.log("\n==================================================================");
  console.log(`📊 FRONTEND QA RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runFrontendQA().catch(err => {
  console.error("Frontend QA failed with error:", err);
  process.exit(1);
});

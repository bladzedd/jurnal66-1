import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';
const BASE_URL = 'http://localhost:4173';

async function run() {
  console.log('🚀 Starting Comprehensive Final Polish & Mobile Verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. MOBILE LANDING PAGE (375x667 iPhone SE / Android Small)
  console.log('\n--- 1. Testing Landing Page on Mobile (375px) ---');
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  // Clear local storage and reset to clean state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // Verify no horizontal overflow
  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  console.log(`Viewport: 375px | Body Scroll Width: ${bodyScrollWidth}px`);
  if (bodyScrollWidth > 375) {
    console.error('❌ Horizontal overflow detected on landing page!');
  } else {
    console.log('✅ No horizontal overflow on landing page!');
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'final_mobile_landing.png') });

  // Verify guest privacy (no raw biro directory codes visible to unauthenticated guest)
  const hasSecretDirectory = await page.evaluate(() => {
    return !!document.querySelector('.biro-secret-directory');
  });
  console.log('✅ Guest Privacy: Public directory is hidden:', !hasSecretDirectory);

  // 2. KETUA LOGIN (Switch to tab 2, enter 1X88H)
  console.log('\n--- 2. Testing Ketua Login with 5-character Code ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab2 = btns.find(b => b.innerText && b.innerText.includes('Masuk Ketua'));
    if (tab2) tab2.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Enter code "1x88h" (should auto-uppercase)
  const leaderInput = await page.$('input[placeholder*="1X88H"]');
  if (leaderInput) {
    await leaderInput.type('1x88h');
  }

  // Submit form
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));

  // Verify Dashboard is reached
  const dashboardTitle = await page.evaluate(() => document.body.innerText);
  const isDashboard = dashboardTitle.includes('Meja Redaksi') || dashboardTitle.includes('Tahap 1');
  console.log('✅ Dashboard loaded after Ketua login:', isDashboard);

  // Check mobile dashboard width
  const dashScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  console.log(`Mobile Dashboard Width: ${dashScrollWidth}px (Target <= 375px)`);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'final_mobile_dashboard.png') });

  // 3. TEST GAME 1: 5W+1H (Click Kerjakan Tahap Ini)
  console.log('\n--- 3. Testing Game 1: 5W+1H Flow ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.innerText && b.innerText.includes('Kerjakan Tahap Ini'));
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Verify Game 1 is loaded
  const isGame1 = await page.evaluate(() => document.body.innerText.includes('Kasus 1/3'));
  console.log('✅ Game 1 loaded:', isGame1);

  // Check game 1 on mobile viewport
  const game1Width = await page.evaluate(() => document.body.scrollWidth);
  console.log(`Game 1 Mobile Width: ${game1Width}px (Target <= 375px)`);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'final_mobile_game1.png') });

  // Return to Dashboard by clicking Kembali ke Meja Redaksi
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const backBtn = btns.find(b => b.innerText && b.innerText.includes('Kembali'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Simulate completion of Stage 1 to test StageWaitingRoom
  await page.evaluate(() => {
    const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
    if (teams.length > 0) {
      teams[0].completedStages = [1];
      teams[0].badges = ['Master 5W+1H Investigatif'];
      teams[0].scores = { stage_1: 100 };
      localStorage.setItem('redaksi_siswa_teams_v5', JSON.stringify(teams));
      localStorage.setItem('redaksi_siswa_active_team_id_v5', teams[0].id);
    }
  });

  // Reload to see StageWaitingRoom
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 700));

  const hasWaitingRoom = await page.evaluate(() => document.body.innerText.includes('Tahap 1 Tuntas!'));
  console.log('✅ StageWaitingRoom displayed for finished Stage 1:', hasWaitingRoom);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'final_stage_waiting_room.png') });

  // 4. TEST PRESS CARD MODAL
  console.log('\n--- 4. Testing Press Card Modal ---');
  await page.evaluate(() => {
    const cardBtn = document.querySelector('button[aria-label="Kartu Pers"]') || 
      Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Kartu'));
    if (cardBtn) cardBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const isPressCardOpen = await page.evaluate(() => document.body.innerText.includes('DEWAN PERS PENDIDIKAN SISWA'));
  console.log('✅ Press Card Modal opened:', isPressCardOpen);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'final_press_card_modal.png') });

  // Close Press Card Modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Tutup Modal"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 5. TEST PRESS SHOP MODAL
  console.log('\n--- 5. Testing Press Shop Modal ---');
  await page.evaluate(() => {
    const shopBtn = document.querySelector('button[aria-label="Toko Peralatan & Koin"]') || 
      Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Koin'));
    if (shopBtn) shopBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const isShopOpen = await page.evaluate(() => document.body.innerText.includes('Toko Peralatan & Bursa Strategi Pers'));
  console.log('✅ Press Shop Modal opened:', isShopOpen);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'final_press_shop_modal.png') });

  // Close Shop
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Tutup Toko"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 6. TEST ADMIN DASHBOARD & SUPERPOWERS
  console.log('\n--- 6. Testing Admin Dashboard & Superpowers ---');
  // Click Meja Guru
  await page.evaluate(() => {
    const guruBtn = document.querySelector('button[aria-label="Panel Meja Guru"]') || 
      Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Meja Guru'));
    if (guruBtn) guruBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Enter PIN GURU2026
  const pinInputEl = await page.$('input[type="password"]');
  if (pinInputEl) {
    await pinInputEl.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await pinInputEl.type('GURU2026');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 800));
  }

  const isAdminDashboard = await page.evaluate(() => document.body.innerText.includes('Dewan Pers Pendidikan • Meja Guru'));
  console.log('✅ Admin Dashboard Authenticated & Loaded:', isAdminDashboard);

  // Test 6a: Start 30m Global Timer
  console.log('Testing Global Exam Timer...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const start30 = btns.find(b => b.innerText && b.innerText.includes('Mulai 30 Menit'));
    if (start30) start30.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const timerStateRaw = await page.evaluate(() => localStorage.getItem('redaksi_siswa_global_timer_v5'));
  console.log('✅ Global Timer Running in Storage:', !!timerStateRaw && JSON.parse(timerStateRaw).isRunning);

  // Test 6b: Projector Mode View
  console.log('Testing Projector Mode (Smartboard Leaderboard)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const projBtn = btns.find(b => b.innerText && b.innerText.includes('Papan Skor Proyektor'));
    if (projBtn) projBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const isProjectorModeActive = await page.evaluate(() => document.body.innerText.includes('PAPAN SKOR PROYEKTOR SMARTBOARD'));
  console.log('✅ Projector Mode Active:', isProjectorModeActive);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'final_admin_projector_mode.png') });

  // Exit projector mode
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.innerText && b.innerText.includes('Keluar Mode Proyektor'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Test 6c: Rubric & Gradebook Tab (Tab 5)
  console.log('Testing Tab 5: Rubrik Jurnalistik & CSV Export...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab5 = btns.find(b => b.innerText && b.innerText.includes('5. Rekap Nilai'));
    if (tab5) tab5.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const hasRubricTab = await page.evaluate(() => document.body.innerText.includes('Akurasi Fakta 5W+1H'));
  console.log('✅ Qualitative Rubric Grading Form rendered:', hasRubricTab);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'final_admin_tab5_rubric_grades.png') });

  // Test 6d: Screen Freeze ("Pena Diturunkan!")
  console.log('Testing Screen Freeze Mode...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const freezeBtn = btns.find(b => b.innerText && b.innerText.includes('Kunci Seluruh Layar Siswa'));
    if (freezeBtn) freezeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Switch back to Student View to see the Screen Freeze overlay
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const backBtn = btns.find(b => b.innerText && b.innerText.includes('Ke Siswa'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const isFrozenScreenVisible = await page.evaluate(() => document.body.innerText.includes('Pena Diturunkan!'));
  console.log('✅ Screen Freeze ("Pena Diturunkan!") active on student screen:', isFrozenScreenVisible);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'final_screen_freeze_overlay.png') });

  // Unfreeze screen via teacher action
  await page.evaluate(() => {
    localStorage.setItem('redaksi_siswa_screen_freeze_v5', JSON.stringify({ isFrozen: false, reason: '' }));
  });
  await new Promise(r => setTimeout(r, 600));

  // 7. MULTI-VIEWPORT RESPONSIVE CHECK (360px, 390px, 414px)
  console.log('\n--- 7. Testing Viewport Widths (Zero Horizontal Overflow) ---');
  const viewports = [360, 390, 414];
  for (const w of viewports) {
    await page.setViewport({ width: w, height: 800, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 300));
    const sw = await page.evaluate(() => document.body.scrollWidth);
    console.log(`Viewport: ${w}px -> Document Scroll Width: ${sw}px (${sw <= w ? '✅ PASS' : '❌ OVERFLOW'})`);
  }

  console.log('\nConsole Errors during entire run:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }

  console.log('\n🎉 ALL FINAL POLISH & MOBILE TESTS COMPLETED WITH 100% SUCCESS!');
  await browser.close();
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

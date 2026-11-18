import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";

async function run() {
  console.log("Starting Disband Group E2E Test on http://localhost:4173...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // 1. Visit App
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  console.log("Page loaded.");

  // Clear existing teams and create two fresh test teams
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("redaksi_siswa_initialized_v5", "true");
    const testTeams = [
      {
        id: "team_alpha",
        name: "Biro Redaksi Alpha",
        leaderCode: "ALP01",
        memberCode: "ALP99",
        coins: 500,
        completedStages: [],
        members: [{ name: "Budi", classInfo: "8A", role: "Pemimpin Redaksi", isLeader: true }]
      },
      {
        id: "team_beta",
        name: "Biro Redaksi Beta",
        leaderCode: "BET01",
        memberCode: "BET99",
        coins: 300,
        completedStages: [1],
        members: [{ name: "Siti", classInfo: "8B", role: "Pemimpin Redaksi", isLeader: true }]
      }
    ];
    localStorage.setItem("redaksi_siswa_teams_v5", JSON.stringify(testTeams));
  });

  await page.reload({ waitUntil: 'networkidle0' });
  console.log("Initialized two test teams: Alpha and Beta.");

  // 2. Open Meja Guru (Admin)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find(b => b.textContent.includes('Meja Guru'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Enter PIN GURU2026
  await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    if (input) {
      input.value = "GURU2026";
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 800));

  // Ensure Tab 1: "1. Biro & Kode 5-Karakter" is active
  await page.evaluate(() => {
    const tabBtns = Array.from(document.querySelectorAll('button'));
    const tab1 = tabBtns.find(b => b.textContent.includes('Biro & Kode'));
    if (tab1) tab1.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Verify both teams exist in list
  const teamNamesBefore = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h3, h4')).map(h => h.textContent);
  });
  console.log("Teams in Admin before disbanding:", teamNamesBefore.filter(t => t.includes('Biro Redaksi')));

  // Click "Bubarkan" on Biro Redaksi Alpha
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.glass'));
    const alphaCard = cards.find(c => c.textContent.includes('Biro Redaksi Alpha'));
    if (alphaCard) {
      const disbandBtn = Array.from(alphaCard.querySelectorAll('button')).find(b => b.textContent.includes('Bubarkan'));
      if (disbandBtn) disbandBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Screenshot Admin Disband Confirmation Modal
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_disband_modal.png'), fullPage: false });
  console.log("Captured verify_admin_disband_modal.png");

  // Click "Ya, Bubarkan Biro" in confirmation dialog
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Ya, Bubarkan Biro'));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Verify Alpha is disbanded from storage
  const remainingInStorage = await page.evaluate(() => {
    const raw = localStorage.getItem('redaksi_siswa_teams_v5');
    return raw ? JSON.parse(raw) : [];
  });
  console.log("Remaining teams in storage after Admin disband:", remainingInStorage.map(t => t.name));
  if (remainingInStorage.some(t => t.name.includes('Alpha'))) {
    throw new Error("FAIL: Alpha should be removed from storage!");
  }
  console.log("SUCCESS: Alpha successfully disbanded from Admin Meja Guru!");

  // Exit Admin view back to Student / Landing Screen
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 3. Login as Ketua to Biro Redaksi Beta
  // Click Tab "2. Masuk Ketua"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const leaderTab = btns.find(b => b.textContent.includes('2. Masuk Ketua'));
    if (leaderTab) leaderTab.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Input code BET01 and submit
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="1X88H"]');
    if (input) {
      input.value = "BET01";
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 800));

  // Verify on Dashboard
  const currentTitle = await page.evaluate(() => document.querySelector('h2')?.textContent);
  console.log("Logged in to Dashboard as:", currentTitle);

  // Screenshot Dashboard with "Bubarkan" button visible
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_dashboard_with_disband_button.png'), fullPage: false });
  console.log("Captured verify_dashboard_with_disband_button.png");

  // Open PressCardModal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pressCardBtn = btns.find(b => b.textContent.includes('Kartu Pers'));
    if (pressCardBtn) pressCardBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // In PressCardModal, click "Bubarkan Biro"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const disbandBtn = btns.find(b => b.textContent.includes('Bubarkan Biro'));
    if (disbandBtn) disbandBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Screenshot Student Disband Modal
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_student_disband_modal.png'), fullPage: false });
  console.log("Captured verify_student_disband_modal.png");

  // Click "Ya, Bubarkan Biro"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Ya, Bubarkan Biro'));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Verify returned to Landing Screen and Beta is deleted
  const teamsAfterAllDisband = await page.evaluate(() => {
    const raw = localStorage.getItem('redaksi_siswa_teams_v5');
    return raw ? JSON.parse(raw) : [];
  });
  console.log("Teams after all disbanded:", teamsAfterAllDisband);

  const activeTeamAfter = await page.evaluate(() => {
    return localStorage.getItem('redaksi_siswa_active_team_id_v5');
  });
  console.log("Active team after disbanding:", activeTeamAfter);

  if (teamsAfterAllDisband.length !== 0 || activeTeamAfter !== null) {
    throw new Error("FAIL: All teams should be disbanded and no active team should remain!");
  }

  // Screenshot landing page when 0 teams exist (should cleanly show register form)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_landing_after_all_disbanded.png'), fullPage: false });
  console.log("Captured verify_landing_after_all_disbanded.png");

  console.log("ALL DISBAND TESTS PASSED WITH 100% SUCCESS!");
  await browser.close();
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

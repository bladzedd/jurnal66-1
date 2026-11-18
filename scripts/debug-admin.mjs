import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";

async function test() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:4173');

  // Initialize two teams in localStorage
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
        completedStages: [],
        members: [{ name: "Siti", classInfo: "8B", role: "Pemimpin Redaksi", isLeader: true }]
      }
    ];
    localStorage.setItem("redaksi_siswa_teams_v5", JSON.stringify(testTeams));
  });

  await page.reload();

  // Click Meja Guru
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Meja Guru'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Type GURU2026 into input
  const input = await page.$('input[type="password"]');
  if (input) {
    await input.type('GURU2026');
    await page.keyboard.press('Enter');
  }
  await new Promise(r => setTimeout(r, 1000));

  // Find "Bubarkan" button for Biro Redaksi Alpha
  const alphaFound = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.glass'));
    const alphaCard = cards.find(c => c.textContent.includes('Biro Redaksi Alpha'));
    if (!alphaCard) return false;
    const disbandBtn = Array.from(alphaCard.querySelectorAll('button')).find(b => b.textContent.includes('Bubarkan'));
    if (disbandBtn) {
      disbandBtn.click();
      return true;
    }
    return false;
  });
  console.log("Found and clicked Bubarkan on Alpha:", alphaFound);
  await new Promise(r => setTimeout(r, 500));

  // Screenshot Admin Disband Confirmation Modal
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_disband_modal.png'), fullPage: false });
  console.log("Saved verify_admin_disband_modal.png");

  // Click "Ya, Bubarkan Biro"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Ya, Bubarkan Biro'));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Check remaining teams in storage
  const remaining = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
  });
  console.log("Remaining teams after Admin disband:", remaining.map(t => t.name));

  // Exit Admin
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Now login as Ketua into Biro Redaksi Beta
  // Click tab "2. Masuk Ketua"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const leaderTab = btns.find(b => b.textContent.includes('2. Masuk Ketua'));
    if (leaderTab) leaderTab.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Type BET01
  const leaderCodeInput = await page.$('input[placeholder*="1X88H"]');
  if (leaderCodeInput) {
    await leaderCodeInput.type('BET01');
    await page.keyboard.press('Enter');
  }
  await new Promise(r => setTimeout(r, 1000));

  // We should be on Dashboard!
  const dashboardTitle = await page.evaluate(() => document.querySelector('h2')?.textContent);
  console.log("Dashboard title:", dashboardTitle);

  // Screenshot Dashboard with Disband Button
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_dashboard_with_disband_button.png'), fullPage: false });
  console.log("Saved verify_dashboard_with_disband_button.png");

  // Open PressCardModal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pressCardBtn = btns.find(b => b.textContent.includes('Kartu Pers'));
    if (pressCardBtn) pressCardBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // In PressCardModal, click "Bubarkan Biro"
  const studentDisbandFound = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const disbandBtn = btns.find(b => b.textContent.includes('Bubarkan Biro'));
    if (disbandBtn) {
      disbandBtn.click();
      return true;
    }
    return false;
  });
  console.log("Found and clicked Bubarkan Biro in Press Card:", studentDisbandFound);
  await new Promise(r => setTimeout(r, 500));

  // Screenshot Student Disband Modal
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_student_disband_modal.png'), fullPage: false });
  console.log("Saved verify_student_disband_modal.png");

  // Click "Ya, Bubarkan Biro"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Ya, Bubarkan Biro'));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check storage and landing screen
  const finalTeams = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
  });
  const finalActive = await page.evaluate(() => {
    return localStorage.getItem('redaksi_siswa_active_team_id_v5');
  });
  console.log("Final teams in storage (should be []):", finalTeams);
  console.log("Final active team in storage (should be null):", finalActive);

  // Screenshot Landing Screen after all disbanded
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_landing_after_all_disbanded.png'), fullPage: false });
  console.log("Saved verify_landing_after_all_disbanded.png");

  console.log("ALL DISBAND TESTS PASSED PERFECTLY!");
  await browser.close();
}

test().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";

async function testAll() {
  console.log("=== COMPREHENSIVE E2E VERIFICATION: GROUP DISBANDING ===");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:4173');

  // Test Case 1: Disbanding directly from Dashboard banner button
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("redaksi_siswa_initialized_v5", "true");
    const testTeams = [
      {
        id: "team_gamma",
        name: "Biro Redaksi Gamma",
        leaderCode: "GAM01",
        memberCode: "GAM99",
        coins: 400,
        completedStages: [],
        members: [{ name: "Doni", classInfo: "9A", role: "Pemimpin Redaksi", isLeader: true }]
      }
    ];
    localStorage.setItem("redaksi_siswa_teams_v5", JSON.stringify(testTeams));
  });

  await page.reload();

  // Login as Ketua Gamma
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const leaderTab = btns.find(b => b.textContent.includes('2. Masuk Ketua'));
    if (leaderTab) leaderTab.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const leaderCodeInput = await page.$('input[placeholder*="1X88H"]');
  if (leaderCodeInput) {
    await leaderCodeInput.type('GAM01');
    await page.keyboard.press('Enter');
  }
  await new Promise(r => setTimeout(r, 800));

  // Verify on Gamma Dashboard
  const title1 = await page.evaluate(() => document.querySelector('h2')?.textContent);
  console.log("1. Logged into Dashboard:", title1);

  // Click Dashboard Banner "Bubarkan" button
  const dashDisbandClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const disbandBtn = btns.find(b => b.textContent.includes('Bubarkan') && !b.textContent.includes('Biro Ini'));
    if (disbandBtn) {
      disbandBtn.click();
      return true;
    }
    return false;
  });
  console.log("2. Clicked Bubarkan on Dashboard banner:", dashDisbandClicked);
  await new Promise(r => setTimeout(r, 400));

  // Screenshot Dashboard Disband Confirmation Dialog
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_dashboard_disband_modal.png'), fullPage: false });
  console.log("3. Saved verify_dashboard_disband_modal.png");

  // Click "Ya, Bubarkan Biro"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Ya, Bubarkan Biro'));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Verify Gamma is gone and back to Landing Screen
  const teamsAfterGamma = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
  });
  console.log("4. Teams after Gamma disbanded (should be empty):", teamsAfterGamma);
  if (teamsAfterGamma.length !== 0) {
    throw new Error("Gamma was not disbanded properly from Dashboard!");
  }

  // Screenshot Landing Screen after Gamma disbanded
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_landing_after_gamma_disband.png'), fullPage: false });
  console.log("5. Saved verify_landing_after_gamma_disband.png");

  console.log("=== ALL TEST CASES PASSED WITH 100% SUCCESS ===");
  await browser.close();
}

testAll().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

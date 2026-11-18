import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";

async function run() {
  console.log("=== COMPREHENSIVE E2E: SINGLE CODE LANDING & REFRESH RESILIENCE ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // 1. Visit App
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  console.log("1. App loaded.");

  // Clear storage and set an initialized flag
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("redaksi_siswa_initialized_v5", "true");
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // 2. Verify Single Code Input Landing Page
  const landingTabs = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.filter(b => b.textContent.includes('Masuk Anggota') || b.textContent.includes('Masuk Ketua') || b.textContent.includes('Buat Biro Baru')).length;
  });
  console.log("2. Old multi-tabs count (must be 0):", landingTabs);
  if (landingTabs !== 0) {
    throw new Error("FAIL: Old multi-tabs still exist on landing page!");
  }

  const codeInputs = await page.$$('input[placeholder*="1X88H"]');
  console.log("3. Single code input field found:", codeInputs.length === 1);
  if (codeInputs.length !== 1) {
    throw new Error("FAIL: Expected exactly 1 central code input field!");
  }

  // Screenshot Single Code Clean Landing Page
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_single_code_landing.png'), fullPage: false });
  console.log("Saved verify_single_code_landing.png");

  // 4. Test Invalid Code Handling
  const codeInput = codeInputs[0];
  await codeInput.type('Z9999');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 600));

  const errorText = await page.evaluate(() => {
    return document.querySelector('.bg-accent-red\\/15')?.textContent;
  });
  console.log("4. Invalid code alert shown:", errorText);
  if (!errorText || !errorText.includes("Z9999")) {
    throw new Error("FAIL: Error message not displayed for invalid code!");
  }

  // 5. Open Meja Guru (Admin) to Generate a Group
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find(b => b.textContent.includes('Meja Guru'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Enter PIN GURU2026
  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    await pinInput.type('GURU2026');
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
  console.log("5. Admin generated slot:", {
    name: createdTeam.name,
    leaderCode: createdTeam.leaderCode,
    memberCode: createdTeam.memberCode
  });

  // Screenshot Admin Dashboard with generated slot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_generated_slot.png'), fullPage: false });
  console.log("Saved verify_admin_generated_slot.png");

  // Exit Admin back to Landing Page
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 6. As Ketua, enter the generated Leader Code on Landing Page
  console.log(`6. Entering Leader Code: ${createdTeam.leaderCode}`);
  const leaderInput = await page.$('input[placeholder*="1X88H"]');
  await leaderInput.type(createdTeam.leaderCode);
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 600));

  // Should show Bureau Setup Form for the unassigned slot
  const setupFormHeader = await page.evaluate(() => document.querySelector('h3')?.textContent);
  console.log("Setup Form Header:", setupFormHeader);

  // Screenshot Bureau Setup Form
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_bureau_setup_form.png'), fullPage: false });
  console.log("Saved verify_bureau_setup_form.png");

  // Fill in Biro Details: Name, Ketua Name, Class
  await page.evaluate(() => {
    const setVal = (el, val) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const inputs = Array.from(document.querySelectorAll('input'));
    if (inputs[0]) setVal(inputs[0], "Fajar Pratama");
    if (inputs[1]) setVal(inputs[1], "9A");
    if (inputs[2]) setVal(inputs[2], "Biro Redaksi Bintang Timur");
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  // 7. Verify Navigation to Dashboard and MEMBER CODE SPOTLIGHT
  const dashTitle = await page.evaluate(() => document.querySelector('h2')?.textContent);
  console.log("7. Dashboard Bureau Name:", dashTitle);

  const displayedMemberCode = await page.evaluate((targetCode) => {
    const badges = Array.from(document.querySelectorAll('.font-mono'));
    const codeBadge = badges.find(b => b.textContent.includes(targetCode));
    return codeBadge ? codeBadge.textContent.trim() : null;
  }, createdTeam.memberCode);
  console.log("Member Code prominently displayed on Dashboard:", displayedMemberCode);
  if (!displayedMemberCode || !displayedMemberCode.includes(createdTeam.memberCode)) {
    throw new Error("FAIL: Member code is not visibly spotlighted on Dashboard!");
  }

  // Screenshot Dashboard with Spotlighted Member Code
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_dashboard_spotlight_member_code.png'), fullPage: false });
  console.log("Saved verify_dashboard_spotlight_member_code.png");

  // 8. Test Refresh Resilience on Dashboard
  console.log("8. Testing Page Refresh (F5) Resilience on Dashboard...");
  await page.reload({ waitUntil: 'networkidle0' });
  const titleAfterReload = await page.evaluate(() => document.querySelector('h2')?.textContent);
  console.log("Dashboard Bureau Name after reload:", titleAfterReload);
  if (titleAfterReload !== "Biro Redaksi Bintang Timur") {
    throw new Error("FAIL: Session was lost after reload!");
  }

  // 9. Start Game 1 (5W+1H) and test In-Game Refresh Resilience
  console.log("9. Starting Game 1 (5W+1H)...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.textContent.includes('Kerjakan Tahap Ini'));
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const game1Title = await page.evaluate(() => document.querySelector('h3')?.textContent);
  console.log("Inside Game 1:", game1Title);

  // Now reload page while INSIDE Game 1!
  console.log("Reloading page while INSIDE Game 1...");
  await page.reload({ waitUntil: 'networkidle0' });

  // Verify student is STILL inside Game 1 after reload!
  const game1TitleAfterReload = await page.evaluate(() => document.querySelector('h3')?.textContent);
  console.log("Inside Game 1 after reload:", game1TitleAfterReload);
  if (!game1TitleAfterReload || !game1TitleAfterReload.includes("Kasus")) {
    throw new Error("FAIL: Student was kicked out of Game 1 upon page refresh!");
  }
  console.log("SUCCESS: Game 1 state preserved across page reload!");

  // Screenshot In-Game after reload
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_ingame_after_reload.png'), fullPage: false });
  console.log("Saved verify_ingame_after_reload.png");

  // Return to Dashboard cleanly
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const backBtn = btns.find(b => b.textContent.includes('Kembali'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 10. Test Member Joining using Member Code on Landing Page
  // Logout team to go back to Landing Page
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const logoutBtn = btns.find(b => b.title === 'Ganti Kelompok' || b.textContent.includes('Ganti Tim'));
    if (logoutBtn) logoutBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // On Landing Page, enter the MEMBER CODE
  console.log(`10. Entering Member Code on Landing Page: ${createdTeam.memberCode}`);
  const memberCodeInput = await page.$('input[placeholder*="1X88H"]');
  await memberCodeInput.type(createdTeam.memberCode);
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 600));

  // Verify Member Identification Form is displayed
  const memberFormBiro = await page.evaluate(() => document.querySelector('h3')?.textContent);
  console.log("Member form shows bureau:", memberFormBiro);
  if (!memberFormBiro || !memberFormBiro.includes("Bintang Timur")) {
    throw new Error("FAIL: Member form did not recognize bureau!");
  }

  // Screenshot Member Join Form
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_member_join_form.png'), fullPage: false });
  console.log("Saved verify_member_join_form.png");

  // Fill in Member details: Name, Class, Role
  await page.evaluate(() => {
    const setVal = (el, val) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const inputs = Array.from(document.querySelectorAll('input'));
    if (inputs[0]) setVal(inputs[0], "Nadia Putri");
    if (inputs[1]) setVal(inputs[1], "9A");
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  // Verify Member is logged in on Dashboard as Anggota!
  const memberDashRole = await page.evaluate(() => {
    return document.body.innerText.includes("Anggota") || document.body.innerText.includes("Nadia");
  });
  console.log("Member successfully joined bureau on Dashboard:", memberDashRole);
  if (!memberDashRole) {
    throw new Error("FAIL: Member was not joined to the bureau!");
  }

  // Screenshot Member on Bureau Dashboard
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_member_dashboard_view.png'), fullPage: false });
  console.log("Saved verify_member_dashboard_view.png");

  console.log("🎉 ALL E2E VERIFICATIONS PASSED WITH 100% SUCCESS!");
  await browser.close();
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

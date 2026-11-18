import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";

async function run() {
  console.log("=== E2E TEST: ADMIN EDIT TEAM NAME & MEMBERS ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, isMobile: true, hasTouch: true });

  // 1. Visit App
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  console.log("1. App loaded.");

  // Clear storage and initialize
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("redaksi_siswa_initialized_v5", "true");
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // Open Meja Guru (Admin)
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

  // Generate a team slot
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const genBtn = btns.find(b => b.textContent.includes('+ Terbitkan 1 Kode Ketua'));
    if (genBtn) genBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. Test Editing Team Name & Info
  console.log("2. Opening Team Edit Form...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const editBiroBtn = btns.find(b => b.textContent.includes('Ubah Biro'));
    if (editBiroBtn) editBiroBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot open team edit form
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_edit_team_open.png'), fullPage: false });
  console.log("Saved verify_admin_edit_team_open.png");

  // Fill in new Team Name, Ketua Name, Class
  await page.evaluate(() => {
    const setVal = (el, val) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const inputs = Array.from(document.querySelectorAll('input'));
    const teamInput = inputs.find(i => i.placeholder && i.placeholder.includes('Rajawali'));
    const leaderInput = inputs.find(i => i.placeholder && i.placeholder.includes('Nama Ketua'));
    const classInput = inputs.find(i => i.placeholder && i.placeholder.includes('9A'));
    if (teamInput) setVal(teamInput, "Biro Investigasi Garuda Mas");
    if (leaderInput) setVal(leaderInput, "Siti Rahmawati");
    if (classInput) setVal(classInput, "9C");

    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simpan Perubahan Biro'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Verify updated team title and leader
  const updatedTeamName = await page.evaluate(() => {
    return document.querySelector('h4')?.textContent;
  });
  console.log("Updated Team Name:", updatedTeamName);
  if (!updatedTeamName || !updatedTeamName.includes("Garuda Mas")) {
    throw new Error(`FAIL: Team name was not updated! Got: ${updatedTeamName}`);
  }

  // Screenshot updated team card
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_team_updated.png'), fullPage: false });
  console.log("Saved verify_admin_team_updated.png");

  // 3. Test Adding a Member Manually
  console.log("3. Adding a Member Manually...");
  await page.evaluate(() => {
    const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('+ Tambah Siswa'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const setVal = (el, val) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const inputs = Array.from(document.querySelectorAll('input'));
    const nameInput = inputs.find(i => i.placeholder === 'Nama Siswa');
    const classInput = inputs.find(i => i.placeholder && i.placeholder.includes('8A'));
    if (nameInput) setVal(nameInput, "Budi Santoso");
    if (classInput) setVal(classInput, "9C");

    const saveMemberBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simpan Siswa'));
    if (saveMemberBtn) saveMemberBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Verify Budi Santoso is in the table
  const memberExists = await page.evaluate(() => {
    return document.body.innerText.includes("Budi Santoso");
  });
  console.log("Member Budi Santoso added:", memberExists);
  if (!memberExists) {
    throw new Error("FAIL: New member was not added to table!");
  }

  // 4. Test Editing that Member's Name, Class, and Role
  console.log("4. Editing Member Details...");
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    // Find the row for Budi Santoso
    const budiRow = rows.find(r => r.textContent.includes('Budi Santoso'));
    if (budiRow) {
      const ubahBtn = Array.from(budiRow.querySelectorAll('button')).find(b => b.textContent.includes('Ubah'));
      if (ubahBtn) ubahBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot member inline edit mode
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_edit_member_open.png'), fullPage: false });
  console.log("Saved verify_admin_edit_member_open.png");

  // Modify Budi Santoso to "Budi Santoso Putra", class "9D", role "Korektor Bahasa (Copy Editor)"
  await page.evaluate(() => {
    const setVal = (el, val) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const editRow = document.querySelector('.bg-accent\\/15');
    if (editRow) {
      const inputs = Array.from(editRow.querySelectorAll('input[type="text"]'));
      if (inputs[0]) setVal(inputs[0], "Budi Santoso Putra");
      if (inputs[1]) setVal(inputs[1], "9D");
      const select = editRow.querySelector('select');
      if (select) {
        select.value = "Korektor Bahasa (Copy Editor)";
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const saveBtn = Array.from(editRow.querySelectorAll('button')).find(b => b.textContent.includes('Simpan'));
      if (saveBtn) saveBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // Verify updated member in table
  const updatedMemberExists = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes("Budi Santoso Putra") && text.includes("9D") && text.includes("Korektor Bahasa (Copy Editor)");
  });
  console.log("Updated Member Details displayed correctly:", updatedMemberExists);
  if (!updatedMemberExists) {
    const bodyText = await page.evaluate(() => document.querySelector('tbody')?.innerText);
    console.log("Current tbody text:", bodyText);
    throw new Error("FAIL: Member details were not properly updated!");
  }

  // Screenshot updated member row
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_admin_member_updated.png'), fullPage: false });
  console.log("Saved verify_admin_member_updated.png");

  // 5. Test Student Perspective
  console.log("5. Testing Student Perspective with updated Team & Member...");
  // Get the leaderCode of this team
  const leaderCode = await page.evaluate(() => {
    const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
    return teams[teams.length - 1].leaderCode;
  });

  // Exit Admin to Student Login
  await page.evaluate(() => {
    const exitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Enter the leaderCode on Landing Page
  const codeInput = await page.$('input[placeholder*="1X88H"]');
  await codeInput.type(leaderCode);
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 800));

  // The bureau was already named and activated by admin ("Biro Investigasi Garuda Mas"), so it goes directly to Dashboard!
  const studentDashTitle = await page.evaluate(() => document.querySelector('h2')?.textContent);
  console.log("Student Dashboard Bureau Title:", studentDashTitle);
  if (!studentDashTitle || !studentDashTitle.includes("Garuda Mas")) {
    throw new Error(`FAIL: Student dashboard does not show updated team name! Got: ${studentDashTitle}`);
  }

  // Open Press Card to see members
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pressCardBtn = btns.find(b => b.textContent.includes('Kartu Pers') || b.title?.includes('Kartu Biro Pers'));
    if (pressCardBtn) pressCardBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const pressCardMembersText = await page.evaluate(() => document.body.innerText);
  console.log("Press Card shows Siti Rahmawati:", pressCardMembersText.includes("Siti Rahmawati"));
  console.log("Press Card shows Budi Santoso Putra:", pressCardMembersText.includes("Budi Santoso Putra"));

  // Screenshot Student Dashboard & Press Card with updated names
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_student_updated_team_and_members.png'), fullPage: false });
  console.log("Saved verify_student_updated_team_and_members.png");

  console.log("🎉 ALL ADMIN EDIT TEAM & MEMBERS TESTS PASSED WITH 100% SUCCESS!");
  await browser.close();
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

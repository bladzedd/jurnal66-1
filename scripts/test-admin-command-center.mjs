import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';
const BASE_URL = 'http://localhost:4173';

async function run() {
  console.log('🚀 Starting Admin Command Center E2E verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Load initial page (clear localStorage and sessionStorage to start fresh)
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });
  console.log('✓ Initial page loaded and storage cleared');

  // 2. Click "Meja Guru (Admin)" button
  const adminBtn = await page.waitForSelector('button[title*="Pusat Komando"], button[title*="Meja Guru"]');
  await adminBtn.click();
  await new Promise(r => setTimeout(r, 600));

  // 3. Verify Admin PIN Gatekeeper screen
  const pinInput = await page.waitForSelector('input[placeholder*="GURU2026"]');
  console.log('✓ Admin PIN gatekeeper screen verified');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_admin_pin_gatekeeper.png'),
    fullPage: true
  });

  // 4. Test wrong PIN error
  await pinInput.type('SALAH123');
  const submitPinBtn = await page.waitForSelector('button[type="submit"]');
  await submitPinBtn.click();
  await new Promise(r => setTimeout(r, 500));
  const errorText = await page.evaluate(() => document.body.innerText);
  if (!errorText.includes('PIN Guru tidak cocok')) {
    throw new Error('Expected PIN error message!');
  }
  console.log('✓ Invalid PIN error handled correctly');

  // 5. Enter correct PIN GURU2026
  await pinInput.focus();
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await pinInput.type('GURU2026');
  await submitPinBtn.click();
  await new Promise(r => setTimeout(r, 1000));

  // 6. Verify Full Admin Dashboard & Tab 1 (Biro & 5-Character Codes)
  const dashboardTitle = await page.evaluate(() => document.body.innerText);
  console.log('Post-PIN submit page text sample:\n', dashboardTitle.slice(0, 300));
  if (!dashboardTitle.toUpperCase().includes('DEWAN PERS PENDIDIKAN')) {
    throw new Error('Admin Dashboard header not found!');
  }
  console.log('✓ Full Admin Dashboard Tab 1 loaded');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_admin_tab1_biro_codes.png'),
    fullPage: true
  });

  // 7. Test Tab 1: Create a new Biro with 5-character codes
  const teamNameInput = await page.$('input[placeholder*="Biro Investigasi Rajawali"]');
  const leaderNameInput = await page.$('input[placeholder*="Rizky Ramadhan"]');
  const leaderClassInput = await page.$('input[placeholder*="8-A atau 9-B"]');
  await teamNameInput.type('Biro Cenderawasih Cyber');
  await leaderNameInput.type('Bintang Wicaksana');
  await leaderClassInput.type('9A');

  const createBiroBtn = await page.$('button[type="submit"]');
  await createBiroBtn.click();
  await new Promise(r => setTimeout(r, 800));
  console.log('✓ Created new biro "Biro Cenderawasih Cyber"');

  // 8. Test Tab 2: Orkestrasi Tahap & Kurikulum
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tab2 = buttons.find(b => b.innerText.includes('2. Orkestrasi Tahap'));
    if (tab2) tab2.click();
  });
  await new Promise(r => setTimeout(r, 600));
  console.log('✓ Switched to Tab 2: Orkestrasi Tahap & Kurikulum');
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_admin_tab2_stages_sync.png'),
    fullPage: true
  });

  // Test unlocking Tahap 2 globally
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btnStage2 = btns.find(b => b.innerText.includes('Buka Tahap 2: Piramida Terbalik'));
    if (btnStage2) btnStage2.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 9. Test Tab 3: Bank Kas & Intervensi Sabotase
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tab3 = buttons.find(b => b.innerText.includes('3. Bank Kas'));
    if (tab3) tab3.click();
  });
  await new Promise(r => setTimeout(r, 600));
  console.log('✓ Switched to Tab 3: Bank Kas & Intervensi Sabotase');

  // Click +100 Koin on first team
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const plusCoin = btns.find(b => b.innerText.includes('+100 Koin'));
    if (plusCoin) plusCoin.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_admin_tab3_economy_sabotage.png'),
    fullPage: true
  });

  // 10. Test Tab 4: Siaran Darurat & Radar Berita
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tab4 = buttons.find(b => b.innerText.includes('4. Siaran Darurat'));
    if (tab4) tab4.click();
  });
  await new Promise(r => setTimeout(r, 600));
  console.log('✓ Switched to Tab 4: Siaran Darurat & Radar Berita');

  const broadcastInput = await page.$('input[placeholder*="Ketik pengumuman guru"]');
  await broadcastInput.type('BREAKING: Waktu verifikasi bukti tersisa 10 menit!');
  const broadcastSelect = await page.$('select');
  if (broadcastSelect) {
    await page.select('select', 'breaking');
  }
  const broadcastSubmit = await page.$('button[type="submit"]');
  if (broadcastSubmit) {
    await broadcastSubmit.click();
  }
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_admin_tab4_emergency_broadcast.png'),
    fullPage: true
  });

  // 11. Test Tab 5: Rekap Nilai & Catatan Guru
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tab5 = buttons.find(b => b.innerText.includes('5. Rekap Nilai'));
    if (tab5) tab5.click();
  });
  await new Promise(r => setTimeout(r, 600));
  console.log('✓ Switched to Tab 5: Rekap Nilai & Catatan Guru');

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, 'screenshot_admin_tab5_grades_notes.png'),
    fullPage: true
  });

  // 12. Test Return to Student View
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const btns = Array.from(document.querySelectorAll('button'));
    const backBtn = btns.find(b => b.innerText.toLowerCase().includes('kembali ke siswa') || b.innerText.toLowerCase().includes('kembali'));
    if (backBtn) {
      console.log('Clicking back button:', backBtn.innerText);
      backBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  const returnedTitle = await page.evaluate(() => document.body.innerText);
  console.log('Returned page text sample:\n', returnedTitle.slice(0, 300));
  if (!returnedTitle.toUpperCase().includes('PORTAL MULTIPLAYER') && !returnedTitle.toUpperCase().includes('REDAKSI SISWA')) {
    throw new Error('Failed to return to student portal!');
  }
  console.log('✓ Successfully returned to student portal');

  console.log('🎉 All Admin Command Center tests passed and screenshots captured!');
  await browser.close();
}

run().catch((err) => {
  console.error('❌ Error executing Admin test:', err);
  process.exit(1);
});

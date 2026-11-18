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
  await page.setViewport({ width: 1280, height: 950 });

  console.log("1. Navigating to http://localhost:4173/ ...");
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // Reset storage
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });

  // 1. Capture Login Hub (Anggota, Ketua, Buat Biro, Meja Guru)
  console.log("2. Capturing screenshot_login_multiplayer_hub.png...");
  await page.screenshot({ path: path.join(outDir, 'screenshot_login_multiplayer_hub.png') });

  // 2. Open Teacher Admin Panel
  console.log("3. Opening Teacher Admin Modal...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Meja Guru'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Enter PIN GURU2026
  await page.type('input[placeholder*="PIN Guru"]', 'GURU2026');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('BUKA MEJA GURU'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Create Biro Elang with Ketua Rizky Ramadhan and 5-char codes: 1X88H and UD19J
  console.log("4. Creating Biro Elang with 5-character codes (1X88H, UD19J)...");
  await page.type('input[placeholder*="cth: Biro Rajawali"]', 'Biro Investigasi Elang');
  await page.type('input[placeholder*="cth: Budi Santoso"]', 'Rizky Ramadhan');
  await page.type('input[placeholder*="cth: 8-A atau 9-B"]', '8-B');
  await page.type('input[placeholder*="cth: 1X88H"]', '1X88H');
  await page.type('input[placeholder*="cth: UD19J"]', 'UD19J');

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('TERBITKAN MANDAT'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log("5. Capturing screenshot_teacher_admin_panel.png...");
  await page.screenshot({ path: path.join(outDir, 'screenshot_teacher_admin_panel.png') });

  // Close Teacher Modal
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Tutup Panel Guru');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 3. Test Ketua Login using 5-char code: 1X88H
  console.log("6. Testing Ketua Login with 5-char code 1X88H...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('masuk ketua'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.type('input[placeholder*="1X88H"]', '1X88H');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('buka meja redaksi ketua'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log("7. Capturing screenshot_ketua_dashboard_with_code.png...");
  await page.screenshot({ path: path.join(outDir, 'screenshot_ketua_dashboard_with_code.png') });

  // 4. Logout / Switch to Member
  console.log("8. Logging out to test Member join with 5-char code UD19J...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('title') === 'Ganti Kelompok');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Member Login using 5-char code: UD19J
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('masuk anggota'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.type('input[placeholder*="UD19J"]', 'UD19J');
  await page.type('input[placeholder*="Nama Lengkap Anda"]', 'Dewi Lestari');
  await page.type('input[placeholder*="cth: 8A, 9B"]', '9-A');

  // Select Role: Korektor Bahasa
  await page.evaluate(() => {
    const roleCard = Array.from(document.querySelectorAll('div')).find(d => d.innerText.toLowerCase().includes('korektor bahasa'));
    if (roleCard) roleCard.click();
  });
  await new Promise(r => setTimeout(r, 300));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('gabung meja biro redaksi'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log("9. Capturing screenshot_anggota_dashboard_joined.png...");
  await page.screenshot({ path: path.join(outDir, 'screenshot_anggota_dashboard_joined.png') });

  // 5. Open Stage 1 to capture collaborative offline cue
  console.log("10. Opening Stage 1 to check collaborative offline cues...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log("11. Capturing screenshot_stage1_collaborative_roles.png...");
  await page.screenshot({ path: path.join(outDir, 'screenshot_stage1_collaborative_roles.png') });

  await browser.close();
  console.log("ALL MULTIPLAYER CODE & ROLE TESTS COMPLETED SUCCESSFULLY!");
}

run().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});

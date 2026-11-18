import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('Navigating to http://localhost:4173 ...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // 1. Group Login Screen
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'jurnal66_01_login_portal.png'),
      fullPage: false
    });
    console.log('Saved jurnal66_01_login_portal.png');

    // 2. Click Meja Guru (Admin)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent.includes('Meja Guru'));
      if (target) target.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Enter GURU2026 in PIN input
    const pinInput = await page.$('input');
    if (pinInput) {
      await pinInput.type('GURU2026');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 1500));
    }

    // 2. Admin Dashboard
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'jurnal66_02_admin_dashboard.png'),
      fullPage: false
    });
    console.log('Saved jurnal66_02_admin_dashboard.png');

    // Get the first team's code from the teams table in admin
    const teamCode = await page.evaluate(() => {
      const teams = JSON.parse(localStorage.getItem('jurnal66_teams') || localStorage.getItem('redaksi_siswa_teams') || '[]');
      return teams[0]?.accessCode || '1X88H';
    });
    console.log('Using teamCode:', teamCode);

    // Return to student login
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const backBtn = btns.find(b => b.textContent.includes('Kembali ke Dashboard') || b.textContent.includes('Keluar') || b.textContent.includes('Halaman Siswa'));
      if (backBtn) backBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Navigate to student login
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    // Type team code in the input
    const input = await page.$('input');
    if (input) {
      await input.type(teamCode);
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 1500));
    }

    // Check if leader setup / identity screen appears
    const nameInput = await page.$('input[placeholder*="Nama"], input[placeholder*="nama"]');
    if (nameInput) {
      await nameInput.type('Budi Santoso');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 1500));
    }

    // 3. Student Dashboard
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'jurnal66_03_student_dashboard.png'),
      fullPage: false
    });
    console.log('Saved jurnal66_03_student_dashboard.png');

    // 4. Open Press Card Modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cardBtn = btns.find(b => b.textContent.includes('Kartu Pers') || b.textContent.includes('Pers'));
      if (cardBtn) cardBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'jurnal66_04_press_card_modal.png'),
      fullPage: false
    });
    console.log('Saved jurnal66_04_press_card_modal.png');

    // Close Press Card Modal
    await page.keyboard.press('Escape');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find(b => b.textContent.includes('Tutup') || b.textContent.includes('Simpan') || b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 5. Open Press Shop Modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const shopBtn = btns.find(b => b.textContent.includes('Toko Biro') || b.textContent.includes('Toko') || b.textContent.includes('Katalog'));
      if (shopBtn) shopBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'jurnal66_05_press_shop_modal.png'),
      fullPage: false
    });
    console.log('Saved jurnal66_05_press_shop_modal.png');

    // Close shop modal
    await page.keyboard.press('Escape');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find(b => b.querySelector('svg.lucide-x') || b.textContent.includes('Tutup'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 6. Enter Stage 1 / Misi Liputan
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const stageBtn = btns.find(b => b.textContent.includes('Mulai') || b.textContent.includes('Kerjakan') || b.textContent.includes('Tahap'));
      if (stageBtn) stageBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'jurnal66_06_stage1_screen.png'),
      fullPage: false
    });
    console.log('Saved jurnal66_06_stage1_screen.png');

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

run();

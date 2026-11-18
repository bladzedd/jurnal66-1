import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:4173';

async function diagnose() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      warnings.push(`Console Warning: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}\n${err.stack}`);
  });

  console.log('--- TEST 1: Load Login Page ---');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // Test tabs on Login Screen
  console.log('--- TEST 2: Tab Switching on Login ---');
  const tabs = await page.$$('button');
  for (const tab of tabs) {
    const text = await (await tab.getProperty('innerText')).jsonValue();
    if (text.includes('Masuk Ketua') || text.includes('Buat Biro') || text.includes('Masuk Anggota')) {
      console.log(`Clicking tab: ${text.trim().replace(/\n/g, ' ')}`);
      await tab.click();
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Test Member Login with valid code
  console.log('--- TEST 3: Member Login Submission ---');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const memberTab = buttons.find(b => b.innerText.includes('1. Masuk Anggota'));
    if (memberTab) memberTab.click();
  });
  await new Promise(r => setTimeout(r, 200));

  const codeInput = await page.$('input[placeholder*="UD19J"]');
  const nameInput = await page.$('input[placeholder*="Nama Lengkap"]');
  const classInput = await page.$('input[placeholder*="8A"]');
  const submitBtn = await page.$('button[type="submit"]');

  await codeInput.type('UD19J');
  await nameInput.type('Diagnosa Siswa');
  await classInput.type('8A');
  await submitBtn.click();
  await new Promise(r => setTimeout(r, 800));

  console.log('--- TEST 4: Student Dashboard Checks ---');
  // Check Shop Modal
  const shopBtn = await page.$('button[title*="Toko"]');
  if (shopBtn) {
    console.log('Opening Shop Modal...');
    await shopBtn.click();
    await new Promise(r => setTimeout(r, 400));
    
    // Switch tabs in shop
    const shopTabs = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.filter(b => ['Beli', 'Tas', 'Transfer', 'Log'].some(t => b.innerText.includes(t))).map(b => b.innerText);
    });
    console.log('Shop tabs found:', shopTabs);

    const closeBtn = await page.$('button[aria-label="Tutup Toko"], button[aria-label="Tutup"]');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 300));
  }

  // Check Press Card Modal
  const cardBtn = await page.$('button[title*="Kartu"]');
  if (cardBtn) {
    console.log('Opening Press Card Modal...');
    await cardBtn.click();
    await new Promise(r => setTimeout(r, 400));
    const closeBtn = await page.$('button[aria-label="Tutup Kartu"], button[aria-label="Tutup"]');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 300));
  }

  // Test Game 1 (5W+1H)
  console.log('--- TEST 5: Game 1 (5W+1H) Interaction ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.innerText.includes('Kerjakan Tahap Ini') || b.innerText.includes('KERJAKAN'));
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Check Game 1 interaction
  const clues = await page.$$('button');
  console.log('Interacting with Game 1 clues...');
  for (const c of clues) {
    const txt = await (await c.getProperty('innerText')).jsonValue();
    if (txt.includes('📌')) {
      await c.click();
      await new Promise(r => setTimeout(r, 150));
      // Try to click a slot
      await page.evaluate(() => {
        const slots = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('WHAT'));
        if (slots[0]) slots[0].click();
      });
      break;
    }
  }

  // Back to home
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const backBtn = btns.find(b => b.innerText.includes('Kembali'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Test Admin Page
  console.log('--- TEST 6: Admin Dashboard Deep Navigation ---');
  const adminHeaderBtn = await page.$('button[title*="Panel Guru"], button[title*="Meja Guru"]');
  if (adminHeaderBtn) await adminHeaderBtn.click();
  await new Promise(r => setTimeout(r, 600));

  // Enter PIN
  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    await pinInput.type('GURU2026');
    const adminSubmit = await page.$('button[type="submit"]');
    await adminSubmit.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // Click each admin tab
  const adminTabs = ['1. Biro', '2. Orkestrasi', '3. Bank Kas', '4. Siaran', '5. Rekap'];
  for (const at of adminTabs) {
    console.log(`Testing Admin Tab: ${at}`);
    await page.evaluate((tabName) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const found = btns.find(b => b.innerText.includes(tabName));
      if (found) found.click();
    }, at);
    await new Promise(r => setTimeout(r, 400));
  }

  // Exit Admin
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exitBtn = btns.find(b => b.innerText.includes('Kembali ke Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('\n=== DIAGNOSTIC REPORT ===');
  console.log(`Total Errors: ${errors.length}`);
  errors.forEach(e => console.error('🔴', e));
  console.log(`Total Warnings: ${warnings.length}`);
  warnings.forEach(w => console.warn('🟡', w));

  await browser.close();
}

diagnose().catch(err => {
  console.error('Diagnostic Script Fatal Error:', err);
  process.exit(1);
});

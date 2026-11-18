import puppeteer from 'puppeteer';

async function testInputs() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

  // 1. Check Landing Page Input
  console.log("=== TEST 1: LANDING PAGE CODE INPUT ===");
  const inputEl = await page.$('input[placeholder*="1X88H"]');
  if (!inputEl) {
    console.error("FAIL: Landing page code input not found!");
  } else {
    await inputEl.click();
    await inputEl.type('1X88H');
    const val = await page.evaluate(el => el.value, inputEl);
    console.log("Typed '1X88H', input value is:", val);
    
    // Submit
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const afterSubmit = await page.evaluate(() => {
      return {
        h1: document.querySelector('h1')?.textContent,
        h2: document.querySelector('h2')?.textContent,
        error: document.querySelector('.bg-accent-red\\/15')?.textContent
      };
    });
    console.log("After submit 1X88H:", afterSubmit);
  }

  // 2. Open Admin
  console.log("\n=== TEST 2: ADMIN PIN INPUT ===");
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // Click Meja Guru (Admin)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Meja Guru'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const pinInput = await page.$('input[type="password"]');
  if (!pinInput) {
    console.error("FAIL: Admin PIN input not found!");
  } else {
    await pinInput.click();
    await pinInput.type('GURU2026');
    const pinVal = await page.evaluate(el => el.value, pinInput);
    console.log("Typed 'GURU2026', PIN value is:", pinVal);

    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 600));

    const adminView = await page.evaluate(() => {
      return {
        header: document.querySelector('h2')?.textContent,
        error: document.querySelector('.bg-accent-red\\/15')?.textContent,
        tabs: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t.includes('Biro'))
      };
    });
    console.log("After submit PIN GURU2026:", adminView);
  }

  // 3. Test In Admin: Generate Custom Code
  console.log("\n=== TEST 3: ADMIN CUSTOM CODE INPUT ===");
  const customCodeInput = await page.$('input[placeholder*="TIM01"]');
  if (!customCodeInput) {
    console.error("FAIL: Custom code input in admin not found!");
  } else {
    await customCodeInput.click();
    await customCodeInput.type('TIM01');
    const customVal = await page.evaluate(el => el.value, customCodeInput);
    console.log("Typed 'TIM01', custom code value is:", customVal);

    // Click "Terbitkan Kode Khusus"
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Terbitkan Kode Khusus'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const feedback = await page.evaluate(() => {
      return document.querySelector('.bg-accent-green\\/15')?.textContent || document.querySelector('.bg-accent-orange\\/15')?.textContent;
    });
    console.log("After Terbitkan Kode Khusus:", feedback);
  }

  // 4. Test Entering the newly generated code in Menu
  console.log("\n=== TEST 4: ENTERING TIM01 IN MENU ===");
  // Click back to student
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kembali ke Halaman Siswa'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const menuInput = await page.$('input[placeholder*="1X88H"]');
  if (menuInput) {
    await menuInput.click();
    await menuInput.type('TIM01');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 600));

    const menuResult = await page.evaluate(() => {
      return {
        h3: document.querySelector('h3')?.textContent,
        error: document.querySelector('.bg-accent-red\\/15')?.textContent
      };
    });
    console.log("Result of typing TIM01 in menu:", menuResult);
  }

  await browser.close();
}

testInputs().catch(console.error);

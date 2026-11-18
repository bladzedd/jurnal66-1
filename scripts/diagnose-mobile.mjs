import puppeteer from 'puppeteer';

async function diagnose() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 740, isMobile: true });

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // Function to find overflowing elements
  const findOverflows = async (stageName) => {
    return await page.evaluate((name) => {
      const docWidth = document.documentElement.clientWidth;
      const elements = Array.from(document.querySelectorAll('*'));
      const overflowing = [];

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Check if element extends beyond right edge or has scrollWidth > clientWidth
        if (rect.right > docWidth + 2) {
          overflowing.push({
            stage: name,
            tag: el.tagName,
            id: el.id,
            className: el.className?.toString().substring(0, 80),
            right: Math.round(rect.right),
            docWidth,
            text: el.innerText ? el.innerText.substring(0, 40).replace(/\n/g, ' ') : ''
          });
        }
      });
      return overflowing;
    }, stageName);
  };

  console.log("Checking Login...");
  const loginOver = await findOverflows("Login");
  console.log("Login overflows:", loginOver);

  // Register team
  await page.type('input[placeholder*="Kelompok 1"]', 'Tim Cek Mobile');
  await page.type('input[placeholder*="Nama Lengkap Siswa"]', 'Doni');
  await page.type('input[placeholder*="Kelas (cth: 8A, 9B)"]', '8A');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('BUKA MEJA REDAKSI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log("Checking Dashboard...");
  const dashOver = await findOverflows("Dashboard");
  console.log("Dashboard overflows:", dashOver);

  // Check Header layout details
  const headerLayout = await page.evaluate(() => {
    const header = document.querySelector('header');
    return {
      headerWidth: header ? header.getBoundingClientRect().width : 0,
      buttons: Array.from(header?.querySelectorAll('button') || []).map(b => ({
        text: b.innerText.replace(/\n/g, ' '),
        width: Math.round(b.getBoundingClientRect().width),
        right: Math.round(b.getBoundingClientRect().right)
      }))
    };
  });
  console.log("Header layout details on 360px:", headerLayout);

  // Check Stage 1
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log("Checking Stage 1...");
  const s1Over = await findOverflows("Stage 1");
  console.log("Stage 1 overflows:", s1Over);

  // Check Stage 2
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KEMBALI KE MEJA REDAKSI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    localStorage.setItem('redaksi_classroom_stage_v5', '2');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log("Checking Stage 2...");
  const s2Over = await findOverflows("Stage 2");
  console.log("Stage 2 overflows:", s2Over);

  // Check Stage 3
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KEMBALI KE MEJA REDAKSI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    localStorage.setItem('redaksi_classroom_stage_v5', '3');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KERJAKAN TAHAP INI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log("Checking Stage 3...");
  const s3Over = await findOverflows("Stage 3");
  console.log("Stage 3 overflows:", s3Over);

  // Check Modals
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KEMBALI KE MEJA REDAKSI'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Toko Redaksi') || b.innerText.includes('KOIN'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log("Checking Toko Modal...");
  const tokoOver = await findOverflows("Toko Modal");
  console.log("Toko Modal overflows:", tokoOver);

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Tutup Toko');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('KARTU PERS'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log("Checking Kartu Pers Modal...");
  const cardOver = await findOverflows("Kartu Pers Modal");
  console.log("Kartu Pers Modal overflows:", cardOver);

  await browser.close();
  console.log("DIAGNOSIS COMPLETE");
}

diagnose().catch(err => {
  console.error("Diagnosis error:", err);
  process.exit(1);
});

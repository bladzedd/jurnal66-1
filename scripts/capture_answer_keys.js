import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1000']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    console.log('Navigating to http://localhost:4173 ...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Open Admin Dashboard via Meja Guru button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.textContent.includes('Meja Guru'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Type PIN GURU2026
    const pinInput = await page.$('input');
    if (pinInput) {
      await pinInput.type('GURU2026');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 1500));
    }

    // 1. Click "Kunci Jawaban" button at top or Tab 7
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const solBtn = btns.find(b => b.textContent.includes('Kunci Jawaban'));
      if (solBtn) solBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Screenshot 1: Tab 7 - Tahap 1 (5W+1H) Answer Keys
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'admin_kunci_jawaban_01_stage1_5w1h.png'),
      fullPage: false
    });
    console.log('Saved admin_kunci_jawaban_01_stage1_5w1h.png');

    // Switch to Stage 2 (Piramida Terbalik)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const pBtn = btns.find(b => b.textContent.includes('Piramida Terbalik'));
      if (pBtn) pBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Screenshot 2: Tab 7 - Tahap 2 (Piramida Terbalik)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'admin_kunci_jawaban_02_stage2_pyramid.png'),
      fullPage: false
    });
    console.log('Saved admin_kunci_jawaban_02_stage2_pyramid.png');

    // Switch to Stage 3 (Menulis Berita)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const wBtn = btns.find(b => b.textContent.includes('Menulis Berita'));
      if (wBtn) wBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Screenshot 3: Tab 7 - Tahap 3 (Menulis Berita)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'admin_kunci_jawaban_03_stage3_writenews.png'),
      fullPage: false
    });
    console.log('Saved admin_kunci_jawaban_03_stage3_writenews.png');

    // Switch to Wawancara Saksi
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const sBtn = btns.find(b => b.textContent.includes('Wawancara Saksi'));
      if (sBtn) sBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Screenshot 4: Tab 7 - Wawancara Saksi & Scoop Emas
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'admin_kunci_jawaban_04_interviews_scoop.png'),
      fullPage: false
    });
    console.log('Saved admin_kunci_jawaban_04_interviews_scoop.png');

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

run();

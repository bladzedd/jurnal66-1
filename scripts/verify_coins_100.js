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

    await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Type code 1X88H
    const input = await page.$('input');
    if (input) {
      await input.type('1X88H');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 1500));
    }

    // Capture Student Dashboard showing 100 Koin
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_coins_01_student_dashboard_100.png'),
      fullPage: false
    });
    console.log('Saved verify_coins_01_student_dashboard_100.png');

    // Click Toko button (Kas: 100 Koin Toko)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const shopBtn = btns.find(b => b.textContent.includes('Toko') || b.textContent.includes('Koin Toko'));
      if (shopBtn) shopBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_coins_02_press_shop_100.png'),
      fullPage: false
    });
    console.log('Saved verify_coins_02_press_shop_100.png');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();

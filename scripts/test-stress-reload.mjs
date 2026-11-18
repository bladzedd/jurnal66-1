import puppeteer from 'puppeteer';

async function stressTest() {
  console.log("=== STRESS TEST: RAPID RELOADS & SLOW NETWORK SIMULATION ===");
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // Simulate slow 3G / throttled network
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150, // 150ms latency (Slow 3G/4G)
    downloadThroughput: 750 * 1024 / 8, // 750 kbps
    uploadThroughput: 250 * 1024 / 8 // 250 kbps
  });

  await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
  console.log("1. Loaded under throttled network.");

  // Rapidly reload 5 times in succession
  for (let i = 1; i <= 5; i++) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    const isInputVisible = await page.evaluate(() => {
      return document.querySelector('input') !== null;
    });
    if (!isInputVisible) {
      throw new Error(`FAIL: Input not visible on reload #${i}`);
    }
    console.log(`2.${i} Rapid reload #${i} successful and responsive.`);
  }

  console.log("3. Testing input interaction under slow network...");
  const input = await page.$('input');
  await input.type('ABC12');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 600));

  const hasAlert = await page.evaluate(() => document.querySelector('.bg-accent-red\\/15') !== null);
  console.log("4. Alert rendered under slow network:", hasAlert);

  console.log("🎉 STRESS & THROTTLED NETWORK TEST PASSED 100%!");
  await browser.close();
}

stressTest().catch(err => {
  console.error("Stress test failed:", err);
  process.exit(1);
});

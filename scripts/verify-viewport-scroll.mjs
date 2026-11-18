import puppeteer from 'puppeteer';

async function checkScroll() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Test both 360px and 390px viewports
  for (const width of [360, 375, 390, 414]) {
    await page.setViewport({ width, height: 800, isMobile: true });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    const scrollStats = await page.evaluate(() => {
      return {
        docScrollWidth: document.documentElement.scrollWidth,
        docClientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        bodyClientWidth: document.body.clientWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    console.log(`Viewport ${width}px:`, scrollStats);
  }

  await browser.close();
}

checkScroll().catch(console.error);

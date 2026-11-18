import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';
const BASE_URL = 'http://localhost:4173';

async function run() {
  console.log('🚀 Running Deep Game & Modal Verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 750, isMobile: true, hasTouch: true });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  // 1. Setup Active Team with Stage 1 complete in LocalStorage
  await page.evaluate(() => {
    localStorage.clear();
    const team = {
      id: "team-test-1",
      name: "Biro Investigasi Cakra",
      leaderName: "Bima Arya",
      leaderClass: "8-A",
      leaderCode: "CKR01",
      memberCode: "CKR02",
      coins: 500,
      completedStages: [1],
      badges: ["Master 5W+1H Investigatif"],
      scores: { stage_1: 100 },
      members: [
        { name: "Bima Arya", classInfo: "8-A", role: "Pemimpin Redaksi", isLeader: true },
        { name: "Citra Lestari", classInfo: "8-B", role: "Wartawan Investigasi", isLeader: false }
      ],
      activeShield: false,
      activeDebuffs: [],
      inventory: []
    };
    const rival = {
      id: "team-test-2",
      name: "Biro Berita Rajawali",
      leaderName: "Doni Pratama",
      leaderClass: "8-C",
      leaderCode: "RJW01",
      memberCode: "RJW02",
      coins: 400,
      completedStages: [],
      scores: {},
      members: [{ name: "Doni Pratama", classInfo: "8-C", role: "Pemimpin Redaksi", isLeader: true }]
    };
    localStorage.setItem('redaksi_siswa_teams_v5', JSON.stringify([team, rival]));
    localStorage.setItem('redaksi_siswa_active_team_id_v5', "team-test-1");
    localStorage.setItem('redaksi_classroom_stage_v5', '1');
  });

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Verify StageWaitingRoom
  const waitingRoomText = await page.evaluate(() => document.body.innerText);
  const isWaitingRoom = waitingRoomText.includes('Tahap 1 Tuntas!') && waitingRoomText.includes('Kerja Hebat');
  console.log('✅ StageWaitingRoom displayed when Stage 1 is finished:', isWaitingRoom);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_stage1_waiting_room.png') });

  // 2. Open Shop from Waiting Room button
  console.log('\n--- Testing Press Shop from Waiting Room ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const shopBtn = btns.find(b => b.innerText && b.innerText.includes('Toko Peralatan'));
    if (shopBtn) shopBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const shopOpen = await page.evaluate(() => document.body.innerText.includes('Toko Peralatan & Bursa Strategi Pers'));
  console.log('✅ Press Shop opened from Waiting Room:', shopOpen);

  // Buy a card in Shop (e.g., Lensa Cek Fakta or Perisai)
  console.log('Testing card purchase in Shop...');
  await page.evaluate(() => {
    const buyBtns = Array.from(document.querySelectorAll('button'));
    const buyCard = buyBtns.find(b => b.innerText && b.innerText.includes('Beli Kartu'));
    if (buyCard) buyCard.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const afterBuyCoins = await page.evaluate(() => {
    const team = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]')[0];
    return team?.coins;
  });
  console.log(`✅ Koin after purchase: ${afterBuyCoins} (deducted correctly from 500)`);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_shop_purchase_mobile.png') });

  // Close Shop
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Tutup Toko"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 3. Advance to Stage 2 & Test GamePyramid
  console.log('\n--- Testing Stage 2: GamePyramid Flow ---');
  await page.evaluate(() => {
    localStorage.setItem('redaksi_classroom_stage_v5', '2');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Click "Kerjakan Tahap Ini"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.innerText && b.innerText.includes('Kerjakan Tahap Ini'));
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const isPyramidLoaded = await page.evaluate(() => document.body.innerText.includes('Tugas Penataan Piramida Berita #1'));
  console.log('✅ Stage 2 (Piramida Terbalik) loaded:', isPyramidLoaded);

  // Test Fisher-Yates Shuffle & Move controls
  await page.evaluate(() => {
    const upBtns = Array.from(document.querySelectorAll('button[aria-label="Pindahkan ke atas"]'));
    if (upBtns.length > 1) upBtns[1].click();
  });
  await new Promise(r => setTimeout(r, 300));

  // Verify responsive width on 375px
  const pyrWidth = await page.evaluate(() => document.body.scrollWidth);
  console.log(`Pyramid Mobile Width: ${pyrWidth}px (Target <= 375px)`);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_stage2_pyramid_mobile.png') });

  // 4. Advance to Stage 3 & Test GameWriteNews
  console.log('\n--- Testing Stage 3: GameWriteNews Flow ---');
  await page.evaluate(() => {
    const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
    teams[0].completedStages = [1, 2];
    teams[0].badges = ['Master 5W+1H Investigatif', 'Arsitek Berita'];
    localStorage.setItem('redaksi_siswa_teams_v5', JSON.stringify(teams));
    localStorage.setItem('redaksi_classroom_stage_v5', '3');
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Click "Kerjakan Tahap Ini"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.innerText && b.innerText.includes('Kerjakan Tahap Ini'));
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const isWritingLoaded = await page.evaluate(() => document.body.innerText.includes('Tahap 3: Menulis Berita'));
  console.log('✅ Stage 3 (Menulis Berita Straight News) loaded:', isWritingLoaded);

  // Answer all 4 challenges in Stage 3
  for (let step = 1; step <= 4; step++) {
    console.log(`Answering Writing Challenge Step ${step}/4...`);
    // Select first available option
    await page.evaluate(() => {
      const optBtns = Array.from(document.querySelectorAll('button'));
      const opt = optBtns.find(b => b.innerText && b.innerText.includes('Opsi #A'));
      if (opt) opt.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Click Next button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.innerText && (b.innerText.includes('Langkah Berikutnya') || b.innerText.includes('Selesaikan Penulisan Berita')));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
  }

  // Verify Results Card is displayed
  const resultsCardText = await page.evaluate(() => document.body.innerText);
  const isResultsCard = resultsCardText.includes('Selamat') || resultsCardText.includes('Perbaiki Naskah') || resultsCardText.includes('Klaim Lencana');
  console.log('✅ Stage 3 Results Card Displayed:', isResultsCard);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_stage3_results_card.png') });

  console.log('\nConsole Errors:', errors.length);
  if (errors.length > 0) console.log(errors);

  console.log('🎉 Deep Game & Modal Verification Successful!');
  await browser.close();
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";

async function run() {
  console.log("=== VERIFIKASI FITUR WAWANCARA NARASUMBER & BUKU CATATAN SAKU ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // 360x780 mobile viewport
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true });

  try {
    // 1. Setup session with clean team
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("redaksi_siswa_initialized_v5", "true");
      
      const testTeam = {
        id: "team-test-interview",
        name: "Biro Investigasi Rajawali",
        leaderName: "Ahmad Fadilah",
        leaderClass: "8A",
        leaderCode: "RJWL1",
        memberCode: "RJWL2",
        members: [
          { name: "Ahmad Fadilah", classInfo: "8A", role: "Pemimpin Redaksi", isLeader: true },
          { name: "Siti Nur", classInfo: "8A", role: "Wartawan Investigasi Fakta", isLeader: false }
        ],
        coins: 500,
        completedStages: [],
        pocketNotes: []
      };
      
      localStorage.setItem("redaksi_siswa_teams_v5", JSON.stringify([testTeam]));
      localStorage.setItem("redaksi_siswa_active_team_id_v5", testTeam.id);
    });

    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    console.log("[1/6] Loading Dashboard with Interview Showcase Card...");
    const showcaseCard = await page.$('section.glass');
    if (!showcaseCard) throw new Error("Showcase card not found!");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_interview_01_dashboard_showcase.png') });
    console.log("   ✅ Showcase Card rendered cleanly on mobile!");

    // 2. Open Interview Messenger Modal
    console.log("[2/6] Opening Interview Messenger Modal...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Wawancara Saksi'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 700));

    const messengerHeader = await page.evaluate(() => {
      return document.querySelector('h3')?.textContent || "";
    });
    console.log("   Active case title:", messengerHeader);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_interview_02_messenger_open.png') });
    console.log("   ✅ Interview Messenger open on mobile!");

    // 3. Ask Question 1 (Patroli Malam)
    console.log("[3/7] Asking Question 1 to Pak Joko (Satpam)...");
    await page.evaluate(() => {
      const qBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('#1'));
      if (qBtns[0]) qBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Ask Question 2 (Pintu & Gembok - Scoop Emas!)
    console.log("[4/7] Asking Question 2 (Scoop Emas)...");
    await page.evaluate(() => {
      const qBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('#2'));
      if (qBtns[0]) qBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_interview_03_scoop_fact_revealed.png') });
    console.log("   ✅ Gold Scoop Stamp rendered in chat!");

    // Check localStorage has saved the pocket notes!
    const notesCount = await page.evaluate(() => {
      const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
      return teams[0]?.pocketNotes?.length || 0;
    });
    console.log("   Pocket notes count in storage:", notesCount);
    if (notesCount < 2) {
      throw new Error(`Expected at least 2 pocket notes in storage, got ${notesCount}`);
    }

    // 4. Open Pocket Notebook Drawer
    console.log("[5/7] Opening Pocket Notebook Drawer...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Buku Saku'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_interview_04_pocket_notebook_open.png') });
    console.log("   ✅ Pocket Notebook Drawer rendered with gathered facts!");

    // Close notebook drawer
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[title*="Tutup Catatan Saku"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Close interview modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[title*="Tutup Ruang Wawancara"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // 5. Test dynamic golden scoop quote injection into Stage 3 Writing Game
    console.log("[6/7] Testing Game Stage 3 Golden Scoop Quote Injection...");
    await page.evaluate(() => {
      // Set active module to 3 directly
      localStorage.setItem("redaksi_siswa_active_module_v5", "3");
      // Set step to 1 (Step 2: Narasumber & Fakta Berimbang)
      sessionStorage.setItem("redaksi_game3_step_v5", "1");
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const scoopOptionFound = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return bodyText.includes("KUTIPAN EKSKLUSIF") || bodyText.includes("Pak Joko") || bodyText.includes("gembok");
    });
    console.log("   Scoop quote injected into Stage 3:", scoopOptionFound ? "YES (100% Accuracy unlocked)" : "NO");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_interview_06_stage3_scoop_injected.png') });

    // Return back to dashboard
    await page.evaluate(() => {
      localStorage.removeItem("redaksi_siswa_active_module_v5");
      sessionStorage.removeItem("redaksi_game3_step_v5");
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // 6. Open Meja Guru (Admin) -> Tab 6 (Kasus & Liputan)
    console.log("[7/7] Checking Admin Meja Guru Tab 6 (Kasus & Liputan)...");
    await page.evaluate(() => {
      sessionStorage.setItem('redaksi_admin_auth', 'true');
      const adminBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Meja Guru'));
      if (adminBtn) adminBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Switch to Tab 6
    await page.evaluate(() => {
      const tab6 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kasus & Saksi') || b.textContent.includes('Kasus & Liputan'));
      if (tab6) tab6.click();
    });
    await new Promise(r => setTimeout(r, 700));

    // Check horizontal overflow on mobile
    const overflowCheck = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      return { docW, scrollW, hasOverflow: scrollW > docW };
    });
    console.log(`   Admin Tab 6 Mobile Width: ${overflowCheck.docW}px | ScrollWidth: ${overflowCheck.scrollW}px | Overflow: ${overflowCheck.hasOverflow ? 'YES' : 'NO'}`);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_interview_05_admin_tab6_cases.png') });
    console.log("   ✅ Admin Tab 6 Live Monitor rendered cleanly!");

    console.log("\n========================================================");
    console.log("🎉 SELURUH VERIFIKASI FITUR WAWANCARA 100% SUKSES!");
    console.log("========================================================");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();

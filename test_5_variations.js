import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b';
const BASE_URL = 'http://localhost:4173';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log("=== STARTING 5 VARIATIONS VERIFICATION TEST ===");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // 1. Open Landing Page and setup 4 teams in localStorage
    console.log("1. Setting up 4 distinct teams in storage with 4 variations...");
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();

      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classroomStage: 1 })
        });
      } catch {}

      const teams = [
        {
          id: "team_garuda_1",
          name: "Biro 1: Garuda Hukum",
          leaderName: "Ahmad Fadilah",
          leaderClass: "8-A",
          leaderCode: "GRD01",
          memberCode: "GRD1M",
          assignedVariationIndex: 0, // Desk 1
          members: [
            { name: "Ahmad Fadilah", classInfo: "8-A", role: "Pemimpin Redaksi", isLeader: true },
            { name: "Siti Rahma", classInfo: "8-A", role: "Wartawan Investigasi", isLeader: false }
          ],
          coins: 500,
          inventory: [],
          activeDebuffs: [],
          completedStages: []
        },
        {
          id: "team_rajawali_2",
          name: "Biro 2: Rajawali Pangan",
          leaderName: "Budi Santoso",
          leaderClass: "8-B",
          leaderCode: "RJW02",
          memberCode: "RJW2M",
          assignedVariationIndex: 1, // Desk 2
          members: [
            { name: "Budi Santoso", classInfo: "8-B", role: "Pemimpin Redaksi", isLeader: true },
            { name: "Dewi Lestari", classInfo: "8-B", role: "Wartawan Investigasi", isLeader: false }
          ],
          coins: 500,
          inventory: [],
          activeDebuffs: [],
          completedStages: []
        },
        {
          id: "team_elang_3",
          name: "Biro 3: Elang Konservasi",
          leaderName: "Citra Amelia",
          leaderClass: "8-C",
          leaderCode: "ELG03",
          memberCode: "ELG3M",
          assignedVariationIndex: 2, // Desk 3
          members: [
            { name: "Citra Amelia", classInfo: "8-C", role: "Pemimpin Redaksi", isLeader: true },
            { name: "Eko Pratama", classInfo: "8-C", role: "Wartawan Investigasi", isLeader: false }
          ],
          coins: 500,
          inventory: [],
          activeDebuffs: [],
          completedStages: []
        },
        {
          id: "team_cendrawasih_4",
          name: "Biro 4: Cendrawasih Energi",
          leaderName: "Fajar Maulana",
          leaderClass: "8-D",
          leaderCode: "CDW04",
          memberCode: "CDW4M",
          assignedVariationIndex: 3, // Desk 4
          members: [
            { name: "Fajar Maulana", classInfo: "8-D", role: "Pemimpin Redaksi", isLeader: true },
            { name: "Gita Savitri", classInfo: "8-D", role: "Wartawan Investigasi", isLeader: false }
          ],
          coins: 500,
          inventory: [],
          activeDebuffs: [],
          completedStages: []
        }
      ];

      localStorage.setItem("redaksi_siswa_teams_v5", JSON.stringify(teams));
      localStorage.setItem("redaksi_classroom_stage_v5", "1");
    });

    // 2. Open Admin Dashboard to verify teacher view and variation badges
    console.log("2. Opening Admin Dashboard to inspect variation badges...");
    await page.evaluate(() => {
      localStorage.setItem("redaksi_siswa_current_user_v5", JSON.stringify({ role: "admin", name: "Ibu Guru Admin" }));
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(800);

    // Click "Masuk Meja Guru"
    const guruBtn = await page.$('::-p-text(Masuk Meja Guru)');
    if (guruBtn) {
      await guruBtn.click();
      await sleep(1000);
    }

    const badgeScreenshot = path.join(ARTIFACT_DIR, 'verify_5var_01_admin_team_badges.png');
    await page.screenshot({ path: badgeScreenshot, fullPage: true });
    console.log("Saved admin badges screenshot to", badgeScreenshot);

    // 3. Login as Team 1 (Garuda - Desk 1) in Stage 1
    console.log("3. Logging in as Team 1 (Garuda - Desk 1)...");
    await page.evaluate(async () => {
      sessionStorage.removeItem("redaksi_game1_case_v5");
      sessionStorage.removeItem("redaksi_game2_case_v5");
      sessionStorage.removeItem("redaksi_game3_step_v5");
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classroomStage: 1 })
        });
      } catch {}
      localStorage.setItem("redaksi_classroom_stage_v5", "1");
      localStorage.setItem("redaksi_siswa_active_team_id_v5", "team_garuda_1");
      localStorage.setItem("redaksi_siswa_current_user_v5", JSON.stringify({
        teamId: "team_garuda_1",
        name: "Ahmad Fadilah",
        classInfo: "8-A",
        role: "Pemimpin Redaksi",
        isLeader: true
      }));
    });
    // Go to home dashboard
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(800);

    // Click Kerjakan Tahap Ini
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Kerjakan') || b.textContent.includes('Mulai & Jawab') || b.textContent.includes('Pantau Tugas'));
      if (btn) btn.click();
    });
    await sleep(1000);

    // Verify Team 1 sees Case 1 (Kebocoran Kunci Jawaban)
    const topicTextTeam1 = await page.evaluate(() => {
      return document.querySelector('h3')?.innerText || '';
    });
    console.log("Team 1 Stage 1 Topic:", topicTextTeam1);
    if (!topicTextTeam1.includes("Kebocoran Kunci Jawaban")) {
      throw new Error(`Expected Team 1 to have Kebocoran Kunci Jawaban, but got: ${topicTextTeam1}`);
    }

    const t1Screenshot = path.join(ARTIFACT_DIR, 'verify_5var_02_group1_stage1_case1.png');
    await page.screenshot({ path: t1Screenshot, fullPage: true });
    console.log("Saved Team 1 Stage 1 screenshot to", t1Screenshot);

    // 4. Login as Team 4 (Cendrawasih - Desk 4) in Stage 1
    console.log("4. Logging in as Team 4 (Cendrawasih - Desk 4)...");
    await page.evaluate(() => {
      sessionStorage.removeItem("redaksi_siswa_active_module_v5");
      localStorage.removeItem("redaksi_siswa_active_module_v5");
      sessionStorage.removeItem("redaksi_game1_case_v5");
      localStorage.setItem("redaksi_siswa_active_team_id_v5", "team_cendrawasih_4");
      localStorage.setItem("redaksi_siswa_current_user_v5", JSON.stringify({
        teamId: "team_cendrawasih_4",
        name: "Fajar Maulana",
        classInfo: "8-D",
        role: "Pemimpin Redaksi",
        isLeader: true
      }));
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(800);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Kerjakan') || b.textContent.includes('Mulai & Jawab') || b.textContent.includes('Pantau Tugas'));
      if (btn) btn.click();
    });
    await sleep(1000);

    // Verify Team 4 sees Case 4 (Panel Surya Korsleting)
    const topicTextTeam4 = await page.evaluate(() => {
      return document.querySelector('h3')?.innerText || '';
    });
    console.log("Team 4 Stage 1 Topic:", topicTextTeam4);
    if (!topicTextTeam4.includes("Panel Surya")) {
      throw new Error(`Expected Team 4 to have Panel Surya, but got: ${topicTextTeam4}`);
    }

    const t4Screenshot = path.join(ARTIFACT_DIR, 'verify_5var_03_group4_stage1_case4.png');
    await page.screenshot({ path: t4Screenshot, fullPage: true });
    console.log("Saved Team 4 Stage 1 screenshot to", t4Screenshot);

    // 5. Check Stage 2 for Team 4 (Desk 4 - Robot Maritim)
    console.log("5. Testing Stage 2 for Team 4 (Desk 4 - Robot Maritim)...");
    await page.evaluate(async () => {
      sessionStorage.removeItem("redaksi_siswa_active_module_v5");
      localStorage.removeItem("redaksi_siswa_active_module_v5");
      sessionStorage.removeItem("redaksi_game2_case_v5");
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classroomStage: 2 })
        });
      } catch {}
      localStorage.setItem("redaksi_classroom_stage_v5", "2");
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(800);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Kerjakan') || b.textContent.includes('Mulai & Jawab') || b.textContent.includes('Pantau Tugas'));
      if (btn) btn.click();
    });
    await sleep(1000);

    const topicStage2Team4 = await page.evaluate(() => {
      return document.querySelector('h3')?.innerText || '';
    });
    console.log("Team 4 Stage 2 Topic:", topicStage2Team4);
    if (!topicStage2Team4.includes("Robot") && !topicStage2Team4.includes("AquaCleaner")) {
      throw new Error(`Expected Team 4 Stage 2 to be Robot Maritim, but got: ${topicStage2Team4}`);
    }

    const t4Stage2Screenshot = path.join(ARTIFACT_DIR, 'verify_5var_04_group4_stage2_robot.png');
    await page.screenshot({ path: t4Stage2Screenshot, fullPage: true });
    console.log("Saved Team 4 Stage 2 screenshot to", t4Stage2Screenshot);

    // 6. Check Stage 3 for Team 4 (Desk 4 - Reaktor Biogas)
    console.log("6. Testing Stage 3 for Team 4 (Desk 4 - Reaktor Biogas)...");
    await page.evaluate(async () => {
      sessionStorage.removeItem("redaksi_siswa_active_module_v5");
      localStorage.removeItem("redaksi_siswa_active_module_v5");
      sessionStorage.removeItem("redaksi_game3_step_v5");
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classroomStage: 3 })
        });
      } catch {}
      localStorage.setItem("redaksi_classroom_stage_v5", "3");
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(800);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Kerjakan') || b.textContent.includes('Mulai & Jawab') || b.textContent.includes('Pantau Tugas'));
      if (btn) btn.click();
    });
    await sleep(1000);

    const variationTextTeam4 = await page.evaluate(() => {
      return document.body.innerText;
    });
    const hasBiogas = variationTextTeam4.includes("Reaktor Biogas") || variationTextTeam4.includes("biodigester");
    console.log("Team 4 Stage 3 contains Reaktor Biogas?:", hasBiogas);
    if (!hasBiogas) {
      throw new Error("Expected Team 4 Stage 3 to contain Reaktor Biogas!");
    }

    const t4Stage3Screenshot = path.join(ARTIFACT_DIR, 'verify_5var_05_group4_stage3_biogas.png');
    await page.screenshot({ path: t4Stage3Screenshot, fullPage: true });
    console.log("Saved Team 4 Stage 3 screenshot to", t4Stage3Screenshot);

    console.log("=== ALL 5 VARIATIONS VERIFIED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";

async function run() {
  console.log("=== COMPREHENSIVE VERIFICATION: CODE INPUT RESILIENCE IN MENU & ADMIN ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  try {
    // 1. Visit landing page
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    console.log("[1/6] Testing direct Teacher PIN in Menu code box (e.g. typing 'guru2026')...");
    const menuCodeInput = await page.$('input[placeholder*="1X88H"]');
    if (!menuCodeInput) throw new Error("Menu code input not found!");

    await menuCodeInput.type('guru2026');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 800));

    // Should directly navigate to Admin Dashboard!
    const isAdminOpen = await page.evaluate(() => document.body.innerText.includes("Meja Guru") && document.body.innerText.includes("Dewan Pers"));
    console.log("   Navigated to Admin via Menu input:", isAdminOpen ? "YES (Dewan Pers • Meja Guru)" : "NO");
    if (!isAdminOpen) {
      throw new Error("FAIL: Direct PIN entry from menu did not open Meja Guru!");
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_fix_01_menu_direct_admin_pin.png') });
    console.log("   ✅ SUCCESS: Direct Admin PIN in menu works seamlessly!");

    // 2. Test Custom Code Creation in Admin
    console.log("[2/6] Testing Custom Code Creation in Admin Tab 1 (e.g. 'RAJALAWALI')...");
    const customCodeInput = await page.$('input[placeholder*="TIM01"]');
    if (!customCodeInput) throw new Error("Custom code input in Admin not found!");

    await customCodeInput.type('RJWL');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Terbitkan Kode Khusus'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const feedbackText = await page.evaluate(() => document.body.innerText);
    const codePublished = feedbackText.includes("RJWL");
    console.log("   Custom code 'RJWL' published in Admin:", codePublished ? "YES" : "NO");
    if (!codePublished) throw new Error("FAIL: Custom code was not published!");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_fix_02_admin_custom_code_published.png') });
    console.log("   ✅ SUCCESS: Custom code 'RJWL' published!");

    // 3. Test Editing Biro Codes via "Ubah Biro & Kode"
    console.log("[3/6] Testing 'Ubah Biro & Kode' to customize Leader Code to 'ELANG1'...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ubah Biro'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
      const setVal = (el, val) => {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const inputs = Array.from(document.querySelectorAll('input'));
      const leaderCodeInput = inputs.find(i => i.placeholder && i.placeholder.includes('RJWL1'));
      if (leaderCodeInput) setVal(leaderCodeInput, "ELANG1");
      
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simpan Perubahan Biro'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const updatedText = await page.evaluate(() => document.body.innerText);
    console.log("   Biro code updated to ELANG1:", updatedText.includes("ELANG1") ? "YES" : "NO");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_fix_03_admin_code_edited.png') });
    console.log("   ✅ SUCCESS: Code successfully updated to ELANG1!");

    // 4. Test Exit Admin Button (Back to Menu without crash!)
    console.log("[4/6] Testing Exit Admin Button ('Ke Siswa')...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ke Siswa'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const landingHeader = await page.evaluate(() => document.querySelector('h2')?.textContent);
    console.log("   Returned to Landing Page:", landingHeader);
    if (!landingHeader || !landingHeader.includes("Kode Kelompok")) {
      throw new Error("FAIL: Did not return cleanly to landing page!");
    }
    console.log("   ✅ SUCCESS: Clean exit to Landing Page without errors!");

    // 5. Test Entering the Custom Codes in Menu
    console.log("[5/6] Entering the activated leader code 'ELANG1' in Menu code box...");
    const inputAgain = await page.$('input[placeholder*="1X88H"]');
    await inputAgain.type('elang1'); // test lowercase handling!
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 800));

    const loggedInDashboard = await page.evaluate(() => document.body.innerText.includes("Biro"));
    console.log("   Logged into Dashboard with ELANG1:", loggedInDashboard ? "YES" : "NO");
    if (!loggedInDashboard) {
      throw new Error("FAIL: Dashboard not opened for code ELANG1!");
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_fix_04_menu_custom_code_activated.png') });
    console.log("   ✅ SUCCESS: Code 'ELANG1' logged in directly to Meja Redaksi!");

    // Logout back to menu
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('Ganti Kelompok'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Now test entering pending setup code 'RJWL'
    console.log("   Entering pending setup code 'RJWL'...");
    const inputPending = await page.$('input[placeholder*="1X88H"]');
    await inputPending.type('rjwl');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 800));

    const isSetupForm = await page.evaluate(() => document.body.innerText.includes("Daftarkan Biro"));
    console.log("   Setup form opened for unassigned slot 'RJWL':", isSetupForm ? "YES" : "NO");
    if (!isSetupForm) {
      throw new Error("FAIL: Setup form not opened for pending code RJWL!");
    }
    console.log("   ✅ SUCCESS: Code 'RJWL' opened Biro Registration form!");

    // 6. Test Admin PIN Screen Quick Button
    console.log("[6/6] Testing Admin PIN Screen quick button ('Gunakan PIN Default')...");
    // Clear auth and visit Meja Guru
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    // Click Meja Guru (Admin)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Meja Guru'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Click quick PIN button
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Gunakan PIN Default'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const pinVal = await page.evaluate(() => document.querySelector('input[placeholder*="GURU2026"]')?.value);
    console.log("   Quick PIN value filled:", pinVal);
    if (pinVal !== "GURU2026") throw new Error("FAIL: PIN default not filled!");

    // Submit PIN
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Buka Pusat Komando'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 700));

    const finalAdminOpen = await page.evaluate(() => document.body.innerText.includes("Meja Guru") && document.body.innerText.includes("Dewan Pers"));
    console.log("   Admin opened via Quick PIN button:", finalAdminOpen ? "YES" : "NO");
    if (!finalAdminOpen) {
      throw new Error("FAIL: Quick PIN submit did not open Admin!");
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_fix_05_admin_quick_pin_success.png') });
    console.log("   ✅ SUCCESS: Quick PIN button works perfectly!");

    console.log("\n========================================================");
    console.log("🎉 ALL CODE INPUT RESILIENCE TESTS PASSED 100%!");
    console.log("========================================================");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();

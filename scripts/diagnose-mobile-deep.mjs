import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/anton/.gemini/antigravity/brain/081b7450-7a0d-45f8-840f-35867098310b";

async function run() {
  console.log("=== COMPREHENSIVE MOBILE-FRIENDLINESS AUDIT (360px) ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // 360x780 (standard budget Android phone)
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true });

  const auditReport = [];

  const inspectPage = async (viewName) => {
    const issues = await page.evaluate((name) => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;

      const hasHorizontalScroll = scrollWidth > docWidth || bodyScrollWidth > docWidth;

      const elements = Array.from(document.querySelectorAll('*'));
      const overflowingElements = [];
      const smallTouchTargets = [];
      const smallFontInputs = [];

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Check horizontal overflow (only for unclipped elements)
        let isClipped = false;
        let parent = el.parentElement;
        while (parent && parent !== document.body && parent !== document.documentElement) {
          const style = window.getComputedStyle(parent);
          const ox = style.overflowX;
          const o = style.overflow;
          if (['hidden', 'auto', 'scroll', 'clip'].includes(ox) || ['hidden', 'auto', 'scroll', 'clip'].includes(o)) {
            const pRect = parent.getBoundingClientRect();
            if (pRect.right <= docWidth + 3) {
              isClipped = true;
              break;
            }
          }
          parent = parent.parentElement;
        }

        if (!isClipped && rect.right > docWidth + 3 && rect.width > 0 && rect.height > 0) {
          overflowingElements.push({
            tag: el.tagName,
            id: el.id,
            className: (el.className?.toString() || '').substring(0, 60),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            text: el.innerText ? el.innerText.substring(0, 30).replace(/\n/g, ' ') : ''
          });
        }

        // Check interactive touch targets
        if (['BUTTON', 'A', 'INPUT', 'SELECT'].includes(el.tagName)) {
          if (rect.width > 0 && rect.height > 0) {
            if (rect.height < 36 || rect.width < 36) {
              smallTouchTargets.push({
                tag: el.tagName,
                text: el.innerText ? el.innerText.substring(0, 25).replace(/\n/g, ' ') : (el.value || el.placeholder || ''),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                className: (el.className?.toString() || '').substring(0, 50)
              });
            }
          }
        }

        // Check inputs with font size < 16px (causes auto-zoom on iOS Safari)
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) {
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          if (fontSize < 15.5) {
            smallFontInputs.push({
              tag: el.tagName,
              placeholder: el.placeholder || '',
              fontSize: fontSize + 'px',
              className: (el.className?.toString() || '').substring(0, 50)
            });
          }
        }
      });

      return {
        view: name,
        docWidth,
        scrollWidth,
        bodyScrollWidth,
        hasHorizontalScroll,
        overflowCount: overflowingElements.length,
        overflowingElements: overflowingElements.slice(0, 5),
        smallTouchTargetsCount: smallTouchTargets.length,
        smallTouchTargets: smallTouchTargets.slice(0, 5),
        smallFontInputsCount: smallFontInputs.length,
        smallFontInputs: smallFontInputs.slice(0, 5)
      };
    }, viewName);

    auditReport.push(issues);
    console.log(`\n[VIEW: ${viewName}]`);
    console.log(`- Horizontal Scroll: ${issues.hasHorizontalScroll ? '⚠️ YES (' + issues.scrollWidth + 'px > ' + issues.docWidth + 'px)' : '✅ NO'}`);
    console.log(`- Overflowing Elements: ${issues.overflowCount}`);
    if (issues.overflowCount > 0) {
      console.log('  Details:', JSON.stringify(issues.overflowingElements, null, 2));
    }
    console.log(`- Small Touch Targets (<36px): ${issues.smallTouchTargetsCount}`);
    if (issues.smallTouchTargetsCount > 0) {
      console.log('  Sample Small Targets:', JSON.stringify(issues.smallTouchTargets, null, 2));
    }
    console.log(`- Small Font Inputs (<16px / iOS Zoom Risk): ${issues.smallFontInputsCount}`);
    if (issues.smallFontInputsCount > 0) {
      console.log('  Sample Small Inputs:', JSON.stringify(issues.smallFontInputs, null, 2));
    }

    // Capture screenshot
    const shotName = `audit_${viewName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    await page.screenshot({ path: path.join(ARTIFACT_DIR, shotName), fullPage: false });
  };

  // 1. Landing Page
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("redaksi_siswa_initialized_v5", "true");
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await inspectPage('1_Landing_Page');

  // 2. Open Admin
  await page.evaluate(() => {
    const adminBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Meja Guru'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    await pinInput.type('GURU2026');
    await page.keyboard.press('Enter');
  }
  await new Promise(r => setTimeout(r, 600));

  // Admin Tab 1 (Biro)
  await inspectPage('2_Admin_Tab1_Biro');

  // Admin Tab 1 with open Edit Form
  await page.evaluate(() => {
    const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('+ Terbitkan 1 Kode Ketua'));
    if (genBtn) genBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const editBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ubah Biro'));
    if (editBtn) editBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await inspectPage('3_Admin_Tab1_EditBiroForm');

  // Admin Tab 2 (Tahap)
  await page.evaluate(() => {
    const tab2 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tahap'));
    if (tab2) tab2.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await inspectPage('4_Admin_Tab2_Tahap');

  // Admin Tab 3 (Bank Kas & Debuff)
  await page.evaluate(() => {
    const tab3 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kas'));
    if (tab3) tab3.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await inspectPage('5_Admin_Tab3_Kas');

  // Admin Tab 4 (Siaran Darurat)
  await page.evaluate(() => {
    const tab4 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Siaran'));
    if (tab4) tab4.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await inspectPage('6_Admin_Tab4_Siaran');

  // Admin Tab 5 (Penilaian Rubrik)
  await page.evaluate(() => {
    const tab5 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Rubrik') || b.textContent.includes('Nilai'));
    if (tab5) tab5.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await inspectPage('7_Admin_Tab5_Rubrik');

  // Back to Student
  await page.evaluate(() => {
    const exitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ke Siswa') || b.textContent.includes('Kembali ke Halaman Siswa'));
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Get generated leader code
  const leaderCode = await page.evaluate(() => {
    const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
    return teams[teams.length - 1].leaderCode;
  });

  // Enter leader code on Landing
  const codeIn = await page.$('input[placeholder*="1X88H"]');
  await codeIn.type(leaderCode);
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 600));

  await inspectPage('8_Bureau_Setup_Form');

  // Fill Bureau Setup
  await page.evaluate(() => {
    const setVal = (el, val) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const inputs = Array.from(document.querySelectorAll('input'));
    if (inputs[0]) setVal(inputs[0], "Fajar");
    if (inputs[1]) setVal(inputs[1], "8A");
    if (inputs[2]) setVal(inputs[2], "Biro Merdeka");
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 800));

  // Dashboard
  await inspectPage('9_Dashboard_Meja_Redaksi');

  // Open Press Card Modal
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kartu Pers') || b.title?.includes('Kartu Biro Pers'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await inspectPage('10_Press_Card_Modal');
  // Close Press Card Modal
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tutup') || b.title?.includes('Tutup'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Open Press Shop Modal
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Toko Peralatan'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await inspectPage('11_Press_Shop_Modal');
  // Close Press Shop Modal
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tutup') || b.title?.includes('Tutup'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Start Game 1 (5W+1H)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kerjakan Tahap Ini'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await inspectPage('12_Game1_5W1H');

  // Switch to Game 2 (Pyramid)
  await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kembali'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  // Override stage to 2
  await page.evaluate(() => {
    localStorage.setItem('redaksi_classroom_stage_v5', '2');
    const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
    if (teams.length > 0) {
      teams[teams.length - 1].completedStages = [1];
      localStorage.setItem('redaksi_siswa_teams_v5', JSON.stringify(teams));
    }
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Enter Game 2
  await page.evaluate(() => {
    const startBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Kerjakan Tahap Ini'));
    if (startBtns[1]) startBtns[1].click();
    else if (startBtns[0]) startBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 600));
  await inspectPage('13_Game2_Pyramid');

  // Switch to Game 3 (Write News)
  await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kembali'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  // Override stage to 3
  await page.evaluate(() => {
    localStorage.setItem('redaksi_classroom_stage_v5', '3');
    const teams = JSON.parse(localStorage.getItem('redaksi_siswa_teams_v5') || '[]');
    if (teams.length > 0) {
      teams[teams.length - 1].completedStages = [1, 2];
      localStorage.setItem('redaksi_siswa_teams_v5', JSON.stringify(teams));
    }
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Enter Game 3
  await page.evaluate(() => {
    const startBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Kerjakan Tahap Ini'));
    if (startBtns[2]) startBtns[2].click();
    else if (startBtns[0]) startBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 600));
  await inspectPage('14_Game3_WriteNews');

  console.log("\n==============================================");
  console.log("MOBILE AUDIT COMPLETE FOR ALL 14 SCREENS!");
  console.log("==============================================");
  await browser.close();
}

run().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});

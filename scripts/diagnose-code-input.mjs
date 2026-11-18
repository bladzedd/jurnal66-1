import puppeteer from 'puppeteer';

async function diagnose() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

  const storageDump = await page.evaluate(() => {
    return {
      activeTeamId: localStorage.getItem("redaksi_siswa_active_team_id_v5"),
      currentUser: localStorage.getItem("redaksi_siswa_current_user_v5"),
      teams: localStorage.getItem("redaksi_siswa_teams_v5"),
      freeze: localStorage.getItem("redaksi_siswa_screen_freeze_v5"),
      initialized: localStorage.getItem("redaksi_siswa_initialized_v5"),
      activeModule: localStorage.getItem("redaksi_siswa_active_module_v5")
    };
  });
  console.log("Current localStorage dump:", storageDump);

  const currentView = await page.evaluate(() => {
    return {
      title: document.title,
      h1: document.querySelector('h1')?.textContent,
      h2: document.querySelector('h2')?.textContent,
      h3: document.querySelector('h3')?.textContent,
      inputs: Array.from(document.querySelectorAll('input')).map(i => ({
        type: i.type,
        placeholder: i.placeholder,
        value: i.value,
        disabled: i.disabled,
        readOnly: i.readOnly
      }))
    };
  });
  console.log("Current View Info:", currentView);

  await browser.close();
}

diagnose().catch(console.error);

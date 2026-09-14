/* shot_admin_v182.js —— 截图线上/本地后台页（登录态） */
const path = require('path');
const NODE_MODULES = 'C:/Users/alext/.workbuddy/binaries/node/workspace/node_modules';
const puppeteer = require(path.join(NODE_MODULES, 'puppeteer'));
const BASE = process.env.SHOT_BASE || 'http://127.0.0.1:8099';
const OUT = 'C:/Users/alext/Web/personal-site/tools/v182-admin.png';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 });

  // 登录
  await page.goto(BASE + '/pages/login.html', { waitUntil: 'networkidle0' });
  await page.type('#passwordInput', 'admin2026');
  await page.click('.login-btn');
  await new Promise(r => setTimeout(r, 1500));
  await page.waitForSelector('.admin-grid', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: OUT, fullPage: true });
  console.log('截图完成:', OUT);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

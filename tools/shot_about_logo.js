/* shot_about_logo.js — v1.6.17 关于页 LOGO 替换效果截图
   桌面 1920x1080 整页 + 头像区域特写 */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8000';
const OUT = 'C:/Users/alext/Web/personal-site/tools/';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--force-device-scale-factor=1.5'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(BASE + '/about.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));

  // 头像特写：截 .about-avatar 元素本身
  const avatar = await page.$('.about-avatar');
  if (avatar) {
    await avatar.screenshot({ path: OUT + 'about-logo-closeup.png' });
    const box = await avatar.boundingBox();
    console.log('avatar box:', JSON.stringify(box));
  } else {
    console.log('WARN: .about-avatar not found');
  }

  // 整页 about 区域（hero + about 内容）截图
  const section = await page.$('section.about, .about-section, main');
  if (section) {
    await section.screenshot({ path: OUT + 'about-fullpage.png' });
  } else {
    await page.screenshot({ path: OUT + 'about-fullpage.png', fullPage: true });
  }

  await browser.close();
  console.log('saved: about-logo-closeup.png, about-fullpage.png');
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

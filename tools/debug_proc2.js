/* debug_proc2.js — 打印 browser target 上 getProcessInfo 的完整结构 */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars', '--disable-extensions']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const session = await browser.target().createCDPSession();
  const info = await session.send('SystemInfo.getProcessInfo');
  console.log('进程数:', info.processInfo.length);
  for (const p of info.processInfo) {
    console.log(JSON.stringify(p));
  }
  await session.detach();
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });

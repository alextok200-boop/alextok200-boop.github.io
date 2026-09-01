/* shot_journey.js — 首页个人成长时间轴视觉验证
   截图：桌面版（中轴交错）、移动版（单列左线）、英文版
   并断言：区块顺序（cap → journey → b2b）、i18n 生效、控制台零错误 */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8000';
const OUT = __dirname;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--hide-scrollbars', '--disable-extensions', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));

  // 1) 桌面版 + 中文
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(BASE + '/index.html?v=1.6.14', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));
  const jEl = await page.$('#journey');
  await jEl.scrollIntoView();
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await jEl.screenshot({ path: OUT + '/shot-journey-desktop.png' });

  // 断言区块顺序
  const order = await page.evaluate(() => {
    const secs = [...document.querySelectorAll('main .section')];
    const find = (k) => secs.findIndex(s => (s.querySelector('[data-i18n]') || {}).getAttribute?.('data-i18n') === k);
    const idx = {};
    secs.forEach((s, i) => {
      const key = s.querySelector('h2[data-i18n]');
      if (key) idx[key.getAttribute('data-i18n')] = i;
    });
    const items = document.querySelectorAll('.journey-item').length;
    const cards = document.querySelectorAll('.journey-card').length;
    const dates = [...document.querySelectorAll('.journey-date')].map(d => d.textContent.trim());
    const dots = document.querySelectorAll('.journey-dot').length;
    // 时间轴位置：cap 之前、b2b 之前
    const journeyIdx = idx['journey.title'];
    return {
      items, cards, dots, dates,
      pos: { cap: idx['cap.title'], journey: journeyIdx, b2b: idx['b2b.title'] },
      orderOk: idx['cap.title'] < journeyIdx && journeyIdx < idx['b2b.title'],
      zhTitle: (document.querySelector('[data-i18n="journey.title"]') || {}).textContent || ''
    };
  });
  console.log('桌面版:', JSON.stringify(order, null, 1));

  // 2) 移动版
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html?v=1.6.14', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));
  const jM = await page.$('#journey');
  await jM.scrollIntoView();
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
  await jM.screenshot({ path: OUT + '/shot-journey-mobile.png' });

  // 3) 英文版
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(BASE + '/index.html?v=1.6.14', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
  await page.click('[data-i18n-toggle]');
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  const enTitle = await page.evaluate(() => {
    const t = document.querySelector('[data-i18n="journey.title"]');
    return t ? t.textContent : '(missing)';
  });
  const jE = await page.$('#journey');
  await jE.scrollIntoView();
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
  await jE.screenshot({ path: OUT + '/shot-journey-en.png' });
  console.log('英文标题:', enTitle);

  console.log('\n控制台错误数:', errors.length);
  for (const e of errors) console.log('  ' + e);

  const pass = order.orderOk && order.items === 3 && order.dots === 3 &&
    enTitle === 'Growth Timeline' && errors.length === 0 &&
    order.zhTitle === '个人成长时间轴';
  console.log('\n结果: ' + (pass ? 'ALL PASS ✓' : 'FAIL ✗'));
  await browser.close();
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });

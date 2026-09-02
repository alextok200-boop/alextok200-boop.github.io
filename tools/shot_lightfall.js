/* shot_lightfall.js — v1.6.16 流星/金币视觉效果截图
   桌面 1920x1080 正常态 + prefers-reduced-motion 静态态 各截一张
   v1.6.16 可见性修复后：reduced-motion 必须 72/72 元素全部可见 */
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

  // 正常态：截多张(2s/5s/8s)覆盖 fast 星不同运动阶段
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 2000)));
  await page.screenshot({ path: OUT + 'lf-normal-2s.png' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 3000)));
  await page.screenshot({ path: OUT + 'lf-normal-5s.png' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 3000)));
  await page.screenshot({ path: OUT + 'lf-normal-8s.png' });
  console.log('normal 3 frames saved');

  // reduced-motion 静态态
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.reload({ waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  const staticInfo = await page.evaluate(() => {
    const wraps = document.querySelectorAll('#lightfall .lf-wrap');
    let animated = 0, staticVisible = 0;
    wraps.forEach(w => {
      const anim = getComputedStyle(w).animationName;
      const op = getComputedStyle(w.firstElementChild).opacity;
      if (anim !== 'none') animated++;
      if (parseFloat(op) > 0.5) staticVisible++;
    });
    return { total: wraps.length, stillAnimated: animated, staticVisible };
  });
  await page.screenshot({ path: OUT + 'lf-reduced.png' });
  console.log('reduced-motion:', JSON.stringify(staticInfo));

  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

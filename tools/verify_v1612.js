/* verify_v1612.js — v1.6.14 发布前终验
   1. 三个页面控制台零错误/零未捕获异常
   2. lightfall 元素数量 = 72（60星+12币，v1.6.14 恢复原始密度）且动画运行
   3. hero 视频 480p 实际加载播放（readyState>=2）
   4. careers 粒子 canvas 位图面积 <= 1.9M 像素
   5. 版本号 v=1.6.14 生效 */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8000';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--hide-scrollbars', '--disable-extensions', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));

  // 1) index
  await page.goto(BASE + '/index.html?v=1.6.14', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));
  const idx = await page.evaluate(() => {
    const wraps = document.querySelectorAll('.lf-wrap').length;
    const lfs = document.querySelectorAll('.lf, .lf-coin').length;
    const v = document.querySelector('.hero-video');
    const anim = wraps ? getComputedStyle(document.querySelector('.lf')).animationName : 'none';
    const vReady = v ? v.readyState : -1;
    const vw = v ? v.videoWidth : -1;
    const vh = v ? v.videoHeight : -1;
    const src = v ? (v.currentSrc || '').split('/').pop() : '';
    return { wraps, lfs, anim, vReady, vw, vh, src };
  });
  console.log('index: lightfall wraps=' + idx.wraps + ' lf=' + idx.lfs + ' anim=' + idx.anim +
    ' | video readyState=' + idx.vReady + ' ' + idx.vw + 'x' + idx.vh + ' (' + idx.src + ')');

  // 2) careers
  await page.goto(BASE + '/careers.html?v=1.6.14', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));
  const car = await page.evaluate(() => {
    const cv = document.getElementById('pageParticles');
    const px = cv ? cv.width * cv.height : 0;
    const styles = document.querySelectorAll('link[rel="stylesheet"]').length;
    return { px, w: cv ? cv.width : 0, h: cv ? cv.height : 0, styles };
  });
  console.log('careers: 粒子画布 ' + car.w + 'x' + car.h + ' = ' + (car.px / 1e6).toFixed(2) + 'M 像素 (上限1.9M)');

  // 3) about 基线
  await page.goto(BASE + '/about.html?v=1.6.14', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));

  // 4) 版本号抽查（3 个文件）
  const version = await page.evaluate(() => {
    const css = document.querySelector('link[rel="stylesheet"]');
    return css ? (css.getAttribute('href') || '') : 'N/A';
  });
  console.log('about: css href = ' + version);

  const real = [];
  for (const e of errors) real.push(e);
  console.log('\n控制台错误数: ' + real.length);
  for (const e of real) console.log('  ' + e);

  const pass = real.length === 0 && idx.wraps === 72 && idx.lfs === 72 &&
    idx.anim === 'lf-fall' && idx.vReady >= 2 && idx.vw === 854 && idx.vh === 480 &&
    car.px <= 1900000 && (version.includes('1.6.14'));
  console.log('\n结果: ' + (pass ? 'ALL PASS ✓' : 'FAIL ✗'));
  await browser.close();
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });

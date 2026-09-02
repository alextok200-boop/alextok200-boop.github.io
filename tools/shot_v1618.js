/* shot_v1618.js — v1.6.18 招商表单 + 博客阅读计数 视觉验证
   1. brands.html 招商表单区（滚动定位）
   2. blog.html 列表（阅读计数显示） */
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

  // 1. brands 招商表单：预注入 localStorage 阅读数据无意义，这里直接定位表单
  await page.goto(BASE + '/brands.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await page.evaluate(() => {
    const el = document.getElementById('brand-inquiry');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
  await page.screenshot({ path: OUT + 'v1618-brand-form.png' });

  // 2. blog 列表：先注入 3 条阅读记录再进页面
  await page.evaluate(() => {
    const prev = JSON.parse(localStorage.getItem('post_views') || '{}');
    prev['2026-08-31-ku-cun-guard-rail'] = (prev['2026-08-31-ku-cun-guard-rail'] || 0) + 128;
    prev['2026-08-28-qing-cang'] = (prev['2026-08-28-qing-cang'] || 0) + 96;
    prev['2026-08-25-da-ren-roi'] = (prev['2026-08-25-da-ren-roi'] || 0) + 64;
    localStorage.setItem('post_views', JSON.stringify(prev));
  });
  await page.goto(BASE + '/blog.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await page.screenshot({ path: OUT + 'v1618-blog-views.png' });

  await browser.close();
  console.log('saved: v1618-brand-form.png, v1618-blog-views.png');
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

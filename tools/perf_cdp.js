/* perf_cdp.js — 主线程负载控制变量测量（一次性审计工具）
   用 CDP Performance API 测 3 秒连续滚动前后的累计耗时增量：
   TaskDuration / ScriptDuration / LayoutDuration / RecalcStyleDuration
   对比场景：backdrop-filter / 粒子 / lightfall / 视频 各自贡献。 */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8000';

async function getMetrics(cdp) {
  const { metrics } = await cdp.send('Performance.getMetrics');
  const m = {};
  for (const x of metrics) m[x.name] = x.value;
  return m;
}

async function measure(page, mutate) {
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
  if (mutate) await page.evaluate(mutate);
  const cdp = await page.createCDPSession();
  await cdp.send('Performance.enable');
  await new Promise(r => setTimeout(r, 200));
  const b0 = await getMetrics(cdp);

  // 3 秒连续滚动
  await page.evaluate(() => new Promise((resolve) => {
    const t0 = performance.now();
    let y = 0;
    const iv = setInterval(() => {
      y += 220;
      if (y > 6000) y = 0;
      window.scrollTo(0, y);
      if (performance.now() - t0 >= 3000) { clearInterval(iv); resolve(); }
    }, 16);
  }));
  await new Promise(r => setTimeout(r, 200));
  const b1 = await getMetrics(cdp);
  await cdp.detach();
  return {
    taskMs: Math.round((b1.TaskDuration - b0.TaskDuration) * 1000),
    scriptMs: Math.round((b1.ScriptDuration - b0.ScriptDuration) * 1000),
    layoutMs: Math.round((b1.LayoutDuration - b0.LayoutDuration) * 1000),
    styleMs: Math.round((b1.RecalcStyleDuration - b0.RecalcStyleDuration) * 1000)
  };
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const cases = [
    ['index 原版(视频+lightfall+毛玻璃)', null],
    ['index 去毛玻璃', () => {
      const h = document.querySelector('.site-header');
      h.style.backdropFilter = 'none'; h.style.background = 'rgba(9,7,17,0.97)';
    }],
    ['index 去lightfall', () => {
      const c = document.getElementById('lightfall'); if (c) c.style.display = 'none';
    }],
    ['index 停视频', () => {
      const v = document.querySelector('.hero-video'); if (v) { v.pause(); v.style.display = 'none'; }
    }],
    ['index 全关(毛玻璃+lightfall+视频)', () => {
      const h = document.querySelector('.site-header');
      h.style.backdropFilter = 'none'; h.style.background = 'rgba(9,7,17,0.97)';
      const c = document.getElementById('lightfall'); if (c) c.style.display = 'none';
      const v = document.querySelector('.hero-video'); if (v) { v.pause(); v.style.display = 'none'; }
    }],
  ];

  console.log('\n=== 主线程负载控制变量（1920x1080, 3s 连续滚动, 软件渲染）===');
  console.log('场景'.padEnd(30), 'Task ms'.padStart(9), 'Script ms'.padStart(9), 'Layout ms'.padStart(9), 'Style ms'.padStart(9));
  const results = [];
  for (const [name, mutate] of cases) {
    const r = await measure(page, mutate);
    results.push([name, r]);
    console.log(name.padEnd(30), String(r.taskMs).padStart(9), String(r.scriptMs).padStart(9), String(r.layoutMs).padStart(9), String(r.styleMs).padStart(9));
  }

  // careers 粒子页单独对比
  await page.goto(BASE + '/careers.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
  const cdp = await page.createCDPSession();
  await cdp.send('Performance.enable');
  await new Promise(r => setTimeout(r, 200));
  const c0 = await getMetrics(cdp);
  await page.evaluate(() => new Promise((resolve) => {
    const t0 = performance.now();
    let y = 0;
    const iv = setInterval(() => {
      y += 220;
      if (y > 6000) y = 0;
      window.scrollTo(0, y);
      if (performance.now() - t0 >= 3000) { clearInterval(iv); resolve(); }
    }, 16);
  }));
  await new Promise(r => setTimeout(r, 200));
  const c1 = await getMetrics(cdp);
  await cdp.detach();
  console.log(''.padEnd(30), '---- careers（粒子页）----');
  console.log('careers 原版(粒子+毛玻璃)'.padEnd(30),
    String(Math.round((c1.TaskDuration - c0.TaskDuration) * 1000)).padStart(9),
    String(Math.round((c1.ScriptDuration - c0.ScriptDuration) * 1000)).padStart(9),
    String(Math.round((c1.LayoutDuration - c0.LayoutDuration) * 1000)).padStart(9),
    String(Math.round((c1.RecalcStyleDuration - c0.RecalcStyleDuration) * 1000)).padStart(9));

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });

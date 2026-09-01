/* perf_mem.js — 内存占用诊断（v4，请求拦截控制变量）
   正确控制变量：加载前拦截/abort 特效资源（lightfall.js / 粒子 JS / 视频 mp4），
   而非加载后 display:none（后者不释放已提交内存，数据被污染）。
   口径：
   1. 页面 renderer 进程 WS（SystemInfo.getProcessInfo 拿 renderer id → 进程树查该 pid）
   2. 进程树 WS Σ（全部 chrome 进程）
   3. JS 堆（GC 后）
   4. DOM 级归因 */
const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8000';
const MB = (n) => (n / (1024 * 1024)).toFixed(1) + 'MB';

function procTreeMB(rootPid) {
  try {
    const out = execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${__dirname.replace(/\\/g, '/')}/proc_tree.ps1" ${rootPid}`,
      { encoding: 'utf8', maxBuffer: 1e7, windowsHide: true, shell: false });
    const m = out.match(/WS=(\d+);PRIV=(\d+);COUNT=(\d+)/);
    if (m) return { ws: +m[1], priv: +m[2], count: +m[3] };
  } catch (e) { }
  return { ws: -1, priv: -1, count: 0 };
}

// 查单个 PID 的 WS
function singleProcWS(pid) {
  try {
    const out = execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-CimInstance Win32_Process -Filter \\"ProcessId=${pid}\\").WorkingSetSize"`,
      { encoding: 'utf8', maxBuffer: 1e6, windowsHide: true, shell: false });
    const v = parseInt(out.trim(), 10);
    return isNaN(v) ? -1 : v;
  } catch (e) { return -1; }
}

const attribution = () => {
  const out = { canvasBitmaps: 0, canvases: 0, videoEls: 0, videoReady: 0,
    lfWraps: 0, lfCoins: 0, particleCanvas: null, transformEls: 0, willChangeEls: 0, domNodes: 0, scriptTags: 0 };
  document.querySelectorAll('canvas').forEach(c => {
    out.canvases++;
    out.canvasBitmaps += c.width * c.height * 4;
    if (c.id === 'pageParticles') out.particleCanvas = { w: c.width, h: c.height };
  });
  document.querySelectorAll('video').forEach(v => { out.videoEls++; if (v.readyState >= 2) out.videoReady++; });
  out.lfWraps = document.querySelectorAll('.lf-wrap').length;
  out.lfCoins = document.querySelectorAll('.lf, .lf-coin').length;
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.willChange && cs.willChange !== 'auto') out.willChangeEls++;
    if (cs.transform && cs.transform !== 'none') out.transformEls++;
  });
  out.domNodes = document.getElementsByTagName('*').length;
  out.scriptTags = document.querySelectorAll('script[src]').length;
  return out;
};

async function runCase(name, path, blockPatterns) {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--hide-scrollbars', '--disable-extensions', '--disable-dev-shm-usage', '--js-flags=--expose-gc']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  if (blockPatterns) {
    await page.setRequestInterception(true);
    page.on('request', req => {
      const url = req.url();
      if (blockPatterns.some(p => url.includes(p))) req.abort();
      else req.continue();
    });
  }
  await page.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
  const heap = await page.evaluate(() => {
    if (window.gc) { for (let i = 0; i < 3; i++) window.gc(); }
    return performance.memory ? { used: performance.memory.usedJSHeapSize } : { used: -1 };
  });
  const dom = await page.evaluate(attribution);

  // 页面 renderer 进程：取 CPU 时间最高的 renderer（页面活动进程）
  let rendererPid = -1;
  try {
    const session = await browser.target().createCDPSession();
    const info = await session.send('SystemInfo.getProcessInfo');
    const renders = info.processInfo.filter(p => p.type === 'renderer');
    if (renders.length) rendererPid = renders.reduce((a, b) => a.cpuTime > b.cpuTime ? a : b).id;
    await session.detach();
  } catch (e) { }

  const pid = browser.process().pid;
  const tree = procTreeMB(pid);
  const rendererWS = rendererPid > 0 ? singleProcWS(rendererPid) : -1;
  await browser.close();
  await new Promise(r => setTimeout(r, 300));
  return { name, jsUsed: heap.used, ws: tree.ws, rendererWS, dom };
}

(async () => {
  console.log('\n=== 内存诊断 v4（1920x1080 headless，请求拦截控制变量，独立进程/场景）===');
  console.log('场景'.padEnd(30), 'JS堆'.padStart(9), 'rendererWS'.padStart(12), '进程树WS'.padStart(11));

  const cases = [
    ['about 基线', '/about.html', null],
    ['careers 原版(粒子)', '/careers.html', null],
    ['careers 去粒子(拦JS)', '/careers.html', ['page-particles.js']],
    ['index 原版(全部)', '/index.html', null],
    ['index 去lightfall', '/index.html', ['lightfall.js']],
    ['index 去视频(拦mp4)', '/index.html', ['.mp4']],
    ['index 去lf+视频', '/index.html', ['lightfall.js', '.mp4']],
    ['index 去lf+视频+sw', '/index.html', ['lightfall.js', '.mp4', 'sw-register.js', 'sw.js']],
  ];

  const results = [];
  for (const [name, path, blocks] of cases) {
    const r = await runCase(name, path, blocks);
    results.push(r);
    console.log(name.padEnd(30),
      String(MB(r.jsUsed)).padStart(9),
      String(MB(r.rendererWS)).padStart(12),
      String(MB(r.ws)).padStart(11));
  }

  console.log('\n=== DOM 级归因 ===');
  const fmt = (r) => {
    const d = r.dom;
    return `canvas=${d.canvases}(位图${MB(d.canvasBitmaps)}) lf-wrap=${d.lfWraps} video=${d.videoEls}(${d.videoReady}就绪) willChange=${d.willChangeEls} transform=${d.transformEls} DOM=${d.domNodes} scripts=${d.scriptTags}` +
      (d.particleCanvas ? ` | 粒子画布=${d.particleCanvas.w}x${d.particleCanvas.h}` : '');
  };
  for (const r of results) console.log(r.name.padEnd(30), fmt(r));

  const base = results.find(r => r.name === 'about 基线');
  console.log('\n=== 相对 about 基线增量 ===');
  for (const r of results) {
    console.log(`${r.name.padEnd(30)} rendererWS Δ=${MB(r.rendererWS - base.rendererWS).padStart(11)}  进程树WS Δ=${MB(r.ws - base.ws).padStart(11)}`);
  }
})().catch(e => { console.error('ERR', e.message); process.exit(1); });

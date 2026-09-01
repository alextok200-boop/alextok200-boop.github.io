/* verify_lightfall_trajectory.js — v1.6.15 流星轨迹验证
   验证目标：
   1. .lf-wrap（外层）动画 transform 必须是纯位移（无 rotate/scale 分量）
   2. .lf（内层）transform 是静态 rotate+scale（星形自身朝向）
   3. 所有星星的位移方向一致（全局方向，不被各自角度扭曲）
   4. 位移量不被 scale 放大（等时长内不同 scale 的星位移一致） */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8000';

function parseMatrix(m) {
  // m 形如 matrix(a,b,c,d,e,f)
  const p = m.replace(/^matrix\(/, '').replace(/\)$/, '').split(',').map(Number);
  return { a: p[0], b: p[1], c: p[2], d: p[3], e: p[4], f: p[5] };
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--force-device-scale-factor=1'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));

  const result = await page.evaluate(() => {
    function parseMatrix(m) {
      const p = m.replace(/^matrix\(/, '').replace(/\)$/, '').split(',').map(Number);
      return { a: p[0], b: p[1], c: p[2], d: p[3], e: p[4], f: p[5] };
    }
    const wraps = Array.from(document.querySelectorAll('#lightfall .lf-wrap'));
    const stars = wraps.filter(w => !w.classList.contains('lf-coin-wrap'));
    const coins = wraps.filter(w => w.classList.contains('lf-coin-wrap'));
    const out = { starCount: stars.length, coinCount: coins.length, stars: [], coins: [], errors: [] };

    // 采样两帧（间隔 500ms），比较 wrap 位移方向
    function snapshot() {
      const arr = [];
      for (const w of wraps) {
        const wm = getComputedStyle(w).transform;
        const im = getComputedStyle(w.firstElementChild).transform;
        // none = 动画 delay 中（fill 未生效），标记 pending，不算错误
        arr.push({ wrap: wm === 'none' ? null : parseMatrix(wm), inner: parseMatrix(im) });
      }
      return arr;
    }
    const s1 = snapshot();
    return new Promise(r => setTimeout(() => {
      const s2 = snapshot();
      let pendingCount = 0, movingCount = 0;
      for (let i = 0; i < wraps.length; i++) {
        const w = wraps[i];
        const isCoin = w.classList.contains('lf-coin-wrap');
        if (!s1[i].wrap || !s2[i].wrap) { pendingCount++; continue; }
        movingCount++;
        const dx = s2[i].wrap.e - s1[i].wrap.e;
        const dy = s2[i].wrap.f - s1[i].wrap.f;
        const item = {
          isCoin,
          // wrap 矩阵：a/b/c/d 应为 [1,0,0,1]（纯位移），e/f 为位移量
          wrapAB: Math.abs(s2[i].wrap.a - 1) < 0.001 && Math.abs(s2[i].wrap.b) < 0.001 &&
                  Math.abs(s2[i].wrap.c) < 0.001 && Math.abs(s2[i].wrap.d - 1) < 0.001,
          // inner 矩阵含旋转缩放（非单位阵）
          innerHasRotateScale: Math.abs(s2[i].inner.a - 1) > 0.01 || Math.abs(s2[i].inner.b) > 0.01 ||
                                Math.abs(s2[i].inner.c) > 0.01 || Math.abs(s2[i].inner.d - 1) > 0.01,
          innerTransform: s2[i].inner.a.toFixed(2) + ',' + s2[i].inner.b.toFixed(2) + ',' +
                          s2[i].inner.c.toFixed(2) + ',' + s2[i].inner.d.toFixed(2),
          dx: Math.round(dx), dy: Math.round(dy),
        };
        (isCoin ? out.coins : out.stars).push(item);
      }
      out.pendingCount = pendingCount;
      out.movingCount = movingCount;
      // 位移方向一致性：atan2(dy,dx) 的角度（度），计算标准差
      function angleStd(arr) {
        const angs = arr.filter(x => Math.abs(x.dx) + Math.abs(x.dy) > 0.5)
                        .map(x => Math.atan2(x.dy, x.dx) * 180 / Math.PI);
        if (!angs.length) return -1;
        const mean = angs.reduce((a, b) => a + b, 0) / angs.length;
        const varr = angs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / angs.length;
        return { mean: mean.toFixed(1), std: Math.sqrt(varr).toFixed(1), n: angs.length };
      }
      out.starAngle = angleStd(out.stars);
      out.coinAngle = angleStd(out.coins);
      // 位移量与 scale 无关性：同一时刻不同 scale 的星，位移量应相同（500ms 采样）
      // 用 fast 档（dur 7-12s，500ms 内位移显著）的星比较；星初始 top/left 不同，
      // 但 500ms 位移由速度决定，速度=路径/时长，路径固定 → 位移应一致
      const movers = out.stars.filter(x => Math.abs(x.dx) + Math.abs(x.dy) > 1);
      if (movers.length >= 2) {
        const mags = movers.slice(0, 6).map(x => Math.round(Math.hypot(x.dx, x.dy)));
        out.moveSample = { n: movers.length, magnitudes: mags };
      }
      r(out);
    }, 500));
  });

  console.log('=== 数量 ===');
  console.log('星星:', result.starCount, '金币:', result.coinCount);
  console.log('=== wrap 位移矩阵（delay 中的星 transform=none 属正常）===');
  const badWrap = [...result.stars, ...result.coins].filter(x => !x.wrapAB);
  console.log('动画运行中 wrap:', result.movingCount, '| delay 中:', result.pendingCount);
  console.log(badWrap.length === 0 ? 'ALL PURE TRANSLATE ✓' : 'FAIL: ' + badWrap.length + ' 个 wrap 含旋转/缩放分量');
  console.log('=== inner 静态变换（应含 rotate/scale）===');
  const noInner = [...result.stars, ...result.coins].filter(x => !x.innerHasRotateScale);
  console.log(noInner.length === 0 ? 'ALL STATIC ROTATE/SCALE ✓' : 'WARN: ' + noInner.length + ' 个 inner 无旋转缩放（可能是静止帧）');
  console.log('=== 位移方向一致性（全局方向，std 应小）===');
  console.log('星星角度:', JSON.stringify(result.starAngle), '(100°± → 向左下斜落，与 v1.6.10 一致)');
  console.log('金币角度:', JSON.stringify(result.coinAngle));
  console.log('=== 同速档位移量（应相近，不受 scale 影响）===');
  if (result.moveSample) {
    console.log('样本数:', result.moveSample.n, '| 位移量:', JSON.stringify(result.moveSample.magnitudes));
  }

  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

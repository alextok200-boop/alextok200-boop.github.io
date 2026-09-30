/* verify_work_v1819.js — v1.8.19 作品集三联轮播验证
   1. 轮播结构：carousel > viewport > track；track 14 卡 = 7 真 + 7 克隆
      （克隆 .is-clone + aria-hidden，原 .card-grid.work-grid 移除）
   2. 静态色类正确：pc-a/pc-c/pc-b/side-r 按卡分布，克隆复制
   3. 视觉一致性：序号芯片三色 distinct，克隆[0] 与真卡[0] 同色
   4. 侧缘方向：真卡1 条在左、真卡2 条在右（side-r）
   5. 控件：prev/next 按钮 + 7 dots；zh aria-label「上一组/下一组」
   6. next 点击位移、dot 高亮跟随；prev 在 index0 无感回绕
   7. 自动步进 5.44s 前进；hover 暂停
   8. prefers-reduced-motion：不自动步进、点击瞬时跳转
   9. 三档 perView：1440→3 / 900→2 / 390→1；移动端无横向溢出
  10. EN 模式按钮 aria-label 切换（i18n.apply）
  11. 控制台零错误 + 三主题整页截图 */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8940';
const OUT = __dirname;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--hide-scrollbars', '--disable-extensions', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
  const fails = [];
  const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fails.push(name); };
  const revealAll = () => page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('visible'); el.classList.remove('reveal'); });
    const st = document.createElement('style');
    st.textContent = '.site-header{position:static!important}';
    document.head.appendChild(st);
  });

  // ---- 结构与静态类 ----
  await page.goto(BASE + '/work.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  const s = await page.evaluate(() => {
    const track = document.querySelector('.work-page .carousel-track');
    const all = track ? [...track.querySelectorAll('.card.loop-card')] : [];
    const clones = all.filter(c => c.classList.contains('is-clone'));
    const reals = all.filter(c => !c.classList.contains('is-clone'));
    const chipBg = el => getComputedStyle(el.querySelector('.loop-no')).backgroundColor;
    const barSides = el => {
      const b = getComputedStyle(el, '::before');
      return { left: parseFloat(b.left), right: parseFloat(b.right) };
    };
    return {
      hasViewport: !!document.querySelector('.work-page .carousel-viewport'),
      gridGone: !document.querySelector('.card-grid.work-grid'),
      scriptV: [...document.querySelectorAll('script[src*="work-carousel"]')].map(x => x.getAttribute('src'))[0] || '',
      glassV: [...document.querySelectorAll('link[href*="glass.css"]')].map(x => x.getAttribute('href'))[0] || '',
      total: all.length, nClone: clones.length, nReal: reals.length,
      cloneHidden: clones.every(c => c.getAttribute('aria-hidden') === 'true'),
      realCls: reals.map(c => [...c.classList].filter(x => x.startsWith('pc-') || x === 'side-r').sort().join(',')),
      cloneCls: clones.map(c => [...c.classList].filter(x => x.startsWith('pc-') || x === 'side-r').sort().join(',')),
      chip: [chipBg(reals[0]), chipBg(reals[1]), chipBg(reals[2])],
      chipCloneEq: chipBg(reals[0]) === chipBg(clones[0]),
      chipDistinct: new Set([chipBg(reals[0]), chipBg(reals[1]), chipBg(reals[2])]).size === 3,
      bar1: barSides(reals[0]), bar2: barSides(reals[1]),
      nav: !!document.querySelector('.work-page .carousel-nav'),
      btns: document.querySelectorAll('.work-page .carousel-btn').length,
      dots: document.querySelectorAll('.work-page .carousel-dot').length,
      ariaPrev: document.querySelector('.carousel-btn-prev')?.getAttribute('aria-label') || '',
      ariaNext: document.querySelector('.carousel-btn-next')?.getAttribute('aria-label') || '',
      trackTransition: getComputedStyle(track).transitionProperty
    };
  });
  ok(s.hasViewport && s.gridGone, 'carousel/viewport 建立，原网格移除');
  ok(s.scriptV.includes('1.8.19') && s.glassV.includes('1.8.19'), '脚本/样式 v=1.8.19 (' + s.scriptV + ')');
  ok(s.total === 14 && s.nReal === 7 && s.nClone === 7, 'track 14 卡 = 7 真 + 7 克隆 (实际 ' + s.nReal + '+' + s.nClone + ')');
  ok(s.cloneHidden, '克隆卡全部 aria-hidden');
  const wantCls = ['pc-a', 'pc-c,side-r', 'pc-b', 'pc-a,side-r', 'pc-c', 'pc-b,side-r', 'pc-a'];
  ok(JSON.stringify(s.realCls) === JSON.stringify(wantCls), '真卡色类分布 (实际 ' + s.realCls.join(' | ') + ')');
  ok(JSON.stringify(s.cloneCls) === JSON.stringify(wantCls), '克隆色类复制一致');
  ok(s.chipDistinct && s.chipCloneEq, '芯片三色 distinct 且克隆[0]同色 (' + s.chip.join(' / ') + ')');
  ok(s.bar1.left < s.bar1.right && s.bar2.right < s.bar2.left, '侧缘：卡1 左 / 卡2 右 (side-r)');
  ok(s.nav && s.btns === 2 && s.dots === 7, 'nav 2 按钮 + 7 dots');
  ok(s.ariaPrev === '上一组' && s.ariaNext === '下一组', 'zh aria-label 上一组/下一组 (' + s.ariaPrev + '/' + s.ariaNext + ')');

  // ---- next 位移 + dot 高亮 ----
  const t0 = await page.evaluate(() => getComputedStyle(document.querySelector('.carousel-track')).transform);
  await page.click('.carousel-btn-next');
  await page.evaluate(() => new Promise(r => setTimeout(r, 900)));
  const afterNext = await page.evaluate(() => {
    const tr = getComputedStyle(document.querySelector('.carousel-track')).transform;
    const m = tr.match(/matrix\(([^)]+)\)/);
    const x = m ? parseFloat(m[1].split(',')[4]) : NaN;
    const on = [...document.querySelectorAll('.carousel-dot')].findIndex(d => d.classList.contains('on'));
    const gap = parseFloat(getComputedStyle(document.querySelector('.carousel-track')).columnGap);
    const w = document.querySelectorAll('.carousel-track > .card.loop-card:not(.is-clone)')[0].getBoundingClientRect().width;
    return { x, on, step: w + gap };
  });
  ok(Math.abs(afterNext.x + afterNext.step) < 2, 'next 位移 = 卡宽+gap (x=' + afterNext.x.toFixed(1) + ', step=' + afterNext.step.toFixed(1) + ')');
  ok(afterNext.on === 1, 'dot 高亮跟随到第 2 点 (实际 ' + afterNext.on + ')');

  // ---- prev 在 index1 → 回到 0；再 prev → 无感回绕到 7 ----
  await page.click('.carousel-btn-prev');
  await page.evaluate(() => new Promise(r => setTimeout(r, 900)));
  const back0 = await page.evaluate(() => [...document.querySelectorAll('.carousel-dot')].findIndex(d => d.classList.contains('on')));
  ok(back0 === 0, 'prev 回到 dot0');
  await page.click('.carousel-btn-prev');
  await page.evaluate(() => new Promise(r => setTimeout(r, 900)));
  const wrap = await page.evaluate(() => {
    const on = [...document.querySelectorAll('.carousel-dot')].findIndex(d => d.classList.contains('on'));
    const tr = getComputedStyle(document.querySelector('.carousel-track')).transform;
    return { on, tr };
  });
  ok(wrap.on === 6, 'prev 从 0 无感回绕到 dot7→6 (实际 ' + wrap.on + ')');

  // ---- 自动步进 5.44s ----
  const auto = await page.evaluate(async () => {
    const on0 = [...document.querySelectorAll('.carousel-dot')].findIndex(d => d.classList.contains('on'));
    await new Promise(r => setTimeout(r, 6200));
    const on1 = [...document.querySelectorAll('.carousel-dot')].findIndex(d => d.classList.contains('on'));
    return { on0, on1 };
  });
  ok(auto.on1 === (auto.on0 + 1) % 7, '自动步进 5.44s 前进一格 (' + auto.on0 + '→' + auto.on1 + ')');

  // ---- hover 暂停 ----
  const hover = await page.evaluate(async () => {
    const c = document.querySelector('.work-page .carousel');
    c.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    const on0 = [...document.querySelectorAll('.carousel-dot')].findIndex(d => d.classList.contains('on'));
    await new Promise(r => setTimeout(r, 6200));
    const on1 = [...document.querySelectorAll('.carousel-dot')].findIndex(d => d.classList.contains('on'));
    c.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    return on0 === on1;
  });
  ok(hover, 'hover 暂停自动步进');

  // ---- EN 模式 aria-label ----
  await page.evaluate(() => localStorage.setItem('site_lang', 'en'));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  const en = await page.evaluate(() => ({
    p: document.querySelector('.carousel-btn-prev')?.getAttribute('aria-label') || '',
    n: document.querySelector('.carousel-btn-next')?.getAttribute('aria-label') || ''
  }));
  ok(en.p === 'Previous' && en.n === 'Next', 'EN aria-label Previous/Next (' + en.p + '/' + en.n + ')');

  // ---- reduced-motion：不自动步进、点击瞬时 ----
  const rp = await browser.newPage();
  await rp.setViewport({ width: 1440, height: 900 });
  await rp.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await rp.goto(BASE + '/work.html', { waitUntil: 'networkidle0' });
  await rp.evaluate(() => new Promise(r => setTimeout(r, 600)));
  const rm = await rp.evaluate(async () => {
    await new Promise(r => setTimeout(r, 6200));
    const onAuto = [...document.querySelectorAll('.carousel-dot')].findIndex(d => d.classList.contains('on'));
    document.querySelector('.carousel-btn-next').click();
    await new Promise(r => setTimeout(r, 120));
    const onAfter = [...document.querySelectorAll('.carousel-dot')].findIndex(d => d.classList.contains('on'));
    const trProp = getComputedStyle(document.querySelector('.carousel-track')).transitionProperty;
    return { onAuto, onAfter, trProp };
  });
  ok(rm.onAuto === 0, 'reduced-motion 不自动步进');
  ok(rm.onAfter === 1, 'reduced-motion 点击瞬时到 dot1 (实际 ' + rm.onAfter + ')');
  await rp.close();

  // ---- 三档 perView + 移动端溢出 ----
  await page.setViewport({ width: 900, height: 800 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
  const pv2 = await page.evaluate(() => {
    const tr = document.querySelector('.carousel-track');
    const w = tr.querySelector('.card.loop-card:not(.is-clone)').getBoundingClientRect().width;
    return { w, tw: tr.getBoundingClientRect().width };
  });
  ok(Math.abs(pv2.w - (pv2.tw - 24) / 2) < 2, '900px 每视图 2 张 (卡宽 ' + pv2.w.toFixed(1) + ')');

  await page.setViewport({ width: 390, height: 780 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
  const pv1 = await page.evaluate(() => {
    const tr = document.querySelector('.carousel-track');
    const w = tr.querySelector('.card.loop-card:not(.is-clone)').getBoundingClientRect().width;
    return { w, tw: tr.getBoundingClientRect().width, scrollW: document.scrollingElement.scrollWidth };
  });
  ok(Math.abs(pv1.w - pv1.tw) < 2, '390px 每视图 1 张 (卡宽 ' + pv1.w.toFixed(1) + ')');
  ok(pv1.scrollW <= 391, '移动端无横向溢出 (scrollW=' + pv1.scrollW + ')');

  // ---- 截图：dark zh / light / mobile ----
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluate(() => { localStorage.setItem('site_lang', 'zh'); localStorage.setItem('site_theme', 'dark'); });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await revealAll();
  await page.screenshot({ path: OUT + '/shot_work_v1819_dark.png', fullPage: true });

  await page.evaluate(() => localStorage.setItem('site_theme', 'light'));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await revealAll();
  await page.screenshot({ path: OUT + '/shot_work_v1819_light.png', fullPage: true });
  await page.evaluate(() => localStorage.setItem('site_theme', 'dark'));

  await page.setViewport({ width: 390, height: 780 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await revealAll();
  await page.screenshot({ path: OUT + '/shot_work_v1819_mobile.png', fullPage: true });

  ok(errors.length === 0, '控制台零错误 (' + errors.length + ')');
  if (errors.length) console.log(errors.slice(0, 5).join('\n'));

  console.log(fails.length === 0 ? '\nRESULT: ALL PASS ✅' : '\nRESULT: ' + fails.length + ' FAIL ❌');
  await browser.close();
  process.exit(fails.length === 0 ? 0 : 1);
})();

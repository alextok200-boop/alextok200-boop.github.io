/* verify_work_v1812.js — v1.8.12 作品集七闭环改版验证
   1. work.html 控制台零错误
   2. 统计条 7/71/95
   3. 7 张闭环卡：序号 01-07、badge 8/14/17/10/9/5/8、title/chain/desc/out 非空
   4. zh 标题抽查 + EN 模式(site_lang=en)标题切换
   5. meta/og description 含「7 条端到端」
   6. chain 无横向溢出
   7. 版本 v=1.8.12
   8. 出图 dark / light / en 三张整页（强制 .reveal 显现 + 隐藏吸顶栏） */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8899';
const OUT = __dirname;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--hide-scrollbars', '--disable-extensions', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
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
  const scrollThrough = async () => {
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  };

  // ---- zh 模式断言 ----
  await page.goto(BASE + '/work.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));
  const d = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.loop-card')];
    return {
      v: (document.querySelector('link[rel="stylesheet"]')?.getAttribute('href') || ''),
      metaDesc: document.querySelector('meta[name="description"]')?.content || '',
      ogDesc: document.querySelector('meta[property="og:description"]')?.content || '',
      stats: [...document.querySelectorAll('.work-stats .stat-num')].map(e => e.textContent.trim()),
      n: cards.length,
      cards: cards.map(c => ({
        no: c.querySelector('.loop-no')?.textContent.trim() || '',
        title: c.querySelector('.loop-head h3')?.textContent.trim() || '',
        chain: c.querySelector('.loop-chain')?.textContent.trim() || '',
        desc: c.querySelector('.loop-desc')?.textContent.trim() || '',
        out: c.querySelector('.loop-out')?.textContent.trim() || '',
        badge: c.querySelector('.loop-badge-num')?.textContent.trim() || ''
      }))
    };
  });
  ok(d.v.includes('1.8.12'), '版本 v=1.8.12 (' + d.v + ')');
  ok(d.metaDesc.includes('7 条端到端'), 'meta description 含「7 条端到端」');
  ok(d.ogDesc.includes('7 条端到端'), 'og:description 含「7 条端到端」');
  ok(JSON.stringify(d.stats) === JSON.stringify(['7', '71', '95']), '统计条 7/71/95 (实际 ' + d.stats.join('/') + ')');
  ok(d.n === 7, '闭环卡数量 = 7 (实际 ' + d.n + ')');
  ok(JSON.stringify(d.cards.map(c => c.no)) === JSON.stringify(['01', '02', '03', '04', '05', '06', '07']), '序号 01-07');
  const badges = d.cards.map(c => c.badge);
  ok(JSON.stringify(badges) === JSON.stringify(['8', '14', '17', '10', '9', '5', '8']), 'badge 8/14/17/10/9/5/8 (实际 ' + badges.join('/') + ')');
  const empty = d.cards.filter(c => !c.chain || !c.desc || !c.out || !c.title);
  ok(empty.length === 0, '所有卡 title/chain/desc/out 非空');
  const titles = d.cards.map(c => c.title);
  ok(titles[0] === '投流投放闭环' && titles[1] === '跨境销售数据看板闭环' && titles[6] === '技能工程自研闭环', 'zh 标题抽查 (' + titles.join(' | ') + ')');
  const overflow = await page.evaluate(() => [...document.querySelectorAll('.loop-chain')].filter(el => el.scrollWidth > el.clientWidth + 2).length);
  ok(overflow === 0, 'chain 无横向溢出 (溢出 ' + overflow + ' 处)');

  // ---- EN 模式 ----
  await page.evaluate(() => localStorage.setItem('site_lang', 'en'));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));
  const en = await page.evaluate(() => [...document.querySelectorAll('.loop-head h3')].map(e => e.textContent.trim()));
  ok(en[0] === 'Ad Delivery Loop' && en[6] === 'Skill Engineering Loop', 'EN 标题切换 (' + en[0] + ' / ' + en[6] + ')');

  // ---- 截图：EN ----
  await revealAll(); await scrollThrough();
  await page.screenshot({ path: OUT + '/shot_work_v1812_en.png', fullPage: true });

  // ---- 截图：light zh ----
  await page.evaluate(() => { localStorage.setItem('site_lang', 'zh'); localStorage.setItem('site_theme', 'light'); });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));
  await revealAll(); await scrollThrough();
  await page.screenshot({ path: OUT + '/shot_work_v1812_light.png', fullPage: true });

  // ---- 截图：dark zh ----
  await page.evaluate(() => localStorage.setItem('site_theme', 'dark'));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));
  await revealAll(); await scrollThrough();
  await page.screenshot({ path: OUT + '/shot_work_v1812_dark.png', fullPage: true });

  ok(errors.length === 0, '控制台零错误 (' + errors.length + ')');
  if (errors.length) console.log(errors.slice(0, 5).join('\n'));

  console.log(fails.length === 0 ? '\nRESULT: ALL PASS ✅' : '\nRESULT: ' + fails.length + ' FAIL ❌');
  await browser.close();
  process.exit(fails.length === 0 ? 0 : 1);
})();

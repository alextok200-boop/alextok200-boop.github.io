/* verify_admin_v182.js —— 验证 v1.8.2 认证简化与后台改造 */
const path = require('path');
const NODE_MODULES = 'C:/Users/alext/.workbuddy/binaries/node/workspace/node_modules';
const puppeteer = require(path.join(NODE_MODULES, 'puppeteer'));

const BASE = 'http://127.0.0.1:8099';
let fail = 0;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--mute-audio']
  });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  // ---- 1. 登录页：无角色下拉，有密码框 ----
  console.log('== 1. 登录页结构 ==');
  await page.goto(BASE + '/pages/login.html', { waitUntil: 'networkidle0' });
  const hasRoleSelect = await page.$('#roleSelect');
  console.log(hasRoleSelect ? '  ✗ 仍存在角色下拉 #roleSelect' : '  ✓ 角色下拉已移除');
  if (hasRoleSelect) fail++;
  const hasPwd = await page.$('#passwordInput');
  console.log(hasPwd ? '  ✓ 密码输入框存在' : '  ✗ 缺密码输入框');
  if (!hasPwd) fail++;
  const title = await page.$eval('.login-header h1', el => el.textContent.trim());
  console.log('  登录标题:', title);

  // ---- 2. 错误密码 ----
  console.log('== 2. 错误密码应被拒 ==');
  await page.type('#passwordInput', 'wrongpass');
  await page.click('.login-btn');
  await new Promise(r => setTimeout(r, 800));
  const errText = await page.$eval('#errorMsg', el => el.textContent.trim());
  const stillOnLogin = page.url().includes('login.html');
  console.log('  错误提示:', JSON.stringify(errText), '| 仍在登录页:', stillOnLogin);
  if (!stillOnLogin) { console.log('  ✗ 错误密码却跳转了'); fail++; }
  else console.log('  ✓ 错误密码未放行');

  // ---- 3. 正确密码 -> 跳 admin.html ----
  console.log('== 3. 正确密码应进入内容管理 ==');
  await page.evaluate(() => { document.getElementById('passwordInput').value = ''; });
  await page.type('#passwordInput', 'admin2026');
  await page.click('.login-btn');
  await new Promise(r => setTimeout(r, 1500));
  console.log('  当前 URL:', page.url());
  if (page.url().includes('admin.html')) console.log('  ✓ 已跳转 admin.html');
  else { console.log('  ✗ 未跳转到 admin.html'); fail++; }

  // ---- 4. 后台内容 ----
  console.log('== 4. 后台内容管理页 ==');
  await page.waitForSelector('.admin-grid', { timeout: 5000 }).catch(() => {});
  const cards = await page.$$eval('.admin-card h3', els => els.map(e => e.textContent.trim()));
  console.log('  卡片数:', cards.length);
  cards.forEach(c => console.log('    -', c.replace(/\s+/g, ' ')));
  if (cards.length < 5) { console.log('  ✗ 卡片数不足 5'); fail++; }
  const hasTeamLink = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).some(a => a.getAttribute('href') && a.getAttribute('href').includes('team/')));
  console.log(hasTeamLink ? '  ✗ 仍存在 team/ 链接' : '  ✓ 无 team/ 残留链接');
  if (hasTeamLink) fail++;
  const logoutBtn = await page.$('.btn-ghost');
  console.log(logoutBtn ? '  ✓ 退出登录按钮存在' : '  ✗ 缺退出登录按钮');
  if (!logoutBtn) fail++;

  // ---- 5. 退出后回首页 ----
  console.log('== 5. 退出登录 ==');
  await page.click('.btn-ghost');
  await new Promise(r => setTimeout(r, 1200));
  console.log('  退出后 URL:', page.url());
  const sess = await page.evaluate(() => sessionStorage.getItem('auth_session'));
  console.log('  session 已清:', sess === null ? '✓' : '✗ ' + sess);
  if (sess !== null) fail++;

  // ---- 6. 未登录直访 admin 应被弹回 ----
  console.log('== 6. 未登录直访后台应被拦截 ==');
  await page.goto(BASE + '/pages/admin.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  console.log('  当前 URL:', page.url());
  if (page.url().includes('login.html')) console.log('  ✓ 已拦截回登录页');
  else { console.log('  ✗ 未拦截'); fail++; }

  // ---- 7. 首页登录按钮文案 ----
  console.log('== 7. 首页登录按钮 ==');
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle0' });
  const btnTitle = await page.$eval('.nav-login', el => el.getAttribute('title'));
  console.log('  title =', JSON.stringify(btnTitle));
  if (btnTitle === '站长登录') console.log('  ✓ 文案已更新');
  else { console.log('  ✗ 文案未更新（期望「站长登录」）'); fail++; }

  console.log('\n== 运行时错误 ==');
  if (errs.length) { errs.forEach(e => console.log('  ✗', e)); fail += errs.length; }
  else console.log('  ✓ 无');

  await browser.close();
  console.log('\n' + (fail ? `FAIL: ${fail} 个问题` : 'ALL PASS ✓'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('崩溃:', e); process.exit(1); });

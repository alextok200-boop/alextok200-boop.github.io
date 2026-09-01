/* debug_proc.js — 调试 SystemInfo.getProcessInfo / performance.memory 的真实返回值 */
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--hide-scrollbars', '--disable-extensions']
  });
  console.log('browser.process().pid =', browser.process() ? browser.process().pid : null);

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1) performance.memory 原始值
  const mem = await page.evaluate(() => {
    const m = performance.memory;
    return m ? { used: m.usedJSHeapSize, total: m.totalJSHeapSize, limit: m.jsHeapSizeLimit } : null;
  });
  console.log('performance.memory =', JSON.stringify(mem));

  // 2) SystemInfo.getProcessInfo 原始返回
  const cdp = await page.createCDPSession();
  const info = await cdp.send('SystemInfo.getProcessInfo');
  console.log('getProcessInfo 返回进程数 =', info.processInfo.length);
  for (const p of info.processInfo.slice(0, 12)) {
    console.log(`  type=${p.type} id=${p.id} private=${(p.privateFootprintKb/1024).toFixed(1)}MB shared=${(p.sharedFootprintKb/1024).toFixed(1)}MB`);
  }
  await cdp.detach();

  // 3) 用 Node 侧查浏览器进程树真实内存（Windows: wmic / powershell）
  const { execSync } = require('child_process');
  const pid = browser.process().pid;
  try {
    const ps = execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"ParentProcessId=${pid} OR ProcessId=${pid}\\" | Select-Object ProcessId,Name,WorkingSetSize | ConvertTo-Json -Compress"`, { encoding: 'utf8', maxBuffer: 1e7 });
    const list = JSON.parse(ps);
    const arr = Array.isArray(list) ? list : [list];
    let sum = 0;
    for (const p of arr) {
      const ws = p.WorkingSetSize;
      sum += ws;
      console.log(`  [win] ${p.Name} pid=${p.ProcessId} WS=${(ws/1048576).toFixed(1)}MB`);
    }
    console.log(`  [win] 进程树 WorkingSet Σ = ${(sum/1048576).toFixed(1)}MB`);
  } catch (e) {
    console.log('wmic 查询失败:', e.message.slice(0, 120));
  }

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });

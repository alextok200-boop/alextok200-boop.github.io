/* ============================================================
   shot_theme.js —— v1.6.21 明暗主题切换视觉验证
   起 http server 后执行：node shot_theme.js
   输出 tools/theme-dark.png / tools/theme-light.png（首页全页）
   并在控制台断言：data-theme 切换 / 图标显隐 / body 背景色变化
   ============================================================ */
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.SITE_BASE || "http://127.0.0.1:8123";
const OUT = path.join(__dirname, "theme-dark.png");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

  const results = [];

  // ---- 场景 1：默认暗色（无 localStorage，模拟系统深色偏好）----
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
  await page.goto(BASE + "/index.html", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200)); // 等动画稳定
  const dark = await page.evaluate(() => {
    const th = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    return {
      theme: document.documentElement.getAttribute("data-theme"),
      bgVar: th,
      sunVisible: !!document.querySelector(".icon-sun") && getComputedStyle(document.querySelector(".icon-sun")).display !== "none",
      moonVisible: !!document.querySelector(".icon-moon") && getComputedStyle(document.querySelector(".icon-moon")).display !== "none"
    };
  });
  results.push(["默认 = 暗色", dark.theme === "dark" && dark.bgVar === "#090711"]);
  results.push(["暗色下显月亮图标", dark.moonVisible === true && dark.sunVisible === false]);
  await page.screenshot({ path: OUT, fullPage: true });
  console.log("  ✓ 暗色截图 theme-dark.png（bg=" + dark.bgVar + "）");

  // ---- 场景 2：点击切换 → 亮色 ----
  await page.click(".theme-toggle");
  await new Promise(r => setTimeout(r, 400));
  const light = await page.evaluate(() => {
    const th = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    return {
      theme: document.documentElement.getAttribute("data-theme"),
      bgVar: th,
      stored: localStorage.getItem("site_theme"),
      sunVisible: !!document.querySelector(".icon-sun") && getComputedStyle(document.querySelector(".icon-sun")).display !== "none",
      moonVisible: !!document.querySelector(".icon-moon") && getComputedStyle(document.querySelector(".icon-moon")).display !== "none",
      headerBg: getComputedStyle(document.querySelector(".site-header")).backgroundColor
    };
  });
  results.push(["点击后 = 亮色", light.theme === "light" && light.bgVar === "#f4f2fb"]);
  results.push(["亮色下显太阳图标", light.sunVisible === true && light.moonVisible === false]);
  results.push(["localStorage 已记录", light.stored === "light"]);
  results.push(["header 背景已变浅", light.headerBg.indexOf("244") !== -1 || light.headerBg.indexOf("242") !== -1]);
  await page.screenshot({ path: path.join(__dirname, "theme-light.png"), fullPage: true });
  console.log("  ✓ 亮色截图 theme-light.png（bg=" + light.bgVar + "，header=" + light.headerBg + "）");

  // ---- 场景 3：刷新后保持（localStorage 持久化）----
  await page.reload({ waitUntil: "networkidle2", timeout: 30000 });
  const reloaded = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute("data-theme"),
    stored: localStorage.getItem("site_theme")
  }));
  results.push(["刷新后保持亮色", reloaded.theme === "light" && reloaded.stored === "light"]);

  // ---- 场景 4：跟随系统（清空 localStorage 后模拟 prefers-color-scheme）----
  await page.evaluate(() => localStorage.removeItem("site_theme"));
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
  await page.reload({ waitUntil: "networkidle2", timeout: 30000 });
  const sys = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  results.push(["系统浅色偏好 → 自动亮色", sys === "light"]);
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
  await page.reload({ waitUntil: "networkidle2", timeout: 30000 });
  const sysD = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  results.push(["系统深色偏好 → 自动暗色", sysD === "dark"]);

  await browser.close();

  let fail = 0;
  results.forEach(([label, ok]) => {
    console.log((ok ? "  ✓" : "  ✗"), label);
    if (!ok) fail++;
  });
  console.log(fail ? "FAIL: " + fail : "ALL PASS");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("ERR", e); process.exit(1); });

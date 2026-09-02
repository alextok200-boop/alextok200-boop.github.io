/* ============================================================
   theme.js v1.0.0 —— 明暗主题切换（配置零依赖）
   规则：
   1. 优先读 localStorage "site_theme"（用户显式选择）
   2. 无记录时跟随系统 prefers-color-scheme（首次访问自动适配）
   3. 点击 .theme-toggle 按钮切换并持久化
   HTML 侧需在 <head> 顶部放内联防闪脚本（theme-init）先置 data-theme，
   本文件负责按钮交互与持久化；两者配合无闪烁。
   ============================================================ */
(function () {
  var KEY = "site_theme";
  var btn = document.querySelector(".theme-toggle");
  if (!btn) return;

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function current() {
    return document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  }

  btn.addEventListener("click", function () {
    var next = current() === "light" ? "dark" : "light";
    try {
      localStorage.setItem(KEY, next);
    } catch (e) { /* 隐私模式忽略 */ }
    apply(next);
  });
})();
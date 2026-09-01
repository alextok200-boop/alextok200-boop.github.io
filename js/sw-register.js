/* ============================================================
   sw-register.js v1.0.0 —— 注册 Service Worker + 离线提示
   站点部署在根路径，SW 用绝对路径 /sw.js 注册，文章页同样生效。
   ============================================================ */
(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(function (err) {
          // 本地 file:// 打开会失败，属正常现象，不打扰用户
          if (window.console && location.protocol !== "file:") {
            console.warn("SW 注册失败：", err);
          }
        });
    });
  }

  // 离线提示条
  var bar = null;
  function tip(text) {
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "offline-bar";
      document.body.appendChild(bar);
    }
    bar.textContent = text;
    bar.style.display = "block";
  }
  function clear() {
    if (bar) bar.style.display = "none";
  }

  window.addEventListener("offline", function () {
    var t = window.i18n && window.i18n.t ? window.i18n.t("offline.tip") : "当前离线";
    tip(t);
  });
  window.addEventListener("online", clear);
})();

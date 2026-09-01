/* ============================================================
   analytics.js v1.0.0 —— 访问统计（配置驱动）
   在 js/site-config.js 的 analytics 里填 ID 即可启用；
   两个都留空时本文件不加载任何外部脚本，站点零额外请求。
   ============================================================ */
(function () {
  var A = ((window.SITE_CONFIG || {}).analytics) || {};

  // GoatCounter：免费、无 cookie 横幅、开源
  if (A.goatcounter) {
    window.goatcounter = {
      endpoint: "https://" + A.goatcounter + ".goatcounter.com/count",
      no_onload: false
    };
    var gc = document.createElement("script");
    gc.async = true;
    gc.src = "//gc.zgo.at/count.js";
    document.head.appendChild(gc);
  }

  // Microsoft Clarity：免费热力图与录屏
  if (A.clarity) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      if (y && y.parentNode) y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", A.clarity);
  }
})();

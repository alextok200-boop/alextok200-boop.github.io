/* ============================================================
   analytics.js v1.1.0 —— 访问统计（配置驱动，可叠加）
   在 js/site-config.js 的 analytics 里填 ID 即可启用；
   全部留空时本文件不加载任何外部脚本，站点零额外请求。
   支持：GoatCounter / Microsoft Clarity / Umami / GA4 四种并行启用。
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

  // Umami：自托管或 cloud.umami.is，留空 src 走 cloud
  if (A.umami && A.umami.websiteId) {
    var us = document.createElement("script");
    us.async = true;
    us.defer = true;
    us.dataset.websiteId = A.umami.websiteId;
    us.src = A.umami.src || "https://cloud.umami.is/script.js";
    document.head.appendChild(us);
  }

  // GA4：Google Analytics 4
  if (A.ga4) {
    var g4 = document.createElement("script");
    g4.async = true;
    g4.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4);
    document.head.appendChild(g4);
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", A.ga4);
  }
})();
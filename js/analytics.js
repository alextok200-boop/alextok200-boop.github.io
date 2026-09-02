/* ============================================================
   analytics.js v1.3.0 —— 访问统计（配置驱动，可叠加）
   在 js/site-config.js 的 analytics 里填 ID 即可启用；
   全部留空时本文件不加载任何外部脚本，站点零额外请求。
   支持：51.la / Microsoft Clarity / GA4 三种并行启用。

   v1.3.0 清理说明：移除 Umami / GoatCounter 通道——
   两者经实测（cloud.umami.is / gc.zgo.at）在用户网络环境
   确定性不可达（ERR_SSL_PROTOCOL_ERROR），属"未达成但代码
   已写"的残留，予以删除避免污染源。需要时 git 历史可找回。
   ============================================================ */
(function () {
  var A = ((window.SITE_CONFIG || {}).analytics) || {};

  // 51.la：国内免备案流量统计（sdk.51.la，国内直连，无墙）—— 主统计
  // siteid 取自 51.la 后台统计代码里的 data-la-code="XXXXXX"
  if (A.la51) {
    var la = document.createElement("script");
    la.async = true;
    la.id = "LA_CODES";
    la.dataset.laCode = A.la51;
    la.src = "https://sdk.51.la/js-sdk-pro.min.js";
    document.head.appendChild(la);
  }

  // Microsoft Clarity：免费热力图与录屏（海外服务，国内访客可能加载失败，
  // 主要用于海外访客行为分析或代理环境自测）
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

  // GA4：Google Analytics 4（海外服务；本站为双语跨境站，海外访客统计用）
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

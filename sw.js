/* ============================================================
   sw.js —— Service Worker（PWA 离线支持）
   策略：HTML 网络优先（保证能拿到新版），静态资源缓存优先（省流量）。
   ⚠️ 每次发布新版本，必须把 CACHE 的版本号一起 bump，
      否则用户会一直看到旧缓存（这是 PWA 最常见的坑）。
   ============================================================ */

var CACHE = "konllen-site-v1.7.2";

// 预缓存：首屏必需，别放视频这种大文件
var PRECACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/site-config.js",
  "/js/i18n.js",
  "/js/main.js",
  "/js/seo.js",
  "/manifest.webmanifest",
  "/assets/img/icon-192.png",
  "/assets/img/icon-512.png"
];

var OFFLINE_HTML =
  '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  "<title>离线</title>" +
  "<style>body{background:#090711;color:#eef0ff;font-family:sans-serif;" +
  "display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:24px}" +
  "a{color:#00ffa3}</style></head><body><div>" +
  "<h2>当前处于离线状态</h2><p>这个页面还没有缓存过。<br>恢复网络后刷新即可。</p>" +
  '<p><a href="/">回到首页</a></p></div></body></html>';

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // 单个失败不阻断安装
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 跨域不处理

  var isHTML =
    (req.headers.get("accept") || "").indexOf("text/html") >= 0 ||
    req.destination === "document";

  if (isHTML) {
    // 网络优先：拿得到就用新的，拿不到才用缓存
    e.respondWith(
      fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) {
            c.put(req, copy);
          });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (hit) {
            if (hit) return hit;
            return new Response(OFFLINE_HTML, {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" }
            });
          });
        })
    );
    return;
  }

  // 静态资源：缓存优先，后台静默更新
  e.respondWith(
    caches.match(req).then(function (hit) {
      var network = fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) {
            c.put(req, copy);
          });
          return res;
        })
        .catch(function () {
          return hit;
        });
      return hit || network;
    })
  );
});

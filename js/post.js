/* 文章页增强：阅读计数 + 阅读进度条 + TOC + 上一篇/下一篇 + 相关推荐 */
(function () {
  var posts = window.POSTS_DATA || [];
  var cur = location.pathname.split("/").pop().replace(".html", "");

  // 当前文章与位置
  var idx = -1;
  posts.forEach(function (p, i) { if (p.file === cur) idx = i; });
  if (idx < 0) return;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // 0. 阅读计数：localStorage 本机累计 + posts-data 基线（站长可填真实值）
  (function countViews() {
    var KEY = "post_views";
    var store = {};
    try { store = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { store = {}; }
    var f = posts[idx].file;
    store[f] = (store[f] || 0) + 1;
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
    var total = (posts[idx].views || 0) + (store[f] || 0);
    if (total > 0) {
      var meta = document.querySelector(".post-meta");
      if (meta) {
        var label = window.i18n ? window.i18n.t("blog.views").replace("{n}", total) : "阅读 " + total;
        meta.insertAdjacentHTML("beforeend", " · <span class=\"post-views\">" + label + "</span>");
      }
    }
  })();

  // 1. 阅读进度条
  var bar = document.createElement("div");
  bar.id = "readingBar";
  document.body.appendChild(bar);
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = pct + "%";
  }, { passive: true });

  // 2. TOC：从文章 h2 生成
  var body = document.querySelector(".post-body");
  if (body) {
    var hs = body.querySelectorAll("h2");
    if (hs.length > 1) {
      hs.forEach(function (h, i) {
        if (!h.id) h.id = "sec-" + i;
      });
      var toc = document.createElement("nav");
      toc.className = "post-toc";
      toc.setAttribute("aria-label", "文章目录");
      var items = [];
      hs.forEach(function (h) {
        items.push('<a href="#' + h.id + '">' + esc(h.textContent) + "</a>");
      });
      toc.innerHTML = "<div class='toc-title'>目录</div>" + items.join("");
      var container = document.querySelector(".post-container");
      container.insertBefore(toc, body);
    }
  }

  // 3. 上一篇 / 下一篇
  var nav = document.createElement("div");
  nav.className = "post-nav";
  if (idx > 0) {
    var prev = posts[idx - 1];
    nav.innerHTML += '<a class="post-nav-item" href="' + prev.file + '.html"><span class="nav-dir">← 上一篇</span><span class="nav-title">' + esc(prev.title) + "</span></a>";
  } else {
    nav.innerHTML += '<span class="post-nav-item empty"></span>';
  }
  if (idx < posts.length - 1) {
    var next = posts[idx + 1];
    nav.innerHTML += '<a class="post-nav-item right" href="' + next.file + '.html"><span class="nav-dir">下一篇 →</span><span class="nav-title">' + esc(next.title) + "</span></a>";
  } else {
    nav.innerHTML += '<span class="post-nav-item empty"></span>';
  }

  // 4. 相关推荐：同标签
  var curTag = posts[idx].tag;
  var related = posts.filter(function (p, i) { return i !== idx && p.tag === curTag; }).slice(0, 3);
  if (related.length) {
    var rel = document.createElement("div");
    rel.className = "post-related";
    rel.innerHTML = "<h2>相关阅读</h2>" + related.map(function (p) {
      return '<a class="related-item" href="' + p.file + '.html"><span class="related-tag">' + esc(p.tag) + "</span>" + esc(p.title) + "</a>";
    }).join("");
    nav.insertAdjacentElement("afterend", rel);
  }

  document.querySelector(".post-container").appendChild(nav);
})();

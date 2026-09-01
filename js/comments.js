/* ============================================================
   comments.js v1.0.0 —— 文章评论（Giscus，GitHub Discussions 驱动）
   前提：js/site-config.js 的 giscus.repoId / categoryId 填好。
   未填时评论区自动隐藏，页面不会显示空白区块。
   ============================================================ */
(function () {
  // 只在文章页挂载
  if (location.pathname.indexOf("/posts/") < 0) return;

  var G = ((window.SITE_CONFIG || {}).giscus) || {};
  var ready = G.repo && G.repoId && G.categoryId;

  var box = document.createElement("section");
  box.className = "comments-box";
  box.id = "comments";

  var title = document.createElement("h2");
  title.className = "section-title";
  title.setAttribute("data-i18n", "comments.title");
  title.textContent = "评论";
  box.appendChild(title);

  var main = document.querySelector("main");
  if (!main) return;
  main.appendChild(box);

  if (!ready) {
    box.hidden = true; // 未配置：整个评论区不出现
    return;
  }

  function mount() {
    // 语言切换后重建，保证评论框语言跟随
    box.innerHTML = "";
    box.appendChild(title);
    var lang = (window.i18n && window.i18n.lang && window.i18n.lang()) || "zh";
    var s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.setAttribute("data-repo", G.repo);
    s.setAttribute("data-repo-id", G.repoId);
    s.setAttribute("data-category", G.category);
    s.setAttribute("data-category-id", G.categoryId);
    s.setAttribute("data-mapping", "pathname");
    s.setAttribute("data-strict", "0");
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-emit-metadata", "0");
    s.setAttribute("data-input-position", "bottom");
    s.setAttribute("data-theme", "dark");
    s.setAttribute("data-lang", lang === "en" ? "en" : "zh-CN");
    s.setAttribute("crossorigin", "anonymous");
    box.appendChild(s);
  }

  mount();
  document.addEventListener("i18n-changed", mount);
})();

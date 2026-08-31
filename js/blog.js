/* 博客页：搜索 + 标签筛选 + 文章列表渲染（数据源 js/posts-data.js，支持中英双语） */
(function () {
  var posts = window.POSTS_DATA || [];

  function lang() {
    return window.i18n ? window.i18n.lang() : "zh";
  }

  function L(p, field) {
    if (lang() === "en" && p.en) {
      if (field === "tag") return p.en.tag;
      return p.en[field];
    }
    return p[field];
  }

  function renderTags() {
    var tags = [];
    posts.forEach(function (p) {
      var t = L(p, "tag");
      if (tags.indexOf(t) < 0) tags.push(t);
    });
    tags.sort();
    var box = document.getElementById("tagFilters");
    if (!box) return;
    var allLabel = window.i18n ? window.i18n.t("blog.all") : "全部";
    var html = '<button class="tag-filter active" data-tag="all">' + allLabel + "</button>";
    tags.forEach(function (t) {
      html += '<button class="tag-filter" data-tag="' + t + '">' + t + "</button>";
    });
    box.innerHTML = html;
  }

  function renderList() {
    var q = (document.getElementById("searchInput").value || "").trim().toLowerCase();
    var active = document.querySelector(".tag-filter.active");
    var activeTag = (active && active.dataset.tag) || "all";

    var filtered = posts.filter(function (p) {
      var matchTag = activeTag === "all" || L(p, "tag") === activeTag;
      var matchQ = !q ||
        L(p, "title").toLowerCase().indexOf(q) >= 0 ||
        L(p, "summary").toLowerCase().indexOf(q) >= 0 ||
        L(p, "tag").toLowerCase().indexOf(q) >= 0;
      return matchTag && matchQ;
    });

    var list = document.getElementById("blogList");
    var empty = document.getElementById("emptyState");
    if (!list) return;

    if (!filtered.length) {
      list.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    var html = filtered.map(function (p) {
      return (
        '<article class="card blog-item">' +
        '<div class="blog-meta">' +
        '<span class="blog-tag">' + L(p, "tag") + "</span>" +
        '<time class="blog-date">' + p.date + "</time>" +
        "</div>" +
        '<h3><a href="posts/' + p.file + '.html">' + L(p, "title") + "</a></h3>" +
        "<p>" + L(p, "summary") + "</p>" +
        "</article>"
      );
    }).join("");
    list.innerHTML = html;
  }

  function updateCount() {
    var el = document.getElementById("postCount");
    if (!el) return;
    var n = posts.length;
    el.textContent = window.i18n
      ? window.i18n.t("blog.count").replace("{n}", n)
      : "共 " + n + " 篇";
  }

  function init() {
    renderTags();
    renderList();
    updateCount();

    var search = document.getElementById("searchInput");
    if (search) {
      search.addEventListener("input", renderList);
    }

    var filters = document.getElementById("tagFilters");
    if (filters) {
      filters.addEventListener("click", function (e) {
        if (e.target.classList.contains("tag-filter")) {
          document.querySelectorAll(".tag-filter").forEach(function (b) {
            b.classList.remove("active");
          });
          e.target.classList.add("active");
          renderList();
        }
      });
    }

    // 语言切换后重新渲染
    document.addEventListener("i18n-changed", function () {
      renderTags();
      renderList();
      updateCount();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

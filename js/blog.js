/* 博客页：搜索 + 标签筛选 + 文章列表渲染（数据源 js/posts-data.js） */
(function () {
  var posts = window.POSTS_DATA || [];

  function renderTags() {
    var tags = [];
    posts.forEach(function (p) {
      if (tags.indexOf(p.tag) < 0) tags.push(p.tag);
    });
    tags.sort();
    var box = document.getElementById("tagFilters");
    if (!box) return;
    var html = '<button class="tag-filter active" data-tag="all">全部</button>';
    tags.forEach(function (t) {
      html += '<button class="tag-filter" data-tag="' + t + '">' + t + "</button>";
    });
    box.innerHTML = html;
  }

  function renderList() {
    var q = (document.getElementById("searchInput").value || "").trim().toLowerCase();
    var activeTag = (document.querySelector(".tag-filter.active") || {}).dataset && document.querySelector(".tag-filter.active").dataset.tag || "all";

    var filtered = posts.filter(function (p) {
      var matchTag = activeTag === "all" || p.tag === activeTag;
      var matchQ = !q || p.title.toLowerCase().indexOf(q) >= 0 || p.summary.toLowerCase().indexOf(q) >= 0 || p.tag.toLowerCase().indexOf(q) >= 0;
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
        '<span class="blog-tag">' + p.tag + "</span>" +
        '<time class="blog-date">' + p.date + "</time>" +
        "</div>" +
        '<h3><a href="posts/' + p.file + '.html">' + p.title + "</a></h3>" +
        "<p>" + p.summary + "</p>" +
        "</article>"
      );
    }).join("");
    list.innerHTML = html;
  }

  function init() {
    renderTags();
    renderList();
    document.getElementById("postCount").textContent = "共 " + posts.length + " 篇";

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

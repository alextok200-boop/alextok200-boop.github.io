/* ============================================================
   seo.js v1.0.0 —— 按页面类型注入 schema.org 结构化数据
   首页：WebSite + Person + Organization
   文章页：Article + BreadcrumbList
   其它页：BreadcrumbList
   目的：让搜索结果带富摘要（站点名、面包屑、作者），提升点击率。
   ============================================================ */
(function () {
  var CFG = window.SITE_CONFIG || {};
  var V = "1.6.0";

  function addSchema(obj) {
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(obj, null, 0);
    document.head.appendChild(s);
  }

  function build() {
    var base = (CFG.siteUrl || location.origin).replace(/\/+$/, "");
    var path = location.pathname;
    var lang = (window.i18n && window.i18n.lang && window.i18n.lang()) || "zh";
    var isEn = lang === "en";
    var inLanguage = isEn ? "en" : "zh-CN";
    var siteName = isEn ? CFG.siteNameEn || CFG.siteName : CFG.siteName;
    var personName = isEn ? CFG.authorEn || CFG.author : CFG.author;
    var jobTitle = isEn ? CFG.jobTitleEn || CFG.jobTitle : CFG.jobTitle;
    var orgName = isEn ? CFG.orgNameEn || CFG.orgName : CFG.orgName;
    var email = (CFG.contact && CFG.contact.email) || "";

    var person = {
      "@type": "Person",
      name: personName,
      jobTitle: jobTitle,
      url: base + "/",
      email: email ? "mailto:" + email : undefined,
      worksFor: { "@type": "Organization", name: orgName },
      sameAs: [CFG.contact && CFG.contact.github].filter(Boolean)
    };

    var org = {
      "@type": "Organization",
      name: orgName,
      url: base + "/"
    };

    var isPost = path.indexOf("/posts/") >= 0;

    if (isPost) {
      // 文章页：优先用 posts-data 里的双语标题，取不到再退回 document.title
      var file = (path.split("/").pop() || "").replace(/\.html$/, "");
      var meta = null;
      (window.POSTS_DATA || []).forEach(function (p) {
        if (p.file === file) meta = p;
      });
      var title = meta
        ? (isEn && meta.en && meta.en.title ? meta.en.title : meta.title)
        : document.title.replace(/\s*-\s*戴程鹏\s*$/, "").trim();
      var summary = meta
        ? (isEn && meta.en && meta.en.summary ? meta.en.summary : meta.summary)
        : (document.querySelector('meta[name=description]') || {}).content || "";
      var date = (meta && meta.date) || "";

      addSchema({
        "@context": "https://schema.org",
        "@type": "Article",
        mainEntityOfPage: { "@type": "WebPage", "@id": base + path },
        headline: title,
        description: summary,
        inLanguage: inLanguage,
        datePublished: date,
        dateModified: date,
        author: person,
        publisher: Object.assign(org, { "@type": "Organization" })
      });

      addSchema({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: isEn ? "Home" : "首页", item: base + "/" },
          { "@type": "ListItem", position: 2, name: isEn ? "Blog" : "博客", item: base + "/blog.html" },
          { "@type": "ListItem", position: 3, name: title, item: base + path }
        ]
      });
      return;
    }

    // 首页
    var isHome = /(^|\/)(index\.html)?$/.test(path);
    if (isHome) {
      addSchema({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteName,
        url: base + "/",
        inLanguage: inLanguage,
        author: person,
        publisher: org
      });
      addSchema(Object.assign({ "@context": "https://schema.org" }, person));
      addSchema(Object.assign({ "@context": "https://schema.org" }, org));
      return;
    }

    // 其它内页
    var pageName = document.title.split(/\s+-\s+/)[0] || siteName;
    addSchema({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isEn ? "Home" : "首页", item: base + "/" },
        { "@type": "ListItem", position: 2, name: pageName, item: base + path }
      ]
    });
  }

  // 关键：JSON-LD 必须在 head 静态存在才能保证爬虫稳定抓取。
  // 浏览器解析到 </body> 前的同步脚本时 <head> 已可用，立即写入即可。
  build();

  void V;
})();

/* ============================================
   i18n.js - 中英双语切换（v1.0.0）
   用法：HTML 元素加 data-i18n="key"，文本放 <span data-i18n="key">
   或 data-i18n-attr="placeholder:key"
   切换按钮：<button data-i18n-toggle> 自动切换并更新文案
   ============================================ */
(function () {
  var DICT = {
    // ---- 导航 ----
    "nav.home": { zh: "首页", en: "Home" },
    "nav.about": { zh: "关于", en: "About" },
    "nav.work": { zh: "作品集", en: "Work" },
    "nav.blog": { zh: "博客", en: "Blog" },
    "nav.contact": { zh: "联系", en: "Contact" },
    "lang.btn": { zh: "EN", en: "中文" },
    "logo": { zh: "DAI·CP", en: "DAI·CP" },

    // ---- 页脚 ----
    "footer.copyright": { zh: "© 2026 戴程鹏 · Powered by GitHub Pages", en: "© 2026 Dai Chengpeng · Powered by GitHub Pages" },

    // ---- 首页 hero ----
    "hero.eyebrow": { zh: "电商操盘手 · 技能包工程负责人", en: "E-commerce Operator · AI Skill Pack Engineer" },
    "hero.title1": { zh: "让品牌电商", en: "Making brand e-commerce" },
    "hero.run": { zh: "跑得", en: "go" },
    "hero.title2": { zh: "更快、更稳、更省人", en: "Faster, Steadier, Leaner" },
    "hero.sub": { zh: "操盘万世康伦（KONLLEN）集团电商，覆盖国内 9+ 平台与海外多平台，用 AI 技能包把重复工作自动化，让团队把时间花在增长上。", en: "Operating KONLLEN Group e-commerce across 9+ domestic platforms and multiple overseas platforms. Automating repetitive work with AI skill packs so the team can focus on growth." },
    "hero.btn1": { zh: "看作品", en: "View Work" },
    "hero.btn2": { zh: "联系我", en: "Contact" },

    // ---- 首页数据卡 ----
    "stat.team": { zh: "团队规模", en: "Team Size" },
    "stat.shops": { zh: "店铺矩阵", en: "Store Matrix" },
    "stat.skills": { zh: "AI 技能包", en: "AI Skill Packs" },

    // ---- 首页核心能力 ----
    "cap.title": { zh: "核心能力", en: "Core Capabilities" },
    "cap1.title": { zh: "品牌电商操盘", en: "Brand E-commerce" },
    "cap1.desc": { zh: "抖音/天猫/京东/拼多多 + Amazon/TikTok 等跨境平台，国内海外 50/50 布局，年 GMV 已实现超千万美元。", en: "Douyin/Tmall/JD/PDD + Amazon/TikTok and more, 50/50 domestic & overseas, annual GMV now over USD 10 million." },
    "cap2.title": { zh: "AI 技能包工程", en: "AI Skill Pack Engineering" },
    "cap2.desc": { zh: "投流计划、达人分析、视觉生产、数据看板……把运营知识沉淀为可复用的 AI 技能，零基础同事一键使用。", en: "Ad planning, influencer analytics, visual production, dashboards... packaging operational know-how into reusable AI skills anyone can use." },
    "cap3.title": { zh: "数据驱动决策", en: "Data-Driven Decisions" },
    "cap3.desc": { zh: "ERP 数据中台、店铺看板、库存监控、低价预警，用数据代替拍脑袋。", en: "ERP data platform, store dashboards, inventory monitoring, price alerts — decisions backed by data, not gut feel." },

    // ---- B2B 招募 ----
    "b2b.title": { zh: "B2B 电商招募 · 代理层级方案", en: "B2B Recruitment · Tiered Dealer Plans" },
    "b2b.sub": { zh: "KONLLEN 与 CRICAL 双品牌招商合作，按合作深度与渠道能力匹配差异化政策（公开方案，正式条款以 OA 授权为准）。", en: "KONLLEN & CRICAL dual-brand recruitment. Policies matched to partnership depth and channel capability (public outline; official terms per OA authorization)." },
    "b2b.core.tier": { zh: "核心经销商", en: "Core Dealer" },
    "b2b.core.title": { zh: "独家/优先权 · 全国联保 · 高返点", en: "Exclusivity · National Warranty · High Rebate" },
    "b2b.core.1": { zh: "独家区域或垂直渠道优先权", en: "Exclusive regional/vertical priority" },
    "b2b.core.2": { zh: "深度联保与售后兜底", en: "Deep joint warranty & after-sales" },
    "b2b.core.3": { zh: "阶梯返点 + 季度奖励", en: "Tiered rebates + quarterly bonuses" },
    "b2b.core.4": { zh: "新品首发权与定向支持", en: "New-product launch priority" },
    "b2b.core.fit": { zh: "有渠道网络、能稳定走量的合作伙伴", en: "Partners with channel networks and stable volume" },
    "b2b.std.tier": { zh: "常规经销商", en: "Standard Dealer" },
    "b2b.std.title": { zh: "标准授权 · 区域保护 · 常规支持", en: "Standard License · Regional Protection · Support" },
    "b2b.std.1": { zh: "官方授权与合规资质", en: "Official license & compliance" },
    "b2b.std.2": { zh: "区域/品类保护政策", en: "Regional/category protection" },
    "b2b.std.3": { zh: "标准化返点 + 促销支持", en: "Standard rebates + promo support" },
    "b2b.std.4": { zh: "联保服务与定期培训", en: "Warranty service & training" },
    "b2b.std.fit": { zh: "区域代理、垂直渠道、专业平台分销", en: "Regional agents, vertical channels, platform distributors" },
    "b2b.ret.tier": { zh: "分销 / 散单合作", en: "Distributor / Small Orders" },
    "b2b.ret.title": { zh: "统一价 · 低门槛 · 灵活起订", en: "Unified Price · Low Barrier · Flexible MOQ" },
    "b2b.ret.1": { zh: "BC 同价、统一出货价", en: "Same B2B & retail pricing" },
    "b2b.ret.2": { zh: "小额起订、低加盟门槛", en: "Low MOQ, low entry barrier" },
    "b2b.ret.3": { zh: "线上线下均开放", en: "Online & offline open" },
    "b2b.ret.4": { zh: "定期返点 + 大促支持", en: "Periodic rebates + campaign support" },
    "b2b.ret.fit": { zh: "小额进货、电商起步、新渠道试水", en: "Small orders, e-commerce newcomers, channel tests" },
    "b2b.cta": { zh: "申请代理合作", en: "Apply for Dealership" },
    "b2b.hint": { zh: "提交联系方式 → 1-2 个工作日内对接 · 走 OA 审批留痕", en: "Submit contact → reply within 1-2 business days · OA-approved" },
    "b2b.fit.prefix": { zh: "适合", en: "Best for" },

    // ---- 关于页 ----
    "about.eyebrow": { zh: "About", en: "About" },
    "about.title": { zh: "关于我", en: "About Me" },
    "about.p1": { zh: "我是戴程鹏，万世康伦（KONLLEN）集团高级运营负责人，常驻深圳。管理 15 人电商团队，覆盖 49 个店铺、9+ 国内平台与多个海外平台，国内海外业务向 50/50 结构调整。", en: "I'm Dai Chengpeng, senior operations lead at KONLLEN Group, based in Shenzhen. I manage a 15-person e-commerce team across 49 stores, 9+ domestic platforms and multiple overseas platforms, restructuring toward a 50/50 domestic-overseas mix." },
    "about.p2": { zh: "除了传统电商操盘，我的另一个身份是技能包全栈工程负责人——把投流、生图、达人分析、数据看板等运营知识封装成 AI 技能包，让零基础的 HR、运营同事也能一键使用。", en: "Beyond classic e-commerce operations, I'm also a full-stack engineer of AI skill packs — packaging ad planning, image generation, influencer analytics and dashboards into skills that even non-technical colleagues can use with one click." },
    "about.timeline": { zh: "经历时间线", en: "Timeline" },
    "about.tl1.date": { zh: "2026", en: "2026" },
    "about.tl1.title": { zh: "集团电商运营负责人", en: "Group E-commerce Operations Lead" },
    "about.tl1.desc": { zh: "KONLLEN 双品牌进入亚马逊 5 站品牌榜；推进 9 品牌矩阵与 B2B 招商。", en: "KONLLEN & CRICAL both ranked in Amazon brand lists across 5 marketplaces; driving the 9-brand matrix and B2B recruitment." },
    "about.tl2.date": { zh: "2025", en: "2025" },
    "about.tl2.title": { zh: "技能包工程体系搭建", en: "AI Skill Pack System" },
    "about.tl2.desc": { zh: "建立 WorkBuddy 业务技能矩阵，交付投流/生图/看板/OA 审批等 20+ 技能包。", en: "Built the WorkBuddy skill matrix, delivering 20+ packs for ads, imaging, dashboards and OA approvals." },
    "about.tl3.date": { zh: "更早", en: "Earlier" },
    "about.tl3.title": { zh: "多平台电商操盘积累", en: "Multi-platform E-commerce" },
    "about.tl3.desc": { zh: "国内兴趣电商 + 货架电商 + 跨境出海，从单店运营到品牌矩阵。", en: "From single-store operations to a brand matrix across domestic interest/shelf commerce and overseas." },

    // ---- 作品集页 ----
    "work.eyebrow": { zh: "Work", en: "Work" },
    "work.title": { zh: "作品集", en: "Portfolio" },
    "work.sub": { zh: "从操盘到工程，从店铺到中台——这些年落地的代表项目。", en: "From operations to engineering, from stores to platforms — representative projects." },
    "work.w1.title": { zh: "KONLLEN 品牌电商体系", en: "KONLLEN Brand E-commerce" },
    "work.w1.desc": { zh: "双品牌亚马逊 5 站品牌榜，国内 9+ 平台店铺矩阵。从单品到品牌矩阵的运营操盘。", en: "Dual brands ranked on Amazon across 5 marketplaces, 9+ domestic platform stores. From single products to a brand matrix." },
    "work.w2.title": { zh: "数据中台与自动化看板", en: "Data Platform & Auto Dashboards" },
    "work.w2.desc": { zh: "聚水潭库存看板、店铺每日数据看板、AI Agent 监控仪表盘——用数据替代拍脑袋。", en: "Jushuitan inventory board, daily store dashboards, AI agent monitoring — data over gut feel." },
    "work.w3.title": { zh: "投流计划生成与审核", en: "Ad Plan Generation & Audit" },
    "work.w3.desc": { zh: "台球专版投流生成器 + 7 维审核器 + 执行方案，覆盖 12 个投放平台，扫描需求自动出计划。", en: "Billiards-specific ad generator + 7-dimension auditor + execution plans across 12 platforms." },
    "work.w4.title": { zh: "Konllen Agent 技能中台", en: "Konllen Agent Platform" },
    "work.w4.desc": { zh: "五层架构品牌 Agent：整合 10 个 Skill、10 项自动化、监控仪表盘与 API 扩展框架。", en: "5-layer brand agent: 10 skills, 10 automations, monitoring dashboard and API framework." },
    "work.w5.title": { zh: "AI 视觉生产", en: "AI Visual Production" },
    "work.w5.desc": { zh: "Agnes 品牌视觉管线：批量生图、PSD 素材包、钉钉流转，锚定 KONLLEN 品牌 VI。", en: "Agnes visual pipeline: batch imaging, PSD asset packs, DingTalk workflow, anchored to KONLLEN VI." },
    "work.w6.title": { zh: "CRICAL 品牌官网", en: "CRICAL Brand Website" },
    "work.w6.desc": { zh: "霓虹暗黑潮牌风格静态站点，产品图逐张替换为真实产品照，已上线可访问。", en: "Neon-dark street-style static site with real product photos, live and accessible." },
    "work.pending": { zh: "案例截图补充中", en: "Screenshots coming soon" },

    // ---- 博客页 ----
    "blog.eyebrow": { zh: "Blog", en: "Blog" },
    "blog.title": { zh: "博客", en: "Blog" },
    "blog.sub": { zh: "品牌电商与 AI 技能包的实战记录。", en: "Notes on brand e-commerce and AI skill packs." },
    "blog.search": { zh: "搜索文章关键词…", en: "Search articles..." },
    "blog.all": { zh: "全部", en: "All" },
    "blog.empty": { zh: "没有找到匹配的文章。", en: "No matching articles found." },
    "blog.count": { zh: "共 {n} 篇", en: "{n} articles" },
    "blog.readmore": { zh: "阅读全文", en: "Read more" },

    // ---- 联系页 ----
    "contact.eyebrow": { zh: "Contact", en: "Contact" },
    "contact.title": { zh: "联系我", en: "Contact Me" },
    "contact.info.title": { zh: "合作与交流", en: "Collaboration & Exchange" },
    "contact.info.desc": { zh: "品牌电商咨询、AI 技能包合作、行业交流，欢迎联系。", en: "Brand e-commerce consulting, AI skill pack cooperation, industry exchange — reach out." },
    "contact.email": { zh: "邮箱", en: "Email" },
    "contact.github": { zh: "GitHub", en: "GitHub" },
    "contact.form.title": { zh: "留言", en: "Message" },
    "contact.form.name": { zh: "称呼", en: "Name" },
    "contact.form.name.ph": { zh: "怎么称呼你", en: "Your name" },
    "contact.form.email": { zh: "邮箱", en: "Email" },
    "contact.form.email.ph": { zh: "你的邮箱", en: "Your email" },
    "contact.form.msg": { zh: "内容", en: "Message" },
    "contact.form.msg.ph": { zh: "想聊什么", en: "What's on your mind" },
    "contact.form.send": { zh: "发送", en: "Send" },
    "contact.form.note": { zh: "谢谢 {n}！表单已提交（静态站演示），正式版请通过邮箱联系。", en: "Thanks {n}! Form submitted (demo). For real inquiries please email." },

    // ---- 文章页公共 ----
    "post.back": { zh: "← 返回博客", en: "← Back to blog" },
    "post.toc": { zh: "目录", en: "Contents" },
    "post.prev": { zh: "← 上一篇", en: "← Previous" },
    "post.next": { zh: "下一篇 →", en: "Next →" },
    "post.related": { zh: "相关阅读", en: "Related" }
  };

  var LANG_KEY = "site_lang";
  var current = localStorage.getItem(LANG_KEY) || "zh";

  function t(key) {
    var e = DICT[key];
    return e ? (e[current] || e.zh) : key;
  }

  function apply() {
    document.documentElement.lang = current;
    // data-i18n 文本
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    // data-i18n-attr="attr:key"
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      var parts = el.getAttribute("data-i18n-attr").split(":");
      if (parts.length === 2) {
        el.setAttribute(parts[0], t(parts[1]));
      }
    });
    // 切换按钮文案
    document.querySelectorAll("[data-i18n-toggle]").forEach(function (el) {
      el.textContent = t("lang.btn");
    });
    // 自定义事件：让 blog.js / post.js 重新渲染
    document.dispatchEvent(new CustomEvent("i18n-changed", { detail: { lang: current } }));
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-i18n-toggle]")) {
      current = current === "zh" ? "en" : "zh";
      localStorage.setItem(LANG_KEY, current);
      apply();
    }
  });

  // 暴露给其它脚本
  window.i18n = { t: t, lang: function () { return current; } };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();

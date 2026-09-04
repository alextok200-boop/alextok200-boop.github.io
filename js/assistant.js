/* ============================================================
   assistant.js v1.0.0 —— 右下角规则型 AI 问答助手
   关键词命中即答；未命中引导到联系页留资。纯前端零依赖。
   ============================================================ */
(function () {
  var KNOWLEDGE = {
    zh: {
      title: "AI 助手",
      welcome: "常见问题马上答。点下方问题，或直接输入关键词。",
      fallback: "这个问题我答不上，可以到「联系」页留下你的问题，戴程鹏会亲自回复。",
      quick: ["主导过哪些项目", "有哪些能力", "年 GMV 多少", "在招什么岗位", "怎么联系"],
      answers: {
        "代理|经销|加盟|招商|渠道|分销": "商务合作与渠道对接，请在「联系」页说明来意与背景，1-2 个工作日内回复。",
        "品牌|矩阵|产品|台球|桌球|杆|球|cue": "有多品牌并行运营经验，覆盖不同价格带与人群；主打品牌进入亚马逊 5 站类目榜（日本 #5 / 德国 #8 / 美国 #11 / 加拿大 #11）。详见「项目经历」页。",
        "gmv|成绩|规模|数据|店铺|数量|多少": "年 GMV 已超千万美元；49 个店铺分布在 9+ 国内平台与多个海外平台，国内海外 50/50。详见「成绩单」页。",
        "招聘|加入|岗位|应聘|career|job|招人": "在招：TK 跨境直播运营（深圳/南京）。储备：跨境电商运营、运营自动化/AI 技能包工程。详见「加入我们」页。",
        "联系|邮箱|邮件|电话|微信|二维码|怎么找你": "邮箱 alextok200@gmail.com；GitHub github.com/alextok200；表单：「联系」页可填。",
        "技能|skill|ai|工具|看板|生图|自动化|审批": "20+ AI 技能包，覆盖投流审核、视觉生产、数据看板、OA 审批、视频脚本、复盘模板等。详见「作品集」页。",
        "博客|文章|笔记|blog": "20 篇实战笔记，覆盖 ERP、Temu、OA 审批、达人分析、数据中台等。详见「博客」页。",
        "价格|报价|底价|拿货|进货|成本": "具体商务条款与报价，请在「联系」页说明需求，会尽快回复。",
        "你|谁|什么|ai|机器人|模型|助手|真|假": "我是这个站点的规则型 AI 助手，跑在浏览器里、零依赖。复杂问题请留联系方式，戴程鹏本人会回复。"
      }
    },
    en: {
      title: "AI Assistant",
      welcome: "Quick answers to common questions. Tap a chip below or type a keyword.",
      fallback: "I can't help with that. Use the Contact page to leave a note — Dai Chengpeng will reply personally.",
      quick: ["Featured projects", "Core skills", "Annual GMV", "Open roles", "How to contact"],
      answers: {
        "dealership|distributor|partner|channel|reseller": "For business collaboration, describe your context on the Contact page — reply within 1-2 business days.",
        "brand|product|cue|billiard|line": "Experience running multiple brands in parallel across price tiers and audiences; flagship brands ranked on Amazon category lists across 5 marketplaces. See the Projects page.",
        "gmv|revenue|scale|number|store|size": "Annual GMV over USD 10M. 49 stores across 9+ domestic and multiple overseas platforms, targeting a 50/50 split. See the Results page.",
        "job|career|hiring|opening|role|work|apply|recruit": "Open: TikTok Cross-border Live Operations (Shenzhen / Nanjing). Pool: Cross-border Operator, Ops Automation. See the Careers page.",
        "contact|email|mail|wechat|reach|phone": "Email: alextok200@gmail.com. GitHub: github.com/alextok200. Form on the Contact page.",
        "skill|tool|ai|automation|dashboard|approv|agent|script": "20+ AI skill packs: ad review, visual production, dashboards, OA approvals, video scripts. See the Work page.",
        "blog|post|article|note|writing": "Twenty field notes spanning ERP, Temu, OA approvals, influencer analytics and data platforms. See the Blog page.",
        "price|moq|min|order|cost|wholesale": "For commercial terms, describe your needs on the Contact page and you will hear back shortly.",
        "you|ai|bot|model|who|real|human|robot": "I'm a rules-based assistant running entirely in your browser, no servers. For real complexity, leave a note and Dai Chengpeng will reply himself."
      }
    }
  };

  function getLang() {
    return (window.i18n && window.i18n.lang && window.i18n.lang()) || "zh";
  }
  function getData() {
    return KNOWLEDGE[getLang()] || KNOWLEDGE.zh;
  }
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function match(input) {
    var data = getData();
    var lower = (input || "").toLowerCase();
    for (var key in data.answers) {
      var tokens = key.split("|");
      for (var i = 0; i < tokens.length; i++) {
        if (lower.indexOf(tokens[i].toLowerCase()) >= 0) {
          return data.answers[key];
        }
      }
    }
    return data.fallback;
  }

  function t(key, fallback) {
    if (window.i18n && typeof window.i18n.t === "function") {
      var v = window.i18n.t(key);
      return v && v !== key ? v : fallback;
    }
    return fallback;
  }

  var launcher, panel, log;

  function build() {
    if (document.getElementById("assistantLauncher")) return;
    var data = getData();

    launcher = document.createElement("button");
    launcher.id = "assistantLauncher";
    launcher.className = "assistant-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", data.title);
    launcher.innerHTML = "💬";

    panel = document.createElement("div");
    panel.id = "assistantPanel";
    panel.className = "assistant-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", data.title);
    panel.hidden = true;
    panel.innerHTML =
      '<div class="assistant-head">' +
        "<span>" + esc(data.title) + "</span>" +
        '<button class="assistant-close" type="button" aria-label="Close">×</button>' +
      "</div>" +
      '<div class="assistant-log" id="assistantLog"></div>' +
      '<form class="assistant-quick" id="assistantForm">' +
        '<input type="text" id="assistantInput" autocomplete="off" placeholder="' + esc(data.welcome) + '" style="flex:1;min-width:0;background:transparent;border:1px solid var(--border);color:var(--text);border-radius:8px;padding:6px 10px;font-family:inherit;font-size:13px;">' +
        '<button type="submit" style="background:var(--neon-green);color:#000;border:none;border-radius:8px;padding:6px 12px;font-weight:600;cursor:pointer;">' + esc(t("inquiry.sending", "问") === "提交中…" ? "问" : "Ask") + "</button>" +
      "</form>" +
      '<div class="assistant-quick" id="assistantChips" style="border-top:0;padding-top:0;">' +
        data.quick.map(function (q) {
          return '<button type="button" data-q="' + esc(q) + '">' + esc(q) + "</button>";
        }).join("") +
      "</div>";

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    log = panel.querySelector("#assistantLog");
    push("bot", data.welcome);

    launcher.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) {
        var inp = panel.querySelector("#assistantInput");
        if (inp) inp.focus();
      }
    });
    panel.querySelector(".assistant-close").addEventListener("click", function () {
      panel.hidden = true;
    });
    panel.querySelector("#assistantChips").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-q]");
      if (b) ask(b.getAttribute("data-q"));
    });
    panel.querySelector("#assistantForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = panel.querySelector("#assistantInput");
      var v = inp.value.trim();
      if (!v) return;
      ask(v);
      inp.value = "";
    });
  }

  function ask(q) {
    push("me", q);
    var ans = match(q);
    setTimeout(function () {
      push("bot", ans);
      log.scrollTop = log.scrollHeight;
    }, 200);
  }
  function push(role, text) {
    if (!log) return;
    var div = document.createElement("div");
    div.className = "assistant-msg " + role;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
  document.addEventListener("i18n-changed", function () {
    if (panel) panel.remove();
    if (launcher) launcher.remove();
    build();
  });
})();

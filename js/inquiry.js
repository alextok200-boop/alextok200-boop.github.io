/* ============================================================
   inquiry.js v1.2.0 —— 询盘/招商/授权申请表单提交（静态站可用，无需自建服务器）
   v1.2.0：授权申请字段 —— collect() 增加 coop_type / channel / market /
           store_url / scale（授权申请表单专用，其他表单无此字段自动为空）。
   v1.1.0：多表单化 —— 绑定页面内所有 .inquiry-form 元素（contact 页
   #inquiryForm 亦归入该类），字段按 name 属性取值（兼容原 inq-* id）。
   通道按 webhook → FormSubmit 邮件 → 本地邮件客户端 自动降级，
   任一通道可用即可收到线索；全部未配置时也不会「点了没反应」。
   注：webhook 通道为 Cloudflare Worker 钉钉转发，默认留空 = 一律走邮箱。
   ============================================================ */
(function () {
  var CONFIG = window.SITE_CONFIG || {};
  var INQ = CONFIG.inquiry || {};
  var MAIL = (CONFIG.contact && CONFIG.contact.email) || "";

  var COOLDOWN_KEY = "inquiry_last_ts";
  var COOLDOWN_MS = 20000; // 20 秒防重复提交（全站共享，防两个表单连点）

  function t(key, fallback) {
    if (window.i18n && typeof window.i18n.t === "function") {
      var v = window.i18n.t(key);
      return v && v !== key ? v : fallback;
    }
    return fallback;
  }

  function say(form, msg, type) {
    var note = form.querySelector(".form-note");
    if (!note) return;
    note.textContent = msg;
    note.className = "form-note" + (type ? " is-" + type : "");
    note.setAttribute("role", "status");
  }

  function field(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? String(el.value || "").trim() : "";
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function collect(form) {
    return {
      name: field(form, "name"),
      email: field(form, "email"),
      company: field(form, "company"),
      intent: field(form, "intent"),
      brand: field(form, "brand"),
      coopType: field(form, "coop_type"),
      channel: field(form, "channel"),
      market: field(form, "market"),
      storeUrl: field(form, "store_url"),
      scale: field(form, "scale"),
      message: field(form, "message"),
      subject: form.getAttribute("data-subject") || "网站询盘",
      page: location.pathname,
      lang: (window.i18n && window.i18n.lang && window.i18n.lang()) || "zh",
      ua: navigator.userAgent,
      ts: new Date().toISOString()
    };
  }

  function setSending(form, state) {
    var btn = form.querySelector("button[type=submit]");
    if (!btn) return;
    btn.disabled = state;
    btn.classList.toggle("is-loading", state);
    btn.textContent = state
      ? t("inquiry.sending", "提交中…")
      : t("contact.form.send", "发送");
  }

  function mailtoFallback(data, form) {
    var subject = "[" + data.subject + "] " + (data.intent || data.brand || "合作咨询") + " - " + data.name;
    var body =
      "称呼：" + data.name + "\n" +
      "邮箱：" + data.email + "\n" +
      "公司/渠道：" + (data.company || "-") + "\n" +
      (data.brand ? "意向品牌：" + data.brand + "\n" : "") +
      (data.coopType ? "申请类型：" + data.coopType + "\n" : "") +
      (data.channel ? "销售渠道：" + data.channel + "\n" : "") +
      (data.market ? "目标市场：" + data.market + "\n" : "") +
      (data.storeUrl ? "现有链接：" + data.storeUrl + "\n" : "") +
      (data.scale ? "预计规模：" + data.scale + "\n" : "") +
      "合作意向：" + (data.intent || "-") + "\n\n" +
      data.message;
    say(form, t("inquiry.mailto", "正在打开你的邮件客户端…"), "info");
    window.location.href =
      "mailto:" + MAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  function submit(data) {
    // 通道一：自定义 webhook（推荐，可转发钉钉；默认留空走邮箱）
    if (INQ.webhook) {
      var headers = { "Content-Type": "application/json" };
      // 端点公开在前端，靠口令防止他人滥用你的转发器
      if (INQ.token) headers["X-Inquiry-Token"] = INQ.token;
      return fetch(INQ.webhook, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return true;
      });
    }
    // 通道二：FormSubmit 免费邮件转发（默认通道）
    if (INQ.formSubmitEmail) {
      return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(INQ.formSubmitEmail), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return true;
      });
    }
    // 通道三：本地邮件客户端
    return Promise.resolve(false);
  }

  function setup(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot：机器人会填，正常用户看不到
      var hp = form.querySelector("[name=website]");
      if (hp && hp.value) return;

      var last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
      if (Date.now() - last < COOLDOWN_MS) {
        say(form, t("inquiry.cooldown", "刚刚已提交，请稍候再试"), "warn");
        return;
      }

      var data = collect(form);
      if (!data.name) { say(form, t("inquiry.err.name", "请填写称呼"), "err"); var n = form.querySelector('[name="name"]'); if (n) n.focus(); return; }
      if (!validEmail(data.email)) { say(form, t("inquiry.err.email", "请填写有效邮箱，方便回复你"), "err"); var em = form.querySelector('[name="email"]'); if (em) em.focus(); return; }
      if (data.message.length < 10) { say(form, t("inquiry.err.msg", "内容请至少 10 个字，方便我判断需求"), "err"); var ms = form.querySelector('[name="message"]'); if (ms) ms.focus(); return; }

      setSending(form, true);
      say(form, "", "");

      submit(data)
        .then(function (sent) {
          localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
          setSending(form, false);
          if (sent) {
            say(form, t("inquiry.success", "已收到，我会在 1-2 个工作日内回复你。"), "ok");
            form.reset();
          } else if (INQ.fallbackMailto !== false && MAIL) {
            setSending(form, false);
            mailtoFallback(data, form);
          } else {
            say(form, t("inquiry.nochannel", "暂未配置提交通道，请直接发邮件联系。"), "warn");
          }
        })
        .catch(function () {
          setSending(form, false);
          var tip = t("inquiry.fail", "提交失败，请直接发邮件到 {mail}").replace("{mail}", MAIL || "");
          say(form, tip, "err");
        });
    });
  }

  function init() {
    var forms = document.querySelectorAll(".inquiry-form");
    if (!forms.length) return;
    Array.prototype.forEach.call(forms, setup);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

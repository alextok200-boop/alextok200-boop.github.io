/* ============================================================
   inquiry.js v1.0.0 —— 询盘表单提交（静态站可用，无需自建服务器）
   通道按 webhook → FormSubmit 邮件 → 本地邮件客户端 自动降级，
   任一通道可用即可收到线索；全部未配置时也不会「点了没反应」。
   ============================================================ */
(function () {
  var CONFIG = window.SITE_CONFIG || {};
  var INQ = CONFIG.inquiry || {};
  var MAIL = (CONFIG.contact && CONFIG.contact.email) || "";

  var form = document.getElementById("inquiryForm");
  if (!form) return;

  var note = document.getElementById("formNote");
  var btn = form.querySelector("button[type=submit]");
  var COOLDOWN_KEY = "inquiry_last_ts";
  var COOLDOWN_MS = 20000; // 20 秒防重复提交

  function t(key, fallback) {
    if (window.i18n && typeof window.i18n.t === "function") {
      var v = window.i18n.t(key);
      return v && v !== key ? v : fallback;
    }
    return fallback;
  }

  function say(msg, type) {
    if (!note) return;
    note.textContent = msg;
    note.className = "form-note" + (type ? " is-" + type : "");
    note.setAttribute("role", "status");
  }

  function field(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function collect() {
    return {
      name: field("inq-name"),
      email: field("inq-email"),
      company: field("inq-company"),
      intent: field("inq-intent"),
      message: field("inq-message"),
      page: location.pathname,
      lang: (window.i18n && window.i18n.lang && window.i18n.lang()) || "zh",
      ua: navigator.userAgent,
      ts: new Date().toISOString()
    };
  }

  function setSending(state) {
    if (!btn) return;
    btn.disabled = state;
    btn.classList.toggle("is-loading", state);
    btn.textContent = state
      ? t("inquiry.sending", "提交中…")
      : t("contact.form.send", "发送");
  }

  function mailtoFallback(data) {
    var subject = "[网站询盘] " + (data.intent || "合作咨询") + " - " + data.name;
    var body =
      "称呼：" + data.name + "\n" +
      "邮箱：" + data.email + "\n" +
      "公司/渠道：" + (data.company || "-") + "\n" +
      "合作意向：" + (data.intent || "-") + "\n\n" +
      data.message;
    say(t("inquiry.mailto", "正在打开你的邮件客户端…"), "info");
    window.location.href =
      "mailto:" + MAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  function submit(data) {
    // 通道一：自定义 webhook（推荐，可转发钉钉）
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
    // 通道二：FormSubmit 免费邮件转发
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

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // honeypot：机器人会填，正常用户看不到
    var hp = form.querySelector("[name=website]");
    if (hp && hp.value) return;

    var last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    if (Date.now() - last < COOLDOWN_MS) {
      say(t("inquiry.cooldown", "刚刚已提交，请稍候再试"), "warn");
      return;
    }

    var data = collect();
    if (!data.name) { say(t("inquiry.err.name", "请填写称呼"), "err"); document.getElementById("inq-name").focus(); return; }
    if (!validEmail(data.email)) { say(t("inquiry.err.email", "请填写有效邮箱，方便回复你"), "err"); document.getElementById("inq-email").focus(); return; }
    if (data.message.length < 10) { say(t("inquiry.err.msg", "内容请至少 10 个字，方便我判断需求"), "err"); document.getElementById("inq-message").focus(); return; }

    setSending(true);
    say("", "");

    submit(data)
      .then(function (sent) {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        setSending(false);
        if (sent) {
          say(t("inquiry.success", "已收到，我会在 1-2 个工作日内回复你。"), "ok");
          form.reset();
        } else if (INQ.fallbackMailto !== false && MAIL) {
          setSending(false);
          mailtoFallback(data);
        } else {
          say(t("inquiry.nochannel", "暂未配置提交通道，请直接发邮件联系。"), "warn");
        }
      })
      .catch(function () {
        setSending(false);
        var tip = t("inquiry.fail", "提交失败，请直接发邮件到 {mail}").replace("{mail}", MAIL || "");
        say(tip, "err");
      });
  });
})();

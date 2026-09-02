/* ============================================================
   newsletter.js v1.0.0 —— Newsletter 订阅（仅需 email + honeypot）
   走 site-config.js 的 formSubmitEmail 通道（默认 alextok200@gmail.com），
   邮件主题固定为 "Newsletter 订阅"，与 inquiry 通道分流。
   邮箱通道同 inquiry.js：留空则降级为本地邮件客户端 / 提示联系邮箱。
   ============================================================ */
(function () {
  var INQ = ((window.SITE_CONFIG || {}).inquiry) || {};
  var MAIL = INQ.formSubmitEmail || "";

  var COOLDOWN_KEY = "newsletter_last_ts";
  var COOLDOWN_MS = 30000; // 30 秒防重复（订阅场景可以比询盘宽松）

  function t(key, fallback) {
    if (window.i18n && typeof window.i18n.t === "function") {
      var v = window.i18n.t(key);
      return v && v !== key ? v : fallback;
    }
    return fallback;
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function say(form, msg, type) {
    var note = form.querySelector(".form-note");
    if (!note) return;
    note.textContent = msg;
    note.className = "form-note" + (type ? " is-" + type : "");
    note.setAttribute("role", "status");
  }

  function submit(data) {
    if (!MAIL) return Promise.resolve(false);
    return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(MAIL), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return true;
    });
  }

  function setup(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // honeypot
      var hp = form.querySelector("[name=website]");
      if (hp && hp.value) return;

      var last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
      if (Date.now() - last < COOLDOWN_MS) {
        say(form, t("newsletter.cooldown", "刚刚已订阅，请稍候再试"), "warn");
        return;
      }

      var emEl = form.querySelector('[name="email"]');
      var email = emEl ? String(emEl.value || "").trim() : "";
      if (!validEmail(email)) {
        say(form, t("newsletter.err.email", "请填写有效邮箱"), "err");
        if (emEl) emEl.focus();
        return;
      }

      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.classList.add("is-loading"); }
      say(form, "", "");

      var data = {
        email: email,
        subject: form.getAttribute("data-subject") || "Newsletter 订阅",
        page: location.pathname,
        lang: (window.i18n && window.i18n.lang && window.i18n.lang()) || "zh",
        ua: navigator.userAgent,
        ts: new Date().toISOString()
      };

      submit(data)
        .then(function (sent) {
          localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
          if (btn) { btn.disabled = false; btn.classList.remove("is-loading"); }
          if (sent) {
            say(form, t("newsletter.success", "订阅成功！新文章会通过邮件通知你。"), "ok");
            form.reset();
          } else {
            say(form, t("newsletter.nochannel", "暂未配置订阅通道，请直接发邮件联系。"), "warn");
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.classList.remove("is-loading"); }
          var tip = t("newsletter.fail", "提交失败，请直接发邮件到 {mail}").replace("{mail}", MAIL || "");
          say(form, tip, "err");
        });
    });
  }

  function init() {
    var forms = document.querySelectorAll(".newsletter-form");
    if (!forms.length) return;
    Array.prototype.forEach.call(forms, setup);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
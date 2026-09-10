/* ============================================================
   auth.js —— 已登录态切换
   入口链接 .nav-login 已硬编码在 HTML，本脚本只负责
   检测 session 后把它换成"用户菜单 + 登出"。
   必须在 roles.js 之后加载（依赖 Auth 全局对象）。
   ============================================================ */

(function() {
  'use strict';

  function initAuthNav() {
    var loginLink = document.querySelector('.nav-login');
    if (!loginLink) return;
    if (typeof Auth === 'undefined') return; // roles.js 未加载，安全降级

    var session = Auth.getSession();
    if (!session) return; // 未登录，保持硬编码的"登录"入口

    // 已登录 → 把链接换成用户菜单
    var wrapper = document.createElement('div');
    wrapper.className = 'auth-menu';
    wrapper.innerHTML =
      '<span class="user-name">' + escapeHtml(session.name) + '</span>' +
      '<button class="logout-btn" type="button">登出</button>';
    loginLink.replaceWith(wrapper);
    wrapper.querySelector('.logout-btn').addEventListener('click', Auth.logout);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthNav);
  } else {
    initAuthNav();
  }
})();
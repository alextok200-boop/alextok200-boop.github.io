/* ============================================================
   auth.js —— 认证 UI 组件
   提供：登录表单、用户菜单、权限检查
   ============================================================ */

(function() {
  'use strict';

  /**
   * 初始化认证 UI（添加到导航栏）
   */
  function initAuthNav() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // 检查是否已有认证入口
    if (document.getElementById('auth-menu')) return;

    const session = Auth.getSession();
    const authItem = document.createElement('div');
    authItem.id = 'auth-menu';
    authItem.className = 'auth-menu';

    if (session) {
      // 已登录：显示用户信息和登出按钮
      authItem.innerHTML = `
        <div class="user-dropdown">
          <span class="user-name">${session.name}</span>
          <button class="logout-btn" onclick="Auth.logout()">登出</button>
        </div>
      `;
    } else {
      // 未登录：显示登录入口
      authItem.innerHTML = `
        <a href="/pages/login.html" class="login-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          登录
        </a>
      `;
    }

    navLinks.appendChild(authItem);

    // 添加样式
    addAuthStyles();
  }

  /**
   * 添加认证相关样式
   */
  function addAuthStyles() {
    const styleId = 'auth-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .auth-menu {
        margin-left: 12px;
        padding-left: 12px;
        border-left: 1px solid var(--border);
      }
      .login-link {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text);
        text-decoration: none;
        font-size: 14px;
        transition: color 0.2s;
      }
      .login-link:hover {
        color: var(--neon-green);
      }
      .user-dropdown {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .user-name {
        font-size: 14px;
        color: var(--neon-green);
        font-weight: 500;
      }
      .logout-btn {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-dim);
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .logout-btn:hover {
        border-color: var(--neon-pink);
        color: var(--neon-pink);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 页面加载时初始化
   */
  document.addEventListener('DOMContentLoaded', function() {
    initAuthNav();
  });

})();

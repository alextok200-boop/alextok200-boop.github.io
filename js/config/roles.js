/* ============================================================
   roles.js —— 角色权限配置表
   原则：只在此处管理权限，页面通过 API 读取
   ============================================================ */

/**
 * 角色配置
 * role: 角色标识
 * name: 显示名称
 * password: 登录密码（生产环境应改为哈希）
 * pages: 可查看的页面路径数组
 */
const ROLES = {
  // 管理员：全权，可访问所有页面 + 后台
  admin: {
    name: "管理员",
    password: "admin2026",  // 修改这里
    pages: ["*"],          // * 表示全部
    canEdit: true
  },

  // 团队主管：看数据看板 + 团队指标
  team_leader: {
    name: "团队主管",
    password: "team2026",  // 修改这里
    pages: ["/pages/team/dashboard.html", "/pages/team/metrics.html"],
    canEdit: false
  },

  // 团队成员：只看公开内容 + 方法论
  member: {
    name: "团队成员",
    password: "view2026",  // 修改这里
    pages: [
      "/index.html",
      "/about.html",
      "/work.html",
      "/brands.html",
      "/methods.html",
      "/blog.html",
      "/contact.html"
    ],
    canEdit: false
  }
};

/**
 * 权限检查 API
 */
const Auth = {
  /**
   * 检查当前会话是否有指定角色的权限
   */
  hasRole: function(role) {
    const session = this.getSession();
    return session && session.role === role;
  },

  /**
   * 检查当前会话是否可以访问指定页面
   */
  canAccess: function(pagePath) {
    const session = this.getSession();
    if (!session) return false;

    const roleConfig = ROLES[session.role];
    if (!roleConfig) return false;

    // 管理员可访问全部
    if (roleConfig.pages.includes("*")) return true;

    // 检查是否在允许列表中
    return roleConfig.pages.some(p => pagePath.includes(p.replace("/", "")));
  },

  /**
   * 登录验证
   */
  login: function(role, password) {
    const roleConfig = ROLES[role];
    if (!roleConfig) return { success: false, error: "角色不存在" };
    if (roleConfig.password !== password) return { success: false, error: "密码错误" };

    // 存入 session（关闭浏览器即失效）
    sessionStorage.setItem("auth_session", JSON.stringify({
      role: role,
      name: roleConfig.name,
      loginTime: Date.now()
    }));

    return { success: true, role: role, name: roleConfig.name };
  },

  /**
   * 登出
   */
  logout: function() {
    sessionStorage.removeItem("auth_session");
    window.location.href = "/";
  },

  /**
   * 获取当前会话
   */
  getSession: function() {
    try {
      return JSON.parse(sessionStorage.getItem("auth_session"));
    } catch (e) {
      return null;
    }
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated: function() {
    return !!this.getSession();
  },

  /**
   * 重定向到登录页（如果未登录）
   */
  requireAuth: function(pagePath) {
    if (!this.canAccess(pagePath)) {
      window.location.href = "/pages/login.html";
      return false;
    }
    return true;
  }
};

/* ============================================================
   roles.js —— 个人后台权限配置
   站点性质：个人简历 + 能力展示
   后台仅服务站长本人（内容管理），不再承载团队协作
   ============================================================ */

/**
 * 角色配置
 * 说明：本文件已随团队门户独立而精简，仅保留单一管理员角色。
 *       team_leader / member 已于清理中移除，团队协作迁移至 team-portal 项目。
 *
 * role: 角色标识
 * name: 显示名称
 * password: 登录密码（生产环境应改为哈希）
 * pages: 可查看的页面路径数组
 */
const ROLES = {
  // 管理员（站长本人）：全权，可访问所有页面 + 后台
  admin: {
    name: "站长",
    password: "admin2026",  // 修改这里
    pages: ["*"],           // * 表示全部
    canEdit: true
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
   * 登录验证（单账号：不传 role 时默认 admin）
   */
  login: function(role, password) {
    const roleKey = role || "admin";
    const roleConfig = ROLES[roleKey];
    if (!roleConfig) return { success: false, error: "角色不存在" };
    if (roleConfig.password !== password) return { success: false, error: "密码错误" };

    // 存入 session（关闭浏览器即失效）
    sessionStorage.setItem("auth_session", JSON.stringify({
      role: roleKey,
      name: roleConfig.name,
      loginTime: Date.now()
    }));

    return { success: true, role: roleKey, name: roleConfig.name };
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

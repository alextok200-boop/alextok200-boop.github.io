/* ============================================================
   site-config.js v1.0.0 —— 站点集中配置
   原则：填一行即可启用，留空则该功能自动关闭且不加载任何脚本。
   所有需要账号/密钥/第三方 ID 的能力都收敛在这里，避免在页面里硬编码。
   ============================================================ */
window.SITE_CONFIG = {
  // 站点根地址（用于 JSON-LD、RSS、OG 绝对链接）
  siteUrl: "https://alextok200-boop.github.io",

  // 站点主体信息（JSON-LD 与 OG 共用）
  siteName: "戴程鹏",
  siteNameEn: "Dai Chengpeng",
  author: "戴程鹏",
  authorEn: "Dai Chengpeng",
  jobTitle: "电商操盘手 · AI 技能包工程负责人",
  jobTitleEn: "E-commerce Operator · AI Skill Pack Engineer",
  orgName: "万世康伦（KONLLEN）集团",
  orgNameEn: "KONLLEN Group",
  locale: "zh_CN",

  // 联系方式
  contact: {
    email: "alextok200@gmail.com",
    github: "https://github.com/alextok200",
    // 填二维码图片路径后 contact 页显示（例："assets/img/wechat-qr.png"），留空显示占位
    wechatQr: "assets/img/wechat-qr.png"
  },

  /* ------------------------------------------------------------
     询盘表单提交通道（按 webhook → 邮件 → 邮件客户端 顺序自动降级）
     1) webhook：填 Cloudflare Worker 地址（见 tools/dingtalk-form-relay.js），
        可把询盘实时推到钉钉群，推荐生产使用。
     2) formSubmitEmail：填邮箱即可，FormSubmit 免费转发到邮箱，
        首次提交会收到一封确认邮件，点一下激活（只需一次）。
     3) 两者都为空：点击提交会打开访客本地邮件客户端（兜底，不会丢线索）。
     ------------------------------------------------------------ */
  inquiry: {
    webhook: "",
    // 与 Cloudflare Worker 环境变量 INQUIRY_TOKEN 保持一致（见 tools/dingtalk-form-relay.js）
    token: "",
    formSubmitEmail: "alextok200@gmail.com",
    fallbackMailto: true
  },

  // 访问统计（全部留空则不加载任何统计脚本，站点零额外请求）
  // 四种可叠加启用，ID 填一项就生效，互不干扰：
  //   goatcounter - GoatCounter sitecode（例："dai-cp"）
  //   clarity     - Microsoft Clarity project id
  //   umami       - Umami（自托管或 cloud.umami.is），填 websiteId 即生效
  //   ga4         - Google Analytics 4 measurement id（例："G-XXXXXXX"）
  analytics: {
    goatcounter: "",   // GoatCounter sitecode，例："dai-cp"
    clarity: "",        // Microsoft Clarity project id，例："abc123xyz"
    umami: {
      src: "",          // Umami 脚本地址，留空走 cloud.umami.is（推荐自托管）
      websiteId: ""     // Umami website id
    },
    ga4: ""             // Google Analytics 4 measurement id，例："G-XXXXXXX"
  },

  // 文章评论 Giscus（repoId / categoryId 留空则评论区自动隐藏）
  giscus: {
    repo: "alextok200-boop/alextok200-boop.github.io",
    repoId: "",
    category: "General",
    categoryId: "",
    lang: "zh-CN"
  }
};

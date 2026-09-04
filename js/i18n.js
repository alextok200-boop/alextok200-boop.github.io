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
    "theme.toggle": { zh: "切换明暗主题", en: "Toggle light/dark theme" },
    "logo": { zh: "DAI·CP", en: "DAI·CP" },

    // ---- 页脚 ----
    "footer.copyright": { zh: "© 2026 戴程鹏 · Powered by GitHub Pages", en: "© 2026 Dai Chengpeng · Powered by GitHub Pages" },

    // ---- 首页 hero ----
    "hero.eyebrow": { zh: "电商操盘手 · 技能包工程负责人", en: "E-commerce Operator · AI Skill Pack Engineer" },
    "hero.title1": { zh: "让电商业务", en: "Scaling e-commerce operations" },
    "hero.run": { zh: "跑得", en: "go" },
    "hero.title2": { zh: "更快、更稳、更省人", en: "Faster, Steadier, Leaner" },
    "hero.sub": { zh: "专注国内 + 跨境多平台电商操盘，覆盖 9+ 国内平台与海外多平台，用 AI 技能包把重复工作自动化，让团队把时间花在增长上。", en: "Operating multi-platform e-commerce across 9+ domestic platforms and multiple overseas marketplaces, using AI skill packs to automate repetitive work so the team can focus on growth." },
    "hero.btn1": { zh: "看作品", en: "View Work" },
    "hero.btn2": { zh: "联系我", en: "Contact" },

    // ---- 首页数据卡 ----
    "stat.team": { zh: "团队规模", en: "Team Size" },
    "stat.shops": { zh: "店铺矩阵", en: "Store Matrix" },
    "stat.skills": { zh: "AI 技能包", en: "AI Skill Packs" },

    // ---- 首页核心能力 ----
    "cap.title": { zh: "核心能力", en: "Core Capabilities" },
    "cap1.title": { zh: "电商操盘", en: "E-commerce Operations" },
    "cap1.desc": { zh: "抖音/天猫/京东/拼多多 + Amazon/TikTok 等跨境平台，国内海外 50/50 布局，年 GMV 已实现超千万美元。", en: "Douyin/Tmall/JD/PDD + Amazon/TikTok and more, 50/50 domestic & overseas, annual GMV now over USD 10 million." },
    "cap2.title": { zh: "AI 技能包工程", en: "AI Skill Pack Engineering" },
    "cap2.desc": { zh: "投流计划、达人分析、视觉生产、数据看板……把运营知识沉淀为可复用的 AI 技能，零基础同事一键使用。", en: "Ad planning, influencer analytics, visual production, dashboards... packaging operational know-how into reusable AI skills anyone can use." },
    "cap3.title": { zh: "数据驱动决策", en: "Data-Driven Decisions" },
    "cap3.desc": { zh: "ERP 数据中台、店铺看板、库存监控、低价预警，用数据代替拍脑袋。", en: "ERP data platform, store dashboards, inventory monitoring, price alerts — decisions backed by data, not gut feel." },

    // ---- 首页个人成长时间轴 ----
    "journey.title": { zh: "个人成长时间轴", en: "Growth Timeline" },
    "journey.tl1.date": { zh: "2026.06 - 至今", en: "2026.06 - Now" },
    "journey.tl1.tag": { zh: "现在", en: "Now" },
    "journey.tl1.title": { zh: "集团电商运营负责人 · 南京万世康伦体育用品有限公司", en: "Group E-commerce Ops Lead · Nanjing Wanshi Kangllen Sports Goods" },
    "journey.tl1.desc": { zh: "搭建 15 人 6 岗团队与 49 店铺矩阵，主打品牌进入亚马逊 5 站类目榜，国内海外业务向 50/50 调整。", en: "Leading multi-brand e-commerce: built a 15-person 6-role team and a 49-store matrix; flagship brands ranked on Amazon category lists across 5 marketplaces, rebalancing domestic/overseas toward 50/50." },
    "journey.tl2.date": { zh: "2018.10 - 2025.10 · 7 年", en: "2018.10 - 2025.10 · 7yrs" },
    "journey.tl2.tag": { zh: "财务与合规", en: "Finance & Compliance" },
    "journey.tl2.title": { zh: "北京亚昆科技服务有限公司 · 南京分公司负责人", en: "Beijing Yakun Tech Services Co., Ltd. · Nanjing Branch Lead" },
    "journey.tl2.desc": { zh: "运用领星跨境 ERP 为团队提供财务数据同步（FBA 库存、回款与账目统一口径），管理 5 人团队，推动月度复盘与流程标准化。", en: "Used LingXing cross-border ERP to sync financial data for the team — unified FBA stock, payments and books; led a 5-person team driving monthly reviews and standardised finance workflows." },
    "journey.tl3.date": { zh: "跨年度独立主线", en: "Cross-year track" },
    "journey.tl3.tag": { zh: "工程化", en: "Engineering" },
    "journey.tl3.title": { zh: "AI 技能包工程体系", en: "AI Skill Pack Engineering" },
    "journey.tl3.desc": { zh: "把投流、生图、达人分析、数据看板等运营知识封装为 20+ 可复用 AI 技能包，零基础同事一键使用。", en: "Packaging ad planning, imaging, influencer analytics and dashboards into 20+ reusable AI skills that non-technical teammates use with one click." },
    "journey.tl4.date": { zh: "2002 - 2018", en: "2002 - 2018" },
    "journey.tl4.tag": { zh: "积累", en: "Foundation" },
    "journey.tl4.title": { zh: "多平台电商操盘积累", en: "Multi-platform E-commerce" },
    "journey.tl4.desc": { zh: "国内兴趣电商 + 货架电商 + 跨境出海，从单店运营到多店铺矩阵。", en: "From single-store operations to a multi-store matrix across domestic interest/shelf commerce and overseas." },


    // ---- 关于页 ----
    "about.eyebrow": { zh: "Resume", en: "Resume" },
    "about.title": { zh: "个人简历", en: "Resume" },
    "about.p1": { zh: "我是戴程鹏，万世康伦（KONLLEN）集团高级运营负责人，常住江苏南京。集团电商营收中心团队 15 人以上，覆盖 49 个店铺、9+ 国内平台与多个海外平台，国内海外业务向 50/50 结构调整。", en: "I'm Dai Chengpeng, senior operations lead at KONLLEN Group, based in Nanjing, Jiangsu. Our e-commerce revenue hub team has 15+ members across 49 stores, 9+ domestic platforms and multiple overseas platforms, restructuring toward a 50/50 domestic-overseas mix." },
    "about.p2": { zh: "除了传统电商操盘，我的另一个身份是技能包全栈工程负责人——把投流、生图、达人分析、数据看板等运营知识封装成 AI 技能包，让零基础的 HR、运营同事也能一键使用。", en: "Beyond classic e-commerce operations, I'm also a full-stack engineer of AI skill packs — packaging ad planning, image generation, influencer analytics and dashboards into skills that even non-technical colleagues can use with one click." },
    "about.timeline": { zh: "工作经历", en: "Experience" },
    "about.tl1.date": { zh: "2026", en: "2026" },
    "about.tl1.title": { zh: "集团电商运营负责人", en: "Group E-commerce Operations Lead" },
    "about.tl1.desc": { zh: "负责多品牌电商业务，主打品牌进入亚马逊 5 站类目榜；搭建团队与店铺矩阵，国内海外双线推进。", en: "Leading multi-brand e-commerce with flagship brands on Amazon category lists across 5 marketplaces; built the team and store matrix across domestic and overseas tracks." },
    "about.tl2.date": { zh: "2025", en: "2025" },
    "about.tl2.title": { zh: "技能包工程体系搭建", en: "AI Skill Pack System" },
    "about.tl2.desc": { zh: "建立 WorkBuddy 业务技能矩阵，交付投流/生图/看板/OA 审批等 20+ 技能包。", en: "Built the WorkBuddy skill matrix, delivering 20+ packs for ads, imaging, dashboards and OA approvals." },
    "about.tl3.date": { zh: "更早", en: "Earlier" },
    "about.tl3.title": { zh: "多平台电商操盘积累", en: "Multi-platform E-commerce" },
    "about.tl3.desc": { zh: "国内兴趣电商 + 货架电商 + 跨境出海，从单店运营到多店铺矩阵。", en: "From single-store operations to a brand matrix across domestic interest/shelf commerce and overseas." },

    "about.sub": { zh: "电商操盘 × 团队体系 × AI 技能包工程 —— 能用数字对账的落地者。", en: "E-commerce operations × team building × AI skill-pack engineering — a builder whose numbers reconcile." },
    "resume.title": { zh: "电商操盘手 · 团队体系搭建 · AI 技能包工程负责人", en: "E-commerce Operator · Team Builder · AI Skill-pack Engineer" },
    "resume.base": { zh: "深圳 / 南京", en: "Shenzhen / Nanjing" },
    "resume.brief": { zh: "集团电商负责人：管理 15 人 6 岗团队与 49 家店铺矩阵，国内 9+ 平台与海外多平台双线推进，推动业务结构向国内海外 50/50 调整。另一条主线是把运营知识工程化——沉淀为 20+ 可复用的 AI 技能包（投流、视觉、看板、审批自动化、内容生产），让零基础同事一键使用。", en: "Leads e-commerce for the group: a 15-person, 6-role team across a 49-store matrix spanning 9+ domestic platforms and multiple overseas marketplaces, pushing the mix toward a 50/50 domestic-overseas split. A parallel track: engineering operational know-how into 20+ reusable AI skill packs — ads, visuals, dashboards, approval automation, content — usable by non-technical teammates with one click." },
    "resume.s1": { zh: "店铺矩阵", en: "Store Matrix" },
    "resume.s2": { zh: "团队规模 · 6 岗", en: "Team · 6 Roles" },
    "resume.s3": { zh: "AI 技能包", en: "AI Skill Packs" },
    "resume.s4": { zh: "国内平台", en: "Domestic Platforms" },
    "resume.s5": { zh: "亚马逊站点类目榜", en: "Amazon Category Lists" },
    "resume.j1.title": { zh: "万世康伦（KONLLEN）集团 · 南京万世康伦体育用品有限公司 · 电商运营负责人", en: "KONLLEN Group · Nanjing Wanshi Kangllen Sports Goods · E-commerce Operations Lead" },
    "resume.j1.p1": { zh: "搭建并管理电商团队：15 人、6 岗体系，配套岗位说明书与绩效考核标准", en: "Built and run an e-commerce team: 15 people across 6 roles, with job descriptions and performance standards." },
    "resume.j1.p2": { zh: "49 家店铺矩阵：覆盖国内 9+ 平台与海外多平台，推动国内外业务向 50/50 调整", en: "49-store matrix across 9+ domestic platforms and multiple overseas marketplaces, rebalancing toward 50/50." },
    "resume.j1.p3": { zh: "主打品牌进入亚马逊 5 站类目榜（日本 #5 / 德国 #8 / 美国 #11 / 加拿大 #11）", en: "Flagship brands on Amazon category lists across 5 marketplaces (JP #5 / DE #8 / US #11 / CA #11)." },
    "resume.j1.p4": { zh: "主导数据中台 / 财务 Agent / 审批自动化等工程化项目，用工具沉淀运营能力", en: "Led engineering projects — data platform, finance agent, approval automation — encoding operations into tooling." },
    "resume.j2.title": { zh: "北京亚昆科技服务有限公司 · 南京分公司负责人", en: "Beijing Yakun Tech Services Co., Ltd. · Nanjing Branch Lead" },
    "resume.j2.p1": { zh: "运用领星跨境 ERP 为团队提供财务数据同步：FBA 库存、回款与账目统一口径，2018.10 - 2025.10 共 7 年", en: "Used LingXing cross-border ERP to sync financial data for the team — unified FBA stock, payments and books; 2018.10 - 2025.10 (7 years)." },
    "resume.j2.p2": { zh: "管理 5 人团队，推动月度复盘、KPI 同步与财务流程标准化", en: "Led a 5-person team; drove monthly reviews, KPI sync and standardised finance workflows." },
    "resume.j2.p3": { zh: "沉淀 IFC 0-1 流程设计与零基础可读 SOP 能力，为后续电商与技能包主线打底", en: "Built IFC 0-1 process design and non-engineer-readable SOPs — foundation for later e-commerce and skill-pack tracks." },
    "resume.j3.title": { zh: "AI 技能包工程体系 · 跨年度独立主线", en: "AI Skill-pack Engineering · Cross-year Independent Track" },
    "resume.j3.p1": { zh: "20+ 可复用技能包：投流计划与审核、视觉生产、数据看板、OA 审批、视频脚本等", en: "20+ reusable skill packs: ad planning & review, visual production, dashboards, OA approvals, video scripts." },
    "resume.j3.p2": { zh: "流水线化交付：分层开发 → 独立审计 → 版本化打包 → 按阶段回滚", en: "Pipeline delivery: layered dev → independent audit → versioned packaging → staged rollback." },
    "resume.j3.p3": { zh: "通用母版 + 业务分支双轨，既跨项目复用，又隔离业务敏感逻辑", en: "Generic template + business branch dual-track: reusable across projects while isolating sensitive logic." },
    "resume.j4.title": { zh: "多平台电商操盘积累 · 2002 - 2018", en: "Multi-platform E-commerce Track · 2002 - 2018" },
    "resume.j4.p1": { zh: "国内兴趣电商 + 货架电商 + 跨境出海，从单店运营到多店铺矩阵", en: "Interest + shelf e-commerce domestically, going global; scaled from single stores to a multi-store matrix." },
    "resume.j4.p2": { zh: "经营数据中台：国内 ERP + 跨境财务双源，统一口径辅助决策", en: "Operational data platform combining domestic ERP and cross-border finance sources with reconciled metrics." },
    "resume.skills.title": { zh: "核心能力", en: "Core Skills" },
    "resume.sk.1": { zh: "电商操盘（国内 + 跨境）", en: "E-commerce Ops (CN + Global)" },
    "resume.sk.2": { zh: "团队体系与绩效搭建", en: "Team & Performance Systems" },
    "resume.sk.3": { zh: "AI 技能包工程", en: "AI Skill-pack Engineering" },
    "resume.sk.4": { zh: "数据中台（Flask · ECharts · SQLite）", en: "Data Platform (Flask · ECharts · SQLite)" },
    "resume.sk.5": { zh: "ERP 数据对接", en: "ERP Data Integration" },
    "resume.sk.6": { zh: "投放计划与审核", en: "Ad Planning & Review" },
    "resume.sk.7": { zh: "视觉与内容生产管线", en: "Visual & Content Pipelines" },
    "resume.sk.8": { zh: "流程自动化（审批 · 看板推送）", en: "Process Automation (OA · Dashboards)" },
    "resume.sk.9": { zh: "双语运营（中 / 英）", en: "Bilingual (ZH / EN)" },
    "resume.sk.10": { zh: "普通话甲级", en: "Mandarin (Grade A)" },
    "resume.sk.11": { zh: "海关报关与国际贸易", en: "Customs Declaration & International Trade" },
    "resume.education.title": { zh: "教育背景", en: "Education" },
    "resume.edu.1.school": { zh: "金陵科技学院", en: "Jinling Institute of Technology" },
    "resume.edu.1.degree": { zh: "大专 · 海关与国际物流", en: "Junior College · Customs Declaration & International Transportation" },
    "resume.edu.2.school": { zh: "南京理工大学", en: "Nanjing University of Science and Technology" },
    "resume.edu.2.degree": { zh: "本科 · 计算机网络信息管理", en: "Bachelor · Computer Network Information Management" },
    "resume.certs.title": { zh: "证书 · 驾照", en: "Certifications · License" },
    "resume.cert.1": { zh: "C1 驾照", en: "C1 Driver's License" },
    "resume.cert.2": { zh: "计算机二级", en: "Computer Level 2 Certificate" },
    "resume.note": { zh: "v1.7.2 已同步双语简历 v1.0.0：补全工作年限 27 年、前司时间线 2018.10 - 2025.10、学历与证书字段；邮箱显示已对齐公开联系邮箱（表单转发仍走站内邮箱）。", en: "v1.7.2 synced with bilingual resume v1.0.0: added 27-year tenure, 2018.10 - 2025.10 prior role timeline, education and certifications; public contact email updated (form forwarding still uses the on-site inbox)." },
    'resume.related': { zh: '延伸阅读：通用型方法论手册 —— 换项目、换业务线都能直接套用的组织能力沉淀。', en: 'Related: Generic Methodology Handbook — reusable organizational leverage across projects and lines of business.' },

    // ---- 作品集页 ----
    "work.eyebrow": { zh: "Work", en: "Work" },
    "work.title": { zh: "作品集", en: "Portfolio" },
    "work.sub": { zh: "从操盘到工程，从店铺到中台——这些年落地的代表项目。", en: "From operations to engineering, from stores to platforms — representative projects." },
    "work.w1.title": { zh: "品牌电商运营体系", en: "Brand E-commerce Operations" },
    "work.w1.desc": { zh: "多品牌进入亚马逊 5 站类目榜，国内 9+ 平台店铺矩阵。从单品到矩阵的运营操盘。", en: "Dual brands ranked on Amazon across 5 marketplaces, 9+ domestic platform stores. From single products to a brand matrix." },
    "work.w2.title": { zh: "数据中台与自动化看板", en: "Data Platform & Auto Dashboards" },
    "work.w2.desc": { zh: "聚水潭库存看板、店铺每日数据看板、AI Agent 监控仪表盘——用数据替代拍脑袋。", en: "Jushuitan inventory board, daily store dashboards, AI agent monitoring — data over gut feel." },
    "work.w3.title": { zh: "投流计划生成与审核", en: "Ad Plan Generation & Audit" },
    "work.w3.desc": { zh: "台球专版投流生成器 + 7 维审核器 + 执行方案，覆盖 12 个投放平台，扫描需求自动出计划。", en: "Billiards-specific ad generator + 7-dimension auditor + execution plans across 12 platforms." },
    "work.w4.title": { zh: "Agent 技能中台", en: "Agent Skill Platform" },
    "work.w4.desc": { zh: "五层架构业务 Agent：整合 10 个 Skill、10 项自动化、监控仪表盘与 API 扩展框架。", en: "5-layer brand agent: 10 skills, 10 automations, monitoring dashboard and API framework." },
    "work.w5.title": { zh: "AI 视觉生产", en: "AI Visual Production" },
    "work.w5.desc": { zh: "Agnes 视觉生产管线：批量生图、PSD 素材包、钉钉流转，统一输出品牌视觉规范。", en: "Agnes visual production pipeline: batch imaging, PSD asset packs, DingTalk workflow, with unified brand visual standards." },
    "work.w6.title": { zh: "品牌官网建设", en: "Brand Website" },
    "work.w6.desc": { zh: "霓虹暗黑潮牌风格静态站点，产品图逐张替换为真实产品照，已上线可访问。", en: "Neon-dark street-style static site with real product photos, live and accessible." },
    "work.pending": { zh: "案例截图补充中", en: "Screenshots coming soon" },

    // ---- 博客页 ----
    "blog.eyebrow": { zh: "Blog", en: "Blog" },
    "blog.title": { zh: "博客", en: "Blog" },
    "blog.sub": { zh: "电商操盘与 AI 技能包的实战记录。", en: "Notes on brand e-commerce and AI skill packs." },
    "blog.search": { zh: "搜索文章关键词…", en: "Search articles..." },
    "blog.all": { zh: "全部", en: "All" },
    "blog.empty": { zh: "没有找到匹配的文章。", en: "No matching articles found." },
    "blog.count": { zh: "共 {n} 篇", en: "{n} articles" },
    "blog.views": { zh: "阅读 {n}", en: "{n} views" },
    "blog.readmore": { zh: "阅读全文", en: "Read more" },

    // ---- Newsletter 订阅 ----
    "newsletter.title": { zh: "订阅博客更新", en: "Subscribe to Updates" },
    "newsletter.sub": { zh: "新文章、复盘与实战记录，第一时间送达邮箱。", en: "New articles, postmortems and field notes delivered straight to your inbox." },
    "newsletter.ph": { zh: "你的邮箱地址", en: "Your email address" },
    "newsletter.send": { zh: "订阅", en: "Subscribe" },
    "newsletter.success": { zh: "订阅成功！新文章会通过邮件通知你。", en: "Subscribed! You'll get an email when new articles drop." },
    "newsletter.err.email": { zh: "请填写有效邮箱", en: "Please enter a valid email" },
    "newsletter.cooldown": { zh: "刚刚已订阅，请稍候再试", en: "Just subscribed, please wait a moment" },
    "newsletter.nochannel": { zh: "暂未配置订阅通道，请直接发邮件联系。", en: "Subscription channel not configured — please email me directly." },
    "newsletter.fail": { zh: "提交失败，请直接发邮件到 {mail}", en: "Submission failed. Please email me at {mail}" },
    "newsletter.privacy": { zh: "只用于订阅通知，不对外共享、不做营销推送。", en: "Used only for subscription notifications. Never shared, never used for marketing." },

    // ---- 联系页 ----
    "contact.eyebrow": { zh: "Contact", en: "Contact" },
    "contact.title": { zh: "联系我", en: "Contact Me" },
    "contact.info.title": { zh: "合作与交流", en: "Collaboration & Exchange" },
    "contact.info.desc": { zh: "电商操盘咨询、AI 技能包合作、行业交流，欢迎联系。", en: "Brand e-commerce consulting, AI skill pack cooperation, industry exchange — reach out." },
    "contact.email": { zh: "邮箱", en: "Email" },
    "contact.github": { zh: "GitHub", en: "GitHub" },
    "contact.form.name": { zh: "称呼", en: "Name" },
    "contact.form.name.ph": { zh: "怎么称呼你", en: "Your name" },
    "contact.form.email": { zh: "邮箱", en: "Email" },
    "contact.form.email.ph": { zh: "你的邮箱", en: "Your email" },
    "contact.form.msg": { zh: "内容", en: "Message" },
    "contact.form.msg.ph": { zh: "想聊什么", en: "What's on your mind" },
    "contact.form.send": { zh: "发送", en: "Send" },

    // ---- 文章页公共 ----
    "post.back": { zh: "← 返回博客", en: "← Back to blog" },
    "post.toc": { zh: "目录", en: "Contents" },
    "post.prev": { zh: "← 上一篇", en: "← Previous" },
    "post.next": { zh: "下一篇 →", en: "Next →" },
    "post.related": { zh: "相关阅读", en: "Related" },

    // ---- 页脚 ----
    "footer.rss": { zh: "RSS 订阅", en: "RSS" },
    "offline.tip": { zh: "当前离线，正在显示缓存内容", en: "You're offline — showing cached content" },
    "comments.title": { zh: "评论", en: "Comments" },

    // ---- 新导航 ----
    "nav.projects": { zh: "项目经历", en: "Projects" },
    "nav.methods": { zh: "方法论", en: "Methods" },
    "nav.results": { zh: "成绩单", en: "Results" },
    "nav.careers": { zh: "加入我们", en: "Careers" },

    // ---- 联系页 ----
    "contact.sub": { zh: "项目合作、电商操盘咨询、AI 技能包合作，或只是聊聊行业——都可以从这里开始。", en: "Project collaboration, e-commerce consulting, AI skill pack projects — or just a chat about the industry. Start here." },
    "contact.response": { zh: "响应", en: "Response" },
    "contact.response.val": { zh: "1-2 个工作日内回复 · 正式合作走 OA 审批留痕", en: "Reply within 1-2 business days · formal deals logged via OA approval" },
    "contact.vcard": { zh: "保存电子名片", en: "Save Contact Card" },
    "contact.qr.todo": { zh: "微信二维码待补充", en: "WeChat QR pending" },
    "contact.qr.caption": { zh: "扫码加微信，备注来意", en: "Scan to add me on WeChat" },
    "contact.form.title": { zh: "合作咨询", en: "Partnership Inquiry" },
    "contact.form.company": { zh: "公司 / 渠道", en: "Company / Channel" },
    "contact.form.company.ph": { zh: "公司与主营渠道（选填）", en: "Company & main channel (optional)" },
    "contact.form.intent": { zh: "合作意向", en: "Inquiry Type" },
    "contact.form.privacy": { zh: "信息仅用于本次沟通，不对外共享、不做营销推送。", en: "Used only for this conversation. Never shared, never used for marketing." },
    "opt.b2b": { zh: "项目合作", en: "Project Collaboration" },
    "opt.brand": { zh: "项目 / 业务合作", en: "Project / Business" },
    "opt.skill": { zh: "AI 技能包合作", en: "AI Skill Pack" },
    "opt.consult": { zh: "咨询 / 培训", en: "Consulting / Training" },
    "opt.job": { zh: "应聘", en: "Job Application" },
    "opt.other": { zh: "其他", en: "Other" },

    // ---- 表单状态提示 ----
    "inquiry.err.name": { zh: "请填写称呼", en: "Please enter your name" },
    "inquiry.err.email": { zh: "请填写有效邮箱，方便回复你", en: "Please enter a valid email so I can reply" },
    "inquiry.err.msg": { zh: "内容请至少 10 个字，方便我判断需求", en: "Please write at least 10 characters" },
    "inquiry.sending": { zh: "提交中…", en: "Sending…" },
    "inquiry.success": { zh: "已收到，我会在 1-2 个工作日内回复你。", en: "Got it — I'll reply within 1-2 business days." },
    "inquiry.fail": { zh: "提交失败，请直接发邮件到 {mail}", en: "Submission failed. Please email {mail} directly." },
    "inquiry.mailto": { zh: "正在打开你的邮件客户端…", en: "Opening your mail client…" },
    "inquiry.cooldown": { zh: "刚刚已提交，请稍候再试", en: "Just submitted — please wait a moment" },
    "inquiry.nochannel": { zh: "暂未配置提交通道，请直接发邮件联系。", en: "No submission channel configured yet. Please email directly." },


    // ---- 成绩单页 ----
    "ach.eyebrow": { zh: "Results", en: "Results" },
    "ach.title": { zh: "成绩单", en: "Results" },
    "ach.sub": { zh: "只列能对账的数字：规模、排名、覆盖与沉淀。口径与集团内部统计一致。", en: "Only numbers that reconcile: scale, rankings, coverage, assets. Same basis as internal group reporting." },
    "ach.numbers": { zh: "核心数字", en: "Key Numbers" },
    "ach.gmv": { zh: "年 GMV（已实现）", en: "Annual GMV (achieved)" },
    "ach.gmv.note": { zh: "国内 + 海外合计，年度口径", en: "Domestic + overseas, annual basis" },
    "ach.stores": { zh: "店铺矩阵", en: "Store Matrix" },
    "ach.stores.note": { zh: "9+ 国内平台 + 多个海外平台", en: "9+ domestic platforms + multiple overseas" },
    "ach.brands": { zh: "多品牌运营", en: "Multi-brand Operations" },
    "ach.brands.note": { zh: "多品牌并行运营，覆盖不同价格带与人群", en: "Billiards, spanning multiple price tiers" },
    "ach.amazon": { zh: "亚马逊站点类目榜", en: "Amazon Category Rankings" },
    "ach.amazon.note": { zh: "日本 #5 / 德国 #8 · 美国 #11 / 加拿大 #11", en: "JP #5 / DE #8 / US #11 / CA #11" },
    "ach.skills": { zh: "AI 技能包", en: "AI Skill Packs" },
    "ach.skills.note": { zh: "投流 / 生图 / 看板 / 审批 / 脚本", en: "Ads / imaging / dashboards / approvals / scripts" },
    "ach.team": { zh: "团队规模", en: "Team Size" },
    "ach.team.note": { zh: "6 岗体系：平台 / 内容 / 客服 / 仓储 / 数据 / 行政", en: "Six functions: platform / content / service / warehouse / data / admin" },
    "ach.platforms": { zh: "平台覆盖", en: "Platform Coverage" },
    "ach.domestic": { zh: "国内", en: "Domestic" },
    "ach.overseas": { zh: "海外", en: "Overseas" },
    "ach.private": { zh: "私域", en: "Private domain" },
    "ach.dtc": { zh: "独立站", en: "DTC site" },
    "ach.timeline": { zh: "关键节点", en: "Milestones" },
    "ach.t1.date": { zh: "2026", en: "2026" },
    "ach.t1.title": { zh: "多品牌进入亚马逊 5 站类目榜", en: "Multiple brands ranked on Amazon across 5 marketplaces" },
    "ach.t1.desc": { zh: "日本站 #5、德国站 #8；美国站 #11、加拿大站 #11。海外多站点运营常态化推进。", en: "JP #5, DE #8, US #11 and CA #11. Multi-marketplace overseas operations running as business as usual." },
    "ach.t2.date": { zh: "2026", en: "2026" },
    "ach.t2.title": { zh: "年 GMV 突破千万美元", en: "Annual GMV passed USD 10 million" },
    "ach.t2.desc": { zh: "国内与海外业务向 50/50 结构调整，49 个店铺分布在 9+ 国内平台与多个海外平台。", en: "Restructuring toward a 50/50 domestic-overseas mix, with 49 stores across 9+ domestic and multiple overseas platforms." },
    "ach.t3.date": { zh: "2026", en: "2026" },
    "ach.t3.title": { zh: "AI 技能包体系成型", en: "AI skill pack system took shape" },
    "ach.t3.desc": { zh: "把投流审核、视觉生产、数据看板、OA 审批等沉淀为 20+ 可复用技能包，零基础同事一键使用。", en: "Ad review, visual production, dashboards and OA approvals packaged into 20+ reusable skills anyone can run with one click." },
    "ach.shots.todo": { zh: "类目榜 / 后台数据截图待补充", en: "Ranking / backend screenshots pending" },
    "ach.shots.caption": { zh: "补图后此处展示亚马逊类目榜与后台数据截图（assets/img/ 目录）", en: "Amazon rankings and backend screenshots will show here once added to assets/img/" },
    "ach.cta": { zh: "聊聊合作", en: "Talk Partnership" },
    "ach.hint": { zh: "数据口径以集团内部统计为准 · 对外披露以审批版本为准", en: "Figures follow internal group reporting · external disclosure follows the approved version" },

    // ---- 招聘页 ----
    "careers.eyebrow": { zh: "Careers", en: "Careers" },
    "careers.title": { zh: "加入我们", en: "Join Us" },
    "careers.sub": { zh: "15 人电商团队、49 个店铺、国内海外双线。这里不缺舞台，缺的是能把事做成的人。", en: "A 15-person team, 49 stores, 9 brands, domestic and overseas tracks. There's no shortage of stage here — only of people who get things done." },
    "careers.why": { zh: "为什么是我们", en: "Why Us" },
    "careers.why1.t": { zh: "真·多平台战场", en: "A real multi-platform battlefield" },
    "careers.why1.d": { zh: "国内 9+ 平台、海外 Amazon / Temu / TikTok Shop / 独立站，一个团队跑通两条增长曲线。", en: "9+ domestic platforms plus Amazon, Temu, TikTok Shop and DTC — one team running two growth curves." },
    "careers.why2.t": { zh: "AI 先行的团队", en: "An AI-first team" },
    "careers.why2.d": { zh: "20+ 技能包把重复劳动自动化，你带来的方法论也会被沉淀成技能包，团队一起复用。", en: "20+ skill packs automate the grunt work, and your playbook gets packaged too, so the whole team reuses it." },
    "careers.why3.t": { zh: "数据说了算", en: "Data has the final word" },
    "careers.why3.d": { zh: "看板、库存监控、价格预警都是现成的，决策不看资历看数字，试错成本团队扛。", en: "Dashboards, inventory monitoring and price alerts are already in place. Decisions follow numbers, not seniority." },
    "careers.open": { zh: "在招岗位", en: "Open Roles" },






































































    "job.report": { zh: "汇报对象", en: "Reports to" },
    "job.code": { zh: "岗位编码", en: "Job code" },
    "job.kpi": { zh: "考核口径（KPI）", en: "How you'll be measured (KPI)" },
    "job.sys": { zh: "常用系统", en: "Systems you'll use" },
    "job.red": { zh: "红线（一票否决）", en: "Red lines (auto-reject)" },
    "job1.title": { zh: "TK 跨境直播运营", en: "TikTok Cross-border Live Operations" },
    "job1.loc": { zh: "南京（江苏）· 深圳可选", en: "Nanjing (Jiangsu) · Shenzhen optional" },
    "job1.type": { zh: "全职", en: "Full-time" },
    "job1.dept": { zh: "跨境电商", en: "Cross-border E-commerce" },
    "job1.report.val": { zh: "跨境负责人 / 平台负责人", en: "Cross-border Lead / Platform Lead" },
    "job1.desc": { zh: "负责 TikTok Shop 小店运营，以短视频挂车 + 直播场控 + 达人联盟驱动 GMV，对店铺 GMV、直播间转化与联盟 ROI 负责。", en: "Own TikTok Shop operations — short-video tagging, live-room floor control and creator affiliate — accountable for shop GMV, live conversion and affiliate ROI." },
    "job1.d1": { zh: "短视频：挂车选品与转化，维护内容日历", en: "Short video: product tagging and conversion, maintain the content calendar" },
    "job1.d2": { zh: "直播：小店直播排期与场控，输出直播表", en: "Live: shop live scheduling and floor control, maintain the live calendar" },
    "job1.d3": { zh: "联盟：达人联盟带货与佣金管理，维护联盟台账", en: "Affiliate: creator partnership and commission management, maintain the affiliate ledger" },
    "job1.d4": { zh: "投流：Shop Ads 计划搭建与 ROI 优化，维护投流台账", en: "Ads: build Shop Ads campaigns and optimise ROI, maintain the spend ledger" },
    "job1.d5": { zh: "数据：罗盘复盘与优化，输出周报与下一步动作", en: "Data: review via analytics dashboard, ship weekly reports with next actions" },
    "job1.r1": { zh: "大专及以上，电子商务 / 市场营销优先", en: "College degree or above; e-commerce / marketing preferred" },
    "job1.r2": { zh: "2 年以上 TikTok Shop 或抖音直播运营经验，有台球 / 运动器材类目优先", en: "2+ years on TikTok Shop or Douyin live operations; billiards / sports equipment category a plus" },
    "job1.r3": { zh: "熟悉平台规则、流量与转化逻辑，英语能支撑基础商务沟通", en: "Solid grasp of platform rules, traffic and conversion logic; English sufficient for business communication" },
    "job1.r4": { zh: "会搭投放计划、控 ROI，能看懂转化漏斗并据此调整动作", en: "Can build ad campaigns and control ROI; reads the conversion funnel and acts on it" },
    "job1.r5": { zh: "数据敏感、执行强、抗压，能接受直播排班（晚间场次）", en: "Data-sensitive, strong execution, resilient; open to live-stream shifts (evening slots)" },
    "job1.k1": { zh: "GMV 达成率", en: "GMV attainment" },
    "job1.k2": { zh: "直播间转化", en: "Live-room conversion" },
    "job1.k3": { zh: "短视频转化", en: "Short-video conversion" },
    "job1.k4": { zh: "联盟 ROI", en: "Affiliate ROI" },
    "job1.k5": { zh: "店铺评分", en: "Shop rating" },
    "job1.sys.val": { zh: "TikTok Shop 后台（短视频 / 直播 / 联盟 / Shop Ads）", en: "TikTok Shop Seller Center (video / live / affiliate / Shop Ads)" },
    "job1.plus": { zh: "加分项：台球 / 运动器材类目经验、现有海外达人资源、基础剪辑、小语种（日 / 德）。", en: "Bonus: billiards / sports category experience, existing overseas creator network, basic video editing, extra language (JP / DE)." },
    "job1.red.val": { zh: "虚假宣传 / 绝对化用语 / 刷量刷单 / 违规带货 / 侵权仿牌", en: "False advertising, superlative claims, fake orders or traffic, non-compliant selling, counterfeit or IP infringement" },
    "job2.title": { zh: "跨境电商运营（Lazada / Shopee 东南亚）", en: "Cross-border E-commerce Operator (Lazada / Shopee SEA)" },
    "job2.loc": { zh: "南通（跨境主阵地）· 南京", en: "Nantong (cross-border hub) · Nanjing" },
    "job2.type": { zh: "全职", en: "Full-time" },
    "job2.dept": { zh: "跨境电商", en: "Cross-border E-commerce" },
    "job2.report.val": { zh: "跨境负责人 / 平台负责人", en: "Cross-border Lead / Platform Lead" },
    "job2.desc": { zh: "负责 Lazada / Shopee 东南亚站点从 0 起盘：开店合规 → 本地化选品上架 → 站内活动与大促 → 履约与评分，对站点 GMV、店铺评分与履约 SLA 负责。该岗位为储备状态，站点开通时开放，可先投简历进入人才池。", en: "Own the Lazada / Shopee SEA build-out from zero: onboarding compliance, localised listing, in-platform campaigns and mega-sales, fulfilment and ratings. Accountable for site GMV, shop rating and fulfilment SLA. Currently a talent-pool role: send your CV and we'll reach out when the sites go live." },
    "job2.d1": { zh: "起盘：站点开通与资质合规（执照 / 类目准入 / 税务与清关资料），按站点逐一落地", en: "Build-out: site onboarding and compliance (licence, category approval, tax and customs docs), rolled out site by site" },
    "job2.d2": { zh: "本地化：标题 / 主图 / 详情的多语种与币种本地化，维护 Listing 表与本地词库", en: "Localisation: multilingual and multi-currency titles, images and detail pages; maintain the listing sheet and local keyword bank" },
    "job2.d3": { zh: "选品：按站点需求选品与定价，算清头程 / 佣金 / 关税 / 汇率后的到手毛利", en: "Assortment: site-fit selection and pricing, with landed margin worked out after freight, commission, duty and FX" },
    "job2.d4": { zh: "活动：报名大促（9.9 / 10.10 / 11.11 / 12.12）与站内资源位，控折扣与毛利", en: "Campaigns: enter mega-sales (9.9 / 10.10 / 11.11 / 12.12) and in-platform placements; control discounting and margin" },
    "job2.d5": { zh: "履约与评分：发货时效、物流轨迹与售后响应，店铺评分与罚款项清零", en: "Fulfilment and ratings: dispatch SLAs, tracking and after-sales response; keep shop ratings up and penalties at zero" },
    "job2.d6": { zh: "竞品与复盘：维护五站竞品台账（销量 / 价格 / 评价 / 流量），输出周报与下一步动作", en: "Competitive review: maintain the five-site competitor ledger (sales / price / reviews / traffic), ship weekly reports with next actions" },
    "job2.r1": { zh: "大专及以上，电子商务 / 国际贸易 / 市场营销优先", en: "College degree or above; e-commerce / international trade / marketing preferred" },
    "job2.r2": { zh: "1 年以上 Lazada 或 Shopee 运营经验，有东南亚站点从 0 起盘经历优先", en: "1+ year on Lazada or Shopee; having launched a SEA site from zero is a strong plus" },
    "job2.r3": { zh: "熟悉东南亚市场差异：站点规则、币种与物流方案、大促节奏、消费习惯", en: "Knows how SEA markets differ: site rules, currency and logistics options, mega-sale cadence, buying habits" },
    "job2.r4": { zh: "会算跨境成本与到手毛利，能做本地化定价，不靠拍脑袋报价", en: "Can work landed cost and margin properly, price per market, and never quotes off the top of their head" },
    "job2.r5": { zh: "数据敏感、执行强，能自己搭表维护竞品与 Listing；英语可支撑商务沟通", en: "Data-sensitive and hands-on; builds their own sheets for listings and competitors; English sufficient for business communication" },
    "job2.k1": { zh: "新站起盘进度（开店 / 上架 / 首单）", en: "Site launch progress (onboarding / listing / first order)" },
    "job2.k2": { zh: "GMV 达成率", en: "GMV attainment" },
    "job2.k3": { zh: "店铺评分与履约 SLA", en: "Shop rating and fulfilment SLA" },
    "job2.k4": { zh: "竞品与选品台账质量", en: "Competitor and assortment ledger quality" },
    "job2.k5": { zh: "活动投产 ROI", en: "Campaign ROI" },
    "job2.sys.val": { zh: "Lazada Seller Center、Shopee 卖家中心（菲 / 马 / 泰 / 墨 / 阿）、lazada-data 与 shopee-data 看板、shopee-competitor-analysis 竞品台账", en: "Lazada Seller Center, Shopee Seller Centre (PH / MY / TH / MX / AR), lazada-data and shopee-data dashboards, shopee-competitor-analysis ledger" },
    "job2.plus": { zh: "加分项：泰语 / 马来语 / 印尼语 / 西语能力、东南亚海外仓或本地物流资源、台球 / 运动器材类目经验、跨境清关实操。", en: "Bonus: Thai / Malay / Indonesian / Spanish, SEA warehouse or local logistics resources, billiards or sports category experience, hands-on customs clearance." },
    "job2.red.val": { zh: "刷单刷评 / 侵权仿牌 / 虚假发货 / 恶意低价扰乱 / 用爬虫或自动化脚本违规采集平台数据", en: "Fake orders or reviews, counterfeit or IP infringement, fake shipping, malicious underpricing, scraping platform data with bots or automation" },
    "job3.title": { zh: "运营自动化 / AI 技能包工程", en: "Ops Automation / AI Skill Pack Engineering" },
    "job3.loc": { zh: "远程协作 · 南京", en: "Remote · Nanjing" },
    "job3.type": { zh: "全职 / 兼职", en: "Full-time / Part-time" },
    "job3.dept": { zh: "数据与增长（技术中台）", en: "Data & Growth (Tech Platform)" },
    "job3.report.val": { zh: "技术负责人 / 副总", en: "Tech Lead / VP" },
    "job3.desc": { zh: "技术 / 数据中台支撑岗。打通各平台 API → 沉淀数据底座 → 运维服务器 → 迭代 AI 需求，把投流审核、视觉生产、数据看板、OA 审批这类重复工作封装成可安装的 AI 技能包，交付给零基础同事使用。", en: "A tech / data-platform role. Wire up platform APIs, build the data foundation, run the servers, ship AI requests — turning repeated work (ad review, asset production, dashboards, OA approvals) into installable AI skill packs that non-technical colleagues can use." },
    "job3.d1": { zh: "API 打通：京东 / 天猫 / 抖音 / 拼多多 + Amazon / Shopify / Temu / 阿里国际站，建自动拉取与鉴权维护", en: "API integration: JD / Tmall / Douyin / PDD + Amazon / Shopify / Temu / Alibaba.com, with automated pulls and credential rotation" },
    "job3.d2": { zh: "数据底座：聚水潭 / 领星 / 钉钉多维表等异构数据归一化，统一指标口径与质量校验", en: "Data foundation: normalise Jushuitan / Lingxing / DingTalk tables, unify metric definitions and data quality checks" },
    "job3.d3": { zh: "AI 需求迭代：技能包开发（SKILL.md + run.py）、安全审计与 SHA 校验、语义化版本发布与回滚", en: "AI delivery: build skill packs (SKILL.md + run.py), security audit with SHA checks, semantic versioning and rollback" },
    "job3.d4": { zh: "服务器部署：云主机 / 容器环境搭建、应用发布与反向代理、公网暴露", en: "Deployment: cloud host / container setup, app release and reverse proxy, public exposure" },
    "job3.d5": { zh: "日常运维：监控告警、定期备份与恢复演练、日志巡检、安全加固", en: "Ops: monitoring and alerting, scheduled backup and restore drills, log patrol, security hardening" },
    "job3.r1": { zh: "大专及以上，统计 / 计算机 / 电商数据相关优先", en: "College degree or above; statistics / CS / e-commerce data background preferred" },
    "job3.r2": { zh: "2 年以上电商数据分析、投流或自动化工程经验", en: "2+ years in e-commerce data analysis, ad operations or automation engineering" },
    "job3.r3": { zh: "熟悉电商指标体、投放逻辑与 SQL / 表处理，能用 Python 或 Node 写脚本", en: "Fluent in e-commerce metrics, ad logic and SQL / spreadsheets; can script in Python or Node" },
    "job3.r4": { zh: "做过看板类应用（如 Flask API + ECharts + SQLite）或同等项目", en: "Has shipped dashboard-grade apps (e.g. Flask API + ECharts + SQLite) or equivalent" },
    "job3.r5": { zh: "逻辑清晰、有工作流洁癖，能把模糊需求拆成可交付的小步", en: "Clear logic and a workflow perfectionist — breaks vague requests into shippable steps" },
    "job3.k1": { zh: "各平台 API 打通", en: "Platform API integration" },
    "job3.k2": { zh: "AI 需求升级迭代", en: "AI delivery iteration" },
    "job3.k3": { zh: "数据底座维护", en: "Data foundation upkeep" },
    "job3.k4": { zh: "服务器部署能力", en: "Server deployment" },
    "job3.k5": { zh: "服务器日常维护", en: "Server maintenance" },
    "job3.sys.val": { zh: "ai-cockpit 看板、生意参谋、京东商智、蝉妈妈、各平台投流后台、billiards-trend-intel", en: "ai-cockpit dashboard, SYCM, JD Shangzhi, Chanmama, platform ad consoles, billiards-trend-intel" },
    "job3.plus": { zh: "加分项：有已发布的可安装技能包作品、熟悉钉钉 / DWS / Aitable 开放平台、做过 OCR 或图像链路。", en: "Bonus: published installable skill packs, familiar with DingTalk / DWS / Aitable open platforms, OCR or imaging pipelines." },
    "job3.red.val": { zh: "泄露经营数据 / 私自操作生产后台 / 敷衍错录造成资损 / 交付未过审的技能包", en: "Leaking business data, unauthorised production access, careless entry causing loss, shipping unaudited skill packs" },
    "job4.title": { zh: "跨境电商运营（Amazon / Temu）", en: "Cross-border E-commerce Operator (Amazon / Temu)" },
    "job4.loc": { zh: "南通（跨境主阵地）· 南京", en: "Nantong (cross-border hub) · Nanjing" },
    "job4.type": { zh: "全职", en: "Full-time" },
    "job4.dept": { zh: "跨境电商", en: "Cross-border E-commerce" },
    "job4.report.val": { zh: "跨境负责人 / 平台负责人", en: "Cross-border Lead / Platform Lead" },
    "job4.desc": { zh: "负责 Amazon 多站点与 Temu 半 / 全托管运营：以 Listing + 广告 + FBA 驱动 GMV 与排名，以备货履约与核价驱动走量与毛利。该岗位为储备状态，业务放量时开放，可先投简历进入人才池。", en: "Own Amazon multi-marketplace and Temu semi / fully-managed operations — Listing, ads and FBA drive GMV and rank; stock fulfilment and price negotiation drive volume and margin. Currently a talent-pool role: send your CV and we'll reach out when the business scales." },
    "job4.d1": { zh: "Listing：标题 / 图文 / A+ 优化与关键词，维护 Listing 表", en: "Listing: titles, images, A+ content and keywords; maintain the listing sheet" },
    "job4.d2": { zh: "广告：SP / SB / SD 结构与 ACOS 优化，做否定词与预算再分配", en: "Ads: SP / SB / SD structure and ACOS control; negative keywords and budget reallocation" },
    "job4.d3": { zh: "FBA 库存：补货计划与库存周转，控 IPI，不断货不积压", en: "FBA inventory: replenishment planning and turnover; keep IPI healthy, no stockouts or overhang" },
    "job4.d4": { zh: "合规与评分：合规索评、类目审核与账户健康维护", en: "Compliance and ratings: compliant review requests, category approvals and account health" },
    "job4.d5": { zh: "Temu 履约：国内仓备货、核价跟进与爆款选品，控退货率", en: "Temu fulfilment: domestic warehouse stocking, price negotiation and hit product selection; control return rate" },
    "job4.d6": { zh: "数据复盘：销量与毛利复盘，输出周报与迭代动作", en: "Review: sales and margin analysis, ship weekly reports with next actions" },
    "job4.r1": { zh: "大专及以上，电子商务 / 市场营销优先", en: "College degree or above; e-commerce / marketing preferred" },
    "job4.r2": { zh: "2 年以上 Amazon 或 Temu 运营经验，有台球 / 运动器材类目优先", en: "2+ years on Amazon or Temu; billiards / sports equipment category a plus" },
    "job4.r3": { zh: "Amazon：懂 A9 算法、关键词与转化逻辑、FBA 与自发货差异、Coupon / BD / LD 节奏", en: "Amazon: understands A9 ranking, keyword and conversion logic, FBA vs. FBM, and Coupon / BD / LD cadence" },
    "job4.r4": { zh: "Temu：懂核价逻辑与毛利空间，能推动备货节奏避免断货 / 积压", en: "Temu: understands price-negotiation logic and margin headroom; drives stocking cadence to avoid stockouts and overhang" },
    "job4.r5": { zh: "数据敏感、执行强、抗压，能用数据定位断点并迭代", en: "Data-sensitive, strong execution, resilient; locates funnel breakpoints with data and iterates" },
    "job4.k1": { zh: "GMV 达成率", en: "GMV attainment" },
    "job4.k2": { zh: "ACOS ≤ 红线（Amazon）/ 履约时效 ≤ SLA（Temu）", en: "ACOS ≤ threshold (Amazon) / fulfilment ≤ SLA (Temu)" },
    "job4.k3": { zh: "BSR 排名（Amazon）/ 毛利率 ≥ 红线（Temu）", en: "BSR ranking (Amazon) / gross margin ≥ threshold (Temu)" },
    "job4.k4": { zh: "库存周转（Amazon）/ 缺货率 ≤ 红线（Temu）", en: "Inventory turnover (Amazon) / stockout rate ≤ threshold (Temu)" },
    "job4.k5": { zh: "评分 ≥ 红线（Amazon）/ 退货率 ≤ 红线（Temu）", en: "Rating ≥ threshold (Amazon) / return rate ≤ threshold (Temu)" },
    "job4.sys.val": { zh: "Amazon Seller Central（美 / 加 / 英 / 德 / 日 5 站）、广告与品牌分析、Temu 半托管·全托管后台", en: "Amazon Seller Central (US / CA / UK / DE / JP), Ads and Brand Analytics, Temu semi- and fully-managed console" },
    "job4.plus": { zh: "加分项：Amazon 多站点（美 / 加 / 英 / 德 / 日）实操、海外仓资源、小语种。", en: "Bonus: hands-on Amazon multi-marketplace (US / CA / UK / DE / JP), overseas warehouse resources, extra languages." },
    "job4.red.val": { zh: "刷评 / 刷单 / 跟卖侵权 / 规避二审 / 虚假发货 / 货不对板 / 恶意低价扰乱", en: "Fake reviews, fake orders, hijacking or IP infringement, evading secondary verification, fake shipping, product mismatch, malicious underpricing" },
    "careers.culture": { zh: "团队汇报口径：不允许只报结果数字，须同步「原因 — 结论 — 下一步动作」；重大错价、处罚、库存异常须当天上报。", en: "How we report here: never just a number — always pair it with cause, conclusion and next action. Pricing errors, penalties and inventory anomalies are escalated the same day." },
    "careers.note": { zh: "薪资范围面议（按平台经验与操盘结果定级）。面试含平台实操笔试，会追问真实操盘数据：峰值月销、ACOS、最高场观、千川 ROI——我们只认跑出来的数。", en: "Salary is negotiable and banded by platform experience and track record. Expect a hands-on written test and direct questions about your real numbers — peak monthly sales, ACOS, highest live viewership, Qianchuan ROI. We go by results, not résumés." },
    "job.status.open": { zh: "在招", en: "Open" },
    "job.status.pool": { zh: "储备", en: "Talent pool" },
    "job.duty": { zh: "岗位职责", en: "What you'll do" },
    "job.req": { zh: "任职要求", en: "What we look for" },
    "job.apply": { zh: "投递这个岗位", en: "Apply for this role" },
    "job.apply.pool": { zh: "投简历进人才池", en: "Send your CV" },
























    "careers.how": { zh: "怎么投", en: "How to Apply" },
    "careers.how.desc": { zh: "把简历发到邮箱，邮件标题写「应聘 - 岗位名」，正文简单说三件事：做过什么、做成过什么、为什么想来。也可以直接在联系页填表单，选「应聘」。", en: "Email your CV with the subject \"Application - Role name\". In the body, three things: what you did, what you achieved, why here. Or use the contact form and pick \"Job Application\"." },
    "careers.how.cta": { zh: "发简历", en: "Send CV" },
    "careers.how.form": { zh: "用表单投递", en: "Use the form" }
  };

  var LANG_KEY = "site_lang";
  var stored = localStorage.getItem(LANG_KEY);
  // 首次访问按浏览器语言判定：非中文环境默认英文（海外访客默认英文），
  // 一旦用户手动切换过，就以手动选择为准。
  var detected = "zh";
  if (!stored) {
    var navLang = (
      navigator.language ||
      (navigator.languages && navigator.languages[0]) ||
      ""
    ).toLowerCase();
    detected = navLang.indexOf("zh") === 0 ? "zh" : "en";
  }
  var current = stored || detected;

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

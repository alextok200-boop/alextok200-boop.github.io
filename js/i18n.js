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
    "logo": { zh: "DAI·CP", en: "DAI·CP" },

    // ---- 页脚 ----
    "footer.copyright": { zh: "© 2026 戴程鹏 · Powered by GitHub Pages", en: "© 2026 Dai Chengpeng · Powered by GitHub Pages" },

    // ---- 首页 hero ----
    "hero.eyebrow": { zh: "电商操盘手 · 技能包工程负责人", en: "E-commerce Operator · AI Skill Pack Engineer" },
    "hero.title1": { zh: "让品牌电商", en: "Making brand e-commerce" },
    "hero.run": { zh: "跑得", en: "go" },
    "hero.title2": { zh: "更快、更稳、更省人", en: "Faster, Steadier, Leaner" },
    "hero.sub": { zh: "操盘万世康伦（KONLLEN）集团电商，覆盖国内 9+ 平台与海外多平台，用 AI 技能包把重复工作自动化，让团队把时间花在增长上。", en: "Operating KONLLEN Group e-commerce across 9+ domestic platforms and multiple overseas platforms. Automating repetitive work with AI skill packs so the team can focus on growth." },
    "hero.btn1": { zh: "看作品", en: "View Work" },
    "hero.btn2": { zh: "联系我", en: "Contact" },

    // ---- 首页数据卡 ----
    "stat.team": { zh: "团队规模", en: "Team Size" },
    "stat.shops": { zh: "店铺矩阵", en: "Store Matrix" },
    "stat.skills": { zh: "AI 技能包", en: "AI Skill Packs" },

    // ---- 首页核心能力 ----
    "cap.title": { zh: "核心能力", en: "Core Capabilities" },
    "cap1.title": { zh: "品牌电商操盘", en: "Brand E-commerce" },
    "cap1.desc": { zh: "抖音/天猫/京东/拼多多 + Amazon/TikTok 等跨境平台，国内海外 50/50 布局，年 GMV 已实现超千万美元。", en: "Douyin/Tmall/JD/PDD + Amazon/TikTok and more, 50/50 domestic & overseas, annual GMV now over USD 10 million." },
    "cap2.title": { zh: "AI 技能包工程", en: "AI Skill Pack Engineering" },
    "cap2.desc": { zh: "投流计划、达人分析、视觉生产、数据看板……把运营知识沉淀为可复用的 AI 技能，零基础同事一键使用。", en: "Ad planning, influencer analytics, visual production, dashboards... packaging operational know-how into reusable AI skills anyone can use." },
    "cap3.title": { zh: "数据驱动决策", en: "Data-Driven Decisions" },
    "cap3.desc": { zh: "ERP 数据中台、店铺看板、库存监控、低价预警，用数据代替拍脑袋。", en: "ERP data platform, store dashboards, inventory monitoring, price alerts — decisions backed by data, not gut feel." },

    // ---- B2B 招募 ----
    "b2b.title": { zh: "B2B 电商招募 · 代理层级方案", en: "B2B Recruitment · Tiered Dealer Plans" },
    "b2b.sub": { zh: "KONLLEN 与 CRICAL 双品牌招商合作，按合作深度与渠道能力匹配差异化政策（公开方案，正式条款以 OA 授权为准）。", en: "KONLLEN & CRICAL dual-brand recruitment. Policies matched to partnership depth and channel capability (public outline; official terms per OA authorization)." },
    "b2b.core.tier": { zh: "核心经销商", en: "Core Dealer" },
    "b2b.core.title": { zh: "独家/优先权 · 全国联保 · 高返点", en: "Exclusivity · National Warranty · High Rebate" },
    "b2b.core.1": { zh: "独家区域或垂直渠道优先权", en: "Exclusive regional/vertical priority" },
    "b2b.core.2": { zh: "深度联保与售后兜底", en: "Deep joint warranty & after-sales" },
    "b2b.core.3": { zh: "阶梯返点 + 季度奖励", en: "Tiered rebates + quarterly bonuses" },
    "b2b.core.4": { zh: "新品首发权与定向支持", en: "New-product launch priority" },
    "b2b.core.fit": { zh: "有渠道网络、能稳定走量的合作伙伴", en: "Partners with channel networks and stable volume" },
    "b2b.std.tier": { zh: "常规经销商", en: "Standard Dealer" },
    "b2b.std.title": { zh: "标准授权 · 区域保护 · 常规支持", en: "Standard License · Regional Protection · Support" },
    "b2b.std.1": { zh: "官方授权与合规资质", en: "Official license & compliance" },
    "b2b.std.2": { zh: "区域/品类保护政策", en: "Regional/category protection" },
    "b2b.std.3": { zh: "标准化返点 + 促销支持", en: "Standard rebates + promo support" },
    "b2b.std.4": { zh: "联保服务与定期培训", en: "Warranty service & training" },
    "b2b.std.fit": { zh: "区域代理、垂直渠道、专业平台分销", en: "Regional agents, vertical channels, platform distributors" },
    "b2b.ret.tier": { zh: "分销 / 散单合作", en: "Distributor / Small Orders" },
    "b2b.ret.title": { zh: "统一价 · 低门槛 · 灵活起订", en: "Unified Price · Low Barrier · Flexible MOQ" },
    "b2b.ret.1": { zh: "BC 同价、统一出货价", en: "Same B2B & retail pricing" },
    "b2b.ret.2": { zh: "小额起订、低加盟门槛", en: "Low MOQ, low entry barrier" },
    "b2b.ret.3": { zh: "线上线下均开放", en: "Online & offline open" },
    "b2b.ret.4": { zh: "定期返点 + 大促支持", en: "Periodic rebates + campaign support" },
    "b2b.ret.fit": { zh: "小额进货、电商起步、新渠道试水", en: "Small orders, e-commerce newcomers, channel tests" },
    "b2b.cta": { zh: "申请代理合作", en: "Apply for Dealership" },
    "b2b.hint": { zh: "提交联系方式 → 1-2 个工作日内对接 · 走 OA 审批留痕", en: "Submit contact → reply within 1-2 business days · OA-approved" },
    "b2b.fit.prefix": { zh: "适合", en: "Best for" },

    // ---- 关于页 ----
    "about.eyebrow": { zh: "About", en: "About" },
    "about.title": { zh: "关于我", en: "About Me" },
    "about.p1": { zh: "我是戴程鹏，万世康伦（KONLLEN）集团高级运营负责人，常驻深圳。管理 15 人电商团队，覆盖 49 个店铺、9+ 国内平台与多个海外平台，国内海外业务向 50/50 结构调整。", en: "I'm Dai Chengpeng, senior operations lead at KONLLEN Group, based in Shenzhen. I manage a 15-person e-commerce team across 49 stores, 9+ domestic platforms and multiple overseas platforms, restructuring toward a 50/50 domestic-overseas mix." },
    "about.p2": { zh: "除了传统电商操盘，我的另一个身份是技能包全栈工程负责人——把投流、生图、达人分析、数据看板等运营知识封装成 AI 技能包，让零基础的 HR、运营同事也能一键使用。", en: "Beyond classic e-commerce operations, I'm also a full-stack engineer of AI skill packs — packaging ad planning, image generation, influencer analytics and dashboards into skills that even non-technical colleagues can use with one click." },
    "about.timeline": { zh: "经历时间线", en: "Timeline" },
    "about.tl1.date": { zh: "2026", en: "2026" },
    "about.tl1.title": { zh: "集团电商运营负责人", en: "Group E-commerce Operations Lead" },
    "about.tl1.desc": { zh: "KONLLEN 双品牌进入亚马逊 5 站品牌榜；推进 9 品牌矩阵与 B2B 招商。", en: "KONLLEN & CRICAL both ranked in Amazon brand lists across 5 marketplaces; driving the 9-brand matrix and B2B recruitment." },
    "about.tl2.date": { zh: "2025", en: "2025" },
    "about.tl2.title": { zh: "技能包工程体系搭建", en: "AI Skill Pack System" },
    "about.tl2.desc": { zh: "建立 WorkBuddy 业务技能矩阵，交付投流/生图/看板/OA 审批等 20+ 技能包。", en: "Built the WorkBuddy skill matrix, delivering 20+ packs for ads, imaging, dashboards and OA approvals." },
    "about.tl3.date": { zh: "更早", en: "Earlier" },
    "about.tl3.title": { zh: "多平台电商操盘积累", en: "Multi-platform E-commerce" },
    "about.tl3.desc": { zh: "国内兴趣电商 + 货架电商 + 跨境出海，从单店运营到品牌矩阵。", en: "From single-store operations to a brand matrix across domestic interest/shelf commerce and overseas." },

    // ---- 作品集页 ----
    "work.eyebrow": { zh: "Work", en: "Work" },
    "work.title": { zh: "作品集", en: "Portfolio" },
    "work.sub": { zh: "从操盘到工程，从店铺到中台——这些年落地的代表项目。", en: "From operations to engineering, from stores to platforms — representative projects." },
    "work.w1.title": { zh: "KONLLEN 品牌电商体系", en: "KONLLEN Brand E-commerce" },
    "work.w1.desc": { zh: "双品牌亚马逊 5 站品牌榜，国内 9+ 平台店铺矩阵。从单品到品牌矩阵的运营操盘。", en: "Dual brands ranked on Amazon across 5 marketplaces, 9+ domestic platform stores. From single products to a brand matrix." },
    "work.w2.title": { zh: "数据中台与自动化看板", en: "Data Platform & Auto Dashboards" },
    "work.w2.desc": { zh: "聚水潭库存看板、店铺每日数据看板、AI Agent 监控仪表盘——用数据替代拍脑袋。", en: "Jushuitan inventory board, daily store dashboards, AI agent monitoring — data over gut feel." },
    "work.w3.title": { zh: "投流计划生成与审核", en: "Ad Plan Generation & Audit" },
    "work.w3.desc": { zh: "台球专版投流生成器 + 7 维审核器 + 执行方案，覆盖 12 个投放平台，扫描需求自动出计划。", en: "Billiards-specific ad generator + 7-dimension auditor + execution plans across 12 platforms." },
    "work.w4.title": { zh: "Konllen Agent 技能中台", en: "Konllen Agent Platform" },
    "work.w4.desc": { zh: "五层架构品牌 Agent：整合 10 个 Skill、10 项自动化、监控仪表盘与 API 扩展框架。", en: "5-layer brand agent: 10 skills, 10 automations, monitoring dashboard and API framework." },
    "work.w5.title": { zh: "AI 视觉生产", en: "AI Visual Production" },
    "work.w5.desc": { zh: "Agnes 品牌视觉管线：批量生图、PSD 素材包、钉钉流转，锚定 KONLLEN 品牌 VI。", en: "Agnes visual pipeline: batch imaging, PSD asset packs, DingTalk workflow, anchored to KONLLEN VI." },
    "work.w6.title": { zh: "CRICAL 品牌官网", en: "CRICAL Brand Website" },
    "work.w6.desc": { zh: "霓虹暗黑潮牌风格静态站点，产品图逐张替换为真实产品照，已上线可访问。", en: "Neon-dark street-style static site with real product photos, live and accessible." },
    "work.pending": { zh: "案例截图补充中", en: "Screenshots coming soon" },

    // ---- 博客页 ----
    "blog.eyebrow": { zh: "Blog", en: "Blog" },
    "blog.title": { zh: "博客", en: "Blog" },
    "blog.sub": { zh: "品牌电商与 AI 技能包的实战记录。", en: "Notes on brand e-commerce and AI skill packs." },
    "blog.search": { zh: "搜索文章关键词…", en: "Search articles..." },
    "blog.all": { zh: "全部", en: "All" },
    "blog.empty": { zh: "没有找到匹配的文章。", en: "No matching articles found." },
    "blog.count": { zh: "共 {n} 篇", en: "{n} articles" },
    "blog.readmore": { zh: "阅读全文", en: "Read more" },

    // ---- 联系页 ----
    "contact.eyebrow": { zh: "Contact", en: "Contact" },
    "contact.title": { zh: "联系我", en: "Contact Me" },
    "contact.info.title": { zh: "合作与交流", en: "Collaboration & Exchange" },
    "contact.info.desc": { zh: "品牌电商咨询、AI 技能包合作、行业交流，欢迎联系。", en: "Brand e-commerce consulting, AI skill pack cooperation, industry exchange — reach out." },
    "contact.email": { zh: "邮箱", en: "Email" },
    "contact.github": { zh: "GitHub", en: "GitHub" },
    "contact.form.title": { zh: "留言", en: "Message" },
    "contact.form.name": { zh: "称呼", en: "Name" },
    "contact.form.name.ph": { zh: "怎么称呼你", en: "Your name" },
    "contact.form.email": { zh: "邮箱", en: "Email" },
    "contact.form.email.ph": { zh: "你的邮箱", en: "Your email" },
    "contact.form.msg": { zh: "内容", en: "Message" },
    "contact.form.msg.ph": { zh: "想聊什么", en: "What's on your mind" },
    "contact.form.send": { zh: "发送", en: "Send" },
    "contact.form.note": { zh: "谢谢 {n}！表单已提交（静态站演示），正式版请通过邮箱联系。", en: "Thanks {n}! Form submitted (demo). For real inquiries please email." },

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
    "nav.brands": { zh: "品牌矩阵", en: "Brands" },
    "nav.results": { zh: "成绩单", en: "Results" },
    "nav.careers": { zh: "加入我们", en: "Careers" },

    // ---- 联系页 ----
    "contact.sub": { zh: "B2B 代理合作、品牌电商咨询、AI 技能包合作，或只是聊聊行业——都可以从这里开始。", en: "B2B dealership, brand e-commerce consulting, AI skill pack projects — or just a chat about the industry. Start here." },
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
    "opt.b2b": { zh: "B2B 代理合作", en: "B2B Dealership" },
    "opt.brand": { zh: "品牌 / 产品合作", en: "Brand / Product" },
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

    // ---- 品牌矩阵页 ----
    "brands.eyebrow": { zh: "Brands", en: "Brands" },
    "brands.title": { zh: "品牌矩阵", en: "Brand Matrix" },
    "brands.sub": { zh: "万世康伦集团旗下 9 个台球 / 桌球用品品牌，覆盖不同价格带与人群，国内走货架与兴趣电商，海外走 Amazon 等平台与独立站。", en: "Nine billiards brands under KONLLEN Group, spanning price tiers and audiences — shelf and interest-based e-commerce at home, Amazon and DTC overseas." },
    "brands.todo": { zh: "待确认：品牌中文名与英文名的对应关系以集团最新口径为准，如需调整请告诉我具体品牌与描述。", en: "To confirm: Chinese/English brand naming follows the group's latest standard. Tell me which brand to fix and I'll update it." },
    "brands.cta": { zh: "咨询品牌合作 / 代理", en: "Enquire About Partnership" },
    "brands.hint": { zh: "可按单品牌或组合授权 · 正式条款以 OA 审批为准", en: "Single-brand or bundled licensing · official terms per OA approval" },
    "brand.konllen.tag": { zh: "集团主品牌 · 亚马逊日本 #5 / 德国 #8", en: "Flagship brand · Amazon JP #5 / DE #8" },
    "brand.konllen.desc": { zh: "集团核心台球用品品牌，产品覆盖整杆、前肢与配件；旗下 KONLLEN GO 面向青年玩家，走更轻的量级与更年轻的表达。", en: "The group's core billiards brand covering full cues, shafts and accessories. KONLLEN GO targets younger players with lighter builds and louder design." },
    "brand.konllen.m1": { zh: "主线：整杆 / 前肢 / 配件", en: "Core line: cues / shafts / accessories" },
    "brand.konllen.m2": { zh: "子线：KONLLEN GO（青年玩家）", en: "Sub-line: KONLLEN GO (young players)" },
    "brand.konllen.m3": { zh: "海外：Amazon 多站点品牌榜", en: "Overseas: Amazon brand rankings, multiple marketplaces" },
    "brand.crical.tag": { zh: "科瑞克 · 京东旗舰店 · 亚马逊美国 #11 / 加拿大 #11", en: "Keruike · JD flagship store · Amazon US #11 / CA #11" },
    "brand.crical.desc": { zh: "面向国内货架电商与海外市场同步推进的双线品牌，京东设有 CRICAL 旗舰店，在 Amazon 美、加站点进入品牌榜。", en: "A dual-track brand running domestic shelf e-commerce and overseas markets in parallel, with a CRICAL flagship store on JD and Amazon US/CA brand rankings." },
    "brand.crical.m1": { zh: "国内：京东 CRICAL 旗舰店", en: "Domestic: CRICAL flagship store on JD" },
    "brand.crical.m2": { zh: "海外：Amazon 美 / 加站点", en: "Overseas: Amazon US / CA" },
    "brand.crical.m3": { zh: "官网：独立站点在建设中", en: "Website: standalone site in progress" },
    "brand.common.tag": { zh: "台球 / 桌球用品品牌", en: "Billiards brand" },
    "brand.common.desc": { zh: "集团品牌矩阵成员，台球 / 桌球用品线。", en: "Part of the group brand matrix — billiards product line." },
    "brand.group.tag": { zh: "集团品牌", en: "Group brand" },
    "brand.group.desc": { zh: "集团主体品牌，承载集团层面的合作与渠道对接。", en: "The group's corporate brand, handling group-level partnerships and channel onboarding." },
    "brand.keruike.tag": { zh: "CRICAL 中文品牌名", en: "Chinese name of CRICAL" },
    "brand.keruike.desc": { zh: "CRICAL 的中文品牌名，国内渠道以此名称出现。", en: "The Chinese brand name for CRICAL, used across domestic channels." },

    // ---- 成绩单页 ----
    "ach.eyebrow": { zh: "Results", en: "Results" },
    "ach.title": { zh: "成绩单", en: "Results" },
    "ach.sub": { zh: "只列能对账的数字：规模、排名、覆盖与沉淀。口径与集团内部统计一致。", en: "Only numbers that reconcile: scale, rankings, coverage, assets. Same basis as internal group reporting." },
    "ach.numbers": { zh: "核心数字", en: "Key Numbers" },
    "ach.gmv": { zh: "年 GMV（已实现）", en: "Annual GMV (achieved)" },
    "ach.gmv.note": { zh: "国内 + 海外合计，年度口径", en: "Domestic + overseas, annual basis" },
    "ach.stores": { zh: "店铺矩阵", en: "Store Matrix" },
    "ach.stores.note": { zh: "9+ 国内平台 + 多个海外平台", en: "9+ domestic platforms + multiple overseas" },
    "ach.brands": { zh: "品牌矩阵", en: "Brand Matrix" },
    "ach.brands.note": { zh: "台球 / 桌球用品，覆盖多价格带", en: "Billiards, spanning multiple price tiers" },
    "ach.amazon": { zh: "亚马逊站点品牌榜", en: "Amazon Brand Rankings" },
    "ach.amazon.note": { zh: "KONLLEN 日 #5 / 德 #8 · CRICAL 美 #11 / 加 #11", en: "KONLLEN JP #5 / DE #8 · CRICAL US #11 / CA #11" },
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
    "ach.t1.title": { zh: "双品牌进入亚马逊 5 站品牌榜", en: "Both brands ranked on Amazon across 5 marketplaces" },
    "ach.t1.desc": { zh: "KONLLEN 日本站 #5、德国站 #8；CRICAL 美国站 #11、加拿大站 #11。B2B 招商同步常态化推进。", en: "KONLLEN #5 in JP and #8 in DE; CRICAL #11 in US and #11 in CA. B2B recruitment running in parallel." },
    "ach.t2.date": { zh: "2026", en: "2026" },
    "ach.t2.title": { zh: "年 GMV 突破千万美元", en: "Annual GMV passed USD 10 million" },
    "ach.t2.desc": { zh: "国内与海外业务向 50/50 结构调整，49 个店铺分布在 9+ 国内平台与多个海外平台。", en: "Restructuring toward a 50/50 domestic-overseas mix, with 49 stores across 9+ domestic and multiple overseas platforms." },
    "ach.t3.date": { zh: "2026", en: "2026" },
    "ach.t3.title": { zh: "AI 技能包体系成型", en: "AI skill pack system took shape" },
    "ach.t3.desc": { zh: "把投流审核、视觉生产、数据看板、OA 审批等沉淀为 20+ 可复用技能包，零基础同事一键使用。", en: "Ad review, visual production, dashboards and OA approvals packaged into 20+ reusable skills anyone can run with one click." },
    "ach.shots.todo": { zh: "品牌榜 / 后台数据截图待补充", en: "Ranking / backend screenshots pending" },
    "ach.shots.caption": { zh: "补图后此处展示亚马逊品牌榜与后台数据截图（assets/img/ 目录）", en: "Amazon rankings and backend screenshots will show here once added to assets/img/" },
    "ach.cta": { zh: "聊聊合作", en: "Talk Partnership" },
    "ach.hint": { zh: "数据口径以集团内部统计为准 · 对外披露以审批版本为准", en: "Figures follow internal group reporting · external disclosure follows the approved version" },

    // ---- 招聘页 ----
    "careers.eyebrow": { zh: "Careers", en: "Careers" },
    "careers.title": { zh: "加入我们", en: "Join Us" },
    "careers.sub": { zh: "15 人电商团队、49 个店铺、9 个品牌、国内海外双线。这里不缺舞台，缺的是能把事做成的人。", en: "A 15-person team, 49 stores, 9 brands, domestic and overseas tracks. There's no shortage of stage here — only of people who get things done." },
    "careers.why": { zh: "为什么是我们", en: "Why Us" },
    "careers.why1.t": { zh: "真·多平台战场", en: "A real multi-platform battlefield" },
    "careers.why1.d": { zh: "国内 9+ 平台、海外 Amazon / Temu / TikTok Shop / 独立站，一个团队跑通两条增长曲线。", en: "9+ domestic platforms plus Amazon, Temu, TikTok Shop and DTC — one team running two growth curves." },
    "careers.why2.t": { zh: "AI 先行的团队", en: "An AI-first team" },
    "careers.why2.d": { zh: "20+ 技能包把重复劳动自动化，你带来的方法论也会被沉淀成技能包，团队一起复用。", en: "20+ skill packs automate the grunt work, and your playbook gets packaged too, so the whole team reuses it." },
    "careers.why3.t": { zh: "数据说了算", en: "Data has the final word" },
    "careers.why3.d": { zh: "看板、库存监控、价格预警都是现成的，决策不看资历看数字，试错成本团队扛。", en: "Dashboards, inventory monitoring and price alerts are already in place. Decisions follow numbers, not seniority." },
    "careers.open": { zh: "在招岗位", en: "Open Roles" },
    "job.status.open": { zh: "在招", en: "Open" },
    "job.status.pool": { zh: "储备", en: "Talent pool" },
    "job.duty": { zh: "岗位职责", en: "What you'll do" },
    "job.req": { zh: "任职要求", en: "What we look for" },
    "job.apply": { zh: "投递这个岗位", en: "Apply for this role" },
    "job.apply.pool": { zh: "投简历进人才池", en: "Send your CV" },
    "job1.title": { zh: "TK 跨境直播运营", en: "TikTok Cross-border Live Operations" },
    "job1.loc": { zh: "深圳 / 南京", en: "Shenzhen / Nanjing" },
    "job1.type": { zh: "全职", en: "Full-time" },
    "job1.dept": { zh: "海外电商", en: "Overseas E-commerce" },
    "job1.d1": { zh: "负责 TikTok Shop 直播间搭建与日常运营，含排品、脚本、场控与复盘", en: "Build and run TikTok Shop live rooms: product line-up, scripts, floor control and post-stream review" },
    "job1.d2": { zh: "对接达人资源与投流，做 ROI 与 GMV 双目标的过程管理", en: "Manage creator partnerships and paid traffic against ROI and GMV targets" },
    "job1.d3": { zh: "联动仓储与客服，保证直播订单履约与售后体验", en: "Coordinate with warehouse and service teams so live orders actually ship and get supported" },
    "job1.d4": { zh: "沉淀可复用打法（话术、排品模板、复盘表），交给团队复用", en: "Turn what works into reusable assets: scripts, line-up templates, review sheets" },
    "job1.r1": { zh: "有 TikTok Shop / 抖音直播运营实操经验，能独立开播与复盘", en: "Hands-on TikTok Shop or Douyin live experience, able to run and review sessions independently" },
    "job1.r2": { zh: "英语能支撑基础商务沟通，熟悉海外用户表达习惯", en: "Working English for business communication and a feel for overseas audiences" },
    "job1.r3": { zh: "对数据敏感，能看懂 ROI、转化漏斗并据此调整动作", en: "Comfortable with ROI and conversion funnels, and willing to act on what they show" },
    "job1.r4": { zh: "抗压、能接受直播排班（晚间场次）", en: "Resilient, fine with evening live-stream shifts" },
    "job1.plus": { zh: "加分项：台球 / 运动品类经验、有达人资源、会基础剪辑。", en: "Bonus: billiards or sports category experience, creator network, basic video editing." },
    "job2.title": { zh: "跨境电商运营（Amazon / Temu）", en: "Cross-border E-commerce Operator (Amazon / Temu)" },
    "job2.loc": { zh: "深圳 / 南京", en: "Shenzhen / Nanjing" },
    "job2.type": { zh: "全职", en: "Full-time" },
    "job2.dept": { zh: "海外电商", en: "Overseas E-commerce" },
    "job2.desc": { zh: "负责 Amazon / Temu 店铺的日常运营：listing、广告、库存周转与活动节奏。该岗位为储备状态，业务放量时开放，可先投递简历进入人才池。", en: "Day-to-day Amazon / Temu operations: listings, ads, inventory turns and campaign cadence. This role is in the talent pool — send your CV and we'll reach out when volume opens it." },
    "job3.title": { zh: "运营自动化 / AI 技能包工程", en: "Ops Automation / AI Skill Pack Engineering" },
    "job3.loc": { zh: "深圳 / 远程协作", en: "Shenzhen / Remote" },
    "job3.type": { zh: "全职 / 兼职", en: "Full-time / Part-time" },
    "job3.dept": { zh: "技能包工程", en: "Skill Pack Engineering" },
    "job3.desc": { zh: "把投流审核、视觉生产、数据看板、OA 审批这类重复工作封装成 AI 技能包，交付给零基础同事使用。需要一定的脚本能力与强烈的工作流洁癖。", en: "Package repetitive work — ad review, visual production, dashboards, OA approvals — into AI skill packs that non-technical colleagues can use. Needs scripting ability and a strong allergy to messy workflows." },
    "careers.todo": { zh: "待确认：薪资范围、汇报关系、面试流程等细节以 HR 终稿为准，告诉我即可更新到本页。", en: "To confirm: salary band, reporting line and interview process follow HR's final version. Tell me and I'll update this page." },
    "careers.how": { zh: "怎么投", en: "How to Apply" },
    "careers.how.desc": { zh: "把简历发到邮箱，邮件标题写「应聘 - 岗位名」，正文简单说三件事：做过什么、做成过什么、为什么想来。也可以直接在联系页填表单，选「应聘」。", en: "Email your CV with the subject \"Application - Role name\". In the body, three things: what you did, what you achieved, why here. Or use the contact form and pick \"Job Application\"." },
    "careers.how.cta": { zh: "发简历", en: "Send CV" },
    "careers.how.form": { zh: "用表单投递", en: "Use the form" }
  };

  var LANG_KEY = "site_lang";
  var stored = localStorage.getItem(LANG_KEY);
  // 首次访问按浏览器语言判定：非中文环境默认英文（B2B 访客多为海外），
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

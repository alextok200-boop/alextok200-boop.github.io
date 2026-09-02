/* 博客文章数据源：所有页面共享，新增文章只需在这里加一条 */
window.POSTS_DATA = [
  {
    file: "2026-09-02-tong-ji-san-lian-bai",
    en: { title: "Adding Site Analytics Failed Three Times: Test the Client First", summary: "Three analytics services unreachable while all servers returned 200. The problem wasn't the tools — it was the network layer in between.", tag: "Data & Automation" },
    title: "给网站接统计，连败三次后我学会了先测客户端",
    date: "2026-09-02",
    tag: "数据与自动化",
    summary: "Umami、GoatCounter、51.la 三次接入全部失败，服务端却都 200。问题不在工具，在用户够不到它的那层网络。"
  },
  {
    file: "2026-09-01-duo-sheet-fen-lei",
    en: { title: "Multi-Sheet Excel Reports: Classify Before You Process", summary: "Importing six sheets at once silently dropped half the data. The fix: identify each sheet's type first, then decide how to handle it.", tag: "Data & Automation" },
    title: "Excel 多 Sheet 报表，先分类再动手",
    date: "2026-09-01",
    tag: "数据与自动化",
    summary: "一张工作簿六个 sheet 一起导进脚本，一半解析失败还静默丢数。先识别每个 sheet 的类型，再决定怎么处理。"
  },
  {
    file: "2026-08-31-ku-cun-guard-rail",
    en: { title: "How to Set Inventory Alert Thresholds Without False Alarms", summary: "Three-tier thresholds based on sell-through speed, replenishment lead time and promo cycles.", tag: "E-commerce" },
    title: "库存告警阈值怎么定，才不误报又不漏报",
    date: "2026-08-31",
    tag: "电商操盘",
    summary: "库存看板跑起来不难，难的是阈值设得准。怎么根据动销速度、在途周期和促销节点定三层阈值。"
  },
  {
    file: "2026-08-30-erp-403",
    en: { title: "403 Is Not Always a Wrong Key: One ERP API Debugging Session", summary: "Swapped AppIDs again and again, still 403. The key never even reached the server — an IP whitelist was blocking the request.", tag: "Data & Automation" },
    title: "403 不一定是密钥错了：一次 ERP 接口排查",
    date: "2026-08-30",
    tag: "数据与自动化",
    summary: "AppID 换了一个又一个，403 照旧。最后发现密钥根本没机会进服务器——是 IP 白名单把请求拦在了门外。"
  },
  {
    file: "2026-08-29-ban-ben-men-jin",
    en: { title: "22 Versions of a Personal Site, Zero Version Drift", summary: "Once I changed only CSS and forgot to bump the version — visitors kept seeing the old page. Now a CI gate checks it for me.", tag: "AI Skills" },
    title: "个人网站改了 22 版，版本号没乱过",
    date: "2026-08-29",
    tag: "AI 技能包",
    summary: "有一次只改了 CSS 忘了 bump 版本号，访客看到的还是旧页面。后来把版本检查做成了机器门禁，人肉记忆不再可信。"
  },
  {
    file: "2026-08-28-qing-cang",
    en: { title: "Clearing 14,000 Cues in 8 Weeks: A Liquidation Playbook", summary: "Pricing anchor, tiered launch, unified B/C pricing, SKU-level decomposition.", tag: "E-commerce" },
    title: "8 周清掉 1.4 万支库存：一次清仓的拆解",
    date: "2026-08-28",
    tag: "电商操盘",
    summary: "整杆 7 SKU 约 13200 支 + 前肢 363 支，8 周清完。定价锚、阶梯首发、BC 同价、按 SKU 拆解。"
  },
  {
    file: "2026-08-27-kou-jing-tong-yi",
    en: { title: "Two Tables That Won't Reconcile: Fix the Definition, Not the Numbers", summary: "The calculator said 100, the rating sheet said 90. Nobody miscalculated — the two tables defined 'sales' differently.", tag: "Team" },
    title: "两套表对不上账，先别急着改数据",
    date: "2026-08-27",
    tag: "团队管理",
    summary: "绩效计算器算出 100，评级表却是 90。不是谁算错了，是两套表对\"销售额\"的定义不一样。"
  },
  {
    file: "2026-08-25-da-ren-roi",
    en: { title: "Influencer Campaigns Are ROI Management, Not Just Filming", summary: "Five-dimension scoring, S/A/B tiers, budget by tier, attribution after each run.", tag: "Influencer" },
    title: "达人投放不是请人拍视频，是 ROI 管理",
    date: "2026-08-25",
    tag: "达人运营",
    summary: "打分选人、事前定标、事后归因。五个维度给达人评分分层，预算跟着层级走，复盘落到下一个动作。"
  },
  {
    file: "2026-08-20-skill-contract",
    en: { title: "Signing 'Contracts' with AI Skills: From Usable to Reliable", summary: "Interface contracts, exit codes, idempotency — the details that make skills dependable.", tag: "AI Skills" },
    title: "给 AI 技能签\"合同\"：从能用到可靠",
    date: "2026-08-20",
    tag: "AI 技能包",
    summary: "技能包做了十几个之后，最大的教训是：能用和可靠是两回事。接口合同、退出码、幂等策略。"
  },
  {
    file: "2026-08-18-luan-jia",
    en: { title: "Price Chaos Is a Channel Signal, Not an Accident", summary: "Three sources of low prices: diversion, destocking, counterfeits. Monitor first, then act.", tag: "E-commerce" },
    title: "乱价不是偶然，是渠道信号",
    date: "2026-08-18",
    tag: "电商操盘",
    summary: "低价店只有三个来源：窜货、清库存、假货。先判断属于哪类，再决定动作。"
  },
  {
    file: "2026-08-15-erp",
    en: { title: "ERP Integration: Jushuitan vs Lingxing", summary: "Jushuitan for domestic multi-platform, Lingxing for Amazon finance. Export-first, API later.", tag: "Data & Automation" },
    title: "ERP 对接实战：聚水潭和领星到底怎么选",
    date: "2026-08-15",
    tag: "数据与自动化",
    summary: "国内用聚水潭、跨境用领星，各管一摊。先\"导出+自动化\"跑起来，再上 API 做实时，最后灌进数据中台。"
  },
  {
    file: "2026-08-12-temu",
    en: { title: "Temu Semi-managed: How to Play Without Stocking", summary: "Price wins traffic, fulfillment keeps weight. Get pricing, selection and logistics right.", tag: "Cross-border" },
    title: "Temu 半托管运营：不备货怎么玩",
    date: "2026-08-12",
    tag: "跨境电商",
    summary: "半托管的本质是用价格换流量、用履约保权重。出价算准、选品挑对、履约别拖。"
  },
  {
    file: "2026-08-10-duo-platform-matrix",
    en: { title: "Managing 49 Stores Without Chaos", summary: "Unified metrics, tiered operations, automated dashboards — three levers that keep it sane.", tag: "E-commerce" },
    title: "多平台矩阵：49 个店铺怎么管而不乱",
    date: "2026-08-10",
    tag: "电商操盘",
    summary: "店铺越多，越不能靠人肉盯。统一数据口径、分级运营、自动化看板——三个抓手。"
  },
  {
    file: "2026-08-08-oa",
    en: { title: "DingTalk OA Automation: Admin and Employee Versions Separately", summary: "Simple employee side, fast admin side, strict permission isolation, rapid iteration.", tag: "AI Skills" },
    title: "钉钉 OA 审批自动化：管理端和员工端分开做",
    date: "2026-08-08",
    tag: "AI 技能包",
    summary: "员工端极致简单、管理端要快要全、权限严格隔离、版本快速迭代。"
  },
  {
    file: "2026-08-08-pin-pai-ju-zhen",
    en: { title: "Nine Brands, One Category: How to Deploy a Brand Matrix", summary: "Differentiate positioning, price bands and channels; concentrate resources on the lead brand.", tag: "Brand" },
    title: "9 个品牌一条产品线：品牌矩阵怎么排兵布阵",
    date: "2026-08-08",
    tag: "品牌操盘",
    summary: "九个品牌不能都是全能选手。定位错开、价格错开、渠道错开，资源向主品牌集中。"
  },
  {
    file: "2026-08-05-chu-hai",
    en: { title: "Going Global: From Zero to Amazon Brand Rankings", summary: "Choose markets, nail listings, grow reviews compliantly, layer ads.", tag: "Cross-border" },
    title: "品牌出海：从 0 到亚马逊品牌榜",
    date: "2026-08-05",
    tag: "跨境电商",
    summary: "KONLLEN 与 CRICAL 双品牌进亚马逊 5 站品牌榜的实操复盘：选站点、打 Listing、合规养评、分层投放。"
  },
  {
    file: "2026-08-03-shu-ju-zhong-tai",
    en: { title: "Data Platform: From Excel to Automated Dashboards", summary: "Define metrics, centralize data, dashboard it. Three steps away from Friday spreadsheet marathons.", tag: "Data & Automation" },
    title: "数据中台：从 Excel 到自动化看板",
    date: "2026-08-03",
    tag: "数据与自动化",
    summary: "先定口径，再集中数据，最后看板化。三步走完，从\"周五加班拼表\"进化到\"看板自动在群里等你\"。"
  },
  {
    file: "2026-07-30-tuan-dui",
    en: { title: "How to Staff a 15-Person E-commerce Team", summary: "Six roles, domestic/overseas split, assistants as reserves, one table to manage everyone.", tag: "Team" },
    title: "15 人电商团队怎么配：一张岗位地图",
    date: "2026-07-30",
    tag: "团队管理",
    summary: "六岗归位、国内外分流、助理做储备、一张表管人——团队不是凑人头，是排兵布阵。"
  },
  {
    file: "2026-07-28-b2b",
    en: { title: "B2B Recruitment: Deploying Dual Brands Across Channels", summary: "Tier channels, keep brands separate, put licensing and warranty in writing. Signing is just the start.", tag: "Brand" },
    title: "B2B 招商打法：双品牌怎么铺渠道",
    date: "2026-07-28",
    tag: "品牌操盘",
    summary: "渠道分层给政策、双品牌错开不打架、授权联保写清楚。签约只是起点，养商才是增长。"
  },
  {
    file: "2026-07-25-ling-ji-chu",
    en: { title: "Getting Non-Technical Colleagues to Use AI Skills", summary: "Minimal input, friendly UI, graceful failure — three principles or nobody uses it.", tag: "AI Skills" },
    title: "让零基础同事用上 AI 技能包",
    date: "2026-07-25",
    tag: "AI 技能包",
    summary: "输入最少、界面友好、失败有兜底——三个设计原则，缺一个就没人用。"
  }
];

# -*- coding: utf-8 -*-
"""inject i18n resume keys for v1.7.0 about.html resume page (zh/en)."""
from pathlib import Path

P = Path(r"C:\Users\alext\Web\personal-site\js\i18n.js")
txt = P.read_text(encoding="utf-8")

# ---- 修改 about 头部 key ----
REPS = [
    ('"about.eyebrow": { zh: "About", en: "About" },',
     '"about.eyebrow": { zh: "Resume", en: "Resume" },'),
    ('"about.title": { zh: "关于我", en: "About Me" },',
     '"about.title": { zh: "个人简历", en: "Resume" },'),
    ('"about.timeline": { zh: "经历时间线", en: "Timeline" },',
     '"about.timeline": { zh: "工作经历", en: "Experience" },'),
]
hit = 0
for a, b in REPS:
    if a in txt:
        txt = txt.replace(a, b); hit += 1
    else:
        print("  [MISS]", a[:60])
print(f"about 头部修改命中 {hit}")

# ---- 注入 resume.* keys（插在 about.tl3.desc 行之后）----
RESUME = '''
    "about.sub": { zh: "电商操盘 × 团队体系 × AI 技能包工程 —— 能用数字对账的落地者。", en: "E-commerce operations × team building × AI skill-pack engineering — a builder whose numbers reconcile." },
    "resume.title": { zh: "电商操盘手 · 团队体系搭建 · AI 技能包工程负责人", en: "E-commerce Operator · Team Builder · AI Skill-pack Engineer" },
    "resume.base": { zh: "深圳 / 南京", en: "Shenzhen / Nanjing" },
    "resume.brief": { zh: "集团电商负责人：管理 15 人 6 岗团队与 49 家店铺矩阵，国内 9+ 平台与海外多平台双线推进，推动业务结构向国内海外 50/50 调整。另一条主线是把运营知识工程化——沉淀为 20+ 可复用的 AI 技能包（投流、视觉、看板、审批自动化、内容生产），让零基础同事一键使用。", en: "Leads e-commerce for the group: a 15-person, 6-role team across a 49-store matrix spanning 9+ domestic platforms and multiple overseas marketplaces, pushing the mix toward a 50/50 domestic-overseas split. A parallel track: engineering operational know-how into 20+ reusable AI skill packs — ads, visuals, dashboards, approval automation, content — usable by non-technical teammates with one click." },
    "resume.s1": { zh: "店铺矩阵", en: "Store Matrix" },
    "resume.s2": { zh: "团队规模 · 6 岗", en: "Team · 6 Roles" },
    "resume.s3": { zh: "AI 技能包", en: "AI Skill Packs" },
    "resume.s4": { zh: "国内平台", en: "Domestic Platforms" },
    "resume.s5": { zh: "亚马逊站点类目榜", en: "Amazon Category Lists" },
    "resume.j1.title": { zh: "万世康伦（KONLLEN）集团 · 电商运营负责人", en: "KONLLEN Group · E-commerce Operations Lead" },
    "resume.j1.p1": { zh: "搭建并管理电商团队：15 人、6 岗体系，配套岗位说明书与绩效考核标准", en: "Built and run an e-commerce team: 15 people across 6 roles, with job descriptions and performance standards." },
    "resume.j1.p2": { zh: "49 家店铺矩阵：覆盖国内 9+ 平台与海外多平台，推动国内外业务向 50/50 调整", en: "49-store matrix across 9+ domestic platforms and multiple overseas marketplaces, rebalancing toward 50/50." },
    "resume.j1.p3": { zh: "主打品牌进入亚马逊 5 站类目榜（日本 #5 / 德国 #8 / 美国 #11 / 加拿大 #11）", en: "Flagship brands on Amazon category lists across 5 marketplaces (JP #5 / DE #8 / US #11 / CA #11)." },
    "resume.j1.p4": { zh: "主导数据中台 / 财务 Agent / 审批自动化等工程化项目，用工具沉淀运营能力", en: "Led engineering projects — data platform, finance agent, approval automation — encoding operations into tooling." },
    "resume.j2.title": { zh: "AI 技能包工程体系", en: "AI Skill-pack Engineering" },
    "resume.j2.p1": { zh: "20+ 可复用技能包：投流计划与审核、视觉生产、数据看板、OA 审批、视频脚本等", en: "20+ reusable skill packs: ad planning & review, visual production, dashboards, OA approvals, video scripts." },
    "resume.j2.p2": { zh: "流水线化交付：分层开发 → 独立审计 → 版本化打包 → 按阶段回滚", en: "Pipeline delivery: layered dev → independent audit → versioned packaging → staged rollback." },
    "resume.j2.p3": { zh: "通用母版 + 业务分支双轨，既跨项目复用，又隔离业务敏感逻辑", en: "Generic template + business branch dual-track: reusable across projects while isolating sensitive logic." },
    "resume.j3.title": { zh: "多平台电商操盘积累", en: "Multi-platform E-commerce Track" },
    "resume.j3.p1": { zh: "国内兴趣电商 + 货架电商 + 跨境出海，从单店运营到多店铺矩阵", en: "Interest + shelf e-commerce domestically, going global; scaled from single stores to a multi-store matrix." },
    "resume.j3.p2": { zh: "经营数据中台：国内 ERP + 跨境财务双源，统一口径辅助决策", en: "Operational data platform combining domestic ERP and cross-border finance sources with reconciled metrics." },
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
    "resume.note": { zh: "说明：本简历基于本地工作沉淀整理，学历、入职年份等字段待本人补充后完善。", en: "Note: this resume is compiled from working records. Education and exact start dates will be added by the owner." },
'''
anchor = '    "about.tl3.desc":'
i = txt.find(anchor)
if i != -1:
    # 找到该行结尾
    j = txt.find("\n", i)
    txt = txt[: j + 1] + RESUME + txt[j + 1:]
    print("注入 resume.* keys 成功")
else:
    print("  [FATAL] 找不到 anchor")
    raise SystemExit(1)

P.write_text(txt, encoding="utf-8")
print("i18n.js 已更新")

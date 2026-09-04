# -*- coding: utf-8 -*-
"""
rewrite_i18n_v170.py —— v1.7.0 定位整改的 i18n 配套
1) 删除 b2b.*（26 行，B2B 招商段已移除）
2) 删除 brands.* / brand.*（品牌矩阵页已改造为项目作品集）
3) 去品牌化改写：招商/代理/品牌展示类文案 → 简历导向表述
   保留原则：任职公司名属履历必要信息，保留；品牌矩阵展示与招商招募，去除
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "js" / "i18n.js"

lines = P.read_text(encoding="utf-8").split("\n")

# ---------- 1+2) 删除死 key ----------
keep = []
dropped = {"b2b": 0, "brand": 0}
skip_comment = False
for ln in lines:
    s = ln.strip()
    if s.startswith('"b2b.') or s.startswith('"brands.') or s.startswith('"brand.'):
        dropped["b2b" if s.startswith('"b2b.') else "brand"] += 1
        skip_comment = True
        continue
    # 连带删除紧随其后的区块注释行
    if skip_comment and s.startswith("// ----") and ("品牌" in s or "B2B" in s):
        continue
    skip_comment = False
    keep.append(ln)

# 单独处理"品牌矩阵页"注释（在 brands.* 之前，前面循环无法回溯）
keep = [l for l in keep if l.strip() != "// ---- 品牌矩阵页 ----"]
print(f"删除 b2b.* {dropped['b2b']} 行、brands.*/brand.* {dropped['brand']} 行")

txt = "\n".join(keep)

# ---------- 3) 去品牌化改写 ----------
REPS = [
    # nav
    ('"nav.brands": { zh: "品牌矩阵", en: "Brands" }',
     '"nav.projects": { zh: "项目经历", en: "Projects" }'),
    # hero
    ('"hero.title1": { zh: "让品牌电商", en: "Making brand e-commerce" }',
     '"hero.title1": { zh: "让电商业务", en: "Scaling e-commerce operations" }'),
    ('"hero.sub": { zh: "操盘万世康伦（KONLLEN）集团电商，覆盖国内 9+ 平台与海外多平台，用 AI 技能包把重复工作自动化，让团队把时间花在增长上。"',
     '"hero.sub": { zh: "专注国内 + 跨境多平台电商操盘，覆盖 9+ 国内平台与海外多平台，用 AI 技能包把重复工作自动化，让团队把时间花在增长上。"'),
    # 能力卡
    ('"cap1.title": { zh: "品牌电商操盘", en: "Brand E-commerce" }',
     '"cap1.title": { zh: "电商操盘", en: "E-commerce Operations" }'),
    # 首页时间线
    ('"journey.tl1.desc": { zh: "KONLLEN 与 CRICAL 双品牌进入亚马逊 5 站品牌榜，9 品牌矩阵成型，双品牌 B2B 招商同步推进。"',
     '"journey.tl1.desc": { zh: "负责多品牌电商业务，主打品牌进入亚马逊 5 站类目榜；搭建 15 人 6 岗团队与 49 店铺矩阵，国内海外业务向 50/50 调整。"'),
    # 关于页时间线
    ('"about.tl1.desc": { zh: "KONLLEN 双品牌进入亚马逊 5 站品牌榜；推进 9 品牌矩阵与 B2B 招商。"',
     '"about.tl1.desc": { zh: "负责多品牌电商业务，主打品牌进入亚马逊 5 站类目榜；搭建团队与店铺矩阵，国内海外双线推进。"'),
    ('"about.tl3.desc": { zh: "国内兴趣电商 + 货架电商 + 跨境出海，从单店运营到品牌矩阵。"',
     '"about.tl3.desc": { zh: "国内兴趣电商 + 货架电商 + 跨境出海，从单店运营到多店铺矩阵。"'),
    # 作品集
    ('"work.w1.title": { zh: "KONLLEN 品牌电商体系", en: "KONLLEN Brand E-commerce" }',
     '"work.w1.title": { zh: "品牌电商运营体系", en: "Brand E-commerce Operations" }'),
    ('"work.w1.desc": { zh: "双品牌亚马逊 5 站品牌榜，国内 9+ 平台店铺矩阵。从单品到品牌矩阵的运营操盘。"',
     '"work.w1.desc": { zh: "多品牌进入亚马逊 5 站类目榜，国内 9+ 平台店铺矩阵。从单品到矩阵的运营操盘。"'),
    ('"work.w4.title": { zh: "Konllen Agent 技能中台", en: "Konllen Agent Platform" }',
     '"work.w4.title": { zh: "Agent 技能中台", en: "Agent Skill Platform" }'),
    ('"work.w4.desc": { zh: "五层架构品牌 Agent：整合 10 个 Skill、10 项自动化、监控仪表盘与 API 扩展框架。"',
     '"work.w4.desc": { zh: "五层架构业务 Agent：整合 10 个 Skill、10 项自动化、监控仪表盘与 API 扩展框架。"'),
    ('"work.w5.desc": { zh: "Agnes 品牌视觉管线：批量生图、PSD 素材包、钉钉流转，锚定 KONLLEN 品牌 VI。"',
     '"work.w5.desc": { zh: "Agnes 视觉生产管线：批量生图、PSD 素材包、钉钉流转，统一输出品牌视觉规范。"'),
    ('"work.w6.title": { zh: "CRICAL 品牌官网", en: "CRICAL Brand Website" }',
     '"work.w6.title": { zh: "品牌官网建设", en: "Brand Website" }'),
    # 博客 / 联系
    ('"blog.sub": { zh: "品牌电商与 AI 技能包的实战记录。"',
     '"blog.sub": { zh: "电商操盘与 AI 技能包的实战记录。"'),
    ('"contact.info.desc": { zh: "品牌电商咨询、AI 技能包合作、行业交流，欢迎联系。"',
     '"contact.info.desc": { zh: "电商操盘咨询、AI 技能包合作、行业交流，欢迎联系。"'),
    ('"contact.sub": { zh: "B2B 代理合作、品牌电商咨询、AI 技能包合作，或只是聊聊行业——都可以从这里开始。"',
     '"contact.sub": { zh: "项目合作、电商操盘咨询、AI 技能包合作，或只是聊聊行业——都可以从这里开始。"'),
    ('"opt.brand": { zh: "品牌 / 产品合作", en: "Brand / Product" }',
     '"opt.brand": { zh: "项目 / 业务合作", en: "Project / Business" }'),
    # 成绩单
    ('"ach.brands": { zh: "品牌矩阵", en: "Brand Matrix" }',
     '"ach.brands": { zh: "多品牌运营", en: "Multi-brand Operations" }'),
    ('"ach.brands.note": { zh: "台球 / 桌球用品，覆盖多价格带"',
     '"ach.brands.note": { zh: "多品牌并行运营，覆盖不同价格带与人群"'),
    ('"ach.amazon": { zh: "亚马逊站点品牌榜", en: "Amazon Brand Rankings" }',
     '"ach.amazon": { zh: "亚马逊站点类目榜", en: "Amazon Category Rankings" }'),
    ('"ach.amazon.note": { zh: "KONLLEN 日 #5 / 德 #8 · CRICAL 美 #11 / 加 #11"',
     '"ach.amazon.note": { zh: "日本 #5 / 德国 #8 · 美国 #11 / 加拿大 #11"'),
    ('"ach.t1.title": { zh: "双品牌进入亚马逊 5 站品牌榜", en: "Both brands ranked on Amazon across 5 marketplaces" }',
     '"ach.t1.title": { zh: "多品牌进入亚马逊 5 站类目榜", en: "Multiple brands ranked on Amazon across 5 marketplaces" }'),
    ('"ach.t1.desc": { zh: "KONLLEN 日本站 #5、德国站 #8；CRICAL 美国站 #11、加拿大站 #11。B2B 招商同步常态化推进。"',
     '"ach.t1.desc": { zh: "日本站 #5、德国站 #8；美国站 #11、加拿大站 #11。海外多站点运营常态化推进。"'),
    ('"ach.shots.todo": { zh: "品牌榜 / 后台数据截图待补充"',
     '"ach.shots.todo": { zh: "类目榜 / 后台数据截图待补充"'),
    ('"ach.shots.caption": { zh: "补图后此处展示亚马逊品牌榜与后台数据截图（assets/img/ 目录）"',
     '"ach.shots.caption": { zh: "补图后此处展示亚马逊类目榜与后台数据截图（assets/img/ 目录）"'),
    # 招聘页
    ('"careers.sub": { zh: "15 人电商团队、49 个店铺、9 个品牌、国内海外双线。这里不缺舞台，缺的是能把事做成的人。"',
     '"careers.sub": { zh: "15 人电商团队、49 个店铺、国内海外双线。这里不缺舞台，缺的是能把事做成的人。"'),
]

hit = miss = 0
for a, b in REPS:
    if a in txt:
        txt = txt.replace(a, b)
        hit += 1
    else:
        miss += 1
        print("  [MISS]", a[:70])

P.write_text(txt, encoding="utf-8")
print(f"\ni18n 改写：命中 {hit} 条，未匹配 {miss} 条")
print(f"i18n.js: {len(lines)} → {len(txt.split(chr(10)))} 行")

# 校验
t = P.read_text(encoding="utf-8")
print("\n=== 残留校验 ===")
for k in ['"b2b.', '"brands.', '"brand.', "KONLLEN", "CRICAL", "Konllen", "招商", "招募", "代理"]:
    print(f"  [{k}]: {t.count(k)}")

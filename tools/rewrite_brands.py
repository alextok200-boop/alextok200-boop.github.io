# -*- coding: utf-8 -*-
"""
rewrite_brands.py —— v1.7.0 定位整改
把 brands.html（品牌矩阵 + 招商表单 + 品牌授权申请表单）
改造为「项目作品集」页面，保留 URL 与 SEO 权重，内容全部脱敏去品牌。
"""
import io
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "brands.html"

PROJECTS = [
    {
        "tag": "数据基建 · 6 层架构",
        "name": "统一财务 AI Agent 与数据中台",
        "desc": "打通国内 ERP 与跨境 ERP 双数据源，搭建「采集 → 归一化 → 核算 → 分析 → 推送 → 交互」六层架构，"
                "以 Flask API + ECharts + SQLite 云部署落地，让财务口径与运营口径不再各说各话。",
        "meta": ["数据源：国内多平台 ERP + 跨境平台财务", "架构：6 层数据管道", "交付：云部署看板 + 定时推送"],
    },
    {
        "tag": "20+ 技能包 · 零基础可用",
        "name": "AI 技能包工程体系",
        "desc": "把投流计划、达人分析、视觉生产、数据看板等运营知识封装成可复用的 AI 技能包。"
                "分层开发、独立审计、版本化打包、按阶段回滚，零基础同事输入一个参数即可上手。",
        "meta": ["流水线：分层开发 + 独立审计 + 版本化打包", "治理：通用母版 → 业务分支", "覆盖：投流 · 视觉 · 看板 · 情报"],
    },
    {
        "tag": "49 店铺 · 国内外双线",
        "name": "多平台店铺矩阵运营",
        "desc": "覆盖 9+ 国内平台与多个海外平台共 49 家店铺，国内货架电商与兴趣电商并行，"
                "海外平台与独立站同步推进，业务结构持续向国内海外 50/50 调整。",
        "meta": ["规模：49 家店铺矩阵", "国内：货架电商 + 兴趣电商", "海外：多站点平台 + 独立站"],
    },
    {
        "tag": "15 人 · 6 岗体系",
        "name": "电商团队体系与绩效考核",
        "desc": "从 0 搭建电商团队至 15 人 6 岗体系，建立岗位说明书、绩效考核与评级标准，"
                "口径统一对齐到计算器与评级表两份表，做到可核验、可复现、可追溯。",
        "meta": ["规模：15 人 · 6 岗", "产出：岗位说明书 + 考核标准", "原则：两表口径对齐，修定义不改数字"],
    },
    {
        "tag": "一键安装 · 双版本",
        "name": "审批流程自动化",
        "desc": "把渠道授权、合作申请等审批流程沉淀为自动化技能，管理端与员工端双版本同步迭代，"
                "HR / 行政同事输入一个地址即可完成安装部署，无需开发介入。",
        "meta": ["形态：管理端 + 员工端双版本", "安装：单参数一键部署", "适用：零基础同事"],
    },
    {
        "tag": "短视频 · 详情页 · 投流",
        "name": "内容生产流水线",
        "desc": "短视频脚本、详情页生成、投放计划审核三条内容生产线并行迭代。"
                "脚本支持多镜头切换叙事弧线，详情页内置长页连续性引擎，投放计划走多维度审核。",
        "meta": ["脚本：多镜头叙事弧线", "详情页：长页连续性引擎", "投流：多维度计划审核"],
    },
]


def build_cards():
    out = []
    for i, p in enumerate(PROJECTS, 1):
        meta = "\n".join(
            '              <li>%s</li>' % m for m in p["meta"]
        )
        out.append(
            '          <article class="card feature-card project-card">\n'
            '            <div class="project-name">%02d</div>\n'
            '            <div class="project-tag">%s</div>\n'
            '            <h3 class="project-title">%s</h3>\n'
            '            <p class="project-desc">\n'
            '              %s\n'
            '            </p>\n'
            '            <ul class="project-meta">\n'
            '%s\n'
            '            </ul>\n'
            '          </article>' % (i, p["tag"], p["name"], p["desc"], meta)
        )
    return "\n\n".join(out)


def main():
    lines = P.read_text(encoding="utf-8").split("\n")

    # 1) head: title / meta / og
    body = "\n".join(lines)
    head_reps = [
        ("<title>品牌矩阵 - 戴程鹏</title>", "<title>项目作品 - 戴程鹏</title>"),
        ('<meta name="description" content="万世康伦集团 9 个台球/桌球用品品牌矩阵：KONLLEN、CRICAL、ZOKUE、COWCUE、欧力龙、梦之豪、伊利莱、万世康伦、科瑞克。">',
         '<meta name="description" content="戴程鹏主导的项目作品集：数据中台与财务 Agent、AI 技能包工程体系、49 店铺多平台矩阵、团队体系与绩效考核、审批自动化、内容生产流水线。">'),
        ('<meta property="og:title" content="品牌矩阵 - 戴程鹏">',
         '<meta property="og:title" content="项目作品 - 戴程鹏">'),
        ('<meta property="og:description" content="万世康伦集团 9 个台球/桌球用品品牌矩阵，含亚马逊品牌榜战绩与京东旗舰店。">',
         '<meta property="og:description" content="电商操盘、数据基建与 AI 技能包工程的项目作品集。">'),
    ]
    for a, b in head_reps:
        if a in body:
            body = body.replace(a, b)
        else:
            print("  [MISS-head]", a[:60])

    lines = body.split("\n")

    # 2) page-hero（1-based 61-70）
    hero_new = [
        '    <section class="page-hero">',
        '      <div class="container">',
        '        <p class="eyebrow">Projects</p>',
        '        <h1>项目作品</h1>',
        '        <p class="hero-sub">',
        '          主导过的系统性项目：从数据基建、AI 技能包工程，到多平台店铺矩阵与团队体系搭建。',
        '          下面每一条都是可核验的落地交付，不是概念稿。',
        '        </p>',
        '      </div>',
        '    </section>',
    ]
    lines[60:70] = hero_new

    # 3) 主内容 72-312 → 项目卡片网格
    cards = build_cards()
    content_new = [
        '    <section class="section">',
        '      <div class="container">',
        '        <div class="card-grid project-grid">',
        '',
        cards,
        '',
        '        </div>',
        '        <div class="b2b-cta" style="margin-top:40px;">',
        '          <a href="contact.html" class="btn btn-primary">聊聊合作</a>',
        '          <span class="b2b-hint">想了解某个项目的细节或落地过程，随时联系</span>',
        '        </div>',
        '      </div>',
    ]
    lines[71:312] = content_new

    P.write_text("\n".join(lines), encoding="utf-8")
    txt = P.read_text(encoding="utf-8")
    print("brands.html 改造完成")
    print("  行数:", len(txt.split("\n")))
    for k in ["KONLLEN", "CRICAL", "ZOKUE", "COWCUE", "招商", "授权", "brand-inquiry", "brand-auth-inquiry", "brand-card", "brand-name", "brand-tag"]:
        print(f"  残留 [{k}]: {txt.count(k)}")


if __name__ == "__main__":
    main()

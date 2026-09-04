# -*- coding: utf-8 -*-
"""
rewrite_about.py —— v1.7.0 about.html 简历化改造
保留站点公共头尾/脚本模板，仅重写 head 简介与 main 主体：
身份头(头像+头衔+联系) → 核心数字条 → 工作经历时间线(简历式)
→ 核心能力技能云 → 一条「信息待补」提示(用户补充学历/精确履历)
简历事实均来自本地知识库《记忆汇总整理/通用型方法论手册》，不编造。
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "about.html"

MAIN = """    <section class="section">
      <div class="container">

        <!-- 身份头 -->
        <div class="about-grid">
          <div class="about-avatar">
            <img src="assets/img/logo.png" alt="个人标识">
          </div>
          <div class="about-intro">
            <h2 class="resume-name">戴程鹏</h2>
            <p class="resume-title" data-i18n="resume.title">电商操盘手 · 团队体系搭建 · AI 技能包工程负责人</p>
            <p class="resume-contact">
              <span>📍 <span data-i18n="resume.base">深圳 / 南京</span></span>
              <span>✉️ alextok200@gmail.com</span>
              <span>GitHub: github.com/alextok200</span>
            </p>
            <p data-i18n="resume.brief">
              集团电商负责人：管理 15 人 6 岗团队与 49 家店铺矩阵，国内 9+ 平台与海外多平台双线推进，
              推动业务结构向国内海外 50/50 调整。另一条主线是把运营知识工程化——沉淀为 20+ 可复用的
              AI 技能包（投流、视觉、看板、审批自动化、内容生产），让零基础同事一键使用。
            </p>
          </div>
        </div>

        <!-- 核心数字条 -->
        <div class="resume-stats card">
          <div class="resume-stat"><b>49</b><span data-i18n="resume.s1">店铺矩阵</span></div>
          <div class="resume-stat"><b>15</b><span data-i18n="resume.s2">团队规模 · 6 岗</span></div>
          <div class="resume-stat"><b>20+</b><span data-i18n="resume.s3">AI 技能包</span></div>
          <div class="resume-stat"><b>9+</b><span data-i18n="resume.s4">国内平台</span></div>
          <div class="resume-stat"><b>5</b><span data-i18n="resume.s5">亚马逊站点类目榜</span></div>
        </div>

        <!-- 工作经历 -->
        <h2 class="section-title" data-i18n="about.timeline">工作经历</h2>
        <div class="timeline">

          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">现在</span>
              <h3 data-i18n="resume.j1.title">万世康伦（KONLLEN）集团 · 电商运营负责人</h3>
              <ul class="exp-points">
                <li data-i18n="resume.j1.p1">搭建并管理电商团队：15 人、6 岗体系，配套岗位说明书与绩效考核标准</li>
                <li data-i18n="resume.j1.p2">49 家店铺矩阵：覆盖国内 9+ 平台与海外多平台，推动国内外业务向 50/50 调整</li>
                <li data-i18n="resume.j1.p3">主打品牌进入亚马逊 5 站类目榜（日本 #5 / 德国 #8 / 美国 #11 / 加拿大 #11）</li>
                <li data-i18n="resume.j1.p4">主导数据中台 / 财务 Agent / 审批自动化等工程化项目，用工具沉淀运营能力</li>
              </ul>
            </div>
          </div>

          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">并行主线</span>
              <h3 data-i18n="resume.j2.title">AI 技能包工程体系</h3>
              <ul class="exp-points">
                <li data-i18n="resume.j2.p1">20+ 可复用技能包：投流计划与审核、视觉生产、数据看板、OA 审批、视频脚本等</li>
                <li data-i18n="resume.j2.p2">流水线化交付：分层开发 → 独立审计 → 版本化打包 → 按阶段回滚</li>
                <li data-i18n="resume.j2.p3">通用母版 + 业务分支双轨，既跨项目复用，又隔离业务敏感逻辑</li>
              </ul>
            </div>
          </div>

          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">更早</span>
              <h3 data-i18n="resume.j3.title">多平台电商操盘积累</h3>
              <ul class="exp-points">
                <li data-i18n="resume.j3.p1">国内兴趣电商 + 货架电商 + 跨境出海，从单店运营到多店铺矩阵</li>
                <li data-i18n="resume.j3.p2">经营数据中台：国内 ERP + 跨境财务双源，统一口径辅助决策</li>
              </ul>
            </div>
          </div>

        </div>

        <!-- 核心能力 -->
        <h2 class="section-title" data-i18n="resume.skills.title">核心能力</h2>
        <div class="skill-cloud">
          <span class="skill-tag" data-i18n="resume.sk.1">电商操盘（国内 + 跨境）</span>
          <span class="skill-tag" data-i18n="resume.sk.2">团队体系与绩效搭建</span>
          <span class="skill-tag" data-i18n="resume.sk.3">AI 技能包工程</span>
          <span class="skill-tag" data-i18n="resume.sk.4">数据中台（Flask · ECharts · SQLite）</span>
          <span class="skill-tag" data-i18n="resume.sk.5">ERP 数据对接</span>
          <span class="skill-tag" data-i18n="resume.sk.6">投放计划与审核</span>
          <span class="skill-tag" data-i18n="resume.sk.7">视觉与内容生产管线</span>
          <span class="skill-tag" data-i18n="resume.sk.8">流程自动化（审批 · 看板推送）</span>
          <span class="skill-tag" data-i18n="resume.sk.9">双语运营（中 / 英）</span>
        </div>

        <p class="resume-note" data-i18n="resume.note">
          说明：本简历基于本地工作沉淀整理，学历、入职年份等字段待本人补充后完善。
        </p>

      </div>
    </section>
"""


def main():
    txt = P.read_text(encoding="utf-8")

    # head meta
    reps = [
        ("<title>关于 - 戴程鹏</title>", "<title>个人简历 - 戴程鹏</title>"),
        ('<meta name="description" content="戴程鹏的个人介绍：万世康伦集团运营负责人，电商操盘手与技能包工程负责人。">',
         '<meta name="description" content="戴程鹏的个人简历：电商操盘手与 AI 技能包工程负责人，管理 15 人团队与 49 店铺矩阵，国内跨境双线。">'),
        ('<meta property="og:title" content="关于 - 戴程鹏">', '<meta property="og:title" content="个人简历 - 戴程鹏">'),
        ('<meta property="og:description" content="戴程鹏的个人介绍：万世康伦集团运营负责人，电商操盘手与技能包工程负责人。">',
         '<meta property="og:description" content="电商操盘 × 团队体系 × AI 技能包工程，能用数字对账的落地者。">'),
    ]
    for a, b in reps:
        if a in txt:
            txt = txt.replace(a, b)
        else:
            print("  [MISS-head]", a[:60])

    # page-hero
    old_hero = """        <p class="eyebrow" data-i18n="about.eyebrow">About</p>
        <h1 data-i18n="about.title">关于我</h1>"""
    new_hero = """        <p class="eyebrow" data-i18n="about.eyebrow">Resume</p>
        <h1 data-i18n="about.title">个人简历</h1>
        <p class="hero-sub" data-i18n="about.sub">电商操盘 × 团队体系 × AI 技能包工程 —— 能用数字对账的落地者。</p>"""
    if old_hero in txt:
        txt = txt.replace(old_hero, new_hero)
        print("  OK page-hero")
    else:
        print("  [MISS] page-hero")

    # 主 section：定位原主块并替换
    start_marker = '        <div class="about-grid">'
    end_marker = "      </div>\n    </section>\n  </main>"
    i = txt.find(start_marker)
    if i == -1:
        print("  [FATAL] 找不到 about-grid 起始")
        return
    # 回退到该 section 起始
    sec_start = txt.rfind("    <section class=\"section\">", 0, i)
    if sec_start == -1:
        print("  [FATAL] 找不到主 section")
        return
    j = txt.find(end_marker, i)
    if j == -1:
        print("  [FATAL] 找不到 section 结束")
        return
    txt = txt[:sec_start] + MAIN + txt[j:]
    P.write_text(txt, encoding="utf-8")
    print("about.html 简历化完成")

    # 校验
    t = P.read_text(encoding="utf-8")
    print("  section 开/闭:", t.count("<section"), "/", t.count("</section>"))
    print("  div 开/闭:", t.count("<div"), "/", t.count("</div>"))
    print("  含 resume-name:", "resume-name" in t)


if __name__ == "__main__":
    main()

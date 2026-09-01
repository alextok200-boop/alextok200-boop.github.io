# -*- coding: utf-8 -*-
"""
应用岗位 JD 终稿到 careers.html（v1.6.2，v1.6.9 岗位重排）。

v1.6.9 变更：新增第 2 位「跨境电商运营（Lazada / Shopee 东南亚）」，
原 Amazon / Temu 岗顺移至第 3 位、AI 技能包工程岗顺移至第 4 位。
i18n key 已与展示顺序对齐（job1→job4）。

数据来源（全部来自知识库，无杜撰）：
  1. HR 技能包 hr-compliance-templates/templates/岗位说明书-*-v1.6.0.docx
     —— TikTok Shop运营 / Amazon运营 / Temu运营 / 数据分析市场调投 的职责、任职资格、KPI、常用系统
  2. D:/康伦品牌/团队战力执行文档/各平台运营岗位人员画像-v1.0.0.docx
     —— 能力模型、录用优先级、红线（一票否决）
  3. D:/康伦品牌/团队战力执行文档/万世康伦电商团队-组织编制与职责地图-v1.0.0.docx
     —— 汇报线、数据汇报责任口径
  4. D:/康伦品牌/团队战力执行文档/万世康伦-AI技术人员岗位需求与KPI考核表-v1.0.0.docx
     —— AI 岗 5 项能力维度与 KPI 权重

⚠️ i18n.js 用 textContent 替换文本，因此 data-i18n 元素内部不能嵌套标签，
    所有需要强调的部分都拆成并列的兄弟元素（本脚本已按此结构生成）。

幂等：可重复执行。
"""
import os
import re
import io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ============================================================
# 1. CSS：JD 终稿版式
# ============================================================
CSS_ADD = """
/* ============================================================
   v1.6.2 新增：JD 终稿版式（汇报线 / KPI 考核 / 红线 / 常用系统）
   ============================================================ */

.job-report {
  margin-top: 10px;
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.7;
}

.job-report b {
  color: var(--violet-3);
  font-weight: 600;
}

.job-sep {
  margin: 0 8px;
  color: var(--border);
}

.job-kpi {
  list-style: none;
}

.job-kpi li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.9;
  padding: 2px 0 2px 16px;
  position: relative;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
}

.job-kpi li:last-child {
  border-bottom: none;
}

.job-kpi li::before {
  content: "\\00b7";
  position: absolute;
  left: 4px;
  color: var(--violet-2);
}

.job-kpi .kpi-w {
  flex-shrink: 0;
  color: var(--neon-green);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}

.job-sys {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.7;
}

.job-sys b {
  color: var(--violet-3);
  font-weight: 600;
}

.job-redline {
  margin-top: 12px;
  padding: 10px 14px;
  border-left: 3px solid var(--neon-pink);
  background: rgba(255, 94, 201, 0.05);
  border-radius: 0 8px 8px 0;
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.7;
}

.job-redline b {
  color: var(--neon-pink);
  font-weight: 600;
}

.job-culture {
  margin-top: 24px;
  padding: 14px 18px;
  border-left: 3px solid var(--violet-2);
  background: rgba(147, 51, 234, 0.06);
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  color: var(--text-dim);
  line-height: 1.8;
}
"""

css_path = os.path.join(ROOT, "css", "style.css")
css = io.open(css_path, encoding="utf-8").read()
if "v1.6.2 新增：JD 终稿版式" not in css:
    css = css.rstrip() + "\n" + CSS_ADD
    io.open(css_path, "w", encoding="utf-8").write(css)
    print("CSS 已追加 JD 版式")
else:
    print("CSS 已存在 JD 版式，跳过")


# ============================================================
# 2. careers.html：三张岗位卡 + 汇报文化 + 备注
# ============================================================
MAIL_JOB1 = "mailto:alextok200@gmail.com?subject=%E5%BA%94%E8%81%98-TK%E8%B7%A8%E5%A2%83%E7%9B%B4%E6%92%AD%E8%BF%90%E8%90%A5"
MAIL_JOB2 = "mailto:alextok200@gmail.com?subject=%E5%BA%94%E8%81%98-Lazada-Shopee%E4%B8%9C%E5%8D%97%E4%BA%9A%E8%BF%90%E8%90%A5"
MAIL_JOB3 = "mailto:alextok200@gmail.com?subject=%E7%AE%80%E5%8E%86%E6%8A%95%E9%80%92-%E8%BF%90%E8%90%A5%E8%87%AA%E5%8A%A8%E5%8C%96"
MAIL_JOB4 = "mailto:alextok200@gmail.com?subject=%E7%AE%80%E5%8E%86%E6%8A%95%E9%80%92-%E8%B7%A8%E5%A2%83%E7%94%B5%E5%95%86%E8%BF%90%E8%90%A5"

JOBS_HTML = """        <article class="card feature-card job-card">
          <div class="job-head">
            <h3 data-i18n="job1.title">TK 跨境直播运营</h3>
            <span class="job-tag job-tag-open" data-i18n="job.status.open">在招</span>
          </div>
          <div class="job-meta">
            <span data-i18n="job1.loc">南京（江苏）· 深圳可选</span>
            <span data-i18n="job1.type">全职</span>
            <span data-i18n="job1.dept">跨境电商</span>
          </div>
          <p class="job-report">
            <span data-i18n="job.report">汇报对象</span>：<b data-i18n="job1.report.val">跨境负责人 / 平台负责人</b><span class="job-sep">·</span><span data-i18n="job.code">岗位编码</span>：HR-JD-TTS06
          </p>
          <p class="job-desc" data-i18n="job1.desc">负责 TikTok Shop 小店运营，以短视频挂车 + 直播场控 + 达人联盟驱动 GMV，对店铺 GMV、直播间转化与联盟 ROI 负责。</p>
          <h4 data-i18n="job.duty">岗位职责</h4>
          <ul class="job-list">
            <li data-i18n="job1.d1">短视频：挂车选品与转化，维护内容日历</li>
            <li data-i18n="job1.d2">直播：小店直播排期与场控，输出直播表</li>
            <li data-i18n="job1.d3">联盟：达人联盟带货与佣金管理，维护联盟台账</li>
            <li data-i18n="job1.d4">投流：Shop Ads 计划搭建与 ROI 优化，维护投流台账</li>
            <li data-i18n="job1.d5">数据：罗盘复盘与优化，输出周报与下一步动作</li>
          </ul>
          <h4 data-i18n="job.req">任职要求</h4>
          <ul class="job-list">
            <li data-i18n="job1.r1">大专及以上，电子商务 / 市场营销优先</li>
            <li data-i18n="job1.r2">2 年以上 TikTok Shop 或抖音直播运营经验，有台球 / 运动器材类目优先</li>
            <li data-i18n="job1.r3">熟悉平台规则、流量与转化逻辑，英语能支撑基础商务沟通</li>
            <li data-i18n="job1.r4">会搭投放计划、控 ROI，能看懂转化漏斗并据此调整动作</li>
            <li data-i18n="job1.r5">数据敏感、执行强、抗压，能接受直播排班（晚间场次）</li>
          </ul>
          <h4 data-i18n="job.kpi">考核口径（KPI）</h4>
          <ul class="job-kpi">
            <li><span data-i18n="job1.k1">GMV 达成率</span><span class="kpi-w">35%</span></li>
            <li><span data-i18n="job1.k2">直播间转化</span><span class="kpi-w">20%</span></li>
            <li><span data-i18n="job1.k3">短视频转化</span><span class="kpi-w">20%</span></li>
            <li><span data-i18n="job1.k4">联盟 ROI</span><span class="kpi-w">15%</span></li>
            <li><span data-i18n="job1.k5">店铺评分</span><span class="kpi-w">10%</span></li>
          </ul>
          <p class="job-sys">
            <span data-i18n="job.sys">常用系统</span>：<b data-i18n="job1.sys.val">TikTok Shop 后台（短视频 / 直播 / 联盟 / Shop Ads）</b>
          </p>
          <p class="job-plus" data-i18n="job1.plus">加分项：台球 / 运动器材类目经验、现有海外达人资源、基础剪辑、小语种（日 / 德）。</p>
          <p class="job-redline">
            <b data-i18n="job.red">红线（一票否决）</b>：<span data-i18n="job1.red.val">虚假宣传 / 绝对化用语 / 刷量刷单 / 违规带货 / 侵权仿牌</span>
          </p>
          <a class="btn btn-primary btn-sm" href="__MAIL1__" data-i18n="job.apply">投递这个岗位</a>
        </article>

        <article class="card feature-card job-card job-dim">
          <div class="job-head">
            <h3 data-i18n="job2.title">跨境电商运营（Lazada / Shopee 东南亚）</h3>
            <span class="job-tag" data-i18n="job.status.pool">储备</span>
          </div>
          <div class="job-meta">
            <span data-i18n="job2.loc">南通（跨境主阵地）· 南京</span>
            <span data-i18n="job2.type">全职</span>
            <span data-i18n="job2.dept">跨境电商</span>
          </div>
          <p class="job-report">
            <span data-i18n="job.report">汇报对象</span>：<b data-i18n="job2.report.val">跨境负责人 / 平台负责人</b><span class="job-sep">·</span><span data-i18n="job.code">岗位编码</span>：HR-JD-LZD03 / HR-JD-SHP04
          </p>
          <p class="job-desc" data-i18n="job2.desc">负责 Lazada / Shopee 东南亚站点从 0 起盘：开店合规 → 本地化选品上架 → 站内活动与大促 → 履约与评分，对站点 GMV、店铺评分与履约 SLA 负责。该岗位为储备状态，站点开通时开放，可先投简历进入人才池。</p>
          <h4 data-i18n="job.duty">岗位职责</h4>
          <ul class="job-list">
            <li data-i18n="job2.d1">起盘：站点开通与资质合规（执照 / 类目准入 / 税务与清关资料），按站点逐一落地</li>
            <li data-i18n="job2.d2">本地化：标题 / 主图 / 详情的多语种与币种本地化，维护 Listing 表与本地词库</li>
            <li data-i18n="job2.d3">选品：按站点需求选品与定价，算清头程 / 佣金 / 关税 / 汇率后的到手毛利</li>
            <li data-i18n="job2.d4">活动：报名大促（9.9 / 10.10 / 11.11 / 12.12）与站内资源位，控折扣与毛利</li>
            <li data-i18n="job2.d5">履约与评分：发货时效、物流轨迹与售后响应，店铺评分与罚款项清零</li>
            <li data-i18n="job2.d6">竞品与复盘：维护五站竞品台账（销量 / 价格 / 评价 / 流量），输出周报与下一步动作</li>
          </ul>
          <h4 data-i18n="job.req">任职要求</h4>
          <ul class="job-list">
            <li data-i18n="job2.r1">大专及以上，电子商务 / 国际贸易 / 市场营销优先</li>
            <li data-i18n="job2.r2">1 年以上 Lazada 或 Shopee 运营经验，有东南亚站点从 0 起盘经历优先</li>
            <li data-i18n="job2.r3">熟悉东南亚市场差异：站点规则、币种与物流方案、大促节奏、消费习惯</li>
            <li data-i18n="job2.r4">会算跨境成本与到手毛利，能做本地化定价，不靠拍脑袋报价</li>
            <li data-i18n="job2.r5">数据敏感、执行强，能自己搭表维护竞品与 Listing；英语可支撑商务沟通</li>
          </ul>
          <h4 data-i18n="job.kpi">考核口径（KPI）</h4>
          <ul class="job-kpi">
            <li><span data-i18n="job2.k1">新站起盘进度（开店 / 上架 / 首单）</span><span class="kpi-w">30%</span></li>
            <li><span data-i18n="job2.k2">GMV 达成率</span><span class="kpi-w">25%</span></li>
            <li><span data-i18n="job2.k3">店铺评分与履约 SLA</span><span class="kpi-w">20%</span></li>
            <li><span data-i18n="job2.k4">竞品与选品台账质量</span><span class="kpi-w">15%</span></li>
            <li><span data-i18n="job2.k5">活动投产 ROI</span><span class="kpi-w">10%</span></li>
          </ul>
          <p class="job-sys">
            <span data-i18n="job.sys">常用系统</span>：<b data-i18n="job2.sys.val">Lazada Seller Center、Shopee 卖家中心（菲 / 马 / 泰 / 墨 / 阿）、lazada-data 与 shopee-data 看板、shopee-competitor-analysis 竞品台账</b>
          </p>
          <p class="job-plus" data-i18n="job2.plus">加分项：泰语 / 马来语 / 印尼语 / 西语能力、东南亚海外仓或本地物流资源、台球 / 运动器材类目经验、跨境清关实操。</p>
          <p class="job-redline">
            <b data-i18n="job.red">红线（一票否决）</b>：<span data-i18n="job2.red.val">刷单刷评 / 侵权仿牌 / 虚假发货 / 恶意低价扰乱 / 用爬虫或自动化脚本违规采集平台数据</span>
          </p>
          <a class="btn btn-ghost btn-sm" href="__MAIL2__" data-i18n="job.apply.pool">投简历进人才池</a>
        </article>

        <article class="card feature-card job-card job-dim">
          <div class="job-head">
            <h3 data-i18n="job3.title">运营自动化 / AI 技能包工程</h3>
            <span class="job-tag" data-i18n="job.status.pool">储备</span>
          </div>
          <div class="job-meta">
            <span data-i18n="job3.loc">远程协作 · 南京</span>
            <span data-i18n="job3.type">全职 / 兼职</span>
            <span data-i18n="job3.dept">数据与增长（技术中台）</span>
          </div>
          <p class="job-report">
            <span data-i18n="job.report">汇报对象</span>：<b data-i18n="job3.report.val">技术负责人 / 副总</b><span class="job-sep">·</span><span data-i18n="job.code">岗位编码</span>：HR-JD-DA06 / AI 技术人员 v1.0.0
          </p>
          <p class="job-desc" data-i18n="job3.desc">技术 / 数据中台支撑岗。打通各平台 API → 沉淀数据底座 → 运维服务器 → 迭代 AI 需求，把投流审核、视觉生产、数据看板、OA 审批这类重复工作封装成可安装的 AI 技能包，交付给零基础同事使用。</p>
          <h4 data-i18n="job.duty">岗位职责</h4>
          <ul class="job-list">
            <li data-i18n="job3.d1">API 打通：京东 / 天猫 / 抖音 / 拼多多 + Amazon / Shopify / Temu / 阿里国际站，建自动拉取与鉴权维护</li>
            <li data-i18n="job3.d2">数据底座：聚水潭 / 领星 / 钉钉多维表等异构数据归一化，统一指标口径与质量校验</li>
            <li data-i18n="job3.d3">AI 需求迭代：技能包开发（SKILL.md + run.py）、安全审计与 SHA 校验、语义化版本发布与回滚</li>
            <li data-i18n="job3.d4">服务器部署：云主机 / 容器环境搭建、应用发布与反向代理、公网暴露</li>
            <li data-i18n="job3.d5">日常运维：监控告警、定期备份与恢复演练、日志巡检、安全加固</li>
          </ul>
          <h4 data-i18n="job.req">任职要求</h4>
          <ul class="job-list">
            <li data-i18n="job3.r1">大专及以上，统计 / 计算机 / 电商数据相关优先</li>
            <li data-i18n="job3.r2">2 年以上电商数据分析、投流或自动化工程经验</li>
            <li data-i18n="job3.r3">熟悉电商指标体、投放逻辑与 SQL / 表处理，能用 Python 或 Node 写脚本</li>
            <li data-i18n="job3.r4">做过看板类应用（如 Flask API + ECharts + SQLite）或同等项目</li>
            <li data-i18n="job3.r5">逻辑清晰、有工作流洁癖，能把模糊需求拆成可交付的小步</li>
          </ul>
          <h4 data-i18n="job.kpi">考核口径（KPI）</h4>
          <ul class="job-kpi">
            <li><span data-i18n="job3.k1">各平台 API 打通</span><span class="kpi-w">25%</span></li>
            <li><span data-i18n="job3.k2">AI 需求升级迭代</span><span class="kpi-w">25%</span></li>
            <li><span data-i18n="job3.k3">数据底座维护</span><span class="kpi-w">22%</span></li>
            <li><span data-i18n="job3.k4">服务器部署能力</span><span class="kpi-w">15%</span></li>
            <li><span data-i18n="job3.k5">服务器日常维护</span><span class="kpi-w">13%</span></li>
          </ul>
          <p class="job-sys">
            <span data-i18n="job.sys">常用系统</span>：<b data-i18n="job3.sys.val">ai-cockpit 看板、生意参谋、京东商智、蝉妈妈、各平台投流后台、billiards-trend-intel</b>
          </p>
          <p class="job-plus" data-i18n="job3.plus">加分项：有已发布的可安装技能包作品、熟悉钉钉 / DWS / Aitable 开放平台、做过 OCR 或图像链路。</p>
          <p class="job-redline">
            <b data-i18n="job.red">红线（一票否决）</b>：<span data-i18n="job3.red.val">泄露经营数据 / 私自操作生产后台 / 敷衍错录造成资损 / 交付未过审的技能包</span>
          </p>
          <a class="btn btn-ghost btn-sm" href="__MAIL3__" data-i18n="job.apply.pool">投简历进人才池</a>
        </article>

        <article class="card feature-card job-card job-dim">
          <div class="job-head">
            <h3 data-i18n="job4.title">跨境电商运营（Amazon / Temu）</h3>
            <span class="job-tag" data-i18n="job.status.pool">储备</span>
          </div>
          <div class="job-meta">
            <span data-i18n="job4.loc">南通（跨境主阵地）· 南京</span>
            <span data-i18n="job4.type">全职</span>
            <span data-i18n="job4.dept">跨境电商</span>
          </div>
          <p class="job-report">
            <span data-i18n="job.report">汇报对象</span>：<b data-i18n="job4.report.val">跨境负责人 / 平台负责人</b><span class="job-sep">·</span><span data-i18n="job.code">岗位编码</span>：HR-JD-AMZ01 / HR-JD-TEMU02
          </p>
          <p class="job-desc" data-i18n="job4.desc">负责 Amazon 多站点与 Temu 半 / 全托管运营：以 Listing + 广告 + FBA 驱动 GMV 与排名，以备货履约与核价驱动走量与毛利。该岗位为储备状态，业务放量时开放，可先投简历进入人才池。</p>
          <h4 data-i18n="job.duty">岗位职责</h4>
          <ul class="job-list">
            <li data-i18n="job4.d1">Listing：标题 / 图文 / A+ 优化与关键词，维护 Listing 表</li>
            <li data-i18n="job4.d2">广告：SP / SB / SD 结构与 ACOS 优化，做否定词与预算再分配</li>
            <li data-i18n="job4.d3">FBA 库存：补货计划与库存周转，控 IPI，不断货不积压</li>
            <li data-i18n="job4.d4">合规与评分：合规索评、类目审核与账户健康维护</li>
            <li data-i18n="job4.d5">Temu 履约：国内仓备货、核价跟进与爆款选品，控退货率</li>
            <li data-i18n="job4.d6">数据复盘：销量与毛利复盘，输出周报与迭代动作</li>
          </ul>
          <h4 data-i18n="job.req">任职要求</h4>
          <ul class="job-list">
            <li data-i18n="job4.r1">大专及以上，电子商务 / 市场营销优先</li>
            <li data-i18n="job4.r2">2 年以上 Amazon 或 Temu 运营经验，有台球 / 运动器材类目优先</li>
            <li data-i18n="job4.r3">Amazon：懂 A9 算法、关键词与转化逻辑、FBA 与自发货差异、Coupon / BD / LD 节奏</li>
            <li data-i18n="job4.r4">Temu：懂核价逻辑与毛利空间，能推动备货节奏避免断货 / 积压</li>
            <li data-i18n="job4.r5">数据敏感、执行强、抗压，能用数据定位断点并迭代</li>
          </ul>
          <h4 data-i18n="job.kpi">考核口径（KPI · 双线）</h4>
          <ul class="job-kpi">
            <li><span data-i18n="job4.k1">GMV 达成率</span><span class="kpi-w">35%</span></li>
            <li><span data-i18n="job4.k2">ACOS ≤ 红线（Amazon）/ 履约时效 ≤ SLA（Temu）</span><span class="kpi-w">20%</span></li>
            <li><span data-i18n="job4.k3">BSR 排名（Amazon）/ 毛利率 ≥ 红线（Temu）</span><span class="kpi-w">20%</span></li>
            <li><span data-i18n="job4.k4">库存周转（Amazon）/ 缺货率 ≤ 红线（Temu）</span><span class="kpi-w">15%</span></li>
            <li><span data-i18n="job4.k5">评分 ≥ 红线（Amazon）/ 退货率 ≤ 红线（Temu）</span><span class="kpi-w">10%</span></li>
          </ul>
          <p class="job-sys">
            <span data-i18n="job.sys">常用系统</span>：<b data-i18n="job4.sys.val">Amazon Seller Central（美 / 加 / 英 / 德 / 日 5 站）、广告与品牌分析、Temu 半托管·全托管后台</b>
          </p>
          <p class="job-plus" data-i18n="job4.plus">加分项：Amazon 多站点（美 / 加 / 英 / 德 / 日）实操、海外仓资源、小语种。</p>
          <p class="job-redline">
            <b data-i18n="job.red">红线（一票否决）</b>：<span data-i18n="job4.red.val">刷评 / 刷单 / 跟卖侵权 / 规避二审 / 虚假发货 / 货不对板 / 恶意低价扰乱</span>
          </p>
          <a class="btn btn-ghost btn-sm" href="__MAIL4__" data-i18n="job.apply.pool">投简历进人才池</a>
        </article>

        <p class="job-culture" data-i18n="careers.culture">团队汇报口径：不允许只报结果数字，须同步「原因 — 结论 — 下一步动作」；重大错价、处罚、库存异常须当天上报。</p>

        <p class="todo-note" data-i18n="careers.note">薪资范围面议（按平台经验与操盘结果定级）。面试含平台实操笔试，会追问真实操盘数据：峰值月销、ACOS、最高场观、千川 ROI——我们只认跑出来的数。</p>
"""

JOBS_HTML = (JOBS_HTML.replace("__MAIL1__", MAIL_JOB1)
                      .replace("__MAIL2__", MAIL_JOB2)
                      .replace("__MAIL3__", MAIL_JOB3)
                      .replace("__MAIL4__", MAIL_JOB4))

html_path = os.path.join(ROOT, "careers.html")
html = io.open(html_path, encoding="utf-8").read()
pat = re.compile(
    r'        <article class="card feature-card job-card">.*?'
    r'        <p class="todo-note".*?</p>\n', re.S)
if pat.search(html):
    html = pat.sub(lambda m: JOBS_HTML, html, count=1)
    io.open(html_path, "w", encoding="utf-8").write(html)
    print("careers.html 岗位卡已替换为 JD 终稿")
else:
    print("WARN careers.html 未匹配到岗位卡区块（可能已是新版）")


# ============================================================
# 3. i18n：补齐中英词条
# ============================================================
ENTRIES = [
    # ---- 公共 ----
    ("job.report", "汇报对象", "Reports to"),
    ("job.code", "岗位编码", "Job code"),
    ("job.kpi", "考核口径（KPI）", "How you'll be measured (KPI)"),
    ("job.sys", "常用系统", "Systems you'll use"),
    ("job.red", "红线（一票否决）", "Red lines (auto-reject)"),
    # ---- 岗位一：TK 跨境直播运营 ----
    ("job1.title", "TK 跨境直播运营", "TikTok Cross-border Live Operations"),
    ("job1.loc", "南京（江苏）· 深圳可选", "Nanjing (Jiangsu) · Shenzhen optional"),
    ("job1.type", "全职", "Full-time"),
    ("job1.dept", "跨境电商", "Cross-border E-commerce"),
    ("job1.report.val", "跨境负责人 / 平台负责人", "Cross-border Lead / Platform Lead"),
    ("job1.desc", "负责 TikTok Shop 小店运营，以短视频挂车 + 直播场控 + 达人联盟驱动 GMV，对店铺 GMV、直播间转化与联盟 ROI 负责。",
     "Own TikTok Shop operations — short-video tagging, live-room floor control and creator affiliate — accountable for shop GMV, live conversion and affiliate ROI."),
    ("job1.d1", "短视频：挂车选品与转化，维护内容日历", "Short video: product tagging and conversion, maintain the content calendar"),
    ("job1.d2", "直播：小店直播排期与场控，输出直播表", "Live: shop live scheduling and floor control, maintain the live calendar"),
    ("job1.d3", "联盟：达人联盟带货与佣金管理，维护联盟台账", "Affiliate: creator partnership and commission management, maintain the affiliate ledger"),
    ("job1.d4", "投流：Shop Ads 计划搭建与 ROI 优化，维护投流台账", "Ads: build Shop Ads campaigns and optimise ROI, maintain the spend ledger"),
    ("job1.d5", "数据：罗盘复盘与优化，输出周报与下一步动作", "Data: review via analytics dashboard, ship weekly reports with next actions"),
    ("job1.r1", "大专及以上，电子商务 / 市场营销优先", "College degree or above; e-commerce / marketing preferred"),
    ("job1.r2", "2 年以上 TikTok Shop 或抖音直播运营经验，有台球 / 运动器材类目优先",
     "2+ years on TikTok Shop or Douyin live operations; billiards / sports equipment category a plus"),
    ("job1.r3", "熟悉平台规则、流量与转化逻辑，英语能支撑基础商务沟通",
     "Solid grasp of platform rules, traffic and conversion logic; English sufficient for business communication"),
    ("job1.r4", "会搭投放计划、控 ROI，能看懂转化漏斗并据此调整动作",
     "Can build ad campaigns and control ROI; reads the conversion funnel and acts on it"),
    ("job1.r5", "数据敏感、执行强、抗压，能接受直播排班（晚间场次）",
     "Data-sensitive, strong execution, resilient; open to live-stream shifts (evening slots)"),
    ("job1.k1", "GMV 达成率", "GMV attainment"),
    ("job1.k2", "直播间转化", "Live-room conversion"),
    ("job1.k3", "短视频转化", "Short-video conversion"),
    ("job1.k4", "联盟 ROI", "Affiliate ROI"),
    ("job1.k5", "店铺评分", "Shop rating"),
    ("job1.sys.val", "TikTok Shop 后台（短视频 / 直播 / 联盟 / Shop Ads）",
     "TikTok Shop Seller Center (video / live / affiliate / Shop Ads)"),
    ("job1.plus", "加分项：台球 / 运动器材类目经验、现有海外达人资源、基础剪辑、小语种（日 / 德）。",
     "Bonus: billiards / sports category experience, existing overseas creator network, basic video editing, extra language (JP / DE)."),
    ("job1.red.val", "虚假宣传 / 绝对化用语 / 刷量刷单 / 违规带货 / 侵权仿牌",
     "False advertising, superlative claims, fake orders or traffic, non-compliant selling, counterfeit or IP infringement"),
        # ---- 岗位二：跨境电商运营（Lazada / Shopee 东南亚）----
    ("job2.title", "跨境电商运营（Lazada / Shopee 东南亚）", "Cross-border E-commerce Operator (Lazada / Shopee SEA)"),
    ("job2.loc", "南通（跨境主阵地）· 南京", "Nantong (cross-border hub) · Nanjing"),
    ("job2.type", "全职", "Full-time"),
    ("job2.dept", "跨境电商", "Cross-border E-commerce"),
    ("job2.report.val", "跨境负责人 / 平台负责人", "Cross-border Lead / Platform Lead"),
    ("job2.desc", "负责 Lazada / Shopee 东南亚站点从 0 起盘：开店合规 → 本地化选品上架 → 站内活动与大促 → 履约与评分，对站点 GMV、店铺评分与履约 SLA 负责。该岗位为储备状态，站点开通时开放，可先投简历进入人才池。",
     "Own the Lazada / Shopee SEA build-out from zero: onboarding compliance, localised listing, in-platform campaigns and mega-sales, fulfilment and ratings. Accountable for site GMV, shop rating and fulfilment SLA. Currently a talent-pool role: send your CV and we'll reach out when the sites go live."),
    ("job2.d1", "起盘：站点开通与资质合规（执照 / 类目准入 / 税务与清关资料），按站点逐一落地", "Build-out: site onboarding and compliance (licence, category approval, tax and customs docs), rolled out site by site"),
    ("job2.d2", "本地化：标题 / 主图 / 详情的多语种与币种本地化，维护 Listing 表与本地词库", "Localisation: multilingual and multi-currency titles, images and detail pages; maintain the listing sheet and local keyword bank"),
    ("job2.d3", "选品：按站点需求选品与定价，算清头程 / 佣金 / 关税 / 汇率后的到手毛利", "Assortment: site-fit selection and pricing, with landed margin worked out after freight, commission, duty and FX"),
    ("job2.d4", "活动：报名大促（9.9 / 10.10 / 11.11 / 12.12）与站内资源位，控折扣与毛利", "Campaigns: enter mega-sales (9.9 / 10.10 / 11.11 / 12.12) and in-platform placements; control discounting and margin"),
    ("job2.d5", "履约与评分：发货时效、物流轨迹与售后响应，店铺评分与罚款项清零", "Fulfilment and ratings: dispatch SLAs, tracking and after-sales response; keep shop ratings up and penalties at zero"),
    ("job2.d6", "竞品与复盘：维护五站竞品台账（销量 / 价格 / 评价 / 流量），输出周报与下一步动作", "Competitive review: maintain the five-site competitor ledger (sales / price / reviews / traffic), ship weekly reports with next actions"),
    ("job2.r1", "大专及以上，电子商务 / 国际贸易 / 市场营销优先", "College degree or above; e-commerce / international trade / marketing preferred"),
    ("job2.r2", "1 年以上 Lazada 或 Shopee 运营经验，有东南亚站点从 0 起盘经历优先", "1+ year on Lazada or Shopee; having launched a SEA site from zero is a strong plus"),
    ("job2.r3", "熟悉东南亚市场差异：站点规则、币种与物流方案、大促节奏、消费习惯", "Knows how SEA markets differ: site rules, currency and logistics options, mega-sale cadence, buying habits"),
    ("job2.r4", "会算跨境成本与到手毛利，能做本地化定价，不靠拍脑袋报价", "Can work landed cost and margin properly, price per market, and never quotes off the top of their head"),
    ("job2.r5", "数据敏感、执行强，能自己搭表维护竞品与 Listing；英语可支撑商务沟通", "Data-sensitive and hands-on; builds their own sheets for listings and competitors; English sufficient for business communication"),
    ("job2.k1", "新站起盘进度（开店 / 上架 / 首单）", "Site launch progress (onboarding / listing / first order)"),
    ("job2.k2", "GMV 达成率", "GMV attainment"),
    ("job2.k3", "店铺评分与履约 SLA", "Shop rating and fulfilment SLA"),
    ("job2.k4", "竞品与选品台账质量", "Competitor and assortment ledger quality"),
    ("job2.k5", "活动投产 ROI", "Campaign ROI"),
    ("job2.sys.val", "Lazada Seller Center、Shopee 卖家中心（菲 / 马 / 泰 / 墨 / 阿）、lazada-data 与 shopee-data 看板、shopee-competitor-analysis 竞品台账",
     "Lazada Seller Center, Shopee Seller Centre (PH / MY / TH / MX / AR), lazada-data and shopee-data dashboards, shopee-competitor-analysis ledger"),
    ("job2.plus", "加分项：泰语 / 马来语 / 印尼语 / 西语能力、东南亚海外仓或本地物流资源、台球 / 运动器材类目经验、跨境清关实操。",
     "Bonus: Thai / Malay / Indonesian / Spanish, SEA warehouse or local logistics resources, billiards or sports category experience, hands-on customs clearance."),
    ("job2.red.val", "刷单刷评 / 侵权仿牌 / 虚假发货 / 恶意低价扰乱 / 用爬虫或自动化脚本违规采集平台数据",
     "Fake orders or reviews, counterfeit or IP infringement, fake shipping, malicious underpricing, scraping platform data with bots or automation"),
    # ---- 岗位三：运营自动化 / AI 技能包工程 ----
    ("job3.title", "运营自动化 / AI 技能包工程", "Ops Automation / AI Skill Pack Engineering"),
    ("job3.loc", "远程协作 · 南京", "Remote · Nanjing"),
    ("job3.type", "全职 / 兼职", "Full-time / Part-time"),
    ("job3.dept", "数据与增长（技术中台）", "Data & Growth (Tech Platform)"),
    ("job3.report.val", "技术负责人 / 副总", "Tech Lead / VP"),
    ("job3.desc", "技术 / 数据中台支撑岗。打通各平台 API → 沉淀数据底座 → 运维服务器 → 迭代 AI 需求，把投流审核、视觉生产、数据看板、OA 审批这类重复工作封装成可安装的 AI 技能包，交付给零基础同事使用。",
     "A tech / data-platform role. Wire up platform APIs, build the data foundation, run the servers, ship AI requests — turning repeated work (ad review, asset production, dashboards, OA approvals) into installable AI skill packs that non-technical colleagues can use."),
    ("job3.d1", "API 打通：京东 / 天猫 / 抖音 / 拼多多 + Amazon / Shopify / Temu / 阿里国际站，建自动拉取与鉴权维护",
     "API integration: JD / Tmall / Douyin / PDD + Amazon / Shopify / Temu / Alibaba.com, with automated pulls and credential rotation"),
    ("job3.d2", "数据底座：聚水潭 / 领星 / 钉钉多维表等异构数据归一化，统一指标口径与质量校验",
     "Data foundation: normalise Jushuitan / Lingxing / DingTalk tables, unify metric definitions and data quality checks"),
    ("job3.d3", "AI 需求迭代：技能包开发（SKILL.md + run.py）、安全审计与 SHA 校验、语义化版本发布与回滚",
     "AI delivery: build skill packs (SKILL.md + run.py), security audit with SHA checks, semantic versioning and rollback"),
    ("job3.d4", "服务器部署：云主机 / 容器环境搭建、应用发布与反向代理、公网暴露",
     "Deployment: cloud host / container setup, app release and reverse proxy, public exposure"),
    ("job3.d5", "日常运维：监控告警、定期备份与恢复演练、日志巡检、安全加固",
     "Ops: monitoring and alerting, scheduled backup and restore drills, log patrol, security hardening"),
    ("job3.r1", "大专及以上，统计 / 计算机 / 电商数据相关优先",
     "College degree or above; statistics / CS / e-commerce data background preferred"),
    ("job3.r2", "2 年以上电商数据分析、投流或自动化工程经验",
     "2+ years in e-commerce data analysis, ad operations or automation engineering"),
    ("job3.r3", "熟悉电商指标体、投放逻辑与 SQL / 表处理，能用 Python 或 Node 写脚本",
     "Fluent in e-commerce metrics, ad logic and SQL / spreadsheets; can script in Python or Node"),
    ("job3.r4", "做过看板类应用（如 Flask API + ECharts + SQLite）或同等项目",
     "Has shipped dashboard-grade apps (e.g. Flask API + ECharts + SQLite) or equivalent"),
    ("job3.r5", "逻辑清晰、有工作流洁癖，能把模糊需求拆成可交付的小步",
     "Clear logic and a workflow perfectionist — breaks vague requests into shippable steps"),
    ("job3.k1", "各平台 API 打通", "Platform API integration"),
    ("job3.k2", "AI 需求升级迭代", "AI delivery iteration"),
    ("job3.k3", "数据底座维护", "Data foundation upkeep"),
    ("job3.k4", "服务器部署能力", "Server deployment"),
    ("job3.k5", "服务器日常维护", "Server maintenance"),
    ("job3.sys.val", "ai-cockpit 看板、生意参谋、京东商智、蝉妈妈、各平台投流后台、billiards-trend-intel",
     "ai-cockpit dashboard, SYCM, JD Shangzhi, Chanmama, platform ad consoles, billiards-trend-intel"),
    ("job3.plus", "加分项：有已发布的可安装技能包作品、熟悉钉钉 / DWS / Aitable 开放平台、做过 OCR 或图像链路。",
     "Bonus: published installable skill packs, familiar with DingTalk / DWS / Aitable open platforms, OCR or imaging pipelines."),
    ("job3.red.val", "泄露经营数据 / 私自操作生产后台 / 敷衍错录造成资损 / 交付未过审的技能包",
     "Leaking business data, unauthorised production access, careless entry causing loss, shipping unaudited skill packs"),
    # ---- 岗位四：跨境电商运营（Amazon / Temu）----
    ("job4.title", "跨境电商运营（Amazon / Temu）", "Cross-border E-commerce Operator (Amazon / Temu)"),
    ("job4.loc", "南通（跨境主阵地）· 南京", "Nantong (cross-border hub) · Nanjing"),
    ("job4.type", "全职", "Full-time"),
    ("job4.dept", "跨境电商", "Cross-border E-commerce"),
    ("job4.report.val", "跨境负责人 / 平台负责人", "Cross-border Lead / Platform Lead"),
    ("job4.desc", "负责 Amazon 多站点与 Temu 半 / 全托管运营：以 Listing + 广告 + FBA 驱动 GMV 与排名，以备货履约与核价驱动走量与毛利。该岗位为储备状态，业务放量时开放，可先投简历进入人才池。",
     "Own Amazon multi-marketplace and Temu semi / fully-managed operations — Listing, ads and FBA drive GMV and rank; stock fulfilment and price negotiation drive volume and margin. Currently a talent-pool role: send your CV and we'll reach out when the business scales."),
    ("job4.d1", "Listing：标题 / 图文 / A+ 优化与关键词，维护 Listing 表",
     "Listing: titles, images, A+ content and keywords; maintain the listing sheet"),
    ("job4.d2", "广告：SP / SB / SD 结构与 ACOS 优化，做否定词与预算再分配",
     "Ads: SP / SB / SD structure and ACOS control; negative keywords and budget reallocation"),
    ("job4.d3", "FBA 库存：补货计划与库存周转，控 IPI，不断货不积压",
     "FBA inventory: replenishment planning and turnover; keep IPI healthy, no stockouts or overhang"),
    ("job4.d4", "合规与评分：合规索评、类目审核与账户健康维护",
     "Compliance and ratings: compliant review requests, category approvals and account health"),
    ("job4.d5", "Temu 履约：国内仓备货、核价跟进与爆款选品，控退货率",
     "Temu fulfilment: domestic warehouse stocking, price negotiation and hit product selection; control return rate"),
    ("job4.d6", "数据复盘：销量与毛利复盘，输出周报与迭代动作",
     "Review: sales and margin analysis, ship weekly reports with next actions"),
    ("job4.r1", "大专及以上，电子商务 / 市场营销优先", "College degree or above; e-commerce / marketing preferred"),
    ("job4.r2", "2 年以上 Amazon 或 Temu 运营经验，有台球 / 运动器材类目优先",
     "2+ years on Amazon or Temu; billiards / sports equipment category a plus"),
    ("job4.r3", "Amazon：懂 A9 算法、关键词与转化逻辑、FBA 与自发货差异、Coupon / BD / LD 节奏",
     "Amazon: understands A9 ranking, keyword and conversion logic, FBA vs. FBM, and Coupon / BD / LD cadence"),
    ("job4.r4", "Temu：懂核价逻辑与毛利空间，能推动备货节奏避免断货 / 积压",
     "Temu: understands price-negotiation logic and margin headroom; drives stocking cadence to avoid stockouts and overhang"),
    ("job4.r5", "数据敏感、执行强、抗压，能用数据定位断点并迭代",
     "Data-sensitive, strong execution, resilient; locates funnel breakpoints with data and iterates"),
    ("job4.k1", "GMV 达成率", "GMV attainment"),
    ("job4.k2", "ACOS ≤ 红线（Amazon）/ 履约时效 ≤ SLA（Temu）", "ACOS ≤ threshold (Amazon) / fulfilment ≤ SLA (Temu)"),
    ("job4.k3", "BSR 排名（Amazon）/ 毛利率 ≥ 红线（Temu）", "BSR ranking (Amazon) / gross margin ≥ threshold (Temu)"),
    ("job4.k4", "库存周转（Amazon）/ 缺货率 ≤ 红线（Temu）", "Inventory turnover (Amazon) / stockout rate ≤ threshold (Temu)"),
    ("job4.k5", "评分 ≥ 红线（Amazon）/ 退货率 ≤ 红线（Temu）", "Rating ≥ threshold (Amazon) / return rate ≤ threshold (Temu)"),
    ("job4.sys.val", "Amazon Seller Central（美 / 加 / 英 / 德 / 日 5 站）、广告与品牌分析、Temu 半托管·全托管后台",
     "Amazon Seller Central (US / CA / UK / DE / JP), Ads and Brand Analytics, Temu semi- and fully-managed console"),
    ("job4.plus", "加分项：Amazon 多站点（美 / 加 / 英 / 德 / 日）实操、海外仓资源、小语种。",
     "Bonus: hands-on Amazon multi-marketplace (US / CA / UK / DE / JP), overseas warehouse resources, extra languages."),
    ("job4.red.val", "刷评 / 刷单 / 跟卖侵权 / 规避二审 / 虚假发货 / 货不对板 / 恶意低价扰乱",
     "Fake reviews, fake orders, hijacking or IP infringement, evading secondary verification, fake shipping, product mismatch, malicious underpricing"),
    # ---- 页面级 ----
    ("careers.culture", "团队汇报口径：不允许只报结果数字，须同步「原因 — 结论 — 下一步动作」；重大错价、处罚、库存异常须当天上报。",
     "How we report here: never just a number — always pair it with cause, conclusion and next action. Pricing errors, penalties and inventory anomalies are escalated the same day."),
    ("careers.note", "薪资范围面议（按平台经验与操盘结果定级）。面试含平台实操笔试，会追问真实操盘数据：峰值月销、ACOS、最高场观、千川 ROI——我们只认跑出来的数。",
     "Salary is negotiable and banded by platform experience and track record. Expect a hands-on written test and direct questions about your real numbers — peak monthly sales, ACOS, highest live viewership, Qianchuan ROI. We go by results, not résumés."),
]


def js_str(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


i18n_path = os.path.join(ROOT, "js", "i18n.js")
src = io.open(i18n_path, encoding="utf-8").read()

# 移除旧的岗位相关词条（整条，跨行安全，不留空行）
#
# ⚠️ v1.6.9 修复：旧实现有两个缺陷，会越跑越乱——
#   1) 只清理 "jobN.xxx"，漏掉 job.report / job.code / job.kpi / job.sys /
#      job.red 与 careers.culture / careers.note，而这些同样在 ENTRIES 里，
#      于是每次执行都重复插入一份（key 重复，i18n 取最后一个，静默出错）。
#   2) 正则尾部用 \s*$，会连带吃掉行尾换行，留下成片空洞（实测 99 连空行）。
# 现改为：按 ENTRIES 的 key 集合逐条比对，整条删除（支持跨行续行），不留空行。
MANAGED_KEYS = set(k for k, _zh, _en in ENTRIES)
_KEY_HEAD = re.compile(r'^[ \t]*"([^"]+)":\s*\{')


def strip_managed(text, keys):
    """删除 keys 中词条的定义块（整条，跨行安全），返回 (新文本, 删除条数)。"""
    lines = text.split("\n")
    out, removed, i = [], 0, 0
    while i < len(lines):
        m = _KEY_HEAD.match(lines[i])
        if m and m.group(1) in keys:
            j = i
            while j < len(lines) and not lines[j].rstrip().endswith("},"):
                j += 1
            removed += 1
            i = j + 1
            continue
        out.append(lines[i])
        i += 1
    return "\n".join(out), removed


src, n_old = strip_managed(src, MANAGED_KEYS)
n_todo = 0

block = ""
for key, zh, en in ENTRIES:
    block += '    %s: { zh: %s, en: %s },\n' % (js_str(key), js_str(zh), js_str(en))

anchor = '    "job.status.open":'
if anchor in src:
    src = src.replace(anchor, block + anchor, 1)
    io.open(i18n_path, "w", encoding="utf-8").write(src)
    print("i18n 写入 %d 条词条（清理旧词条 %d 条）" % (len(ENTRIES), n_old))
else:
    print("WARN i18n.js 未找到锚点 %s" % anchor)

print("完成。")

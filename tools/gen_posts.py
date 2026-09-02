# -*- coding: utf-8 -*-
"""
gen_posts.py —— 批量生成 5 篇新博客文章 HTML（v1.6.23 用）
模板对齐 posts/2026-08-31-ku-cun-guard-rail.html 结构。
用法：python tools/gen_posts.py
生成后：posts-data.js 插入条目 → node tools/gen_rss.js → bump v1.6.23
"""
import os, io, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://alextok200-boop.github.io"
AUTHOR_ZH = '{"@type":"Person","name":"戴程鹏","jobTitle":"电商操盘手 · AI 技能包工程负责人","url":"' + SITE + '/","email":"mailto:alextok200@gmail.com","worksFor":{"@type":"Organization","name":"万世康伦（KONLLEN）集团"},"sameAs":["https://github.com/alextok200"]}'
PUBLISHER_ZH = '{"@type":"Organization","name":"万世康伦（KONLLEN）集团","url":"' + SITE + '/"}'
AUTHOR_EN = '{"@type":"Person","name":"Dai Chengpeng","jobTitle":"E-commerce Operator · AI Skill Pack Engineer","url":"' + SITE + '/","email":"mailto:alextok200@gmail.com","worksFor":{"@type":"Organization","name":"KONLLEN Group"},"sameAs":["https://github.com/alextok200"]}'
PUBLISHER_EN = '{"@type":"Organization","name":"KONLLEN Group","url":"' + SITE + '/"}'

# 每篇文章：file / date / title(zh) / titleShort(head 用) / tag / summary / ogDesc / en{title,summary,tag} / body
POSTS = [
dict(
file="2026-09-02-tong-ji-san-lian-bai",
date="2026-09-02",
tag="数据与自动化",
title="给网站接统计，连败三次后我学会了先测客户端",
summary="三个统计服务都打不开，服务端却全返回 200。问题不在工具，在用户够不到它的那层网络。",
ogDesc="Umami、GoatCounter、51.la 三次接入全部失败，服务端却都 200 OK。一次关于\"验证客户端可用性\"的复盘。",
en=dict(
  title="Adding Site Analytics Failed Three Times: Test the Client First",
  summary="Three analytics services unreachable while all servers returned 200. The problem wasn't the tools — it was the network layer in between.",
  tag="Data & Automation"),
body="""<p>想给个人站加个访问统计，前后试了三个服务：Umami、GoatCounter，最后换到国内的 51.la。结果一模一样：浏览器报 <code>ERR_SSL_PROTOCOL_ERROR</code>，打不开。</p>
<p>诡异的是，三个服务的服务端我都测过，全部 200 OK。网站没问题，服务没问题，那问题出在哪？</p>

<h2>一、三次失败，同一个症状</h2>
<p>第一次推荐 Umami 官方云（cloud.umami.is），用户打开报 SSL 协议错误。我第一反应是海外服务被墙，换。</p>
<p>第二次换 GoatCounter（gc.zgo.at），还是同样的错。我判断海外服务在这条网络下不可用，再换国内方案。</p>
<p>第三次换 51.la——国内老牌统计，服务端我抓回来一整个正常首页。结果用户浏览器依旧 <code>ERR_SSL_PROTOCOL_ERROR</code>。到这一步我才意识到：问题不是\"海外还是国内\"，是这层网络对特定站点做了什么。</p>

<h2>二、排查转折：关掉浏览器安全防护也没用</h2>
<p>用户先后试了关闭 Chrome 安全防护、隐身模式（无扩展），全都不行。直到在命令行里跑了一次 curl，错误信息变了：</p>
<pre><code>基础连接已经关闭: 发送时发生错误
FullyQualifiedErrorId : WebCmdletWebResponseException</code></pre>
<p>注意，这不是 SSL 证书错误，是 .NET WinHTTP 栈在握手阶段就被掐断。浏览器层失败、系统层也失败，但 GitHub Pages、git push 全程正常——这是\"选择性 HTTPS 拦截\"的典型特征：中间设备（网关、代理、上网行为管理）对部分域名做了拦截。</p>

<h2>三、三个教训</h2>
<table>
<thead><tr><th>教训</th><th>内容</th></tr></thead>
<tbody>
<tr><td>服务端 200 ≠ 客户端可用</td><td>验证第三方服务，必须让最终用户在他的环境实测，别拿服务端请求当结论</td></tr>
<tr><td>按层排查，别换方案</td><td>浏览器层（隐身模式/扩展）→ 系统层（命令行 curl/系统代理）→ 网络层，先定位再换工具</td></tr>
<tr><td>同类问题换十个方案都一样</td><td>三次失败都是同一环境问题，继续换服务只会重复踩坑</td></tr>
</tbody>
</table>

<h2>四、收尾</h2>
<p>统计功能先搁置。代码里保留配置位但不启用——站点保持零第三方请求，等网络环境正常后填一行 ID 即可启用。至于诊断方法本身，倒是这次最大的收获：以后凡是给外部服务做集成，第一件事是让使用者先打开试试，而不是我这边 curl 通就拍板。</p>"""),

dict(
file="2026-09-01-duo-sheet-fen-lei",
date="2026-09-01",
tag="数据与自动化",
title="Excel 多 Sheet 报表，先分类再动手",
summary="一张工作簿六个 sheet 一起导进脚本，一半解析失败还静默丢数。后来学会：先识别每个 sheet 的类型，再决定怎么处理。",
ogDesc="处理多 sheet 报表的正确姿势：明细表/透视汇总表/元数据表/环比双列/总结文字区，先分类再执行对应动作。",
en=dict(
  title="Multi-Sheet Excel Reports: Classify Before You Process",
  summary="Importing six sheets at once silently dropped half the data. The fix: identify each sheet's type first, then decide how to handle it.",
  tag="Data & Automation"),
body="""<p>拿到一张跨平台环比总表，六个 sheet：秒杀活动明细、全站推广商品明细、Meta 广告环比、按渠道的指标透视、数据说明、还有底部一大段 Overall Analysis 总结。第一次我图省事，一把梭全导进脚本，结果一半 sheet 解析失败，另一半静默丢了列。</p>
<p>复盘后总结出一套规则：<strong>多 sheet 报表必须先分类，再按类型执行对应动作</strong>，禁止整体导入、禁止只取第一个 sheet、禁止静默丢弃解析不了的。</p>

<h2>一、五个常见 sheet 类型</h2>
<table>
<thead><tr><th>类型</th><th>识别特征</th><th>处理动作</th></tr></thead>
<tbody>
<tr><td>明细表</td><td>一行一条记录（订单/商品/活动）</td><td>归一化后直接导入，做维度归因与排行</td></tr>
<tr><td>透视汇总表</td><td>指标在行、日期在列（Channel/Metric × 日期）</td><td>先转置成明细再导入，或人工核对直读，不强行灌</td></tr>
<tr><td>元数据说明表</td><td>写口径、来源、缺失项（\"数据说明\"）</td><td>提取口径做分析标注，不导入数值</td></tr>
<tr><td>环比双列表</td><td>\"8/31 销售额\"与\"9/1 销售额\"双列并存</td><td>明确指定目标日期列，防静默取到首日列丢数据</td></tr>
<tr><td>总结文字区</td><td>表底部\"总分析 / Overall Analysis\"</td><td>识别为叙述性洞察，不参与数值导入</td></tr>
</tbody>
</table>

<h2>二、为什么必须分类</h2>
<p>三种典型事故，都是\"不分类直接干\"造成的：</p>
<ul>
<li>透视表当明细表导，行是渠道、列是日期，导进来每行都变成\"渠道名\"一列，数值全错位；</li>
<li>环比双列表不指定列，脚本默认取第一列（8/31），9/1 的数据整个丢掉还没人发现；</li>
<li>数据说明 sheet 被当数据导入，文字行报错后整批回滚，前面解析好的也白干。</li>
</ul>

<h2>三、落地动作</h2>
<p>现在处理多 sheet 报表的固定流程：先逐 sheet 过一遍结构，输出一张\"每个 sheet 是什么类型、做什么处理、导入多少行\"的对照表给需求方核对，再开始导数据。分类这步花五分钟，能省掉后面两小时的返工。</p>"""),

dict(
file="2026-08-30-erp-403",
date="2026-08-30",
tag="数据与自动化",
title="403 不一定是密钥错了：一次 ERP 接口排查",
summary="AppID 换了一个又一个，403 照旧。最后发现密钥根本没机会进服务器——是 IP 白名单把请求拦在了门外。",
ogDesc="对接领星 ERP 遇 403：先分清 401 和 403，403 优先查 IP 白名单与接口权限，别一上来就怀疑密钥。",
en=dict(
  title="403 Is Not Always a Wrong Key: One ERP API Debugging Session",
  summary="Swapped AppIDs again and again, still 403. The key never even reached the server — an IP whitelist was blocking the request.",
  tag="Data & Automation"),
body="""<p>对接领星 ERP 的开放接口，第一步就卡住：调用一直返回 403。我第一反应是 AppID 或 Secret 配错了，于是反复核对格式、重新生成密钥、再试——403 纹丝不动。</p>
<p>后来才想明白：<strong>403 和 401 是两回事，排查顺序完全不同。</strong></p>

<h2>一、401 和 403，别混为一谈</h2>
<table>
<thead><tr><th>状态码</th><th>含义</th><th>大概率原因</th></tr></thead>
<tbody>
<tr><td>401</td><td>未认证，请求没带或带错了身份</td><td>AppID/Secret 错误、签名错误、token 过期</td></tr>
<tr><td>403</td><td>已认证但被拒绝，服务器认识你但不让你进</td><td>IP 白名单、接口权限未开通、账号被封禁</td></tr>
</tbody>
</table>
<p>401 才该查密钥；403 应该先查\"是不是根本没走到鉴权\"。</p>

<h2>二、这次 403 的三个嫌疑</h2>
<ol>
<li><strong>IP 白名单</strong>：服务商后台配了调用方 IP 白名单，服务器在网关上直接拒掉非白名单来源——这是最常见的 403 来源；</li>
<li><strong>接口权限未开通</strong>：AppID 有，但具体接口的权限没在后台勾选；</li>
<li><strong>密钥本身问题</strong>：最不该第一个怀疑，却是我最先折腾的。</li>
</ol>
<p>逐项排查后定位：老 AppID 配的调用 IP 不在白名单里，请求在网关就被拦。处理方式是到服务商后台把公网出口 IP 加进白名单，同时申请了新 AppID 适配到客户端代码里，重新验证。</p>

<h2>三、沉淀的排查顺序</h2>
<p>以后对接任何 ERP/开放平台，遇 403 固定按这个顺序走，不再从密钥开始：</p>
<ul>
<li>第一步：看返回体的错误码和错误信息，服务商一般会写明是 whitelist 还是 permission；</li>
<li>第二步：查 IP 白名单——先确认你的出口 IP 是什么（<code>curl ifconfig.me</code>），再对后台配置；</li>
<li>第三步：查接口权限是否开通；</li>
<li>最后一步：才轮到怀疑 AppID/Secret，且用官方文档的示例代码验证，别自己猜。</li>
</ul>
<p>密钥格式对不对，用官方 SDK 或测试向量校验，比人肉比对靠谱得多。</p>"""),

dict(
file="2026-08-29-ban-ben-men-jin",
date="2026-08-29",
tag="AI 技能包",
title="个人网站改了 22 版，版本号没乱过",
summary="有一次只改了 CSS 忘了 bump 版本号，访客看到的还是旧页面。后来把版本检查做成了机器门禁，人肉记忆不再可信。",
ogDesc="PWA 缓存与版本号：sw.js CACHE 作单一事实源，check_version.py 扫全部 HTML 的 ?v= 引用，CI 里锁死。",
en=dict(
  title="22 Versions of a Personal Site, Zero Version Drift",
  summary="Once I changed only CSS and forgot to bump the version — visitors kept seeing the old page. Now a CI gate checks it for me.",
  tag="AI Skills"),
body="""<p>个人站做到 22 个版本，踩过最大的坑不是功能，是缓存。PWA 的 Service Worker 会把静态资源缓存起来，版本号不更新，访客永远看到旧页面——这个坑叫 cache busting，文档里人人都会写\"记得 bump\"，但人肉记忆在 20 版之后必然漏。</p>

<h2>一、那次事故</h2>
<p>某次迭代只改了 CSS 和 JS，HTML 里的版本参数和 sw.js 的缓存版本都没动。改完本地测试没问题，线上却一片\"没变化\"的反馈。查了半天才发现：Service Worker 还在用旧缓存，新样式根本没下发。改动本身没 bug，是版本号漏了。</p>

<h2>二、把检查变成机器</h2>
<p>事故之后定了三条规矩：</p>
<table>
<thead><tr><th>规则</th><th>内容</th></tr></thead>
<tbody>
<tr><td>单一事实源</td><td>sw.js 里的 <code>konllen-site-vX.Y.Z</code> 是唯一版本号，其余全部跟它对齐</td></tr>
<tr><td>全量扫描</td><td>check_version.py 扫所有 HTML 的 <code>?v=</code> 引用，必须与 sw.js 一致，一处不一致就 FAIL</td></tr>
<tr><td>CI 锁死</td><td>GitHub Actions 在每次 push 时自动跑检查，不过就红——不靠提交者自觉</td></tr>
</tbody>
</table>
<p>现在任何可见改动，哪怕只改一个 CSS 颜色值，流程都是：改代码 → bump sw.js + 全部 HTML 的 <code>?v=</code> → 本地先跑一遍检查 → 再提交。检查脚本一次扫几百处引用，两秒钟出结果。</p>

<h2>三、为什么非要机器把关</h2>
<p>\"记得 bump\"这种约定，前五个版本靠自觉没问题，到二十个版本、多页面多脚本时就一定会漏。版本一致性是典型的\"高频、低难度、易遗忘\"任务——正是该交给脚本和 CI 的事。人负责判断改了什么，机器负责确认版本有没有跟上。</p>"""),

dict(
file="2026-08-27-kou-jing-tong-yi",
date="2026-08-27",
tag="团队管理",
title="两套表对不上账，先别急着改数据",
summary="绩效计算器算出 100，评级表却是 90。不是谁算错了，是两套表对\"销售额\"的定义不一样。",
ogDesc="绩效计算器与评级表口径对齐实战：到款还是下单、含不含退款、时间窗口——先统一定义再谈自动化。",
en=dict(
  title="Two Tables That Won't Reconcile: Fix the Definition, Not the Numbers",
  summary="The calculator said 100, the rating sheet said 90. Nobody miscalculated — the two tables defined 'sales' differently.",
  tag="Team"),
body="""<p>团队绩效同时维护两套表：一个算绩效的计算器，一个出评级的评级表。某月对账，同一名运营，计算器算出 100 分，评级表却是 90。第一反应是公式错了，翻了两天没找到 bug。</p>
<p>后来逐项比对口径才发现：计算器按\"到款金额\"算业绩，评级表按\"下单金额\"算；一个把退款剔除了，一个没剔除。两套定义下，同一个人的业绩天然差一截——<strong>不是谁算错了，是两套表对同一个词的理解不一样。</strong></p>

<h2>一、先列口径清单，再谈数据</h2>
<p>所有对不上账，几乎都是定义问题。先列一张口径清单，逐项确认两套表是否一致：</p>
<table>
<thead><tr><th>口径项</th><th>计算器</th><th>评级表</th><th>统一后</th></tr></thead>
<tbody>
<tr><td>业绩基准</td><td>到款金额</td><td>下单金额</td><td>到款金额（回款才算业绩）</td></tr>
<tr><td>退款处理</td><td>剔除</td><td>未剔除</td><td>当期退款冲减当期业绩</td></tr>
<tr><td>时间窗口</td><td>自然月</td><td>自然月</td><td>自然月（当月到款）</td></tr>
<tr><td>含税与否</td><td>含税</td><td>含税</td><td>含税，口径备注写明</td></tr>
</tbody>
</table>
<p>这张表填完，两套表的差异一眼可见，改定义而不是改数字。</p>

<h2>二、口径对齐后的配套动作</h2>
<ul>
<li>口径定义写进文档，管理端和员工端各存一份，版本号同步递增——员工看到的算法和管理层算的必须一致；</li>
<li>调整前后各出一版对照表，标注哪些是待确认项，不悄悄改；</li>
<li>以后每次改表，先问一句：\"这次改的是定义还是数字？\"定义变更必须走版本更新，不能原地覆盖。</li>
</ul>

<h2>三、通用判断</h2>
<p>数据对不上时，先花十分钟核对定义，再花两小时查公式。多数情况下，你会在这十分钟里找到答案——两套表说的可能根本不是同一件事。</p>"""),
]

def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def json_ld(p, lang):
    is_en = lang == "en"
    author = AUTHOR_EN if is_en else AUTHOR_ZH
    publisher = PUBLISHER_EN if is_en else PUBLISHER_ZH
    url = SITE + "/posts/" + p["file"] + ".html"
    title = p["en"]["title"] if is_en else p["title"]
    desc = p["en"]["summary"] if is_en else p["ogDesc"]
    art = ('{"@context":"https://schema.org","@type":"Article","mainEntityOfPage":{"@type":"WebPage","@id":"%s"},"headline":"%s","description":"%s","inLanguage":"%s","datePublished":"%s","dateModified":"%s","author":%s,"publisher":%s}'
           % (url, esc(title), esc(desc), "en" if is_en else "zh-CN", p["date"], p["date"], author, publisher))
    name = "Home" if is_en else "首页"
    blog = "Blog" if is_en else "博客"
    bc = ('{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"%s","item":"%s/"},{"@type":"ListItem","position":2,"name":"%s","item":"%s/blog.html"},{"@type":"ListItem","position":3,"name":"%s","item":"%s"}]}'
          % (name, SITE, blog, SITE, esc(title), url))
    return art, bc

def render(p):
    url = SITE + "/posts/" + p["file"] + ".html"
    art_zh, bc_zh = json_ld(p, "zh")
    art_en, bc_en = json_ld(p, "en")
    head_title = p["title"]
    return """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{head_title} - 戴程鹏</title>
  <meta name="description" content="{ogDesc}">
  <link rel="stylesheet" href="../../css/style.css?v=1.6.23">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#9333ea">
  <link rel="apple-touch-icon" href="/assets/img/icon-192.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/img/icon-192.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta property="og:title" content="{head_title} - 戴程鹏">
  <meta property="og:description" content="{ogDesc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta property="og:site_name" content="戴程鹏">
  <meta property="og:image" content="https://alextok200-boop.github.io/assets/img/og-default.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="{url}">
  <script type="application/ld+json">{art_zh}</script>
  <script type="application/ld+json">{bc_zh}</script>
  <script type="application/ld+json">{art_en}</script>
  <script type="application/ld+json">{bc_en}</script>
</head>
<body>
  <header class="site-header">
    <nav class="nav container">
      <a href="../../index.html" class="logo">DAI<span class="accent">·</span>CP</a>
      <div class="nav-links">
        <a href="../../index.html" data-i18n="nav.home">首页</a>
        <a href="../../about.html" data-i18n="nav.about">关于</a>
        <a href="../../work.html" data-i18n="nav.work">作品集</a>
        <a href="../../brands.html" data-i18n="nav.brands">品牌矩阵</a>
        <a href="../../achievements.html" data-i18n="nav.results">成绩单</a>
        <a href="../../blog.html" class="active" data-i18n="nav.blog">博客</a>
        <a href="../../careers.html" data-i18n="nav.careers">加入我们</a>
        <a href="../../contact.html" data-i18n="nav.contact">联系</a>
        <button class="lang-btn" data-i18n-toggle aria-label="切换语言">EN</button>
      </div>
    </nav>
  </header>

  <main>
    <article class="post">
      <div class="container post-container">
        <p class="eyebrow"><a href="../../blog.html" class="back-link">← 返回博客</a></p>
        <h1 class="post-title">{title}</h1>
        <p class="post-meta">{date} · {tag}</p>

        <div class="post-body">
{body}
        </div>
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <div class="container">
      <p data-i18n="footer.copyright">© 2026 戴程鹏 · Powered by GitHub Pages</p>
      <p class="footer-links">
        <a href="../../rss.xml" data-i18n="footer.rss">RSS</a>
        <span class="dot">·</span>
        <a href="../../rss-en.xml">RSS (EN)</a>
        <span class="dot">·</span>
        <a href="../../brands.html" data-i18n="nav.brands">品牌矩阵</a>
        <span class="dot">·</span>
        <a href="../../careers.html" data-i18n="nav.careers">加入我们</a>
        <span class="dot">·</span>
        <a href="../../contact.html" data-i18n="nav.contact">联系</a>
      </p>
    </div>
  </footer>

    <script src="../../js/site-config.js?v=1.6.23"></script>
<script src="../../js/i18n.js?v=1.6.23"></script>
  <script src="../../js/main.js?v=1.6.23"></script>
  <script src="../../js/posts-data.js?v=1.6.23"></script>
  <script src="../../js/post.js?v=1.6.23"></script>
  <script src="../../js/seo.js?v=1.6.23"></script>
  <script src="../../js/analytics.js?v=1.6.23"></script>
  <script src="../../js/comments.js?v=1.6.23"></script>
  <script src="../../js/sw-register.js?v=1.6.23"></script>
  <script src="../../js/assistant.js?v=1.6.23"></script>
</body>
</html>
""".format(head_title=head_title, ogDesc=esc(p["ogDesc"]), url=url, art_zh=art_zh, bc_zh=bc_zh,
           art_en=art_en, bc_en=bc_en, title=p["title"], date=p["date"], tag=p["tag"], body=p["body"])

def main():
    out_dir = os.path.join(ROOT, "posts")
    for p in POSTS:
        html = render(p)
        path = os.path.join(out_dir, p["file"] + ".html")
        with io.open(path, "w", encoding="utf-8") as f:
            f.write(html)
        print("generated:", os.path.relpath(path, ROOT), len(html), "B")

if __name__ == "__main__":
    main()

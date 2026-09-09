# -*- coding: utf-8 -*-
"""v1.7.7 sync: batch-sync 10 new methodology articles to methods/ + bump all HTML versions"""
import json, hashlib, re, sys
from pathlib import Path
from datetime import date

ROOT = Path(r"C:\Users\alext\Web\personal-site")
BATCH = ROOT / "tools" / "kb_sync_batch.json"
METHODS = ROOT / "methods"
SW = ROOT / "sw.js"

# ---------- Helper functions ----------
SENSITIVE = [
    (r"KONLLEN", "[集团主品牌]"),
    (r"CRICAL", "[子品牌]"),
    (r"康伦", "[集团]"),
    (r"万世康伦", "[集团全称]"),
    (r"台球", "[品类 A]"),
    (r"桌球", "[品类 A]"),
    (r"球杆", "[产品]"),
    (r"巧粉", "[耗材]"),
    (r"cue", "[product]"),
    (r"billiard", "[category]"),
    (r"聚水潭", "[国内 ERP]"),
    (r"领星", "[跨境 ERP]"),
    (r"ai-cockpit", "[数据中台]"),
    (r"Agnes", "[视觉生产]"),
    (r"WorkBuddy", "[AI 平台]"),
    (r"Marvis", "[Agent 客户端]"),
    (r"DeepSeek", "[LLM 引擎]"),
    (r"Ollama", "[本地推理]"),
    (r"AnythingLLM", "[本地 RAG]"),
    (r"qwen2\.5", "[本地 LLM]"),
    (r"CloudStudio", "[部署平台]"),
    (r"C:\\Users\\alext\\\.workbuddy", "[venv 路径]"),
    (r"0\.0\.0\.0:3001", "[host:port]"),
    (r"host\.docker\.internal", "[docker host]"),
    (r"dingtalk-webhook-registry", "[webhook 注册表]"),
    (r"registry\.json", "[事实源文件]"),
    (r"unified_group|test_group|agnes_group", "[主群/废弃群]"),
    (r"allocate\.py", "[变更脚本]"),
    (r"webhook URL", "[Webhook 地址]"),
    (r"webhook", "[回调地址]"),
    (r"钉钉", "[IM]"),
    (r"DingTalk", "[IM]"),
    (r"ActionCard", "[卡片消息]"),
    (r"OA 审批", "[审批流程]"),
    (r"fullPage 截图", "[整页截图]"),
    (r"fullPage:true", "[整页截图]"),
    (r"deviceScaleFactor", "[截图缩放]"),
]

def cleanse(text: str) -> str:
    for pat, sub in SENSITIVE:
        text = re.sub(pat, sub, text, flags=re.IGNORECASE if pat.isascii() else 0)
    return text

def inline(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    return text

def table_row(line: str) -> str:
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    if all(re.match(r"^:?-+:?$", c) for c in cells):
        return ""
    return "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in cells) + "</tr>"

def md_to_html(md: str) -> str:
    lines = md.split("\n")
    out, in_list, in_code, code_buf = [], False, False, []

    def flush_list():
        nonlocal in_list
        if in_list:
            out.append("</ul>")
            in_list = False

    def flush_code():
        nonlocal in_code, code_buf
        if in_code:
            esc = (s.replace("&", "&amp;").replace("<", "&lt;") for s in code_buf)
            out.append("<pre><code>" + "\n".join(esc) + "</code></pre>")
            in_code = False
            code_buf = []

    for line in lines:
        if line.startswith("```"):
            if in_code:
                flush_code()
            else:
                flush_list()
                in_code = True
            continue
        if in_code:
            code_buf.append(line)
            continue
        if line.startswith("### "):
            flush_list()
            out.append(f"<h3>{inline(line[4:].strip())}</h3>")
        elif line.startswith("## "):
            flush_list()
            out.append(f"<h2>{inline(line[3:].strip())}</h2>")
        elif line.startswith("# "):
            flush_list()
            out.append(f"<h1>{inline(line[2:].strip())}</h1>")
        elif line.startswith("> "):
            flush_list()
            out.append(f"<blockquote>{inline(line[2:].strip())}</blockquote>")
        elif re.match(r"^\s*[-*]\s+", line):
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{inline(re.sub(r'^\s*[-*]\s+', '', line))}</li>")
        elif line.strip() == "":
            flush_list()
            if out and not out[-1].endswith("</h1>") and not out[-1].endswith("</h2>") and not out[-1].endswith("</h3>"):
                out.append("")
        elif line.startswith("|") and "|" in line[1:]:
            flush_list()
            out.append(table_row(line))
        else:
            flush_list()
            out.append(f"<p>{inline(line.strip())}</p>")
    flush_list()
    flush_code()
    cleaned = []
    for ln in out:
        if ln == "" and cleaned and cleaned[-1] == "":
            continue
        cleaned.append(ln)
    return "\n".join(cleaned)

def render_detail(meta: dict, body_html: str) -> str:
    slug = meta["slug"]
    d = meta["date"]
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{meta['title_zh']} - 戴程鹏</title>
  <meta name="description" content="{meta['summary_zh']}">
  <meta property="og:title" content="{meta['title_zh']} - 戴程鹏">
  <meta property="og:description" content="{meta['summary_zh']}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://alextok200-boop.github.io/methods/{d}-{slug}.html">
  <meta property="og:image" content="https://alextok200-boop.github.io/assets/img/og-default.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://alextok200-boop.github.io/methods/{d}-{slug}.html">
  <link rel="stylesheet" href="../css/style.css?v=1.7.7">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#9333ea">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/favicon-180.png">
  <script type="application/ld+json">{{"@context":"https://schema.org","@type":"Article","headline":"{meta['title_zh']}","datePublished":"{d}","dateModified":"{d}","author":{{"@type":"Person","name":"戴程鹏","url":"https://alextok200-boop.github.io/"}},"publisher":{{"@type":"Person","name":"戴程鹏"}},"inLanguage":"zh-CN","url":"https://alextok200-boop.github.io/methods/{d}-{slug}.html"}}</script>
  <script type="application/ld+json">{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{{"@type":"ListItem","position":1,"name":"首页","item":"https://alextok200-boop.github.io/"}},{{"@type":"ListItem","position":2,"name":"方法论","item":"https://alextok200-boop.github.io/methods.html"}},{{"@type":"ListItem","position":3,"name":"{meta['title_zh']}","item":"https://alextok200-boop.github.io/methods/{d}-{slug}.html"}}]}}</script>
</head>
<body>
  <header class="site-header">
    <nav class="nav container">
      <a href="../index.html" class="logo"><img class="logo-mark" src="../assets/img/favicon-32.png" alt="">DAI<span class="accent">·</span>CP</a>
      <div class="nav-links">
        <a href="../index.html">首页</a>
        <a href="../about.html">关于</a>
        <a href="../work.html">作品集</a>
        <a href="../brands.html">项目经历</a>
        <a href="../methods.html" class="active">方法论</a>
        <a href="../blog.html">博客</a>
        <a href="../contact.html">联系</a>
      </div>
    </nav>
  </header>
  <main>
    <article class="container" style="max-width:760px;padding:60px 24px 80px;">
      <p style="color:var(--neon-green);font-size:13px;letter-spacing:1px;">{meta['tag']} · {d}</p>
      <h1 style="font-size:32px;margin:8px 0 12px;">{meta['title_zh']}</h1>
      <p style="color:var(--text-dim);font-size:15px;line-height:1.7;margin-bottom:36px;">{meta['summary_zh']}</p>
      <div class="article-body" style="font-size:15px;line-height:1.85;color:var(--text);">
{body_html}
      </div>
      <hr style="border:0;border-top:1px dashed var(--border);margin:48px 0 24px;">
      <p style="color:var(--text-dim);font-size:13px;">
        原文来自本地知识库，经脱敏后发布。
        品牌名、公司名、内部系统名均已替换为占位符。
      </p>
      <p style="margin-top:16px;">
        <a href="../methods.html" class="btn btn-ghost">← 返回方法论列表</a>
      </p>
    </article>
  </main>
  <footer class="site-footer">
    <div class="container">
      <p>© 2026 戴程鹏 · Powered by GitHub Pages</p>
    </div>
  </footer>
</body>
</html>
"""

def render_list(articles: list) -> str:
    cards = []
    for a in articles:
        cards.append(f"""
        <article class="card feature-card project-card">
          <div class="project-name">{a['date']}</div>
          <div class="project-tag">{a['tag']}</div>
          <h3 class="project-title">{a['title_zh']}</h3>
          <p class="project-desc">{a['summary_zh']}</p>
          <ul class="project-meta">
            <li>📅 发布：{a['date']}</li>
            <li>📖 标签：{a['tag']}</li>
          </ul>
          <p style="margin-top:14px;"><a href="methods/{a['date']}-{a['slug']}.html" class="btn btn-ghost">阅读全文 →</a></p>
        </article>""")
    cards_html = "\n".join(cards)
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>方法论 - 戴程鹏</title>
  <meta name="description" content="通用型方法论手册：从知识库同步而来的组织能力沉淀，覆盖技能研发流水线、数据中台、交付物规范、多 Agent 协同等可复用模式。">
  <meta property="og:title" content="方法论 - 戴程鹏">
  <meta property="og:description" content="通用型方法论手册——换项目、换业务线都能直接套用的组织能力杠杆资产。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://alextok200-boop.github.io/methods.html">
  <meta property="og:image" content="https://alextok200-boop.github.io/assets/img/og-default.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://alextok200-boop.github.io/methods.html">
  <link rel="stylesheet" href="css/style.css?v=1.7.7">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#9333ea">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/favicon-180.png">
</head>
<body>
  <header class="site-header">
    <nav class="nav container">
      <a href="index.html" class="logo"><img class="logo-mark" src="assets/img/favicon-32.png" alt="">DAI<span class="accent">·</span>CP</a>
      <div class="nav-links">
        <a href="index.html">首页</a>
        <a href="about.html">关于</a>
        <a href="work.html">作品集</a>
        <a href="brands.html">项目经历</a>
        <a href="methods.html" class="active">方法论</a>
        <a href="achievements.html">成绩单</a>
        <a href="blog.html">博客</a>
        <a href="contact.html">联系</a>
      </div>
    </nav>
  </header>
  <main>
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow">Methods</p>
        <h1>方法论</h1>
        <p class="hero-sub">通用型方法论手册——从本地知识库同步而来，<br>换项目、换业务线都能直接套用的组织能力沉淀。</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="card-grid project-grid">
          {cards_html}
        </div>
        <p class="resume-note" style="margin-top:32px;">
          来源：本地 AnythingLLM 知识库 <code>business-alex</code> · 经敏感词脱敏后发布 ·
          完整 26 篇文档仅本地可见，公开遵循「通用型可发布、敏感词占位符化」策略。
        </p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container">
      <p>© 2026 戴程鹏 · Powered by GitHub Pages</p>
    </div>
  </footer>
</body>
</html>
"""

# ---------- Main ----------
def main():
    # Step 1: Load and deduplicate
    batch = json.load(open(BATCH, encoding="utf-8"))
    unique = {}  # title -> content
    for item in batch:
        content = item.get("content", "").strip()
        if len(content) < 500:
            continue
        title = None
        for line in content.split("\n"):
            line = line.strip()
            if line.startswith("# ") and not line.startswith("# ---"):
                title = line[2:].strip()
                break
            elif line.startswith("#") and not line.startswith("# ---") and len(line) > 3:
                title = line.lstrip("#").strip()
                break
        if not title:
            continue
        if title not in unique:
            unique[title] = content

    print(f"去重后 {len(unique)} 篇新内容")
    for t in unique:
        print(f"  - {t}")

    # Step 2: Generate HTML files
    METHODS.mkdir(exist_ok=True)
    TODAY = date.today().strftime("%Y-%m-%d")
    tag = "方法论"
    articles = []

    for title, content in unique.items():
        slug = title.lower().replace(" ", "-").replace("·", "-").replace("/", "-")
        slug = re.sub(r"[^a-z0-9\u4e00-\u9fff\-.]", "", slug)
        meta = {
            "slug": slug,
            "date": TODAY,
            "title_zh": title,
            "title_en": title,
            "tag": tag,
            "summary_zh": f"{title}：本地知识库中的方法论文档，覆盖组织管理、电商运营、品牌升级等主题。",
            "summary_en": title,
        }
        cleansed = cleanse(content)
        body = md_to_html(cleansed)
        detail_html = render_detail(meta, body)
        detail_path = METHODS / f"{TODAY}-{slug}.html"
        detail_path.write_text(detail_html, encoding="utf-8")
        articles.append(meta)
        print(f"  OK {title} → {detail_path.name}")

    # Sort by date desc then slug
    articles.sort(key=lambda a: (-int(a["date"].replace("-", "")), a["slug"]))

    list_html = render_list(articles)
    LIST_PAGE = ROOT / "methods.html"
    LIST_PAGE.write_text(list_html, encoding="utf-8")
    print(f"\n列表页: {LIST_PAGE.name} ({len(articles)} 篇)")

    # Step 3: Bump versions
    version_old = "1.7.6"
    version_new = "1.7.7"

    sw_new = SW.read_text(encoding="utf-8").replace(version_old, version_new)
    SW.write_text(sw_new, encoding="utf-8")
    print(f"  sw.js: {version_old} → {version_new}")

    # Update all HTML files (root + subdirs)
    html_files = sorted(ROOT.glob("*.html")) + sorted(ROOT.glob("**/*.html"))
    for f in html_files:
        if f.parent == ROOT and not f.name.endswith(".html"):
            continue
        text = f.read_text(encoding="utf-8")
        if version_old in text:
            new_text = text.replace(version_old, version_new)
            f.write_text(new_text, encoding="utf-8")
            print(f"  Bump {f.relative_to(ROOT)}")

    print(f"\n✅ v1.7.7 同步完成: {len(articles)} 篇新文章 + 版本 bump")

if __name__ == "__main__":
    main()

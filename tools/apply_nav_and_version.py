# -*- coding: utf-8 -*-
"""
统一全站导航（新增品牌矩阵/成绩单/加入我们三个入口）与静态资源版本号。
可重复执行（幂等）：已注入的页面会跳过，版本号每次强制统一到 TARGET_V。
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_V = "1.6.0"

NAV_TPL = """      <div class="nav-links">
        <a href="{p}index.html"{a_home} data-i18n="nav.home">首页</a>
        <a href="{p}about.html"{a_about} data-i18n="nav.about">关于</a>
        <a href="{p}work.html"{a_work} data-i18n="nav.work">作品集</a>
        <a href="{p}brands.html"{a_brands} data-i18n="nav.brands">品牌矩阵</a>
        <a href="{p}achievements.html"{a_results} data-i18n="nav.results">成绩单</a>
        <a href="{p}blog.html"{a_blog} data-i18n="nav.blog">博客</a>
        <a href="{p}careers.html"{a_careers} data-i18n="nav.careers">加入我们</a>
        <a href="{p}contact.html"{a_contact} data-i18n="nav.contact">联系</a>
        <button class="lang-btn" data-i18n-toggle aria-label="切换语言">EN</button>
      </div>"""

PAGES = [
    ("index.html", "home"), ("about.html", "about"), ("work.html", "work"),
    ("blog.html", "blog"), ("contact.html", "contact"),
    ("brands.html", "brands"), ("achievements.html", "results"),
    ("careers.html", "careers"),
]

changed = []

# ---------- 1. 主页面与文章页：统一导航 ----------
def build_nav(prefix, active):
    keys = ["home", "about", "work", "brands", "results", "blog", "careers", "contact"]
    vals = {k: "" for k in keys}
    if active in vals:
        vals[active] = ' class="active"'
    return NAV_TPL.format(p=prefix, **{"a_" + k: v for k, v in vals.items()})


for name, active in PAGES:
    path = os.path.join(ROOT, name)
    if not os.path.exists(path):
        continue
    html = open(path, encoding="utf-8").read()
    new_nav = build_nav("", active)
    if "brands.html" in html and "careers.html" in html:
        # 已是新导航，仅校正 active 标记
        html2 = re.sub(
            r'<a href="(?:[^"]*?/)?index\.html"(?:\s+class="active")?',
            '<a href="index.html"%s' % (' class="active"' if active == "home" else ""),
            html, count=1)
        html2 = re.sub(r' data-i18n="nav\.', ' data-i18n="nav.', html2)
        # 逐项校正 active
        for k, fname in [("about", "about.html"), ("work", "work.html"),
                         ("brands", "brands.html"), ("results", "achievements.html"),
                         ("blog", "blog.html"), ("careers", "careers.html"),
                         ("contact", "contact.html")]:
            html2 = re.sub(
                r'<a href="%s"(\s+class="active")?' % re.escape(fname),
                '<a href="%s"%s' % (fname, ' class="active"' if active == k else ""),
                html2, count=1)
        if html2 != html:
            open(path, "w", encoding="utf-8").write(html2)
            changed.append(name + " (active 校正)")
        continue
    html2 = re.sub(r'      <div class="nav-links">.*?</div>',
                   lambda m: build_nav("", active), html, flags=re.S)
    if html2 == html:
        print("WARN 未匹配到 nav-links:", name)
        continue
    open(path, "w", encoding="utf-8").write(html2)
    changed.append(name)

# ---------- 2. 文章页：统一导航（相对路径 ../../） ----------
posts_dir = os.path.join(ROOT, "posts")
for fn in sorted(os.listdir(posts_dir)):
    if not fn.endswith(".html"):
        continue
    path = os.path.join(posts_dir, fn)
    html = open(path, encoding="utf-8").read()
    if "brands.html" in html and "careers.html" in html:
        html2 = html
        for k, fname in [("home", "../../index.html"), ("about", "../../about.html"),
                         ("work", "../../work.html"), ("brands", "../../brands.html"),
                         ("results", "../../achievements.html"), ("blog", "../../blog.html"),
                         ("careers", "../../careers.html"), ("contact", "../../contact.html")]:
            html2 = re.sub(
                r'<a href="%s"(\s+class="active")?' % re.escape(fname),
                '<a href="%s"%s' % (fname, ' class="active"' if k == "blog" else ""),
                html2, count=1)
    else:
        html2 = re.sub(r'      <div class="nav-links">.*?</div>',
                       lambda m: build_nav("../../", "blog"), html, flags=re.S)
    if html2 != html:
        open(path, "w", encoding="utf-8").write(html2)
        changed.append("posts/" + fn)

# ---------- 3. 全站静态资源版本号统一 ----------
vcount = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    if ".git" in dirpath or "tools" in dirpath:
        continue
    for fn in filenames:
        if not fn.endswith(".html"):
            continue
        path = os.path.join(dirpath, fn)
        html = open(path, encoding="utf-8").read()
        html2 = re.sub(r'(\.(?:css|js))\?v=[0-9]+(?:\.[0-9]+)*', r'\1?v=' + TARGET_V, html)
        if html2 != html:
            open(path, "w", encoding="utf-8").write(html2)
            vcount += 1

# ---------- 4. sitemap 补充新页面 ----------
sm_path = os.path.join(ROOT, "sitemap.xml")
if os.path.exists(sm_path):
    sm = open(sm_path, encoding="utf-8").read()
    today = "2026-09-01"
    base = "https://alextok200-boop.github.io/"
    for page in ["brands.html", "achievements.html", "careers.html"]:
        if page not in sm:
            entry = ("  <url>\n    <loc>%s%s</loc>\n    <lastmod>%s</lastmod>\n"
                     "    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n"
                     % (base, page, today))
            sm = sm.replace("</urlset>", entry + "</urlset>")
    open(sm_path, "w", encoding="utf-8").write(sm)

print("导航/active 更新 %d 个文件" % len(changed))
for c in changed:
    print("  -", c)
print("版本号统一到 v%s，涉及 %d 个文件" % (TARGET_V, vcount))
print("sitemap 已补充新页面")

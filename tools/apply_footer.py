# -*- coding: utf-8 -*-
"""全站页脚升级：加 RSS 订阅与新增页面入口（幂等）"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TPL = """  <footer class="site-footer">
    <div class="container">
      <p data-i18n="footer.copyright">© 2026 戴程鹏 · Powered by GitHub Pages</p>
      <p class="footer-links">
        <a href="{p}rss.xml" data-i18n="footer.rss">RSS</a>
        <span class="dot">·</span>
        <a href="{p}rss-en.xml">RSS (EN)</a>
        <span class="dot">·</span>
        <a href="{p}brands.html" data-i18n="nav.brands">品牌矩阵</a>
        <span class="dot">·</span>
        <a href="{p}careers.html" data-i18n="nav.careers">加入我们</a>
        <span class="dot">·</span>
        <a href="{p}contact.html" data-i18n="nav.contact">联系</a>
      </p>
    </div>
  </footer>"""

OLD_RE = re.compile(r'  <footer class="site-footer">.*?</footer>', re.S)

changed = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in (".git", "tools", "assets")]
    for fn in sorted(filenames):
        if not fn.endswith(".html"):
            continue
        path = os.path.join(dirpath, fn)
        html = open(path, encoding="utf-8").read()
        if "footer-links" in html:
            continue
        rel = os.path.relpath(path, ROOT).replace("\\", "/")
        prefix = "../../" if rel.startswith("posts/") else ""
        new = TPL.format(p=prefix)
        html2 = OLD_RE.sub(lambda m: new, html, count=1)
        if html2 == html:
            print("WARN 未匹配页脚：", rel)
            continue
        open(path, "w", encoding="utf-8").write(html2)
        changed += 1

print("页脚升级 %d 个页面" % changed)

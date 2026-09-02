# -*- coding: utf-8 -*-
"""patch_theme.py —— 8 个 HTML 批量接入明暗主题：
1. <head> 顶部（stylesheet 前）插入 theme-init 防闪脚本
2. nav-links 内 lang-btn 前插入 .theme-toggle 按钮（内联 SVG 日月图标）
3. </body> 前插入 theme.js
幂等：已含标记则跳过。"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ["index.html", "about.html", "work.html", "blog.html", "brands.html",
         "achievements.html", "careers.html", "contact.html"]

THEME_INIT = """  <script>
    (function () {
      try {
        var t = localStorage.getItem("site_theme");
        if (!t) {
          t = (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
        }
        document.documentElement.setAttribute("data-theme", t);
      } catch (e) { document.documentElement.setAttribute("data-theme", "dark"); }
    })();
  </script>
"""

TOGGLE_BTN = """        <button class="theme-toggle" type="button" aria-label="切换明暗主题" title="切换明暗主题" data-i18n-attr="aria-label:theme.toggle">
          <svg class="icon-sun" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
"""

fail = 0
for name in PAGES:
    path = os.path.join(ROOT, name)
    body = open(path, encoding="utf-8").read()
    changed = []

    # 1. theme-init 防闪脚本（插到 <link rel="stylesheet" 之前；没有则 <head> 后）
    if "theme-init" not in body:
        if '<link rel="stylesheet"' in body:
            body = body.replace('<link rel="stylesheet"', THEME_INIT + '<link rel="stylesheet"', 1)
        else:
            body = body.replace("<head>", "<head>\n" + THEME_INIT, 1)
        changed.append("init")

    # 2. theme-toggle 按钮（lang-btn 前）
    if 'class="theme-toggle"' not in body:
        body = body.replace('<button class="lang-btn"', TOGGLE_BTN + '<button class="lang-btn"', 1)
        changed.append("btn")

    # 3. theme.js 加载（</body> 前）
    if 'theme.js' not in body:
        body = body.replace("</body>", '  <script src="js/theme.js?v=1.6.21"></script>\n</body>', 1)
        changed.append("js")

    if changed:
        open(path, "w", encoding="utf-8").write(body)
        print("  ✓ %-18s +%s" % (name, ",".join(changed)))
    else:
        print("  - %-18s 已含全部标记，跳过" % name)

print("DONE")
sys.exit(0 if not fail else 1)

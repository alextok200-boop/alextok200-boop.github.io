# -*- coding: utf-8 -*-
"""全站 <head> 注入 PWA 相关声明（幂等）"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TAGS = """  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#9333ea">
  <link rel="apple-touch-icon" href="/assets/img/icon-192.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/img/icon-192.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
"""

changed = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in (".git", "tools", "assets")]
    for fn in sorted(filenames):
        if not fn.endswith(".html"):
            continue
        path = os.path.join(dirpath, fn)
        html = open(path, encoding="utf-8").read()
        if 'rel="manifest"' in html:
            continue
        if "</head>" not in html:
            print("WARN 无 </head>：", fn)
            continue
        open(path, "w", encoding="utf-8").write(
            html.replace("</head>", TAGS + "</head>", 1))
        changed += 1

print("head 注入 PWA 声明：%d 个页面" % changed)

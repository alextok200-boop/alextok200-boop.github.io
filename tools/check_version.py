# -*- coding: utf-8 -*-
"""
check_version.py —— 版本号一致性门禁（CI 用）
1. 从 sw.js 读 CACHE 版本（konllen-site-vX.Y.Z）
2. 扫描根目录 + posts/ 所有 HTML 的 ?v= 引用，必须全部等于该版本
3. 任一不一致即 FAIL（防止"改了没 bump"漏网，如 v1.6.16 事故）
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

sw_path = os.path.join(ROOT, "sw.js")
sw = open(sw_path, encoding="utf-8").read()
m = re.search(r"konllen-site-v([\d.]+)", sw)
if not m:
    print("FAIL: sw.js 找不到 CACHE 版本号（konllen-site-vX.Y.Z）")
    sys.exit(1)
ver = m.group(1)

# 扫描范围：根目录 *.html + posts/*.html
htmls = []
for name in sorted(os.listdir(ROOT)):
    if name.endswith(".html"):
        htmls.append(os.path.join(ROOT, name))
posts_dir = os.path.join(ROOT, "posts")
if os.path.isdir(posts_dir):
    for name in sorted(os.listdir(posts_dir)):
        if name.endswith(".html"):
            htmls.append(os.path.join(posts_dir, name))

fail = 0
checked = 0
for path in htmls:
    body = open(path, encoding="utf-8").read()
    for v in re.findall(r"[?&]v=([\d.]+)", body):
        checked += 1
        if v != ver:
            print("  ✗ %s: 引用 v=%s，应为 v=%s" % (os.path.relpath(path, ROOT), v, ver))
            fail += 1

print("== 版本一致性（sw=%s）==" % ver)
print("  检查 %d 处 ?v= 引用，%d 个 HTML" % (checked, len(htmls)))
if fail:
    print("FAIL: %d 处不一致，请统一 bump 到 v%s" % (fail, ver))
    sys.exit(1)
print("ALL PASS ✓ 所有 HTML 引用版本与 sw.js 一致")

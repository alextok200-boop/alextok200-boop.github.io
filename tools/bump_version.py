#!/usr/bin/env python3
"""通用版本 bump：同步修改 sw.js 的 CACHE 版本名与全站 HTML 的资源 ?v= 引用。

用法：
    python tools/bump_version.py                 # 自动从 sw.js 读当前版本，patch +1
    python tools/bump_version.py 1.8.9 1.8.10    # 显式指定 from / to

为什么不写死版本号：早期每版一个 bump_vXXX.py，散落在 tools/ 里越积越多。
本脚本用 sw.js 作为单一事实源（与 tools/check_version.py 同一口径）。
"""
import os
import re
import sys

SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SW = os.path.join(SITE_DIR, "sw.js")
SKIP_DIRS = {".git", "node_modules", "__pycache__", "downloads"}


def current_version():
    m = re.search(r"konllen-site-v([\d.]+)", open(SW, encoding="utf-8").read())
    if not m:
        raise SystemExit("FAIL: sw.js 找不到 konllen-site-vX.Y.Z")
    return m.group(1)


def next_version(v):
    parts = [int(x) for x in v.split(".")]
    while len(parts) < 3:
        parts.append(0)
    parts[2] += 1
    return ".".join(str(x) for x in parts)


args = sys.argv[1:]
if len(args) >= 2:
    OLD, NEW = args[0], args[1]
elif len(args) == 1:
    OLD, NEW = current_version(), args[0]
else:
    OLD = current_version()
    NEW = next_version(OLD)

if OLD == NEW:
    raise SystemExit("FAIL: from == to (%s)" % OLD)

PAIRS = [("?v=%s" % OLD, "?v=%s" % NEW), ("konllen-site-v%s" % OLD, "konllen-site-v%s" % NEW)]
print("bump %s -> %s" % (OLD, NEW))

touched = total = 0
for root, dirs, files in os.walk(SITE_DIR):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith("_backup")]
    for fname in files:
        if not fname.endswith(".html") and fname != "sw.js":
            continue
        fpath = os.path.join(root, fname)
        txt = open(fpath, "rb").read().decode("utf-8")
        orig, n = txt, 0
        for old, new in PAIRS:
            n += txt.count(old)
            txt = txt.replace(old, new)
        if txt != orig:
            open(fpath, "wb").write(txt.encode("utf-8"))
            touched += 1
            total += n

print("完成：%d 个文件、%d 处替换 -> v%s" % (touched, total, NEW))
print("下一步：python tools/check_version.py")

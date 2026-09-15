#!/usr/bin/env python3
"""批量 bump 全站缓存击穿号：v1.8.6 → v1.8.7（HTML ?v= + sw.js CACHE 名）"""
import os

SITE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAIRS = [("?v=1.8.6", "?v=1.8.7"), ("konllen-site-v1.8.6", "konllen-site-v1.8.7")]
SKIP_DIRS = {".git", "node_modules", "__pycache__", "downloads"}

touched = 0
total = 0
for root, dirs, files in os.walk(SITE_DIR):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith("_backup")]
    for fname in files:
        if not fname.endswith(".html") and fname != "sw.js":
            continue
        fpath = os.path.join(root, fname)
        raw = open(fpath, "rb").read()
        txt = raw.decode("utf-8")
        orig = txt
        n = 0
        for old, new in PAIRS:
            n += txt.count(old)
            txt = txt.replace(old, new)
        if txt != orig:
            open(fpath, "wb").write(txt.encode("utf-8"))
            touched += 1
            total += n
            print(f"  {n:3d}  {os.path.relpath(fpath, SITE_DIR)}")

print(f"\n完成：{touched} 个文件、{total} 处替换 → v1.8.7")

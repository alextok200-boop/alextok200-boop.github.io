#!/usr/bin/env python3
"""版本门禁：检查 sw.js 版本与全站 ?v= 引用是否一致"""
import os
import re

SITE_DIR = os.path.dirname(os.path.abspath(__file__))

def extract_version(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'konllen-site-v(\d+\.\d+\.\d+)', content)
    return m.group(1) if m else None

sw_ver = extract_version(os.path.join(SITE_DIR, 'sw.js'))
if not sw_ver:
    print("ERROR: 无法从 sw.js 提取版本号")
    exit(1)

print(f"sw.js 版本号: konllen-site-v{sw_ver}")
print(f"目标引用号:   ?v={sw_ver}")

mismatch = []
for root, dirs, files in os.walk(SITE_DIR):
    dirs[:] = [d for d in dirs if d not in ['.git', '.trash-temp', 'downloads', '_backup', 'node_modules']]
    for fname in files:
        if fname.endswith('.html'):
            fpath = os.path.join(root, fname)
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            # 检查所有 CSS/JS 引用
            for m in re.finditer(r'[\?&]v=(\d+\.\d+\.\d+)', content):
                found = m.group(1)
                if found != sw_ver:
                    mismatch.append((fpath, found, sw_ver))

if mismatch:
    print("\n✗ 版本不一致！")
    for path, found, expected in mismatch[:5]:
        print(f"  {os.path.relpath(path, SITE_DIR)}: ?v={found} (应为 ?v={expected})")
    exit(1)
else:
    print("✓ 全站版本一致")

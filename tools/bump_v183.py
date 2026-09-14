#!/usr/bin/env python3
"""批量替换全站 ?v= 引用：v1.8.2 → v1.8.3"""
import os
import re

SITE_DIR = os.path.dirname(os.path.abspath(__file__))
OLD_V = "?v=1.8.2"
NEW_V = "?v=1.8.3"

def bump_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if OLD_V not in content:
        return 0
    new_content = content.replace(OLD_V, NEW_V)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return 1

count = 0
for root, dirs, files in os.walk(SITE_DIR):
    # 跳过 .git, .trash-temp, downloads, _backup 等目录
    dirs[:] = [d for d in dirs if d not in ['.git', '.trash-temp', 'downloads', '_backup', 'node_modules']]
    for fname in files:
        if fname.endswith('.html'):
            fpath = os.path.join(root, fname)
            if bump_file(fpath):
                count += 1
                print(f"✓ {os.path.relpath(fpath, SITE_DIR)}")

print(f"\n完成：{count} 个文件已更新")

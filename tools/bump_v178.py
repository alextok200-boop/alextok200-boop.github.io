# -*- coding: utf-8 -*-
"""v1.7.8 bump: 添加认证系统"""
from pathlib import Path

ROOT = Path(r"C:\Users\alext\Web\personal-site")
version_old = "1.7.7"
version_new = "1.7.8"

# 更新所有 HTML 文件
for f in ROOT.glob("**/*.html"):
    if ".git" in f.parts:
        continue
    text = f.read_text(encoding="utf-8")
    if version_old in text:
        new_text = text.replace(version_old, version_new)
        f.write_text(new_text, encoding="utf-8")
        print(f"Bump {f.relative_to(ROOT)}")

print(f"\n✅ v{version_new} 完成")

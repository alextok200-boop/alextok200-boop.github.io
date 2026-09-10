# -*- coding: utf-8 -*-
"""
bump_v182.py —— v1.8.1 -> v1.8.2
变更内容：团队门户残留清理（删 pages/team、dist）+ 认证简化为单站长 + admin.html 改造为内容管理导航页
规则：全站所有 ?v= 引用（HTML + JS 内联）+ sw.js CACHE 版本必须同步
"""
import re
from pathlib import Path

ROOT = Path(r"C:\Users\alext\Web\personal-site")
OLD, NEW = "1.8.1", "1.8.2"

changed = []

for f in ROOT.glob("**/*.html"):
    if ".git" in f.parts or "tools" in f.parts:
        continue
    text = f.read_text(encoding="utf-8")
    new_text = re.sub(r"([?&]v=)" + re.escape(OLD) + r"\b", r"\g<1>" + NEW, text)
    if new_text != text:
        f.write_text(new_text, encoding="utf-8")
        changed.append(str(f.relative_to(ROOT)))

print("已更新 %d 个 HTML 文件：" % len(changed))
for c in changed:
    print("  -", c)
print("\n✅ v%s bump 完成" % NEW)

# -*- coding: utf-8 -*-
"""
rewrite_css_v170.py —— v1.7.0 定位整改的 CSS 配套改造
1) 删除 b2b-* 招商卡片死代码（B2B section 已从首页移除）
2) brand-* 语义重命名为 project-*（品牌矩阵页已改造为项目作品集）
3) 亮色 RGB 三色分配改为基于卡片循环（原 nth-child 写法因 tag 固定为第 2 子元素而恒为绿色）
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "css" / "style.css"
BRANDS = ROOT / "brands.html"

txt = CSS.read_text(encoding="utf-8")
orig_len = len(txt.split("\n"))

# ---------- 1) 删除 b2b 卡片死代码块 ----------
start = txt.index(".b2b-grid {")
end = txt.index(".b2b-cta {")
dead = txt[start:end]
print(f"删除 b2b 死代码块：{len(dead.split(chr(10)))} 行（.b2b-grid ~ .b2b-action span）")
txt = txt[:start] + txt[end:]

# ---------- 2) b2b-cta / b2b-hint 重命名为 project-* ----------
txt = txt.replace(".b2b-cta {", ".project-cta {").replace(".b2b-hint {", ".project-hint {")
print("b2b-cta/hint → project-cta/hint")

# ---------- 3) brand-* → project-* ----------
# 删除不再使用的 .brand-main 与 .brand-tag-hot
for block in [
    ".brand-main {\n  border-color: rgba(168, 85, 247, 0.45);\n  box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.12);\n}\n\n",
    ".brand-tag-hot {\n  background: rgba(0, 255, 163, 0.12);\n  color: var(--neon-green);\n  border-color: rgba(0, 255, 163, 0.3);\n}\n\n",
]:
    if block in txt:
        txt = txt.replace(block, "")
        print(f"删除废弃规则：{block.split('{')[0].strip()}")

for a, b in [
    (".brand-card", ".project-card"),
    (".brand-name", ".project-name"),
    (".brand-tag", ".project-tag"),
    (".brand-desc", ".project-desc"),
    (".brand-meta", ".project-meta"),
]:
    n = txt.count(a)
    txt = txt.replace(a, b)
    print(f"  {a} → {b}：{n} 处")

# ---------- 4) 亮色 RGB 三色：改为基于卡片循环 ----------
old_rgb = """:root[data-theme="light"] .project-tag { color: #4a4f6a; background: rgba(14, 16, 36, 0.04); }
:root[data-theme="light"] .project-tag:nth-child(3n+1) { color: #ff1744; background: rgba(255, 23, 68, 0.10); }
:root[data-theme="light"] .project-tag:nth-child(3n+2) { color: #00c853; background: rgba(0, 200, 83, 0.10); }
:root[data-theme="light"] .project-tag:nth-child(3n+3) { color: #2962ff; background: rgba(41, 98, 255, 0.10); }"""
new_rgb = """:root[data-theme="light"] .project-tag { color: #4a4f6a; background: rgba(14, 16, 36, 0.04); }
/* 亮色下按卡片循环 R/G/B：tag 配色与卡片顶部边框同色系 */
:root[data-theme="light"] .project-card:nth-of-type(3n+1) .project-tag { color: #ff1744; background: rgba(255, 23, 68, 0.10); border-color: rgba(255, 23, 68, 0.28); }
:root[data-theme="light"] .project-card:nth-of-type(3n+2) .project-tag { color: #00c853; background: rgba(0, 200, 83, 0.10); border-color: rgba(0, 200, 83, 0.28); }
:root[data-theme="light"] .project-card:nth-of-type(3n+3) .project-tag { color: #2962ff; background: rgba(41, 98, 255, 0.10); border-color: rgba(41, 98, 255, 0.28); }"""
if old_rgb in txt:
    txt = txt.replace(old_rgb, new_rgb)
    print("亮色 RGB 三色分配：改为基于卡片循环（修复 tag 恒为绿色）")
else:
    print("  [MISS] 亮色 RGB 块未匹配")

# ---------- 5) 新增 project-title / project-grid ----------
anchor = ".project-desc {"
addon = """.project-title {
  font-size: 18px;
  margin-bottom: 10px;
  line-height: 1.45;
}

.project-grid {
  align-items: stretch;
}

"""
if anchor in txt and ".project-title {" not in txt:
    txt = txt.replace(anchor, addon + anchor, 1)
    print("新增 .project-title / .project-grid 规则")

CSS.write_text(txt, encoding="utf-8")
print(f"\nCSS: {orig_len} → {len(txt.split(chr(10)))} 行")

# ---------- 6) brands.html 的 b2b-cta/hint → project-* ----------
b = BRANDS.read_text(encoding="utf-8")
b = b.replace('class="b2b-cta"', 'class="project-cta"').replace('class="b2b-hint"', 'class="project-hint"')
BRANDS.write_text(b, encoding="utf-8")
print("brands.html: b2b-cta/hint → project-cta/hint")

# ---------- 校验 ----------
t = CSS.read_text(encoding="utf-8")
print("\n=== 残留校验 ===")
for k in ["b2b-grid", "b2b-card", "b2b-tier", "b2b-list", "b2b-action", "brand-card", "brand-name", "brand-tag", "brand-desc", "brand-meta", "brand-main"]:
    print(f"  CSS [{k}]: {t.count(k)}")
print(f"  CSS 花括号平衡: {{ {t.count('{')} / }} {t.count('}')}")

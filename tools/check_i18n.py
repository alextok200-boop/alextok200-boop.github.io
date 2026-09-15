# -*- coding: utf-8 -*-
"""文案一致性自检：HTML 里的 data-i18n 静态 fallback 是否与 js/i18n.js 的真值一致。

为什么需要它
------------
站点是「运行时 i18n」：`js/i18n.js` 在页面加载后用 `textContent` 覆盖文本。
后果是——**用户看到的永远是对的，爬虫 / 禁用 JS / 首屏闪动时看到的是 HTML 里的
静态 fallback**。所以只改 i18n.js 而漏改 HTML，问题对用户不可见，却会污染
搜索结果与社交卡片，属于最容易漏的一类缺陷（v1.8.7 一次扫出 56 处）。

用法：
    python tools/check_i18n.py            # 报告
    python tools/check_i18n.py --fix      # 以 i18n.js 为准回写 HTML 的静态文本

判定口径：
  · 只比 zh 真值（静态 fallback 只会在中文语境下被看到）；
  · 归一化：去标签、折叠空白、去尾部必填星号；
  · 刻意例外放 ALLOW（如 footer.rss 图标旁刻意更短、contact.form 静态带 '*'）。
"""
import argparse
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
I18N = os.path.join(ROOT, "js", "i18n.js")

# 刻意保留的差异：key 前缀 -> 原因
ALLOW = {
    "footer.rss": "图标旁刻意用更短的 RSS",
    "contact.form.": "静态文本带必填星号 *，i18n 真值不含",
}

SKIP_DIRS = {".git", "node_modules", "__pycache__", "downloads", "tools"}


def parse_i18n(path):
    """从 i18n.js 抽 key -> {zh, en}。用宽松正则，不 eval JS。"""
    txt = open(path, encoding="utf-8").read()
    out = {}
    for m in re.finditer(r'"([^"]+)"\s*:\s*\{\s*zh:\s*"((?:[^"\\]|\\.)*)"\s*,\s*en:\s*"((?:[^"\\]|\\.)*)"\s*\}', txt):
        key, zh, en = m.group(1), m.group(2), m.group(3)
        out[key] = {"zh": zh.replace('\\"', '"').replace("\\n", "\n"),
                    "en": en.replace('\\"', '"').replace("\\n", "\n")}
    return out


def norm(s):
    s = re.sub(r"<[^>]+>", "", s)          # 去内联标签
    s = html.unescape(s)
    s = s.replace("\u00a0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s*\*\s*$", "", s)         # 去尾部必填星号
    return s


def allowed(key):
    return any(key == p or key.startswith(p) for p in ALLOW)


def html_files():
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in SKIP_DIRS and not d.startswith(("_backup", "_tmp"))]
        for f in sorted(fn):
            if f.endswith(".html"):
                yield os.path.join(dp, f)


# <tag ... data-i18n="key" ...>静态文本</tag>
PATTERN = re.compile(
    r'<(\w[\w-]*)\b([^>]*?)\bdata-i18n="([^"]+)"([^>]*)>(.*?)</\1>',
    re.S)


def scan(truth, fix=False):
    problems, fixed, checked = [], 0, 0
    for p in html_files():
        src = open(p, encoding="utf-8").read()
        orig = src
        for m in PATTERN.finditer(src):
            key, inner = m.group(3), m.group(5)
            checked += 1
            if key not in truth or allowed(key):
                continue
            want, got = truth[key]["zh"], norm(inner)
            if got == want:
                continue
            if fix:
                # 只替换标签之间的那段文本，保留原缩进（多行折成单行是正常的）
                head = m.group(0)[:m.start(5) - m.start(0)]
                repl = head + html.escape(want, quote=False) + "</%s>" % m.group(1)
                src = src.replace(m.group(0), repl, 1)
                fixed += 1
            else:
                problems.append((os.path.relpath(p, ROOT), key, got[:60], want[:60]))
        if fix and src != orig:
            open(p, "w", encoding="utf-8", newline="\n").write(src)
    return checked, problems, fixed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fix", action="store_true", help="以 i18n.js 为准回写 HTML")
    a = ap.parse_args()

    truth = parse_i18n(I18N)
    if not truth:
        print("✗ 未能从 %s 解析出任何 key，请检查格式" % I18N)
        return 1
    print("i18n.js key 数：%d" % len(truth))

    checked, problems, fixed = scan(truth, a.fix)
    print("扫描 data-i18n 元素：%d 个" % checked)

    if a.fix:
        print("已回写：%d 处" % fixed)
        checked2, problems2, _ = scan(truth, False)
        print("复查后剩余漂移：%d 处" % len(problems2))
        for f, k, g, w in problems2[:20]:
            print("   %s  %s\n      静态=%s\n      真值=%s" % (f, k, g, w))
        return 0 if not problems2 else 2

    print("静态 fallback 与真值漂移：%d 处" % len(problems))
    for f, k, g, w in problems:
        print("   %s  %s\n      静态=%s\n      真值=%s" % (f, k, g, w))
    print()
    print("RESULT:", "ALL PASS ✅" if not problems else "DRIFT ❌")
    return 0 if not problems else 2


if __name__ == "__main__":
    sys.exit(main())

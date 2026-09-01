# -*- coding: utf-8 -*-
"""
把指定脚本注入全站所有 HTML 页面（幂等：已存在则跳过）。
用法：python tools/inject_script.py seo.js analytics.js comments.js
文章页自动使用 ../../ 相对前缀。
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "1.6.0"


def html_files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".git", "tools", "assets")]
        for fn in sorted(filenames):
            if fn.endswith(".html"):
                yield os.path.join(dirpath, fn)


def inject(js_name, first=False):
    count = 0
    for path in html_files():
        html = open(path, encoding="utf-8").read()
        if js_name in html:
            continue
        rel = os.path.relpath(path, ROOT).replace("\\", "/")
        prefix = "../../" if rel.startswith("posts/") else ""
        tag = '  <script src="%sjs/%s?v=%s"></script>\n' % (prefix, js_name, V)
        if first:
            # 插到第一个 script 之前，保证配置类脚本先于业务脚本执行
            idx = html.find("<script")
            if idx < 0 or "</body>" not in html:
                print("WARN 无 script/body：", rel)
                continue
            html = html[:idx] + tag + html[idx:]
        else:
            if "</body>" not in html:
                print("WARN 无 </body>：", rel)
                continue
            html = html.replace("</body>", tag + "</body>", 1)
        open(path, "w", encoding="utf-8").write(html)
        count += 1
    print("注入 %s → %d 个页面" % (js_name, count))


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--first"]
    if not args:
        print(__doc__)
        sys.exit(1)
    for name in args:
        inject(name if name.endswith(".js") else name + ".js",
               first="--first" in sys.argv)

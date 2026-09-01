# -*- coding: utf-8 -*-
"""全站补齐 OG / Twitter / canonical meta（幂等：已存在则跳过整块）"""
import os
import re
import html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://alextok200-boop.github.io"


def esc(s):
    return html.escape(s, quote=True)


def page_url(path, rel):
    rel = rel.replace("\\", "/")
    return SITE + "/" + rel


def build_block(rel, title, desc):
    url = page_url(SITE, rel)
    is_post = rel.startswith("posts/")
    og_type = "article" if is_post else "website"
    og_image = SITE + "/assets/img/og-default.png"
    return (
        '  <meta property="og:title" content="' + esc(title) + '">\n'
        '  <meta property="og:description" content="' + esc(desc) + '">\n'
        '  <meta property="og:type" content="' + og_type + '">\n'
        '  <meta property="og:url" content="' + url + '">\n'
        '  <meta property="og:site_name" content="戴程鹏">\n'
        '  <meta property="og:image" content="' + og_image + '">\n'
        '  <meta name="twitter:card" content="summary_large_image">\n'
        '  <link rel="canonical" href="' + url + '">\n'
    )


def extract_title(html_str):
    m = re.search(r'<title>([^<]+)</title>', html_str)
    if not m:
        return ""
    return m.group(1).strip()


def extract_desc(html_str):
    m = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', html_str)
    return m.group(1).strip() if m else ""


def main():
    n = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".git", "tools", "assets")]
        for fn in sorted(filenames):
            if not fn.endswith(".html"):
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, ROOT).replace("\\", "/")
            text = open(path, encoding="utf-8").read()
            if 'property="og:title"' in text:
                continue  # 整块已有
            block = build_block(rel, extract_title(text), extract_desc(text))
            if "</head>" not in text:
                print("WARN 无 </head>：", rel)
                continue
            open(path, "w", encoding="utf-8").write(text.replace("</head>", block + "</head>", 1))
            n += 1
    print("OG/Twitter/canonical 补齐：%d 个页面" % n)


if __name__ == "__main__":
    main()

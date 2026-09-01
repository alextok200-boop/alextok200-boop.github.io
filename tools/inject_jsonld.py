# -*- coding: utf-8 -*-
"""
inject_jsonld.py —— 构建期把 JSON-LD 静态注入到每页 head
为什么不用 seo.js 浏览器动态注入：搜索爬虫抓 HTML 时不执行 JS，
静态存在的 JSON-LD 才能保证被稳定抓取。
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://alextok200-boop.github.io"


# ---------- 读 site-config.js 与 posts-data.js ----------
def read_file(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def parse_site_config(text):
    site = {
        "siteName": "戴程鹏",
        "siteNameEn": "Dai Chengpeng",
        "author": "戴程鹏",
        "authorEn": "Dai Chengpeng",
        "jobTitle": "电商操盘手 · AI 技能包工程负责人",
        "jobTitleEn": "E-commerce Operator · AI Skill Pack Engineer",
        "orgName": "万世康伦（KONLLEN）集团",
        "orgNameEn": "KONLLEN Group",
        "email": "alextok200@gmail.com",
        "github": "https://github.com/alextok200",
    }
    m = re.search(r'siteUrl\s*:\s*"([^"]+)"', text)
    if m:
        site["siteUrl"] = m.group(1)
    return site


def parse_posts_data(text):
    """从 js/posts-data.js 提取 file/date/title/en.title/en.summary/summary"""
    posts = []
    # 切分每个 { ... } 块
    blocks = re.findall(r'\{\s*file\s*:[^{}]*?(?:en\s*:\s*\{[^{}]*\})?[^{}]*?\}', text, re.S)
    for b in blocks:
        d = {"file": "", "title": "", "en_title": "", "summary": "", "en_summary": "", "date": ""}
        m = re.search(r'file\s*:\s*"([^"]+)"', b)
        if m: d["file"] = m.group(1)
        m = re.search(r'\bdate\s*:\s*"([^"]+)"', b)
        if m: d["date"] = m.group(1)
        m = re.search(r'\btitle\s*:\s*"([^"]*(?:\\.[^"]*)*)"', b)
        if m: d["title"] = m.group(1).encode().decode("unicode_escape")
        m = re.search(r'\bsummary\s*:\s*"([^"]*(?:\\.[^"]*)*)"', b)
        if m: d["summary"] = m.group(1).encode().decode("unicode_escape")
        m = re.search(r'en\s*:\s*\{\s*title\s*:\s*"([^"]*(?:\\.[^"]*)*)"', b)
        if m: d["en_title"] = m.group(1).encode().decode("unicode_escape")
        m = re.search(r'en\s*:\s*\{[^{}]*?summary\s*:\s*"([^"]*(?:\\.[^"]*)*)"', b)
        if m: d["en_summary"] = m.group(1).encode().decode("unicode_escape")
        if d["file"]:
            posts.append(d)
    return posts


# ---------- 生成 schema ----------
def schema_for(rel, posts, site, is_en):
    base = (site.get("siteUrl") or SITE).rstrip("/")
    path = "/" + rel.replace("\\", "/")
    is_post = rel.startswith("posts/")
    person_name = site["authorEn"] if is_en else site["author"]
    job_title = site["jobTitleEn"] if is_en else site["jobTitle"]
    org_name = site["orgNameEn"] if is_en else site["orgName"]
    in_language = "en" if is_en else "zh-CN"

    person = {
        "@type": "Person",
        "name": person_name,
        "jobTitle": job_title,
        "url": base + "/",
        "email": "mailto:" + site["email"] if site.get("email") else None,
        "worksFor": {"@type": "Organization", "name": org_name},
        "sameAs": [site["github"]] if site.get("github") else [],
    }
    person = {k: v for k, v in person.items() if v not in (None, "", [])}

    org = {"@type": "Organization", "name": org_name, "url": base + "/"}
    schemas = []

    if is_post:
        file = os.path.basename(rel).replace(".html", "")
        meta = next((p for p in posts if p["file"] == file), None)
        title = (meta["en_title"] if (meta and is_en and meta["en_title"]) else
                 (meta["title"] if meta else ""))
        summary = (meta["en_summary"] if (meta and is_en and meta["en_summary"]) else
                   (meta["summary"] if meta else ""))
        date = meta["date"] if meta else ""
        schemas.append({
            "@context": "https://schema.org",
            "@type": "Article",
            "mainEntityOfPage": {"@type": "WebPage", "@id": base + path},
            "headline": title,
            "description": summary,
            "inLanguage": in_language,
            "datePublished": date,
            "dateModified": date,
            "author": person,
            "publisher": org,
        })
        schemas.append({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1,
                 "name": "Home" if is_en else "首页", "item": base + "/"},
                {"@type": "ListItem", "position": 2,
                 "name": "Blog" if is_en else "博客", "item": base + "/blog.html"},
                {"@type": "ListItem", "position": 3, "name": title, "item": base + path},
            ],
        })
    else:
        is_home = rel in ("index.html", "index.htm") or rel == ""
        if is_home:
            schemas.append({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": site["siteNameEn"] if is_en else site["siteName"],
                "url": base + "/",
                "inLanguage": in_language,
                "author": person,
                "publisher": org,
            })
            schemas.append(dict(person, **{"@context": "https://schema.org"}))
            schemas.append(dict(org, **{"@context": "https://schema.org"}))
        else:
            # 其它内页只输出 BreadcrumbList（不重复个人 / 组织）
            page_name = site["siteNameEn"] if is_en else site["siteName"]
            schemas.append({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1,
                     "name": "Home" if is_en else "首页", "item": base + "/"},
                    {"@type": "ListItem", "position": 2,
                     "name": page_name, "item": base + path},
                ],
            })
    return schemas


def serialize(schemas):
    return "\n".join(
        '  <script type="application/ld+json">%s</script>' % json.dumps(s, ensure_ascii=False, separators=(",", ":"))
        for s in schemas
    )


def main():
    site = parse_site_config(read_file(os.path.join(ROOT, "js", "site-config.js")))
    posts = parse_posts_data(read_file(os.path.join(ROOT, "js", "posts-data.js")))
    n = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".git", "tools", "assets")]
        for fn in sorted(filenames):
            if not fn.endswith(".html"):
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, ROOT).replace("\\", "/")
            text = read_file(path)

            schemas = schema_for(rel, posts, site, is_en=False)
            block_zh = serialize(schemas)
            schemas_en = schema_for(rel, posts, site, is_en=True)
            block_en = serialize(schemas_en)
            block = block_zh + "\n" + block_en

            # 把旧的 JSON-LD 全清（避免重复），再插入新 block
            text = re.sub(r'  <script type="application/ld\+json">.*?</script>\n?', '', text, flags=re.S)
            if "</head>" not in text:
                continue
            text = text.replace("</head>", block + "\n</head>", 1)
            with open(path, "w", encoding="utf-8") as f:
                f.write(text)
            n += 1
    print("JSON-LD 注入：%d 个页面" % n)


if __name__ == "__main__":
    main()

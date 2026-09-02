# -*- coding: utf-8 -*-
"""
smoke_test.py —— 本地起 http server 跑冒烟测试
需要先用 python -m http.server 8000 起服务（scripts 启动）。
测试所有 HTML 200、关键资源 200、关键 DOM 节点与 JSON-LD 存在。
"""
import os
import re
import sys
import urllib.request
import urllib.error

BASE = os.environ.get("SITE_BASE", "http://127.0.0.1:8000")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = [
    "index.html", "about.html", "work.html", "blog.html", "contact.html",
    "brands.html", "achievements.html", "careers.html",
]
RESOURCES = [
    "css/style.css", "js/i18n.js", "js/main.js", "js/site-config.js",
    "js/lightfall.js", "js/blog.js", "js/post.js", "js/posts-data.js",
    "js/seo.js", "js/analytics.js", "js/comments.js", "js/sw-register.js",
    "js/inquiry.js", "js/newsletter.js", "js/assistant.js", "manifest.webmanifest", "sw.js",
    "rss.xml", "rss-en.xml", "assets/dai-chengpeng.vcf",
    "assets/img/og-default.png", "assets/img/favicon-16.png",
    "assets/img/favicon-32.png", "assets/img/favicon-180.png",
    "assets/img/icon-192.png", "assets/img/icon-512.png",
    "assets/img/icon-512-maskable.png", "assets/video/hero.mp4",
]

fail = 0


def get(path):
    url = BASE + "/" + path.lstrip("/")
    try:
        return urllib.request.urlopen(url, timeout=5), None
    except urllib.error.HTTPError as e:
        return None, "HTTP " + str(e.code)
    except Exception as e:
        return None, str(e)


def check_status(label, path, expect=200):
    global fail
    r, err = get(path)
    if err:
        print("  ✗", label, "→", path, "：", err)
        fail += 1
        return None
    code = r.status
    body = r.read()
    r.close()
    if code != expect:
        print("  ✗", label, "→", path, "：got", code)
        fail += 1
        return None
    print("  ✓", label, "→", path, "[", len(body), "B ]")
    return body


def check_contains(path, needle, label):
    global fail
    body = check_status(label, path)
    if body is None:
        return
    text = body.decode("utf-8", errors="ignore") if isinstance(body, bytes) else str(body)
    if needle in text:
        print("    ✓ 含", repr(needle)[:60])
    else:
        print("    ✗ 缺", repr(needle)[:60])
        fail += 1


def check_count(path, regex, min_n, label):
    global fail
    body = check_status(label, path)
    if body is None:
        return
    text = body.decode("utf-8", errors="ignore")
    n = len(re.findall(regex, text))
    if n >= min_n:
        print("    ✓ 匹配", label, "×", n)
    else:
        print("    ✗ 匹配", label, ": only", n, "/ expected ≥", min_n)
        fail += 1


def main():
    global fail
    print("== 1. 页面 200 ==")
    for p in PAGES:
        check_status("page", p)
    print("== 2. 资源 200 ==")
    for p in RESOURCES:
        check_status("asset", p)
    print("== 3. 关键 DOM 节点 ==")
    check_contains("index.html", "B2B 电商招募", "首页 B2B 模块")
    check_contains("index.html", "id=\"lightfall\"", "首页 lightfall 容器")
    check_contains("contact.html", "id=\"inquiryForm\"", "联系表单 inquiryForm")
    check_contains("contact.html", "inquiry.js", "联系表单 inquiry.js")
    check_contains("brands.html", "brand-card", "品牌卡片")
    check_count("brands.html", r'class="[^"]*brand-card[^"]*"', 9, "品牌卡片数量")
    check_contains("brands.html", 'id="brand-inquiry"', "品牌页招商表单容器")
    check_contains("brands.html", 'class="contact-form inquiry-form"', "品牌页招商表单（inquiry 多表单）")
    check_contains("brands.html", 'name="brand"', "招商表单意向品牌字段")
    check_contains("brands.html", 'id="brand-auth-inquiry"', "品牌授权申请表单容器")
    check_contains("brands.html", 'data-subject="品牌授权申请"', "授权申请表单邮件主题分流")
    check_contains("brands.html", 'name="coop_type"', "授权申请类型字段")
    check_contains("brands.html", 'name="channel"', "授权申请销售渠道字段")
    check_contains("achievements.html", "ach-card", "成绩单数据卡")
    check_count("achievements.html", r'class="[^"]*ach-card[^"]*"', 6, "成绩单卡片数量")
    check_contains("careers.html", "job-card", "招聘岗位卡")
    check_count("careers.html", r'class="[^"]*job-card[^"]*"', 4, "招聘岗位数量")
    check_contains("index.html", "newsletter-form", "首页 Newsletter 订阅表单")
    check_contains("index.html", 'data-subject="Newsletter 订阅"', "首页订阅邮件主题分流")
    check_contains("blog.html", "newsletter-form", "博客页 Newsletter 订阅表单")
    print("== 4. JSON-LD 注入 ==")
    check_count("index.html", r'application/ld\+json', 3, "首页 JSON-LD 数")
    check_count("about.html", r'application/ld\+json', 1, "内页 JSON-LD 数")
    check_count("posts/2026-07-28-b2b.html", r'application/ld\+json', 2, "文章页 JSON-LD 数")
    print("== 5. RSS 内容 ==")
    check_status("rss", "rss.xml")
    body = urllib.request.urlopen(BASE + "/rss.xml", timeout=5).read().decode("utf-8", errors="ignore")
    n_item = len(re.findall(r"<item>", body))
    print("    ✓ rss.xml 条目数", n_item, "（期望 15）")
    if n_item != 15:
        fail += 1

    print()
    if fail:
        print("FAIL: %d 个问题" % fail)
        sys.exit(1)
    else:
        print("ALL PASS ✓")


if __name__ == "__main__":
    main()

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
    "brands.html", "achievements.html", "careers.html", "methods.html",
]
RESOURCES = [
    "css/style.css", "js/i18n.js", "js/main.js", "js/site-config.js",
    "js/lightfall.js", "js/blog.js", "js/post.js", "js/posts-data.js",
    "js/seo.js", "js/analytics.js", "js/comments.js", "js/sw-register.js",
    "js/inquiry.js", "js/newsletter.js", "js/theme.js", "js/assistant.js", "manifest.webmanifest", "sw.js",
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
    # v1.7.0：B2B 招商段已删除；brands.html 改造为项目作品集；about 简历化
    check_contains("index.html", "id=\"lightfall\"", "首页 lightfall 容器")
    check_contains("contact.html", "id=\"inquiryForm\"", "联系表单 inquiryForm")
    check_contains("contact.html", "inquiry.js", "联系表单 inquiry.js")
    # brands.html：项目作品集
    check_contains("brands.html", "project-card", "项目卡片类名")
    check_count("brands.html", r'class="[^"]*project-card[^"]*"', 6, "项目卡片数量（6 个）")
    check_contains("brands.html", "项目作品", "项目页 h1")
    # about.html：简历化
    check_contains("about.html", "resume-name", "简历姓名")
    check_contains("about.html", "resume-stats", "核心数字条")
    check_count("about.html", r'class="[^"]*resume-stat"', 5, "数字条 5 项")
    check_count("about.html", r'class="[^"]*skill-tag"', 9, "技能标签 9 个")
    check_contains("about.html", "timeline-item", "工作经历时间线")
    check_contains("about.html", "methods.html", "简历→方法论外链")
    # methods.html：方法论栏目
    check_contains("methods.html", "方法论", "方法论列表页 h1")
    check_contains("methods.html", "project-card", "方法论卡片类名")
    # achievements / careers 保持
    check_contains("achievements.html", "ach-card", "成绩单数据卡")
    check_count("achievements.html", r'class="[^"]*ach-card[^"]*"', 6, "成绩单卡片数量")
    check_contains("careers.html", "job-card", "招聘岗位卡")
    check_count("careers.html", r'class="[^"]*job-card[^"]*"', 4, "招聘岗位数量")
    # newsletter + 主题
    check_contains("index.html", "newsletter-form", "首页 Newsletter 订阅表单")
    check_contains("index.html", 'data-subject="Newsletter 订阅"', "首页订阅邮件主题分流")
    check_contains("blog.html", "newsletter-form", "博客页 Newsletter 订阅表单")
    check_contains("index.html", 'class="theme-toggle"', "首页主题切换按钮")
    check_contains("index.html", 'localStorage.getItem("site_theme")', "首页主题防闪脚本")
    check_contains("about.html", 'class="theme-toggle"', "内页主题切换按钮")
    check_count("index.html", r'data-theme', 1, "主题 data-theme 属性")
    print("== 4. JSON-LD 注入 ==")
    # v1.7.0：删独立 Organization 实体（品牌官网声明），保留 worksFor 履历信息
    check_count("index.html", r'application/ld\+json', 4, "首页 JSON-LD 数（4：zh+en WebSite+Person）")
    check_count("about.html", r'application/ld\+json', 1, "内页 JSON-LD 数")
    check_count("posts/2026-07-28-b2b.html", r'application/ld\+json', 2, "文章页 JSON-LD 数")
    print("== 5. RSS 内容 ==")
    check_status("rss", "rss.xml")
    body = urllib.request.urlopen(BASE + "/rss.xml", timeout=5).read().decode("utf-8", errors="ignore")
    n_item = len(re.findall(r"<item>", body))
    print("    ✓ rss.xml 条目数", n_item, "（期望 20）")
    if n_item != 20:
        fail += 1

    print()
    if fail:
        print("FAIL: %d 个问题" % fail)
        sys.exit(1)
    else:
        print("ALL PASS ✓")


if __name__ == "__main__":
    main()

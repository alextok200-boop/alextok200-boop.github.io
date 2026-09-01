/**
 * gen_rss.js —— 从 js/posts-data.js 生成 RSS 订阅源（中英两份）
 * 用法：node tools/gen_rss.js
 * 新增文章后重跑一次即可；文件名、日期、双语标题都从数据源读，不需要手改。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://alextok200-boop.github.io";

// posts-data.js 是 window.POSTS_DATA = [...]，这里造个 window 再 require
global.window = {};
require(path.join(ROOT, "js", "posts-data.js"));
const posts = (global.window.POSTS_DATA || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rfc822(d) {
  const dt = new Date(d + "T08:00:00+08:00");
  return isNaN(dt.getTime()) ? new Date().toUTCString() : dt.toUTCString();
}

function buildFeed(lang) {
  const isEn = lang === "en";
  const items = posts
    .map((p) => {
      const title = isEn && p.en && p.en.title ? p.en.title : p.title;
      const summary = isEn && p.en && p.en.summary ? p.en.summary : p.summary;
      const tag = isEn && p.en && p.en.tag ? p.en.tag : p.tag;
      const url = `${SITE}/posts/${p.file}.html`;
      return [
        "    <item>",
        `      <title>${esc(title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(p.date)}</pubDate>`,
        `      <category>${esc(tag || "")}</category>`,
        `      <description>${esc(summary)}</description>`,
        "    </item>"
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${isEn ? "Dai Chengpeng · Blog" : "戴程鹏 · 博客"}</title>
    <link>${SITE}/blog.html</link>
    <description>${
      isEn
        ? "E-commerce operations, cross-border growth and AI skill packs — field notes from running a 49-store, 9-brand operation."
        : "电商操盘、跨境增长与 AI 技能包的实战笔记，来自一个 49 店铺、9 品牌的操盘现场。"
    }</description>
    <language>${isEn ? "en" : "zh-CN"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/rss${isEn ? "-en" : ""}.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

fs.writeFileSync(path.join(ROOT, "rss.xml"), buildFeed("zh"), "utf8");
fs.writeFileSync(path.join(ROOT, "rss-en.xml"), buildFeed("en"), "utf8");
console.log(`RSS 生成完成：${posts.length} 篇文章 → rss.xml / rss-en.xml`);

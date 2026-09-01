/**
 * ============================================================
 * dingtalk-form-relay.js —— 网站询盘 → 钉钉机器人转发器
 * 运行环境：Cloudflare Worker（免费额度 10 万请求/日，个人站绰绰有余）
 *
 * ---- 部署步骤（全程约 10 分钟，不需要写代码）----
 * 1. 打开 cloudflare.com 注册/登录 → 左侧「Workers 和 Pages」
 * 2. 「创建」→「创建 Worker」→ 名字随便起（如 inquiry-relay）→「部署」
 * 3. 点「编辑代码」，把本文件全部内容粘贴进去，覆盖原有内容 →「部署」
 * 4. 「设置」→「变量和机密」→ 添加两个环境变量（都选「加密」）：
 *      DINGTALK_WEBHOOK = 你的钉钉机器人 Webhook 地址
 *      DINGTALK_SECRET  = 机器人的加签密钥（以 SEC 开头；若机器人用的是
 *                         「自定义关键词」方式，这项留空即可）
 *      INQUIRY_TOKEN    = 自定义一串口令（可选，但强烈建议设，见下）
 * 5. 复制页面上生成的 Worker 地址（如 https://inquiry-relal.xxx.workers.dev）
 * 6. 打开网站仓库 js/site-config.js，填两处：
 *      inquiry.webhook = "https://inquiry-relay.xxx.workers.dev"
 *      inquiry.token   = "第 4 步设的那串口令"
 *    提交推送即可生效。
 *
 * ---- 钉钉机器人怎么建 ----
 * 钉钉群 → 右上角「群设置」→「智能群助手」→「添加机器人」→「自定义」
 * 安全设置建议选「加签」，把密钥填到 DINGTALK_SECRET；
 * 若选「自定义关键词」，关键词填「询盘」，并把 DINGTALK_SECRET 留空。
 *
 * ---- 为什么要设 INQUIRY_TOKEN ----
 * Worker 地址会出现在前端 JS 里，等于公开。不设口令的话，任何人抓到地址
 * 就能往你的钉钉群灌垃圾消息。设了口令后，只有带正确口令的请求才被转发。
 * 不设也能跑，但建议设。
 * ============================================================
 */

export default {
  async fetch(request, env) {
    // 跨域预检：浏览器 POST JSON 前会先发 OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "POST only" }, 405);
    }

    // 口令校验（环境变量未设置则跳过）
    if (env.INQUIRY_TOKEN) {
      const got =
        request.headers.get("x-inquiry-token") ||
        (await safeJson(request).then((d) => (d && d.token) || "").catch(() => ""));
      if (got !== env.INQUIRY_TOKEN) {
        return json({ ok: false, error: "bad token" }, 401);
      }
    }

    let data;
    try {
      data = await request.clone().json();
    } catch (e) {
      try {
        data = await safeJson(request);
      } catch (e2) {
        return json({ ok: false, error: "invalid body" }, 400);
      }
    }

    // 基础校验：邮箱必须像邮箱，内容不能太短
    const email = String(data.email || "");
    const message = String(data.message || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return json({ ok: false, error: "bad email" }, 400);
    }
    if (message.trim().length < 5) {
      return json({ ok: false, error: "message too short" }, 400);
    }

    const text = buildMarkdown(data);

    // 支持多个机器人：Webhook 用英文逗号分隔即可
    const targets = String(env.DINGTALK_WEBHOOK || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!targets.length) {
      return json({ ok: false, error: "no webhook configured" }, 500);
    }

    const results = await Promise.allSettled(
      targets.map((base) => sendDingTalk(base, env.DINGTALK_SECRET || "", text))
    );
    const failed = results.filter((r) => r.status === "rejected" || (r.value && !r.value.ok));

    if (failed.length === targets.length) {
      return json({ ok: false, error: "dingtalk rejected" }, 502);
    }
    return json({ ok: true, sent: targets.length - failed.length }, 200);
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Inquiry-Token",
    "Access-Control-Max-Age": "86400",
  };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, corsHeaders()),
  });
}

async function safeJson(request) {
  return await request.json();
}

function esc(s) {
  return String(s || "-")
    .replace(/\|/g, "/")
    .replace(/\r?\n/g, " ")
    .slice(0, 500);
}

function buildMarkdown(d) {
  const when = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
  const intent = esc(d.intent) || "-";
  return [
    "### 网站新询盘",
    `- **称呼**：${esc(d.name)}`,
    `- **邮箱**：${esc(d.email)}`,
    `- **公司/渠道**：${esc(d.company)}`,
    `- **合作意向**：${intent}`,
    `- **内容**：${esc(d.message)}`,
    `- **来源**：${esc(d.page)} · 语言 ${esc(d.lang)} · ${when}`,
  ].join("\n");
}

async function sendDingTalk(base, secret, text) {
  let url = base;
  if (secret) {
    const ts = Date.now();
    const sign = await hmacSign(secret, ts);
    url += (base.includes("?") ? "&" : "?") +
      "timestamp=" + ts + "&sign=" + encodeURIComponent(sign);
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      msgtype: "markdown",
      markdown: { title: "网站新询盘", text: text },
    }),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

// 钉钉加签：HMAC-SHA256(secret, timestamp + "\n" + secret) → Base64
async function hmacSign(secret, timestamp) {
  const enc = new TextEncoder();
  const stringToSign = timestamp + "\n" + secret;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(stringToSign));
  const bytes = new Uint8Array(sig);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/* ============================================
   page-particles.js - 招聘页整页流星（v1.6.11 性能版）
   两段式视觉：
     ① 上 2/3：瀑布式坠落（顶部生成 → 垂直下落 → 渐变拖尾）
     ② 下 1/3：转向「由远及近」—— 自消失点向外呈放射状加速扩散，
        线宽 / 拖尾 / 亮度随 scale 同步放大，模拟流星迎面掠过
   铺满整页（fixed 全屏，z-index -1），非仅 hero 头部
   零依赖、respect prefers-reduced-motion、窄屏关闭

   v1.6.11 性能改造（根因：每帧 130×(createLinearGradient+shadowBlur+字符串) 造成
   主线程 GC 与光栅化压力，实测滚动 3s 主线程 179ms）：
     - 拖尾改为 hue 分档（每 10°）预渲染 sprite（含渐变+光晕，一次性成本）
     - 每帧仅 drawImage 复用 sprite：零对象分配、零 shadowBlur、零字符串拼接
     - 密度 130 → 90（滚动中再减半至 45，停止 400ms 后恢复）
     - DPR 上限 2 → 1.5（全屏清屏光栅面积 -44%）
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('pageParticles');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  // 可访问性 / 性能守门
  var mq = window.matchMedia;
  if (mq && mq('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }
  if (mq && mq('(max-width: 640px)').matches) {
    canvas.style.display = 'none';
    return;
  }

  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var w = 0, h = 0;
  var drops = [];
  var lastTs = 0;
  var rafId = 0;

  // —— 转向与透视参数 ——
  var TURN_RATIO = 2 / 3;   // 页面高度 2/3 处（下 1/3 起点）转向
  var VANISH_X = 0.5;       // 消失点：视口比例（流星由此向外扑面而来）
  var VANISH_Y = 0.44;
  var MIN_RADIUS = 30;      // 距消失点过近 → 视作已掠过身边，直接重生
  var W_POW = 1.3;          // 线宽放大指数：视觉放大快于位移放大，观感更"扑面"
  var LEN_POW = 1.12;       // 拖尾放大指数
  var MAX_WIDTH = 4.2;      // 线宽上限（sprite 基础宽 6px * vScale，取 min）
  var MAX_ALPHA = 0.9;

  // —— 密度（v1.6.11：130 → 90，滚动中减半）——
  var DENSITY_MAX = 90;
  var DENSITY_MIN = 50;
  var DENSITY_SCROLL_FACTOR = 0.5;
  var SCROLL_SETTLE_MS = 400;
  var scrolling = false;
  var scrollTimer = 0;

  // —— sprite 预渲染缓存（hue 每 10° 一档，9 档）——
  var SPRITE_W = 64;        // 含光晕的宽度
  var SPRITE_H = 512;       // 拖尾最大长度（覆盖放大后的 392px）
  var SPRITE_HUE_STEP = 10;
  var spriteCache = {};

  function getSprite(hue) {
    var key = Math.round(hue / SPRITE_HUE_STEP) * SPRITE_HUE_STEP;
    var s = spriteCache[key];
    if (s) return s;
    s = document.createElement('canvas');
    s.width = SPRITE_W;
    s.height = SPRITE_H;
    var c = s.getContext('2d');
    var cx = SPRITE_W / 2;
    // 尾部透明 → 头部亮（一次预渲染，含光晕，运行期零 shadowBlur）
    var g = c.createLinearGradient(0, SPRITE_H, 0, 0);
    g.addColorStop(0, 'hsla(' + key + ', 92%, 66%, 0)');
    g.addColorStop(0.55, 'hsla(' + key + ', 92%, 70%, 0.55)');
    g.addColorStop(1, 'hsla(' + key + ', 95%, 78%, 0.95)');
    c.lineCap = 'round';
    // 第一遍：细线 + 光晕（核心线）
    c.strokeStyle = g;
    c.lineWidth = 3;
    c.shadowBlur = 14;
    c.shadowColor = 'hsla(' + key + ', 95%, 68%, 0.85)';
    c.beginPath();
    c.moveTo(cx, SPRITE_H);
    c.lineTo(cx, 0);
    c.stroke();
    // 第二遍：宽线提亮（加大光晕范围，模拟近处过曝）
    c.strokeStyle = 'hsla(' + key + ', 95%, 80%, 0.55)';
    c.lineWidth = 7;
    c.shadowBlur = 26;
    c.beginPath();
    c.moveTo(cx, SPRITE_H);
    c.lineTo(cx, 6);
    c.stroke();
    spriteCache[key] = s;
    return s;
  }

  function reset(d, initial) {
    d.x = Math.random() * w;
    // 初始散布全屏；之后一律从顶部之上生成
    d.y = initial ? Math.random() * h : -30 - Math.random() * 220;
    d.speed = 2.2 + Math.random() * 7.5;          // 下落速度 px/帧
    d.len = 14 + Math.random() * 56;               // 拖尾长度
    d.drift = (Math.random() - 0.5) * 0.5;         // 轻微水平漂移
    d.hue = 268 + Math.random() * 82;              // 268 紫 → 350 品红
    d.alpha = 0.22 + Math.random() * 0.55;
    d.width = 0.6 + Math.random() * 1.5;
    // 阶段 0 = 瀑布坠落；1 = 由远及近
    d.phase = 0;
    return d;
  }

  // 进入「由远及近」阶段：位置与速度均连续，无跳变
  function enterApproach(d) {
    var vx = w * VANISH_X;
    var vy = h * VANISH_Y;
    var ox = d.x - vx;
    var oy = d.y - vy;
    var r0 = Math.sqrt(ox * ox + oy * oy);

    // 太贴近消失点：来不及展现透视，直接当它已掠过
    if (r0 < MIN_RADIUS) {
      reset(d, false);
      return;
    }

    d.vx = vx;
    d.vy = vy;
    d.dx = ox / r0;                              // 径向单位方向
    d.dy = oy / r0;
    d.r0 = r0;
    d.r = r0;                                    // scale = r / r0，起点为 1 → 连续
    d.rSpeed = d.speed;                          // 初速沿用坠落速度 → 连续
    d.accel = 1.02 + Math.random() * 0.014;      // 每帧加速系数（越近越快）
    d.maxScale = 2.8 + Math.random() * 1.8;      // 最大放大倍数（与屏幕可扩散空间匹配）
    d.phase = 1;
  }

  function targetDensity() {
    var base = Math.min(DENSITY_MAX, Math.max(DENSITY_MIN, Math.floor((w * h) / 16000)));
    return scrolling ? Math.max(24, Math.floor(base * DENSITY_SCROLL_FACTOR)) : base;
  }

  function applyDensity() {
    var target = targetDensity();
    while (drops.length < target) drops.push(reset({}, true));
    if (drops.length > target) drops.length = target;
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 视口变化会作废消失点快照 → 处于透视阶段的粒子重新散布
    for (var i = 0; i < drops.length; i++) {
      if (drops[i].phase === 1) reset(drops[i], true);
    }
    applyDensity();
  }

  function tick(ts) {
    // 约 60fps 节流
    if (lastTs && ts - lastTs < 13) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    lastTs = ts;

    // 全清：canvas 保持透明，不遮挡页面背景色
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    var turnY = h * TURN_RATIO;

    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      var scale = 1;
      var dirx, diry, len;

      if (d.phase === 0) {
        // —— ① 瀑布坠落 ——
        d.y += d.speed;
        d.x += d.drift;

        if (d.y - d.len > h) { reset(d, false); continue; }   // 保险：越底重生

        if (d.y >= turnY) {
          enterApproach(d);
          if (d.phase === 0) continue;                        // 被 enterApproach 重置
        }

        // 拖尾方向 = 运动反方向（drift 极小，接近竖直）
        var m = Math.sqrt(d.drift * d.drift + d.speed * d.speed) || 1;
        dirx = d.drift / m;
        diry = d.speed / m;
        len = d.len;

        // 水平越界 → 从另一侧绕回
        if (d.x < -40) d.x = w + 40;
        else if (d.x > w + 40) d.x = -40;

      } else {
        // —— ② 由远及近：自消失点向外加速扩散，同步放大 ——
        d.rSpeed *= d.accel;
        d.r += d.rSpeed;
        scale = d.r / d.r0;

        if (scale >= d.maxScale) { reset(d, false); continue; }

        d.x = d.vx + d.dx * d.r;
        d.y = d.vy + d.dy * d.r;

        if (d.x < -120 || d.x > w + 120 || d.y > h + 160 || d.y < -160) {
          reset(d, false);
          continue;
        }

        dirx = d.dx;
        diry = d.dy;
        len = d.len;
      }

      // —— 绘制：drawImage 复用预渲染 sprite（零对象分配 / 零 shadow / 零字符串）——
      var vScale = Math.pow(scale, W_POW);       // 视觉放大（瀑布阶段 scale=1 → 无变化）
      var lwd = Math.min(MAX_WIDTH, d.width) * vScale * 6;   // 6 = sprite 基础线宽
      var imgH = Math.min(SPRITE_H, len * Math.pow(scale, LEN_POW));
      var alp = Math.min(MAX_ALPHA, d.alpha * (0.82 + 0.22 * scale));

      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(Math.atan2(diry, dirx));        // x 轴对齐运动方向
      ctx.globalAlpha = alp;
      // sprite 头部映射到原点（粒子头部），拖尾沿 -x（运动反方向）延伸，宽度居中
      ctx.drawImage(getSprite(d.hue), 0, 0, SPRITE_W, SPRITE_H,
        -imgH, -lwd / 2, imgH, lwd);
      ctx.restore();
    }

    rafId = requestAnimationFrame(tick);
  }

  function onVisibility() {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function onScroll() {
    if (!scrolling) {
      scrolling = true;
      applyDensity();                             // 滚动中密度减半
    }
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      scrolling = false;
      applyDensity();                             // 停止 400ms 后恢复
    }, SCROLL_SETTLE_MS);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  requestAnimationFrame(function () {
    resize();
    rafId = requestAnimationFrame(tick);
  });
})();

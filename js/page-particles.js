/* ============================================
   page-particles.js - 招聘页整页流星（v1.6.6）
   两段式视觉：
     ① 上 2/3：瀑布式坠落（顶部生成 → 垂直下落 → 渐变拖尾）
     ② 下 1/3：转向「由远及近」—— 自消失点向外呈放射状加速扩散，
        线宽 / 拖尾 / 亮度随 scale 同步放大，模拟流星迎面掠过
   铺满整页（fixed 全屏，z-index -1），非仅 hero 头部
   零依赖、respect prefers-reduced-motion、窄屏关闭
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

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
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
  var MAX_WIDTH = 4.2;      // 线宽上限，防止近处过曝糊成一片
  var MAX_LEN = 200;        // 拖尾上限
  var MAX_ALPHA = 0.9;

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

    // 密度随视口面积自适应
    var target = Math.min(130, Math.max(65, Math.floor((w * h) / 14000)));
    while (drops.length < target) drops.push(reset({}, true));
    if (drops.length > target) drops.length = target;
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
    ctx.globalCompositeOperation = 'lighter';
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
        len = Math.min(MAX_LEN, d.len * Math.pow(scale, LEN_POW));
      }

      // 越近：越粗、越亮、拖尾越长、光晕越大
      var vScale = Math.pow(scale, W_POW);       // 视觉放大（瀑布阶段 scale=1 → 无变化）
      var lwd = Math.min(MAX_WIDTH, d.width * vScale);
      var alp = Math.min(MAX_ALPHA, d.alpha * (0.82 + 0.22 * scale));
      var blur = Math.min(38, 10 + 9 * (scale - 1));

      var tailX = d.x - dirx * len;
      var tailY = d.y - diry * len;

      // 渐变拖尾：尾部透明 → 头部亮
      var g = ctx.createLinearGradient(tailX, tailY, d.x, d.y);
      g.addColorStop(0, 'hsla(' + d.hue + ', 92%, 66%, 0)');
      g.addColorStop(0.55, 'hsla(' + d.hue + ', 92%, 70%, ' + (alp * 0.55).toFixed(3) + ')');
      g.addColorStop(1, 'hsla(' + d.hue + ', 95%, 78%, ' + alp.toFixed(3) + ')');

      ctx.strokeStyle = g;
      ctx.lineWidth = lwd;
      ctx.shadowBlur = blur;
      ctx.shadowColor = 'hsla(' + d.hue + ', 95%, 68%, ' + (alp * 0.8).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
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

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  requestAnimationFrame(function () {
    resize();
    rafId = requestAnimationFrame(tick);
  });
})();

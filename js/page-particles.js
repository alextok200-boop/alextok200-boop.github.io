/* ============================================
   page-particles.js - 招聘页整页瀑布粒子（v1.6.5）
   视觉：紫红系流星自顶部向下成瀑布式坠落，带渐变拖尾
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
    return d;
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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

    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      d.y += d.speed;
      d.x += d.drift;

      // 完全离开屏幕底部 → 回到顶部重生
      if (d.y - d.len > h) reset(d, false);

      // 水平越界 → 从另一侧绕回
      if (d.x < -40) d.x = w + 40;
      else if (d.x > w + 40) d.x = -40;

      var headY = d.y;
      var tailY = d.y - d.len;

      // 渐变拖尾：尾部透明 → 头部亮
      var g = ctx.createLinearGradient(d.x, tailY, d.x, headY);
      g.addColorStop(0, 'hsla(' + d.hue + ', 92%, 66%, 0)');
      g.addColorStop(0.55, 'hsla(' + d.hue + ', 92%, 70%, ' + (d.alpha * 0.55).toFixed(3) + ')');
      g.addColorStop(1, 'hsla(' + d.hue + ', 95%, 78%, ' + d.alpha.toFixed(3) + ')');

      ctx.strokeStyle = g;
      ctx.lineWidth = d.width;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'hsla(' + d.hue + ', 95%, 68%, ' + (d.alpha * 0.8).toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(d.x, tailY);
      ctx.lineTo(d.x, headY);
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

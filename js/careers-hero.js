/* ============================================
   careers-hero.js - 招聘页 hero 视觉（v1.6.4）
   Canvas 2D 粒子：从中心向四周发散的彩色光线（紫红系）
   零依赖、respect prefers-reduced-motion、移动端关闭
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('careersHeroCanvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  // 可访问性 / 性能守门
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isNarrow = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  if (reduce || isNarrow) {
    canvas.style.display = 'none';
    return;
  }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0;
  var particles = [];
  var lastTs = 0;
  var rafId = 0;

  function resize() {
    var parent = canvas.parentElement;
    if (!parent) return;
    w = parent.clientWidth;
    h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    particles = [];
    // 粒子密度与屏幕面积成正比，但有上下限
    var count = Math.min(180, Math.max(80, Math.floor((w * h) / 9000)));
    var cx = w / 2;
    var cy = h * 0.42; // 略偏上，对应标题区域
    for (var i = 0; i < count; i++) {
      // 颜色：紫色 (280) → 品红 (340)
      var hue = 270 + Math.random() * 80;
      var angle = Math.random() * Math.PI * 2;
      // 起点贴近中心（带小抖动）
      var r0 = Math.random() * Math.min(w, h) * 0.18;
      // 速度：径向向外 + 切向小幅扰动
      var speed = 0.35 + Math.random() * 1.4;
      var vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 0.15;
      var vy = Math.sin(angle) * speed + (Math.random() - 0.5) * 0.15;
      particles.push({
        x: cx + Math.cos(angle) * r0,
        y: cy + Math.sin(angle) * r0,
        vx: vx,
        vy: vy,
        hue: hue,
        life: Math.random() * 220,
        maxLife: 180 + Math.random() * 160,
        size: 0.6 + Math.random() * 1.4
      });
    }
  }

  function tick(ts) {
    // 60fps 节流：< 14ms 跳过帧
    if (lastTs && (ts - lastTs) < 12) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    lastTs = ts;

    // 拖尾：用半透明黑覆盖，而非完全清屏，保留光线感
    ctx.fillStyle = 'rgba(5, 2, 8, 0.18)';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      var t = p.life / p.maxLife;
      if (t >= 1 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
        // 重生：从中心再发散
        var ang = Math.random() * Math.PI * 2;
        var r0 = Math.random() * Math.min(w, h) * 0.12;
        p.x = w / 2 + Math.cos(ang) * r0;
        p.y = h * 0.42 + Math.sin(ang) * r0;
        p.life = 0;
        p.maxLife = 180 + Math.random() * 160;
        continue;
      }

      // 透明度：先渐显后渐隐（自然闪光）
      var alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      var sat = 85, lum = 60 + t * 15;
      var color = 'hsla(' + p.hue + ',' + sat + '%,' + lum + '%,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;

    rafId = requestAnimationFrame(tick);
  }

  // 不可见时停止动画（节能）
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

  // 等一帧让父容器 layout 完成
  requestAnimationFrame(function () {
    resize();
    rafId = requestAnimationFrame(tick);
  });
})();

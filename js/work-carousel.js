/* ============================================================
   work-carousel.js v1.0.0 —— 作品集三联轮播
   学习自动态 GIF（智能仪表盘三悬浮面板）的滑动交换构图：
   - 桌面 3 张/视图、≤1023px 2 张、≤767px 1 张
   - 无限循环：克隆一组补位，过渡结束无感回跳
   - 自动步进 3.81s（源 GIF 周期 5.44s 提速 30%）；hover/focus/隐藏页暂停；
     prefers-reduced-motion 不自动、不动画（瞬时跳转）
   - 无 JS 退化：卡片保留在原网格位置（本脚本未运行 = 原网格）
   依赖：js/i18n.js（window.i18n.apply 为按钮 aria-label 补翻译）
   ============================================================ */
(function () {
  var grid = document.querySelector(".card-grid.work-grid");
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".card.loop-card"));
  if (cards.length < 2) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var AUTO_MS = 3808; /* 源 GIF 周期 5440ms 提速 30% */

  /* 面板色（pc-a/pc-b/pc-c）与侧缘（side-r）类由 work.html 静态标记，
     克隆经 cloneNode 自动复制，视觉与原卡一致 */

  /* 结构：carousel > (viewport > track > cards+clones) + nav */
  var carousel = document.createElement("div");
  carousel.className = "carousel";
  carousel.setAttribute("aria-roledescription", "carousel");
  var viewport = document.createElement("div");
  viewport.className = "carousel-viewport";
  var track = document.createElement("div");
  track.className = "carousel-track";
  grid.parentNode.insertBefore(carousel, grid);
  viewport.appendChild(track);
  carousel.appendChild(viewport);
  cards.forEach(function (c) { track.appendChild(c); });
  grid.parentNode.removeChild(grid);
  cards.forEach(function (c) {
    var cl = c.cloneNode(true);
    cl.setAttribute("aria-hidden", "true");
    cl.classList.add("is-clone");
    track.appendChild(cl);
  });

  /* 控件：prev / dots / next */
  var nav = document.createElement("div");
  nav.className = "carousel-nav";
  function makeBtn(dir, labelKey, label, path) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "carousel-btn carousel-btn-" + dir;
    b.setAttribute("data-i18n-attr", "aria-label:" + labelKey);
    b.setAttribute("aria-label", label);
    b.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
      '<path d="' + path + '" fill="none" stroke="currentColor" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';
    nav.appendChild(b);
    return b;
  }
  var prevBtn = makeBtn("prev", "work.prev", "上一组", "M15 5l-7 7 7 7");
  var dotsBox = document.createElement("div");
  dotsBox.className = "carousel-dots";
  dotsBox.setAttribute("aria-hidden", "true");
  var dotEls = cards.map(function (_, i) {
    var d = document.createElement("button");
    d.type = "button";
    d.className = "carousel-dot";
    d.dataset.i = String(i);
    dotsBox.appendChild(d);
    return d;
  });
  var nextBtn = makeBtn("next", "work.next", "下一组", "M9 5l7 7-7 7");
  nav.insertBefore(dotsBox, nextBtn);
  carousel.appendChild(nav);
  if (window.i18n && typeof window.i18n.apply === "function") window.i18n.apply();

  /* 状态与运动 */
  var index = 0;
  var animating = false;
  function perView() {
    var w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 768) return 2;
    return 1;
  }
  function step() {
    var r = cards[0].getBoundingClientRect();
    var g = parseFloat(getComputedStyle(track).columnGap) || 0;
    return r.width + g;
  }
  function setX(animate) {
    track.style.transition = animate && !reduced
      ? "transform .6s cubic-bezier(.2,.7,.3,1)"
      : "none";
    track.style.transform = "translateX(" + (-index * step()) + "px)";
  }
  function paintDots() {
    var real = ((index % cards.length) + cards.length) % cards.length;
    dotEls.forEach(function (d, i) { d.classList.toggle("on", i === real); });
  }
  function normalize() {
    var moved = false;
    if (index >= cards.length) { index -= cards.length; moved = true; }
    if (index < 0) { index += cards.length; moved = true; }
    if (moved) setX(false);
    animating = false;
    paintDots();
  }
  function go(delta) {
    if (animating) return;
    if (delta < 0 && index === 0) {
      /* 无感跳到克隆区，再向后动画 */
      index = cards.length;
      setX(false);
      void track.offsetWidth;
    }
    index += delta;
    if (reduced) {
      normalize();
      return;
    }
    animating = true;
    setX(true);
    paintDots();
  }
  track.addEventListener("transitionend", function (e) {
    if (e.propertyName !== "transform") return;
    normalize();
  });

  prevBtn.addEventListener("click", function () { go(-1); restart(); });
  nextBtn.addEventListener("click", function () { go(1); restart(); });
  dotEls.forEach(function (d) {
    d.addEventListener("click", function () {
      var target = parseInt(d.dataset.i, 10);
      var cur = ((index % cards.length) + cards.length) % cards.length;
      if (target === cur) return;
      go(target - cur);
      restart();
    });
  });

  /* 自动步进（源 GIF 周期）；hover/focus/隐藏页暂停 */
  var timer = null;
  function start() {
    if (reduced || timer) return;
    timer = setInterval(function () { go(1); }, AUTO_MS);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function restart() { stop(); start(); }
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  /* 视口变化：重算每视图张数与步长 */
  var resizeT = null;
  var lastPV = perView();
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var pv = perView();
      if (pv !== lastPV) { lastPV = pv; normalize(); }
      else { setX(false); }
    }, 150);
  });

  normalize();
  start();
})();

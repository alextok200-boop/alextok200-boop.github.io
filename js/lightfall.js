/* Lightfall 流星背景：动态生成五角星 + 金币
   v1.6.11 性能改造（保留）：
   ① rotate/scale 从动画 keyframes 移出，放到 .lf-wrap 静态父层（合成器属性），
      .lf 动画只动 translateY/X + opacity —— 避免动画 transform 整体覆盖静态 transform
      （否则流星会丢失旋转/缩放），同时消除每帧样式重算（Style 29ms → ~2ms）。
   v1.6.14 视觉纠偏：
   ② 数量恢复原始设定 60 星 + 12 币（v1.6.11/12 为压内存曾砍至 22/4，导致星野密度
      降至 1/3、背景"像静止"）；锚点由 .lf-wrap 尺寸修复为星中心（见 style.css）。 */
(function () {
  var container = document.getElementById("lightfall");
  if (!container) {
    return;
  }

  var STAR_COUNT = 60;  // 五角星数量（v1.6.14：恢复原始设定 60）
  var COIN_COUNT = 12;  // 金币数量（v1.6.14：恢复原始设定 12）

  var FAST_STAR_LIMIT = 3;  // 快速下坠的星星最多 3 个
  var FAST_COIN_LIMIT = 1;  // 快速下坠的金币一批次只能 1 个

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  var frag = document.createDocumentFragment();
  var fastStars = 0;
  var fastCoins = 0;

  function makeWrap(isCoin) {
    var wrap = document.createElement("span");
    wrap.className = "lf-wrap" + (isCoin ? " lf-coin-wrap" : "");
    var inner = document.createElement("span");
    inner.className = "lf" + (isCoin ? " lf-coin" : "");
    wrap.appendChild(inner);
    return { wrap: wrap, inner: inner };
  }

  // 生成五角星流星
  for (var i = 0; i < STAR_COUNT; i++) {
    var pair = makeWrap(false);
    var left = rand(2, 98);
    var top = rand(2, 90);
    var scale = rand(0.6, 1.3);
    var angle = rand(-45, -25);

    // 蓄水池采样：剩余位置中挑 fast 剩余名额，保证快档数量精确
    var isFast = fastStars < FAST_STAR_LIMIT &&
      Math.random() < (FAST_STAR_LIMIT - fastStars) / (STAR_COUNT - i);
    if (isFast) fastStars++;

    var dur = isFast ? rand(7, 12) : rand(50, 80);      // 快档划过 / 雪花级慢速
    var delay = isFast ? rand(0, 5) : rand(0, 25);

    // 静态属性放 wrap（定位 + 旋转 + 缩放），动画只留在 inner
    pair.wrap.style.left = left + "%";
    pair.wrap.style.setProperty("--lf-top", top + "%");
    pair.wrap.style.transform = "rotate(" + angle + "deg) scale(" + scale.toFixed(2) + ")";
    pair.inner.style.animation = "lf-fall " + dur + "s linear " + delay + "s infinite";

    frag.appendChild(pair.wrap);
  }

  // 生成金币
  for (var j = 0; j < COIN_COUNT; j++) {
    var coinPair = makeWrap(true);
    var cleft = rand(5, 95);
    var ctop = rand(2, 90);
    var cscale = rand(0.6, 1.3);
    var cangle = rand(-45, -25);

    // 蓄水池采样：一批次最多 1 个快金币
    var cIsFast = fastCoins < FAST_COIN_LIMIT &&
      Math.random() < (FAST_COIN_LIMIT - fastCoins) / (COIN_COUNT - j);
    if (cIsFast) fastCoins++;

    var cdur = cIsFast ? rand(7, 12) : rand(50, 80);
    var cdelay = cIsFast ? rand(0, 5) : rand(0, 25);

    coinPair.wrap.style.left = cleft + "%";
    coinPair.wrap.style.setProperty("--lf-top", ctop + "%");
    coinPair.wrap.style.transform = "rotate(" + cangle + "deg) scale(" + cscale.toFixed(2) + ")";
    coinPair.inner.style.animation = "lf-fall " + cdur + "s linear " + cdelay + "s infinite";

    frag.appendChild(coinPair.wrap);
  }

  container.appendChild(frag);
})();

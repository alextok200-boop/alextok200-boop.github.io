/* Lightfall 流星背景：动态生成五角星 + 金币 */
(function () {
  var container = document.getElementById("lightfall");
  if (!container) {
    return;
  }

  var STAR_COUNT = 30;  // 五角星数量
  var COIN_COUNT = 12;  // 金币数量（穿插在流星中）

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  var frag = document.createDocumentFragment();

  // 生成五角星流星
  for (var i = 0; i < STAR_COUNT; i++) {
    var span = document.createElement("span");
    span.className = "lf";

    var left = rand(2, 98);
    var top = rand(2, 90);
    // 快慢混合：55% 快档 7-14s，45% 慢档 28-45s
    var dur, delay;
    if (Math.random() < 0.55) {
      dur = rand(7, 14);
      delay = rand(0, 8);
    } else {
      dur = rand(28, 45);
      delay = rand(0, 20);
    }
    var scale = rand(0.6, 1.3);
    var angle = rand(-45, -25);

    span.style.left = left + "%";
    span.style.setProperty("--lf-top", top + "%");
    span.style.animation = "lf-fall " + dur + "s linear " + delay + "s infinite";
    span.style.setProperty("--lf-angle", angle + "deg");
    span.style.setProperty("--lf-scale", scale.toFixed(2));

    frag.appendChild(span);
  }

  // 生成金币（与星星同尺寸同随机范围，穿插分布）
  for (var j = 0; j < COIN_COUNT; j++) {
    var coin = document.createElement("span");
    coin.className = "lf lf-coin";

    var cleft = rand(5, 95);
    var ctop = rand(2, 90);
    // 快慢混合：与星星一致（55% 快 7-14s，45% 慢 28-45s）
    var cdur, cdelay;
    if (Math.random() < 0.55) {
      cdur = rand(7, 14);
      cdelay = rand(0, 8);
    } else {
      cdur = rand(28, 45);
      cdelay = rand(0, 20);
    }
    var cscale = rand(0.6, 1.3); // 与星星一致
    var cangle = rand(-45, -25); // 与星星一致

    coin.style.left = cleft + "%";
    coin.style.setProperty("--lf-top", ctop + "%");
    coin.style.animation = "lf-fall " + cdur + "s linear " + cdelay + "s infinite";
    coin.style.setProperty("--lf-angle", cangle + "deg");
    coin.style.setProperty("--lf-scale", cscale.toFixed(2));

    frag.appendChild(coin);
  }

  container.appendChild(frag);
})();
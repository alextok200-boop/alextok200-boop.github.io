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
    var dur = rand(5, 10);
    var delay = rand(0, 10);
    var scale = rand(0.6, 1.3);
    var angle = rand(-45, -25);

    span.style.left = left + "%";
    span.style.setProperty("--lf-top", top + "%");
    span.style.animation = "lf-fall " + dur + "s linear " + delay + "s infinite";
    span.style.setProperty("--lf-angle", angle + "deg");
    span.style.setProperty("--lf-scale", scale.toFixed(2));

    frag.appendChild(span);
  }

  // 生成金币（穿插，比流星大、更慢、金色拖尾）
  for (var j = 0; j < COIN_COUNT; j++) {
    var coin = document.createElement("span");
    coin.className = "lf lf-coin";

    var cleft = rand(5, 95);
    var ctop = rand(2, 90);
    var cdur = rand(8, 14);   // 金币更慢（更"贵"感）
    var cdelay = rand(0, 14);
    var cscale = rand(0.8, 1.3);
    var cangle = rand(-40, -30);

    coin.style.left = cleft + "%";
    coin.style.setProperty("--lf-top", ctop + "%");
    coin.style.animation = "lf-fall " + cdur + "s linear " + cdelay + "s infinite";
    coin.style.setProperty("--lf-angle", cangle + "deg");
    coin.style.setProperty("--lf-scale", cscale.toFixed(2));

    frag.appendChild(coin);
  }

  container.appendChild(frag);
})();
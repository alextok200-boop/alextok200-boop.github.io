/* Lightfall 流星背景：动态生成五角星 + 金币 */
(function () {
  var container = document.getElementById("lightfall");
  if (!container) {
    return;
  }

  var STAR_COUNT = 60;  // 五角星数量（密度×2）
  var COIN_COUNT = 12;  // 金币数量

  var FAST_STAR_LIMIT = 3;  // 快速下坠的星星最多 3 个
  var FAST_COIN_LIMIT = 1;  // 快速下坠的金币一批次只能 1 个

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  var frag = document.createDocumentFragment();
  var fastStars = 0;
  var fastCoins = 0;

  // 生成五角星流星
  for (var i = 0; i < STAR_COUNT; i++) {
    var span = document.createElement("span");
    span.className = "lf";

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

    span.style.left = left + "%";
    span.style.setProperty("--lf-top", top + "%");
    span.style.animation = "lf-fall " + dur + "s linear " + delay + "s infinite";
    span.style.setProperty("--lf-angle", angle + "deg");
    span.style.setProperty("--lf-scale", scale.toFixed(2));

    frag.appendChild(span);
  }

  // 生成金币
  for (var j = 0; j < COIN_COUNT; j++) {
    var coin = document.createElement("span");
    coin.className = "lf lf-coin";

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

    coin.style.left = cleft + "%";
    coin.style.setProperty("--lf-top", ctop + "%");
    coin.style.animation = "lf-fall " + cdur + "s linear " + cdelay + "s infinite";
    coin.style.setProperty("--lf-angle", cangle + "deg");
    coin.style.setProperty("--lf-scale", cscale.toFixed(2));

    frag.appendChild(coin);
  }

  container.appendChild(frag);
})();
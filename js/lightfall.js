/* Lightfall 流星背景：动态生成 30 颗流星，随机参数 */
(function () {
  var container = document.getElementById("lightfall");
  if (!container) {
    return;
  }

  var COUNT = 30; // 数量

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  var frag = document.createDocumentFragment();
  for (var i = 0; i < COUNT; i++) {
    var span = document.createElement("span");
    span.className = "lf";

    // 随机位置：横向铺满 + 纵向散布（静态降级时分布全屏）
    var left = rand(2, 98);
    var top = rand(2, 90);

    // 随机速度：5~10 秒一次坠落
    var dur = rand(5, 10);

    // 随机延迟：错开出现
    var delay = rand(0, 10);

    // 随机大小：基础 16px 五角星，缩放 0.6-1.3（避免过大过密）
    var scale = rand(0.6, 1.3);

    // 随机角度：-45°~-25°，统一偏斜向（左下落），配合 translateX 120→-180 形成明显斜线
    var angle = rand(-45, -25);

    span.style.left = left + "%";
    span.style.setProperty("--lf-top", top + "%");
    span.style.animation = "lf-fall " + dur + "s linear " + delay + "s infinite";
    span.style.setProperty("--lf-angle", angle + "deg");
    span.style.setProperty("--lf-scale", scale.toFixed(2));

    frag.appendChild(span);
  }
  container.appendChild(frag);
})();

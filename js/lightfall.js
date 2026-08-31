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

    // 随机位置：横向铺满
    var left = rand(2, 98);

    // 随机速度：6~12 秒一次坠落（肉眼易捕捉）
    var dur = rand(6, 12);

    // 随机延迟：错开出现
    var delay = rand(0, 12);

    // 随机大小：近景大远景小
    var scale = rand(0.7, 1.6);

    // 随机角度
    var angle = rand(-35, -15);

    span.style.left = left + "%";
    span.style.animation = "lf-fall " + dur + "s linear " + delay + "s infinite";
    span.style.setProperty("--lf-angle", angle + "deg");
    span.style.setProperty("--lf-scale", scale.toFixed(2));

    frag.appendChild(span);
  }
  container.appendChild(frag);
})();

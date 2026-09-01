/* Konllen Personal Site - main.js v1.3.0 */

document.addEventListener("DOMContentLoaded", function () {
  // 当前年份自动更新
  var footer = document.querySelector(".site-footer p");
  if (footer) {
    var year = new Date().getFullYear();
    footer.innerHTML = footer.innerHTML.replace("2026", year);
  }

  // 微信二维码：在 site-config.js 填了路径才显示，未填保留占位
  var CFG = window.SITE_CONFIG || {};
  var qr = CFG.contact && CFG.contact.wechatQr;
  var frame = document.getElementById("wechatQrFrame");
  if (frame && qr) {
    frame.innerHTML = "";
    var img = document.createElement("img");
    img.src = qr;
    img.alt = "WeChat QR code";
    img.loading = "lazy";
    frame.appendChild(img);
  }

  // hero 背景视频降速：0.6x（官方展示站视频节奏偏快，慢一点更有氛围）
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    heroVideo.playbackRate = 0.6;
    heroVideo.addEventListener("ratechange", function () {
      // 防止某些浏览器重置播放速度
      if (heroVideo.playbackRate !== 0.6) heroVideo.playbackRate = 0.6;
    });
  }

  // 滚动入场动画：为 .card / .blog-item / .section-title 等加 reveal
  var targets = document.querySelectorAll(".card, .blog-item, .section-title, .hero-card");
  if (targets.length && "IntersectionObserver" in window) {
    targets.forEach(function (el) {
      // 首屏（hero 区域）内的元素不隐藏，避免初始闪烁
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add("visible");
      } else {
        el.classList.add("reveal");
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    targets.forEach(function (el) {
      if (el.classList.contains("reveal") && !el.classList.contains("visible")) {
        observer.observe(el);
      }
    });
  }
});

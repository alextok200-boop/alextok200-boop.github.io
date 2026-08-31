/* Konllen Personal Site - main.js v1.2.1 */

document.addEventListener("DOMContentLoaded", function () {
  // 联系表单：静态站无后端，点击后给出提示
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = document.getElementById("formNote");
      var name = document.getElementById("name").value || "朋友";
      if (note) {
        note.textContent = "谢谢 " + name + "！表单已提交（静态站演示），正式版请通过邮箱联系。";
      }
    });
  }

  // 当前年份自动更新
  var footer = document.querySelector(".site-footer p");
  if (footer) {
    var year = new Date().getFullYear();
    footer.innerHTML = footer.innerHTML.replace("2026", year);
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

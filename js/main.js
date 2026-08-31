/* Konllen Personal Site - main.js v1.0.0 */

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
});

/* home.js — الرئيسية: إحصائيات حقيقية من manifest + أحدث المقالات + التصنيفات */
(function () {
  "use strict";
  var AB = window.AB;
  var art = AB.art;
  var LANG = AB.LANG;
  function $(sel, root) { return (root || document).querySelector(sel); }

  /* الهياكل العظمية */
  var grid = $("#latestGrid");
  if (grid) grid.innerHTML = Array(6).fill('<div class="skel skel-card"></div>').join("");

  /* الإحصائيات — أرقام فعلية من الفهرس، لا أرقام مختلقة */
  var stats = $("#heroStats");
  if (stats) {
    var total = art.all(LANG).length;
    var cats = (window.BLOG_CONFIG.categories || []).length;
    var t = AB.T;
    stats.innerHTML =
      '<div class="stat"><b>' + total + "</b><span>" + (LANG === "ar" ? "مقالة منشورة" : "Published articles") + "</span></div>" +
      '<div class="stat"><b>' + cats + "</b><span>" + (LANG === "ar" ? "تصنيفات" : "Categories") + "</span></div>" +
      '<div class="stat"><b>2</b><span>' + (LANG === "ar" ? "عربي + English" : "Arabic + English") + "</span></div>";
  }

  /* أحدث المقالات */
  if (grid) {
    var latest = art.latest(LANG, 6);
    if (latest.length) {
      grid.innerHTML = latest.map(function (p) { return art.cardHTML(p); }).join("");
    } else {
      grid.innerHTML =
        '<div class="empty" style="grid-column:1/-1">' + AB.icon("doc") +
        "<b>" + (LANG === "ar" ? "لا مقالات منشورة بعد" : "No articles published yet") + "</b>" +
        "<p>" + (LANG === "ar" ? "المقالات تُنشر من فولدر content/ — أضف أول ملف .md وستظهر هنا تلقائيًا." : "Articles are published from the content/ folder — add the first .md file and it appears here automatically.") + "</p></div>";
    }
  }

  /* شبكة التصنيفات */
  var catGrid = $("#catGrid");
  if (catGrid) {
    var base = LANG === "en" ? "/en/" : "/";
    catGrid.innerHTML = (window.BLOG_CONFIG.categories || []).map(function (c) {
      var n = art.byCategory(c.id, LANG).length;
      return '<a class="cat-card" href="' + base + 'category.html?c=' + c.id + '">' +
        AB.icon(c.icon) + "<b>" + AB.esc(c[LANG]) + "</b>" +
        "<span>" + n + (LANG === "ar" ? (n === 1 ? " مقالة" : " مقالات") : (n === 1 ? " article" : " articles")) + " — " + AB.esc(c.desc[LANG]) + "</span></a>";
    }).join("");
  }
})();

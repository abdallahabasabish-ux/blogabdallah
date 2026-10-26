/* category-page.js — صفحة التصنيف: ?c=<id> */
(function () {
  "use strict";
  var AB = window.AB, art = AB.art, LANG = AB.LANG;
  function $(sel, root) { return (root || document).querySelector(sel); }
  var base = LANG === "en" ? "/en/" : "/";

  var catId = new URLSearchParams(location.search).get("c") || "";
  var cat = art.catInfo(catId);

  var headBox = $("#catHead"), grid = $("#catGrid"), desc = $("#catDesc");
  if (!cat) {
    headBox.innerHTML = '<h1>' + AB.T("errors.categoryMissing") + "</h1>";
    desc.textContent = "";
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1">' + AB.icon("folder") +
      '<b>' + AB.T("errors.categoryMissing") + "</b><p></p>" +
      '<a class="btn btn-ghost" href="' + base + 'archive.html">' + AB.T("misc.browseArchive") + "</a></div>";
    document.title = AB.T("errors.categoryMissing") + " — " + (LANG === "ar" ? "ABDALLAH ABAS" : "ABDALLAH ABAS");
    return;
  }

  var icon = cat.icon || "folder";
  headBox.innerHTML =
    '<div class="page-head-ic">' + AB.icon(icon) + "</div>" +
    "<h1>" + AB.esc(cat[LANG]) + "</h1>";
  desc.textContent = cat.desc ? cat.desc[LANG] : "";
  document.title = cat[LANG] + " — " + (LANG === "ar" ? "ABDALLAH ABAS" : "ABDALLAH ABAS");
  var crumbCur = $("#crumbCat");
  if (crumbCur) crumbCur.textContent = cat[LANG];

  var posts = art.byCategory(catId, LANG);
  var cnt = $("#catCount");
  if (cnt) cnt.textContent = String(posts.length);

  if (posts.length) {
    grid.innerHTML = posts.map(function (p) { return art.cardHTML(p); }).join("");
  } else {
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1">' + AB.icon(icon) +
      "<b>" + AB.T("errors.categoryEmpty") + "</b><p>" +
      (LANG === "ar" ? "التصنيف جاهز — أول مقال سيظهر هنا فور نشره." : "The category is ready — the first article will appear here once published.") + "</p>" +
      '<a class="btn btn-ghost" href="' + base + 'archive.html">' + AB.T("misc.browseArchive") + "</a></div>";
  }
})();

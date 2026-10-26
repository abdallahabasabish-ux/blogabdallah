/* archive-page.js — الأرشيف: كل المقالات مجمعة بالسنة + مرشح فوري */
(function () {
  "use strict";
  var AB = window.AB, art = AB.art, LANG = AB.LANG;
  function $(sel, root) { return (root || document).querySelector(sel); }
  var base = LANG === "en" ? "/en/" : "/";
  var box = $("#archiveList"), filter = $("#archiveFilter"), emptyBox = $("#archiveEmpty");

  function row(p) {
    var c = art.catInfo(p.category);
    return '<a class="archive-item" href="' + (p.lang === "en" ? "/en/posts/" : "/posts/") + encodeURIComponent(p.slug) + '.html">' +
      "<time datetime=\"" + p.date + '">' + art.fmtDate(p.date, LANG) + "</time>" +
      "<b>" + AB.esc(p.title) + "</b>" +
      '<span class="chip">' + AB.esc(c ? c[LANG] : p.category) + "</span></a>";
  }

  function render(list) {
    if (!list.length) {
      box.innerHTML = "";
      emptyBox.hidden = false;
      return;
    }
    emptyBox.hidden = true;
    var byYear = {};
    list.forEach(function (p) {
      var y = p.date.slice(0, 4);
      (byYear[y] = byYear[y] || []).push(p);
    });
    box.innerHTML = Object.keys(byYear).sort().reverse().map(function (y) {
      return '<section class="year-block"><h2>' + y + "</h2>" + byYear[y].map(row).join("") + "</section>";
    }).join("");
  }

  var posts = art.all(LANG);
  render(posts);

  var total = $("#archCount");
  if (total) total.textContent = String(posts.length);

  if (filter) {
    filter.addEventListener("input", function () {
      var q = filter.value.trim().toLowerCase();
      if (!q) { render(posts); return; }
      render(posts.filter(function (p) {
        return (p.title + " " + p.description + " " + (p.tags || []).join(" ")).toLowerCase().indexOf(q) >= 0;
      }));
    });
  }

  /* دعم ?q= — هدف SearchAction في Schema (بحث جوجل الموقع يفتح الأرشيف مفلترًا) */
  var q0 = "";
  try { q0 = new URLSearchParams(location.search).get("q") || ""; } catch (e) { q0 = ""; }
  if (q0 && filter) {
    filter.value = q0;
    filter.dispatchEvent(new Event("input"));
  }
})();

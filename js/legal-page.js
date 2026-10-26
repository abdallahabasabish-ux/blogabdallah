/* legal-page.js — يعرض أحد المستندات الأربعة من legal-data.js حسب data-doc على <body> */
(function () {
  "use strict";
  var AB = window.AB, LANG = AB.LANG;
  function $(sel, root) { return (root || document).querySelector(sel); }
  var doc = document.body.getAttribute("data-doc");
  var data = window.AA_LEGAL && AA_LEGAL[doc];

  var root = $("#legalRoot");
  if (!data || !root) return;

  var title = data.title[LANG];
  document.title = title + " — " + (LANG === "ar" ? "ABDALLAH ABAS" : "ABDALLAH ABAS");
  var h = $("#legalTitle");
  if (h) h.textContent = title;
  var crumb = $("#crumbDoc");
  if (crumb) crumb.textContent = title;

  var cfg = window.BLOG_CONFIG;
  var updated = cfg && cfg.version ? "" : "";
  var html = '<h2 id="intro">' + title + "</h2>";
  html += '<p class="legal-meta">' + (LANG === "ar"
    ? "آخر تحديث لهذه الصفحة: أكتوبر 2026 — مرافقة لإصدار المدونة v3."
    : "Last updated: October 2026 — accompanying blog version v3.") + "</p>";

  data.sections[LANG].forEach(function (sec, idx) {
    var id = "s" + idx;
    html += "<h3 id=\"" + id + "\">" + AB.esc(sec.h) + "</h3>";
    sec.body.forEach(function (par) { html += "<p>" + AB.esc(par) + "</p>"; });
  });

  /* توقيع التواصل — حقيقي من config */
  if (cfg && cfg.contact && cfg.contact.email) {
    html += "<hr><p>" + (LANG === "ar" ? "لأي سؤال حول هذه الصفحة: " : "For any question about this page: ")
      + '<a href="mailto:' + cfg.contact.email + '">' + cfg.contact.email + "</a></p>";
  }

  root.innerHTML = html;

  /* فهرس جانبي بسيط */
  var toc = $("#legalToc");
  if (toc) {
    toc.innerHTML = data.sections[LANG].map(function (sec, idx) {
      return '<a href="#s' + idx + '">' + AB.esc(sec.h) + "</a>";
    }).join("");
  }
})();

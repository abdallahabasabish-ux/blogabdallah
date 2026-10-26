/* article-page.js — موجّه فقط: صفحات المقالات صارت ثابتة في /posts/<slug>.html
   (HTML مولَّد مسبقًا بواسطة scripts/generate.mjs — أفضل للفهرسة والسرعة ومشاركة السوشيال).
   هذه الصفحة القديمة لم تعد تُعرض في نتائج البحث (noindex) — تنقل الزائر فورًا إلى
   الصفحة الثابتة، وإذا لم يوجد المقال ترجعه إلى الأرشيف. */
(function () {
  "use strict";
  var LANG = (window.AB && AB.LANG) || document.documentElement.lang || "ar";
  var base = LANG === "en" ? "/en/" : "/";
  var slug = "";
  try {
    slug = new URLSearchParams(location.search).get("u") || "";
  } catch (e) { slug = ""; }

  /* slug صالح شكليًا + موجود فعلًا في المانيفست → الصفحة الثابتة */
  var ok = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
  var found = false;
  if (ok && window.ARTICLES_MANIFEST && window.ARTICLES_MANIFEST.posts) {
    var posts = window.ARTICLES_MANIFEST.posts;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].slug === slug && posts[i].lang === LANG) { found = true; break; }
    }
  }
  location.replace(found ? base + "posts/" + encodeURIComponent(slug) + ".html" : base + "archive.html");
})();

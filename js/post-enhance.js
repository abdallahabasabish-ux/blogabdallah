/* post-enhance.js — تحسينات تفاعلية فوق صفحات المقالات الثابتة (posts/<slug>.html)
   المحتوى نفسه HTML مُولَّد مسبقًا في الملف (قابل للفهرسة دون JS) — هذا الملف يضيف فقط:
   فيديو click-to-load + تظليل TOC + نسخ الرابط + شريط تقدم القراءة + التعليقات */
(function () {
  "use strict";
  var AB = window.AB;
  var body = document.body;
  var LANG = body.getAttribute("data-lang") || document.documentElement.lang || "ar";
  var slug = body.getAttribute("data-post") || "";
  var post = (window.ARTICLES_MANIFEST && AB && AB.art)
    ? AB.art.bySlug(slug, LANG)
    : null;

  /* ---------- 1) الفيديو: لا شيء يُحمَّل من يوتيوب قبل النقرة ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".yt-btn") : null;
    if (!btn) return;
    var fig = btn.closest(".yt-facade");
    if (!fig || fig.classList.contains("playing")) return;
    var vid = fig.getAttribute("data-video") || "";
    if (!/^[A-Za-z0-9_-]{11}$/.test(vid)) return;
    var label = (fig.getAttribute("data-label") || "").replace(/"/g, "&quot;");
    btn.outerHTML =
      '<iframe class="yt-frame" src="https://www.youtube-nocookie.com/embed/' + vid +
      '?autoplay=1&rel=0" title="' + label +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    fig.classList.add("playing");
  });

  /* ---------- 2) تظليل بند TOC النشط أثناء التمرير ---------- */
  var tocNav = document.getElementById("tocNav");
  if (tocNav && "IntersectionObserver" in window) {
    var links = Array.prototype.slice.call(tocNav.querySelectorAll("a"));
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("toc-active"); });
          var a = map[en.target.id];
          if (a) a.classList.add("toc-active");
        }
      });
    }, { rootMargin: "-72px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---------- 3) نسخ الرابط (زر المشاركة الثابت) ---------- */
  var copyBtn = document.querySelector('[data-share="copy"]');
  if (copyBtn) {
    var canon = document.head.querySelector('link[rel="canonical"]');
    var artUrl = canon ? canon.href : location.href;
    copyBtn.addEventListener("click", function () { AB.copy(artUrl); });
  }

  /* ---------- 4) شريط تقدم القراءة ---------- */
  var bar = document.getElementById("readProgress");
  if (bar) {
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0) + ")";
    };
    document.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- 5) التعليقات (تعمل فقط بعد لصق مفاتيح Firebase — وإلا تظهر بصدق أنها معطلة) ---------- */
  if (post && window.AB.comments && typeof AB.comments.mount === "function") {
    AB.comments.mount(post);
  }
})();

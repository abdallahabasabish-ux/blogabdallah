/* articles.js — الطبقة فوق manifest.js (المولَّد من فولدر content/)
   المصدر الوحيد للمقالات: content/ar/*.md + content/en/*.md */
(function () {
  "use strict";
  var AB = window.AB = window.AB || {};
  var M = window.ARTICLES_MANIFEST || { generatedAt: null, posts: [] };

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function all(lang) {
    return M.posts.filter(function (p) { return !lang || p.lang === lang; });
  }
  function bySlug(slug, lang) {
    for (var i = 0; i < M.posts.length; i++) {
      var p = M.posts[i];
      if (p.slug === slug && (!lang || p.lang === lang)) return p;
    }
    return null;
  }
  function byCategory(cat, lang) {
    return M.posts.filter(function (p) { return p.category === cat && (!lang || p.lang === lang); });
  }
  function latest(lang, n, excludeSlug) {
    return all(lang).filter(function (p) { return p.slug !== excludeSlug; }).slice(0, n || 6);
  }
  function related(post, n) {
    var same = all(post.lang).filter(function (p) {
      return p.slug !== post.slug && p.category === post.category;
    });
    var rest = all(post.lang).filter(function (p) {
      return p.slug !== post.slug && p.category !== post.category;
    });
    return same.concat(rest).slice(0, n || 3);
  }
  function twin(post) {
    return bySlug(post.slug, post.lang === "ar" ? "en" : "ar");
  }
  function catInfo(id) {
    var cats = (window.BLOG_CONFIG && window.BLOG_CONFIG.categories) || [];
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i];
    return null;
  }
  function catName(post) {
    var c = catInfo(post.category);
    var lang = (window.AB && AB.LANG) || post.lang || "ar";
    return c ? c[lang] || c.ar : post.category;
  }
  function contentURL(p) {
    return "/content/" + p.lang + "/" + p.slug + ".md";
  }
  var cache = {};
  function fetchContent(p) {
    var key = p.lang + ":" + p.slug;
    if (!cache[key]) {
      cache[key] = fetch(contentURL(p)).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      });
    }
    return cache[key];
  }

  function fmtDate(iso, lang) {
    try {
      return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ar-EG", {
        day: "numeric", month: "long", year: "numeric"
      }).format(new Date(iso + "T12:00:00"));
    } catch (e) { return iso; }
  }
  function fmtYear(iso, lang) {
    try {
      return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ar-EG", { month: "short", day: "numeric" }).format(new Date(iso + "T12:00:00"));
    } catch (e) { return iso; }
  }
  function readLabel(min, lang) {
    var t = (window.UI_STR && window.UI_STR[lang || AB.LANG]) || null;
    if (lang === "en" || (!t && AB.LANG === "en")) return min + " min read";
    if (min === 1) return t ? t.time.min1 : "دقيقة قراءة";
    if (min === 2) return t ? t.time.min2 : "دقيقتا قراءة";
    if (min <= 10) return min + " " + (t ? t.time.minFew : "دقائق قراءة");
    return min + " " + (t ? t.time.minMany : "دقيقة قراءة");
  }

  /* بطاقة مقال موحدة — تُستخدم في الرئيسية/التصنيف/الأرشيف/ذات الصلة.
     الروابط كلها إلى الصفحات الثابتة posts/<slug>.html (الأفضل للسيو والسرعة) */
  function cardHTML(p, opts) {
    opts = opts || {};
    var c = catInfo(p.category);
    var icon = c ? c.icon : "doc";
    var url = (p.lang === "en" ? "/en/posts/" : "/posts/") + encodeURIComponent(p.slug) + ".html";
    var cardCover = p.cover
      ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy" width="600" height="400">'
      : (AB.icon ? AB.icon(icon) : "");
    var h = '<article class="card">'
      + '<div class="card-cover">' + cardCover + "</div>"
      + '<div class="card-body">'
      + '<span class="chip chip-acc card-cat">' + esc(catName(p)) + "</span>"
      + '<h3><a class="card-link" href="' + url + '">' + esc(p.title) + "</a></h3>"
      + '<p>' + esc(p.description) + "</p>"
      + '<div class="card-meta">'
      + "<span>" + (AB.icon ? AB.icon("calendar") : "") + "<time datetime=\"" + p.date + '">' + fmtDate(p.date, p.lang) + "</time></span>"
      + "<span>" + (AB.icon ? AB.icon("clock") : "") + readLabel(p.readTime, p.lang) + "</span>"
      + "</div></div></article>";
    return h;
  }

  AB.art = {
    raw: M,
    generatedAt: M.generatedAt,
    all: all, bySlug: bySlug, byCategory: byCategory, latest: latest,
    related: related, twin: twin, catInfo: catInfo, catName: catName,
    contentURL: contentURL, fetchContent: fetchContent,
    fmtDate: fmtDate, fmtYear: fmtYear, readLabel: readLabel, cardHTML: cardHTML
  };
})();

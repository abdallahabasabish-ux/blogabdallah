/* main.js — سلوكيات الواجهة المشتركة لكل صفحات المدونة
   قاعدة: لا دالة تعتمد على this (تُفكّك بـ strict mode) — كلها تقرأ AB صراحةً */
(function () {
  "use strict";
  var AB = window.AB = window.AB || {};
  var CFG = window.BLOG_CONFIG || {};
  var LANG = document.documentElement.lang === "en" ? "en" : "ar";
  AB.LANG = LANG;
  var STR = (window.UI_STR && UI_STR[LANG]) || { search: {}, misc: {}, footer: {} };

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  AB.esc = esc;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function T(path) {
    var parts = String(path).split(".");
    var v = STR;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) break;
      v = v[parts[i]];
    }
    return typeof v === "string" ? v : path;
  }
  AB.T = T;

  /* ---------- Toast ---------- */
  var toastWrap = $("#toastWrap");
  AB.toast = function (msg, type, ms) {
    if (!toastWrap) return;
    var el = document.createElement("div");
    el.className = "toast " + (type === "err" ? "err" : "ok");
    el.innerHTML = AB.icon(type === "err" ? "warn" : "check") + "<span>" + esc(msg) + "</span>";
    toastWrap.appendChild(el);
    setTimeout(function () { el.classList.add("out"); }, ms || 2600);
    setTimeout(function () { el.remove(); }, (ms || 2600) + 350);
  };

  /* ---------- Dialog (تأكيد عام) ---------- */
  var dlg = $("#aaDlg"), dlgCard = $("#aaDlgCard");
  AB.confirm = function (opts) {
    return new Promise(function (resolve) {
      if (!dlg || !dlgCard) { resolve(window.confirm(opts.body || "")); return; }
      dlgCard.innerHTML =
        "<h3>" + esc(opts.title || "") + "</h3><p>" + esc(opts.body || "") + "</p>" +
        '<div class="dlg-acts">' +
        '<button class="btn btn-ghost btn-sm" data-act="no">' + esc(opts.cancel || (LANG === "ar" ? "إلغاء" : "Cancel")) + "</button>" +
        '<button class="btn ' + (opts.danger ? "btn-primary" : "btn-primary") + ' btn-sm" data-act="yes">' + esc(opts.ok || (LANG === "ar" ? "تأكيد" : "OK")) + "</button></div>";
      dlg.showModal();
      var done = function (v) { dlg.close(); resolve(v); };
      dlgCard.querySelector('[data-act="yes"]').onclick = function () { done(true); };
      dlgCard.querySelector('[data-act="no"]').onclick = function () { done(false); };
    });
  };

  /* ---------- نسخ للحافظة ---------- */
  AB.copy = function (text) {
    var done = function () { AB.toast(T("misc.copied"), "ok"); };
    var fail = function () { AB.toast(T("misc.copyFailed"), "err"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fail);
    } else {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy") ? done() : fail();
        ta.remove();
      } catch (e) { fail(); }
    }
  };

  /* ---------- الثيم ---------- */
  var themeBtn = $("#themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("aa_theme", next); } catch (e) {}
      themeBtn.setAttribute("aria-pressed", next === "light" ? "true" : "false");
    });
  }

  /* ---------- قائمة الجوال ---------- */
  var head = $(".site-head"), navBtn = $("#navBtn");
  if (head && navBtn) {
    navBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = head.classList.toggle("nav-open");
      navBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (head.classList.contains("nav-open") && !head.contains(e.target)) {
        head.classList.remove("nav-open");
        navBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- قائمة التصنيفات المنسدلة ---------- */
  var drop = $(".nav-drop"), catsBtn = $("#catsBtn");
  if (drop && catsBtn) {
    var closeTimer = null;
    var setOpen = function (v) {
      drop.classList.toggle("open", v);
      catsBtn.setAttribute("aria-expanded", v ? "true" : "false");
    };
    var hoverable = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    if (hoverable) {
      drop.addEventListener("mouseenter", function () { clearTimeout(closeTimer); setOpen(true); });
      drop.addEventListener("mouseleave", function () {
        closeTimer = setTimeout(function () { setOpen(false); }, 200);
      });
    }
    catsBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!drop.classList.contains("open"));
    });
    document.addEventListener("click", function (e) {
      if (!drop.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- البحث الفوري ---------- */
  var layer = $("#searchLayer"), input = $("#searchInput"),
      results = $("#searchResults"), searchBtn = $("#searchBtn"), searchClose = $("#searchClose");
  var hints = $$("#searchHints button");

  function openSearch() {
    if (!layer) return;
    layer.hidden = false;
    document.body.style.overflow = "hidden";
    renderResults(input ? input.value : "");
    if (input) { input.value = ""; input.focus(); renderResults(""); }
  }
  function closeSearch() {
    if (!layer) return;
    layer.hidden = true;
    document.body.style.overflow = "";
  }
  function markHit(text, q) {
    if (!q) return esc(text);
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }
  function renderResults(q) {
    if (!results) return;
    q = (q || "").trim();
    var art = AB.art;
    if (!art) return;
    var pool = art.all(LANG);
    var hits = [];
    if (q) {
      var ql = q.toLowerCase();
      pool.forEach(function (p) {
        var hay = (p.title + " " + p.description + " " + (p.tags || []).join(" ")).toLowerCase();
        var s = -1;
        if (p.title.toLowerCase().indexOf(ql) === 0) s = 0;
        else if (p.title.toLowerCase().indexOf(ql) >= 0) s = 1;
        else if (hay.indexOf(ql) >= 0) s = 2;
        if (s >= 0) hits.push({ p: p, s: s });
      });
      hits.sort(function (a, b) { return a.s - b.s || (b.p.date > a.p.date ? 1 : -1); });
      hits = hits.slice(0, 8).map(function (h) { return h.p; });
    }
    if (!q) {
      results.innerHTML = '<div class="s-empty">' + esc(LANG === "ar" ? "اكتب للبحث في " + pool.length + " مقالة" : "Type to search " + pool.length + " articles") + "</div>";
      return;
    }
    if (!hits.length) {
      results.innerHTML = '<div class="s-empty">' + esc(STR.search.empty || "…") + "</div>";
      return;
    }
    var base = LANG === "en" ? "/en/" : "/";
    results.innerHTML = hits.map(function (p) {
      return '<a class="s-item" role="option" href="' + (p.lang === "en" ? "/en/posts/" : "/posts/") + encodeURIComponent(p.slug) + '.html">' +
        "<b>" + markHit(p.title, q) + "</b>" +
        '<time datetime="' + p.date + '">' + esc(art.fmtYear(p.date, LANG)) + "</time></a>";
    }).join("");
    $$(".s-item", results).forEach(function (a) {
      a.addEventListener("click", closeSearch);
    });
  }
  if (searchBtn) searchBtn.addEventListener("click", openSearch);
  if (searchClose) searchClose.addEventListener("click", closeSearch);
  if (layer) layer.addEventListener("click", function (e) { if (e.target === layer) closeSearch(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && layer && !layer.hidden) closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); openSearch(); }
  });
  if (input) input.addEventListener("input", function () { renderResults(input.value); });
  if (input) input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var first = results && results.querySelector(".s-item");
      if (first) { closeSearch(); location.href = first.getAttribute("href"); }
    }
  });
  hints.forEach(function (b) {
    b.addEventListener("click", function () {
      if (input) { input.value = b.getAttribute("data-q") || ""; input.focus(); }
      renderResults(b.getAttribute("data-q") || "");
    });
  });

  /* ---------- الفوتر: سنة، سوشيال (المملوء فقط)، خدمات ---------- */
  var yr = $("#footYear");
  if (yr) yr.textContent = String(new Date().getFullYear());

  var soc = $("#footSocial");
  if (soc && CFG.social) {
    var map = { facebook: "facebook", linkedin: "linkedin", telegram: "telegram", github: "github" };
    var html = "";
    Object.keys(map).forEach(function (k) {
      var v = CFG.social[k];
      if (v) html += '<a href="' + esc(v) + '" target="_blank" rel="noopener noreferrer" aria-label="' + k + '">' + AB.icon(map[k]) + "</a>";
    });
    /* قنوات التواصل الحقيقية دائمًا */
    if (CFG.contact) {
      if (CFG.contact.email) html += '<a href="mailto:' + esc(CFG.contact.email) + '" aria-label="Email">' + AB.icon("mail") + "</a>";
      if (CFG.contact.whatsapp) html += '<a href="https://wa.me/' + esc(CFG.contact.whatsapp) + '" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">' + AB.icon("whatsapp") + "</a>";
    }
    soc.innerHTML = html;
  }

  var footServices = $("#footServices");
  if (footServices && CFG.services) {
    var basePage = LANG === "en" ? "/en/" : "/";
    footServices.innerHTML = CFG.services.map(function (s) {
      return '<a href="' + basePage + 'contact.html?service=' + esc(s.id) + '">' + esc(s[LANG] || s.ar) + "</a>";
    }).join("");
  }

  /* ---------- عدّادات التصنيفات في الهيدر ---------- */
  $$(".cnt[data-cat]").forEach(function (el) {
    var cat = el.getAttribute("data-cat");
    var n = AB.art ? AB.art.byCategory(cat, LANG).length : 0;
    el.textContent = n ? String(n) : "";
  });

  /* ---------- تنقل نشط ---------- */
  var page = document.body.getAttribute("data-page");
  $$(".nav > a[data-nav]").forEach(function (a) {
    if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page");
  });

  /* ---------- روابط WhatsApp محدثة من config ---------- */
  $$(".wa-link").forEach(function (a) {
    if (CFG.contact && CFG.contact.whatsapp) {
      var pre = a.getAttribute("data-prefill") || "";
      a.href = "https://wa.me/" + CFG.contact.whatsapp + (pre ? "?text=" + encodeURIComponent(pre) : "");
      a.target = "_blank"; a.rel = "noopener noreferrer";
    }
  });
})();

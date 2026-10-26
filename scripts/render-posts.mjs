#!/usr/bin/env node
/* render-posts.mjs — وحدة تصيير صفحات المقالات الثابتة (posts/<slug>.html)
   الفلسفة: لا يوجد سطر HTML للمقال مكتوب هنا يدويًا بقدر الإمكان — نُحمّل وحدات
   المتصفح نفسها (config/i18n/icons/markdown/articles) داخل بيئة Node وهمية ونستدعي
   نفس الدوال التي تبني واجهة المقال في المتصفح — مصدر واحد للحقيقة بلا تكرار كود.
   المستدعى: scripts/generate.mjs */

import { readFileSync } from "node:fs";
import { join } from "node:path";

/* تهريب HTML مطابق لكل دوال التهريب في المدونة */
export const HESC = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const postURL = p => (p.lang === "en" ? "/en/posts/" : "/posts/") + p.slug + ".html";

/* تحميل وحدات المتصفح داخل window وهمي — document.body = null يعطّل حقن السبرايت */
export function initRenderer(ROOT, manifestObj) {
  const W = {};
  const docStub = { body: null, head: null, documentElement: { lang: "ar" } };
  const run = rel => {
    const src = readFileSync(join(ROOT, rel), "utf8");
    new Function("window", "document", src)(W, docStub);
  };
  run("js/config.js");
  run("js/i18n.js");
  run("js/icons.js");
  run("js/markdown.js");
  W.ARTICLES_MANIFEST = manifestObj;
  run("js/articles.js");
  return {
    W,
    md: W.AB.md,
    art: W.AB.art,
    icon: W.AB.icon,
    CFG: W.BLOG_CONFIG,
    UI: W.UI_STR
  };
}

/* استبدال صارم: يجب أن يجد الهدف مرة واحدة بالضبط — أي انحراف في القالب = فشل بناء */
function swapOnce(html, find, replaceWith, label, errors) {
  const parts = html.split(find);
  if (parts.length !== 2) {
    errors.push(`قالب المقال: مرساة «${label}» وجدت ${parts.length - 1} مرة (المطلوب 1) — القالب تغيّر؟ حدّث render-posts.mjs`);
    return html;
  }
  return parts[0] + replaceWith + parts[1];
}

/* تصيير صفحة مقال ثابتة كاملة من قالب article.html / en/article.html */
export function renderPostPage(ctx) {
  const { shell, lang, post, twinSlug, BLOG_URL, planSeries, R, bodyRaw, errors } = ctx;
  const { md, art, icon, CFG, UI } = R;
  const base = lang === "en" ? "/en/" : "/";
  const relUrl = postURL(post);
  const absUrl = BLOG_URL + relUrl;
  const cat = art.catInfo(post.category);
  const catTxt = art.catName(post);
  const tags = post.tags || [];
  const L = UI[lang] || UI.ar;

  /* المحتوى: نفس محرك المتصفح حرفيًا */
  const parsed = md.parse(md.stripFront(bodyRaw));

  /* ---------- الرأس ---------- */
  const T = HESC(post.title);
  const D = HESC(post.description);
  const imgPath = post.cover || CFG.assets.ogImage;
  const imgAbs = BLOG_URL + imgPath;
  const imgDim = post.cover ? [1200, 675] : [1200, 630];
  const ogLocale = lang === "ar" ? "ar_EG" : "en_US";
  const altLocale = lang === "ar" ? "en_US" : "ar_EG";

  /* hreflang — نذكر فقط لغات موجودة فعلًا لنفس الـ slug */
  const arExists = lang === "ar" || !!twinSlug; /* القرين بنفس slug مضمون الاقتران من التحقق */
  const arHref = BLOG_URL + (lang === "ar" ? relUrl : "/posts/" + post.slug + ".html");
  const enHref = BLOG_URL + (lang === "en" ? relUrl : "/en/posts/" + post.slug + ".html");
  let hreflang = `<link rel="alternate" hreflang="ar" href="${arHref}">\n<link rel="alternate" hreflang="en" href="${enHref}">\n<link rel="alternate" hreflang="x-default" href="${arHref}">`;
  if (lang === "en" && !twinSlug) hreflang = `<link rel="alternate" hreflang="en" href="${enHref}">`;

  /* ---------- JSON-LD: BlogPosting + BreadcrumbList ---------- */
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: lang,
    wordCount: post.words,
    keywords: tags.join(", "),
    articleSection: catTxt,
    author: { "@type": "Person", name: CFG.author.name[lang], url: CFG.author.siteUrl },
    publisher: {
      "@type": "Organization",
      name: "ABDALLAH ABAS",
      logo: { "@type": "ImageObject", url: "https://abdallahabas.com/assets/images/logo.svg" }
    },
    mainEntityOfPage: absUrl,
    url: absUrl,
    image: [imgAbs]
  };
  if (post.series) {
    const SN = CFG.series[post.series] || null;
    schema.isPartOf = {
      "@type": "CreativeWorkSeries",
      name: SN ? (SN[lang] || SN.ar) : post.series,
      position: post.seriesPart
    };
  }
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: L.misc.home, item: BLOG_URL + (lang === "en" ? "/en/" : "/") },
      { "@type": "ListItem", position: 2, name: catTxt, item: BLOG_URL + base + "category.html?c=" + encodeURIComponent(post.category) },
      { "@type": "ListItem", position: 3, name: post.title, item: absUrl }
    ]
  };
  const JSONLD = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;

  const headInsert =
    `<meta name="robots" content="index, follow">\n` +
    hreflang + "\n" +
    `<meta property="og:locale" content="${ogLocale}">\n` +
    `<meta property="og:locale:alternate" content="${altLocale}">\n` +
    `<meta property="og:image:width" content="${imgDim[0]}">\n` +
    `<meta property="og:image:height" content="${imgDim[1]}">\n` +
    `<meta property="article:published_time" content="${post.date}T12:00:00+02:00">\n` +
    `<meta property="article:modified_time" content="${(post.updated || post.date)}T12:00:00+02:00">\n` +
    `<meta property="article:author" content="${CFG.author.siteUrl}">\n` +
    `<meta property="article:section" content="${HESC(catTxt)}">\n` +
    tags.map(t => `<meta property="article:tag" content="${HESC(t)}">`).join("\n") + "\n" +
    JSONLD(schema) + "\n" + JSONLD(crumbs);

  /* ---------- رأس المقال المرئي ---------- */
  const crumbsLabel = lang === "ar" ? "مسار التنقل" : "Breadcrumb";
  const artMeta =
    `<div class="art-meta">` +
    `<span>${icon("calendar")}<time datetime="${post.date}">${art.fmtDate(post.date, lang)}</time></span>` +
    (post.updated && post.updated !== post.date
      ? `<span>${icon("zap")}${HESC(L.misc.updated)} <time datetime="${post.updated}">${art.fmtDate(post.updated, lang)}</time></span>`
      : "") +
    `<span>${icon("clock")}${art.readLabel(post.readTime, lang)}</span>` +
    `<span>${icon("doc")}${post.words} ${HESC(L.misc.words)}</span>` +
    `</div>`;
  const artHeadHTML =
    `<nav class="crumbs" aria-label="${crumbsLabel}"><a href="${base}">${HESC(L.misc.home)}</a>` +
    `<svg class="ic ic-flip" aria-hidden="true"><use href="#i-arrow"/></svg>` +
    `<a href="${base}category.html?c=${encodeURIComponent(post.category)}">${HESC(catTxt)}</a>` +
    `<svg class="ic ic-flip" aria-hidden="true"><use href="#i-arrow"/></svg>` +
    `<span aria-current="page">${T}</span></nav>` +
    `<h1 id="artTitle">${T}</h1>` + artMeta;

  /* ---------- الغلاف + الفيديو ---------- */
  let coverHTML = post.cover
    ? `<div class="art-cover cover-img-mode" id="artCover"><img class="art-cover-img" src="${HESC(post.cover)}" alt="${T}" width="1200" height="675" fetchpriority="high"></div>`
    : `<div class="art-cover" id="artCover">${icon(cat ? cat.icon : "doc")}</div>`;
  if (post.video) {
    const V = L.video;
    coverHTML +=
      `<figure class="yt-facade" data-video="${post.video}" data-label="${HESC(V.label)}">` +
      `<button type="button" class="yt-btn" aria-label="${HESC(V.watch)}">` +
      `<img src="https://i.ytimg.com/vi/${post.video}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">` +
      `<span class="yt-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></span>` +
      `</button>` +
      `<figcaption>${icon("doc")}${HESC(V.label)}<small>${HESC(V.privacy)}</small></figcaption>` +
      `</figure>`;
  }

  /* ---------- TOC ---------- */
  const tocHTML = parsed.toc.length >= 3
    ? parsed.toc.map(t => `<a href="#${t.id}" class="toc-l${t.level}">${HESC(t.text)}</a>`).join("")
    : null;

  /* ---------- الكتلة الإضافية: السلسلة + طلب الخدمة + العروض ---------- */
  const extrasParts = [];

  /* 1) السلسلة */
  if (post.series) {
    const S = L.series;
    const sib = art.all(lang)
      .filter(x => x.series === post.series)
      .sort((a, b) => (a.seriesPart || 0) - (b.seriesPart || 0));
    const SN = CFG.series[post.series] || null;
    const sName = SN ? (SN[lang] || SN.ar) : post.series;
    const planned = (planSeries && planSeries[post.series]) || sib.length;
    let sHtml =
      `<section class="series-box" aria-label="${HESC(S.label)}">` +
      `<header class="series-head">` +
      `<span class="series-chip">${icon("doc")}${HESC(S.label)}</span>` +
      `<b>${HESC(sName)}</b>` +
      `<span class="series-pos">${HESC(S.part)} ${post.seriesPart} ${HESC(S.of)} ${Math.max(planned, sib.length)}</span></header>` +
      `<ol class="series-parts">`;
    sib.forEach(x => {
      sHtml += x.slug === post.slug
        ? `<li class="here" aria-current="step"><span>${HESC(S.part)} ${x.seriesPart} — ${HESC(x.title)}<em class="here-tag">${HESC(S.current)}</em></span></li>`
        : `<li><a href="${postURL(x)}">${HESC(S.part)} ${x.seriesPart} — ${HESC(x.title)}</a></li>`;
    });
    sHtml += `</ol>`;
    if (planned > sib.length) sHtml += `<p class="series-soon">${icon("info")}${HESC(S.comingSoon)}</p>`;
    let prev = null, next = null;
    sib.forEach(x => {
      if (x.seriesPart < post.seriesPart) prev = (!prev || x.seriesPart > prev.seriesPart) ? x : prev;
      if (x.seriesPart > post.seriesPart) next = (!next || x.seriesPart < next.seriesPart) ? x : next;
    });
    sHtml += `<div class="series-nav">`;
    sHtml += prev
      ? `<a class="btn btn-ghost btn-sm" href="${postURL(prev)}"><svg class="ic" aria-hidden="true"><use href="#i-chev"/></svg>${HESC(S.prev)}</a>`
      : `<span></span>`;
    sHtml += next
      ? `<a class="btn btn-primary btn-sm" href="${postURL(next)}">${HESC(S.next)}<svg class="ic ic-flip" aria-hidden="true"><use href="#i-arrow"/></svg></a>`
      : `<span></span>`;
    sHtml += `</div></section>`;
    extrasParts.push(sHtml);
  }

  /* 2) شريط طلب الخدمة — في كل مقال */
  const CAT2SVC = { adsense: "adsense-prep", seo: "seo", "web-dev": "web-dev", marketing: "consulting", tools: "consulting" };
  const C = L.cta;
  const svc = CAT2SVC[post.category] || "consulting";
  extrasParts.push(
    `<section class="cta-strip" aria-label="${HESC(C.title)}">` +
    `<div class="cta-strip-in">` +
    `<div class="cta-strip-txt"><b>${HESC(C.title)}</b><p>${HESC(C.body)}</p>` +
    `<small>${HESC(C.note)}</small></div>` +
    `<a class="btn btn-primary" href="${base}contact.html?service=${svc}">${HESC(C.btn)}` +
    `<svg class="ic ic-flip" aria-hidden="true"><use href="#i-arrow"/></svg></a>` +
    `</div></section>`
  );

  /* 3) العروض الخاصة (خدماتي أنا — ليست إعلانات جوجل) */
  const offers = CFG.offers || [];
  if (offers.length) {
    const O = L.offers;
    extrasParts.push(
      `<section class="offer-zone" aria-label="${HESC(O.title)}">` +
      `<h2 class="offer-title">${HESC(O.title)}</h2><div class="offer-cards">` +
      offers.map(o =>
        `<article class="offer-card">` +
        (o.badge ? `<span class="offer-badge">${HESC(o.badge[lang] || o.badge.ar || "")}</span>` : "") +
        `<b>${HESC(o.title[lang] || o.title.ar || "")}</b>` +
        `<p>${HESC(o.text[lang] || o.text.ar || "")}</p>` +
        `<a class="offer-link" href="${base}${HESC(o.path || "contact.html")}">${HESC(L.cta.btn)}` +
        `<svg class="ic ic-flip" aria-hidden="true"><use href="#i-arrow"/></svg></a>` +
        `</article>`
      ).join("") +
      `</div><p class="offer-note">${HESC(O.note)}</p></section>`
    );
  }

  /* ---------- الوسوم + المشاركة + ذات الصلة ---------- */
  const tagsHTML = tags.length
    ? `<div class="tag-row">${tags.map(t => `<span class="chip">${icon("tag")}${HESC(t)}</span>`).join("")}</div>`
    : "";

  const shareHTML =
    `<span class="lbl">${HESC(L.misc.share)}:</span>` +
    `<button class="btn btn-ghost btn-sm" data-share="copy">${icon("copy")}${HESC(L.misc.copyLink)}</button>` +
    `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=${encodeURIComponent(post.title + " — " + absUrl)}">${icon("whatsapp")}WhatsApp</a>` +
    `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer" href="https://t.me/share/url?url=${encodeURIComponent(absUrl)}&text=${encodeURIComponent(post.title)}">${icon("telegram")}Telegram</a>` +
    `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(absUrl)}">X</a>`;

  const related = art.related(post, 3);
  const relatedHTML = related.map(p => art.cardHTML(p)).join("");

  /* ---------- التركيب على القالب بمراسٍ صارمة ---------- */
  let h = shell;
  const A = (find, rep, label) => { h = swapOnce(h, find, rep, label, errors); };

  A(`<title>${lang === "ar" ? "المقال" : "Article"} — ABDALLAH ABAS</title>`,
    `<title>${T} — ABDALLAH ABAS</title>`, "title");

  /* إزالة موروثات صفحة الموجّه: noindex + meta refresh للنسخ بلا JS — الصفحة الثابتة مفهرسة بذاتها */
  A(`<meta name="robots" content="noindex, follow">\n`, "", "robots-remove");
  A(`<noscript><meta http-equiv="refresh" content="0; url=${lang === "en" ? "/en" : ""}/archive.html"></noscript>\n`, "", "noscript-remove");

  A(lang === "ar"
    ? `<meta name="description" content="مقال من ABDALLAH ABAS — محتوى عربي مختبر في الربح من الويب والسيو وبناء المواقع.">`
    : `<meta name="description" content="An article from ABDALLAH ABAS — tested content on online earning, SEO and web building.">`,
    `<meta name="description" content="${D}">`, "description");
  A(`<link rel="canonical" href="${BLOG_URL}${lang === "en" ? "/en" : ""}/article.html">`,
    `<link rel="canonical" href="${absUrl}">`, "canonical");
  A(`<meta property="og:image" content="${BLOG_URL}/assets/images/og-default.png">`,
    `<meta property="og:image" content="${imgAbs}">`, "og:image");
  A(`<meta property="og:image:alt" content="ABDALLAH ABAS — الربح من الإنترنت والسيو وبناء المواقع">`,
    `<meta property="og:image:alt" content="${T} — ABDALLAH ABAS">`, "og:image:alt");
  A(`<meta name="twitter:image" content="${BLOG_URL}/assets/images/og-default.png">`,
    `<meta name="twitter:image" content="${imgAbs}">`, "twitter:image");
  A(`<meta property="og:title" content="${lang === "ar" ? "المقال" : "Article"} — ABDALLAH ABAS">`,
    `<meta property="og:title" content="${T} — ABDALLAH ABAS">`, "og:title");
  A(`<meta property="og:description" content="${lang === "ar" ? "مقال من ABDALLAH ABAS." : "An article from ABDALLAH ABAS."}">`,
    `<meta property="og:description" content="${D}">`, "og:description");
  A(`<meta property="og:url" content="${BLOG_URL}${lang === "en" ? "/en" : ""}/article.html">`,
    `<meta property="og:url" content="${absUrl}">`, "og:url");

  /* إدراج وسوم الفهرسة + hreflang + article:* + JSON-LD قبل نهاية الرأس */
  A("</head>", headInsert + "\n</head>", "head-insert");

  /* الجسم: بيانات الصفحة للسكربت التفاعلي الخفيف */
  A(`<body data-page="article">`,
    `<body data-page="post" data-post="${post.slug}" data-lang="${lang}">`, "body-data");

  /* إزالة الهيكل المؤقت + تعبئة كل المراسي بالمحتوى الثابت */
  const SKEL =
    `    <div id="artSkel">\n` +
    `      <div class="skel skel-line" style="width:35%"></div>\n` +
    `      <div class="skel skel-line" style="width:80%;height:26px;margin-top:18px"></div>\n` +
    `      <div class="skel skel-line" style="width:60%"></div>\n` +
    `      <div class="skel" style="height:210px;margin-top:22px"></div>\n` +
    `      <div class="skel skel-line" style="width:100%"></div>\n` +
    `      <div class="skel skel-line" style="width:92%"></div>\n` +
    `      <div class="skel skel-line" style="width:96%"></div>\n` +
    `    </div>\n`;
  A(SKEL, "", "skeleton");
  A(`<header class="art-head" id="artHead" hidden></header>`,
    `<header class="art-head" id="artHead">${artHeadHTML}</header>`, "artHead");
  A(`<div class="art-cover" id="artCover" hidden></div>`, coverHTML, "artCover");
  A(`<div class="art-body prose" id="artContent"></div>`,
    `<div class="art-body prose" id="artContent">${parsed.html}</div>`, "artContent");

  if (tocHTML) {
    A(lang === "ar"
      ? `<aside class="art-toc" id="tocBox" hidden aria-label="فهرس المقال">\n        <h2>في هذا المقال</h2>\n        <nav id="tocNav"></nav>\n      </aside>`
      : `<aside class="art-toc" id="tocBox" hidden aria-label="Article TOC">\n        <h2>In this article</h2>\n        <nav id="tocNav"></nav>\n      </aside>`,
      (lang === "ar"
        ? `<aside class="art-toc" id="tocBox" aria-label="فهرس المقال">\n        <h2>في هذا المقال</h2>\n        <nav id="tocNav">${tocHTML}</nav>\n      </aside>`
        : `<aside class="art-toc" id="tocBox" aria-label="Article TOC">\n        <h2>In this article</h2>\n        <nav id="tocNav">${tocHTML}</nav>\n      </aside>`),
      "toc");
  }

  A(`<footer class="art-foot" id="artFoot" hidden>`, `<footer class="art-foot" id="artFoot">`, "artFoot");
  A(`<div class="art-extras" id="artExtras" hidden></div>`,
    `<div class="art-extras" id="artExtras">${extrasParts.join("\n")}</div>`, "artExtras");
  A(`<div id="artTags"></div>`, `<div id="artTags">${tagsHTML}</div>`, "artTags");
  A(`<div class="share-row" id="shareRow"></div>`, `<div class="share-row" id="shareRow">${shareHTML}</div>`, "shareRow");
  A(`<div class="cards" id="relatedBox"></div>`, `<div class="cards" id="relatedBox">${relatedHTML}</div>`, "relatedBox");

  /* استبدال سكربت العرض الديناميكي بالتحسين الخفيف */
  A(`<script src="/js/article-page.js"></script>`, `<script src="/js/post-enhance.js"></script>`, "script-swap");

  return h;
}

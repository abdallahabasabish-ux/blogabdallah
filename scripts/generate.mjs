#!/usr/bin/env node
/* generate.mjs — مولّد المدونة (يعمل بـ Node 18+ بدون أي اعتماديات)
   المصدر الوحيد للحقيقة: content/ar/*.md + content/en/*.md
   يولّد: js/manifest.js + صفحات مقالة ثابتة (posts/ + en/posts/) + sitemap.xml + feed.xml + feed-en.xml
   الصفحات الثابتة = سيو كامل: المحتوى والوسوم والSchema في HTML بلا حاجة لـ JS.
   يخرج برمز 1 عند أي خطأ — لا ينشر فهرسًا ناقصًا أبدًا. */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initRenderer, renderPostPage, postURL } from "./render-posts.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url)) + "/..";
const CONTENT = join(ROOT, "content");
const BLOG_URL = "https://blog.abdallahabas.com";

/* ⚠️ نفس فئات js/config.js — غيّر في المكانين معًا */
const CATEGORIES = ["adsense", "seo", "web-dev", "marketing", "tools"];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SERIES_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VIDEO_RE = /^[A-Za-z0-9_-]{11}$/;
const WORD_TARGET = 2500;
/* خطة المحتوى — إن وُجدت يطبع المولّد تقدمها (لا يفشل إن غابت) */
let planTarget = 0, planItems = [];
try {
  const plan = JSON.parse(readFileSync(join(ROOT, "content-plan.json"), "utf8"));
  planTarget = plan.target || 0;
  planItems = plan.series.flatMap(s => s.parts.map(p => ({ ...p, seriesId: s.id })));
} catch (e) { /* لا خطة — تُتجاهل */ }

const errors = [];
const warns = [];

function parseFrontMatter(src, file) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) { errors.push(`${file}: لا يوجد front matter (ابدأ الملف بـ ---)`); return null; }
  const meta = {};
  const lines = m[1].split(/\r?\n/);
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (/^\t| {2,}\S/.test(line) && cur) {
      meta[cur] = (meta[cur] || []).concat(line.trim().replace(/^-\s*/, ""));
      continue;
    }
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!kv) { errors.push(`${file}: سطر غير مفهوم في front matter → "${line}"`); return null; }
    cur = kv[1].toLowerCase();
    let val = kv[2].trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      meta[cur] = val.slice(1, -1).split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else if (val === "") {
      meta[cur] = [];
    } else {
      meta[cur] = val.replace(/^["']|["']$/g, "");
    }
  }
  return { meta, bodyLen: src.length - m[0].length };
}

function loadDir(lang) {
  const dir = join(CONTENT, lang);
  if (!existsSync(dir)) { errors.push(`فولدر content/${lang} غير موجود`); return []; }
  return readdirSync(dir).filter(f => f.endsWith(".md")).map(f => {
    const file = `content/${lang}/${f}`;
    const src = readFileSync(join(dir, f), "utf8");
    const parsed = parseFrontMatter(src, file);
    if (!parsed) return null;
    const { meta } = parsed;
    const slug = String(meta.slug || f.replace(/\.md$/, ""));

    if (!SLUG_RE.test(slug)) errors.push(`${file}: slug غير صالح "${slug}" — مسموح: أحرف لاتينية صغيرة وأرقام وشرطات (kebab-case)`);
    if (!meta.title || String(meta.title).length < 10) errors.push(`${file}: title مفقود أو أقصر من 10 أحرف`);
    if (!meta.description || String(meta.description).length < 50) errors.push(`${file}: description مفقود أو أقصر من 50 حرفًا (اكتب وصفًا كاملًا للسيو)`);
    if (!DATE_RE.test(String(meta.date || ""))) errors.push(`${file}: date يجب أن يكون بصيغة YYYY-MM-DD`);
    if (!CATEGORIES.includes(meta.category)) errors.push(`${file}: category "${meta.category}" غير معروفة — المسموح: ${CATEGORIES.join(" | ")}`);
    if (meta.language !== lang) errors.push(`${file}: language "${meta.language}" لا يطابق الفولدر (${lang})`);
    if (/DEMO|demo/i.test(String(meta.title))) warns.push(`${file}: العنوان يحتوي DEMO — احذف المقالات التجريبية قبل النشر الحقيقي`);

    /* حقول السلسلة والفيديو (اختيارية) */
    const series = String(meta.series || "").trim();
    const seriesPart = meta.seriespart ? parseInt(meta.seriespart, 10) : 0;
    const video = String(meta.video || "").trim();
    if (series) {
      if (!SERIES_RE.test(series)) errors.push(`${file}: series غير صالح "${series}" — kebab-case لاتيني مثل المقالات`);
      if (!seriesPart || seriesPart < 1) errors.push(`${file}: series مذكور بدون seriesPart رقمي صحيح`);
    }
    if (!series && seriesPart) errors.push(`${file}: seriesPart مذكور بدون series`);
    if (video && !VIDEO_RE.test(video)) errors.push(`${file}: video غير صالح "${video}" — المطلوب معرف يوتيوب من 11 حرفًا (مثل: RpTI97uteJs)`);

    /* صورة الغلاف — اختيارية لكنها مقيدة: مسار مجلد صور المقالات + يجب أن يكون الملف موجودًا فعليًا */
    const cover = String(meta.cover || "").trim();
    if (cover) {
      if (!/^\/assets\/images\/articles\/[a-z0-9-]+\/[a-z0-9._-]+\.(png|webp|jpe?g|svg)$/i.test(cover)) {
        errors.push(`${file}: cover غير صالح "${cover}" — الصيغة: /assets/images/articles/<slug>/<ملف>.png|webp|jpg|svg`);
      } else if (!existsSync(join(ROOT, cover.replace(/^\//, "")))) {
        errors.push(`${file}: cover مُعلن لكن الملف غير موجود فعليًا → ${cover}`);
      }
    }

    const words = (src.replace(/^---[\s\S]*?---/, "").trim().split(/\s+/).filter(Boolean)).length;
    if (words < WORD_TARGET) warns.push(`${file}: ${words} كلمة — دون هدف الجودة ${WORD_TARGET} كلمة (المطلوب للمقالات الجديدة)`);

    return {
      slug,
      lang,
      title: String(meta.title || ""),
      description: String(meta.description || ""),
      date: String(meta.date || ""),
      updated: meta.updated ? String(meta.updated) : "",
      category: String(meta.category || ""),
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      language: lang,
      words,
      readTime: Math.max(1, Math.round(words / 180)),
      file,
      ...(series ? { series, seriesPart } : {}),
      ...(video ? { video } : {}),
      ...(cover ? { cover } : {})
    };
  }).filter(Boolean);
}

const ar = loadDir("ar");
const en = loadDir("en");

/* اقتران النسختين: كل slug عربي يجب أن يكون له قرين إنجليزي بنفس الـ slug (تحذير لا خطأ) */
const arSlugs = new Set(ar.map(p => p.slug));
const enSlugs = new Set(en.map(p => p.slug));
for (const s of arSlugs) if (!enSlugs.has(s)) warns.push(`لا يوجد قرين إنجليزي للمقال "${s}" — نسخة /en/ ستُترك بلا مقال مطابق`);
for (const s of enSlugs) if (!arSlugs.has(s)) warns.push(`لا يوجد قرين عربي للمقال "${s}"`);

/* تكرار slug في نفس اللغة + تعارض مواضع السلسلة */
const seen = new Set();
for (const p of [...ar, ...en]) {
  const k = p.lang + ":" + p.slug;
  if (seen.has(k)) errors.push(`${p.file}: slug مكرر في نفس اللغة → "${p.slug}"`);
  seen.add(k);
  if (p.series) {
    const sk = p.lang + ":" + p.series + "#" + p.seriesPart;
    if (seen.has(sk)) errors.push(`${p.file}: موضع السلسلة مكرر → ${p.series}#${p.seriesPart} (${p.lang})`);
    seen.add(sk);
  }
}

/* فجوات تسلسل السلاسل: الجزء 3 منشور دون 2 → تحذير (القارئ لن يجد الوسيط) */
for (const lang of ["ar", "en"]) {
  const bySeries = {};
  for (const p of [...ar, ...en]) {
    if (p.lang !== lang || !p.series) continue;
    (bySeries[p.series] = bySeries[p.series] || []).push(p.seriesPart);
  }
  for (const [sid, parts] of Object.entries(bySeries)) {
    const set = new Set(parts);
    const max = Math.max(...set);
    for (let i = 1; i <= max; i++) if (!set.has(i)) warns.push(`سلسلة ${sid} (${lang}): الجزء ${i} غير منشور رغم وجود أجزاء أحدث — القارئ لن يجد الوسيط`);
  }
}


const posts = [...ar, ...en].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
const planSeriesMap = planItems.reduce((m, it) => { m[it.seriesId] = (m[it.seriesId] || 0) + 1; return m; }, {});
/* تقدم خطة الـ 200 */
if (planTarget > 0) {
  const publishedSlugs = new Set(posts.map(p => p.slug));
  const done = planItems.filter(it => publishedSlugs.has(it.slug)).length;
  const planned = planItems.filter(it => it.status === "published" && !publishedSlugs.has(it.slug)).length;
  console.log(`  📋 تقدم خطة المحتوى: ${done}/${planTarget} مقالًا منشورًا من الخطة${planned ? ` — ⚠ ${planned} عنصرًا موسومًا published دون ملف فعلي` : ""}`);
}


console.log("┌─────────────────────────────────────────────┐");
console.log("│  توليد فهرس ABDALLAH ABAS              │");
console.log("└─────────────────────────────────────────────┘");
for (const p of posts) {
  console.log(`  ${p.lang.toUpperCase()}  ${p.date}  [${p.category}]  ${p.slug}  (${p.words} كلمة، ${p.readTime} د)`);
}
console.log(`\nالمجموع: ${ar.length} عربي + ${en.length} إنجليزي = ${posts.length} مقال\n`);

for (const w of warns) console.warn("  ⚠ تحذير:", w);
if (errors.length) {
  for (const e of errors) console.error("  ✗ خطأ:", e);
  console.error(`\nفشل التوليد: ${errors.length} خطأ. لم يُكتب أي ملف.`);
  process.exit(1);
}

/* ---------- صفحات المقالات الثابتة (posts/<slug>.html + en/posts/<slug>.html) ----------
   تُصيَّر كلها في الذاكرة أولًا — أي خطأ قالب = لا يُكتب أي ملف (مبدأ: لا نصف منتج) */
const slugLangs = {};
for (const p of posts) (slugLangs[p.slug] = slugLangs[p.slug] || []).push(p.lang);
const R = initRenderer(ROOT, { generatedAt: new Date().toISOString(), posts, planSeries: planSeriesMap });
const shellAr = readFileSync(join(ROOT, "article.html"), "utf8");
const shellEn = readFileSync(join(ROOT, "en/article.html"), "utf8");
const rendered = [];
for (const p of posts) {
  const shell = p.lang === "en" ? shellEn : shellAr;
  rendered.push({
    p,
    html: renderPostPage({
      shell, lang: p.lang, post: p,
      twinSlug: (slugLangs[p.slug] || []).length > 1 ? p.slug : null,
      BLOG_URL, planSeries: planSeriesMap, R,
      bodyRaw: readFileSync(join(ROOT, p.file), "utf8"),
      errors
    })
  });
}
if (errors.length) {
  for (const e of errors) console.error("  ✗ خطأ قالب الصفحات الثابتة:", e);
  console.error(`\nفشل توليد الصفحات الثابتة: لن يُكتب أي ملف.`);
  process.exit(1);
}
mkdirSync(join(ROOT, "posts"), { recursive: true });
mkdirSync(join(ROOT, "en/posts"), { recursive: true });
for (const { p, html } of rendered) {
  writeFileSync(join(ROOT, p.lang === "en" ? "en/posts" : "posts", p.slug + ".html"), html);
}
console.log(`  ✓ ${rendered.length} صفحة مقالة ثابتة (posts/ + en/posts/) — محتوى كامل في HTML قابل للفهرسة`);

/* ---------- manifest.js ---------- */
const manifest = `/* manifest.js — مولَّد آليًا بواسطة scripts/generate.mjs من content/ — لا تعدله يدويًا
   آخر توليد: ${new Date().toISOString()} */
window.ARTICLES_MANIFEST = ${JSON.stringify({ generatedAt: new Date().toISOString(), posts, planSeries: planSeriesMap }, null, 1)};
`;
writeFileSync(join(ROOT, "js/manifest.js"), manifest);

/* ---------- sitemap.xml ---------- */
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function urlEntry(loc, lastmod, alts) {
  return `  <url>\n    <loc>${loc}</loc>\n` +
    (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "") +
    (alts || []).map(([l, href]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${href}"/>`).join("\n") +
    `  </url>\n`;
}
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
sm += urlEntry(`${BLOG_URL}/`, ar[0] ? ar[0].date : "", [["ar", `${BLOG_URL}/`], ["en", `${BLOG_URL}/en/`], ["x-default", `${BLOG_URL}/`]]);
sm += urlEntry(`${BLOG_URL}/archive.html`, "", [["ar", `${BLOG_URL}/archive.html`], ["en", `${BLOG_URL}/en/archive.html`], ["x-default", `${BLOG_URL}/archive.html`]]);
sm += urlEntry(`${BLOG_URL}/about.html`, "", [["ar", `${BLOG_URL}/about.html`], ["en", `${BLOG_URL}/en/about.html`], ["x-default", `${BLOG_URL}/about.html`]]);
sm += urlEntry(`${BLOG_URL}/contact.html`, "", [["ar", `${BLOG_URL}/contact.html`], ["en", `${BLOG_URL}/en/contact.html`], ["x-default", `${BLOG_URL}/contact.html`]]);
/* صفحات التصنيف (قوائم حقيقية تستحق الفهرسة) */
for (const c of CATEGORIES) {
  sm += urlEntry(`${BLOG_URL}/category.html?c=${c}`, "",
    [["ar", `${BLOG_URL}/category.html?c=${c}`],
     ["en", `${BLOG_URL}/en/category.html?c=${c}`],
     ["x-default", `${BLOG_URL}/category.html?c=${c}`]]);
}
/* المقالات — صفحات ثابتة روابط نهائية نظيفة */
for (const p of posts.filter(p => p.lang === "ar")) {
  const arU = `${BLOG_URL}/posts/${p.slug}.html`;
  const enU = `${BLOG_URL}/en/posts/${p.slug}.html`;
  sm += urlEntry(arU, p.updated || p.date,
    enSlugs.has(p.slug)
      ? [["ar", arU], ["en", enU], ["x-default", arU]]
      : [["ar", arU], ["x-default", arU]]);
}
sm += `</urlset>\n`;
writeFileSync(join(ROOT, "sitemap.xml"), sm);

/* ---------- feeds ---------- */
function feed(lang, fileName) {
  const items = posts.filter(p => p.lang === lang).map(p =>
    `    <item>\n      <title>${esc(p.title)}</title>\n      <link>${BLOG_URL}${postURL(p)}</link>\n      <guid isPermaLink="true">${BLOG_URL}${postURL(p)}</guid>\n      <pubDate>${new Date(p.date + "T12:00:00").toUTCString()}</pubDate>\n      <description>${esc(p.description)}</description>\n    </item>\n`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>${lang === "ar" ? "مدونة ABDALLAH ABAS" : "ABDALLAH ABAS Blog"}</title>\n    <link>${BLOG_URL}${lang === "en" ? "/en/" : "/"}</link>\n    <description>${lang === "ar" ? "مقالات عملية في الربح من الويب والسيو وبناء المواقع" : "Practical articles on online earning, SEO and web building"}</description>\n    <language>${lang === "ar" ? "ar" : "en"}</language>\n    <atom:link href="${BLOG_URL}/${fileName}" rel="self" type="application/rss+xml"/>\n${items}  </channel>\n</rss>\n`;
  writeFileSync(join(ROOT, fileName), xml);
}
feed("ar", "feed.xml");
feed("en", "feed-en.xml");

console.log("  ✓ js/manifest.js");
console.log("  ✓ sitemap.xml (صفحات ثابتة + تصنيفات)");
console.log("  ✓ feed.xml + feed-en.xml (روابط ثابتة)");
console.log("\nتم التوليد بنجاح — ارفع التغييرات وستُنشر تلقائيًا.");

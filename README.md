# ABDALLAH ABAS — v3

مدونة عربية/إنجليزية ثابتة (Static) بلا أي إطار عمل أو خطوة بناء، منشورة على **GitHub Pages** تحت النطاق `blog.abdallahabas.com`.

- **الهوية:** أسود `#0a0a0b` × برتقالي `#FF6600` — خطوط IBM Plex Sans Arabic / Space Grotesk / IBM Plex Mono
- **الوضع:** ليلي افتراضيًا + نهاري (يحفظ الاختيار في localStorage، ويحترم تفضيل النظام لمن بلا JS)
- **اللغات:** الجذر عربي (RTL) و `/en/` إنجليزي (LTR) مع hreflang كامل
- **الأمان:** صفر inline JS (جاهز لـ CSP)، وكل محتوى المقالات يُهرَّب قبل العرض — HTML خام لا يُنفَّذ أبدًا
- **الخصوصية:** لا تتبع مفعّل، والإعلانات معطّلة حتى تفعيلها يدويًا بقيم حقيقية

---

## هيكل المشروع

```
├── index.html / article.html / category.html / archive.html
├── about.html / contact.html / 404.html
├── privacy.html / terms.html / disclosure.html / disclaimer.html
├── en/                    ← نفس الـ 11 صفحة بالإنجليزية
├── content/
│   ├── ar/                ← 📝 مقالاتك العربية (ملفات .md)
│   └── en/                ← 📝 المقابل الإنجليزي (نفس اسم الملف)
├── css/  main.css + theme.css
├── js/   config, i18n, icons, markdown, manifest(مولَّد), articles,
│         main, home, article-page, category-page, archive-page,
│         about-page, contact-page, legal-page, legal-data,
│         comments, forms, theme
├── scripts/generate.mjs   ← يولّد manifest + sitemap + RSS من فولدر content/
├── .github/workflows/sync-content.yml
├── CNAME / robots.txt / sitemap.xml / feed.xml / feed-en.xml
```

---


## 🗺️ خطة الـ 200 مقالة (content-plan.json)

المدونة تُبنى على **خطة محتوى معلنة**: 10 سلاسل × 20 جزءًا = 200 مقالة، كل مقالة ≥ 2500 كلمة، بزوجين عربي/إنجليزي بنفس الـ slug.

- **الملف:** `content-plan.json` — مصدر حقيقة الخطة (العناوين، السلاسل، الحالة)
- **المولّد يطبع تقدم الخطة** في كل تشغيل: «تقدم خطة المحتوى: N/200»
- **قواعد الخطة (التزام بسياسات جوجل):** محتوى أصلي بلا تكرار بين المقالات · سلاسل مترابطة بروابط داخلية · رصيد إعلانات لا يطغى على المحتوى · لا إعلانات على صفحات 404 أو الشكر
- **إضافة مقال من الخطة:** انسخ عنوانه من `content-plan.json` → اكتب `content/ar/<slug>.md` وقرينه `content/en/<slug>.md` (مع `series` و`seriesPart`) → حدّث `"status": "published"` في الخطة → `node scripts/generate.mjs`

**السلاسل العشر:** الطريق إلى ادسنس · سياسات ادسنس بالتفصيل · أساسيات السيو · إتقان الفهرسة · الأداء وCore Web Vitals · ابنِ موقعك · مصنع المحتوى · مصادر الربح المتعددة · ورشة الأدوات · تجارب ودراسات حالة

---
## ✍️ طريقة نشر مقال جديد (هذا كل شيء)

1. أنشئ ملفًا داخل `content/ar/` باسم `my-new-post.md` (الاسم = الـ slug)
2. اكتب الترويسة التالية في أول الملف ثم محتوى Markdown عادي:

```md
---
slug: my-new-post
title: عنوان المقال الكامل هنا
description: وصف من 50 حرفًا فأكثر يظهر في نتائج البحث ويشرح المقال بصدق.
date: 2026-11-01
category: adsense
tags: [ادسنس, جوجل]
language: ar
---

محتوى المقال هنا بتنسيق Markdown: عناوين وقوائم وجداول واقتباسات وأكواد.
```

3. أنشئ القرين الإنجليزي `content/en/my-new-post.md` **بنفس الـ slug ونفس التاريخ** و`language: en`
4. ارفع الملفين إلى GitHub (Commit + Push)

سيشغّل GitHub Actions المولّد تلقائيًا، ويُولّد **صفحة مقال ثابتة** لكل مقال (`posts/my-new-post.html` وقرينها `en/posts/`) بكل المحتوى والوسوم في HTML، ويُحدّث `manifest.js` و`sitemap.xml` وملفات RSS، ثم يُنشر كل شيء خلال دقيقة.

> **روابط المقالات هي صفحات ثابتة** (`/posts/<slug>.html`) — لا تعتمد على JavaScript في عرض المحتوى، وهذا أفضل ما يمكن لجوجل وسكريبرات السوشيال. الرابط القديم `article.html?u=slug` يعمل كموجّه فقط.

### قواعد الترويسة (يرفضها المولّد بصوت عالٍ إن خالفت)

| الحقل | القاعدة |
|---|---|
| `slug` | أحرف لاتينية صغيرة وأرقام وشرطات فقط (`kebab-case`) |
| `title` | 10 أحرف فأكثر |
| `description` | 50 حرفًا فأكثر (تُستخدم في السيو والبطاقات) |
| `date` | بصيغة `YYYY-MM-DD` (و`updated` اختياري بنفس الصيغة) |
| `category` | واحدة من: `adsense` `seo` `web-dev` `marketing` `tools` |
| `tags` | مصفوفة سطرية: `[كلمة1, كلمة2]` |
| `language` | `ar` في فولدر ar و `en` في فولدر en |

> **قاعدة الاقتران:** كل مقال عربي يجب أن يكون له قرين إنجليزي بنفس الـ slug. غياب القرين = تحذير لا رفض، لكن التناسق ثنائي اللغة جزء من هوية المدونة.

> **قاعدة التصنيفات:** أي تعديل على الفئات يجب أن يحدث في **مكانين معًا**: `js/config.js` و `scripts/generate.mjs` (متغير CATEGORIES).

Markdown المدعوم: عناوين h2-h4، قوائم (بمستويين)، جداول، اقتباسات، كود فقري وسطري، روابط (https فقط)، صور (https فقط)، فاصل أفقي، **عريض**، *مائل*، ~~مشطوب~~. أي HTML خام داخل الملف يُعرض كنص ولا يُنفَّذ — قرار أمني مقصود.

---

## 👀 معاينة محلية على جهازك

المسارات في الكود مطلقة (`/js/...`) لذا شغّل خادمًا ساكنًا من جذر فولدر المدونة:

```bash
cd blog
python3 -m http.server 8080
# ثم افتح http://localhost:8080
```

أو تولّد الفهرس أولًا إن عدّلت مقالات: `node scripts/generate.mjs`

---

## 🔥 تفعيل التعليقات (Firebase)

1. افتح `js/config.js` واستبدل قيم `firebase` بمفاتيح مشروعك (نفس مشروع `abdallahsst` للموقع الرئيسي):
   - Firebase Console → Project settings → Your apps → Web app
2. في Firebase Console فعّل: **Authentication → Sign-in method → Email/Password**
3. أضف نطاق `blog.abdallahabas.com` إلى **Authentication → Settings → Authorized domains**
4. انشر قواعد Firestore (نفس قواعد الموقع الرئيسي — تشمل مسار `blog_comments` ومجموعة `service_requests`)

حتى تُلصق المفاتيح يظهر قسم التعليقات معطّلًا برسالة صادقة — لا محاكاة ولا تعليقات وهمية.

## 📨 نموذج طلب الخدمة — مساران صادقان

**المسار الافتراضي (يعمل الآن بلا أي إعداد):** عند إرسال النموذج يُفتح واتساب برسالة الطلب مكتوبة وجاهزة إلى الرقم في `config.js` — الزائر يضغط «إرسال» داخله فيصلك الطلب فعليًا. وإن منع المتصفح النافذة المنبثقة ظهرت أزرار (واتساب / بريد / نسخ الملخص). زر الإرسال يصرّح مسبقًا بـ«إرسال عبر واتساب» — ولا نجاح زائف أبدًا.

**المسار المتقدم (بعد لصق مفاتيح Firebase):** يتحوّل النموذج تلقائيًا إلى الكتابة المباشرة في مجموعة `service_requests` بنفس مشروع Firestore، مع `sourcePage: "blog:..."` — ولا يظهر «تم الإرسال» إلا بعد استجابة 2xx فعلية.
**قاعدة حاكمة:** أي خدمة جديدة في `config.js` (services) = إضافة معرّفها إلى enum الخدمات في `firestore.rules` **بنفس الـ commit**.

## 💰 الإعلانات (معطّلة الآن — بنية جاهزة)

المدونة مبنية ببنية AdSense كاملة لكن **معطّلة بالكامل**: لا سكربت خارجي، لا فراغ محجوز، لا طلب لأي نطاق إعلاني — حتى تضع قيمًا حقيقية.

**البنية الجاهزة:**
- `js/ads.js` — محمّل صادق: يفحص الإعدادات ولا يفعل أي شيء قبل اكتمالها
- موضعان في صفحة المقال: `inArticle` (بعد متن المقال مباشرة) و`belowPost` (بعد الوسوم والمشاركة قبل التعليقات)
- `ads.txt` في الجذر — فارغ بتعليقات إرشادية (بلا سجلات وهمية)

**خطوات التفعيل بعد قبول الموقع في AdSense:**

1. في `js/config.js`: `client: "ca-pub-XXXXXXXXXXXXXXXX"` (معرّف الناشر)
2. أنشئ وحدتي **"إعلان داخل المقال"** في لوحة AdSense وضع معرّفيهما الرقميين في `slots: { inArticle: "...", belowPost: "..." }`
3. `enabled: true`
4. حدّث ملف `ads.txt` في الجذر بسطر `google.com, pub-XXXX..., DIRECT, f08c47fec0942fa0`
5. راجع صفحتي الإفصاح (disclosure) والخصوصية — نصّهما يعدّ بتحديث واضح وقت التفعيل

أي قيمة ناقصة = الموضع الخاص بها يبقى مخفيًا؛ لا يظهر أبدًا إعلان فارغ أو مكسور.

---

## 🌐 إعداد النطاق (مرة واحدة)

1. GitHub → إعدادات مستودع المدونة → Pages → Custom domain → `blog.abdallahabas.com` (ملف CNAME موجود جاهزًا)
2. في لوحة DNS عند مزود النطاق:

```
Type: CNAME
Name: blog
Value: <username>.github.io
```

3. بعد التفعيل فعّل "Enforce HTTPS"
4. أضف الموقع في Google Search Console (Property من نوع Domain) وأرسل `sitemap.xml`

## 🎨 الهوية البصرية وصور المقالات

- **الشعار الرسمي:** `blog/assets/images/logo.svg` — نسخة مطابقة للرابط الرسمي `https://abdallahabas.com/assets/images/logo.svg`، يظهر تلقائيًا في هيدر وفوتر كل الصفحات.
- **صورة المشاركة الافتراضية:** `blog/assets/images/og-default.png` (1200×630) مضافة كـ `og:image` لكل الصفحات، وتُستبدل بغلاف المقال تلقائيًا في صفحات المقالات.
- **صور المقالات:** مجلد محدد وحيد هو `blog/assets/images/articles/<slug>/` — الغلاف `cover.png` (1200×675) يُعلن في front matter بسطر `cover:`، والصور الداخلية `img-01.webp …` تُدرج بـ markdown بمسار مطلق. المولّد يرفض أي `cover` ملفه غير موجود. التفاصيل الكاملة: `assets/images/articles/README.md`.

## 🔍 السيو — البنية الجاهزة وما عليك فعله قبل النشر

### ما هو مبنيّ في الكود (يعمل تلقائيًا)

| العنصر | الحالة |
|---|---|
| صفحات مقالات ثابتة | `posts/<slug>.html` + `en/posts/<slug>.html` — المحتوى كامل في HTML بلا JS |
| عنوان ووصف فريد | لكل صفحة من front matter المقال (المولّد يرفض وصفًا أقصر من 50 حرفًا) |
| canonical | رابط نهائي لكل صفحة — وصفحة الموجّه `article.html?u=` عليها `noindex` فلا محتوى مكرر |
| hreflang | ar ↔ en ↔ x-default في كل الصفحات والمقالات والتصنيفات |
| وسوم المشاركة | Open Graph كاملة (نوع article، أوقات النشر/التحديث، الوسوم، أبعاد الصورة) + Twitter Card |
| Schema.org | `WebSite + SearchAction` (الرئيسيتان) · `Person` (عن المدونة) · `BlogPosting + BreadcrumbList` (كل مقال ثابت) |
| sitemap.xml | المقالات الثابتة + صفحات التصنيف (5 × لغتين) + الرئيسية/الأرشيف/عن/تواصل — بروابط hreflang |
| RSS | `feed.xml` (عربي) و`feed-en.xml` بروابط ثابتة — مرتبطان في الفوتر |
| نظافة الفهرسة | `noindex` على 404 والصفحات القانونية وصفحة الموجّه — صفر صفحات فارغة أو مكررة |
| بحث الموقع | `archive.html?q=` هدف صادق لـ SearchAction (يفتح الأرشيف مفلترًا فعلًا) |
| أداء | صور بأبعاد معلنة + lazy loading + preconnect للخطوط + صفر أطر عمل |

### خطواتك أنت قبل النشر (مرة واحدة — 15 دقيقة)

1. **Google Search Console** (search.google.com/search-console): أضف Property من نوع Domain للنطاق `abdallahabas.com`، انسخ توكن التحقق وضعه كوسم `<meta name="google-site-verification" content="التوكن">` في رأس الصفحات، ثم أرسل `https://blog.abdallahabas.com/sitemap.xml` من قسم Sitemaps واطلب فهرسة الرئيسية.
2. **Bing Webmaster Tools**: استيراد الموقع من Search Console بنقرة واحدة ثم إرسال نفس الـ sitemap.
3. **اختبر النتائج الغنية**: search.google.com/test/rich — جرّب رابط أي مقال ثابت ويجب أن يقرأ BlogPosting + BreadcrumbList.
4. **اختبر المشاركة**: اجلب رابط مقال في metatags.io أو أداة Posting — يجب أن يظهر غلاف المقال 1200×675 والعنوان والوصف.
5. **PageSpeed Insights**: صفحة رئيسية + مقال ثابت — النتيجة المستهدفة 90+ (بنية ساكنة بلا أطر تجعل ذلك واقعيًا).
6. **بعد قبول AdSense فقط**: فعّل الإعلانات من `js/config.js` (الخطوات موثقة داخل الملف) — لا تعكس الترتيب أبدًا.

> **قاعدة ذهبية:** لا تنشر الموقع وهو فيه صفحة واحدة فارغة أو وصف مكرر — المولّد يحرس ذلك آليًا، لكن مراجعة عينك قبل الضغط على Publish أرخص من إصلاح انطباع أول عند جوجل.

## ✅ قائمة مراجعة قبل الإطلاق

- [ ] لصق مفاتيح Firebase في `js/config.js` + تفعيل Email/Password + النطاقات المسموحة
- [ ] نشر قواعد Firestore المحدثة (enum الخدمات يتضمن كل معرّفات config)
- [ ] مراجعة النصوص القانونية (js/legal-data.js) وتعديل ما يلزم
- [ ] إضافة روابط الحسابات الاجتماعية في `config.js` (الفارغ لا يظهر)
- [ ] حذف المقالات التجريبية إن وُجدت عند نشر أول مقال حقيقي
- [ ] 2FA على GitHub وGoogle ومزود النطاق + Search Console للنطاق
- [ ] إرسال `sitemap.xml` في Search Console وBing Webmaster (الخطوة 1-2 أعلاه)
- [ ] فحص Rich Results لمقال ثابت واحد على الأقل
- [ ] (اختياري) صورة og-cover بحجم 1200×630 وإضافتها لوسوم og:image في الصفحات

/* config.js — المصدر الوحيد لإعدادات ABDALLAH ABAS
   ⚠️ أي قيمة تبدأ بـ PASTE_ تعني "غير مهيأة بعد" — الواجهة تتعامل مع ذلك بصدق وتعطّل الخاصية */
(function () {
  "use strict";

  window.BLOG_CONFIG = {
    version: "3.2.0",

    /* النطاقات النهائية */
    blogUrl: "https://blog.abdallahabas.com",
    siteUrl: "https://abdallahabas.com",

    /* أصول الهوية — الشعار الحقيقي وصورة المشاركة الافتراضية (og) */
    assets: { logo: "/assets/images/logo.svg", ogImage: "/assets/images/og-default.png" },

    brand: {
      name: { ar: "ABDALLAH ABAS", en: "ABDALLAH ABAS" },
      blog: { ar: "المدونة", en: "The Blog" }
    },

    author: {
      name: { ar: "ABDALLAH ABAS", en: "ABDALLAH ABAS" },
      role: {
        ar: "مطوّر ويب ومتخصص في الربح من الإنترنت وتجهيز المواقع لادسنس",
        en: "Web developer specialized in online monetization and AdSense readiness"
      },
      bio: {
        ar: "أعمل على بناء مواقع سريعة ونظيفة، وتجهيزها لقبول ادسنس، وأشارك هنا ما أجرّبه فعليًا — بلا حشو وبلا وعود أرباح وهمية.",
        en: "I build fast, clean websites, prepare them for AdSense approval, and publish only what I have actually tested — no filler, no fake income promises."
      },
      avatarText: "A",
      siteUrl: "https://abdallahabas.com",
      cvUrl: "https://abdallahabas.com/assets/abdallah-abas-cv.pdf"
    },

    /* قنوات تواصل حقيقية */
    contact: {
      email: "abdallahabasabish@gmail.com",
      whatsapp: "201001378339",
      whatsappDisplay: "+20 100 137 8339"
    },

    /* حسابات اجتماعية — املأ ما تريد عرضه فقط؛ الفارغ لا يظهر إطلاقًا */
    social: {
      facebook: "https://www.facebook.com/Abdallah.G.designer",
      linkedin: "https://www.linkedin.com/in/abdallah-abas-16601a258",
      telegram: "https://t.me/abdallahabasmo",
      github: ""
    },

    /* Firebase — نفس مشروع الموقع الرئيسي (abdallahsst).
       انسخ القيم من Firebase Console → Project settings → Your apps */
    firebase: {
      apiKey: "AIzaSyDg-oSbA_UdlzMS8HZGE0pHtr_zWg5rrXY",
      authDomain: "abdallahsst.firebaseapp.com",
      projectId: "abdallahsst",
      storageBucket: "abdallahsst.appspot.com",
      messagingSenderId: "PASTE_SENDER_ID",
      appId: "1:1011946194938:web:6c71030a6da4074b68c643"
    },

    /* التعليقات: Email/Password عبر Firebase Auth + Firestore
       تُعطّل تلقائيًا وبصدق إذا لم تُلصق مفاتيح Firebase */
    comments: { enabled: true, minLength: 3, maxLength: 1500 },

    /* إعلانات AdSense — معطّلة تمامًا: لا سكربت خارجي ولا فراغ محجوز ما دامت معطّلة
   (js/ads.js يفحص هذه القيم ولا يفعل أي شيء قبل اكتمالها).
   خطوات التفعيل بعد قبول الموقع في AdSense:
   1) client = "ca-pub-XXXXXXXXXXXXXXXX" (معرّف الناشر من حسابك)
   2) أنشئ وحدتي "إعلان داخل المقال" وضع معرّفيهما الرقميين في slots
   3) enabled = true
   4) ضع سطر ads.txt الصحيح في جذر المدونة (الصيغة داخل ملف ads.txt نفسه)
   5) راجع صفحتي الإفصاح والخصوصية — نصّهما يعدّ بتحديث واضح وقت تفعيل الإعلانات */
    adsense: { enabled: false, client: "", slots: { inArticle: "", belowPost: "" } },



    /* أسماء السلاسل — تظهر في صندوق السلسلة داخل المقالات.
       ⚠️ نفس معرفات series في front matter المقالات وفي content-plan.json */
    series: {
      "adsense-road": { ar: "الطريق إلى ادسنس", en: "The Road to AdSense" }
    },
    /* عروضي الخاصة — بطاقات ترويجية صادقة تظهر أسفل المقالات (خدماتي أنا، وليست إعلانات جوجل).
       النص يظهر كما هو للزائر — لا تكتب وعدًا لا تستطيع الوفاء به */
    offers: [
      {
        id: "adsense-prep",
        badge: { ar: "الأكثر طلبًا", en: "Most requested" },
        title: { ar: "تجهيز موقعك لقبول ادسنس", en: "Get your site AdSense-ready" },
        text: {
          ar: "مراجعة كاملة للمحتوى والصفحات القانونية وبنية التنقل والسرعة، مع خطة محتوى واضحة — حتى تقدّم طلب ادسنس من أقوى وضع ممكن.",
          en: "A full review of content, legal pages, navigation and speed, plus a clear content plan — so you submit your AdSense request from the strongest position."
        },
        path: "contact.html?service=adsense-prep"
      },
      {
        id: "web-dev",
        badge: { ar: "مقاعد محدودة شهريًا", en: "Limited monthly slots" },
        title: { ar: "موقع سريع جاهز للسيو من الصفر", en: "A fast, SEO-ready website from scratch" },
        text: {
          ar: "أبني موقعًا نظيفًا وسريعًا بهيكل سليم ومهيأ للفهرسة وللإعلانات — تسليم ملتزم وتركيب كامل على نطاقك.",
          en: "I build a clean, fast site with solid structure, ready for indexing and ads — committed delivery, fully set up on your own domain."
        },
        path: "contact.html?service=web-dev"
      }
    ],

    /* التصنيفات — الـ id يجب أن يطابق فئة المقال في Front Matter
       ⚠️ نفس القائمة مسجّلة في scripts/generate.mjs — عدّلهما معًا */
    categories: [
      { id: "adsense",  icon: "flame",  ar: "ادسنس وأرباح جوجل", en: "AdSense & Earnings", desc: { ar: "قبول ادسنس، السياسات، ورفع الأرباح بخطوات عملية.", en: "AdSense approval, policies, and practical revenue growth." } },
      { id: "seo",      icon: "chart",  ar: "السيو والفهرسة",    en: "SEO & Indexing",     desc: { ar: "Search Console، الفهرسة، والكلمات المفتاحية.", en: "Search Console, indexing, and keywords." } },
      { id: "web-dev",  icon: "code",   ar: "تطوير الويب",       en: "Web Development",    desc: { ar: "سرعة، أداء، وأدوات مطورين تُحدث فرقًا.", en: "Speed, performance, and dev tooling that matters." } },
      { id: "marketing",icon: "pen",    ar: "التسويق الرقمي",    en: "Digital Marketing",  desc: { ar: "خطط محتوى ونمو عملي بلا تعقيد.", en: "Content plans and no-nonsense growth." } },
      { id: "tools",    icon: "wrench", ar: "أدوات مجانية",      en: "Free Tools",         desc: { ar: "أدوات تستخدمها اليوم مباشرة من المتصفح.", en: "Utilities you can use right in the browser." } }
    ],

    /* الخدمات — ⚠️ الـ id يجب أن يطابق enum service في firestore.rules للمشروع.
       قاعدة حاكمة: أي id جديد = تحديث القواعد في نفس الـ commit */
    services: [
      { id: "web-dev",      ar: "تطوير موقع ويب",        en: "Web development" },
      { id: "wordpress",    ar: "مواقع ووردبريس",        en: "WordPress websites" },
      { id: "seo",          ar: "تحسين محركات البحث",    en: "SEO optimization" },
      { id: "adsense-prep", ar: "تجهيز موقع لادسنس",     en: "AdSense preparation" },
      { id: "content",      ar: "كتابة محتوى",           en: "Content writing" },
      { id: "consulting",   ar: "استشارة تقنية",         en: "Technical consulting" }
    ]
  };

  /* هل مفاتيح Firebase ملصوقة فعلًا؟ (بدل الاعتماد على قيم وهمية) */
  window.BLOG_CONFIG.firebaseReady = function () {
    var f = window.BLOG_CONFIG.firebase;
    return !!(f.apiKey && f.appId && f.messagingSenderId &&
      f.apiKey.indexOf("PASTE_") !== 0 &&
      f.appId.indexOf("PASTE_") !== 0 &&
      f.messagingSenderId.indexOf("PASTE_") !== 0);
  };
})();

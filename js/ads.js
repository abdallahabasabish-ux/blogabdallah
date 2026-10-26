/* ads.js — محمّل Google AdSense الصادق لـ ABDALLAH ABAS
   القاعدة: لا يُحمّل أي سكربت خارجي ولا يظهر أي مكان إعلاني إلا إذا توفّرت القيم الحقيقية الثلاث:
     1) BLOG_CONFIG.adsense.enabled === true
     2) client يبدأ بـ "ca-pub-"
     3) معرّف وحدة إعلانية حقيقي لكل موضع موجود في الصفحة
   غير ذلك: الحاويات تبقى مخفية تمامًا (CSS: .ad-slot { display:none })
   — لا فراغات وهمية، ولا طلبات لجوجل، ولا "إعلانات" مزيفة. */
(function () {
  "use strict";
  var cfg = window.BLOG_CONFIG && window.BLOG_CONFIG.adsense;
  if (!cfg || cfg.enabled !== true) return;

  var client = String(cfg.client || "");
  if (client.indexOf("ca-pub-") !== 0) return;

  var slots = cfg.slots || {};
  var boxes = Array.prototype.slice.call(document.querySelectorAll(".ad-slot[data-ad-slot]"));
  if (!boxes.length) return;

  /* نفصل المواضع الجاهزة (لها معرّف وحدة حقيقي) عن غير الجاهزة */
  var ready = [];
  boxes.forEach(function (box) {
    var id = String(slots[box.getAttribute("data-ad-slot")] || "").trim();
    if (id) ready.push({ box: box, id: id });
  });
  if (!ready.length) return;

  var EN = document.documentElement.lang === "en";
  /* نجهّز قائمة adsbygoogle قبل تحميل السكربت (النمط الرسمي لـ AdSense) */
  window.adsbygoogle = window.adsbygoogle || [];

  ready.forEach(function (r) {
    r.box.classList.add("on"); /* يزيل display:none ويحدد حدهم الأدنى للارتفاع */
    r.box.innerHTML =
      '<span class="ad-label">' + (EN ? "Advertisement" : "إعلان") + "</span>" +
      '<ins class="adsbygoogle" style="display:block" data-ad-client="' + client +
      '" data-ad-slot="' + r.id + '" data-full-width-responsive="true"></ins>';
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
    catch (e) { /* الوحدة لم تُعرض — لا نطالب المستخدم بأي شيء */ }
  });

  /* تحميل سكربت AdSense مرة واحدة فقط وبشكل غير حاجز */
  var s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = "https://pagead2.googlesynt" + "ication.com/pagead/js/adsbygoogle.js?client=" + client;
  document.head.appendChild(s);
})();

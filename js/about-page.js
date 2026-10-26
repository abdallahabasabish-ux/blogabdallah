/* about-page.js — عن المدونة: بيانات حقيقية من config فقط */
(function () {
  "use strict";
  var AB = window.AB, LANG = AB.LANG;
  function $(sel, root) { return (root || document).querySelector(sel); }
  var CFG = window.BLOG_CONFIG;
  var a = CFG.author;

  var nameEl = $("#aboutName"), roleEl = $("#aboutRole"), bioEl = $("#aboutBio");
  if (nameEl) nameEl.textContent = a.name[LANG];
  if (roleEl) roleEl.textContent = a.role[LANG];
  if (bioEl) bioEl.textContent = a.bio[LANG];
  document.title = (LANG === "ar" ? "عن المدونة" : "About") + " — " + (LANG === "ar" ? "ABDALLAH ABAS" : "ABDALLAH ABAS");

  var links = $("#aboutLinks");
  if (links) {
    var html = "";
    if (a.siteUrl) html += '<a class="btn btn-ghost btn-sm" href="' + a.siteUrl + '" target="_blank" rel="noopener noreferrer">' + AB.icon("globe") + (LANG === "ar" ? "الموقع الرئيسي" : "Main website") + "</a>";
    if (a.cvUrl) html += '<a class="btn btn-ghost btn-sm" href="' + a.cvUrl + '" target="_blank" rel="noopener noreferrer">' + AB.icon("doc") + "CV</a>";
    if (CFG.contact && CFG.contact.email) html += '<a class="btn btn-ghost btn-sm" href="mailto:' + CFG.contact.email + '">' + AB.icon("mail") + (LANG === "ar" ? "بريد مباشر" : "Direct email") + "</a>";
    if (CFG.contact && CFG.contact.whatsapp) html += '<a class="btn btn-ghost btn-sm wa-link" data-prefill="' + (LANG === "ar" ? "مرحبًا عبدالله، جيتك من مدونتك" : "Hello Abdallah, I came from your blog") + '" href="https://wa.me/' + CFG.contact.whatsapp + '">' + AB.icon("whatsapp") + "WhatsApp</a>";
    var soc = CFG.social || {};
    if (soc.github) html += '<a class="btn btn-ghost btn-sm" href="' + soc.github + '" target="_blank" rel="noopener noreferrer">' + AB.icon("github") + "GitHub</a>";
    if (soc.linkedin) html += '<a class="btn btn-ghost btn-sm" href="' + soc.linkedin + '" target="_blank" rel="noopener noreferrer">' + AB.icon("linkedin") + "LinkedIn</a>";
    if (soc.telegram) html += '<a class="btn btn-ghost btn-sm" href="' + soc.telegram + '" target="_blank" rel="noopener noreferrer">' + AB.icon("telegram") + "Telegram</a>";
    links.innerHTML = html;
  }
})();

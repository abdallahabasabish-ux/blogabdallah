/* theme.js — يُحمَّل في <head> بلا defer لمنع وميض الثيم (FOUC)
   الأولوية: localStorage (aa_theme) → تفضيل النظام → داكن */
(function () {
  var t = "dark";
  try {
    var saved = localStorage.getItem("aa_theme");
    if (saved === "light" || saved === "dark") t = saved;
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) t = "light";
  } catch (e) { /* التخزين غير متاح */ }
  document.documentElement.setAttribute("data-theme", t);
})();

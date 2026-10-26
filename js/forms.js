/* forms.js — طلب الخدمة بمسارين صادقين:
   1) مفاتيح Firebase ملصوقة → إرسال REST مباشر إلى Firestore (لا "تم الإرسال" إلا بعد 2xx فعلي)
   2) بلا Firebase → فتح واتساب برسالة الطلب مكتوبة وجاهزة — توصيل حقيقي بلا أي تمثيل.
   القاعدة الحاكمة في المسارين: لا نجاح زائف، ولا خطأ مطبوع لنقص إعداد — نقص الإعداد ليس خطأ بل مسار بديل. */
(function () {
  "use strict";
  var AB = window.AB, LANG = AB.LANG, T = AB.T;
  function $(sel, root) { return (root || document).querySelector(sel); }
  var CFG = window.BLOG_CONFIG;
  var STR = UI_STR[LANG].form;

  var form = $("#reqForm");
  if (!form) return;

  /* تعبئة الخدمات من config — الـ id يطابق enum قواعد Firestore */
  var sel = $("#reqService");
  if (sel) {
    sel.innerHTML = '<option value="">' + STR.servicePick + "</option>" +
      CFG.services.map(function (s) {
        return '<option value="' + s.id + '">' + AB.esc(s[LANG]) + "</option>";
      }).join("");
    /* تعبئة مسبقة من الرابط: ?service=adsense-prep (روابط الفوتر والمقالات) */
    var pre = new URLSearchParams(location.search).get("service");
    if (pre && CFG.services.some(function (s) { return s.id === pre; })) sel.value = pre;
  }

  var status = $("#formStatus");
  var btn = $("#reqSubmit");
  var hp = $("#reqCompany"); /* honeypot — حقل مخفي عن البشر */

  var fbReady = !!(CFG.firebaseReady && CFG.firebaseReady());

  /* بلا Firebase: الزر يصرّح بما سيحدث فعليًا — لا مفاجآت */
  if (!fbReady && btn) {
    btn.innerHTML = AB.icon("whatsapp") + " " + STR.sendWa;
  }

  function setStatus(kind, html) {
    if (!status) return;
    status.hidden = false;
    status.className = "status " + (kind === "ok" ? "status-ok" : "status-err");
    status.innerHTML = html;
    status.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function vEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }

  function collectPayload() {
    var fd = new FormData(form);
    var get = function (k) { return String(fd.get(k) || "").trim(); };
    var data = {
      name: get("name"),
      email: get("email"),
      service: get("service"),
      message: get("message"),
      sourcePage: "blog:" + (LANG === "en" ? "en/" : "") + "contact"
    };
    var phone = get("phone"), website = get("website");
    if (phone) data.phone = phone;
    if (website) data.website = website;
    return data;
  }

  function buildSummary(d) {
    var svc = CFG.services.filter(function (s) { return s.id === d.service; })[0];
    return (LANG === "ar" ? "طلب خدمة من ABDALLAH ABAS\n" : "Service request from ABDALLAH ABAS\n") +
      "— " + (LANG === "ar" ? "الاسم" : "Name") + ": " + d.name + "\n" +
      "— " + (LANG === "ar" ? "البريد" : "Email") + ": " + d.email + "\n" +
      (d.phone ? "— " + (LANG === "ar" ? "الهاتف" : "Phone") + ": " + d.phone + "\n" : "") +
      (d.website ? "— " + (LANG === "ar" ? "الموقع" : "Website") + ": " + d.website + "\n" : "") +
      "— " + (LANG === "ar" ? "الخدمة" : "Service") + ": " + (svc ? svc[LANG] : d.service) + "\n" +
      "— " + (LANG === "ar" ? "التفاصيل" : "Details") + ": " + d.message;
  }

  function waLink(d) {
    return "https://wa.me/" + CFG.contact.whatsapp + "?text=" +
      encodeURIComponent(STR.waPrefill + "\n" + buildSummary(d));
  }

  function mailLink(d) {
    return "mailto:" + CFG.contact.email +
      "?subject=" + encodeURIComponent(LANG === "ar" ? "طلب خدمة من المدونة" : "Service request from the blog") +
      "&body=" + encodeURIComponent(buildSummary(d));
  }

  function channelsHTML(waUrl, mailHref) {
    return '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<a class="btn btn-ghost btn-sm" href="' + waUrl + '" target="_blank" rel="noopener noreferrer">' + AB.icon("whatsapp") + "WhatsApp</a>" +
      '<a class="btn btn-ghost btn-sm" href="' + mailHref + '">' + AB.icon("mail") + "Email</a>" +
      '<button type="button" class="btn btn-ghost btn-sm" id="copySummaryBtn">' + AB.icon("copy") + STR.copySummary + "</button></div>";
  }

  function wireCopy(d) {
    var cs = document.getElementById("copySummaryBtn");
    if (cs) cs.addEventListener("click", function () { AB.copy(buildSummary(d)); });
  }

  function submitToFirestore(d) {
    var f = CFG.firebase;
    var url = "https://firestore.googleapis.com/v1/projects/" + f.projectId +
      "/databases/(default)/documents/service_requests?key=" + encodeURIComponent(f.apiKey);
    var fields = {
      name: { stringValue: d.name },
      email: { stringValue: d.email },
      service: { stringValue: d.service },
      message: { stringValue: d.message },
      sourcePage: { stringValue: d.sourcePage },
      createdAt: { timestampValue: new Date().toISOString() }
    };
    if (d.phone) fields.phone = { stringValue: d.phone };
    if (d.website) fields.website = { stringValue: d.website };
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: fields })
    }).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          var msg = (j.error && j.error.message) || ("HTTP " + r.status);
          throw new Error(msg);
        });
      }
      return r.json();
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (hp && hp.value) { return; } /* بوت صامت */

    var d = collectPayload();
    if (!d.name || !d.email || !d.service || !d.message) {
      setStatus("err", "<b>" + STR.errRequired + "</b>");
      return;
    }
    if (!vEmail(d.email)) {
      setStatus("err", "<b>" + STR.errEmail + "</b>");
      return;
    }

    /* المسار 1: بلا Firebase → واتساب برسالة جاهزة (توصيل فعلي — لا كلمة نجاح زائفة) */
    if (!fbReady) {
      var waUrl = waLink(d), mailHref = mailLink(d);
      var win = null;
      try { win = window.open(waUrl, "_blank"); } catch (err1) { win = null; }
      if (win) { try { win.opener = null; } catch (err2) {} }
      if (win) {
        setStatus("ok",
          "<b>" + STR.waTitle + "</b>" + STR.waBody +
          '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
          '<a class="btn btn-ghost btn-sm" href="' + waUrl + '" target="_blank" rel="noopener noreferrer">' + AB.icon("whatsapp") + STR.waAgain + "</a>" +
          '<a class="btn btn-ghost btn-sm" href="' + mailHref + '">' + AB.icon("mail") + "Email</a></div>");
      } else {
        setStatus("err", "<b>" + STR.waBlockTitle + "</b>" + STR.waBlockBody + channelsHTML(waUrl, mailHref));
        wireCopy(d);
      }
      return;
    }

    /* المسار 2: Firebase مضبوط → Firestore كما هو (نجاح بعد 2xx فقط) */
    btn.disabled = true;
    var label = btn.innerHTML;
    btn.textContent = STR.sending;
    status.hidden = true;

    submitToFirestore(d).then(function () {
      setStatus("ok", "<b>" + STR.okTitle + "</b>" + STR.okBody);
      form.reset();
    }).catch(function (err) {
      console && console.warn && console.warn("[blog] request submit failed:", err && err.message);
      setStatus("err", "<b>" + STR.failTitle + "</b>" + STR.failBody + channelsHTML(waLink(d), mailLink(d)));
      wireCopy(d);
    }).then(function () {
      btn.disabled = false;
      btn.innerHTML = label;
    });
  });
})();

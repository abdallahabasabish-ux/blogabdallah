/* comments.js — تعليقات المدونة: Firebase Auth (بريد + كلمة مرور) + Firestore
   المسار: blog_comments/{lang:slug}/items — كل مستخدم يعدّل/يحذف تعليقه فقط.
   البنية: فتحتان مستقلتان (لوحة الدخول/الكتابة + قائمة اللقطات) فلا تمسح إحداهما الأخرى.
   الصدق: لو المفاتيح غير ملصوقة يظهر قسم معطّل بصراحة — لا محاكاة ولا تعليقات وهمية. */
(function () {
  "use strict";
  var AB = window.AB, LANG = AB.LANG;
  function T(k) { return AB.T("comments." + k); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var CFG = window.BLOG_CONFIG;
  var SDK_V = "10.12.5";
  var sdkP = null;

  function loadSDK() {
    if (!sdkP) {
      sdkP = Promise.all([
        import("https://www.gstatic.com/firebasejs/" + SDK_V + "/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/" + SDK_V + "/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/" + SDK_V + "/firebase-firestore.js")
      ]);
    }
    return sdkP;
  }

  var state = { user: null, post: null, unsub: null, auth: null, db: null, mod: null, mounted: false };

  function authSlot() { return $("#cAuthSlot"); }
  function listSlot() { return $("#cListSlot"); }

  function renderDisabled() {
    var s = authSlot();
    if (!s) return;
    s.innerHTML =
      '<div class="c-auth">' + AB.icon("comment") +
      "<b>" + T("disabledTitle") + "</b><p>" + T("disabledBody") + "</p></div>";
  }

  function renderAuthPanel(msg) {
    var s = authSlot();
    s.innerHTML =
      '<div class="c-auth">' + AB.icon("user") +
      "<b>" + T("loginTitle") + "</b><p>" + T("loginBody") + "</p>" +
      (msg ? '<div class="status status-err" style="text-align:start"><b>' + AB.esc(msg) + "</b></div>" : "") +
      '<div class="c-tabs" role="tablist">' +
      '<button type="button" class="active" data-tab="in">' + T("tabLogin") + "</button>" +
      '<button type="button" data-tab="up">' + T("tabSignup") + "</button></div>" +
      '<form class="c-form-box" id="authForm">' +
      '<div class="field" id="nameField" hidden><label>' + T("displayName") + '</label><input id="authName" type="text" maxlength="40" autocomplete="name"></div>' +
      '<div class="field"><label>' + T("email") + '</label><input id="authEmail" type="email" autocomplete="email" required dir="ltr"></div>' +
      '<div class="field"><label>' + T("password") + '</label><input id="authPass" type="password" autocomplete="current-password" required minlength="6" dir="ltr"></div>' +
      '<button class="btn btn-primary btn-block" type="submit" id="authBtn">' + T("loginBtn") + "</button></form></div>";

    var mode = "in";
    $$(".c-tabs button", s).forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$(".c-tabs button", s).forEach(function (x) { x.classList.remove("active"); });
        btn.classList.add("active");
        mode = btn.getAttribute("data-tab");
        $("#nameField", s).hidden = mode !== "up";
        $("#authName", s).required = mode === "up";
        $("#authBtn", s).textContent = mode === "up" ? T("signupBtn") : T("loginBtn");
      });
    });

    $("#authForm", s).addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("#authEmail", s).value.trim();
      var pass = $("#authPass", s).value;
      var name = $("#authName", s).value.trim();
      var btnEl = $("#authBtn", s);
      btnEl.disabled = true;

      var authMod = state.mod.auth;
      var flow;
      if (mode === "up") {
        if (!name) { btnEl.disabled = false; return renderAuthPanel(T("needName")); }
        if (pass.length < 6) { btnEl.disabled = false; return renderAuthPanel(T("passShort")); }
        flow = authMod.createUserWithEmailAndPassword(state.auth, email, pass)
          .then(function (cred) { return authMod.updateProfile(cred.user, { displayName: name }); })
          .catch(function (err) {
            if (err && err.code === "auth/email-already-in-use") { btnEl.disabled = false; return renderAuthPanel(T("errExists")); }
            throw err;
          });
      } else {
        flow = authMod.signInWithEmailAndPassword(state.auth, email, pass);
      }
      flow.catch(function () {
        btnEl.disabled = false;
        renderAuthPanel(T("errAuth"));
      });
    });
  }

  function renderComposer() {
    var s = authSlot();
    var u = state.user;
    s.innerHTML =
      '<div class="c-userbar"><span class="who">' +
      '<span class="c-ava">' + AB.esc((u.displayName || "U").charAt(0).toUpperCase()) + "</span>" +
      "<b>" + AB.esc(u.displayName || (u.email || "").split("@")[0]) + "</b></span>" +
      '<button type="button" class="btn btn-ghost btn-sm" id="cLogout">' + T("logout") + "</button></div>" +
      '<form class="c-form-box" id="cForm">' +
      '<div class="field"><textarea id="cText" maxlength="' + CFG.comments.maxLength + '" placeholder="' + AB.esc(T("placeholder")) + '" required></textarea></div>' +
      '<button class="btn btn-primary" type="submit" id="cSend">' + AB.icon("send") + T("send") + "</button></form>";

    $("#cLogout", s).addEventListener("click", function () {
      state.mod.auth.signOut(state.auth);
    });

    $("#cForm", s).addEventListener("submit", function (e) {
      e.preventDefault();
      var text = $("#cText", s).value.trim();
      if (text.length < CFG.comments.minLength) return AB.toast(T("errShort"), "err");
      if (text.length > CFG.comments.maxLength) return AB.toast(T("errLong"), "err");
      var btnEl = $("#cSend", s);
      btnEl.disabled = true;
      btnEl.textContent = T("sending");

      var fsMod = state.mod.fs;
      var col = fsMod.collection(state.db, "blog_comments", LANG + ":" + state.post.slug, "items");
      fsMod.addDoc(col, {
        uid: u.uid,
        name: u.displayName || (u.email || "").split("@")[0],
        text: text,
        likes: [],
        likeCount: 0,
        createdAt: fsMod.serverTimestamp()
      }).then(function () {
        $("#cText", s).value = "";
        btnEl.disabled = false;
        btnEl.innerHTML = AB.icon("send") + T("send");
      }).catch(function () {
        btnEl.disabled = false;
        btnEl.innerHTML = AB.icon("send") + T("send");
        AB.toast(T("errGeneric"), "err");
      });
    });
  }

  function fmtWhen(ms) {
    try {
      return new Intl.DateTimeFormat(LANG === "en" ? "en-GB" : "ar-EG",
        { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(ms));
    } catch (e) { return ""; }
  }

  function itemHTML(it) {
    var mine = state.user && state.user.uid === it.uid;
    var liked = state.user && (it.likes || []).indexOf(state.user.uid) >= 0;
    var when = it.createdAt && it.createdAt.seconds ? fmtWhen(it.createdAt.seconds * 1000) : "";
    var delLabel = LANG === "ar" ? "حذف" : "Delete";
    return '<article class="c-item" data-id="' + AB.esc(it.id) + '">' +
      '<div class="c-head"><span class="c-ava">' + AB.esc((it.name || "U").charAt(0).toUpperCase()) + "</span>" +
      "<b>" + AB.esc(it.name || "—") + "</b>" +
      "<time>" + AB.esc(when) + "</time>" +
      (it.edited ? '<span class="c-badge">' + T("edited") + "</span>" : "") +
      "</div>" +
      '<div class="c-body">' + AB.esc(it.text) + "</div>" +
      '<div class="c-acts">' +
      '<button type="button" data-act="like" class="' + (liked ? "liked" : "") + '">' + AB.icon("heart") + "<span>" + (liked ? T("liked") : T("like")) + " · " + (it.likeCount || 0) + "</span></button>" +
      (mine
        ? '<button type="button" data-act="edit">' + AB.icon("pen") + T("edit") + "</button>" +
          '<button type="button" data-act="del" class="danger">' + AB.icon("trash") + delLabel + "</button>"
        : "") +
      "</div></article>";
  }

  function renderList(items) {
    var s = listSlot();
    var count = $("#cCount");
    if (count) count.textContent = items.length ? (items.length === 1 ? T("one") : items.length + " " + T("many")) : "";
    if (!items.length) {
      s.innerHTML = '<div class="empty" style="padding:40px 16px">' + AB.icon("comment") + "<b>" + T("empty") + "</b></div>";
      return;
    }
    s.innerHTML = items.map(itemHTML).join("");
    wireItems(items);
  }

  function wireItems(items) {
    var fsMod = state.mod.fs;
    var col = fsMod.collection(state.db, "blog_comments", LANG + ":" + state.post.slug, "items");
    $$(".c-item", listSlot()).forEach(function (el) {
      var id = el.getAttribute("data-id");
      var it = items.filter(function (x) { return x.id === id; })[0];
      if (!it) return;
      var likeBtn = el.querySelector('[data-act="like"]');
      var editBtn = el.querySelector('[data-act="edit"]');
      var delBtn = el.querySelector('[data-act="del"]');

      if (likeBtn) likeBtn.addEventListener("click", function () {
        if (!state.user) return;
        var liked = (it.likes || []).indexOf(state.user.uid) >= 0;
        var likes = liked ? it.likes.filter(function (u) { return u !== state.user.uid; }) : (it.likes || []).concat([state.user.uid]);
        fsMod.updateDoc(fsMod.doc(col, id), { likes: likes, likeCount: likes.length });
      });
      if (editBtn) editBtn.addEventListener("click", function () {
        var body = el.querySelector(".c-body");
        if (body.querySelector("textarea")) return;
        body.innerHTML =
          '<textarea maxlength="' + CFG.comments.maxLength + '" style="width:100%;min-height:90px">' + AB.esc(it.text) + "</textarea>" +
          '<div class="c-acts"><button type="button" class="btn btn-primary btn-sm" data-act="save">' + T("save") + "</button>" +
          '<button type="button" class="btn btn-ghost btn-sm" data-act="cancel">' + T("cancel") + "</button></div>";
        body.querySelector('[data-act="save"]').addEventListener("click", function () {
          var v = body.querySelector("textarea").value.trim();
          if (v.length < CFG.comments.minLength) return AB.toast(T("errShort"), "err");
          fsMod.updateDoc(fsMod.doc(col, id), { text: v, edited: true });
        });
        body.querySelector('[data-act="cancel"]').addEventListener("click", function () {
          body.innerHTML = AB.esc(it.text);
        });
      });
      if (delBtn) delBtn.addEventListener("click", function () {
        AB.confirm({ title: T("confirmDelete"), ok: LANG === "ar" ? "حذف" : "Delete", danger: true })
          .then(function (yes) {
            if (yes) fsMod.deleteDoc(fsMod.doc(col, id));
          });
      });
    });
  }

  function listen() {
    var fsMod = state.mod.fs;
    var col = fsMod.collection(state.db, "blog_comments", LANG + ":" + state.post.slug, "items");
    var q = fsMod.query(col, fsMod.orderBy("createdAt", "desc"), fsMod.limit(200));
    state.unsub = fsMod.onSnapshot(q, function (snap) {
      renderList(snap.docs.map(function (d) {
        var data = d.data();
        data.id = d.id;
        return data;
      }));
    }, function () {
      listSlot().innerHTML = '<div class="empty">' + AB.icon("warn") + "<b>" + T("errGeneric") + "</b></div>";
    });
  }

  function mount(post) {
    state.post = post;
    if (state.mounted) return;
    state.mounted = true;

    /* القسم يظهر دائمًا على صفحة المقال — وإن لم تُربط Firebase يظهر صندوق "معطّل" بصراحة */
    var sec0 = $("#commentsSec");
    if (sec0) sec0.hidden = false;

    if (!CFG.comments.enabled || !(CFG.firebaseReady && CFG.firebaseReady())) {
      renderDisabled();
      return;
    }

    var sec = $("#commentsSec");
    if (sec) sec.hidden = false;

    loadSDK().then(function (mods) {
      state.mod = { app: mods[0], auth: mods[1], fs: mods[2] };
      var appMod = mods[0], authMod = mods[1], fsMod = mods[2];
      var app = appMod.initializeApp(CFG.firebase);
      state.auth = authMod.getAuth(app);
      state.db = fsMod.getFirestore(app);
      authMod.onAuthStateChanged(state.auth, function (user) {
        state.user = user;
        if (user) renderComposer();
        else renderAuthPanel();
      });
      listen();
    }).catch(function (err) {
      console && console.warn && console.warn("[blog] comments init failed:", err);
      authSlot().innerHTML = '<div class="c-auth">' + AB.icon("warn") +
        "<b>" + T("errGeneric") + "</b><p>" + AB.esc(String((err && err.message) || err)).slice(0, 160) + "</p></div>";
    });
  }

  AB.comments = { mount: mount };
})();

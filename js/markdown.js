/* markdown.js — محوّل Markdown آمن 100%: يهرّب HTML أولًا فلا يُنفَّذ كود خام أبدًا.
   يدعم: عناوين h2-h4، قوائم، جداول، اقتباسات، كود فقري وسطري، صور https، روابط آمنة،
   إضافة: يبني TOC تلقائيًا بمعرفات تدعم العربية. */
(function () {
  "use strict";
  var AB = window.AB = window.AB || {};

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function slugify(t) {
    var s = String(t).toLowerCase().trim()
      .replace(/[^\u0621-\u064Aa-z0-9\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-").replace(/^-|-$/g, "");
    return s || "sec";
  }

  function safeUrl(u) {
    var url = String(u || "").trim();
    if (/^https:\/\//i.test(url)) return url;
    if (/^\/(?!\/)/.test(url)) return url;       /* مسار داخلي */
    if (/^#/.test(url)) return url;               /* مرساة */
    if (/^mailto:[^\s]+@/i.test(url)) return url;
    return null; /* javascript: و data: و http غير المشفر مرفوضة */
  }

  function inline(s) {
    var codes = [];
    /* كود سطري أولًا — يُخزَّن ويُستعاد بعد التهريب */
    s = s.replace(/`([^`\n]+)`/g, function (_, c) {
      codes.push("<code>" + esc(c) + "</code>");
      return "\u0000C" + (codes.length - 1) + "\u0000";
    });
    s = esc(s);
    /* صور https فقط */
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, url) {
      var u = safeUrl(url);
      return u ? '<img src="' + esc(u) + '" alt="' + esc(alt) + '" loading="lazy">' : esc(alt);
    });
    /* روابط */
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, txt, url) {
      var u = safeUrl(url);
      if (!u) return txt;
      var ext = /^https:\/\//i.test(u);
      return '<a href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + txt + "</a>";
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    s = s.replace(/\u0000C(\d+)\u0000/g, function (_, i) { return codes[+i]; });
    return s;
  }

  function parse(src) {
    var toc = [];
    var used = {};
    var codeBlocks = [];

    src = String(src || "").replace(/\r\n?/g, "\n");
    /* إزالة أي front matter متسرب */
    src = src.replace(/^---\n[\s\S]*?\n---\n?/, "");

    /* كود فقري */
    src = src.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      codeBlocks.push('<pre><code>' + esc(code.replace(/\n$/, "")) + "</code></pre>");
      return "\u0000K" + (codeBlocks.length - 1) + "\u0000";
    });

    var lines = src.split("\n");
    var out = [];
    var i = 0, para = [], list = null, quote = [];

    function flushPara() { if (para.length) { out.push("<p>" + inline(para.join(" ")) + "</p>"); para = []; } }
    function flushList() { if (list) { out.push("<" + list.tag + ">" + list.items.map(function (li) { return "<li>" + li + "</li>"; }).join("") + "</" + list.tag + ">"); list = null; } }
    function flushQuote() {
      if (quote.length) { out.push("<blockquote><p>" + quote.map(inline).join("</p><p>") + "</p></blockquote>"); quote = []; }
    }
    function flushAll() { flushPara(); flushList(); flushQuote(); }

    function heading(level, text) {
      flushAll();
      var id = slugify(text), base = id, n = 2;
      while (used[id]) { id = base + "-" + n++; }
      used[id] = true;
      if (level >= 2 && level <= 3) toc.push({ id: id, text: text, level: level });
      out.push('<h' + level + ' id="' + id + '">' + inline(text) + "</h" + level + ">");
    }

    while (i < lines.length) {
      var line = lines[i];

      if (!line.trim()) { flushAll(); i++; continue; }

      var hm = line.match(/^(#{1,4})\s+(.+?)\s*#*\s*$/);
      if (hm) { heading(hm[1].length, hm[2]); i++; continue; }

      if (/^(\-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flushAll(); out.push("<hr>"); i++; continue; }

      if (/^>\s?/.test(line)) {
        flushPara(); flushList();
        quote.push(line.replace(/^>\s?/, ""));
        i++; continue;
      }

      /* جدول: صف رأس + فاصل */
      if (/^\|(.+)\|\s*$/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        flushAll();
        var head = line.slice(1, -1).split("|").map(function (c) { return c.trim(); });
        i += 2;
        var rows = [];
        while (i < lines.length && /^\|(.+)\|\s*$/.test(lines[i])) {
          rows.push(lines[i].slice(1, -1).split("|").map(function (c) { return c.trim(); }));
          i++;
        }
        var t = '<div class="tbl-wrap"><table><thead><tr>' +
          head.map(function (h) { return "<th>" + inline(h) + "</th>"; }).join("") +
          "</tr></thead><tbody>" +
          rows.map(function (r) {
            return "<tr>" + r.map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>";
          }).join("") + "</tbody></table></div>";
        out.push(t);
        continue;
      }

      /* قوائم — مستويان كحد أقصى */
      var ul = line.match(/^(\s*)[-*]\s+(.+)$/);
      var ol = line.match(/^(\s*)\d+[.)]\s+(.+)$/);
      if (ul || ol) {
        flushPara(); flushQuote();
        var tag = ul ? "ul" : "ol";
        var indent = (ul || ol)[1].length >= 2;
        if (!list || list.tag !== tag) { flushList(); list = { tag: tag, items: [] }; }
        var item = (ul || ol)[2];
        if (indent && list.items.length) {
          list.items[list.items.length - 1] += "<ul><li>" + inline(item) + "</li></ul>";
        } else {
          list.items.push(inline(item));
        }
        i++; continue;
      }

      para.push(line.trim());
      i++;
    }
    flushAll();

    var html = out.join("\n").replace(/\u0000K(\d+)\u0000/g, function (_, i2) { return codeBlocks[+i2]; });
    return { html: html, toc: toc };
  }

  function stripFront(src) {
    return String(src || "").replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
  }

  AB.md = { parse: parse, esc: esc, slugify: slugify, stripFront: stripFront };
})();

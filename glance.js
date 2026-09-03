/* The field at a glance — sort, filter, and open a candidate in place.
   ------------------------------------------------------------------------
   The point of this table is that reading one candidate should not cost you
   your place on the page. Selecting a name renders the detail into the row
   underneath it, from the payload already on the page, so nothing is
   fetched and nothing navigates. The full profile is still one link away
   for anyone who wants the whole card. */
(function () {
  "use strict";
  var root = document.getElementById("glt");
  if (!root) return;
  var body = document.getElementById("gl-body");
  var el = document.getElementById("scdata");
  if (!el) return;
  var D;
  try { D = JSON.parse(el.textContent); } catch (e) { return; }

  var byKey = {};
  (D.cands || []).forEach(function (c) { byKey[c.key] = c; });
  var doorRows = (D.door && D.door.rows) || [];
  var cols = (D.cols || []).filter(function (c) { return c.topics; });

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---- detail panel ------------------------------------------------ */

  var DOORWORD = { said: "Said", record: "Record", yes: "Yes", dash: "—" };

  function doorsHtml(key) {
    var cells = (D.door && D.door.cells && D.door.cells[key]) || {};
    var out = doorRows.map(function (r) {
      var d = cells[r.key] || { state: "dash" };
      var st = d.state || "dash";
      var word = DOORWORD[st] || st;
      var note = d.note ? '<p class="gd-note">' + esc(d.note) + "</p>" : "";
      if (st === "dash") note = '<p class="gd-note gd-quiet">No sourced sentence on this one. Silence, not a fail.</p>';
      var src = d.url
        ? '<p class="gd-src"><a href="' + esc(d.url) + '" target="_blank" rel="noopener">' +
          esc(String(d.url).replace(/^https?:\/\/(www\.)?/, "").split("/")[0]) + "</a>" +
          (d.date ? " · " + esc(d.date) : "") + "</p>"
        : "";
      return '<div class="gd-door gd-' + esc(st) + '"><div class="gd-dk">' + esc(r.label) +
        '</div><div class="gd-dst">' + esc(word) + "</div>" + note + src + "</div>";
    }).join("");
    return '<div class="gd-doors">' + out + "</div>";
  }

  function topicsHtml(key) {
    var grid = (D.colGrid && D.colGrid[key]) || {};
    var out = cols.map(function (col) {
      var g = grid[col.key] || {};
      var n = g.n || 0;
      var total = g.total || (col.topics ? col.topics.length : 0);
      var pct = total ? Math.round((n / total) * 100) : 0;
      return '<div class="gd-t' + (n ? "" : " gd-t0") + '"><span class="gd-tl">' + esc(col.label) +
        '</span><span class="gd-tn">' + n + "<i>/" + total + '</i></span>' +
        '<span class="gd-tb"><i style="width:' + pct + '%"></i></span></div>';
    }).join("");
    return '<div class="gd-topics">' + out + "</div>";
  }

  var PLAT = {
    site: "Site", facebook: "Facebook", instagram: "Instagram", x: "X",
    linkedin: "LinkedIn", bluesky: "Bluesky", reddit: "Reddit", youtube: "YouTube",
    tiktok: "TikTok", threads: "Threads", city: "Official", page: "Page"
  };

  function linksHtml(c) {
    if (!c.links || !c.links.length) return "";
    var items = c.links.map(function (l) {
      return '<a class="gd-lk gd-lk-' + esc(l.p) + '" href="' + esc(l.h) + '" target="_blank" rel="noopener">' +
        '<span class="gd-lkp">' + esc(PLAT[l.p] || "Link") + "</span>" +
        '<span class="gd-lkn">' + esc(l.n) + "</span></a>";
    }).join("");
    return '<div class="gd-block"><h4>Where to check them</h4><div class="gd-links">' + items + "</div></div>";
  }

  function panelHtml(key) {
    var c = byKey[key];
    if (!c) return "<p>No record for this candidate.</p>";
    var head = '<div class="gd-head">' +
      '<div class="gd-hl">' +
        (c.grade
          ? '<span class="gd-badge g ' + gcls(c.grade) + '">' + esc(c.grade) + "</span>"
          : '<span class="gd-badge g g-x">—</span>') +
        '<span class="gd-hn">' + c.n + " of 55 measures answered" +
        (c.mean != null ? ' · mean ' + Number(c.mean).toFixed(2) : "") + "</span>" +
      "</div>" +
      '<a class="gd-open" href="' + esc(c.profile || "#") + '">Open the full profile</a>' +
      "</div>";
    var summary = c.summary ? '<p class="gd-sum">' + esc(c.summary) + "</p>" : "";
    var status = c.status ? '<p class="gd-status">' + esc(c.status) + "</p>" : "";
    var bio = c.bio ? '<div class="gd-block"><h4>Who they are</h4><p class="gd-bio">' + esc(c.bio) + "</p></div>" : "";
    return head + summary + status +
      '<div class="gd-block"><h4>The five questions</h4>' + doorsHtml(key) + "</div>" +
      '<div class="gd-block"><h4>The twelve topics — how much is answered</h4>' + topicsHtml(key) + "</div>" +
      bio + linksHtml(c);
  }

  function gcls(g) {
    if (!g) return "g-x";
    var c = g[0].toLowerCase();
    return "abcdf".indexOf(c) > -1 ? "g-" + c : "g-x";
  }

  /* ---- open / close ------------------------------------------------ */

  function toggle(btn) {
    var tr = btn.closest("tr");
    var key = tr.getAttribute("data-c");
    var det = document.getElementById("gld-" + key);
    if (!det) return;
    var open = btn.getAttribute("aria-expanded") === "true";
    if (open) {
      btn.setAttribute("aria-expanded", "false");
      det.hidden = true;
      tr.classList.remove("is-open");
      return;
    }
    var slot = det.querySelector(".gld-in");
    if (slot && !slot.getAttribute("data-done")) {
      slot.innerHTML = panelHtml(key);
      slot.setAttribute("data-done", "1");
    }
    btn.setAttribute("aria-expanded", "true");
    det.hidden = false;
    tr.classList.add("is-open");
    fitPanels();
  }

  /* On a narrow screen the table is wider than the screen and scrolls inside
     its wrapper. The detail row lives in that table, so without this it would
     inherit the table's width and the reader would have to scroll sideways to
     read a paragraph. The panel is sticky at left:0, so pinning it to the
     wrapper's visible width keeps it still and fully readable while the
     columns behind it scroll. */
  function fitPanels() {
    var wrap = root.parentElement;
    if (!wrap) return;
    var w = wrap.clientWidth;
    root.querySelectorAll(".gld:not([hidden]) .gld-in").forEach(function (s) {
      s.style.width = w + "px";
    });
  }
  var fitTimer;
  window.addEventListener("resize", function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitPanels, 120);
  });

  root.addEventListener("click", function (e) {
    var btn = e.target.closest(".gl-x");
    if (btn && root.contains(btn)) { toggle(btn); return; }
    var h = e.target.closest(".glh");
    if (h && root.contains(h)) sortBy(h.getAttribute("data-sort"), h);
  });

  /* ---- sorting ----------------------------------------------------- */

  var dir = {};
  function pairs() {
    var out = [], kids = body.children;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].classList.contains("glr")) {
        out.push([kids[i], document.getElementById("gld-" + kids[i].getAttribute("data-c"))]);
      }
    }
    return out;
  }

  function sortBy(what, head) {
    if (!what) return;
    /* Text sorts read best A to Z first; number sorts read best highest
       first, because "who has answered most" is the question being asked. */
    var textual = what === "name" || what === "seat" || what === "standing";
    var d = dir[what] === undefined ? (textual ? 1 : -1) : -dir[what];
    dir[what] = d;
    var rows = pairs();
    rows.sort(function (a, b) {
      var x = a[0], y = b[0], r;
      if (what === "name") r = x.getAttribute("data-surname").localeCompare(y.getAttribute("data-surname"));
      else if (what === "seat") r = x.getAttribute("data-seat").localeCompare(y.getAttribute("data-seat"));
      else if (what === "standing") r = x.getAttribute("data-standing").localeCompare(y.getAttribute("data-standing"));
      else r = (+x.getAttribute("data-" + what)) - (+y.getAttribute("data-" + what));
      if (r) return r * d;
      /* Equal letters are separated by coverage, the way the rest of the page
         separates them: a letter resting on 25 answers is not the same claim
         as the same letter resting on 14. */
      if (what === "rank") {
        var n = (+y.getAttribute("data-n")) - (+x.getAttribute("data-n"));
        if (n) return n;
      }
      /* a stable last key so equal values do not shuffle between sorts */
      return x.getAttribute("data-surname").localeCompare(y.getAttribute("data-surname"));
    });
    var frag = document.createDocumentFragment();
    rows.forEach(function (p) { frag.appendChild(p[0]); if (p[1]) frag.appendChild(p[1]); });
    body.appendChild(frag);
    root.querySelectorAll(".glh").forEach(function (b) { b.removeAttribute("aria-sort"); });
    if (head) head.setAttribute("aria-sort", d > 0 ? "ascending" : "descending");
  }

  /* ---- filtering --------------------------------------------------- */

  var seatSel = document.getElementById("gl-seat");
  var standSel = document.getElementById("gl-stand");
  var count = document.getElementById("gl-count");

  function applyFilters() {
    var seat = seatSel ? seatSel.value : "all";
    var stand = standSel ? standSel.value : "all";
    var shown = 0;
    pairs().forEach(function (p) {
      var tr = p[0], det = p[1];
      var ok = (seat === "all" || tr.getAttribute("data-seat") === seat) &&
        (stand === "all" || tr.getAttribute("data-standing") === stand);
      tr.hidden = !ok;
      if (det && !ok) {
        det.hidden = true;
        tr.classList.remove("is-open");
        var b = tr.querySelector(".gl-x");
        if (b) b.setAttribute("aria-expanded", "false");
      }
      if (ok) shown++;
    });
    if (count) {
      count.textContent = shown === 20
        ? "Showing all 20 candidates"
        : "Showing " + shown + " of 20 candidates";
    }
  }
  if (seatSel) seatSel.addEventListener("change", applyFilters);
  if (standSel) standSel.addEventListener("change", applyFilters);
  applyFilters();

  /* A link to /scorecard#gl-Sa should open that candidate, not just scroll
     past a closed row. */
  function openFromHash() {
    var h = location.hash.replace(/^#/, "");
    if (!/^gl-[A-Za-z]{2}$/.test(h)) return;
    var tr = document.getElementById(h);
    if (!tr) return;
    var btn = tr.querySelector(".gl-x");
    if (btn && btn.getAttribute("aria-expanded") !== "true") toggle(btn);
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();

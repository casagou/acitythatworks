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
      if (st === "dash") {
        /* A blank is an invitation. The ready-written question used to hang
           off the card grid; it hangs off the blank itself now. */
        note = '<p class="gd-note gd-quiet">No sourced sentence on this one. Silence, not a fail.</p>' +
          '<button type="button" class="gd-ask" data-ask="' + esc(key) + '" data-row="' + esc(r.key) +
          '">Ask them for one</button>';
      }
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
          : '<span class="gd-badge g x">—</span>') +
        '<span class="gd-hn">' + c.n + " of 55 measures answered" +
        (c.mean != null ? ' · mean ' + Number(c.mean).toFixed(2) : "") + "</span>" +
      "</div>" +
      '<a class="gd-open" href="' + esc(c.profile || "#") + '">Open the full profile</a>' +
      "</div>";
    var summary = c.summary ? '<p class="gd-sum">' + esc(c.summary) + "</p>" : "";
    var status = c.status ? '<p class="gd-status">' + esc(c.status) + "</p>" : "";
    var bio = c.bio ? '<div class="gd-block"><h4>Who they are</h4><p class="gd-bio">' + esc(c.bio) + "</p></div>" : "";
    /* Compare came off the card grid with ask. Two at a time, because two is
       what the side-by-side can show. */
    var picked = window.ACTW_HUB && window.ACTW_HUB.picks().indexOf(key) > -1;
    var foot = '<div class="gd-foot"><label class="gd-pick"><input type="checkbox" data-pick="' + esc(key) + '"' +
      (picked ? " checked" : "") + '> Compare with another candidate</label></div>';
    return head + summary + status +
      '<div class="gd-block"><h4>The five questions</h4>' + doorsHtml(key) + "</div>" +
      '<div class="gd-block"><h4>The twelve topics — how much is answered</h4>' + topicsHtml(key) + "</div>" +
      bio + linksHtml(c) + foot;
  }

  /* Bare letter class: the page styles .g.b, not .g.g-b. See the note in
     build/glance-table.js — the prefixed form rendered white on white. */
  function gcls(g) {
    if (!g) return "x";
    var c = g[0].toLowerCase();
    return "abcdf".indexOf(c) > -1 ? c : "x";
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
    var ask = e.target.closest(".gd-ask");
    if (ask && window.ACTW_HUB) {
      window.ACTW_HUB.ask(ask.getAttribute("data-ask"), ask.getAttribute("data-row"));
      return;
    }
    var btn = e.target.closest(".gl-x");
    if (btn && root.contains(btn)) { toggle(btn); return; }
    var h = e.target.closest(".glh");
    if (h && root.contains(h)) {
      /* The header and the Order-by select are two ways to do one thing, so
         one has to answer for the other: a header click used to leave the
         select showing whatever it said before, and leave a "what matters to
         me" ordering silently in force underneath the new sort. */
      var what = h.getAttribute("data-sort");
      clearWeighting();
      sortBy(what, h);
      var sel = document.getElementById("gl-sort");
      if (sel) sel.value = [].some.call(sel.options, function (o) { return o.value === what; }) ? what : "";
    }
  });

  root.addEventListener("change", function (e) {
    var p = e.target.closest("input[data-pick]");
    if (!p || !window.ACTW_HUB) return;
    var now = window.ACTW_HUB.togglePick(p.getAttribute("data-pick"));
    syncPicks(now);
  });

  /* One source of truth for which boxes are ticked, so clearing the compare
     panel unticks the rows and a third pick unticks the one it displaced. */
  function syncPicks(list) {
    root.querySelectorAll("input[data-pick]").forEach(function (b) {
      b.checked = list.indexOf(b.getAttribute("data-pick")) > -1;
    });
    renderTray(list);
  }
  document.addEventListener("actw:picks", function (e) { syncPicks(e.detail || []); });

  /* ---- the compare tray -------------------------------------------- */
  /* Ticking a box built the comparison thousands of pixels further down the
     page, with nothing to say it had happened — on a phone the panel landed
     8,331px below the row that opened it. The tray follows the reader
     instead: it says who is picked, what is still needed, and takes them to
     the result. It only exists while something is picked. */

  var tray;
  function renderTray(list) {
    if (!list || !list.length) {
      if (tray) { tray.remove(); tray = null; document.body.classList.remove("has-tray"); }
      return;
    }
    if (!tray) {
      tray = document.createElement("div");
      tray.className = "cmp-tray";
      tray.setAttribute("role", "region");
      tray.setAttribute("aria-label", "Candidates picked to compare");
      document.body.appendChild(tray);
      document.body.classList.add("has-tray");
    }
    var names = list.map(function (k) {
      var c = byKey[k];
      return '<span class="ct-n">' + esc(c ? c.name : k) + "</span>";
    }).join("");
    tray.innerHTML =
      '<div class="ct-in"><span class="ct-l">Comparing</span>' + names +
      (list.length < 2
        ? '<span class="ct-h">Pick one more</span>'
        : '<button type="button" class="ct-go">See them side by side →</button>') +
      '<button type="button" class="ct-x" aria-label="Clear the comparison">Clear</button></div>';

    var go = tray.querySelector(".ct-go");
    if (go) go.addEventListener("click", function () {
      var box = document.getElementById("hub-compare");
      if (box) box.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    tray.querySelector(".ct-x").addEventListener("click", function () {
      if (window.ACTW_HUB) window.ACTW_HUB.clearPicks();
      syncPicks([]);
    });
  }

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

  function sortBy(what, head, forced) {
    if (!what) return;
    /* Text sorts read best A to Z first; number sorts read best highest
       first, because "who has answered most" is the question being asked. */
    var textual = what === "name" || what === "seat" || what === "standing";
    var d;
    if (forced !== undefined) d = forced;
    else d = dir[what] === undefined ? (textual ? 1 : -1) : -dir[what];
    dir[what] = d;
    var rows = pairs();
    rows.sort(function (a, b) {
      var x = a[0], y = b[0], r;
      if (what === "name") r = x.getAttribute("data-surname").localeCompare(y.getAttribute("data-surname"));
      else if (what === "seat") r = x.getAttribute("data-seat").localeCompare(y.getAttribute("data-seat"));
      else if (what === "standing") r = x.getAttribute("data-standing").localeCompare(y.getAttribute("data-standing"));
      else if (what === "wm") r = (+x.getAttribute("data-wm") || 0) - (+y.getAttribute("data-wm") || 0);
      else r = (+x.getAttribute("data-" + what)) - (+y.getAttribute("data-" + what));
      if (r) return r * d;
      /* Inside an equal "what matters to me" count, fall back to the order the
         rest of the page argues for rather than to the alphabet. */
      if (what === "wm") {
        var k = (+y.getAttribute("data-rank")) - (+x.getAttribute("data-rank"));
        if (k) return k;
        var m = (+y.getAttribute("data-n")) - (+x.getAttribute("data-n"));
        if (m) return m;
      }
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
  var qBox = document.getElementById("gl-q");
  var count = document.getElementById("gl-count");

  function applyFilters() {
    var seat = seatSel ? seatSel.value : "all";
    var stand = standSel ? standSel.value : "all";
    /* Most people arrive with a name in mind. Matching the whole name rather
       than the surname means "marg", "gardiner" and "marg gardiner" all
       land on the same row. */
    var q = qBox ? qBox.value.trim().toLowerCase() : "";
    var shown = 0;
    pairs().forEach(function (p) {
      var tr = p[0], det = p[1];
      var ok = (seat === "all" || tr.getAttribute("data-seat") === seat) &&
        (stand === "all" || tr.getAttribute("data-standing") === stand) &&
        (!q || tr.getAttribute("data-name").indexOf(q) > -1);
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
        : shown === 0
          ? "No candidate of that name — check the spelling, or clear the filters"
          : "Showing " + shown + " of 20 candidates";
    }
  }
  if (seatSel) seatSel.addEventListener("change", applyFilters);
  if (standSel) standSel.addEventListener("change", applyFilters);
  if (qBox) qBox.addEventListener("input", applyFilters);
  applyFilters();

  /* ---- ordering, from the select ----------------------------------- */

  /* "Mayor first" is the one text sort that does not want A to Z: council
     sorts before mayor, and the reader asked for the mayoral race first. */
  var SORT_DIR = { name: 1, seat: -1, rank: -1, n: -1, five: -1 };
  var sortSel = document.getElementById("gl-sort");
  if (sortSel) {
    sortSel.addEventListener("change", function () {
      var v = this.value;
      clearWeighting();
      var head = root.querySelector('.glh[data-sort="' + v + '"]');
      sortBy(v, head, SORT_DIR[v] === undefined ? -1 : SORT_DIR[v]);
    });
  }

  /* ---- what matters to me ------------------------------------------ */
  /* The rule lives in hub.js so the page holds one definition of it: count
     the answered measures inside the ticked topics, never average their
     marks. A topic carries no letter and no mean, so an average here would
     be a grade this page invented. */

  var wm = [];
  var wmNote = document.getElementById("gl-wm-note");
  var wmChips = Array.prototype.slice.call(document.querySelectorAll(".gl-chip[data-wm]"));

  function clearWeighting() {
    if (!wm.length) return;
    wm = [];
    wmChips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    paintWeighting();
  }

  function paintWeighting() {
    pairs().forEach(function (p) {
      var tr = p[0];
      var c = byKey[tr.getAttribute("data-c")];
      var slot = tr.querySelector(".gl-wmn");
      if (!wm.length || !c || !window.ACTW_HUB) {
        tr.removeAttribute("data-wm");
        if (slot) { slot.hidden = true; slot.textContent = ""; }
        return;
      }
      var w = window.ACTW_HUB.weighted(c, wm);
      tr.setAttribute("data-wm", w ? w.n : 0);
      if (slot) {
        slot.hidden = false;
        slot.textContent = w
          ? w.n + " of " + w.total + " answered on what you chose"
          : "nothing answered on what you chose";
      }
    });
    if (wmNote) {
      if (!wm.length) { wmNote.hidden = true; wmNote.textContent = ""; return; }
      var labels = wm.map(function (k) {
        var chip = document.querySelector('.gl-chip[data-wm="' + k + '"]');
        return chip ? chip.textContent.trim() : k;
      });
      wmNote.hidden = false;
      wmNote.textContent = "Ordered by " + labels.join(", ") +
        ". The figure under each name is how many measures inside those topics carry a sourced answer. " +
        "It is a count of evidence, not a grade, and a candidate with none sits at the bottom.";
    }
  }

  wmChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var k = chip.getAttribute("data-wm");
      if (wm.indexOf(k) > -1) wm = wm.filter(function (x) { return x !== k; });
      else wm.push(k);
      chip.setAttribute("aria-pressed", wm.indexOf(k) > -1 ? "true" : "false");
      paintWeighting();
      if (wm.length) {
        if (sortSel) sortSel.selectedIndex = -1;
        sortBy("wm", null, -1);
      } else if (sortSel) {
        sortSel.value = "rank";
        sortBy("rank", root.querySelector('.glh[data-sort="rank"]'), -1);
      }
    });
  });

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

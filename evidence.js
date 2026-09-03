/* Citation panel + interactive mark legend on /profiles/<slug>.
   Thumb-first: tap, not hover. Reads #rating-card JSON written from the Notion card. */
(function () {
  /* Hosts a reader cannot reach. Their citations render as provenance, not links. */
  var INTERNAL = /^https?:\/\/(?:[a-z0-9-]+\.)*notion\.(?:so|com|site)\//i;

  var RULES = {
    Aligned: "They commit to the same instrument the Program names.",
    Close: "They commit to something comparable, not the same tool.",
    "Partial+": "They commit to a target, without naming the instrument.",
    Partial: "They commit to the goal, without a target or a tool.",
    Weak: "They agree it matters, without committing to act.",
    Opposed: "A vote or a sentence that disagrees.",
    Record: "A sourced 2022–26 vote or decision. Shown, not scored.",
    Dash: "No public answer with a URL and a date. Unknown, not a fail.",
  };

  var cardEl = document.getElementById("rating-card");
  var card = null;
  if (cardEl) {
    try { card = JSON.parse(cardEl.textContent); } catch (e) { card = null; }
  }
  var byN = {};
  if (card && card.cells) {
    for (var i = 0; i < card.cells.length; i++) byN[card.cells[i].n] = card.cells[i];
  }

  var cite = document.getElementById("cite");
  var back = document.getElementById("cite-back");
  var lastFocus = null;

  function $(id) { return document.getElementById(id); }

  function setText(id, text, hideIfEmpty) {
    var el = $(id);
    if (!el) return;
    if (!text) {
      el.textContent = "";
      if (hideIfEmpty) el.hidden = true;
      return;
    }
    el.hidden = false;
    el.textContent = text;
  }

  function closeCite() {
    if (!cite) return;
    cite.hidden = true;
    if (back) back.hidden = true;
    document.body.style.overflow = "";
    var opens = document.querySelectorAll(".ev-open[aria-expanded='true']");
    for (var i = 0; i < opens.length; i++) opens[i].setAttribute("aria-expanded", "false");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (location.hash && /^#c\d+$/.test(location.hash)) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function openCite(n, fromHash) {
    var cell = byN[n];
    if (!cite || !cell) return;
    lastFocus = document.activeElement;
    var dash = cell.kind === "dash" || !cell.mark;
    var mark = dash ? "—" : cell.mark;
    var ruleKey = dash ? "Dash" : cell.mark;
    $("cite-kicker").textContent = "Citation · cell " + cell.n;
    $("cite-title").textContent = mark;
    setText("cite-rule", RULES[ruleKey] || "");
    setText("cite-measure", cell.measure + " — " + cell.what);
    if (dash) {
      $("cite-q").textContent = "No public answer with a URL and a date. This is silence, not a fail.";
      setText("cite-why", "");
      $("cite-src").innerHTML = "";
      setText("cite-dates", "");
    } else {
      $("cite-q").textContent = cell.quote || "The card names this mark. The verbatim sentence was not filled on this cell.";
      setText("cite-why", cell.why || "");
      if (cell.url && INTERNAL.test(cell.url)) {
        /* Points into the private working workspace. A reader following it
           gets a login wall, so name the provenance instead of pretending
           there is a source to open. */
        $("cite-src").innerHTML = '<span class="src-int">This rests on the framework\'s own profile note, not an outside source.</span>';
      } else if (cell.url) {
        $("cite-src").innerHTML = '<a href="' + cell.url.replace(/"/g, "%22") + '" target="_blank" rel="noopener">' +
          (cell.source || cell.url) + "</a>";
      } else {
        $("cite-src").textContent = "";
      }
      var dates = [];
      if (cell.lastmod) dates.push("lastmod " + cell.lastmod);
      if (cell.retrieved) dates.push("retrieved " + cell.retrieved);
      setText("cite-dates", dates.join(" · "));
    }
    if (cell.flags && cell.flags.length) {
      setText("cite-flag", "Flagged on the card: " + cell.flags.join("; ") + ". Rendered as written — not filled from memory.");
    } else {
      setText("cite-flag", "", true);
    }
    cite.hidden = false;
    if (back) back.hidden = false;
    document.body.style.overflow = "hidden";
    var btn = document.querySelector('.ev-open[data-n="' + n + '"]');
    if (btn) btn.setAttribute("aria-expanded", "true");
    $("cite-x").focus();
    if (!fromHash) {
      history.replaceState(null, "", location.pathname + location.search + "#c" + n);
    }
  }

  document.addEventListener("click", function (e) {
    var openBtn = e.target.closest && e.target.closest(".ev-open");
    if (openBtn) {
      e.preventDefault();
      openCite(+openBtn.getAttribute("data-n"));
      return;
    }
    var leg = e.target.closest && e.target.closest("[data-legend]");
    if (leg) {
      var key = leg.getAttribute("data-legend");
      var rule = $("leg-rule");
      if (rule) {
        rule.hidden = false;
        rule.textContent = (key === "Dash" ? "—" : key) + " — " + (RULES[key] || "");
      }
      var legs = document.querySelectorAll("[data-legend]");
      for (var i = 0; i < legs.length; i++) legs[i].setAttribute("aria-expanded", legs[i] === leg ? "true" : "false");
      return;
    }
    if (e.target === back || (e.target.id === "cite-x")) closeCite();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && cite && !cite.hidden) {
      e.preventDefault();
      closeCite();
    }
  });

  function fromHash() {
    var m = (location.hash || "").match(/^#c(\d+)$/);
    if (m) openCite(+m[1], true);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
})();

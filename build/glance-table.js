#!/usr/bin/env node
/* "The field at a glance" — the summary layer the scorecard was missing.
   ------------------------------------------------------------------------
   The page opened onto twenty cards, so reading the field meant scrolling
   past all of them, and reading one candidate meant leaving for their
   profile and coming back. This table answers the first four questions a
   voter has — who, which seat, do they hold it, how much have they answered
   — in one screen, and opens the detail underneath the row rather than on
   another page.

   Written between GLANCE:START / GLANCE:END in scorecard.html. Everything
   comes from the published payload, so the table cannot disagree with the
   page it sits on. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const SC = path.join(ROOT, "scorecard.html");

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const html = fs.readFileSync(SC, "utf8");
const m = html.match(/<script id="scdata" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.error("scdata not found — run apply-rating-cards-to-scorecard.js first"); process.exit(1); }
const D = JSON.parse(m[1]);

const RANK = { B: 6, "B−": 5, "C+": 4, C: 3, "C−": 2, D: 1 };
/* The letter chip on this page is styled by scorecard.html's own block as
   .g.a / .g.b / .g.c / .g.d / .g.f / .g.x — the bare letter, not a g- prefix.
   This returned "g-b", which matched .g (white text) and no background rule
   at all, so every letter was white on white. It went unseen because the
   column it sits in was off the right-hand edge of a phone. */
const gradeCls = (g) => {
  if (!g) return "x";
  const c = g[0].toLowerCase();
  return "abcdf".indexOf(c) > -1 ? c : "x";
};

/* how many of the five doors carry something other than a dash */
const doorKeys = (D.door && D.door.rows ? D.door.rows : []).map((r) => r.key);
function doorsAnswered(key) {
  const cells = (D.door && D.door.cells && D.door.cells[key]) || {};
  return doorKeys.filter((k) => cells[k] && cells[k].state && cells[k].state !== "dash").length;
}

/* Ordered the way the page orders itself: letter first, then how much the
   letter rests on. A reader can re-sort, but the first view should be the
   one the rest of the page already argues for. */
const cands = D.cands.slice().sort((a, b) =>
  (RANK[b.grade] || 0) - (RANK[a.grade] || 0) || b.n - a.n || a.name.localeCompare(b.name));

const TOTAL = 55;
const areas = (D.cols || []).filter((c) => c.topics);
const rows = cands.map((c) => {
  const five = doorsAnswered(c.key);
  const pct = Math.round((c.n / TOTAL) * 100);
  const lean = c.lean ? c.lean + (c.leanTags && c.leanTags.length ? " · " + c.leanTags.join(" · ") : "") : "";
  const seat = c.office === "Mayor" ? "Mayor" : "Council";
  const standing = c.kind === "inc" ? "Incumbent" : "New";
  const letter = c.grade
    ? '<span class="g ' + gradeCls(c.grade) + '">' + esc(c.grade) + "</span>"
    : '<span class="g x" title="No letter yet — a letter is applied from the published rules once five measures are answered">—</span>';
  /* Seat, standing and lean ride under the name rather than holding three
     columns of their own. They were costing 169px of a 343px phone, which
     is what pushed the letter — the one number a reader came for — off the
     right-hand edge behind a scroll with no affordance. As one identity
     line they cost nothing, and the row reads as a sentence about a person
     instead of a spreadsheet. */
  const sub = `<span class="gl-tag gl-${c.kind === "inc" ? "inc" : "new"}">${esc(standing)}</span>` +
    `<span class="gl-subt">${esc(seat)}${lean ? " · " + esc(lean) : ""}</span>`;

  /* Twelve squares, one per topic, filled by how much of that topic carries a
     sourced answer. Not a grade and never a letter — Decision 14 gives a topic
     neither — but it is the one thing the numbers know and the table could not
     show: whether a card is broad and shallow or narrow and exact. Two
     candidates on the same letter look identical in a Letter column and quite
     different here. */
  const spark = areas.map((col) => {
    const g = (D.colGrid && D.colGrid[c.key] && D.colGrid[c.key][col.key]) || {};
    const n = g.n || 0;
    const total = g.total || (col.topics ? col.topics.length : 0);
    const lvl = !n ? 0 : (n / total >= 0.66 ? 3 : (n / total >= 0.34 ? 2 : 1));
    return `<i class="gl-sq gl-sq${lvl}" title="${esc(col.label)}: ${n} of ${total} answered"></i>`;
  }).join("");
  return `<tr class="glr" id="gl-${esc(c.key)}" data-c="${esc(c.key)}"` +
    ` data-rank="${RANK[c.grade] || 0}" data-n="${c.n}" data-five="${five}"` +
    ` data-name="${esc(c.name.toLowerCase())}" data-surname="${esc(c.name.split(" ").pop().toLowerCase())}"` +
    ` data-seat="${esc(seat.toLowerCase())}" data-standing="${esc(c.kind)}">` +
    `<td class="gl-who"><button type="button" class="gl-x" aria-expanded="false" aria-controls="gld-${esc(c.key)}">` +
      `<span class="gl-nm">${esc(c.name)}</span>` +
      `<span class="gl-sub">${sub}</span>` +
      `<span class="gl-spark" aria-hidden="true">${spark}</span>` +
      `<span class="gl-wmn" hidden></span>` +
      `<span class="gl-car" aria-hidden="true"></span></button></td>` +
    `<td class="gl-g">${letter}</td>` +
    `<td class="gl-n"><span class="gl-num">${c.n}<i>/${TOTAL}</i></span>` +
      `<span class="gl-bar" aria-hidden="true"><i style="width:${pct}%"></i></span></td>` +
    `<td class="gl-five"><span class="gl-num">${five}<i>/5</i></span></td>` +
    `</tr>` +
    `<tr class="gld" id="gld-${esc(c.key)}" hidden><td colspan="4"><div class="gld-in" data-for="${esc(c.key)}"></div></td></tr>`;
}).join("\n");

const lettered = cands.filter((c) => c.grade).length;

/* "What matters to me" was below the card grid, which is to say below the
   twenty cards almost nobody scrolled past. It is the closest thing the site
   has to a voter-advice tool, so it now sits with the controls at the top of
   the field, where it can be found. */
const areaChips = (D.cols || []).filter((c) => c.topics)
  .map((c) => `<button type="button" class="gl-chip" data-wm="${esc(c.key)}" aria-pressed="false">${esc(c.label)}</button>`)
  .join("\n");

const block = `<!-- GLANCE:START -->
<section class="glance" id="glance">
<h2 class="hub-h2">The field at a glance</h2>
<p class="hub-sub">Every candidate on one screen. <strong>${cands.length}</strong> names, <strong>${lettered}</strong> carrying a letter. Select a name to open what the framework found, without leaving this page. A dash is unknown, not a fail, and none of this is an endorsement.</p>
<div class="gl-ctl">
<label class="gl-f gl-f-q"><span>Find a candidate</span>
<input type="search" id="gl-q" placeholder="Type a name…" autocomplete="off" spellcheck="false"></label>
<label class="gl-f"><span>Show</span>
<select id="gl-seat">
<option value="all">Mayor and Council</option>
<option value="mayor">Mayor only</option>
<option value="council">Council only</option>
</select></label>
<label class="gl-f"><span>Standing</span>
<select id="gl-stand">
<option value="all">Incumbents and new</option>
<option value="inc">Incumbents only</option>
<option value="chal">New candidates only</option>
</select></label>
<label class="gl-f"><span>Order by</span>
<select id="gl-sort">
<option value="rank">Applied letter, best first</option>
<option value="n">Measures answered, most first</option>
<option value="five">The five questions, most answered first</option>
<option value="name">Candidate name, A to Z</option>
<option value="seat">Mayor first, then council</option>
</select></label>
<p class="gl-count" id="gl-count" aria-live="polite"></p>
</div>
<div class="gl-wm">
<span class="gl-wm-l" id="gl-wm-l">What matters to me — tick the topics you vote on, and the field reorders by how much of them each candidate has answered</span>
<div class="gl-wm-chips" role="group" aria-labelledby="gl-wm-l">
${areaChips}
</div>
<p class="gl-wm-note" id="gl-wm-note" hidden></p>
</div>
<div class="gl-wrap">
<table class="glt" id="glt">
<caption class="vh">Every candidate: seat, whether they hold it now, the applied letter, how many of the 55 measures are answered, and how many of the five questions have a written answer.</caption>
<thead><tr>
<th scope="col" class="gl-hwho"><button type="button" class="glh" data-sort="name">Candidate<span class="sar" aria-hidden="true"></span></button></th>
<th scope="col"><button type="button" class="glh" data-sort="rank" aria-sort="descending">Letter<span class="sar" aria-hidden="true"></span></button></th>
<th scope="col"><button type="button" class="glh" data-sort="n">Measures<span class="gl-hl"> answered</span><span class="sar" aria-hidden="true"></span></button></th>
<th scope="col"><button type="button" class="glh" data-sort="five">Five<span class="gl-hl"> questions</span><span class="sar" aria-hidden="true"></span></button></th>
</tr></thead>
<tbody id="gl-body">
${rows}
</tbody>
</table>
</div>
<p class="gl-key"><span class="gl-spark gl-key-s" aria-hidden="true"><i class="gl-sq gl-sq0"></i><i class="gl-sq gl-sq1"></i><i class="gl-sq gl-sq2"></i><i class="gl-sq gl-sq3"></i></span> The twelve squares under a name are the twelve topics, in the order of the list above, filled by how much of each carries a sourced answer — nothing, a little, some, most. A topic never gets a letter or an average. Select a name for the topic behind every square, the five questions, and the sources.</p>
<div id="hub-compare"></div>
<p class="gl-foot">A letter is applied from the published rules once five measures are answered, and is never an average: an unweighted mean lets a thin card with one strong mark outrank a wide card with an honest spread, which is why the number of answered measures is printed beside every letter. <a href="#areas">See every candidate against all twelve topics</a>.</p>
</section>
<!-- GLANCE:END -->`;

const RE = /<!-- GLANCE:START -->[\s\S]*?<!-- GLANCE:END -->/;
/* Test the markers, not whether the output changed: a rebuild that produces
   the identical block is the normal case, not a failure. */
if (!RE.test(html)) { console.error("GLANCE markers not found in scorecard.html"); process.exit(1); }
fs.writeFileSync(SC, html.replace(RE, () => block));
console.log("glance table: " + cands.length + " rows, " + lettered + " lettered");

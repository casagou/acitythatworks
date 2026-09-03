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
const gradeCls = (g) => {
  if (!g) return "g-x";
  const c = g[0].toLowerCase();
  return "abcdf".indexOf(c) > -1 ? "g-" + c : "g-x";
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
const rows = cands.map((c) => {
  const five = doorsAnswered(c.key);
  const pct = Math.round((c.n / TOTAL) * 100);
  const lean = c.lean ? c.lean + (c.leanTags && c.leanTags.length ? " · " + c.leanTags.join(" · ") : "") : "";
  const seat = c.office === "Mayor" ? "Mayor" : "Council";
  const standing = c.kind === "inc" ? "Incumbent" : "New";
  const letter = c.grade
    ? '<span class="g ' + gradeCls(c.grade) + '">' + esc(c.grade) + "</span>"
    : '<span class="g g-x" title="No letter yet — a letter needs five answered measures and is applied by hand">—</span>';
  return `<tr class="glr" id="gl-${esc(c.key)}" data-c="${esc(c.key)}"` +
    ` data-rank="${RANK[c.grade] || 0}" data-n="${c.n}" data-five="${five}"` +
    ` data-name="${esc(c.name.toLowerCase())}" data-surname="${esc(c.name.split(" ").pop().toLowerCase())}"` +
    ` data-seat="${esc(seat.toLowerCase())}" data-standing="${esc(c.kind)}">` +
    `<td class="gl-who"><button type="button" class="gl-x" aria-expanded="false" aria-controls="gld-${esc(c.key)}">` +
      `<span class="gl-nm">${esc(c.name)}</span>` +
      (lean ? `<span class="gl-lean">${esc(lean)}</span>` : "") +
      `<span class="gl-car" aria-hidden="true"></span></button></td>` +
    `<td class="gl-seat">${esc(seat)}</td>` +
    `<td class="gl-st"><span class="gl-tag gl-${c.kind === "inc" ? "inc" : "new"}">${esc(standing)}</span></td>` +
    `<td class="gl-g">${letter}</td>` +
    `<td class="gl-n"><span class="gl-num">${c.n}<i>/${TOTAL}</i></span>` +
      `<span class="gl-bar" aria-hidden="true"><i style="width:${pct}%"></i></span></td>` +
    `<td class="gl-five"><span class="gl-num">${five}<i>/5</i></span></td>` +
    `</tr>` +
    `<tr class="gld" id="gld-${esc(c.key)}" hidden><td colspan="6"><div class="gld-in" data-for="${esc(c.key)}"></div></td></tr>`;
}).join("\n");

const lettered = cands.filter((c) => c.grade).length;

const block = `<!-- GLANCE:START -->
<section class="glance" id="glance">
<h2 class="hub-h2">The field at a glance</h2>
<p class="hub-sub">Every candidate on one screen. <strong>${cands.length}</strong> names, <strong>${lettered}</strong> carrying a letter. Select a name to open what the framework found, without leaving this page. A dash is unknown, not a fail, and none of this is an endorsement.</p>
<div class="gl-ctl">
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
<p class="gl-count" id="gl-count" aria-live="polite"></p>
</div>
<div class="gl-wrap">
<table class="glt" id="glt">
<caption class="vh">Every candidate: seat, whether they hold it now, the applied letter, how many of the 55 measures are answered, and how many of the five questions have a written answer.</caption>
<thead><tr>
<th scope="col" class="gl-hwho"><button type="button" class="glh" data-sort="name">Candidate<span class="sar" aria-hidden="true"></span></button></th>
<th scope="col"><button type="button" class="glh" data-sort="seat">Seat<span class="sar" aria-hidden="true"></span></button></th>
<th scope="col"><button type="button" class="glh" data-sort="standing">Standing<span class="sar" aria-hidden="true"></span></button></th>
<th scope="col"><button type="button" class="glh" data-sort="rank" aria-sort="descending">Letter<span class="sar" aria-hidden="true"></span></button></th>
<th scope="col"><button type="button" class="glh" data-sort="n">Measures answered<span class="sar" aria-hidden="true"></span></button></th>
<th scope="col"><button type="button" class="glh" data-sort="five">Five questions<span class="sar" aria-hidden="true"></span></button></th>
</tr></thead>
<tbody id="gl-body">
${rows}
</tbody>
</table>
</div>
<p class="gl-foot">The letter is applied by hand from the published rules, only once five measures are answered, and it is never computed on this page. <a href="#areas">See every candidate against all twelve topics</a>, or <a href="#grid">open the full 55-topic grid</a>.</p>
</section>
<!-- GLANCE:END -->`;

const RE = /<!-- GLANCE:START -->[\s\S]*?<!-- GLANCE:END -->/;
/* Test the markers, not whether the output changed: a rebuild that produces
   the identical block is the normal case, not a failure. */
if (!RE.test(html)) { console.error("GLANCE markers not found in scorecard.html"); process.exit(1); }
fs.writeFileSync(SC, html.replace(RE, () => block));
console.log("glance table: " + cands.length + " rows, " + lettered + " lettered");

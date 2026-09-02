#!/usr/bin/env node
/* Fill scorecard area columns + 55-topic grid from data/rating-cards/*.json.
   Does not change locked Gen letters or the n printed with them.
   Does not invent an area letter below 5 scored card cells. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const KEYS = [
  ["alto", "Al"], ["harris", "Hr"], ["mcguigan", "Mg"], ["caradonna", "Ca"],
  ["dell", "De"], ["thompson", "Th"], ["kim", "Ki"], ["loughton", "Lo"],
  ["hammond", "Ha"], ["gardiner", "Ga"], ["cseszko", "Cs"], ["rothe", "Ro"],
  ["bowkett", "Bo"], ["mcinnis", "Mc"], ["lee", "Le"], ["sandor", "Sa"],
  ["garcia", "Gg"], ["girard", "Gi"], ["gibbs", "Gb"], ["dion", "Di"],
];
const SLUG = Object.fromEntries(KEYS.map(([s, k]) => [k, s]));
const GRID_KEYS = KEYS.map((k) => k[1]);

const MARKS = {
  Aligned: { value: 3, cls: "a", short: "A" },
  Close: { value: 2, cls: "b", short: "C" },
  "Partial+": { value: 1.5, cls: "c", short: "P+" },
  Partial: { value: 1, cls: "c", short: "P" },
  Weak: { value: 0.5, cls: "d", short: "W" },
  Opposed: { value: -1, cls: "f", short: "O" },
  Record: { value: null, cls: "rec", short: "R" },
};
const BANDS = [
  { g: "A", min: 2.75 }, { g: "A−", min: 2.50 }, { g: "B+", min: 2.25 },
  { g: "B", min: 2.00 }, { g: "B−", min: 1.75 }, { g: "C+", min: 1.50 },
  { g: "C", min: 1.25 }, { g: "C−", min: 1.00 }, { g: "D", min: 0.50 },
  { g: "F", min: -Infinity },
];
const FLOOR = 5;

function norm(m) {
  return String(m || "")
    .replace(/–/g, "-")
    .replace(/\s+/g, "")
    .replace(/M66b\/c/i, "M66b/M66c")
    .replace(/M45b\/c/i, "M45b/M45c")
    .toLowerCase();
}
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function band(mean) {
  for (const b of BANDS) if (mean >= b.min) return b.g;
  return "F";
}
function gradeCls(g) {
  if (!g) return "x";
  if (g[0] === "A") return "a";
  if (g[0] === "B") return "b";
  if (g[0] === "C") return "c";
  if (g[0] === "D") return "d";
  return "f";
}
function round2(x) { return Math.round(x * 100) / 100; }
function num2(x) { return (x < 0 ? "−" : "") + Math.abs(x).toFixed(2); }

function loadCards() {
  const byKey = {};
  for (const [slug, key] of KEYS) {
    const p = path.join(ROOT, "data", "rating-cards", slug + ".json");
    if (!fs.existsSync(p)) continue;
    byKey[key] = JSON.parse(fs.readFileSync(p, "utf8"));
  }
  return byKey;
}

function cellByMeasure(card) {
  const map = {};
  for (const cell of card.cells || []) {
    map[norm(cell.measure)] = cell;
  }
  return map;
}

const htmlPath = path.join(ROOT, "scorecard.html");
let html = fs.readFileSync(htmlPath, "utf8");
const m = html.match(/<script id="scdata" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) {
  console.error("scdata block not found");
  process.exit(1);
}
const DATA = JSON.parse(m[1]);
const cards = loadCards();
const topicByNorm = {};
DATA.topics.forEach((t, i) => { topicByNorm[norm(t.id)] = { t, i }; });

const unmatched = [];
const byCandMeasure = {};
let scoredMarks = 0;
for (const key of Object.keys(cards)) {
  byCandMeasure[key] = cellByMeasure(cards[key]);
  for (const cell of cards[key].cells || []) {
    if (cell.kind !== "scored" && cell.kind !== "record") continue;
    if (!topicByNorm[norm(cell.measure)]) {
      unmatched.push(key + " " + cell.measure);
    }
    if (cell.kind === "scored") scoredMarks++;
  }
}
if (unmatched.length) {
  console.error("Unmapped card measures:", unmatched);
  process.exit(1);
}

/* ---- 55-topic grid values (do not touch locked overall letters) ---- */
DATA.grid = DATA.topics.map((t) => GRID_KEYS.map((key) => {
  const cell = (byCandMeasure[key] || {})[norm(t.id)];
  if (!cell || (cell.kind !== "scored" && cell.kind !== "record")) return ".";
  if (cell.kind === "record") return "R";
  const mk = MARKS[cell.mark];
  return mk && mk.value != null ? String(mk.value) : ".";
}));

DATA.ev = {};
DATA.just = DATA.just || {};
DATA.topics.forEach((t, ti) => {
  GRID_KEYS.forEach((key) => {
    const cell = (byCandMeasure[key] || {})[norm(t.id)];
    if (!cell || (cell.kind !== "scored" && cell.kind !== "record")) return;
    const bits = [];
    if (cell.quote) bits.push(esc(cell.quote));
    if (cell.why) bits.push(esc(cell.why));
    if (bits.length) DATA.ev[ti + "|" + key] = bits.join(" — ");
  });
});
DATA.nmarks = scoredMarks;

/* ---- area columns from the scorecard's own 15-area map ---- */
function areaCell(key, col) {
  const ids = col.topics || [];
  const hits = [];
  let record = 0;
  for (const id of ids) {
    const cell = (byCandMeasure[key] || {})[norm(id)];
    if (!cell) continue;
    if (cell.kind === "record") { record++; continue; }
    if (cell.kind !== "scored") continue;
    const mk = MARKS[cell.mark];
    if (!mk || mk.value == null) continue;
    hits.push({ cell, mk, id });
  }
  const total = ids.length;
  if (!hits.length) {
    return { state: record ? "record" : "empty", n: 0, record, total, mean: null, grade: null, hits };
  }
  const mean = round2(hits.reduce((a, h) => a + h.mk.value, 0) / hits.length);
  const n = hits.length;
  return {
    state: n < FLOOR ? "marks" : "graded",
    grade: n < FLOOR ? null : band(mean),
    mean, n, record, total, hits,
  };
}

for (const key of GRID_KEYS) {
  if (!DATA.colGrid[key]) DATA.colGrid[key] = {};
  for (const col of DATA.cols) {
    if (col.key === "general") continue; /* Gen stays locked */
    const g = areaCell(key, col);
    DATA.colGrid[key][col.key] = {
      state: g.state,
      n: g.n,
      record: g.record,
      total: g.total,
      ...(g.mean != null ? { mean: g.mean } : {}),
      ...(g.grade ? { grade: g.grade, thin: g.n < FLOOR, hasOpp: g.hits.some((h) => h.mk.value < 0) } : {}),
    };
    if (g.hits.length) {
      DATA.just[key + "|" + col.key] = {
        ev: g.hits.map((h) => {
          const q = h.cell.quote ? " “" + esc(h.cell.quote) + "”" : "";
          return h.id + " · " + h.cell.mark + q;
        }).join("<br>"),
      };
    }
  }
}

function citeHref(key, n) {
  return "/profiles/" + SLUG[key] + "#c" + n;
}

function areaTd(key, col, g) {
  const base = ' data-col="' + col.key + '" data-n="' + g.n + '" data-mean="' + (g.n ? g.mean : "") + '"';
  if (g.state === "empty") return '<td class="cc none"' + base + ">—</td>";
  const first = g.hits.slice().sort((a, b) => a.cell.n - b.cell.n)[0];
  const href = first ? citeHref(key, first.cell.n) : "";
  const cite = href ? ' data-cite="' + href + '"' : "";
  const jump = href ? " cite-jump" : "";
  if (g.state === "record") {
    return '<td class="cc rec' + jump + '" tabindex="0" role="link" data-c="' + key + '"' + base + cite +
      ' title="Record only — a documented term in office, never scored">R<span class="cn">0/' + g.total + "</span></td>";
  }
  if (g.state === "marks") {
    return '<td class="cc few' + jump + '" tabindex="0" role="link" data-c="' + key + '"' + base + cite +
      ' title="' + g.n + " scored topic" + (g.n > 1 ? "s" : "") + " of " + g.total +
      ' — below five scored answers, so no letter is printed">' +
      '<span class="few-m">' + num2(g.mean) + "</span>" +
      '<span class="cn">' + g.n + "/" + g.total + "</span></td>";
  }
  return '<td class="cc' + jump + '" tabindex="0" role="link" data-c="' + key + '"' + base + cite +
    ' title="' + col.label + " " + g.grade + " from " + g.n + " scored topics — open the citation\">" +
    '<span class="g ' + gradeCls(g.grade) + '">' + g.grade + "</span>" +
    '<span class="cn">' + g.n + "/" + g.total + "</span></td>";
}

function gridTd(key, t, ti) {
  const cell = (byCandMeasure[key] || {})[norm(t.id)];
  if (!cell || (cell.kind !== "scored" && cell.kind !== "record")) {
    return '<td class="gc gx" title="No public position located">·</td>';
  }
  const href = citeHref(key, cell.n);
  if (cell.kind === "record") {
    return '<td class="gc grec cite-jump" tabindex="0" role="link" data-t="' + ti + '" data-c="' + key +
      '" data-cite="' + href + '" title="Record — open the citation on ' + SLUG[key] + '">R</td>';
  }
  const mk = MARKS[cell.mark] || { cls: "c", short: cell.mark ? cell.mark.charAt(0) : "·" };
  return '<td class="gc mk-' + mk.cls + ' cite-jump" tabindex="0" role="link" data-t="' + ti +
    '" data-c="' + key + '" data-v="' + (mk.value != null ? mk.value : "") +
    '" data-cite="' + href + '" title="' + esc(cell.mark) + " — open the citation on " + SLUG[key] + '">' +
    mk.short + "</td>";
}

/* ---- rewrite area-table rows, keeping the Gen cell verbatim ---- */
html = html.replace(/<tr id="sc-(\w+)" class="cr"[\s\S]*?<\/tr>/g, (row, key) => {
  const who = row.match(/<td class="who"[\s\S]*?<\/td>/);
  const gen = row.match(/<td class="cc(?: none)?" data-col="general"[\s\S]*?<\/td>/);
  if (!who || !gen) return row;
  const head = row.match(/^<tr[^>]*>/)[0];
  const tds = [who[0], gen[0]];
  for (const col of DATA.cols) {
    if (col.key === "general") continue;
    tds.push(areaTd(key, col, areaCell(key, col)));
  }
  return head + tds.join("") + "</tr>";
});

/* ---- rewrite 55-topic grid body ---- */
html = html.replace(/<table class="mg">([\s\S]*?)<\/table>/, (all, inner) => {
  const headM = inner.match(/<thead>[\s\S]*?<\/thead>/);
  const body = DATA.topics.map((t, ti) => {
    const old = inner.match(new RegExp('<tr><td class="gt"[^>]*data-topic="' + ti + '"[\\s\\S]*?</tr>'));
    if (!old) throw new Error("missing topic row " + ti);
    const gt = old[0].match(/<td class="gt"[\s\S]*?<\/td>/)[0];
    return "<tr>" + gt + GRID_KEYS.map((key) => gridTd(key, t, ti)).join("") + "</tr>";
  }).join("\n");
  return '<table class="mg">' + headM[0] + "<tbody>" + body + "</tbody></table>";
});

/* ---- lede + caption: no internal method name ---- */
html = html.replace(
  /<p class="lede-t">[\s\S]*?<\/p>/,
  '<p class="lede-t"><strong>Gen</strong> is the overall letter. The other columns are the same 55 topics grouped by area. A filled cell is a sourced mark — tap it to open that citation on the candidate&rsquo;s profile. A dash is silence, not a fail. Sort, filter, or tick candidates to compare them.</p>'
);
html = html.replace(
  /<caption class="vh">[\s\S]*?<\/caption>/,
  '<caption class="vh">Every candidate. Gen is the overall letter. The other columns are the same 55 topics grouped by area, sourced on the profile.</caption>'
);
html = html.replace(
  /Area columns are blank on purpose\./g,
  "Unknown, not a fail."
);

html = html.replace(
  /<script src="cite-scorecard\.js\?v=\d+" defer><\/script>/,
  '<script src="cite-scorecard.js?v=2" defer></script>'
);

html = html.replace(
  /<script id="scdata" type="application\/json">[\s\S]*?<\/script>/,
  '<script id="scdata" type="application/json">' + JSON.stringify(DATA) + "</script>"
);

fs.writeFileSync(htmlPath, html, "utf8");

/* Refresh the citation index used by the 55-grid overlay. */
require("child_process").execFileSync(process.execPath, [path.join(__dirname, "write-cite-index.js")], { stdio: "inherit" });

const filled = {};
for (const col of DATA.cols) {
  if (col.key === "general") continue;
  filled[col.key] = GRID_KEYS.filter((k) => DATA.colGrid[k][col.key].state !== "empty").length;
}
const locked = {
  Mc: ["B+", 17], Sa: ["B", 16], Le: ["B", 9], Gg: ["C", 10], Bo: ["C", 5],
  Gi: ["D", 7], Ga: ["D", 6], Lo: ["D", 6], De: ["D", 5],
};
for (const [key, [letter, n]] of Object.entries(locked)) {
  const c = DATA.cands.find((x) => x.key === key);
  if (!c || c.grade !== letter || c.n !== n) {
    console.error("LOCKED GEN DRIFT", key, c);
    process.exit(1);
  }
}
const others = DATA.cands.filter((c) => !locked[c.key]);
for (const c of others) {
  if (c.grade != null && c.grade !== "—") {
    console.error("unexpected letter", c.key, c.grade);
    process.exit(1);
  }
}

console.log("Applied rating cards to scorecard.html");
console.log("  scored card cells :", scoredMarks);
console.log("  area fills        :", filled);
console.log("  Gen locked        : McInnis B+ 17, Sandor B 16, Lee B 9, Garcia C 10, Bowkett C 5, Girard D 7, Gardiner D 6, Loughton D 6, Dell D 5");

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

/* ---- the twelve topics, derived from the cards rather than transcribed ----
   Every card carries the same 12 topics and the same 55 measures in the same
   order (cell.n 1–55), so the columns are read off a card and every other card
   is checked against it. Change the topic set on the Notion template, re-export
   the cards, and the columns follow. The legacy 15-area map is gone: it was a
   different grouping, and it printed a letter per area, which Decision 14
   forbids. */
const SHORT = {
  "Housing that gets built": "Housing",
  "Downtown order": "Downtown",
  "Household bill": "Household bill",
  "Host Nations": "Host Nations",
  "Homelessness and waitlists": "Homelessness",
  "Families": "Families",
  "Streets and mobility": "Streets",
  "Policing and published safety": "Policing",
  "Beauty as a public good": "Beauty",
  "A smaller scored Hall": "Smaller Hall",
  "Climate and trees as operations": "Climate",
  "Neighbourhoods and integrity": "Neighbourhoods",
};
function topicColumns(cards) {
  const ref = cards[GRID_KEYS.find((k) => cards[k])];
  if (!ref) { console.error("no rating cards loaded"); process.exit(1); }
  const byTopic = new Map();
  for (const cell of ref.cells) {
    if (!byTopic.has(cell.topic)) byTopic.set(cell.topic, { n: cell.topic, label: cell.topicName, topics: [] });
    byTopic.get(cell.topic).topics.push(cell.measure);
  }
  const cols = [...byTopic.values()].sort((a, b) => a.n - b.n).map((t) => ({
    key: "t" + t.n,
    label: t.label,
    short: SHORT[t.label] || t.label,
    topics: t.topics,
  }));
  /* every card must agree, or a column would mean different things per name */
  const sig = (c) => c.cells.map((x) => x.topic + ":" + norm(x.measure)).join("|");
  const want = sig(ref);
  for (const k of Object.keys(cards)) {
    if (sig(cards[k]) !== want) {
      console.error("rating card " + k + " does not carry the same 12 topics / 55 measures as the others");
      process.exit(1);
    }
  }
  const total = cols.reduce((a, c) => a + c.topics.length, 0);
  if (cols.length !== 12 || total !== 55) {
    console.error("expected 12 topics and 55 measures, got " + cols.length + " and " + total);
    process.exit(1);
  }
  return cols;
}
const GEN = DATA.cols.find((c) => c.key === "general") ||
  { key: "general", label: "Overall", short: "Gen", topics: null };
DATA.cols = [GEN, ...topicColumns(cards)];

/* ---- one topic cell ----------------------------------------------------
   Decision 14: "No topic gets its own letter. Area columns stay blank." So a
   cell reports how many of that topic's measures carry a sourced answer, and
   opens them. It never prints a letter or a mean. */
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
  if (!hits.length) return { state: record ? "record" : "empty", n: 0, record, total, hits };
  return { state: "answers", n: hits.length, record, total, hits };
}

const COL_KEYS = new Set(DATA.cols.map((c) => c.key));
for (const key of GRID_KEYS) {
  if (!DATA.colGrid[key]) DATA.colGrid[key] = {};
  /* Drop cells for columns that no longer exist. The legacy 15-area keys were
     still sitting in the payload carrying letters and means — nothing rendered
     them, but shipping a retired grade is how a retired grade gets quoted. */
  for (const stale of Object.keys(DATA.colGrid[key])) {
    if (!COL_KEYS.has(stale)) delete DATA.colGrid[key][stale];
  }
  for (const jk of Object.keys(DATA.just || {})) {
    if (jk.indexOf(key + "|") === 0 && !COL_KEYS.has(jk.slice(key.length + 1))) delete DATA.just[jk];
  }
  for (const col of DATA.cols) {
    if (col.key === "general") continue; /* Gen stays locked */
    const g = areaCell(key, col);
    DATA.colGrid[key][col.key] = {
      state: g.state, n: g.n, record: g.record, total: g.total,
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

/* A topic cell shows answers out of measures — never a letter, never a mean.
   The bar is how much of the topic has a sourced answer, so a column can be
   scanned down without reading every figure. */
function areaTd(key, col, g) {
  const base = ' data-col="' + col.key + '" data-n="' + g.n + '" data-total="' + g.total + '"';
  if (g.state === "empty" && !g.record) {
    return '<td class="cc none"' + base + ' title="' + esc(col.label) +
      ' — nothing located yet on any of its ' + g.total + ' measures. Unknown, not a fail.">—</td>';
  }
  const first = g.hits.slice().sort((a, b) => a.cell.n - b.cell.n)[0];
  const href = first ? citeHref(key, first.cell.n) : "";
  const cite = href ? ' data-cite="' + href + '"' : "";
  const jump = href ? " cite-jump" : "";
  if (g.state === "record") {
    return '<td class="cc rec"' + base +
      ' title="' + esc(col.label) + ' — record only: a documented term in office, never scored">R</td>';
  }
  const pct = Math.round((g.n / g.total) * 100);
  return '<td class="cc ans' + jump + '" tabindex="0" role="link" data-c="' + key + '"' + base + cite +
    ' title="' + esc(col.label) + " — " + g.n + " of " + g.total + " measure" + (g.total > 1 ? "s" : "") +
    ' answered. Open the first citation.">' +
    '<span class="ansn">' + g.n + "<i>/" + g.total + "</i></span>" +
    '<span class="ansb" aria-hidden="true"><i style="width:' + pct + '%"></i></span></td>';
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

/* ---- the applied letters and counts ------------------------------------
   Decision 14: the letter is applied by hand on the Notion live-door table,
   never computed here, and n is copied from the same row. Reading them from
   data/applied-letters.json rather than an inline map means the site's copy of
   that table is a file someone can diff against Notion. Before this, only the
   nine lettered names carried an n and everyone else printed 0 — McGuigan has
   fifteen answers and the page said none. */
const APPLIED = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "applied-letters.json"), "utf8"));
const appliedBy = Object.fromEntries(APPLIED.candidates.map((c) => [c.key, c]));
const cmeta = require("./candidate-meta");
const metaBySlug = Object.fromEntries(cmeta.all().map((m) => [m.slug, m]));
for (const c of DATA.cands) {
  const a = appliedBy[c.key];
  if (!a) { console.error("no applied row for " + c.key + " (" + c.name + ")"); process.exit(1); }
  if (a.name !== c.name) { console.error("name drift " + c.key + ": " + c.name + " vs applied " + a.name); process.exit(1); }
  c.grade = a.letter;
  c.n = a.n;
  c.kind = a.kind;
  /* The mean is read off the card and published beside n, never on its own and
     never turned into a letter here: an unweighted mean lets a thin card with
     one lucky Aligned mark outrank a wide card with an honest spread, which is
     exactly why coverage is printed next to it. */
  c.mean = a.mean == null ? null : a.mean;
  c.proposed = a.proposed || null;
  c.applied = a.applied || null;
  c.correction = a.correction || null;
  c.summary = a.summary || null;
  /* Identity, so the table can say who this is without a second request:
     where the framework reads them as sitting, and every channel it read
     them in. The lean is the framework's reading, not a party card. */
  const m = metaBySlug[c.profile ? c.profile.split("/").pop() : ""];
  if (m) {
    c.lean = m.lean;
    c.leanTags = m.tags;
    c.leanUncertain = !!m.uncertain;
    c.status = m.status;
    c.bio = m.bio;
    c.links = m.links.map((l) => ({ p: l.platform, n: l.name, h: l.href }));
  }
}
DATA.letterRule = APPLIED._rule;
DATA.meanRule = APPLIED._meanRule;
DATA.letters = APPLIED._letters;
DATA.caveats = APPLIED.caveats || [];
const missing = APPLIED.candidates.filter((a) => !DATA.cands.some((c) => c.key === a.key));
if (missing.length) {
  console.error("applied table has candidates the scorecard does not: " + missing.map((m) => m.name).join(", "));
  process.exit(1);
}

/* ---- rewrite the area table's headings and the two selects ---- */
html = html.replace(/<thead><tr><th class="who" scope="col">Candidate<\/th>[\s\S]*?<\/tr><\/thead>/, () => {
  const ths = DATA.cols.map((col) => {
    const what = col.topics
      ? col.topics.length + " measure" + (col.topics.length > 1 ? "s" : "") + ": " + col.topics.join(" · ")
      : "the applied letter, over all 55 measures";
    return '<th class="ch" scope="col" data-col="' + col.key + '" aria-sort="none">' +
      '<button type="button" class="chs" data-sort="' + col.key + '">' +
      '<abbr title="' + esc(col.label + " — " + what) + '">' + esc(col.short) + "</abbr>" +
      '<span class="sar" aria-hidden="true"></span></button></th>';
  }).join("");
  return '<thead><tr><th class="who" scope="col">Candidate</th>' + ths + "</tr></thead>";
});
html = html.replace(/(<select id="farea"><option value="">)[\s\S]*?(<\/select>)/, (all, a, b) =>
  a + 'All twelve topics</option>' +
  DATA.cols.filter((c) => c.topics).map((c) => '<option value="' + c.key + '">' + esc(c.label) + "</option>").join("") + b);
html = html.replace(/(<select id="fsort">)[\s\S]*?(<\/select>)/, (all, a, b) =>
  a + '<option value="general">Overall letter</option>' +
  '<option value="_name">Candidate name</option>' +
  '<option value="_n">How much is answered</option>' +
  DATA.cols.filter((c) => c.topics).map((c) => '<option value="' + c.key + '">' + esc(c.label) + "</option>").join("") + b);

/* ---- rewrite area-table rows, keeping the Gen cell verbatim ---- */
/* Best first. Ordering the letters is presentation, not scoring — the letters
   themselves are ruled by hand on the Notion table. */
const RANK = { B: 6, "B−": 5, "C+": 4, C: 3, "C−": 2, D: 1 };
function genTd(key) {
  const a = appliedBy[key];
  const mean = a.mean == null ? "" : ", card mean " + a.mean.toFixed(2);
  const base = ' data-col="general" data-n="' + a.n + '" data-total="55" data-rank="' + (RANK[a.letter] || 0) + '"';
  if (!a.letter) {
    return '<td class="cc none"' + base + ' title="' + esc(a.name) +
      " — no letter yet. A letter is ruled from the published rules and needs five answered measures; " +
      a.n + " of 55 answered" + mean + '.">' +
      '<span class="gdash">—</span><span class="cn">' + a.n + "/55</span></td>";
  }
  return '<td class="cc"' + base + ' title="' + esc(a.name) + " — letter " + a.letter +
    ", on " + a.n + " of 55 answered measures" + mean + '">' +
    '<span class="g ' + gradeCls(a.letter) + '">' + esc(a.letter) + "</span>" +
    '<span class="cn">' + a.n + "/55</span></td>";
}
html = html.replace(/<tr id="sc-(\w+)" class="cr"[\s\S]*?<\/tr>/g, (row, key) => {
  const who = row.match(/<td class="who"[\s\S]*?<\/td>/);
  if (!who || !appliedBy[key]) return row;
  const a = appliedBy[key];
  /* The row carries the applied letter's rank and the answered count, because
     the table sorts on these. It used to carry data-mean, and a mean is
     exactly what Decision 14 does not publish. */
  const head = '<tr id="sc-' + key + '" class="cr" data-c="' + key +
    '" data-name="' + esc(a.name.toLowerCase()) +
    '" data-surname="' + esc(a.name.split(" ").slice(-1)[0].toLowerCase()) +
    '" data-office="' + esc(a.office.toLowerCase()) +
    '" data-rank="' + (RANK[a.letter] || 0) + '" data-n="' + a.n + '">';
  const tds = [who[0], genTd(key)];
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
/* Every letter and count on the page must equal the applied table, and no
   letter may exist outside the five Decision 14 allows. */
const ALLOWED = new Set(APPLIED._letters || []);
for (const c of DATA.cands) {
  const a = appliedBy[c.key];
  if (c.grade !== a.letter || c.n !== a.n) {
    console.error("APPLIED DRIFT", c.key, "page:", c.grade, c.n, "applied:", a.letter, a.n);
    process.exit(1);
  }
  if (c.grade != null && !ALLOWED.has(c.grade)) {
    console.error("letter outside Decision 14", c.key, c.grade);
    process.exit(1);
  }
  if (c.grade != null && c.n < FLOOR) {
    console.error("letter below the five-answer floor", c.key, c.grade, c.n);
    process.exit(1);
  }
}
/* No topic column may carry a letter or a mean. */
for (const key of GRID_KEYS) {
  for (const col of DATA.cols) {
    if (col.key === "general") continue;
    const g = DATA.colGrid[key][col.key];
    if (g && (g.grade != null || g.mean != null)) {
      console.error("a topic column carries a grade or mean, which Decision 14 forbids:", key, col.key);
      process.exit(1);
    }
  }
}

const lettered = DATA.cands.filter((c) => c.grade).map((c) => c.name.split(" ").slice(-1)[0] + " " + c.grade + " " + c.n);
console.log("Applied rating cards to scorecard.html");
console.log("  scored card cells :", scoredMarks);
console.log("  topics            :", DATA.cols.filter((c) => c.topics).map((c) => c.short).join(" · "));
console.log("  answers per topic :", filled);
console.log("  letters applied   :", lettered.join(", "));
console.log("  counted, no letter:", DATA.cands.filter((c) => !c.grade && c.n).map((c) => c.name.split(" ").slice(-1)[0] + " " + c.n).join(", "));

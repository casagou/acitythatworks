#!/usr/bin/env node
/* Builds scorecard.html from matrix-v3.js + the extracted evidence store.
   ----------------------------------------------------------------------
   Nothing on the page is hand-copied. Every grade, mean, n and pillar figure
   is recomputed here from the 55x15 grid, then asserted against the figures
   the Notion master publishes. A transcription slip therefore fails the build
   instead of shipping as a wrong number beside a real person's name.

   Two presentation rules are applied on top of the master's arithmetic, both
   answering defects the master itself documents and asks to have fixed before
   publication:

     1. A pillar column containing an Opposed and fewer than 5 scored topics
        shows no letter. Opposed is -2.0 against a positive range of 0.5-3.0,
        so on a 3-4 topic column one recorded vote moves the letter by up to
        four bands. The mean and the marks are still published — only the
        letter is withheld, because a letter is read as a verdict and this one
        cannot carry that weight.
     2. Every pillar grade shows its n, and n<5 is flagged as a thin base.

   Both rules are stated on the page, not applied silently. Usage:
     node build/matrix.js
*/

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const M = require(path.join(ROOT, "matrix-v3.js"));

const EV_PATH = path.join(__dirname, "evidence.json");
const EV = fs.existsSync(EV_PATH) ? JSON.parse(fs.readFileSync(EV_PATH, "utf8")) : {};
/* Scorecard v5.0: the published 15-column grid and, for every scored column
   cell, the marks and quoted evidence behind it. This is what makes a grade
   explainable — a reader opens a cell and sees the sentences, not a number. */
const SC5 = JSON.parse(fs.readFileSync(path.join(__dirname, "sc5.json"), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/* Content strings in matrix-v3.js already carry <strong>/<em>; keep those. */
const rich = (s) => String(s);

const rows = M.GRID.map((r) => r.trim().split(/\s+/));
const C = M.CANDIDATES;
const OPPOSED = -2;
const THIN = 5;

const norm = (s) => s.replace(/\s*\/\s*/g, "/").replace(/[–—]/g, "-").replace(/m/gi, "").replace(/\s+/g, "").toLowerCase();
const evByKey = {};
Object.keys(EV).forEach((k) => { evByKey[norm(k)] = EV[k]; });

function band(mean) {
  for (const b of M.SCALE.bands) if (mean >= b.min) return b.g;
  return "F";
}
function markOf(v) {
  const e = Object.entries(M.SCALE.marks).find(([, m]) => m.value === v);
  return e ? { key: e[0], ...e[1] } : null;
}
function round2(x) { return Math.round(x * 100) / 100; }

/* ---- compute ---------------------------------------------------------- */
const comp = C.map((c, ci) => {
  const cells = [];
  rows.forEach((r, ti) => {
    const raw = r[ci];
    if (raw === ".") return;
    cells.push({ ti, v: parseFloat(raw) });
  });
  const mean = round2(cells.reduce((a, b) => a + b.v, 0) / cells.length);
  const counts = {};
  Object.keys(M.SCALE.marks).forEach((k) => (counts[k] = 0));
  cells.forEach((x) => { counts[markOf(x.v).key]++; });

  const pillars = {};
  M.PILLARS.forEach((p) => {
    const vs = cells.filter((x) => M.TOPICS[x.ti][2] === p.key);
    if (!vs.length) { pillars[p.key] = null; return; }
    const pm = round2(vs.reduce((a, b) => a + b.v, 0) / vs.length);
    const hasOpp = vs.some((x) => x.v === OPPOSED);
    const n = vs.length;
    let letter = null, withheld = null;
    if (n < M.SCALE.floor) withheld = "floor";
    else if (hasOpp && n < THIN) withheld = "opposed";
    else letter = band(pm);
    pillars[p.key] = { mean: pm, n, letter, withheld, thin: n < THIN, hasOpp };
  });
  return { c, ci, cells, mean, counts, pillars };
});

/* ---- assert against the master ---------------------------------------- */
let errs = [];
comp.forEach((x) => {
  if (x.cells.length !== x.c.n) errs.push(x.c.name + " n " + x.cells.length + " vs master " + x.c.n);
  if (Math.abs(x.mean - x.c.mean) > 0.011) errs.push(x.c.name + " mean " + x.mean + " vs master " + x.c.mean);
  if (band(x.c.mean) !== x.c.grade) errs.push(x.c.name + " grade " + band(x.c.mean) + " vs master " + x.c.grade);
  const pub = M.PILLAR_PUBLISHED[x.c.key] || {};
  M.PILLARS.forEach((p) => {
    const got = x.pillars[p.key], exp = pub[p.key];
    if (!got && exp) errs.push(x.c.name + " " + p.key + " computed empty, master has " + JSON.stringify(exp));
    if (got && !exp) errs.push(x.c.name + " " + p.key + " computed n=" + got.n + ", master has none");
    if (got && exp) {
      if (got.n !== exp[1]) errs.push(x.c.name + " " + p.key + " n " + got.n + " vs " + exp[1]);
      if (exp[0] !== null && Math.abs(got.mean - exp[0]) > 0.011) errs.push(x.c.name + " " + p.key + " mean " + got.mean + " vs " + exp[0]);
    }
  });
});
const totalMarks = rows.reduce((a, r) => a + r.filter((v) => v !== ".").length, 0);
if (totalMarks !== M.MATRIX_META.marks) errs.push("grid holds " + totalMarks + " marks, master states " + M.MATRIX_META.marks);

/* ---- column layer (Scorecard v5.0) ------------------------------------ */
const idOf = M.TOPICS.map((t) => t[0]);
/* the 15 columns must use all 55 topics exactly once */
const useCount = {};
M.COLUMNS.filter((c) => !c.all).forEach((c) => c.topics.forEach((t) => {
  const i = idOf.indexOf(t);
  if (i === -1) errs.push("column " + c.key + " names unknown topic " + t);
  else useCount[i] = (useCount[i] || 0) + 1;
}));
idOf.forEach((t, i) => {
  if (!useCount[i]) errs.push("topic " + t + " is in no column");
  else if (useCount[i] > 1) errs.push("topic " + t + " is double-counted across columns");
});

const colGrid = {}; // key -> { colKey -> {grade,n,total,mean,record} }
comp.forEach((x) => {
  const ci = x.ci;
  const per = {};
  M.COLUMNS.forEach((col) => {
    const idxs = col.all ? M.TOPICS.map((_, i) => i) : col.topics.map((t) => idOf.indexOf(t));
    const vals = idxs.map((i) => rows[i][ci]).filter((v) => v !== ".").map(parseFloat);
    const total = col.all ? 55 : col.topics.length;
    if (!vals.length) { per[col.key] = { n: 0, total }; return; }
    const mean = round2(vals.reduce((a, b) => a + b, 0) / vals.length);
    per[col.key] = { grade: band(mean), mean, n: vals.length, total };
  });
  colGrid[x.c.key] = per;
});

/* assert every computed column cell against the published v5.0 grid */
const pubRow = (name) => SC5.grid[name] || SC5.grid["**" + name + "**"];
comp.forEach((x) => {
  const pub = pubRow(x.c.name);
  if (!pub) { errs.push("no published v5.0 row for " + x.c.name); return; }
  M.COLUMNS.forEach((col, k) => {
    const cell = (pub[k] || "").trim();
    const got = colGrid[x.c.key][col.key];
    const m = cell.match(/(A−|A|B\+|B−|B|C\+|C−|C|D|F)\s+(\d+)\/(\d+)/);
    if (!m) {
      /* a Record-only cell publishes 📋 n/total and carries no letter — the
         computed side must agree that nothing here is scored */
      if (/📋/.test(cell)) { if (got.n !== 0) errs.push(x.c.name + "/" + col.short + " published Record but computed n=" + got.n); return; }
      if (got.n !== 0) errs.push(x.c.name + "/" + col.short + " computed n=" + got.n + " but published \"" + cell + "\"");
      return;
    }
    if (got.grade !== m[1]) errs.push(x.c.name + "/" + col.short + " computed " + got.grade + " vs published " + m[1]);
    if (got.n !== +m[2]) errs.push(x.c.name + "/" + col.short + " n " + got.n + " vs published " + m[2]);
    if (got.total !== +m[3]) errs.push(x.c.name + "/" + col.short + " total " + got.total + " vs published " + m[3]);
  });
});
if (errs.length) { console.error("BUILD ABORTED — grid does not reconcile to the master:"); errs.forEach((e) => console.error("  " + e)); process.exit(1); }

/* evidence coverage, reported honestly on the page */
let evHave = 0;
comp.forEach((x) => x.cells.forEach((cell) => { if (sentence(cell.ti, x.c.key)) evHave++; }));

function sentence(ti, ck) {
  const store = evByKey[norm(M.TOPICS[ti][0])];
  if (!store) return null;
  const e = store.ev[ck];
  if (!e) return null;
  const plain = e.text.replace(/<[^>]+>/g, "").trim();
  if (/^(No public position|Not yet published|No information)\.?$/i.test(plain)) return null;
  return e.text;
}

/* ---- render ----------------------------------------------------------- */
const ranked = comp.slice().sort((a, b) => b.c.mean - a.c.mean);

function markBar(counts) {
  const order = ["aligned", "close", "partialPlus", "partial", "weak", "opposed"];
  const tot = order.reduce((a, k) => a + counts[k], 0);
  return '<span class="mkbar" role="img" aria-label="' +
    order.filter((k) => counts[k]).map((k) => counts[k] + " " + M.SCALE.marks[k].label).join(", ") + '">' +
    order.filter((k) => counts[k]).map((k) =>
      '<i class="mk-' + M.SCALE.marks[k].cls + '" style="flex:' + counts[k] + '" title="' + counts[k] + " " + M.SCALE.marks[k].label + '"></i>').join("") +
    "</span>";
}

let overall = ranked.map((x, i) => {
  const c = x.c;
  return '<tr class="ov-r" data-c="' + c.key + '">' +
    '<td class="ov-rk">' + (i + 1) + "</td>" +
    '<td class="ov-nm"><span class="cn-name">' + esc(c.name) + '</span><span class="cn-role">' + esc(c.office) + (c.statusNote ? " · " + esc(c.statusNote) : "") + "</span></td>" +
    '<td class="ov-g"><span class="g ' + gradeCls(c.grade) + '">' + c.grade + "</span></td>" +
    '<td class="ov-mn">' + c.mean.toFixed(2) + "</td>" +
    '<td class="ov-n"><strong>' + c.n + '</strong><span class="of">of 55</span></td>' +
    "<td>" + markBar(x.counts) + "</td>" +
    "</tr>";
}).join("\n");

function gradeCls(g) {
  if (!g) return "x";
  if (g[0] === "A") return "a"; if (g[0] === "B") return "b";
  if (g[0] === "C") return "c"; if (g[0] === "D") return "d";
  return "f";
}

/* pillar table */
let pillarHead = M.PILLARS.map((p) => '<th><span class="pe">' + p.emoji + '</span><span class="pl">' + esc(p.label) + "</span></th>").join("");
let pillarBody = ranked.map((x) => {
  const tds = M.PILLARS.map((p) => {
    const g = x.pillars[p.key];
    if (!g) return '<td class="pc-e">—</td>';
    /* Two different reasons produce no letter, and conflating them would be a
       new opacity of exactly the kind this page exists to remove. Below the
       three-topic floor the master itself shows only n, so we do too. A letter
       withheld because one Opposed dominates a thin column is a decision this
       site made, so it is labelled and explained. */
    if (g.letter === null) {
      if (g.withheld === "floor") {
        return '<td class="pc-f" title="below the three-topic floor"><span class="pn">n=' + g.n + "</span></td>";
      }
      return '<td class="pc-w" title="letter withheld: one Opposed on a base of ' + g.n + ' topics — see defect 1">' +
        '<span class="pw">not graded</span><span class="pn">' + g.mean.toFixed(2) + " · n=" + g.n + "</span></td>";
    }
    return '<td class="pc' + (g.thin ? " thin" : "") + '"><span class="g ' + gradeCls(g.letter) + '">' + g.letter + "</span>" +
      '<span class="pn">' + g.mean.toFixed(2) + " · n=" + g.n + "</span></td>";
  }).join("");
  return "<tr><td class=\"who\">" + esc(x.c.name) + "</td>" + tds + "</tr>";
}).join("\n");

/* ---- the 15-column grid: the reader-facing surface -------------------- */
/* Cell keys map to the justification blocks, whose column labels are the
   master's short names. Matched leniently so a label tweak upstream doesn't
   silently drop a cell's evidence. */
function justFor(name, col) {
  const j = SC5.just[name];
  if (!j) return null;
  const want = (s) => String(s).replace(/\s|&|-/g, "").toLowerCase();
  const k = Object.keys(j.cols).find((x) => want(x) === want(col.short) || want(x) === want(col.label));
  return k ? j.cols[k] : null;
}

let colHead = M.COLUMNS.map((col) =>
  '<th class="ch" title="' + esc(col.label) + '"><abbr title="' + esc(col.label) + ' — ' +
  (col.all ? "all 55 topics" : col.topics.length + " topic" + (col.topics.length > 1 ? "s" : "") + ": " + esc(col.topics.join(" · "))) +
  '">' + esc(col.short) + "</abbr></th>").join("");

let colBody = ranked.map((x) => {
  const tds = M.COLUMNS.map((col) => {
    const g = colGrid[x.c.key][col.key];
    const j = justFor(x.c.name, col);
    if (!g.n) {
      if (j && /📋|Record/.test(j.grade + j.ev)) {
        return '<td class="cc rec" tabindex="0" role="button" data-c="' + x.c.key + '" data-col="' + col.key +
          '" title="Record only — nothing scored">📋<span class="cn">0/' + g.total + "</span></td>";
      }
      return '<td class="cc none">—</td>';
    }
    return '<td class="cc" tabindex="0" role="button" data-c="' + x.c.key + '" data-col="' + col.key + '">' +
      '<span class="g ' + gradeCls(g.grade) + '">' + g.grade + "</span>" +
      '<span class="cn">' + g.n + "/" + g.total + "</span></td>";
  }).join("");
  return '<tr><td class="who">' + esc(x.c.name) + '<span class="wr">' + esc(x.c.office) + "</span></td>" + tds + "</tr>";
}).join("\n");

const warnHtml = SC5.warns.map((w) => "<li>" + w + "</li>").join("\n");

/* master grid */
let gridHead = C.map((c) => '<th class="gh" title="' + esc(c.name) + '"><abbr title="' + esc(c.name) + '">' + c.key + "</abbr></th>").join("");
let gridBody = M.TOPICS.map((t, ti) => {
  const pil = M.PILLARS.find((p) => p.key === t[2]);
  const tds = C.map((c, ci) => {
    const raw = rows[ti][ci];
    if (raw === ".") return '<td class="gc gx">·</td>';
    const v = parseFloat(raw); const mk = markOf(v);
    return '<td class="gc mk-' + mk.cls + '" tabindex="0" role="button" data-t="' + ti + '" data-c="' + c.key + '" data-v="' + v + '">' + (v === -2 ? "−2.0" : v.toFixed(1)) + "</td>";
  }).join("");
  return '<tr><td class="gt"><span class="gm">' + esc(t[0]) + '</span><span class="gd">' + esc(t[1]) + '</span><span class="gp" style="color:var(--navy)">' + pil.emoji + (t[3] === "NEW" ? ' <b class="newt">NEW</b>' : "") + "</span></td>" + tds + "</tr>";
}).join("\n");

/* payload for the detail panel */
const payload = {
  topics: M.TOPICS.map((t) => ({ id: t[0], label: t[1], pillar: t[2], isNew: t[3] === "NEW" })),
  cands: C.map((c) => ({ key: c.key, name: c.name, office: c.office, grade: c.grade, mean: c.mean, n: c.n })),
  marks: M.SCALE.marks,
  grid: rows,
  ev: (() => {
    const o = {};
    M.TOPICS.forEach((t, ti) => {
      C.forEach((c) => {
        const s = sentence(ti, c.key);
        if (s) o[ti + "|" + c.key] = s;
      });
    });
    return o;
  })(),
  actw: (() => {
    const o = {};
    M.TOPICS.forEach((t, ti) => { const st = evByKey[norm(t[0])]; if (st && st.actw) o[ti] = st.actw; });
    return o;
  })(),
  cols: M.COLUMNS.map((c) => ({ key: c.key, label: c.label, short: c.short, topics: c.all ? null : c.topics })),
  warns: SC5.warns,
  colGrid: colGrid,
  /* candidateKey|columnKey -> { grade, ev } straight from the master's
     per-grade justification tables */
  just: (() => {
    const o = {};
    C.forEach((c) => M.COLUMNS.forEach((col) => {
      const j = justFor(c.name, col);
      if (j) o[c.key + "|" + col.key] = j;
    }));
    return o;
  })(),
};

const defectRows = M.DEFECTS[0].table.map((r) => "<tr><td>" + r[0] + '</td><td class="bad">' + r[1] + "</td><td>" + r[2] + "</td></tr>").join("");

const tpl = fs.readFileSync(path.join(__dirname, "scorecard.tpl.html"), "utf8");
const out = tpl
  .replace("<!--OVERALL-->", overall)
  .replace("<!--PILLAR_HEAD-->", pillarHead)
  .replace("<!--PILLAR_BODY-->", pillarBody)
  .replace("<!--GRID_HEAD-->", gridHead)
  .replace("<!--GRID_BODY-->", gridBody)
  .replace("<!--DEFECT_ROWS-->", defectRows)
  .replace("<!--NONSOURCES-->", M.NON_SOURCES.map((s) => "<li><strong>" + s[0] + ".</strong> " + s[1] + "</li>").join("\n"))
  .replace("<!--PLATFORM_STATUS-->", M.PLATFORM_STATUS.map((r) => "<tr><td><strong>" + r[0] + "</strong></td><td>" + rich(r[1]) + "</td><td>" + rich(r[2]) + "</td></tr>").join("\n"))
  .replace("<!--BIAS-->", M.BIAS.map((b) => "<li>" + rich(b) + "</li>").join("\n"))
  .replace("<!--OPEN-->", M.OPEN_ITEMS.map((b) => "<li>" + rich(b) + "</li>").join("\n"))
  .replace("<!--COL_HEAD-->", colHead)
  .replace("<!--COL_BODY-->", colBody)
  .replace("<!--WARNS-->", warnHtml)
  .replace("<!--EVCOV-->", evHave + " of " + M.MATRIX_META.marks)
  .replace(/<!--SCOREDATA-->/, JSON.stringify(payload));

fs.writeFileSync(path.join(ROOT, "scorecard.html"), out, "utf8");
console.log("Built scorecard.html");
console.log("  candidates      :", C.length, "| marks:", totalMarks, "| topics:", M.TOPICS.length);
console.log("  evidence cells  :", evHave, "of", totalMarks, "(" + Math.round(evHave / totalMarks * 100) + "%)");
console.log("  letters withheld:", comp.reduce((a, x) => a + M.PILLARS.filter((p) => x.pillars[p.key] && x.pillars[p.key].withheld === "opposed").length, 0), "pillar cells (Opposed on a thin base)");
console.log("  grid reconciles to the master on every n, mean, grade and pillar figure");
const justCount = Object.keys(payload.just).length;
let scoredColCells = 0;
C.forEach((c) => M.COLUMNS.forEach((col) => { if (!col.all && colGrid[c.key][col.key].n) scoredColCells++; }));
console.log("  15-column grid  : verified against the published v5.0 grid, cell by cell");
console.log("  justifications  :", justCount, "column cells carry their marks and evidence (" + scoredColCells + " scored)");

#!/usr/bin/env node
/* Builds scorecard.html from matrix-v3.js + the extracted evidence store.
   ----------------------------------------------------------------------
   Nothing on the page is hand-copied. Every grade, mean, n and pillar figure
   is recomputed here from the 55x15 grid, then asserted against the figures
   the Notion master publishes. A transcription slip therefore fails the build
   instead of shipping as a wrong number beside a real person's name.

   One presentation rule is applied on top of the master's arithmetic, and it
   is the master's own rule 3 carried down to the reader-facing columns:

     Below three scored topics, no letter is printed — in the fifteen-area
     grid and in the pillar table alike. The cell reports the marks it holds
     and their mean instead. A single mark needs no averaging, and a letter
     computed from one mark is read as a verdict on a portfolio.

   Every grade printed shows its n. The rule is stated on the page, not
   applied silently.

   Earlier versions of this file also withheld a letter wherever a thin column
   contained an Opposed, because Opposed at -2.0 could move a letter four
   bands on its own. v3.2 moved Opposed to -1.0 upstream, which fixes the
   asymmetry at source, so that local workaround is gone.

   Usage: node build/matrix.js
*/

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const M = require(path.join(ROOT, "matrix-v3.js"));

const EV_PATH = path.join(__dirname, "evidence.json");
const EV = fs.existsSync(EV_PATH) ? JSON.parse(fs.readFileSync(EV_PATH, "utf8")) : {};
/* Scorecard v5.1: the published 15-column grid and, for every scored column
   cell, the marks and quoted evidence behind it. This is what makes a grade
   explainable — a reader opens a cell and sees the sentences, not a number.
   The grid here is assertion material only: every letter, n, total and mean
   the page displays is recomputed from matrix-v3.js and checked against it. */
const SC5 = JSON.parse(fs.readFileSync(path.join(__dirname, "sc5.json"), "utf8"));

/* The profile anchors, read from the same master build/profiles.js builds
   profiles.html from. A candidate's name links to their profile wherever it is
   written out in full, and a link is only safe if the anchor is really there —
   so the id is looked up rather than derived and trusted. A name that drifts
   on either side fails the build instead of shipping a link to nowhere. */
const PROF_PATH = path.join(__dirname, "profiles.md");
const PROFILE_IDS = fs.existsSync(PROF_PATH)
  ? new Set(Array.from(fs.readFileSync(PROF_PATH, "utf8")
      .matchAll(/^\*\*ID[:.]\*\*\s*(cand-[a-z0-9-]+)\s*$/gm), (m) => m[1]))
  : null;
const profSlug = (n) => "cand-" + n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
function profileHref(name) {
  if (!PROFILE_IDS) return null;
  const id = profSlug(name);
  return PROFILE_IDS.has(id) ? "profiles.html#" + id : null;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/* The name, linked to its profile. The master grid heads its columns with
   two-letter keys rather than names, so it is exempt by construction. */
function nameLink(name, cls) {
  const href = profileHref(name);
  if (!href) return cls ? '<span class="' + cls + '">' + esc(name) + "</span>" : esc(name);
  return '<a class="' + (cls ? cls + " " : "") + 'plink" href="' + href +
    '" title="' + esc(name) + " — full profile\">" + esc(name) + "</a>";
}
/* Content strings in matrix-v3.js already carry <strong>/<em>; keep those. */
const rich = (s) => String(s);

const rows = M.GRID.map((r) => r.trim().split(/\s+/));
const C = M.CANDIDATES;
const FLOOR = M.SCALE.floor;   // below this many scored topics, no letter
const THIN = 5;                // at or below this, the base is flagged as thin
/* "." is silence, "R" is a documented Record. Neither is scored; only the
   second is worth showing, so the two are kept apart all the way through. */
const isScored = (raw) => raw !== "." && raw !== "R";

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
/* A real minus sign, not a hyphen — three Housing cells publish a negative
   mean and they should not be the only numbers on the page set in ASCII. */
function num2(x) { return (x < 0 ? "−" : "") + Math.abs(x).toFixed(2); }

/* ---- compute ---------------------------------------------------------- */
const comp = C.map((c, ci) => {
  const cells = [];
  let records = 0;
  rows.forEach((r, ti) => {
    const raw = r[ci];
    if (raw === "R") { records++; return; }
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
    const n = vs.length;
    pillars[p.key] = {
      mean: pm, n,
      letter: n < FLOOR ? null : band(pm),
      thin: n < THIN,
      hasOpp: vs.some((x) => x.v === M.SCALE.marks.opposed.value),
    };
  });
  return { c, ci, cells, records, mean, counts, pillars };
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
      /* The master publishes the letter, not the mean, so the letter is what
         gets checked — asserting a mean copied out of the same arithmetic
         would prove nothing. Below the floor the master prints ·, and so
         must we. */
      if (exp[0] === null && got.n >= FLOOR) errs.push(x.c.name + " " + p.key + " master shows · but n=" + got.n);
      if (exp[0] !== null && band(got.mean) !== exp[0]) errs.push(x.c.name + " " + p.key + " letter " + band(got.mean) + " (mean " + got.mean + ") vs master " + exp[0]);
    }
  });
});
const totalMarks = rows.reduce((a, r) => a + r.filter(isScored).length, 0);
if (totalMarks !== M.MATRIX_META.marks) errs.push("grid holds " + totalMarks + " marks, master states " + M.MATRIX_META.marks);
const totalRecords = rows.reduce((a, r) => a + r.filter((v) => v === "R").length, 0);
if (totalRecords !== M.MATRIX_META.record) errs.push("grid holds " + totalRecords + " Record cells, master states " + M.MATRIX_META.record);
if (PROFILE_IDS) {
  C.forEach((c) => {
    if (!profileHref(c.name)) {
      errs.push(c.name + " has no profile in build/profiles.md — expected the anchor " + profSlug(c.name));
    }
  });
}

/* ---- column layer (Scorecard v5.1) ------------------------------------ */
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

/* One cell of the reader-facing grid. Four states, kept distinct because
   collapsing any two of them would hide the thing this page exists to show:
     graded   n >= 3, a letter and the mean behind it
     marks    1 or 2 scored topics — the mean is published, the letter is not
     record   nothing scored, but a documented 2022-2026 record exists (📋)
     empty    nothing at all */
const colGrid = {}; // candKey -> { colKey -> cell }
comp.forEach((x) => {
  const ci = x.ci;
  const per = {};
  M.COLUMNS.forEach((col) => {
    const idxs = col.all ? M.TOPICS.map((_, i) => i) : col.topics.map((t) => idOf.indexOf(t));
    const raw = idxs.map((i) => rows[i][ci]);
    const vals = raw.filter(isScored).map(parseFloat);
    const record = raw.filter((v) => v === "R").length;
    const total = col.all ? M.TOPICS.length : col.topics.length;
    if (!vals.length) { per[col.key] = { state: record ? "record" : "empty", n: 0, record, total }; return; }
    const mean = round2(vals.reduce((a, b) => a + b, 0) / vals.length);
    per[col.key] = {
      state: vals.length < FLOOR ? "marks" : "graded",
      grade: vals.length < FLOOR ? null : band(mean),
      mean, n: vals.length, record, total,
      thin: vals.length < THIN,
      hasOpp: vals.some((v) => v === M.SCALE.marks.opposed.value),
    };
  });
  colGrid[x.c.key] = per;
});

/* Assert every computed column cell against the published v5.1 grid. The
   master prints "B 4/6 (2.00)" when it has a letter, "· 1/6 (−1.00)" below
   the three-topic floor, 📋 for record-only and — for empty, so all four
   states are checkable and all four are checked. */
const pubRow = (name) => SC5.grid[name] || SC5.grid["**" + name + "**"];
comp.forEach((x) => {
  const pub = pubRow(x.c.name);
  if (!pub) { errs.push("no published v5.1 row for " + x.c.name); return; }
  M.COLUMNS.forEach((col, k) => {
    const cell = (pub[k] || "").trim();
    const got = colGrid[x.c.key][col.key];
    const where = x.c.name + "/" + col.short;
    const m = cell.match(/^(A−|A|B\+|B−|B|C\+|C−|C|D|F|·)\s+(\d+)\/(\d+)\s+\((−?[\d.]+)\)/);
    if (!m) {
      if (/📋/.test(cell)) {
        if (got.state !== "record") errs.push(where + " published Record but computed " + got.state + " (n=" + got.n + ")");
      } else if (/^—/.test(cell)) {
        if (got.state !== "empty") errs.push(where + " published — but computed " + got.state + " (n=" + got.n + ")");
      } else {
        errs.push(where + " published cell not understood: \"" + cell + "\"");
      }
      return;
    }
    const n = +m[2], total = +m[3], mean = parseFloat(m[4].replace("−", "-"));
    if (got.n !== n) errs.push(where + " n " + got.n + " vs published " + n);
    if (got.total !== total) errs.push(where + " total " + got.total + " vs published " + total);
    if (Math.abs(got.mean - mean) > 0.011) errs.push(where + " mean " + got.mean + " vs published " + mean);
    if (m[1] === "·") {
      if (got.state !== "marks") errs.push(where + " published · but computed a letter on n=" + got.n);
    } else if (got.grade !== m[1]) {
      errs.push(where + " computed " + got.grade + " vs published " + m[1]);
    }
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
    '<td class="ov-nm">' + nameLink(c.name, "cn-name") + '<span class="cn-role">' + esc(c.office) + (c.statusNote ? " · " + esc(c.statusNote) : "") + "</span></td>" +
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
      return '<td class="pc-f" title="' + g.n + ' scored topic' + (g.n > 1 ? "s" : "") +
        ' — below the three-topic floor, so the marks are shown instead of a letter">' +
        '<span class="pw">' + num2(g.mean) + '</span><span class="pn">n=' + g.n + "</span></td>";
    }
    return '<td class="pc' + (g.thin ? " thin" : "") + '"><span class="g ' + gradeCls(g.letter) + '">' + g.letter + "</span>" +
      '<span class="pn">' + num2(g.mean) + " · n=" + g.n + "</span></td>";
  }).join("");
  return '<tr><td class="who">' + nameLink(x.c.name) + "</td>" + tds + "</tr>";
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

/* Column headings double as sort controls. The <abbr> title carries the full
   area name and the topics feeding it, so hovering answers "what is in this
   column?" without a trip to the methodology section. */
let colHead = M.COLUMNS.map((col) => {
  const what = col.all
    ? "all " + M.TOPICS.length + " topics"
    : col.topics.length + " topic" + (col.topics.length > 1 ? "s" : "") + ": " + col.topics.join(" · ");
  return '<th class="ch" data-col="' + col.key + '" aria-sort="none">' +
    '<button type="button" class="chs" data-sort="' + col.key + '">' +
    '<abbr title="' + esc(col.label + " — " + what) + '">' + esc(col.short) + "</abbr>" +
    '<span class="sar" aria-hidden="true"></span></button></th>';
}).join("");

/* One cell. Every state carries the numbers a reader needs to sort and filter
   on, in data- attributes, so the client script never has to re-parse text it
   would then have to keep in step with the markup. */
function cellHtml(ck, col, g) {
  const base = ' data-col="' + col.key + '" data-n="' + g.n + '" data-mean="' + (g.n ? g.mean : "") + '"';
  if (g.state === "record") {
    return '<td class="cc rec" tabindex="0" role="button" data-c="' + ck + '"' + base +
      ' title="Record only — a documented term in office, never scored">📋<span class="cn">0/' + g.total + "</span></td>";
  }
  if (g.state === "empty") return '<td class="cc none"' + base + ">—</td>";
  if (g.state === "marks") {
    /* 1 or 2 scored topics. The master's rule 3: report the marks, not a
       letter, because there is nothing to average and a letter would be read
       as a verdict on the whole area. */
    return '<td class="cc few" tabindex="0" role="button" data-c="' + ck + '"' + base +
      ' title="' + g.n + ' scored topic' + (g.n > 1 ? "s" : "") + ' of ' + g.total +
      ' — below the three-topic floor, so no letter is printed">' +
      '<span class="few-m">' + num2(g.mean) + "</span>" +
      '<span class="cn">' + g.n + "/" + g.total + "</span></td>";
  }
  return '<td class="cc" tabindex="0" role="button" data-c="' + ck + '"' + base + '>' +
    '<span class="g ' + gradeCls(g.grade) + '">' + g.grade + "</span>" +
    '<span class="cn">' + g.n + "/" + g.total + "</span></td>";
}

let colBody = ranked.map((x) => {
  const c = x.c;
  const tds = M.COLUMNS.map((col) => cellHtml(c.key, col, colGrid[c.key][col.key])).join("");
  const surname = c.name.split(" ").slice(-1)[0];
  /* The tick box is its own label rather than wrapping the name, because the
     name is now a link to that candidate's profile: a label around it would
     both navigate and toggle on one click. Row id sc-<key> is what a profile
     links back to, so it lands on the candidate's row rather than the top of
     the section. */
  return '<tr id="sc-' + c.key + '" class="cr" data-c="' + c.key + '" data-name="' + esc(c.name.toLowerCase()) +
    '" data-surname="' + esc(surname.toLowerCase()) + '" data-office="' + esc(c.office.toLowerCase()) +
    '" data-mean="' + c.mean + '" data-n="' + c.n + '">' +
    '<td class="who"><div class="whorow">' +
    '<label class="pick"><input type="checkbox" class="pickbox" aria-label="Compare ' + esc(c.name) + '"></label>' +
    '<span class="whon">' + nameLink(c.name) + '<span class="wr">' + esc(c.office) + "</span></span>" +
    "</div></td>" + tds + "</tr>";
}).join("\n");

/* Area filter options, so the reader can pull the table down to one area. */
const areaOpts = M.COLUMNS.map((col) =>
  '<option value="' + col.key + '">' + esc(col.label) + "</option>").join("");

const warnHtml = SC5.warns.map((w) =>
  '<li' + (w.c ? ' data-c="' + w.c + '"' : "") + (w.col ? ' data-col="' + w.col + '"' : "") + ">" + w.html + "</li>").join("\n");

/* master grid */
let gridHead = C.map((c) => '<th class="gh" title="' + esc(c.name) + '"><abbr title="' + esc(c.name) + '">' + c.key + "</abbr></th>").join("");
let gridBody = M.TOPICS.map((t, ti) => {
  const pil = M.PILLARS.find((p) => p.key === t[2]);
  const tds = C.map((c, ci) => {
    const raw = rows[ti][ci];
    if (raw === ".") return '<td class="gc gx" title="No public position located">·</td>';
    /* Record is excluded from every mean but it is not silence, and showing
       the two the same way would hide a four-year record behind a dot. */
    if (raw === "R") return '<td class="gc grec" title="Record — a documented fact about the term in office, never scored">📋</td>';
    const v = parseFloat(raw); const mk = markOf(v);
    return '<td class="gc mk-' + mk.cls + '" tabindex="0" role="button" data-t="' + ti + '" data-c="' + c.key + '" data-v="' + v + '">' +
      (v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "</td>";
  }).join("");
  return '<tr><td class="gt"><span class="gm">' + esc(t[0]) + '</span><span class="gd">' + esc(t[1]) + '</span><span class="gp" style="color:var(--navy)">' + pil.emoji + (t[3] === "NEW" ? ' <b class="newt">NEW</b>' : "") + "</span></td>" + tds + "</tr>";
}).join("\n");

/* payload for the detail panel */
const payload = {
  topics: M.TOPICS.map((t) => ({ id: t[0], label: t[1], pillar: t[2], isNew: t[3] === "NEW" })),
  cands: C.map((c) => ({ key: c.key, name: c.name, office: c.office, grade: c.grade, mean: c.mean, n: c.n, profile: profileHref(c.name) })),
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
  /* Each caveat names the cell it qualifies, so the detail panel can look one
     up by key instead of guessing from a substring match on the prose. */
  warns: SC5.warns,
  colGrid: colGrid,
  floor: FLOOR,
  nmarks: M.MATRIX_META.marks,
  opposed: M.SCALE.marks.opposed.value,
  /* candidateKey|columnKey -> { ev } straight from the master's per-grade
     justification tables. The grade itself is never carried here — it is
     computed above, and two copies of a number is one too many. */
  just: (() => {
    const o = {};
    C.forEach((c) => M.COLUMNS.forEach((col) => {
      const j = justFor(c.name, col);
      if (j) o[c.key + "|" + col.key] = j;
    }));
    return o;
  })(),
};

/* Defect 1's table is the four weightings costed on the real data before one
   was chosen. Column 2 is the option that was adopted, so it is marked as
   such rather than left for the reader to infer from the prose. */
const defectHead = M.DEFECTS[0].tableHead
  .map((h, i) => "<th" + (i === 2 ? ' class="chosen"' : "") + ">" + h + "</th>").join("");
const defectRows = M.DEFECTS[0].table.map((r) =>
  "<tr>" + r.map((v, i) => (i === 0 ? "<td>" + v + "</td>"
    : '<td class="' + (i === 2 ? "chosen" : "alt") + '">' + v + "</td>")).join("") + "</tr>").join("");

/* The Q1 x Q2 table is generated rather than written out, so the published
   scale and the scale the grades were computed on cannot drift apart — which
   is exactly what happened when Opposed moved to −1.0 and a hand-written
   table still said −2.0. */
const scaleHead = M.SCALE.q2.map((q) => "<th>" + esc(q.label) + "</th>").join("");
const scaleRows = M.SCALE.q1.map((q1) =>
  "<tr><td>" + esc(q1.label) + "</td>" + M.SCALE.q2.map((q2) => {
    const cell = M.SCALE.cells[q1.key][q2.key];
    if (cell === "up") return "<td>resolves up</td>";
    const mk = M.SCALE.marks[cell];
    return "<td>" + esc(mk.label) + " " + (mk.value < 0 ? "−" : "") + Math.abs(mk.value).toFixed(1) + "</td>";
  }).join("") + "</tr>").join("\n");

const tpl = fs.readFileSync(path.join(__dirname, "scorecard.tpl.html"), "utf8");
const out = tpl
  .replace("<!--OVERALL-->", overall)
  .replace("<!--PILLAR_HEAD-->", pillarHead)
  .replace("<!--PILLAR_BODY-->", pillarBody)
  .replace("<!--GRID_HEAD-->", gridHead)
  .replace("<!--GRID_BODY-->", gridBody)
  .replace("<!--SCALE_HEAD-->", scaleHead)
  .replace("<!--SCALE_ROWS-->", scaleRows)
  .replace("<!--DEFECT_HEAD-->", defectHead)
  .replace("<!--DEFECT_ROWS-->", defectRows)
  .replace("<!--NONSOURCES-->", M.NON_SOURCES.map((s) => "<li><strong>" + s[0] + ".</strong> " + s[1] + "</li>").join("\n"))
  .replace("<!--PLATFORM_STATUS-->", M.PLATFORM_STATUS.map((r) => "<tr><td><strong>" + r[0] + "</strong></td><td>" + rich(r[1]) + "</td><td>" + rich(r[2]) + "</td></tr>").join("\n"))
  .replace("<!--BIAS-->", M.BIAS.map((b) => "<li>" + rich(b) + "</li>").join("\n"))
  .replace("<!--OPEN-->", M.OPEN_ITEMS.map((b) => "<li>" + rich(b) + "</li>").join("\n"))
  .replace("<!--COL_HEAD-->", colHead)
  .replace("<!--COL_BODY-->", colBody)
  /* Two lists share these options — the focus picker and the sort picker. */
  .replace(/<!--AREA_OPTS-->/g, areaOpts)
  .replace("<!--WARNS-->", warnHtml)
  .replace("<!--EVCOV-->", evHave + " of " + M.MATRIX_META.marks)
  .replace(/<!--MARKS-->/g, String(M.MATRIX_META.marks))
  .replace(/<!--MVER-->/g, M.MATRIX_META.version)
  .replace(/<!--MDATE-->/g, M.MATRIX_META.date)
  .replace(/<!--SCVER-->/g, M.MATRIX_META.scorecard)
  .replace(/<!--SCDATE-->/g, M.MATRIX_META.scorecardDate)
  .replace(/<!--NCAND-->/g, String(C.length))
  .replace(/<!--SCOREDATA-->/, JSON.stringify(payload));

if (/<!--[A-Z_]+-->/.test(out)) {
  console.error("BUILD ABORTED — unreplaced template markers:", out.match(/<!--[A-Z_]+-->/g).join(", "));
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, "scorecard.html"), out, "utf8");

let noLetter = 0, graded = 0, recordCells = 0;
C.forEach((c) => M.COLUMNS.forEach((col) => {
  const g = colGrid[c.key][col.key];
  if (g.state === "marks") noLetter++;
  else if (g.state === "graded") graded++;
  else if (g.state === "record") recordCells++;
}));
console.log("Built scorecard.html");
console.log("  candidates      :", C.length, "| scored marks:", totalMarks, "| Record:", totalRecords, "| topics:", M.TOPICS.length);
console.log("  evidence cells  :", evHave, "of", totalMarks, "(" + Math.round(evHave / totalMarks * 100) + "%)");
console.log("  reconciliation  : every candidate mean, n and grade, and every pillar letter, matches Grade Breakdown v" + M.MATRIX_META.version);
console.log("  15-area grid    : verified cell by cell against published Scorecard v" + SC5.version + " — " +
  graded + " lettered, " + noLetter + " below the three-topic floor, " + recordCells + " Record-only");
console.log("  justifications  :", Object.keys(payload.just).length, "area cells carry their marks and evidence");
console.log("  profile links   :", PROFILE_IDS
  ? C.filter((c) => profileHref(c.name)).length + " of " + C.length + " names link to profiles.html"
  : "none — build/profiles.md is absent, so no name is linked");

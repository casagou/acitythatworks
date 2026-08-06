#!/usr/bin/env node
/* Extracts build/evidence.json from comparison.html.
   ----------------------------------------------------------------------
   comparison.html is the evidence store: 50 topic tables, each one row per
   candidate, each row carrying the sentence the mark rests on. The scorecard's
   detail panels want those same sentences — a reader who opens a grade should
   see what it rests on without being sent to a second page — so rather than
   maintain the prose twice, this pulls it out of the page that already holds it.

   Before this existed, build/evidence.json was a hand-made partial: 15 of the
   50 tables, extracted once and never finished, which is why two thirds of the
   grid's marks had no sentence behind them and every General cell said
   "no per-mark breakdown published".

   Keyed by matrix-v3.js topic id, not by the comparison heading, because the
   two disagree in nine places: the master grid splits some clusters the
   evidence store keeps together (M65 and M66 are two topics against one
   table). Those are named in TABLE_MAP below and the sharing is recorded on
   each entry, so the scorecard can say the sentence covers the group rather
   than silently presenting one table as if it were about one topic.

   The symbol column is carried through but never drives anything: it is the
   older ✅/🟢/🟡/❌/⚪ scale, and the numeric mark the scorecard prints comes
   from matrix-v3.js. Two scales, one of them decorative — the text is the
   part both agree on.

   Usage: node build/evidence.js   (then node build/matrix.js) */

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const M = require(path.join(ROOT, "matrix-v3.js"));

/* Comparison heading -> the matrix topic ids it supplies. Only the nine
   disagreements are listed; everything else matches on its own id. */
const TABLE_MAP = {
  "M19 / M22 / M38–42b": ["M19/M22/M38–M42b"],
  "M43–M46 / M46b": ["M43–M46b"],
  "M65 / M66": ["M65", "M66"],
  "M66b / M66c / M66d": ["M66b/M66c", "M66d"],
  "M68 / M69 / M70": ["M68", "M69"],
  "M70b": ["M70/M70b"],
  "M71 / M72 / M72b / M73 / M73b / M73c / M73d": ["M71–M73d"],
  "M79 / M79b / M79c–f": ["M79/M79b", "M79c–f"],
  "M80 / M80b / M80c / M82 / M82b": ["M80/M80b/M80c", "M82/M82b"],
};

/* Row labels carry an office prefix that changes between drafts ("Cllr." today,
   "Cand." after a resignation), so the surname is what gets matched and the
   full name is the tie-break. Four candidates share a single row in the
   evidence store and are not graded, so they resolve to nothing and are
   dropped. */
const byName = {};
M.CANDIDATES.forEach((c) => {
  byName[c.name.toLowerCase()] = c.key;
});
function candKey(who) {
  const plain = who.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
  const name = plain.replace(/^(Mayor|Cllr\.|Cand\.|Councillor)\s+/i, "").trim();
  if (byName[name.toLowerCase()]) return byName[name.toLowerCase()];
  /* a joint row ("Garcia · Gibbs · Girard · Haley") is not one candidate */
  if (/·/.test(name)) return null;
  return null;
}

const norm = (s) => String(s).replace(/\s*\/\s*/g, "/").replace(/[–—]/g, "-")
  .replace(/\s+/g, "").toLowerCase();

const html = fs.readFileSync(path.join(ROOT, "comparison.html"), "utf8");

/* The store's own vintage, read off the page rather than typed here. The
   scorecard prints it beside every sentence it borrows, because the grid is
   reconciled to a later master and the two can disagree — and a reader who can
   see both dates can see which one governs. */
const stamp = html.match(/<div class="eyb">[\s\S]*?v(\d+(?:\.\d+)*)\s*·\s*([^<]+?)\s*<\/a>/);
if (!stamp) { console.error("BUILD ABORTED — comparison.html carries no version stamp"); process.exit(1); }
const META = { version: stamp[1], date: stamp[2].trim() };

/* Each block runs from a topic heading to the end of its table. Anything
   between them that is not a row of the table is ignored. */
const blocks = Array.from(html.matchAll(
  /<h3 class="topic"[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)<\/tbody>/g));

const store = {};
const seen = {};
let tables = 0, rowsRead = 0, dropped = 0;
const warn = [];

blocks.forEach((b) => {
  const headRaw = b[1];
  /* The heading carries a difficulty badge and a version note; neither is
     part of the topic's name. */
  const head = headRaw.replace(/<span[\s\S]*?<\/span>/g, "")
    .replace(/<em>[\s\S]*?<\/em>/g, "")
    .replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const code = head.split("·")[0].trim();
  const body = b[2];
  tables++;

  const what = (body.match(/<p class="topic-what">([\s\S]*?)<\/p>/) || [])[1] || "";
  const actw = (body.match(/<tr class="actw">[\s\S]*?<td class="mk">[^<]*<\/td><td>([\s\S]*?)<\/td>/) || [])[1] || "";
  const record = (body.match(/<tr class="rec">[\s\S]*?<td class="mk">[^<]*<\/td><td>([\s\S]*?)<\/td>/) || [])[1] || "";

  const ev = {};
  Array.from(body.matchAll(
    /<tr(?: class="(?:actw|rec)")?>\s*<td class="who">([\s\S]*?)<\/td>\s*<td class="mk">([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/g)
  ).forEach((r) => {
    rowsRead++;
    const k = candKey(r[1]);
    if (!k) { dropped++; return; }
    ev[k] = { symbol: r[2].trim(), text: r[3].trim() };
  });

  /* Which master topics this table speaks for. */
  const targets = TABLE_MAP[code] || M.TOPICS.filter((t) => norm(t.id) === norm(code)).map((t) => t.id);
  if (!targets.length) { warn.push('table "' + code + '" matches no topic in matrix-v3.js'); return; }

  targets.forEach((id) => {
    if (store[id]) { warn.push("topic " + id + " is claimed by two tables"); return; }
    store[id] = {
      head: head,
      table: code,
      /* Named only when one table stands behind more than one master topic, so
         the scorecard can say so instead of implying a per-topic sentence. */
      shared: targets.length > 1 ? code : null,
      actw: actw.replace(/\s+/g, " ").trim(),
      record: record.replace(/\s+/g, " ").trim() || null,
      what: what.replace(/<span class="tw-l">[\s\S]*?<\/span>/, "")
        .replace(/<span class="tw-src">[\s\S]*?<\/span>/, "")
        .replace(/\s+/g, " ").trim(),
      ev: ev,
    };
    seen[id] = true;
  });
});

const missing = M.TOPICS.filter((t) => !store[t.id]).map((t) => t.id);
if (missing.length) warn.push("no evidence table found for: " + missing.join(", "));

/* Sorted into master order so the file diffs cleanly against the grid.
   "_meta" leads, and the underscore keeps it out of the topic namespace. */
const out = { _meta: META };
M.TOPICS.forEach((t) => { if (store[t.id]) out[t.id] = store[t.id]; });

fs.writeFileSync(path.join(__dirname, "evidence.json"), JSON.stringify(out, null, 1) + "\n", "utf8");

let cells = 0, topics = 0;
Object.keys(out).forEach((k) => { if (out[k].ev) { topics++; cells += Object.keys(out[k].ev).length; } });
console.log("Extracted build/evidence.json from comparison.html v" + META.version + " · " + META.date);
console.log("  tables read     :", tables, "| topics covered:", topics, "of", M.TOPICS.length);
console.log("  candidate rows  :", rowsRead, "read,", dropped, "dropped (not one of the " + M.CANDIDATES.length + " graded candidates)");
console.log("  evidence cells  :", cells);
if (warn.length) { console.log("  warnings:"); warn.forEach((w) => console.log("    " + w)); }

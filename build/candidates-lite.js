#!/usr/bin/env node
/* Writes candidates-lite.json: the handful of figures the home page's
   "Where the candidates stand" strip needs, read from the payload that ships
   inside scorecard.html — the same payload the hub and the grid render from.
   Nothing is computed here. The grade, mean and n are copied; "answered" is
   the count of the five doors that hold a sourced sentence, a record or a
   published program. Candidate web links come from build/profiles.md, the
   same master the profiles are built from, so the "ask" sheet can point at
   a campaign site without anyone typing one in twice.

   Run after scorecard.html changes:  node build/candidates-lite.js */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const page = fs.readFileSync(path.join(ROOT, "scorecard.html"), "utf8");
const m = page.match(/<script id="scdata" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.error("candidates-lite: no #scdata payload in scorecard.html"); process.exit(1); }
const DATA = JSON.parse(m[1]);
const rows = (DATA.door && DATA.door.rows) || [];
const cells = (DATA.door && DATA.door.cells) || {};

/* Web links, keyed by profile anchor, from the master. */
const web = {};
const md = fs.existsSync(path.join(__dirname, "profiles.md")) ? fs.readFileSync(path.join(__dirname, "profiles.md"), "utf8") : "";
let cur = null;
md.split(/\r?\n/).forEach((line) => {
  const id = line.match(/\*\*ID[:.]\*\*\s*(cand-[a-z0-9-]+)/);
  if (id) { cur = id[1]; return; }
  const w = line.match(/\*\*Web[^*]*\*\*[:.]?\s*(.+)$/i);
  if (w && cur) {
    const first = w[1].match(/\((https?:\/\/[^)\s]+)\)/);
    if (first && !web[cur]) web[cur] = first[1];
  }
});

const SLUG_TO_ID = {
  alto: "cand-marianne-alto", harris: "cand-mike-harris", mcguigan: "cand-bruce-mcguigan",
  mcinnis: "cand-arthur-mcinnis", garcia: "cand-jerry-garcia", gardiner: "cand-marg-gardiner",
  hammond: "cand-stephen-hammond", caradonna: "cand-jeremy-caradonna", dell: "cand-matt-dell",
  thompson: "cand-dave-thompson", kim: "cand-susan-kim", loughton: "cand-krista-loughton",
  cseszko: "cand-melissa-cseszko", rothe: "cand-karen-rothe", bowkett: "cand-wendy-bowkett",
  lee: "cand-bella-lee", sandor: "cand-jack-sandor", girard: "cand-martin-girard",
  gibbs: "cand-peter-gibbs", dion: "cand-shona-dion",
};
/* Notion 1 Sep 2026 campaign URLs — pin over the July master when they differ. */
const WEB_PIN = {
  Al: "https://altomayor.ca",
  Hr: "https://www.mike4victoria.ca/",
  Mg: "https://bruceformayor.ca/",
  Gg: "https://jerryforvictoria.ca/",
  Gi: "https://martingirardforvictoriacouncil.ca/",
  Di: "https://www.shonadion4victoria.ca/",
  Gb: "https://www.victoriaforall.ca/about",
};
function profileId(p) {
  if (!p) return null;
  const s = String(p);
  const hash = s.replace(/^.*#/, "");
  if (hash.indexOf("cand-") === 0) return hash;
  const slug = s.replace(/^.*\/profiles\//, "").replace(/\.html$/, "");
  return SLUG_TO_ID[slug] || null;
}

function answered(c) {
  let n = 0;
  rows.forEach((r) => {
    const st = ((cells[c.key] || {})[r.key] || {}).state || "dash";
    if (["said", "said+record", "record", "yes", "published"].indexOf(st) > -1) n++;
  });
  return n;
}
function gradeCls(g) { if (!g) return "x"; const c = g[0].toLowerCase(); return "abcdf".indexOf(c) > -1 ? c : "x"; }

const stamp = (page.match(/data-doc-versions="([^"]*)"/) || [])[1] || "";
const out = {
  date: stamp,
  doors: rows.length,
  cands: DATA.cands.map((c) => ({
    key: c.key, name: c.name, office: c.office,
    grade: c.grade || null, gradeCls: gradeCls(c.grade), mean: c.mean == null ? null : c.mean, n: c.n || 0,
    answered: answered(c),
    profile: c.profile || null,
    web: WEB_PIN[c.key] || (profileId(c.profile) ? (web[profileId(c.profile)] || null) : null),
  })),
};
fs.writeFileSync(path.join(ROOT, "candidates-lite.json"), JSON.stringify(out));
console.log("candidates-lite.json:", out.cands.length, "candidates,", out.cands.filter((c) => c.answered).length, "with a written answer,", out.cands.filter((c) => c.web).length, "with a web link");

#!/usr/bin/env node
/* Rebuilds the Candidate Profiles section of comparison.html from the Notion
   master (build/profiles.md).
   ----------------------------------------------------------------------
   The master's profiles are structured — ID, evidence vintage, socials,
   sources, mark tallies, an accountability block, what is still unscored, and
   what would move the grade — so they are parsed rather than retyped. Each
   profile is joined to that candidate's v3.0 grade from matrix-v3.js, so a
   reader who opens a profile sees the grade, the base it rests on, and a link
   into the scorecard cell that explains it.

   The section is replaced between the <h2 id="candidate-profiles"> heading and
   the next <h2>, so the surrounding page is untouched.

   Usage: node build/profiles.js */

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const M = require(path.join(ROOT, "matrix-v3.js"));

const md = fs.readFileSync(path.join(__dirname, "profiles.md"), "utf8").split("\n");

const unesc = (s) => s.replace(/\\(.)/g, "$1");
function rich(s) {
  s = unesc(s).trim();
  s = s.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (m, txt, url) =>
    '\x05a href="' + url + '" target="_blank" rel="noopener"\x06' + txt + "\x05/a\x06");
  s = s.replace(/&/g, "&amp;");
  s = s.replace(/\*\*(.+?)\*\*/g, (m, x) => "\x01" + x + "\x02");
  s = s.replace(/(?<![*\w])\*([^*]+?)\*(?!\*)/g, (m, x) => "\x03" + x + "\x04");
  s = s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return s.replace(/\x01/g, "<strong>").replace(/\x02/g, "</strong>")
    .replace(/\x03/g, "<em>").replace(/\x04/g, "</em>")
    .replace(/\x05/g, "<").replace(/\x06/g, ">");
}

/* ---- parse ------------------------------------------------------------ */
const profiles = [];
let cur = null;
md.forEach((raw) => {
  const line = raw.trimEnd();
  const h = line.match(/^### (.+?)\s+—\s+(.+)$/);
  if (h) {
    cur = { name: unesc(h[1]).trim(), role: unesc(h[2]).trim(), fields: [] };
    profiles.push(cur);
    return;
  }
  if (line.startsWith("## ")) { cur = null; return; }
  if (!cur || !line.trim()) return;
  const f = line.match(/^\*\*(.+?)[:.]\*\*\s*(.*)$/);
  if (f) cur.fields.push({ label: unesc(f[1]).trim(), body: f[2] });
  else if (cur.fields.length) cur.fields[cur.fields.length - 1].body += " " + line;
  else cur.fields.push({ label: "", body: line });
});

const byId = {};
profiles.forEach((p) => {
  const idf = p.fields.find((f) => /^ID$/i.test(f.label));
  p.id = idf ? unesc(idf.body).trim() : null;
  if (p.id) byId[p.id] = p;
});

/* map profile ids to the graded candidates */
const slug = (n) => "cand-" + n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const gradeOf = {};
M.CANDIDATES.forEach((c) => { gradeOf[slug(c.name)] = c; });

/* ---- render ----------------------------------------------------------- */
/* Field labels that carry a mark tally get the mark's colour, so a reader can
   see the shape of a profile before reading a word of it. */
const TONE = [
  [/^✅|Aligned/, "tone-a"], [/^🟢|Close/, "tone-b"], [/^🟡|Partial/, "tone-c"],
  [/^❌|Opposed/, "tone-f"], [/^📋|Accountability|Record/, "tone-rec"],
  [/^⚪|Still/, "tone-none"], [/What would move/, "tone-move"],
];
const toneFor = (l) => (TONE.find(([re]) => re.test(l)) || [null, ""])[1];

const SKIP = /^(ID)$/i;

function renderProfile(p) {
  const c = p.id ? gradeOf[p.id] : null;
  const head = '<summary><span class="cs-t"><strong>' + p.name + "</strong> — " + p.role + "</span>" +
    (c ? '<span class="cs-g"><span class="g ' + gcls(c.grade) + '">' + c.grade + "</span>" +
      '<span class="cs-n">' + c.n + "/55</span></span>" : "") + "</summary>";

  let body = "";
  if (c) {
    body += '<p class="cs-lead"><strong>Overall ' + c.grade + "</strong> · mean " + c.mean.toFixed(2) +
      " · scored on <strong>" + c.n + " of 55</strong> topics. " +
      '<a href="scorecard.html#areas">See every area grade and the evidence behind it →</a></p>';
  }
  p.fields.forEach((f) => {
    if (SKIP.test(f.label)) return;
    const t = toneFor(f.label);
    body += '<p class="pf ' + t + '"><strong class="pfl">' + rich(f.label) + ".</strong> " + rich(f.body) + "</p>";
  });
  return '<details class="cand" id="' + (p.id || slug(p.name)) + '">' + head +
    '<div class="body">' + body + "</div></details>";
}
function gcls(g) {
  if (!g) return "x";
  return g[0] === "A" ? "a" : g[0] === "B" ? "b" : g[0] === "C" ? "c" : g[0] === "D" ? "d" : "f";
}

/* order: mayor, sitting councillors, candidates, unknown, context */
const ORDER = ["cand-marianne-alto", "cand-jeremy-caradonna", "cand-matt-dell", "cand-dave-thompson",
  "cand-susan-kim", "cand-krista-loughton", "cand-chris-coleman", "cand-stephen-hammond",
  "cand-marg-gardiner", "cand-melissa-cseszko", "cand-karen-rothe", "cand-wendy-bowkett",
  "cand-arthur-mcinnis", "cand-jack-sandor", "cand-bella-lee", "cand-four-unconfirmed"];
const ordered = ORDER.map((id) => byId[id]).filter(Boolean);
const context = profiles.filter((p) => !p.id && /Manak|Andrew/.test(p.name));

const chips = ordered.filter((p) => gradeOf[p.id]).map((p) =>
  '<a class="cchip" href="#' + p.id + '">' + p.name.split(" ").slice(-1)[0] + "</a>").join("\n");

const section =
  '<h2 id="candidate-profiles">Candidate Profiles</h2>\n' +
  "<p>One profile per candidate: the evidence base each grade rests on, where they align with this framework, where they diverge, what is on the record, and what is still unscored. " +
  "<strong>Open a profile to see the sources.</strong> Every grade shown here is the same number the " +
  '<a href="scorecard.html">scorecard</a> computes, and each links back to the area breakdown behind it.</p>\n' +
  '<p style="font-size:13.5px;color:#57534e"><strong>A profile is not a verdict.</strong> The grade measures distance from this framework, not quality, and a narrow evidence base is a fact about a publication calendar rather than about a candidate. ' +
  "Most challengers publish detail in September; a re-score after nominations close 11 September is mandatory.</p>\n" +
  '<div class="cand-bar">\n<div class="cand-idx" aria-label="Jump to a candidate">\n' + chips + "\n</div>\n</div>\n" +
  ordered.map(renderProfile).join("\n") + "\n" +
  (context.length
    ? '<h3 id="context-entries">Context entries — not candidates</h3>\n' +
      '<p style="font-size:14px;color:#57534e">Retained because each explains something about the shape of the field.</p>\n' +
      context.map(renderProfile).join("\n") + "\n"
    : "");

/* ---- splice ----------------------------------------------------------- */
const file = path.join(ROOT, "comparison.html");
let html = fs.readFileSync(file, "utf8");
const start = html.indexOf('<h2 id="candidate-profiles">');
if (start === -1) { console.error("profiles heading not found"); process.exit(1); }
const end = html.indexOf("<h2 ", start + 10);
if (end === -1) { console.error("no heading after the profiles section"); process.exit(1); }
const before = html.slice(start, end);
html = html.slice(0, start) + section + "\n" + html.slice(end);
fs.writeFileSync(file, html, "utf8");

console.log("Rebuilt the Candidate Profiles section");
console.log("  profiles parsed :", profiles.length, "| with an ID:", Object.keys(byId).length);
console.log("  rendered        :", ordered.length, "candidates +", context.length, "context entries");
console.log("  graded joins    :", ordered.filter((p) => gradeOf[p.id]).length, "of 15");
console.log("  replaced        :", before.length, "->", section.length, "bytes");
const missing = ORDER.filter((id) => !byId[id]);
if (missing.length) console.log("  MISSING from master:", missing.join(", "));

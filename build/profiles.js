#!/usr/bin/env node
/* Rebuilds profiles.html from the Notion master (build/profiles.md).
   ----------------------------------------------------------------------
   The master's profiles are structured — ID, evidence vintage, socials,
   sources, mark tallies, an accountability block, what is still unscored, and
   what would move the grade — so they are parsed rather than retyped. Each
   profile is joined to that candidate's v3.0 grade from matrix-v3.js, so a
   reader who opens a profile sees the grade, the base it rests on, and a link
   into the scorecard cell that explains it.

   The profiles used to live at the end of comparison.html, forty tables down
   a page nobody reaches the bottom of. They are now their own page, and this
   script writes the body of it: everything between the PROFILES:START and
   PROFILES:END markers in profiles.html is replaced, so the page's shell —
   head, header, hero, footer — is hand-maintained and untouched.

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
/* For attributes — data-jump-label carries a candidate's name into the section
   navigator, and a name with an apostrophe in it must not close the attribute. */
const attr = (s) => unesc(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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
    /* #sc-<key> is this candidate's own row in the scorecard's fifteen-area
       grid, written there by build/matrix.js. The pair is symmetrical: every
       name on the scorecard links to its profile, and every profile links
       back to its row rather than to the top of the section. */
    body += '<p class="cs-lead"><strong>Overall ' + c.grade + "</strong> · mean " + c.mean.toFixed(2) +
      " · scored on <strong>" + c.n + " of 55</strong> topics. " +
      '<a href="scorecard.html#sc-' + c.key + '">See every area grade and the evidence behind it →</a></p>';
  }
  p.fields.forEach((f) => {
    if (SKIP.test(f.label)) return;
    const t = toneFor(f.label);
    body += '<p class="pf ' + t + '"><strong class="pfl">' + rich(f.label) + ".</strong> " + rich(f.body) + "</p>";
  });
  /* data-jump-label, so the section navigator lists a candidate by name rather
     than by the first 64 characters of their profile. */
  return '<details class="cand" id="' + (p.id || slug(p.name)) + '"' +
    ' data-jump-label="' + attr(p.name) + '">' + head +
    '<div class="body">' + body + "</div></details>";
}
function gcls(g) {
  if (!g) return "x";
  return g[0] === "A" ? "a" : g[0] === "B" ? "b" : g[0] === "C" ? "c" : g[0] === "D" ? "d" : "f";
}

/* Eighteen cards in one undifferentiated run reads as a list of names. Grouped,
   it reads as a field: who holds the office, who sits on the council, who is
   challenging, and who cannot be researched at all. The order inside each group
   is the order the matrix uses. */
const GROUPS = [
  { id: "grp-mayor", title: "Mayor", ids: ["cand-marianne-alto"],
    note: "Still the only declared mayoral candidate." },
  { id: "grp-councillors", title: "Sitting councillors",
    ids: ["cand-jeremy-caradonna", "cand-matt-dell", "cand-dave-thompson", "cand-susan-kim",
      "cand-krista-loughton", "cand-chris-coleman", "cand-stephen-hammond", "cand-marg-gardiner"],
    note: "Four years of recorded votes, which is why their evidence base is the widest in the field — and why a re-score in September will narrow the gap rather than widen it." },
  { id: "grp-challengers", title: "Declared challengers",
    ids: ["cand-melissa-cseszko", "cand-karen-rothe", "cand-wendy-bowkett", "cand-arthur-mcinnis",
      "cand-jack-sandor", "cand-bella-lee"],
    note: "Scored from published material only. Most publish platform detail in September, so these grades are the ones most likely to move." },
  { id: "grp-no-record", title: "No locatable record", ids: ["cand-four-unconfirmed"],
    note: "Declared, and nothing published to score. Named here rather than left out." },
];

const context = profiles.filter((p) => !p.id && /Manak|Andrew/.test(p.name));
const ordered = GROUPS.flatMap((g) => g.ids.map((id) => byId[id]).filter(Boolean));

const chips = ordered.filter((p) => gradeOf[p.id]).map((p) =>
  '<a class="cchip" href="#' + p.id + '">' + p.name.split(" ").slice(-1)[0] + "</a>").join("\n");

function renderGroup(g) {
  const members = g.ids.map((id) => byId[id]).filter(Boolean);
  if (!members.length) return "";
  return '<h3 class="cand-grp" id="' + g.id + '" data-jump-label="' + attr(g.title) + '">' +
    g.title + '<span class="cand-n">' + members.length + "</span></h3>\n" +
    (g.note ? '<p class="grp-note">' + g.note + "</p>\n" : "") +
    members.map(renderProfile).join("\n");
}

const section =
  '<p class="pnote"><strong>A profile is not a verdict.</strong> The grade measures distance from this framework, not quality, and a narrow evidence base is a fact about a publication calendar rather than about a candidate. ' +
  "Most challengers publish detail in September; a re-score after nominations close 11 September is mandatory.</p>\n" +
  '<div class="cand-bar">\n<div class="cand-idx" aria-label="Jump to a candidate">\n' + chips + "\n</div>\n" +
  '<div class="cand-acts"><button type="button" class="cbtn" data-cand-all="open">Expand all</button>' +
  '<button type="button" class="cbtn" data-cand-all="close">Collapse all</button></div>\n</div>\n' +
  GROUPS.map(renderGroup).filter(Boolean).join("\n") + "\n" +
  (context.length
    ? '<h3 class="cand-grp" id="context-entries" data-jump-label="Context entries">Context entries — not candidates' +
      '<span class="cand-n">' + context.length + "</span></h3>\n" +
      '<p class="grp-note">Retained because each explains something about the shape of the field.</p>\n' +
      context.map(renderProfile).join("\n") + "\n"
    : "");

/* ---- splice ----------------------------------------------------------- */
const OPEN = "<!-- PROFILES:START -->";
const CLOSE = "<!-- PROFILES:END -->";
const file = path.join(ROOT, "profiles.html");
let html = fs.readFileSync(file, "utf8");
const start = html.indexOf(OPEN);
const end = html.indexOf(CLOSE);
if (start === -1 || end === -1 || end < start) {
  console.error("profiles.html is missing its " + OPEN + " / " + CLOSE + " markers");
  process.exit(1);
}
const before = html.slice(start + OPEN.length, end);
html = html.slice(0, start + OPEN.length) + "\n" + section + html.slice(end);
fs.writeFileSync(file, html, "utf8");

console.log("Rebuilt profiles.html");
console.log("  profiles parsed :", profiles.length, "| with an ID:", Object.keys(byId).length);
console.log("  rendered        :", ordered.length, "candidates +", context.length, "context entries");
console.log("  graded joins    :", ordered.filter((p) => gradeOf[p.id]).length, "of 15");
console.log("  replaced        :", before.length, "->", section.length, "bytes");
const placed = new Set(GROUPS.flatMap((g) => g.ids));
const missing = GROUPS.flatMap((g) => g.ids).filter((id) => !byId[id]);
if (missing.length) console.log("  MISSING from master:", missing.join(", "));
const stray = Object.keys(byId).filter((id) => !placed.has(id));
if (stray.length) console.log("  IN MASTER, IN NO GROUP:", stray.join(", "));

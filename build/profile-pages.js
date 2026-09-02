#!/usr/bin/env node
/* Write one real page per live-door candidate at profiles/<slug>.html.
   Bodies are transferred from the 1 Sep Notion Candidate Profiles toggles
   (build/notion-toggles/<slug>.md).    July Aligned/Close/Partial/Opposed
   buckets are stripped. Overall letters match /scorecard. Do not invent.
   Haley and Coleman are not live-door pages. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const { notionToHtml } = require("./notion-to-html");
const ev = require("./evidence-html");

const LIVE = [
  { slug: "alto",      id: "cand-marianne-alto",   name: "Marianne Alto",   office: "Mayor",   key: "Al", letter: "—",  n: 0,  campaign: { href: "https://altomayor.ca", label: "altomayor.ca" } },
  { slug: "harris",    id: "cand-mike-harris",     name: "Mike Harris",     office: "Mayor",   key: "Hr", letter: "—",  n: 0,  campaign: { href: "https://www.mike4victoria.ca/", label: "mike4victoria.ca" } },
  { slug: "mcguigan",  id: "cand-bruce-mcguigan",  name: "Bruce McGuigan",  office: "Mayor",   key: "Mg", letter: "—",  n: 0,  campaign: { href: "https://bruceformayor.ca/", label: "bruceformayor.ca" } },
  { slug: "mcinnis",   id: "cand-arthur-mcinnis",  name: "Arthur McInnis",  office: "Council", key: "Mc", letter: "B+", n: 17, campaign: { href: "http://arthurmcinnis.ca", label: "arthurmcinnis.ca" } },
  { slug: "garcia",    id: "cand-jerry-garcia",    name: "Jerry Garcia",    office: "Council", key: "Gg", letter: "C",  n: 10, campaign: { href: "https://jerryforvictoria.ca/", label: "jerryforvictoria.ca" } },
  { slug: "gardiner",  id: "cand-marg-gardiner",   name: "Marg Gardiner",   office: "Council", key: "Ga", letter: "D",  n: 6,  campaign: { href: "https://www.marggardiner.ca/", label: "marggardiner.ca" } },
  { slug: "hammond",   id: "cand-stephen-hammond", name: "Stephen Hammond", office: "Council", key: "Ha", letter: "—",  n: 0,  campaign: { href: "https://votestephenhammond.ca", label: "votestephenhammond.ca" } },
  { slug: "caradonna", id: "cand-jeremy-caradonna",name: "Jeremy Caradonna",office: "Council", key: "Ca", letter: "—",  n: 0,  campaign: { href: "https://www.electjeremy.ca/", label: "electjeremy.ca" } },
  { slug: "dell",      id: "cand-matt-dell",       name: "Matt Dell",       office: "Council", key: "De", letter: "D",  n: 5,  campaign: { href: "https://www.mattdell.ca/", label: "mattdell.ca" } },
  { slug: "thompson",  id: "cand-dave-thompson",   name: "Dave Thompson",   office: "Council", key: "Th", letter: "—",  n: 0,  campaign: { href: "https://davethompsonvictoria.ca/", label: "davethompsonvictoria.ca" } },
  { slug: "kim",       id: "cand-susan-kim",       name: "Susan Kim",       office: "Council", key: "Ki", letter: "—",  n: 0,  campaign: { href: "https://www.susankim.ca/", label: "susankim.ca" } },
  { slug: "loughton",  id: "cand-krista-loughton", name: "Krista Loughton", office: "Council", key: "Lo", letter: "D",  n: 6,  campaign: { href: "https://www.kristaloughton.ca/", label: "kristaloughton.ca", checked: "1 Sep 2026" } },
  { slug: "cseszko",   id: "cand-melissa-cseszko", name: "Melissa Cseszko", office: "Council", key: "Cs", letter: "—",  n: 0,  campaign: { href: "https://www.melissacseszko.ca/", label: "melissacseszko.ca" } },
  { slug: "rothe",     id: "cand-karen-rothe",     name: "Karen Rothe",     office: "Council", key: "Ro", letter: "—",  n: 0,  campaign: { href: "http://karenrothe.ca", label: "karenrothe.ca" } },
  { slug: "bowkett",   id: "cand-wendy-bowkett",   name: "Wendy Bowkett",   office: "Council", key: "Bo", letter: "C",  n: 5,  campaign: { href: "http://wendybowkett.ca", label: "wendybowkett.ca" } },
  { slug: "lee",       id: "cand-bella-lee",       name: "Bella Lee",       office: "Council", key: "Le", letter: "B",  n: 9,  campaign: { href: "https://www.bellalee.ca/", label: "bellalee.ca" } },
  { slug: "sandor",    id: "cand-jack-sandor",     name: "Jack Sandor",     office: "Council", key: "Sa", letter: "B",  n: 16, campaign: { href: "http://jacksandor.ca", label: "jacksandor.ca" } },
  { slug: "girard",    id: "cand-martin-girard",   name: "Martin Girard",   office: "Council", key: "Gi", letter: "D",  n: 7,  campaign: { href: "https://martingirardforvictoriacouncil.ca/", label: "martingirardforvictoriacouncil.ca" } },
  { slug: "gibbs",     id: "cand-peter-gibbs",     name: "Peter Gibbs",     office: "Council", key: "Gb", letter: "—",  n: 0,  campaign: { href: "https://www.victoriaforall.ca/about", label: "victoriaforall.ca/about", note: "No personal campaign site; named on Victoria for All." } },
  { slug: "dion",      id: "cand-shona-dion",      name: "Shona Dion",      office: "Council", key: "Di", letter: "—",  n: 0,  campaign: { href: "https://www.shonadion4victoria.ca/", label: "shonadion4victoria.ca" } },
];

/* The letter and the answered count come from the applied table, not from the
   list above: it hardcoded n: 0 for every candidate without a letter, so
   McGuigan's page said nothing was answered while his card holds fifteen. */
const APPLIED = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "applied-letters.json"), "utf8"));
const appliedBy = Object.fromEntries(APPLIED.candidates.map((c) => [c.key, c]));
for (const c of LIVE) {
  const a = appliedBy[c.key];
  if (!a) { console.error("no applied row for " + c.name); process.exit(1); }
  if (a.name !== c.name) { console.error("name drift: " + c.name + " vs " + a.name); process.exit(1); }
  c.letter = a.letter || "—";
  c.n = a.n;
}

function gradeCls(letter) {
  if (!letter || letter === "—") return "x";
  const c = letter[0].toLowerCase();
  return "abcdf".indexOf(c) > -1 ? c : "x";
}

const bodies = {};
for (const c of LIVE) {
  const mdPath = path.join(ROOT, "build", "notion-toggles", c.slug + ".md");
  if (!fs.existsSync(mdPath)) {
    console.error("missing Notion toggle for", c.slug);
    process.exit(1);
  }
  bodies[c.slug] = notionToHtml(fs.readFileSync(mdPath, "utf8"), c.slug);
}

const PAGE_CSS = `/* Field tints copied from the hub cards so transferred prose reads the same.
   Not a site restyle — these rules already live on profiles.html. */
.cs-lead{padding:11px 13px;background:rgba(26,54,104,.05);border-left:3px solid var(--gold);margin:12px 0 14px !important}
.pf{padding-left:13px;border-left:3px solid rgba(26,54,104,.14)}
.pfl{color:var(--navy)}
.pf.tone-a{border-left-color:#227247}
.pf.tone-b{border-left-color:#6FA07C}
.pf.tone-c{border-left-color:#D9B45B}
.pf.tone-f{border-left-color:#B5341F}
.pf.tone-rec{border-left-color:var(--navy);background:rgba(26,54,104,.04);padding:11px 13px}
.pf.tone-none{border-left-color:#c9c4bf;color:#57534e}
.pf.tone-move{border-left-color:var(--gold);background:rgba(212,168,67,.09);padding:11px 13px}
.g{display:inline-flex;align-items:center;justify-content:center;min-width:32px;padding:2px 6px;font-family:'Fraunces',serif;font-size:15px;font-weight:600;color:#fff;line-height:1.15}
.g.a{background:#227247}.g.b{background:#3D6E4E}
.g.c{background:#8B6914}.g.d{background:#B5651F}
.g.f{background:#B5341F}.g.x{background:#8a8580}
.cs-n{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;color:#6b6664;white-space:nowrap;margin-left:6px}
.pfpage{font-size:14px;line-height:1.6;color:#33312e}
.pfpage p{margin:10px 0;font-size:14px;line-height:1.6}
.pfpage ul{margin:8px 0;padding-left:20px}
.pfpage li{margin:5px 0;font-size:14px;line-height:1.55}
.graderow{display:flex;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap}
.gradelbl{font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#6b6664}
${ev.evidenceCss()}`;

function pageHtml(c) {
  const officeLabel = c.office === "Mayor" ? "Mayor" : "Council";
  /* A letter is applied by hand and needs five answered measures, so "no
     letter" and "nothing answered" are different states and the page says
     which one this is. */
  const gradeBadge = c.letter === "—"
    ? '<span class="g x">—</span><span class="cs-n">' + c.n + " of 55 answered</span>"
    : '<span class="g ' + gradeCls(c.letter) + '">' + c.letter + '</span><span class="cs-n">' + c.n + " of 55 answered</span>";
  const gradeText = c.letter === "—"
    ? (c.n >= 5
      ? "No letter applied yet · " + c.n + " of 55 measures answered"
      : "No letter yet · " + c.n + " of 55 measures answered, and a letter needs five")
    : "Letter " + c.letter + " · " + c.n + " of 55 measures answered";
  let campaign;
  if (!c.campaign) {
    campaign = '<p class="pf "><strong class="pfl">Campaign.</strong> No personal campaign site located.</p>';
  } else if (c.campaign.note) {
    campaign = '<p class="pf "><strong class="pfl">Campaign.</strong> ' + c.campaign.note +
      ' <a href="' + c.campaign.href + '" target="_blank" rel="noopener">' + c.campaign.label + "</a>.</p>";
  } else {
    campaign = '<p class="pf "><strong class="pfl">Campaign.</strong> <a href="' + c.campaign.href +
      '" target="_blank" rel="noopener">' + c.campaign.label + "</a>" +
      (c.campaign.checked ? " (" + c.campaign.checked + ")" : "") + "</p>";
  }
  const cardPath = path.join(ROOT, "data", "rating-cards", c.slug + ".json");
  const card = fs.existsSync(cardPath) ? JSON.parse(fs.readFileSync(cardPath, "utf8")) : null;
  const evidence = ev.howMadeHtml(c, card) + ev.doorsHtml(card) + ev.topicsHtml(card) + ev.panelHtml();
  const cardJson = card
    ? '<script id="rating-card" type="application/json">' +
      JSON.stringify(card).replace(/</g, "\\u003c") + "</script>"
    : "";
  const desc = c.name + " — " + officeLabel + " candidate, Victoria 2026. " + gradeText + ".";
  const canon = "https://acitythatworks.ca/profiles/" + c.slug;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<!-- The candidate switch: one boolean in flags.js hides every candidate page
     and every link to one. Loaded first and synchronously so a gated page
     leaves before it paints. Root-absolute asset paths: this file lives in
     /profiles/, not next to flags.js. -->
<script src="/flags.js?v=2"></script>
<meta name="description" content="${desc.replace(/"/g, "&quot;")}">
<meta name="theme-color" content="#1A3668">
<title>${c.name} — Candidate Profile — A City That Works, Victoria 2026</title>
<meta property="og:title" content="${c.name} — A City That Works">
<meta property="og:description" content="${desc.replace(/"/g, "&quot;")}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canon}">
<meta property="og:site_name" content="A City That Works">
<meta property="og:locale" content="en_CA">
<meta property="og:image" content="https://acitythatworks.ca/og-card-scorecard.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Victoria 2026 Candidate Scorecard">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://acitythatworks.ca/og-card-scorecard.png">
<link rel="canonical" href="${canon}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v=19">
<style>
${PAGE_CSS}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>

<header>
<div class="c hr">
<a href="/" class="brand"><svg class="bicn" viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="112" fill="#FAF7F0"/><g fill="none" stroke="#16335c" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M52 92  q22.5 -14 45 0 t45 0 t45 0"/><path d="M52 120 q22.5 -14 45 0 t45 0 t45 0" opacity="0.88"/><path d="M52 148 q22.5 -14 45 0 t45 0 t45 0" opacity="0.76"/></g></svg><span class="nm">A City That Works</span></a>
<nav class="nv">
<a href="/summary">Summary</a>
<a href="/measures">Measures</a>
<a href="/neighbourhoods">Neighbourhoods</a>
<a href="/scorecard" data-cand class="nv-sc">Candidates</a>
<a href="/faq">FAQ</a>
</nav>
<button id="mt" class="mb" aria-label="Open menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
</div>
<div id="mn" class="mm">
<div class="c mmi">
<a href="/">Home</a>
<a href="/summary">Summary</a>
<a href="/measures">Measures</a>
<a href="/neighbourhoods">Neighbourhoods</a>
<a href="/scorecard" data-cand>Candidates</a>
<a href="/faq">FAQ</a>
</div>
</div>
</header>

<main id="main">
<div class="cn">
<nav class="crumbs" aria-label="Breadcrumb">
<a href="/">Framework</a><span class="sep">/</span><a href="/profiles">Candidate Profiles</a><span class="sep">/</span><span class="here">${c.name}</span>
</nav>
<div class="hero pg-door">
<div class="eyb">Profile</div>
<h1 class="ph1">${c.name}</h1>
<p class="lead" style="margin-top:18px">${officeLabel} candidate · Victoria 2026</p>
<div class="graderow"><span class="gradelbl">Grade</span>${gradeBadge}</div>
</div>
<div class="parked-open">
<div class="prose pfpage">
${campaign}
${evidence}
<details class="vintage">
<summary>Background</summary>
${bodies[c.slug]}
</details>
<p style="margin-top:28px"><a href="/profiles" class="pgback">← All candidate profiles</a> · <a href="/scorecard#sc-${c.key}">Scorecard</a></p>
</div>
</div>
</div>
</main>

<div id="footer-mount"></div>
${cardJson}
<script src="/icons.js?v=2"></script>
<script src="/site.js?v=14"></script>
<script src="/civic.js?v=2"></script>
<script src="/evidence.js?v=1"></script>
</body>
</html>
`;
}

const dir = path.join(ROOT, "profiles");
fs.mkdirSync(dir, { recursive: true });
const forbidden = ["haley", "coleman", "atkinson", "manak", "andrew"];
for (const slug of forbidden) {
  const p = path.join(dir, slug + ".html");
  if (fs.existsSync(p)) {
    console.error("refusing to keep a non-live-door page:", p);
    process.exit(1);
  }
}

let wrote = 0;
for (const c of LIVE) {
  fs.writeFileSync(path.join(dir, c.slug + ".html"), pageHtml(c));
  wrote++;
  const n = bodies[c.slug].length;
  console.log(" ", c.slug.padEnd(12), String(n).padStart(5), "notion");
}

const redirects = [
  "# Pretty paths for live-door profile pages. /profiles itself stays the hub",
  "# (profiles.html). 200 rewrites so /profiles/harris is a real page, not a 404.",
  "/profiles /profiles.html 200",
];
for (const c of LIVE) {
  redirects.push("/profiles/" + c.slug + " /profiles/" + c.slug + ".html 200");
}
fs.writeFileSync(path.join(ROOT, "_redirects"), redirects.join("\n") + "\n");

console.log("wrote", wrote, "pages in profiles/ and _redirects");
console.log("slugs:", LIVE.map((c) => c.slug).join(" "));
console.log("not written: haley coleman atkinson manak andrew");

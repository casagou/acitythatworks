/* A City That Works — neighbourhood pages build.
 *
 *     node build/neighbourhoods.js
 *
 * Reads build/neighbourhoods.md (the dump of the Notion master, "Victoria 2030,
 * Neighbourhood by Neighbourhood") and writes:
 *
 *   1. neighbourhood-<slug>.html, one per entry — the whole page, shell included
 *   2. the card grid inside neighbourhoods.html, between the NB:HUB markers
 *   3. the card grid inside index.html, between the NB:HOME markers
 *
 * Same arrangement as build/profiles.js: edit the master, re-run, commit both.
 * Editing a generated page directly is wasted work — the next run overwrites it.
 *
 * Measure references are written in the master as bare text — "(M27)", "(M66d)" —
 * and linked to measures.html here, because 13 pages carrying ~500 of them by
 * hand is 500 chances to link at a measure that does not exist. Every id is
 * checked against measures.js and an unknown one aborts the build rather than
 * shipping a link to nothing, which is the same rule build/matrix.js applies to
 * candidate names.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MEASURE_IDS = new Set(require(path.join(ROOT, 'measures.js')).MEASURES.map(m => 'm' + m.id));

const VERSION = 'v1.10';
const SITE = 'https://acitythatworks.ca';

/* ---------------------------------------------------------------- parsing */

function parseMaster(src) {
  /* Everything before the first "=== slug" line is the format note at the top
     of the master, not content. */
  const chunks = src.split(/^=== +(.+)$/m);
  const out = [];
  for (let i = 1; i < chunks.length; i += 2) {
    const slug = chunks[i].trim();
    const rest = chunks[i + 1];
    const cut = rest.indexOf('\n---\n');
    if (cut === -1) throw new Error(`${slug}: no --- line closing the front matter`);
    const fm = {};
    rest.slice(0, cut).split('\n').forEach(line => {
      if (!line.trim()) return;
      const m = line.match(/^([a-z]+):\s*(.*)$/);
      if (!m) throw new Error(`${slug}: unparsed front-matter line "${line}"`);
      fm[m[1]] = m[2].trim();
    });
    for (const need of ['name', 'emoji', 'tagline', 'card', 'assoc', 'assocurl', 'meta']) {
      if (!fm[need]) throw new Error(`${slug}: front matter is missing "${need}"`);
    }
    fm.slug = slug;
    fm.official = fm.official !== 'no';
    fm.file = 'neighbourhood-' + slug + '.html';
    fm.body = rest.slice(cut + 5).trim();
    out.push(fm);
  }
  return out;
}

/* ---------------------------------------------------------------- inline */

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const unknownMeasures = new Set();

/* Runs on escaped plain text, before any markup exists, so it can never land
   inside an href. "$25M" and "6 AM" do not match: the pattern needs a word
   boundary before the M and a digit after it. */
function linkMeasures(s) {
  return s.replace(/\bM(\d{1,3}[a-z]?)\b/g, (whole, id) => {
    const anchor = 'm' + id;
    if (!MEASURE_IDS.has(anchor)) { unknownMeasures.add(whole); return whole; }
    return `<a href="measures.html#${anchor}">${whole}</a>`;
  });
}

function inline(s) {
  let t = linkMeasures(esc(s));
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href) => {
    const ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${ext}>${text}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[\s(])\*([^*]+)\*/g, '$1<em>$2</em>');
  return t;
}

/* ---------------------------------------------------------------- blocks */

const CALLOUT_CLASS = { voice: 'callout voice', money: 'callout gold', straight: 'callout straight', note: 'callout blue' };

function renderBody(body, slug) {
  const lines = body.split('\n');
  const html = [];
  const toc = [];
  let i = 0;

  const flushList = (tag, items) => {
    html.push(`<${tag}>` + items.map(x => `<li>${inline(x)}</li>`).join('') + `</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    /* ## Section heading ||short label for the contents list */
    if (/^## /.test(line)) {
      const raw = line.slice(3).trim();
      const [text, label] = raw.split('||').map(s => s.trim());
      const id = slugify(label || text);
      toc.push({ id, label: label || text });
      html.push(`<h2 id="${id}">${inline(text)}</h2>`);
      i++; continue;
    }

    /* #### Group label inside a section */
    if (/^#### /.test(line)) {
      html.push(`<h4>${inline(line.slice(5).trim())}</h4>`);
      i++; continue;
    }

    /* :::kind … ::: */
    if (/^:::/.test(line)) {
      const kind = line.slice(3).trim() || 'note';
      const cls = CALLOUT_CLASS[kind];
      if (!cls) throw new Error(`${slug}: unknown callout kind ":::${kind}"`);
      const buf = [];
      i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // closing :::
      const paras = buf.join('\n').trim().split(/\n{2,}/).map(p => `<p>${inline(p.replace(/\n/g, ' '))}</p>`).join('');
      html.push(`<div class="${cls}">${paras}</div>`);
      continue;
    }

    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
      flushList('ul', items);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s*/, '')); i++; }
      flushList('ol', items);
      continue;
    }

    /* paragraph — runs to the next blank line */
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,4} |- |\d+\. |:::)/.test(lines[i])) { buf.push(lines[i]); i++; }
    html.push(`<p>${inline(buf.join(' '))}</p>`);
  }

  return { html: html.join('\n'), toc };
}

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/* ---------------------------------------------------------------- page */

function head(n) {
  const title = `${n.name} — Victoria 2030 | A City That Works`;
  const desc = n.meta;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<!-- Generated by build/neighbourhoods.js from build/neighbourhoods.md. Do not
     edit this file — the next build overwrites it. -->
<script src="flags.js?v=2"></script>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#1A3668">
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(n.name)} — Victoria 2030">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${SITE}/${n.file}">
<meta property="og:site_name" content="A City That Works">
<meta property="og:locale" content="en_CA">
<meta property="og:image" content="${SITE}/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A City That Works — A Citizens' Framework for Victoria 2026">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/og-card.png">
<link rel="canonical" href="${SITE}/${n.file}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?v=23">
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>
`;
}

const HEADER = `<header>
<div class="c hr">
<a href="/" class="brand"><svg class="bicn" viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="112" fill="#FAF7F0"/><g fill="none" stroke="#16335c" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M52 92  q22.5 -14 45 0 t45 0 t45 0"/><path d="M52 120 q22.5 -14 45 0 t45 0 t45 0" opacity="0.88"/><path d="M52 148 q22.5 -14 45 0 t45 0 t45 0" opacity="0.76"/></g></svg><span class="nm">A City That Works</span><span class="num">Victoria 2026</span></a>
<nav class="nv">
<a href="/summary">Summary</a>
<a href="/measures">Measures</a>
<a href="/neighbourhoods" class="cur">Neighbourhoods</a>
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
<a href="/neighbourhoods" class="gd">Neighbourhoods</a>
<a href="/scorecard" data-cand>Candidates</a>
<a href="/faq">FAQ</a>
</div>
</div>
</header>
`;

/* The chip strip at the foot of every neighbourhood page. Static markup on
   each page rather than injected by site.js: these are the main lateral route
   between 13 sibling pages, and a route that only exists once JavaScript has
   run is a route search engines and no-JS readers never see. */
function chips(all, current) {
  const one = n => `<a class="nbchip${n.slug === current ? ' on' : ''}" href="${n.file}"` +
    (n.slug === current ? ' aria-current="page"' : '') +
    `>${esc(n.name)}</a>`;
  const official = all.filter(n => n.official).map(one).join('');
  const extra = all.filter(n => !n.official).map(one).join('');
  return `<div class="nbchips">${official}</div>` +
    `<div class="nbchips nbchips-x"><span class="nbxl">Plus one that isn't official:</span>${extra}</div>`;
}

function page(n, all, idx) {
  let { html, toc } = renderBody(n.body, n.slug);
  /* The first list on the page — where things stand in 2026 — is the page's
     headline facts, so it is set as tiles rather than as bullets. The words
     are the master's; only the class is added. */
  html = html.replace(/(<h2 id="where-things-stand[^"]*">[^<]*<\/h2>\s*)<ul>/, '$1<ul class="facts">');
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  /* "How you hold us to it" is written by this template rather than by the
     master, so it has to be added to the contents list here — a section that
     is on the page but not in its own table of contents reads as an oversight
     to anyone using the list to navigate. */
  const tocHtml = `<nav class="toc" aria-label="On this page">
<div class="toc-h">On this page</div>
<ol>
${toc.map(t => `<li><a href="#${t.id}">${esc(t.label)}</a></li>`).join('\n')}
<li><a href="#hold">How you hold us to it</a></li>
</ol>
</nav>`;

  const officialNote = n.official
    ? ''
    : `<p class="scale">Harris Green is not one of the City's 12 official neighbourhoods — it sits inside Downtown, and this page says so at the top and links you to the <a href="neighbourhood-downtown.html">Downtown page</a> as well.</p>`;

  return head(n) + HEADER + `
<main id="main">
<div class="cn">
<nav class="crumbs" aria-label="Breadcrumb">
<a href="index.html">Framework</a><span class="sep">/</span><a href="neighbourhoods.html">Neighbourhoods</a><span class="sep">/</span><span class="here">${esc(n.name)}</span>
</nav>
<div class="nb-hero">
<div class="hero pg-door">
<h1 class="ph1">${esc(n.name)}</h1>
<p class="lead" style="margin-top:10px">${inline(n.tagline)}</p>
<p class="scale">The framework is city-wide. Life is local. This page translates the same costed measures you will find in <a href="measures.html">the full Program</a> into what they do on these streets — nothing new, nothing extra, just where the existing commitments land first and why. <strong>${esc(n.assoc)}</strong> speaks for this neighbourhood; this page does not.</p>
${officialNote}
</div>
<div class="nbmap mini" data-current="${n.slug}" aria-label="Where ${esc(n.name)} sits among the thirteen neighbourhood pages"></div>
</div>

<div class="parked-open">
${tocHtml}

<div class="prose">
${html}

<h2 id="hold">How you hold us to it</h2>
<p>Everything on this page is reported on the same public cadence as the rest of the framework: the <strong>quarterly dashboard</strong> (<a href="measures.html#m67">M67</a>), the <strong>annual community survey</strong> (<a href="measures.html#m82">M82</a>), and the indicator library that says what each number is, where it comes from and which way it should move.</p>
<p><a href="kpis.html">See the KPI library →</a> · <a href="index.html#scorecard">See the 12 Commitments scorecard →</a></p>
<div class="callout blue"><p><strong>Residents overwrite this page.</strong> Neighbourhood empowerment (<a href="measures.html#m80">M80</a>), the annual survey (<a href="measures.html#m82">M82</a>) and the Local Area Plan schedule are the standing mechanisms for that. This is the framework's opening read of local priorities, not the last word. If something here is wrong about your street, <a href="mailto:info@acitythatworks.ca">tell us</a> and it gets corrected in the open, the same way every other correction in this framework has been.</p></div>
</div>

<nav class="nbnav" aria-label="Previous and next neighbourhood">
<a class="nbprev" href="${prev.file}"><span class="nbnl">← Previous</span><span class="nbnn">${esc(prev.name)}</span></a>
<a class="nbnext" href="${next.file}"><span class="nbnl">Next →</span><span class="nbnn">${esc(next.name)}</span></a>
</nav>

<div class="nbsw">
<div class="nbsw-h">◆ Every neighbourhood</div>
${chips(all, n.slug)}
</div>
</div>
<p style="margin-top:32px"><a href="measures.html" class="pgback">← Read the full framework</a></p>
</div>
</main>

<div id="footer-mount"></div>
<script src="icons.js?v=2"></script>
<script src="site.js?v=16"></script>
<script src="civic.js?v=4"></script>
<script src="jumpnav.js"></script>
</body>
</html>
`;
}

/* ---------------------------------------------------------------- cards */

function card(n) {
  return `<div class="ac"><div class="act"><a href="${n.file}">${esc(n.name)}</a></div>` +
    `<div class="acx">${inline(n.card)}</div>` +
    `<a class="acr" href="${n.file}">Read ${esc(n.name)} →</a></div>`;
}

function grid(all) {
  const official = all.filter(n => n.official);
  const extra = all.filter(n => !n.official);
  return `<div class="ag">\n${official.map(card).join('\n')}\n</div>\n` +
    `<div class="nbextra"><div class="nbextra-h">Plus one that isn't official</div>\n<div class="ag">\n${extra.map(card).join('\n')}\n</div></div>`;
}

/* ---------------------------------------------------------------- write */

function replaceBlock(file, marker, block) {
  const p = path.join(ROOT, file);
  const src = fs.readFileSync(p, 'utf8');
  const re = new RegExp(`(<!-- ${marker}:START -->)[\\s\\S]*?(<!-- ${marker}:END -->)`);
  if (!re.test(src)) throw new Error(`${file}: no ${marker}:START/END markers`);
  const out = src.replace(re, `$1\n${block}\n$2`);
  if (out === src) return false;
  fs.writeFileSync(p, out);
  return true;
}

const entries = parseMaster(fs.readFileSync(path.join(__dirname, 'neighbourhoods.md'), 'utf8'));

/* Official 12 alphabetically, then the one that isn't. A resident looking for
   their own neighbourhood scans an alphabetical list; nobody scans a thematic
   one. */
entries.sort((a, b) => (a.official === b.official)
  ? a.name.localeCompare(b.name, 'en')
  : (a.official ? -1 : 1));

let written = 0, unchanged = 0;
entries.forEach((n, i) => {
  const html = page(n, entries, i);
  const p = path.join(ROOT, n.file);
  const before = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (before === html) { unchanged++; return; }
  fs.writeFileSync(p, html);
  written++;
});

if (unknownMeasures.size) {
  console.error('\nAborting: the master cites measures that are not in measures.js:');
  [...unknownMeasures].sort().forEach(m => console.error('  ' + m));
  process.exit(1);
}

const hub = replaceBlock('neighbourhoods.html', 'NB:HUB', grid(entries));
const home = replaceBlock('index.html', 'NB:HOME', grid(entries));

console.log(`neighbourhoods: ${entries.length} entries — ${written} page(s) written, ${unchanged} unchanged`);
console.log(`  neighbourhoods.html grid: ${hub ? 'updated' : 'unchanged'}`);
console.log(`  index.html grid:          ${home ? 'updated' : 'unchanged'}`);

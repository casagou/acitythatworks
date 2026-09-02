/* A City That Works — internal link check.
 *
 *     node build/checklinks.js
 *
 * Three failures this catches, each of which has shipped on this site before
 * or came close to:
 *
 *   1. A `measures.html#mNN` link to a measure number that does not exist.
 *      The annexes and the One-Page Summary cite measures by number in prose,
 *      by hand. A measure that is renamed or removed leaves those links
 *      pointing at nothing, and nothing about a broken fragment is visible —
 *      the page just opens at the top and the reader assumes they misread.
 *   2. A link to a page file that is not in the repo.
 *   3. A `page.html#anchor` link whose target id does not exist on that page.
 *
 * Exits non-zero and names every offender, so this can gate a deploy.
 *
 * Deliberately not checked: external http(s) links (network flake is not a
 * build failure) and mailto:.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const measures = require(path.join(ROOT, 'measures.js'));
const MEASURE_IDS = new Set(measures.MEASURES.map(m => 'm' + m.id));

const pages = [
  ...fs.readdirSync(ROOT).filter(f => f.endsWith('.html')),
  ...fs.readdirSync(path.join(ROOT, 'profiles'))
    .filter(f => f.endsWith('.html'))
    .map(f => 'profiles/' + f),
];

/* id="…" collected per page, so cross-page fragments can be resolved. */
const idsByPage = {};
for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
  idsByPage[p] = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]));
}

const problems = [];

for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);

  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) continue;

    const [rawFile, frag] = href.split('#');
    let file = rawFile.split('?')[0];
    if (!file) continue;

    /* Pretty URLs: /summary and summary both resolve to summary.html on
       Netlify. Check the file that actually lives in the repo. */
    if (file.startsWith('/')) file = file.slice(1);
    if (file && !file.includes('.') && fs.existsSync(path.join(ROOT, file + '.html'))) {
      file = file + '.html';
    }

    if (!fs.existsSync(path.join(ROOT, file))) {
      problems.push(`${p}: link to missing file "${file}"`);
      continue;
    }

    if (!frag) continue;

    /* Measure anchors are the ones written by hand in prose, so they get the
       explicit check and the explicit message. */
    if (file === 'measures.html' && /^m\d/.test(frag)) {
      if (!MEASURE_IDS.has(frag)) {
        problems.push(`${p}: cites ${frag.toUpperCase().replace('M', 'Measure ')} — no such measure in measures.js`);
      }
      continue;
    }

    if (file.endsWith('.html') && idsByPage[file] && !idsByPage[file].has(frag)) {
      problems.push(`${p}: link to ${file}#${frag} — no element with that id on that page`);
    }
  }
}

const unique = [...new Set(problems)];
if (unique.length) {
  console.error(`Broken internal links: ${unique.length}\n`);
  unique.forEach(x => console.error('  ' + x));
  process.exit(1);
}

console.log(`OK — ${pages.length} pages, every internal link and fragment resolves.`);

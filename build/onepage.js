/* A City That Works — build the printable one-pager.
 *
 *     node build/onepage.js
 *
 * Renders build/one-page.html to A-City-That-Works-One-Page.pdf through
 * headless Chrome. No dependencies: Chrome is already on any machine that
 * can check this site in a browser, and adding a Node PDF library to a repo
 * with no package.json to hold it would cost more than it buys.
 *
 * Three things this script refuses to do, because each has shipped before as
 * a silent defect rather than a loud one:
 *
 *   1. Write a PDF with more than one page. The whole artifact is the claim
 *      that the framework fits on one sheet. A second page is a failure,
 *      not a formatting quirk, so it exits non-zero and leaves the existing
 *      PDF alone.
 *   2. Write a PDF that still contains a retracted figure. RETRACTED below
 *      is the list struck by earlier releases; if the rendered text contains
 *      one, the build fails and names it. The $750-per-resident policing
 *      figure survived in this PDF for three releases after v1.9.3 removed
 *      it everywhere else, precisely because nothing checked.
 *   3. Overwrite a PDF it did not write. Since v1.11 the shipped file is a
 *      hand-produced two-page artifact, and one-page.html still holds the
 *      old v1.10 layout: running this script unthinkingly would quietly put
 *      the superseded sheet back on the site. Pass --force to mean it.
 */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(__dirname, 'one-page.html');
const OUT = path.join(ROOT, 'A-City-That-Works-One-Page.pdf');

/* Figures this framework has struck. A number is listed here the moment a
   release retracts it, so every later build is checked against the whole
   history rather than against whatever the author happens to remember. */
const RETRACTED = [
  { text: '$750', why: 'per-resident policing figure retracted in v1.9.3 — a projection from the Police Board request that did not pass, not a measurement' },
];

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(p => fs.existsSync(p));

if (!CHROME) {
  console.error('No Chrome or Edge found. Install one, or add its path to CHROME in this script.');
  process.exit(1);
}

/* Guard 3, before Chrome runs rather than after, so an unintended build costs
   nothing and says why. Chrome stamps every PDF it prints with a Skia/PDF
   /Producer; a file made anywhere else does not carry it, which is enough to
   tell "this script wrote it" from "somebody put it here". */
const FORCE = process.argv.includes('--force');

if (!FORCE && fs.existsSync(OUT)) {
  const existing = fs.readFileSync(OUT).toString('latin1');
  const producer = (existing.match(/\/Producer\s*\(([^)]*)\)/) || [])[1] || '';
  if (!/Skia\/PDF/.test(producer)) {
    console.error(`Refusing to write: ${path.relative(ROOT, OUT)} was not produced by this script.`);
    console.error(`Its /Producer is ${producer ? '"' + producer + '"' : 'unset'}; this script writes Chrome's "Skia/PDF ...".`);
    console.error('The shipped PDF is hand-made (v1.11 is two pages); build/one-page.html is still v1.10,');
    console.error('so building would silently replace it with the superseded one-page layout.');
    console.error('Port the layout into build/one-page.html first, or re-run with --force if you mean it.');
    process.exit(1);
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'actw-onepage-'));
const staged = path.join(tmp, 'out.pdf');

execFileSync(CHROME, [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--no-pdf-header-footer',
  '--print-to-pdf-no-header',
  '--print-to-pdf=' + staged,
  'file:///' + SRC.replace(/\\/g, '/'),
], { stdio: 'pipe', timeout: 120000 });

if (!fs.existsSync(staged)) {
  console.error('Chrome produced no file.');
  process.exit(1);
}

const buf = fs.readFileSync(staged);

/* Page count, straight off the page tree. Chrome writes an uncompressed
   /Type /Page object per page in the PDFs it prints, so counting them needs
   no parser. If a future Chrome compresses the object streams this stops
   matching and the guard below catches that too, by finding zero. */
const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
if (pages !== 1) {
  console.error(`Refusing to write: rendered ${pages} page(s), expected exactly 1.`);
  console.error('Trim build/one-page.html until it fits. The existing PDF is untouched.');
  process.exit(1);
}

/* Retracted-figure check, run against the source rather than the compressed
   PDF stream — same text, and it does not depend on how Chrome encodes it. */
const src = fs.readFileSync(SRC, 'utf8');
const found = RETRACTED.filter(r => src.includes(r.text));
if (found.length) {
  found.forEach(r => console.error(`Refusing to write: "${r.text}" is retracted — ${r.why}`));
  process.exit(1);
}

fs.copyFileSync(staged, OUT);
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`Wrote ${path.relative(ROOT, OUT)} — 1 page, ${(buf.length / 1024).toFixed(1)} KB.`);
console.log('Update the version and size on the download card in summary.html if either changed.');

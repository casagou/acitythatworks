/* A City That Works — build the printable one-pager.
 *
 *     node build/onepage.js
 *
 * Renders build/one-page.html to A-City-That-Works-One-Page.pdf through
 * headless Chrome. No dependencies: Chrome is already on any machine that
 * can check this site in a browser, and adding a Node PDF library to a repo
 * with no package.json to hold it would cost more than it buys.
 *
 * Two things this script refuses to do, because both have shipped before as
 * silent defects rather than loud ones:
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

#!/usr/bin/env node
/* A City That Works — pre-render build/prerender.js
   ---------------------------------------------------
   Bakes the current measures.js data into index.html and measures.html so
   the site's deepest content (all 131 measures, the pillar cards, the
   12-Commitments table, the home Q&A) is real HTML from the first byte —
   not an empty <div> waiting for 318KB of JS to parse. Search engines,
   preview bots, archive crawlers, and no-JS readers all see the content
   directly; measures.js still runs client-side for search/filter/expand,
   but only writes into a mount when that mount is still empty (see
   renderX() in measures.js) — a JS-enabled visitor never sees a re-render
   flash, and a no-JS visitor keeps exactly what this script wrote.

   No dependencies: this requires measures.js directly (its pure
   buildXHTML() functions need no DOM — see the comment above
   buildPillarsHTML() in that file) and does plain string surgery on the
   HTML files between paired HTML-comment markers, e.g.:

     <div id="pgd" class="pg"><!--PRERENDER:pgd--><!--/PRERENDER:pgd--></div>

   Marker-delimited rather than tag-delimited on purpose: the pillar cards
   and measure list both nest <div>s inside the very mount they render into,
   so "match from the opening tag to the next closing tag of the same name"
   would stop at the first nested </div> instead of the mount's own. Fixed
   literal marker strings don't have that problem, and make it obvious in
   the source which spans are machine-written.

   Usage: node build/prerender.js
   Run this after any change to measures.js's data (MEASURES, PILLARS,
   COMMITMENTS, FAQ, SECTION_INTRO/SECTION_TAKEAWAY) and commit the result —
   no build step at deploy time, just a checked-in generated file, the same
   way scorecard.html and comparison.html already work. */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const data = require(path.join(ROOT, "measures.js"));

function replaceMarked(html, id, content) {
  var open = "<!--PRERENDER:" + id + "-->";
  var close = "<!--/PRERENDER:" + id + "-->";
  var i = html.indexOf(open), j = html.indexOf(close);
  if (i === -1 || j === -1 || j < i) {
    throw new Error("prerender markers for \"" + id + "\" not found or out of order");
  }
  return html.slice(0, i + open.length) + content + html.slice(j);
}

function writeIfChanged(file, content) {
  var before = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (before === content) {
    console.log("  unchanged " + path.basename(file));
    return;
  }
  fs.writeFileSync(file, content, "utf8");
  console.log("  wrote     " + path.basename(file) + " (" + content.length + " bytes)");
}

console.log("Pre-rendering measures.js data into static HTML...");

(function buildIndex() {
  var file = path.join(ROOT, "index.html");
  var html = fs.readFileSync(file, "utf8");
  html = replaceMarked(html, "pgd", data.buildPillarsHTML());
  html = replaceMarked(html, "ccrd", data.buildCommitmentsHTML());
  html = replaceMarked(html, "fqc", data.buildFaqHTML());
  writeIfChanged(file, html);
})();

(function buildMeasuresPage() {
  var file = path.join(ROOT, "measures.html");
  var html = fs.readFileSync(file, "utf8");
  html = replaceMarked(html, "mctr", data.buildMeasuresHTML());
  writeIfChanged(file, html);
})();

console.log("Done.");

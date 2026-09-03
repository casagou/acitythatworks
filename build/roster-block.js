#!/usr/bin/env node
/* Writes the "who is on this page, and who is not" block into scorecard.html
   and profiles.html from data/applied-letters.json, between ROSTER markers.

   It exists because "OUT" was doing two jobs. A candidate who has filed a
   nomination but published nothing to score is not in the same position as
   someone who is not running, and printing both under one heading reads as a
   verdict on the first. The data file keeps them apart; this writes both
   lists, with the reason beside every name.

   Usage: node build/roster-block.js */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const A = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "applied-letters.json"), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const scored = A.candidates.length;
const lettered = A.candidates.filter((c) => c.letter).length;
const answered = A.candidates.filter((c) => c.n > 0).length;

function row(name, office, status, why, href) {
  return '<li><div class="rb-n">' + (href ? '<a href="' + esc(href) + '">' + esc(name) + "</a>" : esc(name)) +
    '<span class="rb-o">' + esc(office) + "</span></div>" +
    '<div class="rb-s">' + esc(status) + "</div>" +
    '<div class="rb-w">' + esc(why) + "</div></li>";
}

/* Name them. A count alone asks the reader to trust the count. */
function onPageFor(SC) {
  const chips = A.candidates
    .slice()
    .sort((a, b) => (b.n - a.n) || a.name.localeCompare(b.name))
    .map((c) => '<a class="rb-chip' + (c.letter ? " has" : "") + '" href="' + SC + '#sc-' + esc(c.key) + '">' +
      esc(c.name) + (c.letter ? '<b>' + esc(c.letter) + "</b>" : '<i>' + c.n + "</i>") + "</a>")
    .join("");
  return '<div class="rb-grp">' +
    '<h3 class="rb-h">On the scorecard · ' + scored + " names</h3>" +
    '<p class="rb-x">Every candidate with a live door. <strong>' + lettered + "</strong> carry a letter; <strong>" +
    (scored - lettered) + "</strong> do not yet — a letter needs five answered measures and is ruled by hand. <strong>" +
    answered + "</strong> have at least one measure answered. The figure after a name is its letter, or how many measures are answered.</p>" +
    '<div class="rb-chips">' + chips + "</div></div>";
}

const notScored = (A.notScored || []).length
  ? '<div class="rb-grp">' +
    '<h3 class="rb-h">Filed, but nothing published to score · ' + A.notScored.length +
    (A.notScored.length === 1 ? " name" : " names") + "</h3>" +
    '<p class="rb-x">A profile, no column, no letter. This is a statement about what has been published, not about the candidate.</p>' +
    '<ul class="rb-list">' + A.notScored.map((c) =>
      row(c.name, c.office, c.status, c.why, c.profile ? "/profiles/" + c.slug : null)).join("") +
    "</ul></div>"
  : "";

const out = (A.out || []).length
  ? '<div class="rb-grp">' +
    '<h3 class="rb-h">Not on the site · ' + A.out.length + " names</h3>" +
    '<p class="rb-x">No accepted nomination and no located 2026 campaign, or confirmed not running. Named here so their absence is on the record rather than silent.</p>' +
    '<ul class="rb-list">' + A.out.map((c) => row(c.name, c.office, c.status || "", c.why, null)).join("") +
    "</ul></div>"
  : "";

/* The block is written into two pages, so a chip cannot use a bare
   fragment: the sc-* ids exist only on the scorecard. Each page gets its
   own base — empty on the scorecard, absolute from profiles.html. */
function blockFor(SC) {
return '' +
  '<section class="roster" id="roster">' +
  '<h2 class="hub-h2">Who is on this page, and who is not</h2>' +
  '<p class="hub-sub">The field changes until nominations close on <strong>11 September 2026</strong>. ' +
  'This list is the site\'s own copy of the ' +
  '<a href="https://app.notion.com/p/3ade245ae5f38128b340f55bc7df17f5" target="_blank" rel="noopener">applied compute table</a>, ' +
  'checked at build time — if the page and the table disagree, the build fails rather than publishing the difference.</p>' +
  '<div class="rb-cols">' + onPageFor(SC) + notScored + out + "</div>" +
  '<p class="hub-note"><strong>Missing someone, or listed wrongly?</strong> Write to ' +
  '<a href="mailto:info@acitythatworks.ca">info@acitythatworks.ca</a>. Corrections are free and dated, and the ' +
  'field is re-verified against the City\'s Declaration of Candidates after 11 September.</p>' +
  "</section>";
}

let wrote = 0;
for (const file of ["scorecard.html", "profiles.html"]) {
  const p = path.join(ROOT, file);
  let s = fs.readFileSync(p, "utf8");
  const re = /(<!-- ROSTER:START -->)[\s\S]*?(<!-- ROSTER:END -->)/;
  if (!re.test(s)) { console.error(file + ": no ROSTER:START/END markers"); process.exit(1); }
  const out2 = s.replace(re, "$1\n" + blockFor(file === "profiles.html" ? "/scorecard" : "") + "\n$2");
  if (out2 !== s) { fs.writeFileSync(p, out2); wrote++; console.log("  wrote roster into " + file); }
  else console.log("  unchanged " + file);
}
console.log("roster block:", scored, "on the scorecard ·", (A.notScored || []).length, "filed but unscored ·", (A.out || []).length, "off the site");

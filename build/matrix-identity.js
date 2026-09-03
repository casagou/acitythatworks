#!/usr/bin/env node
/* Who each candidate is, in the twelve-topic table as well as the field table.
   ------------------------------------------------------------------------
   "The field at a glance" identifies a person by four facts: the name, the
   seat, whether they hold it now, and where the framework reads them as
   sitting. The twelve-topic table further down the same page named the seat
   and stopped — so a reader who scrolled from one to the other lost the two
   facts they had just been given, and had to hold "incumbent" and
   "Centre-Right" in their head to use the second table.

   This writes the same identity line into the who-cell of every row in that
   table. It patches the built page rather than regenerating it: build/matrix.js
   builds the table from matrix-v3.js and build/sc5.json, both of which are a
   July vintage that still lists Chris Coleman and carries pre-rescore letters,
   so running it would undo four newer corrections to publish an older field.
   Everything here comes from the #scdata payload already in the page — the
   same source the glance table and the detail panels read — so the two tables
   cannot disagree about who someone is.

   Idempotent: it rewrites whatever the who-cell currently holds, so running it
   twice is the same as running it once.

   Usage: node build/matrix-identity.js */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SC = path.join(ROOT, "scorecard.html");

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let html = fs.readFileSync(SC, "utf8");
const m = html.match(/<script id="scdata" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.error("scdata not found in scorecard.html"); process.exit(1); }
const D = JSON.parse(m[1]);

const byKey = {};
D.cands.forEach((c) => { byKey[c.key] = c; });

/* The same line the glance table prints, in the same order: standing first
   because it is the fact a reader scans for, then the seat and the lean. */
function identity(c) {
  const seat = c.office === "Mayor" ? "Mayor" : "Council";
  const standing = c.kind === "inc" ? "Incumbent" : "New";
  const lean = c.lean
    ? c.lean + (c.leanTags && c.leanTags.length ? " · " + c.leanTags.join(" · ") : "")
    : "";
  return '<span class="wr">' +
    '<span class="wr-tag wr-' + (c.kind === "inc" ? "inc" : "new") + '">' + standing + "</span>" +
    '<span class="wr-t">' + esc(seat) + (lean ? " · " + esc(lean) : "") + "</span>" +
    "</span>";
}

let patched = 0, missing = [];
/* Anchor on the row id so a name that appears elsewhere on the page cannot be
   caught, and replace only the <span class="wr"> inside that row. */
html = html.replace(
  /(<tr id="sc-([A-Za-z]{2})"[\s\S]*?<span class="whon">[\s\S]*?)<span class="wr">[\s\S]*?<\/span>(?=<\/span>)/g,
  (whole, head, key) => {
    const c = byKey[key];
    if (!c) { missing.push(key); return whole; }
    patched++;
    return head + identity(c);
  }
);

if (missing.length) {
  console.error("rows with no candidate in the payload: " + missing.join(", "));
  process.exit(1);
}
if (patched !== D.cands.length) {
  console.error("patched " + patched + " rows but the payload holds " + D.cands.length +
    " candidates — the who-cell markup has changed shape");
  process.exit(1);
}

fs.writeFileSync(SC, html);
console.log("matrix identity: " + patched + " rows carry seat, standing and lean");

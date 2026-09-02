#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const KEYS = [
  ["alto", "Al"], ["harris", "Hr"], ["mcguigan", "Mg"], ["caradonna", "Ca"],
  ["dell", "De"], ["thompson", "Th"], ["kim", "Ki"], ["loughton", "Lo"],
  ["hammond", "Ha"], ["gardiner", "Ga"], ["cseszko", "Cs"], ["rothe", "Ro"],
  ["bowkett", "Bo"], ["mcinnis", "Mc"], ["lee", "Le"], ["sandor", "Sa"],
  ["garcia", "Gg"], ["girard", "Gi"], ["gibbs", "Gb"], ["dion", "Di"],
];

function norm(m) {
  return String(m || "")
    .replace(/–/g, "-")
    .replace(/\s+/g, "")
    .replace(/M66b\/c/i, "M66b/M66c")
    .replace(/M45b\/c/i, "M45b/M45c")
    .toLowerCase();
}

const slugs = {};
const byMeasure = {};
for (const [slug, key] of KEYS) {
  slugs[key] = slug;
  const p = path.join(ROOT, "data", "rating-cards", slug + ".json");
  if (!fs.existsSync(p)) continue;
  const card = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const cell of card.cells || []) {
    if (cell.kind !== "scored" && cell.kind !== "record") continue;
    const m = norm(cell.measure);
    if (!byMeasure[m]) byMeasure[m] = {};
    byMeasure[m][key] = { n: cell.n, mark: cell.mark, kind: cell.kind };
  }
}

const out = {
  slugs,
  keys: KEYS.map((k) => k[1]),
  byMeasure,
};
const dest = path.join(ROOT, "cite-index.json");
fs.writeFileSync(dest, JSON.stringify(out) + "\n");
console.log("wrote cite-index.json", Object.keys(byMeasure).length, "measures");

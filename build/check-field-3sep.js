#!/usr/bin/env node
/* Evidence-only field check for the 3 Sep 2026 City list + TC interview.
   Letters and n/55 counts must stay locked. No grades are applied here. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const fail = [];
function ok(cond, msg) { if (!cond) fail.push(msg); }

const APPLIED = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "applied-letters.json"), "utf8"));

/* Byte-equivalent letters and counts from main. Do not add, drop, or reletter. */
const LOCKED = {
  Al: { letter: "C−", n: 26 },
  Hr: { letter: "C+", n: 7 },
  Mg: { letter: null, n: 15 },
  Mc: { letter: "B", n: 25 },
  Gg: { letter: "C", n: 14 },
  Ga: { letter: "C−", n: 15 },
  Ha: { letter: "C", n: 10 },
  Ca: { letter: "C+", n: 30 },
  De: { letter: "D", n: 14 },
  Th: { letter: null, n: 10 },
  Ki: { letter: null, n: 17 },
  Lo: { letter: "D", n: 21 },
  Cs: { letter: null, n: 5 },
  Ro: { letter: null, n: 7 },
  Bo: { letter: "B−", n: 10 },
  Le: { letter: "B", n: 14 },
  Sa: { letter: "B", n: 23 },
  Gi: { letter: "D", n: 16 },
  Gb: { letter: null, n: 1 },
  Di: { letter: null, n: 7 },
};
ok(APPLIED.candidates.length === Object.keys(LOCKED).length, "applied candidate count drifted");
for (const c of APPLIED.candidates) {
  const lock = LOCKED[c.key];
  ok(!!lock, "unexpected applied row " + c.key);
  if (!lock) continue;
  ok(c.letter === lock.letter, c.key + " letter drifted: " + c.letter + " vs " + lock.letter);
  ok(c.n === lock.n, c.key + " n drifted: " + c.n + " vs " + lock.n);
}

const toml = fs.readFileSync(path.join(ROOT, "netlify.toml"), "utf8");
ok(/from = "\/build"/.test(toml) && /status = 404/.test(toml), "/build 404 missing from netlify.toml");
ok(/from = "\/build\/\*"/.test(toml), "/build/* 404 missing from netlify.toml");

const hub = fs.readFileSync(path.join(ROOT, "profiles.html"), "utf8");
const atk = fs.readFileSync(path.join(ROOT, "profiles", "atkinson.html"), "utf8");
const alto = fs.readFileSync(path.join(ROOT, "profiles", "alto.html"), "utf8");
const harris = fs.readFileSync(path.join(ROOT, "profiles", "harris.html"), "utf8");
const mcg = fs.readFileSync(path.join(ROOT, "profiles", "mcguigan.html"), "utf8");
const roster = fs.readFileSync(path.join(ROOT, "scorecard.html"), "utf8");
const pub = hub + atk + alto + harris + mcg + roster;

ok(!/Three declared mayoral/.test(pub), "stale TC 'three declared' frame still published");
ok(!/no 2026 campaign website, platform, social account or coverage/.test(pub), "Atkinson 'no 2026 coverage' claim still published");
ok(!/No 2026 campaign website, platform document, campaign social account, endorsement or news coverage was located/.test(pub), "Atkinson vintage 'no coverage' claim still published");
ok(!/first substantive 2026 interview/.test(pub), "unqualified 'first substantive 2026 interview' still published");

ok(/JOHNSTON, David/.test(hub) && /David Johnston/.test(hub), "Johnston missing from hub");
ok(/JOHNSTON, David/.test(roster) && /David Johnston/.test(roster), "Johnston missing from roster");
ok(!fs.existsSync(path.join(ROOT, "profiles", "johnston.html")), "invented Johnston profile page exists");
ok((APPLIED.notScored || []).some((n) => n.name === "David Johnston" && n.profile === false), "Johnston not in notScored as field-status-only");
ok((APPLIED.notScored || []).some((n) => n.name === "Lyall Atkinson" && n.profile === true), "Atkinson missing from notScored");

ok(/expression of intent/.test(hub) && /not on the City/.test(hub), "Harris/McGuigan City nomination FLAG missing on hub");
ok(/expression of intent/.test(harris) && /expression of intent/.test(mcg), "Harris/McGuigan intent FLAG missing on profiles");

const gillis = (APPLIED.out || []).find((n) => n.name === "Peter Rose Gillis");
const haley = (APPLIED.out || []).find((n) => n.name === "Owen Haley");
ok(gillis && /indicated/.test(gillis.why) && /Expression of intent only/.test(gillis.why), "Gillis not labelled TC indication / intent");
ok(haley && /indicated/.test(haley.why) && /Expression of intent only/.test(haley.why), "Haley not labelled TC indication / intent");
ok(haley && !/Named only on a third-party candidate list/.test(haley.why), "Haley still described as third-party-list only");
ok(/Peter Rose Gillis/.test(roster) && /Owen Haley/.test(roster), "Gillis/Haley missing from roster");

ok(/\$17 million/.test(atk) && /Atkinson\/TC/.test(atk), "Atkinson $17M not labelled Atkinson/TC");
ok(/\$10\.35M/.test(atk) && /\$13\.612M/.test(atk), "City CSWB figures missing from Atkinson page");
ok(/I’m willing to work with all parties to get this problem solved/.test(atk), "Atkinson direct quote missing");
ok(/CHEK/.test(atk) && /20 Aug/.test(atk), "CHEK 20 Aug qualifier missing on Atkinson page");

ok(/93 new shelter spaces/.test(hub) && /97 new living spaces/.test(hub), "Alto 93 vs 97 note missing from hub");
ok(/93 new shelter spaces/.test(alto) && /97 new living spaces/.test(alto), "Alto 93 vs 97 note missing from profile");
ok(!/4-space difference of/.test(pub) && !/shortfall of four/.test(pub), "Alto 93/97 inferred as a 4-space difference");

/* City-accepted council set: the four already marked on the hub, plus six
   added as field-status only. Do not invent a count; name the ten. */
const ACCEPTED_COUNCIL = [
  "Bowkett", "Caradonna", "Cseszko", "Dell", "Dion",
  "Garcia", "Gardiner", "Girard", "Hammond", "Rothe"
];
ok(ACCEPTED_COUNCIL.every((n) => roster.includes(n)), "accepted council name missing from roster");
ok(/Bowkett, Caradonna, Cseszko, Dell, Dion, Garcia, Gardiner, Girard, Hammond and Rothe/.test(roster), "full accepted council list missing from roster");
ok(!/Hammond only/.test(roster), "stale 'Hammond only' council list still on roster");
ok(/Jeremy Caradonna/.test(hub) && /declared Dec 21 2025 · nomination accepted/.test(hub), "Caradonna hub status missing nomination accepted");
ok(/Matt Dell/.test(hub) && /declared Dec 31 2025 · nomination accepted/.test(hub), "Dell hub status missing nomination accepted");
ok(/Melissa Cseszko/.test(hub) && /declared May 12 2026 · nomination accepted/.test(hub), "Cseszko hub status missing nomination accepted");
ok(/Karen Rothe/.test(hub) && /declared May 27 2026 · nomination accepted/.test(hub), "Rothe hub status missing nomination accepted");
ok(/Martin Girard/.test(hub) && /cand-martin-girard[\s\S]*?Council candidate · nomination accepted/.test(hub), "Girard hub status missing nomination accepted");
ok(/Shona Dion/.test(hub) && /cand-shona-dion[\s\S]*?Council candidate · nomination accepted/.test(hub), "Dion hub status missing nomination accepted");

if (fail.length) {
  console.error("check-field-3sep FAILED:");
  fail.forEach((m) => console.error("  " + m));
  process.exit(1);
}
console.log("check-field-3sep: ok — letters/counts locked, City list, TC attribution, Johnston visible, /build 404 held");

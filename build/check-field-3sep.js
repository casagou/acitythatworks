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
function hubCard(id) {
  const start = hub.indexOf('id="' + id + '"');
  if (start < 0) return "";
  const end = hub.indexOf("</article>", start);
  return end < 0 ? hub.slice(start) : hub.slice(start, end);
}
const rosterNote = (roster.match(/<p class="hub-note">Field status from the[\s\S]*?<\/p>/) || [""])[0];

ok(!/Three declared mayoral/.test(pub), "stale TC 'three declared' frame still published");
ok(!/no 2026 campaign website, platform, social account or coverage/.test(pub), "Atkinson 'no 2026 coverage' claim still published");
ok(!/No 2026 campaign website, platform document, campaign social account, endorsement or news coverage was located/.test(pub), "Atkinson vintage 'no coverage' claim still published");
ok(!/first substantive 2026 interview/.test(pub), "unqualified 'first substantive 2026 interview' still published");

ok(/JOHNSTON, David/.test(hub) && /David Johnston/.test(hub), "Johnston missing from hub");
ok(/JOHNSTON, David/.test(roster) && /David Johnston/.test(roster), "Johnston missing from roster");
ok(!fs.existsSync(path.join(ROOT, "profiles", "johnston.html")), "invented Johnston profile page exists");
ok((APPLIED.notScored || []).some((n) => n.name === "David Johnston" && n.profile === false), "Johnston not in notScored as field-status-only");
ok((APPLIED.notScored || []).some((n) => n.name === "Lyall Atkinson" && n.profile === true), "Atkinson missing from notScored");

ok(/MILLER, Gregoor/.test(hub) && /Gregoor Miller/.test(hub), "Miller missing from hub");
ok(/MILLER, Gregoor/.test(roster) && /Gregoor Miller/.test(roster), "Miller missing from roster");
ok(!fs.existsSync(path.join(ROOT, "profiles", "miller.html")), "invented Miller profile page exists");
ok((APPLIED.notScored || []).some((n) => n.name === "Gregoor Miller" && n.profile === false), "Miller not in notScored as field-status-only");
ok(/Mayor, nomination accepted/.test(hubCard("cand-gregoor-miller")), "Miller hub status missing nomination accepted");
ok(/Field status on the roster/.test(hubCard("cand-gregoor-miller")), "Miller hub card is not field-status-only");
ok(!/Full profile/.test(hubCard("cand-gregoor-miller")), "Miller hub card invented a full-profile link");

ok(/GERVAIS-HARRISON, Darren/.test(hub) && /Darren Gervais-Harrison/.test(hub), "Gervais-Harrison missing from hub");
ok(/GERVAIS-HARRISON, Darren/.test(roster) && /Darren Gervais-Harrison/.test(roster), "Gervais-Harrison missing from roster");
ok(!fs.existsSync(path.join(ROOT, "profiles", "gervais-harrison.html")), "invented Gervais-Harrison profile page exists");
ok(!fs.existsSync(path.join(ROOT, "profiles", "gervais.html")), "invented gervais.html profile page exists");
ok((APPLIED.notScored || []).some((n) => n.name === "Darren Gervais-Harrison" && n.profile === false), "Gervais-Harrison not in notScored as field-status-only");
ok(/Mayor, nomination accepted/.test(hubCard("cand-darren-gervais-harrison")), "Gervais-Harrison hub status missing nomination accepted");
ok(/Field status on the roster/.test(hubCard("cand-darren-gervais-harrison")), "Gervais-Harrison hub card is not field-status-only");
ok(!/Full profile/.test(hubCard("cand-darren-gervais-harrison")), "Gervais-Harrison hub card invented a full-profile link");
ok(!/expression of intent/i.test(hubCard("cand-darren-gervais-harrison")), "Gervais-Harrison hub has expression-of-intent copy");

ok(/HARRIS, Mike/.test(hub) && /Mayor, announced · nomination accepted/.test(hubCard("cand-mike-harris")), "Harris hub status missing nomination accepted");
ok(/<p class="idstatus">Mayor, announced · nomination accepted<\/p>/.test(harris), "Harris profile status line missing nomination accepted");
ok(!/expression of intent/i.test(harris), "Harris profile still has expression-of-intent copy");
ok(!/not on the accepted-mayor list/.test(harris), "Harris profile still says not on accepted-mayor list");
ok(/lists HARRIS, Mike among accepted mayor nominations/.test(harris), "Harris profile missing City-accepted nomination sentence");
ok(!/Harris and McGuigan have announced; neither is on the accepted-mayor list/.test(atk), "Atkinson page still marks Harris as not accepted");
ok(/HARRIS, Mike/.test(atk) && /MCGUIGAN, Bruce/.test(atk) && /GERVAIS-HARRISON, Darren/.test(atk), "Atkinson page lost current accepted-mayor list");
ok(!/McGuigan has announced/.test(atk), "Atkinson page still marks McGuigan as intent-only");
ok(!/expression of intent/.test(atk) && !/not on the accepted-mayor list/.test(atk), "Atkinson page still has McGuigan intent FLAG");
ok(/HARRIS, Mike/.test(hub) && /MCGUIGAN, Bruce/.test(hub) && /Mayor, announced · nomination accepted/.test(hubCard("cand-bruce-mcguigan")), "McGuigan hub status missing nomination accepted");
ok(/<p class="idstatus">Mayor, announced · nomination accepted<\/p>/.test(mcg), "McGuigan profile status line missing nomination accepted");
ok(!/expression of intent/i.test(mcg), "McGuigan profile still has expression-of-intent copy");
ok(!/not on the accepted-mayor list/.test(mcg), "McGuigan profile still says not on accepted-mayor list");
ok(!/until the City list/.test(mcg), "McGuigan profile still has until-the-City-list copy");
ok(/lists MCGUIGAN, Bruce among accepted mayor nominations/.test(mcg), "McGuigan profile missing City-accepted nomination sentence");
ok(!/expression of intent/.test(hub), "hub still has expression-of-intent copy");
ok(!/expression of intent/.test(hubCard("cand-bruce-mcguigan")), "McGuigan hub still on expression-of-intent FLAG");
ok(!/expression of intent/.test(hubCard("cand-mike-harris")), "Harris hub still on expression-of-intent FLAG");
ok(!/not on the City/.test(hubCard("cand-bruce-mcguigan")), "McGuigan hub still says not on the City list");

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

/* City-accepted set: 7 mayor + 17 council. Name them; do not invent a count. */
const ACCEPTED_COUNCIL = [
  "Bowkett", "Caradonna", "Cseszko", "Dell", "Dion",
  "Garcia", "Gardiner", "Gibbs", "Girard", "Hammond",
  "Kim", "Lee", "Loughton", "McInnis", "Rothe", "Sandor", "Thompson"
];
const ACCEPTED_MAYORS = [
  "ALTO, Marianne", "ATKINSON, Lyall", "GERVAIS-HARRISON, Darren",
  "HARRIS, Mike", "JOHNSTON, David", "MCGUIGAN, Bruce", "MILLER, Gregoor"
];
ok(ACCEPTED_COUNCIL.every((n) => roster.includes(n)), "accepted council name missing from roster");
ok(ACCEPTED_MAYORS.every((n) => roster.includes(n) && hub.includes(n)), "accepted mayor City-list line missing");
ok(/Bowkett, Caradonna, Cseszko, Dell, Dion, Garcia, Gardiner, Gibbs, Girard, Hammond, Kim, Lee, Loughton, McInnis, Rothe, Sandor and Thompson/.test(roster), "full accepted council list missing from roster");
ok(/ALTO, Marianne; ATKINSON, Lyall; GERVAIS-HARRISON, Darren; HARRIS, Mike; JOHNSTON, David; MCGUIGAN, Bruce; and MILLER, Gregoor/.test(roster), "full accepted mayor list missing from roster");
ok(!/ALTO, Marianne; ATKINSON, Lyall; HARRIS, Mike; JOHNSTON, David; MCGUIGAN, Bruce; and MILLER, Gregoor/.test(rosterNote), "stale 6-mayor City list still on roster");
ok(!/Rothe and Thompson/.test(rosterNote), "stale 16-council City list still on roster");
ok(!/Hammond only/.test(roster), "stale 'Hammond only' council list still on roster");
ok(!/accepted mayor nominations are ALTO, Marianne; ATKINSON, Lyall; and JOHNSTON, David/.test(rosterNote), "stale 3-mayor City list still on roster");
ok(!/opened 3 Sep/.test(rosterNote), "stale 'opened 3 Sep' current-list copy still on roster");
ok(/Jeremy Caradonna/.test(hub) && /declared Dec 21 2025 · nomination accepted/.test(hub), "Caradonna hub status missing nomination accepted");
ok(/Matt Dell/.test(hub) && /declared Dec 31 2025 · nomination accepted/.test(hub), "Dell hub status missing nomination accepted");
ok(/Melissa Cseszko/.test(hub) && /declared May 12 2026 · nomination accepted/.test(hub), "Cseszko hub status missing nomination accepted");
ok(/Karen Rothe/.test(hub) && /declared May 27 2026 · nomination accepted/.test(hub), "Rothe hub status missing nomination accepted");
ok(/Martin Girard/.test(hub) && /cand-martin-girard[\s\S]*?Council candidate · nomination accepted/.test(hub), "Girard hub status missing nomination accepted");
ok(/Shona Dion/.test(hub) && /cand-shona-dion[\s\S]*?Council candidate · nomination accepted/.test(hub), "Dion hub status missing nomination accepted");
ok(/Peter Gibbs/.test(hub) && /cand-peter-gibbs[\s\S]*?Council candidate · nomination accepted/.test(hub), "Gibbs hub status missing nomination accepted");
ok(/Susan Kim/.test(hub) && /cand-susan-kim[\s\S]*?Councillor · nomination accepted/.test(hub), "Kim hub status missing nomination accepted");
ok(/Bella Lee/.test(hub) && /cand-bella-lee[\s\S]*?declared June 2026 · nomination accepted/.test(hub), "Lee hub status missing nomination accepted");
ok(/Krista Loughton/.test(hub) && /declared June 3 2026 · nomination accepted/.test(hub), "Loughton hub status missing nomination accepted");
ok(/Arthur McInnis/.test(hub) && /declared June 25 2026 · nomination accepted/.test(hub), "McInnis hub status missing nomination accepted");
ok(/Dave Thompson/.test(hub) && /declared January 2026 · nomination accepted/.test(hub), "Thompson hub status missing nomination accepted");
ok(/Jack Sandor/.test(hub) && /Council candidate, declared June 2026 · nomination accepted/.test(hubCard("cand-jack-sandor")), "Sandor hub status missing nomination accepted");
ok(!/Owen Haley/.test(hub), "Haley invented as a live-door on the hub");

if (fail.length) {
  console.error("check-field-3sep FAILED:");
  fail.forEach((m) => console.error("  " + m));
  process.exit(1);
}
console.log("check-field-3sep: ok — letters/counts locked, City list 7 mayor + 17 council, TC attribution, Johnston/Miller/Gervais-Harrison field-status only, /build 404 held");

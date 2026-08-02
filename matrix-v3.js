/* Candidate Comparison Matrix — v3.0 numeric data
   ================================================
   Transcribed from the Notion master "Topic Scoring v3.0 — Numeric Re-Grade
   Under the Two-Question Methodology" (31 July 2026) and the hub page
   "Candidate Comparison Matrix" v3.0 (1 August 2026).

   This file is the single source of truth for the scorecard. Every published
   grade, mean and pillar figure is recomputed from GRID at build time by
   build/matrix.js — nothing is hand-copied into the page — so a transcription
   error in the grid surfaces as a mismatch against the master's own published
   mean rather than as a wrong number nobody notices.

   The scale, in full, because a grade nobody can recompute is a grade nobody
   should trust. Each mark answers two questions in order:

     Q1 does the candidate share the goal?
        Commits  states an action they will take
        Agrees   names it as a goal or priority, states no action
        Mentions raises the topic, states no goal
        Disagrees a recorded vote against, or explicit opposition

     Q2 how would they do it?
        Same       names the mechanism ACTW proposes
        Comparable a different mechanism doing substantially the same work
        Target     no mechanism, but a number, a date or a dollar figure
        Neither

   Excluded and never scored: no public position, Record (a fact about a term
   in office), no information. Excluded marks are left out of the mean
   entirely, so silence never lowers a grade — it only narrows the base. */

const MATRIX_META = {
  version: "3.0",
  date: "1 August 2026",
  topics: 55,
  marks: 225,
  graded: 15,
  program: "v1.9.1",
  measures: 131,
};

/* Q1 x Q2 -> mark name and value. "Mentions" with a named or comparable
   instrument resolves upward, which is why those two cells carry the row
   above's value rather than a lower one. */
const SCALE = {
  q1: [
    { key: "commits", label: "Commits", desc: "states an action they will take" },
    { key: "agrees", label: "Agrees", desc: "names it as a goal or priority but states no action" },
    { key: "mentions", label: "Mentions", desc: "raises the topic, states no goal" },
    { key: "disagrees", label: "Disagrees", desc: "a recorded vote against, or an explicit statement of opposition" },
  ],
  q2: [
    { key: "same", label: "Same instrument", desc: "names the mechanism ACTW proposes" },
    { key: "comparable", label: "Comparable", desc: "a different mechanism doing substantially the same work" },
    { key: "target", label: "Target, no instrument", desc: "no mechanism, but a number, a date or a dollar figure" },
    { key: "neither", label: "Neither", desc: "neither a mechanism nor a target" },
  ],
  cells: {
    commits:   { same: "aligned",  comparable: "close",    target: "partialPlus", neither: "partial" },
    agrees:    { same: "close",    comparable: "partialPlus", target: "partial",  neither: "weak" },
    mentions:  { same: "up",       comparable: "up",       target: "weak",        neither: "weak" },
    disagrees: { same: "opposed",  comparable: "opposed",  target: "opposed",     neither: "opposed" },
  },
  marks: {
    aligned:     { label: "Aligned",  value: 3.0,  cls: "a" },
    close:       { label: "Close",    value: 2.0,  cls: "b" },
    partialPlus: { label: "Partial+", value: 1.5,  cls: "c" },
    partial:     { label: "Partial",  value: 1.0,  cls: "c" },
    weak:        { label: "Weak",     value: 0.5,  cls: "d" },
    opposed:     { label: "Opposed",  value: -2.0, cls: "f" },
  },
  /* Ordered high to low; first band whose floor the mean reaches wins. */
  bands: [
    { g: "A",  min: 2.75 }, { g: "A−", min: 2.50 }, { g: "B+", min: 2.25 },
    { g: "B",  min: 2.00 }, { g: "B−", min: 1.75 }, { g: "C+", min: 1.50 },
    { g: "C",  min: 1.25 }, { g: "C−", min: 1.00 }, { g: "D",  min: 0.50 },
    { g: "F",  min: -Infinity },
  ],
  floor: 3, // below three scored topics no letter is shown
};

/* Column order in GRID. */
const CANDIDATES = [
  { key: "Al", name: "Marianne Alto",     office: "Mayor",     status: "Declared 20 May 2026", statusNote: "Unopposed", grade: "B−", mean: 1.81, n: 24, posture: "Progressive incumbent. “Experience that delivers.”" },
  { key: "Ca", name: "Jeremy Caradonna",  office: "Council",   status: "Declared 21 Dec 2025", grade: "C+", mean: 1.50, n: 14, posture: "Progressive bloc leader. Climate and housing. Sponsored the VicPD ask cut" },
  { key: "De", name: "Matt Dell",         office: "Council",   status: "Declared 31 Dec 2025", grade: "C",  mean: 1.45, n: 19, posture: "Progressive. Pro-housing, arts, technology curiosity" },
  { key: "Th", name: "Dave Thompson",     office: "Council",   status: "Declared Jan 2026", grade: "B−", mean: 1.77, n: 15, posture: "Progressive. Climate and Vision Zero" },
  { key: "Ki", name: "Susan Kim",         office: "Council",   status: "Unconfirmed", statusNote: "Livable CRD volunteer list only, no outlet launch located", grade: "C", mean: 1.31, n: 16, posture: "Progressive system critic. Voted against the 2026 budget from the left" },
  { key: "Lo", name: "Krista Loughton",   office: "Council",   status: "Unconfirmed", statusNote: "Same source, listed there as “Laughton”", grade: "C+", mean: 1.50, n: 12, posture: "Progressive. STEP throughput originator" },
  { key: "Co", name: "Chris Coleman",     office: "Council",   status: "Undeclared", statusNote: "His stated mid-July window has closed", grade: "D", mean: 0.67, n: 9, posture: "Centrist. “Governance over politics.” Chairs the Citizens’ Assembly Council Committee" },
  { key: "Ha", name: "Stephen Hammond",   office: "Council",   status: "Declared 6 July 2026", grade: "C", mean: 1.37, n: 15, posture: "Fiscal restraint and enforce existing rules" },
  { key: "Ga", name: "Marg Gardiner",     office: "Council",   status: "Declared Jan 2026", grade: "C−", mean: 1.12, n: 16, posture: "Fiscal restraint. “Rigour in budgeting”" },
  { key: "Cs", name: "Melissa Cseszko",   office: "Council",   status: "Declared 12 May 2026", statusNote: "Detailed platform pending", grade: "D", mean: 0.67, n: 6, posture: "Small-business owner. “Results over ideology”" },
  { key: "Ro", name: "Karen Rothe",       office: "Council",   status: "Declared 27 May 2026", grade: "D", mean: 0.67, n: 9, posture: "Career BC public servant. “Restoring confidence in city hall”" },
  { key: "Bo", name: "Wendy Bowkett",     office: "Council",   status: "Declared ~15 May 2026", grade: "D", mean: 0.56, n: 8, posture: "Business strategist, MBA, former VDRA leader. “Refocus on the basics”" },
  { key: "Mc", name: "Arthur McInnis",    office: "Council",   status: "Declared 25 June 2026", grade: "B−", mean: 1.81, n: 16, posture: "30+ years lawyer, educator, infrastructure and finance advisor. “Back to basics”" },
  { key: "Le", name: "Bella Lee",         office: "Council",   status: "Declared June 2026", grade: "C+", mean: 1.62, n: 21, posture: "27, senior advisor MCFD. Cost of living. Platform self-described as a living document" },
  { key: "Sa", name: "Jack Sandor",       office: "Council",   status: "Declared June 2026", grade: "B", mean: 2.14, n: 25, posture: "27, Red Seal electrician. Housing supply as root cause. Nine-section platform, running jointly with Lee" },
];

/* Not scored: nothing locatable in any source. Unknown, not empty. */
const UNKNOWN = {
  name: "Garcia · Gibbs · Girard · Haley", office: "Council",
  note: "No site, platform, statement or coverage located for any of the four. Roughly a quarter of the apparent council field. These pages should not be read as evidence about them.",
};

const PILLARS = [
  { key: "foundation", label: "Foundation", full: "Honouring the Host Nations", emoji: "🌿" },
  { key: "liveable",   label: "Liveable",   full: "A Liveable City",  emoji: "🏠" },
  { key: "safe",       label: "Safe",       full: "A Safe City",      emoji: "🛡️" },
  { key: "beautiful",  label: "Beautiful",  full: "A Beautiful City", emoji: "🌳" },
  { key: "managed",    label: "Well-Managed", full: "A Well-Managed City", emoji: "💰" },
  { key: "democratic", label: "Democratic", full: "A Democratic City", emoji: "🗳️" },
];

/* 55 topics in master order, each tagged with the pillar it scores under. */
const TOPICS = [
  ["M1–M5",   "Host Nations Foundation", "foundation"],
  ["M6",      "Housing supply + composition", "liveable"],
  ["M6b",     "Land bank + co-operative housing", "liveable"],
  ["M7",      "Permits + AI pre-screening", "liveable"],
  ["M7b",     "Pre-approved pattern-book housing", "liveable"],
  ["M8/M8b",  "DCC reductions + suite amnesty", "liveable"],
  ["M9/M9b/M9c/M64", "Tenant protections, STR, heat bylaw", "liveable"],
  ["M10",     "Transparent algorithmic waitlist", "liveable"],
  ["M11",     "Homelessness — Housing First + STEP", "liveable"],
  ["M12/M13/M13b/M13c", "Families, childcare, doctors, youth", "liveable"],
  ["M13d",    "Standing School District 61 agreement", "liveable"],
  ["M14/M16/M17/M18", "Cleanliness and the public realm", "liveable"],
  ["M19/M22/M38–M42b", "Mobility + Vision Zero", "liveable"],
  ["M20b/M23b", "Walking + transit jurisdiction", "liveable"],
  ["M24b/M25b", "Accessibility and public washrooms", "liveable"],
  ["M25",     "Fix roads first", "liveable"],
  ["M26",     "Downtown Public Order Team", "safe"],
  ["M26b",    "Civilian crisis response team", "safe"],
  ["M27",     "Bylaw enforcement hours 6am–10pm", "safe"],
  ["M28",     "Data-targeted enforcement", "safe"],
  ["M28b",    "Business security cost-spreading", "safe"],
  ["M28d",    "Community paramedicine", "safe"],
  ["M29/M29b", "VicPD + regional policing review", "safe"],
  ["M30",     "Streetlights, no surveillance", "safe"],
  ["M31/M31b/M31c/M32", "Dashboards, enforcement record", "safe"],
  ["M33",     "Enforce existing bylaws", "safe"],
  ["M33b",    "Drug-use buffer zones", "safe"],
  ["M34–M37", "Encampment response, night lighting", "safe"],
  ["M43–M46b", "Heritage and cultural venues", "beautiful"],
  ["M45b/M45c", "Pedestrianisation, Centennial Square", "beautiful"],
  ["M47–M49", "Heritage incentives, lighting, parks", "beautiful"],
  ["M50/M50b/M51/M52", "Culture, sport, arts floor", "beautiful"],
  ["M53/M53b/M53c", "GIS, AI imagery, LIDAR", "beautiful"],
  ["M53d",    "Published municipal AI standard", "beautiful"],
  ["M54–M57", "Procurement, open data, Wi-Fi, EV", "beautiful"],
  ["M58/M58b/M64b", "Climate, district energy, seismic", "beautiful"],
  ["M59–M63", "Trees, ecosystems, emergency prep", "beautiful"],
  ["M15",     "Managed competition", "managed"],
  ["M65",     "Rotating zero-based reviews", "managed"],
  ["M66",     "Tax glide path, residential rate cap", "managed"],
  ["M66b/M66c", "Refund + debt rule", "managed"],
  ["M66d",    "The Household Bill", "managed"],
  ["M67",     "Quarterly performance dashboard", "managed"],
  ["M68",     "Administrative overhead by attrition", "managed"],
  ["M69",     "Real-estate rationalisation", "managed", "NEW"],
  ["M70/M70b", "Provincial downloading ledger", "managed"],
  ["M70c",    "Regional bill, CRD cost, Goldstream", "managed"],
  ["M71–M73d", "Business, downtown, economy", "managed"],
  ["M74/M75/M76", "Capital threshold, parking, fees", "managed"],
  ["M77/M78/M78b", "Referendum + 5-step process", "democratic"],
  ["M79/M79b", "Integrity Commissioner", "democratic"],
  ["M79c–f",  "Lobbyist registry, FOI fee", "democratic", "NEW"],
  ["M80/M80b/M80c", "Neighbourhoods, language, LAPs", "democratic"],
  ["M82/M82b", "Turnout and ballot access", "democratic", "NEW"],
  ["M81",     "Saanich amalgamation", "democratic"],
];

/* One row per topic, in TOPICS order; one value per candidate, in CANDIDATES
   order (Al Ca De Th Ki Lo Co Ha Ga Cs Ro Bo Mc Le Sa).
   "." = excluded (no public position, Record, or no information). */
const GRID = [
  "3.0 0.5 0.5 0.5 0.5 0.5  .   .   .   .   .   .   .   .   . ",  // M1–M5
  "1.0 2.0 1.0 2.0 2.0 0.5 -2.0 -2.0 -2.0  .   .  1.0 2.0 2.0 2.0", // M6
  "3.0  .   .   .   .   .   .   .   .   .   .   .  2.0 2.0 2.0",  // M6b
  " .   .  0.5  .   .   .   .  0.5 0.5  .   .   .  0.5  .   . ",  // M7
  " .   .   .   .   .   .   .   .   .   .   .   .  3.0  .   . ",  // M7b
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .  2.0",  // M8/M8b
  "2.0 3.0 3.0 3.0 3.0 3.0  .   .   .   .   .   .   .  2.0 2.0",  // M9/M9b/M9c/M64
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .   . ",  // M10
  "2.0 2.0 0.5 3.0 0.5 3.0 0.5 3.0 2.0  .   .   .   .  2.0 2.0",  // M11
  "3.0  .   .   .   .   .   .   .   .   .   .   .   .  2.0 2.0",  // M12/M13/M13b/M13c
  "1.0  .   .   .   .   .   .   .   .   .   .   .   .   .  2.0",  // M13d
  "2.0  .  2.0  .   .   .   .   .  0.5  .   .  0.5  .  2.0  . ",  // M14/M16/M17/M18
  "0.5 0.5 0.5 3.0 2.0  .   .   .   .  0.5  .   .  0.5 2.0 2.0",  // M19/M22/M38–M42b
  "0.5 2.0  .  2.0 2.0  .   .   .   .   .  0.5  .  0.5 2.0 3.0",  // M20b/M23b
  " .   .   .   .  3.0  .   .   .   .   .   .   .   .   .  2.0",  // M24b/M25b
  " .   .   .   .   .   .   .   .   .   .   .  0.5  .  0.5  . ",  // M25
  "1.0 1.0 1.0 1.0 1.0 2.0 1.0 1.0 2.0  .   .   .   .   .   . ",  // M26
  " .   .   .   .   .   .   .   .   .   .   .   .  3.0 0.5 3.0",  // M26b
  "2.0 1.0 1.0 1.0 1.0 1.0 1.0 0.5 1.0 0.5 0.5 0.5 0.5  .   . ",  // M27
  " .   .   .   .   .   .   .  3.0  .   .   .   .   .   .   . ",  // M28
  " .   .   .   .   .   .   .  3.0  .   .   .   .   .  2.0  . ",  // M28b
  " .   .   .   .   .   .   .   .   .   .   .   .  3.0  .   . ",  // M28d
  "3.0 2.0 2.0 2.0 2.0 2.0 0.5 0.5 0.5  .   .   .   .  3.0 3.0",  // M29/M29b
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .   . ",  // M30
  " .   .   .   .   .   .   .  2.0  .   .   .   .   .   .   . ",  // M31/M31b/M31c/M32
  "3.0 3.0 3.0 3.0 -2.0 3.0 3.0 3.0 3.0  .   .   .   . -2.0  . ", // M33
  " .   .   .   .   .   .   .  3.0  .   .   .   .   .   .   . ",  // M33b
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .   . ",  // M34–M37
  "2.0 0.5 3.0  .   .   .   .   .  0.5 1.0  .   .   .   .  2.0",  // M43–M46b
  " .   .   .   .   .   .   .   .   .   .  0.5  .   .   .   . ",  // M45b/M45c
  "2.0  .   .   .   .   .   .   .   .   .   .  0.5  .  2.0 2.0",  // M47–M49
  "2.0  .  2.0  .   .   .   .   .   .   .   .   .   .  2.0 2.0",  // M50/M50b/M51/M52
  " .   .  3.0  .   .   .   .   .   .   .   .   .   .   .   . ",  // M53/M53b/M53c
  " .   .  0.5  .   .   .   .   .   .   .   .   .   .   .   . ",  // M53d
  " .   .   .  2.0  .   .   .   .   .   .   .   .   .   .  2.0",  // M54–M57
  "1.0 0.5 0.5 2.0 0.5  .   .   .   .   .   .   .   .  2.0 2.0",  // M58/M58b/M64b
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .  2.0",  // M59–M63
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .   . ",  // M15
  " .   .  2.0  .   .   .   .   .  0.5 1.0  .   .  3.0  .   . ",  // M65
  " .   .   .   .  1.0 0.5 0.5 1.0 1.0  .   .   .  2.0  .   . ",  // M66
  " .   .   .   .   .   .   .   .   .   .  1.0  .   .   .   . ",  // M66b/M66c
  " .   .   .   .   .   .   .   .   .   .   .   .  0.5 1.0 0.5",  // M66d
  " .   .   .   .   .   .   .   .  2.0 0.5 0.5 0.5 3.0  .  2.0",  // M67
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .   . ",  // M68
  "2.0  .   .   .   .   .   .   .   .   .   .   .   .   .  3.0",  // M69 NEW
  "0.5 2.0 0.5 0.5 0.5 0.5  .  0.5 0.5  .   .   .   .  2.0  . ",  // M70/M70b
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .   . ",  // M70c
  "2.0  .   .   .   .   .   .   .   .  0.5 0.5  .   .  2.0 3.0",  // M71–M73d
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .   . ",  // M74/M75/M76
  "1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0 1.0  .  0.5 0.5 2.0 1.0  . ",  // M77/M78/M78b
  " .   .   .   .   .   .  0.5 0.5 3.0  .  0.5  .  3.0  .   . ",  // M79/M79b
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .  2.0",  // M79c–f NEW
  "2.0  .   .  0.5 3.0 1.0  .   .  2.0  .  1.5 0.5 0.5 2.0 2.0",  // M80/M80b/M80c
  " .   .   .   .   .   .   .   .   .   .   .   .   .   .  2.0",  // M82/M82b NEW
  "2.0  .   .   .   .   .   .   .   .   .   .   .   .   .   . ",  // M81
];

/* Published pillar grades, kept so the build can assert its own recomputation
   against the master rather than silently diverging from it. n is the number
   of scored topics in that pillar for that candidate. */
const PILLAR_PUBLISHED = {
  Sa: { foundation: null, liveable: [2.10, 10], safe: [null, 2], beautiful: [2.00, 6], managed: [2.12, 4], democratic: [2.00, 3] },
  Al: { foundation: [null, 1], liveable: [1.67, 9], safe: [2.25, 4], beautiful: [1.75, 4], managed: [1.50, 3], democratic: [1.67, 3] },
  Mc: { foundation: null, liveable: [1.42, 6], safe: [2.17, 3], beautiful: null, managed: [2.12, 4], democratic: [1.83, 3] },
  Th: { foundation: [null, 1], liveable: [2.60, 5], safe: [1.75, 4], beautiful: [null, 2], managed: [null, 1], democratic: [null, 2] },
  Le: { foundation: null, liveable: [1.83, 9], safe: [0.88, 4], beautiful: [2.00, 3], managed: [1.67, 3], democratic: [null, 2] },
  Ca: { foundation: [null, 1], liveable: [1.90, 5], safe: [1.75, 4], beautiful: [null, 2], managed: [null, 1], democratic: [null, 1] },
  Lo: { foundation: [null, 1], liveable: [2.17, 3], safe: [2.00, 4], beautiful: null, managed: [null, 2], democratic: [null, 2] },
  De: { foundation: [null, 1], liveable: [1.25, 6], safe: [1.75, 4], beautiful: [1.80, 5], managed: [null, 2], democratic: [null, 1] },
  Ha: { foundation: null, liveable: [0.50, 3], safe: [2.00, 8], beautiful: null, managed: [null, 2], democratic: [null, 2] },
  Ki: { foundation: [null, 1], liveable: [2.08, 6], safe: [0.50, 4], beautiful: [null, 1], managed: [null, 2], democratic: [null, 2] },
  Ga: { foundation: null, liveable: [0.25, 4], safe: [1.62, 4], beautiful: [null, 1], managed: [1.00, 4], democratic: [2.00, 3] },
  Co: { foundation: null, liveable: [null, 2], safe: [1.38, 4], beautiful: null, managed: [null, 1], democratic: [null, 2] },
  Cs: { foundation: null, liveable: [null, 1], safe: [null, 1], beautiful: [null, 1], managed: [0.67, 3], democratic: null },
  Ro: { foundation: null, liveable: [null, 1], safe: [null, 1], beautiful: [null, 1], managed: [0.67, 3], democratic: [0.83, 3] },
  Bo: { foundation: null, liveable: [0.67, 3], safe: [null, 1], beautiful: [null, 1], managed: [null, 1], democratic: [null, 2] },
};

/* The three defects the master documents. Published on the site verbatim in
   substance, because a grade with a known defect that the publisher does not
   disclose is worse than no grade. */
const DEFECTS = [
  {
    n: 1,
    title: "Opposed at −2.0 is arithmetically asymmetric, and it decides four column grades",
    body: "The positive range runs 0.5 to 3.0; the negative value is −2.0. On a four-topic column one Opposed cancels roughly four Aligned. Gardiner's F on Liveable is one Missing Middle vote. Lee's D on Safe is one sentence about 7 a.m. tent removals, sitting alongside a regional police force commitment graded Aligned. <strong>A grade that a single vote can drive to F is a grade an opponent will destroy in one sentence.</strong>",
    table: [
      ["Gardiner · Liveable", "F (0.25, n=4)", "C− (1.00, n=3)"],
      ["Kim · Safe", "D (0.50, n=4)", "C (1.33, n=3)"],
      ["Lee · Safe", "D (0.88, n=4)", "B− (1.83, n=3)"],
      ["Hammond · Liveable", "D (0.50, n=3)", "insufficient basis (1.75, n=2)"],
    ],
    fix: "This site applies the master's third option: <strong>where a column contains an Opposed and fewer than five scored topics, no letter is shown</strong>. The mean and the marks are still published, so nothing is hidden — but a letter that one recorded vote can move by four bands is not presented as a verdict.",
  },
  {
    n: 2,
    title: "Small-n columns produce letters that look like findings and are not",
    body: "Eleven of the fifteen candidates have at least one pillar graded on exactly three topics. Three is the stated floor; it is too low for a letter that will be read as a verdict.",
    fix: "Every pillar grade on this site shows its <strong>n</strong>, and any pillar resting on fewer than five scored topics is marked as a thin base.",
  },
  {
    n: 3,
    title: "“Commits” does not distinguish authoring an instrument from voting for one",
    body: "Hammond authoring the sheltering ban and seven colleagues voting for it all score Aligned 3.0. That is the methodology working as written, and it is also why Hammond's Safe pillar understates the distance between him and the field on enforcement.",
    fix: "Not corrected. Fixing it needs a fifth Q1 level, which would change every mark on the page. It is disclosed instead.",
  },
];

/* Sourcing rule — the seven things that may not produce a score. */
const NON_SOURCES = [
  ["Frame or tone alignment", "“Results over ideology” is not a zero-based budgeting commitment."],
  ["A stated lane", "Caring about safety is not a position on bylaw enforcement hours."],
  ["Bloc membership", "Voting with a bloc on other files does not establish a position on this one."],
  ["Third-party endorsement", "An organization's policy is that organization's, not the candidate's."],
  ["Professional background or a role held", "A trades background is not a permit-reform position. A board seat, a committee chairmanship or a ministry post is not a position."],
  ["Absence of action", "An incumbent who did not do something has not opposed it. That is Record, not Opposed."],
  ["Adjacency", "A position on a related measure is not a position on this measure."],
];

/* What a blank means, per candidate. The master's point: blank was doing
   three different jobs and hiding the difference. */
const PLATFORM_STATUS = [
  ["The 9 sitting members", "Four years of recorded votes, motions authored, statements, plus campaign material where published. The richest base in the field", "No position located on a measure they had four years and a vote to act on. <strong>The strongest blank in the document</strong>"],
  ["Jack Sandor", "Nine-section platform at jacksandor.ca, plus nine full sub-pages <strong>not yet read</strong>, plus launch coverage", "Detailed platform published and this measure is not in the summary. <strong>His grade will move on a full sub-page read</strong>"],
  ["Bella Lee", "Full policy page at bellalee.ca, self-described living document to be finalised before the September writ", "Published and not covered, pending finalisation"],
  ["Arthur McInnis · Karen Rothe · Wendy Bowkett", "Full platform pages read in full 30 July, plus launch coverage", "Detailed platform published and this measure is not in it"],
  ["Marianne Alto", "2022 platform at altomayor.ca <strong>not updated for 2026</strong>, plus May 2026 launch priorities", "<strong>Genuinely no published position</strong>, not “not yet located.” Distinct from Cseszko's state"],
  ["Melissa Cseszko", "Site with clear positioning language. <strong>A detailed platform has not been released</strong>", "<strong>Not yet published, which is not the same as absent.</strong> Re-score on release"],
  ["Garcia · Gibbs · Girard · Haley", "<strong>Nothing locatable.</strong> No site, platform, statement or coverage", "<strong>Unknown, not empty.</strong> These pages should not be read as evidence about them"],
];

/* The four bias disclosures the master makes about itself. */
const BIAS = [
  "Its author is operationally involved with several declared candidates. The v1.8 audit therefore applied the evidence rule hardest to the candidate most favourable to the framework: Cseszko lost five of six aligned marks.",
  "The largest single upgrades have gone to candidates with no relationship to the framework — McInnis in v1.8, Sandor and Lee in v3.0.",
  "The coverage audit found the topic selection had been under-scoring the field, not ACTW.",
  "The Differentiation Index lists ideas ACTW lacks, several from sitting progressive councillors.",
];

/* Open items the master states before the page informs anything. */
const OPEN_ITEMS = [
  "<strong>Sandor publishes nine full platform sub-pages.</strong> Only the summary was read, so his grade is computed on summary bullets alone and will move on a full read.",
  "<strong>Lee's platform self-describes as a living document</strong> to be finalised before the writ drops in September.",
  "<strong>Dell's M45c mark could not be re-sourced</strong> and is excluded here until a sentence is attached.",
  "<strong>The May 2026 cooling bylaw disposition is unverified.</strong> Four Aligned marks rest on co-authorship reported but not checked against minutes.",
  "<strong>Kim's and Loughton's declared status rests on a single volunteer-maintained source</strong> that contains at least one confirmed error.",
  "<strong>Coleman's intentions are unknown</strong> past his own stated mid-July window.",
  "<strong>Garcia, Gibbs, Girard and Haley have no locatable public record of any kind.</strong> Direct outreach is the only path that resolves this before the campaign period.",
  "<strong>A re-score after nominations close on 11 September is mandatory</strong> before this document informs anything.",
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { MATRIX_META, SCALE, CANDIDATES, UNKNOWN, PILLARS, TOPICS, GRID, PILLAR_PUBLISHED, DEFECTS, NON_SOURCES, PLATFORM_STATUS, BIAS, OPEN_ITEMS };
}

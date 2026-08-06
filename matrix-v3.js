/* Candidate Comparison Matrix — v3.4 numeric data
   ================================================
   Transcribed from the §6 complete coverage grid of the Notion master
   "Grade Breakdown — Every Topic, Every Candidate" v3.4 (5 August 2026),
   which supersedes the v3.0 numeric re-grade of 31 July as the authoritative
   cell-by-cell source. Four upstream revisions are folded into this file:

     v3.1 (1 Aug) — a full mark-by-mark re-verification. 15 marks excluded
     for resting on characterisations rather than citable sentences
     (pro-reconciliation, pro-transit, province-blaming, climate leadership,
     pro-heritage tone, unnamed pro-enforcement votes); 3 regraded (the CSWB
     adoption vote carried Commits at M26 and M27 but Agrees at M11 for the
     same councillors on the same act, and is now Commits at all three).
     Every excluded mark was worth +0.5, below almost every mean, so the
     correction ran upward. Each is restorable the moment a vote or quotation
     is attached.

     v3.2 (2 Aug) — Opposed moved from −2.0 to −1.0. See SCALE below and the
     DEFECTS entry, which records the conflict of interest on that change.

     v3.3 (5 Aug) — plain-English definitions added to all 55 topics upstream,
     and nine coverage-grid row labels widened where the abbreviation had
     dropped a concept the topic actually covers. No mark, mean or grade
     changed. Both are carried here, in TOPICS: the widened labels as `label`,
     the definitions as `what`. An accessibility audit had found that a reader
     could see how many candidates were scored on a topic without being able
     to tell what the topic was, which on the seven topics carrying no marks
     at all meant reporting that the whole field was silent on something
     without ever saying what that something was.

     v3.4 (5 Aug) — those definitions verified line by line against the
     Program master at v1.10. 54 of 55 rewritten, 28 carrying a real defect,
     four describing the wrong measure outright. No mark, mean or grade
     changed again, but two topic TITLES were corrected with them and both are
     carried here: M8 is a 5% rental vacancy target of which the DCC
     reduction is one instrument, not a DCC measure; and M45c is one
     signature public-space project chosen by residents from a shortlist of
     three, of which a Centennial Square renewal is one candidate alongside
     a Pandora linear park and an Inner Harbour promenade — naming
     Centennial Square as the project stated a choice residents have not
     made. Both titles had been wrong on the published page.

     The master's own lesson from v3.4 is worth repeating where the work was
     done rather than only where it was reported: every one of the 28 defects
     existed because the definitions had been drafted from a review of the
     framework instead of from the framework, and the defect rate on that
     method was 51%. The `what` strings below are transcribed from the v3.4
     master, which is transcribed from Program v1.10 — not summarised from
     either. Four of them name a number the earlier drafts got wrong: graffiti
     is a 90% standard within 48 hours rather than a flat 48 hours, attrition
     is 12 to 15% rather than 10%, bylaw hours today run 7 a.m. to 4 p.m. on
     weekdays only, and real-estate proceeds retire the debt attached to the
     property sold under s.188 of the Community Charter rather than general
     debt.

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
  version: "3.4",
  date: "5 August 2026",
  scorecard: "5.1",
  scorecardDate: "4 August 2026",
  topics: 55,
  marks: 210,
  record: 8,
  graded: 15,
  program: "v1.10",
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
    /* −1.0 since v3.2. At −2.0 a single contrary vote sat 2.5 points below the
       nearest positive mark, which on a small column decided the letter by
       itself. −1.0 keeps every vote counted and negative without letting one
       of them outweigh ten considered positions. */
    opposed:     { label: "Opposed",  value: -1.0, cls: "f" },
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
  { key: "Ca", name: "Jeremy Caradonna",  office: "Council",   status: "Declared 21 Dec 2025", grade: "B−", mean: 1.77, n: 11, posture: "Progressive bloc leader. Climate and housing. Sponsored the VicPD ask cut" },
  { key: "De", name: "Matt Dell",         office: "Council",   status: "Declared 31 Dec 2025", grade: "C+", mean: 1.73, n: 15, posture: "Progressive. Pro-housing, arts, technology curiosity" },
  { key: "Th", name: "Dave Thompson",     office: "Council",   status: "Declared Jan 2026", grade: "B−", mean: 1.96, n: 13, posture: "Progressive. Climate and Vision Zero" },
  { key: "Ki", name: "Susan Kim",         office: "Council",   status: "Unconfirmed", statusNote: "Livable CRD volunteer list only, no outlet launch located", grade: "C+", mean: 1.54, n: 14, posture: "Progressive system critic. Voted against the 2026 budget from the left" },
  { key: "Lo", name: "Krista Loughton",   office: "Council",   status: "Unconfirmed", statusNote: "Same source, listed there as “Laughton”", grade: "C+", mean: 1.70, n: 10, posture: "Progressive. STEP throughput originator" },
  { key: "Co", name: "Chris Coleman",     office: "Council",   status: "Undeclared", statusNote: "His stated mid-July window has closed", grade: "D", mean: 0.83, n: 9, posture: "Centrist. “Governance over politics.” Chairs the Citizens’ Assembly Council Committee" },
  { key: "Ha", name: "Stephen Hammond",   office: "Council",   status: "Declared 6 July 2026", grade: "C", mean: 1.43, n: 15, posture: "Fiscal restraint and enforce existing rules" },
  { key: "Ga", name: "Marg Gardiner",     office: "Council",   status: "Declared Jan 2026", grade: "C", mean: 1.25, n: 14, posture: "Fiscal restraint. “Rigour in budgeting”" },
  { key: "Cs", name: "Melissa Cseszko",   office: "Council",   status: "Declared 12 May 2026", statusNote: "Detailed platform pending", grade: "D", mean: 0.67, n: 6, posture: "Small-business owner. “Results over ideology”" },
  { key: "Ro", name: "Karen Rothe",       office: "Council",   status: "Declared 27 May 2026", grade: "D", mean: 0.67, n: 9, posture: "Career BC public servant. “Restoring confidence in city hall”" },
  { key: "Bo", name: "Wendy Bowkett",     office: "Council",   status: "Declared ~15 May 2026", grade: "D", mean: 0.56, n: 8, posture: "Business strategist, MBA, former VDRA leader. “Refocus on the basics”" },
  { key: "Mc", name: "Arthur McInnis",    office: "Council",   status: "Declared 25 June 2026", grade: "B−", mean: 1.81, n: 16, posture: "30+ years lawyer, educator, infrastructure and finance advisor. “Back to basics”" },
  { key: "Le", name: "Bella Lee",         office: "Council",   status: "Declared June 2026", grade: "C+", mean: 1.67, n: 21, posture: "27, senior advisor MCFD. Cost of living. Platform self-described as a living document" },
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

/* The 55 topics in master order. Each carries the measure ids it covers, the
   master's own topic code (F1, L1..L15, S1..S12, B1..B9, W1..W12, D1..D6 — the
   numbering §5 and §6 of the Grade Breakdown both use, so a reader can carry a
   cell straight back to the source), the pillar it scores under, its title,
   and `what` — the plain-English definition of the measure itself.

   `what` is the whole point of v3.3 and v3.4 and it is not decoration. Before
   it existed, the line under every topic was a statistics line: a reader could
   see that nine candidates were scored on L11 without being able to find out
   anywhere on the page what L11 proposed. On the seven topics where the entire
   field is silent, that meant publishing "nobody has a position on this"
   without saying what "this" was. Every acronym the framework uses is expanded
   in place here — DCC, STR, STEP, GIS, LIDAR, FOI, IoT — rather than assumed.

   The titles are the master's §5 headings, which are the fuller form. §6
   abbreviates them to fit sixteen columns on one screen; where the two differ
   the longer one is carried, because this file feeds a page with room for it. */
const TOPICS = [
  { id: "M1–M5", code: "F1", pillar: "foundation",
    label: "Host Nations Foundation",
    what: "Standing government-to-government tables with the Songhees and Esquimalt Nations, a 5% Indigenous procurement target, lək̓ʷəŋən place names, cultural protocols, and an urban Indigenous liaison." },
  { id: "M6", code: "L1", pillar: "liveable",
    label: "Housing supply + composition",
    what: "Build 12,000-plus net new homes by 2030 and set what kind gets built: at least 25% missing middle, 20% three-bedroom or larger, 15% below-market, 30% purpose-built rental, reported quarterly." },
  { id: "M6b", code: "L2", pillar: "liveable",
    label: "Land bank + co-operative housing",
    what: "A public inventory of city-owned land, a fund to acquire more, and disposition scored on speed to completion, affordability and family-sized units rather than on price alone, with right of first refusal for non-profit and Indigenous housing partners." },
  { id: "M7", code: "L3", pillar: "liveable",
    label: "Permits + AI pre-screening",
    what: "Publish how long each permit type actually takes and commit to a target: under 6 weeks for simple residential, under 6 months for complex, under 9 months for rezoning. AI pre-screens applications and produces a conformity report for a human to review." },
  { id: "M7b", code: "L4", pillar: "liveable",
    label: "Pre-approved pattern-book housing",
    what: "A free municipal pattern book of pre-approved designs for duplexes, triplexes, fourplexes, townhouses and laneway homes, with an automatic fast lane on the 6-week permit target for anything built from it unamended. BC has published provincial standardised designs; this is the Victoria version." },
  { id: "M8/M8b", code: "L5", pillar: "liveable",
    label: "5% vacancy target, DCC cuts, suite amnesty",
    what: "M8 targets a 5% rental vacancy rate, using targeted Development Cost Charge reductions (the per-unit fees a builder pays the city) for purpose-built rental. M8b is a 24-month amnesty letting owners legalise existing unpermitted suites against a life-safety standard, with no retroactive penalty and no rent reset for the tenant." },
  { id: "M9/M9b/M9c/M64", code: "L6", pillar: "liveable",
    label: "Tenant protections, STR, heat bylaw",
    what: "Demoviction protection (12-month notice, moving-cost compensation, right of return, replacement units), a Renters' Hub for tenant rights, tighter short-term rental licensing, advocacy for vacancy control between tenancies, and a bylaw requiring landlords to keep one room of every rental at or below 26°C during heat warnings." },
  { id: "M10", code: "L7", pillar: "liveable",
    label: "Transparent algorithmic waitlist allocation",
    what: "One digital portal for City-affiliated and partner non-profit housing waitlists, with the point weights published, your position in the queue visible, and no way to jump it. BC Housing remains the social-housing operator." },
  { id: "M11", code: "L8", pillar: "liveable",
    label: "Homelessness — Housing First + STEP throughput",
    what: "Cut unsheltered homelessness by half, from about 320 to under 160, through Housing First, plus a STEP-style programme (Supporting Tenants, Enabling Pathways) that moves stabilised residents out of supportive housing so the unit behind them frees up. Reported as cost per successful placement, not dollars spent." },
  { id: "M12/M13/M13b/M13c", code: "L9", pillar: "liveable",
    label: "Families, childcare, doctors, youth",
    what: "Municipal levers for families: advocacy for 500 new childcare spaces with childcare permits issued in 60 days, school food quality, low-rent clinic space and tax exemptions to recruit family doctors, and programming for 18 to 25 year olds." },
  { id: "M13d", code: "L10", pillar: "liveable",
    label: "Standing School District 61 agreement",
    what: "One standing agreement with School District 61: a published annual work plan, a joint council-and-board meeting held in public once a year, school gyms, fields and playgrounds open to residents outside school hours, and safe walking routes to every school run as a programme rather than a complaint queue." },
  { id: "M14/M16/M17/M18", code: "L11", pillar: "liveable",
    label: "Cleanliness and the public realm",
    what: "A published cleanliness standard: 90% of graffiti removed within 48 hours with the share reported quarterly, an anti-rat and pest plan, street sweeping in the evenings and on weekends downtown, and murals on the surfaces that get tagged repeatedly." },
  { id: "M19/M22/M38–M42b", code: "L12", pillar: "liveable",
    label: "Mobility + Vision Zero",
    what: "Adaptive traffic signals starting with 10 intersections on Douglas Street, advocacy for rapid transit on the E&N corridor to the Westshore, and Vision Zero: the road-safety approach that treats zero traffic deaths as the target rather than an acceptable rate." },
  { id: "M20b/M23b", code: "L13", pillar: "liveable",
    label: "Walking, and transit — what the City controls",
    what: "A published sidewalk gap inventory and crossing standard, and a named capital line for bus lanes, signal priority and stops. Routes, fares and frequency belong to BC Transit, so the City publishes its annual position and how its Commission representatives voted rather than promising what it cannot deliver." },
  { id: "M24b/M25b", code: "L14", pillar: "liveable",
    label: "Accessibility and public washrooms",
    what: "A publicly accessible 24/7 washroom at least every 500 metres downtown, in the Inner Harbour and on the main commercial corridors, plus a 24-month accessibility audit of every City sidewalk, building, park and washroom against a published standard." },
  { id: "M25", code: "L15", pillar: "liveable",
    label: "Fix roads first",
    what: "A sequencing rule inside the existing road capital budget rather than new money: fix the maintenance backlog before building new things, repair potholes within 7 days of report, and publish road condition quarterly." },
  { id: "M26", code: "S1", pillar: "safe",
    label: "Downtown Public Order Team",
    what: "One command structure putting VicPD, bylaw, sanitation and outreach on the same downtown deployment plan, with a single 8 a.m. briefing, one field supervisor per shift and one co-located desk, instead of four agencies working the same block separately." },
  { id: "M26b", code: "S2", pillar: "safe",
    label: "Civilian crisis response team",
    what: "Trained civilian crisis workers, not police, on mental-health and wellness calls, dispatched from the same board as the downtown team, with the dispatch criteria published before launch. It proceeds only if a provincial or health-authority partner cost-shares." },
  { id: "M27", code: "S3", pillar: "safe",
    label: "Bylaw enforcement hours 6am–10pm",
    what: "Extend bylaw enforcement to 6 a.m. to 10 p.m., seven days a week. It currently runs 7 a.m. to 4 p.m. on weekdays only, missing the evenings and weekends when disorder peaks. Funded from the competitive-testing savings at M15." },
  { id: "M28", code: "S4", pillar: "safe",
    label: "Data-targeted enforcement",
    what: "Direct enforcement at the specific addresses and hours the call data identifies rather than spreading patrol evenly, with focused deterrence and Crown coordination on violent repeat offenders, and outreach decoupled from enforcement for everyone else." },
  { id: "M28b", code: "S5", pillar: "safe",
    label: "Business security cost-spreading",
    what: "A capped City reimbursement for street-front businesses in designated high-exposure zones, covering private security hours, glazing repair and sharps-bin servicing above a deductible. Eligibility is set by police call-volume data rather than by application." },
  { id: "M28d", code: "S6", pillar: "safe",
    label: "Community paramedicine",
    what: "Paramedics working proactively with the high-frequency callers who generate the most emergency calls, so the call is never placed. BC Emergency Health Services delivers it; the City funds a partnership share, provides space and advocates." },
  { id: "M29/M29b", code: "S7", pillar: "safe",
    label: "VicPD funding + regional policing review",
    what: "Renegotiate the VicPD cost split with Esquimalt, which Victoria currently funds at 86.33%, with binding mediation if the two cannot agree. Then co-sponsor an 18-month review of whether policing across Greater Victoria should be delivered regionally." },
  { id: "M30", code: "S8", pillar: "safe",
    label: "Smart LED + IoT streetlights, no surveillance",
    what: "Convert Victoria's roughly 7,000 to 10,000 streetlights to connected LEDs that report their own outages, dim adaptively and cut energy cost, with an explicit rule against cameras, facial recognition, audio detection and behavioural AI on that network." },
  { id: "M31/M31b/M31c/M32", code: "S9", pillar: "safe",
    label: "Safety dashboard, published enforcement record, crime target",
    what: "A weekly operations dashboard, a quarterly enforcement record showing outcomes rather than tickets issued, the existing community safety plan retrofitted so every commitment names a legal authority, a lead, a deadline, a target and a cost, and a 15% crime reduction by 2030." },
  { id: "M33", code: "S10", pillar: "safe",
    label: "Enforce existing bylaws (daytime sheltering)",
    what: "The rules already exist, including overnight sheltering in designated parks down by 7 a.m. and sidewalk obstruction. The gap is enforcement capacity, not missing law. This adds no rules and no staff; it commits to applying them consistently and publishing whether we did." },
  { id: "M33b", code: "S11", pillar: "safe",
    label: "Drug-use buffer zones",
    what: "Illicit drug use and possession prohibited within 30 metres of schools, playgrounds, sports fields, libraries and other child-focused spaces, enforced by verbal direction first, then seizure, then referral to treatment, with arrest only where public safety requires it." },
  { id: "M34–M37", code: "S12", pillar: "safe",
    label: "Encampment response, reclaiming spaces, night lighting",
    what: "Same-day removal of structures blocking sidewalks and doorways with belongings stored for retrieval, a 5 p.m. daily publication of available shelter spaces so enforcement only follows capacity, named priority areas (Inner Harbour, Centennial Square and Pandora, Beacon Hill Park), and streetlights dimmed rather than switched off at midnight." },
  { id: "M43–M46b", code: "B1", pillar: "beautiful",
    label: "Heritage and cultural-venue preservation",
    what: "Design standards for new buildings in heritage areas, a Victoria standard for street furniture as it is replaced, restoration incentives for heritage facades, and a right of first refusal plus a lease-bridge fund so long-standing cultural venues are not lost when a lease ends." },
  { id: "M45b/M45c", code: "B2", pillar: "beautiful",
    label: "Pedestrianisation and the signature project",
    what: "Pedestrianisation pilots at Bastion Square, on Government Street in summer and in Fan Tan Alley, reversed after two seasons if they miss published criteria. Plus one signature public-space project chosen by residents from a shortlist of three (a Pandora linear park, a continuous Inner Harbour promenade, or a full Centennial Square renewal) and approved by referendum." },
  { id: "M47–M49", code: "B3", pillar: "beautiful",
    label: "Heritage incentives, lighting, parks",
    what: "Close the gaps in the waterfront walkway so the whole coastline is walkable, keep heritage and ornamental lighting on until midnight instead of switching it off at 10 p.m., and restore skilled horticulture in the parks with a five-year Beacon Hill Park restoration." },
  { id: "M50/M50b/M51/M52", code: "B4", pillar: "beautiful",
    label: "Culture, sport, and the arts funding floor",
    what: "Civic cultural spaces open two evenings a week until 9 p.m. and libraries on Sundays, year-round outdoor activation (night markets, heated patios, busking zones), sport facilities open 6 a.m. to 10 p.m. with the Royal Athletic Park budget restored, and an arts funding floor that cannot be lowered without 6 of 9 councillors and a published reason." },
  { id: "M53/M53b/M53c", code: "B5", pillar: "beautiful",
    label: "GIS, AI consultation imagery, LIDAR",
    what: "Put the City's underground utility records (water, stormwater, sewer, telecom) on one map so the same street is not dug up twice, generate AI imagery so residents can see a proposal before it is built, and run a one-time LIDAR laser scan of downtown. The full digital twin was deliberately dropped as too big for a city Victoria's size." },
  { id: "M53d", code: "B6", pillar: "beautiful",
    label: "Published municipal AI standard",
    what: "A public register of every AI system the City uses, mandatory human decision-making with automated decisions against a resident prohibited, AI-generated images labelled as such, and prompts and outputs treated as records disclosable under freedom of information." },
  { id: "M54–M57", code: "B7", pillar: "beautiful",
    label: "Local-tech procurement, open data, Wi-Fi, EV charging",
    what: "Local-preference scoring for Victoria's technology cluster, the ocean economy named as the city's declared economic vertical, an expanded open-data portal with air-quality sensors and free public Wi-Fi, and more public EV charging." },
  { id: "M58/M58b/M64b", code: "B8", pillar: "beautiful",
    label: "Climate, district energy, seismic",
    what: "A 50% cut in community emissions by 2030 against 2007, district energy (shared low-carbon heat for a cluster of buildings, run as a ring-fenced utility paid for by the ratepayers who use it), and a seismic and coastal-resilience inventory for the hazard Victoria actually faces." },
  { id: "M59–M63", code: "B9", pillar: "beautiful",
    label: "Trees, mode share, ecosystems, emergency preparedness",
    what: "Replace the oldest stormwater pipes and prepare the coast for sea-level rise, expand the Climate Friendly Homes retrofit rebates and finally publish the uptake, plant 5,000 trees toward a 35% canopy by 2035, and shift 60% of trips to transit, walking or cycling by 2030." },
  { id: "M15", code: "W1", pillar: "managed",
    label: "Managed competition",
    what: "Every contract cycle, the City's own crews submit a costed bid alongside private bidders on the same specification, and the cheaper competent option wins. At least 80% of existing City workers are re-hired at equal or better pay whoever wins, and the City winning is a permitted outcome rather than a failure. Phoenix ran this model for a decade." },
  { id: "M65", code: "W2", pillar: "managed",
    label: "Rotating zero-based reviews",
    what: "Every programme justifies itself from zero rather than from last year's number, 3 to 4 service areas per budget cycle on a rotation. Every grant over $50,000 is reviewed against three published questions: is this the City's job, is it delivering, and is someone else already funding it. It is explicitly not a test of a recipient's opinions." },
  { id: "M66", code: "W3", pillar: "managed",
    label: "Tax glide path, capped on the residential rate",
    what: "A declining cap on the property tax increase, 6.5% then 5% then inflation plus population growth of about 3.5%, measured on the residential rate rather than the aggregate. Going above the cap takes 6 of 9 councillors and a published reason." },
  { id: "M66b/M66c", code: "W4", pillar: "managed",
    label: "Over-collection refund + debt rule",
    what: "Where audited results beat budget by more than 1.5% of operating expenditure, the excess goes back as a credit on the next tax notice instead of into reserves. And the scheduled debt-reduction payment stops being available as a balancing item: deferring it takes 6 of 9 councillors and a published reason." },
  { id: "M66d", code: "W5", pillar: "managed",
    label: "The Household Bill",
    what: "One published figure for what the City and the CRD together cost a household per year, property tax plus water, sewer, solid waste and stormwater, given as a dollar amount, a year-over-year change and a five-year forward view, so the real bill is visible instead of split across four lines." },
  { id: "M67", code: "W6", pillar: "managed",
    label: "Quarterly performance dashboard",
    what: "A public dashboard, updated every quarter, carrying more than twenty published series: permit times, pothole repair, crime, the debt set, the Household Bill, the enforcement record, the AI register and the rest, so residents can hold council to account between elections rather than only at them." },
  { id: "M68", code: "W7", pillar: "managed",
    label: "Administrative overhead reduction by attrition",
    what: "Reduce administrative positions by 12 to 15% over the term by not automatically refilling vacancies as people retire or leave, paired with digitising paper processes. No layoffs." },
  { id: "M69", code: "W8", pillar: "managed", isNew: true,
    label: "Real-estate rationalisation",
    what: "A full inventory and utilisation audit of every City-owned property, then sell or lease what does not serve an essential public function. Under section 188 of the Community Charter the proceeds retire debt attached to that property and buy capital assets; they are not available as general revenue, and the measure says so." },
  { id: "M70/M70b", code: "W9", pillar: "managed",
    label: "Provincial downloading ledger",
    what: "A quarterly public ledger of every provincial or federal responsibility Victoria delivers without funding, with an estimated cost per file, twice-yearly advocacy resolutions file by file, and a published list of services the City will not take on any more of without dedicated money." },
  { id: "M70c", code: "W10", pillar: "managed",
    label: "The regional bill, CRD cost and the Goldstream plant",
    what: "A published annual City position on regional cost and a published record of how Victoria's CRD representatives voted, so the part of the bill decided at the region stops being invisible. On the Goldstream filtration plant, ACTW takes no position on whether it should be built, only on the standard of evidence required before a billion-dollar commitment is locked in." },
  { id: "M71–M73d", code: "W11", pillar: "managed",
    label: "Business, downtown, economic development",
    what: "Cut downtown storefront vacancy from 11% to 5%, reduce small-business red tape, protect the last of the industrial and marine-industrial land from residential conversion, and fold tourism and economic development into one small office that owns that one number." },
  { id: "M74/M75/M76", code: "W12", pillar: "managed",
    label: "Capital threshold, first-hour parking, permit fees",
    what: "Voter approval for any new capital project over $25 million, though not for lifecycle replacement of existing infrastructure, a free first hour of downtown parking, and reduced or waived permit fees on renovations under $50,000 that add a suite, improve accessibility or cut energy use." },
  { id: "M77/M78/M78b", code: "D1", pillar: "democratic",
    label: "$25M referendum threshold, 5-step process, material change rule",
    what: "Any new capital project over $25 million goes to a binding public vote, every major project follows the same five steps (consult, design, publish the visualisation and impact analysis, vote, report quarterly during construction), and a private development amended by more than 10% after the public hearing has closed goes back to the people who spoke to it." },
  { id: "M79/M79b", code: "D2", pillar: "democratic",
    label: "Integrity Commissioner + 60-day consultation response",
    what: "An arm's-length Integrity Commissioner with jurisdiction over conflicts of interest, gifts, post-employment restrictions and code-of-conduct breaches, plus a written response to every public consultation within 60 days and the draft published 30 days before the adoption vote." },
  { id: "M79c–f", code: "D3", pillar: "democratic", isNew: true,
    label: "Lobbyist registry, FOI fee, remuneration",
    what: "Published mandate letters and quarterly scorecards so residents can tell who owns what, a searchable registry of meetings between development proponents and council or staff, the $10 freedom-of-information application fee waived, and any change to council pay taking effect only after the next election." },
  { id: "M80/M80b/M80c", code: "D4", pillar: "democratic",
    label: "Neighbourhoods, language access, Local Area Plans",
    what: "Real budgets and a delivery role for neighbourhood associations, civic access in Canada's two official languages (plain-language English plus French for the core forms and notices, with interpretation on request), and two new Local Area Plans per year giving parcel-level certainty about what can be built where." },
  { id: "M82/M82b", code: "D5", pillar: "democratic", isNew: true,
    label: "Community surveys, turnout and ballot access",
    what: "An annual statistically valid survey across all 12 neighbourhoods, plus better ballot access: at least one weekend advance voting day, voting places weighted toward the neighbourhoods that turned out lowest, campus and care-home voting, and a published turnout target of 50% for 2030." },
  { id: "M81", code: "D6", pillar: "democratic",
    label: "Saanich amalgamation",
    what: "Finish the amalgamation file rather than restart it. The Citizens' Assembly already sat and recommended a merger in April 2025, and the 17 October ballot question is non-binding. The Province will not authorise a binding vote until financial, transitional and service-impact analysis is done and First Nations are consulted, so the commitment is to deliver those and then ask again." },
];

/* One row per topic, in TOPICS order; one value per candidate, in CANDIDATES
   order (Al Ca De Th Ki Lo Co Ha Ga Cs Ro Bo Mc Le Sa).

   "." = ⚪ no public position, researched and nothing located.
   "R" = 📋 Record: a documented fact about the 2022–2026 term rather than a
         stated position. Never scored, but distinct from silence — all eight
         are Alto's, and a cell built only from them prints 📋 rather than —
         so a four-year record is not displayed as an absence.

   Both are excluded from every mean. 210 cells carry a value, 8 are Record,
   the remaining 607 of the 15-candidate field are ⚪. */
const GRID = [
  " 3.0    .    .    .    .    .    .    .    .    .    .    .    .    .    .",  // M1–M5
  " 1.0  2.0  1.0  2.0  2.0  0.5 -1.0 -1.0 -1.0    .    .  1.0  2.0  2.0  2.0",  // M6
  " 3.0    .    .    .    .    .    .    .    .    .    .    .  2.0  2.0  2.0",  // M6b
  "   .    .  0.5    .    .    .    .  0.5  0.5    .    .    .  0.5    .    .",  // M7
  "   .    .    .    .    .    .    .    .    .    .    .    .  3.0    .    .",  // M7b
  "   .    .    .    .    .    .    .    .    .    .    .    .    .    .  2.0",  // M8/M8b
  " 2.0  3.0  3.0  3.0  3.0  3.0    .    .    .    .    .    .    .  2.0  2.0",  // M9/M9b/M9c/M64
  "   .    .    .    .    .    .    .    .    .    .    .    .    .    .    .",  // M10
  " 2.0  2.0  1.0  3.0  1.0  3.0  1.0  3.0  2.0    .    .    .    .  2.0  2.0",  // M11
  " 3.0    .    .    .    .    .    .    .    .    .    .    .    .  2.0  2.0",  // M12/M13/M13b/M13c
  " 1.0    .    .    .    .    .    .    .    .    .    .    .    .    .  2.0",  // M13d
  " 2.0    .  2.0    .    .    .    .    .  0.5    .    .  0.5    .  2.0    .",  // M14/M16/M17/M18
  " 0.5    .    .  3.0  2.0    .    .    .    .  0.5    .    .  0.5  2.0  2.0",  // M19/M22/M38–M42b
  " 0.5  2.0    .  2.0  2.0    .    .    .    .    .  0.5    .  0.5  2.0  3.0",  // M20b/M23b
  "   .    .    .    .  3.0    .    .    .    .    .    .    .    .    .  2.0",  // M24b/M25b
  "   .    .    .    .    .    .    .    .    .    .    .  0.5    .  0.5    .",  // M25
  " 1.0  1.0  1.0  1.0  1.0  2.0  1.0  1.0  2.0    .    .    .    .    .    .",  // M26
  "   .    .    .    .    .    .    .    .    .    .    .    .  3.0  0.5  3.0",  // M26b
  " 2.0  1.0  1.0  1.0  1.0  1.0  1.0  0.5    .  0.5  0.5  0.5  0.5    .    .",  // M27
  "   .    .    .    .    .    .    .  3.0    .    .    .    .    .    .    .",  // M28
  "   .    .    .    .    .    .    .  3.0    .    .    .    .    .  2.0    .",  // M28b
  "   .    .    .    .    .    .    .    .    .    .    .    .  3.0    .    .",  // M28d
  " 3.0  2.0  2.0  2.0  2.0  2.0  0.5  0.5  0.5    .    .    .    .  3.0  3.0",  // M29/M29b
  "   .    .    .    .    .    .    .    .    .    .    .    .    .    .    .",  // M30
  "   .    .    .    .    .    .    .  2.0    .    .    .    .    .    .    .",  // M31/M31b/M31c/M32
  " 3.0  3.0  3.0  3.0 -1.0  3.0  3.0  3.0  3.0    .    .    .    . -1.0    .",  // M33
  "   .    .    .    .    .    .    .  3.0    .    .    .    .    .    .    .",  // M33b
  "   .    .    .    .    .    .    .    .    .    .    .    .    .    .    .",  // M34–M37
  " 2.0  0.5  3.0    .    .    .    .    .    .  1.0    .    .    .    .  2.0",  // M43–M46b
  "   R    .    .    .    .    .    .    .    .    .  0.5    .    .    .    .",  // M45b/M45c
  " 2.0    .    .    .    .    .    .    .    .    .    .  0.5    .  2.0  2.0",  // M47–M49
  " 2.0    .  2.0    .    .    .    .    .    .    .    .    .    .  2.0  2.0",  // M50/M50b/M51/M52
  "   .    .  3.0    .    .    .    .    .    .    .    .    .    .    .    .",  // M53/M53b/M53c
  "   .    .  0.5    .    .    .    .    .    .    .    .    .    .    .    .",  // M53d
  "   .    .    .  2.0    .    .    .    .    .    .    .    .    .    .  2.0",  // M54–M57
  " 1.0    .    .  2.0    .    .    .    .    .    .    .    .    .  2.0  2.0",  // M58/M58b/M64b
  "   .    .    .    .    .    .    .    .    .    .    .    .    .    .  2.0",  // M59–M63
  "   R    .    .    .    .    .    .    .    .    .    .    .    .    .    .",  // M15
  "   R    .  2.0    .    .    .    .    .  0.5  1.0    .    .  3.0    .    .",  // M65
  "   R    .    .    .  1.0  0.5  0.5  1.0  1.0    .    .    .  2.0    .    .",  // M66
  "   R    .    .    .    .    .    .    .    .    .  1.0    .    .    .    .",  // M66b/M66c
  "   R    .    .    .    .    .    .    .    .    .    .    .  0.5  1.0  0.5",  // M66d
  "   R    .    .    .    .    .    .    .  2.0  0.5  0.5  0.5  3.0    .  2.0",  // M67
  "   .    .    .    .    .    .    .    .    .    .    .    .    .    .    .",  // M68
  " 2.0    .    .    .    .    .    .    .    .    .    .    .    .    .  3.0",  // M69 NEW
  " 0.5  2.0    .    .  0.5    .    .  0.5  0.5    .    .    .    .  2.0    .",  // M70/M70b
  "   R    .    .    .    .    .    .    .    .    .    .    .    .    .    .",  // M70c
  " 2.0    .    .    .    .    .    .    .    .  0.5  0.5    .    .  2.0  3.0",  // M71–M73d
  "   .    .    .    .    .    .    .    .    .    .    .    .    .    .    .",  // M74/M75/M76
  " 1.0  1.0  1.0  1.0  1.0  1.0  1.0  1.0  1.0    .  0.5  0.5  2.0  1.0    .",  // M77/M78/M78b
  "   .    .    .    .    .    .  0.5  0.5  3.0    .  0.5    .  3.0    .    .",  // M79/M79b
  "   .    .    .    .    .    .    .    .    .    .    .    .    .    .  2.0",  // M79c–f NEW
  " 2.0    .    .  0.5  3.0  1.0    .    .  2.0    .  1.5  0.5  0.5  2.0  2.0",  // M80/M80b/M80c
  "   .    .    .    .    .    .    .    .    .    .    .    .    .    .  2.0",  // M82/M82b NEW
  " 2.0    .    .    .    .    .    .    .    .    .    .    .    .    .    .",  // M81
];

/* Scorecard v5.0 — the fifteen reader-facing columns, and which v3.0 topics
   feed each one. Every one of the 55 topics is used exactly once: nothing is
   double-counted and nothing is dropped, which build/matrix.js asserts.
   General is the whole grid, so it is computed separately rather than listed.

   Placement judgements the master discloses, repeated here so a reader can
   discount them: M7 permits sits in Business & Downtown rather than Housing.
   M54–M57 sits in Climate & Energy because both scored marks in that cluster
   are energy instruments, though the cluster also holds procurement and open
   data. M68 attrition and M69 real-estate rationalisation sit in Fiscal
   Method as asset-and-overhead instruments. M70/M70b stays in Governance. */
const COLUMNS = [
  { key: "general",   label: "General",             short: "Gen",            all: true },
  { key: "housing",   label: "Housing",             short: "Housing",        topics: ["M6", "M6b", "M7b", "M8/M8b", "M9/M9b/M9c/M64", "M10"] },
  { key: "homeless",  label: "Homelessness",        short: "Homeless",       topics: ["M11"] },
  { key: "mobility",  label: "Mobility & Streets",  short: "Mobility",       topics: ["M19/M22/M38–M42b", "M25"] },
  { key: "walk",      label: "Walking & Transit",   short: "Walk/Transit",   topics: ["M20b/M23b"] },
  { key: "climate",   label: "Climate & Energy",    short: "Climate",        topics: ["M54–M57", "M58/M58b/M64b", "M59–M63"] },
  { key: "arts",      label: "Arts & Heritage",     short: "Arts/Herit",     topics: ["M43–M46b", "M45b/M45c", "M47–M49", "M50/M50b/M51/M52"] },
  { key: "family",    label: "Families & Access",   short: "Fam/Access",     topics: ["M12/M13/M13b/M13c", "M13d", "M24b/M25b"] },
  { key: "clean",     label: "Cleanliness",         short: "Clean",          topics: ["M14/M16/M17/M18"] },
  { key: "safety",    label: "Safety",              short: "Safety",         topics: ["M26", "M26b", "M27", "M28", "M28b", "M28d", "M29/M29b", "M30", "M31/M31b/M31c/M32", "M33", "M33b", "M34–M37"] },
  { key: "fiscal",    label: "Fiscal Method",       short: "Fiscal",         topics: ["M15", "M65", "M66", "M67", "M68", "M69"] },
  { key: "cost",      label: "Cost of Living",      short: "Cost of Living", topics: ["M66b/M66c", "M66d", "M70c", "M74/M75/M76"] },
  { key: "business",  label: "Business & Downtown", short: "Business",       topics: ["M7", "M71–M73d"] },
  { key: "govern",    label: "Governance",          short: "Governance",     topics: ["M53/M53b/M53c", "M53d", "M70/M70b", "M77/M78/M78b", "M79/M79b", "M79c–f", "M80/M80b/M80c", "M81", "M82/M82b"] },
  { key: "recon",     label: "Reconciliation",      short: "Recon",          topics: ["M1–M5"] },
];

/* Published pillar grades from §2 of Grade Breakdown v3.4, kept so the build
   can assert its own recomputation against the master rather than silently
   diverging from it. [letter, n] — n is the number of scored topics in that
   pillar for that candidate; letter is null where the master prints · because
   n is below the three-topic floor, and the whole entry is null where there
   is no scored topic at all. The means are deliberately not stored: they are
   what the build computes, and asserting a letter the master published is a
   real check where asserting a mean copied from the same arithmetic is not. */
const PILLAR_PUBLISHED = {
  Sa: { foundation: null, liveable: ["B", 10], safe: [null, 2], beautiful: ["B", 6], managed: ["B", 4], democratic: ["B", 3] },
  Th: { foundation: null, liveable: ["A−", 5], safe: ["B−", 4], beautiful: [null, 2], managed: null, democratic: [null, 2] },
  Al: { foundation: [null, 1], liveable: ["C+", 9], safe: ["B+", 4], beautiful: ["B−", 4], managed: ["C+", 3], democratic: ["C+", 3] },
  Mc: { foundation: null, liveable: ["C", 6], safe: ["B", 3], beautiful: null, managed: ["B", 4], democratic: ["B−", 3] },
  Ca: { foundation: null, liveable: ["B+", 4], safe: ["B−", 4], beautiful: [null, 1], managed: [null, 1], democratic: [null, 1] },
  De: { foundation: null, liveable: ["C+", 5], safe: ["B−", 4], beautiful: ["B", 4], managed: [null, 1], democratic: [null, 1] },
  Lo: { foundation: null, liveable: ["B", 3], safe: ["B", 4], beautiful: null, managed: [null, 1], democratic: [null, 2] },
  Le: { foundation: null, liveable: ["B−", 9], safe: ["C−", 4], beautiful: ["B", 3], managed: ["C+", 3], democratic: [null, 2] },
  Ki: { foundation: null, liveable: ["B", 6], safe: ["D", 4], beautiful: null, managed: [null, 2], democratic: [null, 2] },
  Ha: { foundation: null, liveable: ["D", 3], safe: ["B", 8], beautiful: null, managed: [null, 2], democratic: [null, 2] },
  Ga: { foundation: null, liveable: ["D", 4], safe: ["B−", 3], beautiful: null, managed: ["C−", 4], democratic: ["B", 3] },
  Co: { foundation: null, liveable: [null, 2], safe: ["C", 4], beautiful: null, managed: [null, 1], democratic: [null, 2] },
  Cs: { foundation: null, liveable: [null, 1], safe: [null, 1], beautiful: [null, 1], managed: ["D", 3], democratic: null },
  Ro: { foundation: null, liveable: [null, 1], safe: [null, 1], beautiful: [null, 1], managed: ["D", 3], democratic: ["D", 3] },
  Bo: { foundation: null, liveable: ["D", 3], safe: [null, 1], beautiful: [null, 1], managed: [null, 1], democratic: [null, 2] },
};

/* The 15 marks v3.1 excluded, and the 3 it regraded. Kept as data because the
   candidate profiles on comparison.html are a 31 July transcription of their
   own Notion master and still describe several of these as scored positions.
   Rather than silently editing someone else's prose, the profiles section
   prints this list beside it and says which way the correction ran. Each is
   restorable the moment a vote or a quotation is attached to it. */
const EXCLUSIONS = {
  date: "1 August 2026",
  rule: "A characterisation is not a citable sentence. Fifteen marks rested on tone or posture rather than on something a candidate said or voted for, and were excluded.",
  items: [
    ["Pro-reconciliation", "M1–M5", "Caradonna · Dell · Thompson · Kim · Loughton"],
    ["Pro-transit / pro-bike", "M19/M22/M38–M42b", "Caradonna · Dell"],
    ["Province-blaming present in framing", "M70/M70b", "Dell · Thompson · Loughton"],
    ["Climate leadership stated", "M58/M58b/M64b", "Caradonna · Dell · Kim — the cooling bylaw is already scored once at M9"],
    ["Pro-heritage tone", "M43–M46b", "Gardiner"],
    ["Recorded pro-enforcement votes, unnamed", "M27", "Gardiner — the qualifying vote is already scored once at M33"],
  ],
  regrade: "Three marks were regraded upward: the CSWB adoption vote of 3 July 2025 carried <em>Commits</em> at M26 and M27 but <em>Agrees</em> at M11 for the same councillors on the same act. It is now Commits at all three (Dell, Kim and Coleman at M11, Weak → Partial).",
  sourced: "Two further marks were <strong>sourced rather than changed</strong>: Gardiner and Kim held marks at M70/M70b on thin wording where a real quotation existed. The sentences are attached; the marks themselves are unchanged. It is recorded here because a mark that survives a re-verification on better evidence is a different object from one that was never checked.",
  net: "Every excluded mark was worth +0.5, below almost every mean, so the correction ran <strong>upward</strong>. The defect had been quietly suppressing sitting councillors' grades: Caradonna moved C+ → B− and Dell C → C+.",
};

/* The defects, published on the site verbatim in substance, because a grade
   with a known defect that the publisher does not disclose is worse than no
   grade at all.

   Four of the five are the four §4 of Grade Breakdown v3.4 documents, in its
   order. The fifth — “Commits” not distinguishing authoring an instrument from
   voting for one — was documented at v3.2 and is not restated at v3.4. It is
   kept here rather than dropped, and labelled as carried forward so nobody
   mistakes it for something the current master says. The methodology it
   describes has not changed, so the caveat is still true of every mark on this
   page; and a page whose whole argument is that a publisher should disclose
   what is wrong with its own scale does not get to quietly stop disclosing one
   because the upstream document stopped repeating it. */
const DEFECTS = [
  {
    n: 1,
    status: "resolved",
    title: "Opposed at −2.0 was arithmetically asymmetric — fixed in v3.2 at −1.0",
    body: "The positive range runs 0.5 to 3.0; the negative value was −2.0, which put one contrary vote 2.5 points below the nearest positive mark. Because a grade is a <strong>mean</strong>, on a ten-topic column that is a quarter point of mean — <strong>a full grade band decided by a single vote.</strong> The four options were computed on the real data before one was chosen.",
    table: [
      ["Gardiner", "C− 1.18", "C 1.25", "C 1.32", "C 1.42"],
      ["Hammond", "C 1.37", "C 1.43", "C+ 1.50", "C+ 1.61"],
      ["Coleman", "D 0.72", "D 0.83", "D 0.94", "C− 1.06"],
      ["Kim", "C 1.46", "C+ 1.54", "C+ 1.61", "C+ 1.73"],
      ["Lee", "C+ 1.62", "C+ 1.67", "C+ 1.71", "B− 1.80"],
    ],
    tableHead: ["Candidate", "A. Keep −2.0", "B. −1.0 (chosen)", "C. 0.0", "D. Exclude"],
    fix: "<strong>Option B.</strong> Option A lets one 2023 vote outweigh ten considered positions, which measures the scale rather than the candidate. Option C sets a stated opposition equal in weight to no opposition at all, discarding real information a voter is entitled to. <strong>Option D removes the votes from the calculation entirely, and a scorecard that deletes the evidence it finds inconvenient has no claim on anyone's trust.</strong> B keeps every vote counted, keeps it negative, and stops it deciding a grade by itself.",
    coi: "<strong>The conflict of interest on this change, stated plainly.</strong> Five candidates hold an Opposed mark. <strong>Two of them, Gardiner and Hammond, are incumbents this document's author works with</strong>, and softening the penalty helps them. That is a genuine appearance problem and it does not disappear by being unintentional. What limits it: none of the four coordinated independents the author supports holds an Opposed mark anywhere in the matrix, so the change is worth <strong>nothing</strong> to them. Of the two candidates who actually crossed a band, <strong>one is Susan Kim, a progressive councillor with no relationship to this framework.</strong> The top five positions are identical under the old weighting and the new one.",
  },
  {
    n: 2,
    status: "open",
    isNew: true,
    title: "One mark may rest on a measure text the framework has since rewritten",
    body: "<strong>Susan Kim holds Aligned 3.0 at M80/M80b/M80c</strong>, her highest mark, on non-English grant applications — her own 2022 plank, recorded at the time as absorbed into M80b. <strong>M80b now reads “civic access in Canada's two official languages”</strong>: plain-language English plus French for the core corpus, with no parallel community-language channels, referring residents who need other languages to the settlement sector. On that text her plank was not absorbed. It was declined.",
    fix: "Not resolved, and deliberately so. <strong>The mark stands pending a decision.</strong> Lowering a mark held by a councillor with no relationship to this framework, on the strength of the framework's own redrafting of its own measure, is not a correction that should be made quietly — the change is in ACTW's text, not in anything Kim said or did. It is disclosed here instead and it should be resolved before this cell is quoted.",
  },
  {
    n: 3,
    status: "open",
    title: "Below three scored topics a letter is not a finding",
    body: "Six of the fifteen areas can never reach the three-topic floor at all: Homelessness, Walking &amp; Transit, Cleanliness and Reconciliation each contain one topic; Mobility and Business contain two. Eleven of the fifteen candidates also have at least one pillar below the floor.",
    fix: "<strong>No letter is printed below three scored topics</strong>, in the area grid and in the pillar table alike. The cell reports the marks it holds and their mean instead, because a single mark needs no averaging and a letter computed from one mark would be read as a verdict on a portfolio. Every grade that is printed shows its n.",
  },
  {
    n: 4,
    status: "open",
    title: "One Opposed mark may not be an Opposed mark",
    body: "Four of the five Opposed marks are roll-call votes: dated, unambiguous, in the minutes. <strong>Bella Lee's is one sentence on her own website</strong>, read as opposition to the measure rather than as criticism of how the bylaw is enforced. Moving Opposed to −1.0 reduces what that reading costs her; it does not make the reading correct.",
    fix: "Not resolved. <strong>It must be put to her directly before her Safety cell is used publicly.</strong> The cell is footnoted wherever it appears.",
  },
  {
    n: 5,
    status: "open",
    carried: "Documented at v3.2 · not restated at v3.4 · kept here",
    title: "“Commits” does not distinguish authoring an instrument from voting for one",
    body: "Hammond authoring the sheltering ban and seven colleagues voting for it all score Aligned 3.0. That is the methodology working as written, and it is also why Hammond's Safe pillar understates the distance between him and the field on enforcement.",
    fix: "Not corrected. Fixing it needs a fifth level on Question 1, which would change every mark on the page. It is disclosed instead. <strong>The master stopped restating this defect at v3.4 without resolving it</strong>; the scale it describes is unchanged, so it is kept on this page rather than dropped.",
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
  module.exports = { MATRIX_META, SCALE, CANDIDATES, UNKNOWN, PILLARS, TOPICS, GRID, COLUMNS, PILLAR_PUBLISHED, EXCLUSIONS, DEFECTS, NON_SOURCES, PLATFORM_STATUS, BIAS, OPEN_ITEMS };
}

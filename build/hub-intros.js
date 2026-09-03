#!/usr/bin/env node
/* Rebuild the live-door cards on profiles.html.
   Bios are rewritten from the 1 Sep Notion Candidate Profiles toggles
   (build/notion-toggles/<slug>.md) and the existing /profiles/<slug>
   transfer. Two short paragraphs: who they are, and what they have
   actually published. Not a campaign ad. Not an endorsement.
   Full profile stays visible — it is not inside a collapsed <details>. */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const meta = require("./candidate-meta.js");

/* The applied letter, keyed by slug. applied-letters.json names people but
   does not slug them, so the join is on the name in data/candidate-meta.json —
   the one file that holds both. A name that does not join is a hard failure
   rather than a silent dash, because a silent dash is exactly the bug this
   replaced. */
const APPLIED = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "applied-letters.json"), "utf8"));
const CANON = (function () {
  const byName = {};
  APPLIED.candidates.forEach((c) => { byName[c.name] = c; });
  const out = {};
  Object.keys(meta.META.candidates).forEach((slug) => {
    const hit = byName[meta.META.candidates[slug].name];
    if (hit) out[slug] = hit;
  });
  return out;
})();

function gradeCls(letter) {
  if (!letter || letter === "—") return "x";
  const c = letter[0].toLowerCase();
  return "abcdf".indexOf(c) > -1 ? c : "x";
}

function badge(letter, n) {
  if (!letter || letter === "—") return '<span class="g x">—</span>';
  return '<span class="g ' + gradeCls(letter) + '">' + letter + "</span>" +
    (n ? '<span class="cs-n">' + n + "</span>" : "");
}

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Who this person is, in the three facts the rest of the site labels them
   with and this page did not: the seat, whether they hold it now, and the
   framework's reading of where they sit. A reader arriving from the
   scorecard was being asked to hold all three in their head. */
function identity(m) {
  if (!m) return "";
  const seat = m.office === "Mayor" ? "Mayor" : "Council";
  const standing = m.kind === "inc" ? "Incumbent" : "New";
  return '<div class="ci-meta">' +
    '<span class="ci-chip ci-seat">' + esc(seat) + "</span>" +
    '<span class="ci-chip ci-' + (m.kind === "inc" ? "inc" : "new") + '">' + standing + "</span>" +
    /* leanFull, not lean: the short form drops the party tags, so Alto read
       "Left" here and "Left · NDP" everywhere else on the site. It keeps the
       source's question mark where the reading is uncertain. */
    (m.leanFull || m.lean ? '<span class="ci-lean">' + esc(m.leanFull || m.lean) + "</span>" : "") +
    "</div>";
}

/* The candidate's own channels. The URLs were already parsed for the profile
   pages; the hub was printing them as unclickable prose ("mike4victoria.ca
   organizes the campaign around…"). Sub-pages are left to the full profile —
   this row is the front doors only, so it stays one line. */
const PLATFORM = {
  site: "Campaign site", instagram: "Instagram", facebook: "Facebook", x: "X",
  linkedin: "LinkedIn", bluesky: "Bluesky", threads: "Threads", youtube: "YouTube",
  tiktok: "TikTok", reddit: "Reddit", city: "City record",
};
const ORDER = ["site", "instagram", "facebook", "x", "bluesky", "threads", "youtube", "tiktok", "linkedin", "reddit", "city"];
function links(m) {
  if (!m || !m.links || !m.links.length) return "";
  const seen = {};
  const picks = [];
  ORDER.forEach((p) => {
    m.links.forEach((l) => {
      if (l.platform !== p || seen[p]) return;
      seen[p] = 1;
      picks.push(l);
    });
  });
  if (!picks.length) return "";
  return '<div class="ci-links">' + picks.map((l) =>
    '<a class="ci-lk ci-lk-' + esc(l.platform) + '" href="' + esc(l.href) + '" target="_blank" rel="noopener">' +
    esc(PLATFORM[l.platform] || l.name) + "</a>").join("") + "</div>";
}

function card(c) {
  const m = meta.get(c.slug);
  const paras = c.bio.map((p) => "<p>" + p + "</p>").join("");
  return '<article class="cand" id="' + c.id + '" data-jump-label="' + c.name + '">' +
    '<div class="cand-top"><span class="cs-t"><strong>' + c.name + "</strong> — " + c.role +
    '</span><span class="cs-g">' + badge(c.letter, c.n) + "</span></div>" +
    identity(m) +
    '<div class="cand-intro">' + paras + links(m) +
    '<p class="pf"><a href="/profiles/' + c.slug + '">Full profile →</a></p>' +
    "</div></article>";
}

const MAYOR = [
  {
    slug: "alto", id: "cand-marianne-alto", name: "Marianne Alto",
    role: "Mayor, declared May 20 2026",
    bio: [
      "Marianne Alto is Victoria’s incumbent mayor, seeking a second term. A facilitator with degrees in law and science, she owns Azimuth Research &amp; Consulting and lives in Burnside Gorge. First elected to council in 2010, she served twelve years as a councillor before winning the mayoralty in 2022.",
      "She launched her 2026 campaign on 20 May under “Experience that delivers,” naming more homes, community safety, and community wellbeing. The campaign site still serves the 2022 platform; no detailed 2026 programme was located as of 1 September."
    ]
  },
  {
    slug: "harris", id: "cand-mike-harris", name: "Mike Harris",
    role: "Mayor",
    bio: [
      "Mike Harris is a Vancouver Island businessman, housing and real-estate professional, and former journeyman carpenter. His mayoral campaign describes more than thirty years in real estate, housing, construction and business; Harris Auto Group lists him as an owner.",
      "mike4victoria.ca organizes the campaign around six priorities: safe streets, respect for taxpayers, housing that works, downtown, a review at City Hall, and conversations in twelve neighbourhoods. The site does not yet publish numerical targets or costings."
    ]
  },
  {
    slug: "mcguigan", id: "cand-bruce-mcguigan", name: "Bruce McGuigan",
    role: "Mayor",
    bio: [
      "Bruce McGuigan is a sociologist, former Vancouver Island University professor, and former executive director of Family Services of Greater Victoria. He lives in Fernwood and is making a second run for mayor after placing fourth in 2018.",
      "bruceformayor.ca publishes ten priority areas — among them homelessness, housing, safe streets, local business, climate preparedness, and a citizens-first City Hall — plus three governing principles: listen carefully, manage competently, and use public resources responsibly. Numerical targets and costings were not located."
    ]
  }
];

const SITTING = [
  {
    slug: "caradonna", id: "cand-jeremy-caradonna", name: "Jeremy Caradonna",
    role: "Councillor, declared Dec 21 2025",
    bio: [
      "Jeremy Caradonna is a first-term councillor and CRD director with a PhD in History from Johns Hopkins. He has lived in Fernwood since 2012 and previously taught environmental studies, worked in provincial climate policy, and ran a Rock Bay food-delivery business.",
      "electjeremy.ca is a 2026 re-election site. The published platform foregrounds housing, community safety and wellbeing, climate, transportation, arts and recreation, and completing the Crystal Pool replacement."
    ]
  },
  {
    slug: "dell", id: "cand-matt-dell", name: "Matt Dell",
    role: "Councillor, declared Dec 31 2025",
    bio: [
      "Matt Dell is a first-term councillor, a provincial-government policy professional, and former president of the South Jubilee Neighbourhood Association. He holds a master’s in political science from the University of Victoria and lives in South Jubilee.",
      "mattdell.ca publishes an eight-theme 2026 programme: housing and affordability, climate, parks and amenities, neighbourhoods, arts and culture, downtown, governance and reconciliation. The homepage also names a downtown library and completing Crystal Pool by 2030."
    ]
  },
  {
    slug: "thompson", id: "cand-dave-thompson", name: "Dave Thompson",
    role: "Councillor, declared January 2026",
    bio: [
      "Dave Thompson is a first-term councillor and CRD director, a lawyer by training, and a former officer of the Fairfield Gonzales Community Association. He has lived in four Victoria neighbourhoods as both renter and owner.",
      "davethompsonvictoria.ca is live. A 25 August post says the 2026 programme is still preliminary and names six areas: diverse housing; homelessness, mental health and addiction; safer streets; climate, trees and the environment; a vibrant city and economy; and evidence-based governance and reconciliation."
    ]
  },
  {
    slug: "kim", id: "cand-susan-kim", name: "Susan Kim",
    role: "Councillor",
    bio: [
      "Susan Kim is a first-term councillor with a background in food security, community organizing and operations, including work at Fernwood NRG. She was first elected in 2022.",
      "She is seeking re-election, and a CRD seat, with Victoria For All. The slate’s published pillars are housing, care, climate and community, including more public and co-operative housing, a 24-hour mental-health crisis response, and expanded free transit."
    ]
  },
  {
    slug: "loughton", id: "cand-krista-loughton", name: "Krista Loughton",
    role: "Councillor, declared June 3 2026",
    bio: [
      "Krista Loughton is a first-term councillor, a documentary filmmaker and a Fernwood resident. Her film <em>Us and Them</em> has screened across North America, including on Parliament Hill.",
      "kristaloughton.ca is a 2026 site for council and a CRD seat. Published priorities include downtown conditions, affordability, finding indoor spaces for unsheltered residents, and Positive Flow — rent supplements that help people move from supportive housing into independent housing."
    ]
  },
  {
    slug: "hammond", id: "cand-stephen-hammond", name: "Stephen Hammond",
    role: "Councillor, declared July 6 2026",
    bio: [
      "Stephen Hammond is a first-term councillor, a lawyer by training, and an author on workplace human rights. He has lived in Victoria since 2005 and has served on the boards of Our Place Society, Gorge View Society and the Tenant Resource and Advisory Centre.",
      "votestephenhammond.ca organizes a 2026 programme around three commitments: a safer city, taxes people can afford, and housing that works for Victoria, including a spending review, neighbourhood input on densification, and stronger compensation when redevelopment displaces long-term tenants."
    ]
  },
  {
    slug: "gardiner", id: "cand-marg-gardiner", name: "Marg Gardiner",
    role: "Councillor, declared January 2026",
    bio: [
      "Marg Gardiner is a first-term councillor with a chemistry degree and an MBA in public management. She served sixteen years on the James Bay Neighbourhood Association board before election.",
      "marggardiner.ca organizes the 2026 campaign around safe streets, liveable neighbourhoods, respect for the taxpayer and transparent governance. The site includes a zero-based-budget commitment and a published voting-record page."
    ]
  }
];

const CHALLENGERS = [
  {
    slug: "cseszko", id: "cand-melissa-cseszko", name: "Melissa Cseszko",
    role: "Council candidate, declared May 12 2026",
    bio: [
      "Melissa Cseszko (pronounced Chess-ko) is a lifelong Victorian who lives downtown and has operated Mel Lingerie on Fort Street for five years.",
      "melissacseszko.ca publishes three pillars: rebuild safety through predictable rules; restore accountability through oversight and performance review; and revive Victoria by protecting heritage, historic buildings and local businesses."
    ]
  },
  {
    slug: "rothe", id: "cand-karen-rothe", name: "Karen Rothe",
    role: "Council candidate, declared May 27 2026",
    bio: [
      "Karen Rothe is a lifelong Victorian and Vic West resident whose public-service career has included municipal affairs and emergency management. She has also served twenty-two years as a strata property-management coordinator.",
      "karenrothe.ca sets out three themes: creating trust through better leadership; restoring downtown while protecting neighbourhoods; and better planning for infrastructure, transportation, public safety, affordability and transit."
    ]
  },
  {
    slug: "bowkett", id: "cand-wendy-bowkett", name: "Wendy Bowkett",
    role: "Council candidate, declared approximately May 15 2026",
    bio: [
      "Wendy Bowkett is a business strategist with an MBA who lived downtown for more than twenty years and served over a decade on the Victoria Downtown Residents’ Association board. She also serves on the board of The Soup Kitchen.",
      "wendybowkett.ca publishes three pillars: restore public trust; improve public safety, including support for non-police crisis teams; and make Victoria more liveable and affordable, including faster approvals for non-market and co-operative housing."
    ]
  },
  {
    slug: "mcinnis", id: "cand-arthur-mcinnis", name: "Arthur McInnis",
    role: "Council candidate, declared June 25 2026",
    bio: [
      "Arthur McInnis is a James Bay resident, a law professor and a former international construction and projects lawyer. He describes more than thirty years examining government, infrastructure and contractual decisions.",
      "arthurmcinnis.ca publishes a five-part 2026 platform: open government and fiscal discipline; neighbourhood planning and responsible growth; housing affordability and tenant protection; transportation for a functional city; and public safety with measurable accountability."
    ]
  },
  {
    slug: "sandor", id: "cand-jack-sandor", name: "Jack Sandor",
    role: "Council candidate, declared June 2026",
    bio: [
      "Jack Sandor is a 27-year-old Red Seal electrician and lifelong Victoria-area resident. He grew up in Gonzales and now rents near Stadacona Park. He has served as vice-president of Homes for Living and on the BetterTransitYYJ board.",
      "jacksandor.ca carries a complete ten-part platform covering housing, homelessness, safety, transportation, climate, business, arts, governance, reconciliation and quality of life, including city financing for co-ops and a council-voting dashboard."
    ]
  },
  {
    slug: "lee", id: "cand-bella-lee", name: "Bella Lee",
    role: "Council candidate, declared June 2026",
    bio: [
      "Bella Lee is a 27-year-old lifelong Victorian, a renter and a campaign organizer. She has worked as a senior government adviser and on regional homelessness cost-sharing, Access BC’s free-contraception initiative and the Crystal Pool referendum.",
      "bellalee.ca is live. The published programme is concise: lower the cost of living, support affordability, seek fairer CRD participation in homelessness costs, and preserve community amenities. A detailed municipal platform was not located as of 1 September."
    ]
  },
  {
    slug: "garcia", id: "cand-jerry-garcia", name: "Jerry Garcia",
    role: "Council candidate",
    bio: [
      "Jerry Garcia is a retired professional engineer and executive who has lived downtown with his spouse for eight years.",
      "jerryforvictoria.ca names five aims: grow the economy; restore safe public spaces; end chronic homelessness through housing, treatment and recovery; build complete neighbourhoods; and deliver faster, more transparent government. The site also commits to cutting permit times and publishing performance dashboards."
    ]
  },
  {
    slug: "girard", id: "cand-martin-girard", name: "Martin Girard",
    role: "Council candidate",
    bio: [
      "Martin Girard is a community advocate whose public work has focused on homelessness, civil liberties and drug policy. Campaign material describes five years of personal homelessness and current residence in supportive housing.",
      "martingirardforvictoriacouncil.ca publishes a platform on homelessness, drug policy, law and order, Indigenous relations and the environment, including opposition to encampment sweeps and support for harm reduction."
    ]
  },
  {
    slug: "gibbs", id: "cand-peter-gibbs", name: "Peter Gibbs",
    role: "Council candidate",
    bio: [
      "Peter Gibbs is a parent, a lifelong Victorian and a community organizer. No personal campaign site was located.",
      "He is running with Victoria For All. The slate’s published pillars are housing, care, climate and community — including more public and co-operative housing, a 24-hour mental-health crisis response, expanded free transit, and more gathering places."
    ]
  },
  {
    slug: "dion", id: "cand-shona-dion", name: "Shona Dion",
    role: "Council candidate",
    bio: [
      "Shona Dion is a labour activist, a photographer and a working parent who moved to Victoria in 2013. She has served the North Jubilee Neighbourhood Association and as a Victoria Labour Council table officer.",
      "shonadion4victoria.ca commits to giving neighbourhoods more agency on housing security, climate resilience and community safety, and to uplifting residents and organizations already doing that work."
    ]
  }
];

const LIVE = MAYOR.concat(SITTING, CHALLENGERS);

/* The letter and its n are not written here. They were, in a LOCKED table
   that pinned nine hand-typed pairs and asserted the literals matched it —
   which is a check that the page agrees with itself, not that it agrees with
   the scorecard. It passed happily through the rescore while the hub printed
   "B+ · 17" for a candidate the compute table had ruled B on 25, and printed
   a dash for four candidates who carry a letter. Both numbers now come from
   data/applied-letters.json, the same file the roster block below them reads,
   so the hub cannot drift from the scorecard again. */
for (const c of LIVE) {
  const canon = CANON[c.slug];
  if (!canon) {
    console.error("no applied letter for " + c.slug + " — is the name spelled the same in data/applied-letters.json?");
    process.exit(1);
  }
  c.letter = canon.letter || "—";
  c.n = canon.n || 0;
}

const FORBIDDEN = /Lisnard|Estrosi|Knafo|\bMusk\b|Brivael|Poilievre|Livable CRD/;
for (const c of LIVE) {
  const blob = c.bio.join(" ");
  if (FORBIDDEN.test(blob)) {
    console.error("forbidden phrase in bio", c.slug);
    process.exit(1);
  }
}

function group(id, title, jump, note, members) {
  return '<h3 class="cand-grp" id="' + id + '" data-jump-label="' + jump + '">' + title +
    '<span class="cand-n">' + members.length + "</span></h3>\n" +
    '<p class="grp-note">' + note + "</p>\n" +
    members.map(card).join("\n");
}

const chips = LIVE.map((c) =>
  '<a class="cchip" href="/profiles/' + c.slug + '">' + c.name.split(" ").slice(-1)[0] + "</a>"
).join("\n");

const section =
`<div class="callout gold pcav">
<div class="lbl">◆ Read this before the profiles</div>
<p><strong>A profile is not a verdict.</strong> The grade measures distance from this framework, not quality, and a narrow evidence base is a fact about a publication calendar rather than about a candidate. Most challengers publish detail in September; a re-score after nominations close 11 September is mandatory.</p>
<details class="excl">
<summary><strong>Every grade here is current. Some of the prose is not.</strong> Marks excluded on 1 August 2026 are still described as marks in a few profiles — open for the full list, and which way each correction ran</summary>
<div class="excl-b">
<p>These profiles were written against the 31 July evidence base. On 1 August 2026 a full mark-by-mark re-verification applied one rule harder than before: <em>A characterisation is not a citable sentence. Fifteen marks rested on tone or posture rather than on something a candidate said or voted for, and were excluded.</em> <strong>The individual profile pages still describe some of those positions as marks.</strong> They are listed here so nothing is quietly deleted:</p>
<ul>
<li><strong>Pro-reconciliation</strong> <span class="excl-m">M1–M5</span> — Caradonna · Dell · Thompson · Kim · Loughton</li>
<li><strong>Pro-transit / pro-bike</strong> <span class="excl-m">M19/M22/M38–M42b</span> — Caradonna · Dell</li>
<li><strong>Province-blaming present in framing</strong> <span class="excl-m">M70/M70b</span> — Dell · Thompson · Loughton</li>
<li><strong>Climate leadership stated</strong> <span class="excl-m">M58/M58b/M64b</span> — Caradonna · Dell · Kim — the cooling bylaw is already scored once at M9</li>
<li><strong>Pro-heritage tone</strong> <span class="excl-m">M43–M46b</span> — Gardiner</li>
<li><strong>Recorded pro-enforcement votes, unnamed</strong> <span class="excl-m">M27</span> — Gardiner — the qualifying vote is already scored once at M33</li>
</ul>
<p>Three marks were regraded upward: the CSWB adoption vote of 3 July 2025 carried <em>Commits</em> at M26 and M27 but <em>Agrees</em> at M11 for the same councillors on the same act. It is now Commits at all three (Dell, Kim and Coleman at M11, Weak, then upward).</p>
<p>Every excluded mark was worth +0.5, below almost every mean, so the correction ran <strong>upward</strong>. The defect had been quietly suppressing sitting councillors' grades: Caradonna and Dell each moved up one letter. Each excluded mark is <strong>restorable the moment a vote or a quotation is attached to it</strong> — write to <a href="mailto:info@acitythatworks.ca">info@acitythatworks.ca</a>.</p>
</div>
</details>
</div>
<p class="hub-note pr-who">Twenty-one people have a profile here. Who is on the scorecard, who has filed but published nothing to score, and who is not on the site at all — with the reason beside every name — is kept in one place: <a href="/scorecard#roster">who is on the scorecard, and who is not</a>.</p>
<div class="cand-bar" id="candidate-index">
<div class="cand-lbl" id="cand-idx-lbl">Jump to a candidate</div>
<div class="cand-idx" role="group" aria-labelledby="cand-idx-lbl">
${chips}
</div>

</div>
${group("grp-mayor", "Mayor", "Mayor", "Three declared mayoral candidates.", MAYOR)}
${group("grp-councillors", "Sitting councillors", "Sitting councillors", "Four years of recorded votes, which is why their evidence base is the widest in the field — and why a re-score in September will narrow the gap rather than widen it.", SITTING)}
${group("grp-challengers", "Declared challengers", "Declared challengers", "Scored from published material only. Most publish platform detail in September, so these grades are the ones most likely to move.", CHALLENGERS)}
<h3 class="cand-grp" id="context-entries" data-jump-label="Context entries">Context entries — not candidates<span class="cand-n">3</span></h3>
<p class="grp-note">Retained because each explains something about the shape of the field. Not live 2026 candidates, and not given invented biographies.</p>
<details class="cand-ctx" id="cand-chris-coleman" data-jump-label="Chris Coleman"><summary><span class="cs-t"><strong>Chris Coleman</strong> — not a live 2026 candidate</span></summary><div class="body"><p class="pf">Not a live 2026 candidate. His stated decision window closed with no announcement. First elected 1986.</p></div></details>
<details class="cand-ctx" id="cand-del-manak" data-jump-label="Del Manak"><summary><span class="cs-t"><strong>Del Manak</strong> — NOT running, confirmed April 15 2026</span></summary><div class="body"><p class="pf">Not running — confirmed 15 April 2026. Retired VicPD Chief. Not a live 2026 candidate.</p></div></details>
<details class="cand-ctx" id="cand-stephen-andrew" data-jump-label="Stephen Andrew"><summary><span class="cs-t"><strong>Stephen Andrew</strong> — no 2026 signal</span></summary><div class="body"><p class="pf">No public 2026 municipal signal located as of 31 July 2026. Not a live 2026 candidate.</p></div></details>
<div class="cand-bar cand-bar-end">
<div class="cand-acts"><a class="cbtn cbtn-up" href="#candidate-index">↑ Back to the index</a></div>
</div>
`;

const OPEN = "<!-- PROFILES:START -->";
const CLOSE = "<!-- PROFILES:END -->";
const file = path.join(ROOT, "profiles.html");
let html = fs.readFileSync(file, "utf8");
const start = html.indexOf(OPEN);
const end = html.indexOf(CLOSE);
if (start === -1 || end === -1 || end < start) {
  console.error("profiles.html is missing its markers");
  process.exit(1);
}
html = html.slice(0, start + OPEN.length) + "\n" + section + html.slice(end);
fs.writeFileSync(file, html, "utf8");

console.log("wrote hub cards:", LIVE.length, "live-door + 3 context");
console.log("slugs:", LIVE.map((c) => c.slug).join(" "));

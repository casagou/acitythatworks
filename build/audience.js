#!/usr/bin/env node
/* A City That Works — audience companion pages (v1.10)
   ------------------------------------------------------
   Six pages that are the same framework read through one resident's eyes:
   same measures, same numbers, same jurisdictional caveats as the master,
   selected and rephrased for that audience.

   Generated rather than hand-authored because the six share a shell, a
   breadcrumb, a table of contents and a footer, and hand-maintaining six
   copies of that shell is how they drift apart. The content below is the
   only thing that differs between them.

   Derivation rule from the master: the companion pages cite the Program,
   the Program never cites them. Measure numbers are the stable interface,
   so every "(Measure 7)" here is linkified to measures.html#m7 by
   linkMeasures() rather than written as a link by hand — a reference can
   never point somewhere the anchor doesn't exist, because the anchor is
   derived from the number.

   Two claims from the master are deliberately NOT reproduced. v1.9.4 flags
   "the first city in BC to put your permit answer in writing" (For Business
   Owners) and "No BC city does this today" (For Homeowners) as unsourced
   superlatives and bars them from the live site until each carries a
   publisher and a year. Both are restated below as claims about what this
   framework commits to. Restore the master's wording only once sourced.

   Usage: node build/audience.js
*/

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

/* "(Measures 66 to 66d)" -> both ids linked, "(Measure 7)" -> one. Kept
   deliberately narrow: it only fires after the literal word Measure(s), so
   "row 10" and "26°C" are never touched. */
function linkMeasures(s) {
  return s.replace(/\bMeasures?\s+([0-9]+[a-z]?(?:\s*(?:,|and|to|or|–|\/)\s*[0-9]+[a-z]?)*)/g,
    function (whole, list) {
      const word = whole.slice(0, whole.length - list.length);
      const linked = list.replace(/[0-9]+[a-z]?/g,
        function (id) { return '<a href="measures.html#m' + id + '">' + id + "</a>"; });
      return word + linked;
    });
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const AUD = [
  {
    slug: "for-families", emoji: "👨‍👩‍👧‍👦", name: "For Families",
    eyebrow: "Companion page", lens: "read through a parent's eyes",
    desc: "Victoria's framework read through a parent's eyes: family-sized homes, childcare, safe school routes, and a tax bill that behaves. Every measure costed and reported quarterly.",
    short: "Victoria is exporting its young families. The city builds <strong>56 apartments for every single townhouse</strong>, childcare waitlists stretch for years, and family doctors are scarce. None of this is fate. It is the result of choices a city makes — and choices a city can change. This framework was built budget-first, 0% ideological and 100% pragmatic: every measure below is costed, proven in a comparable city, and reported on a public scorecard every quarter.",
    sections: [
      { h: "A home your family actually fits in", items: [
        "<strong>Homes with bedrooms, not just units (Measure 6).</strong> Victoria is ahead on raw housing volume and behind where families live: 3-bedroom homes and the missing middle. We set composition targets and report them quarterly: 12,000+ net new homes by 2030, <strong>at least 20% with 3 bedrooms or more</strong>, at least 25% missing middle — townhomes, duplexes, triplexes, garden suites.",
        "<strong>Permits fast enough to build for your kids, not your grandkids (Measures 7 and 7b).</strong> Published permit targets by category — simple under 6 weeks, complex under 6 months — plus a pre-approved pattern book of family housing designs that skips the slowest steps.",
        "<strong>Fair access, no queue-jumping (Measure 10).</strong> One digital portal for City-affiliated housing waitlists with public, point-based criteria — single parents and larger families are explicitly weighted — and you can see your place in the queue." ] },
      { h: "Childcare and a family doctor", items: [
        "<strong>500 new childcare spaces, using every lever the City has (Measure 12).</strong> Childcare is provincially regulated — so we use what is municipal: childcare permits processed in <strong>60 days or less</strong>, community buildings pre-zoned for childcare use, city-owned space offered below market to licensed operators, and hard advocacy for housing the early childhood educators who make it all run.",
        "<strong>Recruit family doctors with the levers we control (Measure 13b).</strong> Permissive tax exemptions for not-for-profit clinics, below-market city space, clinic permits fast-tracked on the childcare timeline, and a recruitment partnership with Island Health." ] },
      { h: "Streets your kids can cross", items: [
        "<strong>The ten most dangerous intersections, redesigned — all of them (Measure 38).</strong> Today no published collision inventory even exists. We publish it, name the top ten, and rebuild them within the term. This is row 10 of the public scorecard.",
        "<strong>30 km/h on residential and downtown streets (Measure 39)</strong> and <strong>protected bike lanes on major routes (Measure 41)</strong> — so the ride to school is a route you would let your child take.",
        "<strong>School-zone speed cameras — the honest version (Measure 40).</strong> BC law does not let a city install a speed camera today. We will not promise a camera we cannot lawfully install. We will nominate every school and playground zone with evidence, prepare the sites at City cost so provincial installation is never delayed by us, and press the Province for the authority — carrying forward council's own unanimous 2023 resolution.",
        "<strong>Buffer zones around child-focused spaces (Measure 33b)</strong> and a <strong>Downtown Public Order Team with bylaw coverage 6 AM to 10 PM, 7 days (Measures 26 and 27).</strong> Order is a family policy." ] },
      { h: "Schools, parks, and places to play", items: [
        "<strong>A standing agreement with School District 61 (Measure 13d).</strong> School gyms, fields, and playgrounds open to families outside school hours; City facilities open to schools during them. The cheapest recreation capacity a city can add, because the buildings already exist.",
        "<strong>Real food in schools (Measure 13).</strong> A Farm to School standard with Island producers, menus redesigned with local chefs, and daily meal photos published — you see exactly what your children are served.",
        "<strong>Parks worth the name (Measures 49 and 52).</strong> A 5-year Beacon Hill restoration including the Children's Farm, a signature horticultural feature in every neighbourhood, and sport facilities — including Royal Athletic Park — used fully, year-round.",
        "<strong>Public bathrooms that exist and are open (Measure 24b).</strong> Every parent understands why this is transportation infrastructure.",
        "<strong>A maximum-temperature rule for rental homes (Measure 64).</strong> In the 2021 heat dome, 619 British Columbians died — 98% indoors. Families renting older units get the same protection as everyone else: at least one room at or under 26°C during heat warnings." ] },
      { h: "What it costs you", body: "Nothing beyond a tax bill that finally behaves. The framework caps the <strong>residential</strong> tax rate increase at 6.5% in Year 1 (against the 9.34% council levied on homes in 2026), 5% in Year 2, then roughly inflation plus growth — funded by verified savings, not cuts to what your family uses (Measures 65 and 15, and the Taxpayer Guarantee, Measures 66 to 66d). One published Household Bill shows what your family actually pays, in one number, every year." }
    ],
    also: [
      "<strong>Playgrounds and parks, reclaimed (Measures 36 and 34).</strong> Priority public spaces — playgrounds first — kept safe and usable through daily presence and a rapid-removal protocol, paired with real shelter capacity.",
      "<strong>Homelessness cut in half, honestly (Measures 11 and 35).</strong> Housing-First throughput plus capacity-first enforcement — order and compassion in the same sentence, counted quarterly in public.",
      "<strong>Vehicles designed for streets with kids on them (Measures 42 and 42b).</strong> A safety audit on every new road project, and federal advocacy on vehicle hood heights — because a child's odds in a collision depend on the front end of what hits them.",
      "<strong>Something to do in every season (Measures 51 and 45c).</strong> Covered, lit, programmed outdoor spaces year-round — and one signature public-space project your kids will grow up with, shortlisted by residents and approved on a ballot.",
      "<strong>The family dog counts too (Measure 25c).</strong> Leashed access to parks, waste stations and water fountains at every major one." ],
    vision: "It is a Tuesday in September 2030. You drop your youngest at a childcare space that opened in a community centre three blocks from home — one of the 500 the city fought for. Your oldest bikes to school on a protected lane and crosses at an intersection that used to be on the dangerous-ten list and is not anymore. After school, the gym is open to the neighbourhood, because the City and the school district finally signed one agreement. Saturday is Beacon Hill: the Children's Farm restored, the playground full, the dog on a leash beside you. And the 3-bedroom townhouse you thought Victoria would never build — you live in it, because the city started approving homes shaped like families and published the count every quarter until the mix changed. <strong>Nobody sold you a dream. They published targets, and hit them, where you could check.</strong>",
    hold: "Quarterly public scorecard, no spin: homes by composition (row 3), all ten dangerous intersections redesigned (row 10), crime severity down 15% (row 6), and the tax cap itself (row 1). Miss a number and you will know by 2028 — not at the next election."
  },

  {
    slug: "for-renters", emoji: "🏠", name: "For Renters",
    eyebrow: "Companion page", lens: "read through a renter's eyes",
    desc: "Victoria's framework read through a renter's eyes: a 5% vacancy target, demoviction protections, transparent waitlists, and a 26°C habitability rule. Costed and reported quarterly.",
    short: "Victoria's rental vacancy rate has climbed to <strong>3.3% — the highest since 1999</strong> — and that progress is fragile. One economic cycle could throw the city straight back into a 1.6% crisis. This framework locks the gains in: more homes, real protections when redevelopment comes, transparent access, and a tax bill that stops quietly inflating your rent. Every measure is costed, proven elsewhere, and reported quarterly in public.",
    sections: [
      { h: "More homes, so you have real choices", items: [
        "<strong>A 5% vacancy target, honestly measured (Measure 8).</strong> Pre-zoned missing middle with no rezoning hearings for duplexes and triplexes, targeted DCC reductions for purpose-built rental, expedited permits for below-market projects. And an honest KPI: vacancy is published <strong>alongside median asking rent</strong>, so a vacancy gain from falling demand is never dressed up as a supply win.",
        "<strong>Supply with the right composition (Measure 6).</strong> 12,000+ net new homes by 2030 — at least <strong>30% purpose-built rental</strong> and <strong>15% below-market or non-market</strong> with BC Housing.",
        "<strong>Legalize the suites that already exist (Measure 8b).</strong> Thousands of secondary suites operate outside the permit system — uninspected, uncounted, unprotected. A 24-month amnesty brings them in on a life-safety standard, with tenant protection built in: <strong>legalization is not a ground for eviction and not an occasion for a rent reset.</strong>" ] },
      { h: "Protection when the redevelopment notice arrives", items: [
        "<strong>Demoviction protections with teeth (Measure 9).</strong> 12+ months notice for major redevelopment, moving costs indexed to local rents, a documented right of return, and mandatory replacement rental units at a published below-market rate with priority for displaced tenants. More housing AND fewer displacements — not one or the other.",
        "<strong>A Renters' Hub (Measure 9).</strong> One digital and physical front door for tenant rights: plain-language guides, sample letters, direct referral to legal aid, and case management for seniors and vulnerable tenants facing displacement.",
        "<strong>Short-term rental licensing that protects the long-term pool (Measure 9b)</strong> — so homes house residents first.",
        "<strong>Vacancy control between tenancies (Measure 9c) — labelled honestly.</strong> That power is provincial. The City cannot enact it; we will advocate for it, and we say so plainly instead of promising what is not ours to deliver." ] },
      { h: "Fair access, visible queues", items: [
        "<strong>A transparent allocation system (Measure 10).</strong> One portal, documents uploaded once, public point-based criteria, your real position in the queue visible — and no outside intervention possible. No queue-jumping, no political favours." ] },
      { h: "A home that cannot cook you", body: "<strong>A maximum-temperature rental bylaw (Measure 64).</strong> In the 2021 heat dome, <strong>619 British Columbians died of heat — 98% of them indoors</strong>, most of them alone. On the New Westminster precedent: at least one room of every rental unit at or under <strong>26°C</strong> during declared heat warnings, phased in over 24 to 36 months, compliance by the landlord's choice of portable cooling, heat pump, or built-in cooling. This is a habitability standard, like a smoke detector — not a climate debate." },
      { h: "Your rent includes City Hall's bill", body: "Landlords pay property tax; tenants pay it through rent. Four straight years of above-inflation increases — 9.34% on residential in 2026 alone — flow through to you. The framework caps the residential rate increase at 6.5% in Year 1, 5% in Year 2, then roughly inflation plus growth, funded by verified savings (Measures 65 and 15, and the Taxpayer Guarantee, Measures 66 to 66d). Add first-hour free parking (Measure 75) and modern contactless transit fares (Measure 21), and the everyday costs move in your direction too." }
    ],
    also: [
      "<strong>Faster permits mean more homes sooner (Measures 7 and 7b).</strong> Published approval targets by category and a pre-approved pattern book for missing-middle housing — permit speed is supply speed, and supply is your bargaining power.",
      "<strong>City land for non-market homes (Measure 6b).</strong> The land bank operationalized: city-owned sites released through a competitive process scored on affordability and speed to completion, not just price.",
      "<strong>Fewer people falling out of housing (Measure 11).</strong> Housing-First and STEP throughput, counted quarterly — a system that catches people before the street is a rental market with less desperation in it.",
      "<strong>A city that notices renters in their twenties (Measure 13c).</strong> Victoria's 18–25s get deliberate outreach and a stake — because the city's future households should not be an afterthought.",
      "<strong>Better buildings to rent (Measure 60).</strong> Climate Friendly Homes retrofits expanded with published uptake — insulation and heat pumps that overlap the 26°C compliance path, so comfort and the rulebook arrive together." ],
    vision: "It is moving day, 2030, and it is boring — in the best possible way. Vacancy has held near 5% for three years, so you chose between three apartments instead of begging for one. When your last building sold for redevelopment, you got a year's notice, moving costs indexed to real rents, and a documented right of return — two of your old neighbours are already back in the new building at the published below-market rate. Your suite is legal and inspected. Heat-warning weeks are uncomfortable now, not dangerous: one room stays under 26°C, and that is simply the rule. Your place on the non-market waitlist is a number on your phone, not a rumour. And your rent stopped quietly absorbing double-digit tax increases, because the City capped the rate, published the whole bill, and refunded what it over-collected. <strong>Renting in Victoria stopped being an emergency. That was the point.</strong>",
    hold: "Quarterly public scorecard: rental vacancy at 5% (row 4), homes delivered by composition (row 3), unsheltered homelessness cut by half (row 5), and the tax cap (row 1). Every number published, green or red. You do not have to trust anyone — you can check."
  },

  {
    slug: "for-business", emoji: "🏪", name: "For Business Owners",
    eyebrow: "Companion page", lens: "read through an operator's eyes",
    desc: "Victoria's framework read through an operator's eyes: licences in 5 days, order on the street, storefront vacancy from 11% to 5%, and one office accountable for the number.",
    short: "Downtown storefront vacancy sits near <strong>11%</strong>, and <strong>48% of downtown businesses would consider leaving if their lease expired</strong>. You carry the costs of disorder, the delays of a slow City Hall, and a tax bill set without anyone owning a number for your success. This framework changes the operating environment: order on the street, speed at the counter, customers back downtown, and one office accountable for one published number. Every measure is costed and reported quarterly.",
    sections: [
      { h: "A City Hall that values your time", items: [
        "<strong>Business licences in 5 business days, maximum (Measure 72).</strong> Not 5 weeks. Plus tenant-improvement permits on a published 6-week target, a designated downtown economic coordinator with authority to escalate stalled files, and in-person welcome and thank-you visits to businesses — a 2022 commitment by others, never delivered.",
        /* master reads "the first city in BC to put your answer in writing" — barred, see header */
        "<strong>Permit times published, by category (Measure 7).</strong> Simple under 6 weeks, complex under 6 months, rezoning under 9 months — your answer in writing, with a date attached. Scorecard row 8.",
        "<strong>A simplification charter (Measure 72b).</strong> Every new rule earns its place; every old rule gets reviewed." ] },
      { h: "Order on the street you pay rent on", items: [
        "<strong>A Downtown Public Order Team (Measure 26)</strong> with <strong>bylaw enforcement extended to 6 AM – 10 PM, 7 days a week (Measure 27)</strong>. Disorder does not keep office hours; enforcement will not either.",
        "<strong>Graffiti gone in 48 hours — 90% of it (Measure 14)</strong>, extended sanitation hours (Measure 17), and enforcement targeted by data at the small number of addresses driving most calls (Measure 28).",
        "<strong>A business-security cost-spreading pilot (Measure 28b).</strong> Exposure-based, not blanket: capped reimbursement for security, glazing, and sharps costs in FOI-validated high-exposure zones, funded from savings, with a 24-month sunset.",
        "<strong>A voluntary business camera registry, VicPD-led (Measure 28c)</strong> — and no City surveillance cameras. <strong>Streets lit all night (Measure 37)</strong>, with storefront lighting encouraged: lit streets are safer streets and busier tills." ] },
      { h: "Customers back downtown", items: [
        "<strong>First-hour free parking (Measures 75 and 24).</strong> The single largest discretionary cost in this framework, stated plainly — because foot traffic is your revenue. Plus real-time parking availability published to navigation apps, using sensors, not street cameras.",
        "<strong>Storefront vacancy from 11% to 5% (Measure 71).</strong> Quarterly vacancy reporting by block, streamlined tenant-improvement permits, pop-up facilitation, targeted attraction — and advocacy to the Province for the authority to surcharge persistent vacancies.",
        "<strong>Team Victoria — one office, one number, one flagship event (Measure 73b).</strong> A small attractiveness office chaired by the mayor, whose published mandate <strong>is</strong> the vacancy number, with a shoulder-season target for November through March — the months when downtown businesses fail. The Conference Centre gets its own published target and its own published net cost (Measure 73c), and tourism marketing continues with better wayfinding and extended-hours coordination (Measure 73)." ] },
      { h: "A tax bill set in the open", body: "In 2026, council raised residential rates 9.34% and business rates 4.78%. This framework caps the residential glide path and makes any change to the business-to-residential ratio a <strong>separate, stand-alone vote with a published dollar effect on a median business</strong> — no more ratio shifts delivered as a side effect of a headline number (Measure 66). The savings engine behind it is real: zero-based budgeting of all 200+ programs (Measure 65) and competitive testing of major service contracts (Measure 15), with every verified dollar published (scorecard row 2)." }
    ],
    also: [
      "<strong>Growth sectors with a plan (Measures 73d, 55, and 55b).</strong> A published Strategic Economic Plan, city procurement that favours local technology firms, and the ocean economy treated as Victoria's natural vertical — sectors named, employment counted, so “economic development” stops meaning only downtown retail.",
      "<strong>An evening and winter economy (Measures 51, 50, and 45b).</strong> Year-round outdoor activation, extended hours for civic cultural spaces, and pedestrianization piloted where it is earned — Bastion Square first, measured before it expands, with operators at the table.",
      "<strong>Clean in the unglamorous ways (Measures 16, 34, and 36).</strong> A real pest-management plan, a rapid-removal protocol downtown, and priority public spaces reclaimed block by block.",
      "<strong>Traffic that moves (Measure 19).</strong> Adaptive signals cut travel times about 25% in Pittsburgh — your deliveries, your staff, and your customers all arrive sooner." ],
    vision: "It is a February evening in 2030 — the month downtown used to die. Your street is lit all night, and your storefront has neighbours: vacancy sits near 5%, and the flagship winter event has the hotels full in what used to be the empty season. Your licence renewal took two days. The tenant-improvement permit for the expansion came with a published date, and the date held. The one night you needed a bylaw officer, someone answered at 9 PM; the graffiti was gone before Monday; and Team Victoria called you before you ever called them, because somebody's job is your block's number. Your tax notice moved by a figure you had already budgeted, because nobody can shift the ratio onto you quietly anymore. <strong>You are not the last business on the street. You are the one that stayed — and two that left are asking about coming back.</strong>",
    hold: "Quarterly public scorecard: downtown vacancy at 5% (row 9), permit speed by category (row 8), graffiti removal in 48 hours (row 7), crime severity down 15% (row 6), verified savings banked (row 2). One number per promise. No spin."
  },

  {
    slug: "for-cyclists", emoji: "🚲", name: "For Cyclists & Transit Users",
    eyebrow: "Companion page", lens: "read through a rider's eyes",
    desc: "Victoria's framework read through a rider's eyes: finish the AAA network, adaptive signals with transit priority, and an honest account of what the City controls on transit.",
    short: "Victoria already leads the country: <strong>95% of residents live within 500 metres of a safe cycling route</strong> — the highest share in Canada — and the country's highest bike-to-work rate. This framework finishes the job, and it does something rarer: it is honest about transit. Routes, frequency, and fares belong to BC Transit and the Transit Commission, not to city councils — which is why transit is where municipal candidates most often promise what they cannot deliver. We name what the City controls, fund it, and publish how Victoria votes on the rest.",
    sections: [
      { h: "Finish the network", items: [
        "<strong>Complete the All Ages &amp; Abilities bike network (Measure 20)</strong> and put <strong>protected lanes on all major routes (Measure 41)</strong> — designed to work for adaptive cycles, hand cycles, and e-bikes, coordinated with the accessibility program (Measure 25b).",
        "<strong>A safety audit on every new road project (Measure 42)</strong> so the network never gets worse by accident." ] },
      { h: "Signals that see you", body: "<strong>Adaptive traffic signal control on major corridors (Measure 19).</strong> The Pittsburgh Surtrac system cut travel times 25% — and this rollout carries <strong>transit signal priority on every corridor it reaches, at no incremental cost</strong>, plus pedestrian clearance timed to real walking speeds (1.0 m/s), leading pedestrian intervals downtown, and no beg buttons on primary downtown crossings (Measure 20b)." },
      { h: "Honest transit, funded where the City can act", items: [
        "<strong>A named annual transit-priority capital line (Measure 23b):</strong> bus lanes, queue jumps, boarding bulbs, and stop accessibility on City right-of-way, reported project by project — Douglas Street and the Trans-Canada approaches first. And the part nobody publishes today: <strong>how Victoria's representatives vote at the Transit Commission</strong>, on the record.",
        "<strong>RapidBus and dedicated lanes championed (Measure 23), Westshore rapid transit and the E&amp;N corridor pressed at every table (Measure 22), and modern contactless fare payment (Measure 21).</strong>" ] },
      { h: "Walking counts as transportation", body: "Every transit trip starts and ends on foot. <strong>Measure 20b</strong> gives walking its own numbers: a published sidewalk gap inventory in Year 1 ranked by school routes and transit stops, a maximum spacing standard for protected crossings, a published response time for blocked sidewalks — and <strong>public bathrooms treated as transportation infrastructure (Measure 24b)</strong>, mapped and open." },
      { h: "Trending toward zero", items: [
        "<strong>All ten of the most dangerous intersections redesigned within the term (Measure 38)</strong> — today, no public collision inventory even names them. Scorecard row 10.",
        "<strong>30 km/h on residential and downtown streets (Measure 39)</strong>, evidence-led pressure for school-zone speed cameras within what BC law actually allows (Measure 40), and federal advocacy on vehicle hood-height standards (Measure 42b).",
        "The framework keeps the city's <strong>60% sustainable-mode-share target for 2030 (Measure 62)</strong> — delivered by making the sustainable choice the convenient one, not by punishing anyone out of a car." ] },
      { h: "Paid for, and lit", body: "Streets lit all night with warm LED lighting (Measures 30 and 37) make the 6 AM ride and the 11 PM walk home feel as safe as they should be. All of it is funded inside existing transportation envelopes and the framework's verified-savings engine (Measures 65 and 15) — with the tax glide path intact (Measure 66)." }
    ],
    also: [
      "<strong>Smooth pavement is cycling infrastructure (Measure 25).</strong> Roads-first maintenance with 7-day pothole repair — a pothole is a cyclist hazard long before it is a driver's annoyance.",
      "<strong>More places to walk and roll (Measures 47 and 45b).</strong> Waterfront walkways extended, and pedestrianization piloted where it is earned — Bastion Square first, Government Street next, measured before expanded.",
      "<strong>The last 5%, honestly funded (Measure 20).</strong> The network target moves from 95% of residents within 500 metres to <strong>100% within 400 metres by 2030</strong>, drawn from the existing active-transportation envelope with federal cost-share pursued — and if the cost-share does not materialize, the timeline extends and we say so, rather than quietly missing it." ],
    vision: "It is 8:10 on a wet November morning in 2030, and the ride downtown is the easiest part of your day. The signals see you coming and hold the green; the lane is protected the whole way; the last four hundred metres exist now, because the city closed the gaps instead of celebrating the 95%. On Douglas, the bus moves in its own lane past the queue — funded, built, and reported project by project, exactly as promised. Your fare is a tap. Blanshard and Hillside is rebuilt — all ten of the worst intersections are — and the collision count is published quarterly, so you can watch it fall instead of taking anyone's word. <strong>Nobody won a culture war to get here. The city just built the convenient option, counted honestly, and let the numbers do the arguing.</strong>",
    hold: "Quarterly public scorecard: ten dangerous intersections redesigned (row 10), permit and project reporting through the quarterly dashboard (Measure 67), and every transit-priority dollar reported by project. Numbers, not vibes."
  },

  {
    slug: "for-seniors", emoji: "🧓", name: "For Seniors",
    eyebrow: "Companion page", lens: "read through the eyes of someone who has seen this city at its best",
    desc: "Victoria's framework read through a senior's eyes: heat protection, accessible sidewalks, the right responder, and a capped, published tax bill for a fixed income.",
    short: "In the 2021 heat dome, <strong>619 British Columbians died. 67% were 70 or older. 56% lived alone. 98% died indoors</strong> — in their own homes. That is what it looks like when a city treats its seniors as an afterthought. This framework does the opposite: it protects you in extreme weather, rebuilds streets you can actually use, sends the right responder when something goes wrong, and holds your tax bill to a published cap — because a fixed income deserves a predictable city. Every measure is costed and reported quarterly.",
    sections: [
      { h: "Protected in extreme weather", items: [
        "<strong>A maximum-temperature rule for rental homes (Measure 64).</strong> At least one room at or under 26°C during declared heat warnings — the threshold the BC Coroners Service identified — plus cooling centres in every neighbourhood and advocacy to override strata bans on AC units where health requires them. This is a habitability standard, like a handrail on a stairwell.",
        "<strong>Seismic and coastal resilience, funded and scheduled (Measure 64b)</strong> — the hazard Victoria actually faces, addressed instead of postponed." ] },
      { h: "Streets and sidewalks you can actually use", items: [
        "<strong>A universal accessibility audit and remediation program (Measure 25b).</strong> Every City sidewalk, building, park, and washroom audited on a published methodology; curb cuts, tactile paving, and audible signals at every controlled intersection within 4 years; a published response time for sidewalk hazards and obstructions.",
        "<strong>Crossings timed for real walking speeds (Measure 20b).</strong> Pedestrian signals timed to 1.0 metres per second instead of the 1.2 default — a small number that decides whether you make it across Douglas Street with time to spare.",
        "<strong>Streets lit all night (Measure 37)</strong> with warm lighting that suits this city, and <strong>public bathrooms mapped, open, and maintained (Measure 24b).</strong>" ] },
      { h: "Safe, and treated with respect", items: [
        "<strong>A Downtown Public Order Team (Measure 26)</strong> and <strong>bylaw coverage from 6 AM to 10 PM, 7 days a week (Measure 27)</strong> — someone answers at 9 PM.",
        "<strong>The right responder for the call (Measure 26b).</strong> A civilian crisis capacity for wellness checks and mental-health calls, with published dispatch criteria — relentless with the dangerous, appropriate with the unwell.",
        "<strong>Crime severity down 15% by 2030 (Measure 32)</strong>, reported quarterly." ] },
      { h: "A doctor, a park, a city that answers", items: [
        "<strong>Family doctors recruited with the levers the City controls (Measure 13b):</strong> tax exemptions for not-for-profit clinics, below-market city space, fast-tracked clinic permits, and a recruitment partnership with Island Health.",
        "<strong>Parks kept to the standard Victoria is famous for (Measure 49)</strong> — including a 5-year Beacon Hill restoration and a signature horticultural feature in every neighbourhood.",
        "<strong>Plain language at City Hall (Measure 80b).</strong> Every form, notice, and application rewritten to be readable, with interpretation available on request in either official language — and <strong>annual community surveys (Measure 82)</strong> plus real neighbourhood voice through Local Area Plans (Measure 80c)." ] },
      { h: "A fixed income deserves a predictable bill", body: "Four straight years of above-inflation tax increases — 9.34% on residential in 2026 alone — land hardest on those whose income does not move. <strong>The Taxpayer Guarantee (Measures 66 to 66d):</strong> the residential rate increase capped at 6.5% in Year 1, 5% in Year 2, then roughly inflation plus growth; <strong>any over-collection refunded to you</strong>, on your notice, not swept into reserves; a debt rule; and one published Household Bill — taxes, water, sewer, and waste in a single number you can plan around. Stated honestly: your individual bill also moves with BC Assessment, which the City does not control, and we say that at the outset." }
    ],
    also: [
      "<strong>Community paramedicine (Measure 28d).</strong> Proactive visits for frequent 911 callers and fall-risk residents — fewer emergencies, because the visit happened before the fall.",
      "<strong>Somewhere to sit (Measure 44).</strong> Victoria's distinctive street furniture restored — benches on the routes people actually walk, not just in postcard spots.",
      "<strong>Renovate to stay in your home (Measure 76).</strong> Reduced or waived permit fees for accessibility work — ramps, grab bars, widened doors — with a one-day turnaround target and a free pre-approved design library.",
      "<strong>Housing access that recognizes age and disability (Measure 10).</strong> Public, point-based allocation with disability explicitly weighted, and your position in the queue visible — no favours needed, none possible.",
      "<strong>Companions welcome (Measure 25c).</strong> A pet-friendly parks standard — because for many of us, the dog is family.",
      "<strong>A ballot you can reach (Measure 82b).</strong> Turnout and access measures, so voting never depends on mobility." ],
    vision: "It is July 2030 and the heat warning is three days old — and it is an inconvenience, not a danger. Your building keeps one room at 26°C or under, because that is the law now, and the cooling centre is a five-minute walk on sidewalks with no surprises: curb cuts at every corner, a bench halfway, a crossing timed for the speed you actually walk. When your neighbour had a bad week last winter, the person who knocked was a trained crisis worker, not a squad car — and the paramedic team that visits her building knows her by name. Your doctor's clinic took the tax exemption and the below-market space, and stayed. Your tax notice is capped and published, and last spring the City refunded its over-collection — the credit landed right on the notice. <strong>You have watched a lot of councils promise. This one publishes, every quarter, and you check.</strong>",
    hold: "Quarterly public scorecard: the tax cap (row 1), verified savings (row 2), crime severity (row 6), and the transparency package itself — delivered and checkable (row 11). Every number public, green or red. You do not have to trust anyone. You can check."
  },

  {
    slug: "for-homeowners", emoji: "🏡", name: "For Homeowners",
    eyebrow: "Companion page", lens: "read through an owner's eyes",
    desc: "Victoria's framework read through an owner's eyes: the Taxpayer Guarantee, verified savings, one-day small-reno permits, and design standards that protect what your home is worth.",
    short: "Victoria's operating budget grew <strong>31% in three years</strong> — from $300 million to $394 million — and the city did not get 31% better. Council closed four straight above-inflation tax years with one-time measures, then in 2026 distributed a 7.28% levy increase as <strong>9.34% to residential and 4.78% to business</strong>. You paid the difference. This framework is built on the premise that the gap between what Victoria spends and what Victoria delivers <strong>is the mandate</strong>: close it, and everything else is paid for without a single new tax.",
    sections: [
      { h: "The Taxpayer Guarantee (Measures 66 to 66d)", items: [
        "<strong>A capped glide path on the number you actually pay (Measure 66).</strong> The cap is on the <strong>residential rate</strong>, not the blended headline: 6.5% maximum in Year 1 — measured against the 9.34% council actually levied on homes — 5% in Year 2, then roughly inflation plus growth. Both numbers published side by side every year, with the dollar change on a median home. Stated honestly: your individual bill also moves with BC Assessment, which the City does not control.",
        /* master reads "No BC city does this today." — barred, see header */
        "<strong>Over-collection refunded, not swept (Measure 66b).</strong> When the City collects more than budgeted, the credit lands on your notice — not in a reserve. It is written so a later council cannot quietly reverse it.",
        "<strong>A debt rule (Measure 66c)</strong> that stops borrowing against the next council, and <strong>referendums for new capital projects over $25 million (Measure 77)</strong> — you vote on the big spends.",
        "<strong>One Household Bill (Measure 66d).</strong> Property tax plus water, sewer, solid waste, and the regional charges, in one published number." ] },
      { h: "Where the money comes from — verified, line by line", body: "<strong>Zero-based budgeting of all 200+ city programs (Measure 65)</strong> and <strong>competitive testing of waste and street-cleaning contracts, both directions, same specification (Measure 15).</strong> Phoenix saved over $25 million with this model; the target here is <strong>$8–14M per year in verified savings by Year 4</strong>, published against the year each was promised — scorecard row 2, currently $0 reported by the City." },
      { h: "Your house, your projects, your permit", items: [
        "<strong>Reduced or waived fees for small renovations (Measure 76).</strong> Projects under $50K that add a suite, improve accessibility, save energy, or restore heritage — with a <strong>published one-day-turnaround target</strong> for simple categories and a <strong>free pre-approved design library</strong> for garden suites and retrofits.",
        "<strong>Legalize the suite you already have (Measure 8b).</strong> A 24-month amnesty on a life-safety standard, a named permitting concierge, <strong>no retroactive penalty</strong> for coming forward inside the window — your mortgage helper becomes counted, inspectable, legal rental stock.",
        "<strong>Permit answers in writing (Measure 7).</strong> Simple under 6 weeks, complex under 6 months, published quarterly." ] },
      { h: "Your street, your neighbourhood, your equity", items: [
        "<strong>Roads first (Measure 25).</strong> Potholes fixed within 7 days of report, condition-based priorities published quarterly — stop building new things while the old things crumble. <strong>Stormwater upgraded on the same discipline (Measure 59).</strong>",
        "<strong>Design standards that protect what your home is worth (Measures 43 and 46).</strong> Clear, enforceable design codes in heritage areas — new buildings that complement, not clash — and heritage buildings protected and restored.",
        "<strong>Trees and canopy (Measures 61 and 49).</strong> 5,000 new trees by 2030, a 35% canopy target — and since 75% of Victoria's urban forest stands on private land, a <strong>free seedling program for homeowners</strong>.",
        "<strong>Local Area Plans brought back (Measure 80c)</strong> — your neighbourhood's plan, written with your neighbourhood — and <strong>streets lit all night (Measure 37).</strong>",
        "<strong>Seismic and coastal resilience (Measure 64b).</strong> The one hazard that can erase home equity overnight, funded and scheduled instead of deferred." ] }
    ],
    also: [
      "<strong>Money for your retrofit (Measures 60 and 57).</strong> Climate Friendly Homes rebates expanded with published uptake — insulation, heat pumps — and support for EV charging at home.",
      "<strong>Development next door, without surprises (Measures 78 and 78b).</strong> The 5-step process for every major project, and the material-change rule: no substantive change after the public hearing without renotification. What was approved is what gets built.",
      "<strong>Who lobbied, on the record (Measure 79d).</strong> A public lobbyist registry for development files — you can see who asked for what before it lands on your block.",
      "<strong>The City's assets managed like you manage yours (Measures 69 and 68).</strong> Real estate holdings rationalized, overhead reduced through attrition and technology — part of the verified-savings engine behind the tax cap, not a slogan beside it." ],
    vision: "It is spring 2030, and your property tax notice arrives with something you have never seen in your life: a refund credit, because the City over-collected last year and gave it back. The increase has matched inflation-plus-growth for two years running, published beside a Household Bill that finally shows everything — tax, water, sewer, waste — in one number you can plan around. The pothole you reported on Tuesday was filled by Sunday. The garden suite over your garage is legal, permitted in a day from the free design library, and quietly paying half your tax bill. The new building at the end of the block looks like it belongs there, because the design code did its job — and when the City last wanted to borrow nine figures, it asked you first, on a ballot, and you said yes to a good project. <strong>The budget stopped growing faster than the city improved. That was the whole idea.</strong>",
    hold: "Quarterly public scorecard: the residential tax cap (row 1), verified savings banked line by line (row 2), the transparency package delivered (row 11), and canopy at 35% by 2035 (row 12). Sixteen quarterly reports over the term, each published within 30 days — miss one, and everybody knows."
  }
];

function slugId(h) {
  return h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

function page(a) {
  const url = "https://acitythatworks.ca/" + a.slug + ".html";
  const title = a.name + " — A City That Works, Victoria 2026";
  const secs = a.sections.map(function (s) { return { id: slugId(s.h), s: s }; });

  let body = "";
  secs.forEach(function (x) {
    const s = x.s;
    body += '<h2 id="' + x.id + '">' + esc(s.h).replace(/&amp;/g, "&") + "</h2>\n";
    if (s.body) body += "<p>" + linkMeasures(s.body) + "</p>\n";
    if (s.items) {
      body += "<ul>\n";
      s.items.forEach(function (i) { body += "<li>" + linkMeasures(i) + "</li>\n"; });
      body += "</ul>\n";
    }
  });

  body += '<h2 id="also">Also in the framework for you</h2>\n<ul>\n';
  a.also.forEach(function (i) { body += "<li>" + linkMeasures(i) + "</li>\n"; });
  body += "</ul>\n";

  body += '<h2 id="vision">Your Victoria in 2030</h2>\n' +
    '<div class="callout gold"><p>' + linkMeasures(a.vision) + "</p></div>\n";

  body += '<h2 id="hold">How you hold us to it</h2>\n<p>' + linkMeasures(a.hold) + "</p>\n" +
    '<p><a href="index.html#scorecard">See the 12 Commitments scorecard →</a></p>\n';

  const toc = secs.map(function (x) {
    return '<li><a href="#' + x.id + '">' + esc(x.s.h).replace(/&amp;/g, "&") + "</a></li>";
  }).join("\n") +
    '\n<li><a href="#also">Also in the framework for you</a></li>' +
    '\n<li><a href="#vision">Your Victoria in 2030</a></li>' +
    '\n<li><a href="#hold">How you hold us to it</a></li>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<!-- The candidate switch: one boolean in flags.js hides every candidate page
     and every link to one. Loaded first and synchronously so a gated page
     leaves before it paints. The ?v=2 is a one-time cache break: earlier
     deploys served this file with max-age=3600, so browsers went on running
     a stale copy — and a stale switch is an open door. flags.js is max-age=0
     in _headers now, so revalidation keeps it fresh from here and the query
     never needs bumping again. -->
<script src="flags.js?v=2"></script>
<meta name="description" content="${esc(a.desc)}">
<meta name="theme-color" content="#1A3668">
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(a.name)} — A City That Works">
<meta property="og:description" content="${esc(a.desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="A City That Works">
<meta property="og:locale" content="en_CA">
<meta property="og:image" content="https://acitythatworks.ca/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A City That Works — A Citizens' Framework for Victoria 2026">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://acitythatworks.ca/og-card.png">
<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css?v=14">
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>

<header>
<div class="c hr">
<a href="/" class="brand"><svg class="bicn" viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="112" fill="#FAF7F0"/><g fill="none" stroke="#16335c" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M52 92  q22.5 -14 45 0 t45 0 t45 0"/><path d="M52 120 q22.5 -14 45 0 t45 0 t45 0" opacity="0.88"/><path d="M52 148 q22.5 -14 45 0 t45 0 t45 0" opacity="0.76"/></g></svg><span class="nm">A City That Works</span><span class="num">Victoria 2026</span></a>
<nav class="nv">
<a href="/summary">Summary</a>
<a href="/measures">Measures</a>
<a href="/neighbourhoods">Neighbourhoods</a>
<a href="/scorecard" data-cand class="nv-sc">Who has answered</a>
<a href="/faq">FAQ</a>
</nav>
<button id="mt" class="mb" aria-label="Open menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
</div>
<div id="mn" class="mm">
<div class="c mmi">
<a href="/">Home</a>
<a href="/summary">Summary</a>
<a href="/measures">Measures</a>
<a href="/neighbourhoods">Neighbourhoods</a>
<a href="/scorecard" data-cand>Who has answered</a>
<a href="/faq">FAQ</a>
</div>
</div>
</header>

<main id="main">
<div class="cn">
<nav class="crumbs" aria-label="Breadcrumb">
<a href="index.html">Framework</a><span class="sep">/</span><a href="index.html#audience">By Audience</a><span class="sep">/</span><span class="here">${esc(a.name).replace(/&amp;/g, "&")}</span>
</nav>
<div class="hero">
<div class="eyb">${esc(a.eyebrow)}</div>
<h1 class="ph1">${esc(a.name).replace(/&amp;/g, "&")}</h1>
<p class="lead" style="margin-top:18px">${linkMeasures(a.short)}</p>
<p class="scale">This is the same framework as <a href="measures.html">the full Program</a> — same measures, same numbers, same jurisdictional caveats — ${esc(a.lens)}. Every measure named here is costed and sourced in the master, and every number links back to it.</p>
<a href="index.html" class="pgback">← Back to the framework</a>
</div>

<nav class="toc" aria-label="On this page">
<div class="toc-h">On this page</div>
<ol>
${toc}
</ol>
</nav>

<div class="jumpbar" id="jumpbar">
<div class="jumpin">
<label class="jl2" for="jumpsel">Jump to</label>
<select id="jumpsel" class="jumpsel" aria-label="Jump to a section">
<option value="">Choose a section…</option>
</select>
<button type="button" class="jumpbtn" id="jumpprev" aria-label="Previous section">↑</button>
<button type="button" class="jumpbtn" id="jumpnext" aria-label="Next section">↓</button>
<a class="jumpbtn jumptop" href="#main" aria-label="Back to top">Top</a>
</div>
<div class="jumpprog" aria-hidden="true"><i id="jumpfill"></i></div>
</div>

<div class="prose">
${body}
<p style="margin-top:32px"><a href="measures.html" class="pgback">← Read the full framework</a></p>
</div>
</div>
</main>

<div id="footer-mount"></div>
<script src="site.js?v=12"></script>
<script src="jumpnav.js"></script>
</body>
</html>
`;
}

console.log("Building audience companion pages...");
AUD.forEach(function (a) {
  const file = path.join(ROOT, a.slug + ".html");
  const html = page(a);
  const before = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (before === html) { console.log("  unchanged " + a.slug + ".html"); return; }
  fs.writeFileSync(file, html, "utf8");
  console.log("  wrote     " + a.slug + ".html (" + html.length + " bytes)");
});
console.log("Done.");

if (typeof module !== "undefined" && module.exports) module.exports = { AUD, linkMeasures };

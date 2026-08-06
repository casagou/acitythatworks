A City That Works — Neighbourhood pages master
==============================================

This file is the master copy of the 13 neighbourhood pages, dumped from the
Notion page "Victoria 2030, Neighbourhood by Neighbourhood". `build/neighbourhoods.js`
parses it and writes `neighbourhood-<slug>.html` for each entry, plus the card
grid inside `neighbourhoods.html` and the one on `index.html`.

Edit this file, re-run the script, commit both. Do not edit the generated pages.

Format, per entry:

    === <slug>
    key: value            (front matter, one per line, until the --- line)
    ---
    ## Section heading            ||optional short label for the on-page contents
    #### Group label
    - bullet
    1. numbered item
    :::voice  … :::       who speaks for this neighbourhood (grey callout)
    :::money  … :::       what it means for your household (grey callout)
    :::straight … :::     straight goods (grey callout)
    :::note   … :::       any other aside

Inline: **bold**, *italic*, [text](url). Measure references written as M27 or
M66d are turned into links to measures.html automatically — do not hand-link them.

=== downtown
name: Downtown
emoji: 🏙️
tagline: The engine of the region, and the place where every promise the city makes gets tested first.
card: The public order team, bylaw to 10 PM, a 48-hour graffiti clock, first-hour free parking — and the signature public-space project residents vote on.
assoc: Victoria Downtown Residents Association
assocurl: https://www.victoriadra.ca/
meta: What A City That Works does in Downtown Victoria: a public order team, bylaw enforcement to 10 PM, 48-hour graffiti removal, first-hour free parking, and a signature public-space project decided by referendum.
---
## Where things stand (2026)
- **48% of downtown businesses** told the DVBA in 2025 they would consider leaving if their lease expired. Commercial vacancy on the Pandora corridor hit **10.7%** in early 2025, a record.
- VicPD's own community survey: **59% feel safe downtown by day, 22% at night**, both down sharply since 2020.
- Bylaw enforcement stops at 4 PM. Street disorder doesn't.
- And still: three-time "best small city" honours, strong tourism, new hotel construction. Downtown isn't dying. It's under-managed.

:::voice
**Who speaks for Downtown, and who doesn't.** The city-wide numbers here, including the DVBA's 48% figure, the 10.7% Pandora vacancy rate and VicPD's safety-perception survey, are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [Victoria Downtown Residents Association](https://www.victoriadra.ca/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: a Thursday evening in June ||Victoria 2030
Government Street is closed to cars for the season and the patios have taken the road. You cut through Bastion Square, fully pedestrianized now, a band setting up under the restored facades. The tag someone sprayed on the bookshop Saturday night was gone by Monday, because a 48-hour clock is a 48-hour clock.

At Douglas you barely stop: the signals adapt to the traffic that's actually there. On Pandora, the block that used to make people cross the street is the block people cross the street *for*. And the biggest change of all is the one residents chose themselves.

**Picture the version you get to vote on.** The signature public-space project (M45c) shortlists 3 concepts in Year 1, developed with the host Nations (M1) and the neighbourhood associations (M80), every one visualized under M53 and M53b before the ballot: a **Pandora corridor linear park**, a continuous Inner Harbour promenade, or a full Centennial Square renewal.

The linear park is the one that transforms this street most: a green corridor of trees, benches, play space and patio frontage where the city's hardest block used to be. Block by block, Victoria's most damaged corridor becomes its most cared-for one.

**And here is the price, because a project without one is a wish.** The cost basis is **$40 to $80 million**, all-in for a 1 to 2 km corridor, benchmarked against Nice's Promenade du Paillon, Montreal's Promenade Fleuve-Montagne, Toronto's Bentway and Vancouver's Arbutus Greenway. Four conditions come attached, and none of them is optional:
- **A published scope ledger comes before the referendum, or there is no referendum.** What is in the number, and what isn't.
- **A senior-government cost-share of at least one third**, secured before the vote.
- **The referendum decides** (M74, M77), because new capital over $25M is not council's call to make alone.
- **Sequenced strictly after the safety and capacity work** (M26, M35), not instead of it.

That last one isn't a hedge. It's the reason it will actually hold. Quarterly public reports run through construction (M78).

## What the framework does here
#### Public safety in commercial areas
- Downtown Public Order Team (M26): VicPD, bylaw, sanitation and outreach in one unit, one daily briefing.
- Bylaw enforcement **6 AM to 10 PM, 7 days** (M27), up from 7-to-4.
- 48-hour graffiti removal (M14). Smart LED streetlights, no cameras, no audio, no behavioural AI (M30): best evidence is a **14% total crime reduction** from lighting alone.
- Focused deterrence on trafficking, weapons and violent repeat offenders (M28), built on the FOI finding that **24% of all 2022 police calls came from 19 addresses**. Every enforcement action published quarterly, including how much survived adjudication.
- Capacity-first enforcement (M35) paired with STEP throughput (M11): enforce when there is somewhere to send people, and make sure there is.
- Voluntary business camera registry (M28c). The City installs no cameras of its own.

#### Small business support
- Vacant storefront strategy (M71) with a quarterly transparency report. Red-tape reduction (M72) and lower permit fees (M76).
- **First-hour free parking** plus real-time availability (M24).

#### Housing affordability and transit
- Lower development cost charges for rental buildings (M8), the per-home fees builders pay the City, cut for rental so rental is cheaper to build. Short-term rental tightening (M9b), the 26°C cooling rule for renters during heat warnings (M64).
- A named transit priority capital line for bus lanes, queue jumps and signal priority (M23b), and adaptive signals on the major corridors (M19).

#### The oldest names
- Downtown stands on lək̓ʷəŋən land. The framework's place-naming measure (M3) restores lək̓ʷəŋən names alongside colonial ones in the public realm, built with the Songhees and Esquimalt Nations through the standing tables (M1), not announced at them.

#### Also lands here
- **Bastion Square fully pedestrianized, Government Street seasonally** (M45b), with Fan Tan Alley kept vehicle-free. Any pilot that fails its published test after two seasons is reversed. Honest experiments, not permanent surprises.
- **Victoria's own street furniture back** (M44): lamp posts, benches, planters, shelters to a heritage standard instead of catalogue generic. **Heritage and ornamental lighting on longer hours** (M48), and **the whole downtown lit properly all night** (M37).
- **Public washrooms treated as transportation infrastructure** (M24b), mapped and open, because a downtown you can't spend three hours in is a downtown you leave.
- **Graffiti replaced with commissioned public art** (M18), not just scrubbed.
- **Business-security cost-spreading** (M28b) for the operators most exposed to spillover, and a **weekly public-safety dashboard** (M31) so the trend is visible, not anecdotal.
- **Somewhere for 18-to-25s** (M13c): youth-priority space, late-evening hours, post-secondary partnerships. Downtown empties at 6 PM for people who can't afford a restaurant.
- **Demoviction protection** (M9) for the renters living above the shops, and **Team Victoria** (M73b) with one number to hit: storefront vacancy from 11% to 5%.
- **The ocean economy named as Victoria's vertical** (M55b), anchored on the working harbour.

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%, so the number in your mailbox is the number that's capped. The Household Bill (M66d) publishes property tax plus water, sewer, waste and stormwater as **one figure with a five-year forward view**, because your real bill was never just the tax rate. And if the City over-collects, it comes back as a credit on your next notice rather than into a reserve (M66b).
:::

## The first 18 months
1. DPOT stood up, single daily briefing running.
2. Bylaw hours extended to 10 PM. Graffiti clock live.
3. First-hour free parking in effect.
4. Cleanliness, vacancy and safety-perception KPIs on the public quarterly dashboard.
5. M45c concept design, AI visualization (M53b) and consultation with the host Nations and neighbourhood associations underway; scope ledger drafted and cost-share negotiations opened.

## How you'll measure it
Storefront vacancy rate. Night-time safety perception. Graffiti response time. Enforcement survival rate. Quarterly on the dashboard (M67), annually in the survey (M82).

:::straight
**Straight goods:** the signature project is decided by referendum, not by this document, and its $40–80M basis is an envelope rather than a tender price. The authoritative cost basis is the [Capital Financing Structure annex](capital.html); the measure text in the master Program has not yet been updated to restate it, and that sync is queued. Enforcement follows the capacity-first legal test. Nothing else here is new cost beyond the published envelope.
:::

=== james-bay
name: James Bay
emoji: ⚓
tagline: Victoria's oldest neighbourhood. More seniors than anywhere else in the city, a working harbour at one end, Dallas Road at the other.
card: Accessibility remediation first in the city, the 26°C cooling rule, crossings timed for how people actually walk, and a cruise-season routing plan built with residents.
assoc: James Bay Neighbourhood Association
assocurl: https://jbna.org/
meta: What A City That Works does in James Bay: accessibility remediation first in the city, the 26°C cooling rule, crossings timed for real walking speeds, and a cruise-season routing plan built with residents.
---
## Where things stand (2026)
- Sidewalks and crossings built generations ago now serve the city's highest concentration of seniors, at walking speeds the signals were never timed for.
- The 2021 heat dome killed **619 people in BC. 98% died indoors. 67% were 70 or older. 56% lived alone.** That is James Bay's demographic profile, precisely.
- Cruise season brings buses and shuttles through the neighbourhood from May to October. How much that affects which residential streets is a question the neighbourhood association has raised for years and is better placed than this document to answer.
- Like everywhere in the city, too many residents have no attached family doctor.

:::voice
**Who speaks for James Bay, and who doesn't.** The city-wide numbers here, including the heat-dome figures, are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [James Bay Neighbourhood Association](https://jbna.org/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: a July morning on Dallas Road ||Victoria 2030
There's shade and a bench within reach the whole length of the walkway. You cross Menzies at a signal timed for how people actually walk, not how engineers wish they did. Your mother's building has its cool room now: during a declared heat warning, her landlord keeps at least one room under 26°C, and heat warnings have become something her building manages instead of something it survives.

The clinic in the village took her on last year, in space the City helped make viable. The cruise buses run a routing the neighbourhood helped design instead of one it endures. None of this is dramatic. That's the point. It's a neighbourhood where growing old is an ordinary, safe thing to do.

## What the framework does here
#### Senior safety and services
- Universal accessibility audit and remediation (M25b): every sidewalk, crossing, washroom and public building, with James Bay first in the remediation sequence because the density of need is highest here. $0 new: this is sequencing of an existing commitment.
- The 26°C maximum-temperature rental rule during declared heat warnings (M64). In this neighbourhood it's not climate policy. It's the same logic as a smoke detector.
- Family-doctor recruitment through clinic space and permissive tax exemptions (M13b). Emergency preparedness (M64) with a coastal and seismic focus (M64b): James Bay is low-lying, and Cascadia planning starts where the water is.

#### Traffic calming
- The walking measures (M20b): a published sidewalk gap inventory, a crossing-spacing standard, and pedestrian signal timing at real walking speeds.
- Dangerous-crossing redesign (M38) at the worst intersections, 30 km/h on residential streets (M39). Automated school- and speed-camera enforcement is provincial: the framework advocates for it (M40) and says so plainly.
- A cruise-season routing plan built with the harbour authority under existing corridor management, designed with residents, not announced to them.

#### Heritage, parks, character
- Heritage design standards (M43) so infill fits the streetscape, and the suite-legalization amnesty (M8b), which adds homes inside existing houses without changing the street at all.
- Maintenance-first discipline: existing parks and paths kept up before new ones are promised. Tree planting (M61) toward the 35% canopy target.
- **Beacon Hill Park** is named in the framework's reclaim-priority-spaces commitment: a permanent, humane, visible presence with a same-day protocol for structures blocking paths, so the park at the neighbourhood's edge stays everyone's park.

#### Also lands here
- **The waterfront walk finished** (M47): the gaps closed between Songhees Point, the causeway, Fisherman's Wharf and Dallas Road into one uninterrupted route. James Bay is the neighbourhood that gains most from a promenade that actually connects.
- **Parks kept to a standard** (M49), with **public washrooms open and mapped** (M24b) and **proper lighting all night** (M37) on the routes people actually walk after dark.
- **A pet-friendly parks standard** (M25c): clear, consistent rules, waste stations and water at every major park, so the daily dog walk stops being a guessing game.
- **Climate Friendly Homes** (M60) with published uptake numbers, aimed at exactly this housing stock: older homes, fixed incomes, high heating bills.
- **Demoviction protection** (M9) for the renters in the low-rise blocks, many of them seniors with nowhere comparable to move.

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%. For a neighbourhood with this many people on fixed incomes, that gap is not an accounting detail. The Household Bill (M66d) publishes tax plus water, sewer, waste and stormwater as **one number with a five-year view**, so a pension can be planned against it. Over-collection comes back as a credit, not into a reserve (M66b).
:::

## The first 18 months
1. The accessibility audit walks every James Bay block. Findings published.
2. The 3 worst crossings redesigned. Signal retiming begins.
3. The 26°C rule adopted before the next heat season.
4. Clinic-space inventory published, first M13b conversations opened.

## How you'll measure it
Pedestrian injuries. Kilometres of sidewalk gap closed. Crossings remediated. Heat-event outcomes. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** doctor recruitment and camera enforcement involve the Province, and the framework says which parts are advocacy. The rest is City jurisdiction, already costed.
:::

=== fairfield
name: Fairfield
emoji: 🌳
tagline: Cook Street Village and the streets that walk to it. Beacon Hill on one side, Ross Bay on the other.
card: Village red tape cut, published permit clocks, a pattern book so gentle density looks like it belongs, safe routes to school, and 2-for-1 tree replacement.
assoc: Fairfield Gonzales Community Association
assocurl: https://fairfieldcommunity.ca/
meta: What A City That Works does in Fairfield: village red tape cut, published permit clocks, a pre-approved pattern book, safe routes to school with SD61, and canopy replacement 2-for-1.
---
## Where things stand (2026)
- Village businesses carry the same paperwork and fee load as a big-box chain, on a fraction of the margin.
- Kids' routes to school cross streets where speeding is routine and enforcement isn't.
- The canopy that makes Fairfield feel like Fairfield is old, and it's thinning parcel by parcel.
- Residents broadly accept gentle infill. What they don't trust is what it will look like: **61 Missing Middle permits city-wide in 2024 against a target of 150** says the current system fails builders and neighbours alike.

:::voice
**Who speaks for Fairfield, and who doesn't.** The city-wide numbers here, including the 61-versus-150 permit figure, are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [Fairfield Gonzales Community Association](https://fairfieldcommunity.ca/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: Saturday morning in the village ||Victoria 2030
The bakery's renovation permit took 5 weeks, start to finish, on a published clock the owner could check like a parcel tracker. Two kids ride past you on the protected connection toward Sir James Douglas, part of a safe-routes program the school district and the City actually run together.

On the corner where the teardown went in, there's a fourplex from the pattern book. Cedar, bay windows, a front porch. Neighbours point to it as the good example, which is exactly what a pattern book is for. And the boulevard maples that came down were replaced 2-for-1, plus the free seedlings half the street planted in their yards.

## What the framework does here
#### Village small business
- Red-tape reduction (M72), lower permit fees (M76), **first-hour free parking** (M24) so a quick village stop doesn't cost more than the coffee.

#### School routes and traffic calming
- A standing joint-use agreement with School District 61 (M13d): safe routes to school as a program, shared gyms and fields, childcare on school sites.
- The crossing-spacing standard and real walking-speed signals (M20b), 30 km/h residential (M39). Camera enforcement is provincial; the framework advocates for it (M40) and labels it as advocacy.

#### Character and heritage
- Published permit clocks (M7) and the pre-approved pattern book (M7b): duplex to fourplex forms with an automatic fast lane, so gentle density arrives looking like it belongs.
- Heritage design standards (M43) and heritage restoration incentives (M46).

#### Parks and canopy
- 5,000 new trees by 2030 toward a 35% canopy target by 2035 (M61), with free seedlings for homeowners, because 75% of Victoria's canopy stands on private land and Fairfield's lots are a large share of it.

#### Also lands here
- **Parks kept to a standard** (M49) and a **pet-friendly parks standard** (M25c): clear rules, waste stations and water at every major park. In a neighbourhood this dog-heavy, that's a daily quality-of-life change.
- **Victoria's own street furniture** (M44) in the village instead of catalogue generic, and **graffiti replaced with commissioned public art** (M18) rather than only scrubbed.
- **Climate Friendly Homes** (M60) with published uptake, aimed at the pre-war housing stock that leaks heat and money.
- **Drug-use buffer zones around child-focused spaces** (M33b): schools, playgrounds, sports fields and libraries, posted and enforced consistently. The City defines and protects the spaces; drug law itself is federal.

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%, and pairs it with a rule that the business-to-residential ratio isn't shifted to manufacture the number. The Household Bill (M66d) publishes tax plus water, sewer, waste and stormwater as **one number with a five-year view**. Over-collection returns as a credit on your next notice (M66b).
:::

## The first 18 months
1. SD61 agreement signed. Safe-routes work starts at Sir James Douglas.
2. Village red-tape kill list published with the business association, first items cut.
3. Pattern book published with Fairfield-scale examples.
4. Permit clocks live and public.

## How you'll measure it
Permit times by category. Village vacancy. Trees planted and canopy trend. School-route incident counts. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** speed cameras need the Province and are marked advocacy. Everything else here is City jurisdiction, sequenced from existing costed measures.
:::

=== gonzales
name: Gonzales
emoji: 🌊
tagline: The quiet quarter. Gonzales Bay, the observatory hill, streets that end at the sea.
card: Stormwater upgrades tied publicly to bay water quality, calming on the cut-through avenues, design standards with teeth, and the honest household bill.
assoc: Fairfield Gonzales Community Association
assocurl: https://fairfieldcommunity.ca/
meta: What A City That Works does in Gonzales: stormwater upgrades tied to published bay water quality, traffic calming on the cut-through avenues, heritage design standards, and one honest household bill.
---
## Where things stand (2026)
- After heavy rain, stormwater outfalls affect water quality at the bay, and the stormwater fee ($218.42 per property, every year) buys pipes that keep aging anyway.
- The avenues carry cut-through traffic at speeds no one signed up for.
- When design standards are vague, character homes get replaced by whatever pencils, and the streetscape loses a little each time.

:::voice
**Who speaks for Gonzales, and who doesn't.** The city-wide numbers here, including the $218.42 stormwater fee and the CRD's five-year water rate forecast, are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [Fairfield Gonzales Community Association](https://fairfieldcommunity.ca/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: the morning after a storm ||Victoria 2030
You check the bay's water quality the way you check the weather: public, current, and usually boring, because the outfall work got done and the readings get published instead of filed. Walking home, the new build on the corner kept the setback, the roofline and the cedar. It added 3 homes and you'd have to squint to notice.

The avenue got its crossings and its 30 km/h, and the drivers who used it as a shortcut mostly don't anymore. On your tax notice, one published number now covers property tax, water, sewer, waste and stormwater together, with a 5-year forward view. You can finally see what you actually pay, and what it buys.

## What the framework does here
#### Water and shoreline
- Stormwater upgrades tied publicly to bay water quality (M59), with the outfall condition assessment published, not filed.
- Ecosystem and shoreline protection (M63).

#### Traffic calming
- The crossing-spacing standard and walking-speed signals (M20b), 30 km/h residential (M39), redesign at the worst cut-through junctions (M38).

#### Character
- Heritage design standards (M43) and the pattern book (M7b), so infill is gentle in fact and not just in name. Published permit clocks (M7) reward the builders who do it right.
- Canopy planting and free seedlings (M61).

#### The honest bill
- The Household Bill (M66d): one published number, property tax plus every utility line including that stormwater fee, with a 5-year view, published beside the tax glide path and never apart from it.

#### Also lands here
- **Parks and gardens kept to a standard** (M49), a **pet-friendly parks standard** (M25c) with waste stations and water, and **proper lighting** (M37) on the walking routes to the bay.
- **A safety audit on every new road project** (M42), so calming isn't retrofitted after somebody is hurt.
- **Climate Friendly Homes** (M60) with published uptake for the older housing stock.
- **Demoviction protection** (M9) for the low-rise rentals tucked between the character homes.

:::money
**What it means for your household.** This is the neighbourhood where the honest-bill argument bites hardest. Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. On top of that sits the **$218.42 stormwater fee** and CRD water rates forecast at 7.6, 9.4, 10.9, 12.3 and 12.6% through 2030, compounding to roughly **65% in five years**. The glide path (M66) caps the **residential** rate. The Household Bill (M66d) publishes all of it as **one number with a five-year view**, and the regional bill measure (M70c) publishes how Victoria's CRD representatives voted on the water program driving it. Over-collection returns as a credit (M66b).
:::

## The first 18 months
1. Outfall condition assessment for the bay published.
2. Calming installed on the 2 worst cut-through routes.
3. Design standards adopted, pattern book live.
4. First Household Bill published.

## How you'll measure it
Bay water-quality readings. Pipe renewal kilometres. Speed and volume on the avenues. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** regional water rates are set at the CRD, and the framework's regional-bill measure (M70c) publishes the City's position and its representatives' votes rather than pretending the City sets them.
:::

=== rockland
name: Rockland
emoji: 🏰
tagline: Craigdarroch, Government House, and the deepest canopy in Victoria. Heritage here isn't a museum. It's the housing stock.
card: A conversion design guideline, the suite-legalization amnesty, a published canopy number, and calming where the cut-through runs.
assoc: Rockland Neighbourhood Association
assocurl: http://rockland.bc.ca/wp/
meta: What A City That Works does in Rockland: a heritage conversion design guideline, the suite-legalization amnesty, a published canopy target, and traffic calming on Rockland Avenue.
---
## Where things stand (2026)
- Rockland's mansions have been converting to multi-unit homes for a century. Some blocks show how well that works. Others show what happens when there's no standard for doing it right.
- Canopy is lost parcel by parcel, and there's no published target holding anyone to a result.
- Plenty of homeowners would add a legal suite tomorrow if the process didn't require a consultant and a year of their life. Many suites already exist, quietly, outside the rules.
- Rockland Avenue and the streets that feed it sit between arterials, and cut-through traffic is a recurring local concern. The framework's position is that a speed and volume count should establish the facts before anything is built, which is what the walking and calming measures require anyway.

:::voice
**Who speaks for Rockland, and who doesn't.** The city-wide numbers here are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [Rockland Neighbourhood Association](http://rockland.bc.ca/wp/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: a walk up the avenue ||Victoria 2030
The conversion on the corner added 6 homes behind a fully restored facade, and it went through on a published clock because it followed the conversion design guideline instead of fighting it. The oaks along the street are registered now, replaced 2-for-1 when one comes down, and the canopy number for the neighbourhood is published every year and moving the right way.

Your parents legalized the basement suite through the amnesty: life-safety inspection, a named concierge at the City, no retroactive penalty, no rent reset for their tenant. A rental home that already existed became a legal one, at zero construction cost, and the street didn't change at all.

## What the framework does here
#### Heritage and character
- Heritage design standards (M43): conversion done right becomes the documented norm, not the lucky exception. Heritage restoration incentives (M46) reward restoration.
- Published permit clocks (M7) so a compliant heritage conversion isn't punished with delay.

#### Homes without changing the street
- The suite-legalization amnesty (M8b): 24 months, life-safety-only, named permitting concierge, no retroactive penalty, no rent reset for the sitting tenant. Rockland's large homes are exactly where it yields the most.
- The pattern book (M7b) for the lots where gentle infill fits.

#### Canopy and safety
- 5,000 trees and the 35% canopy target by 2035 (M61), with free seedlings, because 75% of the city's canopy is private and Rockland's estates are its bank.
- Smart LED streetlighting with no surveillance of any kind (M30). Accessibility remediation (M25) for a neighbourhood aging in place.
- Traffic calming where the cut-through runs: 30 km/h residential (M39) and the crossing-spacing standard (M20b) on Rockland Avenue.

#### Also lands here
- **Heritage and ornamental lighting on longer hours** (M48). Rockland's streetscape is one of the reasons people visit Victoria, and it currently goes dark early.
- **Parks and gardens kept to a standard** (M49), including the Government House grounds edge, plus a **pet-friendly parks standard** (M25c).
- **Climate Friendly Homes** (M60) with published uptake. Heritage houses are the hardest and most expensive to heat in the city, and the retrofit program has never published who actually used it.
- **Demoviction protection** (M9) for tenants in the converted houses, who are often the least visible renters in Victoria.
- **Proper lighting all night** (M37) on the walking routes, without a single camera (M30).

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. Assessed values here are above the median, so the bill is bigger and the gap between the headline and the reality is wider. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%, with an honest caveat: your individual bill still moves with BC Assessment's valuation, and no council controls that. The Household Bill (M66d) publishes tax plus every utility as **one number with a five-year view**. Over-collection returns as a credit (M66b).
:::

## The first 18 months
1. Conversion design guideline published.
2. Amnesty concierge live, first suites legalized.
3. Heritage restoration incentive uptake reported quarterly.
4. Canopy baseline for the neighbourhood published.
5. Calming assessment on Rockland Avenue, worst crossings first.

## How you'll measure it
Suites legalized. Conversions approved on-clock. Canopy trend. Heritage restoration incentive uptake. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** nothing here rezones Rockland or overrides heritage protection. The framework's bet is the opposite one: clear standards produce more homes and better streets than vague rules ever have.
:::

=== vic-west
name: Vic West
emoji: 🚲
tagline: The Goose trailhead, the harbour's far shore, and the fastest-changing ground in the city.
card: Published permit clocks on the development pipeline, composition targets, trail-crossing fixes worst-first, and a City transit position on the record.
assoc: Vic West Community Association
assocurl: https://www.victoriawest.ca/
meta: What A City That Works does in Vic West: published permit clocks, housing composition targets, trail-crossing fixes worst-first, and a published City position on rapid transit and the E&N corridor.
---
## Where things stand (2026)
- The Roundhouse lands were promised a generation ago. They're still mostly waiting.
- Growth has run ahead of what supports it: childcare, crossings, park capacity.
- The E&N corridor sits idle while the region argues about it.
- City-wide, Missing Middle produced **61 permits in 2024 against a target of 150**. The bottleneck isn't zoning anymore. It's cost and delay, and Vic West's development pipeline feels it more than anywhere.

:::voice
**A naming note, and who speaks here.** Victoria West is the official City name; Vic West is what everyone calls it. The city-wide numbers on this page are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [Vic West Community Association](https://www.victoriawest.ca/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: the bridge, 8:40 AM ||Victoria 2030
You cross on the Goose with your kid on the tag-along and you're downtown in less time than parking would have taken. The crossings where the trail meets streets got fixed years ago, in order of their injury record, and it shows.

The Roundhouse is restored and its plaza is full on a Sunday. Around it, homes stand where gravel sat for 20 years, and the reason isn't a slogan: every application ran on a published permit clock the whole neighbourhood could watch, which turns out to be what "holding everyone accountable" actually looks like. Down the corridor, the right-of-way is protected and the City's position on rapid transit is published, on the record, and pushed at every table that decides it.

And the shoreline itself carries the neighbourhood's oldest fact: the Songhees village stood on this shore until 1911. The framework's foundation, standing government-to-government tables with the Songhees and Esquimalt Nations (M1), is not a land acknowledgement here. It's the working relationship the waterfront's future runs through.

## What the framework does here
#### Delivery, not announcements
- Published permit times by category (M7): simple under 6 weeks, complex under 6 months, rezoning under 9 months. The pattern book fast lane (M7b) and lower development cost charges for rental buildings (M8), the per-home fees builders pay the City, cut so rental is cheaper to build.
- The city land bank (M6b): strategic acquisition, competitive disposition.
- Composition targets (M6): 30% rental, 15% non-market, 20% three-bedroom-plus, because Vic West needs homes families can stay in, not just units.

#### Transit and the trail
- Champion Westshore rapid transit and the E&N corridor (M22): endorse LRT/BRT, protect the right-of-way. This is advocacy, and the framework says so; routes and fares are not the City's to promise.
- What the City does control, it funds: a named transit priority capital line for bus lanes, queue jumps and signal priority (M23b), and a published City transit position with a record of Commission votes.
- The AAA bike network with the Goose as its spine (M20). The AAA maintenance standard and end-of-trip facilities are in the gated tier: they proceed in Year 2 only on verified Year 1 savings, and the framework is honest about that.

#### Family services
- The SD61 joint-use agreement (M13d): shared gyms and fields, childcare on school sites, safe routes as a program. Childcare itself is provincially funded; the City's role is space and advocacy (M12), stated plainly.
- The Vic West Community Centre and Banfield Park carry a neighbourhood growing faster than its amenities. Joint-use (M13d) and maintenance-first discipline put existing capacity to full use before anything new gets promised.
- Stormwater renewal (M59) and Gorge shoreline protection (M63).

#### Also lands here
- **The waterfront walk finished** (M47), closing the gaps from Songhees Point along the harbour. Vic West holds the shoreline the rest of the city looks at.
- **The ocean economy named as Victoria's declared vertical** (M55b), anchored on the working harbour, Ocean Networks Canada and CFB Esquimalt. Vic West is where those are jobs, not a slogan.
- **Bus lanes and priority on the corridors** (M23), so transit is time-competitive with driving across the bridge rather than a slower version of it.
- **Parks kept to a standard** (M49) including Banfield, a **pet-friendly parks standard** (M25c), and **proper night lighting** (M37) on the Goose.
- **Demoviction protection** (M9) as the corridor redevelops, so existing renters aren't the cost of new supply.

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. Vic West carries a high share of renters, who pay this through rent without ever seeing a notice. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%, and the Household Bill (M66d) publishes tax plus water, sewer, waste and stormwater as **one number with a five-year view** that a renter can read as easily as an owner. Over-collection returns as a credit (M66b).
:::

## The first 18 months
1. Permit clocks published. The Bayview file tracked on them, in public.
2. Trail-street crossing fixes begin, worst first.
3. City transit position published (M23b). E&N advocacy file opened with the Province and the region.
4. SD61 agreement signed.

## How you'll measure it
Homes completed and their composition. Permit times against the published clocks. Trail-crossing injuries. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** the E&N is a regional and provincial decision, marked advocacy. Two bike-network enhancements are gated on verified savings. The delivery machinery is City jurisdiction and starts immediately.
:::

=== hillside-quadra
name: Hillside-Quadra
emoji: 🌎
tagline: Quadra Village, Topaz Park, and more languages on one shopping street than anywhere else in the city.
card: Composition targets and auditable waitlists, STEP throughput with regional fair-share pressure, one civic process in plain language, and transit priority on Douglas and Hillside.
assoc: Hillside-Quadra Community Association
assocurl: https://www.qvcc.ca/
meta: What A City That Works does in Hillside-Quadra: non-market composition targets, publicly auditable waitlists, STEP throughput with regional fair-share pressure, and one civic process written in plain language.
---
## Where things stand (2026)
- Working families are being priced out of the neighbourhood that has always held them.
- Victoria carries **89% of the region's shelter spaces and 83% of its supportive and transitional housing** across 13 municipalities, and a disproportionate share of it sits in and around this neighbourhood, while the services that make it work lag behind.
- Village storefronts face the same cost pressures reported downtown, with less attention paid to them. The framework's answer is to publish the vacancy numbers by area rather than assert them.
- Community groups and residents who deal with City Hall describe the same barrier: forms and criteria written in language a person needs a consultant to decode.

:::voice
**Who speaks for Hillside-Quadra, and who doesn't.** The city-wide numbers here, including the 89% and 83% shelter and supportive-housing shares, are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [Hillside-Quadra Community Association](https://www.qvcc.ca/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: Topaz, a June evening ||Victoria 2030
The bike park is loud, the fields are booked, and the village patios are out on Quadra. The family two doors down is still here because a below-market rental building actually opened, on time, and the waitlist that allocated it was a published, points-based system anyone could audit, not a mystery.

The seniors' society that serves the neighbourhood got its City grant this year, and the reason is dull and important: one process, the same forms and the same published decision rules as everyone else, written in plain language a volunteer board can read without hiring help. And the supportive housing on the neighbourhood's edge works better than it did, because the people ready to move on now have somewhere to move on to, and the region as a whole finally shares the load it used to leave here.

## What the framework does here
#### Affordable housing that actually lands
- Composition targets (M6): 15% non-market and 30% rental is the point, not raw volume. Lower development cost charges for rental buildings (M8), the per-home fees builders pay the City, cut so rental is cheaper to build. Plus the pattern book (M7b) for the missing-middle infill this neighbourhood was built for: duplexes, triplexes and fourplexes, the homes between a house and a tower.
- Transparent, points-based, publicly auditable allocation for City-influenced housing waitlists (M10).
- STEP-style throughput with BC Housing, Island Health and Pacifica (M11): free up supportive units by helping residents transition out, and enforce on a capacity-first basis. Paired with the downloading ledger and regional fair-share pressure (M70b), because one neighbourhood carrying a region's load is not a plan.

#### Family services, parks, school zones
- School food (M13) and the SD61 agreement (M13d): joint-use fields and gyms, safe routes to school as a program, childcare on school sites.
- The Quadra Village Community Centre is the neighbourhood's living room. Joint-use with SD61 (M13d) expands what it can offer without a new building.
- The walking standards (M20b) where school routes cross the arterials.

#### The village and the community
- Red-tape reduction (M72), the vacant storefront strategy (M71), first-hour free parking (M24).
- One civic process for everyone (M10): same forms, same criteria, same queue, same published decision rules, written plainly and available in both official languages (M80b). Neighbourhood empowerment (M80) so the associations here have a standing route into City decisions. Bylaw presence to 10 PM (M27).

#### Also lands here
- **Bus lanes and transit priority on Douglas and Hillside** (M23). These are the two corridors that define this neighbourhood, and they carry the buses most people here actually depend on.
- **Demoviction protection** (M9) and **advocacy for vacancy control between tenancies** (M9c), marked honestly as advocacy: rent rules are the Province's, and the City argues rather than decides.
- **Drug-use buffer zones around child-focused spaces** (M33b): schools, playgrounds, sports fields, libraries and community centres, posted and consistently enforced. The City protects the spaces; drug law itself is federal.
- **Business-security cost-spreading** (M28b) for the Quadra Village operators most exposed to spillover, and **graffiti replaced with commissioned public art** (M18).
- **Parks kept to a standard** (M49) including Topaz, plus **proper night lighting** (M37) and a **pet-friendly parks standard** (M25c).

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. This is a neighbourhood of renters and working families, and both pay it: owners on the notice, renters through the rent. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%. The Household Bill (M66d) publishes tax plus water, sewer, waste and stormwater as **one number with a five-year view**, in plain language. Over-collection returns as a credit rather than into a reserve (M66b).
:::

## The first 18 months
1. Grant and consultation materials rewritten in plain language, one process, both official languages.
2. STEP memorandum opened with BC Housing and Island Health.
3. Village red-tape list built with the businesses on Quadra, first items cut.
4. Safe-routes work starting at George Jay Elementary.

## How you'll measure it
Non-market and rental completions. Supportive-housing move-outs to market (the STEP number). Village vacancy. Time and cost for a small group to complete a City grant application. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** supportive housing and health services are provincial; the framework's lane is throughput, allocation transparency, and making the region pay its share, and it says so.
:::

=== oaklands
name: Oaklands
emoji: 🏡
tagline: Young families, corner stores, and a community centre that punches far above its weight.
card: Childcare on school sites through the SD61 agreement, a pattern-book fast lane for missing-middle infill, and the Hillside crossing audit.
assoc: Oaklands Community Association
assocurl: https://oaklands.life/
meta: What A City That Works does in Oaklands: childcare on school sites via the SD61 joint-use agreement, a pattern-book fast lane for missing-middle homes, and a Hillside Avenue crossing audit.
---
## Where things stand (2026)
- Childcare waitlists run years, not months. Families plan careers around them.
- The missing-middle homes Oaklands is perfectly built for aren't getting built: **61 permits city-wide in 2024 against a target of 150.**
- Community centre programs fill within minutes of registration opening.
- Hillside Avenue is an arterial running through a neighbourhood full of young children. Whether its crossings are spaced and timed for them is exactly what the framework's published pedestrian standard is designed to answer, block by block, with a count rather than an assertion.

:::voice
**Who speaks for Oaklands, and who doesn't.** The city-wide numbers here, including the 61-versus-150 permit figure, are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [Oaklands Community Association](https://oaklands.life/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: a Tuesday in September ||Victoria 2030
Drop-off is a 5-minute walk, because the childcare space opened on the school site, in the agreement the City and the school district finally signed. On the corner where the old bungalow sold, a fourplex from the pattern book went up in a single season: a local builder, a permit in weeks, and a design the street actually likes.

Crossing Hillside stopped being the scary part of the school run 2 years ago, when the crossings were rebuilt to the new spacing standard. And fall registration at the community centre didn't require the 7 AM refresh war, because program capacity finally grew with the neighbourhood.

## What the framework does here
#### Family services and childcare
- The SD61 standing agreement (M13d): childcare on school sites, joint-use gyms and fields, safe routes to school as a program. Childcare funding is provincial; the City's role is space, sites and advocacy (M12), and the framework says exactly that.
- School food (M13).

#### Missing-middle infill, done well
- The pattern book (M7b) with an automatic fast lane, published permit clocks (M7), and lower development cost charges for rental buildings (M8), the per-home fees builders pay the City. This is the fix for the 61-versus-150 failure: cost and delay, not zoning.
- Design standards (M43) so infill looks like Oaklands.

#### Parks, programs, safe streets
- The crossing-spacing standard and walking-speed signals (M20b) on Hillside and the school routes. 30 km/h residential (M39).
- Canopy planting and free seedlings (M61).
- Voting places weighted toward the lowest-turnout neighbourhoods (M82b), because a neighbourhood of young renters and busy parents deserves a ballot box it can reach.

#### Also lands here
- **Parks kept to a standard** (M49) and a **pet-friendly parks standard** (M25c) with waste stations and water at every major park.
- **Drug-use buffer zones around child-focused spaces** (M33b): schools, playgrounds and sports fields posted and consistently enforced. In a neighbourhood this full of young children, this is the measure parents ask about first.
- **Climate Friendly Homes** (M60) with published uptake, for the 1940s and 50s housing stock most Oaklands families are heating.
- **Outdoor spaces activated year-round** (M51), so the parks and the community centre grounds work in February and not only in July.
- **Proper night lighting** (M37) on the school routes, with no cameras anywhere (M30).

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. For a young family with a mortgage and childcare costs, $323 is a real number. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%, and Year 1 has to hit it **without** cancelling the debt payment or raiding the parking reserve, which is how the current council got to its number. The Household Bill (M66d) publishes tax plus every utility as **one figure with a five-year view**. Over-collection returns as a credit (M66b).
:::

## The first 18 months
1. SD61 agreement signed, first childcare-site assessment on a school property.
2. Pattern book published with Oaklands-scale examples, fast lane live.
3. Hillside crossing audit done, first rebuilds funded from the existing walking line.

## How you'll measure it
Childcare spaces created on public sites. Pattern-book permits issued and their clock times. Crossing injuries on Hillside. Program registration capacity. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** childcare operating dollars are provincial. The City's deliverables are sites, speed, and the agreement that unlocks school land, all already costed.
:::

=== fernwood
name: Fernwood
emoji: 🎭
tagline: The square, the Belfry, Vic High, and more murals per block than anywhere in the city.
card: The cultural-venue preservation tool, a published arts funding floor, a licensing fast lane for small venues, and a mural registry the graffiti clock can't touch.
assoc: Fernwood Neighbourhood Resource Group
assocurl: https://fernwoodnrg.ca/
meta: What A City That Works does in Fernwood: a cultural-venue preservation tool, a published arts funding floor, a licensing fast lane for small venues, and a protected mural registry.
---
## Where things stand (2026)
- Fernwood's cultural venues, the thing that makes the neighbourhood itself, are one lease renewal from disappearing. Victoria has already watched this movie elsewhere.
- The square thrives while the blocks around it feel the housing squeeze hardest.
- Tags sit on heritage storefronts longer than anyone wants, which is what a published 48-hour clock is for. The commissioned murals, meanwhile, are the neighbourhood's pride.
- Opening a small venue or cafe means months of licensing that a chain absorbs and a first-timer often can't.

:::voice
**Who speaks for Fernwood, and who doesn't.** The city-wide numbers here are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [Fernwood Neighbourhood Resource Group](https://fernwoodnrg.ca/) and the [Fernwood Community Association](https://thefca.ca/) speak for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: Friday night at the square ||Victoria 2030
The Belfry's home is secure, protected under the venue-preservation tool before its lease ever became a crisis. Around the corner, an 80-seat room opened last spring: licensed in weeks on the fast lane, run by two people who could never have survived the old process.

The tag someone left Saturday was gone by Monday, and the mural beside it wasn't touched, because removal targets vandalism and the commissioned walls are registered and protected. Down the block, the corner infill kept the painted-house rhythm of the street. Fernwood in 2030 is more Fernwood, not less. That was the whole design constraint.

## What the framework does here
#### Culture, secured
- The cultural-venue preservation tool (M46b): right-of-first-refusal plus a lease-bridge fund for designated live-music and arts spaces.
- The arts and culture funding floor (M50b): published, set at the current level, reducible only by supermajority with a published rationale. Fiscal discipline paid for by the cultural sector is not discipline.

#### Small business and safety in the commercial pockets
- Licensing red tape cut (M72), lower fees (M76). 48-hour graffiti removal (M14), with commissioned murals registered and exempt. Bylaw presence to 10 PM (M27). Lighting without surveillance (M30).

#### Housing affordability
- The pattern book (M7b) and permit clocks (M7) for gentle infill that keeps the streetscape (M43). Short-term rental tightening (M9b) to protect the long-term pool. Lower development cost charges for rental buildings (M8), the per-home fees builders pay the City. The 26°C cooling rule for renters (M64).
- Transit connections funded where the City actually controls them: the named transit priority capital line (M23b) for bus lanes and signal priority on the corridors Fernwood rides every day. Routes and fares belong to the Transit Commission, and the framework says so.

#### Vic High and the school routes
- The SD61 agreement (M13d): joint-use of the fields and gyms, safe routes to school as a program.

#### Also lands here
- **Graffiti replaced with commissioned public art** (M18). This is Fernwood's measure. The 48-hour clock (M14) targets vandalism; M18 funds the walls that make the neighbourhood look like itself, with the murals registered and protected rather than caught in the same net.
- **Extended hours at civic cultural spaces** (M50) and **outdoor spaces activated year-round** (M51), so the square works in November.
- **Somewhere for 18-to-25s** (M13c): youth-priority space, late-evening hours, post-secondary partnerships. Fernwood already is that place informally; this funds it.
- **Business-security cost-spreading** (M28b) for the small operators around the square, and **proper night lighting** (M37) with no cameras (M30).
- **Demoviction protection** (M9) for the renters in the old houses, who are most of Fernwood.
- **Parks kept to a standard** (M49), plus a **pet-friendly parks standard** (M25c).

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. Fernwood is renter-majority, and renters pay this invisibly through rent. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%. The Household Bill (M66d) publishes tax plus water, sewer, waste and stormwater as **one number with a five-year view**. And the arts funding floor (M50b) means none of that discipline gets paid for by cutting the cultural budget, which in this neighbourhood would be cutting the neighbourhood. Over-collection returns as a credit (M66b).
:::

## The first 18 months
1. Venue inventory published, first preservation designations made.
2. Licensing fast lane live for small venues and food businesses.
3. Graffiti clock running, mural registry established.
4. Safe-routes assessment around Vic High.

## How you'll measure it
Designated venues protected. New small-business licences and their processing times. Graffiti response times. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** the venue tool and the arts floor are already costed in the framework. Nothing here is a new grant program; it's protection and speed for what Fernwood already built.
:::

=== north-park
name: North Park
emoji: 🏊
tagline: The densest neighbourhood in the city, and its recreation heart: Crystal Pool, Royal Athletic Park, the arena.
card: Crystal Pool delivered under the full 5-step discipline, the Royal Athletic Park raid reversed, DPOT coverage through the corridor edges, and the cooling rule where the stock runs hottest.
assoc: North Park Neighbourhood Association
assocurl: https://npna.ca/
meta: What A City That Works does in North Park: Crystal Pool delivered under the 5-step discipline with quarterly public reports, Royal Athletic Park restoration, DPOT coverage, and the 26°C cooling rule.
---
## Where things stand (2026)
- Residents approved the Crystal Pool replacement by referendum in February 2025: **58.71% yes**, authorizing up to **$168.9M** in borrowing. The vote is done. The test now is delivery.
- Royal Athletic Park's planned upgrades were deferred in 2025 to fund other programs. The framework commits, explicitly, to reversing that raid.
- Disorder from the 900-block spills into North Park's streets, and residents here live with it more directly than almost anyone.
- The neighbourhood's older rental stock holds the hottest apartments in the city when a heat event comes.

:::voice
**Who speaks for North Park, and who doesn't.** The city-wide numbers here, including the 58.71% referendum result and the $168.9M borrowing authorization, are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [North Park Neighbourhood Association](https://npna.ca/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: opening year at the new pool ||Victoria 2030
The new Crystal Pool is open, and the remarkable part is how unremarkable getting here was: a public delivery dashboard from groundbreaking onward, a report every quarter, on time and on budget or an explanation in plain language of why not. That's what residents bought with their referendum vote, and it's what the 5-step rule owes every project after it.

Royal Athletic Park is hosting tournaments again, its restoration completed instead of deferred. Quadra at 9 PM feels like a street you'd walk, because the public order team's coverage doesn't stop at a line on a map, and bylaw presence runs to 10. And in August, your apartment has its cool room, by rule, not by luck.

## What the framework does here
#### Deliver what was voted
- Crystal Pool built under the full 5-step discipline (M78), quarterly public reports during construction. It's the living precedent for the $25M referendum rule (M77): this is how every big project gets decided and tracked from now on. And construction impacts on the surrounding blocks (noise, closures, parking, truck routing) are part of each quarterly report, because the neighbours carrying 3 years of construction are owed the same candour as the taxpayers funding it.
- **Royal Athletic Park restoration** (M52): reverse the 2025 reserve raid, complete the deferred upgrades. A named measure, not a gesture.

#### Safety where the pressure is
- DPOT coverage (M26) extending through the corridor edges into North Park, single daily briefing. Bylaw 6 AM to 10 PM (M27). Capacity-first enforcement (M35) with STEP throughput (M11), so enforcement has somewhere real to send people. Lighting, no cameras (M30).

#### North Park Village
- The village's businesses on Cook Street get the same toolkit as downtown: red-tape reduction (M72), the vacant storefront strategy (M71) with its quarterly transparency report, lower fees (M76), and first-hour free parking (M24). Small-business support in this framework does not stop at the downtown boundary.

#### Density done fairly
- The 26°C cooling rule (M64) matters most in exactly this housing stock. Lower development cost charges for rental buildings (M8), the per-home fees builders pay the City. Short-term rental tightening (M9b). Canopy planting (M61) where density needs shade most.

#### Also lands here
- **Civilian crisis response** (M26b) and **community paramedicine** (M28d): the right responder for the call, and fewer calls in the first place. Both are gated on a confirmed provincial or health-authority cost-share partner, and the framework says so rather than promising them outright. North Park is where they would be piloted.
- **Drug-use buffer zones around child-focused spaces** (M33b), posted and consistently enforced, and a **weekly public-safety dashboard** (M31) plus a **published enforcement record** (M31b) showing what was enforced and how much of it survived adjudication.
- **Business-security cost-spreading** (M28b) for the Cook Street operators, and **graffiti replaced with commissioned public art** (M18).
- **Somewhere for 18-to-25s** (M13c), and **outdoor spaces activated year-round** (M51) around the park and arena.
- **Parks kept to a standard** (M49), **proper night lighting** (M37), and **demoviction protection** (M9) for the older rental blocks.

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. North Park is the densest neighbourhood in the city and one of the most renter-heavy, so most people here pay it through rent. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%. The Household Bill (M66d) publishes tax plus every utility as **one number with a five-year view**. And the debt rule (M66c) matters here more than anywhere: the pool is $168.9M of borrowing this neighbourhood voted for, and the rule stops the next council quietly borrowing against it. Over-collection returns as a credit (M66b).
:::

## The first 18 months
1. Crystal Pool public delivery dashboard live from groundbreaking.
2. Royal Athletic Park restoration returned to the capital sequence.
3. DPOT operating with North Park inside its boundary.
4. Cooling rule adopted before the next heat season.

## How you'll measure it
Crystal Pool schedule and budget variance, published quarterly. RAP restoration milestones. Safety perception on the corridor edges. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** the pool is approved and funded by the 2025 assent vote; the framework adds delivery discipline, not re-announcement. Enforcement follows the capacity-first legal test, always.
:::

=== burnside-rock-bay
name: Burnside–Rock Bay
emoji: 🌱
tagline: The Gorge on one side, the city's industrial heart on the other, and the thinnest tree canopy in Victoria between them.
card: First in the city's tree-planting sequence, the pest management pilot, a published pipe-condition report, and an industrial transition with a plan residents can read.
assoc: Burnside Gorge Community Association
assocurl: https://burnsidegorge.ca/
meta: What A City That Works does in Burnside–Rock Bay: first in the tree-planting sequence, the pest management pilot, a published pipe-condition report, and employment lands protected through the transition.
---
## Where things stand (2026)
- The street-tree gap the framework identifies city-wide is concentrated here. Whole blocks have no canopy at all, and they're the same blocks that run hottest in a heat event.
- Pest management is a documented neighbourhood priority in a way it is nowhere else in the city.
- Some of Victoria's oldest pipes run under these streets.
- Industrial land is converting parcel by parcel with no plan residents or employers can actually read, which serves neither.
- Several of the region's supportive-housing conversions sit on Gorge Road. Whatever else is true about them, this neighbourhood lives beside the regional fair-share question every day, and few city documents have said so plainly.

:::voice
**A naming note, and who speaks here.** Burnside is the official City neighbourhood; Rock Bay is an area within it. The city-wide numbers on this page are sourced in the full program, and the canopy gap is drawn from the City's own data. The local observations are this framework's read, not a survey of residents. The [Burnside Gorge Community Association](https://burnsidegorge.ca/) speaks for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: Washington Avenue, late spring ||Victoria 2030
Young trees line Washington and Manchester now, five summers in, because when the city planted 5,000 trees it started where the canopy data said the need was worst: here. The Gorge's swimmable summers are something the neighbourhood takes for granted again, its shoreline protected and its outfalls fixed on a published schedule.

At Rock Bay, the first mixed-use blocks are open: workshops and marine trades at grade, homes above, and the employment land that stayed industrial stayed **on purpose**, in a plan everyone could read before a single rezoning, because this neighbourhood got one of the first Local Area Plans on the published schedule. The transition stopped being something that happened *to* Burnside and became something Burnside decided.

## What the framework does here
#### Trees first, here first
- 5,000 trees by 2030 toward 35% canopy by 2035 (M61), with Burnside–Rock Bay first in the planting sequence because the gap is documented, not because it's fashionable. Free seedlings for every yard that will take one.

#### The unglamorous essentials
- The pest management plan (M16), piloted in this neighbourhood. Extended sanitation hours (M17). Stormwater and pipe renewal on a maintenance-first basis (M59, M24), with the pipe-condition report published.
- Gorge shoreline and ecosystem protection (M63).

#### Gorge Road, said plainly
- The supportive housing on Gorge Road works only if it works twice: for the residents inside and the neighbours outside. STEP throughput (M11) moves people ready for market housing onward and frees units. Capacity-first enforcement (M35) applies on this corridor the same as it does downtown. And the downloading ledger (M70b) presses the region to carry its share instead of leaving it to one road in one neighbourhood.

#### A transition with a plan
- Protect employment lands (M71): no net loss of employment-designated land without a published replacement plan, and marine-industrial land as a distinct protected category. Jobs land is not a land bank for whoever asks first.
- Local Area Plans return at 2 per year on a published schedule, with parcel-level clarity a resident or small builder can read without a consultant. Burnside–Rock Bay's case to go first is the strongest in the city. (The added planning capacity, M80c, sits in the gated tier and proceeds on verified Year 1 savings; the framework says so.)
- For the parcels that do convert: published permit clocks (M7) and composition targets (M6), so conversion produces rental homes and workspaces, not just announcements.

#### Also lands here
- **The ocean economy named as Victoria's declared economic vertical** (M55b), anchored on the working harbour. Rock Bay's marine trades stop being leftover industry and become the thing the city says it is building on.
- **District energy, financed as a ring-fenced utility** (M58b): heat as infrastructure, on BC precedents only, feasibility study cost-shared first. Burnside–Rock Bay's mix of industrial heat and new density is the strongest candidate ground in the city.
- **Bus lanes and transit priority** (M23) on the corridors, and **proper night lighting** (M37) on streets that currently have very little.
- **Community paramedicine** (M28d), gated on a health-authority partner, aimed at reducing repeat calls rather than just responding faster.
- **Parks kept to a standard** (M49) and a **pet-friendly parks standard** (M25c), in the part of the city with the least green space per resident.
- **Demoviction protection** (M9) as conversion pressure grows.

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. Burnside has among the lowest household incomes in Victoria, which means the gap between a 7.28% headline and a 9.34% bill lands hardest here. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%. The Household Bill (M66d) publishes tax plus water, sewer, waste and stormwater as **one figure with a five-year view**, in language that doesn't need a finance degree. Over-collection returns as a credit on your next notice, not into a reserve (M66b).
:::

## The first 18 months
1. Tree planting starts here, first in the city.
2. Pest plan pilot running.
3. Pipe-condition report published.
4. The LAP schedule published, with this neighbourhood's slot named.

## How you'll measure it
Trees in the ground here versus the plan. Pest service requests and response times. Pipe kilometres renewed. Employment land: zero net loss, tracked. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** the LAP staffing line is gated on verified savings and labelled as such. The planting sequence, the pest pilot and the employment-lands rule are sequencing of measures already costed.
:::

=== jubilee
name: Jubilee
emoji: 🏥
tagline: North and South Jubilee together: the hospital district, the Fort Street corridor, and the streets where the people who staff Victoria's healthcare should be able to live.
card: The hospital district managed like one through the Island Health partnership file, the cooling rule for the older stock, and the Fort corridor's red-tape list.
assoc: North Jubilee Neighbourhood Association
assocurl: https://www.njna-victoria.net/
meta: What A City That Works does in Jubilee: a standing Island Health partnership file for hospital access and parking, the 26°C cooling rule, and red-tape reduction on the Fort Street corridor.
---
## Where things stand (2026)
- Royal Jubilee Hospital is the neighbourhood's anchor and, residents here will say, its biggest daily pressure. Shift-change traffic and parking on the surrounding residential streets is a long-standing local concern, and no standing mechanism exists across the property line to work on it. Both Jubilee associations are better placed than this document to say how bad it is and where.
- The older rental stock that houses students and hospital staff is exactly the building type the 2021 heat dome proved deadliest: **619 heat-related deaths in BC, 98% indoors** (*BC Coroners Service Death Review Panel*).
- Fort Street and Oak Bay Avenue edge businesses carry downtown-grade costs with a fraction of downtown's attention.
- The people who work at the hospital increasingly can't afford to live near it. That's not just a housing statistic; it's a staffing and traffic problem too.

:::voice
**Who speaks for Jubilee, and who doesn't.** The city-wide numbers here are sourced in the full program. The local observations are this framework's read, not a survey of residents. The [North Jubilee Neighbourhood Association](https://www.njna-victoria.net/) and the South Jubilee association speak for this neighbourhood; this page does not. Corrections welcome and published.
:::

## Victoria 2030: shift change, 6:50 AM ||Victoria 2030
The nurse two doors down walks to work in 9 minutes. The hospital's access and parking plan was finally worked out **with** the neighbourhood at a standing table with Island Health, instead of dropped on it, and the residential blocks got their streets back at shift change.

Her building has its cool room; the first summer the rule existed was the first summer nobody on her floor slept in the bathtub. On Fort, the framing shop's renovation permit ran 5 weeks on a public clock, and the first hour of parking out front is free, which is the difference between a quick stop and a drive past.

## What the framework does here
#### The hospital district, managed like one
- Island Health is one of the framework's 8 named partner files (see the [Partnership Strategy annex](partnerships.html)): shift-change traffic, parking spillover and access routing go on the standing agenda, with what the City brings already costed and the ask in writing. If the answer is no, the ledger says so publicly.
- Family-doctor recruitment through clinic space and permissive tax exemptions (M13b) lands most naturally where the health workforce already is.

#### Renters and the older stock
- The 26°C cooling rule during declared heat warnings (M64). Lower development cost charges for rental buildings (M8), the per-home fees builders pay the City. Short-term rental tightening (M9b), and the suite-legalization amnesty (M8b) for the neighbourhood's big old houses: rental homes at zero construction cost.

#### The Fort corridor businesses
- Red-tape reduction (M72), the vacant storefront strategy (M71), lower fees (M76), first-hour free parking (M24).

#### Streets
- The crossing-spacing standard and walking-speed signals (M20b) on Fort and Richmond, where hospital foot traffic meets arterial speed. 30 km/h residential (M39). Camera enforcement is provincial: advocacy (M40), labelled as such.
- Canopy planting and free seedlings (M61).

#### Also lands here
- **Somewhere for 18-to-25s** (M13c): youth-priority space, late-evening hours, post-secondary partnerships. Jubilee houses a large share of Victoria's students and young health workers, and the City currently offers them almost nothing after 6 PM.
- **Demoviction protection** (M9) for the older rental blocks around the hospital, which are exactly the buildings redevelopment targets first.
- **Community paramedicine** (M28d), gated on a health-authority partner. In the hospital's own neighbourhood, reducing avoidable calls is the most obvious pilot site in the city.
- **Climate Friendly Homes** (M60) with published uptake, and **proper night lighting** (M37) on the routes shift workers walk at 11 PM and 7 AM.
- **Parks kept to a standard** (M49), plus a **pet-friendly parks standard** (M25c).

:::money
**What it means for your household.** Council raised residential taxes **9.34% in 2026**, about **$323 on a median $1,015,000 home**, and called it 7.28%. Jubilee is a mix of long-time owners and the renters who staff the hospital, and both feel it. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%. The Household Bill (M66d) publishes tax plus water, sewer, waste and stormwater as **one number with a five-year view**. Over-collection returns as a credit on your next notice (M66b).
:::

## The first 18 months
1. Hospital-district access and parking file opened at the Island Health partnership table.
2. Cooling rule adopted before the next heat season.
3. Fort and Richmond crossing audit, worst first.
4. Fort corridor red-tape list built with the businesses.

## How you'll measure it
Crossing injuries near the hospital. Permit times on the corridor. Parking-spillover complaints. Cooling-rule compliance. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** the hospital is Island Health's to run. The framework's lane is streets, parking rules, clinic space and a partnership table with the asks in writing, and this page claims nothing more.
:::

=== harris-green
name: Harris Green
emoji: 🏢
official: no
tagline: The Yates corridor: the renter-densest blocks in Victoria, where the city's housing future is already under construction.
card: A renter's charter in effect — the cooling rule, composition targets, demoviction protection — plus trees and light on the street between the towers, and a ballot box that climbs.
assoc: Victoria Downtown Residents Association
assocurl: https://www.victoriadra.ca/
meta: What A City That Works does in Harris Green: the 26°C cooling rule, composition targets on the Yates corridor, demoviction protection, street trees and lighting, and multi-unit voting.
---
**Harris Green is not one of Victoria's 12 official neighbourhoods; it sits inside Downtown.** It gets its own page because the Yates corridor is the renter-densest ground in the city, and the housing measures land differently here than they do three blocks west. For association and Council liaison purposes, this is Downtown: the [Victoria Downtown Residents Association](https://www.victoriadra.ca/).

## Where things stand (2026)
- Almost everyone here rents, and almost no block has canopy. No neighbourhood tests the framework's renter measures harder.
- The cranes are up and thousands of homes are coming to Yates. Whether the street between the towers keeps pace, in trees, frontages and light, is the open question this page is about.
- The corridor sits directly between the 900-block's disorder and thousands of front doors.
- Heat events cook the old walk-ups and the new glass alike, and until now renters have had no rule to lean on.

## Victoria 2030: renting here on purpose ||Victoria 2030
Your building's cool room got you through August without a hotel night at your sister's. The big Yates blocks opened with real composition: rental that stays rental, a below-market share allocated through a published, points-based list anyone can audit, not a mystery queue.

At street level, the corridor finally got its trees, its benches and its light, and walking home at 11 PM is just walking home. And last election, you voted in your lobby, because the ballot box came to the buildings where most of the neighbourhood actually lives.

## What the framework does here
#### A renter's charter, in effect
- The 26°C cooling rule during heat warnings (M64). Lower development cost charges for rental buildings (M8), the per-home fees builders pay the City, cut so rental is cheaper to build. Short-term rental tightening (M9b) so homes built as rental stay in the pool.
- Composition targets (M6): 30% rental and 15% non-market is the entire point on exactly these blocks. Transparent, points-based, publicly auditable allocation for City-influenced waitlists (M10).
- The Household Bill (M66d): renters carry these costs through their rent, and they get to see the number too.

#### The street between the towers
- Tree planting (M61) sequenced to where canopy is thinnest, and this corridor qualifies on the data. Smart LED lighting, no cameras, no audio, no behavioural AI (M30). 48-hour graffiti removal (M14).
- DPOT coverage (M26) on the corridor edge, bylaw presence to 10 PM (M27), capacity-first enforcement (M35) with STEP throughput (M11) behind it.

#### Democracy that reaches towers
- Multi-unit and campus voting, plus voting places weighted toward the lowest-turnout neighbourhoods (M82b). If most of a neighbourhood lives above the third floor, the ballot has to climb. Election bylaws set 12 months out, so no council writes the rules of its own re-election.

#### Also lands here
- **Demoviction protection** (M9). On a corridor being rebuilt block by block, the people already living here are the ones most at risk of paying for the new supply with their tenancy. This is the single most relevant measure in the framework to Harris Green.
- **Advocacy for vacancy control between tenancies** (M9c), marked honestly: rent rules belong to the Province. The City argues for them and does not pretend it can set them.
- **District energy, financed as a ring-fenced utility** (M58b). Tower density is the condition district energy exists for, and this corridor has more of it than anywhere in Victoria.
- **Somewhere for 18-to-25s** (M13c), and **public washrooms treated as transportation infrastructure** (M24b), which matters most where thousands of people live without a backyard.
- **Outdoor spaces activated year-round** (M51) and **graffiti replaced with commissioned public art** (M18) on the blank walls the towers create at street level.
- **Government Street's seasonal pedestrianization** (M45b) and **Victoria's own street furniture** (M44) reaching up the corridor, not stopping at the Downtown line.

:::money
**What it means for your household.** You almost certainly rent, so you never see a tax notice, and you pay it anyway inside your rent. Council raised residential taxes **9.34% in 2026**, about **$323 on a median home**, while calling it 7.28%. The glide path (M66) caps the **residential** rate at 6.5%, then 5%, then roughly 3.5%, which is the number that actually flows into rents. The Household Bill (M66d) publishes tax plus water, sewer, waste and stormwater as **one figure with a five-year forward view** that a renter can read as easily as an owner. That transparency is the point: the costs behind your rent have never been published in one place. Over-collection returns as a credit (M66b).
:::

## The first 18 months
1. Cooling rule adopted before the next heat season.
2. Tree and lighting sequence on the barest blocks, first in the downtown-adjacent plan.
3. DPOT boundary includes the corridor edge from day one.
4. Multi-unit voting written into the election bylaws, set 12 months ahead of the next vote.

## How you'll measure it
Rental and non-market completions on the corridor. Night-time safety perception. Trees in the ground. Turnout by neighbourhood, published within 90 days of the vote. Quarterly (M67), annually (M82).

:::straight
**Straight goods:** the towers already permitted are private projects in motion, and this framework doesn't claim them. Its lane is composition, speed, renter rules, and the public realm between the buildings.
:::

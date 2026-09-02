/* Campaign-sourced bodies for the six 1 Sep names whose hub cards (and
   Notion) are still stubs. Only fields stated on the campaign URL. If a
   field is not on the source, it is dashed. Do not invent biography.
   Harris is the quality bar: bio, socials with full URLs, residence,
   electoral history, sources with date. */
"use strict";

function p(cls, label, html) {
  return '<p class="pf ' + (cls || "") + '"><strong class="pfl">' + label + "</strong> " + html + "</p>";
}

function a(href, label) {
  return '<a href="' + href + '" target="_blank" rel="noopener">' + label + "</a>";
}

const SRC = "Opened / logged 1 Sep 2026.";

const BODIES = {
  harris: [
    p("", "Bio.",
      "Mike Harris has spent more than 30 years working in real estate, housing, construction and business — building teams, mentoring people and helping families find a place to call home. The campaign site describes him as a businessman, former journeyman carpenter, award-winning real estate professional, husband, father and grandfather. He is running because he believes deeply in Victoria and because residents deserve a City Hall that listens, focuses on the basics and answers for the results. Slogan on the site: “A Fresh Start for Victoria.” Quote on the site: “I’m not asking you simply to vote for change. I’m asking you to help build it.”"),
    p("", "Web &amp; socials.",
      a("https://www.mike4victoria.ca/", "mike4victoria.ca") +
      " · Facebook " + a("https://www.facebook.com/mike4victoria2026", "facebook.com/mike4victoria2026") +
      " · Instagram " + a("https://www.instagram.com/bcmikeharris/", "instagram.com/bcmikeharris") +
      " · X " + a("https://x.com/BCMikeHarris", "x.com/BCMikeHarris") +
      " · LinkedIn " + a("https://www.linkedin.com/in/mike-harris-00262927/", "linkedin.com/in/mike-harris-00262927") +
      ". Email printed on the site: mike4victoria@gmail.com."),
    p("tone-none", "Residence.",
      "— Not stated on mike4victoria.ca."),
    p("tone-none", "Electoral history.",
      "— Not stated on mike4victoria.ca."),
    p("", "Sources.",
      a("https://www.mike4victoria.ca/", "mike4victoria.ca") +
      ", " + SRC + " Site footer: authorized by financial agent Dianne Lyngard, 250-999-7612. The site prints the vote date as 17 Oct 2026. No other campaign, outlet, or residence source is used on this page."),
    p("", "2026 on the record.",
      "Six priorities on the campaign site: (1) Safe streets / strong communities — public safety and clean, accessible public spaces, “combining compassion, coordination and accountability.” (2) Respect for taxpayers — review spending, reduce duplication, and require City Hall to show what residents receive for every tax dollar. (3) Housing that works — set measurable permit targets, reduce avoidable delays, and “judge policy by homes built and real affordability.” (4) Bring back the best of downtown — a measurable plan for a downtown that is clean, safe, welcoming, accessible and alive. (5) A fresh start at City Hall — launch an independent organizational and value-for-money review and make the findings public. (6) 12 neighbourhoods, one Victoria — listen first; publish a public “What Victoria Told Mike” report. Before City Hall spends, the site lists a six-question test: is it a municipal responsibility; what will it really cost; what problem are we trying to solve; how will we measure success; is there a simpler or less expensive way; have we listened to the people affected. After the money is spent: “Did it work?” Scorecard line already recorded: “judge policy by homes built / More homes” (" +
      a("https://www.mike4victoria.ca/", "mike4victoria.ca") + ", 1 Sep 2026)."),
    p("tone-none", "Still.",
      "Decision 14 overall letter —. Still-unscored. A dash is unknown, not a fail."),
  ].join(""),

  mcguigan: [
    p("", "Bio.",
      "Bruce McGuigan writes that he has spent much of his working life helping organizations solve difficult problems and making systems work better for the people who depend on them. Residents, he says, have a right to expect the same from City Hall. The About section: career in education, community development, public service, and social innovation; sociologist; university professor; led and built non-profit organizations; helped launch social-innovation initiatives. He writes that he is experienced at bringing people together across sectors, building organizations from the ground up, and turning ideas into practical solutions. He also writes that he has spent decades engaged in political and civic life, and that he is “proud of 25 years of work at local non-profit community service agencies.” Guiding principles printed on the site: Listen Carefully; Manage Competently; Use Public Resources Responsibly."),
    p("tone-none", "Web &amp; socials.",
      a("https://bruceformayor.ca/", "bruceformayor.ca") +
      ". No Facebook, Instagram, X, or LinkedIn hrefs are present on the campaign homepage. Email printed on the site: campaign@bruceformayor.ca."),
    p("", "Residence.",
      "The campaign site states: “I live and work on the homelands of the lək̓ʷəŋən peoples — known today as the Songhees and Esquimalt Nations.” No neighbourhood or street address is stated."),
    p("tone-none", "Electoral history.",
      "— Not stated on bruceformayor.ca."),
    p("", "Sources.",
      a("https://bruceformayor.ca/", "bruceformayor.ca") +
      ", " + SRC + " Site footer: authorized by DK McGuigan, financial agent — agent@bruceformayor.ca. No other campaign or outlet source is used on this page."),
    p("", "2026 on the record.",
      "Priorities printed on the campaign site include: ending homelessness (rare, brief, and non-recurring; “no discharge into homelessness from hospitals, corrections, detox, treatment or other public systems”); supporting local business and a Buy Local campaign; a citizens-first City Hall (open decision-making, understandable budgets, consultation early enough to influence decisions); fair governance and public accounting of spending; listening to people who do the work (pro-union; living wages; apprenticeships); “Housing Everyone” — “Victoria needs much more housing” and “get more housing built,” including market and non-market, supportive and complex-care, family-sized rentals, and “City hall cannot continue to approve the demolition of rental housing for the construction of condos that are unaffordable for citizens”; safe streets for everyone — “appropriate policing and enforcement alongside prevention… late-night safety, civilian and health responses where appropriate”; climate preparedness and resilience; community wealth and a strong local economy; creativity, arts and innovation. Scorecard line already recorded: “much more housing / get more housing built”; “civilian and health responses / late-night safety / appropriate policing” (" +
      a("https://bruceformayor.ca/", "bruceformayor.ca") + ", 1 Sep 2026)."),
    p("tone-none", "Still.",
      "Decision 14 overall letter —. Still-unscored. A dash is unknown, not a fail."),
  ].join(""),

  dion: [
    p("", "Bio.",
      "Shona Dion is running for council because she believes neighbourhoods deserve real agency on housing security and affordability, climate resilience, and community safety. The homepage describes her as a member of the North Jubilee Neighbourhood Association and a Victoria Labour Council table officer; a benefit-plan trustee, job steward, and executive councillor; a working mother; and a photographer who donates time to community groups working on social justice, inclusion, and environmental causes. Quote on the homepage: “Community members are the experts in their neighbourhoods. If I can share skills-based creative expressions, it is one avenue to come together in joy and advocacy.” The My Story page (" +
      a("https://www.shonadion4victoria.ca/my_story", "shonadion4victoria.ca/my_story") +
      "): she/her; labour activist and community builder; raised in a trade-union home; 28-year union member; mother and spouse of 25 years; moved to Victoria from Vancouver with her family in 2013."),
    p("", "Web &amp; socials.",
      a("https://www.shonadion4victoria.ca/", "shonadion4victoria.ca") +
      " · Facebook " + a("https://www.facebook.com/shonadion4victoria/", "facebook.com/shonadion4victoria") +
      ". The homepage says “Visit our Instagram profile” but does not publish a full Instagram URL — IG URL —."),
    p("", "Residence.",
      "My Story: “I live on the unceded and traditional territories of the Lək̓ʷəŋən (Lekwungen) speaking peoples, known as the Songhees and Xwsepsum (Kosapsum) First Nations.” She writes that she moved to Victoria from Vancouver with her family in 2013. The homepage names her as a member of the North Jubilee Neighbourhood Association. No street address is stated."),
    p("tone-none", "Electoral history.",
      "— Not stated on shonadion4victoria.ca or /my_story."),
    p("", "Sources.",
      a("https://www.shonadion4victoria.ca/", "shonadion4victoria.ca") +
      " and " + a("https://www.shonadion4victoria.ca/my_story", "shonadion4victoria.ca/my_story") +
      ", " + SRC + " Homepage footer: authorized by official financial agent Barbara Riggs, 250-727-1365. No other campaign or outlet source is used on this page."),
    p("", "2026 on the record.",
      "Homepage framing: restore agency to neighbourhoods on housing security and affordability, climate resilience, and community safety; uplift people already doing the work; governance and grassroots experience (fiduciary responsibility, budgets, negotiation); bridge between community and labour."),
    p("tone-none", "Still.",
      "Decision 14 overall letter —. Still-unscored. A dash is unknown, not a fail."),
  ].join(""),

  garcia: [
    p("", "Bio.",
      "Jerry Garcia writes that he is running for Victoria City Council and the Capital Regional District. The campaign site describes more than 40 years of experience as an engineer, executive, entrepreneur, project manager, educator and community volunteer. He describes himself as an independent candidate whose decisions will be based on evidence, community needs, and outcomes, “not partisan politics.” Tag line on the site: Engineer | Executive | Entrepreneur | Project manager | Volunteer | Educator. Theme printed on the site: “Delivering Results That Matter.”"),
    p("", "Web &amp; socials.",
      a("https://jerryforvictoria.ca/", "jerryforvictoria.ca") +
      " · Facebook " + a("https://www.facebook.com/jerryforvictoria", "facebook.com/jerryforvictoria") +
      " · Instagram " + a("https://www.instagram.com/jerryforvictoria", "instagram.com/jerryforvictoria") +
      "."),
    p("tone-none", "Residence.",
      "— Not stated on jerryforvictoria.ca. Neighbourhood names appear only as a volunteer/donate form dropdown."),
    p("tone-none", "Electoral history.",
      "— Not stated on jerryforvictoria.ca."),
    p("", "Sources.",
      a("https://jerryforvictoria.ca/", "jerryforvictoria.ca") +
      ", " + SRC + " Campaign articles already cited on the hub card: " +
      a("https://jerryforvictoria.ca/articles/victoria-cant-tax-its-way-to-prosperity/", "tax-restraint note, 22 Jul 2026") +
      "; " +
      a("https://jerryforvictoria.ca/articles/victoria-can-build-a-safer-community-by-learning-from-another-community-crime-watch/", "community safety patrol, 17 Aug 2026") +
      "; supply/completions (" + a("https://jerryforvictoria.ca/", "jerryforvictoria.ca") +
      ", 14 Aug 2026). Homepage articles also listed on the site the same day include “Bike Lanes Should Make Victoria Work Better, Not Create New Bottlenecks,” “Affordability in Victoria,” and “Victoria Needs a Right-to-Cool Policy But It Must Be Practical.”"),
    p("", "2026 on the record.",
      "Five outcomes on the campaign site: (1) Grow the Economy — cut permitting times by at least 50%; attract investment; revitalize downtown. (2) Restore Safe, Welcoming Public Spaces — visible foot patrols and community safety teams; enforcement on repeat offenders and organized crime. (3) End Chronic Homelessness Through Housing, Treatment, and Recovery — “the target is to reduce homelessness by 85%.” (4) Build Complete, Livable Neighbourhoods — attainable housing, transportation, parks, community health centres. (5) Deliver Better, Faster, More Transparent Government — public performance dashboards; evidence-based budgeting; faster approvals. Scorecard line already recorded: tax-restraint note (22 Jul 2026); community safety patrol (17 Aug 2026); supply/completions (14 Aug 2026)."),
    p("tone-none", "Still.",
      "Decision 14 overall letter C · 10 scored answers on the live scorecard. Still-unscored cells remain a dash: unknown, not a fail. No July alignment buckets are current grades."),
  ].join(""),

  girard: [
    p("", "Bio.",
      "Martin Girard’s campaign site opens with the slogan “Let’s solve our problems instead of sweeping them away!” He writes that he has spent years advocating for the marginalized and disenfranchised of the city, facing off against the current council as an advocate, and that he champions human rights. He writes that he is running for the two-thirds of eligible voters who stay home on election day, and for strategic voters. Quote on the site: “I myself have never cast a vote in an election, precisely for this reason. I’m done making excuses; if none of the candidates meet my criteria, then it’s up to me to assume the role.” Same page: “I used to be unhoused for five years, three of which I spent volunteering on the front lines. I’ve taken charge in emergencies and reversed drug overdoses with naloxone. Even now I still live in a supportive housing complex.” He also writes that he relocated from Quebec to this island."),
    p("", "Web &amp; socials.",
      a("https://martingirardforvictoriacouncil.ca/", "martingirardforvictoriacouncil.ca") +
      " · Facebook " + a("https://www.facebook.com/martingirardforvictoria", "facebook.com/martingirardforvictoria") +
      " · Instagram " + a("https://www.instagram.com/martingirardforvictoria/", "instagram.com/martingirardforvictoria") +
      ". Email printed on the site: martin.girard@martingirardforvictoriacouncil.ca."),
    p("", "Residence.",
      "The campaign site states: “Even now I still live in a supportive housing complex.” No neighbourhood name is stated."),
    p("", "Electoral history.",
      "The campaign site states he has never cast a vote in an election. No prior candidacy is stated."),
    p("", "Sources.",
      a("https://martingirardforvictoriacouncil.ca/", "martingirardforvictoriacouncil.ca") +
      ", " + SRC + " Site footer: authorized by Martin Girard, own financial agent. Media-coverage list printed on the same site (titles as the site lists them, not quoted as new interviews): <em>Capital Daily</em> “Tenants from Village on the Green rally for housing security”; <em>Times Colonist</em> “Protest encampment near Victoria City Hall dismantled after bylaw visit”; <em>Victoria News</em> “‘People are going to die’: Victoria group protests encampment crackdown”; <em>Radio-Canada</em> “Entrevue avec Martin Girard : Victoria limite les abris dans les parcs”; <em>CTV</em> “Victoria’s plan to better enforce daytime sheltering rule will fail, advocates say.”"),
    p("", "2026 on the record.",
      "Scorecard line already recorded: “stop-the-sweeps / park sheltering” (" +
      a("https://martingirardforvictoriacouncil.ca/", "martingirardforvictoriacouncil.ca") +
      "). The site frames the campaign around human rights, opposing park-sheltering restrictions and sweeps, and running as an advocate for people who do not vote."),
    p("tone-none", "Still.",
      "Decision 14 overall letter D · 7 scored answers on the live scorecard. Still-unscored cells remain a dash: unknown, not a fail. No July alignment buckets are current grades."),
  ].join(""),

  gibbs: [
    p("", "Bio.",
      "No personal campaign site. On " +
      a("https://www.victoriaforall.ca/about", "victoriaforall.ca/about") +
      " he is listed as Peter Rose Gibbs, “For City Council,” with the line “Parent. Lifelong Victorian. Two decades pushing governments to do better.” Victoria For All describes itself as “a working class, democratic, socialist, electoral and community organization.” The about page says the slate has endorsed two city-council candidates (Susan Kim and Peter Rose Gibbs) and one SD61 school-board candidate (not a live-door council page)."),
    p("", "Web &amp; socials.",
      "Slate accounts on the about page, not a personal campaign handle: Facebook " +
      a("https://www.facebook.com/victoriaforall.ca", "facebook.com/victoriaforall.ca") +
      " · Instagram " + a("https://www.instagram.com/victoriaforall.ca", "instagram.com/victoriaforall.ca") +
      " · TikTok " + a("https://www.tiktok.com/@victoriaforall.ca", "tiktok.com/@victoriaforall.ca") +
      " · Threads " + a("https://www.threads.net/@victoriaforall.ca", "threads.net/@victoriaforall.ca") +
      " · Bluesky " + a("https://bsky.app/profile/victoriaforall.ca", "bsky.app/profile/victoriaforall.ca") +
      "."),
    p("", "Residence.",
      "The about page says “Lifelong Victorian.” No neighbourhood or street address is stated."),
    p("tone-none", "Electoral history.",
      "— Not stated on victoriaforall.ca/about."),
    p("", "Sources.",
      a("https://www.victoriaforall.ca/about", "victoriaforall.ca/about") +
      " only, " + SRC + " Authorized by Andrea Clark, financial agent, info@victoriaforall.ca. No personal campaign URL is used because none is published there."),
    p("tone-none", "Still.",
      "Decision 14 overall letter —. Still-unscored. A dash is unknown, not a fail. The about page is a slate stub, not a platform."),
  ].join(""),
};

module.exports = BODIES;

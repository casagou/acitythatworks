#!/usr/bin/env node
/* A City That Works — the candidate questionnaire, and the page that carries it
   -----------------------------------------------------------------------------
   This file is the master. The 46 questions live here once, in the same words
   as the PDF that was emailed to every candidate
   (ACTW-Candidate-Questionnaire-2026.pdf, in the repo root), and this script
   writes them into questionnaire.html between the markers:

     <!-- Q:NAV:START -->  … the block index, with its counts …  <!-- Q:NAV:END -->
     <!-- Q:BODY:START --> … every block, every question …       <!-- Q:BODY:END -->

   Everything outside those markers — head, header, hero, the details block,
   the send panel, the footer — is hand-maintained. Do not edit the questions
   in the page; the next run overwrites them.

     node build/questionnaire.js

   Why generated rather than typed: 46 questions come to roughly 250 form
   fields, and a hand-typed form is where a question quietly loses an option
   or two candidates get the same input name and overwrite each other. The
   generator names every field from the question id, so that cannot happen.

   Why static HTML rather than client-side rendering: the same reason
   prerender.js exists. The questions are published so voters and journalists
   can read exactly what every candidate was asked, and that has to be true
   for anything that does not run JavaScript. questionnaire.js only adds the
   behaviour on top — autosave, the progress meter, the two budget totals and
   the three ways to send it back.

   The PDF is the same questionnaire. If a question changes here, the PDF has
   to be re-exported to match, or the two disagree in public. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* The five columns every "mark one box on each line" question uses. */
const SCALE = ['Will do', 'Agree', 'Considering', 'Oppose', 'No answer'];

/* The standard free-text escape hatch, spelled the same way everywhere. */
const ELSE = 'Something else. Tell us in a sentence.';

/* ═══════════════════════════════════════════════════════════════════════
   THE QUESTIONNAIRE.  Blocks A–N, VIC-01 to VIC-46.
   ═══════════════════════════════════════════════════════════════════════ */
const BLOCKS = [
{
  letter: 'A',
  title: 'Getting housing built',
  qs: [
  {
    id: 'VIC-01',
    title: "The Province's housing target",
    note: "The Province has told Victoria to build 4,902 homes over five years. That's about three quarters of what the Province thinks the city actually needs.",
    src: 'Housing Supply Act target order, Province of BC',
    parts: [
      { tag: 'A', ask: 'Over your four years, how many homes would you want the City to approve?',
        type: 'single',
        options: ['More than the target', 'About the target', 'Fewer than the target', 'No answer'] },
      { tag: 'B', ask: "What's the main thing you'd do to get there? Pick one.",
        type: 'single', other: true,
        options: [
          "Pre-zone land to the heights and uses already in the Official Community Plan, so projects that follow it don't need a rezoning",
          'Publish a set of pre-approved building designs anyone can build from',
          'Cut or waive development cost charges and fees for certain kinds of housing',
          'Buy or set aside City land for non-profit and co-op housing',
          'Get permit decisions out faster',
          'Require developers to include affordable units (inclusionary zoning)',
          "I have a target but I haven't picked how yet"
        ] }
    ]
  },
  {
    id: 'VIC-02',
    title: 'How to get housing built',
    parts: [
      { type: 'grid', rows: [
        'Set up a City land bank, and sell or lease City land to non-profit and co-op builders below market price',
        'Publish how long permit decisions should take, and report every three months on whether the City is hitting it',
        'Publish pre-approved building designs that skip individual design review',
        'Set a target rental vacancy rate, and manage supply against it',
        'Give owners a simple, penalty-free way to legalise suites that were built without a permit',
        'Cut or waive development cost charges for below-market and family-sized homes'
      ] }
    ]
  },
  {
    id: 'VIC-03',
    title: 'How fast permits should be',
    note: "The City controls how long its own permit decisions take. If you'd publish a target, what would it be?",
    parts: [
      { tag: 'A', ask: 'A small housing project, under six units', type: 'single',
        options: ['Under 6 weeks', '6 weeks to 3 months', '3 to 6 months', 'Over 6 months', "I wouldn't publish a target", 'No answer'] },
      { tag: 'B', ask: 'A bigger project, over six units', type: 'single',
        options: ['Under 6 months', '6 to 12 months', 'Over 12 months', "I wouldn't publish a target", 'No answer'] }
    ]
  },
  {
    id: 'VIC-04',
    title: 'Staff say yes, the neighbours say no',
    note: 'City staff have looked at a housing project and recommend approving it. It needs a rezoning only because the zoning was never updated. A lot of neighbours are against it. How do you usually vote?',
    parts: [
      { type: 'single', options: [
        'Approve it, as long as staff have taken the objections into account',
        'Approve it only if the developer adds affordable units or another community benefit',
        'Case by case, and neighbourhood opposition weighs heavily',
        'Usually vote it down when opposition is strong',
        'No answer'
      ] }
    ]
  }
  ]
},
{
  letter: 'B',
  title: 'Order downtown',
  qs: [
  {
    id: 'VIC-05',
    title: 'The state of downtown',
    parts: [
      { tag: 'A', ask: 'Is downtown in an acceptable state right now?', type: 'single',
        options: [
          'Broadly, yes',
          "No, and I'd change how the City handles it",
          'No, but the tools to fix it belong to the Province, not the City',
          'No answer'
        ] },
      { tag: 'B', ask: "What's the main thing you'd do? Pick one.", type: 'single', other: true,
        options: [
          'Have bylaw officers on the street through the day and evening, not just office hours',
          'Put bylaw officers and outreach workers on the same shift, as one team',
          "Set up a civilian crisis team for mental health calls that don't need police",
          'More police officers on foot patrol downtown',
          'Send enforcement to the exact blocks and hours the complaint data points to',
          'Nothing. The current approach is right.'
        ] }
    ]
  },
  {
    id: 'VIC-06',
    title: 'Enforcement and response',
    parts: [
      { type: 'grid', rows: [
        'Put bylaw officers and outreach workers on the same shift, as one team',
        "Set up a civilian crisis team for calls that don't need a police officer",
        'Keep bylaw officers on the street from roughly 6 a.m. to 10 p.m.',
        'Publish a map of the blocks and hours with the most complaints, and send enforcement there',
        'Publish every three months what enforcement did, and what came of it'
      ] }
    ]
  },
  {
    id: 'VIC-07',
    title: 'Camping in parks, and what the courts allow',
    note: "Two court decisions, Adams in 2009 and Bamberger in 2022, say a city can't stop people sheltering in parks unless there is somewhere safe and available for them to go. The 2025 count found 1,749 people homeless in Greater Victoria, 318 of them sleeping outside. Three quarters said they had a reason to avoid shelters, most often that they didn't feel safe there.",
    src: 'CRD / Community Social Planning Council 2025 Point-in-Time Count, released September 2025',
    foot: 'We don’t mark “not sure” down. This is a question about the law, and we’d rather know than guess.',
    parts: [
      { ask: "How would you apply the City's sheltering rules?", type: 'single', other: true,
        options: [
          "Only move people when there's an actual space open for each person",
          'Move people on a set schedule and refer them to services, whether or not a space is open',
          "Don't enforce the sheltering rules at all during your term",
          'Push for a change in provincial law, or another court ruling, before deciding',
          "Not sure. I'd want to understand the legal position better."
        ] }
    ]
  },
  {
    id: 'VIC-08',
    title: 'Parks and public space',
    parts: [
      { type: 'grid', rows: [
        'Mark out and sign drug-free zones around schools, playgrounds and daycares',
        'Publish a schedule for cleaning up and reopening a park after an encampment is cleared',
        "Name the public spaces you'd return to general public use in your first year",
        'Put better lighting on the streets with the most reported incidents'
      ] }
    ]
  }
  ]
},
{
  letter: 'C',
  title: 'Pandora Avenue',
  qs: [
  {
    id: 'VIC-09',
    title: 'What Pandora should be in four years',
    note: "Since 2023 the City has spent roughly $11 million on repairs and added bylaw presence in and around the 900-block of Pandora, on top of about $12 million a year on its homelessness response. Victoria holds about 89% of the region's shelter spaces and 83% of its supportive housing. BC Housing's Bridge Street Pathways opened in January 2026 with 34 spaces, prioritised for people on Pandora. The block still carries daily sheltering, open drug use, and the businesses and services that were there before.",
    src: 'City of Victoria; BC Housing; Globe and Mail',
    parts: [
      { tag: 'A', ask: 'Four years from now, what should the 900-block of Pandora be?', type: 'single', other: true,
        options: [
          'An ordinary commercial street. Services relocated or spread across the region, sheltering ended.',
          'A street where the services stay, but sheltering and open drug use do not.',
          'Broadly as it is today, with more cleaning, more outreach and better maintenance.',
          'A redesigned public space built around the services that are there, with the street itself rebuilt.',
          'No answer'
        ] },
      { tag: 'B', ask: "Whatever you picked, what would you actually do in your first year? Mark everything you'd vote for.",
        type: 'multi',
        options: [
          'Fund moving or expanding services off Pandora, to named locations',
          'Fund enough shelter or supportive housing spaces to cover everyone currently sheltering on that block',
          'Direct staff to enforce the sheltering and obstruction bylaws on that block, once those spaces exist',
          'Direct staff to enforce those bylaws whether or not those spaces exist',
          'Pay to rebuild the street itself: paving, lighting, storefronts, public space',
          'Bring a motion to council with a named date for a change on Pandora',
          'Ask the Province and BC Housing to act, without committing City money',
          'Nothing specific in year one',
          'No answer'
        ] }
    ]
  },
  {
    id: 'VIC-10',
    title: "One thing you'd take the heat for",
    note: 'Every workable answer on Pandora costs somebody something, and somebody will be angry about it.',
    parts: [
      { tag: 'A', ask: 'Name one thing you would do about Pandora that you expect to be criticised for, and say who would be doing the criticising.', type: 'text' },
      { tag: 'B', ask: "Give one dated commitment on Pandora: what you'd do, and by when.", type: 'text' },
      { tag: 'C', ask: "If you've served on council since 2022 — name one vote you cast that changed conditions on Pandora, and one you'd cast differently now.",
        hint: "Skip this if you haven't served on council.", type: 'text' }
    ]
  }
  ]
},
{
  letter: 'D',
  title: 'What people pay the City',
  qs: [
  {
    id: 'VIC-11',
    title: 'Property tax over four years',
    note: "Victoria's 2026 operating budget is $394,060,040. Council raised taxes 7.28% overall this year, and 9.34% on homes.",
    src: 'City of Victoria 2026 Financial Plan',
    parts: [
      { tag: 'A', ask: "Over four years, what's the most you'd let residential property tax go up, on average per year?", type: 'single',
        options: ['0 to 2%', 'Over 2%, up to 3%', 'Over 3%, up to 4%', 'Over 4%, up to 5%', 'Over 5%',
                  "I wouldn't set a cap. I'd decide each year on the merits.", 'No answer'] },
      { tag: 'B', ask: "If you'd keep increases below where they've been, how? Pick one.", type: 'single', other: true,
        options: [
          'Review every City programme line by line, a few departments a year',
          'Put a service the City now does itself out to tender',
          'Shrink management by not refilling jobs when people retire or leave',
          'Grow the tax base by getting more housing and commercial space built',
          'Raise fees and charges',
          'Cut back services',
          "I have a number in mind but I haven't picked how"
        ] }
    ]
  },
  {
    id: 'VIC-12',
    title: 'What people actually pay',
    note: 'People pay the City through property tax, water, sewer, stormwater, garbage and a pile of fees. Council sets each one separately, and nobody publishes the total.',
    parts: [
      { type: 'grid', rows: [
        'Publish one number each year: what a typical household pays the City in total, and how much that changed',
        'Give money back to residents when the City collects more property tax than it needed',
        'Write down a rule limiting how much new debt the City takes on each term',
        "Keep a public running list of costs the Province or the CRD has pushed onto the City's budget",
        "Vote no on CRD budget increases unless the CRD first publishes what's driving the cost and what the alternative was"
      ] }
    ]
  },
  {
    id: 'VIC-13',
    title: 'Business and downtown',
    parts: [
      { type: 'grid', rows: [
        'Publish how long a business licence decision should take, and report against it',
        'Run a review that deletes or merges bylaws and permits, instead of creating a new office to manage them',
        'Give businesses and event organisers one named person at the City to deal with',
        'Cut or restructure business licence and permit fees'
      ] }
    ]
  },
  {
    id: 'VIC-14',
    title: 'Big projects, parking and fees',
    parts: [
      { type: 'grid', rows: [
        'Set a dollar figure above which any project needs its own published business case before council votes',
        'Make the first 15 minutes of on-street parking downtown free',
        'Check permit and application fees against what the service actually costs to deliver'
      ] }
    ]
  },
  {
    id: 'VIC-15',
    title: 'Find $5 million',
    note: 'Council has to find $5 million a year in permanent savings. Police, fire and road repair are off the table. Split the whole $5 million across the lines below. Your numbers have to add up to $5 million.',
    parts: [
      { type: 'money', total: 5000000, lines: [
        'Management and office jobs, by not refilling them when people leave',
        'Contracting out a service the City now does itself',
        'Grants to community and cultural groups',
        'Parks, recreation and facility opening hours',
        'Consultants, communications and travel',
        'Selling or leasing City-owned property',
        'Putting off capital projects'
      ], extra: "I'd raise the money instead of cutting. Say how, and how much." }
    ]
  },
  {
    id: 'VIC-16',
    title: 'Spend $10 million',
    note: 'The City gets $10 million a year in new money and has to spend all of it. Split it across these areas. Your numbers have to add up to $10 million.',
    parts: [
      { type: 'money', total: 10000000, lines: [
        'Housing', 'Transit', 'Sidewalks and walking', 'Cycling', 'Roads', 'Policing',
        'Fire and emergency services', 'Parks and recreation', 'Arts and culture',
        'Climate and environment', 'Services for people who are homeless', 'Community clinics'
      ] }
    ]
  },
  {
    id: 'VIC-17',
    title: 'Roads, pipes and buildings that need fixing',
    note: "The City's 2024 asset review found about $570 million worth of roads, pipes and buildings in poor or very poor condition.",
    src: 'Figure as published in the Livable CRD 2026 questionnaire.',
    parts: [
      { ask: 'How would you deal with it? Pick up to two.', type: 'multi', max: 2,
        options: [
          'Allow a lot more housing and commercial development, to grow the tax base',
          'Raise property taxes, or add a separate levy for infrastructure',
          'Raise development cost charges, amenity contributions or other fees on new building',
          'Do less: put off projects, lower service levels, or replace things less often',
          'Go after more provincial or federal money',
          "Sell or redevelop City property the City doesn't need",
          'No answer'
        ] }
    ]
  }
  ]
},
{
  letter: 'E',
  title: 'Working with the Nations',
  qs: [
  {
    id: 'VIC-18',
    title: 'How the City works with the Nations',
    parts: [
      { ask: 'How should the City work with the Songhees and Esquimalt Nations over the next four years?',
        type: 'single', other: true,
        options: [
          'A written agreement between the City and each Nation, renewed every term',
          'A standing joint committee that publishes its meeting records',
          'Consult project by project, as the law requires',
          'No answer'
        ] }
    ]
  },
  {
    id: 'VIC-19',
    title: 'Specific commitments',
    parts: [
      { type: 'grid', rows: [
        'Set up a standing joint committee that publishes its agendas and minutes',
        'Give the Nations seats on City committees that decide land use',
        'Report publicly each year on what was agreed and what actually got done',
        'Fund staff whose job is this relationship, instead of handling it case by case',
        'Push for First Nations representation on regional transit governance'
      ] }
    ]
  }
  ]
},
{
  letter: 'F',
  title: 'Homelessness and waiting lists',
  qs: [
  {
    id: 'VIC-20',
    title: 'What counts as success',
    note: "The City reports what it spends, how many beds exist, and what programmes it has launched. It doesn't report how many people actually moved off the street into shelter, or out of shelter into permanent housing.",
    parts: [
      { tag: 'A', ask: "Should the number of people who actually got housed be the City's main measure of success on homelessness?",
        type: 'single',
        options: ["Will do. I'd make it the number the City reports.",
                  "Agree it's the right measure, but I'm not promising how",
                  'Considering', 'Oppose', 'No answer'] },
      { tag: 'B', ask: 'Who should publish it?', type: 'single',
        options: ["The City, using its own and its partners' numbers",
                  'The City together with BC Housing and Island Health',
                  'Push the Province to publish it',
                  "It shouldn't be published", 'No answer'] }
    ]
  },
  {
    id: 'VIC-21',
    title: 'Renters and waiting lists',
    parts: [
      { type: 'grid', rows: [
        'Publish every three months how many people moved from the street into shelter, and from shelter into housing, and how long each waiting list is',
        'Publish how the waiting list is ordered, and what puts one person ahead of another',
        'Make landlords redeveloping a rental building help tenants move, and offer them their unit back afterwards',
        'Tighten the short-term rental rules, and actually enforce them',
        'Set a minimum indoor temperature landlords have to keep rental units at'
      ] }
    ]
  }
  ]
},
{
  letter: 'G',
  title: 'Families',
  qs: [
  {
    id: 'VIC-22',
    title: 'Childcare, doctors and schools',
    parts: [
      { type: 'grid', rows: [
        'Offer City land or space to licensed childcare operators at below-market rent',
        'Put City money behind recruiting and keeping family doctors and nurse practitioners',
        'Set aside youth-only hours at City recreation centres',
        'Sign a standing agreement with School District 61 to share school grounds, gyms and fields outside school hours'
      ] }
    ]
  },
  {
    id: 'VIC-23',
    title: 'Homes big enough for families',
    note: 'Family-sized housing usually means three or more bedrooms, over 1,200 square feet.',
    parts: [
      { ask: 'How would you get more of it built?', type: 'single',
        options: [
          'Require a share of three-bedroom units in bigger buildings',
          'Cut fees on family-sized units specifically',
          'Pre-zone for the building types that produce them, like townhouses',
          "None. The City shouldn't be deciding what sizes get built.",
          'No answer'
        ] }
    ]
  },
  {
    id: 'VIC-24',
    title: "Doctors' clinics",
    parts: [
      { ask: 'What role should the City play in setting up new primary care clinics?', type: 'single',
        options: [
          'The City runs the clinic, and the doctors, nurses and staff are City employees (the Colwood model)',
          'The City helps indirectly with tax breaks, zoning or cheap rent, and a non-profit runs the clinic (the Langford, Sidney and Central Saanich model)',
          "No role. Health care is the Province's job.",
          'No answer'
        ] }
    ]
  }
  ]
},
{
  letter: 'H',
  title: 'Streets and getting around',
  qs: [
  {
    id: 'VIC-25',
    title: "When there isn't money for both",
    parts: [
      { tag: 'A', ask: "In a year when there isn't enough money for both, which comes first?", type: 'single',
        options: [
          'Repaving and fixing the roads and sidewalks we already have',
          'Building new bike lanes and walking routes',
          { t: 'Split it by a fixed ratio. Say what it is.', fill: 'e.g. 70 / 30' },
          'Decide project by project',
          'No answer'
        ] },
      { tag: 'B', ask: 'Would you publish a target for the condition of roads and sidewalks, and a score each year?',
        type: 'single', options: SCALE.slice() }
    ]
  },
  {
    id: 'VIC-26',
    title: 'Keeping the city clean',
    parts: [
      { type: 'grid', rows: [
        'Publish how fast the City will clear graffiti, litter and dumped garbage, and report every three months on whether it does',
        'Clean downtown streets and sidewalks more often',
        'Put more public garbage and recycling bins on the busiest streets',
        'Fund a programme to keep benches, planters and public spaces in good repair'
      ] }
    ]
  },
  {
    id: 'VIC-27',
    title: 'Traffic and street safety',
    parts: [
      { type: 'grid', rows: [
        'Time traffic signals to actual conditions, instead of running them on fixed cycles',
        'Commit to Vision Zero, and publish a count of serious injuries and deaths every year',
        'Build traffic calming from a published priority list, instead of wherever a petition arrives',
        'Finish the gaps in the bike and walking network we already have before starting new routes',
        'Use physical protection, not just paint, on bike lanes along busy streets',
        'Oppose removing or narrowing bike lanes that already exist'
      ] }
    ]
  },
  {
    id: 'VIC-28',
    title: 'Sidewalks, buses and access',
    parts: [
      { type: 'grid', rows: [
        'Build sidewalks from a published priority list, with a set amount in the budget every year',
        "Use the City's seat on the regional transit commission to push for specific service changes",
        'Check City sidewalks, crossings and buildings for accessibility, and fund the fix list',
        "Open more public washrooms, for longer, and publish where they are and when they're open"
      ] },
      { ask: 'If you marked the transit line, which service change?', type: 'text', rows: 2 }
    ]
  }
  ]
},
{
  letter: 'I',
  title: 'Policing and safety',
  qs: [
  {
    id: 'VIC-29',
    title: 'The police budget, and who decides it',
    note: 'For 2026 the Victoria and Esquimalt Police Board asked for 9.82% more, or $7,755,058, taking the core police budget to $86,753,970. Victoria pays 86.33% of that and Esquimalt pays 13.67%. In 2023 VicPD cost $598 per resident, among the highest in BC.',
    src: 'Police Board provisional 2026 budget; BC Ministry of Public Safety, 2023',
    foot: 'We don’t mark “not sure” down. Plenty of sitting councillors would have to look this one up.',
    parts: [
      { tag: 'A', ask: 'Over four years, would you vote for police budget increases that are', type: 'single',
        options: ["Smaller than the City's overall budget increase", 'About the same', 'Bigger', 'No answer'] },
      { tag: 'B', ask: 'What can council actually do about the police budget?', type: 'single',
        options: [
          'Council sets it',
          "Council can approve or refuse the amount the Police Board asks for. If council refuses, the Province's Director of Police Services decides.",
          'Nothing. The Province sets it.',
          'Not sure'
        ] }
    ]
  },
  {
    id: 'VIC-30',
    title: 'Who responds, and to what',
    parts: [
      { type: 'grid', rows: [
        'Split the cost of security with small businesses on the worst-hit blocks',
        'Send paramedics or health workers, not police, to repeat non-emergency calls',
        'Call and publish a review of how police services are shared across the region',
        'Put smart LED lighting on the streets with the most incidents'
      ] }
    ]
  },
  {
    id: 'VIC-31',
    title: 'What the City publishes about safety',
    parts: [
      { type: 'grid', rows: [
        'Publish a safety dashboard every three months, showing incidents by type and location',
        'Publish what enforcement did: actions taken, charges laid, what happened after',
        'Publish how long the City takes to answer a bylaw complaint',
        'Set and publish a target for cutting one named type of crime'
      ] },
      { ask: 'If you marked the target line, which type of crime?', type: 'text', rows: 2 }
    ]
  },
  {
    id: 'VIC-32',
    title: 'Cameras in public',
    note: "BC's privacy commissioner limits what cameras a city can run in public.",
    parts: [
      { ask: 'Should the City run or pay for cameras in public spaces?', type: 'single',
        options: [
          'Yes',
          'Only under a published policy the privacy commissioner has reviewed',
          'No City cameras. Instead, keep a voluntary list of businesses willing to share their own footage.',
          'No, in any form',
          'No answer'
        ] }
    ]
  }
  ]
},
{
  letter: 'J',
  title: 'How the city looks and feels',
  qs: [
  {
    id: 'VIC-33',
    title: 'Car-free streets and big projects',
    parts: [
      { tag: 'A', ask: 'Do you want more car-free or pedestrian-first streets downtown?', type: 'single',
        options: ["Yes, and I'd make them permanent", 'Yes, but only seasonal closures or pilots', 'No', 'No answer'] },
      { tag: 'B', ask: 'Should a single new project above a set dollar figure have to go to a referendum first?',
        type: 'single',
        options: ['Yes, at $25 million',
                  { t: 'Yes, at a different figure. Say what it is.', fill: 'e.g. $10 million' },
                  'No', 'No answer'] }
    ]
  },
  {
    id: 'VIC-34',
    title: 'Heritage and how buildings look',
    parts: [
      { type: 'grid', rows: [
        'Set design rules for new buildings on the main downtown streets, covering materials and what the ground floor looks like',
        'Offer tax or fee breaks for restoring heritage buildings',
        'Light up landmark buildings, the bridges and the waterfront at night',
        'Fund a set of small park and public-space improvements every year',
        'Make a developer replace a cultural or community space if the project pushes one out'
      ] }
    ]
  },
  {
    id: 'VIC-35',
    title: 'Arts, sport and grants',
    parts: [
      { type: 'grid', rows: [
        "Set a floor under arts and culture funding, so it isn't the first thing cut in a tight year",
        'Sign multi-year grant agreements with established organisations, instead of renewing every year',
        'Invest in sport and recreation facilities alongside arts and culture',
        'Attach published criteria, a report on what it achieved, and an end date to every grant the City gives',
        'Simplify permits for small events and cultural uses'
      ] }
    ]
  }
  ]
},
{
  letter: 'K',
  title: 'How City Hall runs',
  qs: [
  {
    id: 'VIC-36',
    title: 'Running City Hall for less',
    parts: [
      { type: 'grid', rows: [
        'Put at least one service the City now does itself out to tender',
        'Review every department from zero over four years, a few at a time',
        'Publish a performance dashboard every three months, against named targets and dates',
        'Set a target for shrinking management and office jobs through retirements and vacancies, with no layoffs',
        "Go through everything the City owns, and sell or redevelop what it doesn't need"
      ] }
    ]
  },
  {
    id: 'VIC-37',
    title: 'Technology and data',
    parts: [
      { type: 'grid', rows: [
        'Build one City map and open-data site the public can search',
        'Publish realistic images of what a proposed building will actually look like, and use them in consultation',
        'Publish rules for how the City uses AI, including a ban on decisions made without a person reviewing them',
        'Give local suppliers weight in City technology contracts',
        'Put public Wi-Fi in City buildings and main public spaces',
        'Add EV charging on City property'
      ] }
    ]
  },
  {
    id: 'VIC-38',
    title: 'Sharing services across the region',
    parts: [
      { tag: 'A', ask: 'Should more municipal services be delivered jointly across the Capital Region?', type: 'single',
        options: ['Yes', 'Partly, for certain services only', 'Yes, but only if Victoria gets its full costs back', 'No', 'No answer'] },
      { tag: 'B', ask: 'If you said yes or partly, which service first?', type: 'text', rows: 2 }
    ]
  }
  ]
},
{
  letter: 'L',
  title: 'Trees, energy and extreme weather',
  qs: [
  {
    id: 'VIC-39',
    title: 'Where climate work sits',
    parts: [
      { tag: 'A', ask: 'How should the City handle climate action?', type: 'single',
        options: [
          'As its own programme, with its own budget and staff',
          'As a test applied to every spending decision, with no separate programme',
          'Both',
          "Neither. It's a provincial and federal job.",
          'No answer'
        ] },
      { tag: 'B', ask: 'About 30% of Victoria is under tree canopy, and around three quarters of those trees are on private land. Would you set a canopy target with a year attached?',
        type: 'single',
        options: ['Yes. Say what the target is, and by when.', 'Yes to a target, but let staff pick the number', 'No number', 'No answer'] },
      { ask: 'If you set a target — what is it, and by when?', type: 'text', rows: 2 }
    ]
  },
  {
    id: 'VIC-40',
    title: 'Trees, heat and buildings',
    parts: [
      { type: 'grid', rows: [
        'Require a replacement tree when a mature tree comes down, on private land as well as public',
        'Build a district energy system for downtown buildings',
        'Publish a target for how people get around, and measure it every year',
        'Protect and connect wildlife corridors when making land-use decisions',
        'Name cooling and clean-air centres with guaranteed opening hours during heat waves and wildfire smoke',
        'Offer grants or loans for cooling, air filtration and retrofits in existing homes',
        'Publish a schedule, with an end date, for earthquake-proofing City buildings',
        'Require new development to include rain gardens and green infrastructure for stormwater and heat'
      ] }
    ]
  }
  ]
},
{
  letter: 'M',
  title: 'Neighbourhoods and trust',
  qs: [
  {
    id: 'VIC-41',
    title: 'How decisions get made',
    parts: [
      { type: 'grid', rows: [
        "Follow the same published steps on every big project: what's needed, what the options are, what it costs, who was consulted, then the decision",
        'Send a project back to council for a fresh vote if its cost or scope changes a lot',
        'Appoint an Integrity Commissioner or ethics officer for council',
        'Publish a written City response within 60 days of every formal consultation the City runs'
      ] }
    ]
  },
  {
    id: 'VIC-42',
    title: 'Openness at City Hall',
    parts: [
      { type: 'grid', rows: [
        'Set up a lobbyist registry',
        'Cut or scrap freedom-of-information fees for residents',
        'Publish council expenses and pay in a format people can search',
        'Have an independent body review what council is paid'
      ] }
    ]
  },
  {
    id: 'VIC-43',
    title: 'Neighbourhoods and having a say',
    parts: [
      { type: 'grid', rows: [
        'Fund neighbourhood associations and give them formal standing, under published rules',
        'Translate consultation materials into other languages',
        'Finish or update the Local Area Plans that are out of date',
        'Run a proper annual resident survey, and publish all of it',
        'Add advance voting days and locations, to get turnout up'
      ] }
    ]
  },
  {
    id: 'VIC-44',
    title: 'Amalgamation',
    parts: [
      { ask: 'Should Victoria push to amalgamate with Saanich?', type: 'single',
        options: ['Yes, actively', 'Support a study or a referendum, without taking a side on the result', 'No', 'No answer'] }
    ]
  }
  ]
},
{
  letter: 'N',
  title: "What you've published",
  qs: [
  {
    id: 'VIC-45',
    title: 'Your platform, and your record',
    parts: [
      { tag: 'A', ask: 'Have you published a written platform with specific promises in it?', type: 'single',
        options: ['Yes', 'Not yet, but it will be published before voting day', 'No'] },
      { ask: 'If yes, or if a date — paste the link, or give the date.', type: 'text', rows: 2 },
      { tag: 'B', ask: 'Have you published what any of your promises would cost?', type: 'single',
        options: ['Yes', 'No'] },
      { ask: 'If yes — paste the link.', type: 'text', rows: 2 },
      { tag: 'C', ask: 'Would you publish a progress report every three months against your own promises, with dates?',
        type: 'single', options: SCALE.slice() },
      { tag: 'D', ask: "If you were on council between 2022 and 2026: name one decision you'd take differently now, and why.",
        hint: "Skip this if you haven't served on council.", type: 'text' },
      { tag: 'E', ask: 'If you could change one City policy, bylaw or piece of City property in your first year, what would it be, and why?',
        type: 'text' },
      { tag: 'F', ask: 'Anything else you want on the record.', hint: 'Not scored.', type: 'text' }
    ]
  },
  {
    id: 'VIC-46',
    title: 'Three dated promises',
    note: 'Pick three things you marked “Will do” anywhere in this questionnaire. For each one, tell us the date you’d expect it to be done by, and how a resident would be able to tell whether it happened.',
    parts: [
      { ask: 'Promise 1 — what · by when · how we’d know', type: 'text', rows: 3 },
      { ask: 'Promise 2 — what · by when · how we’d know', type: 'text', rows: 3 },
      { ask: 'Promise 3 — what · by when · how we’d know', type: 'text', rows: 3 }
    ]
  }
  ]
}
];

/* ═══════════════════════════════════════════════════════════════════════
   Rendering
   ═══════════════════════════════════════════════════════════════════════ */

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Every field's name is derived from the question id and the part's position,
   so no two fields can collide and the saved answers survive a re-render as
   long as the questions themselves do not move. */
function fieldName(qid, pi, suffix) {
  return qid.toLowerCase().replace(/[^a-z0-9]+/g, '') + '-p' + pi + (suffix ? '-' + suffix : '');
}

function optionLabel(o) { return typeof o === 'string' ? o : o.t; }

function renderChoice(q, part, pi, kind, labelId) {
  const name = fieldName(q.id, pi);
  const type = kind === 'multi' ? 'checkbox' : 'radio';
  const opts = part.options.slice();
  let html = '';

  opts.forEach(function (o, oi) {
    const label = optionLabel(o);
    const id = name + '-o' + oi;
    html += '<label class="q-opt" for="' + id + '">' +
              '<input type="' + type + '" id="' + id + '" name="' + name + '" value="' + esc(label) + '">' +
              '<span>' + esc(label) + '</span>' +
            '</label>';
    if (typeof o !== 'string' && o.fill) {
      html += '<input type="text" class="q-fill" name="' + name + '-say" ' +
              'placeholder="' + esc(o.fill) + '" aria-label="' + esc(label) + '">';
    }
  });

  if (part.other) {
    const id = name + '-other';
    html += '<label class="q-opt" for="' + id + '">' +
              '<input type="' + type + '" id="' + id + '" name="' + name + '" value="' + esc(ELSE) + '">' +
              '<span>' + esc(ELSE) + '</span>' +
            '</label>' +
            '<input type="text" class="q-fill" name="' + name + '-say" ' +
            'placeholder="In a sentence…" aria-label="' + esc(ELSE) + '">';
  }

  /* The options are a group, and the group's name is the question — without
     this a screen reader reads eight orphan radios with no idea what they
     answer. Single choice is a radiogroup; "mark everything you'd vote for"
     is a plain group of checkboxes. */
  const max = kind === 'multi' && part.max ? ' data-max="' + part.max + '"' : '';
  const role = kind === 'multi' ? 'group' : 'radiogroup';
  const label = labelId ? ' aria-labelledby="' + labelId + '"' : '';
  return '<div class="q-opts" role="' + role + '"' + label + max + '>' + html + '</div>' +
         (kind === 'multi' && part.max
           ? '<p class="q-rule">Up to ' + part.max + ' may be selected.</p>' : '');
}

function renderGrid(q, part, pi) {
  let html = '<p class="q-mark">Mark one box on each line.</p><div class="q-grid">';
  part.rows.forEach(function (row, ri) {
    const name = fieldName(q.id, pi, 'r' + ri);
    html += '<div class="q-row"><p class="q-rt" id="' + name + '-l">' + esc(row) + '</p>' +
            '<div class="q-scale" role="radiogroup" aria-labelledby="' + name + '-l">';
    SCALE.forEach(function (col, ci) {
      const id = name + '-c' + ci;
      html += '<label class="q-chip" for="' + id + '">' +
                '<input type="radio" id="' + id + '" name="' + name + '" value="' + esc(col) + '">' +
                '<span>' + esc(col) + '</span>' +
              '</label>';
    });
    html += '</div></div>';
  });
  return html + '</div>';
}

function money(n) { return '$' + n.toLocaleString('en-CA'); }

function renderMoney(q, part, pi) {
  let html = '<div class="q-money" data-total="' + part.total + '">';
  part.lines.forEach(function (line, li) {
    const name = fieldName(q.id, pi, 'l' + li);
    html += '<div class="q-mrow">' +
              '<label for="' + name + '">' + esc(line) + '</label>' +
              '<span class="q-mfield"><i>$</i>' +
              '<input type="text" inputmode="numeric" autocomplete="off" class="q-num" id="' + name + '" name="' + name + '">' +
              '</span>' +
            '</div>';
  });
  if (part.extra) {
    const name = fieldName(q.id, pi, 'extra');
    html += '<div class="q-mextra">' +
              '<label for="' + name + '">' + esc(part.extra) + '</label>' +
              '<textarea id="' + name + '" name="' + name + '" rows="2"></textarea>' +
            '</div>';
  }
  html += '<p class="q-mtot"><span class="q-mtl">Total</span> ' +
          '<b class="q-msum">$0</b> ' +
          '<span class="q-mgoal">must equal ' + money(part.total) + '</span> ' +
          '<span class="q-mdiff" role="status" aria-live="polite"></span></p>';
  return html + '</div>';
}

function renderText(q, part, pi) {
  const name = fieldName(q.id, pi);
  return '<textarea class="q-text" id="' + name + '" name="' + name + '" rows="' + (part.rows || 4) + '"></textarea>';
}

function renderPart(q, part, pi) {
  let html = '<div class="q-part" data-type="' + part.type + '">';
  const askId = fieldName(q.id, pi) + '-ask';
  if (part.ask) {
    const forId = (part.type === 'text' || part.type === 'money')
      ? ' for="' + fieldName(q.id, pi) + '"' : '';
    const tag = part.tag ? '<b>' + part.tag + '</b> · ' : '';
    html += (part.type === 'text'
      ? '<label class="q-ask" id="' + askId + '"' + forId + '>' + tag + esc(part.ask) + '</label>'
      : '<p class="q-ask" id="' + askId + '">' + tag + esc(part.ask) + '</p>');
  }
  if (part.hint) html += '<p class="q-hint">' + esc(part.hint) + '</p>';

  /* Where a question has no separate ask line — VIC-04's scenario is the
     whole question — the group is named by the question's own title. */
  const labelId = part.ask ? askId : q.id.toLowerCase() + '-t';
  if (part.type === 'single') html += renderChoice(q, part, pi, 'single', labelId);
  else if (part.type === 'multi') html += renderChoice(q, part, pi, 'multi', labelId);
  else if (part.type === 'grid') html += renderGrid(q, part, pi);
  else if (part.type === 'money') html += renderMoney(q, part, pi);
  else if (part.type === 'text') html += renderText(q, part, pi);

  return html + '</div>';
}

function renderQuestion(q) {
  const anchor = q.id.toLowerCase();
  let html = '<article class="q-q" id="' + anchor + '" data-code="' + q.id + '">' +
             '<div class="q-h"><span class="q-code">' + q.id + '</span>' +
             '<h3 class="q-t" id="' + anchor + '-t">' + esc(q.title) + '</h3>' +
             '<span class="q-done" aria-hidden="true"></span></div>';
  if (q.note) {
    html += '<div class="q-note"><p>' + esc(q.note) + '</p>' +
            (q.src ? '<p class="q-src">' + esc(q.src) + '</p>' : '') + '</div>';
  }
  q.parts.forEach(function (part, pi) { html += renderPart(q, part, pi); });
  if (q.foot) html += '<p class="q-foot">' + esc(q.foot) + '</p>';
  return html + '</article>';
}

function renderBlock(b) {
  const n = b.qs.length;
  return '<section class="q-block" id="block-' + b.letter.toLowerCase() + '">' +
         '<h2 class="q-bh"><span class="q-bl">Block ' + b.letter + '</span>' +
         '<span class="q-bt">' + esc(b.title) + '</span>' +
         '<span class="q-bn">' + n + (n === 1 ? ' question' : ' questions') + '</span></h2>' +
         b.qs.map(renderQuestion).join('') +
         '</section>';
}

function renderNav() {
  return BLOCKS.map(function (b) {
    return '<a class="q-nav-b" href="#block-' + b.letter.toLowerCase() + '">' +
           '<b>' + b.letter + '</b><span>' + esc(b.title) + '</span>' +
           '<i>' + b.qs.length + '</i></a>';
  }).join('');
}

function buildNavHTML() { return renderNav(); }
function buildBodyHTML() { return BLOCKS.map(renderBlock).join('\n'); }

function questionCount() {
  return BLOCKS.reduce(function (n, b) { return n + b.qs.length; }, 0);
}

/* ═══════════════════════════════════════════════════════════════════════
   Write it into the page
   ═══════════════════════════════════════════════════════════════════════ */

function replaceMarked(html, id, content) {
  const open = '<!-- Q:' + id + ':START -->';
  const close = '<!-- Q:' + id + ':END -->';
  const i = html.indexOf(open), j = html.indexOf(close);
  if (i === -1 || j === -1 || j < i) {
    throw new Error('questionnaire markers for "' + id + '" not found or out of order');
  }
  return html.slice(0, i + open.length) + '\n' + content + '\n' + html.slice(j);
}

if (require.main === module) {
  const file = path.join(ROOT, 'questionnaire.html');
  let html = fs.readFileSync(file, 'utf8');

  /* The counts printed in the hand-written prose are generated too, so a
     question added here can never leave "46 questions" behind in the page. */
  const total = questionCount();
  html = html.replace(/<span class="q-count">\d+<\/span>/g, '<span class="q-count">' + total + '</span>');
  html = html.replace(/data-total-questions="\d+"/g, 'data-total-questions="' + total + '"');

  html = replaceMarked(html, 'NAV', buildNavHTML());
  html = replaceMarked(html, 'BODY', buildBodyHTML());

  const before = fs.readFileSync(file, 'utf8');
  if (before === html) {
    console.log('  unchanged questionnaire.html (' + total + ' questions, ' + BLOCKS.length + ' blocks)');
  } else {
    fs.writeFileSync(file, html, 'utf8');
    console.log('  wrote     questionnaire.html — ' + total + ' questions across ' +
                BLOCKS.length + ' blocks (' + html.length + ' bytes)');
  }
}

module.exports = { BLOCKS, buildNavHTML, buildBodyHTML, questionCount, SCALE };

/* Strip the internal editorial workflow out of the Notion profile bodies
   before they are published.
   ------------------------------------------------------------------------
   The Candidate Profiles page in Notion is a working master. Its own header
   says so: "This page is the profile master for a later live publish. Do not
   quote July grades from the body below as current." The bodies were written
   while the letters were still unapplied, so they carry two things that must
   not reach a reader:

     1. Sentences naming the site owner and the approval step, e.g. "live
        letter still awaiting Joa's click". A visitor does not know who that
        is, and the site should not narrate its own editorial queue.
     2. Assertions about the CURRENT letter that the 2 Sep rescore has since
        overtaken. Caradonna's body says "live letter stays —" while the
        badge at the top of his own page now reads C+.

   The internal PROPOSAL, the mean, the mark tally and the measure counts all
   stay: they are the evidence, and the proposal is openly not the letter.
   Only the workflow clause goes.

   Every rule must match exactly once in its file. A rule that stops matching
   means the Notion text moved, so the build fails rather than quietly
   shipping a page that argues with its own grade. */

/* [slug, find, replace] — find is a literal, never a pattern. */
const RULES = [
  ["bowkett",
    "internal PROPOSE B (mean 1.85, band B−), live letter still awaiting Joa's click.**",
    "internal PROPOSE B (mean 1.85, band B−).**"],
  ["bowkett",
    "**Second open item, a rule call for Joa:**",
    "**Second open item.**"],
  ["caradonna",
    "; live letter **—**, internal proposal C)",
    "; internal proposal C)"],
  ["caradonna",
    "Mean 1.72, band C+, internal proposal **C**; live letter stays **—**.",
    "Mean 1.72, band C+, internal proposal **C**."],
  ["cseszko",
    "0 Record lines, **live letter —** pending Joa's click.",
    "0 Record lines."],
  ["dell",
    "internal proposal **C** at mean 1.21, live letter still a dash and Alignment compute APPLIED still **D**.",
    "internal proposal **C** at mean 1.21."],
  ["gardiner",
    "**Letter on the card is a dash**; the internal proposal is **C**",
    "The internal proposal is **C**"],
  ["gardiner",
    " Live letter waits for Joa's click; Alignment compute APPLIED stays **D** until then.",
    ""],
  ["hammond",
    " Card letter is **—** and Alignment compute APPLIED stays **—**; the C is an internal proposal awaiting Joa.",
    " The C is an internal proposal."],
  ["harris",
    "7 of 55 measures scored, live letter **—**, internal proposal **C**",
    "7 of 55 measures scored, internal proposal **C**"],
  ["kim",
    "Internal proposal **C**; live letter stays a dash until Joa clicks.",
    "Internal proposal **C**."],
  ["loughton",
    "internal proposal C (mean 1.55). The applied letter stays D until Joa clicks.**",
    "internal proposal C (mean 1.55).**"],
  ["mcguigan",
    "15/55 scored, live letter **—**, internal proposal **C**",
    "15/55 scored, internal proposal **C**"],
  ["mcguigan",
    " Live letter remains —.",
    ""],
  ["mcinnis",
    "**not applied** — the live letter is still Joa's click.",
    "**not applied**."],
  ["rothe",
    " Not a live letter — the card shows a dash and waits for Joa.",
    ""],

  /* Notion inline page mentions. The renderer has no element for them, so
     they reach the page as escaped markup a reader can see. The card they
     point at is rendered in full on this same page, so the pointer goes and
     the sentence closes around the gap. */
  ["bowkett",
    "card is filled at <mention-page url=\"https://app.notion.com/p/3cfe245ae5f381b28024ebb65e37701b\"/>:",
    "card is filled:"],
  ["dell",
    "card is now built:** <mention-page url=\"https://app.notion.com/p/3cfe245ae5f381fba1a9e2b5e3856be6\"/> —",
    "card is now built** —"],
  ["gardiner",
    "Scored on the 12-topic card at <mention-page url=\"https://app.notion.com/p/3cfe245ae5f381b6ae40e666d4e0beea\"/>.",
    "Scored on the 12-topic card."],
];

/* Nothing that survives redaction may name the owner or claim a current
   letter. These are checked against the redacted text, per file. */
const FORBIDDEN = [
  ["Joa", "names the site owner and the internal approval step"],
  ["live letter", "asserts a current letter; the badge is the only place that may"],
  ["Live letter", "asserts a current letter; the badge is the only place that may"],
  ["applied letter", "asserts a current letter; the badge is the only place that may"],
  ["Alignment compute APPLIED", "quotes the internal applied column"],
  ["<mention-page", "a Notion page mention the renderer cannot render, so it prints as raw markup"],
];

/* An accurate mention of another candidate's dash is not a letter claim about
   the page it sits on, so it is allowed by name. */
const ALLOW = [
  ["atkinson", "and his live letter is still —."],
];

function redact(slug, md) {
  let out = md;
  const fired = [];
  for (const [s, find, repl] of RULES) {
    if (s !== slug) continue;
    const n = out.split(find).length - 1;
    if (n !== 1) {
      throw new Error("redact-workflow: rule for " + slug + " matched " + n +
        " times, expected 1:\n    " + find);
    }
    out = out.split(find).join(repl);
    fired.push(find);
  }
  let probe = out;
  for (const [s, text] of ALLOW) if (s === slug) probe = probe.split(text).join("");
  for (const [word, why] of FORBIDDEN) {
    if (probe.indexOf(word) > -1) {
      const i = probe.indexOf(word);
      throw new Error("redact-workflow: " + slug + ".md still contains \"" + word +
        "\" — " + why + "\n    ..." + probe.slice(Math.max(0, i - 90), i + 90).replace(/\s+/g, " "));
    }
  }
  return { text: out, fired: fired.length };
}

/* ------------------------------------------------------------------------
   The rating cards carry the same problem in a second place. A handful of
   "why" notes are addressed to the reviewer by name — "FLAG for Joa: the
   first pass marked this Partial 1.0". The caveat itself is worth publishing,
   because it tells a reader exactly how the mark could have gone the other
   way, which is the kind of thing a scorecard is usually silent about. Only
   the addressee is removed. Every fact stays. */
const EVIDENCE_RULES = [
  ["If Joa obtains the recorded vote and he is named",
    "If the recorded vote is obtained and he is named"],
  ["If Joa counts a June 2026 council action in the election year as 2026 text",
    "If a June 2026 council action in the election year counts as 2026 text"],
  ["If Joa rules it a sourced miss",
    "If it is ruled a sourced miss"],
  ["Partial+ 1.5 if Joa reads one-of-three instruments as a target",
    "Partial+ 1.5 if one-of-three instruments reads as a target"],
  ["a dash is also legal if Joa reads an appeal right as adjacency",
    "a dash is also legal if an appeal right reads as adjacency"],
  ["FLAG for Joa:", "FLAG:"],
  ["Caveat for Joa:", "Caveat:"],
];

/* Walk every string in a parsed card, depersonalize it, then refuse to write
   a card that still names the reviewer. */
function depersonalize(card) {
  let hits = 0;
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o !== "object") return;
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === "string") {
        let s = v;
        for (const [find, repl] of EVIDENCE_RULES) {
          if (s.indexOf(find) > -1) { s = s.split(find).join(repl); hits++; }
        }
        o[k] = s;
      } else walk(v);
    }
  };
  walk(card);
  const leak = JSON.stringify(card).indexOf("Joa");
  if (leak > -1) {
    const s = JSON.stringify(card);
    throw new Error("redact-workflow: " + (card.slug || "card") +
      " still names the reviewer after depersonalising — add a rule for:\n    ..." +
      s.slice(Math.max(0, leak - 110), leak + 110));
  }
  return hits;
}

module.exports = { redact, depersonalize, RULES, EVIDENCE_RULES };

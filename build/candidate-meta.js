/* One answer to "who is this candidate", assembled from two committed
   sources so no page has to guess.

   data/candidate-meta.json  — the lean tag and the declaration line,
     transcribed from the Notion Candidate Profiles headings.
   build/notion-toggles/*.md — the "Web, campaign & socials" line and the
     "Profile." paragraph, parsed here rather than copied.

   The lean is the site's own reading of published positions. It is not a
   party registration and not a self-description, and where the source is
   unsure it carries a question mark that must survive to the page. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const META = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "candidate-meta.json"), "utf8"));

/* Known link labels mapped to the platform they belong to, so the page can
   show an icon and a short name instead of a raw URL. */
const HOSTS = [
  [/(^|\.)facebook\.com$/, "Facebook", "facebook"],
  [/(^|\.)instagram\.com$/, "Instagram", "instagram"],
  [/(^|\.)(x|twitter)\.com$/, "X", "x"],
  [/(^|\.)linkedin\.com$/, "LinkedIn", "linkedin"],
  [/(^|\.)bsky\.app$/, "Bluesky", "bluesky"],
  [/(^|\.)reddit\.com$/, "Reddit", "reddit"],
  [/(^|\.)youtube\.com$/, "YouTube", "youtube"],
  [/(^|\.)tiktok\.com$/, "TikTok", "tiktok"],
  [/(^|\.)threads\.(net|com)$/, "Threads", "threads"],
  [/(^|\.)victoria\.ca$/, "City of Victoria", "city"],
  [/(^|\.)crd\.bc\.ca$/, "Capital Regional District", "city"],
];

function hostOf(href) {
  const m = /^https?:\/\/([^/?#]+)/i.exec(href || "");
  return m ? m[1].replace(/^www\./i, "").toLowerCase() : "";
}

function kindOfLink(href, label) {
  const h = hostOf(href);
  for (const [re, name, key] of HOSTS) if (re.test(h)) return { platform: key, name };
  /* A candidate's own pages keep the label the source gave them: "Full
     platform" and "Campaign site" are different destinations and collapsing
     both to one name would hide the platform link. */
  if (/^(campaign (site|website)|full platform|platform|site root|\/)/i.test(label)) {
    return { platform: "site", name: label };
  }
  return { platform: "page", name: label };
}

/* "[Label](url) · [Label](url) — note · ..." — take the links, drop the prose
   between them. A label is kept verbatim because it often carries the only
   description of what the page is. */
function parseLinks(line) {
  const out = [];
  const re = /\[([^\]]+)\]\((https?:[^)\s]+)\)/g;
  let m;
  while ((m = re.exec(line))) {
    const label = m[1].trim();
    const href = m[2].trim();
    if (out.some((l) => l.href === href)) continue;
    out.push(Object.assign({ label, href }, kindOfLink(href, label)));
  }
  return out;
}

/* Strip the markdown a one-paragraph biography can carry. Links become their
   text: the paragraph is prose, not a citation list. */
function plain(s) {
  return String(s)
    .replace(/\[([^\]]+)\]\((?:https?:)?[^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\\([[\]])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function fromToggle(slug) {
  const p = path.join(ROOT, "build", "notion-toggles", slug + ".md");
  if (!fs.existsSync(p)) return { links: [], bio: null, checked: null, vintage: null };
  const lines = fs.readFileSync(p, "utf8").split("\n");
  let links = [], bio = null, checked = null, vintage = null;
  for (const l of lines) {
    /* The heading is hand-written, so it varies: "(checked 1 Sep 2026):" on
       most, "(re-checked 2 Sep 2026)." on Harris. Accept either verb and
       either terminator rather than silently returning no links. */
    let m = /^\*\*Web, campaign & socials(?:\s*\((?:re-)?checked ([^)]*)\))?\s*[:.]?\*\*\.?\s*(.*)$/.exec(l);
    if (m) { checked = checked || m[1] || null; links = links.concat(parseLinks(m[2])); continue; }
    m = /^\*\*Profile\.?\*\*\s*(.*)$/.exec(l);
    if (m && !bio) { bio = plain(m[1]); continue; }
    m = /^\*\*Evidence vintage \(summary\)\s*:?\*\*\s*(.*)$/.exec(l);
    if (m && !vintage) { vintage = plain(m[1]); continue; }
  }
  /* de-duplicate by href, keeping the first label */
  const seen = new Set();
  links = links.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)));
  return { links, bio, checked, vintage };
}

/* office + incumbency in the words a reader uses */
function roleLine(m) {
  const office = m.office === "Mayor" ? "Mayor" : "Council";
  return m.kind === "inc"
    ? "Running for " + office + " · currently on Council"
    : "Running for " + office + " · not currently on Council";
}
const shortRole = (m) => (m.office === "Mayor" ? "Mayor" : "Council") + " · " + (m.kind === "inc" ? "incumbent" : "new");
const leanLabel = (m) => (m.axis || "Unknown") + (m.uncertain ? "?" : "");

function get(slug) {
  const m = META.candidates[slug];
  if (!m) return null;
  const t = fromToggle(slug);
  return Object.assign({}, m, t, {
    slug,
    lean: leanLabel(m),
    leanFull: m.lean,
    role: roleLine(m),
    shortRole: shortRole(m),
  });
}

const all = () => Object.keys(META.candidates).map(get);

module.exports = { get, all, META, leanLabel, shortRole, roleLine };

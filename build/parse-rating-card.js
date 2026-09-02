#!/usr/bin/env node
/**
 * Parse a Notion rating-card page (enhanced markdown from notion-fetch)
 * into data/rating-cards/<slug>.json.
 *
 * Usage:
 *   node build/parse-rating-card.js <slug> <dump.json|dump.md> [notionUrl]
 *   node build/parse-rating-card.js --all   # parse every dump in /tmp/notion-cards
 *
 * Does not invent quotes. Renders only what the card scored.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "data", "rating-cards");
const DUMP_DIR = process.env.NOTION_DUMP_DIR || path.join(__dirname, "notion-cards");

const TOPIC_NAMES = {
  1: "Housing that gets built",
  2: "Downtown order",
  3: "Household bill",
  4: "Host Nations",
  5: "Homelessness and waitlists",
  6: "Families",
  7: "Streets and mobility",
  8: "Policing and published safety",
  9: "Beauty as a public good",
  10: "A smaller scored Hall",
  11: "Climate and trees as operations",
  12: "Neighbourhoods and integrity",
};

/** Locked 12-topic / 55-cell template (n, topic, measure, what). */
const TEMPLATE = [
  [1, 1, "M6", "housing supply + composition"],
  [2, 1, "M6b", "land bank + co-ops"],
  [3, 1, "M7", "permits + AI pre-screening"],
  [4, 1, "M7b", "pattern-book housing"],
  [5, 1, "M8/M8b", "5% vacancy, DCC cuts, suite amnesty"],
  [6, 2, "M26", "Public Order Team"],
  [7, 2, "M26b", "civilian crisis response"],
  [8, 2, "M27", "bylaw hours 6am–10pm"],
  [9, 2, "M28", "data-targeted enforcement"],
  [10, 2, "M33", "daytime sheltering bylaws"],
  [11, 2, "M33b", "drug-use buffer (City: list + bylaw/DPOT + VicPD/CDSA; not City seizure)"],
  [12, 2, "M34–M37", "encampments, reclaiming spaces, night lighting"],
  [13, 3, "M66", "tax glide path (capped on the residential rate)"],
  [14, 3, "M66b/c", "over-collection refund + debt rule"],
  [15, 3, "M66d", "the Household Bill"],
  [16, 3, "M70/M70b", "provincial downloading ledger"],
  [17, 3, "M70c", "CRD cost and the Goldstream plant"],
  [18, 3, "M71–M73d", "business, downtown, one mandate not a new office"],
  [19, 3, "M74/M75/M76", "capital threshold, short-stay parking (15-min grace; first-hour gated Year 2), permit fees"],
  [20, 4, "M1–M5", "Host Nations Foundation. Topic never drops out of the 12. A dash is still allowed on M1–M5."],
  [21, 5, "M9/M9b/M64", "tenant protections, STR, indoor heat (M9c struck; 26°C gated)"],
  [22, 5, "M10", "transparent algorithmic waitlists"],
  [23, 5, "M11", "Housing First + STEP throughput"],
  [24, 6, "M12/M13b/M13c", "childcare, doctors, youth (M13 school food is $0 → M13d)"],
  [25, 6, "M13d", "standing School District 61 agreement"],
  [26, 7, "M14/M16/M17/M18", "cleanliness and the public realm"],
  [27, 7, "M19/M22/M38/M40–M42b", "mobility + Vision Zero (M39 30 km/h struck; calming is M38)"],
  [28, 7, "M20b/M23b", "walking and transit the City controls"],
  [29, 7, "M24b/M25b", "accessibility and public washrooms"],
  [30, 7, "M25", "fix roads first"],
  [31, 8, "M28b", "business security cost-spreading"],
  [32, 8, "M28d", "community paramedicine"],
  [33, 8, "M29/M29b", "VicPD funding + regional review (convene-and-publish; no binding other force)"],
  [34, 8, "M30", "smart LED lights, no surveillance"],
  [35, 8, "M31/M31b/M31c/M32", "safety dashboard, published enforcement record, crime target"],
  [36, 9, "M43–M46b", "heritage and cultural venues"],
  [37, 9, "M45b/c", "pedestrianisation and the signature project"],
  [38, 9, "M47–M49", "heritage incentives, lighting, parks"],
  [39, 9, "M50/M50b/M51/M52", "culture, sport, and the arts funding floor"],
  [40, 10, "M15", "managed competition"],
  [41, 10, "M65", "rotating zero-based reviews"],
  [42, 10, "M67", "quarterly performance dashboard"],
  [43, 10, "M68", "overhead reduction by attrition"],
  [44, 10, "M69", "real-estate rationalisation"],
  [45, 10, "M53/M53b/M53c", "GIS, AI consultation imagery, LIDAR"],
  [46, 10, "M53d", "published municipal AI standard"],
  [47, 10, "M54–M57", "local-tech procurement, open data, Wi-Fi, EV charging"],
  [48, 11, "M58/M58b/M64b", "climate, district energy, seismic"],
  [49, 11, "M59–M63", "trees, mode share, ecosystems, emergency preparedness"],
  [50, 12, "M77/M78/M78b", "$25M referendum threshold, 5-step process, material-change rule"],
  [51, 12, "M79/M79b", "Integrity Commissioner + 60-day consultation response"],
  [52, 12, "M79c–f", "lobbyist registry, FOI fee, remuneration"],
  [53, 12, "M80/M80b/M80c", "neighbourhoods, language access, Local Area Plans"],
  [54, 12, "M82/M82b", "community surveys, turnout and ballot access"],
  [55, 12, "M81", "Saanich amalgamation (one line, not the whole topic)"],
];

const DOOR_IDS = [
  { id: "tax", label: "Tax cap" },
  { id: "downtown", label: "Downtown order" },
  { id: "housing", label: "Housing" },
  { id: "bill", label: "Household bill" },
  { id: "program", label: "Written program" },
];

const MARKS = {
  Aligned: 3,
  Close: 2,
  "Partial+": 1.5,
  Partial: 1,
  Weak: 0.5,
  Opposed: -1,
  Record: null,
};

const BANNED = /\b(Lisnard|Estrosi|Knafo|Musk|Brivael|Poilievre)\b/i;
// Partial+ must win over Partial. `\b` after `+` fails (both `+` and space are non-word).
const MARK_RE = /^(Aligned|Close|Partial\+|Partial|Weak|Opposed|Record|Mentions?)(?=\s|$|[^A-Za-z])/i;

const MONTHS = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
  apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10,
  nov: 11, november: 11, dec: 12, december: 12,
};

function decodeEntities(s) {
  return String(s || "")
    .replace(/\\\$/g, "$")
    .replace(/\\~/g, "~")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripMd(s) {
  let t = decodeEntities(s);
  t = t.replace(/<mention-page[^/]*\/>/g, "");
  t = t.replace(/\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, "$1");
  t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
  t = t.replace(/\*([^*]+)\*/g, "$1");
  t = t.replace(/<[^>]+>/g, "");
  t = t.replace(/\u00a0/g, " ");
  t = t.replace(/[ \t]+/g, " ").replace(/\s+\n/g, "\n").trim();
  return t;
}

function isDashish(s) {
  const t = stripMd(s);
  return !t || t === "—" || t === "–" || t === "-" || t === "n/a" || /^n\/a\b/i.test(t);
}

function firstUrl(s) {
  if (!s) return null;
  const md = String(s).match(/\]\((https?:\/\/[^)\s]+)\)/);
  if (md) return md[1];
  const bare = String(s).match(/https?:\/\/[^\s)>\]]+/);
  return bare ? bare[0].replace(/[.,;:]+$/, "") : null;
}

function hostname(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function parseDayMonthYear(phrase) {
  const m = String(phrase).match(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})\b/i);
  if (!m) return null;
  const day = String(m[1]).padStart(2, "0");
  const mon = MONTHS[m[2].toLowerCase().slice(0, 3)];
  if (!mon) return null;
  return `${m[3]}-${String(mon).padStart(2, "0")}-${day}`;
}

function parseIsoDate(s) {
  const m = String(s).match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return m ? m[1] : null;
}

function parseDateFields(raw) {
  const text = stripMd(raw);
  const out = { lastmod: null, retrieved: null, date: null };
  if (isDashish(text)) return out;

  const ret = text.match(/retrieved\s+(20\d{2}-\d{2}-\d{2})/i);
  if (ret) out.retrieved = ret[1];

  const lastmodNp = /lastmod\s+n\/p\b/i.test(text);
  const lastmodM = text.match(/lastmod\s+([^,/·]+?)(?=\s*(?:,|\/|·|$)|retrieved)/i);
  if (lastmodM && !lastmodNp && !/^n\/p\b/i.test(lastmodM[1].trim()) && !/^n\/a\b/i.test(lastmodM[1].trim()) && !/not published/i.test(lastmodM[1])) {
    const rawLm = lastmodM[1].trim();
    out.lastmod = parseIsoDate(rawLm) || parseDayMonthYear(rawLm) || rawLm;
  }

  const vote = text.match(/vote\s+\d{1,2}\s+\w+\s+\d{4}/i);
  if (!out.lastmod && vote) out.lastmod = vote[0].replace(/\s+/g, " ");

  // Article / press date sitting at the front: "14 Aug 2026, retrieved 2026-09-02"
  if (!out.lastmod) {
    const lead = parseDayMonthYear(text);
    if (lead) out.lastmod = lead;
  }

  out.date = out.retrieved || out.lastmod || text.replace(/\s+/g, " ").trim() || null;
  return out;
}

function parseTables(md) {
  const tables = [];
  const re = /<table[^>]*>([\s\S]*?)<\/table>/g;
  let m;
  while ((m = re.exec(md))) {
    const rows = [];
    const trRe = /<tr>([\s\S]*?)<\/tr>/g;
    let tr;
    while ((tr = trRe.exec(m[1]))) {
      const cells = [];
      const tdRe = /<td>([\s\S]*?)<\/td>/g;
      let td;
      while ((td = tdRe.exec(tr[1]))) cells.push(td[1].trim());
      if (cells.length) rows.push(cells);
    }
    if (rows.length) tables.push(rows);
  }
  return tables;
}

function fieldMap(rows) {
  const map = {};
  for (const r of rows.slice(1)) {
    const k = stripMd(r[0] || "").toLowerCase();
    map[k] = r[1] || "";
  }
  return map;
}

function parseMark(answerRaw) {
  const t = stripMd(answerRaw).replace(/\s+/g, " ").trim();
  if (isDashish(t) || /^mentions?\b/i.test(t)) return { mark: null, value: null, kindHint: "dash" };
  if (/📋/.test(answerRaw) || /^record\b/i.test(t)) return { mark: "Record", value: null, kindHint: "record" };
  const m = t.match(MARK_RE);
  if (!m) return { mark: null, value: null, kindHint: "dash" };
  const label = m[1].replace(/^partial\+$/i, "Partial+").replace(/^./, (c) => c.toUpperCase());
  const canon = label === "Partial+" ? "Partial+" : (label[0].toUpperCase() + label.slice(1).replace(/\+$/, "+"));
  const key = Object.keys(MARKS).find((k) => k.toLowerCase() === m[1].toLowerCase());
  if (!key) return { mark: null, value: null, kindHint: "dash" };
  return { mark: key, value: MARKS[key], kindHint: key === "Record" ? "record" : "scored" };
}

function splitQuoteWhy(raw) {
  const text = stripMd(raw);
  if (!text || isDashish(text)) return { quote: null, why: null };
  const mid = text.indexOf(" · ");
  if (mid !== -1) {
    return { quote: cleanQuote(text.slice(0, mid)), why: cleanWhy(text.slice(mid + 3)) };
  }
  // Quoted sentence(s) at the start, then unquoted commentary (Alto-style, no middot).
  const qm = text.match(/^[“"]([\s\S]+?)[”"](?=\s|$)/);
  if (qm) {
    const after = text.slice(qm[0].length).trim();
    return { quote: cleanQuote(qm[1]), why: cleanWhy(after) };
  }
  // Named vote / decision: first sentence is the quote line.
  const cut = text.search(/\s+(?:Commits|Agrees|Disagrees|Record-only|Mentions?|Context|Hit vs|Not a |No 2026)\b/);
  if (cut > 20) {
    return { quote: cleanQuote(text.slice(0, cut)), why: cleanWhy(text.slice(cut)) };
  }
  const dot = text.indexOf(". ");
  if (dot > 20 && dot < 280) {
    return { quote: cleanQuote(text.slice(0, dot + 1)), why: cleanWhy(text.slice(dot + 2)) };
  }
  return { quote: cleanQuote(text), why: null };
}

function cleanQuote(s) {
  if (!s) return null;
  // Exact card words. Decode entities / unwrap table wrapping only — do not
  // paraphrase, compress, or strip figures that appear in the candidate's mouth.
  let t = s.replace(/\s*\n\s*/g, " ").replace(/[ \t]+/g, " ").trim();
  t = t.replace(/^[“"]|[”"]$/g, "").trim();
  if (BANNED.test(t)) t = t.replace(BANNED, "[removed]");
  return t || null;
}

function cleanWhy(s) {
  if (!s) return null;
  let t = s.replace(/\s*\n\s*/g, " ").replace(/[ \t]+/g, " ").trim();
  if (BANNED.test(t)) t = t.replace(BANNED, "[removed]");
  return t || null;
}

function parseDoorState(raw) {
  const t = stripMd(raw).toLowerCase().replace(/[—–]/g, "-").trim();
  if (t === "said") return "said";
  if (t === "record") return "record";
  if (t === "yes") return "yes";
  return "dash";
}

function emptyCell(n) {
  const t = TEMPLATE[n - 1];
  return {
    n,
    topic: t[1],
    topicName: TOPIC_NAMES[t[1]],
    measure: t[2],
    what: t[3],
    kind: "dash",
    mark: null,
    value: null,
    quote: null,
    why: null,
    url: null,
    source: null,
    lastmod: null,
    retrieved: null,
  };
}

function emptyCard(slug, extras) {
  return {
    slug,
    name: extras.name || slug,
    office: extras.office || "Council",
    kind: extras.kind || "chal",
    notionUrl: extras.notionUrl || null,
    notionTitle: extras.notionTitle || null,
    platformUrl: extras.platformUrl || null,
    platformLastmod: null,
    retrieved: extras.retrieved || "2026-09-02",
    cardScoredCount: 0,
    cardRecordCount: 0,
    doors: DOOR_IDS.map((d) => ({
      id: d.id,
      label: d.label,
      measure: null,
      state: "dash",
      sentence: null,
      url: null,
      date: null,
    })),
    cells: TEMPLATE.map((t) => emptyCell(t[0])),
    ...extras.exportError ? { exportError: extras.exportError } : {},
  };
}

function contentOnly(md) {
  const cutNotes = md.search(/\n## Working notes/);
  const cutInternal = md.search(/\n## INTERNAL proposed letter/);
  let end = md.length;
  if (cutNotes !== -1) end = Math.min(end, cutNotes);
  if (cutInternal !== -1) end = Math.min(end, cutInternal);
  return md.slice(0, end);
}

function parseCard(raw, slug, notionUrl) {
  if (!raw || !String(raw).trim()) {
    return emptyCard(slug, { notionUrl, exportError: "notion unread" });
  }

  let md = raw;
  if (raw.trim().startsWith("{")) {
    try {
      const j = JSON.parse(raw);
      md = j.text || j.markdown || "";
      if (!notionUrl && j.url) notionUrl = String(j.url).replace(/\?.*$/, "");
      if (!notionUrl && j.metadata && j.metadata.url) notionUrl = String(j.metadata.url).replace(/\?.*$/, "");
    } catch {
      /* treat as markdown */
    }
  }

  const pageUrl = (md.match(/<page url="([^"]+)"/) || [])[1] || notionUrl || null;
  const titleProp = (md.match(/"title"\s*:\s*"([^"]+)"/) || [])[1]
    || (md.match(/<properties>\s*\{[^}]*"title":"([^"]+)"/) || [])[1]
    || null;

  const body = contentOnly(md);
  const tables = parseTables(body);
  if (!tables.length) {
    return emptyCard(slug, {
      notionUrl: pageUrl,
      notionTitle: titleProp,
      exportError: "notion unread",
    });
  }

  const card = emptyCard(slug, { notionUrl: pageUrl, notionTitle: titleProp });

  // Card metadata = first Field/Value table.
  const metaTable = tables.find((t) => stripMd(t[0][0]).toLowerCase() === "field");
  if (metaTable) {
    const f = fieldMap(metaTable);
    const name = stripMd(f.name || "");
    if (name) card.name = name;
    const office = stripMd(f.office || "");
    if (office) card.office = office;
    const kindRaw = stripMd(f.kind || "");
    const kindWord = (kindRaw.split(/\s+/)[0] || "").toLowerCase();
    if (kindWord === "inc" || kindWord === "chal") card.kind = kindWord;
    card.platformUrl = firstUrl(f["platform url (2026)"] || f["platform url"] || "");
    const plm = stripMd(f["platform lastmod"] || "");
    if (plm && !isDashish(plm) && !/not published|n\/a|no 2026/i.test(plm)) {
      card.platformLastmod = parseIsoDate(plm) || parseDayMonthYear(plm) || null;
    }
    const ret = stripMd(f.retrieved || "");
    if (parseIsoDate(ret)) card.retrieved = parseIsoDate(ret);
    if (titleProp) card.notionTitle = titleProp;
    else if (card.name && card.office && card.kind) {
      card.notionTitle = `${card.name} · ${card.office} · ${card.kind}`;
    }
  }

  if (pageUrl) card.notionUrl = pageUrl.replace(/\?.*$/, "");

  // Doors = table whose header starts with Door.
  const doorTable = tables.find((t) => /^door$/i.test(stripMd(t[0][0])));
  if (doorTable) {
    const dataRows = doorTable.slice(1).filter((r) => {
      const label = stripMd(r[0] || "");
      return label && !/^door$/i.test(label);
    });
    for (let i = 0; i < DOOR_IDS.length && i < dataRows.length; i++) {
      const r = dataRows[i];
      const state = parseDoorState(r[2] || "");
      const url = firstUrl(r[4] || "");
      const dates = parseDateFields(r[5] || "");
      const sentence = stripMd(r[3] || "");
      card.doors[i] = {
        id: DOOR_IDS[i].id,
        label: DOOR_IDS[i].label,
        measure: isDashish(r[1]) ? null : stripMd(r[1] || "") || null,
        state,
        sentence: state === "dash" ? null : (sentence || null),
        url: state === "dash" ? null : url,
        date: state === "dash" ? null : (dates.date || null),
      };
    }
  }

  // Topic tables: header row starts with # (or n).
  const scoredByN = {};
  for (const t of tables) {
    const h0 = stripMd(t[0][0]).toLowerCase();
    if (h0 !== "#" && h0 !== "n") continue;
    for (const r of t.slice(1)) {
      const cols = r.slice(0, 7);
      const n = parseInt(stripMd(cols[0] || ""), 10);
      if (!n || n < 1 || n > 55) continue;
      if (scoredByN[n]) continue;
      const measure = stripMd(cols[1] || "") || TEMPLATE[n - 1][2];
      const what = stripMd(cols[2] || "") || TEMPLATE[n - 1][3];
      const parsed = parseMark(cols[3] || "");
      const url = firstUrl(cols[5] || "");
      const dates = parseDateFields(cols[6] || "");
      const hasDate = !!(dates.retrieved || dates.lastmod);
      let kind = "dash";
      if (parsed.kindHint === "record") kind = "record";
      else if (parsed.kindHint === "scored" && url && hasDate) kind = "scored";
      else kind = "dash";

      const cell = emptyCell(n);
      cell.measure = measure;
      cell.what = what;
      cell.kind = kind;
      if (kind === "dash") {
        scoredByN[n] = cell;
        continue;
      }
      const q = splitQuoteWhy(cols[4] || "");
      cell.mark = parsed.mark;
      cell.value = parsed.value;
      cell.quote = q.quote;
      cell.why = q.why;
      cell.url = url;
      cell.source = hostname(url);
      cell.lastmod = dates.lastmod;
      cell.retrieved = dates.retrieved || card.retrieved || null;
      // Thin-cell FLAG from the card itself — render what is there, do not fill.
      const flagBits = [];
      const rawQ = stripMd(cols[4] || "");
      if (/\bFLAG\b/.test(rawQ) || /\bFLAG\b/.test(q.why || "")) flagBits.push("card FLAG");
      if (kind === "scored" && (!q.quote || q.quote.length < 24)) flagBits.push("thin verbatim");
      if (flagBits.length) cell.flags = flagBits;
      scoredByN[n] = cell;
    }
  }

  card.cells = TEMPLATE.map((t) => scoredByN[t[0]] || emptyCell(t[0]));
  card.cardScoredCount = card.cells.filter((c) => c.kind === "scored").length;
  card.cardRecordCount = card.cells.filter((c) => c.kind === "record").length;
  return card;
}

function writeCard(card) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const dest = path.join(OUT_DIR, `${card.slug}.json`);
  fs.writeFileSync(dest, JSON.stringify(card, null, 2) + "\n");
  return dest;
}

function summarize(card) {
  const scored = card.cells.filter((c) => c.kind === "scored");
  const first3 = scored.slice(0, 3).map((c) => ({
    n: c.n,
    mark: c.mark,
    host: c.source,
  }));
  return {
    slug: card.slug,
    scored: card.cardScoredCount,
    record: card.cardRecordCount,
    first3,
    exportError: card.exportError || null,
  };
}

function loadDump(file) {
  return fs.readFileSync(file, "utf8");
}

const CANONICAL = {
  alto: { id: "3cfe245ae5f3818aac9bc5905e1ee9ec" },
  harris: { id: "3cfe245ae5f3811fb9cde71b3f61803b" },
  mcguigan: { id: "3cfe245ae5f381d1844ad1cf7e4c3053" },
  mcinnis: { id: "3cfe245ae5f381f8a4dffad6c29154d0" },
  garcia: { id: "3cfe245ae5f381f5a261caa547e93d66" },
  gardiner: { id: "3cfe245ae5f381b6ae40e666d4e0beea" },
  hammond: { id: "3cfe245ae5f3815ab5b6cf00e712f8ff" },
  caradonna: { id: "3cfe245ae5f381fcad84cc3889ee3d3b" },
  // Dense fill (n=14). IGNORE thin leftover …db8bede3e9221140c5.
  dell: { id: "3cfe245ae5f381fba1a9e2b5e3856be6" },
  thompson: { id: "3cfe245ae5f3815b88c5f74a937fda34" },
  kim: { id: "3cfe245ae5f3818bbdb4ce3dded96e5f" },
  loughton: { id: "3cfe245ae5f381b8bb37c681783c5118" },
  cseszko: { id: "3cfe245ae5f38128abdafe16a820650c" },
  rothe: { id: "3cfe245ae5f38188ac1bf7ebc9ee3a26" },
  bowkett: { id: "3cfe245ae5f381b28024ebb65e37701b" },
  lee: { id: "3cfe245ae5f38189a0c1f8ebc3907aa7" },
  sandor: { id: "3cfe245ae5f3814aaae0f9a22a49eb19" },
  girard: { id: "3cfe245ae5f381ee8c95e25b4b805bdf" },
  gibbs: { id: "3cfe245ae5f381e4979bcb05f7a900f9" },
  dion: { id: "3cfe245ae5f38110b50feb28aeb97c7a" },
};

function runAll() {
  const summaries = [];
  for (const slug of Object.keys(CANONICAL)) {
    const dump = path.join(DUMP_DIR, `${slug}.json`);
    const md = path.join(DUMP_DIR, `${slug}.md`);
    const file = fs.existsSync(dump) ? dump : (fs.existsSync(md) ? md : null);
    const notionUrl = `https://app.notion.com/p/${CANONICAL[slug].id}`;
    let card;
    if (!file) {
      card = emptyCard(slug, { notionUrl, exportError: "notion unread" });
    } else {
      card = parseCard(loadDump(file), slug, notionUrl);
    }
    writeCard(card);
    summaries.push(summarize(card));
  }
  return summaries;
}

module.exports = {
  parseCard,
  writeCard,
  summarize,
  emptyCard,
  CANONICAL,
  TEMPLATE,
  TOPIC_NAMES,
};

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === "--all") {
    const summaries = runAll();
    for (const s of summaries) {
      const err = s.exportError ? ` ERROR=${s.exportError}` : "";
      const f3 = (s.first3 || []).map((x) => `${x.n}:${x.mark}@${x.host}`).join(", ");
      console.log(`${s.slug}\tscored=${s.scored}\trecord=${s.record}\t${f3}${err}`);
    }
    process.exit(0);
  }
  if (args.length < 2) {
    console.error("Usage: node build/parse-rating-card.js <slug> <dump> [notionUrl]");
    process.exit(1);
  }
  const [slug, file, url] = args;
  const card = parseCard(loadDump(file), slug, url || `https://app.notion.com/p/${(CANONICAL[slug] || {}).id || ""}`);
  writeCard(card);
  console.log(JSON.stringify(summarize(card), null, 2));
}

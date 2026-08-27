#!/usr/bin/env node
/* A City That Works — Notion → dump export.
 *
 *     node build/export.js
 *
 * Notion is canonical. The generators already know how to read the dumps in
 * this folder; what they have never had is a way to refresh those dumps
 * without a hand paste. That paste is why the site lags. This script pulls
 * the neighbourhood tree and writes build/neighbourhoods.md in the format
 * build/neighbourhoods.js already parses, then runs that generator and
 * build/checklinks.js.
 *
 * What it will not do, and will refuse rather than paper over:
 *
 *   1. Write measures.js, or any other Program / measure body. There is no
 *      measures dump. The Program is a different document and a different
 *      decision. Passing --program (or anything that would rewrite a
 *      measure id or body) exits non-zero and leaves the tree alone.
 *   2. Remap measure numbers. If Notion still says M24, the dump says M24.
 *      Draft remaps waiting on a human click are not applied here.
 *   3. Pull candidate pages (profiles, the matrix, the scorecard). Those
 *      stay on their own pipeline; this script does not touch them.
 *   4. Overwrite a neighbourhood entry whose cited M-numbers would change
 *      against the last committed dump. Prose can move. Measure ids cannot,
 *      not from this script. The page is left as committed and named in
 *      build/export-diff.json.
 *
 * Token: NOTION_TOKEN or NOTION_API_KEY. An internal integration, shared
 * on the neighbourhood hub (child pages inherit). Without a token the
 * script names every page it would read and exits 2.
 *
 * Usage: node build/export.js
 *        node build/export.js --skip-generate
 *        node build/export.js --skip-checklinks
 */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const ROOT = path.join(__dirname, '..');
const DUMP = path.join(__dirname, 'neighbourhoods.md');
const DIFF_PATH = path.join(__dirname, 'export-diff.json');
const MEASURES_JS = path.join(ROOT, 'measures.js');
const API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

/* Canonical pages this script is allowed to read. The Program is listed so
   the missing-token message can name it — and so the guard below can refuse
   to write it. */
const PAGES = {
  hub: '36ce245ae5f381208f2cc0b918b040f7',
  program: '36ce245ae5f3813eaafdf1a7eae2a81a',
  neighbourhoods: '3b4e245ae5f38166acd4fbc2a3a45a0e',
  neighbourhood: {
    downtown: '3b4e245ae5f381ccaee7e8faaaaad2a6',
    'james-bay': '3b4e245ae5f3819594a1dac984258be6',
    fairfield: '3b4e245ae5f381c797edd4ddc22b0f09',
    gonzales: '3b4e245ae5f3815c9519e2395dcf32e2',
    rockland: '3b4e245ae5f381be97e9e9a73bcb1e02',
    'vic-west': '3b4e245ae5f38118a01dd1094f507595',
    'hillside-quadra': '3b4e245ae5f381f4baddd8dc2bdb5e47',
    oaklands: '3b4e245ae5f381fca49ae8e051aa570f',
    fernwood: '3b4e245ae5f381cda51ddcd8ce717978',
    'north-park': '3b4e245ae5f3818b8244fe7031bdb43f',
    'burnside-rock-bay': '3b4e245ae5f381e3a85fe0995aeae4c6',
    jubilee: '3b4e245ae5f3814a855adb0e3904c153',
    'harris-green': '3b4e245ae5f381cdaa3ef869c71cebdc',
  },
};

const SLUG_FROM_TITLE = [
  [/^harris green\b/i, 'harris-green'],
  [/^burnside/i, 'burnside-rock-bay'],
  [/^hillside/i, 'hillside-quadra'],
  [/^james bay\b/i, 'james-bay'],
  [/^north park\b/i, 'north-park'],
  [/^vic(?:toria)? west\b/i, 'vic-west'],
  [/^downtown\b/i, 'downtown'],
  [/^fairfield\b/i, 'fairfield'],
  [/^gonzales\b/i, 'gonzales'],
  [/^rockland\b/i, 'rockland'],
  [/^oaklands\b/i, 'oaklands'],
  [/^fernwood\b/i, 'fernwood'],
  [/^jubilee\b/i, 'jubilee'],
];

/* Remaps a verifier drafted and a human has not clicked. Listed so a later
   edit cannot "helpfully" apply them. This script has no remap table and
   must not grow one. */
void [
  'M24→M75 (Downtown, Fairfield, Hillside-Quadra, North Park, Jubilee)',
  'Rockland M25→M25b',
  'Burnside: drop M24 from the pipe sentence; uncite M71 on employment land',
  'Hillside: keep M10 on waitlists only',
  'James Bay: add (M36) on Beacon Hill',
];

const HEADER = `A City That Works — Neighbourhood pages master
==============================================

This file is the master copy of the 13 neighbourhood pages, dumped from the
Notion page "Victoria 2030, Neighbourhood by Neighbourhood". \`build/export.js\`
pulls that tree; \`build/neighbourhoods.js\` parses this file and writes
\`neighbourhood-<slug>.html\` for each entry, plus the card grid inside
\`neighbourhoods.html\` and the one on \`index.html\`.

Edit Notion, re-run the exporter, commit both. Do not edit the generated pages.
The exporter does not remap measure numbers and will not write this file in a
way that changes the M-ids a page already cites.

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
`;

const argv = process.argv.slice(2);
const SKIP_GENERATE = argv.includes('--skip-generate');
const SKIP_CHECKLINKS = argv.includes('--skip-checklinks');

function die(msg, code) {
  console.error(msg);
  process.exit(code == null ? 1 : code);
}

if (argv.some((a) => /^(--)?program$|--measures?$/i.test(a))) {
  die('Refusing: this exporter does not write the Program or any measure.\n' +
    'There is no measures dump. measures.js is left untouched.');
}

function token() {
  return process.env.NOTION_TOKEN || process.env.NOTION_API_KEY || '';
}

function dashedId(id) {
  const hex = String(id).replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return id;
  return hex.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

function sha256(s) {
  return createHash('sha256').update(s).digest('hex');
}

function measureIds(text) {
  return [...new Set([...String(text).matchAll(/\bM(\d{1,3}[a-z]?)\b/g)].map((m) => m[0]))].sort();
}

function figures(text) {
  const out = new Set();
  String(text).replace(/\\\$/g, '$').replace(/\$[\d][\d,]*(?:\.\d+)?(?:\s*[–—-]\s*\$?[\d,]*(?:\.\d+)?)?\s*[KMB]?/g, (m) => { out.add(m.replace(/\s+/g, ' ').trim()); return m; });
  String(text).replace(/\b\d+(?:\.\d+)?%/g, (m) => { out.add(m); return m; });
  return [...out].sort();
}

/* ---------------------------------------------------------------- dump IO */

function parseMaster(src) {
  const chunks = src.split(/^=== +(.+)$/m);
  const out = [];
  for (let i = 1; i < chunks.length; i += 2) {
    const slug = chunks[i].trim();
    const rest = chunks[i + 1];
    const cut = rest.indexOf('\n---\n');
    if (cut === -1) throw new Error(slug + ': no --- line closing the front matter');
    const fm = {};
    rest.slice(0, cut).split('\n').forEach((line) => {
      if (!line.trim()) return;
      const m = line.match(/^([a-z]+):\s*(.*)$/);
      if (!m) throw new Error(slug + ': unparsed front-matter line "' + line + '"');
      fm[m[1]] = m[2].trim();
    });
    fm.slug = slug;
    fm.body = rest.slice(cut + 5).replace(/^\n+/, '').replace(/\s+$/, '');
    out.push(fm);
  }
  return out;
}

function serializeDump(entries) {
  const blocks = entries.map((e) => {
    const keys = ['name', 'emoji', 'official', 'tagline', 'card', 'assoc', 'assocurl', 'meta'];
    const fm = keys
      .filter((k) => e[k] != null && e[k] !== '' && !(k === 'official' && e[k] !== 'no' && e[k] !== false))
      .map((k) => {
        const v = (k === 'official' && (e[k] === false || e[k] === 'no')) ? 'no' : e[k];
        return k + ': ' + v;
      })
      .join('\n');
    return '=== ' + e.slug + '\n' + fm + '\n---\n' + e.body.trim() + '\n';
  });
  return HEADER + '\n' + blocks.join('\n');
}

/* ---------------------------------------------------------------- Notion API */

async function notionGet(pathname, tok) {
  let wait = 400;
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(API + pathname, {
      headers: {
        Authorization: 'Bearer ' + tok,
        'Notion-Version': NOTION_VERSION,
      },
    });
    if (res.status === 429) {
      const retry = Number(res.headers.get('retry-after')) || wait / 1000;
      await new Promise((r) => setTimeout(r, retry * 1000));
      wait *= 2;
      continue;
    }
    const body = await res.json();
    if (!res.ok) {
      const msg = body.message || res.statusText;
      throw new Error('Notion ' + res.status + ' ' + pathname + ': ' + msg);
    }
    return body;
  }
  throw new Error('Notion rate-limited on ' + pathname);
}

async function notionPaginate(pathname, tok) {
  const out = [];
  let cursor = null;
  do {
    const join = pathname.includes('?') ? '&' : '?';
    const url = pathname + join + 'page_size=100' + (cursor ? '&start_cursor=' + encodeURIComponent(cursor) : '');
    const data = await notionGet(url, tok);
    out.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return out;
}

async function fetchBlocks(id, tok) {
  const blocks = await notionPaginate('/blocks/' + dashedId(id) + '/children', tok);
  for (const b of blocks) {
    if (b.has_children && (b.type === 'callout' || b.type === 'quote' || b.type === 'paragraph')) {
      b._children = await fetchBlocks(b.id, tok);
    }
  }
  return blocks;
}

function richText(arr) {
  if (!arr || !arr.length) return '';
  return arr.map((t) => {
    let s = t.plain_text || '';
    if (!s) return '';
    const a = t.annotations || {};
    const href = t.href || (t.text && t.text.link && t.text.link.url);
    if (href) s = '[' + s + '](' + href + ')';
    if (a.code) s = '`' + s + '`';
    if (a.bold) s = '**' + s + '**';
    if (a.italic) s = '*' + s + '*';
    return s;
  }).join('');
}

function blockPlain(block) {
  const type = block.type;
  const data = block[type];
  if (!data) return '';
  let text = richText(data.rich_text || data.text || []);
  if (block._children && block._children.length) {
    const extra = block._children.map(blockPlain).filter(Boolean).join('\n');
    if (extra) text = text ? text + '\n' + extra : extra;
  }
  return text;
}

function isHeroCallout(block, pageName) {
  if (block.type !== 'callout') return false;
  const text = blockPlain(block).trim();
  const name = (pageName || '').replace(/\s+/g, ' ');
  if (name && new RegExp('^\\*\\*' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\.\\*\\*', 'i').test(text)) return true;
  return block.callout && block.callout.color === 'blue_bg' && /^\*\*[^*]{1,40}\.\*\*/.test(text);
}

function isInternalCallout(text) {
  return /internal note|before site deployment|not published|site sync of the core/i.test(text);
}

function calloutKind(block, text) {
  const icon = block.callout && block.callout.icon;
  const emoji = icon && icon.type === 'emoji' ? icon.emoji : '';
  if (isInternalCallout(text)) return 'skip';
  if (emoji === '🗣️' || /^(?:\*\*)?(Who speaks|A naming note)/i.test(text)) return 'voice';
  if (emoji === '💰' || /What it means for your household/i.test(text)) return 'money';
  if (emoji === '⚖️' || /^(?:\*\*)?Straight goods/i.test(text)) return 'straight';
  return 'note';
}

function isGroupLabel(text) {
  const t = text.trim();
  const m = t.match(/^\*\*([^*]+)\*\*$/);
  if (!m) return false;
  const inner = m[1].trim();
  if (inner.length > 60) return false;
  if (/[.!?]/.test(inner)) return false;
  return true;
}

function taglineFromHero(text, name) {
  let t = text.replace(/\\\$/g, '$').replace(/\s+/g, ' ').trim();
  t = t.replace(/^\*\*([^*]+)\.\*\*\s*/, (all, n) => {
    if (!name || n.replace(/[–—]/g, '-') === name.replace(/[–—]/g, '-')) return '';
    return all;
  });
  return t.replace(/^\*\*|\*\*$/g, '').trim();
}

function finishHeading(text) {
  const raw = text.trim();
  if (/^Victoria 2030\b/i.test(raw) && !/\|\|/.test(raw)) return raw + ' ||Victoria 2030';
  return raw;
}

function blocksToBody(blocks, pageName) {
  const lines = [];
  let skippedHero = false;
  let listN = 0;

  const pushBlank = () => {
    if (lines.length && lines[lines.length - 1] !== '') lines.push('');
  };

  for (const block of blocks) {
    const type = block.type;
    if (type === 'table_of_contents' || type === 'child_page' || type === 'unsupported' || type === 'divider') continue;
    if (type !== 'numbered_list_item') listN = 0;

    if (type === 'callout') {
      const text = blockPlain(block).replace(/\\\$/g, '$').trim();
      if (!text) continue;
      if (!skippedHero && isHeroCallout(block, pageName)) { skippedHero = true; continue; }
      const kind = calloutKind(block, text);
      if (kind === 'skip') continue;
      pushBlank();
      lines.push(':::' + kind);
      lines.push(text);
      lines.push(':::');
      pushBlank();
      continue;
    }

    if (type === 'heading_1' || type === 'heading_2') {
      pushBlank();
      lines.push('## ' + finishHeading(blockPlain(block)));
      continue;
    }
    if (type === 'heading_3' || type === 'heading_4') {
      pushBlank();
      lines.push('#### ' + blockPlain(block).trim());
      continue;
    }
    if (type === 'bulleted_list_item') {
      lines.push('- ' + blockPlain(block).replace(/\\\$/g, '$').replace(/\n/g, ' '));
      continue;
    }
    if (type === 'numbered_list_item') {
      listN += 1;
      lines.push(listN + '. ' + blockPlain(block).replace(/\\\$/g, '$').replace(/\n/g, ' '));
      continue;
    }
    if (type === 'paragraph') {
      const text = blockPlain(block).replace(/\\\$/g, '$').trim();
      if (!text) { pushBlank(); continue; }
      if (isGroupLabel(text)) {
        pushBlank();
        lines.push('#### ' + text.replace(/^\*\*|\*\*$/g, '').trim());
        continue;
      }
      pushBlank();
      lines.push(text);
      continue;
    }
    /* Anything else with text: keep it as a paragraph rather than drop it.
       Dropping a citation would look like a remap. */
    const fallback = blockPlain(block).replace(/\\\$/g, '$').trim();
    if (fallback) {
      pushBlank();
      lines.push(fallback);
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function pageTitle(page) {
  const props = page.properties || {};
  for (const key of Object.keys(props)) {
    const p = props[key];
    if (p && p.type === 'title') return (p.title || []).map((t) => t.plain_text).join('');
  }
  return (page.child_page && page.child_page.title) || '';
}

function pageEmoji(page) {
  const icon = page.icon;
  if (icon && icon.type === 'emoji') return icon.emoji;
  return '';
}

function slugFromTitle(title) {
  const head = String(title).split(/[—–-]/)[0].trim();
  for (const [re, slug] of SLUG_FROM_TITLE) if (re.test(head)) return slug;
  return head.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assocFromBody(body) {
  const m = body.match(/\[([^\]]+)\]\((https?:[^)]+)\)/);
  if (!m) return {};
  return { assoc: m[1], assocurl: m[2] };
}

/* View-markdown path: used by tests, and as a documented last resort if a
   page was saved from Notion's own view. Same dump rules as the API path.
   Not a second architecture — the generators still read neighbourhoods.md. */
function bodyFromViewMarkdown(raw, pageName) {
  let src = String(raw);
  const content = src.match(/<content>([\s\S]*?)<\/content>/);
  if (content) src = content[1];
  src = src.replace(/\r\n/g, '\n').replace(/\\\$/g, '$');

  const lines = [];
  const pushBlank = () => { if (lines.length && lines[lines.length - 1] !== '') lines.push(''); };
  let i = 0;
  const rows = src.split('\n');
  let skippedHero = false;

  while (i < rows.length) {
    const row = rows[i];
    const trimmed = row.trim();

    if (/^<page[\s>]/.test(trimmed) || /^<\/page>/.test(trimmed)) { i++; continue; }
    if (/^<(ancestor-path|properties|empty-block)/.test(trimmed)) {
      while (i < rows.length && !/^<\/(ancestor-path|properties)>/.test(rows[i].trim()) && !/^<empty-block/.test(trimmed)) i++;
      i++; continue;
    }

    if (/^<callout\b/.test(trimmed)) {
      const open = trimmed;
      const buf = [];
      i++;
      while (i < rows.length && !/^<\/callout>/.test(rows[i].trim())) {
        buf.push(rows[i].replace(/^\t/, ''));
        i++;
      }
      i++; // closing
      const text = buf.join('\n').replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+>/g, '').replace(/\\\$/g, '$').trim();
      if (!text) continue;
      const icon = (open.match(/icon="([^"]+)"/) || [])[1] || '';
      const color = (open.match(/color="([^"]+)"/) || [])[1] || '';
      const fake = { type: 'callout', callout: { icon: { type: 'emoji', emoji: icon }, color } };
      if (!skippedHero && (isHeroCallout(fake, pageName) || (color === 'blue_bg' && /^\*\*[^*]{1,40}\.\*\*/.test(text)))) {
        skippedHero = true;
        continue;
      }
      const kind = calloutKind(fake, text);
      if (kind === 'skip') continue;
      pushBlank();
      lines.push(':::' + kind);
      lines.push(text);
      lines.push(':::');
      pushBlank();
      continue;
    }

    if (/^## /.test(trimmed)) {
      pushBlank();
      lines.push('## ' + finishHeading(trimmed.slice(3)));
      i++; continue;
    }
    if (/^### /.test(trimmed) || /^#### /.test(trimmed)) {
      pushBlank();
      lines.push('#### ' + trimmed.replace(/^#+\s*/, ''));
      i++; continue;
    }
    if (/^- /.test(trimmed)) {
      lines.push('- ' + trimmed.slice(2).replace(/\\\$/g, '$'));
      i++; continue;
    }
    if (/^\d+\. /.test(trimmed)) {
      lines.push(trimmed.replace(/\\\$/g, '$'));
      i++; continue;
    }
    if (!trimmed) { pushBlank(); i++; continue; }
    if (/^---+$/.test(trimmed) || /^<table_of_contents/.test(trimmed)) { i++; continue; }

    const text = trimmed.replace(/\\\$/g, '$');
    if (isGroupLabel(text)) {
      pushBlank();
      lines.push('#### ' + text.replace(/^\*\*|\*\*$/g, '').trim());
      i++; continue;
    }
    pushBlank();
    lines.push(text);
    i++;
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function tokenHelp() {
  return [
    'No Notion token in the environment.',
    '',
    'This script talks to the official Notion API. Set one of:',
    '  NOTION_TOKEN',
    '  NOTION_API_KEY',
    '',
    'Create an internal integration at https://www.notion.so/my-integrations',
    'and share the neighbourhood hub with it (child pages inherit):',
    '  Hub:            https://app.notion.com/p/' + PAGES.hub,
    '  Program:        https://app.notion.com/p/' + PAGES.program + '  (read-only; never written)',
    '  Neighbourhoods: https://app.notion.com/p/' + PAGES.neighbourhoods,
    '',
    'Neighbourhood pages this export reads:',
    ...Object.entries(PAGES.neighbourhood).map(([slug, id]) => '  ' + slug + '  https://app.notion.com/p/' + id),
    '',
    'The Program is listed so you can share it if you want last-edited metadata',
    'in the diff. The exporter will not write measures.js from it.',
  ].join('\n');
}

function snapshotMeasures() {
  return sha256(fs.readFileSync(MEASURES_JS));
}

function assertMeasuresUntouched(before) {
  const after = snapshotMeasures();
  if (after !== before) {
    die('Aborting: measures.js changed during export. Restoring is on you — this script does not write that file, so something else did.');
  }
}

function buildDiff(prevEntries, nextEntries, meta) {
  const prevBy = Object.fromEntries(prevEntries.map((e) => [e.slug, e]));
  const nextBy = Object.fromEntries(nextEntries.map((e) => [e.slug, e]));
  const slugs = [...new Set([...Object.keys(prevBy), ...Object.keys(nextBy)])].sort();
  const pages = {};
  for (const slug of slugs) {
    const prev = prevBy[slug];
    const next = nextBy[slug];
    if (!prev) {
      pages[slug] = { status: 'added', measures: measureIds(next.body), figures: figures(next.body) };
      continue;
    }
    if (!next) {
      pages[slug] = { status: 'removed', measures: measureIds(prev.body), figures: figures(prev.body) };
      continue;
    }
    const oldM = measureIds(prev.body);
    const newM = measureIds(next.body);
    const oldF = figures(prev.body);
    const newF = figures(next.body);
    const added = newM.filter((m) => !oldM.includes(m));
    const removed = oldM.filter((m) => !newM.includes(m));
    const figAdded = newF.filter((f) => !oldF.includes(f));
    const figRemoved = oldF.filter((f) => !newF.includes(f));
    const bodyChanged = prev.body.trim() !== next.body.trim();
    pages[slug] = {
      status: bodyChanged || added.length || removed.length ? 'changed' : 'unchanged',
      bodyChanged,
      measuresAdded: added,
      measuresRemoved: removed,
      figuresAdded: figAdded,
      figuresRemoved: figRemoved,
    };
  }
  return {
    exportedAt: new Date().toISOString(),
    comparedTo: 'HEAD:build/neighbourhoods.md',
    source: {
      hub: 'https://app.notion.com/p/' + PAGES.neighbourhoods,
      program: 'https://app.notion.com/p/' + PAGES.program,
      pages: Object.fromEntries(Object.entries(PAGES.neighbourhood).map(([k, id]) => [k, 'https://app.notion.com/p/' + id])),
    },
    program: { touched: false, reason: 'exporter does not write measures.js' },
    pages,
    ...meta,
  };
}

async function pullNeighbourhoods(tok) {
  const pulled = [];
  /* Prefer the hub's child pages so a newly added neighbourhood is not
     silently dropped. Fall back to the catalog if the hub listing fails. */
  let children = [];
  try {
    const blocks = await notionPaginate('/blocks/' + dashedId(PAGES.neighbourhoods) + '/children', tok);
    children = blocks.filter((b) => b.type === 'child_page');
  } catch (err) {
    console.error('Hub child listing failed (' + err.message + '); using the catalog of 13.');
  }

  const jobs = [];
  if (children.length) {
    for (const child of children) {
      const title = child.child_page.title;
      const slug = slugFromTitle(title);
      jobs.push({ id: child.id, slug, title });
    }
  } else {
    for (const [slug, id] of Object.entries(PAGES.neighbourhood)) {
      jobs.push({ id, slug, title: slug });
    }
  }

  for (const job of jobs) {
    const page = await notionGet('/pages/' + dashedId(job.id), tok);
    const name = pageTitle(page).replace(/\s+[—–-]\s+Victoria 2030.*$/i, '').trim() || job.title;
    const emoji = pageEmoji(page);
    const blocks = await fetchBlocks(page.id, tok);
    const body = blocksToBody(blocks, name);
    const taglineBlock = blocks.find((b) => b.type === 'callout' && isHeroCallout(b, name));
    const tagline = taglineBlock ? taglineFromHero(blockPlain(taglineBlock), name) : '';
    pulled.push({
      slug: slugFromTitle(name) || job.slug,
      name,
      emoji,
      tagline,
      body,
      notionId: page.id.replace(/-/g, ''),
      lastEdited: page.last_edited_time,
    });
  }
  return pulled;
}

function mergeEntries(existing, pulled) {
  const have = Object.fromEntries(existing.map((e) => [e.slug, e]));
  const order = existing.map((e) => e.slug);
  pulled.forEach((p) => { if (!order.includes(p.slug)) order.push(p.slug); });

  const merged = [];
  const skipped = [];

  for (const slug of order) {
    const prev = have[slug];
    const next = pulled.find((p) => p.slug === slug);
    if (!next) {
      if (prev) merged.push(prev);
      continue;
    }
    const assoc = assocFromBody(next.body);
    const draft = {
      slug,
      name: next.name || (prev && prev.name),
      emoji: next.emoji || (prev && prev.emoji),
      tagline: next.tagline || (prev && prev.tagline),
      card: prev ? prev.card : '',
      assoc: (prev && prev.assoc) || assoc.assoc || '',
      assocurl: (prev && prev.assocurl) || assoc.assocurl || '',
      meta: prev ? prev.meta : '',
      official: prev ? prev.official : (slug === 'harris-green' ? 'no' : undefined),
      body: next.body,
    };
    if (!draft.card || !draft.assoc || !draft.assocurl || !draft.meta) {
      throw new Error(slug + ': front matter is missing card/assoc/assocurl/meta and Notion does not carry those fields. Keep them in the committed dump.');
    }
    if (prev) {
      const oldM = measureIds(prev.body).join(' ');
      const newM = measureIds(draft.body).join(' ');
      if (oldM !== newM) {
        skipped.push({
          slug,
          reason: 'dump would rewrite measure IDs; leaving the committed entry',
          measuresAdded: measureIds(draft.body).filter((m) => !measureIds(prev.body).includes(m)),
          measuresRemoved: measureIds(prev.body).filter((m) => !measureIds(draft.body).includes(m)),
        });
        merged.push(prev);
        continue;
      }
    }
    merged.push(draft);
  }
  return { merged, skipped };
}

function writeDiff(diff) {
  fs.writeFileSync(DIFF_PATH, JSON.stringify(diff, null, 2) + '\n');
  console.log('Wrote ' + path.relative(ROOT, DIFF_PATH));
}

function runNode(script) {
  execFileSync(process.execPath, [path.join(__dirname, script)], { stdio: 'inherit' });
}

async function main() {
  const tok = token();
  if (!tok) die(tokenHelp(), 2);

  const measuresBefore = snapshotMeasures();
  const existing = parseMaster(fs.readFileSync(DUMP, 'utf8'));

  console.log('Exporting neighbourhood tree from Notion…');
  const pulled = await pullNeighbourhoods(tok);
  console.log('  pulled ' + pulled.length + ' page(s)');

  const { merged, skipped } = mergeEntries(existing, pulled);
  if (skipped.length) {
    console.error('Leaving committed dump for ' + skipped.length + ' page(s) — a write would change measure IDs:');
    skipped.forEach((s) => {
      console.error('  ' + s.slug + ': +' + (s.measuresAdded.join(', ') || '—') + '  −' + (s.measuresRemoved.join(', ') || '—'));
    });
  }

  const nextDump = serializeDump(merged);
  const prevDump = fs.readFileSync(DUMP, 'utf8');
  if (nextDump !== prevDump) fs.writeFileSync(DUMP, nextDump);
  else console.log('  neighbourhoods.md unchanged');

  const diff = buildDiff(existing, merged, {
    skippedIdRewrites: skipped,
    generatorsRun: [],
    skippedGenerators: ['prerender.js', 'profiles.js', 'matrix.js', 'onepage.js'],
    checklinks: null,
  });

  assertMeasuresUntouched(measuresBefore);

  if (!SKIP_GENERATE) {
    console.log('Running build/neighbourhoods.js…');
    try {
      runNode('neighbourhoods.js');
      diff.generatorsRun.push('neighbourhoods.js');
    } catch (err) {
      diff.generatorsRun.push('neighbourhoods.js');
      diff.neighbourhoodsBuild = { ok: false, error: String(err.status || err.message) };
      writeDiff(diff);
      assertMeasuresUntouched(measuresBefore);
      die('neighbourhoods.js failed. Measure ids were not remapped to make it pass.');
    }
  } else {
    diff.skippedGenerators.push('neighbourhoods.js');
  }

  assertMeasuresUntouched(measuresBefore);

  if (!SKIP_CHECKLINKS) {
    console.log('Running build/checklinks.js…');
    try {
      runNode('checklinks.js');
      diff.checklinks = { ok: true };
      diff.generatorsRun.push('checklinks.js');
    } catch (err) {
      diff.checklinks = { ok: false, error: String(err.status || err.message) };
      diff.generatorsRun.push('checklinks.js');
      writeDiff(diff);
      die('checklinks.js failed. Offenders are on stderr; this script does not fix them by remap.');
    }
  }

  writeDiff(diff);
  assertMeasuresUntouched(measuresBefore);
  console.log('Export finished. Program / measures.js untouched.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  });
}

module.exports = {
  PAGES,
  parseMaster,
  serializeDump,
  measureIds,
  figures,
  blocksToBody,
  bodyFromViewMarkdown,
  mergeEntries,
  taglineFromHero,
  slugFromTitle,
};

/**
 * Profile evidence markup: how-this-grade-was-made, five doors,
 * 12-topic grid, citation panel shell. Does not invent quotes.
 */
"use strict";

const MARK_RULES = {
  Aligned: "They commit to the same instrument the Program names.",
  Close: "They commit to something comparable, not the same tool.",
  "Partial+": "They commit to a target, without naming the instrument.",
  Partial: "They commit to the goal, without a target or a tool.",
  Weak: "They agree it matters, without committing to act.",
  Opposed: "A vote or a sentence that disagrees.",
  Record: "A sourced 2022–26 vote or decision. Shown, not scored.",
  Dash: "No public answer with a URL and a date. Unknown, not a fail.",
};

const MARK_CLS = {
  Aligned: "a",
  Close: "b",
  "Partial+": "pp",
  Partial: "c",
  Weak: "d",
  Opposed: "f",
  Record: "rec",
};

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markChip(mark, kind) {
  if (kind === "dash" || !mark) {
    return '<span class="mk mk-x" aria-hidden="true">—</span>';
  }
  const cls = MARK_CLS[mark] || "x";
  return '<span class="mk mk-' + cls + '">' + esc(mark) + "</span>";
}

function howMadeHtml(c, card) {
  const letterLine = c.letter === "—"
    ? "No letter yet — a letter appears only after five scored answers. A dash is silence, not a fail."
    : "The letter next to the name is the overall grade. The number next to it is how many scored answers that grade rests on.";
  const cardN = card ? card.cardScoredCount : 0;
  const cardNote = card && cardN !== c.n
    ? '<p class="how-note">The 12-topic card below is the evidence you can tap. It is not a second letter, and it does not change the number printed next to the grade.</p>'
    : "";
  const legend = Object.keys(MARK_RULES).map((k) => {
    const cls = k === "Dash" ? "x" : (MARK_CLS[k] || "x");
    return '<button type="button" class="leg mk mk-' + cls + '" data-legend="' + esc(k) +
      '" aria-expanded="false">' + esc(k === "Dash" ? "—" : k) + "</button>";
  }).join("");
  return `
<section class="how" id="how">
<h2>How this grade was made</h2>
<ol class="how-rules">
<li>The same <strong>55 topics</strong> for every candidate.</li>
<li><strong>Actions beat words beat silence.</strong></li>
<li>A mark needs a <strong>URL and a date</strong>. Without both, the cell is a dash — unknown, not a fail.</li>
<li>If they sat on Council this term, a sourced 2022–26 vote or decision beats a 2026 promise.</li>
<li>A letter appears only after <strong>five scored answers</strong>.</li>
</ol>
<p>${letterLine}</p>
${cardNote}
<p class="how-tap">Tap a mark to read the sentence it rests on. Tap a label in the legend for the one-line rule.</p>
<div class="legend-row" role="group" aria-label="Mark legend">${legend}</div>
<p class="leg-rule" id="leg-rule" hidden></p>
</section>`;
}

function doorsHtml(card) {
  if (!card || !card.doors) return "";
  const items = card.doors.map((d) => {
    const st = d.state === "dash" ? "—" : d.state;
    const cls = d.state === "dash" ? "dash" : d.state;
    const body = d.state === "dash"
      ? "<p>No sourced sentence on this door. Silence, not a fail.</p>"
      : (d.sentence
        ? "<p>" + esc(d.sentence) + "</p>"
        : "<p>Sourced door. Open the URL.</p>");
    const link = d.url
      ? '<p class="door-src"><a href="' + esc(d.url) + '" target="_blank" rel="noopener">' +
        esc(d.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]) + "</a>" +
        (d.date ? " · " + esc(d.date) : "") + "</p>"
      : "";
    return `<div class="door door-${cls}">
<div class="door-k">${esc(d.label)}</div>
<div class="door-st">${esc(st)}</div>
${body}
${link}
</div>`;
  }).join("");
  return `
<section class="doors" id="doors">
<h2>The five doors</h2>
<p>A sourced sentence or a fact. Never a second grade.</p>
<div class="door-grid">${items}</div>
</section>`;
}

function cellRow(cell) {
  const dash = cell.kind === "dash";
  const label = dash ? "—" : (cell.mark || "—");
  const cls = dash ? "x" : (MARK_CLS[cell.mark] || "x");
  const tap = dash
    ? 'type="button" class="mk mk-x ev-open" data-n="' + cell.n + '" aria-expanded="false"'
    : 'type="button" class="mk mk-' + cls + ' ev-open" data-n="' + cell.n + '" aria-expanded="false"';
  const flag = cell.flags && cell.flags.length
    ? '<span class="ev-flag" title="' + esc(cell.flags.join("; ")) + '">flag</span>'
    : "";
  return `<li class="ev-row" id="c${cell.n}">
<button ${tap}>${esc(label)}</button>
<span class="ev-m">${esc(cell.measure)}</span>
<span class="ev-w">${esc(cell.what)}</span>
${flag}
</li>`;
}

function topicsHtml(card) {
  if (!card || !card.cells) return "";
  const byTopic = {};
  for (const cell of card.cells) {
    (byTopic[cell.topic] || (byTopic[cell.topic] = [])).push(cell);
  }
  const topics = Object.keys(byTopic).sort((a, b) => +a - +b).map((tid) => {
    const cells = byTopic[tid];
    const scored = cells.filter((c) => c.kind === "scored").length;
    const rec = cells.filter((c) => c.kind === "record").length;
    const name = cells[0].topicName;
    const open = scored > 0 || rec > 0 ? " open" : "";
    const count = scored
      ? scored + " scored"
      : (rec ? rec + " record" : "silence");
    return `<details class="ev-topic" id="topic-${tid}"${open}>
<summary><span class="ev-tn">${esc(tid)}. ${esc(name)}</span><span class="ev-tc">${esc(count)}</span></summary>
<ol class="ev-list">${cells.map(cellRow).join("")}</ol>
</details>`;
  }).join("");
  return `
<section class="ev" id="evidence">
<h2>The 12 topics</h2>
<p>Fifty-five cells. A dash is unknown, not a fail. Record lines are shown and do not add to the scored-answer count.</p>
${topics}
</section>`;
}

function panelHtml() {
  return `
<div id="cite-back" class="cite-back" hidden></div>
<aside id="cite" class="cite" hidden role="dialog" aria-modal="true" aria-labelledby="cite-title">
<button type="button" class="cite-x" id="cite-x" aria-label="Close citation">Close</button>
<p class="cite-kicker" id="cite-kicker"></p>
<h3 class="cite-title" id="cite-title"></h3>
<p class="cite-rule" id="cite-rule"></p>
<p class="cite-measure" id="cite-measure"></p>
<blockquote class="cite-q" id="cite-q"></blockquote>
<p class="cite-why" id="cite-why"></p>
<p class="cite-src" id="cite-src"></p>
<p class="cite-dates" id="cite-dates"></p>
<p class="cite-flag" id="cite-flag" hidden></p>
<p class="cite-fix">See a mistake? Write <a href="mailto:info@acitythatworks.ca">info@acitythatworks.ca</a>. The URL above opens the source.</p>
</aside>`;
}

function evidenceCss() {
  return `
.how,.doors,.ev{margin:28px 0}
.how h2,.doors h2,.ev h2{font-family:'Fraunces',serif;font-size:22px;color:var(--navy);margin:0 0 10px}
.how-rules{margin:0 0 12px;padding-left:20px}
.how-rules li{margin:6px 0;font-size:15px;line-height:1.5}
.how-note{font-size:13.5px;color:#4a4643;background:rgba(26,54,104,.05);border-left:3px solid var(--gold);padding:10px 12px}
.how-tap{font-size:14px;color:#4a4643}
.legend-row{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 6px}
.leg-rule{min-height:1.4em;font-size:14px;color:var(--navy);margin:4px 0 0}
.mk{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;padding:8px 12px;border:0;border-radius:4px;font-family:'Public Sans',sans-serif;font-size:13px;font-weight:600;line-height:1.1;color:#fff;cursor:pointer;text-align:center}
.mk-a{background:#227247}.mk-b{background:#3D6E4E}
.mk-pp{background:#6B7A2A}.mk-c{background:#8B6914}
.mk-d{background:#B5651F}.mk-f{background:#B5341F}
.mk-rec{background:var(--navy)}.mk-x{background:#8a8580;color:#fff}
.mk:focus-visible,.leg:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
.door-grid{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:720px){.door-grid{grid-template-columns:1fr 1fr}}
.door{border:1px solid rgba(26,54,104,.14);border-left:4px solid var(--navy);padding:12px 14px;background:#fff;border-radius:2px}
.door-said{border-left-color:#3D6E4E}.door-record{border-left-color:var(--navy)}
.door-yes{border-left-color:var(--gold)}.door-dash{border-left-color:#c9c4bf}
.door-k{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#6b6664}
.door-st{font-weight:700;color:var(--navy);margin:2px 0 6px}
.door p{margin:0 0 6px;font-size:13.5px;line-height:1.5}
.door-src{font-size:13px}
.ev-topic{border-bottom:1px solid rgba(26,54,104,.1);padding:4px 0}
.ev-topic summary{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:48px;cursor:pointer;list-style:none;font-weight:600;color:var(--navy)}
.ev-topic summary::-webkit-details-marker{display:none}
.ev-tc{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;color:#6b6664;white-space:nowrap}
.ev-list{list-style:none;margin:0 0 10px;padding:0}
.ev-row{display:grid;grid-template-columns:auto minmax(4.5rem,auto) 1fr auto;gap:8px 10px;align-items:center;padding:6px 0;border-top:1px solid rgba(26,54,104,.06)}
.ev-m{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--navy)}
.ev-w{font-size:13.5px;color:#33312e}
.ev-flag{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#8B6914}
.cite-back{position:fixed;inset:0;background:rgba(22,51,92,.42);z-index:40}
.cite{position:fixed;left:0;right:0;bottom:0;z-index:41;background:#FAF7F0;border-top:3px solid var(--gold);padding:18px 18px calc(18px + env(safe-area-inset-bottom));max-height:86vh;overflow:auto;box-shadow:0 -12px 40px rgba(22,51,92,.18)}
@media(min-width:720px){
  .cite{left:auto;right:18px;bottom:18px;width:min(440px,calc(100vw - 36px));max-height:80vh;border:1px solid rgba(26,54,104,.14);border-top:3px solid var(--gold);border-radius:6px}
}
.cite-x{min-height:44px;min-width:72px;padding:8px 14px;border:1px solid var(--navy);background:#fff;color:var(--navy);font-weight:600;cursor:pointer;float:right}
.cite-kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#6b6664;margin:8px 0 0}
.cite-title{font-family:'Fraunces',serif;font-size:26px;color:var(--navy);margin:4px 0 6px}
.cite-rule,.cite-measure,.cite-why,.cite-src,.cite-dates,.cite-fix{font-size:14px;line-height:1.5;margin:8px 0}
.cite-q{margin:12px 0;padding:10px 12px;border-left:3px solid var(--gold);background:#fff;font-size:15.5px;line-height:1.55;color:#1a1a18}
.cite-flag{font-size:13px;color:#8B6914}
.vintage{margin:32px 0 12px;border-top:1px solid rgba(26,54,104,.12);padding-top:12px}
.vintage summary{min-height:44px;cursor:pointer;font-weight:600;color:var(--navy)}
@media(max-width:719px){
  .ev-row{grid-template-columns:auto 1fr;grid-template-areas:"mk m" "mk w" "mk f"}
  .ev-row .mk{grid-area:mk}
  .ev-m{grid-area:m}
  .ev-w{grid-area:w}
  .ev-flag{grid-area:f}
}
`;
}

module.exports = {
  MARK_RULES,
  MARK_CLS,
  howMadeHtml,
  doorsHtml,
  topicsHtml,
  panelHtml,
  evidenceCss,
  esc,
};

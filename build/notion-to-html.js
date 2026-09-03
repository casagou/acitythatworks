/* Convert a 1 Sep Notion Candidate Profiles toggle (markdown) into the
   field HTML used on /profiles/<slug>. July Aligned / Close / Partial /
   Opposed buckets are dropped so they are not printed as current grades.
   Do not invent: only the toggle text is transferred. */
"use strict";

/* Hosts a site visitor cannot reach. Their labels stay, their links go. */
const PRIVATE_HOST = /^https?:\/\/(?:[a-z0-9-]+\.)*notion\.(?:so|com|site)\//i;

const JULY_BUCKET = /^(?:✅\s*Aligned|🟢\s*Close|🟡\s*Partial|❌\s*Opposed)\b/;

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(md) {
  let s = md.replace(/\\\$/g, "$");
  const links = [];
  s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, (_, text, href) => {
    const i = links.length;
    /* Notion links point into a private workspace. A reader who follows one
       gets a login wall, which is the opposite of what a page promising
       traceable evidence should do — and the rating card they name is already
       rendered in full further down this same page. Keep the label, drop the
       dead link. */
    links.push(
      PRIVATE_HOST.test(href)
        ? '<span class="src-int">' + inlineNoLinks(text) + "</span>"
        : '<a href="' + href.replace(/"/g, "&quot;") + '" target="_blank" rel="noopener">' +
          inlineNoLinks(text) + "</a>"
    );
    return "\u0000L" + i + "\u0000";
  });
  s = inlineNoLinks(s);
  s = s.replace(/\u0000L(\d+)\u0000/g, (_, i) => links[+i]);
  return s;
}

function inlineNoLinks(s) {
  const parts = [];
  const stash = (html) => {
    parts.push(html);
    return "\u0000B" + (parts.length - 1) + "\u0000";
  };
  /* Bold first, and non-greedy over any character, because a bold span may
     contain an italic one — "**a *b* c**". The old pattern was [^*]+, which
     stops at the nested asterisk, so the italic inside was matched on its own
     and its placeholder was never substituted back. That wrote a literal NUL
     into the page (profiles/cseszko.html carried two, committed). Italics
     inside a bold span are resolved on already-escaped text, so the result
     carries no placeholder of its own. */
  const emEsc = (t) => esc(t).replace(/\*([^*]+)\*/g, (_, x) => "<em>" + x + "</em>");
  s = s.replace(/\*\*([\s\S]+?)\*\*/g, (_, t) => stash("<strong>" + emEsc(t) + "</strong>"));
  s = s.replace(/\*([^*]+)\*/g, (_, t) => stash("<em>" + esc(t) + "</em>"));
  s = esc(s);
  return s.replace(/\u0000B(\d+)\u0000/g, (_, n) => parts[+n]);
}

function fieldClass(label) {
  if (/^📋/.test(label) || /Accountability|Correction|Contested|Campaign-compliance/i.test(label)) {
    return "tone-rec";
  }
  if (/^⚪/.test(label) || /^Still\b/i.test(label)) return "tone-none";
  if (/What would move it/i.test(label)) return "tone-move";
  return "";
}

function cleanLabel(raw) {
  return raw.replace(/[:.]+$/, "").trim();
}

function notionToHtml(md, slug) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (/^\d+\.\s+\*\*/.test(line.trim()) || /^\d+\.\s+/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    if (/^[-*]\s+/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    const labeled = line.trim().match(/^\*\*([^*]+)\*\*\s*(.*)$/);
    if (labeled) {
      const label = cleanLabel(labeled[1]);
      let rest = labeled[2] || "";
      i++;
      if (JULY_BUCKET.test(label)) {
        while (i < lines.length && lines[i].trim() && !lines[i].trim().match(/^\*\*[^*]+\*\*/)) i++;
        continue;
      }
      while (i < lines.length && lines[i].trim() &&
             !lines[i].trim().match(/^\*\*[^*]+\*\*/) &&
             !/^[-*]\s+/.test(lines[i].trim()) &&
             !/^\d+\.\s+/.test(lines[i].trim())) {
        rest += (rest ? " " : "") + lines[i].trim();
        i++;
      }
      blocks.push({ type: "field", label, text: rest });
      continue;
    }
    /* Continuation / unlabeled paragraph. */
    let para = line.trim();
    i++;
    while (i < lines.length && lines[i].trim() &&
           !lines[i].trim().match(/^\*\*[^*]+\*\*/) &&
           !/^[-*]\s+/.test(lines[i].trim()) &&
           !/^\d+\.\s+/.test(lines[i].trim())) {
      para += " " + lines[i].trim();
      i++;
    }
    blocks.push({ type: "p", text: para });
  }

  /* Attach numbered/bullet lists that immediately follow a field to that field. */
  const merged = [];
  for (let b = 0; b < blocks.length; b++) {
    const cur = blocks[b];
    if ((cur.type === "ol" || cur.type === "ul") && merged.length && merged[merged.length - 1].type === "field") {
      merged[merged.length - 1].list = cur;
      continue;
    }
    merged.push(cur);
  }

  const html = [];
  for (const b of merged) {
    if (b.type === "field") {
      const cls = fieldClass(b.label);
      html.push(
        '<p class="pf ' + cls + '"><strong class="pfl">' + esc(b.label) + ".</strong> " +
        inline(b.text) + "</p>"
      );
      if (b.list) {
        const tag = b.list.type;
        html.push("<" + tag + ">");
        for (const item of b.list.items) html.push("<li>" + inline(item) + "</li>");
        html.push("</" + tag + ">");
      }
    } else if (b.type === "p") {
      html.push("<p class=\"pf \">" + inline(b.text) + "</p>");
    } else if (b.type === "ol" || b.type === "ul") {
      html.push("<" + b.type + ">");
      for (const item of b.items) html.push("<li>" + inline(item) + "</li>");
      html.push("</" + b.type + ">");
    }
  }

  let out = html.join("");
  if (slug === "harris" && !/not an ACTW endorsement/i.test(out)) {
    out = out.replace(
      /(Political and electoral history\.<\/strong>[\s\S]*?<\/p>)/,
      "$1<p class=\"pf \">The Conservative runs are sourced record, not an ACTW endorsement.</p>"
    );
  }
  return out;
}

module.exports = { notionToHtml };

/* A City That Works — hub.js (v3)
   -----------------------------------------------------------------------
   What the field table calls, plus the hero meter. Built from the same
   payload the scorecard grid is built from (window.ACTW_SC, written by
   build/matrix.js). Nothing here computes a grade.

   Until v3 this file also rendered twenty always-open cards under the
   table. Every fact on a card — the letter and its coverage, the five
   doors with their sentences and dates, the summary, the channels — is
   already in the panel that opens under a row, so the grid was a second
   copy of the same list and cost half the page on a phone. Two things
   only existed on a card, so those two stayed and the table drives them:

     compare — two candidates' existing cells side by side, and the topics
       where their recorded marks differ, each with the sentence the
       scorecard already holds for it.
     ask — the ready-written question for a door that is still blank.

   "What matters to me" also lives here, because it is a rule and not a
   widget: it counts answered measures in the chosen topics and never
   averages their marks. glance.js reads it through window.ACTW_HUB so
   there is one definition of it on the page. */
(function () {
  'use strict';
  var DATA = window.ACTW_SC;
  if (!DATA || !DATA.cands) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmt2(x) { return (x < 0 ? '−' : '') + Math.abs(x).toFixed(2); }

  var rows = (DATA.door && DATA.door.rows) || [];
  var cells = (DATA.door && DATA.door.cells) || {};
  function doorState(c, row) {
    var cell = (cells[c.key] || {})[row.key] || { state: 'dash' };
    var st = cell.state || 'dash';
    if (st === 'said+record' || st === 'said') return { cls: 'said', label: 'said', cell: cell };
    if (st === 'record') return { cls: 'norec', label: 'record', cell: cell };
    if (st === 'yes' || st === 'published') return { cls: 'pub', label: 'yes', cell: cell };
    return { cls: 'dash', label: '—', cell: cell };
  }
  function shortLabel(r) {
    var s = (r.label || r.key).replace(/\s*\([^)]*\)\s*$/, '');
    if (/^A written program/i.test(s)) return 'Program';
    if (/^Downtown/i.test(s)) return 'Downtown';
    if (/^Housing/i.test(s)) return 'Housing';
    if (/^Household/i.test(s)) return 'Household bill';
    if (/^Tax/i.test(s)) return 'Tax cap';
    return s;
  }
  function measureOf(r) { var m = (r.label || '').match(/\(([^)]+)\)/); return m ? m[1] : ''; }
  function answered(c) { var n = 0; rows.forEach(function (r) { if (doorState(c, r).cls !== 'dash') n++; }); return n; }
  var cols = DATA.cols || [];
  var areaCols = cols.filter(function (k) { return k.topics; });

  /* "What matters to me" counts answers in the chosen topics — it does not
     average their marks. Decision 14 gives a topic no letter and publishes no
     mean, so a weighted average would be a grade this page invented. The count
     is a fact the cards already carry: how much of what you picked they have
     answered, out of how many measures sit in it. */
  function weighted(c, keys) {
    var n = 0, total = 0;
    keys.forEach(function (k) {
      var g = (DATA.colGrid[c.key] || {})[k];
      if (!g) return;
      n += g.n || 0;
      total += g.total || 0;
    });
    return total ? { n: n, total: total } : null;
  }

  var picks = [];
  /* Campaign sites, from candidates-lite.json (build/candidates-lite.js reads
     them out of the profiles master). Arrives after the first render; the
     cards are drawn again once it does. */
  var WEB = {};
  if (window.fetch) {
    fetch('candidates-lite.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.cands) return;
      d.cands.forEach(function (c) { if (c.web) WEB[c.key] = c.web; });
    }).catch(function () {});
  }
  function siteLabel(url) { return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); }

  /* ---- compare two ------------------------------------------------------- */
  function renderCompare() {
    var box = $('#hub-compare');
    if (!box) return;
    if (picks.length < 2) {
      box.innerHTML = picks.length === 1 ? '<p class="cp-empty">Tick one more candidate to compare them side by side.</p>' : '';
      return;
    }
    var a = DATA.cands.filter(function (c) { return c.key === picks[0]; })[0];
    var b = DATA.cands.filter(function (c) { return c.key === picks[1]; })[0];
    if (!a || !b) { box.innerHTML = ''; return; }
    /* A topic cell compares how much each has answered, never a letter. */
    function cell(c, col) {
      var g = (DATA.colGrid[c.key] || {})[col.key] || { state: 'empty', n: 0, total: 0 };
      if (g.state === 'record') return '<span class="cpc"><span class="n">record only</span></span>';
      if (!g.n) return '<span class="cpc"><span class="n">—</span></span>';
      return '<span class="cpc"><b class="cpn">' + g.n + '</b><span class="n">of ' + g.total + ' answered</span></span>';
    }
    var h = '<div class="cp-h"><h3>' + esc(a.name) + ' and ' + esc(b.name) + ', side by side</h3><button type="button" class="cp-x" id="cp-clear">Clear</button></div>';
    h += '<p class="hub-sub">Overall: ' + esc(a.name) + ' ' + (a.grade ? esc(a.grade) : '—') + ' · ' + esc(b.name) + ' ' + (b.grade ? esc(b.grade) : '—') + '. This is not an endorsement.</p>';
    h += '<div class="tbl-wrap"><table><thead><tr><th>Area</th><th class="c">' + esc(a.name) + '</th><th class="c">' + esc(b.name) + '</th></tr></thead><tbody>';
    cols.forEach(function (col) {
      var ga = (DATA.colGrid[a.key] || {})[col.key] || {}, gb = (DATA.colGrid[b.key] || {})[col.key] || {};
      var diff = (ga.grade || ga.state) !== (gb.grade || gb.state);
      h += '<tr' + (diff && (ga.n || gb.n) ? ' class="diff"' : '') + '><td>' + esc(col.label) + '</td><td class="c">' + cell(a, col) + '</td><td class="c">' + cell(b, col) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    /* topics where both hold a scored mark and the marks differ */
    var ai = DATA.cands.map(function (c) { return c.key; }).indexOf(a.key);
    var bi = DATA.cands.map(function (c) { return c.key; }).indexOf(b.key);
    var difs = [];
    DATA.topics.forEach(function (t, ti) {
      var va = DATA.grid[ti][ai], vb = DATA.grid[ti][bi];
      var sa = va !== '.' && va !== 'R', sb = vb !== '.' && vb !== 'R';
      if (sa && sb && parseFloat(va) !== parseFloat(vb)) difs.push({ t: t, va: parseFloat(va), vb: parseFloat(vb), ea: DATA.ev[ti + '|' + a.key], eb: DATA.ev[ti + '|' + b.key] });
    });
    function markName(v) { var m = null; for (var k in DATA.marks) { if (DATA.marks[k].value === v) m = DATA.marks[k]; } return m ? m.label : String(v); }
    h += '<div class="cp-diffs"><h4>' + (difs.length ? difs.length + ' topic' + (difs.length > 1 ? 's' : '') + ' where both have a recorded mark and the marks differ' : 'No topic where both hold a recorded mark and the marks differ') + '</h4>';
    difs.forEach(function (d) {
      h += '<div class="dif"><span class="t">' + esc(d.t.id) + ' · ' + esc(d.t.label) + '</span><br>' +
        '<span class="m">' + esc(a.name.split(' ').slice(-1)[0]) + ' ' + esc(markName(d.va)) + ' ' + fmt2(d.va) + '</span>' + (d.ea ? '<span class="ev">' + d.ea + '</span>' : '') +
        '<span class="m" style="margin-top:6px">' + esc(b.name.split(' ').slice(-1)[0]) + ' ' + esc(markName(d.vb)) + ' ' + fmt2(d.vb) + '</span>' + (d.eb ? '<span class="ev">' + d.eb + '</span>' : '') + '</div>';
    });
    h += '<p class="hub-note">Only topics where <em>both</em> candidates hold a scored mark are listed: silence is never scored, so a topic one of them has not addressed is not a difference, it is a blank. <a href="#how-we-grade">How a mark is decided.</a></p></div>';
    box.innerHTML = '<div class="cmp-panel">' + h + '</div>';
    $('#cp-clear').addEventListener('click', function () {
      picks = [];
      renderCompare();
      document.dispatchEvent(new CustomEvent('actw:picks', { detail: [] }));
    });
    box.scrollIntoView({ block: 'nearest' });
  }

  /* ---- ask your candidate ------------------------------------------------ */
  function askText(c, r) {
    var m = measureOf(r);
    var url = 'https://acitythatworks.ca/measures' + (m ? '#' + m.split('/')[0].trim().toLowerCase().replace(/\s+/g, '') : '');
    return 'Hi ' + c.name.split(' ')[0] + ',\n\nA City That Works publishes who has a written answer on five questions, and yours on "' + (r.label || '') + '" is still blank. Where do you stand, in writing? The measure is here: ' + url + '\n\nThank you — a Victoria voter';
  }
  function openAsk(c, r) {
    closeAsk();
    var pop = document.createElement('div');
    pop.className = 'ask-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Ask ' + c.name + ' for a written answer');
    var text = askText(c, r);
    var site = WEB[c.key] || c.web || null;
    var web = site ? '<a href="' + esc(site) + '" target="_blank" rel="noopener">Open ' + esc(siteLabel(site)) + '</a>' : '';
    var x = 'https://x.com/intent/post?text=' + encodeURIComponent('@YYJThatWorks asks: where does ' + c.name + ' stand, in writing, on ' + (r.label || '') + '? https://acitythatworks.ca/scorecard');
    pop.innerHTML = '<button type="button" class="ax" aria-label="Close">Close</button><h4>Ask ' + esc(c.name) + ' for a written answer</h4>' +
      '<div class="hub-sub">' + esc(r.label || '') + ' is a blank on the scorecard. Blanks fill in as answers arrive; a dash is unknown, not a fail.</div>' +
      '<textarea aria-label="The question, ready to send">' + esc(text) + '</textarea>' +
      '<div class="aa"><button type="button" class="pri" id="ask-copy">Copy the question</button>' + web +
      '<a href="' + esc(x) + '" target="_blank" rel="noopener">Post on X</a>' +
      '<a href="mailto:info@acitythatworks.ca?subject=' + encodeURIComponent('Written answer from ' + c.name + ' on ' + (r.label || '')) + '">Send us their answer</a></div>' +
      '<p class="an">When a candidate answers with a citable source, the mark changes and the change is dated. Write to info@acitythatworks.ca with the source.</p>';
    document.body.appendChild(pop);
    $('.ax', pop).addEventListener('click', closeAsk);
    $('#ask-copy', pop).addEventListener('click', function () {
      var b = this, ta = $('textarea', pop);
      var done = function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy the question'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); });
      else ta.select();
    });
    $('.ax', pop).focus();
  }
  function closeAsk() { var p = $('.ask-pop'); if (p) p.remove(); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAsk(); });

  /* ---- the hero meter ---------------------------------------------------- */
  var all = DATA.cands.length, ans = DATA.cands.filter(function (c) { return answered(c) > 0; }).length;
  var meterHost = $('#hub-meter');
  if (meterHost) {
    meterHost.innerHTML = '<div class="hc-l"><b data-count>' + ans + '</b> of ' + all + ' candidates have a written answer on at least one of the five questions</div><div class="meter big"><i data-w="' + Math.round(ans / all * 100) + '"></i></div>';
  }

  /* ---- the API the field table drives ------------------------------------
     This file used to render twenty always-open cards below the table. Every
     fact on a card — the letter, its coverage, the five doors with their
     sentences and dates, the summary, the channels — is already in the panel
     that opens under a row, so the cards were a second copy of the list:
     13,897px of one on a phone, about half the page. What only lived on a
     card was compare and ask, so those two stay here and the table calls
     them. Nothing about how a grade is read has changed. */
  function byKey(k) { return DATA.cands.filter(function (c) { return c.key === k; })[0]; }

  window.ACTW_HUB = {
    /* Tick a candidate for the side-by-side. Two at a time: a third pushes
       the oldest out, which is what the panel can actually show. */
    togglePick: function (key) {
      if (picks.indexOf(key) > -1) picks = picks.filter(function (x) { return x !== key; });
      else { picks.push(key); if (picks.length > 2) picks = picks.slice(-2); }
      renderCompare();
      return picks.slice();
    },
    picks: function () { return picks.slice(); },
    clearPicks: function () { picks = []; renderCompare(); },
    /* A blank door is an invitation, not a verdict — this opens the
       ready-written question for it. */
    ask: function (candKey, rowKey) {
      var c = byKey(candKey);
      var r = rows.filter(function (x) { return x.key === rowKey; })[0];
      if (c && r) openAsk(c, r);
    },
    /* "What matters to me" — one definition of the rule, used by the table.
       It counts answered measures inside the chosen topics; it does not
       average their marks, because Decision 14 gives a topic no letter and
       no mean, and a weighted average would be a grade the page invented. */
    topics: function () { return areaCols.map(function (k) { return { key: k.key, label: k.label }; }); },
    weighted: weighted,
    web: function (key) { return WEB[key] || null; },
    siteLabel: siteLabel
  };
  document.dispatchEvent(new CustomEvent('actw:hub-ready'));
})();

/* A City That Works — hub.js (v2.3)
   -----------------------------------------------------------------------
   The candidates hub: one card per person, built from the same payload the
   scorecard grid is built from (window.ACTW_SC, written by build/matrix.js).
   Nothing here computes a grade. The overall grade, its mean and its n are
   copied from the payload; the five doors are read from the door data; the
   "what matters to me" ordering is an arithmetic mean of area means the
   payload already carries, and the page says so beside every reordered
   card. Compare shows two candidates' existing cells side by side and the
   topics where their recorded marks differ, each with the sentence the
   scorecard already holds for it. */
(function () {
  'use strict';
  var DATA = window.ACTW_SC;
  if (!DATA || !DATA.cands) return;
  var ICONS = window.ACTW_ICONS || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function icon(name, cls) { var svg = ICONS[name] || ''; return cls ? svg.replace('class="picon"', 'class="picon ' + cls + '"') : svg; }
  function gradeCls(g) { if (!g) return 'x'; var c = g[0].toLowerCase(); return 'abcdf'.indexOf(c) > -1 ? c : 'x'; }
  function initials(name) { return name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
  function isMayor(c) { return String(c.office || '').toLowerCase() === 'mayor'; }
  function profileHref(c) { return c.profile ? String(c.profile).replace(/^profiles\.html/, '/profiles') : null; }
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
  /* The strongest sentence: the first door that carries a sourced note. */
  function bestSaid(c) {
    for (var i = 0; i < rows.length; i++) {
      var d = doorState(c, rows[i]);
      if (d.cls === 'said' && d.cell.note) return { note: d.cell.note, url: d.cell.url, date: d.cell.date, row: rows[i] };
    }
    return null;
  }
  var cols = DATA.cols || [];
  var areaCols = cols.filter(function (k) { return k.topics; });

  /* Weighted ordering for "what matters to me": the mean of the marks in
     the chosen areas, which is Σ(mean × n) / Σn over the area cells the
     payload already holds. Shown as a number with its n, never as a
     letter, because a letter would read as a grade this page invented. */
  function weighted(c, keys) {
    var sum = 0, n = 0;
    keys.forEach(function (k) {
      var g = (DATA.colGrid[c.key] || {})[k];
      if (g && g.n) { sum += g.mean * g.n; n += g.n; }
    });
    return n ? { mean: sum / n, n: n } : null;
  }

  var host = $('#hub');
  if (!host) return;
  var picks = [];
  var wm = [];
  var sortKey = 'grade';
  /* Campaign sites, from candidates-lite.json (build/candidates-lite.js reads
     them out of the profiles master). Arrives after the first render; the
     cards are drawn again once it does. */
  var WEB = {};
  if (window.fetch) {
    fetch('candidates-lite.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.cands) return;
      d.cands.forEach(function (c) { if (c.web) WEB[c.key] = c.web; });
      if (Object.keys(WEB).length) render();
    }).catch(function () {});
  }
  function siteLabel(url) { return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); }

  function cardHtml(c) {
    var a = answered(c), said = bestSaid(c), href = profileHref(c);
    var w = wm.length ? weighted(c, wm) : null;
    var h = '<article class="ccard' + (isMayor(c) ? ' mayor' : '') + (picks.indexOf(c.key) > -1 ? ' picked' : '') + '" id="cand-' + esc(c.key) + '" data-key="' + esc(c.key) + '">';
    h += '<span class="avatar' + (isMayor(c) ? ' mayor' : '') + '" aria-hidden="true">' + esc(initials(c.name)) + '</span>';
    h += '<div class="cc-b"><div class="cc-h"><div><div class="cc-name">' + (href ? '<a href="' + esc(href) + '">' + esc(c.name) + '</a>' : esc(c.name)) + '</div>';
    h += '<div class="cc-off">' + esc(c.office || '') + '</div></div>';
    h += '<div class="cc-grade">' + (c.grade
      ? '<span class="gchip g-' + gradeCls(c.grade) + '" title="Overall grade, mean ' + fmt2(c.mean) + ' on ' + c.n + ' of ' + DATA.topics.length + ' topics">' + esc(c.grade) + '</span><small>' + c.n + ' of ' + DATA.topics.length + ' topics</small>'
      : '<span class="gchip g-x" title="No scored position located">—</span><small>not yet scored</small>') + '</div></div>';
    if (w) h += '<div class="cc-wm">On what you chose: <b>' + fmt2(w.mean) + '</b> over ' + w.n + ' scored topic' + (w.n > 1 ? 's' : '') + '</div>';
    h += '<div class="cc-ans"><b>' + a + ' of ' + rows.length + '</b> questions answered in writing</div>';
    h += '<div class="meter"><i data-w="' + Math.round(a / rows.length * 100) + '"></i></div>';
    h += '<div class="cc-doors">';
    rows.forEach(function (r) {
      var d = doorState(c, r), lab = shortLabel(r);
      if (d.cls === 'dash') {
        h += '<button type="button" class="dr dash" data-ask="' + esc(c.key) + '" data-row="' + esc(r.key) + '" title="No written answer yet — ask">' + icon(r.key) + esc(lab) + ' · —</button>';
      } else {
        h += '<button type="button" class="dr ' + esc(d.cls) + '" data-door="' + esc(r.key) + '" data-c="' + esc(c.key) + '" title="' + esc(r.label) + ': ' + esc(d.label) + ' — open the source">' + icon(r.key) + esc(lab) + ' · ' + esc(d.label) + '</button>';
      }
    });
    h += '</div>';
    if (said) {
      h += '<div class="cc-said"><q>' + esc(said.note) + '</q><span class="src">' + esc(shortLabel(said.row)) + (said.date ? ' · ' + esc(said.date) : '') + '</span></div>';
    } else if (a === 0) {
      h += '<div class="cc-said"><span class="src">Nothing located yet on the five questions. Unknown, not a fail.</span></div>';
    }
    h += '<div class="cc-acts">';
    if (href) h += '<a href="' + esc(href) + '">' + icon('program') + 'Profile</a>';
    if (c.grade) h += '<a href="#sc-' + esc(c.key) + '">' + icon('compare') + 'Every area grade</a>';
    if (WEB[c.key]) h += '<a href="' + esc(WEB[c.key]) + '" target="_blank" rel="noopener" title="' + esc(c.name) + '\'s campaign site">' + icon('map') + esc(siteLabel(WEB[c.key])) + '</a>';
    h += '<label class="cc-pick"><input type="checkbox" data-pick="' + esc(c.key) + '"' + (picks.indexOf(c.key) > -1 ? ' checked' : '') + '> Compare</label>';
    h += '</div></div></article>';
    return h;
  }

  function ordered() {
    var list = DATA.cands.slice();
    var byName = function (a, b) { return a.name.localeCompare(b.name); };
    if (sortKey === 'name') return list.sort(byName);
    if (sortKey === 'answered') return list.sort(function (a, b) { var d = answered(b) - answered(a); return d || ((b.mean || -9) - (a.mean || -9)) || byName(a, b); });
    if (sortKey === 'office') return list.sort(function (a, b) { var d = (isMayor(b) ? 1 : 0) - (isMayor(a) ? 1 : 0); return d || ((b.mean || -9) - (a.mean || -9)) || byName(a, b); });
    if (wm.length) return list.sort(function (a, b) {
      var wa = weighted(a, wm), wb = weighted(b, wm);
      if (!wa && !wb) return ((b.mean || -9) - (a.mean || -9)) || byName(a, b);
      if (!wa) return 1; if (!wb) return -1;
      return (wb.mean - wa.mean) || (wb.n - wa.n) || byName(a, b);
    });
    return list.sort(function (a, b) { return ((b.mean == null ? -9 : b.mean) - (a.mean == null ? -9 : a.mean)) || (answered(b) - answered(a)) || byName(a, b); });
  }

  function render() {
    var list = ordered();
    var grid = $('#hub-cards');
    grid.innerHTML = list.map(cardHtml).join('');
    $$('.meter i[data-w]', grid).forEach(function (i) { requestAnimationFrame(function () { i.style.width = i.getAttribute('data-w') + '%'; }); });
    var note = $('#hub-order');
    if (wm.length) {
      var labels = wm.map(function (k) { var c = cols.filter(function (x) { return x.key === k; })[0]; return c ? c.label : k; });
      note.innerHTML = '<strong>Ordered by what you chose:</strong> ' + esc(labels.join(', ')) + '. The figure on each card is the mean of the marks in those areas, with the number of scored topics it rests on. It is your weighting, not a grade; candidates with no scored mark in those areas sit at the bottom.';
    } else {
      var names = { grade: 'overall grade, then how much has been answered', name: 'name', answered: 'how many of the five questions have a written answer', office: 'office, then grade' };
      note.innerHTML = 'Ordered by ' + names[sortKey] + '. Every grade is the scorecard\'s, computed on the published scale; a dash is unknown, not a fail. This is not an endorsement.';
    }
    renderCompare();
  }

  /* ---- compare two ------------------------------------------------------- */
  function renderCompare() {
    var box = $('#hub-compare');
    if (picks.length < 2) {
      box.innerHTML = picks.length === 1 ? '<p class="cp-empty">Tick one more candidate to compare them side by side.</p>' : '';
      return;
    }
    var a = DATA.cands.filter(function (c) { return c.key === picks[0]; })[0];
    var b = DATA.cands.filter(function (c) { return c.key === picks[1]; })[0];
    if (!a || !b) { box.innerHTML = ''; return; }
    function cell(c, col) {
      var g = (DATA.colGrid[c.key] || {})[col.key] || { state: 'empty', n: 0 };
      if (g.state === 'graded') return '<span class="cpc"><span class="gchip g-' + gradeCls(g.grade) + '">' + esc(g.grade) + '</span><span class="n">' + fmt2(g.mean) + ' · ' + g.n + '/' + g.total + '</span></span>';
      if (g.state === 'marks') return '<span class="cpc"><span class="few-m" title="Below the three-topic floor: the mean of the marks, not a grade">' + fmt2(g.mean) + '</span><span class="n">' + g.n + '/' + g.total + ' · below the floor</span></span>';
      if (g.state === 'record') return '<span class="cpc"><span class="n">record only</span></span>';
      return '<span class="cpc"><span class="n">—</span></span>';
    }
    var h = '<div class="cp-h"><h3>' + esc(a.name) + ' and ' + esc(b.name) + ', side by side</h3><button type="button" class="cp-x" id="cp-clear">Clear</button></div>';
    h += '<p class="hub-sub">Overall: ' + esc(a.name) + ' ' + (a.grade ? esc(a.grade) + ' (mean ' + fmt2(a.mean) + ' on ' + a.n + ' topics)' : 'not yet scored') + ' · ' + esc(b.name) + ' ' + (b.grade ? esc(b.grade) + ' (mean ' + fmt2(b.mean) + ' on ' + b.n + ' topics)' : 'not yet scored') + '. Highlighted rows are areas where the two hold different grades.</p>';
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
    h += '<p class="hub-note">Only topics where <em>both</em> candidates hold a scored mark are listed: silence is never scored, so a topic one of them has not addressed is not a difference, it is a blank. <a href="#scale">How a mark is decided.</a></p></div>';
    box.innerHTML = '<div class="cmp-panel">' + h + '</div>';
    $('#cp-clear').addEventListener('click', function () { picks = []; render(); });
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

  /* ---- controls ---------------------------------------------------------- */
  function controlsHtml() {
    var h = '<div class="hub-ctl"><div class="f"><label for="hub-sort">Order the cards by</label><select id="hub-sort">' +
      '<option value="grade">Overall grade</option><option value="answered">How much they have answered</option><option value="name">Name</option><option value="office">Office</option></select></div>';
    h += '<div class="f"><span class="lbl2">What matters to me — tick areas to reorder by them</span><div class="wm-chips">';
    areaCols.forEach(function (k) { h += '<button type="button" class="chip" data-wm="' + esc(k.key) + '" aria-pressed="false">' + esc(k.label) + '</button>'; });
    h += '</div></div><p class="hint" id="hub-order"></p></div>';
    return h;
  }

  var all = DATA.cands.length, ans = DATA.cands.filter(function (c) { return answered(c) > 0; }).length;
  var meterHost = $('#hub-meter');
  if (meterHost) {
    meterHost.innerHTML = '<div class="hc-l"><b data-count>' + ans + '</b> of ' + all + ' candidates have a written answer on at least one of the five questions</div><div class="meter big"><i data-w="' + Math.round(ans / all * 100) + '"></i></div>';
  }
  host.innerHTML = controlsHtml() + '<div class="ccards" id="hub-cards"></div><div id="hub-compare"></div>';
  render();

  $('#hub-sort').addEventListener('change', function () { sortKey = this.value; render(); });
  host.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip[data-wm]');
    if (chip) {
      var k = chip.getAttribute('data-wm');
      if (wm.indexOf(k) > -1) wm = wm.filter(function (x) { return x !== k; }); else wm.push(k);
      $$('.chip[data-wm]', host).forEach(function (c) { c.setAttribute('aria-pressed', wm.indexOf(c.getAttribute('data-wm')) > -1 ? 'true' : 'false'); });
      render();
      return;
    }
    var ask = e.target.closest('[data-ask]');
    if (ask) {
      var c = DATA.cands.filter(function (x) { return x.key === ask.getAttribute('data-ask'); })[0];
      var r = rows.filter(function (x) { return x.key === ask.getAttribute('data-row'); })[0];
      if (c && r) openAsk(c, r);
    }
  });
  host.addEventListener('change', function (e) {
    var p = e.target.closest('input[data-pick]');
    if (!p) return;
    var k = p.getAttribute('data-pick');
    if (p.checked) { picks = picks.filter(function (x) { return x !== k; }); picks.push(k); if (picks.length > 2) picks = picks.slice(-2); }
    else picks = picks.filter(function (x) { return x !== k; });
    render();
  });
})();

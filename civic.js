/* A City That Works — civic.js (v2.3)
   -----------------------------------------------------------------------
   The behaviours the September 2026 restack added, kept in one file so
   every page gets them from one script tag rather than from thirty-six
   copies of the same handler. Everything here is progressive: the page is
   complete and readable before this runs and stays complete if it never
   does. Nothing here assigns a grade or invents a number — every figure
   drawn is one already printed on the page or published in the data files
   the build writes.

   Contents
     1. Header: the "Victoria 2026" eyebrow and the Endorse call to action
     2. Hash links into collapsed content open it, then scroll
     3. Figures count up and meters fill when they enter the viewport
     4. Days to the election
     5. The neighbourhood map
     6. FAQ search
     7. My shortlist (Every Measure)
     8. The compact filter bar on phones (Every Measure)
     9. Your household bill (Balance Sheet)
    10. Where the candidates stand — the strip on the home page
    11. Icons where the markup asks for them */
(function () {
  'use strict';
  var ICONS = window.ACTW_ICONS || {};
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function icon(name, cls) {
    var svg = ICONS[name] || '';
    return cls ? svg.replace('class="picon"', 'class="picon ' + cls + '"') : svg;
  }

  /* 1. Header ------------------------------------------------------------ */
  (function header() {
    var brand = $('header .brand');
    if (brand && !brand.querySelector('.num')) {
      var n = document.createElement('span');
      n.className = 'num';
      n.textContent = 'Victoria 2026';
      brand.appendChild(n);
    }
    var nv = $('header .nv');
    if (nv && !nv.querySelector('.btn-end')) {
      var a = document.createElement('a');
      a.className = 'btn-end';
      a.href = '/endorse';
      a.textContent = 'Endorse';
      var more = nv.querySelector('.nvmore');
      if (more) nv.insertBefore(a, more); else nv.appendChild(a);
      if (/\/endorse(\.html)?$/.test(location.pathname)) a.classList.add('cur');
    }
  })();

  /* 2. Hash links --------------------------------------------------------- */
  function openAncestors(el) {
    var p = el.parentElement, opened = false;
    while (p) {
      if (p.tagName === 'DETAILS' && !p.open) { p.open = true; opened = true; }
      p = p.parentElement;
    }
    if (el.tagName === 'DETAILS' && !el.open) { el.open = true; opened = true; }
    return opened;
  }
  function landOnHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    var opened = openAncestors(el);
    /* The browser scrolled to where the target was while its ancestors
       were shut; once they open the target moves. Re-land it, instantly:
       a shared link should arrive where it points, not travel there. */
    if (opened || $('#jumpsel') === null) {
      requestAnimationFrame(function () {
        el.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
    }
  }
  landOnHash();
  window.addEventListener('hashchange', landOnHash);
  window.addEventListener('load', function () {
    if (location.hash) setTimeout(landOnHash, 60);
  });

  /* 3. Figures and meters ------------------------------------------------- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function countUp(el) {
    var text = el.getAttribute('data-count-text') || el.textContent;
    el.setAttribute('data-count-text', text);
    var m = text.match(/^([^0-9]*)([0-9][0-9,]*)(\.[0-9]+)?(.*)$/);
    if (!m) return;
    var prefix = m[1], intPart = m[2].replace(/,/g, ''), dec = m[3] || '', suffix = m[4];
    var target = parseFloat(intPart + dec), decimals = dec ? dec.length - 1 : 0;
    var useComma = m[2].indexOf(',') > -1;
    if (REDUCED || !isFinite(target)) { el.textContent = text; return; }
    var t0 = null, dur = 900;
    function fmt(v) {
      var s = v.toFixed(decimals);
      if (useComma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return prefix + s + suffix;
    }
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = fmt(target * easeOut(p));
      if (p < 1) requestAnimationFrame(step); else el.textContent = text;
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  }
  function fillMeter(el) {
    var w = el.getAttribute('data-w');
    if (w == null) return;
    if (REDUCED) { el.style.transition = 'none'; }
    requestAnimationFrame(function () { el.style.width = w + '%'; });
  }
  (function reveal() {
    var counts = $$('[data-count]'), meters = $$('[data-w]');
    if (!counts.length && !meters.length) return;
    if (!('IntersectionObserver' in window)) {
      counts.forEach(function (c) { c.textContent = c.textContent; });
      meters.forEach(fillMeter);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        if (e.target.hasAttribute('data-count')) countUp(e.target); else fillMeter(e.target);
      });
    }, { threshold: 0.35 });
    counts.forEach(function (c) { io.observe(c); });
    meters.forEach(function (m) { io.observe(m); });
  })();

  /* 4. Days to the election ---------------------------------------------- */
  $$('[data-election]').forEach(function (el) {
    var d = new Date(el.getAttribute('data-election') + 'T00:00:00-07:00');
    var days = Math.ceil((d - new Date()) / 86400000);
    if (!isFinite(days)) return;
    if (days > 1) el.textContent = days + ' days to go';
    else if (days === 1) el.textContent = 'tomorrow';
    else if (days === 0) el.textContent = 'election day';
    else el.textContent = 'held ' + el.getAttribute('data-election');
  });

  /* 5. The neighbourhood map ---------------------------------------------
     Thirteen shapes, placed where the neighbourhoods sit relative to one
     another: the harbour to the west, the strait to the south, Oak Bay
     off the east edge. A schematic, not a survey — the page says so —
     and every shape is a link to that neighbourhood's page. */
  var NB = [
    { s: 'vic-west',          n: ['Vic West'],            p: '38,182 146,172 154,296 78,330 34,296', l: [94, 245] },
    { s: 'burnside-rock-bay', n: ['Burnside–', 'Rock Bay'], p: '150,62 332,58 336,174 214,178 152,168', l: [244, 112] },
    { s: 'hillside-quadra',   n: ['Hillside-', 'Quadra'],   p: '332,58 462,60 462,182 336,174', l: [398, 116] },
    { s: 'oaklands',          n: ['Oaklands'],            p: '462,60 592,64 592,204 464,200 462,182', l: [527, 130] },
    { s: 'downtown',          n: ['Downtown'],            p: '154,178 302,180 302,302 172,302 154,262', l: [228, 240] },
    { s: 'north-park',        n: ['North', 'Park'],        p: '302,180 402,182 402,262 302,262', l: [352, 216] },
    { s: 'fernwood',          n: ['Fernwood'],            p: '402,182 464,200 502,204 502,302 402,302', l: [452, 250] },
    { s: 'harris-green',      n: ['Harris', 'Green'],      p: '302,262 402,262 402,302 302,302', l: [352, 279] },
    { s: 'jubilee',           n: ['Jubilee'],             p: '502,204 592,204 592,332 502,332', l: [547, 268] },
    { s: 'rockland',          n: ['Rockland'],            p: '402,302 502,302 502,392 402,392', l: [452, 347] },
    { s: 'james-bay',         n: ['James Bay'],           p: '104,302 302,302 302,402 212,470 106,442', l: [200, 372] },
    { s: 'fairfield',         n: ['Fairfield'],           p: '302,302 402,302 402,392 502,392 502,452 306,472', l: [400, 432] },
    { s: 'gonzales',          n: ['Gonzales'],            p: '502,332 592,332 592,462 502,452', l: [547, 396] }
  ];
  $$('.nbmap').forEach(function (host) {
    if (host.querySelector('svg')) return;
    var cur = host.getAttribute('data-current') || '';
    var h = '<svg viewBox="0 0 620 500" role="img" aria-labelledby="nbmap-t" class="nbmap-svg">' +
      '<title id="nbmap-t">A schematic map of Victoria\'s thirteen neighbourhood pages. Each shape links to its page.</title>' +
      '<rect class="water" x="0" y="0" width="620" height="500"/>' +
      '<path class="land" d="M34 60 H600 V470 L306 486 L212 480 L104 448 L30 300 Z"/>' +
      '<path class="wave" d="M60 470q10-6 20 0t20 0t20 0" /><path class="wave" d="M40 400q10-6 20 0t20 0t20 0"/>' +
      '<path class="wave" d="M70 130q10-6 20 0t20 0"/>' +
      '<text class="sea" x="24" y="120">Upper Harbour</text><text class="sea" x="140" y="488">Juan de Fuca Strait</text>' +
      '<text class="sea" x="596" y="250" transform="rotate(90 596 250)">Oak Bay</text>';
    NB.forEach(function (n) {
      var on = n.s === cur;
      h += '<a href="neighbourhood-' + n.s + '.html" class="nbl' + (on ? ' on' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
        '<polygon class="nb" points="' + n.p + '"><title>' + esc(n.n.join(' ')) + '</title></polygon>' +
        '<text x="' + n.l[0] + '" y="' + (n.l[1] - (n.n.length > 1 ? 6 : 0)) + '" text-anchor="middle">' +
        n.n.map(function (line, i) { return '<tspan x="' + n.l[0] + '"' + (i ? ' dy="13"' : '') + '>' + esc(line) + '</tspan>'; }).join('') +
        '</text></a>';
    });
    h += '</svg><p class="nbmap-c">Schematic, not to scale. Tap a neighbourhood to open its page.</p>';
    host.innerHTML = h;
  });

  /* 6. FAQ search ---------------------------------------------------------- */
  (function faqSearch() {
    var input = $('#faqsearch');
    if (!input) return;
    var items = $$('details.q'), groups = $$('.faqgrp');
    var out = $('#faqcount');
    function run() {
      var q = input.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (d) {
        var ok = !q || d.textContent.toLowerCase().indexOf(q) > -1;
        d.hidden = !ok;
        if (ok) shown++;
        if (q && ok) d.open = true; else if (!q) d.open = false;
      });
      groups.forEach(function (g) {
        g.hidden = !!q && !g.querySelector('details.q:not([hidden])');
      });
      if (out) out.textContent = q ? (shown + ' of ' + items.length + ' questions match') : '';
    }
    input.addEventListener('input', run);
  })();

  /* 7. My shortlist --------------------------------------------------------
     Stars live in the open card beside the permalink, never inside the
     <summary>, so the row stays one control. The list is this browser's
     only: nothing leaves the page unless the reader copies the link. */
  (function shortlist() {
    var ctr = $('#mctr');
    if (!ctr) return;
    var KEY = 'actw-shortlist';
    function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
    function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
    var list = load();
    var fromUrl = new URLSearchParams(location.search).get('m');
    if (fromUrl) {
      list = fromUrl.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
      save(list);
    }
    var bar = document.createElement('div');
    bar.id = 'shortbar';
    bar.className = 'shortbar';
    bar.hidden = true;
    bar.innerHTML = '<div class="c sb-in">' +
      '<span class="sb-l">' + icon('star') + ' <b id="sb-n">0</b> in my shortlist</span>' +
      '<span class="sb-acts">' +
      '<button type="button" id="sb-show">Show only mine</button>' +
      '<button type="button" id="sb-print">Print the ask</button>' +
      '<button type="button" id="sb-copy">Copy link</button>' +
      '<button type="button" id="sb-clear">Clear</button></span></div>';
    document.body.appendChild(bar);
    var onlyMine = false;
    function idOf(d) { return (d.id || '').toLowerCase(); }
    function has(id) { return list.indexOf(id) > -1; }
    function paint() {
      var cards = $$('details.mi', ctr);
      cards.forEach(function (d) {
        var on = has(idOf(d));
        d.classList.toggle('star', on);
        var b = d.querySelector('.mstar');
        if (b) {
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          b.innerHTML = icon('star') + (on ? ' In my shortlist' : ' Add to my shortlist');
        }
        if (onlyMine) d.classList.toggle('hbf', !on);
      });
      $('#sb-n').textContent = list.length;
      bar.hidden = !list.length;
      document.body.classList.toggle('has-shortbar', !!list.length);
      $('#sb-show').textContent = onlyMine ? 'Show all measures' : 'Show only mine';
    }
    $$('details.mi', ctr).forEach(function (d) {
      if (d.querySelector('.mstar')) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mstar';
      b.addEventListener('click', function () {
        var id = idOf(d);
        if (has(id)) list = list.filter(function (x) { return x !== id; }); else list.push(id);
        save(list); paint();
      });
      var link = d.querySelector('.mlink');
      if (link) link.parentNode.insertBefore(b, link.nextSibling); else d.appendChild(b);
    });
    $('#sb-show').addEventListener('click', function () {
      onlyMine = !onlyMine;
      if (!onlyMine) $$('details.mi', ctr).forEach(function (d) { d.classList.remove('hbf'); });
      paint();
    });
    $('#sb-clear').addEventListener('click', function () { list = []; onlyMine = false; save(list); $$('details.mi', ctr).forEach(function (d) { d.classList.remove('hbf'); }); paint(); });
    $('#sb-copy').addEventListener('click', function () {
      var url = location.origin + location.pathname.replace(/\.html$/, '') + '?m=' + list.map(function (s) { return s.replace(/^m/, ''); }).join(',');
      var b = $('#sb-copy');
      var done = function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy link'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt('Copy this link', url); });
      else prompt('Copy this link', url);
    });
    $('#sb-print').addEventListener('click', function () {
      document.body.classList.add('print-shortlist');
      $$('details.mi', ctr).forEach(function (d) { if (has(idOf(d))) d.open = true; });
      window.print();
    });
    window.addEventListener('afterprint', function () { document.body.classList.remove('print-shortlist'); });
    paint();
    if (fromUrl && list.length) {
      var first = document.getElementById(list[0]);
      if (first) { first.open = true; first.scrollIntoView({ block: 'start' }); }
    }
  })();

  /* 8. The compact filter bar ---------------------------------------------- */
  (function compactBar() {
    var fb = $('.fb');
    if (!fb) return;
    var lastY = window.scrollY, tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var narrow = window.innerWidth < 640;
        fb.classList.toggle('compact', narrow && y > 320 && y > lastY);
        lastY = y; tick = false;
      });
    }, { passive: true });
    fb.addEventListener('focusin', function () { fb.classList.remove('compact'); });
    fb.addEventListener('click', function () { fb.classList.remove('compact'); });
  })();

  /* 9. Your household bill -------------------------------------------------
     One published figure scales it: the 9.34% residential increase meant
     $323 on a median home assessed at $1,015,000 (Victoria News, May 2026).
     Everything shown is that 2026 bill, and what the same bill would have
     been under each cap. Later years are not projected, because what a
     capped rate costs then depends on assessed values nobody can
     responsibly predict — the site says so, and so does the box. */
  (function bill() {
    var box = $('#bill');
    if (!box) return;
    var BASE_INC = 323, BASE_VAL = 1015000, RATE = 9.34;
    var CAPS = [['Under the Year 1 cap (≤ 6.5%)', 6.5], ['Under the Year 2 cap (≤ 5.0%)', 5.0], ['At the Year 3 target (~3.5%)', 3.5]];
    var input = $('#bill-v', box), out = $('#bill-out', box);
    function money(n) { return '$' + Math.round(n).toLocaleString('en-CA'); }
    function run() {
      var v = parseFloat(String(input.value).replace(/[^0-9.]/g, ''));
      if (!isFinite(v) || v <= 0) { out.innerHTML = '<p class="bill-note">Enter your home\'s assessed value to see the 2026 increase scaled to it.</p>'; return; }
      var inc = BASE_INC * (v / BASE_VAL);
      var h = '<div class="bill-row now"><span>What the 2026 increase (9.34%) meant on a home assessed at ' + money(v) + '</span><b>+' + money(inc) + '</b></div>';
      CAPS.forEach(function (c) {
        var alt = inc * (c[1] / RATE);
        h += '<div class="bill-row"><span>' + c[0] + ', on the same 2026 bill</span><b>+' + money(alt) + ' <i>saves ' + money(inc - alt) + '</i></b></div>';
      });
      out.innerHTML = h;
    }
    input.addEventListener('input', run);
    run();
  })();

  /* 10. Where the candidates stand — the home strip -------------------------
     Reads candidates-lite.json, which build/matrix.js writes from the same
     grid the scorecard is built from. Grades are copied, never computed
     here. The "answered" count is how many of the five doors carry a
     sourced sentence, a record or a published program: a scan order, not
     a grade and not an endorsement. */
  (function homeCands() {
    var host = $('#home-cands');
    if (!host || !window.fetch) return;
    fetch('candidates-lite.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.cands) return;
      var all = d.cands.slice();
      var answered = all.filter(function (c) { return c.answered > 0; }).length;
      var pct = all.length ? Math.round(answered / all.length * 100) : 0;
      var top = all.slice().sort(function (a, b) {
        if ((b.mean || 0) !== (a.mean || 0)) return (b.mean || 0) - (a.mean || 0);
        if (b.answered !== a.answered) return b.answered - a.answered;
        return a.name.localeCompare(b.name);
      }).slice(0, 6);
      var h = '<div class="hc-meter"><div class="hc-l"><b data-count>' + answered + '</b> of ' + all.length + ' candidates have a written answer on at least one of the five questions</div>' +
        '<div class="meter big"><i data-w="' + pct + '"></i></div></div>';
      h += '<div class="hc-chips">';
      top.forEach(function (c) {
        var init = c.name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
        h += '<a class="hc-chip" href="scorecard.html#sc-' + esc(c.key) + '"><span class="avatar sm' + (String(c.office).toLowerCase() === 'mayor' ? ' mayor' : '') + '">' + esc(init) + '</span>' +
          '<span class="hc-n">' + esc(c.name) + '</span>' +
          (c.grade ? '<span class="gchip g-' + esc(c.gradeCls) + '">' + esc(c.grade) + '</span>' : '<span class="gchip g-x">—</span>') +
          '<span class="hc-a">' + c.answered + '/' + d.doors + ' answered</span></a>';
      });
      h += '<a class="hc-chip more" href="scorecard.html">All ' + all.length + ' candidates →</a></div>';
      h += '<p class="hc-note">Grades are the scorecard\'s, computed on the published two-question scale · updated ' + esc(d.date || '') + ' · <a href="scorecard.html#scale">how a grade is decided</a> · this is not an endorsement.</p>';
      host.innerHTML = h;
      $$('[data-count]', host).forEach(countUp);
      $$('[data-w]', host).forEach(fillMeter);
    }).catch(function () {});
  })();

  /* 12. The KPI library: filter and order the indicators -----------------------
     Every indicator stays on the page; the controls hide none of the text a
     reader has not asked to hide, and "as listed" restores the master's
     order. Cadence is read from the source line ("City · quarterly"). */
  (function kpiControls() {
    var lists = $$('ul.kpis');
    if (!lists.length) return;
    var prose = lists[0].closest('.prose') || lists[0].parentElement;
    var firstH2 = prose.querySelector('h2');
    if (!firstH2) return;
    var items = $$('ul.kpis > li');
    items.forEach(function (li, i) { li.setAttribute('data-i', i); });
    var bar = document.createElement('div');
    bar.className = 'kpi-ctl';
    bar.innerHTML = '<span class="lbl2">Show</span>' +
      '<button type="button" class="chip" data-kf="all" aria-pressed="true">All indicators</button>' +
      '<button type="button" class="chip" data-kf="base" aria-pressed="false">A baseline exists today</button>' +
      '<button type="button" class="chip" data-kf="first" aria-pressed="false">First report sets the baseline</button>' +
      '<label class="lbl2" for="kpi-sort" style="margin-left:8px">Order within each section</label>' +
      '<select id="kpi-sort"><option value="list">As listed</option><option value="cadence">By cadence, most frequent first</option><option value="name">By name</option></select>' +
      '<span class="kpi-n" id="kpi-n"></span>';
    firstH2.parentNode.insertBefore(bar, firstH2);
    var filter = 'all';
    function cadenceRank(li) {
      var t = ((li.querySelector('.ks') || {}).textContent || '').toLowerCase();
      if (/daily|weekly/.test(t)) return 0;
      if (/monthly/.test(t)) return 1;
      if (/quarter/.test(t)) return 2;
      if (/annual|year/.test(t)) return 3;
      return 4;
    }
    function apply() {
      var shown = 0;
      var mode = $('#kpi-sort').value;
      lists.forEach(function (ul) {
        var lis = $$(':scope > li', ul);
        lis.sort(function (a, b) {
          if (mode === 'cadence') { var d = cadenceRank(a) - cadenceRank(b); if (d) return d; }
          if (mode === 'name') { var na = (a.querySelector('.kn') || a).textContent.trim(), nb = (b.querySelector('.kn') || b).textContent.trim(); var c = na.localeCompare(nb); if (c) return c; }
          return (+a.getAttribute('data-i')) - (+b.getAttribute('data-i'));
        });
        lis.forEach(function (li) {
          var first = !!li.querySelector('.kb .fr');
          var ok = filter === 'all' || (filter === 'first' ? first : !first);
          li.hidden = !ok;
          if (ok) shown++;
          ul.appendChild(li);
        });
        var sec = ul.closest('section') || ul.parentElement;
        var h = ul.previousElementSibling;
        while (h && !/^H[23]$/.test(h.tagName)) h = h.previousElementSibling;
        if (h && sec) h.hidden = !ul.querySelector('li:not([hidden])');
      });
      $('#kpi-n').textContent = shown + ' of ' + items.length + ' indicators';
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-kf]');
      if (!b) return;
      filter = b.getAttribute('data-kf');
      $$('[data-kf]', bar).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      apply();
    });
    $('#kpi-sort').addEventListener('change', apply);
    apply();
  })();

  /* 11. Icons ---------------------------------------------------------------- */
  $$('[data-icon]').forEach(function (el) {
    var svg = ICONS[el.getAttribute('data-icon')];
    if (svg && !el.querySelector('svg')) el.innerHTML = svg;
  });
  $$('.hub-band[data-horizon]').forEach(function (b) {
    if (b.querySelector('.horizon')) return;
    var s = document.createElement('div');
    s.className = 'horizon';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 1200 120" preserveAspectRatio="none">' +
      '<path d="M0 96 C120 70 220 60 320 82 S520 60 640 84 S860 54 980 78 S1120 70 1200 88" />' +
      '<path d="M0 108 q30-8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" />' +
      '<path d="M500 84 v-22 h20 v-10 a18 18 0 0 1 36 0 v10 h20 v22" /><path d="M528 52 v-14 l10-10 10 10 v14" />' +
      '<path d="M700 84 v-16 h14 v16 M730 84 v-16 h14 v16 M760 84 v-16 h14 v16" />' +
      '<path d="M120 84 v-14 l40-16 40 16 v14 M160 54 v30" />' +
      '</svg>';
    b.insertBefore(s, b.firstChild);
  });
})();

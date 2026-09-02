/* A City That Works — feature switches.

   One file, one boolean, loaded synchronously in the <head> of every page so
   the decision is made before anything paints. Nothing about the candidate
   material is deleted — it is gated, and flipping the boolean below puts all
   of it back exactly as it was.

   What the candidate switch governs when it is off:
     - scorecard.html, comparison.html and profiles.html redirect to the home
       page
     - every link to any of them disappears from the header, the "More"
       panel, the mobile drawer and the footer
     - the blocks that exist only to point at them (the homepage's "Where the
       candidates stand" section, the two Get Involved bullets, the FAQ index
       entry) are removed — they are marked data-cand in the HTML
     - anything else still linking there keeps its words and loses its link,
       so a sentence never breaks mid-clause

   Two ways to work with it:
     - the master switch, below — what every visitor gets
     - ?candidates=on appended to any URL — a per-browser preview, remembered
       in localStorage, so the pages can be checked while the public site
       stays dark. ?candidates=off re-hides them; ?candidates=clear drops the
       override and returns that browser to the master switch. While an
       override is in force a small badge sits in the corner, so a preview is
       never mistaken for the live site. */
(function () {

  /* ════════════════════════════════════════════════════════════════
       THE SWITCH.  false = candidate pages hidden site-wide.
                    true  = the site as published.
     ════════════════════════════════════════════════════════════════ */
  var CANDIDATES_LIVE = true;

  /* The pages the switch governs. Add a filename here and it is gated on the
     same terms — redirected when off, and every link to it swept. */
  var GATED = ['scorecard.html', 'comparison.html', 'profiles.html'];

  /* Netlify serves this site with pretty URLs on: scorecard.html is also
     reachable as /scorecard, and every in-page href is rewritten to the
     extensionless form on the way out. So nothing here may compare whole
     hrefs — /comparison and comparison.html and comparison.html#profiles are
     one page, and matching on the literal ".html" spelling would gate the
     local copy and miss the deployed one entirely. Reduce both sides to the
     bare filename and compare that. */
  function stem(u) {
    u = String(u || '').split('#')[0].split('?')[0];
    return (u.split('/').pop() || '').toLowerCase().replace(/\.html$/, '');
  }
  var STEMS = GATED.map(stem);
  function gated(u) {
    var path = String(u || '').split('#')[0].split('?')[0];
    /* Individual live-door pages live at /profiles/<slug>. The hub itself
       (/profiles, profiles.html) is already in STEMS. */
    if (/\/profiles\/[a-z0-9-]+/i.test(path)) return true;
    return STEMS.indexOf(stem(u)) > -1;
  }

  var KEY = 'actw.candidates';   // 'on' | 'off' — this browser's override
  var PANEL = 'actw.panel';      // '1' — this browser gets the toggle panel
  var on = CANDIDATES_LIVE, override = false, panel = false;

  /* localStorage throws outright in a few privacy configurations, and a
     failure to read a preview flag must never take the page down with it. */
  try {
    var q = /[?&]candidates=(on|off|clear)/.exec(location.search);
    if (q) {
      /* Using the parameter at all is what unlocks the panel, and the unlock
         outlives 'clear' — otherwise turning the pages back off would take
         the only control for turning them on again with it. */
      localStorage.setItem(PANEL, '1');
      if (q[1] === 'clear') { localStorage.removeItem(KEY); localStorage.removeItem(PANEL); }
      else { localStorage.setItem(KEY, q[1]); }
    }
    var saved = localStorage.getItem(KEY);
    if (saved === 'on' || saved === 'off') {
      on = saved === 'on';
      override = on !== CANDIDATES_LIVE;
    }
    panel = localStorage.getItem(PANEL) === '1';
  } catch (e) { /* no storage, no override — the master switch stands */ }

  window.ACTW = window.ACTW || {};
  window.ACTW.candidates = on;
  window.ACTW.candidatesGated = GATED;
  /* Exposed so the URL matching can be checked from the console against the
     forms the deploy actually serves — /comparison, comparison.html,
     comparison.html#profiles — without deploying to find out. Getting this
     wrong is how the first version of this file shipped a gate that worked
     locally and did nothing on the live site. */
  window.ACTW.isCandidateUrl = gated;

  document.documentElement.classList.add(on ? 'cands-on' : 'cands-off');

  var here = stem(location.pathname) || 'index';
  var onGatedPage = gated(location.pathname);

  /* Leave before the document body is parsed rather than after — a hidden
     page that renders for half a second has not been hidden. replace() keeps
     it out of the back-button history too, so "back" from the home page goes
     where the reader actually came from. */
  if (!on && onGatedPage) { location.replace('/'); return; }

  /* The gated pages carry a static noindex and a <noscript> redirect, so a
     crawler or a reader with scripting off is held back too. Both are wrong
     the moment the switch goes on, so both come straight back out here and
     the boolean above stays the only thing that has to be edited for the site
     to behave. They are still in the file, though — and a crawler that does
     not run scripts will still read them — so say so once, where whoever
     flipped the switch is looking. */
  if (on && onGatedPage) {
    var stale = document.querySelectorAll('[data-cand-gate]');
    for (var g = 0; g < stale.length; g++) { stale[g].parentNode.removeChild(stale[g]); }
    if (stale.length && window.console) {
      console.info('ACTW: candidate switch is ON. ' + here + ' still ships the ' +
        'no-JavaScript gate — delete its two data-cand-gate tags when you publish, ' +
        'and put ' + GATED.join(', ') + ' back in sitemap.xml and robots.txt.');
    }
  }

  /* Nothing left to do only when the pages are visible AND this browser has
     no reason to be told about it. `panel` has to be in this test: with the
     master switch on and no override in force, `override` is false, and an
     earlier version returned here — which silently took the toggle away from
     the one browser that had asked for it, on the exact day the switch was
     turned on. The sweep below is already guarded by `if (!on)`, so this
     return is only ever an early exit past the panel. */
  if (on && !override && !panel) { return; }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  /* Registered from the <head>, so this listener is ahead of the ones
     jumpnav.js and measures.js add at the end of the body. The section
     navigator therefore builds its option list from a document that has
     already lost the candidate section, instead of offering a jump to a
     heading that is no longer there. */
  if (!on) {
    ready(function () {
      var i;

      /* Blocks whose only purpose is the candidate material. Marked in the
         HTML rather than guessed at here, because "the paragraph around this
         link" is a judgement no selector makes reliably. */
      var blocks = document.querySelectorAll('[data-cand]');
      for (i = 0; i < blocks.length; i++) {
        if (blocks[i].parentNode) { blocks[i].parentNode.removeChild(blocks[i]); }
      }

      /* Everything else that still points at a gated page. Every anchor is
         read and its href reduced to a stem rather than matched with an
         attribute selector, because the selector would have to spell the
         extension and the deployed pages do not carry one. It also keeps
         index.html#scorecard — the 12 Commitments anchor, a different thing
         with a colliding name — out of the sweep, which a looser
         [href*="scorecard"] would have swallowed.

         A link sitting in running prose loses its href and keeps its words;
         a link that is an item in its own right — a nav entry, a footer
         line, a button — goes entirely, because unlinking it would leave a
         dead label behind. The test is whether the anchor has a non-empty
         text sibling. */
      var links = document.querySelectorAll('a[href]');
      for (i = 0; i < links.length; i++) {
        var a = links[i];
        if (!a.parentNode || !gated(a.getAttribute('href'))) { continue; }
        if (inProse(a)) {
          var s = document.createElement('span');
          while (a.firstChild) { s.appendChild(a.firstChild); }
          a.parentNode.replaceChild(s, a);
        } else {
          a.parentNode.removeChild(a);
        }
      }
    });
  }

  function inProse(a) {
    var n = a.parentNode.firstChild;
    while (n) {
      if (n !== a && n.nodeType === 3 && /\S/.test(n.nodeValue)) { return true; }
      n = n.nextSibling;
    }
    return false;
  }

  /* The toggle. It is deliberately not on the page for everyone: a button
     the public can see is a button that says there are hidden pages and
     here is how to read them, which is the opposite of hiding them. So the
     panel belongs to a browser rather than to the site — ?candidates=on or
     ?candidates=off once, and this browser keeps the control from then on.
     It also states which way the switch is currently set, because a preview
     that looks identical to the live site is how a page gets left switched
     on by accident.

     Both buttons are plain links that reload. Toggling has to reload
     anyway: with the switch off the candidate markup is removed from the
     document, and nothing can put back what is no longer there.

     Styled inline rather than from styles.css, deliberately. This panel is
     the control for the switch, and a control that renders from a
     separately cached stylesheet can arrive looking like a line of plain
     text — which is exactly how it went missing when it was first looked
     for. flags.js already revalidates on every load, so keeping the panel's
     appearance in here means it cannot be a version behind its own markup.
     styles.css keeps only the print rule, which has nothing to hide if it
     is stale. */
  if (panel) {
    ready(function () {
      var base = location.pathname;
      var NAVY = '#1A3668';
      var b = document.createElement('div');
      b.className = 'cand-badge';
      b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;' +
        'max-width:calc(100vw - 24px);display:flex;align-items:center;gap:8px;flex-wrap:wrap;' +
        "font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.06em;" +
        'text-transform:uppercase;background:' + NAVY + ';color:#fff;' +
        'padding:7px 8px 7px 12px;border-radius:3px;box-shadow:0 3px 16px rgba(0,0,0,.32)';

      function el(tag, css, text) {
        var n = document.createElement(tag);
        n.style.cssText = css;
        if (text != null) { n.textContent = text; }
        return n;
      }
      b.appendChild(el('span', 'opacity:.72', 'Candidate pages'));
      b.appendChild(el('strong', 'font-weight:600;color:' + (on ? '#C8A44D' : '#E86A4E'), on ? 'ON' : 'OFF'));
      b.appendChild(el('span', 'opacity:.5;text-transform:none;letter-spacing:.02em;font-size:9px',
        override ? 'this browser only' : 'site default'));

      var btn = el('a', 'color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.45);' +
        'padding:4px 9px;border-radius:2px;white-space:nowrap;cursor:pointer',
        'Turn ' + (on ? 'off' : 'on'));
      btn.href = base + '?candidates=' + (on ? 'off' : 'on');
      btn.onmouseover = function () { btn.style.background = '#fff'; btn.style.color = NAVY; };
      btn.onmouseout = function () { btn.style.background = ''; btn.style.color = '#fff'; };
      b.appendChild(btn);

      var x = el('a', 'color:#fff;opacity:.5;text-decoration:none;font-size:13px;line-height:1;padding:0 2px', '×');
      x.href = base + '?candidates=clear';
      x.title = 'Remove this panel from this browser';
      b.appendChild(x);

      document.body.appendChild(b);
    });
  }

})();

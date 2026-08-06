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
  var CANDIDATES_LIVE = false;

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
  function gated(u) { return STEMS.indexOf(stem(u)) > -1; }

  var KEY = 'actw.candidates';
  var on = CANDIDATES_LIVE, override = false;

  /* localStorage throws outright in a few privacy configurations, and a
     failure to read a preview flag must never take the page down with it. */
  try {
    var q = /[?&]candidates=(on|off|clear)/.exec(location.search);
    if (q) {
      if (q[1] === 'clear') { localStorage.removeItem(KEY); }
      else { localStorage.setItem(KEY, q[1]); }
    }
    var saved = localStorage.getItem(KEY);
    if (saved === 'on' || saved === 'off') {
      on = saved === 'on';
      override = on !== CANDIDATES_LIVE;
    }
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
  if (!on && onGatedPage) { location.replace('index.html'); return; }

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

  if (on && !override) { return; }

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

  /* A preview that looks identical to the live site is how a page gets left
     switched on by accident. */
  if (override) {
    ready(function () {
      var b = document.createElement('div');
      b.className = 'cand-badge';
      b.innerHTML = 'Candidate pages <strong>' + (on ? 'ON' : 'OFF') +
        '</strong> — this browser only · <a href="?candidates=clear">reset</a>';
      document.body.appendChild(b);
    });
  }

})();

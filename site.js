/* A City That Works — shared site script: header social, footer, mobile menu */
(function () {

  /* Single source of truth for the accounts. The X handle differs from the
     other two, so every label names its own handle rather than implying one
     shared @CityThatWorksYYJ across all three. */
  var IG_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>';
  var X_SVG  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
  var FB_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>';

  var SOCIAL = [
    { name: 'Instagram',   handle: '@CityThatWorksYYJ', url: 'https://www.instagram.com/CityThatWorksYYJ/', svg: IG_SVG },
    { name: 'X (Twitter)', handle: '@YYJThatWorks',     url: 'https://x.com/YYJThatWorks',                  svg: X_SVG  },
    { name: 'Facebook',    handle: 'CityThatWorksYYJ',  url: 'https://www.facebook.com/CityThatWorksYYJ',   svg: FB_SVG }
  ];

  function socialLinks(cls) {
    return SOCIAL.map(function (s) {
      var label = s.name + ' — ' + s.handle;
      return '<a class="' + cls + '" href="' + s.url + '" target="_blank" rel="noopener"' +
             ' aria-label="' + label + '" title="' + label + '">' + s.svg + '</a>';
    }).join('');
  }

  var FOOTER = '' +
'<footer><div class="c">' +
'<div class="fg2">' +
'<div>' +
'<div class="fbr"><svg class="bicn" viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="112" fill="#FAF7F0"/><g fill="none" stroke="#16335c" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M52 92  q22.5 -14 45 0 t45 0 t45 0"/><path d="M52 120 q22.5 -14 45 0 t45 0 t45 0" opacity="0.88"/><path d="M52 148 q22.5 -14 45 0 t45 0 t45 0" opacity="0.76"/></g></svg><span class="nm">A City That Works</span></div>' +
'<p class="fdc">A Citizens\' Framework for Victoria 2026. Every measure costed. Zero ideology. Just results.</p>' +
'<div class="fsoc">' + socialLinks('') + '</div>' +
'<p class="fhandle">Instagram &amp; Facebook <strong>@CityThatWorksYYJ</strong> · X <strong>@YYJThatWorks</strong></p>' +
'<p class="fvr"><a href="version-history.html" style="color:inherit;text-decoration:underline;text-decoration-color:currentColor">v1.9.2 · July 31, 2026</a></p>' +
'</div>' +
'<div>' +
'<div class="fhd">The Framework</div>' +
'<div class="fls">' +
'<a href="index.html">Home</a>' +
'<a href="measures.html">All Measures</a>' +
'<a href="index.html#scorecard">12 Commitments</a>' +
'<a href="index.html#balance">Balance Sheet</a>' +
'<a href="index.html#adopt">Endorse / Subscribe</a>' +
'</div>' +
'</div>' +
'<div>' +
'<div class="fhd">Detailed Documents</div>' +
'<div class="fls">' +
'<a href="summary.html">One-Page Summary</a>' +
'<a href="savings.html">Savings &amp; Revenue Analysis</a>' +
'<a href="city-hall.html">How City Hall Works</a>' +
'<a href="endorse.html">Candidate Endorsement Pack</a>' +
'<a href="comparison.html">Candidate Comparison Matrix</a>' +
'<a href="scorecard.html">Candidate Scorecard</a>' +
'<a href="faq.html">Frequently Asked Questions</a>' +
'<a href="version-history.html">Version History</a>' +
'</div>' +
'<div class="fhd" style="margin-top:24px">Contact</div>' +
'<div class="fls"><a href="mailto:info@acitythatworks.ca">info@acitythatworks.ca</a></div>' +
'</div>' +
'</div>' +
'<div class="fbo">' +
'<div>© 2026 — Open framework. No copyright restriction.</div>' +
'<div>Built on the unceded territories of the Songhees and Esquimalt Nations.</div>' +
'</div>' +
'</div></footer>';

  var mount = document.getElementById('footer-mount');
  if (mount) { mount.outerHTML = FOOTER; }

  // Social links in the header, so they aren't buried at the bottom of a long
  // page. Injected here rather than pasted into eight headers by hand.
  var hr = document.querySelector('header .hr');
  if (hr && !hr.querySelector('.hsoc')) {
    var hs = document.createElement('div');
    hs.className = 'hsoc';
    hs.innerHTML = socialLinks('');
    var burger = hr.querySelector('#mt');
    if (burger) { hr.insertBefore(hs, burger); } else { hr.appendChild(hs); }
  }

  // …and in the mobile drawer, where the header row has no space for them.
  var mmi = document.querySelector('#mn .mmi');
  if (mmi && !mmi.querySelector('.msoc')) {
    var wrap = document.createElement('div');
    wrap.className = 'msoc';
    wrap.innerHTML = '<span class="msoc-l">Follow</span>' + socialLinks('');
    mmi.appendChild(wrap);
  }

  // "More" — a full site map in the header. The desktop nav is deliberately
  // six items (a ninth item plus the social icons was breaking the wordmark
  // to three lines at 1024px), but that left Savings, the Comparison Matrix
  // and Version History reachable only from the footer or the mobile
  // drawer — a long way down on a page that can run 30,000+ px. Same list
  // the footer already carries, injected once here instead of hand-added to
  // nine headers.
  var nv = document.querySelector('header .nv');
  if (nv && !nv.querySelector('.nvmore')) {
    var more = document.createElement('details');
    more.className = 'nvmore';
    more.innerHTML =
      '<summary>More ▾</summary>' +
      '<div class="nvpanel">' +
        '<div class="grp">The Framework</div>' +
        '<a href="index.html">Home</a>' +
        '<a href="measures.html">All Measures</a>' +
        '<a href="index.html#scorecard">12 Commitments</a>' +
        '<a href="index.html#balance">Balance Sheet</a>' +
        '<div class="grp">Detailed Documents</div>' +
        '<a href="summary.html">One-Page Summary</a>' +
        '<a href="savings.html">Savings &amp; Revenue Analysis</a>' +
        '<a href="city-hall.html">How City Hall Works</a>' +
        '<a href="endorse.html">Candidate Endorsement Pack</a>' +
        '<a href="comparison.html">Candidate Comparison Matrix</a>' +
        '<a href="scorecard.html">Candidate Scorecard</a>' +
        '<a href="faq.html">Frequently Asked Questions</a>' +
        '<a href="version-history.html">Version History</a>' +
      '</div>';
    nv.appendChild(more);
    more.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { more.open = false; });
    });
    document.addEventListener('click', function (e) {
      if (more.open && !more.contains(e.target)) more.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && more.open) { more.open = false; more.querySelector('summary').focus(); }
    });
  }

  // Wide comparison tables scroll sideways inside .tbl-wrap, and the edge
  // shadow alone is easy to miss on a phone — so say it in words. Only for
  // tables that actually overflow at the current width, and only for the first
  // couple: on the comparison page all 38 overflow on a phone, and repeating
  // the instruction 38 times is noise. The shadow carries the rest.
  // .sc-wrap (the scorecard grid) gets the same treatment — it's the widest
  // table on the site and previously matched neither this selector nor the
  // .tbl-wrap edge-shadow CSS, so it got no affordance of either kind.
  var HINT_LIMIT = 2;
  function tableHints() {
    var shown = 0;
    document.querySelectorAll('.tbl-wrap, .sc-wrap').forEach(function (w) {
      var over = w.scrollWidth > w.clientWidth + 4 && shown < HINT_LIMIT;
      if (over) { shown++; }
      var hint = w.nextElementSibling;
      var has = hint && hint.classList.contains('tbl-hint');
      if (over && !has) {
        var h = document.createElement('div');
        h.className = 'tbl-hint';
        h.setAttribute('aria-hidden', 'true');
        h.textContent = 'Scroll the table sideways →';
        w.parentNode.insertBefore(h, w.nextSibling);
      } else if (!over && has) {
        hint.remove();
      }
    });
  }
  tableHints();
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(tableHints, 200);
  });

  // "Link to M48" (and its FAQ-question equivalent) used to just navigate —
  // reading the URL back out of the address bar to actually share it was a
  // second click, a third to copy. preventDefault turns the same click into
  // a clipboard write instead; the href is untouched, so a screen reader, a
  // no-JS visit, or a right-click "copy link address" all still work exactly
  // as before. Delegated on document, once here, so every page that carries
  // an .mlink — measures, FAQ questions — gets it for free rather than each
  // page wiring its own copy of the same handler.
  if (navigator.clipboard) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest("a.mlink[href^='#']");
      if (!a) return;
      e.preventDefault();
      var href = a.getAttribute('href');
      var url = location.href.split('#')[0] + href;
      navigator.clipboard.writeText(url).then(function () {
        history.replaceState(null, '', href);
        var was = a.textContent;
        a.textContent = 'Copied ✓';
        a.classList.add('copied');
        clearTimeout(a._copyTimer);
        a._copyTimer = setTimeout(function () { a.textContent = was; a.classList.remove('copied'); }, 1600);
      }).catch(function () {
        // Permission denied, insecure context, document unfocused — whatever
        // blocked the clipboard write, the click still has to do something:
        // fall back to the plain navigation preventDefault() suppressed.
        location.hash = href;
      });
    });
  }

  // Mobile menu — single source of truth for all pages. Reports open/closed
  // state to assistive tech and closes on Escape.
  var t = document.getElementById('mt'), m = document.getElementById('mn');
  if (t && m && !t.dataset.wired) {
    t.dataset.wired = '1';
    t.setAttribute('aria-controls', 'mn');
    t.setAttribute('aria-expanded', 'false');
    var setOpen = function (open) {
      m.classList.toggle('o', open);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      /* The drawer now scrolls internally when it's taller than the
         viewport (styles.css .mm.o) — lock the page underneath it too, or a
         swipe that runs past the drawer's own scroll end just scrolls the
         page instead, invisibly, behind it. */
      document.body.classList.toggle('no-scroll', open);
    };
    t.addEventListener('click', function () { setOpen(!m.classList.contains('o')); });
    m.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && m.classList.contains('o')) { setOpen(false); t.focus(); }
    });
  }
})();

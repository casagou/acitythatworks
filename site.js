/* A City That Works — shared site script: footer + mobile menu */
(function () {
  var FOOTER = '' +
'<footer><div class="c">' +
'<div class="fg2">' +
'<div>' +
'<div class="fbr"><span class="num">№ 01</span><span class="nm">A City That Works</span></div>' +
'<p class="fdc">A Citizens\' Framework for Victoria 2026. Every measure costed. Zero ideology. Just results.</p>' +
'<div class="fsoc">' +
'<a href="https://www.instagram.com/CityThatWorksYYJ/" target="_blank" rel="noopener" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg></a>' +
'<a href="https://x.com/CityThatWorksYYJ" target="_blank" rel="noopener" aria-label="X (Twitter)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>' +
'<a href="https://www.facebook.com/CityThatWorksYYJ" target="_blank" rel="noopener" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>' +
'</div>' +
'<p class="fhandle">@CityThatWorksYYJ</p>' +
'<p class="fvr">v1.3 · May 27, 2026</p>' +
'</div>' +
'<div>' +
'<div class="fhd">The Framework</div>' +
'<div class="fls">' +
'<a href="index.html">Home</a>' +
'<a href="index.html#measures">All Measures</a>' +
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
'<a href="faq.html">Frequently Asked Questions</a>' +
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

  // Mobile menu (in case page didn't wire it inline)
  var t = document.getElementById('mt'), m = document.getElementById('mn');
  if (t && m && !t.dataset.wired) {
    t.dataset.wired = '1';
    t.addEventListener('click', function () { m.classList.toggle('o'); });
    m.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { m.classList.remove('o'); });
    });
  }
})();

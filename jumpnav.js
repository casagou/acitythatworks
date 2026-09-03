/* A City That Works — sticky section navigator, shared by every long document.
   Kept in one file rather than pasted into each page, because two copies of a
   behaviour drift.

   A page opts in by providing #jumpsel, #jumpprev, #jumpnext and #jumpfill.
   The <details> handling is a no-op on pages that have none.

   Two things are configurable, both optional:

   - data-jump-targets on #jumpbar overrides which headings are navigable.
     The default suits a .prose document; index.html's sections sit outside
     .prose, so it passes its own selector rather than being restyled to fit.
   - The <option> list builds itself from those targets when the page ships
     only the placeholder. Hand-maintained lists (14 options on savings, 64 on
     comparison) drift the moment a heading is added, and nothing catches it.
     A page that ships a full list keeps it — the curated grouping on the
     comparison matrix is better than anything derived. */
(function(){
/* Deferred to DOMContentLoaded rather than running at parse time, because on
   the homepage the headings this navigates are written by measures.js from its
   own DOMContentLoaded handler. Script order puts that handler first, so by
   the time this runs the measures exist. On the hand-written pages the DOM is
   already complete either way. */
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
} else { init(); }

function init(){
  var sel=document.getElementById('jumpsel');
  if(!sel) return;
  var bar=document.getElementById('jumpbar');
  var q=(bar&&bar.getAttribute('data-jump-targets'))||'.prose h2[id], .prose h3[id]';
  var targets=[].slice.call(document.querySelectorAll(q)).filter(function(el){return el.id;});
  if(!targets.length) return;

  /* Marks the page as carrying a bar, so the extra scroll offset in styles.css
     applies only where the bar is actually taking up that space. */
  document.documentElement.classList.add('jn');

  /* A heading's text can carry inline badges ("Sub-measure") and footnote
     marks that are noise in a 40-character select. data-jump-label wins where
     a page wants to say something shorter. */
  function labelFor(el){
    var t=el.getAttribute('data-jump-label');
    if(!t) t=(el.textContent||'').replace(/\s+/g,' ').trim();
    return t.length>64?t.slice(0,63).replace(/[\s,;:—-]+$/,'')+'…':t;
  }
  if(sel.options.length<=1){
    var frag=document.createDocumentFragment(), group=null;
    /* Only nest when the page actually has two levels; a flat run of h2s in an
       <optgroup> apiece reads worse than a flat list. */
    var tiered=targets.some(function(el){return el.tagName==='H3';})
            && targets.some(function(el){return el.tagName==='H2';});
    targets.forEach(function(el){
      var o=document.createElement('option');
      o.value=el.id; o.textContent=labelFor(el);
      if(tiered&&el.tagName==='H2'){
        group=document.createElement('optgroup');
        group.label=labelFor(el);
        /* The h2 itself stays selectable — it is a destination, not just a
           heading for the ones under it. */
        group.appendChild(o); frag.appendChild(group);
      } else if(tiered&&group){ group.appendChild(o); }
      else { frag.appendChild(o); }
    });
    sel.appendChild(frag);
  }

  /* A live-door hub card is an always-open article. Context entries and older
     pages still use <details>. Landing on either marks the card that was hit. */
  function reveal(el){
    var d=el.closest?el.closest('details'):null;
    var card=el.classList&&(el.classList.contains('cand')||el.classList.contains('cand-ctx'))
      ?el:(el.closest?el.closest('.cand, .cand-ctx'):null);
    var here=el.tagName==='DETAILS'?el:d;
    var p=el.parentElement;
    while(p){ if(p.tagName==='DETAILS'){ p.open=true; } p=p.parentElement; }
    var mark=card||here;
    if(mark){
      if(here) here.open=true;
      [].forEach.call(document.querySelectorAll('.cand.hl, .cand-ctx.hl, details.hl'),function(x){x.classList.remove('hl')});
      mark.classList.add('hl');
    }
    return mark||el;
  }
  function goto(id){
    var el=document.getElementById(id);
    if(!el) return;
    var t=reveal(el);
    t.scrollIntoView({behavior:'smooth',block:'start'});
    el.setAttribute('tabindex','-1'); el.focus({preventScroll:true});
    history.replaceState(null,'','#'+id);
  }
  var lastIdx=-1;
  function indexOfId(id){ for(var i=0;i<targets.length;i++){ if(targets[i].id===id) return i; } return -1; }
  sel.addEventListener('change',function(){
    if(!sel.value) return;
    lastIdx=indexOfId(sel.value);
    goto(sel.value);
  });
  /* indexFromScroll() reads where the page is scrolled to RIGHT NOW. That is
     correct once, on load, before any button has been pressed. It is wrong
     inside step(): a smooth scroll takes a few hundred ms to arrive, so a
     second tap on "next" fired before the first scroll finishes read a
     window.scrollY that hadn't moved yet, recomputed the same (or a stale)
     index, and stepping from it landed back near the previous section — the
     "down doesn't advance more than a few times in a row" bug. lastIdx is now
     the only thing step() consults, updated synchronously the instant a step
     is taken rather than re-derived from scroll position mid-animation. The
     passive scroll listener still keeps lastIdx (and the select) truthful
     during ordinary free scrolling, when no animation is racing it. */
  function indexFromScroll(){
    var y=window.scrollY+(document.querySelector('header').offsetHeight||56)+90, idx=-1;
    for(var i=0;i<targets.length;i++){ if(targets[i].getBoundingClientRect().top+window.scrollY<=y) idx=i; }
    return idx;
  }
  lastIdx=indexFromScroll();
  function step(dir){
    var base=lastIdx>=0?lastIdx:indexFromScroll();
    var n=Math.min(Math.max(base+dir,0),targets.length-1);
    lastIdx=n;
    if(targets[n]) goto(targets[n].id);
  }
  /* Guarded: the select is the required half of the contract, the steppers are
     the optional half, and a page that ships one without the other should lose
     that button rather than the whole navigator. */
  var prev=document.getElementById('jumpprev'), next=document.getElementById('jumpnext');
  if(prev) prev.addEventListener('click',function(){step(-1)});
  if(next) next.addEventListener('click',function(){step(1)});
  /* keep the select — and lastIdx — showing where the reader actually is */
  var tick=false;
  window.addEventListener('scroll',function(){
    if(tick) return; tick=true;
    requestAnimationFrame(function(){
      var idx=indexFromScroll(), cur=idx>=0?targets[idx].id:'';
      if(idx>=0) lastIdx=idx;
      if(cur && sel.value!==cur){
        var has=false;
        for(var j=0;j<sel.options.length;j++){ if(sel.options[j].value===cur){has=true;break;} }
        if(has) sel.value=cur;
      }
      progress();
      tick=false;
    });
  },{passive:true});

  /* How far through the document the reader is — a page this long gives no
     other cue about its length or where they are in it. */
  var fill=document.getElementById('jumpfill');
  function progress(){
    if(!fill) return;
    var h=document.documentElement.scrollHeight-window.innerHeight;
    var p=h>0?Math.min(Math.max(window.scrollY/h,0),1):0;
    fill.style.width=(p*100).toFixed(1)+'%';
  }
  progress();

  /* Expand / collapse every profile at once. Reading eighteen cards one click
     at a time — or printing the section — needs the bulk control. */
  /* Expand all / Collapse all. No page ships collapsible candidate cards any
     more — the profiles hub renders each one as an always-open <article>, and
     says so in its own callout — so the buttons were removed there rather than
     left to toggle three context entries at the foot of the page while the
     reader watched twenty cards not move. This still works for any
     details.cand that returns. */
  [].forEach.call(document.querySelectorAll('[data-cand-all]'),function(b){
    b.addEventListener('click',function(){
      var open=b.getAttribute('data-cand-all')==='open';
      [].forEach.call(document.querySelectorAll('details.cand, details.cand-ctx'),function(d){ d.open=open; });
    });
  });

  /* In-page links to a profile (index chips, shared URLs) must open the card,
     not just scroll to its closed header. */
  document.addEventListener('click',function(e){
    var a=e.target.closest?e.target.closest('a[href^="#"]'):null;
    if(!a) return;
    var id=a.getAttribute('href').slice(1);
    if(!id||!document.getElementById(id)) return;
    e.preventDefault();
    goto(id);
  });
  function openFromHash(){
    var id=location.hash.slice(1);
    if(!id) return;
    var el=document.getElementById(id);
    if(!el) return;
    var t=reveal(el);
    /* A deep link may land on something that isn't one of the stepper's own
       targets (a candidate profile, say). indexOfId returns -1 there, which
       is correct: step() already falls back to reading the live scroll
       position whenever lastIdx is -1. */
    lastIdx=indexOfId(id);
    /* Force a layout flush before measuring. On the homepage the 132 measures
       are injected by innerHTML moments earlier, and scrolling against a
       layout the browser has not computed yet lands nowhere. */
    void document.body.offsetHeight;
    /* The browser already scrolled to the collapsed position; correct it once
       the card has expanded.

       Explicitly instant: html carries scroll-behavior:smooth, and arriving
       cold on /#m48 would otherwise animate 32,000px down the homepage. A
       shared link should land where it points, not travel there. In-page
       jumps through goto() stay smooth, because there the motion is the cue
       that you moved rather than followed a link. */
    setTimeout(function(){ t.scrollIntoView({block:'start',behavior:'instant'}); },0);
  }
  openFromHash();
  window.addEventListener('hashchange',openFromHash);
  /* Again once webfonts and images have settled: Fraunces and Public Sans
     swap in after this point and re-flow everything above the target, so a
     deep link that was correct at DOMContentLoaded drifts by the time the
     reader sees it. Only for the load-time hash, and only if the reader has
     not already scrolled away themselves. */
  if(location.hash){
    var landed=window.scrollY;
    window.addEventListener('load',function(){
      if(Math.abs(window.scrollY-landed)<4) openFromHash();
    });
  }
}
})();

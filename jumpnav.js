/* A City That Works — sticky section navigator, shared by the two long
   documents (the comparison matrix and the savings analysis). Kept in one file
   rather than pasted into each page, because two copies of a behaviour drift.

   A page opts in by providing #jumpsel, #jumpprev, #jumpnext and #jumpfill.
   The <details> handling is a no-op on pages that have none. */
(function(){
  var sel=document.getElementById('jumpsel');
  if(!sel) return;
  var targets=[].slice.call(document.querySelectorAll('.prose h2[id], .prose h3[id]'));

  /* A candidate profile is a closed <details>. Landing on one without opening
     it drops the reader on a collapsed card with nothing to read, so any jump
     that resolves inside a profile opens it and marks which one it hit. */
  function reveal(el){
    var d=el.closest?el.closest('details'):null;
    var here=el.tagName==='DETAILS'?el:d;
    var p=el.parentElement;
    while(p){ if(p.tagName==='DETAILS'){ p.open=true; } p=p.parentElement; }
    if(here){
      here.open=true;
      [].forEach.call(document.querySelectorAll('details.cand.hl'),function(x){x.classList.remove('hl')});
      here.classList.add('hl');
    }
    return here||el;
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
  /* Step from wherever the reader actually is. lastIdx is authoritative right
     after a jump; otherwise fall back to the last heading above the fold. */
  function currentIdx(){
    var y=window.scrollY+(document.querySelector('header').offsetHeight||56)+90, idx=-1;
    for(var i=0;i<targets.length;i++){ if(targets[i].getBoundingClientRect().top+window.scrollY<=y) idx=i; }
    return idx>=0?idx:lastIdx;
  }
  function step(dir){
    var n=Math.min(Math.max(currentIdx()+dir,0),targets.length-1);
    lastIdx=n;
    if(targets[n]) goto(targets[n].id);
  }
  document.getElementById('jumpprev').addEventListener('click',function(){step(-1)});
  document.getElementById('jumpnext').addEventListener('click',function(){step(1)});
  /* keep the select showing where the reader actually is */
  var tick=false;
  window.addEventListener('scroll',function(){
    if(tick) return; tick=true;
    requestAnimationFrame(function(){
      var y=window.scrollY+(document.querySelector('header').offsetHeight||56)+90, cur='';
      for(var i=0;i<targets.length;i++){ if(targets[i].getBoundingClientRect().top+window.scrollY<=y) cur=targets[i].id; }
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
  [].forEach.call(document.querySelectorAll('[data-cand-all]'),function(b){
    b.addEventListener('click',function(){
      var open=b.getAttribute('data-cand-all')==='open';
      [].forEach.call(document.querySelectorAll('details.cand'),function(d){ d.open=open; });
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
    /* The browser already scrolled to the collapsed position; correct it once
       the card has expanded. */
    setTimeout(function(){ t.scrollIntoView({block:'start'}); },0);
  }
  openFromHash();
  window.addEventListener('hashchange',openFromHash);
})();

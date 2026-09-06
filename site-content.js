/* ═══════════════════════════════════════════════════════════════════════════
   Vitalité — published section overrides (visitor runtime).

   Static HTML renders first. Then this fetches any section rows published from
   the Developer Console's Site Editor and swaps them into the matching
   <section>'s .container. If the fetch fails for any reason the page simply
   keeps its static content — nothing flashes, nothing breaks.

   Visitors see static + published only. Drafts (sm_draft_*) are editor-side
   and are never applied here. The legacy per-device sm_content_<chId> override
   still wins locally, so the old dev tool keeps working for whoever set it.

   No dependency on supabase-js — plain REST so any page can include this.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){

/* Default project config. If the host page declares its own (login/admin do),
   that wins — so switching Supabase projects does not require editing this
   file, the same contract auth-widget.js uses. */
var SB_URL  = (typeof window.SB_URL==='string'  && window.SB_URL)  ? window.SB_URL  : 'https://eytmbftrjvsntyzwbtzl.supabase.co';
var SB_ANON = (typeof window.SB_ANON==='string' && window.SB_ANON) ? window.SB_ANON : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dG1iZnRyanZzbnR5endidHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTU2NjksImV4cCI6MjEwNDIzMTY2OX0.o0vRqteQ5XNgTNvnB3IEE9I67Oo_r4sy7JZ9qOGWSSc';

/* file name -> the `page` key used by the Site Editor's SECTIONS registry */
var PAGE_OF = {
  'index.html':'landing', '':'landing', '/':'landing',
  'guide.html':'guide',
  'exam.html':'exam',
  'usabo.html':'usabo',
  'toc.html':'toc',
  'social.html':'social',
  'infirmary.html':'infirmary'
};

function pageKey(){
  var f=location.pathname.split('/').pop();
  return PAGE_OF.hasOwnProperty(f) ? PAGE_OF[f] : null;
}
/* Each page decides its own default (guide.html starts in 中文 unless sm_lang
   is 'en'; index.html starts in English). Both stamp lang-zh / lang-en on
   <body> in their applyLang, which has already run by the time we inject — so
   read that first and only fall back to the raw preference. */
function isZh(){
  try{
    var b=document.body;
    if(b && b.classList){
      if(b.classList.contains('lang-zh')) return true;
      if(b.classList.contains('lang-en')) return false;
    }
  }catch(e){}
  try{ return localStorage.getItem('sm_lang')==='zh'; }catch(e){ return false; }
}
function hasLegacyOverride(section){
  try{ return !!localStorage.getItem('sm_content_'+section); }catch(e){ return false; }
}

/* Same allow-list as the editor's sanitizer. Published rows were sanitized on
   the way in, but a row is remote data — clean it again on the way out. */
var OK_TAGS = {H1:1,H2:1,H3:1,H4:1,H5:1,H6:1,P:1,SPAN:1,DIV:1,UL:1,OL:1,LI:1,
  TABLE:1,THEAD:1,TBODY:1,TFOOT:1,TR:1,TH:1,TD:1,A:1,STRONG:1,B:1,EM:1,I:1,U:1,IMG:1,
  BLOCKQUOTE:1,BR:1,HR:1,CODE:1,PRE:1,SMALL:1,FIGURE:1,FIGCAPTION:1,DL:1,DT:1,DD:1};
var KILL_TAGS = {SCRIPT:1,STYLE:1,IFRAME:1,OBJECT:1,EMBED:1,LINK:1,META:1,BASE:1,FORM:1,
  INPUT:1,TEXTAREA:1,SELECT:1,OPTION:1,SVG:1,MATH:1,NOSCRIPT:1,TEMPLATE:1,VIDEO:1,AUDIO:1,
  SOURCE:1,BUTTON:1,CANVAS:1,PORTAL:1,FRAME:1,FRAMESET:1};
var OK_ATTRS = {'class':1,'style':1,'href':1,'src':1,'alt':1,'title':1,'colspan':1,'rowspan':1,
  'id':1,'target':1,'rel':1,'width':1,'height':1,'loading':1,'aria-label':1,'role':1};
var OK_DATA = {'data-en':1,'data-zh':1,'data-lang':1,'data-se-hidden':1};

function badUrl(v){
  var s=String(v||'').replace(/[\u0000-\u0020]/g,'').toLowerCase();
  if(s.indexOf('javascript:')===0) return true;
  if(s.indexOf('vbscript:')===0) return true;
  if(s.indexOf('data:')===0 && s.indexOf('data:image/')!==0) return true;
  return false;
}
function cleanStyle(v){
  var s=String(v||'');
  if(/javascript:|expression\s*\(|behaviou?r\s*:|@import|<\//i.test(s)) return '';
  return s;
}
function scrub(node){
  var kids=Array.prototype.slice.call(node.childNodes);
  for(var i=0;i<kids.length;i++){
    var el=kids[i];
    if(el.nodeType===8){ node.removeChild(el); continue; }
    if(el.nodeType!==1) continue;
    var tag=el.nodeName.toUpperCase();
    if(KILL_TAGS[tag]){ node.removeChild(el); continue; }
    if(!OK_TAGS[tag]){
      while(el.firstChild) node.insertBefore(el.firstChild, el);
      node.removeChild(el);
      continue;
    }
    var attrs=Array.prototype.slice.call(el.attributes);
    for(var a=0;a<attrs.length;a++){
      var raw=attrs[a].name, n=raw.toLowerCase(), v=attrs[a].value;
      if(n.indexOf('on')===0){ el.removeAttribute(raw); continue; }
      if(n.indexOf('data-')===0){ if(!OK_DATA[n]) el.removeAttribute(raw); continue; }
      if(!OK_ATTRS[n]){ el.removeAttribute(raw); continue; }
      if((n==='href'||n==='src') && badUrl(v)){ el.removeAttribute(raw); continue; }
      if(n==='style'){
        var cs=cleanStyle(v);
        if(cs){ el.setAttribute('style',cs); } else { el.removeAttribute('style'); }
      }
    }
    scrub(el);
  }
}
function sanitize(html){
  var box=document.createElement('div');
  box.innerHTML=String(html==null?'':html);
  scrub(box);
  return box.innerHTML;
}

/* The pages' own applyLang() is IIFE-scoped on some pages, so do the bilingual
   pass ourselves over the injected subtree. The data-en / data-zh attributes
   survive intact, so the page's existing EN/中文 toggle — which re-queries the
   whole document on click — picks the new markup up from then on. */
function paintLang(box){
  var zh=isZh();
  var els=box.querySelectorAll('[data-en][data-zh]');
  for(var i=0;i<els.length;i++){
    var el=els[i];
    var v=el.getAttribute('data-'+(zh?'zh':'en'));
    if(v!=null) el.textContent=v;
  }
}

/* Free-layout sections published by the Site Editor carry their geometry in
   inline styles, but the positioning context and the narrow-screen fallback
   have to come from a stylesheet. Injected once, and only when such a section
   is actually applied, so pages using none of this pay nothing.

   Default is to reflow into document order below 920px; a section marked
   .se-free-fixed keeps its exact positions at every width (the editor's
   "Keep exact positions on phones" option). */
var cssDone=false;
function ensureFreeCSS(){
  if(cssDone) return;
  cssDone=true;
  var css='.se-free{position:relative;width:100%}'
        + '.se-free > *{position:absolute}'
        + '@media(max-width:920px){'
        +   '.se-free:not(.se-free-fixed){min-height:0!important}'
        +   '.se-free:not(.se-free-fixed) > *{position:static!important;left:auto!important;'
        +     'top:auto!important;width:auto!important;margin:0 0 1rem!important}'
        + '}';
  try{
    var st=document.createElement('style');
    st.id='se-free-css';
    st.textContent=css;
    document.head.appendChild(st);
  }catch(e){}
}

function applyRow(row){
  if(!row || !row.published) return false;
  if(hasLegacyOverride(row.section)) return false;   /* local dev override wins */
  var sec=document.getElementById(row.section);
  if(!sec) return false;
  var box=sec.querySelector('.container') || sec;
  var html = isZh() ? (row.zh_html || row.en_html) : (row.en_html || row.zh_html);
  if(!html) return false;
  box.innerHTML = sanitize(html);
  if(box.querySelector('.se-free')) ensureFreeCSS();
  paintLang(box);
  return true;
}

function run(){
  var page=pageKey();
  if(!page) return;
  if(!SB_URL || SB_URL.indexOf('PASTE')!==-1) return;

  var url = SB_URL + '/rest/v1/site_sections'
          + '?page=eq.' + encodeURIComponent(page)
          + '&published=is.true'
          + '&select=section,en_html,zh_html,published,version';

  fetch(url, { headers:{ 'apikey':SB_ANON, 'Authorization':'Bearer '+SB_ANON } })
    .then(function(r){
      if(!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    })
    .then(function(rows){
      if(!rows || !rows.length) return;
      var applied=0;
      for(var i=0;i<rows.length;i++){ if(applyRow(rows[i])) applied++; }
      if(!applied) return;
      /* If the page happens to expose applyLang globally (guide.html does),
         let it run too so anything it handles beyond text stays consistent. */
      try{ if(typeof window.applyLang==='function') window.applyLang(); }catch(e){}
      try{
        document.dispatchEvent(new CustomEvent('sitecontent:applied',{detail:{page:page,count:applied}}));
      }catch(e){}
    })
    .catch(function(){
      /* Offline, table missing, stale schema cache — the static markup that is
         already on screen is the fallback. Stay silent for visitors. */
    });
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
else run();

})();

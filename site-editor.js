/* ═══════════════════════════════════════════════════════════════════════════
   Vitalité — Visual Site Editor ("Canva-style") for the Developer Console.
   Loaded by admin.html AFTER the console script. Vanilla ES5, no modules.

   Pick a page -> pick a section -> edit it live on a canvas -> save a private
   draft (localStorage) -> publish globally (Supabase `site_sections`).

   Bilingual is non-negotiable: every edit keeps the data-en / data-zh pair so
   the site's applyLang() keeps working after a published override lands.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){

/* ─────────────────────────── Section registry ─────────────────────────── */
/* Add a row here and it shows up in the pickers. Nothing else to change.    */
var SECTIONS = [
  /* index.html — public landing */
  {page:'landing', pageFile:'index.html', id:'hero',             labelEn:'Hero',          labelZh:'首屏',         selector:'#hero',             containerSelector:'.container'},
  {page:'landing', pageFile:'index.html', id:'landing-fork',     labelEn:'Two Doors',     labelZh:'两扇门',       selector:'#landing-fork',     containerSelector:'.container'},
  {page:'landing', pageFile:'index.html', id:'landing-stats',    labelEn:'Stats Strip',   labelZh:'数据条',       selector:'#landing-stats',    containerSelector:'.container'},
  {page:'landing', pageFile:'index.html', id:'landing-features', labelEn:'Features',      labelZh:'功能特色',     selector:'#landing-features', containerSelector:'.container'},
  {page:'landing', pageFile:'index.html', id:'landing-chapters', labelEn:'Chapter Grid',  labelZh:'章节网格',     selector:'#landing-chapters', containerSelector:'.container'},
  {page:'landing', pageFile:'index.html', id:'landing-audience', labelEn:'Who It Is For', labelZh:'适合人群',     selector:'#landing-audience', containerSelector:'.container'},
  {page:'landing', pageFile:'index.html', id:'landing-cta',      labelEn:'Closing CTA',   labelZh:'结尾行动号召', selector:'#landing-cta',      containerSelector:'.container'},
  /* guide.html — the 13 chapters */
  {page:'guide', pageFile:'guide.html', id:'ch1',  labelEn:'1 · The Body as a Machine',    labelZh:'第一章 · 身体如机器',     selector:'#ch1',  containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch2',  labelEn:'2 · Nervous System',           labelZh:'第二章 · 神经系统',       selector:'#ch2',  containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch3',  labelEn:'3 · Cardiovascular System',    labelZh:'第三章 · 心血管系统',     selector:'#ch3',  containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch4',  labelEn:'4 · Integumentary System',     labelZh:'第四章 · 皮肤系统',       selector:'#ch4',  containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch5',  labelEn:'5 · Training Principles',      labelZh:'第五章 · 训练原则',       selector:'#ch5',  containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch6',  labelEn:'6 · Soft Tissue & Injury',     labelZh:'第六章 · 软组织与损伤',   selector:'#ch6',  containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch7',  labelEn:'7 · Recovery Science',         labelZh:'第七章 · 恢复科学',       selector:'#ch7',  containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch8',  labelEn:'8 · Nutrition',                labelZh:'第八章 · 营养',           selector:'#ch8',  containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch9',  labelEn:'9 · Supplements',              labelZh:'第九章 · 补剂',           selector:'#ch9',  containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch10', labelEn:'10 · Ethics & Responsibility', labelZh:'第十章 · 伦理与责任',     selector:'#ch10', containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch11', labelEn:'11 · Rehab & Career',          labelZh:'第十一章 · 康复与职业',   selector:'#ch11', containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch12', labelEn:'12 · Assessment',              labelZh:'第十二章 · 康复评定学',   selector:'#ch12', containerSelector:'.container'},
  {page:'guide', pageFile:'guide.html', id:'ch13', labelEn:'13 · TCM Health',              labelZh:'第十三章 · 中医健康管理', selector:'#ch13', containerSelector:'.container'},
  /* exam.html — NPTE */
  {page:'exam', pageFile:'exam.html', id:'hero',      labelEn:'Hero',           labelZh:'首屏',     selector:'#hero',      containerSelector:'.container'},
  {page:'exam', pageFile:'exam.html', id:'overview',  labelEn:'Exam Overview',  labelZh:'考试概览', selector:'#overview',  containerSelector:'.container'},
  {page:'exam', pageFile:'exam.html', id:'scoring',   labelEn:'Scoring',        labelZh:'评分',     selector:'#scoring',   containerSelector:'.container'},
  {page:'exam', pageFile:'exam.html', id:'blueprint', labelEn:'Blueprint',      labelZh:'考试蓝图', selector:'#blueprint', containerSelector:'.container'},
  {page:'exam', pageFile:'exam.html', id:'path',      labelEn:'Study Path',     labelZh:'备考路径', selector:'#path',      containerSelector:'.container'},
  {page:'exam', pageFile:'exam.html', id:'practex',   labelEn:'Practice Exams', labelZh:'模拟考试', selector:'#practex',   containerSelector:'.container'},
  {page:'exam', pageFile:'exam.html', id:'cert',      labelEn:'Certification',  labelZh:'认证',     selector:'#cert',      containerSelector:'.container'},
  /* usabo.html */
  {page:'usabo', pageFile:'usabo.html', id:'hero',      labelEn:'Hero',           labelZh:'首屏',     selector:'#hero',      containerSelector:'.container'},
  {page:'usabo', pageFile:'usabo.html', id:'overview',  labelEn:'USABO Overview', labelZh:'考试概览', selector:'#overview',  containerSelector:'.container'},
  {page:'usabo', pageFile:'usabo.html', id:'content',   labelEn:'Content Areas',  labelZh:'考查内容', selector:'#content',   containerSelector:'.container'},
  {page:'usabo', pageFile:'usabo.html', id:'strategy',  labelEn:'Strategy',       labelZh:'策略',     selector:'#strategy',  containerSelector:'.container'},
  {page:'usabo', pageFile:'usabo.html', id:'practice',  labelEn:'Practice',       labelZh:'练习',     selector:'#practice',  containerSelector:'.container'},
  {page:'usabo', pageFile:'usabo.html', id:'tips',      labelEn:'Tips',           labelZh:'技巧',     selector:'#tips',      containerSelector:'.container'},
  {page:'usabo', pageFile:'usabo.html', id:'resources', labelEn:'Resources',      labelZh:'资源',     selector:'#resources', containerSelector:'.container'},
  /* toc.html */
  {page:'toc', pageFile:'toc.html', id:'hero',      labelEn:'Hero',          labelZh:'首屏',     selector:'#hero',      containerSelector:'.container'},
  {page:'toc', pageFile:'toc.html', id:'chapters',  labelEn:'Chapter Index', labelZh:'章节目录', selector:'#chapters',  containerSelector:'.container'},
  {page:'toc', pageFile:'toc.html', id:'practice',  labelEn:'Practice',      labelZh:'练习',     selector:'#practice',  containerSelector:'.container'},
  {page:'toc', pageFile:'toc.html', id:'progress',  labelEn:'Progress',      labelZh:'进度',     selector:'#progress',  containerSelector:'.container'},
  {page:'toc', pageFile:'toc.html', id:'resources', labelEn:'Resources',     labelZh:'资源',     selector:'#resources', containerSelector:'.container'},
  {page:'toc', pageFile:'toc.html', id:'refs',      labelEn:'References',    labelZh:'参考文献', selector:'#refs',      containerSelector:'.container'},
  /* social.html + infirmary.html */
  {page:'social',    pageFile:'social.html',    id:'social',         labelEn:'Community Hero', labelZh:'社区首屏', selector:'#social',         containerSelector:'.container'},
  {page:'infirmary', pageFile:'infirmary.html', id:'infirmary-hero', labelEn:'Infirmary Hero', labelZh:'诊所首屏', selector:'#infirmary-hero', containerSelector:'.container'}
];

var PAGE_LABELS = {
  landing:   {en:'Landing',      zh:'首页',     file:'index.html'},
  guide:     {en:'Study Guide',  zh:'学习指南', file:'guide.html'},
  exam:      {en:'NPTE Exam',    zh:'NPTE 考试',file:'exam.html'},
  usabo:     {en:'USABO',        zh:'USABO',    file:'usabo.html'},
  toc:       {en:'Contents',     zh:'目录',     file:'toc.html'},
  social:    {en:'Social',       zh:'社区',     file:'social.html'},
  infirmary: {en:'Infirmary',    zh:'诊所',     file:'infirmary.html'}
};

/* ───────────────────────────── small helpers ───────────────────────────── */
function cn(){ try{ return localStorage.getItem('sm_lang')==='zh'; }catch(e){ return false; } }
function t(en,zh){ return cn()?zh:en; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function $(id){ return document.getElementById(id); }
function me(){
  try{ return JSON.parse(localStorage.getItem('sm_user')||'null')||null; }catch(e){ return null; }
}
function meEmail(){ var u=me(); return (u&&u.email)?String(u.email):'unknown'; }
function nowISO(){ return new Date().toISOString(); }
function fmtTime(iso){ try{ return new Date(iso).toLocaleString(); }catch(e){ return iso||''; } }
function findSection(page,id){
  for(var i=0;i<SECTIONS.length;i++){ if(SECTIONS[i].page===page && SECTIONS[i].id===id) return SECTIONS[i]; }
  return null;
}
function pagesList(){
  var out=[], seen={};
  for(var i=0;i<SECTIONS.length;i++){ var p=SECTIONS[i].page; if(!seen[p]){ seen[p]=1; out.push(p); } }
  return out;
}
function sectionsOf(page){
  var out=[];
  for(var i=0;i<SECTIONS.length;i++){ if(SECTIONS[i].page===page) out.push(SECTIONS[i]); }
  return out;
}
function toast(msg,ok){
  var el=$('seToast');
  if(el){
    el.textContent=msg;
    el.style.borderColor = ok ? 'var(--green)' : 'var(--red)';
    el.style.color = ok ? 'var(--green)' : 'var(--red)';
    el.style.display='block';
    clearTimeout(toast._t);
    toast._t=setTimeout(function(){ if(el) el.style.display='none'; }, 7000);
  }
  if(typeof window.showMsg==='function'){ try{ window.showMsg(msg,ok); }catch(e){} }
}

/* ─────────────────────────────── Sanitizer ─────────────────────────────── */
var OK_TAGS = {H1:1,H2:1,H3:1,H4:1,H5:1,H6:1,P:1,SPAN:1,DIV:1,UL:1,OL:1,LI:1,
  TABLE:1,THEAD:1,TBODY:1,TFOOT:1,TR:1,TH:1,TD:1,A:1,STRONG:1,B:1,EM:1,I:1,U:1,IMG:1,
  BLOCKQUOTE:1,BR:1,HR:1,CODE:1,PRE:1,SMALL:1,FIGURE:1,FIGCAPTION:1,DL:1,DT:1,DD:1};
var KILL_TAGS = {SCRIPT:1,STYLE:1,IFRAME:1,OBJECT:1,EMBED:1,LINK:1,META:1,BASE:1,FORM:1,
  INPUT:1,TEXTAREA:1,SELECT:1,OPTION:1,SVG:1,MATH:1,NOSCRIPT:1,TEMPLATE:1,VIDEO:1,AUDIO:1,
  SOURCE:1,BUTTON:1,CANVAS:1,PORTAL:1,FRAME:1,FRAMESET:1};
var OK_ATTRS = {'class':1,'style':1,'href':1,'src':1,'alt':1,'title':1,'colspan':1,'rowspan':1,
  'id':1,'target':1,'rel':1,'width':1,'height':1,'loading':1,'aria-label':1,'role':1};
var OK_DATA = {'data-en':1,'data-zh':1,'data-lang':1,'data-se-hidden':1,'data-se-lock':1};

var lastStripCount = 0;

function badUrl(v){
  /* strip whitespace + control chars, then look for a script-y scheme */
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
function sanitizeNode(node){
  var kids = Array.prototype.slice.call(node.childNodes);
  for(var i=0;i<kids.length;i++){
    var el=kids[i];
    if(el.nodeType===8){ node.removeChild(el); continue; }        /* comments   */
    if(el.nodeType!==1) continue;                                  /* text is ok */
    var tag=el.nodeName.toUpperCase();
    if(KILL_TAGS[tag]){ node.removeChild(el); lastStripCount++; continue; }
    if(!OK_TAGS[tag]){                                             /* unwrap unknown tags */
      lastStripCount++;
      while(el.firstChild) node.insertBefore(el.firstChild, el);
      node.removeChild(el);
      continue;
    }
    var attrs=Array.prototype.slice.call(el.attributes);
    for(var a=0;a<attrs.length;a++){
      var raw=attrs[a].name, n=raw.toLowerCase(), v=attrs[a].value;
      if(n.indexOf('on')===0){ el.removeAttribute(raw); lastStripCount++; continue; }
      if(n.indexOf('data-')===0){ if(!OK_DATA[n]){ el.removeAttribute(raw); } continue; }
      if(!OK_ATTRS[n]){ el.removeAttribute(raw); lastStripCount++; continue; }
      if((n==='href'||n==='src') && badUrl(v)){ el.removeAttribute(raw); lastStripCount++; continue; }
      if(n==='style'){
        var cs=cleanStyle(v);
        if(cs!==v) lastStripCount++;
        if(cs){ el.setAttribute('style',cs); } else { el.removeAttribute('style'); }
      }
    }
    sanitizeNode(el);
  }
}
/* Returns sanitized HTML. SiteEditor.lastStripped() reports what was removed. */
function sanitizeHTML(html){
  lastStripCount = 0;
  var box=document.createElement('div');
  box.innerHTML = String(html==null?'':html);
  sanitizeNode(box);
  return box.innerHTML;
}

/* ───────────────── Bilingual export: one canvas -> EN + ZH ─────────────── */
/* Leaf elements get their text baked in for the target language; anything    */
/* holding child elements is left intact — the site's applyLang() resolves it */
/* at runtime exactly as it already does for the static markup.               */
function applyLangTo(root, lang){
  var els=root.querySelectorAll('[data-en][data-zh]');
  for(var i=0;i<els.length;i++){
    var el=els[i];
    if(el.children.length===0){
      var v=el.getAttribute('data-'+lang);
      if(v!=null) el.textContent=v;
    }
  }
}
function buildLangPair(cleanHtml){
  var a=document.createElement('div'); a.innerHTML=cleanHtml; applyLangTo(a,'en');
  var b=document.createElement('div'); b.innerHTML=cleanHtml; applyLangTo(b,'zh');
  return {en:a.innerHTML, zh:b.innerHTML};
}

/* ───────────────────────── Draft / version storage ─────────────────────── */
function draftKey(page,id){ return 'sm_draft_'+page+'_'+id; }
function verKey(page,id){ return 'sm_ver_'+page+'_'+id; }

function getDraft(page,id){
  try{
    var raw=localStorage.getItem(draftKey(page,id));
    if(raw){ var d=JSON.parse(raw); if(d && (d.en||d.zh)) return d; }
  }catch(e){}
  /* Legacy migration: the old textarea tool stored raw container HTML under
     sm_content_<chId>. Read it as a draft so nothing is lost. */
  if(page==='guide'){
    try{
      var old=localStorage.getItem('sm_content_'+id);
      if(old){
        var mig=buildLangPair(sanitizeHTML(old));
        mig.updated_at=nowISO(); mig.updated_by=meEmail(); mig.migrated=true;
        return mig;
      }
    }catch(e2){}
  }
  return null;
}
function setDraft(page,id,obj){
  try{ localStorage.setItem(draftKey(page,id), JSON.stringify(obj)); return true; }
  catch(e){ toast(t('Draft too large for this browser’s local storage.','草稿超出浏览器本地存储容量。'),false); return false; }
}
function delDraft(page,id){
  try{ localStorage.removeItem(draftKey(page,id)); }catch(e){}
  try{ if(page==='guide') localStorage.removeItem('sm_content_'+id); }catch(e){}
}
function hasDraft(page,id){ return !!getDraft(page,id); }
function getVersions(page,id){
  try{ return JSON.parse(localStorage.getItem(verKey(page,id))||'[]')||[]; }catch(e){ return []; }
}
function pushVersion(page,id,pair,note){
  var list=getVersions(page,id);
  list.unshift({en:pair.en, zh:pair.zh, ts:nowISO(), by:meEmail(), note:note||''});
  while(list.length>10) list.pop();
  try{ localStorage.setItem(verKey(page,id), JSON.stringify(list)); }
  catch(e){ try{ localStorage.setItem(verKey(page,id), JSON.stringify(list.slice(0,3))); }catch(e2){} }
  return list;
}

/* ───────────────────────── Supabase (raw REST) ─────────────────────────── */
/* Raw fetch instead of supabase-js so the exact PostgREST error is visible —
   the known stale-schema-cache failure reports as PGRST205 and we say so. */
function sbUrl(){ return (typeof window.SB_URL==='string') ? window.SB_URL : ''; }
function sbKey(){ return (typeof window.SB_ANON==='string') ? window.SB_ANON : ''; }
function sbReady(){ return !!(sbUrl() && sbKey() && sbUrl().indexOf('PASTE')===-1); }
function sbHeaders(extra){
  var h={'apikey':sbKey(),'Authorization':'Bearer '+sbKey(),'Content-Type':'application/json'};
  if(extra){ for(var k in extra){ if(extra.hasOwnProperty(k)) h[k]=extra[k]; } }
  return h;
}
function friendlyErr(status, body){
  var code='', msg='';
  try{ var j=JSON.parse(body); code=j.code||''; msg=j.message||j.hint||body; }catch(e){ msg=body||('HTTP '+status); }
  if(code==='PGRST205' || code==='42P01' || /schema cache|does not exist/i.test(msg)){
    return t('Publishing backend unreachable — the site_sections table is missing or the Supabase schema cache is stale. Draft kept locally.',
             '发布后端不可用 — site_sections 表缺失或 Supabase 架构缓存过期。草稿已保存在本地。');
  }
  if(status===401||status===403||code==='42501'){
    return t('Publishing rejected (permission). Check the RLS policy on site_sections. Draft kept locally.',
             '发布被拒绝（权限）。请检查 site_sections 的 RLS 策略。草稿已保存在本地。');
  }
  return t('Publish failed: ','发布失败：')+(msg||('HTTP '+status));
}
function sbPublish(page,id,pair,version,cb){
  if(!sbReady()){ cb(t('Supabase is not configured. Draft kept locally.','未配置 Supabase。草稿已保存在本地。')); return; }
  var row={ page:page, section:id, en_html:pair.en, zh_html:pair.zh, published:true,
            version:version, updated_by:meEmail(), updated_at:nowISO() };
  fetch(sbUrl()+'/rest/v1/site_sections?on_conflict=page,section',{
    method:'POST',
    headers:sbHeaders({'Prefer':'resolution=merge-duplicates,return=representation'}),
    body:JSON.stringify([row])
  }).then(function(r){
    return r.text().then(function(body){
      if(r.ok){ cb(null, body); } else { cb(friendlyErr(r.status, body)); }
    });
  }).catch(function(e){
    cb(t('Publishing backend unreachable (network). Draft kept locally. ','发布后端不可达（网络）。草稿已保存在本地。')+((e&&e.message)||''));
  });
}
function sbUnpublish(page,id,cb){
  if(!sbReady()){ cb(t('Supabase is not configured.','未配置 Supabase。')); return; }
  fetch(sbUrl()+'/rest/v1/site_sections?page=eq.'+encodeURIComponent(page)+'&section=eq.'+encodeURIComponent(id),{
    method:'PATCH', headers:sbHeaders({'Prefer':'return=minimal'}),
    body:JSON.stringify({published:false, updated_by:meEmail(), updated_at:nowISO()})
  }).then(function(r){
    if(r.ok){ cb(null); return null; }
    return r.text().then(function(b){ cb(friendlyErr(r.status,b)); });
  }).catch(function(e){ cb(t('Backend unreachable. ','后端不可达。')+((e&&e.message)||'')); });
}
/* Published state for a whole page — badges the section cards. */
var PUB_CACHE={};
function sbFetchPage(page,cb){
  if(!sbReady()){ cb(t('Supabase not configured','未配置 Supabase'),{}); return; }
  fetch(sbUrl()+'/rest/v1/site_sections?page=eq.'+encodeURIComponent(page)+'&select=section,published,version,updated_by,updated_at',{
    headers:sbHeaders()
  }).then(function(r){
    return r.text().then(function(body){
      if(!r.ok){ cb(friendlyErr(r.status,body),{}); return; }
      var map={};
      try{
        var rows=JSON.parse(body)||[];
        for(var i=0;i<rows.length;i++) map[rows[i].section]=rows[i];
      }catch(e){}
      PUB_CACHE[page]=map;
      cb(null,map);
    });
  }).catch(function(){ cb(t('Backend unreachable','后端不可达'),{}); });
}

/* ─────────────────── Original markup loader (page fetch) ───────────────── */
var DOC_CACHE={};
function loadDoc(pageFile,cb){
  if(DOC_CACHE[pageFile]){ cb(null,DOC_CACHE[pageFile]); return; }
  fetch(pageFile,{cache:'no-store'}).then(function(r){
    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.text();
  }).then(function(html){
    var doc=new DOMParser().parseFromString(html,'text/html');
    DOC_CACHE[pageFile]=doc;
    cb(null,doc);
  }).catch(function(e){ cb((e&&e.message)||'fetch failed'); });
}
function loadOriginal(meta,cb){
  loadDoc(meta.pageFile,function(err,doc){
    if(err){ cb(err); return; }
    var sec=doc.querySelector(meta.selector);
    if(!sec){ cb(t('Section not found in ','未在此文件中找到该区块：')+meta.pageFile); return; }
    var inner=meta.containerSelector ? sec.querySelector(meta.containerSelector) : sec;
    if(!inner) inner=sec;
    cb(null, sanitizeHTML(inner.innerHTML));
  });
}

/* ═══════════════════════════ Editor stylesheet ═══════════════════════════ */
/* Injected once. Everything is expressed in the site's own CSS variables so
   the canvas tracks the user's light/dark theme with no extra work.        */
function injectCSS(){
  if($('seStyles')) return;
  var css=''
  +'.se-card-head{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;justify-content:space-between;margin:.6rem 0 1rem}'
  +'.se-pick{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}'
  +'.se-select{padding:.5rem .8rem;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:.86rem;font-weight:600;cursor:pointer;max-width:100%}'
  +'.se-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(232px,1fr));gap:.85rem}'
  +'.se-tile{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);overflow:hidden;cursor:pointer;transition:transform .18s,box-shadow .18s,border-color .18s;text-align:left;padding:0;font:inherit;color:inherit;display:block;width:100%}'
  +'.se-tile:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:color-mix(in srgb,var(--accent) 45%,var(--border))}'
  +'.se-tile:focus-visible{outline:2px solid var(--accent);outline-offset:2px}'
  +'.se-thumb{height:104px;overflow:hidden;position:relative;background:var(--surface2);border-bottom:1px solid var(--border)}'
  +'.se-thumb-in{position:absolute;top:0;left:0;width:400%;transform:scale(.25);transform-origin:0 0;padding:10px 14px;pointer-events:none}'
  +'.se-thumb-in *{max-width:100%!important;animation:none!important;transition:none!important}'
  +'.se-thumb-sk{padding:14px;display:flex;flex-direction:column;gap:8px}'
  +'.se-thumb-sk i{display:block;height:9px;border-radius:5px;background:var(--border2);opacity:.75}'
  +'.se-tile-b{padding:.7rem .85rem}'
  +'.se-tile-t{font-weight:700;font-size:.88rem;line-height:1.3}'
  +'.se-tile-s{font-size:.72rem;color:var(--text3);margin-top:.15rem;font-family:"SF Mono",Menlo,Consolas,monospace}'
  +'.se-chips{display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.45rem}'
  +'.se-chip{font-size:.66rem;font-weight:800;letter-spacing:.02em;padding:.16rem .5rem;border-radius:999px;border:1px solid var(--border);color:var(--text3)}'
  +'.se-chip.d{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 50%,var(--border));background:var(--accent-bg)}'
  +'.se-chip.p{color:var(--green);border-color:color-mix(in srgb,var(--green) 50%,var(--border))}'
  +'.se-chip.o{color:var(--text3)}'
  /* ---- modal shell ---- */
  +'#seModal{display:none;position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.62);backdrop-filter:blur(5px);align-items:center;justify-content:center;padding:1.2rem}'
  +'#seModal.open{display:flex}'
  +'.se-shell{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);width:min(1480px,97vw);height:min(940px,94vh);display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--shadow-lg)}'
  +'.se-top{display:flex;gap:1rem;align-items:center;justify-content:space-between;padding:.85rem 1.2rem;border-bottom:1px solid var(--border);flex-wrap:wrap}'
  +'.se-top h2{font-size:1.02rem;font-weight:800;margin:0;font-family:var(--font-heading)}'
  +'.se-top .sub{font-size:.73rem;color:var(--text3);font-family:"SF Mono",Menlo,Consolas,monospace}'
  +'.se-body{flex:1;display:flex;min-height:0}'
  +'.se-stage{flex:1;overflow:auto;background:var(--bg);padding:1.4rem;position:relative;min-width:0}'
  +'.se-canvas{max-width:900px;margin:0 auto;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.6rem 1.8rem;box-shadow:var(--shadow-sm);min-height:220px}'
  +'.se-side{width:308px;flex:none;border-left:1px solid var(--border);overflow:auto;background:var(--surface);padding:.9rem 1rem 2rem}'
  +'.se-foot{display:flex;gap:.6rem;align-items:center;justify-content:space-between;padding:.8rem 1.2rem;border-top:1px solid var(--border);flex-wrap:wrap}'
  /* ---- buttons ---- */
  +'.se-b{padding:.45rem .8rem;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface2);color:var(--text);font-weight:700;font-size:.8rem;cursor:pointer;font-family:inherit;line-height:1.2}'
  +'.se-b:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}'
  +'.se-b:disabled{opacity:.4;cursor:not-allowed}'
  +'.se-b:focus-visible{outline:2px solid var(--accent);outline-offset:2px}'
  +'.se-b.pri{background:var(--accent);border-color:var(--accent);color:#fff}'
  +'.se-b.pri:hover:not(:disabled){filter:brightness(1.08);color:#fff}'
  +'.se-b.on{background:var(--accent-bg);border-color:var(--accent);color:var(--accent)}'
  +'.se-b.sm{padding:.3rem .55rem;font-size:.74rem}'
  /* ---- palette ---- */
  +'.se-grp{margin-bottom:1rem}'
  +'.se-grp h4{font-size:.68rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--text3);margin:0 0 .45rem}'
  +'.se-row{display:flex;gap:.35rem;flex-wrap:wrap;align-items:center}'
  +'.se-sw{width:26px;height:26px;border-radius:7px;border:1px solid var(--border2);cursor:pointer;padding:0}'
  +'.se-sw:focus-visible{outline:2px solid var(--accent);outline-offset:2px}'
  +'.se-hint{font-size:.73rem;color:var(--text3);line-height:1.5}'
  +'.se-selinfo{font-family:"SF Mono",Menlo,Consolas,monospace;font-size:.72rem;color:var(--accent);word-break:break-all;background:var(--accent-bg);border:1px solid color-mix(in srgb,var(--accent) 35%,var(--border));border-radius:var(--radius-sm);padding:.4rem .55rem}'
  +'.se-range{width:100%;accent-color:var(--accent)}'
  /* ---- canvas selection affordances ---- */
  +'.se-canvas.edit [data-se-hit]{cursor:pointer}'
  +'.se-canvas.edit [data-se-hit]:hover{outline:1px dashed color-mix(in srgb,var(--accent) 60%,transparent);outline-offset:2px}'
  +'.se-canvas.edit .se-sel{outline:2px solid var(--accent)!important;outline-offset:2px;border-radius:3px}'
  +'.se-canvas.edit .se-blk{position:relative}'
  +'.se-canvas.edit .se-blk.se-sel-blk{box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 55%,transparent);border-radius:var(--radius-sm)}'
  +'.se-canvas .se-hidden{opacity:.34;outline:1px dashed var(--red);outline-offset:3px}'
  /* ---- free layout ---- */
  +'.se-free{position:relative;width:100%}'
  +'.se-free > *{position:absolute}'
  +'.se-canvas.edit .se-free{background-image:radial-gradient(color-mix(in srgb,var(--text3) 34%,transparent) 1px,transparent 1px);background-size:8px 8px}'
  +'.se-canvas.edit .se-free > *{cursor:move}'
  +'.se-canvas.edit .se-free > *.se-dragging{opacity:.85;box-shadow:var(--shadow-lg);z-index:99}'
  +'#seGuides{position:absolute;inset:0;pointer-events:none;z-index:80}'
  +'.se-guide{position:absolute;background:var(--accent);opacity:.9}'
  +'.se-guide.v{width:1px}'
  +'.se-guide.h{height:1px}'
  +'.se-layer{display:flex;align-items:center;gap:.35rem;padding:.3rem .45rem;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:.75rem}'
  +'.se-layer:hover{border-color:var(--accent)}'
  +'.se-layer.on{background:var(--accent-bg);border-color:var(--accent);color:var(--accent)}'
  +'.se-layer-n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
  +'.se-canvas.edit .se-free > *[data-se-lock=\"1\"]{cursor:not-allowed}'
  +'.se-canvas.edit .se-free > *[data-se-lock=\"1\"]:hover{outline:1px dashed var(--text3)}'
  +'.se-rs{position:absolute;right:-6px;bottom:-6px;width:13px;height:13px;border-radius:3px;background:var(--accent);border:2px solid var(--surface);cursor:nwse-resize;z-index:100}'
  +'.se-canvas.preview .se-free{background-image:none}'
  +'.se-canvas.preview .se-hidden{display:none}'
  +'.se-canvas [contenteditable="true"]{outline:2px solid var(--accent);outline-offset:2px;border-radius:3px;background:color-mix(in srgb,var(--accent) 8%,transparent)}'
  /* ---- floating block toolbar ---- */
  +'.se-blocktools{position:absolute;z-index:6;display:none;gap:.25rem;background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:.25rem .35rem;box-shadow:var(--shadow)}'
  +'.se-blocktools.on{display:flex}'
  +'.se-blocktools button{width:27px;height:27px;border-radius:50%;border:none;background:transparent;color:var(--text2);cursor:pointer;font-size:.82rem;line-height:1;display:flex;align-items:center;justify-content:center}'
  +'.se-blocktools button:hover{background:var(--surface3);color:var(--accent)}'
  /* ---- bilingual popover ---- */
  +'#seLangPop{display:none;position:fixed;z-index:420;width:min(430px,92vw);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-lg);padding:.85rem}'
  +'#seLangPop.on{display:block}'
  +'#seLangPop label{display:block;font-size:.68rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--text3);margin:.5rem 0 .25rem}'
  +'#seLangPop textarea{width:100%;min-height:62px;padding:.5rem .6rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--surface2);color:var(--text);font-family:inherit;font-size:.86rem;line-height:1.5;resize:vertical}'
  +'#seLangPop textarea:focus{outline:2px solid var(--accent);outline-offset:-1px}'
  /* ---- misc ---- */
  +'#seToast{display:none;margin:.6rem 0;padding:.6rem .85rem;border:1px solid var(--border);border-left-width:4px;border-radius:var(--radius-sm);font-size:.83rem;font-weight:600;background:var(--surface2)}'
  +'.se-vlist{display:flex;flex-direction:column;gap:.4rem}'
  +'.se-vrow{display:flex;gap:.5rem;align-items:center;justify-content:space-between;padding:.45rem .55rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:.75rem}'
  +'.se-spin{width:16px;height:16px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:se-spin .7s linear infinite;display:inline-block;vertical-align:-3px}'
  +'@keyframes se-spin{to{transform:rotate(360deg)}}'
  +'.se-empty{padding:2rem 1rem;text-align:center;color:var(--text3);font-size:.86rem}'
  /* ---- responsive: palette drops under the canvas below 920px ---- */
  +'@media(max-width:920px){'
  +'.se-free:not(.se-free-fixed){min-height:0!important}'
  +'.se-free:not(.se-free-fixed) > *{position:static!important;left:auto!important;top:auto!important;width:auto!important;margin:0 0 1rem!important}'
  +'#seModal{padding:0}'
  +'.se-shell{width:100vw;height:100vh;border-radius:0;border:none}'
  +'.se-body{flex-direction:column}'
  +'.se-side{width:auto;border-left:none;border-top:1px solid var(--border);max-height:44vh}'
  +'.se-stage{padding:.7rem}'
  +'.se-canvas{padding:1rem}'
  +'}';
  var st=document.createElement('style');
  st.id='seStyles';
  st.textContent=css;
  document.head.appendChild(st);
}

/* ═══════════════════════════ Console card (list) ═══════════════════════════ */
var uiPage = null;

function mount(){
  var root=$('siteEditorRoot');
  if(!root) return;
  injectCSS();
  var pages=pagesList();
  if(!uiPage) uiPage=pages[0];
  var opts='';
  for(var i=0;i<pages.length;i++){
    var lab=PAGE_LABELS[pages[i]]||{en:pages[i],zh:pages[i],file:''};
    opts+='<option value="'+esc(pages[i])+'"'+(pages[i]===uiPage?' selected':'')+'>'
        + esc(t(lab.en,lab.zh))+' · '+esc(lab.file)+'</option>';
  }
  root.innerHTML=''
    +'<div class="se-card-head">'
    +  '<div class="se-pick">'
    +    '<label for="sePage" class="se-hint" style="font-weight:800">'+t('Page','页面')+'</label>'
    +    '<select id="sePage" class="se-select">'+opts+'</select>'
    +    '<button type="button" class="se-b" id="seRefresh">↻ '+t('Refresh status','刷新状态')+'</button>'
    +  '</div>'
    +  '<div class="se-hint" id="seBackend">'+t('Checking publish backend…','正在检查发布后端…')+'</div>'
    +'</div>'
    +'<div id="seToast"></div>'
    +'<div class="se-grid" id="seSectionGrid"><div class="se-empty"><span class="se-spin"></span></div></div>';
  $('sePage').addEventListener('change',function(){ uiPage=this.value; renderSections(); });
  $('seRefresh').addEventListener('click',function(){ delete PUB_CACHE[uiPage]; renderSections(); });
  ensureModal();
  renderSections();
}

function renderSections(){
  var grid=$('seSectionGrid');
  if(!grid) return;
  var list=sectionsOf(uiPage);
  var meta=PAGE_LABELS[uiPage]||{file:''};
  grid.innerHTML='<div class="se-empty"><span class="se-spin"></span> '+t('Loading section previews…','正在加载区块预览…')+'</div>';

  /* publish status (best effort — the grid renders regardless) */
  var pubMap = PUB_CACHE[uiPage] || null;
  var pending = 2;
  var docErr=null;
  var doc=null;
  function done(){ if(--pending===0) paint(); }

  if(pubMap){ pending--; }
  else {
    sbFetchPage(uiPage,function(err,map){
      pubMap = map || {};
      var b=$('seBackend');
      if(b){
        b.innerHTML = err
          ? '<span style="color:var(--red)">● '+esc(t('Publish backend offline — drafts still work','发布后端离线 — 草稿仍可使用'))+'</span>'
            + ' <a href="site_sections.sql" target="_blank" rel="noopener" style="color:var(--accent)">'+esc(t('setup SQL','建表 SQL'))+'</a>'
          : '<span style="color:var(--green)">● '+esc(t('Publish backend online','发布后端在线'))+'</span>';
      }
      done();
    });
  }
  loadDoc(meta.file,function(err,d){ docErr=err; doc=d; done(); });

  function paint(){
    var html='';
    for(var i=0;i<list.length;i++){
      var s=list[i];
      var thumb='<div class="se-thumb-sk"><i style="width:38%"></i><i style="width:82%"></i><i style="width:66%"></i><i style="width:74%"></i></div>';
      if(doc){
        var node=doc.querySelector(s.selector);
        var inner=node ? (node.querySelector(s.containerSelector)||node) : null;
        if(inner){
          var mini=document.createElement('div');
          mini.innerHTML=sanitizeHTML(inner.innerHTML);
          while(mini.children.length>4) mini.removeChild(mini.lastChild);
          applyLangTo(mini, cn()?'zh':'en');
          thumb='<div class="se-thumb-in">'+mini.innerHTML+'</div>';
        }
      }
      var d=hasDraft(s.page,s.id);
      var p=pubMap?pubMap[s.id]:null;
      var chips='';
      if(d) chips+='<span class="se-chip d">'+t('DRAFT','草稿')+'</span>';
      if(p && p.published) chips+='<span class="se-chip p">'+t('PUBLISHED v','已发布 v')+esc(p.version||1)+'</span>';
      if(!d && !(p&&p.published)) chips+='<span class="se-chip o">'+t('ORIGINAL','原始')+'</span>';
      html+='<button type="button" class="se-tile" data-page="'+esc(s.page)+'" data-id="'+esc(s.id)+'">'
          +   '<div class="se-thumb">'+thumb+'</div>'
          +   '<div class="se-tile-b">'
          +     '<div class="se-tile-t">'+esc(t(s.labelEn,s.labelZh))+'</div>'
          +     '<div class="se-tile-s">'+esc(s.selector)+'</div>'
          +     '<div class="se-chips">'+chips+'</div>'
          +   '</div>'
          + '</button>';
    }
    if(docErr){
      html='<div class="se-empty">'+esc(t('Could not load ','无法加载 ')+meta.file+' — '+docErr)+'</div>'+html;
    }
    grid.innerHTML=html||'<div class="se-empty">'+t('No sections registered for this page.','该页面尚未注册区块。')+'</div>';
    var tiles=grid.querySelectorAll('.se-tile');
    for(var k=0;k<tiles.length;k++){
      tiles[k].addEventListener('click',function(){ openEditor(this.getAttribute('data-page'), this.getAttribute('data-id')); });
    }
  }
}

/* ═══════════════════════════ Editor modal ═══════════════════════════ */
var cur = null;           /* active section meta                              */
var origHTML = '';        /* pristine markup straight from the page file      */
var undoStack = [];       /* innerHTML snapshots                              */
var undoAt = -1;          /* pointer into undoStack                           */
var selEl = null;         /* selected element                                 */
var previewMode = false;

function content(){ return $('seContent'); }
function canvas(){ return $('seCanvas'); }

function ensureModal(){
  if($('seModal')) return;
  var wrap=document.createElement('div');
  wrap.id='seModal';
  wrap.setAttribute('role','dialog');
  wrap.setAttribute('aria-modal','true');
  wrap.setAttribute('aria-label','Site Editor');
  wrap.innerHTML=''
  +'<div class="se-shell">'
  +  '<div class="se-top">'
  +    '<div><h2 id="seTitle">Section</h2><div class="sub" id="seSub"></div></div>'
  +    '<div class="se-row">'
  +      '<button type="button" class="se-b" id="sePreview">👁 '+t('Preview','预览')+'</button>'
  +      '<button type="button" class="se-b" id="seClose">✕ '+t('Close','关闭')+'</button>'
  +    '</div>'
  +  '</div>'
  +  '<div class="se-body">'
  +    '<div class="se-stage" id="seStage">'
  +      '<div class="se-canvas edit" id="seCanvas"><div id="seContent"></div></div>'
  +      '<div class="se-blocktools" id="seBlockTools">'
  +        '<button type="button" data-act="up"    title="'+t('Move up','上移')+'">↑</button>'
  +        '<button type="button" data-act="down"  title="'+t('Move down','下移')+'">↓</button>'
  +        '<button type="button" data-act="dup"   title="'+t('Duplicate','复制')+'">⧉</button>'
  +        '<button type="button" data-act="hide"  title="'+t('Hide / show','隐藏/显示')+'">👁</button>'
  +        '<button type="button" data-act="del"   title="'+t('Delete','删除')+'">🗑</button>'
  +      '</div>'
  +    '</div>'
  +    '<div class="se-side" id="seSide"></div>'
  +  '</div>'
  +  '<div class="se-foot">'
  +    '<div class="se-row">'
  +      '<button type="button" class="se-b" id="seUndo">↶ '+t('Undo','撤销')+'</button>'
  +      '<button type="button" class="se-b" id="seRedo">↷ '+t('Redo','重做')+'</button>'
  +      '<span class="se-hint" id="seStatus"></span>'
  +    '</div>'
  +    '<div class="se-row">'
  +      '<button type="button" class="se-b" id="seReset">↺ '+t('Reset to original','恢复原始')+'</button>'
  +      '<button type="button" class="se-b" id="seSave">💾 '+t('Save Draft','保存草稿')+'</button>'
  +      '<button type="button" class="se-b pri" id="sePublish">🚀 '+t('Publish','发布')+'</button>'
  +    '</div>'
  +  '</div>'
  +'</div>'
  +'<div id="seLangPop"></div>';
  document.body.appendChild(wrap);

  $('seClose').addEventListener('click', closeEditor);
  wrap.addEventListener('mousedown',function(e){ if(e.target===wrap) closeEditor(); });
  $('sePreview').addEventListener('click', togglePreview);
  $('seUndo').addEventListener('click', undo);
  $('seRedo').addEventListener('click', redo);
  $('seSave').addEventListener('click', saveDraft);
  $('seReset').addEventListener('click', resetSection);
  $('sePublish').addEventListener('click', publish);

  content().addEventListener('click', onCanvasClick);
  content().addEventListener('pointerdown', onCanvasPointerDown);
  $('seStage').addEventListener('scroll', function(){ positionTools(); placeResizeGrip(); });
  window.addEventListener('resize', function(){ positionTools(); placeResizeGrip(); });

  var tools=$('seBlockTools').querySelectorAll('button');
  for(var i=0;i<tools.length;i++){
    tools[i].addEventListener('click',function(e){ e.stopPropagation(); blockAction(this.getAttribute('data-act')); });
  }
  document.addEventListener('keydown', onKey);
}

function onKey(e){
  var m=$('seModal');
  if(!m || !m.classList.contains('open')) return;
  if(e.key==='Escape'){
    if($('seLangPop').classList.contains('on')){ closeLangPop(); e.stopPropagation(); return; }
    closeEditor();
    return;
  }
  var mod = e.metaKey || e.ctrlKey;
  if(mod && String(e.key).toLowerCase()==='z'){
    if(document.activeElement && document.activeElement.isContentEditable) return;
    e.preventDefault();
    if(e.shiftKey) redo(); else undo();
  }
  if(mod && String(e.key).toLowerCase()==='s'){ e.preventDefault(); saveDraft(); }
  if(mod && String(e.key).toLowerCase()==='c' && selEl && !window.getSelection().toString()){ copySel(); return; }
  if(mod && String(e.key).toLowerCase()==='v' && clipboard){ e.preventDefault(); pasteSel(); return; }
  if(mod && String(e.key).toLowerCase()==='d' && selEl){ e.preventDefault(); blockAction('dup'); return; }
  if((e.key==='Delete'||e.key==='Backspace') && selEl && !(document.activeElement && document.activeElement.isContentEditable)){
    e.preventDefault(); blockAction('del'); return;
  }
  if(!mod && /^Arrow(Up|Down|Left|Right)$/.test(e.key)){
    if(document.activeElement && document.activeElement.isContentEditable) return;
    var dx = e.key==='ArrowLeft' ? -1 : e.key==='ArrowRight' ? 1 : 0;
    var dy = e.key==='ArrowUp'   ? -1 : e.key==='ArrowDown'  ? 1 : 0;
    if(nudge(dx,dy,e.shiftKey)) e.preventDefault();
  }
}

function openEditor(page,id){
  var meta=findSection(page,id);
  if(!meta) return;
  ensureModal();
  cur=meta;
  selEl=null; previewMode=false;
  undoStack=[]; undoAt=-1;
  $('seTitle').textContent=t(meta.labelEn,meta.labelZh);
  $('seSub').textContent=meta.pageFile+' '+meta.selector+' > '+meta.containerSelector;
  canvas().classList.remove('preview');
  canvas().classList.add('edit');
  $('sePreview').classList.remove('on');
  $('seModal').classList.add('open');
  content().innerHTML='<div class="se-empty"><span class="se-spin"></span> '+t('Loading section…','正在加载区块…')+'</div>';
  renderPalette();
  hideTools();

  loadOriginal(meta,function(err,html){
    if(err){
      origHTML='';
      content().innerHTML='<div class="se-empty" style="color:var(--red)">'+esc(err)+'</div>';
      setStatus(t('Could not load the original markup.','无法加载原始内容。'));
      return;
    }
    origHTML=html;
    var d=getDraft(meta.page,meta.id);
    content().innerHTML = d ? (cn() ? (d.zh||d.en) : (d.en||d.zh)) : html;
    markBlocks();
    /* Everything is movable by default: a section opens ready to drag unless
       its saved draft deliberately went back to flow. Layout stays reversible
       from the palette. */
    if(!isFree()){
      try{ enterFreeMode(true); }catch(e){}
    }
    markBlocks();
    snapshot(true);
    /* the palette first rendered against an empty canvas — refresh it now that
       the section (and its layers) actually exist */
    renderPalette();
    placeResizeGrip();
    setStatus(d
      ? (t('Draft loaded · ','已载入草稿 · ')+fmtTime(d.updated_at)+' · '+(d.updated_by||'')+(d.migrated?t(' (migrated from the legacy editor)',' （由旧编辑器迁移）'):''))
      : t('Original content · no draft yet','原始内容 · 尚无草稿'));
  });
}
function closeEditor(){
  closeLangPop();
  hideTools();
  var m=$('seModal');
  if(m) m.classList.remove('open');
  cur=null; selEl=null;
  renderSections();
}
function setStatus(s){ var el=$('seStatus'); if(el) el.textContent=s; }

/* Tag every direct child of the container as a movable block, and everything
   with text as a click target. Editor-only attributes; stripped on export.  */
function markBlocks(){
  var c=content();
  if(!c) return;
  var host=c.querySelector(':scope > .se-free') || c;
  var kids=host.children;
  for(var i=0;i<kids.length;i++) kids[i].classList.add('se-blk');
  var all=c.querySelectorAll('*');
  for(var k=0;k<all.length;k++){
    var el=all[k];
    if(el.getAttribute('data-se-hidden')==='1') el.classList.add('se-hidden');
    if(el.hasAttribute('data-en') || el.children.length===0) el.setAttribute('data-se-hit','1');
  }
}

/* ═══════════════════════ Selection + floating toolbar ═══════════════════ */
/* In free-layout mode the blocks are children of the .se-free wrapper rather
   than of #seContent, so every block operation goes through this. */
function freeWrap(){ var c=content(); return c ? c.querySelector(':scope > .se-free') : null; }
function isFree(){ return !!freeWrap(); }
function blockParent(){ return freeWrap() || content(); }
function blockOf(el){
  var c=blockParent();
  while(el && el.parentNode!==c){ el=el.parentNode; if(!el || el===document.body) return null; }
  return el;
}
function clearSel(){
  var c=content();
  if(!c) return;
  var s=c.querySelectorAll('.se-sel,.se-sel-blk');
  for(var i=0;i<s.length;i++){ s[i].classList.remove('se-sel'); s[i].classList.remove('se-sel-blk'); }
}
function select(el){
  clearSel();
  selEl=el;
  if(!el){ hideTools(); renderPalette(); return; }
  el.classList.add('se-sel');
  var b=blockOf(el);
  if(b) b.classList.add('se-sel-blk');
  positionTools();
  renderPalette();
  placeResizeGrip();
}
function hideTools(){ var tb=$('seBlockTools'); if(tb) tb.classList.remove('on'); }
function positionTools(){
  var tb=$('seBlockTools');
  if(!tb) return;
  if(!selEl || previewMode || !document.body.contains(selEl)){ tb.classList.remove('on'); return; }
  var b=blockOf(selEl);
  if(!b){ tb.classList.remove('on'); return; }
  var stage=$('seStage');
  var br=b.getBoundingClientRect(), sr=stage.getBoundingClientRect();
  tb.classList.add('on');
  var top=br.top - sr.top + stage.scrollTop - tb.offsetHeight - 6;
  if(top < stage.scrollTop + 2) top = br.top - sr.top + stage.scrollTop + 4;
  tb.style.top = top+'px';
  tb.style.left = Math.max(6, br.right - sr.left + stage.scrollLeft - tb.offsetWidth)+'px';
}

function onCanvasClick(e){
  if(previewMode) return;
  if(justDragged) return;          /* the pointerup that ended a drag */
  var el=e.target;
  if(el===content()) { select(null); closeLangPop(); return; }
  e.preventDefault();
  e.stopPropagation();
  /* Prefer the nearest element that is an actual text carrier. */
  var hit=el;
  while(hit && hit!==content() && !hit.hasAttribute('data-se-hit')) hit=hit.parentNode;
  if(!hit || hit===content()) hit=el;
  select(hit);
  if(hit.hasAttribute('data-en') && hit.hasAttribute('data-zh')){
    openLangPop(hit);
  } else if(hit.children.length===0 && String(hit.textContent||'').length){
    closeLangPop();
    startInline(hit);
  } else {
    closeLangPop();
  }
}

/* ── plain (non-bilingual) inline editing ── */
function startInline(el){
  if(el.getAttribute('contenteditable')==='true') return;
  var before=content().innerHTML;
  el.setAttribute('contenteditable','true');
  el.focus();
  function finish(){
    el.removeAttribute('contenteditable');
    el.removeEventListener('blur',finish);
    if(content().innerHTML!==before) snapshot();
  }
  el.addEventListener('blur',finish);
}

/* ═══════════════════════ Bilingual edit popover ═══════════════════════ */
var popTarget=null;
function closeLangPop(){
  var p=$('seLangPop');
  if(p){ p.classList.remove('on'); p.innerHTML=''; }
  popTarget=null;
}
function openLangPop(el){
  var p=$('seLangPop');
  if(!p) return;
  popTarget=el;
  var en=el.getAttribute('data-en')||'';
  var zh=el.getAttribute('data-zh')||'';
  var enOnly = el.getAttribute('data-lang')==='en';
  p.innerHTML=''
   +'<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">'
   +  '<strong style="font-size:.83rem">'+t('Edit both languages','编辑双语内容')+'</strong>'
   +  '<button type="button" class="se-b sm" id="sePopX">✕</button>'
   +'</div>'
   +'<label for="sePopEn">English (data-en)</label>'
   +'<textarea id="sePopEn">'+esc(en)+'</textarea>'
   +'<label for="sePopZh">中文 (data-zh)</label>'
   +'<textarea id="sePopZh"'+(enOnly?' disabled':'')+'>'+esc(zh)+'</textarea>'
   +'<label style="display:flex;align-items:center;gap:.4rem;text-transform:none;letter-spacing:0;font-size:.76rem;font-weight:600;color:var(--text2);margin-top:.55rem">'
   +  '<input type="checkbox" id="sePopEnOnly"'+(enOnly?' checked':'')+'> '+t('EN only (skip Chinese for this element)','仅英文（此元素跳过中文）')
   +'</label>'
   +'<div class="se-row" style="margin-top:.7rem;justify-content:flex-end">'
   +  '<button type="button" class="se-b" id="sePopCancel">'+t('Cancel','取消')+'</button>'
   +  '<button type="button" class="se-b pri" id="sePopOk">'+t('Apply','应用')+'</button>'
   +'</div>';
  p.classList.add('on');
  var r=el.getBoundingClientRect();
  var top=Math.min(window.innerHeight - p.offsetHeight - 12, r.bottom + 8);
  var left=Math.min(window.innerWidth - p.offsetWidth - 12, Math.max(12, r.left));
  p.style.top=Math.max(12,top)+'px';
  p.style.left=left+'px';
  $('sePopEn').focus();
  $('sePopX').addEventListener('click',closeLangPop);
  $('sePopCancel').addEventListener('click',closeLangPop);
  $('sePopEnOnly').addEventListener('change',function(){ $('sePopZh').disabled=this.checked; });
  $('sePopOk').addEventListener('click',applyLangPop);
  p.addEventListener('keydown',function(e){
    if(e.key==='Enter' && (e.metaKey||e.ctrlKey)){ e.preventDefault(); applyLangPop(); }
  });
}
function applyLangPop(){
  if(!popTarget) return;
  var enOnly=$('sePopEnOnly').checked;
  var en=$('sePopEn').value;
  var zh=enOnly ? en : $('sePopZh').value;
  popTarget.setAttribute('data-en',en);
  popTarget.setAttribute('data-zh',zh);
  if(enOnly) popTarget.setAttribute('data-lang','en'); else popTarget.removeAttribute('data-lang');
  if(popTarget.children.length===0) popTarget.textContent = cn()?zh:en;
  closeLangPop();
  snapshot();
  positionTools();
}

/* ═══════════════════════════ Undo / redo ═══════════════════════════ */
/* Snapshots must hold content only — never editor chrome. The resize grip is a
   live DOM decoration, so strip it from the captured string or undo/redo can
   bake it in or duplicate it. */
function cleanHTML(){
  var c=content();
  if(!c) return '';
  if(!c.querySelector('.se-rs')) return c.innerHTML;
  var clone=c.cloneNode(true);
  var g=clone.querySelectorAll('.se-rs');
  for(var i=0;i<g.length;i++) g[i].parentNode.removeChild(g[i]);
  return clone.innerHTML;
}
function snapshot(initial){
  var c=content();
  if(!c) return;
  var html=cleanHTML();
  if(!initial && undoAt>=0 && undoStack[undoAt]===html) return;
  undoStack = undoStack.slice(0, undoAt+1);
  undoStack.push(html);
  while(undoStack.length>40){ undoStack.shift(); }
  undoAt = undoStack.length-1;
  syncUndoBtns();
}
function restore(i){
  var c=content();
  if(!c || i<0 || i>=undoStack.length) return;
  undoAt=i;
  c.innerHTML=undoStack[i];
  markBlocks();
  selEl=null;
  hideTools();
  closeLangPop();
  renderPalette();
  placeResizeGrip();
  syncUndoBtns();
}
function undo(){ if(undoAt>0) restore(undoAt-1); }
function redo(){ if(undoAt<undoStack.length-1) restore(undoAt+1); }
function syncUndoBtns(){
  var u=$('seUndo'), r=$('seRedo');
  if(u) u.disabled = !(undoAt>0);
  if(r) r.disabled = !(undoAt<undoStack.length-1);
}

/* ═══════════════════════════ Block operations ═══════════════════════════ */
function blockAction(act){
  var b=selEl?blockOf(selEl):null;
  if(!b){ toast(t('Select a block first.','请先选择一个区块。'),false); return; }
  var c=blockParent();
  if(act==='front'){ b.style.zIndex=String(topZ()+1); markBlocks(); snapshot(); return; }
  if(act==='back'){ b.style.zIndex='0'; markBlocks(); snapshot(); return; }
  if(act==='up'){ if(b.previousElementSibling) c.insertBefore(b, b.previousElementSibling); }
  else if(act==='down'){ if(b.nextElementSibling) c.insertBefore(b.nextElementSibling, b); }
  else if(act==='dup'){
    var cp=b.cloneNode(true);
    cp.classList.remove('se-sel','se-sel-blk');
    c.insertBefore(cp, b.nextSibling);
    if(isFree()){
      cp.style.left = (pctLeft(b) + 2) + '%';
      cp.style.top  = (parseFloat(b.style.top||0) + 24) + 'px';
      cp.style.zIndex = String(topZ()+1);
    }
  }
  else if(act==='hide'){
    if(b.getAttribute('data-se-hidden')==='1'){ b.removeAttribute('data-se-hidden'); b.classList.remove('se-hidden'); }
    else { b.setAttribute('data-se-hidden','1'); b.classList.add('se-hidden'); }
  }
  else if(act==='del'){
    if(!confirm(t('Delete this block?','删除此区块？'))) return;
    c.removeChild(b);
    selEl=null; hideTools();
  }
  markBlocks();
  snapshot();
  positionTools();
}

/* ── add block ── */
var BLOCK_TPL = {
  heading:  function(){ return '<h3 data-en="New heading" data-zh="新标题">New heading</h3>'; },
  para:     function(){ return '<p data-en="New paragraph. Replace this text." data-zh="新段落。请替换此文本。">New paragraph. Replace this text.</p>'; },
  divider:  function(){ return '<hr>'; },
  callout:  function(){ return '<blockquote class="note" data-en="Note: something worth flagging." data-zh="注意：值得强调的内容。">Note: something worth flagging.</blockquote>'; },
  list:     function(){ return '<ul><li data-en="First point" data-zh="第一点">First point</li><li data-en="Second point" data-zh="第二点">Second point</li></ul>'; },
  image:    function(url,alt){ return '<img class="inline-img" src="'+esc(url)+'" alt="'+esc(alt||'')+'" loading="lazy">'; }
};
function addBlock(kind){
  var c=blockParent();
  if(!c || !cur) return;
  var html;
  if(kind==='image'){
    var url=prompt(t('Image URL (https:// or a path inside the site):','图片地址（https:// 或站内路径）：'),'');
    if(!url) return;
    if(badUrl(url)){ toast(t('That URL was rejected as unsafe.','该地址被判定为不安全，已拒绝。'),false); return; }
    var alt=prompt(t('Alt text (accessibility):','替代文本（无障碍）：'),'')||'';
    html=BLOCK_TPL.image(url,alt);
  } else {
    if(!BLOCK_TPL[kind]) return;
    html=BLOCK_TPL[kind]();
  }
  var holder=document.createElement('div');
  holder.innerHTML=sanitizeHTML(html);
  var node=holder.firstElementChild;
  if(!node) return;
  var b=selEl?blockOf(selEl):null;
  if(b && b.nextSibling) c.insertBefore(node, b.nextSibling);
  else c.appendChild(node);
  if(isFree()){
    node.style.position='absolute';
    node.style.left = (b ? pctLeft(b)+2 : 6) + '%';
    node.style.top  = (b ? parseFloat(b.style.top||0)+40 : 24) + 'px';
    node.style.width = (b ? (parseFloat(b.style.width)||46) : 46) + '%';
    node.style.zIndex = String(topZ()+1);
    growWrap();
  }
  markBlocks();
  snapshot();
  select(node);
}

/* ═══════════════════════════ Free layout mode ═══════════════════════════ */
/* Opt-in per section. Blocks become absolutely positioned inside a .se-free
   wrapper and can be dragged to any x/y and resized. Geometry is stored as
   left/width in % of the wrapper and top in px, so the layout scales with the
   container width instead of being pinned to one screen size.

   The wrapper carries the geometry in inline styles, so it survives the
   sanitizer and round-trips through en_html / zh_html untouched. */

var GRID = 8;                 /* snap step in px; hold Alt to place freely */
var dragState = null;
var justDragged = false;      /* suppresses the click that follows a drag   */

function pctLeft(b){ return parseFloat(b.style.left) || 0; }
function topZ(){
  var host=blockParent(), max=0;
  if(!host) return 0;
  for(var i=0;i<host.children.length;i++){
    var z=parseInt(host.children[i].style.zIndex,10);
    if(!isNaN(z) && z>max) max=z;
  }
  return max;
}
/* Keep the wrapper tall enough to contain the lowest block. */
function growWrap(){
  var w=freeWrap();
  if(!w) return;
  var low=0;
  for(var i=0;i<w.children.length;i++){
    var b=w.children[i];
    var bottom=(parseFloat(b.style.top)||0) + b.offsetHeight;
    if(bottom>low) low=bottom;
  }
  w.style.minHeight=Math.max(200, Math.ceil(low)+40)+'px';
}

/* ── flow -> free: freeze what is already on screen so nothing jumps ── */
function enterFreeMode(quiet){
  var c=content();
  if(!c || isFree()) return;
  var kids=Array.prototype.slice.call(c.children);
  if(!kids.length){ if(!quiet) toast(t('Nothing to position yet — add a block first.','还没有可定位的内容 — 请先添加区块。'),false); return; }

  var cRect=c.getBoundingClientRect();
  var geo=[];
  for(var i=0;i<kids.length;i++){
    var r=kids[i].getBoundingClientRect();
    geo.push({
      left: cRect.width ? ((r.left-cRect.left)/cRect.width*100) : 0,
      top:  r.top-cRect.top,
      width:cRect.width ? (r.width/cRect.width*100) : 100
    });
  }
  var wrap=document.createElement('div');
  wrap.className='se-free';
  wrap.style.position='relative';
  while(c.firstChild) wrap.appendChild(c.firstChild);
  c.appendChild(wrap);

  for(var k=0;k<kids.length;k++){
    var b=kids[k], g=geo[k];
    b.style.position='absolute';
    b.style.left=round2(g.left)+'%';
    b.style.top=Math.round(g.top)+'px';
    b.style.width=round2(g.width)+'%';
    b.style.margin='0';
  }
  growWrap();
  markBlocks();
  if(!quiet){
    snapshot();
    renderPalette();
    toast(t('Free layout on — drag any block to move it, drag its corner to resize.','自由布局已开启 — 拖动区块移动，拖动右下角调整大小。'), true);
  }
}

/* ── free -> flow: drop positioning, keep the visual top-to-bottom order ── */
function exitFreeMode(){
  var c=content(), w=freeWrap();
  if(!c || !w) return;
  var kids=Array.prototype.slice.call(w.children);
  kids.sort(function(a,b){
    var d=(parseFloat(a.style.top)||0)-(parseFloat(b.style.top)||0);
    return d!==0 ? d : (pctLeft(a)-pctLeft(b));
  });
  for(var i=0;i<kids.length;i++){
    var b=kids[i];
    b.style.position=''; b.style.left=''; b.style.top='';
    b.style.width=''; b.style.zIndex=''; b.style.margin='';
    if(!b.getAttribute('style')) b.removeAttribute('style');
    c.appendChild(b);
  }
  c.removeChild(w);
  markBlocks();
  snapshot();
  renderPalette();
  toast(t('Back to flow layout — blocks stack in order again.','已恢复流式布局 — 区块重新按顺序排列。'), true);
}
function round2(n){ return Math.round(n*100)/100; }

/* Positions fixed at every width, vs reflowing to a readable stack on phones.
   Default is to reflow; this toggle pins them instead. */
function toggleMobileFixed(){
  var w=freeWrap();
  if(!w) return;
  w.classList.toggle('se-free-fixed');
  snapshot();
  renderPalette();
  toast(w.classList.contains('se-free-fixed')
    ? t('Positions now fixed at every screen width — check narrow screens yourself.','已在所有屏幕宽度固定位置 — 请自行检查窄屏效果。')
    : t('Narrow screens will stack these blocks in order again.','窄屏将重新按顺序堆叠这些区块。'), true);
}

/* ═══════════════════════════ Drag + resize ═══════════════════════════ */
function onCanvasPointerDown(e){
  if(previewMode || !isFree()) return;
  if(e.button !== 0 && e.pointerType === 'mouse') return;
  var el=e.target;
  if(el && el.getAttribute && el.getAttribute('contenteditable')==='true') return;
  if(el && el.closest && el.closest('[contenteditable="true"]')) return;

  var b = blockOf(el);
  if(!b) return;
  var resizing = false;
  if(b.getAttribute('data-se-lock')==='1') return;   /* locked in the layers panel */

  /* Alt-drag duplicates, the way a design tool does. */
  if(!resizing && e.altKey){
    var dupe=b.cloneNode(true);
    dupe.classList.remove('se-sel','se-sel-blk');
    var dg=dupe.querySelectorAll('.se-rs');
    for(var q=0;q<dg.length;q++) dg[q].parentNode.removeChild(dg[q]);
    dupe.style.zIndex=String(topZ()+1);
    b.parentNode.insertBefore(dupe, b.nextSibling);
    markBlocks();
    select(dupe);
    b=dupe;
  }

  var wrap=freeWrap();
  var wRect=wrap.getBoundingClientRect();
  dragState={
    b:b, resizing:resizing, moved:false,
    startX:e.clientX, startY:e.clientY,
    wrapW:wRect.width||1,
    origLeft:pctLeft(b),
    origTop:parseFloat(b.style.top)||0,
    origW:parseFloat(b.style.width)|| (b.offsetWidth/(wRect.width||1)*100)
  };
  try{ e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); }catch(err){}
  document.addEventListener('pointermove', onCanvasPointerMove);
  document.addEventListener('pointerup', onCanvasPointerUp);
}
function onCanvasPointerMove(e){
  if(!dragState) return;
  var dx=e.clientX-dragState.startX, dy=e.clientY-dragState.startY;
  if(!dragState.moved && Math.abs(dx)<4 && Math.abs(dy)<4) return;  /* click, not drag */
  if(!dragState.moved){
    dragState.moved=true;
    dragState.b.classList.add('se-dragging');
    closeLangPop();
  }
  e.preventDefault();
  var snap = !(e.metaKey || e.ctrlKey);   /* Alt duplicates, so Cmd/Ctrl bypasses snapping */
  var b=dragState.b, wpx=dragState.wrapW;
  clearGuides();

  if(dragState.resizing){
    var wPx = (dragState.origW/100*wpx) + dx;
    if(snap) wPx = Math.round(wPx/GRID)*GRID;
    wPx = Math.max(GRID*4, Math.min(wpx, wPx));
    b.style.width = round2(wPx/wpx*100)+'%';
  } else {
    var lPx = (dragState.origLeft/100*wpx) + dx;
    var tPx = dragState.origTop + dy;
    if(snap){
      /* Edges and centres of the neighbours win over the plain grid — that is
         what makes things line up the way you meant. */
      var tg=snapTargets(b), hx=[], hy=[];
      var bw=b.offsetWidth, bh=b.offsetHeight;
      var sl=snapAxis(lPx, bw, tg.x, hx);
      var st2=snapAxis(tPx, bh, tg.y, hy);
      lPx = hx.length ? sl : Math.round(lPx/GRID)*GRID;
      tPx = hy.length ? st2 : Math.round(tPx/GRID)*GRID;
      if(hx.length || hy.length){
        var wrp=freeWrap().getBoundingClientRect();
        var stg=$('seStage').getBoundingClientRect();
        for(var gi=0;gi<hx.length;gi++) drawGuide(true, hx[gi], wrp, stg);
        for(var gj=0;gj<hy.length;gj++) drawGuide(false, hy[gj], wrp, stg);
      }
    }
    lPx = Math.max(-wpx*0.25, Math.min(wpx*0.98, lPx));
    tPx = Math.max(0, tPx);
    b.style.left = round2(lPx/wpx*100)+'%';
    b.style.top  = Math.round(tPx)+'px';
  }
  growWrap();
  positionTools();
  placeResizeGrip();
  updateGeoReadout();
}
function onCanvasPointerUp(){
  document.removeEventListener('pointermove', onCanvasPointerMove);
  document.removeEventListener('pointerup', onCanvasPointerUp);
  if(!dragState) return;
  var moved=dragState.moved;
  dragState.b.classList.remove('se-dragging');
  dragState=null;
  clearGuides();
  if(moved){
    justDragged=true;
    setTimeout(function(){ justDragged=false; }, 0);
    growWrap();
    markBlocks();
    snapshot();
    renderPalette();
  }
}
/* Arrow keys nudge the selected block: 1px, or one grid step with Shift. */
function nudge(dx,dy,big){
  var b=selEl?blockOf(selEl):null;
  if(!b || !isFree()) return false;
  var wrap=freeWrap();
  var wpx=wrap.getBoundingClientRect().width||1;
  var step=big?GRID:1;
  b.style.left = round2(((pctLeft(b)/100*wpx)+dx*step)/wpx*100)+'%';
  b.style.top  = Math.max(0,(parseFloat(b.style.top)||0)+dy*step)+'px';
  growWrap();
  positionTools();
  updateGeoReadout();
  snapshot();
  return true;
}
function updateGeoReadout(){
  var el=$('seGeo');
  if(!el) return;
  var b=selEl?blockOf(selEl):null;
  if(!b || !isFree()){ el.textContent=''; return; }
  el.textContent='x '+Math.round(pctLeft(b))+'%  ·  y '+Math.round(parseFloat(b.style.top)||0)+'px  ·  w '+Math.round(parseFloat(b.style.width)||0)+'%';
}
/* The resize grip is an overlay in the stage, never a child of the block.
   Putting it inside the element made that element stop counting as a leaf,
   which silently broke text edits and polluted snapshots and exports. */
function placeResizeGrip(){
  var st=$('seStage');
  if(!st) return;
  var g=$('seGrip');
  if(!g){
    g=document.createElement('div');
    g.id='seGrip';
    g.className='se-rs';
    g.title=t('Drag to resize','拖动调整大小');
    g.addEventListener('pointerdown', onGripPointerDown);
    st.appendChild(g);
  }
  var b=(!previewMode && isFree() && selEl) ? blockOf(selEl) : null;
  if(!b){ g.style.display='none'; return; }
  var br=b.getBoundingClientRect(), sr=st.getBoundingClientRect();
  g.style.display='block';
  g.style.left=(br.right-sr.left+st.scrollLeft-6)+'px';
  g.style.top=(br.bottom-sr.top+st.scrollTop-6)+'px';
}
function onGripPointerDown(e){
  if(previewMode || !isFree() || !selEl) return;
  var b=blockOf(selEl);
  if(!b || b.getAttribute('data-se-lock')==='1') return;
  e.preventDefault();
  e.stopPropagation();
  var wrap=freeWrap();
  var wRect=wrap.getBoundingClientRect();
  dragState={
    b:b, resizing:true, moved:false,
    startX:e.clientX, startY:e.clientY,
    wrapW:wRect.width||1,
    origLeft:pctLeft(b),
    origTop:parseFloat(b.style.top)||0,
    origW:parseFloat(b.style.width)|| (b.offsetWidth/(wRect.width||1)*100)
  };
  document.addEventListener('pointermove', onCanvasPointerMove);
  document.addEventListener('pointerup', onCanvasPointerUp);
}

/* ═══════════════════════════ Canvas superpowers ═══════════════════════════
   The editing model people expect from a visual design tool, implemented for
   this site's markup: smart alignment guides, align + distribute, a layers
   panel with lock, per-element styling (background / padding / radius /
   opacity / rotation), alt-drag duplication, clipboard, and lifting a nested
   element out so anything on the page can be positioned, not just top-level
   blocks.
   ═══════════════════════════════════════════════════════════════════════════ */

var SNAP_TOL = 6;             /* px within which an edge grabs a guide */
var clipboard = null;

/* ── Guides ─────────────────────────────────────────────────────────────── */
function guideLayer(){
  var st=$('seStage');
  if(!st) return null;
  var g=$('seGuides');
  if(!g){
    g=document.createElement('div');
    g.id='seGuides';
    st.appendChild(g);
  }
  return g;
}
function clearGuides(){
  var g=$('seGuides');
  if(g) g.innerHTML='';
}
function drawGuide(vertical, pos, wrapRect, stageRect){
  var g=guideLayer();
  if(!g) return;
  var st=$('seStage');
  var d=document.createElement('div');
  d.className='se-guide '+(vertical?'v':'h');
  if(vertical){
    d.style.left=(wrapRect.left-stageRect.left+st.scrollLeft+pos)+'px';
    d.style.top=(wrapRect.top-stageRect.top+st.scrollTop)+'px';
    d.style.height=wrapRect.height+'px';
  } else {
    d.style.top=(wrapRect.top-stageRect.top+st.scrollTop+pos)+'px';
    d.style.left=(wrapRect.left-stageRect.left+st.scrollLeft)+'px';
    d.style.width=wrapRect.width+'px';
  }
  g.appendChild(d);
}
/* Candidate edges/centres from every other block, plus the wrapper itself. */
function snapTargets(moving){
  var w=freeWrap();
  var out={x:[],y:[]};
  if(!w) return out;
  var wr=w.getBoundingClientRect();
  out.x.push(0, wr.width/2, wr.width);
  out.y.push(0);
  for(var i=0;i<w.children.length;i++){
    var b=w.children[i];
    if(b===moving || b.classList.contains('se-rs')) continue;
    var l=(parseFloat(b.style.left)||0)/100*wr.width;
    var t=parseFloat(b.style.top)||0;
    var bw=b.offsetWidth, bh=b.offsetHeight;
    out.x.push(l, l+bw/2, l+bw);
    out.y.push(t, t+bh/2, t+bh);
  }
  return out;
}
/* Returns the adjusted px value, and records a guide when it snaps. */
function snapAxis(value, extent, targets, hits){
  var best=null;
  var edges=[value, value+extent/2, value+extent];
  for(var e=0;e<edges.length;e++){
    for(var i=0;i<targets.length;i++){
      var d=targets[i]-edges[e];
      if(Math.abs(d)<=SNAP_TOL && (!best || Math.abs(d)<Math.abs(best.d))){
        best={d:d, at:targets[i]};
      }
    }
  }
  if(best){ hits.push(best.at); return value+best.d; }
  return value;
}

/* ── Align + distribute across the whole section ────────────────────────── */
function alignBlocks(how){
  var w=freeWrap();
  if(!w){ toast(t('Free layout only.','仅适用于自由布局。'),false); return; }
  var wr=w.getBoundingClientRect(), W=wr.width||1;
  var kids=Array.prototype.slice.call(w.children).filter(function(b){ return !b.classList.contains('se-rs'); });
  if(kids.length<2){ toast(t('Need at least two blocks.','至少需要两个区块。'),false); return; }

  if(how==='left'||how==='centre'||how==='right'){
    for(var i=0;i<kids.length;i++){
      var b=kids[i], bw=b.offsetWidth;
      var l = how==='left' ? 0 : how==='right' ? (W-bw) : (W-bw)/2;
      b.style.left=round2(l/W*100)+'%';
    }
  } else if(how==='vdist'||how==='hdist'){
    var key = how==='vdist' ? 'top' : 'left';
    kids.sort(function(a,b){
      return (key==='top')
        ? (parseFloat(a.style.top)||0)-(parseFloat(b.style.top)||0)
        : pctLeft(a)-pctLeft(b);
    });
    if(key==='top'){
      var first=parseFloat(kids[0].style.top)||0;
      var last=parseFloat(kids[kids.length-1].style.top)||0;
      var step=(last-first)/(kids.length-1);
      for(var k=1;k<kids.length-1;k++) kids[k].style.top=Math.round(first+step*k)+'px';
    } else {
      var f=pctLeft(kids[0]), l2=pctLeft(kids[kids.length-1]);
      var st2=(l2-f)/(kids.length-1);
      for(var m=1;m<kids.length-1;m++) kids[m].style.left=round2(f+st2*m)+'%';
    }
  }
  growWrap();
  snapshot();
  positionTools();
  toast(t('Aligned.','已对齐。'), true);
}

/* ── Lift a nested element into the free layer ──────────────────────────── */
/* Lets you position something that is buried inside a table cell or a card,
   not just the top-level blocks. */
function liftSelection(){
  var w=freeWrap();
  if(!w){ toast(t('Switch to Free drag first.','请先切换到自由拖动。'),false); return; }
  if(!selEl){ toast(t('Select something first.','请先选择元素。'),false); return; }
  if(selEl.parentNode===w){ toast(t('Already a top-level block.','已是顶层区块。'),false); return; }

  var r=selEl.getBoundingClientRect(), wr=w.getBoundingClientRect();
  var W=wr.width||1;
  var el=selEl;
  el.parentNode.removeChild(el);
  el.style.position='absolute';
  el.style.left=round2((r.left-wr.left)/W*100)+'%';
  el.style.top=Math.round(r.top-wr.top)+'px';
  el.style.width=round2(r.width/W*100)+'%';
  el.style.margin='0';
  el.style.zIndex=String(topZ()+1);
  w.appendChild(el);
  growWrap();
  markBlocks();
  snapshot();
  select(el);
  toast(t('Lifted out — it can now be placed anywhere.','已提取 — 现在可任意摆放。'), true);
}

/* ── Clipboard + alt-drag duplicate ─────────────────────────────────────── */
function copySel(){
  var b=selEl?blockOf(selEl):null;
  if(!b) return;
  clipboard=b.cloneNode(true);
  clipboard.classList.remove('se-sel','se-sel-blk','se-dragging');
  var g=clipboard.querySelectorAll('.se-rs');
  for(var i=0;i<g.length;i++) g[i].parentNode.removeChild(g[i]);
  toast(t('Copied.','已复制。'), true);
}
function pasteSel(){
  if(!clipboard){ toast(t('Nothing copied yet.','剪贴板为空。'),false); return; }
  var host=blockParent();
  var cp=clipboard.cloneNode(true);
  host.appendChild(cp);
  if(isFree()){
    cp.style.left=round2(pctLeft(cp)+3)+'%';
    cp.style.top=((parseFloat(cp.style.top)||0)+28)+'px';
    cp.style.zIndex=String(topZ()+1);
    growWrap();
  }
  markBlocks();
  snapshot();
  select(cp);
  toast(t('Pasted.','已粘贴。'), true);
}

/* ── Layers panel ───────────────────────────────────────────────────────── */
function layerLabel(b){
  var txt=(b.getAttribute('data-en') || b.textContent || '').replace(/\s+/g,' ').trim();
  if(!txt) txt='<'+b.nodeName.toLowerCase()+'>';
  return txt.length>28 ? txt.slice(0,28)+'…' : txt;
}
function renderLayers(){
  var box=$('seLayers');
  if(!box) return;
  var w=freeWrap();
  if(!w){ box.innerHTML='<div class="se-hint">'+t('Layers appear in Free drag mode.','图层在自由拖动模式下显示。')+'</div>'; return; }
  var kids=Array.prototype.slice.call(w.children).filter(function(b){ return !b.classList.contains('se-rs'); });
  kids.sort(function(a,b){ return (parseInt(b.style.zIndex,10)||0)-(parseInt(a.style.zIndex,10)||0); });
  var h='';
  for(var i=0;i<kids.length;i++){
    var b=kids[i];
    var idx=Array.prototype.indexOf.call(w.children,b);
    var locked=b.getAttribute('data-se-lock')==='1';
    var hid=b.getAttribute('data-se-hidden')==='1';
    h+='<div class="se-layer'+(b===blockOf(selEl)?' on':'')+'" data-se-layer="'+idx+'">'
      +  '<span class="se-layer-n">'+esc(layerLabel(b))+'</span>'
      +  '<button type="button" class="se-b sm" data-se-lock="'+idx+'" title="'+t('Lock','锁定')+'">'+(locked?'🔒':'🔓')+'</button>'
      +  '<button type="button" class="se-b sm" data-se-eye="'+idx+'" title="'+t('Hide','隐藏')+'">'+(hid?'🚫':'👁')+'</button>'
      +'</div>';
  }
  box.innerHTML=h||'<div class="se-hint">'+t('No blocks yet.','暂无区块。')+'</div>';
  var rows=box.querySelectorAll('[data-se-layer]');
  for(var r=0;r<rows.length;r++){
    rows[r].addEventListener('click',function(e){
      if(e.target.hasAttribute('data-se-lock')||e.target.hasAttribute('data-se-eye')) return;
      var el=freeWrap().children[parseInt(this.getAttribute('data-se-layer'),10)];
      if(el) select(el);
    });
  }
  var lk=box.querySelectorAll('[data-se-lock]');
  for(var l=0;l<lk.length;l++){
    lk[l].addEventListener('click',function(e){
      e.stopPropagation();
      var el=freeWrap().children[parseInt(this.getAttribute('data-se-lock'),10)];
      if(!el) return;
      if(el.getAttribute('data-se-lock')==='1') el.removeAttribute('data-se-lock');
      else el.setAttribute('data-se-lock','1');
      snapshot(); renderLayers();
    });
  }
  var ey=box.querySelectorAll('[data-se-eye]');
  for(var y=0;y<ey.length;y++){
    ey[y].addEventListener('click',function(e){
      e.stopPropagation();
      var el=freeWrap().children[parseInt(this.getAttribute('data-se-eye'),10)];
      if(!el) return;
      if(el.getAttribute('data-se-hidden')==='1'){ el.removeAttribute('data-se-hidden'); el.classList.remove('se-hidden'); }
      else { el.setAttribute('data-se-hidden','1'); el.classList.add('se-hidden'); }
      snapshot(); renderLayers();
    });
  }
}

/* ── Per-element appearance ─────────────────────────────────────────────── */
function setBoxStyle(prop, value){
  if(!selEl) return;
  selEl.style[prop]=value;
  if(prop==='padding'||prop==='fontSize') growWrap();
  snapshot();
  positionTools();
}
function rotateSel(deg){
  if(!selEl) return;
  selEl.style.transform = deg ? ('rotate('+deg+'deg)') : '';
  snapshot();
}
function currentRotation(el){
  var m=/rotate\((-?[\d.]+)deg\)/.exec((el && el.style.transform)||'');
  return m ? parseFloat(m[1]) : 0;
}

/* ═══════════════════════════ Tool palette ═══════════════════════════ */
var SWATCHES=[
  {v:'var(--accent)', n:'Accent'}, {v:'var(--text)',  n:'Text'},
  {v:'var(--text2)',  n:'Text 2'}, {v:'var(--text3)', n:'Text 3'},
  {v:'var(--green)',  n:'Green'},  {v:'var(--red)',   n:'Red'}
];
function renderPalette(){
  var side=$('seSide');
  if(!side) return;
  var has=!!selEl;
  var tagName = has ? selEl.nodeName.toLowerCase() : '';
  var st = has ? (selEl.style||{}) : {};
  var h=''
  +'<div class="se-grp">'
  +  '<h4>'+t('Selection','当前选择')+'</h4>'
  +  (has
      ? '<div class="se-selinfo">&lt;'+esc(tagName)+'&gt;'+(selEl.className?(' .'+esc(String(selEl.className).replace(/\s*se-(sel|sel-blk|blk|hidden)\s*/g,' ').trim().split(/\s+/).join('.'))):'')+'</div>'
      : '<div class="se-hint">'+t('Click any text on the canvas to edit it. Bilingual elements open an EN + 中文 editor.','点击画布上的任意文本进行编辑。双语元素会打开英文 + 中文编辑器。')+'</div>')
  +'</div>';

  if(has){
    h+='<div class="se-grp"><h4>'+t('Text style','文本样式')+'</h4><div class="se-row">'
      +'<button type="button" class="se-b sm'+(st.fontWeight==='700'?' on':'')+'" data-se-cmd="bold"><b>B</b></button>'
      +'<button type="button" class="se-b sm'+(st.fontStyle==='italic'?' on':'')+'" data-se-cmd="italic"><i>I</i></button>'
      +'<button type="button" class="se-b sm'+((st.textDecoration||'').indexOf('underline')!==-1?' on':'')+'" data-se-cmd="underline"><u>U</u></button>'
      +'<button type="button" class="se-b sm" data-se-cmd="clearstyle">'+t('Clear','清除')+'</button>'
      +'</div></div>';

    var fs=parseFloat(st.fontSize)||1;
    h+='<div class="se-grp"><h4>'+t('Font size','字号')+' · <span id="seFsVal">'+(st.fontSize||t('default','默认'))+'</span></h4>'
      +'<input class="se-range" type="range" id="seFs" min="0.8" max="2.5" step="0.05" value="'+(fs>=0.8&&fs<=2.5?fs:1)+'">'
      +'<div class="se-row" style="margin-top:.3rem"><button type="button" class="se-b sm" data-se-cmd="fsreset">'+t('Reset size','恢复字号')+'</button></div>'
      +'</div>';

    var sw='';
    for(var i=0;i<SWATCHES.length;i++){
      sw+='<button type="button" class="se-sw" title="'+esc(SWATCHES[i].n)+'" data-se-color="'+esc(SWATCHES[i].v)+'" style="background:'+SWATCHES[i].v+'"></button>';
    }
    h+='<div class="se-grp"><h4>'+t('Colour','颜色')+'</h4><div class="se-row">'+sw
      +'<input type="color" id="seColor" class="se-sw" style="padding:0" title="'+t('Custom colour','自定义颜色')+'">'
      +'<button type="button" class="se-b sm" data-se-cmd="colreset">'+t('Reset','恢复')+'</button>'
      +'</div></div>';

    h+='<div class="se-grp"><h4>'+t('Alignment','对齐')+'</h4><div class="se-row">'
      +'<button type="button" class="se-b sm'+(st.textAlign==='left'?' on':'')+'" data-se-align="left">⬅</button>'
      +'<button type="button" class="se-b sm'+(st.textAlign==='center'?' on':'')+'" data-se-align="center">⬌</button>'
      +'<button type="button" class="se-b sm'+(st.textAlign==='right'?' on':'')+'" data-se-align="right">➡</button>'
      +'<button type="button" class="se-b sm" data-se-align="">'+t('Auto','自动')+'</button>'
      +'</div></div>';

    var b=blockOf(selEl);
    var hid = b && b.getAttribute('data-se-hidden')==='1';
    h+='<div class="se-grp"><h4>'+t('Block','区块')+'</h4><div class="se-row">'
      +'<button type="button" class="se-b sm" data-se-blk="up">↑ '+t('Up','上移')+'</button>'
      +'<button type="button" class="se-b sm" data-se-blk="down">↓ '+t('Down','下移')+'</button>'
      +'<button type="button" class="se-b sm" data-se-blk="dup">⧉ '+t('Duplicate','复制')+'</button>'
      +'<button type="button" class="se-b sm'+(hid?' on':'')+'" data-se-blk="hide">👁 '+(hid?t('Show','显示'):t('Hide','隐藏'))+'</button>'
      +'<button type="button" class="se-b sm" data-se-blk="del">🗑 '+t('Delete','删除')+'</button>'
      +'</div></div>';
  }

  var free=isFree();
  h+='<div class="se-grp"><h4>'+t('Layout','布局')+'</h4>'
    +'<div class="se-row">'
    +'<button type="button" class="se-b sm'+(!free?' on':'')+'" data-se-layout="flow">'+t('Flow','流式')+'</button>'
    +'<button type="button" class="se-b sm'+(free?' on':'')+'" data-se-layout="free">'+t('Free drag','自由拖动')+'</button>'
    +'</div>';
  if(free){
    var fw=freeWrap();
    var fixed=fw && fw.classList.contains('se-free-fixed');
    if(has){
      h+='<div class="se-row" style="margin-top:.4rem">'
        +'<button type="button" class="se-b sm" data-se-blk="front">'+t('Bring to front','置于顶层')+'</button>'
        +'<button type="button" class="se-b sm" data-se-blk="back">'+t('Send to back','置于底层')+'</button>'
        +'</div>'
        +'<div class="se-selinfo" id="seGeo" style="margin-top:.4rem"></div>';
    }
    h+='<label style="display:flex;align-items:flex-start;gap:.4rem;font-size:.74rem;font-weight:600;color:var(--text2);margin-top:.5rem;cursor:pointer">'
      +'<input type="checkbox" id="seFixed"'+(fixed?' checked':'')+' style="margin-top:.15rem">'
      +'<span>'+t('Keep exact positions on phones','在手机上保持精确位置')+'</span></label>'
      +'<div class="se-hint" style="margin-top:.25rem">'
      + (fixed ? t('Positions are pinned at every width. Narrow screens may overlap or clip — check them.','位置在所有宽度下固定。窄屏可能重叠或裁切 — 请自行检查。')
               : t('Below 920px these blocks stack in top-to-bottom order so the page stays readable.','在 920px 以下，这些区块将按从上到下的顺序堆叠，以保证可读性。'))
      +'</div>';
  }
  h+='<div class="se-hint" style="margin-top:.4rem">'
    + (free ? t('Drag to move, drag the corner to resize. Alt-drag duplicates. Hold Cmd/Ctrl to ignore snapping. Arrows nudge, Shift+arrows by 8px.','拖动移动，拖动右下角缩放。Alt+拖动可复制。按住 Cmd/Ctrl 忽略吸附。方向键微调，Shift+方向键按 8px。')
            : t('Blocks stack in order. Switch to Free drag to place them anywhere.','区块按顺序排列。切换到自由拖动可任意摆放。'))
    +'</div></div>';

  if(free){
    h+='<div class="se-grp"><h4>'+t('Align','对齐')+'</h4><div class="se-row">'
      +'<button type="button" class="se-b sm" data-se-align2="left" title="'+t('Align left','左对齐')+'">⇤</button>'
      +'<button type="button" class="se-b sm" data-se-align2="centre" title="'+t('Centre','居中')+'">⇔</button>'
      +'<button type="button" class="se-b sm" data-se-align2="right" title="'+t('Align right','右对齐')+'">⇥</button>'
      +'<button type="button" class="se-b sm" data-se-align2="vdist" title="'+t('Distribute vertically','垂直分布')+'">⇕</button>'
      +'<button type="button" class="se-b sm" data-se-align2="hdist" title="'+t('Distribute horizontally','水平分布')+'">⇹</button>'
      +'</div>'
      +'<div class="se-row" style="margin-top:.4rem">'
      +'<button type="button" class="se-b sm" id="seLift">⤴ '+t('Lift out','提取')+'</button>'
      +'<button type="button" class="se-b sm" id="seCopy">⧉ '+t('Copy','复制')+'</button>'
      +'<button type="button" class="se-b sm" id="sePaste">⎘ '+t('Paste','粘贴')+'</button>'
      +'</div>'
      +'<div class="se-hint" style="margin-top:.3rem">'+t('Lift out makes a nested element (a cell, a card) freely placeable.','「提取」可让嵌套元素（单元格、卡片）独立摆放。')+'</div>'
      +'</div>';
  }

  if(has){
    var padNow=parseFloat(st.padding)||0;
    var radNow=parseFloat(st.borderRadius)||0;
    var opNow=st.opacity===''?1:parseFloat(st.opacity);
    var rotNow=currentRotation(selEl);
    h+='<div class="se-grp"><h4>'+t('Appearance','外观')+'</h4>'
      +'<div class="se-row"><span class="se-hint" style="min-width:4.2rem">'+t('Fill','填充')+'</span>'
      +'<button type="button" class="se-sw" data-se-bg="var(--surface2)" style="background:var(--surface2)"></button>'
      +'<button type="button" class="se-sw" data-se-bg="var(--accent-bg)" style="background:var(--accent-bg)"></button>'
      +'<button type="button" class="se-sw" data-se-bg="var(--surface3)" style="background:var(--surface3)"></button>'
      +'<input type="color" id="seBg" class="se-sw" style="padding:0">'
      +'<button type="button" class="se-b sm" data-se-bg="">'+t('None','无')+'</button></div>'
      +'<div class="se-row" style="margin-top:.45rem"><span class="se-hint" style="min-width:4.2rem">'+t('Padding','内边距')+'</span>'
      +'<input class="se-range" style="flex:1" type="range" id="sePad" min="0" max="48" step="2" value="'+padNow+'"></div>'
      +'<div class="se-row" style="margin-top:.35rem"><span class="se-hint" style="min-width:4.2rem">'+t('Corners','圆角')+'</span>'
      +'<input class="se-range" style="flex:1" type="range" id="seRad" min="0" max="40" step="2" value="'+radNow+'"></div>'
      +'<div class="se-row" style="margin-top:.35rem"><span class="se-hint" style="min-width:4.2rem">'+t('Opacity','不透明度')+'</span>'
      +'<input class="se-range" style="flex:1" type="range" id="seOp" min="0.1" max="1" step="0.05" value="'+(isNaN(opNow)?1:opNow)+'"></div>'
      +'<div class="se-row" style="margin-top:.35rem"><span class="se-hint" style="min-width:4.2rem">'+t('Rotate','旋转')+'</span>'
      +'<input class="se-range" style="flex:1" type="range" id="seRot" min="-45" max="45" step="1" value="'+rotNow+'"></div>'
      +'</div>';
  }

  h+='<div class="se-grp"><h4>'+t('Layers','图层')+'</h4><div id="seLayers" class="se-vlist"></div></div>';

  h+='<div class="se-grp"><h4>'+t('Add block','添加区块')+'</h4><div class="se-row">'
    +'<button type="button" class="se-b sm" data-se-add="heading">H '+t('Heading','标题')+'</button>'
    +'<button type="button" class="se-b sm" data-se-add="para">¶ '+t('Paragraph','段落')+'</button>'
    +'<button type="button" class="se-b sm" data-se-add="list">• '+t('List','列表')+'</button>'
    +'<button type="button" class="se-b sm" data-se-add="callout">💡 '+t('Callout','提示框')+'</button>'
    +'<button type="button" class="se-b sm" data-se-add="divider">— '+t('Divider','分隔线')+'</button>'
    +'<button type="button" class="se-b sm" data-se-add="image">🖼 '+t('Image','图片')+'</button>'
    +'</div><div class="se-hint" style="margin-top:.4rem">'+t('New blocks land after the selected one and come with data-en / data-zh already set.','新区块会插入在所选区块之后，并自带 data-en / data-zh 属性。')+'</div></div>';

  h+='<div class="se-grp"><h4>'+t('Version history','版本历史')+'</h4><div id="seVers" class="se-vlist"></div></div>';

  side.innerHTML=h;

  /* wire up */
  var q=function(sel){ return side.querySelectorAll(sel); };
  var i, els;
  els=q('[data-se-cmd]'); for(i=0;i<els.length;i++) els[i].addEventListener('click',function(){ styleCmd(this.getAttribute('data-se-cmd')); });
  els=q('[data-se-color]'); for(i=0;i<els.length;i++) els[i].addEventListener('click',function(){ setColor(this.getAttribute('data-se-color')); });
  els=q('[data-se-align]'); for(i=0;i<els.length;i++) els[i].addEventListener('click',function(){ setAlign(this.getAttribute('data-se-align')); });
  els=q('[data-se-blk]');  for(i=0;i<els.length;i++) els[i].addEventListener('click',function(){ blockAction(this.getAttribute('data-se-blk')); });
  els=q('[data-se-add]');  for(i=0;i<els.length;i++) els[i].addEventListener('click',function(){ addBlock(this.getAttribute('data-se-add')); });
  els=q('[data-se-layout]');
  for(i=0;i<els.length;i++) els[i].addEventListener('click',function(){
    if(this.getAttribute('data-se-layout')==='free') enterFreeMode(); else exitFreeMode();
  });
  var fx=$('seFixed'); if(fx) fx.addEventListener('change', toggleMobileFixed);
  els=q('[data-se-align2]'); for(i=0;i<els.length;i++) els[i].addEventListener('click',function(){ alignBlocks(this.getAttribute('data-se-align2')); });
  els=q('[data-se-bg]');     for(i=0;i<els.length;i++) els[i].addEventListener('click',function(){ setBoxStyle('background', this.getAttribute('data-se-bg')); renderPalette(); });
  var bg=$('seBg');  if(bg)  bg.addEventListener('change',function(){ setBoxStyle('background', this.value); });
  var pd=$('sePad'); if(pd)  pd.addEventListener('input',function(){ if(selEl) selEl.style.padding=this.value+'px'; growWrap(); positionTools(); });
  if(pd) pd.addEventListener('change',function(){ snapshot(); });
  var rd=$('seRad'); if(rd)  rd.addEventListener('input',function(){ if(selEl) selEl.style.borderRadius=this.value+'px'; });
  if(rd) rd.addEventListener('change',function(){ snapshot(); });
  var op=$('seOp');  if(op)  op.addEventListener('input',function(){ if(selEl) selEl.style.opacity=this.value; });
  if(op) op.addEventListener('change',function(){ snapshot(); });
  var rt=$('seRot'); if(rt)  rt.addEventListener('input',function(){ if(selEl) selEl.style.transform=this.value==='0'?'':'rotate('+this.value+'deg)'; });
  if(rt) rt.addEventListener('change',function(){ snapshot(); });
  var lf=$('seLift');  if(lf) lf.addEventListener('click', liftSelection);
  var cp2=$('seCopy'); if(cp2) cp2.addEventListener('click', copySel);
  var pt=$('sePaste'); if(pt) pt.addEventListener('click', pasteSel);
  renderLayers();
  updateGeoReadout();
  var col=$('seColor'); if(col) col.addEventListener('change',function(){ setColor(this.value); });
  var fs=$('seFs');
  if(fs){
    fs.addEventListener('input',function(){
      if(!selEl) return;
      selEl.style.fontSize=this.value+'rem';
      var lab=$('seFsVal'); if(lab) lab.textContent=this.value+'rem';
    });
    fs.addEventListener('change',function(){ snapshot(); });
  }
  renderVersions();
}
function styleCmd(cmd){
  if(!selEl) return;
  var s=selEl.style;
  if(cmd==='bold')      s.fontWeight = (s.fontWeight==='700') ? '' : '700';
  else if(cmd==='italic')    s.fontStyle = (s.fontStyle==='italic') ? '' : 'italic';
  else if(cmd==='underline') s.textDecoration = ((s.textDecoration||'').indexOf('underline')!==-1) ? '' : 'underline';
  else if(cmd==='clearstyle') selEl.removeAttribute('style');
  else if(cmd==='fsreset')    s.fontSize='';
  else if(cmd==='colreset')   s.color='';
  snapshot();
  renderPalette();
  positionTools();
}
function setColor(v){ if(!selEl) return; selEl.style.color=v; snapshot(); renderPalette(); }
function setAlign(v){ if(!selEl) return; selEl.style.textAlign=v; snapshot(); renderPalette(); }

/* ═══════════════════════════ Preview toggle ═══════════════════════════ */
function togglePreview(){
  previewMode=!previewMode;
  var c=canvas();
  c.classList.toggle('preview',previewMode);
  c.classList.toggle('edit',!previewMode);
  $('sePreview').classList.toggle('on',previewMode);
  $('sePreview').textContent = previewMode ? ('✎ '+t('Back to editing','返回编辑')) : ('👁 '+t('Preview','预览'));
  if(previewMode){ clearSel(); hideTools(); closeLangPop(); }
  placeResizeGrip();
  setStatus(previewMode
    ? t('Preview — this is how the section reads with the draft applied. Visitors do NOT see this.','预览 — 这是应用草稿后的效果。访客看不到此内容。')
    : t('Editing','编辑中'));
}

/* ═════════════════════ Export / draft / reset / publish ═════════════════ */
/* Strip every editor-only artefact, then sanitize, then split into EN + ZH. */
function exportPair(){
  var clone=content().cloneNode(true);
  var grips=clone.querySelectorAll('.se-rs');
  for(var g=0;g<grips.length;g++) grips[g].parentNode.removeChild(grips[g]);
  var all=clone.querySelectorAll('*');
  for(var i=0;i<all.length;i++){
    var el=all[i];
    el.removeAttribute('contenteditable');
    el.removeAttribute('spellcheck');
    el.removeAttribute('data-se-hit');
    el.classList.remove('se-sel','se-sel-blk','se-blk','se-hidden','se-dragging');
    if(el.getAttribute('class')==='') el.removeAttribute('class');
    if(el.getAttribute('data-se-hidden')==='1'){
      var s=el.getAttribute('style')||'';
      if(s.indexOf('display:none')===-1) el.setAttribute('style',(s?s.replace(/;\s*$/,'')+';':'')+'display:none');
    }
  }
  var clean=sanitizeHTML(clone.innerHTML);
  var stripped=lastStripCount;
  var pair=buildLangPair(clean);
  pair.stripped=stripped;
  return pair;
}
function saveDraft(){
  if(!cur) return;
  var pair=exportPair();
  var obj={en:pair.en, zh:pair.zh, updated_at:nowISO(), updated_by:meEmail()};
  if(!setDraft(cur.page,cur.id,obj)) return;
  var msg=t('Draft saved to this browser only. Publish to make it live.','草稿仅保存在此浏览器。发布后才会对所有人生效。');
  if(pair.stripped) msg += ' ' + t('Removed ','已移除 ')+pair.stripped+t(' unsafe tag/attribute(s).',' 个不安全的标签/属性。');
  toast(msg, true);
  setStatus(t('Draft saved · ','草稿已保存 · ')+fmtTime(obj.updated_at)+' · '+obj.updated_by);
}
function resetSection(){
  if(!cur) return;
  if(!confirm(t('Discard the draft and reload the original markup for this section?','放弃草稿并重新载入该区块的原始内容？'))) return;
  delDraft(cur.page,cur.id);
  content().innerHTML=origHTML;
  markBlocks();
  selEl=null; hideTools(); closeLangPop();
  undoStack=[]; undoAt=-1;
  snapshot(true);
  renderPalette();
  toast(t('Section reset to the original markup. (A published override, if any, is still live — use Unpublish.)','区块已恢复为原始内容。（若已发布覆盖内容，仍在线上 — 请使用「取消发布」。）'), true);
  setStatus(t('Original content · no draft','原始内容 · 无草稿'));
}
function publish(){
  if(!cur) return;
  var pair=exportPair();
  if(pair.stripped && !confirm(t('Sanitizer removed ','安全过滤移除了 ')+pair.stripped+t(' unsafe tag(s)/attribute(s). Publish the cleaned version?',' 个不安全的标签/属性。是否发布清理后的版本？'))) return;
  if(!confirm(t('Publish this section to ALL visitors of ','将此区块发布给以下页面的所有访客：')+cur.pageFile+'?')) return;

  /* Always keep the local draft — publishing may fail and must not lose work. */
  setDraft(cur.page,cur.id,{en:pair.en, zh:pair.zh, updated_at:nowISO(), updated_by:meEmail()});
  var vers=pushVersion(cur.page,cur.id,pair,'publish attempt');
  var version=(PUB_CACHE[cur.page] && PUB_CACHE[cur.page][cur.id] && PUB_CACHE[cur.page][cur.id].version)
              ? (PUB_CACHE[cur.page][cur.id].version+1) : vers.length;

  var btn=$('sePublish');
  btn.disabled=true;
  btn.textContent='⏳ '+t('Publishing…','发布中…');
  sbPublish(cur.page,cur.id,pair,version,function(err){
    btn.disabled=false;
    btn.textContent='🚀 '+t('Publish','发布');
    if(err){
      toast(err,false);
      setStatus(t('Publish failed — draft is safe locally. Retry once the backend is up.','发布失败 — 草稿已安全保存在本地。后端恢复后可重试。'));
      renderVersions();
      return;
    }
    delete PUB_CACHE[cur.page];
    toast(t('Published — live for all visitors on ','已发布 — 对以下页面的所有访客生效：')+cur.pageFile+' (v'+version+')', true);
    setStatus(t('Published v','已发布 v')+version+' · '+fmtTime(nowISO())+' · '+meEmail());
    renderVersions();
  });
}
function unpublish(){
  if(!cur) return;
  if(!confirm(t('Remove the published override so visitors see the original again?','移除已发布的覆盖内容，让访客重新看到原始版本？'))) return;
  sbUnpublish(cur.page,cur.id,function(err){
    if(err){ toast(err,false); return; }
    delete PUB_CACHE[cur.page];
    toast(t('Override unpublished — visitors see the original markup again.','已取消发布 — 访客将重新看到原始内容。'), true);
    setStatus(t('Unpublished','已取消发布'));
  });
}

/* ═══════════════════════════ Version history ═══════════════════════════ */
function renderVersions(){
  var box=$('seVers');
  if(!box || !cur) return;
  var list=getVersions(cur.page,cur.id);
  if(!list.length){
    box.innerHTML='<div class="se-hint">'+t('No saved versions yet. Each publish stores a restore point (last 10).','尚无历史版本。每次发布都会保存一个还原点（最近 10 个）。')+'</div>';
    return;
  }
  var h='';
  for(var i=0;i<list.length;i++){
    h+='<div class="se-vrow"><div><div style="font-weight:700">v'+(list.length-i)+'</div>'
     + '<div style="color:var(--text3);font-size:.7rem">'+esc(fmtTime(list[i].ts))+' · '+esc(list[i].by||'')+'</div></div>'
     + '<button type="button" class="se-b sm" data-se-restore="'+i+'">'+t('Restore','还原')+'</button></div>';
  }
  h+='<div class="se-row" style="margin-top:.5rem"><button type="button" class="se-b sm" id="seUnpub">'+t('Unpublish this section','取消发布此区块')+'</button></div>';
  box.innerHTML=h;
  var bs=box.querySelectorAll('[data-se-restore]');
  for(var k=0;k<bs.length;k++){
    bs[k].addEventListener('click',function(){
      var idx=parseInt(this.getAttribute('data-se-restore'),10);
      var v=getVersions(cur.page,cur.id)[idx];
      if(!v) return;
      content().innerHTML = cn() ? (v.zh||v.en) : (v.en||v.zh);
      markBlocks();
      selEl=null; hideTools();
      snapshot();
      renderPalette();
      toast(t('Restored version from ','已还原版本：')+fmtTime(v.ts)+t(' — save or publish to keep it.',' — 请保存或发布以生效。'), true);
    });
  }
  var up=$('seUnpub');
  if(up) up.addEventListener('click', unpublish);
}

/* ═══════════════════════════ Boot ═══════════════════════════ */
window.SiteEditor = {
  mount: mount,
  open: openEditor,
  sections: SECTIONS,
  sanitize: sanitizeHTML,
  lastStripped: function(){ return lastStripCount; }
};

function boot(){
  if($('siteEditorRoot')) mount();
  else setTimeout(function(){ if($('siteEditorRoot')) mount(); }, 300);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();

})();

/* ═══ Vitalité Forum — Supabase-backed community forum ═══
   Reads/writes forum_topics + forum_replies (see forum-schema.sql).
   Anon-key pattern like the rest of the site. If the Supabase schema cache
   is stale (tables 404), it degrades to a device-local mirror so nothing breaks.
*/
(function(){
  var SB_URL='https://eytmbftrjvsntyzwbtzl.supabase.co';
  var SB_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dG1iZnRyanZzbnR5endidHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTU2NjksImV4cCI6MjEwNDIzMTY2OX0.o0vRqteQ5XNgTNvnB3IEE9I67Oo_r4sy7JZ9qOGWSSc';
  var LOCAL_KEY='vitalite_forum_v1';
  var UPVOTE_KEY='vitalite_forum_upvoted';
  /* Developers/admins — mirrored from admin.html DEV_EMAILS. Admins may delete any post. */
  var ADMIN_EMAILS=['goldensword.gt@gmail.com','p54992163@gmail.com'];
  var CATS=[
    { id:'general',  icon:'🏠', en:'General',            zh:'综合' },
    { id:'injury',   icon:'🦴', en:'Injuries & Recovery', zh:'损伤与恢复' },
    { id:'nutrition',icon:'🥗', en:'Nutrition',           zh:'营养' },
    { id:'training', icon:'🏋️', en:'Training',            zh:'训练' },
    { id:'study',    icon:'📚', en:'Study & Exams',       zh:'学习与备考' }
  ];
  var state={ cat:'all', sort:'recent', mode:'cloud', topics:[], replyCounts:{}, seq:0, threadId:null, tag:'', repTok:0, freshTopic:null };
  function isLocalId(id){ return String(id).indexOf('local_')===0; }
  var REDUCE=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  function later(ms,fn){ return setTimeout(fn, REDUCE?0:ms); }

  /* ── helpers ── */
  function lang(){ try{ return localStorage.getItem('sm_lang')==='zh'?'zh':'en'; }catch(e){ return 'en'; } }
  function T(en,zh){ return lang()==='zh'?zh:en; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function user(){
    try{ return JSON.parse(localStorage.getItem('sm_user')||'null')||null; }catch(e){ return null; }
  }
  function userName(u){ return (u&&u.name)?u.name:((u&&u.email)?u.email.split('@')[0]:null); }
  /* ── delete authorization ── */
  function normEmail(e){ return String(e==null?'':e).trim().toLowerCase(); }
  function isAdminU(u){ var e=normEmail(u&&u.email); return !!e && ADMIN_EMAILS.indexOf(e)!==-1; }
  function isMine(row,u){ return !!row && normEmail(row.author_email)!=='' && normEmail(row.author_email)===normEmail(u&&u.email); }
  function canDelete(row){ var u=user(); return !!u && u.email && (isMine(row,u) || isAdminU(u)); }
  function catById(id){ for(var i=0;i<CATS.length;i++){ if(CATS[i].id===id) return CATS[i]; } return CATS[0]; }
  function catIcon(id){ return catById(id).icon; }
  function catLabel(id){ var c=catById(id); return T(c.en,c.zh); }
  function fmtTime(iso){
    if(!iso) return '';
    var d=new Date(iso); if(isNaN(d)) return '';
    var s=(Date.now()-d.getTime())/1e3;
    if(s<60) return T('just now','刚刚');
    if(s<3600) return Math.floor(s/60)+T('m ago',' 分钟前');
    if(s<86400) return Math.floor(s/3600)+T('h ago',' 小时前');
    if(s<604800) return Math.floor(s/86400)+T('d ago',' 天前');
    var y=d.getFullYear(), m=d.getMonth()+1, day=d.getDate();
    return y+'-'+String(m).padStart(2,'0')+'-'+String(day).padStart(2,'0');
  }
  function initial(name){ return String(name||'?').trim().charAt(0).toUpperCase(); }

  /* ── Instagram-style hashtags ──
     #tag in titles/bodies/replies becomes a clickable link that filters the
     feed to that tag. Tags: letters, digits, underscores; at least one letter. */
  var TAG_RE=/(?:^|[\s([{>])#([A-Za-z][A-Za-z0-9_]*)/g;
  function tagName(s){ return String(s||'').replace(/^#/,'').trim().toLowerCase(); }
  function extractTags(s){
    var out=[], seen={}, m;
    TAG_RE.lastIndex=0;
    var str=String(s==null?'':s);
    while((m=TAG_RE.exec(str))!==null){
      var t=m[1].toLowerCase();
      if(t && !seen[t]){ seen[t]=1; out.push(t); }
      if(m.index===TAG_RE.lastIndex) TAG_RE.lastIndex++;
    }
    return out;
  }
  function tagTally(){
    var c={};
    state.topics.forEach(function(t){
      extractTags((t.title||'')+' '+(t.body||'')).forEach(function(tg){ c[tg]=(c[tg]||0)+1; });
    });
    return c;
  }
  function linkTags(raw){
    var s=esc(raw);
    return s.replace(/(^|[\s([{>])#([A-Za-z][A-Za-z0-9_]*)/g,
      function(all,pre,tag){
        return pre+'<a class="for-tag" href="#'+tag.toLowerCase()+'" onclick="event.stopPropagation();Forum.byTag(\''+tag.replace(/'/g,"\\'")+'\');return false;">#'+tag+'</a>';
      });
  }

  /* ── persistence (cloud + local mirror) ── */
  function localLoad(){
    try{
      var d=JSON.parse(localStorage.getItem(LOCAL_KEY)||'null')||{};
      return { topics:d.topics||[], replies:d.replies||[] };
    }catch(e){ return { topics:[], replies:[] }; }
  }
  function localSave(d){ try{ localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); }catch(e){} }

  /* Pages may declare their own supabase config (admin/login do); follow it
     so the forum survives project repoints, exactly like logout-follows-sbconfig. */
  function sbClient(){
    var url=SB_URL, anon=SB_ANON;
    try{
      if(window.SB_URL && String(window.SB_URL).indexOf('PASTE')===-1) url=window.SB_URL;
      if(window.SB_ANON && String(window.SB_ANON).indexOf('PASTE')===-1) anon=window.SB_ANON;
    }catch(e){}
    if(window.supabase && url.indexOf('PASTE')===-1 && anon.indexOf('PASTE')===-1){
      if(!state.sb || state.sbUrl!==url){ state.sb=window.supabase.createClient(url, anon); state.sbUrl=url; }
      return state.sb;
    }
    return null;
  }
  function status(msg){ var el=document.getElementById('forumStatus'); if(el) el.innerHTML=msg; }

  /* ── load ── */
  function load(quiet){
    var el=document.getElementById('forumList');
    if(el && !(quiet && el.querySelector('.for-topic'))) el.innerHTML='<div class="forum-empty"><span class="fe-icon">⏳</span>'+T('Loading discussions…','正在加载讨论…')+'</div>';
    var sb=sbClient();
    var tv=sb ? sb.from('forum_topics').select('id,category,title,body,author_email,author_name,upvotes,created_at').eq('hidden',false).order('created_at',{ascending:false}) : null;
    var rv=sb ? sb.from('forum_replies').select('id,topic_id,author_email,author_name,body,created_at').eq('hidden',false) : null;
    if(!tv){
      state.mode='local';
      var loc=localLoad();
      state.topics=loc.topics; state.replyCounts={};
      countReplies(loc.replies);
      status('<span class="for-banner">'+T('Forum is running on this device only — cloud sync will connect soon.','论坛目前仅在本机运行 — 云端同步即将接入。')+'</span>');
      render();
      return;
    }
    Promise.all([tv, rv]).then(function(res){
      state.mode='cloud';
      if(res[0].error){
        state.mode='local';
        var loc=localLoad();
        state.topics=loc.topics; state.replyCounts={};
        countReplies(loc.replies);
        status('<span class="for-banner">'+T('The forum is warming up on this device — your drafts are safe. Cloud sync will connect soon.','论坛正在本机预热——你的草稿安然无恙。云端同步即将接入。')+'</span>');
        render();
        return;
      }
      state.topics=res[0].data||[];
      var reps=res[1].data||[];
      countReplies(reps);
      render();
    }).catch(function(){
      state.mode='local';
      var loc=localLoad();
      state.topics=loc.topics; state.replyCounts={}; countReplies(loc.replies);
      status('<span class="for-banner">'+T('Cloud sync is offline — showing device-local discussions.','云端同步暂时离线 — 正在显示本机讨论。')+'</span>');
      render();
    });
  }
  function countReplies(reps){
    state.replyCounts={};
    (reps||[]).forEach(function(r){ state.replyCounts[r.topic_id]=(state.replyCounts[r.topic_id]||0)+1; });
  }

  /* ── render list ── */
  function renderCats(){
    var el=document.getElementById('forumCats'); if(!el) return;
    var html='<button type="button" class="for-cat'+(state.cat==='all'?' active':'')+'" data-cat="all">'+T('🗂 All','🗂 全部')+'</button>';
    CATS.forEach(function(c){
      html+='<button type="button" class="for-cat'+(state.cat===c.id?' active':'')+'" data-cat="'+c.id+'">'+c.icon+' '+T(c.en,c.zh)+'</button>';
    });
    el.innerHTML=html;
  }
  function render(){
    renderCats();
    renderTags();
    var el=document.getElementById('forumList'); if(!el) return;
    var list=state.topics.filter(function(t){ return state.cat==='all'||t.category===state.cat; });
    if(state.tag){
      var tg=state.tag;
      list=list.filter(function(t){ return extractTags((t.title||'')+' '+(t.body||'')).indexOf(tg)!==-1; });
    }
    if(state.sort==='top') list=list.slice().sort(function(a,b){ return (b.upvotes||0)-(a.upvotes||0); });
    else list=list.slice().sort(function(a,b){ return new Date(b.created_at)-new Date(a.created_at); });
    if(!list.length){
      var emptyTxt = state.tag
        ? T('Nothing with #'+state.tag+' yet — be the first!','还没有 #'+state.tag+' — 来发第一帖吧！')
        : (state.topics.length?T('Nothing here yet — try another category.','这里还没有内容 — 试试其他分类。')
            :T('No discussions yet. Be the first to start one!','还没有讨论。来发第一帖吧！'));
      el.innerHTML='<div class="forum-empty"><span class="fe-icon">'+(state.topics.length?'🔍':'🗣️')+'</span>'+emptyTxt+'</div>';
      return;
    }
    el.innerHTML=list.map(function(t){
      var c=catById(t.category);
      var sid=String(t.id).replace(/'/g,"\\'");
      var fresh=state.freshTopic!=null && String(state.freshTopic)===String(t.id);
      return '<div class="for-topic'+(fresh?' for-new':'')+'" data-id="'+sid+'" onclick="Forum.open(\''+sid+'\')">'
        +'<div class="for-topic-av">'+initial(t.author_name)+'</div>'
        +'<div class="for-topic-body">'
        +  '<div class="for-topic-title">'+linkTags(t.title)+'</div>'
        +  '<div class="for-topic-meta">'
        +    '<span class="for-chip">'+c.icon+' '+T(c.en,c.zh)+'</span>'
        +    '<span>'+esc(t.author_name||'?')+'</span>'
        +    '<span>·</span><span>'+fmtTime(t.created_at)+'</span>'
        +  '</div>'
        +  '<div class="for-excerpt">'+linkTags(t.body)+'</div>'
        +'</div>'
        +'<div class="for-topic-side">'
        +  '<span class="fs">💬 '+(state.replyCounts[t.id]||0)+'</span>'
        +  '<span class="fs">▲ '+(t.upvotes||0)+'</span>'
        +  (canDelete(t)?'<span class="fs"><button type="button" class="for-del" title="'+T('Delete topic','删除主题')+'" onclick="event.stopPropagation();Forum.delTopic(\''+sid+'\');return false;">🗑</button></span>':'')
        +'</div>'
        +'</div>';
    }).join('');
    var se=document.getElementById('forumStatus');
    if(se && !se.querySelector('.for-banner')) se.innerHTML='';
    if(state.freshTopic!=null){
      var nw=el.querySelector('.for-new');
      state.freshTopic=null;
      if(nw){
        try{ nw.scrollIntoView({behavior:REDUCE?'auto':'smooth',block:'center'}); }catch(e){}
        later(2600,function(){ nw.classList.remove('for-new'); });
      }
    }
  }

  /* ── hashtag filter ── */
  function byTag(raw){
    var tg=tagName(raw);
    state.tag=tg;
    state.cat='all';
    if(tg){
      var el=document.getElementById('forumList');
      if(el){ el.scrollIntoView({behavior:'smooth',block:'start'}); }
    }
    render();
    return false;
  }
  function renderTags(){
    var el=document.getElementById('forumTags'); if(!el) return;
    var tally=tagTally();
    var arr=Object.keys(tally).sort(function(a,b){ return tally[b]-tally[a] || (a<b?-1:1); }).slice(0,12);
    var html='';
    if(state.tag){
      html+='<button type="button" class="for-tag-chip active" onclick="event.stopPropagation();Forum.byTag(\'\');return false;">#'+esc(state.tag)+'&nbsp;✕</button>';
    }
    arr.forEach(function(tg){
      html+='<button type="button" class="for-tag-chip'+(state.tag===tg?' on':'')+'" onclick="event.stopPropagation();Forum.filterTag(\''+tg.replace(/'/g,"\\'")+'\');return false;">#'+esc(tg)+' <span class="for-tag-n">'+tally[tg]+'</span></button>';
    });
    el.innerHTML=html;
  }
  function filterTag(tg){ state.tag=tagName(tg); render(); return false; }
  function insertTag(tg){
    var el=document.getElementById('composerBody');
    if(!el) return;
    tg=tagName(tg);
    var v=el.value||'';
    var want='#'+tg;
    if(v.indexOf(want)===-1){
      el.value=(v? (/\s$/.test(v)? v : v+' ') : '')+want;
    }
    el.focus();
    return false;
  }

  /* ── composer ── */
  function openComposer(){
    var u=user();
    var note=document.getElementById('composerLoginNote');
    if(note){
      note.style.display=(u&&u.email)?'none':'block';
      note.innerHTML=(u&&u.email)?'':('👤 '+T('Please <a href="login.html">log in</a> to start a topic.','请先<a href="login.html">登录</a>后再发帖。'));
    }
    var sel=document.getElementById('composerCat');
    if(sel && !sel.options.length){
      CATS.forEach(function(c){
        var o=document.createElement('option');
        o.value=c.id; o.textContent=T(c.en,c.zh);
        sel.appendChild(o);
      });
    }
    document.getElementById('composerTitle').innerHTML=T('＋ New Topic','＋ 发新帖');
    document.getElementById('composerCatLabel').textContent=T('Category','分类');
    document.getElementById('composerTitleLabel').textContent=T('Title','标题');
    document.getElementById('composerBodyLabel').textContent=T('What would you like to discuss?','你想讨论什么？');
    document.getElementById('composerSubmit').textContent=T('🚀 Publish','🚀 发布');
    var inp=document.getElementById('composerTitleInput');
    inp.value='';
    document.getElementById('composerBody').value='';
    document.getElementById('composerError').textContent='';
    renderComposerTags();
    document.getElementById('composerOverlay').classList.add('open');
    document.body.style.overflow='hidden';
    setTimeout(function(){ inp.focus(); },50);
  }
  function closeComposer(){
    document.getElementById('composerOverlay').classList.remove('open');
    document.body.style.overflow='';
  }
  function renderComposerTags(){
    var el=document.getElementById('composerTags');
    if(!el) return;
    var tally=tagTally();
    var arr=Object.keys(tally).sort(function(a,b){ return tally[b]-tally[a] || (a<b?-1:1); }).slice(0,8);
    if(!arr.length){ el.style.display='none'; return; }
    el.style.display='block';
    var html='<div class="for-tag-label">'+T('Popular tags — tap to add','热门标签 — 点击添加')+'</div><div class="for-tag-list">';
    arr.forEach(function(tg){
      html+='<button type="button" class="for-tag-chip" onclick="Forum.insertTag(\''+tg.replace(/'/g,"\\'")+'\')">#'+esc(tg)+'</button>';
    });
    el.innerHTML=html+'</div>';
  }
  function submitTopic(){
    var u=user();
    if(!u || !u.email){ closeComposer(); return; }
    var title=document.getElementById('composerTitleInput').value.trim();
    var body=document.getElementById('composerBody').value.trim();
    var cat=document.getElementById('composerCat').value||'general';
    var err=document.getElementById('composerError');
    if(!title){ err.textContent=T('Give your topic a title.','请为帖子填写标题。'); return; }
    if(title.length>120){ err.textContent=T('Title is too long (120 max).','标题过长（最多 120 字）。'); return; }
    if(!body){ err.textContent=T('Write a little more than that.','再多写一点内容吧。'); return; }
    if(body.length>4000){ err.textContent=T('Body is too long (4000 max).','内容过长（最多 4000 字）。'); return; }
    err.textContent='';
    var row={ category:cat, title:title, body:body, author_email:u.email, author_name:userName(u)||u.email, upvotes:0 };
    var sb=sbClient();
    var btn=document.getElementById('composerSubmit');
    var modal=document.querySelector('#composerOverlay .forum-modal');
    if(btn){ if(btn.disabled) return; btn.disabled=true; btn.classList.add('for-sending'); btn.textContent=T('Publishing…','发布中…'); }
    function landed(id){
      state.freshTopic=id;
      if(state.cat!=='all' && state.cat!==cat) state.cat='all';
      state.tag='';
      if(modal) modal.classList.add('for-launch');
      later(420,function(){
        closeComposer();
        if(modal) modal.classList.remove('for-launch');
        if(btn){ btn.disabled=false; btn.classList.remove('for-sending'); }
        render();
      });
    }
    if(state.mode==='cloud' && sb){
      sb.from('forum_topics').insert(row).select().then(function(res){
        if(res.error || !res.data || !res.data[0]){
          saveLocalTopic(row);
        }else{
          state.topics.unshift(res.data[0]);
          row=res.data[0];
          state.seq=(state.seq||0)+1;
        }
        landed(row.id);
      }).catch(function(){ saveLocalTopic(row); landed(row.id); });
    }else{
      saveLocalTopic(row);
      landed(row.id);
    }
  }
  function saveLocalTopic(row){
    row.id='local_'+(++state.seq)+'_'+Date.now();
    row.created_at=new Date().toISOString();
    var loc=localLoad();
    loc.topics.unshift(row);
    localSave(loc);
    state.mode='local';
    state.topics=loc.topics;
    status('<span class="for-banner">'+T('Published on this device — cloud sync will connect soon.','已在本机发布 — 云端同步即将接入。')+'</span>');
  }

  /* ── thread view ── */
  function open(raw){
    var id=(typeof raw==='string'&&/^\d+$/.test(raw))?Number(raw):raw;
    var t=null;
    for(var i=0;i<state.topics.length;i++){ if(state.topics[i].id===id){ t=state.topics[i]; break; } }
    if(!t){ var loc=localLoad(); for(var k=0;k<loc.topics.length;k++){ if(loc.topics[k].id===id){ t=loc.topics[k]; break; } } }
    if(!t) return;
    state.threadId=id;
    var head=document.getElementById('threadHead');
    var c=catById(t.category);
    head.innerHTML='<div class="for-thread-head"><div class="ft-title">'+linkTags(t.title)+'</div>'
      +'<div class="ft-meta"><span class="for-chip">'+c.icon+' '+T(c.en,c.zh)+'</span>'
      +'<span>'+esc(t.author_name||'?')+'</span><span>·</span><span>'+fmtTime(t.created_at)+'</span>'
      +'<span>·</span><span>▲ '+(t.upvotes||0)+'</span></div></div>'
      +'<button type="button" class="for-close" onclick="Forum.closeThread()" aria-label="Close">✕</button>';
    var body=document.getElementById('threadBody');
    body.innerHTML='<div class="for-post">'
      +'<div class="fp-top"><span class="fp-who">'+esc(t.author_name||'?')+'</span><span class="fp-meta">'+fmtTime(t.created_at)+'</span></div>'
      +'<div class="fp-body">'+linkTags(t.body)+'</div>'
      +'<div class="fp-acts">'
      +  '<button type="button" class="for-btn'+(hasUpvoted(id)?' voted':'')+'" id="voteBtn" onclick="Forum.vote(\''+String(id)+'\')">▲ '+T((hasUpvoted(id)?'Upvoted':'Upvote'),(hasUpvoted(id)?'已点赞':'点赞'))+' ('+(t.upvotes||0)+')</button>'
      +  '<button type="button" class="for-btn flag" onclick="Forum.flag(\''+String(id)+'\')">⚑ '+T('Report','举报')+'</button>'
      +  (canDelete(t)?'<button type="button" class="for-btn danger" onclick="Forum.delTopic(\''+String(id)+'\')">🗑 '+T('Delete','删除')+'</button>':'')
      +'</div>'
      +'</div>';
    var foot=document.getElementById('threadFoot');
    foot.innerHTML='<div class="ft-hd" style="flex:1;text-align:left;font-weight:800;font-size:.85rem;align-self:center">'+T('💬 Replies · ','💬 回复 · ')+(state.replyCounts[id]||0)+'</div>'
      +'<button type="button" class="for-close" onclick="Forum.closeThread()">✕</button>';
    var hd=foot.querySelector('.ft-hd'); if(hd) hd.innerHTML=T('💬 Replies · ','💬 回复 · ')+'<span id="threadCount">'+(state.replyCounts[id]||0)+'</span>';
    var host=document.createElement('div');
    host.className='for-replies'; host.id='threadReplies';
    body.appendChild(host);
    body.appendChild(replyBoxEl(id));
    document.getElementById('forumOverlay').classList.add('open');
    document.body.style.overflow='hidden';
    loadReplies(id);
  }
  function closeThread(){
    document.getElementById('forumOverlay').classList.remove('open');
    document.body.style.overflow='';
    state.threadId=null;
    state.repTok++;
    load(true);
  }
  /* Replies live in #threadReplies, which is REPLACED on every load. (The old
     code appended the whole list again under the previous copy, so posting or
     deleting a reply duplicated the thread and left deleted replies on screen.) */
  function loadReplies(id, freshId){
    var host=document.getElementById('threadReplies');
    if(!host) return;
    if(!host.children.length) host.innerHTML='<div class="for-reply for-reply-loading"><div class="for-post">'+T('Loading replies…','正在加载回复…')+'</div></div>';
    var tok=++state.repTok;
    var sb=sbClient();
    function done(reps){
      if(tok!==state.repTok || String(state.threadId)!==String(id)) return;   /* stale response */
      /* replies that fell back to this device are shown with the cloud ones */
      var seen={};
      reps.forEach(function(r){ seen[String(r.id)]=1; });
      localRepliesOf(id).forEach(function(r){ if(!seen[String(r.id)]) reps.push(r); });
      reps.sort(function(x,y){ return new Date(x.created_at)-new Date(y.created_at); });
      renderRepliesList(id, reps, freshId);
    }
    if(state.mode==='cloud' && sb && !isLocalId(id)){
      sb.from('forum_replies').select('id,author_email,author_name,body,created_at').eq('topic_id',id).eq('hidden',false).order('created_at',{ascending:true}).then(function(res){
        done(res.error?[]:(res.data||[]).slice());
      }).catch(function(){ done([]); });
    }else{
      done([]);
    }
  }
  function localRepliesOf(id){
    var loc=localLoad();
    return loc.replies.filter(function(r){ return String(r.topic_id)===String(id); });
  }
  function setReplyCount(id, n){
    state.replyCounts[id]=n;
    var c=document.getElementById('threadCount'); if(c) c.textContent=n;
  }
  function replyHTML(r, fresh){
    var rid=esc(String(r.id));
    return '<div class="for-reply'+(fresh?' for-in':'')+'" data-rid="'+rid+'"><div class="for-post" style="margin-bottom:0">'
      +'<div class="fp-top"><span class="fp-who">'+esc(r.author_name||'?')+'</span><span class="fp-meta">'+fmtTime(r.created_at)+'</span>'
      +(canDelete(r)?'<button type="button" class="for-del" data-del="'+rid+'" title="'+T('Delete reply','删除回复')+'" aria-label="'+T('Delete reply','删除回复')+'">🗑</button>':'')
      +'</div>'
      +'<div class="fp-body">'+linkTags(r.body)+'</div></div></div>';
  }
  function emptyHTML(){
    return '<div class="for-reply for-reply-empty"><div class="for-post" style="text-align:center;color:var(--text3)">'+T('No replies yet. Start the conversation!','还没有回复。来开启对话吧！')+'</div></div>';
  }
  function renderRepliesList(id, reps, freshId){
    var host=document.getElementById('threadReplies'); if(!host) return;
    host.innerHTML=reps.length ? reps.map(function(r){ return replyHTML(r, freshId!=null && String(r.id)===String(freshId)); }).join('') : emptyHTML();
    setReplyCount(id, reps.length);
    var nw=host.querySelector('.for-in');
    if(nw){
      try{ nw.scrollIntoView({behavior:REDUCE?'auto':'smooth',block:'nearest'}); }catch(e){}
      later(1400,function(){ nw.classList.remove('for-in'); });
    }
  }
  function replyBoxEl(id){
    var u=user();
    var d=document.createElement('div');
    d.className='for-reply for-reply-box';
    d.id='replyBox';
    d.innerHTML='<div class="for-field" style="margin:0"><textarea id="replyInput" rows="3" maxlength="2000" placeholder="'+T('Write a reply… (log in to post)','写回复…（登录后即可发布）')+'"></textarea></div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem;margin-top:.5rem">'
      +'<div id="replyError" style="font-size:.78rem;color:var(--red)"></div>'
      +'<button type="button" class="for-btn primary" id="replySend">'+T('Reply','回复')+'</button>'
      +'</div>';
    d.querySelector('#replySend').addEventListener('click',function(){ submitReply(id); });
    d.querySelector('#replyInput').addEventListener('keydown',function(e){
      if(e.key==='Enter' && (e.metaKey||e.ctrlKey)){ e.preventDefault(); submitReply(id); }
    });
    return d;
  }
  function submitReply(id){
    var u=user();
    var err=document.getElementById('replyError');
    if(!u || !u.email){ if(err) err.innerHTML=T('Please <a href="login.html">log in</a> to reply.','请先<a href="login.html">登录</a>再回复。'); return; }
    var tid=(/^\d+$/.test(String(id)))?Number(id):id;
    var inp=document.getElementById('replyInput');
    var body=(inp?inp.value:'').trim();
    if(!body){ if(err) err.textContent=T('Write something first.','请先写点内容。'); return; }
    if(body.length>2000){ if(err) err.textContent=T('Reply is too long (2000 max).','回复过长（最多 2000 字）。'); return; }
    var btn=document.getElementById('replySend');
    if(btn){ if(btn.disabled) return; btn.disabled=true; btn.classList.add('for-sending'); btn.textContent=T('Sending…','发送中…'); }
    var row={ topic_id:tid, author_email:u.email, author_name:userName(u)||u.email, body:body };
    var sb=sbClient();
    function finish(newId){
      var inp2=document.getElementById('replyInput');
      if(inp2) inp2.value='';
      if(err) err.textContent='';
      if(btn){ btn.disabled=false; btn.classList.remove('for-sending'); btn.textContent=T('Reply','回复'); }
      loadReplies(tid, newId);
      load(true);
    }
    function saveLocalReply(){
      var loc=localLoad();
      row.id='local_'+Date.now()+'_'+Math.floor(Math.random()*1e6);
      row.created_at=new Date().toISOString();
      loc.replies.push(row);
      localSave(loc);
      return row.id;
    }
    if(state.mode==='cloud' && sb && !isLocalId(tid)){
      sb.from('forum_replies').insert(row).select('id').then(function(res){
        if(!res.error && res.data && res.data[0]) finish(res.data[0].id);
        else finish(saveLocalReply());
      }).catch(function(){ finish(saveLocalReply()); });
    }else{
      finish(saveLocalReply());
    }
  }

  /* ── votes / flags ── */
  function hasUpvoted(id){ try{ var s=JSON.parse(localStorage.getItem(UPVOTE_KEY)||'[]'); return s.indexOf(String(id))!==-1; }catch(e){ return false; } }
  function markUpvoted(id){ try{ var s=JSON.parse(localStorage.getItem(UPVOTE_KEY)||'[]'); if(s.indexOf(String(id))===-1){ s.push(String(id)); localStorage.setItem(UPVOTE_KEY, JSON.stringify(s)); } }catch(e){} }
  function vote(id){
    if(hasUpvoted(id)){ load(); return; }
    var t=null;
    state.topics.forEach(function(x){ if(String(x.id)===String(id)) t=x; });
    if(!t) return;
    markUpvoted(id);
    t.upvotes=(t.upvotes||0)+1;
    if(state.mode==='cloud' && state.sb){
      state.sb.from('forum_topics').update({ upvotes:t.upvotes }).eq('id',id).then(function(){ open(id); load(); }).catch(function(){ open(id); load(); });
    }else{
      var loc=localLoad();
      loc.topics.forEach(function(x){ if(x.id===id) x.upvotes=t.upvotes; });
      localSave(loc);
      open(id); load();
    }
  }
  function flag(id){
    var u=user();
    if(!u){ return; }
    if(state.mode==='cloud' && state.sb){
      state.sb.from('forum_topics').update({ flagged:true }).eq('id',id).then(function(){
        status('<span class="for-banner">'+T('Reported — a moderator will take a look.','已举报 — 管理员会尽快查看。')+'</span>');
        closeThread();
        load();
      }).catch(function(){ closeThread(); });
    }else{
      var loc=localLoad();
      loc.topics.forEach(function(x){ if(x.id===id) x.flagged=true; });
      localSave(loc);
      status(T('Reported (device-local).','已举报（仅本机）。'));
      closeThread();
    }
  }

  /* ── delete (own posts; admins may delete any) ── */
  function dropTopicCard(id, then){
    var card=null;
    document.querySelectorAll('#forumList .for-topic').forEach(function(c){ if(c.getAttribute('data-id')===String(id)) card=c; });
    if(!card){ then(); return; }
    card.style.height=card.offsetHeight+'px';
    card.classList.add('for-out');
    later(380,then);
  }
  function delTopic(raw){
    var u=user();
    if(!u || !u.email){ return; }
    var id=(typeof raw==='string'&&/^\d+$/.test(raw))?Number(raw):raw;
    var t=null;
    for(var i=0;i<state.topics.length;i++){ if(state.topics[i].id===id){ t=state.topics[i]; break; } }
    if(!canDelete(t)){ return; }
    if(!confirm(T('Delete this topic, including all of its replies? This cannot be undone.','删除该主题及其全部回复？此操作无法撤销。'))) return;
    var sb=sbClient();
    if(state.mode==='cloud' && sb){
      var q=sb.from('forum_topics').delete().eq('id',id);
      if(!isAdminU(u)) q=q.eq('author_email',u.email);
      q.then(function(res){
        if(res.error){ status('<span class="for-banner">'+esc(res.error.message)+'</span>'); return; }
        closeThread();
        dropTopicCard(id,function(){ load(true); });
      }).catch(function(){
        status('<span class="for-banner">'+T('Delete failed — please try again.','删除失败 — 请重试。')+'</span>');
      });
    }else{
      var loc=localLoad();
      loc.topics=loc.topics.filter(function(x){ return String(x.id)!==String(id); });
      loc.replies=loc.replies.filter(function(r){ return String(r.topic_id)!==String(id); });
      localSave(loc);
      closeThread();
      dropTopicCard(id,function(){ load(true); });
    }
  }
  function delReply(raw){
    var u=user();
    if(!u || !u.email){ return; }
    var id=(typeof raw==='string'&&/^\d+$/.test(raw))?Number(raw):raw;
    var tid=state.threadId;
    var host=document.getElementById('threadReplies');
    var node=null;
    if(host) host.querySelectorAll('.for-reply[data-rid]').forEach(function(n){ if(n.getAttribute('data-rid')===String(raw)) node=n; });
    if(node){
      if(node.classList.contains('for-out')) return;          /* already going */
      node.style.height=node.offsetHeight+'px';
      node.classList.add('for-out');
    }
    function gone(){
      later(360,function(){
        if(node && node.parentNode) node.parentNode.removeChild(node);
        var left=host?host.querySelectorAll('.for-reply[data-rid]').length:0;
        if(host && !left) host.innerHTML=emptyHTML();
        setReplyCount(tid, left);
        load(true);
      });
    }
    function failed(msg){
      if(node){ node.classList.remove('for-out'); node.style.height=''; }
      var err=document.getElementById('replyError');
      if(err) err.textContent=msg||T('Delete failed — please try again.','删除失败 — 请重试。');
    }
    if(isLocalId(id) || state.mode!=='cloud' || !state.sb){
      var loc=localLoad();
      loc.replies=loc.replies.filter(function(r){ return String(r.id)!==String(id); });
      localSave(loc);
      gone();
      return;
    }
    var q=state.sb.from('forum_replies').delete().eq('id',id);
    if(!isAdminU(u)) q=q.eq('author_email',u.email);
    q.select('id').then(function(res){
      if(res.error){ failed(res.error.message); return; }
      if(!res.data || !res.data.length){ failed(T('That reply could not be deleted.','该回复无法删除。')); return; }
      gone();
    }).catch(function(){ failed(); });
  }

  /* ── wire up ── */
  function init(){
    var cats=document.getElementById('forumCats');
    if(cats) cats.addEventListener('click',function(e){
      var b=e.target&&e.target.closest?e.target.closest('.for-cat'):null;
      if(!b) return;
      state.cat=b.getAttribute('data-cat');
      render();
    });
    document.getElementById('forumOverlay').addEventListener('click',function(e){
      if(e.target===this){ closeThread(); return; }
      var d=e.target&&e.target.closest?e.target.closest('[data-del]'):null;
      if(d){ e.preventDefault(); delReply(d.getAttribute('data-del')); }
    });
    document.getElementById('composerOverlay').addEventListener('click',function(e){
      if(e.target===this) closeComposer();
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){
        if(document.getElementById('forumOverlay').classList.contains('open')) closeThread();
        if(document.getElementById('composerOverlay').classList.contains('open')) closeComposer();
      }
    });
    var langBtn=document.getElementById('langToggle');
    if(langBtn) langBtn.addEventListener('click',function(){ render(); });
    load();
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  } else { init(); }

  window.Forum={ open:open, closeThread:closeThread, openComposer:openComposer, closeComposer:closeComposer, submitTopic:submitTopic, submitReply:submitReply, vote:vote, flag:flag, delTopic:delTopic, delReply:delReply, reload:load, byTag:byTag, filterTag:filterTag, insertTag:insertTag };
})();
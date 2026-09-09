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
  var CATS=[
    { id:'general',  icon:'🏠', en:'General',            zh:'综合' },
    { id:'injury',   icon:'🦴', en:'Injuries & Recovery', zh:'损伤与恢复' },
    { id:'nutrition',icon:'🥗', en:'Nutrition',           zh:'营养' },
    { id:'training', icon:'🏋️', en:'Training',            zh:'训练' },
    { id:'study',    icon:'📚', en:'Study & Exams',       zh:'学习与备考' }
  ];
  var state={ cat:'all', sort:'recent', mode:'cloud', topics:[], replyCounts:{}, seq:0, threadId:null };

  /* ── helpers ── */
  function lang(){ try{ return localStorage.getItem('sm_lang')==='zh'?'zh':'en'; }catch(e){ return 'en'; } }
  function T(en,zh){ return lang()==='zh'?zh:en; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function user(){
    try{ return JSON.parse(localStorage.getItem('sm_user')||'null')||null; }catch(e){ return null; }
  }
  function userName(u){ return (u&&u.name)?u.name:((u&&u.email)?u.email.split('@')[0]:null); }
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
  function load(){
    var el=document.getElementById('forumList');
    if(el) el.innerHTML='<div class="forum-empty"><span class="fe-icon">⏳</span>'+T('Loading discussions…','正在加载讨论…')+'</div>';
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
    var el=document.getElementById('forumList'); if(!el) return;
    var list=state.topics.filter(function(t){ return state.cat==='all'||t.category===state.cat; });
    if(state.sort==='top') list=list.slice().sort(function(a,b){ return (b.upvotes||0)-(a.upvotes||0); });
    else list=list.slice().sort(function(a,b){ return new Date(b.created_at)-new Date(a.created_at); });
    if(!list.length){
      el.innerHTML='<div class="forum-empty"><span class="fe-icon">'+(state.topics.length?'🔍':'🗣️')+'</span>'
        +(state.topics.length?T('Nothing here yet — try another category.','这里还没有内容 — 试试其他分类。')
          :T('No discussions yet. Be the first to start one!','还没有讨论。来发第一帖吧！'))+'</div>';
      return;
    }
    el.innerHTML=list.map(function(t){
      var c=catById(t.category);
      var sid=String(t.id).replace(/'/g,"\\'");
      return '<div class="for-topic" data-id="'+sid+'" onclick="Forum.open(\''+sid+'\')">'
        +'<div class="for-topic-av">'+initial(t.author_name)+'</div>'
        +'<div class="for-topic-body">'
        +  '<div class="for-topic-title">'+esc(t.title)+'</div>'
        +  '<div class="for-topic-meta">'
        +    '<span class="for-chip">'+c.icon+' '+T(c.en,c.zh)+'</span>'
        +    '<span>'+esc(t.author_name||'?')+'</span>'
        +    '<span>·</span><span>'+fmtTime(t.created_at)+'</span>'
        +  '</div>'
        +  '<div class="for-excerpt">'+esc(t.body)+'</div>'
        +'</div>'
        +'<div class="for-topic-side">'
        +  '<span class="fs">💬 '+(state.replyCounts[t.id]||0)+'</span>'
        +  '<span class="fs">▲ '+(t.upvotes||0)+'</span>'
        +'</div>'
        +'</div>';
    }).join('');
    var se=document.getElementById('forumStatus');
    if(se && !se.querySelector('.for-banner')) se.innerHTML='';
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
    document.getElementById('composerOverlay').classList.add('open');
    document.body.style.overflow='hidden';
    setTimeout(function(){ inp.focus(); },50);
  }
  function closeComposer(){
    document.getElementById('composerOverlay').classList.remove('open');
    document.body.style.overflow='';
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
    if(state.mode==='cloud' && sb){
      sb.from('forum_topics').insert(row).select().then(function(res){
        if(res.error){
          saveLocalTopic(row);
        }else{
          state.topics.unshift(res.data[0]);
          state.seq=(state.seq||0)+1;
        }
        closeComposer();
        render();
      }).catch(function(){ saveLocalTopic(row); closeComposer(); render(); });
    }else{
      saveLocalTopic(row);
      closeComposer();
      render();
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
    head.innerHTML='<div class="for-thread-head"><div class="ft-title">'+esc(t.title)+'</div>'
      +'<div class="ft-meta"><span class="for-chip">'+c.icon+' '+T(c.en,c.zh)+'</span>'
      +'<span>'+esc(t.author_name||'?')+'</span><span>·</span><span>'+fmtTime(t.created_at)+'</span>'
      +'<span>·</span><span>▲ '+(t.upvotes||0)+'</span></div></div>'
      +'<button type="button" class="for-close" onclick="Forum.closeThread()" aria-label="Close">✕</button>';
    var body=document.getElementById('threadBody');
    body.innerHTML='<div class="for-post">'
      +'<div class="fp-top"><span class="fp-who">'+esc(t.author_name||'?')+'</span><span class="fp-meta">'+fmtTime(t.created_at)+'</span></div>'
      +'<div class="fp-body">'+esc(t.body)+'</div>'
      +'<div class="fp-acts">'
      +  '<button type="button" class="for-btn'+(hasUpvoted(id)?' voted':'')+'" id="voteBtn" onclick="Forum.vote(\''+String(id)+'\')">▲ '+T((hasUpvoted(id)?'Upvoted':'Upvote'),(hasUpvoted(id)?'已点赞':'点赞'))+' ('+(t.upvotes||0)+')</button>'
      +  '<button type="button" class="for-btn flag" onclick="Forum.flag(\''+String(id)+'\')">⚑ '+T('Report','举报')+'</button>'
      +'</div>'
      +'</div>';
    var foot=document.getElementById('threadFoot');
    foot.innerHTML='<div class="ft-hd" style="flex:1;text-align:left;font-weight:800;font-size:.85rem;align-self:center">'+T('💬 Replies · ','💬 回复 · ')+(state.replyCounts[id]||0)+'</div>'
      +'<button type="button" class="for-close" onclick="Forum.closeThread()">✕</button>';
    renderReplies(id);
    document.getElementById('forumOverlay').classList.add('open');
    document.body.style.overflow='hidden';
    loadReplies(id);
  }
  function closeThread(){
    document.getElementById('forumOverlay').classList.remove('open');
    document.body.style.overflow='';
    state.threadId=null;
    load();
  }
  function loadReplies(id){
    var box=document.getElementById('threadBody');
    var loading=document.createElement('div');
    loading.className='for-reply';
    loading.id='repliesLoading';
    loading.innerHTML='<div class="for-post" style="opacity:.7">'+T('Loading replies…','正在加载回复…')+'</div>';
    box.appendChild(loading);
    var sb=sbClient();
    function done(reps, local){
      var el=document.getElementById('repliesLoading');
      if(el && el.parentNode) el.parentNode.removeChild(el);
      if(local) state.replyCounts[id]=reps.length;
      renderRepliesList(reps);
    }
    if(state.mode==='cloud' && sb){
      sb.from('forum_replies').select('id,author_email,author_name,body,created_at').eq('topic_id',id).eq('hidden',false).order('created_at',{ascending:true}).then(function(res){
        if(res.error){ done(localRepliesOf(id), true); } else { done(res.data||[], false); }
      }).catch(function(){ done(localRepliesOf(id), true); });
    }else{
      done(localRepliesOf(id), true);
    }
  }
  function localRepliesOf(id){
    var loc=localLoad();
    return loc.replies.filter(function(r){ return String(r.topic_id)===String(id); });
  }
  function renderReplies(id){
    var box=document.getElementById('threadBody');
    var u=user();
    box.innerHTML+='<div class="for-reply" id="replyBox">'
      +'<div class="for-field" style="margin:0"><textarea id="replyInput" rows="3" maxlength="2000" placeholder="'+T('Write a reply… (log in to post)','写回复…（登录后即可发布）')+'"></textarea></div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem;margin-top:.5rem">'
      +'<div id="replyError" style="font-size:.78rem;color:var(--red)"></div>'
      +'<button type="button" class="for-btn primary" onclick="Forum.submitReply(\''+String(id)+'\')">'+T('Reply','回复')+'</button>'
      +'</div></div>';
  }
  function renderRepliesList(reps){
    var box=document.getElementById('threadBody');
    var oldBox=document.getElementById('replyBox');
    if(oldBox && oldBox.parentNode) oldBox.parentNode.removeChild(oldBox);
    var empty = (reps&&reps.length) ? '' : '<div class="for-reply"><div class="for-post" style="text-align:center;color:var(--text3)">'+T('No replies yet. Start the conversation!','还没有回复。来开启对话吧！')+'</div></div>';
    var html=empty;
    (reps||[]).forEach(function(r){
      html+='<div class="for-reply"><div class="for-post" style="margin-bottom:0">'
        +'<div class="fp-top"><span class="fp-who">'+esc(r.author_name||'?')+'</span><span class="fp-meta">'+fmtTime(r.created_at)+'</span></div>'
        +'<div class="fp-body">'+esc(r.body)+'</div></div></div>';
    });
    html+=replyBoxEl().outerHTML;
    var wrap=document.createElement('div');
    wrap.innerHTML=html;
    while(wrap.firstChild) box.appendChild(wrap.firstChild);
  }
  function replyBoxEl(){
    var u=user();
    var d=document.createElement('div');
    d.className='for-reply';
    d.id='replyBox';
    d.innerHTML='<div class="for-field" style="margin:0"><textarea id="replyInput" rows="3" maxlength="2000" placeholder="'+T('Write a reply… (log in to post)','写回复…（登录后即可发布）')+'"></textarea></div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem;margin-top:.5rem">'
      +'<div id="replyError" style="font-size:.78rem;color:var(--red)"></div>'
      +'<button type="button" class="for-btn primary" onclick="Forum.submitReply('+(state.threadId||0)+')">'+T('Reply','回复')+'</button>'
      +'</div>';
    return d;
  }
  function submitReply(id){
    var u=user();
    if(!u || !u.email){ return; }
    var tid=(/^\d+$/.test(String(id)))?Number(id):id;
    var inp=document.getElementById('replyInput');
    var body=(inp?inp.value:'').trim();
    var err=document.getElementById('replyError');
    if(!body){ if(err) err.textContent=T('Write something first.','请先写点内容。'); return; }
    if(body.length>2000){ if(err) err.textContent=T('Reply is too long (2000 max).','回复过长（最多 2000 字）。'); return; }
    var row={ topic_id:tid, author_email:u.email, author_name:userName(u)||u.email, body:body };
    var sb=sbClient();
    function finish(){
      var inp2=document.getElementById('replyInput');
      if(inp2) inp2.value='';
      if(err) err.textContent='';
      loadReplies(tid);
      load();
    }
    function saveLocalReply(){
      var loc=localLoad();
      row.id='local_'+Date.now()+'_'+Math.floor(Math.random()*1e6);
      row.created_at=new Date().toISOString();
      loc.replies.push(row);
      localSave(loc);
      state.mode='local';
      status('<span class="for-banner">'+T('Published on this device — cloud sync will connect soon.','已在本机发布 — 云端同步即将接入。')+'</span>');
    }
    if(state.mode==='cloud' && sb){
      sb.from('forum_replies').insert(row).then(function(res){
        if(!res.error){ state.replyCounts[tid]=(state.replyCounts[tid]||0)+1; }
        else { saveLocalReply(); }
        finish();
      }).catch(function(){ saveLocalReply(); finish(); });
    }else{
      saveLocalReply();
      finish();
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
      if(e.target===this) closeThread();
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

  window.Forum={ open:open, closeThread:closeThread, openComposer:openComposer, closeComposer:closeComposer, submitTopic:submitTopic, submitReply:submitReply, vote:vote, flag:flag, reload:load };
})();
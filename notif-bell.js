/* ═══════════════════════════════════════════════════════════════════════════
   Vitalité — Notification bell (top-right)
   Shows dev replies to the signed-in user's Q&A messages.
   Mounts only when a user session exists; hidden otherwise.
   Data: qna_replies (notif-schema.sql) + qna_messages.user_id.
   Admin page is skipped — the dev console already has the inbox.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  if(window.__notifBellLoaded) return;
  window.__notifBellLoaded=true;

  /* ── Supabase (falls back to page-level config, same as qna-widget) ── */
  var SB_URL='https://eytmbftrjvsntyzwbtzl.supabase.co';
  var SB_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dG1iZnRyanZzbnR5endidHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTU2NjksImV4cCI6MjEwNDIzMTY2OX0.o0vRqteQ5XNgTNvnB3IEE9I67Oo_r4sy7JZ9qOGWSSc';
  if(window.SB_URL) SB_URL=window.SB_URL;
  if(window.SB_ANON) SB_ANON=window.SB_ANON;

  var T={
    title:  { en:'Notifications', zh:'通知' },
    reply:  { en:'Dev reply',     zh:'开发者回复' },
    via:    { en:'via Q&A',       zh:'来自问答' },
    empty:  { en:'No notifications yet. When a developer replies to one of your Q&A messages, it shows up here.', zh:'暂无通知。当开发者回复了您的问答消息时，会显示在这里。' },
    err:    { en:'Notifications unavailable. Try again later.', zh:'通知暂不可用，请稍后再试。' },
    new:    { en:'NEW',           zh:'新' },
    aria:   { en:'Notifications', zh:'通知' }
  };
  function tr(x){ try{ return (localStorage.sm_lang==='zh')?x.zh:x.en; }catch(e){ return x.en; } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  /* ── Skip admin (dev console has the inbox) ── */
  if(/admin\.html/i.test(location.pathname)) return;

  /* ── Signed-in check ── */
  function getUser(){
    try{
      var u=JSON.parse(localStorage.sm_user||'null');
      return (u && u.email) ? u : null;
    }catch(e){ return null; }
  }
  if(!getUser()) return;

  function getSb(cb){
    if(getSb.client){ cb(getSb.client); return; }
    if(window.supabase && window.supabase.createClient){
      try{ getSb.client=window.supabase.createClient(SB_URL,SB_ANON); cb(getSb.client); }catch(e){ cb(null); }
      return;
    }
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload=function(){ try{ getSb.client=window.supabase.createClient(SB_URL,SB_ANON); }catch(e){ getSb.client=null; } cb(getSb.client); };
    s.onerror=function(){ cb(null); };
    document.head.appendChild(s);
  }

  /* ── DOM ── */
  var bell=document.createElement('button');
  bell.type='button';
  bell.id='nbBell';
  bell.className='nb-bell';
  bell.title=tr(T.aria);
  bell.setAttribute('aria-label',tr(T.aria));
  bell.innerHTML='<span class="nb-bell-ic">🔔</span><span class="nb-badge" style="display:none"></span>';

  var host=document.querySelector('.header-actions');
  if(host && host.firstChild){ host.insertBefore(bell, host.firstChild); }
  else if(host){ host.appendChild(bell); }
  else{ bell.classList.add('nb-bell-fixed'); document.body.appendChild(bell); }

  var pop=document.createElement('div');
  pop.id='nbPop';
  pop.className='nb-pop';
  pop.setAttribute('role','dialog');
  pop.setAttribute('aria-label',tr(T.aria));
  pop.innerHTML='<div class="nb-pop-head"></div><div class="nb-pop-list"></div>';
  pop.querySelector('.nb-pop-head').textContent=tr(T.title);
  document.body.appendChild(pop);

  var unreadIds=[], opened=false;

  function badge(n){
    var b=bell.querySelector('.nb-badge');
    if(n>0){ b.style.display='inline-flex'; b.textContent=n>9?'9+':String(n); bell.classList.add('nb-has-unread'); }
    else{ b.style.display='none'; bell.classList.remove('nb-has-unread'); }
  }

  function timeAgo(iso){
    var t=new Date(iso);
    if(isNaN(t)) return '';
    var s=Math.max(0,(Date.now()-t.getTime())/1000);
    if(s<60) return Math.floor(s)+'s';
    if(s<3600) return Math.floor(s/60)+'m';
    if(s<86400) return Math.floor(s/3600)+'h';
    if(s<86400*30) return Math.floor(s/86400)+'d';
    return t.toISOString().slice(0,10);
  }

  function render(items){
    var list=pop.querySelector('.nb-pop-list');
    list.innerHTML='';
    var unread=0;
    items.forEach(function(r){
      var m=r.qna_messages||{};
      if(!r.read) unread++;
      var it=document.createElement('div');
      it.className='nb-item'+(r.read?'':' nb-unread');
      it.innerHTML=
        '<div class="nb-item-head">'+esc(tr(T.reply))+(r.read?'':'<span class="nb-new">'+esc(tr(T.new))+'</span>')+'</div>'
        +'<div class="nb-item-body">'+esc(r.body)+'</div>'
        +'<div class="nb-item-meta">'+esc(tr(T.via))+' · '+esc(m.page||'—')+' · '+esc(timeAgo(r.created_at))+'</div>';
      list.appendChild(it);
    });
    if(!items.length){
      var e=document.createElement('div');
      e.className='nb-empty';
      e.textContent=tr(T.empty);
      list.appendChild(e);
    }
    badge(unread);
    unreadIds=items.filter(function(r){ return !r.read; }).map(function(r){ return r.id; });
    /* If the popup is already open, viewing = read. */
    if(opened && unreadIds.length){ markRead(unreadIds); list.querySelectorAll('.nb-unread').forEach(function(x){ x.classList.remove('nb-unread'); }); badge(0); unreadIds=[]; }
  }

  function markRead(ids){
    getSb(function(sb){
      if(!sb) return;
      sb.from('qna_replies').update({ read:true }).in('id',ids).then(function(){ /* best effort */ });
    });
  }

  function fetchReplies(sb,user){
    var ors=[];
    if(user.id) ors.push('user_id.eq.'+user.id);
    if(user.email) ors.push('email.eq.'+user.email);
    var q=sb.from('qna_messages').select('id').or(ors.join(','));
    q.then(function(res){
      if(res.error){ pop.querySelector('.nb-pop-list').innerHTML='<div class="nb-empty">'+esc(tr(T.err))+'</div>'; return; }
      var ids=(res.data||[]).map(function(m){ return m.id; });
      if(!ids.length){ render([]); return; }
      sb.from('qna_replies')
        .select('id,body,dev_email,created_at,read,qna_messages(id,page,kind)')
        .in('message_id',ids)
        .order('created_at',{ ascending:false })
        .limit(30)
        .then(function(r2){
          if(r2.error){ pop.querySelector('.nb-pop-list').innerHTML='<div class="nb-empty">'+esc(tr(T.err))+'</div>'; return; }
          render(r2.data||[]);
        });
    });
  }

  function refresh(){
    if(!getUser()){ bell.style.display='none'; pop.classList.remove('open'); return; }
    getSb(function(sb){
      if(!sb){ return; }
      sb.auth.getSession().then(function(s){
        var u=(s && s.data && s.data.session && s.data.session.user)||null;
        if(!u){ bell.style.display='none'; pop.classList.remove('open'); return; }
        bell.style.display='inline-flex';
        fetchReplies(sb,u);
      }).catch(function(){ });
    });
  }

  /* ── Interactions ── */
  bell.addEventListener('click',function(e){
    e.stopPropagation();
    opened=pop.classList.toggle('open');
    if(opened) refresh();
  });
  document.addEventListener('click',function(e){
    if(pop.classList.contains('open') && !pop.contains(e.target) && !bell.contains(e.target)){
      pop.classList.remove('open'); opened=false;
    }
  });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && pop.classList.contains('open')){ pop.classList.remove('open'); opened=false; } });

  refresh();
  /* Keep the badge fresh while the user browses. */
  setInterval(refresh,60000);
})();
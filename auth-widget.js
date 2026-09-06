/* Shared account widget — header account button with dropdown (My Account / Log Out) + Admin Console shortcut for devs. Reads sm_user set by login.html. */
(function(){
  var DEV_EMAILS=['goldensword.gt@gmail.com','P54992163@gmail.com'];
  var headActions=null; /* stable ref to the header-actions group holding #loginBtn */

  function showCN(){ try{ return localStorage.getItem('sm_lang')==='zh'; }catch(e){ return false; } }
  function t(en,zh){ return showCN()?zh:en; }
  function currentUser(){
    try{ return JSON.parse(localStorage.getItem('sm_user')||'null')||null; }catch(e){ return null; }
  }
  function chosenName(){
    try{ var p=JSON.parse(localStorage.getItem('sm_profile')||'null'); return (p&&p.name)?p.name:null; }catch(e){ return null; }
  }
  function displayName(u){
    var n=(u&&u.name)?u.name:chosenName();
    return n?n:((u&&u.phone)?u.phone:((u&&u.email)?u.email:null));
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function isDev(u){ return !!(u&&u.email && DEV_EMAILS.indexOf(String(u.email).toLowerCase())!==-1); }

  function initHeadRef(){
    if(!headActions){
      var b=document.getElementById('loginBtn');
      if(b && b.parentNode) headActions=b.parentNode;
    }
    return headActions;
  }

  /* ---- Logout. Works from ANY page, no supabase lib required:
     1) clear the local auth mirrors (sm_user AND sm_profile — the profile
        name is the header's fallback, so leaving it makes "Oliver" survive
        logout)
     2) revoke the Supabase session via plain fetch (anon key is public by
        design — it's in every page's source anyway) and purge the stored
        token so NOTHING can resurrect the session — even a stale cached
        login.html will find no session to re-import
     3) land on index.html — the public landing page (no auth scripts there,
        so the logged-out state cannot be re-imported by any path) ---- */
  var V_SB={ url:'https://eytmbftrjvsntyzwbtzl.supabase.co', ref:'eytmbftrjvsntyzwbtzl', anon:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dG1iZnRyanZzbnR5endidHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTU2NjksImV4cCI6MjEwNDIzMTY2OX0.o0vRqteQ5XNgTNvnB3IEE9I67Oo_r4sy7JZ9qOGWSSc' };
  /* If the page itself declares Supabase config (login/admin do), prefer it —
     so a project switch keeps logout working without touching this file.
     Otherwise fall back to the embedded public config. */
  function sbCfg(){
    try{
      if(window.SB_URL && window.SB_ANON && String(window.SB_URL).indexOf('PASTE')===-1){
        var m=String(window.SB_URL).match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
        if(m && m[1]) return { url:String(window.SB_URL), ref:m[1], anon:String(window.SB_ANON) };
      }
    }catch(e){}
    return V_SB;
  }
  function logout(){
    var cfg=sbCfg();
    var done=function(){
      try{ localStorage.removeItem('sm_user'); }catch(e){}
      try{ localStorage.removeItem('sm_profile'); }catch(e){}
      try{ localStorage.removeItem('sb-'+cfg.ref+'-auth-token'); }catch(e){}
      try{ localStorage.removeItem('sb-'+V_SB.ref+'-auth-token'); }catch(e){}
      try{ localStorage.removeItem('sb-iftuqkfjwqnythhwencx-auth-token'); }catch(e){}
      window.location.href='index.html';
    };
    try{
      var raw=localStorage.getItem('sb-'+cfg.ref+'-auth-token');
      var tok=null; if(raw){ try{ tok=JSON.parse(raw); }catch(e){} }
      if(tok && tok.access_token){
        fetch(cfg.url+'/auth/v1/logout',{ method:'POST', headers:{ apikey:cfg.anon, 'Authorization':'Bearer '+tok.access_token } })
          .then(done).catch(done);
        return;
      }
    }catch(e){}
    done();
  }
  window.vLogout = logout;

  /* ---- Single shared close handler for the dropdown ---- */
  document.addEventListener('click',function(e){
    var w=document.getElementById('logWrap');
    var m=document.getElementById('logMenu');
    if(m && (!w || !w.contains(e.target))) m.classList.remove('open');
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      var m=document.getElementById('logMenu');
      if(m) m.classList.remove('open');
    }
  });

  function setAdminBtn(u){
    var existing=document.getElementById('adminGear');
    if(isDev(u)){
      if(!existing){
        var a=document.createElement('a');
        a.id='adminGear';
        a.className='btn-icon admin-gear';
        a.href='admin.html';
        a.title=t('🛠 Developer Tools','🛠 开发者工具');
        a.setAttribute('aria-label',a.title);
        a.textContent='🛠';
        var ha=initHeadRef();
        if(ha){ ha.appendChild(a); }
      }
    }else if(existing && existing.parentNode){
      existing.parentNode.removeChild(existing);
    }
  }

  /* Dev Tools is a main sidebar tab — reveal the group only for developers. */
  function setDevNav(u){
    var dev=isDev(u);
    Array.prototype.slice.call(document.querySelectorAll('.sidebar-group[data-part="vitalite-dev"]')).forEach(function(g){
      g.style.display = dev ? '' : 'none';
    });
  }

  function buildLoggedIn(name){
    var ha=initHeadRef();
    var b=document.getElementById('loginBtn');
    if(!ha || !b) return;

    /* Wrap button + dropdown inside a positioned container */
    var wrap=(b.parentNode && b.parentNode.id==='logWrap') ? b.parentNode : null;
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='logWrap';
      ha.insertBefore(wrap,b);
      wrap.appendChild(b); /* move btn inside the wrap */
    }

    b.className='btn-login';
    b.id='loginBtn';
    b.setAttribute('href','account.html');
    b.setAttribute('aria-haspopup','true');
    var cu=currentUser();
    b.title=(cu&&(cu.phone||cu.email))?(cu.phone||cu.email):'';
    b.textContent='';
    var n=document.createElement('span');
    n.className='bl-name';
    n.textContent=name;
    var caret=document.createElement('span');
    caret.className='caret';
    caret.textContent='▾';
    b.appendChild(n);
    b.appendChild(caret);

    var menu=document.getElementById('logMenu');
    if(!menu){
      menu=document.createElement('div');
      menu.id='logMenu';
      menu.className='log-menu';
      wrap.appendChild(menu);
    }
    menu.classList.remove('open');
    menu.innerHTML=
      '<a class="log-item" href="account.html">👤 '+t('My Account','我的账户')+'</a>'+
      '<button type="button" class="log-item" onclick="vLogout()">↺ '+t('Log Out','退出登录')+'</button>';

    b.onclick=function(e){
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle('open');
      return false;
    };
  }

  function buildLoggedOut(){
    var b=document.getElementById('loginBtn');
    if(!b) return;
    b.className='btn-login';
    b.id='loginBtn';
    b.setAttribute('href','login.html');
    b.removeAttribute('aria-haspopup');
    b.title='';
    b.textContent='👤 '+t('Log In','登录');
    b.onclick=null;
    var menu=document.getElementById('logMenu');
    if(menu && menu.parentNode){ menu.parentNode.removeChild(menu); }
    var wrap=document.getElementById('logWrap');
    /* Only remove the empty wrapper if the button is NOT inside it — otherwise
       logging out in place (login page's own #logoutBtn) would delete the
       header login button along with the wrapper. */
    if(wrap && wrap.parentNode && !wrap.contains(document.getElementById('loginBtn')) && !wrap.querySelector('.log-menu')){ wrap.parentNode.removeChild(wrap); }
  }

  function updateHeaderBtn(user){
    var name=displayName(user);
    if(name){ buildLoggedIn(name); } else { buildLoggedOut(); }
    setAdminBtn(user);
    setDevNav(user);
  }
  function build(){ var u=currentUser(); updateHeaderBtn(u); }
  function init(){
    if(document.body){ build(); return; }
    document.addEventListener('DOMContentLoaded',build);
  }
  window.refreshAuthWidget = build;
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
})();

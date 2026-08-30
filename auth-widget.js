/* Shared account widget — injects a floating Sign In / user chip, reads sm_user set by login.html. */
(function(){
  function showCN(){ try{ return localStorage.getItem('sm_lang')==='zh'; }catch(e){ return false; } }
  function t(en,zh){ return showCN()?zh:en; }
  function currentUser(){
    try{ return JSON.parse(localStorage.getItem('sm_user')||'null')||null; }catch(e){ return null; }
  }
  function build(){
    var fab=document.getElementById('acctFab');
    if(fab) fab.parentNode.removeChild(fab);
    var user=currentUser();
    fab=document.createElement('div');
    fab.id='acctFab';
    fab.style.cssText='position:fixed;right:1.5rem;bottom:5.5rem;z-index:1201;display:flex;align-items:center;gap:.5rem;cursor:pointer;border:1px solid rgba(120,130,160,.3);background:var(--surface,#fff);color:var(--text,#0f172a);padding:.5rem .95rem;border-radius:999px;font-size:.88rem;font-weight:600;box-shadow:0 16px 40px rgba(15,23,42,.13);transition:all .2s';
    var avat=document.createElement('span');
    avat.style.cssText='width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:.85rem';
    var uname=(user&&user.email)?(user.email[0]||'').toUpperCase():'👤';
    avat.textContent=uname;
    fab.appendChild(avat);
    var lab=document.createElement('span');
    if(user&&user.email){
      lab.textContent=t('Hi, ','你好，')+user.email;
      lab.style.cssText='max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    }else{
      lab.textContent=t('Sign In','登录');
      lab.style.color='var(--text2,#475569)';
    }
    fab.appendChild(lab);
    fab.addEventListener('click',function(){
      if(user&&user.email){
        if(confirm(t('Log out of this account?','确定退出该账号吗？'))){
          try{ localStorage.removeItem('sm_user'); }catch(e){}
          build(); location.href='login.html';
        }
      }else{
        location.href='login.html';
      }
    });
    document.body.appendChild(fab);
  }
  function init(){
    if(document.body){ build(); return; }
    document.addEventListener('DOMContentLoaded',build);
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
})();

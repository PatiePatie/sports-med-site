/* Shared account widget — updates the header Log In button with the signed-in member name, reads sm_user set by login.html. */
(function(){
  function showCN(){ try{ return localStorage.getItem('sm_lang')==='zh'; }catch(e){ return false; } }
  function t(en,zh){ return showCN()?zh:en; }
  function currentUser(){
    try{ return JSON.parse(localStorage.getItem('sm_user')||'null')||null; }catch(e){ return null; }
  }
  function displayName(u){ return (u&&u.name)?u.name:((u&&u.email)?u.email:null); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function updateHeaderBtn(user){
    var b=document.getElementById('loginBtn');
    if(!b) return;
    var name=displayName(user);
    if(name){
      b.innerHTML='👤 <span class="bl-name">'+escapeHtml(name)+'</span>';
      b.title=(user&&user.email)?user.email:'';
      if(b.getAttribute('href')!=='account.html') b.setAttribute('href','account.html');
    }else{
      b.textContent='👤 '+t('Log In','登录');
      b.title='';
      if(b.getAttribute('href')!=='login.html') b.setAttribute('href','login.html');
    }
  }
  function build(){ updateHeaderBtn(currentUser()); }
  function init(){
    if(document.body){ build(); return; }
    document.addEventListener('DOMContentLoaded',build);
  }
  window.refreshAuthWidget = build;
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
})();

/* Shared account widget — updates the header Log In button with the signed-in member name, reads sm_user set by login.html. Devs (Patrick + Oliver) additionally get an Admin Console shortcut. */
(function(){
  var DEV_EMAILS=['goldensword.gt@gmail.com','P54992163@gmail.com'];
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
    return n?n:((u&&u.email)?u.email:null);
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function isDev(u){ return !!(u&&u.email && DEV_EMAILS.indexOf(String(u.email).toLowerCase())!==-1); }
  function setAdminBtn(u){
    var existing=document.getElementById('adminGear');
    if(isDev(u)){
      if(!existing){
        var a=document.createElement('a');
        a.id='adminGear';
        a.className='btn-icon admin-gear';
        a.href='admin.html';
        a.title=t('🛠 Developer Console','🛠 开发者控制台');
        a.setAttribute('aria-label',a.title);
        a.textContent='🛠';
        var hb=document.getElementById('loginBtn');
        if(hb && hb.parentNode){ hb.parentNode.appendChild(a); }
      }
    }else if(existing && existing.parentNode){
      existing.parentNode.removeChild(existing);
    }
  }
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
    setAdminBtn(user);
  }
  function build(){ var u=currentUser(); updateHeaderBtn(u); }
  function init(){
    if(document.body){ build(); return; }
    document.addEventListener('DOMContentLoaded',build);
  }
  window.refreshAuthWidget = build;
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
})();

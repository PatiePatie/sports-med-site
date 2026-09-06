/* ═══ Auth gate: redirect to login.html if not signed in ═══
   Included on every site page EXCEPT index.html (public landing) and login.html.
   Reads sm_user (set by login.html). Preserves the target page as ?next= so
   login can bounce the user right back after signing in. */
(function(){
  try{
    var u = JSON.parse(localStorage.getItem('sm_user')||'null') || null;
    if(u && u.email && !u.suspended){
      /* signed in, allow — and point the brand logo at home (guide.html), not the landing */
      try{
        var logo = document.querySelector('a.logo[href="index.html"]');
        if(logo){ logo.href = 'guide.html'; }
      }catch(e){}
      return;
    }
  }catch(e){}
  var here = location.pathname.split('/').pop() + location.search + location.hash;
  var next = encodeURIComponent(here || '');
  location.replace('login.html' + (next ? '?next=' + next : ''));
})();
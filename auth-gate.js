/* ═══ Auth gate: redirect to login.html if not signed in ═══
   Included on every site page EXCEPT index.html (public landing) and login.html.
   Reads sm_user (set by login.html). Preserves the target page as ?next= so
   login can bounce the user right back after signing in.

   Search engines + AI fetchers are EXEMPT: they run without localStorage, so
   the gate would soft-redirect them to login.html and block public content
   from being indexed (Google reported the URLs as "not live"). The site
   content is public — the gate is a human convenience wall only. */
(function(){
  var ua = String(navigator.userAgent || '').toLowerCase();
  var isBot = /googlebot|google-extended|bingbot|slurp|duckduckbot|baiduspider|yandexbot|petalbot|bytespider|ccbot|gptbot|anthropic|claude|perplexitybot|oai-searchbot|facebookexternalhit|twitterbot|ia_archiver|semrushbot|ahrefsbot|sogou|360spider|applebot/i.test(ua);
  if (isBot) { return; }
  try{
    var u = JSON.parse(localStorage.getItem('sm_user')||'null') || null;
    if(u && !u.suspended && (u.email || u.guest)){
      /* signed in (or a guest mid-browse) — allow; point the brand logos at
         home (home.html for accounts, the textbook for guests), not the
         landing. The sidebar logo is parsed later, so fix it on DOM ready. */
      var home = u.email ? 'home.html' : 'guide.html';
      var fix = function(){
        try{
          var ls = document.querySelectorAll('a.logo[href="index.html"], .sidebar-logo a[href="index.html"]');
          for(var i=0;i<ls.length;i++) ls[i].href = home;
        }catch(e){}
      };
      fix();
      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', fix);
      return;
    }
  }catch(e){}
  var here = location.pathname.split('/').pop() + location.search + location.hash;
  var next = encodeURIComponent(here || '');
  location.replace('login.html' + (next ? '?next=' + next : ''));
})();
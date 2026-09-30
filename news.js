/* news.js — Vitalite Social → Forum → News.
   A "Discussions | News" switch above the forum. News is curated by GLM: the
   worker searches the web for recent sports-science news and writes short posts
   from those results only, each linking to its real source (worker type
   "news", cached 6 h at the edge). Here: a 1-hour copy in this browser, a
   reading state while the first fetch runs, and cards you can open at the
   source or take into the forum as a new topic. Bilingual. */
(function () {
  'use strict';
  var API = 'https://api.vitaliteplan.com';
  var box = document.querySelector('#forum .container');
  var cats = document.getElementById('forumCats');
  if (!box || !cats) return;
  var body = document.body;
  function zh() { return body.classList.contains('lang-zh') || (function () { try { return localStorage.getItem('sm_lang') === 'zh'; } catch (e) { return false; } })(); }
  function T(en, z) { return zh() ? z : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var TAGC = { research: '#2A63AB', injury: '#C23A43', nutrition: '#1F8A5B', training: '#C9771E', recovery: '#6D4BC4', industry: '#5E6B7B',
    '研究': '#2A63AB', '损伤': '#C23A43', '营养': '#1F8A5B', '训练': '#C9771E', '恢复': '#6D4BC4', '行业': '#5E6B7B' };

  var st = document.createElement('style');
  st.textContent =
    '.nw-tabs{display:inline-flex;gap:4px;padding:4px;margin:0 0 1rem;border-radius:99px;background:var(--surface2,#E4E9F0);box-shadow:var(--sg-press-sm,inset 0 1px 3px rgba(0,0,0,.12))}' +
    '.nw-tabs button{border:0;cursor:pointer;font:inherit;font-weight:700;font-size:.86rem;padding:.5rem 1.1rem;border-radius:99px;background:none;color:var(--text2,#445);transition:background .25s,color .25s,box-shadow .25s}' +
    '.nw-tabs button.on{background:var(--surface,#fff);color:var(--text,#0E1E33);box-shadow:var(--sg-raise-xs,0 1px 4px rgba(0,0,0,.14))}' +
    '.nw-tabs .nw-new{display:inline-block;margin-left:.35rem;width:7px;height:7px;border-radius:50%;background:#C23A43;vertical-align:2px}' +
    'html.nw-news #forumCats,html.nw-news #forumTags,html.nw-news #forumStatus,html.nw-news #forumList,html.nw-news #forumNewBtn{display:none!important}' +
    '.nw-view{display:none}html.nw-news .nw-view{display:block}' +
    '.nw-head{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;justify-content:space-between;margin-bottom:1rem;font-size:.8rem;color:var(--text3,#667)}' +
    '.nw-head b{color:var(--text,#0E1E33)}' +
    '.nw-refresh{border:0;cursor:pointer;font:inherit;font-size:.78rem;padding:.35rem .8rem;border-radius:99px;background:var(--surface,#fff);color:var(--text2,#445);box-shadow:var(--sg-raise-xs,0 1px 4px rgba(0,0,0,.14))}' +
    '.nw-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem}' +
    '.nw-card{position:relative;display:flex;flex-direction:column;gap:.55rem;padding:1.1rem 1.15rem 1rem;border-radius:22px;background:var(--surface,#fff);box-shadow:var(--sg-raise-sm,0 6px 18px rgba(0,0,0,.08)),var(--sg-rim,none);animation:nw-in .6s cubic-bezier(.16,1,.3,1) both}' +
    '@keyframes nw-in{from{opacity:0;transform:translateY(14px);filter:blur(6px)}}' +
    '.nw-meta{display:flex;align-items:center;gap:.5rem;font-size:.72rem;color:var(--text3,#667)}' +
    '.nw-tag{padding:.15rem .55rem;border-radius:99px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-size:.62rem;color:#fff;background:var(--c,#2A63AB)}' +
    '.nw-card h3{margin:0;font-family:var(--font-heading,inherit);font-size:1.02rem;line-height:1.35;color:var(--text,#0E1E33)}' +
    '.nw-card p{margin:0;font-size:.88rem;line-height:1.55;color:var(--text2,#334)}' +
    '.nw-by{display:flex;align-items:center;gap:.4rem;font-size:.7rem;color:var(--text3,#667)}' +
    '.nw-by i{width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#8DB6E2 45%,#1E4F8F)}' +
    '.nw-actions{display:flex;gap:.45rem;margin-top:auto;padding-top:.3rem}' +
    '.nw-actions a,.nw-actions button{border:0;cursor:pointer;font:inherit;font-size:.78rem;font-weight:700;padding:.45rem .8rem;border-radius:99px;text-decoration:none!important;background:var(--surface2,#E4E9F0);color:var(--text2,#334)}' +
    '.nw-actions a{color:var(--accent,#1E4F8F)}' +
    '.nw-skel{height:190px;border-radius:22px;background:linear-gradient(100deg,var(--surface2,#E4E9F0) 40%,var(--surface,#fff) 50%,var(--surface2,#E4E9F0) 60%) 0 0/300% 100%;animation:nw-sh 1.4s linear infinite}' +
    '@keyframes nw-sh{to{background-position:-150% 0}}' +
    '.nw-state{grid-column:1/-1;text-align:center;padding:1.2rem;font-size:.9rem;color:var(--text2,#334)}' +
    '.nw-state em{display:block;margin-top:.35rem;font-size:.76rem;color:var(--text3,#667);font-style:normal}' +
    '@media (prefers-reduced-motion:reduce){.nw-card,.nw-skel{animation:none}}';
  document.head.appendChild(st);

  var tabs = document.createElement('div');
  tabs.className = 'nw-tabs';
  tabs.setAttribute('role', 'tablist');
  box.insertBefore(tabs, cats);
  var view = document.createElement('div');
  view.className = 'nw-view';
  view.innerHTML = '<div class="nw-head"><span class="nw-about"></span><button type="button" class="nw-refresh"></button></div><div class="nw-list"></div>';
  box.appendChild(view);
  var list = view.querySelector('.nw-list');
  var mode = 'forum', loadedLang = '', busy = false;
  try { if (location.hash === '#news' || sessionStorage.getItem('nw_tab') === 'news') mode = 'news'; } catch (e) {}

  function paintTabs() {
    tabs.innerHTML = '<button type="button" role="tab" data-v="forum" class="' + (mode === 'forum' ? 'on' : '') + '">' + T('💬 Discussions', '💬 讨论') + '</button>' +
      '<button type="button" role="tab" data-v="news" class="' + (mode === 'news' ? 'on' : '') + '">' + T('📰 News', '📰 新闻') + (mode !== 'news' ? '<span class="nw-new"></span>' : '') + '</button>';
    view.querySelector('.nw-refresh').textContent = T('↻ Refresh', '↻ 刷新');
  }
  function show(m) {
    mode = m;
    document.documentElement.classList.toggle('nw-news', m === 'news');
    try { sessionStorage.setItem('nw_tab', m); } catch (e) {}
    paintTabs();
    if (m === 'news' && loadedLang !== (zh() ? 'zh' : 'en')) load(false);
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) show(b.getAttribute('data-v')); });
  view.querySelector('.nw-refresh').addEventListener('click', function () { load(true); });

  function skeleton() {
    var msgs = zh() ? ['Vitaline 正在检索最新的运动科学资讯…', '正在阅读研究与新闻…', '正在撰写摘要…'] : ['Vitaline is searching the web for new sports science…', 'Reading studies and news…', 'Writing the summaries…'];
    list.innerHTML = '<div class="nw-state"><span class="nw-msg">' + msgs[0] + '</span><em>' + T('The first load of the day can take 20–30 seconds.', '每天第一次加载可能需要 20–30 秒。') + '</em></div>' +
      '<div class="nw-skel"></div><div class="nw-skel"></div><div class="nw-skel"></div>';
    var i = 0, el = list.querySelector('.nw-msg');
    return setInterval(function () { i = Math.min(msgs.length - 1, i + 1); if (el) el.textContent = msgs[i]; }, 6000);
  }
  function fmtDate(d) {
    if (!d) return '';
    var t = new Date(d); if (isNaN(t)) return d;
    return t.toLocaleDateString(zh() ? 'zh-CN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function render(d) {
    var posts = (d && d.posts) || [];
    view.querySelector('.nw-about').innerHTML = '<b>' + T('Curated by Vitaline AI', '由 Vitaline AI 整理') + '</b> · ' +
      T('from recent sports-science news on the web · refreshed every 6 hours · always check the source', '来自网络上最新的运动科学资讯 · 每 6 小时更新 · 请以原文为准') +
      (d && d.generated_at ? ' · ' + T('updated ', '更新于 ') + new Date(d.generated_at).toLocaleString(zh() ? 'zh-CN' : 'en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : '');
    if (!posts.length) { list.innerHTML = '<div class="nw-state">' + T('No news right now. Try refreshing in a little while.', '暂时没有新闻，请稍后刷新。') + '</div>'; return; }
    list.innerHTML = posts.map(function (p, i) {
      var tag = String(p.tag || '').trim(), c = TAGC[tag.toLowerCase()] || TAGC[tag] || '#2A63AB';
      return '<article class="nw-card" style="animation-delay:' + (i * 70) + 'ms">' +
        '<div class="nw-meta">' + (tag ? '<span class="nw-tag" style="--c:' + c + '">' + esc(tag) + '</span>' : '') + '<span>' + esc(fmtDate(p.date)) + '</span><span>·</span><span>' + esc(p.source || '') + '</span></div>' +
        '<h3>' + esc(p.title) + '</h3><p>' + esc(p.summary) + '</p>' +
        '<div class="nw-by"><i></i>' + T('Posted by Vitaline AI', 'Vitaline AI 发布') + '</div>' +
        '<div class="nw-actions"><a href="' + esc(p.link) + '" target="_blank" rel="noopener">' + T('Read the source ↗', '阅读原文 ↗') + '</a><button type="button" data-i="' + i + '">' + T('💬 Discuss', '💬 讨论') + '</button></div></article>';
    }).join('');
    list.onclick = function (e) {
      var b = e.target.closest('button[data-i]'); if (!b || !window.Forum || !window.Forum.openComposer) return;
      var p = posts[+b.getAttribute('data-i')];
      show('forum');
      window.Forum.openComposer();
      setTimeout(function () {
        var ti = document.getElementById('composerTitleInput'), bo = document.getElementById('composerBody'), sel = document.getElementById('composerCat');
        if (ti) ti.value = String(p.title).slice(0, 120);
        if (bo) bo.value = p.summary + '\n\n' + T('Source: ', '来源：') + p.link + '\n\n' + T('What do you think?', '大家怎么看？');
        if (sel) sel.value = /nutri|营养/i.test(p.tag) ? 'nutrition' : /injur|recover|损伤|恢复/i.test(p.tag) ? 'injury' : /train|训练/i.test(p.tag) ? 'training' : 'general';
      }, 60);
    };
  }
  function load(force) {
    if (busy) return;
    var lang = zh() ? 'zh' : 'en', key = 'nw_cache_' + lang;
    if (!force) {
      try { var c = JSON.parse(localStorage.getItem(key) || 'null'); if (c && Date.now() - c.at < 3600e3 && c.d && c.d.posts && c.d.posts.length) { loadedLang = lang; render(c.d); return; } } catch (e) {}
    }
    busy = true;
    var tick = skeleton();
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'news', lang: lang }) })
      .then(function (r) { return r.json().then(function (d) { return { st: r.status, d: d }; }); })
      .then(function (res) {
        clearInterval(tick); busy = false;
        var d = res.d || {};
        if (d.ok && d.posts) { loadedLang = lang; try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), d: d })); } catch (e) {} render(d); return; }
        list.innerHTML = '<div class="nw-state">' + T('The news feed isn’t switched on yet.', '新闻功能尚未开启。') +
          '<em>' + T('It starts as soon as the updated Vitalité worker is deployed.', '更新后的 Vitalité 服务一部署就会开始。') + '</em></div>';
      }, function () {
        clearInterval(tick); busy = false;
        list.innerHTML = '<div class="nw-state">' + T('Couldn’t reach the news service. Check your connection and refresh.', '无法连接新闻服务，请检查网络后刷新。') + '</div>';
      });
  }
  new MutationObserver(function () {
    paintTabs();
    if (mode === 'news' && loadedLang && loadedLang !== (zh() ? 'zh' : 'en')) load(false);
  }).observe(body, { attributes: true, attributeFilter: ['class'] });
  show(mode);
})();

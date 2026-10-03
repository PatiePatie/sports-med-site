/* vitaline.js — Vitaline, the site guide, available on every page.
   Clicking "Vitaline AI" (sidebar, Study Tools, any guide.html?study=ai link)
   used to load the whole textbook just to open its chat. Now, on any page
   that doesn't have its own Vitaline modal, a sheet slides in right where you
   are. guide.html and the IB pages keep their own (their openAiModal wins).
   Same worker as before: POST {question, lang, mode:'site'}; follow-ups carry
   the last few turns so "and where is that?" makes sense. */
(function () {
  'use strict';
  var API = 'https://api.vitaliteplan.com';
  /* A hung POST never rejects, so the "Thinking…" bubble used to sit there
     forever with no way out but reloading. This mirrors the fix already applied
     on the other course pages: a real AbortController plus a hard timeout, so a
     stall becomes an error instead of an indefinite wait. */
  var TIMEOUT_MS = 25000;
  function __ask(url, opts) {
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var opts2 = opts || {};
    if (ctl) opts2.signal = ctl.signal;
    var timer = setTimeout(function () { if (ctl) { try { ctl.abort(); } catch (e) {} } }, TIMEOUT_MS);
    return fetch(url, opts2).then(function (r) {
      clearTimeout(timer); return r;
    }, function (e) {
      clearTimeout(timer); throw e;
    });
  }
  function __errText(e) {
    var timedOut = e && (e.name === 'AbortError' || /abort/i.test(String(e.message || '')));
    return timedOut
      ? T('That took too long, so I stopped waiting. Please try again.', '等待超时，已停止等待，请重试。')
      : T('Network error: please try again.', '网络错误，请重试。');
  }
  /* Same free-tier cap as the other pages, so this entry point cannot be used
     to get around the 5/day limit. */
  var QUOTA_KEY = 'vt_ai_quota';
  var FREE = 5;
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function quotaLeft() {
    try {
      var u = JSON.parse(localStorage.getItem('sm_user') || 'null');
      if (!u || !u.email) return Infinity;             /* signed out: worker decides */
      var ent = null;
      try { ent = JSON.parse(localStorage.getItem('sm_entitlement') || 'null'); } catch (e) {}
      if (ent && /plus|teacher|admin/.test(ent.plan || '')) return Infinity;
      if (window.VitaliteAccess && window.VitaliteAccess.state) {
        var st = window.VitaliteAccess.state();
        if (st && /plus|teacher|admin/.test(st.plan || '')) return Infinity;
      }
      var rec = JSON.parse(localStorage.getItem(QUOTA_KEY) || 'null') || { d: today(), n: 0 };
      if (rec.d !== today()) rec = { d: today(), n: 0 };
      return Math.max(0, FREE - rec.n);
    } catch (e) { return Infinity; }
  }
  function quotaBump() {
    if (quotaLeft() === Infinity) return;
    try {
      var rec = JSON.parse(localStorage.getItem(QUOTA_KEY) || 'null') || { d: today(), n: 0 };
      if (rec.d !== today()) rec = { d: today(), n: 0 };
      rec.n = rec.n + 1;
      localStorage.setItem(QUOTA_KEY, JSON.stringify(rec));
    } catch (e) {}
  }
  var body = document.body, el = null, log = [], busy = false;
  function zh() { return body.classList.contains('lang-zh') || (function () { try { return localStorage.getItem('sm_lang') === 'zh'; } catch (e) { return false; } })(); }
  function T(en, z) { return zh() ? z : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function md(s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n+/g, '<br>'); }

  var CSS = '.vl-sheet{position:fixed;inset:0;z-index:2147483000;display:flex;justify-content:flex-end;pointer-events:none}' +
    '.vl-sheet.on{pointer-events:auto}' +
    '.vl-scrim{position:absolute;inset:0;background:rgba(8,14,24,.3);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;transition:opacity .35s}' +
    '.vl-sheet.on .vl-scrim{opacity:1}' +
    '.vl-panel{position:relative;width:min(440px,100vw);height:100%;display:flex;flex-direction:column;background:var(--surface,#EEF2F7);color:var(--text,#0E1E33);' +
      'box-shadow:-20px 0 60px rgba(8,20,40,.25);border-radius:26px 0 0 26px;transform:translateX(104%);transition:transform .5s cubic-bezier(.2,.85,.25,1)}' +
    '.vl-sheet.on .vl-panel{transform:none}' +
    '.vl-head{display:flex;align-items:center;gap:.7rem;padding:1.1rem 1.1rem .8rem}' +
    '.vl-orb{width:38px;height:38px;border-radius:50%;flex:none;background:radial-gradient(circle at 35% 30%,#fff,#8DB6E2 45%,#1E4F8F);box-shadow:0 0 0 4px color-mix(in srgb,#8DB6E2 25%,transparent),0 6px 16px rgba(30,79,143,.35);animation:vl-orb 3s ease-in-out infinite}' +
    '.vl-sheet.thinking .vl-orb{animation-duration:.9s}' +
    '@keyframes vl-orb{50%{transform:scale(1.07);box-shadow:0 0 0 7px color-mix(in srgb,#8DB6E2 12%,transparent),0 6px 16px rgba(30,79,143,.35)}}' +
    '.vl-head b{display:block;font-family:var(--font-heading,inherit);font-size:1.05rem}' +
    '.vl-head span{font-size:.76rem;color:var(--text3,#667)}' +
    '.vl-x{margin-left:auto;width:36px;height:36px;border:0;border-radius:50%;cursor:pointer;font-size:1rem;color:var(--text2,#334);background:var(--surface,#EEF2F7);box-shadow:var(--sg-raise-xs,0 2px 6px rgba(0,0,0,.12))}' +
    '.vl-body{flex:1;overflow:auto;padding:.4rem 1.1rem 1rem;display:flex;flex-direction:column;gap:.6rem}' +
    '.vl-m{max-width:88%;padding:.65rem .85rem;border-radius:16px;font-size:.92rem;line-height:1.5;animation:vl-in .45s cubic-bezier(.16,1,.3,1) both}' +
    '.vl-m.bot{align-self:flex-start;background:var(--surface2,#E4E9F0);border-radius:16px 16px 16px 4px}' +
    '.vl-m.me{align-self:flex-end;background:#1E4F8F;color:#fff;border-radius:16px 16px 4px 16px}' +
    '.vl-m a{color:inherit;font-weight:700}' +
    '@keyframes vl-in{from{opacity:0;transform:translateY(8px)}}' +
    '.vl-dots{display:inline-flex;gap:4px}.vl-dots i{width:7px;height:7px;border-radius:50%;background:#1E4F8F;animation:vl-b 1s infinite}.vl-dots i:nth-child(2){animation-delay:.15s}.vl-dots i:nth-child(3){animation-delay:.3s}' +
    '@keyframes vl-b{50%{transform:translateY(-5px);opacity:.5}}' +
    '.vl-chips{display:flex;flex-wrap:wrap;gap:.35rem;padding:0 1.1rem .6rem}' +
    '.vl-chips button{border:0;cursor:pointer;font:inherit;font-size:.78rem;padding:.4rem .75rem;border-radius:99px;color:var(--text2,#334);background:var(--surface,#EEF2F7);box-shadow:var(--sg-raise-xs,0 1px 4px rgba(0,0,0,.12))}' +
    '.vl-foot{display:flex;gap:.5rem;padding:.8rem 1.1rem calc(1rem + env(safe-area-inset-bottom))}' +
    '.vl-in{flex:1;border:0;border-radius:99px;padding:.75rem 1rem;font:inherit;font-size:.95rem;color:var(--text,#0E1E33);background:var(--surface2,#E4E9F0);box-shadow:var(--sg-press-sm,inset 0 1px 3px rgba(0,0,0,.15));outline:none}' +
    '.vl-go{border:0;border-radius:99px;padding:0 1.1rem;font:inherit;font-weight:700;color:#fff;cursor:pointer;background:linear-gradient(135deg,#2A63AB,#1E4F8F)}' +
    'body.dark .vl-m.me{background:#3A78C2}' +
    '@media (max-width:600px){.vl-panel{width:100vw;border-radius:0}}' +
    '@media (prefers-reduced-motion:reduce){.vl-panel,.vl-m,.vl-orb{transition:none;animation:none}}';

  var SUGG = [['What can I do on this site?', '这个网站能做什么？'], ['Where are the flashcards?', '闪卡在哪里？'], ['How does the Body Checkup work?', '身体检查怎么用？'], ['Where is my recovery plan?', '我的康复计划在哪？']];
  function build() {
    if (el) return el;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    el = document.createElement('div');
    el.className = 'vl-sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="vl-scrim"></div><div class="vl-panel"><div class="vl-head"><i class="vl-orb"></i><div><b>Vitaline</b><span class="vl-sub"></span></div>' +
      '<button class="vl-x" type="button" aria-label="Close">✕</button></div><div class="vl-body"></div><div class="vl-chips"></div>' +
      '<form class="vl-foot"><input class="vl-in" autocomplete="off"><button class="vl-go" type="submit"></button></form></div>';
    body.appendChild(el);
    el.querySelector('.vl-scrim').addEventListener('click', close);
    el.querySelector('.vl-x').addEventListener('click', close);
    el.querySelector('.vl-chips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) send(b.textContent); });
    el.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); var i = el.querySelector('.vl-in'); send(i.value); i.value = ''; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('on')) close(); });
    labels();
    add('bot', T("Hi, I'm Vitaline, the site guide. Ask me where anything is or how to use it. For injuries, Vitaxamine in the Infirmary is the one to ask.", '你好，我是 Vitaline 网站向导。可以问我任何功能在哪里、怎么用。关于伤病，请去「诊所」问 Vitaxamine。'));
    return el;
  }
  function labels() {
    if (!el) return;
    el.querySelector('.vl-sub').textContent = T('Site guide · asks about pages and features', '网站向导 · 页面与功能');
    el.querySelector('.vl-in').placeholder = T('Ask about the site…', '询问网站相关问题…');
    el.querySelector('.vl-go').textContent = T('Ask', '提问');
    el.querySelector('.vl-chips').innerHTML = SUGG.map(function (s) { return '<button type="button">' + esc(zh() ? s[1] : s[0]) + '</button>'; }).join('');
  }
  function add(who, html, raw) {
    var m = document.createElement('div');
    m.className = 'vl-m ' + who;
    m.innerHTML = raw ? html : md(html);
    var b = el.querySelector('.vl-body'); b.appendChild(m); b.scrollTop = b.scrollHeight;
    return m;
  }
  function send(q) {
    q = String(q || '').trim();
    if (!q || busy) return;
    busy = true;
    add('me', q);
    var wait = add('bot', '<span class="vl-dots"><i></i><i></i><i></i></span>', true);
    el.classList.add('thinking');
    var ctx = log.slice(-4).map(function (x) { return (x.me ? 'User: ' : 'Vitaline: ') + x.t.slice(0, 500); }).join('\n');
    var question = ctx ? (T('Conversation so far:\n', '之前的对话：\n') + ctx + T('\n\nFollow-up: ', '\n\n追问：') + q) : q;
    if (quotaLeft() <= 0) {
      wait.innerHTML = md(T('You have used your free questions for today. Please try again tomorrow.',
                            '今日免费提问次数已用完，请明天再试。'));
      return;
    }
    quotaBump();
    log.push({ me: 1, t: q });
    __ask(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: question, lang: zh() ? 'zh' : 'en', mode: 'site' }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var t = d && d.reply ? d.reply : T('Sorry, I could not answer just now. Please try again.', '抱歉，暂时无法回答，请稍后再试。');
        wait.innerHTML = md(t); log.push({ me: 0, t: t });
      }, function (e) { wait.innerHTML = md(__errText(e)); })
      .then(function () { busy = false; el.classList.remove('thinking'); var b = el.querySelector('.vl-body'); b.scrollTop = b.scrollHeight; });
  }
  function open() {
    build();
    requestAnimationFrame(function () { el.classList.add('on'); setTimeout(function () { try { el.querySelector('.vl-in').focus({ preventScroll: true }); } catch (e) {} }, 350); });
  }
  function close() { if (el) el.classList.remove('on'); }

  /* only where the page has no Vitaline of its own */
  function mine() { return window.openAiModal && window.openAiModal.__vitaline; }
  function install() {
    if (typeof window.openAiModal !== 'function') {
      window.openAiModal = open; window.openAiModal.__vitaline = true;
      window.closeAiModal = close;
    }
    new MutationObserver(function () { labels(); }).observe(body, { attributes: true, attributeFilter: ['class'] });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="study=ai"], [data-study="openAiModal"]');
    if (!a || !mine() || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); e.stopPropagation();
    open();
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  window.Vitaline = { open: open, close: close };
})();

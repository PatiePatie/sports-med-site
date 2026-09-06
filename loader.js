/* Vitalité loading screen — shared. Include in <head> of pages that do real work
   (heavy layouts, 200-question banks, auth calls). Self-contained: injects its
   own stylesheet, JS-injected so no-JS visitors never get stuck behind it.
   Auto-hides on window load; 5s failsafe so no one is ever trapped;
   reduced-motion users get a snappy fade.
   Pages that need to hold it open (async work): call vLoader.hold() early,
   then vLoader.release() when your work settles. */
(function () {
  'use strict';
  try {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var zh = (localStorage.getItem('sm_lang') || '').toLowerCase() === 'zh';

    /* ─── styles ──────────────────────────────────────────────────────── */
    var css = '#v-loader{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.55rem;background:radial-gradient(120% 90% at 50% 0%,#14244f 0%,#0F1B3D 55%,#0a1329 100%);transition:opacity .45s ease}' +
             '#v-loader.v-loader-off{opacity:0;pointer-events:none}' +
             '#v-loader .v-loader-tile{width:44px;height:44px;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 26px rgba(0,0,0,.35),0 0 0 1px rgba(217,164,65,.4)}' +
             '#v-loader .v-loader-tile img{width:30px;height:30px;border-radius:7px;display:block}' +
             '#v-loader .v-loader-name{font-family:var(--font-heading),-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:1.05rem;font-weight:700;letter-spacing:-.01em;color:#fff}' +
             '#v-loader .v-loader-name span{color:#D9A441}' +
             '#v-loader .v-loader-bar{width:120px;height:2px;border-radius:2px;background:rgba(255,255,255,.12);overflow:hidden}' +
             '#v-loader .v-loader-bar-in{width:38%;height:100%;border-radius:2px;background:linear-gradient(90deg,#D9A441,#f0c878);animation:v-loader-slide 1.15s cubic-bezier(.4,.8,.4,1) infinite}' +
             '#v-loader .v-loader-label{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.5)}' +
'@keyframes v-loader-slide{0%{transform:translateX(-115%)}100%{transform:translateX(380%)}}' +
'@media (prefers-reduced-motion:reduce){#v-loader .v-loader-bar-in{animation:none}}';
    var sty = document.createElement('style');
    sty.textContent = css;
    (document.head || document.documentElement).appendChild(sty);

    /* ─── markup ──────────────────────────────────────────────────────── */
    var el = document.createElement('div');
    el.id = 'v-loader';
    el.setAttribute('aria-hidden', 'true');

    var tile = document.createElement('div');
    tile.className = 'v-loader-tile';
    var img = document.createElement('img');
    img.src = 'icons/vitalite-32.png';
    img.alt = '';
    img.width = 30;
    img.height = 30;
    tile.appendChild(img);

    var name = document.createElement('div');
    name.className = 'v-loader-name';
    name.innerHTML = 'Vital<span>it\u00e9</span>';

    var bar = document.createElement('div');
    bar.className = 'v-loader-bar';
    bar.appendChild(document.createElement('div')).className = 'v-loader-bar-in';

    var label = document.createElement('div');
    label.className = 'v-loader-label';
    label.textContent = zh ? '加载中…' : 'Loading\u2026';

    el.appendChild(tile);
    el.appendChild(name);
    el.appendChild(bar);
    el.appendChild(label);

    /* ─── lifecycle ───────────────────────────────────────────────────── */
    /* Deferred appearance: on fast pages load fires before the show timer
       and the loader NEVER appears — no flash. Only genuinely slow pages
       get a loader, and they keep it until load / failsafe. */
    var shown = false;
    var hidden = false;
    var deferT = null;
    var autoT = null;
    var loadH = function () { hide(); };

    function show() {
      if (shown || hidden) return;
      shown = true;
      document.body.appendChild(el);
      document.body.style.overflow = 'hidden';
    }

    function armAuto() {
      clearTimeout(autoT);
      autoT = setTimeout(function () { show(); hide(); }, reduce ? 1500 : 5000);
      /* worst case: hang forever → loader appears, then gives up. */
    }

    function hide() {
      if (hidden) return;
      hidden = true;
      clearTimeout(deferT);
      clearTimeout(autoT);
      window.removeEventListener('load', loadH);
      if (shown) {
        document.body.style.overflow = '';
        el.classList.add('v-loader-off');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 460);
      }
    }

    function init() {
      if (document.readyState === 'complete') return; /* already done — skip entirely */
      window.addEventListener('load', loadH);
      deferT = setTimeout(show, reduce ? 180 : 350);
      armAuto();
    }

    /* script sits in <head>; body may not exist yet — poll briefly, then
       fall back to DOMContentLoaded so we never throw. */
    if (document.body) init();
    else {
      var tries = 0;
      (function wait() {
        if (document.body) init();
        else if (++tries < 50) setTimeout(wait, 5);
        else document.addEventListener('DOMContentLoaded', init);
      })();
    }

    window.vLoader = {
      hide: hide,
      /* hold() forces the loader on NOW (cancels the defer) and disables
         both auto-hide paths. Call it before your async work settles,
         then call hide() yourself. Your responsibility now. */
      hold: function () { if (hidden) return; clearTimeout(deferT); clearTimeout(autoT); window.removeEventListener('load', loadH); show(); },
      release: function () { if (hidden) return; armAuto(); if (shown && document.readyState === 'complete') hide(); }
    };
  } catch (e) { /* fail soft — a loader must never break the page */ }
})();
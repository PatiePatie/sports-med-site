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
    var css =
      /* stage: deep navy, grid receding into darkness, soft vignette */
      '#v-loader{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.95rem;overflow:hidden;background:radial-gradient(130% 100% at 50% 0%,#14244f 0%,#0F1B3D 52%,#0a1329 100%);transition:opacity .45s ease}' +
      '#v-loader.v-loader-off{opacity:0;pointer-events:none}' +
      '#v-loader::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:34px 34px;-webkit-mask-image:radial-gradient(90% 75% at 50% 42%,#000 25%,transparent 100%);mask-image:radial-gradient(90% 75% at 50% 42%,#000 25%,transparent 100%);pointer-events:none}' +
      /* pulsing gold halo behind the mark */
      '#v-loader .v-loader-halo{position:absolute;top:50%;left:50%;width:210px;height:210px;margin:-105px 0 0 -105px;border-radius:50%;background:radial-gradient(closest-side,rgba(217,164,65,.3),rgba(126,144,255,.09) 55%,transparent);animation:v-pulse 2.6s ease-in-out infinite;pointer-events:none}' +
      /* activity ring: slow conic sweep around the tile, rimmed in gold */
      '#v-loader .v-loader-ring{position:relative;width:62px;height:62px;border-radius:19px;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,.5),0 0 0 1px rgba(217,164,65,.45),0 0 14px rgba(217,164,65,.22);animation:v-rise .7s cubic-bezier(.16,1,.3,1) both,v-bob 2.8s ease-in-out 1s infinite}' +
      '#v-loader .v-loader-ring::before{content:"";position:absolute;inset:-70%;background:conic-gradient(from 0deg,transparent 0 6%,rgba(240,200,120,.85) 14%,rgba(217,164,65,.45) 20%,transparent 26% 100%);animation:v-spin 2.3s linear infinite}' +
      '#v-loader .v-loader-tile{position:absolute;inset:4px;border-radius:15px;background:linear-gradient(160deg,#ffffff 0%,#e9edf6 100%);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 1px 0 #fff,inset 0 -4px 10px rgba(30,40,80,.14)}' +
      '#v-loader .v-loader-tile img{width:36px;height:36px;border-radius:9px;display:block}' +
      '#v-loader .v-loader-name{font-family:var(--font-heading),-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:1.18rem;font-weight:700;letter-spacing:.01em;color:#fff;opacity:0;animation:v-rise .7s .09s cubic-bezier(.16,1,.3,1) both}' +
      '#v-loader .v-loader-name span{color:#D9A441}' +
      '#v-loader .v-loader-bar{width:170px;height:3px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.35);transform:scaleX(0);transform-origin:left center;animation:v-grow .6s .2s cubic-bezier(.16,1,.3,1) both}' +
      '#v-loader .v-loader-bar-in{width:42%;height:100%;border-radius:3px;background:linear-gradient(90deg,#D9A441,#f0c878);box-shadow:0 0 8px rgba(240,200,120,.55);animation:v-slide 1.15s cubic-bezier(.4,.8,.4,1) infinite}' +
      '#v-loader .v-loader-label{font-size:.64rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.52);opacity:0;animation:v-rise .7s .3s cubic-bezier(.16,1,.3,1) both}' +
      '#v-loader .v-dots{display:inline-flex;gap:3px;margin-left:7px;vertical-align:2px}' +
      '#v-loader .v-dots i{width:3px;height:3px;border-radius:50%;background:#f0c878;opacity:.25;animation:v-dot 1.4s ease-in-out infinite}' +
      '#v-loader .v-dots i:nth-child(2){animation-delay:.18s}' +
      '#v-loader .v-dots i:nth-child(3){animation-delay:.36s}' +
      '@keyframes v-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}' +
      '@keyframes v-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}' +
      '@keyframes v-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}' +
      '@keyframes v-pulse{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.95;transform:scale(1.12)}}' +
      '@keyframes v-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}' +
      '@keyframes v-slide{0%{transform:translateX(-130%)}100%{transform:translateX(520%)}}' +
      '@keyframes v-dot{0%,60%,100%{opacity:.22;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}' +
      '@media (prefers-reduced-motion:reduce){#v-loader .v-loader-ring,#v-loader .v-loader-name,#v-loader .v-loader-bar,#v-loader .v-loader-label{animation:none;opacity:1;transform:none}#v-loader .v-loader-ring::before,#v-loader .v-loader-halo,#v-loader .v-loader-bar-in,#v-loader .v-dots i{animation:none}}';
    var sty = document.createElement('style');
    sty.textContent = css;
    (document.head || document.documentElement).appendChild(sty);

    /* ─── markup ──────────────────────────────────────────────────────── */
    var el = document.createElement('div');
    el.id = 'v-loader';
    el.setAttribute('aria-hidden', 'true');

    var halo = document.createElement('div');
    halo.className = 'v-loader-halo';

    var ring = document.createElement('div');
    ring.className = 'v-loader-ring';
    var tile = document.createElement('div');
    tile.className = 'v-loader-tile';
    var img = document.createElement('img');
    img.src = 'icons/vitalite-32.png';
    img.alt = '';
    img.width = 36;
    img.height = 36;
    tile.appendChild(img);
    ring.appendChild(tile);

    var name = document.createElement('div');
    name.className = 'v-loader-name';
    name.innerHTML = 'Vital<span>it\u00e9</span>';

    var bar = document.createElement('div');
    bar.className = 'v-loader-bar';
    bar.appendChild(document.createElement('div')).className = 'v-loader-bar-in';

    var label = document.createElement('div');
    label.className = 'v-loader-label';
    label.innerHTML = (zh ? '\u52a0\u8f7d\u4e2d' : 'Loading') + '<span class="v-dots"><i></i><i></i><i></i></span>';

    el.appendChild(halo);
    el.appendChild(ring);
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
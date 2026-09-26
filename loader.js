/* Vitalité loading screen — shared, in the Soft Glass look.
   Include in <head>, after vt-sources.js (the tips). Self-contained (injects
   its own stylesheet), JS-only so no-JS visitors never get stuck behind it.

   48 versions: 8 centrepieces (ring + orbit, sonar pulse, heart monitor, DNA
   helix, heartbeat bars, atom, breathing guide, footsteps) × 6 backdrops
   (grain, grid, dot matrix, contour rings, turning rays, aurora), each in one
   of 5 palettes. One is picked at random on every load, never the same as the
   last one (localStorage vt_ld_last). Every version carries the same core: the
   mark, the page being opened, a progress figure that follows how far the page
   really is, stage names, and a cited "Did you know?" tip.

   It shows for at least MIN ms and until the page has loaded; tap/click/key
   skips it after 0.6 s; a 9 s failsafe means nobody is ever trapped. Skipped
   when arriving from a category switch (the category wash is the loading
   screen then) and on bfcache restores (the script doesn't run). Reduced
   motion: nothing moves, and it leaves as soon as the page is ready.
   soft-fx.js floats the airbrushed icon set around it, and when it leaves
   (class v-loader-off) hands off to the page fog.
   API: vLoader.hold() keeps it up, vLoader.release() / hide() let it go. */
(function () {
  'use strict';
  try {
    var root = document.documentElement;
    var noop = { hide: function () {}, hold: function () {}, release: function () {}, active: function () { return false; } };
    if (root.classList.contains('sg-catgo')) { window.vLoader = noop; return; }
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var zh = false, dark = true;
    try { zh = (localStorage.getItem('sm_lang') || '').toLowerCase() === 'zh'; dark = localStorage.getItem('dark') !== 'false'; } catch (e) {}
    var MIN = reduce ? 0 : 2200, FAILSAFE = 9000, SKIP_AFTER = 600;

    /* ─── pick a version ──────────────────────────────────────────────── */
    var CENTRES = ['ring', 'pulse', 'monitor', 'helix', 'bars', 'atom', 'breath', 'steps'];
    var BACKS = ['grain', 'grid', 'dots', 'contour', 'rays', 'aurora'];
    var PALETTES = [
      ['#C23A43', '#1E4F8F', '#E0626A', '#8DB6E2'],   /* crimson + clinical blue */
      ['#0F8C8C', '#3B4FB8', '#3FC1C1', '#98A6F0'],   /* teal + indigo */
      ['#C9771E', '#B3323A', '#F0A94E', '#E57C82'],   /* amber + crimson */
      ['#6D4BC4', '#2F6FC0', '#A48AF0', '#8DB6E2'],   /* violet + blue */
      ['#1F8A5B', '#1E7A9E', '#4CC38A', '#6FC3E0']    /* emerald + ocean */
    ];
    var N = CENTRES.length * BACKS.length, last = -1, v;
    try { last = parseInt(localStorage.getItem('vt_ld_last'), 10); } catch (e) {}
    try { var force = /[?&]loader=(\d+)/.exec(location.search); if (force) last = -2, v = (parseInt(force[1], 10) - 1) % N; } catch (e) {}
    if (v == null || isNaN(v)) { do { v = Math.floor(Math.random() * N); } while (v === last && N > 1); }
    try { localStorage.setItem('vt_ld_last', String(v)); } catch (e) {}
    var centre = CENTRES[v % CENTRES.length], back = BACKS[Math.floor(v / CENTRES.length)];
    var pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];

    /* ─── styles ──────────────────────────────────────────────────────── */
    var E = 'cubic-bezier(.16,1,.3,1)';
    var css =
      '#v-loader{--lb:#E4E9F0;--lb2:#D3DCE8;--lt:#0E1E33;--lt2:rgba(14,30,51,.58);--lhi:rgba(255,255,255,.9);--llo:rgba(90,110,140,.34);--ltrack:rgba(30,79,143,.12);--lline:rgba(30,60,110,.09);' +
        'position:fixed;inset:0;z-index:2147483100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;overflow:hidden;' +
        'padding:env(safe-area-inset-top) 16px env(safe-area-inset-bottom);box-sizing:border-box;' +
        'background:radial-gradient(120% 90% at 50% 40%,var(--lb) 0%,var(--lb2) 100%);color:var(--lt);font-family:var(--font-heading,Georgia),serif;' +
        'transition:opacity .6s ' + E + ',transform .8s ' + E + '}' +
      '#v-loader.v-dark{--lb:#10203A;--lb2:#07101D;--lt:#EEF3F9;--lt2:rgba(238,243,249,.58);--lhi:rgba(120,160,215,.16);--llo:rgba(0,0,0,.55);--ltrack:rgba(141,182,226,.14);--lline:rgba(141,182,226,.08);--lacc:var(--lacc-d);--lacc2:var(--lacc2-d)}' +
      '#v-loader.v-loader-off{opacity:0!important;transform:scale(1.04);pointer-events:none}' +
      '#v-loader > *{position:relative;z-index:1}#v-loader > .vl-bg,#v-loader > .vl-ecg,#v-loader > .sg-icons{position:absolute;z-index:0}' +
      '#v-loader::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:multiply;z-index:2;' +
        'background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%272%27/%3E%3CfeColorMatrix values=%270 0 0 0 .45 0 0 0 0 .5 0 0 0 0 .6 0 0 0 .5 0%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")}' +
      '#v-loader.v-dark::after{mix-blend-mode:screen;opacity:.18}' +
      /* backdrops */
      '#v-loader .vl-bg{inset:0;pointer-events:none}' +
      '.vl-b-grid .vl-bg{background-image:linear-gradient(var(--lline) 1px,transparent 1px),linear-gradient(90deg,var(--lline) 1px,transparent 1px);background-size:36px 36px;-webkit-mask-image:radial-gradient(70% 60% at 50% 45%,#000,transparent);mask-image:radial-gradient(70% 60% at 50% 45%,#000,transparent);animation:vl-pan 14s linear infinite}' +
      '.vl-b-dots .vl-bg{background-image:radial-gradient(var(--lline) 1.6px,transparent 2px);background-size:22px 22px;-webkit-mask-image:radial-gradient(65% 55% at 50% 45%,#000,transparent);mask-image:radial-gradient(65% 55% at 50% 45%,#000,transparent)}' +
      '.vl-b-dots.v-dark .vl-bg,.vl-b-grid.v-dark .vl-bg{filter:brightness(1.6)}' +
      '.vl-b-contour .vl-bg{background:repeating-radial-gradient(circle at 50% 44%,transparent 0 26px,var(--lline) 27px 28px);-webkit-mask-image:radial-gradient(60% 55% at 50% 44%,#000,transparent);mask-image:radial-gradient(60% 55% at 50% 44%,#000,transparent);animation:vl-breathe 6s ease-in-out infinite}' +
      '.vl-b-rays .vl-bg{inset:-40%;background:repeating-conic-gradient(from 0deg at 50% 50%,color-mix(in srgb,var(--lacc) 7%,transparent) 0 6deg,transparent 6deg 18deg);-webkit-mask-image:radial-gradient(closest-side,#000 10%,transparent 75%);mask-image:radial-gradient(closest-side,#000 10%,transparent 75%);animation:vl-spin 40s linear infinite}' +
      '.vl-b-aurora .vl-bg{inset:-20%;background:radial-gradient(34% 28% at 30% 35%,color-mix(in srgb,var(--lacc) 20%,transparent),transparent 70%),radial-gradient(30% 26% at 72% 60%,color-mix(in srgb,var(--lacc2) 22%,transparent),transparent 70%),radial-gradient(26% 22% at 55% 20%,color-mix(in srgb,var(--lacc2) 14%,transparent),transparent 70%);animation:vl-drift 9s ease-in-out infinite alternate}' +
      '@keyframes vl-pan{to{background-position:36px 36px}}' +
      '@keyframes vl-breathe{50%{transform:scale(1.06)}}' +
      '@keyframes vl-drift{to{transform:translate(4%,-3%) rotate(6deg)}}' +
      /* the heartbeat line behind everything */
      '#v-loader .vl-ecg{left:0;right:0;top:50%;height:120px;margin-top:-116px;pointer-events:none;opacity:.5}' +
      '#v-loader .vl-ecg svg{width:100%;height:100%;display:block;overflow:visible}' +
      '#v-loader .vl-ecg path{fill:none;stroke:var(--lacc);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:420 1600;animation:vl-ecg 2.4s linear infinite}' +
      '@keyframes vl-ecg{from{stroke-dashoffset:420}to{stroke-dashoffset:-1600}}' +
      /* the stage and the mark (shared by every centrepiece) */
      '#v-loader .vl-stage{width:200px;height:200px;margin-bottom:.4rem;animation:vl-rise .8s ' + E + ' both}' +
      '#v-loader .vl-stage > *{position:absolute}' +
      '#v-loader .vl-disc{inset:40px;border-radius:50%;background:var(--lb);box-shadow:-9px -9px 20px var(--lhi),10px 12px 24px var(--llo),inset 0 1px 0 rgba(255,255,255,.5)}' +
      '#v-loader .vl-tile{left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:18px;background:#0F2238;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(8,20,40,.35),inset 0 1px 0 rgba(255,255,255,.25);animation:vl-beat 1.2s ease-in-out infinite;z-index:3}' +
      '#v-loader.v-dark .vl-tile{background:#fff}' +
      '#v-loader .vl-tile img{width:44px;height:44px;border-radius:11px;display:block}' +
      '@keyframes vl-beat{0%,40%,100%{transform:scale(1)}12%{transform:scale(1.09)}24%{transform:scale(.97)}32%{transform:scale(1.05)}}' +
      '#v-loader .vl-ring{inset:26px;transform:rotate(-90deg)}' +
      '#v-loader .vl-ring circle{fill:none;stroke-width:5;stroke-linecap:round}' +
      '#v-loader .vl-ring .t{stroke:var(--ltrack)}#v-loader .vl-ring .p{stroke:url(#vlg)}' +
      '.vl-c-breath .vl-ring circle,.vl-c-monitor .vl-ring circle{stroke-width:3}' +
      /* centrepieces */
      '#v-loader .vl-orbit{inset:0;animation:vl-spin 9s linear infinite}' +
      '#v-loader .vl-orbit i{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--lb);' +
        'box-shadow:-3px -3px 7px var(--lhi),3px 4px 8px var(--llo);transform:rotate(calc(var(--a) * 1deg)) translate(108px) rotate(calc(var(--a) * -1deg));animation:vl-pop .6s cubic-bezier(.34,1.56,.64,1) both;animation-delay:calc(var(--k) * .12s + .35s)}' +
      '#v-loader .vl-orbit i svg{width:24px;height:24px;display:block;animation:vl-spin 9s linear infinite reverse}' +
      '#v-loader .vl-sonar{left:50%;top:50%;width:120px;height:120px;margin:-60px;border-radius:50%;border:2px solid var(--lacc);opacity:0;animation:vl-sonar 2.4s cubic-bezier(.2,.6,.3,1) infinite}' +
      '#v-loader .vl-sonar.s2{animation-delay:.8s;border-color:var(--lacc2)}#v-loader .vl-sonar.s3{animation-delay:1.6s}' +
      '@keyframes vl-sonar{0%{transform:scale(.6);opacity:.7}100%{transform:scale(2.1);opacity:0}}' +
      '#v-loader .vl-mon{left:50%;top:50%;width:300px;height:118px;margin:-59px 0 0 -150px;border-radius:22px;background:color-mix(in srgb,var(--lb) 70%,#0B1628 30%);box-shadow:inset 0 2px 10px rgba(0,0,0,.35),0 1px 0 var(--lhi);overflow:hidden;z-index:0}' +
      '#v-loader .vl-mon svg{position:absolute;inset:0;width:100%;height:100%}' +
      '#v-loader .vl-mon path{fill:none;stroke:#4CE08A;stroke-width:2;stroke-dasharray:300 900;animation:vl-ecg-m 1.8s linear infinite;filter:drop-shadow(0 0 4px #4CE08A)}' +
      '#v-loader .vl-mon b{position:absolute;right:12px;top:8px;font:700 .72rem/1 ui-monospace,Menlo,monospace;color:#4CE08A;letter-spacing:.06em}' +
      '#v-loader .vl-mon em{position:absolute;left:12px;top:8px;font:700 .6rem/1 ui-monospace,Menlo,monospace;color:#8DB6E2;letter-spacing:.14em;font-style:normal}' +
      '@keyframes vl-ecg-m{from{stroke-dashoffset:300}to{stroke-dashoffset:-900}}' +
      '.vl-c-monitor .vl-disc{inset:56px}.vl-c-monitor .vl-ring{inset:44px}' +
      '#v-loader .vl-helix{left:-40px;right:-40px;top:50%;height:80px;margin-top:-40px;z-index:0}' +
      '#v-loader .vl-helix i{position:absolute;top:50%;width:8px;height:8px;margin:-4px;border-radius:50%;background:var(--lacc);animation:vl-hx 2.2s ease-in-out infinite;animation-delay:calc(var(--k) * -.14s)}' +
      '#v-loader .vl-helix i.b{background:var(--lacc2);animation-name:vl-hx2}' +
      '@keyframes vl-hx{0%,100%{transform:translateY(-30px) scale(.7);opacity:.5}50%{transform:translateY(30px) scale(1.15);opacity:1}}' +
      '@keyframes vl-hx2{0%,100%{transform:translateY(30px) scale(1.15);opacity:1}50%{transform:translateY(-30px) scale(.7);opacity:.5}}' +
      '#v-loader .vl-bars{left:50%;bottom:-6px;width:150px;margin-left:-75px;height:34px;display:flex;align-items:flex-end;justify-content:space-between}' +
      '#v-loader .vl-bars i{width:7px;border-radius:4px;background:linear-gradient(var(--lacc),var(--lacc2));height:30%;animation:vl-eq 1.2s ease-in-out infinite;animation-delay:calc(var(--k) * -.09s)}' +
      '@keyframes vl-eq{0%,100%{height:22%}50%{height:100%}}' +
      '.vl-c-bars .vl-stage{height:230px}' +
      '#v-loader .vl-atom{inset:-6px;z-index:2;overflow:visible}' +
      '#v-loader .vl-atom ellipse{fill:none;stroke:var(--ltrack);stroke-width:1.5}' +
      '#v-loader .vl-atom circle{fill:var(--lacc)}#v-loader .vl-atom circle.b{fill:var(--lacc2)}' +
      '#v-loader .vl-breath{left:50%;top:50%;width:132px;height:132px;margin:-66px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--lacc2) 22%,transparent),transparent 70%);animation:vl-in-out 5s ease-in-out infinite}' +
      '@keyframes vl-in-out{0%,100%{transform:scale(.8)}50%{transform:scale(1.45)}}' +
      '#v-loader .vl-breath-t{position:relative;font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--lacc2);margin-top:-.4rem}' +
      '#v-loader .vl-steps{left:-70px;right:-70px;bottom:-8px;height:34px;z-index:0}' +
      '#v-loader .vl-steps i{position:absolute;bottom:0;width:11px;height:20px;border-radius:50% 50% 45% 45%;background:var(--lacc2);opacity:0;animation:vl-step 3.2s linear infinite;animation-delay:calc(var(--k) * .4s)}' +
      '#v-loader .vl-steps i:nth-child(odd){bottom:12px;background:var(--lacc)}' +
      '@keyframes vl-step{0%{opacity:0}6%{opacity:.85}40%{opacity:.5}60%,100%{opacity:0}}' +
      '@keyframes vl-spin{to{rotate:360deg}}' +
      '@keyframes vl-pop{from{opacity:0;scale:.3}to{opacity:1;scale:1}}' +
      '@keyframes vl-rise{from{opacity:0;transform:translateY(14px) scale(.94);filter:blur(6px)}}' +
      /* words */
      '#v-loader .vl-name{font-size:2rem;font-weight:700;letter-spacing:-.01em;animation:vl-rise .8s .08s ' + E + ' both}' +
      '#v-loader .vl-name span{color:var(--lacc)}' +
      '#v-loader .vl-page{max-width:min(86vw,520px);text-align:center;font-size:.86rem;letter-spacing:.14em;text-transform:uppercase;color:var(--lt2);animation:vl-rise .8s .16s ' + E + ' both;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#v-loader .vl-row{display:flex;align-items:center;gap:.7rem;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--lt2);animation:vl-rise .8s .24s ' + E + ' both}' +
      '#v-loader .vl-pct{font-variant-numeric:tabular-nums;font-weight:700;color:var(--lacc2);min-width:3.2em;text-align:right}' +
      '#v-loader .vl-stg{display:inline-block;min-width:11em}' +
      '#v-loader .vl-stg.flip{animation:vl-flip .45s ' + E + '}' +
      '@keyframes vl-flip{from{opacity:0;transform:translateY(8px);filter:blur(4px)}}' +
      '#v-loader .vl-fact{position:absolute;left:0;right:0;margin:0 auto;bottom:calc(max(6vh,36px) + env(safe-area-inset-bottom));width:min(88vw,580px);text-align:center;font-size:1rem;line-height:1.5;color:var(--lt);animation:vl-rise .9s .7s ' + E + ' both;font-style:italic;font-variant:normal;text-transform:none;font-family:var(--font-body,Georgia),serif;transition:opacity .4s,filter .4s}' +
      '#v-loader .vl-fact.swap{opacity:0;filter:blur(5px)}' +
      '#v-loader .vl-fact b{display:block;font-style:normal;font-size:.66rem;letter-spacing:.26em;text-transform:uppercase;color:var(--lacc);margin-bottom:.3rem;font-family:var(--font-heading,Georgia),serif}' +
      '#v-loader .vl-fact cite{display:block;margin-top:.35rem;font-style:normal;font-size:.7rem;letter-spacing:.04em;color:var(--lt2)}' +
      '#v-loader .vl-skip{position:absolute;top:calc(16px + env(safe-area-inset-top));left:0;right:0;text-align:center;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--lt2);opacity:0;transition:opacity .5s}' +
      '#v-loader.vl-can-skip .vl-skip{opacity:.8}' +
      '#v-loader .vl-text{display:contents}' +
      /* phones, and short landscape screens */
      '@media (max-width:600px){#v-loader{gap:.75rem}#v-loader .vl-stage{transform:scale(.82);margin:-14px 0 -10px}#v-loader .vl-name{font-size:1.6rem}#v-loader .vl-page{font-size:.72rem;letter-spacing:.1em}#v-loader .vl-row{font-size:.72rem}#v-loader .vl-fact{font-size:.88rem}#v-loader .vl-mon{width:250px;margin-left:-125px}#v-loader .sg-ico-clinic,#v-loader .sg-ico-pulse,#v-loader .sg-ico-apple,#v-loader .sg-ico-dumbbell{display:none}}' +
      '@media (max-height:560px){#v-loader{flex-direction:row;flex-wrap:wrap;align-content:center;column-gap:1.4rem;row-gap:.3rem}#v-loader .vl-stage{transform:scale(.6);margin:-40px -24px -40px -40px}#v-loader > .sg-icons,#v-loader > .vl-ecg{display:none}#v-loader .vl-text{display:flex;flex-direction:column;align-items:flex-start;gap:.4rem}#v-loader .vl-fact{position:relative;bottom:auto;flex-basis:100%;font-size:.8rem;margin-top:.2rem}#v-loader .vl-breath-t{display:none}}' +
      '@media (prefers-reduced-motion:reduce){#v-loader *,#v-loader *::before{animation:none!important}}';
    var sty = document.createElement('style');
    sty.textContent = css;
    (document.head || root).appendChild(sty);

    /* ─── markup ──────────────────────────────────────────────────────── */
    var ICONS = [
      '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1 8.2 3.3 5 6.6 5c2 0 3.4 1.2 4.1 2.3h2.6C14 6.2 15.4 5 17.4 5 20.7 5 23 8.2 21.5 11.7 19.5 16.4 12 21 12 21z" fill="#D4555C"/><path d="M5 12h3.2l1.3-2.4 2 4.6 1.5-3.2h6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '<svg viewBox="0 0 24 24"><path d="M7.8 5.3a2.4 2.4 0 1 0-3.3 3.3 2.4 2.4 0 1 0 3.1 3.1l4.9 4.9a2.4 2.4 0 1 0 3.1 3.1 2.4 2.4 0 1 0 3.3-3.3 2.4 2.4 0 1 0-3.1-3.1l-4.9-4.9a2.4 2.4 0 1 0-3.1-3.1z" fill="#C9D6E6" stroke="#5E7FA8" stroke-width="1.1"/></svg>',
      '<svg viewBox="0 0 24 24"><rect x="2" y="8" width="3.4" height="8" rx="1" fill="#3A78C2"/><rect x="5.4" y="6.5" width="3" height="11" rx="1" fill="#1E4F8F"/><rect x="8.4" y="11" width="7.2" height="2" fill="#8593A5"/><rect x="15.6" y="6.5" width="3" height="11" rx="1" fill="#1E4F8F"/><rect x="18.6" y="8" width="3.4" height="8" rx="1" fill="#3A78C2"/></svg>',
      '<svg viewBox="0 0 24 24"><path d="M12 7.5c-1.6-1.4-5.8-1.6-7 2.2-1.2 3.9 1.5 10.8 4.6 10.8 1.2 0 1.5-.6 2.4-.6s1.2.6 2.4.6c3.1 0 5.8-6.9 4.6-10.8-1.2-3.8-5.4-3.6-7-2.2z" fill="#D4555C"/><path d="M12 7.6c0-2 .8-3.5 2.6-4.3" fill="none" stroke="#5E7F3A" stroke-width="1.5" stroke-linecap="round"/></svg>'
    ];
    var STAGES = zh ? ['热身中', '载入页面', '准备练习', '检查生命体征', '准备就绪'] : ['Warming up', 'Loading the page', 'Preparing practice', 'Checking vitals', 'Ready'];
    var title = (document.title || '').split(/\s[|·—–-]\s/)[0].trim().replace(/[<>&]/g, '');
    var beat = function (x, y0) { y0 = y0 || 60; return 'L' + (x - 30) + ' ' + y0 + ' L' + (x - 18) + ' ' + (y0 - 8) + ' L' + (x - 8) + ' ' + (y0 + 4) + ' L' + x + ' ' + (y0 - 48) + ' L' + (x + 10) + ' ' + (y0 + 46) + ' L' + (x + 20) + ' ' + (y0 - 10) + ' L' + (x + 30) + ' ' + y0 + ' L' + (x + 44) + ' ' + (y0 - 4) + ' L' + (x + 58) + ' ' + y0; };
    var i, parts = '';
    if (centre === 'ring') parts = '<div class="vl-orbit">' + ICONS.map(function (s, k) { return '<i style="--a:' + (k * 90 - 45) + ';--k:' + k + '">' + s + '</i>'; }).join('') + '</div>';
    if (centre === 'pulse') parts = '<i class="vl-sonar"></i><i class="vl-sonar s2"></i><i class="vl-sonar s3"></i>';
    if (centre === 'monitor') parts = '<div class="vl-mon"><svg viewBox="0 0 300 118" preserveAspectRatio="none"><path d="M0 64 ' + beat(60, 64) + ' ' + beat(160, 64) + ' ' + beat(260, 64) + ' L300 64"/></svg><em>ECG · II</em><b class="vl-hr">HR 72</b></div>';
    if (centre === 'helix') { parts = '<div class="vl-helix">'; for (i = 0; i < 14; i++) parts += '<i style="left:' + (i * 7.4 + 2) + '%;--k:' + i + '"></i><i class="b" style="left:' + (i * 7.4 + 2) + '%;--k:' + i + '"></i>'; parts += '</div>'; }
    if (centre === 'bars') { parts = '<div class="vl-bars">'; for (i = 0; i < 13; i++) parts += '<i style="--k:' + ((i * 7) % 13) + '"></i>'; parts += '</div>'; }
    if (centre === 'atom') {
      parts = '<svg class="vl-atom" viewBox="0 0 212 212">';
      [0, 60, 120].forEach(function (rot, k) {
        var d = 'M16 106 a90 34 0 1 0 180 0 a90 34 0 1 0 -180 0';
        parts += '<g transform="rotate(' + rot + ' 106 106)"><ellipse cx="106" cy="106" rx="90" ry="34"/><circle r="5"' + (k % 2 ? ' class="b"' : '') + '><animateMotion dur="' + (2.4 + k * 0.5) + 's" repeatCount="indefinite" path="' + d + '"/></circle></g>';
      });
      parts += '</svg>';
    }
    if (centre === 'breath') parts = '<i class="vl-breath"></i>';
    if (centre === 'steps') { parts = '<div class="vl-steps">'; for (i = 0; i < 8; i++) parts += '<i style="left:' + (i * 12 + 4) + '%;--k:' + i + '"></i>'; parts += '</div>'; }
    var under = centre === 'monitor' || centre === 'helix' || centre === 'breath';   /* drawn behind the disc */

    var el = document.createElement('div');
    el.id = 'v-loader';
    el.className = (dark ? 'v-dark ' : '') + 'vl-c-' + centre + ' vl-b-' + back;
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-version', String(v + 1));
    el.style.cssText = '--lacc:' + pal[0] + ';--lacc2:' + pal[1] + ';--lacc-d:' + pal[2] + ';--lacc2-d:' + pal[3];
    var ecg = 'M0 60 ' + beat(200) + ' ' + beat(520) + ' ' + beat(840) + ' ' + beat(1120) + ' L1400 60';
    el.innerHTML =
      '<div class="vl-bg"></div>' +
      (centre === 'monitor' ? '' : '<div class="vl-ecg"><svg viewBox="0 0 1400 120" preserveAspectRatio="none"><path d="' + ecg + '"/></svg></div>') +
      '<div class="vl-stage">' + (under ? parts : '') + '<div class="vl-disc"></div>' +
        '<svg class="vl-ring" viewBox="0 0 148 148"><defs><linearGradient id="vlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '"/></linearGradient></defs>' +
        '<circle class="t" cx="74" cy="74" r="66"/><circle class="p" cx="74" cy="74" r="66"/></svg>' +
        '<div class="vl-tile"><img src="icons/vitalite-180.png" alt="" width="44" height="44"></div>' +
        (under ? '' : parts) + '</div>' +
      '<div class="vl-text">' +
        (centre === 'breath' ? '<div class="vl-breath-t">' + (zh ? '吸气' : 'Breathe in') + '</div>' : '') +
        '<div class="vl-name">Vital<span>ité</span></div>' +
        (title ? '<div class="vl-page">' + (zh ? '正在打开 · ' : 'Opening · ') + title + '</div>' : '') +
        '<div class="vl-row"><span class="vl-pct">0%</span><span class="vl-stg">' + STAGES[0] + '</span></div>' +
      '</div>' +
      '<div class="vl-fact"><b>' + (zh ? '你知道吗？' : 'Did you know?') + '</b><span></span><cite></cite></div>' +
      '<div class="vl-skip">' + (zh ? '点击任意处跳过' : 'Tap anywhere to skip') + '</div>';
    var ring = el.querySelector('.vl-ring .p'), pct = el.querySelector('.vl-pct'), stg = el.querySelector('.vl-stg');
    var C = 2 * Math.PI * 66;
    ring.style.strokeDasharray = C.toFixed(1);
    ring.style.strokeDashoffset = C.toFixed(1);

    /* ─── tips: cited, never the same one twice in a row ──────────────── */
    var fact = el.querySelector('.vl-fact'), fTxt = fact.querySelector('span'), fCite = fact.querySelector('cite');
    function tip() {
      var T = window.VT_TIPS, CI = window.VT_CITE;
      if (!T || !T.length) { fact.style.display = 'none'; return; }
      var lt = -1; try { lt = parseInt(localStorage.getItem('vt_tip_last'), 10); } catch (e) {}
      var k; do { k = Math.floor(Math.random() * T.length); } while (k === lt && T.length > 1);
      try { localStorage.setItem('vt_tip_last', String(k)); } catch (e) {}
      fTxt.textContent = zh ? T[k].zh : T[k].en;
      fCite.textContent = CI ? '— ' + CI.short(T[k].ref) : '';
      fact.title = CI ? CI.full(T[k].ref) : '';
    }
    tip();

    /* ─── lifecycle ───────────────────────────────────────────────────── */
    var shown = false, hidden = false, held = false, t0 = 0, raf = 0, shownP = 0, stage = 0, failT = 0, tipT = 0, hrT = 0, brT = 0;
    function ready() {
      var rs = document.readyState;
      /* a slow CDN (jsDelivr, fonts) can hold back the load event for seconds
         from Beijing: once the page itself is usable and the minimum is over,
         don't make anyone wait for third-party files */
      if (rs === 'interactive' && performance.now() - t0 > MIN + 1200) return 1;
      return rs === 'complete' ? 1 : rs === 'interactive' ? 0.72 : 0.35;
    }
    function frame(now) {
      raf = 0;
      if (hidden) return;
      var e = now - t0;
      var target = Math.min(ready(), MIN ? 0.15 + 0.85 * Math.min(1, e / MIN) : 1);
      if (held) target = Math.min(target, 0.9);
      shownP += (target - shownP) * 0.08;
      if (target >= 1 && shownP > 0.995) shownP = 1;
      ring.style.strokeDashoffset = (C * (1 - shownP)).toFixed(1);
      pct.textContent = Math.round(shownP * 100) + '%';
      var s = Math.min(STAGES.length - 1, Math.floor(shownP * (STAGES.length - 1) + 0.02));
      if (s !== stage) { stage = s; stg.textContent = STAGES[s]; stg.classList.remove('flip'); void stg.offsetWidth; stg.classList.add('flip'); }
      if (e > SKIP_AFTER) el.classList.add('vl-can-skip');
      if (shownP === 1 && !held) { setTimeout(hide, 260); return; }
      raf = requestAnimationFrame(frame);
    }
    function skip(ev) {
      if (!shown || hidden || performance.now() - t0 < SKIP_AFTER) return;
      if (ev && ev.type === 'keydown' && (ev.metaKey || ev.ctrlKey || ev.altKey)) return;
      hide();
    }
    function show() {
      if (shown || hidden) return;
      shown = true; t0 = performance.now();
      document.body.appendChild(el);
      document.body.style.overflow = 'hidden';
      ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { window.addEventListener(t, skip, { passive: true }); });
      raf = requestAnimationFrame(frame);
      failT = setTimeout(hide, FAILSAFE);
      tipT = setInterval(function () { fact.classList.add('swap'); setTimeout(function () { tip(); fact.classList.remove('swap'); }, 400); }, 5200);
      var hr = el.querySelector('.vl-hr');
      if (hr) hrT = setInterval(function () { hr.textContent = 'HR ' + (68 + Math.round(Math.random() * 8)); }, 900);
      var bt = el.querySelector('.vl-breath-t');
      if (bt) { var inn = true; brT = setInterval(function () { inn = !inn; bt.textContent = inn ? (zh ? '吸气' : 'Breathe in') : (zh ? '呼气' : 'Breathe out'); }, 2500); }
    }
    function hide() {
      if (hidden) return;
      hidden = true;
      clearTimeout(failT); clearInterval(tipT); clearInterval(hrT); clearInterval(brT);
      if (raf) cancelAnimationFrame(raf);
      ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { window.removeEventListener(t, skip); });
      if (!shown) return;
      document.body.style.overflow = '';
      ring.style.strokeDashoffset = '0'; pct.textContent = '100%';
      el.classList.add('v-loader-off');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 820);
      try { document.dispatchEvent(new Event('vloader:hide')); } catch (e) {}
    }
    function init() {
      if (document.readyState === 'complete' && !MIN) return;
      show();
    }
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
      version: function () { return { n: v + 1, of: N, centre: centre, backdrop: back }; },
      active: function () { return shown && !hidden; },
      hold: function () { if (hidden) return; held = true; show(); },
      release: function () { held = false; if (shown && !hidden && !raf) raf = requestAnimationFrame(frame); }
    };
  } catch (e) { /* fail soft — a loader must never break the page */ }
})();

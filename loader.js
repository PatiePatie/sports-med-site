/* Vitalité loading screen — shared, in the Soft Glass look.
   Include in <head>. Self-contained (injects its own stylesheet), JS-only so
   no-JS visitors never get stuck behind it.

   It shows on every page load for at least MIN ms (a short, deliberate
   moment: the mark beats, a heartbeat runs behind it, four icons orbit, a
   progress ring fills with how far the page really is, stages tick over and
   a fact is shown), then leaves once the page has loaded. Tap/click/key skips
   it after the first 0.6 s. A 9 s failsafe means nobody is ever trapped.
   Skipped entirely when arriving from a category switch (the category wash is
   the loading screen then) and on bfcache restores (the script doesn't run).
   Reduced motion: no animation, and it leaves as soon as the page is ready.

   soft-fx.js floats the airbrushed icon set around it once it runs, and when
   the loader leaves (class v-loader-off) it hands off to the page fog.
   Pages that need to hold it open: vLoader.hold() early, vLoader.release()
   (or vLoader.hide()) when the async work settles. */
(function () {
  'use strict';
  try {
    var root = document.documentElement;
    if (root.classList.contains('sg-catgo')) { window.vLoader = { hide: function () {}, hold: function () {}, release: function () {} }; return; }
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var zh = false, dark = true;
    try { zh = (localStorage.getItem('sm_lang') || '').toLowerCase() === 'zh'; dark = localStorage.getItem('dark') !== 'false'; } catch (e) {}
    var MIN = reduce ? 0 : 2200, FAILSAFE = 9000, SKIP_AFTER = 600;

    /* ─── styles ──────────────────────────────────────────────────────── */
    var css =
      '#v-loader{--lb:#E4E9F0;--lb2:#D5DEEA;--lt:#0E1E33;--lt2:rgba(14,30,51,.55);--lacc:#C23A43;--lblue:#1E4F8F;--lhi:rgba(255,255,255,.9);--llo:rgba(90,110,140,.34);--ltrack:rgba(30,79,143,.12);' +
        'position:fixed;inset:0;z-index:2147483100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.1rem;overflow:hidden;' +
        'background:radial-gradient(120% 90% at 50% 40%,var(--lb) 0%,var(--lb2) 100%);color:var(--lt);font-family:var(--font-heading,Georgia),serif;' +
        'transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}' +
      '#v-loader.v-dark{--lb:#10203A;--lb2:#08111F;--lt:#EEF3F9;--lt2:rgba(238,243,249,.55);--lacc:#E0626A;--lblue:#8DB6E2;--lhi:rgba(120,160,215,.16);--llo:rgba(0,0,0,.55);--ltrack:rgba(141,182,226,.14)}' +
      '#v-loader.v-loader-off{opacity:0!important;transform:scale(1.04);pointer-events:none}' +
      '#v-loader::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:multiply;' +
        'background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%272%27/%3E%3CfeColorMatrix values=%270 0 0 0 .45 0 0 0 0 .5 0 0 0 0 .6 0 0 0 .5 0%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")}' +
      '#v-loader.v-dark::after{mix-blend-mode:screen;opacity:.18}' +
      /* the heartbeat line running behind everything */
      '#v-loader .vl-ecg{position:absolute;left:0;right:0;top:50%;height:120px;margin-top:-96px;pointer-events:none;opacity:.55}' +
      '#v-loader .vl-ecg svg{width:100%;height:100%;display:block;overflow:visible}' +
      '#v-loader .vl-ecg path{fill:none;stroke:var(--lacc);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:420 1600;animation:vl-ecg 2.4s linear infinite;filter:drop-shadow(0 0 5px color-mix(in srgb,var(--lacc) 55%,transparent))}' +
      '@keyframes vl-ecg{from{stroke-dashoffset:420}to{stroke-dashoffset:-1600}}' +
      /* the disc: raised glass, progress ring, the mark beating, icons in orbit */
      '#v-loader .vl-stage{position:relative;width:188px;height:188px;margin-bottom:.6rem;animation:vl-rise .8s cubic-bezier(.16,1,.3,1) both}' +
      '#v-loader .vl-disc{position:absolute;inset:34px;border-radius:50%;background:var(--lb);box-shadow:-9px -9px 20px var(--lhi),10px 12px 24px var(--llo),inset 0 1px 0 rgba(255,255,255,.5)}' +
      '#v-loader .vl-ring{position:absolute;inset:22px;transform:rotate(-90deg)}' +
      '#v-loader .vl-ring circle{fill:none;stroke-width:5;stroke-linecap:round}' +
      '#v-loader .vl-ring .t{stroke:var(--ltrack)}' +
      '#v-loader .vl-ring .p{stroke:url(#vlg);stroke-dasharray:452.4;stroke-dashoffset:452.4;filter:drop-shadow(0 0 4px color-mix(in srgb,var(--lacc) 45%,transparent))}' +
      '#v-loader .vl-tile{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:18px;background:#0F2238;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(8,20,40,.35),inset 0 1px 0 rgba(255,255,255,.25);animation:vl-beat 1.2s ease-in-out infinite}' +
      '#v-loader.v-dark .vl-tile{background:#fff}' +
      '#v-loader .vl-tile img{width:44px;height:44px;border-radius:11px;display:block}' +
      '@keyframes vl-beat{0%,40%,100%{transform:scale(1)}12%{transform:scale(1.09)}24%{transform:scale(.97)}32%{transform:scale(1.05)}}' +
      '#v-loader .vl-orbit{position:absolute;inset:0;animation:vl-spin 9s linear infinite}' +
      '#v-loader .vl-orbit i{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--lb);' +
        'box-shadow:-3px -3px 7px var(--lhi),3px 4px 8px var(--llo);transform:rotate(calc(var(--a) * 1deg)) translate(104px) rotate(calc(var(--a) * -1deg));opacity:0;animation:vl-pop .6s cubic-bezier(.34,1.56,.64,1) both;animation-delay:calc(var(--k) * .12s + .35s)}' +
      '#v-loader .vl-orbit i svg{width:24px;height:24px;display:block;animation:vl-spin 9s linear infinite reverse}' +
      '@keyframes vl-spin{to{rotate:360deg}}' +
      '@keyframes vl-pop{from{opacity:0;scale:.3}to{opacity:1;scale:1}}' +
      '@keyframes vl-rise{from{opacity:0;transform:translateY(14px) scale(.94);filter:blur(6px)}}' +
      /* words */
      '#v-loader > :not(.sg-icons){z-index:1}#v-loader .vl-name,#v-loader .vl-page,#v-loader .vl-row{position:relative}' +
      '#v-loader .vl-name{font-size:2rem;font-weight:700;letter-spacing:-.01em;animation:vl-rise .8s .08s cubic-bezier(.16,1,.3,1) both}' +
      '#v-loader .vl-name span{color:var(--lacc)}' +
      '#v-loader .vl-page{max-width:min(86vw,520px);text-align:center;font-size:.86rem;letter-spacing:.14em;text-transform:uppercase;color:var(--lt2);font-family:inherit;animation:vl-rise .8s .16s cubic-bezier(.16,1,.3,1) both;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#v-loader .vl-row{display:flex;align-items:center;gap:.7rem;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--lt2);animation:vl-rise .8s .24s cubic-bezier(.16,1,.3,1) both}' +
      '#v-loader .vl-pct{font-variant-numeric:tabular-nums;font-weight:700;color:var(--lblue);min-width:3.2em;text-align:right}' +
      '#v-loader .vl-stg{display:inline-block;min-width:11em}' +
      '#v-loader .vl-stg.flip{animation:vl-flip .45s cubic-bezier(.16,1,.3,1)}' +
      '@keyframes vl-flip{from{opacity:0;transform:translateY(8px);filter:blur(4px)}}' +
      '#v-loader .vl-fact{position:absolute;left:0;right:0;margin:0 auto;bottom:max(7vh,44px);width:min(88vw,560px);text-align:center;font-size:1rem;font-variant:normal;text-transform:none;font-family:var(--font-body,Georgia),serif;line-height:1.5;color:var(--lt);animation:vl-rise .9s .7s cubic-bezier(.16,1,.3,1) both;font-style:italic}' +
      '#v-loader .vl-fact b{display:block;font-style:normal;font-size:.66rem;letter-spacing:.26em;text-transform:uppercase;color:var(--lacc);margin-bottom:.3rem}' +
      '#v-loader .vl-skip{position:absolute;top:18px;left:0;right:0;text-align:center;font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--lt2);opacity:0;transition:opacity .5s}' +
      '#v-loader.vl-can-skip .vl-skip{opacity:.8}' +
      '@media (max-width:600px){#v-loader .vl-fact{font-size:.84rem}#v-loader .vl-stage{transform:scale(.9)}}' +
      '@media (prefers-reduced-motion:reduce){#v-loader *,#v-loader *::before{animation:none!important}#v-loader .vl-orbit i,#v-loader .vl-fact{opacity:1}}';
    var sty = document.createElement('style');
    sty.textContent = css;
    (document.head || root).appendChild(sty);

    /* ─── markup ──────────────────────────────────────────────────────── */
    var ICONS = [
      /* heart */ '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1 8.2 3.3 5 6.6 5c2 0 3.4 1.2 4.1 2.3h2.6C14 6.2 15.4 5 17.4 5 20.7 5 23 8.2 21.5 11.7 19.5 16.4 12 21 12 21z" fill="#D4555C"/><path d="M5 12h3.2l1.3-2.4 2 4.6 1.5-3.2h6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      /* bone */ '<svg viewBox="0 0 24 24"><path d="M7.8 5.3a2.4 2.4 0 1 0-3.3 3.3 2.4 2.4 0 1 0 3.1 3.1l4.9 4.9a2.4 2.4 0 1 0 3.1 3.1 2.4 2.4 0 1 0 3.3-3.3 2.4 2.4 0 1 0-3.1-3.1l-4.9-4.9a2.4 2.4 0 1 0-3.1-3.1z" fill="#C9D6E6" stroke="#5E7FA8" stroke-width="1.1"/></svg>',
      /* dumbbell */ '<svg viewBox="0 0 24 24"><rect x="2" y="8" width="3.4" height="8" rx="1" fill="#3A78C2"/><rect x="5.4" y="6.5" width="3" height="11" rx="1" fill="#1E4F8F"/><rect x="8.4" y="11" width="7.2" height="2" fill="#8593A5"/><rect x="15.6" y="6.5" width="3" height="11" rx="1" fill="#1E4F8F"/><rect x="18.6" y="8" width="3.4" height="8" rx="1" fill="#3A78C2"/></svg>',
      /* apple */ '<svg viewBox="0 0 24 24"><path d="M12 7.5c-1.6-1.4-5.8-1.6-7 2.2-1.2 3.9 1.5 10.8 4.6 10.8 1.2 0 1.5-.6 2.4-.6s1.2.6 2.4.6c3.1 0 5.8-6.9 4.6-10.8-1.2-3.8-5.4-3.6-7-2.2z" fill="#D4555C"/><path d="M12 7.6c0-2 .8-3.5 2.6-4.3" fill="none" stroke="#5E7F3A" stroke-width="1.5" stroke-linecap="round"/></svg>'
    ];
    var FACTS = [
      ['Tendons store elastic energy like springs: up to half the work of each running stride.', '肌腱像弹簧一样储存弹性能：跑步每一步多达一半的功由它提供。'],
      ['You get stronger while you rest: training is the stress, recovery is the adaptation.', '变强发生在休息时：训练是压力，恢复才是适应。'],
      ['A resting heart pumps about 5 litres a minute; at full effort an athlete can move over 30.', '静息时心脏每分钟泵血约 5 升；全力运动时可超过 30 升。'],
      ['Growth hormone peaks in deep sleep, when most muscle repair happens.', '生长激素在深睡眠时达到峰值，大部分肌肉修复在此时发生。'],
      ['Bone is living tissue: it remodels along the lines of the load you put through it.', '骨骼是活组织：它会沿着你施加的负荷方向重塑。'],
      ['Losing just 2% of body weight in sweat measurably slows endurance performance.', '出汗仅损失 2% 体重，耐力表现就会明显下降。'],
      ['Balance training after an ankle sprain cuts the risk of spraining it again.', '踝关节扭伤后做平衡训练，可降低再次扭伤的风险。'],
      ['Cartilage has no blood supply, which is why it heals so slowly.', '软骨没有血液供应，所以愈合得很慢。']
    ];
    var STAGES = zh ? ['热身中', '载入页面', '准备练习', '检查生命体征', '准备就绪'] : ['Warming up', 'Loading the page', 'Preparing practice', 'Checking vitals', 'Ready'];
    var title = (document.title || '').split(/\s[|·—–-]\s/)[0].trim();

    var el = document.createElement('div');
    el.id = 'v-loader';
    el.className = dark ? 'v-dark' : '';
    el.setAttribute('aria-hidden', 'true');
    var beat = function (x) { return 'L' + (x - 30) + ' 60 L' + (x - 18) + ' 52 L' + (x - 8) + ' 64 L' + x + ' 12 L' + (x + 10) + ' 106 L' + (x + 20) + ' 50 L' + (x + 30) + ' 60 L' + (x + 44) + ' 56 L' + (x + 58) + ' 60'; };
    var ecg = 'M0 60 ' + beat(200) + ' ' + beat(520) + ' ' + beat(840) + ' ' + beat(1120) + ' L1400 60';
    var orbit = ICONS.map(function (s, i) { return '<i style="--a:' + (i * 90 - 45) + ';--k:' + i + '">' + s + '</i>'; }).join('');
    var f = FACTS[Math.floor(Math.random() * FACTS.length)];
    el.innerHTML =
      '<div class="vl-ecg"><svg viewBox="0 0 1400 120" preserveAspectRatio="none"><path d="' + ecg + '"/></svg></div>' +
      '<div class="vl-stage"><div class="vl-disc"></div>' +
        '<svg class="vl-ring" viewBox="0 0 144 144"><defs><linearGradient id="vlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D4555C"/><stop offset="1" stop-color="#3A78C2"/></linearGradient></defs>' +
        '<circle class="t" cx="72" cy="72" r="66"/><circle class="p" cx="72" cy="72" r="66"/></svg>' +
        '<div class="vl-tile"><img src="icons/vitalite-180.png" alt="" width="44" height="44"></div>' +
        '<div class="vl-orbit">' + orbit + '</div></div>' +
      '<div class="vl-name">Vital<span>ité</span></div>' +
      (title ? '<div class="vl-page">' + (zh ? '正在打开 · ' : 'Opening · ') + title.replace(/[<>&]/g, '') + '</div>' : '') +
      '<div class="vl-row"><span class="vl-pct">0%</span><span class="vl-stg">' + STAGES[0] + '</span></div>' +
      '<div class="vl-fact"><b>' + (zh ? '你知道吗？' : 'Did you know?') + '</b>' + (zh ? f[1] : f[0]) + '</div>' +
      '<div class="vl-skip">' + (zh ? '点击任意处跳过' : 'Tap anywhere to skip') + '</div>';
    var ring = el.querySelector('.vl-ring .p'), pct = el.querySelector('.vl-pct'), stg = el.querySelector('.vl-stg');
    var C = 2 * Math.PI * 66;
    ring.style.strokeDasharray = C.toFixed(1);
    ring.style.strokeDashoffset = C.toFixed(1);

    /* ─── lifecycle ───────────────────────────────────────────────────── */
    var shown = false, hidden = false, held = false, t0 = 0, raf = 0, shownP = 0, stage = 0, failT = 0;
    function ready() {                               /* how far the page really is, 0..1 */
      var rs = document.readyState;
      return rs === 'complete' ? 1 : rs === 'interactive' ? 0.72 : 0.35;
    }
    function frame(now) {
      raf = 0;
      if (hidden) return;
      var el_ = now - t0;
      /* the ring never runs ahead of the page, and never finishes before MIN */
      var target = Math.min(ready(), MIN ? 0.15 + 0.85 * Math.min(1, el_ / MIN) : 1);
      if (held) target = Math.min(target, 0.9);
      shownP += (target - shownP) * 0.08;
      if (target >= 1 && shownP > 0.995) shownP = 1;
      ring.style.strokeDashoffset = (C * (1 - shownP)).toFixed(1);
      pct.textContent = Math.round(shownP * 100) + '%';
      var s = Math.min(STAGES.length - 1, Math.floor(shownP * (STAGES.length - 1) + 0.02));
      if (s !== stage) { stage = s; stg.textContent = STAGES[s]; stg.classList.remove('flip'); void stg.offsetWidth; stg.classList.add('flip'); }
      if (el_ > SKIP_AFTER) el.classList.add('vl-can-skip');
      if (shownP === 1 && !held) { setTimeout(hide, 260); return; }
      raf = requestAnimationFrame(frame);
    }
    function skip(e) {
      if (!shown || hidden || performance.now() - t0 < SKIP_AFTER) return;
      if (e && e.type === 'keydown' && (e.metaKey || e.ctrlKey || e.altKey)) return;
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
    }
    function hide() {
      if (hidden) return;
      hidden = true;
      clearTimeout(failT); if (raf) cancelAnimationFrame(raf);
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
      active: function () { return shown && !hidden; },
      /* hold() keeps it up (the ring stops at 90%) until release()/hide() */
      hold: function () { if (hidden) return; held = true; show(); },
      release: function () { held = false; if (shown && !hidden && !raf) raf = requestAnimationFrame(frame); }
    };
  } catch (e) { /* fail soft — a loader must never break the page */ }
})();

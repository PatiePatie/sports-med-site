/* ══════════════════════════════════════════════════════════════════════════════
   soft-fx.js — motion + texture for the "Soft Glass" layer (soft-glass.css)
   ------------------------------------------------------------------------------
     1 · grain      one fixed riso sheet (dark + light specks) over the page
     2 · theme sync html.os-dk follows body.dark so the root never flashes
     3 · sheen      a glassy highlight on cards that follows the pointer
     4 · fog        cards and sections come in out of a blur as they scroll in
     5 · poster     the loading screens (#v-splash, #v-loader) become the
                    Optimal Shapes poster: sprayed colour blocks, ribbon shapes,
                    the mark on a glass lozenge

   Fails soft everywhere; nothing here owns content.
   Remove with: python3 tools/shapes_switch.py off
   ══════════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var root = document.documentElement;
  if (root.classList.contains('sg-js')) return;
  var body = document.body;
  if (!body) return;

  var REDUCE = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var FINE = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn('[soft-fx]', e); } }
  function $$(sel, ctx) { try { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); } catch (e) { return []; } }

  /* ─── 1 · Grain ──────────────────────────────────────────────────────── */
  function mountGrain() {
    if (document.querySelector('.sg-grain')) return;
    var g = document.createElement('div');
    g.className = 'sg-grain';
    g.setAttribute('aria-hidden', 'true');
    body.appendChild(g);
    root.classList.add('sg-js');
  }

  /* ─── 2 · Theme sync ─────────────────────────────────────────────────── */
  function themeSync() {
    function sync() { root.classList.toggle('os-dk', body.classList.contains('dark')); }
    sync();
    new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ─── 3 · Sheen ──────────────────────────────────────────────────────── */
  var SHEEN = '.feature-card,.fork-card,.ch-card,.stat-card,.qo-card,.res-card,.dash-card,.for-topic,' +
              '.checkup-panel,.chat-window,.plan-card,.quiz-card,.acc-item';
  function sheen() {
    if (!FINE) return;
    var raf = 0, last = null, lx = 0, ly = 0;
    document.addEventListener('pointermove', function (e) {
      var t = e.target && e.target.closest ? e.target.closest(SHEEN) : null;
      if (!t) return;
      if (!t.classList.contains('sg-sheen')) t.classList.add('sg-sheen');
      last = t; lx = e.clientX; ly = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        if (!last) return;
        var r = last.getBoundingClientRect();
        last.style.setProperty('--sg-mx', (lx - r.left) + 'px');
        last.style.setProperty('--sg-my', (ly - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ─── 4 · Fog-in reveals ─────────────────────────────────────────────── */
  var FOG = '.feature-card,.fork-card,.ch-card,.stat-card,.qo-card,.res-card,.dash-card,.chat-window,' +
            '.checkup-panel,.plan-card,.quiz-card,.callout,.rec-box,.acc-item,.forum-head,.forum-cats,' +
            '.section-head,.landing section h2,.landing .section-label,.lin-viewheader,.guide-hero,.ch-hero';
  function fog() {
    if (REDUCE || !('IntersectionObserver' in window)) return;
    var skip = '.sidebar,header,.lin-topbar,.forum-overlay,#v-splash,#v-loader,.os-mosaic,.hero,.landing-hero,.tut-card,.qna-panel';
    var els = $$(FOG).filter(function (el) {
      if (el.closest(skip)) return false;
      if (el.parentElement && el.parentElement.closest('.sg-fog')) return false;   /* no nested fogs */
      return true;
    });
    if (!els.length) return;
    function done(el) {
      el.classList.remove('sg-fog', 'sg-in');
      el.style.removeProperty('--sg-d');
    }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.style.setProperty('--sg-d', Math.min(k++ * 70, 420) + 'ms');
        el.classList.add('sg-in');
        var fin = function () { done(el); };
        el.addEventListener('animationend', function h(ev) {
          if (ev.target !== el || ev.animationName !== 'sg-fog-reveal') return;
          el.removeEventListener('animationend', h); fin();
        });
        setTimeout(fin, 1800);   /* belt and braces: never strand a blurred card */
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(function (el) { el.classList.add('sg-fog'); io.observe(el); });
  }

  /* ─── 5 · Poster loading screens ─────────────────────────────────────── */
  var BLOCKS_DARK = [
    ['#1E4F8F', 'mobius',    'rgba(4,10,22,.6)',  'rgba(141,182,226,.55)'],
    ['#B3323A', 'column',    'rgba(40,4,10,.55)', 'rgba(255,190,190,.45)'],
    ['#8DB6E2', 'v',         'rgba(18,41,74,.5)', 'rgba(255,255,255,.6)'],
    ['#12294A', 'infinity',  'rgba(2,6,14,.6)',   'rgba(141,182,226,.35)'],
    ['#DCE8F4', 'pentagram', 'rgba(30,79,143,.4)','rgba(255,255,255,.7)']
  ];
  var BLOCKS_LIGHT = [
    ['#3A78C2', 'mobius',    'rgba(10,26,52,.5)', 'rgba(220,232,244,.6)'],
    ['#C7434B', 'column',    'rgba(60,6,14,.45)', 'rgba(255,210,210,.55)'],
    ['#DCE8F4', 'v',         'rgba(30,79,143,.4)','rgba(255,255,255,.75)'],
    ['#1E4F8F', 'infinity',  'rgba(4,12,28,.55)', 'rgba(170,200,240,.45)'],
    ['#8DB6E2', 'pentagram', 'rgba(18,41,74,.45)','rgba(255,255,255,.65)']
  ];
  function dress(host) {
    if (!host || host.classList.contains('sg-dressed')) return;
    var S = window.VitaliteShapes && window.VitaliteShapes.splash;
    var dark = body.classList.contains('dark');
    var zh = false;
    try { zh = (localStorage.getItem('sm_lang') || '') === 'zh'; } catch (e) {}
    var poster = document.createElement('div');
    poster.className = 'sg-poster';
    poster.setAttribute('aria-hidden', 'true');
    (dark ? BLOCKS_DARK : BLOCKS_LIGHT).forEach(function (b, i) {
      var blk = document.createElement('div');
      blk.className = 'sg-blk sg-spray';
      blk.style.background = b[0];
      blk.style.setProperty('--sg-spray-dk', b[2]);
      blk.style.setProperty('--sg-spray-lt', b[3]);
      if (S && S[b[1]]) {
        var sh = document.createElement('div');
        sh.className = 'sg-shape';
        sh.style.setProperty('--i', i);
        sh.innerHTML = S[b[1]]();
        blk.appendChild(sh);
      }
      poster.appendChild(blk);
    });
    var mark = document.createElement('div');
    mark.className = 'sg-mark';
    mark.innerHTML = '<img src="icons/vitalite-180.png" alt="" width="64" height="64">' +
      '<div class="sg-name">Vital<span>ité</span></div>' +
      '<div class="sg-tag">' + (zh ? '运动医学 · 康复 · 营养' : 'Sports medicine · Recovery · Nutrition') + '</div>' +
      '<div class="sg-track"><i></i></div>';
    host.insertBefore(poster, host.firstChild);
    host.appendChild(mark);
    host.classList.add('sg-dressed');
  }
  function posters() {
    dress(document.getElementById('v-splash'));
    dress(document.getElementById('v-loader'));
    /* loader.js appends #v-loader to <body> only when a page is slow */
    var mo = new MutationObserver(function (recs) {
      recs.forEach(function (r) {
        Array.prototype.forEach.call(r.addedNodes, function (n) {
          if (n.id === 'v-loader' || n.id === 'v-splash') safe(function () { dress(n); });
        });
      });
    });
    mo.observe(body, { childList: true });
    setTimeout(function () { mo.disconnect(); }, 12000);
  }

  /* ─── 6 · Mosaic tiles get the sprayed shading ───────────────────────── */
  function sprayMosaic() {
    $$('.os-mosaic > *').forEach(function (t) {
      t.classList.add('sg-spray');
      t.style.setProperty('--sg-spray-dk', 'rgba(4,10,22,.45)');
      t.style.setProperty('--sg-spray-lt', 'rgba(255,255,255,.35)');
    });
  }

  /* ─── Boot ───────────────────────────────────────────────────────────── */
  function boot() {
    safe(mountGrain);
    safe(themeSync);
    safe(posters);
    safe(sheen);
    safe(fog);
    safe(sprayMosaic);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

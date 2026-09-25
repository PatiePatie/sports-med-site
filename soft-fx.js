/* ══════════════════════════════════════════════════════════════════════════════
   soft-fx.js — motion + texture for the "Soft Glass" layer (soft-glass.css)
   ------------------------------------------------------------------------------
     1 · grain      one fixed riso sheet (dark + light specks) over the page
     2 · theme sync html.os-dk follows body.dark so the root never flashes
     3 · sheen      a glassy highlight on cards that follows the pointer
     4 · fog        cards and sections come in out of a blur as they scroll in
     5 · splash     the loading screens keep the hospital and get the
                    airbrushed Vitalité icons floating around the mark

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
    /* the head-first script painted the root inline; hand it to the stylesheet */
    root.style.removeProperty('background-color');
    root.style.removeProperty('color-scheme');
    function sync() {
      var dk = body.classList.contains('dark');
      root.classList.toggle('os-dk', dk);
      var m = document.querySelector('meta[name="color-scheme"]');
      if (m) m.setAttribute('content', dk ? 'dark' : 'light');
    }
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

  /* ─── 3b · Fabric: a dimple pressed into the page under the pointer ─── */
  function fabric() {
    if (!FINE || REDUCE) return;
    var f = document.createElement('div');
    f.className = 'sg-fabric';
    f.setAttribute('aria-hidden', 'true');
    body.appendChild(f);
    var tx = -500, ty = -500, x = -500, y = -500, vx = 0, vy = 0, depth = 0.13, want = 0.13, raf = 0, idle = 0;
    var HOT = 'a,button,[role=button],input,textarea,select,label,.sidebar-link,.for-topic,.ch-card,.fork-card,.feature-card';
    function tick() {
      /* spring toward the pointer: cloth lags a beat behind the finger */
      var ax = (tx - x) * 0.2, ay = (ty - y) * 0.2;
      vx = vx * 0.62 + ax; vy = vy * 0.62 + ay;
      x += vx; y += vy;
      depth += (want - depth) * 0.18;
      var sp = Math.min(Math.sqrt(vx * vx + vy * vy), 40);
      var ang = Math.atan2(vy, vx) * 57.2958;
      var st = 1 + sp / 55;                     /* stretch along the drag */
      f.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + ang.toFixed(1) +
                          'deg) scale(' + st.toFixed(3) + ',' + (1 / Math.sqrt(st)).toFixed(3) + ')';
      f.style.setProperty('--sg-dent', depth.toFixed(3));
      if (Math.abs(tx - x) + Math.abs(ty - y) + sp < 0.3 && Math.abs(want - depth) < 0.002) { raf = 0; return; }
      raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (x < -400) { x = e.clientX; y = e.clientY; }
      tx = e.clientX; ty = e.clientY;
      var hot = e.target && e.target.closest ? e.target.closest(HOT) : null;
      want = (e.buttons ? 0.24 : hot ? 0.18 : 0.13);
      f.classList.add('on');
      clearTimeout(idle);
      idle = setTimeout(function () { f.classList.remove('on'); }, 2600);   /* cloth relaxes when you stop */
      kick();
    }, { passive: true });
    document.addEventListener('pointerdown', function () { want = 0.26; kick(); }, { passive: true });
    document.addEventListener('pointerup', function () { want = 0.15; kick(); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { f.classList.remove('on'); });
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

  /* ─── 5 · Loading screens: relevant icons around the hospital ────────── */
  /* [icon, left%, top%, width px, delay s] — kept to the sky above the skyline */
  var SPOTS = [
    ['heart',    14, 16, 118, 0.10],
    ['bone',     76, 14, 112, 0.22],
    ['dumbbell', 84, 42,  96, 0.34],
    ['apple',     7, 44,  86, 0.46],
    ['clinic',   27, 58,  74, 0.58],
    ['pulse',    71, 64, 150, 0.70]
  ];
  function dress(host) {
    if (!host || host.classList.contains('sg-dressed')) return;
    var I = window.VitaliteShapes && window.VitaliteShapes.icons;
    if (!I) return;
    var wrap = document.createElement('div');
    wrap.className = 'sg-icons';
    wrap.setAttribute('aria-hidden', 'true');
    SPOTS.forEach(function (s) {
      if (!I[s[0]]) return;
      var d = document.createElement('div');
      d.className = 'sg-ico';
      d.style.left = s[1] + '%';
      d.style.top = s[2] + '%';
      d.style.setProperty('--w', s[3] + 'px');
      d.style.setProperty('--d', s[4] + 's');
      d.innerHTML = I[s[0]]();
      wrap.appendChild(d);
    });
    host.insertBefore(wrap, host.firstChild);
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

  /* ─── 7 · Sidebar wheel ─────────────────────────────────────────────── */
  /* Every category open at once, a fixed gap between categories, each
     category marked by an airbrushed ribbon emblem. Inside the semicircle the
     list is a scroll wheel: each row is a ribbon as wide as the circle is at
     that height, and rows tilt away + fade as they leave the centre line. */
  var EMBLEM = { 'vitalite-knowledge': 'mobius', 'vitalite-infirmary': 'v', 'vitalite-social': 'infinity', 'vitalite-dev': 'column' };
  function wheel() {
    var sb = document.querySelector('.sidebar');
    if (!sb) return;
    var S = window.VitaliteShapes && window.VitaliteShapes.splash;
    $$('.sidebar-group.part', sb).forEach(function (g) {
      var t = g.querySelector('.part-toggle'), k = EMBLEM[g.getAttribute('data-part')];
      g.classList.add('sg-cat-' + (g.getAttribute('data-part') || '').replace('vitalite-', ''));
      if (t && S && k && S[k] && !t.querySelector('.sg-emb')) {
        var e = document.createElement('span');
        e.className = 'sg-emb';
        e.setAttribute('aria-hidden', 'true');
        e.innerHTML = S[k]();
        t.insertBefore(e, t.firstChild);
      }
    });
    /* study-tool rows open the tool in place on guide.html, deep-link elsewhere */
    sb.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-study]') : null;
      if (!a) return;
      var fn = window[a.getAttribute('data-study')];
      if (typeof fn === 'function') { e.preventDefault(); try { fn(); } catch (x) {} }
    });
    root.classList.add('sg-wheel');

    var rows = [], raf = 0;
    function collect() {
      rows = $$('.sidebar-logo, .part-toggle, .sidebar-link, .sidebar-label', sb).filter(function (r) { return r.offsetParent; });
    }
    function topIn(el) {           /* layout top inside the sidebar, ignoring transforms */
      var y = 0;
      while (el && el !== sb) { y += el.offsetTop; el = el.offsetParent; }
      return y;
    }
    function shape() {
      raf = 0;
      if (!root.classList.contains('os-semi')) return;
      var R = sb.clientHeight / 2, st = sb.scrollTop;
      var RV = R * 0.84;           /* the glass feathers out at ~0.86R: fit the ribbons to what you see */
      rows.forEach(function (row) {
        var h = row.offsetHeight;
        var dy = topIn(row) - st + h / 2 - R;
        var ad = Math.min(Math.abs(dy), RV * 0.999), k = ad / RV;
        var w = Math.sqrt(RV * RV - ad * ad);
        row.style.setProperty('--sg-w', Math.max(56, w - 6).toFixed(0) + 'px');
        row.style.setProperty('--sg-s', (1 - 0.12 * k * k).toFixed(3));
        row.style.setProperty('--sg-rx', (-(Math.max(-RV, Math.min(RV, dy)) / RV) * 34).toFixed(1) + 'deg');
        row.style.setProperty('--sg-o', (k < 0.7 ? 1 : Math.max(0, 1 - (k - 0.7) / 0.27)).toFixed(3));
      });
    }
    function kick() { if (!raf) raf = requestAnimationFrame(shape); }
    function centre() {            /* open on the page you're on */
      var a = sb.querySelector('.sidebar-link.active, .sidebar-link.on');
      if (a) sb.scrollTop = topIn(a) + a.offsetHeight / 2 - sb.clientHeight / 2;
    }
    collect(); centre(); shape();
    sb.addEventListener('scroll', kick, { passive: true });
    sb.addEventListener('mouseenter', function () { collect(); kick(); });
    window.addEventListener('resize', function () { collect(); kick(); });
    new MutationObserver(function () { collect(); kick(); }).observe(sb, { childList: true, subtree: true });
  }

  /* guide.html?study=flashcards|quiz|ai opens that tool once the page is up */
  function studyDeepLink() {
    var m = /[?&]study=(flashcards|quiz|ai)\b/.exec(location.search);
    if (!m) return;
    var fn = { flashcards: 'openFlashcards', quiz: 'openQuizMode', ai: 'openAiModal' }[m[1]];
    var go = function () { if (typeof window[fn] === 'function') { try { window[fn](); } catch (e) {} } };
    if (document.readyState === 'complete') setTimeout(go, 300);
    else window.addEventListener('load', function () { setTimeout(go, 300); });
  }

  /* ─── Boot ───────────────────────────────────────────────────────────── */
  function boot() {
    safe(mountGrain);
    safe(themeSync);
    safe(posters);
    safe(sheen);
    safe(fabric);
    safe(wheel);
    safe(studyDeepLink);
    safe(fog);
    safe(sprayMosaic);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* ══════════════════════════════════════════════════════════════════════════════
   soft-fx.js — motion + texture for the "Soft Glass" layer (soft-glass.css)
   ------------------------------------------------------------------------------
     1 · grain      one fixed riso sheet (dark + light specks) over the page
     2 · theme sync html.os-dk follows body.dark so the root never flashes
     3 · sheen      a glassy highlight on cards that follows the pointer
     4 · fog        cards and sections come in out of a blur as they scroll in
     5 · splash     the loading screens keep the hospital and get the
                    airbrushed Vitalité icons floating around the mark
     8 · arrival    the whole page comes up out of a fog
     9 · swaps      dark/light spreads from the toggle; 中/EN fogs through
    10 · categories switching category washes through its colour + emblem

   Fails soft everywhere; nothing here owns content.
   Remove with: python3 tools/shapes_switch.py off
   ══════════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var root = document.documentElement;
  if (root.classList.contains('sg-js')) return;
  var body = document.body;
  if (!body) return;

  /* read before anything clears them: is the whole page arriving through a fog? */
  var ARRIVE = root.classList.contains('sg-lf') || root.classList.contains('sg-catgo');
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
    if (!FINE || FAB) return;
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

  /* ─── 3b · Fabric: the page is cloth, the pointer presses into it ───── */
  /* One dimple, built from still layers (a shaded bowl, a shadowed wall
     toward the light, a lit wall away from it, and folds pulled toward the
     finger). Per frame only transform + opacity change, so it never repaints.
     The dimple follows with a critically damped ease (no overshoot, no
     wobble), stretches along the drag with a smooth matrix (no angle snap),
     and sinks deeper over controls and while pressed.
     Press and drag: holding sinks the dimple further the longer you hold;
     dragging while pressed makes the cloth heavier (it lags the finger),
     stretches it harder, bunches a ridge up ahead of the finger and pulls
     taut creases out behind it. Letting go springs the cloth back up. */
  var FAB = false;
  function fabric() {
    if (!FINE || REDUCE) return;
    FAB = true;
    root.classList.add('sg-fab');
    var f = document.createElement('div');
    f.className = 'sg-fabric';
    f.setAttribute('aria-hidden', 'true');
    f.innerHTML = '<i class="sg-f-bowl"></i><i class="sg-f-shade"></i><i class="sg-f-lit"></i><i class="sg-f-fold"></i>' +
      '<b class="sg-f-drag"><i class="sg-f-wake"></i><i class="sg-f-bunch"></i></b>';
    body.appendChild(f);
    var dragEl = f.querySelector('.sg-f-drag');
    var tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, dent = 0.5, want = 0.5;
    var down = false, downAt = 0, press = 0, drag = 0, ax = 1, ay = 0, hot = false;
    var raf = 0, idle = 0, last = 0, seen = false, bounce = 0;
    var HOT = 'a,button,[role=button],input,textarea,select,label,summary,.sidebar-link,.for-topic,.ch-card,.fork-card,.feature-card';
    function ease(dt, tau) { return 1 - Math.exp(-dt / tau); }
    function rest() { return hot ? 0.74 : 0.5; }
    function tick(now) {
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (down) want = 1 + Math.min((now - downAt) / 700, 1) * 0.28;   /* holding sinks it further */
      press += ((down ? 1 : 0) - press) * ease(dt, down ? 70 : 140);
      var px = x, py = y, k = ease(dt, 42 + press * 48);               /* pressed cloth is heavier */
      x += (tx - x) * k; y += (ty - y) * k;
      var kv = ease(dt, 60);                           /* smoothed velocity, px per 16ms */
      vx += ((x - px) / dt * 16 - vx) * kv;
      vy += ((y - py) / dt * 16 - vy) * kv;
      dent += (want - dent) * ease(dt, down ? 90 : 110);
      var sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > 0.6) {                                  /* heading, only while really moving: no snap at rest */
        var ka = ease(dt, 70);
        ax += (vx / sp - ax) * ka; ay += (vy / sp - ay) * ka;
      }
      drag += (press * Math.min(sp / 14, 1) - drag) * ease(dt, 90);
      var cap = 40 + press * 20, div = 70 - press * 28;
      var s = 1 + Math.min(sp, cap) / div, q = 1 / Math.sqrt(s), d = s - q;
      var ux = sp > 0.01 ? vx / sp : 1, uy = sp > 0.01 ? vy / sp : 0;
      var g = 1.06 - Math.min(dent, 1.28) * 0.12;      /* deeper press = tighter dimple */
      var m11 = (q + d * ux * ux) * g, m12 = d * ux * uy * g, m22 = (q + d * uy * uy) * g;
      var lag = 0.9 + press * 1.4;                     /* the cloth trails the finger */
      f.style.transform = 'translate3d(' + (x - vx * lag).toFixed(1) + 'px,' + (y - vy * lag).toFixed(1) + 'px,0) matrix(' +
        m11.toFixed(4) + ',' + m12.toFixed(4) + ',' + m12.toFixed(4) + ',' + m22.toFixed(4) + ',0,0)';
      f.style.setProperty('--sg-dent', dent.toFixed(3));
      f.style.setProperty('--sg-drag', drag.toFixed(3));
      var al = Math.sqrt(ax * ax + ay * ay) || 1;
      dragEl.style.transform = 'rotate(' + Math.atan2(ay / al, ax / al).toFixed(3) + 'rad)';
      if (!down && Math.abs(tx - x) + Math.abs(ty - y) < 0.15 && sp < 0.04 && Math.abs(want - dent) < 0.003 && press < 0.01 && drag < 0.005) { raf = 0; last = 0; return; }
      raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (!seen) { x = tx = e.clientX; y = ty = e.clientY; seen = true; }
      tx = e.clientX; ty = e.clientY;
      hot = !!(e.target && e.target.closest && e.target.closest(HOT));
      if (!e.buttons && down) down = false;            /* released outside the window */
      if (!down && !bounce) want = rest();
      if (!f.classList.contains('on')) f.classList.add('on');
      clearTimeout(idle);
      idle = setTimeout(function () { if (!down) f.classList.remove('on'); }, 2600);   /* cloth relaxes when you stop */
      kick();
    }, { passive: true });
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      down = true; downAt = performance.now(); clearTimeout(bounce); bounce = 0;
      f.classList.add('on'); kick();
    }, { passive: true });
    function up() {
      if (!down) return;
      down = false;
      want = 0.26;                                     /* the cloth springs back up past rest… */
      clearTimeout(bounce);
      bounce = setTimeout(function () { bounce = 0; want = rest(); kick(); }, 150);   /* …and settles */
      kick();
    }
    document.addEventListener('pointerup', up, { passive: true });
    document.addEventListener('pointercancel', up, { passive: true });
    window.addEventListener('blur', up);
    document.documentElement.addEventListener('pointerleave', function () { if (!down) f.classList.remove('on'); });
  }

  /* ─── 4 · Fog-in reveals ─────────────────────────────────────────────── */
  var FOG = '.feature-card,.fork-card,.ch-card,.stat-card,.qo-card,.res-card,.dash-card,.chat-window,' +
            '.checkup-panel,.plan-card,.quiz-card,.callout,.rec-box,.acc-item,.forum-head,.forum-cats,' +
            '.section-head,.landing section h2,.landing .section-label,.lin-viewheader,.guide-hero,.ch-hero';
  function fog() {
    if (REDUCE || !('IntersectionObserver' in window)) return;
    var skip = '.sidebar,header,.lin-topbar,.forum-overlay,#v-splash,#v-loader,.os-mosaic,.hero,.landing-hero,.tut-card,.qna-panel';
    var whole = ARRIVE || !!document.getElementById('v-splash');
    var H = window.innerHeight;
    var els = $$(FOG).filter(function (el) {
      if (el.closest(skip)) return false;
      if (whole && el.getBoundingClientRect().top < H) return false;   /* the whole page is already fogging in */
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
          if (n.id === 'v-loader' || n.id === 'v-splash') safe(function () { dress(n); handoff(n); });
        });
      });
    });
    mo.observe(body, { childList: true });
    setTimeout(function () { mo.disconnect(); }, 12000);
    handoff(document.getElementById('v-splash'));
    handoff(document.getElementById('v-loader'));
  }
  /* a loading screen starts sharp; when it leaves it blurs away while the
     page underneath comes up out of the fog */
  function handoff(n) {
    if (!n || n._sgHand) return;
    n._sgHand = true;
    root.classList.remove('sg-lf');          /* never blur the splash itself on the way in */
    var mo = new MutationObserver(function () {
      if (!/-off\b/.test(n.className)) return;
      mo.disconnect();
      pageFogIn(true);
    });
    mo.observe(n, { attributes: true, attributeFilter: ['class'] });
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
      var a = sb.querySelector('.sb-sub.on') || sb.querySelector('.sidebar-link.active, .sidebar-link.on');
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

  /* ─── 8 · Page arrival: the whole page comes up out of a fog ────────── */
  /* The head-first script puts html.sg-lf on before first paint (not on the
     splash page, and not after a category switch — those hand off here). The
     blur lives on <html>, the one element whose filter doesn't break fixed
     children, and is dropped the moment it settles so scrolling stays cheap. */
  var fogT = 0;
  function settle() {
    clearTimeout(fogT);
    root.classList.remove('sg-lf', 'sg-lf-hand');
  }
  function armSettle() {
    clearTimeout(fogT);
    fogT = setTimeout(settle, 3000);
  }
  function pageFogIn(hand) {
    if (REDUCE) return;
    root.classList.remove('sg-lf', 'sg-lf-hand');
    void root.offsetWidth;                      /* restart the animation */
    root.classList.add(hand ? 'sg-lf-hand' : 'sg-lf');
    armSettle();
  }
  function pageFog() {
    root.addEventListener('animationend', function (e) {
      if (e.target === root && /^sg-page-/.test(e.animationName)) settle();
    });
    if (root.classList.contains('sg-lf')) armSettle();
    window.addEventListener('pageshow', function (e) { if (e.persisted) settle(); });
  }

  /* ─── 9 · Theme + language swaps ─────────────────────────────────────── */
  /* Dark/light spreads out of the toggle as a soft-edged circle; 中/EN fogs
     the old words out and the new ones in. Every page wires its own toggle
     handler, so this steps in front of the click, then replays it inside a
     view transition (or behind a fog overlay where there are none). */
  function swapFx() {
    if (REDUCE) return;
    var busy = false, passing = false;
    document.addEventListener('click', function (e) {
      if (passing) return;
      var b = e.target && e.target.closest ? e.target.closest('#darkToggle,#langToggle') : null;
      if (!b) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      if (busy) return;
      busy = true;
      var theme = b.id === 'darkToggle';
      var r = b.getBoundingClientRect();
      var cx = r.width ? r.left + r.width / 2 : innerWidth - 40, cy = r.height ? r.top + r.height / 2 : 30;
      var far = Math.sqrt(Math.pow(Math.max(cx, innerWidth - cx), 2) + Math.pow(Math.max(cy, innerHeight - cy), 2));
      root.style.setProperty('--sg-tx', cx.toFixed(0) + 'px');
      root.style.setProperty('--sg-ty', cy.toFixed(0) + 'px');
      root.style.setProperty('--sg-tr', (far + 120).toFixed(0) + 'px');
      function run() { passing = true; try { b.click(); } finally { passing = false; } }
      var cls = theme ? 'sg-vt-theme' : 'sg-vt-lang';
      function done() { root.classList.remove(cls); busy = false; }
      if (document.startViewTransition) {
        root.classList.add(cls);
        try {
          var vt = document.startViewTransition(run);
          vt.finished.then(done, done);
        } catch (x) { run(); done(); }
        return;
      }
      /* no view transitions: a fog (or the new theme's colour) sweeps over */
      var o = document.createElement('div');
      o.className = 'sg-swap ' + (theme ? 'sg-swap-theme' : 'sg-swap-lang');
      if (theme) o.style.background = body.classList.contains('dark') ? '#E4E9F0' : '#0B1628';
      body.appendChild(o);
      requestAnimationFrame(function () { requestAnimationFrame(function () { o.classList.add('go'); }); });
      setTimeout(function () {
        run();
        o.classList.add('done');
        setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); busy = false; }, 480);
      }, theme ? 440 : 220);
    }, true);
  }

  /* ─── 10 · Switching category: a wash in the category's colour ───────── */
  /* Leaving Knowledge for the Infirmary (say) washes the page in the new
     category's ink with its emblem; the next page opens under the same wash
     (painted by the head script before first paint) and fogs it away. */
  function pageKey(h) {
    var s = String(h || '').split(/[?#]/)[0].replace(/^.*\//, '').replace(/\.html$/, '');
    return s || 'index';
  }
  function catMap() {
    var m = {};
    /* by each link's innermost group: on some pages an unclosed div nests
       the later groups inside Knowledge */
    $$('.sidebar-group.part a.sidebar-link[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || h.charAt(0) === '#' || /^[a-z]+:/i.test(h)) return;
      var pk = pageKey(h);
      if (m[pk]) return;
      var g = a.closest('.sidebar-group.part'), nm = g.querySelector('.part-name');
      var k = (g.getAttribute('data-part') || '').replace('vitalite-', '');
      m[pk] = { k: k, en: nm ? (nm.getAttribute('data-en') || nm.textContent) : k, zh: nm ? (nm.getAttribute('data-zh') || '') : '' };
    });
    return m;
  }
  function isZh() { try { return (localStorage.getItem('sm_lang') || '').toLowerCase() === 'zh'; } catch (e) { return false; } }
  function washEl(c) {
    var w = document.createElement('div');
    w.className = 'sg-catwash';
    w.setAttribute('data-cat', c.k);
    w.setAttribute('aria-hidden', 'true');
    var S = window.VitaliteShapes && window.VitaliteShapes.splash, e = EMBLEM['vitalite-' + c.k];
    var zh = isZh() && c.zh;
    w.innerHTML = '<div class="sg-cw-in"><div class="sg-cw-emb">' + (S && e && S[e] ? S[e]() : '') + '</div>' +
      '<div class="sg-cw-name"></div><div class="sg-cw-sub">Vitalité</div></div>';
    w.querySelector('.sg-cw-name').textContent = zh ? c.zh : c.en;
    return w;
  }
  function catWash() {
    /* arriving under a wash */
    if (root.classList.contains('sg-catgo')) {
      var c = null;
      try { c = JSON.parse(sessionStorage.getItem('sg-catgo') || 'null'); } catch (x) {}
      try { sessionStorage.removeItem('sg-catgo'); } catch (x) {}
      var w = washEl(c || { k: root.getAttribute('data-sg-cat') || '', en: '', zh: '' });
      body.appendChild(w);
      root.classList.remove('sg-catgo');
      setTimeout(function () {
        pageFogIn(false);
        w.classList.add('sg-cw-out');
        setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 1000);
      }, 380);
    }
    if (REDUCE) return;
    var map = catMap(), here = map[pageKey(location.pathname)];
    if (!here) return;
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var u;
      try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin || pageKey(u.pathname) === pageKey(location.pathname)) return;
      var to = map[pageKey(u.pathname)];
      if (!to || to.k === here.k) return;
      e.preventDefault();
      try { sessionStorage.setItem('sg-catgo', JSON.stringify({ k: to.k, en: to.en, zh: to.zh, t: Date.now() })); } catch (x) {}
      var w = washEl(to);
      w.classList.add('sg-cw-enter');
      root.classList.add('sg-leaving');
      body.appendChild(w);
      setTimeout(function () { location.href = u.href; }, 340);
      window.addEventListener('pageshow', function (ev) {
        if (!ev.persisted) return;             /* came back via bfcache: lift the wash */
        root.classList.remove('sg-leaving');
        if (w.parentNode) w.parentNode.removeChild(w);
      }, { once: true });
    });
  }

  /* ─── Boot ───────────────────────────────────────────────────────────── */
  function boot() {
    safe(mountGrain);
    safe(themeSync);
    safe(pageFog);
    safe(catWash);
    safe(posters);
    safe(fabric);
    safe(sheen);
    safe(swapFx);
    safe(wheel);
    safe(studyDeepLink);
    safe(fog);
    safe(sprayMosaic);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

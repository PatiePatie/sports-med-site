/* ══════════════════════════════════════════════════════════════════════════
   button-glow.js — cursor-tracked radial spotlight inside button borders
   + crisp micro-tactile spring physics on click.
   --------------------------------------------------------------------------
   Self-contained: injects its own stylesheet (house pattern, same as
   loader.js). Include with `defer` in <head> after linear-layout.js.

   Behaviour:
   · Spotlight — a subtle radial glow inside the button boundary whose
     center chases the cursor (--vx/--vy as % of the button box). Clipped
     by border-radius:inherit so it sits INSIDE the border, never escapes.
   · Spring — pointerdown squashes to scale(.965) in ~70ms (crisp, no
     lag), pointerup releases with an overshoot bounce (1.012 → 1). Same
     spring fires for keyboard Enter/Space. Touch gets the tactile press,
     only the spotlight is fine-pointer gated.
   · Zero deps, fully event-delegated — survives the chapters rail, tabs,
     modals and any dynamic DOM mutation. The overlay span is
     aria-hidden + pointer-events:none: semantics and clicks untouched.
   · prefers-reduced-motion: everything off, buttons stay static.
   Remove with: rm button-glow.js + drop the <script> tags.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  try {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ─── styles ──────────────────────────────────────────────────────── */
    var css =
      /* spotlight child: fills the padded box, radius-inherited, glued
         inside the border. Fades in/out on the button's vt-glow state. */
      '.vt-spot{position:absolute;left:0;top:0;width:100%;height:100%;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .11s ease-out;' +
      'background:radial-gradient(closest-side at var(--vx,50%) var(--vy,50%),rgba(255,255,255,.13),rgba(255,255,255,0) 74%);}' +
      '@supports (background:color-mix(in srgb,red 10%,transparent)){' +
      '.vt-spot{background:' +
      'radial-gradient(closest-side at var(--vx,50%) var(--vy,50%),color-mix(in srgb,var(--accent,#b8860b) 15%,transparent),transparent 72%),' +
      'radial-gradient(closest-side at var(--vx,50%) var(--vy,50%),rgba(255,255,255,.09),transparent 58%);}}' +
      /* tracking mode: spot visible */
      '.vt-glow{position:relative}.vt-glow .vt-spot{opacity:1}' +
      /* after a spring release the spot melts away instead of popping */
      '.vt-glow:not(.vt-pressing).vt-released .vt-spot{opacity:0;transition:opacity .3s ease .04s}' +
      /* micro-tactile spring: instant squash down, springy overshoot up.
         !important: must beat any theme :hover transform (e.g. translateY
         lift) — the release uses an animation instead, which outranks
         normal hover rules on its own. */
      '.vt-pressing{transform:scale(.965)!important;transition:transform .07s ease-out!important}' +
      '.vt-released{animation:vt-spring .4s cubic-bezier(.34,1.56,.64,1)}' +
      '@keyframes vt-spring{0%{transform:scale(.965)}55%{transform:scale(1.012)}100%{transform:scale(1)}}' +
      (reduce ? '@media (prefers-reduced-motion:reduce){.vt-spot,.vt-glow .vt-spot{opacity:0!important;transition:none}.vt-pressing{transform:none!important;transition:none!important}.vt-released{animation:none!important}}' : '');
    var sty = document.createElement('style');
    sty.textContent = css;
    (document.head || document.documentElement).appendChild(sty);

    var SEL = 'button, .btn, [role="button"]';
    var active = null;
    var lastX = 0, lastY = 0;

    function eligible(t) {
      if (!t || !t.closest) return null;
      var b = t.closest(SEL);
      if (!b) return null;
      if (b.disabled || b.getAttribute('aria-disabled') === 'true') return null;
      return b;
    }

    function activate(b) {
      if (active === b) return;
      if (active) active.classList.remove('vt-glow');
      active = b;
      /* lazily graft the spotlight span — survives DOM rebuilds via a
         fresh query each activation, never duplicates */
      if (!b.querySelector('.vt-spot')) {
        var s = document.createElement('span');
        s.className = 'vt-spot';
        s.setAttribute('aria-hidden', 'true');
        b.appendChild(s);
      }
      b.classList.add('vt-glow');
    }

    function deactivate(b) {
      if (active === b) {
        b.classList.remove('vt-glow');
        active = null;
      }
    }

    function track(b, x, y) {
      var r = b.getBoundingClientRect();
      if (!r.width || !r.height) return;
      b.style.setProperty('--vx', ((x - r.left) / r.width * 100).toFixed(2) + '%');
      b.style.setProperty('--vy', ((y - r.top) / r.height * 100).toFixed(2) + '%');
    }

    /* ─── spotlight: fine-pointer hover only ──────────────────────────── */
    if (finePointer && !reduce) {
      document.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var b = eligible(e.target);
        if (!b) { if (active) deactivate(active); return; }
        activate(b);
        lastX = e.clientX; lastY = e.clientY;
        track(b, lastX, lastY);
      }, { passive: true });

      /* leaving a button — relatedTarget still inside it = child hop, skip */
      document.addEventListener('pointerout', function (e) {
        var b = eligible(e.target);
        if (!b) return;
        var rel = e.relatedTarget;
        if (rel && b.contains(rel)) return;
        deactivate(b);
      }, { passive: true });

      /* scrolling with the cursor parked on a button: keep the glow glued */
      var scrollSync = function () { if (active) track(active, lastX, lastY); };
      document.addEventListener('scroll', scrollSync, { capture: true, passive: true });
      window.addEventListener('resize', scrollSync, { passive: true });
    }

    /* ─── micro-tactile spring: any pointer type + keyboard ───────────── */
    function press(b) {
      b.classList.remove('vt-released');
      b.classList.add('vt-pressing');
    }

    function release(b) {
      if (!b.classList.contains('vt-pressing')) return;
      b.classList.remove('vt-pressing');
      b.classList.add('vt-released');
      clearTimeout(b._vtT);
      b._vtT = setTimeout(function () { b.classList.remove('vt-released'); }, 420);
    }

    /* sweep catches pointerup landing off-button, drag-offs, modal swaps */
    function sweep() {
      var d = document.querySelectorAll('.vt-pressing');
      for (var i = 0; i < d.length; i++) release(d[i]);
    }

    document.addEventListener('pointerdown', function (e) {
      var b = eligible(e.target);
      if (b) press(b);
    }, { passive: true });
    document.addEventListener('pointerup', sweep, { passive: true });
    document.addEventListener('pointercancel', sweep, { passive: true });
    document.addEventListener('pointerleave', sweep, { passive: true });
    window.addEventListener('blur', sweep);

    /* keyboard: Enter/Space on a focused button gets the same spring */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var b = eligible(document.activeElement);
      if (b) press(b);
    });
    document.addEventListener('keyup', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var b = eligible(document.activeElement);
      if (b) release(b);
    });
  } catch (e) { /* fail soft — a glow must never break the page */ }
})();
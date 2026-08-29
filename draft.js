/* ══════════════════════════════════════════════════════════════════════════════
   draft.js — progressive enhancement for the "Editorial Surgical" draft.
   ------------------------------------------------------------------------------
   Scope is deliberately tiny and nav-only. It does NOT touch the page's own
   script: no globals are read or reassigned, no existing handler is rebound, no
   content outside the sidebar is inspected. Loaded with `defer`, so the page's
   inline <script> (which runs during parsing) has already finished.

   1. Turns the bare sidebar-toggle into a real drawer: backdrop, Escape, body
      scroll lock, aria-expanded, close-on-navigate. The existing inline
      `onclick="…classList.toggle('open')"` keeps working untouched — we observe
      the class rather than replace the handler.
   2. Strips the decorative leading emoji from sidebar link labels (both the
      rendered text and the data-en/data-zh attributes the language toggle reads
      back), so the nav reads as typography. Reverts the moment the draft is off.

   Remove the <link>/<script> pair and every line of this is gone:
       python3 tools/theme_switch.py off
   ══════════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var sidebar = document.getElementById('sidebar');
  var toggle = document.getElementById('sidebarToggle');
  if (!sidebar) return;

  /* ─── 1 · Drawer ──────────────────────────────────────────────────────── */

  var backdrop = document.createElement('div');
  backdrop.className = 'sm-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  if (toggle) {
    toggle.setAttribute('aria-controls', 'sidebar');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation 打开导航');
  }
  sidebar.setAttribute('aria-label', 'Site navigation 网站导航');

  // Only lock/dim while the drawer is actually an overlay.
  var overlayQuery = window.matchMedia('(max-width:1024px)');

  function isOpen() {
    return sidebar.classList.contains('open');
  }

  function close() {
    sidebar.classList.remove('open');
  }

  function sync() {
    var open = isOpen() && overlayQuery.matches;
    backdrop.classList.toggle('show', open);
    document.body.classList.toggle('sm-locked', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  // The markup's inline onclick flips `.open` — watch for it instead of
  // rebinding, so the original behaviour stays authoritative.
  new MutationObserver(sync).observe(sidebar, {
    attributes: true,
    attributeFilter: ['class']
  });

  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen() && overlayQuery.matches) {
      close();
      if (toggle) toggle.focus();
    }
  });

  // Tapping a link should dismiss the drawer, including same-page #anchors.
  sidebar.addEventListener('click', function (e) {
    if (e.target.closest('a') && overlayQuery.matches) close();
  });

  // Rotating to desktop width must not leave the page scroll-locked.
  var onChange = function () {
    if (!overlayQuery.matches) close();
    sync();
  };
  if (overlayQuery.addEventListener) overlayQuery.addEventListener('change', onChange);
  else overlayQuery.addListener(onChange);

  sync();

  /* ─── 2 · De-emoji the nav labels ─────────────────────────────────────── */

  // Leading pictographs (incl. surrogate-pair emoji), variation selectors,
  // ZWJ sequences and the space that follows them.
  var LEADING_EMOJI = new RegExp(
    '^(?:' +
      '[\\u2190-\\u21FF\\u2300-\\u23FF\\u25A0-\\u27BF\\u2B00-\\u2BFF]' +
      '|[\\uD83C-\\uD83E][\\uDC00-\\uDFFF]' +
      '|[\\uFE0E\\uFE0F\\u200D\\u20E3]' +
    ')+\\s*'
  );

  function strip(value) {
    return typeof value === 'string' ? value.replace(LEADING_EMOJI, '') : value;
  }

  sidebar.querySelectorAll('.sidebar-link').forEach(function (link) {
    ['data-en', 'data-zh'].forEach(function (attr) {
      var v = link.getAttribute(attr);
      if (v) link.setAttribute(attr, strip(v));
    });
    var text = link.textContent;
    var stripped = strip(text);
    if (stripped !== text) link.textContent = stripped;
  });
})();

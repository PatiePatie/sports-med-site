/* ═══════════════════════════════════════════════════════════════════════
 * vi-icons.js — "no Apple emoji" icon engine.
 * Replaces decorative emojis in the UI with hand-drawn 16px line icons at
 * runtime.  The emoji stays in the HTML (data-en/data-zh attrs, alt text),
 * only the *rendered* glyphs are swapped.  Runs after draft.js/linear-layout.js,
 * re-runs after applyLang() toggles and any DOM injection (MutationObserver).
 * Style matches linear-layout's lin-ico: 16px stroked currentColor.
 * ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SVG_ATTR = 'viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" ' +
                 'stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"';

  /* ── Icon library ────────────────────────────────────────────────────── */
  var ICONS = {
    compass:   '<circle cx="8" cy="8" r="5.4"/><path d="m10.8 5.2-2 3.6-3.6 2 2-3.6Z"/>',
    stetho:    '<path d="M5.2 2.6V5.8a2.8 2.8 0 0 0 5.6 0V2.6"/><path d="M8 8.4v2.2a2.8 2.8 0 0 0 2.8 2.8h.9a1.7 1.7 0 0 0 0-3.4h-.6a2.3 2.3 0 0 1-2.3-2.3V7.6"/><path d="M5.8 8.6 4.2 10"/>',
    users:     '<circle cx="6.2" cy="5.4" r="2.2"/><path d="M2.6 13.4a3.6 3.6 0 0 1 7.2 0"/><path d="M10.2 3.6a2.2 2.2 0 0 1 0 4.1M13.4 13.4a3.6 3.6 0 0 0-2.9-3.5"/>',
    wrench:    '<path d="M14.3 5.7 9.4 10.6M8.4 8.6l2-2a3.9 3.9 0 0 0-5.3-5.3l2.1 2.1L6.6 4.9 4.5 2.8a3.9 3.9 0 0 0 5.3 5.3l2-2 1 1-2 2"/>',
    target:    '<circle cx="8" cy="8" r="5.6"/><circle cx="8" cy="8" r="2.6"/><circle cx="8" cy="8" r=".5" fill="currentColor" stroke="none"/>',
    alert:     '<path d="M8 2.4 14.6 12.9H1.4Z"/><path d="M8 6.2v3M8 11.6v.1"/>',
    noentry:   '<circle cx="8" cy="8" r="5.4"/><path d="m4.8 4.8 6.4 6.4"/>',
    checkcir:  '<circle cx="8" cy="8" r="5.4"/><path d="m5.6 8.2 1.6 1.6 3.2-3.6"/>',
    bang:      '<path d="M8 2.8v6.4"/><circle cx="8" cy="12.1" r=".5" fill="currentColor" stroke="none"/>',
    bulb:      '<path d="M8 2.6c-1.5 0-2.4 1.1-2.4 2.3 0 1.1.5 1.8 1 2.4.4.5.6.9.6 1.4v.8h1.6v-.8c0-.5.2-.9.6-1.4.5-.6 1-1.3 1-2.4C10.4 3.7 9.5 2.6 8 2.6Z"/><path d="M6.3 12h3.4M6.6 13.6h2.8"/>',
    chart:     '<path d="M3 13V9.6M6.3 13v-5M9.7 13V6.4M13 13V3.4"/>',
    books:     '<path d="M2.6 12.3 4.1 3.7h6.7l.4 8.6H2.6ZM2.6 12.3h8v1.1H4.1ZM11.2 3.7h2.6v8.6h-2.6Z"/>',
    scope:     '<circle cx="8" cy="11.4" r="2.2"/><path d="M6.4 14.4 3.6 13M5.6 11.6 9.3 2.6"/><path d="m9.3 2.6-1.6-.6M9.3 2.6V4M3.2 14.8h8"/>',
    balance:   '<path d="M4.2 14h7.6M8 2.6v11.4M8 2.6 3.4 7.1l1.1 2.3 1.1-2.2 2.4-2.4M8 2.6l2.4 2.1 1.1 2.2 1.1-2.3Z"/>',
    cards:     '<path d="M2.8 4.2h6.4v9.2a1 1 0 0 1-1 1H3.8a1 1 0 0 1-1-1Z"/><path d="M9.2 5.4h2.8a1 1 0 0 1 1 1v6.4a1 1 0 0 1-1 1H9.2a1 1 0 0 1-1-1V6.4a1 1 0 0 1 1-1Z"/><path d="M2.8 6.6h6.4M4.4 8.4h3.2"/>',
    globe:     '<circle cx="8" cy="8" r="5.4"/><path d="M2.6 8h10.8M8 2.6c1.5 1.5 2.2 3.4 2.2 5.4s-.7 3.9-2.2 5.4C6.5 11.9 5.8 10.1 5.8 8s.7-3.9 2.2-5.4Z"/>',
    grad:      '<path d="m3.2 7.4 4.8-2.3 4.8 2.3-4.8 2.3Z"/><path d="M5.6 9v2.2c0 .9 1.1 1.6 2.4 1.6s2.4-.7 2.4-1.6V9"/>',
    message:   '<path d="M13 9.5a1.5 1.5 0 0 1-1.5 1.5H6l-3 2.5V4a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 13 4Z"/>',
    ruler:     '<path d="M2.8 13.2 8.8 2.4h4.4v1.6L4.6 13.2Z"/><path d="m9.4 2.8.4 1.4.4 1.4.4 1.4M11 2.8l.4 1.4M4.8 12.4l2.6-4.6 1.3 2.3"/>',
    note:      '<path d="M4.2 2.8h5.2l2.4 2.4v7.6a1 1 0 0 1-1 1H4.2a1 1 0 0 1-1-1V3.8a1 1 0 0 1 1-1Z"/><path d="M9.4 2.8v2.4h2.4M5.8 9h4.4M5.8 10.8h3"/>',
    lock:      '<rect x="5.4" y="8.2" width="5.2" height="4.4" rx="1"/><path d="M6.8 8.2V6.6a1.2 1.2 0 0 1 2.4 0v1.6"/>',
    unlock:    '<rect x="5.4" y="8.2" width="5.2" height="4.4" rx="1"/><path d="M6.8 8.2V6.6a1.2 1.2 0 0 1 2.4 0"/>',
    puzzle:    '<path d="M10.2 3.2h.8a1.4 1.4 0 0 1 0 2.8h-.8v1.9H9.4V3.2ZM8.6 2.6v-.3M5.4 4.4a1.5 1.5 0 0 1 3 0 1.5 1.5 0 0 1-3 0ZM5.4 7.6a1.5 1.5 0 0 1 3 0 1.5 1.5 0 0 1-3 0ZM2.9 7.6h1.6a1.5 1.5 0 0 1 3 0v.5h2.9v1H8.1v-1.9H5.4a1.5 1.5 0 0 1-2.5-1.1V7.6Zm0 4.9h2.8v1H2.9Z"/><path d="M8.6 11.2a1.5 1.5 0 0 1 3 0 1.5 1.5 0 0 1-3 0Z"/><path d="M10.2 13.2v-.5"/>',
    trophy:    '<path d="M6 2.8h4v4a2 2 0 0 1-4 0Z"/><path d="M6 2.8H4v.8a2 2 0 0 0 2.2 2M10 2.8h2v.8a2 2 0 0 1-2.2 2M8 8.8v1.4M5.8 13.2h4.4M6.6 14.8h2.8"/>',
    clip:      '<path d="M5.4 3.3h5.2a1 1 0 0 1 1 1v8.4a1 1 0 0 1-1 1H5.4a1 1 0 0 1-1-1V4.3a1 1 0 0 1 1-1Z"/><path d="M6.3 3.3V2.6h3.4v.7M5.8 6.2h4.4M5.8 7.9h4.4M5.8 9.6h2.4"/>',
    book:      '<path d="M3 3.5h3.6c.8 0 1.4.6 1.4 1.4v7.6c0-.6-.5-1-1.1-1H3Zm10 0H9.4c-.8 0-1.4.6-1.4 1.4v7.6c0-.6.5-1 1.1-1H13Z"/>',
    folder:    '<path d="M2.8 4.7h4l1.2 1.3h5.2a1 1 0 0 1 1 1v3M2.8 4.7a1 1 0 0 0-1 1v5.6a1 1 0 0 0 1 1h10.4a1 1 0 0 0 1-1V7"/>',
    video:     '<rect x="2.6" y="4" width="8.4" height="8" rx="1.4"/><path d="M11 6.9l2.4-1.7v5.6L11 9.1"/><path d="m4.8 3.4-2.2-1"/><path d="M2.6 6.4h8.4"/>',
    calendar:  '<rect x="2.8" y="3.4" width="10.4" height="9.8" rx="1.3"/><path d="M2.8 6.4h10.4M5.7 2v3M10.3 2v3M5.4 9.3h2.4M5.4 11.3h2.4"/>',
    rocket:    '<path d="M5.6 4.6h4.8M6.2 4.6c-.2 2.8-.5 4.8-1.4 6.6h6.4c-.9-1.8-1.2-3.8-1.4-6.6"/><circle cx="8" cy="4.2" r="1.7"/><path d="M4.6 11.6h3v1.6h-3ZM8 13.2v1.6M6.8 14h2.4"/>',
    user:      '<circle cx="8" cy="5.8" r="2.6"/><path d="M3.4 13.5a4.6 4.6 0 0 1 9.2 0"/>',
    pen:       '<path d="M9.9 3 13 6.1 4.6 14.5l-3.2.1.1-3.2Z"/><path d="m3.2 11.2 2 2"/>',
    save:      '<path d="M3.8 2.9h8.4l1.2 1.2v8.6a1.1 1.1 0 0 1-1.1 1.1H4.9a1.1 1.1 0 0 1-1.1-1.1V4a1.1 1.1 0 0 1 1.1-1.1Z"/><path d="M5.6 2.9v2.8h4.8V2.9M3.8 9.2h8.4M5.4 9.2v3.6h5.2V9.2"/>',
    download:  '<path d="M8 2.6v7M5.6 7.2 8 9.6l2.4-2.4"/><path d="M2.8 12.4v.8a1 1 0 0 0 1 1h8.4a1 1 0 0 0 1-1v-.8"/>',
    check:     '<path d="m3.4 8.4 3.2 3.2 6-7"/>',
    x:         '<path d="m4.4 4.4 7.2 7.2M11.6 4.4l-7.2 7.2"/>',
    menu:      '<path d="M2.6 4.6h10.8M2.6 8h10.8M2.6 11.4h10.8"/>',
    moon:      '<path d="M13.4 9.4A6 6 0 1 1 6.6 2.6a5 5 0 0 0 6.8 6.8Z"/>',
    sun:       '<circle cx="8" cy="8" r="3"/><path d="M8 1.6v1.2M8 13.2v1.2M2.5 8H1.3M14.7 8h-1.2M4 4l-.9-.9M12.9 12.9l-.9-.9M12 4l.9-.9M3.1 12.9l.9-.9"/>',
    dotok:     '<circle cx="8" cy="8" r="3.1" fill="currentColor" stroke="none"/>',
    dotno:     '<circle cx="8" cy="8" r="3.1" fill="currentColor" stroke="none"/>',
    walk:      '<circle cx="8" cy="3.8" r="1.2"/><path d="M6 7h4l-1.3 2 2.8 1-1 1.4-2.1-.8-1.2 2.6-1.4-.8 1.6-3.4Z"/>',
    run:       '<circle cx="8" cy="3.4" r="1.2"/><path d="M4.6 11.6 7.2 9.6l1.2-2.4h2.6l1.6 2.2-1.6 1-1-1.2-1.4-.6-1.6 2.2-1.6.8"/><path d="M4 13.8l1.8-2M11.8 13.4l1.6-1.6"/>',
    drop:      '<path d="M8 2.4c2.7 2.9 4 5.3 4 7.2a4 4 0 1 1-8 0C4 7.7 5.3 5.3 8 2.4Z"/>',
    muscle:    '<path d="M4.6 11V8.8c0-2.2 1.4-4 4-4 1.2 0 2 1 2 2v.8"/><path d="M8.6 4.8V2.2h1.8v1.2c.8.2 1.4.9 1.4 1.8"/><path d="M5.6 13.4c-2.2.4-3.6-.4-3.6-2.2 0-1 .8-1.8 1.8-1.8h1M10.6 4.2v2"/><path d="M11.4 12.4c1.8-.2 2.6-1 2.6-2.4 0-1-.7-1.6-1.8-1.6"/>',
    sleep:     '<path d="M13.2 9.6a5.6 5.6 0 1 1-6.8-6.8 4.8 4.8 0 0 0 6.8 6.8Z"/><path d="M4.4 11.8h3M5.2 13.4h2.4"/>',
    coffee:    '<path d="M4.4 4.2h6.4v3.2a3.2 3.2 0 1 1-6.4 0Z"/><path d="M10.8 6.4h.8a1.7 1.7 0 0 1 0 3.4h-.8M4.4 12.6c0 .9.7 1.6 1.6 1.6h3.2c.9 0 1.6-.7 1.6-1.6"/>',
    rice:      '<path d="M3 8.2h10a5 5 0 0 1-10 0Z"/><path d="M4.6 8.2v.5M6.4 8.2v.5M8.2 8.2v.5M10 8.2v.5M11.8 8.2v.5M5.4 10.6 3.8 13M10.6 10.6l1.6 2.4"/>',
    phone:     '<rect x="5.7" y="2.4" width="4.6" height="11.2" rx="1.2"/><path d="M7.4 11.2h1.2"/>',
    bed:       '<path d="M2.6 4.6v7M2.6 8.6h10.4c.9 0 1.6.5 1.6 1.2v2M11 8.6V6.2h1.4M9.4 8.6V5.2M3 4.6l2.4 2.4"/>',
    salad:     '<path d="M8 3.4c-1.7 0-3 1.3-3 3 0 .2 0 .4.1.5M8 3.4c1.7 0 3 1.3 3 3H8.2M8 3.4h2M8 3.4c-1 0-1.8 1-2.2 2.4H10.2Z"/><path d="M3 9.4h10l-.6 2.8a4.8 4.8 0 0 1-8.8 0Z"/>',
    lotus:     '<circle cx="8" cy="3.6" r="1.1"/><path d="M5.6 7h4.8l-.7 4H6.3Z"/><path d="M6.3 11 5 13.4M9.7 11l1.3 2.4M6 13.4h4"/>',
    bell:      '<path d="M13 11.4H3a4.8 4.8 0 0 1 1.6-3.4V6a3.4 3.4 0 0 1 6.8 0v2c1.1.9 1.6 2 1.6 3.4Z"/><path d="M7 13.6h2"/>',
    mail:      '<rect x="2.4" y="4" width="11.2" height="8" rx="1.2"/><path d="m2.8 5.2 5.2 3.8 5.2-3.8"/>',
    plus:      '<path d="M8 3.4v9.2M3.4 8h9.2"/>',
    pin:       '<path d="M3.4 1.8v12M3.8 2.6h8.6l-2 2.6 2 2.6H3.8"/>',
    leg:       '<circle cx="7.8" cy="3" r="1.3"/><path d="M6.6 5.6 5.3 12c-.2.8.3 1.4 1.1 1.4H9.2l1.6-2.6-1.8 1.2-1.2-4Z"/>',
    legalt:    '<circle cx="7.4" cy="3" r="1.3"/><path d="M6.2 5.6 5 11.6c-.2.8.3 1.4 1.1 1.4h.4l1.2-2.6 1.4 2.4h2.6l-1-2.4 1.4-1.2H8.2l-.8-2.6Z"/><circle cx="6.7" cy="8" r=".5" fill="currentColor" stroke="none"/>',
    lift:      '<circle cx="8" cy="4.4" r="1.7"/><path d="M5.6 8.4h4.8l1.5 4.4-1.7.8-1-2.6-.3 3.4h-1.8l-.3-3.4-1 2.6-1.7-.8Z"/><path d="M12.8 4.4h2.6M.6 4.4h2.6M12.8 4.4h.7M14.8 3.7v1.4M1.2 3.7v1.4"/>',
    bone:      '<path d="M5.4 8.2a2.2 2.2 0 0 1-2.6 2.6 2.4 2.4 0 0 1 8-1.2 2.4 2.4 0 0 1 7.4-2 2.4 2.4 0 0 1-1 2.6A2.2 2.2 0 0 1 14.6 6.2c.5.4.9 1 .9 1.7"/>',
    talk:      '<path d="M9.2 4.8 4.8 7.2H3a1 1 0 0 0-1 1v1.8a1 1 0 0 0 1 1h1.8l4.4 2.4Z"/><path d="M11.4 6a3.8 3.8 0 0 1 0 4.2M13 4.6a6.4 6.4 0 0 1 0 6.9"/>',
    search:    '<circle cx="7.2" cy="7.2" r="4"/><path d="m10.2 10.2 3 3"/>',
    eye:       '<path d="M2 8s2.4-4.2 6-4.2S14 8 14 8s-2.4 4.2-6 4.2S2 8 2 8Z"/><circle cx="8" cy="8" r="1.6"/>',
    image:     '<rect x="2.6" y="3.4" width="10.8" height="9.2" rx="1"/><circle cx="6" cy="6.6" r="1"/><path d="m3.4 11.8 3.6-3.4 2.8 2.8 2.8-2.8 2 2.2"/>',
    forbid:    '<circle cx="8" cy="8" r="5.2"/><path d="m5.4 5.4 5.2 5.2"/>',
    confetti:  '<path d="M8 2.6v2.6M8 10.8v2.6M2.6 8h2.6M10.8 8h2.6M4.2 4.2l1.8 1.8M10 10l1.8 1.8M11.8 4.2 10 6M6 10l-1.8 1.8"/><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/>',
    cake:      '<path d="M3 10.2h10v2.6H3Z"/><path d="M8.4 10.2v-2h-.4c-3.4 0-4.6-2.4-4.6-4.2 0 1.2.9 2.2 2 2.4 1 .2 2 .4 2.2 2M5.6 7.2c1 .6 1.6 1.3 2 2M6.3 13.2l1.2-1.8 1.2 1.8 1.2-1.8 1.2 1.8"/>',
    snow:      '<path d="M8 2.6v10.8M3.4 5.2l9.2 5.6M3.4 10.8l9.2-5.6"/><path d="M8 2.6 6.6 5.4M8 2.6l1.4 2.8M8 13.4 6.6 10.6M8 13.4l1.4-2.8M3.4 5.2l3.2.4M6.6 6l-3.2 1M12.6 5.2l-3.2.4M9.4 6l3.2 1M3.4 10.8l3.2-.4M6.6 10l-3.2 1M12.6 10.8l-3.2-.4M9.4 10l3.2-1"/>',
    shield:    '<path d="M8 2.6 13 4.2v4c0 2.9-2 5.3-5 6.4-3-1.1-5-3.5-5-6.4v-4Z"/>',
    help:      '<circle cx="8" cy="8" r="5.4"/><path d="M6.2 6a1.8 1.8 0 0 1 3.5.6c0 1.2-1.6 1.6-1.6 2.8M8 12v.1"/>',
    xcircle:   '<circle cx="8" cy="8" r="5.4"/><path d="m5.6 5.6 4.8 4.8M10.4 5.6l-4.8 4.8"/>',
    gear:      '<circle cx="8" cy="8" r="2"/><path d="M8 2.4V3.6M8 12.4v1.2M2.4 8h1.2M12.4 8h1.2M4 4l.9.9M11.1 11.1l.9.9M12 4l-.9.9M4.9 11.1 4 12"/>',
    mailbox:   '<rect x="3" y="4" width="10" height="6" rx="1.6"/><path d="M3 6.6 8 9.6l5-3M8 9.6v.8M6.6 12.2h2.8"/>',
    edit:      '<path d="M8.5 3.5H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7M11 2.6l2.4 2.4-4.6 4.6-2.9.5.5-2.9Z"/>',
    left:      '<path d="M13.4 8H2.6M6 4.6 2.6 8l3.4 3.4"/>',
    right:     '<path d="M2.6 8h10.8M10 4.6l3.4 3.4-3.4 3.4"/>',
    arrows:    '<path d="M4.4 6 2.6 8l1.8 2M11.6 10l1.8-2-1.8-2M2.6 8h10.8"/>',
    flag:      '<path d="M3.4 1.8v12M3.8 2.6h8.6l-2 2.6 2 2.6H3.8"/>',
    flagus:    '<path d="M2.8 2.6h7.6l1.4 2-1.4 2H2.8Z"/><path d="M6.8 3.4l.4 1.2 1-.8H6.8l.4 1.2 1-.8Z" fill="currentColor" stroke="none"/><path d="M2.8 6.2h2.2l-1.1 1.5 1.2 1.5H2.8M2.8 9.2h2.2l-1.1 1.5 1.2 1.5H2.8M10.2 6.2h2.2l-1.1 1.5 1.2 1.5h-2.3"/>',
    flagcn:    '<path d="M2.8 2.6h7.6l1.4 2-1.4 2H2.8Z"/><path d="M2.8 2.6v10.8M5.6 3.6l.4 1.2 1.1-.8H5.6l.4 1.2 1.1-.8Z" fill="currentColor" stroke="none"/><path d="M7.6 3.4l.3.9.9-.7H7.6l.3.9.9-.7Z" fill="currentColor" stroke="none"/><path d="M7 5.6l.3.9.9-.7H7l.3.9.9-.7Z" fill="currentColor" stroke="none"/><path d="M8.6 4.9l.3.9.9-.7H8.6l.3.9.9-.7Z" fill="currentColor" stroke="none"/>',
    home:      '<path d="M8 3 2.8 7.4v5.2h10.4V7.4Z"/><path d="M6.4 12.4V8.8h3.2v3.6"/>',
    undo:      '<path d="M6.4 3.2 3.2 6.2l3.2 3M3.2 6.2h7.4a2.6 2.6 0 0 1 0 5.2H7.3"/>',
    redo:      '<path d="M9.6 3.2l3.2 3-3.2 3M12.8 6.2H5.4a2.6 2.6 0 0 0 0 5.2h3.3"/>',
    reset:     '<path d="M4.2 11a5.8 5.8 0 1 0 .9-5.3M3.4 3.2v3h3"/>',
    clock:     '<circle cx="8" cy="8" r="5.4"/><path d="M8 4.6V8l2.4 1.6"/>',
    robot:     '<rect x="4" y="6.4" width="8" height="6.2" rx="1.9"/><path d="M8 6.4V4.6M6.4 4.6h3.2"/><circle cx="6.3" cy="9.4" r=".6"/><circle cx="9.7" cy="9.4" r=".6"/><path d="M3.2 8.6H1.9M14.1 8.6h-1.3"/>',
    trash:     '<path d="M3.4 5h9.2M6.2 5V3.9a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1V5M5.4 5l.5 7.4a1.2 1.2 0 0 0 1.2 1.1h1.8a1.2 1.2 0 0 0 1.2-1.1L10.6 5M6.6 7.4v4M9.4 7.4v4"/>',
    palette:   '<circle cx="8" cy="8" r="5.5"/><circle cx="6.3" cy="6" r=".85" fill="currentColor" stroke="none"/><circle cx="9.7" cy="6" r=".85" fill="currentColor" stroke="none"/><circle cx="11" cy="8.9" r=".85" fill="currentColor" stroke="none"/><path d="M5.5 9.6 4.1 10.9a1.1 1.1 0 0 0 .8 1.8H8"/>',
    dna:       '<path d="M5 2.8c6 2.4 6 7.6 0 10.4M11 2.8c-6 2.4-6 7.6 0 10.4M6.4 6.2h3.2M6.4 9.8h3.2"/>',
    sync:      '<path d="M13.2 8a5.2 5.2 0 1 1-1.5-3.6"/><path d="M13.2 3.4v3h-3"/>'
  };

  /* ── emoji → icon name (keys WITHOUT typical variation selectors) ────── */
  var ICON_FOR = {
    '🧭':'compass','🩺':'stetho','👥':'users','🛠':'wrench','🎯':'target',
    '⚠':'alert','⛔':'noentry','✅':'checkcir','❗':'bang','💡':'bulb',
    '📊':'chart','📚':'books','🔬':'scope','⚖':'balance','🃏':'cards',
    '🌐':'globe','🎓':'grad','💬':'message','📐':'ruler','📝':'note',
    '🔒':'lock','🔓':'unlock','🧩':'puzzle','🏆':'trophy','📋':'clip',
    '📖':'book','🗂':'folder','🎬':'video','📅':'calendar','🚀':'rocket',
    '👤':'user','🖊':'pen','💾':'save','⬇':'download','✓':'check',
    '✕':'x','☰':'menu','🌙':'moon','☀':'sun','🟢':'dotok',
    '🔴':'dotno','🚶':'walk','🏃':'run','💧':'drop','💪':'muscle',
    '😴':'sleep','☕':'coffee','🍚':'rice','📱':'phone','🛌':'bed',
    '🥗':'salad','🧘':'lotus','🔔':'bell','✉':'mail','✚':'plus',
    '⚑':'pin','🦵':'leg','🦿':'legalt','🏋':'lift','🦴':'bone',
    '🗣':'talk','🔍':'search','👁':'eye','🖼':'image','🚫':'forbid',
    '🎉':'confetti','🌍':'globe','🎂':'cake','❄':'snow','🛡':'shield',
    '📍':'pin','❓':'help','❌':'xcircle','⚙':'gear','📬':'mailbox',
    '📥':'download','🏠':'home','✎':'edit','➡':'right','⬅':'left',
    '⬌':'arrows','🚩':'flag','🇺🇸':'flagus','🇨🇳':'flagcn',
    '🤖':'robot','🗑':'trash','🔐':'lock','🎨':'palette','🧬':'dna',
    '🔄':'sync','✗':'x','↻':'sync','↶':'undo','↷':'redo','↺':'reset','⏳':'clock'
  };

  var COLOR_FOR = { dotok:'ok', dotno:'no', checkcir:'ok', noentry:'no',
                    alert:'warn', bang:'warn', xcircle:'no', forbid:'no' };

  function norm(s) {
    return s.replace(/[\uFE0E\uFE0F\u200D]/g, '').replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');
  }

  function ic(name, cls) {
    var svg = ICONS[name] || ICONS.target;
    return '<span class="vi-ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' +
           '<svg ' + SVG_ATTR + '>' + svg + '</svg></span>';
  }

  /* First emoji KEY present at the very start of text (normalized). */
  function firstEmoji(text) {
    var n = norm(text);
    for (var k in ICON_FOR) {
      if (n.slice(0, k.length) === k) return k;
    }
    return null;
  }

  /* Strip the leading emoji cluster (the key's raw chars + VS/ZWJ) from raw. */
  function eatCluster(raw, key) {
    var i = 0;
    var nKey = norm(key);
    while (i < raw.length && i < key.length + 8) {
      var p = norm(raw.slice(0, i + 1));
      if (p === nKey) { i += 1; break; }
      if (nKey.indexOf(p) !== 0) break;
      i += 1;
    }
    while (i < raw.length && /[\uFE0E\uFE0F\u200D\u{1F3FB}-\u{1F3FF}]/u.test(raw[i])) i += 1;
    while (i < raw.length && (raw[i] === ' ' || raw[i] === '\t' || raw[i] === '\n' || raw[i] === '\r')) i += 1;
    return raw.slice(i);
  }

  var PROSE = '.acc-body,.facts,.test-prep,.table-wrap,.callout,.chart,.onthis,[class*="vi-ico"]';
  function inProse(el) {
    if (!el.closest || !el.classList) return false;
    if (el.closest(PROSE)) return true;
    /* linear-layout chrome is named *-lin-*; protect it, but ignore the
       lin-* on <body> itself (body.lin-v2 is the whole-page state flag and
       would otherwise disable Rule A for every element on the page). */
    if (/(^|\s)lin-/.test(el.className)) return true;
    var n = el.parentElement;
    while (n && n !== document.body && n !== document.documentElement) {
      if (/(^|\s)lin-/.test(n.className || '')) return true;
      n = n.parentElement;
    }
    return false;
  }

  /* Rule A: element's whole text is exactly ONE emoji (icon-only buttons). */
  function scanWhole(el) {
    if (el.querySelector('.vi-ico')) return;
    if (inProse(el)) return;
    var w = wholeEmoji(el.textContent);
    if (!w) return;
    el.textContent = '';
    el.insertAdjacentHTML('afterbegin', ic(ICON_FOR[w], COLOR_FOR[ICON_FOR[w]]));
  }

  function wholeEmoji(text) {
    var n = norm(text.trim());
    return n && ICON_FOR[n] ? n : null;
  }

  /* Rule B: leading emoji in a UI control/label — strip it, keep the title. */
  var TARGETS = [
    '#composerLoginNote', 'button.for-cat', 'span.for-chip', '.fs', 'button.for-btn',
    '.part-icon', '.sidebar-label', '.co-ico', '.sec-ico', '.nb-bell-ic',
    '.qna-fab-x', '.qna-faq-ic', '.qna-send',
    '.resources-title', '.quiz-title', '.rec-title', '.fork-ico',
    '.trust-chip', '.pb-group-head', '.cert-check', '.ft-hd',
    'button.btn-icon', 'button.lb-btn', 'a.btn-login', 'button.btn-login',
    'a.btn-acc', 'button.btn-acc', 'button.qo-btn', 'a.qo-btn',
    'button.chat-sug-btn', 'button.habit-chip', 'button.tab-btn', 'button.aq-btn',
    'a.log-item', 'a.adm-btn', 'button.adm-btn', 'a.sidebar-link',
    'button.se-b', 'button.btn.danger',
    'h1', 'h2', 'h3', 'h4', 'span[data-en][data-zh]'
  ].join(',');

  function scanB(el) {
    if (el.querySelector('.vi-ico')) return;
    /* On Linear pages draft.js already stripped sidebar-link emoji + linear-layout
     * injects lin-ico; only icon sidebar-links on the gold-blue trio. */
    if (el.matches && el.matches('a.sidebar-link') &&
        document.body && document.body.classList.contains('lin-v2')) return;
    var generic = el.tagName === 'SPAN' && el.hasAttribute('data-en') && el.hasAttribute('data-zh');
    if (generic && inProse(el)) return;
    var key = firstEmoji(el.textContent);
    if (!key) return;
    var icon = ICON_FOR[key];
    var added = false;
    var c = el.firstChild;
    while (c) {
      if (c.nodeType === 3 && c.nodeValue.trim()) {
        c.nodeValue = eatCluster(c.nodeValue, key);
        added = true;
        break;
      }
      c = c.nextSibling;
    }
    if (!added) {
      /* no leading text node (e.g. label lives in a child element) — leave; content untouched */
      return;
    }
    el.insertAdjacentHTML('afterbegin', ic(icon, COLOR_FOR[icon]));
  }

  function scan(root) {
    root = root || document;
    var nodes = root.querySelectorAll(TARGETS);
    for (var i = 0; i < nodes.length; i++) scanB(nodes[i]);
    var all = root.querySelectorAll('button,a,span,h1,h2,h3,h4');
    for (var j = 0; j < all.length; j++) scanWhole(all[j]);
  }

  function init() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', init); return; }
    scan(document);
    if (typeof MutationObserver !== 'undefined') {
      var timer = null;
      var mo = new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(function () { scan(document); }, 60);
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: false });
    }
  }

  window.VI = { ic: ic, scan: scan, ICONS: ICONS };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
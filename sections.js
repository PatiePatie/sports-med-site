/* ══════════════════════════════════════════════════════════════════════════
   sections.js — the Vitalité section shell.
   --------------------------------------------------------------------------
   Splits the site into three section-INTERFACES on one skin — the same
   role-split idea as the investor/entrepreneur surfaces:

       🩺 Infirmary  ·  📚 Knowledge  ·  💬 Social

   Two jobs, both fail-soft, both decoration on top of each page's own
   markup (same contract as linear-layout.js):

     1. SCOPE — the sidebar shows ONLY the current section's links. The
        rail on a knowledge page is knowledge links; the rail on the
        infirmary is infirmary links. No more one-mega-rail-for-everyone.
     2. SWITCH — inject the Infirmary/Knowledge/Social pill group into the
        header so moving between sections is one click, from anywhere.

   Pages opt in by linking sections.css + this script. Without it, the
   site degrades to the current single-rail behaviour.
   ══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var root = document.documentElement;
  if (root.hasAttribute('data-sec')) return;   /* idempotent */

  var SECTIONS = [
    { key: 'infirmary', file: 'infirmary.html', icon: '🩺', en: 'Infirmary', zh: '诊所' },
    { key: 'knowledge', file: 'guide.html',     icon: '📚', en: 'Knowledge', zh: '知识库' },
    { key: 'social',    file: 'social.html',    icon: '💬', en: 'Social',    zh: '社区' }
  ];
  var KNOWLEDGE = [
    'guide.html', 'toc.html', 'exam.html',
    'cn-cert.html', 'usabo.html', 'g10-bio.html', 'account.html'
  ];

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!file || file.indexOf('.') === -1) file = 'index.html';

  function sectionFor(f) {
    if (f === 'infirmary.html') return 'infirmary';
    if (f === 'social.html')    return 'social';
    if (f === 'admin.html')     return 'admin';
    if (KNOWLEDGE.indexOf(f) > -1) return 'knowledge';
    return 'hub';   /* index + anything else is the hub */
  }
  var cur = sectionFor(file);
  root.setAttribute('data-sec', cur);
  document.body.classList.add('sec-' + cur);

  /* ─── 1 · Scope the rail to the current section ─────────────────────── */

  var sidebar = document.getElementById('sidebar') || document.querySelector('nav.sidebar');
  if (sidebar) {
    var want = cur === 'hub' ? null : (cur === 'admin' ? 'vitalite-dev' : 'vitalite-' + cur);
    var groups = sidebar.querySelectorAll('.sidebar-group.part');
    for (var i = 0; i < groups.length; i++) {
      var keep = want && groups[i].getAttribute('data-part') === want;
      groups[i].style.display = keep ? '' : 'none';
      if (keep) groups[i].classList.add('open');
    }
  }

  /* ─── 2 · The section switcher ──────────────────────────────────────── */

  function isCN() {
    if (document.body.classList.contains('lang-zh')) return true;
    if (document.body.classList.contains('lang-en')) return false;
    try { return localStorage.getItem('sm_lang') === 'zh'; } catch (e) { return false; }
  }

  var actions = document.querySelector('.header-actions');
  if (actions && !document.querySelector('.sec-switcher')) {
    var zh = isCN();
    var sw = document.createElement('nav');
    sw.className = 'sec-switcher';
    sw.setAttribute('aria-label', 'Vitalité sections / 版块');
    for (var j = 0; j < SECTIONS.length; j++) {
      var s = SECTIONS[j];
      var a = document.createElement('a');
      a.className = 'sec-pill' + (s.key === cur ? ' active' : '');
      a.href = s.file;
      if (s.key === cur) a.setAttribute('aria-current', 'page');
      var ico = document.createElement('span');
      ico.className = 'sec-ico';
      ico.setAttribute('aria-hidden', 'true');
      ico.textContent = s.icon;
      var lbl = document.createElement('span');
      lbl.className = 'sec-pill-label';
      lbl.setAttribute('data-en', s.en);
      lbl.setAttribute('data-zh', s.zh);
      lbl.textContent = zh ? s.zh : s.en;
      a.appendChild(ico);
      a.appendChild(lbl);
      sw.appendChild(a);
    }
    actions.insertBefore(sw, actions.firstChild);
  }
})();
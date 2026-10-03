/* ═══════════════════════════════════════════════════════════════════════════
   g10-course.js — describes g10-bio.html to course-hub.js.

   The page already knows everything: five <section>s, an h2 per section, and an
   .acc-item per N.M with its code and its EN/ZH title in data-en / data-zh.
   So this file does not author a single word of course content. It reads the
   outline out of the DOM and hands it over, which is what makes it safe: the
   static HTML stays the single source and the hub cannot drift from it.

   Three things are derived rather than typed, and every number the hub shows
   comes from one of them:

     defsFor(section)   the Term | Definition tables the section already has,
                        read as term -> definition, in BOTH languages because
                        the cells carry data-en / data-zh
     drillFor(section)  those same terms, so "Test me" blanks what the section
                        has actually defined rather than a hand-written list
     statsOf(section)   measured by course-hub.js on the nodes it will render

   Progress reuses the page's own store — sm_g10_read, an array of .acc-header
   indexes — so home.html's G10 box keeps working and nothing is duplicated.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (!window.CourseHub) { console.warn('[g10-course] course-hub.js did not load'); return; }

  function E(s, r) { return (r || document).querySelector(s); }
  function EE(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ── the page's own progress store (see window.G10P) ─────────────────── */
  var PK = 'sm_g10_';
  function pj(suf, d) {
    try { var v = JSON.parse(localStorage.getItem(PK + suf) || 'null'); return v == null ? d : v; }
    catch (e) { return d; }
  }
  function ps(suf, v) { try { localStorage.setItem(PK + suf, JSON.stringify(v)); } catch (e) {} }

  /* ── bilingual text of a node ────────────────────────────────────────────
     A cell's own data-en wins; failing that the first descendant that carries
     one (the <strong> inside a term cell); failing that the visible text, which
     is at least the active language and never a "[object Object]". */
  function bi(node) {
    if (!node) return { en: '', zh: '' };
    var en = node.getAttribute && node.getAttribute('data-en');
    if (en != null && en !== '') return { en: en, zh: node.getAttribute('data-zh') || en };
    var kid = EE('[data-en]', node)[0];
    if (kid) {
      var k2 = kid.getAttribute('data-zh');
      return { en: kid.getAttribute('data-en'), zh: k2 || kid.getAttribute('data-en') };
    }
    var t = (node.textContent || '').replace(/\s+/g, ' ').trim();
    return { en: t, zh: t };
  }

  /* ── definitions, read out of the section's own Term | Definition tables ──
     The header cell decides what counts as a definition column, so a
     Property | Fibrous | Globular comparison table is correctly NOT mined for
     definitions while a Level | Name | Description | Bond table is. */
  var DEFCOL = /defin|descript|meaning|what happens|key functions|定义|描述|含义|功能/i;

  function defsOf(body) {
    var out = [], seen = {};
    if (!body) return out;
    EE('table', body).forEach(function (tb) {
      var headRow = tb.querySelector('thead tr') || tb.querySelector('tr');
      if (!headRow) return;
      var heads = EE('th, td', headRow);
      var cols = [];
      heads.forEach(function (h, i) { if (i > 0 && DEFCOL.test(bi(h).en + ' ' + bi(h).zh)) cols.push(i); });
      if (!cols.length) return;
      var rows = EE('tbody tr', tb);
      if (!rows.length) rows = EE('tr', tb).slice(1);
      rows.forEach(function (tr) {
        var cells = EE('td, th', tr);
        if (cells.length < 2) return;
        var t = bi(cells[0]);
        if (!t.en) return;
        cols.forEach(function (ci) {
          if (ci >= cells.length) return;
          var d = bi(cells[ci]);
          if (!d.en || d.en === t.en) return;
          var k = t.en.toLowerCase();
          if (seen[k]) return;
          seen[k] = 1;
          out.push({ t: t, d: d });
        });
      });
    });
    return out;
  }

  /* ── build the outline ─────────────────────────────────────────────────── */
  function build() {
    var chapters = [];
    EE('section[id^="s"]').forEach(function (sec) {
      var h2 = E('h2', sec);
      var lab = E('.section-label', sec);
      var items = EE('.acc-item', sec);
      if (!h2 || !items.length) return;
      var t = bi(h2);
      /* "Lesson 3" comes from the page's own label, so the two can never
         disagree; the number is lifted out of it. */
      var n = 0;
      if (lab) {
        var m = /(\d+)/.exec(bi(lab).en || '');
        if (m) n = +m[1];
      }
      if (!n) n = chapters.length + 1;
      var code0 = sec.id.toUpperCase();
      var sections = items.map(function (it, i) {
        var hd = E('.acc-header', it);
        var h = bi(hd);
        /* Both languages carry the code ("1.1 Atoms…" / "1.1 原子…"), so BOTH
           are stripped. Stripping only the English one left the Chinese title
           reading "1.1 1.1 原子、元素与物质". */
        var m = /^([0-9]+(?:\.[0-9]+)*)\s*[.、:：]?\s*(.*)$/.exec(h.en);
        var code = m ? m[1] : code0 + '.' + (i + 1);
        var en = (m ? m[2] : h.en) || h.en;
        var mz = new RegExp('^' + code.replace(/\./g, '\\.') + '\\s*[.、:：]?\\s*(.*)$').exec(h.zh);
        return {
          code: code,
          en: en,
          zh: (mz && mz[1]) ? mz[1] : h.zh,
          body: E('.acc-body-inner', it),
          index: i
        };
      });
      chapters.push({ n: n, code: code0, en: t.en, zh: t.zh, sections: sections });
    });
    return chapters;
  }

  var chapters = build();

  /* ── per-chapter question and card counts, read off the page's own data ──
     BANK and CARDS live inside an IIFE, so the page exposes them (one line,
     window.G10BANK / window.G10CARDS). The older 10-question set is a top-level
     var in a classic script, so window.G10QS is already reachable. Nothing is
     typed in here. */
  var bank = window.G10BANK || [];
  var cards = window.G10CARDS || [];
  function unitCount(arr, n) {
    var k = 0;
    for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i].unit === n) k++;
    return k;
  }
  function cardsFor(n) { return unitCount(cards, n); }
  function questionsFor(n) { return unitCount(bank, n); }

  /* ── reference entries: the page's own sections that are not N.M items ── */
  var reference = [];
  (function () {
    var ref = E('#s6');
    if (ref) {
      var h = bi(E('h2', ref));
      reference.push({
        id: 's6', icon: 'grid', en: h.en, zh: h.zh,
        sub: { en: 'Every macromolecule, side by side', zh: '各类大分子对照' },
        count: { en: countOf(ref) + ' rows', zh: countOf(ref) + ' 行' }
      });
    }
    var prac = E('#quiz-g10');
    if (prac) {
      var h2 = bi(E('h2', prac));
      reference.push({
        id: 'quiz-g10', icon: 'mcq', en: h2.en, zh: h2.zh,
        sub: { en: 'Interactive models and a 10-question quiz', zh: '交互模型与十题测验' },
        count: { en: (window.G10QS ? window.G10QS.length : 0) + ' questions', zh: (window.G10QS ? window.G10QS.length : 0) + ' 道题' }
      });
    }
  })();
  function countOf(root) {
    var t = E('table', root);
    return t ? EE('tbody tr', t).length : 0;
  }

  /* ── mount ─────────────────────────────────────────────────────────────── */
  var all = [];
  chapters.forEach(function (c) { c.sections.forEach(function (s) { all.push(s); }); });

  var readSet = pj('read', []);
  function isRead(code) {
    for (var i = 0; i < all.length; i++) if (all[i].code === code) return readSet.indexOf(all[i].index) > -1;
    return false;
  }
  function markRead(code) {
    for (var i = 0; i < all.length; i++) {
      if (all[i].code !== code) continue;
      if (readSet.indexOf(all[i].index) > -1) return;
      readSet.push(all[i].index);
      ps('read', readSet);
      ps('last', { i: all[i].index, t: Date.now() });
      return;
    }
  }

  window.CourseHub.mount({
    hubMount: '#chHub',
    headMount: '#chCourseHead',
    pageBody: '#chPageBody',

    subject: { en: 'G10 Biology', zh: '十年级生物' },
    kicker: { en: 'G10 Biology · First-to-last course', zh: 'G10 生物 · 从头到尾课程' },
    headline: { en: 'Study the whole course', zh: '从第一章开始学习' },
    blurb: {
      en: 'First-to-last course. Five lessons, ' + all.length + ' sections, every one of them drillable.',
      zh: '从第一节到最后一节。五个单元、' + all.length + ' 个小节，每一节都可以自测。'
    },
    chapters: chapters,
    tabs: [
      { id: 'resources', en: 'Resources', zh: '资源' },
      { id: 'progress', en: 'Lessons & progress', zh: '单元与进度' }
    ],

    progress: { isRead: isRead, markRead: markRead },

    defsFor: function (s) { return defsOf(s.body); },
    drillFor: function (s) {
      var out = [];
      defsOf(s.body).forEach(function (d) { out.push(d.t.en, d.t.zh); });
      /* A term has to be long enough to be worth recalling and must actually
         occur in the section's prose, or the drill is just noise. */
      var prose = (s.body ? s.body.textContent : '').toLowerCase();
      return out.filter(function (t) {
        t = String(t || '');
        return t.length > 3 && prose.indexOf(t.toLowerCase()) > -1;
      });
    },

    headActions: [
      {
        en: 'Practice all ' + bank.length, zh: '练习全部 ' + bank.length, primary: true,
        onClick: function () { if (window.G10Q) window.G10Q.open(); }
      },
      {
        en: 'Flashcards', zh: '闪卡',
        onClick: function () { if (window.G10F) window.G10F.open(); }
      },
      {
        en: 'Practice & models', zh: '练习与模型',
        onClick: function () { location.hash = '#raw/quiz-g10'; }
      }
    ],

    practice: [
      {
        icon: 'mcq', en: 'Practice all lessons', zh: '全课程练习',
        sub: { en: 'Every unit, one question at a time', zh: '全部单元，逐题作答' },
        count: { en: bank.length + ' questions', zh: bank.length + ' 道题' },
        onClick: function () { if (window.G10Q) window.G10Q.open(); }
      },
      {
        icon: 'flash', en: 'Flashcards', zh: '闪卡',
        sub: { en: 'Active recall on the key terms', zh: '用主动回忆记住术语' },
        count: { en: cards.length + ' cards', zh: cards.length + ' 张卡' },
        onClick: function () { if (window.G10F) window.G10F.open(); }
      }
    ],

    reference: reference,

    /* per-lesson counts, used by nothing yet but available to a future header */
    _unitCounts: { questionsFor: questionsFor, cardsFor: cardsFor }
  });

  /* A count the hub cannot derive is a bug, so say so loudly rather than
     showing a zero. */
  if (!all.length) console.warn('[g10-course] found no sections — the outline is empty');
})();
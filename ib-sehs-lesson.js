/* ═══════════════════════════════════════════════════════════════════════════
   IB SEHS · focus lesson + hub

   Two screens, one page, hash-routed:

     #                 →  HUB.  Subject header, a topics-and-progress view
                           grouped A.1 / A.2 / A.3, a per-topic detail panel
                           with derived counts and resource tiles, and the list
                           of lessons with a tick each.
     #lesson/A.1.1     →  READER. One topic, one block per click, no site chrome.

   Nothing is re-authored. The engine reads the files the course page already
   loads — IBSEHS_TOPICS, IBSEHS_NATIVE, IB_SECTION_ZH, IB_DEEP, IB_VISUALS —
   and derives the definitions, key idea, figures, tables, numbers, mistakes,
   flashcards and questions from them. IBSEHS_LESSON adds the summary sentences
   plus one analogy and one example per section.

   The interactive models come from ib-sehs-models.js, which is given exactly the
   DOM shape it expects (a .native-section wrapping a .vis-figure whose
   .vis-svg-scroll it swaps for its own slot) so the reader shows the designed
   models rather than the flat static figure.

   Conventions copied from ib-sehs-course.js so the pages agree:
     showCN = localStorage.sm_lang === 'zh';  body.lang-zh / body.lang-en
     dark   = localStorage.dark  === 'true';   body.dark
     **term** becomes <b class="kt">, escape-first
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var NATIVE = window.IBSEHS_NATIVE || [];
  var TOPICS = window.IBSEHS_TOPICS || [];
  var SECZH = window.IB_SECTION_ZH || {};
  var DEEP = window.IB_DEEP || {};
  var VIS = window.IB_VISUALS || {};
  var AUTHORED = window.IBSEHS_LESSON || {};
  var MODELS_API = window.IBSEHSModels || null;

  var CHAPTERS = [
    { n: 1, id: 'ib-ch1', start: 0, end: 9, en: 'Exercise Physiology & Nutrition', zh: '运动生理与营养',
      group: { en: 'A.1 Communication', zh: 'A.1 通讯' } },
    { n: 2, id: 'ib-ch2', start: 9, end: 18, en: 'Biomechanics', zh: '生物力学',
      group: { en: 'A.2 Movement', zh: 'A.2 运动' } },
    { n: 3, id: 'ib-ch3', start: 18, end: 29, en: 'Psychology & Motor Learning', zh: '心理与动作学习',
      group: { en: 'A.3 Response', zh: 'A.3 反应' } }
  ];

  var PKEY = 'sm_ibsehs_lesson';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var showCN = false, dark = false;
  var ST = { i: 0, done: {}, blanks: {} };

  /* ── helpers ─────────────────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
  function rich(src) { return esc(src).replace(/\*\*(.+?)\*\*/g, '<b class="kt">$1</b>'); }
  function T(en, zh) { return showCN ? (zh == null ? en : zh) : en; }
  function term(o, zh) { return (o && typeof o === 'object') ? T(o.en, o.zh) : T(o, zh); }
  /* dedupe key for a raw term pair; using the object itself coerced to
     "[object Object]" and collided across every term */
  function keyOf(x) { return String(x && x.t && x.t.en ? x.t.en : x); }
  /* Split a raw bilingual value into [en, zh]. The recurring mistake was
     `richNode(n, pair(o)[0], pair(o)[1])` — which resolves the pair ONCE and hands
     the same already-translated string to both languages, so there is nothing
     left to switch and the node stays frozen in the language that was active
     when the lesson was built. */
  function pair(o) {
    if (o && typeof o === 'object') return [o.en, o.zh];
    return [o, undefined];
  }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  /* plain bilingual node: re-read in place on a language change */
  function plain(node, en, zh) {
    node.setAttribute('data-en', en == null ? '' : en);
    node.setAttribute('data-zh', zh == null ? '' : zh);
    node.textContent = T(en, zh);
    return node;
  }
  function richNode(node, en, zh) {
    node.setAttribute('data-rich', '1');
    node._rich = { en: rich(en), zh: rich(zh) };
    node.innerHTML = showCN ? node._rich.zh : node._rich.en;
    return node;
  }
  function refreshAll(root) {
    root = root || document;
    $$('[data-en][data-zh]', root).forEach(function (n) {
      if (n._rich) return;
      n.textContent = T(n.getAttribute('data-en'), n.getAttribute('data-zh'));
    });
    $$('[data-rich]', root).forEach(function (n) {
      if (!n._rich) return;
      n.innerHTML = showCN ? n._rich.zh : n._rich.en;
      if (n.classList.contains('ib-sum')) applyBlanks(n);
    });
  }

  /* icons are SVG STRINGS, so they need innerHTML. el() sets textContent, which
     escaped the markup and printed "<svg viewBox=…" as literal text. */
  function iconEl(cls, name) {
    var n = el('span', cls);
    n.innerHTML = ICON[name] || '';
    return n;
  }

  var ICON = {
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12H8l-4 4z"/></svg>',
    idea: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    def: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h9M5 9h9M5 14h6"/><path d="M17 20l4-4-2-2-4 4-1 1z"/></svg>',
    analogy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V6a2.5 2.5 0 0 1 5 0v7"/><path d="M13 11V5a2.5 2.5 0 0 1 5 0v8"/><path d="M18 12V9a2.5 2.5 0 0 1 5 0v6a6 6 0 0 1-6 6h-3a7 7 0 0 1-6-3.3L5 13.5A2 2 0 0 1 8.5 11L10 13"/></svg>',
    example: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>',
    flash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7a3 3 0 0 1 3 3v11a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 5h-7a3 3 0 0 0-3 3v11a2.5 2.5 0 0 1 2.5-2.5H20z"/></svg>',
    mcq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h13"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'
  };

  /* ── the chapter, its topics, and each topic's sections ──────────────── */

  function chapters() { return CHAPTERS; }

  function topicOf(code) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i] && TOPICS[i].code === code) return TOPICS[i];
    return null;
  }
  function chapterOf(code) {
    for (var i = 0; i < CHAPTERS.length; i++) {
      var c = CHAPTERS[i];
      for (var j = c.start; j < c.end && j < TOPICS.length; j++) {
        if (TOPICS[j] && TOPICS[j].code === code) return c;
      }
    }
    return CHAPTERS[0];
  }
  function sectionsOf(code) {
    var t = topicOf(code); if (!t) return [];
    var rec = null;
    for (var i = 0; i < NATIVE.length; i++) if (NATIVE[i].code === code) { rec = NATIVE[i]; break; }
    if (!rec) return [];
    return (rec.sections || []).map(function (sec) {
      return { topic: t, rec: rec, sec: sec, key: sec.title, zh: SECZH[sec.title] || '', code: code };
    });
  }
  function topicList(ch) {
    var out = [];
    for (var i = ch.start; i < ch.end && i < TOPICS.length; i++) {
      if (TOPICS[i]) out.push({ code: TOPICS[i].code, t: TOPICS[i], secs: sectionsOf(TOPICS[i].code) });
    }
    return out;
  }

  /* Derived counts for a topic. Every number is counted from the data that
     actually renders, so a count can never disagree with the content. */
  function countsOf(code) {
    var secs = sectionsOf(code), terms = 0, q = 0, notes = 0, figs = 0;
    secs.forEach(function (s) {
      terms += (s.sec.terms || []).filter(function (t) { return t && t.term && t.definition; }).length;
      var D = DEEP[s.key] || {}, V = VIS[s.key] || {};
      q += 1;                                    /* one question per section   */
      if (D.numbers) notes += 1;
      if (D.mistakes && D.mistakes.length) notes += 1;
      if (D.why) notes += 1;
      figs += (V.figures || []).length;
    });
    return { sections: secs.length, terms: terms, questions: q, notes: notes, figures: figs };
  }

  /* ── progress store ──────────────────────────────────────────────────── */

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(PKEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function saveAll(all) {
    try { localStorage.setItem(PKEY, JSON.stringify(all)); } catch (e) {}
  }
  function slotFor(code) {
    var all = loadAll();
    return all[code] || { i: 0, done: {}, blanks: {}, ts: 0 };
  }
  function writeSlot(code, patch) {
    var all = loadAll();
    all[code] = Object.assign({ i: 0, done: {}, blanks: {}, ts: 0 }, all[code] || {}, patch);
    saveAll(all);
    ST = all[code];
  }
  /* Six levels, ordered. Thresholds are on the fraction of a topic's sections
     actually read. */
  var LEVELS = [
    { k: 'mastered', en: 'Mastered', zh: '掌握', next: null },
    { k: 'proficient', en: 'Proficient', zh: '熟练', next: 'mastered' },
    { k: 'familiar', en: 'Familiar', zh: '熟悉', next: 'proficient' },
    { k: 'learning', en: 'Learning', zh: '学习中', next: 'familiar' },
    { k: 'unfamiliar', en: 'Unfamiliar', zh: '不熟悉', next: 'learning' },
    { k: 'unseen', en: 'Unseen', zh: '未开始', next: 'unfamiliar' }
  ];
  function levelOf(code) {
    var secs = sectionsOf(code);
    if (!secs.length) return LEVELS[5];
    var done = slotFor(code).done || {};
    var n = secs.filter(function (_, i) { return done[i]; }).length;
    var p = n / secs.length;
    if (p >= 1) return LEVELS[0];
    if (p >= 0.75) return LEVELS[1];
    if (p >= 0.5) return LEVELS[2];
    if (p > 0) return LEVELS[3];
    return LEVELS[5];
  }
  function chapterComplete(ch) {
    return topicList(ch).every(function (row) {
      var secs = row.secs, done = (slotFor(row.code).done || {});
      return secs.length && secs.every(function (_, i) { return done[i]; });
    });
  }

  /* ── slide construction ──────────────────────────────────────────────── */

  var ICON_FOR = {};

  function buildSlides(code) {
    var secs = sectionsOf(code);
    var slides = [{ t: 'cover', code: code, secs: secs }];
    /* RAW pairs, never pre-resolved. Resolving here froze the language at build
       time, so an analogy card or a question option stayed English when the
       reader was switched to 中文. */
    var pool = [];
    secs.forEach(function (s) {
      (s.sec.terms || []).forEach(function (tm) {
        if (tm && tm.term && tm.definition) pool.push({ t: tm.term, d: tm.definition });
      });
    });
    var used = {};

    secs.forEach(function (s, si) {
      var A = AUTHORED[s.key] || {}, D = DEEP[s.key] || {}, V = VIS[s.key] || {};
      slides.push({ t: 'sec', si: si, s: s });
      (A.sum && A.sum.length ? A.sum : (s.sec.paragraphs || [])).forEach(function (p) {
        slides.push({ t: 'sum', p: p });
      });
      if (A.analogy) slides.push({ t: 'card', kind: 'analogy', label: { en: 'Analogy', zh: '类比' }, body: A.analogy });
      if ((s.sec.bullets || []).length) {
        slides.push({ t: 'card', kind: 'idea', label: { en: 'Key idea', zh: '要点' },
                      body: { en: 'The short version:', zh: '本节的要点：' }, list: s.sec.bullets });
      }
      (s.sec.terms || []).forEach(function (tm) {
        if (tm && tm.term && tm.definition) {
          slides.push({ t: 'def', term: tm.term, def: tm.definition, key: s.key });
        }
      });
      if (A.example) slides.push({ t: 'card', kind: 'example', label: { en: 'Example', zh: '举例' }, body: A.example });
      (V.figures || []).forEach(function (f) { slides.push({ t: 'fig', f: f, key: s.key }); });
      (V.tables || []).forEach(function (tb) { slides.push({ t: 'tbl', tb: tb }); });
      if (V.example) {
        slides.push({ t: 'card', kind: 'example', label: { en: 'Worked example', zh: '例题' },
                      body: V.example.given || V.example.title || { en: '', zh: '' },
                      list: V.example.steps, note: V.example.answer });
      }
      if (D.numbers) slides.push({ t: 'card', kind: 'note', label: { en: 'Numbers worth keeping', zh: '必记数字' }, body: D.numbers });
      if ((D.mistakes || []).length) {
        slides.push({ t: 'card', kind: 'note', label: { en: 'Careful — this loses marks', zh: '易丢分' }, body: D.mistakes[0] });
      }
      var own = (s.sec.terms || []).filter(function (tm) { return tm && tm.term && tm.definition; });
      if (own.length) {
        var f0 = own[Math.floor(Math.random() * own.length)];
        slides.push({ t: 'flash', q: f0.term, a: f0.definition });   /* raw pairs */
      }
      var cand = pool.filter(function (x) { return !used[keyOf(x)]; });
      if (cand.length >= 4) {
        var pick = cand[Math.floor(Math.random() * cand.length)];
        used[keyOf(pick)] = 1;
        var opts = [pick.d].concat(cand.filter(function (x) { return x !== pick; })
          .sort(function () { return Math.random() - 0.5; }).slice(0, 3).map(function (x) { return x.d; }));
        opts.sort(function () { return Math.random() - 0.5; });
        /* the term and the definition are RAW pairs here, so both languages of
           the hint and the explanation have to be written out — resolving one
           of them at build time froze it in whatever language was active. */
        var tEn = pick.t.en, tZh = pick.t.zh, dEn = pick.d.en, dZh = pick.d.zh;
        slides.push({
          t: 'mcq',
          q: { en: 'What does the term “' + tEn + '” mean?', zh: '术语「' + tZh + '」是什么意思？' },
          opts: opts, a: opts.indexOf(pick.d),
          hint: { en: 'It begins: “' + String(dEn).slice(0, 26) + '…”',
                  zh: '开头是：「' + String(dZh).slice(0, 26) + '…」' },
          why: { en: '“' + tEn + '” is defined as: ' + dEn,
                 zh: '「' + tZh + '」的定义是：' + dZh }
        });
      }
    });
    slides.push({ t: 'done', code: code });
    return slides;
  }

  /* ── READER ──────────────────────────────────────────────────────────── */

  var slides = [], rendered = [], idx = 0, code = null;
  var readEl, footBack, footNext, fillEl, countEl, railEl, mapEl, glossEl;

  function svgNode(svg, viewBox) {
    var f = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    f.setAttribute('viewBox', viewBox || '0 0 560 340');
    f.setAttribute('class', 'vis-svg');
    f.innerHTML = svg;
    return f;
  }

  function buildSlide(s, si) {
    switch (s.t) {
      case 'cover': {
        var ch = chapterOf(s.code), t = topicOf(s.code);
        var w = el('header', 'ib-block ib-cover');
        var k = el('div', 'ib-cover__kicker');
        k.appendChild(document.createTextNode(T('Chapter ' + ch.n + ' · ' + (t && t.code ? t.code : ''),
          '第' + ch.n + '章 · ' + (t && t.code ? t.code : ''))));
        w.appendChild(k);
        var h = plain(el('h1', 'ib-cover__title'), (t && (t.en || t.title)) || '', (t && (t.zh || t.title)) || '');
        w.appendChild(h);
        var m = plain(el('p', 'ib-cover__meta'),
          s.secs.length + ' sections · press Next to begin',
          '共 ' + s.secs.length + ' 节 · 按下一句开始');
        w.appendChild(m);
        return w;
      }
      case 'sec': {
        var q = el('section', 'ib-block ib-sec');
        q.id = 'ib-sec-' + s.si;
        var lab = el('div', 'ib-sec__label');
        lab.innerHTML = ICON.note;
        lab.appendChild(document.createTextNode(s.s.topic.code));
        q.appendChild(lab);
        q.appendChild(plain(el('h2', 'ib-sec__title'), s.s.key, s.s.zh || s.s.key));
        return q;
      }
      case 'sum': {
        var n = el('p', 'ib-block ib-sum');
        richNode(n, s.p.en, s.p.zh);
        n.id = 'ib-sum-' + si;
        applyBlanks(n);
        return n;
      }
      case 'card': return buildCard(s);
      case 'def': {
        var c = el('div', 'ib-block ib-card ib-card--def');
        var l = el('div', 'ib-card__label'); l.innerHTML = ICON.def;
        l.appendChild(document.createTextNode(T('Definition', '定义')));
        c.appendChild(l);
        c.appendChild(richNode(el('div', 'ib-def__term'), pair(s.term)[0], pair(s.term)[1]));
        c.appendChild(richNode(el('p', 'ib-card__body'), pair(s.def)[0], pair(s.def)[1]));
        addGlossary(s.term, s.def);
        return c;
      }
      case 'fig': {
        var f = el('div', 'ib-block ib-fig');
        f.appendChild(plain(el('p', 'ib-fig__title'), pair(s.f.title)[0], pair(s.f.title)[1]));
        /* The exact shape ib-sehs-models.js looks for: it finds the section's
           h3[data-en] for the title, then swaps .vis-svg-scroll for its own slot
           and keeps the static SVG as the failure fallback. */
        var sec = el('div', 'native-section');
        var h3 = el('h3', 'ib-sr');
        h3.setAttribute('data-en', s.key);
        h3.textContent = s.key;
        sec.appendChild(h3);
        var fig = el('figure', 'vis-figure');
        var scroll = el('div', 'vis-svg-scroll');
        scroll.appendChild(svgNode(s.f.svg, s.f.viewBox));
        fig.appendChild(scroll);
        sec.appendChild(fig);
        f.appendChild(sec);
        f._modelPending = !!MODELS_API && !!window.IBSEHSModels;
        if ((s.f.legend || []).length) {
          var lg = el('ul', 'ib-fig__legend');
          s.f.legend.forEach(function (x) { lg.appendChild(plain(el('li'), pair(x)[0], pair(x)[1])); });
          f.appendChild(lg);
        }
        if (s.f.caption) f.appendChild(plain(el('p', 'ib-fig__cap'), pair(s.f.caption)[0], pair(s.f.caption)[1]));
        return f;
      }
      case 'tbl': {
        var w2 = el('div', 'ib-block ib-tbl');
        w2.appendChild(plain(el('p', 'ib-tbl__title'), pair(s.tb.title)[0], pair(s.tb.title)[1]));
        var wrap = el('div', 'ib-tbl__wrap');
        var tb = el('table');
        var th = el('tr');
        (s.tb.cols || []).forEach(function (cc) { th.appendChild(plain(el('th'), pair(cc)[0], pair(cc)[1])); });
        tb.appendChild(th);
        (s.tb.rows || []).forEach(function (row) {
          var tr = el('tr');
          row.forEach(function (cell) { tr.appendChild(richNode(el('td'), pair(cell)[0], pair(cell)[1])); });
          tb.appendChild(tr);
        });
        wrap.appendChild(tb);
        w2.appendChild(wrap);
        if (s.tb.note) w2.appendChild(plain(el('p', 'ib-tbl__note'), pair(s.tb.note)[0], pair(s.tb.note)[1]));
        return w2;
      }
      case 'flash': {
        var fx = el('div', 'ib-block ib-flash');
        var fl = el('div', 'ib-flash__label'); fl.innerHTML = ICON.flash;
        fl.appendChild(plain(el('span'), T('Flashcard', '闪卡'), T('Flashcard', '闪卡')));
        fx.appendChild(fl);
        var cd = el('div', 'ib-flash__card');
        cd.setAttribute('role', 'button');
        cd.setAttribute('tabindex', '0');
        var qq = plain(el('div', 'ib-flash__q'),
          T('What is “' + term(s.q) + '”?', '什么是「' + term(s.q) + '」？'),
          T('What is “' + term(s.q) + '”?', '什么是「' + term(s.q) + '」？'));
        cd.appendChild(qq);
        function flip() {
          fx.classList.toggle('is-flipped');
          if (fx.classList.contains('is-flipped')) {
            qq.removeAttribute('data-en'); qq.removeAttribute('data-zh');
            qq.textContent = term(s.a);
          } else {
            plain(qq, T('What is “' + term(s.q) + '”?', '什么是「' + term(s.q) + '」？'),
                     T('What is “' + term(s.q) + '”?', '什么是「' + term(s.q) + '」？'));
          }
        }
        cd.addEventListener('click', flip);
        cd.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
        fx.appendChild(cd);
        fx.appendChild(plain(el('p', 'ib-flash__hint'), T('Tap the card to flip', '轻点卡片翻面'), T('Tap the card to flip', '轻点卡片翻面')));
        return fx;
      }
      case 'mcq': return buildMcq(s);
      case 'done': {
        var d = el('div', 'ib-block ib-done');
        d.appendChild(el('h2', 'ib-done__big', T('Topic complete', '本节完成')));
        var c2 = countsOf(s.code), done = (slotFor(s.code).done || {});
        var seen = sectionsOf(s.code).filter(function (_, i) { return done[i]; }).length;
        d.appendChild(el('p', 'ib-done__stats',
          T(seen + ' of ' + c2.sections + ' sections read · ' + c2.terms + ' key terms · ' +
            c2.questions + ' questions · ' + c2.notes + ' notes',
            '已阅读 ' + seen + ' / ' + c2.sections + ' 节 · ' + c2.terms + ' 个术语 · ' +
            c2.questions + ' 道题 · ' + c2.notes + ' 条笔记')));
        var acts = el('div', 'ib-done__acts');
        var hub = el('button', 'ib-foot__btn', T('Back to topics', '返回目录'));
        hub.addEventListener('click', function () { location.hash = '#'; });
        acts.appendChild(hub);
        var again = el('button', 'ib-foot__btn ib-foot__btn--next', T('Read again', '再读一遍'));
        again.addEventListener('click', function () { openReader(code, true); });
        acts.appendChild(again);
        d.appendChild(acts);
        return d;
      }
    }
    return el('div', 'ib-block');
  }

  function buildCard(s) {
    var c = el('div', 'ib-block ib-card ib-card--' + s.kind);
    var l = el('div', 'ib-card__label'); l.innerHTML = ICON[s.kind] || ICON.note;
    l.appendChild(plain(el('span'), pair(s.label)[0], pair(s.label)[1]));
    c.appendChild(l);
    c.appendChild(richNode(el('p', 'ib-card__body'), pair(s.body)[0], pair(s.body)[1]));
    if (s.list && s.list.length) {
      var ul = el('ul');
      s.list.forEach(function (x) { ul.appendChild(richNode(el('li'), pair(x)[0], pair(x)[1])); });
      c.appendChild(ul);
    }
    if (s.note) c.appendChild(plain(el('p', 'ib-card__note'), pair(s.note)[0], pair(s.note)[1]));
    return c;
  }

  function buildMcq(s) {
    var w = el('div', 'ib-block ib-mcq');
    var l = el('div', 'ib-mcq__label'); l.innerHTML = ICON.mcq;
    l.appendChild(plain(el('span'), T('Check yourself', '自我检测'), T('Check yourself', '自我检测')));
    w.appendChild(l);
    w.appendChild(plain(el('p', 'ib-mcq__q'), pair(s.q)[0], pair(s.q)[1]));
    var box = el('p', 'ib-mcq__why');
    box.hidden = true;
    var hb = el('button', 'ib-mcq__hintbtn', T('Hint', '提示'));
    hb.addEventListener('click', function () { box.hidden = false; plain(box, pair(s.hint)[0], pair(s.hint)[1]); });
    w.appendChild(hb);
    var answered = false;
    s.opts.forEach(function (o, i) {
      var b = el('button', 'ib-mcq__opt');
      b.appendChild(el('span', 'ib-mcq__key', 'ABCD'[i]));
      b.appendChild(richNode(el('span'), pair(o)[0], pair(o)[1]));
      b.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        $$('.ib-mcq__opt', w).forEach(function (x) { x.disabled = true; });
        b.classList.add(i === s.a ? 'is-right' : 'is-wrong');
        if (i !== s.a) { var r = $$('.ib-mcq__opt', w)[s.a]; if (r) r.classList.add('is-right'); }
        box.hidden = false;
        plain(box, pair(s.why)[0], pair(s.why)[1]);
      });
      w.appendChild(b);
    });
    w.appendChild(box);
    return w;
  }

  /* Build every node up to i, once. Back then only REVEALS, never appends. */
  function ensure(i) {
    while (rendered.length <= i && rendered.length < slides.length) {
      var k = rendered.length;
      var node = buildSlide(slides[k], k);
      node.hidden = k > i;
      node.classList.add('ib-block');
      rendered.push(node);
      readEl.appendChild(node);
      if (slides[k].t === 'sec') markSection(slides[k].si);
    }
  }

  function markSection(si) {
    var all = loadAll();
    var c = all[code] || { i: 0, done: {}, blanks: {} };
    c.done = Object.assign({}, c.done);
    if (!c.done[si]) { c.done[si] = 1; c.ts = Date.now(); saveAll(all); ST = c; }
  }

  function show(i, animate) {
    i = Math.max(0, Math.min(i, slides.length - 1));
    ensure(i);
    idx = i;
    rendered.forEach(function (n, k) {
      n.hidden = k > i;
      n.classList.toggle('ib-now', k === i);
      n.classList.toggle('ib-recede', k < i);
      /* models measure geometry, so only the visible one is live */
      if (window.IBSEHSModels && n.classList.contains('native-section') === false && n.querySelector('.native-section')) {
        if (k === i) { try { window.IBSEHSModels.build(n); } catch (e) {} }
        else { try { window.IBSEHSModels.stop(n); } catch (e) {} }
      }
    });
    var node = rendered[i];
    if (node) {
      var y = node.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top: Math.max(0, y), behavior: animate === false ? 'auto' : 'smooth' });
    }
    var last = i >= slides.length - 1;
    footBack.disabled = i === 0;
    footNext.disabled = last && slides[i] && slides[i].t === 'done';
    labelNext();
    fillEl.style.width = slides.length > 1 ? Math.round(i / (slides.length - 1) * 100) + '%' : '0%';
    countEl.textContent = (i + 1) + ' / ' + slides.length;
    writeSlot(code, { i: i });
    paintRail();
  }

  function labelNext() {
    var s = slides[idx] || { t: 'cover' };
    var cont = (s.t === 'mcq' || s.t === 'flash');
    var en = s.t === 'done' ? 'Close' : (cont ? 'Continue' : 'Next');
    var zh = s.t === 'done' ? '关闭' : (cont ? '继续' : '下一句');
    footNext.setAttribute('data-en', en);
    footNext.setAttribute('data-zh', zh);
    footNext.innerHTML = '';
    footNext.appendChild(document.createTextNode(T(en, zh)));
    footNext.insertAdjacentHTML('beforeend', ' ' + ICON.chev);
  }

  /* ── rail: chapter map + live glossary ──────────────────────────────── */

  function paintRail() {
    if (!mapEl) return;
    var secs = sectionsOf(code), done = (ST.done || {});
    $$('.ib-map__sec', mapEl).forEach(function (b) {
      var i = Number(b.dataset.si);
      b.classList.toggle('is-now', i === idx);
      b.classList.toggle('is-done', !!done[i]);
    });
  }
  function buildRail() {
    if (!mapEl) return;
    mapEl.innerHTML = '';
    sectionsOf(code).forEach(function (s, i) {
      var li = el('li');
      var b = el('button', 'ib-map__sec');
      b.type = 'button';
      b.dataset.si = i;
      b.appendChild(el('span', 'ib-map__tick', '✓'));
      b.appendChild(el('span', null, T(s.key, s.zh || s.key)));
      b.addEventListener('click', function () {
        /* jump to that section's opening block */
        var target = slides.findIndex(function (sl) { return sl.t === 'sec' && sl.si === i; });
        if (target >= 0) show(target);
        closeRail();
      });
      li.appendChild(b);
      mapEl.appendChild(li);
    });
    glossEl.innerHTML = '';
    var all = loadAll();
    var g = (all.__gloss || []);
    if (!g.length) {
      glossEl.appendChild(el('li', 'ib-gloss__empty',
        T('Definitions you pass collect here.', '读过的定义会自动收集到这里。')));
    } else {
      g.forEach(function (row) {
        var li = el('li');
        /* Stored entries are RAW pairs so the glossary follows the language
           toggle. A row of two plain strings is an entry saved by the earlier
           build, so fall back to showing it as written. */
        var raw = row.raw || null;
        li.appendChild(plain(el('b'), raw ? pair(raw.t)[0] : row[0], raw ? pair(raw.t)[1] : row[0]));
        li.appendChild(plain(el('span'), raw ? pair(raw.d)[0] : row[1], raw ? pair(raw.d)[1] : row[1]));
        glossEl.appendChild(li);
      });
    }
  }
  function addGlossary(tRaw, dRaw) {
    var te = pair(tRaw)[0], de = pair(dRaw)[0];
    if (!te || !de) return;
    var all = loadAll();
    var g = all.__gloss || [];
    var already = g.some(function (x) {
      return (x.raw ? pair(x.raw.t)[0] : x[0]) === te;
    });
    if (already) return;
    g.push({ raw: { t: tRaw, d: dRaw } });
    all.__gloss = g;
    saveAll(all);
    if (glossEl) buildRail();
  }
  function closeRail() {
    if (railEl) railEl.classList.remove('is-open');
    var sc = $('#ibScrim'); if (sc) sc.classList.remove('is-open');
  }
  function openRail() {
    if (railEl) railEl.classList.add('is-open');
    var sc = $('#ibScrim'); if (sc) sc.classList.add('is-open');
  }

  /* ── term-blanking drill ─────────────────────────────────────────────── */
  /* Idempotent: restores from the node's own _rich, then re-wraps only if the
     drill is on. An earlier version bailed out when a node had no <b class=kt>
     — but once the drill is on those are already replaced by blanks, so the
     turn-it-off pass skipped every node and nothing could be closed again. */
  function drillOn() {
    var b = $('#ibDrill');
    return !!(b && b.getAttribute('aria-pressed') === 'true');
  }
  function applyBlanks(node) {
    if (!node || !node._rich) return;
    var html = showCN ? node._rich.zh : node._rich.en;
    var blanked = !!node.querySelector('.ib-blank');
    if (!drillOn()) { if (blanked) node.innerHTML = html; return; }
    node.innerHTML = html;
    Array.prototype.slice.call(node.querySelectorAll('b.kt')).forEach(function (b, i) {
      var w = el('button', 'ib-blank');
      w.type = 'button';
      w.textContent = b.textContent;
      w.setAttribute('data-hint', T('tap to reveal', '点击揭晓'));
      w.setAttribute('aria-label', T('Reveal the term', '揭晓术语'));
      var key = (node.id || 'sum') + '#' + i;
      if ((ST.blanks || {})[key]) w.classList.add('is-open');
      w.addEventListener('click', function () {
        w.classList.add('is-open');
        var all = loadAll();
        var c = all[code] || {};
        c.blanks = c.blanks || {};
        c.blanks[key] = 1;
        saveAll(all);
      });
      b.replaceWith(w);
    });
  }
  function applyDrill() { $$('.ib-sum[data-rich]', readEl).forEach(applyBlanks); }

  /* ── reader entry ────────────────────────────────────────────────────── */

  function openReader(c, forceStart) {
    code = c;
    slides = buildSlides(c);
    ST = slotFor(c);
    rendered = [];
    idx = 0;
    document.body.classList.add('ib-reading');
    $('#ibHub').hidden = true;
    $('#ibReader').hidden = false;
    $('#ibRailToggle').hidden = false;
    readEl.hidden = false;
    $('#ibFoot').hidden = false;
    readEl.innerHTML = '';
    glossEl && buildRail();

    var saved = ST.i || 0;
    var ch = chapterOf(c);
    /* If the whole chapter is finished there is nothing to resume, so start
       over without asking. Otherwise ask, because a half-read topic is exactly
       the case where the reader does not know what you want. */
    if (!forceStart && saved > 2 && !chapterComplete(ch)) {
      askResume(saved);
    } else {
      saved = 0;
      begin(saved);
    }
    function begin(at) { show(at, false); }
    function askResume(at) {
      var box = el('div', 'ib-resume');
      box.appendChild(el('h2', 'ib-resume__title',
        T('Welcome back', '欢迎回来')));
      box.appendChild(el('p', 'ib-resume__meta',
        T('You stopped at block ' + (at + 1) + ' of ' + slides.length + '.',
          '你上次读到第 ' + (at + 1) + ' / ' + slides.length + ' 块。')));
      var row = el('div', 'ib-resume__row');
      var cont = el('button', 'ib-foot__btn ib-foot__btn--next',
        T('Continue where I left off', '从上次继续'));
      cont.addEventListener('click', function () { box.remove(); begin(at); });
      var restart = el('button', 'ib-foot__btn', T('Start from the beginning', '从头开始'));
      restart.addEventListener('click', function () { box.remove(); begin(0); });
      row.appendChild(cont);
      row.appendChild(restart);
      box.appendChild(row);
      readEl.appendChild(box);
      box.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }

  /* ── HUB ─────────────────────────────────────────────────────────────── */

  function openHub() {
    document.body.classList.remove('ib-reading');
    /* the whole reader shell goes away on the hub. Hiding only the reading
       column left the rail sitting there as an empty white drawer. */
    $('#ibReader').hidden = true;
    readEl.hidden = true;
    $('#ibFoot').hidden = true;
    $('#ibRailToggle').hidden = true;
    if (fillEl) fillEl.style.width = '0%';
    if (countEl) countEl.textContent = '—';
    var host = $('#ibHub');
    host.hidden = false;
    host.innerHTML = '';
    var ch = CHAPTERS[0];

    var hero = el('header', 'ib-hero');
    hero.appendChild(el('span', 'ib-hero__kicker',
      T('IB SEHS · Chapter 1', 'IB SEHS · 第一章')));
    var h1 = el('h1', 'ib-hero__title', ch.en);
    plain(h1, ch.en, ch.zh);
    hero.appendChild(h1);
    hero.appendChild(el('p', 'ib-hero__sub',
      T(ch.secs ? '' : 'Exercise physiology, nutrition, and how training changes the body.',
        '运动生理、营养，以及训练如何改变身体。')));
    host.appendChild(hero);

    /* progress legend */
    var leg = el('div', 'ib-legend');
    LEVELS.forEach(function (L) {
      var it = el('div', 'ib-legend__item');
      var sq = el('span', 'ib-lev ib-lev--' + L.k);
      it.appendChild(sq);
      it.appendChild(el('span', null, T(L.en, L.zh)));
      leg.appendChild(it);
    });
    host.appendChild(leg);

    var tabs = el('div', 'ib-tabs');
    ['topics', 'detail'].forEach(function (k) {
      var b = el('button', 'ib-tab', k === 'topics'
        ? T('Topics & progress', '主题与进度')
        : T('Topic detail', '主题详情'));
      b.dataset.view = k;
      b.addEventListener('click', function () { hubTab = k; paintHub(); });
      tabs.appendChild(b);
    });
    host.appendChild(tabs);

    host.appendChild(el('div', 'ib-pane', ''));
    paintHub();
  }
  var hubTab = 'topics';

  function paintHub() {
    var host = $('#ibHub');
    var pane = $('.ib-pane', host);
    $$('.ib-tab', host).forEach(function (b) {
      b.classList.toggle('is-on', b.dataset.view === hubTab);
    });
    pane.innerHTML = '';
    var ch = CHAPTERS[0];
    var rows = topicList(ch);

    if (hubTab === 'topics') {
      var groups = {};
      rows.forEach(function (r) {
        var gk = r.code.split('.').slice(0, 2).join('.');   /* "A.1", not "A" */
        (groups[gk] = groups[gk] || []).push(r);
      });
      var GRPNAME = {
        '1': T('Communication', '通讯'),
        '2': T('Hydration & nutrition', '水合与营养'),
        '3': T('Response to training', '训练反应')
      };
      Object.keys(groups).sort().forEach(function (gk) {
        pane.appendChild(el('h3', 'ib-grp__title', gk + ' ' + (GRPNAME[gk.split('.')[1]] || '')));
        var list = el('ul', 'ib-tlist');
        pane.appendChild(list);
        groups[gk].forEach(function (r) {
          var c = countsOf(r.code), lv = levelOf(r.code);
          var done = (slotFor(r.code).done || {});
          var seen = r.secs.filter(function (_, i) { return done[i]; }).length;
          var li = el('li');
          var b = el('button', 'ib-trow');
          b.type = 'button';
          b.appendChild(el('span', 'ib-lev ib-lev--' + lv.k));
          var txt = el('span', 'ib-trow__txt');
          txt.appendChild(el('strong', null, r.code + ' ' + T(r.t.en || r.t.title || '', r.t.zh || '')));
          txt.appendChild(el('span', 'ib-trow__meta',
            seen + '/' + c.sections + ' ' + T('sections', '节') + ' · ' +
            lv.en + ''));
          b.appendChild(txt);          /* was missing: the row rendered as a bare
                                         status square with no label at all */
          b.addEventListener('click', function () {
            hubTopic = r.code;
            hubTab = 'detail';
            paintHub();
          });
          li.appendChild(b);
          list.appendChild(li);
        });
      });
      return;
    }

    /* detail view for one topic */
    var r = rows.filter(function (x) { return x.code === hubTopic; })[0] || rows[0];
    var c = countsOf(r.code), lv = levelOf(r.code);
    var done = slotFor(r.code).done || {};
    var seen = r.secs.filter(function (_, i) { return done[i]; }).length;

    var crumb = el('nav', 'ib-crumb');
    crumb.appendChild(el('span', null, 'IB SEHS'));
    crumb.appendChild(el('span', 'ib-crumb__sep', '/'));
    crumb.appendChild(el('span', null, 'Chapter 1'));
    crumb.appendChild(el('span', 'ib-crumb__sep', '/'));
    crumb.appendChild(el('b', null, r.code));
    pane.appendChild(crumb);
    pane.appendChild(plain(el('h2', 'ib-dt__title'), r.t.en || '', r.t.zh || ''));

    var strip = el('div', 'ib-strip');
    var sl = el('div', 'ib-strip__lev');
    sl.appendChild(el('span', 'ib-lev ib-lev--' + lv.k));
    sl.appendChild(el('strong', null, T(lv.en, lv.zh)));
    var nx = lv.next;
    if (nx) {
      var nL = LEVELS.filter(function (x) { return x.k === nx; })[0];
      sl.appendChild(el('span', 'ib-strip__next',
        T('Next: ', '下一级：') + T(nL.en, nL.zh)));
    }
    strip.appendChild(sl);
    var stat = el('div', 'ib-strip__stats');
    [['Questions', '题目', c.questions, 'questions'],
     ['Notes', '笔记', c.notes, 'notes'],
     ['Sections', '小节', seen + '/' + c.sections, null],
     ['Flashcards', '闪卡', c.terms, 'flashcards']].forEach(function (pair) {
      var b = el('div', 'ib-stat');
      b.appendChild(el('b', null, String(pair[2])));
      b.appendChild(el('span', null, T(pair[0], pair[1])));
      stat.appendChild(b);
    });
    strip.appendChild(stat);
    pane.appendChild(strip);

    var grp = el('div', 'ib-dt__group');
    grp.appendChild(el('p', 'ib-dt__grouphead', T('Learn', '学习')));
    var tiles = el('div', 'ib-tiles');
    var t1 = el('button', 'ib-tile ib-tile--go');
    t1.appendChild(iconEl('ib-tile__ico', 'book'));
    var tb = el('span', 'ib-tile__txt');
    tb.appendChild(el('strong', null, T('Focus lesson', '引导课')));
    tb.appendChild(el('span', null,
      T('Step through this topic one block at a time.', '一次一句读完本主题。')));
    tb.appendChild(el('em', null, T(r.secs.length + ' sections', r.secs.length + ' 节')));
    t1.appendChild(tb);
    t1.addEventListener('click', function () { location.hash = '#lesson/' + r.code; });
    tiles.appendChild(t1);

    var t2 = el('div', 'ib-tile');
    t2.appendChild(iconEl('ib-tile__ico', 'grid'));
    var tb2 = el('span', 'ib-tile__txt');
    tb2.appendChild(el('strong', null, T('Key definitions', '关键定义')));
    tb2.appendChild(el('span', null,
      T('Every key term in this topic, with its definition.', '本主题的全部术语与定义。')));
    tb2.appendChild(el('em', null, c.terms + ' ' + T('terms', '个术语')));
    t2.appendChild(tb2);
    tiles.appendChild(t2);
    grp.appendChild(tiles);
    pane.appendChild(grp);

    pane.appendChild(el('p', 'ib-dt__grouphead', T('Sections in this topic', '本主题的小节')));
    var ul = el('ul', 'ib-seclist');
    r.secs.forEach(function (s, i) {
      var li = el('li');
      var b = el('button', 'ib-secrow');
      b.type = 'button';
      b.appendChild(el('span', 'ib-lev ib-lev--' + (done[i] ? 'familiar' : 'unseen')));
      b.appendChild(el('span', null, T(s.key, s.zh || s.key)));
      b.addEventListener('click', function () { location.hash = '#lesson/' + r.code; });
      li.appendChild(b);
      ul.appendChild(li);
    });
    pane.appendChild(ul);
  }
  var hubTopic = (function () {
    var t = topicList(CHAPTERS[0])[0];
    return t ? t.code : 'A.1.1';
  })();

  /* ── chrome: language, dark, route ──────────────────────────────────── */

  function exit() {
    var back = 'ib-sehs-learn.html#ib-ch1';
    if (document.referrer && /vitaliteplan\.com|localhost|127\.0\.0\.1/.test(document.referrer)) {
      try { if (history.length > 1) { history.back(); return; } } catch (e) {}
    }
    location.href = back;
  }

  function route() {
    var h = (location.hash || '').replace(/^#/, '');
    var m = h.match(/^lesson\/(.+)$/);
    if (m) openReader(m[1]);
    else openHub();
  }

  function boot() {
    try { showCN = localStorage.getItem('sm_lang') === 'zh'; } catch (e) {}
    try { dark = localStorage.getItem('dark') === 'true'; } catch (e) {}
    readEl = $('#ibRead'); footBack = $('#ibBack'); footNext = $('#ibNext');
    fillEl = $('#ibFill'); countEl = $('#ibCount');
    railEl = $('#ibRail'); mapEl = $('#ibMap'); glossEl = $('#ibGloss');

    $('#ibExit').addEventListener('click', exit);
    footNext.addEventListener('click', function () { if (idx < slides.length - 1) show(idx + 1); });
    footBack.addEventListener('click', function () { if (idx > 0) show(idx - 1); });

    $('#ibLang').addEventListener('click', function () {
      showCN = !showCN;
      try { localStorage.setItem('sm_lang', showCN ? 'zh' : 'en'); } catch (e) {}
      applyChrome();
    });
    $('#ibDark').addEventListener('click', function () {
      dark = !dark;
      try { localStorage.setItem('dark', dark ? 'true' : 'false'); } catch (e) {}
      document.body.classList.toggle('dark', dark);
      $('#ibDark').textContent = dark ? '☀' : '☾';
      if (window.IBSEHSModels) { try { window.IBSEHSModels.refresh(); } catch (e) {} }
    });
    $('#ibDrill').addEventListener('click', function () {
      this.setAttribute('aria-pressed', drillOn() ? 'false' : 'true');
      applyDrill();
    });
    $('#ibRailToggle').addEventListener('click', openRail);
    $('#ibRailClose').addEventListener('click', closeRail);
    $('#ibScrim').addEventListener('click', closeRail);
    $('#ibHome').addEventListener('click', function () { location.hash = '#'; });
    $('#ibRailHub').addEventListener('click', function () { location.hash = '#'; closeRail(); });

    document.addEventListener('keydown', function (e) {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (!readEl || readEl.hidden) return;
      if (e.key === 'ArrowRight') { if (idx < slides.length - 1) { e.preventDefault(); show(idx + 1); } }
      else if (e.key === 'ArrowLeft') { if (idx > 0) { e.preventDefault(); show(idx - 1); } }
      else if (e.key === 'Escape') { closeRail(); }
    });
    window.addEventListener('hashchange', route);

    document.body.classList.toggle('lang-zh', showCN);
    document.body.classList.toggle('lang-en', !showCN);
    document.body.classList.toggle('dark', dark);
    $('#ibDark').textContent = dark ? '☀' : '☾';
    route();
    window.IBSEHSLesson = {
      slides: function () { return slides; },
      show: show, open: openReader, hub: openHub,
      counts: countsOf, level: levelOf, chapters: chapters
    };
  }

  function applyChrome() {
    document.body.classList.toggle('lang-zh', showCN);
    document.body.classList.toggle('lang-en', !showCN);
    refreshAll(document);
    if (!readEl || readEl.hidden) { paintHub(); return; }
    /* rich nodes were re-rendered, so the drill has to be re-applied */
    applyDrill();
    if (window.IBSEHSModels) { try { window.IBSEHSModels.refresh(); } catch (e) {} }
    labelNext();
    buildRail();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

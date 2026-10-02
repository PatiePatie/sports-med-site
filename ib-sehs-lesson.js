/* ═══════════════════════════════════════════════════════════════════════════
   IB SEHS · Focus lesson engine

   Reads the existing syllabus data and turns it into a single-pass, full-screen
   lesson you advance one slide at a time. Nothing here re-authors the course;
   every fact, term, figure, table, number and mistake comes from the files the
   normal page already loads:

     window.IBSEHS_TOPICS    topic list (ib-sehs-data.js)
     window.IBSEHS_NATIVE    sections, key terms, bullets, tables (ib-sehs-native.js)
     window.IB_SECTION_ZH    Chinese for each English section heading
     window.IB_DEEP          metaphor / walk / numbers / mistakes / why (ib-sehs-deep.js)
     window.IB_VISUALS       figures, tables, worked examples (ib-sehs-visuals.js)
     window.IBSEHS_LESSON    the authored summary sentences + one analogy and
                              one example per section (ib-sehs-lesson-data.js)

   The authored layer only ever ADDS: if a section has no entry in
   IBSEHS_LESSON the lesson still builds, it just falls back to the syllabus
   prose for its sentences and skips the analogy/example pair.

   Conventions copied from ib-sehs-course.js so the two pages agree:
     - showCN = localStorage.sm_lang === 'zh'; body.lang-zh / body.lang-en
     - dark   = localStorage.dark === 'true';  body.dark
     - **term** becomes <b class="kt">, via the same richText() escape-first rule
     - bilingual nodes carry data-en / data-zh and are re-read on language change
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var NATIVE = window.IBSEHS_NATIVE || [];
  var TOPICS = window.IBSEHS_TOPICS || [];
  var SECZH = window.IB_SECTION_ZH || {};
  var DEEP = window.IB_DEEP || {};
  var VIS = window.IB_VISUALS || {};
  var AUTHORED = window.IBSEHS_LESSON || {};

  /* Chapter 1 is topics[0..8]. CHAPTERS is not exported by ib-sehs-course.js
     (it is inside that file's IIFE), so the range is declared here and checked
     against the topic codes below — if the course ever reorders, the assert
     fires loudly in the console instead of silently teaching the wrong set. */
  var CH = { n: 1, id: 'ib-ch1', start: 0, end: 9,
             en: 'Exercise Physiology & Nutrition',
             zh: '运动生理与营养' };
  var EXPECT = ['A.1.1','A.1.2','A.1.3','A.2.1','A.2.2','A.2.3','A.3.1','A.3.2','A.3.3'];

  var POSKEY = 'ib_lesson_ch1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var showCN = false, dark = false;
  var slides = [], idx = 0, built = 0;
  var state = { done: {}, gloss: [], blanks: {} };

  /* ── small helpers ─────────────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
  /* identical to the course engine's richText: escape first, then **term** */
  function rich(src) {
    return esc(src).replace(/\*\*(.+?)\*\*/g, '<b class="kt">$1</b>');
  }
  function T(en, zh) { return showCN ? (zh == null ? en : zh) : en; }
  /* A node whose text is PLAIN (no **bold**): give it data-en/data-zh and let
     refreshPlain() re-read it. Anything that needs markup goes through
     richNode() instead, which keeps its own _rich copy. */
  function plain(node, en, zh) {
    node.setAttribute('data-en', en == null ? '' : en);
    node.setAttribute('data-zh', zh == null ? '' : zh);
    node.textContent = T(en, zh);
    return node;
  }
  function refreshPlain(root) {
    $$('[data-en][data-zh]', root).forEach(function (n) {
      if (n._rich) return;              /* rich nodes are handled by refreshRich */
      n.textContent = T(n.getAttribute('data-en'), n.getAttribute('data-zh'));
    });
  }
  function term(en, zh) {
    if (en && typeof en === 'object') return T(en.en, en.zh);
    return T(en, zh);
  }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  /* one place that emits a bilingual rich block, so language switching is a
     single re-render instead of a pile of per-type handlers */
  function richNode(tag, cls, pair, holder) {
    var n = el(tag, cls);
    n._rich = { en: rich(pair.en), zh: rich(pair.zh) };
    n.setAttribute('data-rich', '1');
    holder = holder || n;
    n._holder = holder;
    n.innerHTML = showCN ? n._rich.zh : n._rich.en;
    return n;
  }
  function refreshRich(root) {
    $$('[data-rich]', root).forEach(function (n) {
      if (!n._rich) return;
      n.innerHTML = showCN ? n._rich.zh : n._rich.en;
      if (n._holder && n._holder !== n) n._holder.innerHTML = n.innerHTML;
      if (n.classList.contains('ib-sum')) applyBlanks(n);
    });
  }

  /* ── icons ─────────────────────────────────────────────────────────────── */

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
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
  };

  /* ── collect the chapter's sections ────────────────────────────────────── */

  var SECTIONS = [];
  (function collect() {
    var got = [];
    for (var i = CH.start; i < CH.end && i < TOPICS.length; i++) {
      var t = TOPICS[i]; if (!t) continue;
      var rec = NATIVE.filter(function (r) { return r.code === t.code; })[0];
      if (!rec) continue;
      (rec.sections || []).forEach(function (sec) {
        got.push({ topic: t, rec: rec, sec: sec, key: sec.title, zh: SECZH[sec.title] || '' });
      });
    }
    SECTIONS = got;
    if (TOPICS.slice(CH.start, CH.end).map(function (t) { return t.code; }).join() !== EXPECT.join()) {
      console.warn('[ib-lesson] chapter 1 topic codes changed:',
        TOPICS.slice(CH.start, CH.end).map(function (t) { return t.code; }));
    }
  })();

  /* Every key term in the chapter. Used for MCQ distractors, which is why the
     pool is built once up front rather than per question. */
  var TERMPOOL = [];
  SECTIONS.forEach(function (s) {
    (s.sec.terms || []).forEach(function (tm) {
      if (tm && tm.term && tm.definition) {
        TERMPOOL.push({ t: term(tm.term), d: term(tm.definition), key: s.key });
      }
    });
  });

  /* ── build the slide list ──────────────────────────────────────────────── */

  function cardSlides(kind, labelKey, body, opts) {
    return { t: 'card', kind: kind, label: labelKey, body: body, opts: opts || {} };
  }

  function mcqFor(sec, used) {
    var pool = TERMPOOL.filter(function (x) { return !used[x.t]; });
    if (pool.length < 4) return null;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    used[pick.t] = 1;
    var wrongs = pool.filter(function (x) { return x.t !== pick.t; });
    var opts = [pick.d];
    /* shuffle, then take three distinct wrong definitions */
    for (var i = wrongs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = wrongs[i]; wrongs[i] = wrongs[j]; wrongs[j] = tmp;
    }
    opts = opts.concat(wrongs.slice(0, 3).map(function (x) { return x.d; }));
    for (var k = opts.length - 1; k > 0; k--) {
      var m = Math.floor(Math.random() * (k + 1));
      var t2 = opts[k]; opts[k] = opts[m]; opts[m] = t2;
    }
    return {
      t: 'mcq',
      q: { en: 'What does the term “' + pick.t + '” mean?', zh: '术语「' + pick.t + '」是什么意思？' },
      opts: opts,
      a: opts.indexOf(pick.d),
      hint: { en: 'It begins: “' + pick.d.slice(0, 26) + '…”',
              zh: '开头是：「' + pick.d.slice(0, 26) + '…」' },
      why: { en: '“' + pick.t + '” is defined as: ' + pick.d,
             zh: '「' + pick.t + '」的定义是：' + pick.d }
    };
  }

  function buildSlides() {
    slides = [];
    var usedTerms = {};

    slides.push({ t: 'cover', n: CH.n, code: SECTIONS.length ? SECTIONS[0].topic.code : 'A.1.1' });

    SECTIONS.forEach(function (s, si) {
      var A = AUTHORED[s.key] || {};
      var D = DEEP[s.key] || {};
      var V = VIS[s.key] || {};

      slides.push({ t: 'sec', si: si, s: s });

      /* the summary sentences. Authored if present, otherwise fall back to the
         syllabus paragraphs so the lesson is never empty. */
      var sum = A.sum && A.sum.length ? A.sum : (s.sec.paragraphs || []);
      sum.forEach(function (p) { slides.push({ t: 'sum', p: p }); });

      if (A.analogy) slides.push(cardSlides('analogy', 'Analogy', A.analogy));

      /* Key Idea: the syllabus bullets are already the distilled list. */
      if ((s.sec.bullets || []).length) {
        slides.push(cardSlides('idea', 'Key Idea',
          { en: 'The short version of this section:', zh: '本节的要点：' },
          { list: s.sec.bullets }));
      }

      /* one Definition card per key term. These are what populate the glossary. */
      (s.sec.terms || []).forEach(function (tm) {
        if (!tm || !tm.term || !tm.definition) return;
        slides.push({ t: 'def', term: term(tm.term), def: tm.definition, key: s.key });
      });

      if (A.example) slides.push(cardSlides('example', 'Example', A.example));

      /* figures, tables, worked examples — verbatim from IB_VISUALS */
      (V.figures || []).forEach(function (f) { slides.push({ t: 'fig', f: f }); });
      (V.tables || []).forEach(function (tb) { slides.push({ t: 'tbl', tb: tb }); });
      if (V.example) {
        slides.push(cardSlides('example', 'Worked example', V.example.given || V.example.title || { en: '', zh: '' },
          { list: V.example.steps, note: V.example.answer }));
      }

      /* the numbers, then the mistake examiners reward */
      if (D.numbers) slides.push(cardSlides('note', 'Numbers worth keeping', D.numbers));
      if ((D.mistakes || []).length) {
        slides.push(cardSlides('note', 'Careful — this loses marks', D.mistakes[0]));
      }

      /* flashcard then a question, both built from this section's own terms */
      var own = (s.sec.terms || []).filter(function (tm) { return tm && tm.term && tm.definition; });
      if (own.length) {
        var f0 = own[Math.floor(Math.random() * own.length)];
        slides.push({ t: 'flash', q: term(f0.term), a: term(f0.definition) });
      }
      var m = mcqFor(s, usedTerms);
      if (m) { m.si = si; slides.push(m); }
    });

    slides.push({ t: 'done' });
  }

  /* ── persistence ───────────────────────────────────────────────────────── */

  function load() {
    try { state = JSON.parse(localStorage.getItem(POSKEY) || 'null') || state; } catch (e) {}
    if (!state.done) state.done = {};
    if (!state.blanks) state.blanks = {};
  }
  function save() {
    try {
      localStorage.setItem(POSKEY, JSON.stringify({
        i: idx, done: state.done, gloss: state.gloss, blanks: state.blanks
      }));
    } catch (e) {}
  }

  /* ── rendering ─────────────────────────────────────────────────────────── */

  var readEl, footBack, footNext, fillEl, countEl;

  function svgWrap(svg, viewBox) {
    var f = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    f.setAttribute('viewBox', viewBox || '0 0 560 340');
    f.setAttribute('class', 'vis-svg');
    f.innerHTML = svg;
    return f;
  }

  /* the label depends on the slide TYPE, so it is recomputed rather than stored */
  function nextLabel() {
    var s = slides[idx] || { t: 'cover' };
    var cont = (s.t === 'mcq' || s.t === 'flash');
    return {
      en: s.t === 'done' ? 'Close' : (cont ? 'Continue' : 'Next'),
      zh: s.t === 'done' ? '关闭' : (cont ? '继续' : '下一句'),
      end: s.t === 'done'
    };
  }
  function labelNext() {
    var L = nextLabel();
    footNext.setAttribute('data-en', L.en);
    footNext.setAttribute('data-zh', L.zh);
    footNext.innerHTML = '';
    footNext.appendChild(document.createTextNode(T(L.en, L.zh)));
    footNext.insertAdjacentHTML('beforeend', ' ' + ICON.chev);
  }

  function paint() {
    var s = slides[idx];
    if (!s) return;

    /* everything already on screen is "past" */
    $$('.ib-now', readEl).forEach(function (n) { n.classList.remove('ib-now'); });

    var node = build(s);
    readEl.appendChild(node);
    built++;
    if (s.t === 'sec') state.done[s.si] = 1;

    if (s.t === 'sec') paintMap(s.si);

    /* keep the newest block in view without yanking the page on the first paint */
    var y = node.getBoundingClientRect().top + window.scrollY - (78 + 12);
    window.scrollTo({ top: Math.max(0, y), behavior: built === 1 ? 'auto' : 'smooth' });

    footBack.disabled = idx === 0;
    var last = idx >= slides.length - 1;
    footNext.disabled = last && s.t === 'done';
    labelNext();

    var pct = slides.length > 1 ? Math.round(idx / (slides.length - 1) * 100) : 0;
    fillEl.style.width = pct + '%';
    countEl.textContent = T((idx + 1) + ' / ' + slides.length, (idx + 1) + ' / ' + slides.length);

    save();
  }

  function build(s) {
    switch (s.t) {
      case 'cover': {
        var w = el('header', 'ib-cover ib-now');
        var k = el('div', 'ib-cover__kicker');
        k.appendChild(document.createTextNode(T('Chapter ' + s.n, '第' + s.n + '章')));
        w.appendChild(k);
        var h = plain(el('h1', 'ib-cover__title'), CH.en, CH.zh);
        w.appendChild(h);
        var m = plain(el('p', 'ib-cover__meta'),
          'A guided read through ' + SECTIONS.length + ' sections · press Next to begin',
          '共 ' + SECTIONS.length + ' 节的引导式阅读 · 按下一句开始');
        w.appendChild(m);
        return w;
      }
      case 'sec': {
        var q = el('section', 'ib-sec');
        q.id = 'ib-sec-' + s.si;
        var lab = el('div', 'ib-sec__label');
        lab.innerHTML = ICON.note;
        lab.appendChild(document.createTextNode(s.s.topic.code));
        q.appendChild(lab);
        var t = plain(el('h2', 'ib-sec__title'), s.s.key, s.s.zh || s.s.key);
        q.appendChild(t);
        return q;
      }
      case 'sum': {
        var n = el('p', 'ib-sum ib-now');
        n._rich = { en: rich(s.p.en), zh: rich(s.p.zh) };
        n.setAttribute('data-rich', '1');
        n.innerHTML = showCN ? n._rich.zh : n._rich.en;
        applyBlanks(n);
        return n;
      }
      case 'card': return buildCard(s);
      case 'def': {
        var c = el('div', 'ib-card ib-card--def ib-now');
        var l = el('div', 'ib-card__label'); l.innerHTML = ICON.def;
        l.appendChild(document.createTextNode(T('Definition', '定义')));
        c.appendChild(l);
        var tm = el('div', 'ib-def__term');
        tm._rich = { en: rich(s.term.en || s.term), zh: rich(s.term.zh || s.term) };
        tm.setAttribute('data-rich', '1');
        tm.innerHTML = showCN ? tm._rich.zh : tm._rich.en;
        c.appendChild(tm);
        var b = el('p', 'ib-card__body');
        b._rich = { en: rich(s.def.en), zh: rich(s.def.zh) };
        b.setAttribute('data-rich', '1');
        b.innerHTML = showCN ? b._rich.zh : b._rich.en;
        c.appendChild(b);
        addGlossary(term(s.term), term(s.def));
        return c;
      }
      case 'fig': {
        var f = el('div', 'ib-fig ib-now');
        var ft = el('p', 'ib-fig__title'); ft.textContent = term(s.f.title);
        f.appendChild(ft);
        var fr = el('div', 'ib-fig__frame');
        fr.appendChild(svgWrap(s.f.svg, s.f.viewBox));
        f.appendChild(fr);
        if ((s.f.legend || []).length) {
          var lg = el('ul', 'ib-fig__legend');
          s.f.legend.forEach(function (x) {
            var li = el('li'); li.textContent = term(x); lg.appendChild(li);
          });
          f.appendChild(lg);
        }
        if (s.f.caption) { var cp = el('p', 'ib-fig__cap'); cp.textContent = term(s.f.caption); f.appendChild(cp); }
        return f;
      }
      case 'tbl': {
        var w2 = el('div', 'ib-tbl ib-now');
        var tt = el('p', 'ib-tbl__title'); tt.textContent = term(s.tb.title);
        w2.appendChild(tt);
        var wrap = el('div', 'ib-tbl__wrap');
        var tb = el('table');
        var th = el('tr');
        (s.tb.cols || []).forEach(function (c2) {
          var x = el('th'); x.textContent = term(c2); th.appendChild(x);
        });
        tb.appendChild(th);
        (s.tb.rows || []).forEach(function (row) {
          var tr = el('tr');
          row.forEach(function (cell) {
            var td = el('td');
            td.innerHTML = rich(term(cell));
            tr.appendChild(td);
          });
          tb.appendChild(tr);
        });
        wrap.appendChild(tb);
        w2.appendChild(wrap);
        if (s.tb.note) { var nt = el('p', 'ib-tbl__note'); nt.textContent = term(s.tb.note); w2.appendChild(nt); }
        return w2;
      }
      case 'flash': {
        var fx = el('div', 'ib-flash ib-now');
        var fl = el('div', 'ib-flash__label'); fl.innerHTML = ICON.flash;
        fl.appendChild(document.createTextNode(T('Flashcard', '闪卡')));
        fx.appendChild(fl);
        var cd = el('div', 'ib-flash__card');
        cd.setAttribute('role', 'button');
        cd.setAttribute('tabindex', '0');
        var qq = el('div', 'ib-flash__q');
        qq.textContent = T('What is “' + s.q + '”?', '什么是「' + s.q + '」？');
        cd.appendChild(qq);
        cd.addEventListener('click', function () {
          fx.classList.toggle('is-flipped');
          qq.textContent = fx.classList.contains('is-flipped') ? s.a : T('What is “' + s.q + '”?', '什么是「' + s.q + '」？');
        });
        fx.appendChild(cd);
        var hint = el('p', 'ib-flash__hint');
        hint.textContent = T('Tap the card to flip · 轻点卡片翻面', '轻点卡片翻面');
        fx.appendChild(hint);
        return fx;
      }
      case 'mcq': return buildMcq(s);
      case 'done': {
        var d = el('div', 'ib-done');
        var big = el('h2', 'ib-done__big');
        big.textContent = T('Chapter 1 complete', '第一章完成');
        d.appendChild(big);
        var st = el('p', 'ib-done__stats');
        st.textContent = T(
          Object.keys(state.done).length + ' of ' + SECTIONS.length + ' sections read · ' +
          state.gloss.length + ' key terms in your glossary',
          '已阅读 ' + Object.keys(state.done).length + ' / ' + SECTIONS.length + ' 节 · 术语表已收录 ' +
          state.gloss.length + ' 个术语');
        d.appendChild(st);
        var acts = el('div', 'ib-done__acts');
        var again = el('button', 'ib-foot__btn', T('Read again', '再读一遍'));
        again.addEventListener('click', function () {
          readEl.innerHTML = ''; built = 0; idx = 0;
          state.done = {}; state.gloss = []; save();
          buildSlides(); renderRail(); paint();
        });
        acts.appendChild(again);
        var back = el('button', 'ib-foot__btn', T('Back to course', '返回课程'));
        back.addEventListener('click', exit);
        acts.appendChild(back);
        d.appendChild(acts);
        return d;
      }
    }
    return el('div');
  }

  function buildCard(s) {
    var c = el('div', 'ib-card ib-card--' + s.kind + ' ib-now');
    var l = el('div', 'ib-card__label'); l.innerHTML = ICON[s.kind] || ICON.note;
    l.appendChild(document.createTextNode(term(s.label)));
    c.appendChild(l);

    var b = el('p', 'ib-card__body');
    b._rich = { en: rich(s.body.en), zh: rich(s.body.zh) };
    b.setAttribute('data-rich', '1');
    b.innerHTML = showCN ? b._rich.zh : b._rich.en;
    c.appendChild(b);

    if (s.opts && s.opts.list && s.opts.list.length) {
      var ul = el('ul');
      s.opts.list.forEach(function (x) {
        var li = el('li');
        li.innerHTML = rich(term(x));
        ul.appendChild(li);
      });
      c.appendChild(ul);
    }
    if (s.opts && s.opts.note) {
      var nt = el('p', 'ib-card__note');
      nt.textContent = term(s.opts.note);
      c.appendChild(nt);
    }
    return c;
  }

  function buildMcq(s) {
    var w = el('div', 'ib-mcq ib-now');
    var l = el('div', 'ib-mcq__label'); l.innerHTML = ICON.mcq;
    l.appendChild(document.createTextNode(T('Check yourself', '自我检测')));
    w.appendChild(l);
    var q = el('p', 'ib-mcq__q'); q.textContent = term(s.q);
    w.appendChild(q);

    var hintBox = el('p', 'ib-mcq__why');
    hintBox.hidden = true;
    var hintBtn = el('button', 'ib-mcq__hintbtn', T('Hint', '提示'));
    hintBtn.addEventListener('click', function () {
      hintBox.hidden = false;
      hintBox.textContent = term(s.hint);
    });
    w.appendChild(hintBtn);

    var answered = false;
    var opts = el('div');
    s.opts.forEach(function (o, i) {
      var b = el('button', 'ib-mcq__opt');
      var k = el('span', 'ib-mcq__key'); k.textContent = 'ABCD'[i];
      b.appendChild(k);
      var tx = el('span'); tx.innerHTML = rich(o);
      b.appendChild(tx);
      b.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        $$('.ib-mcq__opt', w).forEach(function (x) { x.disabled = true; });
        b.classList.add(i === s.a ? 'is-right' : 'is-wrong');
        if (i !== s.a) {
          var right = $$('.ib-mcq__opt', w)[s.a];
          if (right) right.classList.add('is-right');
        }
        hintBox.hidden = false;
        hintBox.textContent = term(s.why);
      });
      opts.appendChild(b);
    });
    w.appendChild(opts);
    w.appendChild(hintBox);
    return w;
  }

  /* ── term-blanking drill ───────────────────────────────────────────────── */
  /* With the drill on, the <b class="kt"> key terms inside summary sentences
     become blanks you have to tap open. That is the whole "learn it yourself"
     idea: the page stops handing you the answer mid-sentence. Definitions,
     tables and figures keep the term visible, because hiding a term in a table
     would make the table unreadable rather than active. */
  function applyBlanks(node) {
    if (!node) return;
    var bs = node.querySelectorAll('b.kt');
    if (!bs.length) return;
    var on = $('#ibDrill').getAttribute('aria-pressed') === 'true';
    var keep = node._blanks || (node._blanks = []);
    if (!on) {
      keep.forEach(function (w) { w.replaceWith(document.createTextNode(w.__text)); });
      keep.length = 0;
      node.innerHTML = showCN ? node._rich.zh : node._rich.en;
      return;
    }
    var html = showCN ? node._rich.zh : node._rich.en;
    node.innerHTML = html;
    Array.prototype.slice.call(node.querySelectorAll('b.kt')).forEach(function (b, i) {
      var txt = b.textContent;
      var w = el('button', 'ib-blank');
      w.type = 'button';
      w.textContent = txt;
      w.setAttribute('data-hint', T('tap to reveal', '点击揭晓'));
      w._blank = 1;
      w.__text = txt;
      if (state.blanks[w.dataset.k = node.id + '#' + i]) w.classList.add('is-open');
      w.addEventListener('click', function () {
        w.classList.add('is-open');
        state.blanks[w.dataset.k] = 1;
        save();
      });
      b.replaceWith(w);
    });
  }
  function applyDrill() {
    $$('.ib-sum[data-rich]', readEl).forEach(applyBlanks);
  }

  /* ── rail: chapter map + live glossary ─────────────────────────────────── */

  var mapEl, glossEl, railEl, scrimEl;

  function renderRail() {
    /* map */
    mapEl.innerHTML = '';
    var lastCode = null;
    SECTIONS.forEach(function (s, i) {
      if (s.topic.code !== lastCode) {
        lastCode = s.topic.code;
        var h = el('li', 'ib-map__topic');
        h.textContent = s.topic.code + ' · ' + T(s.topic.en || '', s.topic.zh || '');
        mapEl.appendChild(h);
      }
      var li = el('li');
      var b = el('button', 'ib-map__sec');
      b.type = 'button';
      b.dataset.si = i;
      var tick = el('span', 'ib-map__tick'); tick.textContent = '✓';
      b.appendChild(tick);
      var lb = el('span'); lb.textContent = T(s.key, s.zh || s.key);
      b.appendChild(lb);
      if (state.done[i]) b.classList.add('is-done');
      b.addEventListener('click', function () { jumpTo(i); closeRail(); });
      li.appendChild(b);
      mapEl.appendChild(li);
    });

    /* glossary */
    var q = (glossQuery || '').toLowerCase();
    var list = state.gloss.filter(function (g) {
      return !q || g[0].toLowerCase().indexOf(q) >= 0 || g[1].toLowerCase().indexOf(q) >= 0;
    });
    if (!list.length) {
      var em = el('p', 'ib-gloss__empty');
      em.textContent = state.gloss.length
        ? T('No term matches “' + glossQuery + '”.', '没有匹配「' + glossQuery + '」的术语。')
        : T('Definitions you pass will collect here, so you leave with the whole chapter glossary built.',
             '你读过的定义会自动收集到这里，最后就是一整章的术语表。');
      glossEl.innerHTML = '';
      glossEl.appendChild(em);
    } else {
      glossEl.innerHTML = '';
      list.forEach(function (g) {
        var li = el('li');
        var b = el('b'); b.textContent = g[0];
        li.appendChild(b);
        li.appendChild(document.createTextNode(g[1]));
        glossEl.appendChild(li);
      });
    }
  }
  var glossQuery = '';

  function addGlossary(t, d) {
    if (!t || !d) return;
    if (state.gloss.some(function (g) { return g[0] === t; })) return;
    state.gloss.push([t, d]);
    renderRail();
  }
  function paintMap(now) {
    $$('.ib-map__sec').forEach(function (b) {
      var i = Number(b.dataset.si);
      b.classList.toggle('is-now', i === now);
      if (state.done[i]) b.classList.add('is-done');
    });
  }
  function jumpTo(si) {
    /* walk forward from where we are until the next section opener is rendered */
    var target = -1;
    for (var i = idx + 1; i < slides.length; i++) {
      if (slides[i].t === 'sec' && slides[i].si === si) { target = i; break; }
    }
    if (target < 0) return;
    while (idx < target) { idx++; paint(); }
  }
  function closeRail() {
    if (railEl) railEl.classList.remove('is-open');
    if (scrimEl) scrimEl.classList.remove('is-open');
  }
  function openRail() {
    if (railEl) railEl.classList.add('is-open');
    if (scrimEl) scrimEl.classList.add('is-open');
  }

  /* ── language + dark ───────────────────────────────────────────────────── */

  function applyLang() {
    document.body.classList.toggle('lang-zh', showCN);
    document.body.classList.toggle('lang-en', !showCN);
    $('#ibLang').textContent = showCN ? '中' : 'EN';
    $('#ibLang').setAttribute('aria-label', showCN ? 'Switch to English' : '切换到中文');
    /* re-read in place. Calling paint() here used to APPEND a whole extra
       slide every time the language was switched, which silently grew the
       lesson each toggle. */
    refreshPlain(document);
    refreshRich(document);
    labelNext();
    renderRail();
    applyDrills();
  }
  function applyDark() {
    document.body.classList.toggle('dark', dark);
    $('#ibDark').textContent = dark ? '☀' : '☾';
  }

  /* ── boot ──────────────────────────────────────────────────────────────── */

  function exit() {
    /* return to the course, on this chapter if the browser sent us back to
       somewhere specific */
    var back = 'ib-sehs-learn.html#' + CH.id;
    if (document.referrer && /vitaliteplan\.com|localhost|127\.0\.0\.1/.test(document.referrer)) {
      try { if (history.length > 1) { history.back(); return; } } catch (e) {}
    }
    location.href = back;
  }

  function boot() {
    try { showCN = localStorage.getItem('sm_lang') === 'zh'; } catch (e) {}
    try { dark = localStorage.getItem('dark') === 'true'; } catch (e) {}
    load();
    buildSlides();

    readEl = $('#ibRead');
    footBack = $('#ibBack'); footNext = $('#ibNext');
    fillEl = $('#ibFill'); countEl = $('#ibCount');
    mapEl = $('#ibMap'); glossEl = $('#ibGloss'); railEl = $('#ibRail');
    scrimEl = $('#ibScrim');

    /* paint up to the saved position, without the smooth-scroll on each one */
    var start = Math.min(Number(state.i) || 0, slides.length - 1);
    while (idx < start) { idx++; paint(); }
    paint();

    $('#ibExit').addEventListener('click', exit);
    footNext.addEventListener('click', function () { if (idx < slides.length - 1) { idx++; paint(); } });
    footBack.addEventListener('click', function () { if (idx > 0) { idx--; paint(); } });

    $('#ibLang').addEventListener('click', function () {
      showCN = !showCN;
      try { localStorage.setItem('sm_lang', showCN ? 'zh' : 'en'); } catch (e) {}
      applyLang();
    });
    $('#ibDark').addEventListener('click', function () {
      dark = !dark;
      try { localStorage.setItem('dark', dark ? 'true' : 'false'); } catch (e) {}
      applyDark();
    });
    $('#ibDrill').addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') === 'true';
      this.setAttribute('aria-pressed', on ? 'false' : 'true');
      applyDrill();
    });
    $('#ibRailToggle').addEventListener('click', openRail);
    $('#ibRailClose').addEventListener('click', closeRail);
    $('#ibScrim').addEventListener('click', closeRail);
    $('#ibGlossSearch').addEventListener('input', function () {
      glossQuery = this.value; renderRail();
    });

    document.addEventListener('keydown', function (e) {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (idx < slides.length - 1) { e.preventDefault(); idx++; paint(); }
      } else if (e.key === 'ArrowLeft') {
        if (idx > 0) { e.preventDefault(); idx--; paint(); }
      } else if (e.key === 'Escape') { closeRail(); }
    });

    applyDark();
    renderRail();
    window.IBSEHSLesson = { slides: slides, sections: SECTIONS, jump: jumpTo,
                             state: state, drill: applyDrills };
    function applyDrills() { applyDrill(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();

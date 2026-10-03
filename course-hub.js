/* ═══════════════════════════════════════════════════════════════════════════
   course-hub.js — the Vitalité course layer.

   GENERATED-BY-HAND companion to course-hub.css (which mkcss.py derives from
   ib-sehs-lesson.css). One engine, many courses: a course page builds an
   OUTLINE from its own DOM and hands it over, and this file turns that outline
   into the subject hub, the topic tree, the study guide, the key-definitions
   view and the lesson reader.

   Why an engine and not a per-page copy
   ------------------------------------
   g10-bio.html carries its content as an accordion in the HTML; guide.html
   carries 90 sections the same way. Both can describe themselves, so neither
   needs its own renderer and neither needs new content authored.

   The one thing this file refuses to do
   --------------------------------------
   Invent numbers. Every count the hub shows — blocks, terms, tables, figures,
   questions, cards, overall progress — is computed from the nodes or the data
   arrays that are actually rendered. A number can therefore never disagree
   with what is on screen.

   Routes (the hash, so a course page keeps one URL):
     ''  |  #                 subject page: Resources tab
     #progress                 subject page: Topics & progress tab
     #topic/<code>             one section, with its own content
     #defs/<code>              every key term in that section
     #lesson/<code>            the reader
     #raw/<element-id>         one of the host page's own sections, unchanged
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.CourseHub) return;

  /* ── tiny DOM helpers ──────────────────────────────────────────────────── */

  function E(sel, root) { return (root || document).querySelector(sel); }
  function EE(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  /* A node that carries BOTH languages. Never resolve a pair to text before
     building the node — that is what freezes a bilingual view in one language. */
  function plain(node, en, zh) {
    node.setAttribute('data-en', en == null ? '' : en);
    node.setAttribute('data-zh', zh == null ? en : zh);
    node.textContent = (zh == null ? en : (showCN ? zh : en)) || '';
    return node;
  }
  function T(en, zh) { return zh == null ? en : (showCN ? zh : en); }
  function pair(o) { return [o && o.en, o && o.zh]; }

  /* The site reads the language off <body class="lang-zh"> and writes it to
     sm_lang; a page can also be in Chinese with the class missing, so both are
     consulted. */
  var showCN = false;

  function readLang() {
    try { showCN = localStorage.getItem('sm_lang') === 'zh'; } catch (e) { showCN = false; }
    if (document.body && document.body.classList.contains('lang-zh')) showCN = true;
    if (document.body && document.body.classList.contains('lang-en')) showCN = false;
  }

  function refreshAll(root) {
    EE('[data-en][data-zh]', root || document).forEach(function (n) {
      var en = n.getAttribute('data-en'), zh = n.getAttribute('data-zh');
      if (n._chHtml != null) return;               /* rich: handled by its owner */
      n.textContent = (zh == null ? en : (showCN ? zh : en)) || '';
    });
  }

  /* ── the reader's own icons, so nothing depends on a global icon set ───── */
  var ICONS = {
    play: 'M6 4l9 6-9 6z',
    check: 'M4 10.5l4 4 8-9',
    chev: 'M6 4l5 6-5 6',
    back: 'M15 5l-7 7 7 7',
    book: 'M3 4h6a3 3 0 013 3v13a2.5 2.5 0 00-2.5-2.5H3zM21 4h-6a3 3 0 00-3 3v13a2.5 2.5 0 012.5-2.5H21z',
    note: 'M5 3h9l5 5v13H5zM14 3v5h5',
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    mcq: 'M12 3a9 9 0 100 18 9 9 0 000-18zM9.5 9a2.5 2.5 0 114 2c-.9.7-1.5 1.2-1.5 2.5M12 17h.01',
    flash: 'M13 2L5 13h5l-1 9 8-11h-5z'
  };
  /* A class means a WRAPPER, because the shipped CSS sizes the icon through
     its parent (`.ch-rtile__ico svg { width: 26px }`). Putting the class on the
     svg itself leaves it unsized, and an unsized inline SVG with a viewBox
     expands to fill the flex box. */
  function icon(name, cls) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.9');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', ICONS[name] || ICONS.chev);
    s.appendChild(p);
    if (!cls) return s;
    var wrap = document.createElement('span');
    wrap.className = cls;
    wrap.appendChild(s);
    return wrap;
  }

  /* ── the six-level progress scale, in the site's own palette ─────────── */
  /* The scale is drawn in the site's OWN palette so it stays on brand, and it
     is shown in full on the progress tab so a square is never a mystery. A
     section is read or it is not, so the two states a row can be in are
     `unseen` and `familiar`; the rest of the scale is published for the legend
     and for a course whose progress is finer-grained than one bit per section. */
  var LEVELS = [
    { k: 'mastered',   en: 'Mastered',   zh: '已掌握' },
    { k: 'proficient', en: 'Proficient', zh: '熟练' },
    { k: 'familiar',   en: 'Familiar',   zh: '熟悉' },
    { k: 'learning',   en: 'Learning',   zh: '学习中' },
    { k: 'unfamiliar', en: 'Unfamiliar', zh: '未熟悉' },
    { k: 'unseen',     en: 'Unseen',     zh: '未读' }
  ];
  var SEEN = LEVELS[2];      /* familiar  */
  var UNSEEN = LEVELS[4];    /* unfamiliar */

  /* ═══ the reader overlay ══════════════════════════════════════════════════
     Built in JS rather than pasted into each course page. A page then needs
     exactly one mount point, and there is no 60-line block of reader markup
     for a regex to eat. */
  var R = {};   /* element cache for the reader */

  function buildReader() {
    if (R.root) return R;
    var d = document.createElement('div');
    d.className = 'ch-lesson';
    d.id = 'chLesson';
    d.hidden = true;
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-modal', 'true');
    d.innerHTML =
      '<header class="ch-top">' +
        /* No glyph in the markup: ::before draws it, and vi-icons.js rewrites a
           whole-emoji text node into its own SVG, which put a second mark beside
           the first. The button is empty on purpose. */
        '<button class="ch-top__exit ch-top__exit--x" id="chExit" type="button" aria-label="Exit lesson"></button>' +
        '<button class="ch-top__btn ch-top__btn--rail" id="chRailToggle" type="button" aria-label="Sections and glossary" data-en="Sections &amp; terms" data-zh="小节与术语">☰</button>' +
        '<div class="ch-top__bar" role="progressbar" aria-label="Lesson progress"><div class="ch-top__fill" id="chFill"></div></div>' +
        '<span class="ch-top__count" id="chCount">—</span>' +
        '<button class="ch-top__btn" id="chDrill" type="button" aria-pressed="false" data-en="Test me" data-zh="自测模式">Test me</button>' +
        '<button class="ch-top__btn" id="chLang" type="button" aria-label="Language">EN</button>' +
        '<button class="ch-top__btn" id="chDark" type="button" aria-label="Dark mode">☾</button>' +
      '</header>' +
      '<div class="ch-rail__scrim" id="chScrim"></div>' +
      '<div class="ch-lesson-shell" id="chReader">' +
        '<aside class="ch-rail" id="chRail" aria-label="Sections and glossary">' +
          '<button class="ch-rail__close" id="chRailClose" type="button" aria-label="Close">×</button>' +
          '<button class="ch-rail__hub" id="chRailHub" type="button"><span data-en="← All sections" data-zh="← 全部小节">← All sections</span></button>' +
          '<p class="ch-rail__head" data-en="Blocks" data-zh="段落">Blocks</p>' +
          '<ul class="ch-map" id="chMap"></ul>' +
          '<p class="ch-rail__head" data-en="Your glossary" data-zh="我的术语表">Your glossary</p>' +
          '<ul class="ch-gloss__list" id="chGloss"></ul>' +
        '</aside>' +
        '<main class="ch-read" id="chRead"></main>' +
      '</div>' +
      '<footer class="ch-foot" id="chFoot" hidden>' +
        '<button class="ch-foot__btn ch-foot__btn--back" id="chBack" type="button" aria-label="Previous block"><span aria-hidden="true">←</span></button>' +
        '<span class="ch-foot__spacer"></span>' +
        '<button class="ch-foot__btn ch-foot__btn--next" id="chNext" type="button"><span data-en="Next" data-zh="下一句">Next</span><span class="ch-foot__arrow" aria-hidden="true">→</span></button>' +
      '</footer>';
    document.body.appendChild(d);
    R = {
      root: d,
      fill: E('#chFill', d), count: E('#chCount', d),
      drill: E('#chDrill', d), lang: E('#chLang', d), dark: E('#chDark', d),
      exit: E('#chExit', d), railToggle: E('#chRailToggle', d),
      rail: E('#chRail', d), railClose: E('#chRailClose', d),
      railHub: E('#chRailHub', d), scrim: E('#chScrim', d),
      map: E('#chMap', d), gloss: E('#chGloss', d),
      read: E('#chRead', d), foot: E('#chFoot', d),
      back: E('#chBack', d), next: E('#chNext', d),
      reader: E('#chReader', d)
    };
    return R;
  }

  /* ═══ slides, built from a section's own DOM ══════════════════════════════
     A heading leads the block that follows it; a table, a figure and an image
     each stand alone. knowledge-fx injects .kn-* children into every
     .acc-body-inner, and those are excluded so the reader never shows the
     concise-view machinery twice. */
  function groupsOf(section) {
    var inner = section.body;
    if (!inner) return [];
    var kids = EE(':scope > *', inner).filter(function (k) {
      return !/\bkn-/.test(k.className || '');
    });
    var out = [], head = null, buf = [];
    function flush() {
      if (buf.length) { out.push({ head: head, nodes: buf }); buf = []; }
      else if (head) { out.push({ head: head, nodes: [] }); }
      head = null;
    }
    kids.forEach(function (k) {
      var tag = k.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) { flush(); head = k; return; }
      if (tag === 'img' || tag === 'figure' || k.classList.contains('table-wrap')) {
        flush();
        out.push({ head: head, nodes: [k] });
        head = null;
        return;
      }
      buf.push(k);
    });
    flush();
    return out;
  }

  /* counts, all measured on the nodes that will actually render */
  function statsOf(section) {
    var inner = section.body, g = groupsOf(section), st = {
      blocks: g.length, terms: 0, tables: 0, figures: 0, chars: 0
    };
    if (!inner) return st;
    st.tables = inner.querySelectorAll('table').length;
    st.figures = inner.querySelectorAll('img, svg, figure').length;
    st.chars = (inner.textContent || '').replace(/\s+/g, ' ').trim().length;
    st.terms = (course.defsFor ? course.defsFor(section) : []).length;
    return st;
  }

  /* ═══ the reader ═════════════════════════════════════════════════════════ */
  var cur = { code: null, slides: [], i: 0, rendered: [] };

  function openReader(code) {
    var r = buildReader();
    var sec = sectionByCode(code);
    if (!sec) { unknown = code; view = 'resources'; return openHub(); }
    cur.code = code;
    cur.i = 0;
    cur.rendered = [];

    var groups = groupsOf(sec);
    var ch = chapterOf(code);
    cur.slides = [{ t: 'cover', sec: sec, ch: ch }];
    groups.forEach(function (g, i) { cur.slides.push({ t: 'blk', g: g, i: i, sec: sec }); });
    cur.slides.push({ t: 'end', sec: sec, ch: ch });

    document.body.classList.add('ch-reading');
    r.root.hidden = false;
    r.root.classList.add('ch-reading');
    /* `hidden` is only display:none in the UA stylesheet, so the shipped
       `.ch-foot{display:flex}` would beat it anyway — which is exactly why the
       Back/Next footer has to be un-hidden explicitly here rather than trusted
       to the attribute. */
    r.foot.hidden = false;
    if (r.fill) r.fill.style.width = '0%';
    if (r.count) r.count.textContent = '\u2014';
    r.read.innerHTML = '';
    buildMap(sec);
    buildGloss(sec);
    show(0);
    closeRail();
    try { r.read.scrollTop = 0; } catch (e) {}
  }

  function closeReader() {
    var r = buildReader();
    document.body.classList.remove('ch-reading');
    r.root.classList.remove('ch-reading');
    r.root.hidden = true;
    /* Clear the drill before the nodes go, or the next reader opens with the
       previous section's blanks already applied. */
    cur.rendered.forEach(function (n) { if (n._chHtml != null) { n.innerHTML = n._chHtml; n._chHtml = null; } });
    cur.rendered = [];
    cur.slides = [];
    r.read.innerHTML = '';
    r.map.innerHTML = '';
    r.gloss.innerHTML = '';
    r.foot.hidden = true;
    if (r.fill) r.fill.style.width = '0%';
    if (r.count) r.count.textContent = '\u2014';
    if (r.drill) r.drill.setAttribute('aria-pressed', 'false');
    drillOn = false;
  }

  function buildMap(sec) {
    var r = buildReader();
    r.map.innerHTML = '';
    var ch = chapterOf(sec.code);
    var head = el('li', 'ch-map__topic', ch
      ? T('Lesson ' + ch.n + ' · ' + ch.en, '第 ' + ch.n + ' 节 · ' + ch.zh)
      : '');
    r.map.appendChild(head);
    cur.slides.forEach(function (s, i) {
      var li = el('li');
      var b = el('button', 'ch-map__sec');
      b.type = 'button';
      /* empty: the tick is drawn by CSS, because vi-icons.js turns a glyph in
         a span into its own SVG and colour, which defeats color:transparent */
      b.appendChild(el('span', 'ch-map__tick'));
      b.appendChild(el('span', null,
        s.t === 'cover' ? T('Start', '开始')
        : s.t === 'end' ? T('Done', '完成')
        : String(i)));
      b.addEventListener('click', function () { show(i); });
      b.dataset.i = String(i);
      li.appendChild(b);
      r.map.appendChild(li);
    });
  }

  function buildGloss(sec) {
    var r = buildReader();
    r.gloss.innerHTML = '';
    var defs = course.defsFor ? course.defsFor(sec) : [];
    if (!defs.length) {
      r.gloss.appendChild(el('li', 'ch-gloss__empty',
        T('No key terms in this section yet.', '本节暂无术语。')));
      return;
    }
    defs.forEach(function (d) {
      var li = el('li');
      li.appendChild(plain(el('b', null), pair(d.t)[0], pair(d.t)[1]));
      li.appendChild(plain(el('span', null), pair(d.d)[0], pair(d.d)[1]));
      r.gloss.appendChild(li);
    });
  }

  function paintMap() {
    var r = buildReader();
    EE('.ch-map__sec', r.map).forEach(function (b, i) {
      b.classList.toggle('is-now', i === cur.i);
      b.classList.toggle('is-done', i < cur.i);
    });
  }

  /* One node per slide, built ONCE. An append-only renderer cannot support
     Back: pressing Back re-rendered the earlier blocks as new DOM below, so the
     counter went backwards while the page grew. */
  function slideNode(s) {
    var r = buildReader();
    if (s.t === 'cover') {
      var c = el('div', 'ch-cover');
      var ch = s.ch;
      var kick = ch
        ? T('Lesson ' + ch.n + ' \u00b7 ' + ch.en, '第 ' + ch.n + ' 节 \u00b7 ' + ch.zh)
        : '';
      c.appendChild(plain(el('p', 'ch-cover__kicker'), kick, kick));
      var ttl = s.sec.code ? s.sec.code + ' ' + s.sec.en : s.sec.en;
      var ttz = s.sec.code ? s.sec.code + ' ' + s.sec.zh : s.sec.zh;
      c.appendChild(plain(el('h1', 'ch-cover__title'), ttl, ttz));
      var st = statsOf(s.sec);
      c.appendChild(plain(el('p', 'ch-cover__meta'),
        st.blocks + ' ' + T('blocks', '段') + ' · ' + st.chars + ' ' + T('characters', '字') +
          ' · ' + T('press Next to begin', '按“下一句”开始'),
        st.blocks + ' ' + T('段', '段') + ' · ' + st.chars + ' ' + T('字', '字') +
          ' · ' + T('按“下一句”开始', '按“下一句”开始')));
      return c;
    }
    if (s.t === 'end') {
      var e = el('div', 'ch-done');
      e.appendChild(el('div', 'ch-done__big', T('Section read', '本节已读')));
      var st2 = statsOf(s.sec);
      e.appendChild(plain(el('p', 'ch-done__stats'),
        s.sec.code + ' · ' + st2.blocks + ' ' + T('blocks', '段'),
        s.sec.code + ' · ' + st2.blocks + ' ' + T('段', '段')));
      var acts = el('div', 'ch-done__acts');
      var again = el('button', 'ch-foot__btn');
      again.type = 'button';
      again.appendChild(plain(el('span', null), T('Read again', '再读一遍'), T('再读一遍', '再读一遍')));
      again.appendChild(icon('back', 'ch-foot__arrow'));
      again.addEventListener('click', function () { show(0); });
      acts.appendChild(again);

      var nxt = nextSection(s.sec);
      if (nxt) {
        var nb = el('button', 'ch-foot__btn ch-foot__btn--next');
        nb.type = 'button';
        nb.appendChild(plain(el('span', null),
          T('Next: ' + nxt.code, '下一节：' + nxt.code), T('下一节：' + nxt.code, '下一节：' + nxt.code)));
        nb.appendChild(el('span', 'ch-foot__arrow', '→'));
        nb.addEventListener('click', function () {
          go('#topic/' + nxt.code);
          closeReader();
        });
        acts.appendChild(nb);
      }
      var back = el('button', 'ch-foot__btn');
      back.type = 'button';
      back.appendChild(plain(el('span', null),
        T('All sections', '全部小节'), T('全部小节', '全部小节')));
      back.addEventListener('click', function () { go('#progress'); closeReader(); });
      acts.appendChild(back);
      e.appendChild(acts);
      return e;
    }
    /* a content block */
    var w = el('div', 'ch-blocks');
    if (s.g.head) w.appendChild(s.g.head.cloneNode(true));
    s.g.nodes.forEach(function (n) { w.appendChild(n.cloneNode(true)); });
    return w;
  }

  function ensure(i) {
    while (cur.rendered.length <= i) {
      var k = cur.rendered.length;
      var node = slideNode(cur.slides[k]);
      node.classList.add('ch-block');
      node.hidden = true;
      buildReader().read.appendChild(node);
      cur.rendered.push(node);
    }
  }

  function show(i, animate) {
    var r = buildReader();
    if (i < 0) i = 0;
    if (i > cur.slides.length - 1) i = cur.slides.length - 1;
    cur.i = i;
    ensure(i);
    cur.rendered.forEach(function (n, k) {
      var on = k <= i;
      n.hidden = !on;
      /* older text recedes, so the newest block is always the brightest thing
         on screen. Both classes come from the shipped CSS. */
      n.classList.toggle('ch-now', k === i);
      n.classList.toggle('ch-recede', k < i);
      if (on && animate !== false) {
        n.classList.remove('is-in');
        void n.offsetWidth;
        n.classList.add('is-in');
      }
    });
    var frac = cur.slides.length > 1 ? (i + 1) / cur.slides.length : 0;
    if (r.fill) r.fill.style.width = (frac * 100).toFixed(1) + '%';
    if (r.count) r.count.textContent = (i + 1) + ' / ' + cur.slides.length;
    if (r.back) r.back.disabled = i === 0;
    var last = i === cur.slides.length - 1;
    if (r.next) {
      r.next.disabled = last;
      var sp = E('span', r.next);
      if (sp) plain(sp, last ? T('Finish', '完成') : T('Next', '下一句'),
                        last ? T('完成', '完成') : T('下一句', '下一句'));
    }
    paintMap();
    if (drillOn) applyDrill();
    if (i > 0 && animate !== false) {
      try { r.read.scrollTo({ top: r.read.scrollHeight, behavior: 'smooth' }); } catch (e) {}
    }
    /* Read is recorded at the last block of content, not at the end card, so
       closing the reader one press early still counts. */
    if (cur.code && (cur.slides[i].t === 'end' ||
        (cur.slides[i].t === 'blk' && i === cur.slides.length - 2))) markRead(cur.code);
  }

  function nextSection(sec) {
    var list = allSections();
    for (var i = 0; i < list.length; i++) if (list[i].code === sec.code) return list[i + 1] || null;
    return null;
  }

  /* ── the drill: blank this section's key terms, tap to reveal ─────────── */
  var drillOn = false;

  function esc4re(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* A naive String.replace over innerHTML also rewrites text inside attribute
     values. Every paragraph on these pages carries data-en / data-zh, so the
     drill would corrupt the translation it depends on — and it would corrupt it
     silently, because the attribute is still syntactically valid HTML. Only the
     text BETWEEN tags is touched. */
  function blankText(t, re) {
    re.lastIndex = 0;
    return t.replace(re, '<b class="ch-blank" tabindex="0" role="button" data-hint="tap"></b>');
  }
  function blankOutsideTags(html, re) {
    var tag = /<\/?[a-zA-Z][^>]*>/g, out = '', last = 0, m;
    while ((m = tag.exec(html))) {
      out += blankText(html.slice(last, m.index), re) + m[0];
      last = m.index + m[0].length;
    }
    return out + blankText(html.slice(last), re);
  }

  function applyDrill() {
    var sec = sectionByCode(cur.code);
    if (!sec) return;
    var terms = (course.drillFor ? course.drillFor(sec) : [])
      .filter(function (t) { return t && String(t).length > 3; })
      /* longest first, so "peptide bond" wins over "bond" */
      .sort(function (a, b) { return String(b).length - String(a).length; });
    var re = terms.length
      ? new RegExp('(' + terms.map(esc4re).join('|') + ')', 'gi')
      : null;
    cur.rendered.forEach(function (n) {
      if (!n.classList.contains('ch-blocks')) return;
      if (n._chHtml == null) n._chHtml = n.innerHTML;
      /* Restore first, then re-wrap only when the drill is on. Skipping the
         restore is how "turn it off" used to leave every sentence blanked: the
         guard tested for the very elements it had already replaced. */
      n.innerHTML = n._chHtml;
      if (!drillOn || !re) return;
      /* Tables stay legible on purpose: hiding a term inside a table makes the
         table unreadable rather than active. */
      EE('p, li, dd', n).forEach(function (p) {
        var out = blankOutsideTags(p.innerHTML, re);
        if (out !== p.innerHTML) p.innerHTML = out;
      });
      EE('.ch-blank', n).forEach(function (b) {
        b.addEventListener('click', function () { b.classList.add('is-open'); });
        b.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.classList.add('is-open'); }
        });
      });
    });
  }
  function toggleDrill() {
    drillOn = !drillOn;
    var r = buildReader();
    if (r.drill) r.drill.setAttribute('aria-pressed', drillOn ? 'true' : 'false');
    applyDrill();
  }

  /* ── the rail drawer ─────────────────────────────────────────────────── */
  function openRail() {
    var r = buildReader();
    r.rail.classList.add('is-open');
    r.scrim.classList.add('is-open');
  }
  function closeRail() {
    var r = buildReader();
    r.rail.classList.remove('is-open');
    r.scrim.classList.remove('is-open');
  }

  /* ═══ the hub ════════════════════════════════════════════════════════════ */
  var course = null;
  var view = 'resources';
  var code = null;
  var unknown = null;   /* a code the route carried that no section answers to */

  function allSections() {
    var out = [];
    course.chapters.forEach(function (ch) { ch.sections.forEach(function (s) { out.push(s); }); });
    return out;
  }
  function sectionByCode(c) {
    var list = allSections();
    for (var i = 0; i < list.length; i++) if (list[i].code === c) return list[i];
    return null;
  }
  function chapterOf(c) {
    for (var i = 0; i < course.chapters.length; i++) {
      var ch = course.chapters[i];
      for (var j = 0; j < ch.sections.length; j++) if (ch.sections[j].code === c) return ch;
    }
    return null;
  }
  function readCount(sec) { return (course.progress.isRead(sec.code) ? 1 : 0); }
  function seenOf(list) {
    var n = 0;
    list.forEach(function (s) { n += readCount(s); });
    return n;
  }
  function recommended() {
    var list = allSections(), pick = list[0], best = -1;
    list.forEach(function (s) {
      var seen = readCount(s);
      if (seen) return;                    /* already read: never recommend */
      if (seen > best) { best = seen; pick = s; }
    });
    return pick || list[0];
  }

  function paintHeader() {
    var host = E(course.headMount);
    if (!host) return;
    host.innerHTML = '';
    var wrap = el('div', 'ch-course');
    var bar = el('div', 'ch-course__bar');
    var left = el('div');
    left.appendChild(plain(el('span', 'ch-course__label'), course.kicker.en, course.kicker.zh));
    left.appendChild(plain(el('h1', 'ch-course__title'), course.headline.en, course.headline.zh));
    bar.appendChild(left);
    var acts = el('div', 'ch-course__acts');
    (course.headActions || []).forEach(function (a) {
      var b = el('button', 'ch-course__btn' + (a.primary ? ' ch-course__btn--primary' : ''));
      b.type = 'button';
      plain(b, a.en, a.zh);
      b.addEventListener('click', a.onClick);
      acts.appendChild(b);
    });
    bar.appendChild(acts);
    wrap.appendChild(bar);

    var tot = allSections().length, seen = seenOf(allSections());
    var ov = el('div', 'ch-overall');
    var track = el('div', 'ch-overall__bar');
    var fill = el('div', 'ch-overall__fill');
    fill.style.width = (tot ? Math.round(seen / tot * 100) : 0) + '%';
    track.appendChild(fill);
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(tot));
    track.setAttribute('aria-valuenow', String(seen));
    ov.appendChild(track);
    ov.appendChild(el('span', 'ch-overall__n', (tot ? Math.round(seen / tot * 100) : 0) + '%'));
    ov.appendChild(plain(el('span', 'ch-overall__t'),
      seen + ' / ' + tot + ' ' + T('sections read', '节已读'),
      seen + ' / ' + tot + ' ' + T('节已读', '节已读')));
    wrap.appendChild(ov);
    host.appendChild(wrap);
  }

  function openHub() {
    closeReader();
    document.body.classList.remove('ch-reading');
    var host = E(course.hubMount);
    if (!host) return;
    host.hidden = false;
    var bodyEl = course.pageBody ? E(course.pageBody) : null;
    if (bodyEl) bodyEl.hidden = true;
    var raw = course.rawMount ? E(course.rawMount) : null;
    if (raw) raw.hidden = true;

    host.innerHTML = '';

    var hero = el('header', 'ch-hero');
    hero.appendChild(plain(el('span', 'ch-hero__kicker'), course.subject.en, course.subject.zh));
    hero.appendChild(plain(el('p', 'ch-hero__title'), course.subject.en, course.subject.zh));
    hero.appendChild(plain(el('p', 'ch-hero__sub'), course.blurb.en, course.blurb.zh));
    host.appendChild(hero);

    var tabs = el('div', 'ch-tabs');
    course.tabs.forEach(function (t) {
      var b = el('button', 'ch-tab', T(t.en, t.zh));
      b.type = 'button';
      b.dataset.view = t.id;
      b.addEventListener('click', function () { go('#' + t.id); });
      tabs.appendChild(b);
    });
    host.appendChild(tabs);
    host.appendChild(el('div', 'ch-pane'));
    paintPane();
  }

  function paintPane() {
    var host = E(course.hubMount);
    var pane = E('.ch-pane', host);
    if (!pane) return;
    EE('.ch-tab', host).forEach(function (b) { b.classList.toggle('is-on', b.dataset.view === view); });
    pane.innerHTML = '';
    if (unknown) pane.appendChild(missingNotice(pane, unknown));
    if (view === 'progress') return paintProgress(pane);
    if (view === 'topic') return paintTopic(pane);
    if (view === 'defs') return paintDefs(pane);
    paintResources(pane);
  }

  function crumb(pane, trail) {
    var nav = el('nav', 'ch-crumb');
    trail.forEach(function (t, i) {
      if (i) nav.appendChild(el('span', 'ch-crumb__sep', '/'));
      if (t.hash) {
        var a = el('button', 'ch-crumb__link', t.label);
        a.type = 'button';
        a.addEventListener('click', function () { go(t.hash); });
        nav.appendChild(a);
      } else {
        nav.appendChild(el(i === trail.length - 1 ? 'b' : 'span', null, t.label));
      }
    });
    pane.appendChild(nav);
  }

  function tile(o) {
    var b = el('button', 'ch-rtile');
    b.type = 'button';
    if (o.icon) b.appendChild(icon(o.icon, 'ch-rtile__ico'));
    var t = el('span', 'ch-rtile__txt');
    t.appendChild(plain(el('strong', null), o.en, o.zh));
    if (o.sub) t.appendChild(plain(el('span', null), o.sub.en, o.sub.zh));
    if (o.count != null) t.appendChild(plain(el('em', null), o.count.en, o.count.zh));
    b.appendChild(t);
    b.addEventListener('click', o.onClick);
    return b;
  }
  function pairTxt(a, b2) { return { en: a, zh: b2 }; }

  /* An unrecognised code must say so. Silently redirecting to the topic list is
     the same class of bug as a deep link that renders nothing: the reader is
     told nothing and concludes the page is broken. `.ch-missing` ships with the
     extracted CSS for exactly this. */
  function missingNotice(pane, code) {
    var b = el('div', 'ch-missing');
    b.appendChild(plain(el('p', 'ch-missing__title'),
      T('That section is not in this course', '本课程中没有这个小节'),
      T('本课程中没有这个小节', '本课程中没有这个小节')));
    var c = el('p', 'ch-missing__code');
    c.appendChild(document.createTextNode(T('You asked for ', '你访问的编号是 ') + code));
    b.appendChild(c);
    b.appendChild(plain(el('p', 'ch-missing__hint'),
      T('It may have been renamed. The full list of sections is below, and every one of them still works.',
        '它可能已被重命名。下面是完整的小节列表，每一个都仍然可用。'),
      T('它可能已被重命名。下面是完整的小节列表，每一个都仍然可用。',
        '它可能已被重命名。下面是完整的小节列表，每一个都仍然可用。')));
    var row = el('div', 'ch-missing__row');
    var go2 = el('button', 'ch-missing__btn');
    go2.type = 'button';
    plain(go2, T('All sections', '全部小节'), T('全部小节', '全部小节'));
    go2.addEventListener('click', function () { go('#progress'); });
    row.appendChild(go2);
    var home = el('button', 'ch-missing__btn ch-missing__btn--ghost');
    home.type = 'button';
    plain(home, T('Course home', '课程首页'), T('课程首页', '课程首页'));
    home.addEventListener('click', function () { go('#'); });
    row.appendChild(home);
    b.appendChild(row);
    return b;
  }

  function paintResources(pane) {
    var rec = recommended();
    var rst = statsOf(rec);
    var box = el('div', 'ch-cta');
    var started = readCount(rec) > 0;
    var txt = el('span', 'ch-cta__txt');
    txt.appendChild(el('span', 'ch-cta__eyebrow',
      started ? T('Pick up where you left off', '继续上次的学习') : T('Start here', '从这里开始')));
    txt.appendChild(plain(el('span', 'ch-cta__title'), rec.code + ' ' + rec.en, rec.code + ' ' + rec.zh));
    txt.appendChild(plain(el('span', 'ch-cta__sub'),
      rst.blocks + ' ' + T('blocks', '段') + ' · ' + rst.terms + ' ' + T('key terms', '关键术语'),
      rst.blocks + ' ' + T('段', '段') + ' · ' + rst.terms + ' ' + T('关键术语', '关键术语')));
    box.appendChild(txt);
    var go2 = el('button', 'ch-cta__go');
    go2.type = 'button';
    go2.appendChild(el('span', null, T('Start lesson', '开始学习')));
    go2.appendChild(icon('play'));
    go2.addEventListener('click', function () { go('#lesson/' + rec.code); });
    box.appendChild(go2);
    pane.appendChild(box);

    function section(en, zh, build) {
      pane.appendChild(el('h2', 'ch-rsec', T(en, zh)));
      var g = el('div', 'ch-rgrid');
      build(g);
      pane.appendChild(g);
    }

    var all = allSections();
    var totTerms = 0;
    all.forEach(function (s) { totTerms += statsOf(s).terms; });

    section('Learn', '学习', function (g) {
      g.appendChild(tile({
        icon: 'book', en: 'Lesson', zh: '引导课',
        sub: pairTxt('One lesson per section, one block at a time', '每节一课，一次一段'),
        count: pairTxt(all.length + ' ' + T('sections', '节'), all.length + ' ' + T('节', '节')),
        onClick: function () { go('#progress'); }
      }));
      g.appendChild(tile({
        icon: 'note', en: 'Study guide', zh: '教材正文',
        sub: pairTxt('The full course text, tables and models', '完整正文、表格与模型'),
        count: pairTxt(statsOf(rec).blocks + ' ' + T('blocks', '段'),
                       statsOf(rec).blocks + ' ' + T('段', '段')),
        onClick: function () { go('#topic/' + rec.code); }
      }));
      g.appendChild(tile({
        icon: 'grid', en: 'Key definitions', zh: '关键定义',
        sub: pairTxt('Every key term with its definition', '全部术语与定义'),
        count: pairTxt(totTerms + ' ' + T('definitions', '个定义'),
                       totTerms + ' ' + T('个定义', '个定义')),
        onClick: function () { go('#defs/' + rec.code); }
      }));
    });

    section('Practice', '练习', function (g) {
      (course.practice || []).forEach(function (p) {
        g.appendChild(tile({
          icon: p.icon, en: p.en, zh: p.zh, sub: p.sub, count: p.count, onClick: p.onClick
        }));
      });
    });

    if ((course.reference || []).length) {
      section('Reference', '速查', function (g) {
        course.reference.forEach(function (rf) {
          g.appendChild(tile({
            icon: rf.icon, en: rf.en, zh: rf.zh, sub: rf.sub, count: rf.count,
            onClick: function () { go('#raw/' + rf.id); }
          }));
        });
      });
    }
  }

  function paintProgress(pane) {
    var box = el('div', 'ch-legendbox');
    box.appendChild(el('p', 'ch-legendbox__t', T('Section progress system', '小节进度体系')));
    var leg = el('div', 'ch-legend');
    LEVELS.forEach(function (L) {
      var it = el('div', 'ch-legend__item');
      it.appendChild(el('span', 'ch-lev ch-lev--' + L.k));
      it.appendChild(el('span', null, T(L.en, L.zh)));
      leg.appendChild(it);
    });
    box.appendChild(leg);
    pane.appendChild(box);

    course.chapters.forEach(function (ch) {
      if (!ch.sections.length) return;
      var head = el('h2', 'ch-chhead');
      head.appendChild(el('span', 'ch-chhead__n', T('Lesson ' + ch.n, '第 ' + ch.n + ' 节')));
      head.appendChild(plain(el('span', 'ch-chhead__t'), ch.en, ch.zh));
      var seen = seenOf(ch.sections);
      head.appendChild(el('span', 'ch-chhead__n', seen + '/' + ch.sections.length));
      pane.appendChild(head);
      var ul = el('ul', 'ch-tlist');
      ch.sections.forEach(function (s) { ul.appendChild(topicRow(s)); });
      pane.appendChild(ul);
    });
  }

  function topicRow(s) {
    var seen = readCount(s);
    var lv = seen ? SEEN : UNSEEN;
    var li = el('li', 'ch-trowwrap');
    var b = el('button', 'ch-trow');
    b.type = 'button';
    b.appendChild(el('span', 'ch-lev ch-lev--' + lv.k));
    var txt = el('span', 'ch-trow__txt');
    txt.appendChild(plain(el('strong', null), s.code + ' ' + s.en, s.code + ' ' + s.zh));
    var st = statsOf(s);
    txt.appendChild(el('span', 'ch-trow__meta',
      st.blocks + ' ' + T('blocks', '段') + ' · ' + st.terms + ' ' + T('terms', '术语')));
    b.appendChild(txt);
    b.addEventListener('click', function () { go('#topic/' + s.code); });
    li.appendChild(b);
    var pill = el('button', 'ch-trowgo' + (seen ? ' ch-trowgo--done' : ''));
    pill.type = 'button';
    pill.appendChild(icon(seen ? 'check' : 'play'));
    pill.appendChild(el('span', null, seen ? T('Review', '复习') : T('Start lesson', '开始学习')));
    pill.addEventListener('click', function () { go('#lesson/' + s.code); });
    li.appendChild(pill);
    return li;
  }

  function paintTopic(pane) {
    var s = sectionByCode(code);
    if (!s) { unknown = code; view = 'resources'; return openHub(); }
    var ch = chapterOf(s.code);
    crumb(pane, [
      { label: T(course.subject.en, course.subject.zh), hash: '#' },
      { label: T('Lesson ' + ch.n, '第 ' + ch.n + ' 节'), hash: '#progress' },
      { label: s.code + ' ' + T('Section', '小节') }
    ]);
    pane.appendChild(plain(el('h1', 'ch-dt__title'), s.code + ' ' + s.en, s.code + ' ' + s.zh));

    var st = statsOf(s);
    var seen = readCount(s);
    var lv = seen ? SEEN : UNSEEN;
    var strip = el('div', 'ch-strip');
    var sl = el('div', 'ch-strip__lev');
    sl.appendChild(el('span', 'ch-lev ch-lev--' + lv.k));
    sl.appendChild(el('strong', null, T(lv.en, lv.zh)));
    strip.appendChild(sl);
    var stats = el('div', 'ch-strip__stats');
    [[T('Blocks', '段落'), String(st.blocks)],
     [T('Tables', '表格'), String(st.tables)],
     [T('Figures', '图'), String(st.figures)],
     [T('Terms', '术语'), String(st.terms)]].forEach(function (p) {
      var b = el('div', 'ch-stat');
      b.appendChild(el('b', null, p[1]));
      b.appendChild(el('span', null, p[0]));
      stats.appendChild(b);
    });
    strip.appendChild(stats);
    pane.appendChild(strip);

    function sec(en, zh, build) {
      pane.appendChild(el('h2', 'ch-rsec', T(en, zh)));
      var g = el('div', 'ch-rgrid');
      build(g);
      pane.appendChild(g);
    }
    sec('Learn', '学习', function (g) {
      g.appendChild(tile({
        icon: 'book', en: 'Lesson', zh: '引导课',
        sub: pairTxt('One block at a time, with a progress bar', '一次一段，带进度条'),
        count: pairTxt(st.blocks + ' ' + T('blocks', '段'),
                       st.blocks + ' ' + T('段', '段')),
        onClick: function () { go('#lesson/' + s.code); }
      }));
      g.appendChild(tile({
        icon: 'grid', en: 'Key definitions', zh: '关键定义',
        sub: pairTxt('Every key term in this section', '本节的全部术语'),
        count: pairTxt(st.terms + ' ' + T('definitions', '个定义'),
                       st.terms + ' ' + T('个定义', '个定义')),
        onClick: function () { go('#defs/' + s.code); }
      }));
      (course.practice || []).slice(0, 1).forEach(function (p) {
        g.appendChild(tile({
          icon: p.icon, en: p.en, zh: p.zh, sub: p.sub, count: p.count, onClick: p.onClick
        }));
      });
    });

    /* the section's own content, cloned out of the live accordion. Cloning is
       deliberate: the originals stay in the page (so nothing is ever lost and
       the static file still holds every word) and cloneNode does not carry
       listeners, so the concise-view button knowledge-fx injected is removed
       from the copy and the reader shows the section in full. */
    var det = el('div', 'ch-secinfo');
    var host = el('div', 'ch-guide');
    var inner = s.body;
    if (inner) {
      var copy = el('div', 'ch-blocks');
      copy.appendChild(buildSectionHead(s));
      var cl = inner.cloneNode(true);
      EE('.kn-more, .kn-digest', cl).forEach(function (n) { n.remove(); });
      cl.classList.remove('kn-brief');
      while (cl.firstChild) copy.appendChild(cl.firstChild);
      host.appendChild(copy);
    } else {
      host.appendChild(el('p', 'ch-empty', T('No content for this section yet.', '本节暂无内容。')));
    }
    det.appendChild(host);
    pane.appendChild(det);
  }

  function buildSectionHead(s) {
    var h = el('p', 'ch-dt__grouphead', s.code + ' · ' + (showCN ? s.zh : s.en));
    h.setAttribute('data-en', s.code + ' · ' + s.en);
    h.setAttribute('data-zh', s.code + ' · ' + s.zh);
    return h;
  }

  function paintDefs(pane) {
    var s = sectionByCode(code);
    if (!s) { unknown = code; view = 'resources'; return openHub(); }
    var ch = chapterOf(s.code);
    var back = el('button', 'ch-backpill');
    back.type = 'button';
    back.appendChild(icon('back'));
    back.appendChild(el('span', null, T('Sections', '小节')));
    back.addEventListener('click', function () { go('#progress'); });
    pane.appendChild(back);

    crumb(pane, [
      { label: T(course.subject.en, course.subject.zh), hash: '#' },
      { label: T('Lesson ' + ch.n, '第 ' + ch.n + ' 节'), hash: '#progress' },
      { label: s.code }
    ]);
    pane.appendChild(plain(el('h1', 'ch-dt__title'),
      T('Key definitions', '关键定义'), T('关键定义', '关键定义')));
    var defs = course.defsFor ? course.defsFor(s) : [];
    pane.appendChild(el('p', 'ch-dt__grouphead',
      defs.length
        ? T('Key terms in ' + s.code + '.', s.code + ' 的关键术语。')
        : T('No key terms in ' + s.code + ' yet.', s.code + ' 暂无术语。')));
    if (!defs.length) {
      /* fall back to the whole lesson, so the tile never dead-ends */
      var chdefs = [];
      ch.sections.forEach(function (x) {
        (course.defsFor ? course.defsFor(x) : []).forEach(function (d) { chdefs.push(d); });
      });
      if (!chdefs.length) {
        pane.appendChild(el('p', 'ch-empty', T('No key terms in this lesson yet.', '本节暂无术语。')));
        return;
      }
      pane.appendChild(el('p', 'ch-dt__grouphead',
        T('Nothing is tagged in ' + s.code + ', so here is the whole lesson:',
          s.code + ' 暂未标注术语，以下是整节的术语：')));
      pane.appendChild(buildDefs(pane, chdefs));
      return;
    }
    buildDefs(pane, defs);
  }

  function buildDefs(pane, defs) {
    var revealed = true;
    /* .ch-tile--toggle is the class the shipped stylesheet sizes; ch-rtile--
       toggle does not exist, so the button stretched to the full column and
       read as an empty card. */
    var toggle = el('button', 'ch-tile ch-tile--toggle', T('Hide definitions', '隐藏定义'));
    toggle.type = 'button';
    pane.appendChild(toggle);
    defs.forEach(function (d) {
      var card = el('div', 'ch-defcard');
      card.appendChild(plain(el('div', 'ch-defcard__t'), pair(d.t)[0], pair(d.t)[1]));
      var dd = plain(el('div', 'ch-defcard__d'), pair(d.d)[0], pair(d.d)[1]);
      card.appendChild(dd);
      pane.appendChild(card);
    });
    toggle.addEventListener('click', function () {
      revealed = !revealed;
      EE('.ch-defcard__d', pane).forEach(function (n) { n.hidden = !revealed; });
      plain(toggle, revealed ? T('Hide definitions', '隐藏定义') : T('Show definitions', '显示定义'),
                   revealed ? T('隐藏定义', '隐藏定义') : T('显示定义', '显示定义'));
    });
  }

  /* ── the host page's own sections, shown as they are ──────────────────── */

  /* knowledge-fx sizes an OPEN accordion with `max-height = scrollHeight`, and
     scrollHeight is 0 in a hidden subtree — so if the page body was hidden when
     that pass ran, every open accordion comes back collapsed the moment a
     #raw/ view unhides them. Re-fit on the way out. */
  function refitAccordions() {
    var scope = course.pageBody ? E(course.pageBody) : document;
    EE('.acc-item.open > .acc-body', scope).forEach(function (b) {
      if (b.scrollHeight > 0) b.style.maxHeight = b.scrollHeight + 'px';
    });
  }

  function openRaw(id) {
    if (!document.getElementById(id)) { unknown = null; go('#progress'); return; }
    closeReader();
    document.body.classList.remove('ch-reading');
    var host = E(course.hubMount);
    if (host) host.hidden = true;
    var bodyEl = course.pageBody ? E(course.pageBody) : null;
    if (bodyEl) bodyEl.hidden = false;
    refitAccordions();
    var target = document.getElementById(id);
    if (target) {
      setTimeout(function () {
        refitAccordions();
        try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
      }, 60);
    }
  }

  /* ── routing ──────────────────────────────────────────────────────────── */
  function go(h) {
    if (location.hash === h) route();
    else location.hash = h;
  }

  function route() {
    var h = (location.hash || '').replace(/^#/, '');
    var m;
    if ((m = h.match(/^lesson\/(.+)$/))) { openReader(decodeURIComponent(m[1])); return; }
    if ((m = h.match(/^raw\/(.+)$/))) { openRaw(m[1]); return; }
    if ((m = h.match(/^(topic|defs)\/(.+)$/))) {
      view = m[1];
      code = decodeURIComponent(m[2]);
      openHub();
      return;
    }
    view = h === 'progress' ? 'progress' : 'resources';
    code = null;
    unknown = null;
    openHub();
  }

  function markRead(c) { course.progress.markRead(c); }

  /* ── language / dark, kept in step with the host page ─────────────────── */
  function hostToggle(id, fallback) {
    return function () {
      var b = document.getElementById(id);
      if (b) { b.click(); return; }
      fallback();
    };
  }

  function wire() {
    var r = buildReader();
    r.exit.addEventListener('click', function () {
      closeReader();
      if (location.hash.indexOf('#lesson/') === 0) go('#topic/' + cur.code); else route();
    });
    r.next.addEventListener('click', function () {
      if (cur.i < cur.slides.length - 1) show(cur.i + 1);
      else { closeReader(); go('#topic/' + cur.code); }
    });
    r.back.addEventListener('click', function () { if (cur.i > 0) show(cur.i - 1); });
    r.drill.addEventListener('click', toggleDrill);
    r.railToggle.addEventListener('click', openRail);
    r.railClose.addEventListener('click', closeRail);
    r.scrim.addEventListener('click', closeRail);
    r.railHub.addEventListener('click', function () { closeRail(); go('#progress'); });
    r.lang.addEventListener('click', hostToggle('langToggle', function () {
      showCN = !showCN;
      try { localStorage.setItem('sm_lang', showCN ? 'zh' : 'en'); } catch (e) {}
      applyChrome();
    }));
    r.dark.addEventListener('click', hostToggle('darkToggle', function () {
      document.body.classList.toggle('dark');
      applyChrome();
    }));

    document.addEventListener('keydown', function (e) {
      if (!r.root || r.root.hidden) return;
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { if (cur.i < cur.slides.length - 1) { e.preventDefault(); show(cur.i + 1); } }
      else if (e.key === 'ArrowLeft') { if (cur.i > 0) { e.preventDefault(); show(cur.i - 1); } }
      else if (e.key === 'Escape') { closeRail(); }
    });
    window.addEventListener('hashchange', route);
    window.addEventListener('resize', closeRail);
  }

  function applyChrome() {
    readLang();
    document.body.classList.toggle('lang-zh', showCN);
    document.body.classList.toggle('lang-en', !showCN);
    refreshAll(document);
    if (buildReader().root.hidden) {
      paintHeader();
      var host = E(course.hubMount);
      if (host && !host.hidden) openHub();
      return;
    }
    /* the reader is up: re-render it so the new language is real, not a
       data-attribute swap that leaves the built nodes stale. The block index
       is kept — flipping 中/EN mid-lesson should not throw you back to the
       cover. */
    var code_ = cur.code, at = cur.i;
    if (code_) { openReader(code_); if (at > 0) show(Math.min(at, cur.slides.length - 1), false); }
  }

  /* ── mount ────────────────────────────────────────────────────────────── */
  function mount(spec) {
    course = spec;
    readLang();
    buildReader();
    /* The reader's own chrome is authored as literal English strings with
       data-en / data-zh on them, so it needs one translation pass — otherwise a
       first load in 中文 leaves "← All sections" in English while everything
       around it is translated, and nothing warns you. */
    refreshAll(document);
    if (!wireDone) { wire(); wireDone = true; }

    /* Follow the host page's own language and dark toggles. Capture phase,
       because tutorial-widget also binds #langToggle and can stop the bubble
       phase — a bubble listener here would simply never run. */
    ['langToggle', 'darkToggle'].forEach(function (id) {
      var b = document.getElementById(id);
      if (!b || b.__chWired) return;
      b.__chWired = true;
      b.addEventListener('click', function () { setTimeout(applyChrome, 60); }, true);
    });

    paintHeader();
    route();
  }
  var wireDone = false;

  window.CourseHub = {
    mount: mount,
    /* exposed for the page's own regression probes */
    _internal: {
      allSections: allSections,
      statsOf: function (c) { return statsOf(sectionByCode(c)); },
      paintPane: paintPane,
      route: route,
      openReader: openReader
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { /* pages call mount() themselves */ });
  }
})();
/* IB SEHS — Cornell-style cue column + memorization mode  (ib-sehs-learn.html)
   ------------------------------------------------------------------
   The lesson is a single centred column. This splits it in two, BELOW the
   "Learn it your way" panel, without touching anything already there:

     .native-lesson
       .ib-learn-wrap.ib-learn      <- unchanged, stays full width
       .ib-cornell                  <- new grid
         aside.ib-cornell-cue        <- LEFT  key terms + definitions, formulas,
                                            exam focus, key-knowledge chips
         div.ib-cornell-main         <- RIGHT the whole existing lesson, verbatim
           ... every original child ...
           div.ib-cover              <- the memorization cover (absolute, inset 0)

   Two things make this work and both were measured, not assumed:
   1. the cue column uses position:sticky, which is DEAD inside .acc-body
      because that box is overflow:hidden. The page CSS moves both .acc-item
      and .acc-body to overflow:clip, which does not create a scroll container,
      so sticky resolves against the viewport again (verified: cue y 6 -> 80).
   2. .acc-body{overflow:clip} still reports scrollHeight, so the accordion's
      max-height math in toggleAcc is unchanged (verified 14992 both ways).

   Every piece of cue content is read back out of the DOM that
   ib-sehs-course.js already rendered, in the language currently on screen, and
   refresh() re-reads it — so a cue can never drift from the text beside it. */
(function () {
  'use strict';

  var STORE = 'ib_recall';
  var STICK_TOP = 76;   /* where the cue column parks, under the sticky top bar  */
  var MARK = 132;       /* viewport line that decides which section is "current"   */
  var JUMP = 124;       /* scroll offset used when a cue is clicked               */
  var MAX_CHIPS = 14;
  var LIVE = [];
  var queued = false;
  var drawerOpen = false;

  /* ---------------------------------------------------------------- utils */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function cn() { return document.body.classList.contains('lang-zh'); }
  function T(en, zh) { return cn() ? zh : en; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function loadStore() { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; } }
  function saveStore(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }
  function both(node, en, zh) { if (en != null) node.setAttribute('data-en', en); if (zh != null) node.setAttribute('data-zh', zh); return node; }

  /* ------------------------------------------------------------- scoring */
  var STOP = { and: 1, the: 1, with: 1, that: 1, this: 1, from: 1, into: 1, when: 1, they: 1, their: 1, which: 1, have: 1, has: 1, are: 1, was: 1, were: 1, for: 1, its: 1, it: 1, of: 1, to: 1, in: 1, on: 1, as: 1, by: 1, at: 1, an: 1, be: 1, is: 1, or: 1, you: 1, your: 1, can: 1, will: 1, more: 1, than: 1, then: 1, also: 1, such: 1, these: 1, those: 1, used: 1, using: 1, between: 1, without: 1, both: 1, each: 1, will: 1, most: 1, some: 1, only: 1, other: 1, same: 1, time: 1, over: 1, very: 1, much: 1, they: 1 };

  /* Key words a typed answer is graded against: long content words for English,
     character bigrams for Chinese (Chinese has no spaces to split on). */
  function keywords(def) {
    var out = [], seen = {}, latin = [], cjk = [], m, run, i, w, g;
    var text = String(def || '');
    m = text.toLowerCase().match(/[a-z][a-z'\-]{3,}/g) || [];
    for (i = 0; i < m.length; i++) {
      w = m[i].replace(/[-']/g, '');
      if (w.length < 4 || STOP[w] || seen[w]) continue;
      seen[w] = 1; latin.push(w);
    }
    var runs = text.replace(/[^\u3400-\u9fff]+/g, ' ').split(/\s+/);
    for (i = 0; i < runs.length; i++) {
      run = runs[i];
      for (var k = 0; k + 2 <= run.length; k++) {
        g = run.substr(k, 2);
        if (seen[g]) continue;
        seen[g] = 1; cjk.push(g);
      }
    }
    latin.sort(function (a, b) { return b.length - a.length; });
    return latin.slice(0, 5).concat(cjk.slice(0, 5));
  }

  function grade(answer, def) {
    var defs = Array.isArray(def) ? def : [def];
    var keys = [], i;
    for (i = 0; i < defs.length; i++) {
      var kw = keywords(defs[i]);
      for (var j = 0; j < kw.length; j++) if (keys.indexOf(kw[j]) < 0) keys.push(kw[j]);
    }
    if (!keys.length) return { pct: 0, hit: 0, total: 0, miss: [] };
    var a = String(answer || '').toLowerCase(), hit = 0, miss = [];
    for (i = 0; i < keys.length; i++) { if (a.indexOf(keys[i]) >= 0) hit++; else miss.push(keys[i]); }
    return { pct: hit / keys.length, hit: hit, total: keys.length, miss: miss };
  }

  function defOf(t) { return cn() ? (t.dZh || t.dEn) : (t.dEn || t.dZh); }

  function feedback(res, hasAnswer) {
    if (!hasAnswer) return { tone: '', msg: T('Write what you remember first, then check.', '先写下你记得的内容，再点检查。') };
    if (!res.total) return { tone: 'mid', msg: T('No definition is listed for this one — write your own, then use Show answer to check it.', '本条未给出定义 — 自己写一条，再用「看答案」核对。') };
    if (res.pct >= 0.6) return { tone: 'ok', msg: T('Good — you hit ' + res.hit + ' of ' + res.total + ' key points.', '不错 — 你答对了 ' + res.total + ' 个要点中的 ' + res.hit + ' 个。') };
    if (res.pct >= 0.25) return { tone: 'mid', msg: T('Partly there. Still missing: ' + res.miss.slice(0, 4).join(', ') + '.', '部分正确。还缺：' + res.miss.slice(0, 4).join('、') + '。') };
    return { tone: 'no', msg: T('Not yet — read the answer below, then say it again from memory.', '还不对 — 先看下面的答案，再合上重新说一遍。') };
  }

  /* ------------------------------------------------- read cues from the DOM */
  /* Every field is read with its data-en / data-zh pair where one exists, so the
     cue column is in the same language as the text it sits next to. */
  function readCues(main, item) {
    var out = [];
    $$('.native-section', main).forEach(function (sec, i) {
      var h3 = $('h3', sec);
      var g = {
        i: i, sec: sec, seen: {},
        titleEn: h3 ? (h3.dataset.en || h3.textContent) : ('Section ' + (i + 1)),
        titleZh: h3 ? (h3.dataset.zh || h3.textContent) : ('Section ' + (i + 1)),
        terms: [], formulas: [], chips: [], focus: null
      };
      $$('.native-terms .native-term', sec).forEach(function (row) {
        var dt = $('dt', row), dd = $('dd', row);
        if (!dt) return;
        var en = (dt.dataset && dt.dataset.en) || dt.textContent;
        if (!en) return;
        var key = 't' + en.toLowerCase();
        if (g.seen[key]) return; g.seen[key] = 1;
        g.terms.push({
          en: en, zh: (dt.dataset && dt.dataset.zh) || en,
          dEn: dd ? ((dd.dataset && dd.dataset.en) || dd.textContent) : '',
          dZh: dd ? ((dd.dataset && dd.dataset.zh) || (dd.dataset && dd.dataset.en) || dd.textContent) : '',
          node: row
        });
      });
      /* A .native-formula is <b>label</b> + optional <code>formula</code> +
         optional <code>formulaZh</code> + optional <span>definition</span>.
         Plenty of them ship as a long sentence in the <b> and nothing else, so
         requiring a <code> OR a short label is what keeps prose out of a cue. */
      $$('.native-formulas .native-formula', sec).forEach(function (f) {
        var label = $('b', f), note = $('span', f);
        var codes = $$('code', f).map(function (c) { return c.textContent; }).filter(Boolean);
        var lab = label ? ((label.dataset && label.dataset.en) || label.textContent) : '';
        if (!codes.length && lab.length > 70) return;
        var expr = codes.join('  ·  ') || lab;
        if (!expr) return;
        g.formulas.push({
          expr: expr.length > 96 ? expr.slice(0, 95).trim() + '…' : expr,
          nEn: note ? ((note.dataset && note.dataset.en) || note.textContent) : '',
          nZh: note ? ((note.dataset && note.dataset.zh) || (note.dataset && note.dataset.en) || note.textContent) : ''
        });
      });
      var fEl = $('.native-focus p', sec) || $('.native-focus span', sec);
      if (fEl) g.focus = { en: (fEl.dataset && fEl.dataset.en) || fEl.textContent, zh: (fEl.dataset && fEl.dataset.zh) || fEl.textContent };
      $$('b.kt', sec).forEach(function (b) {
        var t = (b.textContent || '').trim();
        if (!t || t.length > 46) return;
        var k = 'c' + t.toLowerCase();
        if (g.seen[k]) return; g.seen[k] = 1;
        g.chips.push({ t: t, node: b });
      });
      if (g.chips.length > MAX_CHIPS) g.chips.length = MAX_CHIPS;
      out.push(g);
    });
    /* The flip cards list this topic's full term set — the syllabus terms plus
       any hand-written TERM_OVERRIDE ones (on A.1.1: synapse, neurotransmitter,
       receptor, gland, hormone, target cell). Reading only the syllabus terms
       here made the two columns disagree. The leftovers belong to the topic
       rather than to one section, so they get their own group, anchored to the
       last section so it cannot scroll out on its own. */
    if (item && window.IBSEHSModels && window.IBSEHSModels.topicTerms) {
      var have = {};
      out.forEach(function (g) { g.terms.forEach(function (t) { have[String(t.en).toLowerCase()] = 1; }); });
      var extra = window.IBSEHSModels.topicTerms(item.getAttribute('data-topic'), main)
        .filter(function (t) { return !have[String(t.en).toLowerCase()]; });
      if (extra.length && out.length) {
        out.push({
          i: out.length, sec: out[out.length - 1].sec, seen: {}, extra: true,
          titleEn: 'Wider vocabulary', titleZh: '拓展词汇',
          terms: extra, formulas: [], chips: [], focus: null
        });
      }
    }
    return out;
  }

  function hasCues(g) { return g.terms.length || g.formulas.length || g.chips.length || g.focus; }

  /* ------------------------------------------------------------- the cues */
  function renderCues(rec) {
    var cue = rec.cue;
    cue.textContent = '';

    var bar = el('div', 'ib-cue-bar');
    var mem = el('button', 'ib-cue-mem');
    mem.type = 'button';
    mem.setAttribute('aria-pressed', rec.mem ? 'true' : 'false');
    mem.textContent = rec.mem ? T('Memorization · on', '记忆模式 · 开') : T('Memorization', '记忆模式');
    mem.addEventListener('click', function () { setMem(rec, !rec.mem); });
    bar.appendChild(mem);
    /* a count, not the words "key terms" — those already head each card */
    var nTerms = 0, nCards = 0;
    rec.cues.forEach(function (g) { if (!hasCues(g)) return; nCards++; nTerms += g.terms.length; });
    bar.insertBefore(el('span', 'ib-cue-bar-t',
      nTerms ? T(nTerms + ' terms · ' + nCards + (nCards === 1 ? ' section' : ' sections'),
        nTerms + ' 个术语 · ' + nCards + ' 小节')
        : T('Cue column', '线索栏')), mem);
    var close = el('button', 'ib-cue-close');
    close.type = 'button';
    close.setAttribute('aria-label', T('Close key terms', '关闭关键术语'));
    close.textContent = '×';
    close.addEventListener('click', function () { setDrawer(false); });
    bar.appendChild(close);
    cue.appendChild(bar);

    var list = el('div', 'ib-cue-list');
    if (!rec.cues.length || !rec.cues.some(hasCues)) {
      list.appendChild(el('p', 'ib-cue-empty', T('This topic lists no key terms yet — read the section and use Memorization to test yourself.',
        '本主题暂未列出关键术语 — 请阅读正文，并用记忆模式自测。')));
    }
    rec.cues.forEach(function (g) {
      if (!hasCues(g)) return;
      var card = el('div', 'ib-cue-card');
      card.dataset.i = g.i;

      var head = el('button', 'ib-cue-h');
      head.type = 'button';
      head.textContent = T(g.titleEn, g.titleZh);
      head.addEventListener('click', function () { jump(g.sec.querySelector('h3') || g.sec); });
      card.appendChild(head);

      if (g.focus) {
        var f = el('p', 'ib-cue-focus');
        f.textContent = T(g.focus.en, g.focus.zh);
        card.appendChild(f);
      }

      if (g.terms.length) {
        card.appendChild(el('h6', 'ib-cue-lab', T('Key terms', '关键术语')));
        var dl = el('dl', 'ib-cue-terms');
        g.terms.forEach(function (t) {
          var row = el('div', 'ib-cue-term');
          var dt = el('dt');
          var b = el('button', 'ib-cue-term-b', T(t.en, t.zh));
          b.type = 'button';
          b.addEventListener('click', function () { jump(t.node); });
          dt.appendChild(b);
          row.appendChild(dt);
          if (t.dEn) row.appendChild(el('dd', '', T(t.dEn, t.dZh)));
          dl.appendChild(row);
        });
        card.appendChild(dl);
      }

      if (g.formulas.length) {
        card.appendChild(el('h6', 'ib-cue-lab', T('Formulas', '公式')));
        var fu = el('ul', 'ib-cue-formulas');
        g.formulas.forEach(function (f2) {
          var li = el('li');
          li.appendChild(el('code', '', f2.expr));
          if (f2.nEn) li.appendChild(el('span', '', T(f2.nEn, f2.nZh)));
          fu.appendChild(li);
        });
        card.appendChild(fu);
      }

      if (g.chips.length) {
        card.appendChild(el('h6', 'ib-cue-lab', T('Key knowledge', '核心知识')));
        var wrap = el('div', 'ib-cue-chips');
        g.chips.forEach(function (c) {
          var chip = el('button', 'ib-cue-chip', c.t);
          chip.type = 'button';
          chip.addEventListener('click', function () { jump(c.node); });
          wrap.appendChild(chip);
        });
        card.appendChild(wrap);
      }
      list.appendChild(card);
    });
    cue.appendChild(list);

    rec.cards = $$('.ib-cue-card', cue);
    rec.cardBy = {};
    rec.cards.forEach(function (c) { rec.cardBy[c.dataset.i] = c; });
    rec.cards.forEach(function (c) { c.addEventListener('click', function () { setDrawer(false); }); });
  }

  function jump(node) {
    if (!node) return;
    var y = node.getBoundingClientRect().top + window.pageYOffset - JUMP;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  /* ----------------------------------------------------- memorization cover */
  function renderCover(rec) {
    var cover = rec.cover;
    cover.textContent = '';

    var bar = el('div', 'ib-cover-bar');
    bar.appendChild(el('strong', '', T('Memorization', '记忆模式')));
    rec.count = el('span', 'ib-cover-count');
    bar.appendChild(rec.count);
    var reveal = el('button', 'ib-cover-exit', T('Back to the text', '回到正文'));
    reveal.type = 'button';
    reveal.addEventListener('click', function () { setMem(rec, false); });
    bar.appendChild(reveal);
    cover.appendChild(bar);
    cover.appendChild(el('p', 'ib-cover-tip', T(
      'The right-hand column is hidden. For each term, type what it means from memory, then press Check. Everything stays on this device.',
      '右侧正文已隐藏。逐条回忆每个术语的意思并写下，再点「检查」。所有内容只保存在本机。')));

    var store = loadStore();
    var graded = 0, total = 0;

    rec.cues.forEach(function (g) {
      if (!g.terms.length) return;
      var sec = el('section', 'ib-cover-sec');
      var h = el('h5', '', T(g.titleEn, g.titleZh));
      sec.appendChild(h);

      g.terms.forEach(function (t) {
        var key = g.i + '|' + t.en;
        var row = store[key] || {};
        total++;
        if (row.ok) graded++;

        var item = el('div', 'ib-cover-item');
        item.dataset.k = key;
        var q = el('div', 'ib-cover-q');
        q.appendChild(el('b', '', T(t.en, t.zh)));
        item.appendChild(q);

        var ta = el('textarea', 'ib-cover-a');
        ta.rows = 2;
        ta.value = row.a || '';
        ta.placeholder = T('In your own words…', '用你自己的话写…');
        item.appendChild(ta);

        var tools = el('div', 'ib-cover-tools');
        var check = el('button', 'ib-cover-check', T('Check', '检查'));
        check.type = 'button';
        var show = el('button', 'ib-cover-show', T('Show answer', '看答案'));
        show.type = 'button';
        tools.appendChild(check);
        tools.appendChild(show);
        item.appendChild(tools);

        var fb = el('div', 'ib-cover-fb');
        item.appendChild(fb);
        var ans = el('div', 'ib-cover-ans');
        ans.hidden = true;
        ans.textContent = defOf(t) ? defOf(t) : T('(no definition listed)', '（本节未给出定义）');
        item.appendChild(ans);

        show.addEventListener('click', function () {
          ans.hidden = !ans.hidden;
          show.textContent = ans.hidden ? T('Show answer', '看答案') : T('Hide answer', '收起答案');
        });
        check.addEventListener('click', function () {
          var res = grade(ta.value, defOf(t));
          var f = feedback(res, !!(ta.value || '').trim());
          fb.className = 'ib-cover-fb' + (f.tone ? ' is-' + f.tone : '');
          fb.textContent = f.msg;
          var s = loadStore();
          s[key] = { a: ta.value, ok: res.pct >= 0.6, s: Math.round(res.pct * 100) / 100 };
          saveStore(s);
          if (!ans.hidden) return;
          paintCount(rec);
        });
        ta.addEventListener('input', function () {
          var s = loadStore();
          var prev = s[key] || {};
          s[key] = { a: ta.value, ok: ta.value.trim() ? prev.ok : false, s: prev.s };
          saveStore(s);
          fb.textContent = '';
          fb.className = 'ib-cover-fb';
          paintCount(rec);
        });
        if (row.ok || row.a) {
          var res2 = grade(ta.value, defOf(t));
          var f2 = feedback(res2, !!(ta.value || '').trim());
          fb.className = 'ib-cover-fb' + (f2.tone ? ' is-' + f2.tone : '');
          fb.textContent = f2.msg;
        }
        sec.appendChild(item);
      });

      var nKey = 'n|' + g.i + '|' + g.titleEn;
      var notes = el('div', 'ib-cover-notes');
      notes.contentEditable = 'true';
      notes.setAttribute('role', 'textbox');
      notes.setAttribute('aria-label', T('Your own notes for this section', '本节笔记'));
      notes.setAttribute('data-ph', T('Notes — anything else you want to remember about this section…', '笔记 — 关于本节你还想记住的任何事…'));
      notes.textContent = (store[nKey] && store[nKey].a) || '';
      notes.addEventListener('input', function () {
        var s = loadStore();
        s[nKey] = { a: notes.textContent };
        saveStore(s);
      });
      sec.appendChild(notes);
      cover.appendChild(sec);
    });

    if (!total) cover.appendChild(el('p', 'ib-cover-tip', T('This topic has no key terms to test yet.', '本主题暂无可自测的关键术语。')));
    rec.total = total;
    rec.graded = graded;
    paintCount(rec);
  }

  function paintCount(rec) {
    if (!rec.count) return;
    var store = loadStore(), ok = 0, tot = 0;
    rec.cues.forEach(function (g) {
      g.terms.forEach(function (t) {
        tot++;
        var r = store[g.i + '|' + t.en];
        if (r && r.ok) ok++;
      });
    });
    rec.graded = ok; rec.total = tot;
    rec.count.textContent = T(ok + ' / ' + tot + ' recalled', '已记住 ' + ok + ' / ' + tot);
  }

  function setMem(rec, on) {
    var was = rec.mem;
    rec.mem = !!on;
    rec.main.classList.toggle('ib-mem', rec.mem);
    rec.lesson.classList.toggle('ib-mem', rec.mem);
    if (rec.mem) {
      renderCover(rec);
      rec.cover.hidden = false;
      /* Turning memorization on from the bottom of a long section used to leave
         you stranded in the middle of the cover with a long scroll back up. Take
         the reader to its top, where the prompts read in order like the deck.
         Only on the real off->on transition: refresh() calls setMem with the
         same value when the language flips, and jumping then would throw the
         reader away. */
      if (!was) jump(rec.cover);
    } else {
      rec.cover.hidden = true;
    }
    var b = $('.ib-cue-mem', rec.cue);
    if (b) {
      b.setAttribute('aria-pressed', rec.mem ? 'true' : 'false');
      b.textContent = rec.mem ? T('Memorization · on', '记忆模式 · 开') : T('Memorization', '记忆模式');
    }
  }

  /* ------------------------------------------------------------- drawer */
  /* The drawer has to be a child of <body> while it is open. Left inside the
     grid it is trapped in .page-wrapper's stacking context (position:relative;
     z-index:1), so both the sidebar rail (z-index 210) and the scrim (390)
     paint over it — elementFromPoint returned the scrim, i.e. it was not
     clickable. As a body child the drawer (400) beats the scrim (390) beats
     the rail (210). */
  function setDrawer(on) {
    on = !!on;
    drawerOpen = on;
    var scrim = $('#ib-cue-scrim');
    if (!scrim) {
      scrim = el('div', 'ib-cue-scrim');
      scrim.id = 'ib-cue-scrim';
      scrim.addEventListener('click', function () { setDrawer(false); });
      document.body.appendChild(scrim);
    }
    scrim.classList.toggle('on', drawerOpen);
    document.body.classList.toggle('ib-cue-open', drawerOpen);
    LIVE.forEach(function (r) {
      var want = drawerOpen && r.drawerBtn && r.drawerBtn.getAttribute('aria-expanded') === 'true';
      r.cue.classList.toggle('open', !!want);
      if (want && r.cue.parentNode !== document.body) document.body.appendChild(r.cue);
      if (!want && r.cue.parentNode === document.body) r.grid.insertBefore(r.cue, r.grid.firstChild);
    });
  }

  /* ---------------------------------------------------------- scroll sync */
  function sync() {
    queued = false;
    var y = MARK;
    for (var i = 0; i < LIVE.length; i++) {
      var rec = LIVE[i];
      if (!rec.item.classList.contains('open')) continue;
      /* the cue is a body child while the drawer is open, so a chapter switch
         that hides this item would strand it on screen */
      if (rec.item.offsetParent === null) { if (drawerOpen) setDrawer(false); continue; }
      var secs = rec.cues, cur = -1, box = rec.grid.getBoundingClientRect();
      if (!box.height) continue;
      for (var j = 0; j < secs.length; j++) {
        var r = secs[j].sec.getBoundingClientRect();
        if (r.height && r.top <= y) cur = j; else if (r.height) break;
      }
      if (cur < 0) cur = secs.length ? 0 : -1;
      if (cur === rec.cur) continue;
      rec.cur = cur;
      rec.cards.forEach(function (c) { c.classList.toggle('on', Number(c.dataset.i) === cur); });
      var on = rec.cardBy ? rec.cardBy[cur] : null;
      if (on && rec.cue.scrollHeight > rec.cue.clientHeight + 4) {
        var top = on.offsetTop, bot = top + on.offsetHeight;
        if (top < rec.cue.scrollTop || bot > rec.cue.scrollTop + rec.cue.clientHeight) {
          rec.cue.scrollTop = Math.max(0, top - 10);
        }
      }
    }
  }
  function onScroll() { if (!queued) { queued = true; window.requestAnimationFrame(sync); } }

  /* --------------------------------------------------------------- build */
  function reg(rec) {
    var at = LIVE.indexOf(rec);
    if (at < 0) LIVE.push(rec); else LIVE[at] = rec;
    if (LIVE.length === 1) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    }
    sync();
  }
  function unreg(item) {
    for (var i = LIVE.length - 1; i >= 0; i--) if (LIVE[i].item === item) LIVE.splice(i, 1);
  }

  function build(item) {
    if (!item || item.hidden) return;
    var lesson = item.querySelector('.native-lesson');
    if (!lesson) return;
    if (item._ibCornell) { reg(item._ibCornell); return; }

    var learn = lesson.querySelector('.ib-learn-wrap');
    var grid = el('div', 'ib-cornell');
    var cue = el('aside', 'ib-cornell-cue');
    cue.setAttribute('aria-label', T('Key terms', '关键术语'));
    var main = el('div', 'ib-cornell-main');
    var cover = el('div', 'ib-cover');
    cover.hidden = true;

    Array.prototype.slice.call(lesson.children).forEach(function (kid) {
      if (kid !== learn) main.appendChild(kid);
    });
    main.appendChild(cover);
    grid.appendChild(cue);
    grid.appendChild(main);
    lesson.appendChild(grid);

    var rec = { item: item, lesson: lesson, grid: grid, cue: cue, main: main, cover: cover, mem: false, cur: -1 };

    /* narrow screens: a sticky bar that opens the cues as a drawer */
    var mini = el('div', 'ib-cornell-mini');
    var mb = el('button', 'ib-mini-btn', T('☰ Key terms', '☰ 关键术语'));
    mb.type = 'button';
    mb.setAttribute('aria-expanded', 'false');
    mb.addEventListener('click', function () {
      var open = mb.getAttribute('aria-expanded') !== 'true';
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      setDrawer(open);
    });
    rec.drawerBtn = mb;
    mini.appendChild(mb);
    var mm = el('button', 'ib-mini-btn ib-mini-mem', T('Memorization', '记忆模式'));
    mm.type = 'button';
    mm.addEventListener('click', function () {
      setDrawer(false);
      setMem(rec, !rec.mem);
      mm.textContent = rec.mem ? T('Memorization · on', '记忆模式 · 开') : T('Memorization', '记忆模式');
    });
    rec.miniMem = mm;
    mini.appendChild(mm);
    grid.parentNode.insertBefore(mini, grid);
    rec.mini = mini;

    rec.cues = readCues(main, item);
    renderCues(rec);
    renderCover(rec);
    setMem(rec, false);

    item._ibCornell = rec;
    reg(rec);
  }

  function stop(item) {
    if (!item || !item._ibCornell) return;
    var rec = item._ibCornell;
    setMem(rec, false);
    setDrawer(false);
    unreg(item);
  }

  /* Re-read every cue from the DOM. Called from applyLanguage after
     refreshRich(), because the b.kt chips only hold the old language until
     that pass has run. */
  function refresh() {
    for (var i = 0; i < LIVE.length; i++) {
      var rec = LIVE[i];
      if (!rec.item.classList.contains('open')) continue;
      rec.cues = readCues(rec.main, rec.item);
      rec.cur = -1;
      renderCues(rec);
      renderCover(rec);
      setMem(rec, rec.mem);
    }
  }

  window.IBSEHSCornell = { build: build, stop: stop, refresh: refresh, live: function () { return LIVE.length; } };
})();

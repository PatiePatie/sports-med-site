/* ═══════════════════════════════════════════════════════════════════════════
   TIMED MOCK EXAMS  ·  shared engine
   ---------------------------------------------------------------------------
   One engine, three registrations: NPTE · 运动康复师资格证 · IB SEHS.

   Design decisions follow the real papers, not a generic quiz widget:

   · ONE RUNNING CLOCK for the whole paper, never per-section. FSBPT: "the exam
     time is presented as a block of overall exam time; each section is not
     separately timed." Training the strict version is the point.
   · SECTION LOCK. FSBPT: "once a 45-question section is submitted, the
     candidate cannot return to those questions."
   · PRETEST MODEL. 45 of the NPTE's 225 items are unscored and the candidate
     cannot know which, so the mock never reveals them.
   · FOCUS MODE. Start requests fullscreen on the exam element itself, not the
     document, so the site chrome is off screen. Scroll is locked, overscroll
     and pinch-zoom are suppressed, Tab is trapped inside the stage, copy and
     the context menu are blocked, and Escape asks before ending the attempt.
   · HONEST SHORTFALLS. A bank smaller than the paper produces a shorter mock
     that says so on the briefing screen. Nothing is padded or substituted.

   Storage
     sm_mock_run   the single in-flight attempt (survives a closed tab)
     sm_mock_runs  every completed attempt, with per-item detail, for analysis
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var REG = {};     /* examId -> config */
  var RUN = null;   /* the live attempt */
  var TIMER = null;
  var RUN_SLOT = null; /* {host, wrap} for the current page */
  var HOSTEL = null;   /* where the current screen is actually painted */

  var K_RUN = 'sm_mock_run', K_HIST = 'sm_mock_runs';

  /* ── language ─────────────────────────────────────────────────────────
     The site owns showCN / body.lang-zh and several widgets flip it, so read
     it defensively and re-render on the toggle rather than subscribing. */
  function isZH() {
    if (typeof window.showCN === 'boolean') return window.showCN;
    return /(^|\s)lang-zh(\s|$)/.test((document.body && document.body.className) || '');
  }
  function T(en, zh) { return isZH() ? zh : en; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ── tiny DOM helpers ──────────────────────────────────────────────── */
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pad(v) { return v < 10 ? '0' + v : '' + v; }
  function mmss(sec) {
    if (sec < 0) sec = 0;
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + pad(m) : m) + ':' + pad(s);
  }
  function dateLabel(ms) {
    var d = new Date(ms);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* ── storage, tolerant of private mode / quota ────────────────────── */
  var memStore = {}, storageOK = true;
  try { localStorage.setItem('__mk', '1'); localStorage.removeItem('__mk'); }
  catch (e) { storageOK = false; }
  function ld(k, d) {
    try {
      if (!storageOK) return memStore[k] === undefined ? d : memStore[k];
      var v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch (e) { return d; }
  }
  function sv(k, v) {
    try {
      if (!storageOK) { memStore[k] = v; return true; }
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch (e) { return false; }
  }
  function drop(k) {
    try { if (storageOK) localStorage.removeItem(k); } catch (e) {}
    delete memStore[k];
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FOCUS MODE
     ═══════════════════════════════════════════════════════════════════════ */
  var FOCUS = { on: false, stage: null, veil: null, allowExit: false };

  function lockScroll(on) {
    var b = document.body, d = document.documentElement;
    if (!b) return;
    if (on) {
      b.setAttribute('data-mk-prev-overflow', b.style.overflow || '');
      b.style.overflow = 'hidden';
      b.style.overscrollBehavior = 'none';
      b.style.touchAction = 'none';
      d.style.overscrollBehavior = 'none';
    } else {
      b.style.overflow = b.getAttribute('data-mk-prev-overflow') || '';
      b.removeAttribute('data-mk-prev-overflow');
      b.style.overscrollBehavior = '';
      b.style.touchAction = '';
      d.style.overscrollBehavior = '';
    }
  }

  function onKey(e) {
    if (!FOCUS.on) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (FOCUS.allowExit) return;
      promptLeave();
      return;
    }
    if (e.key === 'Tab' && FOCUS.stage) {
      var f = FOCUS.stage.querySelectorAll(
        'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),' +
        'textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!FOCUS.stage.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  }
  function blockCopy(e) { if (FOCUS.on) { e.preventDefault(); e.stopPropagation(); } }
  function blockZoom(e) { if (FOCUS.on && (e.ctrlKey || e.metaKey)) e.preventDefault(); }
  function onFsChange() {
    if (!FOCUS.on) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    FOCUS.on = false;
    unlockUI();
    if (!FOCUS.allowExit) promptLeave();
    FOCUS.allowExit = false;
  }

  function enterFocus(stage) {
    if (!stage) return;
    FOCUS.stage = stage;
    FOCUS.on = true;
    FOCUS.allowExit = false;
    document.documentElement.classList.add('mk-focus');
    lockScroll(true);

    /* Lift the stage out of the page and into a fixed full-viewport veil.
       Fullscreen is requested too, but it can be refused (no trusted gesture
       on a programmatic click, and iOS Safari will not fullscreen a div), so
       the veil is what actually guarantees the rest of the site is invisible. */
    if (!FOCUS.veil) {
      var veil = el('div', 'mk-focus-veil');
      veil.setAttribute('role', 'dialog');
      veil.setAttribute('aria-modal', 'true');
      document.body.appendChild(veil);
      FOCUS.veil = veil;
    }
    if (stage.parentNode !== FOCUS.veil) FOCUS.veil.appendChild(stage);
    document.addEventListener('fullscreenchange', onFsChange, false);
    document.addEventListener('webkitfullscreenchange', onFsChange, false);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('copy', blockCopy, true);
    document.addEventListener('cut', blockCopy, true);
    document.addEventListener('contextmenu', blockCopy, true);
    document.addEventListener('wheel', blockZoom, { passive: false });
    document.addEventListener('gesturestart', blockZoom, { passive: false });
    var req = stage.requestFullscreen || stage.webkitRequestFullscreen;
    if (req) { try { var p = req.call(stage); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
  }

  function unlockUI() {
    var d = document.documentElement;
    if (d) d.classList.remove('mk-focus');
    lockScroll(false);
    document.removeEventListener('fullscreenchange', onFsChange, false);
    document.removeEventListener('webkitfullscreenchange', onFsChange, false);
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('copy', blockCopy, true);
    document.removeEventListener('cut', blockCopy, true);
    document.removeEventListener('contextmenu', blockCopy, true);
    document.removeEventListener('wheel', blockZoom, { passive: false });
    document.removeEventListener('gesturestart', blockZoom, { passive: false });
  }

  function leaveFocus(cb) {
    FOCUS.allowExit = true;
    FOCUS.on = false;
    unlockUI();
    var ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (ex && (document.fullscreenElement || document.webkitFullscreenElement)) {
      try { var p = ex.call(document); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
    /* render() repaints the slot from scratch, so the old stage can simply be
       dropped rather than carried back into the page */
    if (FOCUS.veil && FOCUS.veil.parentNode) FOCUS.veil.parentNode.removeChild(FOCUS.veil);
    FOCUS.veil = null;
    FOCUS.stage = null;
    HOSTEL = null;
    if (cb) cb();
  }

  /* An Esc press or a browser-initiated exit must not silently discard a
     timed attempt. Confirm() is a user gesture, so choosing "stay" lets us
     re-enter fullscreen legally. */
  function promptLeave() {
    var stay = confirm(T(
      'You are part-way through a timed paper.\n\nLeaving now ends this attempt; whatever you have answered is kept. Choose OK to go back in — the exam re-enters focus mode and the clock keeps counting.',
      '你正在计时考试的中途。\n\n现在离开会结束本次作答，已作答的内容会保留。选择「确定」返回考试 —— 会重新进入专注模式，计时继续。'
    ));
    if (stay) {
      if (FOCUS.stage) enterFocus(FOCUS.stage);
    } else {
      var stage = FOCUS.stage;
      leaveFocus(function () { discardAttempt(stage); });
    }
  }

  function discardAttempt() {
    stopTimer();
    drop(K_RUN);
    RUN = null;
    resetToLauncher();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     SCORING
     ═══════════════════════════════════════════════════════════════════════ */
  /* FSBPT's raw→scaled conversion is unpublished IRT. The sourced anchor is
     ≈68.5% raw (126 of 180) ≈ 600, and 800 is a reportable ceiling rather than
     a perfect score. Piecewise-linear through those points; always shown as an
     estimate, never as an official score. */
  function scaledFrom(raw, scoredTotal) {
    if (!scoredTotal || !raw) return raw ? 200 + Math.round((raw / scoredTotal) * 250) : 200;
    var pass = Math.round(126 / 180 * scoredTotal);
    var v;
    if (raw <= pass) v = 200 + (raw / pass) * 400;
    else v = 600 + ((raw - pass) / (scoredTotal - pass)) * 200;
    return Math.max(200, Math.min(800, Math.round(v)));
  }

  function gradeOf(pct) {
    if (pct >= 90) return ['Distinction', '优秀'];
    if (pct >= 80) return ['Merit', '良好'];
    if (pct >= 70) return ['Pass', '及格'];
    if (pct >= 60) return ['Borderline', '临界'];
    return ['Not yet', '未达标'];
  }

  function isRight(q, chosen) {
    if (!chosen || !chosen.length) return false;
    if (q.multi) {
      if (chosen.length !== q.multi.length) return false;
      return chosen.every(function (v, i) { return v === q.multi[i]; });
    }
    return chosen.length === 1 && chosen[0] === q.correct;
  }
  function rightSet(q) {
    return q.multi ? q.multi.slice() : [q.correct];
  }

  /* ═══════════════════════════════════════════════════════════════════════
     ASSEMBLE THE PAPER
     ═══════════════════════════════════════════════════════════════════════
     cfg.blueprint.rows = [{ sys, en, zh, min, max }] out of cfg.scoredTotal.
     Fill each system to its published weight, then top up from whatever is
     left, and report the shortfall instead of hiding it. */
  function assemble(cfg, pool) {
    var need = cfg.itemsWanted;
    var rows = cfg.blueprint.rows;
    var bySys = {};
    pool.forEach(function (q) { (bySys[q.sys] = bySys[q.sys] || []).push(q); });
    Object.keys(bySys).forEach(function (k) { bySys[k] = shuffle(bySys[k]); });

    var quota = {};
    rows.forEach(function (r) {
      var target = Math.max(0, Math.round(r.max / cfg.scoredTotal * need));
      quota[r.sys] = Math.min(target, (bySys[r.sys] || []).length);
    });

    var picked = [], used = {};
    rows.forEach(function (r) {
      for (var i = 0; i < (quota[r.sys] || 0); i++) {
        var q = bySys[r.sys].shift();
        if (!q || used[q.id]) continue;
        used[q.id] = 1; picked.push(q);
      }
    });
    var left = shuffle(pool.filter(function (q) { return !used[q.id]; }));
    while (picked.length < need && left.length) {
      var q2 = left.shift();
      if (used[q2.id]) continue;
      used[q2.id] = 1; picked.push(q2);
    }

    /* The blueprint maxima can sum above the paper we are actually building
       (the CN subject ranges top out at 114 of a 100-mark paper), so trim back
       to length — always from whichever system is furthest over its share, so
       the shape of the paper survives. */
    var count = {};
    picked.forEach(function (q) { count[q.sys] = (count[q.sys] || 0) + 1; });
    var want = {};
    rows.forEach(function (r) { want[r.sys] = r.max / cfg.scoredTotal * need; });
    while (picked.length > need) {
      var worstSys = null, worstGap = -Infinity;
      Object.keys(count).forEach(function (k) {
        var gap = count[k] - (want[k] || 0);
        if (gap > worstGap) { worstGap = gap; worstSys = k; }
      });
      if (worstSys == null) break;
      for (var t = picked.length - 1; t >= 0; t--) {
        if (picked[t].sys === worstSys) { picked.splice(t, 1); count[worstSys]--; break; }
      }
    }

    /* the honest number is simply how many items we could not supply */
    var shortfall = Math.max(0, need - picked.length);

    /* Pretest items are invisible to the candidate, as on the real exam.
       Keyed by question id, NOT by array index: the index-keyed version looked
       up f.q.id at scoring time and therefore matched nothing, so all 45
       pretest items were being scored while the verdict reported 45 excluded. */
    var items = shuffle(picked);
    var pre = {};
    if (cfg.pretest) {
      var n = Math.min(cfg.pretest, items.length);
      shuffle(items.map(function (_, i) { return i; }))
        .slice(0, n)
        .forEach(function (i) { pre[items[i].id] = 1; });
    }
    return { items: items, pretest: pre, shortfall: shortfall };
  }

  function toSections(cfg, items) {
    var out = [], per = Math.floor(items.length / cfg.sections), rem = items.length % cfg.sections, at = 0;
    for (var i = 0; i < cfg.sections; i++) {
      var take = per + (i < rem ? 1 : 0);
      out.push(items.slice(at, at + take));
      at += take;
    }
    return out;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     RUN LIFECYCLE
     ═══════════════════════════════════════════════════════════════════════ */
  /* A mode is a resolved variant of the config. Object.create keeps every
     function on the prototype chain (build, blueprint, sysLabel) while letting
     the numbers be overridden, so a compact paper is literally the same engine
     with a different length. */
  function resolve(cfg, modeKey) {
    var modes = cfg.modes || [];
    var m = null;
    for (var i = 0; i < modes.length; i++) if (modes[i].key === modeKey) m = modes[i];
    if (!m) return cfg;
    var c = Object.create(cfg);
    ['itemsWanted', 'timeSec', 'pretest', 'paceSec', 'scoredTotal', 'sections'].forEach(function (k) {
      if (m[k] != null) c[k] = m[k];
    });
    c.modeLabel = { en: m.en, zh: m.zh };
    c.modeKey = m.key;
    c.isShort = m.isShort;
    return c;
  }

  function start(cfg, resume, modeKey) {
    var pool = cfg.build();
    if (!pool || !pool.length) {
      if (RUN_SLOT) {
        var w = el('div', 'mk-note warn', T(
          'No question bank is available for this exam yet.',
          '这个考试暂时没有可用题库。'
        ));
        clear(RUN_SLOT.wrap);
        RUN_SLOT.wrap.appendChild(w);
      }
      return;
    }
    var paper = assemble(cfg, pool);
    var secs = toSections(cfg, paper.items);
    var flat = [];
    secs.forEach(function (s, si) {
      s.forEach(function (q) { flat.push({ q: q, sec: si }); });
    });

    RUN = {
      exam: cfg.id, cfg: cfg,
      startMs: Date.now() - ((resume && resume.elapsed) || 0) * 1000,
      flat: flat, pretest: paper.pretest, shortfall: paper.shortfall,
      cur: (resume && resume.cur) || 0,
      ans: (resume && resume.ans) || {},
      flags: (resume && resume.flags) || {},
      submitted: (resume && resume.submitted) || [],
      view: resume ? 'exam' : 'brief'
    };
    saveRun();
    render();
    if (RUN.view === 'exam') {
      var st = slot().querySelector('.mk-stage');
      if (st) enterFocus(st);
    }
  }

  function remaining() {
    return RUN ? RUN.cfg.timeSec - Math.floor((Date.now() - RUN.startMs) / 1000) : 0;
  }
  function saveRun() {
    if (!RUN) return;
    sv(K_RUN, {
      exam: RUN.exam,
      elapsed: Math.floor((Date.now() - RUN.startMs) / 1000),
      cur: RUN.cur, ans: RUN.ans, flags: RUN.flags, submitted: RUN.submitted
    });
  }
  function startTimer(cb) {
    stopTimer();
    TIMER = setInterval(function () {
      if (!RUN) { stopTimer(); return; }
      cb(remaining());
    }, 1000);
  }
  function stopTimer() { if (TIMER) { clearInterval(TIMER); TIMER = null; } }

  function firstUnanswered() {
    for (var i = 0; i < RUN.flat.length; i++) if (RUN.ans[RUN.flat[i].q.id] === undefined) return i;
    return 0;
  }
  function curSec() { return RUN.flat[RUN.cur].sec; }
  function curQ() { return RUN.flat[RUN.cur].q; }

  /* ── dispatcher ────────────────────────────────────────────────── */
  /* While focus mode is up the screens are painted into the veil, not into the
     page — otherwise finishing a section would repaint behind the veil and the
     candidate would be left looking at the section they already submitted. */
  function slot() { return HOSTEL || (RUN_SLOT && RUN_SLOT.wrap); }

  function render() {
    var wrap = RUN_SLOT.wrap;
    var host = (FOCUS.on && FOCUS.veil) ? FOCUS.veil : wrap;
    clear(wrap);
    if (host !== wrap) clear(host);
    HOSTEL = host;
    if (RUN.view === 'brief') renderBrief(host);
    else if (RUN.view === 'exam') renderExam(host);
    else if (RUN.view === 'timeup') renderTimeUp(host);
    else if (RUN.view === 'result') renderResult(host);
  }

  /* ── briefing ──────────────────────────────────────────────────────
     The rules of the real paper, the blueprint being tested against, and an
     honest statement of how many items the bank can actually supply. */
  function renderBrief(wrap) {
    var cfg = RUN.cfg;
    var card = el('div', 'mk-stage');
    var body = el('div', 'mk-body');
    card.appendChild(body);
    wrap.appendChild(card);

    var head = el('h2', null, T(cfg.title.en, cfg.title.zh) +
      (cfg.modeLabel ? ' · ' + T(cfg.modeLabel.en, cfg.modeLabel.zh) : ''));
    body.appendChild(head);

    var facts = el('ul', 'mk-facts');
    [
      [T('Items', '题量'), String(cfg.itemsWanted)],
      [T('Sections', '部分'), cfg.sections + ' × ' + Math.round(cfg.itemsWanted / cfg.sections)],
      [T('Time', '时长'), mmss(cfg.timeSec) + T(' (one running clock)', '（统一计时）')],
      [T('About', '每题约'), cfg.paceSec + T('s', ' 秒')]
    ].concat(cfg.pretest ? [[T('Unscored pretest', '不计分试测'), String(cfg.pretest)]] : [])
      .forEach(function (f) {
        var li = el('li', 'mk-fact');
        li.innerHTML = '<b>' + esc(f[0]) + '</b> ' + esc(f[1]);
        facts.appendChild(li);
      });
    body.appendChild(facts);

    if (cfg.source) {
      var src = el('div', 'mk-note info');
      src.innerHTML = '<b>' + esc(T('Format source: ', '格式依据：')) + '</b>' + esc(cfg.source);
      body.appendChild(src);
    }
    if (cfg.reconstructed) {
      var rc = el('div', 'mk-note warn');
      rc.innerHTML = '<b>' + esc(T('Reconstruction, not an official paper. ', '这是重建卷，不是官方试卷。')) + '</b>' +
        esc(T(cfg.reconstructed.en, cfg.reconstructed.zh));
      body.appendChild(rc);
    }
    (cfg.brief || []).forEach(function (p) {
      body.appendChild(el('p', 'mk-lede', T(p.en, p.zh)));
    });

    if (RUN.shortfall) {
      var sh = el('div', 'mk-note warn');
      sh.innerHTML = '<b>' + esc(T('Shorter than the real paper. ', '题量少于真实试卷。')) + '</b>' +
        esc(T(
          'The real paper is ' + cfg.itemsWanted + ' items. The bank holds ' + RUN.flat.length +
          ' for this exam, so this attempt uses all ' + RUN.flat.length + ' and the paper ends early. ' +
          'Nothing has been padded or substituted.',
          '真实试卷共 ' + cfg.itemsWanted + ' 题。本题库只有 ' + RUN.flat.length +
          ' 题，因此本次使用全部 ' + RUN.flat.length + ' 题，会提前结束。没有凑数，也没有替换题目。'
        ));
      body.appendChild(sh);
    }

    body.appendChild(el('h3', null, T('What you need to know', '考试须知')));
    var ul = el('ul', 'mk-lede');
    (cfg.rules || []).forEach(function (r) { ul.appendChild(el('li', null, T(r.en, r.zh))); });
    if (cfg.sections > 1) ul.appendChild(el('li', null, T(
      'The clock never resets. Finishing a section only unlocks the next one — you cannot go back to a submitted section.',
      '计时不会重置。提交一部分只是解锁下一部分，无法返回已提交的部分。'
    )));
    ul.appendChild(el('li', null, T(
      'Closing the tab does not pause anything. The clock keeps running and you can resume where you left off.',
      '关闭标签页不会暂停。计时继续，之后可以接着做。'
    )));
    body.appendChild(ul);

    body.appendChild(el('h3', null, T('Content areas being tested against', '对照的内容领域与题量')));
    body.appendChild(blueprintTable(cfg));

    var row = el('div', 'mk-btns');
    row.style.marginTop = '1.1rem';
    var go = el('button', 'mk-btn primary', T('Begin — focus mode', '开始考试（专注模式）'));
    go.style.minHeight = '44px';
    go.onclick = function () {
      RUN.view = 'exam';
      RUN.cur = firstUnanswered();
      render();
      var st = wrap.querySelector('.mk-stage');
      if (st) enterFocus(st);
    };
    row.appendChild(go);
    var back = el('button', 'mk-btn ghost', T('Not now', '暂不开始'));
    back.onclick = function () { RUN = null; resetToLauncher(); };
    row.appendChild(back);
    body.appendChild(row);

    var alt = el('div');
    alt.style.marginTop = '.9rem';
    (cfg.modes || []).forEach(function (m) {
      if (m.key === RUN.cfg.modeKey) return;
      var b = el('button', 'mk-btn ghost', T(m.en, m.zh));
      b.onclick = function () { start(resolve(cfg, m.key), null, m.key); };
      alt.appendChild(b);
    });
    if (alt.children.length) body.appendChild(alt);
  }

  function blueprintTable(cfg) {
    var t = el('table', 'mk-table');
    t.innerHTML = '<thead><tr><th>' + esc(T('Content area', '内容领域')) + '</th>' +
      '<th class="num">' + esc(T('Items on the paper', '试卷题量')) + '</th>' +
      '<th class="num">' + esc(T('Share', '占比')) + '</th></tr></thead>';
    var tb = el('tbody');
    cfg.blueprint.rows.forEach(function (r) {
      var tr = el('tr');
      tr.innerHTML = '<td>' + esc(T(r.en, r.zh)) + '</td><td class="num">' + r.min + '–' + r.max +
        '</td><td class="num">' + (r.max / cfg.scoredTotal * 100).toFixed(1) + '%</td>';
      tb.appendChild(tr);
    });
    if (cfg.blueprint.note) {
      var tn = el('tr');
      tn.innerHTML = '<td>' + esc(T(cfg.blueprint.note.en, cfg.blueprint.note.zh)) + '</td><td class="num">–</td><td class="num">–</td>';
      tb.appendChild(tn);
    }
    t.appendChild(tb);
    return t;
  }

  /* ── exam screen ───────────────────────────────────────────────── */
  function renderExam(wrap) {
    var cfg = RUN.cfg;
    var stage = el('div', 'mk-stage');
    var top = el('div', 'mk-top');
    var name = el('div', 'mk-name', '');
    var clock = el('div', 'mk-clock', '--:--');
    var secTag = el('div', 'mk-sect', '');
    var mkBtn = el('button', 'mk-btn ghost', T('Mark for review', '标记待查'));
    var subBtn = el('button', 'mk-btn', T('Finish section', '交卷本部分'));
    var quit = el('button', 'mk-quit', T('Quit', '退出'));
    quit.onclick = function () { promptLeave(); };
    top.appendChild(name); top.appendChild(clock); top.appendChild(secTag);
    top.appendChild(mkBtn); top.appendChild(subBtn); top.appendChild(quit);
    stage.appendChild(top);
    var body = el('div', 'mk-body');
    stage.appendChild(body);
    wrap.appendChild(stage);

    function paintTop() {
      var left = remaining();
      clock.textContent = mmss(left);
      clock.className = 'mk-clock' + (left <= 60 ? ' crit' : left <= 600 ? ' warn' : '');
      name.textContent = T(cfg.title.en, cfg.title.zh) + '  ·  ' +
        T('Section ', '第 ') + (curSec() + 1) + ' / ' + cfg.sections;
      var answered = 0;
      RUN.flat.forEach(function (f) { if (RUN.ans[f.q.id] !== undefined) answered++; });
      var secsDone = RUN.submitted.length;
      secTag.textContent = T('answered ', '已答 ') + answered + '/' + RUN.flat.length +
        '  ·  ' + T('sections done ', '已完成部分 ') + secsDone + '/' + cfg.sections +
        (cfg.pretest ? '  ·  ' + cfg.pretest + ' ' + T('unscored', '不计分') : '');
    }

    var paintQ = function () {
      clear(body);
      var q = curQ();
      if (!q) return;
      var chosen = RUN.ans[q.id];

      var meta = el('div', 'mk-qmeta');
      meta.appendChild(el('span', 'mk-qno', T('Question ', '第 ') + (RUN.cur + 1) + ' ' + T('of ', '/ 共 ') + RUN.flat.length));
      if (q.sys && cfg.sysLabel && cfg.sysLabel[q.sys]) {
        var L = cfg.sysLabel[q.sys];
        var tag = el('span', 'mk-tag', T(L.en, L.zh));
        meta.appendChild(tag);
      }
      if (q.cmd) meta.appendChild(el('span', 'mk-cmd', q.cmd));
      body.appendChild(meta);

      if (q.scen) {
        var sc = el('div', 'mk-scen');
        var dl = el('dl');
        Object.keys(q.scen).forEach(function (k) {
          dl.appendChild(el('dt', null, scenLbl(k)));
          dl.appendChild(el('dd', null, T(q.scen[k].en, q.scen[k].zh)));
        });
        sc.appendChild(dl);
        body.appendChild(sc);
      }

      body.appendChild(el('p', 'mk-stem', T(q.en, q.zh)));
      if (q.multi) {
        body.appendChild(el('p', 'mk-multi-note', T(
          'More than one answer may be correct — choose all that apply.',
          '本题可能为多选，请选出所有正确选项。'
        )));
      }

      var letters = 'ABCDEFGH';
      var opts = el('div', 'mk-opts');
      (isZH() && q.optsz && q.optsz.length === q.opts.length ? q.optsz : q.opts).forEach(function (txt, i) {
        var b = el('button', 'mk-opt');
        b.setAttribute('type', 'button');
        b.appendChild(el('span', 'k', letters[i]));
        b.appendChild(el('span', null, txt));
        b.setAttribute('aria-pressed', chosen && chosen.indexOf(i) >= 0 ? 'true' : 'false');
        b.onclick = function () {
          var arr = RUN.ans[q.id] ? RUN.ans[q.id].slice() : [];
          var at = arr.indexOf(i);
          if (q.multi) { if (at >= 0) arr.splice(at, 1); else arr.push(i); }
          else arr = [i];
          arr.sort(function (x, y) { return x - y; });
          RUN.ans[q.id] = arr;
          saveRun(); paintQ(); paintTop(); paintDots();
        };
        opts.appendChild(b);
      });
      body.appendChild(opts);

      var nav = el('div', 'mk-nav');
      var row = el('div', 'mk-navrow');
      var prev = el('button', 'mk-btn', T('← Previous', '← 上一题'));
      prev.disabled = RUN.cur === 0;
      prev.onclick = function () { if (RUN.cur > 0) { RUN.cur--; saveRun(); paintQ(); paintTop(); paintDots(); } };
      row.appendChild(prev);
      var next = el('button', 'mk-btn primary', RUN.cur === RUN.flat.length - 1
        ? T('Review, then finish the section', '检查后交卷') : T('Next →', '下一题 →'));
      next.onclick = function () {
        if (RUN.cur < RUN.flat.length - 1) { RUN.cur++; saveRun(); paintQ(); paintTop(); paintDots(); }
      };
      row.appendChild(next);
      nav.appendChild(row);

      /* A 160-item navigator is unusable drawn in full: it becomes eight rows of
         squares and pushes the question off screen. It defaults to the current
         section — which is the only part you can still navigate to, because
         submitted sections are locked — with a toggle for the whole paper. */
      var showAll = RUN.flat.length <= 60;
      var dots = el('div', 'mk-dots');
      var dotHead = el('div', 'mk-dothead');
      nav.appendChild(dotHead);
      nav.appendChild(dots);

      var paintDots = function () {
        var sec = curSec();
        var secItems = RUN.flat.filter(function (ff) { return ff.sec === sec; });
        clear(dotHead);
        var lbl = el('span', null, T('Section ', '第 ') + (sec + 1) + ' ' + T('of ', '/ ') + cfg.sections +
          '  ·  ' + secItems.length + ' ' + T('items', '题'));
        dotHead.appendChild(lbl);
        var toggle = el('button', 'mk-mini', showAll
          ? T('Show this section only', '仅显示本部分')
          : T('Show all ' + RUN.flat.length, '显示全部 ' + RUN.flat.length + ' 题'));
        toggle.onclick = function () { showAll = !showAll; paintDots(); };
        dotHead.appendChild(toggle);

        clear(dots);
        var list = showAll ? RUN.flat.map(function (ff, i) { return { ff: ff, i: i }; }) : null;
        if (!list) {
          var start = 0;
          secItems.forEach(function (ff) { ff.__i = RUN.flat.indexOf(ff); });
          list = secItems.map(function (ff) { return { ff: ff, i: ff.__i }; });
        }
        list.forEach(function (e) {
          var i = e.i, ff = e.ff;
          var d = el('button', 'mk-dot', String(i + 1));
          d.setAttribute('type', 'button');
          if (RUN.ans[ff.q.id] !== undefined) d.className += ' done';
          if (RUN.flags[ff.q.id]) d.className += ' flag';
          if (i === RUN.cur) d.className += ' cur';
          d.onclick = function () { RUN.cur = i; saveRun(); paintQ(); paintTop(); paintDots(); };
          d.title = T('Question ', '第 ') + (i + 1);
          dots.appendChild(d);
        });
      };
      paintDots();
      body.appendChild(nav);

      mkBtn.textContent = RUN.flags[q.id]
        ? T('Unmark', '取消标记') : T('Mark for review', '标记待查');
    };

    mkBtn.onclick = function () {
      var id = curQ().id;
      if (RUN.flags[id]) delete RUN.flags[id]; else RUN.flags[id] = 1;
      saveRun(); paintQ();
    };

    subBtn.onclick = function () {
      var sec = curSec();
      var missing = RUN.flat.filter(function (f) {
        return f.sec === sec && RUN.ans[f.q.id] === undefined;
      }).length;
      var msg = missing
        ? T(
          'This section still has ' + missing + ' unanswered item(s).\n\n' +
          (cfg.noPenalty ? 'There is no penalty for guessing — the real exam tells you to answer every item. ' : '') +
          'Submit this section now? Once submitted you cannot return to it.',
          '本部分还有 ' + missing + ' 题未作答。\n\n' +
          (cfg.noPenalty ? '猜错不扣分——真实考试要求每题都要作答。' : '') +
          '确定提交本部分吗？提交后无法返回。'
        )
        : T('Submit this section? Once submitted you cannot return to it.',
          '确定提交本部分吗？提交后无法返回。');
      if (!confirm(msg)) return;
      if (RUN.submitted.indexOf(sec) < 0) RUN.submitted.push(sec);
      saveRun();
      var nextIdx = -1;
      for (var i = 0; i < RUN.flat.length; i++) if (RUN.submitted.indexOf(RUN.flat[i].sec) < 0) { nextIdx = i; break; }
      if (nextIdx < 0) finishAttempt();
      else { RUN.cur = nextIdx; render(); }
    };

    paintTop();
    paintQ();
    startTimer(function (left) {
      if (left <= 0) { RUN.view = 'timeup'; render(); return; }
      paintTop();
    });
  }

  function scenLbl(k) {
    var M = {
      setting: ['Setting', '场景'], sex: ['Sex', '性别'], age: ['Age', '年龄'],
      problem: ['Presenting problem', '主诉'], history: ['Medical history', '病史'],
      other: ['Other information', '其他信息'], exam: ['PT examination', '体格检查'],
      plan: ['PT plan of care', '治疗计划']
    };
    var m = M[k] || [k, k];
    return T(m[0], m[1]);
  }

  /* ── clock ran out ─────────────────────────────────────────────── */
  function renderTimeUp(wrap) {
    stopTimer();
    var card = el('div', 'mk-stage');
    var body = el('div', 'mk-body');
    body.appendChild(el('h2', null, T('Time is up', '考试时间已到')));
    body.appendChild(el('p', 'mk-lede', T(
      'The paper is closed. Submit now to see your result, including which content areas cost you the most.',
      '试卷已关闭。现在提交即可查看结果，包括哪些内容领域失分最多。'
    )));
    var b = el('button', 'mk-btn primary', T('Submit and see results', '提交并查看结果'));
    b.onclick = finishAttempt;
    body.appendChild(b);
    card.appendChild(body);
    wrap.appendChild(card);
    leaveFocus();
  }

  /* ── finish ────────────────────────────────────────────────────── */
  function finishAttempt() {
    if (!RUN) return;
    var cfg = RUN.cfg;
    var items = RUN.flat.map(function (f) {
      var q = f.q;
      var pre = !!RUN.pretest[f.q.id];
      var ch = RUN.ans[q.id];
      /* the question text is stored too, so "missed twice" is a list you can
         actually act on rather than a list of ids */
      var qt = (q.en || '').slice(0, 140);
      var qz = (q.zh || '').slice(0, 140);
      return {
        id: q.id, sys: q.sys || 'other', auto: !!q.auto, sec: f.sec, pre: pre,
        chosen: ch === undefined ? null : ch, ok: isRight(q, ch) && !pre,
        en: qt, zh: qz
      };
    });
    var scoredOnly = items.filter(function (i) { return !i.pre; });
    var raw = scoredOnly.filter(function (i) { return i.ok; }).length;

    var perSys = {};
    scoredOnly.forEach(function (i) {
      perSys[i.sys] = perSys[i.sys] || { n: 0, ok: 0 };
      perSys[i.sys].n++;
      if (i.ok) perSys[i.sys].ok++;
    });

    var rec = {
      exam: cfg.id, started: RUN.startMs, ended: Date.now(),
      durSec: Math.floor((Date.now() - RUN.startMs) / 1000),
      given: RUN.flat.length, pretest: cfg.pretest || 0,
      scoredTotal: cfg.scoredTotal, raw: raw, scoredN: scoredOnly.length,
      /* A short paper must not deflate the scaled score: the conversion is
         anchored on 126-of-180, so first express the raw count as the
         equivalent number correct on a full 180-item scored paper. On a full
         paper this is the identity and nothing changes. */
      scaled: cfg.scale
        ? scaledFrom(Math.round(cfg.scoredTotal * (scoredOnly.length ? raw / scoredOnly.length : 0)), cfg.scoredTotal)
        : null,
      pass: cfg.pass == null ? null : cfg.pass,
      perSys: perSys, items: items, shortfall: RUN.shortfall
    };

    var hist = ld(K_HIST, []);
    if (!Array.isArray(hist)) hist = [];
    hist.push(rec);
    while (hist.length > 40) hist.shift();
    sv(K_HIST, hist);
    drop(K_RUN);

    RUN.rec = rec;
    RUN.view = 'result';
    stopTimer();
    leaveFocus(function () { render(); });
  }

  /* ── result ────────────────────────────────────────────────────── */
  function renderResult(wrap) {
    var cfg = RUN.cfg, rec = RUN.rec, q = RUN.flat;
    var card = el('div', 'mk-stage');
    var body = el('div', 'mk-body');
    card.appendChild(body);
    wrap.appendChild(card);

    body.appendChild(el('h2', null, T('Your result', '你的成绩')));
    var sc = el('div', 'mk-score');
    var pct = Math.round(rec.raw / rec.scoredN * 100);
    if (rec.scaled != null) {
      sc.appendChild(el('div', 'mk-big', String(rec.scaled)));
      var sub = el('div', 'mk-sub');
      sub.textContent = T(
        'estimated scaled score, 200–800  ·  raw ' + rec.raw + '/' + rec.scoredN + ' (' + pct + '%)',
        '估算标准分 200–800 · 原始得分 ' + rec.raw + '/' + rec.scoredN + '（' + pct + '%）'
      );
      sc.appendChild(sub);
      sc.appendChild(el('span', 'mk-pass ' + (rec.scaled >= rec.pass ? 'yes' : 'no'),
        rec.scaled >= rec.pass ? T('Pass', '通过') : T('Below ' + rec.pass, '低于 ' + rec.pass)));
    } else {
      sc.appendChild(el('div', 'mk-big', pct + '%'));
      sc.appendChild(el('div', 'mk-sub', T('raw ' + rec.raw + ' / ' + rec.scoredN, '原始得分 ' + rec.raw + ' / ' + rec.scoredN)));
      var g = gradeOf(pct);
      sc.appendChild(el('span', 'mk-pass ' + (pct >= 60 ? 'yes' : 'no'), T(g[0], g[1])));
    }
    body.appendChild(sc);

    var pace = Math.round(rec.durSec / Math.max(1, rec.given));
    body.appendChild(el('p', 'mk-sub', rec.durSec < 15
      ? T('Time taken: under 15 seconds, so there is no pace to analyse on this attempt.',
          '用时不足 15 秒，本次没有可分析的答题节奏。')
      : T(
        'Pace ' + pace + ' s per item. The real paper allows about ' + cfg.paceSec +
        ' s per item, so you used about ' + Math.round(pace / cfg.paceSec * 100) + '% of the time you would have had.',
        '节奏：每题 ' + pace + ' 秒。真实试卷每题约 ' + cfg.paceSec +
        ' 秒，你大约用掉了可用时间的 ' + Math.round(pace / cfg.paceSec * 100) + '%。'
      )));

    if (rec.shortfall) {
      var sn = el('div', 'mk-note warn');
      sn.textContent = T(
        'This attempt had ' + rec.shortfall + ' fewer item(s) than the real paper because the question bank is short. The score is still meaningful, but treat it as a practice run rather than a full-length rehearsal.',
        '本次作答比真实试卷少 ' + rec.shortfall + ' 题，因为题库数量不足。成绩仍有参考价值，但请把它当作一次练习，而不是完整的全真模拟。'
      );
      body.appendChild(sn);
    }

    body.appendChild(verdict(rec, cfg));

    body.appendChild(el('h3', null, T('By content area, weakest first', '按内容领域，由弱到强')));
    var rows = cfg.blueprint.rows.filter(function (r) { return rec.perSys[r.sys]; });
    rows.sort(function (a, b) {
      return (rec.perSys[a.sys].ok / rec.perSys[a.sys].n) - (rec.perSys[b.sys].ok / rec.perSys[b.sys].n);
    });
    var t = el('table', 'mk-table');
    t.innerHTML = '<thead><tr><th>' + esc(T('Area', '领域')) + '</th><th class="num">' +
      esc(T('Got', '答对')) + '</th><th class="num">' + esc(T('%', '正确率')) +
      '</th><th></th><th class="num">' + esc(T('Paper range', '试卷区间')) + '</tr></thead>';
    var tb = el('tbody');
    rows.forEach(function (r) {
      var s = rec.perSys[r.sys], p = Math.round(s.ok / s.n * 100);
      var tr = el('tr');
      tr.innerHTML = '<td>' + esc(T(r.en, r.zh)) +
        (r.sysAuto ? ' <span class="mk-tag">' + esc(T('auto-tagged', '自动归类')) + '</span>' : '') + '</td>' +
        '<td class="num">' + s.ok + '/' + s.n + '</td><td class="num">' + p + '%</td>' +
        '<td><div class="mk-bar ' + (p < 55 ? 'low' : p < 75 ? 'mid' : 'high') + '"><i style="width:' + p + '%"></i></div></td>' +
        '<td class="num">' + r.min + '–' + r.max + '</td>';
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    body.appendChild(t);

    var rv = el('details');
    rv.style.margin = '1.1rem 0';
    var sm = el('summary', null, T('Review all ' + q.length + ' questions with explanations', '回顾全部 ' + q.length + ' 题（含解析）'));
    sm.style.cursor = 'pointer';
    sm.style.minHeight = '40px';
    sm.style.display = 'flex';
    sm.style.alignItems = 'center';
    rv.appendChild(sm);
    q.forEach(function (f, i) {
      var item = f.q;
      var ch = RUN.ans[item.id];
      var ok = isRight(item, ch);
      var d = el('div', 'mk-review ' + (ok ? 'ok' : 'no'));
      d.appendChild(el('p', 'q', '<b>' + (i + 1) + '.</b> ' + esc(T(item.en, item.zh))));
      var optsList = (isZH() && item.optsz && item.optsz.length === item.opts.length) ? item.optsz : item.opts;
      var yours = ch ? ch.map(function (v) { return optsList[v]; }).join(', ') : T('not answered', '未作答');
      var right = rightSet(item).map(function (v) { return optsList[v]; }).join(', ');
      d.appendChild(el('p', 'mk-sub', T('Your answer: ', '你的答案：') + esc(yours) +
        '  ·  ' + T('Correct: ', '正确答案：') + esc(right)));
      if (item.ex) {
        d.appendChild(el('p', 'ex', '<b>' + esc(T('Why: ', '解析：')) + '</b>' + esc(T(item.ex, item.exz || item.ex))));
      }
      rv.appendChild(d);
    });
    body.appendChild(rv);

    var row = el('div', 'mk-btns');
    var again = el('button', 'mk-btn primary', T('Take it again', '再考一次'));
    again.onclick = function () { start(RUN.cfg, null, RUN.cfg.modeKey); };
    row.appendChild(again);
    var histB = el('button', 'mk-btn', T('Progress & analysis', '进度与分析'));
    histB.onclick = function () { renderHistory(RUN.exam, wrap); };
    row.appendChild(histB);
    var close = el('button', 'mk-btn ghost', T('Close', '关闭'));
    close.onclick = function () { RUN = null; resetToLauncher(); };
    row.appendChild(close);
    body.appendChild(row);
  }

  function verdict(rec, cfg) {
    var v = el('div', 'mk-verdict');
    var pct = Math.round(rec.raw / rec.scoredN * 100);
    var weak = [];
    Object.keys(rec.perSys).forEach(function (k) {
      var s = rec.perSys[k];
      if (s.n >= 2 && s.ok / s.n < 0.6) weak.push({ sys: k, n: s.n, ok: s.ok, p: Math.round(s.ok / s.n * 100) });
    });
    weak.sort(function (a, b) { return a.p - b.p; });
    v.appendChild(el('div', null, pct >= 75
      ? T('Comfortable — the score is holding up.', '状态不错，成绩比较稳。')
      : pct >= 60
        ? T('Close. You are near the line.', '接近了，就差一点。')
        : T('Not there yet — and that is exactly what a mock is for.', '还没到位 —— 而这正是模拟考试的价值。')));
    var ul = el('ul');
    if (weak.length) {
      var names = weak.slice(0, 3).map(function (x) {
        var L = (cfg.sysLabel && cfg.sysLabel[x.sys]) || { en: x.sys, zh: x.sys };
        return T(L.en, L.zh) + ' (' + x.ok + '/' + x.n + ')';
      });
      ul.appendChild(el('li', null, T('Revisit these first: ' + names.join(', ') + '.',
        '优先复习：' + names.join('、') + '。')));
    }
    if (rec.pass != null) {
      /* The one sourced anchor is that ~68.5% raw (126 of 180) sits at the
         600 pass mark, so the honest gap is stated in items on THIS paper. */
      var need = Math.ceil(0.685 * rec.scoredN) - rec.raw;
      if (need > 0) {
        ul.appendChild(el('li', null, T(
          'You need about ' + need + ' more correct item(s) to reach the pass mark — 68.5% raw is the level that scales to ' + rec.pass + '.',
          '大约还需答对 ' + need + ' 题才能达到及格线 —— 原始正确率 68.5% 对应 ' + rec.pass + ' 分。')));
      } else if (rec.scaled != null && rec.scaled < rec.pass) {
        ul.appendChild(el('li', null, T(
          'Your raw proportion is above the pass benchmark, but the scaled estimate is below ' + rec.pass + '. Treat this as a borderline result.',
          '原始正确率已超过及格基准，但估算标准分仍低于 ' + rec.pass + '。请把这次当作临界结果。')));
      }
    }
    var blank = RUN.flat.filter(function (f) { return RUN.ans[f.q.id] === undefined; }).length;
    if (blank) ul.appendChild(el('li', null, T(
      blank + ' item(s) were left blank.' + (cfg.noPenalty ? ' Guessing costs nothing, so there was never a reason to leave one.' : ''),
      '有 ' + blank + ' 题未作答。' + (cfg.noPenalty ? '猜错不扣分，所以空题没有任何好处。' : ''))));
    var preCount = rec.items.filter(function (i) { return i.pre; }).length;
    if (preCount) ul.appendChild(el('li', null, T(
      preCount + ' of the items you saw were unscored pretest items, so they do not count toward the score.',
      '你作答的题目中有 ' + preCount + ' 题为不计分试测题，不计入成绩。')));
    if (!ul.children.length) ul.appendChild(el('li', null, T(
      'Nothing obvious to fix. Run it again closer to your exam date.',
      '没有明显短板。可以在临近考试时再练一次。')));
    v.appendChild(ul);
    return v;
  }

  /* ── longitudinal analysis ─────────────────────────────────────── */
  function renderHistory(examId, wrap) {
    var cfg = REG[examId];
    clear(wrap);
    var hist = ld(K_HIST, []);
    if (!Array.isArray(hist)) hist = [];
    hist = hist.filter(function (r) { return r.exam === examId; });

    var card = el('div', 'mk-stage');
    var body = el('div', 'mk-body');
    card.appendChild(body);
    wrap.appendChild(card);

    if (!hist.length) {
      body.appendChild(el('h2', null, T('Progress & analysis', '进度与分析')));
      body.appendChild(el('p', 'mk-lede', T(
        'No completed attempts yet. Sit one mock and this fills in: your trend, which content areas cost you the most, and any item you have missed more than once.',
        '还没有已完成的记录。先考一次，这里就会显示：分数趋势、哪些内容领域失分最多，以及哪些题你错过不止一次。'
      )));
      var back = el('button', 'mk-btn', T('Back to the mock', '返回模拟考试'));
      back.onclick = function () { resetToLauncher(); };
      body.appendChild(back);
      return;
    }

    hist.sort(function (a, b) { return a.ended - b.ended; });
    body.appendChild(el('h2', null, T(cfg.title.en + ' — progress', cfg.title.zh + ' —— 进度')));

    var last = hist.slice(-10);
    var spark = el('div', 'mk-spark');
    last.forEach(function (r) {
      var p = Math.round(r.raw / r.scoredN * 100);
      var i = el('i');
      i.style.height = Math.max(6, p) + '%';
      if (r.pass != null && r.scaled != null && r.scaled < r.pass) i.className = 'fail';
      i.title = dateLabel(r.ended) + ' — ' + p + '%';
      spark.appendChild(i);
    });
    body.appendChild(spark);
    var ax = el('div', 'mk-axislbl');
    ax.appendChild(el('span', null, T('first attempt', '第一次')));
    ax.appendChild(el('span', null, T('latest', '最近一次')));
    body.appendChild(ax);
    var d1 = hist[hist.length - 1], d0 = hist[0];
    var p1 = Math.round(d1.raw / d1.scoredN * 100), p0 = Math.round(d0.raw / d0.scoredN * 100);
    body.appendChild(el('p', 'mk-sub', T(
      'Across ' + hist.length + ' attempt(s): ' + p0 + '% → ' + p1 + '% (' + (p1 - p0 >= 0 ? '+' : '') + (p1 - p0) + ' points).',
      '共 ' + hist.length + ' 次记录：' + p0 + '% → ' + p1 + '%（' + (p1 - p0 >= 0 ? '+' : '') + (p1 - p0) + ' 分）。'
    )));

    var agg = {};
    hist.forEach(function (r) {
      Object.keys(r.perSys).forEach(function (k) {
        agg[k] = agg[k] || { n: 0, ok: 0 };
        agg[k].n += r.perSys[k].n; agg[k].ok += r.perSys[k].ok;
      });
    });
    body.appendChild(el('h3', null, T('Every attempt combined, weakest first', '所有记录合计，由弱到强')));
    var rows = cfg.blueprint.rows.filter(function (r) { return agg[r.sys]; })
      .sort(function (a, b) { return agg[a.sys].ok / agg[a.sys].n - agg[b.sys].ok / agg[b.sys].n; });
    var t = el('table', 'mk-table');
    t.innerHTML = '<thead><tr><th>' + esc(T('Area', '领域')) + '</th><th class="num">' +
      esc(T('Got', '答对')) + '</th><th class="num">' + esc(T('%', '正确率')) + '</th><th></th></tr></thead>';
    var tb = el('tbody');
    rows.forEach(function (r) {
      var s = agg[r.sys], p = Math.round(s.ok / s.n * 100);
      var tr = el('tr');
      tr.innerHTML = '<td>' + esc(T(r.en, r.zh)) + '</td><td class="num">' + s.ok + '/' + s.n +
        '</td><td class="num">' + p + '%</td><td><div class="mk-bar ' +
        (p < 55 ? 'low' : p < 75 ? 'mid' : 'high') + '"><i style="width:' + p + '%"></i></div></td>';
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    body.appendChild(t);

    var seen = {};
    hist.forEach(function (r) {
      r.items.forEach(function (i) {
        if (i.ok) return;
        /* the increment has to live inside the guard: a correct item was never
           added to the map, so touching it unconditionally threw */
        if (!seen[i.id]) seen[i.id] = { n: 0, en: i.en, zh: i.zh, sys: i.sys };
        seen[i.id].n++;
      });
    });
    var rep = Object.keys(seen).filter(function (k) { return seen[k].n >= 2; })
      .sort(function (a, b) { return seen[b].n - seen[a].n; });
    body.appendChild(el('h3', null, T('Missed more than once', '错过不止一次的题')));
    if (rep.length) {
      body.appendChild(el('p', 'mk-lede', T(
        rep.length + ' item(s) were wrong in two or more separate attempts. Nothing on this list is bad luck — it is a gap, and these are the specific lines to re-read.',
        '有 ' + rep.length + ' 题在两次以上作答中都答错。出现在这里的都不是运气问题，而是真实的缺口 —— 这些就是要回去重读的具体内容。'
      )));
      var ul = el('div');
      rep.slice(0, 12).forEach(function (id) {
        var it = seen[id];
        var row = el('div', 'mk-review no');
        var tag = '';
        if (it.sys && cfg.sysLabel && cfg.sysLabel[it.sys]) {
          var L = cfg.sysLabel[it.sys];
          tag = ' <span class="mk-tag">' + esc(T(L.en, L.zh)) + '</span>';
        }
        row.innerHTML = '<p class="q">' + tag + '<b>' + esc(T('missed ×' + it.n, '错了 ×' + it.n)) + '</b> · ' +
          esc(T(it.en || '', it.zh || '')) + '…</p>';
        ul.appendChild(row);
      });
      body.appendChild(ul);
    } else {
      body.appendChild(el('p', 'mk-lede', T(
        'Nothing has been missed twice. That is a good sign.',
        '还没有任何一题错过两次以上。这是好迹象。'
      )));
    }

    body.appendChild(el('h3', null, T('All attempts', '全部记录')));
    var list = el('div', 'mk-hist');
    hist.slice().reverse().forEach(function (r) {
      var d = el('div', 'mk-run');
      var p = Math.round(r.raw / r.scoredN * 100);
      d.appendChild(el('span', 'when', dateLabel(r.ended)));
      d.appendChild(el('span', 'sc', r.scaled != null
        ? r.scaled + ' / ' + r.pass
        : r.raw + '/' + r.scoredN + ' · ' + p + '%'));
      d.appendChild(el('span', 'pace', mmss(r.durSec) + T(' · ', ' · ') +
        Math.round(r.durSec / r.given) + T('s per item', ' 秒/题')));
      list.appendChild(d);
    });
    body.appendChild(list);

    var row = el('div', 'mk-btns');
    var back = el('button', 'mk-btn primary', T('Back to the mock', '返回模拟考试'));
    back.onclick = function () { resetToLauncher(); };
    row.appendChild(back);
    var clr = el('button', 'mk-btn ghost', T('Clear my records', '清除我的记录'));
    clr.onclick = function () {
      if (!confirm(T('Delete every stored mock result for this exam? This cannot be undone.',
        '删除本考试的所有模拟记录？此操作不可撤销。'))) return;
      sv(K_HIST, ld(K_HIST, []).filter(function (r) { return r.exam !== examId; }));
      renderHistory(examId, wrap);
    };
    row.appendChild(clr);
    body.appendChild(row);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     THE SECTION
     ═══════════════════════════════════════════════════════════════════════ */
  function mount(examId, hostId) {
    var cfg = REG[examId];
    if (!cfg) return;
    var host = typeof hostId === 'string' ? document.getElementById(hostId) : hostId;
    if (!host || host.getAttribute('data-mk-on')) return;
    host.setAttribute('data-mk-on', '1');
    host.classList.add('mk-root');

    var paneMock = el('div');
    var paneHist = el('div');
    paneHist.hidden = true;

    var tabs = el('div', 'mk-btns');
    tabs.style.margin = '0 0 1rem';
    var bMock = el('button', 'mk-btn primary', T('Mock exam', '模拟考试'));
    var bHist = el('button', 'mk-btn', T('Progress & analysis', '进度与分析'));
    bMock.onclick = function () {
      paneMock.hidden = false; paneHist.hidden = true;
      bMock.className = 'mk-btn primary'; bHist.className = 'mk-btn';
      if (RUN && RUN.exam === examId) render();
    };
    bHist.onclick = function () {
      paneMock.hidden = true; paneHist.hidden = false;
      bMock.className = 'mk-btn'; bHist.className = 'mk-btn primary';
      renderHistory(examId, paneHist);
    };
    tabs.appendChild(bMock); tabs.appendChild(bHist);
    host.appendChild(tabs);
    host.appendChild(paneMock);
    host.appendChild(paneHist);

    /* resume an interrupted attempt — the clock kept running while closed */
    var saved = ld(K_RUN, null);
    if (saved && saved.exam === examId && saved.elapsed < cfg.timeSec) {
      var left = cfg.timeSec - saved.elapsed;
      var b = el('div', 'mk-note warn');
      b.innerHTML = '<b>' + esc(T('You have a mock in progress.', '你有一份未完成的模拟考试。')) + '</b> ' +
        esc(T('The clock never stopped — ' + mmss(left) + ' remaining.',
          '计时从未停止，剩余 ' + mmss(left) + '。'));
      var rs = el('button', 'mk-btn primary', T('Resume it', '继续作答'));
      rs.style.margin = '.6rem .4rem 0 0';
      rs.onclick = function () { start(cfg, saved); };
      var dis = el('button', 'mk-btn ghost', T('Discard it', '放弃'));
      dis.onclick = function () {
        if (confirm(T('Throw away the attempt in progress?', '确定放弃本次未完成的作答？'))) { drop(K_RUN); b.remove(); }
      };
      b.appendChild(rs); b.appendChild(dis);
      paneMock.appendChild(b);
    }

    /* launcher */
    var launch = el('div', 'mk-launch');
    launch.appendChild(el('h2', null, T(cfg.title.en, cfg.title.zh)));
    launch.appendChild(el('p', 'mk-lede', T(cfg.lede.en, cfg.lede.zh)));
    var facts = el('ul', 'mk-facts');
    (cfg.facts || []).forEach(function (f) {
      var li = el('li', 'mk-fact');
      li.innerHTML = '<b>' + esc(T(f[0], f[2] || f[0])) + '</b> ' + esc(T(f[1], f[3] || f[1]));
      facts.appendChild(li);
    });
    launch.appendChild(facts);

    var go = el('button', 'mk-btn primary', T('Start mock exam', '开始模拟考试'));
    go.style.minHeight = '44px';
    go.onclick = function () { start(cfg, null); };
    launch.appendChild(go);
    launch.appendChild(el('p', 'mk-sub', T(
      'It opens full screen and locks the page: you cannot swipe away, scroll the site behind it, or see the rest of the site. Press Escape to leave and it asks first, so a stray keypress cannot cost you the attempt.',
      '考试会全屏打开并锁定页面：无法滑动离开、无法滚动背后的内容、也看不到网站其他部分。按 Escape 退出会先确认，误触不会让你丢失这次作答。'
    )));

    var runWrap = el('div');
    runWrap.style.marginTop = '1.2rem';
    launch.appendChild(runWrap);
    paneMock.appendChild(launch);

    RUN_SLOT = { host: host, wrap: runWrap, paneMock: paneMock, launch: launch };
  }

  function resetToLauncher() {
    stopTimer();
    drop(K_RUN);
    RUN = null;
    HOSTEL = null;
    if (RUN_SLOT) clear(RUN_SLOT.wrap);
  }

  /* ── public ────────────────────────────────────────────────────── */
  window.VitaliteMock = {
    add: function (cfg) { REG[cfg.id] = cfg; return cfg; },
    reg: REG,
    mount: mount,
    results: function (id) {
      var h = ld(K_HIST, []);
      if (!Array.isArray(h)) h = [];
      return id ? h.filter(function (r) { return r.exam === id; }) : h;
    },
    clear: function (id) {
      sv(K_HIST, ld(K_HIST, []).filter(function (r) { return !id || r.exam !== id; }));
    },
    _t: { scaledFrom: scaledFrom, assemble: assemble, esc: esc, mmss: mmss, isRight: isRight }
  };

  /* the site toggles language through #langToggle and several widgets own it,
     so rebuild the section after they have written the new value */
  document.addEventListener('click', function (e) {
    if (!e.target || e.target.id !== 'langToggle') return;
    setTimeout(function () {
      var nodes = document.querySelectorAll('[data-mk-exam]');
      Array.prototype.forEach.call(nodes, function (n) {
        var id = n.getAttribute('data-mk-exam');
        var live = RUN && RUN.exam === id;
        n.removeAttribute('data-mk-on');
        clear(n);
        mount(id, n.id);
        if (live) start(REG[id], ld(K_RUN, null));
      });
    }, 240);
  });

  function autoMount() {
    var nodes = document.querySelectorAll('[data-mk-exam]');
    Array.prototype.forEach.call(nodes, function (n) {
      mount(n.getAttribute('data-mk-exam'), n.id);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();
})();
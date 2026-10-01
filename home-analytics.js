/* ═══════════════════════════════════════════════════════════════════════════
   CROSS-COURSE ANALYTICS  ·  home dashboard block
   ---------------------------------------------------------------------------
   Mounts into #hmAnalytics on home.html and reads window.VitaliteAnalytics.

   The point of this block is that it answers questions the three per-course
   boxes above cannot, because they each only know their own store:

     · where you actually are across all three courses at once
     · how you are doing on the timed mocks, and whether that is improving
     · WHICH content area is costing you the most, named
     · anything sitting in progress right now, so you can go back to it

   When there is nothing to show yet it renders an honest empty state rather
   than a wall of zeros.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var host, A;

  function el(t, c, h) { var n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; }
  function cn() { return (localStorage.getItem('sm_lang') || '') === 'zh'; }
  function t(en, zh) { return cn() ? zh : en; }
  function pct(n, o) {
    n = Math.max(0, Math.min(100, n || 0));
    var cls = n >= (o || 67) ? 'high' : n >= (o || 67) / 2 ? 'mid' : 'low';
    return '<div class="an-bar ' + cls + '"><i style="width:' + n + '%"></i></div>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  /* the mock engine writes these; keep the labels in step with mock-exams.js */
  var MOCK_HREF = {
    npte: 'exam.html',
    cncert: 'cn-cert.html',
    ibsehs: 'ib-sehs-learn.html'
  };
  var SYS = {
    msk: ['Musculoskeletal', '肌肉骨骼'], neuro: ['Neuromuscular & nervous', '神经肌肉与神经'],
    card: ['Cardiovascular & pulmonary', '心肺'], integ: ['Integumentary', '皮肤'],
    sysint: ['System interactions', '系统交互'], lymph: ['Lymphatic', '淋巴'],
    meta: ['Metabolic & endocrine', '代谢与内分泌'], gi: ['Gastrointestinal', '消化'],
    gu: ['Genitourinary', '泌尿生殖'], nonsys: ['Non-system', '非系统类'],
    an: ['Anatomy', '运动解剖学'], ph: ['Exercise physiology', '运动生理学'],
    as: ['Assessment', '康复评定学'], in: ['Sports injury', '运动损伤学'],
    tc: ['TCM health management', '中医健康管理'],
    a: ['Theme A', '主题 A'], b: ['Theme B', '主题 B'], c: ['Theme C', '主题 C'], d: ['HL extension', 'HL 扩展']
  };
  function sysName(k) { var s = SYS[k]; return s ? t(s[0], s[1]) : k; }

  /* ── course names in order, matching the boxes above ─────────────── */
  var COURSE_ROWS = [
    { id: 'vt', ico: '📖', name: ['Vitalité Textbook', 'Vitalité 教材'], href: 'guide.html' },
    { id: 'ib', ico: '🏃', name: ['IB SEHS', 'IB SEHS'], href: 'ib-sehs-learn.html' },
    { id: 'g10', ico: '🧬', name: ['G10 Biology', 'G10 生物'], href: 'g10-bio.html' }
  ];

  /* ── empty state ──────────────────────────────────────────────────── */
  function empty() {
    return el('div', 'an-empty',
      esc(t(
        'Nothing to analyse yet. Read a few sections or sit one timed mock and this fills in automatically — it reads the progress each course already records, and stores nothing of its own.',
        '暂时还没有可分析的数据。读几节内容或完成一次限时模拟，这里就会自动生成 —— 它只读取各课程已有的进度记录，不会额外存储任何东西。')));
  }

  /* ── overall reading ──────────────────────────────────────────────── */
  function blockProgress(p) {
    var w = el('div', 'an-card');
    w.appendChild(el('div', 'an-h',
      '<b>' + esc(t('Reading, all three courses', '三门课程的阅读进度')) + '</b>' +
      '<span>' + p.read + ' / ' + p.total + ' · ' + p.pct + '%</span>'));
    var head = el('div', 'an-rows');
    COURSE_ROWS.forEach(function (c) {
      var s = (p.byCourse || {})[c.id];
      if (!s) return;
      var r = el('a', 'an-row');
      r.href = c.href;
      r.innerHTML =
        '<span class="an-ico" aria-hidden="true">' + c.ico + '</span>' +
        '<span class="an-lbl">' + esc(t(c.name[0], c.name[1])) + '</span>' +
        '<span class="an-num">' + s.read + '/' + s.total + '</span>' +
        '<span class="an-pct">' + s.pct + '%</span>' + pct(s.pct);
      head.appendChild(r);
    });
    w.appendChild(head);
    return w;
  }

  /* ── mocks ────────────────────────────────────────────────────────── */
  function blockMocks(m, live) {
    var w = el('div', 'an-card');

    if (live && live.done > 0) {
      var b = el('a', 'an-live');
      b.href = MOCK_HREF[live.exam] || 'exam.html';
      b.innerHTML = '<b>' + esc(t('A mock is in progress', '有一份模拟考试进行中')) + '</b>' +
        '<span>' + live.done + ' ' + esc(t('items answered', '题已作答')) + ' · ' +
        esc(t('the clock is still counting', '计时仍在继续')) + '</span>';
      w.appendChild(b);
    }

    if (!m.exams.length) {
      w.appendChild(el('div', 'an-h',
        '<b>' + esc(t('Timed mock exams', '限时模拟考试')) + '</b>' +
        '<span>' + esc(t('none sat yet', '尚未参加')) + '</span>'));
      var links = el('div', 'an-links');
      [['npte', 'NPTE', 'NPTE'], ['cncert', '运动康复师资格证', '运动康复师资格证'],
       ['ibsehs', 'IB SEHS Paper 1A', 'IB SEHS Paper 1A']].forEach(function (m2) {
        var a = el('a', 'an-link');
        a.href = MOCK_HREF[m2[0]];
        a.textContent = m2[1];
        links.appendChild(a);
      });
      w.appendChild(links);
      return w;
    }

    var EX = { npte: ['NPTE', 'NPTE'], ibsehs: ['IB', 'IB'], cncert: ['运动康复师', '运动康复师'] };
    function exName(k) { return EX[k] ? (cn() ? EX[k][1] : EX[k][0]) : k; }

    var hdr = '<b>' + esc(t('Timed mock exams', '限时模拟考试')) + '</b><span>' +
      m.total + ' ' + esc(t(m.total === 1 ? 'attempt' : 'attempts', '次记录')) +
      (m.delta != null && m.delta !== 0
        ? ' · ' + (m.delta > 0 ? '▲ +' : '▼ ') + m.delta + ' ' + esc(t('pts', '分')) +
          esc(t(' in ', '（')) + esc(exName(m.deltaExam)) + esc(t(')', '）'))
        : '') + '</span>';
    w.appendChild(el('div', 'an-h', hdr));

    /* Trend per exam, not across exams. Bars sit on a fixed 0-100 scale with a
       pass line where the exam has one, because auto-scaled bars made a 76%
       IB paper and a 90% NPTE paper look like the same height. */
    m.exams.forEach(function (e) {
      var series = (m.perExamTrend && m.perExamTrend[e.id]) || [];
      if (series.length < 2) return;
      var cap = el('div', 'an-spark-cap', esc(cn() ? e.nameZh : e.name) +
        ' <em>' + esc(t('first → latest', '首次 → 最近')) + '</em>');
      w.appendChild(cap);
      var sp = el('div', 'an-spark');
      var passPct = (e.pass != null && e.scaledScale) ? null : null;
      series.forEach(function (r) {
        var i = el('i');
        i.style.height = Math.max(6, r.pct) + '%';
        if (r.scaled != null && e.pass != null && r.scaled < e.pass) i.className = 'fail';
        i.title = (r.pct) + '%';
        sp.appendChild(i);
      });
      w.appendChild(sp);
    });

    var rows = el('div', 'an-rows');
    m.exams.forEach(function (e) {
      var r = el('a', 'an-row');
      r.href = MOCK_HREF[e.id] || 'exam.html';
      var score = e.scaledScale && e.bestScaled != null
        ? e.bestScaled + (e.pass ? ' / ' + e.pass : '')
        : e.bestPct + '%';
      r.innerHTML =
        '<span class="an-lbl">' + esc(cn() ? e.nameZh : e.name) + '</span>' +
        '<span class="an-num">' + e.attempts + ' ' + esc(t(e.attempts === 1 ? 'try' : 'tries', '次')) + '</span>' +
        '<span class="an-pct">' + score + '</span>' + pct(e.bestPct) +
        '<span class="an-sub">' + e.pace + 's ' + esc(t('per item', '/题')) + '</span>';
      rows.appendChild(r);
    });
    w.appendChild(rows);
    return w;
  }

  /* ── the named weak spot ─────────────────────────────────────────── */
  function blockWeak(m) {
    var w = el('div', 'an-card');
    var hdr = '<b>' + esc(t('Your weakest area', '你最薄弱的内容领域')) + '</b>';
    if (m.weak.length) {
      var top = m.weak[0];
      hdr += '<span>' + top.ok + '/' + top.n + ' · ' + top.pct + '%</span>';
    }
    w.appendChild(el('div', 'an-h', hdr));
    if (!m.weak.length) {
      w.appendChild(el('div', 'an-sub-txt',
        esc(t('Not enough mock data yet to name a weak area. Sit two mocks and the gap shows up here.',
              '模拟数据还不够，暂时看不出薄弱项。完成两次模拟后，这里会显示差距。'))));
      return w;
    }
    var rows = el('div', 'an-rows');
    m.weak.slice(0, 5).forEach(function (x) {
      var r = el('div', 'an-row');
      r.innerHTML = '<span class="an-lbl">' + esc(sysName(x.sys)) + '</span>' +
        '<span class="an-num">' + x.ok + '/' + x.n + '</span>' +
        '<span class="an-pct">' + x.pct + '%</span>' + pct(x.pct);
      rows.appendChild(r);
    });
    w.appendChild(rows);
    w.appendChild(el('div', 'an-sub-txt',
      esc(t('Weakest first. Anything on this list is worth re-reading before the next attempt.',
            '由弱到强。列表里的内容都值得在下次模拟前重读一遍。'))));
    return w;
  }

  /* ── study totals ─────────────────────────────────────────────────── */
  function blockStudy(s, st) {
    var w = el('div', 'an-card');
    w.appendChild(el('div', 'an-h', '<b>' + esc(t('Study totals', '学习总量')) + '</b>'));
    var g = el('div', 'an-grid');
    function cell(v, l) { return '<div><b>' + esc(String(v)) + '</b><span>' + esc(t(l[0], l[1])) + '</span></div>'; }
    var html = '';
    if (s.mastery != null) html += cell(s.mastery + '%', ['quiz mastery', '测验掌握度']);
    if (s.asked) html += cell(s.asked, ['questions answered', '已答题目']);
    if (s.cards) html += cell(s.cards, ['flashcards reviewed', '已复习闪卡']);
    if (st.current) html += cell(st.current, ['day streak', '天连续']);
    if (s.npteBest) html += cell(s.npteBest, ['NPTE best', 'NPTE 最高']);
    if (s.g10Best) html += cell(s.g10Best + '%', ['G10 quiz best', 'G10 测验最高']);
    g.innerHTML = html || ('<div><b>—</b><span>' + esc(t('nothing recorded yet', '暂无记录')) + '</span></div>');
    w.appendChild(g);
    return w;
  }

  /* ── mount ────────────────────────────────────────────────────────── */
  function render() {
    if (!host) return;
    A = window.VitaliteAnalytics;
    host.innerHTML = '';
    if (!A || !A.all) { host.appendChild(empty()); return; }
    var d;
    try { d = A.all(); } catch (e) { host.appendChild(empty()); return; }
    if (!d || !d.progress || !d.progress.ok) { host.appendChild(empty()); return; }

    var p = d.progress, m = d.mocks;
    var any = p.read > 0 || m.total > 0 || (d.study && (d.study.asked || d.study.cards)) ||
              (d.study && d.study.mastery != null);
    if (!any) { host.appendChild(empty()); return; }

    var h = el('div', 'an-head');
    h.innerHTML = '<h2>' + esc(t('Everything, in one place', '全部课程，一处查看')) + '</h2>' +
      '<p>' + esc(t(
        'One reading of everything the three courses record, plus your mock exam history. This block only reads the progress each course already saves — it stores nothing itself.',
        '把三门课程记录的所有进度汇总到一处，外加模拟考试历史。此模块只读取各课程已保存的进度，不额外存储任何数据。')) + '</p>';
    host.appendChild(h);

    var grid = el('div', 'an-grid-2');
    grid.appendChild(blockProgress(p));
    grid.appendChild(blockMocks(m, d.live));
    grid.appendChild(blockWeak(m));
    grid.appendChild(blockStudy(d.study || {}, d.streak || { current: 0 }));
    host.appendChild(grid);
  }

  function boot() {
    host = document.getElementById('hmAnalytics');
    if (!host) return;
    render();
    /* the tracker fires on every read, so this stays live without a reload */
    if (window.VitaliteProgress && window.VitaliteProgress.onChange) {
      window.VitaliteProgress.onChange(function () {
        clearTimeout(boot._t);
        boot._t = setTimeout(render, 400);
      });
    }
    /* language toggle: several widgets bind #langToggle, so re-read after */
    document.addEventListener('click', function (e) {
      if (!e.target || e.target.id !== 'langToggle') return;
      setTimeout(render, 260);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
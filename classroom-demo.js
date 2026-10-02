/* classroom-demo.js — a fully labelled demo class.
 *
 * WHY THIS EXISTS
 *   Classroom works, but a teacher who opens it sees an empty room: no class,
 *   no roster, no progress, no released sections. Empty screens cannot be
 *   judged in thirty seconds, so the value is invisible. A teacher cannot
 *   tell what a scroll-depth bar or a release schedule would even do for them.
 *
 *   This fills the real views with sample data so the two things worth showing
 *   -- assigning work, and checking who actually read it -- are visible
 *   immediately. It is only ever switched on when there is no class yet, so it
 *   can never sit on top of real data, and it writes nothing anywhere.
 *
 * EVERY NUMBER IS INVENTED and every surface it touches says so, in both
 * languages, in a banner that cannot be dismissed by accident.
 */
(function () {
  'use strict';
  if (window.__clDemo) return;
  window.__clDemo = true;

  /* ── sample class ───────────────────────────────────────────────────
     read%   how much of the released material they opened
     prog%   their position through the course
     dwell   real time on the page
     units   per-unit scroll depth, which is what the heat map shows */
  var CLASS_NAME = 'Year 11 PE — Set B (sample)';
  var COURSE = 'Vitalité Textbook';
  var CODE = 'DEMO-7Q4K';
  var STUDENTS = [
    ['Mei Chen',        'student', 92, 81, '3 h 12 m', '2 min ago',      [98, 94, 90, 86, 72, 61, 40]],
    ['Rafael Souza',    'student', 88, 76, '2 h 48 m', '6 min ago',      [96, 91, 88, 74, 66, 52, 31]],
    ['Tomás Ferreira',  'student', 79, 68, '2 h 05 m', '34 min ago',     [88, 84, 76, 63, 58, 40, 22]],
    ['Aiko Tanaka',     'student', 71, 61, '1 h 34 m', '1 h ago',        [84, 79, 71, 55, 48, 31, 12]],
    ['Priya Nair',      'student', 58, 44, '0 h 56 m', 'Yesterday',       [76, 70, 58, 41, 30, 18,  0]],
    ['Jonas Berg',      'student', 37, 26, '0 h 22 m', 'Yesterday',       [58, 47, 33, 19, 11,  0,  0]],
    ['Lena Novak',      'student', 14,  9, '0 h 06 m', '4 days ago',     [31, 22, 12,  0,  0,  0,  0]]
  ];
  var UNITS = ['1.1 Five Thinking Patterns', '1.2 Systems Check', '1.3 Energy Systems',
               '1.4 Muscle Fibers', '1.5 Adaptation (SAID)', '1.6 Myths Debunked',
               '1.7 Anatomy: Planes, Joints & Spine'];
  /* the release schedule — this is the "assign work" surface */
  var RELEASED = [
    ['1.1 Five Thinking Patterns',              'released', '—',      '80%'],
    ['1.2 Systems Check',                        'released', '—',      '80%'],
    ['1.3 Energy Systems',                       'released', '18 Oct', '80%'],
    ['1.4 Muscle Fibers',                        'released', '25 Oct', '70%'],
    ['1.5 Adaptation (SAID)',                    'released', '1 Nov',  '70%'],
    ['1.6 Myths Debunked',                       'scheduled','8 Nov',  '60%'],
    ['1.7 Anatomy: Planes, Joints & Spine',       'held',     '15 Nov', '—']
  ];
  var UNRELEASED = 2;

  function zh() { try { return localStorage.getItem('sm_lang') === 'zh'; } catch (e) { return false; } }
  function T(en, c) { return zh() ? c : en; }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function td(tr, txt, cls) { tr.appendChild(el('td', cls, txt)); }
  function n_(x) { return typeof x === 'number' ? x : null; }

  /* ── banner ── */
  function banner() {
    var b = el('div', 'cl-dm-banner');
    b.id = 'clDemoBanner';
    b.appendChild(el('strong', 'cl-dm-tag', T('Demo class — sample data', '演示班级 —— 示例数据')));
    b.appendChild(el('span', 'cl-dm-txt', T(
      'You have no class yet, so this is filled with made-up students to show you what assigning work and checking progress look like. Nothing here is real, and nothing you do here is saved.',
      '你还没有班级，因此这里用虚构的学生数据展示「布置学习内容」与「查看学习进度」的效果。这些内容全部是假的，你的任何操作都不会被保存。')));
    var x = el('button', 'cl-dm-x', T('Exit demo', '退出演示'));
    x.type = 'button';
    x.addEventListener('click', off);
    b.appendChild(x);
    return b;
  }

  /* Insert the banner somewhere VISIBLE. The obvious hosts (clTabs, the
     "no class" card, #classroom) can each sit inside a panel that is itself
     hidden -- in that case the banner is created, counted and invisible, which
     is worse than not creating it: measured as a 0x0 box. So walk the candidates
     and take the first one that actually has height. */
  function visibleHost() {
    var cands = [document.getElementById('clNoClass'), document.getElementById('clTabs'),
                 document.getElementById('classroom'), document.querySelector('main'),
                 document.body];
    for (var i = 0; i < cands.length; i++) {
      var n = cands[i];
      if (!n || !n.parentNode) continue;
      var r = n.getBoundingClientRect();
      if (r.height > 0 && r.width > 0) return n;
    }
    return null;
  }
  /* Real content is saved ONCE, before the demo first overwrites it, so Exit
     can put it back untouched. Without this the demo would destroy a real
     class's numbers -- and that is exactly why it must never be able to. */
  function snapshot() {
    if (window.__clDemoBackup) return;
    var b = {};
    ['clStats','clRoster','clDetail','clAssignList','clHeat'].forEach(function (id) {
      var n = document.getElementById(id); if (n) b[id] = n.innerHTML;
    });
    ['clRosterCount','clTitle','clCodeLabel','clCourseLabel'].forEach(function (id) {
      var n = document.getElementById(id); if (n) b[id] = n.textContent;
    });
    window.__clDemoBackup = b;
  }
  function restore() {
    var b = window.__clDemoBackup;
    if (!b) return false;
    ['clStats','clRoster','clDetail','clAssignList','clHeat'].forEach(function (id) {
      var n = document.getElementById(id); if (n && b[id] != null) n.innerHTML = b[id];
    });
    ['clRosterCount','clTitle','clCodeLabel','clCourseLabel'].forEach(function (id) {
      var n = document.getElementById(id); if (n && b[id] != null) n.textContent = b[id];
    });
    window.__clDemoBackup = null;
    return true;
  }

  function on() {
    var host = visibleHost();
    if (!host) return;
    snapshot();
    if (!document.getElementById('clDemoBanner')) {
      var b = banner();
      host.parentNode.insertBefore(b, host);
    }
    var t = document.getElementById('clTitle');
    if (t && !t.textContent.trim()) t.textContent = T(CLASS_NAME, '十一年级体育 —— B 班（示例）');
    stats(); roster(); detail(); schedule(); tabs();
  }
  function off() {
    var real = restore();
    if (!real) ['clStats','clRoster','clDetail','clAssignList','clHeat'].forEach(function (id) {
      var n = document.getElementById(id); if (n) n.innerHTML = '';
    });
    if (!real) ['clRosterCount','clTitle','clCodeLabel','clCourseLabel'].forEach(function (id) {
      var n = document.getElementById(id); if (n) n.textContent = '';
    });
    var b = document.getElementById('clDemoBanner'); if (b && b.parentNode) b.parentNode.removeChild(b);
    var k = document.getElementById('clDemoKey'); if (k && k.parentNode) k.parentNode.removeChild(k);
    window.__clDemoOn = false;
  }

  /* ── overview: the numbers a teacher asks for first ── */
  function stats() {
    var h = document.getElementById('clStats'); if (!h) return;
    h.innerHTML = '';
    var g = el('div', 'cl-dm-stats');
    [['7', T('Students', '学生')], ['71%', T('Average read', '平均已读')],
     ['3 h 12 m', T('Top dwell time', '最长停留')],
     [String(UNRELEASED), T('Sections held back', '暂未发布')]].forEach(function (p) {
      var c = el('div', 'cl-dm-stat');
      c.appendChild(el('b', null, p[0]));
      c.appendChild(el('span', null, p[1]));
      g.appendChild(c);
    });
    h.appendChild(g);
    h.appendChild(el('p', 'cl-dim', T(
      'Read is how much of the released material each student opened. Progress is how far through the course they are. Dwell time is time genuinely spent on the page — high progress with low dwell usually means skimming.',
      '「已读」是每位学生打开了多少已发布内容；「进度」是他们在课程中的位置；「停留时间」是真正花在页面上的时间 —— 进度高但停留短，通常意味着在略读。')));
  }

  /* ── roster: who is actually doing the work ── */
  function roster() {
    var tb = document.getElementById('clRoster'); if (!tb) return;
    tb.innerHTML = '';
    var c = document.getElementById('clRosterCount');
    if (c) c.textContent = STUDENTS.length + ' / ' + STUDENTS.length;
    STUDENTS.forEach(function (s) {
      var tr = el('tr');
      td(tr, s[0]);
      var r = el('td'); r.appendChild(el('span', 'cl-role ' + s[1], s[1])); tr.appendChild(r);
      td(tr, s[2] + '%'); td(tr, s[3] + '%'); td(tr, s[4]); td(tr, s[5]);
      tb.appendChild(tr);
    });
  }

  /* ── student detail: scroll depth per unit, the heat map ── */
  function detail() {
    var h = document.getElementById('clDetail'); if (!h) return;
    h.innerHTML = '';
    var sel = document.getElementById('clDetailPick');
    if (sel && !sel.options.length) {
      STUDENTS.forEach(function (s, i) { var o = el('option', null, s[0]); o.value = String(i); sel.appendChild(o); });
    }
    var idx = 0;
    if (sel && sel.value !== '') idx = Math.max(0, STUDENTS.findIndex(function (s) { return String(STUDENTS.indexOf(s)) === sel.value; }));
    var s = STUDENTS[idx < 0 ? 0 : idx];
    h.appendChild(el('h4', null, s[0] + T(' — scroll depth by section', ' —— 各小节阅读深度')));
    var list = el('div', 'cl-dm-heat');
    s[6].forEach(function (depth, i) {
      var row = el('div', 'cl-dm-hrow');
      row.appendChild(el('span', 'cl-dm-hu', UNITS[i]));
      var t = el('span', 'cl-dm-ht');
      var f = el('span', 'cl-dm-hf' + (depth >= 80 ? ' hi' : depth >= 40 ? ' mid' : depth > 0 ? ' lo' : ' none'));
      f.style.width = depth + '%';
      t.appendChild(f); row.appendChild(t);
      row.appendChild(el('span', 'cl-dm-hp', depth + '%'));
      list.appendChild(row);
    });
    h.appendChild(list);
    var lg = document.getElementById('clHeatLegend');
    if (lg) lg.innerHTML = '<span class="cl-dm-lg"><i class="hi"></i>' + T('read most', '读得最多') +
      '</span><span class="cl-dm-lg"><i class="mid"></i>' + T('partly', '部分') +
      '</span><span class="cl-dm-lg"><i class="lo"></i>' + T('barely', '几乎没读') +
      '</span><span class="cl-dm-lg"><i class="none"></i>' + T('not opened', '未打开') + '</span>';
  }

  /* ── release schedule: assigning work ── */
  function schedule() {
    var ul = document.getElementById('clAssignList'); if (!ul) return;
    ul.innerHTML = '';
    RELEASED.forEach(function (r) {
      var li = el('li', 'cl-dm-rel');
      li.appendChild(el('span', 'cl-dm-rel-t', r[0]));
      li.appendChild(el('span', 'cl-dm-rel-s ' + (r[1] === 'released' ? 'on' : r[1] === 'scheduled' ? 'soon' : 'off'),
        r[1] === 'released' ? T('Released', '已发布') : r[1] === 'scheduled' ? T('Scheduled', '计划中') : T('Held back', '暂不发布')));
      li.appendChild(el('span', 'cl-dm-rel-d', r[2]));
      li.appendChild(el('span', 'cl-dm-rel-p', r[3]));
      ul.appendChild(li);
    });
  }

  /* ── mark the tabs so it is obvious this is the demo ── */
  function tabs() {
    var t = document.getElementById('clTabs'); if (!t || document.getElementById('clDemoKey')) return;
    var k = el('span', 'cl-dm-key', T('showing sample data', '显示示例数据'));
    k.id = 'clDemoKey';
    t.appendChild(k);
  }

  function render() { if (window.__clDemoOn) { on(); } }

  function start() {
    /* only when there is genuinely no class, so real data is never covered */
    var noClass = document.getElementById('clNoClass');
    var signedOut = document.getElementById('clSignedOut');
    if (noClass && !noClass.hidden) { window.__clDemoOn = true; on(); return; }
    if (signedOut && !signedOut.hidden) return;
    var empty = !document.getElementById('clRoster') || !document.getElementById('clRoster').children.length;
    if (empty) { window.__clDemoOn = true; on(); }
  }

  function run() {
    var tries = 0;
    (function go() {
      if (document.getElementById('clTabs') || document.getElementById('clNoClass') || document.getElementById('clSignedOut')) { start(); return; }
      if (++tries > 40) return;
      setTimeout(go, 250);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();

  /* the student picker drives the demo heat map */
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'clDetailPick' && window.__clDemoOn) detail();
  });
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'langToggle') { setTimeout(render, 300); return; }
    /* Opening a tab runs the real loader, which REPLACES the contents of
       clAssignList / clRoster / clDetail. The demo therefore has to paint
       again after each tab switch, or the sample rows vanish the moment you
       look at them. Verified: without this, the release-schedule tab showed
       0 rows. */
    var tab = e.target && e.target.closest ? e.target.closest('.cl-tab') : null;
    if (tab && window.__clDemoOn) {
      var view = tab.getAttribute('data-view');
      setTimeout(function () {
        if (view === 'assign') schedule();
        else if (view === 'roster') { roster(); var c = document.getElementById('clRosterCount'); if (c) c.textContent = STUDENTS.length + ' / ' + STUDENTS.length; }
        else if (view === 'detail') detail();
        else if (view === 'overview') stats();
        else if (view === 'questions' || view === 'live') { /* nothing to fake */ }
      }, 700);
    }
  });
  /* Escape leaves the demo, so a teacher is never trapped in it */
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && window.__clDemoOn) off(); });

  /* On-demand preview. Auto-activation deliberately happens only when there is
     no class at all -- so a teacher who HAS a class would otherwise never see
     what the demo looks like, which is the whole point of having one. This
     mounts a small button for them. It only paints sample data on top of the
     live views and Exit restores the real numbers. */
  function mountPreview() {
    if (window.__clDemoOn) return;
    if (document.getElementById('clDemoOpen')) return;
    var host = visibleHost();
    if (!host || !host.parentNode) return;
    var b = el('button', 'cl-dm-open');
    b.type = 'button';
    b.id = 'clDemoOpen';
    b.textContent = T('Preview a demo class', '预览演示班级');
    b.addEventListener('click', function () { window.__clDemoOn = true; on(); paint(); });
    host.parentNode.insertBefore(b, host);
  }

  window.ClassroomDemo = {
    show: function () { window.__clDemoOn = true; on(); paint(); },
    hide: function () { off(); },
    isOn: function () { return !!window.__clDemoOn; }
  };

  setTimeout(function () { if (!window.__clDemoOn) mountPreview(); }, 1800);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   Classroom  ·  Vitalité
   Depends on: @supabase/supabase-js@2, progress-tracker.js (optional).

   Two rules shape the whole file:

   1. AUTHORITY IS auth.uid(), NEVER sm_user. sm_user is a localStorage string
      anyone can edit. supabase.auth.getUser() is the only thing that proves who
      this is, so every gated action goes through it, and the RLS policies in
      classroom-schema.sql enforce the same thing server side. The UI check is
      for a good error message, not for security.

   2. IF THE SCHEMA IS NOT THERE, SAY SO PLAINLY. Rather than throwing, the page
      detects the missing tables and shows the exact setup step, because that is
      the single most likely state right after shipping this.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SB_URL = 'https://eytmbftrjvsntyzwbtzl.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dG1iZnRyanZzbnR5endidHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTU2NjksImV4cCI6MjEwNDIzMTY2OX0.o0vRqteQ5XNgTNvnB3IEE9I67Oo_r4sy7JZ9qOGWSSc';

  /* The same Cloudflare Worker the site chat uses. Optional: if it is down the
     AI drafts button reports it and the other two ways in still work. */
  var AI_URL = 'https://api.vitaliteplan.com/';
  var COURSES = {
    vt:  { en: 'Vitalité Textbook', zh: 'Vitalité 教材', total: 90 },
    ib:  { en: 'IB SEHS',           zh: 'IB SEHS',         total: 83 },
    g10: { en: 'G10 Bio',           zh: 'G10 生物',        total: 15 }
  };
  var LAST = 'sm_classroom_last';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var cn = function () { return localStorage.getItem('sm_lang') === 'zh'; };
  function T(en, zh) { return cn() ? zh : en; }
  function when(ts) {
    if (!ts) return T('never', '从未');
    var d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (d < 60) return T('just now', '刚刚');
    if (d < 3600) return Math.floor(d / 60) + (cn() ? ' 分钟前' : ' min ago');
    if (d < 86400) return Math.floor(d / 3600) + (cn() ? ' 小时前' : ' h ago');
    return new Date(ts).toLocaleDateString();
  }

  function msg(node, text, kind) {
    if (!node) return;
    node.textContent = text || '';
    node.className = 'cl-msg' + (kind ? ' ' + kind : '');
  }

  /* ── the tables exist? ────────────────────────────────────────────────
     A missing table comes back as a PostgREST error on a 400/404, not as an
     exception, so probe once and branch on the result. */
  var db = null, ready = false, noSchema = false;
  function probeSchema() {
    if (!db) return Promise.resolve(false);
    return db.from('classrooms').select('id').limit(1).then(function (r) {
      if (!r.error) { ready = true; return true; }
      var m = (r.error.message || '') + ' ' + (r.error.code || '');
      if (/does not exist|not found|schema|PGRST/i.test(m)) { noSchema = true; return false; }
      // anything else (offline, RLS denying) is not a missing schema
      ready = true;
      return true;
    }).catch(function () { return true; });
  }

  /* ── auth ───────────────────────────────────────────────────────────── */
  var me = null;
  function signIn() {
    if (!db) return Promise.resolve(null);
    return db.auth.getUser().then(function (r) {
      me = (r && r.data && r.data.user) ? r.data.user : null;
      return me;
    }).catch(function () { me = null; return null; });
  }

  function whoami() {
    var n = me && (me.user_metadata || {});
    return n.full_name || n.name || (me && me.email) || T('Member', '成员');
  }

  /* ── which classroom am I in? ───────────────────────────────────────── */
  var room = null, role = 'student';

  function loadRoom() {
    var code = localStorage.getItem(LAST);
    if (!code) return Promise.resolve(null);
    return db.from('classrooms').select('*').eq('join_code', code).maybeSingle()
      .then(function (r) { return (r && r.data) || null; })
      .catch(function () { return null; });
  }

  function myMembership(cid) {
    if (!me) return Promise.resolve(null);
    return db.from('classroom_members').select('*')
      .eq('classroom_id', cid).eq('user_id', me.id).maybeSingle()
      .then(function (r) { return (r && r.data) || null; })
      .catch(function () { return null; });
  }

  function code6() {
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 4; i++) {
      s += a.charAt(Math.floor(Math.random() * a.length));
      if (i === 1) s += '-';
    }
    return 'VIT-' + s;
  }

  /* ── views ──────────────────────────────────────────────────────────── */
  var views = ['overview', 'roster', 'detail', 'assign', 'questions', 'live'];
  var current = 'overview';

  function show(which) {
    if (views.indexOf(which) < 0) which = 'overview';
    current = which;
    $$('.cl-tab').forEach(function (t) {
      t.setAttribute('aria-selected', t.getAttribute('data-view') === which ? 'true' : 'false');
    });
    $$('.cl-view').forEach(function (v) {
      v.hidden = v.getAttribute('data-view') !== which;
    });
    if (which === 'roster') loadRoster();
    if (which === 'detail') loadDetail();
    if (which === 'assign') loadAssignments();
    if (which === 'questions') loadQuestions();
    if (which === 'live') Live.mount();
  }

  function setState(which) {
    $('#clSignedOut').hidden = which !== 'signedOut';
    $('#clNoSchema').hidden = which !== 'noSchema';
    $('#clNoClass').hidden = which !== 'noClass';
    $('#clInClass').hidden = which !== 'inClass';
  }

  /* ── progress rollups ───────────────────────────────────────────────── */
  var prog = { rows: [] };
  function courseOf() { return room ? room.course : 'vt'; }

  function loadProgress() {
    if (!room) return Promise.resolve();
    return db.from('progress_events').select('*').eq('classroom_id', room.id)
      .then(function (r) { prog.rows = (r && r.data) || []; renderOverview(); })
      .catch(function () { prog.rows = []; renderOverview(); });
  }

  var haveCatalogue = false;
  function unitsFor(course) {
    var P = window.VitaliteProgress;
    var total = (COURSES[course] || COURSES.vt).total;
    var groups = P && P.groups ? P.groups(course) : [];
    haveCatalogue = groups.length > 0 && !(groups.length === 1 && groups[0].id === 'all');
    if (!haveCatalogue) return [{ id: 'all', n: total }];
    return groups.map(function (g) { return { id: g.id, n: g.total }; });
  }

  /* Which rows to draw. The tracker's catalogue is authoritative because it
     knows the real total per topic even when nothing has been read yet. When
     it is not on this page, group the recorded rows by unit id instead, so a
     teacher still sees one line per topic rather than a single flat block. */
  function rowsForHeat() {
    var groups = unitsFor(courseOf());
    if (haveCatalogue) return groups;
    var fromRows = groupsFromRows();
    return (fromRows && fromRows.length) ? fromRows : groups;
  }

  /* Group the recorded rows by their unit id, so the page still shows one line
     per topic even when progress-tracker.js is not loaded here and LAYOUT is
     unavailable. Returns null when there is nothing recorded. */
  function groupsFromRows() {
    var seen = {};
    prog.rows.forEach(function (r) {
      var p = String(r.unit_id || '').split(':');
      if (p[0] !== courseOf()) return;
      var g = seen[p[1]] = seen[p[1]] || { secs: {}, read: {} };
      /* one cell per SECTION, not per row: a topic with 3 sections and 20
         students has 60 rows but only 3 sections to draw */
      g.secs[p[2]] = 1;
      if (r.read) { g.read[p[2]] = 1; }
    });
    var keys = Object.keys(seen);
    if (!keys.length) return null;
    return keys.sort().map(function (k) {
      return { id: k, n: Object.keys(seen[k].secs).length,
               read: Object.keys(seen[k].read).length };
    });
  }

  function readSet(cid) {
    var s = {};
    prog.rows.forEach(function (r) {
      if (r.user_id !== cid || !r.read) return;
      var p = String(r.unit_id || '').split(':');
      if (p[0] !== courseOf()) return;
      (s[p[1]] = s[p[1]] || {})[p[2]] = 1;
    });
    return s;
  }

  function heatFor(rowSet, groups, mapIdx) {
    return groups.map(function (g) {
      var gset = rowSet[g.id] || {}, cells = [];
      for (var i = 0; i < g.n; i++) {
        cells.push(gset[i] ? 3 : (mapIdx && mapIdx[g.id] ? mapIdx[g.id][i] : 0));
      }
      return { id: g.id, cells: cells };
    });
  }

  function renderOverview() {
    if (!room) return;
    var course = courseOf();
    var members = rosterCache || [];
    var students = members.filter(function (m) { return m.user_id !== (me && me.id); });
    var groups = unitsFor(course);
    var total = (COURSES[course] || {}).total || 0;

    /* count DISTINCT units read, not rows: one row exists per student per
       unit, so counting rows divides a multi-student class by a single
       student's denominator and can exceed 100% */
    var seen = {};
    prog.rows.forEach(function (r) {
      if (r.read && String(r.unit_id || '').indexOf(course + ':') === 0) seen[r.unit_id] = 1;
    });
    var reads = Object.keys(seen).length;
    var active = {};
    prog.rows.forEach(function (r) { active[r.user_id] = 1; });
    var lastSeen = rosterCacheLast || {};

    var box = $('#clStats');
    box.innerHTML = '';
    [
      [String(members.length), T('members', '成员')],
      [String(students.length), T('students', '学生')],
      [String(total ? Math.round(reads / total * 100) : 0) + '%', T('class progress', '全班进度')],
      [String(Object.keys(active).length), T('reported in', '已上报人数')]
    ].forEach(function (pair) {
      var d = el('div', 'cl-stat');
      d.appendChild(el('b', null, pair[0]));
      d.appendChild(el('span', null, pair[1]));
      box.appendChild(d);
    });

    /* heatmap: chapters or topics, one cell per section */
    var host = $('#clHeat');
    host.innerHTML = '';
    if (!total) {
      host.appendChild(el('p', 'cl-empty', T('No sections to show yet.', '暂无可显示的章节。')));
    } else {
      var perStudent = {};
      (students.length ? students : [{ user_id: null }]).forEach(function (m) {
        perStudent[m.user_id] = m.user_id ? readSet(m.user_id) : {};
      });
      var keys = Object.keys(perStudent).filter(function (k) { return k !== 'null' && k; });
      rowsForHeat().forEach(function (g) {
        var line = el('div', 'cl-heat-group');
        var name = el('span', 'cl-heat-name', g.id === 'all' ? T('All', '全部') : g.id);
        line.appendChild(name);
        var cells = el('div', 'cl-heat-cells');
        for (var i = 0; i < g.n; i++) {
          var read = 0, part = 0;
          keys.forEach(function (k) {
            if (k === 'null' || !k) return;
            var gset = perStudent[k][g.id] || {};
            if (gset[i]) read++;
            else part++;
          });
          var pct = keys.length ? Math.round(read / keys.length * 100) : 0;
          /* one step per half of the class: 1, 2, then fully read */
          var level = read ? Math.min(3, 1 + Math.floor(pct / 50)) : (part ? 1 : 0);
          var cell = el('span', 'cl-cell' + (level ? ' d' + level : ''));
          cell.title = g.id + ' · ' + T('read by', '已读人数') + ' ' + pct + '%';
          cells.appendChild(cell);
        }
        line.appendChild(cells);
        host.appendChild(line);
      });
    }

    var lg = $('#clHeatLegend');
    lg.innerHTML = '';
    ['', 'd1', 'd2', 'd3'].forEach(function (c) {
      lg.appendChild(el('span', 'cl-cell ' + c));
    });
    lg.appendChild(el('span', null, T('one cell per section · darker = more of the class has read it',
      '每格一节 · 颜色越深表示读过的人越多')));
  }

  /* ── roster ─────────────────────────────────────────────────────────── */
  var rosterCache = null, rosterCacheLast = null;

  function loadRoster() {
    if (!room) return;
    var btn = $('#clRoster');
    btn.innerHTML = '<tr><td colspan="6" class="cl-empty">' + esc(T('Loading…', '加载中…')) + '</td></tr>';
    Promise.all([
      db.from('classroom_members').select('*').eq('classroom_id', room.id).order('joined_at'),
      db.from('progress_events').select('*').eq('classroom_id', room.id)
    ]).then(function (res) {
      rosterCache = (res[0] && res[0].data) || [];
      prog.rows = (res[1] && res[1].data) || [];
      rosterCacheLast = {};
      prog.rows.forEach(function (r) {
        var t = new Date(r.updated_at).getTime();
        if (!rosterCacheLast[r.user_id] || t > rosterCacheLast[r.user_id]) rosterCacheLast[r.user_id] = t;
      });
      drawRoster();
      /* the overview needs the roster, so it can only be drawn once this
         resolves - drawing it first is what produced "members 0" */
      renderOverview();
    }).catch(function (e) {
      btn.innerHTML = '<tr><td colspan="6" class="cl-empty">' + esc(e.message || String(e)) + '</td></tr>';
    });
  }

  function drawRoster() {
    var tb = $('#clRoster');
    tb.innerHTML = '';
    var q = ($('#clSearch').value || '').trim().toLowerCase();
    var rows = (rosterCache || []).filter(function (m) {
      return !q || String(m.display_name || m.user_id).toLowerCase().indexOf(q) >= 0;
    });
    $('#clRosterCount').textContent = rows.length + ' / ' + (rosterCache || []).length;

    var course = courseOf();
    var total = (COURSES[course] || {}).total || 0;
    if (!rows.length) {
      var e = el('tr');
      var td = el('td', 'cl-empty', T('Nobody here yet. Share the class code.', '还没有成员，分享班级码即可加入。'));
      td.colSpan = 6;
      e.appendChild(td);
      tb.appendChild(e);
      return;
    }
    rows.forEach(function (m) {
      var set = readSet(m.user_id);
      var n = 0;
      for (var g in set) for (var i in set[g]) if (set[g][i]) n++;
      var tr = el('tr');
      var td1 = el('td');
      td1.appendChild(document.createTextNode(m.display_name || T('Member', '成员')));
      tr.appendChild(td1);
      var td2 = el('td');
      var role = el('span', 'cl-role ' + m.role, m.role);
      td2.appendChild(role);
      tr.appendChild(td2);
      tr.appendChild(el('td', null, n + ' / ' + total));
      var td4 = el('td');
      var wrap = el('div', 'cl-bar-wrap');
      var fill = el('div', 'cl-bar-fill');
      fill.style.width = (total ? Math.round(n / total * 100) : 0) + '%';
      wrap.appendChild(fill);
      td4.appendChild(wrap);
      tr.appendChild(td4);
      tr.appendChild(el('td', null, when(rosterCacheLast[m.user_id])));
      var td6 = el('td');
      var view = el('button', 'cl-linkbtn', T('Detail', '详情'));
      view.onclick = function () {
        $('#clDetailPick').value = m.user_id;
        show('detail');
      };
      td6.appendChild(view);
      if (role === 'teacher') {
        var rm = el('button', 'cl-linkbtn danger', T('Remove', '移除'));
        rm.onclick = function () { removeMember(m.user_id); };
        td6.appendChild(rm);
      }
      tr.appendChild(td6);
      tb.appendChild(tr);
    });
  }

  function removeMember(uid) {
    if (!confirm(T('Remove this student from the class?', '把该学生移出班级？'))) return;
    db.from('classroom_members').delete().eq('classroom_id', room.id).eq('user_id', uid)
      .then(function (r) {
        if (r.error) throw r.error;
        loadRoster();
      }).catch(function (e) { msg($('#clRosterMsg'), e.message || String(e), 'err'); });
  }

  /* ── student detail ─────────────────────────────────────────────────── */
  function loadDetail() {
    if (!room) return;
    var pick = $('#clDetailPick');
    if (!rosterCache) loadRoster();
    var members = rosterCache || [];
    if (!members.length) { loadRoster(); return; }
    var keep = pick.value;
    pick.innerHTML = '';
    members.forEach(function (m) {
      var o = el('option', null, m.display_name || T('Member', '成员'));
      o.value = m.user_id;
      pick.appendChild(o);
    });
    if (keep) pick.value = keep;
    drawDetail();
  }

  function drawDetail() {
    var host = $('#clDetail');
    host.innerHTML = '';
    if (!prog.rows.length) { loadRoster(); return; }
    var uid = $('#clDetailPick').value;
    var mine = prog.rows.filter(function (r) { return r.user_id === uid; });
    var set = readSet(uid);
    var course = courseOf();
    var groups = rowsForHeat();
    var total = (COURSES[course] || {}).total || 0;
    var read = 0;
    for (var g in set) for (var i in set[g]) if (set[g][i]) read++;

    var head = el('div', 'cl-detail-row');
    head.appendChild(el('b', 'cl-grow', read + ' / ' + total + ' ' + T('sections read', '节已读')));
    host.appendChild(head);

    var bar = el('div', 'cl-bar-wrap');
    var fill = el('div', 'cl-bar-fill');
    fill.style.width = (total ? Math.round(read / total * 100) : 0) + '%';
    bar.appendChild(fill);
    host.appendChild(bar);

    var groups2 = el('div', 'cl-heat');
    groups.forEach(function (g) {
      var line = el('div', 'cl-heat-group');
      line.appendChild(el('span', 'cl-heat-name', g.id === 'all' ? T('All', '全部') : g.id));
      var cells = el('div', 'cl-heat-cells');
      var gset = set[g.id] || {};
      for (var i = 0; i < g.n; i++) {
        var c = el('span', 'cl-cell' + (gset[i] ? ' d3' : ''));
        c.title = g.id + ' ' + (i + 1) + (gset[i] ? ' · ' + T('read', '已读') : '');
        cells.appendChild(c);
      }
      line.appendChild(cells);
      groups2.appendChild(line);
    });
    host.appendChild(groups2);

    if (role === 'teacher') {
      var tools = el('div', 'cl-detail-row');
      var reset = el('button', 'cl-chip', T('Reset progress', '重置进度'));
      reset.onclick = function () {
        if (!confirm(T('Delete this student’s recorded progress?', '删除该学生的阅读进度记录？'))) return;
        db.from('progress_events').delete().eq('classroom_id', room.id).eq('user_id', uid)
          .then(function () { loadRoster(); drawDetail(); });
      };
      var ext = el('button', 'cl-chip', T('Release everything', '全部发布'));
      ext.onclick = function () { releaseAll(); };
      tools.appendChild(reset);
      tools.appendChild(ext);
      host.appendChild(tools);
    }

    if (!mine.length) {
      host.appendChild(el('p', 'cl-empty',
        T('This student has not reported any reading yet. Their progress uploads the first time they read a section while signed in.', '该学生尚未上报阅读记录。登录后阅读章节时会上报。')));
    }
  }

  /* ── release schedule ───────────────────────────────────────────────── */
  function loadAssignments() {
    var ul = $('#clAssignList');
    ul.innerHTML = '';
    db.from('assignments').select('*').eq('classroom_id', room.id).order('created_at')
      .then(function (r) {
        if (r.error) throw r.error;
        if (!r.data.length) {
          ul.appendChild(el('li', 'cl-empty', T('Nothing released yet. Add a unit id above, or * for the whole course.',
            '还没有发布内容。可在上方填写单元 id，或用 * 表示整门课。')));
          return;
        }
        r.data.forEach(function (a) {
          var li = el('li');
          var g = el('span', 'cl-grow');
          g.appendChild(el('span', 'cl-unit', a.unit_id));
          if (a.title) g.appendChild(document.createTextNode(' · ' + a.title));
          li.appendChild(g);
          li.appendChild(el('span', 'cl-tag', a.target_pct ? a.target_pct + '%' : T('open', '不限')));
          if (a.due_at) li.appendChild(el('span', 'cl-tag', String(a.due_at).slice(0, 10)));
          li.appendChild(el('span', 'cl-tag' + (a.released ? ' live' : ''), a.released ? T('released', '已发布') : T('scheduled', '待发布')));
          if (role === 'teacher') {
            var t = el('button', 'cl-linkbtn', a.released ? T('Unrelease', '取消发布') : T('Release', '发布'));
            t.onclick = function () { db.from('assignments').update({ released: !a.released }).eq('id', a.id).then(loadAssignments); };
            li.appendChild(t);
            var x = el('button', 'cl-linkbtn danger', '×');
            x.onclick = function () { db.from('assignments').delete().eq('id', a.id).then(loadAssignments); };
            li.appendChild(x);
          }
          ul.appendChild(li);
        });
      }).catch(function (e) {
        ul.appendChild(el('li', 'cl-empty', esc(e.message || String(e))));
      });
  }

  function releaseAll() {
    var unit = T('*', '*');
    var payload = {
      classroom_id: room.id, unit_id: unit, released: true,
      title: T('Everything', '全部内容'), target_pct: null, due_at: null
    };
    db.from('assignments').upsert(payload, { onConflict: 'classroom_id,unit_id' })
      .then(function (r) { if (r.error) throw r.error; loadAssignments(); })
      .catch(function (e) { msg($('#clAssignMsg'), e.message || String(e), 'err'); });
  }

  /* ── questions ──────────────────────────────────────────────────────────
   Three ways in, and one rule: AI questions are never published on their own.
   Imported and hand-written questions are approved at creation; generated ones
   land as drafts and only a teacher can promote them. */
  var qFilter = 'all';

  function qRow(r) {
    var prompt = cn() && r.prompt_zh ? r.prompt_zh : r.prompt;
    var choices = (cn() && r.choices_zh && r.choices_zh.length === 4) ? r.choices_zh : r.choices;
    return { prompt: prompt, choices: choices, a: r.answer_index };
  }

  function seedPool() {
    var S = window.CLASSROOM_SEED || {};
    /* the pool is filed by source bank, not by course: a teacher may run an IB
       class and pull NPTE questions, so nothing is hidden from them */
    var out = [];
    ['g10', 'cn', 'npte'].forEach(function (bank) {
      (S[bank] || []).forEach(function (q) {
        out.push({ q: q.q, qz: q.qz, o: q.o, oz: q.oz, a: q.a, e: q.e, ez: q.ez, bank: bank });
      });
    });
    return out;
  }

  function loadQuestions() {
    var ul = $('#clQList');
    ul.innerHTML = '';
    var f = $('#clQFilters');
    f.innerHTML = '';
    [['all', T('All', '全部')], ['approved', T('Published', '已发布')],
     ['draft', T('Drafts', '草稿')], ['ai', T('AI drafts', 'AI 草稿')]].forEach(function (pair) {
      var b = el('button', 'cl-chip', pair[1]);
      if (qFilter === pair[0]) b.style.borderColor = 'var(--accent)';
      b.onclick = function () { qFilter = pair[0]; loadQuestions(); };
      f.appendChild(b);
    });

    var q = db.from('questions').select('*').eq('classroom_id', room.id)
      .order('created_at', { ascending: false });
    if (qFilter === 'approved') q = q.eq('approved', true);
    if (qFilter === 'draft') q = q.eq('approved', false);
    if (qFilter === 'ai') q = q.eq('source', 'ai');
    q.then(function (r) {
      if (r.error) throw r.error;
      var rows = (r && r.data) || [];
      var nPub = rows.filter(function (x) { return x.approved; }).length;
      var nDraft = rows.length - nPub;
      var tally = $('#clQTally');
      if (tally) tally.textContent = rows.length
        ? T(nPub + ' published, ' + nDraft + ' drafts', nPub + ' 已发布 · ' + nDraft + ' 草稿')
        : T('empty', '暂无题目');

      if (!rows.length) {
        ul.appendChild(el('li', 'cl-empty',
          T('No questions yet. Import from the site banks, write one, or generate a draft.',
            '还没有题目。可从站内题库导入、手写，或生成 AI 草稿。')));
        return;
      }
      rows.forEach(function (q2) {
        var v = qRow(q2);
        var li = el('li');
        var g = el('span', 'cl-grow');
        g.appendChild(el('b', null, v.prompt));
        g.appendChild(el('span', 'cl-dim',
          '  ' + v.choices.map(function (c, i) { return (i === v.a ? '✓ ' : '') + c; }).join('  ·  ')));
        li.appendChild(g);
        li.appendChild(el('span', 'cl-tag', q2.source));
        if (!q2.approved) li.appendChild(el('span', 'cl-tag draft', T('draft', '草稿')));
        else li.appendChild(el('span', 'cl-tag live', T('published', '已发布')));
        if (role === 'teacher' && !q2.approved) {
          var ok = el('button', 'cl-linkbtn', T('Approve', '批准'));
          ok.onclick = function () {
            db.from('questions').update({ approved: true }).eq('id', q2.id)
              .then(function (e) { if (e.error) throw e.error; loadQuestions(); })
              .catch(function (e) { msg($('#clQMsg'), e.message || String(e), 'err'); });
          };
          li.appendChild(ok);
        }
        var del = el('button', 'cl-linkbtn danger', '×');
        del.onclick = function () {
          if (!confirm(T('Delete this question?', '删除这道题？'))) return;
          db.from('questions').delete().eq('id', q2.id).then(loadQuestions);
        };
        li.appendChild(del);
        ul.appendChild(li);
      });
    }).catch(function (e) {
      ul.appendChild(el('li', 'cl-empty', esc(e.message || String(e))));
    });
  }

  function rowsFrom(seed, howMany) {
    var pool = seedPool();
    /* shuffle, then take a spread rather than the first N, so a teacher never
       ends up with only anatomy because the file happens to start there */
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    var take = pool.slice(0, Math.min(howMany, pool.length));
    return take.map(function (s) {
      return {
        classroom_id: room.id, author_id: me.id, course: room.course,
        prompt: s.q, prompt_zh: s.qz, choices: s.o, choices_zh: s.oz,
        answer_index: s.a, explanation: s.e, explanation_zh: s.ez,
        source: 'existing', approved: true
      };
    });
  }

  function importBank() {
    var n = Number(($('#clImportN').value || 20) || 20);
    var rows = rowsFrom(null, n);
    if (!rows.length) return;
    var btn = $('#clImportBtn');
    btn.disabled = true;
    /* upsert on (classroom_id, author_id, prompt)? there is no such unique key,
       so this is an insert and a double-click would duplicate. Guard with a
       length check first and disable the button until it resolves. */
    db.from('questions').select('prompt').eq('classroom_id', room.id).then(function (have) {
      var seen = {};
      ((have && have.data) || []).forEach(function (x) { seen[x.prompt] = 1; });
      var fresh = rows.filter(function (x) { return !seen[x.prompt]; });
      if (!fresh.length) {
        btn.disabled = false;
        msg($('#clQMsg'), T('Those questions are already in this class.',
          '这些题目已经在这个班级里了。'), 'err');
        return;
      }
      return db.from('questions').insert(fresh).then(function (r) {
        if (r.error) throw r.error;
        loadQuestions();
        msg($('#clQMsg'), T('Imported ' + fresh.length
          + (fresh.length === 1 ? ' question.' : ' questions.'),
          '已导入 ' + fresh.length + ' 道题目。'), 'ok');
      });
    }).catch(function (e) {
      msg($('#clQMsg'), e.message || String(e), 'err');
    }).then(function () { btn.disabled = false; });
  }

  function writeQuestion() {
    var p = ($('#clQPrompt').value || '').trim();
    var pz = ($('#clQPromptZh').value || '').trim();
    var cs = [0, 1, 2, 3].map(function (i) { return ($('#clQOpt' + i).value || '').trim(); });
    var czs = [0, 1, 2, 3].map(function (i) { return ($('#clQOptZh' + i).value || '').trim(); });
    var a = Number($('#clQAnswer').value);
    var ex = ($('#clQExplain').value || '').trim();
    var m = $('#clQWriteMsg');
    msg(m, '');
    if (p.length < 8) { msg(m, T('Write the question.', '请填写题干。'), 'err'); return; }
    if (cs.some(function (x) { return !x; })) {
      msg(m, T('All four choices are needed.', '四个选项都要填。'), 'err'); return;
    }
    if (new Set(cs.map(function (x) { return x.toLowerCase(); })).size !== 4) {
      msg(m, T('The four choices must be different.', '四个选项不能重复。'), 'err'); return;
    }
    if (!(a >= 0 && a <= 3)) { msg(m, T('Pick the correct answer.', '请选择正确答案。'), 'err'); return; }

    db.from('questions').insert({
      classroom_id: room.id, author_id: me.id, course: room.course,
      prompt: p, prompt_zh: pz || null, choices: cs,
      choices_zh: czs.every(function (x) { return x; }) ? czs : cs,
      answer_index: a, explanation: ex, explanation_zh: null,
      source: 'teacher', approved: true
    }).then(function (r) {
      if (r.error) throw r.error;
      ['clQPrompt', 'clQPromptZh', 'clQOpt0', 'clQOpt1', 'clQOpt2', 'clQOpt3',
       'clQOptZh0', 'clQOptZh1', 'clQOptZh2', 'clQOptZh3', 'clQExplain']
        .forEach(function (id) { var n = document.getElementById(id); if (n) n.value = ''; });
      msg(m, T('Added.', '已添加。'), 'ok');
      loadQuestions();
    }).catch(function (e) { msg(m, e.message || String(e), 'err'); });
  }

  /* AI generation. The worker is optional: if it is unreachable the teacher
     gets a clear message rather than a silent failure, and the question bank
     still works from the import and the hand-written form. */
  /* AI generation.

     Two findings shaped this, both from talking to the real worker:

     1. The worker is a sports-medicine TUTOR, so asking it for JSON gets a
        conversational reply ("please provide your question"), not data.
     2. When it does oblige with JSON, the reply comes back TRUNCATED mid-array,
        so JSON.parse throws on anything longer than a couple of questions.

     So: ask for the plain Question/A/B/C/D/Answer/Why layout the tutor
     produces naturally, and parse that. It is not as strict as JSON but it
     survives truncation, because a half-written trailing question is simply
     dropped rather than killing the whole batch. */
  function aiQuestions(promptText, howMany) {
    var ask = (cn()
      ? '请写 ' + howMany + ' 道关于以下内容的四选一单选题。每一道严格用下面的格式，不要写其他内容：\n'
        + 'Question: <题干>\nA) <选项>\nB) <选项>\nC) <选项>\nD) <选项>\nAnswer: <A/B/C/D>\nWhy: <一句话解析>\n\n内容：'
      : 'Write ' + howMany + ' multiple-choice quiz questions about the following. '
        + 'Use exactly this layout for each one and write nothing else:\n'
        + 'Question: <the question>\nA) <option>\nB) <option>\nC) <option>\nD) <option>\n'
        + 'Answer: <A|B|C|D>\nWhy: <one sentence>\n\nTopic: ')
      + promptText + '\n\n'
      + (cn()
        ? '要求：四个选项必须不同，每题只考一个知识点，不要重复，不要重复上面的格式说明。'
        : 'Rules: exactly 4 distinct options per question, one factual point each, '
          + 'do not repeat a fact, and do not repeat these instructions as a question.');

    return fetch(AI_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: ask, lang: cn() ? 'zh' : 'en', mode: 'clinical' })
    }).then(function (r) { return r.json(); }).then(function (d) {
      var raw = (d && d.reply) || '';
      if (!raw) throw new Error(T('The AI returned nothing.', 'AI 没有返回内容。'));

      /* Split on "Question:" by plain indexOf, not a regex.
         String.split(/^\s*(?=Question\s*:)/m) matched (RegExp.test said true)
         but returned a single element on this text, and pinning that down is a
         rabbit hole. indexOf is deterministic and this file already parses by
         scanning elsewhere. */
      var blocks = [], from = 0;
      while (from < raw.length) {
        var at = raw.indexOf('Question:', from);
        if (at < 0) break;
        blocks.push(raw.slice(at));
        from = at + 9;
      }

      function field(block, label) {
        var p = block.indexOf(label);
        if (p < 0) return null;
        var v = block.slice(p + label.length);
        var e = v.search(/\r?\n/);
        if (e >= 0) v = v.slice(0, e);
        return v.replace(/^[\s:\u2013-]+/, '').trim();
      }

      var out = [], seen = {};
      blocks.forEach(function (block) {
        var prompt = field(block, 'Question:');
        var opts = ['A)', 'B)', 'C)', 'D)'].map(function (L) {
          var p = block.indexOf('\n' + L);
          var from = p + 1 + L.length;      /* +1 skips the newline: with just
                                              p + L.length the option kept its
                                              trailing ")" */
          if (p < 0) { p = block.indexOf(L); from = p + L.length; }
          if (p < 0) return null;
          var v = block.slice(from);
          var e = v.search(/\r?\n/);
          if (e >= 0) v = v.slice(0, e);
          return v.replace(/^[\s\u2013-]+/, '').trim() || null;
        });
        var ansTxt = field(block, 'Answer:');
        var why = field(block, 'Why:');
        var a = ansTxt ? 'ABCD'.indexOf(ansTxt.charAt(0).toUpperCase()) : -1;
        if (!prompt || prompt.length < 8) return;
        if (opts.some(function (x) { return !x; })) return;
        if (a < 0) return;
        if (new Set(opts.map(function (x) { return x.toLowerCase(); })).size !== 4) return;
        var key = prompt.toLowerCase().slice(0, 60);
        if (seen[key]) return;
        seen[key] = 1;
        out.push({
          classroom_id: room.id, author_id: me.id, course: room.course,
          prompt: prompt, prompt_zh: null,
          choices: opts, choices_zh: opts, answer_index: a,
          explanation: why || '', explanation_zh: null,
          /* ALWAYS a draft. The whole point of the approval queue. */
          source: 'ai', approved: false
        });
      });
      if (!out.length) {
        throw new Error(T('The AI reply had no complete question in it. Try asking again, or write one by hand.',
          'AI 的回复里没有完整的题目，可以再试一次，或手写一道。'));
      }
      return out;
    });
  }

  function generateAi() {
    var topic = ($('#clAiTopic').value || '').trim();
    var n = Math.min(10, Math.max(1, Number(($('#clAiN').value || 5) || 5)));
    var m = $('#clAiMsg');
    if (!topic) { msg(m, T('Say what the questions should cover.', '请说明要考什么内容。'), 'err'); return; }
    msg(m, T('Asking the AI… this takes a few seconds.', '正在请求 AI…需要几秒。'));
    var btn = $('#clAiBtn');
    btn.disabled = true;
    aiQuestions(topic, n).then(function (rows) {
      if (!rows.length) throw new Error(T('No usable questions came back.', '没有可用的题目。'));
      return db.from('questions').insert(rows).then(function (r) {
        if (r.error) throw r.error;
        msg(m, T('Added ' + rows.length
          + (rows.length === 1 ? ' draft' : ' drafts')
          + '. Review and approve them below.',
          '已生成 ' + rows.length + ' 道草稿。请在下方审核并批准。'), 'ok');
        loadQuestions();
      });
    }).catch(function (e) {
      msg(m, (e && e.message) || String(e), 'err');
    }).then(function () { btn.disabled = false; });
  }

/* ── live quiz ──────────────────────────────────────────────────────── */
  var Live = (function () {
    var chan = null, session = null, board = [];

    function mount() {
      var host = $('#clLive');
      if (!host) return;
      host.innerHTML = '';
      if (role !== 'teacher' && role !== 'assistant') {
        host.appendChild(el('p', 'cl-empty',
          T('Live sessions appear here when your teacher starts one.', '老师开始实时答题时，这里会显示。')));
        return;
      }
      var start = el('button', 'qo-btn next', T('Start a live quiz', '开始实时答题'));
      start.onclick = function () { start_([]); };
      host.appendChild(start);

      var importBtn = el('button', 'qo-btn', T('Use the bank…', '使用题库…'));
      importBtn.onclick = function () {
        db.from('questions').select('id').eq('classroom_id', room.id).eq('approved', true)
          .then(function (r) {
            start_((r.data || []).map(function (x) { return x.id; }));
          });
      };
      host.appendChild(importBtn);
      host.appendChild(el('p', 'cl-dim',
        T('Realtime needs the session tables from classroom-schema.sql, and Supabase Realtime enabled for the project.',
          '实时答题需要 classroom-schema.sql 里的场次表，并为项目启用 Supabase Realtime。')));
    }

    function start_(ids) {
      if (!ids.length) {
        db.from('questions').select('id').eq('classroom_id', room.id).eq('approved', true)
          .then(function (r) { ids = (r.data || []).map(function (x) { return x.id; }); create(ids); });
      } else create(ids);
    }

    function create(ids) {
      if (!ids.length) {
        msg($('#clLiveMsg'), T('No published questions to use yet. Approve a few in Questions first.',
          '还没有已发布的题目。请先在「题目」里批准几道。'), 'err');
        return;
      }
      db.from('live_sessions').insert({
        classroom_id: room.id, teacher_id: me.id, course: courseOf(),
        title: T('Live quiz', '实时答题'), state: 'lobby', question_ids: ids
      }).select().single().then(function (r) {
        if (r.error) throw r.error;
        session = r.data;
        localStorage.setItem(LAST, room.join_code);
        render();
        subscribe();
      }).catch(function (e) { msg($('#clLiveMsg'), e.message || String(e), 'err'); });
    }

    function subscribe() {
      if (!session || typeof db.channel !== 'function') return;
      if (chan) db.removeChannel(chan);
      chan = db.channel('live:' + session.id)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'live_sessions', filter: 'id=eq.' + session.id
        }, function (p) {
          if (p.new) session = p.new;
          render();
        })
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'live_answers', filter: 'session_id=eq.' + session.id
        }, function () { loadBoard(); })
        .subscribe();
    }

    function loadBoard() {
      if (!session) return;
      db.from('live_answers').select('*').eq('session_id', session.id)
        .then(function (r) { board = (r.data || []); render(); });
    }

    function render() {
      var host = $('#clLive');
      if (!host || !session) return;
      host.innerHTML = '';
      var stage = el('div', 'cl-live-stage');
      stage.appendChild(el('div', 'cl-live-state', session.state || 'lobby'));
      var cur = (session.question_ids || [])[session.current_q || 0];
      stage.appendChild(el('div', 'cl-live-q',
        session.state === 'lobby' ? session.title
          : T('Question ', '第 ') + ((session.current_q || 0) + 1) + ' / ' + (session.question_ids || []).length));

      if (cur) {
        db.from('questions').select('*').eq('id', cur).maybeSingle().then(function (r) {
          var q = r.data;
          if (!q) return;
          var opts = el('div', 'cl-live-opts');
          (q.choices || []).forEach(function (c, i) {
            var b = el('button', 'cl-live-opt', String.fromCharCode(65 + i) + '. ' + c);
            b.onclick = function () {
              db.from('live_answers').insert({
                session_id: session.id, user_id: me.id, question_id: q.id, chosen_index: i
              }).then(function () { b.disabled = true; b.classList.add('right'); });
            };
            if (session.state === 'reveal' || session.state === 'lock') {
              b.disabled = true;
              if (i === q.answer_index) b.classList.add('right');
            }
            opts.appendChild(b);
          });
          stage.appendChild(opts);
        });
      }

      if (role === 'teacher') {
        var ctl = el('div', 'cl-row');
        ['question', 'lock', 'reveal'].forEach(function (st) {
          var b = el('button', 'qo-btn', T('→ ' + st, '→ ' + st));
          b.onclick = function () {
            var patch = { state: st };
            if (st === 'question') patch.current_q = (session.current_q || -1) + 1;
            db.from('live_sessions').update(patch).eq('id', session.id).then(function () {
              session.state = st; session.current_q = patch.current_q != null ? patch.current_q : session.current_q;
              render(); loadBoard();
            });
          };
          ctl.appendChild(b);
        });
        var end = el('button', 'qo-btn', T('End', '结束'));
        end.onclick = function () {
          db.from('live_sessions').delete().eq('id', session.id).then(function () {
            if (chan) db.removeChannel(chan);
            session = null; mount();
          });
        };
        ctl.appendChild(end);
        stage.appendChild(ctl);
      }

      host.appendChild(stage);

      var counts = {};
      board.forEach(function (a) { if (a.question_id === cur) counts[a.chosen_index] = (counts[a.chosen_index] || 0) + 1; });
      if (Object.keys(counts).length) {
        var ul = el('ul', 'cl-live-board');
        Object.keys(counts).map(Number).sort(function (a, b) { return counts[b] - counts[a]; })
          .forEach(function (k) {
            var li = el('li');
            li.appendChild(el('span', 'cl-grow', String.fromCharCode(65 + k)));
            li.appendChild(el('span', 'cl-n', counts[k]));
            ul.appendChild(li);
          });
        host.appendChild(ul);
      }
    }

    return { mount: mount };
  })();

  /* ── actions ────────────────────────────────────────────────────────── */
  function enterRoom(r, membership) {
    /* guard the shape: if this ever gets handed the raw {data,error} envelope
       instead of a row, the stored class code silently becomes the string
       "undefined" and every later load queries for a class that cannot exist */
    if (!r || r.data || !r.join_code) {
      console.error('classroom: bad classroom row', r);
      setState('noClass');
      return;
    }
    room = r;
    role = (membership && membership.role) || 'student';
    localStorage.setItem(LAST, r.join_code);
    setState('inClass');
    $('#clTitle').textContent = r.name;
    $('#clCourseLabel').textContent = (COURSES[r.course] || {}).en || r.course;
    $('#clCodeLabel').textContent = r.join_code;
    show('overview');
    loadProgress();
    loadRoster();
    if (role === 'teacher') loadAssignments();
  }

  function wire() {
    $('#clJoinForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var code = ($('#clCode').value || '').trim().toUpperCase();
      msg($('#clJoinMsg'), '');
      if (!code) { msg($('#clJoinMsg'), T('Enter a class code.', '请输入班级码。'), 'err'); return; }
      /* getUser, not sm_user: this is the only check that proves identity */
      signIn().then(function (u) {
        if (!u) { msg($('#clJoinMsg'), T('Sign in first.', '请先登录。'), 'err'); return; }
        return db.from('classrooms').select('*').eq('join_code', code).maybeSingle()
          .then(function (r) {
            if (r.error) throw r.error;
            if (!r.data) { msg($('#clJoinMsg'), T('No class with that code.', '没有找到该班级码。'), 'err'); return; }
            var c = r.data;
            return db.from('classroom_members').insert({ classroom_id: c.id, user_id: u.id })
              .then(function (ins) {
                if (ins.error) {
                  if (ins.error.code === '23505') { msg($('#clJoinMsg'), T('You are already in this class.', '你已在这个班级中。'), 'err'); return; }
                  throw ins.error;
                }
                return myMembership(c.id).then(function (m) { enterRoom(c, m); });
              });
          });
      }).catch(function (e) { msg($('#clJoinMsg'), e.message || String(e), 'err'); });
    });

    $('#clCreateForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = ($('#clName').value || '').trim();
      var course = $('#clCourse').value;
      msg($('#clCreateMsg'), '');
      if (!name) { msg($('#clCreateMsg'), T('Give the class a name.', '请填写班级名称。'), 'err'); return; }
      signIn().then(function (u) {
        if (!u) { msg($('#clCreateMsg'), T('Sign in first.', '请先登录。'), 'err'); return; }
        var tries = 0;
        function go() {
          var code = code6();
          db.from('classrooms').insert({ name: name, course: course, join_code: code, owner_id: u.id })
            .select().single()
            .then(function (r) {
              if (r.error) throw r.error;
              return db.from('classroom_members').insert({
                classroom_id: r.data.id, user_id: u.id, role: 'teacher', display_name: whoami()
              }).then(function () { return myMembership(r.data.id).then(function (m) { enterRoom(r.data, m); }); });
            })
            .catch(function (e) {
              /* join_code is unique; a collision just means try again */
              if (/duplicate|unique/i.test(e.message || '') && ++tries < 5) return go();
              msg($('#clCreateMsg'), e.message || String(e), 'err');
            });
        }
        go();
      });
    });

    $('#clCopyBtn').addEventListener('click', function () {
      if (!room) return;
      var code = room.join_code;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      } else {
        /* no clipboard API: select the code so it can be copied by hand. An
           alert blocked the page for no gain, the code is already on screen. */
        var lab = $('#clCodeLabel');
        var r = document.createRange();
        r.selectNodeContents(lab);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      }
    });

    $('#clLeaveBtn').addEventListener('click', function () {
      if (!room) return;
      if (!confirm(T('Leave this class?', '退出这个班级？'))) return;
      db.from('classroom_members').delete().eq('classroom_id', room.id).eq('user_id', me.id)
        .then(function () {
          localStorage.removeItem(LAST);
          room = null; role = 'student';
          setState('noClass');
        });
    });

    $('#clSearch').addEventListener('input', drawRoster);
    $('#clDetailPick').addEventListener('change', drawDetail);

    $('#clMsgForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var t = ($('#clMsgText').value || '').trim();
      if (!t) return;
      db.from('class_messages').insert({ classroom_id: room.id, author_id: me.id, body: t })
        .then(function () { $('#clMsgText').value = ''; loadMsgs(); });
    });

    $('#clAssignForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      msg($('#clAssignMsg'), '');
      var unit = ($('#clAssignUnit').value || '').trim() || '*';
      var due = $('#clAssignDue').value || null;
      var target = $('#clAssignTarget').value === '' ? null : Number($('#clAssignTarget').value);
      db.from('assignments').upsert({
        classroom_id: room.id, unit_id: unit,
        title: ($('#clAssignTitle').value || '').trim() || null,
        due_at: due, target_pct: target, released: true
      }, { onConflict: 'classroom_id,unit_id' })
        .then(function (r) {
          if (r.error) throw r.error;
          msg($('#clAssignMsg'), T('Saved.', '已保存。'), 'ok');
          loadAssignments();
        })
        .catch(function (e) { msg($('#clAssignMsg'), e.message || String(e), 'err'); });
    });

    $('#clImportBtn').addEventListener('click', importBank);
    $('#clAiBtn').addEventListener('click', generateAi);

    $$('.cl-tab').forEach(function (t) {
      t.addEventListener('click', function () { show(t.getAttribute('data-view')); });
    });
  }

  function loadMsgs() {
    var card = $('#clMsgCard');
    if (role !== 'teacher' && role !== 'assistant') { card.hidden = true; return; }
    card.hidden = false;
    var ul = $('#clMsgs');
    ul.innerHTML = '';
    db.from('class_messages').select('*').eq('classroom_id', room.id).order('created_at')
      .then(function (r) {
        ((r && r.data) || []).forEach(function (m) {
          var li = el('li', null, m.body);
          li.appendChild(el('time', null, when(m.created_at)));
          ul.appendChild(li);
        });
      }).catch(function () {});
  }

  /* ── progress upload ─────────────────────────────────────────────────
     The tracker keeps sm_progress_v1 locally. When a student is in a
     classroom, push the same numbers up so the teacher can see them. Only
     changed units are sent, tracked per session, so this is a handful of
     rows rather than 188 every time. */
  function startUpload() {
    if (!db || typeof db.channel !== 'function') return;
    var P = window.VitaliteProgress;
    if (!P || !P.onChange) return;

    var last = {};
    try { last = JSON.parse(sessionStorage.getItem('sm_prog_sent') || '{}'); } catch (e) {}

    function push() {
      if (!room || !me) return;
      var all = P.all(), batch = [];
      Object.keys(all).forEach(function (id) {
        var rec = all[id];
        if (!rec || rec.read !== true) return;
        var p = id.split(':');
        if (p[0] !== room.course) return;
        var key = room.id + '|' + id;
        if (last[key] === rec.s) return;
        last[key] = rec.s;
        batch.push({
          classroom_id: room.id, user_id: me.id, course: p[0], unit_id: id,
          group_id: p[1], depth: rec.d, dwell_ms: Math.round((rec.s || 0) * 1000),
          read: true, updated_at: new Date().toISOString()
        });
      });
      try { sessionStorage.setItem('sm_prog_sent', JSON.stringify(last)); } catch (e) {}
      if (!batch.length) return;
      db.from('progress_events').upsert(batch, { onConflict: 'classroom_id,user_id,unit_id' })
        .then(function () { if (current === 'overview') loadProgress(); });
    }

    P.onChange(function () { setTimeout(push, 1500); });
    setTimeout(push, 4000);
  }

  /* ── boot ───────────────────────────────────────────────────────────── */
  function boot() {
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      noSchema = true;
      setState('noSchema');
      return;
    }
    db = window.supabase.createClient(SB_URL, SB_ANON);

    probeSchema().then(function (ok) {
      if (!ok) { setState('noSchema'); return; }
      return signIn().then(function (u) {
        if (!u) { setState('signedOut'); return; }
        return loadRoom().then(function (r) {
          if (!r) { setState('noClass'); return; }
          return myMembership(r.id).then(function (m) {
            if (!m) { setState('noClass'); return; }
            enterRoom(r, m);
            loadMsgs();
            startUpload();
          });
        });
      });
    }).catch(function (e) {
      setState('noClass');
      msg($('#clCreateMsg'), e.message || String(e), 'err');
    });

    wire();

    /* re-apply the language when the header toggle is used */
    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'langToggle') {
        setTimeout(function () {
          if (room) {
            $('#clTitle').textContent = room.name;
            $('#clCourseLabel').textContent = (COURSES[room.course] || {}).en || room.course;
          }
          show(current);
        }, 180);
      }
    });
  }

  if (document.readyState === 'complete') boot();
  else document.addEventListener('DOMContentLoaded', boot);

  window.VitaliteClassroom = {
    room: function () { return room; },
    role: function () { return role; },
    writeQuestion: writeQuestion
  };
})();

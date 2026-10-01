/* ═══════════════════════════════════════════════════════════════════════════
   VITALITE ANALYTICS  ·  cross-course progress, one place
   ---------------------------------------------------------------------------
   The site tracks three courses plus the exam mocks, but each one kept its
   numbers to itself: the textbook in kn_* / sm_mastery, IB in sm_ibsehs_*,
   G10 in sm_g10_*, and the mock exams in sm_mock_runs. Nothing read across
   them, so the dashboard could only ever show a sum, never a shape.

   This module reads all of them and returns one consistent summary. It writes
   nothing: it is a pure reader, so it can never corrupt or migrate anyone's
   existing progress, and deleting the key loses nothing but the dashboard.

   It is defensive on purpose. Every source is optional and independently
   try/caught, because a learner may have used exactly one course, may be on a
   plan that predates a key, or may be browsing with localStorage disabled.

   window.VitaliteAnalytics.all()  -> the whole picture
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  function J(k, d) {
    try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; }
    catch (e) { return d; }
  }
  function I(k) { var n = parseInt(localStorage.getItem(k) || '', 10); return isNaN(n) ? 0 : n; }
  function tryFn(f, d) { try { return f(); } catch (e) { return d; } }

  /* ── reading progress, from the shared tracker ─────────────────────── */
  function progress() {
    var P = window.VitaliteProgress;
    if (!P) return { ok: false };
    var out = { ok: true, total: 0, read: 0, byCourse: {} };
    ['vt', 'ib', 'g10'].forEach(function (c) {
      var s = tryFn(function () { return P.summary(c); }, null);
      if (!s) return;
      out.byCourse[c] = { read: s.read || 0, total: s.total || 0, pct: s.pct || 0 };
      out.total += s.total || 0;
      out.read += s.read || 0;
    });
    out.pct = out.total ? Math.round(out.read / out.total * 100) : 0;

    /* per-chapter / per-theme breakdown so a weak area can be named */
    out.groups = { vt: [], ib: [], g10: [] };
    ['vt', 'ib', 'g10'].forEach(function (c) {
      var list = tryFn(function () { return P.groups(c); }, []) || [];
      /* P.groups() already returns {id, read, total, pct} per group — there is
         no groupSummary() on the tracker, so do not invent one. */
      list.forEach(function (g) {
        out.groups[c].push({
          id: g.id, read: g.read || 0, total: g.total || 0, pct: g.pct || 0
        });
      });
    });
    return out;
  }

  /* ── the timed mocks ───────────────────────────────────────────────
     sm_mock_runs holds one record per completed attempt, each already
     carrying per-system accuracy, so the analysis here is arithmetic on
     numbers the mock engine computed rather than a second scoring pass. */
  function mocks() {
    var runs = J('sm_mock_runs', []);
    if (!Array.isArray(runs)) runs = [];
    var LABEL = {
      npte: ['NPTE', 'NPTE'],
      cncert: ['运动康复师资格证', '运动康复师资格证'],
      ibsehs: ['IB SEHS Paper 1A', 'IB SEHS Paper 1A']
    };
    var out = { total: runs.length, exams: [], best: null, trend: [], weak: [] };
    runs.forEach(function (r) {
      if (!r || !r.exam) return;
      var pct = r.scoredN ? Math.round(r.raw / r.scoredN * 100) : 0;
      var e = out.exams.filter(function (x) { return x.id === r.exam; })[0];
      if (!e) {
        e = {
          id: r.exam,
          name: (LABEL[r.exam] || [r.exam, r.exam])[0],
          nameZh: (LABEL[r.exam] || [r.exam, r.exam])[1],
          attempts: 0, bestPct: 0, bestScaled: null, lastPct: 0, pass: r.pass,
          scaledScale: r.scaled != null, perSys: {}, pace: 0, lastAt: 0
        };
        out.exams.push(e);
      }
      e.attempts++;
      if (pct > e.bestPct) { e.bestPct = pct; e.bestScaled = r.scaled; }
      e.lastPct = pct;
      e.lastAt = Math.max(e.lastAt, r.ended || 0);
      e.pace = e.pace ? Math.round((e.pace + Math.round((r.durSec || 0) / Math.max(1, r.given || 1))) / 2)
                      : Math.round((r.durSec || 0) / Math.max(1, r.given || 1));
      Object.keys(r.perSys || {}).forEach(function (s) {
        var v = r.perSys[s];
        e.perSys[s] = e.perSys[s] || { n: 0, ok: 0 };
        e.perSys[s].n += v.n; e.perSys[s].ok += v.ok;
      });
      out.trend.push({ exam: r.exam, at: r.ended || 0, pct: pct, scaled: r.scaled });
    });

    /* weakest content area across every mock ever sat, most-missed first */
    var agg = {};
    runs.forEach(function (r) {
      Object.keys(r.perSys || {}).forEach(function (s) {
        var v = r.perSys[s];
        agg[s] = agg[s] || { n: 0, ok: 0, exams: {} };
        agg[s].n += v.n; agg[s].ok += v.ok; agg[s].exams[r.exam] = 1;
      });
    });
    out.weak = Object.keys(agg).map(function (s) {
      var a = agg[s];
      return { sys: s, n: a.n, ok: a.ok, pct: Math.round(a.ok / a.n * 100), exams: Object.keys(a.exams).length };
    }).filter(function (x) { return x.n >= 3; })
      .sort(function (a, b) { return a.pct - b.pct || b.n - a.n; });

    out.trend.sort(function (a, b) { return a.at - b.at; });

    /* The trend must NOT be read first-to-last across different papers: an
       NPTE mock and an IB mock are different lengths and different pass marks,
       so "83% then 76%" across two exams means nothing. Improvement is only
       measured within one exam, first attempt to latest. */
    out.delta = null;
    var per = {};
    out.trend.forEach(function (r) {
      per[r.exam] = per[r.exam] || [];
      per[r.exam].push(r);
    });
    var best = null;
    Object.keys(per).forEach(function (k) {
      var v = per[k];
      if (v.length < 2) return;
      var d = v[v.length - 1].pct - v[0].pct;
      if (!best || v.length > best.n) best = { exam: k, delta: d, n: v.length };
    });
    if (best) { out.delta = best.delta; out.deltaExam = best.exam; }
    out.perExamTrend = per;
    out.best = out.exams.length ? out.exams.reduce(function (m, e) {
      return (!m || e.bestPct > m.bestPct) ? e : m;
    }, null) : null;
    return out;
  }

  /* ── an attempt sitting in progress right now ───────────────────────── */
  function liveMock() {
    var r = J('sm_mock_run', null);
    if (!r || !r.exam || !r.startMs) return null;
    var done = Object.keys(r.ans || {}).length;
    return { exam: r.exam, done: done, at: r.startMs };
  }

  /* ── quizzes and flashcards ───────────────────────────────────────── */
  function study() {
    var m = J('sm_mastery', {}), sum = 0, n = 0, asked = 0;
    Object.keys(m).forEach(function (k) {
      if (m[k] && typeof m[k].score === 'number') { sum += m[k].score; n++; asked += (m[k].totalQ || 0); }
    });
    var ibm = J('sm_ibsehs_mastery', {}), ibn = 0, ibsum = 0, ibcov = 0;
    Object.keys(ibm).forEach(function (k) {
      var v = ibm[k];
      if (v && typeof v.score === 'number') { ibsum += v.score; ibn++; }
      if (v && (v.covered || v.done)) ibcov++;
    });
    var ibq = J('sm_ibsehs_quizProgress', {}), ibatt = 0;
    Object.keys(ibq).forEach(function (k) { var v = ibq[k]; if (typeof v === 'number') ibatt += v; else if (v && v.asked) ibatt += v.asked; });
    var g10q = J('sm_g10_quiz', []), g10ok = 0;
    if (Array.isArray(g10q)) g10q.forEach(function (x) { if (x && x.ok) g10ok++; });

    var fc = J('kn_fc', {}), known = 0;
    Object.keys(fc).forEach(function (k) { known += ((fc[k] || []).length); });
    var ibf = J('sm_ibsehs_flashcards', {}), ibrev = 0;
    Object.keys(ibf).forEach(function (k) { var v = ibf[k]; if (typeof v === 'number') ibrev += v; else if (v && v.rev) ibrev += v.rev; });

    return {
      mastery: n ? Math.round(sum / n) : null,
      masteryN: n,
      ibMastery: ibn ? Math.round(ibsum / ibn) : null,
      ibCovered: ibcov,
      asked: asked + ibatt + (Array.isArray(g10q) ? g10q.length : 0),
      g10Mastery: (Array.isArray(g10q) && g10q.length) ? Math.round(g10ok / g10q.length * 100) : null,
      cards: known + I('sm_fc') + ibrev,
      npteBest: I('sm_exam'),
      g10Best: I('sm_g10_best')
    };
  }

  /* ── streak ─────────────────────────────────────────────────────────── */
  function streak() {
    var days = J('kn_days', []);
    if (!Array.isArray(days) || !days.length) return { current: 0, days: 0 };
    var set = {};
    days.forEach(function (d) { set[d] = 1; });
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var cur = 0, d = new Date(today);
    for (var i = 0; i < 400; i++) {
      if (set[d.getTime()]) { cur++; d.setDate(d.getDate() - 1); }
      else if (i === 0) { d.setDate(d.getDate() - 1); }   /* today not logged yet */
      else break;
    }
    return { current: cur, days: days.length };
  }

  function all() {
    return tryFn(function () {
      return {
        progress: progress(),
        study: study(),
        mocks: mocks(),
        streak: streak(),
        live: liveMock()
      };
    }, null);
  }

  window.VitaliteAnalytics = { all: all, mocks: mocks, progress: progress, study: study, streak: streak };
})();
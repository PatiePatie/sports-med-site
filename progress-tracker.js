/* Vitalité — reading-progress tracker
   ------------------------------------------------------------------
   Replaces "a section is read if you clicked its header", which is why a
   heavy reader could sit at 0%. A unit now counts as read when BOTH:

     depth  — you have scrolled at least 85% of the way through it
     dwell  — you have spent at least 20s with it filling most of the screen

   Both are needed: idling on an open tab fails the depth test, flick-scrolling
   to the bottom in two seconds fails the dwell test.

   188 units across the three tracked courses:
     vt   guide.html          14 chapters x sections      -> vt:<ch>:<i>
     ib   ib-sehs-learn.html  29 topics x native-sections  -> ib:<code>:<i>
     g10  g10-bio.html         5 lessons x sections       -> g10:<sec>:<i>

   Read API (used by home.html, the IB badges, and the classroom later):
     VitaliteProgress.summary('ib')            -> {read,total,pct}
     VitaliteProgress.groups('ib')              -> [{id,read,total,pct}]
     VitaliteProgress.unit('ib:A.1.1:0')       -> {d,s,read}
     VitaliteProgress.onChange(fn)             -> fn(store) whenever it changes

   Storage is one localStorage key, sm_progress_v1:
     { "ib:A.1.1:0": { "d": 0.93, "s": 74 }, ... }
   Deliberately its own namespace: the old kn_read / ib_read_sections /
   sm_g10_* keys are all click- or quiz-derived and are left untouched. */
(function () {
  'use strict';

  var KEY = 'sm_progress_v1';
  var MIN_DEPTH = 0.85;   /* fraction of the unit you must have scrolled past  */
  var MIN_DWELL = 20;     /* seconds it must have held the screen               */
  var DWELL_TICK = 1000;  /* how often dwell is credited                        */
  var SAVE_DEBOUNCE = 4000;
  var VISIBLE_SHARE = 0.3;/* a unit counts as "on screen" at >=30% of the viewport */

  var COURSE_OF_FILE = {
    'guide.html': 'vt',
    'ib-sehs-learn.html': 'ib',
    'g10-bio.html': 'g10'
  };
  var GROUPS_OF_COURSE = { vt: 14, ib: 29, g10: 5 };

  /* What each course actually contains, read off the real pages: 188 units in all.
     Baking it in matters because a group with nothing recorded yet is simply
     ABSENT from the store, so a percentage computed over stored groups alone
     silently skips it — a theme with 3 untouched topics out of 11 would average
     only the 8 that have data and read far too high. With the denominators fixed
     here every number is honest from the very first visit. */
var LAYOUT = {
    vt: { 'total': 90, groups: { 'ch1':7,'ch2':12,'ch3':12,'ch4':10,'ch5':5,'ch6':4,'ch7':3,'ch8':3,'ch9':3,'ch10':11,'ch11':3,'ch12':6,'ch13':5,'ch14':6 } },
    ib: { 'total': 83, groups: { 'A.1.1':2,'A.1.2':2,'A.1.3':2,'A.2.1':3,'A.2.2':3,'A.2.3':3,'A.3.1':3,'A.3.2':3,'A.3.3':3,'B.1.1':3,'B.1.2':3,'B.1.3':3,'B.1.4':2,'B.2.1':3,'B.2.2':3,'B.2.3':3,'B.3.1':3,'B.3.2':3,'C.1.1':3,'C.1.2':3,'C.2.1':3,'C.2.2':3,'C.3.1':3,'C.3.2':3,'C.3.3':3,'C.4.1':3,'C.4.2':3,'C.5.1':3,'C.5.2':3 } },
    g10: { 'total': 15, groups: { 's1':3,'s2':2,'s3':3,'s4':4,'s5':3 } }
  };

  var store = load();
  var units = [];
  var listeners = [];
  var dirty = false;
  var saveTimer = 0;
  var dwellTimer = 0;
  var lastTick = 0;
  var scanned = '';

  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' ? v : {}; }
    catch (e) { return {}; }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }
  function file() {
    var f = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!f || f.indexOf('.') === -1) f = 'index.html';
    return f;
  }
  function isRead(rec) { return !!(rec && rec.d >= MIN_DEPTH && rec.s >= MIN_DWELL); }
  function unit(id) { return store[id] || null; }
  function entry(id) {
    var r = store[id];
    if (!r) r = store[id] = { d: 0, s: 0 };
    return r;
  }

  /* ------------------------------------------------------------ discovery */
  /* Units are found from the DOM the course already rendered, so there is no
     second registry to keep in step with the content. A unit inside a collapsed
     accordion measures zero height, which is correct: it cannot be read shut. */
  function scan() {
    var course = COURSE_OF_FILE[file()];
    units = [];
    if (!course) return;
    var i, j;

    if (course === 'vt') {
      for (i = 1; i <= GROUPS_OF_COURSE.vt; i++) {
        var ch = document.getElementById('ch' + i);
        if (!ch) continue;
        var its = ch.querySelectorAll('.acc-item');
        for (j = 0; j < its.length; j++) push(course, 'ch' + i, j, its[j]);
      }
    } else if (course === 'g10') {
      for (i = 1; i <= GROUPS_OF_COURSE.g10; i++) {
        var sec = document.getElementById('s' + i);
        if (!sec) continue;
        var gs = sec.querySelectorAll('.acc-item');
        for (j = 0; j < gs.length; j++) push(course, 's' + i, j, gs[j]);
      }
    } else {
      var items = document.querySelectorAll('.acc-item[id^="ib-topic-"]');
      for (i = 0; i < items.length; i++) {
        var code = items[i].getAttribute('data-topic');
        if (!code) continue;
        var blocks = items[i].querySelectorAll('.native-section');
        for (j = 0; j < blocks.length; j++) push(course, code, j, blocks[j]);
      }
    }
    scanned = course;
  }

  function push(course, group, index, host) {
    var body = host.querySelector('.acc-body-inner') || host.querySelector('.acc-body') || host;
    units.push({
      id: course + ':' + group + ':' + index,
      course: course, group: String(group), index: index,
      el: body, host: host
    });
  }

  /* ---------------------------------------------------------- measurement */
  function measure() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var mid = vh / 2;
    var best = null, bestSeen = 0, bestGap = 1e9, i, r, vis, rec, wasRead, gap;

    for (i = 0; i < units.length; i++) {
      var u = units[i];
      r = u.el.getBoundingClientRect();
      if (!r.height) continue;                       /* collapsed or hidden */

      /* deepest point reached: 0 when the unit is only just entering from the
         bottom, 1 once its last line has been scrolled past */
      var depth = (vh - r.top) / r.height;
      if (depth <= 0) continue;
      if (depth > 1) depth = 1;

      vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (vis < 0) vis = 0;

      rec = entry(u.id);
      wasRead = isRead(rec);
      if (depth > rec.d) { rec.d = Math.round(depth * 1000) / 1000; dirty = true; }
      if (!wasRead && isRead(rec)) { dirty = true; fire(); }
      else if (depth > rec.d - 0.0005) { /* rounded up */ }

      if (vis > 0) {
        gap = Math.abs((r.top + r.bottom) / 2 - mid);
        if (vis > bestSeen || (vis === bestSeen && gap < bestGap)) {
          bestSeen = vis; bestGap = gap; best = u;
        }
      }
    }
    return { vh: vh, focus: best, focusSeen: bestSeen };
  }

  function tick() {
    var now = Date.now();
    var delta = lastTick ? Math.min(2, (now - lastTick) / 1000) : 0;
    lastTick = now;
    if (document.hidden || !delta) return;

    var m = measure();
    if (!m.focus || m.focusSeen < m.vh * VISIBLE_SHARE) return;
    var rec = entry(m.focus.id);
    rec.s = Math.round(rec.s + delta);
    dirty = true;
    if (isRead(rec)) fire();
    schedule();
  }

  function onScroll() {
    if (!units.length) return;
    if (measure() && dirty) schedule();
  }

  function schedule() {
    dirty = true;
    if (saveTimer) return;
    saveTimer = setTimeout(flush, SAVE_DEBOUNCE);
  }
  function flush() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = 0; }
    if (!dirty) return;
    dirty = false;
    persist();
    fire();
  }
  function fire() { for (var i = 0; i < listeners.length; i++) { try { listeners[i](store); } catch (e) {} } }

  /* content height changes as accordions open, and a chapter switch swaps the
     whole DOM — so rescan when the URL changes or a new accordion appears */
  function candidates() {
    var course = COURSE_OF_FILE[file()];
    if (!course) return 0;
    if (course === 'ib') return document.querySelectorAll('.acc-item[id^="ib-topic-"]').length;
    return document.querySelectorAll('.acc-item').length;
  }

  /* Re-scan whenever the candidate count moves, not only when the course
     changes — otherwise one early scan that found nothing is permanent. */
  var lastCount = -1;
  function rescan() {
    if (!COURSE_OF_FILE[file()]) return;
    var n = candidates();
    if (n !== lastCount || !units.length) { lastCount = n; units = []; scan(); }
  }

  function boot() {
    if (!COURSE_OF_FILE[file()]) return;   /* only the three content pages track */
    scan();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); schedule(); }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { lastTick = Date.now(); measure(); }
    });
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    dwellTimer = setInterval(tick, DWELL_TICK);
    lastTick = Date.now();
    setInterval(rescan, 2000);
    measure();
  }

  /* ------------------------------------------------------------------ API */
  function groups(course) {
    var lay = LAYOUT[course], out = [], read = {}, id, parts, g, tot, r, na, nb;
    if (!lay) return [];
    for (id in store) {
      if (!Object.prototype.hasOwnProperty.call(store, id)) continue;
      parts = id.split(':');
      if (parts[0] !== course) continue;
      if (isRead(store[id])) read[parts[1]] = (read[parts[1]] || 0) + 1;
    }
    for (g in lay.groups) {
      if (!Object.prototype.hasOwnProperty.call(lay.groups, g)) continue;
      tot = lay.groups[g]; r = read[g] || 0;
      out.push({ id: g, read: r, total: tot, pct: tot ? Math.round(r / tot * 100) : 0 });
    }
    /* ch1..ch14 and s1..s5 must stay in order, so sort on the trailing number
       instead of as strings (s10 would otherwise sort before s2) */
    out.sort(function (a, b) {
      na = parseInt(String(a.id).replace(/\D+/g, ''), 10);
      nb = parseInt(String(b.id).replace(/\D+/g, ''), 10);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
      return a.id < b.id ? -1 : 1;
    });
    return out;
  }

  function summary(course) {
    var lay = LAYOUT[course], read = 0, total = 0, id, parts;
    for (id in store) {
      if (!Object.prototype.hasOwnProperty.call(store, id)) continue;
      parts = id.split(':');
      if (parts[0] !== course) continue;
      if (isRead(store[id])) read++;
    }
    total = lay ? lay.total : 0;
    return { read: read, total: total, pct: total ? Math.round(read / total * 100) : 0 };
  }

  window.VitaliteProgress = {
    MIN_DEPTH: MIN_DEPTH, MIN_DWELL: MIN_DWELL, KEY: KEY,
    isRead: isRead, unit: unit, summary: summary, groups: groups,
    all: function () { return store; },
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    flush: flush,
    count: function () { return units.length; },
    /* the units this page actually contains, e.g. ['ib:A.1.1:0', ...] */
    ids: function () { return units.map(function (u) { return u.id; }); },
    /* for tests and for pages that need to force a re-read */
    rescan: function () { units = []; scan(); measure(); }
  };

  /* A defer script in <head> runs BEFORE the page's bottom-of-body defer
     scripts, and on the IB page those build all 29 accordions. Scanning here
     found 0 of 83 units. Wait for DOMContentLoaded, which fires after every
     defer script has run, and keep a macrotask fallback in case it already has. */
  var started = false;
  function once() { if (started) return; started = true; boot(); }
  if (document.readyState === 'complete') once();
  else {
    document.addEventListener('DOMContentLoaded', once);
    setTimeout(once, 0);
  }
})();

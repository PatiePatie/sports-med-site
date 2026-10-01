/* Paywall / entitlement layer.
   The module comment ends here so the code below is real JavaScript. */
(function () {
  'use strict';

  var K = 'sm_entitlement';

  /* ── plans ────────────────────────────────────────────────────────
     Deliberately small. A visitor has to understand the choice in one
     glance, and every plan here maps to something the site already has. */
  var PLANS = {
    free: {
      id: 'free', name: ['Free', '免费'], price: ['¥0', '¥0'],
      blurb: ['Everything that teaches, forever.', '所有教学内容永久免费。'],
      includes: [
        ['Every course, every section — Vitalité Textbook, IB SEHS, G10, USABO', '全部课程与小节永久免费'],
        ['Flashcards, quizzes and key terms', '闪卡、测验与核心术语'],
        ['Timed mock exams with full analysis', '限时模拟考试与完整分析'],
        ['Your own progress, stored on this device', '学习进度记录（保存在本设备）']
      ]
    },
    plus: {
      id: 'plus', name: ['Plus', 'Plus 会员'], price: ['¥25/mo', '¥25/月'],
      blurb: ['For when you want it to sync and to ask questions.', '适合需要同步进度与 AI 答疑的用户。'],
      includes: [
        ['Everything free, plus:', '包含免费版全部功能，另加：'],
        ['Progress synced across devices', '多设备进度同步'],
        ['AI tutor, higher daily quota', 'AI 导师，额度更高'],
        ['Downloadable study packs (PDF)', '可下载学习包（PDF）'],
        ['Mistake review across every mock', '所有模拟考试的错题复盘']
      ]
    },
    teacher: {
      id: 'teacher', name: ['Classroom', '教师版'], price: ['¥68/mo', '¥68/月'],
      blurb: ['For a teacher with one class or a school.', '适合带一个班或一所学校的教师。'],
      includes: [
        ['Everything in Plus, plus:', '包含 Plus 全部功能，另加：'],
        ['Create classes and share a join code', '创建班级并分享班级码'],
        ['See each student’s scroll depth and dwell time', '查看每位学生的阅读深度与停留时间'],
        ['Per-area results for the whole class', '全班分领域成绩分析'],
        ['Live quiz sessions (Kahoot style)', '实时答题课堂']
      ]
    }
  };

  /* ── reading an entitlement ──────────────────────────────────────── */
  function user() {
    try {
      var u = JSON.parse(localStorage.getItem('sm_user') || 'null');
      return (u && u.email) ? u : null;
    } catch (e) { return null; }
  }

  function fromStore() {
    try {
      var e = JSON.parse(localStorage.getItem(K) || 'null');
      if (!e || typeof e !== 'object') return null;
      var plan = PLANS[e.plan] ? e.plan : null;
      if (!plan) return null;
      /* An expiry in the past means the entitlement has lapsed. Only treat
         `until` as authoritative when it is actually a parseable timestamp. */
      var until = 0;
      if (e.until != null) {
        var t = typeof e.until === 'number' ? e.until : Date.parse(e.until);
        if (!isNaN(t)) until = t;
      }
      if (until && until < Date.now()) return null;
      return { plan: plan, until: until || 0, seats: e.seats || 0, src: 'store' };
    } catch (e) { return null; }
  }

  function override() {
    try {
      var o = window.VitaliteEntitlement;
      if (o && typeof o.plan === 'string' && PLANS[o.plan]) {
        return { plan: o.plan, until: 0, seats: o.seats || 0, src: 'override' };
      }
    } catch (e) {}
    return null;
  }

  function state() {
    var u = user();
    var e = override() || fromStore();
    var plan = e ? e.plan : 'free';
    return {
      signedIn: !!u,
      email: u ? (u.email || '') : '',
      plan: plan,
      isPaid: plan !== 'free',
      isTeacher: plan === 'teacher',
      until: e ? e.until : 0,
      src: e ? e.src : 'free'
    };
  }

  /* ── feature table ─────────────────────────────────────────────────
     `login` = free but needs an account. `paid` = needs a paid plan.
     A feature with neither is always open and must never be gated. */
  var FEATURES = {
    reading:      { need: null },
    flashcards:   { need: null },
    quiz:         { need: null },
    mocks:        { need: null },
    analytics:    { need: null },
    progress_sync:{ need: 'paid', plan: 'plus' },
    ai_quota:     { need: 'paid', plan: 'plus' },
    study_pack:   { need: 'paid', plan: 'plus' },
    classroom:    { need: 'paid', plan: 'teacher' }
  };

  function allowed(feature) {
    var f = FEATURES[feature];
    if (!f || !f.need) return true;
    var s = state();
    if (!f.need) return true;
    if (f.need === 'login') return s.signedIn;
    if (f.need === 'paid') {
      if (!s.isPaid) return false;
      /* a paid plan that does not include this feature is refused rather than
         silently allowed */
      if (f.plan && f.plan !== 'plus' && s.plan !== f.plan) return false;
      return true;
    }
    return true;
  }

  /* ── the gate UI ──────────────────────────────────────────────────
     It states what is missing and offers the next step. It never traps the
     user on a page: dismissal removes the overlay and leaves the page usable
     in its read-only state. */
  function gate(feature) {
    var f = FEATURES[feature] || {};
    var s = state();
    var needLogin = f.need === 'login' || (!s.signedIn && f.need === 'paid');
    var title = needLogin
      ? T('Sign in to use this', '登录后使用')
      : T('This is part of Plus', '此功能属于 Plus 会员');
    var body = needLogin
      ? T(
        'It is free. An account is only needed so your progress is saved to you rather than to this browser.',
        '此功能免费。只需一个账号，学习进度才能保存到你名下，而不是留在这个浏览器里。')
      : T(
        'Everything that teaches stays free — this is one of the extras.',
        '所有教学内容始终免费，这只是额外功能之一。');

    var close = T('Not now', '暂不');
    var cta = needLogin
      ? T('Sign in', '登录')
      : T('See the plans', '查看会员方案');

    var veil = document.createElement('div');
    veil.className = 'vt-veil';
    var card = document.createElement('div');
    card.className = 'vt-gate';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');

    var h = document.createElement('h3'); h.textContent = title;
    var p = document.createElement('p'); p.className = 'vt-gate-p'; p.textContent = body;
    var row = document.createElement('div'); row.className = 'vt-gate-row';

    var b1 = document.createElement('a');
    b1.className = 'qo-btn'; b1.textContent = cta;
    b1.href = needLogin ? 'login.html' + (f.need === 'paid' ? '#plus' : '') : 'pricing.html';
    var b2 = document.createElement('button');
    b2.className = 'qo-btn next'; b2.type = 'button'; b2.textContent = close;

    row.appendChild(b1); row.appendChild(b2);
    card.appendChild(h); card.appendChild(p); card.appendChild(row);
    veil.appendChild(card);
    document.body.appendChild(veil);

    function dismiss() {
      if (veil.parentNode) veil.parentNode.removeChild(veil);
      document.documentElement.classList.remove('vt-locked');
    }
    b2.addEventListener('click', dismiss);
    veil.addEventListener('click', function (e) { if (e.target === veil) dismiss(); });
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') { dismiss(); document.removeEventListener('keydown', onEsc); }
    });
    document.documentElement.classList.add('vt-locked');
    setTimeout(function () { try { b2.focus(); } catch (e) {} }, 30);
  }

  function T(en, zh) {
    var lang = '';
    try { lang = localStorage.getItem('sm_lang') || ''; } catch (e) {}
    if (typeof window.showCN === 'boolean') return window.showCN ? zh : en;
    return lang === 'zh' ? zh : en;
  }

  /* ── public ────────────────────────────────────────────────────── */
  window.VitaliteAccess = {
    PLANS: PLANS,
    FEATURES: FEATURES,
    state: state,
    allowed: allowed,
    gate: gate,
    /* Convenience for call sites: returns true, or shows the gate. */
    require: function (feature) {
      if (allowed(feature)) return true;
      gate(feature);
      return false;
    },
    /* Development/testing switch. Real entitlement must come from the payment
       provider writing to sm_entitlement, not from this. */
    _setOverride: function (plan) {
      if (plan === null) { delete window.VitaliteEntitlement; return state(); }
      window.VitaliteEntitlement = { plan: plan };
      return state();
    },
    _setStore: function (obj) {
      try {
        if (!obj) { localStorage.removeItem(K); return state(); }
        localStorage.setItem(K, JSON.stringify(obj));
      } catch (e) {}
      return state();
    }
  };

  if (document.documentElement) document.documentElement.classList.add('vt-ready');
})();
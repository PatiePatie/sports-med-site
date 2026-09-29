/* IB SEHS interactive models — window.IB_MODELS keyed by NATIVE SECTION TITLE
   (the same keys as window.IB_VISUALS / window.IB_DEEP).
   Every model reuses the .kv-* kit in knowledge.css, which both IB pages
   already load, so a model is written in exactly the same visual language as
   the Vitalite textbook panel:
     question -> controls -> drawing -> proportion bar / legend with live
     numbers -> "looks like" callout -> bilingual note.
   Rules for every entry:
     · self-contained; the only helpers are the ones defined below
     · all prose goes through T(en, zh) — including the few short axis labels
       inside the SVG, because a model re-renders on every language change
     · live numbers are written into the DOM, never baked into the SVG
     · no timers and no animation loops: input and click only
     · every slider lives inside a <label> so it has an accessible name
     · colours come from theme variables, so dark mode is free
     · if a model throws, the layer puts the static figure back
   Append-only. Add new keys; never rewrite a shipped one. 43 of 83 sections
   now carry a model. */
(function () {
  'use strict';
  if (window.__ibModels) return; window.__ibModels = true;

  var MODE_KEY = 'sm_ibsehs_model_mode';
  var $$ = function (sel, ctx) { try { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); } catch (e) { return []; } };
  function zh() {
    var b = document.body;
    if (b && b.classList.contains('lang-zh')) return true;
    if (b && b.classList.contains('lang-en')) return false;
    try { return localStorage.getItem('sm_lang') === 'zh'; } catch (e) { return false; }
  }
  function T(en, z) { return zh() ? z : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  /* read the mode tolerantly: the widget writes JSON ("full") but a raw
     'full' must work too, and a corrupt value must fall back, never throw */
  function mode() {
    var raw = null;
    try { raw = localStorage.getItem(MODE_KEY); } catch (e) { }
    return (raw === 'full' || raw === '"full"') ? 'full' : 'concise';
  }
  function num(v, d) { return Number(v).toFixed(d == null ? 1 : d); }

  /* ── kit ────────────────────────────────────────────────────────────── */
  function range(min, max, val, step) {
    return '<input type="range" min="' + min + '" max="' + max + '" value="' + val + '" step="' + (step || 1) + '">';
  }
  function seg(opts, on) {
    return '<div class="kv-seg" role="group">' + opts.map(function (o) {
      return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (o[0] === on ? 'true' : 'false') + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }
  function wireSeg(host, fn) {
    host.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.kv-seg button');
      if (!b || !host.contains(b)) return;
      $$('button', b.parentElement).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      fn(b.getAttribute('data-v'), b);
    });
  }
  function note(en, z) { return '<p class="kv-note">' + esc(T(en, z)) + '</p>'; }
  /* a labelled slider: the label text is also the accessible name */
  function qrange(id, question, min, max, val, step) {
    return '<label class="kv-lab" data-v="' + id + '"><span class="ibm-q">' + esc(question) + ' <b class="kv-val"></b></span>' + range(min, max, val, step) + '</label>';
  }
  function srange(id, question, min, max, val, step, shown) {
    return '<label class="kv-lab" data-v="' + id + '"><span class="ibm-q">' + esc(question) + ' <b class="kv-v">' + esc(shown) + '</b></span>' + range(min, max, val, step) + '</label>';
  }
  function setv(root, id, sel, txt) { var n = root.querySelector('[data-v="' + id + '"] ' + sel); if (n) n.textContent = txt; }
  function outs(root, cls, txt) { var n = root.querySelector(cls); if (n) n.textContent = txt; }

  var MODELS = {};

  /* ══ 1 · A.2.3 Comparing the three systems ═══════════════════════════
     The duration of a maximal effort decides the mix of phosphagen,
     glycolytic and oxidative contribution. Gastin 2001. */
  MODELS['Comparing the three systems'] = function (host, mode) {
    var AER = [[6, 4], [10, 6], [15, 12], [20, 18], [30, 27], [45, 37], [60, 45], [75, 51], [90, 56], [120, 63], [180, 73], [240, 79], [600, 90], [1800, 97], [7200, 99]];
    var PCR = [[6, .55], [10, .5], [20, .38], [30, .3], [60, .2], [120, .12], [7200, .1]];
    function lerp(tab, t) {
      if (t <= tab[0][0]) return tab[0][1];
      for (var i = 1; i < tab.length; i++) if (t <= tab[i][0]) {
        var a = tab[i - 1], b = tab[i], k = (Math.log(t) - Math.log(a[0])) / (Math.log(b[0]) - Math.log(a[0]));
        return a[1] + (b[1] - a[1]) * k;
      }
      return tab[tab.length - 1][1];
    }
    function split(t) { var ox = lerp(AER, t), an = 100 - ox, pc = an * lerp(PCR, t); return [pc, an - pc, ox]; }
    function fmt(t) { return t < 60 ? Math.round(t) + ' s' : t < 3600 ? Math.round(t / 60) + ' min' : (t / 3600).toFixed(1) + ' h'; }
    function sport(t) {
      return t <= 10 ? T('a jump, a heavy single, the first 10 m of a sprint', '一次跳跃 · 大重量单次 · 冲刺前 10 米')
        : t <= 90 ? T('400 m · 100 m swim · one shift in hockey', '400 米 · 100 米游泳 · 冰球单次上场')
          : t <= 300 ? T('800–1500 m · 2 km rowing · a hard interval set', '800–1500 米 · 2 公里划船 · 一组高强度间歇')
            : T('5 km · a football match · a marathon', '5 公里 · 足球比赛 · 马拉松');
    }
    var L = Math.log(6), R = Math.log(7200), PX = 66, PW = 472, PY = 34, PH = 246;
    function X(t) { return PX + (Math.log(t) - L) / (R - L) * PW; }
    function Y(p) { return PY + PH - p / 100 * PH; }
    var N = 80, xs = [];
    for (var i = 0; i <= N; i++) xs.push(Math.exp(L + (R - L) * i / N));
    function area(k) {
      var top = [], bot = [];
      xs.forEach(function (t) {
        var s = split(t), lo = 0, j;
        for (j = 0; j < k; j++) lo += s[j];
        top.push(X(t).toFixed(1) + ',' + Y(lo + s[k]).toFixed(1));
        bot.push(X(t).toFixed(1) + ',' + Y(lo).toFixed(1));
      });
      return 'M' + top.join(' L') + ' L' + bot.reverse().join(' L') + 'Z';
    }
    var TICKS = mode === 'full'
      ? [[6, '6 s'], [15, '15 s'], [60, '1 min'], [300, '5 min'], [600, '10 min'], [1800, '30 min'], [7200, '2 h']]
      : [[6, '6 s'], [60, '1 min'], [600, '10 min'], [7200, '2 h']];
    var YPCT = mode === 'full' ? [0, 25, 50, 75, 100] : [0, 50, 100];
    host.innerHTML =
      qrange('dur', T('How long is the all-out effort?', '全力运动持续多久？'), 0, 1000, 350, 1) +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Share of each energy system across time', '各供能系统占比随时间的变化')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      YPCT.map(function (p) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(p) + '" x2="' + (PX + PW) + '" y2="' + Y(p) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(p) + 4) + '" text-anchor="end">' + p + '</text>';
      }).join('') +
      '<path class="kv-a2" d="' + area(2) + '"/><path class="kv-a1" d="' + area(1) + '"/><path class="kv-a0" d="' + area(0) + '"/>' +
      '<line class="kv-cursor" y1="' + (PY - 10) + '" y2="' + (PY + PH) + '"/>' +
      (mode === 'full' ? '<text class="val small" x="0" y="0"></text>' : '') +
      TICKS.map(function (t, k) {
        return '<text class="small" x="' + X(t[0]).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="' + (k === 0 ? 'start' : k === TICKS.length - 1 ? 'end' : 'middle') + '">' + t[1] + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('duration', '持续时间')) + '</text>' +
      '</svg>' +
      '<div class="kv-stack"><i class="kv-s0"></i><i class="kv-s1"></i><i class="kv-s2"></i></div>' +
      '<div class="kv-legend">' +
      '<span><i class="kv-dot kv-c0"></i>' + esc(T('ATP–PCr', '磷酸原')) + ' <b class="kv-p0"></b></span>' +
      '<span><i class="kv-dot kv-c1"></i>' + esc(T('Glycolytic', '糖酵解')) + ' <b class="kv-p1"></b></span>' +
      '<span><i class="kv-dot kv-c2"></i>' + esc(T('Oxidative', '有氧氧化')) + ' <b class="kv-p2"></b></span></div>' +
      '<div class="kv-callout"></div>' +
      note('Approximate shares of a maximal effort lasting that long (Gastin 2001). All three systems are always active — only the mix changes. Percentages are shares of energy contribution, not of ATP resynthesis.', '按该时长全力运动的近似占比（Gastin 2001）。三个系统始终同时工作，只是比例在变。百分比为供能占比，而非 ATP 再合成占比。');
    var inp = host.querySelector('input');
    function draw() {
      var t = Math.exp(L + (R - L) * inp.value / 1000), s = split(t), k;
      setv(host, 'dur', '.kv-val', fmt(t));
      var cx = X(t).toFixed(1);
      host.querySelector('.kv-cursor').setAttribute('x1', cx);
      host.querySelector('.kv-cursor').setAttribute('x2', cx);
      for (k = 0; k < 3; k++) {
        host.querySelector('.kv-s' + k).style.flexGrow = s[k].toFixed(1);
        outs(host, '.kv-p' + k, Math.round(s[k]) + '%');
      }
      if (mode === 'full') {
        var lab = host.querySelector('.kv-svg text.val'), right = +cx > PX + PW - 90;
        lab.setAttribute('x', right ? (+cx - 8).toFixed(0) : (+cx + 8).toFixed(0));
        lab.setAttribute('y', PY - 14);
        lab.setAttribute('text-anchor', right ? 'end' : 'start');
        lab.textContent = fmt(t);
      }
      outs(host, '.kv-callout', T('Looks like: ', '例如：') + sport(t));
    }
    inp.addEventListener('input', draw); draw();
  };

  /* ══ 2 · A.2.3 VO2max, economy, LIP and EPOC ══════════════════════════
     An event and three levers decide whether the effort is aerobically
     covered, and which lever is the limiting one. */
  MODELS['VO₂max, movement economy, LIP and EPOC'] = function (host, mode) {
    var EV = [
      { id: '400', en: '400 m', zh: '400 米', pace: .364, dur: 1.1 },
      { id: '800', en: '800 m', zh: '800 米', pace: .308, dur: 2.6 },
      { id: 'mile', en: '1 mile', zh: '1 英里', pace: .296, dur: 5.4 },
      { id: '5k', en: '5 km', zh: '5 公里', pace: .250, dur: 20 },
      { id: 'mara', en: 'Marathon', zh: '马拉松', pace: .185, dur: 180 }
    ];
    var ev = '5k';
    host.innerHTML =
      seg(EV.map(function (e) { return [e.id, T(e.en, e.zh)]; }), ev) +
      '<div class="kv-grid2">' +
      srange('vo2', T('Your VO₂max', '你的最大摄氧量'), 30, 85, 55, 1, '55 ml·kg⁻¹·min⁻¹') +
      srange('cost', T('Oxygen cost of the pace', '该配速的氧耗'), 170, 260, 200, 5, '200 ml·kg⁻¹·km⁻¹') +
      '</div>' +
      srange('lip', T('Lactate production rate (LIP)', '乳酸生成能力'), 3, 12, 6, .5, '6.0 L·min⁻¹') +
      '<div class="kv-meter"><span>' + esc(T('Required', '所需')) + '</span><div class="kv-bar"><i class="req red"></i></div><b class="vreq"></b></div>' +
      '<div class="kv-meter"><span>' + esc(T('Your ceiling', '你的上限')) + '</span><div class="kv-bar"><i class="ceil"></i></div><b class="vceil"></b></div>' +
      (mode === 'full' ? '<div class="kv-meter"><span>EPOC</span><div class="kv-bar"><i class="epoc amber"></i></div><b class="vepoc"></b></div>' : '') +
      '<div class="kv-callout"></div>' +
      note('Required VO₂ = oxygen cost × pace. The ceiling is VO₂max plus the anaerobic support an effort of that length can borrow (about 10 ml·kg⁻¹·min⁻¹ per 6 L·min⁻¹ of LIP, fading to zero past about 12 min). A simplified model for reasoning, not a laboratory measurement.', '所需摄氧量 = 氧耗 × 配速。上限 = 最大摄氧量 + 该时长可动用的无氧支持（每 6 L·min⁻¹ 乳酸生成能力约合 10 ml·kg⁻¹·min⁻¹，超过约 12 分钟后降为零）。这是用于推理的简化模型，而非实验室测量值。');
    var ins = $$('input[type=range]', host);
    function draw() {
      var e = EV.filter(function (x) { return x.id === ev; })[0];
      var vo2 = +ins[0].value, cost = +ins[1].value, lip = +ins[2].value;
      setv(host, 'vo2', '.kv-v', vo2 + ' ml·kg⁻¹·min⁻¹');
      setv(host, 'cost', '.kv-v', cost + ' ml·kg⁻¹·km⁻¹');
      setv(host, 'lip', '.kv-v', num(lip) + ' L·min⁻¹');
      var required = cost * e.pace;
      var support = Math.min(12, 10 * lip / 6) * clamp((12 - e.dur) / 12, 0, 1);
      var ceiling = vo2 + support;
      var scale = Math.max(90, Math.ceil((required + ceiling) / 10) * 10);
      var ci = host.querySelector('.ceil');
      host.querySelector('.req').style.transform = 'scaleX(' + (required / scale).toFixed(3) + ')';
      ci.style.transform = 'scaleX(' + (ceiling / scale).toFixed(3) + ')';
      ci.style.background = ceiling >= required ? 'var(--green)' : 'var(--amber)';
      outs(host, '.vreq', num(required) + ' ml·kg⁻¹·min⁻¹');
      outs(host, '.vceil', num(ceiling) + ' ml·kg⁻¹·min⁻¹');
      if (mode === 'full') {
        var epoc = .7 * lip;
        host.querySelector('.epoc').style.transform = 'scaleX(' + (epoc / 12).toFixed(3) + ')';
        outs(host, '.vepoc', num(epoc) + ' min');
      }
      var dVo2 = 1, dCost = e.pace - ceiling / cost, dLip = (10 / 6) * clamp((12 - e.dur) / 12, 0, 1);
      var best = Math.abs(dVo2) >= Math.abs(dCost) && Math.abs(dVo2) >= Math.abs(dLip) ? T('VO₂max', '最大摄氧量')
        : Math.abs(dCost) >= Math.abs(dLip) ? T('running economy', '跑步经济性') : T('LIP', '乳酸生成能力');
      var gap = ceiling - required;
      outs(host, '.kv-callout', gap >= 0
        ? T('You hold this effort with ', '你可以完成，余量 ') + num(gap) + ' ml·kg⁻¹·min⁻¹' + T('. Binding lever: ', '。限制因素：') + best + '.'
        : T('You fall short by ', '你还差 ') + num(-gap) + ' ml·kg⁻¹·min⁻¹' + T('. Binding lever: ', '。限制因素：') + best + '.');
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); });
    wireSeg(host, function (v) { ev = v; draw(); });
    draw();
  };

  /* ══ 3 · A.2.1 Imbalance and hydration monitoring ═════════════════════
     Sweat rate, session length, drinking and body mass set the percentage
     loss, and the percentage sets the advice. */
  MODELS['Imbalance and hydration monitoring'] = function (host, mode) {
    host.innerHTML =
      '<div class="kv-grid2">' +
      srange('mass', T('Body mass', '体重'), 35, 100, 70, 1, '70 kg') +
      srange('sweat', T('Sweat rate', '出汗率'), .4, 2.5, 1.2, .1, '1.2 L·h⁻¹') +
      '</div>' +
      '<div class="kv-grid2">' +
      srange('hours', T('Session length', '运动时长'), .5, 5, 2, .5, '2.0 h') +
      srange('drink', T('Drinking during the session', '运动中饮水'), 0, 1, .5, .1, '0.5 L·h⁻¹') +
      '</div>' +
      '<div class="kv-lab" data-v="out"><span class="ibm-q">' + esc(T('Net body-mass change', '净体重变化')) + ' <b class="kv-val"></b></span></div>' +
      '<div class="ibm-band"><i class="z1"></i><i class="z2"></i><i class="z3"></i><u class="mark"></u></div>' +
      '<div class="ibm-scale"><span>0 %</span><span>2 %</span><span>5 %</span><span>8 %</span></div>' +
      '<div class="ibm-key">' +
      '<span><i style="background:var(--green)"></i>' + esc(T('under 2 % — no measurable effect', '低于 2% —— 无可测量影响')) + '</span>' +
      '<span><i style="background:var(--amber)"></i>' + esc(T('2–5 % — plan for it', '2–5% —— 需要应对')) + '</span>' +
      '<span><i style="background:var(--red)"></i>' + esc(T('over 5 % — medical concern', '超过 5% —— 需医学处理')) + '</span></div>' +
      (mode === 'full' ? '<div class="kv-meter"><span>' + esc(T('Replace within 2 h', '2 小时内补回')) + '</span><div class="kv-bar"><i class="rep blue"></i></div><b class="vrep"></b></div>' : '') +
      '<div class="kv-callout"></div>' +
      note('1 L of sweat ≈ 1 kg of body mass, and percentage loss = net loss ÷ body mass × 100. A 2 % loss already raises core temperature and measurably harms endurance and cognition; above 5 % the concern is heat illness, not thirst.', '1 升汗液约等于 1 千克体重，下降百分比 = 净损失 ÷ 体重 × 100。下降 2% 就会升高核心体温，并可测量地损害耐力与认知；超过 5% 时需要担心的是热病，而不只是口渴。');
    var ins = $$('input[type=range]', host);
    function draw() {
      var mass = +ins[0].value, sweat = +ins[1].value, hours = +ins[2].value, drink = +ins[3].value;
      setv(host, 'mass', '.kv-v', mass + ' kg');
      setv(host, 'sweat', '.kv-v', num(sweat) + ' L·h⁻¹');
      setv(host, 'hours', '.kv-v', num(hours) + ' h');
      setv(host, 'drink', '.kv-v', num(drink) + ' L·h⁻¹');
      var net = (sweat - drink) * hours, pct = net / mass * 100;
      setv(host, 'out', '.kv-val', (net > 0 ? '−' : '+') + num(Math.abs(pct)) + ' %  (' + (net > 0 ? '−' : '+') + num(Math.abs(net)) + ' L)');
      var mark = host.querySelector('.mark');
      mark.style.left = (clamp(Math.abs(pct), 0, 8) / 8 * 100).toFixed(1) + '%';
      mark.style.background = net < 0 ? 'var(--c2)' : pct < 2 ? 'var(--green)' : pct < 5 ? 'var(--amber)' : 'var(--red)';
      if (mode === 'full' && net > 0) {
        host.querySelector('.rep').style.transform = 'scaleX(' + clamp(net * 1.5 / 3, 0, 1).toFixed(3) + ')';
        outs(host, '.vrep', num(net * 1.5) + ' L');
      }
      outs(host, '.kv-callout',
        net < 0 ? T('You finish heavier than you started: drinking more than you lost. Over-drinking carries its own risk.', '你结束时比开始时更重：饮水超过了流失。过量饮水本身也有风险。')
          : pct < 2 ? T('A deficit this small is not measurable in performance — drink to thirst and write it down.', '这个量级的亏空不会在表现上被测出——按渴感饮水并记录下来。')
            : pct < 5 ? T('Plan the drinking: ' + num(drink) + ' L·h⁻¹ cannot keep up with a ' + num(sweat) + ' L·h⁻¹ sweat rate, and ' + num(pct) + ' % loss will show up in the second half.', '需要规划饮水：' + num(drink) + ' L·h⁻¹ 跟不上 ' + num(sweat) + ' L·h⁻¹ 的出汗率，下降 ' + num(pct) + '% 会体现在后半程。')
              : T('Treat this before continuing: past 5 % loss the risks are confusion and severe hyperthermia, not thirst.', '继续前必须处理：下降超过 5% 时，风险是意识模糊与严重高热，而不只是口渴。'));
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); });
    draw();
  };

  /* ══ 4 · A.2.2 Pre-exercise, during-exercise and recovery ═════════════
     How fast glycogen comes back depends on what you take, and the first
     four hours are the window where timing matters. */
  MODELS['Pre-exercise, during-exercise and recovery'] = function (host, mode) {
    var R = [
      { id: 'fast', rate: 2, en: 'Fasted', zh: '禁食' },
      { id: 'cho', rate: 5, en: 'Carbohydrate', zh: '仅碳水' },
      { id: 'both', rate: 9, en: 'Carbohydrate + protein', zh: '碳水 + 蛋白质' }
    ];
    var pick = 'cho';
    var PX = 74, PW = 464, PY = 40, PH = 234;
    function X(h) { return PX + h / 24 * PW; }
    function Y(p) { return PY + PH - p / 100 * PH; }
    var HT = mode === 'full' ? [0, 2, 4, 8, 12, 18, 24] : [0, 4, 12, 24];
    host.innerHTML =
      seg(R.map(function (r) { return [r.id, T(r.en, r.zh)]; }), pick) +
      qrange('hours', T('Hours since the session', '训练结束已过'), 0, 240, 20, 1) +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Glycogen resynthesis over time', '糖原再合成随时间的变化')) + '">' +
      '<rect class="window" x="' + PX + '" y="' + PY + '" width="' + (X(4) - PX).toFixed(1) + '" height="' + PH + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      [0, 25, 50, 75, 100].map(function (p) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(p) + '" x2="' + (PX + PW) + '" y2="' + Y(p) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(p) + 4) + '" text-anchor="end">' + p + '</text>';
      }).join('') +
      '<text class="small" x="' + X(2).toFixed(0) + '" y="' + (PY - 10) + '" text-anchor="middle">' + esc(T('critical window', '关键窗口')) + '</text>' +
      '<line class="kv-cursor" y1="' + (PY - 6) + '" y2="' + (PY + PH) + '"/>' +
      '<path class="curve a" d=""/>' +
      HT.map(function (h) {
        return '<text class="small" x="' + X(h).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="middle">' + h + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('hours after', '训练后小时数')) + '</text>' +
      '</svg>' +
      '<div class="kv-meter"><span>' + esc(T('Replenished', '已补回')) + '</span><div class="kv-bar"><i class="got"></i></div><b class="vgot"></b></div>' +
      '<div class="kv-callout"></div>' +
      note('Approximate net glycogen resynthesis rates: 1–3 %·h⁻¹ fasted, 4–6 %·h⁻¹ with carbohydrate, 8–10 %·h⁻¹ with carbohydrate plus 0.3 g·kg⁻¹ protein (24 h to full). The first 3–4 h are the window where timing matters most.', '糖原净再合成速率近似值：禁食 1–3 %·h⁻¹，仅碳水 4–6 %·h⁻¹，碳水加 0.3 g·kg⁻¹ 蛋白质 8–10 %·h⁻¹（24 小时补满）。前 3–4 小时是时间安排最关键的窗口。');
    var inp = host.querySelector('input');
    function rate() { return R.filter(function (x) { return x.id === pick; })[0].rate; }
    function draw() {
      var h = +inp.value / 10, r = rate(), d = '', i;
      setv(host, 'hours', '.kv-val', num(h) + ' h');
      for (i = 0; i <= 48; i++) { var x = i * .5; d += (i ? ' L' : 'M') + X(x).toFixed(1) + ',' + Y(clamp(x * r, 0, 100)).toFixed(1); }
      host.querySelector('.curve').setAttribute('d', d);
      var cx = X(h).toFixed(1);
      host.querySelector('.kv-cursor').setAttribute('x1', cx);
      host.querySelector('.kv-cursor').setAttribute('x2', cx);
      var got = clamp(h * r, 0, 100);
      host.querySelector('.got').style.transform = 'scaleX(' + (got / 100).toFixed(3) + ')';
      outs(host, '.vgot', num(got) + ' %');
      outs(host, '.kv-callout', h < 4
        ? T('Inside the critical window: ' + num(got) + ' % is already back — take 30–60 g carbohydrate with 20–25 g protein now, and repeat within two hours.', '仍在关键窗口：已补回 ' + num(got) + '% —— 现在摄入 30–60 克碳水加 20–25 克蛋白质，两小时内再来一次。')
        : T('Past the critical window: totals matter more than timing. Across the day aim for 1.0–1.2 g·kg⁻¹ carbohydrate with 0.3 g·kg⁻¹ protein.', '已过关键窗口：总量比时间更重要。全天目标为 1.0–1.2 g·kg⁻¹ 碳水加 0.3 g·kg⁻¹ 蛋白质。'));
    }
    inp.addEventListener('input', draw);
    wireSeg(host, function (v) { pick = v; draw(); });
    draw();
  };

  /* ══ 5 · A.3.1 Periodization, overload and overtraining ════════════════
     A 16-week season: weekly load, acute against chronic, and the ratio that
     separates a productive step up from a dangerous spike. */
  MODELS['Periodization, overload and overtraining'] = function (host, mode) {
    var LOAD = [300, 340, 370, 400, 440, 470, 490, 520, 545, 565, 520, 440, 390, 310, 245, 185];
    var PH = [
      { id: '0', en: 'Base', zh: '基础期', from: 1, to: 4, d: 'Volume builds, intensity stays moderate — capacity first.', dz: '以提升训练量为主，强度保持中等——先建容量。' },
      { id: '1', en: 'Build', zh: '发展期', from: 5, to: 8, d: 'Intensity rises while volume still climbs — the steepest part of the season.', dz: '强度上升而训练量仍在增加——赛季中最陡的阶段。' },
      { id: '2', en: 'Peak', zh: '高峰期', from: 9, to: 11, d: 'Highest specific load, volume already falling.', dz: '专项负荷最高，训练量已开始下降。' },
      { id: '3', en: 'Taper', zh: '减量期', from: 12, to: 16, d: 'Volume drops hard, to shed fatigue without losing adaptations.', dz: '训练量大幅下降，在保留适应的同时消除疲劳。' }
    ];
    var PX = 48, PW = 486, PY = 42, PHH = 226, MAXL = 620;
    function bx(i) { return PX + i * PW / 16; }
    function bw() { return PW / 16 - 7; }
    function by(v) { return PY + PHH - v / MAXL * PHH; }
    host.innerHTML =
      seg(PH.map(function (p) { return [p.id, T(p.en, p.zh)]; }), '0') +
      qrange('week', T('Week of the season', '赛季第几周'), 1, 16, 5, 1) +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Weekly load with acute and chronic lines', '每周负荷与急性、慢性曲线')) + '">' +
      LOAD.map(function (v, i) { return '<rect class="bar" data-w="' + (i + 1) + '" x="' + bx(i).toFixed(1) + '" y="' + by(v).toFixed(1) + '" width="' + bw().toFixed(1) + '" height="' + (PHH - PHH * v / MAXL).toFixed(1) + '" rx="3"/>'; }).join('') +
      '<path class="chron" d=""/>' +
      '<line class="kv-cursor" y1="' + (PY - 8) + '" y2="' + (PY + PHH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PHH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PHH) + '"/>' +
      [1, 4, 8, 12, 16].map(function (w) {
        return '<text class="small" x="' + (bx(w - 1) + bw() / 2).toFixed(0) + '" y="' + (PY + PHH + 18) + '" text-anchor="middle">' + w + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PHH + 34) + '" text-anchor="end">' + esc(T('week', '周')) + '</text>' +
      '</svg>' +
      '<div class="kv-legend">' +
      '<span><i class="kv-dot" style="background:var(--c2)"></i>' + esc(T('this week (acute)', '本周（急性）')) + ' <b class="va"></b></span>' +
      '<span><i class="kv-dot" style="background:var(--text3)"></i>' + esc(T('4-week mean (chronic)', '4 周均值（慢性）')) + ' <b class="vc"></b></span>' +
      '<span><i class="kv-dot" style="background:var(--c0)"></i>' + esc(T('ratio', '比值')) + ' <b class="vr"></b></span></div>' +
      '<div class="kv-callout"></div>' +
      note('A simplified weekly-load proxy for the acute:chronic workload ratio: acute = this week, chronic = mean of the last four weeks. Below 0.8 is under-training, 0.8–1.3 the productive range, above 1.5 a high injury-risk spike. The real ratio uses rolling 7-day and 28-day daily loads.', '这是急性:慢性训练负荷比的简化周负荷版本：急性 = 本周，慢性 = 最近四周均值。低于 0.8 为训练不足，0.8–1.3 为有效区间，高于 1.5 则损伤风险明显升高。真实的比值使用 7 天与 28 天滚动日负荷。');
    var inp = host.querySelector('input');
    function chronic(i) {
      var s = 0, n = 0, k;
      for (k = Math.max(0, i - 3); k <= i; k++) { s += LOAD[k]; n++; }
      return s / n;
    }
    function draw() {
      var w = +inp.value, i = w - 1, k, d = '';
      var ph = PH.filter(function (p) { return w >= p.from && w <= p.to; })[0] || PH[0];
      setv(host, 'week', '.kv-val', w + ' · ' + T(ph.en, ph.zh));
      for (k = 0; k <= i; k++) d += (k ? ' L' : 'M') + (bx(k) + bw() / 2).toFixed(1) + ',' + by(chronic(k)).toFixed(1);
      host.querySelector('.chron').setAttribute('d', d);
      var cx = (bx(i) + bw() / 2).toFixed(1);
      host.querySelector('.kv-cursor').setAttribute('x1', cx);
      host.querySelector('.kv-cursor').setAttribute('x2', cx);
      $$('.bar', host).forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-w') === w); });
      var a = LOAD[i], c = chronic(i), r = a / c;
      outs(host, '.va', a + ' AU');
      outs(host, '.vc', num(c, 0) + ' AU');
      outs(host, '.vr', num(r, 2));
      outs(host, '.kv-callout',
        (r < 0.8 ? T('Under-training: the chronic load sits above this week, so detraining starts now. ', '训练不足：慢性负荷高于本周，掉队从现在开始。')
          : r <= 1.3 ? T('Productive: a small step up, absorbed by the capacity already built. ', '有效区间：小幅加量，被已建立的容量吸收。')
            : r <= 1.5 ? T('Caution: the step is getting steep — hold or reduce rather than add. ', '需谨慎：加量幅度开始过大——保持或减少，不要再加。')
              : T('High risk: this is the shape of a spike that precedes overuse injury. ', '高风险：这种曲线形态正是过度使用性损伤之前的样子。'))
        + T(ph.en, ph.zh) + ' — ' + T(ph.d, ph.dz));
    }
    inp.addEventListener('input', draw);
    wireSeg(host, function (v) { inp.value = PH.filter(function (p) { return p.id === v; })[0].from; draw(); });
    draw();
  };

  /* ══ 6 · A.3.3 Central and peripheral fatigue ══════════════════════════
     Two mechanisms, one power curve: which one you are in changes how long
     the effort lasts. */
  MODELS['Central and peripheral fatigue'] = function (host, mode) {
    var M = {
      central: {
        tau: 300, en: 'Central', zh: '中枢性',
        cEn: 'a long hard effort, heat, low glycogen, low motivation, pain',
        cZh: '长时间高强度、炎热、糖原不足、动力不足或疼痛',
        wEn: 'the drive from the brain fades before the muscle is chemically exhausted',
        wZh: '在肌肉尚未被化学性耗竭之前，来自大脑的驱动力已经消退'
      },
      periph: {
        tau: 90, en: 'Peripheral', zh: '外周性',
        cEn: 'a sprint or a heavy set, a high metabolite load, eccentric damage',
        cZh: '冲刺或大重量组、高代谢物负荷、离心性损伤',
        wEn: 'the muscle itself runs short of usable fuel and clearance slows down',
        wZh: '肌肉自身可用燃料不足，且清除代谢物的速度变慢'
      }
    };
    var pick = 'central';
    var PX = 64, PW = 474, PY = 40, PH = 238;
    function X(t) { return PX + t / 120 * PW; }
    function Y(p) { return PY + PH - p / 100 * PH; }
    function path(tau) {
      var d = '', i;
      for (i = 0; i <= 60; i++) { var t = i * 2; d += (i ? ' L' : 'M') + X(t).toFixed(1) + ',' + Y(100 * Math.exp(-t / tau)).toFixed(1); }
      return d;
    }
    host.innerHTML =
      seg([['central', T('Central', '中枢性')], ['periph', T('Peripheral', '外周性')]], pick) +
      qrange('t', T('Seconds into a maximal effort', '全力运动已进行'), 0, 120, 30, 1) +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Power output decaying over time', '功率输出随时间衰减')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      [0, 25, 50, 75, 100].map(function (p) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(p) + '" x2="' + (PX + PW) + '" y2="' + Y(p) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(p) + 4) + '" text-anchor="end">' + p + '</text>';
      }).join('') +
      '<path class="curve b thin" d="' + path(M.periph.tau) + '"/>' +
      '<path class="curve a" d="' + path(M.central.tau) + '"/>' +
      '<text class="small" x="' + (PX + PW - 4) + '" y="' + (Y(100 * Math.exp(-110 / M.periph.tau)) - 10) + '" text-anchor="end">' + esc(T('peripheral', '外周性')) + '</text>' +
      '<text class="small" x="' + (PX + PW - 4) + '" y="' + (Y(100 * Math.exp(-110 / M.central.tau)) - 10) + '" text-anchor="end">' + esc(T('central', '中枢性')) + '</text>' +
      '<line class="kv-cursor" y1="' + (PY - 8) + '" y2="' + (PY + PH) + '"/>' +
      '<text class="small" x="' + PX + '" y="' + (PY - 10) + '">' + esc(T('% of initial power', '初始功率的百分比')) + '</text>' +
      [0, 30, 60, 90, 120].map(function (t) {
        return '<text class="small" x="' + X(t).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="middle">' + t + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('seconds', '秒')) + '</text>' +
      '</svg>' +
      '<div class="kv-meter"><span>' + esc(T('Power remaining', '剩余功率')) + '</span><div class="kv-bar"><i class="pw"></i></div><b class="vpw"></b></div>' +
      '<div class="kv-meter"><span>' + esc(T('Time to 80 %', '降到 80% 所需时间')) + '</span><div class="kv-bar"><i class="t80 red"></i></div><b class="vt80"></b></div>' +
      '<div class="kv-callout"></div>' +
      note('A single exponential decay is a teaching model, not a measured law. Central fatigue develops over minutes and peripheral fatigue within tens of seconds, so a 30 s sprint is almost entirely peripheral while the third hour is almost entirely central. Real curves are not exponential, and a taper, a finishing kick or a second wind changes them.', '单一指数衰减是教学模型，而不是实测规律。中枢性疲劳以分钟计发展，外周性疲劳在数十秒内出现，因此 30 秒冲刺几乎全是外周性，而第三个小时几乎全是中枢性。真实曲线并非指数形，减速、冲刺末段的加速或“第二次风”都会改变它。');
    var inp = host.querySelector('input');
    function draw() {
      var t = +inp.value, m = M[pick], p = 100 * Math.exp(-t / m.tau), other = pick === 'central' ? 'periph' : 'central';
      setv(host, 't', '.kv-val', t + ' s · ' + T(m.en, m.zh));
      var cx = X(t).toFixed(1);
      host.querySelector('.kv-cursor').setAttribute('x1', cx);
      host.querySelector('.kv-cursor').setAttribute('x2', cx);
      var a = host.querySelector('.curve.a'), b = host.querySelector('.curve.b');
      a.setAttribute('d', path(m.tau)); b.setAttribute('d', path(M[other].tau));
      a.classList.toggle('a', pick === 'central'); a.classList.toggle('b', pick === 'periph');
      var pw = host.querySelector('.pw');
      pw.style.transform = 'scaleX(' + (p / 100).toFixed(3) + ')';
      pw.style.background = p > 80 ? 'var(--green)' : p > 50 ? 'var(--amber)' : 'var(--red)';
      outs(host, '.vpw', num(p) + ' %');
      var t80 = Math.round(Math.log(.8) * m.tau);
      host.querySelector('.t80').style.transform = 'scaleX(' + clamp(t80 / 120, 0, 1).toFixed(3) + ')';
      outs(host, '.vt80', t80 + ' s');
      outs(host, '.kv-callout', T(m.en, m.zh) + ' — ' + T(m.cEn, m.cZh) + '. ' + T(m.wEn, m.wZh) + '.');
    }
    inp.addEventListener('input', draw);
    wireSeg(host, function (v) { pick = v; draw(); });
    draw();
  };

  /* ══ 7 · B.2.1 Friction, work and power ════════════════════════════════
     Work is an area under the force–distance curve; power is that area per
     second. */
  MODELS['Friction, work and power'] = function (host, mode) {
    var PX = 64, PW = 474, PY = 44, PH = 230, FMAX = 950;
    function X(d) { return PX + d / 10 * PW; }
    function Y(f) { return PY + PH - f / FMAX * PH; }
    host.innerHTML =
      '<div class="kv-grid2">' +
      srange('f', T('Friction force', '摩擦力'), 100, 900, 420, 10, '420 N') +
      srange('m', T('Load mass', '负载质量'), 20, 100, 60, 1, '60 kg') +
      '</div>' +
      '<div class="kv-grid2">' +
      srange('d', T('Distance', '移动距离'), .5, 10, 4, .1, '4.0 m') +
      srange('t', T('Time taken', '所用时间'), 1, 60, 12, 1, '12 s') +
      '</div>' +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Force against distance with the work shaded', '力与距离曲线，阴影为做功')) + '">' +
      '<path class="work" d=""/>' +
      '<path class="curve a" d=""/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      [0, 300, 600, 900].map(function (f) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(f) + '" x2="' + (PX + PW) + '" y2="' + Y(f) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(f) + 4) + '" text-anchor="end">' + f + '</text>';
      }).join('') +
      '<line class="kv-cursor" y1="' + (PY - 8) + '" y2="' + (PY + PH) + '"/>' +
      [0, 2, 5, 10].map(function (d) {
        return '<text class="small" x="' + X(d).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="middle">' + d + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('distance (m)', '距离（米）')) + '</text>' +
      '</svg>' +
      '<div class="kv-meter"><span>' + esc(T('Work done', '做功')) + '</span><div class="kv-bar"><i class="w gold"></i></div><b class="vw"></b></div>' +
      '<div class="kv-meter"><span>' + esc(T('Power', '功率')) + '</span><div class="kv-bar"><i class="p blue"></i></div><b class="vp"></b></div>' +
      (mode === 'full' ? '<div class="kv-meter"><span>' + esc(T('Equivalent climb', '等效爬升')) + '</span><div class="kv-bar"><i class="h red"></i></div><b class="vh"></b></div>' : '') +
      '<div class="kv-callout"></div>' +
      note('The small triangle is the static peak before the object moves (1.6 × the friction force over the first 2 cm); the plateau is kinetic friction. Work is the shaded area under the curve and power is that area divided by time. Every extra metre costs the same force again, which is why power rises with speed.', '小三角是物体移动前的静摩擦峰值（1.6 倍摩擦力，作用在前 2 厘米），平台部分是动摩擦。做功即曲线下的阴影面积，功率则是该面积除以时间。每多移动一米都要再付一次同样的力——这正是功率随速度上升的原因。');
    var ins = $$('input[type=range]', host);
    function draw() {
      var f = +ins[0].value, m = +ins[1].value, d = +ins[2].value, t = +ins[3].value;
      setv(host, 'f', '.kv-v', f + ' N');
      setv(host, 'm', '.kv-v', m + ' kg');
      setv(host, 'd', '.kv-v', num(d) + ' m');
      setv(host, 't', '.kv-v', t + ' s');
      var work = .5 * 1.6 * f * .02 + f * Math.max(0, d - .02);
      host.querySelector('.curve').setAttribute('d', 'M' + X(0).toFixed(1) + ',' + Y(0) + ' L' + X(.02).toFixed(1) + ',' + Y(1.6 * f) + ' L' + X(10).toFixed(1) + ',' + Y(f));
      host.querySelector('.work').setAttribute('d', 'M' + X(0).toFixed(1) + ',' + (PY + PH) + ' L' + X(0).toFixed(1) + ',' + Y(0) + ' L' + X(.02).toFixed(1) + ',' + Y(1.6 * f) + ' L' + X(d).toFixed(1) + ',' + Y(f) + ' L' + X(d).toFixed(1) + ',' + (PY + PH) + 'Z');
      var cx = X(d).toFixed(1);
      host.querySelector('.kv-cursor').setAttribute('x1', cx);
      host.querySelector('.kv-cursor').setAttribute('x2', cx);
      var power = work / t, height = work / (m * 9.81);
      host.querySelector('.w').style.transform = 'scaleX(' + clamp(work / 5000, 0, 1).toFixed(3) + ')';
      host.querySelector('.p').style.transform = 'scaleX(' + clamp(power / 1000, 0, 1).toFixed(3) + ')';
      outs(host, '.vw', Math.round(work) + ' J');
      outs(host, '.vp', Math.round(power) + ' W');
      if (mode === 'full') {
        host.querySelector('.h').style.transform = 'scaleX(' + clamp(height / 12, 0, 1).toFixed(3) + ')';
        outs(host, '.vh', num(height) + ' m');
      }
      outs(host, '.kv-callout', T('Looks like: ', '例如：') + T(
        'pushing a ' + m + ' kg crate ' + num(d) + ' m in ' + t + ' s — ' + Math.round(work) + ' J against friction, ' + Math.round(power) + ' W, the same energy as raising ' + m + ' kg by ' + num(height) + ' m.',
        '把 ' + m + ' 千克箱子推动 ' + num(d) + ' 米、用时 ' + t + ' 秒——克服摩擦 ' + Math.round(work) + ' 焦耳，功率 ' + Math.round(power) + ' 瓦，相当于把 ' + m + ' 千克物体抬高 ' + num(height) + ' 米。'));
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); });
    draw();
  };

  /* ══ 8 · B.2.2 Projectile motion and environmental forces ═════════════
     One launch, two independent motions: horizontal stays uniform, vertical
     is pulled by gravity. Wind changes the first but never the second. */
  MODELS['Projectile motion and environmental forces'] = function (host, mode) {
    var PX = 54, PW = 490, PY = 34, PH = 252, G = 9.8;
    /* a stepped scale, never a smoothly rescaling one: the drawing keeps its
       size while a control moves and only re-scales at a threshold, and a
       fast throw can never be drawn outside the plot */
    var RS = [20, 30, 45, 60, 90, 130, 180, 240], HS = [5, 8, 12, 18, 26, 36, 50];
    var MAXR = RS[RS.length - 1], MAXH = HS[HS.length - 1];
    function step(list, v) { for (var i = 0; i < list.length; i++) if (list[i] >= v * 1.12) return list[i]; return list[list.length - 1]; }
    function X(r, m) { return PX + r / (m || MAXR) * PW; }
    function Y(h, m) { return PY + PH - h / (m || MAXH) * PH; }
    function band(a) {
      return a < 25 ? T('a flat, fast drive — a sprint start or a serve', '平而快的发力——冲刺起跑或发球')
        : a < 40 ? T('a throwing event — discus, hammer, javelin', '投掷项目——铁饼、链球、标枪')
          : a < 55 ? T('the textbook 45°: maximum range between equal heights', '教科书式的 45°：等高起落时射程最大')
            : a < 75 ? T('a lofted throw — high jump, shot put', '高抛类——跳高、铅球')
              : T('almost vertical — a lob that spends most of its time going up', '接近垂直——高抛球，大部分时间在上升');
    }
    host.innerHTML =
      '<div class="kv-grid2">' +
      srange('ang', T('Launch angle', '出手角度'), 5, 85, 45, 1, '45°') +
      srange('v', T('Release speed', '出手速度'), 5, 32, 20, .5, '20.0 m·s⁻¹') +
      '</div>' +
      srange('w', T('Wind (head / tail)', '风（逆风 / 顺风）'), -10, 10, 0, 1, '0 m·s⁻¹') +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Projectile trajectory', '抛体轨迹')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<g class="xgrid"></g><g class="ygrid"></g>' +
      '<path class="traj" d=""/>' +
      '<line class="vx" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<line class="vy" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<circle class="apex" r="5" cx="0" cy="0"/>' +
      '<line class="kv-cursor" y1="' + (PY - 6) + '" y2="' + (PY + PH) + '"/>' +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('horizontal distance (m)', '水平距离（米）')) + '</text>' +
      '<text class="small" x="' + (PX - 8) + '" y="' + (PY - 8) + '" text-anchor="end">m</text>' +
      '</svg>' +
      '<div class="kv-meter"><span>' + esc(T('Range', '射程')) + '</span><div class="kv-bar"><i class="r blue"></i></div><b class="vr2"></b></div>' +
      '<div class="kv-meter"><span>' + esc(T('Max height', '最大高度')) + '</span><div class="kv-bar"><i class="hh gold"></i></div><b class="vh2"></b></div>' +
      '<div class="kv-legend">' +
      '<span><i class="kv-dot red"></i>' + esc(T('horizontal: constant speed', '水平：匀速')) + '</span>' +
      '<span><i class="kv-dot gold"></i>' + esc(T('vertical: gravity only', '竖直：只受重力')) + '</span></div>' +
      '<div class="kv-callout"></div>' +
      note('Range = v²·sin(2θ)/g and height = (v·sinθ)²/2g for launch and landing at the same height. Wind is added to the horizontal component only, so it changes the range but never the height or the flight time. Real launches are not released from their best height and lose speed during the flight.', '起落等高时，射程 = v²·sin(2θ)/g，高度 = (v·sinθ)²/2g。风只加在水平分量上，因此改变射程，却不影响高度与飞行时间。真实投掷并非从最佳高度出手，且在飞行中会损失速度。');
    var ins = $$('input[type=range]', host);
    function draw() {
      var a = +ins[0].value, v = +ins[1].value, w = +ins[2].value;
      setv(host, 'ang', '.kv-v', a + '°');
      setv(host, 'v', '.kv-v', num(v) + ' m·s⁻¹');
      setv(host, 'w', '.kv-v', (w > 0 ? '+' : '') + w + ' m·s⁻¹');
      var th = a * Math.PI / 180, vx = v * Math.cos(th) + w, vy = v * Math.sin(th);
      var tf = vy > .2 ? 2 * vy / G : 0, r = Math.max(0, vx * tf), h = vy * vy / (2 * G);
      var MR = step(RS, r), MH = step(HS, h), i, t, x, y, d = '';
      for (i = 0; i <= 60; i++) {
        t = tf * i / 60;
        x = vx * t; y = Math.max(0, vy * t - .5 * G * t * t);
        d += (i ? ' L' : 'M') + X(x, MR).toFixed(1) + ',' + Y(y, MH).toFixed(1);
      }
      host.querySelector('.xgrid').innerHTML = [0, MR / 4, MR / 2, MR * .75, MR].map(function (g) {
        return '<line class="gl" x1="' + X(g, MR).toFixed(1) + '" y1="' + PY + '" x2="' + X(g, MR).toFixed(1) + '" y2="' + (PY + PH) + '"/>' +
          '<text class="small" x="' + X(g, MR).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="middle">' + Math.round(g) + '</text>';
      }).join('');
      host.querySelector('.ygrid').innerHTML = [0, MH / 2, MH].map(function (g) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(g, MH).toFixed(1) + '" x2="' + (PX + PW) + '" y2="' + Y(g, MH).toFixed(1) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(g, MH) + 4).toFixed(1) + '" text-anchor="end">' + Math.round(g) + '</text>';
      }).join('');
      host.querySelector('.traj').setAttribute('d', d);
      host.querySelector('.vx').setAttribute('x2', X(r, MR).toFixed(1));
      host.querySelector('.vy').setAttribute('y2', Y(h, MH).toFixed(1));
      host.querySelector('.apex').setAttribute('cx', X(Math.max(0, vx * tf / 2), MR).toFixed(1));
      host.querySelector('.apex').setAttribute('cy', Y(h, MH).toFixed(1));
      host.querySelector('.kv-cursor').setAttribute('x1', X(r, MR).toFixed(1));
      host.querySelector('.kv-cursor').setAttribute('x2', X(r, MR).toFixed(1));
      host.querySelector('.r').style.transform = 'scaleX(' + (r / MR).toFixed(3) + ')';
      host.querySelector('.hh').style.transform = 'scaleX(' + (h / MH).toFixed(3) + ')';
      outs(host, '.vr2', num(r) + ' m');
      outs(host, '.vh2', num(h) + ' m');
      outs(host, '.kv-callout', T('Looks like: ', '例如：') + band(a) + '. ' + T('Flight time ', '飞行时间 ') + num(tf) + ' s' + (w ? ' · ' + T('the wind shifted the range only', '风只改变了射程') : '') + '.');
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); });
    draw();
  };

  /* ══ 9 · B.1.1 Planes, axes and movement ═══════════════════════════════
     Pick a movement and the plane, the axis and the normal range of motion
     appear together, with the goniometer reading the angle. */
  MODELS['Planes, axes and movement'] = function (host, mode) {
    var M = [
      { id: 'flex', rom: 135, plane: 'sagittal', axis: 'ml', en: 'Flexion', zh: '屈曲', eg: 'knee, hip, elbow', egZh: '膝、髋、肘' },
      { id: 'ext', rom: 45, plane: 'sagittal', axis: 'ml', en: 'Extension', zh: '伸展', eg: 'elbow straightening after flexion', egZh: '屈曲后的肘伸展' },
      { id: 'abd', rom: 45, plane: 'frontal', axis: 'ap', en: 'Abduction', zh: '外展', eg: 'hip and shoulder moving away from the midline', egZh: '髋与肩远离身体中线' },
      { id: 'add', rom: 45, plane: 'frontal', axis: 'ap', en: 'Adduction', zh: '内收', eg: 'limb returning toward the midline', egZh: '肢体回到中线' },
      { id: 'rot', rom: 90, plane: 'transverse', axis: 'v', en: 'Rotation', zh: '旋转', eg: 'turning the trunk on the spine', egZh: '躯干绕脊柱转动' },
      { id: 'circ', rom: 180, plane: 'multi', axis: 'x', en: 'Circumduction', zh: '绕环', eg: 'shoulder tracing a circle', egZh: '肩关节画出圆周' }
    ];
    var PLANE = {
      sagittal: { en: 'sagittal', zh: '矢状面', dEn: 'divides left from right', dZh: '把左右分开' },
      frontal: { en: 'frontal (coronal)', zh: '额状面（冠状面）', dEn: 'divides front from back', dZh: '把前后分开' },
      transverse: { en: 'transverse', zh: '横断面', dEn: 'divides top from bottom', dZh: '把上下分开' },
      multi: { en: 'multi-planar', zh: '多平面', dEn: 'a combination of all three', dZh: '三个平面的组合' }
    };
    var AXIS = {
      ml: { en: 'medial–lateral', zh: '内外侧轴', dEn: 'side to side', dZh: '左右向' },
      ap: { en: 'anterior–posterior', zh: '前后轴', dEn: 'front to back', dZh: '前后向' },
      v: { en: 'vertical', zh: '垂直轴', dEn: 'up and down', dZh: '上下向' },
      x: { en: 'changes around the circle', zh: '随圆周位置改变', dEn: 'each third of the circle has its own axis', dZh: '圆周的每一段都有自己的轴' }
    };
    var pick = 'flex';
    host.innerHTML =
      seg(M.map(function (m) { return [m.id, T(m.en, m.zh)]; }), pick) +
      '<div class="kv-row" style="margin-top:.7rem">' +
      '<svg class="kv-svg portrait" viewBox="0 0 170 264" role="img" aria-label="' + esc(T('Body in the plane of movement', '身体与运动所在平面')) + '">' +
      '<rect class="plane" x="10" y="10" width="150" height="232" rx="8"/>' +
      '<line class="ax" x1="85" y1="14" x2="85" y2="240"/>' +
      '<circle class="sk" cx="85" cy="38" r="14"/>' +
      '<path class="body" d="M85,52 L85,126"/>' +
      '<path class="body thin" d="M60,76 L110,76"/>' +
      '<path class="body" d="M60,76 L47,122"/>' +
      '<path class="body" d="M110,76 L123,122"/>' +
      '<path class="body thin" d="M68,126 L102,126"/>' +
      '<path class="body on" d="M68,126 L58,176 M58,176 L64,230"/>' +
      '<path class="body" d="M102,126 L112,176 M112,176 L106,230"/>' +
      '<circle class="joint" cx="68" cy="126" r="4"/><circle class="joint" cx="85" cy="76" r="4"/>' +
      '<text class="small" x="85" y="258" text-anchor="middle" id="ibm-plabel"></text>' +
      '</svg>' +
      '<div class="kv-side">' +
      '<svg class="kv-svg kv-gon" viewBox="0 0 200 150" aria-hidden="true"><path class="kv-arc"/><line class="kv-seg1" x1="100" y1="110" x2="190" y2="110"/><line class="kv-seg2" x1="100" y1="110"/><circle cx="100" cy="110" r="7" class="kv-axis"/><text class="kv-deg" x="100" y="142" text-anchor="middle"></text></svg>' +
      qrange('deg', T('How far through the range', '活动到哪个角度'), 0, 180, 60, 1) +
      '<dl class="kv-el-out"><dt>' + esc(T('Plane', '平面')) + '</dt><dd class="vplane"></dd>' +
      '<dt>' + esc(T('Axis', '轴')) + '</dt><dd class="vaxis"></dd>' +
      '<dt>' + esc(T('Typical range', '常见范围')) + '</dt><dd class="vrom"></dd></dl>' +
      '</div></div>' +
      '<div class="kv-callout"></div>' +
      note('Planes and axes are named from the anatomical position: sagittal divides left from right, frontal divides front from back, transverse divides top from bottom, and each movement turns about an axis perpendicular to its plane. Ranges are AAOS averages for adults.', '平面与轴均以解剖学姿势为参照：矢状面分左右，额状面分前后，横断面分上下；每个动作都绕与其平面垂直的轴转动。范围为成人 AAOS 平均值。');
    var inp = host.querySelector('.kv-side input');
    function m() { return M.filter(function (x) { return x.id === pick; })[0]; }
    function draw() {
      var mm = m(), a = +inp.value, r = a * Math.PI / 180;
      setv(host, 'deg', '.kv-val', a + '°');
      host.querySelector('.kv-seg2').setAttribute('x2', (100 + 80 * Math.cos(-r)).toFixed(1));
      host.querySelector('.kv-seg2').setAttribute('y2', (110 + 80 * Math.sin(-r)).toFixed(1));
      var ax = 100 + 34 * Math.cos(-r), ay = 110 + 34 * Math.sin(-r);
      host.querySelector('.kv-arc').setAttribute('d', 'M134,110 A34,34 0 0 0 ' + ax.toFixed(1) + ',' + ay.toFixed(1));
      host.querySelector('.kv-deg').textContent = a + '°';
      outs(host, '.vplane', T(PLANE[mm.plane].en, PLANE[mm.plane].zh) + ' — ' + T(PLANE[mm.plane].dEn, PLANE[mm.plane].dZh));
      outs(host, '.vaxis', T(AXIS[mm.axis].en, AXIS[mm.axis].zh) + ' — ' + T(AXIS[mm.axis].dEn, AXIS[mm.axis].dZh));
      outs(host, '.vrom', mm.rom + '°');
      outs(host, '#ibm-plabel', T(PLANE[mm.plane].en, PLANE[mm.plane].zh));
      outs(host, '.kv-callout', T(mm.en, mm.zh) + ' — ' + T(mm.eg, mm.egZh) + '. ' +
        (a > mm.rom ? T('Beyond the typical range: check for hypermobility or a substitution pattern.', '超出常见范围——需排查关节过度活动或代偿模式。')
          : T('Within the typical range.', '在常见范围内。')));
    }
    inp.addEventListener('input', draw);
    wireSeg(host, function (v) {
      pick = v; inp.max = m().rom + 20; inp.value = m().rom; draw();
    });
    draw();
  };

  /* ══ 10 · C.4.1 Arousal and theories ═══════════════════════════════════
     The same performance curve read by two theories, and the zone where
     they disagree. */
  MODELS['Arousal and theories'] = function (host, mode) {
    var PX = 64, PW = 474, PY = 40, PH = 242;
    function X(a) { return PX + a / 100 * PW; }
    function Y(p) { return PY + PH - p / 100 * PH; }
    function drive(a) { return 100 * Math.exp(-Math.pow(a - 55, 2) / (2 * 30 * 30)); }
    function lazarus(a) { return a < 70 ? 20 + .8 * a : Math.max(0, 76 - .055 * Math.pow(a - 70, 2)); }
    function pathOf(fn) {
      var d = '', i;
      for (i = 0; i <= 60; i++) { var a = i * 100 / 60; d += (i ? ' L' : 'M') + X(a).toFixed(1) + ',' + Y(fn(a)).toFixed(1); }
      return d;
    }
    var pick = 'drive';
    host.innerHTML =
      seg([['drive', T('Drive theory', '驱力理论')], ['lazarus', T('Lazarus', '拉扎勒斯')]], pick) +
      qrange('a', T('Arousal right now', '当前唤醒水平'), 0, 100, 70, 1) +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Performance against arousal', '表现随唤醒水平变化')) + '">' +
      '<rect class="window red" x="' + X(70).toFixed(1) + '" y="' + PY + '" width="' + (X(100) - X(70)).toFixed(1) + '" height="' + PH + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      [0, 25, 50, 75, 100].map(function (p) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(p) + '" x2="' + (PX + PW) + '" y2="' + Y(p) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(p) + 4) + '" text-anchor="end">' + p + '</text>';
      }).join('') +
      '<text class="small" x="' + X(85).toFixed(0) + '" y="' + (PY + 16) + '" text-anchor="middle">' + esc(T('disagreement', '分歧区')) + '</text>' +
      '<path class="curve b thin" d="' + pathOf(lazarus) + '"/>' +
      '<path class="curve a" d="' + pathOf(drive) + '"/>' +
      '<line class="kv-cursor" y1="' + (PY - 8) + '" y2="' + (PY + PH) + '"/>' +
      [0, 25, 50, 75, 100].map(function (a) {
        return '<text class="small" x="' + X(a).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="middle">' + a + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('arousal', '唤醒')) + '</text>' +
      '</svg>' +
      '<div class="kv-legend">' +
      '<span><i class="kv-dot blue"></i>' + esc(T('Drive (inverted U)', '驱力理论（倒 U）')) + '</span>' +
      '<span><i class="kv-dot red"></i>' + esc(T('Lazarus (linear, then catastrophe)', '拉扎勒斯（线性后灾难）')) + '</span></div>' +
      '<div class="kv-meter"><span>' + esc(T('Performance', '表现水平')) + '</span><div class="kv-bar"><i class="pf"></i></div><b class="vpf"></b></div>' +
      '<div class="kv-callout"></div>' +
      note('Drive theory predicts one optimum at moderate arousal; Lazarus adds that high arousal is harmless until performance actually starts to fall away — which is why 70–100 is where the two disagree. Both are heuristics, and skill level changes the shape: experienced performers often do their best work highly aroused.', '驱力理论预测中等唤醒时存在唯一最佳点；拉扎勒斯补充：唤醒高本身并无问题，直到表现真正开始下滑——这正是 70–100 区间两理论产生分歧之处。两者都只是经验规则，技能水平也会改变曲线形态：经验丰富的表演者往往在高度唤醒下表现最好。');
    var inp = host.querySelector('input');
    function draw() {
      var a = +inp.value, p = pick === 'drive' ? drive(a) : lazarus(a);
      setv(host, 'a', '.kv-val', a + ' · ' + (a < 40 ? T('under-aroused', '唤醒不足') : a < 70 ? T('in the zone', '最佳区间') : T('over-aroused', '唤醒过高')));
      var cx = X(a).toFixed(1);
      host.querySelector('.kv-cursor').setAttribute('x1', cx);
      host.querySelector('.kv-cursor').setAttribute('x2', cx);
      var pf = host.querySelector('.pf');
      pf.style.transform = 'scaleX(' + (p / 100).toFixed(3) + ')';
      pf.style.background = p > 70 ? 'var(--green)' : p > 45 ? 'var(--amber)' : 'var(--red)';
      outs(host, '.vpf', num(p) + ' %');
      outs(host, '.kv-callout', a < 40
        ? T('Too calm for a skill that needs drive: warm up, raise the stakes, add pressure cues.', '对于需要驱力的动作来说过于平静：热身、提高赌注、加入压力线索。')
        : a < 70 ? T('In the window both theories accept — the zone most performance work is coached into.', '两个理论都接受的窗口——多数表现训练都瞄准这里。')
          : T('Above 70 they disagree: drive theory says you are past optimal, Lazarus says the fall is only beginning. Skilled performers often hold here; beginners usually do not.', '超过 70 后两者分歧：驱力理论认为已偏离最佳，拉扎勒斯认为下滑才刚开始。技术熟练者常能维持，初级者通常不能。'));
    }
    inp.addEventListener('input', draw);
    wireSeg(host, function (v) {
      pick = v;
      var a = host.querySelector('.curve.a');
      a.setAttribute('d', pathOf(v === 'drive' ? drive : lazarus));
      a.classList.toggle('a', v === 'drive'); a.classList.toggle('b', v === 'lazarus');
      draw();
    });
    draw();
  };

  /* ══ component helpers — thin wrappers over the shipped .kv-* kit ═════ */
  /* every one of these returns the markup the textbook panel already uses, so
     a model built here is visually identical to the reference model */
  function zones(rows) {
    return '<div class="kv-zones">' + rows.map(function (r) {
      return '<div class="kv-zone kv-z' + r[4] + '"><span class="kv-zn">' + esc(r[0]) + '</span>' +
        '<span class="kv-zl">' + esc(r[1]) + (r[2] ? '<small>' + esc(r[2]) + '</small>' : '') + '</span>' +
        '<b>' + esc(r[3] == null ? '' : r[3]) + '</b></div>';
    }).join('') + '</div>';
  }
  function meter(label, id, cls) {
    return '<div class="kv-meter"><span>' + esc(label) + '</span><div class="kv-bar"><i class="' + id +
      (cls ? ' ' + cls : '') + '"></i></div><b class="v' + id + '"></b></div>';
  }
  function tools(items, active) {
    return '<div class="kv-tools" role="group">' + items.map(function (o) {
      return '<button type="button" data-v="' + esc(o[0]) + '" class="' + (o[0] === active ? 'on' : '') +
        '" aria-pressed="' + (o[0] === active ? 'true' : 'false') + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }
  function wire(host, sel, fn) {
    host.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest(sel + ' button');
      if (!b || !host.contains(b)) return;
      fn(b.getAttribute('data-v'), b);
    });
  }
  function marks(host, sel, v) {
    $$(sel + ' button', host).forEach(function (b) {
      var on = b.getAttribute('data-v') === String(v);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function path(steps, active, cls) {
    return '<ol class="kv-path ' + (cls || '') + '" style="grid-template-columns:repeat(' + steps.length + ',minmax(0,1fr))">' +
      steps.map(function (s, i) {
        return '<li><button type="button" data-v="' + i + '" aria-pressed="' + (i === active ? 'true' : 'false') + '">' +
          '<b>' + (i + 1) + '</b><span>' + esc(s) + '</span></button></li>';
      }).join('') + '</ol>';
  }
  function pyr(rows) {
    return '<div class="kv-pyr">' + rows.map(function (r) {
      return '<div class="kv-lv' + (r[3] ? ' on' : '') + '" style="--w:' + r[1] + '%">' + esc(r[0]) +
        (r[2] ? ' <em class="kv-grade ' + r[4] + '">' + esc(r[2]) + '</em>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function frow(label, id, cls) {
    return '<div class="kv-frow"><span>' + esc(label) + '</span><div class="kv-fbar ' + (cls || '') +
      '"><i class="' + id + '"></i></div><b class="v' + id + '"></b></div>';
  }
  function bar(node, frac, colour) {
    node.style.width = (clamp(frac, 0, 1) * 100).toFixed(1) + '%';
    if (colour) node.style.background = colour;
  }
  function scaleBar(node, frac) { node.style.transform = 'scaleX(' + clamp(frac, 0, 1).toFixed(3) + ')'; }
  function stars(n) {
    var s = '<em class="kv-stars">';
    for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
    return s + '</em>';
  }
  function axisY(PY, PH, v, top, fmt) {
    return PY + PH - v / top * PH;
  }

  /* ══ 11 · C.1.1 Trait-environment interaction ══════════════════════════
     Two sliders and a quadrant: the same trait behaves differently in a
     different environment. */
  MODELS['Trait-environment interaction'] = function (host) {
    var Q = [
      { id: 'hi-hi', en: 'Developed', zh: '已发展', dEn: 'capacity and environment both strong — the athlete is hard to move and hard to stop developing', dZh: '能力与环境都强——这名运动员难被打动，也难停止进步' },
      { id: 'hi-lo', en: 'Fragile', zh: '脆弱', dEn: 'real capacity, poor environment — it works until the environment stops supporting it, then it plateaus', dZh: '能力真实但环境欠佳——环境一旦不再支持就会停滞' },
      { id: 'lo-hi', en: 'Nurtured', zh: '被培养', dEn: 'good environment, limited capacity — effort and coaching are maximised but the ceiling stays', dZh: '环境好但能力有限——努力与执教都用尽，但上限仍在' },
      { id: 'lo-lo', en: 'At risk', zh: '有风险', dEn: 'neither — low capacity in a low environment is where motivation and retention are lost', dZh: '两者皆低——低能力遇上低环境，最容易失去动力与留队' }
    ];
    var PX = 96, PY = 36, PW = 432, PH = 236;
    function X(v) { return PX + (v - 1) / 9 * PW; }
    function Y(v) { return PY + PH - (v - 1) / 9 * PH; }
    host.innerHTML =
      '<div class="kv-grid2">' +
      srange('cap', T('Trained capacity', '训练能力'), 1, 10, 6, 1, '6 / 10') +
      srange('env', T('Quality of the environment', '环境质量'), 1, 10, 8, 1, '8 / 10') +
      '</div>' +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Trait and environment quadrants', '能力与环境的四象限')) + '">' +
      '<rect class="q1" x="' + PX + '" y="' + PY + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<rect class="q2" x="' + (PX + PW / 2).toFixed(1) + '" y="' + PY + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<rect class="q2" x="' + PX + '" y="' + (PY + PH / 2).toFixed(1) + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<rect class="q1" x="' + (PX + PW / 2).toFixed(1) + '" y="' + (PY + PH / 2).toFixed(1) + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<line class="axis" x1="' + (PX + PW / 2) + '" y1="' + PY + '" x2="' + (PX + PW / 2) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH / 2) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH / 2) + '"/>' +
      '<text class="small" x="' + (PX + 12) + '" y="' + (PY + 20) + '" id="q-tl">' + esc(T('fragile', '脆弱')) + '</text>' +
      '<text class="small" x="' + (PX + PW - 12) + '" y="' + (PY + 20) + '" text-anchor="end" id="q-tr">' + esc(T('developed', '已发展')) + '</text>' +
      '<text class="small" x="' + (PX + 12) + '" y="' + (PY + PH - 10) + '" id="q-bl">' + esc(T('at risk', '有风险')) + '</text>' +
      '<text class="small" x="' + (PX + PW - 12) + '" y="' + (PY + PH - 10) + '" text-anchor="end" id="q-br">' + esc(T('nurtured', '被培养')) + '</text>' +
      '<circle class="marker" r="9" cx="0" cy="0"/>' +
      '<line class="gl" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="gl" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 20) + '" text-anchor="end">' + esc(T('environment: coaches, peers, facilities, pressure', '环境：教练、队友、设施、压力')) + '</text>' +
      '<text class="small" x="' + (PX - 10) + '" y="' + (PY + PH / 2) + '" text-anchor="end" id="q-yl">' + esc(T('trait', '特质')) + '</text>' +
      '</svg>' +
      '<div class="kv-callout"></div>' +
      note('Traits are relatively stable and biologically influenced, while the environment supplies coaches, peers, facilities, pressure and level of competition. The same trait can produce different behaviour in different contexts — which is why personality alone cannot predict performance.', '特质相对稳定并受生物因素影响，而环境提供教练、队友、设施、压力与竞争水平。同样的特质在不同情境下可能产生不同行为——这正是单靠人格无法预测表现的原因。');
    var ins = $$('input[type=range]', host);
    function draw() {
      var cap = +ins[0].value, env = +ins[1].value;
      setv(host, 'cap', '.kv-v', cap + ' / 10');
      setv(host, 'env', '.kv-v', env + ' / 10');
      var m = host.querySelector('.marker');
      m.setAttribute('cx', X(env).toFixed(1)); m.setAttribute('cy', Y(cap).toFixed(1));
      var q = cap >= 6 ? (env >= 6 ? 0 : 1) : (env >= 6 ? 3 : 2);
      var row = Q[q];
      outs(host, '.kv-callout', T(row.en, row.zh) + ' — ' + T(row.dEn, row.dZh) + '. ' +
        T('Looks like: the same competitor behaves differently in a supportive club and in a hostile one.', '例如：同一位选手在支持性的俱乐部与在充满敌意的环境中表现不同。'));
      m.classList.toggle('ok', q === 0 || q === 3);
      m.classList.toggle('risk', q === 1 || q === 2);
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); });
    draw();
  };

  /* ══ 12 · C.1.1 Big Five and measurement ═══════════════════════════════
     Five traits as continua, each with the instrument that measures it and
     what a high or low score means in sport. */
  MODELS['Big Five and measurement'] = function (host) {
    var T5 = [
      { id: 'o', en: 'Openness', zh: '开放性', lo: 'prefers familiar routines, resists new methods', loZh: '偏好熟悉套路、抗拒新方法', hi: 'seeks novelty, tries new methods and ideas', hiZh: '追求新颖、乐于尝试新方法与新想法', tool: 'BFI / NEO PI-R' },
      { id: 'c', en: 'Conscientiousness', zh: '尽责性', lo: 'disorganised, misses sessions and preparation', loZh: '缺乏条理、缺席训练与准备', hi: 'plans, prepares, follows through on detail', hiZh: '有计划、充分准备、注重细节落实', tool: 'BFI / NEO PI-R' },
      { id: 'e', en: 'Extraversion', zh: '外向性', lo: 'quiet, prefers individual tasks, drains in crowds', loZh: '安静、偏好个人任务、在人群中消耗', hi: 'energised by teammates, loud and assertive in a group', hiZh: '被队友带动、在群体中活跃而坚定', tool: 'BFI / NEO PI-R' },
      { id: 'a', en: 'Agreeableness', zh: '宜人性', lo: 'blunt and confrontational when under pressure', loZh: '压力大时直接或对抗', hi: 'cooperative, trusted in the group, protects team harmony', hiZh: '合作、受群体信任、维护团队和谐', tool: 'BFI / Sport Personality Scale' },
      { id: 'n', en: 'Emotional stability', zh: '情绪稳定性', lo: 'worry and tension, mood swings after setbacks', loZh: '担忧紧张、挫折后情绪起伏', hi: 'stays composed, recovers quickly from mistakes', hiZh: '保持镇定、失误后迅速恢复', tool: 'BFI / Sport Personality Scale' }
    ];
    var pick = 'n';
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Which trait are you looking at?', '你要看哪一维？')) + '</div>' +
      tools(T5.map(function (t) { return [t.id, T(t.en, t.zh)]; }), pick) +
      srange('score', T('Score on this trait', '该维度得分'), 0, 100, 55, 1, '55 / 100') +
      '<div class="kv-zones"></div>' +
      '<div class="kv-q kv-q2">' + esc(T('The ends of the scale you selected', '你所选维度的两端')) + '</div>' +
      '<div class="kv-ends"></div>' +
      '<div class="kv-callout"></div>' +
      note('Traits are continua, not fixed categories. A measure is only useful if it is reliable (consistent results) and valid (evidence that it assesses what it claims to). Use it to find a development opportunity, never to label or rank an athlete — with consent, confidentiality and feedback.', '特质是连续维度，不是固定分类。一个测量工具只有在可靠（结果一致）且有效（有证据表明它测到了所声称的内容）时才有价值。用于发现可发展的方面，绝不用于给运动员贴标签或排名——并需知情同意、保密与反馈。');
    var inp = host.querySelector('input');
    function cur() { return T5.filter(function (t) { return t.id === pick; })[0]; }
    function draw() {
      var s = +inp.value, t = cur();
      setv(host, 'score', '.kv-v', s + ' / 100');
      marks(host, '.kv-tools', pick);
      var lvl = s < 20 ? 1 : s < 40 ? 2 : s < 60 ? 3 : s < 80 ? 4 : 5;
      host.querySelector('.kv-zones').innerHTML = T5.map(function (x) {
        return '<div class="kv-zone kv-z' + (x.id === pick ? lvl : 1) + (x.id === pick ? ' on' : '') + '">' +
          '<span class="kv-zn">' + x.id.toUpperCase() + '</span>' +
          '<span class="kv-zl">' + esc(T(x.en, x.zh)) + '<small>' + esc(x.tool) + '</small></span>' +
          '<b>' + (x.id === pick ? s : '') + '</b></div>';
      }).join('');
      var hi = s >= 60;
      host.querySelector('.kv-ends').innerHTML =
        '<div class="kv-side"><b>' + (hi ? esc(T('High end', '高端')) : esc(T('Low end', '低端'))) + '</b>' +
        '<p>' + esc(hi ? T(t.hi, t.hiZh) : T(t.lo, t.loZh)) + '</p></div>' +
        '<div class="kv-side"><b>' + esc(T('Typical instrument', '常用工具')) + '</b><p>' + esc(t.tool) + '</p>' +
        stars(hi ? 4 : 3) + '</div>';
      outs(host, '.kv-callout', T(t.en, t.zh) + ': ' + (hi ? T(t.hi, t.hiZh) : T(t.lo, t.loZh)) + '. ' +
        T('A score is a starting point for feedback, not a label.', '得分是反馈的起点，不是标签。'));
    }
    inp.addEventListener('input', draw);
    wire(host, '.kv-tools', function (v) { pick = v; inp.value = 55; draw(); });
    draw();
  };

  /* ══ 13 · C.1.1 Social learning and development ═══════════════════════
     The four processes between watching and doing, and how much a model
     influences them. */
  MODELS['Social learning and development'] = function (host) {
    var S = [
      { id: 0, en: 'Observation', zh: '观察', what: 'the athlete notices what the model does and takes in the relevant cues', whatZh: '运动员注意到模型的行为并接收相关线索', block: 'the demonstration is too fast, too far away, or the athlete is looking elsewhere', blockZh: '示范太快、太远，或运动员注意力在别处', coach: 'bring the model closer, slow the demonstration, repeat with one point in mind', coachZh: '让模型靠近、放慢示范、每次只强调一个要点' },
      { id: 1, en: 'Retention', zh: '保持', what: 'the action is encoded and can be recalled later without seeing it', whatZh: '动作被编码，之后不看示范也能回忆出来', block: 'no verbal label or image, so the action never becomes a memory', blockZh: '没有语言标签或表象，动作无法形成记忆', coach: 'name the key cue, add an image, review it later in the session', coachZh: '说出关键线索、加入表象，并在训练后回顾', },
      { id: 2, en: 'Reproduction', zh: '再现', what: 'the athlete can actually produce the action with their own body', whatZh: '运动员能用自己的身体真正做出该动作', block: 'the model is far more capable or experienced than the learner', blockZh: '示范者能力或经验远超学习者', coach: 'use a model the learner can physically copy, break the action into parts', coachZh: '选择学习者能实际模仿的模型，把动作拆成部分', },
      { id: 3, en: 'Consequences', zh: '后果', what: 'the athlete repeats the behaviour because of what followed it', whatZh: '运动员因为行为之后的结果而重复它', block: 'effort is not noticed, or the wrong behaviour is the one that is praised', blockZh: '努力没有被看见，或被表扬的恰恰是错误行为', coach: 'reward effort and strategy specifically, right after the attempt', coachZh: '在动作之后具体地表扬努力与策略' }
    ];
    var cur = 0;
    host.innerHTML =
      path([T('Observe', '观察'), T('Retain', '保持'), T('Reproduce', '再现'), T('Consequence', '后果')], 0) +
      srange('sim', T('How similar and successful is the model?', '模型有多相似、多成功？'), 0, 100, 55, 1, '55 / 100') +
      '<div class="kv-el-out"><dl>' +
      '<dt>' + esc(T('What happens', '发生什么')) + '</dt><dd class="vwhat"></dd>' +
      '<dt>' + esc(T('What blocks it', '什么会阻碍')) + '</dt><dd class="vblock"></dd>' +
      '<dt>' + esc(T('What the coach does', '教练怎么做')) + '</dt><dd class="vcoach"></dd>' +
      '</dl></div>' +
      meter(T('Modelling influence', '示范影响力'), 'infl') +
      '<div class="kv-callout"></div>' +
      note('Social learning theory proposes observation, retention, reproduction and consequences. A model who is similar or successful has more influence, which is why a peer in the same position can teach more than a star. Personality can also develop through maturation, experience, success, failure, feedback, deliberate practice and supportive social environments.', '社会学习理论提出观察、保持、再现与后果四个过程。相似或成功的模型影响力更大，因此同位置的同伴有时比明星更能教会人。人格也可通过成熟、经验、成功、失败、反馈、有意练习与支持性的社会环境发展。');
    var inp = host.querySelector('input');
    function draw() {
      var s = +inp.value, r = S[cur];
      setv(host, 'sim', '.kv-v', s + ' / 100');
      marks(host, '.kv-path', cur);
      outs(host, '.vwhat', T(r.what, r.whatZh));
      outs(host, '.vblock', T(r.block, r.blockZh));
      outs(host, '.vcoach', T(r.coach, r.coachZh));
      var infl = clamp(s / 100 * (cur === 3 ? 1 : 0.55 + s / 200), 0, 1);
      scaleBar(host.querySelector('.infl'), infl);
      outs(host, '.vinfl', Math.round(infl * 100) + ' %');
      outs(host, '.kv-callout', s < 35
        ? T('Low influence: the athlete is watching a model far removed from their own situation.', '影响力低：运动员观察到的模型与自身情境相距很远。')
        : T('Looks like: a first-year player copying a teammate two years above them, because that model is reachable and rewarded.', '例如：一名第一年队员模仿比自己高两届的队友，因为那个模型可接近、也得到回报。'));
    }
    inp.addEventListener('input', draw);
    wire(host, '.kv-path', function (v) { cur = +v; draw(); });
    draw();
  };

  /* ══ 14 · C.1.2 The five core attributes ═════════════════════════════
     The five Cs, and which one a pressure moment actually leans on. */
  MODELS['The five core attributes'] = function (host) {
    var A = [
      { id: 0, en: 'Challenge appraisal', zh: '挑战评价', dEn: 'seeing pressure as growth rather than threat', dZh: '把压力看作成长而非威胁', cue: 'this is a chance to show it', cueZh: '这是展示实力的机会' },
      { id: 1, en: 'Commitment', zh: '投入', dEn: 'staying with meaningful goals when it stops being easy', dZh: '在不再轻松时仍坚持有意义的目标', cue: 'I am still in this for the whole season', cueZh: '整个赛季我都还在为它付出' },
      { id: 2, en: 'Confidence', zh: '自信', dEn: 'trust in preparation, not in luck or comparison', dZh: '相信准备，而不是运气或比较', cue: 'I have done this before', cueZh: '我以前做到过' },
      { id: 3, en: 'Perceived control', zh: '感知控制', dEn: 'focusing on what can be influenced right now', dZh: '专注于当下能影响的部分', cue: 'my effort and decision are mine', cueZh: '努力和决定权在我手上' },
      { id: 4, en: 'Resilience', zh: '韧性', dEn: 'recovering after a setback and learning from it', dZh: '挫折后恢复并从中学习', cue: 'reset, then next action', cueZh: '重置，然后做下一个动作' }
    ];
    var M = [
      { id: 'penalty', en: 'a penalty', zh: '点球', key: 0, note: 'control first, then confidence', noteZh: '先控制，再自信' },
      { id: 'quarter', en: 'a close final quarter', zh: '第四节最后阶段', key: 2, note: 'challenge appraisal and confidence carry it', noteZh: '靠挑战评价与自信撑住' },
      { id: 'error', en: 'just made an error', zh: '刚出现失误', key: 4, note: 'resilience, then re-commitment', noteZh: '先韧性，再重新投入' },
      { id: 'finals', en: 'a season final', zh: '赛季决赛', key: 1, note: 'commitment to the goal that matters', noteZh: '对真正重要的目标保持投入' }
    ];
    var cur = 0, moment = 'quarter';
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Which pressure moment?', '哪个压力时刻？')) + '</div>' +
      seg(M.map(function (m) { return [m.id, T(m.en, m.zh)]; }), moment) +
      path([T('Challenge', '挑战'), T('Commitment', '投入'), T('Confidence', '自信'), T('Control', '控制'), T('Resilience', '韧性')], 0) +
      '<div class="kv-el-out"><dl>' +
      '<dt>' + esc(T('What it is', '含义')) + '</dt><dd class="vwhat"></dd>' +
      '<dt>' + esc(T('The cue an athlete uses', '运动员用的自我提示')) + '</dt><dd class="vcue"></dd>' +
      '</dl></div>' +
      '<div class="kv-callout"></div>' +
      note('A pressure moment may call on all five attributes, but the emphasis depends on the task and the person. Mental toughness is not a single score: it is a set of processes that can each be trained, and the relevant one changes with the situation.', '一个压力时刻可能需要全部五个方面，但重点取决于任务与人。心理韧性不是单一分数，而是一组可以分别训练的过程，且关键的那一个会随情境改变。');
    function draw() {
      var m = M.filter(function (x) { return x.id === moment; })[0], a = A[cur];
      marks(host, '.kv-path', cur);
      outs(host, '.vwhat', T(a.dEn, a.dZh));
      outs(host, '.vcue', T('“' + a.cue + '”', '“' + a.cueZh + '”'));
      outs(host, '.kv-callout', T(m.en, m.zh) + ' — ' + T(m.note, m.noteZh) + '. ' +
        T('Emphasis here: ', '此处的重点：') + T(a.en, a.zh) + '.');
    }
    wire(host, '.kv-path', function (v) { cur = +v; draw(); });
    wireSeg(host, function (v) { moment = v; cur = M.filter(function (x) { return x.id === v; })[0].key; draw(); });
    draw();
  };

  /* ══ 15 · C.1.2 Malleability and self-fulfilling belief ════════════════
     The loop runs in either direction, and belief strength sets the slope. */
  MODELS['Malleability and self-fulfilling belief'] = function (host) {
    var PX = 62, PW = 474, PY = 40, PH = 236, WKS = 12;
    function X(w) { return PX + w / WKS * PW; }
    function Y(v) { return PY + PH - clamp(v, -10, 110) / 120 * PH; }
    host.innerHTML =
      seg([['up', T('The loop builds confidence', '循环强化自信')], ['down', T('The loop erodes confidence', '循环削弱自信')]], 'up') +
      srange('s', T('Strength of the belief', '信念强度'), 0, 100, 60, 1, '60 / 100') +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Confidence and performance over time', '自信与表现随时间变化')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="gl" x1="' + PX + '" y1="' + Y(50) + '" x2="' + (PX + PW) + '" y2="' + Y(50) + '"/>' +
      '<text class="small" x="' + (PX - 8) + '" y="' + (Y(50) + 4) + '" text-anchor="end">50</text>' +
      '<path class="curve a" d=""/><path class="curve b" d=""/>' +
      '<text class="small" x="' + X(2.2) + '" y="' + (PY - 10) + '" id="l-a"></text>' +
      '<text class="small" x="' + (PX + PW - 4) + '" y="' + (Y(90) - 8) + '" text-anchor="end" id="l-b"></text>' +
      '<line class="kv-cursor" y1="' + (PY - 6) + '" y2="' + (PY + PH) + '"/>' +
      [0, 3, 6, 9, 12].map(function (w) {
        return '<text class="small" x="' + X(w).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="middle">' + w + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('weeks', '周')) + '</text>' +
      '</svg>' +
      '<div class="kv-legend">' +
      '<span><i class="kv-dot blue"></i>' + esc(T('confidence', '自信')) + '</span>' +
      '<span><i class="kv-dot red"></i>' + esc(T('performance', '表现')) + '</span></div>' +
      '<div class="kv-callout"></div>' +
      note('Mental toughness is malleable through goals, deliberate practice, reflection, challenge, stress management and feedback. A self-fulfilling prophecy happens when confidence increases effort, persistence and effective strategies, which improves performance and reinforces confidence. The MTQ48 is a 48-item self-report tool that identifies strengths and development areas — it does not guarantee an outcome.', '心理韧性可通过目标、有意练习、反思、挑战、压力管理与反馈发展。自我实现预言发生在自信提高努力、坚持与有效策略，进而提升表现并强化自信之时。MTQ48 是 48 题自评工具，用于识别优势与可发展之处，并不保证结果。');
    var inp = host.querySelector('input');
    function draw() {
      var s = +inp.value / 100, dir = host.querySelector('.kv-seg button[data-v=up]').getAttribute('aria-pressed') === 'true' ? 1 : -1;
      setv(host, 's', '.kv-v', Math.round(s * 100) + ' / 100');
      var k = 0.4 + s * 2.6 * dir, ca = '', cb = '', i, w, conf, perf, wob = [3, -4, 2, -5, 3, -2, 1, -4, 2, -2, 1, -3];
      for (i = 0; i <= 48; i++) {
        w = i * WKS / 48;
        conf = 50 + 40 * (1 - Math.exp(-k * w * 1.05));
        perf = 50 + 34 * (1 - Math.exp(-k * w * 0.5)) + wob[i % 12] * (1 - w / WKS * .6);
        ca += (i ? ' L' : 'M') + X(w).toFixed(1) + ',' + Y(conf).toFixed(1);
        cb += (i ? ' L' : 'M') + X(w).toFixed(1) + ',' + Y(clamp(perf, -10, 110)).toFixed(1);
      }
      host.querySelector('.curve.a').setAttribute('d', ca);
      host.querySelector('.curve.b').setAttribute('d', cb);
      outs(host, '#l-a', T('confidence rises first', '自信先上升'));
      outs(host, '#l-b', T('performance follows', '表现随后跟进'));
      host.querySelector('.kv-cursor').setAttribute('x1', X(WKS).toFixed(1));
      host.querySelector('.kv-cursor').setAttribute('x2', X(WKS).toFixed(1));
      var end = 50 + 40 * (1 - Math.exp(-k * WKS * 1.05));
      outs(host, '.kv-callout', dir > 0
        ? T('A learner who treats a hard routine as learnable practises more carefully, succeeds, and becomes more confident — the loop compounds. After 12 weeks confidence is at about ' + Math.round(end) + '.', '把困难套路视为可学习的动作，会让人练习得更仔细、更容易成功、进而更自信——循环会累积。12 周后自信约在 ' + Math.round(end) + '。')
        : T('The same loop runs the other way: a belief that ability is fixed reduces effort, effort drops, performance drops, and the belief looks confirmed. That is the self-fulfilling part.', '同一个循环也可以反向运行：能力固定的信念会减少努力，努力下降、表现下降，于是该信念似乎被证实——这正是“自我实现”的含义。'));
    }
    inp.addEventListener('input', draw);
    wireSeg(host, function () { draw(); });
    draw();
  };

  /* ══ 16 · C.1.2 Learned helplessness, attribution and health ══════════
     Pick the attribution after a miss; see the loop it feeds. */
  MODELS['Learned helplessness, attribution and health'] = function (host) {
    var A = [
      { id: 'iu', en: 'Internal, unstable', zh: '内部、不稳定', locus: T('internal', '内部'), stable: T('unstable — can change', '不稳定——可以改变'), ctrl: T('controllable', '可控'), eff: .85, col: 'var(--green)', why: 'the most adaptive option: it points at something the athlete can practise', whyZh: '最具适应性的选项：它指向运动员可以练习的东西' },
      { id: 'es', en: 'Internal, stable', zh: '内部、稳定', locus: T('internal', '内部'), stable: T('stable — will not change', '稳定——不会改变'), ctrl: T('not controllable', '不可控'), eff: .25, col: 'var(--amber)', why: 'self-blame: effort falls because the cause is seen as permanent', whyZh: '自责：因为原因被视为永久，努力随之下降' },
      { id: 'eu', en: 'External, unstable', zh: '外部、不稳定', locus: T('external', '外部'), stable: T('unstable — it can change', '不稳定——可以改变'), ctrl: T('partly controllable', '部分可控'), eff: .45, col: 'var(--amber)', why: 'the cause is outside the athlete, so practice feels pointless', whyZh: '原因在运动员之外，于是练习显得没有意义' },
      { id: 'ee', en: 'External, stable', zh: '外部、稳定', locus: T('external', '外部'), stable: T('stable — nothing to do with me', '稳定——与我无关'), ctrl: T('not controllable', '不可控'), eff: .18, col: 'var(--red)', why: 'bad luck, and the learned-helpless loop closes', whyZh: '归因于运气，习得性无助的循环就此闭合' }
    ];
    var pick = 'iu';
    var PX = 96, PY = 40, PW = 420, PH = 226;
    function X(v) { return PX + (v - 1) / 3 * PW; }
    function Y(v) { return PY + PH - (v - 1) / 3 * PH; }
    host.innerHTML =
      '<div class="kv-q">' + esc(T('A penalty is missed. What does the athlete say next?', '点球罚丢了。运动员接着会怎么说？')) + '</div>' +
      tools([['iu', T('“My routine needs adjusting”', '“我的动作需要调整”')],
      ['es', T('“I am not a penalty taker”', '“我不是点球手”')],
      ['eu', T('“The keeper was lucky”', '“守门员运气好”')],
      ['ee', T('“I always miss penalties”', '“我点球总是罚丢”')]], pick) +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Attribution on locus and stability', '归因在内外与稳定维度上的位置')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<line class="gl" x1="' + (PX + PW / 2) + '" y1="' + PY + '" x2="' + (PX + PW / 2) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="gl" x1="' + PX + '" y1="' + (PY + PH / 2) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH / 2) + '"/>' +
      '<text class="small" x="' + (PX - 10) + '" y="' + (PY + PH / 2) + '" text-anchor="end">' + esc(T('internal', '内部')) + '</text>' +
      '<text class="small" x="' + (PX + PW - 2) + '" y="' + (PY + PH / 2) + '" text-anchor="end">' + esc(T('external', '外部')) + '</text>' +
      '<text class="small" x="' + (PX + PW / 2) + '" y="' + (PY + PH + 20) + '" text-anchor="middle">' + esc(T('unstable — changeable', '不稳定——可改变')) + '</text>' +
      '<text class="small" x="' + (PX + PW / 2) + '" y="' + (PY - 10) + '" text-anchor="middle">' + esc(T('stable — permanent', '稳定——永久')) + '</text>' +
      '<circle class="marker" r="9" cx="0" cy="0"/>' +
      '</svg>' +
      meter(T('Motivation to practise again', '再次练习的动力'), 'mot') +
      meter(T('Support from the environment', '环境支持'), 'sup') +
      '<div class="kv-callout"></div>' +
      note('Learned helplessness develops when an athlete perceives no control, reduces effort and avoids challenge, which produces poorer performance and confirms the belief. Internal, unstable attributions are generally more adaptive than stable, external explanations. Higher mental toughness is associated with better stress management, fewer depressive or burnout symptoms, better sleep and positive mood.', '当运动员感知不到控制、减少努力、回避挑战时，就形成习得性无助；表现随之变差，反过来印证了原有信念。内部、不稳定的归因通常比稳定的外部解释更具适应性。较高的心理韧性与更好的压力管理、更少的抑郁或倦怠症状、更佳睡眠和积极情绪相关。');
    function draw() {
      var a = A.filter(function (x) { return x.id === pick; })[0];
      marks(host, '.kv-tools', pick);
      var lx = a.locus === T('internal', '内部') ? 2 : 4, ly = a.stable.indexOf('unstable') === 0 ? 2 : 4;
      var m = host.querySelector('.marker');
      m.setAttribute('cx', X(lx).toFixed(1)); m.setAttribute('cy', Y(ly).toFixed(1));
      m.style.fill = a.col; m.style.stroke = a.col;
      scaleBar(host.querySelector('.mot'), a.eff);
      scaleBar(host.querySelector('.sup'), a.eff * .9 + .05);
      outs(host, '.vmot', Math.round(a.eff * 100) + ' %');
      outs(host, '.vsup', Math.round((a.eff * .9 + .05) * 100) + ' %');
      outs(host, '.kv-callout', T(a.en, a.zh) + ' — ' + T(a.stable, a.stable) + ', ' + a.ctrl + '. ' + T(a.why, a.whyZh) + '.');
    }
    wire(host, '.kv-tools', function (v) { pick = v; draw(); });
    draw();
  };

  /* ══ 17 · C.2.1 Learning, performance and schemas ═════════════════════
     One skill, two curves: learning keeps rising, performance is noisy. */
  MODELS['Learning, performance and schemas'] = function (host) {
    var PX = 66, PW = 470, PY = 40, PH = 240, SESS = 12;
    function X(s) { return PX + s / SESS * PW; }
    function Y(v) { return PY + PH - clamp(v, 0, 100) / 100 * PH; }
    host.innerHTML =
      srange('sess', T('Sessions of practice', '训练课次'), 1, 12, 6, 1, '6 sessions') +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Learning and performance across sessions', '学习与表现随课次变化')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      [0, 25, 50, 75, 100].map(function (v) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(v) + '" x2="' + (PX + PW) + '" y2="' + Y(v) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>';
      }).join('') +
      '<path class="curve a" d=""/>' +
      '<path class="perf" d=""/>' +
      '<line class="kv-cursor" y1="' + (PY - 6) + '" y2="' + (PY + PH) + '"/>' +
      [1, 3, 6, 9, 12].map(function (s) {
        return '<text class="small" x="' + X(s).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="middle">' + s + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('sessions', '课次')) + '</text>' +
      '</svg>' +
      '<div class="kv-legend">' +
      '<span><i class="kv-dot blue"></i>' + esc(T('learning (the capability)', '学习（能力本身）')) + ' <b class="vl"></b></span>' +
      '<span><i class="kv-dot red"></i>' + esc(T('performance on the day', '当日表现')) + ' <b class="vp"></b></span></div>' +
      meter(T('Schema strength', '图式强度'), 'sch', 'gold') +
      '<div class="kv-callout"></div>' +
      note('Learning is a relatively permanent change in capability and keeps rising with practice. Performance is what can be produced at a particular moment, so it is affected by fatigue, motivation, stress and environment — it can drop even while learning continues. A schema is a generalised memory that guides recognition and response: a volleyball player uses it to choose a pass from the position of the set and the conditions.', '学习是能力的相对永久改变，会随练习持续上升。表现是当下能产出的东西，因此受疲劳、动机、压力与环境影响——即使学习仍在继续，表现也可能下降。图式是一种概括化的记忆，用于指导识别与反应：排球运动员依据来球位置和场上条件选择传球方式。');
    var inp = host.querySelector('input');
    function draw() {
      var s = +inp.value, i, x, learn, perf, d1 = '', d2 = '', noise = [9, -6, 5, -8, 6, -4, 3, -7, 5, -3, 2, -5];
      setv(host, 'sess', '.kv-val', s + ' ' + T(s === 1 ? 'session' : 'sessions', '课次'));
      for (i = 1; i <= 48; i++) {
        x = 1 + (s - 1) * i / 48;
        learn = 100 * (1 - Math.exp(-x * 0.26));
        perf = 100 * (1 - Math.exp(-x * 0.3)) + noise[Math.floor((x - 1) * 0.9) % 12] * (1 - x / s * .5);
        d1 += (i > 1 ? ' L' : 'M') + X(x).toFixed(1) + ',' + Y(learn).toFixed(1);
        d2 += (i > 1 ? ' L' : 'M') + X(x).toFixed(1) + ',' + Y(clamp(perf, 0, 100)).toFixed(1);
      }
      host.querySelector('.curve').setAttribute('d', d1);
      host.querySelector('.perf').setAttribute('d', d2);
      var cx = X(s).toFixed(1);
      host.querySelector('.kv-cursor').setAttribute('x1', cx);
      host.querySelector('.kv-cursor').setAttribute('x2', cx);
      var learn = 100 * (1 - Math.exp(-s * .26)), perf = 100 * (1 - Math.exp(-s * .3));
      outs(host, '.vl', Math.round(learn) + ' %');
      outs(host, '.vp', Math.round(clamp(perf + (s % 2 ? 4 : -3), 0, 100)) + ' %');
      scaleBar(host.querySelector('.sch'), learn / 100);
      outs(host, '.vsch', Math.round(learn) + ' %');
      outs(host, '.kv-callout', T('Looks like: session 2 can look worse than session 1 while the capability has already improved — that is performance, not learning.', '例如：第 2 节课可能比第 1 节看起来更差，但能力已经提高——那是表现，不是学习。') +
        ' ' + T('Schema strength ' + Math.round(learn) + ' %: the player now chooses the pass from the set position rather than guessing.', '图式强度 ' + Math.round(learn) + '%：队员开始根据来球位置选择传球，而不是靠猜。'));
    }
    inp.addEventListener('input', draw);
    draw();
  };

  /* ══ 18 · C.2.1 Linear and non-linear pedagogy ═══════════════════════
     Same goal, two ways of practising it: the environment decides how well
     the skill transfers. */
  MODELS['Linear and non-linear pedagogy'] = function (host) {
    var PX = 66, PW = 474, PY = 40, PH = 244, TRIALS = 10;
    function X(t) { return PX + t / TRIALS * PW; }
    host.innerHTML =
      seg([['linear', T('Linear (step-by-step)', '线性（逐步分解）')], ['nonlinear', T('Constraints-led (explore)', '约束引导（探索）')]], 'linear') +
      srange('var', T('How changeable is the environment?', '环境变化有多大？'), 0, 100, 30, 1, '30 / 100') +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Trials needed against a changing environment', '环境下所需尝试次数')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      [0, 25, 50, 75, 100].map(function (v) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(v) + '" x2="' + (PX + PW) + '" y2="' + Y(v) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>';
      }).join('') +
      '<path class="curve a" d=""/><path class="curve b" d=""/>' +
      '<text class="small" x="' + (PX + 10) + '" y="' + (Y(20) - 8) + '" id="c-a"></text>' +
      '<text class="small" x="' + (PX + 10) + '" y="' + (Y(75) - 8) + '" id="c-b"></text>' +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('environment variability', '环境变化程度')) + '</text>' +
      '</svg>' +
      meter(T('Transfer to a new environment', '迁移到新环境'), 'tr', 'gold') +
      meter(T('Trials needed to be consistent', '达到稳定所需尝试'), 'trials') +
      '<div class="kv-callout"></div>' +
      note('Linear pedagogy teaches a model step by step and suits predictable, self-paced skills. A constraints-led session keeps the goal and manipulates constraints on the performer, the task or the environment so the learner explores adaptations. Open-loop skills are planned before action; closed-loop skills use feedback during and after the movement.', '线性教学逐步教授一个模型，适合可预测的自定节奏技能。约束引导式训练保持目标不变，通过改变运动员、任务或环境的约束，让学习者探索适应方式。开放回路技能在动作前计划，闭环技能在动作中与动作后使用反馈。');
    var inp = host.querySelector('input');
    function Y(v) { return PY + PH - clamp(v, 0, 100) / 100 * PH; }
    function draw() {
      var v = +inp.value, lin = host.querySelector('.kv-seg button[data-v=linear]').getAttribute('aria-pressed') === 'true';
      setv(host, 'var', '.kv-v', v + ' / 100');
      var a = 18 + v * 0.72, b = 18 + v * 0.1, d1 = '', d2 = '', i;
      for (i = 0; i <= 40; i++) {
        var x = i * 100 / 40;
        d1 += (i ? ' L' : 'M') + X(x).toFixed(1) + ',' + Y(a).toFixed(1);
        d2 += (i ? ' L' : 'M') + X(x).toFixed(1) + ',' + Y(b).toFixed(1);
      }
      host.querySelector('.curve.a').setAttribute('d', d1);
      host.querySelector('.curve.b').setAttribute('d', d2);
      outs(host, '#c-a', T('linear', '线性'));
      outs(host, '#c-b', T('constraints-led', '约束引导'));
      var tr = lin ? 34 + v * 0.28 : 52 + v * 0.44;
      scaleBar(host.querySelector('.tr'), tr / 100);
      outs(host, '.vtr', Math.round(tr) + ' %');
      var trials = Math.round(lin ? 6 + v * 3.2 : 11 + v * 1.2);
      scaleBar(host.querySelector('.trials'), trials / 40);
      outs(host, '.vtrials', trials + ' ' + T('trials', '次尝试'));
      outs(host, '.kv-callout', lin
        ? T('Linear teaching is efficient in a stable environment: a clear model, few errors, fast consistency — but transfer stays low when the environment moves.', '线性教学在稳定环境中效率高：模型清晰、错误少、稳定得快——但环境一变，迁移能力就低。')
        : T('Constraints-led practice costs more trials up front and buys adaptability: the learner discovers which cues matter and transfers better.', '约束引导式练习前期尝试更多，换来的是适应力：学习者会发现哪些线索真正重要，迁移也更好。'));
    }
    inp.addEventListener('input', draw);
    wireSeg(host, function () { draw(); });
    draw();
  };

  /* ══ 19 · C.2.1 Stages, PRP and transfer ═════════════════════════════
     Three stages of practice, then what transfers to what. */
  MODELS['Stages, PRP and transfer'] = function (host) {
    var ST = [
      { id: 0, en: 'Cognitive', zh: '认知阶段', err: 46, speed: 34, guid: 88, cons: 22, dEn: 'many errors, slow, needs a lot of guidance', dZh: '错误多、速度慢、需要大量指导', stop: 'keep the task simple and the feedback frequent', stopZh: '任务保持简单，反馈保持频繁' },
      { id: 1, en: 'Associative', zh: '联结阶段', err: 20, speed: 68, guid: 52, cons: 62, dEn: 'refining the skill, fewer errors, becoming consistent', dZh: '打磨动作、错误减少、开始稳定', stop: 'reduce the guidance and start varying the conditions', stopZh: '减少指导，开始变化条件' },
      { id: 2, en: 'Autonomous', zh: '自主阶段', err: 8, speed: 94, guid: 18, cons: 90, dEn: 'automatic, consistent under pressure, less dependent on feedback', dZh: '自动化、压力下仍稳定、对反馈依赖减少', stop: 'stop once it is consistent, effective and transferable — overlearning creates stiffness', stopZh: '一旦稳定、有效且可迁移就停——过度练习会造成僵硬' }
    ];
    var TR = [
      { id: 's2s', en: 'Skill to skill', zh: '技能到技能', v: 1, ex: 'a chest pass helps a bounce pass', exZh: '胸前传球有助于双手抱球传球' },
      { id: 'p2p', en: 'Practice to performance', zh: '练习到表现', v: 1, ex: 'training under fatigue transfers to the last quarter', exZh: '在疲劳下训练可迁移到最后阶段' },
      { id: 'bil', en: 'Bilateral', zh: '双侧迁移', v: 1, ex: 'training the other leg protects the injured one', exZh: '训练另一侧腿可保护受伤腿' },
      { id: 's2s2', en: 'Stage to stage', zh: '阶段到阶段', v: 1, ex: 'balance learned earlier helps advanced gymnastics', exZh: '早期学到的平衡帮助完成高级体操' },
      { id: 'a2s', en: 'Abilities to skills', zh: '能力到技能', v: 1, ex: 'leg strength transfers to a jumping skill', exZh: '腿部力量迁移到跳跃技能' },
      { id: 'p2s', en: 'Principles to skills', zh: '原理到技能', v: -1, ex: 'a flat, stiff swing pattern fights an earlier wrist action', exZh: '平直僵硬的挥拍模式会与先前的腕部动作冲突' }
    ];
    var st = 0, tr = 's2s';
    host.innerHTML =
      path([T('Cognitive', '认知'), T('Associative', '联结'), T('Autonomous', '自主')], 0) +
      '<div class="kv-el-out"><dl><dt>' + esc(T('This stage looks like', '这个阶段的表现')) + '</dt><dd class="vstage"></dd>' +
      '<dt>' + esc(T('What to do in practice', '训练中该做什么')) + '</dt><dd class="vstop"></dd></dl></div>' +
      '<div class="kv-q kv-q2">' + esc(T('Practice chart', '练习图表')) + '</div>' +
      '<div class="kv-frows"></div>' +
      '<div class="kv-q kv-q2">' + esc(T('Which transfer?', '哪种迁移？')) + '</div>' +
      tools(TR.map(function (t) { return [t.id, T(t.en, t.zh)]; }), tr) +
      '<div class="kv-verdict"></div>' +
      '<div class="kv-callout"></div>' +
      note('The psychological refractory period means a second closely timed task can delay the first response, so a cognitive-stage athlete cannot yet do two things at once. Six transfer types exist; positive transfer helps and negative transfer can hinder, which is why practice should stop when the skill is consistent, effective and transferable.', '心理不应期意味着时间上紧邻的第二个任务会延迟第一个反应，因此认知阶段的运动员还不能同时做两件事。迁移有六种类型：正迁移有帮助，负迁移会妨碍——这正是技能稳定、有效且可迁移时就应该停止练习的原因。');
    function draw() {
      var s = ST[st], t = TR.filter(function (x) { return x.id === tr; })[0];
      marks(host, '.kv-path', st);
      marks(host, '.kv-tools', tr);
      outs(host, '.vstage', T(s.dEn, s.dZh));
      outs(host, '.vstop', T(s.stop, s.stopZh));
      host.querySelector('.kv-frows').innerHTML =
        frow(T('Errors', '错误'), 'err') + frow(T('Speed', '速度'), 'spd') +
        frow(T('Guidance needed', '所需指导'), 'gui') + frow(T('Consistency', '稳定性'), 'con');
      [['err', s.err, 'var(--c0)'], ['spd', s.speed, 'var(--c2)'], ['gui', s.guid, 'var(--c1)'], ['con', s.cons, 'var(--green)']].forEach(function (x) {
        bar(host.querySelector('.' + x[0]), x[1] / 100, x[2]);
        outs(host, '.v' + x[0], x[1] + ' %');
      });
      var v = host.querySelector('.kv-verdict');
      v.className = 'kv-verdict ' + (t.v > 0 ? 'good' : 'bad');
      v.textContent = (t.v > 0 ? T('Positive transfer: ', '正迁移：') : T('Negative transfer: ', '负迁移：')) + T(t.ex, t.exZh);
      outs(host, '.kv-callout', T('In the ' + s.en.toLowerCase() + ' stage the PRP still bites: two close tasks delay the second response.', '在' + s.zh + '，心理不应期仍在起作用：时间上紧邻的两个任务会延迟第二个反应。'));
    }
    wire(host, '.kv-path', function (v) { st = +v; draw(); });
    wire(host, '.kv-tools', function (v) { tr = v; draw(); });
    draw();
  };

  /* ══ 20 · C.2.2 Internal, external, broad and narrow ══════════════════
     Where the attention goes, and what it costs, for two different tasks. */
  MODELS['Internal, external, broad and narrow'] = function (host) {
    var TASK = [
      { id: 'penalty', en: 'a penalty', zh: '一次点球', focus: 'external', width: 'narrow', dEn: 'closed and self-paced: one target, no traffic', dZh: '封闭且自定节奏：只有一个目标，没有干扰' },
      { id: 'rally', en: 'a rally in a 5-a-side game', zh: '五人制比赛中的回合', focus: 'external', width: 'broad', dEn: 'open and dynamic: teammates, opponents and space all matter', dZh: '开放且动态：队友、对手与空间都很重要' }
    ];
    var focus = 'external', width = 'narrow', task = 'penalty', stage = 70;
    host.innerHTML =
      seg(TASK.map(function (t) { return [t.id, T(t.en, t.zh)]; }), task) +
      '<div class="kv-grid2">' +
      '<div class="ib-fw">' + tools([['internal', T('Internal — body', '内部——身体')], ['external', T('External — effect', '外部——效果')]], focus) + '</div>' +
      '<div class="ib-ww">' + tools([['broad', T('Broad — wide', '宽——广域')], ['narrow', T('Narrow — narrow', '窄——聚焦')]], width) + '</div>' +
      '</div>' +
      srange('skill', T('How skilled is the athlete?', '运动员的技术水平？'), 0, 100, 70, 1, '70 / 100') +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Attentional field in a penalty', '点球中的注意场')) + '">' +
      '<rect class="wide" x="30" y="30" width="500" height="86" rx="10"/>' +
      '<path class="cone" d=""/>' +
      '<rect class="goal" x="150" y="236" width="260" height="18" rx="4"/>' +
      '<line class="post" x1="150" y1="236" x2="150" y2="272"/><line class="post" x1="410" y1="236" x2="410" y2="272"/>' +
      '<circle class="spot" cx="280" cy="300" r="9"/>' +
      '<g class="body-marks"><circle class="joint" cx="272" cy="292" r="5"/><circle class="joint" cx="292" cy="294" r="5"/><circle class="joint" cx="280" cy="306" r="5"/></g>' +
      '<circle class="target" cx="196" cy="245" r="13"/>' +
      '<text class="small" x="196" y="228" text-anchor="middle" id="t-target"></text>' +
      '<text class="small" x="280" y="332" text-anchor="middle" id="t-body"></text>' +
      '<text class="small" x="30" y="20" id="t-task"></text>' +
      '</svg>' +
      meter(T('Attentional load', '注意负荷'), 'load') +
      meter(T('Performance for this task', '该任务下的表现'), 'perf', 'gold') +
      '<div class="kv-callout"></div>' +
      note('Internal attention is on the body and the technique, external attention on the effect or the target. Broad attention suits open, dynamic skills, narrow attention suits closed, self-paced tasks. External focus is generally more effective for skilled performance, while internal focus can help early learning.', '内部注意关注身体与技术，外部注意关注效果或目标。宽注意适合开放、动态的技能，窄注意适合封闭、自定节奏的任务。对技术熟练者，外部注意通常更有效；而在学习早期，内部注意可能更有帮助。');
    var inp = host.querySelector('input');
    function draw() {
      var t = TASK.filter(function (x) { return x.id === task; })[0];
      setv(host, 'skill', '.kv-v', stage + ' / 100');
      marks(host, '.ib-fw .kv-tools', focus);
      marks(host, '.ib-ww .kv-tools', width);
      marks(host, '.kv-seg', task);
      var wide = width === 'broad';
      host.querySelector('.wide').style.opacity = wide ? '.5' : '0';
      var cone = host.querySelector('.cone');
      cone.setAttribute('d', wide
        ? 'M280,300 L40,40 L520,40 Z'
        : 'M280,300 L206,236 L354,236 Z');
      cone.classList.toggle('narrow', !wide);
      host.querySelector('.body-marks').style.opacity = focus === 'internal' ? '1' : '.25';
      host.querySelector('.target').style.opacity = focus === 'external' ? '1' : '.25';
      outs(host, '#t-target', T('external target', '外部目标'));
      outs(host, '#t-body', T('internal: the body', '内部：身体'));
      outs(host, '#t-task', T(t.dEn, t.dZh));
      var load = (wide ? 78 : 26) + (focus === 'internal' ? 22 : 6);
      var match = (focus === t.focus ? 0 : 26) + (width === t.width ? 0 : 26);
      var perf = clamp(stage * .72 + 42 - match - (focus === 'internal' ? (100 - stage) * .22 : 0), 0, 100);
      scaleBar(host.querySelector('.load'), load / 100);
      outs(host, '.vload', load + ' %');
      scaleBar(host.querySelector('.perf'), perf / 100);
      outs(host, '.vperf', Math.round(perf) + ' %');
      outs(host, '.kv-callout',
        T('Best for this task: ', '该任务的最佳设置：') + T(t.focus, t.focus === 'external' ? '外部' : '内部') + ' · ' +
        T(t.width, t.width === 'broad' ? '宽' : '窄') + '. ' +
        (focus === t.focus && width === t.width
          ? T('Matches the recommendation — keep it.', '与建议一致——保持。')
          : T('Does not match: a long list of body instructions can overload attention.', '与建议不符：过多身体指令会使注意超载。')));
    }
    inp.addEventListener('input', draw);
    stage = 70;
    wire(host, '.ib-fw .kv-tools', function (v) { focus = v; draw(); });
    wire(host, '.ib-ww .kv-tools', function (v) { width = v; draw(); });
    wireSeg(host, function (v) { task = v; draw(); });
    draw();
  };

  /* ══ 21 · C.2.2 Distractors and control strategies ═══════════════════
     Pick the distraction, pick the strategy, watch the error rate. */
  MODELS['Distractors and control strategies'] = function (host) {
    var D = [
      { id: 'crowd', en: 'crowd noise', zh: '观众噪音', k: 'ext', load: 55, ex: 'a final with full stands', exZh: '满座的决赛' },
      { id: 'opponent', en: 'an opponent taunting', zh: '对手挑衅', k: 'ext', load: 48, ex: 'a rivalry match', exZh: '宿敌之战' },
      { id: 'photos', en: 'flash photography', zh: '闪光灯', k: 'ext', load: 22, ex: 'a presentation ceremony', exZh: '颁奖仪式' },
      { id: 'board', en: 'the scoreboard', zh: '记分牌', k: 'ext', load: 30, ex: 'a close match', exZh: '比分接近的比赛' },
      { id: 'ref', en: 'a referee decision', zh: '裁判判罚', k: 'ext', load: 44, ex: 'a disputed line call', exZh: '一次有争议的边线判罚' },
      { id: 'worry', en: 'worry about failing', zh: '担心失败', k: 'int', load: 62, ex: 'a penalty that decides the tie', exZh: '决定平局的一记点球' },
      { id: 'doubt', en: 'self-doubt', zh: '自我怀疑', k: 'int', load: 58, ex: 'after a bad first half', exZh: '上半场表现糟糕之后' },
      { id: 'last', en: 'the last mistake', zh: '上一次的失误', k: 'int', load: 50, ex: 'a double fault in the previous set', exZh: '上一盘的两次失误' },
      { id: 'fatigue', en: 'attention to fatigue or discomfort', zh: '过度关注疲劳或不适', k: 'int', load: 40, ex: 'a tight hamstring in the fourth quarter', exZh: '第四节腿后肌发紧' }
    ];
    var S = [
      { id: 'none', en: 'No strategy', zh: '不采取策略', cut: 0, dEn: 'the distraction stays and attention narrows', dZh: '分心持续存在，注意变窄' },
      { id: 'breath', en: 'Breathing', zh: '呼吸', cut: .22, dEn: 'lowers arousal, so fewer cues are lost', dZh: '降低唤醒，因此丢失的线索更少' },
      { id: 'routine', en: 'Pre-performance routine', zh: '赛前常规流程', cut: .32, dEn: 'a fixed sequence gives attention a job', dZh: '固定流程给注意力一个任务' },
      { id: 'cue', en: 'A focus cue', zh: '注意线索', cut: .26, dEn: 'one word or one target replaces the noise', dZh: '一个词或一个目标取代噪音' },
      { id: 'talk', en: 'Self-talk', zh: '自我对话', cut: .24, dEn: 'short, positive, present-tense instructions', dZh: '简短、积极、现在时的指令' },
      { id: 'process', en: 'Process goals', zh: '过程目标', cut: .30, dEn: 'focus moves to what the athlete controls', dZh: '注意力转向运动员能控制的部分' }
    ];
    var d = 'worry', s = 'routine';
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Which distraction?', '哪个分心因素？')) + '</div>' +
      '<div class="ib-dk">' + tools(D.map(function (x) { return [x.id, T(x.en, x.zh)]; }), d) + '</div>' +
      '<div class="kv-q kv-q2">' + esc(T('Which control strategy?', '用哪个控制策略？')) + '</div>' +
      '<div class="ib-sk">' + tools(S.map(function (x) { return [x.id, T(x.en, x.zh)]; }), s) + '</div>' +
      srange('ar', T('Arousal', '唤醒水平'), 0, 100, 60, 1, '60 / 100') +
      meter(T('Distraction still in attention', '仍在占用注意的分心'), 'load') +
      meter(T('Error rate', '错误率'), 'err', 'gold') +
      meter(T('Tunnel vision', '隧道视觉'), 'tun') +
      '<div class="kv-callout"></div>' +
      note('External distractors include crowd noise, movement, opponents, flash photography, flags, scoreboards and referee decisions. Internal distractors include worry, fear of failure, self-doubt, past errors, goal-irrelevant thoughts and excessive attention to fatigue. High arousal creates tunnel vision, fewer cues and poorer decisions.', '外部分心包括观众噪音、他人的动作、对手、闪光灯、旗帜、记分牌与裁判判罚。内部分心包括担忧、失败恐惧、自我怀疑、过去失误、与目标无关的想法，以及过度关注疲劳或不适。唤醒过高会造成隧道视觉、线索减少与决策变差。');
    var inp = host.querySelector('input');
    function draw() {
      var x = D.filter(function (y) { return y.id === d; })[0], st = S.filter(function (y) { return y.id === s; })[0], a = +inp.value;
      setv(host, 'ar', '.kv-v', a + ' / 100');
      marks(host, '.ib-dk .kv-tools', d); marks(host, '.ib-sk .kv-tools', s);
      var tun = a / 100 * .8;
      var load = clamp(x.load * (.6 + tun * .8) * (1 - st.cut), 0, 100);
      var err = clamp(load * .55 + tun * 18, 0, 100);
      scaleBar(host.querySelector('.load'), load / 100);
      scaleBar(host.querySelector('.err'), err / 100);
      scaleBar(host.querySelector('.tun'), tun);
      outs(host, '.vload', Math.round(load) + ' %');
      outs(host, '.verr', Math.round(err) + ' %');
      outs(host, '.vtun', Math.round(tun * 100) + ' %');
      outs(host, '.kv-callout', T(x.en, x.zh) + T(' (' + (x.k === 'ext' ? 'external' : 'internal') + ')', '（' + (x.k === 'ext' ? '外部' : '内部') + '）') +
        '. ' + T(st.en, st.zh) + ': ' + T(st.dEn, st.dZh) + '. ' +
        T('Looks like: ', '例如：') + T(x.ex, x.exZh) + '.');
    }
    inp.addEventListener('input', draw);
    wire(host, '.ib-dk .kv-tools', function (v) { d = v; draw(); });
    wire(host, '.ib-sk .kv-tools', function (v) { s = v; draw(); });
    draw();
  };

  /* ══ 22 · C.2.2 Task matching and self-talk ═══════════════════════════
     The task picks the attentional width; self-talk moves arousal. */
  MODELS['Task matching and self-talk'] = function (host) {
    var TASK = [
      { id: 'invasion', en: 'invasion game', zh: '入侵型项目', w: 'broad', ar: 62, dEn: 'read teammates, opponents and space', dZh: '要读队友、对手与空间' },
      { id: 'penalty', en: 'penalty / free throw', zh: '点球 / 罚球', w: 'narrow', ar: 40, dEn: 'one target, one routine, no traffic', dZh: '一个目标、一套流程、没有干扰' },
      { id: 'set', en: 'set play', zh: '定位球战术', w: 'narrow', ar: 48, dEn: 'a rehearsed pattern with assigned roles', dZh: '有固定角色分配的排练套路' },
      { id: 'dive', en: 'dive or long jump', zh: '跳水 / 跳远', w: 'narrow', ar: 30, dEn: 'precision: the run-up and the board must be exact', dZh: '精确性要求：助跑与起跳板必须精准' }
    ];
    var TALK = [
      { id: 'dont', en: '“Do not miss”', zh: '“别罚失”', ar: 88, ctrl: 8, dEn: 'raises anxiety, and the result is not controllable', dZh: '提高焦虑，而结果并不可控' },
      { id: 'calm', en: '“Calm and focused”', zh: '“冷静且专注”', ar: 34, ctrl: 82, dEn: 'controllable and task-relevant', dZh: '可控且与任务相关' },
      { id: 'target', en: '“See the target”', zh: '“看着目标”', ar: 42, ctrl: 92, dEn: 'external focus and directly controllable', dZh: '外部注意，且直接可控' },
      { id: 'lift', en: '“Lift and accelerate”', zh: '“抬高并加速”', ar: 74, ctrl: 88, dEn: 'a controllable cue for a power task', dZh: '力量型项目的可控线索' },
      { id: 'hustle', en: '“Hustle”', zh: '“拼一点”', ar: 70, ctrl: 64, dEn: 'effort-focused, works for a long task', dZh: '聚焦努力，适合长时间任务' }
    ];
    var task = 'penalty', talk = 'target';
    var PX = 68, PW = 456, PY = 34, PH = 250;
    function X(a) { return PX + a / 100 * PW; }
    function Y(c) { return PY + PH - c / 100 * PH; }
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Which task?', '哪个任务？')) + '</div>' +
      seg(TASK.map(function (t) { return [t.id, T(t.en, t.zh)]; }), task) +
      '<div class="kv-q kv-q2">' + esc(T('What does the athlete say to themselves?', '运动员对自己说什么？')) + '</div>' +
      tools(TALK.map(function (t) { return [t.id, T(t.en, t.zh)]; }), talk) +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Self-talk on arousal and controllability', '自我对话在唤醒与可控性上的位置')) + '">' +
      '<rect class="zone" x="' + PX + '" y="' + PY + '" width="' + PW + '" height="' + PH + '"/>' +
      '<rect class="target-zone" x=""/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 20) + '" text-anchor="end">' + esc(T('arousal', '唤醒')) + '</text>' +
      '<text class="small" x="' + (PX - 10) + '" y="' + (PY + 4) + '" text-anchor="end">' + esc(T('controllable', '可控') ) + '</text>' +
      '<g class="dots"></g>' +
      '<circle class="chosen" r="10" cx="0" cy="0"/>' +
      '</svg>' +
      meter(T('Likely performance', '预期表现'), 'perf', 'gold') +
      '<div class="kv-callout"></div>' +
      note('Use a broad external focus in invasion games and team sports to read teammates and opponents; use a narrow external focus for a penalty, free throw or set play. Self-talk such as “do not miss” can increase anxiety, while “calm and focused” or “see the target” is controllable and task-relevant.', '入侵型项目与团队项目使用宽的外部注意来读队友与对手；点球、罚球或定位球战术使用窄的外部注意。“别罚失”之类的自我对话会提高焦虑，而“冷静且专注”“看着目标”既可控又与任务相关。');
    function draw() {
      var t = TASK.filter(function (x) { return x.id === task; })[0], k = TALK.filter(function (x) { return x.id === talk; })[0];
      marks(host, '.kv-seg', task); marks(host, '.kv-tools', talk);
      var wm = t.w === 'narrow' ? 16 : 60;
      host.querySelector('.target-zone').setAttribute('x', X(t.ar - wm).toFixed(1));
      host.querySelector('.target-zone').setAttribute('width', (X(t.ar + wm) - X(t.ar - wm)).toFixed(1));
      host.querySelector('.target-zone').setAttribute('y', PY);
      host.querySelector('.target-zone').setAttribute('height', PH);
      host.querySelector('.dots').innerHTML = TALK.map(function (x) {
        return '<circle class="dot" data-id="' + x.id + '" cx="' + X(x.ar).toFixed(1) + '" cy="' + Y(x.ctrl).toFixed(1) + '" r="5"/>';
      }).join('');
      $$('.dot', host).forEach(function (d) { d.classList.toggle('on', d.getAttribute('data-id') === talk); });
      var c = host.querySelector('.chosen');
      c.setAttribute('cx', X(k.ar).toFixed(1)); c.setAttribute('cy', Y(k.ctrl).toFixed(1));
      var fit = Math.abs(k.ar - t.ar) / 60, ctrl = k.ctrl / 100;
      var perf = clamp(96 - fit * 46 + (ctrl - .5) * 26, 0, 100);
      scaleBar(host.querySelector('.perf'), perf / 100);
      outs(host, '.vperf', Math.round(perf) + ' %');
      outs(host, '.kv-callout', T(t.en, t.zh) + ' — ' + T(t.dEn, t.dZh) + '. ' + T(k.en, k.zh) + ': ' + T(k.dEn, k.dZh) + '. ' +
        T('Width that fits: ', '合适的注意宽度：') + T(t.w, t.w === 'broad' ? '宽' : '窄') + '.');
    }
    wireSeg(host, function (v) { task = v; draw(); });
    wire(host, '.kv-tools', function (v) { talk = v; draw(); });
    draw();
  };

  /* ══ 23 · C.3.1 Need achievement and orientations ═════════════════════
     Task choice, persistence and what feedback an orientation seeks. */
  MODELS['Need achievement and orientations'] = function (host) {
    var O = {
      task: { en: 'Task-oriented', zh: '任务定向', keep: 'improves after a win, keeps working after a loss', keepZh: '胜利后继续提高，失败后继续努力', ask: 'informational — what improved and what to change', askZh: '信息型——什么提高了，下一步改什么' },
      ego: { en: 'Ego-oriented', zh: '自我定向', keep: 'risk-averse after a loss, effort drops when winning looks easy', keepZh: '失败后回避风险 winning 看起来容易时努力下降', ask: 'normative — whether they won or lost against others', askZh: '规范型——相对他人是赢是输' }
    };
    var orient = 'task';
    var PX = 66, PW = 468, PY = 40, PH = 232;
    function X(p) { return PX + p / 100 * PW; }
    function Y(v) { return PY + PH - v / 100 * PH; }
    function curve(k) {
      var d = '', i;
      for (i = 0; i <= 40; i++) { var x = i * 2.5; d += (i ? ' L' : 'M') + X(x).toFixed(1) + ',' + Y(100 * Math.exp(-Math.pow(x - 50, 2) / (2 * k * k))).toFixed(1); }
      return d;
    }
    host.innerHTML =
      seg([['task', T('Task orientation', '任务定向')], ['ego', T('Ego orientation', '自我定向')]], orient) +
      srange('d', T('How hard does the task feel?', '任务感觉有多难？'), 0, 100, 55, 1, '55 / 100') +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Chosen task difficulty against probability of success', '选择的任务难度与成功概率')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<path class="curve a" d="' + curve(22) + '"/>' +
      '<line class="kv-cursor" y1="' + (PY - 6) + '" y2="' + (PY + PH) + '"/>' +
      '<circle class="marker" r="8" cx="0" cy="0"/>' +
      [0, 25, 50, 75, 100].map(function (v) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(v) + '" x2="' + (PX + PW) + '" y2="' + Y(v) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 20) + '" text-anchor="end">' + esc(T('probability of success', '成功概率')) + '</text>' +
      '<text class="small" x="' + (PX + 6) + '" y="' + (PY - 10) + '">' + esc(T('chose this task', '选择该任务')) + '</text>' +
      '</svg>' +
      meter(T('Effort and persistence', '努力与坚持'), 'eff') +
      meter(T('Enjoyment of the session', '训练愉悦感'), 'joy', 'gold') +
      '<div class="kv-callout"></div>' +
      note('Need for achievement is a relatively stable personality factor, but situational factors — task difficulty, goals, feedback, social climate, rewards and norms — decide how an athlete behaves. People high in need for achievement tend to choose tasks of moderate difficulty, where success is likely but not guaranteed.', '成就需要是相对稳定的人格因素，但情境因素——任务难度、目标、反馈、社会氛围、奖励与规范——决定运动员的行为。成就需要较高者倾向选择中等难度的任务：成功可能性大，又不是十拿九稳。');
    var inp = host.querySelector('input');
    function draw() {
      var d = +inp.value, o = O[orient], task = orient === 'task';
      setv(host, 'd', '.kv-val', d + ' / 100');
      marks(host, '.kv-seg', orient);
      var want = task ? 50 + Math.abs(d - 55) * .35 : clamp(88 - d * .7, 12, 95);
      var m = host.querySelector('.marker');
      m.setAttribute('cx', X(want).toFixed(1));
      m.setAttribute('cy', Y(100 * Math.exp(-Math.pow(want - 50, 2) / (2 * 22 * 22))).toFixed(1));
      var eff = clamp(58 + (task ? 26 : 6) - Math.abs(d - want) * .35, 0, 100);
      var joy = clamp(48 + (task ? 34 : 4) - Math.abs(d - want) * .2, 0, 100);
      scaleBar(host.querySelector('.eff'), eff / 100);
      scaleBar(host.querySelector('.joy'), joy / 100);
      outs(host, '.veff', Math.round(eff) + ' %');
      outs(host, '.vjoy', Math.round(joy) + ' %');
      outs(host, '.kv-callout', T(o.en, o.zh) + ' — ' + T(o.keep, o.keepZh) + '. ' +
        T('Feedback sought: ', '寻求的反馈：') + T(o.ask, o.askZh) + '. ' +
        T('Looks like: ', '例如：') + T('after a difficult session, a task-oriented athlete asks what to change; an ego-oriented athlete asks who did better.',
          '一次困难训练后，任务定向的运动员会问“下一步改什么”；自我定向的运动员会问“谁做得更好”。'));
    }
    inp.addEventListener('input', draw);
    wireSeg(host, function (v) { orient = v; draw(); });
    draw();
  };

  /* ══ 24 · C.3.1 High ego with low ability ════════════════════════════
     The combination that costs the most, and what the coach can say. */
  MODELS['High ego with low ability and coach influence'] = function (host) {
    var SAY = [
      { id: 'best', en: '“You are the best”', zh: '“你是最强的”', dEn: 'a controlling comparison message: the athlete is defined by winning, so a loss threatens self-worth', dZh: '强制性的比较信息：运动员的价值被胜负定义，失败就威胁自我价值', eff: 34, anx: 74, good: false },
      { id: 'prep', en: '“Your preparation and decision improved this set”', zh: '“你的准备和决策让这一节变好了”', dEn: 'informational and process-focused: it names something the athlete actually did', dZh: '信息型且聚焦过程：指出运动员真正做到的事', eff: 82, anx: 38, good: true },
      { id: 'none', en: 'Say nothing', zh: '不评价', dEn: 'no message: the athlete keeps the belief it brought in', dZh: '没有信息：运动员保留自己原有的信念', eff: 48, anx: 58, good: false }
    ];
    var say = 'prep';
    var PX = 70, PW = 460, PY = 40, PH = 236;
    function X(v) { return PX + v / 100 * PW; }
    function Y(v) { return PY + PH - v / 100 * PH; }
    host.innerHTML =
      '<div class="kv-grid2">' +
      srange('ego', T('Ego orientation', '自我定向'), 0, 100, 70, 1, '70 / 100') +
      srange('ab', T('Perceived ability', '感知能力'), 0, 100, 35, 1, '35 / 100') +
      '</div>' +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Approach behaviour against ego orientation and ability', '趋近行为随自我定向与能力变化')) + '">' +
      '<rect class="q1" x="' + PX + '" y="' + PY + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<rect class="q2" x="' + (PX + PW / 2).toFixed(1) + '" y="' + PY + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<rect class="q2" x="' + PX + '" y="' + (PY + PH / 2).toFixed(1) + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<rect class="q1" x="' + (PX + PW / 2).toFixed(1) + '" y="' + (PY + PH / 2).toFixed(1) + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<circle class="marker" r="9" cx="0" cy="0"/>' +
      '<text class="small" x="' + (PX + 12) + '" y="' + (PY + 20) + '">' + esc(T('low ability', '能力低')) + '</text>' +
      '<text class="small" x="' + (PX + PW - 12) + '" y="' + (PY + 20) + '" text-anchor="end">' + esc(T('high ability', '能力高')) + '</text>' +
      '<text class="small" x="' + (PX + 12) + '" y="' + (PY + PH - 10) + '">' + esc(T('effort falls', '努力下降')) + '</text>' +
      '<text class="small" x="' + (PX + PW - 12) + '" y="' + (PY + PH - 10) + '" text-anchor="end">' + esc(T('approach grows', '趋近增加')) + '</text>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('perceived ability', '感知能力')) + '</text>' +
      '</svg>' +
      '<div class="kv-q kv-q2">' + esc(T('What does the coach say?', '教练说什么？')) + '</div>' +
      tools(SAY.map(function (x) { return [x.id, T(x.en, x.zh)]; }), say) +
      meter(T('Approach behaviour', '趋近行为'), 'app') +
      meter(T('Anxiety before the next session', '下次训练前的焦虑'), 'anx', 'gold') +
      '<div class="kv-callout"></div>' +
      note('High ego orientation with low perceived ability can increase anxiety, reduce effort, encourage excuses and blame, lead to withdrawal and limit potential. Coaches can change the pattern with personal and process goals, task difficulty that matches the athlete, specific constructive feedback, rewarding effort and improvement, and a climate of support and teamwork.', '自我定向高而感知能力低，会提高焦虑、减少努力、助长借口与推责，导致退缩并限制潜力。教练可以通过个人与过程目标、与运动员水平匹配的任务难度、具体而有建设性的反馈、奖励努力与进步，以及支持与团队合作的氛围来改变这种模式。');
    var ins = $$('input[type=range]', host);
    function draw() {
      var ego = +ins[0].value, ab = +ins[1].value, x = SAY.filter(function (z) { return z.id === say; })[0];
      setv(host, 'ego', '.kv-v', ego + ' / 100');
      setv(host, 'ab', '.kv-v', ab + ' / 100');
      marks(host, '.kv-tools', say);
      var base = clamp(30 + ab * .58 + (100 - ego) * .22, 0, 100);
      var m = host.querySelector('.marker');
      m.setAttribute('cx', X(ab).toFixed(1));
      m.setAttribute('cy', Y(base).toFixed(1));
      m.classList.toggle('ok', base > 55);
      m.classList.toggle('risk', base <= 55);
      var eff = clamp(base * .6 + x.eff * .4, 0, 100), anx = clamp(100 - eff * .8 + (100 - x.good * 100) * 18, 0, 100);
      scaleBar(host.querySelector('.app'), eff / 100);
      scaleBar(host.querySelector('.anx'), anx / 100);
      outs(host, '.vapp', Math.round(eff) + ' %');
      outs(host, '.vanx', Math.round(anx) + ' %');
      outs(host, '.kv-callout', T(x.en, x.zh) + ' — ' + T(x.dEn, x.dZh) + '. ' +
        (eff < 55 ? T('This is where excuses, blame and withdrawal start.', '这正是借口、推责与退缩开始的地方。')
          : T('The message matches the behaviour it wants.', '这条信息与它想要的行为一致。')));
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); });
    wire(host, '.kv-tools', function (v) { say = v; draw(); });
    draw();
  };

  /* ══ 25 · C.3.1 Coaching the environment ══════════════════════════════
     Toggle what the club rewards and watch the climate move. */
  MODELS['Coaching the environment'] = function (host) {
    var P = [
      { id: 'effort', en: 'Rewards effort and improvement', zh: '奖励努力与进步', m: 1, dEn: 'effort and progress are what count', dZh: '努力与进步才算数' },
      { id: 'learning', en: 'Values learning and progress', zh: '重视学习与进步', m: 1, dEn: 'the club says learning is the point', dZh: '俱乐部明确表示学习才是目的' },
      { id: 'support', en: 'Encourages support and respect', zh: '鼓励支持与尊重', m: 1, dEn: 'teammates are valued over results', dZh: '队友比成绩更受重视' },
      { id: 'personal', en: 'Sets personal and process goals', zh: '设定个人与过程目标', m: 1, dEn: 'standards the athlete can control', dZh: '标准是运动员能控制的' },
      { id: 'difficulty', en: 'Matches task difficulty', zh: '匹配任务难度', m: 1, dEn: 'challenge that can be taken on', dZh: '有挑战但能应对' },
      { id: 'winning', en: 'Rewards winning only', zh: '只奖励获胜', m: -1, dEn: 'results are the only thing recognised', dZh: '只有成绩会被认可' },
      { id: 'ranking', en: 'Ranks athletes publicly', zh: '公开排名', m: -1, dEn: 'comparison becomes the message', dZh: '比较成了核心信息' },
      { id: 'blame', en: 'Blames the weakest player', zh: '责怪最弱的队员', m: -1, dEn: 'effort disappears when it is punished', dZh: '努力在被惩罚时消失' }
    ];
    var on = { effort: 1, learning: 1, support: 0, personal: 1, difficulty: 1, winning: 0, ranking: 0, blame: 0 };
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Which of these does the club actually do?', '俱乐部实际在做哪些？')) + '</div>' +
      '<div class="ib-practices">' + P.map(function (p) {
        return '<button type="button" data-v="' + p.id + '" aria-pressed="' + (on[p.id] ? 'true' : 'false') + '" class="' + (on[p.id] ? 'on' : '') + '">' + esc(T(p.en, p.zh)) + '</button>';
      }).join('') + '</div>' +
      '<div class="kv-climate">' +
      '<div class="kv-cl-row"><span>' + esc(T('mastery climate', '掌握氛围')) + '</span><div class="kv-bar"><i class="cm"></i></div><b class="vcm"></b></div>' +
      '<div class="kv-cl-row"><span>' + esc(T('ego climate', '自我氛围')) + '</span><div class="kv-bar"><i class="ce"></i></div><b class="vce"></b></div></div>' +
      meter(T('Persistence and effort', '坚持与努力'), 'per') +
      meter(T('Enjoyment and wellbeing', '愉悦与幸福感'), 'joy', 'gold') +
      meter(T('Likelihood of staying in the sport', '继续参与的可能性'), 'ret') +
      '<div class="kv-callout"></div>' +
      note('A coach can vary difficulty, set personal and process goals, give feedback on improvement, encourage support and respect, reward effort and sportsmanship and value learning and progress — and those choices encourage challenge, effort, persistence and positive emotion. Reward structure, norms, social climate and task design all send messages about what is valued.', '教练可以调整难度、设定个人与过程目标、就进步给予反馈、鼓励支持与尊重、奖励努力与体育道德，并重视学习与进步——这些选择会鼓励挑战、努力、坚持与积极情绪。奖励结构、规范、社会氛围与任务设计都会传递“什么被重视”的信息。');
    function draw() {
      var m = 0, i, p;
      $$('.ib-practices button', host).forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('aria-pressed') === 'true');
      });
      for (i = 0; i < P.length; i++) {
        p = P[i];
        m += (on[p.id] ? 1 : 0) * p.m;
      }
      var mastery = clamp(50 + m * 12.5, 0, 100), ego = clamp(50 - m * 12.5, 0, 100);
      var per = clamp(mastery * .8 + 20, 0, 100), joy = clamp(mastery * .85 + 12, 0, 100), ret = clamp(mastery * .9 + 8, 0, 100);
      scaleBar(host.querySelector('.cm'), mastery / 100);
      host.querySelector('.cm').style.background = 'var(--green)';
      scaleBar(host.querySelector('.ce'), ego / 100);
      host.querySelector('.ce').style.background = 'var(--c0)';
      outs(host, '.vcm', Math.round(mastery) + ' %');
      outs(host, '.vce', Math.round(ego) + ' %');
      scaleBar(host.querySelector('.per'), per / 100);
      scaleBar(host.querySelector('.joy'), joy / 100);
      scaleBar(host.querySelector('.ret'), ret / 100);
      outs(host, '.vper', Math.round(per) + ' %');
      outs(host, '.vjoy', Math.round(joy) + ' %');
      outs(host, '.vret', Math.round(ret) + ' %');
      outs(host, '.kv-callout',
        mastery > 62 ? T('A mastery climate: effort, cooperation, improvement and enjoyment are what count.', '掌握氛围：努力、合作、进步与愉悦才是被认可的东西。')
          : ego > 62 ? T('An ego climate: comparison and winning dominate, and anxiety, burnout and dropout rise.', '自我氛围：比较与获胜主导一切，焦虑、倦怠与退出上升。')
            : T('A mixed climate: the message the athletes receive is inconsistent.', '混合氛围：运动员收到的信息前后不一致。'));
    }
    wire(host, '.ib-practices', function (v) { on[v] = on[v] ? 0 : 1; draw(); });
    draw();
  };

  /* ══ 26 · C.3.2 Three basic needs and continuum ══════════════════════
     Three needs, a frustration profile, and a place on the continuum. */
  MODELS['Three basic needs and continuum'] = function (host) {
    var N = [
      { id: 'auto', en: 'Autonomy', zh: '自主', dEn: 'experiencing choice and volition', dZh: '体验选择与自愿' },
      { id: 'comp', en: 'Competence', zh: '胜任', dEn: 'feeling effective and able to improve', dZh: '感到有效并能进步' },
      { id: 'rel', en: 'Relatedness', zh: '联结', dEn: 'feeling connected, valued and supported', dZh: '感到有联结、被重视与支持' }
    ];
    var C = [
      { id: 'amot', w: 100, en: 'Amotivation', zh: '无动机' },
      { id: 'ext', w: 84, en: 'External regulation', zh: '外部调节' },
      { id: 'intro', w: 68, en: 'Introjected', zh: '内摄' },
      { id: 'ident', w: 52, en: 'Identified', zh: '认同' },
      { id: 'integ', w: 36, en: 'Integrated', zh: '整合' },
      { id: 'intro3', w: 20, en: 'Intrinsic', zh: '内在' }
    ];
    host.innerHTML =
      '<div class="kv-q">' + esc(T('How satisfied are the three needs here?', '这里三个需要的满足程度如何？')) + '</div>' +
      '<div class="kv-grid2">' +
      srange('auto', T('Autonomy', '自主'), 0, 100, 70, 1, '70 / 100') +
      srange('comp', T('Competence', '胜任'), 0, 100, 70, 1, '70 / 100') +
      '</div>' +
      srange('rel', T('Relatedness', '联结'), 0, 100, 70, 1, '70 / 100') +
      '<div class="kv-q kv-q2">' + esc(T('Where the athlete lands', '运动员落在哪一段')) + '</div>' +
      pyr(C.map(function (c, i) { return [T(c.en, c.zh), c.w, '', false, 'kv-gA']; })) +
      meter(T('Motivation quality', '动机质量'), 'mq', 'gold') +
      meter(T('Persistence and enjoyment', '坚持与愉悦'), 'pe') +
      meter(T('Mental health load', '心理负担'), 'mh') +
      '<div class="kv-callout"></div>' +
      note('Autonomy is feeling in control with real choice, competence is feeling effective and able to master challenges, and relatedness is feeling connected and valued. Need satisfaction supports autonomous motivation, persistence, enjoyment and mental health; need frustration moves the athlete toward controlled motivation and away from wellbeing.', '自主是感到掌控并有真实选择，胜任是感到有效并能掌握挑战，联结是感到有归属、被重视。需要满足支持自主动机、坚持、愉悦与心理健康；需要受挫会把运动员推向受控动机，远离幸福感。');
    var ins = $$('input[type=range]', host);
    function draw() {
      var a = +ins[0].value, c = +ins[1].value, r = +ins[2].value;
      setv(host, 'auto', '.kv-v', a + ' / 100');
      setv(host, 'comp', '.kv-v', c + ' / 100');
      setv(host, 'rel', '.kv-v', r + ' / 100');
      var sat = (a + c + r) / 300, frustr = 1 - sat;
      var idx = clamp(Math.round(frustr * 5.2), 0, 5), row = C[idx];
      $$('.kv-lv', host).forEach(function (n, i) { n.classList.toggle('on', i === idx); });
      var mq = clamp(sat * 100, 0, 100), pe = clamp(30 + mq * .62, 0, 100), mh = clamp(frustr * 86, 0, 100);
      scaleBar(host.querySelector('.mq'), mq / 100);
      scaleBar(host.querySelector('.pe'), pe / 100);
      scaleBar(host.querySelector('.mh'), mh / 100);
      outs(host, '.vmq', Math.round(mq) + ' %');
      outs(host, '.vpe', Math.round(pe) + ' %');
      outs(host, '.vmh', Math.round(mh) + ' %');
      outs(host, '.kv-callout',
        (a < 35 || c < 35 || r < 35) ? T('One need is frustrated — that is enough to move the athlete down the continuum.', '只要有一个需要受挫，就足以把运动员拉低到连续体的下一段。')
          : sat > .74 ? T('All three are reasonably satisfied, so the motivation is self-endorsed: ' + T(row.en, row.zh) + '.', '三个需要都得到较好的满足，因此动机是自我认可的：' + T(row.en, row.zh) + '。')
            : T('Mixed: ' + T(row.en, row.zh) + '. Partial frustration shows up as inconsistent effort across the week.', '情况混合：' + T(row.en, row.zh) + '。部分受挫会表现为一周内努力不稳定。'));
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); });
    draw();
  };

  /* ══ 27 · C.3.2 Controlled, autonomous, four regulations ═══════════════
     The continuum over months, and what a controlling reward does to it. */
  MODELS['Controlled, autonomous and four extrinsic regulations'] = function (host) {
    var C = [
      { id: 'amot', w: 100, en: 'Amotivation', zh: '无动机', q: '“I do not see the point”', qZh: '“我看不到意义”' },
      { id: 'ext', w: 84, en: 'External — I must', zh: '外部——“我不得不”', q: '“I train or I am dropped”', qZh: '“不训练就会被淘汰”' },
      { id: 'intro', w: 68, en: 'Introjected — guilt', zh: '内摄——内疚', q: '“I would feel bad if I did not”', qZh: '“不做我会内疚”' },
      { id: 'ident', w: 52, en: 'Identified — I should', zh: '认同——“我应该”', q: '“it matters to me, so I do it”', qZh: '“这对我重要，所以我做”' },
      { id: 'integ', w: 36, en: 'Integrated — I value it', zh: '整合——“我重视它”', q: '“it fits who I am”', qZh: '“它符合我是谁”' },
      { id: 'intro3', w: 20, en: 'Intrinsic — I want to', zh: '内在——“我就是想”', q: '“the activity itself is the reward”', qZh: '“活动本身就是回报”' }
    ];
    var reward = 0, weeks = 6;
    host.innerHTML =
      srange('w', T('Weeks of participation', '参与周数'), 1, 12, 6, 1, '6 weeks') +
      '<div class="kv-q kv-q2">' + esc(T('Has a controlling reward been introduced?', '是否引入了强制性奖励？')) + '</div>' +
      tools([['no', T('No — informational feedback and choice', '否——信息型反馈与选择')], ['yes', T('Yes — a prize for winning', '是——为获胜设立奖品')]], 'no') +
      pyr(C.map(function (c) { return [T(c.en, c.zh), c.w, '', false, 'kv-gA']; })) +
      meter(T('Persistence', '坚持'), 'per') +
      meter(T('Enjoyment', '愉悦'), 'joy', 'gold') +
      meter(T('Anxiety about performance', '表现焦虑'), 'anx') +
      '<div class="kv-callout"></div>' +
      note('Controlled motivation is driven by reward, punishment, guilt, ego or shame, and comes with lower persistence, higher anxiety and lower wellbeing. Extrinsic regulation moves from external, through introjected and identified, to integrated: from “I must”, to “I should”, to “I want to because it matters”, to “I value it”. Introducing a controlling reward for an activity already enjoyed can reduce that enjoyment — the overjustification effect.', '受控动机由奖励、惩罚、内疚、自我或羞耻驱动，并伴随更低的坚持、更高的焦虑与更低的幸福感。外在调节从外部出发，经内摄、认同到整合：从“我不得不”“我应该”“我想要，因为它重要”到“我重视它”。为一项本就喜欢的活动引入强制性奖励，反而会降低这种愉悦——这就是过度理由效应。');
    var inp = host.querySelector('input');
    function draw() {
      var w = +inp.value;
      setv(host, 'w', '.kv-val', w + ' ' + T(w === 1 ? 'week' : 'weeks', '周'));
      marks(host, '.kv-tools', reward ? 'yes' : 'no');
      /* internalisation rises with time; a controlling reward pulls it back down */
      var lvl = clamp(Math.round((w - 1) / 11 * 4), 0, 4);
      if (reward) lvl = Math.max(0, lvl - 2);
      var row = C[lvl];
      $$('.kv-lv', host).forEach(function (n, i) { n.classList.toggle('on', i === lvl); });
      var per = clamp(24 + lvl * 13, 0, 100), joy = clamp(16 + lvl * 15, 0, 100);
      var anx = clamp(78 - lvl * 13, 0, 100);
      scaleBar(host.querySelector('.per'), per / 100);
      scaleBar(host.querySelector('.joy'), joy / 100);
      scaleBar(host.querySelector('.anx'), anx / 100);
      outs(host, '.vper', Math.round(per) + ' %');
      outs(host, '.vjoy', Math.round(joy) + ' %');
      outs(host, '.vanx', Math.round(anx) + ' %');
      outs(host, '.kv-callout', T(row.en, row.zh) + ' — ' + T(row.q, row.qZh) + '. ' +
        (reward ? T('The controlling reward pulled the athlete two steps back down the continuum.', '强制性奖励把运动员沿连续体拉低了两级。')
          : T('Internalisation needs time, choice and informational feedback.', '内化需要时间、选择与信息型反馈。')));
    }
    inp.addEventListener('input', draw);
    wire(host, '.kv-tools', function (v) { reward = v === 'yes' ? 1 : 0; draw(); });
    draw();
  };

  /* ══ 28 · C.3.2 Six mini-theories ════════════════════════════════════
     Six lenses on the same claim, and how they connect. */
  MODELS['Six mini-theories'] = function (host) {
    var T6 = [
      { id: 'cet', en: 'CET', full: 'Context and intrinsic motivation', fullZh: '情境与内在动机', claim: 'autonomy support, informational feedback and optimal challenge raise intrinsic motivation', claimZh: '自主支持、信息型反馈与适度挑战提升内在动机', ex: 'a coach explains why the task is set and lets the athlete choose one variation', exZh: '教练解释任务设定的理由，并让运动员选择一种变化' },
      { id: 'oit', en: 'OIT', full: 'Internalisation', fullZh: '内化', claim: 'external reasons are taken over time until they are self-endorsed', claimZh: '外在理由随时间被吸收，直到成为自我认可', ex: '“I must train” becoming “I want to train” over a season', exZh: '一个赛季里从“我必须训练”变成“我想训练”' },
      { id: 'cot', en: 'COT', full: 'Causal orientations', fullZh: '因果取向', claim: 'internal, stable and controllable attributions support internalisation', claimZh: '内部、稳定且可控的归因支持内化', ex: '“I won because my preparation improved”', exZh: '“我赢了，因为准备提升了”' },
      { id: 'bpnt', en: 'BPNT', full: 'Basic psychological needs', fullZh: '基本心理需要', claim: 'autonomy, competence and relatedness explain quality motivation', claimZh: '自主、胜任与联结解释动机质量', ex: 'choice, matched challenge and a team that includes the beginner', exZh: '给予选择、匹配挑战、让团队接纳新手' },
      { id: 'goal', en: 'Goal contents', full: 'Goal content', fullZh: '目标内容', claim: 'learning and mastery goals differ from ego and comparison goals', claimZh: '学习与掌握目标不同于自我与比较目标', ex: '“improve my first serve percentage” rather than “be number one”', exZh: '“把一发成功率提高”而不是“要拿第一”' },
      { id: 'rel', en: 'RMT', full: 'Relationship motivation', fullZh: '关系动机', claim: 'caring coach-athlete and teammate relationships support motivation', claimZh: '关怀备至的教练与队友关系支持动机', ex: 'a coach who notices who is struggling before it is said', exZh: '在有人开口之前就注意到他遇到了困难' }
    ];
    var pick = 'cet';
    host.innerHTML =
      tools(T6.map(function (t) { return [t.id, t.en + ' — ' + T(t.full, t.fullZh)]; }), pick) +
      '<div class="kv-el-out"><dl>' +
      '<dt>' + esc(T('The claim it examines', '它考察的命题')) + '</dt><dd class="vclaim"></dd>' +
      '<dt>' + esc(T('In a training session', '在一次训练中')) + '</dt><dd class="vex"></dd>' +
      '</dl></div>' +
      '<div class="kv-q kv-q2">' + esc(T('How they connect', '它们如何连接')) + '</div>' +
      '<div class="kv-chain">' +
      ['rel', 'goal', 'bpnt', 'cot', 'oit', 'intro3'].map(function (k, i) {
        return '<span class="kv-chain-i">' + esc(T(k === 'rel' ? 'relationships' : k === 'goal' ? 'goals' : k === 'bpnt' ? 'needs' : k === 'cot' ? 'causal orientation' : k === 'oit' ? 'internalisation' : 'intrinsic motivation', k === 'rel' ? '关系' : k === 'goal' ? '目标' : k === 'bpnt' ? '需要' : k === 'cot' ? '因果取向' : k === 'oit' ? '内化' : '内在动机')) + '</span>';
      }).join('<b>→</b>') + '</div>' +
      '<div class="kv-callout"></div>' +
      note('The six mini-theories address context and intrinsic motivation, internalisation, causal orientations, basic needs, goal content and relationships. They interconnect: needs influence motivation, causal orientations support internalisation, goals and relationships shape the context, and the context influences intrinsic motivation.', '六个小理论分别考察情境与内在动机、内化、因果取向、基本需要、目标内容与关系。它们彼此连接：需要影响动机，因果取向支持内化，目标与关系塑造情境，情境又影响内在动机。');
    function draw() {
      var t = T6.filter(function (x) { return x.id === pick; })[0];
      marks(host, '.kv-tools', pick);
      outs(host, '.vclaim', T(t.claim, t.claimZh));
      outs(host, '.vex', T(t.ex, t.exZh));
      outs(host, '.kv-callout', t.en + ' — ' + T(t.full, t.fullZh) + '. ' +
        T('Theories do not compete: they answer different parts of the same question.', '这些理论并不互相竞争：它们回答的是同一个问题的不同部分。'));
    }
    wire(host, '.kv-tools', function (v) { pick = v; draw(); });
    draw();
  };

  /* ══ 29 · C.3.3 Mastery and ego climates ══════════════════════════════
     What the coach values moves persistence, enjoyment and retention. */
  MODELS['Mastery and ego climates'] = function (host) {
    var PX = 66, PW = 466, PY = 40, PH = 238;
    function X(v) { return PX + v / 100 * PW; }
    function Y(v) { return PY + PH - v / 100 * PH; }
    function path(fn) {
      var d = '', i;
      for (i = 0; i <= 40; i++) { var x = i * 2.5; d += (i ? ' L' : 'M') + X(x).toFixed(1) + ',' + Y(clamp(fn(x), 0, 100)).toFixed(1); }
      return d;
    }
    host.innerHTML =
      srange('m', T('The coach values winning rather than learning', '教练更看重获胜而非学习'), 0, 100, 40, 1, '40 / 100') +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Climate against the coach value', '氛围随教练取向变化')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      [0, 25, 50, 75, 100].map(function (v) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(v) + '" x2="' + (PX + PW) + '" y2="' + Y(v) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>';
      }).join('') +
      '<path class="curve a" d="' + path(function (x) { return 22 + x * 0.6; }) + '"/>' +
      '<path class="curve b" d="' + path(function (x) { return 92 - x * 0.62; }) + '"/>' +
      '<path class="curve c" d="' + path(function (x) { return 96 - x * 0.74; }) + '"/>' +
      '<text class="small" x="' + (PX + 8) + '" y="' + (Y(38) - 8) + '">' + esc(T('persistence', '坚持')) + '</text>' +
      '<text class="small" x="' + (PX + 8) + '" y="' + (Y(88) - 8) + '">' + esc(T('enjoyment', '愉悦')) + '</text>' +
      '<text class="small" x="' + (PX + 8) + '" y="' + (Y(96) - 22) + '">' + esc(T('staying in the sport', '继续参与')) + '</text>' +
      '<line class="kv-cursor" y1="' + (PY - 6) + '" y2="' + (PY + PH) + '"/>' +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 20) + '" text-anchor="end">' + esc(T('the coach values winning →', '教练更看重获胜 →')) + '</text>' +
      '</svg>' +
      '<div class="kv-callout"></div>' +
      note('In a mastery climate, effort, cooperation, improvement and enjoyment are valued, and athletes are more likely to show persistence, confidence, wellbeing, learning and retention. In an ego climate athletes are compared, winning is prioritised, and anxiety, burnout and dropout can increase. Rewriting “you are the best” as “your effort and strategy improved” reinforces mastery.', '在掌握氛围中，努力、合作、进步与愉悦被重视，运动员更可能表现出坚持、自信、幸福感、学习与留队。在自我氛围中，运动员被相互比较、获胜被优先，焦虑、倦怠与退出都会上升。把“你是最强的”改写为“你的努力与策略提高了”，就是在强化掌握。');
    var inp = host.querySelector('input');
    function draw() {
      var m = +inp.value;
      setv(host, 'm', '.kv-val', m + ' / 100');
      host.querySelector('.kv-cursor').setAttribute('x1', X(m).toFixed(1));
      host.querySelector('.kv-cursor').setAttribute('x2', X(m).toFixed(1));
      var per = Math.round(clamp(22 + m * 0.6, 0, 100)), joy = Math.round(clamp(92 - m * 0.62, 0, 100)), ret = Math.round(clamp(96 - m * 0.74, 0, 100));
      outs(host, '.kv-callout',
        m < 30 ? T('A mastery climate at ' + per + ' % persistence, ' + ret + ' % staying in the sport.', '掌握氛围：坚持 ' + per + '%，继续参与 ' + ret + '%。')
          : m > 66 ? T('An ego climate: enjoyment down to ' + joy + ' % and retention to ' + ret + ' %.', '自我氛围：愉悦降到 ' + joy + '%，留队降到 ' + ret + '%。')
            : T('A mixed climate — the message athletes receive is not consistent.', '混合氛围——运动员收到的信息并不一致。') +
              ' ' + T('Rewrite one sentence the coach says this week.', '改写教练这周会说的一句话。'));
    }
    inp.addEventListener('input', draw);
    draw();
  };

  /* ══ 30 · C.3.3 TARGET framework ══════════════════════════════════════
     Six decisions, each with a mastery and an ego version. */
  MODELS['TARGET framework'] = function (host) {
    var D = [
      { id: 'T', en: 'Task', zh: '任务', m: T('a meaningful challenge that can be taken on', '可应对的有意义挑战'), e: T('a scripted drill with one right answer', '只有唯一正确答案的固定练习'), q: T('What is the task asking the athlete to solve?', '这个任务要运动员解决什么？') },
      { id: 'A', en: 'Authority', zh: '决策权', m: T('shared decisions, athletes have input', '共同决策，运动员有发言权'), e: T('the coach decides everything', '一切都由教练决定'), q: T('Who decides how the session runs?', '谁决定训练怎么进行？') },
      { id: 'R', en: 'Recognition', zh: '认可', m: T('effort and strategy are praised in public', '公开表扬努力与策略'), e: T('only winners are recognised', '只有获胜者被认可'), q: T('What gets praised in front of the group?', '在群体面前被表扬的是什么？') },
      { id: 'G', en: 'Grouping', zh: '分组', m: T('mixed and flexible groups that rotate', '混合且轮换的分组'), e: T('ability-grouped, sorted once and fixed', '按能力分一次然后固定'), q: T('Who practises with whom?', '谁和谁一起练？') },
      { id: 'E', en: 'Evaluation', zh: '评价', m: T('individual progress feedback against your own standard', '对照自己的标准给出个人进步反馈'), e: T('public ranking and comparison', '公开排名与比较'), q: T('How is progress judged?', '进步如何被评判？') },
      { id: 'T2', en: 'Time', zh: '时间', m: T('fair practice time for every athlete', '每位运动员练习时间公平'), e: T('stars get the most time', '主力获得最多时间'), q: T('Who gets the minutes?', '谁获得训练时间？') }
    ];
    var mode = {};
    D.forEach(function (d) { mode[d.id] = 'm'; });
    var cur = 'T';
    host.innerHTML =
      tools(D.map(function (d) { return [d.id, d.id + ' · ' + T(d.en, d.zh)]; }), cur) +
      '<div class="kv-el-out"><dl>' +
      '<dt>' + esc(T('The question the coach answers', '教练要回答的问题')) + '</dt><dd class="vq"></dd>' +
      '<dt>' + esc(T('Mastery version', '掌握式做法')) + '</dt><dd class="vm"></dd>' +
      '<dt>' + esc(T('Ego version', '自我式做法')) + '</dt><dd class="ve"></dd>' +
      '</dl></div>' +
      '<div class="kv-q kv-q2">' + esc(T('Which version is this club using?', '俱乐部在用哪一种？')) + '</div>' +
      '<div class="ib-target">' + D.map(function (d) {
        return '<div class="ib-target-row"><span class="ib-target-l">' + d.id + '</span>' +
          '<div class="ib-target-b"><button type="button" data-v="' + d.id + '|m" aria-pressed="true" class="on">' + esc(T('mastery', '掌握')) + '</button>' +
          '<button type="button" data-v="' + d.id + '|e" aria-pressed="false">' + esc(T('ego', '自我')) + '</button></div>' +
          '<span class="ib-target-r" data-r="' + d.id + '"></span></div>';
      }).join('') + '</div>' +
      meter(T('Mastery climate', '掌握氛围'), 'cl', 'gold') +
      '<div class="kv-callout"></div>' +
      note('TARGET stands for Task, Authority, Recognition, Grouping, Evaluation and Time. Manipulating these six dimensions — what is emphasised, who decides, what is praised, how groups are formed, how performance is judged and how time is allocated — is how a coach builds a mastery or an ego climate.', 'TARGET 指任务、决策权、认可、分组、评价与时间。操控这六个维度——强调什么、谁做决定、表扬什么、如何分组、如何评判表现、如何分配时间——正是教练建立掌握氛围或自我氛围的方式。');
    function draw() {
      var d = D.filter(function (x) { return x.id === cur; })[0];
      marks(host, '.kv-tools', cur);
      outs(host, '.vq', T(d.q, d.qZh));
      outs(host, '.vm', T(d.m, d.mZh));
      outs(host, '.ve', T(d.e, d.eZh));
      var m = 0;
      D.forEach(function (x) {
        var on = mode[x.id] === 'm';
        m += on ? 1 : -1;
        var row = host.querySelector('[data-r="' + x.id + '"]');
        if (row) row.textContent = on ? T('effort, learning, support', '努力、学习、支持') : T('comparison, winning, status', '比较、获胜、地位');
        var btns = host.querySelectorAll('.ib-target-b button[data-v^="' + x.id + '|"]');
        Array.prototype.slice.call(btns).forEach(function (b) {
          var v = b.getAttribute('data-v').split('|')[1], isOn = v === mode[x.id];
          b.classList.toggle('on', isOn);
          b.setAttribute('aria-pressed', isOn ? 'true' : 'false');
        });
      });
      var cl = clamp(50 + m * 8.3, 0, 100);
      scaleBar(host.querySelector('.cl'), cl / 100);
      outs(host, '.vcl', Math.round(cl) + ' %');
      outs(host, '.kv-callout',
        cl > 66 ? T('All six point to mastery: this is the climate where effort, learning and support are visible.', '六个维度都指向掌握：这是努力、学习与支持都能被看见的氛围。')
          : cl < 34 ? T('All six point to ego: comparison and winning become the message.', '六个维度都指向自我：比较与获胜成为核心信息。')
            : T('Mixed: change one dimension at a time and watch the index move.', '情况混合：一次改一个维度，观察指数的变化。'));
    }
    wire(host, '.kv-tools', function (v) { cur = v; draw(); });
    wire(host, '.ib-target-b', function (v) { var p = v.split('|'); mode[p[0]] = p[1]; cur = p[0]; draw(); });
    draw();
  };

  /* ══ 31 · C.3.3 Links to motivation and SDT ══════════════════════════
     The same climate, three settings, three things it protects. */
  MODELS['Links to motivation and SDT'] = function (host) {
    var S = [
      { id: 'team', en: 'Team sport', zh: '团队项目', builds: T('culture and cohesion', '团队文化与凝聚力'), why: 'the climate shapes how teammates treat each other, not just how they train', whyZh: '氛围塑造的是队友之间如何相处，而不只是如何训练' },
      { id: 'ind', en: 'Individual sport', zh: '个人项目', builds: T('confidence', '自信'), why: 'there is nobody to hide behind, so the internal message matters most', whyZh: '没有队友可依靠，因此内心的信息最重要' },
      { id: 'youth', en: 'Youth sport', zh: '青少年运动', builds: T('long-term enjoyment and participation', '长期的愉悦与参与'), why: 'the point is staying in the sport for years, not winning one event', whyZh: '目标是多年留在这项运动中，而不是赢一场比赛' }
    ];
    var set = 'team';
    host.innerHTML =
      seg(S.map(function (s) { return [s.id, T(s.en, s.zh)]; }), set) +
      srange('m', T('The climate is mastery rather than ego', '氛围偏掌握而非自我'), 0, 100, 70, 1, '70 / 100') +
      '<div class="kv-q kv-q2">' + esc(T('The three needs under that climate', '该氛围下的三个需要')) + '</div>' +
      zones([['A', T('Autonomy', '自主'), '', '', 1], ['C', T('Competence', '胜任'), '', '', 1], ['R', T('Relatedness', '联结'), '', '', 1]]) +
      '<div class="kv-q kv-q2">' + esc(T('What it protects or builds', '它保护或建立什么')) + '</div>' +
      '<div class="kv-builds"></div>' +
      meter(T('Quality motivation', '动机质量'), 'qm', 'gold') +
      meter(T('Long-term participation', '长期参与'), 'lt') +
      '<div class="kv-callout"></div>' +
      note('Achievement motivation is the desire to meet challenging goals; self-determination theory explains the quality of motivation through autonomy, competence and relatedness. A mastery climate tends to satisfy those needs and an ego climate tends to frustrate them. A mastery climate supports achievement goals and quality motivation at the same time — it does not replace one with the other.', '成就动机是达到挑战性目标的愿望；自我决定理论通过自主、胜任与联结解释动机质量。掌握氛围往往满足这些需要，自我氛围往往使其受挫。掌握氛围同时支持成就目标与高质量动机——它不是用后者取代前者。');
    var inp = host.querySelector('input');
    function draw() {
      var m = +inp.value, s = S.filter(function (x) { return x.id === set; })[0];
      setv(host, 'm', '.kv-v', m + ' / 100');
      marks(host, '.kv-seg', set);
      var need = [m, clamp(m * 0.94 + 4, 0, 100), clamp(m * 0.88 + 6, 0, 100)];
      var rows = host.querySelectorAll('.kv-zones .kv-zone');
      Array.prototype.slice.call(rows).forEach(function (r, i) {
        var v = Math.round(need[i]);
        r.className = 'kv-zone kv-z' + (v < 30 ? 5 : v < 50 ? 4 : v < 70 ? 3 : 2) + (i === 0 ? ' on' : '');
        r.querySelector('b').textContent = v + ' %';
      });
      host.querySelector('.kv-builds').innerHTML = '<div class="kv-side"><b>' + esc(T(s.builds, s.builds === S[0].builds ? S[0].buildsZh : s.builds === S[1].builds ? S[1].buildsZh : S[2].buildsZh)) + '</b>' +
        '<p>' + esc(T(s.why, s.whyZh)) + '</p></div>';
      var qm = clamp(m * 1.02, 0, 100), lt = clamp(m * 0.9 + 8, 0, 100);
      scaleBar(host.querySelector('.qm'), qm / 100);
      scaleBar(host.querySelector('.lt'), lt / 100);
      outs(host, '.vqm', Math.round(qm) + ' %');
      outs(host, '.vlt', Math.round(lt) + ' %');
      outs(host, '.kv-callout', T(s.en, s.zh) + ' — ' + T(s.why, s.whyZh) + '. ' +
        (m > 62 ? T('A mastery climate satisfies the needs and supports both kinds of goal.', '掌握氛围满足需要，并同时支持两类目标。')
          : T('An ego climate frustrates the needs: enjoyment and staying both fall.', '自我氛围使需要受挫：愉悦与留下都会下降。')));
    }
    inp.addEventListener('input', draw);
    wireSeg(host, function (v) { set = v; draw(); });
    draw();
  };

  /* ══ 32 · C.4.1 Anxiety dimensions and catastrophe ═════════════════════
     Somatic arousal can help; cognitive anxiety is what collapses. */
  MODELS['Anxiety dimensions and catastrophe'] = function (host) {
    var TASK = [
      { id: 'sprint', en: '100 m sprint', zh: '100 米冲刺', z: 74, som: 80, note: 'high somatic arousal is useful here; cognitive worry is not', noteZh: '此处高躯体唤醒是有用的；认知担忧则不是' },
      { id: 'putt', en: 'golf putt', zh: '高尔夫推杆', z: 28, som: 30, note: 'precision needs a low, narrow state', noteZh: '精确性需要低而窄的状态' },
      { id: 'pen', en: 'penalty', zh: '点球', z: 38, som: 55, note: 'arousal helps the approach, worry hurts the target', noteZh: '唤醒有助于助跑，担忧却妨碍瞄准' },
      { id: 'final', en: 'one-minute final', zh: '一分钟决赛', z: 66, som: 70, note: 'arousal helps to start; the last 20 s is where worry bites', noteZh: '唤醒有助于起动；最后 20 秒是担忧发作之处' }
    ];
    var task = 'pen', cogn = 45, som = 60;
    var PX = 66, PW = 468, PY = 40, PH = 236;
    function X(v) { return PX + v / 100 * PW; }
    function Y(v) { return PY + PH - v / 100 * PH; }
    host.innerHTML =
      seg(TASK.map(function (t) { return [t.id, T(t.en, t.zh)]; }), task) +
      '<div class="kv-grid2">' +
      srange('cog', T('Cognitive anxiety', '认知焦虑'), 0, 100, 45, 1, '45 / 100') +
      srange('som', T('Somatic anxiety', '躯体焦虑'), 0, 100, 60, 1, '60 / 100') +
      '</div>' +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Performance against cognitive anxiety', '表现随认知焦虑变化')) + '">' +
      '<rect class="target-zone" x=""/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      [0, 25, 50, 75, 100].map(function (v) {
        return '<line class="gl" x1="' + PX + '" y1="' + Y(v) + '" x2="' + (PX + PW) + '" y2="' + Y(v) + '"/>' +
          '<text class="small" x="' + (PX - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>';
      }).join('') +
      '<path class="curve a" d=""/>' +
      '<line class="kv-cursor" y1="' + (PY - 6) + '" y2="' + (PY + PH) + '"/>' +
      '<text class="small" x="' + (PX + 4) + '" y="' + (PY - 10) + '">' + esc(T('performance', '表现水平')) + '</text>' +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 20) + '" text-anchor="end">' + esc(T('cognitive anxiety', '认知焦虑')) + '</text>' +
      '</svg>' +
      meter(T('Energy available from arousal', '唤醒带来的可用能量'), 'en', 'gold') +
      meter(T('Performance', '表现水平'), 'pf') +
      '<div class="kv-callout"></div>' +
      note('Somatic anxiety — a high heart rate, tension, sweating — can energise up to a point, while cognitive anxiety is negative worry and self-doubt. Catastrophe theory predicts that performance stays relatively stable until cognitive anxiety is too high, then collapses suddenly. Low anxiety is not the same as no anxiety: it can feel like excitement and positive challenge.', '躯体焦虑——心率升高、紧张、出汗——在一定范围内可以提供能量；而认知焦虑是消极担忧与自我怀疑。灾难理论预测：表现会保持相对稳定，直到认知焦虑过高，然后突然崩塌。低焦虑并不等于没有焦虑：它可以是兴奋与积极挑战。');
    var ins = $$('input[type=range]', host);
    function draw() {
      var t = TASK.filter(function (x) { return x.id === task; })[0], c = +ins[0].value, s = +ins[1].value;
      setv(host, 'cog', '.kv-val', c + ' / 100');
      setv(host, 'som', '.kv-val', s + ' / 100');
      marks(host, '.kv-seg', task);
      var d = '', i, v;
      for (i = 0; i <= 50; i++) {
        v = i * 2;
        var perf = v < 55 ? 62 + v * 0.55 : Math.max(0, 92 - Math.pow(v - 55, 1.9) * 0.16);
        d += (i ? ' L' : 'M') + X(v).toFixed(1) + ',' + Y(clamp(perf, 0, 100)).toFixed(1);
      }
      host.querySelector('.curve').setAttribute('d', d);
      var zw = 14;
      host.querySelector('.target-zone').setAttribute('x', X(t.z - zw).toFixed(1));
      host.querySelector('.target-zone').setAttribute('width', (X(t.z + zw) - X(t.z - zw)).toFixed(1));
      host.querySelector('.target-zone').setAttribute('y', PY);
      host.querySelector('.target-zone').setAttribute('height', PH);
      var perf = c < 55 ? 62 + c * 0.55 : Math.max(0, 92 - Math.pow(c - 55, 1.9) * 0.16);
      var en = clamp(20 + s * 0.9, 0, 100);
      scaleBar(host.querySelector('.en'), en / 100);
      scaleBar(host.querySelector('.pf'), perf / 100);
      outs(host, '.ven', Math.round(en) + ' %');
      outs(host, '.vpf', Math.round(perf) + ' %');
      host.querySelector('.kv-cursor').setAttribute('x1', X(c).toFixed(1));
      host.querySelector('.kv-cursor').setAttribute('x2', X(c).toFixed(1));
      outs(host, '.kv-callout', T(t.en, t.zh) + ' — ' + T(t.note, t.noteZh) + '. ' +
        (c > t.z + 14 ? T('Cognitive worry is past the catastrophic threshold for this task.', '认知担忧已越过该任务的灾难阈值。')
          : T('The somatic level is useful here; the part to lower is the worry.', '此处躯体水平是有用的；需要降低的是担忧。')));
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); });
    wireSeg(host, function (v) { task = v; draw(); });
    draw();
  };

  /* ══ 33 · C.4.1 Measurement and regulation ═══════════════════════════
     What each instrument tells you — and what it cannot. */
  MODELS['Measurement and regulation'] = function (host) {
    var M = [
      { id: 'hr', en: 'Heart rate', zh: '心率', obj: 1, yes: 'arousal, effort, recovery status', yesZh: '唤醒、用力、恢复状态', no: 'cannot identify the thought content', noZh: '无法识别想法内容', bias: 'a fit person has a high resting rate', biasZh: '体能好的人静息心率本就偏高' },
      { id: 'bp', en: 'Blood pressure', zh: '血压', obj: 1, yes: 'sustained arousal, stress load', yesZh: '持续的唤醒与压力负荷', no: 'very reactive, hard to read moment to moment', noZh: '反应很大，难以逐刻解读', bias: 'affected by caffeine, heat, talking', biasZh: '受咖啡因、高温与说话影响' },
      { id: 'gsr', en: 'Galvanic skin response', zh: '皮肤电反应', obj: 1, yes: 'sympathetic activation — sweating, stress', yesZh: '交感神经激活——出汗、压力', no: 'also rises with temperature and exertion', noZh: '体温与用力也会升高', bias: 'no thought content at all', biasZh: '完全不包含想法内容' },
      { id: 'stai', en: 'STAI / worry scale', zh: 'STAI / 担忧量表', obj: 0, yes: 'worry, tension, confidence before a task', yesZh: '任务前的担忧、紧张与自信', no: 'can be biased by what the athlete wants to show', noZh: '可能受运动员想表现什么的影响', bias: 'self-report: social desirability matters', biasZh: '自评：社会赞许性有影响' },
      { id: 'csr', en: 'CSR-18 / self-talk', zh: 'CSR-18 / 自我对话', obj: 0, yes: 'the content of the thinking', yesZh: '思维的具体内容', no: 'says nothing about physiology', noZh: '完全不涉及生理', bias: 'only what is remembered or reported', biasZh: '只有被记住或被报告的部分' }
    ];
    var pick = 'stai', fix = 'breath';
    var FIX = [
      { id: 'breath', en: 'Breathing', zh: '呼吸', cut: 22, dEn: 'lengthens exhale, lowers arousal within a minute', dZh: '延长呼气，一分钟内降低唤醒' },
      { id: 'routine', en: 'Pre-performance routine', zh: '赛前常规流程', cut: 26, dEn: 'gives attention a fixed job and steadies the first action', dZh: '给注意力一个固定任务，稳定第一个动作' },
      { id: 'talk', en: 'Self-talk', zh: '自我对话', cut: 18, dEn: 'short, positive, present-tense and realistic', dZh: '简短、积极、现在时且真实' },
      { id: 'im', en: 'Imagery', zh: '意象', cut: 16, dEn: 'rehearses the successful outcome and the routine around it', dZh: '预演成功结果及其周围的流程' }
    ];
    host.innerHTML =
      '<div class="ib-instr">' + tools(M.map(function (m) { return [m.id, T(m.en, m.zh)]; }), pick) + '</div>' +
      '<div class="kv-el-out"><dl>' +
      '<dt>' + esc(T('It tells you', '它能告诉你')) + '</dt><dd class="vy"></dd>' +
      '<dt>' + esc(T('It cannot tell you', '它不能告诉你')) + '</dt><dd class="vn"></dd>' +
      '<dt>' + esc(T('Its weakness', '它的局限')) + '</dt><dd class="vb"></dd>' +
      '</dl></div>' +
      '<div class="kv-q kv-q2 ib-q2">' + esc(T('Regulation before the attempt', '尝试前的调节')) + '</div>' +
      tools(FIX.map(function (f) { return [f.id, T(f.en, f.zh)]; }), fix) +
      meter(T('Arousal at the moment', '此刻的唤醒'), 'ar') +
      '<div class="kv-callout"></div>' +
      note('Subjective anxiety can be measured by questionnaires, rating scales and interviews about worry, tension and confidence. Objective indicators include heart rate, blood pressure and galvanic skin response. Using both gives a fuller picture: self-report can be biased, and physiological measures do not identify thought content on their own.', '主观焦虑可通过问卷、评定量表与访谈测量，内容包括担忧、紧张与自信。客观指标包括心率、血压与皮肤电反应。两者并用能形成更完整的图景：自评可能有偏，而生理指标本身无法识别想法内容。');
    function draw() {
      var m = M.filter(function (x) { return x.id === pick; })[0], f = FIX.filter(function (x) { return x.id === fix; })[0];
      marks(host, '.ib-instr .kv-tools', pick);
      marks(host, '.ib-q2 + .kv-tools', fix);
      outs(host, '.vy', T(m.yes, m.yesZh));
      outs(host, '.vn', T(m.no, m.noZh));
      outs(host, '.vb', T(m.bias, m.biasZh));
      var ar = clamp(72 - f.cut, 0, 100);
      scaleBar(host.querySelector('.ar'), ar / 100);
      outs(host, '.var', Math.round(ar) + ' %');
      outs(host, '.kv-callout', T(m.en, m.zh) + T(' (objective)', '（客观）') + '. ' + T(f.en, f.zh) + ': ' + T(f.dEn, f.dZh) + '. ' +
        T('Ask both: the number and the sentence.', '两者都问：数字与那句话。'));
    }
    wire(host, '.ib-instr .kv-tools', function (v) { pick = v; draw(); });
    $$('.ib-q2 + .kv-tools button', host).forEach(function (b) {
      b.addEventListener('click', function () { fix = b.getAttribute('data-v'); draw(); });
    });
    draw();
  };

  /* ══ 34 · C.4.2 Stressors and strain ══════════════════════════════════
     Demand against perceived resources decides eustress or distress. */
  MODELS['Stressors and strain'] = function (host) {
    var S = [
      { id: 'comp', en: 'competition pressure', zh: '比赛压力', d: 72, res: 60, ex: 'a final against a direct rival', exZh: '与直接对手的决赛' },
      { id: 'injury', en: 'injury and rehabilitation', zh: '伤病与康复', d: 80, res: 48, ex: 'a season out with a long rehabilitation', exZh: '赛季报销、长期康复' },
      { id: 'study', en: 'academic or work demands', zh: '学业或工作要求', d: 58, res: 62, ex: 'exams during a competition block', exZh: '训练期内遇上考试' },
      { id: 'time', en: 'time pressure', zh: '时间压力', d: 62, res: 66, ex: 'three deadlines in one week', exZh: '一周内三个截止日期' },
      { id: 'select', en: 'selection', zh: '选拔', d: 70, res: 58, ex: 'squad cut before the season', exZh: '赛季前的名单调整' },
      { id: 'travel', en: 'travel', zh: '旅行', d: 44, res: 70, ex: 'a five-leg tournament trip', exZh: '五段转场的比赛旅行' },
      { id: 'money', en: 'finances', zh: '经济', d: 54, res: 52, ex: 'unpaid or part-paid club sport', exZh: '无薪或兼职的俱乐部运动' },
      { id: 'slump', en: 'a goal-setting slump', zh: '目标低谷', d: 48, res: 64, ex: 'a season with no PB', exZh: '整个赛季没有个人最好成绩' },
      { id: 'rel', en: 'relationship issues', zh: '人际关系', d: 50, res: 60, ex: 'a conflict inside the squad', exZh: '队内冲突' }
    ];
    var pick = 'comp';
    var PX = 66, PW = 468, PY = 40, PH = 236;
    function X(v) { return PX + v / 100 * PW; }
    function Y(v) { return PY + PH - v / 100 * PH; }
    host.innerHTML =
      tools(S.map(function (x) { return [x.id, T(x.en, x.zh)]; }), pick) +
      srange('r', T('Perceived resources', '感知到的资源'), 0, 100, 60, 1, '60 / 100') +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Demand against resources', '需求与资源')) + '">' +
      '<path class="eu" d="M' + X(30).toFixed(1) + ',' + (PY + PH) + ' L' + X(100).toFixed(1) + ',' + Y(100) + ' L' + (PX + PW) + ',' + Y(100) + ' L' + (PX + PW) + ',' + (PY + PH) + ' Z"/>' +
      '<path class="di" d="M' + X(30).toFixed(1) + ',' + (PY + PH) + ' L' + (PX + PW) + ',' + Y(0) + ' L' + (PX + PW) + ',' + (PY + PH) + ' Z"/>' +
      '<line class="gl" x1="' + PX + '" y1="' + Y(50) + '" x2="' + (PX + PW) + '" y2="' + Y(50) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<text class="small" x="' + (PX + PW - 6) + '" y="' + (Y(88) + 14) + '" text-anchor="end">' + esc(T('eustress: energising', '良性压力：提供能量')) + '</text>' +
      '<text class="small" x="' + (PX + PW - 6) + '" y="' + (Y(16) - 6) + '" text-anchor="end">' + esc(T('distress: overwhelming', '恶性压力：难以承受')) + '</text>' +
      '<circle class="marker" r="8" cx="0" cy="0"/>' +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 20) + '" text-anchor="end">' + esc(T('perceived resources', '感知资源')) + '</text>' +
      '<text class="small" x="' + (PX - 8) + '" y="' + (PY - 10) + '" text-anchor="end">' + esc(T('demand', '需求')) + '</text>' +
      '</svg>' +
      meter(T('Strain', '紧张度'), 'st') +
      '<div class="kv-verdict"></div>' +
      '<div class="kv-callout"></div>' +
      note('Common stressors include competition pressure, injury and rehabilitation, academic or work demands, time pressure, selection, travel, finances, goal-setting slumps and relationship issues. Appraising demands and resources decides whether strain is eustress or distress: positive strain can energise focus and performance when it is manageable, while negative strain reduces concentration and confidence and contributes to burnout and injury risk.', '常见压力源包括比赛压力、伤病与康复、学业或工作要求、时间压力、选拔、旅行、经济、目标低谷与人际关系。对需求与资源的评估决定紧张属于良性还是恶性：当压力可承受时，良性紧张能激发专注与表现；而恶性紧张会降低注意力与自信，并增加倦怠与受伤风险。');
    var inp = host.querySelector('input');
    function draw() {
      var s = S.filter(function (x) { return x.id === pick; })[0], r = +inp.value;
      setv(host, 'r', '.kv-v', r + ' / 100');
      marks(host, '.kv-tools', pick);
      var m = host.querySelector('.marker');
      m.setAttribute('cx', X(r).toFixed(1));
      m.setAttribute('cy', Y(s.d).toFixed(1));
      var strain = clamp(s.d - r + 50, 0, 100);
      m.classList.toggle('ok', strain < 52);
      m.classList.toggle('risk', strain >= 52);
      scaleBar(host.querySelector('.st'), strain / 100);
      outs(host, '.vst', Math.round(strain) + ' %');
      var v = host.querySelector('.kv-verdict');
      var eu = strain < 48;
      v.className = 'kv-verdict ' + (eu ? 'good' : strain < 68 ? 'meh' : 'bad');
      v.textContent = eu ? T('Eustress: manageable, and it can sharpen focus.', '良性压力：可承受，并能让专注更敏锐。')
        : strain < 68 ? T('On the edge: the outcome depends on the day.', '临界：结果取决于当天状态。')
          : T('Distress: concentration and confidence fall, and burnout and injury risk rise.', '恶性压力：专注与自信下降，倦怠与受伤风险上升。');
      outs(host, '.kv-callout', T(s.en, s.zh) + ' — ' + T('demand ', '需求 ') + s.d + ' %, ' +
        T('resources ', '资源 ') + r + ' %. ' +
        T('Looks like: ', '例如：') + T(s.ex, s.exZh) + '. ' +
        T('Appraisal, not the event, decides which it is.', '决定因素是对它的评估，而不是事件本身。'));

    }
    inp.addEventListener('input', draw);
    wire(host, '.kv-tools', function (v) { pick = v; draw(); });
    draw();
  };

  /* ══ 35 · C.4.2 Three coping categories ═══════════════════════════════
     Controllable or not, then which strategy. */
  MODELS['Three coping categories'] = function (host) {
    var C = [
      { id: 'p', en: 'Problem-focused', zh: '问题聚焦', ex: ['plan a conversation', 'practise the skill', 'organise the time', 'ask for help or resources'], exZh: ['计划一次沟通', '练习该技能', '安排时间', '寻求帮助或资源'], fits: 1 },
      { id: 'e', en: 'Emotion-focused', zh: '情绪聚焦', ex: ['breathing or relaxation', 'self-talk or reframing', 'mindfulness', 'imagery or acceptance'], exZh: ['呼吸或放松', '自我对话或重构', '正念', '意象或接纳'], fits: -1 },
      { id: 'a', en: 'Avoidance', zh: '回避', ex: ['withdrawing from the team', 'venting without addressing it', 'self-blame', 'distraction to avoid thinking'], exZh: ['退出团队', '发泄而不处理问题', '自责', '用分心回避思考'], fits: 0 }
    ];
    var control = 1, cat = 'p', strat = 0;
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Can the stressor be changed?', '这个压力源能被改变吗？')) + '</div>' +
      tools([['yes', T('Yes — something can be done', '可以——有可做的事')], ['no', T('No — it has to be managed', '不能——只能应对')]], control ? 'yes' : 'no') +
      '<div class="kv-q kv-q2">' + esc(T('Which strategy is the athlete using?', '运动员在用哪种策略？')) + '</div>' +
      '<div class="ib-cats">' + C.map(function (c, ci) {
        return '<button type="button" data-v="' + c.id + '" class="' + (ci === cat ? 'on' : '') + '" aria-pressed="' + (ci === cat ? 'true' : 'false') + '">' +
          '<b>' + esc(T(c.en, c.zh)) + '</b><span>' + esc(T(c.ex[strat % c.ex.length], c.exZh[strat % c.ex.length])) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="kv-q kv-q2">' + esc(T('Try another example', '换个例子')) + '</div>' +
      tools([['0', T('Next example', '下一个例子')]], '0') +
      meter(T('Strain left after coping', '应对后残留的紧张'), 'st') +
      meter(T('Support over the long term', '长期支持'), 'sup', 'gold') +
      '<div class="kv-callout"></div>' +
      note('Problem-focused coping changes a controllable stressor through planning, skill practice, resources or communication. Emotion-focused coping manages thoughts, feelings and arousal through relaxation, self-talk, mindfulness, reframing, breathing and imagery. Avoidance escapes the problem and is rarely helpful long term. No single strategy works for all stressors: assess controllability and combine the two useful categories when needed.', '问题聚焦通过计划、练习、资源或沟通来改变可控的压力源。情绪聚焦通过放松、自我对话、正念、重构、呼吸与意象管理想法、感受与唤醒。回避型策略逃避问题，长期很少有用。不存在适用于所有压力源的单一策略：先评估可控性，必要时组合上述两种有用的类别。');
    function draw() {
      marks(host, '.kv-tools', control ? 'yes' : 'no');
      var want = control ? 'p' : 'e';
      $$('.ib-cats button', host).forEach(function (b) {
        var on = b.getAttribute('data-v') === cat;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        var c = C.filter(function (x) { return x.id === cat; })[0];
        b.querySelector('span').textContent = T(c.ex[strat % c.ex.length], c.exZh[strat % c.ex.length]);
      });
      var c = C.filter(function (x) { return x.id === cat; })[0];
      var good = cat === want;
      var st = clamp(control ? (good ? 26 : 58) : (cat === 'a' ? 72 : 38), 0, 100);
      var sup = clamp(good ? 82 : cat === 'a' ? 22 : 54, 0, 100);
      scaleBar(host.querySelector('.st'), st / 100);
      scaleBar(host.querySelector('.sup'), sup / 100);
      outs(host, '.vst', Math.round(st) + ' %');
      outs(host, '.vsup', Math.round(sup) + ' %');
      outs(host, '.kv-callout', T(c.en, c.zh) + '. ' +
        (cat === 'a'
          ? T('Avoidance may feel better for an hour, then support, confidence and motivation all fall.', '回避可能让人一小时好受些，随后支持、自信与动机都会下降。')
          : good
            ? T('This matches the controllability: the right tool for this stressor.', '这与可控性匹配：是对这个压力源合适的工具。')
            : T('Mismatched: ' + (control
              ? T('when the stressor can be changed, plan and act rather than only regulating yourself.', '当压力源可改变时，应计划并行动，而不只是调节自己。')
              : T('when it cannot be changed, regulating yourself is what actually helps.', '当压力源无法改变时，调节自己才真正有用。')))));
    }
    wire(host, '.kv-tools', function (v) { if (v === 'yes' || v === 'no') control = v === 'yes' ? 1 : 0; else strat++; draw(); });
    wire(host, '.ib-cats', function (v) { cat = v; draw(); });
    draw();
  };

  /* ══ 36 · C.4.2 Decision flow and maladaptive responses ═══════════════
     The flow first, then the four responses to avoid. */
  MODELS['Decision flow and maladaptive responses'] = function (host) {
    var BAD = [
      { id: 'withdraw', en: 'Withdrawal', zh: '退缩', short: 'brief relief', shortZh: '短暂缓解', cost: 'support and team cohesion fall', costZh: '支持与团队凝聚力下降' },
      { id: 'vent', en: 'Venting', zh: '发泄', short: 'immediate release', shortZh: '即时释放', cost: 'the problem stays exactly where it was', costZh: '问题原封不动地留在那里' },
      { id: 'blame', en: 'Self-blame', zh: '自责', short: 'a sense of control', shortZh: '一种掌控感', cost: 'confidence and approach both drop', costZh: '自信与趋近同时下降' },
      { id: 'distract', en: 'Distraction', zh: '分心', short: 'thoughts stop', shortZh: '想法停止', cost: 'nothing is solved and nothing is learned', costZh: '既没解决，也没学到' }
    ];
    var step = 0, bad = 'withdraw';
    host.innerHTML =
      path([T('Can it be changed?', '能被改变吗？'), T('Act on it', '采取行动'), T('Or manage it', '或加以管理')], 0) +
      '<div class="kv-el-out"><dl><dt>' + esc(T('This step', '这一步')) + '</dt><dd class="vstep"></dd></dl></div>' +
      tools(BAD.map(function (b) { return [b.id, T(b.en, b.zh)]; }), bad) +
      meter(T('Support after this response', '此反应后的支持'), 'sup') +
      meter(T('Motivation next week', '下周的动机'), 'mot', 'gold') +
      '<div class="kv-callout"></div>' +
      note('Ask whether the stressor can be changed. If yes, primarily plan, practise, seek help, set goals, organise and solve. If no, use relaxation, self-talk, imagery, mindfulness, positive reframing, acceptance and focus on process. Maladaptive strategies — withdrawal, venting, self-blame and distraction — may give brief relief but reduce support, confidence, motivation and long-term performance. Self-talk should be short, positive, present-tense and realistic: “one point at a time”, “I control my effort”.', '先问：这个压力源能被改变吗？若能，主要靠计划、练习、寻求帮助、设定目标、组织与解决。若不能，则用放松、自我对话、意象、正念、积极重构、接纳，并专注于过程。适应不良策略——退缩、发泄、自责与分心——可能带来短暂缓解，却会降低支持、自信、动机与长期表现。自我对话应简短、积极、现在时且真实：“一次一分”“我能掌控自己的努力”。');
    var STEPS = [
      function () { return [T('Decide whether the stressor can be changed at all.', '先判断这个压力源到底能否被改变。'), T('If yes, plan, practise, seek help, set goals, organise and solve.', '若能，计划、练习、寻求帮助、设定目标、组织并解决。')]; },
      function () { return [T('Act on what is controllable: plan, practise, ask for help, set a goal, organise.', '处理可控的部分：计划、练习、寻求帮助、设定目标、组织。'), T('Examples: plan the conversation, restructure the training week, request resources.', '例如：计划一次沟通、重组训练周、申请资源。')]; },
      function () { return [T('If it cannot be changed, manage the response: relaxation, self-talk, imagery, mindfulness, reframing, acceptance, focus on process.', '若不能改变，则管理反应：放松、自我对话、意象、正念、重构、接纳、专注过程。'), T('Self-talk stays short, positive, present-tense and realistic.', '自我对话保持简短、积极、现在时且真实。')]; }
    ];
    function draw() {
      var b = BAD.filter(function (x) { return x.id === bad; })[0], s = STEPS[step]();
      marks(host, '.kv-path', step);
      marks(host, '.kv-tools', bad);
      outs(host, '.vstep', T(s[0], s[1]));
      var sup = clamp(88 - step * 30, 0, 100), mot = clamp(84 - step * 32, 0, 100);
      scaleBar(host.querySelector('.sup'), sup / 100);
      scaleBar(host.querySelector('.mot'), mot / 100);
      outs(host, '.vsup', Math.round(sup) + ' %');
      outs(host, '.vmot', Math.round(mot) + ' %');
      outs(host, '.kv-callout', T(b.en, b.zh) + ' — ' + T(b.short, b.shortZh) + ', but ' + T(b.cost, b.costZh) + '. ' +
        T('Alternative: ', '替代做法：') + (step === 1 ? T('plan, practise, ask for help', '计划、练习、寻求帮助') : T('breathe, reframe, focus on process', '呼吸、重构、专注过程')) + '.');
    }
    wire(host, '.kv-path', function (v) { step = +v; draw(); });
    wire(host, '.kv-tools', function (v) { bad = v; draw(); });
    draw();
  };

  /* ══ 37 · C.5.1 Three goal types ══════════════════════════════════════
     How much of the goal the athlete actually controls. */
  MODELS['Three goal types'] = function (host) {
    var G = [
      { id: 'out', en: 'Outcome', zh: '结果目标', ctl: 15, worry: 62, habit: 12, ex: 'finish in the top three', exZh: '进入前三名', dEn: 'norm-referenced: the result depends on everyone else', dZh: '以他人为参照：结果取决于所有其他人' },
      { id: 'perf', en: 'Performance', zh: '表现目标', ctl: 74, worry: 34, habit: 46, ex: 'run 5 km under 18:30', exZh: '5 公里跑进 18 分 30 秒', dEn: 'self-referenced and measurable: only the athlete decides', dZh: '以自己为参照且可测量：只由运动员决定' },
      { id: 'proc', en: 'Process', zh: '过程目标', ctl: 96, worry: 16, habit: 92, ex: 'hold cadence and relaxed shoulders', exZh: '保持步频与放松的肩膀', dEn: 'controllable technique or strategy: this is where habits are built', dZh: '可控的技术或策略：习惯在这里形成' }
    ];
    var pick = 'out';
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Which kind of goal is the athlete working with?', '运动员在用哪一种目标？')) + '</div>' +
      tools(G.map(function (g) { return [g.id, T(g.en, g.zh)]; }), pick) +
      '<div class="kv-convert"></div>' +
      meter(T('Under the athlete’s control', '在运动员掌控内'), 'ctl') +
      meter(T('Worry about the result', '对结果的担忧'), 'worry', 'gold') +
      meter(T('Habit and routine built', '养成的习惯'), 'hab') +
      '<div class="kv-callout"></div>' +
      note('Outcome goals are norm-referenced results such as winning a final. Performance goals are self-referenced and measurable, such as swimming 50 m freestyle in 24.50 s. Process goals target controllable technique or strategy, such as a high elbow catch. Process goals build habits, regulate arousal and reduce worry, because the athlete can control them directly.', '结果目标是参照他人的结果，如赢得决赛。表现目标是以自己为参照且可测量的目标，如 50 米自由泳游进 24 秒 50。过程目标指向可控的技术或策略，如高肘抱水。过程目标能形成习惯、调节唤醒并减少担忧，因为运动员能直接掌控它们。');
    function draw() {
      var g = G.filter(function (x) { return x.id === pick; })[0];
      marks(host, '.kv-tools', pick);
      scaleBar(host.querySelector('.ctl'), g.ctl / 100);
      scaleBar(host.querySelector('.worry'), g.worry / 100);
      scaleBar(host.querySelector('.hab'), g.habit / 100);
      outs(host, '.vctl', g.ctl + ' %');
      outs(host, '.vworry', g.worry + ' %');
      outs(host, '.vhab', g.habit + ' %');
      host.querySelector('.kv-convert').innerHTML =
        '<div class="kv-side"><b>' + esc(T('The running example', '跑步的例子')) + '</b>' +
        '<p>' + esc(T('finish in the top three', '进入前三名')) + ' → ' +
        esc(T('run 5 km under 18:30', '5 公里跑进 18 分 30 秒')) + ' → ' +
        esc(T('hold cadence and relaxed shoulders', '保持步频与放松的肩膀')) + '</p></div>' +
        '<div class="kv-side"><b>' + esc(T('This kind of goal', '这一类目标')) + '</b>' +
        '<p>' + esc(T(g.en + ': ' + g.dEn, g.zh + '：' + g.dZh)) + '</p></div>';
      outs(host, '.kv-callout', T(g.en, g.zh) + ' — ' + T(g.dEn, g.dZh) + '. ' +
        T('Looks like: ', '例如：') + T(g.ex, g.exZh) + '. ' +
        (pick === 'out' ? T('Keep it, but always convert it into a performance and a process goal.', '可以保留它，但必须同时转化为表现目标与过程目标。')
          : pick === 'perf' ? T('Self-referenced, so the athlete knows straight away whether it happened.', '以自己为参照，因此运动员立刻知道是否达成。')
            : T('Directly controllable, so it builds habits and lowers worry.', '直接可控，因此能形成习惯并降低担忧。')));
    }
    wire(host, '.kv-tools', function (v) { pick = v; draw(); });
    draw();
  };

  /* ══ 38 · C.5.1 Goal purpose and the paradox ══════════════════════════
     Drive rises towards the goal, then falls after success — unless a new
     goal is set. */
  MODELS['Goal purpose and paradox'] = function (host) {
    var PX = 66, PW = 468, PY = 40, PH = 236, WKS = 20;
    function X(w) { return PX + w / WKS * PW; }
    function Y(v) { return PY + PH - v / 100 * PH; }
    host.innerHTML =
      srange('w', T('Weeks from now', '距离目标还有几周'), 0, 20, 12, 1, '12 weeks') +
      tools([['none', T('Nothing changes after success', '成功后什么都不变')], ['new', T('A new process and performance goal is set', '设定新的过程与表现目标')]], 'none') +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Drive across the approach to a goal', '迈向目标过程中的驱动力')) + '">' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="gl" x1="' + PX + '" y1="' + Y(50) + '" x2="' + (PX + PW) + '" y2="' + Y(50) + '"/>' +
      '<path class="curve a" d=""/><path class="curve b thin" d=""/>' +
      '<text class="small" x="' + (PX + 4) + '" y="' + (PY - 10) + '">' + esc(T('drive', '驱动力')) + '</text>' +
      '<text class="small" x="' + X(WKS / 2).toFixed(0) + '" y="' + (PY + PH + 34) + '" text-anchor="middle">' + esc(T('success', '达成目标')) + '</text>' +
      '<line class="kv-cursor" y1="' + (PY - 6) + '" y2="' + (PY + PH) + '"/>' +
      [0, 5, 10, 15, 20].map(function (w) {
        return '<text class="small" x="' + X(w).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="middle">' + w + '</text>';
      }).join('') +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('weeks', '周')) + '</text>' +
      '</svg>' +
      '<div class="kv-legend">' +
      '<span><i class="kv-dot blue"></i>' + esc(T('nothing set after success', '成功后不设新目标')) + '</span>' +
      '<span><i class="kv-dot red"></i>' + esc(T('new goal set', '设定新目标')) + '</span></div>' +
      '<div class="kv-callout"></div>' +
      note('Goals direct attention to key cues, motivate effort, improve practice, provide standards and support adjustment. A very high goal can raise effort and performance, but after success the goal may no longer challenge the athlete and drive can deflate — the paradox. External rewards can also replace internal motivation once success arrives, so the purpose and the reasons for taking part are worth revisiting.', '目标把注意力引向关键线索、激励努力、改进练习、提供标准并支持调整。一个很高的目标可以提高努力与表现，但达成之后该目标可能不再构成挑战，驱动力反而下降——这就是悖论。成功后外部奖励也可能取代内在动机，因此值得重新审视目的与参与的理由。');
    var inp = host.querySelector('input');
    function draw() {
      var w = +inp.value, on = host.querySelector('.kv-tools button[data-v=new]').getAttribute('aria-pressed') === 'true';
      setv(host, 'w', '.kv-val', w + ' ' + T(w === 1 ? 'week' : 'weeks', '周'));
      marks(host, '.kv-tools', on ? 'new' : 'none');
      var d1 = '', d2 = '', i, t, v1, v2;
      for (i = 0; i <= 60; i++) {
        t = i * WKS / 60;
        v1 = t < 10 ? 34 + t * 4.6 : Math.max(22, 80 - (t - 10) * 5.8);
        v2 = t < 10 ? 34 + t * 4.6 : Math.min(98, 80 + (t - 10) * 2.2);
        d1 += (i ? ' L' : 'M') + X(t).toFixed(1) + ',' + Y(clamp(v1, 0, 100)).toFixed(1);
        d2 += (i ? ' L' : 'M') + X(t).toFixed(1) + ',' + Y(clamp(v2, 0, 100)).toFixed(1);
      }
      host.querySelector('.curve.a').setAttribute('d', d1);
      host.querySelector('.curve.b').setAttribute('d', d2);
      host.querySelector('.kv-cursor').setAttribute('x1', X(w).toFixed(1));
      host.querySelector('.kv-cursor').setAttribute('x2', X(w).toFixed(1));
      var now = w < 10 ? 34 + w * 4.6 : Math.max(22, 80 - (w - 10) * 5.8);
      outs(host, '.kv-callout', w < 10
        ? T('Approaching the goal: drive is rising, which is why a hard target can raise effort and performance.', '接近目标时驱动力在上升——这正是高目标能提高努力与表现的原因。')
        : on ? T('Success arrived at week 10, and a new process and performance goal was set, so drive continues.', '第 10 周达成目标，并设定了新的过程与表现目标，因此驱动力延续。')
          : T('Success arrived at week 10 and nothing was set: drive falls from about 80 to about 20. That is the paradox.', '第 10 周达成目标却什么都没设：驱动力从约 80 掉到约 20。这就是悖论。'));
    }
    inp.addEventListener('input', draw);
    wire(host, '.kv-tools', function () { draw(); });
    draw();
  };

  /* ══ 39 · C.5.1 Adjustment and flexible goals ═══════════════════════════
     Why a goal has to move, and what stays. */
  MODELS['Adjustment and flexible goals'] = function (host) {
    var WHY = [
      { id: 'perf', en: 'Performance plateau', zh: '表现停滞', dEn: 'the standard is reached and no longer stretches the athlete', dZh: '标准已达成，不再能拉动运动员', keep: T('progress against your own times', '对照自己的成绩看进步') },
      { id: 'injury', en: 'Injury', zh: '伤病', dEn: 'training and competing are not available', dZh: '无法训练与参赛', keep: T('quality of movement and safe rehabilitation', '动作质量与安全康复') },
      { id: 'ill', en: 'Illness', zh: '疾病', dEn: 'a period of reduced capacity', dZh: '一段能力下降的时期', keep: T('returning gradually', '逐步回归') },
      { id: 'time', en: 'Time constraint', zh: '时间限制', dEn: 'study, work or family hours cut the week', dZh: '学业、工作或家庭时间压缩了训练周', keep: T('consistency of what is left', '把剩下的时间做稳定') },
      { id: 'comp', en: 'Competition change', zh: '竞赛变化', dEn: 'a new rival, a different format, a new coach', dZh: '新对手、新赛制或新教练', keep: T('what you can control in the new situation', '在新情境中能掌控的部分') },
      { id: 'env', en: 'Environment', zh: '环境', dEn: 'facilities, funding, location or support change', dZh: '设施、经费、地点或支持发生变化', keep: T('the parts of the plan still available', '计划中仍然可用的部分') }
    ];
    var FORM = [
      { id: 'dobest', en: 'Do-your-best', zh: '尽力目标', dEn: 'maximum effort and the best strategy, without a fixed result', dZh: '追求最大努力与最佳策略，不设固定结果', keep: 82 },
      { id: 'open', en: 'Open goal', zh: '开放目标', dEn: 'experience, exploration and participation', dZh: '体验、探索与参与', keep: 90 }
    ];
    var why = 'injury', form = 'open', move = 60;
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Why is the goal being adjusted?', '为什么要调整目标？')) + '</div>' +
      tools(WHY.map(function (w) { return [w.id, T(w.en, w.zh)]; }), why) +
      srange('m', T('How much has the context moved?', '情境变化有多大？'), 0, 100, 60, 1, '60 / 100') +
      '<div class="kv-q kv-q2">' + esc(T('Which flexible form?', '采用哪种灵活形式？')) + '</div>' +
      tools(FORM.map(function (f) { return [f.id, T(f.en, f.zh)]; }), form) +
      '<div class="kv-steps"></div>' +
      meter(T('Motivation retained', '保住的动机'), 'mot') +
      meter(T('Disruption to the plan', '对计划的干扰'), 'dis', 'gold') +
      '<div class="kv-callout"></div>' +
      note('Review current performance and context, then maintain the goal, modify it or set a new one, and update the plan and strategies. Do-your-best goals focus on maximum effort and the best strategies; open goals focus on experience, exploration and participation. A goal may need adjusting because of performance, injury, illness, time constraints, competition changes or the environment.', '先回顾当前表现与情境，然后保持、修改或重设目标，并更新计划与策略。尽力目标聚焦最大努力与最佳策略；开放目标聚焦体验、探索与参与。目标可能因表现、伤病、疾病、时间限制、竞赛变化或环境而需要调整。');
    var inp = host.querySelector('input');
    function draw() {
      var w = WHY.filter(function (x) { return x.id === why; })[0], f = FORM.filter(function (x) { return x.id === form; })[0], m = +inp.value;
      setv(host, 'm', '.kv-v', m + ' / 100');
      marks(host, '.ib-why', why);
      marks(host, '.ib-form', form);
      var dis = clamp(m * (why === 'perf' ? 0.5 : 0.9), 0, 100);
      var mot = clamp(f.keep - dis * 0.55, 0, 100);
      scaleBar(host.querySelector('.mot'), mot / 100);
      scaleBar(host.querySelector('.dis'), dis / 100);
      outs(host, '.vmot', Math.round(mot) + ' %');
      outs(host, '.vdis', Math.round(dis) + ' %');
      host.querySelector('.kv-steps').innerHTML = path([
        T('Review performance and context', '回顾表现与情境'),
        T('Maintain, modify or set new', '保持、修改或重设'),
        T('Update plan and strategies', '更新计划与策略')
      ], 0);
      outs(host, '.kv-callout', T(w.en, w.zh) + ' — ' + T(w.dEn, w.dZh) + '. ' + T(f.en, f.zh) + ': ' + T(f.dEn, f.dZh) + '. ' +
        T('What stays: ', '保留下来的：') + T(w.keep, w.keepZh) + '.');
    }
    inp.addEventListener('input', draw);
    $$('.ib-why button', host).forEach(function (b) { b.addEventListener('click', function () { why = b.getAttribute('data-v'); draw(); }); });
    $$('.ib-form button', host).forEach(function (b) { b.addEventListener('click', function () { form = b.getAttribute('data-v'); draw(); }); });
    draw();
  };

  /* ══ 40 · C.5.2 Sensory imagery and functions ═════════════════════════
     How many channels are in use sets how vivid the rehearsal is. */
  MODELS['Sensory imagery and functions'] = function (host) {
    var CH = [
      { id: 'vis', en: 'Visual', zh: '视觉', dEn: 'seeing the line, the turn, the target', dZh: '看到路线、弯道、目标' },
      { id: 'aud', en: 'Auditory', zh: '听觉', dEn: 'the wind, the contact, the crowd', dZh: '风声、触球声、观众声' },
      { id: 'kin', en: 'Kinaesthetic', zh: '动觉', dEn: 'edge pressure, timing, the burn in the legs', dZh: '刃压、时机、腿部的灼热感' },
      { id: 'int', en: 'Interoceptive', zh: '内脏觉', dEn: 'breathing, heart rate, effort', dZh: '呼吸、心率、用力感' },
      { id: 'olf', en: 'Olfactory', zh: '嗅觉', dEn: 'snow, pine, chlorine', dZh: '雪、松木、氯味' },
      { id: 'gus', en: 'Gustatory', zh: '味觉', dEn: 'sweat, cold air', dZh: '汗、冷空气' }
    ];
    var FN = [
      { id: 'skill', at: 40, en: 'Skill rehearsal', zh: '技能演练' },
      { id: 'strategy', at: 55, en: 'Strategy rehearsal', zh: '策略演练' },
      { id: 'goal', at: 62, en: 'Goal setting', zh: '目标设定' },
      { id: 'arousal', at: 70, en: 'Arousal regulation', zh: '唤醒调节' },
      { id: 'conf', at: 78, en: 'Confidence and emotion', zh: '自信与情绪控制' }
    ];
    var on = { vis: 1, aud: 1, kin: 1, int: 1, olf: 0, gus: 0 }, quality = 60;
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Which channels does the athlete rehearse in?', '运动员在哪些通道上排练？')) + '</div>' +
      '<div class="ib-ch">' + CH.map(function (c) {
        return '<button type="button" data-v="' + c.id + '" class="' + (on[c.id] ? 'on' : '') + '" aria-pressed="' + (on[c.id] ? 'true' : 'false') + '">' +
          '<b>' + esc(T(c.en, c.zh)) + '</b><span>' + esc(T(c.dEn, c.dZh)) + '</span></button>';
      }).join('') + '</div>' +
      srange('q', T('How regular and controlled is the practice?', '练习有多规律、可控？'), 0, 100, 60, 1, '60 / 100') +
      meter(T('Resulting vividness', '由此产生的清晰度'), 'viv', 'gold') +
      '<div class="kv-q kv-q2">' + esc(T('Functions it unlocks', '它能开启哪些功能')) + '</div>' +
      '<div class="kv-fns"></div>' +
      '<div class="kv-callout"></div>' +
      note('Imagery can draw on visual, auditory, kinaesthetic, interoceptive, olfactory and gustatory information. Cognitive functions include skill rehearsal and strategy rehearsal; motivational functions include goal setting, arousal regulation, confidence and emotional control. Imagery is not visual-only and not limited to perfect outcomes: it can include effort, mistakes, recovery and negative scenarios.', '意象可以调用视觉、听觉、动觉、内脏觉、嗅觉与味觉信息。认知功能包括技能演练与策略演练；动机功能包括目标设定、唤醒调节、自信与情绪控制。意象并非只有视觉，也不限于完美结果：它可以包含努力、失误、恢复以及负面情境。');
    var inp = host.querySelector('input');
    function draw() {
      var q = +inp.value, n = 0, k;
      for (k in on) if (on[k]) n++;
      var viv = clamp((n / 4) * 46 + q * 0.54, 0, 100);
      setv(host, 'q', '.kv-v', q + ' / 100');
      $$('.ib-ch button', host).forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('aria-pressed') === 'true');
      });
      scaleBar(host.querySelector('.viv'), viv / 100);
      outs(host, '.vviv', Math.round(viv) + ' %');
      host.querySelector('.kv-fns').innerHTML = zones(FN.map(function (f, i) {
        var open = viv >= f.at;
        return [String(i + 1), T(f.en, f.zh), open ? T('active', '已开启') : T('needs more vividness', '需要更清晰的意象'), open ? '✓' : '·', open ? 2 : 5];
      }));
      outs(host, '.kv-callout', n < 2
        ? T('One channel alone is thin. The more channels in use, the more vivid and transferable the rehearsal.', '只用单一通道偏薄。使用的通道越多，排练越清晰、越容易迁移。')
        : T('Looks like: a skier rehearsing the line, the wind, edge pressure and the burn in the legs — and also the turn that went wrong.', '例如：滑雪者预演路线、风声、刃压与腿部的灼热感——也预演那个失误的弯道。'));
    }
    inp.addEventListener('input', draw);
    $$('.ib-ch button', host).forEach(function (b) {
      b.addEventListener('click', function () { var v = b.getAttribute('data-v'); on[v] = on[v] ? 0 : 1; draw(); });
    });
    draw();
  };

  /* ══ 41 · C.5.2 PETTLEP and imagery quality ════════════════════════════
     Seven letters, then the four qualities that decide transfer. */
  MODELS['PETTLEP and imagery quality'] = function (host) {
    var P = [
      { id: 'P', en: 'Physical', zh: '身体感觉', dEn: 'simulate the physical sensations: effort, contact, tension', dZh: '模拟身体感觉：用力、触球、紧张', ex: 'feel the legs burn through the last two turns', exZh: '感受最后两个弯道腿部的灼热' },
      { id: 'E', en: 'Environment', zh: '环境', dEn: 'rehearse in the real competition setting', dZh: '在真实比赛场景中预演', ex: 'the actual court, stands and lighting', exZh: '真实的球场、看台与灯光' },
      { id: 'T', en: 'Task', zh: '任务', dEn: 'a specific skill or strategy, not “the whole match”', dZh: '具体的技能或策略，而不是“整场比赛”', ex: 'the serve with the second serve in mind', exZh: '发球，想清楚二发' },
      { id: 'T2', en: 'Timing', zh: '时序', dEn: 'match the timing and sequence to real movement', dZh: '让时序与真实动作一致', ex: 'the ball toss, the contact, the follow-through', exZh: '抛球、触球、随挥' },
      { id: 'L', en: 'Learning', zh: '学习', dEn: 'use it for goals and to correct errors', dZh: '用于目标设定与纠错', ex: 'rehearse the version with the balanced follow-through', exZh: '预演随挥平衡的那一版' },
      { id: 'E2', en: 'Emotion', zh: '情绪', dEn: 'include the emotion that will actually be there', dZh: '包含真实会出现的情绪', ex: 'the pressure of the third set', exZh: '第三盘的 pressure' },
      { id: 'P2', en: 'Perspective', zh: '视角', dEn: 'internal or external, chosen deliberately', dZh: '内部或外部视角，有意识地选择', ex: 'from behind the eyes, or from the sideline', exZh: '从自己眼中，或从场边' }
    ];
    var pick = 'P', q = { v: 60, c: 55, s: 60, r: 50 };
    host.innerHTML =
      tools(P.map(function (p) { return [p.id, p.id + ' · ' + T(p.en, p.zh)]; }), pick) +
      '<div class="kv-el-out"><dl>' +
      '<dt>' + esc(T('What to simulate', '要模拟什么')) + '</dt><dd class="vd"></dd>' +
      '<dt>' + esc(T('In a serve rehearsal', '在发球预演中')) + '</dt><dd class="ve"></dd>' +
      '</dl></div>' +
      '<div class="kv-q kv-q2">' + esc(T('The four qualities', '四项质量')) + '</div>' +
      '<div class="kv-grid2">' +
      srange('v', T('Vivid', '清晰'), 0, 100, 60, 1, '60 / 100') +
      srange('c', T('Controllable', '可控'), 0, 100, 55, 1, '55 / 100') +
      '</div>' +
      '<div class="kv-grid2">' +
      srange('s', T('Specific', '具体'), 0, 100, 60, 1, '60 / 100') +
      srange('r', T('Regular', '规律'), 0, 100, 50, 1, '50 / 100') +
      '</div>' +
      meter(T('Likelihood of transfer', '迁移的可能性'), 'tr', 'gold') +
      '<div class="kv-callout"></div>' +
      note('PETTLEP structures Physical sensations, Environment, Task, Timing, Learning, Emotion and Perspective. Imagery that is vivid, controllable, specific and practised regularly is more likely to transfer to performance. Each letter is one decision, and the model is a checklist rather than a ritual.', 'PETTLEP 依次为身体感觉、环境、任务、时序、学习、情绪与视角。清晰、可控、具体且规律练习的意象更容易迁移到表现。每个字母都是一个决定，这个模型是一份检查表而非仪式。');
    var ins = $$('input[type=range]', host);
    function draw() {
      var p = P.filter(function (x) { return x.id === pick; })[0];
      q.v = +ins[0].value; q.c = +ins[1].value; q.s = +ins[2].value; q.r = +ins[3].value;
      setv(host, 'v', '.kv-v', q.v + ' / 100');
      setv(host, 'c', '.kv-v', q.c + ' / 100');
      setv(host, 's', '.kv-v', q.s + ' / 100');
      setv(host, 'r', '.kv-v', q.r + ' / 100');
      marks(host, '.kv-tools', pick);
      outs(host, '.vd', T(p.dEn, p.dZh));
      outs(host, '.ve', T(p.ex, p.exZh));
      var tr = (q.v * .3 + q.c * .24 + q.s * .26 + q.r * .2);
      scaleBar(host.querySelector('.tr'), tr / 100);
      outs(host, '.vtr', Math.round(tr) + ' %');
      outs(host, '.kv-callout', p.id + ' — ' + T(p.en, p.zh) + ': ' + T(p.dEn, p.dZh) + '. ' +
        (tr > 70 ? T('Quality is high enough that this should show up in performance.', '质量足够高，这部分内容应能体现在表现中。')
          : T('The weakest link is quality, not the model: raise the scores above.', '短板是质量而不是模型：把上面四项分数提上去。')));
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); });
    wire(host, '.kv-tools', function (v) { pick = v; draw(); });
    draw();
  };

  /* ══ 42 · C.5.2 Paivio, specificity and applications ═════════════════
     Two channels, two functions, and when to use it. */
  MODELS['Paivio, specificity and applications'] = function (host) {
    var WHEN = [
      { id: 'pre', en: 'Before training', zh: '训练前', f: ['plan the session', 'set the focus', 'visualise the first action'], fZh: ['规划训练课', '设定注意焦点', '想象第一个动作'], sp: 1 },
      { id: 'comp', en: 'Before competition', zh: '比赛前', f: ['prepare for the event', 'regulate arousal', 'build confidence'], fZh: ['为比赛做准备', '调节唤醒', '建立自信'], sp: 1 },
      { id: 'post', en: 'After performance', zh: '表现之后', f: ['review what happened', 'correct the error', 'rehearse the fix'], fZh: ['回顾发生了什么', '纠正错误', '预演修正'], sp: 1 }
    ];
    var Q = {
      cog: { en: 'Cognitive', zh: '认知性', verb: 'non-verbal channels carry the rehearsal of a skill or plan', verbZh: '非语言通道承载技能或计划的预演' },
      mot: { en: 'Motivational', zh: '动机性', verb: 'verbal channels carry goals, confidence and arousal', verbZh: '语言通道承载目标、自信与唤醒' },
      spec: { en: 'Specific', zh: '具体', verb: 'detailed, concrete and sport-specific', verbZh: '细致、具体且针对本项目' },
      gen: { en: 'General', zh: '一般', verb: 'broad and outcome-focused; useful for direction, weak for detail', verbZh: '宽泛且以结果为主：适合定方向，细节弱' }
    };
    var when = 'comp', ch = 'cog', spec = 'spec';
    var PX = 78, PY = 44, PW = 442, PH = 228;
    function X(v) { return PX + v / 100 * PW; }
    function Y(v) { return PY + PH - v / 100 * PH; }
    host.innerHTML =
      '<div class="kv-q">' + esc(T('When is the imagery used?', '在什么时候使用意象？')) + '</div>' +
      seg(WHEN.map(function (w) { return [w.id, T(w.en, w.zh)]; }), when) +
      '<div class="kv-q kv-q2">' + esc(T('Which channel carries it?', '用哪个通道承载？')) + '</div>' +
      tools([['cog', T('Non-verbal — picture and feel', '非语言——画面与感觉')], ['mot', T('Verbal — words and self-talk', '语言——词语与自我对话')]], ch) +
      '<svg class="kv-svg" viewBox="0 0 560 340" role="img" aria-label="' + esc(T('Paivio’s two channels and two functions', 'Paivio 的两个通道与两种功能')) + '">' +
      '<rect class="q1" x="' + PX + '" y="' + PY + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<rect class="q2" x="' + (PX + PW / 2).toFixed(1) + '" y="' + PY + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<rect class="q2" x="' + PX + '" y="' + (PY + PH / 2).toFixed(1) + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<rect class="q1" x="' + (PX + PW / 2).toFixed(1) + '" y="' + (PY + PH / 2).toFixed(1) + '" width="' + (PW / 2).toFixed(1) + '" height="' + (PH / 2).toFixed(1) + '"/>' +
      '<text class="small" x="' + (PX + 12) + '" y="' + (PY + 20) + '">' + esc(T('non-verbal', '非语言')) + '</text>' +
      '<text class="small" x="' + (PX + PW - 12) + '" y="' + (PY + 20) + '" text-anchor="end">' + esc(T('verbal', '语言')) + '</text>' +
      '<text class="small" x="' + (PX + 12) + '" y="' + (PY + PH - 10) + '">' + esc(T('specific', '具体')) + '</text>' +
      '<text class="small" x="' + (PX + PW - 12) + '" y="' + (PY + PH - 10) + '" text-anchor="end">' + esc(T('general', '一般')) + '</text>' +
      '<circle class="marker" r="9" cx="0" cy="0"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>' +
      '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>' +
      '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' + esc(T('verbal → motivational', '语言 → 动机')) + '</text>' +
      '</svg>' +
      '<div class="kv-fns2"></div>' +
      meter(T('Transfer to performance', '迁移到表现'), 'tr', 'gold') +
      '<div class="kv-callout"></div>' +
      note('Paivio’s dual coding framework uses verbal and non-verbal channels, corresponding to cognitive and motivational functions. Imagery can be specific and concrete or general and abstract. Applications are skill acquisition, competition strategy, confidence, motivation and arousal regulation: before training, use it to plan and focus; before competition, to prepare and regulate; after performance, to review and learn.', 'Paivio 的双编码框架使用语言与非语言两个通道，分别对应认知与动机功能。意象可以是具体细致的，也可以是宽泛抽象的。应用包括技能获得、比赛策略、自信、动机与唤醒调节：训练前用于计划与聚焦；比赛前用于准备与调节；表现之后用于回顾与学习。');
    function draw() {
      var w = WHEN.filter(function (x) { return x.id === when; })[0];
      marks(host, '.kv-seg', when);
      marks(host, '.kv-tools', ch);
      var lv = ch === 'cog' ? 1 : 3, ls = spec === 'spec' ? 0 : 2;
      var m = host.querySelector('.marker');
      m.setAttribute('cx', X(ls === 0 ? 22 : 78).toFixed(1));
      m.setAttribute('cy', Y(lv === 1 ? 74 : 26).toFixed(1));
      m.classList.toggle('ok', spec === 'spec' && ch === 'cog');
      m.classList.toggle('risk', !(spec === 'spec' && ch === 'cog'));
      host.querySelector('.kv-fns2').innerHTML = zones([
        ['1', T(w.f[0], w.fZh[0]), '', '', 2], ['2', T(w.f[1], w.fZh[1]), '', '', 2], ['3', T(w.f[2], w.fZh[2]), '', '', 2]
      ]);
      var tr = clamp((spec === 'spec' ? 74 : 40) + (ch === 'cog' ? 12 : 4) + (when === 'post' ? 8 : 0), 0, 100);
      scaleBar(host.querySelector('.tr'), tr / 100);
      outs(host, '.vtr', tr + ' %');
      outs(host, '.kv-callout', T(Q[ch].en, Q[ch].zh) + ' — ' + T(Q[ch].verb, Q[ch].verbZh) + '. ' +
        T(Q[spec].en, Q[spec].zh) + ': ' + T(Q[spec].verb, Q[spec].verbZh) + '. ' +
        T('Looks like: ', '例如：') + T('a skier sees a clean run, hears the wind, feels the balance — and imagines correcting the turn that went wrong.', '滑雪者看到干净的一滑、听到风声、感到平衡——并想象修正那个失误的弯道。'));
    }
    wireSeg(host, function (v) { when = v; draw(); });
    wire(host, '.kv-tools', function (v) { ch = v; spec = v === 'cog' ? 'spec' : 'gen'; draw(); });
    draw();
  };

/* ══ A.1.1 · Learn it your way ═════════════════════════════════════════
   The Vitalité textbook panel, mounted at the top of one section: the same
   heading and sub-line, the same Concise / Full switch, the same gradient
   progress bar reading "N of M sections read", and the same three tab
   shapes (Flip cards · Quick check · Chapter map). The textbook's
   Interactive tab is deliberately NOT here — each section carries its own
   interactive model further down, and two interactive panels per section
   would compete.
   The flip cards are built from this section's own key terms, so the chips
   under the prose and the cards in the deck are one dataset. */

  /* key terms worth memorising: term -> what it means, in both languages */
  var KT = {
    'Synapse': ['突触', 'The gap between two nerve cells; the signal has to jump it.', '两个神经细胞之间的空隙，信号必须跨越它。'],
    'Neurotransmitter': ['神经递质', 'The chemical released into the cleft to carry the signal across.', '释放到突触间隙、用来把信号传过去的化学物质。'],
    'Receptor': ['受体', 'A protein shaped so one specific signal fits it. Nothing else gets through.', '形状只与某一种信号匹配的蛋白，别的信号进不来。'],
    'Gland': ['腺体', 'An organ whose job is to make and release hormones.', '专门制造并释放激素的器官。'],
    'Hormone': ['激素', 'A chemical released into the blood, acting only on cells with the matching receptor.', '释放到血液中、只作用于带相应受体的细胞的化学物质。'],
    'Target cell': ['靶细胞', 'A cell with the right receptor, so the hormone actually changes it.', '带有正确受体、因而会被激素改变的细胞。']
  };
  function ktHTML() {
    return Object.keys(KT).map(function (k) {
      return '<button type="button" data-v="' + esc(k) + '" aria-pressed="false">' + esc(T(k, KT[k][0])) + '</button>';
    }).join('');
  }
  function ktCard(k) {
    return { f: T(k, KT[k][0]), b: T(KT[k][1], KT[k][2]) };
  }
  var A11_QC = [
    { q: 'Which two things earn the mark when you compare the two systems?', a: 'Speed and reach.', zq: '比较这两套系统时，哪两点才是得分点？', za: '速度与范围。' },
    { q: 'Why can a hormone never start a fast movement?', a: 'It travels in blood, which takes seconds — a nerve signal takes milliseconds.', zq: '为什么激素无法启动快速动作？', za: '激素靠血液运输，需要数秒；神经信号只需毫秒。' },
    { q: 'What makes a cell a target cell?', a: 'It carries the receptor that matches that hormone. Every other cell ignores it.', zq: '一个细胞凭什么才算靶细胞？', za: '它带有与该激素匹配的受体，其他细胞都会忽略它。' }
  ];

  function learnPanel(host, opts) {
    var ch = opts.chapter || 1, total = opts.total || 0;
    var READ = 'ib_read_sections';
    function readSet() {
      var all = load(READ, {});
      return all[ch] || [];
    }
    function markRead() {
      var all = load(READ, {}), a = all[ch] || [];
      if (a.indexOf(opts.id) < 0) { a.push(opts.id); all[ch] = a; save(READ, all); }
    }
    var state = { tab: 'fc', i: 0, known: load('ib_known_kt', {}) };
    host.innerHTML =
      '<div class="ib-learn-hd">' +
      '<h4>' + esc(T('Learn it your way', '选择你的学法')) + '</h4>' +
      seg([['concise', T('Concise', '精简')], ['full', T('Full', '完整')]], mode()) +
      '<p>' + esc(T('Play with it, flip it, test it — then read the key points below.', '动手玩、翻卡、自测——再读下面的要点。')) + '</p>' +
      '</div>' +
      '<div class="ib-learn-prog"><div class="ib-learn-bar"><i></i></div><span></span></div>' +
      '<div class="ib-learn-tabs" role="tablist">' +
      '<button type="button" data-v="fc">' + esc(T('🃏 Flip cards', '🃏 闪卡')) + '</button>' +
      '<button type="button" data-v="qc">' + esc(T('✓ Quick check', '✓ 快速检查')) + '</button>' +
      '<button type="button" data-v="map">' + esc(T('🗺 Chapter map', '🗺 本章地图')) + '</button>' +
      '</div>' +
      '<div class="ib-kt">' + ktHTML() + '</div>' +
      '<div class="ib-learn-pane" data-p="fc"></div>' +
      '<div class="ib-learn-pane" data-p="qc" hidden></div>' +
      '<div class="ib-learn-pane" data-p="map" hidden></div>';

    function prog() {
      var done = readSet().length, tot = opts.total || 0;
      host.querySelector('.ib-learn-bar i').style.width = (tot ? done / tot * 100 : 0).toFixed(1) + '%';
      host.querySelector('.ib-learn-prog span').textContent = tot
        ? T(done + ' of ' + tot + ' sections read', '已读 ' + done + ' / ' + tot + ' 节')
        : T(done + ' read', '已读 ' + done + ' 节');
    }
    function cards() {
      var keys = Object.keys(KT), p = host.querySelector('[data-p=fc]');
      if (state.i >= keys.length) state.i = 0;
      var k = keys[state.i], c = ktCard(k), known = !!state.known[k];
      p.innerHTML = '<div class="kn-fc"><button type="button" class="kn-card" aria-live="polite">' +
        '<span class="kn-face kn-front"></span><span class="kn-face kn-back"></span></button>' +
        '<div class="kn-fc-bar"><button type="button" class="kv-btn kn-prev">' + esc(T('← Previous', '← 上一张')) + '</button>' +
        '<span class="kn-fc-n"></span>' +
        '<button type="button" class="kv-btn kn-got' + (known ? ' on' : '') + '">' + (known ? esc(T('✓ Known', '✓ 已掌握')) : esc(T('I know this', '我会了'))) + '</button>' +
        '<button type="button" class="kv-btn kn-next">' + esc(T('Next →', '下一张 →')) + '</button></div></div>';
      var card = p.querySelector('.kn-card');
      card.querySelector('.kn-front').textContent = c.f;
      card.querySelector('.kn-back').textContent = c.b;
      p.querySelector('.kn-fc-n').textContent = (state.i + 1) + ' / ' + keys.length + ' · ' +
        T(Object.keys(state.known).length + ' known', '已掌握 ' + Object.keys(state.known).length);
      card.onclick = function () {
        card.classList.toggle('flipped');
        if (card.classList.contains('flipped')) markRead();
      };
      p.querySelector('.kn-prev').onclick = function () { state.i = (state.i - 1 + keys.length) % keys.length; cards(); };
      p.querySelector('.kn-next').onclick = function () { state.i = (state.i + 1) % keys.length; cards(); };
      p.querySelector('.kn-got').onclick = function () {
        if (state.known[k]) delete state.known[k]; else state.known[k] = 1;
        save('ib_known_kt', state.known); cards(); prog();
      };
    }
    function quick() {
      var p = host.querySelector('[data-p=qc]');
      p.innerHTML = '<div class="ib-qc">' + A11_QC.map(function (q) {
        return '<div class="ib-qc-item"><p><b>' + esc(T(q.q, q.zq)) + '</b></p>' +
          '<p class="ib-ans">' + esc(T(q.a, q.za)) + '</p></div>';
      }).join('') + '</div>';
    }
    function mapPane() {
      var p = host.querySelector('[data-p=map]'), done = readSet();
      p.innerHTML = '<div class="ib-map">' + (opts.map || []).map(function (m) {
        var isDone = done.indexOf(m[2]) > -1;
        return '<button type="button" data-go="' + esc(m[2]) + '" class="' + (isDone ? 'done' : '') +
          (m[2] === opts.id ? ' on' : '') + '">' + esc(T(m[0], m[1])) + '</button>';
      }).join('') + '</div>';
    }
    function show(tab) {
      state.tab = tab;
      $$('.ib-learn-tabs button', host).forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-v') === tab);
      });
      ['fc', 'qc', 'map'].forEach(function (k) {
        var n = host.querySelector('[data-p=' + k + ']');
        if (n) n.hidden = (k !== tab);
      });
      if (tab === 'fc') cards();
      if (tab === 'qc') quick();
      if (tab === 'map') mapPane();
    }
    host.addEventListener('click', function (e) {
      var tab = e.target.closest && e.target.closest('.ib-learn-tabs button');
      if (tab && host.contains(tab)) { show(tab.getAttribute('data-v')); return; }
      var chip = e.target.closest && e.target.closest('.ib-kt button');
      if (chip && host.contains(chip)) {
        var k = chip.getAttribute('data-v'), keys = Object.keys(KT);
        state.i = Math.max(0, keys.indexOf(k));
        show('fc');
        $$('.ib-kt button', host).forEach(function (b) { b.classList.toggle('on', b === chip); });
      }
      var go = e.target.closest && e.target.closest('.ib-map button');
      if (go && host.contains(go)) {
        var t = go.getAttribute('data-go');
        var item = document.getElementById('ib-topic-' + t);
        if (item) {
          var h = item.querySelector('.acc-header');
          if (h && !item.classList.contains('open')) toggleAcc(h);
          if (item.scrollIntoView) item.scrollIntoView({ block: 'start' });
        }
      }
    });
    host._ibLang = zh(); host._ibMode = mode();
    wireSeg(host, function (v) { save(MODE_KEY, v); learnRender(host); });
    prog();
    show('fc');
  }

/* ══ A.1.1 · Communication systems — shape-based model ═══════════════════
   Drawn as objects, not boxes:
     A · nerve    — a synaptic knob on an axon, vesicles released into a real
                    cleft, landing on pentameric (5-subunit) receptors set
                    into the sarcolemma of a striated, multinucleate fibre
     B · hormone  — a gland follicle, then a vessel drawn as a tube with its
                    three real layers named, biconcave red cells in a clear
                    lumen, and a lock-and-key test: only the cell whose
                    receptor notch matches accepts the hormone
     C · which clock — clear x and y axes, one slider, and at every moment
                    the neural / hormonal split plus a sentence naming the
                    relationship between them.
   Histology: StatPearls NBK537236 (striated muscle, peripheral nuclei),
   Smart & Paoletti PMC3282413 (pentameric ligand-gated receptor),
   StatPearls NBK554407 (tunica intima / media / adventitia, biconcave
   erythrocytes), StatPearls NBK519566 (follicle). */

  var T0 = Math.log(0.01), T1 = Math.log(48 * 3600);   /* 10 ms → 48 h, in seconds */
  function neural(t) { return 100 * Math.exp(-t / 0.04); }
  function hormonal(t) { var s = 1 / (1 + Math.exp(-(Math.log(t) - Math.log(240)) / 0.9)); return 100 * s * Math.exp(-t / 21600); }
  function fmtT(t) {
    var z = zh();
    if (t < 1) return Math.round(t * 1000) + (z ? ' 毫秒' : ' ms');
    if (t < 60) return (Math.round(t * 10) / 10) + (z ? ' 秒' : ' s');
    if (t < 3600) return Math.round(t / 60) + (z ? ' 分钟' : ' min');
    if (t < 86400) return Math.round(t / 360) / 10 + (z ? ' 小时' : ' h');
    return Math.round(t / 8640) / 10 + (z ? ' 天' : ' d');
  }
  function what(t) {
    var n = neural(t), h = hormonal(t), s = n + h;
    if (s <= 0.0001) return { nn: 0, nh: 0 };
    return { nn: n / s * 100, nh: h / s * 100 };
  }

  MODELS['Communication systems'] = function (host, mode) {
    var full = mode === 'full';
    var HEAD = '<defs><marker id="nsHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">' +
      '<path class="ns-head" d="M0 0 L10 5 L0 10 z"/></marker></defs>';

    /* ─────────── A · nerve — a knob, a cleft, a receptor, a fibre ─────── */
    function nerveSVG() {
      var s = '<svg class="kv-svg" viewBox="0 0 560 300" role="img" aria-label="' +
        esc(T('A nerve signal crossing a synapse onto a muscle fibre', '神经信号跨过突触到达肌纤维')) + '">';
      s += HEAD;
      /* the axon arriving, with a clear arrow that points INTO the picture */
      s += '<rect class="ns-axon" x="26" y="50" width="104" height="20" rx="10"/>';
      s += '<path class="ns-arrow" d="M4 60 L22 60" marker-end="url(#nsHead)"/>';
      s += '<text class="small" x="26" y="42" text-anchor="start">' + esc(T('1 · electrical', '1 · 电信号')) + '</text>';
      /* the synaptic knob */
      s += '<ellipse class="ns-term" cx="176" cy="60" rx="54" ry="44"/>';
      var ves = [[152, 44], [186, 36], [214, 48], [166, 68], [200, 72], [226, 66], [148, 78], [182, 86], [214, 88]];
      ves.forEach(function (v, i) {
        s += '<circle class="ns-ves" cx="' + v[0] + '" cy="' + v[1] + '" r="7" style="--d:' + (i * 0.13) + 's"/>';
        s += '<circle class="ns-vesdot" cx="' + v[0] + '" cy="' + v[1] + '" r="2.2"/>';
      });
      s += '<text class="small" x="252" y="40" text-anchor="start">' + esc(T('vesicles', '突触小泡')) + '</text>';
      s += '<line class="ns-lead" x1="240" y1="42" x2="206" y2="44"/>';
      /* release: transmitter crossing the cleft */
      s += '<rect class="ns-cleft" x="132" y="122" width="88" height="30" rx="8"/>';
      s += '<text class="small" x="176" y="149" text-anchor="middle">' + esc(T('synaptic cleft', '突触间隙')) + '</text>';
      var nt = [[148, 130], [168, 134], [188, 129], [206, 133], [156, 136], [198, 130]];
      nt.forEach(function (p, i) {
        s += '<circle class="ns-nt" cx="' + p[0] + '" cy="' + p[1] + '" r="3.6" style="--d:' + (0.1 + i * 0.11) + 's"/>';
      });
      s += '<text class="small" x="124" y="141" text-anchor="end">' + esc(T('2 · chemical', '2 · 化学递质')) + '</text>';

      /* the muscle fibre: tapered ends, striations, nuclei at the edge */
      s += '<path class="ns-fibre" d="M92 186 h300 a54 54 0 0 1 0 92 h-300 a54 54 0 0 1 0 -92 z"/>';
      var x = 108;
      while (x < 384) { s += '<rect class="ns-stria" x="' + x + '" y="198" width="7" height="68" rx="3"/>'; x += 18; }
      [[124, 210], [232, 258], [318, 206], [372, 254]].forEach(function (n) {
        s += '<ellipse class="ns-nuc" cx="' + n[0] + '" cy="' + n[1] + '" rx="12" ry="7.5"/>';
      });
      /* the pentameric receptors, straddling the sarcolemma at y = 186 */
      [148, 176, 204].forEach(function (cx, k) {
        for (var i = 0; i < 5; i++) {
          var a = -Math.PI / 2 + i * 2 * Math.PI / 5;
          s += '<circle class="ns-sub' + (k === 1 ? ' open' : '') + '" cx="' + (cx + Math.cos(a) * 10).toFixed(1) +
            '" cy="' + (184 + Math.sin(a) * 9).toFixed(1) + '" r="5.4"/>';
        }
        s += '<circle class="ns-pore" cx="' + cx + '" cy="184" r="4.2"/>';
      });
      /* 3 · the signal is electrical again, driving the fibre */
      s += '<path class="ns-arrow" d="M262 160 L262 180" marker-end="url(#nsHead)"/>';
      s += '<text class="small" x="276" y="166" text-anchor="start">' + esc(T('3 · electrical again', '3 · 再次变为电信号')) + '</text>';
      /* labels down the right-hand side, each with its own leader */
      s += '<text class="small" x="470" y="168" text-anchor="start">' + esc(T('receptors', '受体')) + '</text>';
      s += '<line class="ns-lead" x1="466" y1="166" x2="214" y2="182"/>';
      s += '<text class="small" x="470" y="232" text-anchor="start">' + esc(T('striations', '横纹')) + '</text>';
      s += '<line class="ns-lead" x1="466" y1="230" x2="300" y2="232"/>';
      s += '<text class="small" x="470" y="258" text-anchor="start">' + esc(T('nuclei at the edge', '边缘的细胞核')) + '</text>';
      s += '<line class="ns-lead" x1="466" y1="256" x2="384" y2="256"/>';
      s += '</svg>';
      return s;
    }

    /* ─────────── B · hormone — gland, vessel, lock-and-key ───────────── */
    function hormoneSVG() {
      var s = '<svg class="kv-svg" viewBox="0 0 560 300" role="img" aria-label="' +
        esc(T('A hormone leaving a gland, travelling in blood, reaching only target cells', '激素离开腺体进入血液，只作用于靶细胞')) + '">';
      s = s.replace('viewBox="0 0 560 300"', 'viewBox="0 0 560 246"');
      s += HEAD;
      /* the follicle: secretory cells in a ring around a lumen */
      s += '<circle class="ns-lumen" cx="64" cy="150" r="26"/>';
      for (var i = 0; i < 9; i++) {
        var a = i * 2 * Math.PI / 9 - Math.PI / 2, cx = 64 + Math.cos(a) * 42, cy = 150 + Math.sin(a) * 42;
        s += '<rect class="ns-secrecyte" x="' + (cx - 10).toFixed(1) + '" y="' + (cy - 10).toFixed(1) +
          '" width="20" height="20" rx="7" transform="rotate(' + (i * 40) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')"/>';
      }
      s += '<text class="small" x="64" y="222" text-anchor="middle">' + esc(T('gland follicle', '腺泡')) + '</text>';
      /* the hormone leaving the gland, and entering the vessel */
      [[100, 132], [112, 150], [104, 168]].forEach(function (p, i) {
        s += '<circle class="ns-hor" cx="' + p[0] + '" cy="' + p[1] + '" r="4.6" style="--d:' + (i * 0.3) + 's"/>';
      });
      s += '<path class="ns-arrow" d="M118 150 L134 150" marker-end="url(#nsHead)"/>';

      /* the vessel as a tube, layers named above with short leaders */
      s += '<text class="small" x="176" y="46" text-anchor="middle">' + esc(T('adventitia', '外膜')) + '</text>';
      s += '<text class="small" x="266" y="46" text-anchor="middle">' + esc(T('media', '中膜')) + '</text>';
      s += '<text class="small" x="356" y="46" text-anchor="middle">' + esc(T('endothelium', '内皮')) + '</text>';
      s += '<line class="ns-lead" x1="176" y1="52" x2="176" y2="112"/>';
      s += '<line class="ns-lead" x1="266" y1="52" x2="266" y2="120"/>';
      s += '<line class="ns-lead" x1="356" y1="52" x2="356" y2="128"/>';
      s += '<rect class="ns-adventitia" x="140" y="112" width="252" height="76" rx="38"/>';
      s += '<rect class="ns-media" x="148" y="120" width="236" height="60" rx="30"/>';
      s += '<rect class="ns-endothelium" x="156" y="128" width="220" height="44" rx="22"/>';
      s += '<rect class="ns-lumen2" x="166" y="137" width="200" height="26" rx="13"/>';
      /* biconcave red cells, one clear row inside the lumen */
      [190, 236, 282, 328].forEach(function (px, i) {
        s += '<ellipse class="ns-rbc" cx="' + px + '" cy="150" rx="16" ry="9" style="--d:' + (i * 0.3) + 's"/>';
        s += '<ellipse class="ns-rbc-in" cx="' + px + '" cy="150" rx="7" ry="3.6"/>';
      });
      /* the hormone riding in the plasma between them */
      [213, 259, 305, 351].forEach(function (px, i) {
        s += '<circle class="ns-hor" cx="' + px + '" cy="150" r="5" style="--d:' + (0.15 + i * 0.3) + 's"/>';
      });
      s += '<text class="small" x="266" y="216" text-anchor="middle">' + esc(T('hormone carried in the blood', '血液运送的激素')) + '</text>';
      s += '<path class="ns-arrow" d="M396 150 L412 150" marker-end="url(#nsHead)"/>';

      /* the lock-and-key test: only the cell whose notch matches accepts it */
      var cells = [{ y: 70, hit: 0 }, { y: 126, hit: 1 }, { y: 182, hit: 0 }];
      cells.forEach(function (c) {
        var top = c.y - 24;
        s += '<path class="ns-cell' + (c.hit ? ' hit' : '') + '" d="M444 ' + top + ' h84 a24 24 0 0 1 0 48 h-84 a24 24 0 0 1 0 -48 z"/>';
        s += '<ellipse class="ns-cnuc" cx="458" cy="' + (c.y + 8) + '" rx="8" ry="6.5"/>';
        /* the notch: round on the target cell, square on the others, so the
           mismatch is a shape the eye can see, not just a colour */
        if (c.hit) {
          s += '<path class="ns-key fit" d="M446 ' + (c.y - 9) + ' a9 9 0 0 0 0 18 z"/>';
          s += '<circle class="ns-hor dock" cx="450" cy="' + c.y + '" r="5"/>';
          s += '<text class="small" x="534" y="' + (c.y + 5) + '" text-anchor="end">' + esc(T('target', '靶细胞')) + '</text>';
        } else {
          s += '<rect class="ns-key" x="444" y="' + (c.y - 9) + '" width="16" height="18" rx="3"/>';
          s += '<circle class="ns-hor drift" cx="488" cy="' + c.y + '" r="5" style="--d:' + (c.y / 40) + 's"/>';
          s += '<text class="small" x="534" y="' + (c.y + 5) + '" text-anchor="end">' + esc(T('no fit', '不匹配')) + '</text>';
        }
      });
      s += '</svg>';
      return s;
    }

    /* ─────────── C · which clock — 10 ms to 2 days on one honest axis ─── */
    var PX = 66, PW = 452, PY = 24, PH = 176;
    function X(t) { return PX + (Math.log(t) - T0) / (T1 - T0) * PW; }
    function Y(v) { return PY + PH - clamp(v, 0, 100) / 100 * PH; }
    function curve(fn) {
      var d = '', N = 170;
      for (var i = 0; i <= N; i++) {
        var t = Math.exp(T0 + (T1 - T0) * i / N);
        d += (i ? ' L' : 'M') + X(t).toFixed(1) + ' ' + Y(fn(t)).toFixed(1);
      }
      return d;
    }
    var TICKS = [[0.01, '10 ms'], [0.1, '100 ms'], [1, '1 s'], [60, '1 min'], [3600, '1 h'], [86400, '1 d']];
    function clockSVG() {
      var s = '<svg class="kv-svg" viewBox="0 0 560 250" role="img" aria-label="' +
        esc(T('Neural and hormonal contribution over time', '神经与激素贡献随时间的变化')) + '">';
      [0, 25, 50, 75, 100].forEach(function (p) {
        s += '<line class="gl" x1="' + PX + '" y1="' + Y(p) + '" x2="' + (PX + PW) + '" y2="' + Y(p) + '"/>';
        s += '<text class="small" x="' + (PX - 8) + '" y="' + (Y(p) + 4) + '" text-anchor="end">' + p + '</text>';
      });
      s += '<line class="axis" x1="' + PX + '" y1="' + PY + '" x2="' + PX + '" y2="' + (PY + PH) + '"/>';
      s += '<line class="axis" x1="' + PX + '" y1="' + (PY + PH) + '" x2="' + (PX + PW) + '" y2="' + (PY + PH) + '"/>';
      s += '<text class="small" x="' + (PX - 50) + '" y="' + (PY - 8) + '">' + esc(T('response %', '反应强度 %')) + '</text>';
      s += '<path class="ns-hcurve" d="' + curve(hormonal) + '"/>';
      s += '<path class="ns-ncurve" d="' + curve(neural) + '"/>';
      s += '<line class="kv-cursor" y1="' + (PY - 8) + '" y2="' + (PY + PH) + '"/>';
      s += '<circle class="ns-ndot" r="5.5"/>';
      s += '<circle class="ns-hdot" r="5.5"/>';
      TICKS.forEach(function (t, k) {
        s += '<text class="small" x="' + X(t[0]).toFixed(0) + '" y="' + (PY + PH + 18) + '" text-anchor="' +
          (k === 0 ? 'start' : k === TICKS.length - 1 ? 'end' : 'middle') + '">' + t[1] + '</text>';
      });
      s += '<text class="small" x="' + (PX + PW) + '" y="' + (PY + PH + 34) + '" text-anchor="end">' +
        esc(T('time after the stimulus', '刺激后时间')) + '</text>';
      s += '<text class="small nsn-h" x="' + (X(0.03) + 10) + '" y="' + (Y(neural(0.03)) + 22) + '">' + esc(T('nerve', '神经')) + '</text>';
      s += '<text class="small nsn-n" x="' + (X(900) + 8) + '" y="' + (Y(hormonal(900)) - 12) + '">' + esc(T('hormone', '激素')) + '</text>';
      s += '</svg>';
      return s;
    }

    host.innerHTML =
      '<div class="a11-wrap">' +
      '<div class="a11-panel" data-p="a">' +
      '<div class="a11-hd"><b>' + esc(T('A · the nerve route', 'A · 神经通路')) + '</b>' +
      '<span>' + esc(T('electrical, then a chemical, then electrical again', '电信号 → 化学递质 → 再次电信号')) + '</span></div>' +
      nerveSVG() +
      '<div class="kv-legend a11-leg">' +
      '<span><i class="ns-l1"></i>' + esc(T('synaptic knob', '突触小体')) + '</span>' +
      '<span><i class="ns-l2"></i>' + esc(T('neurotransmitter', '神经递质')) + '</span>' +
      '<span><i class="ns-l3"></i>' + esc(T('receptor', '受体')) + '</span>' +
      '<span><i class="ns-l4"></i>' + esc(T('striated muscle fibre', '骨骼肌纤维')) + '</span>' +
      '</div></div>' +
      '<div class="a11-panel" data-p="b">' +
      '<div class="a11-hd"><b>' + esc(T('B · the hormone route', 'B · 激素通路')) + '</b>' +
      '<span>' + esc(T('into the blood, then only the cells whose receptor fits', '进入血液，只作用于受体匹配的细胞')) + '</span></div>' +
      hormoneSVG() +
      '<div class="kv-legend a11-leg">' +
      '<span><i class="ns-l5"></i>' + esc(T('gland follicle', '腺泡')) + '</span>' +
      '<span><i class="ns-l6"></i>' + esc(T('vessel wall', '血管壁')) + '</span>' +
      '<span><i class="ns-l7"></i>' + esc(T('red blood cell', '红细胞')) + '</span>' +
      '<span><i class="ns-l8"></i>' + esc(T('hormone', '激素')) + '</span>' +
      '<span><i class="ns-l9"></i>' + esc(T('target cell', '靶细胞')) + '</span>' +
      '</div></div>' +
      '<div class="a11-panel" data-p="c">' +
      '<div class="a11-hd"><b>' + esc(T('C · which clock', 'C · 哪一种时间尺度')) + '</b>' +
      '<span>' + esc(T('drag the time and watch the balance change', '拖动时间，观察两种系统的占比变化')) + '</span></div>' +
      '<label class="kv-lab" data-v="t"><span class="ibm-q">' + esc(T('How long after the stimulus?', '刺激后过了多久？')) +
      ' <b class="kv-v"></b></span>' +
      '<input type="range" min="0" max="1000" value="640" step="1" aria-label="' + esc(T('Time after the stimulus', '刺激后时间')) + '"></label>' +
      clockSVG() +
      '<div class="kv-stack a11-bar"><i class="a11-n"></i><i class="a11-h"></i></div>' +
      '<div class="kv-legend">' +
      '<span><i class="kv-dot ns-nl"></i>' + esc(T('Nervous', '神经')) + ' <b class="a11-pn"></b></span>' +
      '<span><i class="kv-dot ns-hl"></i>' + esc(T('Hormonal', '激素')) + ' <b class="a11-ph"></b></span></div>' +
      '<div class="kv-callout"></div>' +
      note('The split is a share of the response at that moment, not a claim that one system switches off. Nervous control dominates in the first milliseconds; hormonal control takes over once the neural signal has already finished. Most sport responses use both — a reflex to start, hormones to sustain.', '此处的比例表示该时刻两种系统对反应的贡献占比，并不代表其中一套系统停止工作。最初几毫秒以神经控制为主；当神经信号已经结束时，激素控制接管。多数运动反应同时使用两者：用反射启动，用激素维持。') +
      '</div></div>';

    var inp = host.querySelector('input[type=range]');
    function draw() {
      var t = Math.exp(T0 + (T1 - T0) * inp.value / 1000), s = what(t);
      setv(host, 't', '.kv-v', fmtT(t));
      var cx = X(t).toFixed(1);
      var cur = host.querySelector('.kv-cursor');
      cur.setAttribute('x1', cx); cur.setAttribute('x2', cx);
      host.querySelector('.ns-ndot').setAttribute('cx', cx);
      host.querySelector('.ns-ndot').setAttribute('cy', Y(neural(t)).toFixed(1));
      host.querySelector('.ns-hdot').setAttribute('cx', cx);
      host.querySelector('.ns-hdot').setAttribute('cy', Y(hormonal(t)).toFixed(1));
      host.querySelector('.a11-n').style.flexGrow = Math.max(s.nn, 0.0001).toFixed(2);
      host.querySelector('.a11-h').style.flexGrow = Math.max(s.nh, 0.0001).toFixed(2);
      outs(host, '.a11-pn', Math.round(s.nn) + '%');
      outs(host, '.a11-ph', Math.round(s.nh) + '%');
      outs(host, '.kv-callout', t < 0.2
        ? T('At ' + fmtT(t) + ' the response is almost entirely neural: the reflex arc has already fired and no hormone has had time to travel anywhere.', '在' + fmtT(t) + '时，反应几乎完全来自神经：反射弧已经触发，而还没有任何激素来得及到达。')
        : t < 60
          ? T('At ' + fmtT(t) + ' the neural signal is over and the hormone is only now arriving — that gap is why a hormone can never start a fast movement.', '在' + fmtT(t) + '时，神经信号已经结束，激素才刚刚到达——正是这个空档说明激素无法启动快速动作。')
          : t < 7200
            ? T('At ' + fmtT(t) + ' the hormonal share dominates: slower to begin, but it keeps working long after the nerve has stopped.', '在' + fmtT(t) + '时，激素占主导：启动更慢，但在神经停止后仍持续作用。')
            : T('At ' + fmtT(t) + ' almost everything left is hormonal, and even that is fading — one dose is running out.', '在' + fmtT(t) + '时，几乎剩下的全部都是激素作用，而且它也在消退——一次剂量的效果正在结束。'));
    }
    if (inp) inp.addEventListener('input', draw);
    draw();
  };

  /* ══ layer: mount, lazy build, language + mode refresh ═══════════════ */
  window.IB_MODELS = MODELS;

  function titleOf(block) {
    var h = block.querySelector('h3');
    if (!h) return '';
    return (h.dataset && h.dataset.en) || h.getAttribute('data-en') || '';
  }
  /* Which topics carry the Learn panel. Append-only; A.1.1 is the pilot. */
  var LEARN = { 'A.1.1': { section: 'Communication systems' } };

  function learnChapterOf(item) {
    var sec = item && item.closest ? item.closest('section.chapter') : null;
    if (!sec) return 1;
    var n = parseInt(String(sec.id).replace('ib-ch', ''), 10);
    return isNaN(n) ? 1 : n;
  }
  function learnMount(item) {
    if (!item) return;
    if (item._ibLearn) return;
    var code = item.getAttribute && item.getAttribute('data-topic');
    if (!LEARN[code]) return;              /* pilot: A.1.1 only */
    var lesson = item.querySelector('.native-lesson');
    if (!lesson) return;
    var page = Number((item.id || '').replace('ib-topic-', '')) || 0;
    var ch = learnChapterOf(item);
    var host = document.getElementById('ib-accordion-' + ch);
    var all = $$('.acc-item', host);
    var map = all.map(function (it) {
      var code = it.querySelector('.acc-code'), ti = it.querySelector('.acc-title');
      return [(code ? code.textContent : ''), (ti ? (ti.dataset.en || ti.textContent) : ''),
        Number((it.id || '').replace('ib-topic-', '')) || 0];
    });
    var slot = el('div', 'ib-learn-wrap ib-learn');   /* the host IS the panel card */
    lesson.insertBefore(slot, lesson.firstChild);
    item._ibLearn = slot;
    slot._ibPage = page; slot._ibCh = ch; slot._ibMap = map; slot._ibTotal = all.length;
    learnPanel(slot, { page: page, chapter: ch, total: all.length, map: map });
  }
  function learnRender(slot) {
    if (!slot || !slot.parentNode) return;
    slot.innerHTML = '';
    learnPanel(slot, { page: slot._ibPage, chapter: slot._ibCh, total: slot._ibTotal, map: slot._ibMap });
  }

  function prepare(item) {
    if (!item) return;
    learnMount(item);
    $$('.native-section', item).forEach(function (block) {
      if (block._ibSlot || block._ibFail) return;
      var title = titleOf(block);
      if (!MODELS[title]) return;
      var fig = block.querySelector('.vis-figure'), scroll = fig ? fig.querySelector('.vis-svg-scroll') : null;
      var slot = el('div', 'ib-model');
      slot._ibTitle = title;
      if (scroll && scroll.parentNode) { scroll.parentNode.replaceChild(slot, scroll); slot._ibStatic = scroll; }
      else if (fig) fig.appendChild(slot);
      else block.appendChild(slot);
      block._ibSlot = slot;
    });
  }
  function render(slot) {
    var fn = MODELS[slot._ibTitle];
    if (!fn || !slot.parentNode) return;
    slot.innerHTML = '';
    slot.className = 'ib-model kv';
    var head = el('div', 'ib-head', seg([['concise', T('Concise', '精简')], ['full', T('Full', '完整')]], mode()));
    slot.appendChild(head);
    var body = el('div', 'ib-body');
    slot.appendChild(body);
    slot._ibDone = true;
    slot._ibLang = zh();
    slot._ibMode = mode();
    try {
      fn(body, slot._ibMode);
      $$('.kv-callout', body).forEach(function (n) { n.setAttribute('aria-live', 'polite'); });
    } catch (e) {
      slot._ibDone = false;
      if (window.console) console.warn('[ib-models]', slot._ibTitle, e);
      var fig = slot.parentNode;
      if (fig) fig._ibFail = true;
      if (slot._ibStatic) fig.insertBefore(slot._ibStatic, slot);
      if (slot.parentNode) slot.parentNode.removeChild(slot);
      return;
    }
    wireSeg(head, function (v) { save(MODE_KEY, v); render(slot); });
  }
  function build(item) {
    if (!item) return 0;
    prepare(item);
    var n = 0;
    $$('.native-section', item).forEach(function (block) {
      if (block._ibSlot && !block._ibSlot._ibDone) { render(block._ibSlot); n++; }
    });
    return n;
  }
  function stop(item) {
    if (!item) return;
    $$('.ib-model', item).forEach(function (slot) {
      if (slot._stop) { try { slot._stop(); } catch (e) { } slot._stop = null; }
    });
  }
  function refresh() {
    $$('.ib-model').forEach(function (slot) {
      if (slot._ibDone && (slot._ibLang !== zh() || slot._ibMode !== mode())) render(slot);
    });
    $$('.ib-learn-wrap').forEach(function (slot) {
      if (slot._ibLang !== zh() || slot._ibMode !== mode()) {
        slot._ibLang = zh(); slot._ibMode = mode(); learnRender(slot);
      }
    });
  }
  window.IBSEHSModels = {
    build: build, stop: stop, refresh: refresh, prepare: prepare,
    count: function () { return Object.keys(MODELS).length; },
    built: function () { return $$('.ib-model').length; }
  };
})();

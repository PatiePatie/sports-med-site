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
   Append-only. Batch 1 = 10 of 83 sections. Add new keys; never rewrite a
   shipped one. */
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

  /* ══ layer: mount, lazy build, language + mode refresh ═══════════════ */
  window.IB_MODELS = MODELS;

  function titleOf(block) {
    var h = block.querySelector('h3');
    if (!h) return '';
    return (h.dataset && h.dataset.en) || h.getAttribute('data-en') || '';
  }
  function prepare(item) {
    if (!item) return;
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
  }
  window.IBSEHSModels = {
    build: build, stop: stop, refresh: refresh, prepare: prepare,
    count: function () { return Object.keys(MODELS).length; },
    built: function () { return $$('.ib-model').length; }
  };
})();

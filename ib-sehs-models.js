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
      '<text class="small" x="' + (PX + PW + 10) + '" y="' + (PY + PH / 2) + '">' + esc(T('external', '外部')) + '</text>' +
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

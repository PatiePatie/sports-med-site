/* ══════════════════════════════════════════════════════════════════════════════
   knowledge-fx.js — Vitalite Knowledge: read less, learn more.

   1 · Concise view. Every accordion section shows its key points first: a row
       of "key point" chips, the first blocks, the first four fact cards (two
       lines each) and the first rows of a table. "View full content" opens the
       rest in place. A Concise / Full switch sits on every chapter.
   2 · Learn panel (guide.html). Each chapter opens with four ways in:
       Interactive (a chapter-specific visual you can play with), Flip cards
       (built from the chapter's own fact cards), Quick check (three questions
       from the adaptive quiz bank) and a Chapter map (sections you have read).
   3 · Progress. Sections read, the last chapter open and quick-check scores go
       to localStorage (kn_read, kn_tot, kn_last, kn_qc) for home.html and the
       Knowledge Hub.

   Everything is built from the page's own content at runtime, so published
   Site Editor overrides (site-content.js) get the same treatment, and the
   static HTML stays the single source. Bilingual EN / 中文 throughout.
   ══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__knFx) return;
  window.__knFx = true;

  var FILE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var GUIDE = FILE === 'guide.html';
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── helpers ───────────────────────────────────────────────────────── */
  function $$(sel, ctx) { try { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); } catch (e) { return []; } }
  function zh() {
    var b = document.body;
    if (b && b.classList.contains('lang-zh')) return true;
    if (b && b.classList.contains('lang-en')) return false;
    try { var v = localStorage.getItem('sm_lang'); return GUIDE ? v !== 'en' : v === 'zh'; } catch (e) { return false; }
  }
  function T(en, z) { return zh() ? z : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn('[knowledge-fx]', e); } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function txt(node, lang) {
    if (!node) return '';
    var v = node.getAttribute('data-' + lang);
    if (v == null) v = node.getAttribute('data-en');
    if (v == null) v = node.textContent;
    return String(v).trim();
  }
  function bi(node) { return zh() ? txt(node, 'zh') : txt(node, 'en'); }

  /* ═══ 1 · Concise view ═════════════════════════════════════════════════ */
  var MODE_KEY = 'kn_mode';
  function mode() { return load(MODE_KEY, 'concise') === 'full' ? 'full' : 'concise'; }

  function fitAcc(inner) {
    var ab = inner.closest('.acc-body');
    if (ab && ab.parentElement && ab.parentElement.classList.contains('open')) ab.style.maxHeight = ab.scrollHeight + 'px';
  }
  function moreLabel(btn) {
    var brief = btn.parentElement.classList.contains('kn-brief');
    btn.querySelector('.kn-more-t').textContent = brief ? T('View full content', '查看完整内容') : T('Show less', '收起');
    btn.setAttribute('aria-expanded', brief ? 'false' : 'true');
  }
  function setBrief(inner, on) {
    inner.classList.toggle('kn-brief', !!on);
    var b = inner.querySelector(':scope > .kn-more');
    if (b) moreLabel(b);
    fitAcc(inner);
  }

  function condense(scope) {
    $$('.acc-body-inner', scope || document).forEach(function (inner) {
      if (inner.getAttribute('data-kn')) return;
      inner.setAttribute('data-kn', '1');
      var kids = Array.prototype.filter.call(inner.children, function (c) { return !/\bkn-/.test(c.className || ''); });
      var facts = inner.querySelectorAll(':scope > ul.facts > li');
      var rows = inner.querySelectorAll(':scope > table tr, :scope > .table-wrap table tr');
      var longFact = Array.prototype.some.call(facts, function (li) { return (li.textContent || '').length > 170; });
      var hidden = Math.max(0, kids.length - 2) + Math.max(0, facts.length - 4) + Math.max(0, rows.length - 6);
      if (!hidden && !longFact) return;

      /* key points: the bold lead of each fact card */
      var leads = $$(':scope > ul.facts > li > b', inner).slice(0, 6);
      if (leads.length >= 3) {
        var dg = el('div', 'kn-digest');
        var lab = el('span', 'kn-digest-lab');
        lab.setAttribute('data-en', 'Key points'); lab.setAttribute('data-zh', '要点');
        lab.textContent = T('Key points', '要点');
        dg.appendChild(lab);
        leads.forEach(function (b, i) {
          var chip = el('button', 'kn-chip');
          chip.type = 'button';
          var en = txt(b, 'en').replace(/[:：]\s*$/, ''), z = txt(b, 'zh').replace(/[:：]\s*$/, '');
          chip.setAttribute('data-en', en); chip.setAttribute('data-zh', z);
          chip.textContent = zh() ? z : en;
          chip.addEventListener('click', function () {
            setBrief(inner, false);
            var li = b.parentElement;
            li.classList.add('kn-flash');
            setTimeout(function () { li.classList.remove('kn-flash'); }, 1400);
            li.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' });
          });
          dg.appendChild(chip);
        });
        inner.insertBefore(dg, inner.firstChild);
        inner.classList.add('kn-dg');
      }

      var btn = el('button', 'kn-more', '<span class="kn-more-t"></span><span class="kn-more-n"></span><span class="kn-more-i" aria-hidden="true">▾</span>');
      btn.type = 'button';
      if (hidden) btn.querySelector('.kn-more-n').textContent = '+' + hidden;
      btn.addEventListener('click', function () {
        var wasBrief = inner.classList.contains('kn-brief');
        setBrief(inner, !wasBrief);
        if (!wasBrief) {
          var top = inner.closest('.acc-item') || inner;
          if (top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
        }
      });
      inner.appendChild(btn);
      setBrief(inner, mode() === 'concise');
    });
  }
  function applyMode(m) {
    save(MODE_KEY, m);
    $$('.acc-body-inner[data-kn]').forEach(function (inner) {
      if (inner.querySelector(':scope > .kn-more')) setBrief(inner, m === 'concise');
    });
    $$('.kn-mode button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-m') === m ? 'true' : 'false'); });
  }
  /* the accordion opened after condensing: size it to the shorter body */
  document.addEventListener('click', function (e) {
    var h = e.target.closest && e.target.closest('.acc-header');
    if (!h) return;
    var inner = h.parentElement && h.parentElement.querySelector('.acc-body-inner');
    if (inner) setTimeout(function () { fitAcc(inner); }, 0);
  });

  /* ═══ 2 · Progress ═════════════════════════════════════════════════════ */
  function chapterOf(node) { var s = node.closest && node.closest('section.chapter[id^="ch"]'); return s ? parseInt(s.id.slice(2), 10) : 0; }
  function heads(ch) { var s = document.getElementById('ch' + ch); return s ? $$('.acc-item > .acc-header', s) : []; }
  function readSet(ch) { var r = load('kn_read', {}); return r[ch] || []; }
  function markRead(ch, i) {
    var r = load('kn_read', {}), a = r[ch] || [];
    if (a.indexOf(i) < 0) { a.push(i); r[ch] = a; save('kn_read', r); }
    refreshProgress(ch);
  }
  function refreshProgress(ch) {
    var panel = document.querySelector('.kn-learn[data-ch="' + ch + '"]');
    if (!panel) return;
    var tot = heads(ch).length, n = Math.min(readSet(ch).length, tot);
    var bar = panel.querySelector('.kn-prog-fill'), lab = panel.querySelector('.kn-prog-t');
    if (bar) bar.style.transform = 'scaleX(' + (tot ? n / tot : 0) + ')';
    if (lab) lab.textContent = T(n + ' of ' + tot + ' sections read', '已读 ' + n + ' / ' + tot + ' 节');
    var map = panel.querySelector('.kn-map');
    if (map) $$('.kn-map-i', map).forEach(function (b, i) { b.classList.toggle('done', readSet(ch).indexOf(i) > -1); });
  }
  function trackReading() {
    document.addEventListener('click', function (e) {
      var h = e.target.closest && e.target.closest('.acc-item > .acc-header');
      if (!h) return;
      var ch = chapterOf(h);
      if (!ch) return;
      var i = heads(ch).indexOf(h);
      if (i > -1) markRead(ch, i);
    });
    var tot = {};
    for (var c = 1; c <= 14; c++) tot[c] = heads(c).length;
    save('kn_tot', tot);
  }

  /* ═══ 3 · Interactive visuals, one per chapter ══════════════════════════ */
  function range(min, max, val, step) { return '<input type="range" min="' + min + '" max="' + max + '" value="' + val + '" step="' + (step || 1) + '">'; }
  function seg(opts, on) {
    return '<div class="kv-seg" role="group">' + opts.map(function (o) {
      return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (o[0] === on ? 'true' : 'false') + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }
  function wireSeg(host, fn) {
    host.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.kv-seg button');
      if (!b) return;
      $$('button', b.parentElement).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      fn(b.getAttribute('data-v'), b);
    });
  }
  function note(en, z) { return '<p class="kv-note">' + esc(T(en, z)) + '</p>'; }

  var VIS = {};

  /* Ch 1 · Energy systems: how long is the all-out effort? */
  VIS[1] = function (host) {
    /* aerobic share of a maximal effort (Gastin 2001), log-time interpolated */
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
      return t <= 10 ? T('100 m sprint · jump · heavy single', '100 米冲刺 · 跳跃 · 大重量单次')
        : t <= 90 ? T('400 m run · 100 m swim · shift in hockey', '400 米跑 · 100 米游泳 · 冰球单次上场')
        : t <= 300 ? T('800–1500 m · 2 km rowing', '800–1500 米 · 2 公里划船')
        : T('5 km · football match · marathon', '5 公里 · 足球比赛 · 马拉松');
    }
    var W = 320, H = 110, xs = [], L = Math.log(6), R = Math.log(7200);
    function X(t) { return (Math.log(t) - L) / (R - L) * W; }
    for (var i = 0; i <= 60; i++) xs.push(Math.exp(L + (R - L) * i / 60));
    function area(k) {
      var top = [], bot = [];
      xs.forEach(function (t) { var s = split(t), lo = 0; for (var j = 0; j < k; j++) lo += s[j]; top.push([X(t), H - (lo + s[k]) / 100 * H]); bot.push([X(t), H - lo / 100 * H]); });
      return 'M' + top.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L') + ' L' + bot.reverse().map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L') + 'Z';
    }
    host.innerHTML =
      '<div class="kv-q">' + esc(T('How long is the all-out effort?', '全力运动持续多久？')) + ' <b class="kv-val"></b></div>' + range(0, 1000, 350) +
      '<svg class="kv-svg" viewBox="-4 -6 ' + (W + 8) + ' ' + (H + 26) + '" aria-hidden="true">' +
      '<path class="kv-a0" d="' + area(0) + '"/><path class="kv-a1" d="' + area(1) + '"/><path class="kv-a2" d="' + area(2) + '"/>' +
      '<line class="kv-cursor" y1="-4" y2="' + H + '"/>' +
      ['6 s', '1 min', '10 min', '2 h'].map(function (l, i) { var t = [6, 60, 600, 7200][i]; return '<text x="' + X(t).toFixed(0) + '" y="' + (H + 16) + '" text-anchor="' + (i === 0 ? 'start' : i === 3 ? 'end' : 'middle') + '">' + l + '</text>'; }).join('') +
      '</svg>' +
      '<div class="kv-stack"><i class="kv-s0"></i><i class="kv-s1"></i><i class="kv-s2"></i></div>' +
      '<div class="kv-legend"><span><i class="kv-dot kv-c0"></i>' + esc(T('ATP–PCr', '磷酸原')) + ' <b class="kv-p0"></b></span>' +
      '<span><i class="kv-dot kv-c1"></i>' + esc(T('Glycolytic', '糖酵解')) + ' <b class="kv-p1"></b></span>' +
      '<span><i class="kv-dot kv-c2"></i>' + esc(T('Oxidative', '有氧氧化')) + ' <b class="kv-p2"></b></span></div>' +
      '<div class="kv-callout"></div>' + note('Approximate shares for a maximal effort of that length (Gastin 2001). All three systems always run together — only the mix changes.', '按该时长全力运动的近似占比（Gastin 2001）。三个系统始终同时工作，只是比例在变。');
    var inp = host.querySelector('input');
    function draw() {
      var t = Math.exp(L + (R - L) * inp.value / 1000), s = split(t);
      host.querySelector('.kv-val').textContent = fmt(t);
      host.querySelector('.kv-cursor').setAttribute('x1', X(t)); host.querySelector('.kv-cursor').setAttribute('x2', X(t));
      for (var k = 0; k < 3; k++) {
        host.querySelector('.kv-s' + k).style.flexGrow = s[k].toFixed(1);
        host.querySelector('.kv-p' + k).textContent = Math.round(s[k]) + '%';
      }
      host.querySelector('.kv-callout').textContent = T('Looks like: ', '例如：') + sport(t);
    }
    inp.addEventListener('input', draw); draw();
  };

  /* Ch 2 · Where is the lesion? UMN vs LMN */
  VIS[2] = function (host) {
    var SIGNS = [
      [T('Tone', '肌张力'), T('↑ Spastic (velocity-dependent)', '↑ 痉挛（速度依赖）'), T('↓ Flaccid', '↓ 弛缓')],
      [T('Deep tendon reflexes', '腱反射'), T('↑ Hyperreflexia, clonus', '↑ 亢进，可有阵挛'), T('↓ or absent', '↓ 或消失')],
      [T('Babinski sign', '巴宾斯基征'), T('Present (toes up)', '阳性（趾背伸）'), T('Absent', '阴性')],
      [T('Muscle wasting', '肌萎缩'), T('Mild, from disuse', '轻，失用性'), T('Marked, early', '明显且早')],
      [T('Fasciculations', '肌束颤动'), T('No', '无'), T('Yes', '有')],
      [T('Weakness pattern', '无力分布'), T('Whole movements / one side', '整组动作 / 偏侧'), T('Muscles of that nerve / segment', '该神经或节段支配的肌肉')]
    ];
    var SITES = { cortex: 'u', cord: 'u', horn: 'l', nerve: 'l' };
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Tap where the damage is:', '点击损伤部位：')) + '</div>' +
      '<div class="kv-row">' +
      '<svg class="kv-svg kv-nerve" viewBox="0 0 200 220" role="group" aria-label="' + esc(T('Motor pathway', '运动传导通路')) + '">' +
      '<path class="kv-path" d="M60,34 C70,70 92,84 100,104 L100,150 C112,160 140,166 176,196"/>' +
      '<g class="kv-site" data-s="cortex" tabindex="0"><ellipse cx="58" cy="30" rx="40" ry="24"/><text x="58" y="34">' + esc(T('Brain', '大脑')) + '</text></g>' +
      '<g class="kv-site" data-s="cord" tabindex="0"><rect x="86" y="92" width="28" height="44" rx="10"/><text x="100" y="118">' + esc(T('Cord', '脊髓')) + '</text></g>' +
      '<g class="kv-site" data-s="horn" tabindex="0"><circle cx="100" cy="150" r="13"/><text x="120" y="154" style="text-anchor:start">' + esc(T('Anterior horn', '前角')) + '</text></g>' +
      '<g class="kv-site" data-s="nerve" tabindex="0"><circle cx="146" cy="172" r="12"/><text x="132" y="176" style="text-anchor:end">' + esc(T('Nerve', '周围神经')) + '</text></g>' +
      '<rect class="kv-muscle" x="170" y="190" width="24" height="16" rx="7"/>' +
      '</svg>' +
      '<div class="kv-signs"><div class="kv-tag"></div><table><thead><tr><th></th><th class="kv-uh">UMN</th><th class="kv-lh">LMN</th></tr></thead><tbody>' +
      SIGNS.map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td class="kv-u">' + esc(r[1]) + '</td><td class="kv-l">' + esc(r[2]) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div>' + note('Upper motor neurons run from the brain down the cord; lower motor neurons leave the anterior horn to the muscle. Mixed signs (e.g. ALS) mean both are hit.', '上运动神经元从大脑下行至脊髓；下运动神经元从前角发出直达肌肉。体征混合（如 ALS）说明两者都受累。');
    function pick(s) {
      var k = SITES[s];
      $$('.kv-site', host).forEach(function (g) { g.classList.toggle('on', g.getAttribute('data-s') === s); });
      host.querySelector('.kv-signs').setAttribute('data-k', k);
      host.querySelector('.kv-tag').textContent = k === 'u' ? T('Upper motor neuron lesion — e.g. stroke, spinal cord injury, MS', '上运动神经元损伤 — 如脑卒中、脊髓损伤、多发性硬化')
        : T('Lower motor neuron lesion — e.g. peripheral nerve injury, polio, Guillain–Barré', '下运动神经元损伤 — 如周围神经损伤、脊髓灰质炎、吉兰–巴雷综合征');
    }
    host.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('.kv-site'); if (g) pick(g.getAttribute('data-s')); });
    host.addEventListener('keydown', function (e) { var g = e.target.closest && e.target.closest('.kv-site'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(g.getAttribute('data-s')); } });
    pick('cortex');
  };

  /* Ch 3 · Heart-rate zones (Karvonen) */
  VIS[3] = function (host) {
    var Z = [[.5, .6, T('Recovery', '恢复'), T('easy chat', '可轻松聊天')], [.6, .7, T('Aerobic base', '有氧基础'), T('full sentences', '能说完整句子')],
      [.7, .8, T('Tempo', '节奏'), T('short sentences', '只能说短句')], [.8, .9, T('Threshold', '乳酸阈'), T('a few words', '只能说几个词')], [.9, 1, T('VO₂max', '最大摄氧'), T('no talking', '无法说话')]];
    host.innerHTML =
      '<div class="kv-grid2"><label>' + esc(T('Age', '年龄')) + ' <b class="kv-age"></b>' + range(12, 80, 16) + '</label>' +
      '<label>' + esc(T('Resting heart rate', '静息心率')) + ' <b class="kv-rhr"></b>' + range(40, 100, 64) + '</label></div>' +
      '<div class="kv-zones"></div><div class="kv-callout"></div>' +
      note('HRmax ≈ 208 − 0.7 × age (Tanaka). Zones use heart-rate reserve (Karvonen): rest + % × (max − rest). The talk test is a good cross-check.', '最大心率 ≈ 208 − 0.7 × 年龄（Tanaka 公式）。区间按心率储备（Karvonen）：静息 + % ×（最大 − 静息）。可用“说话测试”交叉验证。');
    var ins = $$('input', host);
    function draw() {
      var age = +ins[0].value, rhr = +ins[1].value, max = Math.round(208 - 0.7 * age), res = max - rhr;
      host.querySelector('.kv-age').textContent = age; host.querySelector('.kv-rhr').textContent = rhr + ' bpm';
      host.querySelector('.kv-zones').innerHTML = Z.map(function (z, i) {
        return '<div class="kv-zone kv-z' + (i + 1) + '"><span class="kv-zn">Z' + (i + 1) + '</span><span class="kv-zl">' + esc(z[2]) + '<small>' + esc(z[3]) + '</small></span><b>' +
          Math.round(rhr + z[0] * res) + '–' + Math.round(rhr + z[1] * res) + '</b></div>';
      }).join('');
      host.querySelector('.kv-callout').textContent = T('Estimated max: ' + max + ' bpm · reserve: ' + res + ' bpm', '估计最大心率：' + max + ' 次/分 · 心率储备：' + res + ' 次/分');
    }
    ins.forEach(function (i) { i.addEventListener('input', draw); }); draw();
  };

  /* Ch 4 · Burn depth on a skin cross-section */
  VIS[4] = function (host) {
    var D = [
      ['sup', T('Superficial', '浅度（I 度）'), 22, T('Epidermis only. Red, dry, painful, no blisters (like sunburn). Heals in 3–7 days without a scar.', '仅表皮。发红、干燥、疼痛、无水疱（如晒伤）。3–7 天愈合，不留疤。')],
      ['spt', T('Superficial partial-thickness', '浅 II 度'), 52, T('Into the upper dermis. Blisters, moist, very painful, blanches. Heals in ~1–3 weeks, minimal scarring.', '达真皮浅层。有水疱、潮湿、剧痛、按压褪色。约 1–3 周愈合，瘢痕少。')],
      ['dpt', T('Deep partial-thickness', '深 II 度'), 84, T('Deep dermis. Mottled red/white, less pain, slow capillary refill. >3 weeks, scarring likely — may need a graft.', '达真皮深层。红白相间、疼痛较轻、毛细血管再充盈慢。超过 3 周，易留瘢痕，可能需植皮。')],
      ['full', T('Full-thickness', 'III 度（全层）'), 118, T('Through the dermis into fat. White, leathery or charred, painless (nerves destroyed). Needs grafting; watch for contracture.', '穿透真皮至皮下脂肪。苍白、皮革样或焦痂、无痛（神经已毁）。需植皮，注意挛缩。')]
    ];
    host.innerHTML =
      '<div class="kv-row"><svg class="kv-svg kv-skin" viewBox="0 0 220 150" aria-hidden="true">' +
      '<rect class="kv-epi" x="0" y="10" width="220" height="18"/><rect class="kv-der" x="0" y="28" width="220" height="62"/><rect class="kv-hyp" x="0" y="90" width="220" height="48"/>' +
      '<path class="kv-hair" d="M40,10 L46,-6 M150,10 L156,-6"/><circle class="kv-fol" cx="44" cy="70" r="6"/><circle class="kv-fol" cx="152" cy="70" r="6"/>' +
      '<circle class="kv-fat" cx="30" cy="112" r="10"/><circle class="kv-fat" cx="72" cy="118" r="12"/><circle class="kv-fat" cx="120" cy="110" r="11"/><circle class="kv-fat" cx="170" cy="116" r="12"/>' +
      '<rect class="kv-burn" x="60" y="10" width="100" height="0" rx="4"/>' +
      '<text x="214" y="23" text-anchor="end">' + esc(T('Epidermis', '表皮')) + '</text><text x="214" y="62" text-anchor="end">' + esc(T('Dermis', '真皮')) + '</text><text x="214" y="118" text-anchor="end">' + esc(T('Hypodermis', '皮下组织')) + '</text>' +
      '</svg><div class="kv-side">' + seg(D.map(function (d) { return [d[0], d[1]]; }), 'sup') + '<div class="kv-callout"></div></div></div>' +
      note('Depth decides healing time and whether grafting is needed. Rule of nines estimates the burned area.', '烧伤深度决定愈合时间及是否需要植皮；九分法用于估算烧伤面积。');
    function pick(k) {
      var d = D.filter(function (x) { return x[0] === k; })[0];
      host.querySelector('.kv-burn').setAttribute('height', d[2] - 10);
      host.querySelector('.kv-callout').textContent = d[3];
    }
    wireSeg(host, pick); pick('sup');
  };

  /* Ch 5 · Supercompensation: how long do you rest between sessions? */
  VIS[5] = function (host) {
    function g(t) { return t < 0 ? 0 : 1 * (Math.exp(-t / 80) - Math.exp(-t / 24)) - 1.5 * Math.exp(-t / 26); }
    var W = 320, H = 120, MID = 70;
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Rest between hard sessions:', '两次高强度训练之间休息：')) + ' <b class="kv-val"></b></div>' + range(12, 144, 48, 6) +
      '<svg class="kv-svg" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><line class="kv-base" x1="0" x2="' + W + '" y1="' + MID + '" y2="' + MID + '"/><path class="kv-curve"/><g class="kv-ticks"></g></svg>' +
      '<div class="kv-verdict"></div>' + note('Each session first tires you (the dip), then you rebuild slightly above where you started. Train again near that peak and fitness climbs; too soon and fatigue stacks up; too late and the gain fades.', '每次训练先让你疲劳（下降），随后恢复并略超过起点。在高点附近再训练，体能逐步上升；太早则疲劳累积；太晚则收益消退。');
    var inp = host.querySelector('input');
    function draw() {
      var R = +inp.value, span = R * 4 + Math.max(R, 48), pts = [], ticks = '';
      for (var i = 0; i <= 160; i++) {
        var t = span * i / 160, y = 0;
        for (var k = 0; k < 4; k++) y += g(t - k * R);
        pts.push((W * i / 160).toFixed(1) + ',' + (MID - y * 34).toFixed(1));
      }
      for (var k2 = 0; k2 < 4; k2++) ticks += '<circle cx="' + (W * k2 * R / span).toFixed(1) + '" cy="' + (H - 8) + '" r="4"/>';
      host.querySelector('.kv-curve').setAttribute('d', 'M' + pts.join(' L'));
      host.querySelector('.kv-ticks').innerHTML = ticks;
      host.querySelector('.kv-val').textContent = R + ' h';
      var v = host.querySelector('.kv-verdict');
      v.className = 'kv-verdict ' + (R < 30 ? 'bad' : R <= 84 ? 'good' : 'meh');
      v.textContent = R < 30 ? T('Too soon — fatigue stacks, performance slides', '太早 — 疲劳叠加，表现下滑')
        : R <= 84 ? T('Sweet spot — each session lands on the rebound', '最佳区间 — 每次训练都落在超量恢复期')
        : T('Too late — the gain fades before the next session', '太晚 — 下次训练前收益已消退');
    }
    inp.addEventListener('input', draw); draw();
  };

  /* Ch 6 · Healing timeline */
  VIS[6] = function (host) {
    var PH = [[0, 5, T('Inflammation', '炎症期'), 'i'], [3, 42, T('Proliferation / repair', '增生 / 修复期'), 'p'], [21, 365, T('Remodelling', '重塑期'), 'r']];
    var MAXD = 365, L = Math.log(1 + MAXD);
    function X(d) { return Math.log(1 + d) / L * 100; }
    function strength(d) { var pts = [[0, 0], [7, 5], [21, 20], [42, 50], [84, 70], [180, 78], [365, 82]]; for (var i = 1; i < pts.length; i++) if (d <= pts[i][0]) { var a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (d - a[0]) / (b[0] - a[0]); } return 82; }
    function advice(d) {
      return d <= 3 ? T('PEACE: Protect, Elevate, Avoid anti-inflammatories, Compress, Educate. Short relative rest.', 'PEACE：保护、抬高、避免抗炎药、加压、教育。短期相对休息。')
        : d <= 42 ? T('LOVE: Load gradually (pain-guided), stay Optimistic, Vascularise with pain-free cardio, Exercise.', 'LOVE：循序加载（以疼痛为指引）、保持乐观、无痛有氧促进血供、功能锻炼。')
        : T('Progressive, sport-specific loading. The new collagen lines up with the stress you put through it.', '渐进的专项负荷训练。新生胶原沿你施加的应力方向排列。');
    }
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Days since injury:', '受伤后第')) + ' <b class="kv-val"></b></div>' + range(0, 1000, 180) +
      '<div class="kv-tl">' + PH.map(function (p) { return '<div class="kv-ph kv-ph-' + p[3] + '" style="left:' + X(p[0]) + '%;width:' + (X(p[1]) - X(p[0])) + '%"><span>' + esc(p[2]) + '</span></div>'; }).join('') +
      '<i class="kv-now"></i></div><div class="kv-tlx"><span>0</span><span>' + esc(T('1 wk', '1 周')) + '</span><span>' + esc(T('6 wk', '6 周')) + '</span><span>' + esc(T('1 yr', '1 年')) + '</span></div>' +
      '<div class="kv-meter"><span>' + esc(T('Tissue strength vs. before', '组织强度（相对伤前）')) + '</span><div class="kv-bar"><i></i></div><b class="kv-pct"></b></div>' +
      '<div class="kv-callout"></div>' + note('Ligament and tendon figures are rough averages — tissues and people vary. Phases overlap; they are not switches.', '韧带、肌腱强度为粗略平均值，因组织和个人而异。各期相互重叠，并非开关式切换。');
    var inp = host.querySelector('input');
    function draw() {
      var d = Math.round(Math.exp(inp.value / 1000 * L) - 1);
      host.querySelector('.kv-val').textContent = zh() ? d + ' 天' : d + (d === 1 ? ' day' : ' days');
      host.querySelector('.kv-now').style.left = X(d) + '%';
      $$('.kv-ph', host).forEach(function (n, i) { n.classList.toggle('on', d >= PH[i][0] && d <= PH[i][1]); });
      var s = Math.round(strength(d));
      host.querySelector('.kv-bar i').style.transform = 'scaleX(' + s / 100 + ')';
      host.querySelector('.kv-pct').textContent = '≈' + s + '%';
      host.querySelector('.kv-callout').textContent = advice(d);
    }
    inp.addEventListener('input', draw); draw();
  };

  /* Ch 7 · Sleep + the recovery toolbox */
  VIS[7] = function (host) {
    var TOOLS = [
      ['sleep', T('Sleep', '睡眠'), 5, T('The biggest lever. Teen athletes sleeping under 8 h were ~1.7× more likely to be injured (Milewski 2014).', '最大的杠杆。睡眠少于 8 小时的青少年运动员受伤风险约高 1.7 倍（Milewski 2014）。')],
      ['food', T('Food & fluids', '饮食与补水'), 5, T('Carbs to refill glycogen, ~0.3 g/kg protein per meal, and fluids to replace sweat losses.', '补充碳水以恢复糖原，每餐约 0.3 g/kg 蛋白质，并补足出汗丢失的水分。')],
      ['active', T('Active recovery', '主动恢复'), 3, T('Light movement helps you feel better and clears lactate a little faster; it does not speed up tissue repair much.', '轻度活动让人感觉更好、乳酸清除稍快，但对组织修复加速有限。')],
      ['massage', T('Massage', '按摩'), 3, T('Small, real reduction in soreness and perceived fatigue.', '能小幅但切实地减轻酸痛与疲劳感。')],
      ['cold', T('Cold-water immersion', '冷水浸泡'), 3, T('Eases soreness short-term — useful between games. Used after every strength session it may blunt muscle gains.', '短期缓解酸痛，适合密集赛程。若每次力量训练后都用，可能削弱增肌效果。')],
      ['comp', T('Compression', '加压衣'), 2, T('Small effect on soreness; low cost, low risk.', '对酸痛作用小；成本低、风险低。')],
      ['stretch', T('Stretching', '拉伸'), 1, T('Great for range of motion, but it does not prevent or cure DOMS.', '有助于关节活动度，但不能预防或缓解延迟性酸痛。')]
    ];
    host.innerHTML =
      '<div class="kv-q">' + esc(T('Hours of sleep a night:', '每晚睡眠时长：')) + ' <b class="kv-val"></b></div>' + range(4, 10, 7, .5) +
      '<div class="kv-meter kv-risk"><span>' + esc(T('Relative injury risk', '相对受伤风险')) + '</span><div class="kv-bar"><i></i></div><b class="kv-pct"></b></div>' +
      '<div class="kv-q kv-q2">' + esc(T('Recovery toolbox — tap one:', '恢复工具箱 — 点一个：')) + '</div>' +
      '<div class="kv-tools">' + TOOLS.map(function (t) { return '<button type="button" data-k="' + t[0] + '"><span>' + esc(t[1]) + '</span><i class="kv-stars" aria-label="' + t[2] + '/5">' + '●●●●●'.slice(0, t[2]) + '<em>' + '●●●●●'.slice(t[2]) + '</em></i></button>'; }).join('') + '</div>' +
      '<div class="kv-callout kv-tool-out"></div>';
    var inp = host.querySelector('input');
    function draw() {
      var h = +inp.value, r = h >= 8 ? 1 : 1 + (8 - h) * 0.35;
      host.querySelector('.kv-val').textContent = h + ' h';
      host.querySelector('.kv-bar i').style.transform = 'scaleX(' + clamp(r / 2.5, 0.1, 1) + ')';
      host.querySelector('.kv-risk').setAttribute('data-lv', h >= 8 ? 'ok' : h >= 7 ? 'mid' : 'hi');
      host.querySelector('.kv-pct').textContent = h >= 8 ? T('baseline', '基线') : '≈' + r.toFixed(1) + '×';
    }
    host.querySelector('.kv-tools').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button'); if (!b) return;
      $$('.kv-tools button', host).forEach(function (x) { x.classList.toggle('on', x === b); });
      var t = TOOLS.filter(function (x) { return x[0] === b.getAttribute('data-k'); })[0];
      host.querySelector('.kv-tool-out').textContent = t[3];
    });
    inp.addEventListener('input', draw); draw();
    host.querySelector('.kv-tools button').click();
  };

  /* Ch 8 · Daily fuel calculator (ACSM / IOC ranges) */
  VIS[8] = function (host) {
    var LOAD = { light: [3, 5, T('Light: skill work, <1 h easy', '轻：技术练习，<1 小时低强度')], mod: [5, 7, T('Moderate: ~1 h a day', '中：每天约 1 小时')], high: [6, 10, T('High: 1–3 h moderate–hard', '高：每天 1–3 小时中高强度')], vhigh: [8, 12, T('Very high: 4–5 h+ a day', '极高：每天 4–5 小时以上')] };
    host.innerHTML =
      '<label class="kv-q">' + esc(T('Body mass', '体重')) + ' <b class="kv-val"></b>' + range(30, 120, 60) + '</label>' +
      seg([['light', T('Light', '轻')], ['mod', T('Moderate', '中')], ['high', T('High', '高')], ['vhigh', T('Very high', '极高')]], 'mod') +
      '<div class="kv-fuel"></div><div class="kv-callout"></div>' +
      note('Carbohydrate scales with training load; protein 1.2–2.0 g/kg spread over 4–5 meals; fat fills the rest (~20–35% of energy). Ranges from ACSM / Dietitians of Canada 2016.', '碳水随训练量变化；蛋白质 1.2–2.0 g/kg，分 4–5 餐摄入；脂肪补足其余（约占总能量 20–35%）。范围来自 ACSM 2016 立场声明。');
    var inp = host.querySelector('input'), load = 'mod';
    function row(lab, lo, hi, max, cls) {
      return '<div class="kv-frow ' + cls + '"><span>' + esc(lab) + '</span><div class="kv-fbar"><i style="left:' + (lo / max * 100) + '%;width:' + ((hi - lo) / max * 100) + '%"></i></div><b>' + Math.round(lo) + '–' + Math.round(hi) + ' g</b></div>';
    }
    function draw() {
      var kg = +inp.value, L2 = LOAD[load], max = 12 * 120;
      host.querySelector('.kv-val').textContent = kg + ' kg';
      host.querySelector('.kv-fuel').innerHTML = row(T('Carbohydrate', '碳水化合物'), L2[0] * kg, L2[1] * kg, max, 'kv-carb') + row(T('Protein', '蛋白质'), 1.2 * kg, 2.0 * kg, max, 'kv-pro');
      host.querySelector('.kv-callout').textContent = L2[2] + ' · ' + T('Fluids: drink to keep sweat losses under ~2% of body mass (' + (kg * 0.02).toFixed(1) + ' kg).', '补水：出汗失水控制在体重的约 2% 以内（' + (kg * 0.02).toFixed(1) + ' kg）。');
    }
    wireSeg(host, function (v) { load = v; draw(); });
    inp.addEventListener('input', draw); draw();
  };

  /* Ch 9 · Evidence pyramid + where supplements sit */
  VIS[9] = function (host) {
    var LV = [[T('Systematic reviews & meta-analyses', '系统综述与荟萃分析'), 5], [T('Randomised controlled trials', '随机对照试验'), 4], [T('Cohort / case-control', '队列 / 病例对照'), 3], [T('Case reports', '病例报告'), 2], [T('Expert opinion, testimonials', '专家意见、个人证言'), 1]];
    var SUP = [
      [T('Creatine', '肌酸'), 5, 'A', T('Strong: more strength and repeat-sprint power. 3–5 g/day.', '证据强：提升力量与反复冲刺能力。每天 3–5 g。')],
      [T('Caffeine', '咖啡因'), 5, 'A', T('Strong: 3–6 mg/kg ~60 min before. Adults — teens should be cautious.', '证据强：赛前约 60 分钟 3–6 mg/kg。成人适用，青少年需谨慎。')],
      [T('Beta-alanine', 'β-丙氨酸'), 4, 'A', T('Good for all-out efforts of 1–4 min; tingling is harmless.', '对 1–4 分钟全力运动有效；刺麻感无害。')],
      [T('Nitrate (beetroot)', '硝酸盐（甜菜根）'), 4, 'A', T('Moderate: small endurance gains, less in elite athletes.', '中等：小幅提升耐力，对精英效果较小。')],
      [T('BCAAs', '支链氨基酸'), 2, 'C', T('Weak: pointless if you already eat enough protein.', '证据弱：蛋白质摄入充足时无意义。')],
      [T('Fat burners', '燃脂剂'), 1, '✕', T('No good evidence, real safety and doping risks.', '无可靠证据，且有安全与兴奋剂风险。')]
    ];
    host.innerHTML =
      '<div class="kv-row"><div class="kv-pyr">' + LV.map(function (l, i) { return '<div class="kv-lv" data-lv="' + l[1] + '" style="--w:' + (46 + i * 13.5) + '%"><span>' + esc(l[0]) + '</span></div>'; }).join('') + '</div>' +
      '<div class="kv-side"><div class="kv-q">' + esc(T('Pick a supplement:', '选择一种补剂：')) + '</div><div class="kv-tools kv-sups">' +
      SUP.map(function (s, i) { return '<button type="button" data-i="' + i + '"><span>' + esc(s[0]) + '</span><i class="kv-grade kv-g' + (s[2] === '✕' ? 'x' : s[2]) + '">' + s[2] + '</i></button>'; }).join('') +
      '</div><div class="kv-callout"></div></div></div>' +
      note('Grades follow the Australian Institute of Sport framework (A = good evidence). Choose batch-tested products (Informed Sport / NSF Certified for Sport).', '分级参考澳大利亚体育学院框架（A = 证据充分）。选择批次检测产品（Informed Sport / NSF 运动认证）。');
    host.querySelector('.kv-sups').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button'); if (!b) return;
      var s = SUP[+b.getAttribute('data-i')];
      $$('.kv-sups button', host).forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('.kv-lv', host).forEach(function (l) { l.classList.toggle('on', +l.getAttribute('data-lv') === s[1]); });
      host.querySelector('.kv-callout').textContent = s[3];
    });
    host.querySelector('.kv-sups button').click();
  };

  /* Ch 10 · Ethics: what would you do? */
  VIS[10] = function (host) {
    var SC = [
      { q: T('Final game. Your starting forward took a hit, feels dizzy, and begs you not to tell the coach.', '决赛中，首发前锋被撞后头晕，求你别告诉教练。'),
        o: [[T('Let them play — it is their choice', '让其上场——这是他们的选择'), 0, T('Suspected concussion = remove from play. "When in doubt, sit them out." Autonomy never overrides immediate safety.', '疑似脑震荡必须离场。“有疑问就下场。”自主权不能凌驾于即时安全之上。')],
          [T('Remove them, tell the coach and medical team, and explain why', '让其下场，告知教练和医疗团队并解释原因'), 1, T('Right. Non-maleficence and your legal duty come first; sharing on a need-to-know basis for safety is allowed.', '正确。不伤害原则和法定义务优先；出于安全按需告知是允许的。')],
          [T('Check them again at half-time', '中场再评估'), 0, T('Symptoms can worsen. Any suspected concussion means no return that day.', '症状可能加重。任何疑似脑震荡当天都不得复赛。')]], tag: T('Non-maleficence · Duty of care', '不伤害 · 照护义务') },
      { q: T('A teacher asks you what is wrong with a student you are treating.', '一位老师问你正在治疗的学生得了什么病。'),
        o: [[T('Tell them — they are staff', '告诉他——他是教职工'), 0, T('Being staff is not consent. Health information needs the patient’s (or guardian’s) permission.', '教职工身份不等于同意。健康信息需获得患者（或监护人）许可。')],
          [T('Share only what they need, with consent', '仅在同意后分享必要信息'), 1, T('Right. Confidentiality (HIPAA in the US): minimum necessary, with permission.', '正确。保密原则（美国 HIPAA）：最少必要，并需许可。')],
          [T('Post an update in the team chat', '在队伍群里发更新'), 0, T('Never. That is a privacy breach even if well meant.', '绝不可以。即使出于好意也是泄露隐私。')]], tag: T('Confidentiality', '保密') },
      { q: T('Your clinic is busy. Can the PT aide do the new patient’s initial evaluation?', '诊所很忙。可以让康复助理做新患者的初次评估吗？'),
        o: [[T('Yes, if the aide is experienced', '可以，只要助理有经验'), 0, T('Evaluation, diagnosis and the plan of care cannot be delegated — they belong to the licensed PT.', '评估、诊断与治疗计划不可委派——只能由持证物理治疗师完成。')],
          [T('No — the PT evaluates; the aide can help with set-up and routine tasks', '不可以——由治疗师评估，助理可协助准备与常规工作'), 1, T('Right. Delegate tasks, never professional judgement.', '正确。可委派任务，但不能委派专业判断。')]], tag: T('Delegation · Scope of practice', '委派 · 执业范围') }
    ];
    var i = 0, score = 0;
    function show() {
      var s = SC[i];
      host.innerHTML = '<div class="kv-sc"><div class="kv-tagline">' + esc(T('Scenario ', '情景 ') + (i + 1) + ' / ' + SC.length) + ' · ' + esc(s.tag) + '</div><p class="kv-scq">' + esc(s.q) + '</p><div class="kv-opts">' +
        s.o.map(function (o, k) { return '<button type="button" data-k="' + k + '">' + esc(o[0]) + '</button>'; }).join('') + '</div><div class="kv-callout" hidden></div><div class="kv-next" hidden></div></div>';
      host.querySelector('.kv-opts').addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('button'); if (!b || host.querySelector('.kv-opts').classList.contains('done')) return;
        var o = s.o[+b.getAttribute('data-k')];
        host.querySelector('.kv-opts').classList.add('done');
        $$('.kv-opts button', host).forEach(function (x, k) { x.classList.add(s.o[k][1] ? 'right' : x === b ? 'wrong' : 'dim'); x.disabled = true; });
        if (o[1]) score++;
        var c = host.querySelector('.kv-callout'); c.hidden = false; c.textContent = o[2];
        var n = host.querySelector('.kv-next'); n.hidden = false;
        n.innerHTML = '<button type="button" class="kv-btn">' + esc(i < SC.length - 1 ? T('Next scenario →', '下一个情景 →') : T('Start again ↻', '重新开始 ↻')) + '</button>' + (i === SC.length - 1 ? '<span>' + esc(T('You chose well in ' + score + ' of ' + SC.length, '你答对了 ' + score + ' / ' + SC.length)) + '</span>' : '');
        n.querySelector('button').addEventListener('click', function () { if (i < SC.length - 1) i++; else { i = 0; score = 0; } show(); });
      });
    }
    show();
  };

  /* Ch 11 · The path to becoming a PT */
  VIS[11] = function (host) {
    var P = {
      us: [[T('Bachelor’s degree', '本科'), T('~4 years — any major, with biology, chemistry, physics, anatomy & physiology, statistics and psychology prerequisites, plus observation hours.', '约 4 年 — 专业不限，需修生物、化学、物理、解剖生理、统计、心理等先修课，并积累见习时数。')],
        [T('DPT program', 'DPT 博士项目'), T('~3 years of graduate school, including full-time clinical rotations.', '约 3 年研究生学习，含全职临床轮转。')],
        [T('NPTE exam', 'NPTE 执照考试'), T('The national licensing exam (FSBPT): 250 questions, scaled pass score 600.', '全国执照考试（FSBPT）：250 题，标准化及格分 600。')],
        [T('State licence', '州执照'), T('Apply in the state you will practise in; keep it with continuing education.', '在执业所在州申请；需通过继续教育维持。')],
        [T('Residency & specialist', '住院医师与专科认证'), T('Optional 1-year residency, then board certification — e.g. Sports (SCS) or Orthopaedics (OCS) through ABPTS.', '可选 1 年住院医师培训，再通过 ABPTS 获得专科认证，如运动（SCS）或骨科（OCS）。')]],
      cn: [[T('Undergraduate', '本科'), T('Rehabilitation therapy (康复治疗学) or sports rehabilitation (运动康复), 4 years.', '康复治疗学或运动康复专业，4 年。')],
        [T('Internship', '实习'), T('Clinical placements in hospital rehab departments during the final year.', '最后一年在医院康复科进行临床实习。')],
        [T('Qualification exam', '资格考试'), T('National rehabilitation therapy technician exam (康复医学治疗技术, 士 / 师 level).', '全国卫生专业技术资格考试（康复医学治疗技术，士 / 师）。')],
        [T('Practise', '执业'), T('Hospitals, rehab centres, sports teams; 运动康复师 certificates for sport settings.', '医院、康复中心、运动队；运动场景可考取运动康复师证书。')],
        [T('Advance', '晋升'), T('Senior titles (主管治疗师 and above) with years of practice, exams and publications.', '随执业年限、考试和论文晋升主管治疗师及以上职称。')]]
    };
    var where = 'us';
    host.innerHTML = seg([['us', T('🇺🇸 United States', '🇺🇸 美国')], ['cn', T('🇨🇳 China', '🇨🇳 中国')]], 'us') + '<ol class="kv-path"></ol><div class="kv-callout"></div>' +
      note('US physical therapists earned a median of about $100k in 2023 (BLS); the field is projected to grow faster than average.', '2023 年美国物理治疗师年薪中位数约 10 万美元（BLS），行业增长预期高于平均水平。');
    function draw(step) {
      var p = P[where];
      host.querySelector('.kv-path').innerHTML = p.map(function (s, i) { return '<li><button type="button" data-i="' + i + '" aria-pressed="' + (i === step ? 'true' : 'false') + '"><b>' + (i + 1) + '</b><span>' + esc(s[0]) + '</span></button></li>'; }).join('');
      host.querySelector('.kv-callout').textContent = p[step][1];
    }
    wireSeg(host, function (v) { where = v; draw(0); });
    host.querySelector('.kv-path').addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button'); if (b) draw(+b.getAttribute('data-i')); });
    draw(0);
  };

  /* Ch 12 · Goniometer + MMT scale */
  VIS[12] = function (host) {
    var J = { knee: [T('Knee flexion', '膝关节屈曲'), 135], hip: [T('Hip flexion', '髋关节屈曲'), 120], sh: [T('Shoulder flexion', '肩关节前屈'), 180], elbow: [T('Elbow flexion', '肘关节屈曲'), 150], ankle: [T('Ankle dorsiflexion', '踝关节背屈'), 20] };
    var MMT = [[0, T('No contraction felt', '无肌肉收缩')], [1, T('Flicker, no movement', '可触及收缩，无关节活动')], [2, T('Full range with gravity removed', '去重力下全范围活动')], [3, T('Full range against gravity', '抗重力全范围活动')], [4, T('Against gravity + moderate resistance', '抗重力及中等阻力')], [5, T('Against gravity + full resistance', '抗重力及最大阻力')]];
    var j = 'knee';
    host.innerHTML = seg(Object.keys(J).map(function (k) { return [k, J[k][0]]; }), 'knee') +
      '<div class="kv-row"><svg class="kv-svg kv-gon" viewBox="0 0 200 150" aria-hidden="true"><path class="kv-arc"/><line class="kv-seg1" x1="100" y1="110" x2="190" y2="110"/><line class="kv-seg2" x1="100" y1="110"/><circle cx="100" cy="110" r="7" class="kv-axis"/><text class="kv-deg" x="100" y="142" text-anchor="middle"></text></svg>' +
      '<div class="kv-side"><label class="kv-q">' + esc(T('Measured angle', '测量角度')) + range(0, 180, 90) + '</label><div class="kv-callout"></div></div></div>' +
      '<div class="kv-q kv-q2">' + esc(T('Manual muscle test grades — tap one:', '徒手肌力分级 — 点一个：')) + '</div><div class="kv-mmt">' +
      MMT.map(function (m) { return '<button type="button" data-g="' + m[0] + '">' + m[0] + '</button>'; }).join('') + '</div><div class="kv-callout kv-mmt-out"></div>' +
      note('Normal ranges are AAOS averages; compare with the other side. Place the goniometer axis over the joint, arms along the limb segments.', '正常范围为 AAOS 平均值，应与健侧对比。量角器轴心对准关节，两臂沿肢体节段。');
    var inp = host.querySelector('input');
    function draw() {
      var norm = J[j][1]; inp.max = Math.max(norm + 20, 40);
      var a = +inp.value, r = a * Math.PI / 180, x = 100 + 80 * Math.cos(-r), y = 110 + 80 * Math.sin(-r);
      host.querySelector('.kv-seg2').setAttribute('x2', x.toFixed(1)); host.querySelector('.kv-seg2').setAttribute('y2', y.toFixed(1));
      var ax = 100 + 34 * Math.cos(-r), ay = 110 + 34 * Math.sin(-r);
      host.querySelector('.kv-arc').setAttribute('d', 'M134,110 A34,34 0 ' + (a > 180 ? 1 : 0) + ' 0 ' + ax.toFixed(1) + ',' + ay.toFixed(1));
      host.querySelector('.kv-deg').textContent = a + '°';
      var pct = Math.round(a / norm * 100);
      host.querySelector('.kv-callout').textContent = T('Normal ≈ 0–' + norm + '°. ', '正常 ≈ 0–' + norm + '°。') +
        (a >= norm ? T('Full range.', '活动度完全。') : T('Limited — about ' + pct + '% of normal.', '受限 — 约为正常的 ' + pct + '%。'));
    }
    wireSeg(host, function (v, b) { if (!J[v]) return; j = v; inp.value = Math.round(J[j][1] * 0.7); draw(); });
    host.querySelector('.kv-mmt').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button'); if (!b) return;
      $$('.kv-mmt button', host).forEach(function (x) { x.classList.toggle('on', x === b); });
      host.querySelector('.kv-mmt-out').textContent = T('Grade ', '等级 ') + b.getAttribute('data-g') + ' — ' + MMT[+b.getAttribute('data-g')][1];
    });
    inp.addEventListener('input', draw); inp.value = 95; draw();
    host.querySelector('.kv-mmt button[data-g="3"]').click();
  };

  /* Ch 13 · Five phases (五行) wheel */
  VIS[13] = function (host) {
    var E = [
      ['wood', T('Wood', '木'), '#3E8E5E', T('Liver · Gallbladder', '肝 · 胆'), T('Spring', '春'), T('Anger', '怒')],
      ['fire', T('Fire', '火'), '#C8453E', T('Heart · Small intestine', '心 · 小肠'), T('Summer', '夏'), T('Joy', '喜')],
      ['earth', T('Earth', '土'), '#C9A23A', T('Spleen · Stomach', '脾 · 胃'), T('Late summer', '长夏'), T('Worry', '思')],
      ['metal', T('Metal', '金'), '#9AA6B2', T('Lung · Large intestine', '肺 · 大肠'), T('Autumn', '秋'), T('Grief', '悲')],
      ['water', T('Water', '水'), '#2F5E9A', T('Kidney · Bladder', '肾 · 膀胱'), T('Winter', '冬'), T('Fear', '恐')]
    ];
    var P = E.map(function (e, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [110 + 74 * Math.cos(a), 104 + 74 * Math.sin(a)]; });
    function arrow(a, b, cls) {
      var dx = P[b][0] - P[a][0], dy = P[b][1] - P[a][1], d = Math.sqrt(dx * dx + dy * dy), ux = dx / d, uy = dy / d;
      var x1 = P[a][0] + ux * 26, y1 = P[a][1] + uy * 26, x2 = P[b][0] - ux * 30, y2 = P[b][1] - uy * 30;
      return '<line class="' + cls + '" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" marker-end="url(#kvArrow)"/>';
    }
    var gen = '', ctl = '';
    for (var i = 0; i < 5; i++) { gen += arrow(i, (i + 1) % 5, 'kv-gen'); ctl += arrow(i, (i + 2) % 5, 'kv-ctl'); }
    host.innerHTML = seg([['gen', T('Generating 相生', '相生')], ['ctl', T('Controlling 相克', '相克')]], 'gen') +
      '<div class="kv-row"><svg class="kv-svg kv-wx" viewBox="0 0 220 210" data-c="gen"><defs><marker id="kvArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>' +
      '<g class="kv-gens">' + gen + '</g><g class="kv-ctls">' + ctl + '</g>' +
      E.map(function (e, i) { return '<g class="kv-el" data-i="' + i + '" tabindex="0"><circle cx="' + P[i][0].toFixed(1) + '" cy="' + P[i][1].toFixed(1) + '" r="24" style="--c:' + e[2] + '"/><text x="' + P[i][0].toFixed(1) + '" y="' + (P[i][1] + 5).toFixed(1) + '">' + esc(e[1]) + '</text></g>'; }).join('') +
      '</svg><div class="kv-side kv-el-out"></div></div>' +
      note('A traditional framework for describing patterns, not a biomedical mechanism. Used in TCM health management alongside modern assessment.', '这是描述整体规律的传统框架，并非生物医学机制；在中医健康管理中与现代评估并用。');
    function pick(i) {
      var e = E[i];
      $$('.kv-el', host).forEach(function (g) { g.classList.toggle('on', +g.getAttribute('data-i') === i); });
      host.querySelector('.kv-el-out').innerHTML = '<b style="color:' + e[2] + '">' + esc(e[1]) + '</b><dl><dt>' + esc(T('Organs', '脏腑')) + '</dt><dd>' + esc(e[3]) + '</dd><dt>' + esc(T('Season', '季节')) + '</dt><dd>' + esc(e[4]) + '</dd><dt>' + esc(T('Emotion', '情志')) + '</dt><dd>' + esc(e[5]) + '</dd>' +
        '<dt>' + esc(T('Feeds', '生')) + '</dt><dd>' + esc(E[(i + 1) % 5][1]) + '</dd><dt>' + esc(T('Restrains', '克')) + '</dt><dd>' + esc(E[(i + 2) % 5][1]) + '</dd></dl>';
    }
    wireSeg(host, function (v) { host.querySelector('.kv-wx').setAttribute('data-c', v); });
    host.addEventListener('click', function (e) { var g = e.target.closest && e.target.closest('.kv-el'); if (g) pick(+g.getAttribute('data-i')); });
    host.addEventListener('keydown', function (e) { var g = e.target.closest && e.target.closest('.kv-el'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(+g.getAttribute('data-i')); } });
    pick(0);
  };

  /* Ch 14 · CPR coach + chain of survival */
  VIS[14] = function (host) {
    var CHAIN = [[T('Recognise & call', '识别并呼救'), T('Unresponsive and not breathing normally (gasping counts as not breathing)? Call emergency services and send for an AED.', '无反应且无正常呼吸（濒死喘息视为无呼吸）？立即呼叫急救并取 AED。')],
      [T('Early CPR', '尽早心肺复苏'), T('Push hard and fast in the centre of the chest: 5–6 cm deep, 100–120 a minute, full recoil.', '在胸部正中用力快速按压：深度 5–6 cm，频率 100–120 次/分，充分回弹。')],
      [T('Early defibrillation', '尽早除颤'), T('Switch the AED on and follow its voice prompts. Every minute without a shock cuts survival by roughly 7–10%.', '打开 AED 按语音提示操作。每延迟 1 分钟除颤，生存率约下降 7–10%。')],
      [T('Advanced care', '高级生命支持'), T('Paramedics take over: airway, drugs, transport.', '急救人员接手：气道管理、用药、转运。')],
      [T('Recovery', '康复'), T('Hospital care and rehabilitation after survival.', '存活后的院内治疗与康复。')]];
    host.innerHTML =
      '<div class="kv-cpr"><button type="button" class="kv-heart" aria-pressed="false"><span class="kv-heart-i" aria-hidden="true">♥</span><span class="kv-heart-t"></span></button>' +
      '<div class="kv-cpr-out"><div class="kv-count"><b>0</b><span>/ 30</span></div><div class="kv-cue"></div>' +
      '<label class="kv-snd"><input type="checkbox"> ' + esc(T('Beep', '提示音')) + '</label></div></div>' +
      '<ol class="kv-path kv-chain">' + CHAIN.map(function (c, i) { return '<li><button type="button" data-i="' + i + '" aria-pressed="' + (i === 1 ? 'true' : 'false') + '"><b>' + (i + 1) + '</b><span>' + esc(c[0]) + '</span></button></li>'; }).join('') + '</ol>' +
      '<div class="kv-callout kv-chain-out"></div>' + note('Practice rhythm only — take a certified CPR/AED course (AHA, Red Cross) before you need it.', '仅供练习节奏 — 请在需要之前参加认证的 CPR/AED 课程（如 AHA、红十字会）。');
    var btn = host.querySelector('.kv-heart'), n = 0, timer = 0, ac = null, pause = 0;
    function label() { host.querySelector('.kv-heart-t').textContent = timer ? T('Stop', '停止') : T('Start 110 / min', '开始 110 次/分'); }
    function beep() {
      if (!host.querySelector('.kv-snd input').checked) return;
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        var o = ac.createOscillator(), gn = ac.createGain();
        o.frequency.value = 880; gn.gain.value = 0.06; o.connect(gn); gn.connect(ac.destination);
        o.start(); o.stop(ac.currentTime + 0.05);
      } catch (e) {}
    }
    function beat() {
      if (pause > 0) { pause--; if (!pause) { n = 0; host.querySelector('.kv-cue').textContent = T('Push hard, push fast', '用力按，快速按'); } return; }
      n++;
      host.querySelector('.kv-count b').textContent = n;
      btn.classList.remove('kv-pulse'); void btn.offsetWidth; btn.classList.add('kv-pulse');
      beep();
      if (n >= 30) { pause = 7; host.querySelector('.kv-cue').textContent = T('2 rescue breaths (or keep compressing if untrained)', '2 次人工呼吸（未受训者持续按压即可）'); }
    }
    btn.addEventListener('click', function () {
      if (timer) { clearInterval(timer); timer = 0; btn.setAttribute('aria-pressed', 'false'); }
      else { n = 0; pause = 0; host.querySelector('.kv-count b').textContent = '0'; host.querySelector('.kv-cue').textContent = T('Push hard, push fast', '用力按，快速按'); timer = setInterval(beat, 60000 / 110); btn.setAttribute('aria-pressed', 'true'); }
      label();
    });
    host.querySelector('.kv-chain').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button'); if (!b) return;
      $$('.kv-chain button', host).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      host.querySelector('.kv-chain-out').textContent = CHAIN[+b.getAttribute('data-i')][1];
    });
    host.querySelector('.kv-cue').textContent = T('Tap the heart and compress to the beat', '点击心形并跟随节拍按压');
    host.querySelector('.kv-chain-out').textContent = CHAIN[1][1];
    label();
    host._stop = function () { if (timer) { clearInterval(timer); timer = 0; } };
  };

  /* ═══ 4 · Flip cards from the chapter's fact cards ═════════════════════ */
  function cardsFor(ch) {
    var s = document.getElementById('ch' + ch);
    if (!s) return [];
    return $$('ul.facts > li', s).map(function (li) {
      var b = li.querySelector(':scope > b'), sp = li.querySelector(':scope > span[data-en]');
      if (!b || !sp) return null;
      return { f: [txt(b, 'en').replace(/[:：]\s*$/, ''), txt(b, 'zh').replace(/[:：]\s*$/, '')], b: [txt(sp, 'en'), txt(sp, 'zh')] };
    }).filter(function (c) { return c && c.f[0] && c.b[0] && !/^what (these|this) (are|is)$/i.test(c.f[0]); });
  }
  function flipCards(host, ch) {
    var cards = cardsFor(ch), i = 0, known = load('kn_fc', {}), mine = known[ch] || [];
    if (!cards.length) { host.innerHTML = '<p class="kv-note">' + esc(T('No cards in this chapter yet.', '本章暂无卡片。')) + '</p>'; return; }
    host.innerHTML = '<div class="kn-fc"><button type="button" class="kn-card" aria-live="polite"><span class="kn-face kn-front"></span><span class="kn-face kn-back"></span></button>' +
      '<div class="kn-fc-bar"><button type="button" class="kv-btn kn-prev" aria-label="' + esc(T('Previous', '上一张')) + '">←</button><span class="kn-fc-n"></span>' +
      '<button type="button" class="kv-btn kn-got"></button><button type="button" class="kv-btn kn-next" aria-label="' + esc(T('Next', '下一张')) + '">→</button></div>' +
      '<p class="kv-note">' + esc(T('Click or press Space to flip · ← → to move', '点击或按空格翻面 · ← → 切换')) + '</p></div>';
    var card = host.querySelector('.kn-card');
    function draw() {
      var c = cards[i], z = zh() ? 1 : 0;
      card.classList.remove('flip');
      host.querySelector('.kn-front').textContent = c.f[z];
      host.querySelector('.kn-back').textContent = c.b[z];
      host.querySelector('.kn-fc-n').textContent = (i + 1) + ' / ' + cards.length + ' · ' + T(mine.length + ' known', '已掌握 ' + mine.length);
      var k = mine.indexOf(i) > -1;
      host.querySelector('.kn-got').textContent = k ? T('✓ Known', '✓ 已掌握') : T('I know this', '我会了');
      host.querySelector('.kn-got').classList.toggle('on', k);
    }
    function go(d) { i = (i + d + cards.length) % cards.length; draw(); }
    card.addEventListener('click', function () { card.classList.toggle('flip'); });
    host.querySelector('.kn-prev').addEventListener('click', function () { go(-1); });
    host.querySelector('.kn-next').addEventListener('click', function () { go(1); });
    host.querySelector('.kn-got').addEventListener('click', function () {
      var p = mine.indexOf(i);
      if (p > -1) mine.splice(p, 1); else mine.push(i);
      known[ch] = mine; save('kn_fc', known);
      if (p < 0) go(1); else draw();
    });
    host.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === ' ' && e.target === card) { e.preventDefault(); card.classList.toggle('flip'); }
    });
    draw();
  }

  /* ═══ 5 · Quick check from the adaptive quiz bank ══════════════════════ */
  function bank(ch) {
    try {
      /* TOPICS / Q_TEMPLATES are top-level consts in guide.html's own script */
      /* eslint-disable no-undef */
      var t = TOPICS.filter(function (x) { return x.ch === ch; })[0];
      var qs = t && Q_TEMPLATES[t.id];
      /* eslint-enable no-undef */
      return (qs || []).filter(function (q) { return q.opts && q.opts.length && typeof q.correct === 'number'; });
    } catch (e) { return []; }
  }
  function quickCheck(host, ch) {
    var all = bank(ch);
    if (!all.length) { host.innerHTML = '<p class="kv-note">' + esc(T('No questions for this chapter yet.', '本章暂无题目。')) + '</p>'; return; }
    var easy = all.filter(function (q) { return q.d <= 2; }), hard = all.filter(function (q) { return q.d > 2; });
    var set = shuffle(easy).slice(0, 2).concat(shuffle(hard).slice(0, 1));
    if (set.length < 3) set = shuffle(all).slice(0, 3);
    var i = 0, score = 0;
    function show() {
      if (i >= set.length) {
        var best = load('kn_qc', {}); best[ch] = Math.max(best[ch] || 0, score); save('kn_qc', best);
        host.innerHTML = '<div class="kn-qc-done"><div class="kn-qc-score">' + score + ' / ' + set.length + '</div><p>' +
          esc(score === set.length ? T('Clean sweep. This chapter is sticking.', '全对！本章掌握得很好。') : score ? T('Good start — the concise view shows what to re-read.', '不错的开始 — 用精简视图回顾要点。') : T('Worth another pass through the key points.', '建议再看一遍要点。')) +
          '</p><div class="kn-qc-act"><button type="button" class="kv-btn kn-again">' + esc(T('New questions ↻', '换一组 ↻')) + '</button>' +
          (typeof window.openQuizModeForChapter === 'function' ? '<button type="button" class="kv-btn primary kn-full">' + esc(T('Full chapter quiz →', '完整章节测验 →')) + '</button>' : '') + '</div></div>';
        host.querySelector('.kn-again').addEventListener('click', function () { quickCheck(host, ch); });
        var f = host.querySelector('.kn-full'); if (f) f.addEventListener('click', function () { window.openQuizModeForChapter(ch); });
        return;
      }
      var q = set[i], z = zh(), opts = (z && q.optsCn) || q.opts;
      host.innerHTML = '<div class="kn-qc"><div class="kv-tagline">' + esc(T('Question ', '第 ') + (i + 1) + (z ? ' 题 / 共 ' + set.length : ' of ' + set.length)) + '</div><p class="kv-scq">' + esc((z && q.qCn) || q.q) + '</p><div class="kv-opts">' +
        opts.map(function (o, k) { return '<button type="button" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '</div><div class="kv-callout" hidden></div><div class="kv-next" hidden></div></div>';
      host.querySelector('.kv-opts').addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('button'); if (!b || b.disabled) return;
        var k = +b.getAttribute('data-k'), ok = k === q.correct;
        if (ok) score++;
        $$('.kv-opts button', host).forEach(function (x, j) { x.disabled = true; x.classList.add(j === q.correct ? 'right' : x === b ? 'wrong' : 'dim'); });
        var c = host.querySelector('.kv-callout'); c.hidden = false; c.textContent = (ok ? '✓ ' : '✗ ') + ((z && q.explainCn) || q.explain || '');
        var n = host.querySelector('.kv-next'); n.hidden = false;
        n.innerHTML = '<button type="button" class="kv-btn">' + esc(i < set.length - 1 ? T('Next →', '下一题 →') : T('See score', '查看得分')) + '</button>';
        n.querySelector('button').addEventListener('click', function () { i++; show(); });
      });
    }
    show();
  }

  /* ═══ 6 · Chapter map ══════════════════════════════════════════════════ */
  function chapterMap(host, ch) {
    var hs = heads(ch), read = readSet(ch);
    host.innerHTML = '<ol class="kn-map">' + hs.map(function (h, i) {
      return '<li><button type="button" class="kn-map-i' + (read.indexOf(i) > -1 ? ' done' : '') + '" data-i="' + i + '"><span class="kn-map-c" aria-hidden="true"></span><span>' + esc(bi(h)) + '</span></button></li>';
    }).join('') + '</ol>';
    host.querySelector('.kn-map').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.kn-map-i'); if (!b) return;
      var h = hs[+b.getAttribute('data-i')];
      if (!h.parentElement.classList.contains('open')) h.click(); else markRead(ch, +b.getAttribute('data-i'));
      setTimeout(function () { h.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' }); }, 60);
    });
  }

  /* ═══ 7 · The Learn panel ══════════════════════════════════════════════ */
  var TABS = [['vis', '🧪', 'Interactive', '互动'], ['fc', '🃏', 'Flip cards', '翻卡'], ['qc', '✅', 'Quick check', '快测'], ['map', '🗺', 'Chapter map', '章节地图']];
  function paint(panel) {
    var ch = +panel.getAttribute('data-ch'), tab = panel.getAttribute('data-tab') || 'vis', pane = panel.querySelector('.kn-pane');
    if (pane._stop) pane._stop();
    pane._stop = null;
    pane.innerHTML = '';
    $$('.kn-tab', panel).forEach(function (b) {
      var on = b.getAttribute('data-t') === tab;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (tab === 'vis' && VIS[ch]) { var box = el('div', 'kv kv-' + ch); pane.appendChild(box); VIS[ch](box); pane._stop = box._stop; }
    else if (tab === 'fc') flipCards(pane, ch);
    else if (tab === 'qc') quickCheck(pane, ch);
    else chapterMap(pane, ch);
    refreshProgress(ch);
  }
  function panelTexts(panel) {
    panel.querySelector('.kn-ltitle').textContent = T('Learn it your way', '换种方式学');
    panel.querySelector('.kn-lsub').textContent = T('Play with it, flip it, test it — then read the key points below.', '先玩一玩、翻一翻、测一测，再读下面的要点。');
    $$('.kn-tab', panel).forEach(function (b) {
      var t = TABS.filter(function (x) { return x[0] === b.getAttribute('data-t'); })[0];
      b.innerHTML = '<span aria-hidden="true">' + t[1] + '</span> ' + esc(T(t[2], t[3]));
    });
    $$('.kn-mode button', panel).forEach(function (b) { b.textContent = b.getAttribute('data-m') === 'full' ? T('Full', '完整') : T('Concise', '精简'); });
    panel.querySelector('.kn-mode').setAttribute('aria-label', T('Reading mode', '阅读模式'));
  }
  function buildPanel(sec) {
    if (sec.querySelector('.kn-learn')) return;
    var ch = parseInt(sec.id.slice(2), 10);
    var host = sec.querySelector('.container') || sec;
    var anchor = host.querySelector(':scope > h3') || host.querySelector(':scope > h2');
    var panel = el('div', 'kn-learn');
    panel.setAttribute('data-ch', ch);
    panel.setAttribute('data-tab', load('kn_tab', 'vis'));
    panel.innerHTML =
      '<div class="kn-lhead"><div><div class="kn-ltitle"></div><div class="kn-lsub"></div></div>' +
      '<div class="kn-mode kv-seg" role="group"><button type="button" data-m="concise"></button><button type="button" data-m="full"></button></div></div>' +
      '<div class="kn-prog"><div class="kn-prog-bar"><i class="kn-prog-fill"></i></div><span class="kn-prog-t"></span></div>' +
      '<div class="kn-tabs" role="tablist">' + TABS.map(function (t) { return '<button type="button" role="tab" class="kn-tab" data-t="' + t[0] + '"></button>'; }).join('') + '</div>' +
      '<div class="kn-pane" role="tabpanel"></div>';
    if (anchor && anchor.nextSibling) host.insertBefore(panel, anchor.nextSibling); else host.insertBefore(panel, host.firstChild);
    panelTexts(panel);
    $$('.kn-mode button', panel).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-m') === mode() ? 'true' : 'false'); });
    panel.querySelector('.kn-mode').addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button'); if (b) applyMode(b.getAttribute('data-m')); });
    var tabs = panel.querySelector('.kn-tabs');
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.kn-tab'); if (!b) return;
      panel.setAttribute('data-tab', b.getAttribute('data-t')); save('kn_tab', b.getAttribute('data-t')); paint(panel);
    });
    tabs.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var bs = $$('.kn-tab', panel), k = bs.indexOf(document.activeElement);
      if (k < 0) return;
      var nb = bs[(k + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length];
      nb.focus(); nb.click();
    });
    paint(panel);
  }

  function currentChapter() {
    var s = document.querySelector('section.chapter.shown[id^="ch"]');
    return s ? parseInt(s.id.slice(2), 10) : 0;
  }
  function onChapter() {
    var ch = currentChapter();
    if (!ch) return;
    var sec = document.getElementById('ch' + ch);
    safe(function () { buildPanel(sec); });
    save('kn_last', { ch: ch, t: Date.now() });
    /* stop a running CPR metronome when leaving its chapter */
    $$('.kn-learn').forEach(function (p) { if (+p.getAttribute('data-ch') !== ch) { var pn = p.querySelector('.kn-pane'); if (pn && pn._stop) pn._stop(); } });
  }

  /* ═══ 7b · Knowledge Hub (toc.html): continue, rings, tracks ══════════ */
  function chapterPct(ch) {
    var tot = load('kn_tot', {})[ch] || 0, n = (load('kn_read', {})[ch] || []).length;
    return tot ? Math.min(1, n / tot) : 0;
  }
  function hub() {
    var grid = document.querySelector('.ch-grid');
    if (!grid) return;
    $$('.ch-card[data-ch]', grid).forEach(function (card) {
      var num = card.querySelector('.ch-num');
      if (!num || num.querySelector('.kh-ring')) return;
      var p = chapterPct(+card.getAttribute('data-ch')), C = 2 * Math.PI * 27;
      var ring = el('span', 'kh-ring');
      ring.setAttribute('aria-hidden', 'true');
      ring.innerHTML = '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="27" class="kh-ring-bg"/><circle cx="30" cy="30" r="27" class="kh-ring-fg" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - p)).toFixed(1) + '"/></svg>';
      num.appendChild(ring);
      if (p >= 1) card.classList.add('kh-done');
      card.setAttribute('aria-label', (card.querySelector('h4') ? card.querySelector('h4').textContent + ' — ' : '') + Math.round(p * 100) + '%');
    });
    var tracks = document.querySelector('.kh-tracks');
    if (tracks && !tracks._kn) {
      tracks._kn = 1;
      tracks.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('button'); if (!b) return;
        var tr = b.getAttribute('data-tr');
        $$('button', tracks).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $$('.ch-card[data-track]', grid).forEach(function (c) { c.classList.toggle('kh-hide', tr !== 'all' && c.getAttribute('data-track') !== tr); });
      });
    }
    var go = document.getElementById('khContinue'), last = load('kn_last', null);
    if (go && last && last.ch) {
      go.href = 'guide.html#ch' + last.ch;
      go.setAttribute('data-en', '📖 Continue Chapter ' + last.ch);
      go.setAttribute('data-zh', '📖 继续第 ' + last.ch + ' 章');
      go.textContent = T('📖 Continue Chapter ' + last.ch, '📖 继续第 ' + last.ch + ' 章');
    }
  }

  /* ═══ 7b · Practise every part ═════════════════════════════════════════ */
  /* Every section (textbook accordions, G10 Bio, certificates, and the IB
     SEHS lessons as they render) gets a tray of activities built from its
     own content: its fact cards and key terms become a concept web, a
     matching game, true-or-false and cover-and-recall; arrow chains and
     numbered steps become a put-it-in-order puzzle; numbers in the text
     become guess-the-number; comparison tables become which-column; and
     every part can be taught back in your own words (the AI checks it, and
     offline the key terms you used are counted). Nothing is written by hand
     per section, so new content gets practice for free. */
  var AI_URL = 'https://api.vitaliteplan.com';
  var GENERIC = /^(notes?|tips?|remember|see also|source|reference)\b/i;   /* leads that aren't ideas */
  function clean(node, lang) {
    if (!node) return '';
    var v = node.getAttribute && node.getAttribute('data-' + lang);
    if (v == null && lang === 'zh') v = node.getAttribute && node.getAttribute('data-en');
    if (v == null) { var c = node.cloneNode(true); $$('.cn', c).forEach(function (x) { x.remove(); }); v = c.textContent; }
    return String(v).replace(/\s+/g, ' ').trim();
  }
  function pairOf(t, d) { return { t: t, d: d }; }
  function bil(node) { return { en: clean(node, 'en'), zh: clean(node, 'zh') }; }
  function L(o) { return o ? (zh() ? (o.zh || o.en) : o.en) : ''; }
  function short(s, n) {
    s = String(s || '');
    var m = s.match(/^(.{20,}?[.;。；!?！？])(\s|$)/);
    if (m && m[1].length <= n) return m[1];
    return s.length > n ? s.slice(0, n - 1).replace(/[\s,，、;；:：]+\S*$/, '') + '…' : s;
  }
  function stripColon(o) { return { en: o.en.replace(/[:：]\s*$/, ''), zh: o.zh.replace(/[:：]\s*$/, '') }; }
  function restOf(li, b) {
    var sp = li.querySelector(':scope > span[data-en]');
    if (sp) return bil(sp);
    var c = li.cloneNode(true); var bb = c.querySelector('b,strong'); if (bb) bb.remove(); $$('.cn', c).forEach(function (x) { x.remove(); });
    var t = c.textContent.replace(/\s+/g, ' ').replace(/^[\s:：—–-]+/, '').trim();
    return { en: t, zh: t };
  }
  function extract(host) {
    var P = [], seen = {};
    function add(t, d) {
      if (!t.en || !d.en) return;
      if (t.en.length < 2 || t.en.length > 70 || d.en.length < 12) return;
      if (GENERIC.test(t.en)) return;
      d = { en: d.en.replace(/[;；,，]\s*$/, ''), zh: (d.zh || d.en).replace(/[;；,，]\s*$/, '') };
      var k = t.en.toLowerCase().replace(/^(pattern|step|stage|phase|type|rule|level|grade|law)\s*\d+\s*[·—–:-]\s*/, '').replace(/[^a-z0-9]+/g, ' ').trim();
      if (!k || Object.keys(seen).some(function (o) { return o === k || (o.length > 5 && k.length > 5 && (o.indexOf(k) >= 0 || k.indexOf(o) >= 0)); })) return;
      seen[k] = 1;
      P.push(pairOf(t, d));
    }
    $$('li, .pathway-content', host).forEach(function (li) { var b = li.querySelector(':scope > b, :scope > strong'); if (b) add(stripColon(bil(b)), restOf(li, b)); });
    $$('.native-formula', host).forEach(function (f) { var b = f.querySelector(':scope > b'), sp = f.querySelector(':scope > span'); if (b && sp) add(bil(b), bil(sp)); });
    $$('.native-term', host).forEach(function (r) { var dt = r.querySelector('dt'), dd = r.querySelector('dd'); if (dt && dd) add(bil(dt), bil(dd)); });
    $$('.native-bullets li', host).forEach(function (li) {
      var d = li.querySelector('.li-def'); if (!d) return;
      var c = li.cloneNode(true); var x = c.querySelector('.li-def'); if (x) x.remove();
      add({ en: (li.getAttribute('data-en') || c.textContent).trim(), zh: (li.getAttribute('data-zh') || c.textContent).trim() }, bil(d));
    });
    /* plain "Term: what it means" bullets */
    $$('li', host).forEach(function (li) {
      if (li.querySelector('b,strong') || li.closest('.ks')) return;
      var o = bil(li), m = o.en.match(/^([^:：]{2,60}?)\s*[:：]\s+(.{12,})$/);
      if (!m || /\d$/.test(m[1])) return;
      var z = (o.zh || '').match(/^([^:：]{1,40}?)\s*[:：]\s*(.{4,})$/);
      add({ en: m[1], zh: z ? z[1] : m[1] }, { en: m[2], zh: z ? z[2] : m[2] });
    });
    var C = [];
    $$('table', host).forEach(function (tb) {
      var rows = $$('tr', tb), head = rows[0] && $$('th', rows[0]);
      var body = rows.filter(function (r) { return r.querySelector('td'); });
      body.forEach(function (r) {
        var td = $$('td,th', r);
        if (td.length >= 2) add(bil(td[0]), bil(td[1]));
      });
      if (head && head.length >= 3 && body.length >= 2) {
        body.forEach(function (r) {
          var td = $$('td,th', r);
          for (var i = 1; i < Math.min(td.length, head.length); i++) {
            var v = bil(td[i]);
            if (v.en && v.en.length > 1 && v.en.length <= 90) C.push({ row: bil(td[0]), v: v, col: i, head: $$('th', rows[0]).map(bil) });
          }
        });
      }
    });
    /* chains: A → B → C in terms or cells, and short ordered lists */
    var chains = [];
    $$('[data-en]', host).forEach(function (n) {
      if (chains.length >= 4) return;
      var en = n.getAttribute('data-en') || '';
      if (!/[→➜⇒]/.test(en)) return;
      var a = en.split(/\s*[→➜⇒]\s*/).map(function (s) { return s.replace(/^[^:：]*[:：]\s*/, '').replace(/[.。]$/, '').trim(); });
      if (a.length < 3 || a.length > 7 || a.some(function (s) { return s.length < 2 || s.length > 40; })) return;
      var zs = (n.getAttribute('data-zh') || '').split(/\s*[→➜⇒]\s*/).map(function (s) { return s.replace(/^[^:：]*[:：]\s*/, '').replace(/[.。]$/, '').trim(); });
      var key = a.join('|'); if (chains.some(function (c) { return c.key === key; })) return;
      chains.push({ key: key, steps: a.map(function (s, i) { return { en: s, zh: zs.length === a.length ? zs[i] : s }; }) });
    });
    $$('.pathway', host).forEach(function (pw) {
      var st = $$('.pathway-content > strong, .pathway-content > b', pw).map(function (b) { var o = bil(b); return { en: o.en.replace(/^step\s*\d+\s*[·:—-]\s*/i, ''), zh: o.zh.replace(/^第.步\s*[·:：—-]\s*/, '') }; });
      if (st.length >= 3 && st.length <= 8) chains.unshift({ key: 'pw', steps: st });
    });
    var eb = $$('.evidence-badge', host).map(bil);
    if (eb.length >= 3 && eb.length <= 8) chains.unshift({ key: 'eb', steps: eb });
    $$('ol', host).forEach(function (ol) {
      if (chains.length >= 4) return;
      var li = $$(':scope > li', ol);
      if (li.length < 3 || li.length > 7) return;
      var st = li.map(bil);
      if (st.some(function (s) { return s.en.length > 90; })) return;
      chains.push({ key: st.map(function (s) { return s.en; }).join('|'), steps: st.map(function (s) { return { en: short(s.en, 60), zh: short(s.zh, 40) }; }) });
    });
    /* numbers in the definitions */
    var NUM = /(\d+(?:\.\d+)?)\s?(%|percent|hours?|hrs?|days?|weeks?|months?|years?|minutes?|mins?|seconds?|bpm|beats|kg|mg|g\b|°C|mmHg|mL|ml|kcal|km|cm|mm|reps?|sets?|times)/i;
    var N = [];
    $$('.stat-card', host).forEach(function (c) {
      var num = c.querySelector('.stat-num'), lab = c.querySelector('.stat-label');
      if (!num || !lab || N.length >= 5) return;
      var raw = num.textContent.trim(), m = raw.match(/\d+(?:\.\d+)?/);
      if (!m) return;
      var tpl = raw.replace(m[0], '▢'), l = bil(lab);
      N.push({ v: parseFloat(m[0]), dec: /\./.test(m[0]), unit: raw.replace(m[0], '').replace(/[+~≈]/g, '').trim(), en: l.en + ': ' + tpl, zh: l.zh + '：' + tpl, full: l.en + ': ' + raw });
    });
    var plain = $$('li', host).filter(function (li) { return !li.querySelector('b,strong') && !li.closest('.ks'); }).map(function (li) { return { d: bil(li) }; });
    P.concat(C.map(function (c) { return { d: c.v }; }), plain).forEach(function (p) {
      if (N.length >= 5) return;
      var s = short(p.d.en, 170), m = s.match(NUM);
      if (!m) return;
      var v = parseFloat(m[1]);
      if (!(v > 0) || v > 5000) return;
      if (/^\d{4}$/.test(m[1]) && v > 1800) return;           /* a year, not a quantity */
      var zs = short(p.d.zh || '', 120), zi = zs.indexOf(m[1]);
      N.push({ v: v, dec: /\./.test(m[1]), unit: m[2], en: s.replace(m[0], '▢ ' + m[2]), zh: zi >= 0 ? zs.slice(0, zi) + '▢' + zs.slice(zi + m[1].length) : '', full: s });
    });
    /* sentences, for fill-the-gap and for numbers hiding in prose */
    var S = [];
    $$('p, li, dd, .pathway-content > span', host).forEach(function (n) {
      if (n.closest('.ks,.kn-digest,.kn-more') || n.querySelector('p,li,ul,ol')) return;
      var o = bil(n);
      (o.en.match(/[^.!?]+[.!?]/g) || []).forEach(function (se) {
        se = se.trim();
        if (se.length >= 32 && se.length <= 230 && S.length < 40) S.push({ en: se, zhAll: o.zh !== o.en ? o.zh : '' });
      });
    });
    S.forEach(function (se) {
      if (N.length >= 5) return;
      var m = se.en.match(NUM); if (!m) return;
      var v = parseFloat(m[1]); if (!(v > 0) || v > 5000 || (/^\d{4}$/.test(m[1]) && v > 1800)) return;
      if (N.some(function (q) { return q.full === se.en; })) return;
      N.push({ v: v, dec: /\./.test(m[1]), unit: m[2], en: se.en.replace(m[0], '▢ ' + m[2]), zh: '', full: se.en });
    });
    var terms = P.map(function (p) { return p.t.en.toLowerCase(); });
    var STOP = /^(because|between|through|without|another|however|therefore|usually|different|important|including|especially|increase|increases|decrease|something|whether|although|example|several|becomes|general|certain|already|possible|probably|actually|instead|rather|within|around|during|against|further|overall)$/i;
    var G = [];
    shuffle(S).forEach(function (se) {
      if (G.length >= 8) return;
      var words = se.en.match(/[A-Za-z][A-Za-z-]{2,}|\d+(?:\.\d+)?%?/g) || [], pick = '';
      words.forEach(function (w) { if (!pick && w.length > 3 && terms.some(function (t) { return t.indexOf(w.toLowerCase()) === 0 || t === w.toLowerCase(); })) pick = w; });
      if (!pick) words.forEach(function (w) { if (!pick && /^[A-Z]{2,6}$/.test(w)) pick = w; });
      if (!pick) words.filter(function (w) { return w.length >= 8 && !STOP.test(w); }).sort(function (a, b) { return b.length - a.length; }).slice(0, 1).forEach(function (w) { pick = w; });
      if (!pick || G.some(function (g) { return g.w.toLowerCase() === pick.toLowerCase(); })) return;
      var zi = se.zhAll && /^[A-Za-z0-9%.]+$/.test(pick) ? se.zhAll.indexOf(pick) : -1;
      G.push({ w: pick, en: se.en, zh: zi >= 0 ? (se.zhAll.match(/[^。！？]*[。！？]/g) || [se.zhAll]).filter(function (z) { return z.indexOf(pick) >= 0; })[0] || '' : '' });
    });
    chains.sort(function (a, b) { return b.steps.length - a.steps.length; });
    return { P: P, C: shuffle(C).slice(0, 8), chains: chains, N: N, G: G };
  }
  function titleOf(host) {
    var h = host.closest && host.closest('.acc-item');
    var head = h ? h.querySelector(':scope > .acc-header') : host.querySelector('h3');
    return head ? bil(head) : { en: document.title, zh: document.title };
  }
  function bodyText(host) {
    var c = host.cloneNode(true);
    $$('.ks,.kn-digest,.kn-more,.cn', c).forEach(function (x) { x.remove(); });
    return c.textContent.replace(/\s+/g, ' ').trim();
  }

  var MODES = [
    ['web', '🕸', 'Concept web', '概念网'],
    ['match', '🔗', 'Match up', '配对'],
    ['tf', '⚖', 'True or false', '判断对错'],
    ['cover', '👁', 'Cover & recall', '遮住回忆'],
    ['order', '🔢', 'Put in order', '排顺序'],
    ['gap', '🧩', 'Fill the gap', '填空'],
    ['num', '🎯', 'Guess the number', '猜数字'],
    ['sort', '🗂', 'Which column?', '归哪一列'],
    ['teach', '💬', 'Teach it back', '讲给我听']
  ];
  function available(D, textLen) {
    var a = [];
    if (D.P.length >= 3) a.push('web', 'match');
    if (D.P.length >= 4) a.push('tf');
    if (D.P.length >= 3) a.push('cover');
    if (D.chains.length) a.push('order');
    if (D.G.length >= 3) a.push('gap');
    if (D.N.length >= 2) a.push('num');
    if (D.C.length >= 4) a.push('sort');
    if (textLen >= 180) a.push('teach');
    return a;
  }
  function pracKey(host) { return FILE + '#' + titleOf(host).en; }
  function didMode(host, m) {
    var all = load('kn_prac', {}), k = pracKey(host), l = all[k] || [];
    if (l.indexOf(m) < 0) { l.push(m); all[k] = l; save('kn_prac', all); }
    var tab = host.querySelector('.ks-tab[data-m="' + m + '"]'); if (tab) tab.classList.add('did');
    trayCount(host);
  }
  function trayCount(host) {
    var tray = host.querySelector(':scope > .ks'); if (!tray) return;
    var n = $$('.ks-tab', tray).length, d = $$('.ks-tab.did', tray).length;
    var c = tray.querySelector('.ks-count'); if (c) c.textContent = d ? d + ' / ' + n : '';
  }
  function refit(host) { var inner = host.classList.contains('acc-body-inner') ? host : null; if (inner) { fitAcc(inner); setTimeout(function () { fitAcc(inner); }, 450); } }
  function done(stage, en, z, again) {
    var n = el('div', 'ks-end');
    n.innerHTML = '<span class="ks-burst" aria-hidden="true">✦</span><b>' + esc(T(en, z)) + '</b>';
    if (again) {
      var b = el('button', 'ks-btn'); b.type = 'button'; b.textContent = T('Go again ↻', '再来一次 ↻');
      b.addEventListener('click', again); n.appendChild(b);
    }
    stage.appendChild(n);
  }

  var ACT = {};
  ACT.web = function (stage, D, host) {
    var P = D.P.slice(0, 7), n = P.length, seen = {};
    var t = titleOf(host), tt = L(t).replace(/^[\dA-Z]+(\.\d+)*\s+/, '');
    var box = el('div', 'ks-web');
    var lines = '';
    var pos = P.map(function (p, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [50 + 37 * Math.cos(a), 50 + 36 * Math.sin(a)];
    });
    pos.forEach(function (q) { lines += '<line x1="80" y1="45" x2="' + (q[0] * 1.6).toFixed(1) + '" y2="' + (q[1] * 0.9).toFixed(1) + '"/>'; });
    box.innerHTML = '<svg class="ks-web-lines" viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true">' + lines + '</svg>' +
      '<div class="ks-web-hub"><span>' + esc(short(tt, 48)) + '</span></div>' +
      P.map(function (p, i) { return '<button type="button" class="ks-node" data-i="' + i + '" style="left:' + pos[i][0].toFixed(1) + '%;top:' + pos[i][1].toFixed(1) + '%;--i:' + i + '">' + esc(short(L(p.t), 40)) + '</button>'; }).join('');
    var card = el('div', 'ks-web-card');
    card.innerHTML = '<p class="ks-hint">' + esc(T('Tap each idea around the topic to see how it connects.', '点周围的每个概念，看看它和主题怎样联系。')) + '</p>';
    stage.appendChild(box); stage.appendChild(card);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.ks-node'); if (!b) return;
      var i = +b.getAttribute('data-i'); seen[i] = 1;
      $$('.ks-node', box).forEach(function (x) { x.classList.toggle('on', x === b); });
      b.classList.add('seen');
      var ln = box.querySelectorAll('line')[i]; if (ln) ln.classList.add('seen');
      card.innerHTML = '<div class="ks-pop"><b>' + esc(L(P[i].t)) + '</b><p>' + esc(short(L(P[i].d), 260)) + '</p><span class="ks-meter">' + esc(T(Object.keys(seen).length + ' of ' + n + ' explored', '已探索 ' + Object.keys(seen).length + ' / ' + n)) + '</span></div>';
      if (Object.keys(seen).length === n) { didMode(host, 'web'); done(card, 'Web complete: every idea explored', '全部概念都探索过了'); }
      refit(host);
    });
  };
  ACT.match = function (stage, D, host) {
    var P = shuffle(D.P).slice(0, 5), miss = 0, got = 0, pick = null;
    var g = el('div', 'ks-match');
    var terms = P.map(function (p, i) { return '<button type="button" class="ks-mt" data-i="' + i + '">' + esc(short(L(p.t), 48)) + '</button>'; });
    var defs = shuffle(P.map(function (p, i) { return '<button type="button" class="ks-md" data-i="' + i + '">' + esc(short(L(p.d), 110)) + '</button>'; }));
    g.innerHTML = '<div class="ks-col">' + shuffle(terms).join('') + '</div><div class="ks-col">' + defs.join('') + '</div>';
    stage.appendChild(el('p', 'ks-hint', esc(T('Tap a term, then the meaning that goes with it.', '先点一个术语，再点它对应的意思。'))));
    stage.appendChild(g);
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.classList.contains('ok')) return;
      if (!pick || pick.className.split(' ')[0] === b.className.split(' ')[0]) {
        if (pick) pick.classList.remove('sel');
        pick = b; b.classList.add('sel'); return;
      }
      var a = pick; pick = null; a.classList.remove('sel');
      if (a.getAttribute('data-i') === b.getAttribute('data-i')) {
        got++;
        [a, b].forEach(function (x) { x.classList.add('ok'); x.setAttribute('data-n', got); });
        if (got === P.length) {
          didMode(host, 'match');
          done(stage, miss ? 'All matched, with ' + miss + ' slip' + (miss > 1 ? 's' : '') : 'All matched, no slips!', miss ? '全部配对，失误 ' + miss + ' 次' : '全部配对，零失误！', function () { stage.innerHTML = ''; ACT.match(stage, D, host); refit(host); });
        }
      } else {
        miss++;
        [a, b].forEach(function (x) { x.classList.remove('no'); void x.offsetWidth; x.classList.add('no'); });
      }
      refit(host);
    });
  };
  ACT.tf = function (stage, D, host) {
    var P = shuffle(D.P).slice(0, 6), i = 0, score = 0;
    var qs = P.map(function (p) {
      var truth = Math.random() < 0.5 || D.P.length < 2, other = p;
      if (!truth) { var o = shuffle(D.P.filter(function (x) { return x !== p; })); other = o[0]; }
      return { p: p, truth: truth, d: other.d };
    });
    var wrap = el('div', 'ks-tf');
    stage.appendChild(wrap);
    function show() {
      if (i >= qs.length) {
        wrap.innerHTML = '';
        didMode(host, 'tf');
        done(wrap, score + ' / ' + qs.length + ' right', '答对 ' + score + ' / ' + qs.length, function () { stage.innerHTML = ''; ACT.tf(stage, D, host); refit(host); });
        refit(host); return;
      }
      var q = qs[i];
      wrap.innerHTML = '<div class="ks-dots">' + qs.map(function (_, k) { return '<i class="' + (k < i ? 'past' : k === i ? 'now' : '') + '"></i>'; }).join('') + '</div>' +
        '<div class="ks-tf-card"><b>' + esc(L(q.p.t)) + '</b><p>' + esc(short(L(q.d), 200)) + '</p></div>' +
        '<div class="ks-tf-btns"><button type="button" class="ks-btn" data-a="1">✓ ' + esc(T('True', '对')) + '</button><button type="button" class="ks-btn" data-a="0">✗ ' + esc(T('False', '错')) + '</button></div>';
    }
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('.ks-tf-btns button'); if (!b || wrap.classList.contains('busy')) return;
      var q = qs[i], right = (b.getAttribute('data-a') === '1') === q.truth;
      if (right) score++;
      var card = wrap.querySelector('.ks-tf-card');
      card.classList.add(right ? 'ok' : 'no', b.getAttribute('data-a') === '1' ? 'go-r' : 'go-l');
      if (!q.truth) card.insertAdjacentHTML('beforeend', '<p class="ks-fix">' + esc(T('It actually means: ', '其实是：') + short(L(q.p.d), 160)) + '</p>');
      wrap.classList.add('busy');
      setTimeout(function () { wrap.classList.remove('busy'); i++; show(); refit(host); }, q.truth ? 900 : 2300);
    });
    show();
  };
  ACT.cover = function (stage, D, host, only) {
    var P = (only || D.P).slice(0, 8), rated = 0, knew = 0, misses = [];
    var ul = el('ul', 'ks-cover');
    ul.innerHTML = P.map(function (p, i) {
      return '<li><b>' + esc(L(p.t)) + '</b><button type="button" class="ks-veil" data-i="' + i + '"><span>' + esc(short(L(p.d), 200)) + '</span><em>' + esc(T('Say it, then tap to check', '先说出来，再点开核对')) + '</em></button>' +
        '<span class="ks-rate" hidden><button type="button" class="ks-btn" data-k="1">✓ ' + esc(T('Knew it', '记得')) + '</button><button type="button" class="ks-btn" data-k="0">✗ ' + esc(T('Not yet', '还没')) + '</button></span></li>';
    }).join('');
    stage.appendChild(ul);
    ul.addEventListener('click', function (e) {
      var v = e.target.closest('.ks-veil');
      if (v && !v.classList.contains('open')) { v.classList.add('open'); v.parentElement.querySelector('.ks-rate').hidden = false; refit(host); return; }
      var r = e.target.closest('.ks-rate button'); if (!r) return;
      var li = r.closest('li'), i = +li.querySelector('.ks-veil').getAttribute('data-i');
      var k = r.getAttribute('data-k') === '1';
      li.classList.add(k ? 'knew' : 'miss'); li.querySelector('.ks-rate').hidden = true;
      rated++; if (k) knew++; else misses.push(P[i]);
      if (rated === P.length) {
        didMode(host, 'cover');
        done(stage, 'You knew ' + knew + ' of ' + P.length, '记得 ' + knew + ' / ' + P.length, misses.length ? function () { stage.innerHTML = ''; ACT.cover(stage, D, host, misses); refit(host); } : null);
      }
      refit(host);
    });
  };
  ACT.order = function (stage, D, host, ci) {
    ci = ci || 0;
    var ch = D.chains[ci % D.chains.length], steps = ch.steps, at = 0, slips = 0;
    var box = el('div', 'ks-order');
    box.innerHTML = '<p class="ks-hint">' + esc(T('Tap the steps in the right order.', '按正确顺序点击每一步。')) + '</p><ol class="ks-line"></ol><div class="ks-pool">' +
      shuffle(steps.map(function (s, i) { return '<button type="button" class="ks-chip" data-i="' + i + '">' + esc(L(s)) + '</button>'; })).join('') + '</div>';
    stage.appendChild(box);
    var line = box.querySelector('.ks-line');
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.ks-pool .ks-chip'); if (!b) return;
      if (+b.getAttribute('data-i') !== at) { slips++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); return; }
      at++;
      var li = el('li', 'ks-step'); li.textContent = b.textContent; li.style.setProperty('--i', at);
      line.appendChild(li); b.remove();
      if (at === steps.length) {
        box.classList.add('solved');
        didMode(host, 'order');
        done(stage, slips ? 'In order, ' + slips + ' slip' + (slips > 1 ? 's' : '') : 'Perfect order!', slips ? '顺序正确，失误 ' + slips + ' 次' : '完美顺序！', function () { stage.innerHTML = ''; ACT.order(stage, D, host, ci + 1); refit(host); });
      }
      refit(host);
    });
  };
  ACT.gap = function (stage, D, host) {
    var G = shuffle(D.G).slice(0, 5), pool = D.G.map(function (g) { return g.w; }), i = 0, score = 0;
    var box = el('div', 'ks-gap'); stage.appendChild(box);
    function blankIn(txt, w) { var k = txt.indexOf(w); return k < 0 ? esc(txt) : esc(txt.slice(0, k)) + '<span class="ks-blank">?</span>' + esc(txt.slice(k + w.length)); }
    function show() {
      if (i >= G.length) { box.innerHTML = ''; didMode(host, 'gap'); done(box, score + ' / ' + G.length + ' gaps filled', '填对 ' + score + ' / ' + G.length, function () { stage.innerHTML = ''; ACT.gap(stage, D, host); refit(host); }); refit(host); return; }
      var g = G[i], opts = shuffle([g.w].concat(shuffle(pool.filter(function (w) { return w.toLowerCase() !== g.w.toLowerCase(); })).slice(0, 3)));
      var z = zh() && g.zh;
      box.innerHTML = '<div class="ks-dots">' + G.map(function (_, k) { return '<i class="' + (k < i ? 'past' : k === i ? 'now' : '') + '"></i>'; }).join('') + '</div>' +
        '<p class="ks-numq">' + blankIn(z ? g.zh : g.en, g.w) + '</p><div class="ks-pool">' +
        opts.map(function (o) { return '<button type="button" class="ks-chip" data-w="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>';
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.ks-chip'); if (!b || box.classList.contains('busy')) return;
      var g = G[i], ok = b.getAttribute('data-w') === g.w, bl = box.querySelector('.ks-blank');
      if (ok) score++;
      bl.textContent = g.w; bl.classList.add(ok ? 'ok' : 'no');
      b.classList.add(ok ? 'ok' : 'no');
      box.classList.add('busy');
      setTimeout(function () { box.classList.remove('busy'); i++; show(); refit(host); }, ok ? 800 : 1600);
    });
    show();
  };
  ACT.num = function (stage, D, host) {
    var N = shuffle(D.N).slice(0, 4), i = 0, close = 0;
    var box = el('div', 'ks-num'); stage.appendChild(box);
    function show() {
      if (i >= N.length) { box.innerHTML = ''; didMode(host, 'num'); done(box, close + ' of ' + N.length + ' within range', close + ' / ' + N.length + ' 猜得接近', function () { stage.innerHTML = ''; ACT.num(stage, D, host); refit(host); }); refit(host); return; }
      var q = N[i], max = q.v <= 1 ? 2 : Math.ceil(q.v * 2.6 / (q.v >= 100 ? 10 : 1)) * (q.v >= 100 ? 10 : 1);
      var step = q.dec ? (q.v < 5 ? 0.1 : 0.5) : (max > 400 ? 5 : 1);
      var start = Math.round((max * (0.25 + Math.random() * 0.5)) / step) * step;
      box.innerHTML = '<p class="ks-numq">' + esc(zh() && q.zh ? q.zh : q.en).replace('▢', '<span class="ks-blank">?</span>') + '</p>' +
        '<div class="ks-slide"><input type="range" min="0" max="' + max + '" step="' + step + '" value="' + start + '" aria-label="' + esc(T('Your guess', '你的猜测')) + '"><output>' + start + ' ' + esc(q.unit) + '</output></div>' +
        '<div class="ks-gauge"><i class="g"></i><i class="t"></i></div>' +
        '<button type="button" class="ks-btn primary">' + esc(T('Lock it in', '确定')) + '</button>';
      var r = box.querySelector('input'), o = box.querySelector('output');
      r.addEventListener('input', function () { o.textContent = r.value + ' ' + q.unit; });
      box.querySelector('.ks-btn').addEventListener('click', function () {
        var g = parseFloat(r.value), ok = Math.abs(g - q.v) <= Math.max(q.v * 0.15, step);
        if (ok) close++;
        r.disabled = true;
        var ga = box.querySelector('.ks-gauge'); ga.classList.add('show');
        ga.querySelector('.g').style.left = (g / max * 100) + '%';
        ga.querySelector('.t').style.left = (q.v / max * 100) + '%';
        box.querySelector('.ks-blank').textContent = q.v + '';
        box.querySelector('.ks-blank').classList.add(ok ? 'ok' : 'no');
        var b = this; b.textContent = (ok ? T('Close enough! ', '很接近！') : T('Answer: ' + q.v + ' ' + q.unit + ' · ', '答案：' + q.v + ' ' + q.unit + ' · ')) + T('Next →', '下一题 →');
        b.onclick = function (ev) { ev.stopImmediatePropagation(); i++; show(); refit(host); };
        refit(host);
      }, { once: true });
    }
    show();
  };
  ACT.sort = function (stage, D, host) {
    var C = D.C.slice(0, 6), i = 0, score = 0, head = C[0].head;
    var box = el('div', 'ks-sort'); stage.appendChild(box);
    var cols = [];
    for (var k = 1; k < head.length; k++) cols.push(k);
    function show() {
      if (i >= C.length) { didMode(host, 'sort'); done(box, score + ' / ' + C.length + ' sorted right', '归类正确 ' + score + ' / ' + C.length, function () { stage.innerHTML = ''; ACT.sort(stage, D, host); refit(host); }); refit(host); return; }
      var c = C[i];
      var old = box.querySelector('.ks-sort-q'); if (old) old.remove();
      var q = el('div', 'ks-sort-q');
      q.innerHTML = '<span class="ks-sort-row">' + esc(short(L(c.row), 50)) + '</span><b>' + esc(L(c.v)) + '</b>';
      box.insertBefore(q, box.firstChild);
    }
    box.innerHTML = '<div class="ks-bins">' + cols.map(function (k) { return '<button type="button" class="ks-bin" data-c="' + k + '"><span>' + esc(L(head[k])) + '</span><em>0</em></button>'; }).join('') + '</div>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.ks-bin'); if (!b || i >= C.length) return;
      var ok = +b.getAttribute('data-c') === C[i].col;
      if (ok) { score++; var em = b.querySelector('em'); em.textContent = +em.textContent + 1; }
      b.classList.remove('ok', 'no'); void b.offsetWidth; b.classList.add(ok ? 'ok' : 'no');
      if (!ok) { var right = box.querySelector('.ks-bin[data-c="' + C[i].col + '"]'); if (right) { right.classList.remove('hint'); void right.offsetWidth; right.classList.add('hint'); } }
      var q = box.querySelector('.ks-sort-q'); if (q) q.classList.add('fly');
      i++; setTimeout(function () { show(); refit(host); }, ok ? 420 : 1000);
    });
    show();
  };
  ACT.teach = function (stage, D, host) {
    var t = titleOf(host);
    var keys = D.P.slice(0, 8).map(function (p) { return L(p.t); });
    if (keys.length < 3) {                               /* no key terms: use the section's longest distinctive words */
      var freq = {}; (bodyText(host).match(/[A-Za-z][A-Za-z-]{6,}/g) || []).forEach(function (w) { w = w.toLowerCase(); freq[w] = (freq[w] || 0) + 1; });
      keys = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 6);
    }
    var box = el('div', 'ks-teach');
    box.innerHTML = '<p class="ks-hint">' + esc(T('Explain "' + short(L(t), 60) + '" in two or three sentences, as if to a teammate.', '用两三句话把「' + short(L(t), 30) + '」讲给队友听。')) + '</p>' +
      '<textarea rows="4" placeholder="' + esc(T('In my own words…', '用我自己的话……')) + '"></textarea>' +
      '<div class="ks-keys">' + keys.map(function (k) { return '<span class="ks-key">' + esc(short(k, 36)) + '</span>'; }).join('') + '</div>' +
      '<div class="ks-teach-act"><button type="button" class="ks-btn primary">✨ ' + esc(T('Check my explanation', '帮我检查')) + '</button><span class="ks-cov"></span></div><div class="ks-fb"></div>';
    stage.appendChild(box);
    var ta = box.querySelector('textarea'), chips = $$('.ks-key', box), cov = box.querySelector('.ks-cov'), fb = box.querySelector('.ks-fb');
    function norm(s) { return s.toLowerCase().replace(/[^a-z0-9一-鿿 ]+/g, ' '); }
    function coverage() {
      var v = norm(ta.value), n = 0;
      chips.forEach(function (c, i) {
        var k = norm(keys[i]).trim(), words = k.split(/\s+/).filter(function (w) { return w.length > 3; });
        var hit = k && (v.indexOf(k) >= 0 || (words.length && words.filter(function (w) { return v.indexOf(w) >= 0; }).length >= Math.ceil(words.length / 2)));
        c.classList.toggle('hit', !!hit); if (hit) n++;
      });
      cov.textContent = T(n + ' of ' + keys.length + ' key ideas used', '用到了 ' + n + ' / ' + keys.length + ' 个关键概念');
      return n / (keys.length || 1);
    }
    ta.addEventListener('input', coverage);
    coverage();
    box.querySelector('.ks-btn').addEventListener('click', function () {
      var text = ta.value.trim();
      if (text.length < 20) { fb.innerHTML = '<p class="ks-warn">' + esc(T('Write a little more first: two or three sentences.', '先多写一点：两三句话。')) + '</p>'; refit(host); return; }
      var c = coverage(), btn = this;
      var facts = D.P.slice(0, 8).map(function (p) { return '- ' + p.t.en + ': ' + short(p.d.en, 160); }).join('\n') || short(bodyText(host), 1100);
      var q = 'You are a friendly sports-medicine tutor. A student is studying the lesson "' + t.en + '". Key facts from the lesson:\n' + facts +
        '\n\nThe student explained it like this:\n"' + text.slice(0, 900) + '"\n\nReply in 3 short bullet points: what they got right, what is missing or wrong, and one tip to remember it.' + (zh() ? ' Answer in Chinese.' : '');
      btn.disabled = true; fb.innerHTML = '<p class="ks-think"><i></i><i></i><i></i> ' + esc(T('Reading your explanation…', '正在阅读你的解释……')) + '</p>'; refit(host);
      fetch(AI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, lang: zh() ? 'zh' : 'en', mode: 'clinical' }) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!(d && d.reply && !d.rejected)) throw new Error('no reply');
          fb.innerHTML = '<div class="ks-ai"><span class="ks-ai-tag">✨ ' + esc(T('Tutor feedback', '导师反馈')) + '</span>' +
            esc(d.reply).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>') + '</div>';
          didMode(host, 'teach');
        })
        .catch(function () {
          var miss = keys.filter(function (k, i) { return !chips[i].classList.contains('hit'); });
          fb.innerHTML = '<div class="ks-ai"><span class="ks-ai-tag">' + esc(T('Self-check (tutor offline)', '自查（导师离线）')) + '</span>' +
            esc(T('You used ' + Math.round(c * 100) + '% of the key ideas.', '你用到了 ' + Math.round(c * 100) + '% 的关键概念。')) +
            (miss.length ? '<br>' + esc(T('Try to work in: ', '试着加入：')) + miss.map(function (m) { return '<b>' + esc(short(m, 40)) + '</b>'; }).join(', ') : '') + '</div>';
          if (c >= 0.6) didMode(host, 'teach');
        })
        .then(function () { btn.disabled = false; refit(host); });
    });
  };

  function trayLabels(tray) {
    var lab = tray.querySelector('.ks-lab-t'); if (lab) lab.textContent = T('Practise this part', '练一练这一节');
    $$('.ks-tab', tray).forEach(function (b) {
      var m = MODES.filter(function (x) { return x[0] === b.getAttribute('data-m'); })[0];
      b.querySelector('.ks-tab-t').textContent = T(m[2], m[3]);
    });
  }
  function tray(host) {
    if (host.getAttribute('data-ks')) return;
    if (host.classList.contains('acc-body-inner') && host.querySelector('section.native-section')) return;   /* IB: one tray per lesson section instead */
    var D = extract(host), text = bodyText(host), av = available(D, text.length);
    if (av.length < 2 && !(av.length === 1 && av[0] !== 'teach')) { if (text.length >= 400) host.setAttribute('data-ks', '0'); return; }   /* still filling in? look again later */
    host.setAttribute('data-ks', '1');
    var did = load('kn_prac', {})[pracKey(host)] || [];
    var t = el('div', 'ks');
    t.innerHTML = '<div class="ks-bar"><span class="ks-lab"><span class="ks-lab-i" aria-hidden="true">🎯</span><span class="ks-lab-t"></span><span class="ks-count"></span></span><div class="ks-tabs" role="tablist">' +
      MODES.filter(function (m) { return av.indexOf(m[0]) >= 0; }).map(function (m) {
        return '<button type="button" class="ks-tab' + (did.indexOf(m[0]) >= 0 ? ' did' : '') + '" role="tab" aria-selected="false" data-m="' + m[0] + '"><span aria-hidden="true">' + m[1] + '</span> <span class="ks-tab-t"></span></button>';
      }).join('') + '</div></div><div class="ks-stage" hidden></div>';
    host.appendChild(t);
    trayLabels(t); trayCount(host);
    var stage = t.querySelector('.ks-stage'), cur = '';
    t.querySelector('.ks-tabs').addEventListener('click', function (e) {
      var b = e.target.closest('.ks-tab'); if (!b) return;
      var m = b.getAttribute('data-m');
      $$('.ks-tab', t).forEach(function (x) { x.setAttribute('aria-selected', x === b && cur !== m ? 'true' : 'false'); x.classList.toggle('on', x === b && cur !== m); });
      stage.innerHTML = '';
      if (cur === m) { cur = ''; stage.hidden = true; refit(host); return; }
      cur = m; stage.hidden = false;
      stage.classList.remove('ks-in'); void stage.offsetWidth; stage.classList.add('ks-in');
      if (!D.P.length && !D.C.length) D = extract(host);   /* content can arrive late */
      try { ACT[m](stage, D, host); } catch (err) { stage.textContent = ''; if (window.console) console.warn('[knowledge-fx] practice', err); }
      refit(host);
    });
    t.rebuild = function () { trayLabels(t); if (cur) { var m = cur; cur = ''; var b = t.querySelector('.ks-tab[data-m="' + m + '"]'); if (b) b.click(); } };
  }
  /* Trays are built as their section comes within ~900px of the screen (or
     opens), not all at once on load: building all 87 on guide.html up front
     was a chunk of the main-thread work that made arriving on a page stutter.
     A section that was still empty when it came near is watched again the next
     time content lands (watchPractice calls this again). */
  var ksIO = window.IntersectionObserver ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target;
      ksIO.unobserve(t);
      safe(function () { tray(t); });
      if (!t.hasAttribute('data-ks')) t._ksObs = 0;
    });
  }, { rootMargin: '900px 0px' }) : null;
  function practice(scope) {
    $$('.acc-body-inner, section.native-section', scope || document).forEach(function (t) {
      if (t.hasAttribute('data-ks')) return;
      if (!ksIO) { safe(function () { tray(t); }); return; }
      if (t._ksObs) return;
      t._ksObs = 1;
      ksIO.observe(t);
    });
  }
  function watchPractice() {
    var pend = 0;
    new MutationObserver(function (recs) {
      if (pend) return;
      for (var i = 0; i < recs.length; i++) {
        var a = recs[i].addedNodes;
        for (var j = 0; j < a.length; j++) {
          var n = a[j];
          if (n.nodeType === 1 && !(n.closest && n.closest('.ks')) && (n.matches('section.native-section,.native-lesson,.acc-item,.acc-body-inner') || n.querySelector('section.native-section,.acc-body-inner'))) {
            pend = setTimeout(function () { pend = 0; safe(function () { condense(document); }); practice(document); }, 120);
            return;
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ═══ 8 · Language changes: rebuild what we drew ═══════════════════════ */
  function watchLang() {
    var last = zh();
    new MutationObserver(function () {
      var now = zh();
      if (now === last) return;
      last = now;
      $$('.kn-learn').forEach(function (p) { panelTexts(p); paint(p); });
      $$('.kn-more').forEach(moreLabel);
      $$('.ks').forEach(function (t) { if (t.rebuild) safe(t.rebuild); });
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ═══ Boot ═════════════════════════════════════════════════════════════ */
  function boot() {
    document.documentElement.classList.add('kn-on');
    safe(function () {                     /* study days, for the home page's week strip */
      var d = new Date(), k = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
      var days = load('kn_days', []);
      if (days[days.length - 1] !== k) { days.push(k); save('kn_days', days.slice(-60)); }
    });
    safe(function () { condense(document); });
    safe(function () { practice(document); });
    safe(watchPractice);
    document.addEventListener('sitecontent:applied', function () { safe(function () { condense(document); }); safe(function () { practice(document); }); safe(onChapter); });
    if (GUIDE) {
      safe(trackReading);
      safe(onChapter);
      $$('section.chapter[id^="ch"]').forEach(function (s) {
        new MutationObserver(function () { if (s.classList.contains('shown')) safe(onChapter); }).observe(s, { attributes: true, attributeFilter: ['class'] });
      });
    }
    if (FILE === 'toc.html') safe(hub);
    safe(watchLang);
  }
  window.VitaliteKnowledge = { condense: condense, practice: practice, mode: mode, setMode: applyMode };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* vitaxamine.js — the Vitaxamine page (infirmary.html), made visual.
   Mounts into #vx-app. Nothing about the AI changes: it still POSTs
   {question, lang, mode:'clinical'} to api.vitaliteplan.com and gets back
   {reply, model, rag, ragTop} (or {rejected:true} from the off-topic gate).
   What's new is that you can SEE the request:
     · as you type, the question is read into chips (where, what, how long,
       doing what) and any red flags are called out before you send;
     · each ask shows its pipeline live — safety gate → knowledge search →
       model → answer — with the knowledge-base sections that were matched,
       the model that answered and how long it took;
     · "prompt anatomy" draws what the model is actually given: the clinical
       rules, the matched knowledge sections and your question, sized by
       (estimated) tokens;
     · the answer is laid out as blocks, red-flag lines are highlighted, and
       every knowledge section used is cited (vt-sources.js);
     · a body map lights up the region you're asking about (tap a region to
       add it to your question), an inspector shows the raw request/response,
       and the full knowledge base (45 sections) can be browsed, with sources.
   Bilingual; follows body.lang-zh / body.dark. */
(function () {
  'use strict';
  var API = 'https://api.vitaliteplan.com';
  var mount = document.getElementById('vx-app');
  if (!mount) return;
  var body = document.body;
  function zh() { return body.classList.contains('lang-zh') || (function () { try { return localStorage.getItem('sm_lang') === 'zh'; } catch (e) { return false; } })(); }
  function T(en, z) { return zh() ? z : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tokens(s) { if (!s) return 0; var c = (String(s).match(/[　-鿿＀-￯]/g) || []).length; return Math.round(c + (s.length - c) / 4); }
  var SYSTEM_TOK = 450;                        /* the worker's clinical rules, ~1.7k characters */

  /* ─── reading a question ──────────────────────────────────────────── */
  var REGIONS = [
    ['head', 'Head', '头部', /\bhead|concuss|headache|skull|头|脑震荡|头痛/i],
    ['neck', 'Neck', '颈部', /\bneck|whiplash|cervical|脖|颈|落枕/i],
    ['shoulder', 'Shoulder', '肩部', /shoulder|rotator|deltoid|collarbone|clavicle|肩/i],
    ['chest', 'Chest', '胸部', /\bchest|\brib|sternum|胸|肋/i],
    ['back', 'Back', '背/腰', /\bback\b|spine|lumbar|sciatica|腰|背|脊/i],
    ['elbow', 'Elbow', '肘部', /elbow|epicondyl|肘/i],
    ['wrist', 'Wrist & hand', '手腕/手', /wrist|\bhand|finger|thumb|腕|手指|手/i],
    ['hip', 'Hip & groin', '髋/腹股沟', /\bhip|groin|adductor|hip flexor|髋|腹股沟/i],
    ['thigh', 'Thigh', '大腿', /thigh|hamstring|quad|大腿|腘绳|股四头/i],
    ['knee', 'Knee', '膝部', /knee|\bacl\b|mcl|menisc|patell|膝/i],
    ['shin', 'Shin & calf', '小腿', /\bshin|calf|tibia|小腿|胫/i],
    ['ankle', 'Ankle', '踝部', /ankle|achilles|踝|跟腱/i],
    ['foot', 'Foot', '足部', /\bfoot|feet|heel|plantar|toe|脚|足|脚跟|足底/i]
  ];
  var SYMPTOMS = [
    ['Pain', '疼痛', /pain|hurt|sore|ache|疼|痛/i], ['Swelling', '肿胀', /swell|swollen|puff|肿/i], ['Stiffness', '僵硬', /stiff|tight|僵|紧/i],
    ['Numbness', '麻木', /numb|tingl|pins and needles|麻/i], ['Bruising', '淤青', /bruis|淤|青紫/i], ['Weakness', '无力', /weak|give way|giving way|无力|打软/i],
    ['Clicking', '弹响', /click|pop|snap|弹响|咔/i], ['Cramp', '抽筋', /cramp|spasm|抽筋|痉挛/i], ['Bleeding', '出血', /bleed|blood|出血|流血/i], ['Burn', '烫伤', /burn|scald|烧伤|烫/i]
  ];
  var ACTIVITIES = [
    ['Running', '跑步', /\brun|jog|marathon|跑/i], ['Basketball', '篮球', /basketball|篮球/i], ['Football', '足球', /football|soccer|足球/i],
    ['Lifting', '力量训练', /lift|squat|deadlift|bench|gym|weights|举重|健身|深蹲|硬拉/i], ['Swimming', '游泳', /swim|游泳/i], ['Tennis', '网球', /tennis|badminton|网球|羽毛球/i],
    ['Cycling', '骑行', /cycl|bike|骑/i], ['Sleeping', '睡觉', /sleep|slept|睡/i], ['Desk work', '久坐', /desk|sitting|computer|久坐|电脑/i]
  ];
  var FLAGS = [
    ['Numbness or tingling', '麻木或刺痛', /numb|tingl|麻木/i], ["Can't bear weight", '无法负重', /can'?t (walk|stand|bear|put weight)|cannot (walk|stand|bear)|不能走|无法走|不能站|不能着地/i],
    ['Chest pain', '胸痛', /chest pain|胸痛|胸口痛/i], ['Head injury', '头部受伤', /hit (my )?head|head injury|concuss|knocked out|lost consciousness|撞到头|脑震荡|昏迷/i],
    ['Deformity', '畸形', /deform|out of place|bent wrong|畸形|变形|脱位/i], ['Heavy bleeding', '大量出血', /heavy bleed|won'?t stop bleeding|大量出血|血流不止/i],
    ['Fever', '发烧', /fever|发烧|发热/i], ['Breathing trouble', '呼吸困难', /can'?t breathe|short(ness)? of breath|breathing|呼吸困难|喘不上/i]
  ];
  function read(q) {
    var o = { regions: [], symptoms: [], activity: [], when: '', flags: [] };
    REGIONS.forEach(function (r) { if (r[3].test(q)) o.regions.push(r); });
    SYMPTOMS.forEach(function (s) { if (s[2].test(q)) o.symptoms.push(s); });
    ACTIVITIES.forEach(function (a) { if (a[2].test(q)) o.activity.push(a); });
    FLAGS.forEach(function (f) { if (f[2].test(q)) o.flags.push(f); });
    var w = /(\d+\s*(?:hours?|days?|weeks?|months?|years?|hrs?|wks?)|yesterday|today|last night|this morning|[\d一二三四五六七八九十两几半]+\s*(?:天|周|星期|个月|月|年|小时)|昨天|今天|昨晚|今早)/i.exec(q);
    if (w) o.when = w[1];
    return o;
  }

  /* ─── knowledge base topics (kb/kb-topics.json, small) ───────────── */
  var KB = null, KBI = {};
  function loadKb() {
    if (KB) return Promise.resolve(KB);
    return fetch('kb/kb-topics.json').then(function (r) { return r.json(); }).then(function (d) { KB = d; d.forEach(function (c) { KBI[c.id] = c; }); return d; }).catch(function () { KB = []; return KB; });
  }
  var TAGS = { 'first-aid': ['First aid', '急救'], 'red-flag': ['Red flag', '危险信号'], 'injury': ['Injury', '损伤'], 'rehab': ['Rehab', '康复'], 'basics': ['Basics', '基础'] };
  function cites(id) {
    var K = window.VT_KB_REFS, C = window.VT_CITE;
    return (K && K[id] && C) ? K[id].map(function (r) { return '<span class="vx-cite" tabindex="0" data-ref="' + r + '">' + esc(C.short(r)) + '</span>'; }).join('') : '';
  }

  /* ─── body map ─────────────────────────────────────────────────────── */
  var BODY = '<svg class="vx-body" viewBox="0 0 200 420" aria-hidden="true">' +
    '<g class="vx-sil">' +
    '<circle cx="100" cy="38" r="24"/><rect x="88" y="60" width="24" height="18" rx="6"/>' +
    '<path d="M62 80 Q100 70 138 80 L146 150 Q140 190 130 206 L70 206 Q60 190 54 150 Z"/>' +
    '<path d="M62 82 Q44 88 40 110 L32 176 L24 222 L36 226 L48 180 L58 128 Z"/><path d="M138 82 Q156 88 160 110 L168 176 L176 222 L164 226 L152 180 L142 128 Z"/>' +
    '<path d="M70 204 L130 204 L134 236 L104 240 L100 250 L96 240 L66 236 Z"/>' +
    '<path d="M68 234 L98 240 L94 300 L90 380 L90 404 L70 408 L72 380 L68 300 Z"/><path d="M132 234 L102 240 L106 300 L110 380 L110 404 L130 408 L128 380 L132 300 Z"/>' +
    '</g>' +
    '<g class="vx-zones">' +
    '<ellipse data-r="head" cx="100" cy="36" rx="22" ry="24"/><rect data-r="neck" x="86" y="58" width="28" height="18" rx="6"/>' +
    '<ellipse data-r="shoulder" cx="58" cy="90" rx="16" ry="13"/><ellipse data-r="shoulder" cx="142" cy="90" rx="16" ry="13"/>' +
    '<ellipse data-r="chest" cx="100" cy="112" rx="34" ry="24"/><ellipse data-r="back" cx="100" cy="172" rx="30" ry="24"/>' +
    '<ellipse data-r="elbow" cx="40" cy="150" rx="11" ry="12"/><ellipse data-r="elbow" cx="160" cy="150" rx="11" ry="12"/>' +
    '<ellipse data-r="wrist" cx="29" cy="214" rx="12" ry="14"/><ellipse data-r="wrist" cx="171" cy="214" rx="12" ry="14"/>' +
    '<ellipse data-r="hip" cx="100" cy="222" rx="36" ry="16"/>' +
    '<ellipse data-r="thigh" cx="82" cy="266" rx="14" ry="26"/><ellipse data-r="thigh" cx="118" cy="266" rx="14" ry="26"/>' +
    '<ellipse data-r="knee" cx="84" cy="308" rx="12" ry="12"/><ellipse data-r="knee" cx="116" cy="308" rx="12" ry="12"/>' +
    '<ellipse data-r="shin" cx="82" cy="348" rx="10" ry="22"/><ellipse data-r="shin" cx="118" cy="348" rx="10" ry="22"/>' +
    '<ellipse data-r="ankle" cx="80" cy="386" rx="10" ry="9"/><ellipse data-r="ankle" cx="120" cy="386" rx="10" ry="9"/>' +
    '<ellipse data-r="foot" cx="78" cy="404" rx="14" ry="7"/><ellipse data-r="foot" cx="122" cy="404" rx="14" ry="7"/>' +
    '</g></svg>';

  /* ─── layout ───────────────────────────────────────────────────────── */
  var SUGG = [
    ['I slept wrong and my neck is stiff', '我落枕了，脖子僵硬'], ['I rolled my ankle playing basketball', '打篮球扭伤了脚踝'],
    ['My knee hurts when I run downhill', '跑下坡时膝盖疼'], ['Sore muscles two days after squats', '深蹲后两天肌肉酸痛'],
    ['Heel pain first thing in the morning', '早上起床脚跟疼'], ['Should I use ice or heat?', '该冰敷还是热敷？']
  ];
  mount.innerHTML =
    '<div class="vx-grid">' +
      '<div class="vx-main">' +
        '<div class="vx-compose">' +
          '<div class="vx-compose-top"><span class="vx-dot"></span><b class="vx-t-ask"></b><span class="vx-model-pill">glm-4.5-air · RAG</span></div>' +
          '<textarea id="vxInput" rows="3" maxlength="1200"></textarea>' +
          '<div class="vx-read" id="vxRead"></div>' +
          '<div class="vx-compose-row"><div class="vx-sugg" id="vxSugg"></div><button class="vx-send" id="vxSend" type="button"><span class="vx-t-send"></span><i>↵</i></button></div>' +
        '</div>' +
        '<div class="vx-thread" id="vxThread"></div>' +
        '<div class="vx-empty" id="vxEmpty"></div>' +
      '</div>' +
      '<aside class="vx-side">' +
        '<div class="vx-card vx-map"><div class="vx-card-h vx-t-map"></div>' + BODY + '<div class="vx-map-l" id="vxMapL"></div></div>' +
        '<div class="vx-card vx-stats"><div class="vx-card-h vx-t-stats"></div><div class="vx-stat-row" id="vxStats"></div></div>' +
        '<details class="vx-card vx-insp" id="vxInsp"><summary class="vx-card-h vx-t-insp"></summary><pre id="vxRaw"></pre></details>' +
        '<details class="vx-card vx-kb" id="vxKb"><summary class="vx-card-h vx-t-kb"></summary><div class="vx-kb-filter" id="vxKbF"></div><div class="vx-kb-list" id="vxKbL"></div></details>' +
      '</aside>' +
    '</div>' +
    '<div class="vx-refpop" id="vxRefPop" role="tooltip"></div>';

  var input = document.getElementById('vxInput'), readEl = document.getElementById('vxRead'), thread = document.getElementById('vxThread');
  var stats = { n: 0, ms: [], srcs: {} };
  function labels() {
    mount.querySelector('.vx-t-ask').textContent = T('Ask Vitaxamine', '问 Vitaxamine');
    input.placeholder = T('Describe what hurts, where, since when, and what you were doing…', '描述哪里不舒服、从什么时候开始、当时在做什么…');
    mount.querySelector('.vx-t-send').textContent = T('Ask', '提问');
    mount.querySelector('.vx-t-map').textContent = T('Where it is', '部位');
    mount.querySelector('.vx-t-stats').textContent = T('This session', '本次会话');
    mount.querySelector('.vx-t-insp').textContent = T('Request inspector', '请求检视器');
    mount.querySelector('.vx-t-kb').textContent = T('Knowledge base · 45 sections, with sources', '知识库 · 45 节，含来源');
    document.getElementById('vxEmpty').innerHTML = thread.children.length ? '' : '<div class="vx-empty-in"><b>' + T('How it works', '工作原理') + '</b>' +
      '<ol><li>' + T('Your question is checked: clinical topics only, red flags first.', '检查你的问题：只回答临床话题，危险信号优先。') + '</li><li>' + T('The 3 most relevant knowledge-base sections are found by meaning, not keywords.', '按语义（而非关键词）找出最相关的 3 节知识库内容。') + '</li><li>' +
      T('The model answers with those sections in front of it, and you see which ones it used, with their sources.', '模型参照这些内容作答，你能看到用了哪些内容及其来源。') + '</li></ol></div>';
    document.getElementById('vxSugg').innerHTML = SUGG.map(function (s) { return '<button type="button" class="vx-chip-s">' + esc(zh() ? s[1] : s[0]) + '</button>'; }).join('');
    renderRead(); renderStats(); renderKb();
  }

  /* ─── live reading of the question ─────────────────────────────────── */
  function chipsHtml(o) {
    var h = '';
    o.regions.forEach(function (r) { h += '<span class="vx-chip c-where"><em>' + T('where', '部位') + '</em>' + esc(zh() ? r[2] : r[1]) + '</span>'; });
    o.symptoms.forEach(function (s) { h += '<span class="vx-chip c-what"><em>' + T('what', '症状') + '</em>' + esc(zh() ? s[1] : s[0]) + '</span>'; });
    if (o.when) h += '<span class="vx-chip c-when"><em>' + T('since', '时间') + '</em>' + esc(o.when) + '</span>';
    o.activity.forEach(function (a) { h += '<span class="vx-chip c-doing"><em>' + T('doing', '活动') + '</em>' + esc(zh() ? a[1] : a[0]) + '</span>'; });
    o.flags.forEach(function (f) { h += '<span class="vx-chip c-flag">⚠ ' + esc(zh() ? f[1] : f[0]) + '</span>'; });
    return h;
  }
  function renderRead() {
    var q = input.value.trim(), o = read(q);
    var h = chipsHtml(o);
    var missing = [];
    if (q && !o.regions.length) missing.push(T('where it is', '部位'));
    if (q && !o.when) missing.push(T('how long', '多久了'));
    readEl.innerHTML = q ? (h || '') + (missing.length ? '<span class="vx-hint">' + T('Tip: add ', '提示：补充') + missing.join(T(' and ', '和')) + '</span>' : '') +
      '<span class="vx-tok">≈ ' + tokens(q) + ' ' + T('tokens', 'tokens') + '</span>' : '<span class="vx-hint">' + T('As you type, Vitaxamine shows what it understood.', '输入时，这里会显示 Vitaxamine 理解到的内容。') + '</span>';
    highlight(o.regions.map(function (r) { return r[0]; }), 'typing');
  }
  function highlight(ids, why) {
    $$('.vx-zones [data-r]').forEach(function (z) { z.classList.toggle('on', ids.indexOf(z.getAttribute('data-r')) >= 0); z.classList.toggle('ans', why === 'answer' && ids.indexOf(z.getAttribute('data-r')) >= 0); });
    var L = document.getElementById('vxMapL');
    L.textContent = ids.length ? REGIONS.filter(function (r) { return ids.indexOf(r[0]) >= 0; }).map(function (r) { return zh() ? r[2] : r[1]; }).join(' · ') : T('Tap a region to add it', '点击部位即可加入问题');
  }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  input.addEventListener('input', renderRead);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } });
  document.getElementById('vxSend').addEventListener('click', ask);
  document.getElementById('vxSugg').addEventListener('click', function (e) { var b = e.target.closest('.vx-chip-s'); if (!b) return; input.value = b.textContent; renderRead(); ask(); });
  mount.querySelector('.vx-zones').addEventListener('click', function (e) {
    var z = e.target.closest('[data-r]'); if (!z) return;
    var r = REGIONS.filter(function (x) { return x[0] === z.getAttribute('data-r'); })[0];
    if (!r) return;
    var word = zh() ? r[2] : r[1].toLowerCase();
    if (input.value.toLowerCase().indexOf(word) < 0) input.value = (input.value.trim() ? input.value.trim() + (zh() ? '，' : ', ') : (zh() ? '我的' : 'My ')) + word + (input.value.trim() ? '' : (zh() ? '疼' : ' hurts'));
    input.focus(); renderRead();
  });

  /* ─── asking ───────────────────────────────────────────────────────── */
  var busy = false;
  function ask() {
    var q = input.value.trim();
    if (!q || busy) return;
    busy = true;
    var o = read(q), lang = zh() ? 'zh' : 'en';
    var req = { question: q, lang: lang, mode: 'clinical' };
    var card = document.createElement('article');
    card.className = 'vx-ex';
    card.innerHTML =
      '<div class="vx-q"><div class="vx-q-t">' + esc(q) + '</div><div class="vx-q-chips">' + chipsHtml(o) + '</div></div>' +
      '<ol class="vx-pipe">' +
        '<li data-s="gate"><i></i><b>' + T('Safety check', '安全检查') + '</b><span>' + (o.flags.length ? T('Red flags spotted — shown first', '发现危险信号 — 优先提示') : T('Clinical topics only', '仅限临床话题')) + '</span></li>' +
        '<li data-s="kb"><i></i><b>' + T('Knowledge search', '知识检索') + '</b><span>' + T('Finding the closest sections…', '正在查找最相关的内容…') + '</span></li>' +
        '<li data-s="model"><i></i><b>' + T('Model', '模型') + '</b><span>glm-4.5-air</span></li>' +
        '<li data-s="ans"><i></i><b>' + T('Answer', '回答') + '</b><span>—</span></li>' +
      '</ol>' +
      '<div class="vx-anat" hidden></div>' +
      (o.flags.length ? '<div class="vx-flagbox">⚠ ' + T('You mentioned ', '你提到了') + o.flags.map(function (f) { return '<b>' + esc(zh() ? f[1] : f[0]) + '</b>'; }).join(T(', ', '、')) + T('. If this is severe, sudden or getting worse, get medical care now; do not wait for an answer here.', '。如果情况严重、突然出现或在加重，请立即就医，不要等待这里的回答。') + '</div>' : '') +
      '<div class="vx-a"><div class="vx-typing"><i></i><i></i><i></i></div></div>';
    thread.insertBefore(card, thread.firstChild);
    document.getElementById('vxEmpty').innerHTML = '';
    input.value = ''; renderRead();
    highlight(o.regions.map(function (r) { return r[0]; }), 'asking');
    var pipe = card.querySelector('.vx-pipe');
    function step(s, state, text) { var li = pipe.querySelector('[data-s="' + s + '"]'); li.className = state; if (text != null) li.querySelector('span').innerHTML = text; }
    step('gate', 'run');
    setTimeout(function () { step('gate', 'done'); step('kb', 'run'); }, 350);
    var kbT = setTimeout(function () { step('model', 'run'); }, 1300);
    var t0 = performance.now();
    document.getElementById('vxRaw').textContent = 'POST ' + API + '\n' + JSON.stringify(req, null, 2) + '\n\n' + T('…waiting', '…等待中');
    Promise.all([loadKb(), fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) }).then(function (r) {
      return r.json().then(function (d) { return { status: r.status, d: d }; }, function () { return { status: r.status, d: {} }; });
    }, function () { return { status: 0, d: { error: 'network' } }; })]).then(function (res) {
      clearTimeout(kbT);
      var ms = Math.round(performance.now() - t0), d = res[1].d || {}, st = res[1].status;
      document.getElementById('vxRaw').textContent = 'POST ' + API + '\n' + JSON.stringify(req, null, 2) + '\n\n← ' + st + ' · ' + ms + ' ms\n' +
        JSON.stringify({ model: d.model, rag: d.rag, ragTop: d.ragTop, rejected: d.rejected, error: d.error, reply: d.reply ? (d.reply.slice(0, 160) + (d.reply.length > 160 ? '…' : '')) : undefined }, null, 2);
      busy = false;
      if (d.rejected) {
        step('gate', 'stop', T('Not a clinical question: blocked before any model call', '非临床问题：在调用模型前已拦截'));
        step('kb', 'skip', T('skipped', '已跳过')); step('model', 'skip', T('skipped', '已跳过')); step('ans', 'done', ms + ' ms');
        answer(card, d.reply || '', [], o, true);
        return;
      }
      if (!d.reply) {
        step('kb', 'err'); step('model', 'err', esc(d.error || ('HTTP ' + st))); step('ans', 'err', T('No answer', '没有回答'));
        card.querySelector('.vx-a').innerHTML = '<div class="vx-err">' + (st === 0 || d.error === 'network' ? T('Network error: check your connection and try again.', '网络错误：请检查网络后重试。') : T('The AI is unavailable right now. Please try again in a moment.', 'AI 暂时不可用，请稍后再试。')) + '</div>';
        return;
      }
      var top = (d.ragTop || []).filter(function (id) { return KBI[id]; });
      step('kb', 'done', d.rag && top.length ? top.length + T(' sections matched', ' 节内容匹配') : T('No close match: answered from the model alone', '无相近内容：由模型直接回答'));
      step('model', 'done', esc(d.model || 'glm-4.5-air') + ' · ' + (ms / 1000).toFixed(1) + ' s');
      step('ans', 'done', '≈ ' + tokens(d.reply) + ' ' + T('tokens', 'tokens'));
      anatomy(card, q, top);
      answer(card, d.reply, top, o, false);
      stats.n++; stats.ms.push(ms); top.forEach(function (id) { stats.srcs[id] = 1; }); renderStats();
    });
  }
  function anatomy(card, q, top) {
    var el = card.querySelector('.vx-anat');
    var ctx = top.map(function (id) { var c = KBI[id]; return { id: id, t: Math.round(c.ne / 4 + c.nz) }; });
    var total = SYSTEM_TOK + ctx.reduce(function (s, c) { return s + c.t; }, 0) + tokens(q);
    var seg = function (cls, n, label, title) { return '<span class="' + cls + '" style="flex:' + n + '" title="' + esc(title || label) + '">' + (n / total > 0.1 ? esc(label) : '') + '</span>'; };
    el.innerHTML = '<div class="vx-anat-h">' + T('What the model was given', '模型收到的内容') + ' <span>≈ ' + total + ' tokens</span></div>' +
      '<div class="vx-anat-bar">' + seg('a-sys', SYSTEM_TOK, T('Clinical rules', '临床规则'), T('The fixed clinical-only instructions', '固定的临床规则')) +
      ctx.map(function (c, i) { var k = KBI[c.id]; return seg('a-kb a-kb' + i, c.t, (zh() ? k.zh : k.en), (zh() ? k.zh : k.en) + ' · ≈' + c.t + ' tokens'); }).join('') +
      seg('a-q', tokens(q), T('You', '你'), T('Your question', '你的问题')) + '</div>';
    el.hidden = false;
  }
  function answer(card, reply, top, o, rejected) {
    var a = card.querySelector('.vx-a');
    var lines = String(reply).replace(/\r/g, '').split(/\n+/);
    var html = '', list = null;
    function inline(s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>'); }
    var REDI = /see a (doctor|professional|physio)|seek (medical|professional|immediate)|emergency|call 120|call 911|urgent|immediately|red flag|就医|急诊|立即|马上|危险/i;
    var RED = { test: function (t) { return REDI.test(t) || /\bER\b|\bA&E\b/.test(t); } };   /* "ER" only in capitals: /i matched "other" */
    lines.forEach(function (ln) {
      var t = ln.trim(); if (!t) return;
      var h = /^#{1,4}\s+(.*)$/.exec(t) || /^\*\*([^*]{2,60})\*\*:?$/.exec(t) || /^([^：:]{2,24})[：:]$/.exec(t);
      var li = /^(?:[-*•·]|\d+[.)、])\s+(.*)$/.exec(t);
      if (h) { if (list) { html += '</ul>'; list = null; } html += '<h4>' + inline(h[1]) + '</h4>'; return; }
      if (li) { if (!list) { html += '<ul>'; list = 1; } html += '<li' + (RED.test(li[1]) ? ' class="vx-red"' : '') + '>' + inline(li[1]) + '</li>'; return; }
      if (list) { html += '</ul>'; list = null; }
      html += '<p' + (RED.test(t) ? ' class="vx-red"' : '') + '>' + inline(t) + '</p>';
    });
    if (list) html += '</ul>';
    var src = '';
    if (top.length) {
      src = '<div class="vx-src"><div class="vx-src-h">' + T('Knowledge used', '参考的知识') + '</div>' + top.map(function (id, i) {
        var k = KBI[id];
        return '<div class="vx-src-i"><span class="vx-src-n">' + (i + 1) + '</span><div><b>' + esc(zh() ? k.zh : k.en) + '</b><span class="vx-tag t-' + k.tag + '">' + esc((TAGS[k.tag] || [k.tag, k.tag])[zh() ? 1 : 0]) + '</span><div class="vx-src-c">' + cites(id) + '</div></div></div>';
      }).join('') + '</div>';
    }
    a.innerHTML = '<div class="vx-a-body' + (rejected ? ' vx-rej' : '') + '">' + html + '</div>' + src +
      '<div class="vx-a-foot">' + T('Education only, not a diagnosis.', '仅供学习，不构成诊断。') + (o.regions.length ? ' <button type="button" class="vx-plan">' + T('Make a recovery plan →', '制定康复计划 →') + '</button>' : '') + '</div>';
    var plan = a.querySelector('.vx-plan'); if (plan) plan.addEventListener('click', function () { location.href = 'plan.html'; });
    /* regions mentioned in the answer join the map */
    var ansR = REGIONS.filter(function (r) { return r[3].test(reply); }).map(function (r) { return r[0]; });
    var ids = o.regions.map(function (r) { return r[0]; });
    highlight(ids.length ? ids : ansR, 'answer');
  }
  function renderStats() {
    var avg = stats.ms.length ? stats.ms.reduce(function (s, x) { return s + x; }, 0) / stats.ms.length : 0;
    document.getElementById('vxStats').innerHTML =
      '<div><b>' + stats.n + '</b><span>' + T('questions', '个问题') + '</span></div>' +
      '<div><b>' + (avg ? (avg / 1000).toFixed(1) + ' s' : '—') + '</b><span>' + T('avg reply', '平均回复') + '</span></div>' +
      '<div><b>' + Object.keys(stats.srcs).length + '</b><span>' + T('sections used', '用到的知识') + '</span></div>';
  }

  /* ─── knowledge base browser ───────────────────────────────────────── */
  var kbTag = 'all';
  function renderKb() {
    var F = document.getElementById('vxKbF'), L = document.getElementById('vxKbL');
    if (!KB) { L.innerHTML = '<div class="vx-hint">…</div>'; return; }
    F.innerHTML = ['all'].concat(Object.keys(TAGS)).map(function (t) { return '<button type="button" data-t="' + t + '" class="' + (t === kbTag ? 'on' : '') + '">' + (t === 'all' ? T('All', '全部') : TAGS[t][zh() ? 1 : 0]) + '</button>'; }).join('');
    L.innerHTML = KB.filter(function (c) { return kbTag === 'all' || c.tag === kbTag; }).map(function (c) {
      return '<div class="vx-kb-i"><button type="button" class="vx-kb-ask" data-id="' + c.id + '">' + esc(zh() ? c.zh : c.en) + '</button><div class="vx-src-c">' + cites(c.id) + '</div></div>';
    }).join('');
  }
  document.getElementById('vxKbF').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (!b) return; kbTag = b.getAttribute('data-t'); renderKb(); });
  document.getElementById('vxKbL').addEventListener('click', function (e) {
    var b = e.target.closest('.vx-kb-ask'); if (!b) return;
    input.value = T('Tell me about: ', '请讲讲：') + b.textContent; renderRead(); input.focus();
    window.scrollTo({ top: mount.getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' });
  });

  /* ─── citation pop-over ────────────────────────────────────────────── */
  var pop = document.getElementById('vxRefPop');
  function showRef(el) {
    var id = el.getAttribute('data-ref'), R = window.VT_REFS && window.VT_REFS[id], C = window.VT_CITE;
    if (!R || !C) return;
    pop.innerHTML = esc(C.full(id)) + (R.url ? ' <a href="' + R.url + '" target="_blank" rel="noopener">PubMed ↗</a>' : '');
    var r = el.getBoundingClientRect(), m = mount.getBoundingClientRect();   /* the pop-over lives inside #vx-app */
    pop.style.left = Math.max(8, Math.min(m.width - 328, r.left - m.left)) + 'px';
    pop.style.top = (r.bottom - m.top + 8) + 'px';
    pop.classList.add('on');
  }
  mount.addEventListener('click', function (e) { var c = e.target.closest('.vx-cite'); if (c) { showRef(c); e.stopPropagation(); } else if (!e.target.closest('.vx-refpop')) pop.classList.remove('on'); });
  mount.addEventListener('focusin', function (e) { var c = e.target.closest('.vx-cite'); if (c) showRef(c); });
  document.addEventListener('click', function (e) { if (!mount.contains(e.target)) pop.classList.remove('on'); });

  new MutationObserver(function () { labels(); }).observe(body, { attributes: true, attributeFilter: ['class'] });
  labels();
  loadKb().then(renderKb);
})();

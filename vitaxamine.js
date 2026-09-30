/* vitaxamine.js — the Vitaxamine page (infirmary.html), as a conversation
   with a face. Mounts into #vx-app.
   · The face (vx-face.js) listens while you type, thinks while the answer is
     on its way, and speaks it: the reply is written out word by word and the
     mouth moves with each sound. It ends concerned if the answer carries red
     flags, reassured otherwise, and reacts to 👍/👎.
   · It's a real conversation: follow-ups carry the last exchanges, so "and
     how long until I can run?" means the injury you were just talking about.
     Every answer ends with suggested follow-ups you can tap.
   · The composer reads your question as you type (where / what / since /
     doing, red flags called out first) and has quick pickers for pain level,
     when it started and which side, which travel with the question.
   · Answers become blocks; the "what to do" steps are a checklist you can
     tick; knowledge-base sections used are cited (vt-sources.js); the whole
     knowledge base can be browsed and asked about.
   Same worker as before: POST {question, lang, mode:'clinical'}. */
(function () {
  'use strict';
  var API = 'https://api.vitaliteplan.com';
  var mount = document.getElementById('vx-app');
  if (!mount) return;
  var body = document.body;
  function zh() { return body.classList.contains('lang-zh') || (function () { try { return localStorage.getItem('sm_lang') === 'zh'; } catch (e) { return false; } })(); }
  function T(en, z) { return zh() ? z : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── reading a question ──────────────────────────────────────────── */
  var REGIONS = [
    ['head', 'Head', '头部', /\bhead|concuss|headache|skull|头|脑震荡|头痛/i], ['neck', 'Neck', '颈部', /\bneck|whiplash|cervical|脖|颈|落枕/i],
    ['shoulder', 'Shoulder', '肩部', /shoulder|rotator|deltoid|collarbone|clavicle|肩/i], ['chest', 'Chest', '胸部', /\bchest|\brib|sternum|胸|肋/i],
    ['back', 'Back', '背/腰', /\bback\b|spine|lumbar|sciatica|腰|背|脊/i], ['elbow', 'Elbow', '肘部', /elbow|epicondyl|肘/i],
    ['wrist', 'Wrist & hand', '手腕/手', /wrist|\bhand|finger|thumb|腕|手指|手/i], ['hip', 'Hip & groin', '髋/腹股沟', /\bhip|groin|adductor|髋|腹股沟/i],
    ['thigh', 'Thigh', '大腿', /thigh|hamstring|quad|大腿|腘绳|股四头/i], ['knee', 'Knee', '膝部', /knee|\bacl\b|mcl|menisc|patell|膝/i],
    ['shin', 'Shin & calf', '小腿', /\bshin|calf|tibia|小腿|胫/i], ['ankle', 'Ankle', '踝部', /ankle|achilles|踝|跟腱/i],
    ['foot', 'Foot', '足部', /\bfoot|feet|heel|plantar|toe|脚|足|脚跟|足底/i]
  ];
  var SYMPTOMS = [['Pain', '疼痛', /pain|hurt|sore|ache|疼|痛/i], ['Swelling', '肿胀', /swell|swollen|肿/i], ['Stiffness', '僵硬', /stiff|tight|僵|紧/i],
    ['Numbness', '麻木', /numb|tingl|麻/i], ['Bruising', '淤青', /bruis|淤|青紫/i], ['Weakness', '无力', /weak|giving way|无力|打软/i],
    ['Clicking', '弹响', /click|pop|snap|弹响/i], ['Cramp', '抽筋', /cramp|spasm|抽筋|痉挛/i], ['Bleeding', '出血', /bleed|blood|出血|流血/i], ['Burn', '烫伤', /burn|scald|烧伤|烫/i]];
  var ACTIVITIES = [['Running', '跑步', /\brun|jog|marathon|跑/i], ['Basketball', '篮球', /basketball|篮球/i], ['Football', '足球', /football|soccer|足球/i],
    ['Lifting', '力量训练', /lift|squat|deadlift|bench|gym|weights|举重|健身|深蹲|硬拉/i], ['Swimming', '游泳', /swim|游泳/i], ['Racket sports', '球拍运动', /tennis|badminton|网球|羽毛球/i],
    ['Cycling', '骑行', /cycl|bike|骑/i], ['Sleeping', '睡觉', /sleep|slept|睡/i], ['Desk work', '久坐', /desk|sitting|computer|久坐|电脑/i]];
  var FLAGS = [['Numbness or tingling', '麻木或刺痛', /numb|tingl|麻木/i], ["Can't bear weight", '无法负重', /can'?t (walk|stand|bear|put weight)|cannot (walk|stand|bear)|不能走|无法走|不能站|不能着地/i],
    ['Chest pain', '胸痛', /chest pain|胸痛|胸口痛/i], ['Head injury', '头部受伤', /hit (my )?head|head injury|concuss|knocked out|lost consciousness|撞到头|脑震荡|昏迷/i],
    ['Deformity', '畸形', /deform|out of place|bent wrong|畸形|变形|脱位/i], ['Heavy bleeding', '大量出血', /heavy bleed|won'?t stop bleeding|大量出血|血流不止/i],
    ['Fever', '发烧', /fever|发烧|发热/i], ['Breathing trouble', '呼吸困难', /can'?t breathe|short(ness)? of breath|呼吸困难|喘不上/i]];
  function read(q) {
    var o = { regions: [], symptoms: [], activity: [], when: '', flags: [] };
    REGIONS.forEach(function (r) { if (r[3].test(q)) o.regions.push(r); });
    SYMPTOMS.forEach(function (s) { if (s[2].test(q)) o.symptoms.push(s); });
    ACTIVITIES.forEach(function (a) { if (a[2].test(q)) o.activity.push(a); });
    FLAGS.forEach(function (f) { if (f[2].test(q)) o.flags.push(f); });
    var w = /(\d+\s*(?:hours?|days?|weeks?|months?|years?)|yesterday|today|last night|this morning|[\d一二三四五六七八九十两几半]+\s*(?:天|周|星期|个月|月|年|小时)|昨天|今天|昨晚|今早)/i.exec(q);
    if (w) o.when = w[1];
    return o;
  }
  var REDI = /see a (doctor|professional|physio)|seek (medical|professional|immediate)|emergency|call 120|call 911|urgent|immediately|red flag|就医|急诊|立即|马上|危险/i;
  function isRed(t) { return REDI.test(t) || /\bER\b|\bA&E\b/.test(t); }

  /* ─── knowledge base topics (kb/kb-topics.json) ───────────────────── */
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

  /* ─── layout ───────────────────────────────────────────────────────── */
  var SUGG = [['I slept wrong and my neck is stiff', '我落枕了，脖子僵硬'], ['I rolled my ankle playing basketball', '打篮球扭伤了脚踝'],
    ['My knee hurts when I run downhill', '跑下坡时膝盖疼'], ['Sore muscles two days after squats', '深蹲后两天肌肉酸痛'],
    ['Heel pain first thing in the morning', '早上起床脚跟疼'], ['Should I use ice or heat?', '该冰敷还是热敷？']];
  mount.innerHTML =
    '<div class="vx-grid">' +
      '<aside class="vx-stage">' +
        '<div class="vx-face" id="vxFace" title=""></div>' +
        '<div class="vx-caption"><span class="vx-dot"></span><b>Vitaxamine</b><span id="vxStatus"></span></div>' +
        '<div class="vx-card vx-ctx"><div class="vx-card-h" id="vxCtxH"></div>' +
          '<label class="vx-pain"><span id="vxPainL"></span><input type="range" id="vxPain" min="0" max="10" step="1" value="0"><b id="vxPainV">—</b></label>' +
          '<div class="vx-pick" id="vxWhen"></div><div class="vx-pick" id="vxSide"></div>' +
        '</div>' +
        '<details class="vx-card vx-kb" id="vxKb"><summary class="vx-card-h" id="vxKbH"></summary><div class="vx-kb-filter" id="vxKbF"></div><div class="vx-kb-list" id="vxKbL"></div></details>' +
      '</aside>' +
      '<div class="vx-main">' +
        '<div class="vx-thread" id="vxThread"></div>' +
        '<div class="vx-compose">' +
          '<div class="vx-read" id="vxRead"></div>' +
          '<div class="vx-row"><textarea id="vxInput" rows="2" maxlength="1200"></textarea><button class="vx-send" id="vxSend" type="button" aria-label="Ask"><span id="vxSendL"></span><i>↵</i></button></div>' +
          '<div class="vx-sugg" id="vxSugg"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="vx-refpop" id="vxRefPop" role="tooltip"></div>';

  var input = document.getElementById('vxInput'), readEl = document.getElementById('vxRead'), thread = document.getElementById('vxThread');
  var face = window.VxFace ? window.VxFace.mount(document.getElementById('vxFace')) : { state: function () {}, mood: function () {}, say: function () {}, nod: function () {} };
  var ctx = { pain: 0, when: '', side: '' }, history = [], busy = false, typingT = 0;
  var WHEN = [['today', 'Today', '今天'], ['week', 'This week', '这周'], ['month', '2–4 weeks', '2–4 周'], ['long', 'Longer', '更久']];
  var SIDE = [['left', 'Left', '左侧'], ['right', 'Right', '右侧'], ['both', 'Both', '两侧']];
  function status(t) { document.getElementById('vxStatus').textContent = t; }
  function labels() {
    input.placeholder = T('Describe what hurts, where, since when, and what you were doing…', '描述哪里不舒服、从什么时候开始、当时在做什么…');
    document.getElementById('vxSendL').textContent = T('Ask', '提问');
    document.getElementById('vxCtxH').textContent = T('Add detail', '补充细节');
    document.getElementById('vxPainL').textContent = T('Pain', '疼痛');
    document.getElementById('vxKbH').textContent = T('Browse the knowledge base · 45 topics', '浏览知识库 · 45 个主题');
    document.getElementById('vxWhen').innerHTML = '<em>' + T('Started', '开始于') + '</em>' + WHEN.map(function (w) { return '<button type="button" data-k="when" data-v="' + w[0] + '" class="' + (ctx.when === w[0] ? 'on' : '') + '">' + (zh() ? w[2] : w[1]) + '</button>'; }).join('');
    document.getElementById('vxSide').innerHTML = '<em>' + T('Side', '部位侧') + '</em>' + SIDE.map(function (w) { return '<button type="button" data-k="side" data-v="' + w[0] + '" class="' + (ctx.side === w[0] ? 'on' : '') + '">' + (zh() ? w[2] : w[1]) + '</button>'; }).join('');
    document.getElementById('vxSugg').innerHTML = history.length ? '' : SUGG.map(function (s) { return '<button type="button" class="vx-chip-s">' + esc(zh() ? s[1] : s[0]) + '</button>'; }).join('');
    if (!thread.children.length) greet();
    status(busy ? T('thinking…', '思考中…') : T('ready to listen', '在听'));
    renderRead(); renderKb();
  }
  function greet() {
    var m = document.createElement('div');
    m.className = 'vx-msg bot vx-hello';
    m.innerHTML = '<div class="vx-bubble">' + esc(T("Hi, I'm Vitaxamine. Tell me what hurts: where it is, when it started and what you were doing. I'll answer from our sports-medicine knowledge base, and you can keep asking follow-ups.",
      '你好，我是 Vitaxamine。告诉我哪里不舒服：部位、什么时候开始、当时在做什么。我会根据运动医学知识库回答，你也可以继续追问。')) + '</div>';
    thread.appendChild(m);
  }

  /* ─── the composer ─────────────────────────────────────────────────── */
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
    var q = input.value.trim(), o = read(q), h = chipsHtml(o);
    readEl.innerHTML = q ? h + (o.flags.length ? '' : (!o.regions.length && !history.length ? '<span class="vx-hint">' + T('Tip: say where it is', '提示：说说是哪个部位') + '</span>' : '')) : '';
    readEl.classList.toggle('on', !!q);
  }
  input.addEventListener('input', function () {
    renderRead();
    if (busy) return;
    face.state('listening'); status(T('listening…', '正在听…'));
    clearTimeout(typingT);
    typingT = setTimeout(function () { if (!busy) { face.state('idle'); status(T('ready to listen', '在听')); } }, 1800);
  });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } });
  document.getElementById('vxSend').addEventListener('click', function () { ask(); });
  document.getElementById('vxSugg').addEventListener('click', function (e) { var b = e.target.closest('.vx-chip-s'); if (b) ask(b.textContent); });
  document.getElementById('vxPain').addEventListener('input', function (e) {
    ctx.pain = +e.target.value; document.getElementById('vxPainV').textContent = ctx.pain ? ctx.pain + '/10' : '—';
    e.target.style.setProperty('--v', (ctx.pain * 10) + '%');
    if (ctx.pain >= 8) face.mood('concerned', 1500); else if (ctx.pain && ctx.pain <= 2) face.mood('happy', 900);
  });
  mount.querySelector('.vx-ctx').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]'); if (!b) return;
    var k = b.getAttribute('data-k'), v = b.getAttribute('data-v');
    ctx[k] = ctx[k] === v ? '' : v; labels(); face.nod();
  });
  function ctxText() {
    var bits = [];
    if (ctx.pain) bits.push(T('pain ' + ctx.pain + '/10', '疼痛 ' + ctx.pain + '/10'));
    var w = WHEN.filter(function (x) { return x[0] === ctx.when; })[0]; if (w) bits.push(T('started: ' + w[1].toLowerCase(), '开始于：' + w[2]));
    var s = SIDE.filter(function (x) { return x[0] === ctx.side; })[0]; if (s) bits.push(T('side: ' + s[1].toLowerCase(), '侧：' + s[2]));
    return bits.length ? ' (' + bits.join(zh() ? '，' : ', ') + ')' : '';
  }

  /* ─── asking ───────────────────────────────────────────────────────── */
  function addMsg(who, html, cls) {
    var m = document.createElement('div');
    m.className = 'vx-msg ' + who + (cls ? ' ' + cls : '');
    m.innerHTML = html;
    thread.appendChild(m);
    m.scrollIntoView({ block: 'nearest', behavior: REDUCE ? 'auto' : 'smooth' });
    return m;
  }
  function ask(text) {
    var q = String(text != null ? text : input.value).trim();
    if (!q || busy) return;
    busy = true;
    var shown = q, sent = q + ctxText();
    var o = read(q + ' ' + history.map(function (h) { return h.q; }).join(' '));
    input.value = ''; renderRead();
    document.getElementById('vxSugg').innerHTML = '';
    $$('.vx-follow', thread).forEach(function (f) { f.remove(); });
    addMsg('me', '<div class="vx-bubble">' + esc(shown) + '</div>' + (ctxText() ? '<div class="vx-ctxline">' + esc(ctxText().replace(/^ \(|\)$/g, '')) + '</div>' : '') +
      (chipsHtml(read(q)) ? '<div class="vx-q-chips">' + chipsHtml(read(q)) + '</div>' : ''));
    if (read(q).flags.length) {
      face.mood('concerned', 4000);
      addMsg('bot', '<div class="vx-flagbox">⚠ ' + T('You mentioned ', '你提到了') + read(q).flags.map(function (f) { return '<b>' + esc(zh() ? f[1] : f[0]) + '</b>'; }).join(T(', ', '、')) +
        T('. If this is severe, sudden or getting worse, get medical care now; don’t wait for an answer here.', '。如果情况严重、突然出现或在加重，请立即就医，不要等待这里的回答。') + '</div>', 'vx-flagmsg');
    }
    var wait = addMsg('bot', '<div class="vx-bubble vx-typing"><i></i><i></i><i></i></div>');
    face.state('thinking');
    var steps = [T('checking it’s a clinical question…', '确认是否为临床问题…'), T('searching the knowledge base…', '检索知识库…'), T('writing the answer…', '正在组织回答…')], si = 0;
    status(steps[0]);
    var stepT = setInterval(function () { si = Math.min(steps.length - 1, si + 1); status(steps[si]); }, 1400);
    /* follow-ups carry the conversation so far */
    var convo = history.slice(-2).map(function (h) { return T('User: ', '用户：') + h.q + '\n' + T('Vitaxamine: ', 'Vitaxamine：') + h.a.slice(0, 700); }).join('\n\n');
    var question = convo ? T('Conversation so far:\n', '之前的对话：\n') + convo + T('\n\nFollow-up question: ', '\n\n追问：') + sent : sent;
    Promise.all([loadKb(), fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: question, lang: zh() ? 'zh' : 'en', mode: 'clinical' }) })
      .then(function (r) { return r.json().then(function (d) { return { st: r.status, d: d }; }, function () { return { st: r.status, d: {} }; }); }, function () { return { st: 0, d: { error: 'network' } }; })])
      .then(function (res) {
        clearInterval(stepT);
        var d = res[1].d || {};
        if (!d.reply) {
          wait.innerHTML = '<div class="vx-bubble vx-err">' + (res[1].st === 0 ? T('Network error: check your connection and try again.', '网络错误：请检查网络后重试。') : T('I can’t answer right now. Please try again in a moment.', '暂时无法回答，请稍后再试。')) + '</div>';
          face.mood('concerned', 1500); face.state('idle'); status(T('ready to listen', '在听')); busy = false; return;
        }
        var top = (d.ragTop || []).filter(function (id) { return KBI[id]; });
        speak(wait, d.reply, top, o, !!d.rejected, q);
      });
  }

  /* ─── speaking: the reply is written out and the face says it ─────── */
  function inline(s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function speak(el, reply, top, o, rejected, q) {
    face.state('speaking'); status(T('speaking', '正在说'));
    var plain = String(reply).replace(/\r/g, '').replace(/^#{1,4}\s+/gm, '').replace(/\*\*/g, '');
    el.innerHTML = '<div class="vx-bubble vx-live"><span class="vx-live-t"></span><i class="vx-caret"></i></div>';
    var sp = el.querySelector('.vx-live-t'), bub = el.querySelector('.vx-live');
    var total = plain.length, dur = Math.min(6000, Math.max(1400, total * (zh() ? 38 : 14)));
    var t0 = performance.now(), shown = 0, done = false;
    function finish() {
      if (done) return; done = true;
      render(el, reply, top, o, rejected, q);
    }
    bub.addEventListener('click', finish);                    /* tap to skip */
    (function step(now) {
      if (done) return;
      var k = Math.min(total, Math.round(total * Math.min(1, (now - t0) / dur)));
      if (k > shown) {
        var chunk = plain.slice(shown, k);
        for (var i = 0; i < chunk.length; i += Math.max(1, Math.floor(chunk.length / 3))) face.say(chunk.charAt(i));
        face.say(chunk.charAt(chunk.length - 1));
        if (isRed(chunk)) face.mood('concerned', 1800);
        shown = k; sp.textContent = plain.slice(0, k);
        if (k % 40 < 3) bub.scrollIntoView({ block: 'nearest' });
      }
      if (k >= total) { setTimeout(finish, 250); return; }
      requestAnimationFrame(step);
    })(t0);
  }
  function render(el, reply, top, o, rejected, q) {
    var lines = String(reply).replace(/\r/g, '').split(/\n+/), html = '', list = null, sec = '', checklist = false, n = 0;
    var STEP = /what to do|management|treatment|steps|do now|self-care|home care|recovery|rehab|处理|建议|治疗|步骤|康复|怎么做/i;
    lines.forEach(function (ln) {
      var t = ln.trim(); if (!t) return;
      var h = /^#{1,4}\s+(.*)$/.exec(t) || /^\*\*([^*]{2,60})\*\*:?$/.exec(t) || /^([^：:]{2,24})[：:]$/.exec(t);
      var li = /^(?:[-*•·]|\d+[.)、])\s+(.*)$/.exec(t);
      if (h) { if (list) { html += '</ul>'; list = null; } sec = h[1]; checklist = STEP.test(sec); html += '<h4>' + inline(h[1]) + '</h4>'; return; }
      if (li) {
        if (!list) { html += '<ul' + (checklist ? ' class="vx-check"' : '') + '>'; list = 1; }
        html += checklist ? '<li><label><input type="checkbox" data-n="' + (n++) + '"><span>' + inline(li[1]) + '</span></label></li>' : '<li' + (isRed(li[1]) ? ' class="vx-red"' : '') + '>' + inline(li[1]) + '</li>';
        return;
      }
      if (list) { html += '</ul>'; list = null; }
      html += '<p' + (isRed(t) ? ' class="vx-red"' : '') + '>' + inline(t) + '</p>';
    });
    if (list) html += '</ul>';
    var src = top.length ? '<div class="vx-src"><div class="vx-src-h">' + T('From the knowledge base', '来自知识库') + '</div>' + top.map(function (id) {
      var k = KBI[id];
      return '<div class="vx-src-i"><b>' + esc(zh() ? k.zh : k.en) + '</b><span class="vx-tag t-' + k.tag + '">' + esc((TAGS[k.tag] || [k.tag, k.tag])[zh() ? 1 : 0]) + '</span><div class="vx-src-c">' + cites(id) + '</div></div>';
    }).join('') + '</div>' : '';
    el.innerHTML = '<div class="vx-bubble vx-answer' + (rejected ? ' vx-rej' : '') + '">' + html + src +
      '<div class="vx-a-foot"><span>' + T('Education only, not a diagnosis.', '仅供学习，不构成诊断。') + '</span><span class="vx-rate"><button type="button" data-r="up" aria-label="Helpful">👍</button><button type="button" data-r="down" aria-label="Not helpful">👎</button></span></div></div>';
    history.push({ q: q, a: String(reply) });
    busy = false;
    var red = isRed(reply) || o.flags.length;
    face.state('idle'); face.mood(red ? 'concerned' : 'happy', 2600); face.nod();
    status(T('ready for a follow-up', '可以继续追问'));
    if (!rejected) followUps(o, reply);
    el.querySelector('.vx-rate').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', this).forEach(function (x) { x.classList.toggle('on', x === b); });
      if (b.getAttribute('data-r') === 'up') face.mood('happy', 1800); else { face.mood('concerned', 1800); followUps(o, reply, true); }
    });
    el.addEventListener('change', function (e) {
      if (!e.target.matches('.vx-check input')) return;
      var all = $$('.vx-check input', el), done = all.filter(function (x) { return x.checked; }).length;
      e.target.closest('li').classList.toggle('done', e.target.checked);
      if (done === all.length && all.length) { face.mood('happy', 2200); face.nod(); }
    });
  }
  function followUps(o, reply, simpler) {
    var r = o.regions[0], part = r ? (zh() ? r[2] : r[1].toLowerCase()) : '';
    var F = simpler ? [[ 'Explain that more simply', '用更简单的话解释一下']] : [];
    F = F.concat([
      r ? ['How long until I can train my ' + part + ' again?', part + '多久能恢复训练？'] : ['How long does this usually take to heal?', '这通常需要多久恢复？'],
      ['What exercises help, and when do I start them?', '哪些练习有帮助？什么时候开始？'],
      ['What should I avoid for now?', '现在应该避免什么？'],
      ['Which signs mean I should see a doctor?', '出现哪些情况需要就医？'],
      ['Explain that more simply', '用更简单的话解释一下']
    ]).filter(function (x, i, a) { return a.findIndex(function (y) { return y[0] === x[0]; }) === i; }).slice(0, 4);
    $$('.vx-follow', thread).forEach(function (f) { f.remove(); });
    var m = addMsg('bot', '<div class="vx-follow-in"><em>' + T('Ask next', '接着问') + '</em>' + F.map(function (x) { return '<button type="button" class="vx-chip-s">' + esc(zh() ? x[1] : x[0]) + '</button>'; }).join('') +
      (r ? '<a class="vx-chip-s vx-plan" href="plan.html">' + T('Build a recovery plan →', '制定康复计划 →') + '</a>' : '') + '</div>', 'vx-follow');
    m.addEventListener('click', function (e) { var b = e.target.closest('button.vx-chip-s'); if (b) ask(b.textContent); });
  }

  /* ─── knowledge base browser ───────────────────────────────────────── */
  var kbTag = 'all';
  function renderKb() {
    var F = document.getElementById('vxKbF'), L = document.getElementById('vxKbL');
    if (!KB) { L.innerHTML = ''; return; }
    F.innerHTML = ['all'].concat(Object.keys(TAGS)).map(function (t) { return '<button type="button" data-t="' + t + '" class="' + (t === kbTag ? 'on' : '') + '">' + (t === 'all' ? T('All', '全部') : TAGS[t][zh() ? 1 : 0]) + '</button>'; }).join('');
    L.innerHTML = KB.filter(function (c) { return kbTag === 'all' || c.tag === kbTag; }).map(function (c) {
      return '<div class="vx-kb-i"><button type="button" class="vx-kb-ask" data-id="' + c.id + '">' + esc(zh() ? c.zh : c.en) + '</button><div class="vx-src-c">' + cites(c.id) + '</div></div>';
    }).join('');
  }
  document.getElementById('vxKbF').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (!b) return; kbTag = b.getAttribute('data-t'); renderKb(); });
  document.getElementById('vxKbL').addEventListener('click', function (e) {
    var b = e.target.closest('.vx-kb-ask'); if (!b) return;
    ask(T('Tell me about ', '请讲讲') + b.textContent);
  });

  /* ─── citation pop-over ────────────────────────────────────────────── */
  var pop = document.getElementById('vxRefPop');
  function showRef(el) {
    var id = el.getAttribute('data-ref'), R = window.VT_REFS && window.VT_REFS[id], C = window.VT_CITE;
    if (!R || !C) return;
    pop.innerHTML = esc(C.full(id)) + (R.url ? ' <a href="' + R.url + '" target="_blank" rel="noopener">PubMed ↗</a>' : '');
    var r = el.getBoundingClientRect(), m = mount.getBoundingClientRect();
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

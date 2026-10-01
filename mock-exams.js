/* ═══════════════════════════════════════════════════════════════════════════
   TIMED MOCK EXAMS  ·  registrations
   ---------------------------------------------------------------------------
   Three exams, each built from the real format rather than a generic quiz.
   Every number and every quoted rule is sourced; where no source exists the
   gap is declared in `reconstructed` and shown to the user on the briefing
   screen. See MOCK-SPEC.md for the citations.

     1 · NPTE-PT          FSBPT Candidate Handbook 2025.02 + Test Content
                           Outline effective January 2024
     2 · 运动康复师资格证   人社部教育培训网体系 · NO published blueprint exists,
                           so the paper is declared a reconstruction
     3 · IB SEHS          ibo.org + May/November 2026 IB examination schedule
                           (first assessment 2026 — Paper 3 no longer exists)
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var M = window.VitaliteMock;
  if (!M) return;

  /* ─────────────────────────────────────────────────────────────────────
     1 · NPTE-PT
     ───────────────────────────────────────────────────────────────────── */

  /* The live bank tags items with only five labels. FSBPT's blueprint has
     nine body systems plus a non-system block, so anything tagged `other` is
     classified here by keyword. The result is marked `auto` in the UI and is
     never presented as official FSBPT tagging. */
  var NPTE_KW = [
    ['msk', /\b(acromioclavicular|meniscus|ligament|tendon|sprain|strain|fracture|dislocation|rotator cuff|acl|pcl|mcl|lachman|thoracic|lumbar|cervical|sacroiliac|scoliosis|osteoarthrit|arthrit|joint|motion range|range of motion|flexion|extension|abduction|adduction|rotation|isometric|concentric|eccentric|muscle strength|manual muscle|posture|musculoskeletal|hip|knee|ankle|shoulder|elbow|wrist|hand|pelvis|sacro|vertebrae|spondyl|amputat|prosthetic|gait|orthosis|orthotic|bmr|lean body)\b/i],
    ['neuro', /\b(nerve|neurolog|neuropath|radicul|plexus|spinal cord|cerebr|cerebell|medulla|brain|stem|stroke|cva|balance|vestibular|coordinat|motor unit|spinal|reflex|tone|spasticity|flaccid|propriocept|concussion|tbi|sensory|proprio|epilepsy|seizure|multiple sclerosis|parkinson|als\b|myopathy|ataxia|dysphagia|headache|cerebral|palsy)\b/i],
    ['card', /\b(cardiac|cardiovascular|pulmonary|respirat|heart|coronary|angina|myocardial|ecg|ekg|arrhythmi|blood pressure|hypertens|heart rate|pulse|vo2|oxygen saturation|spo2|cyanosis|bronch|wheez|oedema|edema|dvt|thrombo|emphysema|asthma|copd|atelectasis|vital capacity|spirometr|diaphragm|dyspnoea|dyspnea|shock|stroke volume|cardiac output|tubing)\b/i],
    ['integ', /\b(skin|wound|ulcer|pressure|burn|decubitus|incision|suture|dressing|debridement|integument|epidermis|dermis|scar|amputation stump|infection|cellulitis|temperature scale|braden)\b/i],
    ['lymph', /\b(lymph|oedema|edema|swelling|compression|manual lymph|vaso|pneumatic|elevat)\b/i],
    ['gi', /\b(bowel|intestin|colon|ileum|jejunum|duodenum|stomach|gastric|peristal|obstip|constipat|diarrh|nutrition|feeding|enteral|parenteral|swallow|abdomen|abdominal|faecal|fecal|nutritional)\b/i],
    ['gu', /\b(urinar|bladder|kidney|renal|continen|urinary|catheter|prostate|uti\b|eliminat)\b/i],
    ['meta', /\b(diabet|thyroid|insulin|glucose|metabolic|endocrine|hormon|hypoglyc|hyperglyc|adrenal|pituitary|obesity|bmr|metabolism|osteopor|thyroxine|cortisol)\b/i],
    ['sysint', /\b(system interaction|multiple system|complication|adverse effect|contraindicat|underlying condition|comorbid|systemic|integrat)\b/i],
    ['nonsys', /\b(safety|contraindicat|equipment|device|modalit|professional|ethic|legal|scope of practice|documentation|evidence|research|test and measure|outcome measure|infection control|transfer|gait belt|wheelchair|assistive|ergonomic|hand hygiene|professional responsibilit|quality|legal standard)\b/i]
  ];

  /* The bank's own five labels are not blueprint keys, so anything the keyword
     pass does not claim has to be translated rather than passed through. Passing
     'cardio' straight through would make that bucket invisible to the blueprint
     and to the results table. */
  var NPTE_FALLBACK = { msk: 'msk', neuro: 'neuro', cardio: 'card', integ: 'integ', other: 'nonsys' };

  function npteTag(q) {
    var hay = (q.q || '') + ' ' + (q.ex || '');
    for (var i = 0; i < NPTE_KW.length; i++) {
      if (NPTE_KW[i][1].test(hay)) return { sys: NPTE_KW[i][0], auto: true };
    }
    var fb = NPTE_FALLBACK[q.d];
    return { sys: fb || 'nonsys', auto: false };
  }

  function npteBank() {
    var BANK = window.BANK || [];
    var out = [];
    for (var i = 0; i < BANK.length; i++) {
      var b = BANK[i];
      if (!b || !b.q || !b.opts || b.opts.length < 2) continue;
      var tg = npteTag(b);
      out.push({
        id: 'npte-' + i,
        en: b.q, zh: b.qcn || b.q,
        opts: b.opts, optsz: b.optscn || b.opts,
        correct: b.c, ex: b.ex, exz: b.excn || b.ex,
        sys: tg.sys, auto: tg.auto,
        cat: 'stand-alone'
      });
    }
    return out;
  }

  var npteRows = [
    { sys: 'msk', en: 'Musculoskeletal system', zh: '肌肉骨骼系统', min: 44, max: 54 },
    { sys: 'neuro', en: 'Neuromuscular & nervous systems', zh: '神经肌肉与神经系统', min: 39, max: 48 },
    { sys: 'card', en: 'Cardiovascular & pulmonary systems', zh: '心血管与呼吸系统', min: 22, max: 27 },
    { sys: 'integ', en: 'Integumentary system', zh: '皮肤系统', min: 8, max: 11 },
    { sys: 'sysint', en: 'System interactions', zh: '系统交互', min: 8, max: 10 },
    { sys: 'lymph', en: 'Lymphatic system', zh: '淋巴系统', min: 4, max: 7 },
    { sys: 'meta', en: 'Metabolic & endocrine systems', zh: '代谢与内分泌系统', min: 4, max: 6 },
    { sys: 'gi', en: 'Gastrointestinal system', zh: '消化系统', min: 3, max: 6 },
    { sys: 'gu', en: 'Genitourinary system', zh: '泌尿生殖系统', min: 2, max: 5 },
    { sys: 'nonsys', en: 'Non-system (equipment, safety, professional, research)', zh: '非系统类（器械、安全、专业职责、循证）', min: 21, max: 29 }
  ];

  M.add({
    id: 'npte',
    title: { en: 'NPTE mock exam', zh: 'NPTE 模拟考试' },
    lede: {
      en: 'The National Physical Therapist Examination, sat the way it is actually sat: one five-hour clock for the whole paper, five locked sections, a scheduled break after section two, and 45 items you are never told are unscored.',
      zh: '按真实方式作答的美国物理治疗师全国考试：全卷统一五小时计时、五部分锁定、第二部分后有固定休息，以及 45 道系统不会告诉你是哪几道的不计分试测题。'
    },
    source: 'FSBPT NPTE Candidate Handbook v2025.02 and NPTE-PT Test Content Outline, effective January 2024.',
    facts: [
      ['Format', 'Computer-based multiple choice', '机考', '单选题'],
      ['Items', '225 (180 scored + 45 pretest)', '225 题（180 计分 + 45 试测）', '225 题（180 计分 + 45 不计分）'],
      ['Sections', '5 × 45, locked on submit', '5 × 45，提交后锁定', '5 × 45，提交后锁定'],
      ['Time', '5 hours, one running clock', '5 小时，统一计时', '5 小时，统一计时'],
      ['Break', '15 min after section 2', '第二部分后休息 15 分钟', '第二部分后休息 15 分钟'],
      ['Pass mark', '600 on a 200–800 scale', '200–800 分制，600 分及格', '200–800 分制，600 分及格']
    ],
    brief: [
      {
        en: 'Every section holds exactly 45 items and 36 of them count toward your score. The remaining 9 in each section are pretest items — real questions being trialled for future exams. You are never told which are which, and you cannot find out afterwards, so treat all 225 as if they count.',
        zh: '每部分固定 45 题，其中 36 题计分，其余 9 题为试测题——是正在为未来考试做试验的真实题目。系统不会告诉你是哪几题，交卷后也查不到，所以 225 题都要当真题对待。'
      },
      {
        en: 'Once you submit a section you cannot return to it. The clock runs across the whole paper, so a slow section eats into the one after it — which is exactly the stamina problem the exam is built to expose.',
        zh: '提交一部分后无法返回。计时贯穿全卷，所以某一部分做得慢会挤占下一部分的时间——这正是这门考试要考察的体力与时间管理问题。'
      }
    ],
    rules: [
      { en: 'No penalty for guessing. An unanswered item is a guaranteed zero, so answer all 225.', zh: '猜错不扣分。空题必定是零分，所以 225 题全部作答。' },
      { en: 'You may mark items for review and jump back to them inside the same section.', zh: '可以标记题目，并在同一部分内跳回查看。' },
      { en: 'The 15-minute break falls after section 2 only. It is the only scheduled break.', zh: '15 分钟休息只在第二部分之后，这是唯一的固定休息。' },
      { en: 'Aim for about 80 seconds per item. Scenario items run longer, stand-alone items shorter.', zh: '每题约 80 秒。案例题更费时，独立题更快。' }
    ],
    blueprint: { rows: npteRows, note: { en: 'Ranges are published out of 180 scored items and are the 2024 outline', zh: '区间为官方公布的 180 道计分题分布（2024 版大纲）' } },
    sysLabel: {
      msk: { en: 'Musculoskeletal', zh: '肌肉骨骼' },
      nonsys: { en: 'Non-system', zh: '非系统类' },
      neuro: { en: 'Neuromuscular & nervous', zh: '神经肌肉与神经' },
      card: { en: 'Cardiovascular & pulmonary', zh: '心肺' },
      integ: { en: 'Integumentary', zh: '皮肤' },
      sysint: { en: 'System interactions', zh: '系统交互' },
      lymph: { en: 'Lymphatic', zh: '淋巴' },
      meta: { en: 'Metabolic & endocrine', zh: '代谢与内分泌' },
      gi: { en: 'Gastrointestinal', zh: '消化' },
      gu: { en: 'Genitourinary', zh: '泌尿生殖' }
    },
    build: npteBank,
    itemsWanted: 225, scoredTotal: 180, pretest: 45, sections: 5,
    timeSec: 5 * 3600, paceSec: 80,
    scale: true, pass: 600, noPenalty: true,
    modes: [
      { key: 'full', en: 'Full paper — 225 items, 5 hours', zh: '全卷 —— 225 题，5 小时' },
      {
        key: 'compact', en: 'Compact — 100 items, 2h15m, same blueprint',
        zh: '精简 —— 100 题，2 小时 15 分，比例不变',
        itemsWanted: 100, timeSec: 8100, pretest: 20, paceSec: 80
      }
    ]
  });

  /* ─────────────────────────────────────────────────────────────────────
     2 · 运动康复师资格证
     ───────────────────────────────────────────────────────────────────── */

  var CN_CAT = {
    an: { en: 'Anatomy · 运动解剖学', zh: '运动解剖学' },
    ph: { en: 'Exercise physiology · 运动生理学', zh: '运动生理学' },
    as: { en: 'Assessment · 康复评定学', zh: '康复评定学' },
    in: { en: 'Sports injury · 运动损伤学', zh: '运动损伤学' },
    tc: { en: 'TCM health management · 中医健康管理', zh: '中医健康管理' }
  };

  /* 多项选择题 — the answer is a set, not one index. Six items are promoted
     from the bank on the strength of their options: the distractor set is
     genuinely "two of these are true", which is what a 多选题 looks like.
     Flagged in the UI so it is never mistaken for a bank tagging error. */
  var CN_MULTI_AT = [11, 26, 41, 58, 73, 90];
  var CN_MULTI_ANSWER = {
    11: [0, 2], 26: [1, 3], 41: [0, 3], 58: [2, 3], 73: [1, 2], 90: [0, 3]
  };

  function cnBank() {
    var src = [];
    try { src = (typeof CN_QUESTIONS !== 'undefined' && CN_QUESTIONS) || []; } catch (e) { src = []; }
    var out = [];
    for (var i = 0; i < src.length; i++) {
      var b = src[i];
      if (!b || !b.en || !b.opts || b.opts.length < 2) continue;
      var o = {
        id: 'cn-' + i,
        en: b.en, zh: b.zh || b.en,
        opts: b.opts, optsz: b.optsz || b.opts,
        correct: b.correct, ex: b.expl, exz: b.explz || b.expl,
        sys: CN_CAT[b.cat] ? b.cat : 'an',
        cat: b.cat || 'an'
      };
      if (CN_MULTI_ANSWER[i]) { o.multi = CN_MULTI_ANSWER[i]; o.correct = CN_MULTI_ANSWER[i][0]; }
      out.push(o);
    }
    return out;
  }

  /* Section weights follow the five subjects the syllabus is organised into.
     These are our own proportions, not a published split — stated as such. */
  var cnRows = [
    { sys: 'an', en: 'Anatomy · 运动解剖学', zh: '运动解剖学', min: 18, max: 22 },
    { sys: 'ph', en: 'Exercise physiology · 运动生理学', zh: '运动生理学', min: 20, max: 24 },
    { sys: 'as', en: 'Assessment · 康复评定学', zh: '康复评定学', min: 20, max: 24 },
    { sys: 'in', en: 'Sports injury · 运动损伤学', zh: '运动损伤学', min: 20, max: 24 },
    { sys: 'tc', en: 'TCM health management · 中医健康管理', zh: '中医健康管理', min: 16, max: 20 }
  ];

  M.add({
    id: 'cncert',
    title: { en: '运动康复师资格证 mock exam', zh: '运动康复师资格证模拟考试' },
    lede: {
      en: 'The theoretical paper for the 人社部教育培训网 vocational rehabilitation certificate, in the shape this exam family actually uses: 100 marks in 90 minutes, mixing 单项选择, 多项选择 and 判断.',
      zh: '人社部教育培训网职业技能证书的理论考试，按这一类考试的通行形式编排：100 分、90 分钟，包含单项选择、多项选择与判断。'
    },
    source: '人社部教育培训网（edu.mohrss.gov.cn）考评说明；题型按职业技能等级认定理论考试通行结构重建。',
    reconstructed: {
      en: 'No official item count, subject split or time limit is published for this certificate — the platform auto-assembles the paper from a bank, so the numbers differ by sitting. This paper is a faithful reconstruction of the standard format, not a copy of an official one. If your training provider publishes a 大纲, the numbers here will be corrected to match.',
      zh: '本证书没有公布过固定的题量、科目分值或考试时长——考务平台会从题库自动组卷，每次都不一样。本试卷是按通行结构的忠实重建，并非官方试卷原件。如果你的培训机构发布了考试大纲，这里会据此更正。'
    },
    facts: [
      ['Total', '100 marks', '100 分', '100 分'],
      ['Time', '90 minutes, one running clock', '90 分钟，统一计时', '90 分钟，统一计时'],
      ['Types', 'Single choice, multiple choice, true/false', '单项选择、多项选择、判断', '单项选择、多项选择、判断'],
      ['Pass', '60 marks, both parts together', '理论与技能合计 60 分', '理论与技能合计 60 分'],
      ['Part 2', '技能操作考核 — not modelled here', '技能操作考核 —— 本卷不涉及', '技能操作考核 —— 本卷不涉及']
    ],
    brief: [
      {
        en: 'On a 多项选择题 more than one option can be correct, and you must select all of them to score. Missing one of the correct options scores zero for that question, which is why the mock marks those clearly and tells you as you go.',
        zh: '多项选择题可能有多个正确选项，必须全部选对才能得分，漏选一个即为零分。因此本卷会明确标出多选题，并在作答时提示你。'
      },
      {
        en: 'A 判断题 is worth less than a 单项选择题 but it is the fastest mark on the paper. A true/false item is normally structured so one option is obviously right — if both read as plausible, you have misread one of them.',
        zh: '判断题分值低于单选题，但它是全卷最快的得分点。判断题通常设计成其中一个选项明显正确——如果两个读起来都合理，说明你有一个理解偏了。'
      }
    ],
    rules: [
      { en: '90 minutes for the whole paper. There is no per-question limit.', zh: '全卷 90 分钟，每题没有单独限时。' },
      { en: 'Multiple-choice items need every correct option ticked.', zh: '多选题必须把所有正确选项都选上。' },
      { en: 'Nothing here is timed per subject — you answer the whole paper in one sitting, as on the real platform.', zh: '本卷不按科目分别限时——与真实平台一样，一次性答完整卷。' }
    ],
    blueprint: { rows: cnRows, note: { en: 'Subject weights are our own proportions, not a published split', zh: '科目权重为本站自定比例，非官方公布分值' } },
    sysLabel: {
      an: { en: 'Anatomy', zh: '运动解剖学' },
      ph: { en: 'Exercise physiology', zh: '运动生理学' },
      as: { en: 'Assessment', zh: '康复评定学' },
      in: { en: 'Sports injury', zh: '运动损伤学' },
      tc: { en: 'TCM health management', zh: '中医健康管理' }
    },
    build: cnBank,
    itemsWanted: 100, scoredTotal: 100, pretest: 0, sections: 1,
    timeSec: 90 * 60, paceSec: 54,
    scale: false, pass: null, noPenalty: false,
    modes: [
      { key: 'full', en: 'Full paper — 100 items, 90 minutes', zh: '全卷 —— 100 题，90 分钟' },
      {
        key: 'half', en: 'Half paper — 50 items, 45 minutes',
        zh: '半卷 —— 50 题，45 分钟',
        itemsWanted: 50, timeSec: 2700, paceSec: 54
      }
    ]
  });

  /* ─────────────────────────────────────────────────────────────────────
     3 · IB SEHS  (first assessment 2026)
     ───────────────────────────────────────────────────────────────────── */

  /* 29 items carry a syllabus code (A.1.1 …) and a command term, which is
     exactly what Paper 1A tests. There is no 1B data-based bank on the site
     yet, so Paper 1B is offered as a timed writing paper instead of being
     faked with multiple choice. */
  function ibBank() {
    var src = window.IBSEHS_QUESTIONS || [];
    var out = [];
    for (var i = 0; i < src.length; i++) {
      var b = src[i];
      if (!b || !b.en || !b.opts || b.opts.length < 2) continue;
      out.push({
        id: 'ib-' + (b.code || i),
        en: b.en, zh: b.zh || b.en,
        opts: b.opts, optsz: b.optscn || b.opts,
        correct: b.correct,
        ex: (b.explain && b.explain[0]) || '', exz: (b.explain && b.explain[1]) || '',
        sys: (b.code || '').charAt(0).toLowerCase() || 'a',
        cat: b.code || '', cmd: b.cmd || ''
      });
    }
    return out;
  }

  var ibRows = [
    { sys: 'a', en: 'Theme A · Exercise physiology & nutrition', zh: '主题 A · 运动生理学与营养', min: 9, max: 11 },
    { sys: 'b', en: 'Theme B · Biomechanics', zh: '主题 B · 生物力学', min: 9, max: 11 },
    { sys: 'c', en: 'Theme C · Sports psychology & motor learning', zh: '主题 C · 运动心理学与动作学习', min: 10, max: 12 },
    { sys: 'd', en: 'HL extension only · Themes 5.1–5.7', zh: '仅 HL 扩展 · 主题 5.1–5.7', min: 3, max: 5 }
  ];

  M.add({
    id: 'ibsehs',
    title: { en: 'IB SEHS mock exam', zh: 'IB SEHS 模拟考试' },
    lede: {
      en: 'Sports, exercise and health science under the first-assessment-2026 syllabus. Two papers only — Paper 3 was removed — with Paper 1A as timed multiple choice and Paper 1B as timed data-based writing.',
      zh: '按2026 年首次考核大纲的体育、运动与健康科学。全科只有两份试卷——Paper 3 已取消——Paper 1A 为限时单选，Paper 1B 为限时数据分析写作。'
    },
    source: 'ibo.org SEHS course updates; IB May & November 2026 examination schedules; SEHS subject guide (first assessment 2026).',
    facts: [
      ['Papers', 'Two only — Paper 3 removed', '仅两份 —— Paper 3 已取消', '仅两份 —— Paper 3 已取消'],
      ['Paper 1', '36% of the grade, 1A MC + 1B data', '占成绩 36%，1A 单选 + 1B 数据题', '占成绩 36%，1A 单选 + 1B 数据题'],
      ['Paper 1 time', 'SL 90 min · HL 105 min', 'SL 90 分钟 · HL 105 分钟', 'SL 90 分钟 · HL 105 分钟'],
      ['Paper 1A', 'SL 30 MCQ · HL 40 MCQ', 'SL 30 单选 · HL 40 单选', 'SL 30 单选 · HL 40 单选'],
      ['Negative marking', 'None — never leave one blank', '不倒扣分 —— 不要留空', '不倒扣分 —— 不要留空'],
      ['Internal assessment', '24%, 3200 words', '24%，3200 字', '24%，3200 字']
    ],
    brief: [
      {
        en: 'Paper 1A is the part you can practise honestly here: short multiple-choice items drawn straight from the three core themes, each one tagged with the syllabus code it comes from and the command term it uses.',
        zh: 'Paper 1A 是可以真正练习的部分：直接取自三个核心主题的短单选题，每题都标注了对应的考纲编号与指令词。'
      },
      {
        en: 'The two things IB examiner reports single out are misreading the command term and confusing closely related terms. Both cost marks on Paper 1A even when the underlying knowledge is there.',
        zh: 'IB 考官报告里点名出现的两个丢分点：一是看错指令词，二是混淆相近概念。即使知识本身掌握了，这两点也会让你在 Paper 1A 失分。'
      }
    ],
    rules: [
      { en: 'No marks are deducted for a wrong answer, so never leave an item blank.', zh: '答错不倒扣分，所以不要留空。' },
      { en: 'SL Paper 1A is 30 items in 90 minutes. That is roughly 3 minutes each — far more generous than the NPTE.', zh: 'SL Paper 1A 为 90 分钟 30 题，约每题 3 分钟 —— 比 NPTE 宽松得多。' },
      { en: 'The command term tells you what the question wants: identify, explain, analyse, evaluate and discuss are not interchangeable.', zh: '指令词决定了题目要什么：识别、解释、分析、评价与讨论之间不能互换。' }
    ],
    blueprint: { rows: ibRows, note: { en: 'Options 4.1–4.4 and HL extension 5.1–5.7 are assessed in Paper 2, not Paper 1A', zh: '选修 4.1–4.4 与 HL 扩展 5.1–5.7 在 Paper 2 考查，不在 Paper 1A' } },
    sysLabel: {
      a: { en: 'Theme A', zh: '主题 A' },
      b: { en: 'Theme B', zh: '主题 B' },
      c: { en: 'Theme C', zh: '主题 C' },
      d: { en: 'HL extension', zh: 'HL 扩展' }
    },
    build: ibBank,
    itemsWanted: 30, scoredTotal: 30, pretest: 0, sections: 1,
    timeSec: 90 * 60, paceSec: 180,
    scale: false, pass: null, noPenalty: true,
    modes: [
      { key: 'full', en: 'SL Paper 1A — 30 items, 90 minutes', zh: 'SL Paper 1A —— 30 题，90 分钟' },
      {
        key: 'hl', en: 'HL Paper 1A — 40 items, 105 minutes',
        zh: 'HL Paper 1A —— 40 题，105 分钟',
        itemsWanted: 40, timeSec: 105 * 60, paceSec: 157
      }
    ]
  });
})();
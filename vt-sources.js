/* vt-sources.js — where Vitalité's knowledge comes from.
   One place for:
     VT_REFS     the reference library (textbooks, position stands, consensus
                 statements, guidelines). Journal articles link to a PubMed
                 title search; books and official documents have no link.
     VT_TIPS     the "Did you know?" tips on the splash and loading screens,
                 each tied to the reference it comes from.
     VT_KB_REFS  every section of the Vitaxamine knowledge base
                 (kb/medical-kb.json) → its references.
     VT_PAGE_REFS  every knowledge page / textbook chapter → its references.
   Loaded synchronously in <head> (before loader.js) so the loading screen
   and splash can use the tips from their first frame.
   Keep entries to sources that really exist: authors, title, where, year. */
(function () {
  'use strict';
  var R = {
    /* ── textbooks & references ───────────────────────────────────────── */
    acsm2021: { a: 'American College of Sports Medicine', t: "ACSM's Guidelines for Exercise Testing and Prescription, 11th ed.", s: 'Wolters Kluwer', y: 2021, k: 'book' },
    brukner2017: { a: 'Brukner P, Khan K, et al.', t: "Brukner & Khan's Clinical Sports Medicine, Vol. 1: Injuries, 5th ed.", s: 'McGraw-Hill Education', y: 2017, k: 'book' },
    haff2016: { a: 'Haff GG, Triplett NT (eds).', t: 'Essentials of Strength Training and Conditioning, 4th ed. (NSCA)', s: 'Human Kinetics', y: 2016, k: 'book' },
    hall2021: { a: 'Hall JE, Hall ME.', t: 'Guyton and Hall Textbook of Medical Physiology, 14th ed.', s: 'Elsevier', y: 2021, k: 'book' },
    tortora2017: { a: 'Tortora GJ, Derrickson B.', t: 'Principles of Anatomy and Physiology, 15th ed.', s: 'Wiley', y: 2017, k: 'book' },
    mcardle2015: { a: 'McArdle WD, Katch FI, Katch VL.', t: 'Exercise Physiology: Nutrition, Energy, and Human Performance, 8th ed.', s: 'Wolters Kluwer', y: 2015, k: 'book' },
    kenney2020: { a: 'Kenney WL, Wilmore JH, Costill DL.', t: 'Physiology of Sport and Exercise, 7th ed.', s: 'Human Kinetics', y: 2020, k: 'book' },
    kandel2021: { a: 'Kandel ER, Koester JD, Mack SH, Siegelbaum SA (eds).', t: 'Principles of Neural Science, 6th ed.', s: 'McGraw-Hill', y: 2021, k: 'book' },
    tintinalli2020: { a: 'Tintinalli JE, Ma OJ, Yealy DM, et al. (eds).', t: "Tintinalli's Emergency Medicine: A Comprehensive Study Guide, 9th ed.", s: 'McGraw-Hill', y: 2020, k: 'book' },
    magee2014: { a: 'Magee DJ.', t: 'Orthopedic Physical Assessment, 6th ed.', s: 'Elsevier Saunders', y: 2014, k: 'book' },
    beauchamp2019: { a: 'Beauchamp TL, Childress JF.', t: 'Principles of Biomedical Ethics, 8th ed.', s: 'Oxford University Press', y: 2019, k: 'book' },
    campbell2020: { a: 'Urry LA, Cain ML, Wasserman SA, Minorsky PV, Orr RB.', t: 'Campbell Biology, 12th ed.', s: 'Pearson', y: 2020, k: 'book' },
    huang2018: { a: '黄晓琳, 燕铁斌 (主编)', t: '康复医学 (第6版)', s: '人民卫生出版社', y: 2018, k: 'book' },
    /* ── guidelines & official documents ──────────────────────────────── */
    panchal2020: { a: 'Panchal AR, Bartos JA, Cabañas JG, et al.', t: 'Part 3: Adult Basic and Advanced Life Support: 2020 American Heart Association Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care', s: 'Circulation 142(16 Suppl 2):S366–S468', y: 2020 },
    singletary2020: { a: 'Singletary EM, Zideman DA, Bendall JC, et al.', t: '2020 International Consensus on First Aid Science With Treatment Recommendations', s: 'Circulation 142(16 Suppl 1):S284–S334', y: 2020 },
    nice2016: { a: 'National Institute for Health and Care Excellence (NICE)', t: 'Low back pain and sciatica in over 16s: assessment and management (NG59)', s: 'NICE guideline', y: 2016, k: 'doc' },
    bull2020: { a: 'Bull FC, Al-Ansari SS, Biddle S, et al.', t: 'World Health Organization 2020 guidelines on physical activity and sedentary behaviour', s: 'Br J Sports Med 54(24):1451–1462', y: 2020 },
    wada2021: { a: 'World Anti-Doping Agency', t: 'World Anti-Doping Code 2021', s: 'WADA, Montreal', y: 2021, k: 'doc' },
    apta2014: { a: 'American Physical Therapy Association', t: 'Guide to Physical Therapist Practice 3.0', s: 'APTA, Alexandria VA', y: 2014, k: 'doc' },
    fsbpt: { a: 'Federation of State Boards of Physical Therapy', t: 'National Physical Therapy Examination (NPTE): content outline for physical therapists', s: 'FSBPT', y: 'n.d.', k: 'doc' },
    who2007: { a: 'World Health Organization', t: 'WHO International Standard Terminologies on Traditional Medicine in the Western Pacific Region', s: 'WHO Regional Office for the Western Pacific', y: 2007, k: 'doc' },
    who2013: { a: 'World Health Organization', t: 'WHO Traditional Medicine Strategy 2014–2023', s: 'WHO, Geneva', y: 2013, k: 'doc' },
    ibo2024: { a: 'International Baccalaureate Organization', t: 'Diploma Programme Sports, Exercise and Health Science guide (first assessment 2026)', s: 'IBO, Geneva', y: 2024, k: 'doc' },
    cee: { a: 'Center for Excellence in Education', t: 'USA Biology Olympiad (USABO): program and exam information', s: 'CEE, McLean VA', y: 'n.d.', k: 'doc' },
    /* ── position stands & consensus statements ───────────────────────── */
    garber2011: { a: 'Garber CE, Blissmer B, Deschenes MR, et al.', t: 'Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults', s: 'Med Sci Sports Exerc 43(7):1334–1359', y: 2011 },
    acsm2009: { a: 'American College of Sports Medicine', t: 'Progression models in resistance training for healthy adults', s: 'Med Sci Sports Exerc 41(3):687–708', y: 2009 },
    thomas2016: { a: 'Thomas DT, Erdman KA, Burke LM.', t: 'American College of Sports Medicine Joint Position Statement: Nutrition and Athletic Performance', s: 'Med Sci Sports Exerc 48(3):543–568', y: 2016 },
    jager2017: { a: 'Jäger R, Kerksick CM, Campbell BI, et al.', t: 'International Society of Sports Nutrition Position Stand: protein and exercise', s: 'J Int Soc Sports Nutr 14:20', y: 2017 },
    kerksick2017: { a: 'Kerksick CM, Arent S, Schoenfeld BJ, et al.', t: 'International Society of Sports Nutrition position stand: nutrient timing', s: 'J Int Soc Sports Nutr 14:33', y: 2017 },
    kreider2017: { a: 'Kreider RB, Kalman DS, Antonio J, et al.', t: 'International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine', s: 'J Int Soc Sports Nutr 14:18', y: 2017 },
    guest2021: { a: 'Guest NS, VanDusseldorp TA, Nelson MT, et al.', t: 'International Society of Sports Nutrition position stand: caffeine and exercise performance', s: 'J Int Soc Sports Nutr 18(1):1', y: 2021 },
    sawka2007: { a: 'Sawka MN, Burke LM, Eichner ER, et al.', t: 'American College of Sports Medicine position stand: exercise and fluid replacement', s: 'Med Sci Sports Exerc 39(2):377–390', y: 2007 },
    maughan2018: { a: 'Maughan RJ, Burke LM, Dvorak J, et al.', t: 'IOC consensus statement: dietary supplements and the high-performance athlete', s: 'Br J Sports Med 52(7):439–455', y: 2018 },
    mountjoy2018: { a: 'Mountjoy M, Sundgot-Borgen JK, Burke LM, et al.', t: 'IOC consensus statement on relative energy deficiency in sport (RED-S): 2018 update', s: 'Br J Sports Med 52(11):687–697', y: 2018 },
    patricios2023: { a: 'Patricios JS, Schneider KJ, Dvorak J, et al.', t: 'Consensus statement on concussion in sport: the 6th International Conference on Concussion in Sport–Amsterdam, October 2022', s: 'Br J Sports Med 57(11):695–711', y: 2023 },
    kellmann2018: { a: 'Kellmann M, Bertollo M, Bosquet L, et al.', t: 'Recovery and performance in sport: consensus statement', s: 'Int J Sports Physiol Perform 13(2):240–245', y: 2018 },
    soligard2016: { a: 'Soligard T, Schwellnus M, Alonso JM, et al.', t: 'How much is too much? (Part 1) International Olympic Committee consensus statement on load in sport and risk of injury', s: 'Br J Sports Med 50(17):1030–1041', y: 2016 },
    ardern2016: { a: 'Ardern CL, Glasgow P, Schneiders A, et al.', t: '2016 Consensus statement on return to sport from the First World Congress in Sports Physical Therapy, Bern', s: 'Br J Sports Med 50(14):853–864', y: 2016 },
    crossley2016: { a: 'Crossley KM, van Middelkoop M, Callaghan MJ, et al.', t: '2016 Patellofemoral pain consensus statement from the 4th International Patellofemoral Pain Research Retreat, Manchester. Part 2: recommended physical interventions', s: 'Br J Sports Med 50(14):844–852', y: 2016 },
    weir2015: { a: 'Weir A, Brukner P, Delahunt E, et al.', t: 'Doha agreement meeting on terminology and definitions in groin pain in athletes', s: 'Br J Sports Med 49(12):768–774', y: 2015 },
    casa2015: { a: 'Casa DJ, DeMartini JK, Bergeron MF, et al.', t: "National Athletic Trainers' Association position statement: exertional heat illnesses", s: 'J Athl Train 50(9):986–1000', y: 2015 },
    watson2015: { a: 'Watson NF, Badr MS, Belenky G, et al.', t: 'Recommended amount of sleep for a healthy adult: a joint consensus statement of the American Academy of Sleep Medicine and Sleep Research Society', s: 'Sleep 38(6):843–844', y: 2015 },
    vuurberg2018: { a: 'Vuurberg G, Hoorntje A, Wink LM, et al.', t: 'Diagnosis, treatment and prevention of ankle sprains: update of an evidence-based clinical guideline', s: 'Br J Sports Med 52(15):956', y: 2018 },
    martin2014: { a: 'Martin RL, Davenport TE, Reischl SF, et al.', t: 'Heel pain—plantar fasciitis: revision 2014 (clinical practice guideline)', s: 'J Orthop Sports Phys Ther 44(11):A1–A33', y: 2014 },
    martin2018: { a: 'Martin RL, Chimenti R, Cuddeford T, et al.', t: 'Achilles pain, stiffness, and muscle power deficits: midportion Achilles tendinopathy revision 2018', s: 'J Orthop Sports Phys Ther 48(5):A1–A38', y: 2018 },
    blanpied2017: { a: 'Blanpied PR, Gross AR, Elliott JM, et al.', t: 'Neck pain: revision 2017 (clinical practice guideline)', s: 'J Orthop Sports Phys Ther 47(7):A1–A83', y: 2017 },
    kelley2013: { a: 'Kelley MJ, Shaffer MA, Kuhn JE, et al.', t: 'Shoulder pain and mobility deficits: adhesive capsulitis (clinical practice guideline)', s: 'J Orthop Sports Phys Ther 43(5):A1–A31', y: 2013 },
    /* ── studies & reviews ────────────────────────────────────────────── */
    gastin2001: { a: 'Gastin PB.', t: 'Energy system interaction and relative contribution during maximal exercise', s: 'Sports Med 31(10):725–741', y: 2001 },
    joyner2008: { a: 'Joyner MJ, Coyle EF.', t: 'Endurance exercise performance: the physiology of champions', s: 'J Physiol 586(1):35–44', y: 2008 },
    schoenfeld2010: { a: 'Schoenfeld BJ.', t: 'The mechanisms of muscle hypertrophy and their application to resistance training', s: 'J Strength Cond Res 24(10):2857–2872', y: 2010 },
    dubois2020: { a: 'Dubois B, Esculier JF.', t: 'Soft-tissue injuries simply need PEACE and LOVE', s: 'Br J Sports Med 54(2):72–73', y: 2020 },
    bleakley2012: { a: 'Bleakley CM, Glasgow P, MacAuley DC.', t: 'PRICE needs updating, should we call the POLICE?', s: 'Br J Sports Med 46(4):220–221', y: 2012 },
    khan2009: { a: 'Khan KM, Scott A.', t: "Mechanotherapy: how physical therapists' prescription of exercise promotes tissue repair", s: 'Br J Sports Med 43(4):247–252', y: 2009 },
    malanga2015: { a: 'Malanga GA, Yan N, Stark J.', t: 'Mechanisms and efficacy of heat and cold therapies for musculoskeletal injury', s: 'Postgrad Med 127(1):57–65', y: 2015 },
    paoloni2009: { a: 'Paoloni JA, Milne C, Orchard J, Hamilton B.', t: 'Non-steroidal anti-inflammatory drugs in sports medicine: guidelines for practical but sensible use', s: 'Br J Sports Med 43(11):863–865', y: 2009 },
    lauersen2014: { a: 'Lauersen JB, Bertelsen DM, Andersen LB.', t: 'The effectiveness of exercise interventions to prevent sports injuries: a systematic review and meta-analysis of randomised controlled trials', s: 'Br J Sports Med 48(11):871–877', y: 2014 },
    gabbett2016: { a: 'Gabbett TJ.', t: 'The training—injury prevention paradox: should athletes be training smarter and harder?', s: 'Br J Sports Med 50(5):273–280', y: 2016 },
    bachmann2003: { a: 'Bachmann LM, Kolb E, Koller MT, Steurer J, ter Riet G.', t: 'Accuracy of Ottawa ankle rules to exclude fractures of the ankle and mid-foot: systematic review', s: 'BMJ 326(7386):417', y: 2003 },
    mcguine2006: { a: 'McGuine TA, Keene JS.', t: 'The effect of a balance training program on the risk of ankle sprains in high school athletes', s: 'Am J Sports Med 34(7):1103–1111', y: 2006 },
    alfredson1998: { a: 'Alfredson H, Pietilä T, Jonsson P, Lorentzon R.', t: 'Heavy-load eccentric calf muscle training for the treatment of chronic Achilles tendinosis', s: 'Am J Sports Med 26(3):360–366', y: 1998 },
    grindem2016: { a: 'Grindem H, Snyder-Mackler L, Moksnes H, Engebretsen L, Risberg MA.', t: 'Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction: the Delaware-Oslo ACL cohort study', s: 'Br J Sports Med 50(13):804–808', y: 2016 },
    malliaras2015: { a: 'Malliaras P, Cook J, Purdam C, Rio E.', t: 'Patellar tendinopathy: clinical diagnosis, load management, and advice for challenging case presentations', s: 'J Orthop Sports Phys Ther 45(11):887–898', y: 2015 },
    askling2013: { a: 'Askling CM, Tengvar M, Thorstensson A.', t: 'Acute hamstring injuries in Swedish elite football: a prospective randomised controlled clinical trial comparing two rehabilitation protocols', s: 'Br J Sports Med 47(15):953–959', y: 2013 },
    vandyk2019: { a: 'van Dyk N, Behan FP, Whiteley R.', t: 'Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries: a systematic review and meta-analysis of 8459 athletes', s: 'Br J Sports Med 53(21):1362–1370', y: 2019 },
    soligard2008: { a: 'Soligard T, Myklebust G, Steffen K, et al.', t: 'Comprehensive warm-up programme to prevent injuries in young female footballers: cluster randomised controlled trial', s: 'BMJ 337:a2469', y: 2008 },
    coombes2015: { a: 'Coombes BK, Bisset L, Vicenzino B.', t: 'Management of lateral elbow tendinopathy: one size does not fit all', s: 'J Orthop Sports Phys Ther 45(11):938–949', y: 2015 },
    foster2018: { a: 'Foster NE, Anema JR, Cherkin D, et al.', t: 'Prevention and treatment of low back pain: evidence, challenges, and promising directions', s: 'Lancet 391(10137):2368–2383', y: 2018 },
    fullagar2015: { a: 'Fullagar HHK, Skorski S, Duffield R, et al.', t: 'Sleep and athletic performance: the effects of sleep loss on exercise performance, and physiological and cognitive responses to exercise', s: 'Sports Med 45(2):161–186', y: 2015 },
    mah2011: { a: 'Mah CD, Mah KE, Kezirian EJ, Dement WC.', t: 'The effects of sleep extension on the athletic performance of collegiate basketball players', s: 'Sleep 34(7):943–950', y: 2011 },
    vancauter1996: { a: 'Van Cauter E, Plat L.', t: 'Physiology of growth hormone secretion during sleep', s: 'J Pediatr 128(5 Pt 2):S32–S37', y: 1996 },
    frost2003: { a: 'Frost HM.', t: "Bone's mechanostat: a 2003 update", s: 'Anat Rec A 275(2):1081–1101', y: 2003 },
    sophia2009: { a: 'Sophia Fox AJ, Bedi A, Rodeo SA.', t: 'The basic science of articular cartilage: structure, composition, and function', s: 'Sports Health 1(6):461–468', y: 2009 },
    ker1987: { a: 'Ker RF, Bennett MB, Bibby SR, Kester RC, Alexander RM.', t: 'The spring in the arch of the human foot', s: 'Nature 325:147–149', y: 1987 },
    guyatt2008: { a: 'Guyatt GH, Oxman AD, Vist GE, et al.', t: 'GRADE: an emerging consensus on rating quality of evidence and strength of recommendations', s: 'BMJ 336(7650):924–926', y: 2008 },
    burns2011: { a: 'Burns PB, Rohrich RJ, Chung KC.', t: 'The levels of evidence and their role in evidence-based medicine', s: 'Plast Reconstr Surg 128(1):305–310', y: 2011 },
    wallace1951: { a: 'Wallace AB.', t: 'The exposure treatment of burns', s: 'Lancet 1(6653):501–504', y: 1951 }
  };
  Object.keys(R).forEach(function (id) {
    var r = R[id]; r.id = id;
    if (!r.k) r.url = 'https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(r.t);
  });

  /* ── "Did you know?" — each tip is backed by the source in r ─────────── */
  var T = [
    ['The Achilles tendon and the arch of the foot work like springs, handing back a large share of the energy of every running stride.', '跟腱和足弓像弹簧一样，把跑步每一步的大部分能量“还”回来。', 'ker1987'],
    ['You get stronger while you recover: training is the stress, recovery is when the body adapts.', '变强发生在恢复时：训练是压力，恢复时身体才会适应。', 'kellmann2018'],
    ['A resting heart pumps about 5 litres a minute; an elite endurance athlete at full effort can pump well over 30.', '静息时心脏每分钟泵血约 5 升；顶尖耐力运动员全力时可远超 30 升。', 'joyner2008'],
    ['Growth hormone is released mostly in deep sleep, early in the night.', '生长激素主要在前半夜的深睡眠中分泌。', 'vancauter1996'],
    ['Immediate CPR can double or triple the chance of surviving a cardiac arrest.', '立即进行心肺复苏可使心脏骤停的存活几率提高两到三倍。', 'panchal2020'],
    ['Bone is living tissue: it adds strength where it is loaded and loses it where it is not.', '骨骼是活组织：受力的地方变强，不受力的地方变弱。', 'frost2003'],
    ['Losing about 2% of your body weight in sweat is enough to hurt endurance performance.', '出汗损失约 2% 的体重，就足以影响耐力表现。', 'sawka2007'],
    ['Balance training cut ankle sprains in high-school athletes by about a third.', '平衡训练使高中运动员的踝关节扭伤减少约三分之一。', 'mcguine2006'],
    ['Articular cartilage has no blood vessels, which is why it heals so slowly.', '关节软骨没有血管，所以愈合非常缓慢。', 'sophia2009'],
    ['PEACE & LOVE updates RICE: protect and load gradually instead of just resting and icing.', 'PEACE & LOVE 更新了 RICE：保护并逐步加载，而不仅仅是休息和冰敷。', 'dubois2020'],
    ['The Ottawa ankle rules rule out an ankle fracture with close to 100% sensitivity, saving many X-rays.', '渥太华踝关节规则排除骨折的敏感度接近 100%，可省去许多 X 光检查。', 'bachmann2003'],
    ['After a suspected concussion, no return to play on the same day.', '疑似脑震荡后，当天不得重返赛场。', 'patricios2023'],
    ['Sharp spikes in training load raise injury risk more than high but steady load.', '训练负荷骤增比稳定的高负荷更容易导致受伤。', 'gabbett2016'],
    ['Most athletes do well on 1.4–2.0 g of protein per kg of body weight a day.', '大多数运动员每天每公斤体重摄入 1.4–2.0 克蛋白质即可。', 'jager2017'],
    ['Spreading protein across meals (about 20–40 g every 3–4 hours) supports muscle repair.', '把蛋白质分配到各餐（每 3–4 小时约 20–40 克）有助于肌肉修复。', 'jager2017'],
    ['Adults need 7 or more hours of sleep a night for health.', '成年人每晚需要 7 小时或以上的睡眠。', 'watson2015'],
    ['Basketball players who slept more for several weeks sprinted faster and shot more accurately.', '篮球运动员连续数周增加睡眠后，冲刺更快、投篮更准。', 'mah2011'],
    ['Adults should aim for 150–300 minutes of moderate activity every week.', '成年人每周应进行 150–300 分钟中等强度活动。', 'bull2020'],
    ['Muscle-strengthening work on 2 or more days a week is part of the WHO guidelines.', '每周 2 天或以上的力量训练是世卫组织建议的一部分。', 'bull2020'],
    ['About 3–6 mg of caffeine per kg of body weight improves endurance performance for most people.', '每公斤体重约 3–6 毫克咖啡因可提升大多数人的耐力表现。', 'guest2021'],
    ['Creatine is one of the most studied supplements, with strong evidence for high-intensity work.', '肌酸是研究最多的补剂之一，对高强度运动有充分证据。', 'kreider2017'],
    ['Supplements can be contaminated with banned substances; athletes are responsible for what they take.', '补剂可能混有违禁物质；运动员要为自己服用的东西负责。', 'maughan2018'],
    ['Eating too little for your training (low energy availability) can weaken bones and disrupt hormones.', '摄入不足以支撑训练（低能量可用性）会削弱骨骼、扰乱激素。', 'mountjoy2018'],
    ['Heavy slow eccentric calf training is a classic treatment for Achilles tendinopathy.', '大负荷离心提踵训练是跟腱病的经典疗法。', 'alfredson1998'],
    ['Adding the Nordic hamstring exercise to prevention programmes roughly halves hamstring injuries.', '在预防计划中加入北欧腘绳肌训练，可使腘绳肌损伤减少约一半。', 'vandyk2019'],
    ['A structured warm-up like the FIFA 11+ cut injuries by about a third in young footballers.', '像 FIFA 11+ 这样的系统热身，使青少年足球运动员受伤减少约三分之一。', 'soligard2008'],
    ['Strength training prevents sports injuries far better than stretching does.', '力量训练预防运动损伤的效果远好于拉伸。', 'lauersen2014'],
    ['Passing return-to-sport tests after ACL reconstruction cut knee reinjury by 84%.', '前交叉韧带重建后通过重返运动测试，可使再次受伤减少 84%。', 'grindem2016'],
    ['For exertional heat stroke: cool first, transport second. Cold-water immersion is the fastest way.', '劳力性热射病：先降温，后转运。冷水浸泡降温最快。', 'casa2015'],
    ['The rule of nines splits the body into 9% areas to estimate how much skin a burn covers.', '“九分法”把身体分成若干 9% 的区域，用来估算烧伤面积。', 'wallace1951'],
    ['Cool a burn under clean running water for at least 10 minutes.', '用干净的流水冲洗烧伤处至少 10 分钟。', 'singletary2020'],
    ['For heavy bleeding, firm direct pressure on the wound comes first.', '大量出血时，首先要用力直接按压伤口。', 'singletary2020'],
    ['For a nosebleed, lean forward and pinch the soft part of the nose for 10–15 minutes.', '流鼻血时，身体前倾，捏住鼻翼软处 10–15 分钟。', 'tintinalli2020'],
    ['All three energy systems work together; aerobic energy takes over after roughly 75 seconds of all-out effort.', '三大供能系统协同工作；全力运动约 75 秒后有氧供能占主导。', 'gastin2001'],
    ['Endurance training makes each heartbeat pump more blood, so the resting heart rate falls.', '耐力训练让每次心跳泵出更多血液，因此静息心率下降。', 'kenney2020'],
    ['Muscles grow from mechanical tension, metabolic stress and muscle damage.', '肌肉增长来自机械张力、代谢压力和肌肉损伤。', 'schoenfeld2010'],
    ['Progressive overload: the body only keeps adapting if the challenge keeps growing.', '渐进超负荷：只有挑战不断增加，身体才会持续适应。', 'acsm2009'],
    ['Your skin is the largest organ by surface area, about 2 square metres in an adult.', '皮肤是面积最大的器官，成年人约 2 平方米。', 'tortora2017'],
    ['Signals in thick myelinated nerves travel at up to about 120 metres per second.', '粗的有髓神经纤维传导速度可达每秒约 120 米。', 'kandel2021'],
    ['GRADE rates the certainty of evidence as high, moderate, low or very low.', 'GRADE 把证据的确定性分为高、中、低、极低四级。', 'guyatt2008'],
    ['Four principles guide medical ethics: autonomy, beneficence, non-maleficence and justice.', '医学伦理有四大原则：自主、行善、不伤害和公正。', 'beauchamp2019'],
    ['Under anti-doping rules, athletes are strictly liable for any banned substance found in their body.', '按照反兴奋剂规则，体内发现任何违禁物质，运动员都要承担严格责任。', 'wada2021'],
    ['With low back pain, staying active beats bed rest.', '腰痛时，保持活动比卧床休息更好。', 'nice2016'],
    ['Frozen shoulder passes through freezing, frozen and thawing phases and can take 1–3 years.', '冻结肩经历冻结期、僵硬期和解冻期，可能持续 1–3 年。', 'kelley2013'],
    ['For runner\'s knee, hip and knee strengthening together works better than knee exercises alone.', '治疗跑步膝时，髋部和膝部一起加强比只练膝部效果更好。', 'crossley2016'],
    ['Heat eases stiffness; cold eases pain and swelling right after an injury.', '热敷缓解僵硬；冷敷缓解受伤后即时的疼痛和肿胀。', 'malanga2015'],
    ['Painkillers like ibuprofen are for short courses: overuse may slow tissue healing.', '布洛芬等止痛药应短期使用：过度使用可能延缓组织愈合。', 'paoloni2009'],
    ['Return to sport is a continuum: return to participation, then to sport, then to performance.', '重返运动是一个连续过程：先恢复参与，再回到运动，最后恢复竞技表现。', 'ardern2016'],
    ['Too little training load can raise injury risk as well as too much.', '训练负荷过少和过多一样，都会增加受伤风险。', 'soligard2016'],
    ['Exercise is a signal for tissue repair: loading tells tendons and muscles how to rebuild.', '运动是组织修复的信号：负荷告诉肌腱和肌肉如何重建。', 'khan2009']
  ];
  var TIPS = T.map(function (x) { return { en: x[0], zh: x[1], ref: x[2] }; });

  /* ── the Vitaxamine knowledge base, section by section ────────────────── */
  var KB = {
    'rice-vs-peace-love': ['dubois2020', 'bleakley2012'],
    'bleeding-control': ['singletary2020', 'tintinalli2020'],
    'burns': ['singletary2020', 'wallace1951', 'tintinalli2020'],
    'nosebleed': ['tintinalli2020'],
    'heat-illness': ['casa2015'],
    'dehydration': ['sawka2007', 'thomas2016'],
    'red-flags-emergency': ['tintinalli2020', 'panchal2020'],
    'ankle-sprain': ['vuurberg2018', 'bachmann2003'],
    'ankle-sprain-rehab': ['vuurberg2018', 'mcguine2006'],
    'plantar-fasciitis': ['martin2014'],
    'achilles-tendinopathy': ['martin2018', 'alfredson1998'],
    'shin-splints': ['brukner2017'],
    'acl-injury': ['grindem2016', 'brukner2017'],
    'meniscus-injury': ['brukner2017', 'magee2014'],
    'mcl-injury': ['brukner2017'],
    'runner-knee': ['crossley2016'],
    'jumpers-knee': ['malliaras2015'],
    'hamstring-strain': ['askling2013', 'vandyk2019'],
    'quad-strain': ['brukner2017'],
    'groin-strain': ['weir2015', 'brukner2017'],
    'it-band-syndrome': ['brukner2017'],
    'hip-flexor-strain': ['brukner2017'],
    'low-back-strain': ['nice2016', 'foster2018'],
    'sciatica': ['nice2016'],
    'neck-strain-whiplash': ['blanpied2017'],
    'rotator-cuff': ['brukner2017', 'magee2014'],
    'shoulder-impingement': ['brukner2017'],
    'shoulder-dislocation': ['brukner2017', 'tintinalli2020'],
    'frozen-shoulder': ['kelley2013'],
    'tennis-elbow': ['coombes2015'],
    'wrist-sprain': ['tintinalli2020', 'brukner2017'],
    'head-injury-concussion': ['patricios2023'],
    'healing-phases': ['khan2009', 'brukner2017'],
    'return-to-sport': ['ardern2016', 'grindem2016'],
    'load-management': ['soligard2016', 'gabbett2016'],
    'ice-vs-heat': ['malanga2015', 'bleakley2012'],
    'nsaids': ['paoloni2009', 'dubois2020'],
    'stretching-vs-strengthening': ['lauersen2014'],
    'rest-vs-movement': ['khan2009', 'dubois2020'],
    'fracture-vs-sprain': ['bachmann2003', 'tintinalli2020'],
    'swelling-management': ['dubois2020', 'bleakley2012'],
    'nutrition-recovery': ['thomas2016', 'jager2017'],
    'sleep-recovery': ['watson2015', 'fullagar2015'],
    'anatomy-basics': ['tortora2017'],
    'overuse-vs-acute': ['soligard2016', 'brukner2017']
  };

  /* ── pages and textbook chapters ──────────────────────────────────────── */
  var PAGES = {
    ch1: ['gastin2001', 'mcardle2015', 'kenney2020', 'tortora2017'],
    ch2: ['kandel2021', 'tortora2017', 'patricios2023'],
    ch3: ['hall2021', 'kenney2020', 'joyner2008'],
    ch4: ['tortora2017', 'tintinalli2020', 'wallace1951', 'singletary2020'],
    ch5: ['garber2011', 'acsm2009', 'haff2016', 'schoenfeld2010', 'acsm2021'],
    ch6: ['brukner2017', 'khan2009', 'dubois2020', 'soligard2016'],
    ch7: ['kellmann2018', 'fullagar2015', 'watson2015', 'mah2011'],
    ch8: ['thomas2016', 'jager2017', 'kerksick2017', 'sawka2007', 'mountjoy2018'],
    ch9: ['maughan2018', 'kreider2017', 'guest2021', 'guyatt2008', 'burns2011', 'wada2021'],
    ch10: ['beauchamp2019', 'wada2021', 'apta2014'],
    ch11: ['apta2014', 'fsbpt'],
    ch12: ['magee2014', 'acsm2021'],
    ch13: ['who2007', 'who2013'],
    ch14: ['panchal2020', 'singletary2020', 'casa2015', 'patricios2023', 'tintinalli2020'],
    'ib-sehs': ['ibo2024', 'kenney2020', 'tortora2017', 'haff2016', 'mcardle2015'],
    'g10-bio': ['campbell2020', 'tortora2017'],
    'usabo': ['campbell2020', 'cee'],
    'exam': ['fsbpt', 'apta2014', 'magee2014', 'brukner2017'],
    'cn-cert': ['huang2018', 'brukner2017', 'magee2014'],
    'vitaxamine': ['brukner2017', 'tintinalli2020', 'singletary2020', 'dubois2020', 'patricios2023']
  };

  function cite(id) {                          /* one line of text, AMA-ish */
    var r = R[id]; if (!r) return '';
    var p = function (x) { return String(x).replace(/\.\s*$/, ''); };
    return p(r.a) + '. ' + p(r.t) + '. ' + p(r.s) + (r.k === 'book' ? '; ' : ', ') + p(r.y) + '.';
  }
  function short(id) {                         /* "Sawka et al., 2007" */
    var r = R[id]; if (!r) return '';
    var first = r.a.split(/[,.;(]/)[0].trim().replace(/\s+[A-Z]{1,3}$/, '');
    var many = /,|et al|&| and /.test(r.a.replace(first, '')) && !/^(American|World|National|Federation|International|Center)/.test(r.a);
    return first + (many ? ' et al.' : '') + ', ' + r.y;
  }
  window.VT_REFS = R;
  window.VT_TIPS = TIPS;
  window.VT_KB_REFS = KB;
  window.VT_PAGE_REFS = PAGES;
  window.VT_CITE = { full: cite, short: short };
})();

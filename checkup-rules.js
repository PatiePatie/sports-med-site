/* ═══ Checkup — rule-based triage (no AI) ═══
   Education only. Never a medical diagnosis.

   When the user picks a body part and ticks symptoms from the list, the
   result comes from these rules, not from the AI: every condition lists the
   symptoms that point to it (with weights), whether it usually starts with an
   injury or builds up, and a care plan. Red-flag symptoms and the answers to
   "how did it start / how bad / how long" set the triage level. Only the
   "Other" option (free text) sends the case to the AI.

   Exposes window.CheckupRules = { run(partId, tickedIdx[], answers) → result }
   Symptom indexes match PARTS[].sym in checkup.js. */
(function () {
  'use strict';

  /* care plans: [title EN, title ZH, steps [[en, zh], …]] */
  var CARE = {
    acute: ['Early injury care (PEACE → LOVE)', '急性损伤处理（PEACE → LOVE）', [
      ['First 1–3 days: protect it — relative rest, avoid the moves that hurt.', '前 1–3 天：保护——相对休息，避免引起疼痛的动作。'],
      ['Elevate and use light compression to limit swelling.', '抬高患处并轻度加压，减轻肿胀。'],
      ['Ice 10–15 min at a time can ease pain; skip anti-inflammatory tablets early unless a doctor advises them.', '每次冰敷 10–15 分钟可缓解疼痛；早期如无医嘱尽量不用消炎止痛药。'],
      ['After that, load it gradually: pain up to about 3/10 during activity is OK if it settles by the next day.', '之后循序加载：活动中疼痛不超过约 3/10、次日能缓解即可。'],
      ['Keep fit with pain-free cardio, and add strength and balance work as it settles.', '用无痛的有氧运动保持体能，症状缓解后加入力量与平衡训练。']]],
    overuse: ['Load management for overuse', '过劳性损伤的负荷管理', [
      ['Cut the activity that flares it by about a third to a half — don’t stop moving completely.', '把诱发疼痛的活动减少约三分之一到一半——不要完全停止活动。'],
      ['Use the 24-hour rule: pain ≤3/10 during exercise and back to normal by next morning.', '遵循 24 小时原则：运动中疼痛 ≤3/10，次日早晨恢复正常。'],
      ['Strengthen the area slowly (e.g. slow, heavy-ish exercises for tendons) 3 times a week.', '每周 3 次循序加强该部位力量（如肌腱的慢速较大负荷练习）。'],
      ['Check the cause: sudden jumps in training, technique, footwear or equipment, and sleep.', '查找原因：训练量突增、技术动作、鞋具器材以及睡眠。']]],
    nerve: ['Settling an irritated nerve', '缓解神经刺激', [
      ['Avoid positions that bring on tingling (long slouching, sleeping on the arm, heavy overhead loads).', '避免诱发麻木的姿势（长时间含胸、压着手臂睡、过顶大重量）。'],
      ['Keep gently moving — short walks and easy range-of-motion help more than bed rest.', '保持温和活动——短距离步行和轻柔的关节活动比卧床更有帮助。'],
      ['Watch for spreading numbness or real weakness; that needs a professional check.', '留意麻木范围扩大或真正的无力，这需要专业检查。']]],
    concussion: ['Possible concussion — stop and rest', '疑似脑震荡——立即停止并休息', [
      ['Stop playing today. No return to sport on the same day, even if you feel fine.', '今天停止运动。即使感觉良好，当天也不能返回比赛。'],
      ['Rest for 24–48 hours: light walking is fine, limit screens and bright light.', '休息 24–48 小时：可轻度散步，减少屏幕和强光刺激。'],
      ['Return to school first, then sport step by step — only once symptom-free and cleared by a clinician.', '先回归学习，再逐步回归运动——须症状消失并经医生许可。'],
      ['Someone should stay with you for the first few hours.', '最初几小时应有人陪伴。']]],
    posture: ['Posture and muscle tension', '姿势与肌肉紧张', [
      ['Take a movement break every 30–45 minutes of sitting or screen time.', '每坐或看屏幕 30–45 分钟起身活动一次。'],
      ['Heat and gentle mobility (shoulder rolls, thoracic rotations) ease knots.', '热敷和温和的活动（耸肩、胸椎旋转）可缓解肌肉结节。'],
      ['Strengthen the upper back and core a few times a week.', '每周数次加强上背和核心力量。']]],
    bruise: ['Bruise / contusion care', '挫伤处理', [
      ['First 24–48 h: ice 10–15 min, light compression, elevate.', '前 24–48 小时：冰敷 10–15 分钟、轻度加压、抬高。'],
      ['Keep gently moving through a comfortable range — no deep massage or heat on it early.', '在舒适范围内轻柔活动——早期不要深度按摩或热敷。'],
      ['A hard, growing lump or loss of movement needs checking.', '若出现变硬、增大的肿块或活动受限，应就医检查。']]],
    soreness: ['Tightness, cramp and soreness', '僵硬、抽筋与酸痛', [
      ['Muscle soreness peaks 24–72 h after hard or new exercise and fades on its own.', '肌肉酸痛在高强度或新训练后 24–72 小时达到高峰，会自行消退。'],
      ['Easy movement, sleep, fluids and food help; gentle stretching for cramps.', '轻松活动、睡眠、补水与进食有帮助；抽筋时轻柔拉伸。'],
      ['Build training up gradually next time (the repeated-bout effect protects you).', '下次循序增加训练量（重复训练效应会保护你）。']]],
    gut: ['Tummy trouble', '胃肠不适', [
      ['Sip fluids, eat bland food, and rest.', '少量多次补水，清淡饮食，休息。'],
      ['Side stitches ease if you slow down and breathe deeply; avoid big meals right before exercise.', '岔气时放慢速度并深呼吸即可缓解；运动前避免大量进食。'],
      ['Pain after a blow to the belly is different — see "urgent" below.', '腹部受撞击后的疼痛不同——见下方“紧急”提示。']]]
  };

  /* conditions per body part: [EN name, ZH name, {symIdx: weight}, onset, care, chapter, note EN, note ZH, level]
     onset: 'a' acute (injury), 'g' gradual, '' either.  level: 0 self-care, 1 see soon, 2 urgent */
  var C = {
    head: [
      ['Concussion', '脑震荡', { 0: 2, 1: 3, 2: 3, 3: 4 }, 'a', 'concussion', 6, 'A brain injury from a knock or jolt. Symptoms can appear hours later.', '撞击或震荡造成的脑损伤，症状可能数小时后才出现。', 1],
      ['Scalp bruise', '头皮挫伤', { 4: 4, 0: 1 }, 'a', 'bruise', 6, 'A bump where you were hit, without other symptoms, is usually a bruise.', '受撞处鼓包且无其他症状，通常只是挫伤。', 0],
      ['Tension-type headache', '紧张性头痛', { 0: 3, 1: 1 }, 'g', 'posture', 7, 'Band-like pressure, often from poor sleep, stress, screens, or not drinking enough.', '带状压迫感，常与睡眠差、压力、屏幕或饮水不足有关。', 0],
      ['Migraine-type headache', '偏头痛样头痛', { 0: 3, 2: 3 }, 'g', 'posture', 7, 'Throbbing headache with light sensitivity; see a doctor if it is new or frequent.', '搏动性头痛伴畏光；如为新发或频繁发作，请就医。', 0]],
    neck: [
      ['Neck muscle strain / wry neck (落枕)', '颈部肌肉拉伤 / 落枕', { 0: 3, 1: 2 }, '', 'posture', 6, 'Very common and settles in days to a couple of weeks.', '非常常见，数天到两周内会缓解。', 0],
      ['Pinched nerve (cervical radiculopathy)', '神经根受压（颈神经根病）', { 2: 3, 4: 4, 1: 1 }, '', 'nerve', 2, 'An irritated nerve root sends pain, pins-and-needles or weakness down the arm.', '神经根受刺激，可沿手臂出现疼痛、麻刺或无力。', 1],
      ['Whiplash-type strain', '挥鞭样损伤', { 0: 2, 1: 2, 3: 2 }, 'a', 'acute', 6, 'Neck strain after a sudden jolt, such as a tackle or collision.', '突然甩动（如被撞、擒抱）后的颈部拉伤。', 0],
      ['Posture-related neck pain', '姿势相关颈痛', { 0: 2, 3: 2 }, 'g', 'posture', 12, 'Builds up with long screen or study time.', '长时间看屏幕或学习后逐渐出现。', 0]],
    shoulder: [
      ['Rotator cuff tendinopathy / impingement', '肩袖肌腱病 / 撞击', { 0: 3, 1: 3, 3: 1 }, 'g', 'overuse', 6, 'Overhead sports and lifting overload the cuff tendons; pain on raising the arm.', '过顶运动和举重使肩袖肌腱过载，抬臂时疼痛。', 0],
      ['Rotator cuff tear', '肩袖撕裂', { 3: 4, 1: 2, 0: 1 }, '', 'overuse', 6, 'Real weakness lifting the arm, especially after a fall or at older ages.', '抬臂真正无力，尤其是摔倒后或年龄较大者。', 1],
      ['Labrum irritation / instability', '盂唇刺激 / 不稳', { 2: 3, 0: 1 }, '', 'overuse', 6, 'Clicking with a feeling the shoulder may slip, common in throwers.', '弹响并感觉肩膀要“滑出”，投掷项目常见。', 1],
      ['Dislocation, AC-joint sprain or fracture', '脱位、肩锁关节扭伤或骨折', { 4: 5 }, 'a', 'acute', 14, 'A visible deformity or bruising after a fall needs an X-ray.', '摔倒后出现明显畸形或淤青，需要拍 X 光。', 2]],
    elbow: [
      ['Tennis elbow (lateral elbow tendinopathy)', '网球肘（肱骨外上髁肌腱病）', { 0: 4 }, 'g', 'overuse', 6, 'Grip and wrist-extension overload of the outer-elbow tendon.', '握力与伸腕动作使外侧肘部肌腱过载。', 0],
      ['Golfer’s elbow (medial elbow tendinopathy)', '高尔夫球肘（肱骨内上髁肌腱病）', { 1: 4 }, 'g', 'overuse', 6, 'Overload of the inner-elbow tendons from gripping and throwing.', '握持和投掷使内侧肘部肌腱过载。', 0],
      ['Loose body or joint irritation', '关节游离体或关节刺激', { 2: 4 }, '', 'overuse', 12, 'Locking or catching means something may be getting stuck in the joint.', '卡锁或弹响说明关节内可能有东西卡住。', 1],
      ['Elbow bruise / bursitis', '肘部挫伤 / 滑囊炎', { 3: 4 }, 'a', 'bruise', 6, 'Swelling over the point of the elbow after a blow or fall.', '撞击或摔倒后肘尖部肿胀。', 0]],
    wrist: [
      ['Wrist sprain', '腕关节扭伤', { 0: 3, 1: 1 }, 'a', 'acute', 6, 'Ligament strain, usually from falling on an outstretched hand.', '韧带拉伤，通常因摔倒时手撑地。', 0],
      ['Possible scaphoid fracture', '疑似舟骨骨折', { 1: 4, 0: 1 }, 'a', 'acute', 14, 'Thumb-side tenderness after a fall can hide a fracture that X-rays may miss at first.', '摔倒后拇指侧压痛可能隐藏骨折，初次 X 光可能漏诊。', 1],
      ['De Quervain’s tenosynovitis', '桡骨茎突狭窄性腱鞘炎', { 1: 3, 0: 2 }, 'g', 'overuse', 6, 'Thumb-side tendon irritation from repetitive gripping or phone use.', '反复握持或用手机引起的拇指侧肌腱刺激。', 0],
      ['Carpal tunnel syndrome', '腕管综合征', { 3: 4, 2: 2 }, 'g', 'nerve', 2, 'Pressure on the median nerve: tingling in the thumb-side fingers, worse at night.', '正中神经受压：拇指侧手指麻刺，夜间加重。', 1]],
    hand: [
      ['Jammed / sprained finger', '手指戳伤 / 扭伤', { 0: 4 }, 'a', 'acute', 6, 'Common in ball sports; buddy-taping helps.', '球类运动常见；可用邻指固定。', 0],
      ['Finger fracture, dislocation or mallet finger', '手指骨折、脱位或锤状指', { 1: 5 }, 'a', 'acute', 14, 'A finger that looks bent or won’t straighten needs a splint from a professional.', '手指变形或无法伸直，需要专业夹板固定。', 1],
      ['Trigger finger', '扳机指', { 1: 3, 0: 1 }, 'g', 'overuse', 6, 'A tendon catches as the finger bends, then snaps straight.', '手指弯曲时肌腱卡住，随后弹直。', 0],
      ['Nerve compression', '神经受压', { 2: 4, 3: 2 }, 'g', 'nerve', 2, 'Numb or tingling fingers with weak grip come from a squeezed nerve.', '手指麻木、刺痛伴握力下降，源于神经受压。', 1]],
    chest: [
      ['Rib bruise or fracture', '肋骨挫伤或骨折', { 1: 4, 0: 2, 3: 2 }, 'a', 'acute', 14, 'Painful to breathe or cough after a hit — get it checked the same day. Fractures heal in about 6 weeks.', '受撞后呼吸或咳嗽疼痛——当天就医检查。骨折约 6 周愈合。', 1],
      ['Chest-wall strain / costochondritis', '胸壁拉伤 / 肋软骨炎', { 2: 3, 0: 1, 3: 1 }, '', 'overuse', 6, 'Sore where the ribs meet the breastbone; pressing on it reproduces the pain.', '肋骨与胸骨连接处疼痛；按压可诱发。', 0]],
    abdomen: [
      ['Abdominal muscle strain', '腹肌拉伤', { 1: 4 }, '', 'acute', 6, 'Hurts with sit-ups, twisting or coughing.', '仰卧起坐、扭转或咳嗽时疼痛。', 0],
      ['Side stitch (exercise-related abdominal pain)', '岔气（运动相关腹痛）', { 0: 3 }, '', 'gut', 8, 'A cramp-like pain during running, often after eating or drinking.', '跑步时痉挛样疼痛，常在进食或饮水后出现。', 0],
      ['Tummy upset', '胃肠不适', { 0: 2, 2: 3, 3: 3 }, 'g', 'gut', 8, 'Bloating and nausea usually come from the gut, not the muscles.', '腹胀和恶心通常来自肠胃，而非肌肉。', 0]],
    upperback: [
      ['Postural strain / muscle knot', '姿势性劳损 / 肌肉结节', { 0: 2, 1: 3, 2: 3 }, 'g', 'posture', 12, 'Long sitting and screens load the muscles between the shoulder blades.', '久坐和看屏幕使肩胛间肌肉负荷过大。', 0],
      ['Rib-joint (thoracic) irritation', '肋椎关节（胸椎）刺激', { 3: 3, 0: 2 }, '', 'posture', 12, 'Sharp catch when twisting or breathing deeply, often after an awkward movement.', '扭转或深呼吸时锐痛，常在动作别扭后出现。', 0]],
    lowerback: [
      ['Non-specific low back pain (muscle strain)', '非特异性下背痛（肌肉拉伤）', { 0: 3, 1: 2, 3: 3 }, '', 'acute', 6, 'The most common kind; most people improve within a few weeks by staying active.', '最常见的类型；多数人保持活动数周内好转。', 0],
      ['Sciatica (irritated nerve root)', '坐骨神经痛（神经根受刺激）', { 2: 5, 1: 1 }, '', 'nerve', 2, 'Pain travelling below the knee, sometimes with tingling, means a nerve is involved.', '疼痛放射到膝盖以下，有时伴麻刺，提示神经受累。', 1]],
    hip: [
      ['Outer-hip tendon pain (gluteal tendinopathy / bursitis)', '髋外侧肌腱痛（臀肌腱病 / 滑囊炎）', { 0: 4 }, 'g', 'overuse', 6, 'Sore to lie on and when climbing stairs.', '侧卧和上楼时疼痛。', 0],
      ['Groin or hip-flexor strain', '腹股沟或髋屈肌拉伤', { 2: 3 }, 'a', 'acute', 6, 'Sudden groin pain when kicking, sprinting or changing direction.', '踢球、冲刺或变向时突发腹股沟疼痛。', 0],
      ['Hip impingement / labrum', '髋关节撞击 / 盂唇', { 2: 3, 3: 3, 1: 1 }, 'g', 'overuse', 12, 'Deep groin pain in deep squats with clicking; worth a physio assessment.', '深蹲时深部腹股沟疼痛伴弹响，建议物理治疗评估。', 1],
      ['Snapping hip', '弹响髋', { 3: 3 }, '', 'overuse', 6, 'A tendon flicking over bone; usually harmless if it does not hurt.', '肌腱滑过骨突，不痛通常无害。', 0]],
    thigh: [
      ['Hamstring or quad strain', '腘绳肌或股四头肌拉伤', { 0: 4, 3: 1 }, 'a', 'acute', 6, 'A sudden grab while sprinting or kicking. Re-injury is common if you return too fast.', '冲刺或踢球时突然抽痛。回归过快易再伤。', 0],
      ['Thigh contusion ("dead leg")', '大腿挫伤（“死腿”）', { 1: 4, 3: 2 }, 'a', 'bruise', 6, 'A knee or collision into the thigh muscle; avoid massage early.', '膝盖或碰撞撞到大腿肌肉；早期避免按摩。', 0],
      ['Cramp or muscle soreness', '抽筋或肌肉酸痛', { 2: 4 }, '', 'soreness', 7, 'Tight, crampy muscles after hard or new training.', '高强度或新训练后肌肉紧绷抽筋。', 0]],
    knee: [
      ['Patellofemoral pain (runner’s knee)', '髌股疼痛（跑步膝）', { 0: 4, 3: 1 }, 'g', 'overuse', 6, 'Ache around the kneecap with stairs, squats or long sitting.', '上下楼、深蹲或久坐时髌骨周围酸痛。', 0],
      ['ACL injury', '前交叉韧带损伤', { 1: 3, 2: 4 }, 'a', 'acute', 6, 'Twist, pop, quick swelling, then the knee gives way — needs assessment.', '扭伤、“啪”声、迅速肿胀，之后膝盖打软——需要评估。', 1],
      ['Meniscus tear', '半月板撕裂', { 1: 2, 3: 3, 4: 4 }, '', 'acute', 6, 'Catching or locking with pain along the joint line.', '关节线疼痛并伴卡住或交锁。', 1],
      ['Collateral ligament (MCL/LCL) sprain', '侧副韧带扭伤', { 1: 3 }, 'a', 'acute', 6, 'Pain on the inner or outer side after a knock or twist.', '撞击或扭伤后内侧或外侧疼痛。', 0],
      ['Patellar tendinopathy (jumper’s knee)', '髌腱病（跳跃膝）', { 0: 3 }, 'g', 'overuse', 6, 'Pain just below the kneecap with jumping.', '跳跃时髌骨正下方疼痛。', 0]],
    shin: [
      ['Shin splints (medial tibial stress)', '胫骨内侧应力综合征（胫骨疲劳）', { 0: 4, 3: 2 }, 'g', 'overuse', 6, 'Diffuse pain along the inner shin after running. Pain in one spot or at rest may be a stress fracture.', '跑步后胫骨内侧弥漫性疼痛。若疼痛集中一点或休息时也痛，可能是应力性骨折。', 0],
      ['Calf strain', '小腿肌肉拉伤', { 1: 4 }, 'a', 'acute', 6, 'A sudden grab in the calf when pushing off.', '蹬地时小腿突然抽痛。', 0],
      ['Achilles / calf tendinopathy', '跟腱 / 小腿肌腱病', { 3: 3, 1: 2 }, 'g', 'overuse', 6, 'Stiff at first, eases once warm, then worse later — the classic tendon pattern.', '起初僵硬，热身后缓解，随后加重——典型的肌腱模式。', 0],
      ['Swollen, tight calf', '小腿肿胀紧绷', { 2: 4 }, '', 'soreness', 14, 'Usually muscle tightness, but a hot, swollen calf at rest needs checking for a clot (DVT).', '通常是肌肉紧张，但休息时小腿发热肿胀需排除血栓（DVT）。', 1]],
    ankle: [
      ['Lateral ankle sprain', '踝关节外侧扭伤', { 0: 3, 1: 3, 2: 2 }, 'a', 'acute', 6, 'Rolling the ankle inward stretches the outer ligaments. Early movement and balance training help.', '脚踝内翻牵拉外侧韧带。早期活动和平衡训练有帮助。', 0],
      ['Possible ankle fracture', '疑似踝部骨折', { 3: 5, 2: 1 }, 'a', 'acute', 14, 'Can’t take 4 steps, or bone tenderness — the Ottawa ankle rules say get an X-ray.', '无法行走 4 步或骨头压痛——按渥太华踝关节规则需拍 X 光。', 2],
      ['Chronic ankle instability', '慢性踝关节不稳', { 4: 5 }, 'g', 'overuse', 12, 'Repeated sprains; balance and strength training cut the re-injury risk.', '反复扭伤；平衡与力量训练可降低再伤风险。', 1]],
    foot: [
      ['Plantar heel pain (plantar fasciopathy)', '足跟痛（足底筋膜病）', { 1: 5, 2: 2 }, 'g', 'overuse', 6, 'Worst with the first steps in the morning; calf and foot strengthening help.', '早晨起床头几步最痛；小腿和足部力量训练有帮助。', 0],
      ['Forefoot overload / stress reaction', '前足过载 / 应力反应', { 0: 4 }, 'g', 'overuse', 6, 'Pain in one spot of the forefoot that gets worse with running needs checking.', '前足一点疼痛且跑步后加重，需要检查。', 1],
      ['Arch strain', '足弓劳损', { 2: 3 }, 'g', 'overuse', 6, 'Tired, aching arch from long standing or flat feet.', '久站或扁平足导致足弓疲劳酸痛。', 0],
      ['Wound or nerve problem', '伤口或神经问题', { 3: 5 }, '', 'nerve', 4, 'Sores that won’t heal or numbness in the foot always need a professional look.', '久不愈合的伤口或足部麻木都需要专业检查。', 1]]
  };

  /* red flags: symptom indexes that set the level on their own. [idx, level, onsetOnly, EN, ZH] */
  var FLAGS = {
    head: [[3, 2, '', 'Vomiting after a head knock', '头部撞击后呕吐'], [2, 1, 'a', 'Vision changes after a head knock', '头部撞击后视力改变'], [1, 1, 'a', 'Dizziness after a head knock', '头部撞击后头晕']],
    neck: [[4, 1, '', 'Numbness or tingling in the arm', '手臂麻木或刺痛']],
    shoulder: [[4, 2, '', 'Deformity or bruising after a fall', '摔倒后畸形或淤青']],
    elbow: [[2, 1, '', 'The joint locks or catches', '关节卡锁']],
    wrist: [[1, 1, 'a', 'Thumb-side tenderness after a fall (scaphoid)', '摔倒后拇指侧压痛（舟骨）']],
    hand: [[1, 1, '', 'A finger that is bent or locked', '手指变形或卡住']],
    chest: [[0, 1, 'a', 'Pain breathing after a hit to the chest', '胸部受撞后呼吸疼痛'], [3, 1, 'a', 'Pain on deep breaths after a hit', '受撞后深呼吸疼痛']],
    abdomen: [[2, 2, 'a', 'Belly tenderness after a blow', '腹部受撞后压痛'], [3, 2, 'a', 'Nausea after a blow to the belly', '腹部受撞后恶心']],
    lowerback: [[2, 1, '', 'Pain travelling into the leg', '疼痛放射到腿部']],
    knee: [[4, 1, '', 'The knee locks', '膝关节交锁'], [2, 1, 'a', 'Giving way after a twist', '扭伤后膝盖打软']],
    shin: [[2, 1, '', 'A swollen, tight calf', '小腿肿胀紧绷']],
    ankle: [[3, 2, '', 'Can’t put weight on it', '无法承重']],
    foot: [[3, 1, '', 'A sore that won’t heal or numbness', '伤口不愈或麻木']]
  };

  /* "go now" signs to always list for a body part */
  var URGENT = {
    head: ['Confusion, worsening headache, repeated vomiting, unequal pupils, seizure, or neck pain after the knock — call emergency services.', '意识模糊、头痛加重、反复呕吐、瞳孔不等大、抽搐或伤后颈痛——立即呼叫急救。'],
    neck: ['Neck pain after a big collision with numbness, weakness or tingling in arms/legs — don’t move; call emergency services.', '严重碰撞后颈痛伴四肢麻木、无力或刺痛——不要移动，立即呼叫急救。'],
    chest: ['Crushing chest pain, pain spreading to the arm or jaw, sweating, or breathlessness — call emergency services.', '压榨样胸痛、放射到手臂或下颌、出汗或呼吸困难——立即呼叫急救。'],
    abdomen: ['Severe or worsening belly pain after a blow, shoulder-tip pain, or feeling faint — go to the emergency department.', '腹部受撞后剧痛或加重、肩尖痛或头晕欲倒——立即去急诊。'],
    lowerback: ['Numbness around the groin/buttocks, trouble passing urine, or weakness in both legs — emergency.', '会阴/臀部麻木、排尿困难或双腿无力——立即就急诊。'],
    shin: ['A hot, red, swollen calf at rest or with breathlessness — seek care the same day (possible clot).', '休息时小腿红肿发热或伴呼吸困难——当天就医（可能是血栓）。'],
    _: ['Severe uncontrolled bleeding, a limb that looks deformed, numbness or a cold, pale hand/foot — emergency.', '无法控制的大出血、肢体明显畸形、手脚麻木或冰冷苍白——立即就急诊。']
  };

  var CHAPTER = { 2: ['Nervous System', '神经系统'], 4: ['Integumentary System', '皮肤系统'], 6: ['Injury & Healing', '损伤与愈合'], 7: ['Recovery Science', '恢复科学'], 8: ['Sports Nutrition', '运动营养学'], 12: ['Assessment', '康复评定学'], 14: ['Emergency & Field Care', '急救与场边处置'] };

  /* answers: { onset: 'a'|'g'|'', pain: 0-10, dur: 's'|'m'|'l' } */
  function run(part, ticked, answers) {
    var list = C[part] || [], a = answers || {}, set = {};
    ticked.forEach(function (i) { set[i] = 1; });
    var scored = list.map(function (c) {
      var raw = 0, all = 0, hits = [];
      Object.keys(c[2]).forEach(function (k) { all += c[2][k]; if (set[k]) { raw += c[2][k]; hits.push(+k); } });
      if (!raw) return null;
      if (a.onset === 'g' && c[3] === 'a') return null;      /* an injury-only condition can't build up gradually */
      var onsetF = !a.onset || !c[3] ? 1 : a.onset === c[3] ? 1.3 : 0.65;
      return { c: c, hits: hits, s: raw * (0.55 + 0.45 * raw / all) * onsetF };
    }).filter(Boolean).sort(function (x, y) { return y.s - x.s; });
    var top = scored.length ? scored[0].s : 1;
    scored.forEach(function (x) { x.pct = Math.max(12, Math.round(x.s / top * 100)); });
    scored = scored.slice(0, 3);

    /* triage */
    var level = 0, why = [];
    (FLAGS[part] || []).forEach(function (f) {
      if (!set[f[0]]) return;
      if (f[2] && a.onset !== f[2]) return;
      if (f[1] > level) level = f[1];
      why.push([f[3], f[4]]);
    });
    if (scored[0] && scored[0].c[8] > level && scored[0].pct === 100) { level = scored[0].c[8]; why.push(['Most likely match: ' + scored[0].c[0], '最可能：' + scored[0].c[1]]); }
    if (a.pain >= 8) { if (level < 1) level = 1; why.push(['Pain ' + a.pain + '/10', '疼痛 ' + a.pain + '/10']); }
    if (a.pain >= 9 && a.onset === 'a') { level = 2; }
    if (a.dur === 'l' && level < 1) { level = 1; why.push(['Lasting more than 2 weeks', '持续超过 2 周']); }
    var care = scored[0] ? scored[0].c[4] : (a.onset === 'a' ? 'acute' : 'overuse');
    if (a.onset === 'a' && care === 'overuse') care = 'acute';
    var chs = {};
    scored.forEach(function (x) { chs[x.c[5]] = 1; });
    return { level: level, why: why, matches: scored, care: CARE[care], urgent: URGENT[part] || URGENT._, urgentAll: URGENT._, chapters: Object.keys(chs).map(Number).filter(function (n) { return CHAPTER[n]; }).map(function (n) { return [n, CHAPTER[n]]; }) };
  }

  window.CheckupRules = { run: run, conditions: C };
})();

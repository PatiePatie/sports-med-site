#!/usr/bin/env python3
"""
Build kb/medical-kb.json — Vitaxamine's medical knowledge base.

- ~50 bilingual (EN / 中文) evidence-informed education chunks covering the
  sports-medicine / first-aid scope of vitaliteplan.com
- Each chunk is embedded with Zhipu embedding-3 (dims=512) on the COMBINED
  en+\n+zh text (multilingual model → one vector matches queries in either
  language); vectors are L2-normalized so cosine = dot product.
- Output: kb/medical-kb.json  →  served statically by CF Pages at
  https://vitaliteplan.com/kb/medical-kb.json  →  fetched by the AI worker.

Usage:
    ZHIPU_API_KEY=... python3 tools/build_kb.py [--out kb/medical-kb.json]

Education only — never a formal diagnosis. Emergency/red-flag guidance is
baked into chunks where relevant.
"""

import argparse
import json
import math
import os
import sys
import urllib.request

EMBED_URL = "https://open.bigmodel.cn/api/paas/v4/embeddings"
EMBED_MODEL = "embedding-3"
EMBED_DIMS = 512
BATCH = 16

# ─────────────────────────────────────────────────────────────────────────────
# The knowledge base. Each chunk:
#   id        — stable slug
#   tag       — coarse group (first-aid | injury | rehab | red-flag | basics)
#   topic_en / topic_zh — short section label shown to the model
#   en / zh   — bilingual content (user's language gets injected)
# ─────────────────────────────────────────────────────────────────────────────
CHUNKS = [
    # ── First aid ────────────────────────────────────────────────────────────
    {
        "id": "rice-vs-peace-love",
        "tag": "first-aid",
        "topic_en": "RICE vs PEACE & LOVE",
        "topic_zh": "RICE 与 PEACE & LOVE 对比",
        "en": (
            "RICE (Rest, Ice, Compression, Elevation) is the classic immediate "
            "first-aid protocol for acute soft-tissue injuries: protect the area, "
            "ice for 15-20 minutes every 2-3 hours for the first 48 hours, compress "
            "with an elastic wrap, and elevate above the heart when possible. Modern "
            "sports medicine shifts to PEACE & LOVE after the first 2-3 days: Protect, "
            "Elevate, Avoid anti-inflammatories, Compress, Educate — then Load, "
            "Optimism, Vascularisation, Exercise. Ice is fine short-term for pain and "
            "swelling control, but prolonged or aggressive icing may delay the natural "
            "inflammation that healing needs. Start gentle movement and loading early, "
            "as tolerated, because movement drives recovery."
        ),
        "zh": (
            "RICE（休息、冰敷、加压包扎、抬高）是急性软组织损伤的经典急救方案："
            "保护患处，前 48 小时每 2-3 小时冰敷 15-20 分钟，用弹性绷带加压包扎，"
            "并尽量将患肢抬高到心脏以上。现代运动医学主张急性期 2-3 天过后改用"
            "PEACE & LOVE 方案：保护、抬高、避免消炎药、加压、教育——随后是负荷、"
            "乐观心态、血管化（适度活动促进血液循环）、运动锻炼。冰敷短期用于止痛"
            "和消肿没问题，但长期或过度冰敷可能延缓愈合所需的自然炎症反应。应在"
            "可耐受范围内尽早开始轻柔活动和负荷，因为活动才是恢复的关键。"
        ),
    },
    {
        "id": "bleeding-control",
        "tag": "first-aid",
        "topic_en": "Bleeding control",
        "topic_zh": "止血处理",
        "en": (
            "For a bleeding wound: apply firm, direct pressure with a clean cloth or "
            "dressing and hold for at least 5-10 minutes without peeking. If blood "
            "soaks through, add more material on top — do not remove the original "
            "dressing. Elevate the injured limb if possible. Wash minor cuts with "
            "clean water, apply antiseptic, and cover with a sterile dressing. Seek "
            "emergency care immediately if: bleeding is heavy or spurting, does not "
            "stop after 10 minutes of firm pressure, the wound is deep or gaping, "
            "there is an embedded object, or you see signs of infection later "
            "(increasing redness, heat, pus, fever)."
        ),
        "zh": (
            "出血伤口处理：用干净的布或敷料对伤口施加稳固的直接压力，至少持续按压"
            "5-10 分钟，期间不要掀开查看。如果血液浸透敷料，直接在原有敷料上继续"
            "加料，不要移除第一层。如可能，将受伤肢体抬高。轻微割伤用清水冲洗、"
            "涂抹消毒剂并用无菌敷料覆盖。出现以下情况立即就医：出血量大或呈喷射状、"
            "持续用力按压 10 分钟仍未停止、伤口深或开裂、有异物嵌入、或日后出现"
            "感染迹象（红肿加重、发热、流脓、发烧）。"
        ),
    },
    {
        "id": "burns",
        "tag": "first-aid",
        "topic_en": "Burns",
        "topic_zh": "烧伤与烫伤",
        "en": (
            "For a burn: cool the area with running cool (not ice-cold) water for "
            "10-20 minutes as soon as possible. Remove rings or tight items before "
            "swelling starts. Do NOT apply ice directly, butter, toothpaste, or "
            "ointments to a fresh burn. Cover loosely with a clean, non-stick "
            "dressing or cling film. Minor burns (red skin, small blisters) can heal "
            "at home with daily gentle cleaning and dressing changes. Seek emergency "
            "care for: burns larger than the person's palm, burns on the face, "
            "hands, feet, genitals or major joints, full-thickness (white or "
            "charred) burns, chemical or electrical burns, or any burn in a child "
            "or elderly person."
        ),
        "zh": (
            "烧伤/烫伤处理：尽快用流动的凉水（不是冰水）冲洗伤口 10-20 分钟。在肿胀"
            "开始前摘掉戒指等紧身物品。不要直接把冰块敷在伤口上，也不要用黄油、"
            "牙膏或药膏涂抹新鲜烫伤。用干净的不粘敷料或保鲜膜松散覆盖。轻度烫伤"
            "（皮肤发红、小水疱）可在家每日轻柔清洁并更换敷料。出现以下情况立即就医："
            "烫伤面积大于本人手掌、位于面部/手/脚/生殖器/大关节、全层烫伤（发白或"
            "焦黑）、化学或电灼伤、或烫伤者是儿童或老人。"
        ),
    },
    {
        "id": "nosebleed",
        "tag": "first-aid",
        "topic_en": "Nosebleed",
        "topic_zh": "鼻出血",
        "en": (
            "For a nosebleed: sit upright, lean slightly forward, and pinch the "
            "soft part of the nose just below the bridge for 10 minutes without "
            "releasing. Breathe through the mouth. Do not tilt the head back — this "
            "causes blood to run down the throat. Apply an ice pack to the nose or "
            "cheeks to help constrict vessels. Avoid blowing the nose or strenuous "
            "activity for 24 hours after. Seek medical care if bleeding lasts more "
            "than 20 minutes despite pressure, is very heavy, follows a head injury, "
            "or happens with dizziness or weakness. Repeated nosebleeds plus easy "
            "bruising may warrant a check of blood pressure or clotting."
        ),
        "zh": (
            "鼻出血处理：坐直，身体微微前倾，捏住鼻梁下方鼻翼的柔软部位持续 10 分钟"
            "不要松手，用嘴呼吸。不要仰头——那样会使血液倒流进喉咙。可用冰袋敷在"
            "鼻部或脸颊帮助血管收缩。止血后 24 小时内避免擤鼻涕和剧烈运动。若按压"
            "超过 20 分钟仍未止血、出血量很大、发生在头部受伤之后，或伴随头晕乏力，"
            "请及时就医。反复鼻出血且容易淤青，可能提示血压或凝血功能需要检查。"
        ),
    },
    {
        "id": "heat-illness",
        "tag": "first-aid",
        "topic_en": "Heat illness",
        "topic_zh": "热相关疾病",
        "en": (
            "Heat exhaustion: heavy sweating, pale cool skin, weakness, dizziness, "
            "nausea, headache, rapid pulse. Treatment: move to shade or air "
            "conditioning, lie down, elevate feet, drink cool water or sports "
            "drink, loosen clothes, apply cool wet cloths. If not improved within "
            "30-60 minutes, seek help. HEAT STROKE is a medical emergency: body "
            "temperature 40°C+, hot DRY skin (or sweating has stopped), confusion, "
            "seizure, slurred speech, unconsciousness. Call emergency services "
            "immediately, move to shade, remove excess clothing, and cool rapidly "
            "with any means — cold water immersion or dousing, fans, ice packs to "
            "neck/armpits/groin — until help arrives. Never give fluids to someone "
            "with altered consciousness."
        ),
        "zh": (
            "热衰竭：大量出汗、皮肤苍白湿冷、乏力、头晕、恶心、头痛、脉率加快。"
            "处理：转移到阴凉或有空调处，平卧并抬高双脚，喝凉水或运动饮料，松开"
            "衣物，用凉湿毛巾擦拭。若 30-60 分钟内无改善则需就医。热射病（中暑）"
            "是医疗急症：体温 40°C 以上、皮肤干热（或已停止出汗）、意识混乱、抽搐、"
            "言语不清、昏迷。立即拨打急救电话，转移到阴凉处，脱去多余衣物，用一切"
            "手段快速降温——冷水浸泡或冲淋、风扇、冰袋置于颈部/腋下/腹股沟——等待"
            "救援。意识不清者绝对不要喂水。"
        ),
    },
    {
        "id": "dehydration",
        "tag": "first-aid",
        "topic_en": "Dehydration",
        "topic_zh": "脱水",
        "en": (
            "Dehydration: thirst, dark urine, dry mouth, headache, fatigue, "
            "dizziness, reduced urine output. Mild dehydration: sip water or an "
            "electrolyte drink steadily; if exercising heavily, a sports drink "
            "replaces sodium and potassium lost in sweat. Severe signs requiring "
            "medical attention: no urine for 8+ hours, very dark urine, confusion, "
            "sunken eyes, rapid heart rate, dizziness when standing. General "
            "guidance: don't rely on thirst alone during long exercise — schedule "
            "fluid breaks; weigh yourself before/after training, and replace fluid "
            "with roughly 1.25-1.5x the weight lost. Avoid excessive caffeine or "
            "alcohol around intense exercise."
        ),
        "zh": (
            "脱水表现：口渴、尿色深、口干、头痛、疲劳、头晕、尿量减少。轻度脱水："
            "持续小口喝水或电解质饮料；剧烈运动时，运动饮料可补充汗液流失的钠和钾。"
            "需要就医的严重迹象：8 小时以上无尿、尿液极深、意识混乱、眼窝凹陷、"
            "心率快、站立时头晕。一般建议：长时间运动不要只依赖口渴感，应定时补水；"
            "训练前后称体重，按减重量的 1.25-1.5 倍补水。剧烈运动前后避免过量"
            "咖啡因和酒精。"
        ),
    },
    {
        "id": "red-flags-emergency",
        "tag": "red-flag",
        "topic_en": "Red flags — go to the ER now",
        "topic_zh": "危险信号——立即急诊",
        "en": (
            "These symptoms always require immediate emergency evaluation — do not "
            "wait for an appointment: chest pain or pressure (especially with "
            "shortness of breath, sweating, nausea, or pain spreading to arm/jaw), "
            "difficulty breathing, severe uncontrolled bleeding, sudden severe "
            "headache, sudden weakness/numbness of face, arm or leg or trouble "
            "speaking (possible stroke), seizure, fainting/unconsciousness, severe "
            "allergic reaction (swelling of face/lips/tongue, trouble swallowing), "
            "or a head injury with confusion, vomiting, or loss of consciousness. "
            "This list is not complete — if you feel something is seriously wrong, "
            "seek care. When in doubt, call your emergency number."
        ),
        "zh": (
            "以下症状必须立即急诊评估，不要等待预约：胸痛或胸闷（尤其伴有气短、出汗、"
            "恶心，或疼痛放射到手臂/下颌）、呼吸困难、大出血无法控制、突发的剧烈头痛、"
            "面部/手臂/腿部突然无力或麻木、言语不清（可能中风）、抽搐、晕厥/昏迷、"
            "严重过敏反应（面部/嘴唇/舌头肿胀、吞咽困难）、或头部受伤后出现意识模糊、"
            "呕吐或意识丧失。此列表并不完整——如果感觉情况严重，请立即就医。拿不准"
            "就拨打急救电话。"
        ),
    },
    # ── Ankle & foot ─────────────────────────────────────────────────────────
    {
        "id": "ankle-sprain",
        "tag": "injury",
        "topic_en": "Ankle sprain",
        "topic_zh": "踝关节扭伤",
        "en": (
            "Ankle sprains are stretching or tearing of ligaments, most often the "
            "lateral ligaments from the foot rolling inward. Symptoms: pain over "
            "the outside of the ankle, swelling, bruising, difficulty bearing "
            "weight. Grade 1 = mild stretch, minimal swelling, full weight-bearing "
            "possible. Grade 2 = partial tear, moderate swelling and bruising, some "
            "instability. Grade 3 = complete tear, severe swelling and instability, "
            "often unable to bear weight. First 48 hours: RICE, gentle protective "
            "movement. Then: active range of motion, balance/proprioception work, "
            "and progressive loading. Most sprains recover in 2-6 weeks with "
            "proper rehab; an unstable ankle that keeps giving way needs assessment "
            "— it may be a Grade 3 tear."
        ),
        "zh": (
            "踝关节扭伤即韧带被拉伸或撕裂，最常见的是脚向内翻时损伤外侧韧带。症状："
            "踝外侧疼痛、肿胀、淤青、承重困难。I 度=轻度拉伤，轻微肿胀，可完全承重。"
            "II 度=部分撕裂，中度肿胀淤青，稍有不稳。III 度=完全撕裂，严重肿胀和不稳，"
            "常无法承重。前 48 小时按 RICE 处理并轻柔保护性活动；之后开始主动活动度、"
            "平衡/本体感觉训练和渐进负荷。多数扭伤经正规康复 2-6 周恢复；若踝关节"
            "反复发软易再扭，需评估是否存在 III 度撕裂。"
        ),
    },
    {
        "id": "ankle-sprain-rehab",
        "tag": "rehab",
        "topic_en": "Ankle sprain rehab",
        "topic_zh": "踝关节扭伤康复",
        "en": (
            "Ankle sprain rehab progresses through phases. Phase 1 (acute, 0-3 "
            "days): protect, gentle pain-free ankle pumps and alphabet movements, "
            "ice for comfort, compression. Phase 2 (recovery): regain full range "
            "with circles and towel stretches; balance on one leg from 30 seconds "
            "up; once walking is pain-free, add calf raises. Phase 3 (return to "
            "sport): single-leg hops, lateral hops, direction changes, then sport-"
            "specific drills. Red flags for delayed recovery: continued giving-way, "
            "pain on the inside of the ankle, or inability to bear weight after a "
            "week — get it assessed. Rushing back before balance and strength "
            "return is the #1 cause of repeat sprains."
        ),
        "zh": (
            "踝关节扭伤康复分阶段进行。第一阶段（急性期 0-3 天）：保护，做无痛的踝泵"
            "和字母操，冰敷缓解不适，加压包扎。第二阶段（恢复期）：用画圈和毛巾拉伸"
            "恢复全范围活动度；单腿站立从 30 秒开始逐渐增加；行走无痛后加入提踵。"
            "第三阶段（回归运动）：单腿跳、侧向跳、变向，然后专项训练。恢复延迟的"
            "危险信号：持续发软、踝内侧疼痛、或一周后仍无法承重——需要评估。在平衡"
            "和力量恢复前仓促回归运动，是反复扭伤的第一大原因。"
        ),
    },
    {
        "id": "plantar-fasciitis",
        "tag": "injury",
        "topic_en": "Plantar fasciitis",
        "topic_zh": "足底筋膜炎",
        "en": (
            "Plantar fasciitis is irritation of the thick band under the foot that "
            "runs from heel to toes. Hallmark: sharp heel pain with the first steps "
            "in the morning or after sitting, improving after a few minutes of "
            "walking, and often worse again after long standing or hard exercise. "
            "Contributors: sudden increase in running/standing, tight calf muscles, "
            "poor arch support, being overweight. Management: calf and plantar "
            "fascia stretching (towel stretch, rolling a ball under the foot), "
            "sensible footwear or temporary cushioning, gradual load management — "
            "don't stop moving, but reduce high-impact volume. A night splint can "
            "help morning pain. Most improve within 6-12 weeks; persistent pain "
            "warrants a professional assessment."
        ),
        "zh": (
            "足底筋膜炎是足底从脚跟延伸至脚趾的厚筋膜受刺激。典型表现：早晨起床"
            "第一步或久坐后起身时脚跟剧痛，走几分钟后缓解，久站或剧烈运动后又加重。"
            "诱因：跑步/站立量突然增加、小腿肌肉紧张、足弓支撑差、超重。处理：拉伸"
            "小腿和足底筋膜（毛巾拉伸、脚下滚球），合适的鞋或临时缓冲鞋垫，逐步管理"
            "负荷——不要完全停止活动，但减少高冲击量。夜间支具可缓解晨痛。多数在"
            "6-12 周内改善；持续疼痛需专业评估。"
        ),
    },
    {
        "id": "achilles-tendinopathy",
        "tag": "injury",
        "topic_en": "Achilles tendinopathy",
        "topic_zh": "跟腱病变",
        "en": (
            "Achilles tendinopathy is pain and dysfunction of the Achilles tendon, "
            "common in runners and jumping sports. Symptoms: aching or sharp pain "
            "2-6 cm above the heel, morning stiffness that eases with movement, "
            "pain on calf raises or sprinting, occasional swelling or a thickened "
            "knot in the tendon. It is usually an OVERUSE (load) problem, not pure "
            "inflammation. Management: reduce but don't stop activity, load the "
            "tendon progressively — heel-drop eccentrics are a cornerstone "
            "(slowly lower both heels, raise with both, build to single-leg), "
            "calf stretching, and gradual return to impact. Red flag: a sudden "
            "'pop' with immediate weakness and inability to push off — that may be "
            "an Achilles RUPTURE and needs urgent assessment."
        ),
        "zh": (
            "跟腱病变是跟腱的疼痛和功能障碍，常见于跑者和跳跃类运动。症状：跟骨上"
            "方 2-6 厘米处酸痛或刺痛、晨起僵硬活动后缓解、提踵或冲刺时疼痛、偶尔"
            "肿胀或触及跟腱增厚结节。这通常是过度使用（负荷）问题，而非单纯炎症。"
            "处理：减少但不要停止活动，循序渐进地给肌腱加载——离心提踵是核心方法"
            "（双脚慢速放下、双脚发力抬起，逐步过渡到单腿），小腿拉伸，逐步回归"
            "高冲击运动。危险信号：突然一声\"啪\"并立即无力、无法蹬地——可能是跟腱"
            "断裂，需要紧急评估。"
        ),
    },
    {
        "id": "shin-splints",
        "tag": "injury",
        "topic_en": "Shin splints",
        "topic_zh": "胫骨应力综合征（胫骨痛）",
        "en": (
            "Shin splints (medial tibial stress syndrome) is pain along the inner "
            "edge of the shinbone, typically from a rapid increase in running "
            "volume, hard surfaces, or poor footwear. Pain usually eases with rest "
            "and returns with activity — especially at the start of a run. "
            "Management: reduce running volume/distance or cross-train to control "
            "pain, address footwear and surface, stretch calves, and strengthen "
            "foot intrinsics and calves. Warn: if pain becomes constant, worsens "
            "at night, or is sharply localized to a single point on the bone even "
            "at rest, suspect a STRESS FRACTURE — stop high-impact activity and "
            "get imaging (X-ray often normal early; MRI is more sensitive)."
        ),
        "zh": (
            "胫骨内侧应力综合征（俗称\"胫骨痛\"）是沿胫骨内侧缘的疼痛，常见于跑步量"
            "突然增加、地面过硬或鞋子不合适。疼痛通常休息后缓解，运动时复发——尤其"
            "在跑步开始时。处理：减少跑步量/距离或改为交叉训练以控制疼痛，检查鞋和"
            "地面，拉伸小腿，加强足底内在肌和小腿力量。警告：如果疼痛变为持续性、"
            "夜间加重、或在骨上某一点明显定位、甚至休息时也痛，要警惕应力性骨折——"
            "停止高冲击活动并做影像学检查（早期 X 线常正常，MRI 更敏感）。"
        ),
    },
    # ── Knee ──────────────────────────────────────────────────────────────────
    {
        "id": "acl-injury",
        "tag": "injury",
        "topic_en": "ACL injury",
        "topic_zh": "前交叉韧带（ACL）损伤",
        "en": (
            "The ACL (anterior cruciate ligament) stabilizes the knee against "
            "forward tibia shift and rotation. Injury often happens in "
            "cutting/jumping sports — a sudden stop, change of direction, or "
            "landing — sometimes with an audible 'pop', immediate swelling within "
            "hours, and a feeling of the knee giving way. A complete tear may not "
            "be very painful at the moment but typically swells significantly. "
            "Immediate: RICE, crutches if needed, avoid full weight-bearing if "
            "painful. Assessment is essential: physical exam plus MRI. Management "
            "depends on age, activity, and instability — many do well with "
            "structured prehabilitation and rehab (strength, balance, jumping "
            "control) without surgery; some opt for reconstruction. Return to "
            "cutting sports after ACL injury is a long, careful process (often "
            "9-12+ months post-op) with testing-based clearance."
        ),
        "zh": (
            "前交叉韧带（ACL）负责防止胫骨向前移位和旋转不稳。损伤常见于急停、变向、"
            "落地等剪切/跳跃类运动——有时听到\"啪\"的一声，几小时内明显肿胀，膝关节"
            "感觉发软。完全断裂当时可能不很痛，但通常会显著肿胀。立即处理：RICE，"
            "必要时用拐杖，疼痛时避免完全承重。必须评估：体格检查加 MRI。处理方式"
            "取决于年龄、运动水平和膝关节稳定性——许多人通过规范的术前预康复和"
            "术后康复（力量、平衡、落地控制）无需手术即可恢复；也有人选择韧带重建。"
            "ACL 损伤后回归变向运动是一个漫长而谨慎的过程（术后常需 9-12 个月以上），"
            "并且要通过一系列测试评估才能放行。"
        ),
    },
    {
        "id": "meniscus-injury",
        "tag": "injury",
        "topic_en": "Meniscus injury",
        "topic_zh": "半月板损伤",
        "en": (
            "The menisci are C-shaped cartilage cushions between the thigh and "
            "shin bones. Injury often involves twisting on a loaded, bent knee, "
            "or develops gradually with degeneration. Symptoms: pain on the joint "
            "line (inside or outside of knee), swelling that may come and go over "
            "days, clicking, a sensation of 'catching' or 'locking' — inability "
            "to fully straighten the knee can signal a displaced 'bucket-handle' "
            "tear, which should be assessed urgently. Management: small tears may "
            "settle with activity modification and quadriceps/hip strengthening; "
            "larger or symptomatic mechanical tears may need arthroscopic partial "
            "meniscectomy or repair. Protect the knee during recovery — avoid deep "
            "squats and twisting until cleared."
        ),
        "zh": (
            "半月板是大腿骨与小腿骨之间的 C 形软骨垫。损伤常见于承重屈膝状态下扭转，"
            "也可能随退变逐渐出现。症状：关节线（膝内侧或外侧）疼痛、数天内时肿时消、"
            "弹响、\"卡住\"或\"锁住\"的感觉——无法完全伸直膝盖可能提示\"桶柄状\""
            "撕裂移位，需尽快评估。处理：小型撕裂通过调整活动和加强股四头肌/髋部"
            "力量可能自行稳定；较大或有明显机械症状的撕裂可能需要关节镜下半月板"
            "部分切除或缝合。恢复期保护膝关节——在获得医生许可前避免深蹲和扭转动作。"
        ),
    },
    {
        "id": "mcl-injury",
        "tag": "injury",
        "topic_en": "MCL injury",
        "topic_zh": "内侧副韧带（MCL）损伤",
        "en": (
            "The MCL (medial collateral ligament) runs along the inner side of the "
            "knee and resists the knee bending inward. Injury usually follows a "
            "blow to the outside of the knee or a twist, causing pain directly over "
            "the inner knee, swelling, and sometimes bruising. Grades 1-3 reflect "
            "stretch to complete tear. Most MCL injuries — even Grade 3 — heal "
            "non-operatively with bracing, protected motion, and progressive "
            "strengthening, because the ligament has good blood supply. Rehab "
            "focuses on pain-free range of motion, quadriceps and hip strength, "
            "and return to running/cutting once stable. Red flag: MCL injuries "
            "often occur WITH ACL or meniscus injuries, so persistent instability, "
            "locking, or significant swelling warrants imaging."
        ),
        "zh": (
            "内侧副韧带（MCL）沿膝关节内侧走行，抵抗膝关节向内弯曲。损伤通常由膝"
            "外侧受到撞击或扭转引起，表现为膝内侧直接压痛、肿胀，有时淤青。I-III 度"
            "分别对应从拉伤到完全断裂。多数 MCL 损伤——甚至 III 度——都可保守治疗"
            "愈合：护具、保护性活动、渐进加力，因为该韧带血供良好。康复重点是无痛"
            "活动度、股四头肌和髋部力量，稳定后逐步回归跑步和变向运动。危险信号："
            "MCL 损伤常合并 ACL 或半月板损伤，若持续不稳、卡锁或明显肿胀，需影像学"
            "检查。"
        ),
    },
    {
        "id": "runner-knee",
        "tag": "injury",
        "topic_en": "Patellofemoral pain (runner's knee)",
        "topic_zh": "髌股关节疼痛（跑步膝）",
        "en": (
            "Patellofemoral pain is aching pain around or behind the kneecap, "
            "worsened by stairs, squatting, kneeling, or sitting with the knee "
            "bent for a long time. Common in runners and adolescents. Causes are "
            "usually load-related: sudden mileage increase, weak glutes/quadriceps, "
            "poor control of the knee during running or landing. Management: "
            "temporarily reduce aggravating activities (choose flat, shorter "
            "routes; limit stair volume), strengthen hips and quadriceps — "
            "particularly glute medius and VMO-type work — improve movement "
            "control, and gradually rebuild mileage. Ice helps comfort, not cure. "
            "It rarely needs surgery; commitment to strengthening over 6-12 weeks "
            "is the main treatment."
        ),
        "zh": (
            "髌股关节疼痛是膝盖骨周围或后方的酸痛，上下楼梯、下蹲、跪姿或屈膝久坐"
            "时加重。常见于跑者和青少年。原因通常是负荷相关：跑量突然增加、臀肌/"
            "股四头肌力量弱、跑步或落地时膝关节控制差。处理：暂时减少诱发动作（选择"
            "平坦较短的路线，减少上下楼梯量），加强髋部和股四头肌力量——尤其是臀中"
            "肌和股内侧斜肌——改善动作控制，再逐步增加跑量。冰敷只能缓解不适，不能"
            "治本。很少需要手术；坚持 6-12 周力量训练是主要治疗手段。"
        ),
    },
    {
        "id": "jumpers-knee",
        "tag": "injury",
        "topic_en": "Patellar tendinopathy (jumper's knee)",
        "topic_zh": "髌腱病变（跳跃膝）",
        "en": (
            "Patellar tendinopathy is pain in the tendon just below the kneecap, "
            "classic in basketball, volleyball, and jumping sports. Symptom "
            "progression: pain only after sport, then during warm-up (settles "
            "during play), then during play, then during daily activities. It is "
            "an overload problem of the tendon. Management: adjust training load "
            "— reduce but do not eliminate jumping/squatting; heavy slow resistance "
            "training and isometric holds (e.g., wall sits, isometric leg "
            "extension) reduce pain quickly; progressive tendon loading is the "
            "core treatment. Strapping and shockwave can help symptoms. Avoid "
            "complete rest — tendons need graded load to remodel. Persistent "
            "pain after 3 months of loading work warrants professional input."
        ),
        "zh": (
            "髌腱病变是膝盖骨正下方肌腱的疼痛，篮球、排球和跳跃类运动中的典型问题。"
            "症状进展：运动后才痛→热身时痛（比赛中缓解）→比赛中痛→日常活动也痛。"
            "这是肌腱的负荷过载问题。处理：调整训练负荷——减少但不要完全停止跳跃/"
            "下蹲；大重量慢速力量训练和等长收缩（如靠墙静蹲、等长伸膝）能快速缓解"
            "疼痛；渐进肌腱负荷是核心治疗。贴扎和冲击波可辅助缓解症状。避免完全"
            "休息——肌腱需要分级负荷才能重塑。力量训练 3 个月后仍持续疼痛，需专业"
            "评估。"
        ),
    },
    # ── Hip & thigh ───────────────────────────────────────────────────────────
    {
        "id": "hamstring-strain",
        "tag": "injury",
        "topic_en": "Hamstring strain",
        "topic_zh": "腘绳肌拉伤",
        "en": (
            "Hamstring strains are common in sprinting, kicking, and explosive "
            "movements — a sudden stretch or overload of the muscles at the back "
            "of the thigh. Symptoms: sudden sharp pain in the back of the thigh, "
            "sometimes a 'pop', pain on stretching or contracting, bruising that "
            "may appear over days. Grade 1 = mild, Grade 2 = partial tear, Grade "
            "3 = complete tear with significant weakness. Immediate: RICE, avoid "
            "stretching hard. Rehab: protect + early pain-free gentle movement, "
            "then progressive strengthening — isometrics, then lengthening "
            "exercises (Nordic-style progressions), then running — guided by pain "
            "and strength. Rushing return is the main cause of repeat strains. "
            "Severe tears with a palpable gap or inability to walk need assessment."
        ),
        "zh": (
            "腘绳肌拉伤常见于冲刺、踢腿和爆发性动作——大腿后侧肌肉突然被拉伸或负荷"
            "过载。症状：大腿后侧突然剧痛，有时伴随\"啪\"的一声，拉伸或发力时疼痛，"
            "淤青可能数天内出现。I 度=轻度，II 度=部分撕裂，III 度=完全撕裂伴明显"
            "无力。立即处理：RICE，避免大力拉伸。康复：保护+早期无痛轻柔活动，然后"
            "渐进加强——等长收缩，再到（北欧式）离心加长训练，再到跑步——以疼痛和"
            "力量为依据。仓促回归是反复拉伤的主要原因。严重撕裂出现可触及的凹陷或"
            "无法行走，需要评估。"
        ),
    },
    {
        "id": "quad-strain",
        "tag": "injury",
        "topic_en": "Quadriceps strain",
        "topic_zh": "股四头肌拉伤",
        "en": (
            "Quadriceps strains affect the large front-thigh muscles, often from "
            "sprinting, kicking, or an impact blow (contusion). Symptoms: pain and "
            "tightness in the front of the thigh, pain with knee extension or "
            "stretching, swelling, bruising. A deep contusion can lead to "
            "myositis ossificans (bone forming in muscle) if returned to sport "
            "too early. Management: RICE first 48 hours, gentle pain-free range "
            "of motion, then graduated strengthening — isometrics to eccentrics "
            "— then sport-specific activities. Avoid aggressive stretching while "
            "acutely painful. Return to sport only when strength and range are "
            "near symmetrical and sprinting/cutting are pain-free. Watch for "
            "progressive swelling or a hard lump — that needs assessment."
        ),
        "zh": (
            "股四头肌拉伤影响大腿前侧大肌群，常见于冲刺、踢腿或直接撞击（挫伤）。"
            "症状：大腿前侧疼痛紧绷、伸膝或拉伸时疼痛、肿胀、淤青。深部挫伤如果"
            "过早回归运动，可能发展为骨化性肌炎（肌肉内形成骨质）。处理：前 48 小时"
            "RICE，轻柔无痛活动度，然后逐步加力——从等长收缩到离心训练——再到专项"
            "活动。急性疼痛期避免大力拉伸。当力量和活动度接近对称、冲刺和变向无痛"
            "时才可回归运动。注意进行性肿胀或硬块——需要评估。"
        ),
    },
    {
        "id": "groin-strain",
        "tag": "injury",
        "topic_en": "Groin (adductor) strain",
        "topic_zh": "腹股沟（内收肌）拉伤",
        "en": (
            "Groin strains involve the adductor muscles on the inner thigh, common "
            "in sports with side-to-side movement, kicking, and skating. Symptoms: "
            "sudden pain in the inner thigh or where the thigh meets the pelvis, "
            "pain on squeezing the legs together or on side kicks, tenderness, and "
            "occasional bruising. Management: RICE first, then progressive adductor "
            "strengthening — isometric squeeze, then Copenhagen-style and "
            "lengthening work — plus core and hip control. Avoid stretching hard "
            "early; load management is key to avoiding recurrence. Most strains "
            "settle in 2-6 weeks. Persistent groin pain can also come from hip "
            "joint problems or hernias, so pain that doesn't follow the expected "
            "path warrants a professional check."
        ),
        "zh": (
            "腹股沟拉伤涉及大腿内侧的内收肌群，常见于侧向移动、踢腿和滑冰类运动。"
            "症状：大腿内侧或大腿与骨盆交界处突然疼痛，双腿并拢用力或侧踢时疼痛，"
            "有压痛，偶尔淤青。处理：先 RICE，然后逐步加强内收肌——等长夹腿收缩，"
            "再到（哥本哈根式）加长训练——同时加强核心和髋部控制。早期避免大力"
            "拉伸；负荷管理是防止复发的关键。多数拉伤 2-6 周内恢复。持续的腹股沟痛"
            "也可能来自髋关节问题或疝气，若恢复不符合预期，应找专业人士检查。"
        ),
    },
    {
        "id": "it-band-syndrome",
        "tag": "injury",
        "topic_en": "IT band syndrome",
        "topic_zh": "髂胫束综合征",
        "en": (
            "IT band syndrome causes pain on the OUTSIDE of the knee, classic in "
            "runners and cyclists. The iliotibial band runs from the hip to just "
            "below the knee; with repetitive bending it can irritate tissues at "
            "the outer knee. Symptoms: sharp or burning pain on the outer knee "
            "during or after running, often worse downhill or at a certain "
            "stride/cadence, improving at rest. It is usually a load and control "
            "issue, not 'tightness' of the band itself. Management: reduce "
            "mileage/hills temporarily, optimize cadence, strengthen the hip — "
            "glute medius side-lying work, clamshells, and hip hikes — and "
            "stretch the glutes and lateral hip. Foam rolling the IT band itself "
            "is not very effective; rolling the glutes/quadriceps helps more."
        ),
        "zh": (
            "髂胫束综合征表现为膝关节外侧疼痛，常见于跑者和自行车手。髂胫束从髋部"
            "延伸至膝外侧下方；反复屈伸时可能刺激膝外侧软组织。症状：跑步中或跑步"
            "后膝外侧刺痛或灼痛，下坡时或特定步频时更明显，休息后缓解。这通常是负荷"
            "和控制问题，而非髂胫束本身\"太紧\"。处理：暂时减少跑量和爬坡，优化步频，"
            "加强髋部——侧卧抬腿练臀中肌、蚌式开合、髋部上提——并拉伸臀肌和髋外侧。"
            "直接滚压髂胫束本身效果有限；滚压臀肌和股四头肌更有帮助。"
        ),
    },
    {
        "id": "hip-flexor-strain",
        "tag": "injury",
        "topic_en": "Hip flexor strain",
        "topic_zh": "髋屈肌拉伤",
        "en": (
            "Hip flexor strains affect the muscles at the front of the hip that "
            "lift the knee — common in sprinting, kicking, and high knees. "
            "Symptoms: pain at the front of the hip or groin, pain lifting the "
            "knee or stretching the hip backward, tenderness, occasional "
            "swelling or bruising. Management: RICE initially, gentle pain-free "
            "range of motion, then progressive strengthening of the hip flexors "
            "and core, and stretching when no longer acutely painful. Evaluate "
            "training load — a sudden spike in sprint or hill volume is often "
            "the trigger. Persistent or severe pain that does not improve within "
            "a couple of weeks, or pain with sitting for long periods, should be "
            "assessed (hip joint issues can mimic flexor strains)."
        ),
        "zh": (
            "髋屈肌拉伤影响髋前侧负责抬膝的肌肉——常见于冲刺、踢腿和高抬腿。症状："
            "髋前侧或腹股沟疼痛，抬膝或向后伸髋时疼痛，有压痛，偶尔肿胀或淤青。"
            "处理：初期 RICE，轻柔无痛活动度，然后逐步加强髋屈肌和核心力量，急性疼痛"
            "消失后再拉伸。审视训练负荷——冲刺或爬坡量的突然增加通常是诱因。如果"
            "持续或剧烈疼痛数周不改善，或久坐时也痛，应进行评估（髋关节问题可能"
            "伪装成屈肌拉伤）。"
        ),
    },
    # ── Back & neck ───────────────────────────────────────────────────────────
    {
        "id": "low-back-strain",
        "tag": "injury",
        "topic_en": "Low back strain",
        "topic_zh": "腰背部劳损",
        "en": (
            "Acute low back strain is muscle/ligament irritation from a sudden "
            "awkward lift, twist, or overload. Symptoms: localized aching or "
            "spasm in the lower back, stiffness, pain with bending or twisting, "
            "often better lying down. It is common, painful, and usually "
            "self-limiting — most settle within days to a few weeks. Early "
            "management: keep moving gently (walking, light mobility) as "
            "tolerated, apply heat for muscle spasm, avoid bed rest beyond a day. "
            "Gradually return to normal activity. Red flags requiring assessment: "
            "numbness or weakness in the legs, loss of bladder or bowel control, "
            "leg pain below the knee (possible nerve involvement), fever, "
            "unexplained weight loss, or night pain. Sudden severe weakness or "
            "saddle numbness = emergency."
        ),
        "zh": (
            "急性腰背劳损是肌肉/韧带因突然的别扭发力、扭转或过载而受刺激。症状："
            "下背部局部酸痛或痉挛、僵硬，弯腰或扭转时疼痛，平躺常可缓解。这很常见、"
            "很痛，但通常自限——多数在数天到数周内好转。早期处理：在可耐受范围内"
            "继续轻柔活动（走路、轻度活动度练习），肌肉痉挛时热敷，卧床休息不超过"
            "一天。逐渐恢复正常活动。需要评估的危险信号：腿麻或无力、大小便失禁、"
            "膝盖以下腿痛（可能神经受累）、发烧、不明原因体重下降、夜间痛。突发严重"
            "无力或会阴区麻木 = 急诊。"
        ),
    },
    {
        "id": "sciatica",
        "tag": "injury",
        "topic_en": "Sciatica / nerve root pain",
        "topic_zh": "坐骨神经痛 / 神经根痛",
        "en": (
            "Sciatica is pain that follows the path of the sciatic nerve — often "
            "radiating from the buttock down the back of the thigh and below the "
            "knee, sometimes with tingling, numbness, or weakness. It usually "
            "comes from irritation of a lumbar nerve root (disc bulge, "
            "foraminal narrowing, etc.), not the hamstring. Key difference from "
            "muscle pain: sciatica travels BELOW the knee. Management: keep "
            "moving gently — walking is usually fine; avoid prolonged sitting and "
            "heavy lifting; positions that ease symptoms (sometimes lying with "
            "knees bent) can help. Most improve over weeks. Assess urgently for: "
            "progressive leg weakness, foot drop, loss of bladder/bowel control, "
            "or numbness in the saddle area (groin) — these can indicate serious "
            "nerve compression (e.g., cauda equina) needing emergency care."
        ),
        "zh": (
            "坐骨神经痛是沿坐骨神经走行的疼痛——常从臀部放射到大腿后侧并越过膝盖，"
            "有时伴刺痛、麻木或无力。通常源于腰椎神经根受刺激（椎间盘膨出、椎间孔"
            "狭窄等），而非腘绳肌问题。与肌肉痛的关键区别：坐骨神经痛会放射到膝盖"
            "以下。处理：继续轻柔活动——走路通常没问题；避免久坐和搬重物；寻找能"
            "缓解症状的姿势（有时屈膝侧卧有帮助）。多数数周内改善。需要紧急评估："
            "腿部无力进行性加重、足下垂、大小便失禁、或会阴区（腹股沟）麻木——这些"
            "可能提示严重神经受压（如马尾综合征），需要紧急处理。"
        ),
    },
    {
        "id": "neck-strain-whiplash",
        "tag": "injury",
        "topic_en": "Neck strain / whiplash",
        "topic_zh": "颈部拉伤 / 挥鞭伤",
        "en": (
            "Neck strain, often from sudden acceleration-deceleration (whiplash) "
            "or awkward sleeping positions, causes pain and stiffness in the "
            "neck and sometimes into the shoulder. Symptoms usually peak a day "
            "or two after the event. Management: gentle movement is better than "
            "immobilization — slow neck range-of-motion exercises, heat for "
            "muscle spasm, and good posture. Most whiplash improves within weeks "
            "with activity and time; stiff collars and prolonged rest slow "
            "recovery. Seek care for: pain radiating into the arms with numbness "
            "or weakness, severe headache, dizziness, vision changes, difficulty "
            "swallowing, or symptoms after a significant trauma such as a car "
            "accident or fall — those need proper assessment."
        ),
        "zh": (
            "颈部拉伤常由突然的加速-减速（挥鞭伤）或睡姿不当引起，表现为颈部疼痛"
            "僵硬，有时放射到肩部。症状通常在事件后一两天达到高峰。处理：轻柔活动"
            "优于固定——缓慢的颈部活动度练习，肌肉痉挛时热敷，保持良好姿势。多数"
            "挥鞭伤在数周内随活动和时间的推移而改善；硬颈托和长期休息反而延缓恢复。"
            "需要就医的情况：疼痛放射到手臂伴麻木或无力、严重头痛、头晕、视力变化、"
            "吞咽困难，或发生在车祸、摔倒等重大创伤之后——这些需要正规评估。"
        ),
    },
    # ── Shoulder ──────────────────────────────────────────────────────────────
    {
        "id": "rotator-cuff",
        "tag": "injury",
        "topic_en": "Rotator cuff injury",
        "topic_zh": "肩袖损伤",
        "en": (
            "The rotator cuff is a group of four muscles that stabilize the "
            "shoulder. Injuries range from tendinopathy (overload) to partial or "
            "full tears — common with repetitive overhead activity, lifting, or "
            "a fall on an outstretched arm. Symptoms: pain at the shoulder "
            "(often outer upper arm area), pain lifting the arm or at night "
            "when lying on the affected side, weakness. Management: relative "
            "rest from aggravating movements (overhead work, heavy lifting), "
            "progressive rotator cuff and scapular strengthening (isometrics, "
            "then bands), posture work, and gradual return to activity. Full-"
            "thickness tears in younger active people often benefit from surgical "
            "assessment; in older adults many tear without surgery yet function "
            "well with rehab. Night pain and weakness that persist through rehab "
            "warrant imaging."
        ),
        "zh": (
            "肩袖是稳定肩关节的一组四块肌肉。损伤从肌腱病变（过载）到部分或完全"
            "撕裂——常见于反复过头活动、举重或摔倒时手撑地。症状：肩部疼痛（常在上"
            "臂外侧）、抬臂或夜间压到患侧时疼痛、无力。处理：相对休息（避免过头"
            "工作和提重物），渐进加强肩袖和肩胛骨力量（等长收缩开始，再到弹力带），"
            "改善姿势，逐步恢复活动。年轻活跃人群的全层撕裂通常需要手术评估；老年人"
            "中许多虽撕裂但通过康复功能良好。康复期间持续存在的夜间痛和无力需要"
            "影像学检查。"
        ),
    },
    {
        "id": "shoulder-impingement",
        "tag": "injury",
        "topic_en": "Shoulder impingement",
        "topic_zh": "肩峰撞击综合征",
        "en": (
            "Shoulder impingement is pain when tendons or the bursa under the "
            "acromion get pinched during arm elevation. Hallmark: painful arc "
            "between about 60-120 degrees of raising the arm sideways or forward, "
            "pain with overhead reach, sometimes aching at night. Common in "
            "swimmers, throwers, and overhead workers. It is usually a control "
            "problem: weak or fatigued rotator cuff and scapular muscles let the "
            "humeral head ride up. Management: avoid the painful arc zone while "
            "rehabbing (don't force through pain), strengthen rotator cuff and "
            "lower/mid trapezius, improve scapular upward rotation and posture, "
            "and correct technique for overhead movements. Most resolve with "
            "consistent rehab over weeks; corticosteroid injection can reduce "
            "acute pain but is not a substitute for strengthening."
        ),
        "zh": (
            "肩峰撞击综合征是手臂上举时肩峰下的肌腱或滑囊被挤压而产生疼痛。典型"
            "表现：手臂侧举或前举到 60-120 度之间出现疼痛弧，过头伸手时痛，有时夜间"
            "酸痛。常见于游泳、投掷和过头工作的群体。这通常是控制问题：肩袖和肩胛"
            "肌薄弱或疲劳导致肱骨头向上移位。处理：康复期间避开疼痛弧区域（不要"
            "忍痛硬做），加强肩袖和斜方肌中下束，改善肩胛上旋和姿势，纠正过头动作"
            "技术。多数通过数周坚持康复而改善；皮质类固醇注射可减轻急性疼痛，但"
            "不能替代力量训练。"
        ),
    },
    {
        "id": "shoulder-dislocation",
        "tag": "injury",
        "topic_en": "Shoulder dislocation",
        "topic_zh": "肩关节脱位",
        "en": (
            "Shoulder dislocation is when the humeral head comes out of the "
            "socket — usually forward, from a fall on an outstretched arm or a "
            "forceful twist. Symptoms: severe pain, visible deformity (squared "
            "shoulder), arm held slightly away from the body, inability to move. "
            "DO NOT try to pop it back in — that risks nerve and blood vessel "
            "damage and further tissue injury. Immobilize the arm in the most "
            "comfortable position and go to the emergency department for X-ray "
            "and reduction. After reduction: wear a sling briefly, then begin "
            "rehab — range of motion, then rotator cuff and scapular strength — "
            "because young athletes have high recurrence rates without proper "
            "rehab. Repeat dislocations should be assessed for surgery."
        ),
        "zh": (
            "肩关节脱位是肱骨头滑出关节盂——通常向前脱位，常见于摔倒时手臂撑地或"
            "强力扭转。症状：剧痛、肩部变形（方肩）、手臂不自主地略离身体、无法活动。"
            "不要尝试自己把关节\"怼回去\"——那可能损伤神经血管并加重软组织损伤。"
            "将手臂固定在最舒适的姿势，立即去急诊拍 X 线并由医生复位。复位后：短期"
            "使用吊带，然后开始康复——活动度训练，再加强肩袖和肩胛力量——因为年轻"
            "运动员若不正规康复，复发率很高。反复脱位应评估是否需要手术。"
        ),
    },
    {
        "id": "frozen-shoulder",
        "tag": "injury",
        "topic_en": "Frozen shoulder (adhesive capsulitis)",
        "topic_zh": "冻结肩（肩周炎/五十肩）",
        "en": (
            "Frozen shoulder is progressive stiffness of the shoulder joint — "
            "the capsule thickens and tightens. It passes through phases: "
            "freezing (painful, movement decreasing), frozen (stiff, less pain), "
            "and thawing (gradual return of motion). It can follow injury or "
            "surgery, and is more common in people with diabetes. Full recovery "
            "often takes 12-24 months even untreated. Management: pain control, "
            "gentle regular stretching and range-of-motion (within tolerable "
            "pain), physiotherapy, and in persistent cases intra-articular "
            "injection or manipulation. Reassurance matters — it is not "
            "permanent damage, and most people regain good function. Aggressive "
            "stretching beyond pain often flares symptoms; consistency beats force."
        ),
        "zh": (
            "冻结肩（肩周炎/五十肩）是肩关节进行性僵硬——关节囊增厚收紧。分阶段："
            "冻结前期（疼痛、活动度下降）、冻结期（僵硬、疼痛减轻）、解冻期（活动度"
            "逐渐恢复）。可能继发于损伤或手术后，糖尿病者更常见。即使不治疗，完全"
            "恢复常需 12-24 个月。处理：控制疼痛、规律轻柔拉伸和活动度练习（在可"
            "耐受疼痛范围内）、物理治疗，持续顽固者可行关节内注射或手法松解。需要"
            "说明的是：这不是永久性损伤，多数人能恢复良好功能。过度用力拉伸往往会"
            "加重症状；坚持比用力更重要。"
        ),
    },
    # ── Elbow & wrist ─────────────────────────────────────────────────────────
    {
        "id": "tennis-elbow",
        "tag": "injury",
        "topic_en": "Tennis elbow (lateral epicondylitis)",
        "topic_zh": "网球肘（肱骨外上髁炎）",
        "en": (
            "Tennis elbow is pain on the OUTSIDE of the elbow at the bump where "
            "the wrist extensor tendons attach. Despite the name, it usually "
            "comes from repetitive gripping, typing, or racket work rather than "
            "elite tennis. Symptoms: aching lateral elbow pain, worse with "
            "gripping, lifting, or shaking hands, tenderness at the bony bump. "
            "It is tendinopathy (load problem), not acute inflammation. "
            "Management: reduce aggravating grip/extension loads, wrist extensor "
            "stretching, progressive eccentric strengthening of the wrist "
            "extensors, and review of ergonomics/technique. Symptoms often take "
            "weeks to months to settle. A counterforce strap can help during "
            "activity. Persistent pain should be assessed — the same pattern can "
            "come from neck or shoulder dysfunction."
        ),
        "zh": (
            "网球肘是肘外侧骨突处（腕伸肌腱附着点）疼痛。虽然名字叫\"网球肘\"，但"
            "通常来自反复抓握、打字或球拍类工作，而非专业网球。症状：肘外侧酸痛，"
            "抓握、提物或握手时加重，骨突处压痛。这是肌腱病变（负荷问题）而非急性"
            "炎症。处理：减少诱发抓握/伸展负荷，拉伸腕伸肌，逐步进行腕伸肌离心力量"
            "训练，检查工效学和动作技术。症状常需数周到数月才能消退。活动时可使用"
            "护肘带辅助。持续疼痛需评估——同样的表现也可能来自颈部或肩部功能障碍。"
        ),
    },
    {
        "id": "wrist-sprain",
        "tag": "injury",
        "topic_en": "Wrist sprain / possible fracture",
        "topic_zh": "腕部扭伤 / 可能骨折",
        "en": (
            "Wrist injuries from falls on an outstretched hand can be sprains "
            "(ligament stretch/tear) or fractures. Clinical clues for fracture: "
            "point tenderness directly over a bone, swelling that develops "
            "quickly, deformity, severe pain with gripping or pressing the "
            "thumb side. A scaphoid fracture is especially sneaky — pain in the "
            "anatomical snuffbox (thumb-side hollow) that persists after a fall "
            "can be a broken scaphoid with a NORMAL initial X-ray, and untreated "
            "it can fail to heal. Rule: any wrist pain with snuffbox tenderness "
            "after a fall should be treated as a possible scaphoid fracture and "
            "followed up (repeat imaging or MRI). Otherwise: RICE, splint "
            "protection, and graduated movement as pain allows."
        ),
        "zh": (
            "摔倒手撑地导致的腕部损伤可能是扭伤（韧带拉伤/撕裂）也可能是骨折。骨折"
            "线索：骨面上直接点压痛、迅速肿胀、变形、抓握或按压拇指侧时剧痛。舟骨"
            "骨折尤其隐蔽——摔倒后\"解剖鼻烟壶\"（拇指侧凹陷处）持续疼痛可能是舟骨"
            "骨折，而初期 X 线可完全正常，不及时治疗可能不愈合。原则：摔倒后腕痛伴"
            "鼻烟壶压痛，应按可能舟骨骨折处理并随访（复查影像或 MRI）。否则按 RICE"
            "处理，支具保护，疼痛允许时逐步活动。"
        ),
    },
    {
        "id": "head-injury-concussion",
        "tag": "red-flag",
        "topic_en": "Head injury & concussion",
        "topic_zh": "头部损伤与脑震荡",
        "en": (
            "Any head injury with loss of consciousness, confusion, repeated "
            "vomiting, worsening headache, seizure, unequal pupils, weakness, or "
            "slurred speech needs URGENT emergency evaluation. Concussion is a "
            "mild traumatic brain injury: symptoms include headache, dizziness, "
            "blurred vision, sensitivity to light/noise, poor concentration, "
            "memory issues, nausea, mood changes, sleep disturbance. Red flag "
            "after concussion: symptoms that keep worsening, any 'red flag' "
            "above, or neck pain. Management: physical AND cognitive rest for "
            "24-48 hours, then GRADUAL return to normal activity — no screens/"
            "school/work marathons, then light aerobic activity once symptoms "
            "settle, before any sport. An athlete with suspected concussion must "
            "be removed from play immediately and cleared by a professional "
            "before returning to contact sport — same-day return is never "
            "acceptable."
        ),
        "zh": (
            "任何头部受伤后出现意识丧失、意识混乱、反复呕吐、头痛加重、抽搐、瞳孔"
            "不等大、肢体无力或言语不清，都需要紧急急诊评估。脑震荡是轻度创伤性脑"
            "损伤：症状包括头痛、头晕、视物模糊、畏光畏声、注意力差、记忆力问题、"
            "恶心、情绪变化、睡眠紊乱。脑震荡后的危险信号：症状持续加重、出现上述"
            "任一危险信号、或伴颈部疼痛。处理：24-48 小时身体和认知双休息，然后"
            "逐步恢复正常活动——不要长时间刷屏/高强度学习，症状稳定后再进行轻度"
            "有氧运动，之后才能考虑运动专项。疑似脑震荡的运动员必须立即离场，并由"
            "专业人员评估后才能回归对抗性运动——当天重返赛场绝不允许。"
        ),
    },
    # ── Rehab principles ──────────────────────────────────────────────────────
    {
        "id": "healing-phases",
        "tag": "rehab",
        "topic_en": "Healing phases",
        "topic_zh": "愈合分期",
        "en": (
            "Soft-tissue healing follows three overlapping phases. 1) Inflammatory "
            "(days 0-3+): bleeding stops, immune cells clean damaged tissue; "
            "swelling, heat, redness and pain are NORMAL — they are the body "
            "starting repairs, not a sign that something is wrong. 2) Proliferative/"
            "repair (day 2 through weeks): new tissue (collagen) is laid down, "
            "becoming stronger as it matures; early gentle movement aligns the "
            "new fibers. 3) Remodeling (weeks to months): tissue reorganizes "
            "and gains strength toward normal; this is why 'feeling better' does "
            "not mean 'fully healed' — strength lags behind pain relief. Loading "
            "matters at every stage: too much too soon inflames, too little "
            "weakens. Progress gradually and let symptoms guide you."
        ),
        "zh": (
            "软组织愈合分三个重叠阶段。1) 炎症期（第 0-3 天及以后）：止血，免疫细胞"
            "清理受损组织；肿胀、发热、发红和疼痛是正常现象——这是身体启动修复的"
            "信号，而非出了问题。2) 增殖/修复期（第 2 天至数周）：新组织（胶原）"
            "形成并随成熟而增强；早期轻柔活动有助于新纤维排列。3) 重塑期（数周至"
            "数月）：组织重新排列并逐渐恢复到接近正常的强度——这就是为什么\"感觉"
            "好了\"不等于\"完全愈合\"：力量恢复落后于疼痛消失。每个阶段负荷都很重要："
            "过多过急会加重炎症，过少会让组织变弱。循序渐进，以症状为指引。"
        ),
    },
    {
        "id": "return-to-sport",
        "tag": "rehab",
        "topic_en": "Return to sport criteria",
        "topic_zh": "回归运动标准",
        "en": (
            "Returning to sport too early is the #1 cause of re-injury. Use "
            "clear criteria, not just 'it feels okay'. Checklist: 1) pain-free "
            "with daily activities; 2) full or near-full range of motion "
            "compared with the uninjured side; 3) strength within ~90% of the "
            "other side; 4) balance/control restored (e.g., single-leg hop "
            "symmetry); 5) can perform sport-specific movements (sprinting, "
            "cutting, jumping) without pain or giving way; 6) graduated exposure "
            "— start with half-speed practice, then full practice, then "
            "competition. Re-injury risk is highest in the first weeks back, so "
            "keep up maintenance strength work even after returning. When in "
            "doubt, get a professional clearance."
        ),
        "zh": (
            "过早回归运动是复发损伤的第一大原因。要用明确标准判断，而不是\"感觉还"
            "行\"。清单：1) 日常活动无痛；2) 活动度与健侧相当或接近；3) 力量达到健侧"
            "的约 90%；4) 平衡/控制恢复（如单腿跳对称性）；5) 能无痛、不发软地完成"
            "专项动作（冲刺、变向、跳跃）；6) 分级暴露——先半速训练，再全速训练，再"
            "比赛。回归后的头几周复发风险最高，因此即使回归后也要继续维持性力量"
            "训练。拿不准时，请专业人士评估放行。"
        ),
    },
    {
        "id": "load-management",
        "tag": "rehab",
        "topic_en": "Load management (10% rule etc.)",
        "topic_zh": "负荷管理（如 10% 原则）",
        "en": (
            "Most overuse injuries are load errors: doing too much, too fast, "
            "too soon. The general rule is to increase training volume by no "
            "more than about 10% per week (though this is a guide, not a law "
            "— listen to your body and your symptoms). Other load factors "
            "matter too: intensity, frequency, new exercise types, harder "
            "surfaces, new footwear, fatigue, sleep, stress. Pain during "
            "activity is feedback, not weakness: mild discomfort during exercise "
            "that settles and is not worse the next morning is usually "
            "acceptable; sharp pain, pain that worsens during activity, or "
            "night pain means back off. After illness, injury, or a training "
            "gap, your capacity is lower — rebuild gradually with reduced volume."
        ),
        "zh": (
            "大多数过度使用损伤都是负荷错误：做得太多、太快、太急。一般原则是每周"
            "训练量增幅不超过约 10%（这是参考而非铁律——要倾听身体和症状）。其他"
            "负荷因素也很重要：强度、频率、新动作类型、更硬的地面、新鞋、疲劳、"
            "睡眠、压力。运动中的疼痛是反馈而非软弱：运动中轻度不适、随后消退且"
            "次日早晨没有加重，通常可接受；刺痛、运动中加重或夜间痛——就要减量。"
            "生病、受伤或训练中断后，你的承受能力会下降——要以更低的量逐步重建。"
        ),
    },
    {
        "id": "ice-vs-heat",
        "tag": "basics",
        "topic_en": "Ice vs heat — when to use",
        "topic_zh": "冰敷还是热敷——何时使用",
        "en": (
            "ICE is for acute injuries (first 48-72 hours) and flare-ups after "
            "activity: it numbs pain, reduces acute swelling, and calms the "
            "reaction to new trauma. Apply 15-20 minutes, with a cloth barrier, "
            "never directly on skin, and wait at least 1-2 hours between "
            "sessions. Do not ice immediately before exercise if it masks pain "
            "you need to feel (use it after instead). HEAT is for chronic "
            "stiffness and muscle spasm: it relaxes tight muscles and increases "
            "blood flow. Use 15-20 minutes before exercise or stretching. "
            "NEVER use heat on a fresh injury, an area that is hot/swollen, or a "
            "recently injured area that still feels hot at rest — it increases "
            "bleeding and swelling. When in doubt about a new injury: ice."
        ),
        "zh": (
            "冰敷用于急性损伤（伤后 48-72 小时内）和运动后急性发作：可麻痹疼痛、"
            "减轻急性肿胀、抑制对新创伤的反应。每次 15-20 分钟，隔布使用，绝不能"
            "直接接触皮肤，两次之间至少间隔 1-2 小时。运动前不要用冰敷掩盖需要"
            "感知的疼痛（应运动后使用）。热敷用于慢性僵硬和肌肉痉挛：放松紧张肌肉、"
            "促进血液循环，每次 15-20 分钟，运动或拉伸前使用。新伤、发热/肿胀的"
            "部位、或休息时仍觉发热的近期伤处，绝不能用热敷——会加重出血和肿胀。"
            "对新鲜损伤拿不准时，用冰。"
        ),
    },
    {
        "id": "nsaids",
        "tag": "basics",
        "topic_en": "Pain relievers (NSAIDs) basics",
        "topic_zh": "止痛药（NSAIDs）基础",
        "en": (
            "NSAIDs (ibuprofen, naproxen, diclofenac) reduce pain and "
            "inflammation but do NOT speed healing — some evidence suggests "
            "heavy use early on may even slightly delay tissue repair by "
            "blunting the inflammatory phase. Use them for symptom control at "
            "the lowest effective dose and shortest duration, and only if you "
            "have no contraindications (allergy, stomach ulcers, kidney disease, "
            "or taking blood thinners — check with a professional if unsure). "
            "Never combine multiple NSAIDs. Paracetamol (acetaminophen) is an "
            "alternative for pain without much anti-inflammatory effect. "
            "Corticosteroid injections are strong anti-inflammatories but "
            "repeated use in tendons can weaken them long-term. Pain relief is "
            "a tool, not the treatment — rehab fixes the cause."
        ),
        "zh": (
            "非甾体抗炎药（布洛芬、萘普生、双氯芬酸）可缓解疼痛和炎症，但不能加速"
            "愈合——部分证据显示早期大量使用甚至可能因抑制炎症期而略微延迟组织修复。"
            "用于症状控制时，应在最低有效剂量、最短时间内使用，且仅在无禁忌证时"
            "使用（过敏、胃溃疡、肾病、或正在服用抗凝药——不确定时先咨询专业人士）。"
            "不要同时使用多种 NSAIDs。对乙酰氨基酚（扑热息痛）是替代选择，止痛但"
            "抗炎作用较弱。皮质类固醇注射是强效抗炎药，但肌腱部位反复注射可能长期"
            "削弱肌腱。止痛只是工具，不是治疗——康复才能解决根本原因。"
        ),
    },
    {
        "id": "stretching-vs-strengthening",
        "tag": "basics",
        "topic_en": "Stretching vs strengthening",
        "topic_zh": "拉伸 vs 力量训练",
        "en": (
            "Stretching and strengthening solve different problems. Stretching "
            "improves range of motion and is best done when warm (after "
            "activity or a warm-up), held 20-30 seconds for static work, and "
            "should never be forced into sharp pain. Strengthening builds "
            "capacity and is what prevents injury and drives most rehab — "
            "strong muscles, tendons and bones tolerate load. For many injuries "
            "(tendinopathy, strains), STRENGTHENING is the active treatment; "
            "stretching alone rarely fixes them and can aggravate some "
            "conditions (e.g., sharp stretching of a strained muscle in the "
            "first days). During rehab, combine both: gentle stretching for "
            "range, progressive strengthening for capacity. For performance, "
            "strength and control matter more than flexibility."
        ),
        "zh": (
            "拉伸和力量训练解决不同的问题。拉伸改善活动度，最好在身体热身后进行"
            "（运动后或热身后），静态拉伸保持 20-30 秒，绝不要强行进入锐痛。力量"
            "训练建立承受能力，是预防损伤和驱动大多数康复的关键——强壮的肌肉、"
            "肌腱和骨骼能耐受负荷。对许多损伤（肌腱病变、拉伤），力量训练才是主动"
            "治疗手段；单纯拉伸很少能治愈，有时还会加重某些情况（如拉伤后最初几天"
            "用力拉伸）。康复期两者结合：轻柔拉伸保活动度，渐进力量保承受力。就运动"
            "表现而言，力量和动作控制比柔韧性更重要。"
        ),
    },
    {
        "id": "rest-vs-movement",
        "tag": "basics",
        "topic_en": "Rest vs movement after injury",
        "topic_zh": "伤后休息 vs 活动",
        "en": (
            "Complete rest was once the default for injuries; modern rehab "
            "moves toward 'relative rest' and early activation. Too much rest "
            "causes muscle weakness, joint stiffness, reduced blood flow, and "
            "slower recovery. Unless a professional says otherwise (e.g., a "
            "fracture needing immobilization, after some surgeries), keep the "
            "injured area moving within PAIN-FREE or mildly uncomfortable "
            "limits from day one: gentle range of motion, isometric "
            "contractions, and pain-free loading. The body needs movement to "
            "heal properly — tendons and ligaments remodel along lines of "
            "stress. A useful rule: 0-2/10 pain during activity is fine, 3/10 "
            "is borderline, anything sharper or keeping you awake at night "
            "means dial it back. Pain that is worse the next morning = too much "
            "yesterday."
        ),
        "zh": (
            "完全休息曾是损伤处理的默认方案；现代康复转向\"相对休息\"和早期激活。"
            "过度休息会导致肌肉无力、关节僵硬、血流减少、恢复变慢。除非专业人士"
            "另有指示（如骨折需要固定、某些手术后），从第一天起就应在无痛或轻微"
            "不适范围内活动伤处：轻柔活动度练习、等长收缩、无痛负荷。身体需要活动"
            "才能正确愈合——肌腱和韧带沿应力方向重塑。实用规则：活动中 0-2/10 的"
            "疼痛没问题，3/10 是临界点，更尖锐或夜间痛醒就意味着要减量。次日早晨"
            "更痛 = 昨天做多了。"
        ),
    },
    {
        "id": "fracture-vs-sprain",
        "tag": "basics",
        "topic_en": "Fracture vs sprain",
        "topic_zh": "骨折还是扭伤",
        "en": (
            "Distinguishing a fracture from a sprain without imaging is "
            "unreliable, but some clues help. Fracture clues: a clear snap or "
            "crack at the moment of injury, point tenderness directly over a "
            "bone, pain that prevents any weight-bearing, deformity or unusual "
            "angle, rapid significant swelling, pain when pressing on the bone "
            "away from the soft tissue, bruising appearing very fast. Sprains "
            "usually hurt more over ligaments and with specific movements. "
            "Ottawa rules for the ankle/foot: X-ray is needed if you cannot "
            "take four steps immediately AND have bone tenderness at the "
            "malleoli (ankle) or base of the 5th metatarsal/navicular (foot); "
            "similar rules exist for the knee. General rule: if you cannot bear "
            "weight for four steps, or bone pain is severe and point-specific, "
            "get it X-rayed."
        ),
        "zh": (
            "没有影像学检查，单靠症状区分骨折和扭伤不可靠，但有些线索有帮助。骨折"
            "线索：受伤瞬间清晰的\"咔嚓\"声、骨面上直接点压痛、疼痛导致完全无法"
            "承重、变形或角度异常、迅速明显肿胀、按压远离软组织的骨面时疼痛、淤青"
            "出现极快。扭伤通常在韧带位置、特定动作时更痛。踝/足部渥太华规则：若"
            "无法立即走四步，且踝部内/外踝或足部第 5 跖骨基底/舟骨有骨压痛，需要"
            "拍 X 线；膝关节也有类似规则。一般原则：无法承重走四步，或骨痛剧烈且"
            "定位明确，就去拍 X 线。"
        ),
    },
    {
        "id": "swelling-management",
        "tag": "basics",
        "topic_en": "Swelling management",
        "topic_zh": "消肿处理",
        "en": (
            "Swelling after injury is the body delivering repair cells and "
            "fluid — some swelling is normal and necessary. Excessive or "
            "prolonged swelling, however, slows recovery and limits movement. "
            "Management: elevation (above the heart whenever resting) works "
            "best in the first days; compression bandaging (firm but not "
            "cutting circulation, remove at night unless instructed); gentle "
            "active movement pumps fluid out — ankle pumps, quad sets, finger "
            "flexion act as a 'muscle pump'; ice in the acute phase for comfort. "
            "Avoid: massaging a freshly injured area hard, heat on new "
            "swelling, and standing still for long periods. If swelling is "
            "massive, rapidly increasing, or accompanied by extreme pain, "
            "numbness, or cold/pale skin, get urgent assessment."
        ),
        "zh": (
            "受伤后肿胀是身体输送修复细胞和体液的过程——一定程度的肿胀是正常且必要"
            "的。但过度或长期肿胀会拖慢恢复并限制活动。处理：抬高（休息时尽量高于"
            "心脏）在前几天最有效；加压包扎（紧而不勒，除非医嘱否则夜间取下）；"
            "轻柔主动活动通过\"肌肉泵\"把液体泵出——踝泵、股四头肌等长收缩、手指"
            "屈伸；急性期冰敷缓解不适。避免：用力按摩新伤部位、对新肿胀热敷、长时间"
            "静止站立。如果肿胀巨大、迅速加重、或伴有剧痛、麻木、皮肤发冷发白，需"
            "紧急评估。"
        ),
    },
    {
        "id": "nutrition-recovery",
        "tag": "basics",
        "topic_en": "Nutrition for recovery",
        "topic_zh": "恢复期营养",
        "en": (
            "Healing tissue needs building blocks. Protein is the priority: "
            "spread ~1.6-2.2 g/kg of body weight per day across meals during "
            "injury recovery (a small injury needs the higher end for a while; "
            "most active people land in the 1.2-2.0 range daily). Vitamin C "
            "supports collagen formation (fruits and vegetables); vitamin D "
            "and calcium support bone healing; zinc and iron help tissue "
            "repair. Stay well hydrated — dehydration slows every repair "
            "process. Avoid heavy alcohol, which impairs healing and sleep "
            "quality, and don't over-restrict calories during recovery — an "
            "energy deficit delays tissue repair. Whole foods beat supplements "
            "for most people; a professional assessment is reasonable for "
            "long-term or repeated injuries."
        ),
        "zh": (
            "愈合中的组织需要建筑材料。蛋白质是重点：损伤恢复期按每天每公斤体重"
            "约 1.6-2.2 克分配到各餐（小损伤短期内可取上限；多数活跃人士日常在"
            "1.2-2.0 克区间）。维生素 C 支持胶原形成（蔬果来源）；维生素 D 和钙"
            "支持骨骼愈合；锌和铁帮助组织修复。保持充分补水——脱水会拖慢所有修复"
            "过程。避免大量饮酒（损害愈合和睡眠质量），恢复期不要过度限制热量——"
            "能量亏空会延迟组织修复。对多数人而言，天然食物优于补剂；长期或反复"
            "损伤建议专业评估营养。"
        ),
    },
    {
        "id": "sleep-recovery",
        "tag": "basics",
        "topic_en": "Sleep & recovery",
        "topic_zh": "睡眠与恢复",
        "en": (
            "Sleep is when the body does most of its repair work: growth "
            "hormone release peaks during deep sleep, collagen synthesis "
            "increases, and inflammation is regulated. Poor sleep — even a few "
            "short nights — measurably slows injury recovery, increases pain "
            "sensitivity, and raises injury risk on the field. Practical "
            "targets during recovery: 7-9 hours, consistent schedule, cool "
            "dark bedroom, no screens 30-60 minutes before bed, limit caffeine "
            "after early afternoon, and manage stress (which also suppresses "
            "immune and repair function). If pain keeps you awake, position "
            "the injured area comfortably (pillows to elevate), take pain "
            "relief as prescribed/advised, and address the cause during the "
            "day rather than pushing through on adrenaline."
        ),
        "zh": (
            "睡眠是身体完成大部分修复工作的时间：深睡眠期生长激素分泌达峰、胶原"
            "合成增加、炎症受到调节。睡眠差——哪怕连续几个短夜——都会明显拖慢损伤"
            "恢复、提高疼痛敏感度、并增加场上的受伤风险。恢复期的实用目标：7-9 小时、"
            "作息规律、卧室凉爽黑暗、睡前 30-60 分钟不刷屏、午后尽早停止摄入咖啡因、"
            "并管理压力（压力同样抑制免疫和修复功能）。如果疼痛影响入睡，用枕头把"
            "伤处垫到舒适位置，按医嘱/建议服用止痛药，并白天解决根本原因，而不是靠"
            "硬撑。"
        ),
    },
    {
        "id": "anatomy-basics",
        "tag": "basics",
        "topic_en": "Anatomy basics: tendons, ligaments, muscles",
        "topic_zh": "解剖基础：肌腱、韧带、肌肉",
        "en": (
            "Knowing the tissue types explains why injuries behave differently. "
            "LIGAMENTS connect bone to bone and stabilize joints; they have "
            "poor blood supply, heal slowly, and once stretched rarely return "
            "to full original tension — which is why balance and strength "
            "training matter after sprains. TENDONS connect muscle to bone and "
            "transmit force; they tolerate load well but respond badly to "
            "sudden load spikes (tendinopathy). MUSCLES are highly vascularized "
            "and heal relatively quickly from strains, but lose strength fast "
            "with inactivity. BONE heals by forming callus and generally "
            "remodels well, but needs immobilization first. CARTILAGE (joint "
            "surfaces, menisci) has the poorest blood supply and the hardest "
            "time healing. Each type follows the same rehab principle: protect "
            "early, then graded loading."
        ),
        "zh": (
            "了解组织类型就能理解损伤为何表现不同。韧带连接骨与骨、稳定关节；血供差、"
            "愈合慢，一旦被拉长很少能恢复原有张力——这就是扭伤后要做平衡和力量训练"
            "的原因。肌腱连接肌肉与骨、传递力量；耐受负荷好，但对突然的负荷激增"
            "反应差（肌腱病变）。肌肉血管丰富，拉伤后相对愈合较快，但停止活动后"
            "力量流失也快。骨骼通过形成骨痂愈合，重塑良好，但首先需要固定。软骨"
            "（关节面、半月板）血供最差、最难愈合。所有组织遵循同一康复原则：早期"
            "保护，然后分级加载。"
        ),
    },
    {
        "id": "overuse-vs-acute",
        "tag": "basics",
        "topic_en": "Overuse vs acute injury",
        "topic_zh": "过劳损伤 vs 急性损伤",
        "en": (
            "ACUTE injuries happen in a moment — a twist, a fall, a collision — "
            "and usually involve a clear mechanism, sudden pain, swelling, or "
            "deformity. OVERUSE injuries build gradually: pain starts as a "
            "niggle, worsens with repeated activity, improves with rest, and "
            "has no single dramatic moment. Examples: shin splints, "
            "tendinopathies, stress fractures, runner's knee. The treatment "
            "difference matters: acute injuries need immediate damage control "
            "(protect, ice, elevate) and an accurate diagnosis; overuse "
            "injuries are almost always LOAD errors that need load "
            "modification — find the activity that reproduces pain and reduce "
            "it, rather than stopping all movement. Chronic nagging pain "
            "lasting 3+ months should be assessed professionally rather than "
            "endlessly self-managed."
        ),
        "zh": (
            "急性损伤发生在一瞬间——扭转、摔倒、碰撞——通常有明确的受伤机制、突发"
            "疼痛、肿胀或变形。过劳损伤逐渐累积：疼痛从小不适开始，随反复活动加重、"
            "休息后缓解，没有戏剧性的单一时刻。例子：胫骨痛、肌腱病变、应力性骨折、"
            "跑步膝。治疗差异很重要：急性损伤需要立即的损伤控制（保护、冰敷、抬高）"
            "和准确诊断；过劳损伤几乎都是负荷错误，需要调整负荷——找到诱发疼痛的"
            "活动并减少它，而不是完全停止运动。慢性酸痛持续 3 个月以上应寻求专业"
            "评估，而不是无限期自行管理。"
        ),
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# Embedding
# ─────────────────────────────────────────────────────────────────────────────
def embed_batch(api_key, texts):
    """Embed a list of texts. Returns list of normalized vectors."""
    req = urllib.request.Request(
        EMBED_URL,
        data=json.dumps(
            {"model": EMBED_MODEL, "input": texts, "dimensions": EMBED_DIMS}
        ).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + api_key,
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.load(resp)
    vecs = [d["embedding"] for d in data["data"]]
    return [normalize(v) for v in vecs]


def normalize(v):
    norm = math.sqrt(sum(x * x for x in v))
    if norm == 0:
        return v
    return [x / norm for x in v]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="kb/medical-kb.json")
    args = ap.parse_args()

    api_key = os.environ.get("ZHIPU_API_KEY")
    if not api_key:
        sys.exit("ZHIPU_API_KEY env var required")

    payloads = []
    for c in CHUNKS:
        payloads.append(c["en"] + "\n" + c["zh"])

    print(f"Embedding {len(payloads)} chunks in batches of {BATCH}...")
    vectors = []
    for i in range(0, len(payloads), BATCH):
        batch = payloads[i : i + BATCH]
        vectors.extend(embed_batch(api_key, batch))
        print(f"  {min(i + BATCH, len(payloads))}/{len(payloads)}")

    out_chunks = []
    for c, vec in zip(CHUNKS, vectors):
        out_chunks.append(
            {
                "id": c["id"],
                "tag": c["tag"],
                "topic_en": c["topic_en"],
                "topic_zh": c["topic_zh"],
                "en": c["en"],
                "zh": c["zh"],
                "vec": vec,
            }
        )

    doc = {
        "v": 1,
        "model": EMBED_MODEL,
        "dims": EMBED_DIMS,
        "normalized": True,
        "count": len(out_chunks),
        "chunks": out_chunks,
    }
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    size_kb = os.path.getsize(args.out) / 1024
    print(f"Wrote {args.out} — {doc['count']} chunks, {size_kb:.0f} KB")


if __name__ == "__main__":
    main()
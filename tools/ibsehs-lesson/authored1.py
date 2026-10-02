# -*- coding: utf-8 -*-
"""Authored layer for the Chapter 1 focus lesson.

One entry per chapter-1 section, keyed by the EXACT English section title used
by IBSEHS_NATIVE / IB_DEEP / IB_VISUALS (all three share that key space).

  sum      - the summary, one sentence per slide, **term** bolds the key words
  analogy  - one analogy, rendered in the red quadrilateral
  example  - one concrete sport example, rendered in the blue quadrilateral

Everything else on the slide (definitions, key idea, figure, table, numbers,
careful, flashcard, question) is derived from the files the course page already
loads, so nothing here can drift out of date against the syllabus.

Rules that keep the bilingual pair honest:
  - same number of sentences in both languages, paired in order
  - ** is used only for terms that also appear in the section's key-term list,
    so the drill blanks a word the glossary will later define
  - no sentence is allowed to run past ~200 characters, because one sentence is
    one screen
"""

A = {}

# ══════════════════════════════════════════════════════════════════ A.1.1 ══

A['Communication systems'] = dict(
    sum=[
        dict(en="Your body runs on two communication systems, and the faster one is the one you never notice.",
             zh="身体有两套通讯系统，而更快的那套你几乎察觉不到。"),
        dict(en="The **nervous system** sends **electrical impulses** along **neurones**, and passes the message across every gap using **neurotransmitters**.",
             zh="**神经系统**沿**神经元**传递**电脉冲**，并在每一道空隙处用**神经递质**交接信息。"),
        dict(en="One nerve signal is therefore **electrical → chemical → electrical**: electricity down the wire, a chemical crossing each **synapse**, electricity again on the far side.",
             zh="所以一个神经信号是**电 → 化学 → 电**：在线上是电，在每个**突触**处是化学，到了对侧又是电。"),
        dict(en="The **endocrine system** skips the wiring entirely. A **gland** releases **hormones** straight into the **bloodstream**, and the blood carries them to every corner of the body.",
             zh="**内分泌系统**完全不需要导线。**腺体**把**激素**直接释放进**血液**，血液再把它带到全身每个角落。"),
        dict(en="But only **target cells** answer. A cell is a target only if it carries the matching **receptor**, which is shaped like a lock the hormone fits.",
             zh="但只有**靶细胞**会回应。一个细胞要成为靶细胞，必须带有相应的**受体**——它的形状像一把恰好配得上的锁。"),
        dict(en="That one difference explains the rest: nerves are **milliseconds**, **local** and precise, while hormones take **seconds to days** and reach **everywhere**.",
             zh="这一个差别就解释了一切：神经是**毫秒级**、**局部**而精准；激素则是**秒到天**，并且**无处不到**。"),
        dict(en="It also explains why a hormone cannot be aimed. Because there is no wire to pin it to one place, an unwanted **side effect** is felt body-wide.",
             zh="这也解释了为什么激素无法瞄准：没有导线把它钉在某处，不想要的**副作用**就会波及全身。"),
    ],
    analogy=dict(
        en="A nerve is a **light switch**. A hormone is a **notice on a board**. The switch only affects the room it is wired to, and it does it instantly. The notice reaches every corridor in the building — but only the students who read it act on it, and only when they happen to pass it.",
        zh="神经是**电灯开关**，激素是**布告栏上的一张通知**。开关只影响它接了线的那间房，而且立刻生效；通知会传遍整栋楼的每条走廊，但只有读到的学生才会照做，而且要等他们路过时。"),
    example=dict(
        en="The gun fires in a 100 m sprint and your leg muscles are already contracting, because a nerve impulse got there in well under a second. Waiting for adrenaline to arrive would mean standing on the blocks. Adrenaline then takes over the next half-minute or so and does the slower work: heart rate up, blood sent to the muscles, glucose freed from the liver. Two systems, one race, each doing the job it is actually suited to.",
        zh="100米短跑发枪的瞬间，你的腿部肌肉已经开始收缩，因为神经冲动在远不到一秒内就传到了。如果等肾上腺素送过来，你会一直站在起跑器上。接着肾上腺素接管接下来的大约半分钟，做那些慢的工作：心率上升、血液流向肌肉、肝脏释放葡萄糖。两套系统、一场比赛，各自做着它们真正擅长的事。"),
)

A['Neural pathways and coordination'] = dict(
    sum=[
        dict(en="The **central nervous system** is the brain and spinal cord. Everything else — every nerve running to a muscle, a gland, a piece of skin — is the **peripheral nervous system**.",
             zh="**中枢神经系统**是脑和脊髓。其余一切——通往肌肉、腺体、皮肤的所有神经——都是**周围神经系统**。"),
        dict(en="The spinal cord is not just a cable. It is a decision-making centre in its own right, which is why a reflex can work even when the brain never hears about it.",
             zh="脊髓不只是一根缆索，它本身就是独立的决策中心——所以反射发生时大脑可以完全不知情。"),
        dict(en="A **reflex** runs on a shortcut: receptor → spinal cord → muscle, with no detour to the brain and no decision required.",
             zh="**反射**走的是一条捷径：感受器 → 脊髓 → 肌肉，不必绕道大脑，也不需要任何决策。"),
        dict(en="**Somatic** control drives **skeletal muscle**, so it is voluntary and it moves you. **Autonomic** control runs your organs, so it is involuntary and it keeps you alive.",
             zh="**躯体**神经支配**骨骼肌**，因此它是随意的、指挥你动作的；**自主**神经管理你的器官，因此它是不随意的、维持你生命的。"),
        dict(en="Coordinated movement is not one system winning. It is sensory input and motor output running at the same time, with the brain adding only the timing and the fine adjustment.",
             zh="协调的动作不是某一套系统赢了，而是感觉输入与运动输出同时进行，大脑只额外补上时机和细微的修正。"),
    ],
    analogy=dict(
        en="Think of the spinal cord as a **local post office** and the brain as the **head office**. A letter from the hand to a fingertip travels to the local branch first — that is the reflex. Only if the branch thinks it matters does it escalate to head office, and only head office sends back a considered, voluntary instruction.",
        zh="把脊髓想成**本地邮局**，大脑是**总部**。从手到指尖的“信件”先送到本地网点——那就是反射。只有网点认为这事重要，它才上报总部；也正是总部会回寄一封经过权衡的、随意的指令。"),
    example=dict(
        en="You land badly from a rebound and your knee jerks before you feel anything. That is the knee-jerk reflex: the sensory nerve fired, the spinal cord decided, and the quadriceps was told to contract, all inside about 50 milliseconds. Had the reflex been voluntary, you would have been on your way down before the decision arrived. Now compare the same athlete deliberately lifting a bar: that is somatic control, brain-led and slow enough to be corrected.",
        zh="你抢篮板落地不稳，膝盖在你还没感觉到之前就已经弹了一下。这就是膝反射：感觉神经放电，脊髓做出决定，四头肌被命令收缩，整个过程大约只用50毫秒。如果这个反射要靠大脑随意决定，你人还在往下掉就已经落地了。再对比同一位运动员刻意举起一根杠铃：那是躯体神经控制，由大脑主导，慢到足以随时修正。"),
)

# ══════════════════════════════════════════════════════════════════ A.1.2 ══

A['Systems working together'] = dict(
    sum=[
        dict(en="Your organs are not separate machines sharing a room. They are one connected system, like the departments of a hospital sharing one patient.",
             zh="你的器官不是同处一室却互不相干的独立机器。它们是一个连通的系统，就像同一家医院里各科室共享同一个病人。"),
        dict(en="**Interdependence** is the rule: the heart cannot pump what the lungs never oxygenated, and no muscle works what the blood never delivered.",
             zh="**相互依存**是铁律：肺没有氧化的东西，心脏泵不出去；血液没送达的肌肉，也动不了。"),
        dict(en="Every system also **constrains** the others. Tight muscles limit a stride; a low oxygen carrying capacity caps what the cardiovascular system can deliver.",
             zh="每个系统也都在**限制**其他系统。紧绷的肌肉限制步幅，携氧能力不足就封顶了心血管系统能输送的上限。"),
        dict(en="They all hold **homeostasis** together. No single system owns stability — it is the sum of everyone staying inside their limits at the same time.",
             zh="**稳态**是它们共同维持的。没有任何一个系统独占稳定——它是所有系统同时守在各自范围内加总出来的结果。"),
        dict(en="**Negative feedback** is the ordinary case: a change is detected, a response cancels it, and the variable returns to its normal range. Body temperature, blood glucose and blood pressure all work this way.",
             zh="**负反馈**是常态：变化被察觉，反应把它抵消，变量回到正常范围。体温、血糖、血压都是这样工作的。"),
        dict(en="**Positive feedback** is the rare case: the response amplifies the change until it hits a deliberate endpoint. Blood clotting and childbirth both run this way.",
             zh="**正反馈**是少数情况：反应放大变化，直到抵达一个有意为之的终点。凝血和分娩都是这样运作的。"),
        dict(en="Exercise moves the limits. As demand rises, every system is pushed closer to its own ceiling, and whichever one has the lowest ceiling becomes the one that decides when you have to slow down.",
             zh="运动会移动这些上限。需求升高时，每个系统都被推向更接近自己的天花板，而天花板最低的那个系统，就决定了什么时候必须减速。"),
    ],
    analogy=dict(
        en="A rowing eight is one crew, not eight individuals. If rowers three and four are not pulling to the same rhythm, the shell does not average out — it wobbles and loses speed. Stability is the sum of everyone staying inside their limits at the same time.",
        zh="八人赛艇是一个整体，而不是八个个体。如果三号和四号桨手不在同一个节奏上，船不会互相抵消——它会摇晃、失速。稳定就是所有人在同一时间各自守在范围内加总出来的结果。"),
    example=dict(
        en="An altitude camp works because of interdependence, not because of one system. At altitude the cardiovascular system must deliver more oxygen per minute, but the respiratory system cannot simply take more in — the air is thinner. The adaptation that actually helps is made by the **respiratory system** growing mitochondria and red blood cells over weeks. Endurance then improves for one specific reason: the cardiovascular system was always capable of more, it just had nothing to carry.",
        zh="高原训练有效，靠的是相互依存，而不是某一个系统。在高原，心血管系统每分钟必须输送更多氧气，但呼吸系统没法简单地“吸更多”——空气更稀薄。真正有帮助的适应来自**呼吸系统**：它在数周内增加了线粒体和红细胞。所以耐力之所以提升，原因很具体——心血管系统一直有能力，只是之前没有东西可运。"),
)

A['Feedback and integrated examples'] = dict(
    sum=[
        dict(en="**Negative feedback** is a correction loop. It does not aim at a number, it aims at a **range**: too hot, so sweat; too cold, so shiver; too high, so excrete.",
             zh="**负反馈**是一个纠偏回路。它不以某个数字为目标，而以一个**范围**为目标：太热就出汗，太冷就发抖，太高就排出。"),
        dict(en="Exercise adds a complication: the body is deliberately moved **away** from its resting set point. Core temperature rises, plasma volume falls, glucose is consumed.",
             zh="运动增加了一层复杂性：身体被**主动**推离静息设定点。核心体温上升、血浆容量下降、葡萄糖被消耗。"),
        dict(en="So feedback has to work against a **moving baseline**, not a fixed one.",
             zh="所以负反馈必须对一个**移动的基线**工作，而不是固定的基线。"),
        dict(en="That is why you feel thirst, overheating and fatigue all rising together: each one is a different variable leaving its range at the same moment.",
             zh="这就是为什么口渴、过热和疲劳会一起冒出来：它们是三个不同的变量在同一时刻一起越出范围。"),
        dict(en="Heart rate is the clearest example of a controlled variable. It rises because the working muscles demand more oxygen, and it is a **controlled** variable precisely because something is holding it back.",
             zh="心率是受控变量最清楚的例子。它上升是因为工作的肌肉要更多氧气，而它之所以“受控”，正因为有东西在约束它。"),
        dict(en="**Positive feedback** works in the opposite direction, and it is always bounded. It pushes a change until a specific endpoint is reached and then stops on purpose.",
             zh="**正反馈**方向相反，而且始终有边界。它把变化推向某个特定终点，然后主动停止。"),
        dict(en="Put the two together and a training session stops looking like random distress.",
             zh="把两者放在一起看，一次训练课就不再像随意的折磨。"),
        dict(en="Every adaptation you recover from is negative feedback rebuilding what exercise dismantled — which is precisely why recovery days are not laziness.",
             zh="你恢复的每一项适应，都是负反馈在重建运动破坏的东西——这正是休息日不是偷懒的原因。"),
    ],
    analogy=dict(
        en="Negative feedback is a **thermostat**. You do not set a thermometer to “make the room 21°” — you set a **range**, and the system pushes back toward it from whichever side it drifted. Positive feedback is a **crowd at a concert**: each person clapping makes the next person clap louder, and it keeps building until a peak, not because anyone decided where to stop but because people can only clap so hard.",
        zh="负反馈像**恒温器**。你不是把温度计设成“让房间变成21度”，而是设一个**范围**，系统会从偏移的任何一侧把它推回来。正反馈像**演唱会的观众**：一个人鼓掌让旁边的人鼓得更响，如此层层放大直到某个峰值——停下不是因为谁决定了在哪里停，而是因为人的鼓掌力度有上限。"),
    example=dict(
        en="Take a 30-minute time trial in heat. Sweating removes more fluid than you take in, plasma volume falls, stroke volume drops, and cardiac output can no longer rise with effort — so heart rate climbs further for the same speed. Nothing is broken: the same loop that lets you handle a marathon is the loop you are now outrunning. Two things pull you back inside your range, and both cost time: drink, and slow down.",
        zh="在高温下骑30分钟计时赛。出汗排出的液体超过摄入，血浆容量下降，每搏输出量减少，心输出量再也跟不上强度——于是同样速度下心率升得更高。哪里都没坏：你本来能应付马拉松的那套回路，就是你现在“跑赢”的那套。有两件事把你拉回范围内，而且都要付出时间：喝水，和减速。"),
)

# ══════════════════════════════════════════════════════════════════ A.1.3 ══

A['Voluntary movement and reflexes'] = dict(
    sum=[
        dict(en="Every deliberate movement runs the same four stages: sensory input, central processing, motor output, and then the **effector** — the muscle or gland that actually does it.",
             zh="每一个有意识的动作都走同样的四个阶段：感觉输入、中枢处理、运动输出，最后由**效应器**——真正执行动作的肌肉或腺体——完成。"),
        dict(en="**Voluntary** movement is brain-led. You decide, and the instruction travels all the way out to the muscle.",
             zh="**随意运动**由大脑主导。你先做决定，指令一路传到肌肉。"),
        dict(en="A **reflex** is not a lesser version of that. It is a different circuit, and it exists for one reason: speed.",
             zh="**反射**不是随意运动的“简化版”，而是另一条回路，它存在的理由只有一个：快。"),
        dict(en="The receptor fires, the signal enters the spinal cord, an **interneuron** connects it to a **motor neurone**, and the muscle contracts. The brain is informed afterwards, if at all.",
             zh="感受器放电，信号进入脊髓，一个**中间神经元**把它接到**运动神经元**，肌肉收缩。大脑事后才被通知——如果会被通知的话。"),
        dict(en="That is why a knee jerk is finished before you feel the tap, and why a hand pulls off a hot surface before the pain is consciously registered.",
             zh="这就是为什么膝反射在你感觉到敲击之前就已经完成，手也会在疼痛被意识登记之前就离开热源。"),
        dict(en="**Reaction time** is the measurable gap between a stimulus and a response, and it is genuinely trainable. A goalkeeper who reads a penalty 50 ms earlier has a real physical advantage.",
             zh="**反应时间**是刺激与反应之间那段可测量的间隔，而且确实可以训练。守门员若能提前50毫秒读出点球，就拥有真实的生理优势。"),
    ],
    analogy=dict(
        en="A reflex is a **fire door**. The alarm sounds, the door closes itself, and nobody standing in the corridor stops to ask whether closing it is really the best idea. The building does not wait for the architect because fire does not send a memo.",
        zh="反射像一道**防火门**。警报一响，门自动关上，走廊里没有人会停下来讨论“关是不是最好的选择”。建筑物不会等建筑师，因为火不会先发公文。"),
    example=dict(
        en="A goalkeeper in a penalty shootout is the purest case of the difference. They cannot decide whether to dive — the information is still arriving. Their hands move because the optic nerve fired, the midbrain routed it, and the motor pathway fired outward. All of it finished in around 200 milliseconds. The training that improves a keeper is not making them think faster; it is shortening that automatic route.",
        zh="点球大战里的守门员是这一差异最纯粹的例子。他没法“决定”要不要扑——信息还在路上。他的手动了，是因为视神经放电、中脑完成中继、运动通路向外放电，整个过程约200毫秒就结束了。提升守门员水平的训练不是让他们想得更快，而是把这条自动通路缩短。"),
)

A['Hormonal influences and sport applications'] = dict(
    sum=[
        dict(en="**Hormones** are the slow half of the story, and in sport they matter most where nerves cannot help: fuel, recovery, temperature, growth, and the stress response.",
             zh="**激素**是故事里慢的那一半，而在运动中它们最要紧的地方正是神经帮不上忙的：供能、恢复、体温、生长，以及应激反应。"),
        dict(en="An **aerobic** response is mostly hormonal. **Adrenaline** mobilises glucose and redirects blood to muscle, while **insulin** and **glucagon** hold blood glucose steady.",
             zh="**有氧**反应主要靠激素。**肾上腺素**动员葡萄糖并把血液调往肌肉；**胰岛素**与**胰高血糖素**则稳住血糖。"),
        dict(en="**Growth hormone** and **testosterone** work on a longer clock, driving adaptation over weeks.",
             zh="**生长激素**与**睾酮**的时钟更长，它们在数周尺度上驱动适应。"),
        dict(en="The trade is a wider reach. Because a hormone travels everywhere, an unintended action is felt everywhere too — which is why doping is not a single effect but a whole set of them.",
             zh="代价是波及更广。因为激素到处走，非预期的作用也会到处体现——所以兴奋剂从来不是一个孤立的副作用，而是一整组副作用。"),
        dict(en="**Cortisol** sits on the other side. It is the stress and breakdown hormone: it raises blood glucose for a fight-or-flight moment and, left high, suppresses repair.",
             zh="**皮质醇**站在另一边。它是应激与分解代谢的激素：为应激时刻升高血糖，而长期偏高则抑制修复。"),
        dict(en="That is why **acute** stress can be useful and **chronic** stress is not: the same hormone, the same pathway, opposite consequences.",
             zh="所以**急性**应激有用而**慢性**应激有害：同一个激素、同一条通路，后果却相反。"),
        dict(en="The only difference is how long it stays switched on.",
             zh="唯一的区别，是它被打开了多久。"),
        dict(en="Practical upshot for sport: train hard, then give the hormonal side time to close the loop. The adaptation you are chasing is built by hormones while you rest, not by the hormones you spent while you worked.",
             zh="对运动的实际启示：高强度训练，然后给激素这条回路留出完成的时间。你追求的适应，是在休息时由激素建成的，而不是在你训练时耗掉的那部分。"),
    ],
    analogy=dict(
        en="Nerves are a **text message**: it arrives where you sent it, immediately. Hormones are a **radio broadcast**: it reaches everyone in range, but you cannot recall it and everyone hears it at a slightly different time. That is also why a hormone cannot be aimed, and why the side effects of a doping substance are spread so widely.",
        zh="神经像一条**短信**：立刻送到你指定的那个人手里。激素像**电台广播**：范围内人人都收得到，但你没法撤回，而且每个人听到的时间还略有差别。这正说明激素无法瞄准，也解释了兴奋剂为什么会有如此分散的副作用。"),
    example=dict(
        en="A two-hour marathon is a hormonal event wrapped in a muscular one. The muscles are doing the work, but **adrenaline** sets the pace early, **cortisol** governs what is available after roughly ninety minutes, and fluid balance decides whether the athlete finishes at all. The runner who trains the nervous side only can have perfect recruitment and still fade after 80 kilometres, because the limiting factor moved to the hormone side.",
        zh="两小时的马拉松是一场裹在肌肉里的激素事件。肌肉在出力，但**肾上腺素**在早期决定配速，**皮质醇**支配大约九十分钟之后还有什么可用，而水合状态决定运动员能不能跑完。只训练了神经一侧的跑者，募集可以完美，却仍在80公里后掉速——因为限制因素已经转移到了激素那一侧。"),
)

# ══════════════════════════════════════════════════════════════════ A.2.1 ══

A['Functions, intake and loss'] = dict(
    sum=[
        dict(en="**Water** is the solvent your cells run in, and it also transports nutrients, wastes and heat. About 60% of body mass in a typical adult.",
             zh="**水**是细胞赖以运转的溶剂，同时也负责运输营养、废物和热量。典型成人体重的约60%是水。"),
        dict(en="You gain water from drinking and from **metabolic water** — the water produced as a by-product when the body oxidises fat and carbohydrate.",
             zh="你从饮水获得水，也从**代谢水**获得——身体氧化脂肪和碳水化合物时副产生的少量水。"),
        dict(en="You lose it from four places: **urine**, sweat, breath, and **faeces**. On a cool day at rest the urine dominates; in a hard run in heat, sweat takes over completely.",
             zh="水从四个途径流失：**尿液**、**汗液**、**呼吸**和**粪便**。凉爽的休息日以排尿为主；高温高强度运动时则完全由出汗主导。"),
        dict(en="**Electrolytes** are the ions that make water useful — **sodium**, potassium, calcium, chloride. They carry charge across membranes, and nerve signalling is mostly their traffic.",
             zh="**电解质**是让水变得有用的离子——**钠**、钾、钙、氯。它们负责跨膜搬运电荷，而神经信号本质上就是它们的交通。"),
        dict(en="Water follows salt. Where **sodium** sits, water follows it, so the body controls where fluid goes by controlling where sodium sits.",
             zh="水随盐走。**钠**在哪里，水就跟到哪里，所以身体通过控制钠的分布来控制液体流向。"),
    ],
    analogy=dict(
        en="Body water is the **water in a sponge, and the sponge itself**. Water alone would drip straight through the cells and take nutrients with it. Electrolytes are what hold the structure together, so you can carry a solution instead of losing it.",
        zh="体内水分像是**海绵里的水，以及海绵本身**。若只有水，它会直接穿过细胞流走，还顺带带走营养物质。电解质把结构撑住，于是你携带的是一份溶液，而不是把它丢掉。"),
    example=dict(
        en="A marathoner loses around 1–1.5 litres of sweat an hour, and a hard session in summer can reach two. Replace the water but not the salt and something unhelpful happens: the sweat stays dilute, so you lose proportionally more water for the same amount of sweat, and the **sodium** you do replace keeps some of the fluid inside the vascular space. That is why ordinary water alone can leave a heavy sweater feeling worse, not better.",
        zh="马拉松运动员每小时流失约1到1.5升汗液，夏季高强度训练时可达两升。只补水不补盐，会发生一件适得其反的事：汗液被稀释，于是等量出汗反而流失更多水；而补充进去的**钠**会把一部分水留在血管内。所以对出汗多的人来说，光喝白水反而可能更难受。"),
)

A['Imbalance and hydration monitoring'] = dict(
    sum=[
        dict(en="Water balance is a ledger: everything in has to equal everything out, and the margin you care about is roughly **2% of body mass**.",
             zh="水分平衡是一本账：摄入必须等于排出，而你真正在意的余量大约是**体重的2%**。"),
        dict(en="Losing about **2%** of body mass as water already measurably impairs performance, and the cost keeps rising from there rather than starting at that number.",
             zh="以水的形式失去约**2%**体重，运动表现就已经开始下降，而且代价从此继续上升，而不是恰好从那个数字开始。"),
        dict(en="Cross **5%** and the effect is severe: core temperature climbs, the central nervous system is dulled, and perceived exertion rises sharply for the same work.",
             zh="越过**5%**，影响就很严重：核心体温上升，中枢神经被钝化，同样的负荷下主观疲劳感明显升高。"),
        dict(en="The four ways to monitor are all indirect: **body mass change** is the most reliable, then urine colour and specific gravity, then thirst, and finally performance itself.",
             zh="四种监测手段都是间接的：**体重变化**最可靠，其次是尿液颜色和比重，再次是口渴感，最后才是表现本身。"),
        dict(en="**Urine colour is the practical one.** Pale straw means adequate; dark amber means you are already behind and have been for a while.",
             zh="**尿液颜色**是最实用的一项。淡稻草色说明足够；深琥珀色说明你已经落后，而且已经落后了一段时间。"),
        dict(en="**Thirst is the worst of the four.** By the time you feel it you are already typically 1–2% down.",
             zh="**口渴感**是这四项里最差的。等到感觉到它，体内通常已经掉了1到2%。"),
        dict(en="In other words you are already losing performance, not about to.",
             zh="也就是说，你已经在丢表现了，而不是将要开始丢。"),
        dict(en="This is what makes **hyponatraemia** possible: large volumes of plain water without replacing sodium dilute blood sodium, and swelling in the brain is the serious outcome.",
             zh="这正是**低钠血症**会发生的原因：大量饮用不含钠的水会稀释血钠，严重后果是脑水肿。"),
        dict(en="Weight is the early warning here. Thirst is not.",
             zh="这一点的早期预警是体重，而不是口渴。"),
    ],
    analogy=dict(
        en="Hydration monitoring is a **fuel gauge on a car that only has one dial and no warning light**. The needle is bodyweight, and unlike thirst, it does not lie and it does not lag — but you have to stop and actually look at it, rather than waiting for something to announce itself.",
        zh="水合监测像**一辆只有一个仪表、没有警示灯的车**。指针是体重，它不会说谎也不会滞后——但你得停下来真的去看它，而不是等什么东西来通知你。"),
    example=dict(
        en="Two athletes weigh in before a summer training camp. One has lost 1.1% of body mass and feels fine; the other has lost 3% and insists he feels fine too. Pre-camp, a football player is advised to add fluid and salt, and weighed again the next morning. By then the reading has either come back down or it has not, and that single number tells you more than a week of asking how training felt.",
        zh="两名运动员在夏季训练营前称重。一人掉了体重的1.1%，自我感觉良好；另一人掉了3%，同样坚称没事。营训前，教练建议其中一名足球运动员补水补盐，第二天早上再称一次。到那时读数要么回落了，要么没有——这一个数字比连问一整周的训练感受都更有说服力。"),
)

A['ADH and cardiovascular drift'] = dict(
    sum=[
        dict(en="**Anti-diuretic hormone** is released when plasma volume or blood pressure drops. Its job is to keep water: it tells the kidneys to reabsorb more and to concentrate the urine.",
             zh="当血浆容量或血压下降时，**抗利尿激素**被释放。它的任务是保住水：告诉肾脏多回收一些，并把尿液浓缩。"),
        dict(en="**Osmolarity** is the concentration of dissolved particles, and it is the trigger that most tightly controls ADH — not volume, even though volume is what people remember.",
             zh="**渗透压**是溶解粒子的浓度，它才是最紧密控制抗利尿激素释放的触发因素——不是血容量，尽管人们记住的往往是容量。"),
        dict(en="Exercising raises body temperature, and heat raises osmolarity, so ADH climbs even in a well-hydrated athlete who has not actually lost volume yet.",
             zh="运动会让体温升高，而体温升高会推高渗透压，因此即便一个补水充足、体内容量尚未真正下降的运动员，抗利尿激素也会上升。"),
        dict(en="**Cardiovascular drift** is the slow upward creep of heart rate at a fixed workload. It is not fitness fading — it is heat, dehydration and sympathetic compensation.",
             zh="**心血管漂移**指的是固定负荷下心率缓慢上爬的状态。它不是你体能变差，而是高温、脱水和交感神经代偿共同作用的结果。"),
        dict(en="Skin blood flow rises to dump heat, so cardiac output gets **split**: more blood to skin, less available for the muscles.",
             zh="皮肤血流上升是为了散热，于是心输出量被**分流**：流向皮肤的更多，可供肌肉使用的就少了。"),
        dict(en="That is why the same pace that felt fine in spring feels like a different effort in July, and why **pre-cooling** and drinking on a plan both help.",
             zh="这就是为什么同样的配速在春天感觉轻松、在七月却像另一回事，也是为什么**预先降温**和按计划补水都有用。"),
    ],
    analogy=dict(
        en="Drift is a **rising tide while you keep running on the beach**. Your speed has not changed, but the water is getting deeper, so the same effort now costs more. The athlete's mistake is to treat the rising heart rate as a loss of fitness and to respond by slowing down, when the actual cause is heat and fluid and the fix is different.",
        zh="漂移就像**你在沙滩上跑步，潮水却在上涨**。你的速度没变，但水变深了，于是同样的用力现在代价更高。运动员的误区是把心率上升当成体能下降，于是用减速来应对，而真正的原因是高温与缺水，解决办法完全不同。"),
    example=dict(
        en="Two cyclists ride the same 40-minute time trial, one in October and one in July. The July rider's heart rate climbs steadily from the first ten minutes even though both are equally trained and equally hydrated. Move that trial to 6 a.m. with cold water to drink and the drift largely disappears. Nothing about fitness changed; only the temperature did.",
        zh="两名车手骑同样的40分钟计时赛，一名在十月，一名在七月。七月的车手从第一个十分钟起心率就稳步上升，尽管两人训练水平相同、补水量也相同。把这场计时赛挪到清晨六点、再备上冷水，漂移就基本消失了。体能没有任何变化，变的只有温度。"),
)

# ══════════════════════════════════════════════════════════════════ A.2.2 ══

A['Macronutrients and individual needs'] = dict(
    sum=[
        dict(en="There are three **macronutrients** — carbohydrate, fat and protein — and the body will run out of two of them within hours while it can store the third for months.",
             zh="人体有三种**宏量营养素**——碳水化合物、脂肪和蛋白质。其中两种几小时内就会耗尽，第三种却能储存数月。"),
        dict(en="**Carbohydrate** stores as **glycogen**, and glycogen is the only fuel the body can burn without oxygen. Store about 400 g and you have roughly 90 minutes of hard work in reserve.",
             zh="**碳水化合物**以**糖原**形式储存，而糖原是身体唯一无需氧气即可燃烧的燃料。储存约400克，大约相当于储备了90分钟高强度工作所需。"),
        dict(en="**Fat** is far more energy-dense — about 9 kcal per gram against carbohydrate's 4 — so it is the body's long-term fuel and its main energy reserve.",
             zh="**脂肪**的能量密度高得多——每克约9千卡，而碳水化合物是4千卡——因此它是身体的长期燃料，也是主要能量储备。"),
        dict(en="**Protein** is not mainly a fuel. It is the raw material for enzymes, antibodies and muscle tissue, and it is used for energy only when carbohydrate and fat are already short.",
             zh="**蛋白质**主要不是燃料。它是酶、抗体和肌肉组织的原料，只有在碳水化合物和脂肪都不足时才被拿来供能。"),
        dict(en="**Essential** means the body cannot synthesise it and must get it from food. All nine amino acids, plus the essential fatty acids and a set of vitamins and minerals.",
             zh="**必需**的意思是身体无法自行合成，必须从食物中获得。包括九种氨基酸、必需脂肪酸，以及一组维生素和矿物质。"),
        dict(en="There is no single correct ratio for everybody. Needs shift with training load, body size, sex, age, climate and any medical condition, so a percentage is a starting point rather than a rule.",
             zh="并不存在适合所有人的唯一比例。需求会随训练负荷、体重、性别、年龄、气候和任何疾病状况改变，所以某个百分比只是起点，不是规则。"),
    ],
    analogy=dict(
        en="Carbohydrate, fat and protein are a **sprint pack, a touring tank and a tool kit**. You burn the pack in the first hour, the tank is what gets you across a continent, and the tool kit is not fuel at all — it is what repairs the car on the way. Mistaking the tool kit for fuel is exactly the mistake of loading an athlete with protein and calling it energy.",
        zh="碳水化合物、脂肪和蛋白质像是**冲刺背包、旅行油箱和工具箱**。背包在第一个小时就烧完，油箱是你横穿一大陆的东西，而工具箱根本不是燃料——它是在路上修车的。用工具箱当燃料，正是给运动员猛塞蛋白质然后称之为能量的那个错误。"),
    example=dict(
        en="A marathoner who eats no carbohydrate on race morning relies almost entirely on fat, because without glycogen the aerobic system cannot access it quickly. The result is a fast start followed by heavy legs around 30 kilometres, and a “hitting the wall” that is a fuel-availability problem rather than a fitness one. The same athlete eating breakfast two to three hours before the race starts comfortably well into the second half.",
        zh="马拉松运动员比赛当天早上不吃碳水，几乎完全依赖脂肪，因为在没有糖原的情况下有氧系统无法快速取用它。结果是起跑很快，然后在30公里左右双腿沉重，撞上“撞墙”——那是燃料可及性的问题，而不是体能问题。同样这位运动员在赛前两到三小时吃早餐，就能轻松撑到后半程。"),
)

A['Pre-exercise, during-exercise and recovery'] = dict(
    sum=[
        dict(en="The **4–5 hours before** a session is about **glycogen loading**: 1–4 g of carbohydrate per kilogram of body mass, finishing 2–4 hours out so it is digested and stored rather than sitting in your gut.",
             zh="训练**前4到5小时**的重点是**糖原填充**：每公斤体重1到4克碳水化合物，并在开练前2到4小时结束，好让它被消化储存，而不是还堵在胃里。"),
        dict(en="**30–60 minutes before**, go smaller and liquid: 1–2 g per kilogram is plenty, and the goal is blood glucose availability rather than a full stomach.",
             zh="**开练前30到60分钟**，要少而要液体：每公斤1到2克就够，目标是让血糖可用，而不是塞满胃。"),
        dict(en="**During exercise**, replace sweat fluid and little else. Carbohydrate during a session only starts to matter past about 60–90 minutes, where it spares muscle glycogen and delays fatigue.",
             zh="**运动中**，要补的主要是汗液流失的液体，其他都靠后。碳水化合物在运动中要到约60到90分钟之后才开始起作用——那时它才能节省肌肉糖原并延缓疲劳。"),
        dict(en="**Sodium** matters most when sweat rate is high and the session is long, because it is what the fluid will actually be absorbed from.",
             zh="当出汗率高且训练时间较长时，**钠**最关键，因为水能否被吸收真正取决于它。"),
        dict(en="**After exercise**, recovery nutrition has a window: roughly **0–4 hours**, while glycogen synthase is still elevated and the muscle is most willing to take glucose back up.",
             zh="**运动后**，恢复营养有一个窗口期：大约**0到4小时**，此时糖原合酶仍处于较高活性，肌肉最愿意重新摄取葡萄糖。"),
        dict(en="That window is why the advice is not “eat more eventually” but “eat within the window, then again within a few hours”, especially across a multi-day competition.",
             zh="这个窗口就是为什么建议不是“最终多吃一点”，而是“在窗口内吃，几小时内再吃一次”——在多日赛事中尤其如此。"),
    ],
    analogy=dict(
        en="Fuel strategy is **fuel for a journey, not fuel for a fire**. The car needs a full tank before the motorway and a drink on it, and it needs the tank refilled before the engine is cold again. Pouring all the fuel in at the start of a marathon is like filling a jerry can at the start line and carrying it the whole way: heavy, and it does not refuel itself.",
        zh="供能策略是**为旅途准备燃料，不是为篝火准备燃料**。上高速前要加满油，路上要补水，而且在发动机凉下来之前要补上。马拉松一开始就灌满燃料，就像在起跑线灌满一只油壶然后一路提着那它走：沉，而且它不会自己给自己加油。"),
    example=dict(
        en="In a tournament where rounds are 40 minutes apart across three days, the decision that matters is what goes in the 3–4 hours after round one. An athlete who eats within that window refills the glycogen between rounds and treats the last round as just another round. One who eats “properly” only at dinner has run out by round two, and finishes the day slower than they started.",
        zh="在三天赛制、每轮间隔40分钟的比赛中，真正起决定作用的是第一轮结束后3到4小时吃的东西。在窗口内进食的运动员，能在两轮之间补回糖原，把最后一轮当成普通一轮；而只在晚餐“好好吃”的人，到第二轮就见底了，最后一天会比开始时更慢。"),
)

A['Micronutrients, RED-S and microbiome'] = dict(
    sum=[
        dict(en="**Micronutrients** are needed in small amounts but they are not optional: they are cofactors the enzymes cannot work without.",
             zh="**微量营养素**需要量很小，但并非可有可无：它们是酶发挥作用的辅助因子。"),
        dict(en="**Vitamins** are organic, **minerals** are inorganic, and both are involved in oxygen transport, energy release and bone.",
             zh="**维生素**是有机的，**矿物质**是无机的，两者都参与氧的运输、能量释放和骨骼构建。"),
        dict(en="Deficiency shows up slowly and specifically. A lack of iron shows as fatigue long before anything else, and a lack of vitamin D shows up in bone and immunity rather than as an obvious illness.",
             zh="缺乏的表现缓慢而具体。缺铁最先表现为疲劳，缺维生素D则体现在骨骼和免疫上，而不是某种明显的疾病。"),
        dict(en="**Toxicity** is the opposite risk, and fat-soluble vitamins in particular accumulate rather than being excreted.",
             zh="**中毒**是相反方向的风险，尤其是脂溶性维生素——它们会累积，而不是被排出。"),
        dict(en="**RED-S** is **Relative Energy Deficiency in Sport**: not enough energy intake for the training actually being done.",
             zh="**RED-S**指**运动中的相对能量缺乏**：摄入的能量不足以支撑实际完成的训练。"),
        dict(en="The name matters because the problem is relative. An athlete eating enough for a light week can still be under-fuelled during a heavy one.",
             zh="这个名称的重点在于“相对”。按轻负荷周摄入足够的运动员，在重负荷周仍然可能吃不够。"),
        dict(en="It shows up far from sport: immunity falls, bone density falls, mood drops, and for some athletes hormonal function is disrupted.",
             zh="它的表现离运动很远：免疫力下降、骨密度下降、情绪低落，对部分运动员还会扰乱激素功能。"),
        dict(en="The **microbiome** — gut bacteria — is a second line worth knowing. Some organisms synthesise vitamins and short-chain fatty acids that the host absorbs.",
             zh="**肠道微生物组**——肠道细菌——是值得了解的第二条线。部分菌种能合成维生素和短链脂肪酸，并被人体吸收。"),
        dict(en="So the gut is part of nutrition, not just a tube that happens to sit there.",
             zh="所以肠道是营养的一部分，而不只是恰好摆在那里的管道。"),
    ],
    analogy=dict(
        en="Macronutrients are the **fuel in the tank**. Micronutrients are the **oil and the spark plug**: in tiny quantities, and the difference between a working engine and a seized one is entirely down to them. RED-S is running the engine on fumes because the driver is convinced the tank is fine.",
        zh="宏量营养素是**油箱里的燃料**；微量营养素则是**机油和火花塞**：量很小，但引擎能跑还是抱死全看它们。而RED-S就像司机坚信油箱没问题，却让引擎在几乎没油的状态下硬跑。"),
    example=dict(
        en="A distance runner training twice a day, travelling, and controlling weight hits RED-S without ever feeling hungry in any obvious way. The early signals are a falling immune response — one cold after another — and a stalled bone-density profile, both attributed to “a hard block of training”. Raising total energy availability usually restores both, and it is the first thing to check before adding anything else to the programme.",
        zh="一位每天训练两次、需要出差、同时还在控制体重的耐力运动员，可能落入RED-S，却完全没有明显的饥饿感。早期信号是免疫反应下滑——反复感冒——以及骨密度停滞，两者常被归因为“训练强度大的一段”。提高总能量可及性通常能同时修复两者，而且这是往计划里加任何其他东西之前该先查的第一项。"),
)

if __name__ == '__main__':
    import io, json, sys
    print('sections authored:', len(A))
    for k, v in A.items():
        assert 'sum' in v and v['sum'], k
        for p in v['sum']:
            assert len(p) == 2 and 'en' in p and 'zh' in p, k
            assert p['en'] and p['zh'], k
        assert 'analogy' in v and v['analogy']['en'] and v['analogy']['zh'], k
        assert 'example' in v and v['example']['en'] and v['example']['zh'], k
        bad = [p for p in v['sum'] if len(p['en']) > 210 or len(p['zh']) > 130]
        if bad: print('LONG in', k, [len(p['en']) for p in bad], file=sys.stderr)
    io.open('_authored_batch1.json', 'w', encoding='utf-8').write(
        json.dumps(A, ensure_ascii=False))
    print('wrote _authored_batch1.json')

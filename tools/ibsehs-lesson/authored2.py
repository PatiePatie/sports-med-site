# -*- coding: utf-8 -*-
"""Authored layer, batch 2: energy systems and all of Theme A's training /
health / recovery sections. Same contract as authored1.py.

Curly quotes only inside content — a straight " terminates a Python string, and
that cost several turns in batch 1.
"""

A = {}

# ══════════════════════════════════════════════════════════════════ A.2.3 ══

A['ATP and the energy continuum'] = dict(
    sum=[
        dict(en="**ATP** is the cell’s usable energy. It is not stored like fuel — there are only about 100 milliseconds of it in your body at any moment.",
             zh="**ATP**是细胞可直接使用的能量。它并不像燃料那样储存——任何时刻你体内只有大约100毫秒的量。"),
        dict(en="So ATP is **continuously resynthesised**, and the question that matters is not “how much” but **“how fast can it be made”**.",
             zh="所以ATP在**不断重新合成**，而真正关键的问题不是“有多少”，而是**“能以多快的速度被造出来”**。"),
        dict(en="**Phosphagen**: stored directly in muscle as creatine phosphate, rebuilt in about 3–5 seconds, and gone in roughly 10. This is sprinting and heavy lifting.",
             zh="**磷酸原系统**：以肌酸磷酸酯形式直接储存在肌肉里，约3到5秒即可重建，大约10秒就耗尽。它对应冲刺和大力举。"),
        dict(en="**Glycolytic**: carbohydrate broken down without oxygen, giving about 2 minutes of hard work and building up lactate as a by-product.",
             zh="**糖酵解系统**：在无氧条件下分解碳水化合物，可支撑约2分钟高强度工作，同时副产物乳酸开始堆积。"),
        dict(en="**Aerobic**: carbohydrate and fat with oxygen, giving the highest **total** output and the ability to keep going for hours.",
             zh="**有氧系统**：在有氧条件下利用碳水化合物和脂肪，总输出最高，且能维持数小时。"),
        dict(en="This is the **continuum**: all three run at once in every activity, and what changes is the **proportion**.",
             zh="这就是所谓的**连续体**：三项在每种活动中都同时工作，变化的是各自的**比例**。"),
        dict(en="The three systems are also limited by different things — phosphogen by stored substrate, glycolytic by rate and pain, aerobic by delivery of oxygen.",
             zh="三套系统的限制因素也不同——磷酸原受储存基质限制，糖酵解受速率和疼痛限制，有氧受氧的输送限制。"),
    ],
    analogy=dict(
        en="Think of three **tanks with three different taps**. The phosphagen tank is small but its tap is a fire hose. The glycolytic tank is bigger but the tap is narrower. The aerobic tank is enormous but the tap is a straw — which is fine, because you never empty it quickly.",
        zh="把这三套系统想成**三个水箱配三种不同的水龙头**。磷酸原的水箱小，但水龙头是消防水带；糖酵解的水箱大一些，龙头却细一些；有氧的水箱极其庞大，但龙头只是一根吸管——不过没关系，因为你从来不会很快把它抽干。"),
    example=dict(
        en="In a 1500 m race the first 200 m are paid for from phosphagen and feel almost free, the middle 1000 m run on glycolysis and lactate is climbing, and the last 300 m are aerobic. Ask the same athlete to hold the opening 200 m pace for 800 m and the phosphagen tank is empty, glycolysis cannot sustain that rate, and the aerobic contribution arrives far too slowly to compensate.",
        zh="在1500米比赛中，前200米由磷酸原支付，几乎不费劲；中间1000米靠糖酵解，乳酸一路攀升；最后300米则是有氧系统在工作。让同一位运动员把前200米的配速维持800米试试：磷酸原的水箱见底，糖酵解撑不住那个速率，而有氧系统的贡献到得太慢，补不回来。"),
)

A['Comparing the three systems'] = dict(
    sum=[
        dict(en="No activity uses one system. Even a 100 m sprint uses aerobic metabolism — just at a tiny proportion.",
             zh="没有哪项活动只用一套系统。就算是100米短跑也有有氧代谢参与，只是比例很小。"),
        dict(en="What changes is the **duration**, and duration is what determines the proportion.",
             zh="改变的是**持续时间**，而正是持续时间决定了三者的比例。"),
        dict(en="Under about **10 seconds**, the contribution is almost entirely phosphagen.",
             zh="短于约**10秒**时，能量贡献几乎全部来自磷酸原。"),
        dict(en="From roughly **10 seconds to 2 minutes**, glycolysis dominates and lactate accumulates fastest.",
             zh="从约**10秒到2分钟**，糖酵解占主导，乳酸堆积最快。"),
        dict(en="Beyond about **2 minutes**, the aerobic system supplies the larger and larger share.",
             zh="超过约**2分钟**后，有氧系统提供的份额越来越大。"),
        dict(en="This is why recovery between efforts matters: ATP-PCrresynthesis is **fastest when lactate is low**, and rest is when the tap refills.",
             zh="这正是组间恢复很重要的原因：乳酸低时磷酸原的再合成**最快**，而休息正是水箱被重新灌满的时候。"),
        dict(en="The practical test is simple: if effort cannot be repeated at the same rate, the limiting system is glycolytic or aerobic. If it can, it was phosphagen.",
             zh="有一个简单的判断方法：如果同样的强度无法重复同样的速率，限制系统就是糖酵解或有氧；如果可以，那就是磷酸原。"),
    ],
    analogy=dict(
        en="Three cars on the same journey, but with different fuel and different tanks. The sports car refuels in seconds and then has to stop. The saloon is slower but can run a couple of hours. The truck carries enough to cross a country but accelerates like a barge. Nobody asks the truck to win the sprint.",
        zh="同一段旅程上的三辆车，燃料和油箱各不相同。跑车几秒就能加满油，然后必须停下来；轿车慢一些，但能跑上两个小时；卡车油量足够横穿一个国家，却像驳船一样起步加速。没人会要求卡车去拿短跑冠军。"),
    example=dict(
        en="Interval training works because of the continuum, not despite it. A 400 m rep is glucolytic, so the second rep is harder than the first even with identical pace — the ATP-PCr stores are only partly rebuilt and lactate is still present. Extend the rest and the same rep becomes repeatable, because phosphagen has recovered and lactate has cleared.",
        zh="间歇训练之所以有效，是因为这个连续体，而不是与它无关。400米的一组属于糖酵解主导，所以即使配速完全相同，第二组也比第一组更难——磷酸原只恢复了一部分，乳酸也还在。把组间休息拉长，同一组就变得可重复，因为磷酸原恢复了，乳酸也清掉了。"),
)

A['VO₂max, movement economy, LIP and EPOC'] = dict(
    sum=[
        dict(en="**VO₂max** is the maximum rate the body can take in and use oxygen, and it is the best single laboratory measure of aerobic fitness.",
             zh="**最大摄氧量**是身体摄取并利用氧气的最大速率，是衡量有氧体能的最好单项实验室指标。"),
        dict(en="Higher VO₂max means more oxygen arrives at working muscle per minute, so a given pace costs less of your ceiling.",
             zh="最大摄氧量越高，每分钟到达工作肌肉的氧气就越多，因此同样的配速占用的上限比例就更小。"),
        dict(en="**Movement economy** is separate from VO₂max. It is how much oxygen a given movement costs — two athletes with identical VO₂max can burn very different amounts doing the same task.",
             zh="**动作经济性**与最大摄氧量是两回事。它指的是完成某个动作要花多少氧气——两位最大摄氧量完全相同的运动员，做同一件事可以消耗差别很大的氧气。"),
        dict(en="**Lactate threshold** is the point where lactate begins to build faster than it is cleared, and it is a better predictor of performance than VO₂max for most endurance events.",
             zh="**乳酸阈**是乳酸产生速度开始超过清除速度的那个点，对大多数耐力项目来说，它比最大摄氧量更能预测表现。"),
        dict(en="**EPOC** is **excess post-exercise oxygen consumption** — the oxygen debt, repaid after you stop, and the reason heart rate stays up for minutes after a hard effort.",
             zh="**EPOC**指**运动后过量氧耗**，也就是氧债——它在运动结束后偿还，也正是高强度运动后心率仍会升高好几分钟的原因。"),
        dict(en="EPOC is why **active recovery** beats sitting still: keeping the muscles working slightly keeps the elevated rate going and clears lactate faster.",
             zh="这正是**主动恢复**优于完全静止的原因：让肌肉继续轻微活动，可以维持升高的代谢率，并更快清除乳酸。"),
        dict(en="Together they separate **fitness** (VO₂max, threshold) from **efficiency** (economy) and from **the cost of finishing a session** (EPOC).",
             zh="三者合起来，把**体能**（最大摄氧量、乳酸阈）、**效率**（动作经济性）和**结束一次训练的代价**（EPOC）区分开来。"),
    ],
    analogy=dict(
        en="VO₂max is the size of the **pipes** into the house. Movement economy is how **well the taps are fitted** — same water, less wasted. EPOC is the **debt on the bill** for the water you used, which you pay back long after you stop running the tap.",
        zh="最大摄氧量是通往房子的**管道口径**；动作经济性则是**水龙头装得好不好**——同样的水，浪费更少；而EPOC就是你用掉的水所欠下的**账单**，在你关掉龙头很久之后才还清。"),
    example=dict(
        en="Two runners finish a 10 km with the same split, but one is cooler and recovers faster. Same threshold, different economy and different EPOC — the first spends less oxygen per step, so less debt is incurred and less has to be repaid afterwards. Over a race that difference is worth seconds, and over a training week it is worth the difference between a third session and a fourth.",
        zh="两名跑者跑完10公里，配速相同，但其中一位体温更低、恢复更快。乳酸阈相同，动作经济性与EPOC不同——前者每一步花的氧气更少，于是欠下的“账”更少，之后要还的也更少。放在一场比赛里，这个差距值几秒；放在一周训练里，它决定你还能练第三节还是第四节。"),
)

# ══════════════════════════════════════════════════════════════════ A.3.1 ══

A['Six qualities and FITT'] = dict(
    sum=[
        dict(en="A training session is described by **FITT**: frequency, intensity, time and type.",
             zh="一次训练课由**FITT**四个要素描述：频率、强度、时间和类型。"),
        dict(en="**Frequency** is how often you train. It matters because recovery takes **24–48 hours** after a session that works a muscle hard.",
             zh="**频率**指训练多频繁。它之所以重要，是因为一次高强度使用某组肌群后的恢复需要**24到48小时**。"),
        dict(en="**Intensity** is the hardest to measure honestly. **%HRmax** is too variable day to day, so heart-rate reserve or lactate threshold describe it better.",
             zh="**强度**是最难诚实测量的。**%最大心率**天与天之间波动太大，所以心率储备法或乳酸阈更能描述它。"),
        dict(en="**Time** is the duration of the session, and it interacts with intensity: long and hard is a different session from short and hard.",
             zh="**时间**是单次训练的时长，它与强度相互作用：又长又难和又短又难是两种完全不同的训练。"),
        dict(en="**Type** is what you actually did — and it is the one most often ignored. Endurance work does not build the same thing as maximal strength work.",
             zh="**类型**是你实际做的内容，也是最常被忽略的一项。耐力训练和最大力量训练建立的不是同一种东西。"),
        dict(en="The **six qualities of training** are the goals any programme aims at: strength, endurance, speed, power, agility and flexibility.",
             zh="**训练的六大品质**是任何训练计划想要达成的目标：力量、耐力、速度、爆发力、敏捷和柔韧。"),
        dict(en="The point of naming them is that **one session cannot build all six**, and a programme that tries usually over-trains one and neglects the rest.",
             zh="点出它们的意义在于：**一节训练课不可能同时练成这六项**，而试图全都兼顾的计划，通常只是把其中一项练过头、其余的撂下。"),
    ],
    analogy=dict(
        en="FITT is the **recipe card** for a dish, and the six qualities are the **menus you actually cook over a season**. A chef who only ever makes one dish well still has a menu, but no restaurant survives on it.",
        zh="FITT是菜谱卡，而六大品质是你整个赛季真正做过的菜单。只反复做一道菜的厨师当然也算有菜单，但餐厅靠单一菜式是活不下去的。"),
    example=dict(
        en="A beginner runs three times a week, feels fit within a month, and then stalls. Nothing is wrong with frequency — the type was wrong. Running alone builds aerobic fitness and leaves **strength**, **speed** and **power** untrained, which for most sports is where the biggest gains remain. Two sessions a week spent on those qualities would have cost little and changed everything.",
        zh="一位初学者每周跑三次，一个月内感觉体能上去了，然后停滞。频率没问题，错的是**类型**。只跑步能练到有氧，而**力量**、**速度**和**爆发力**基本没练——对多数项目来说，那才是提升空间最大的地方。每周花两节课练这几项，代价很小，回报却很大。"),
)

A['Periodization, overload and overtraining'] = dict(
    sum=[
        dict(en="**Progressive overload** is the only non-negotiable principle: do a little more than last time, in some measurable way.",
             zh="**渐进超负荷**是唯一不可谈判的原则：在某个可测量的指标上，比上次多做一些。"),
        dict(en="**Periodization** is planning that overload on purpose rather than by accident. **Macrocycles** are the big blocks — a season or a phase.",
             zh="**周期化**是有计划地安排超负荷，而不是碰运气。**大周期**是大的段落，比如一个赛季或一个阶段。"),
        dict(en="**Mesocycles** are the weeks inside a block, and **microcycles** are the individual sessions.",
             zh="**中周期**是一个大块内部的若干周，**小周期**则是单次训练课。"),
        dict(en="A **peaking** phase arrives before competition: volume drops, intensity rises, so the athlete arrives fresh and sharp.",
             zh="比赛之前会出现一个**巅峰期**：训练量下降、强度上升，让运动员既恢复过来又状态正佳。"),
        dict(en="Overtraining is usually **accumulation, not one session**. It appears when load rises faster than recovery.",
             zh="过度训练通常是**累积的结果，而不是某一节课造成的**。它出现在负荷上升快于恢复时。"),
        dict(en="The early signals are the ones coaches miss: resting heart rate up, sleep worse, mood flat, performance down while fitness holds.",
             zh="早期信号恰恰是教练最容易忽略的：静息心率升高、睡眠变差、情绪平淡，而体能仍在但表现下滑。"),
        dict(en="**Acute:chronic workload ratio** compares your last week with your recent average. A spike is not automatically bad, but a spike that keeps climbing is.",
             zh="**急慢性负荷比**把最近一周和近期平均值作比较。突增本身未必是坏事，但持续攀升的突增就是。"),
    ],
    analogy=dict(
        en="Progressive overload is **adding weight to a barbell when you can already lift it cleanly**. If you never add, you never get stronger, and if you add too fast, the bar lands on your chest. Periodization is simply **planning those increases across weeks** instead of discovering them by dropping the bar.",
        zh="渐进超负荷就像**能干净举起杠铃之后就再加重量**。从不加重量就永远不会变强，加得太快杠铃就会砸到胸口。而周期化不过是**把增量规划到各周里**，而不是靠砸杠铃去发现。"),
    example=dict(
        en="A club squad’s season is one macrocycle. Within it, four weeks of higher volume build fitness, then a lighter week, then the peak: reduced volume, near-maximal intensity. Miss the light week and the final fortnight is the peak plus the accumulated fatigue, which is exactly how a team arrives for its biggest competition already three percent slower than in training.",
        zh="一支俱乐部队伍的赛季就是一个大周期。其中四周高训练量建立体能，接着一周减量，然后进入巅峰期：量下降、强度接近最大。漏掉那一周减量，最后两周就变成“巅峰期加上累积疲劳”——这正是一支球队在最重要的比赛前就已经比训练时慢3%的原因。"),
)

A['Individualisation and the monitoring loop'] = dict(
    sum=[
        dict(en="A programme is a **hypothesis**. You measure, you compare against the model, and you adjust — that loop is the whole job.",
             zh="训练计划是一个**假设**。你去测量、和模型对照、再做调整——这个循环就是全部的工作。"),
        dict(en="What is **individualised** is not the plan’s name but its inputs: starting fitness, injury history, schedule, and what the athlete can actually sustain.",
             zh="被**个体化**的不是计划的名字，而是它的输入：起始体能、伤病史、时间安排，以及这位运动员真正能坚持的量。"),
        dict(en="**Heart rate** is the workhorse measure, but raw readings are noisy. A trend over **7 days** says far more than any single session.",
             zh="**心率**是主力指标，但单次读数噪声很大。**7天**的趋势远比任何单节课更有意义。"),
        dict(en="External load is what you do — distance, volume, sessions. Internal load is what it cost — heart rate, RPE, soreness.",
             zh="外部负荷是你做了什么——距离、总量、课次；内部负荷是它让你付出了多少——心率、主观用力感觉、肌肉酸痛。"),
        dict(en="The pair only works together. High external with low internal is adaptation; both high is fatigue; external low with internal high is usually illness or life stress.",
             zh="两者只有合起来才有用。外部高而内部低是适应；两者都高是疲劳；外部低而内部高通常是生病或生活压力。"),
        dict(en="**RPE** (rate of perceived exertion) is the cheapest internal measure there is, and the most useful precisely because it needs no equipment.",
             zh="**主观用力感觉**是最便宜的内部指标，也正因为不需要任何设备而格外有用。"),
    ],
    analogy=dict(
        en="Individualisation is **fitting a suit**. The pattern is the same programme for everyone, but the arm length, the shoulder width and the inseam are measured on the person in front of you. A suit cut from the average fits the average perfectly and everybody else badly.",
        zh="个体化就是**量体裁衣**。纸样是给所有人通用的同一份计划，但袖长、肩宽和裤长是照着你面前这个人量的。按平均体型裁的衣服，只有平均身材穿着完美，其他所有人都很别扭。"),
    example=dict(
        en="Two footballers are given the same 8 × 400 m session. The first finishes the final rep at 165 bpm; the second at 188. Same session, same intent, and the coach now knows the second athlete is under-recovered and that the next session must be reduced. Without the internal measure the coach would have logged “session completed” for both and learned nothing until the injury.",
        zh="两名足球运动员被安排同样的8 × 400米训练。第一位最后一组结束时心率165次/分，第二位188次/分。同样的课、同样的意图，而教练现在知道第二位恢复不足、下一节必须减量。如果没有这个内部指标，教练只会为两人各记上一句“训练已完成”，直到伤病出现才学到东西。"),
)

# ══════════════════════════════════════════════════════════════════ A.3.2 ══

A['Life stage, sex and energy balance'] = dict(
    sum=[
        dict(en="Energy balance is simple arithmetic: energy in versus energy out. **Surplus** stores as fat, **deficit** draws on it, and **balance** holds it steady.",
             zh="能量平衡是一道简单算术：摄入减去消耗。**盈余**储存为脂肪，**亏空**动用脂肪，**平衡**则保持不变。"),
        dict(en="The **basal metabolic rate** is what you burn just to stay alive, and it typically falls by about **1–2% per decade** from adulthood.",
             zh="**基础代谢率**是维持生命本身所需消耗，从成年开始通常每十年下降约**1到2%**。"),
        dict(en="**Thermogenic effect of food** is the cost of digesting what you eat, around **10%** of intake, and it varies with how much protein the meal contains.",
             zh="**食物热效应**是消化食物本身的开销，约占摄入的**10%**，并随一餐中蛋白质含量而变化。"),
        dict(en="**Energy balance changes across the lifespan**: children grow, adolescent growth spurts raise needs sharply, and needs fall again in later life.",
             zh="**能量平衡会随生命阶段改变**：儿童在生长，青少年生长突增使需求急升，而成年后期需求再次下降。"),
        dict(en="**Sex** changes the equation mainly through body composition and hormones, which is why energy prescriptions are not a single number for all.",
             zh="**性别**主要通过身体成分和激素改变这道等式，因此能量建议不是对所有人都通用的一个数字。"),
        dict(en="The practical error is **underestimating expenditure**. Added training, spontaneous activity and the thermic effect of a larger diet are all easy to leave out of the account.",
             zh="实践中最常见的错误是**低估消耗**。增加了训练、自发活动，以及更大饮食带来的食物热效应，都很容易被漏算。"),
    ],
    analogy=dict(
        en="Energy balance is a **bank account with two sides**: deposits and withdrawals. You do not go negative by spending much once — you go negative by repeatedly misjudging the withdrawals. An athlete who “eats the same as before” after adding three sessions a week is not in balance; the deposits did not move.",
        zh="能量平衡是一个**有两边的银行账户**：存入和支取。你不会因为偶尔多花一点就透支；你透支是因为反复低估了支取量。一位每周增加三节课之后仍然“和以前吃一样”的运动员并不处于平衡——因为存入那一侧根本没动。"),
    example=dict(
        en="An athlete adds two evening sessions a week, keeps her food diary identical, and expects weight to hold. Expenditure has risen by several hundred kilocalories a week and intake has not moved, so the balance tips gradually — too slowly to notice week to week and too consistently to argue with over a season. The correct response is to measure, not to cut harder.",
        zh="一位运动员每周增加两节晚间训练，饮食记录保持不变，指望体重不变。消耗每周上升了几百千卡而摄入没动，于是平衡被一点点推向亏空——逐周看不出来，但整个赛季累积下来足以推翻任何争辩。正确的应对是去测量，而不是更狠地节食。"),
)

A['System benefits, chronic disease and progression'] = dict(
    sum=[
        dict(en="Exercise is a **multisystem** intervention. The heart, the vessels, the lungs, the bones, the muscles and the brain all respond, and not to the same dose.",
             zh="运动是一种**多系统**干预。心脏、血管、肺、骨骼、肌肉和大脑都会响应，而且所需的剂量并不相同。"),
        dict(en="The strongest and most consistent effect is on **cardiovascular risk**: lower blood pressure, better lipids, and improved endothelial function.",
             zh="最稳定、也最一致的作用在**心血管风险**上：血压更低、血脂更好、内皮功能改善。"),
        dict(en="Insulin sensitivity improves with almost any activity that engages large muscle mass, which is why **resistance work** matters as much as aerobic work here.",
             zh="只要动用大肌群，胰岛素敏感性就会改善，因此在这方面**抗阻训练**和 aerobic 训练同样重要。"),
        dict(en="Bone is **specific-adaptive**: it responds to impact and to unusual loading, so the exercise that builds bone is the one that feels unfamiliar.",
             zh="骨骼遵循**特异适应**原则：它对冲击和不寻常的负荷产生反应，因此真正能练到骨的运动，是那种感觉不熟悉的运动。"),
        dict(en="Chronic disease changes the prescription, not the principle. The aim is still overload progression, but the starting point is lower and the monitoring is closer.",
             zh="慢性病改变的是处方，不是原则。目标仍然是超负荷递进，只是起点更低、监测更密。"),
        dict(en="**Inflammation** falls with regular activity and rises with inactivity, which is why the daily habit matters more than the single heroic session.",
             zh="规律活动会降低**炎症**水平，久坐则使它升高，因此日常习惯比某次拼命的训练更重要。"),
    ],
    analogy=dict(
        en="Training adaptations are **specific**. A runner who only runs builds a runner: strong aerobic capacity, and bones and tendons that have been asked for nothing unusual. Add lifting and suddenly the bones and the connective tissue get a different instruction — and that is the point.",
        zh="训练适应是**有特异性的**。只跑步的跑者会练成一个跑者：有氧能力很强，而骨骼和肌腱从未被要求做任何不寻常的事。加上举重，骨骼和结缔组织突然收到了不同的指令——而这正是重点。"),
    example=dict(
        en="A hypertensive 58-year-old walks 30 minutes five days a week and lifts twice. The walking alone moves blood pressure and lipids; the lifting is what protects bone density and keeps glucose handling sharp. Remove the lifting and the programme becomes a good cardiovascular intervention with a silent cost to bone — the kind of cost that only shows up as a fracture twenty years later.",
        zh="一位58岁的高血压患者每周五天快走30分钟，加每周两次举重。快走本身改善血压和血脂；而举重才保护骨密度、维持血糖处理能力。去掉举重，这个计划就变成一个很好的心血管干预，却给骨骼留下了一笔看不见的账——而这笔账往往二十年后才以骨折的形式出现。"),
)

A['HL exercise prescription for populations'] = dict(
    sum=[
        dict(en="An **HL** prescription must be specific enough to be tested. Vague advice cannot be measured, so it cannot be adjusted.",
             zh="**高阶（HL）**运动处方必须具体到可以被检验。含糊的建议无法测量，也就无法调整。"),
        dict(en="**Pre-exercise screening** is the first step. Risk is judged from current activity level, not age alone.",
             zh="**运动前筛查**是第一步。风险要依据**当前活动水平**判断，而不能只看年龄。"),
        dict(en="**Overriding symptoms** matter more than any number: chest pain, unexplained breathlessness, dizziness, palpitations.",
             zh="**危险信号**比任何数字都重要：胸痛、不明原因的气促、头晕、心悸。"),
        dict(en="**FITT must be justified**, not defaulted. Intensity is chosen from a test — often a **one-mile walk test** or a submaximal HR estimate.",
             zh="**FITT必须有依据**，而不是照搬默认值。强度来自某项测试——常用**一分钟步行试验**或次极量心率估算。"),
        dict(en="**Progression** is the mechanism of the programme, so it is written into the prescription rather than left to chance.",
             zh="**递进**是这个计划的机制，因此必须写进处方里，而不是交给运气。"),
        dict(en="Population prescriptions carry two responsibilities: the intensity must suit the person, and the programme must be **individually appropriate** for that person’s goals.",
             zh="人群处方承担两项责任：强度要适合这个人，而计划必须**因人制宜**，切合此人的目标。"),
    ],
    analogy=dict(
        en="A prescription is a **route drawn on a map, not a slogan**. “Exercise more” is a slogan. “30 minutes brisk walking, 5 days, intensity so that talking is difficult, progress by 5 minutes per week” is a route — someone can follow it, and someone can check whether it worked.",
        zh="处方是**地图上画出的路线，而不是一句口号**。“多运动”是口号；“每周五天、每次快走30分钟，强度到说话费劲，每周增加5分钟”才是路线——有人能照着走，也有人能核查是否有效。"),
    example=dict(
        en="A sedentary 45-year-old with high blood pressure. Screening shows regular activity and no overriding symptoms, so testing continues. A submaximal test sets intensity; the starting prescription is 20 minutes on 5 days with a clear progression rule. At the 6-week review the walking time increases only if blood pressure, rate of perceived exertion and adherence all allow it — the test comes before the progression.",
        zh="一位久坐的45岁高血压患者。筛查显示他有规律活动且无危险信号，于是继续做测试。用次极量测试确定强度；起始处方是每周五天、每天20分钟，并附带明确的递进规则。第6周复查时，只有当血压、主观用力感觉和依从性都允许时才增加步行时间——测试走在递进前面。"),
)

# ══════════════════════════════════════════════════════════════════ A.3.3 ══

A['Central and peripheral fatigue'] = dict(
    sum=[
        dict(en="**Fatigue** is reversible performance loss from exercise, and it is useful to split it by **where in the body it is generated**.",
             zh="**疲劳**是运动造成的、可逆的表现下降，按**在身体的哪个部位产生**来分类会很有用。"),
        dict(en="**Central fatigue** is cognitive: reduced motivation, slower decisions, lower perceived effort. Its mechanisms are still debated.",
             zh="**中枢疲劳**是认知层面的：动力下降、决策变慢、主观努力感降低。其机制仍在争论中。"),
        dict(en="Because perceived effort is central, the athlete usually reports it before the muscles actually fail — and that self-report is often accurate.",
             zh="由于主观努力感属于中枢，运动员往往在肌肉真正力竭之前就先报告疲劳——而这种自报通常相当准确。"),
        dict(en="**Peripheral fatigue** is muscular: accumulated metabolites, altered ion balance, and substrate depletion. Power output falls even when effort still feels high.",
             zh="**外周疲劳**是肌肉层面的：代谢物累积、离子平衡改变、基质耗竭。即使主观努力感仍然很高，功率输出已经下降。"),
        dict(en="The **interference effect** is central fatigue limiting peripheral performance — the head telling the muscles to stop before the muscle itself is out.",
             zh="**干扰效应**指中枢疲劳限制外周表现——大脑在肌肉自己还没用尽之前就命令它停下。"),
        dict(en="**Central fatigue** is best reduced by sleep, easy movement and daylight; **peripheral** fatigue by active recovery, refuelling and mobility work.",
             zh="**中枢疲劳**最有效的恢复是睡眠、轻松活动和日照；**外周疲劳**则靠主动恢复、补充燃料和灵活性练习。"),
        dict(en="Grouping strength, speed and power in the same session creates **peripheral** fatigue, which then raises the **central** component — which is why power quality drops faster than strength.",
             zh="把力量、速度和爆发力放在同一节课，会制造**外周**疲劳，而它又会推高**中枢**成分——这就是为什么爆发力的质量掉得比力量更快。"),
    ],
    analogy=dict(
        en="Central and peripheral fatigue are a **referee and the legs**. The referee decides how hard the effort looks and how long the runner pushes; the legs decide whether they can still deliver. When the legs are gone but the runner still judges it “easy”, something is wrong. When the referee calls it quits while the legs are fine, that is central fatigue.",
        zh="中枢与外周疲劳像是**裁判和双腿**。裁判决定这段努力看起来有多吃力、跑者会坚持多久；双腿决定还能不能交付。当双腿已经没了，跑者却还觉得“轻松”，那就出问题了；而裁判在双腿没问题时鸣哨结束，那就是中枢疲劳。"),
    example=dict(
        en="An athlete completes a heavy strength session and then tries to add 10 km on a treadmill. Peripheral fatigue from the lifting means the legs simply cannot deliver the power. But the athlete usually blames the treadmill, rates the session “easy”, and drops the extra work entirely — losing the aerobic stimulus and never diagnosing a recoverable problem.",
        zh="一位运动员做完高强度力量训练后，想再加10公里跑台。外周疲劳让双腿根本无法输出功率。但运动员往往会怪跑台、把训练评价为“轻松”，然后彻底放弃这部分——既丢掉了有氧刺激，也从未诊断出一个本来完全可以恢复的问题。"),
)

A['Recovery nutrition and methods'] = dict(
    sum=[
        dict(en="**Protein** needs to be spread: roughly **1.6–2.0 g per kilogram per day** for most training, and about **0.3 g per kilogram per meal** to actually trigger muscle protein synthesis.",
             zh="**蛋白质**需要分散摄入：多数训练者每天每公斤体重约**1.6到2.0克**，而每一餐约**每公斤0.3克**才真正触发肌肉蛋白合成。"),
        dict(en="**Carbohydrate** refills glycogen. The target is about **1.0–1.2 g per kilogram per hour** in the first hours after a session.",
             zh="**碳水化合物**用来补糖原。训练后最初几小时的目标约为**每小时每公斤1.0到1.2克**。"),
        dict(en="**Fluid and sodium** replace sweat. Aim to lose no more than about **2% of body mass**, and weigh before and after to know your own rate.",
             zh="**液体和钠**用来补回汗液。目标是不超过约**体重的2%**，并在训练前后称重以掌握自己的出汗速率。"),
        dict(en="**Active recovery** — easy movement after a session — speeds lactate clearance without adding fatigue.",
             zh="**主动恢复**——训练后轻松活动——能在不增加疲劳的前提下加快乳酸清除。"),
        dict(en="**Massage, compression and cold water immersion** all reduce soreness. The evidence for lasting performance benefit is weaker than the evidence for feeling better.",
             zh="**按摩、压力压缩和冷水浸泡**都能减轻酸痛。但它们带来持久表现提升的证据，远弱于“感觉好些了”的证据。"),
        dict(en="**Sleep** is the one recovery tool with no credible substitute, because growth hormone release and tissue repair concentrate in deep sleep.",
             zh="**睡眠**是唯一没有可信替代品的恢复工具，因为生长激素的释放与组织修复集中在深度睡眠期。"),
    ],
    analogy=dict(
        en="Recovery is **repaying three different loans**. You owe a fuel loan (**glycogen**), a building loan (**protein**) and a water loan (**fluid and sodium**). They are paid off with different currencies, on different timescales, and paying one does not clear another. Which is why “ate a big meal” is not a recovery plan.",
        zh="恢复就像**还三种不同的债**：一笔燃料债（**糖原**）、一笔建材债（**蛋白质**）、一笔水债（**液体和钠**）。它们用不同的货币、在不同的时间尺度上偿还，还清其中一笔并不会自动清掉另一笔。这就是为什么“吃了一顿大餐”不构成一个恢复方案。"),
    example=dict(
        en="A footballer finishes a match, weighs himself, and finds he is 1.8 kg lighter on a 78 kg body — about 2.3%. He drinks a sports drink but eats nothing, then sleeps. He wakes feeling reasonable and plays a full training week on stored glycogen, because the fuel loan was never cleared. Same athlete, same recovery window, but the difference is a sandwich.",
        zh="一名足球运动员踢完比赛一称，重了1.8公斤，而他的体重是78公斤——约2.3%。他喝了一瓶运动饮料，却什么都没吃，然后睡下。他醒来感觉还行，于是在仍然欠着糖原的情况下打了一整周训练。同一个人、同样的恢复窗口，差别就在一个三明治。"),
)

A['Recovery indicators, sleep and travel'] = dict(
    sum=[
        dict(en="Recovery is what you **measure**, not what you hope for. Without a marker you are guessing, and guessing does not adapt to your schedule.",
             zh="恢复是你**测量**到的东西，不是你希望它发生的事。没有指标就只是在猜，而猜测不会跟着你的作息调整。"),
        dict(en="The practical markers are **resting heart rate**, **HRV**, sleep quality and duration, **soreness**, mood, and performance on a standard test.",
             zh="实用的指标是**静息心率**、**心率变异性**、睡眠质量与时长、**肌肉酸痛**、情绪，以及一项标准测试中的表现。"),
        dict(en="**HRV** is the most sensitive of them, because it reflects autonomic balance — and it is the one that falls before you notice.",
             zh="**心率变异性**是其中最敏感的，因为它反映自主神经平衡——而且它总是在你察觉之前就先掉下去。"),
        dict(en="**Resting heart rate** is cruder but far easier to take. A rise of **5–10 bpm** above your own baseline is a common early warning.",
             zh="**静息心率**更粗糙但容易测得多。比自己的基线高出**5到10次/分**，是一个常见的早期预警。"),
        dict(en="**Sleep** is the highest-yield recovery variable: extension can help, and even a nap of **30–60 minutes** can offset a short night.",
             zh="**睡眠**是回报最高的恢复变量：延长睡眠确实有帮助，而**30到60分钟**的一次小睡甚至可以抵消一个短夜。"),
        dict(en="**Travel** adds three problems at once: displaced sleep, changed time zones, and disrupted food timing. Jet lag is mostly a light problem.",
             zh="**旅行**同时带来三个问题：睡眠被打乱、时区改变、进餐时间中断。时差反应主要是一个光照问题。"),
        dict(en="So the practical response to travel is **light and meal timing first**, training load second — and one bad night is not evidence that the athlete is detraining.",
             zh="所以应对旅行的实用做法是**先调光照和进餐时间，再调训练量**——而一个糟糕的夜晚并不是运动员正在退化的证据。"),
    ],
    analogy=dict(
        en="Recovery monitoring is a **dashboard warning light**. You do not need to know why the engine is overheating to know you should stop and check the coolant. A rising resting heart rate is that light: it tells you something changed, and it does not require you to diagnose it before acting on it.",
        zh="恢复监测就像**仪表盘上的警示灯**。你不必知道发动机为什么过热，也知道该停下来检查冷却液。上升的静息心率就是那盏灯：它告诉你有东西变了，而且不要求你先诊断清楚才采取行动。"),
    example=dict(
        en="A swimmer crosses five time zones. On arrival her resting heart rate is 8 bpm above baseline and her morning HRV is down. Her coach could either ignore it or train her through it. The markers argue for one light day, no hard sets, normal meal timing, and strong morning light exposure — and by day three the numbers return to baseline and training resumes.",
        zh="一位游泳运动员跨越五个时区。到达后她的静息心率比基线高8次/分，早晨心率变异性也下降。教练可以无视，也可以硬练。而这些指标支持的做法是：先安排一天轻松训练、不上高强度课、保持正常进餐时间、并加强晨间光照——到第三天数值回到基线，训练即可恢复。"),
)

if __name__ == '__main__':
    import io, json, sys
    print('sections authored:', len(A))
    for k, v in A.items():
        assert v.get('sum'), k
        for p in v['sum']:
            assert p.get('en') and p.get('zh'), k
        assert v['analogy'].get('en') and v['analogy'].get('zh'), k
        assert v['example'].get('en') and v['example'].get('zh'), k
        for p in v['sum']:
            if len(p['en']) > 215: print('LONG', k, len(p['en']), file=sys.stderr)
            if len(p['zh']) > 130: print('LONG-ZH', k, len(p['zh']), file=sys.stderr)
    io.open('_authored_batch2.json', 'w', encoding='utf-8').write(
        json.dumps(A, ensure_ascii=False))
    print('wrote _authored_batch2.json')

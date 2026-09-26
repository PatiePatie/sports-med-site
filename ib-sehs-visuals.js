/* IB SEHS visual layer — models, tables and worked examples.
   window.IB_VISUALS keyed by native section title.
   SVG labels stay short and language-neutral; bilingual text lives in
   the legend and caption so the theme toggle keeps working. */
window.IB_VISUALS = {
 "Three laws and motion variables": {
  "figures": [
   {
    "title": {
     "en": "Newton’s three laws on one field",
     "zh": "牛顿三定律在一张图上"
    },
    "svg": "<line class=\"th\" x1=\"14\" y1=\"96\" x2=\"306\" y2=\"96\"/><path class=\"dash\" d=\"M236 34h64\"/><circle class=\"fillB\" cx=\"120\" cy=\"34\" r=\"11\"/><circle class=\"ln\" cx=\"120\" cy=\"34\" r=\"11\"/><line class=\"th\" x1=\"133\" y1=\"34\" x2=\"168\" y2=\"34\"/><path class=\"ln\" d=\"M168 34l-9-4.5v9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"174\" y=\"30\">v</text><line class=\"th\" x1=\"120\" y1=\"47\" x2=\"120\" y2=\"80\"/><path class=\"ln\" d=\"M120 80l-4.5-9h9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"127\" y=\"72\">g</text><text class=\"lblS\" x=\"14\" y=\"26\">1st + 2nd</text><rect class=\"fillA\" x=\"150\" y=\"140\" width=\"16\" height=\"26\"/><line class=\"ln\" x1=\"150\" y1=\"140\" x2=\"166\" y2=\"140\"/><line class=\"th\" x1=\"158\" y1=\"112\" x2=\"158\" y2=\"136\"/><path class=\"ln\" d=\"M158 136l-4.5-9h9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"164\" y=\"122\">F</text><line class=\"th\" x1=\"158\" y1=\"168\" x2=\"158\" y2=\"144\"/><path class=\"ln\" d=\"M158 144l-4.5 9h9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"164\" y=\"164\">F</text><text class=\"lblS\" x=\"14\" y=\"124\">3rd</text><path class=\"dash\" d=\"M186 140h116M186 168h116\"/><text class=\"lblS\" x=\"186\" y=\"132\">runner</text><text class=\"lblS\" x=\"186\" y=\"182\">ground</text>",
    "viewBox": "0 0 320 190",
    "legend": [
     {
      "en": "v — ball velocity, unchanged once it leaves the boot",
      "zh": "v — 球的速度，离开脚之后保持不变"
     },
     {
      "en": "g — gravity, the only force that changes v over time",
      "zh": "g — 重力，唯一随时间改变 v 的力"
     },
     {
      "en": "the two F arrows are equal and opposite, and act on different bodies",
      "zh": "两个 F 箭头等值反向，且作用在不同的物体上"
     }
    ],
    "caption": {
     "en": "Top: inertia plus free fall — the ball keeps its horizontal speed and gains vertical speed at g. Bottom: the third law, where the foot pushes the ground down and the ground pushes the foot up by exactly the same amount.",
     "zh": "上：惯性加上自由落体——球保持水平速度，并以 g 获得竖直速度。下：第三定律，脚向下推地面，地面以完全相同的量向上推脚。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The three laws in plain words",
     "zh": "三条定律的通俗说法"
    },
    "cols": [
     {
      "en": "Law",
      "zh": "定律"
     },
     {
      "en": "In one sentence",
      "zh": "一句话"
     },
     {
      "en": "Where you see it",
      "zh": "在哪里能看到"
     }
    ],
    "rows": [
     [
      {
       "en": "1st — inertia",
       "zh": "第一定律 — 惯性"
      },
      {
       "en": "Things keep doing what they are doing unless something acts on them.",
       "zh": "事物会保持其状态，除非有东西作用于它。"
      },
      {
       "en": "A sprinter does not stop at the line; a ball keeps going after the boot stops touching it.",
       "zh": "短跑运动员不会在终点线立刻停下；球在脚停止接触后仍继续前进。"
      }
     ],
     [
      {
       "en": "2nd — F = ma",
       "zh": "第二定律 — F = ma"
      },
      {
       "en": "The acceleration is the force divided by the mass.",
       "zh": "加速度等于力除以质量。"
      },
      {
       "en": "The same push moves a light ball further; a heavier athlete needs more force for the same speed.",
       "zh": "同样的力让轻球移动更远；更重的运动员需要更大的力才能达到同样速度。"
      }
     ],
     [
      {
       "en": "3rd — action and reaction",
       "zh": "第三定律 — 作用与反作用"
      },
      {
       "en": "Every push brings an equal push back, on a different object.",
       "zh": "每一次推都带来一个等值的反向推，作用在另一个物体上。"
      },
      {
       "en": "The runner pushes the ground back; the ground pushes the runner forward.",
       "zh": "跑者向后推地；地向前推跑者。"
      }
     ]
    ],
    "note": {
     "en": "The two forces in the third law never cancel, because they act on different bodies — which is exactly why a moving object can keep moving.",
     "zh": "第三定律中的两个力永远不相互抵消，因为它们作用在不同的物体上——这正是运动物体能够持续运动的原因。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: the force needed to accelerate a sprinter",
    "zh": "例题：加速一名短跑运动员需要多大的力"
   },
   "given": {
    "en": "A 70 kg sprinter accelerates from rest to 10 m/s over 4 seconds.",
    "zh": "一名 70 公斤的短跑运动员在 4 秒内从静止加速到 10 米/秒。"
   },
   "steps": [
    {
     "en": "Required acceleration: a = change in velocity / time = 10 / 4 = 2.5 m/s².",
     "zh": "所需加速度：a = 速度变化量 / 时间 = 10 / 4 = 2.5 米每二次方秒。"
    },
    {
     "en": "Required net force: F = ma = 70 x 2.5 = 175 N.",
     "zh": "所需合力：F = ma = 70 x 2.5 = 175 牛顿。"
    },
    {
     "en": "That is the net figure. The foot must also push hard enough to oppose body weight, so the force through the foot is larger than 175 N.",
     "zh": "那是合力的数值。脚还必须用力向上推以对抗身体重量，因此通过脚的总力大于 175 牛顿。"
    }
   ],
   "answer": {
    "en": "Net force 175 N; the actual ground force is higher. This is why a lighter sprinter needs less force for the same speed, and why mass matters most in acceleration rather than top speed.",
    "zh": "合力 175 牛顿；实际的地面力更大。这就是为什么更轻的短跑运动员需要更小的力就能达到同样速度，也为什么质量在加速度而非最高速度上作用最大。"
   }
  }
 },
 "Stability, impulse and collisions": {
  "figures": [
   {
    "title": {
     "en": "Centre of gravity versus base of support",
     "zh": "重心与支撑面"
    },
    "svg": "<g><line class=\"th\" x1=\"20\" y1=\"122\" x2=\"122\" y2=\"122\"/><line class=\"dash\" x1=\"71\" y1=\"46\" x2=\"71\" y2=\"122\"/><circle class=\"acc\" cx=\"71\" cy=\"46\" r=\"6\"/><path class=\"ln\" d=\"M32 122v9M110 122v9M32 131h78\"/><text class=\"lblS\" x=\"26\" y=\"152\">stable</text></g><g><line class=\"th\" x1=\"196\" y1=\"122\" x2=\"298\" y2=\"122\"/><line class=\"dash\" x1=\"239\" y1=\"46\" x2=\"239\" y2=\"122\"/><circle class=\"warn\" cx=\"239\" cy=\"46\" r=\"6\"/><path class=\"ln\" d=\"M266 122v9M288 122v9M266 131h22\"/><path class=\"ln\" d=\"M239 131a46 46 0 0 0-28-42\"/><text class=\"lblS\" x=\"146\" y=\"56\">topples</text><text class=\"lblS\" x=\"198\" y=\"152\">unstable</text></g>",
    "viewBox": "0 0 320 170",
    "legend": [
     {
      "en": "the dot is the centre of gravity; the line through it is the line of gravity",
      "zh": "圆点表示重心，穿过它的线是重力作用线"
     },
     {
      "en": "stable: the line stays inside the base",
      "zh": "稳定：重力线落在支撑面之内"
     },
     {
      "en": "unstable: the line falls outside and a toppling moment appears",
      "zh": "不稳定：重力线落在支撑面之外，出现倾覆力矩"
     }
    ],
    "caption": {
     "en": "The whole of balance is one comparison — where the line of gravity falls relative to the base of support. Nothing else in the definition differs between the two pictures.",
     "zh": "平衡的全部就是一次比较：重力线相对于支撑面落在哪里。这两幅图之间，定义中的其他任何东西都没有不同。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Where the energy goes in a collision",
     "zh": "碰撞中能量去了哪里"
    },
    "cols": [
     {
      "en": "Collision type",
      "zh": "碰撞类型"
     },
     {
      "en": "Momentum",
      "zh": "动量"
     },
     {
      "en": "Kinetic energy",
      "zh": "动能"
     },
     {
      "en": "Sport example",
      "zh": "运动例子"
     }
    ],
    "rows": [
     [
      {
       "en": "Elastic",
       "zh": "弹性"
      },
      {
       "en": "Conserved",
       "zh": "守恒"
      },
      {
       "en": "Conserved",
       "zh": "守恒"
      },
      {
       "en": "Almost never occurs with a body or a ball.",
       "zh": "涉及身体或球时几乎从不发生。"
      }
     ],
     [
      {
       "en": "Inelastic",
       "zh": "非弹性"
      },
      {
       "en": "Conserved",
       "zh": "守恒"
      },
      {
       "en": "Lost to heat, sound and deformation",
       "zh": "转化为热、声音与形变"
      },
      {
       "en": "Every collision in sport, including a ball off a wall.",
       "zh": "运动中的每一次碰撞，包括球撞墙。"
      }
     ],
     [
      {
       "en": "Coefficient of restitution",
       "zh": "恢复系数"
      },
      {
       "en": "—",
       "zh": "—"
      },
      {
       "en": "Rebound speed divided by approach speed",
       "zh": "反弹速度除以接近速度"
      },
      {
       "en": "Below 1 for any real impact, which is why rebounds are slower.",
       "zh": "任何真实撞击都小于 1，这正是反弹更慢的原因。"
      }
     ]
    ],
    "note": {
     "en": "Momentum is conserved in a closed system whatever happens. Energy is not, unless the collision is perfectly elastic — so a ball cannot return at the speed it arrived.",
     "zh": "在封闭系统中，无论发生什么，动量都守恒。能量则不然，除非碰撞是完全弹性的——所以球不可能以到达时的速度返回。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: bat speed versus ball speed",
    "zh": "例题：球棒速度与球速的关系"
   },
   "given": {
    "en": "Impact force 1200 N. Contact lasts 0.004 s in one case and 0.010 s in the other. Ball mass 0.07 kg.",
    "zh": "撞击力 1200 牛顿。接触时间一种为 0.004 秒，另一种为 0.010 秒。球质量 0.07 公斤。"
   },
   "steps": [
    {
     "en": "Impulse case 1: J = F x t = 1200 x 0.004 = 4.8 N·s.",
     "zh": "情形 1 的冲量：J = F x t = 1200 x 0.004 = 4.8 牛顿·秒。"
    },
    {
     "en": "Ball speed case 1: v = J / m = 4.8 / 0.07 = 68.6 m/s.",
     "zh": "情形 1 的球速：v = J / m = 4.8 / 0.07 = 68.6 米/秒。"
    },
    {
     "en": "Impulse case 2: J = 1200 x 0.010 = 12 N·s, which is 2.5 times case 1.",
     "zh": "情形 2 的冲量：J = 1200 x 0.010 = 12 牛顿·秒，是情形 1 的 2.5 倍。"
    },
    {
     "en": "Ball speed case 2: v = 12 / 0.07 = 171 m/s.",
     "zh": "情形 2 的球速：v = 12 / 0.07 = 171 米/秒。"
    }
   ],
   "answer": {
    "en": "Same force, same ball, 2.5 times the ball speed — purely from contact time. This is why a bigger, softer face is faster for the same swing, and why \"hit it harder\" is only one of two levers.",
    "zh": "同样的力、同样的球，球速是 2.5 倍——仅仅因为接触时间不同。这就是为什么更大、更软的拍面在相同挥拍下更快，也为什么\"打得更用力\"只是两个抓手中的一个。"
   }
  }
 },
 "Friction, work and power": {
  "figures": [
   {
    "title": {
     "en": "Work is an area; power is that area per second",
     "zh": "功是一个面积；功率是该面积除以时间"
    },
    "svg": "<line class=\"ln\" x1=\"30\" y1=\"130\" x2=\"300\" y2=\"130\"/><line class=\"ln\" x1=\"30\" y1=\"130\" x2=\"30\" y2=\"20\"/><path class=\"fillB\" d=\"M30 130V52c62-6 122 18 190 66v12z\"/><path class=\"ln\" d=\"M30 52c62-6 122 18 190 66\"/><line class=\"dash\" x1=\"220\" y1=\"118\" x2=\"220\" y2=\"130\"/><text class=\"lbl\" x=\"120\" y=\"148\">distance</text><text class=\"lbl\" x=\"8\" y=\"26\">F</text><text class=\"lbl\" x=\"98\" y=\"88\">work</text><line class=\"th\" x1=\"30\" y1=\"160\" x2=\"220\" y2=\"160\"/><path class=\"ln\" d=\"M220 160l-9-4.5v9z\" fill=\"currentColor\"/><text class=\"lblS\" x=\"98\" y=\"176\">t</text><text class=\"lblS\" x=\"232\" y=\"164\">work / t = power</text>",
    "viewBox": "0 0 320 190",
    "legend": [
     {
      "en": "the shaded area under the force–distance curve is the work done",
      "zh": "力–位移曲线下的阴影面积就是所做的功"
     },
     {
      "en": "the same area spread over twice the time is half the power",
      "zh": "同样的面积摊到两倍时间上，功率减半"
     }
    ],
    "caption": {
     "en": "A force acting through no distance does no work, however hard it pushes. That is why an isometric hold feels like work and is not.",
     "zh": "一个作用在零距离上的力不做功，无论它推得多用力。这正是为什么等长收缩感觉像在做功、而实际上不是。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Four quantities that get confused",
     "zh": "四个常被搞混的量"
    },
    "cols": [
     {
      "en": "Quantity",
      "zh": "量"
     },
     {
      "en": "Definition",
      "zh": "定义"
     },
     {
      "en": "It grows when…",
      "zh": "什么时候变大"
     }
    ],
    "rows": [
     [
      {
       "en": "Work",
       "zh": "功"
      },
      {
       "en": "Force multiplied by the distance it acts through",
       "zh": "力乘以它作用通过的距离"
      },
      {
       "en": "the load moves further, or the force is larger",
       "zh": "负荷移动得更远，或力更大"
      }
     ],
     [
      {
       "en": "Power",
       "zh": "功率"
      },
      {
       "en": "Work divided by time, or force multiplied by velocity",
       "zh": "功除以时间，或力乘以速度"
      },
      {
       "en": "the same work is done faster",
       "zh": "同样的功做得更快"
      }
     ],
     [
      {
       "en": "Impulse",
       "zh": "冲量"
      },
      {
       "en": "Force multiplied by the time it acts",
       "zh": "力乘以它作用的时间"
      },
      {
       "en": "the force is applied for longer",
       "zh": "力作用的时间更长"
      }
     ],
     [
      {
       "en": "Friction",
       "zh": "摩擦"
      },
      {
       "en": "The tax a surface charges for the shape you present to it",
       "zh": "表面对你呈现的形状所征收的“税”"
      },
      {
       "en": "grip raises it, sliding lowers it",
       "zh": "抓地提高摩擦，滑动降低摩擦"
      }
     ]
    ],
    "note": {
     "en": "Power decides explosive events and it is specific: a slow effort at the same force produces no power gain, however much total work is done.",
     "zh": "功率决定爆发性事件，而且它是专项性的：同样的力做得慢，就不会产生功率增长，无论总共做了多少功。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: same jump, very different power",
    "zh": "例题：同样的跳跃，很不一样的功率"
   },
   "given": {
    "en": "Both athletes lift a 90 kg barbell 0.5 m. Athlete A takes 2.0 s, athlete B takes 0.4 s.",
    "zh": "两人都把 90 公斤的杠铃举起 0.5 米。运动员 A 用 2.0 秒，运动员 B 用 0.4 秒。"
   },
   "steps": [
    {
     "en": "Work for both: W = F x d = (90 x 9.8) x 0.5 = 441 J.",
     "zh": "两人的功：W = F x d = (90 x 9.8) x 0.5 = 441 焦耳。"
    },
    {
     "en": "Power A: P = 441 / 2.0 = 220 W.",
     "zh": "A 的功率：P = 441 / 2.0 = 220 瓦。"
    },
    {
     "en": "Power B: P = 441 / 0.4 = 1103 W.",
     "zh": "B 的功率：P = 441 / 0.4 = 1103 瓦。"
    },
    {
     "en": "Ratio: B is five times the power of A, while the work is identical.",
     "zh": "比值：B 的功率是 A 的五倍，而功完全相同。"
    }
   ],
   "answer": {
    "en": "Identical work, five times the power. This is the whole case for rate-of-force-development work: the bar travels the same distance either way, so only one of these athletes is training for the event they are entered in.",
    "zh": "功相同，功率五倍。这就是力量速度发展训练的完整理由：杠铃两种情况下都走同样的距离，所以这两位运动员中只有一位是在为实际参赛的项目训练。"
   }
  }
 },
 "Projectile motion and environmental forces": {
  "figures": [
   {
    "title": {
     "en": "One launch, two independent motions",
     "zh": "一次出手，两个彼此独立的运动"
    },
    "svg": "<line class=\"ln\" x1=\"24\" y1=\"140\" x2=\"300\" y2=\"140\"/><path class=\"ln\" d=\"M40 140C96 44 190 44 268 140\"/><line class=\"dash\" d=\"M40 140L96 84\"/><line class=\"dash\" d=\"M40 140L268 140\"/><path class=\"ln\" d=\"M40 140a34 34 0 0 0 14 6\" /><text class=\"lblS\" x=\"62\" y=\"118\">45°</text><circle class=\"acc\" cx=\"154\" cy=\"60\" r=\"5\"/><text class=\"lblS\" x=\"160\" y=\"54\">apex</text><line class=\"th\" x1=\"154\" y1=\"60\" x2=\"154\" y2=\"140\" /><text class=\"lblS\" x=\"160\" y=\"104\">vy = 0</text><line class=\"th\" x1=\"40\" y1=\"140\" x2=\"130\" y2=\"140\"/><path class=\"ln\" d=\"M130 140l-9-4.5v9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"78\" y=\"132\">vx</text><line class=\"th\" x1=\"40\" y1=\"140\" x2=\"76\" y2=\"96\"/><path class=\"ln\" d=\"M76 96l-8 1 4 7z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"80\" y=\"92\">v</text><line class=\"dash\" x1=\"268\" y1=\"140\" x2=\"268\" y2=\"152\"/><text class=\"lblS\" x=\"248\" y=\"168\">range</text>",
    "viewBox": "0 0 320 180",
    "legend": [
     {
      "en": "vx is constant the whole flight — gravity does not act horizontally",
      "zh": "vx 在整段飞行中保持不变——重力不作用在水平方向"
     },
     {
      "en": "vy starts positive, reaches zero at the apex, then goes negative",
      "zh": "vy 起初为正，在最高点为零，之后转为负"
     },
     {
      "en": "launch angle sets how long it stays up, speed sets how far",
      "zh": "出手角决定在空中停留多久，速度决定飞多远"
     }
    ],
    "caption": {
     "en": "The two motions are independent, which is the whole idea: a projectile thrown faster horizontally travels further without any change in its vertical behaviour.",
     "zh": "两个运动彼此独立，这正是核心所在：水平方向抛得更快的抛体会飞得更远，而它的竖直行为完全不变。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Launch angle and launch speed, side by side",
     "zh": "出手角与出手速度的对比"
    },
    "cols": [
     {
      "en": "Variable",
      "zh": "变量"
     },
     {
      "en": "What it controls",
      "zh": "它控制什么"
     },
     {
      "en": "Why it enters the formula that way",
      "zh": "为什么在公式中是这样进入的"
     }
    ],
    "rows": [
     [
      {
       "en": "Launch speed",
       "zh": "出手速度"
      },
      {
       "en": "Range — roughly proportional, double the speed is double the distance",
       "zh": "射程——大致成正比，速度翻倍距离也翻倍"
      },
      {
       "en": "Speed is squared in the range formula, so it is the powerful variable",
       "zh": "速度在射程公式中是平方项，所以它是有力的变量"
      }
     ],
     [
      {
       "en": "Launch angle",
       "zh": "出手角"
      },
      {
       "en": "Height gained versus time spent getting there",
       "zh": "获得的高度与到达所需时间之间的权衡"
      },
      {
       "en": "Angle is not squared; 45° is only optimal with no air resistance",
       "zh": "角度不是平方项；45 度只在没有空气阻力时才最优"
      }
     ],
     [
      {
       "en": "Air resistance",
       "zh": "空气阻力"
      },
      {
       "en": "Penalises a steep launch and cuts range",
       "zh": "惩罚太陡的出手并缩短射程"
      },
      {
       "en": "Real throwing angles are 30–40°, not 45°",
       "zh": "真实投掷角是 30 到 40 度，而不是 45 度"
      }
     ]
    ],
    "note": {
     "en": "Range equals speed squared times the sine of twice the angle, divided by gravity. Understanding that shape is worth more than memorising it, because it shows immediately that the two variables are not interchangeable.",
     "zh": "射程等于速度的平方乘以二倍角的正弦再除以重力。理解这个形状比死记更有价值，因为它立刻显示出这两个变量不可互换。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: why 5° of angle costs metres",
    "zh": "例题：为什么 5 度的角度差就损失数米"
   },
   "given": {
    "en": "A javelin leaves at 38 m/s at 38°. Compute the range, then recompute at 33° and 43°.",
    "zh": "一支标枪以 38 米/秒、38 度出手。计算射程，然后在 33 度和 43 度时重新计算。"
   },
   "steps": [
    {
     "en": "Range = v² sin(2θ) / g. At 38°: sin 76° = 0.970.",
     "zh": "射程 = v² sin(2θ) / g。在 38 度：sin 76° = 0.970。"
    },
    {
     "en": "R = 38² x 0.970 / 9.8 = 1444 x 0.970 / 9.8 = 143 m.",
     "zh": "R = 38² x 0.970 / 9.8 = 1444 x 0.970 / 9.8 = 143 米。"
    },
    {
     "en": "At 33°: sin 66° = 0.914, so R = 1444 x 0.914 / 9.8 = 135 m — eight metres lost.",
     "zh": "在 33 度：sin 66° = 0.914，所以 R = 1444 x 0.914 / 9.8 = 135 米——损失八米。"
    },
    {
     "en": "At 43°: sin 86° = 0.998, so R = 1444 x 0.998 / 9.8 = 147 m.",
     "zh": "在 43 度：sin 86° = 0.998，所以 R = 1444 x 0.998 / 9.8 = 147 米。"
    }
   ],
   "answer": {
    "en": "Five degrees either way is worth roughly four to eight metres, and the loss is not symmetric because the sine curve is not. A speed error of 5 percent would cost considerably more, since speed is the squared term.",
    "zh": "两个方向各偏 5 度大约值四到八米，而且损失并不对称，因为正弦曲线本身不对称。速度误差 5% 会损失得多得多，因为速度是平方项。"
   }
  }
 },
 "Buoyancy, lift and drag": {
  "figures": [
   {
    "title": {
     "en": "Buoyancy, then the four forces on a wing",
     "zh": "先是浮力，然后是机翼上的四个力"
    },
    "svg": "<g><line class=\"ln\" x1=\"18\" y1=\"66\" x2=\"150\" y2=\"66\"/><path class=\"fillB\" d=\"M46 40h58v26H46z\"/><path class=\"ln\" d=\"M46 40h58v26H46z\"/><line class=\"th\" x1=\"75\" y1=\"40\" x2=\"75\" y2=\"6\"/><path class=\"ln\" d=\"M75 6l-4.5 9h9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"81\" y=\"16\">F b</text><line class=\"th\" x1=\"75\" y1=\"88\" x2=\"75\" y2=\"118\"/><path class=\"ln\" d=\"M75 118l-4.5-9h9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"81\" y=\"114\">W</text><path class=\"fillC\" d=\"M46 66h58v18H46z\"/><text class=\"lblS\" x=\"46\" y=\"98\">displaced</text></g><g><path class=\"fillA\" d=\"M176 78c22-26 62-30 96-8-30 2-58 6-96 8z\"/><path class=\"ln\" d=\"M176 78c22-26 62-30 96-8-30 2-58 6-96 8z\"/><line class=\"th\" x1=\"196\" y1=\"76\" x2=\"196\" y2=\"34\"/><path class=\"ln\" d=\"M196 34l-4.5 9h9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"202\" y=\"40\">L</text><line class=\"th\" x1=\"232\" y1=\"76\" x2=\"232\" y2=\"118\"/><path class=\"ln\" d=\"M232 118l-4.5-9h9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"238\" y=\"114\">W</text><line class=\"th\" x1=\"272\" y1=\"70\" x2=\"308\" y2=\"70\"/><path class=\"ln\" d=\"M308 70l-9-4.5v9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"284\" y=\"62\">T</text><line class=\"th\" x1=\"176\" y1=\"82\" x2=\"140\" y2=\"82\"/><path class=\"ln\" d=\"M140 82l9-4.5v9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"146\" y=\"76\">D</text></g>",
    "viewBox": "0 0 320 130",
    "legend": [
     {
      "en": "left: a floating block displaces its own volume in water, and the buoyant force equals the weight of that displaced fluid",
      "zh": "左：漂浮的物体排开与自身体积相同的水，浮力等于所排开流体的重量"
     },
     {
      "en": "right: four forces on any flying object — lift up, weight down, thrust forward, drag back",
      "zh": "右：任何飞行物体上的四个力——升力向上、重力向下、推力向前、阻力向后"
     }
    ],
    "caption": {
     "en": "Buoyancy and lift are the same principle in different fluids. A swimmer is a body in a buoyant medium where almost everything they do is a negotiation with drag.",
     "zh": "浮力与升力是同一原理在不同流体中的表现。游泳者是一个处在浮性介质中的身体，他做的几乎每一件事都是在与阻力谈判。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The three fluid forces, and what each responds to",
     "zh": "三种流体作用力及各自分别的影响因素"
    },
    "cols": [
     {
      "en": "Force",
      "zh": "力"
     },
     {
      "en": "Depends on",
      "zh": "取决于"
     },
     {
      "en": "Sport consequence",
      "zh": "运动中的推论"
     }
    ],
    "rows": [
     [
      {
       "en": "Buoyancy",
       "zh": "浮力"
      },
      {
       "en": "Volume of fluid displaced, not speed",
       "zh": "所排开流体的体积，而不是速度"
      },
      {
       "en": "Low body density makes floating and easier water position easier",
       "zh": "身体密度低使漂浮与更容易的水中位置成为可能"
      }
     ],
     [
      {
       "en": "Lift",
       "zh": "升力"
      },
      {
       "en": "Shape, angle of attack and speed",
       "zh": "形状、攻角与速度"
      },
      {
       "en": "A ski jumper has no engine — the whole flight is a shape holding an attitude",
       "zh": "跳台滑雪者没有引擎——整段飞行就是一个形状在保持姿态"
      }
     ],
     [
      {
       "en": "Drag",
       "zh": "阻力"
      },
      {
       "en": "Speed squared, frontal area, and shape",
       "zh": "速度的平方、迎风面积与形状"
      },
      {
       "en": "Rises with roughly the square of speed, so it sets a hard ceiling on velocity",
       "zh": "大致按速度的平方增长，因此为速度设下一个硬上限"
      }
     ]
    ],
    "note": {
     "en": "Water is roughly one thousand times denser than air, so the buoyant force on a swimmer is enormous compared with the same body in air. Air is about 1.2 kg per cubic metre at sea level and falls with altitude and temperature.",
     "zh": "水的密度约为空气的一千倍，所以游泳者受到的浮力相对于同样身体在空气中受到的浮力极大。海平面空气密度约为每立方米 1.2 公斤，并随海拔与温度下降。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: why drag sets a speed ceiling",
    "zh": "例题：为什么阻力为速度设下上限"
   },
   "given": {
    "en": "A 70 kg cyclist in a tuck presents 0.35 m². Air density 1.2 kg/m³. Drag coefficient 0.5.",
    "zh": "一名 70 公斤的自行车手收起身子，迎风面积 0.35 平方米。空气密度 1.2 公斤每立方米。阻力系数 0.5。"
   },
   "steps": [
    {
     "en": "Drag force: D = ½ ρ C A v².",
     "zh": "阻力：D = ½ ρ C A v²。"
    },
    {
     "en": "At 40 km/h = 11.1 m/s: D = 0.5 x 1.2 x 0.5 x 0.35 x 11.1² = 129 N.",
     "zh": "在 40 公里/小时 = 11.1 米/秒：D = 0.5 x 1.2 x 0.5 x 0.35 x 11.1² = 129 牛顿。"
    },
    {
     "en": "At 44 km/h = 12.2 m/s: D = 145 N, so 10 percent more speed costs 12 percent more drag.",
     "zh": "在 44 公里/小时 = 12.2 米/秒：D = 145 牛顿，所以速度多 10% 就多付 12% 的阻力。"
    },
    {
     "en": "At 80 km/h = 22.2 m/s: D = 517 N, which is well above the power the rider can sustain.",
     "zh": "在 80 公里/小时 = 22.2 米/秒：D = 517 牛顿，远高于骑手能持续输出的功率。"
    }
   ],
   "answer": {
    "en": "A 10 percent speed rise costs 21 percent more drag, because drag goes as the square. Once a rider is near the limit, cutting frontal area is worth more than adding power — which is why the tuck and the helmet are performance equipment.",
    "zh": "速度提高 10% 会多付 21% 的阻力，因为阻力按平方增长。一旦骑手接近极限，减少迎风面积就比增加功率更值钱——这正是收身姿势与头盔属于比赛装备的原因。"
   }
  }
 },
 "Angle of attack, Magnus effect and fairness": {
  "figures": [
   {
    "title": {
     "en": "Angle of attack up to the stall, and the Magnus effect",
     "zh": "攻角直到失速，以及马格努斯效应"
    },
    "svg": "<g><path class=\"fillA\" d=\"M14 56c14-10 34-10 50 0-16 4-34 4-50 0z\"/><path class=\"ln\" d=\"M14 56c14-10 34-10 50 0-16 4-34 4-50 0z\"/><path class=\"dash\" d=\"M4 70h66\"/><text class=\"lblS\" x=\"4\" y=\"82\">low AoA</text><text class=\"lblS\" x=\"4\" y=\"94\">lift ok</text></g><g><path class=\"fillA\" d=\"M120 60c14-14 34-14 50 0-16 6-34 6-50 0z\"/><path class=\"ln\" d=\"M120 60c14-14 34-14 50 0-16 6-34 6-50 0z\"/><path class=\"dash\" d=\"M110 82h66\"/><text class=\"lblS\" x=\"110\" y=\"94\">mid</text></g><g><path class=\"fillC\" d=\"M228 74c10-20 30-22 46-6-14 4-30 6-46 6z\"/><path class=\"ln\" d=\"M228 74c10-20 30-22 46-6-14 4-30 6-46 6z\"/><path class=\"dash\" d=\"M220 96h66\"/><path class=\"ln\" d=\"M262 60q10 8 4 18\"/><text class=\"lblS\" x=\"222\" y=\"110\">stall</text></g><g><circle class=\"fillB\" cx=\"96\" cy=\"146\" r=\"13\"/><circle class=\"ln\" cx=\"96\" cy=\"146\" r=\"13\"/><path class=\"ln\" d=\"M84 136a18 18 0 0 1 24 0\"/><path class=\"ln\" d=\"M84 156a18 18 0 0 0 24 0\"/><line class=\"th\" x1=\"96\" y1=\"133\" x2=\"96\" y2=\"108\"/><path class=\"ln\" d=\"M96 108l-4.5 9h9z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"102\" y=\"118\">F</text></g>",
    "viewBox": "0 0 320 170",
    "legend": [
     {
      "en": "attached flow: lift rises with angle of attack, roughly linearly",
      "zh": "气流附着：升力随攻角大致线性增加"
     },
     {
      "en": "past the critical angle the flow separates, lift collapses and drag climbs — that is stall",
      "zh": "超过临界角后气流分离、升力崩塌而阻力上升——那就是失速"
     },
     {
      "en": "a spinning ball drags air round with it, giving a sideways Magnus force",
      "zh": "旋转的球把空气带着转，从而产生一个侧向的马格努斯力"
     }
    ],
    "caption": {
     "en": "The critical angle is somewhere around 12 to 20 degrees depending on the section. Turn an aerofoil past it and the lift is lost in one step rather than gradually.",
     "zh": "临界角大约在 12 到 20 度之间，取决于翼型。把翼型超过它，升力会在一步之内丢失，而不是逐渐丢失。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Why the fairness question is a real one",
     "zh": "为什么公平性问题是一个真问题"
    },
    "cols": [
     {
      "en": "Technology",
      "zh": "技术"
     },
     {
      "en": "What it changes",
      "zh": "它改变了什么"
     },
     {
      "en": "Category",
      "zh": "类别"
     }
    ],
    "rows": [
     [
      {
       "en": "Longer pole",
       "zh": "更长的撑杆"
      },
      {
       "en": "A geometric advantage available to anyone who can afford one",
       "zh": "任何负担得起的人都能获得的力学优势"
      },
      {
       "en": "Equipment — visible, rule-able, and equal only if access is equal",
       "zh": "装备——可见、可规则化，且只有在获取平等时才是平等的"
      }
     ],
     [
      {
       "en": "Faster topspin serve",
       "zh": "更快的上旋发球"
      },
      {
       "en": "The Magnus force becomes a significant fraction of ball weight at high spin",
       "zh": "在高转速下马格努斯力成为球重的一个相当可观的比例"
      },
      {
       "en": "Skill — largely individual, and not removable by a uniform rule",
       "zh": "技术——在很大程度上是个体差异，无法用统一规则消除"
      }
     ],
     [
      {
       "en": "Spin-axis tilt in pitching",
       "zh": "投球中的旋转轴倾角"
      },
      {
       "en": "A few degrees produce a measurable change in movement over the plate",
       "zh": "几度就能产生过板后可测量的运动变化"
      },
      {
       "en": "Skill plus equipment interacting — the hardest category to legislate",
       "zh": "技术与装备的交互——最难立规的一类"
      }
     ],
     [
      {
       "en": "Kinder surface or ball",
       "zh": "更软的场地或球"
      },
      {
       "en": "Alters the conditions for everyone rather than giving one athlete an edge",
       "zh": "改变所有人的条件，而不是给某一位运动员优势"
      },
      {
       "en": "Conditions — legitimate if it protects everyone",
       "zh": "条件——如果它保护所有人则是正当的"
      }
     ]
    ],
    "note": {
     "en": "Once the physics is measured, the question of who should have access becomes concrete rather than philosophical. That is the value of knowing the mechanism.",
     "zh": "一旦物理被测量，\"谁应当获得它\"这个问题就从哲学问题变成了具体问题。这正是了解机制的价值所在。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: reading a serve trajectory",
    "zh": "例题：读懂一次发球的轨迹"
   },
   "given": {
    "en": "A serve leaves at 50 m/s at 8° above horizontal with topspin. Estimate how much it drops by the far service line at 18 m.",
    "zh": "一次发球以 50 米/秒、水平面上方 8 度出手，带上旋。估计它在 18 米处的底线处下降了多少。"
   },
   "steps": [
    {
     "en": "Horizontal speed: vx = 50 x cos 8° = 49.5 m/s.",
     "zh": "水平速度：vx = 50 x cos 8° = 49.5 米/秒。"
    },
    {
     "en": "Vertical speed at launch: vy = 50 x sin 8° = 7.0 m/s.",
     "zh": "出手时的竖直速度：vy = 50 x sin 8° = 7.0 米/秒。"
    },
    {
     "en": "Time to the far line: t = 18 / 49.5 = 0.36 s.",
     "zh": "到达底线的时间：t = 18 / 49.5 = 0.36 秒。"
    },
    {
     "en": "Without spin, drop from gravity alone = ½ x 9.8 x 0.36² = 0.64 m.",
     "zh": "不计旋转、仅重力造成的下降 = ½ x 9.8 x 0.36² = 0.64 米。"
    },
    {
     "en": "Topspin adds a downward force, so the real drop is larger — the order of a metre. That is why the same launch angle with backspin floats and with topspin dips.",
     "zh": "上旋增加一个向下的力，所以实际下降更大——量级约一米。这就是为什么同样的出手角，下旋会飘而上旋会坠。"
    }
   ],
   "answer": {
    "en": "Roughly a metre of extra drop, entirely from spin. The launch angle is nearly unchanged, so the bounce looks different even though the player appears to have done the same thing.",
    "zh": "大约多出一米的下降，完全来自旋转。出手角几乎没有变化，所以弹跳看起来不同，尽管球员看起来做的是同一个动作。"
   }
  }
 },
 "Phases and the diagnosis loop": {
  "figures": [
   {
    "title": {
     "en": "The four phases of a skill, and the loop that fixes them",
     "zh": "技能的四个阶段，以及修正它们的循环"
    },
    "svg": "<g><rect class=\"fillA\" x=\"16\" y=\"20\" width=\"66\" height=\"34\" rx=\"6\"/><path class=\"ln\" d=\"M16 20h66v34H16z\"/><text class=\"lblS\" x=\"24\" y=\"34\">prep</text><text class=\"lblS\" x=\"24\" y=\"46\">set-up</text></g><g><rect class=\"fillB\" x=\"94\" y=\"20\" width=\"66\" height=\"34\" rx=\"6\"/><path class=\"ln\" d=\"M94 20h66v34H94z\"/><text class=\"lblS\" x=\"102\" y=\"34\">force</text><text class=\"lblS\" x=\"102\" y=\"46\">production</text></g><g><rect class=\"fillC\" x=\"172\" y=\"20\" width=\"66\" height=\"34\" rx=\"6\"/><path class=\"ln\" d=\"M172 20h66v34H172z\"/><text class=\"lblS\" x=\"180\" y=\"34\">critical</text><text class=\"lblS\" x=\"180\" y=\"46\">instant</text></g><g><rect class=\"fillA\" x=\"250\" y=\"20\" width=\"54\" height=\"34\" rx=\"6\"/><path class=\"ln\" d=\"M250 20h54v34H250z\"/><text class=\"lblS\" x=\"258\" y=\"34\">follow</text><text class=\"lblS\" x=\"258\" y=\"46\">through</text></g><path class=\"th\" d=\"M82 37h10M160 37h10M238 37h10\"/><path class=\"ln\" d=\"M92 37l-9-4.5v9z\" fill=\"currentColor\"/><path class=\"ln\" d=\"M170 37l-9-4.5v9z\" fill=\"currentColor\"/><path class=\"ln\" d=\"M248 37l-9-4.5v9z\" fill=\"currentColor\"/><path class=\"dash\" d=\"M277 60v34H49V60\"/><path class=\"ln\" d=\"M49 60l4.5-9h-9z\" fill=\"currentColor\"/><g><rect class=\"fillA\" x=\"112\" y=\"106\" width=\"96\" height=\"34\" rx=\"6\"/><path class=\"ln\" d=\"M112 106h96v34h-96z\"/><text class=\"lblS\" x=\"120\" y=\"120\">record</text><text class=\"lblS\" x=\"120\" y=\"132\">re-test</text></g><path class=\"th\" d=\"M160 100V84\"/><path class=\"ln\" d=\"M160 84l-4.5 9h9z\" fill=\"currentColor\"/>",
    "viewBox": "0 0 320 160",
    "legend": [
     {
      "en": "the critical instant is the shortest phase and decides most of the outcome",
      "zh": "关键时刻是最短的一个阶段，却决定了大部分结果"
     },
     {
      "en": "the loop is record, identify the failed phase, change one thing, record again",
      "zh": "循环是：录像、确定失败阶段、只改一件事、再录像"
     },
     {
      "en": "changing one thing at a time is what makes any improvement attributable",
      "zh": "每次只改一件事，正是让任何改进可归因的原因"
     }
    ],
    "caption": {
     "en": "Phase analysis turns \"the shot is bad\" into \"the landing is late\", which is a specific and correctable problem rather than a complaint.",
     "zh": "阶段分析把\"这个投篮不行\"变成\"落地晚了\"，后者是一个具体且可纠正的问题，而不是一句抱怨。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The four phases and their characteristic errors",
     "zh": "四个阶段及其典型错误"
    },
    "cols": [
     {
      "en": "Phase",
      "zh": "阶段"
     },
     {
      "en": "Failure looks like",
      "zh": "失误表现"
     },
     {
      "en": "Correction targets",
      "zh": "纠正针对"
     }
    ],
    "rows": [
     [
      {
       "en": "Preparation",
       "zh": "准备"
      },
      {
       "en": "Off-line from the start",
       "zh": "一开始就偏"
      },
      {
       "en": "Set-up and alignment before the ball or the gun",
       "zh": "球或枪之前的站位与对位"
      }
     ],
     [
      {
       "en": "Force production",
       "zh": "发力"
      },
      {
       "en": "Straight but short",
       "zh": "方向对但距离不够"
      },
      {
       "en": "The drive and the timing of the release",
       "zh": "蹬伸以及出手时机"
      }
     ],
     [
      {
       "en": "Critical instant",
       "zh": "关键时刻"
      },
      {
       "en": "On line, then deviates",
       "zh": "先对线，然后偏掉"
      },
      {
       "en": "Contact, and the joint position at it",
       "zh": "触球/触地瞬间及其关节位置"
      }
     ],
     [
      {
       "en": "Follow-through",
       "zh": "随动"
      },
      {
       "en": "Reaches the target and gets pushed off it",
       "zh": "到达目标又被推开"
      },
      {
       "en": "Balance and the ability to decelerate",
       "zh": "平衡以及减速能力"
      }
     ]
    ],
    "note": {
     "en": "All four look identical from the sideline and need completely different corrections, which is exactly why \"shoot better\" is not a coaching instruction.",
     "zh": "这四种在场边看起来一模一样，却需要完全不同的纠正——这正是\"投得更好\"不构成一条教练指令的原因。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: diagnosing a short jump",
    "zh": "例题：诊断一次距离不够的跳跃"
   },
   "given": {
    "en": "A long jumper is short of the board by 20 cm. Training shows a strong take-off and a good flight.",
    "zh": "一位跳远运动员差 20 厘米未上板。训练显示起跳有力、空中动作良好。"
   },
   "steps": [
    {
     "en": "Because the take-off is strong and the flight is good, the error is not force production.",
     "zh": "由于起跳有力、空中动作良好，错误不在发力阶段。"
    },
    {
     "en": "A short board usually means the take-off point is too far back, which means the last step was too long.",
     "zh": "差板通常意味着起跳点过于靠后，也就是说最后一步迈得太长。"
    },
    {
     "en": "So the failing phase is preparation or the plant, and the correction is a shorter, faster last step.",
     "zh": "因此失败阶段是准备或支撑动作，纠正办法是更短更快的最后一步。"
    },
    {
     "en": "Adding jump strength would not have fixed it, and would have hidden the real cause.",
     "zh": "增加跳跃力量不会解决这个问题，反而会掩盖真正的原因。"
    }
   ],
   "answer": {
    "en": "A strength intervention would have been the intuitive response and the wrong one. Phase analysis chose the preparation phase and produced a correction that could be tested the next session.",
    "zh": "力量干预会是最直觉的回应，也是错误的回应。阶段分析选中了准备阶段，产出一个下一堂训练课就能检验的纠正方案。"
   }
  }
 },
 "Evidence sources and compensation": {
  "figures": [
   {
    "title": {
     "en": "Compensation: why a healthy knee can hurt",
     "zh": "代偿：为什么一个健康的膝盖会疼"
    },
    "svg": "<g><circle class=\"fillA\" cx=\"44\" cy=\"34\" r=\"18\"/><path class=\"ln\" d=\"M44 16a18 18 0 1 1 0 36 18 18 0 1 1 0-36z\"/><text class=\"lblS\" x=\"26\" y=\"38\">hip</text><text class=\"lblS\" x=\"16\" y=\"66\">weak glute</text></g><path class=\"th\" d=\"M68 34h34\"/><path class=\"ln\" d=\"M102 34l-9-4.5v9z\" fill=\"currentColor\"/><g><line class=\"th\" x1=\"140\" cy1=\"16\" x2=\"140\" y2=\"52\"/><path class=\"ln\" d=\"M140 16a22 22 0 0 1 10 18\" /><path class=\"ln\" d=\"M150 34l-8 1 4 7z\" fill=\"currentColor\"/><text class=\"lblS\" x=\"128\" y=\"66\">femur</text><text class=\"lblS\" x=\"118\" y=\"78\">rotates in</text></g><path class=\"th\" d=\"M160 40h34\"/><path class=\"ln\" d=\"M194 40l-9-4.5v9z\" fill=\"currentColor\"/><g><path class=\"fillC\" d=\"M206 22h26v36h-26z\"/><path class=\"ln\" d=\"M206 22h26v36h-26z\"/><line class=\"th\" x1=\"212\" y1=\"40\" x2=\"226\" y2=\"40\"/><text class=\"lbl\" x=\"212\" y=\"34\">k</text><text class=\"lblS\" x=\"196\" y=\"72\">medial</text><text class=\"lblS\" x=\"192\" y=\"84\">compartment</text></g><g><text class=\"lblS\" x=\"246\" y=\"30\">load</text><text class=\"lblS\" x=\"246\" y=\"42\">rises</text><path class=\"th\" d=\"M240 52h56\"/><path class=\"ln\" d=\"M296 52l-9-4.5v9z\" fill=\"currentColor\"/></g><path class=\"dash\" d=\"M14 104h292\"/><text class=\"lblS\" x=\"14\" y=\"122\">nothing is torn — the tissue is healthy and simply being used in a way it cannot tolerate</text>",
    "viewBox": "0 0 320 130",
    "legend": [
     {
      "en": "a weak hip stops controlling femoral rotation",
      "zh": "髋部无力使股骨旋转失去控制"
     },
     {
      "en": "the femur then rotates inward on every step",
      "zh": "于是股骨在每一步都内旋"
     },
     {
      "en": "the medial knee compartment takes load it was not designed for",
      "zh": "内侧膝间室承担了它并非为之设计的负荷"
     }
    ],
    "caption": {
     "en": "This is compensation, and it explains the majority of running injuries that have no incident. The tissue is not damaged — it is being asked to do someone else work.",
     "zh": "这就是代偿，它解释了大多数没有明确外伤事件的跑步损伤。组织没有受损——它被要求去做别人的工作。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The four evidence sources and what each can and cannot tell you",
     "zh": "四类证据来源各自能与不能告诉你什么"
    },
    "cols": [
     {
      "en": "Source",
      "zh": "来源"
     },
     {
      "en": "Strong for",
      "zh": "擅长回答"
     },
     {
      "en": "Weak for",
      "zh": "不擅长回答"
     }
    ],
    "rows": [
     [
      {
       "en": "Athlete history",
       "zh": "运动员病史"
      },
      {
       "en": "Mechanism, onset, behaviour, what has been tried",
       "zh": "机制、起病、行为特征、已尝试过什么"
      },
      {
       "en": "Anything structural inside the tissue",
       "zh": "组织内部的结构性问题"
      }
     ],
     [
      {
       "en": "Physical testing",
       "zh": "体格测试"
      },
      {
       "en": "Strength and range numbers, and whether they change",
       "zh": "力量与活动度的数字，以及它们是否变化"
      },
      {
       "en": "Whether the numbers matter in this athlete’s movement",
       "zh": "这些数字在该运动员的动作中是否重要"
      }
     ],
     [
      {
       "en": "Movement observation",
       "zh": "动作观察"
      },
      {
       "en": "The pattern, which is usually the diagnosis",
       "zh": "模式，而模式通常就是诊断"
      },
      {
       "en": "Load history and capacity",
       "zh": "负荷史与容量"
      }
     ],
     [
      {
       "en": "Imaging",
       "zh": "影像"
      },
      {
       "en": "Structure",
       "zh": "结构"
      },
      {
       "en": "Mechanism, and whether a finding is meaningful",
       "zh": "机制，以及某个发现是否有意义"
      }
     ]
    ],
    "note": {
     "en": "A normal scan does not exclude a mechanical cause, and a finding common in asymptomatic people does not explain a pain. Weighting one source too heavily is the standard error.",
     "zh": "正常的检查不能排除力学原因，而无症状人群中常见的发现也不能解释疼痛。过度依赖某一种来源是典型的错误。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: using the loop on a painful knee",
    "zh": "例题：把循环用在一个疼的膝盖上"
   },
   "given": {
    "en": "A runner reports 6/10 medial knee pain, gradual onset, no incident, rising with 40 km weeks.",
    "zh": "一名跑者报告内侧膝部疼痛 6/10，逐渐起病，无明确事件，在每周 40 公里时加重。"
   },
   "steps": [
    {
     "en": "History first: gradual onset with no incident is itself a finding pointing at cumulative load.",
     "zh": "先看病史：逐渐起病且无事件，本身就是指向累积负荷的一个发现。"
    },
    {
     "en": "Test the hypothesis rather than confirming it: measure hip abduction and femoral control.",
     "zh": "检验假设而不是证实它：测量髋外展与股骨控制。"
    },
    {
     "en": "Finding: hip abduction is 25 percent below the other side, and single-leg stance shows pelvic drop.",
     "zh": "发现：髋外展比另一侧低 25%，单腿站立显示骨盆下沉。"
    },
    {
     "en": "Change one thing: reduce the week to 30 km and add hip abduction work, then re-measure in three weeks.",
     "zh": "只改一件事：把周里程降到 30 公里并加入髋外展训练，三周后复测。"
    }
   ],
   "answer": {
    "en": "The imaging was normal and would have been the wrong place to start. The history supplied the mechanism, the test confirmed it, and one change made the result attributable.",
    "zh": "影像学是正常的，而从那里入手恰恰是错的起点。病史提供了机制，测试证实了机制，而只改一件事使结果可归因。"
   }
  }
 },
 "Rehabilitation and accessibility": {
  "figures": [
   {
    "title": {
     "en": "The stages, and the load-versus-capacity gap",
     "zh": "各个阶段，以及负荷与容量的差距"
    },
    "svg": "<g><rect class=\"fillA\" x=\"14\" y=\"128\" width=\"52\" height=\"30\" rx=\"5\"/><path class=\"ln\" d=\"M14 128h52v30H14z\"/><text class=\"lblS\" x=\"20\" y=\"140\">control</text></g><g><rect class=\"fillA\" x=\"70\" y=\"110\" width=\"52\" height=\"48\" rx=\"5\"/><path class=\"ln\" d=\"M70 110h52v48H70z\"/><text class=\"lblS\" x=\"76\" y=\"124\">strength</text></g><g><rect class=\"fillB\" x=\"126\" y=\"88\" width=\"52\" height=\"70\" rx=\"5\"/><path class=\"ln\" d=\"M126 88h52v70h-52z\"/><text class=\"lblS\" x=\"132\" y=\"102\">power</text></g><g><rect class=\"fillB\" x=\"182\" y=\"62\" width=\"52\" height=\"96\" rx=\"5\"/><path class=\"ln\" d=\"M182 62h52v96h-52z\"/><text class=\"lblS\" x=\"188\" y=\"76\">sport</text><text class=\"lblS\" x=\"188\" y=\"88\">specific</text></g><g><rect class=\"fillC\" x=\"238\" y=\"30\" width=\"66\" height=\"128\" rx=\"5\"/><path class=\"ln\" d=\"M238 30h66v128h-66z\"/><text class=\"lblS\" x=\"244\" y=\"44\">compete</text></g><path class=\"th\" d=\"M66 128v-18M122 110V88M178 88V62M234 62V30\"/><g><line class=\"ln\" x1=\"14\" y1=\"112\" x2=\"304\" y2=\"112\"/><path class=\"fillC\" d=\"M20 108C90 96 150 72 300 40v72z\"/><text class=\"lblS\" x=\"20\" y=\"104\">capacity</text><text class=\"lblS\" x=\"200\" y=\"152\">skip one step and the tissue never catches up</text></g>",
    "viewBox": "0 0 320 175",
    "legend": [
     {
      "en": "the stages are dictated by biology, not by the calendar",
      "zh": "各阶段由生物学决定，而不是由日历决定"
     },
     {
      "en": "control before strength, strength before power, power before sport-specific load",
      "zh": "先控制再力量，先力量再功率，先功率再专项负荷"
     },
     {
      "en": "the gap between demand and capacity is what you are managing every session",
      "zh": "需求与容量之间的差距，就是你每堂训练课在管理的东西"
     }
    ],
    "caption": {
     "en": "Rehabilitation has one job that has nothing to do with the injury: return the athlete to the thing they love, fully. A painless athlete is not a returning athlete.",
     "zh": "康复只有一个目标，而且与损伤本身无关：把运动员完整地送回他热爱的那件事。一个不疼的运动员并不是一个回归的运动员。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Adjustments that matter, and the barrier that usually is not the body",
     "zh": "重要的调整，以及通常并不在身体上的障碍"
    },
    "cols": [
     {
      "en": "Need",
      "zh": "需要"
     },
     {
      "en": "Adjustment",
      "zh": "调整"
     },
     {
      "en": "Real barrier",
      "zh": "真正的障碍"
     }
    ],
    "rows": [
     [
      {
       "en": "Reduced bone density",
       "zh": "骨密度下降"
      },
      {
       "en": "Lower-impact loading, longer progressions, contact sport assessed individually",
       "zh": "更低冲击的负荷、更长的进阶，接触类项目需逐人评估"
      },
      {
       "en": "The assumption that the standard programme is the only legitimate one",
       "zh": "那个假设：标准方案是唯一正当的方案"
      }
     ],
     [
      {
       "en": "Still growing",
       "zh": "仍在生长"
      },
      {
       "en": "More frequent, lower-volume sessions; avoid maximal loads",
       "zh": "更高频率、更低容量的训练课；避免最大负荷"
      },
      {
       "en": "Training age being treated as a reason to ignore load",
       "zh": "把训练年龄当作无视负荷的理由"
      }
     ],
     [
      {
       "en": "Pregnancy",
       "zh": "孕期"
      },
      {
       "en": "Heart-rate rather than RPE for intensity, altered balance and centre of mass",
       "zh": "用心率而非自觉用力程度控制强度，改变平衡与重心"
      },
      {
       "en": "No one on staff having asked the question",
       "zh": "团队里没有人问过这个问题"
      }
     ],
     [
      {
       "en": "Chronic condition",
       "zh": "慢性病"
      },
      {
       "en": "Partner with medical management; adjust the load around medication timing",
       "zh": "与医疗管理配合；围绕用药时间调整负荷"
      },
      {
       "en": "Assuming the condition makes sport impossible",
       "zh": "假定这个状况使运动不可能"
      }
     ],
     [
      {
       "en": "Wheelchair or para athlete",
       "zh": "轮椅或残疾人运动员"
      },
      {
       "en": "A route to the same physiological stimulus, adapted equipment, extra time",
       "zh": "一条达到同样生理刺激的替代路径、适配的装备、更多时间"
      },
      {
       "en": "Adapted programming being seen as a concession rather than a design decision",
       "zh": "把适应性方案当作让步而不是设计决定"
      }
     ]
    ],
    "note": {
     "en": "Guidelines are population averages, and the individual spread inside any population is wider than the difference between populations. The plan has to flex at the level of the individual.",
     "zh": "指导值是人群平均，而任何人群内部的个体分布都更宽于不同人群之间的差异。所以方案必须在个体层面有弹性。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: progressing load without a calendar",
    "zh": "例题：不靠日历来推进负荷"
   },
   "given": {
    "en": "A sprinter returns after 6 weeks hamstring strain. Symmetry at 2 weeks is 78 percent, at 4 weeks 88 percent.",
    "zh": "一名短跑运动员在腘绳肌拉伤 6 周后回归。第 2 周对称性为 78%，第 4 周为 88%。"
   },
   "steps": [
    {
     "en": "Week 2: 78 percent is below the commonly used 90 percent screen, but the trend matters more than the single number.",
     "zh": "第 2 周：78% 低于常用的 90% 参考标准，但趋势比单个数字更重要。"
    },
    {
     "en": "Progress the load, not the time: add high-speed running only once the athlete can do it symptom-free.",
     "zh": "递进负荷，而不是时间：只有当运动员能无症状完成时才加入高速跑。"
    },
    {
     "en": "Week 4: 88 percent with full-speed exposure symptom-free is a better reason to progress than a calendar date.",
     "zh": "第 4 周：88% 且在完全速度下无症状，这比一个日历日期是更好的递进理由。"
    },
    {
     "en": "Add max-velocity work before adding sprint-specific volume, because speed is specific and volume is not interchangeable with it.",
     "zh": "先加最大速度训练再加短跑专项容量，因为速度是专项性的，而容量不能与它互换。"
    }
   ],
   "answer": {
    "en": "Four weeks, two data points, and the return was decided by trend and symptom response rather than by a rule about weeks. The 90 percent figure is a guide, and treating it as a gate would have delayed this athlete unnecessarily.",
    "zh": "四周、两个数据点，而回归是由趋势和症状反应决定的，而不是由关于周数的规则决定的。90% 这个数字是参考，把它当作门槛会不必要地推迟这位运动员。"
   }
  }
 },
 "Communication systems": {
  "figures": [
   {
    "title": {
     "en": "Two systems, two speeds, two jobs",
     "zh": "两套系统，两种速度，两种工作"
    },
    "svg": "<g><rect class=\"fillA\" x=\"14\" y=\"24\" width=\"70\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M14 24h70v34H14z\"/><text class=\"lblS\" x=\"22\" y=\"38\">nerve</text><text class=\"lblS\" x=\"22\" y=\"50\">ms</text><path class=\"th\" d=\"M84 41h30\"/><path class=\"ln\" d=\"M114 41l-9-4.5v9z\" fill=\"currentColor\"/><rect class=\"fillA\" x=\"114\" y=\"24\" width=\"58\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M114 24h58v34h-58z\"/><text class=\"lblS\" x=\"122\" y=\"46\">muscle</text><path class=\"th\" d=\"M172 41h30\"/><path class=\"ln\" d=\"M202 41l-9-4.5v9z\" fill=\"currentColor\"/><rect class=\"fillB\" x=\"202\" y=\"24\" width=\"104\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M202 24h104v34H202z\"/><text class=\"lblS\" x=\"210\" y=\"38\">response</text><text class=\"lblS\" x=\"210\" y=\"50\">in ~1 s</text></g><g><rect class=\"fillA\" x=\"14\" y=\"86\" width=\"70\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M14 86h70v34H14z\"/><text class=\"lblS\" x=\"22\" y=\"100\">gland</text><text class=\"lblS\" x=\"22\" y=\"112\">hormone</text><path class=\"th\" d=\"M84 103h56\" stroke-dasharray=\"5 4\"/><rect class=\"fillA\" x=\"140\" y=\"86\" width=\"58\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M140 86h58v34h-58z\"/><text class=\"lblS\" x=\"148\" y=\"108\">blood</text><path class=\"th\" d=\"M198 103h30\" stroke-dasharray=\"5 4\"/><rect class=\"fillB\" x=\"228\" y=\"86\" width=\"78\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M228 86h78v34h-78z\"/><text class=\"lblS\" x=\"236\" y=\"100\">response</text><text class=\"lblS\" x=\"236\" y=\"112\">in 30 s – min</text></g><text class=\"lblS\" x=\"14\" y=\"140\">fast and short-lived</text><text class=\"lblS\" x=\"150\" y=\"140\">slower, longer-lived, whole-body</text>",
    "viewBox": "0 0 320 150",
    "legend": [
     {
      "en": "the nervous system is fast, targeted and stops the moment the signal stops",
      "zh": "神经系统快速、有针对性，信号一停就结束"
     },
     {
      "en": "the endocrine system is slower, diffuse and outlasts the stimulus",
      "zh": "内分泌系统较慢、弥散，且在刺激之后仍持续"
     },
     {
      "en": "most sport responses are both: a reflex to start, hormones to sustain",
      "zh": "多数运动反应两者兼有：反射负责启动，激素负责维持"
     }
    ],
    "caption": {
     "en": "Both systems carry information and both change what a muscle does. The useful question is not which one matters but which one the task depends on.",
     "zh": "两套系统都传递信息，也都改变肌肉的行为。有用的问题不是\"哪一套重要\"，而是\"这项任务依赖哪一套\"。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Nervous versus endocrine, side by side",
     "zh": "神经系统与内分泌系统对比"
    },
    "cols": [
     {
      "en": "Feature",
      "zh": "特征"
     },
     {
      "en": "Nervous",
      "zh": "神经系统"
     },
     {
      "en": "Endocrine",
      "zh": "内分泌系统"
     }
    ],
    "rows": [
     [
      {
       "en": "Speed",
       "zh": "速度"
      },
      {
       "en": "Milliseconds — almost instant",
       "zh": "毫秒级——近乎瞬时"
      },
      {
       "en": "Seconds to minutes",
       "zh": "秒到分钟"
      }
     ],
     [
      {
       "en": "Route",
       "zh": "通路"
      },
      {
       "en": "A specific nerve to a specific muscle",
       "zh": "特定神经到特定肌肉"
      },
      {
       "en": "Chemical signal in the blood, carried everywhere",
       "zh": "血液中的化学信号，送到全身"
      }
     ],
     [
      {
       "en": "Duration",
       "zh": "持续时间"
      },
      {
       "en": "Ends when the impulse ends",
       "zh": "冲动结束即终止"
      },
      {
       "en": "Persists until the hormone is cleared",
       "zh": "持续到激素被清除"
      }
     ],
     [
      {
       "en": "Example in sport",
       "zh": "运动中的例子"
      },
      {
       "en": "Startle, rapid withdrawal, postural correction",
       "zh": "惊跳、快速缩回、姿势修正"
      },
      {
       "en": "Adrenaline, testosterone, growth hormone, cortisol",
       "zh": "肾上腺素、睾酮、生长激素、皮质醇"
      }
     ]
    ],
    "note": {
     "en": "The two are not rivals. A 100 m sprint uses a nerve signal to start and adrenaline to sustain, and an athlete who cannot produce the hormonal response will fade even with a perfect start.",
     "zh": "两者不是对手。100 米冲刺用神经信号启动、用肾上腺素维持；而一个无法产生这种激素反应的运动员，即使起跑完美也会在途中掉速。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: which system a sport actually depends on",
    "zh": "例题：一项运动实际依赖哪一套系统"
   },
   "given": {
    "en": "Compare a 100 m sprint, a penalty kick in football, and a marathon.",
    "zh": "比较 100 米冲刺、足球点球和马拉松。"
   },
   "steps": [
    {
     "en": "Sprint: the whole race is 10 seconds, so almost everything must be neural. Hormones cannot switch on and off that fast.",
     "zh": "冲刺：全程 10 秒，所以几乎一切都必须靠神经系统。激素无法如此快地开启与关闭。"
    },
    {
     "en": "Penalty kick: also seconds long, and the cue for it is visual and arrives via the nervous system.",
     "zh": "点球：同样只有数秒，而触发它的线索是视觉、经神经系统传来。"
    },
    {
     "en": "Marathon: hours long. Adrenaline sets the pace, and cortisol and fluid balance govern what happens after 90 minutes.",
     "zh": "马拉松：持续数小时。肾上腺素决定配速，皮质醇与水分平衡决定 90 分钟之后发生什么。"
    },
    {
     "en": "So the same athlete may be nerve-limited in one event and hormone-limited in another.",
     "zh": "所以同一位运动员在项目 A 上可能受神经限制，而在项目 B 上受激素限制。"
    }
   ],
   "answer": {
    "en": "The classification changes what a training plan should emphasise. A sprinter trains reactions and recruitment; a marathoner trains the capacity to sustain a hormonal and fluid state.",
    "zh": "这个分类改变了训练计划应当强调什么。短跑运动员训练反应与募集；马拉松运动员训练的是维持一种激素与水分状态的能力。"
   }
  }
 },
 "Neural pathways and coordination": {
  "figures": [
   {
    "title": {
     "en": "The reflex arc and where coordination sits",
     "zh": "反射弧以及协调位于何处"
    },
    "svg": "<g><circle class=\"fillB\" cx=\"30\" cy=\"40\" r=\"11\"/><path class=\"ln\" d=\"M30 29a11 11 0 1 1 0 22 11 11 0 1 1 0-22z\"/><text class=\"lblS\" x=\"16\" y=\"64\">receptor</text><path class=\"th\" d=\"M41 40h44\"/><path class=\"ln\" d=\"M85 40l-9-4.5v9z\" fill=\"currentColor\"/><rect class=\"fillA\" x=\"85\" y=\"26\" width=\"52\" height=\"28\" rx=\"6\"/><path class=\"ln\" d=\"M85 26h52v28H85z\"/><text class=\"lblS\" x=\"93\" y=\"44\">spinal cord</text><path class=\"th\" d=\"M111 54v22\"/><path class=\"ln\" d=\"M111 76l-4.5-9h9z\" fill=\"currentColor\"/><rect class=\"fillC\" x=\"85\" y=\"76\" width=\"52\" height=\"26\" rx=\"6\"/><path class=\"ln\" d=\"M85 76h52v26H85z\"/><text class=\"lblS\" x=\"93\" y=\"93\">effector</text><path class=\"th\" d=\"M137 40h40\" stroke-dasharray=\"5 4\"/><text class=\"lblS\" x=\"182\" y=\"36\">to brain</text><text class=\"lblS\" x=\"182\" y=\"50\">(feedback)</text></g><g><rect class=\"fillA\" x=\"14\" y=\"120\" width=\"86\" height=\"30\" rx=\"6\"/><path class=\"ln\" d=\"M14 120h86v30H14z\"/><text class=\"lblS\" x=\"22\" y=\"132\">motor cortex</text><text class=\"lblS\" x=\"22\" y=\"144\">voluntary</text><path class=\"th\" d=\"M100 135h32\"/><path class=\"ln\" d=\"M132 135l-9-4.5v9z\" fill=\"currentColor\"/><rect class=\"fillA\" x=\"132\" y=\"120\" width=\"80\" height=\"30\" rx=\"6\"/><path class=\"ln\" d=\"M132 120h80v30h-80z\"/><text class=\"lblS\" x=\"140\" y=\"132\">cerebellum</text><text class=\"lblS\" x=\"140\" y=\"144\">timing</text><path class=\"th\" d=\"M212 135h32\"/><path class=\"ln\" d=\"M244 135l-9-4.5v9z\" fill=\"currentColor\"/><rect class=\"fillC\" x=\"244\" y=\"120\" width=\"62\" height=\"30\" rx=\"6\"/><path class=\"ln\" d=\"M244 120h62v30h-62z\"/><text class=\"lblS\" x=\"252\" y=\"139\">muscle</text></g>",
    "viewBox": "0 0 320 165",
    "legend": [
     {
      "en": "a reflex does not need the brain — the spinal cord answers first and reports afterwards",
      "zh": "反射不需要大脑——脊髓先做出应答，之后才上报"
     },
     {
      "en": "voluntary movement starts in the motor cortex and is timed by the cerebellum",
      "zh": "随意运动起于运动皮层，由小脑负责计时"
     },
     {
      "en": "coordination is largely the cerebellum comparing intended against actual movement",
      "zh": "协调在很大程度上是小脑把\"计划的\"与\"实际的\"动作作比较"
     }
    ],
    "caption": {
     "en": "The separation matters practically: a reflex you can train is faster than one you have to think about, and a movement the cerebellum can predict is smooth while one it cannot is not.",
     "zh": "这种分工有实际意义：能被训练的反射比需要思考的反射更快，而小脑能预测的动作是流畅的、不能预测的就不是。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Reflex, voluntary and coordination pathways",
     "zh": "反射、随意运动与协调通路"
    },
    "cols": [
     {
      "en": "Control type",
      "zh": "控制类型"
     },
     {
      "en": "Where it happens",
      "zh": "发生位置"
     },
     {
      "en": "Speed",
      "zh": "速度"
     },
     {
      "en": "Sport example",
      "zh": "运动例子"
     }
    ],
    "rows": [
     [
      {
       "en": "Reflex / involuntary",
       "zh": "反射 / 不随意"
      },
      {
       "en": "Spinal cord, with the brain informed afterwards",
       "zh": "脊髓，之后大脑才获知"
      },
      {
       "en": "Under 100 ms",
       "zh": "低于 100 毫秒"
      },
      {
       "en": "Withdrawal from a hot surface, knee jerk, startle",
       "zh": "缩手、膝跳、惊跳"
      }
     ],
     [
      {
       "en": "Voluntary",
       "zh": "随意"
      },
      {
       "en": "Motor cortex via the corticospinal tract",
       "zh": "运动皮层经皮质脊髓束"
      },
      {
       "en": "Hundreds of milliseconds",
       "zh": "数百毫秒"
      },
      {
       "en": "Lifting a weight, choosing a lane, a serve",
       "zh": "举起重量、选择跑道、发球"
      }
     ],
     [
      {
       "en": "Coordination / timing",
       "zh": "协调 / 计时"
      },
      {
       "en": "Cerebellum and basal ganglia comparing plan to result",
       "zh": "小脑与基底神经节把计划与结果作比较"
      },
      {
       "en": "Continuous, anticipatory",
       "zh": "持续且具预期性"
      },
      {
       "en": "Rhythm of a swing, timing of a jump, balance while moving",
       "zh": "挥拍节奏、起跳时机、移动中的平衡"
      }
     ]
    ],
    "note": {
     "en": "Training a reflex is not the same as training a skill. Reflexes are about speed of an involuntary response; skills are about the accuracy of a planned one.",
     "zh": "训练反射与训练技术不是一回事。反射关乎一个不随意反应的速度；技术关乎一个有计划反应的准确度。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: why a goalkeeper is beaten by a low driven shot",
    "zh": "例题：为什么守门员会被低平抽射打穿"
   },
   "given": {
    "en": "A shot arrives 25 m away at 25 m/s. Brain-to-muscle signal time is 200 ms for a deliberate movement.",
    "zh": "射门距离 25 米、球速 25 米/秒。从大脑到肌肉的信号时间为 200 毫秒（一个刻意动作）。"
   },
   "steps": [
    {
     "en": "Time for the ball to travel 25 m: t = 25 / 25 = 1.0 s.",
     "zh": "球飞行 25 米所需时间：t = 25 / 25 = 1.0 秒。"
    },
    {
     "en": "Time for a deliberate movement: 200 ms = 0.2 s, so 0.8 s of flight remain once the decision is made.",
     "zh": "一个刻意动作所需时间：200 毫秒 = 0.2 秒，因此决定做出后还剩 0.8 秒飞行时间。"
    },
    {
     "en": "A true reflex is 60 to 80 ms = 0.07 s, leaving 0.93 s. The difference in available time is about 0.13 s.",
     "zh": "一个真正的反射是 60 到 80 毫秒 = 0.07 秒，剩下 0.93 秒。可用时间的差别约为 0.13 秒。"
    },
    {
     "en": "So the goalkeeper who waits to see the direction has already spent the margin the reflex needed.",
     "zh": "因此那位等着看方向的守门员，已经把反射所必需的那点时间余量花掉了。"
    }
   ],
   "answer": {
    "en": "About 0.13 s, which is the entire margin. This is why anticipation, reaction training and reading the kicker matter more for a goalkeeper than additional throwing power.",
    "zh": "大约 0.13 秒，而这就是全部余量。这就是为什么预判、反应训练和读出踢球者的动作，对守门员来说比增加踢球力量更重要。"
   }
  }
 },
 "Systems working together": {
  "figures": [
   {
    "title": {
     "en": "One jump, four systems, one time course",
     "zh": "一次跳跃，四个系统，一条时间轴"
    },
    "svg": "<line class=\"th\" x1=\"20\" y1=\"132\" x2=\"304\" y2=\"132\"/><path class=\"ln\" d=\"M20 132l-0 0\"/><g><text class=\"lblS\" x=\"20\" y=\"152\">nerve</text><rect class=\"fillC\" x=\"20\" y=\"46\" width=\"34\" height=\"80\" rx=\"4\"/></g><g><text class=\"lblS\" x=\"96\" y=\"152\">heart</text><rect class=\"fillC\" x=\"86\" y=\"76\" width=\"34\" height=\"50\" rx=\"4\"/></g><g><text class=\"lblS\" x=\"170\" y=\"152\">lungs</text><rect class=\"fillC\" x=\"164\" y=\"86\" width=\"34\" height=\"40\" rx=\"4\"/></g><g><text class=\"lblS\" x=\"240\" y=\"152\">hormones</text><rect class=\"fillC\" x=\"234\" y=\"98\" width=\"34\" height=\"28\" rx=\"4\"/></g><text class=\"lblS\" x=\"20\" y=\"36\">onset</text><path class=\"th\" d=\"M54 32h250\"/><path class=\"ln\" d=\"M304 32l-9-4.5v9z\" fill=\"currentColor\"/><text class=\"lblS\" x=\"250\" y=\"26\">seconds →</text>",
    "viewBox": "0 0 320 165",
    "legend": [
     {
      "en": "the nervous system responds first and hardest — it is the trigger, not the sustainer",
      "zh": "神经系统最先、也最强烈地响应——它是触发器，而不是维持器"
     },
     {
      "en": "cardiovascular and respiratory follow within a few breaths",
      "zh": "心肺系统在几次呼吸之内跟上"
     },
     {
      "en": "hormonal response is the slowest and the longest lasting, and it is what an athlete can train",
      "zh": "激素反应最慢也最持久，而它正是运动员可以训练的部分"
     }
    ],
    "caption": {
     "en": "Recovery is not a single event. Each system runs on its own clock, which is why an athlete can still feel exhausted after the heart rate has settled.",
     "zh": "恢复不是一个单独的事件。每个系统各走自己的时钟，这正是为什么心率已经平稳之后运动员仍可能感到精疲力尽。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "What each system contributes, and how long it lasts",
     "zh": "每个系统贡献什么、持续多久"
    },
    "cols": [
     {
      "en": "System",
      "zh": "系统"
     },
     {
      "en": "Onset",
      "zh": "起效时间"
     },
     {
      "en": "Sustains for",
      "zh": "维持时间"
     },
     {
      "en": "Trainable?",
      "zh": "可训练？"
     }
    ],
    "rows": [
     [
      {
       "en": "Nervous",
       "zh": "神经系统"
      },
      {
       "en": "Milliseconds",
       "zh": "毫秒"
      },
      {
       "en": "The action itself",
       "zh": "动作本身"
      },
      {
       "en": "Partly — reaction and recruitment",
       "zh": "部分——反应与募集"
      }
     ],
     [
      {
       "en": "Cardiovascular",
       "zh": "心肺系统"
      },
      {
       "en": "1–3 breaths",
       "zh": "1 到 3 次呼吸"
      },
      {
       "en": "Minutes to hours",
       "zh": "分钟到小时"
      },
      {
       "en": "Yes, strongly",
       "zh": "是，且很显著"
      }
     ],
     [
      {
       "en": "Respiratory",
       "zh": "呼吸系统"
      },
      {
       "en": "1–2 breaths",
       "zh": "1 到 2 次呼吸"
      },
      {
       "en": "Minutes to hours",
       "zh": "分钟到小时"
      },
      {
       "en": "Yes, strongly",
       "zh": "是，且很显著"
      }
     ],
     [
      {
       "en": "Endocrine",
       "zh": "内分泌系统"
      },
      {
       "en": "30 s and upward",
       "zh": "30 秒及以上"
      },
      {
       "en": "Minutes to days",
       "zh": "分钟到天"
      },
      {
       "en": "Yes, over weeks",
       "zh": "是，以数周计"
      }
     ]
    ],
    "note": {
     "en": "The last column is the practical one. A coach can change all four, but on completely different timescales, and a plan that expects a change in one inside a week is usually misconceived.",
     "zh": "最后一列才是实用的那一列。教练能改变这四者，但时间尺度完全不同；而一个期待其中一项在一周内改变的方案，通常是概念错了。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: reading a recovery curve",
    "zh": "例题：读懂一条恢复曲线"
   },
   "given": {
    "en": "An athlete’s heart rate falls from 190 to 120 in 2 min, to 95 in 10 min, to 72 at 30 min, and 68 at 2 h.",
    "zh": "一名运动员的心率从 190 降到 120 用了 2 分钟，10 分钟降到 95，30 分钟降到 72，2 小时降到 68。"
   },
   "steps": [
    {
     "en": "0–2 min: fast fall. Neural drive stops and the fast pathways recover first.",
     "zh": "0 到 2 分钟：快速下降。神经驱动停止，快速通路先恢复。"
    },
    {
     "en": "2–10 min: slower fall. The cardiovascular system is still clearing lactate and repaying oxygen deficit.",
     "zh": "2 到 10 分钟：下降变慢。心血管系统仍在清除乳酸并偿还氧亏。"
    },
    {
     "en": "10–30 min: near resting already, so the athlete feels \"recovered\" while the hormonal picture has not finished.",
     "zh": "10 到 30 分钟：已接近静息，因此运动员感觉\"恢复了\"，而激素层面的变化尚未结束。"
    },
    {
     "en": "Out to 2 h: glycogen resynthesis, rehydration and protein synthesis continue.",
     "zh": "直到 2 小时：糖原再合成、再水合与蛋白质合成仍在继续。"
    }
   ],
   "answer": {
    "en": "Feeling recovered at 30 minutes and being recovered at 30 minutes are different claims. A second bout that is genuinely quality work needs the later number, not the earlier one.",
    "zh": "30 分钟时\"感觉恢复\"与 30 分钟时\"已经恢复\"是两个不同的说法。一次真正高质量的第二训练需要后面那个数字，而不是前面那个。"
   }
  }
 },
 "Feedback and integrated examples": {
  "figures": [
   {
    "title": {
     "en": "Negative feedback, drawn once and used everywhere",
     "zh": "负反馈：一张图，处处可用"
    },
    "svg": "<circle class=\"fillA\" cx=\"88\" cy=\"66\" r=\"30\"/><path class=\"ln\" d=\"M88 36a30 30 0 1 1 0 60 30 30 0 1 1 0-60z\"/><text class=\"lblS\" x=\"66\" y=\"62\">variable</text><text class=\"lblS\" x=\"70\" y=\"76\">being</text><text class=\"lblS\" x=\"66\" y=\"90\">regulated</text><rect class=\"fillB\" x=\"176\" y=\"26\" width=\"98\" height=\"26\" rx=\"6\"/><path class=\"ln\" d=\"M176 26h98v26h-98z\"/><text class=\"lblS\" x=\"184\" y=\"43\">receptor</text><rect class=\"fillB\" x=\"176\" y=\"106\" width=\"98\" height=\"26\" rx=\"6\"/><path class=\"ln\" d=\"M176 106h98v26h-98z\"/><text class=\"lblS\" x=\"184\" y=\"123\">effector</text><path class=\"th\" d=\"M118 50l42-16\"/><path class=\"ln\" d=\"M160 34l-9 4 7 6z\" fill=\"currentColor\"/><path class=\"th\" d=\"M118 84l42 16\"/><path class=\"ln\" d=\"M160 100l-9-4 7-6z\" fill=\"currentColor\"/><path class=\"th\" d=\"M225 52v54\"/><path class=\"ln\" d=\"M225 106l-4.5-9h9z\" fill=\"currentColor\"/><text class=\"lblS\" x=\"232\" y=\"82\">corrects</text><text class=\"lblS\" x=\"14\" y=\"152\">same shape as: thermoregulation · blood glucose · blood pressure · water balance · pacing in a race</text>",
    "viewBox": "0 0 320 165",
    "legend": [
     {
      "en": "a variable is sensed, a receptor reports, an effector corrects, and the correction reduces the error",
      "zh": "变量被感知，受体报告，效应器纠正，而纠正减小了误差"
     },
     {
      "en": "the loop is always the same shape; only the variable and the timescale change",
      "zh": "这个回路永远是同一个形状；变化的只是变量和时间尺度"
     },
     {
      "en": "that is why one diagram can carry five different physiological topics",
      "zh": "这就是为什么一张图能承载五个不同的生理学主题"
     }
    ],
    "caption": {
     "en": "Negative feedback is the single most useful diagram in physiology, because it turns a list of facts into one mechanism. Positive feedback is the exception and it is used for childbirth and clotting.",
     "zh": "负反馈是生理学中最有用的一张图，因为它把一份事实清单变成了一个机制。正反馈是例外，它用于分娩和凝血。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Five applications of one loop",
     "zh": "一个回路的五种应用"
    },
    "cols": [
     {
      "en": "Variable",
      "zh": "变量"
     },
     {
      "en": "Receptor / sensor",
      "zh": "受体 / 传感器"
     },
     {
      "en": "Effector",
      "zh": "效应器"
     },
     {
      "en": "Timescale",
      "zh": "时间尺度"
     }
    ],
    "rows": [
     [
      {
       "en": "Core temperature",
       "zh": "核心体温"
      },
      {
       "en": "Hypothalamic thermosensors",
       "zh": "下丘脑温度感受器"
      },
      {
       "en": "Sweat glands, skin blood vessels, shivering",
       "zh": "汗腺、皮肤血管、寒战"
      },
      {
       "en": "Minutes",
       "zh": "分钟"
      }
     ],
     [
      {
       "en": "Blood glucose",
       "zh": "血糖"
      },
      {
       "en": "Pancreatic beta cells",
       "zh": "胰岛 B 细胞"
      },
      {
       "en": "Liver and muscle glycogen, insulin and glucagon",
       "zh": "肝与肌肉糖原、胰岛素与胰高血糖素"
      },
      {
       "en": "Minutes to hours",
       "zh": "分钟到小时"
      }
     ],
     [
      {
       "en": "Blood pressure",
       "zh": "血压"
      },
      {
       "en": "Baroreceptors in the carotid and aortic sinuses",
       "zh": "颈动脉窦与主动脉窦压力感受器"
      },
      {
       "en": "Heart rate, stroke volume, peripheral resistance",
       "zh": "心率、每搏量、外周阻力"
      },
      {
       "en": "Seconds to minutes",
       "zh": "秒到分钟"
      }
     ],
     [
      {
       "en": "Water balance",
       "zh": "水分平衡"
      },
      {
       "en": "Osmoreceptors and thirst centre",
       "zh": "渗透压感受器与口渴中枢"
      },
      {
       "en": "ADH release, renal water reabsorption",
       "zh": "抗利尿激素释放、肾脏重吸收水"
      },
      {
       "en": "Hours to a day",
       "zh": "小时到一天"
      }
     ],
     [
      {
       "en": "Race pacing",
       "zh": "比赛配速"
      },
      {
       "en": "Perceived exertion and feedback from the muscles",
       "zh": "自觉用力程度与来自肌肉的反馈"
      },
      {
       "en": "Change of pace, breathing, fuelling decisions",
       "zh": "配速改变、呼吸、补糖决策"
      },
      {
       "en": "Seconds to minutes",
       "zh": "秒到分钟"
      }
     ]
    ],
    "note": {
     "en": "Notice that a 5 km run and a 400 m sprint are governed by the same loop at different settings. What differs is where the athlete sets the variable.",
     "zh": "注意 5 公里跑和 400 米冲刺由同一个回路在不同设定下管理。不同的只是运动员把变量设在哪里。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: reading a heat drill the right way round",
    "zh": "例题：如何正确解读一次高温训练"
   },
   "given": {
    "en": "A runner’s core temperature rises 0.8 °C during a hard session in 28 °C heat.",
    "zh": "一名跑者在 28 摄氏度的高温中进行高强度训练，核心体温上升 0.8 摄氏度。"
   },
   "steps": [
    {
     "en": "The variable is core temperature, and 0.8 °C is a normal response to hard exercise, not a fault.",
     "zh": "变量是核心体温，而 0.8 摄氏度是高强度运动的正常反应，而不是故障。"
    },
    {
     "en": "The effector is sweating and skin blood flow. Both work — unless the environment stops them.",
     "zh": "效应器是出汗与皮肤血流。两者都在工作——除非环境让它们失效。"
    },
    {
     "en": "In 28 °C with humidity, evaporation is impaired, so the sweat produced cannot cool the body.",
     "zh": "在 28 摄氏度且潮湿的环境中，蒸发受阻，因此产出的汗无法给身体降温。"
    },
    {
     "en": "So sweat rate rises while cooling does not — the loop is signalling, the effector is saturated, and the only variable left is the workload.",
     "zh": "所以出汗率上升而降温并未发生——回路在发信号，效应器已经饱和，剩下唯一可调的是负荷。"
    }
   ],
   "answer": {
    "en": "The loop explains why \"drink more water\" alone fails here. The deficit is not fluid intake, it is evaporative capacity, and no amount of fluid compensates for sweat that cannot evaporate.",
    "zh": "这个回路解释了为什么单靠\"多喝水\"在这里没用。缺口不是液体摄入量，而是蒸发能力，而任何液体量都无法补偿无法蒸发的汗。"
   }
  }
 },
 "Voluntary movement and reflexes": {
  "figures": [
   {
    "title": {
     "en": "The division of labour in movement",
     "zh": "随意运动中的分工"
    },
    "svg": "<g><rect class=\"fillA\" x=\"14\" y=\"20\" width=\"136\" height=\"56\" rx=\"7\"/><path class=\"ln\" d=\"M14 20h136v56H14z\"/><text class=\"lblS\" x=\"22\" y=\"36\">corticospinal</text><text class=\"lblS\" x=\"22\" y=\"50\">(pyramidal)</text><text class=\"lblS\" x=\"22\" y=\"64\">precise, voluntary</text><path class=\"th\" d=\"M150 48h34\"/><path class=\"ln\" d=\"M184 48l-9-4.5v9z\" fill=\"currentColor\"/><rect class=\"fillC\" x=\"184\" y=\"26\" width=\"122\" height=\"44\" rx=\"7\"/><path class=\"ln\" d=\"M184 26h122v44H184z\"/><text class=\"lblS\" x=\"192\" y=\"44\">fine control</text><text class=\"lblS\" x=\"192\" y=\"58\">of distal muscles</text></g><g><rect class=\"fillA\" x=\"14\" y=\"92\" width=\"136\" height=\"56\" rx=\"7\"/><path class=\"ln\" d=\"M14 92h136v56H14z\"/><text class=\"lblS\" x=\"22\" y=\"108\">extrapyramidal</text><text class=\"lblS\" x=\"22\" y=\"122\">+ cerebellum</text><text class=\"lblS\" x=\"22\" y=\"136\">posture, tone, timing</text><path class=\"th\" d=\"M150 120h34\"/><path class=\"ln\" d=\"M184 120l-9-4.5v9z\" fill=\"currentColor\"/><rect class=\"fillC\" x=\"184\" y=\"98\" width=\"122\" height=\"44\" rx=\"7\"/><path class=\"ln\" d=\"M184 98h122v44H184z\"/><text class=\"lblS\" x=\"192\" y=\"116\">proximal muscles,</text><text class=\"lblS\" x=\"192\" y=\"130\">balance, coordination</text></g><text class=\"lblS\" x=\"14\" y=\"170\">damage shows as either weakness of precision or loss of postural control</text>",
    "viewBox": "0 0 320 180",
    "legend": [
     {
      "en": "the corticospinal system handles the precise, learned, deliberate part of a skill",
      "zh": "皮质脊髓系统负责技术中精准、习得、刻意的那一部分"
     },
     {
      "en": "the extrapyramidal system and cerebellum handle posture, tone and timing",
      "zh": "锥体外系与小脑负责姿势、肌张力和计时"
     },
     {
      "en": "an injury to either produces a different and recognisable pattern",
      "zh": "任何一者受损都会产生不同且可识别的表现"
     }
    ],
    "caption": {
     "en": "Reflexes sit alongside both and are the fastest route of all. Practically, a rehab plan that retrains only voluntary control and ignores posture will fail at the movement that matters.",
     "zh": "反射与两者并行存在，而且是最快的通路。实际上，只重训随意控制而忽略姿势的康复方案，会在真正重要的那个动作上失败。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Voluntary, reflex and postural control compared",
     "zh": "随意控制、反射与姿势控制的比较"
    },
    "cols": [
     {
      "en": "Control",
      "zh": "控制"
     },
     {
      "en": "Mediated by",
      "zh": "中介结构"
     },
     {
      "en": "Latency",
      "zh": "潜伏期"
     },
     {
      "en": "Fatigues?",
      "zh": "会疲劳？"
     }
    ],
    "rows": [
     [
      {
       "en": "Voluntary / skilled",
       "zh": "随意 / 技术性"
      },
      {
       "en": "Motor cortex, corticospinal tract",
       "zh": "运动皮层、皮质脊髓束"
      },
      {
       "en": "~200 ms",
       "zh": "约 200 毫秒"
      },
      {
       "en": "Yes, quickly",
       "zh": "是，很快"
      }
     ],
     [
      {
       "en": "Reflex",
       "zh": "反射"
      },
      {
       "en": "Spinal cord, muscle spindle and Golgi tendon organ",
       "zh": "脊髓、肌梭与腱器官"
      },
      {
       "en": "~60–80 ms",
       "zh": "约 60 到 80 毫秒"
      },
      {
       "en": "No",
       "zh": "不"
      }
     ],
     [
      {
       "en": "Postural / anticipatory",
       "zh": "姿势 / 预期性"
      },
      {
       "en": "Cerebellum, brainstem, basal ganglia",
       "zh": "小脑、脑干、基底神经节"
      },
      {
       "en": "Continuous",
       "zh": "持续"
      },
      {
       "en": "No",
       "zh": "不"
      }
     ],
     [
      {
       "en": "Motor unit recruitment",
       "zh": "运动单位募集"
      },
      {
       "en": "Alpha motor neurons",
       "zh": "α 运动神经元"
      },
      {
       "en": "Gradual",
       "zh": "渐进"
      },
      {
       "en": "Yes",
       "zh": "是"
      }
     ]
    ],
    "note": {
     "en": "Reflexes and postural control do not fatigue, which is why they are still available at the end of a maximal effort when voluntary control is not. This is the physiological basis of the saying that fatigued athletes fall over.",
     "zh": "反射与姿势控制不会疲劳，因此在力竭努力的最后仍然可用，而随意控制已不可用。这正是\"疲劳的运动员会摔倒\"这句话的生理学基础。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: the drop shot that goes short under fatigue",
    "zh": "例题：疲劳时变短的制球"
   },
   "given": {
    "en": "A badminton drop shot lands short once the athlete is tired. Voluntary command and proprioception are intact.",
    "zh": "一名羽毛球运动员在疲劳后制球落点变短。随意指令与本体感觉完好。"
   },
   "steps": [
    {
     "en": "Voluntary arm position is still commanded correctly — so the cortex is working.",
     "zh": "随意的手臂位置仍被正确指令——所以皮层在正常工作。"
    },
    {
     "en": "Reflexes and proprioception are intact — so the feedback side is working.",
     "zh": "反射与本体感觉完好——所以反馈侧也在正常工作。"
    },
    {
     "en": "What fails is postural tone in the trunk and legs, which normally holds the stance.",
     "zh": "失败的是躯干与腿部的姿势张力，它通常负责维持这个站姿。"
    },
    {
     "en": "Without that tone the athlete sways forward, the contact point moves, and the shot goes short — a postural failure presenting as a technique failure.",
     "zh": "失去这种张力后运动员会前倾，触球点偏移，制球因此变短——一个表现为技术问题的姿势问题。"
    }
   ],
   "answer": {
    "en": "Strengthening the arm would not have fixed it. The deficit was postural, and it only became visible once fatigue removed the compensation. This is a common finding in practice and a common misdiagnosis.",
    "zh": "加强手臂力量并不能解决它。缺陷在姿势层面，而它只有在疲劳移走了代偿之后才显现出来。这在实践中很常见，也经常被误诊。"
   }
  }
 },
 "Hormonal influences and sport applications": {
  "figures": [
   {
    "title": {
     "en": "The adrenal response, minute by minute",
     "zh": "肾上腺素反应：逐分钟的变化"
    },
    "svg": "<line class=\"th\" x1=\"30\" y1=\"120\" x2=\"304\" y2=\"120\"/><path class=\"ln\" d=\"M30 120C60 40 96 34 130 52c40 22 60 46 90 62 26 14 50 6 84 4\"/><line class=\"dash\" d=\"M30 120h274\"/><line class=\"dash\" d=\"M64 120V46\"/><text class=\"lblS\" x=\"40\" y=\"40\">adrenaline</text><text class=\"lblS\" x=\"46\" y=\"136\">0</text><line class=\"dash\" d=\"M130 120V52\"/><text class=\"lblS\" x=\"106\" y=\"66\">1 min</text><line class=\"dash\" d=\"M220 120V114\"/><text class=\"lblS\" x=\"196\" y=\"134\">20 min</text><text class=\"lblS\" x=\"30\" y=\"158\">onset</text><text class=\"lblS\" x=\"140\" y=\"158\">peak</text><text class=\"lblS\" x=\"238\" y=\"158\">fade</text><text class=\"lblS\" x=\"176\" y=\"96\">the race is won or lost here</text>",
    "viewBox": "0 0 320 170",
    "legend": [
     {
      "en": "adrenaline rises within 30 seconds, peaks early, and returns to baseline well before the event ends",
      "zh": "肾上腺素在 30 秒内上升、早期达峰，并在比赛结束前很久就回到基线"
     },
     {
      "en": "the effect that persists is the one that has had time to build — which is why a 400 m and a marathon are won differently",
      "zh": "持续下来的效应是那些有时间建立起来的——这正是 400 米和马拉松取胜方式不同的原因"
     },
     {
      "en": "cortisol behaves in the opposite pattern, rising under sustained stress",
      "zh": "皮质醇的模式相反，它在持续压力下升高"
     }
    ],
    "caption": {
     "en": "Hormones are not switches. They are concentration curves, and a sport is won or lost on where the athlete sits on the curve at the decisive moment.",
     "zh": "激素不是开关，而是浓度曲线；一项运动的胜负，取决于运动员在关键时刻处在这条曲线的哪个位置。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The main sport hormones",
     "zh": "主要的运动激素"
    },
    "cols": [
     {
      "en": "Hormone",
      "zh": "激素"
     },
     {
      "en": "Main effect in sport",
      "zh": "在运动中的主要作用"
     },
     {
      "en": "Where it comes from",
      "zh": "来源"
     },
     {
      "en": "Training response",
      "zh": "训练反应"
     }
    ],
    "rows": [
     [
      {
       "en": "Adrenaline",
       "zh": "肾上腺素"
      },
      {
       "en": "Raises heart rate, force and rate of firing",
       "zh": "提高心率、力量和放电频率"
      },
      {
       "en": "Adrenal medulla",
       "zh": "肾上腺髓质"
      },
      {
       "en": "Trains with sprint and interval work",
       "zh": "通过冲刺和间歇训练提高"
      }
     ],
     [
      {
       "en": "Testosterone",
       "zh": "睾酮"
      },
      {
       "en": "Protein synthesis, aggression, recovery",
       "zh": "蛋白质合成、攻击性、恢复"
      },
      {
       "en": "Testes, ovaries, adrenal cortex",
       "zh": "睾丸、卵巢、肾上腺皮质"
      },
      {
       "en": "Responds to heavy loading and adequate sleep",
       "zh": "对大负荷和充足睡眠有反应"
      }
     ],
     [
      {
       "en": "Growth hormone",
       "zh": "生长激素"
      },
      {
       "en": "Growth, tissue repair, fat use",
       "zh": "生长、组织修复、脂肪利用"
      },
      {
       "en": "Anterior pituitary",
       "zh": "垂体前叶"
      },
      {
       "en": "Rises in deep sleep",
       "zh": "在深度睡眠中升高"
      }
     ],
     [
      {
       "en": "Cortisol",
       "zh": "皮质醇"
      },
      {
       "en": "Fuel availability, but catabolic when chronic",
       "zh": "燃料可用性，但慢性升高时为分解代谢"
      },
      {
       "en": "Adrenal cortex",
       "zh": "肾上腺皮质"
      },
      {
       "en": "Falls with recovery, rises with under-recovery",
       "zh": "随恢复下降、随恢复不足上升"
      }
     ]
    ],
    "note": {
     "en": "The same hormone can be helpful at one dose and harmful at another. Cortisol is the clearest case: it makes fuel available in the short term and breaks down tissue in the long term.",
     "zh": "同一种激素在某个剂量下有益、在另一个剂量下有害。皮质醇是最清楚的例子：短期使燃料可用，长期则分解组织。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: why the second half of a race is decided",
    "zh": "例题：为什么比赛的下半场才是决定性的"
   },
   "given": {
    "en": "Adrenaline peaks at 1 minute and returns to baseline by 20 minutes. A race lasts 90 minutes.",
    "zh": "肾上腺素在 1 分钟达峰，20 分钟回到基线。一场比赛持续 90 分钟。"
   },
   "steps": [
    {
     "en": "The first 20 minutes are adrenaline-driven, and everyone in the field feels it.",
     "zh": "前 20 分钟由肾上腺素驱动，场上每个人都感受得到。"
    },
    {
     "en": "After that the only thing distinguishing runners is what they built before the gun.",
     "zh": "此后，区分跑者的唯一因素就是他们在发枪前建立起来的东西。"
    },
    {
     "en": "A pacing plan that spends adrenaline in the first kilometre and then has to fight fatigue is racing the wrong curve.",
     "zh": "一份在前一公里就把肾上腺素花光、之后不得不与疲劳搏斗的配速计划，是在与错误的曲线赛跑。"
    },
    {
     "en": "Consistent with the deep section: pace is a decision made about the last 70 minutes, not the first 20.",
     "zh": "与后面的深入内容一致：配速是关于最后 70 分钟做出的决定，而不是前 20 分钟。"
    }
   ],
   "answer": {
    "en": "The hormone is a shared resource across the field and it runs out for everyone at roughly the same time. What is not shared is the aerobic capacity underneath it.",
    "zh": "这种激素是全场上共享的资源，而且它大致在同一时刻对所有人耗尽。并不共享的是它底下的有氧能力。"
   }
  }
 },
 "Functions, intake and loss": {
  "figures": [
   {
    "title": {
     "en": "Water balance: what goes in and what comes out",
     "zh": "水分平衡：摄入与流失"
    },
    "svg": "<g><rect class=\"fillB\" x=\"14\" y=\"26\" width=\"128\" height=\"60\" rx=\"7\"/><path class=\"ln\" d=\"M14 26h128v60H14z\"/><text class=\"lblS\" x=\"22\" y=\"44\">GAIN</text><text class=\"lblS\" x=\"22\" y=\"60\">drink ~2.5 L/day</text><text class=\"lblS\" x=\"22\" y=\"74\">food 20–30%</text></g><g><rect class=\"fillA\" x=\"178\" y=\"26\" width=\"128\" height=\"60\" rx=\"7\"/><path class=\"ln\" d=\"M178 26h128v60H178z\"/><text class=\"lblS\" x=\"186\" y=\"44\">LOSS</text><text class=\"lblS\" x=\"186\" y=\"60\">urine ~1.4 L/day</text><text class=\"lblS\" x=\"186\" y=\"74\">sweat 0.5–1.5 L</text></g><line class=\"dash\" x1=\"20\" y1=\"104\" x2=\"300\" y2=\"104\"/><text class=\"lblS\" x=\"20\" y=\"122\">lungs 0.3 L  ·  skin 0.4 L  ·  gut 0.2 L  ·  sweat adds to skin loss</text><text class=\"lblS\" x=\"20\" y=\"142\">sweat is the only loss an athlete can raise deliberately</text><text class=\"lblS\" x=\"20\" y=\"160\">everything else is fixed by the environment and the diet</text>",
    "viewBox": "0 0 320 172",
    "legend": [
     {
      "en": "most of the loss is obligatory — breathing, skin and gut losses continue whatever you do",
      "zh": "大部分流失是必需的——呼吸、皮肤和肠道流失无论你做什么都在继续"
     },
     {
      "en": "sweat is the only term an athlete can increase on purpose",
      "zh": "汗是运动员唯一能有意增加的项"
     },
     {
      "en": "which is why heat illness risk scales with sweat rate and environment, not with thirst",
      "zh": "因此中暑风险随出汗率与环境变化，而不随口渴程度变化"
     }
    ],
    "caption": {
     "en": "Water is a balance, not a target. Drinking more than you lose leaves you hyponatraemic, which is more dangerous than the dehydration it prevents.",
     "zh": "水分是平衡而不是目标。喝得比流失更多会导致低钠血症，而这比它所预防的脱水更危险。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Daily water balance in a temperate environment",
     "zh": "温带环境下的每日水分平衡"
    },
    "cols": [
     {
      "en": "Route",
      "zh": "途径"
     },
     {
      "en": "Typical volume",
      "zh": "典型量"
     },
     {
      "en": "Regulated by",
      "zh": "受谁调节"
     },
     {
      "en": "Can an athlete change it?",
      "zh": "运动员能改变吗"
     }
    ],
    "rows": [
     [
      {
       "en": "Drinking",
       "zh": "饮水"
      },
      {
       "en": "1.5–2.5 L",
       "zh": "1.5 到 2.5 升"
      },
      {
       "en": "Thirst",
       "zh": "口渴"
      },
      {
       "en": "Yes, deliberately",
       "zh": "可以，有意为之"
      }
     ],
     [
      {
       "en": "Food",
       "zh": "食物"
      },
      {
       "en": "0.5–1.0 L of water content",
       "zh": "食物中 0.5 到 1.0 升水分"
      },
      {
       "en": "Habit and diet",
       "zh": "习惯与饮食"
      },
      {
       "en": "Indirectly",
       "zh": "间接"
      }
     ],
     [
      {
       "en": "Urine",
       "zh": "尿液"
      },
      {
       "en": "1.0–2.0 L",
       "zh": "1.0 到 2.0 升"
      },
      {
       "en": "ADH and aldosterone",
       "zh": "抗利尿激素与醛固酮"
      },
      {
       "en": "No",
       "zh": "不能"
      }
     ],
     [
      {
       "en": "Skin and lungs",
       "zh": "皮肤与肺"
      },
      {
       "en": "0.5–1.0 L",
       "zh": "0.5 到 1.0 升"
      },
      {
       "en": "Environment only",
       "zh": "仅由环境决定"
      },
      {
       "en": "No",
       "zh": "不能"
      }
     ],
     [
      {
       "en": "Sweat",
       "zh": "汗"
      },
      {
       "en": "0.5–3.0 L, much more in heat",
       "zh": "0.5 到 3.0 升，高温下更多"
      },
      {
       "en": "Thermoregulation",
       "zh": "体温调节"
      },
      {
       "en": "Yes, deliberately",
       "zh": "可以，有意为之"
      }
     ]
    ],
    "note": {
     "en": "A marathon runner can lose 1 to 2 kg of body mass in a race. That is a measurable number, and it is far more informative than asking whether someone feels thirsty.",
     "zh": "一名马拉松跑者在一场比赛中可以失去 1 到 2 公斤体重。那是一个可测量的数字，而且比问某人口渴与否更有信息量。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: the sweat-rate calculation that should be in every plan",
    "zh": "例题：每个计划里都该有的出汗率计算"
   },
   "given": {
    "en": "A 70 kg runner drinks 0.6 L during a 1 h run and finishes 1.4 kg lighter.",
    "zh": "一名 70 公斤的跑者在 1 小时跑步中喝了 0.6 升，结束时体重轻了 1.4 公斤。"
   },
   "steps": [
    {
     "en": "Body mass lost: 1.4 kg, which is 1.4 L of fluid, before allowing for fuel burned.",
     "zh": "体重减少 1.4 公斤，即 1.4 升液体，尚未计入消耗的燃料。"
    },
    {
     "en": "Fluid replaced: 0.6 L, so the deficit is 1.4 - 0.6 = 0.8 L.",
     "zh": "补入液体 0.6 升，因此缺口是 1.4 - 0.6 = 0.8 升。"
    },
    {
     "en": "Sweat rate: 1.4 L over 60 minutes = about 1.4 L per hour.",
     "zh": "出汗率：1.4 升 / 60 分钟 ≈ 每小时 1.4 升。"
    },
    {
     "en": "Replacement target for the next long run: 0.6 to 0.8 L per hour, taken early and often.",
     "zh": "下一次长距离跑的补液目标：每小时 0.6 到 0.8 升，早喝、频喝。"
    },
    {
     "en": "Gains: 1.4 - 0.6 = 0.8 L, so gastric emptying needs practice, not more fluid.",
     "zh": "可吸收量：1.4 - 0.6 = 0.8 升，因此需要训练的是胃排空，而不是更多的液体。"
    }
   ],
   "answer": {
    "en": "1.4 L per hour is a high but survivable sweat rate, and it tells the athlete to practise drinking rather than to drink more. Most runners in this situation under-drink, and a minority over-drink into hyponatraemia.",
    "zh": "每小时 1.4 升是一个偏高但可以承受的出汗率，它告诉这位运动员需要练习的是\"喝\"，而不是\"多喝\"。多数这类跑者喝水不足，少数则喝到低钠血症。"
   }
  }
 },
 "Imbalance and hydration monitoring": {
  "figures": [
   {
    "title": {
     "en": "Monitoring body mass across a session",
     "zh": "一次训练中监测体重变化"
    },
    "svg": "<line class=\"th\" x1=\"30\" y1=\"120\" x2=\"300\" y2=\"120\"/><path class=\"ln\" d=\"M30 76h270\"/><line class=\"dash\" d=\"M30 76v50\"/><line class=\"dash\" d=\"M300 76v50\"/><path class=\"fillA\" d=\"M30 76h270v44H30z\"/><text class=\"lbl\" x=\"150\" y=\"106\">~1.4 kg lost</text><text class=\"lbl\" x=\"150\" y=\"118\">= 1.4 L</text><line class=\"dash\" d=\"M30 140h270\"/><text class=\"lblS\" x=\"30\" y=\"60\">start</text><text class=\"lblS\" x=\"272\" y=\"60\">finish</text><text class=\"lblS\" x=\"30\" y=\"156\">2% body mass = the usual flag</text><text class=\"lblS\" x=\"196\" y=\"156\">1.4% here — under it, but trending</text>",
    "viewBox": "0 0 320 170",
    "legend": [
     {
      "en": "change in body mass, in the same clothing and on the same scales, is the most reliable field measure available",
      "zh": "体重的变化，在同样衣着、同一台秤上称量，是最可靠的现场指标"
     },
     {
      "en": "2 percent of body mass is the commonly used threshold for flagging a problem",
      "zh": "体重的 2% 是用于标记问题的常用阈值"
     },
     {
      "en": "a deficit below 2 percent still matters when it is the third session in a row",
      "zh": "即使低于 2%，当这是连续第三堂训练课补液不足时，仍然重要"
     }
    ],
    "caption": {
     "en": "Thirst is a late and unreliable signal. Body mass measured under standard conditions is early, cheap and hard to argue with.",
     "zh": "口渴是一个偏晚且不可靠的信号。在标准条件下测得的体重则是偏早、便宜且难以争辩的。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Monitoring methods, ranked by usefulness in the field",
     "zh": "监测方法按现场实用性排序"
    },
    "cols": [
     {
      "en": "Method",
      "zh": "方法"
     },
     {
      "en": "What it tells you",
      "zh": "它能告诉你什么"
     },
     {
      "en": "Practical?",
      "zh": "实用？"
     }
    ],
    "rows": [
     [
      {
       "en": "Change in body mass",
       "zh": "体重变化"
      },
      {
       "en": "Total fluid deficit, directly and in litres",
       "zh": "总体液体缺口，直接以升计"
      },
      {
       "en": "Very — the gold standard",
       "zh": "非常实用——金标准"
      }
     ],
     [
      {
       "en": "Urine colour",
       "zh": "尿液颜色"
      },
      {
       "en": "Hydration status, roughly",
       "zh": "大致的水合状态"
      },
      {
       "en": "Yes, but coarse",
       "zh": "是，但很粗略"
      }
     ],
     [
      {
       "en": "Urine specific gravity",
       "zh": "尿液比重"
      },
      {
       "en": "Concentration, and a reasonable trend",
       "zh": "浓缩程度，以及一个合理趋势"
      },
      {
       "en": "Yes, if strips are available",
       "zh": "是，如果有试纸"
      }
     ],
     [
      {
       "en": "Body weight relative to baseline",
       "zh": "相对基线的体重"
      },
      {
       "en": "Whether the athlete is still carrying a deficit from before",
       "zh": "运动员是否仍带着赛前的缺口"
      },
      {
       "en": "Very — track across days",
       "zh": "非常实用——跨天追踪"
      }
     ],
     [
      {
       "en": "Thirst",
       "zh": "口渴"
      },
      {
       "en": "That you are already behind",
       "zh": "你已经落后了"
      },
      {
       "en": "Unreliable — a late signal",
       "zh": "不可靠——偏晚的信号"
      }
     ],
     [
      {
       "en": "Heart rate drift",
       "zh": "心率漂移"
      },
      {
       "en": "An indirect marker of under-hydration at the same workload",
       "zh": "同等负荷下脱水的一个间接指标"
      },
      {
       "en": "Moderate — confounded by fitness",
       "zh": "中等——受体能混淆"
      }
     ]
    ],
    "note": {
     "en": "Drinking to thirst is safe for most athletes and is better than drinking to a rigid schedule. Under-hydration is the bigger problem; hyponatraemia from over-drinking is the rare one.",
     "zh": "对多数运动员而言按口渴饮水是安全的，而且好过按僵化的时间表饮水。脱水是更大的问题；过量饮水导致低钠血症是少见的问题。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: deciding whether a third hard day is safe",
    "zh": "例题：判断第三个高强度训练日是否安全"
   },
   "given": {
    "en": "A 60 kg athlete finishes three sessions in a week 1.9, 2.1 and 2.4 percent below baseline body mass.",
    "zh": "一名 60 公斤的运动员一周内三堂训练课后体重分别低于基线 1.9%、2.1% 和 2.4%。"
   },
   "steps": [
    {
     "en": "Session 1: 1.9 percent is close to the flag but under it, and the fluid was replaced afterwards.",
     "zh": "第 1 次：1.9% 接近阈值但未超过，且事后补液了。"
    },
    {
     "en": "Session 2: 2.1 percent crosses it, and it is the second day without recovery — that is the pattern that matters.",
     "zh": "第 2 次：2.1% 越过了阈值，而且这是连续第二天未恢复——这个模式才是关键。"
    },
    {
     "en": "Session 3: 2.4 percent is the third consecutive deficit, and heart rate drift appears at the same pace.",
     "zh": "第 3 次：2.4% 是连续第三次缺口，并且同样配速下出现了心率漂移。"
    },
    {
     "en": "So the decision is about the trend, not any single number: reduce the third session or add fluid and carbohydrate.",
     "zh": "所以决定应基于趋势而非任何单个数字：减少第三次训练，或补液并加碳水。"
    }
   ],
   "answer": {
    "en": "No single day breached a clinical threshold, yet the pattern is exactly the one that precedes heat illness. This is the case where averaging the data would have hidden the problem.",
    "zh": "没有哪一天越过临床阈值，然而这个模式恰恰是导致中暑的前兆。这正是\"取平均\"会把问题掩盖掉的情形。"
   }
  }
 },
 "ADH and cardiovascular drift": {
  "figures": [
   {
    "title": {
     "en": "Cardiovascular drift and what causes it",
     "zh": "心率漂移及其成因"
    },
    "svg": "<line class=\"th\" x1=\"30\" y1=\"132\" x2=\"300\" y2=\"132\"/><line class=\"dash\" d=\"M30 70h270\"/><path class=\"fillA\" d=\"M30 70C90 68 150 62 300 44v88H30z\"/><text class=\"lbl\" x=\"150\" y=\"106\">+ HR, same pace</text><text class=\"lblS\" x=\"30\" y=\"62\">start</text><text class=\"lblS\" x=\"264\" y=\"40\">60 min</text><g><rect class=\"fillB\" x=\"36\" y=\"146\" width=\"60\" height=\"22\" rx=\"5\"/><path class=\"ln\" d=\"M36 146h60v22H36z\"/><text class=\"lblS\" x=\"42\" y=\"161\">sweat</text><rect class=\"fillB\" x=\"106\" y=\"146\" width=\"60\" height=\"22\" rx=\"5\"/><path class=\"ln\" d=\"M106 146h60v22H60z\"/><path class=\"ln\" d=\"M106 146h60v22h-60z\"/><text class=\"lblS\" x=\"112\" y=\"161\">temp</text><rect class=\"fillB\" x=\"176\" y=\"146\" width=\"60\" height=\"22\" rx=\"5\"/><path class=\"ln\" d=\"M176 146h60v22h-60z\"/><text class=\"lblS\" x=\"182\" y=\"161\">HR</text><rect class=\"fillB\" x=\"246\" y=\"146\" width=\"60\" height=\"22\" rx=\"5\"/><path class=\"ln\" d=\"M246 146h60v22h-60z\"/><text class=\"lblS\" x=\"252\" y=\"161\">fuel</text></g>",
    "viewBox": "0 0 320 180",
    "legend": [
     {
      "en": "heart rate rises at the same pace — that is the drift, and it is measurable on a watch",
      "zh": "同样配速下心率上升——这就是漂移，而且用手表就能测量"
     },
     {
      "en": "four causes, and all four are trainable or avoidable: plasma volume, skin and core temperature, the temperature of the blood returning to the heart, and fuel depletion",
      "zh": "四个成因，而且都可训练或可避免：血容量、皮肤与核心温度、回流血温度、以及燃料耗竭"
     },
     {
      "en": "the response is to slow down deliberately rather than to fight it",
      "zh": "正确的应对是有意减速，而不是与之硬扛"
     }
    ],
    "caption": {
     "en": "Drift is not deconditioning during a race. It is a set of compensations, and an athlete who understands it can plan around it instead of being surprised by it.",
     "zh": "漂移不是比赛中体能下降。它是一组代偿，而理解它的运动员可以据此做计划，而不是被它打个措手不及。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The four drivers of drift",
     "zh": "漂移的四个驱动因素"
    },
    "cols": [
     {
      "en": "Driver",
      "zh": "驱动因素"
     },
     {
      "en": "Mechanism",
      "zh": "机制"
     },
     {
      "en": "Effect of fitness",
      "zh": "体能的影响"
     },
     {
      "en": "Can be offset by",
      "zh": "可通过什么抵消"
     }
    ],
    "rows": [
     [
      {
       "en": "Reduced plasma volume",
       "zh": "血浆容量下降"
      },
      {
       "en": "Blood leaving the capillaries to the skin never fully returns",
       "zh": "离开毛细血管去往皮肤的血没有全部回到循环"
      },
      {
       "en": "Less drift",
       "zh": "漂移更小"
      },
      {
       "en": "Acclimatisation, hydration, sodium",
       "zh": "热适应、补液、钠"
      }
     ],
     [
      {
       "en": "Core temperature",
       "zh": "核心体温"
      },
      {
       "en": "Blood diverted to the skin for cooling",
       "zh": "血液被分流到皮肤以散热"
      },
      {
       "en": "A later rise in core temperature",
       "zh": "核心体温升高更晚"
      },
      {
       "en": "Heat acclimatisation",
       "zh": "热适应"
      }
     ],
     [
      {
       "en": "Warm blood returning to the heart",
       "zh": "回流的血液温度升高"
      },
      {
       "en": "A warmer heart fills less per beat",
       "zh": "更热的心脏每次搏动充盈更少"
      },
      {
       "en": "Partly resistant with training",
       "zh": "训练产生部分抵抗"
      },
      {
       "en": "Event design, cooling, pacing",
       "zh": "赛事设计、降温、配速"
      }
     ],
     [
      {
       "en": "Fuel depletion and metabolite accumulation",
       "zh": "燃料耗竭与代谢物积累"
      },
      {
       "en": "Less available ATP, more inorganic phosphate",
       "zh": "可利用 ATP 减少，无机磷酸增加"
      },
      {
       "en": "Larger glycogen stores delay it",
       "zh": "更大的糖原储备可延后它"
      },
      {
       "en": "Carbohydrate fuelling, pacing",
       "zh": "碳水供能、配速"
      }
     ]
    ],
    "note": {
     "en": "Heat acclimatisation is the single most effective intervention, and it works by expanding plasma volume and starting to sweat earlier and more lightly. Ten to fourteen days produces most of the benefit.",
     "zh": "热适应是最有效的单项干预，它通过扩大血容量、以及更早更轻地出汗而起作用。十到十四天可获得大部分收益。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: 10 percent rule for heat",
    "zh": "例题：高温环境下的 10% 规则"
   },
   "given": {
    "en": "A 60 kg runner, 32 °C, 70% humidity. Heart rate at 12 km/h is 168 at minute 5 and 181 at minute 55.",
    "zh": "一名 60 公斤的跑者，32 摄氏度、湿度 70%。在 12 公里/小时时，第 5 分钟心率 168，第 55 分钟心率 181。"
   },
   "steps": [
    {
     "en": "Drift = (181 - 168) / 168 = 7.7 percent in 50 minutes.",
     "zh": "漂移 = (181 - 168) / 168 = 50 分钟内 7.7%。"
    },
    {
     "en": "Above 10 percent, the priority is heat illness, not finishing order.",
     "zh": "超过 10% 时，优先事项是预防中暑，而不是名次。"
    },
    {
     "en": "Adjustments in order: slow by about 10 percent, add sodium, increase fluid intake, add cooling.",
     "zh": "调整顺序：减速约 10%、补钠、增加饮水、加入降温。"
    },
    {
     "en": "Recheck the heart rate at the reduced pace; if drift is still rising, the event needs a further change.",
     "zh": "在降速后复测心率；如果漂移仍在上升，这项赛事还需要进一步调整。"
    }
   ],
   "answer": {
    "en": "A 7.7 percent drift is survivable but worth acting on, and the adjustment order matters — changing pace first is cheap, changing the event last. The watch number is more actionable than any symptom report.",
    "zh": "7.7% 的漂移是可以承受的，但值得处理；而调整顺序很重要——先改配速成本最低，最后才改赛事。手表上的数字比任何症状报告都更可操作。"
   }
  }
 },
 "Macronutrients and individual needs": {
  "figures": [
   {
    "title": {
     "en": "Where the energy goes",
     "zh": "能量去向"
    },
    "svg": "<g><rect class=\"fillA\" x=\"14\" y=\"30\" width=\"292\" height=\"26\" rx=\"6\"/><path class=\"ln\" d=\"M14 30h292v26H14z\"/><rect class=\"fillC\" x=\"14\" y=\"30\" width=\"196\" height=\"26\"/><text class=\"lbl\" x=\"24\" y=\"48\">carbohydrate 4–5 kcal/g</text></g><g><rect class=\"fillA\" x=\"14\" y=\"66\" width=\"292\" height=\"26\" rx=\"6\"/><path class=\"ln\" d=\"M14 66h292v26H14z\"/><rect class=\"fillC\" x=\"14\" y=\"66\" width=\"292\" height=\"26\"/><text class=\"lbl\" x=\"24\" y=\"84\">fat 9 kcal/g — most efficient per gram</text></g><g><rect class=\"fillA\" x=\"14\" y=\"102\" width=\"292\" height=\"26\" rx=\"6\"/><path class=\"ln\" d=\"M14 102h292v26H14z\"/><rect class=\"fillC\" x=\"14\" y=\"102\" width=\"292\" height=\"26\" opacity=\".55\"/><text class=\"lbl\" x=\"24\" y=\"120\">protein 4 kcal/g — not a fuel</text></g><text class=\"lblS\" x=\"14\" y=\"150\">efficiency per gram is not the same as usefulness at 20 km/h</text><text class=\"lblS\" x=\"14\" y=\"168\">fuel for high intensity is limited; fuel for low intensity is not</text>",
    "viewBox": "0 0 320 180",
    "legend": [
     {
      "en": "carbohydrate and protein give 4 kcal per gram, fat gives 9 — so fat is the efficient one by mass",
      "zh": "碳水与蛋白质每克 4 千卡，脂肪每克 9 千卡——所以按质量脂肪最\"高效\""
     },
     {
      "en": "but carbohydrate is the only fuel that can be used anaerobically at a high rate, which is why it is sport-specific",
      "zh": "但碳水是唯一能以高速率无氧使用的燃料，这就是它具有专项性的原因"
     },
     {
      "en": "protein is a building material, not a fuel, and treating it as one is a category error",
      "zh": "蛋白质是建材而非燃料，把它当作燃料是范畴错误"
     }
    ],
    "caption": {
     "en": "The energy density ranking and the sport-usefulness ranking are different, and confusing them is the most common nutritional error in sport.",
     "zh": "能量密度的排序与运动适用性的排序是不同的，混淆这两者是运动营养中最常见的错误。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The three macronutrients compared",
     "zh": "三大营养素对比"
    },
    "cols": [
     {
      "en": "Feature",
      "zh": "特征"
     },
     {
      "en": "Carbohydrate",
      "zh": "碳水化合物"
     },
     {
      "en": "Fat",
      "zh": "脂肪"
     },
     {
      "en": "Protein",
      "zh": "蛋白质"
     }
    ],
    "rows": [
     [
      {
       "en": "Energy per gram",
       "zh": "每克能量"
      },
      {
       "en": "4 kcal",
       "zh": "4 千卡"
      },
      {
       "en": "9 kcal",
       "zh": "9 千卡"
      },
      {
       "en": "4 kcal",
       "zh": "4 千卡"
      }
     ],
     [
      {
       "en": "Can be used anaerobically at high rate",
       "zh": "能以高速率无氧利用"
      },
      {
       "en": "Yes — the only one",
       "zh": "是——唯一一个"
      },
      {
       "en": "No",
       "zh": "否"
      },
      {
       "en": "No",
       "zh": "否"
      }
     ],
     [
      {
       "en": "Stores in the body",
       "zh": "体内储备"
      },
      {
       "en": "~500 g, limited",
       "zh": "约 500 克，有限"
      },
      {
       "en": "Very large, effectively unlimited",
       "zh": "很大，实际上无限"
      },
      {
       "en": "No dedicated store",
       "zh": "无专用储备"
      }
     ],
     [
      {
       "en": "Main role",
       "zh": "主要作用"
      },
      {
       "en": "Fuel, especially at high intensity",
       "zh": "供能，尤其高强度"
      },
      {
       "en": "Fuel at low and moderate intensity",
       "zh": "低到中强度供能"
      },
      {
       "en": "Repair, enzymes, immunity",
       "zh": "修复、酶、免疫"
      }
     ],
     [
      {
       "en": "Timing matters",
       "zh": "时机重要"
      },
      {
       "en": "A great deal",
       "zh": "非常"
      },
      {
       "en": "Not much",
       "zh": "不大"
      },
      {
       "en": "Spread across the day",
       "zh": "分散在全天"
      }
     ]
    ],
    "note": {
     "en": "Carbohydrate availability is the single most performance-limiting nutrient in most endurance and team sports, which is why fuelling is a bigger lever than most athletes expect.",
     "zh": "在多数耐力与团队项目中，碳水可用性是限制表现最明显的营养素，因此补糖是一个比多数运动员预期更大的抓手。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: fuelling a 90-minute match",
    "zh": "例题：一场 90 分钟比赛的补糖"
   },
   "given": {
    "en": "A player needs about 60 g of carbohydrate per hour. One gel supplies 25 g.",
    "zh": "一名球员每小时需要约 60 克碳水。一支能量胶提供 25 克。"
   },
   "steps": [
    {
     "en": "Gels needed per hour: 60 / 25 = 2.4, so three to be practical.",
     "zh": "每小时需要能量胶：60 / 25 = 2.4，因此实际取三支。"
    },
    {
     "en": "With three gels the player gets 75 g per hour, which is above target and is the usual answer.",
     "zh": "三支即每小时 75 克，高于目标，也是通常的答案。"
    },
    {
     "en": "At 90 minutes that is about 110 g of carbohydrate in total.",
     "zh": "90 分钟合计约 110 克碳水。"
    },
    {
     "en": "The practical constraint is gastric emptying: more than about 60 g per hour in a single sitting causes discomfort, so it is split.",
     "zh": "实际限制是胃排空：单次摄入超过约每小时 60 克会引起不适，因此必须分次。"
    }
   ],
   "answer": {
    "en": "The arithmetic says 2.4 and the practice answer is 3, because tolerance and timing decide the last gel. This is the ordinary place where a number from a table meets a human being.",
    "zh": "算术答案是 2.4，而实践答案是 3，因为耐受性和时机决定了最后一支。这就是表格上的数字遇见真实的人的地方。"
   }
  }
 }
};
if(window.IB_VISUALS&&window.IB_VISUALS.shake){try{window.dispatchEvent(new Event('shake'))}catch(e){}}

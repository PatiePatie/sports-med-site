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
 },
 "ATP and the energy continuum": {
  "figures": [
   {
    "title": {
     "en": "One molecule, three ways to make it back",
     "zh": "一个分子，三种把它变回来的方式"
    },
    "svg": "<g><rect class=\"fillC\" x=\"14\" y=\"24\" width=\"66\" height=\"40\" rx=\"8\"/><path class=\"ln\" d=\"M14 24h66v40H14z\"/><text class=\"lbl\" x=\"34\" y=\"50\">ATP</text><path class=\"th\" d=\"M80 44h26\"/><path class=\"ln\" d=\"M106 44l-9-4.5v9z\" fill=\"currentColor\"/><rect class=\"fillA\" x=\"106\" y=\"24\" width=\"196\" height=\"40\" rx=\"8\"/><path class=\"ln\" d=\"M106 24h196v40H106z\"/><text class=\"lblS\" x=\"118\" y=\"42\">immediate</text><text class=\"lblS\" x=\"118\" y=\"56\">phosphagen</text></g><g><rect class=\"fillB\" x=\"106\" y=\"78\" width=\"196\" height=\"40\" rx=\"8\"/><path class=\"ln\" d=\"M106 78h196v40H106z\"/><text class=\"lblS\" x=\"118\" y=\"96\">glycolysis</text><text class=\"lblS\" x=\"118\" y=\"110\">carbohydrate only</text></g><g><rect class=\"fillA\" x=\"106\" y=\"132\" width=\"196\" height=\"40\" rx=\"8\"/><path class=\"ln\" d=\"M106 132h196v40H106z\"/><text class=\"lblS\" x=\"118\" y=\"150\">oxidative</text><text class=\"lblS\" x=\"118\" y=\"164\">carbs + fat + protein</text></g><path class=\"th\" d=\"M80 44v128\" stroke-dasharray=\"4 4\"/><text class=\"lblS\" x=\"14\" y=\"86\">seconds</text><text class=\"lblS\" x=\"14\" y=\"140\">minutes</text><text class=\"lblS\" x=\"14\" y=\"182\">hours</text>",
    "viewBox": "0 0 320 192",
    "legend": [
     {
      "en": "phosphagen system: fastest, largest power, no oxygen, lasts about 10 seconds",
      "zh": "磷酸原系统：最快、功率最大、不需氧、约维持 10 秒"
     },
     {
      "en": "glycolytic system: fast, does not need oxygen, but limited by the pain of lactate",
      "zh": "糖酵解系统：快速、不需氧，但受乳酸酸痛限制"
     },
     {
      "en": "oxidative system: slower, but effectively unlimited while fuel and oxygen last",
      "zh": "有氧系统：较慢，但在燃料与氧气够用时基本无限"
     }
    ],
    "caption": {
     "en": "The three systems are always working at once. What changes is the proportion, and that proportion is what determines the pace an athlete can hold.",
     "zh": "三套系统始终同时在工作。变化的是比例，而正是这个比例决定运动员能维持的配速。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The three energy systems compared",
     "zh": "三套能量系统对比"
    },
    "cols": [
     {
      "en": "Feature",
      "zh": "特征"
     },
     {
      "en": "Phosphagen",
      "zh": "磷酸原"
     },
     {
      "en": "Glycolytic",
      "zh": "糖酵解"
     },
     {
      "en": "Oxidative",
      "zh": "有氧"
     }
    ],
    "rows": [
     [
      {
       "en": "Rate of ATP production",
       "zh": "ATP 生成速率"
      },
      {
       "en": "Fastest",
       "zh": "最快"
      },
      {
       "en": "Fast",
       "zh": "快"
      },
      {
       "en": "Slower",
       "zh": "较慢"
      }
     ],
     [
      {
       "en": "Largest power output",
       "zh": "最大功率输出"
      },
      {
       "en": "Highest",
       "zh": "最高"
      },
      {
       "en": "Moderate",
       "zh": "中等"
      },
      {
       "en": "Lowest",
       "zh": "最低"
      }
     ],
     [
      {
       "en": "Duration",
       "zh": "持续时间"
      },
      {
       "en": "About 10 s",
       "zh": "约 10 秒"
      },
      {
       "en": "About 1–2 min",
       "zh": "约 1 到 2 分钟"
      },
      {
       "en": "Hours",
       "zh": "数小时"
      }
     ],
     [
      {
       "en": "Needs oxygen",
       "zh": "需要氧气"
      },
      {
       "en": "No",
       "zh": "不"
      },
      {
       "en": "No",
       "zh": "不"
      },
      {
       "en": "Yes",
       "zh": "是"
      }
     ],
     [
      {
       "en": "Fuel",
       "zh": "燃料"
      },
      {
       "en": "Stored creatine phosphate",
       "zh": "储存的磷酸肌酸"
      },
      {
       "en": "Carbohydrate only",
       "zh": "仅碳水"
      },
      {
       "en": "Carbohydrate, fat, protein",
       "zh": "碳水、脂肪、蛋白质"
      }
     ],
     [
      {
       "en": "End product",
       "zh": "终产物"
      },
      {
       "en": "ADP and creatine",
       "zh": "ADP 与肌酸"
      },
      {
       "en": "Lactate and hydrogen ions",
       "zh": "乳酸与氢离子"
      },
      {
       "en": "Carbon dioxide and water",
       "zh": "二氧化碳与水"
      }
     ]
    ],
    "note": {
     "en": "A sprinter is not \"anaerobic\" as a category. A sprinter is an athlete in whom the phosphagen system supplies a larger fraction of the total work.",
     "zh": "短跑运动员并不是\"无氧\"这一类别的成员。短跑运动员是这样一个人：磷酸原系统提供了总做功中更大的一部分。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: which system is limiting this effort",
    "zh": "例题：是哪套系统限制了这次努力"
   },
   "given": {
    "en": "A 1500 m race: 3 min 30 s. A 100 m sprint: 10 s. A half marathon: 105 min.",
    "zh": "一场 1500 米：3 分 30 秒。100 米冲刺：10 秒。半马：105 分钟。"
   },
   "steps": [
    {
     "en": "100 m: 10 s of work, so essentially all phosphagen plus a little glycolysis. Nothing aerobic is meaningfully used.",
     "zh": "100 米：10 秒的努力，所以基本全是磷酸原加少量糖酵解，有氧几乎没有被有意义地使用。"
    },
    {
     "en": "1500 m: 3.5 min sits exactly where phosphogen is exhausted and glycolysis is dominant, with aerobic contribution rising through it.",
     "zh": "1500 米：3.5 分钟正好处于磷酸原耗尽、糖酵解占主导的位置，而有氧贡献在全程中不断上升。"
    },
    {
     "en": "Half marathon: oxidative throughout, with the first two minutes still fast enough to owe an oxygen deficit that is repaid later.",
     "zh": "半马：全程有氧，而前两分钟仍然足够快，因而欠下一笔氧亏，之后再补回来。"
    },
    {
     "en": "So the same three systems are in all three races; only the mixture differs, and the mixture is set by time not by event name.",
     "zh": "所以同样这三套系统出现在三项比赛中；变化的只是配比，而配比是由时间决定的，不是由项目名称决定的。"
    }
   ],
   "answer": {
    "en": "The 1500 m is the hardest of the three to train well, because it sits in the transition zone where both the fast and the slow systems are being asked to contribute at once.",
    "zh": "1500 米是三者中最难训练好的一个，因为它处在过渡区，快速与慢速两套系统同时被要求出力。"
   }
  }
 },
 "Comparing the three systems": {
  "figures": [
   {
    "title": {
     "en": "The proportion shifts with intensity, not with the event",
     "zh": "配比随强度变化，而不是随项目名称变化"
    },
    "svg": "<line class=\"th\" x1=\"30\" y1=\"140\" x2=\"304\" y2=\"140\"/><line class=\"ln\" x1=\"30\" y1=\"140\" x2=\"30\" y2=\"20\"/><path class=\"fillC\" d=\"M30 140C70 60 130 30 304 24v116z\"/><path class=\"fillB\" d=\"M30 140C70 60 130 30 200 26v114z\"/><path class=\"fillA\" d=\"M30 140C60 96 90 62 130 40v100z\"/><text class=\"lblS\" x=\"18\" y=\"24\">% ATP</text><text class=\"lblS\" x=\"34\" y=\"132\">rest</text><text class=\"lblS\" x=\"256\" y=\"20\">max</text><text class=\"lblS\" x=\"30\" y=\"164\">phosphagen at the left, oxidative at the right, glycolysis across the middle</text><text class=\"lblS\" x=\"30\" y=\"182\">the crossover points are where athletes feel worst and train most productively</text>",
    "viewBox": "0 0 320 192",
    "legend": [
     {
      "en": "the crossover points between systems are where an athlete feels most uncomfortable and learns most",
      "zh": "系统之间的交叉点，是运动员感觉最不舒服、也学到最多的地方"
     },
     {
      "en": "training is the deliberate movement of a crossover point over a season",
      "zh": "训练就是一个赛季中刻意推移某个交叉点的过程"
     },
     {
      "en": "that is why a sprinter gains speed by pushing the fast crossover higher, and an endurance athlete by pushing the slow one further",
      "zh": "这就是为什么短跑运动员通过把快速交叉点推得更高来提速，而耐力运动员通过把慢速交叉点推得更远"
     }
    ],
    "caption": {
     "en": "Reading the graph as one smooth curve is the point. The systems do not switch on and off — they are all present, and intensity sets the mixture.",
     "zh": "把图读成一条平滑曲线正是要点。这些系统并不是开关式的开与关——它们全都存在，强度决定配比。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Where each event sits on the continuum",
     "zh": "各项比赛在连续体上的位置"
    },
    "cols": [
     {
      "en": "Event / effort",
      "zh": "项目 / 努力"
     },
     {
      "en": "Dominant system",
      "zh": "主导系统"
     },
     {
      "en": "Limit of that system",
      "zh": "该系统的限制"
     }
    ],
    "rows": [
     [
      {
       "en": "Weightlifting, throw, jump",
       "zh": "举重、推掷、跳跃"
      },
      {
       "en": "Phosphagen",
       "zh": "磷酸原"
      },
      {
       "en": "Stored ATP and creatine phosphate, about 10 s",
       "zh": "储存的 ATP 与磷酸肌酸，约 10 秒"
      }
     ],
     [
      {
       "en": "100 m, 400 m",
       "zh": "100 米、400 米"
      },
      {
       "en": "Phosphagen then glycolytic",
       "zh": "磷酸原继而糖酵解"
      },
      {
       "en": "Rate of ATP production",
       "zh": "ATP 的生成速率"
      }
     ],
     [
      {
       "en": "800 m, 1500 m",
       "zh": "800 米、1500 米"
      },
      {
       "en": "Glycolytic, with rising aerobic contribution",
       "zh": "糖酵解，且有氧贡献上升"
      },
      {
       "en": "Both fast and slow systems at once",
       "zh": "快慢两套系统同时出力"
      }
     ],
     [
      {
       "en": "5 km, half marathon, marathon",
       "zh": "5 公里、半马、全马"
      },
      {
       "en": "Oxidative",
       "zh": "有氧"
      },
      {
       "en": "Fuel delivery and mitochondrial capacity",
       "zh": "燃料输送与线粒体能力"
      }
     ]
    ],
    "note": {
     "en": "A useful consequence: the training that moves a crossover is specific to the system, so a sprinter and a marathoner can run the same session and be training different things.",
     "zh": "一个有用的推论：推移交叉点的训练是针对系统的，因此短跑运动员与马拉松运动员可以做同一堂训练课，却在训练不同的东西。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: the same session, two sports",
    "zh": "例题：同一堂训练课，两个项目"
   },
   "given": {
    "en": "Six 800 m repetitions with 3 min recovery, run by a 1500 m runner and a marathoner.",
    "zh": "6 组 800 米、组间休息 3 分钟，由一名 1500 米跑者和一名马拉松跑者完成。"
   },
   "steps": [
    {
     "en": "For the 1500 m runner, three minutes of recovery leaves the glycolytic system still partly in debt, so each repetition starts harder.",
     "zh": "对 1500 米跑者而言，3 分钟休息使糖酵解系统仍部分欠账，因此每一组都从更高的强度开始。"
    },
    {
     "en": "For the marathoner, the same session sits comfortably inside the oxidative system and produces very little crossover movement.",
     "zh": "对马拉松跑者而言，同一训练课稳稳落在有氧系统之内，几乎不产生交叉点位移。"
    },
    {
     "en": "Add a 3 min recovery and the same session becomes a genuine quality session for the marathoner and a punishing one for the 1500 m runner.",
     "zh": "休息改成 3 分钟后，同一训练课对马拉松跑者变成一堂真正的质量课，而对 1500 米跑者则相当痛苦。"
    },
    {
     "en": "So the session, not the event, is what identifies the training effect.",
     "zh": "因此决定训练效应的是训练课本身，而不是项目名称。"
    }
   ],
   "answer": {
    "en": "Identical work, opposite training effect, decided entirely by recovery. This is the practical reason \"the same programme for everyone\" is wrong, and it is visible in the numbers rather than argued about.",
    "zh": "同样的做功，相反的训练效应，完全由休息决定。这就是\"所有人用同一份计划\"是错误的具体原因，而且它是数字里看得见的，不靠争论。"
   }
  }
 },
 "VO₂max, movement economy, LIP and EPOC": {
  "figures": [
   {
    "title": {
     "en": "Four levers, one ceiling",
     "zh": "四个抓手，一个上限"
    },
    "svg": "<g><rect class=\"fillA\" x=\"14\" y=\"24\" width=\"66\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M14 24h66v34H14z\"/><text class=\"lblS\" x=\"22\" y=\"38\">VO2max</text><text class=\"lblS\" x=\"22\" y=\"52\">ceiling</text></g><g><rect class=\"fillB\" x=\"90\" y=\"24\" width=\"66\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M90 24h66v34H90z\"/><text class=\"lblS\" x=\"98\" y=\"38\">LIP</text><text class=\"lblS\" x=\"98\" y=\"52\">how fast</text></g><g><rect class=\"fillB\" x=\"166\" y=\"24\" width=\"66\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M166 24h66v34H166z\"/><text class=\"lblS\" x=\"174\" y=\"38\">economy</text><text class=\"lblS\" x=\"174\" y=\"52\">less O2</text></g><g><rect class=\"fillA\" x=\"242\" y=\"24\" width=\"64\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M242 24h64v34h-64z\"/><text class=\"lblS\" x=\"250\" y=\"38\">EPOC</text><text class=\"lblS\" x=\"250\" y=\"52\">repay</text></g><line class=\"th\" x1=\"14\" y1=\"88\" x2=\"306\" y2=\"88\"/><path class=\"fillC\" d=\"M14 88C60 74 90 78 130 84c40 6 100 4 176 -2v8H14z\"/><line class=\"ln\" d=\"M14 88C60 74 90 78 130 84c40 6 100 4 176 -2\"/><line class=\"dash\" d=\"M14 106h292\"/><text class=\"lblS\" x=\"14\" y=\"120\">effort</text><text class=\"lblS\" x=\"150\" y=\"128\">oxygen demand climbs faster than supply — the gap is repaid as EPOC</text><text class=\"lblS\" x=\"14\" y=\"160\">a bigger ceiling is worth less to a 10 km runner than better economy or faster LIP</text>",
    "viewBox": "0 0 320 168",
    "legend": [
     {
      "en": "VO2max is the ceiling and the least trainable of the four in a trained athlete",
      "zh": "VO₂max 是上限，也是四者中对训练有素运动员最难再提高的"
     },
     {
      "en": "movement economy is how little oxygen a given speed costs — highly trainable and often neglected",
      "zh": "运动经济性是指某一速度需要多少氧——可训练性很高，却常被忽视"
     },
     {
      "en": "LIP is the speed at which the first lactate appears, and it rises with training before VO2max does",
      "zh": "乳酸阈（LIP）是乳酸首次出现时的速度，它在训练中比 VO₂max 更早提高"
     }
    ],
    "caption": {
     "en": "Most runners improve by raising LIP and economy long before VO2max moves, which is why training that only targets the ceiling plateau.",
     "zh": "多数跑者在 VO₂max 变化之前，就已通过提高 LIP 与经济性获得提升——这就是只针对上限的训练会停滞的原因。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The four determinants of endurance performance",
     "zh": "耐力表现的四个决定因素"
    },
    "cols": [
     {
      "en": "Factor",
      "zh": "因素"
     },
     {
      "en": "What it is",
      "zh": "它是什么"
     },
     {
      "en": "How trainable is it?",
      "zh": "可训练性"
     },
     {
      "en": "Typical timescale",
      "zh": "典型时间尺度"
     }
    ],
    "rows": [
     [
      {
       "en": "VO2max",
       "zh": "VO₂max"
      },
      {
       "en": "The ceiling on oxygen use per minute",
       "zh": "每分钟用氧的上限"
      },
      {
       "en": "Low once trained",
       "zh": "训练有素后较低"
      },
      {
       "en": "Months to years",
       "zh": "数月到数年"
      }
     ],
     [
      {
       "en": "Movement economy",
       "zh": "运动经济性"
      },
      {
       "en": "Oxygen cost of a given speed or power",
       "zh": "某一速度或功率的耗氧代价"
      },
      {
       "en": "High",
       "zh": "高"
      },
      {
       "en": "Weeks to months",
       "zh": "数周到数月"
      }
     ],
     [
      {
       "en": "Lactinate threshold pace",
       "zh": "乳酸阈配速"
      },
      {
       "en": "Speed at which lactate first accumulates",
       "zh": "乳酸开始积累的速度"
      },
      {
       "en": "High",
       "zh": "高"
      },
      {
       "en": "Weeks",
       "zh": "数周"
      }
     ],
     [
      {
       "en": "EPOC",
       "zh": "运动后氧耗"
      },
      {
       "en": "Oxygen debt repaid after the effort",
       "zh": "努力之后偿还的氧债"
      },
      {
       "en": "Moderate",
       "zh": "中等"
      },
      {
       "en": "Weeks",
       "zh": "数周"
      }
     ],
     [
      {
       "en": "Fuel availability",
       "zh": "燃料可用性"
      },
      {
       "en": "Whether there is carbohydrate to use at that rate",
       "zh": "在那个速率下是否有碳水可用"
      },
      {
       "en": "Very high, and fast",
       "zh": "非常高且很快"
      },
      {
       "en": "Days",
       "zh": "数天"
      }
     ]
    ],
    "note": {
     "en": "Fuel availability is the fastest-acting item in the table, which is why under-fuelling undoes training that has been done properly.",
     "zh": "燃料可用性是表中最快起作用的项，因此补糖不足会让本来正确的训练白做。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: why a 10 km runner should not chase VO2max first",
    "zh": "例题：为什么 10 公里跑者不该先追 VO₂max"
   },
   "given": {
    "en": "Runner A: VO2max 62 ml/kg/min, 5 km pace 4:10/km. Runner B: VO2max 58, same 5 km pace 4:05/km.",
    "zh": "跑者 A：VO₂max 62 毫升每公斤每分钟，5 公里配速 4:10。跑者 B：58，同样 5 公里配速 4:05。"
   },
   "steps": [
    {
     "en": "B is faster over 5 km with a lower ceiling, so B has better economy or a higher threshold pace.",
     "zh": "B 的 5 公里成绩更好而上限更低，说明 B 的经济性更好或乳酸阈配速更高。"
    },
    {
     "en": "Holding pace at 4:05 for 5 km, a 62 versus 58 ceiling is a difference of about 7 percent of available oxygen.",
     "zh": "以 4:05 保持 5 公里，62 与 58 的上限相差约可用氧的 7%。"
    },
    {
     "en": "Economy differences between runners of the same event are routinely larger than 7 percent, so the economy term dominates.",
     "zh": "同一项目不同跑者之间的经济性差异 routinely 大于 7%，因此经济性这一项占主导。"
    },
    {
     "en": "So A should spend a season on economy and threshold work rather than on interval sessions aimed at the ceiling.",
     "zh": "因此 A 应该用一个赛季练经济性与阈值，而不是做以冲击上限为目的的间歇训练。"
    }
   ],
   "answer": {
    "en": "Two runners, same event, and the one with the lower ceiling wins. This is the calculation behind the advice that technical and pacing work usually beats more intervals.",
    "zh": "两名跑者、同一项目，而上限更低的那位赢了。这就是\"技术与配速训练通常胜过多做间歇\"这条建议背后的计算。"
   }
  }
 },
 "Six qualities and FITT": {
  "figures": [
   {
    "title": {
     "en": "The six qualities, and where each one peaks",
     "zh": "六项素质，以及各自的峰值年龄"
    },
    "svg": "<line class=\"th\" x1=\"30\" y1=\"150\" x2=\"304\" y2=\"150\"/><line class=\"ln\" x1=\"30\" y1=\"150\" x2=\"30\" y2=\"22\"/><path class=\"ln\" d=\"M30 26C70 30 100 52 124 96\"/><text class=\"lblS\" x=\"60\" y=\"24\">power</text><path class=\"ln\" d=\"M30 40C90 42 140 46 200 56\"/><text class=\"lblS\" x=\"200\" y=\"48\">speed</text><path class=\"ln\" d=\"M30 54C90 60 150 78 244 116\"/><text class=\"lblS\" x=\"248\" y=\"120\">strength</text><path class=\"ln\" d=\"M30 70C80 92 120 130 150 146\"/><text class=\"lblS\" x=\"150\" y=\"142\">endurance</text><path class=\"ln\" d=\"M30 88C56 100 74 120 84 146\"/><text class=\"lblS\" x=\"60\" y=\"120\">flexibility</text><line class=\"dash\" d=\"M30 110h274\"/><text class=\"lblS\" x=\"30\" y=\"166\">age</text><text class=\"lblS\" x=\"20\" y=\"30\">early</text><text class=\"lblS\" x=\"252\" y=\"166\">late</text><text class=\"lblS\" x=\"30\" y=\"184\">the curves are sequential, so a childhood spent only on endurance is expensive later</text>",
    "viewBox": "0 0 320 194",
    "legend": [
     {
      "en": "power, speed and flexibility peak early and are hard to improve afterwards",
      "zh": "力量、速度与柔韧在早期达峰，之后很难再提高"
     },
     {
      "en": "strength and endurance peak much later, so late specialisation is rational in those",
      "zh": "力量与耐力达峰晚得多，因此在这两项上晚专项化是合理的"
     },
     {
      "en": "that ordering is the argument for sampling many skills in childhood",
      "zh": "这个顺序正是在儿童期广泛尝试多种技术的论据"
     }
    ],
    "caption": {
     "en": "FITT describes the dose. It cannot tell you whether that dose is right for the athlete in front of you, which is what the next section is about.",
     "zh": "FITT 描述的是剂量。它无法告诉你这个剂量对面前这位运动员是否合适，而这正是下一节的内容。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The six qualities and how to train each",
     "zh": "六项素质及其训练方式"
    },
    "cols": [
     {
      "en": "Quality",
      "zh": "素质"
     },
     {
      "en": "Peaks",
      "zh": "达峰期"
     },
     {
      "en": "Primary method",
      "zh": "主要方法"
     },
     {
      "en": "Common error",
      "zh": "常见错误"
     }
    ],
    "rows": [
     [
      {
       "en": "Strength",
       "zh": "力量"
      },
      {
       "en": "Late 20s to 30s",
       "zh": "20 多岁后期到 30 多岁"
      },
      {
       "en": "Progressive resistance, high loads",
       "zh": "渐进抗阻、大负荷"
      },
      {
       "en": "Training it like endurance",
       "zh": "把它当耐力来练"
      }
     ],
     [
      {
       "en": "Power",
       "zh": "功率"
      },
      {
       "en": "Early 20s",
       "zh": "20 岁出头"
      },
      {
       "en": "High intent, fast concentric phase",
       "zh": "高意图、快速的向心阶段"
      },
      {
       "en": "Slow lifting called power training",
       "zh": "把慢速举重叫做功率训练"
      }
     ],
     [
      {
       "en": "Endurance",
       "zh": "耐力"
      },
      {
       "en": "20s to 30s",
       "zh": "20 到 30 多岁"
      },
      {
       "en": "Long, low-intensity aerobic volume",
       "zh": "长时低强度有氧量"
      },
      {
       "en": "Training it only with intervals",
       "zh": "只用间歇来练"
      }
     ],
     [
      {
       "en": "Speed",
       "zh": "速度"
      },
      {
       "en": "Early 20s",
       "zh": "20 岁出头"
      },
      {
       "en": "Full sprints, full recovery",
       "zh": "完全冲刺、完全恢复"
      },
      {
       "en": "120 m instead of 200 m",
       "zh": "用 120 米代替 200 米"
      }
     ],
     [
      {
       "en": "Flexibility",
       "zh": "柔韧性"
      },
      {
       "en": "Childhood",
       "zh": "儿童期"
      },
      {
       "en": "Daily mobility, all planes",
       "zh": "每日活动度训练、所有平面"
      },
      {
       "en": "Static stretching before a sprint",
       "zh": "冲刺前做静态拉伸"
      }
     ],
     [
      {
       "en": "Skill / coordination",
       "zh": "技术 / 协调"
      },
      {
       "en": "Childhood, then trainable",
       "zh": "儿童期，之后可训练"
      },
      {
       "en": "Variable, non-linear practice",
       "zh": "多变的非线性练习"
      },
      {
       "en": "One solution repeated for years",
       "zh": "一个解法重复多年"
      }
     ]
    ],
    "note": {
     "en": "The commonest error in the table is not doing too little of a quality. It is training the right quality by the wrong method.",
     "zh": "表中最常见的错误不是某项素质练得太少，而是用错误的方法练了正确的素质。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: writing FITT for a real athlete",
    "zh": "例题：为一位真实运动员写 FITT"
   },
   "given": {
    "en": "A 34-year-old returning to running, 5 km, currently walks 3 km without stopping.",
    "zh": "一名 34 岁重返跑步的人，目标是 5 公里，目前不间断走 3 公里。"
   },
   "steps": [
    {
     "en": "Frequency: start at 3 days per week. Walking is aerobic and safe, and 3 days builds a habit that survives.",
     "zh": "频率：从每周 3 天开始。步行是有氧且安全的，3 天能建立一个存活得下去的习惯。"
    },
    {
     "en": "Intensity: talk test only, so that the return is not compromised by an unfamiliar hard effort.",
     "zh": "强度：只用谈话测试，使这次回归不会被一次不熟悉的全力努力所毁掉。"
    },
    {
     "en": "Time: build from 30 to 60 minutes over about 8 weeks, adding no more than 10 percent per week.",
     "zh": "时间：在约 8 周内从 30 分钟增加到 60 分钟，每周增幅不超过 10%。"
    },
    {
     "en": "Type: all easy aerobic, because this is a base, not a training phase.",
     "zh": "类型：全部为轻松有氧，因为这是基础期，不是训练期。"
    },
    {
     "en": "A second session can be 20 minutes of strength work, which is the more trainable quality at 34.",
     "zh": "第二堂课可以做 20 分钟力量训练，因为在 34 岁力量是更可训练的那一项。"
    }
   ],
   "answer": {
    "en": "The FITT answer for the first eight weeks is deliberately unimpressive. Prescribing intensity and volume to an athlete who cannot yet run 5 km is the most common and most avoidable early mistake.",
    "zh": "前八周的 FITT 答案刻意不惊艳。对一位还跑不完 5 公里的人开强度和训练量，是最常见也最可避免的早期错误。"
   }
  }
 },
 "Periodization, overload and overtraining": {
  "figures": [
   {
    "title": {
     "en": "Volume and intensity across a season",
     "zh": "整个赛季的训练量与强度"
    },
    "svg": "<line class=\"th\" x1=\"24\" y1=\"140\" x2=\"304\" y2=\"140\"/><line class=\"ln\" x1=\"24\" y1=\"140\" x2=\"24\" y2=\"20\"/><path class=\"fillA\" d=\"M24 140C60 60 96 40 140 52c40 12 60 60 120 84l44 4z\"/><path class=\"ln\" d=\"M24 140C60 60 96 40 140 52c40 12 60 60 120 84\"/><path class=\"th\" d=\"M24 60C80 110 140 118 200 106c40 -8 70 -34 104 -66\"/><text class=\"lblS\" x=\"60\" y=\"52\">volume</text><text class=\"lblS\" x=\"216\" y=\"46\">intensity</text><line class=\"dash\" d=\"M24 110h280\"/><text class=\"lblS\" x=\"24\" y=\"164\">base</text><text class=\"lblS\" x=\"110\" y=\"164\">build</text><text class=\"lblS\" x=\"200\" y=\"164\">peak</text><text class=\"lblS\" x=\"262\" y=\"164\">taper</text><text class=\"lblS\" x=\"24\" y=\"184\">fitness is built early and lost quickly, so the taper removes fatigue rather than adding work</text>",
    "viewBox": "0 0 320 194",
    "legend": [
     {
      "en": "volume and intensity are inversely related in a well-planned season, not added together",
      "zh": "在一份好的赛季计划里，训练量与强度是反向关系，而不是叠加"
     },
     {
      "en": "the taper looks like doing less and is the most reliably performance-enhancing part of the plan",
      "zh": "减量看起来像\"少练\"，而它是计划中最可靠能提升表现的部分"
     },
     {
      "en": "overtraining is usually a recovery failure, not a workload failure",
      "zh": "过度训练通常是恢复失败，而不是负荷失败"
     }
    ],
    "caption": {
     "en": "Progressive overload has two limits and they are different. There is a limit before which nothing changes, and a limit after which adaptation stops and injury risk rises.",
     "zh": "渐进负荷有两个界限，而且它们性质不同。低于前一个界限什么都不会变，高过后一个界限适应停止而受伤风险上升。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Overload, and the two ways to fail it",
     "zh": "渐进负荷，以及两种失败方式"
    },
    "cols": [
     {
      "en": "Failure",
      "zh": "失败方式"
     },
     {
      "en": "What it looks like",
      "zh": "表现"
     },
     {
      "en": "Fix",
      "zh": "纠正"
     }
    ],
    "rows": [
     [
      {
       "en": "Too little",
       "zh": "负荷不足"
      },
      {
       "en": "Plateau, no measurable change, boredom",
       "zh": "停滞、没有可测量的变化、无聊"
      },
      {
       "en": "Progress one variable at a time",
       "zh": "每次只推进一个变量"
      }
     ],
     [
      {
       "en": "Too much",
       "zh": "负荷过大"
      },
      {
       "en": "Declining performance, fatigue, poor sleep, mood change",
       "zh": "表现下降、疲劳、睡眠差、情绪变化"
      },
      {
       "en": "Reduce load, restore recovery, then rebuild",
       "zh": "减负荷、恢复、然后重建"
      }
     ],
     [
      {
       "en": "Too fast",
       "zh": "推进太快"
      },
      {
       "en": "Soreness that changes technique, small performance losses",
       "zh": "酸痛到改变技术、微小的表现损失"
      },
      {
       "en": "Hold the level, consolidate, then progress",
       "zh": "保持水平、巩固，然后再推进"
      }
     ]
    ],
    "note": {
     "en": "The distinction that matters most in practice is the second row. An athlete with falling performance and poor sleep has an overtraining problem, and adding fitness to it makes it worse.",
     "zh": "实践中最重要的是第二行。一位表现下滑且睡眠不佳的运动员是过度训练问题，而给他加更多体能只会更糟。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: the 10 percent rule and what happens without it",
    "zh": "例题：10% 规则，以及不遵守会怎样"
   },
   "given": {
    "en": "A runner completes 20 km this week, 30 last week, 10 the week before.",
    "zh": "一名跑者本周完成 20 公里，上周 30 公里，上上周 10 公里。"
   },
   "steps": [
    {
     "en": "Going back two weeks: 10 to 30 km is a 200 percent increase.",
     "zh": "回看两周前：10 公里到 30 公里是 200% 的增幅。"
    },
    {
     "en": "The 10 percent rule would have given roughly 11, then 12 km — a slow but safe progression.",
     "zh": "10% 规则会给出大约 11 公里、再 12 公里——缓慢但安全的进阶。"
    },
    {
     "en": "A 200 percent jump produces soreness that lasts about a week, which disrupts the week after, so the increase is never actually absorbed.",
     "zh": "200% 的跃升会产生持续约一周的酸痛，扰乱再下一周，因此这个增长从未真正被吸收。"
    },
    {
     "en": "So the athlete got less fitness than a 10 to 12 to 20 progression would have produced, and paid for it in three disrupted weeks.",
     "zh": "所以这位运动员得到的体能比 10 到 12 到 20 的进阶更少，而且付出了三周被打乱的代价。"
    },
    {
     "en": "The rule is not magic; it is simply a rate that is small enough to be absorbed while the athlete is also working.",
     "zh": "这条规则不是魔法；它只是一个足够小、能在运动员同时还有工作的情况下被吸收的速率。"
    }
   ],
   "answer": {
    "en": "The runner who jumped 200 percent ended up behind the runner who crept 10 percent a week. This is the most reproducible result in training, and it is entirely avoidable.",
    "zh": "跳了 200% 的跑者，最终落后于每周爬 10% 的跑者。这是训练中最可复现的结果，而且完全可以避免。"
   }
  }
 },
 "Individualisation and the monitoring loop": {
  "figures": [
   {
    "title": {
     "en": "Measure, decide, change, re-measure",
     "zh": "测量、决定、改变、再测量"
    },
    "svg": "<g><rect class=\"fillA\" x=\"14\" y=\"28\" width=\"62\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M14 28h62v34H14z\"/><text class=\"lblS\" x=\"22\" y=\"42\">measure</text><text class=\"lblS\" x=\"22\" y=\"55\">baseline</text></g><path class=\"th\" d=\"M76 45h26\"/><path class=\"ln\" d=\"M102 45l-9-4.5v9z\" fill=\"currentColor\"/><g><rect class=\"fillA\" x=\"102\" y=\"28\" width=\"62\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M102 28h62v34h-62z\"/><text class=\"lblS\" x=\"110\" y=\"42\">decide</text><text class=\"lblS\" x=\"110\" y=\"55\">one change</text></g><path class=\"th\" d=\"M164 45h26\"/><path class=\"ln\" d=\"M190 45l-9-4.5v9z\" fill=\"currentColor\"/><g><rect class=\"fillB\" x=\"190\" y=\"28\" width=\"62\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M190 28h62v34h-62z\"/><text class=\"lblS\" x=\"198\" y=\"42\">train</text><text class=\"lblS\" x=\"198\" y=\"55\">2-4 weeks</text></g><path class=\"th\" d=\"M252 45h26\"/><path class=\"ln\" d=\"M278 45l-9-4.5v9z\" fill=\"currentColor\"/><g><rect class=\"fillC\" x=\"278\" y=\"28\" width=\"30\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M278 28h30v34h-30z\"/><text class=\"lblS\" x=\"283\" y=\"49\">test</text></g><path class=\"dash\" d=\"M293 66v34H45V66\"/><path class=\"ln\" d=\"M45 66l4.5-9h-9z\" fill=\"currentColor\"/><g><rect class=\"fillA\" x=\"96\" y=\"106\" width=\"128\" height=\"34\" rx=\"7\"/><path class=\"ln\" d=\"M96 106h128v34H96z\"/><text class=\"lblS\" x=\"104\" y=\"120\">change</text><text class=\"lblS\" x=\"104\" y=\"133\">what?</text></g><path class=\"th\" d=\"M160 100V84\"/><path class=\"ln\" d=\"M160 84l-4.5 9h9z\" fill=\"currentColor\"/><text class=\"lblS\" x=\"14\" y=\"170\">the loop is closed by the test, not by the plan</text>",
    "viewBox": "0 0 320 180",
    "legend": [
     {
      "en": "the loop closes only when the same measurement is repeated under the same conditions",
      "zh": "只有在相同条件下重复同一项测量时，这个循环才算闭合"
     },
     {
      "en": "a test after two to four weeks is enough; daily measurement is noise",
      "zh": "两到四周后的测试就够；每日测量只是噪声"
     },
     {
      "en": "what to change is chosen from the data, and only one thing at a time",
      "zh": "改什么由数据决定，而且一次只改一件事"
     }
    ],
    "caption": {
     "en": "Individualisation is not a personality. It is a loop: a baseline, one change, a re-test, and a decision about the next change based on the result.",
     "zh": "个体化不是一种性格，而是一个循环：一个基线、一处改变、一次复测、再根据结果决定下一步改什么。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "What to monitor, and how often",
     "zh": "监测什么，以及多久测一次"
    },
    "cols": [
     {
      "en": "Marker",
      "zh": "指标"
     },
     {
      "en": "Frequency",
      "zh": "频率"
     },
     {
      "en": "What a change means",
      "zh": "变化意味着什么"
     }
    ],
    "rows": [
     [
      {
       "en": "Session RPE x duration",
       "zh": "训练自觉用力 x 时长"
      },
      {
       "en": "Every session",
       "zh": "每次训练"
      },
      {
       "en": "The most reliable single load measure",
       "zh": "最可靠的单一负荷指标"
      }
     ],
     [
      {
       "en": "Morning heart rate",
       "zh": "晨起心率"
      },
      {
       "en": "Daily",
       "zh": "每日"
      },
      {
       "en": "A rise of 5-10 bpm suggests incomplete recovery",
       "zh": "上升 5 到 10 次/分提示恢复未完成"
      }
     ],
     [
      {
       "en": "Body mass",
       "zh": "体重"
      },
      {
       "en": "Daily, same conditions",
       "zh": "每日，条件相同"
      },
      {
       "en": "A drop of more than 2 percent flags under-fuelling",
       "zh": "下降超过 2% 提示补糖不足"
      }
     ],
     [
      {
       "en": "Sleep quality and duration",
       "zh": "睡眠质量与时长"
      },
      {
       "en": "Daily",
       "zh": "每日"
      },
      {
       "en": "Poor sleep plus poor performance is overtraining",
       "zh": "睡眠差加表现差即过度训练"
      }
     ],
     [
      {
       "en": "Performance test",
       "zh": "表现测试"
      },
      {
       "en": "Every 3-4 weeks",
       "zh": "每 3 到 4 周"
      },
      {
       "en": "The only measure that says the plan worked",
       "zh": "唯一能说明计划有效的指标"
      }
     ]
    ],
    "note": {
     "en": "Everything except the performance test is a warning signal. Only the performance test confirms adaptation, and skipping it is how a programme drifts for a whole season.",
     "zh": "除表现测试之外的一切都是预警信号。只有表现测试能确认适应，而跳过它正是一个计划整个赛季逐渐跑偏的原因。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: one change, properly attributed",
    "zh": "例题：一次改变，且可归因"
   },
   "given": {
    "en": "A 1500 m runner’s 5 km time is 21:40. Coach adds 6 x 400 m at race pace with 90 s recovery, 3 min total.",
    "zh": "一名 1500 米跑者的 5 公里成绩为 21:40。教练加入 6 组 400 米、比赛配速、组间 90 秒，总计 3 分钟。"
   },
   "steps": [
    {
     "en": "Baseline recorded: 21:40, tested on a known course in the same shoes.",
     "zh": "记录基线：21:40，在同一已知场地、同一双鞋下测试。"
    },
    {
     "en": "One change made: the session is added, everything else held constant for three weeks.",
     "zh": "只做一处改变：加入这堂训练课，其余三周保持不变。"
    },
    {
     "en": "Re-test at four weeks: 21:15, an improvement of 25 seconds.",
     "zh": "四周后复测：21:15，提升 25 秒。"
    },
    {
     "en": "The improvement is attributable, because only one thing changed. If three things had changed, the 25 seconds would be uninterpretable.",
     "zh": "这个提升可归因，因为只改了一件事。如果改了三件，那 25 秒就无法解释。"
    },
    {
     "en": "Next cycle: the coach now knows the session is worth 25 seconds, and can test whether it is worth keeping.",
     "zh": "下一个周期：教练现在知道这堂课值 25 秒，可以再检验它是否值得保留。"
    }
   ],
   "answer": {
    "en": "Four weeks and one number. That is the whole method, and it is slower than changing three things and being pleased with the result.",
    "zh": "四周和一个数字。这就是整套方法，而且它比\"同时改三样然后因为结果不错而高兴\"要慢。"
   }
  }
 },
 "Life stage, sex and energy balance": {
  "figures": [
   {
    "title": {
     "en": "Energy balance across the lifespan",
     "zh": "贯穿一生的能量平衡"
    },
    "svg": "<line class=\"th\" x1=\"24\" y1=\"130\" x2=\"304\" y2=\"130\"/><line class=\"dash\" d=\"M24 76h280\"/><path class=\"fillC\" d=\"M24 76h280v54H24z\"/><path class=\"ln\" d=\"M40 66C90 60 150 58 240 60\"/><text class=\"lblS\" x=\"24\" y=\"54\">intake</text><path class=\"ln\" d=\"M40 92C110 98 180 100 280 96\"/><text class=\"lblS\" x=\"24\" y=\"112\">expenditure</text><g><line class=\"th\" x1=\"64\" y1=\"48\" x2=\"64\" y2=\"104\"/><path class=\"ln\" d=\"M64 48l-4.5 9h9z\" fill=\"currentColor\"/><path class=\"ln\" d=\"M64 104l-4.5-9h9z\" fill=\"currentColor\"/></g><text class=\"lblS\" x=\"52\" y=\"40\">growth</text><g><line class=\"th\" x1=\"200\" y1=\"60\" x2=\"200\" y2=\"96\"/><path class=\"ln\" d=\"M200 60l-4.5 9h9z\" fill=\"currentColor\"/><path class=\"ln\" d=\"M200 96l-4.5-9h9z\" fill=\"currentColor\"/></g><text class=\"lblS\" x=\"188\" y=\"52\">adult</text><text class=\"lblS\" x=\"24\" y=\"156\">age</text><text class=\"lblS\" x=\"24\" y=\"176\">a child grows on a positive balance; an adult maintains; an older adult may need more protein per kilo</text>",
    "viewBox": "0 0 320 186",
    "legend": [
     {
      "en": "growth requires a positive energy balance, and that is a physiological requirement rather than a choice",
      "zh": "生长需要正能量平衡，而那是生理需求而不是选择"
     },
     {
      "en": "maintenance means intake equals expenditure, and the deficit creates loss",
      "zh": "维持意味着摄入等于消耗，而赤字会造成流失"
     },
     {
      "en": "protein requirement per kilo rises with age, so the same plan is not right across a lifespan",
      "zh": "每公斤蛋白质需求随年龄上升，因此同一份方案不可能适合整个生命周期"
     }
    ],
    "caption": {
     "en": "The same numbers produce a surplus in a growing child, a maintenance state in an adult and a deficit in an older adult, with identical dietary advice.",
     "zh": "同样的数字在生长中的儿童身上造成盈余、在成人身上造成维持、在老年人身上造成赤字——而给予的饮食建议却是同一份。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Considerations by life stage",
     "zh": "各生命阶段的考量"
    },
    "cols": [
     {
      "en": "Stage",
      "zh": "阶段"
     },
     {
      "en": "Main risk",
      "zh": "主要风险"
     },
     {
      "en": "Practical adjustment",
      "zh": "实际调整"
     }
    ],
    "rows": [
     [
      {
       "en": "Child",
       "zh": "儿童"
      },
      {
       "en": "Under-fuelling, and training through growth spurts",
       "zh": "补糖不足，以及在生长高峰期持续训练"
      },
      {
       "en": "More sessions, lower volume, no maximal loads",
       "zh": "更多训练课、更低训练量、不做最大负荷"
      }
     ],
     [
      {
       "en": "Adolescent",
       "zh": "青少年"
      },
      {
       "en": "Overuse while tissues are still adapting",
       "zh": "在组织仍在适应时过度使用"
      },
      {
       "en": "Sample many skills, specialise later",
       "zh": "广泛尝试各种技术，晚些专项化"
      }
     ],
     [
      {
       "en": "Female athlete",
       "zh": "女性运动员"
      },
      {
       "en": "Low energy availability, iron, and menstrual change",
       "zh": "能量可用性低、缺铁、月经变化"
      },
      {
       "en": "Track menstrual cycle, iron status, and intake against training",
       "zh": "追踪月经周期、铁状态，以及摄入与训练的关系"
      }
     ],
     [
      {
       "en": "Adult male",
       "zh": "成年男性"
      },
      {
       "en": "Usually over-eating rather than under",
       "zh": "通常是吃多而不是吃少"
      },
      {
       "en": "Watch total intake, not just sport nutrition",
       "zh": "关注总摄入，而不只是运动营养"
      }
     ],
     [
      {
       "en": "Older adult",
       "zh": "老年人"
      },
      {
       "en": "Loss of muscle mass and bone density",
       "zh": "肌肉量与骨密度流失"
      },
      {
       "en": "More protein per kilo, more balance work, less high-impact",
       "zh": "更多每公斤蛋白质、更多平衡训练、更少高冲击"
      }
     ]
    ],
    "note": {
     "en": "The single most useful question across every life stage is not what sport the athlete does. It is whether they are recovering between sessions at all.",
     "zh": "贯穿所有生命阶段最有用的一个问题不是运动员从事什么项目，而是他们是否真的在训练课之间恢复。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: the same athlete, three life stages",
    "zh": "例题：同一位运动员的三个生命阶段"
   },
   "given": {
    "en": "The same 60 kg man, at 16, 30 and 68, is prescribed the same 3000 kcal intake.",
    "zh": "同一位 60 公斤的男性，16 岁、30 岁和 68 岁，被开出同样的 3000 千卡摄入。"
   },
   "steps": [
    {
     "en": "At 16: expenditure is roughly 2500 kcal because of growth, so 3000 kcal is a surplus of about 20 percent.",
     "zh": "16 岁：因生长消耗约 2500 千卡，因此 3000 千卡是约 20% 的盈余。"
    },
    {
     "en": "At 30: expenditure is about 2500 kcal, so the same 3000 kcal is a surplus of 500 kcal and weight will rise.",
     "zh": "30 岁：消耗约 2500 千卡，因此同样 3000 千卡是 500 千卡盈余，体重会上升。"
    },
    {
     "en": "At 68: expenditure is about 2100 kcal, so the same 3000 kcal is a 40 percent surplus, and protein need per kilo is higher not lower.",
     "zh": "68 岁：消耗约 2100 千卡，因此同样 3000 千卡是 40% 的盈余，而每公斤蛋白质需求更高而不是更低。"
    },
    {
     "en": "Identical prescription, three different outcomes. The variable that was never considered is expenditure.",
     "zh": "同样的处方，三种不同结果。从未被考虑的那个变量是消耗。"
    }
   ],
   "answer": {
    "en": "Nothing here is about sport nutrition. It is that a plan written for one life stage silently becomes wrong in the other two, and nothing in the plan notices.",
    "zh": "这与运动营养无关。问题在于为某个生命阶段写下的方案，会在其他两个阶段悄悄变成错的，而方案本身不会察觉。"
   }
  }
 },
 "System benefits, chronic disease and progression": {
  "figures": [
   {
    "title": {
     "en": "Dose is the prescription, and it has a window",
     "zh": "剂量就是处方，而它有一个窗口"
    },
    "svg": "<line class=\"th\" x1=\"24\" y1=\"130\" x2=\"304\" y2=\"130\"/><line class=\"ln\" x1=\"24\" y1=\"130\" x2=\"24\" y2=\"24\"/><path class=\"fillA\" d=\"M24 130C60 120 90 100 120 76c20 -16 40 -30 70 -40 30 -10 60 -14 90 -14v108z\"/><path class=\"ln\" d=\"M24 130C60 120 90 100 120 76c20 -16 40 -30 70 -40 30 -10 60 -14 90 -14\"/><path class=\"th\" d=\"M24 108C70 96 120 80 170 70\"/><text class=\"lblS\" x=\"24\" y=\"150\">inactivity</text><text class=\"lblS\" x=\"180\" y=\"30\">benefit</text><text class=\"lblS\" x=\"236\" y=\"40\">plateau</text><text class=\"lblS\" x=\"256\" y=\"70\">risk</text><line class=\"dash\" d=\"M24 84h280\"/><text class=\"lblS\" x=\"24\" y=\"172\">most of the benefit arrives early — the first 20 percent of change does most of the work</text>",
    "viewBox": "0 0 320 180",
    "legend": [
     {
      "en": "most health benefit comes from moving out of inactivity, not from reaching an elite dose",
      "zh": "大部分健康收益来自从不活动转为活动，而不是达到精英剂量"
     },
     {
      "en": "there is a dose-response curve with a plateau and then a risk of harm at high volume",
      "zh": "存在一条剂量–反应曲线，经历平台期后在高训练量时出现伤害风险"
     },
     {
      "en": "progression must therefore be individual, because the window differs by condition",
      "zh": "因此进阶必须是个体化的，因为这个窗口因病情而异"
     }
    ],
    "caption": {
     "en": "The clinical message is that some is far better than none, and that the two errors are doing nothing and doing too much for someone with a chronic condition.",
     "zh": "临床上的信息是：做一些远好于不做；而两个错误是\"完全不做\"和\"对慢性病患者做得太多\"。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The most common conditions, and what changes",
     "zh": "最常见的病症，以及需要改变什么"
    },
    "cols": [
     {
      "en": "Condition",
      "zh": "病症"
     },
     {
      "en": "Main concern",
      "zh": "主要顾虑"
     },
     {
      "en": "What changes",
      "zh": "需要改变什么"
     }
    ],
    "rows": [
     [
      {
       "en": "Type 2 diabetes",
       "zh": "2 型糖尿病"
      },
      {
       "en": "Glycaemic control",
       "zh": "血糖控制"
      },
      {
       "en": "More frequent activity, weight loss, and post-meal walking",
       "zh": "更频繁的活动、减重，以及餐后步行"
      }
     ],
     [
      {
       "en": "Hypertension",
       "zh": "高血压"
      },
      {
       "en": "Blood pressure at exertion",
       "zh": "运动时的血压"
      },
      {
       "en": "Aerobic work, and Valsalva avoided",
       "zh": "有氧训练，并避免屏气用力"
      }
     ],
     [
      {
       "en": "Coronary artery disease",
       "zh": "冠心病"
      },
      {
       "en": "Demand on the heart muscle",
       "zh": "对心肌的需求"
      },
      {
       "en": "Medical clearance first, then graded progression",
       "zh": "先做医学许可，再分级进阶"
      }
     ],
     [
      {
       "en": "Osteoarthritis",
       "zh": "骨关节炎"
      },
      {
       "en": "Joint loading and pain",
       "zh": "关节负荷与疼痛"
      },
      {
       "en": "Low-impact work, strength, and more frequent shorter sessions",
       "zh": "低冲击训练、力量训练，以及更频繁的短课"
      }
     ],
     [
      {
       "en": "Asthma",
       "zh": "哮喘"
      },
      {
       "en": "Trigger and rescue medication use",
       "zh": "诱因与急救药物使用"
      },
      {
       "en": "Inhaled steroid before exercise, and known safe triggers",
       "zh": "运动前吸入激素，并确认安全的诱因"
      }
     ],
     [
      {
       "en": "Osteoporosis",
       "zh": "骨质疏松"
      },
      {
       "en": "Fracture risk",
       "zh": "骨折风险"
      },
      {
       "en": "Weight-bearing, resistance, and impact where safe",
       "zh": "负重训练、抗阻训练，以及在安全前提下加入冲击"
      }
     ]
    ],
    "note": {
     "en": "A row in this table is not a modification of a healthy programme. It is a different programme, and it is written by someone qualified.",
     "zh": "这张表中的一行并不是对健康方案的\"修改\"，而是一个不同的方案，而且它由有资质的人来写。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: a graded return for a common condition",
    "zh": "例题：为常见病症做分级回归"
   },
   "given": {
    "en": "A 58-year-old with hypertension and 12 years inactive, wanting to walk 5 km.",
    "zh": "一名 58 岁、有高血压且不活动 12 年的人，目标是走 5 公里。"
   },
   "steps": [
    {
     "en": "Stage 1, weeks 1-2: 10 minutes of walking, 5 days, and blood pressure checked before starting.",
     "zh": "第 1 阶段，第 1 到 2 周：步行 10 分钟、每周 5 天，并在开始前测量血压。"
    },
    {
     "en": "Stage 2, weeks 3-6: build to 30 minutes continuously. This is where most of the health benefit is gained.",
     "zh": "第 2 阶段，第 3 到 6 周：增加到连续 30 分钟。大部分健康收益在这里获得。"
    },
    {
     "en": "Stage 3, weeks 7-12: add intervals of 1 minute faster, and only if blood pressure stays acceptable.",
     "zh": "第 3 阶段，第 7 到 12 周：加入 1 分钟的较快间歇，且仅在血压保持可接受时进行。"
    },
    {
     "en": "Stage 4: work towards 5 km, but the goal is health, and it may be reduced without the programme being a failure.",
     "zh": "第 4 阶段：以 5 公里为目标，但目标是健康；目标可以降低而这不代表方案失败。"
    },
    {
     "en": "Note what did not appear: no session without breath-holding, and no progression without a measurement.",
     "zh": "注意没有出现的东西：没有一堂包含屏气用力的训练课，也没有一次没有测量的进阶。"
    }
   ],
   "answer": {
    "en": "The 5 km is not really the prescription. 30 minutes of daily activity is the prescription, and the walk is only how this person gets there. Framing it that way also makes a smaller goal acceptable.",
    "zh": "5 公里其实不是处方。每日的 30 分钟活动才是处方，而步行只是这个人到达它的方式。这样框定也使得更小的目标变得可以接受。"
   }
  }
 },
 "Pre-exercise, during-exercise and recovery": {
  "figures": [
   {
    "title": {
     "en": "The three phases and what each one is for",
     "zh": "三个阶段以及各自的目的"
    },
    "svg": "<g><rect class=\"fillA\" x=\"14\" y=\"24\" width=\"88\" height=\"116\" rx=\"8\"/><path class=\"ln\" d=\"M14 24h88v116H14z\"/><text class=\"lblS\" x=\"22\" y=\"42\">BEFORE</text><text class=\"lblS\" x=\"22\" y=\"60\">raise temp</text><text class=\"lblS\" x=\"22\" y=\"74\">rehearse</text><text class=\"lblS\" x=\"22\" y=\"88\">practise</text><text class=\"lblS\" x=\"22\" y=\"102\">psych up</text><text class=\"lblS\" x=\"22\" y=\"120\">12-20 min</text></g><g><rect class=\"fillB\" x=\"112\" y=\"24\" width=\"88\" height=\"116\" rx=\"8\"/><path class=\"ln\" d=\"M112 24h88v116h-88z\"/><text class=\"lblS\" x=\"120\" y=\"42\">DURING</text><text class=\"lblS\" x=\"120\" y=\"60\">fuel</text><text class=\"lblS\" x=\"120\" y=\"74\">fluid</text><text class=\"lblS\" x=\"120\" y=\"88\">heat out</text><text class=\"lblS\" x=\"120\" y=\"102\">posture</text><text class=\"lblS\" x=\"120\" y=\"120\">ongoing</text></g><g><rect class=\"fillA\" x=\"210\" y=\"24\" width=\"96\" height=\"116\" rx=\"8\"/><path class=\"ln\" d=\"M210 24h96v116h-96z\"/><text class=\"lblS\" x=\"218\" y=\"42\">AFTER</text><text class=\"lblS\" x=\"218\" y=\"60\">rehydrate</text><text class=\"lblS\" x=\"218\" y=\"74\">re-fuel</text><text class=\"lblS\" x=\"218\" y=\"88\">cool down</text><text class=\"lblS\" x=\"218\" y=\"102\">review</text><text class=\"lblS\" x=\"218\" y=\"120\">until next</text></g><text class=\"lblS\" x=\"14\" y=\"162\">the warm-up is the most neglected phase and the one with the shortest useful life</text><text class=\"lblS\" x=\"14\" y=\"180\">its effects fade within 20-30 minutes, so a long ceremony at half-time actively costs</text>",
    "viewBox": "0 0 320 190",
    "legend": [
     {
      "en": "the warm-up raises tissue temperature and rehearses the movement, and both effects fade",
      "zh": "热身提高组织温度并排练动作，而两种效果都会消退"
     },
     {
      "en": "during exercise the priorities are fuel, fluid, heat loss and posture, in that order of neglect",
      "zh": "运动中的优先事项是补糖、补液、散热与姿势，按被忽视程度排序"
     },
     {
      "en": "afterwards, carbohydrate and protein matter most in the first hour",
      "zh": "之后的第一小时里，碳水与蛋白质最为关键"
     }
    ],
    "caption": {
     "en": "The warm-up is the cheapest performance intervention available and the most frequently skipped, usually in favour of more warm-up drills that do not transfer.",
     "zh": "热身是最便宜的性能干预，也是最常被跳过的——通常是被更多并不迁移的热身练习换掉了。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The three phases, and the commonest error in each",
     "zh": "三个阶段，以及各阶段最常见的错误"
    },
    "cols": [
     {
      "en": "Phase",
      "zh": "阶段"
     },
     {
      "en": "Purpose",
      "zh": "目的"
     },
     {
      "en": "Commonest error",
      "zh": "最常见的错误"
     }
    ],
    "rows": [
     [
      {
       "en": "Before",
       "zh": "之前"
      },
      {
       "en": "Raise temperature, rehearse, focus",
       "zh": "提高温度、排练、集中"
      },
      {
       "en": "Static stretching, which reduces power for 30-60 min",
       "zh": "静态拉伸，会在 30 到 60 分钟内降低功率"
      }
     ],
     [
      {
       "en": "During",
       "zh": "之中"
      },
      {
       "en": "Fuel, fluid, heat loss, position",
       "zh": "补糖、补液、散热、姿势"
      },
      {
       "en": "Waiting until thirsty, which is already too late",
       "zh": "等到口渴才喝，而这已经太晚"
      }
     ],
     [
      {
       "en": "After",
       "zh": "之后"
      },
      {
       "en": "Restore glycogen, protein, fluid",
       "zh": "恢复糖原、蛋白质、水分"
      },
      {
       "en": "Skipping carbohydrate after a glycogen-depleting effort",
       "zh": "在耗糖训练后不补碳水"
      }
     ]
    ],
    "note": {
     "en": "Warm-up effects decay in 20 to 30 minutes, which means the timing matters more than the content. A correct warm-up performed 45 minutes early is a wasted warm-up.",
     "zh": "热身效果在 20 到 30 分钟内衰减，这意味着时机比内容更重要。提前 45 分钟做完的、正确的热身，是一个被浪费的热身。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: a match-day warm-up that fits the clock",
    "zh": "例题：一份符合时间表的比赛日热身"
   },
   "given": {
    "en": "The match starts 40 minutes after the team enters the pitch. Warm-up must raise temperature and rehearse the set piece.",
    "zh": "比赛在球队进场 40 分钟后开始。热身必须提高温度并排练定位球。"
   },
   "steps": [
    {
     "en": "Minutes 0-8: raise temperature with continuous movement, then dynamic mobility through all planes.",
     "zh": "第 0 到 8 分钟：用连续活动提高温度，然后通过所有平面做动态活动度。"
    },
    {
     "en": "Minutes 8-20: specific rehearsal, increasing speed, including the set-piece pattern at match intensity.",
     "zh": "第 8 到 20 分钟：专项排练，速度逐步提高，其中包括以比赛强度排练定位球套路。"
    },
    {
     "en": "Minutes 20-30: brief team talk, then keep moving. Stop the long static phase here.",
     "zh": "第 20 到 30 分钟：简短的队伍讲话，然后继续活动。在这里结束冗长的静态阶段。"
    },
    {
     "en": "Minutes 30-38: short sharp accelerations, then the rest is waiting — the effects are still inside the 20-30 minute window.",
     "zh": "第 30 到 38 分钟：短促的加速度训练，其余是等待——效果仍在 20 到 30 分钟的窗口内。"
    },
    {
     "en": "A 60 minute pre-match routine would be counterproductive, because the effects would have decayed.",
     "zh": "一份 60 分钟的赛前流程会适得其反，因为效果届时已经衰减。"
    }
   ],
   "answer": {
    "en": "Same athletes, same drills, and the difference between a routine that works and one that does not was entirely in the clock. This is the least glamorous and most reproducible finding in warm-up research.",
    "zh": "同样的运动员、同样的练习，而有效与无效的流程之间的差别完全在于时间表。这是热身研究中最不光鲜、也最可复现的发现。"
   }
  }
 },
 "Micronutrients, RED-S and microbiome": {
  "figures": [
   {
    "title": {
     "en": "The energy-availability window",
     "zh": "能量可用性的窗口"
    },
    "svg": "<line class=\"th\" x1=\"24\" y1=\"136\" x2=\"304\" y2=\"136\"/><line class=\"ln\" x1=\"24\" y1=\"136\" x2=\"24\" y2=\"24\"/><path class=\"fillA\" d=\"M24 136C60 100 90 70 130 50c30 -14 60 -20 100 -22v108z\"/><path class=\"ln\" d=\"M24 136C60 100 90 70 130 50c30 -14 60 -20 100 -22\"/><line class=\"dash\" d=\"M24 78h280\"/><text class=\"lblS\" x=\"24\" y=\"72\">optimal</text><path class=\"fillC\" d=\"M230 28h74v108h-74z\" opacity=\".5\"/><text class=\"lblS\" x=\"236\" y=\"44\">RED-S</text><text class=\"lblS\" x=\"24\" y=\"156\">available</text><text class=\"lblS\" x=\"24\" y=\"172\">energy for</text><text class=\"lblS\" x=\"24\" y=\"186\">training</text><text class=\"lblS\" x=\"252\" y=\"156\">too low</text>",
    "viewBox": "0 0 320 196",
    "legend": [
     {
      "en": "energy available for training is what remains after training expenditure is subtracted from intake",
      "zh": "可供训练使用的能量，是摄入减去训练消耗之后的余量"
     },
     {
      "en": "below roughly 30 kcal per kilo of fat-free mass the body starts conserving, and RED-S can follow",
      "zh": "低于每公斤去脂体重约 30 千卡时，身体开始节省，而 RED-S 可能随之出现"
     },
     {
      "en": "iron, vitamin D and calcium are the micronutrients most often low in athlete diets",
      "zh": "铁、维生素 D 与钙是运动员饮食中最常偏低的几项微量营养素"
     }
    ],
    "caption": {
     "en": "RED-S is not a single diagnosis. It is a cluster of low-energy-availability effects across bone, hormones, immunity, mood and performance, and it is common and under-diagnosed.",
     "zh": "RED-S 不是单一诊断。它是低能量可用性在骨骼、激素、免疫、情绪与表现上的一组效应，而且常见却常被漏诊。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Micronutrients that matter most in sport",
     "zh": "运动中最重要的微量营养素"
    },
    "cols": [
     {
      "en": "Nutrient",
      "zh": "营养素"
     },
     {
      "en": "Deficit looks like",
      "zh": "缺乏的表现"
     },
     {
      "en": "Where it comes from",
      "zh": "来源"
     },
     {
      "en": "Priority",
      "zh": "优先级"
     }
    ],
    "rows": [
     [
      {
       "en": "Iron",
       "zh": "铁"
      },
      {
       "en": "Fatigue, poor tolerance of training, breathlessness",
       "zh": "疲劳、训练耐受差、气促"
      },
      {
       "en": "Red meat, legumes, fortified food",
       "zh": "红肉、豆类、强化食品"
      },
      {
       "en": "Highest — it is the commonest true deficiency",
       "zh": "最高——它是最常见的真实缺乏"
      }
     ],
     [
      {
       "en": "Vitamin D",
       "zh": "维生素 D"
      },
      {
       "en": "Bone pain, frequent minor infection, slow recovery",
       "zh": "骨痛、频繁轻微感染、恢复慢"
      },
      {
       "en": "Sunlight, oily fish, fortified food",
       "zh": "日照、含油鱼、强化食品"
      },
      {
       "en": "High, and often low at latitude",
       "zh": "高，且在高纬度地区常偏低"
      }
     ],
     [
      {
       "en": "Calcium",
       "zh": "钙"
      },
      {
       "en": "Bone density loss, muscle cramping",
       "zh": "骨密度流失、肌肉痉挛"
      },
      {
       "en": "Dairy, fortified alternatives, tinned fish with bones",
       "zh": "乳制品、强化替代品、带骨罐头鱼"
      },
      {
       "en": "High in low-dairy diets",
       "zh": "在低乳制品饮食中偏高"
      }
     ],
     [
      {
       "en": "Magnesium",
       "zh": "镁"
      },
      {
       "en": "Crumbling, cramps, poor recovery",
       "zh": "乏力、抽筋、恢复差"
      },
      {
       "en": "Nuts, whole grains, dark leafy vegetables",
       "zh": "坚果、全谷物、深绿叶蔬菜"
      },
      {
       "en": "Moderate",
       "zh": "中"
      }
     ]
    ],
    "note": {
     "en": "Energy availability is upstream of all of these. Correcting a deficiency while the athlete remains in low energy availability is treating the symptom and leaving the cause.",
     "zh": "能量可用性位于这些之上。在运动员仍处于低能量可用性时纠正缺乏，是在治症状而留下病因。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: finding low energy availability arithmetically",
    "zh": "例题：用算术找出低能量可用性"
   },
   "given": {
    "en": "A 55 kg female athlete, 42 kg fat-free mass, eats 2000 kcal and trains burning 2200 kcal.",
    "zh": "一名 55 公斤的女性运动员，去脂体重 42 公斤，摄入 2000 千卡，训练消耗 2200 千卡。"
   },
   "steps": [
    {
     "en": "Energy available = intake - training expenditure = 2000 - 2200 = -200 kcal.",
     "zh": "能量可用性 = 摄入 - 训练消耗 = 2000 - 2200 = -200 千卡。"
    },
    {
     "en": "Relative to fat-free mass: -200 / 42 = -4.8 kcal per kg. The optimum is above roughly 30.",
     "zh": "按去脂体重计：-200 / 42 = 每公斤 -4.8 千卡，而最优值在约 30 以上。"
    },
    {
     "en": "So this is not borderline — it is a substantial deficit, and the body will be conserving rather than building.",
     "zh": "所以这不是临界情况——而是明显赤字，身体会进行节省而不是建设。"
    },
    {
     "en": "The likely presentation is not a single symptom but fatigue, a stalled weight, a missed period and repeated injuries.",
     "zh": "可能的表现不是单一症状，而是疲劳、体重停滞、月经不来以及反复受伤。"
    },
    {
     "en": "Increasing intake is not a small fix: the gap here is larger than most athletes assume.",
     "zh": "增加摄入不是一个小修正：这里的缺口比多数运动员以为的更大。"
    }
   ],
   "answer": {
    "en": "The arithmetic says the gap is 200 kcal, which sounds trivial until it is expressed per kilo of fat-free mass. Expressed that way, it is a deficit of about 5 against a target of 30.",
    "zh": "算术给出的缺口是 200 千卡，听起来微不足道，直到按每公斤去脂体重表达为止。按那种方式表达，它是从目标 30 掉到约 5。"
   }
  }
 },
 "Skeleton, position and directional terms": {
  "figures": [
   {
    "title": {
     "en": "Anatomical position and the directional terms",
     "zh": "解剖学姿势与方位术语"
    },
    "svg": "<g><line class=\"ln\" x1=\"150\" y1=\"20\" x2=\"150\" y2=\"164\"/><circle class=\"fillB\" cx=\"150\" cy=\"30\" r=\"8\"/><path class=\"ln\" d=\"M150 22a8 8 0 1 1 0 16 8 8 0 1 1 0-16z\"/><line class=\"th\" x1=\"150\" y1=\"40\" x2=\"150\" y2=\"80\"/><line class=\"th\" x1=\"150\" y1=\"44\" x2=\"120\" y2=\"96\"/><line class=\"th\" x1=\"150\" y1=\"44\" x2=\"180\" y2=\"96\"/><line class=\"th\" x1=\"120\" y1=\"100\" x2=\"120\" y2=\"150\"/><line class=\"th\" x1=\"180\" y1=\"100\" x2=\"180\" y2=\"150\"/><line class=\"th\" x1=\"120\" y1=\"152\" x2=\"106\" y2=\"164\"/><line class=\"th\" x1=\"180\" y1=\"152\" x2=\"194\" y2=\"164\"/></g><path class=\"th\" d=\"M150 20v-8\"/><path class=\"ln\" d=\"M150 12l-4 8h8z\" fill=\"currentColor\"/><text class=\"lblS\" x=\"14\" y=\"18\">superior</text><path class=\"th\" d=\"M150 170v8\"/><path class=\"ln\" d=\"M150 178l-4-8h8z\" fill=\"currentColor\"/><text class=\"lblS\" x=\"14\" y=\"186\">inferior</text><text class=\"lblS\" x=\"96\" y=\"110\">lateral</text><text class=\"lblS\" x=\"186\" y=\"110\">medial</text><text class=\"lblS\" x=\"70\" y=\"164\">distal</text><text class=\"lblS\" x=\"196\" y=\"164\">proximal</text><text class=\"lblS\" x=\"14\" y=\"110\">anterior / posterior apply the same way to a body in this position</text>",
    "viewBox": "0 0 320 196",
    "legend": [
     {
      "en": "every term is relative to the body itself, never to the person looking at it",
      "zh": "每一个术语都相对于身体本身，而不是相对于观看者"
     },
     {
      "en": "superior and inferior mean nearer the head and nearer the feet, not higher and lower on a page",
      "zh": "上与下的含义是更靠近头部与更靠近足部，而不是纸面上的高低"
     },
     {
      "en": "proximal and distal mean nearer the trunk and nearer the end of the limb",
      "zh": "近端与远端的含义是更靠近躯干与更靠近肢体的末端"
     }
    ],
    "caption": {
     "en": "The convention exists so that two people in different positions can describe the same movement identically. It is the shared reference that makes anatomical language usable.",
     "zh": "这套约定的存在，是为了让处在不同位置的两个人能对同一个动作做出完全相同的描述。它是让解剖学语言可用的共同参照。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The directional terms and their opposites",
     "zh": "方位术语及其反义词"
    },
    "cols": [
     {
      "en": "Term",
      "zh": "术语"
     },
     {
      "en": "Means",
      "zh": "含义"
     },
     {
      "en": "Opposite",
      "zh": "反义词"
     },
     {
      "en": "Example in sport",
      "zh": "运动中的例子"
     }
    ],
    "rows": [
     [
      {
       "en": "Superior / inferior",
       "zh": "上 / 下"
      },
      {
       "en": "Nearer the head / nearer the feet",
       "zh": "更靠近头部 / 更靠近足部"
      },
      {
       "en": "Inferior / superior",
       "zh": "下 / 上"
      },
      {
       "en": "The patella sits inferior to the hip joint",
       "zh": "髌骨位于髋关节的下方"
      }
     ],
     [
      {
       "en": "Anterior / posterior",
       "zh": "前 / 后"
      },
      {
       "en": "Front of the body / back of the body",
       "zh": "身体的前面 / 后面"
      },
      {
       "en": "Posterior / anterior",
       "zh": "后 / 前"
      },
      {
       "en": "Anterior cruciate ligament of the knee",
       "zh": "膝关节的前交叉韧带"
      }
     ],
     [
      {
       "en": "Medial / lateral",
       "zh": "内 / 外"
      },
      {
       "en": "Toward the midline / away from it",
       "zh": "朝向中线 / 远离中线"
      },
      {
       "en": "Lateral / medial",
       "zh": "外 / 内"
      },
      {
       "en": "Medial knee pain in a runner",
       "zh": "跑者的内侧膝痛"
      }
     ],
     [
      {
       "en": "Proximal / distal",
       "zh": "近 / 远"
      },
      {
       "en": "Nearer the trunk / nearer the end",
       "zh": "更靠近躯干 / 更靠近末端"
      },
      {
       "en": "Distal / proximal",
       "zh": "远 / 近"
      },
      {
       "en": "Distal radius fracture in a fall on the hand",
       "zh": "手撑地摔倒时的桡骨远端骨折"
      }
     ],
     [
      {
       "en": "Superficial / deep",
       "zh": "浅 / 深"
      },
      {
       "en": "Near the surface / away from it",
       "zh": "靠近表面 / 远离表面"
      },
      {
       "en": "Deep / superficial",
       "zh": "深 / 浅"
      },
      {
       "en": "Superficial veins versus deep vein thrombosis",
       "zh": "浅静脉与深静脉血栓"
      }
     ]
    ],
    "note": {
     "en": "The single most common error in sport science writing is using \"left\" and \"right\" without saying whose. Anatomical terms are universal precisely because they are not.",
     "zh": "运动科学写作中最常见的错误，是使用\"左\"与\"右\"却没有说明是谁的。解剖学术语之所以通用，正是因为它们不依赖观察者。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: writing a report that another clinician can use",
    "zh": "例题：写出一份另一位临床人员能用的报告"
   },
   "given": {
    "en": "A hurdler reports pain on the outer side of the knee, worse when running, and started it after a hamstring injury 8 weeks earlier.",
    "zh": "一名跨栏运动员报告膝外侧疼痛，跑步时加重，8 周前腘绳肌受伤后开始。"
   },
   "steps": [
    {
     "en": "Using body-relative terms: pain on the lateral side of the left knee.",
     "zh": "使用相对身体的术语：左膝外侧疼痛。"
    },
    {
     "en": "Adding a mechanism: during terminal swing, when the tibia externally rotates on a fixed femur.",
     "zh": "补充机制：在摆动末期，此时股骨固定、胫骨外旋。"
    },
    {
     "en": "Adding a timeline: 8 weeks ago, following a hamstring injury that limited hip flexion.",
     "zh": "补充时间线：8 周前，源于一次限制了屈髋的腘绳肌损伤。"
    },
    {
     "en": "Only now does the report suggest a mechanism, and the mechanism points at a different structure than the site of the pain.",
     "zh": "只有到这一步报告才提出了机制，而机制指向的结构与疼痛部位不同。"
    },
    {
     "en": "This is the ordinary payoff of the terminology: it changes what the next question should be.",
     "zh": "这就是这套术语的日常回报：它改变了下一个问题应该是什么。"
    }
   ],
   "answer": {
    "en": "Note that the pain is at the knee and the likely structure is at the hip. Language is what makes that inference checkable rather than a guess.",
    "zh": "注意疼痛在膝部，而可能有问题的结构在髋部。正是这套术语使那个推断可以被核查，而不是靠猜。"
   }
  }
 },
 "Planes, axes and movement": {
  "figures": [
   {
    "title": {
     "en": "Three planes, three axes, and why they matter",
     "zh": "三个平面、三条轴，以及它们为什么重要"
    },
    "svg": "<g><rect class=\"fillA\" x=\"14\" y=\"20\" width=\"88\" height=\"72\" rx=\"6\"/><path class=\"ln\" d=\"M14 20h88v72H14z\"/><path class=\"dash\" d=\"M20 88l76-60\"/><text class=\"lbl\" x=\"44\" y=\"60\">sagittal</text><text class=\"lblS\" x=\"24\" y=\"106\">flex / extend</text><text class=\"lblS\" x=\"20\" y=\"120\">lateral-medial axis</text></g><g><rect class=\"fillA\" x=\"116\" y=\"20\" width=\"88\" height=\"72\" rx=\"6\"/><path class=\"ln\" d=\"M116 20h88v72h-88z\"/><path class=\"dash\" d=\"M124 56h72\"/><text class=\"lbl\" x=\"146\" y=\"46\">frontal</text><text class=\"lblS\" x=\"122\" y=\"106\">abduct / add</text><text class=\"lblS\" x=\"118\" y=\"120\">antero-posterior axis</text></g><g><rect class=\"fillA\" x=\"218\" y=\"20\" width=\"88\" height=\"72\" rx=\"6\"/><path class=\"ln\" d=\"M218 20h88v72h-88z\"/><circle class=\"ln\" cx=\"262\" cy=\"56\" r=\"18\"/><path class=\"dash\" d=\"M244 56h36M262 38v36\"/><text class=\"lbl\" x=\"248\" y=\"60\">transverse</text><text class=\"lblS\" x=\"220\" y=\"106\">rotate</text><text class=\"lblS\" x=\"216\" y=\"120\">vertical axis</text></g><text class=\"lblS\" x=\"14\" y=\"152\">a movement belongs to the plane of the axis it turns about</text><text class=\"lblS\" x=\"14\" y=\"170\">and to the plane the bone moves within, which is the same plane for a hinge</text><text class=\"lblS\" x=\"14\" y=\"188\">most injuries happen when a segment moves in a plane the joint cannot move it in</text>",
    "viewBox": "0 0 320 196",
    "legend": [
     {
      "en": "flexion and extension occur in the sagittal plane about a lateral to medial axis",
      "zh": "屈与伸发生在矢状面，围绕外内轴"
     },
     {
      "en": "abduction and adduction occur in the frontal plane about an antero-posterior axis",
      "zh": "外展与内收发生在额状面，围绕前后轴"
     },
     {
      "en": "rotation occurs in the transverse plane about a vertical axis",
      "zh": "旋转发生在水平面，围绕垂直轴"
     }
    ],
    "caption": {
     "en": "The practical value is not exam vocabulary. It is that movement outside the plane a joint permits is a common description of sprains, and it tells a coach which movement to stop.",
     "zh": "它的实际价值不是考试词汇。而在于：关节不允许的平面上的运动，是扭伤的常见描述，它能告诉教练该停掉哪个动作。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Planes, axes and the movements in each",
     "zh": "平面、轴与各平面内的运动"
    },
    "cols": [
     {
      "en": "Plane",
      "zh": "平面"
     },
     {
      "en": "Axis of rotation",
      "zh": "旋转轴"
     },
     {
      "en": "Movements",
      "zh": "运动"
     },
     {
      "en": "Sport example",
      "zh": "运动例子"
     }
    ],
    "rows": [
     [
      {
       "en": "Sagittal",
       "zh": "矢状面"
      },
      {
       "en": "Lateral to medial",
       "zh": "由外向内"
      },
      {
       "en": "Flexion, extension",
       "zh": "屈、伸"
      },
      {
       "en": "Knee bend in a squat, sprinting stride",
       "zh": "深蹲中的屈膝、冲刺步幅"
      }
     ],
     [
      {
       "en": "Frontal",
       "zh": "额状面"
      },
      {
       "en": "Antero-posterior",
       "zh": "由前向后"
      },
      {
       "en": "Abduction, adduction",
       "zh": "外展、内收"
      },
      {
       "en": "Side steps, lateral lunges, high knee",
       "zh": "侧向移动、侧向弓步、高抬腿"
      }
     ],
     [
      {
       "en": "Transverse",
       "zh": "水平面"
      },
      {
       "en": "Vertical",
       "zh": "垂直"
      },
      {
       "en": "Rotation, horizontal flexion and extension",
       "zh": "旋转、水平屈伸"
      },
      {
       "en": "Spinal rotation in a golf swing, pivoting in football",
       "zh": "高尔夫挥杆中的躯干旋转、足球中的转身"
      }
     ]
    ],
    "note": {
     "en": "A joint may allow only one of these. The ankle is a hinge that flexes and extends, which is why an inversion injury is a sprain of a structure moving in a plane the joint does not permit.",
     "zh": "一个关节可能只允许其中一种。踝关节是只做屈伸的铰链关节，这正是内翻损伤属于\"在关节不允许的平面上运动\"的结构扭伤的原因。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: using the planes to explain an ankle sprain",
    "zh": "例题：用平面解释踝关节扭伤"
   },
   "given": {
    "en": "A footballer lands from a jump with the foot turned inward and the body rolling over it.",
    "zh": "一名足球运动员跳起落地时脚向内扣，身体压在上面。"
   },
   "steps": [
    {
     "en": "The foot has moved in the frontal plane, towards inversion — a movement the ankle does not permit as pure inversion while weight is on it.",
     "zh": "脚在额状面内移动，趋向内翻——而在承重状态下这是踝关节不允许的纯内翻运动。"
    },
    {
     "en": "The ligaments on the lateral side are stretched beyond their range, which is a sprain.",
     "zh": "外侧韧带被拉伸超出范围，这就是扭伤。"
    },
    {
     "en": "The ligaments resisting inversion sit on the lateral side, which is why the sprain is there and not on the other side.",
     "zh": "抵抗内翻的韧带位于外侧，所以扭伤发生在外侧而不是另一侧。"
    },
    {
     "en": "Prevention follows the plane: strengthen the peroneals to resist inversion, and train landing with the foot facing forward.",
     "zh": "预防也沿着这个平面：强化腓骨肌以抵抗内翻，并训练落地时脚尖朝前。"
    },
    {
     "en": "Taping and boots help because they restrict the movement in the plane where the injury occurs.",
     "zh": "肌贴与护具之所以有效，是因为它们限制了损伤发生的那一平面上的运动。"
    }
   ],
   "answer": {
    "en": "The same explanation predicts the treatment and the prevention, which is the test of whether an explanation is any good.",
    "zh": "同一个解释同时预测了处理与预防方案，而这也是判断一个解释是否成立的检验。"
   }
  }
 },
 "HL anthropometry and ergonomics": {
  "figures": [
   {
    "title": {
     "en": "Two athletes, one design, two problems",
     "zh": "两名运动员、一种设计、两个问题"
    },
    "svg": "<g><circle class=\"fillA\" cx=\"46\" cy=\"34\" r=\"9\"/><path class=\"ln\" d=\"M46 25a9 9 0 1 1 0 18 9 9 0 1 1 0-18z\"/><line class=\"th\" x1=\"46\" y1=\"44\" x2=\"46\" y2=\"96\"/><line class=\"th\" x1=\"46\" y1=\"50\" x2=\"26\" y2=\"80\"/><line class=\"th\" x1=\"46\" y1=\"50\" x2=\"66\" y2=\"80\"/><line class=\"th\" x1=\"26\" y1=\"82\" x2=\"26\" y2=\"116\"/><line class=\"th\" x1=\"66\" y1=\"82\" x2=\"66\" y2=\"116\"/><text class=\"lblS\" x=\"18\" y=\"136\">short + tall</text></g><g><rect class=\"fillA\" x=\"104\" y=\"112\" width=\"48\" height=\"16\" rx=\"4\"/><path class=\"ln\" d=\"M104 112h48v16h-48z\"/><text class=\"lblS\" x=\"110\" y=\"124\">bench</text><line class=\"dash\" d=\"M46 128h58\"/><text class=\"lblS\" x=\"72\" y=\"124\">feet dangle</text><path class=\"ln\" d=\"M46 128q14 8 0 8\"/></g><g><circle class=\"fillA\" cx=\"222\" cy=\"26\" r=\"9\"/><path class=\"ln\" d=\"M222 17a9 9 0 1 1 0 18 9 9 0 1 1 0-18z\"/><line class=\"th\" x1=\"222\" y1=\"36\" x2=\"222\" y2=\"100\"/><line class=\"th\" x1=\"222\" y1=\"42\" x2=\"202\" y2=\"76\"/><line class=\"th\" x1=\"222\" y1=\"42\" x2=\"242\" y2=\"76\"/><line class=\"th\" x1=\"202\" y1=\"78\" x2=\"202\" y2=\"116\"/><line class=\"th\" x1=\"242\" y1=\"78\" x2=\"242\" y2=\"116\"/><text class=\"lblS\" x=\"192\" y=\"136\">long + lean</text></g><g><rect class=\"fillA\" x=\"196\" y=\"112\" width=\"48\" height=\"16\" rx=\"4\"/><path class=\"ln\" d=\"M196 112h48v16h-48z\"/><text class=\"lblS\" x=\"200\" y=\"124\">bench</text><line class=\"dash\" d=\"M222 128h60\"/><text class=\"lblS\" x=\"248\" y=\"124\">knees high</text></g><text class=\"lblS\" x=\"14\" y=\"166\">ergonomics is the study of fitting the task to the person, not the person to the task</text><text class=\"lblS\" x=\"14\" y=\"184\">a fixed bench fits one and harms the other</text>",
    "viewBox": "0 0 320 194",
    "legend": [
     {
      "en": "anthropometry is the measurement of the body, and it is the input to every equipment decision",
      "zh": "人体测量是对身体的测量，而它是每一项装备决定的输入"
     },
     {
      "en": "ergonomics asks whether the equipment fits the person using it, rather than whether the person conforms",
      "zh": "人体工程学问的是装备是否适合使用者，而不是人是否迁就装备"
     },
     {
      "en": "a design that fits the average fails the people furthest from the average",
      "zh": "为平均身高设计的东西，会让偏离平均最远的人失败"
     }
    ],
    "caption": {
     "en": "This is the practical reason equipment is sized in ranges and adjustable, and the reason \"one size fits all\" is a design failure rather than a marketing convenience.",
     "zh": "这就是装备之所以按范围生产且可调节的实际原因，也是\"一个尺码适合所有人\"属于设计失败而非营销便利的原因。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The measurements that matter in equipment decisions",
     "zh": "装备决策中重要的测量"
    },
    "cols": [
     {
      "en": "Measurement",
      "zh": "测量项"
     },
     {
      "en": "What it determines",
      "zh": "它决定什么"
     },
     {
      "en": "Common design mistake",
      "zh": "常见设计错误"
     }
    ],
    "rows": [
     [
      {
       "en": "Stature",
       "zh": "身高"
      },
      {
       "en": "Bench and seat height, reach limits",
       "zh": "凳面与座椅高度、可及范围"
      },
      {
       "en": "Ignoring leg length, so feet dangle or knees lift",
       "zh": "忽视腿长，导致脚悬空或膝部抬高"
      }
     ],
     [
      {
       "en": "Sitting height",
       "zh": "坐高"
      },
      {
       "en": "Whether a bench back is needed at all",
       "zh": "是否需要靠背"
      },
      {
       "en": "Treating sitting height as a fraction of stature",
       "zh": "把坐高当作身高的固定比例"
      }
     ],
     [
      {
       "en": "Wing span and arm length",
       "zh": "臂展与臂长"
      },
      {
       "en": "Handle size, reach in a swing",
       "zh": "握把尺寸、挥拍可及范围"
      },
      {
       "en": "A handle too small, forcing a grip that fatigues",
       "zh": "握把过小，迫使采用会疲劳的握法"
      }
     ],
     [
      {
       "en": "Foot length and width",
       "zh": "足长与足宽"
      },
      {
       "en": "Footwear sizing, which is not one size",
       "zh": "鞋码，而这并非单一尺码"
      },
      {
       "en": "Sizing by length only, ignoring width",
       "zh": "只按长度分码，忽略宽度"
      }
     ],
     [
      {
       "en": "Centre of mass of the equipment",
       "zh": "器材的重心"
      },
      {
       "en": "Handling and swing weight",
       "zh": "操控与挥重"
      },
      {
       "en": "Shipping one balance to every user",
       "zh": "向所有使用者提供同一种配重"
      }
     ]
    ],
    "note": {
     "en": "Adjustable beats optimal. A bench that can be set for two body types is better than a fixed bench optimised for one, because the fixed one only works for that one.",
     "zh": "\"可调\"胜过\"最优\"。一张能为两种体型调节的凳子，胜过为一种体型优化固定的凳子——因为固定的那个只对那一种有效。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: choosing a bench height for a group",
    "zh": "例题：为一组人选择凳子高度"
   },
   "given": {
    "en": "Three athletes with sitting heights of 40, 46 and 52 cm need one bench for a jump drill.",
    "zh": "三名坐高分别为 40、46 和 52 厘米的运动员，需要同一张凳子做跳跃练习。"
   },
   "steps": [
    {
     "en": "A fixed bench can be right for one of them. The sitting heights span 12 cm.",
     "zh": "一张固定凳子只能对其中一人合适。三个坐高相差 12 厘米。"
    },
    {
     "en": "Setting it to 46 cm suits the middle athlete. The shortest athlete sits 6 cm high, feet unsupported.",
     "zh": "设为 46 厘米适合中间那位。最矮的那位坐着高出 6 厘米，脚无支撑。"
    },
    {
     "en": "For the tallest athlete, 52 cm means sitting 6 cm below ideal, and the hips flex more than they should.",
     "zh": "对最高的那位，52 厘米意味着比理想位置低 6 厘米，髋部屈曲超过应有角度。"
    },
    {
     "en": "An adjustable bench set per athlete, or a bench at the shortest height plus a foot platform, fixes all three.",
     "zh": "一张可逐人调节的凳子，或一张按最矮者设置并加脚踏板的凳子，可以同时解决三人。"
    },
    {
     "en": "The cost of the adjustable option is a few dollars and the cost of the fixed one is two injured athletes.",
     "zh": "可调方案的成本是几美元，而固定方案的成本是两名受伤的运动员。"
    }
   ],
   "answer": {
    "en": "The numbers here are trivial and the conclusion is not. Almost every equipment complaint in sport reduces to a mismatch that was never measured.",
    "zh": "这里的数字很简单，结论却不是。运动中几乎每一项关于装备的抱怨，都可以归结为一次从未被测量的不匹配。"
   }
  }
 },
 "Connective tissues and articulations": {
  "figures": [
   {
    "title": {
     "en": "Four tissues, four jobs",
     "zh": "四种组织，四种工作"
    },
    "svg": "<g><path class=\"fillA\" d=\"M14 20h64v34H14z\"/><path class=\"ln\" d=\"M14 20h64v34H14z\"/><text class=\"lbl\" x=\"26\" y=\"42\">bone</text><text class=\"lblS\" x=\"14\" y=\"66\">rigid, resists compression</text></g><g><path class=\"fillB\" x=\"86 20h64v34H86z\" d=\"M86 20h64v34H86z\"/><path class=\"ln\" d=\"M86 20h64v34H86z\"/><text class=\"lbl\" x=\"94\" y=\"42\">cartilage</text><text class=\"lblS\" x=\"86\" y=\"66\">smooth, no blood supply</text></g><g><path class=\"fillA\" d=\"M158 20h64v34h-64z\"/><path class=\"ln\" d=\"M158 20h64v34h-64z\"/><text class=\"lbl\" x=\"166\" y=\"42\">tendon</text><text class=\"lblS\" x=\"158\" y=\"66\">pull, unidirectional</text></g><g><path class=\"fillB\" d=\"M230 20h64v34h-64z\"/><path class=\"ln\" d=\"M230 20h64v34h-64z\"/><text class=\"lbl\" x=\"238\" y=\"42\">ligament</text><text class=\"lblS\" x=\"230\" y=\"66\">bone to bone, both ways</text></g><g><rect class=\"fillA\" x=\"14\" y=\"88\" width=\"280\" height=\"18\" rx=\"9\"/><path class=\"ln\" d=\"M14 97h280\"/><text class=\"lblS\" x=\"20\" y=\"122\">fibre type decides behaviour</text></g><text class=\"lblS\" x=\"14\" y=\"146\">collagen type I: dense regular tendon, resists unidirectional pull</text><text class=\"lblS\" x=\"14\" y=\"164\">collagen type II: cartilage, built for compression in a joint</text><text class=\"lblS\" x=\"14\" y=\"182\">the classification is a consequence of what each tissue is asked to do</text>",
    "viewBox": "0 0 320 192",
    "legend": [
     {
      "en": "tendon and ligament are both dense regular collagen and both resist pull, differing in what they join",
      "zh": "肌腱与韧带都是致密规则胶原、都抵抗牵拉，区别在于各自连接什么"
     },
     {
      "en": "cartilage has no blood supply of its own, which is why it is slow to repair and why feeding it means maintaining the joint",
      "zh": "软骨本身没有血供，因此修复缓慢，而\"供养\"它靠的是维持关节"
     },
     {
      "en": "bone is the only one of these that remodels reliably in response to load",
      "zh": "骨是这些组织中唯一能可靠响应负荷而重塑的"
     }
    ],
    "caption": {
     "en": "Naming a tissue tells you its time scale, and the time scale is what stops athletes expecting a tendon to behave like a muscle.",
     "zh": "说出组织类型就等于说出了它的时间尺度，而时间尺度正是阻止运动员期望肌腱像肌肉那样表现的东西。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The four connective tissues compared",
     "zh": "四种结缔组织对比"
    },
    "cols": [
     {
      "en": "Tissue",
      "zh": "组织"
     },
     {
      "en": "Joins",
      "zh": "连接"
     },
     {
      "en": "Collagen",
      "zh": "胶原"
     },
     {
      "en": "Vascular?",
      "zh": "有血供"
     },
     {
      "en": "Heals in",
      "zh": "愈合时间"
     }
    ],
    "rows": [
     [
      {
       "en": "Tendon",
       "zh": "肌腱"
      },
      {
       "en": "Muscle to bone",
       "zh": "肌肉到骨"
      },
      {
       "en": "Type I, dense regular",
       "zh": "I 型，致密规则"
      },
      {
       "en": "Poor",
       "zh": "差"
      },
      {
       "en": "Weeks to months",
       "zh": "数周到数月"
      }
     ],
     [
      {
       "en": "Ligament",
       "zh": "韧带"
      },
      {
       "en": "Bone to bone",
       "zh": "骨到骨"
      },
      {
       "en": "Type I, dense regular",
       "zh": "I 型，致密规则"
      },
      {
       "en": "Poor",
       "zh": "差"
      },
      {
       "en": "Weeks to months",
       "zh": "数周到数月"
      }
     ],
     [
      {
       "en": "Cartilage",
       "zh": "软骨"
      },
      {
       "en": "Bone to bone, with fluid",
       "zh": "骨到骨，之间有液膜"
      },
      {
       "en": "Type II",
       "zh": "II 型"
      },
      {
       "en": "None",
       "zh": "无"
      },
      {
       "en": "Very slow, often incomplete",
       "zh": "极慢，常不完全"
      }
     ],
     [
      {
       "en": "Bone",
       "zh": "骨"
      },
      {
       "en": "Bone to bone",
       "zh": "骨到骨"
      },
      {
       "en": "Type I, plus mineral",
       "zh": "I 型，加矿物质"
      },
      {
       "en": "Good",
       "zh": "好"
      },
      {
       "en": "Weeks, remodels for years",
       "zh": "数周，重塑持续数年"
      }
     ]
    ],
    "note": {
     "en": "Tendon and ligament are so similar in composition that calling an injury by its tissue tells you very little. Telling them apart requires knowing which joint and which direction.",
     "zh": "肌腱与韧带在成分上如此相似，以至于仅按组织来称呼损伤几乎没有信息量。要区分它们，必须知道是哪个关节、哪个方向。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: why the timeline differs by tissue",
    "zh": "例题：为什么时间尺度因组织而异"
   },
   "given": {
    "en": "A hamstring strain and a torn calf muscle are both \"soft tissue injuries\" at 4 weeks.",
    "zh": "一次腘绳肌拉伤与一次小腿肌肉撕裂，在第 4 周时都属于\"软组织损伤\"。"
   },
   "steps": [
    {
     "en": "The calf is muscle, with good blood supply, so it can gain strength early and is often ready before week 4.",
     "zh": "小腿是肌肉，血供良好，因此能较早恢复力量，常常在第 4 周之前就准备好。"
    },
    {
     "en": "The hamstring tendon is dense regular collagen with poor supply, so it remodels more slowly and needs longer.",
     "zh": "腘绳肌腱是致密规则胶原、血供差，因此重塑更慢、需要更久。"
    },
    {
     "en": "Both are graded I to III, and the grade predicts the muscle injury timeline far better than the tendon one.",
     "zh": "两者都分 I 到 III 级，而分级对肌肉损伤时间线的预测远好于对肌腱的预测。"
    },
    {
     "en": "So identical grade and identical week still mean different prognoses, and the difference is the tissue.",
     "zh": "所以相同的分级、相同的一周，仍意味着不同的预后，而差别就在组织。"
    },
    {
     "en": "The practical consequence is a different return-to-sport rule for each, not one rule for \"soft tissue\".",
     "zh": "实际推论是两者需要不同的回归标准，而不是对\"软组织\"用同一条规则。"
    }
   ],
   "answer": {
    "en": "Two injuries, same category, same week, different outlook. Almost every mistake in return-to-play planning comes from treating a category as though it were a tissue.",
    "zh": "两次损伤、同一类别、同一周、预后不同。回归计划中的几乎每一个错误，都来自把\"类别\"当成了\"组织\"。"
   }
  }
 },
 "Synovial structure and joint classes": {
  "figures": [
   {
    "title": {
     "en": "The parts of a synovial joint, and what each does",
     "zh": "滑膜关节的各部分及其作用"
    },
    "svg": "<circle class=\"fillA\" cx=\"150\" cy=\"86\" r=\"62\"/><path class=\"ln\" d=\"M150 24a62 62 0 1 1 0 124 62 62 0 1 1 0-124z\"/><circle class=\"fillC\" cx=\"150\" cy=\"86\" r=\"30\"/><path class=\"ln\" d=\"M150 56a30 30 0 1 1 0 60 30 30 0 1 1 0-60z\"/><line class=\"dash\" d=\"M150 86h130\"/><text class=\"lblS\" x=\"256\" y=\"82\">joint cavity</text><text class=\"lblS\" x=\"256\" y=\"96\">fluid film</text><path class=\"th\" d=\"M150 24v-8\"/><path class=\"ln\" d=\"M150 16l-4 8h8z\" fill=\"currentColor\"/><text class=\"lblS\" x=\"156\" y=\"14\">articular cartilage</text><path class=\"th\" d=\"M96 132l-40 26\"/><path class=\"ln\" d=\"M56 158l9-4.5-4.5-7z\" fill=\"currentColor\"/><text class=\"lblS\" x=\"14\" y=\"174\">joint capsule</text><text class=\"lblS\" x=\"14\" y=\"190\">ligament holds the two bones together</text><text class=\"lblS\" x=\"200\" y=\"146\">bone</text>",
    "viewBox": "0 0 320 200",
    "legend": [
     {
      "en": "cartilage covers the bone ends so they can slide without friction, and it has no blood supply",
      "zh": "软骨覆盖骨端，使其能低摩擦滑动，而它没有血供"
     },
     {
      "en": "the capsule and ligaments stop the joint from moving beyond its range",
      "zh": "关节囊与韧带阻止关节超出其活动范围"
     },
     {
      "en": "the cavity fluid spreads load and supplies nutrients to the cartilage indirectly",
      "zh": "腔内液体分散负荷，并间接向软骨提供营养"
     }
    ],
    "caption": {
     "en": "The class of joint decides how much it can move. A hinge moves in one plane, a ball and socket moves in three, and that is the mechanical fact behind every substitution decision.",
     "zh": "关节的类别决定它能移动多少。铰链关节在一个平面内活动，球窝关节在三个平面内活动，而这就是每一次换人决定背后的力学事实。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The joint classes and their freedom",
     "zh": "关节类别及其自由度"
    },
    "cols": [
     {
      "en": "Joint class",
      "zh": "关节类别"
     },
     {
      "en": "Planes of movement",
      "zh": "活动平面"
     },
     {
      "en": "Example",
      "zh": "例子"
     },
     {
      "en": "Stable?",
      "zh": "稳定吗"
     }
    ],
    "rows": [
     [
      {
       "en": "Hinge",
       "zh": "铰链"
      },
      {
       "en": "One, mainly flex and extend",
       "zh": "一个，主要是屈伸"
      },
      {
       "en": "Knee, elbow, finger joints",
       "zh": "膝、肘、手指关节"
      },
      {
       "en": "Very — inherently the most stable",
       "zh": "很——本身最稳定"
      }
     ],
     [
      {
       "en": "Pivot",
       "zh": "枢轴"
      },
      {
       "en": "One, rotation only",
       "zh": "一个，仅旋转"
      },
      {
       "en": "Neck, shoulder rotation component",
       "zh": "颈部、肩的旋转部分"
      },
      {
       "en": "Good",
       "zh": "良好"
      }
     ],
     [
      {
       "en": "Condyloid",
       "zh": "椭圆"
      },
      {
       "en": "Two, plus a limited glide",
       "zh": "两个，附加有限滑动"
      },
      {
       "en": "Wrist, knee in flexion",
       "zh": "腕、屈膝位的膝"
      },
      {
       "en": "Moderate",
       "zh": "中等"
      }
     ],
     [
      {
       "en": "Saddle",
       "zh": "鞍状"
      },
      {
       "en": "Two, with combined movement",
       "zh": "两个，含组合运动"
      },
      {
       "en": "Thumb, sternoclavicular",
       "zh": "拇指、胸锁关节"
      },
      {
       "en": "Moderate",
       "zh": "中等"
      }
     ],
     [
      {
       "en": "Gliding",
       "zh": "平面"
      },
      {
       "en": "Three, minimal glide",
       "zh": "三个，滑动幅度小"
      },
      {
       "en": "Carpal bones, ribs at the sternum",
       "zh": "腕骨、胸骨处的肋骨"
      },
      {
       "en": "Good",
       "zh": "良好"
      }
     ],
     [
      {
       "en": "Ball and socket",
       "zh": "球窝"
      },
      {
       "en": "All three, plus rotation",
       "zh": "全部三个，加旋转"
      },
      {
       "en": "Shoulder, hip",
       "zh": "肩、髋"
      },
      {
       "en": "Least — needs most muscle to hold",
       "zh": "最差——需要最多肌肉维持"
      }
     ]
    ],
    "note": {
     "en": "Stability and mobility are traded against each other, so the most mobile joint is also the one most dependent on muscle to stay in place.",
     "zh": "稳定性与活动度是彼此交换的，因此活动度最大的关节也是最依赖肌肉维持位置的关节。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: reading a dislocation from the joint class",
    "zh": "例题：从关节类别推断脱位"
   },
   "given": {
    "en": "A shoulder dislocation follows a fall on an outstretched arm in a rugby tackle.",
    "zh": "一次肩关节脱位发生于橄榄球擒抱中手臂伸直撑地摔倒。"
   },
   "steps": [
    {
     "en": "The shoulder is a ball and socket, the least stable class, so it relies on muscle rather than bone shape.",
     "zh": "肩是球窝关节，是最不稳定的类别，因此依靠肌肉而非骨性结构来维持。"
    },
    {
     "en": "An outstretched arm plus a fall drives the humerus down and forward, which is the direction of least resistance.",
     "zh": "伸直的手臂加上摔倒，把肱骨推向下方与前方，而那是阻力最小的方向。"
    },
    {
     "en": "The joint capsule is torn at the front, which is the usual site for an anterior dislocation.",
     "zh": "关节囊在前方撕裂，这是前脱位的常见部位。"
    },
    {
     "en": "Because stability depended on muscle, the first question after reduction is whether that muscle is intact and trained.",
     "zh": "由于稳定性依赖肌肉，复位之后的第一个问题是该肌肉是否完好、是否经过训练。"
    },
    {
     "en": "A shoulder with a repaired cuff should be treated very differently in the first weeks than one with a torn cuff.",
     "zh": "修复过肩袖的肩，脱位后最初几周的处理应与肩袖撕裂者明显不同。"
    }
   ],
   "answer": {
    "en": "The joint class alone predicted the mechanism, the direction of the injury and the first rehabilitation question. That is the payoff of classifying rather than memorising.",
    "zh": "仅凭关节类别就预测了损伤机制、损伤方向和康复的第一个问题。这就是\"分类\"胜过\"记忆\"的回报。"
   }
  }
 },
 "Mobility, stability and injury": {
  "figures": [
   {
    "title": {
     "en": "The trade-off between the two",
     "zh": "两者之间的权衡"
    },
    "svg": "<line class=\"th\" x1=\"30\" y1=\"140\" x2=\"304\" y2=\"140\"/><line class=\"ln\" x1=\"30\" y1=\"140\" x2=\"30\" y2=\"20\"/><path class=\"ln\" d=\"M30 60C70 70 110 96 160 124\"/><text class=\"lblS\" x=\"44\" y=\"52\">mobility</text><path class=\"ln\" d=\"M30 60C90 96 150 116 240 128\"/><text class=\"lblS\" x=\"150\" y=\"100\">stability</text><circle class=\"fillC\" cx=\"196\" cy=\"120\" r=\"9\"/><text class=\"lblS\" x=\"150\" y=\"164\">the useful zone is where both are adequate, not where either is maximal</text><text class=\"lblS\" x=\"30\" y=\"184\">shoulder: very mobile, needs most muscle · knee: less mobile, more bone-constrained</text>",
    "viewBox": "0 0 320 194",
    "legend": [
     {
      "en": "mobility is how much the joint can move, stability is how well it resists moving too far",
      "zh": "活动度是关节能动多少，稳定性是它抵抗过度移动的能力"
     },
     {
      "en": "they are traded, so maximising one reduces the other",
      "zh": "二者互相交换，因此最大化一个就会减少另一个"
     },
     {
      "en": "the goal is adequacy in both, which is what strength of the surrounding muscle delivers",
      "zh": "目标是两者都足够，而周围的肌肉力量正是实现这一点的途径"
     }
    ],
    "caption": {
     "en": "This is the mechanical reason progressive strength work is injury prevention. Strength is what converts available range into controlled range.",
     "zh": "这就是渐进力量训练属于伤病预防的力学原因。力量是把\"可用的活动度\"转化为\"可控的活动度\"的东西。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "What fails, and what protects each",
     "zh": "什么会失效，以及各自由什么保护"
    },
    "cols": [
     {
      "en": "Structure",
      "zh": "结构"
     },
     {
      "en": "Fails when",
      "zh": "何时失效"
     },
     {
      "en": "Protected by",
      "zh": "受什么保护"
     }
    ],
    "rows": [
     [
      {
       "en": "Ligament",
       "zh": "韧带"
      },
      {
       "en": "The joint is pushed past its range in an unexpected direction",
       "zh": "关节被推向其活动范围之外的方向"
      },
      {
       "en": "Muscle co-contraction, proprioception",
       "zh": "肌肉共同收缩、本体感觉"
      }
     ],
     [
      {
       "en": "Tendon",
       "zh": "肌腱"
      },
      {
       "en": "Load rises faster than the tissue can remodel",
       "zh": "负荷上升快于组织重塑"
      },
      {
       "en": "Progressive loading, adequate recovery",
       "zh": "渐进加载、充分恢复"
      }
     ],
     [
      {
       "en": "Cartilage",
       "zh": "软骨"
      },
      {
       "en": "Contact area is too small for the load",
       "zh": "接触面积相对负荷过小"
      },
      {
       "en": "Muscle around the joint, quadriceps",
       "zh": "关节周围肌肉，尤其是股四头肌"
      }
     ],
     [
      {
       "en": "Bone",
       "zh": "骨"
      },
      {
       "en": "Impact above its tolerance, or repetitive stress",
       "zh": "超出耐受的撞击，或重复性应力"
      },
      {
       "en": "Bone density, technique, protective equipment",
       "zh": "骨密度、技术、防护装备"
      }
     ],
     [
      {
       "en": "Muscle",
       "zh": "肌肉"
      },
      {
       "en": "Lengthening under high load, or eccentric overload",
       "zh": "高负荷下的拉长，或离心过载"
      },
      {
       "en": "Eccentric training, adequate protein",
       "zh": "离心训练、充足蛋白质"
      }
     ]
    ],
    "note": {
     "en": "Every row names a muscle somewhere in the protective column, which is not a coincidence. Muscle is the common factor in staying uninjured.",
     "zh": "每一行的\"受什么保护\"一栏里都出现了肌肉，这不是巧合。肌肉是\"不受伤\"这件事的共同因素。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: two athletes, one ankle, opposite problems",
    "zh": "例题：两名运动员、同一踝关节、相反的问题"
   },
   "given": {
    "en": "A ballet dancer has 45 degrees of dorsiflexion. A rugby full-back has 10.",
    "zh": "一名芭蕾舞者背屈 45 度。一名橄榄球边后卫背屈 10 度。"
   },
   "steps": [
    {
     "en": "The dancer is at the end of her range, so the ankle is stable but every movement is at the limit.",
     "zh": "舞者处于其活动度末端，因此踝关节稳定，但每个动作都在极限上。"
    },
    {
     "en": "The full-back has 10 degrees, so the joint is loose and depends on muscle to prevent inversion.",
     "zh": "边后卫只有 10 度，因此关节松弛、依赖肌肉来防止内翻。"
    },
    {
     "en": "A flexibility programme is correct for the full-back and pointless for the dancer.",
     "zh": "柔韧性训练对边后卫是正确的，对舞者则毫无意义。"
    },
    {
     "en": "A strengthening programme is correct for both, because strength is the only common protective factor.",
     "zh": "力量训练对两者都正确，因为力量是唯一共同的保护因素。"
    },
    {
     "en": "This is why a screening result is not an injury prediction, and why the same test points to opposite programmes.",
     "zh": "这就是为什么筛查结果不等于伤病预测，也为什么同一项测试会指向相反的训练方案。"
    }
   ],
   "answer": {
    "en": "The same test, two athletes, and the correct programme is opposite in each case. Screening identifies who needs a precaution; it does not say what the precaution is.",
    "zh": "同一项测试、两名运动员，而正确方案在两人身上恰好相反。筛查能识别出谁需要一道预防措施，但不会告诉你那道措施该是什么。"
   }
  }
 },
 "Motor units and fibre types": {
  "figures": [
   {
    "title": {
     "en": "One nerve, many fibres, one graded force",
     "zh": "一根神经、许多肌纤维、一个分级的力"
    },
    "svg": "<circle class=\"fillC\" cx=\"26\" cy=\"90\" r=\"9\"/><path class=\"ln\" d=\"M26 81a9 9 0 1 1 0 18 9 9 0 1 1 0-18z\"/><text class=\"lblS\" x=\"8\" y=\"116\">motor</text><text class=\"lblS\" x=\"8\" y=\"128\">neuron</text><path class=\"th\" d=\"M35 90h22\"/><path class=\"ln\" d=\"M57 90l-9-4.5v9z\" fill=\"currentColor\"/><g><circle class=\"fillA\" cx=\"72\" cy=\"70\" r=\"8\"/><circle class=\"fillA\" cx=\"72\" cy=\"90\" r=\"8\"/><circle class=\"fillA\" cx=\"72\" cy=\"110\" r=\"8\"/></g><g><circle class=\"fillA\" cx=\"94\" cy=\"70\" r=\"8\"/><circle class=\"fillA\" cx=\"94\" cy=\"90\" r=\"8\"/><circle class=\"fillA\" cx=\"94\" cy=\"110\" r=\"8\"/></g><g><circle class=\"fillB\" cx=\"116\" cy=\"70\" r=\"8\"/><circle class=\"fillB\" cx=\"116\" cy=\"90\" r=\"8\"/></g><g><circle class=\"fillC\" cx=\"138\" cy=\"70\" r=\"8\"/></g><text class=\"lblS\" x=\"62\" y=\"140\">more recruited at higher effort</text><rect class=\"fillA\" x=\"164\" y=\"24\" width=\"140\" height=\"30\" rx=\"5\"/><path class=\"ln\" d=\"M164 24h140v30H164z\"/><text class=\"lblS\" x=\"172\" y=\"43\">type I slow oxidative — first, last</text><rect class=\"fillB\" x=\"164\" y=\"62\" width=\"140\" height=\"30\" rx=\"5\"/><path class=\"ln\" d=\"M164 62h140v30H164z\"/><text class=\"lblS\" x=\"172\" y=\"81\">type IIa fast oxidative-glycolytic</text><rect class=\"fillC\" x=\"164\" y=\"100\" width=\"140\" height=\"30\" rx=\"5\"/><path class=\"ln\" d=\"M164 100h140v30h-140z\"/><text class=\"lblS\" x=\"172\" y=\"119\">type IIx fast glycolytic — power</text>",
    "viewBox": "0 0 320 150",
    "legend": [
     {
      "en": "a motor unit is one neuron plus the fibres it supplies, and they fire together as one unit",
      "zh": "一个运动单位是一个神经元及其支配的肌纤维，它们作为一个整体一同放电"
     },
     {
      "en": "force is graded by recruiting more units, not by making each fibre pull harder",
      "zh": "力是靠募集更多运动单位来分级的，而不是让每根纤维各自用力"
     },
     {
      "en": "units are recruited in order, so the slow ones are always available and the fast ones are reserved",
      "zh": "运动单位按顺序募集，因此慢型一直可用，快型被保留"
     }
    ],
    "caption": {
     "en": "Fatigue hits the fast units first, which is why power drops off before endurance does, and why the last third of a sprint looks like a different athlete.",
     "zh": "疲劳先打击快型单位，因此功率先于耐力下降，这也是为什么冲刺的最后三分之一看起来像是换了一位运动员。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Fibre types compared",
     "zh": "肌纤维类型对比"
    },
    "cols": [
     {
      "en": "Feature",
      "zh": "特征"
     },
     {
      "en": "Type I slow oxidative",
      "zh": "I 型 慢缩氧化"
     },
     {
      "en": "Type IIa fast oxidative-glycolytic",
      "zh": "IIa 型 快缩氧化糖酵解"
     },
     {
      "en": "Type IIx fast glycolytic",
      "zh": "IIx 型 快缩糖酵解"
     }
    ],
    "rows": [
     [
      {
       "en": "Contraction speed",
       "zh": "收缩速度"
      },
      {
       "en": "Slow",
       "zh": "慢"
      },
      {
       "en": "Fast",
       "zh": "快"
      },
      {
       "en": "Fastest",
       "zh": "最快"
      }
     ],
     [
      {
       "en": "Fatigability",
       "zh": "疲劳性"
      },
      {
       "en": "Highly fatigue resistant",
       "zh": "极耐疲劳"
      },
      {
       "en": "Moderate",
       "zh": "中等"
      },
      {
       "en": "Fatigues in seconds",
       "zh": "数秒即疲劳"
      }
     ],
     [
      {
       "en": "Fuel",
       "zh": "燃料"
      },
      {
       "en": "Fat and carbohydrate, aerobic",
       "zh": "脂肪与碳水，有氧"
      },
      {
       "en": "Both",
       "zh": "两者兼用"
      },
      {
       "en": "Carbohydrate, anaerobic",
       "zh": "碳水，无氧"
      }
     ],
     [
      {
       "en": "Power",
       "zh": "功率"
      },
      {
       "en": "Low",
       "zh": "低"
      },
      {
       "en": "High",
       "zh": "高"
      },
      {
       "en": "Highest",
       "zh": "最高"
      }
     ],
     [
      {
       "en": "Recruitment order",
       "zh": "募集顺序"
      },
      {
       "en": "First, always",
       "zh": "最先，始终"
      },
      {
       "en": "Second",
       "zh": "其次"
      },
      {
       "en": "Last, reserved",
       "zh": "最后，保留"
      }
     ],
     [
      {
       "en": "Primary sport",
       "zh": "主要项目"
      },
      {
       "en": "Marathon, rowing, cycling",
       "zh": "马拉松、赛艇、骑行"
      },
      {
       "en": "800 m, middle distance",
       "zh": "800 米、中距离"
      },
      {
       "en": "Weightlifting, 100 m, jumps",
       "zh": "举重、100 米、跳跃"
      }
     ]
    ],
    "note": {
     "en": "The order is not a preference, it is the size principle: smaller motor neurons are recruited first because they are more excitable.",
     "zh": "这个顺序不是偏好，而是大小原则：较小的运动神经元先被募集，因为它们更容易兴奋。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: why the last third of a sprint is different",
    "zh": "例题：为什么冲刺的最后三分之一不同"
   },
   "given": {
    "en": "A sprinter holds 95% of peak velocity for the first 100 m of 200 m, then falls to 70%.",
    "zh": "一名短跑运动员在 200 米的前 100 米保持 95% 的峰值速度，之后掉到 70%。"
   },
   "steps": [
    {
     "en": "The first 100 m is dominated by type IIx units, which have the highest power and the least fatigue resistance.",
     "zh": "前 100 米由 IIx 型单位主导，它功率最高而耐疲劳最差。"
    },
    {
     "en": "By 100 m those units are depleted, and only the slower units can be recruited to replace them.",
     "zh": "到 100 米时这些单位已经耗尽，只能募集较慢的单位来替代。"
    },
    {
     "en": "Type I units are still available, which is why the sprinter finishes rather than stops.",
     "zh": "I 型单位仍然可用，这正是这位运动员能\"冲完\"而不是\"停住\"的原因。"
    },
    {
     "en": "So the drop is a change in which tissue is doing the work, not simply a lack of will.",
     "zh": "因此这个下降是在做工作的组织发生了改变，而不只是意志不足。"
    },
    {
     "en": "Training that adds fast units early, and a taper that arrives fresh, both act on this same mechanism.",
     "zh": "早期增加快型单位的训练，以及以新鲜状态抵达的减量，都作用于同一个机制。"
    }
   ],
   "answer": {
    "en": "The fall in the final third is predictable from the fibre type alone, which is why it is a physiological feature of sprinting rather than a conditioning failure.",
    "zh": "最后三分之一的下降仅从纤维类型就可预测，因此它是短跑的一个生理特征，而不是体能不足。"
   }
  }
 },
 "Contractions and muscle interaction": {
  "figures": [
   {
    "title": {
     "en": "The three kinds of contraction, drawn by joint movement",
     "zh": "三种收缩，按关节是否移动来区分"
    },
    "svg": "<g><line class=\"ln\" x1=\"24\" y1=\"34\" x2=\"296\" y2=\"34\"/><path class=\"ln\" d=\"M60 34l-8-4v8zM236 34l8-4v8z\" fill=\"currentColor\"/><text class=\"lbl\" x=\"130\" y=\"28\">concentric</text><text class=\"lblS\" x=\"100\" y=\"50\">joint moves, muscle shortens</text></g><g><line class=\"ln\" x1=\"24\" y1=\"94\" x2=\"296\" y2=\"94\"/><circle class=\"acc\" cx=\"148\" cy=\"94\" r=\"7\"/><text class=\"lbl\" x=\"130\" y=\"88\">isometric</text><text class=\"lblS\" x=\"96\" y=\"110\">joint still, muscle works</text></g><g><line class=\"ln\" x1=\"24\" y1=\"154\" x2=\"296\" y2=\"154\"/><path class=\"ln\" d=\"M60 154l-8-4v8zM236 154l8-4v8z\" fill=\"currentColor\"/><circle class=\"warn\" cx=\"148\" cy=\"154\" r=\"7\"/><text class=\"lbl\" x=\"130\" y=\"148\">eccentric</text><text class=\"lblS\" x=\"84\" y=\"170\">joint moves, muscle lengthens</text></g><text class=\"lblS\" x=\"24\" y=\"192\">eccentric damage is delayed by a day or two, which is why it is missed at the time it happens</text>",
    "viewBox": "0 0 320 200",
    "legend": [
     {
      "en": "concentric: the muscle shortens as it pulls, and the joint moves towards the origin of the muscle",
      "zh": "向心：肌肉缩短同时发力，关节向肌肉起点的方向移动"
     },
     {
      "en": "isometric: force without a change in muscle length, so the joint does not move at all",
      "zh": "等长：发力而肌肉长度不变，因此关节完全不移动"
     },
     {
      "en": "eccentric: the muscle is lengthened by the load while still generating force, which is where injury happens",
      "zh": "离心：负荷使肌肉被拉长、同时仍在发力，损伤正发生在这里"
     }
    ],
    "caption": {
     "en": "The distinction is not academic, because eccentric work is both the most damaging and the most trainable of the three.",
     "zh": "这个区分不是学术性的，因为离心工作既是三者中最容易造成损伤的，也是最可训练的。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Muscle interaction patterns",
     "zh": "肌肉协同模式"
    },
    "cols": [
     {
      "en": "Pattern",
      "zh": "模式"
     },
     {
      "en": "What happens",
      "zh": "发生什么"
     },
     {
      "en": "Sport example",
      "zh": "运动例子"
     }
    ],
    "rows": [
     [
      {
       "en": "Agonist",
       "zh": "原动肌"
      },
      {
       "en": "The prime mover, which shortens",
       "zh": "主动完成动作的肌，缩短"
      },
      {
       "en": "Biceps in elbow flexion, quads in knee extension",
       "zh": "屈肘时的肱二头肌、伸膝时的股四头肌"
      }
     ],
     [
      {
       "en": "Antagonist",
       "zh": "拮抗肌"
      },
      {
       "en": "Opposes the agonist; relaxes, lengthens, or works eccentrically",
       "zh": "对抗原动肌；放松、拉长或做离心工作"
      },
      {
       "en": "Triceps during elbow flexion",
       "zh": "屈肘时的肱三头肌"
      }
     ],
     [
      {
       "en": "Synergist",
       "zh": "协同肌"
      },
      {
       "en": "Assists, stabilises, or cancels an unwanted component",
       "zh": "协助、稳定或抵消不需要的分量"
      },
      {
       "en": "Biceps and brachialis in flexion",
       "zh": "屈肘时的肱二头肌与肱肌"
      }
     ],
     [
      {
       "en": "Fixator",
       "zh": "固定肌"
      },
      {
       "en": "Stabilises the origin so the agonist has a fixed base",
       "zh": "稳定肌肉起点，使原动肌有固定基础"
      },
      {
       "en": "Scapular muscles during a press",
       "zh": "推举时的肩胛肌"
      }
     ]
    ],
    "note": {
     "en": "Most real movements use all four at once, and a coaching cue usually works by changing which one is doing the most work.",
     "zh": "大多数真实动作会同时用到这四类，而一条教练提示通常是通过改变\"哪一块在出最多力\"来起作用的。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: why the second half of a lift is the dangerous half",
    "zh": "例题：为什么举起动作的后半程才是危险的一半"
   },
   "given": {
    "en": "A 100 kg squat, failure at the bottom, then forced upward with a spotter.",
    "zh": "一次 100 公斤深蹲，在底部力竭，然后由保护者助力强行起身。"
   },
   "steps": [
    {
     "en": "The ascent is concentric: fast, powerful, and short.",
     "zh": "上升段是向心：快速、有力、短暂。"
    },
    {
     "en": "The descent and the catch at failure are eccentric: the muscle is lengthened while maximally loaded.",
     "zh": "下降段以及力竭后的承接是离心：肌肉在最大负荷下被拉长。"
    },
    {
     "en": "Eccentric loading causes the most structural damage per unit of work, and it is the least trained pattern.",
     "zh": "离心负荷每单位做功造成的结构损伤最大，而它恰恰是最少被训练的模式。"
    },
    {
     "en": "The symptom appears 24 to 48 hours later, so it is not attributed to the lift that caused it.",
     "zh": "症状在 24 到 48 小时后才出现，因此不会被归因于造成它的那次举起。"
    },
    {
     "en": "Prevention is eccentric training and not exceeding a load that cannot be controlled on the way down.",
     "zh": "预防方法是离心训练，以及不使用那些在下降过程中无法控制的重量。"
    }
   ],
   "answer": {
    "en": "The injury was caused on the way down and reported on the following day, and the intervening session is usually blamed. Almost every \"unexplained\" hamstring strain has this shape.",
    "zh": "损伤发生在下降过程中、并在第二天才报告，而中间的训练课通常被责怪。几乎每一次\"无法解释\"的腘绳肌拉伤都是这个形状。"
   }
  }
 },
 "Recruitment, adaptations and sliding filament": {
  "figures": [
   {
    "title": {
     "en": "Why a muscle gets stronger, drawn as overlapping causes",
     "zh": "肌肉为何变强：原因叠加图"
    },
    "svg": "<g><circle class=\"fillA\" cx=\"104\" cy=\"60\" r=\"42\"/><path class=\"ln\" d=\"M104 18a42 42 0 1 1 0 84 42 42 0 1 1 0-84z\"/><text class=\"lblS\" x=\"62\" y=\"56\">more</text><text class=\"lblS\" x=\"60\" y=\"68\">fibres</text></g><g><circle class=\"fillB\" cx=\"176\" cy=\"60\" r=\"42\"/><path class=\"ln\" d=\"M176 18a42 42 0 1 1 0 84 42 42 0 1 1 0-84z\"/><text class=\"lblS\" x=\"140\" y=\"56\">more</text><text class=\"lblS\" x=\"136\" y=\"68\">cross-section</text></g><g><circle class=\"fillC\" cx=\"140\" cy=\"108\" r=\"42\"/><path class=\"ln\" d=\"M140 66a42 42 0 1 1 0 84 42 42 0 1 1 0-84z\"/><text class=\"lblS\" x=\"104\" y=\"104\">better</text><text class=\"lblS\" x=\"102\" y=\"116\">organisation</text></g><circle class=\"fillC\" cx=\"140\" cy=\"76\" r=\"14\"/><text class=\"lbl\" x=\"134\" y=\"81\">force</text><g><line class=\"th\" x1=\"24\" y1=\"24\" x2=\"24\" y2=\"164\"/><text class=\"lblS\" x=\"14\" y=\"182\">time →</text></g><text class=\"lblS\" x=\"212\" y=\"46\">neural change, days</text><text class=\"lblS\" x=\"212\" y=\"70\">hypertrophy, weeks</text><text class=\"lblS\" x=\"212\" y=\"120\">fibre type shift, months</text>",
    "viewBox": "0 0 320 194",
    "legend": [
     {
      "en": "the fastest adaptation is neural, which is why an untrained lifter improves in the first week",
      "zh": "最快的适应是神经性的，这正是未训练者在第一周就有提升的原因"
     },
     {
      "en": "hypertrophy adds cross-sectional area, so force rises with the square of the radius",
      "zh": "肌肥大增加横截面积，因此力随半径的平方上升"
     },
     {
      "en": "fibre type shift happens last and is the reason a sprinter converts to endurance slowly",
      "zh": "纤维类型转变最晚发生，这也是短跑运动员向耐力项目转变很慢的原因"
     }
    ],
    "caption": {
     "en": "Sliding filament is the mechanism; everything else is a consequence of how often and how hard it is repeated.",
     "zh": "肌丝滑动是机制；其余一切都是它被重复得多久、多么用力的结果。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "Adaptations and their timescales",
     "zh": "各种适应及其时间尺度"
    },
    "cols": [
     {
      "en": "Adaptation",
      "zh": "适应"
     },
     {
      "en": "Timescale",
      "zh": "时间尺度"
     },
     {
      "en": "Reverses quickly?",
      "zh": "恢复快吗"
     },
     {
      "en": "Gained by",
      "zh": "通过什么获得"
     }
    ],
    "rows": [
     [
      {
       "en": "Neural drive",
       "zh": "神经驱动"
      },
      {
       "en": "Days",
       "zh": "数天"
      },
      {
       "en": "Yes, within a fortnight",
       "zh": "是，两周内"
      },
      {
       "en": "Any practice, even poor",
       "zh": "任何练习，即使质量差"
      }
     ],
     [
      {
       "en": "Cross-sectional area",
       "zh": "横截面积"
      },
      {
       "en": "Weeks to months",
       "zh": "数周到数月"
      },
      {
       "en": "Partly, over months",
       "zh": "部分，数月"
      },
      {
       "en": "Progressive overload",
       "zh": "渐进负荷"
      }
     ],
     [
      {
       "en": "Fibre type shift",
       "zh": "纤维类型转变"
      },
      {
       "en": "Months to years",
       "zh": "数月到数年"
      },
      {
       "en": "Slowly",
       "zh": "慢"
      },
      {
       "en": "Sustained training of the matching kind",
       "zh": "相应类型的持续训练"
      }
     ],
     [
      {
       "en": "Tendon stiffness",
       "zh": "肌腱刚度"
      },
      {
       "en": "Weeks",
       "zh": "数周"
      },
      {
       "en": "Partly",
       "zh": "部分"
      },
      {
       "en": "Heavy loading, adequate rest",
       "zh": "大负荷、充分休息"
      }
     ],
     [
      {
       "en": "Capillarisation",
       "zh": "毛细血管化"
      },
      {
       "en": "Weeks to months",
       "zh": "数周到数月"
      },
      {
       "en": "Yes, fairly quickly",
       "zh": "是，比较快"
      },
      {
       "en": "Endurance work",
       "zh": "耐力训练"
      }
     ]
    ],
    "note": {
     "en": "Early gains are neural and therefore cheap and fast. This is why the first month of any programme feels excellent and the third month feels like nothing is happening.",
     "zh": "早期的提升是神经性的，因此便宜又快速。这就是为什么任何计划的第一个月感觉极好、而第三个月感觉像什么也没发生。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: reading a plateau honestly",
    "zh": "例题：诚实地解读一次停滞"
   },
   "given": {
    "en": "A lifter adds 10 kg to the squat and improves for 8 weeks, then stalls for 5 weeks with no change.",
    "zh": "一名举重者给深蹲加了 10 公斤，提升持续 8 周，然后停滞 5 周没有变化。"
   },
   "steps": [
    {
     "en": "The first 8 weeks were probably neural, and the plateau is where the slower adaptations begin to matter.",
     "zh": "前 8 周很可能是神经性的，而停滞正是较慢的适应开始起作用的时候。"
    },
    {
     "en": "Five weeks is not long enough to conclude the programme has failed.",
     "zh": "5 周还不足以断定这个计划已经失败。"
    },
    {
     "en": "The correct response is to check recovery and to change one variable, not to add volume.",
     "zh": "正确的应对是检查恢复情况并改变一个变量，而不是增加训练量。"
    },
    {
     "en": "Adding volume to a stalled lifter is the most common cause of a plateau becoming an injury.",
     "zh": "给处于停滞的举重者增加训练量，是停滞演变成伤病最常见的原因。"
    },
    {
     "en": "If the check shows poor sleep and low intake, the answer is fuelling, not programming.",
     "zh": "如果检查发现睡眠差、摄入低，那么答案是补糖，而不是调整训练计划。"
    }
   ],
   "answer": {
    "en": "A five-week plateau after eight weeks of progress is a normal part of a cycle. The decision to add volume at that point is what turns a plateau into a problem.",
    "zh": "在 8 周进步之后的 5 周停滞，是一个周期中正常的部分。正是在那个点上决定增加训练量，才会把停滞变成问题。"
   }
  }
 },
 "Components and lever classes": {
  "figures": [
   {
    "title": {
     "en": "A lever, and the three classes it comes in",
     "zh": "一个杠杆，以及它所属的三个类别"
    },
    "svg": "<g><line class=\"th\" d=\"M40 24v136\"/><path class=\"ln\" d=\"M40 150h84\"/><circle class=\"warn\" cx=\"40\" cy=\"156\" r=\"6\"/><text class=\"lblS\" x=\"20\" y=\"176\">pivot</text><path class=\"th\" d=\"M60 60h120\"/><text class=\"lbl\" x=\"112\" y=\"52\">effort</text><rect class=\"fillA\" x=\"172\" y=\"52\" width=\"26\" height=\"16\" rx=\"3\"/><path class=\"ln\" d=\"M172 52h26v16h-26z\"/><text class=\"lblS\" x=\"168\" y=\"82\">load</text><path class=\"th\" d=\"M40 60h20\"/><text class=\"lblS\" x=\"20\" y=\"46\">r1</text><path class=\"th\" d=\"M40 60h140\"/><text class=\"lblS\" x=\"100\" y=\"44\">r2</text></g><g><text class=\"lblS\" x=\"14\" y=\"192\">advantage = effort arm / load arm · a third-class lever always has an advantage below 1</text></g>",
    "viewBox": "0 0 320 200",
    "legend": [
     {
      "en": "three things define any lever: the pivot, the effort and the load, plus the two arms they sit on",
      "zh": "定义任何杠杆的有三样东西：支点、动力与阻力，以及它们所处的两条杠杆臂"
     },
     {
      "en": "mechanical advantage is the ratio of the two arms, and it is the whole story of leverage in sport",
      "zh": "机械优势是两条杠杆臂之比，而这就是运动中杠杆效应的全部"
     },
     {
      "en": "a third-class lever is the commonest in the body and it is always a disadvantage at the joint",
      "zh": "第三类杠杆在人体中最常见，而在关节处它总是劣势"
     }
    ],
    "caption": {
     "en": "Every joint in the body is a lever, and the class it belongs to decides whether the muscle there has a mechanical advantage or needs to be very strong to move the limb.",
     "zh": "人体的每一个关节都是杠杆，而它属于哪一类，决定了那里的肌肉是拥有机械优势、还是需要非常强才能带动肢体。"
    }
   }
  ],
  "tables": [
   {
    "title": {
     "en": "The three lever classes",
     "zh": "三个杠杆类别"
    },
    "cols": [
     {
      "en": "Class",
      "zh": "类别"
     },
     {
      "en": "Pivot position",
      "zh": "支点位置"
     },
     {
      "en": "Advantage",
      "zh": "机械优势"
     },
     {
      "en": "Body example",
      "zh": "人体例子"
     }
    ],
    "rows": [
     [
      {
       "en": "First",
       "zh": "第一类"
      },
      {
       "en": "Between effort and load",
       "zh": "在动力与阻力之间"
      },
      {
       "en": "Can be above or below 1",
       "zh": "可大于或小于 1"
      },
      {
       "en": "Atlanto-occipital extension, ankle plantarflexion",
       "zh": "枕寰伸展、踝跖屈"
      }
     ],
     [
      {
       "en": "Second",
       "zh": "第二类"
      },
      {
       "en": "Beyond the load, effort in the middle",
       "zh": "在阻力之外，动力居中"
      },
      {
       "en": "Always below 1",
       "zh": "始终小于 1"
      },
      {
       "en": "Elbow flexion with the biceps, rising on tiptoe",
       "zh": "肱二头肌屈肘、踮脚起身"
      }
     ],
     [
      {
       "en": "Third",
       "zh": "第三类"
      },
      {
       "en": "Beyond the effort",
       "zh": "在动力之外"
      },
      {
       "en": "Always below 1",
       "zh": "始终小于 1"
      },
      {
       "en": "Biceps in elbow extension, quadriceps in knee extension",
       "zh": "伸肘时的肱二头肌、伸膝时的股四头肌"
      }
     ]
    ],
    "note": {
     "en": "Most joints have muscles from more than one class attached, which is why a single-joint problem is rare and a strength problem is usually distributed.",
     "zh": "大多数关节都附着来自不止一个类别的肌肉，这正是单一关节的问题很少见、而力量问题通常是分散的原因。"
    }
   }
  ],
  "example": {
   "title": {
    "en": "Worked example: why quadriceps strength is so disproportionate",
    "zh": "例题：为什么股四头肌力量如此不成比例"
   },
   "given": {
    "en": "To extend the knee against a load held at the ankle, the quadriceps act across a small moment arm.",
    "zh": "要对抗握在踝部的负荷伸膝，股四头肌必须跨越一个很小的力臂。"
   },
   "steps": [
    {
     "en": "The knee extensor moment arm is roughly 3 to 5 cm, which is short.",
     "zh": "膝伸肌的力臂约为 3 到 5 厘米，很短。"
    },
    {
     "en": "A load of 20 kg held at the ankle creates a moment of about 20 x 9.8 x 0.04 = 7.8 N·m.",
     "zh": "踝部 20 公斤的负荷产生约 20 x 9.8 x 0.04 = 7.8 牛顿·米的力矩。"
    },
    {
     "en": "The quadriceps must produce that moment with a mechanical advantage well below 1, so the muscle force required is several times the load.",
     "zh": "股四头肌必须在机械优势远小于 1 的情况下产生该力矩，因此所需的肌力是负荷的数倍。"
    },
    {
     "en": "This is why quadriceps strength is a large fraction of total leg strength, and why it is the first thing lost after a knee injury.",
     "zh": "这就是为什么股四头肌力量占腿部总力量很大一部分，也为什么它是膝伤后最先失去的。"
    },
    {
     "en": "It is also why the load must be kept close to the joint: moving it out to the toes multiplies the required force.",
     "zh": "这也是为什么负荷必须靠近关节：把它移到脚尖会成倍增加所需力。"
    }
   ],
   "answer": {
    "en": "The knee extensor is a third-class lever, so the muscle has to be several times stronger than the load it moves. Every knee rehabilitation programme is really a conversation about that ratio.",
    "zh": "膝伸肌是第三类杠杆，因此肌肉必须比它所移动的负荷强数倍。每一个膝关节康复方案本质上都是关于这个比值的对话。"
   }
  }
 }
};
if(window.IB_VISUALS&&window.IB_VISUALS.shake){try{window.dispatchEvent(new Event('shake'))}catch(e){}}

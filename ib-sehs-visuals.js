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
 }
};
if(window.IB_VISUALS&&window.IB_VISUALS.shake){try{window.dispatchEvent(new Event('shake'))}catch(e){}}

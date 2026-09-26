/* ═══ Checkup — body-part symptom triage (infirmary) ═══
   Education only. Never a medical diagnosis.
   Cached-pinned ?v=1. Bilingual EN/ZH.
   Flow: 1) body part 2) tick symptoms + three quick questions 3) guidance.
   Guidance for listed symptoms comes from the rule engine (checkup-rules.js),
   not the AI. Ticking "Other" and describing it sends the case to the AI.
   Live scan / photo = AI vision shortcut to the body part (fail-soft to map).
   Worker: https://api.vitaliteplan.com  ({question,lang} -> {reply}) */

(function(){
'use strict';

var MEDAI_URL='https://api.vitaliteplan.com';
var CHECKUP_KEY='vitalite_checkup_v1';

/* ── i18n ── */
function lang(){ try{ return localStorage.getItem('sm_lang')==='zh'?'zh':'en'; }catch(e){ return 'en'; } }
function T(en,zh){ return lang()==='zh'?zh:en; }

/* ── Guard: total pain points (mimics villain's horror) ── */
var RED_FLAGS=[
  {en:'Severe, uncontrolled bleeding',zh:'无法控制的严重出血'},
  {en:'A bone visibly out of place or misshapen',zh:'骨骼明显错位或变形'},
  {en:'Numbness, tingling, or loss of feeling below the injury',zh:'伤处以下麻木、刺痛或失去知觉'},
  {en:'Inability to move the joint or bear weight at all',zh:'完全无法活动关节或承重'},
  {en:'A head injury followed by confusion, vomiting, or unequal pupils',zh:'头部受伤后出现意识模糊、呕吐或瞳孔不等大'},
  {en:'Breathlessness or chest pain after injury',zh:'受伤后出现呼吸急促或胸痛'},
  {en:'Pain that came on with no injury and won\u2019t ease',zh:'无明显外伤却持续加重的疼痛'}
];

/* ── Body parts + candidate symptoms ── */
var PARTS=[
 {id:'head', icon:'🧠', en:'Head', zh:'头部',
  sym:[['Headache or a feeling of pressure','头痛或头部压迫感'],
       ['Dizziness or light-headedness','头晕或眼前发黑'],
       ['Blurry vision or photo-sensitivity','视力模糊或畏光'],
       ['Nausea / vomiting after a hit','撞击后恶心或呕吐'],
       ['A bump or swelling where hit','受伤处肿胀或鼓包']]},
 {id:'neck', icon:'💆', en:'Neck', zh:'颈部',
  sym:[['Stiffness or trouble turning the head','颈部僵硬或转头困难'],
       ['Sharp pain when moving','活动时刺痛'],
       ['Pain that spreads to shoulder or arm','疼痛放射到肩部或手臂'],
       ['Headache coming from the neck','由颈部引起的头痛'],
       ['Numbness or tingling in the arm/hand','手臂或手麻木、刺痛']]},
 {id:'shoulder', icon:'🏋️', en:'Shoulder', zh:'肩部',
  sym:[['Pain raising the arm overhead','抬臂过顶时疼痛'],
       ['Aching at night / on the outside of the arm','夜间或手臂外侧酸痛'],
       ['Clicking, popping, or grinding','咔哒、弹响或摩擦感'],
       ['Weakness lifting or pushing','推举无力'],
       ['Bruising or deformity after a fall','摔倒后淤青或变形']]},
 {id:'elbow', icon:'💪', en:'Elbow', zh:'肘部',
  sym:[['Pain on the outer side when gripping or twisting','抓握或扭转时外侧疼痛'],
       ['Pain on the inner side (golfer\u2019s area)','内侧疼痛（高尔夫球肘区域）'],
       ['Stiffness locking or catching','僵硬卡住或弹响'],
       ['Swelling after a direct blow','直接撞击后肿胀']]},
 {id:'wrist', icon:'✋', en:'Wrist', zh:'手腕',
  sym:[['Pain twisting the palm or wrist','转动手掌或手腕时疼痛'],
       ['Swelling or tenderness on thumb side','拇指侧肿胀或压痛'],
       ['Weak grip / dropping things','握力减弱或拿不住东西'],
       ['Wrist pain that is worse at night / typing','夜间或打字时加重']]},
 {id:'hand', icon:'🖐️', en:'Hand / Fingers', zh:'手 / 手指',
  sym:[['Pain or swelling in a joint / finger','关节或手指疼痛肿胀'],
       ['A finger locked or bent oddly','手指卡住或变形弯曲'],
       ['Numbness or tingling in fingers','手指麻木或刺痛'],
       ['Weak grip','握力下降']]},
 {id:'chest', icon:'🫀', en:'Chest / Ribs', zh:'胸部 / 肋骨',
  sym:[['Pain when breathing or coughing','呼吸或咳嗽时疼痛'],
       ['Tenderness over a rib after a hit','撞击后肋骨处压痛'],
       ['Sharp pain when twisting','扭转时刺痛'],
       ['Pain with deep breath','深呼吸时疼痛']]},
 {id:'abdomen', icon:'🫃', en:'Abdomen', zh:'腹部',
  sym:[['Cramping or aching','痉挛或隐痛'],
       ['Sharp pain with movement','活动时剧烈疼痛'],
       ['Bloating or tenderness to touch','腹胀或按压痛'],
       ['Nausea','恶心']]},
 {id:'upperback', icon:'🦴', en:'Upper Back', zh:'上背部',
  sym:[['Pain between the shoulder blades','肩胛骨之间疼痛'],
       ['Muscle knot / spasm','肌肉结节或痉挛'],
       ['Pain that gets worse sitting at a desk','久坐时加重'],
       ['Limited range twisting the torso','扭转躯干受限']]},
 {id:'lowerback', icon:'🦴', en:'Lower Back', zh:'下背部',
  sym:[['Aching or stiffness after sitting / lifting','久坐或搬运后酸痛僵硬'],
       ['Sharp pain when bending forward','弯腰时刺痛'],
       ['Pain that travels into the buttock or leg','疼痛放射到臀部或腿部'],
       ['Muscle spasm locking you up','肌肉痉挛导致活动受限']]},
 {id:'hip', icon:'🦵', en:'Hip', zh:'髋部',
  sym:[['Pain on the outside of the hip when lying on it','侧卧时髋外侧疼痛'],
       ['Stiffness in the morning','晨起僵硬'],
       ['Groin pain with squatting','下蹲时腹股沟疼痛'],
       ['Clicking in the hip joint','髋关节弹响']]},
 {id:'thigh', icon:'🦵', en:'Thigh', zh:'大腿',
  sym:[['A pulled / strained muscle (hamstring)','腘绳肌拉伤'],
       ['A bruise from a direct hit (contusion)','直接撞击导致的淤伤'],
       ['Tightness or cramping','僵硬或抽筋'],
       ['Swelling or tenderness','肿胀或压痛']]},
 {id:'knee', icon:'🦿', en:'Knee', zh:'膝盖',
  sym:[['Pain in / around the kneecap (runners)','膝盖前侧或周围疼痛（跑步膝）'],
       ['Swelling after twisting','扭伤后肿胀'],
       ['A \u2018give way\u2019 / buckling feeling','膝盖发软或打弯'],
       ['Clicking or catching when bending','弯曲时弹响或卡住'],
       ['Locking \u2014 knee stuck bent or straight','膝盖卡住无法伸直或弯曲']]},
 {id:'shin', icon:'🦵', en:'Shin / Calf', zh:'小腿',
  sym:[['Shin pain along the inner edge (shin splints)','胫骨内侧疼痛（胫骨疲劳）'],
       ['Calf pain when running or going upstairs','跑步或上楼时小腿疼痛'],
       ['Tight, swollen calf after a long session','长时间运动后小腿肿胀僵硬'],
       ['Pain that eases with warm-up but returns','热身后缓解但又复发']]},
 {id:'ankle', icon:'🦶', en:'Ankle', zh:'脚踝',
  sym:[['Swelling over the outer ankle','脚踝外侧肿胀'],
       ['Pain rolling the ankle inward','脚踝内翻时疼痛'],
       ['Bruising that appears within hours','数小时内出现淤青'],
       ['Unable to put weight on it','无法承重'],
       ['Repeatedly \u2018turning\u2019 the ankle','反复崴脚']]},
 {id:'foot', icon:'🦶', en:'Foot', zh:'足部',
  sym:[['Pain in the ball of the foot or toes','足前掌或脚趾疼痛'],
       ['Heel pain in the morning (plantar)','晨起脚后跟疼痛（足底）'],
       ['Arch pain when on your feet','站立时足弓疼痛'],
       ['A sore that won\u2019t heal or numbness','久不愈合的伤口或麻木']]}
];

var PART_MAP={};
PARTS.forEach(function(p){ PART_MAP[p.id]=p; });

/* ── The body map: an anatomical front/back silhouette with hot zones ── */
/* One half-contour (viewer's right side, crown → crotch) is mirrored into the
   full outline; zones are plain shapes clipped to that outline, so every hot
   area follows the real body edge instead of a box. viewBox 0 0 240 520. */
var HALF=[
  [120,8],
  [[131,8],[141,16],[142,30]],[[143,38],[142,46],[140,52]],[[139,60],[136,66],[132,70]],
  [[131,75],[131,80],[133,85]],[[139,90],[151,92],[161,95]],[[172,98],[179,106],[180,119]],
  [[181,133],[183,147],[184,160]],[[185,170],[186,178],[188,186]],[[191,202],[193,222],[194,240]],
  [[194,246],[195,252],[196,256]],[[200,262],[203,272],[202,284]],[[201,293],[198,299],[193,300]],
  [[189,301],[186,296],[186,288]],[[185,280],[184,272],[182,266]],[[180,262],[179,258],[179,252]],
  [[177,236],[175,216],[173,198]],[[172,190],[171,184],[169,176]],[[167,160],[165,146],[163,134]],
  [[162,128],[160,124],[157,122]],[[157,140],[156,158],[153,176]],[[151,186],[150,196],[151,206]],
  [[153,220],[161,236],[163,254]],[[164,272],[163,292],[160,316]],[[157,334],[154,352],[152,366]],
  [[151,376],[151,384],[152,392]],[[155,408],[156,424],[153,442]],[[150,460],[147,474],[146,486]],
  [[147,492],[150,497],[156,500]],[[162,503],[161,508],[153,509]],[[144,510],[135,510],[132,506]],
  [[130,500],[131,492],[132,484]],[[133,466],[132,448],[132,430]],[[132,414],[130,400],[131,388]],
  [[132,374],[132,360],[131,344]],[[129,320],[127,298],[125,286]],[[124,282],[122,280],[120,279]]
];
function bodyPath(){
  function f(p){ return p[0]+','+p[1]; }
  function m(p){ return [240-p[0],p[1]]; }
  var d='M'+f(HALF[0]), i;
  for(i=1;i<HALF.length;i++) d+=' C'+f(HALF[i][0])+' '+f(HALF[i][1])+' '+f(HALF[i][2]);
  for(i=HALF.length-1;i>=1;i--){
    var prev=i===1?HALF[0]:HALF[i-1][2];
    d+=' C'+f(m(HALF[i][1]))+' '+f(m(HALF[i][0]))+' '+f(m(prev));
  }
  return d+' Z';
}
/* mirror a path's x coords (absolute commands only) */
function mirrorD(d){ return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,function(_,x,y){ return (240-(+x))+','+y; }); }
function both(d){ return d+' '+mirrorD(d); }
function R(x,y,w,h){ return 'M'+x+','+y+' L'+(x+w)+','+y+' L'+(x+w)+','+(y+h)+' L'+x+','+(y+h)+' Z'; }
function E(cx,cy,rx,ry){ return 'M'+(cx-rx)+','+cy+' A'+rx+' '+ry+' 0 1 0 '+(cx+rx)+','+cy+' A'+rx+' '+ry+' 0 1 0 '+(cx-rx)+','+cy+' Z'; }

/* zones: [part, path]. Later entries paint over earlier ones. */
var ZONES_COMMON=[
  ['head',R(88,0,64,71)],
  ['neck',R(100,71,40,22)],
  ['hip',R(74,236,92,56)],
  ['thigh',R(74,292,92,82)],
  ['knee',R(74,374,92,34)],
  ['shin',R(74,408,92,74)],
  ['ankle',R(74,482,92,15)],
  ['foot',R(74,497,92,20)],
  ['shoulder',both(E(166,112,18,22)+' '+R(161,118,30,32))],
  ['elbow',both(R(160,150,40,48))],
  ['wrist',both(R(164,198,42,64))],
  ['hand',both(R(168,262,44,50))]
];
var ZONES={
  front:[['chest',R(78,93,84,85)],['abdomen',R(78,178,84,58)]].concat(ZONES_COMMON),
  back:[['upperback',R(78,93,84,97)],['lowerback',R(78,190,84,46)]].concat(ZONES_COMMON)
};
/* anatomy contour lines, drawn over the zones, never clickable */
var LINES={
  front:[
    both('M121,95 C133,99 146,97 157,100'),                 /* clavicles */
    both('M130,77 C127,85 124,90 122,95'),                  /* sternocleidomastoid */
    both('M121,147 C133,153 147,151 155,138'),              /* pectorals */
    both('M160,98 C166,110 168,124 166,137'),               /* deltoid edge */
    'M120,150 L120,228',                                    /* linea alba */
    both('M121,176 C126,177 131,177 135,175')+' '+both('M121,194 C126,195 131,195 135,193'),
    both('M139,226 C133,244 127,258 122,272'),              /* inguinal line */
    both('M141,300 C139,318 138,338 139,356'),              /* quadriceps */
    both(E(141,386,6,8))                                    /* kneecaps */
  ],
  back:[
    'M120,94 L120,254',                                     /* spine */
    both('M134,110 C146,107 153,118 151,131 C147,143 139,148 132,144 C131,134 131,121 134,110'),
    both('M131,78 C140,86 150,90 160,95'),                  /* trapezius */
    both('M122,290 C132,295 147,295 158,289'),              /* gluteal fold */
    'M120,262 L120,286',
    both('M133,392 C139,395 146,395 151,392'),              /* knee crease */
    both('M141,410 C140,421 140,431 141,442')               /* calf split */
  ]
};
function mapSVG(view){
  var z=ZONES[view].map(function(zn){
    return '<path class="bp-hot" data-part="'+zn[0]+'" d="'+zn[1]+'" clip-path="url(#ckClip)"/>';
  }).join('');
  var navel=view==='front'?'<ellipse class="bp-line" cx="120" cy="212" rx="1.6" ry="2.6"/>':
    '<circle class="bp-line" cx="112" cy="247" r="1.4"/><circle class="bp-line" cx="128" cy="247" r="1.4"/>';
  return '<svg viewBox="0 0 240 520" role="img" aria-label="'+T(view==='front'?'Body map, front':'Body map, back',view==='front'?'人体图（正面）':'人体图（背面）')+'" data-view="'+view+'">'+
    '<defs><clipPath id="ckClip"><path d="'+BODY_D+'"/></clipPath>'+
    '<radialGradient id="ckShade" cx="42%" cy="30%" r="80%"><stop offset="0" stop-color="var(--ck-body-hi)"/><stop offset="1" stop-color="var(--ck-body-lo)"/></radialGradient></defs>'+
    '<path class="bp-body" d="'+BODY_D+'"/>'+
    '<g class="bp-zones">'+z+'</g>'+
    '<g class="bp-lines">'+LINES[view].map(function(d){ return '<path class="bp-line" d="'+d+'"/>'; }).join('')+navel+'</g>'+
    '<path class="bp-edge" d="'+BODY_D+'"/>'+
    '</svg>';
}
var BODY_D=bodyPath();
var BACK_PARTS={upperback:1,lowerback:1};
var FRONT_PARTS={chest:1,abdomen:1};


/* ═══ Smart layer ══════════════════════════════════════════════════════════
   Checkup used to depend on the camera scan, and a failed scan was a dead end
   ("Couldn't read the image"). Now:
     · describe it in words (EN / 中文) — a local parser finds the body part and
       pre-ticks the matching symptoms, with the text AI as a second opinion;
     · photos are re-encoded to a small JPEG first (phone HEIC/10 MB shots
       could never be read);
     · if the vision service is down, Checkup says so once and routes you to
       the description box instead of failing again and again;
     · listed symptoms get an instant rule-based answer (checkup-rules.js);
       only "Other" (or a second opinion) goes to the AI, which falls back to
       the rules when it is down, so there is always an answer. */
var SYN={
  head:['head','headache','migraine','forehead','temple','skull','face','jaw','eye','concussion','dizzy','头','头痛','头晕','额头','太阳穴','脸','下巴','脑震荡'],
  neck:['neck','cervical','whiplash','stiff neck','落枕','脖子','颈'],
  shoulder:['shoulder','rotator','deltoid','collarbone','clavicle','upper arm','bicep','biceps','肩','肩膀','锁骨','上臂','肩周'],
  elbow:['elbow','tennis elbow','golfer','funny bone','肘','手肘','网球肘'],
  wrist:['wrist','forearm','carpal','手腕','腕','前臂'],
  hand:['hand','finger','fingers','thumb','palm','knuckle','手指','手掌','拇指','指关节'],
  chest:['chest','rib','ribs','sternum','pec','pecs','breastbone','胸','肋骨','胸口','胸肌'],
  abdomen:['abdomen','stomach','belly','abs','tummy','side stitch','腹','肚子','胃','腹肌'],
  upperback:['upper back','shoulder blade','shoulder blades','scapula','thoracic','between my shoulders','上背','肩胛','背上'],
  lowerback:['lower back','low back','lumbar','back','spine','disc','sciatica','腰','下背','腰疼','腰痛','背','坐骨'],
  hip:['hip','hips','glute','glutes','buttock','butt','groin','pelvis','髋','臀','屁股','腹股沟','胯'],
  thigh:['thigh','hamstring','hamstrings','quad','quads','quadriceps','大腿','腘绳','股四头'],
  knee:['knee','knees','kneecap','patella','acl','mcl','meniscus','runner\'s knee','膝','膝盖','半月板','髌骨'],
  shin:['shin','shins','calf','calves','tibia','shin splints','小腿','胫','腿肚'],
  ankle:['ankle','ankles','achilles','sprained ankle','rolled my ankle','脚踝','踝','跟腱','崴脚'],
  foot:['foot','feet','toe','toes','heel','arch','plantar','sole','脚','脚趾','脚跟','足底','足弓','足']
};
/* longest phrases first so "upper back" beats "back" and 手腕 beats 手 */
var SYN_LIST=[];
Object.keys(SYN).forEach(function(id){ SYN[id].forEach(function(w){ SYN_LIST.push([w.toLowerCase(),id]); }); });
SYN_LIST.sort(function(a,b){ return b[0].length-a[0].length; });
var CJK=/[\u3400-\u9fff]/;
function findParts(text){
  var s=' '+String(text||'').toLowerCase().replace(/[^\w\u3400-\u9fff']+/g,' ')+' ';
  var hits={}, order=[];
  SYN_LIST.forEach(function(e){
    var w=e[0], i=CJK.test(w)?s.indexOf(w):s.search(new RegExp('(^|\\s)'+w.replace(/[.*+?^${}()|[\]\\']/g,'\\$&')+'(s|es)?(?=\\s)'));
    if(i<0) return;
    if(!hits[e[1]]){ hits[e[1]]=0; order.push(e[1]); }
    hits[e[1]]+=w.length;
    var st=CJK.test(w)?i:i+(s.charAt(i)===' '?1:0);
    s=s.slice(0,st)+new Array(w.length+1).join('_')+s.slice(st+w.length);   /* consume the phrase */
  });
  return order.sort(function(a,b){ return hits[b]-hits[a]; });
}
/* symptom matching: shared word stems (EN) or shared 2-char runs (中文) */
var STOP={with:1,after:1,while:1,more:1,very:1,like:1,just:1,some:1,really:1,been:1,days:1,week:1,when:1,from:1,that:1,this:1,into:1,your:1,have:1,feel:1,feeling:1,pain:1,hurts:1,hurt:1,the:1,and:1,area:1,side:1};
function stems(t){
  var out={};
  String(t).toLowerCase().replace(/[a-z]{4,}/g,function(w){ if(!STOP[w]) out[w.slice(0,4)]=1; return w; });
  var z=String(t).replace(/[^\u3400-\u9fff]/g,'');
  for(var i=0;i<z.length-1;i++) out[z.substr(i,2)]=1;
  return out;
}
/* strip every body-part word so "knee" in "knee swells" can't tick every knee symptom */
function noParts(text){
  var s=' '+String(text).toLowerCase()+' ';
  SYN_LIST.forEach(function(e){ s=s.split(e[0]).join(' '); });
  return s;
}
function matchSymptoms(part, text){
  var p=PART_MAP[part]; if(!p) return [];
  var u=stems(noParts(text)), out=[];
  p.sym.forEach(function(s,idx){
    var st=stems(noParts(s[0]+' '+s[1])), n=0;
    for(var k in st) if(u[k]) n++;
    if(n>0) out.push(idx);
  });
  return out;
}
/* ask the text AI to name the part when the parser can't */
function aiFindPart(text){
  var q='Which ONE body part does this describe? Answer with exactly one id from this list and nothing else: '+
        PARTS.map(function(p){ return p.id; }).join(', ')+'. Description: "'+String(text).slice(0,300)+'"';
  return fetch(MEDAI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,lang:'en',mode:'clinical'})})
    .then(function(r){ return r.json(); }).then(function(d){
      var hit=findParts((d&&d.reply)||'');
      if(hit.length) return hit[0];
      var ids=PARTS.map(function(p){ return p.id; });
      var m=String((d&&d.reply)||'').toLowerCase().match(new RegExp(ids.join('|')));
      return m?m[0]:null;
    }).catch(function(){ return null; });
}
function describeUI(){
  var body1=$('ckBody1'); if(!body1 || $('ckDescribe')) return;
  var box=document.createElement('div');
  box.className='checkup-describe'; box.id='ckDescribe';
  box.innerHTML='<label for="ckDescIn" class="ck-desc-lbl">'+T('Describe it in your own words','用自己的话描述')+'</label>'+
    '<div class="ck-desc-row"><input id="ckDescIn" type="text" autocomplete="off" maxlength="300" placeholder="'+
    T('e.g. my knee swells after basketball','例如：打篮球后膝盖肿了')+'"><button type="button" class="checkup-btn primary" id="ckDescGo">'+T('Find it','识别')+'</button></div>'+
    '<div class="ck-desc-out" id="ckDescOut" role="status" aria-live="polite"></div>';
  var ctx=body1.querySelector('.ch-ctx');
  (ctx&&ctx.nextSibling)?body1.insertBefore(box, ctx.nextSibling):body1.appendChild(box);
  var inp=$('ckDescIn'), go=$('ckDescGo');
  function run(){
    var text=(inp.value||'').trim(), out=$('ckDescOut');
    if(!text){ out.textContent=T('Type where it hurts and what it feels like.','请写下哪里疼、是什么感觉。'); return; }
    var hits=findParts(text);
    if(hits.length){ return pick(hits, text); }
    out.innerHTML='<span class="checkup-spin"></span> '+T('Thinking…','思考中…');
    go.disabled=true;
    aiFindPart(text).then(function(id){
      go.disabled=false;
      if(id&&PART_MAP[id]) return pick([id], text);
      out.innerHTML=T('I couldn\u2019t place that yet — tap the spot on the body below, or name the body part (e.g. “ankle”).','还无法判断部位 — 请在下方人体图上点击，或写出部位名称（如“脚踝”）。');
    });
  }
  function pick(ids, text){
    var out=$('ckDescOut');
    selectPart(ids[0], matchSymptoms(ids[0], text));
    if(ids.length>1){
      out.innerHTML=T('Also mentioned: ','也提到了：')+ids.slice(1,4).map(function(id){
        var p=PART_MAP[id]; return '<button type="button" class="checkup-part" data-alt="'+id+'">'+p.icon+' '+(lang()==='zh'?p.zh:p.en)+'</button>';
      }).join(' ');
      out.querySelectorAll('[data-alt]').forEach(function(b){ b.addEventListener('click',function(){ selectPart(b.getAttribute('data-alt'), matchSymptoms(b.getAttribute('data-alt'), text)); }); });
    } else out.textContent='';
  }
  go.addEventListener('click',run);
  inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); run(); } });
}
/* vision service health: one failure of the service itself → stop offering it */
var VISION_KEY='vitalite_vision_down';
function visionDown(){ try{ return sessionStorage.getItem(VISION_KEY)==='1'; }catch(e){ return false; } }
function markVisionDown(){ try{ sessionStorage.setItem(VISION_KEY,'1'); }catch(e){} }
function visionReply(res){
  /* the deployed worker may not have the vision branch yet: it answers 400
     "empty_question" — that is "service missing", not "couldn't read" */
  return res.json().then(function(d){ if(!res.ok || (d&&d.error)) { d=d||{}; d.ok=false; d.down=true; } return d; },
                         function(){ return {ok:false,down:true}; });
}
/* photos → small JPEG (HEIC, huge phone shots) */
function toJpeg(file){
  return new Promise(function(resolve,reject){
    var url=URL.createObjectURL(file), img=new Image();
    img.onload=function(){
      var MAX=1024, sc=Math.min(1,MAX/Math.max(img.naturalWidth,img.naturalHeight));
      var c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(img.naturalWidth*sc)); c.height=Math.max(1,Math.round(img.naturalHeight*sc));
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg',0.85));
    };
    img.onerror=function(){ URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src=url;
  });
}
/* ── tiny markdown renderer (reuse for output) ── */
function render(raw){
  var s=String(raw).replace(/[&<>]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; });
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/\*([^*]+)\*/g,'<em>$1</em>');
  s=s.replace(/(^|\s)_([^_]+)_(?=\s|$)/g,'$1<em>$2</em>');
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
  s=s.replace(/\n/g,'<br/>');
  return s;
}

/* ── the app ── */
var el={};
var state={ part:null, syms:[], vision:false, view:'front', other:false, otherText:'', onset:'', pain:3, dur:'', last:null };

function $(id){ return document.getElementById(id); }

var inited=false;
function drawMap(view){
  state.view=view;
  el.bodymap.innerHTML=mapSVG(view);
  el.bodymap.querySelectorAll('.bp-hot').forEach(function(h){
    h.classList.toggle('sel',h.getAttribute('data-part')===state.part);
  });
  var tg=$('ckView'); if(tg) tg.querySelectorAll('button').forEach(function(b){
    var on=b.getAttribute('data-view')===view; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on?'true':'false');
  });
}
function init(){
  if(inited) return;
  var root=$('checkup'); if(!root) return;
  el.bodymap=$('checkupMap'); if(!el.bodymap) return;
  inited=true;
  /* front / back toggle, built here so the markup stays untouched */
  var tg=document.createElement('div');
  tg.className='checkup-view'; tg.id='ckView'; tg.setAttribute('role','group');
  tg.innerHTML='<button type="button" data-view="front" data-en="Front" data-zh="正面">'+T('Front','正面')+'</button>'+
               '<button type="button" data-view="back" data-en="Back" data-zh="背面">'+T('Back','背面')+'</button><span class="ck-thumb" aria-hidden="true"></span>';
  el.bodymap.parentNode.insertBefore(tg, el.bodymap);
  tg.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button[data-view]'); if(!b) return;
    drawMap(b.getAttribute('data-view'));
  });
  /* one delegated listener: the SVG is redrawn on every view switch */
  el.bodymap.addEventListener('click',function(e){
    var h=e.target.closest&&e.target.closest('.bp-hot'); if(h) selectPart(h.getAttribute('data-part'));
  });
  drawMap('front');
  describeUI();
  if(visionDown()) setVisionOffline();
  // legend chips
  var lg=$('checkupParts'); if(lg){
    lg.innerHTML=PARTS.map(function(p){
      return '<button type="button" class="checkup-part" data-part="'+p.id+'">'+p.icon+' '+(lang()==='zh'?p.zh:p.en)+'</button>';
    }).join('');
    lg.querySelectorAll('.checkup-part').forEach(function(b){ b.addEventListener('click',function(){ selectPart(b.getAttribute('data-part')); }); });
  }
  var ci=$('camInput'), cb=$('camBtn'), fb=$('camFileBtn'), cs=$('camStop'), an=$('analyzeBtn');
  if(ci) ci.addEventListener('change',handleCamera);
  if(cb) cb.addEventListener('click',startLiveScan);
  if(fb) fb.addEventListener('click',function(){ ci&&ci.click(); });
  if(cs) cs.addEventListener('click',function(){ camGen++; stopLiveScan(); });
  if(an) an.addEventListener('click',analyze);
  var rbs=$('restartBtn'); if(rbs) rbs.addEventListener('click',reset);
  var rb2=$('restartBtn2'); if(rb2) rb2.addEventListener('click',reset);
  var bb=$('backBtn'); if(bb) bb.addEventListener('click',function(){ step(1); window.scrollTo({top:0,behavior:'smooth'}); });
  var eb=$('editBtn'); if(eb) eb.addEventListener('click',function(){ step(2); window.scrollTo({top:0,behavior:'smooth'}); });
  var sl=$('symList'); if(sl) sl.addEventListener('change',onSymChange);
}

/* ── step navigation ── */
function step(n){
  [1,2,3].forEach(function(i){
    var s=$('ckStep'+i); if(s) s.classList.toggle('on',i===n);
    var b=$('ckBody'+i); if(b) b.classList.toggle('active',i===n);
  });
}

/* Rebuild every dynamic label for the active language (fires on toggle). */
function reRender(){
  if(el.bodymap && inited) drawMap(state.view||'front');
  var lg=$('checkupParts'); if(lg){
    lg.innerHTML=PARTS.map(function(p){
      return '<button type="button" class="checkup-part'+(state.part===p.id?' sel':'')+'" data-part="'+p.id+'">'+p.icon+' '+(lang()==='zh'?p.zh:p.en)+'</button>';
    }).join('');
    lg.querySelectorAll('.checkup-part').forEach(function(b){ b.addEventListener('click',function(){ selectPart(b.getAttribute('data-part')); }); });
  }
  if(state.part){
    var p=PART_MAP[state.part];
    var cp=$('checkupPartName'); if(cp) cp.textContent=p.icon+' '+(lang()==='zh'?p.zh:p.en);
    var list=$('symList'); if(list){
      var checked={};
      list.querySelectorAll('input:checked').forEach(function(c){ checked[+c.value]=true; });
      list.innerHTML='';
      p.sym.forEach(function(s,idx){
        var lab=document.createElement('label');
        var tick=checked[idx];
        lab.className=tick?'ticked':'';
        lab.innerHTML='<input type="checkbox" value="'+idx+'"'+(tick?' checked':'')+'><span class="sym-txt">'+s[0]+'<span class="sym-zh">'+s[1]+'</span></span>';
        lab.addEventListener('change',function(){ lab.classList.toggle('ticked',lab.querySelector('input').checked); });
        list.appendChild(lab);
      });
    }
    extras();
    if(state.last && state.last.kind==='rules') showRules(state.last.idx);
  }
}
var langBtn=$('langToggle');
if(langBtn) langBtn.addEventListener('click',function(){ setTimeout(reRender,50); });

function selectPart(id, preTick){
  state.part=id; state.syms=[];
  var p=PART_MAP[id]; if(!p) return;
  if(BACK_PARTS[id] && state.view!=='back') drawMap('back');
  else if(FRONT_PARTS[id] && state.view!=='front') drawMap('front');
  el.bodymap.querySelectorAll('.bp-hot').forEach(function(h){ h.classList.toggle('sel',h.getAttribute('data-part')===id); });
  $('checkupParts').querySelectorAll('.checkup-part').forEach(function(b){ b.classList.toggle('sel',b.getAttribute('data-part')===id); });
  // part label
  var cp=$('checkupPartName'); if(cp) cp.textContent=p.icon+' '+(lang()==='zh'?p.zh:p.en);
  // build symptom list
  var list=$('symList'); if(list){
    list.innerHTML='';
    p.sym.forEach(function(s,idx){
      var lab=document.createElement('label');
      var on=!!(preTick&&preTick.indexOf(idx)>-1);
      lab.className=on?'ticked':'';
      lab.innerHTML='<input type="checkbox" value="'+idx+'"'+(on?' checked':'')+'><span class="sym-txt">'+s[0]+'<span class="sym-zh">'+s[1]+'</span></span>';
      lab.addEventListener('change',function(){ lab.classList.toggle('ticked',lab.querySelector('input').checked); });
      list.appendChild(lab);
    });
  }
  state.other=false; state.otherText=''; state.last=null;
  extras();
  // enable analyze
  var an=$('analyzeBtn'); if(an) an.disabled=false;
  step(2);
  var s2=$('ckBody2'); if(s2) s2.scrollIntoView({behavior:'smooth',block:'start'});
}

function onSymChange(e){
  var cb=e.target; if(!cb) return;
  var lab=cb.closest('label'); if(lab) lab.classList.toggle('ticked',cb.checked);
}

/* ── camera: live scan ──────────────────────────────────────────────────────
   Since 2026-09: the scan tracks the body on the device (checkup-pose.js,
   MediaPipe served from this site) and you TOUCH the sore spot with a
   finger; the part under the fingertip is what's found. The current clinical
   AI (Vitaxamine's glm-4.5-air, the same text path as the rest of the site)
   then adds a short note about that spot on the confirm sheet. The old
   frame-to-vision-model path below is only a fallback if tracking can't load.
   ── the original notes ──
   The viewer walks through four steps shown along its top edge: Aim → Hold
   steady → AI identifies → Confirm. Corner brackets close in and a ring fills
   as the picture steadies; after ~4 steady frames one frame goes to the AI
   vision service (checkup_vision). The AI's answer is never applied silently:
   a sheet shows the captured frame and the body part it saw, and the user
   confirms or rescans. Flip camera, torch (where the phone supports it) and a
   manual "Snap now" sit along the bottom. */
var camState={stream:null,timer:null,prev:null,stable:0,busy:false,tries:0,coolUntil:0,paused:false,facing:'user',torch:false}, camGen=0;
var SCAN_COOLDOWN=1000,   /* ms between capture attempts after a miss */
    SCAN_MAX_TRIES=15,    /* hard cap so we never loop forever */
    STEADY_N=4;

function camUI(){
  var cv=$('camView'); if(!cv || cv.getAttribute('data-ui')) return cv;
  cv.setAttribute('data-ui','1');
  var old=cv.querySelector('.checkup-reticle'); if(old) old.remove();
  cv.insertAdjacentHTML('beforeend',
    '<canvas class="ck-pose" id="camPose" aria-hidden="true"></canvas>'+
    '<div class="ck-scan-top"><span class="ck-ai-badge">✨ '+T('Body tracking','人体追踪')+'</span><ol class="ck-phases">'+
      [['aim',T('In view','入镜')],['hold',T('Touch & hold','按住')],['id',T('Found','找到')],['ok',T('Advice','建议')]].map(function(x){ return '<li data-p="'+x[0]+'">'+x[1]+'</li>'; }).join('')+'</ol></div>'+
    '<div class="ck-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'+
    '<svg class="ck-steady" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="26" class="bg"/><circle cx="30" cy="30" r="26" class="fg"/></svg>'+
    '<div class="ck-scan-ctl">'+
      '<button type="button" id="camFlip" title="'+T('Switch camera','切换摄像头')+'" aria-label="'+T('Switch camera','切换摄像头')+'">🔄</button>'+
      '<button type="button" id="camSnap" class="ck-snap">'+T('Snap now','立即拍摄')+'</button>'+
      '<button type="button" id="camTorch" title="'+T('Torch','手电筒')+'" aria-label="'+T('Torch','手电筒')+'" hidden>🔦</button></div>'+
    '<div class="ck-confirm" id="camConfirm" hidden><img alt=""><div class="ck-cf-body"><div class="ck-cf-k">'+T('You\u2019re touching','你按住的是')+'</div>'+
      '<div class="ck-cf-part" id="camCfPart"></div><div class="ck-cf-ai" id="camCfAi"></div><div class="ck-cf-btns"><button type="button" class="checkup-btn primary" id="camYes">'+T('Yes, continue','是的，继续')+'</button>'+
      '<button type="button" class="checkup-btn ghost" id="camNo">'+T('No, rescan','不对，重新扫描')+'</button></div></div></div>');
  var tips=document.createElement('div');
  tips.className='ck-scan-tips'; tips.id='camTips';
  tips.textContent=T('Step back so your body is in view · touch the sore spot with one finger and hold · clothing is fine','后退一点让身体入镜 · 用一根手指按住疼痛处并保持 · 穿着衣物也可以');
  cv.parentNode.insertBefore(tips, cv.nextSibling);
  $('camFlip').addEventListener('click',function(){ camState.facing=camState.facing==='environment'?'user':'environment'; openStream(); });
  $('camSnap').addEventListener('click',function(){ if(camState.busy || camState.paused) return; if(poseInst && poseHit) poseFound(poseHit); else if(!poseInst) captureFrame(); });
  $('camTorch').addEventListener('click',function(){
    var tr=camState.stream&&camState.stream.getVideoTracks()[0]; if(!tr) return;
    camState.torch=!camState.torch;
    tr.applyConstraints({advanced:[{torch:camState.torch}]}).catch(function(){});
    $('camTorch').classList.toggle('on',camState.torch);
  });
  $('camYes').addEventListener('click',function(){ var part=cv.getAttribute('data-part'); stopLiveScan(); if(part) selectPart(part); });
  $('camNo').addEventListener('click',function(){ $('camConfirm').hidden=true; camState.paused=false; camState.prev=null; camState.stable=0; poseN=0; poseHit=null; aiGen++; phase('aim'); setCamStatus(T('Touch the sore spot with one finger','用一根手指按住疼痛部位')); });
  return cv;
}
function phase(ph){
  var cv=$('camView'); if(!cv) return;
  cv.setAttribute('data-phase',ph);
  var order=['aim','hold','id','ok'], k=order.indexOf(ph);
  cv.querySelectorAll('.ck-phases li').forEach(function(li,i){ li.classList.toggle('done',i<k); li.classList.toggle('on',i===k); });
}
function steady(n){ var cv=$('camView'); if(cv) cv.style.setProperty('--ck-hold',Math.min(1,n/STEADY_N).toFixed(2)); }

function openStream(){
  var vid=$('camVideo'), myGen=++camGen;
  if(camState.stream){ camState.stream.getTracks().forEach(function(t){t.stop();}); camState.stream=null; }
  return navigator.mediaDevices.getUserMedia({
    video:{facingMode:camState.facing,width:{ideal:1280},height:{ideal:720}},
    audio:false
  }).then(function(stream){
    if(myGen!==camGen){ stream.getTracks().forEach(function(t){t.stop();}); return; }
    camState.stream=stream;
    vid.srcObject=stream;
    vid.classList.toggle('ck-mirror',camState.facing==='user');
    var pc=$('camPose'); if(pc) pc.classList.toggle('ck-mirror',camState.facing==='user');
    var p=vid.play(); if(p&&p.catch) p.catch(function(){});
    camState.prev=null; camState.stable=0; camState.coolUntil=0; camState.torch=false;
    var tr=stream.getVideoTracks()[0], caps=tr&&tr.getCapabilities?tr.getCapabilities():{};
    var tb=$('camTorch'); if(tb){ tb.hidden=!(caps&&caps.torch); tb.classList.remove('on'); }
    setCamStatus(T('Starting body tracking…','正在启动人体追踪…'));
    loadPose().then(function(){
      if(myGen!==camGen) return;
      setCamStatus(T('Step back so your body is in view','后退一点，让身体进入画面'));
      if(!poseRaf) poseRaf=requestAnimationFrame(poseLoop);
    },function(){
      if(myGen!==camGen) return;
      if(!camState.timer) camState.timer=setInterval(sampleFrame,200);   /* tracking unavailable: the old vision path */
    });
  }).catch(function(){
    if(myGen!==camGen) return;
    stopLiveScan();
    visionFail();
  });
}
function startLiveScan(){
  var cv=$('camView'), vid=$('camVideo');
  if(!cv||!vid||camState.stream||camState.busy) return;
  if(!window.navigator.mediaDevices||!window.navigator.mediaDevices.getUserMedia){ visionFail(); return; }
  var err=$('camErr'); if(err) err.textContent='';
  camUI();
  cv.hidden=false;
  var tips=$('camTips'); if(tips) tips.hidden=false;
  $('camConfirm').hidden=true;
  camState.tries=0; camState.paused=false;
  phase('aim'); steady(0);
  setCamStatus(T('Point at the sore area','对准疼痛部位'));
  var cb=$('camBtn'); if(cb) cb.classList.add('on');
  openStream();
  cv.scrollIntoView({behavior:'smooth',block:'center'});
}

/* Downscale frame, compare to previous, count consecutive steady frames. */
var camCanvas=null;
function sampleFrame(){
  var vid=$('camVideo');
  if(!camState.stream||!vid||!vid.videoWidth) return;
  if(camState.busy||camState.paused) return;
  if(Date.now()<camState.coolUntil) return;   /* pacing: brief pause between attempts */
  if(!camCanvas){ camCanvas=document.createElement('canvas'); }
  var ctx=camCanvas.getContext('2d');
  var sw=96, sh=Math.max(1,Math.round(sw*vid.videoHeight/vid.videoWidth));
  camCanvas.width=sw; camCanvas.height=sh;
  ctx.drawImage(vid,0,0,sw,sh);
  var px=ctx.getImageData(0,0,sw,sh).data;
  var diff=0;
  if(camState.prev){
    var sum=0,n=0;
    for(var i=0;i<px.length;i+=16){
      sum+=Math.abs(px[i]-camState.prev[i])+Math.abs(px[i+1]-camState.prev[i+1])+Math.abs(px[i+2]-camState.prev[i+2]);
      n++;
    }
    diff=n?sum/n:0;
  }
  camState.prev=new Uint8ClampedArray(px);
  if(diff<16){
    camState.stable++;
    steady(camState.stable);
    if(camState.stable>=STEADY_N){ captureFrame(); }
    else { phase('hold'); setCamStatus(T('Hold steady…','请保持不动…')); }
  } else {
    camState.stable=0; steady(0);
    phase('aim'); setCamStatus(T('Point at the sore area','对准疼痛部位'));
  }
}

/* One frame, resized, one request. Results only land if the scan is still current.
   Found → confirm sheet. Miss → keep scanning. Vision unavailable → 2 strikes then fall back. */
function captureFrame(){
  var vid=$('camVideo');
  if(!camState.stream||!vid||!vid.videoWidth) return;
  var capGen=camGen;
  var cnv=document.createElement('canvas');
  var MAX=800, sc=Math.min(1,MAX/Math.max(vid.videoWidth,vid.videoHeight));
  cnv.width=Math.round(vid.videoWidth*sc); cnv.height=Math.round(vid.videoHeight*sc);
  cnv.getContext('2d').drawImage(vid,0,0,cnv.width,cnv.height);
  var data=cnv.toDataURL('image/jpeg',0.8);
  camState.busy=true;
  var cv=$('camView'); if(cv){ cv.classList.remove('snap'); void cv.offsetWidth; cv.classList.add('snap'); }
  phase('id'); steady(1);
  setCamStatus(T('The AI is identifying…','AI 正在识别…'));
  function retry(msg){
    camState.prev=null; camState.stable=0; steady(0); camState.coolUntil=Date.now()+SCAN_COOLDOWN;
    phase('aim'); setCamStatus(msg);
  }
  fetch(MEDAI_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({type:'checkup_vision',image:data,lang:lang()})
  }).then(visionReply).then(function(d){
    if(capGen!==camGen) return;
    camState.busy=false;
    if(d&&d.down){ markVisionDown(); visionFail(true); return; }
    if(d&&d.ok&&d.part&&PART_MAP[d.part]){
      var p=PART_MAP[d.part];
      camState.paused=true; phase('ok');
      cv.setAttribute('data-part',d.part);
      var cf=$('camConfirm'); cf.querySelector('img').src=data;
      $('camCfPart').textContent=p.icon+' '+(lang()==='zh'?p.zh:p.en);
      cf.hidden=false;
      setCamStatus(T('Is that right?','识别正确吗？'));
      return;
    }
    camState.tries++;
    if(d&&d.ok===true){
      /* Vision is alive but no part seen -> keep scanning. */
      if(camState.tries>=SCAN_MAX_TRIES){
        setCamStatus(T('Still not detected — tap your body part on the map','仍未识别到 — 请在人体图上点击部位'));
        visionFail();
        return;
      }
      retry(T('Not detected yet — move a little closer…','尚未识别到 — 请再靠近一些…'));
      return;
    }
    /* Vision branch unavailable / bad reply / error -> 2 strikes, then graceful fallback. */
    if(camState.tries>=2){
      setCamStatus(T('Camera scan unavailable — tap your body part on the map','相机扫描不可用 — 请在人体图上点击部位'));
      visionFail();
      return;
    }
    retry(T('Scanning again…','重新扫描中…'));
  }).catch(function(){
    if(capGen!==camGen) return;
    camState.busy=false;
    camState.tries++;
    if(camState.tries>=2){
      setCamStatus(T('Camera scan unavailable — tap your body part on the map','相机扫描不可用 — 请在人体图上点击部位'));
      visionFail();
      return;
    }
    retry(T('Scanning again…','重新扫描中…'));
  });
}

/* ── body tracking (checkup-pose.js) ─────────────────────────────────────── */
var poseMod=null, poseInst=null, poseImg=null, poseLoading=null, poseRaf=0, poseHit=null, poseN=0, aiGen=0;
var POSE_N=16;                       /* frames the fingertip must stay on the same part */
function loadPose(){
  if(poseInst) return Promise.resolve(poseInst);
  if(poseLoading) return poseLoading;
  poseLoading=import('./checkup-pose.js?v=1').then(function(m){ poseMod=m; return m.createPose('VIDEO'); }).then(function(p){ poseInst=p; return p; });
  poseLoading.catch(function(){ poseLoading=null; });
  return poseLoading;
}
function sideName(h){ return h.side==='L'?T('Left ','左'):h.side==='R'?T('Right ','右'):''; }
function partName(h){ var p=PART_MAP[h.part]; if(!p) return h.part; return lang()==='zh' ? sideName(h)+p.zh : (sideName(h)+p.en.toLowerCase()).replace(/^./,function(c){return c.toUpperCase();}); }
function poseLoop(){
  poseRaf=0;
  var vid=$('camVideo'), cnv=$('camPose');
  if(!camState.stream||!vid||!poseInst||!cnv) return;
  if(vid.videoWidth && !camState.paused && !camState.busy){
    var W=vid.videoWidth, H=vid.videoHeight;
    if(cnv.width!==W||cnv.height!==H){ cnv.width=W; cnv.height=H; }
    var now=performance.now(), l=null;
    try{ l=poseInst.video(vid, now); }catch(e){}
    var hit=l?poseMod.pointing(l,W,H):null;
    poseMod.draw(cnv.getContext('2d'), l, W, H, hit, false, now);
    if(!l){ poseN=0; poseHit=null; steady(0); phase('aim'); setCamStatus(T('Step back so your body is in view','后退一点，让身体进入画面')); }
    else if(!hit){ poseN=0; poseHit=null; steady(0); phase('aim'); setCamStatus(T('Touch the sore spot with one finger','用一根手指按住疼痛部位')); }
    else {
      poseN=(poseHit&&poseHit.part===hit.part&&poseHit.side===hit.side)?poseN+1:1;
      poseHit=hit;
      steady(poseN*STEADY_N/POSE_N); phase('hold');
      setCamStatus(T('Hold it there… ','保持不动… ')+partName(hit));
      if(poseN>=POSE_N) poseFound(hit);
    }
  }
  poseRaf=requestAnimationFrame(poseLoop);
}
/* found: a still of the moment (with the overlay), the part, and a short note
   from the current clinical AI about that spot */
function poseFound(hit){
  var vid=$('camVideo'), cv=$('camView'), cnv=$('camPose');
  camState.paused=true; phase('id'); steady(1);
  var snap=document.createElement('canvas'), W=vid.videoWidth, H=vid.videoHeight, sc=Math.min(1,480/Math.max(W,H));
  snap.width=Math.round(W*sc); snap.height=Math.round(H*sc);
  var sx=snap.getContext('2d');
  if(camState.facing==='user'){ sx.translate(snap.width,0); sx.scale(-1,1); }
  sx.drawImage(vid,0,0,snap.width,snap.height); if(cnv) sx.drawImage(cnv,0,0,snap.width,snap.height);
  if(cv){ cv.classList.remove('snap'); void cv.offsetWidth; cv.classList.add('snap'); cv.setAttribute('data-part',hit.part); }
  var cf=$('camConfirm'); cf.querySelector('img').src=snap.toDataURL('image/jpeg',0.8);
  var p=PART_MAP[hit.part];
  $('camCfPart').textContent=(p?p.icon+' ':'')+partName(hit);
  cf.hidden=false;
  setCamStatus(T('Is that the spot?','是这个位置吗？'));
  phase('ok');
  var ai=$('camCfAi'), my=++aiGen;
  if(!ai) return;
  ai.innerHTML='<span class="checkup-spin"></span> '+T('Asking Vitaxamine about this spot…','正在向 Vitaxamine 询问这个部位…');
  var q=lang()==='zh'
    ? '相机扫描：我正用手指按住'+partName(hit)+'疼痛的地方。请用 3 个很短的要点说明活跃人群这个部位最常见的疼痛原因，再给出 1 个我应该先检查的问题。仅供学习，不是诊断。'
    : 'Camera scan: I am touching my '+partName(hit).toLowerCase()+' where it hurts. In 3 very short bullet points, give the most common reasons this spot hurts in active people, then 1 question I should check first. Education only, not a diagnosis.';
  fetch(MEDAI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,lang:lang(),mode:'clinical'})})
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(my!==aiGen) return;
      if(!d||!d.reply){ ai.textContent=T('The AI note is unavailable right now; you can still continue.','AI 说明暂时不可用；你仍可继续。'); return; }
      var t=String(d.reply).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\n+/g,'<br>');
      ai.innerHTML='<div class="ck-cf-ai-h">✨ '+T('Vitaxamine on this spot','Vitaxamine 对该部位的说明')+'</div>'+t;
    }, function(){ if(my===aiGen) ai.textContent=T('The AI note is unavailable right now; you can still continue.','AI 说明暂时不可用；你仍可继续。'); });
}
/* a photo: find the pointing fingertip on the still image */
function poseOnImage(dataUrl){
  return new Promise(function(res){
    var img=new Image();
    img.onload=function(){
      var go=poseImg?Promise.resolve(poseImg):import('./checkup-pose.js?v=1').then(function(m){ poseMod=m; return m.createPose('IMAGE'); }).then(function(p){ poseImg=p; return p; });
      go.then(function(p){ var l=null; try{ l=p.image(img); }catch(e){} res(l?poseMod.pointing(l,img.naturalWidth,img.naturalHeight):null); }, function(){ res(null); });
    };
    img.onerror=function(){ res(null); };
    img.src=dataUrl;
  });
}

function stopLiveScan(){
  if(camState.timer){ clearInterval(camState.timer); camState.timer=null; }
  if(poseRaf){ cancelAnimationFrame(poseRaf); poseRaf=0; }
  poseN=0; poseHit=null; aiGen++;
  var pc=$('camPose'); if(pc && pc.width) pc.getContext('2d').clearRect(0,0,pc.width,pc.height);
  if(camState.stream){ camState.stream.getTracks().forEach(function(t){t.stop();}); camState.stream=null; }
  camState.prev=null; camState.stable=0; camState.busy=false; camState.tries=0; camState.coolUntil=0; camState.paused=false;
  var vid=$('camVideo'); if(vid) vid.srcObject=null;
  var cv=$('camView'); if(cv){ cv.hidden=true; cv.classList.remove('snap'); cv.removeAttribute('data-part'); }
  var cf=$('camConfirm'); if(cf) cf.hidden=true;
  var tips=$('camTips'); if(tips) tips.hidden=true;
  var cb=$('camBtn'); if(cb) cb.classList.remove('on');
}

function setCamStatus(t){ var s=$('camStatus'); if(s) s.textContent=t; }

/* Fallback: pick a photo from disk (still sent through the same vision path). */
function handleCamera(ev){
  var file=ev.target.files&&ev.target.files[0]; if(!file) return;
  var cb=$('camBtn'); if(!cb) return;
  cb.classList.add('on');
  var err=$('camErr'); if(err) err.textContent='';
  var myGen=++camGen; stopLiveScan();
  if(err) err.innerHTML='<span class="checkup-spin"></span> '+T('Looking at your photo…','正在查看照片…');
  toJpeg(file).then(function(data){
    return poseOnImage(data).then(function(hit){
      if(hit) return { ok:true, part:hit.part, pose:true };
      return fetch(MEDAI_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'checkup_vision',image:data,lang:lang()})
    }).then(visionReply);
    });
  }).then(function(d){
    if(myGen!==camGen) return;
    cb.classList.remove('on');
    if(d&&d.ok&&d.part&&PART_MAP[d.part]){ if(err) err.textContent=''; selectPart(d.part); return; }
    if(d&&d.down){ markVisionDown(); visionFail(true); return; }
    visionFail();
  }).catch(function(){ if(myGen===camGen) visionFail(); });
  ev.target.value='';
}

function visionFail(down){
  camGen++; stopLiveScan();
  var cb=$('camBtn'); if(cb) cb.classList.remove('on');
  var err=$('camErr'); if(err){
    err.textContent=down
      ? T('Photo scan is offline right now \u2014 describe it above or tap the body map.','照片识别暂时离线 — 请在上方描述，或点击人体图。')
      : T('The photo didn\u2019t show a clear body part \u2014 try closer and in good light, describe it above, or tap the map.','照片中看不清身体部位 — 请靠近并在光线充足处重拍，或在上方描述，或点击人体图。');
  }
  if(down) setVisionOffline();
  var d=$('ckDescIn'); if(d && down) { try{ d.focus({preventScroll:true}); }catch(e){} }
}
function setVisionOffline(){
  var row=document.querySelector('.checkup-camrow'); if(row) row.classList.add('ck-vision-off');
  var cb=$('camBtn'); if(cb){ cb.disabled=true; cb.title=T('Photo scan is offline right now','照片识别暂时离线'); }
  var fb=$('camFileBtn'); if(fb){ fb.disabled=true; }
}

/* ── step 2 extras: "Other" + three quick questions ── */
function extras(){
  var list=$('symList'); if(!list) return;
  var box=$('ckExtras');
  if(!box){ box=document.createElement('div'); box.id='ckExtras'; box.className='ck-extras'; list.parentNode.insertBefore(box, list.nextSibling); }
  function seg(key, opts){
    return '<div class="ck-seg" role="group" data-k="'+key+'">'+opts.map(function(o){
      return '<button type="button" data-v="'+o[0]+'" aria-pressed="'+(state[key]===o[0]?'true':'false')+'">'+o[1]+'</button>'; }).join('')+'</div>';
  }
  box.innerHTML=
    '<label class="ck-other'+(state.other?' ticked':'')+'"><input type="checkbox" id="ckOtherCb"'+(state.other?' checked':'')+'><span class="sym-txt">'+T('Other — something not on the list','其他 — 列表里没有的情况')+
      '<span class="sym-zh">'+T('Describe it and the AI will analyse it','描述一下，由 AI 分析')+'</span></span></label>'+
    '<textarea id="ckOtherTx" class="ck-other-tx" rows="2" maxlength="400" placeholder="'+T('e.g. sharp pain on the top of my foot when I jump, started last week','例如：跳跃时脚背刺痛，上周开始')+'"'+(state.other?'':' hidden')+'>'+(state.otherText||'').replace(/</g,'&lt;')+'</textarea>'+
    '<div class="ck-qs">'+
      '<div class="ck-q"><span>'+T('How did it start?','是怎么开始的？')+'</span>'+seg('onset',[['a',T('Sudden — an injury','突然 — 受伤')],['g',T('Gradually','逐渐出现')],['',T('Not sure','不确定')]])+'</div>'+
      '<div class="ck-q"><span>'+T('How long?','持续多久？')+'</span>'+seg('dur',[['s',T('Under 3 days','3 天内')],['m',T('3 days – 2 weeks','3 天 – 2 周')],['l',T('Over 2 weeks','超过 2 周')]])+'</div>'+
      '<div class="ck-q ck-pain"><span>'+T('How bad right now?','现在有多痛？')+' <b id="ckPainV">'+state.pain+'/10</b></span><input type="range" id="ckPain" min="0" max="10" value="'+state.pain+'"></div>'+
    '</div>';
  var cb=$('ckOtherCb'), tx=$('ckOtherTx');
  cb.addEventListener('change',function(){ state.other=cb.checked; cb.parentNode.classList.toggle('ticked',cb.checked); tx.hidden=!cb.checked; if(cb.checked) tx.focus(); });
  tx.addEventListener('input',function(){ state.otherText=tx.value; });
  $('ckPain').addEventListener('input',function(e){ state.pain=+e.target.value; $('ckPainV').textContent=state.pain+'/10'; });
  box.querySelectorAll('.ck-seg').forEach(function(g){
    g.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('button'); if(!b) return;
      state[g.getAttribute('data-k')]=b.getAttribute('data-v');
      g.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed',x===b?'true':'false'); });
    });
  });
}
function answers(){ return { onset:state.onset||'', pain:state.pain||0, dur:state.dur||'' }; }
function ticked(){ return [].map.call($('symList')?$('symList').querySelectorAll('input:checked'):[],function(c){ return +c.value; }); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

/* ── rule-based result ── */
var LEVEL=[['','Self-care is reasonable','可以先自我护理','Follow the plan below and watch how it goes over the next few days.','按下方方案处理，并观察接下来几天的变化。'],
           ['','See a doctor or physio soon','尽快看医生或物理治疗师','Book a check within a day or two — some of what you described needs a professional look.','请在一两天内就诊——你描述的情况需要专业检查。'],
           ['','Get urgent care now','请立即就医','Stop activity and get medical help today (call emergency services if it is severe).','停止活动，今天就医（情况严重请呼叫急救）。']];
function ruleHTML(p, idx, r){
  var zh=lang()==='zh', L=LEVEL[r.level];
  var h='<div class="ck-res">'+
    '<div class="ck-tri ck-tri-'+r.level+'"><span class="ck-tri-i" aria-hidden="true"></span><div><b>'+esc(zh?L[2]:L[1])+'</b><p>'+esc(zh?L[4]:L[3])+'</p>'+
      (r.why.length?'<small>'+esc(T('Because: ','原因：'))+r.why.map(function(w){ return esc(zh?w[1]:w[0]); }).join(' · ')+'</small>':'')+'</div></div>'+
    '<div class="ck-src">⚙️ '+esc(T('Rule-based result from your answers — no AI used','根据你的回答由规则计算得出 — 未使用 AI'))+'</div>';
  if(r.matches.length){
    h+='<h4>'+esc(T('Most likely matches','最可能的情况'))+'</h4>'+r.matches.map(function(m){
      var because=m.hits.map(function(i){ return esc(zh?p.sym[i][1]:p.sym[i][0]); }).join('; ');
      return '<div class="ck-m"><div class="ck-m-top"><b>'+esc(zh?m.c[1]:m.c[0])+'</b><span>'+m.pct+'%</span></div><div class="ck-m-bar"><i style="width:'+m.pct+'%"></i></div>'+
        '<p>'+esc(zh?m.c[7]:m.c[6])+'</p><small>'+esc(T('Matched: ','匹配：'))+because+'</small></div>';
    }).join('');
  }
  h+='<h4>'+esc(zh?r.care[1]:r.care[0])+'</h4><ol class="ck-steps">'+r.care[2].map(function(s){ return '<li>'+esc(zh?s[1]:s[0])+'</li>'; }).join('')+'</ol>'+
    '<h4>⚠️ '+esc(T('Go now if','出现以下情况立即就医'))+'</h4><ul class="ck-go">'+
      '<li>'+esc(zh?r.urgent[1]:r.urgent[0])+'</li>'+(r.urgent!==r.urgentAll?'<li>'+esc(zh?r.urgentAll[1]:r.urgentAll[0])+'</li>':'')+'</ul>';
  if(r.chapters.length) h+='<h4>📖 '+esc(T('Learn more in the textbook','在教材中深入了解'))+'</h4><div class="ck-learn">'+r.chapters.map(function(c){
      return '<a href="guide.html#ch'+c[0]+'">'+esc(T('Ch '+c[0]+' · '+c[1][0],'第'+c[0]+'章 · '+c[1][1]))+' →</a>'; }).join('')+'</div>';
  h+='<div class="ck-ai-row"><button type="button" class="checkup-btn ghost" id="ckAskAI">✨ '+esc(T('Ask the AI for a second opinion','请 AI 给出第二意见'))+'</button></div></div>';
  return h;
}
function showRules(idx){
  var p=PART_MAP[state.part], out=$('ckOut'); if(!p||!out||!window.CheckupRules) return;
  var r=window.CheckupRules.run(p.id, idx, answers());
  state.last={kind:'rules', idx:idx};
  out.innerHTML=ruleHTML(p, idx, r)+'<div class="checkup-red">'+T('Education only — this is not a medical diagnosis. If in doubt, see a professional.','仅用于学习参考，不构成医疗诊断。如有疑问，请及时就医。')+'</div>';
  var ai=$('ckAskAI'); if(ai) ai.addEventListener('click',function(){ askAI(p, idx, r); });
  return r;
}

/* ── AI path: "Other", or a second opinion ── */
function askAI(p, idx, r){
  var out=$('ckOut'); if(!out) return;
  state.last={kind:'ai'};
  var picked=idx.map(function(i){ return p.sym[i][0]; });
  var a=answers(), other=(state.other&&state.otherText||'').trim();
  out.innerHTML='<div class="checkup-busy"><span class="checkup-spin"></span><span>'+T('The AI is analysing what you described…','AI 正在分析你的描述…')+'</span></div>';
  var q='Act as a sports first-aid / physiotherapy triage guide (education only, never a diagnosis). '+
    'Body area: '+p.en+'. '+(picked.length?'Ticked symptoms: '+picked.join('; ')+'. ':'')+(other?'In their own words: "'+other.slice(0,400)+'". ':'')+
    'Onset: '+(a.onset==='a'?'sudden, after an injury':a.onset==='g'?'gradual':'unsure')+'. Duration: '+(a.dur==='s'?'under 3 days':a.dur==='m'?'3 days to 2 weeks':a.dur==='l'?'over 2 weeks':'not given')+'. Pain now: '+a.pain+'/10. '+
    (r&&r.matches.length?'A rule-based pre-screen suggested: '+r.matches.map(function(m){ return m.c[0]+' ('+m.pct+'%)'; }).join(', ')+'. ':'')+
    'Respond in '+(lang()==='zh'?'Simplified Chinese':'English')+'. Format with **bold** section headers and - bullets. '+
    'Structure exactly: 1) **How urgent** (one line: self-care / see a professional soon / urgent, and why). 2) **Possible causes** (brief, plausible, non-alarming). '+
    '3) **What to do now** (safe home care and load advice). 4) **When to see a doctor URGENTLY**. 5) **Self-check questions** (2-3). '+
    'Keep it practical and calm, and clearly state this is NOT a medical diagnosis.';
  function ask(){
    return fetch(MEDAI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,lang:lang(),mode:'clinical'})})
      .then(function(res){ return res.json(); }).then(function(d){ if(!(d&&d.reply&&!d.rejected)) throw new Error('no_reply'); return d; });
  }
  ask().catch(function(){ return new Promise(function(res){ setTimeout(res,900); }).then(ask); })
  .then(function(d){
    out.innerHTML='<div class="ck-src ck-src-ai">✨ '+esc(T('AI analysis of your description','AI 对你描述的分析'))+'</div><div class="checkup-out">'+render(d.reply)+'</div>'+
      (idx.length?'<div class="ck-ai-row"><button type="button" class="checkup-btn ghost" id="ckBackRules">⚙️ '+esc(T('Show the rule-based result','查看规则计算结果'))+'</button></div>':'')+
      '<div class="checkup-red">'+T('Education only — this is not a medical diagnosis. If in doubt, see a professional.','仅用于学习参考，不构成医疗诊断。如有疑问，请及时就医。')+'</div>';
    var br=$('ckBackRules'); if(br) br.addEventListener('click',function(){ showRules(idx); });
  })
  .catch(function(){
    if(idx.length){ showRules(idx); out.insertAdjacentHTML('afterbegin','<div class="checkup-none">'+T('The AI is unavailable right now — here is the rule-based result for the symptoms you ticked.','AI 暂时不可用 — 以下是根据你勾选症状得出的规则结果。')+'</div>'); }
    else out.innerHTML='<div class="checkup-none">'+T('The AI is unavailable right now. Tick the closest symptoms from the list for an instant rule-based result, or try again in a moment.','AI 暂时不可用。请从列表中勾选最接近的症状获取即时结果，或稍后再试。')+'</div>';
  });
}

/* ── analyze ── */
function analyze(){
  var p=PART_MAP[state.part]; if(!p) return;
  var idx=ticked(), out=$('ckOut');
  if(!idx.length && !state.other){
    step(2);
    var ex=$('ckExtras'); if(ex && !ex.querySelector('.ck-need')) ex.insertAdjacentHTML('afterbegin','<div class="checkup-none ck-need">'+T('Tick at least one symptom, or choose “Other” and describe it.','请至少勾选一个症状，或选择“其他”并描述。')+'</div>');
    return;
  }
  if(state.other && !(state.otherText||'').trim()){ var tx=$('ckOtherTx'); if(tx){ tx.focus(); tx.classList.add('ck-shake'); setTimeout(function(){ tx.classList.remove('ck-shake'); },500); } return; }
  var need=document.querySelector('.ck-need'); if(need) need.remove();
  step(3);
  var r=window.CheckupRules?window.CheckupRules.run(p.id, idx, answers()):null;
  if(state.other) askAI(p, idx, r);
  else if(r) showRules(idx);
  else askAI(p, idx, null);
  var b3=$('ckBody3'); if(b3) b3.scrollIntoView({behavior:'smooth',block:'start'});
}

function reset(){
  camGen++; stopLiveScan();
  state={ part:null, syms:[], vision:false, view:state.view||'front', other:false, otherText:'', onset:'', pain:3, dur:'', last:null };
  var ex=$('ckExtras'); if(ex) ex.innerHTML='';
  el.bodymap.querySelectorAll('.bp-hot').forEach(function(h){ h.classList.remove('sel'); });
  if($('checkupParts')) $('checkupParts').querySelectorAll('.checkup-part').forEach(function(b){ b.classList.remove('sel'); });
  if($('symList')) $('symList').innerHTML='';
  if($('ckOut')) $('ckOut').innerHTML='';
  var bn=$('analyzeBtn'); if(bn) bn.disabled=true;
  var err=$('camErr'); if(err) err.textContent='';
  var ci=$('camInput'); if(ci) ci.value='';
  step(1);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();
})();

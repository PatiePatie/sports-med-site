/* ═══ Checkup — body-part symptom triage (infirmary) ═══
   Education only. Never a medical diagnosis.
   Cached-pinned ?v=1. Bilingual EN/ZH.
   Flow: 1) body part 2) tick symptoms 3) AI analysis + suggestions
   Camera upload = optional vision shortcut (fail-soft to body map).
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

/* ── tiny markdown renderer (reuse for output) ── */
function render(raw){
  var s=String(raw).replace(/[&<>]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; });
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/\*([^*]+)\*/g,'<em>$1</em>');
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
  s=s.replace(/\n/g,'<br/>');
  return s;
}

/* ── the app ── */
var el={};
var state={ part:null, syms:[], vision:false, view:'front' };

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
  }
}
var langBtn=$('langToggle');
if(langBtn) langBtn.addEventListener('click',function(){ setTimeout(reRender,50); });

function selectPart(id){
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
      lab.innerHTML='<input type="checkbox" value="'+idx+'"><span class="sym-txt">'+s[0]+'<span class="sym-zh">'+s[1]+'</span></span>';
      lab.addEventListener('change',function(){ lab.classList.toggle('ticked',lab.querySelector('input').checked); });
      list.appendChild(lab);
    });
  }
  // enable analyze
  var an=$('analyzeBtn'); if(an) an.disabled=false;
  step(2);
  var s2=$('ckBody2'); if(s2) s2.scrollIntoView({behavior:'smooth',block:'start'});
}

function onSymChange(e){
  var cb=e.target; if(!cb) return;
  var lab=cb.closest('label'); if(lab) lab.classList.toggle('ticked',cb.checked);
}

/* ── camera: live getUserMedia preview + continuous steady-detect scanning ── */
var camState={stream:null,timer:null,prev:null,stable:0,busy:false,tries:0,coolUntil:0}, camGen=0;
var SCAN_COOLDOWN=1000,   /* ms between capture attempts after a miss */
    SCAN_MAX_TRIES=15;    /* hard cap so we never loop forever */

function startLiveScan(){
  var cv=$('camView'), vid=$('camVideo');
  if(!cv||!vid||camState.stream||camState.busy) return;
  if(!window.navigator.mediaDevices||!window.navigator.mediaDevices.getUserMedia){ visionFail(); return; }
  var err=$('camErr'); if(err) err.textContent='';
  cv.hidden=false;
  setCamStatus(T('Point at the injured area','对准受伤部位'));
  var myGen=++camGen;
  navigator.mediaDevices.getUserMedia({
    video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}},
    audio:false
  }).then(function(stream){
    if(myGen!==camGen){ stream.getTracks().forEach(function(t){t.stop();}); return; }
    camState.stream=stream;
    vid.srcObject=stream;
    var p=vid.play(); if(p&&p.catch) p.catch(function(){});
    camState.prev=null; camState.stable=0; camState.tries=0; camState.coolUntil=0;
    camState.timer=setInterval(sampleFrame,200);
  }).catch(function(){
    if(myGen!==camGen) return;
    stopLiveScan();
    visionFail();
  });
}

/* Downscale frame, compare to previous, count consecutive steady frames. */
var camCanvas=null;
function sampleFrame(){
  var vid=$('camVideo');
  if(!camState.stream||!vid||!vid.videoWidth) return;
  if(camState.busy) return;
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
    if(camState.stable>=4){ captureFrame(); }
    else { setCamStatus(T('Hold steady…','请保持不动…')); }
  } else {
    camState.stable=0;
    setCamStatus(T('Point at the injured area','对准受伤部位'));
  }
}

/* One frame, resized, one request. Results only land if the scan still current.
   Continuous: miss -> keep scanning; vision-unavailable -> 2 strikes then fall back. */
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
  var cv=$('camView'); if(cv) cv.classList.add('snap');
  setCamStatus(T('Identifying…','正在识别…'));
  fetch(MEDAI_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({type:'checkup_vision',image:data,lang:lang()})
  }).then(function(res){ return res.json(); }).then(function(d){
    if(capGen!==camGen) return;
    camState.busy=false;
    if(d&&d.ok&&d.part&&PART_MAP[d.part]){ stopLiveScan(); selectPart(d.part); return; }
    camState.tries++;
    if(d&&d.ok===true){
      /* Vision is alive but no part seen -> keep scanning. */
      if(camState.tries>=SCAN_MAX_TRIES){
        setCamStatus(T('Still not detected — tap your body part on the map','仍未识别到 — 请在人体图上点击部位'));
        visionFail();
        return;
      }
      camState.prev=null; camState.stable=0; camState.coolUntil=Date.now()+SCAN_COOLDOWN;
      setCamStatus(T('Not detected yet — keep scanning…','尚未识别到 — 继续扫描…'));
      return;
    }
    /* Vision branch unavailable / bad reply / error -> 2 strikes, then graceful fallback. */
    if(camState.tries>=2){
      setCamStatus(T('Camera scan unavailable — tap your body part on the map','相机扫描不可用 — 请在人体图上点击部位'));
      visionFail();
      return;
    }
    camState.prev=null; camState.stable=0; camState.coolUntil=Date.now()+SCAN_COOLDOWN;
    setCamStatus(T('Scanning again…','重新扫描中…'));
  }).catch(function(){
    if(capGen!==camGen) return;
    camState.busy=false;
    camState.tries++;
    if(camState.tries>=2){
      setCamStatus(T('Camera scan unavailable — tap your body part on the map','相机扫描不可用 — 请在人体图上点击部位'));
      visionFail();
      return;
    }
    camState.prev=null; camState.stable=0; camState.coolUntil=Date.now()+SCAN_COOLDOWN;
    setCamStatus(T('Scanning again…','重新扫描中…'));
  });
}

function stopLiveScan(){
  if(camState.timer){ clearInterval(camState.timer); camState.timer=null; }
  if(camState.stream){ camState.stream.getTracks().forEach(function(t){t.stop();}); camState.stream=null; }
  camState.prev=null; camState.stable=0; camState.busy=false; camState.tries=0; camState.coolUntil=0;
  var vid=$('camVideo'); if(vid) vid.srcObject=null;
  var cv=$('camView'); if(cv){ cv.hidden=true; cv.classList.remove('snap'); }
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
  var r=new FileReader();
  r.onload=function(){
    var data=r.result;
    fetch(MEDAI_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'checkup_vision',image:data,lang:lang()})
    }).then(function(res){ return res.json(); }).then(function(d){
      if(myGen!==camGen) return;
      if(d&&d.ok&&d.part&&PART_MAP[d.part]){
        cb.classList.remove('on');
        selectPart(d.part);
        return;
      }
      visionFail();
    }).catch(visionFail);
  };
  // If FileReader fails quickly, give up gracefully too
  try{ r.readAsDataURL(file); }catch(e){ myGen++; visionFail(); }
}

function visionFail(){
  camGen++; stopLiveScan();
  var cb=$('camBtn'); if(cb) cb.classList.remove('on');
  var err=$('camErr'); if(err){
    err.textContent=T('Couldn\u2019t read the image yet \u2014 tap your body part on the map instead.','暂时无法识别图片 — 请直接在人体图上点击相应部位。');
  }
}

/* ── analyze ── */
function analyze(){
  var p=PART_MAP[state.part]; if(!p) return;
  var checked=$('symList')?$('symList').querySelectorAll('input:checked'):[];
  var picked=[].map.call(checked,function(c){ return p.sym[+c.value][0]; });
  if(picked.length===0){
    var out=$('ckOut'); if(out){
      out.innerHTML='<div class="checkup-none">'+T('Tick at least one symptom to get started.','请至少勾选一个症状。')+'</div>';
      step(3);
    }
    return;
  }
  var btn=$('analyzeBtn'); if(btn) btn.disabled=true;
  step(3);
  var out=$('ckOut');
  if(out) out.innerHTML='<div class="checkup-busy"><span class="checkup-spin"></span><span>'+T('Analyzing…','正在分析…')+'</span></div>';

  var q=
    'Act as a sports first-aid / physiotherapy triage guide (education only, never a diagnosis). '+
    'The user reports symptoms in the '+p.en+' area: '+picked.join('; ')+'. '+
    'Respond in '+(lang()==='zh'?'Simplified Chinese':'English')+'. Format with **bold** section headers and use - bullets. '+
    'Structure exactly: 1) **Possible causes** (brief, plausible, non-alarming list). '+
    '2) **What to do now** (safe home care: RICE where relevant, rest, and when to see a professional). '+
    '3) **When to see a doctor URGENTLY** (only if any of the flagged symptoms apply: severe bleeding, deformity, numbness/tingling, cannot bear weight, chest pain, head-injury confusion, or sudden unexplained pain). '+
    '4) **Self-check questions** (2-3 quick ones to narrow it down). '+
    'Keep it practical, calm, and clearly state this is NOT a medical diagnosis.';

  fetch(MEDAI_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({question:q,lang:lang()})
  }).then(function(r){ return r.json(); }).then(function(d){
    var btn2=$('analyzeBtn'); if(btn2) btn2.disabled=false;
    if(!out) return;
    if(d&&d.reply){
      out.innerHTML='<div class="checkup-out">'+render(d.reply)+'</div>'+
        '<div class="checkup-red">'+T('Guided by education only \u2014 this is not a medical diagnosis. If in doubt, see a professional.','仅用于学习参考，不构成医疗诊断。如有疑问，请及时就医。')+'</div>';
    } else {
      out.innerHTML='<div class="checkup-none">'+T('The AI is busy or unavailable. Please try again in a moment.','AI 暂时繁忙或不可用，请稍后再试。')+'</div>';
    }
  }).catch(function(){
    var btn3=$('analyzeBtn'); if(btn3) btn3.disabled=false;
    if(out) out.innerHTML='<div class="checkup-none">'+T('Network error. Please try again.','网络错误，请稍后重试。')+'</div>';
  });
}

function reset(){
  camGen++; stopLiveScan();
  state={ part:null, syms:[], vision:false, view:state.view||'front' };
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

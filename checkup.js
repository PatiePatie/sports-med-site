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

/* ── The body-map SVG (front silhouette, hotzones) ── */
/* viewBox roughly human; each <path class="bp-hot" data-part="... "> is clickable */
var MAP_SVG =
'<svg viewBox="0 0 240 470" role="img" aria-label="Body map">'+
'<defs><style>'+
'  .bp-hot{fill:var(--surface);stroke:var(--accent);stroke-width:1.4;cursor:pointer;transition:fill .15s}'+
'  .bp-hot:hover{fill:var(--accent-bg)}'+
'  .bp-hot.sel{fill:var(--accent)}'+
'  .lbl{font-size:9px;fill:var(--text3);pointer-events:none}'+
'</style></defs>'+
/* head */
'<circle cx="120"  cy="30" r="22" class="bp-hot" data-part="head"/>'+
/* neck */
'<path d="M108 52 Q120 48 132 52 Q136 66 132 78 Q120 82 108 78 Q104 66 108 52 Z" class="bp-hot" data-part="neck"/>'+
/* torso: chest+abdomen */
'<path d="M88 78 Q90 150 88 235 L120 242 L152 235 Q150 150 152 78 Q120 70 88 78 Z" class="bp-hot" data-part="chest"/>'+
'<path d="M88 178 Q90 235 88 235 L120 242 L152 235 Q150 210 150 178 Q120 172 88 178 Z" class="bp-hot" data-part="abdomen"/>'+
/* shoulders */
'<path d="M88 78 Q70 72 62 90 Q72 104 84 96 L88 84 Z" class="bp-hot" data-part="shoulder"/>'+
'<path d="M152 78 Q170 72 178 90 Q168 104 156 96 L152 84 Z" class="bp-hot" data-part="shoulder"/>'+
/* upper arms */
'<path d="M62 90 Q50 130 52 168 Q62 168 68 162 Q72 130 76 108 Z" class="bp-hot" data-part="shoulder"/>'+
'<path d="M178 90 Q190 130 188 168 Q178 168 172 162 Q168 130 164 108 Z" class="bp-hot" data-part="shoulder"/>'+
/* elbows */
'<path d="M50 168 Q46 180 52 190 Q60 188 62 178 Z" class="bp-hot" data-part="elbow"/>'+
'<path d="M190 168 Q194 180 188 190 Q180 188 178 178 Z" class="bp-hot" data-part="elbow"/>'+
/* forearms */
'<path d="M52 190 Q50 226 54 250 Q62 250 66 242 Q66 216 64 196 Z" class="bp-hot" data-part="wrist"/>'+
'<path d="M188 190 Q190 226 186 250 Q178 250 174 242 Q174 216 176 196 Z" class="bp-hot" data-part="wrist"/>'+
/* hands */
'<ellipse cx="60" cy="256" rx="12" ry="14" class="bp-hot" data-part="hand"/>'+
'<ellipse cx="180" cy="256" rx="12" ry="14" class="bp-hot" data-part="hand"/>'+
/* hips */
'<path d="M88 235 Q84 250 96 260 Q120 266 144 260 Q156 250 152 235 Q120 242 88 235 Z" class="bp-hot" data-part="hip"/>'+
/* thighs */
'<path d="M96 260 Q90 320 96 356 Q120 360 144 356 Q150 320 144 260 Q120 266 96 260 Z" class="bp-hot" data-part="thigh"/>'+
/* knees */
'<ellipse cx="120" cy="362" rx="16" ry="12" class="bp-hot" data-part="knee"/>'+
/* shins */
'<path d="M104 372 Q100 430 106 452 Q120 456 134 452 Q140 430 136 372 Q120 368 104 372 Z" class="bp-hot" data-part="shin"/>'+
/* ankles */
'<path d="M106 452 Q104 460 110 466 Q130 468 130 466 Q136 460 134 452 Z" class="bp-hot" data-part="ankle"/>'+
/* feet */
'<ellipse cx="110" cy="472" rx="22" ry="8" class="bp-hot" data-part="foot"/>'+
'<ellipse cx="150" cy="472" rx="22" ry="8" class="bp-hot" data-part="foot"/>'+
'</svg>';

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
var state={ part:null, syms:[], vision:false };

function $(id){ return document.getElementById(id); }

function init(){
  var root=$('checkup'); if(!root) return;
  el.bodymap=$('checkupMap'); if(!el.bodymap) return;
  el.bodymap.innerHTML=MAP_SVG;
  // legend chips
  var lg=$('checkupParts'); if(lg){
    lg.innerHTML=PARTS.map(function(p){
      return '<button type="button" class="checkup-part" data-part="'+p.id+'">'+p.icon+' '+(lang()==='zh'?p.zh:p.en)+'</button>';
    }).join('');
    lg.querySelectorAll('.checkup-part').forEach(function(b){ b.addEventListener('click',function(){ selectPart(b.getAttribute('data-part')); }); });
  }
  el.bodymap.querySelectorAll('.bp-hot').forEach(function(h){
    h.addEventListener('click',function(){ selectPart(h.getAttribute('data-part')); });
  });
  var ci=$('camInput'), cb=$('camBtn'), an=$('analyzeBtn');
  if(ci) ci.addEventListener('change',handleCamera);
  if(cb) cb.addEventListener('click',function(){ ci&&ci.click(); });
  if(an) an.addEventListener('click',analyze);
  var rb1=$('restartBtn'), rb2=$('restartBtn2');
  if(rb1) rb1.addEventListener('click',reset);
  if(rb2) rb2.addEventListener('click',reset);
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

/* ── camera: try vision, fall back to body map ── */
function handleCamera(ev){
  var file=ev.target.files&&ev.target.files[0]; if(!file) return;
  var cb=$('camBtn'); if(!cb) return;
  cb.classList.add('on');
  var err=$('camErr'); if(err) err.textContent='';
  // prefer base64 upload
  var r=new FileReader();
  r.onload=function(){
    var data=r.result;
    fetch(MEDAI_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'checkup_vision',image:data,lang:lang()})
    }).then(function(res){ return res.json(); }).then(function(d){
      if(d&&d.ok&&d.part&&PART_MAP[d.part]){
        cb.classList.remove('on');
        selectPart(d.part);
        return;
      }
      visionFail();
    }).catch(visionFail);
  };
  // If FileReader fails quickly, give up gracefully too
  try{ r.readAsDataURL(file); }catch(e){ visionFail(); }
}

function visionFail(){
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
  state={ part:null, syms:[], vision:false };
  el.bodymap.querySelectorAll('.bp-hot').forEach(function(h){ h.classList.remove('sel'); });
  if($('checkupParts')) $('checkupParts').querySelectorAll('.checkup-part').forEach(function(b){ b.classList.remove('sel'); });
  if($('symList')) $('symList').innerHTML='';
  if($('ckOut')) $('ckOut').innerHTML='';
  var bn=$('analyzeBtn'); if(bn) bn.disabled=true;
  var err=$('camErr'); if(err) err.textContent='';
  var ci=$('camInput'); if(ci) ci.value='';
  step(1);
}

document.addEventListener('DOMContentLoaded',init);
if(document.readyState!=='loading') init();
})();

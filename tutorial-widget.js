/* ════════════════════════════════════════════════════════════════════
   ONBOARDING TUTORIAL — Vitalité · 双语入门导览
   Shows once for a brand-new account (sm_tutorial flag set by login.html).
   Bilingual (reads sm_lang / showCN), step-by-step walkthrough that teaches
   the bilingual toggle (中/EN), night/light mode, navigation, reading,
   flashcards, quizzes, exam prep, the AI assistant and the account page.
   Clears sm_tutorial when finished or skipped.
   ════════════════════════════════════════════════════════════════════ */
(function(){
  var DONE='sm_tutorial_done';
  var STEPS=[
    {icon:'👋', t:['Welcome to Vitalité','欢迎来到 Vitalité'],
     b:['Your complete bilingual training system for sport & sports medicine. This one-minute tour shows you everything you need to start studying.','这是您的运动与运动医学双语学习系统。一分钟导览带您了解全部功能，让您马上开始学习。'],
     sel:null},
    {icon:'🌐', t:['Bilingual switch · 中/EN','双语开关 · 中/EN'],
     b:['The «中» button here opens 中文 — the entire site, every page, every question. It becomes «EN» ; click again to switch back to English. Try it: the whole site flips instantly.','这里的「中」按钮会把整个网站切换为中文——所有页面、所有题目。按钮随即变为「EN」；再次点击即可回到英文。试试点击：整站立即切换。'],
     sel:'#langToggle', task:{kind:'click', sel:'#langToggle', t:['Try it: tap the 中 / EN button','试一试：点一下「中 / EN」按钮'], ok:['Nice! The whole site just switched.','很好！整个网站刚刚切换了语言。']}},
    {icon:'🌙', t:['Night / light mode','夜间 / 浅色模式'],
     b:['Right beside it is the theme switch. Click 🌙 to turn on dark mode for comfortable night reading; click ☀️ to return to light. Your choice is saved and applied everywhere.','旁边的按钮是主题开关。点击🌙进入深色夜间模式，夜间阅读更舒适；点击☀️返回浅色。您的选择会被保存并在全站生效。'],
     sel:'#darkToggle', task:{kind:'click', sel:'#darkToggle', t:['Try it: flip the theme','试一试：切换一下主题'], ok:['Lights changed. Flip it back any time.','灯光已切换，随时可以换回来。']}},
    {icon:'🧭', t:['Sidebar — your map','侧边栏 —— 您的地图'],
     b:['The left sidebar holds everything: «Chapters» lists all 14 chapters, «On this page» jumps within the current chapter, «Study Tools» opens flashcards, quizzes and exam prep. On small screens tap ☰ to open it.','左侧边栏集中了全部功能：「章节」列出14个章节，「本页目录」在当前章内快速跳转，「备考工具」打开闪卡、测验与考试冲刺。小屏幕上点☰展开。'],
     sel:'#sidebar'},
    {icon:'🔍', t:['Search — find anything','搜索 —— 速查任意内容'],
     b:['The search bar in the top bar (⌘K / Ctrl K) finds any topic across all chapters instantly. Start typing and matches appear below.','顶部搜索框（⌘K / Ctrl K）可瞬间检索全部章节中的任意主题。输入关键词，下方立即显示结果。'],
     sel:'.lin-search-input, #searchInput', task:{kind:'input', sel:'.lin-search-input, #searchInput', t:['Try it: type “ACL” into the search','试一试：在搜索框输入「ACL」'], ok:['Found it. Search works across all 14 chapters.','找到了！搜索覆盖全部 14 章。']}},
    {icon:'📖', t:['Reading — card by card','阅读 —— 按卡片学习'],
     b:['Each chapter is a set of expandable cards. Click a section heading to open its content, click again to collapse — so you can study in bite-sized pieces.','每个章节由若干可展开的卡片组成。点击小节标题展开内容，再次点击收起——方便按小块学习。'],
     sel:'.chapter .acc-header, #guide .acc-header, .accordion .acc-header', need:true, task:{kind:'click', sel:'.acc-header', t:['Try it: open or close a section','试一试：展开或收起一个小节'], ok:['That is how every chapter reads: one card at a time.','每一章都这样读：一次一张卡片。']}},
    {icon:'🎯', t:['Practise every part','每一节都能练'],
     b:['Under each section there is a «Practise this part» tray: a concept web, match-up, true or false, fill the gap, put in order and more, all built from that section. Finished activities get a green tick.','每个小节下面都有「练一练这一节」：概念网、配对、判断对错、填空、排顺序等，全部由该节内容生成。完成的练习会打上绿色对勾。'],
     sel:'.ks-bar', need:true, task:{kind:'click', sel:'.ks-tab', t:['Try it: open any activity','试一试：打开任意一个练习'], ok:['That is it. Every section has its own set.','就是这样，每一节都有自己的一套。']}},
    {icon:'🫳', t:['The page is cloth','页面是一块布'],
     b:['Everything here sits on soft fabric. Your pointer rests a small dent in it; press and hold to sink in deeper, and drag while holding to pull the cloth around.','整个页面铺在一块柔软的布上。指针会压出一个小凹陷；按住会陷得更深，按住拖动还能拉动布料。'],
     sel:null, fine:true, task:{kind:'hold', t:['Try it: press and hold anywhere, then drag','试一试：在任意处按住，然后拖动'], ok:['Felt that? Let go and it springs back.','感受到了吗？松开它会弹回来。']}},
    {icon:'🃏', t:['Flashcards','闪卡'],
     b:['Open «Study Tools» in the top bar → «Flashcards». Flip each card to learn a key term, shuffle the deck, and mark the cards you already know so they leave your rotation.','打开顶栏「备考工具」→「闪卡」。翻面记忆关键术语、打乱牌组，并把自己已掌握的知识点标记熟练，让它退出轮换。'],
     sel:'#stFlash', menu:true},
    {icon:'✅', t:['Quizzes & adaptive practice','测验与自适应练习'],
     b:['Open «Study Tools» → «Quizzes». Every chapter ends with a quiz. The adaptive engine adjusts questions to your level, and the Mastery Dashboard tracks your progress chapter by chapter.','打开「备考工具」→「测验」。每章都配有测验，自适应引擎会根据您的水平调整出题，掌握度看板逐章记录学习进度。'],
     sel:'#stQuiz', menu:true},
    {icon:'🎓', t:['Exam prep & certification','备考冲刺与结业证书'],
     b:['Open «Study Tools» → «Exam prep» for NPTE practice exams and the 运动康复师 qualification exam. Score ≥70% to earn a downloadable Certificate of Completion.','打开「备考工具」→「备考冲刺」：提供 NPTE 模拟考试与运动康复师资格证考试。成绩≥70%即可获得可下载的结业证书。'],
     sel:'#stExam', menu:true},
    {icon:'🤖', t:['The AI assistant · Vitaline','AI 助手 · Vitaline'],
     b:['Need a quick explanation? Open «Study Tools» → «Vitaline AI» to ask our AI, or use the Q&A bubble (bottom-left) to ask in English or 中文.','需要快速讲解？打开「备考工具」→「Vitaline AI」向AI提问，或用左下角的问答气泡用中英文提问。'],
     sel:'#stAI, #aiFab', menu:true},
    {icon:'👤', t:['Your account','您的账户'],
     b:['Tap your name in the top bar to open My Account — edit your name, country, age and bio, and watch your level grow as you study.','点击顶栏中的姓名进入「我的账户」——编辑姓名、国家、年龄与简介，并看着您的等级随学习不断提升。'],
     sel:'#loginBtn, .btn-login'},
    {icon:'🧠', t:['Quick check','小测验'],
     b:['One question before you go.','出发前来一道题。'],
     sel:null, quiz:{q:['Which button turns the whole site into 中文?','哪个按钮能把整个网站切换成中文？'],
       o:[['The 中 / EN button','「中 / EN」按钮'],['The 🌙 theme button','🌙 主题按钮'],['The search bar','搜索框']], a:0}},
    {icon:'🎉', t:['You are ready!','一切就绪！'],
     b:['That is it — you now know how to use Vitalité. This tour will not show again. Happy studying — 祝您学习愉快！','就是这样——您已掌握 Vitalité 的全部用法，本导览将不再出现。祝你学习愉快——Happy studying!'],
     sel:null}
  ];

  function isCN(){ try{ return localStorage.getItem('sm_lang')==='zh'; }catch(e){ return false; } }
  function flag(){ try{ return localStorage.getItem('sm_tutorial'); }catch(e){ return null; } }
  function clearFlag(){ try{ localStorage.removeItem('sm_tutorial'); }catch(e){} }
  function markDone(){ try{ localStorage.setItem(DONE,'1'); }catch(e){} }

  var REDUCE=false; try{ REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  var FINE=false; try{ FINE=matchMedia('(hover: hover) and (pointer: fine)').matches; }catch(e){}
  /* text arrives a few words at a time */
  function words(cls,txt){
    var n=document.createElement('span'); n.className=cls;
    var parts=cls==='tut-l-zh' ? (txt.match(/[\s\S]{1,3}/g)||[txt]) : txt.split(/(\s+)/);
    var k=0;
    parts.forEach(function(w){
      if(/^\s+$/.test(w)){ n.appendChild(document.createTextNode(w)); return; }
      var sp=document.createElement('span'); sp.className='tut-w'; sp.textContent=w;
      sp.style.animationDelay=Math.min(k++*16,700)+'ms';
      n.appendChild(sp);
    });
    return n;
  }
  /* a small burst of confetti in the site's inks */
  function confetti(x,y,n){
    if(REDUCE) return;
    var C=['#C7434B','#E0666C','#1E4F8F','#8DB6E2','#FFFFFF','#E8C87A'];
    var box=document.createElement('div'); box.className='tut-confetti';
    box.style.left=x+'px'; box.style.top=y+'px';
    for(var i=0;i<(n||22);i++){
      var p=document.createElement('i'), a=Math.random()*Math.PI*2, d=50+Math.random()*90;
      p.style.setProperty('--dx',(Math.cos(a)*d).toFixed(0)+'px');
      p.style.setProperty('--dy',(Math.sin(a)*d-40).toFixed(0)+'px');
      p.style.setProperty('--r',(Math.random()*720-360).toFixed(0)+'deg');
      p.style.background=C[i%C.length];
      p.style.animationDelay=(Math.random()*80).toFixed(0)+'ms';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function(){ if(box.parentNode) box.parentNode.removeChild(box); },1300);
  }
  function el(tag,cls,txt){
    var n=document.createElement(tag);
    if(cls) n.className=cls;
    if(txt!=null) n.textContent=txt;
    return n;
  }

/* Replay affordance: a small ↻ button sits in the top-left flank (or beside
      the logo on non-shell pages) so the walkthrough is one click away for
      EVERY account of the site. It is only hidden while a fresh-account tour
      is pending (sm_tutorial==='1') or already running. */
   var replayBtn=null;
   var boundEvents=false;
   var api={render:null,next:null,prev:null,finish:null,afterLang:null};
   function syncReplayLabel(){
     if(!replayBtn) return;
     var cn=isCN();
     replayBtn.title=cn?'重新播放新手教程':'Replay the tutorial';
     replayBtn.innerHTML='↻ <span class="tut-replay-text">'+(cn?'教程':'Tutorial')+'</span>';
   }
   function mountReplay(){
     if(replayBtn || (flag()==='1')) return;
    var b=el('button','tut-replay');
    b.id='tutReplay';
    b.type='button';
    b.addEventListener('click',replayUi);
    replayBtn=b;
    var tl=document.querySelector('.lin-topleft');
    if(tl){ tl.appendChild(b); }
    else {
      var logo=document.querySelector('.header-inner .logo');
      if(logo && logo.parentNode){
        var wrap=logo.parentNode;
        var box=wrap.parentNode;
        if(box) box.insertBefore(b, wrap.nextSibling);
        else if(wrap.parentNode) wrap.parentNode.appendChild(b);
      } else {
        var inn=document.querySelector('.header-inner')||document.querySelector('.lin-topbar-inner');
        if(inn) inn.insertBefore(b, inn.firstChild);
      }
    }
    syncReplayLabel();
  }
  function showReplay(){ if(replayBtn){ replayBtn.style.display=''; syncReplayLabel(); } }
  function hideReplay(){ if(replayBtn) replayBtn.style.display='none'; }
  function replayUi(){
    if(document.getElementById('tutRoot')) return;
    hideReplay();
    build();
  }
  function bindUiEvents(){
    if(boundEvents) return;
    boundEvents=true;
    window.addEventListener('resize',function(){
      if(window._tutPlace) setTimeout(window._tutPlace,40);
    });
    document.addEventListener('keydown',function(ev){
      if(!document.getElementById('tutRoot')||!api.next||!api.prev) return;
      if(ev.key==='Escape'){ if(api.finish) api.finish(); }
      else if(ev.key==='ArrowRight'){ api.next(); }
      else if(ev.key==='ArrowLeft'){ api.prev(); }
    });
    document.addEventListener('click',function(ev){
      var lb=ev.target.closest?ev.target.closest('#langToggle'):null;
      if(lb){
        if(api.afterLang) setTimeout(api.afterLang,40);
        else setTimeout(syncReplayLabel,40);
      }
      var db=ev.target.closest?ev.target.closest('#darkToggle'):null;
      if(db && window._tutPlace){ setTimeout(window._tutPlace,120); }
    },true);
  }

  function build(){
    if(document.getElementById('tutRoot')) return;
    var root=el('div','tut-root');
    root.id='tutRoot';
    var veil=el('div','tut-veil');
    var spot=el('div','tut-spot');
    var tip=el('div','tut-card');
    /* card content */
    var badge=el('div','tut-badge');
    var title=el('div','tut-title');
    var body=el('div','tut-body');
    var dots=el('div','tut-dots');
    var btns=el('div','tut-btns');
    var skip=el('button','tut-btn ghost');
    var prev=el('button','tut-btn'); 
    var next=el('button','tut-btn primary');
    btns.appendChild(skip); btns.appendChild(prev); btns.appendChild(next);
    var count=el('div','tut-count');
    var head=el('div','tut-head'); head.appendChild(badge); head.appendChild(count);
    var taskRow=el('div','tut-task'), quizBox=el('div','tut-quiz');
    var ghost=el('div','tut-ghost'); ghost.innerHTML='<i class="tut-ghost-hand"></i><i class="tut-ghost-ring"></i>';
    tip.appendChild(head); tip.appendChild(title); tip.appendChild(body);
    tip.appendChild(taskRow); tip.appendChild(quizBox);
    tip.appendChild(dots); tip.appendChild(btns);
    root.appendChild(veil); root.appendChild(spot); root.appendChild(ghost); root.appendChild(tip);
    /* steps this page can't show (no sections, no practice trays, a touch screen for the cloth) drop out */
    STEPS=STEPS.filter(function(st){
      if(st.fine && (!FINE || !document.documentElement.classList.contains('sg-fab'))) return false;
      if(st.need){ var t=null; try{ t=document.querySelector(st.sel); }catch(e){} if(!t) return false; }
      return true;
    });
    var taskDone={}, taskOff=null, advT=0;
    document.body.appendChild(root);

    var i=0, dir=1, first=true;
    requestAnimationFrame(function(){ root.classList.add('tut-live'); });
    function swapLabel(b,lbl,titled){ if(titled) b.title=lbl; }
    function fmt(b,lbl,primary){ b.textContent=lbl; b.className='tut-btn'+((primary?' primary':'')); }
    function render(){
      var s=STEPS[i], cn=isCN();
      badge.textContent=s.icon;
      /* Always show both languages: English on top, 中文 below. */
      title.textContent='';
      title.appendChild(el('span','tut-l-en',s.t[0]));
      title.appendChild(el('span','tut-l-zh',s.t[1]));
      body.textContent='';
      body.appendChild(words('tut-l-en',s.b[0]));
      body.appendChild(words('tut-l-zh',s.b[1]));
      badge.classList.remove('tut-pop'); void badge.offsetWidth; badge.classList.add('tut-pop');
      wireTask(s);
      dots.textContent='';
      for(var k=0;k<STEPS.length;k++){
        var d=el('span','tut-dot'+(k===i?' on':'')+(k<i?' done':''));
        dots.appendChild(d);
      }
      dots.style.setProperty('--tut-p',((i+1)/STEPS.length*100).toFixed(1)+'%');
      count.textContent=(i+1)+' / '+STEPS.length;
      /* the card's content comes in out of a fog, from the side you're heading */
      tip.setAttribute('data-dir', dir>0?'next':'prev');
      tip.classList.remove('tut-in'); void tip.offsetWidth; tip.classList.add('tut-in');
      prev.style.visibility = (i===0)?'hidden':'visible';
      var done=(i===STEPS.length-1);
      fmt(skip, cn?'跳过':'Skip', false);
      fmt(prev, cn?'上一步':'Back', false);
      fmt(next, done ? (cn?'完成':'Done') : (cn?'下一步':'Next'), true);
      swapLabel(next, done?'':null,false);
      /* spotlight + position the card */
      var target=null;
      if(s.sel){
        try{ target=document.querySelector(s.sel); }catch(e){}
      }
      if(target && !s.menu){ var z=target.getBoundingClientRect(); if(!z.width && !z.height) target=null; }  /* hidden on this page */
      /* Study-step targets live inside the top-bar Study Tools dropdown —
         open it FIRST so the flagged item (#stFlash/#stQuiz/#stExam/#stAI)
         has a real rect for the spotlight; close it again off those steps
         so a stale open menu never lingers behind the dim. Pages without
         the menu (login/social) simply fall back to no ring / #aiFab. */
      var stud=window.VitaliteStudyTools;
      if(stud && stud.isOpen && stud.isOpen() && !s.menu){ try{ stud.close(); }catch(e){} }
      if(stud && stud.open && s.menu){ try{ stud.open(); }catch(e){} }
      /* on the sidebar step, bloom the semicircle open so there's something to see */
      var sbEl=document.querySelector('.sidebar');
      var semi=document.documentElement.classList.contains('os-semi');
      var onSb=!!(target && sbEl && (target===sbEl || sbEl.contains(target)) && semi);
      if(sbEl && semi) sbEl.classList.toggle('os-open', onSb);
      spot.classList.toggle('tut-semi', onSb);
      /* Ring + veil window share four animatable vars (--tut-x/y/w/h, see the
         CSS), so they glide together on the compositor-friendly path; the card
         moves by transform. Nothing here animates left/top or a backdrop blur. */
      var place=function(){
        root.className='tut-root tut-live '+(target?'has-spot':'')+(first?' tut-first':'')+(s.task&&!taskDone[i]?' tut-taskmode':'')+(s.task&&s.task.kind==='hold'?' tut-clear':'')+(s.task&&!taskDone[i]&&target&&!REDUCE?' tut-demo':'');
        var cw=tip.offsetWidth, ch=tip.offsetHeight, W=window.innerWidth, H=window.innerHeight;
        var cx=Math.max(8,(W-cw)/2), cy;
        if(target){
          var r=target.getBoundingClientRect();
          var pad=12;
          spot.style.display='block';
          root.style.setProperty('--tut-x',(r.left-pad).toFixed(1)+'px');
          root.style.setProperty('--tut-y',(r.top-pad).toFixed(1)+'px');
          root.style.setProperty('--tut-w',(r.width+pad*2).toFixed(1)+'px');
          root.style.setProperty('--tut-h',(r.height+pad*2).toFixed(1)+'px');
          /* below the target unless it would overflow; else above */
          cy=(r.bottom+16+ch<H-16)?(r.bottom+16):Math.max(12,r.top-ch-16);
          ghost.style.setProperty('--gx1',(r.left+Math.min(r.width/2,60)).toFixed(0)+'px');
          ghost.style.setProperty('--gy1',(r.top+r.height/2).toFixed(0)+'px');
          ghost.style.setProperty('--gx0',(cx+cw/2).toFixed(0)+'px');
          ghost.style.setProperty('--gy0',(Math.max(12,cy)+ch*.35).toFixed(0)+'px');
        } else {
          spot.style.display='none';
          cy=(H-ch)/2;
        }
        tip.style.left='0'; tip.style.top='0'; tip.style.bottom='auto';
        tip.style.transform='translate3d('+cx.toFixed(0)+'px,'+Math.max(12,cy).toFixed(0)+'px,0)';
        first=false;
      };
      /* place now when the target is already on screen (most are: top bar,
         sidebar); wait for the menu/semicircle to open, or for the scroll to land */
      var wait=0;
      if(target && !s.menu && !onSb){
        var tr=target.getBoundingClientRect();
        if(tr.top<8 || tr.bottom>window.innerHeight-8){
          target.scrollIntoView({behavior:'smooth',block:'center'});
          wait=-1;
        }
      }
      if(s.menu || onSb) wait=380;
      if(wait===-1){
        var fired=false, go=function(){ if(fired) return; fired=true; window.removeEventListener('scrollend',go,true); place(); };
        window.addEventListener('scrollend',go,true);
        setTimeout(go,650);
      } else if(wait) setTimeout(place,wait);
      else place();
      window._tutPlace=place;
    }

    function wireTask(s){
      if(taskOff){ taskOff(); taskOff=null; }
      clearTimeout(advT);
      taskRow.textContent=''; quizBox.textContent='';
      taskRow.style.display=s.task?'':'none';
      quizBox.style.display=s.quiz?'':'none';
      var cn=isCN(), me=i;
      if(s.task){
        var done=!!taskDone[i];
        taskRow.className='tut-task'+(done?' ok':'');
        taskRow.appendChild(el('span','tut-task-i',done?'✓':'👉'));
        taskRow.appendChild(el('span','tut-task-t',done?(cn?s.task.ok[1]:s.task.ok[0]):(cn?s.task.t[1]:s.task.t[0])));
        if(done) return;
        var win=function(){
          if(taskDone[me]) return;
          taskDone[me]=true;
          var r=taskRow.getBoundingClientRect(); confetti(r.left+22,r.top+r.height/2);
          root.classList.remove('tut-taskmode','tut-demo');
          taskRow.className='tut-task ok';
          taskRow.firstChild.textContent='✓';
          taskRow.lastChild.textContent=isCN()?s.task.ok[1]:s.task.ok[0];
          advT=setTimeout(function(){ if(i===me && i<STEPS.length-1){ i++; dir=1; render(); } },1700);
        };
        if(s.task.kind==='click'){
          var h=function(ev){ var t=ev.target&&ev.target.closest&&ev.target.closest(s.task.sel); if(t && !t.closest('.tut-card')) setTimeout(win,60); };
          document.addEventListener('click',h,true);
          taskOff=function(){ document.removeEventListener('click',h,true); };
        } else if(s.task.kind==='input'){
          var hi=function(ev){ var t=ev.target; if(t&&t.matches&&t.matches(s.task.sel)&&String(t.value||'').trim().length>=2) win(); };
          document.addEventListener('input',hi,true);
          taskOff=function(){ document.removeEventListener('input',hi,true); };
        } else if(s.task.kind==='hold'){
          var ht=0;
          var dn=function(ev){ if(ev.target.closest&&ev.target.closest('.tut-card')) return; clearTimeout(ht); ht=setTimeout(win,650); };
          var upf=function(){ clearTimeout(ht); };
          document.addEventListener('pointerdown',dn,true); document.addEventListener('pointerup',upf,true);
          taskOff=function(){ clearTimeout(ht); document.removeEventListener('pointerdown',dn,true); document.removeEventListener('pointerup',upf,true); };
        }
      }
      if(s.quiz){
        quizBox.appendChild(el('div','tut-quiz-q',cn?s.quiz.q[1]:s.quiz.q[0]));
        s.quiz.o.forEach(function(o,k){
          var b=el('button','tut-quiz-o',cn?o[1]:o[0]); b.type='button';
          b.style.animationDelay=(120+k*90)+'ms';
          b.addEventListener('click',function(){
            if(quizBox.classList.contains('solved')) return;
            if(k===s.quiz.a){
              quizBox.classList.add('solved'); b.classList.add('ok');
              var r=b.getBoundingClientRect(); confetti(r.left+r.width/2,r.top+r.height/2,30);
            } else { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); }
          });
          quizBox.appendChild(b);
        });
      }
    }
    function finish(){
      if(root.classList.contains('tut-out')) return;
      if(taskOff){ taskOff(); taskOff=null; }
      clearTimeout(advT);
      if(i===STEPS.length-1){ var r=tip.getBoundingClientRect(); confetti(r.left+r.width/2,r.top+20,44); }
      root.classList.add('tut-out');
      setTimeout(finishNow, 380);
    }
    function finishNow(){
      clearFlag(); markDone();
      try{ var sbx=document.querySelector('.sidebar'); if(sbx && !sbx.matches(':hover')) sbx.classList.remove('os-open'); }catch(e){}
      try{ if(window.VitaliteStudyTools && window.VitaliteStudyTools.close) window.VitaliteStudyTools.close(); }catch(e){}
      try{ document.body.style.overflow=''; }catch(e){}
      if(root && root.parentNode) root.parentNode.removeChild(root);
      window._tutPlace=null;
      /* stop dispatching to this instance */
      if(api.render===render){ api.render=null; api.next=null; api.prev=null; api.finish=null; api.afterLang=null; }
      /* the tour is finished → offer the replay button */
      bindUiEvents();
      setTimeout(mountReplay,120);
      setTimeout(showReplay,120);
    }
    function onResize(){ if(window._tutPlace) setTimeout(window._tutPlace,40); }

    skip.addEventListener('click',finish);
    prev.addEventListener('click',function(){ if(i>0){ i--; dir=-1; render(); } });
    next.addEventListener('click',function(){
      if(i<STEPS.length-1){ i++; dir=1; render(); }
      else finish();
    });
    api.render=render;
    api.next=function(){ if(i<STEPS.length-1){ i++; dir=1; render(); } };
    api.prev=function(){ if(i>0){ i--; dir=-1; render(); } };
    api.finish=finish;
    api.afterLang=function(){ render(); syncReplayLabel(); };
    bindUiEvents();
    try{ document.body.style.overflow='hidden'; }catch(e){}

    /* Live-follow the language toggle: if the user taps 中/EN mid-tour, re-render.
       deferred so the page's own handler runs first and sm_lang is already new. */
    render();
    window.tutClose=finish; /* escape hatch */
  }

  function boot(){
    var go=function(){ bindUiEvents(); mountReplay(); };
    /* New account that hasn't seen the tour → run it. Otherwise a returning
       user who already finished gets the small ↻ replay button instead. */
    if(flag()==='1'){
      try{
        var ff=function(){ build(); };
        if(document.readyState==='complete'||document.readyState==='interactive'){ setTimeout(ff,450); }
        else document.addEventListener('DOMContentLoaded',function(){ setTimeout(ff,450); });
      }catch(e){}
      return;
    }
    try{
      if(document.readyState==='complete'||document.readyState==='interactive'){ setTimeout(go,300); }
      else document.addEventListener('DOMContentLoaded',function(){ setTimeout(go,300); });
    }catch(e){}
  }
  boot();
})();
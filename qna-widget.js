/* ═══════════════════════════════════════════════════════════════════════════
   Vitalité — Q&A widget (bottom-left)
   Replaces the old "Send us a message" contact form with a site-wide
   Q&A panel: FAQ answers, Report an issue, and a Contact-Devs form.
   Messages land in the `qna_messages` Supabase table → Dev Console inbox.

   Self-contained IIFE: builds its own DOM, loads its own supabase client,
   works on every page (including pages that never load supabase-js).
   Bilingual EN/中文 like the rest of the site (localStorage sm_lang).
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Only mount once ── */
  if(window.__qnaWidgetLoaded) return;
  window.__qnaWidgetLoaded = true;

  var SB_URL   = 'https://eytmbftrjvsntyzwbtzl.supabase.co';
  var SB_ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dG1iZnRyanZzbnR5endidHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTU2NjksImV4cCI6MjEwNDIzMTY2OX0.o0vRqteQ5XNgTNvnB3IEE9I67Oo_r4sy7JZ9qOGWSSc';
  // Prefer the page's own Supabase config when present (admin/login).
  if(window.SB_URL && window.SB_URL.indexOf('PASTE')===-1) SB_URL=window.SB_URL;
  if(window.SB_ANON && window.SB_ANON.indexOf('PASTE')===-1) SB_ANON=window.SB_ANON;

  var showCN = function(){ try{ return localStorage.getItem('sm_lang')==='zh'; }catch(e){ return false; } }();

  var T = {
    fab:            { en:'Q&A',             zh:'问答' },
    fabTitle:       { en:'Q&A · Help & feedback', zh:'问答 · 帮助与反馈' },
    title:          { en:'Q&A · Help',      zh:'问答 · 帮助' },
    sub:            { en:'Answers, reports & dev contact', zh:'常见问题、举报与联系开发者' },
    close:          { en:'Close',           zh:'关闭' },
    tabFaq:         { en:'FAQ',             zh:'常见问题' },
    tabReport:      { en:'Report',          zh:'举报' },
    tabContact:     { en:'Contact Devs',    zh:'联系开发者' },
    faqHint:        { en:'Common questions, answered.', zh:'常见问题答疑。' },
    reportTitle:    { en:'Report a problem',zh:'举报问题' },
    reportHint:     { en:'Found something wrong — a broken link, wrong answer, offensive content? Tell us and we\'ll fix it.', zh:'发现错误——链接失效、答案有误、内容不当？告诉我们，我们会修复。' },
    reportWhat:     { en:'What are you reporting?', zh:'你要举报什么？' },
    reportReasons:  [ {en:'Broken link / page',zh:'失效链接/页面'}, {en:'Wrong answer / content',zh:'答案/内容有误'}, {en:'Offensive / spam',zh:'不当内容/垃圾信息'}, {en:'Other',zh:'其他'} ],
    reportDetail:   { en:'Details (optional)', zh:'详情（选填）' },
    contactTitle:   { en:'Send a message to the developers', zh:'给开发者留言' },
    contactHint:    { en:'Questions, suggestions, or feedback — the dev team reads every message.', zh:'问题、建议或反馈——开发团队会阅读每一条消息。' },
    contactName:    { en:'Your name (optional)', zh:'你的姓名（选填）' },
    contactEmail:   { en:'Your email (optional)', zh:'你的邮箱（选填）' },
    contactType:    { en:'Type',             zh:'类型' },
    types:          [ {en:'Question',zh:'提问'}, {en:'Suggestion',zh:'建议'}, {en:'Bug report',zh:'Bug 报告'}, {en:'Feedback',zh:'反馈'} ],
    contactMsg:     { en:'Message',          zh:'内容' },
    msgPh:          { en:'Type your message…', zh:'请输入内容…' },
    send:           { en:'✉ Send',           zh:'✉ 发送' },
    sending:        { en:'Sending…',         zh:'发送中…' },
    sent:           { en:'Message sent. Thank you!', zh:'消息已发送，谢谢！' },
    fail:           { en:'Send failed. Try again, or email the devs directly.', zh:'发送失败，请重试，或直接给开发者发邮件。' },
    devNote:        { en:'Q&A messages are read by the Vitalité dev team.', zh:'问答消息由 Vitalité 开发团队阅读。' },
    noSupabase:     { en:'Q&A is offline — messages can\'t be sent right now. Try again later.', zh:'问答暂不可用——当前无法发送消息，请稍后再试。' },
    required:       { en:'Please add a few words first.', zh:'请先输入一些内容。' }
  };
  function tr(x){ return showCN?x.zh:x.en; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  /* ── FAQ content (bilingual). Keep it tight and useful. ── */
  var FAQ = [
    { en:['Is this site a medical diagnosis?','No. Vitalité is an educational resource for sports injury & recovery, study guides, and exam prep. It is not a substitute for professional medical advice, diagnosis, or treatment. If you are injured, see a qualified professional.'],
      zh:['这是医疗诊断吗？','不是。Vitalité 是运动损伤与康复、学习指南和备考的教育资源，不能替代专业医疗建议、诊断或治疗。若受伤请咨询合格的专业人士。'] },
    { en:['How do I create an account?','Open the sign-in page and choose Sign Up. You can register with an email address, or use the GitHub / Google buttons on the sign-in page.'],
      zh:['如何创建账号？','打开登录页并选择“注册”。你可以用邮箱注册，也可以使用登录页上的 GitHub / Google 按钮。'] },
    { en:['I forgot my password.','On the sign-in page, tap the "Forgot password?" link under the password field. A reset link will be emailed to you.'],
      zh:['忘记密码了怎么办？','在登录页点击密码框下方的“忘记密码？”链接，重置链接会发送到你的邮箱。'] },
    { en:['What is the Infirmary / AI Assistant?','The Infirmary is the recovery-plan section of the site. The AI Assistant answers sports-injury & recovery questions — it is guidance, not a diagnosis.'],
      zh:['什么是 Infirmary / AI 助手？','Infirmary 是网站的康复计划版块。AI 助手回答运动损伤与康复问题——仅供参考，并非诊断。'] },
    { en:['Is the content bilingual?','Yes — the whole site is in English and 中文 (Simplified Chinese). Use the 中 / EN toggle in the top bar to switch.'],
      zh:['网站内容支持双语吗？','支持——全站提供英文和简体中文。点击顶栏的 中 / EN 按钮即可切换。'] },
    { en:['How do I use the forum?','Open the 💬 Forum from the sidebar. Pick a category, read threads, and sign in to post or reply. You can upvote helpful posts and report anything inappropriate.'],
      zh:['如何使用论坛？','从侧边栏打开 💬 论坛。选择分类、浏览帖子，登录后即可发帖或回复。你可以为有用的帖子点赞，也可以举报不当内容。'] },
    { en:['How do I reach the developers directly?','Use the "Contact Devs" tab in this panel, or email the dev team directly. Every message lands in the developer inbox.'],
      zh:['如何直接联系开发者？','使用本面板中的“联系开发者”标签，或直接给开发团队发邮件。每条消息都会进入开发者收件箱。'] }
  ];

  /* ── DOM build ── */
  var root=document.documentElement;
  var body=document.body;

  function makeEl(tag,cls,html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }

  var fab=makeEl('button','', '<span class="qna-fab-x">💬</span><span class="qna-fab-label"></span><span class="qna-fab-badge">1</span>');
  fab.id='qnaFab';
  fab.type='button';
  fab.title=tr(T.fabTitle);
  fab.setAttribute('aria-label',tr(T.fabTitle));
  fab.setAttribute('aria-expanded','false');
  fab.querySelector('.qna-fab-label').textContent=tr(T.fab);

  var panel=makeEl('div','','');
  panel.id='qnaPanel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label',tr(T.title));
  panel.innerHTML=
    '<div class="qna-head">'
    +'<div><div class="qna-title"></div><div class="qna-sub"></div></div>'
    +'<button class="qna-close" aria-label="'+tr(T.close).replace(/"/g,'&quot;')+'">✕</button>'
    +'</div>'
    +'<div class="qna-tabs">'
    +'<button class="qna-tab" data-tab="faq"></button>'
    +'<button class="qna-tab" data-tab="report"></button>'
    +'<button class="qna-tab" data-tab="contact"></button>'
    +'</div>'
    +'<div class="qna-body"></div>'
    +'<div class="qna-foot"></div>';

  panel.querySelector('.qna-title').textContent=tr(T.title);
  panel.querySelector('.qna-sub').textContent=tr(T.sub);
  panel.querySelector('.qna-foot').textContent=tr(T.devNote);
  var tabs=panel.querySelectorAll('.qna-tab');
  tabs[0].textContent=tr(T.tabFaq);
  tabs[1].textContent=tr(T.tabReport);
  tabs[2].textContent=tr(T.tabContact);

  body.appendChild(fab);
  body.appendChild(panel);

  /* ── State ── */
  var currentTab='faq';
  var sbClient=null;

  /* ── Supabase client (self-load if missing) ── */
  function getSb(cb){
    if(sbClient){ cb(sbClient); return; }
    if(window.supabase && window.supabase.createClient){
      try{ sbClient=window.supabase.createClient(SB_URL,SB_ANON); cb(sbClient); }catch(e){ cb(null); }
      return;
    }
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload=function(){ try{ sbClient=window.supabase.createClient(SB_URL,SB_ANON); }catch(e){ sbClient=null; } cb(sbClient); };
    s.onerror=function(){ cb(null); };
    document.head.appendChild(s);
  }

  /* ── Submission ── */
  function submit(kind,payload,btn,statusBox){
    statusBox.className='qna-status';
    statusBox.style.display='none';
    var msg=(payload.message||'').trim();
    if(!msg){ statusBox.className='qna-status err'; statusBox.textContent=tr(T.required); statusBox.style.display='block'; return; }
    if(btn){ btn.disabled=true; btn.textContent=tr(T.sending); }
    getSb(function(sb){
      if(!sb){
        statusBox.className='qna-status err'; statusBox.textContent=tr(T.noSupabase); statusBox.style.display='block';
        if(btn){ btn.disabled=false; btn.textContent=tr(T.send); }
        return;
      }
      var row={
        kind: kind,
        name: payload.name||null,
        email: payload.email||null,
        message: msg,
        page: location.pathname.split('/').pop()||'/',
        reported_item: payload.reported_item||null,
        category: payload.category||null
      };
      sb.from('qna_messages').insert(row).then(function(res){
        if(res.error){
          statusBox.className='qna-status err'; statusBox.textContent=tr(T.fail)+' ('+esc(res.error.message||'')+')'; statusBox.style.display='block';
          if(btn){ btn.disabled=false; btn.textContent=tr(T.send); }
          return;
        }
        statusBox.className='qna-status ok'; statusBox.textContent=tr(T.sent); statusBox.style.display='block';
        if(btn){ btn.disabled=false; btn.textContent=tr(T.send); }
        if(payload.reset) payload.reset();
      });
    });
  }

  /* ── Tab renderers ── */
  var bodyEl=panel.querySelector('.qna-body');

  function renderFaq(){
    bodyEl.innerHTML='';
    bodyEl.appendChild(makeEl('div','qna-empty',tr(T.faqHint)));
    FAQ.forEach(function(item){
      var qa=item[showCN?'zh':'en'];
      var box=makeEl('div','qna-faq');
      var q=makeEl('button','qna-faq-q', esc(qa[0])+'<span class="qna-faq-ic">✚</span>');
      q.type='button';
      var a=makeEl('div','qna-faq-a', esc(qa[1]));
      q.addEventListener('click',function(){ var open=box.classList.toggle('open'); q.setAttribute('aria-expanded',open?'true':'false'); });
      box.appendChild(q); box.appendChild(a);
      bodyEl.appendChild(box);
    });
  }

  function field(labelText,innerHtml,id){
    var f=makeEl('div','qna-field');
    var l=makeEl('label','','');
    l.textContent=labelText;
    if(id) l.setAttribute('for',id);
    f.appendChild(l);
    var wrap=document.createElement('div');
    wrap.innerHTML=innerHtml;
    f.appendChild(wrap.firstElementChild);
    return f;
  }

  var reportSel=null;
  function renderReport(){
    bodyEl.innerHTML='';
    bodyEl.appendChild(makeEl('div','','<div style="font-weight:800;font-size:.9rem">'+tr(T.reportTitle)+'</div>'));
    bodyEl.appendChild(makeEl('div','qna-empty',tr(T.reportHint)));
    var what=makeEl('div','qna-report-why');
    T.reportReasons.forEach(function(r,i){
      var b=makeEl('button','qna-reason',esc(tr(r)));
      b.type='button';
      b.addEventListener('click',function(){
        what.querySelectorAll('.qna-reason').forEach(function(x){ x.classList.remove('sel'); });
        b.classList.add('sel'); reportSel=tr(r);
      });
      what.appendChild(b);
    });
    bodyEl.appendChild(what);
    bodyEl.appendChild(field(tr(T.reportDetail),'<textarea id="qnaRepMsg" placeholder="'+tr(T.msgPh).replace(/"/g,'&quot;')+'" rows="3"></textarea>','qnaRepMsg'));

    var status=makeEl('div','qna-status','');
    var send=makeEl('button','qna-send',tr(T.send));
    send.type='button';
    send.addEventListener('click',function(){
      submit('report',{
        email:null, name:null,
        message:document.getElementById('qnaRepMsg').value,
        reported_item: reportSel||null,
        category:'report',
        reset:function(){ document.getElementById('qnaRepMsg').value=''; }
      },send,status);
    });
    bodyEl.appendChild(status);
    bodyEl.appendChild(send);
  }

  function renderContact(){
    bodyEl.innerHTML='';
    bodyEl.appendChild(makeEl('div','','<div style="font-weight:800;font-size:.9rem">'+tr(T.contactTitle)+'</div>'));
    bodyEl.appendChild(makeEl('div','qna-empty',tr(T.contactHint)));
    bodyEl.appendChild(field(tr(T.contactName),'<input id="qnaCtName" type="text" maxlength="80" placeholder="Jane">','qnaCtName'));
    bodyEl.appendChild(field(tr(T.contactEmail),'<input id="qnaCtEmail" type="email" maxlength="120" placeholder="you@example.com">','qnaCtEmail'));
    var typeOpts='<select id="qnaCtType">';
    T.types.forEach(function(tp){ typeOpts+='<option value="'+esc(tr(tp))+'">'+esc(tr(tp))+'</option>'; });
    typeOpts+='</select>';
    bodyEl.appendChild(field(tr(T.contactType),typeOpts,'qnaCtType'));
    bodyEl.appendChild(field(tr(T.contactMsg),'<textarea id="qnaCtMsg" rows="3" placeholder="'+tr(T.msgPh).replace(/"/g,'&quot;')+'"></textarea>','qnaCtMsg'));

    var status=makeEl('div','qna-status','');
    var send=makeEl('button','qna-send',tr(T.send));
    send.type='button';
    send.addEventListener('click',function(){
      submit('message',{
        name:document.getElementById('qnaCtName').value,
        email:document.getElementById('qnaCtEmail').value,
        message:document.getElementById('qnaCtMsg').value,
        category:document.getElementById('qnaCtType').value,
        reset:function(){
          document.getElementById('qnaCtMsg').value='';
          document.getElementById('qnaCtName').value='';
          document.getElementById('qnaCtEmail').value='';
        }
      },send,status);
    });
    bodyEl.appendChild(status);
    bodyEl.appendChild(send);
  }

  function renderTab(){
    tabs.forEach(function(t){ t.classList.toggle('active',t.getAttribute('data-tab')===currentTab); });
    bodyEl.innerHTML='';
    if(currentTab==='faq') renderFaq();
    else if(currentTab==='report') renderReport();
    else renderContact();
  }

  /* ── Open / close ── */
  function open(){
    panel.classList.add('open');
    fab.setAttribute('aria-expanded','true');
    renderTab();
  }
  function close(){
    panel.classList.remove('open');
    fab.setAttribute('aria-expanded','false');
  }
  fab.addEventListener('click',function(){ panel.classList.contains('open')?close():open(); });
  panel.querySelector('.qna-close').addEventListener('click',close);
  tabs.forEach(function(t){
    t.addEventListener('click',function(){ currentTab=t.getAttribute('data-tab'); renderTab(); });
  });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && panel.classList.contains('open')) close(); });
  document.addEventListener('click',function(e){
    if(panel.classList.contains('open') && !panel.contains(e.target) && !fab.contains(e.target)) close();
  });
  /* Don't double-fire on the FAB (it's outside the panel). */
  fab.addEventListener('click',function(e){ e.stopPropagation(); });
})();
/* ai-usage.js — counts calls to the Vitalité AI worker (api.vitaliteplan.com)
   for the dev console's "AI usage" panel. Wraps window.fetch; the call itself
   is untouched (same request, same response object handed back).

   Kept per call: which assistant (from the request's mode/type), the model
   the worker says it used, ok/status, latency, question/reply lengths and a
   rough token estimate, language, page, and the rejected/rag flags. The
   question and reply text are never stored.

   Each row goes to Supabase `ai_usage` (ai-usage-schema.sql) and to a
   per-browser ring in localStorage `vt_ai_log` (last 300). If the table isn't
   there yet, the remote write switches itself off for the session. */
(function () {
  'use strict';
  if (window.__vtAiUsage || !window.fetch) return;
  window.__vtAiUsage = true;

  var HOST = 'api.vitaliteplan.com';
  var SB_URL = 'https://eytmbftrjvsntyzwbtzl.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dG1iZnRyanZzbnR5endidHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTU2NjksImV4cCI6MjEwNDIzMTY2OX0.o0vRqteQ5XNgTNvnB3IEE9I67Oo_r4sy7JZ9qOGWSSc';
  var LOCAL = 'vt_ai_log', OFF = 'vt_ai_log_off';
  var raw = window.fetch;

  /* CJK characters run about one token each; everything else about four characters a token */
  function tokens(s) {
    if (!s) return 0;
    var cjk = (s.match(/[　-鿿가-힯＀-￯]/g) || []).length;
    return Math.round(cjk + (s.length - cjk) / 4);
  }
  function who(b) {
    if (!b) return 'other';
    if (b.type === 'checkup_vision') return 'checkup';
    if (b.mode === 'site') return 'vitaline';
    if (b.question != null) return 'vitaxamine';
    return 'other';
  }
  function token() {
    try {
      var s = JSON.parse(localStorage.getItem('sb-eytmbftrjvsntyzwbtzl-auth-token') || 'null');
      if (s && s.access_token && (!s.expires_at || s.expires_at * 1000 > Date.now())) return s.access_token;
    } catch (e) {}
    return null;
  }
  function keep(row) {
    try {
      var a = JSON.parse(localStorage.getItem(LOCAL) || '[]');
      a.push(row);
      if (a.length > 300) a = a.slice(a.length - 300);
      localStorage.setItem(LOCAL, JSON.stringify(a));
    } catch (e) {}
  }
  function send(row) {
    try { if (sessionStorage.getItem(OFF)) return; } catch (e) {}
    var t = token(), r = {};
    for (var k in row) if (k !== 't') r[k] = row[k];
    raw.call(window, SB_URL + '/rest/v1/ai_usage', {
      method: 'POST', keepalive: true,
      headers: { apikey: SB_ANON, Authorization: 'Bearer ' + (t || SB_ANON), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(r)
    }).then(function (res) {
      if (res.status === 404 || res.status === 400 || res.status === 401 || res.status === 403) {
        try { sessionStorage.setItem(OFF, String(res.status)); } catch (e) {}
      }
    }).catch(function () {});
  }
  function log(row) { keep(row); send(row); }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf(HOST) === -1) return raw.apply(window, arguments);
    var body = null;
    try { if (init && typeof init.body === 'string') body = JSON.parse(init.body); } catch (e) {}
    var q = body && typeof body.question === 'string' ? body.question : '';
    var row = {
      t: Date.now(), assistant: who(body), model: null, ok: false, status: 0, latency_ms: 0,
      q_chars: Math.min(q.length, 100000), r_chars: 0, est_in: Math.min(tokens(q), 100000), est_out: 0,
      lang: body && body.lang === 'zh' ? 'zh' : 'en',
      page: (location.pathname.split('/').pop() || 'index.html').slice(0, 80), rejected: false, rag: false
    };
    if (row.assistant === 'checkup') row.model = 'glm-4v-flash';
    var t0 = performance.now();
    var p = raw.apply(window, arguments);
    p.then(function (res) {
      row.latency_ms = Math.round(performance.now() - t0);
      row.status = res.status; row.ok = res.ok;
      return res.clone().json().then(function (d) {
        d = d || {};
        var reply = typeof d.reply === 'string' ? d.reply : '';
        if (d.model) row.model = String(d.model).slice(0, 80);
        row.r_chars = Math.min(reply.length, 100000);
        row.est_out = Math.min(tokens(reply), 100000);
        row.rejected = !!d.rejected; row.rag = !!d.rag;
        if (d.error) row.ok = false;
      }, function () {});
    }, function () {
      row.latency_ms = Math.round(performance.now() - t0);
    }).then(function () { log(row); });
    return p;
  };
})();

/**
 * Vitalité API Worker — api.vitaliteplan.com
 * ===========================================
 *
 * Two assistants, one deploy:
 *
 *   mode: "clinical"  → Infirmary chat tab / AI Assistant (Vitaxamine).
 *                       STRICT clinical-only gate: non-clinical questions are
 *                       auto-rejected (deterministic fast-path + ironclad
 *                       system prompt). Uses glm-4.5-air (Zhipu).
 *                       RAG: retrieves the top-3 most relevant sections from
 *                       the medical knowledge base (kb/medical-kb.json, hosted
 *                       on the Pages site) and grounds the answer in them.
 *                       Graceful degradation: if the KB or embedding call
 *                       fails, answers from the model alone (previous behavior).
 *
 *   mode: "site"      → Floating bottom-right 🤖 button.
 *                       Website guide: navigation, features, pages, how-to.
 *                       Uses Qwen3.8 27B → now Qwen3 30B-A3B (Cloudflare
 *                       Workers AI binding), falling back to glm-4.5-air if
 *                       the binding isn't wired.
 *
 *   type: "checkup_vision" → Body Checkup camera scanning (unchanged contract).
 *
 *   type: "news"      → Social → Forum → News: GLM web search (search_pro) +
 *                       glm-4.5-air writes ≤6 cited posts; cached 6 h per language.
 *
 * Env:
 *   ZHIPU_API_KEY  (secret required) — open.bigmodel.cn key for text + vision
 *   AI binding     (optional) — Workers AI binding named "AI" for mode:"site"
 *   KB_URL         (optional) — where to fetch the medical KB JSON
 *                               (default https://vitaliteplan.com/kb/medical-kb.json)
 *
 * Deploy:
 *   wrangler deploy workers/api-worker.js --name <worker>
 *   or paste the file into Cloudflare dashboard → Workers → your worker → Edit.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const JSON_HEADERS = { "content-type": "application/json" };

// ── Models ──────────────────────────────────────────────────────────────────
const MODEL = {
  clinical: "glm-4.5-air",   // medical-grade text (Zhipu)
  site: "glm-4.5-air",       // fallback for Vitaline (Zhipu) — see SITE_MODEL_CF
  vision: "glm-4v-flash",    // free vision (Zhipu)
};
// Preferred Vitaline model via Cloudflare Workers AI (Qwen3 30B-A3B — MoE,
// 30B total params: >30B floor, 3B active = fast, ~9x cheaper than Qwen3.8 27B)
const SITE_MODEL_CF = "@cf/qwen/qwen3-30b-a3b-fp8";

// ── RAG (retrieval-augmented generation) ─────────────────────────────────────
// The medical knowledge base is a static JSON built by tools/build_kb.py and
// deployed with the Pages site at https://vitaliteplan.com/kb/medical-kb.json.
// Chunks are bilingual (EN/中文) and pre-embedded with Zhipu embedding-3
// (512 dims, normalized). At query time we embed the user's question with the
// SAME model, take the dot product (cosine on normalized vectors), and inject
// the top matches into the clinical system prompt.
const KB_URL_DEFAULT = "https://vitaliteplan.com/kb/medical-kb.json";
const EMBED_MODEL = "embedding-3";
const EMBED_DIMS = 512;
const RAG_TOP_K = 3;          // how many chunks to inject
const RAG_MIN_SCORE = 0.40;   // below this, skip RAG and answer from the model
const KB_TTL_MS = 10 * 60 * 1000; // re-fetch KB at most every 10 min

let kbCache = null;
let kbCacheAt = 0;

async function loadKb(env) {
  const now = Date.now();
  if (kbCache && now - kbCacheAt < KB_TTL_MS) return kbCache;
  const url = env.KB_URL || KB_URL_DEFAULT;
  const r = await fetch(url, { cf: { cacheTtl: 300 } });
  if (!r.ok) throw new Error("kb_" + r.status);
  const doc = await r.json();
  if (!doc || !Array.isArray(doc.chunks)) throw new Error("kb_bad_shape");
  kbCache = doc;
  kbCacheAt = now;
  return doc;
}

async function embedQuery(env, text) {
  const r = await fetch("https://open.bigmodel.cn/api/paas/v4/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + env.ZHIPU_API_KEY,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text, dimensions: EMBED_DIMS }),
  });
  if (!r.ok) throw new Error("embed_" + r.status);
  const data = await r.json();
  const vec = data.data && data.data[0] && data.data[0].embedding;
  if (!vec || !vec.length) throw new Error("embed_empty");
  // Normalize so dot product = cosine
  let norm = 0;
  for (const x of vec) norm += x * x;
  norm = Math.sqrt(norm);
  return norm ? vec.map((x) => x / norm) : vec;
}

function topChunks(doc, qvec, k) {
  const scored = [];
  for (const c of doc.chunks) {
    if (!c.vec || c.vec.length !== qvec.length) continue;
    let dot = 0;
    for (let i = 0; i < qvec.length; i++) dot += qvec[i] * c.vec[i];
    scored.push({ score: dot, chunk: c });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

// ── Hard clinical gate (deterministic fast-path) ─────────────────────────────
// High-precision off-topic patterns — proven non-clinical domains. The model
// system prompt is the backstop for anything these miss; this layer makes the
// most obvious junk instant + free, without ever burning a model call.
const OFFTOPIC_PATTERNS = [
  /\b(recipe|recipes?|cook(ing)?|how to (make|cook|bake)|ingredients?|kitchen|barbecue?|grill)\b/i,
  /\b(weather|forecast|rain|snow|temperature outside)\b/i,
  /\b(world cup|election|campaign|president|politic|war |news today|stock market)\b/i,
  /\b(movie|movies?|film|song|songs?|music|album|actor|actress|celebrity|gossip)\b/i,
  /\b(game|games?|gaming|video game|xbox|playstation|nintendo|minecraft|fortnite)\b/i,
  /\b(code|coding|programming|javascript|typescript|python|rust|java|c\+\+|html|css|api|bug|deploy)\b/i,
  /\b(math|calculus|algebra|geometry|homework|essay|exam tomorrow|school project)\b/i,
  /\b(travel|vacation|hotel|flight|flight ticket|visa)\b/i,
  /\b(what is the meaning of life|tell me a joke|write a story|poem)\b/i,
  // 中文
  /(菜谱|做饭|怎么做|炒|煮|食材|食谱|厨房|天气|下雨|下雪)/i,
  /(世界杯|选举|总统|政治|新闻|股市|股票)/i,
  /(电影|歌曲|音乐|歌手|演员|明星|八卦|游戏|王者荣耀|原神|我的世界)/i,
  /(代码|编程|前端|后端|接口|部署|数学|作业|考试|论文)/i,
  /(旅游|酒店|机票|签证|笑话|写故事|写诗)/i,
];

function isOffTopic(text) {
  if (!text) return false;
  return OFFTOPIC_PATTERNS.some((re) => re.test(text));
}

// ── System prompts ────────────────────────────────────────────────────────────
const CLINICAL_SYSTEM = [
  "You are Vitaxamine, the strict clinical assistant of Vitalité (vitaliteplan.com), a bilingual (English / 中文) sports-medicine and first-aid education site.",
  "You answer ONLY clinical questions: injury assessment, symptoms, likely causes, first aid, treatment, rehabilitation, recovery planning, exercise technique related to injury, anatomy, physiology, and sports-medicine education.",
  "",
  "HARD RULE — AUTO-REJECT EVERYTHING OFF-TOPIC:",
  "If the user's question is not a clinical / medical / injury / diagnosis / recovery topic — meaning anything about general knowledge, current events, sports results, cooking, entertainment, politics, coding, math, school homework, travel, or any non-medical subject — do NOT answer it.",
  "Reply with EXACTLY this refusal template and nothing else:",
  'EN: "I can only answer questions about injuries, symptoms, diagnosis, and recovery — I\'m the clinical assistant here. Please ask about a medical or sports-injury topic instead."',
  'ZH: "我只能回答关于损伤、症状、诊断与恢复的问题 — 我是这里的临床助手。请提出与医疗或运动损伤相关的问题。"',
  "",
  "Medical ground rules: education only, never a formal diagnosis. If the user describes something serious (chest pain, breathing trouble, severe bleeding, possible fracture, head injury) tell them to seek professional care immediately. Keep answers clear, practical, and evidence-informed. Match the user's language.",
  "",
  "When a MEDICAL KNOWLEDGE BASE section is provided below, use it to ground your answer when it is relevant to the question — cite its guidance naturally (e.g. 'per standard sports-medicine first aid…'). Ignore any section that does NOT match the user's situation. If no section is relevant, answer from your own knowledge. Never invent citations.",
].join("\n");

const SITE_SYSTEM = [
  "You are Vitaline, the Vitalité website guide (vitaliteplan.com), a friendly bilingual (English / 中文) assistant that helps visitors use the website.",
  "Answer questions about the site itself: what pages exist, what each page does, how to navigate, how to use features, where to find content.",
  "",
  "Website map:",
  "- Infirmary (诊所): Vitaxamine clinical chat (injury / first-aid / recovery Q&A grounded in the medical KB), AI Body Checkup (point camera at an injury — body map identifies the part, user picks symptoms for guidance), and Recovery Plan builder (phased day-by-day checklists for ankle sprain, low back strain, shoulder strain, etc., progress saved per account).",
  "- Guide / Knowledge Base (知识库): learning content and study tools — chapter decks, flashcards, quizzes, adaptive quizzes, mastery dashboard, debate cards, exam prep (NPTE-style), certificate.",
  "- Community (社区): forum + recovery plan sharing.",
  "- Exam (考试): practice exams with explanations and certificates.",
  "- Account (账户): profile, avatar photo, language toggle (EN / 中文), settings.",
  "- Header has a section switcher (Home / Knowledge / Infirmary / Community / Admin) and a dark-mode toggle.",
  "",
  "Keep answers short and practical, point the user to the exact page or button. Match the user's language. If asked about medical topics, say: for injuries or recovery questions, use the Infirmary's Vitaxamine or Body Checkup — I only help with the website itself.",
].join("\n");

// ── Rejection template (worker-level, used by deterministic gate) ────────────
const REJECT_EN =
  "I can only answer questions about injuries, symptoms, diagnosis, and recovery — I'm the clinical assistant here. Please ask about a medical or sports-injury topic instead.";
const REJECT_ZH =
  "我只能回答关于损伤、症状、诊断与恢复的问题 — 我是这里的临床助手。请提出与医疗或运动损伤相关的问题。";

// ── Helpers ───────────────────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...CORS_HEADERS },
  });
}

function corsOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

async function zhipuChat(env, model, system, userMsg, opts = {}) {
  const { temperature = 0.4, maxTokens = 800, noThink = false } = opts;
  const r = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + env.ZHIPU_API_KEY,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
      temperature,
      max_tokens: maxTokens,
      // glm-4.5 thinks by default and can spend the whole budget on it,
      // returning empty content; turned off where a quick direct answer is wanted
      ...(noThink ? { thinking: { type: "disabled" } } : {}),
    }),
  });
  if (!r.ok) {
    let errText = "";
    try { errText = (await r.json()).error?.message || ""; } catch (e) {}
    throw new Error("zhipu_upstream_" + r.status + " " + errText);
  }
  const data = await r.json();
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
}

async function cfAiChat(env, model, system, userMsg, opts = {}) {
  const { temperature = 0.5, maxTokens = 700 } = opts;
  if (!env.AI) throw new Error("no_ai_binding");
  const out = await env.AI.run(model, {
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ],
    temperature,
    max_tokens: maxTokens,
  });
  return (typeof out === "string" ? out : out?.response) || "";
}

// ── Checkup vision (unchanged contract — see docs/CHECKUP-VISION-WORKER.md) ──
const CHECKUP_PARTS = [
  "head", "neck", "shoulder", "elbow", "wrist", "hand", "chest", "abdomen",
  "upperback", "lowerback", "hip", "thigh", "knee", "shin", "ankle", "foot",
];

// Words a vision model actually uses → our part ids. The old parser only
// accepted the exact string {"part":"id"}, so "lower back", a code fence or a
// stray space all came back as "not found" — the "couldn't read" loop.
const PART_WORDS = [
  ["upperback", ["upper back", "upper_back", "shoulder blade", "scapula", "thoracic"]],
  ["lowerback", ["lower back", "lower_back", "low back", "lumbar", "back"]],
  ["shoulder", ["shoulder", "deltoid", "upper arm", "collarbone", "clavicle"]],
  ["elbow", ["elbow"]],
  ["wrist", ["wrist", "forearm"]],
  ["hand", ["hand", "finger", "thumb", "palm", "knuckle"]],
  ["head", ["head", "face", "forehead", "temple", "jaw", "skull"]],
  ["neck", ["neck"]],
  ["chest", ["chest", "rib", "sternum", "pectoral"]],
  ["abdomen", ["abdomen", "stomach", "belly", "abdominal"]],
  ["hip", ["hip", "glute", "buttock", "groin", "pelvis"]],
  ["thigh", ["thigh", "hamstring", "quadricep", "quad"]],
  ["knee", ["knee", "patella", "kneecap"]],
  ["shin", ["shin", "calf", "calves", "tibia", "lower leg"]],
  ["ankle", ["ankle", "achilles"]],
  ["foot", ["foot", "feet", "toe", "heel", "sole", "arch"]],
];
function parsePart(txt) {
  const s = String(txt || "").toLowerCase();
  // 1) JSON anywhere in the reply (code fences, spaces, extra keys all fine)
  const j = s.match(/\{[\s\S]*?\}/);
  if (j) {
    try {
      const o = JSON.parse(j[0]);
      const v = String(o.part == null ? "" : o.part).toLowerCase().replace(/[\s-]+/g, "");
      if (CHECKUP_PARTS.includes(v)) return v;
      if (o.part != null) { const w = wordPart(String(o.part)); if (w) return w; }
      if (o.part === null && !/\b(knee|ankle|wrist|elbow|shoulder)\b/.test(s)) return null;
    } catch (e) {}
  }
  // 2) a bare id or a body-part word in prose
  return wordPart(s);
}
function wordPart(s) {
  s = " " + String(s).toLowerCase().replace(/[^a-z_ ]+/g, " ") + " ";
  for (const id of CHECKUP_PARTS) if (s.includes(" " + id + " ")) return id;
  for (const [id, words] of PART_WORDS) {
    for (const w of words) if (s.includes(" " + w + " ") || s.includes(" " + w + "s ")) return id;
  }
  return null;
}

async function visionAsk(env, image, prompt) {
  const r = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.ZHIPU_API_KEY },
    body: JSON.stringify({
      model: MODEL.vision,
      messages: [{ role: "user", content: [
        { type: "image_url", image_url: { url: image } },
        { type: "text", text: prompt },
      ] }],
      temperature: 0.1,
    }),
  });
  if (!r.ok) throw new Error("vision_upstream_" + r.status);
  const data = await r.json();
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
}

async function checkupVision(body, env) {
  const image = body.image;
  if (!image || typeof image !== "string") {
    return json({ ok: false, error: "no_image" }, 400);
  }
  // Ask what the photo SHOWS, not what is "injured": people point the camera
  // at the spot that hurts, and most sore spots look perfectly normal.
  const prompt =
    "A person photographed the part of their body that hurts. Which body region is the main subject of the " +
    "photo (closest to the camera, filling the frame, or being touched/pointed at)? Choose ONE id from: " +
    CHECKUP_PARTS.join(", ") +
    '. Reply with JSON only: {"part":"<id>"} — or {"part":null} only if no body is visible at all.';

  let txt = "";
  try {
    txt = await visionAsk(env, image, prompt);
  } catch (e) {
    // some Zhipu deployments reject the data: prefix — retry with bare base64
    const bare = image.replace(/^data:image\/[a-z+]+;base64,/, "");
    try { txt = await visionAsk(env, bare, prompt); }
    catch (e2) { return json({ ok: false, error: String(e2.message || e2) }, 502); }
  }
  return json({ ok: true, part: parsePart(txt), raw: String(txt).slice(0, 120) });
}

// ── Handlers ──────────────────────────────────────────────────────────────────
async function clinicalReply(env, question) {
  // RAG path — best effort; any failure degrades to the plain model call
  try {
    const doc = await loadKb(env);
    const qvec = await embedQuery(env, question);
    const hits = topChunks(doc, qvec, RAG_TOP_K).filter((h) => h.score >= RAG_MIN_SCORE);
    if (!hits.length) {
      return { reply: await zhipuChat(env, MODEL.clinical, CLINICAL_SYSTEM, question, {
        temperature: 0.4, maxTokens: 900,
      }), rag: false };
    }
    const context = hits
      .map((h, i) =>
        `[${i + 1}] ${h.chunk.topic_en} / ${h.chunk.topic_zh}\n${h.chunk.en}\n${h.chunk.zh}`
      )
      .join("\n\n");
    const system = CLINICAL_SYSTEM + "\n\nMEDICAL KNOWLEDGE BASE:\n" + context;
    return { reply: await zhipuChat(env, MODEL.clinical, system, question, {
      temperature: 0.4, maxTokens: 900,
    }), rag: true, top: hits.map((h) => h.chunk.id) };
  } catch (e) {
    // Graceful degradation — answer from the model alone
    const reply = await zhipuChat(env, MODEL.clinical, CLINICAL_SYSTEM, question, {
      temperature: 0.4, maxTokens: 900,
    });
    return { reply, rag: false, ragError: String(e.message || e) };
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// Daily AI quota — the free tier's 5/day is enforced HERE, in the worker.
//
// Before this, nothing counted anything: the page showed a remaining-quota
// number that nothing decremented, and any client could call this endpoint as
// often as it liked. The client-side counter is a courtesy for the UI; this is
// the limit that actually holds.
//
// Requires ai-quota-schema.sql to have been run once in Supabase. Until it
// has, every call is allowed (fail-open) rather than the site breaking for
// everyone — deliberately, so a forgotten migration cannot take the AI down.
//
// PLAN MODEL (matches the tier plan)
//   free     5 calls/day, metered
//   plus     unmetered
//   teacher  unmetered (a school paying ¥68/mo should not be throttled)
//   admin    unmetered
// ═══════════════════════════════════════════════════════════════════════════
const AI_FREE_LIMIT = 5;
const SB = "https://eytmbftrjvsntyzwbtzl.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dG1iZnRyanZzbnR5endidHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTU2NjksImV4cCI6MjEwNDIzMTY2OX0.o0vRqteQ5XNgTNvnB3IEE9I67Oo_r4sy7JZ9qOGWSSc";

async function sha256hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* Who is calling. A signed-in user is identified by their real Supabase id so
   the quota follows the account across devices. Anonymous callers get a hash
   of IP + user-agent, which is stable enough to rate-limit one visitor and
   leaks nothing about them. */
async function aiIdentity(request) {
  const auth = request.headers.get("Authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  if (m) {
    try {
      const r = await fetch(SB + "/auth/v1/user", {
        headers: { apikey: SB_ANON, Authorization: "Bearer " + m[1] },
      });
      if (r.ok) {
        const u = await r.json();
        if (u && u.id) return { uid: "u:" + u.id, signedIn: true };
      }
    } catch (e) { /* fall through to anonymous */ }
  }
  const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
  const ua = request.headers.get("User-Agent") || "";
  return { uid: "a:" + (await sha256hex(ip + "|" + ua)).slice(0, 40), signedIn: false };
}

/* Returns {ok:true, left, unlimited} or {ok:false, left:0} when the day's
   allowance is spent. Fails OPEN: if the Supabase call errors we allow the
   request, because an AI that refuses to answer because of a metering outage
   is worse than an unmetered one. */
async function aiQuota(request) {
  try {
    const who = await aiIdentity(request);
    const r = await fetch(SB + "/rest/v1/rpc/ai_touch", {
      method: "POST",
      headers: {
        apikey: SB_ANON,
        Authorization: "Bearer " + SB_ANON,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_uid: who.uid, p_limit: AI_FREE_LIMIT }),
    });
    if (!r.ok) return { ok: true, left: null, unlimited: false, unknown: true };
    const d = await r.json();
    if (d && d.allowed === false) return { ok: false, left: 0, limit: d.limit || AI_FREE_LIMIT, plan: d.plan };
    return { ok: true, left: d ? d.left : null, limit: d ? d.limit : AI_FREE_LIMIT, plan: d ? d.plan : "free", unlimited: !!(d && d.unlimited) };
  } catch (e) {
    return { ok: true, left: null, unlimited: false, unknown: true };
  }
}

async function handleText(body, env, request) {
  const question = String(body.question || "").trim();
  const lang = body.lang === "zh" ? "zh" : "en";
  if (!question) return json({ lang, reply: "", error: "empty_question" }, 400);

  const mode = body.mode === "site" ? "site" : "clinical";

  // ── Daily quota ──
  // The news feed is a background refresh, not a reader's question, so it is
  // never metered (it is served from cache almost every time anyway).
  const q = await aiQuota(request);
  if (!q.ok) {
    return json(
      {
        lang,
        error: "quota_exhausted",
        left: 0,
        limit: q.limit || AI_FREE_LIMIT,
        message: lang === "zh"
          ? "\u4eca\u65e5 AI \u989d\u5ea6\u5df2\u7528\u5b8c\uff0c\u660e\u5929\u91cd\u65b0\u5f00\u653e\u3002"
          : "You have used today's free AI calls. They reset tomorrow.",
      },
      429
    );
  }

  // ── CLINICAL MODE — strict gate + RAG ──
  if (mode === "clinical") {
    if (isOffTopic(question)) {
      return json({ lang, reply: lang === "zh" ? REJECT_ZH : REJECT_EN, mode, rejected: true });
    }
    let out;
    try {
      out = await clinicalReply(env, question);
    } catch (e) {
      return json({ lang, error: String(e.message || e), mode }, 502);
    }
    return json({ lang, reply: out.reply, mode, model: MODEL.clinical, rag: !!out.rag, ragTop: out.top, left: q.left, limit: q.limit, unlimited: q.unlimited });
  }

  // ── SITE MODE — website guide (smaller >30B model preferred) ──
  let reply, used = MODEL.site;
  // Try Cloudflare Workers AI binding first (Qwen3 30B-A3B — MoE, >30B total, cheap)
  try {
    reply = await cfAiChat(env, SITE_MODEL_CF, SITE_SYSTEM, question, {
      temperature: 0.5,
      maxTokens: 700,
    });
    used = SITE_MODEL_CF;
  } catch (e) {
    // No AI binding or upstream error → fall back to Zhipu glm-4.5-air
    try {
      reply = await zhipuChat(env, MODEL.site, SITE_SYSTEM, question, {
        temperature: 0.5,
        maxTokens: 700,
        noThink: true,
      });
    } catch (e2) {
      return json({ lang, error: String(e2.message || e2), mode }, 502);
    }
  }
  return json({ lang, reply, mode, model: used, left: q.left, limit: q.limit, unlimited: q.unlimited });
}

// ── News (Vitalite Social → Forum → News) ─────────────────────────────────────
// { type:"news", lang } → { ok, generated_at, posts:[{title, summary, tag, source, link, date}] }
// GLM searches the web (Zhipu web_search, search_pro engine) for recent sports-
// science news, then glm-4.5-air writes short posts from those results only,
// each keeping its real source link. Cached for 6 hours per language at the edge
// (caches.default), so only the first visitor after a refresh waits. If a Cron
// Trigger is added to this worker, scheduled() refreshes both languages ahead.
const NEWS_TTL = 6 * 3600;
const NEWS_QUERIES = {
  en: ["sports science new study athletes", "sports medicine research news", "exercise physiology study published", "sports nutrition research news", "sports injury prevention study"],
  zh: ["运动科学 最新研究", "运动医学 研究 新闻", "运动营养 最新研究", "运动损伤 预防 研究", "运动生理学 新研究"],
};
const NEWS_BLOCK = /casino|bet|gambl|lottery|aiyouxi|彩票|博彩|赌|娱乐城|体育登录/i;

async function webSearch(env, q) {
  const r = await fetch("https://open.bigmodel.cn/api/paas/v4/web_search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.ZHIPU_API_KEY },
    body: JSON.stringify({ search_engine: "search_pro", search_query: q, count: 10, search_recency_filter: "oneMonth" }),
  });
  if (!r.ok) return [];
  const d = await r.json();
  return (d.search_result || []).filter((x) => x && x.link && x.title && !NEWS_BLOCK.test(x.title + " " + (x.media || "")));
}

async function buildNews(env, lang) {
  const lists = await Promise.all(NEWS_QUERIES[lang].map((q) => webSearch(env, q).catch(() => [])));
  const seen = new Set(), pool = [];
  lists.flat().forEach((x) => {
    const k = x.link.replace(/[#?].*$/, "");
    if (seen.has(k)) return;
    seen.add(k);
    pool.push({ title: x.title.slice(0, 160), content: String(x.content || "").slice(0, 500), link: x.link, source: x.media || "", date: String(x.publish_date || "").replace(/\//g, "-") });
  });
  pool.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const items = pool.slice(0, 24);
  if (!items.length) return [];
  const sys = lang === "zh"
    ? "你是 Vitalité 社区的新闻编辑。只根据给出的搜索结果，挑选最多 6 条与运动科学、运动医学、运动营养或运动损伤相关的、最新且可信的新闻或研究。跳过广告、赌博、无关或重复的条目。每条用中文写：title（不超过 30 字）、summary（2-3 句，说清楚发现了什么、对运动员意味着什么）、tag（研究/损伤/营养/训练/恢复/行业 之一）。source 和 link、date 必须原样取自对应结果，绝不编造。只输出 JSON 数组。"
    : "You are the news editor for the Vitalité community. Using ONLY the search results given, pick up to 6 recent, credible news items or studies about sports science, sports medicine, sports nutrition or sports injury. Skip ads, gambling, off-topic or duplicate items. For each write in English: title (max 14 words), summary (2-3 sentences: what was found and what it means for athletes), tag (one of Research, Injury, Nutrition, Training, Recovery, Industry). source, link and date must be copied exactly from the matching result; never invent any. Output a JSON array only.";
  const user = JSON.stringify(items.map((x, i) => ({ n: i + 1, title: x.title, content: x.content, source: x.source, link: x.link, date: x.date })));
  const raw = await zhipuChat(env, MODEL.site, sys, user, { temperature: 0.3, maxTokens: 1800, noThink: true });
  const m = String(raw).match(/\[[\s\S]*\]/);
  let posts = [];
  try { posts = JSON.parse(m ? m[0] : "[]"); } catch (e) { posts = []; }
  const links = new Set(items.map((x) => x.link));
  return posts
    .filter((p) => p && p.title && p.summary && links.has(p.link))        // only links that really came back from the search
    .slice(0, 6)
    .map((p) => ({ title: String(p.title).slice(0, 140), summary: String(p.summary).slice(0, 600), tag: String(p.tag || "").slice(0, 20), source: String(p.source || "").slice(0, 60), link: p.link, date: String(p.date || "").slice(0, 10) }));
}

async function newsFeed(body, env, ctx) {
  const lang = body && body.lang === "zh" ? "zh" : "en";
  const key = new Request("https://api.vitaliteplan.com/__news/v1/" + lang);
  const cache = typeof caches !== "undefined" ? caches.default : null;
  if (cache) {
    const hit = await cache.match(key);
    if (hit) { const d = await hit.json(); return json({ ...d, cached: true }); }
  }
  let posts = [];
  try { posts = await buildNews(env, lang); } catch (e) { return json({ ok: false, error: String(e.message || e) }, 502); }
  const out = { ok: true, lang, generated_at: new Date().toISOString(), posts };
  if (cache && posts.length) {
    const res = new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "Cache-Control": "max-age=" + NEWS_TTL } });
    const put = cache.put(key, res);
    if (ctx && ctx.waitUntil) ctx.waitUntil(put); else await put;
  }
  return json(out);
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return corsOptions();
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: "invalid_json" }, 400);
    }

    // Checkup vision — branch before text path (contract preserved)
    if (body && body.type === "checkup_vision") {
      return checkupVision(body, env);
    }

    // Social → News feed (web search + GLM, cached 6 h)
    if (body && body.type === "news") {
      return newsFeed(body, env, ctx);
    }

    // Text path
    return handleText(body, env, request);
  },

  // Optional: add a Cron Trigger (e.g. every 6 hours) to refresh the news ahead
  // of visitors. Without one, the first visitor after the cache expires refreshes it.
  async scheduled(event, env, ctx) {
    const cache = caches.default;
    for (const lang of ["en", "zh"]) {
      const posts = await buildNews(env, lang).catch(() => []);
      if (!posts.length) continue;
      const out = { ok: true, lang, generated_at: new Date().toISOString(), posts };
      ctx.waitUntil(cache.put(new Request("https://api.vitaliteplan.com/__news/v1/" + lang),
        new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "Cache-Control": "max-age=" + NEWS_TTL } })));
    }
  },
};
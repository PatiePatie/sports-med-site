/**
 * Vitalité API Worker — api.vitaliteplan.com
 * ===========================================
 *
 * Two assistants, one deploy:
 *
 *   mode: "clinical"  → Infirmary chat tab / AI Assistant.
 *                       STRICT clinical-only gate: non-clinical questions are
 *                       auto-rejected (deterministic fast-path + ironclad
 *                       system prompt). Uses glm-4.5-air (Zhipu).
 *
 *   mode: "site"      → Floating bottom-right 🤖 button.
 *                       Website guide: navigation, features, pages, how-to.
 *                       Uses Qwen3.8 27B (Cloudflare Workers AI binding),
 *                       falling back to glm-4.5-air if the binding isn't wired.
 *
 *   type: "checkup_vision" → Body Checkup camera scanning (unchanged contract).
 *
 * Env:
 *   ZHIPU_API_KEY  (secret required) — open.bigmodel.cn key for text + vision
 *   AI binding     (optional) — Workers AI binding named "AI" for mode:"site"
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
  site: "glm-4.5-air",       // fallback site helper (Zhipu) — see SITE_MODEL_CF
  vision: "glm-4v-flash",    // free vision (Zhipu)
};
// Preferred site-helper model via Cloudflare Workers AI (Qwen3.8 27B — dense,
// simpler + faster than 70B, still plenty smart for website guidance)
const SITE_MODEL_CF = "@cf/qwen/qwen3.8-27b";

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
  "You are Vitalité Infirmary, the strict clinical assistant of Vitalité (vitaliteplan.com), a bilingual (English / 中文) sports-medicine and first-aid education site.",
  "You answer ONLY clinical questions: injury assessment, symptoms, likely causes, first aid, treatment, rehabilitation, recovery planning, exercise technique related to injury, anatomy, physiology, and sports-medicine education.",
  "",
  "HARD RULE — AUTO-REJECT EVERYTHING OFF-TOPIC:",
  "If the user's question is not a clinical / medical / injury / diagnosis / recovery topic — meaning anything about general knowledge, current events, sports results, cooking, entertainment, politics, coding, math, school homework, travel, or any non-medical subject — do NOT answer it.",
  "Reply with EXACTLY this refusal template and nothing else:",
  'EN: "I can only answer questions about injuries, symptoms, diagnosis, and recovery — I\'m the clinical assistant here. Please ask about a medical or sports-injury topic instead."',
  'ZH: "我只能回答关于损伤、症状、诊断与恢复的问题 — 我是这里的临床助手。请提出与医疗或运动损伤相关的问题。"',
  "",
  "Medical ground rules: education only, never a formal diagnosis. If the user describes something serious (chest pain, breathing trouble, severe bleeding, possible fracture, head injury) tell them to seek professional care immediately. Keep answers clear, practical, and evidence-informed. Match the user's language.",
].join("\n");

const SITE_SYSTEM = [
  "You are the Vitalité website guide (vitaliteplan.com), a friendly bilingual (English / 中文) assistant that helps visitors use the website.",
  "Answer questions about the site itself: what pages exist, what each page does, how to navigate, how to use features, where to find content.",
  "",
  "Website map:",
  "- Infirmary (诊所): Recovery Assistant chat (clinical Q&A), AI Body Checkup (point camera at an injury — body map identifies the part, user picks symptoms for guidance), and Recovery Plan builder (phased day-by-day checklists for ankle sprain, low back strain, shoulder strain, etc., progress saved per account).",
  "- Guide / Knowledge Base (知识库): learning content and study tools — chapter decks, flashcards, quizzes, adaptive quizzes, mastery dashboard, debate cards, exam prep (NPTE-style), certificate.",
  "- Community (社区): forum + recovery plan sharing.",
  "- Exam (考试): practice exams with explanations and certificates.",
  "- Account (账户): profile, avatar photo, language toggle (EN / 中文), settings.",
  "- Header has a section switcher (Home / Knowledge / Infirmary / Community / Admin) and a dark-mode toggle.",
  "",
  "Keep answers short and practical, point the user to the exact page or button. Match the user's language. If asked about medical topics, say: for injuries or recovery questions, use the Infirmary's Recovery Assistant or Body Checkup — I only help with the website itself.",
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
  const { temperature = 0.4, maxTokens = 800 } = opts;
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

async function checkupVision(body, env) {
  const image = body.image;
  if (!image || typeof image !== "string") {
    return json({ ok: false, error: "no_image" }, 400);
  }
  const lang = body.lang === "zh" ? "zh" : "en";
  const prompt =
    lang === "zh"
      ? "只看这张照片中人体不适当部位。只能用这些ID之一回答: " +
        CHECKUP_PARTS.join(",") +
        "。若无法确定,回答 null。输出格式: {\"part\": \"id\"} 或 {\"part\": null},不要输出其他内容。"
      : "Identify the body part in this photo that is injured or uncomfortable, using ONLY one of these IDs: " +
        CHECKUP_PARTS.join(",") +
        ". If none can be determined, use null. Reply with EXACTLY {\"part\": \"id\"} or {\"part\": null} and nothing else.";

  let r;
  try {
    r = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + env.ZHIPU_API_KEY,
      },
      body: JSON.stringify({
        model: MODEL.vision,
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: image } },
              { type: "text", text: prompt },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });
  } catch (e) {
    return json({ ok: false, error: "vision_network" }, 502);
  }
  if (!r.ok) {
    return json({ ok: false, error: "vision_upstream_" + r.status }, 502);
  }
  const data = await r.json();
  const txt =
    (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  const m = txt.match(/\{"part"\s*:\s*("?)([a-z]*)\1\}/);
  const part = m && CHECKUP_PARTS.includes(m[2]) ? m[2] : null;
  return json({ ok: true, part });
}

// ── Handlers ──────────────────────────────────────────────────────────────────
async function handleText(body, env) {
  const question = String(body.question || "").trim();
  const lang = body.lang === "zh" ? "zh" : "en";
  if (!question) return json({ lang, reply: "", error: "empty_question" }, 400);

  const mode = body.mode === "site" ? "site" : "clinical";

  // ── CLINICAL MODE — strict gate ──
  if (mode === "clinical") {
    if (isOffTopic(question)) {
      return json({ lang, reply: lang === "zh" ? REJECT_ZH : REJECT_EN, mode, rejected: true });
    }
    let reply;
    try {
      reply = await zhipuChat(env, MODEL.clinical, CLINICAL_SYSTEM, question, {
        temperature: 0.4,
        maxTokens: 900,
      });
    } catch (e) {
      return json({ lang, error: String(e.message || e), mode }, 502);
    }
    return json({ lang, reply, mode, model: MODEL.clinical });
  }

  // ── SITE MODE — website guide (smaller >30B model preferred) ──
  let reply, used = MODEL.site;
  // Try Cloudflare Workers AI binding first (Llama 3.3 70B — dense, simpler, >30B)
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
      });
    } catch (e2) {
      return json({ lang, error: String(e2.message || e2), mode }, 502);
    }
  }
  return json({ lang, reply, mode, model: used });
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
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

    // Text path
    return handleText(body, env);
  },
};
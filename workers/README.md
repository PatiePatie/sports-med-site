# Vitalité API Worker — `api.vitaliteplan.com`

> **⚠️ DEPLOY OWNER: Patrick (PatiePatie) or Oliver — whoever holds the
> `api.vitaliteplan.com` Cloudflare account.** The original worker source was
> never in a repo and there are **no local CF credentials/wrangler** — this
> file IS the source of truth and must be pasted into the CF dashboard to
> activate the clinical/site split. Ping on PR #111.

Two assistants, one Cloudflare Worker.

## Assistant routing

| `mode` field | Sends from | Behavior | Model |
|---|---|---|---|
| `clinical` (default) | Infirmary chat tab ("Vitaxamine") | **Clinical-only.** Non-clinical questions auto-rejected (deterministic gate + strict system prompt). **RAG:** top-3 relevant medical KB sections retrieved and injected to ground the answer; degrades gracefully to model-only if KB/embedding fails. | `glm-4.5-air` (Zhipu, 106B MoE) + `embedding-3` retrieval |
| `site` | Floating bottom-right 🤖 button **Vitaline** (all pages) | Website guide: navigation, pages, features, how-to. | Qwen3 30B-A3B (Workers AI binding) → falls back to `glm-4.5-air` |
| `type:"checkup_vision"` | Infirmary AI Body Checkup camera | Identifies injured body part from photo. | `glm-4v-flash` (Zhipu) |

The frontend sets the mode per entry point:
- Chat tab / Infirmary AI → `medaiAsk(q, "clinical")`
- Floating button (Vitaline) modal → `medaiAsk(q, "site")`

## Request / response

POST `https://api.vitaliteplan.com` with JSON:

```json
{ "question": "What should I do for a sprained ankle?", "lang": "en", "mode": "clinical" }
```

Response:

```json
{ "lang": "en", "reply": "...", "mode": "clinical", "model": "glm-4.5-air", "rag": true, "ragTop": ["ankle-sprain", "swelling-management", "ankle-sprain-rehab"] }
```

`"rag": true` means the reply was grounded in retrieved KB sections (`ragTop` lists which chunk IDs); `"rag": false` means the model answered alone (off-topic-ish query, or KB/embedding degraded).

Off-topic clinical-mode question → rejected reply with `"rejected": true`:

```json
{ "lang": "en", "reply": "I can only answer questions about injuries, symptoms, diagnosis, and recovery…", "mode": "clinical", "rejected": true }
```

### Checkup vision (unchanged)

```json
{ "type": "checkup_vision", "image": "data:image/jpeg;base64,....", "lang": "en" }
```

→ `{ "ok": true, "part": "knee" }` or `{ "ok": true, "part": null }`.

## Medical knowledge base (RAG)

The clinical assistant grounds answers in `kb/medical-kb.json` — a bilingual
(EN / 中文) sports-medicine / first-aid KB of 45 chunks, each pre-embedded with
Zhipu `embedding-3` (512 dims, normalized).

- **Source of truth:** `tools/build_kb.py` — edit the `CHUNKS` list, then:
  ```bash
  ZHIPU_API_KEY=... python3 tools/build_kb.py
  ```
  This regenerates `kb/medical-kb.json` (committed to the repo).
- **Hosting:** the KB JSON is served as a static asset by the Pages site at
  `https://vitaliteplan.com/kb/medical-kb.json` (deploy the repo → Pages as
  usual; commit the regenerated JSON with any content change).
- **Fetching:** the worker lazily fetches the KB on first clinical request and
  caches it 10 min (module scope). Override the URL with `KB_URL` env if needed.
- **Query flow:** embed the user's question (`embedding-3`, same model), dot
  product against all chunks (cosine on normalized vectors), take top-3 with
  score ≥ 0.40, inject into the system prompt as `MEDICAL KNOWLEDGE BASE`, and
  let the model ground its answer in them (it is told to ignore non-matching
  sections). Any failure in this chain degrades silently to model-only answers.

> When you update the KB content in the future: edit `CHUNKS` in
> `tools/build_kb.py`, regenerate, and commit — the Pages deploy serves the new
> vectors. No worker redeploy needed (the URL is stable).

## Environment

- `ZHIPU_API_KEY` — **secret, required.** From open.bigmodel.cn. Same key the old worker used — no change needed.
- `AI` — **Workers AI binding, optional but recommended** for `mode:"site"`:
  - **Dashboard:** Worker → Settings → Bindings → Add binding → Workers AI → name it `AI`. Save + Deploy.
  - **wrangler.toml:**
    ```toml
    [[ai]]
    binding = "AI"
    ```
  - Without it, `mode:"site"` automatically falls back to `glm-4.5-air` — everything still works.

## Deploy

Either:

1. **Dashboard (easiest):** Cloudflare → Workers & Pages → your `api.vitaliteplan.com` worker → Edit code → paste the entire contents of `api-worker.js` → Deploy.
2. **Wrangler:**
   ```bash
   wrangler deploy api-worker.js --name <worker-name> --compatibility-date 2024-01-01
   ```

The route `api.vitaliteplan.com/*` must point at the worker (custom domain or route pattern).

## Verify after deploy

```bash
# clinical — on-topic (should answer)
curl -s -X POST https://api.vitaliteplan.com -H 'Content-Type: application/json' \
  -d '{"question":"What should I do for a sprained ankle?","lang":"en","mode":"clinical"}'

# clinical — off-topic (should auto-reject, "rejected": true)
curl -s -X POST https://api.vitaliteplan.com -H 'Content-Type: application/json' \
  -d '{"question":"What is the recipe for tomato eggs?","lang":"en","mode":"clinical"}'

# site mode (floating button — website guide answer)
curl -s -X POST https://api.vitaliteplan.com -H 'Content-Type: application/json' \
  -d '{"question":"Where is the recovery plan builder?","lang":"en","mode":"site"}'

# checkup vision (routing probe, empty image → graceful error proves routing)
curl -s -X POST https://api.vitaliteplan.com -H 'Content-Type: application/json' \
  -d '{"type":"checkup_vision","image":"data:image/jpeg;base64,/9j/4AAQSkZJRg==","lang":"en"}'
```

## Why the source was recreated

The original worker was deployed directly to Cloudflare and its source was never
checked into any repository. This file is the full, version-controlled recovery
of that worker plus the new mode routing. Keep it here — never lose it again.
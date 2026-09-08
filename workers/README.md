# Vitalité API Worker — `api.vitaliteplan.com`

Two assistants, one Cloudflare Worker.

## Assistant routing

| `mode` field | Sends from | Behavior | Model |
|---|---|---|---|
| `clinical` (default) | Infirmary chat tab ("AI Assistant") | **Clinical-only.** Non-clinical questions auto-rejected (deterministic gate + strict system prompt). | `glm-4.5-air` (Zhipu, 106B MoE) |
| `site` | Floating bottom-right 🤖 button (all pages) | Website guide: navigation, pages, features, how-to. | Qwen3.8 27B (Workers AI binding) → falls back to `glm-4.5-air` |
| `type:"checkup_vision"` | Infirmary AI Body Checkup camera | Identifies injured body part from photo. | `glm-4v-flash` (Zhipu) |

The frontend sets the mode per entry point:
- Chat tab / AI Assistant → `medaiAsk(q, "clinical")`
- Floating button modal → `medaiAsk(q, "site")`

## Request / response

POST `https://api.vitaliteplan.com` with JSON:

```json
{ "question": "What should I do for a sprained ankle?", "lang": "en", "mode": "clinical" }
```

Response:

```json
{ "lang": "en", "reply": "...", "mode": "clinical", "model": "glm-4.5-air" }
```

Off-topic clinical-mode question → rejected reply with `"rejected": true`:

```json
{ "lang": "en", "reply": "I can only answer questions about injuries, symptoms, diagnosis, and recovery…", "mode": "clinical", "rejected": true }
```

### Checkup vision (unchanged)

```json
{ "type": "checkup_vision", "image": "data:image/jpeg;base64,....", "lang": "en" }
```

→ `{ "ok": true, "part": "knee" }` or `{ "ok": true, "part": null }`.

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
# Cloudflare WAF & Security Headers — Vitalité (vitaliteplan.com)

For: **Neo** (Cloudflare account owner). Site: static GitHub Pages origin behind Cloudflare.
Server/app-side hardening (Supabase RLS + login/forum rate limits) is already shipped separately — this doc covers ONLY the edge layer.

**Why headers can't go in git:** GitHub Pages cannot set custom response headers. The only places to set them are (a) Cloudflare Transform Rules or (b) weak `<meta>` tags (referrer meta already added to all 25 HTML pages). Real headers = Cloudflare.

---

## 1. Transform Rules → Modify Response Headers (apply FIRST, highest priority)

Create ONE rule matching **all traffic**, then add these headers:

| Header | Value | Note |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | 1yr HSTS |
| `X-Frame-Options` | `DENY` | clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | matches the meta tags |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | strip sensors the site never uses |

**Select:** Hostname = `vitaliteplan.com` → **Then:** Set static response header for each above.
**Expression:** `(http.host eq "vitaliteplan.com")`

### CSP — DO NOT enable (yet)
Every page runs inline scripts (`onclick="Forum.vote(...)"`, inline `<script>` blocks).
A strict CSP will **silently brick the whole site** for crawl and real users.
If desired later, the codebase must be migrated to external JS + nonces first — that's a separate project. For now: **omit CSP**.

---

## 2. WAF → Managed Rules

- **Cloudflare Managed Ruleset:** ON with default (or "High") sensitivity.
- **OWASP Core Ruleset:** ON at PL3 (false positives manageable for static content; if anything 406s, drop to PL2 and log).
- **Russia/China Geo Block:** OPTIONAL — the site is a China-facing bilingual product; do NOT block CN. Blocking only makes sense if used from one region.
- Leave **WAF Attack Score** on (Threat Intelligence / Common Attack Vectors).

---

## 3. Bot Fight Mode / Bots

- **Bot Fight Mode: ON.** Static content — the few false positives you get are fine.
- Current config means bots still 200 (auth-gate.js grants a UA allowlist, robots.txt allows all) — see AI allowlist below.

---

## 4. Rate Limiting Rules (2 rules)

| Rule | Expression | Limit | Action |
|---|---|---|---|
| login hammer | `(http.host eq "vitaliteplan.com" and any(uri_contains{lower(uri)}[*] contains "/login.html"))` | 30 req / 60s | Block 10 min |
| admin + forum writes | `(http.host eq "vitaliteplan.com" and (any(uri_contains{lower(uri)}[*] contains "/admin.html") or any(uri_contains{lower(uri)}[*] contains "/social.html")))` | 60 req / 60s | Block 10 min |

Note: password auth itself lives on `eytmbftrjvsntyzwbtzl.supabase.co` (separate origin) with SUPABASE's own rate limits — these rules protect the static routes from hammering, not the auth endpoint.

---

## 5. AI crawler ALLOWLIST (CRITICAL — user requirement: AIs must keep working)

The site must stay accessible to AI crawlers. Create a **Skip** (or bypass) rule **ABOVE** Bot Fight Mode + Managed Rules so known-bot UAs never get challenged:

```
(any(http.user_agent[*] contains "Googlebot")
 or any(http.user_agent[*] contains "Google-Extended")
 or any(http.user_agent[*] contains "GPTBot")
 or any(http.user_agent[*] contains "ChatGPT-User")
 or any(http.user_agent[*] contains "OAI-SearchBot")
 or any(http.user_agent[*] contains "ClaudeBot")
 or any(http.user_agent[*] contains "anthropic-ai")
 or any(http.user_agent[*] contains "Claude-SearchBot")
 or any(http.user_agent[*] contains "PerplexityBot")
 or any(http.user_agent[*] contains "Bytespider")
 or any(http.user_agent[*] contains "Applebot-Extended")
 or any(http.user_agent[*] contains "CCBot")
 or any(http.user_agent[*] contains "Meta-ExternalAgent")
 or any(http.user_agent[*] contains "Amazonbot")
 or any(http.user_agent[*] contains "cohere-ai")
 or any(http.user_agent[*] contains "YouBot")
 or any(http.user_agent[*] contains "PetalBot"))
```

Action: **Skip** → Security Level, WAF Managed Rules, Bot Fight Mode, and Rate Limiting rules.
Redirect/verification challenges would otherwise 403 or stall crawlers. The app layer already exempts these UAs in `auth-gate.js`, so crawlers get full content, humans get the sign-in gate.

`robots.txt` already allows all — no change needed.

---

## 6. Gotchas

- **GitHub Pages caches 4h** (`cache-control: max-age=14400`) + CF edge cache → after any deploy, expect stale content up to 4h. Existing practice: versioned filenames (`?v=6`) in commits. Keep it up.
- **Verify after applying:** `curl -sI https://vitaliteplan.com/ | grep -iE 'strict-transport|x-frame|x-content|referrer|permissions'`
- **Skip rule order matters:** Skip rules must sort above Managed Rules/Bot Fight Mode in the rules list.
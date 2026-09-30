# AGENTS.md — working on vitaliteplan.com

Read this before changing anything. Almost every trap below has already cost a
session, and each one fails *silently* rather than loudly.

**No credentials belong in this repo.** The only secret-shaped thing that should
ever be committed is the Supabase *anon* key, which is browser-facing and public
by design. Never commit a `service_role` key, an API token, or a password.

---

## 1 · What this is

A static site on **GitHub Pages**, fronted by Cloudflare as DNS proxy only.
There is no server. The dynamic parts are **Supabase** (auth, forum, classroom)
and, for AI chat, a Cloudflare Worker.

Repo `PatiePatie/sports-med-site`, branch `main`, live at `vitaliteplan.com`.

### Page shell

Every page repeats the same parts by hand — there is no build step, no bundler,
no framework:

- a `<nav class="sidebar">` with `.sidebar-group.part` blocks
- a sticky `<header>` with `#langToggle`, `#darkToggle`, `#loginBtn`
- a `<script src="...-course.js">` or equivalent, plus `site-content.js`
- bilingual content via `data-en` / `data-zh`

**Consequence: a change to a shared visual usually means editing 15+ files.**
The sidebar alone is copy-pasted across 15 pages. Budget for that, and assert
the edit landed on all of them rather than assuming.

### Pages

| file | what |
|---|---|
| `index.html` | public marketing landing. The only page **outside** the auth gate |
| `home.html` | signed-in dashboard: three course boxes + progress |
| `guide.html` | Vitalité textbook. **1.1 MB** — see §3 |
| `toc.html` `exam.html` `cn-cert.html` `ib-sehs*.html` `g10-bio.html` `usabo.html` | other courses |
| `infirmary.html` `plan.html` `checkup.html` | the infirmary section |
| `social.html` | forum |
| `admin.html` | dev console |
| `classroom.html` | teacher/student classrooms |
| `login.html` | auth. **The only page that loads the Supabase SDK** |

---

## 2 · Pushing — `git push` does not work here

`git push` fails on this network (RPC errors, hangs). Use the **Git Data API**
via `gh api`. `tools/push.py` in this repo wraps it:

```bash
python3 tools/push.py <branch-name> "<commit message>" <file> [file ...]
```

It creates blobs, a tree, a commit parented on `main`, and the ref, then prints
the file list. Open the PR separately:

```bash
gh pr create -R PatiePatie/sports-med-site --base main --head <branch> --title "..." --body-file pr.md
```

`main` is **PR-only** — see `.coordination/CONCURRENCY.md`. Wait for the
`skin-coherence` check to report `completed` (not merely "queued"), then merge:

```bash
gh pr merge <n> -R PatiePatie/sports-med-site --merge --delete-branch
```

A changed file behind an **unchanged** `?v=` pin is cached at the Cloudflare edge
for up to 4 hours. Bump the pin on every page that loads it, in the same commit.

---

## 3 · The traps

### `guide.html` is over 1 MB, and `/contents` lies

`GET /contents/<path>` returns a **valid empty body** for any file over 1 MB,
and still answers 200. It looks like a successful no-op. Always:

```python
meta = json.loads(api('contents/%s?ref=main' % name))
if meta['size'] < 1000000:
    text = b64decode(api('contents/...', '.content'))
else:
    text = b64decode(api('git/blobs/' + meta['sha'], '.content'))
assert text.rstrip().endswith('</html>')
```

`toc.html` (433 KB), `cn-cert.html` (525 KB), `g10-bio.html` (563 KB) are under
the limit but close. `ib-sehs-models.js` is 519 KB.

### Rebuild payloads from `main`, never from a local copy

A payload builder that re-writes a file it has already edited will apply its
edit twice. This shipped a `<script>` tag **three times** on three pages. Make
the builder idempotent, and assert a page can hold at most one copy.

### Pins and the 4-hour edge cache

`?v=N` is a manual cache-buster. Change a JS or CSS file → bump the pin on
every page that references it, and bump it **above every value ever used**, so
no stale copy can shadow it. Check with:

```bash
grep -o 'asset\.js?v=[0-9]*' page.html
```

After merging, **poll the live HTML until the new pin appears** before fetching
the asset. Fetching a fresh `?v=` URL before the Pages build has flushed
origin is what poisons a URL for hours.

### The first three icons vs the sidebar icons

They are **different systems**, and mixing them is visible:

- **top-bar pills** get full-colour emblems from `shapes-fx.js`, chosen by
  `soft-fx.js` `pillEmblems()` from the pill's **href**
- **sidebar group icons** are 16×16 line art from `vi-icons.js`

A new section needs an entry in **both**, or it renders in the wrong style.

### Tap targets

The convention is **40px minimum**. A compact painted control gets there with a
`::before` overlay, not by growing it — unless the bar genuinely has room (the
top bar is 48px, and the pill capsule had to move its hide cut-off from 900px
to 950px when a fourth pill pushed it to 172px). Measure, don't assume.

### Slicing the shell out of an existing page

Copying a page means keeping `<div class="page-wrapper">` **and the whole
`<header>`**. Slicing at the page-wrapper div silently drops the lang/dark/login
buttons. Also: `foot` and `tail` must not overlap, or `</body></html>` get
emitted twice and any script appended afterwards lands outside the document.

### Bilingual markup

`data-en` / `data-zh` are swapped as `textContent`, so **an element cannot have
both attributes and its text set by JS** — the language toggle overwrites the
dynamic value. Choose one. The classroom page stores `_rich.en` / `_rich.zh` on
a node and re-renders instead.

### Never trust `sm_user`

`localStorage.sm_user` is a plain string any user can edit. It is fine for
gating the UI and **never** fine for authorisation. Use
`supabase.auth.getUser()` and let RLS decide. Everything under
`.coordination/` and the admin console is client-side only.

---

## 4 · Verifying

The gates that actually catch things:

- **syntax**: JXA is the oracle. Write the path into the script; `osascript`
  cannot take it as an argument.
  ```bash
  # /tmp/_syn.py — writes a .scpt with the path inlined, then new Function()
  ```
- **tag balance**: `html.parser` over every `.html`. This catches the
  double-`</body>` and unclosed-div classes.
- **geometry**: measure `getBoundingClientRect()` at the widths you care about
  (1600 / 1440 / 1280 / 1024 / 951 / 950 / 900 / 768 / 390) and assert 0 overlap,
  0 horizontal overflow, nothing under 40px.
- **screenshots**: `Page.captureScreenshot` with a `clip`, then read the PNG.
  Reading the DOM is the source of truth; a downscaled screenshot is not. Twice
  now a screenshot suggested a bug that measurement disproved.

A `defer` script in `<head>` runs **before** bottom-of-body inline scripts, so
anything that scans the DOM must load blocking, or wait for `DOMContentLoaded`.

---

## 5 · Current state

**Shipped**

- Reading progress — `progress-tracker.js`, 188 units, read = depth ≥ 0.85
  **and** dwell ≥ 20s, key `sm_progress_v1`. Textbook / IB / G10 all roll up.
- Four sections in the top bar and the sidebar: Infirmary, Knowledge, Social,
  Classroom. `sections.js` scopes the sidebar to the current section; `hub`
  (Home) shows all four.
- `classroom.html` — create/join by code, roster, per-student detail, release
  schedule, questions, live quiz. Uploads reading progress to the teacher.

**Not finished**

- The classroom **Questions tab is stubbed** — the import and AI-generate
  buttons do nothing, so a live quiz has nothing to draw from.
- **Live Kahoot** — tables and the realtime publication are in the schema, the
  game loop is not written.
- The **forum is broken on live**: the grants in `forum-schema.sql` were never
  applied, and `forum_topics` has zero rows.

---

## 6 · Supabase — read this before touching auth

There are **two** projects and the site is not on the one its owner expects:

| ref | note |
|---|---|
| `eytmbftrjvsntyzwbtzl` | **the one the site is connected to.** All 6 references in `login.html`, `admin.html`, `classroom.js`. Commit `8c15a952` (6 Sep, "Logout v3") repointed 13 files here from the other project |
| `iftuqkfjwqnythhwencx` | the school account's project, named "Sports Medicine Site". Completely empty — no tables |

Consequence: **every account created since 6 September is an auth user in
`eytmbftrjvsntyzwbtzl`.** Repointing the site at the other project would
orphan those accounts. That needs a decision, not a drive-by edit.

The anon key in `login.html` is minted for `eytmbftrjvsntyzwbtzl` and returns
401 against the other project. That is the quick way to tell them apart:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -H "apikey: $KEY" \
  https://<ref>.supabase.co/auth/v1/settings     # 200 = yours, 401 = not
```

### Running a schema

`classroom-schema.sql` — 9 tables, 2 functions, 29 RLS policies, all keyed to
`auth.uid()`. **It must be run in `eytmbftrjvsntyzwbtzl`**, the project the site
talks to, or the page will keep saying "one setup step left".

It is wrapped in `begin; … commit;` so a failure rolls back whole. That is
deliberate: an earlier version created the helper functions *before* the tables
they query, aborted on line 41 with `42P01`, and left nothing usable.

Ordering inside the file is load-bearing: **tables → functions → RLS → realtime
→ view.** Postgres validates a SQL function body when it creates it.

---

## 7 · Coordination

`.coordination/CONCURRENCY.md` is the two-person workflow: `main` is merge-only,
everything goes through a PR, rebase rather than merge, small branches.
`.coordination/coordinate` is a file-backed message bus. The required CI check
is `skin-coherence` (every page must link `linear-theme.css`, zero active
webfont links).

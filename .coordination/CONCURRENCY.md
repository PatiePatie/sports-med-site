# Two-Person Workflow — edit at the same time, never clobber each other

**Why this exists (the 2026-08-31 incident):** guide.html was rewritten from a
stale copy of main while the Linear skin lived on a branch. The stale copy kept
the old theme markers but linked the old stylesheet — so every page showed the
new skin except the page holding most of the study content. Nobody noticed until
a student opened it. The fix (commit `1022a5a`) re-pointed the page and made the
drift detectable. This doc makes that failure structurally impossible.

## The one rule

**`main` is merge-only. Nobody pushes to `main` directly — everything goes
through a pull request.**

Why this works for two people:

- Both humans can work in parallel forever — their branches never collide until
  merge time, and merges resolve conflicts one at a time instead of "last push
  wins."
- The required checks (below) guarantee the site still works **before** the
  change goes live, so "changes didn't apply" stops being a mystery.

## How to work (both of you — same recipe)

```
# 1. Before starting ANY work, get the latest main:
git fetch origin
git switch -c your-branch-name origin/main      # branch OFF the newest main

# 2. Do your work, commit as usual.

# 3. Before pushing, pull the latest main into your branch (rebase, not merge):
git fetch origin
git rebase origin/main                          # or: git pull --rebase origin main

# 4. Push + open a PR:
git push -u origin your-branch-name
# …create the PR on github.com with a screenshot + checklist (template is automatic)

# 5. When checks pass, merge. GitHub Pages rebuilds from main automatically.
#    Verify live ~2–4 min later with a hard refresh (CDN caches ~10 min).
```

Cheat-sheet rules:

- **Rebase, never merge** `main` into your branch (`git pull --rebase origin main`).
- **Small branches, one concern each.** "skin" and "phone-field" do not share a PR.
- **Never rewrite a big file from a copy you're not sure is fresh.** Before
  touching guide.html or any shared page: `git diff origin/main -- <file>`.
- **If you both edit the same file**, the second rebase hits a conflict. Fix it
  by keeping BOTH changes (yours + theirs), never by discarding theirs. If
  unsure which is right, the file is yours to resolve — that's what the PR is for.
- **Web edits on github.com:** when main is protected, the editor will offer
  "Create a branch for this commit and start a pull request" — accept that. The
  web edit becomes a PR, not a silent push to main. (This is how Patrick keeps
  his fast path without breaking Oliver.)

## The guarantees (why "changes still apply" is enforced, not hoped)

Two required checks run on every PR to main:

1. **`skin-coherence`** — `.github/skin-check.py` fails if any page links a
   stylesheet other than `linear-theme.css`, or if any page activates a Google
   Fonts link (China reach / zero-webfont rule). A stale rewrite can no longer
   silently regress the skin.
2. **`GitHub Pages`** — the Pages build must succeed before merge. If the build
   would break the live site, you can't merge.

Plus: branches must be **up to date** with main before merging (rebase
required), force-push to main is **blocked**, and branch **deletion is blocked**.

Result: you can both work at the same time, every merge validates the site,
and every merge deploys. The live site only ever contains main, and main only
ever contains things that passed the gauntlet.

## One-time setup (only Patrick can do this — repo owner)

### UI path (github.com, ~1 minute)

1. Repo → **Settings → Rules → New ruleset** ("New branch ruleset").
2. Name: `main-protection`. Enforcement: **Active**. Target: **main**.
3. Rules:
   - ☑ **Require a pull request before merging** — required approvals: **0** (both of you can self-merge; speed matters on a 2-person team).
   - ☑ **Require status checks to pass** — select **`skin-coherence`** and **`GitHub Pages`** from the list. (If `skin-coherence` hasn't run yet, open one PR first so it appears in the list.)
   - ☑ **Require branches to be up to date before merging**
   - ☑ **Block force pushes**
   - ☑ **Block branch deletions**
4. **Create.**

### CLI path (alternative — same result)

```
# from a checkout of this repo:
.coordination/setup-protection.sh
```

The script checks you're the owner, confirms, and creates the identical
ruleset through `gh api`.

## If something still looks broken after a merge

1. Check the deploy: **Actions → "pages build and deployment"** — did it run? Green?
2. Check the page: right-click → View Source → which stylesheet is `<link>`ed?
   Every page must show `linear-theme.css`.
3. Hard refresh (`Cmd+Shift+R`) and wait up to 10 min — Pages CDN caches.
4. If a page links the wrong skin: `python3 tools/theme_switch.py status` names
   the offender. The `skin-coherence` check exists so this can never reach main
   again — if it did, the PR that caused it skipped the check.
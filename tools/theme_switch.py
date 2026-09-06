#!/usr/bin/env python3
"""
theme_switch.py — the flip switch for the "Editorial Surgical" UI redesign draft.

The draft is a pure override layer: one shared stylesheet (the skin named by THEME_CSS,
which itself @imports draft-theme.css) plus two small progressive-enhancement scripts
(draft.js, then the skin's own layout script named by LAYOUT_JS), all linked
immediately before </head> so the sheet wins the cascade over each page's inline
<style> block. Both scripts are `defer`, so they run after parsing in the order they
appear here — draft.js first, the layout script second — which means the layout
script sees a fully-built DOM and the whole enhancement is still one contiguous
block to strip. Nothing else in the HTML is rewritten except the Google Fonts
<link>s, which are commented out (see §4.3 of UI_REDESIGN_HANDOFF.md — the audience
is in China, where fonts.googleapis.com is blocked; the draft's type stack is 100%
system fonts).

Usage:
    python3 tools/theme_switch.py on       # apply the draft to all pages (idempotent)
    python3 tools/theme_switch.py off      # remove it — byte-identical rollback
    python3 tools/theme_switch.py status   # report which pages have the draft applied

Guarantees:
  * on  is idempotent: running it twice changes nothing the second time.
  * off restores every file byte-for-byte (verify with `git diff` → empty).
  * Zero dependencies: Python 3 stdlib only.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

BEGIN = "<!-- DRAFT-THEME:BEGIN — remove with: python3 tools/theme_switch.py off -->"
END = "<!-- DRAFT-THEME:END -->"

# The active skin. A skin is a cosmetic layer that starts with
# `@import url('draft-theme.css');` and then restates the tokens, so swapping
# this one name re-skins every page. "linear-theme.css" is the full Linear.app
# skin (white paper + Vitalite Red); "vitalite-skin.css" is the production skin
# (gold-blue brand + the Linear collapsible-rail mechanics, which is what the
# sidebar collapse button needs to work). Set THEME_CSS to "draft-theme.css"
# for the bare Editorial Surgical layer.
THEME_CSS = "vitalite-skin.css?v=1"

# The skin's layout script. "linear-layout.js" mounts the Linear v2 inverted-L
# shell (rail + top bar + view header) and the ⌘K palette. Set to None for a
# skin that is paint only — `off` strips either shape.
LAYOUT_JS = "linear-layout.js"
# Cache-bust pin for the layout script — matches the ?v=2 pin on origin/main
# (PR #64 bumped it past poisoned v6/v7 variants).
LAYOUT_JS_PIN = "?v=2" if LAYOUT_JS else ""

# Cache-bust pins for the Q&A widget + notification bell (CSS + JS). These were
# previously unversioned, so a change here silently lingered in CF/browser caches.
# Bump the numbers whenever the corresponding file changes.
QNA_CSS_PIN = "?v=1"
QNA_JS_PIN  = "?v=1"
BELL_CSS_PIN = "?v=1"
BELL_JS_PIN  = "?v=1"
CHECKUP_CSS_PIN = "?v=2"
CHECKUP_JS_PIN  = "?v=2"

# Pages that run the Checkup symptom-triage app (PR: body checkup).
# infirmary.html hosts the <section id="checkup">; every other page would just
# load two dead files, so scope the includes like SECTIONS_JS_PAGES above.
CHECKUP_PAGES = {"infirmary.html"}

# Pages the draft never touches — auth/account surfaces keep their own chrome
# (the app rail + ⌘K palette make no sense on a sign-in screen). `on` skips
# these; `status` leaves them out of the report. admin.html/social.html are the
# operator surfaces (forum moderation) — they intentionally link the base
# gold-blue theme directly, not the skin.
EXCLUDE = {"login.html", "admin.html", "social.html"}

# Pages that run the section-interfaces script (PR #67). The lane added the
# <script> inside the DRAFT-THEME block by hand; it belongs in the template so
# off/on cycles can't silently drop it. social.html is excluded above and links
# the script outside the block (operator surface).
SECTIONS_JS_PAGES = {
    "account.html", "cn-cert.html", "exam.html", "g10-bio.html", "guide.html",
    "index.html", "infirmary.html", "toc.html", "usabo.html",
}
SECTIONS_JS_PIN = "?v=2"

BLOCK = (
    f"{BEGIN}\n"
    f'<link rel="stylesheet" href="{THEME_CSS}">\n'
    '<script src="draft.js" defer></script>\n'
    + (f'<script src="{LAYOUT_JS}{LAYOUT_JS_PIN}" defer></script>\n' if LAYOUT_JS else "")
    + '<link rel="stylesheet" href="qna-widget.css'+QNA_CSS_PIN+'">\n'
    + '<script src="qna-widget.js'+QNA_JS_PIN+'" defer></script>\n'
    + '<link rel="stylesheet" href="notif-bell.css'+BELL_CSS_PIN+'">\n'
    + '<script src="notif-bell.js'+BELL_JS_PIN+'" defer></script>\n'
    + f"{END}\n"
)

# Extra includes only for pages that host the Checkup app (see CHECKUP_PAGES).
# Kept separate from BLOCK so one `on` can't spray them across every page.
CHECKUP_BLOCK = (
    '<link rel="stylesheet" href="checkup.css'+CHECKUP_CSS_PIN+'">\n'
    + '<script src="checkup.js'+CHECKUP_JS_PIN+'" defer></script>\n'
)

# Whole-block matcher used by `off` / idempotence checks.
BLOCK_RE = re.compile(
    r"[ \t]*<!-- DRAFT-THEME:BEGIN.*?<!-- DRAFT-THEME:END -->\n?",
    re.DOTALL,
)

# --- Google Fonts neutralisation -------------------------------------------------
# Each matched <link> line is parked inside a marker comment. "--" is escaped so the
# payload can never terminate the enclosing comment early; `off` reverses both steps.
FONT_LINK_RE = re.compile(
    r'^[ \t]*<link\b[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>[ \t]*$',
    re.MULTILINE,
)
FONT_OFF_RE = re.compile(
    r"<!-- DRAFT-FONTS-OFF:BEGIN --><!--(.*?)--><!-- DRAFT-FONTS-OFF:END -->"
)


def pages():
    return sorted(p for p in ROOT.glob("*.html") if p.name not in EXCLUDE)


def has_draft(text):
    return BEGIN in text


def fonts_off(text):
    """Comment out every Google Fonts <link>. Returns (text, count)."""
    def park(m):
        payload = m.group(0).strip().replace("--", "&#45;&#45;")
        return f"<!-- DRAFT-FONTS-OFF:BEGIN --><!--{payload}--><!-- DRAFT-FONTS-OFF:END -->"

    return FONT_LINK_RE.subn(park, text)


def fonts_on(text):
    """Restore every parked Google Fonts <link>. Returns (text, count)."""
    return FONT_OFF_RE.subn(
        lambda m: m.group(1).replace("&#45;&#45;", "--"), text
    )


def apply_on(path):
    text = path.read_text(encoding="utf-8")

    if "</head>" not in text:
        return "error", "no </head> found"

    if has_draft(text):
        return "skip", "already applied"

    new, n_fonts = fonts_off(text)

    block = BLOCK
    if path.name in SECTIONS_JS_PAGES:
        block = block.replace(
            '<script src="draft.js" defer></script>',
            '<script src="sections.js' + SECTIONS_JS_PIN + '" defer></script>\n'
            + '<script src="draft.js" defer></script>',
            1,
        )
    if path.name in CHECKUP_PAGES:
        block = block.replace(
            f"{END}",
            CHECKUP_BLOCK + f"{END}",
            1,
        )

    head_close = new.rindex("</head>")
    new = new[:head_close] + block + new[head_close:]

    path.write_text(new, encoding="utf-8")
    linked = ", ".join(x for x in (THEME_CSS, "draft.js", LAYOUT_JS) if x)
    return "on", f"linked {linked}, parked {n_fonts} Google Fonts link(s)"


def apply_off(path):
    text = path.read_text(encoding="utf-8")
    new, n_block = BLOCK_RE.subn("", text)
    new, n_fonts = fonts_on(new)

    if n_block == 0 and n_fonts == 0:
        return "skip", "not applied"

    path.write_text(new, encoding="utf-8")
    return "off", f"removed draft link block, restored {n_fonts} Google Fonts link(s)"


# A page rewritten from a pre-skin copy keeps the markers but links the old
# stylesheet, so `on` skips it and the page silently falls back to another skin.
# `status` calls that out by name.
LINK_RE = re.compile(r'<link\b[^>]*href="([^"]+\.css(?:\?[^"]*)?)"[^>]*>')
SCRIPT_RE = re.compile(r'<script\b[^>]*src="([^"]+\.js(?:\?[^"]*)?)"[^>]*>')


def block_of(text):
    m = BLOCK_RE.search(text)
    return m.group(0) if m else None


def linked_theme(text):
    """The stylesheet the DRAFT-THEME block actually links, or None."""
    block = block_of(text)
    if not block:
        return None
    # The block now carries several stylesheets (skin, qna-widget, notif-bell).
    # The skin is the one whose bare name matches THEME_CSS — match it rather
    # than blindly grabbing the first .css (which would be a widget).
    want = THEME_CSS.split("?")[0]
    for link in LINK_RE.findall(block):
        if link.split("?")[0] == want:
            return link
    return None


def linked_scripts(text):
    """Every script the DRAFT-THEME block links, in order."""
    block = block_of(text)
    return SCRIPT_RE.findall(block) if block else []


def report(path):
    text = path.read_text(encoding="utf-8")
    if not has_draft(text):
        return "off", ("" if "</head>" in text else "  (!) no </head>")

    linked = linked_theme(text)
    if linked and linked.split("?")[0] != THEME_CSS.split("?")[0]:
        return "ON ", f"  (!) links {linked}, not {THEME_CSS} — run: off then on"
    if LAYOUT_JS:
        # Scripts come with a ?v= pin (linear-layout.js?v=2); compare bare names.
        bare = {s.split("?")[0] for s in linked_scripts(text)}
        if LAYOUT_JS not in bare:
            return "ON ", f"  (!) missing {LAYOUT_JS} — run: off then on"
    return "ON ", ("" if "</head>" in text else "  (!) no </head>")


def main(argv):
    if len(argv) != 2 or argv[1] not in {"on", "off", "status"}:
        print(__doc__.strip())
        return 2

    cmd = argv[1]
    files = pages()
    if not files:
        print(f"No .html pages found in {ROOT}")
        return 1

    required = [THEME_CSS, "draft-theme.css", "draft.js"] + ([LAYOUT_JS] if LAYOUT_JS else [])
    # THEME_CSS may carry a cache-busting query (vitalite-skin.css?v=1) — the
    # existence check must look at the file, not the URL.
    missing = [n for n in required if not (ROOT / n.split("?")[0]).exists()]
    if cmd == "on" and missing:
        print(f"Refusing to run: missing {', '.join(missing)} in {ROOT}")
        return 1

    width = max(len(p.name) for p in files)
    changed = errors = 0

    for p in files:
        if cmd == "status":
            state, note = report(p)
            print(f"  {p.name:<{width}}  {state}{note}")
            continue

        state, note = (apply_on if cmd == "on" else apply_off)(p)
        if state == "error":
            errors += 1
        elif state != "skip":
            changed += 1
        print(f"  {p.name:<{width}}  {state:<5} {note}")

    if cmd != "status":
        print(f"\n{cmd}: {changed} page(s) changed, {len(files) - changed - errors} unchanged, {errors} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

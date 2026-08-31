#!/usr/bin/env python3
"""
theme_switch.py — the flip switch for the "Editorial Surgical" UI redesign draft.

The draft is a pure override layer: one shared stylesheet (the skin named by THEME_CSS,
which itself @imports draft-theme.css) plus one
small progressive-enhancement script (draft.js), linked immediately before </head> so
they win the cascade over each page's inline <style> block. Nothing else in the HTML
is rewritten except the Google Fonts <link>s, which are commented out (see §4.3 of
UI_REDESIGN_HANDOFF.md — the audience is in China, where fonts.googleapis.com is
blocked; the draft's type stack is 100% system fonts).

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
# this one name re-skins every page. "linear-theme.css" is the Linear.app skin;
# set it back to "draft-theme.css" for the bare Editorial Surgical layer.
THEME_CSS = "linear-theme.css"

BLOCK = (
    f"{BEGIN}\n"
    f'<link rel="stylesheet" href="{THEME_CSS}">\n'
    '<script src="draft.js" defer></script>\n'
    f"{END}\n"
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
    return sorted(p for p in ROOT.glob("*.html"))


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

    head_close = new.rindex("</head>")
    new = new[:head_close] + BLOCK + new[head_close:]

    path.write_text(new, encoding="utf-8")
    return "on", f"linked {THEME_CSS} + draft.js, parked {n_fonts} Google Fonts link(s)"


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
LINK_RE = re.compile(r'<link\b[^>]*href="([^"]+\.css)"[^>]*>')


def linked_theme(text):
    """The stylesheet the DRAFT-THEME block actually links, or None."""
    m = BLOCK_RE.search(text)
    if not m:
        return None
    link = LINK_RE.search(m.group(0))
    return link.group(1) if link else None


def report(path):
    text = path.read_text(encoding="utf-8")
    if not has_draft(text):
        return "off", ("" if "</head>" in text else "  (!) no </head>")

    linked = linked_theme(text)
    if linked and linked != THEME_CSS:
        return "ON ", f"  (!) links {linked}, not {THEME_CSS} — run: off then on"
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

    missing = [n for n in (THEME_CSS, "draft-theme.css", "draft.js") if not (ROOT / n).exists()]
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

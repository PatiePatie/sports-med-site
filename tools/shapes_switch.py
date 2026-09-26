#!/usr/bin/env python3
"""
shapes_switch.py — flip switch for the "Optimal Shapes" skin.

Links shapes-skin.css + shapes-fx.js, then the "Soft Glass" layer on top of it
(soft-glass.css + soft-fx.js), immediately before </head> on every page, inside
SHAPES-THEME markers, so the skin sits LAST in the cascade (after the
DRAFT-THEME block, the Q&A widget and the bell). It is independent of
theme_switch.py: turning this off returns every page to the gold-blue skin.

It also puts one tiny inline script right after <body> (SHAPES-EARLY markers)
that applies the saved dark mode before the first paint. Every page used to add
`body.dark` from a script at the END of the body, so each navigation painted a
light frame first — the white flash between pages.

Usage:
    python3 tools/shapes_switch.py on       # apply to all pages (idempotent)
    python3 tools/shapes_switch.py off      # remove — byte-identical rollback
    python3 tools/shapes_switch.py status   # which pages carry it, and at which pins

Bump the pins whenever shapes-skin.css / shapes-fx.js change (Cloudflare caches
per query string), then run `off` + `on`.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CSS = "shapes-skin.css?v=3"
JS = "shapes-fx.js?v=5"
SOFT_CSS = "soft-glass.css?v=5"
SOFT_JS = "soft-fx.js?v=5"
KN_CSS = "knowledge.css?v=2"
KN_JS = "knowledge-fx.js?v=2"

BEGIN = "<!-- SHAPES-THEME:BEGIN — remove with: python3 tools/shapes_switch.py off -->"
END = "<!-- SHAPES-THEME:END -->"
BLOCK = (
    f"{BEGIN}\n"
    f'<link rel="stylesheet" href="{CSS}">\n'
    f'<script src="{JS}" defer></script>\n'
    f'<link rel="stylesheet" href="{SOFT_CSS}">\n'
    f'<script src="{SOFT_JS}" defer></script>\n'
    f'<link rel="stylesheet" href="{KN_CSS}">\n'
    f'<script src="{KN_JS}" defer></script>\n'
    f"{END}\n"
)
# First thing in <head>, before ANY stylesheet or blocking script: the saved
# theme becomes the html background + color-scheme. Firefox/Zen (no cross-doc
# view transitions) paints its default white canvas while <head> is still
# blocked on CSS and CDN scripts; a dark color-scheme meta + inline background
# makes that first canvas dark instead.
HEAD = ("<!-- SHAPES-HEAD --><script>(function(){try{var d=localStorage.getItem('dark')!=='false',h=document.documentElement;"
        "h.classList.toggle('os-dk',d);h.style.backgroundColor=d?'#0B1628':'#E4E9F0';h.style.colorScheme=d?'dark':'light';"
        "document.write('<meta name=\"color-scheme\" content=\"'+(d?'dark':'light')+'\">');"
        # page arrival: a category wash when the last click changed category,
        # otherwise the whole page fogs in (the splash page keeps its splash)
        "if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;"
        "var c=null;try{c=JSON.parse(sessionStorage.getItem('sg-catgo')||'null')}catch(e){}"
        "if(c&&Date.now()-c.t<8000){h.classList.add('sg-catgo');h.setAttribute('data-sg-cat',c.k)}"
        "else if(!/(^|\\/)(index(\\.html)?)?$/.test(location.pathname))h.classList.add('sg-lf')"
        "}catch(e){}})()</script>")
HEAD_RE = re.compile(r"<!-- SHAPES-HEAD --><script>.*?</script>\n?")
HEADTAG_RE = re.compile(r"<head\b[^>]*>\n?")

EARLY = ("<!-- SHAPES-EARLY --><script>try{if(localStorage.getItem('dark')!=='false')"
         "document.body.classList.add('dark')}catch(e){}</script>")
EARLY_RE = re.compile(r"<!-- SHAPES-EARLY --><script>.*?</script>\n?")
BODY_RE = re.compile(r"<body\b[^>]*>\n?")
BLOCK_RE = re.compile(r"<!-- SHAPES-THEME:BEGIN.*?<!-- SHAPES-THEME:END -->\n?", re.DOTALL)


def pages():
    return sorted(ROOT.glob("*.html"))


def on(path):
    text = path.read_text(encoding="utf-8")
    if "</head>" not in text:
        return "error", "no </head>"
    orig = text
    text = BLOCK_RE.sub("", text)          # stale pins → replace
    text = EARLY_RE.sub("", text)
    text = HEAD_RE.sub("", text)
    h = HEADTAG_RE.search(text)
    if h:
        text = text[:h.end()] + HEAD + "\n" + text[h.end():]
    i = text.rindex("</head>")
    text = text[:i] + BLOCK + text[i:]
    b = BODY_RE.search(text)
    if b:
        text = text[:b.end()] + EARLY + "\n" + text[b.end():]
    if text == orig:
        return "skip", "already applied"
    path.write_text(text, encoding="utf-8")
    return "on", f"linked {CSS}, {JS}, {SOFT_CSS}, {SOFT_JS}, {KN_CSS}, {KN_JS}"


def off(path):
    text = path.read_text(encoding="utf-8")
    new, n = BLOCK_RE.subn("", text)
    new, n2 = EARLY_RE.subn("", new)
    new, n3 = HEAD_RE.subn("", new)
    if not (n or n2 or n3):
        return "skip", "not applied"
    path.write_text(new, encoding="utf-8")
    return "off", "removed"


def status(path):
    text = path.read_text(encoding="utf-8")
    m = BLOCK_RE.search(text)
    if not m:
        return "OFF", ""
    if m.group(0) != BLOCK:
        return "STALE", "pins differ — run on"
    if HEADTAG_RE.search(text) and HEAD not in text:
        return "STALE", "no head-first theme script — run on"
    if BODY_RE.search(text) and EARLY not in text:
        return "STALE", "no early dark-mode script — run on"
    return "ON", ""


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    fn = {"on": on, "off": off, "status": status}.get(cmd)
    if not fn:
        sys.exit(__doc__)
    for p in pages():
        state, note = fn(p)
        print(f"  {p.name:<16}{state:<6}{note}")


if __name__ == "__main__":
    main()

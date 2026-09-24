#!/usr/bin/env python3
"""
shapes_switch.py — flip switch for the "Optimal Shapes" skin.

Links shapes-skin.css + shapes-fx.js immediately before </head> on every page,
inside SHAPES-THEME markers, so the skin sits LAST in the cascade (after the
DRAFT-THEME block, the Q&A widget and the bell). It is independent of
theme_switch.py: turning this off returns every page to the gold-blue skin.

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

CSS = "shapes-skin.css?v=1"
JS = "shapes-fx.js?v=1"

BEGIN = "<!-- SHAPES-THEME:BEGIN — remove with: python3 tools/shapes_switch.py off -->"
END = "<!-- SHAPES-THEME:END -->"
BLOCK = (
    f"{BEGIN}\n"
    f'<link rel="stylesheet" href="{CSS}">\n'
    f'<script src="{JS}" defer></script>\n'
    f"{END}\n"
)
BLOCK_RE = re.compile(r"<!-- SHAPES-THEME:BEGIN.*?<!-- SHAPES-THEME:END -->\n?", re.DOTALL)


def pages():
    return sorted(ROOT.glob("*.html"))


def on(path):
    text = path.read_text(encoding="utf-8")
    if "</head>" not in text:
        return "error", "no </head>"
    m = BLOCK_RE.search(text)
    if m and m.group(0) == BLOCK:
        return "skip", "already applied"
    text = BLOCK_RE.sub("", text)          # stale pins → replace
    i = text.rindex("</head>")
    path.write_text(text[:i] + BLOCK + text[i:], encoding="utf-8")
    return "on", f"linked {CSS}, {JS}"


def off(path):
    text = path.read_text(encoding="utf-8")
    new, n = BLOCK_RE.subn("", text)
    if not n:
        return "skip", "not applied"
    path.write_text(new, encoding="utf-8")
    return "off", "removed"


def status(path):
    m = BLOCK_RE.search(path.read_text(encoding="utf-8"))
    if not m:
        return "OFF", ""
    return ("ON", "") if m.group(0) == BLOCK else ("STALE", "pins differ — run on")


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

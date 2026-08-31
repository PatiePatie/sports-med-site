#!/usr/bin/env python3
"""Skin coherence checker — CI version of `tools/theme_switch.py status`.

Fails the build if any page disagrees with THEME_CSS. This is exactly the
regression that bit the project on 2026-08-31: guide.html was rewritten from a
pre-skin copy — it kept the DRAFT-THEME markers, linked draft-theme.css, and
every other page showed the skin while the page carrying most of the study
content silently fell back to the old theme.

Also enforces the zero-webfont rule (the audience is in China; Google Fonts is
blocked behind the GFW). Stdlib only, ~60 lines, runs anywhere python3 exists.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
THEME_CSS = "linear-theme.css"

LINK_RE = re.compile(r"<link[^>]+rel=[\"']stylesheet[\"'][^>]*>", re.IGNORECASE)
HREF_RE = re.compile(r"href=[\"']([^\"']+)[\"']", re.IGNORECASE)
FONTS_RE = re.compile(r"fonts\.(googleapis|gstatic)\.com", re.IGNORECASE)


# Comment blocks (e.g. the DRAFT-FONTS-OFF parked Google Fonts links) are
# deliberately inactive — strip them before scanning so only ACTIVE links count.
COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def audit_page(html: pathlib.Path):
    """Return a list of (kind, message) violations for one page."""
    text = COMMENT_RE.sub("", html.read_text(encoding="utf-8", errors="replace"))
    problems = []
    links = [m.group(1) for m in (HREF_RE.search(lnk) for lnk in LINK_RE.findall(text)) if m]
    css = [lnk for lnk in links if lnk.endswith(".css")]
    if THEME_CSS not in css:
        problems.append(("skin", f"links {css or 'NO CSS'} — expected {THEME_CSS}"))
    if any(FONTS_RE.search(lnk) for lnk in links):
        problems.append(("fonts", "active Google Fonts link — zero-webfont rule violated"))
    return problems


def main() -> int:
    pages = sorted(ROOT.glob("*.html"))
    failures = 0
    for page in pages:
        for kind, msg in audit_page(page):
            failures += 1
            print(f"FAIL  {page.name:<16s} [{kind}] {msg}")
    if failures:
        print(f"\n{failures} violation(s) across {len(pages)} pages — skin is drifting. Fix before merge.")
        return 1
    print(f"OK — all {len(pages)} pages link {THEME_CSS}; zero active webfont links.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
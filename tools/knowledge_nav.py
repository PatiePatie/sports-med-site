#!/usr/bin/env python3
"""
knowledge_nav.py — one Knowledge sidebar menu for every page.

The "Vitalite Knowledge" group of the sidebar is hand-copied into every page,
and the copies drifted (guide.html kept its chapters in a separate "Chapters"
scroll box at the bottom; the IB SEHS pages lost the study tools). This
rewrites that group's <div class="part-body"> on every page from one source:

    Knowledge Hub
    LEARN      Vitalite Textbook
                 └ Ch 1 … Ch 14         (sub-tabs, only on guide.html)
               IB SEHS
                 └ IB chapters          (sub-tabs, only on ib-sehs-learn.html)
               G10 Bio
    PRACTICE   Flashcards · Quizzes & practice · Vitaline AI
    EXAMS      NPTE & exam prep · 运动康复师资格证 · USABO
    Videos & references

The page's own link gets `active`. Chapter sub-tabs keep the attributes the
page scripts drive them by (class `gc`, data-ch, href), so guide.html's and
ib-sehs-course.js's chapter switching keep working.

Usage:
    python3 tools/knowledge_nav.py          # rewrite (idempotent)
    python3 tools/knowledge_nav.py check    # list pages whose menu differs
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

GUIDE_CHAPTERS = [
    ("1", "The Body as a Machine", "身体如机器"),
    ("2", "Nervous System", "神经系统"),
    ("3", "Cardiovascular System", "心血管系统"),
    ("4", "Integumentary System", "皮肤系统"),
    ("5", "Training Principles", "训练原则"),
    ("6", "Injury &amp; Healing", "损伤与愈合"),
    ("7", "Recovery Science", "恢复科学"),
    ("8", "Sports Nutrition", "运动营养学"),
    ("9", "Supplements &amp; Evidence Grading", "补剂与证据分级"),
    ("10", "Ethics &amp; Professional Responsibility", "伦理与职业责任"),
    ("11", "Becoming a Physical Therapist", "成为物理治疗师"),
    ("12", "Assessment", "康复评定学"),
    ("13", "TCM Health Management", "中医健康管理"),
    ("14", "Emergency Medicine &amp; Field Care", "急救医学与场边处置"),
]
IB_CHAPTERS = [
    ("1", "Theme A (9 topics)", "主题A（9个主题）"),
    ("2", "Theme B (9 topics)", "主题B（9个主题）"),
    ("3", "Theme C (11 topics)", "主题C（11个主题）"),
]


def link(href, en, zh, cls="sidebar-link", extra=""):
    return (f'<a class="{cls}" href="{href}"{extra} data-en="{en}" data-zh="{zh}">{en}</a>')


def label(en, zh):
    return f'<div class="sidebar-label" data-en="{en}" data-zh="{zh}">{en}</div>'


def subtabs(rows, href_fmt, aria):
    out = [f'<div class="sb-subtabs" role="group" aria-label="{aria}">']
    for n, en, zh in rows:
        out.append("  " + link(href_fmt.format(n), f"Ch {n} · {en}", f"第{n}章 · {zh}",
                               cls="sidebar-link sub gc sb-sub", extra=f' data-ch="{n}"'))
    out.append("</div>")
    return out


def body_for(page):
    rows = [
        link("toc.html", "🧭 Knowledge Hub", "🧭 知识中心"),
        label("📚 Learn", "📚 学习"),
        link("guide.html", "📖 Vitalite Textbook", "📖 Vitalité 教材", cls="sidebar-link sb-parent"),
    ]
    if page == "guide.html":
        rows += subtabs(GUIDE_CHAPTERS, "#ch{}", "Textbook chapters")
    rows.append(link("ib-sehs.html", "🎓 IB SEHS", "🎓 IB SEHS", cls="sidebar-link sb-parent"))
    if page == "ib-sehs-learn.html":          # ib-sehs.html is the course landing; chapters live on the study page
        rows += subtabs(IB_CHAPTERS, "#ib-ch{}", "IB SEHS chapters")
    rows += [
        link("g10-bio.html", "🔬 G10 Bio", "🔬 十年级生物"),
        label("🧰 Practice", "🧰 练习"),
        link("guide.html?study=flashcards", "🃏 Flashcards", "🃏 闪卡", cls="sidebar-link sub", extra=' data-study="openFlashcards"'),
        link("guide.html?study=quiz", "📝 Quizzes &amp; practice", "📝 测验与练习", cls="sidebar-link sub", extra=' data-study="openQuizMode"'),
        link("guide.html?study=ai", "💬 Vitaline AI", "💬 AI 助手", cls="sidebar-link sub", extra=' data-study="openAiModal"'),
        label("🏁 Exams &amp; certificates", "🏁 考试与证书"),
        link("exam.html", "🇺🇸 NPTE &amp; exam prep", "🇺🇸 NPTE 与备考冲刺", cls="sidebar-link sub"),
        link("cn-cert.html", "🇨🇳 运动康复师资格证", "🇨🇳 运动康复师资格证", cls="sidebar-link sub"),
        link("usabo.html", "🧬 USABO (Biology Olympiad)", "🧬 USABO (生物奥赛)", cls="sidebar-link sub"),
        link("toc.html#resources", "🎬 Videos &amp; references", "🎬 视频与参考文献"),
    ]
    # the page's own link is the active one (first exact match only)
    for i, r in enumerate(rows):
        m = re.search(r'href="([^"]+)"', r)
        if m and m.group(1) == page and "sb-sub" not in r:
            rows[i] = r.replace('class="sidebar-link', 'class="sidebar-link active', 1)
            break
    ind = "      "
    return '<div class="part-body">\n' + "\n".join(ind + r for r in rows) + "\n    </div>"


def span(text):
    """(start, end) of the Knowledge group's part-body div, or None."""
    g = text.find('data-part="vitalite-knowledge"')
    if g < 0:
        return None
    start = text.find('<div class="part-body">', g)
    if start < 0:
        return None
    depth = 0
    tag = re.compile(r"<(/?)div\b[^>]*>")
    for m in tag.finditer(text, start):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return start, m.end()
    return None


def main():
    check = len(sys.argv) > 1 and sys.argv[1] == "check"
    for p in sorted(ROOT.glob("*.html")):
        text = p.read_text(encoding="utf-8")
        sp = span(text)
        if not sp:
            continue
        new = text[:sp[0]] + body_for(p.name) + text[sp[1]:]
        if new == text:
            print(f"  {p.name:<20}ok")
            continue
        if check:
            print(f"  {p.name:<20}DIFFERS — run tools/knowledge_nav.py")
        else:
            p.write_text(new, encoding="utf-8")
            print(f"  {p.name:<20}rewritten")


if __name__ == "__main__":
    main()

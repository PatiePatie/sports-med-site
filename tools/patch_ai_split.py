#!/usr/bin/env python3
"""Vitalité AI split — client-side edits across 6 pages.
- medaiAsk gains a `mode` param (default 'clinical').
- sendChat -> clinical (explicit), sendAiChat -> 'site'.
- Fab modal persona: Recovery Assistant -> Site Helper on all 5 fab pages.
"""
import re, sys

PAGES = [
    "/private/tmp/v-ai-split/infirmary.html",  # chat tab only (no fab)
    "/private/tmp/v-ai-split/guide.html",
    "/private/tmp/v-ai-split/cn-cert.html",
    "/private/tmp/v-ai-split/g10-bio.html",
    "/private/tmp/v-ai-split/social.html",
    "/private/tmp/v-ai-split/toc.html",
]

FAB_PAGES = [p for p in PAGES if p != "/private/tmp/v-ai-split/infirmary.html"]

def patch(path, pairs, tag):
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    for old, new, must in pairs:
        if old not in src:
            if must:
                print(f"  !! {tag} MISSING in {path}: {old[:60]!r}")
                sys.exit(1)
            continue
        src = src.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"  ok {tag}: {path}")

# ── 1. medaiAsk signature + body (multiline pages) ───────────────────────────
MULTILINE_OLD_SIG = "function medaiAsk(question){"
MULTILINE_NEW_SIG = "function medaiAsk(question, mode){"
MULTILINE_OLD_BODY = "body: JSON.stringify({ question:question, lang:medaiLang() })"
MULTILINE_NEW_BODY = "body: JSON.stringify({ question:question, lang:medaiLang(), mode:mode||'clinical' })"

# social.html is compact single-line
COMPACT_OLD = "body:JSON.stringify({question:question,lang:medaiLang()})"
COMPACT_NEW = "body:JSON.stringify({question:question,lang:medaiLang(),mode:mode||'clinical'})"

for p in PAGES:
    if p.endswith("social.html"):
        patch(p, [
            (COMPACT_OLD, COMPACT_NEW, True),
            # signature stays (question) - compact, add mode without breaking the one-liner
            ("function medaiAsk(question){", "function medaiAsk(question, mode){", True),
        ], "medaiAsk")
    else:
        patch(p, [
            (MULTILINE_OLD_SIG, MULTILINE_NEW_SIG, True),
            (MULTILINE_OLD_BODY, MULTILINE_NEW_BODY, True),
        ], "medaiAsk")

# ── 2. sendAiChat -> medaiAsk(q,'site') ───────────────────────────────────────
# guide/cn-cert/g10-bio/toc: multiline, preceded by medaiThinking('aiModalBody');
SITE_CALL_OLD = "const thinkEl=medaiThinking('aiModalBody');\n  medaiAsk(q).then(function(res){"
SITE_CALL_NEW = "const thinkEl=medaiThinking('aiModalBody');\n  medaiAsk(q,'site').then(function(res){"
for p in FAB_PAGES:
    if p.endswith("social.html"):
        patch(p, [
            ("medaiAsk(q).then(function(res){ if(think&&think.parentNode)",
             "medaiAsk(q,'site').then(function(res){ if(think&&think.parentNode)", True),
        ], "sendAiChat->site")
    else:
        patch(p, [(SITE_CALL_OLD, SITE_CALL_NEW, True)], "sendAiChat->site")

# ── 3. sendChat -> medaiAsk(q,'clinical') (guide + infirmary have chat panel) ─
# guide: chatMessages then chatInput; sendChat preceded by medaiThinking('chatMessages');
CLIN_CALL_OLD = "const thinkEl=medaiThinking('chatMessages');\n  medaiAsk(q).then(function(res){"
CLIN_CALL_NEW = "const thinkEl=medaiThinking('chatMessages');\n  medaiAsk(q,'clinical').then(function(res){"
for p in ["/private/tmp/v-ai-split/infirmary.html", "/private/tmp/v-ai-split/guide.html"]:
    patch(p, [(CLIN_CALL_OLD, CLIN_CALL_NEW, True)], "sendChat->clinical")

# ── 4. Fab modal persona -> Site Helper (identical block on all 5 pages) ──────
MODAL_OLD = """      <div class="ai-title" data-en="Recovery Assistant" data-zh="恢复助手">Recovery Assistant</div>
      <div class="ai-sub" data-en="Ask about sports injuries &amp; recovery" data-zh="咨询运动损伤与恢复问题">Ask about sports injuries &amp; recovery</div>"""
MODAL_NEW = """      <div class="ai-title" data-en="Site Helper" data-zh="网站助手">Site Helper</div>
      <div class="ai-sub" data-en="Ask about this website — pages, features, navigation" data-zh="咨询网站功能、页面与使用方法">Ask about this website — pages, features, navigation</div>"""

SUG_OLD = """    <button class="chat-sug-btn" data-en="😴 我落枕了 / stiff neck" data-zh="😴 我落枕了 / 脖子僵硬">😴 我落枕了 / stiff neck</button>
    <button class="chat-sug-btn" data-en="🦵 脚踝扭伤了 / sprained ankle" data-zh="🦵 脚踝扭伤了 / 踝扭伤">🦵 脚踝扭伤了 / sprained ankle</button>
    <button class="chat-sug-btn" data-en="💪 练后肌肉酸痛 / muscle soreness" data-zh="💪 练后肌肉酸痛 / 肌肉酸痛">💪 练后肌肉酸痛 / muscle soreness</button>
    <button class="chat-sug-btn" data-en="🦿 跑步膝盖疼 / knee pain while running" data-zh="🦿 跑步膝盖疼 / 跑步膝痛">🦿 跑步膝盖疼 / knee pain while running</button>"""
SUG_NEW = """    <button class="chat-sug-btn" data-en="🩺 身体检查怎么用？ / How does the Body Checkup work?" data-zh="🩺 身体检查怎么用？">🩺 身体检查怎么用？ / How does the Body Checkup work?</button>
    <button class="chat-sug-btn" data-en="📖 知识库里有什么？ / What's in the Knowledge Base?" data-zh="📖 知识库里有什么？">📖 知识库里有什么？ / What's in the Knowledge Base?</button>
    <button class="chat-sug-btn" data-en="🗺️ 恢复计划在哪里？ / Where is the Recovery Plan?" data-zh="🗺️ 恢复计划在哪里？">🗺️ 恢复计划在哪里？ / Where is the Recovery Plan?</button>
    <button class="chat-sug-btn" data-en="🌐 怎么切换语言？ / How do I switch languages?" data-zh="🌐 怎么切换语言？">🌐 怎么切换语言？ / How do I switch languages?</button>"""

GREET_OLD = """    <div class="chat-msg bot" data-en="Hi! I'm your recovery assistant. Describe your injury or recovery question — for example: &quot;我落枕了，该怎么办？&quot; Guidance (not a medical diagnosis) will appear here soon." data-zh="你好！我是你的恢复助手。请描述你的损伤或恢复问题 — 例如：&quot;我落枕了，该怎么办？&quot;这里将很快为你提供指导（非医疗诊断）。">Hi! I'm your recovery assistant. Describe your injury or recovery question — for example: "我落枕了，该怎么办？" Guidance (not a medical diagnosis) will appear here soon.</div>"""
GREET_NEW = """    <div class="chat-msg bot" data-en="Hi! I'm the site helper. Ask me about this website — pages, features, navigation, or how to use things. For injuries or recovery questions, use the Infirmary's AI assistant." data-zh="你好！我是网站助手。可以问我关于本站的问题 — 页面、功能、使用方法等。关于损伤与恢复的问题，请使用「诊所」页面的 AI 助手。">Hi! I'm the site helper. Ask me about this website — pages, features, navigation, or how to use things. For injuries or recovery questions, use the Infirmary's AI assistant.</div>"""

# social.html — different modal format (no suggestion chips, shorter greeting)
SOC_TITLE_OLD = """      <div class="ai-title" data-en="Recovery Assistant" data-zh="恢复助手">Recovery Assistant</div>
      <div class="ai-sub" data-en="Ask about sports injuries &amp; recovery" data-zh="咨询运动损伤与恢复问题">Ask about sports injuries &amp; recovery</div>"""
SOC_TITLE_NEW = """      <div class="ai-title" data-en="Site Helper" data-zh="网站助手">Site Helper</div>
      <div class="ai-sub" data-en="Ask about this website — pages, features, navigation" data-zh="咨询网站功能、页面与使用方法">Ask about this website — pages, features, navigation</div>"""
SOC_GREET_OLD = """    <div class="chat-msg bot" data-en="Hi! I'm your recovery assistant. Describe your injury or recovery question. This is guidance (not a medical diagnosis)." data-zh="你好！我是你的恢复助手。请描述你的损伤或恢复问题。此为学习参考（非医疗诊断）。">Hi! I'm your recovery assistant. Describe your injury or recovery question. This is guidance (not a medical diagnosis).</div>"""
SOC_GREET_NEW = """    <div class="chat-msg bot" data-en="Hi! I'm the site helper. Ask me about this website — pages, features, navigation, or how to use things. For injuries or recovery questions, use the Infirmary's AI assistant." data-zh="你好！我是网站助手。可以问我关于本站的问题 — 页面、功能、使用方法等。关于损伤与恢复的问题，请使用「诊所」页面的 AI 助手。">Hi! I'm the site helper. Ask me about this website — pages, features, navigation, or how to use things. For injuries or recovery questions, use the Infirmary's AI assistant.</div>"""

for p in FAB_PAGES:
    if p.endswith("social.html"):
        patch(p, [
            (SOC_TITLE_OLD, SOC_TITLE_NEW, True),
            (SOC_GREET_OLD, SOC_GREET_NEW, True),
        ], "fab-persona-social")
        continue
    patch(p, [
        (MODAL_OLD, MODAL_NEW, True),
        (SUG_OLD, SUG_NEW, True),
        (GREET_OLD, GREET_NEW, True),
    ], "fab-persona")

print("\nAll patches applied.")
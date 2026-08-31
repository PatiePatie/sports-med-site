/* ══════════════════════════════════════════════════════════════════════════════
   linear-layout.js — the Linear v2 shell.
   ------------------------------------------------------------------------------
   Mounts the inverted-L (240px nav rail + 48px top bar + a view header of tabs)
   on top of the markup each page already ships, and adds the one interaction
   that makes a surface read as Linear: the ⌘K command palette.

   Rules this file obeys, without exception:

     · It NEVER creates, deletes or edits content. It moves existing chrome
       nodes (the header, the drawer toggle, the chapter tab strip) and it
       creates new chrome of its own, all of it prefixed `lin-`.
     · It NEVER rebinds an existing handler. Where it needs page behaviour it
       synthesises a click on the element the page already wired — the chapter
       tab, the accordion header, the theme button — so the page's own logic
       stays authoritative.
     · It is idempotent: running twice is a no-op.
     · It fails soft: every enhancement is guarded, and a missing node skips
       that enhancement instead of throwing. A page with no chrome at all (the
       chN.html redirect stubs) is left exactly as it was.

   Remove the <link>/<script> block and every line of this is gone:
       python3 tools/theme_switch.py off
   ══════════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var root = document.documentElement;
  if (root.hasAttribute('data-lin-v2')) return;   /* idempotence */

  var body = document.body;
  if (!body) return;

  /* ─── 0 · Small helpers ──────────────────────────────────────────────── */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function $(sel, ctx) {
    try { return (ctx || document).querySelector(sel); } catch (e) { return null; }
  }
  function $$(sel, ctx) {
    try { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
    catch (e) { return []; }
  }
  function safe(fn) { try { fn(); } catch (e) { /* fail soft, always */ } }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); }
    catch (e) { return null; }
  }

  /* The page owns the language. We read it, we never set it. */
  function isCN() {
    if (body.classList.contains('lang-zh')) return true;
    if (body.classList.contains('lang-en')) return false;
    return store('sm_lang') === 'zh';
  }
  /* Give a node both strings so the page's own applyLang() keeps it in sync
     on every subsequent toggle, and set the current one ourselves because
     applyLang() already ran before this deferred script. */
  function bi(node, en, zh) {
    node.setAttribute('data-en', en);
    node.setAttribute('data-zh', zh);
    node.textContent = isCN() ? zh : en;
    return node;
  }
  function t(en, zh) { return isCN() ? zh : en; }

  /* ─── 1 · Which surface is this? ─────────────────────────────────────── */

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!file || file.indexOf('.') === -1) file = 'index.html';

  var PAGES = [
    { file: 'index.html',   en: 'Overview',       zh: '概览',              icon: 'home' },
    { file: 'guide.html',   en: 'Guide',          zh: '学习指南',           icon: 'book' },
    { file: 'toc.html',     en: 'Contents',       zh: '目录',              icon: 'list' },
    { file: 'exam.html',    en: 'NPTE Exam',      zh: '美国 NPTE',         icon: 'clipboard' },
    { file: 'cn-cert.html', en: 'CN Certificate', zh: '运动康复师资格证',     icon: 'award' },
    { file: 'account.html', en: 'Account',        zh: '我的账户',           icon: 'user' },
    { file: 'login.html',   en: 'Sign in',        zh: '登录',              icon: 'login' }
  ];
  function pageFor(f) {
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].file === f) return PAGES[i];
    return null;
  }
  var here = pageFor(file);

  var header  = $('header');
  var sidebar = $('#sidebar') || $('nav.sidebar');
  var wrapper = $('.page-wrapper');
  var isGuide = file === 'guide.html';
  var isMarketing = !!$('.landing-hero') || (file === 'index.html');

  /* No chrome at all (the chN.html redirect stubs) — leave the page alone. */
  if (!header && !sidebar) return;

  root.setAttribute('data-lin-v2', '');
  body.classList.add('lin-v2');
  body.classList.add(isMarketing ? 'lin-marketing' : 'lin-app');
  if (!sidebar || !wrapper) body.classList.add('lin-noshell');
  if (here) body.classList.add('lin-page-' + here.file.replace('.html', ''));

  /* ─── 2 · Icons — 16px, stroked, currentColor ────────────────────────── */

  var ICONS = {
    home:      '<path d="M3 7.2 8 3.5l5 3.7V13a.5.5 0 0 1-.5.5h-3v-4h-3v4h-3A.5.5 0 0 1 3 13Z"/>',
    book:      '<path d="M3 3.5h3.6c.8 0 1.4.6 1.4 1.4v7.6c0-.6-.5-1-1.1-1H3Zm10 0H9.4c-.8 0-1.4.6-1.4 1.4v7.6c0-.6.5-1 1.1-1H13Z"/>',
    list:      '<path d="M6 4.5h7M6 8h7M6 11.5h7M3.2 4.5h.01M3.2 8h.01M3.2 11.5h.01"/>',
    clipboard: '<path d="M6 3.5H5a1 1 0 0 0-1 1V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.5a1 1 0 0 0-1-1h-1M6 3.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v.5M6 3.5h4M6 9l1.4 1.4L10 7.8"/>',
    award:     '<circle cx="8" cy="6.5" r="3.5"/><path d="M5.8 9.6 5 14l3-1.5L11 14l-.8-4.4"/>',
    user:      '<circle cx="8" cy="5.8" r="2.6"/><path d="M3.4 13.5a4.6 4.6 0 0 1 9.2 0"/>',
    login:     '<path d="M9.5 3.5h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-2M8.5 8h-6M5.5 5.5 3 8l2.5 2.5"/>',
    play:      '<circle cx="8" cy="8" r="5.5"/><path d="m6.8 5.8 3.2 2.2-3.2 2.2Z"/>',
    message:   '<path d="M13 9.5a1.5 1.5 0 0 1-1.5 1.5H6l-3 2.5V4a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 13 4Z"/>',
    edit:      '<path d="M8.5 3.5H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7M11 2.6l2.4 2.4-4.6 4.6-2.9.5.5-2.9Z"/>',
    chart:     '<path d="M3 13V9.5M6.3 13V4.5M9.7 13V7.5M13 13V2.8"/>',
    bookmark:  '<path d="M4.5 2.8h7v10.4L8 10.7l-3.5 2.5Z"/>',
    search:    '<circle cx="7.2" cy="7.2" r="4"/><path d="m10.2 10.2 3 3"/>',
    corner:    '<path d="M12 3.5v4a2 2 0 0 1-2 2H4M6.4 7 4 9.4l2.4 2.4"/>',
    chevron:   '<path d="m6.2 4.2 3.6 3.8-3.6 3.8"/>',
    panel:     '<rect x="2.8" y="3.2" width="10.4" height="9.6" rx="1.5"/><path d="M6.4 3.2v9.6"/>',
    hash:      '<path d="M6.2 3 5 13M11 3 9.8 13M3.4 6h9.2M3 10h9.2"/>',
    sun:       '<circle cx="8" cy="8" r="3"/><path d="M8 1.6v1.2M8 13.2v1.2M2.5 8H1.3M14.7 8h-1.2M4 4l-.9-.9M12.9 12.9l-.9-.9M12 4l.9-.9M3.1 12.9l.9-.9"/>',
    lang:      '<circle cx="8" cy="8" r="5.5"/><path d="M2.6 8h10.8M8 2.5c1.5 1.6 2.3 3.5 2.3 5.5S9.5 12 8 13.5C6.5 12 5.7 10 5.7 8S6.5 4.1 8 2.5Z"/>'
  };
  function icon(name) {
    var svg = ICONS[name] ? ICONS[name] : ICONS.hash;
    var n = el('span', 'lin-ico');
    n.setAttribute('aria-hidden', 'true');
    n.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" ' +
                  'stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">' + svg + '</svg>';
    return n;
  }

  /* Which icon a sidebar row gets, by the href it already points at. */
  function iconForHref(href) {
    if (!href) return null;
    var h = href.toLowerCase();
    if (h.indexOf('#resources') > -1) return 'play';
    if (h.indexOf('#qa') > -1)        return 'message';
    if (h.indexOf('#practice') > -1)  return 'edit';
    if (h.indexOf('#progress') > -1)  return 'chart';
    if (h.indexOf('#refs') > -1)      return 'bookmark';
    for (var i = 0; i < PAGES.length; i++) {
      if (h.indexOf(PAGES[i].file) > -1) return PAGES[i].icon;
    }
    if (h.charAt(0) === '#') return 'hash';
    return null;
  }

  /* ─── 3 · The rail ───────────────────────────────────────────────────── */

  safe(function mountRail() {
    if (!sidebar) return;
    sidebar.classList.add('lin-rail');

    /* 3a · An icon per navigation row. draft.js has already stripped the
       decorative emoji off these labels, so the icon is what carries the row
       at 56px. Rows we have no icon for keep their text alignment via CSS. */
    $$('.sidebar-link', sidebar).forEach(function (link) {
      if (link.querySelector('.lin-ico')) return;
      if (link.closest('#onthisGroup')) return;       /* the section list is text-only */
      var name = iconForHref(link.getAttribute('href'));
      if (!name) return;
      link.insertBefore(icon(name), link.firstChild);
      link.classList.add('lin-has-ico');
    });

    /* 3b · Mark the row for the page we are on. The pages set this themselves
       on some surfaces and not others; make it consistent. */
    var matched = false;
    $$('.sidebar-link', sidebar).forEach(function (link) {
      if (link.closest('#onthisGroup')) return;
      var href = (link.getAttribute('href') || '').toLowerCase();
      var target = href.split('#')[0].split('/').pop();
      var on = target === file && href.indexOf('#') === -1;
      link.classList.toggle('active', on);
      if (on) { matched = true; link.setAttribute('aria-current', 'page'); }
      else link.removeAttribute('aria-current');
    });
    if (!matched) {
      var fallback = $('.sidebar-link[href="' + file + '"]', sidebar);
      if (fallback) fallback.classList.add('active');
    }

    /* 3c · Collapse to a 56px icon rail. Persisted, and only ever offered at
       desktop width — below 1024px the rail is already a drawer. */
    var COLLAPSE_KEY = 'lin_rail_collapsed';
    if (store(COLLAPSE_KEY) === '1') body.classList.add('lin-rail-collapsed');

    var logo = $('.sidebar-logo', sidebar);
    if (logo && !$('.lin-rail-collapse', sidebar)) {
      var btn = el('button', 'lin-rail-collapse');
      btn.type = 'button';
      btn.appendChild(icon('panel'));
      btn.title = t('Collapse sidebar', '收起侧栏');
      btn.setAttribute('aria-label', t('Collapse sidebar', '收起侧栏'));
      btn.setAttribute('aria-controls', sidebar.id || 'sidebar');
      var label = function (collapsed) {
        var s = collapsed ? t('Expand sidebar', '展开侧栏') : t('Collapse sidebar', '收起侧栏');
        btn.title = s;
        btn.setAttribute('aria-label', s);
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      };
      btn.addEventListener('click', function () {
        var next = !body.classList.contains('lin-rail-collapsed');
        body.classList.toggle('lin-rail-collapsed', next);
        store(COLLAPSE_KEY, next ? '1' : '0');
        label(next);
      });
      label(body.classList.contains('lin-rail-collapsed'));
      logo.appendChild(btn);
    }

    /* 3d · Collapsed rows need their label as a tooltip. */
    $$('.sidebar-link', sidebar).forEach(function (link) {
      if (link.title) return;
      var label = (link.textContent || '').trim();
      if (label) link.title = label;
    });
  });

  /* ─── 4 · The top bar ────────────────────────────────────────────────── */

  var context = null;      /* the breadcrumb node, kept in sync in §7 */

  safe(function mountTopbar() {
    if (!header) return;
    header.classList.add('lin-topbar');

    var inner = $('.header-inner', header) || header.firstElementChild;
    if (!inner) return;
    inner.classList.add('lin-topbar-inner');

    /* The drawer toggle stops being a floating tile and becomes the first
       thing in the bar. Its inline onclick is untouched. */
    var toggle = $('#sidebarToggle');
    if (toggle && toggle.parentNode !== inner) inner.insertBefore(toggle, inner.firstChild);

    /* Page context. The wordmark lives in the rail on desktop, so the top-left
       is free for the breadcrumb Linear puts there. */
    if (!$('.lin-context', inner)) {
      context = el('div', 'lin-context');
      var crumb = el('span', 'lin-crumb');
      if (here) bi(crumb, here.en, here.zh);
      else crumb.textContent = (document.title || '').split('—')[0].trim();
      context.appendChild(crumb);
      var logo = $('.logo', inner);
      if (logo && logo.nextSibling) inner.insertBefore(context, logo.nextSibling);
      else if (logo) inner.appendChild(context);
      else inner.insertBefore(context, inner.firstChild);
    } else {
      context = $('.lin-context', inner);
    }

    /* Actions. ⌘K goes in front of the toggles the page already owns. */
    var actions = $('.header-actions', inner) || $('.header-actions', header);
    if (actions && !$('.lin-cmdk-btn', actions)) {
      var k = el('button', 'lin-cmdk-btn');
      k.type = 'button';
      k.appendChild(icon('search'));
      var lbl = el('span', 'lin-cmdk-label');
      bi(lbl, 'Search', '搜索');
      k.appendChild(lbl);
      var kbd = el('kbd', 'lin-kbd', /Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘K' : 'Ctrl K');
      k.appendChild(kbd);
      k.title = t('Search and jump — ⌘K', '搜索与跳转 — ⌘K');
      k.setAttribute('aria-label', t('Open command palette', '打开命令面板'));
      k.addEventListener('click', function () { Palette.open(); });
      actions.insertBefore(k, actions.firstChild);
    }
  });

  /* ─── 5 · The view header — tabs, then a context row ─────────────────── */

  var filterMain = null, filterMeta = null;

  safe(function mountViewHeader() {
    if (isMarketing || !header || !header.parentNode) return;
    if ($('.lin-viewheader')) return;

    var vh = el('div', 'lin-viewheader');

    /* 5a · Tabs. On the guide that is the chapter strip the page already
       builds — moved, not rebuilt. Elsewhere it is the study surfaces. */
    var tabs = $('#guideTabs');
    if (tabs) {
      vh.appendChild(tabs);
      tabs.classList.add('lin-tabstrip');
      tabs.setAttribute('role', 'tablist');
    } else {
      var strip = el('nav', 'lin-tabstrip lin-pagetabs');
      strip.setAttribute('aria-label', t('Study surfaces', '学习页面'));
      ['guide.html', 'toc.html', 'exam.html', 'cn-cert.html'].forEach(function (f) {
        var pg = pageFor(f);
        if (!pg) return;
        var a = el('a', 'lin-tab');
        a.href = f;
        bi(a, pg.en, pg.zh);
        if (f === file) { a.classList.add('on'); a.setAttribute('aria-current', 'page'); }
        strip.appendChild(a);
      });
      if (strip.childNodes.length) vh.appendChild(strip);
    }

    /* 5b · The 40px context row. One calm line; no marketing copy. */
    var bar = el('div', 'lin-filterbar');
    filterMain = el('span', 'lin-filter-main');
    filterMeta = el('span', 'lin-filter-meta');
    bar.appendChild(filterMain);
    bar.appendChild(filterMeta);
    vh.appendChild(bar);

    header.parentNode.insertBefore(vh, header.nextSibling);
  });

  /* ─── 6 · What the guide is currently showing ────────────────────────── */

  /* Both strings, always — the palette has to be searchable in the language
     the reader is NOT currently reading in. */
  function chapterTitles(n) {
    var sec = document.getElementById('ch' + n);
    var h = sec && sec.querySelector('h2');
    if (!h) return null;
    var fallback = (h.textContent || '').trim();
    var en = (h.getAttribute('data-en') || fallback).trim();
    var zh = (h.getAttribute('data-zh') || en).trim();
    if (!en && !zh) return null;
    return { en: en, zh: zh };
  }
  function chapterTitle(n) {
    var tt = chapterTitles(n);
    return tt ? (isCN() ? tt.zh : tt.en) : null;
  }
  function currentChapter() {
    var on = $('#guideTabs .guide-tab.on');
    if (on) return parseInt(on.getAttribute('data-ch'), 10) || 1;
    var shown = $('section.chapter.shown');
    if (shown && shown.id) return parseInt(shown.id.replace('ch', ''), 10) || 1;
    return 1;
  }

  function syncContext() {
    safe(function () {
      var crumbText, metaText = '';

      if (isGuide) {
        var n = currentChapter();
        var title = chapterTitle(n);
        crumbText = (isCN() ? '第' + n + '章' : 'Chapter ' + n);
        if (filterMain) filterMain.textContent = title || crumbText;
        var sec = document.getElementById('ch' + n);
        var count = sec ? $$('.acc-item', sec).length : 0;
        if (count) metaText = count + ' ' + (isCN() ? '节' : (count === 1 ? 'section' : 'sections'));
      } else {
        crumbText = here ? t(here.en, here.zh) : (document.title || '').split('—')[0].trim();
        var n2 = 0, unit = '';
        if (file === 'toc.html')      { n2 = $$('.chip-link, .ch-card').length; unit = isCN() ? '章' : 'chapters'; }
        else if (file === 'exam.html'){ n2 = $$('.exam-q, .qo-question').length; unit = isCN() ? '题' : 'questions'; }
        if (n2) metaText = n2 + ' ' + unit;
        /* Off the guide the crumb already says the page name; repeating it in
           the context row is noise, so the row carries only the count — and
           hides itself when there is no count to carry. */
        if (filterMain) filterMain.textContent = '';
      }

      var crumb = context && $('.lin-crumb', context);
      if (crumb && isGuide) crumb.textContent = crumbText;
      if (filterMeta) filterMeta.textContent = metaText;

      var bar = filterMain && filterMain.parentNode;
      if (bar) bar.hidden = !(filterMain.textContent || metaText);
    });
  }

  /* Watch the things the page's own script flips, and re-read on each. */
  safe(function () {
    var tabsHost = $('.lin-tabstrip');
    if (tabsHost) new MutationObserver(syncContext)
      .observe(tabsHost, { subtree: true, attributes: true, attributeFilter: ['class'] });
    /* body class changes cover the language toggle and dark mode */
    new MutationObserver(syncContext)
      .observe(body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('hashchange', syncContext);
  });

  /* Deep links land correctly on their own: the browser honours the
     scroll-margin-top the stylesheet puts on every anchor, so there is
     deliberately no scroll fix-up here. The guide replaceState()s "#chN" on
     load, and re-scrolling to it would jump the reader past the intro. */

  /* ─── 7 · The command palette ────────────────────────────────────────── */

  var Palette = (function () {
    var overlay = null, input = null, list = null, empty = null;
    var items = [], filtered = [], cursor = 0, lastFocus = null, built = false;

    /* --- the index ---------------------------------------------------- */

    function collect() {
      var out = [];

      PAGES.forEach(function (pg) {
        out.push({
          group: t('Pages', '页面'),
          icon: pg.icon,
          label: t(pg.en, pg.zh),
          alt: pg.en + ' ' + pg.zh,
          hint: pg.file,
          run: function () { location.href = pg.file; }
        });
      });

      if (isGuide) {
        for (var n = 1; n <= 13; n++) {
          (function (n) {
            var tt = chapterTitles(n);
            if (!tt) return;
            out.push({
              group: t('Chapters', '章节'),
              icon: 'book',
              label: (isCN() ? '第' + n + '章 · ' : 'Ch ' + n + ' · ') + (isCN() ? tt.zh : tt.en),
              alt: tt.en + ' ' + tt.zh + ' ch' + n + ' 第' + n + '章',
              hint: '#ch' + n,
              run: function () { goChapter(n); }
            });
          })(n);
        }
        $$('.accordion').forEach(function (acc, ci) {
          var ch = ci + 1;
          $$('.acc-header', acc).forEach(function (h) {
            var item = h.closest ? h.closest('.acc-item') : null;
            if (!item || !item.id) return;
            var en = (h.getAttribute('data-en') || h.textContent || '').trim();
            var zh = (h.getAttribute('data-zh') || en).trim();
            if (!en && !zh) return;
            out.push({
              group: t('Sections', '章节小节'),
              icon: 'hash',
              label: isCN() ? zh : en,
              alt: en + ' ' + zh,
              hint: (isCN() ? '第' + ch + '章' : 'Ch ' + ch),
              run: function () { goSection(ch, item.id); }
            });
          });
        });
      } else {
        $$('h2[data-en], h2[data-zh]').slice(0, 60).forEach(function (h) {
          var sec = h.closest ? h.closest('section') : null;
          if (!sec || !sec.id) return;
          var en = (h.getAttribute('data-en') || h.textContent || '').trim();
          var zh = (h.getAttribute('data-zh') || en).trim();
          if (!en && !zh) return;
          out.push({
            group: t('On this page', '本页'),
            icon: 'hash',
            label: isCN() ? zh : en,
            alt: en + ' ' + zh,
            hint: '#' + sec.id,
            run: function () { location.hash = '#' + sec.id; }
          });
        });
      }

      var dark = $('#darkToggle'), lang = $('#langToggle');
      if (dark) out.push({
        group: t('Actions', '操作'), icon: 'sun',
        label: t('Toggle dark mode', '切换深色模式'), alt: 'dark theme 深色 主题',
        run: function () { dark.click(); }
      });
      if (lang) out.push({
        group: t('Actions', '操作'), icon: 'lang',
        label: t('Toggle 中文 / English', '切换 中文 / English'), alt: 'language 语言 中英',
        run: function () { lang.click(); }
      });
      if (sidebar) out.push({
        group: t('Actions', '操作'), icon: 'panel',
        label: t('Toggle sidebar', '切换侧栏'), alt: 'sidebar collapse 侧栏',
        run: function () {
          var b = $('.lin-rail-collapse');
          if (b) b.click(); else sidebar.classList.toggle('open');
        }
      });

      return out;
    }

    /* --- navigation that reuses the page's own handlers ---------------- */

    function goChapter(n) {
      var tab = $('#guideTabs .guide-tab[data-ch="' + n + '"]');
      if (tab) { tab.click(); return true; }
      location.hash = '#ch' + n;
      return false;
    }
    function openItem(id) {
      var item = document.getElementById(id);
      if (!item) return false;
      if (!item.classList.contains('open')) {
        var h = item.querySelector('.acc-header');
        if (h) h.click();                       /* the page's toggleAcc() */
        else item.classList.add('open');
      }
      item.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
    function goSection(ch, id) {
      if (isGuide && currentChapter() !== ch) {
        goChapter(ch);
        setTimeout(function () { openItem(id); }, 300);
      } else {
        openItem(id);
      }
    }

    /* --- matching -------------------------------------------------------
       Substring first (cheap, predictable), then an in-order subsequence so
       "ch3 card" still finds "Ch 3 · Cardiovascular System". */

    function score(item, q) {
      if (!q) return 1;
      var hay = (item.label + ' ' + (item.alt || '') + ' ' + (item.hint || '') + ' ' + item.group).toLowerCase();
      var idx = hay.indexOf(q);
      if (idx > -1) return 1000 - idx;
      var i = 0, j = 0, gaps = 0;
      while (i < q.length && j < hay.length) {
        if (q.charAt(i) === hay.charAt(j)) i++; else gaps++;
        j++;
      }
      return i === q.length ? Math.max(1, 400 - gaps) : 0;
    }

    function render() {
      list.innerHTML = '';
      if (!filtered.length) {
        empty.hidden = false;
        list.hidden = true;
        return;
      }
      empty.hidden = true;
      list.hidden = false;

      var group = null;
      filtered.forEach(function (item, i) {
        if (item.group !== group) {
          group = item.group;
          var g = el('li', 'lin-cmdk-group', group);
          g.setAttribute('role', 'presentation');
          list.appendChild(g);
        }
        var li = el('li', 'lin-cmdk-item' + (i === cursor ? ' on' : ''));
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', i === cursor ? 'true' : 'false');
        li.id = 'lin-cmdk-opt-' + i;
        li.appendChild(icon(item.icon));
        li.appendChild(el('span', 'lin-cmdk-label', item.label));
        if (item.hint) li.appendChild(el('span', 'lin-cmdk-hint', item.hint));
        li.addEventListener('mousemove', function () { if (cursor !== i) { cursor = i; paint(); } });
        li.addEventListener('click', function () { run(i); });
        list.appendChild(li);
      });
      paint();
    }

    function paint() {
      $$('.lin-cmdk-item', list).forEach(function (li, i) {
        var on = i === cursor;
        li.classList.toggle('on', on);
        li.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) {
          input.setAttribute('aria-activedescendant', li.id);
          var r = li.getBoundingClientRect(), p = list.getBoundingClientRect();
          if (r.top < p.top) list.scrollTop -= (p.top - r.top) + 8;
          else if (r.bottom > p.bottom) list.scrollTop += (r.bottom - p.bottom) + 8;
        }
      });
    }

    function filter() {
      var q = (input.value || '').trim().toLowerCase();
      filtered = items
        .map(function (it) { return { it: it, s: score(it, q) }; })
        .filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .map(function (r) { return r.it; })
        .slice(0, 60);
      cursor = 0;
      render();
    }

    function run(i) {
      var item = filtered[i];
      if (!item) return;
      close();
      setTimeout(function () { safe(item.run); }, 0);
    }

    /* --- shell ---------------------------------------------------------- */

    function build() {
      if (built) return;
      built = true;

      overlay = el('div', 'lin-cmdk');
      overlay.hidden = true;
      overlay.innerHTML = '';

      var panel = el('div', 'lin-cmdk-panel');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', t('Search and jump', '搜索与跳转'));

      var row = el('div', 'lin-cmdk-input-row');
      row.appendChild(icon('search'));
      input = el('input', 'lin-cmdk-input');
      input.type = 'text';
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-expanded', 'true');
      input.setAttribute('aria-controls', 'lin-cmdk-list');
      input.setAttribute('aria-autocomplete', 'list');
      input.autocomplete = 'off';
      input.spellcheck = false;
      row.appendChild(input);
      var esc = el('kbd', 'lin-kbd', 'ESC');
      row.appendChild(esc);
      panel.appendChild(row);

      list = el('ul', 'lin-cmdk-list');
      list.id = 'lin-cmdk-list';
      list.setAttribute('role', 'listbox');
      panel.appendChild(list);

      empty = el('div', 'lin-cmdk-empty');
      empty.hidden = true;
      panel.appendChild(empty);

      var foot = el('div', 'lin-cmdk-foot');
      foot.appendChild(el('span', null, '↑↓ ' + t('navigate', '选择')));
      foot.appendChild(el('span', null, '↵ ' + t('open', '打开')));
      foot.appendChild(el('span', null, 'esc ' + t('close', '关闭')));
      panel.appendChild(foot);

      overlay.appendChild(panel);
      body.appendChild(overlay);

      overlay.addEventListener('mousedown', function (e) {
        if (e.target === overlay) close();
      });
      input.addEventListener('input', filter);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); if (filtered.length) { cursor = (cursor + 1) % filtered.length; paint(); } }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (filtered.length) { cursor = (cursor - 1 + filtered.length) % filtered.length; paint(); } }
        else if (e.key === 'Home') { e.preventDefault(); cursor = 0; paint(); }
        else if (e.key === 'End') { e.preventDefault(); cursor = Math.max(0, filtered.length - 1); paint(); }
        else if (e.key === 'Enter') { e.preventDefault(); run(cursor); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'Tab') { e.preventDefault(); }   /* the palette is the whole tab stop */
      });
    }

    function isOpen() { return overlay && !overlay.hidden; }

    function open() {
      build();
      if (isOpen()) return;
      lastFocus = document.activeElement;
      items = collect();
      input.value = '';
      input.placeholder = t('Search chapters, sections, pages…', '搜索章节、小节、页面…');
      empty.textContent = t('Nothing matches.', '没有匹配结果。');
      overlay.hidden = false;
      body.classList.add('lin-cmdk-open');
      filter();
      input.focus();
    }

    function close() {
      if (!isOpen()) return;
      overlay.hidden = true;
      body.classList.remove('lin-cmdk-open');
      if (lastFocus && lastFocus.focus) safe(function () { lastFocus.focus(); });
      lastFocus = null;
    }

    return { open: open, close: close, isOpen: isOpen };
  })();

  /* Global keys. "/" only when the reader is not typing, and we never take a
     key away from an existing overlay that is already up. */
  safe(function () {
    function typing(node) {
      if (!node) return false;
      var tag = (node.tagName || '').toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || node.isContentEditable;
    }
    document.addEventListener('keydown', function (e) {
      var k = (e.key || '').toLowerCase();
      if (k === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        Palette.isOpen() ? Palette.close() : Palette.open();
        return;
      }
      if (k === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(e.target) && !Palette.isOpen()) {
        e.preventDefault();
        Palette.open();
      }
    }, true);
  });

  /* ─── 8 · First paint ────────────────────────────────────────────────── */
  syncContext();
})();

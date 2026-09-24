/* ═══════════════════════════════════════════════════════════════════════
 * shapes-fx.js — "Clinical Blue" skin, the moving parts.
 *   1. A shared <defs> sheet: ink gradients, the stipple/spray filter, the
 *      extrusion helper class and the two ribbon gradients every line icon
 *      strokes with.
 *   2. Art, all drawn as SVG in one print-poster style (flat faces, a hard
 *      extruded shadow, stipple grain):
 *        · splash — impossible-ribbon shapes (Möbius ring, twisted column,
 *          impossible V, infinity band, pentagram knot)
 *        · landing — the Vitalité icon set: heart + ECG, bone, dumbbell,
 *          pulse trace, apple; book, clinic shield, chat; flashcards,
 *          progress, AI assistant, medal, bilingual tags, balance scale
 *   3. Landing wiring: hero mosaic, section-door art, feature tiles.
 *   4. Linear-style text reveal — headline words rise out of a blur one
 *      after another; section headings do the same as they scroll in.
 *   5. The semicircle sidebar — rows bow along the arc as it scrolls.
 * Pairs with shapes-skin.css. Remove with: python3 tools/shapes_switch.py off
 * ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var uid = 0;

  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn('[shapes-fx]', e); } }

  /* ─── 1 · Shared defs ──────────────────────────────────────────────── */

  /* [highlight, body, shade] per ink */
  var INK = {
    white:  ['#FFFFFF', '#E6EEF7', '#B7C9DD'],
    sky:    ['#C3DAF1', '#8DB6E2', '#5C8CC4'],
    cobalt: ['#4C7FC0', '#1E4F8F', '#123463'],
    navy:   ['#2D4466', '#16304F', '#0A1A2E'],
    red:    ['#D95A62', '#B3323A', '#7A1822'],
    slate:  ['#8593A5', '#5E6B7B', '#3B4553']
  };
  var DEEP = '#07111F';   /* extrusion shadow on most panels */

  function grad(id, c) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] + '"/>' +
      '<stop offset="1" stop-color="' + c[2] + '"/></linearGradient>';
  }

  function mountDefs() {
    if (document.getElementById('os-defs')) return;
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('id', 'os-defs');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('width', '0');
    s.setAttribute('height', '0');
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    var d = '';
    for (var k in INK) d += grad('os-g-' + k, INK[k]);
    /* Icon ribbons — user-space so straight strokes (zero-width bbox) still paint. */
    d += '<linearGradient id="os-ribbon" gradientUnits="userSpaceOnUse" x1="1" y1="1" x2="15" y2="15">' +
         '<stop offset="0" stop-color="#1E4F8F"/><stop offset="1" stop-color="#B3323A"/></linearGradient>';
    d += '<linearGradient id="os-ribbon-dark" gradientUnits="userSpaceOnUse" x1="1" y1="1" x2="15" y2="15">' +
         '<stop offset="0" stop-color="#A9C8EA"/><stop offset="1" stop-color="#E0575F"/></linearGradient>';
    /* Stipple: roughen the edges a touch, then sprinkle light + dark specks
       inside the shape — riso / airbrush grain. */
    d += '<filter id="os-speckle" filterUnits="userSpaceOnUse" x="-6" y="-6" width="220" height="112" color-interpolation-filters="sRGB">' +
         '<feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves="2" seed="11" result="t"/>' +
         '<feDisplacementMap in="SourceGraphic" in2="t" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="rough"/>' +
         '<feColorMatrix in="t" type="matrix" values="0 0 0 0 .96  0 0 0 0 .98  0 0 0 0 1  9 0 0 0 -5.8" result="lite"/>' +
         '<feColorMatrix in="t" type="matrix" values="0 0 0 0 .03  0 0 0 0 .08  0 0 0 0 .18  0 8 0 0 -5.5" result="dark"/>' +
         '<feComposite in="lite" in2="rough" operator="in" result="l2"/>' +
         '<feComposite in="dark" in2="rough" operator="in" result="d2"/>' +
         '<feMerge><feMergeNode in="rough"/><feMergeNode in="d2"/><feMergeNode in="l2"/></feMerge>' +
         '</filter>';
    s.innerHTML = '<defs>' + d + '</defs>' +
      /* extrusion copies: every part painted one flat shadow colour */
      '<style>.os-x *{fill:var(--os-xc)!important;stroke:var(--os-xc)!important}' +
      '.os-x [fill="none"]{fill:none!important}.os-x text{stroke:none!important}</style>';
    document.body.insertBefore(s, document.body.firstChild);
  }

  /* ─── 2 · Art ─────────────────────────────────────────────────────── */

  function wrap(inner, opts, vb) {
    opts = opts || {};
    var f = opts.grain === false ? '' : ' filter="url(#os-speckle)"';
    return '<svg xmlns="' + NS + '" viewBox="' + (vb || '0 0 100 100') + '" aria-hidden="true" focusable="false">' +
           '<g' + f + '>' + inner + '</g></svg>';
  }
  /* A hard extruded shadow under the parts — the print-poster depth. */
  function dim(parts, xc, dx, dy) {
    return '<g class="os-x" style="--os-xc:' + (xc || DEEP) + '" transform="translate(' + (dx || 3) + ' ' + (dy || 4) + ')">' +
           parts + '</g>' + parts;
  }
  function poly(pts, fill) { return '<polygon points="' + pts + '" fill="' + fill + '"/>'; }
  function pt(cx, cy, r, deg) {
    var a = deg * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function f1(n) { return Math.round(n * 10) / 10; }
  function shine(cx, cy, rx, ry, rot) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".32"' +
           (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') + '/>';
  }

  /* ── 2a · Splash: impossible-ribbon shapes ── */

  function mobius(o) {
    var s = '<circle cx="50" cy="50" r="31" fill="none" stroke="url(#os-g-white)" stroke-width="27"/>';
    s += '<path d="M78 62 A31 31 0 0 1 36 78" fill="none" stroke="' + INK.sky[2] + '" stroke-opacity=".35" stroke-width="12" stroke-linecap="round"/>';
    for (var k = 0; k < 3; k++) {
      var a = k * 120 - 90;
      var p0 = pt(50, 50, 44.5, a), c = pt(50, 50, 45, a + 72), p1 = pt(50, 50, 17.5, a + 118);
      var d = 'M' + f1(p0[0]) + ' ' + f1(p0[1]) + ' Q' + f1(c[0]) + ' ' + f1(c[1]) + ' ' + f1(p1[0]) + ' ' + f1(p1[1]);
      s += '<path d="' + d + '" fill="none" stroke="' + INK.red[2] + '" stroke-width="5.2" stroke-linecap="round" transform="translate(1.2 1.6)" opacity=".55"/>';
      s += '<path d="' + d + '" fill="none" stroke="url(#os-g-red)" stroke-width="4" stroke-linecap="round"/>';
    }
    return wrap(s, o);
  }

  function column(o) {
    var id = 'os-col-' + (++uid);
    var body = 'M31 20 C31 40 38 50 36 60 C34 70 28 78 31 86 L69 86 C72 78 66 70 64 60 C62 50 69 40 69 20 Z';
    var s = '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath>';
    s += '<ellipse cx="50" cy="86" rx="19" ry="5.5" fill="' + INK.cobalt[2] + '"/>';
    s += '<path d="' + body + '" fill="url(#os-g-sky)"/>';
    s += '<g clip-path="url(#' + id + ')">';
    [26, 42, 58, 74, 90].forEach(function (y) {
      s += '<path d="M24 ' + y + ' C44 ' + (y - 13) + ' 58 ' + (y + 13) + ' 78 ' + (y - 2) + '" fill="none" stroke="' + INK.cobalt[1] + '" stroke-width="8"/>';
      s += '<path d="M24 ' + (y - 4.5) + ' C44 ' + (y - 17.5) + ' 58 ' + (y + 8.5) + ' 78 ' + (y - 6.5) + '" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>';
    });
    s += '</g>';
    s += '<ellipse cx="50" cy="20" rx="19" ry="6" fill="url(#os-g-white)"/>';
    return wrap(s, o);
  }

  function impossibleV(o) {
    var s = '';
    s += poly('36.5,34 80,34 69,49 58,34', INK.sky[2]);                    /* inner face under the bar */
    s += poly('22,6 96,6 96,34 36.5,34', 'url(#os-g-white)');              /* top bar */
    s += poly('80,34 96,34 66,94 36,94', 'url(#os-g-red)');                /* right arm */
    s += poly('22,6 4,36 36,94 52,64', 'url(#os-g-cobalt)');               /* left arm, on top */
    s += poly('22,6 4,36 10,36 25,11', INK.cobalt[0]);                     /* lit edge */
    return wrap(s, o);
  }

  function infinity(o) {
    var id = 'os-inf-' + (++uid);
    var d = 'M50 50 C62 31 91 25 91 50 C91 75 62 69 50 50 C38 31 9 25 9 50 C9 75 38 69 50 50 Z';
    var s = '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0" stop-color="' + INK.sky[1] + '"/><stop offset=".45" stop-color="' + INK.cobalt[1] + '"/>' +
            '<stop offset=".6" stop-color="' + INK.cobalt[1] + '"/><stop offset="1" stop-color="' + INK.red[1] + '"/></linearGradient>';
    s += '<path d="' + d + '" fill="none" stroke="' + INK.navy[2] + '" stroke-opacity=".5" stroke-width="14" transform="translate(1.4 2)"/>';
    s += '<path d="' + d + '" fill="none" stroke="url(#' + id + ')" stroke-width="13" stroke-linejoin="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" transform="translate(-1.6 -2.4)"/>';
    s += '<path d="M44.2 58.8 L55.8 41.2" stroke="url(#os-g-cobalt)" stroke-width="13"/>';   /* the twist: this pass sits on top */
    return wrap(s, o);
  }

  function pentagram(o) {
    var P = [];
    for (var k = 0; k < 5; k++) P.push(pt(50, 54, 44, -90 + 72 * k));
    var order = [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]];
    var fills = ['url(#os-g-cobalt)', 'url(#os-g-red)', 'url(#os-g-sky)', 'url(#os-g-cobalt)', 'url(#os-g-red)'];
    var sides = [INK.cobalt[2], INK.red[2], INK.sky[2], INK.cobalt[2], INK.red[2]];
    var w = 10.5, ext = 4;
    function band(i, from, to) {
      var a = P[order[i][0]], b = P[order[i][1]];
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / L, uy = dy / L, nx = -uy * w / 2, ny = ux * w / 2;
      var s0 = -ext + (L + 2 * ext) * from, s1 = -ext + (L + 2 * ext) * to;
      var A = [a[0] + ux * s0, a[1] + uy * s0], B = [a[0] + ux * s1, a[1] + uy * s1];
      return [A[0] + nx, A[1] + ny, B[0] + nx, B[1] + ny, B[0] - nx, B[1] - ny, A[0] - nx, A[1] - ny].map(f1).join(',');
    }
    var s = '';
    for (var i = 0; i < 5; i++) {
      s += '<polygon points="' + band(i, 0, 1) + '" fill="' + sides[i] + '" transform="translate(2.2 3.2)"/>';
      s += poly(band(i, 0, 1), fills[i]);
    }
    /* close the weave: the first band passes back over the last one */
    s += '<polygon points="' + band(0, 0, .42) + '" fill="' + sides[0] + '" transform="translate(2.2 3.2)"/>';
    s += poly(band(0, 0, .42), fills[0]);
    return wrap(s, o);
  }

  var SHAPES = { mobius: mobius, column: column, v: impossibleV, infinity: infinity, pentagram: pentagram };

  /* ── 2b · Landing: the Vitalité icon set ── */

  /* Heart with an ECG trace — cardio / vitals. */
  function heart(o) {
    var p = '<path d="M50 88 C20 68 7 52 7 35 C7 20 18 10 31 10 C39 10 46 14 50 21 C54 14 61 10 69 10 C82 10 93 20 93 35 C93 52 80 68 50 88 Z" fill="url(#os-g-red)"/>';
    p += shine(29, 28, 9, 5, -35);
    p += '<path d="M12 48 H33 L39 36 L46 62 L54 26 L60 52 L65 48 H88" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>';
    return wrap(dim(p), o);
  }
  /* Bone — the musculoskeletal chapters. */
  function bone(o) {
    var b = '<g transform="rotate(-35 50 50)">' +
      '<rect x="25" y="43" width="50" height="14" rx="4" fill="url(#os-g-white)"/>' +
      '<circle cx="25" cy="41" r="10" fill="url(#os-g-white)"/><circle cx="25" cy="59" r="10" fill="url(#os-g-white)"/>' +
      '<circle cx="75" cy="41" r="10" fill="url(#os-g-white)"/><circle cx="75" cy="59" r="10" fill="url(#os-g-white)"/>' +
      '<rect x="30" y="45" width="40" height="3" rx="1.5" fill="#fff" opacity=".7"/></g>';
    return wrap(dim(b, INK.red[2]), o);
  }
  /* Dumbbell — training. */
  function dumbbell(o) {
    var d = '<g transform="rotate(-18 50 50)">' +
      '<rect x="20" y="45" width="60" height="10" rx="3" fill="url(#os-g-white)"/>' +
      '<rect x="11" y="24" width="12" height="52" rx="3" fill="url(#os-g-navy)"/>' +
      '<rect x="23" y="31" width="9" height="38" rx="2" fill="url(#os-g-cobalt)"/>' +
      '<rect x="77" y="24" width="12" height="52" rx="3" fill="url(#os-g-navy)"/>' +
      '<rect x="68" y="31" width="9" height="38" rx="2" fill="url(#os-g-cobalt)"/>' +
      '<rect x="13" y="27" width="3" height="46" rx="1.5" fill="#fff" opacity=".3"/></g>';
    return wrap(dim(d, INK.navy[2]), o);
  }
  /* Pulse trace on ECG paper — the wide panel. */
  function pulse(o) {
    var id = 'os-pulse-' + (++uid);
    var s = '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0">' +
            '<stop offset="0" stop-color="' + INK.sky[1] + '"/><stop offset=".55" stop-color="#fff"/>' +
            '<stop offset="1" stop-color="' + INK.red[0] + '"/></linearGradient>';
    [22, 40, 58, 76].forEach(function (y) {
      s += '<path d="M4 ' + y + ' H196" stroke="' + INK.sky[1] + '" stroke-opacity=".22" stroke-width="1"/>';
    });
    [30, 70, 110, 150].forEach(function (x) {
      s += '<path d="M' + x + ' 10 V90" stroke="' + INK.sky[1] + '" stroke-opacity=".14" stroke-width="1"/>';
    });
    var line = '<path d="M6 56 H58 L68 36 L80 80 L96 14 L110 70 L120 56 H150 L156 48 L162 56 H184" fill="none" stroke="url(#' + id + ')" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>' +
               '<circle cx="190" cy="56" r="6.5" fill="url(#os-g-red)"/>';
    return wrap(s + dim(line, DEEP, 3, 4), o, '0 0 200 100');
  }
  /* Apple with a leaf — nutrition. */
  function apple(o) {
    var a = '<path d="M50 30 C40 22 16 23 16 50 C16 73 33 92 50 85 C67 92 84 73 84 50 C84 23 60 22 50 30 Z" fill="url(#os-g-red)"/>' +
            shine(33, 44, 6, 11, 20) +
            '<path d="M50 31 C50 23 52 16 57 11" fill="none" stroke="' + INK.navy[1] + '" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="M53 22 C58 9 73 7 80 11 C75 22 62 27 53 22 Z" fill="url(#os-g-cobalt)"/>';
    return wrap(dim(a, INK.slate[1]), o);
  }

  /* Open book — Knowledge. */
  function book(o) {
    var b = poly('6,34 50,42 94,34 94,84 50,92 6,84', 'url(#os-g-navy)') +
            poly('10,28 50,36 50,86 10,78', 'url(#os-g-white)') +
            poly('50,36 90,28 90,78 50,86', '#F4F8FC');
    [10, 18, 26, 34].forEach(function (k) {
      b += '<path d="M16 ' + f1(29.2 + k) + ' L44 ' + f1(34.8 + k) + '" stroke="' + INK.sky[1] + '" stroke-width="2.4" stroke-linecap="round"/>';
      b += '<path d="M56 ' + f1(34.8 + k) + ' L76 ' + f1(30.8 + k) + '" stroke="' + INK.sky[1] + '" stroke-width="2.4" stroke-linecap="round"/>';
    });
    b += poly('80,26 88,24.4 88,50 84,46 80,50', 'url(#os-g-red)');       /* bookmark */
    return wrap(dim(b), o);
  }
  /* Shield with a cross — Infirmary. */
  function clinic(o) {
    var s = '<path d="M50 6 L87 19 V47 C87 70 71 85 50 94 C29 85 13 70 13 47 V19 Z" fill="url(#os-g-white)"/>' +
            '<path d="M50 6 L87 19 V47 C87 70 71 85 50 94 Z" fill="' + INK.sky[0] + '" opacity=".35"/>' +
            '<path d="M42 28 H58 V42 H72 V58 H58 V72 H42 V58 H28 V42 H42 Z" fill="url(#os-g-red)"/>';
    return wrap(dim(s), o);
  }
  /* Two speech bubbles — Social. */
  function chat(o) {
    var c = '<rect x="6" y="12" width="60" height="42" rx="12" fill="url(#os-g-sky)"/>' + poly('18,52 16,68 32,52', INK.sky[1]) +
            '<rect x="34" y="38" width="60" height="40" rx="12" fill="url(#os-g-white)"/>' + poly('80,76 84,90 68,76', INK.white[1]) +
            '<circle cx="50" cy="58" r="4" fill="' + INK.cobalt[1] + '"/><circle cx="64" cy="58" r="4" fill="' + INK.cobalt[1] + '"/>' +
            '<circle cx="78" cy="58" r="4" fill="' + INK.red[1] + '"/>' +
            '<rect x="16" y="24" width="30" height="4" rx="2" fill="#fff" opacity=".7"/><rect x="16" y="33" width="20" height="4" rx="2" fill="#fff" opacity=".7"/>';
    return wrap(dim(c), o);
  }

  /* Fanned flashcards. */
  function cards(o) {
    var c = '<rect x="24" y="22" width="52" height="60" rx="6" fill="url(#os-g-slate)" transform="rotate(-16 50 52)"/>' +
            '<rect x="24" y="22" width="52" height="60" rx="6" fill="url(#os-g-sky)" transform="rotate(-6 50 52)"/>' +
            '<g transform="rotate(7 50 52)"><rect x="24" y="22" width="52" height="60" rx="6" fill="url(#os-g-white)"/>' +
            '<rect x="32" y="34" width="36" height="5" rx="2.5" fill="' + INK.cobalt[1] + '"/>' +
            '<rect x="32" y="46" width="28" height="4" rx="2" fill="' + INK.sky[1] + '"/>' +
            '<rect x="32" y="55" width="32" height="4" rx="2" fill="' + INK.sky[1] + '"/>' +
            '<circle cx="64" cy="70" r="5" fill="' + INK.red[1] + '"/></g>';
    return wrap(dim(c, DEEP, 2.5, 3), o);
  }
  /* Rising bars + arrow — adaptive practice. */
  function progress(o) {
    var p = '<rect x="12" y="62" width="18" height="26" rx="3" fill="url(#os-g-sky)"/>' +
            '<rect x="36" y="48" width="18" height="40" rx="3" fill="url(#os-g-white)"/>' +
            '<rect x="60" y="32" width="18" height="56" rx="3" fill="url(#os-g-white)"/>' +
            '<path d="M12 50 L36 34 L52 40 L80 16" fill="none" stroke="' + INK.red[1] + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
            poly('70,12 88,8 84,26', INK.red[1]);
    return wrap(dim(p, DEEP, 2.5, 3), o);
  }
  /* Chat bubble with a pulse + spark — AI recovery assistant. */
  function assistant(o) {
    var a = '<rect x="8" y="20" width="70" height="52" rx="14" fill="url(#os-g-white)"/>' + poly('20,70 16,88 36,70', INK.white[1]) +
            '<path d="M18 46 H32 L37 36 L44 58 L50 40 L55 46 H68" fill="none" stroke="' + INK.cobalt[1] + '" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>' +
            '<path d="M80 4 L84.5 15.5 L96 20 L84.5 24.5 L80 36 L75.5 24.5 L64 20 L75.5 15.5 Z" fill="url(#os-g-sky)"/>';
    return wrap(dim(a, DEEP, 2.5, 3), o);
  }
  /* Rosette medal — exam prep & certificate. */
  function medal(o) {
    var m = poly('34,52 22,92 36,84 44,96 52,58', 'url(#os-g-red)') +
            poly('66,52 78,92 64,84 56,96 48,58', 'url(#os-g-sky)') +
            '<circle cx="50" cy="38" r="28" fill="url(#os-g-white)"/>' +
            '<circle cx="50" cy="38" r="19" fill="none" stroke="' + INK.sky[1] + '" stroke-width="3"/>' +
            '<path d="M39 38 L47 46 L62 30" fill="none" stroke="' + INK.cobalt[1] + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';
    return wrap(dim(m, DEEP, 2.5, 3), o);
  }
  /* Two language tags, A + 文 — bilingual. */
  function bilingual(o) {
    var t = '<rect x="36" y="10" width="54" height="46" rx="10" fill="url(#os-g-navy)"/>' +
            '<text x="63" y="45" text-anchor="middle" font-size="30" font-weight="700" fill="#fff" font-family="\'Songti SC\',\'SimSun\',serif">文</text>' +
            '<rect x="10" y="42" width="54" height="46" rx="10" fill="url(#os-g-white)"/>' +
            '<text x="37" y="77" text-anchor="middle" font-size="32" font-weight="700" fill="' + INK.red[1] + '" font-family="\'Playfair Display\',Georgia,serif">A</text>';
    return wrap(dim(t, DEEP, 2.5, 3), o);
  }
  /* Balance scale — debate, not dogmatism. */
  function balance(o) {
    var b = '<rect x="46.5" y="18" width="7" height="66" rx="3" fill="url(#os-g-white)"/>' +
            '<rect x="28" y="82" width="44" height="9" rx="3" fill="url(#os-g-white)"/>' +
            '<path d="M14 30 L86 22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
            '<circle cx="50" cy="16" r="6" fill="url(#os-g-red)"/>' +
            '<path d="M14 30 L6 58 M14 30 L26 58 M86 22 L76 50 M86 22 L96 50" stroke="' + INK.white[2] + '" stroke-width="2"/>' +
            '<path d="M3 58 H29 C28 67 21 71 16 71 C11 71 4 67 3 58 Z" fill="url(#os-g-red)"/>' +
            '<path d="M73 50 H99 C98 59 91 63 86 63 C81 63 74 59 73 50 Z" fill="url(#os-g-sky)"/>';
    return wrap(dim(b, DEEP, 2.5, 3), o);
  }

  window.VitaliteShapes = {
    splash: SHAPES,
    icons: { heart: heart, bone: bone, dumbbell: dumbbell, pulse: pulse, apple: apple, book: book, clinic: clinic,
             chat: chat, cards: cards, progress: progress, assistant: assistant, medal: medal, bilingual: bilingual, balance: balance }
  };

  /* ─── 3 · Landing wiring ──────────────────────────────────────────── */

  var mosaic = null;

  function mountMosaic() {
    var actions = document.querySelector('.landing .hero .hero-actions');
    if (!actions || document.querySelector('.os-mosaic')) return;
    mosaic = document.createElement('div');
    mosaic.className = 'os-mosaic' + (reduce ? '' : ' os-pre');
    mosaic.setAttribute('aria-hidden', 'true');
    [['m1', 'os-ink-cobalt', heart],
     ['m2', 'os-ink-crimson', bone],
     ['m3', 'os-ink-sky', dumbbell],
     ['m4', 'os-ink-navy', pulse],
     ['m5', 'os-ink-ice', apple]].forEach(function (c) {
      var p = document.createElement('div');
      p.className = c[0] + ' ' + c[1];
      p.innerHTML = c[2]();
      mosaic.appendChild(p);
    });
    actions.parentNode.insertBefore(mosaic, actions.nextSibling);
  }

  function mountCardArt() {
    /* The three section doors, in page order: Knowledge · Infirmary · Social. */
    var doors = [['os-ink-cobalt', book], ['os-ink-crimson', clinic], ['os-ink-navy', chat]];
    document.querySelectorAll('.landing .fork-card').forEach(function (card, i) {
      if (card.querySelector('.os-art')) return;
      var c = doors[i % doors.length];
      var art = document.createElement('div');
      art.className = 'os-art ' + c[0];
      art.setAttribute('aria-hidden', 'true');
      art.innerHTML = c[1]();
      var old = card.querySelector('.fork-ico');
      if (old) old.parentNode.removeChild(old);
      card.insertBefore(art, card.firstChild);
    });
    /* Feature cards, in page order: flashcards · adaptive practice · AI assistant ·
       exam prep & certificate · bilingual · debate. */
    var feats = [['os-ink-cobalt', cards], ['os-ink-navy', progress], ['os-ink-crimson', assistant],
                 ['os-ink-navy', medal], ['os-ink-cobalt', bilingual], ['os-ink-slate', balance]];
    document.querySelectorAll('.landing .feature-card .co-ico').forEach(function (ico, i) {
      if (ico.classList.contains('os-shape-ico')) return;
      var c = feats[i % feats.length];
      ico.classList.add('os-shape-ico', c[0]);
      ico.setAttribute('aria-hidden', 'true');
      ico.innerHTML = c[1]({ grain: false });
    });
  }

  function dressSplash() {
    var sp = document.getElementById('v-splash');
    if (!sp || sp.querySelector('.os-splash-shape')) return;
    [['mobius', 'left:6%;top:12%;width:min(22vw,210px)', '-4s'],
     ['pentagram', 'right:7%;top:18%;width:min(20vw,190px)', '-1s'],
     ['infinity', 'left:50%;bottom:6%;width:min(34vw,320px);margin-left:calc(min(34vw,320px) / -2)', '-6s'],
     ['v', 'left:14%;bottom:14%;width:min(13vw,120px)', '-3s'],
     ['column', 'right:16%;bottom:12%;width:min(12vw,110px)', '-2s']].forEach(function (c) {
      var d = document.createElement('div');
      d.className = 'os-splash-shape';
      d.style.cssText = 'position:absolute;pointer-events:none;opacity:0;' + c[1] +
        ';animation:os-splash-in 1.1s cubic-bezier(.16,1,.3,1) forwards, os-float 9s ease-in-out ' + c[2] + ' infinite';
      d.innerHTML = SHAPES[c[0]]();
      sp.insertBefore(d, sp.firstChild);
    });
    if (!document.getElementById('os-splash-kf')) {
      var st = document.createElement('style');
      st.id = 'os-splash-kf';
      st.textContent = '@keyframes os-splash-in{from{opacity:0;transform:scale(.8) rotate(-10deg);filter:blur(8px)}to{opacity:.95;transform:none;filter:blur(0)}}' +
        '.os-splash-shape svg{width:100%;height:auto;display:block}' +
        '@media (max-width:640px){.os-splash-shape{transform-origin:center;scale:1.5}}' +
        '@media (prefers-reduced-motion:reduce){.os-splash-shape{animation:none!important;opacity:.95!important}}';
      document.head.appendChild(st);
    }
  }

  /* ─── 4 · Linear-style text reveal ────────────────────────────────── */

  var CJK = /[　-〿㐀-鿿＀-￯]/;

  /* Wrap every word (every character, for Chinese) of el's text in a span.
     Whitespace stays as plain text nodes so lines still wrap naturally. */
  function split(el) {
    if (el.getAttribute('data-os-split')) return el.querySelectorAll('.os-w').length;
    var n = 0;
    (function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (k) {
        if (k.nodeType === 1) { if (!k.classList.contains('os-w')) walk(k); return; }
        if (k.nodeType !== 3 || !k.nodeValue.trim()) return;
        var frag = document.createDocumentFragment();
        k.nodeValue.split(/(\s+)/).forEach(function (tok) {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          var parts = CJK.test(tok) ? tok.match(/[　-〿㐀-鿿＀-￯]|[^　-〿㐀-鿿＀-￯]+/g) : [tok];
          parts.forEach(function (p) {
            /* outer span animates (blur/fade/rise); inner span carries any
               gradient text — Chrome drops background-clip:text on an
               element that also has a filter */
            var w = document.createElement('span');
            w.className = 'os-w';
            w.style.setProperty('--i', n++);
            var t = document.createElement('span');
            t.className = 'os-wt';
            t.textContent = p;
            w.appendChild(t);
            frag.appendChild(w);
          });
        });
        node.replaceChild(frag, k);
      });
    })(el);
    el.setAttribute('data-os-split', '1');
    return n;
  }

  /* Gradient text (background-clip:text) can't clip through the word
     boxes, so hand every word its own slice of the same gradient. */
  function sliceGradient(el) {
    /* span the heading box AND every word box — a word wider than a phone
       column overflows the heading and must still get painted */
    var words = el.querySelectorAll('.os-wt');
    var r = el.getBoundingClientRect();
    var L = r.left, T = r.top, R = r.right, B = r.bottom, rects = [];
    words.forEach(function (w) {
      var q = w.getBoundingClientRect();
      rects.push(q);
      L = Math.min(L, q.left); T = Math.min(T, q.top); R = Math.max(R, q.right); B = Math.max(B, q.bottom);
    });
    el.style.setProperty('--os-bw', (R - L) + 'px');
    el.style.setProperty('--os-bh', (B - T) + 'px');
    words.forEach(function (w, i) {
      w.style.setProperty('--os-bx', (L - rects[i].left) + 'px');
      w.style.setProperty('--os-by', (T - rects[i].top) + 'px');
    });
  }
  var gradEls = [];
  function arm(el) {
    if (reduce || el.getAttribute('data-os-split') || el.isContentEditable) return false;
    var cs = getComputedStyle(el);
    var clip = cs.webkitBackgroundClip || cs.backgroundClip;
    var img = cs.backgroundImage;
    if (split(el) === 0) return false;
    if (clip === 'text' && img && img !== 'none') {
      el.style.setProperty('--os-bgimg', img);
      el.classList.add('os-gradtext');
      sliceGradient(el);
      gradEls.push(el);
    }
    el.classList.add('os-reveal-pre');
    return true;
  }
  var rsT;
  window.addEventListener('resize', function () {
    clearTimeout(rsT);
    rsT = setTimeout(function () { gradEls.forEach(function (el) { if (el.isConnected) sliceGradient(el); }); }, 120);
  });
  function play(el, delay) {
    if (delay) el.style.setProperty('--d', delay + 'ms');
    /* two frames so the pre state is painted before the transition starts */
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      el.classList.add('os-reveal-go');
      el.classList.remove('os-reveal-pre');
    }); });
  }

  function heroReveal() {
    var h1 = document.querySelector('.landing .hero h1');
    var armed = h1 && arm(h1);
    function go() {
      if (armed) play(h1, 60);
      if (mosaic) setTimeout(function () { mosaic.classList.remove('os-pre'); }, 380);
    }
    var sp = document.getElementById('v-splash');
    if (sp && !sp.classList.contains('v-splash-off')) {
      /* The splash hands off to the hero — start the words when it lifts. */
      var mo = new MutationObserver(function () {
        if (sp.classList.contains('v-splash-off') || !sp.isConnected) { mo.disconnect(); go(); }
      });
      mo.observe(sp, { attributes: true, attributeFilter: ['class'] });
      mo.observe(document.body, { childList: true });
      setTimeout(function () { mo.disconnect(); go(); }, 4000);   /* never strand hidden text */
    } else {
      go();
    }
  }

  function scrollReveals() {
    if (reduce || !('IntersectionObserver' in window)) return;
    var sel = [
      '.landing section:not(.hero) h2',
      '.page-wrapper main h1', '.page-wrapper .hero h1', '.page-wrapper .hero h2',
      '.page-wrapper section > .container > h2'
    ].join(',');
    var els = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function (el) {
      return !el.closest('.os-mosaic') && !el.closest('.landing .hero');
    });
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        play(e.target, batch++ * 120);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    els.forEach(function (el) { if (arm(el)) io.observe(el); });
    /* never strand hidden text: anything on screen but still hidden after 4s is shown */
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains('os-reveal-pre')) return;
        var r = el.getBoundingClientRect();
        if (r.width && r.bottom > 0 && r.top < innerHeight) { io.unobserve(el); play(el); }
      });
    }, 4000);
  }

  /* ─── 5 · Semicircle sidebar ──────────────────────────────────────── */
  /* Desktops with a real pointer. The CSS owns the look — a small frosted
     half-disc peeking from the left edge at rest, a full semicircle that
     blooms out of a fog on hover. JS adds what CSS can't:
       · html.os-semi — the gate; if this script never runs, the old icon
         rail stays exactly as it was
       · a full-height hot edge, so the whole left edge opens it, not just
         the peek
       · the arc — every row bows out to follow the curve, re-bent as the
         list scrolls and as groups open and close */
  function mountSemicircle() {
    var sb = document.querySelector('.sidebar');
    if (!sb || !window.matchMedia || document.querySelector('.os-semi-edge')) return;
    var mq = matchMedia('(hover:hover) and (min-width:901px)');
    var root = document.documentElement;

    var edge = document.createElement('div');
    edge.className = 'os-semi-edge';
    edge.setAttribute('aria-hidden', 'true');
    document.body.appendChild(edge);

    var closeT = 0, raf = 0;
    function open() { clearTimeout(closeT); sb.classList.add('os-open'); bend(); setTimeout(bend, 380); }
    function close() {
      clearTimeout(closeT);
      closeT = setTimeout(function () {
        if (!sb.matches(':hover') && !sb.contains(document.activeElement) && !edge.matches(':hover')) {
          sb.classList.remove('os-open');
        }
      }, 240);
    }

    function bend() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        if (!root.classList.contains('os-semi')) return;
        var r = sb.getBoundingClientRect();
        var R = r.height / 2, cy = r.top + R;
        var band = R * 0.8, wMin = Math.sqrt(R * R - band * band);
        sb.querySelectorAll('.sidebar-logo, .part-toggle, .sidebar-link, .sidebar-label').forEach(function (row) {
          if (!row.offsetParent) return;
          var q = row.getBoundingClientRect();
          var ad = Math.min(Math.abs(q.top + q.height / 2 - cy), R * 0.999);
          var w = Math.sqrt(R * R - ad * ad);
          row.style.setProperty('--os-arc-x', (Math.max(0, w - wMin) * 0.42).toFixed(1) + 'px');
          row.style.setProperty('--os-arc-o', (ad > band ? Math.max(0, 1 - (ad - band) / (R - band)) : 1).toFixed(3));
        });
      });
    }

    function sync() {
      root.classList.toggle('os-semi', mq.matches);
      if (!mq.matches) sb.classList.remove('os-open');
    }
    sync();
    if (mq.addEventListener) mq.addEventListener('change', sync); else if (mq.addListener) mq.addListener(sync);

    edge.addEventListener('mouseenter', open);
    edge.addEventListener('mouseleave', close);
    sb.addEventListener('mouseenter', open);
    sb.addEventListener('mouseleave', close);
    sb.addEventListener('focusin', open);
    sb.addEventListener('focusout', close);
    sb.addEventListener('scroll', bend, { passive: true });
    sb.addEventListener('click', function () { setTimeout(bend, 30); setTimeout(bend, 300); });
    window.addEventListener('resize', bend);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sb.classList.contains('os-open')) {
        sb.classList.remove('os-open');
        if (sb.contains(document.activeElement)) document.activeElement.blur();
      }
    });
  }

  /* ─── Boot ────────────────────────────────────────────────────────── */

  function boot() {
    safe(mountDefs);
    /* the splash is dressed by soft-fx.js now (the poster build) */
    safe(mountMosaic);
    safe(mountCardArt);
    safe(heroReveal);
    safe(scrollReveals);
    safe(mountSemicircle);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

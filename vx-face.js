/* vx-face.js — Vitaxamine's face. A cyber-porcelain face in the spirit of a
   circuit-lined android portrait (blue light in the eyes, fine circuitry over a
   silver face plate, cables for hair, city bokeh behind). Drawn in SVG and
   animated from a handful of parameters that all move on critically damped
   springs, so every change of expression is smooth:
     eye open, blink, gaze x/y, brow raise / furrow / inner-lift (worry),
     smile, mouth open / wide / round, head turn / tilt / nod, glow.
   States:  idle (breathes, blinks, glances), listening (looks down at the text
   you're typing), thinking (eyes up and aside, brow knit, circuits race),
   speaking (lip-sync from the text as it is revealed), plus moods: happy,
   concerned, surprised. It follows the pointer when you move near it.
   API: VxFace.mount(el) → face; face.state(s), face.mood(m, ms), face.say(ch),
   face.nod(), face.look(x,y) */
(function () {
  'use strict';
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* seeded random, so the detail is the same on every visit */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  /* hair: fine cables fanning from the crown down past the shoulders */
  function hair() {
    var r = rng(7), h = '', cols = ['#141d2b', '#1b2638', '#243149', '#2e3d58', '#1a2233'];
    for (var i = 0; i < 52; i++) {
      var side = i % 2 ? 1 : -1, k = (i >> 1) / 26;
      var sx = 160 + side * (18 + k * 64), sy = 44 + k * 26 + r() * 8;
      var ex = 160 + side * (84 + k * 44 + r() * 30), ey = 250 + k * 120 + r() * 40;
      var c1x = sx + side * (40 + r() * 30), c1y = sy + 20, c2x = ex + side * (10 - r() * 30), c2y = ey - 90;
      var w = (1.2 + r() * 3.2).toFixed(1);
      h += '<path d="M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + '" stroke="' + cols[i % cols.length] + '" stroke-width="' + w + '"/>';
      if (i % 5 === 0) h += '<path class="vf-flow" d="M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + '" stroke="#5fd8ff" stroke-opacity=".55" stroke-width=".8" stroke-dasharray="3 ' + (14 + (i % 3) * 6) + '"/>';
      if (i % 7 === 3) h += '<circle cx="' + ((sx + ex) / 2 + side * 14).toFixed(1) + '" cy="' + ((sy + ey) / 2).toFixed(1) + '" r="1.6" fill="#8fe9ff" opacity=".8"/>';
    }
    return h;
  }
  /* circuitry: dense orthogonal traces over the left of the face, sparser right */
  function traces() {
    var r = rng(19), h = '', n = '';
    for (var i = 0; i < 34; i++) {
      var left = i < 26, x = left ? 96 + r() * 62 : 172 + r() * 50, y = 96 + r() * 200;
      var d = 'M' + x.toFixed(1) + ' ' + y.toFixed(1), cx = x, cy = y, segs = 2 + Math.floor(r() * 3);
      for (var j = 0; j < segs; j++) {
        if (j % 2 === 0) cx += (r() < 0.5 ? -1 : 1) * (6 + r() * 16); else cy += (r() < 0.5 ? -1 : 1) * (6 + r() * 14);
        d += ' L' + cx.toFixed(1) + ' ' + cy.toFixed(1);
      }
      h += '<path d="' + d + '" stroke-opacity="' + (left ? 0.75 : 0.45) + '"/>';
      n += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (1 + r() * 1.2).toFixed(1) + '"/>';
    }
    return { lines: h, nodes: n };
  }
  var TR = traces();
  function svg() {
    return '<svg class="vf-svg" viewBox="0 0 320 400" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="vfBg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#12264a"/><stop offset=".55" stop-color="#081326"/><stop offset="1" stop-color="#02060e"/></radialGradient>' +
        '<linearGradient id="vfSkin" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#eef3f8"/><stop offset=".45" stop-color="#c3ceda"/><stop offset="1" stop-color="#7d8ca0"/></linearGradient>' +
        '<radialGradient id="vfShade" cx="70%" cy="45%" r="70%"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0b1830" stop-opacity=".55"/></radialGradient>' +
        '<radialGradient id="vfIris" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#eaffff"/><stop offset=".28" stop-color="#7fe6ff"/><stop offset=".7" stop-color="#1792ff"/><stop offset="1" stop-color="#0a2f73"/></radialGradient>' +
        '<radialGradient id="vfCheek" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff9fb0" stop-opacity=".55"/><stop offset="1" stop-color="#ff9fb0" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="vfLip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98f9c"/><stop offset="1" stop-color="#8d6674"/></linearGradient>' +
        '<filter id="vfGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '<filter id="vfBokeh"><feGaussianBlur stdDeviation="7"/></filter>' +
        '<clipPath id="vfEyeL"><path class="vf-eyeclip-l"/></clipPath><clipPath id="vfEyeR"><path class="vf-eyeclip-r"/></clipPath>' +
        '<clipPath id="vfHeadClip"><path class="vf-headclip"/></clipPath>' +
      '</defs>' +
      '<rect width="320" height="400" fill="url(#vfBg)"/>' +
      '<g class="vf-bokeh" filter="url(#vfBokeh)">' +
        '<circle cx="40" cy="330" r="22" fill="#f2b35a" opacity=".35"/><circle cx="286" cy="300" r="16" fill="#ff5f7a" opacity=".3"/>' +
        '<circle cx="270" cy="70" r="20" fill="#5fd0ff" opacity=".3"/><circle cx="30" cy="90" r="14" fill="#f2b35a" opacity=".28"/>' +
        '<circle cx="300" cy="180" r="10" fill="#9fb8ff" opacity=".3"/><circle cx="18" cy="220" r="12" fill="#5fd0ff" opacity=".25"/>' +
      '</g>' +
      '<g class="vf-head">' +
        /* cables for hair, behind the face */
        '<g class="vf-hair" fill="none" stroke-linecap="round">' +
          '<path d="M86 150 C74 92 112 44 162 42 C220 40 254 88 244 150" stroke="#131b28" stroke-width="22"/>' + hair() +
        '</g>' +
        '<path d="M132 318 L128 372 L192 372 L188 318 Z" fill="#6f7d91"/><g stroke="#3d4a60" stroke-width="1.2" opacity=".8"><path d="M131 330 L189 330"/><path d="M130 342 L190 342"/><path d="M129 354 L191 354"/></g><path d="M146 320 L144 372" stroke="#dfe7ef" stroke-opacity=".35" stroke-width="2"/><path d="M96 372 C120 352 200 352 224 372 L240 400 L80 400 Z" fill="#1d2839"/>' +
        '<path class="vf-flow" d="M140 330 L140 372 M160 334 L160 372 M180 330 L180 372" stroke="#5fd8ff" stroke-width="1" stroke-dasharray="3 9" fill="none"/>' +
        /* the face plate */
        '<path class="vf-face" fill="url(#vfSkin)"/>' +
        '<path class="vf-face" fill="url(#vfShade)"/>' +
        '<g clip-path="url(#vfHeadClip)">' +
          '<g fill="none" stroke-linecap="round">' +
            '<path d="M96 138 C128 124 192 124 224 138" stroke="#1c2c46" stroke-opacity=".35" stroke-width=".9"/><path d="M96 139.5 C128 125.5 192 125.5 224 139.5" stroke="#fff" stroke-opacity=".3" stroke-width=".7"/>' +
            '<path d="M104 176 C112 214 128 236 146 246" stroke="#1c2c46" stroke-opacity=".32" stroke-width=".9"/><path d="M216 176 C208 214 192 236 174 246" stroke="#1c2c46" stroke-opacity=".32" stroke-width=".9"/>' +
            '<path d="M118 266 C134 296 186 296 202 266" stroke="#1c2c46" stroke-opacity=".3" stroke-width=".9"/>' +
            '<path d="M160 84 L160 122" stroke="#1c2c46" stroke-opacity=".25" stroke-width=".8"/>' +
            '<path d="M92 186 L102 196 L102 230" stroke="#1c2c46" stroke-opacity=".3" stroke-width=".8"/><path d="M228 186 L218 196 L218 230" stroke="#1c2c46" stroke-opacity=".3" stroke-width=".8"/>' +
          '</g>' +
          '<ellipse cx="146" cy="104" rx="30" ry="14" fill="#fff" opacity=".35" filter="url(#vfBokeh)"/>' +
          '<ellipse cx="160" cy="228" rx="2.4" ry="12" fill="#fff" opacity=".22" filter="url(#vfBokeh)"/>' +
          '<ellipse cx="116" cy="222" rx="16" ry="7" fill="#fff" opacity=".28" filter="url(#vfBokeh)"/><ellipse cx="204" cy="222" rx="14" ry="6" fill="#fff" opacity=".2" filter="url(#vfBokeh)"/>' +
          '<ellipse cx="160" cy="300" rx="12" ry="5" fill="#fff" opacity=".22" filter="url(#vfBokeh)"/>' +
          '<ellipse cx="236" cy="200" rx="18" ry="60" fill="#3fb6ff" opacity=".18" filter="url(#vfBokeh)"/>' +
          '<g class="vf-circuit" fill="none" stroke="#56d6ff" stroke-width="1.1" stroke-linecap="round" filter="url(#vfGlow)">' + TR.lines +
            '<path d="M104 120 L128 120 L136 112 L170 112 M170 112 L190 112 L198 104 L222 104"/>' +
            '<path d="M112 140 L140 140 L148 148 L176 148"/><path d="M196 140 L214 140 L222 132"/>' +
            '<path d="M96 206 L110 220 L110 252 L124 266"/><path d="M226 206 L212 220 L212 250 L200 262"/>' +
            '<path d="M234 170 L218 170 L210 178 L210 196"/><path d="M86 176 L102 176 L110 184"/>' +
            '<path d="M140 300 L150 310 L170 310 L180 300"/><path d="M226 232 L240 246"/>' +
            '<path class="vf-flow" d="M104 120 L128 120 L136 112 L222 104" stroke-dasharray="5 22"/>' +
            '<path class="vf-flow" d="M96 206 L110 220 L110 252 L124 266" stroke-dasharray="4 16"/>' +
            '<path class="vf-flow" d="M226 206 L212 220 L212 250 L200 262" stroke-dasharray="4 16"/>' +
          '</g>' +
          '<g class="vf-nodes" fill="#9ff0ff" filter="url(#vfGlow)">' + TR.nodes +
            '<circle cx="170" cy="112" r="2"/><circle cx="222" cy="104" r="2"/><circle cx="176" cy="148" r="1.8"/><circle cx="124" cy="266" r="2"/>' +
            '<circle cx="200" cy="262" r="2"/><circle cx="210" cy="196" r="1.8"/><circle cx="110" cy="184" r="1.6"/><circle cx="240" cy="246" r="1.6"/>' +
          '</g>' +
          '<path d="M100 160 C92 210 104 262 128 292" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>' +
        '</g>' +
        '<path class="vf-face vf-rim" fill="none" stroke="#6fdcff" stroke-opacity=".45" stroke-width="1.4" filter="url(#vfGlow)"/>' +
        '<ellipse class="vf-cheek" cx="118" cy="244" rx="20" ry="11" fill="url(#vfCheek)"/><ellipse class="vf-cheek" cx="204" cy="244" rx="20" ry="11" fill="url(#vfCheek)"/>' +
        /* eyes */
        '<g class="vf-eyes">' +
          '<path class="vf-socket-l" fill="#0b1830" opacity=".22"/><path class="vf-socket-r" fill="#0b1830" opacity=".22"/>' +
          '<path class="vf-eye-l" fill="#06101f"/><path class="vf-eye-r" fill="#06101f"/>' +
          '<g clip-path="url(#vfEyeL)"><g class="vf-iris-l"><circle r="10.5" fill="url(#vfIris)" filter="url(#vfGlow)"/>' + '<g stroke="#bff6ff" stroke-width=".45" opacity=".55">' + (function(){var h='';for(var a=0;a<16;a++){var t=a*Math.PI/8;h+='<path d="M'+(Math.cos(t)*4.6).toFixed(2)+' '+(Math.sin(t)*4.6).toFixed(2)+' L'+(Math.cos(t)*9.6).toFixed(2)+' '+(Math.sin(t)*9.6).toFixed(2)+'"/>';}return h;})() + '</g>' + '<circle class="vf-pupil" r="4" fill="#031022"/><circle cx="-3.5" cy="-3.5" r="2.2" fill="#fff" opacity=".9"/><circle cx="3" cy="3" r="1" fill="#fff" opacity=".6"/>' +
            '<circle r="7" fill="none" stroke="#bff6ff" stroke-width=".5" stroke-dasharray="1.5 2.5" opacity=".7"/></g></g>' +
          '<g clip-path="url(#vfEyeR)"><g class="vf-iris-r"><circle r="10.5" fill="url(#vfIris)" filter="url(#vfGlow)"/>' + '<g stroke="#bff6ff" stroke-width=".45" opacity=".55">' + (function(){var h='';for(var a=0;a<16;a++){var t=a*Math.PI/8;h+='<path d="M'+(Math.cos(t)*4.6).toFixed(2)+' '+(Math.sin(t)*4.6).toFixed(2)+' L'+(Math.cos(t)*9.6).toFixed(2)+' '+(Math.sin(t)*9.6).toFixed(2)+'"/>';}return h;})() + '</g>' + '<circle class="vf-pupil" r="4" fill="#031022"/><circle cx="-3.5" cy="-3.5" r="2.2" fill="#fff" opacity=".9"/><circle cx="3" cy="3" r="1" fill="#fff" opacity=".6"/>' +
            '<circle r="7" fill="none" stroke="#bff6ff" stroke-width=".5" stroke-dasharray="1.5 2.5" opacity=".7"/></g></g>' +
          '<path class="vf-lid-l" fill="none" stroke="#2a3548" stroke-width="2.2" stroke-linecap="round"/><path class="vf-lid-r" fill="none" stroke="#2a3548" stroke-width="2.2" stroke-linecap="round"/>' +
          '<path class="vf-lash-l" fill="none" stroke="#5fd8ff" stroke-opacity=".5" stroke-width="1"/><path class="vf-lash-r" fill="none" stroke="#5fd8ff" stroke-opacity=".5" stroke-width="1"/>' +
          '<path class="vf-crease-l" fill="none" stroke="#6b7a90" stroke-opacity=".55" stroke-width="1"/><path class="vf-crease-r" fill="none" stroke="#6b7a90" stroke-opacity=".55" stroke-width="1"/>' +
          '<path class="vf-low-l" fill="none" stroke="#3a475c" stroke-opacity=".45" stroke-width=".9"/><path class="vf-low-r" fill="none" stroke="#3a475c" stroke-opacity=".45" stroke-width=".9"/>' +
        '</g>' +
        '<path class="vf-brow-l" fill="none" stroke="#3d4a60" stroke-width="3.2" stroke-linecap="round"/><path class="vf-brow-r" fill="none" stroke="#3d4a60" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M160 196 C158 222 152 238 148 246" fill="none" stroke="#8e9bad" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>' +
        '<path d="M146 250 C152 256 168 256 174 250" fill="none" stroke="#7b889b" stroke-width="1.6" stroke-linecap="round"/>' +
        /* mouth */
        '<path class="vf-mouth-in" fill="#1a0e16"/><path class="vf-teeth" fill="#f1f4f8" opacity=".9"/>' +
        '<path class="vf-lip-u" fill="url(#vfLip)"/><path class="vf-lip-l" fill="url(#vfLip)"/>' +
        '<path class="vf-lip-hl" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" stroke-linecap="round"/>' +
      '</g>' +
    '</svg>';
  }

  function face(host) {
    host.innerHTML = svg();
    var root = host.querySelector('svg'), q = function (s) { return root.querySelector(s); };
    var E = {
      head: q('.vf-head'), faces: root.querySelectorAll('.vf-face'), headclip: q('.vf-headclip'),
      eyeL: q('.vf-eye-l'), eyeR: q('.vf-eye-r'), clipL: q('.vf-eyeclip-l'), clipR: q('.vf-eyeclip-r'),
      sockL: q('.vf-socket-l'), sockR: q('.vf-socket-r'), irisL: q('.vf-iris-l'), irisR: q('.vf-iris-r'),
      lidL: q('.vf-lid-l'), lidR: q('.vf-lid-r'), lashL: q('.vf-lash-l'), lashR: q('.vf-lash-r'), crL: q('.vf-crease-l'), crR: q('.vf-crease-r'), loL: q('.vf-low-l'), loR: q('.vf-low-r'),
      browL: q('.vf-brow-l'), browR: q('.vf-brow-r'), pupils: root.querySelectorAll('.vf-pupil'),
      lipU: q('.vf-lip-u'), lipL: q('.vf-lip-l'), inner: q('.vf-mouth-in'), teeth: q('.vf-teeth'), hl: q('.vf-lip-hl'),
      cheeks: root.querySelectorAll('.vf-cheek'), circuit: q('.vf-circuit'), nodes: q('.vf-nodes'), bokeh: q('.vf-bokeh')
    };
    var FACE = 'M160 70 C104 70 88 122 90 176 C92 232 110 276 138 302 C148 311 154 314 160 314 C166 314 172 311 182 302 C210 276 228 232 230 176 C232 122 216 70 160 70 Z';
    for (var i = 0; i < E.faces.length; i++) E.faces[i].setAttribute('d', FACE);
    E.headclip.setAttribute('d', FACE);

    /* parameters: value, target, velocity */
    var K = ['open', 'blink', 'lx', 'ly', 'raise', 'furrow', 'worry', 'smile', 'mo', 'wide', 'round', 'turn', 'tilt', 'nod', 'glow', 'pupil'];
    var P = {}; K.forEach(function (k) { P[k] = { v: 0, t: 0, s: 0 }; });
    P.open.v = P.open.t = 1; P.glow.v = P.glow.t = 0.4; P.pupil.v = P.pupil.t = 1; P.smile.v = P.smile.t = 0.12;
    var stateName = 'idle', moodName = 'neutral', moodUntil = 0, mouthTarget = 0, speakEnergy = 0;
    var pointer = null, lastSaccade = 0, nextBlink = 1200, blinkT = -1, t0 = performance.now(), last = t0, raf = 0;
    var MOODS = {
      neutral: { smile: 0.12, raise: 0, furrow: 0, worry: 0, open: 1 },
      happy: { smile: 0.75, raise: 0.25, furrow: 0, worry: 0, open: 0.92 },
      concerned: { smile: -0.25, raise: 0.1, furrow: 0.2, worry: 0.85, open: 1.02 },
      surprised: { smile: 0.05, raise: 0.9, furrow: 0, worry: 0, open: 1.2 },
      thinking: { smile: 0, raise: 0.15, furrow: 0.55, worry: 0, open: 0.9 },
      listening: { smile: 0.2, raise: 0.12, furrow: 0, worry: 0, open: 1 }
    };
    function spring(p, dt, k) {        /* critically damped towards target */
      var w = k || 14, x = p.v - p.t;
      var a = -w * w * x - 2 * w * p.s;
      p.s += a * dt; p.v += p.s * dt;
    }
    function set(k, v) { P[k].t = v; }
    function applyMood() {
      var m = MOODS[moodName] || MOODS.neutral;
      set('smile', m.smile); set('raise', m.raise); set('furrow', m.furrow); set('worry', m.worry); set('open', m.open);
    }
    function eyePath(cx, cy, o, lowUp, side) {
      var u = 15 * o, l = 9 * o - lowUp;
      var outer = side * 23, inner = -side * 21;
      return 'M' + (cx + inner) + ' ' + (cy + 1) + ' C' + (cx + inner * 0.5) + ' ' + (cy - u) + ' ' + (cx + outer * 0.55) + ' ' + (cy - u - 1) + ' ' + (cx + outer) + ' ' + (cy - 2) +
        ' C' + (cx + outer * 0.6) + ' ' + (cy + l) + ' ' + (cx + inner * 0.55) + ' ' + (cy + l + 1) + ' ' + (cx + inner) + ' ' + (cy + 1) + ' Z';
    }
    function lidPath(cx, cy, o, side) {
      var u = 15 * o, outer = side * 23, inner = -side * 21;
      return 'M' + (cx + inner) + ' ' + (cy + 1) + ' C' + (cx + inner * 0.5) + ' ' + (cy - u) + ' ' + (cx + outer * 0.55) + ' ' + (cy - u - 1) + ' ' + (cx + outer) + ' ' + (cy - 2);
    }
    function render(t) {
      var g = function (k) { return P[k].v; };
      var o = Math.max(0.02, g('open') * (1 - g('blink')));
      var turn = g('turn'), tilt = g('tilt') + Math.sin(t * 0.6) * 0.6, nod = g('nod');
      var breathe = Math.sin(t * 1.5) * 1.2;
      E.head.setAttribute('transform', 'translate(' + (turn * 6).toFixed(2) + ' ' + (breathe + nod * 6).toFixed(2) + ') rotate(' + tilt.toFixed(2) + ' 160 320)');
      var lx = g('lx'), ly = g('ly'), smile = g('smile');
      var squint = Math.max(0, smile) * 3.2;
      [[122, 190, 1, E.eyeL, E.clipL, E.sockL, E.irisL, E.lidL, E.lashL, E.crL, E.loL], [198, 190, -1, E.eyeR, E.clipR, E.sockR, E.irisR, E.lidR, E.lashR, E.crR, E.loR]].forEach(function (e) {
        var cx = e[0] + turn * 3, cy = e[1], side = e[2] === 1 ? -1 : 1;
        var d = eyePath(cx, cy, o, squint, side);
        e[3].setAttribute('d', d); e[4].setAttribute('d', d);
        e[5].setAttribute('d', eyePath(cx, cy + 1, 1.25, 0, side));
        e[6].setAttribute('transform', 'translate(' + (cx + lx * 7.5).toFixed(2) + ' ' + (cy + ly * 4.2 - (1 - o) * 3).toFixed(2) + ')');
        var lid = lidPath(cx, cy, o, side);
        e[7].setAttribute('d', lid); e[8].setAttribute('d', lidPath(cx, cy - 2.5, o * 1.05, side));
        e[9].setAttribute('d', lidPath(cx, cy - 6 - o * 2, 0.9 + o * 0.2, side));
        var lw = 9 * o - squint;
        e[10].setAttribute('d', 'M' + (cx - side * 18) + ' ' + (cy + lw * 0.75 + 2).toFixed(2) + ' Q' + cx + ' ' + (cy + lw + 3).toFixed(2) + ' ' + (cx + side * 20) + ' ' + (cy + 1).toFixed(2));
      });
      for (var i = 0; i < E.pupils.length; i++) E.pupils[i].setAttribute('r', (3.4 + g('pupil') * 1.2).toFixed(2));
      /* brows: raise lifts, furrow pulls the inner ends down, worry lifts them */
      var raise = g('raise'), fur = g('furrow'), wor = g('worry');
      [[122, E.browL, 1], [198, E.browR, -1]].forEach(function (b) {
        var cx = b[0] + turn * 3, inner = cx + b[2] * 24, outer = cx - b[2] * 26;
        var yb = 160 - raise * 7 + (1 - o) * 1.5;
        var yi = yb + fur * 6 - wor * 8, yo = yb + wor * 3 - raise * 2;
        b[1].setAttribute('d', 'M' + outer + ' ' + yo.toFixed(2) + ' Q' + cx + ' ' + (yb - 8 - raise * 2 + fur * 2).toFixed(2) + ' ' + inner + ' ' + yi.toFixed(2));
      });
      /* mouth */
      var mo = Math.max(0, g('mo')), wide = g('wide'), rnd = Math.max(0, g('round'));
      var mx = 160 + turn * 2, my = 280;
      var hw = 25 * (1 + wide * 0.22 - rnd * 0.35 + Math.max(0, smile) * 0.14);
      var cyc = my - smile * 7, gap = mo * 17;
      var top = my - 2 - rnd * 1.5, bot = my + 2 + gap;
      var up = 'M' + (mx - hw) + ' ' + cyc + ' C' + (mx - hw * 0.55) + ' ' + (top - 5) + ' ' + (mx - 5) + ' ' + (top - 3) + ' ' + mx + ' ' + (top - 1) +
        ' C' + (mx + 5) + ' ' + (top - 3) + ' ' + (mx + hw * 0.55) + ' ' + (top - 5) + ' ' + (mx + hw) + ' ' + cyc +
        ' C' + (mx + hw * 0.6) + ' ' + (my + 1 - smile * 2) + ' ' + (mx - hw * 0.6) + ' ' + (my + 1 - smile * 2) + ' ' + (mx - hw) + ' ' + cyc + ' Z';
      var lo = 'M' + (mx - hw) + ' ' + cyc + ' C' + (mx - hw * 0.6) + ' ' + (bot - 1 - smile * 2) + ' ' + (mx + hw * 0.6) + ' ' + (bot - 1 - smile * 2) + ' ' + (mx + hw) + ' ' + cyc +
        ' C' + (mx + hw * 0.7) + ' ' + (bot + 8 - smile * 2) + ' ' + (mx - hw * 0.7) + ' ' + (bot + 8 - smile * 2) + ' ' + (mx - hw) + ' ' + cyc + ' Z';
      E.lipU.setAttribute('d', up); E.lipL.setAttribute('d', lo);
      E.inner.setAttribute('d', 'M' + (mx - hw * 0.92) + ' ' + cyc + ' C' + (mx - hw * 0.5) + ' ' + (my + 1) + ' ' + (mx + hw * 0.5) + ' ' + (my + 1) + ' ' + (mx + hw * 0.92) + ' ' + cyc +
        ' C' + (mx + hw * 0.6) + ' ' + (bot + 2) + ' ' + (mx - hw * 0.6) + ' ' + (bot + 2) + ' ' + (mx - hw * 0.92) + ' ' + cyc + ' Z');
      E.inner.setAttribute('opacity', Math.min(1, mo * 3).toFixed(2));
      E.teeth.setAttribute('d', 'M' + (mx - hw * 0.55) + ' ' + (my + 1.5) + ' Q' + mx + ' ' + (my + 4 + gap * 0.18) + ' ' + (mx + hw * 0.55) + ' ' + (my + 1.5) + ' L' + (mx + hw * 0.5) + ' ' + (my + 1) + ' Q' + mx + ' ' + (my + 2) + ' ' + (mx - hw * 0.5) + ' ' + (my + 1) + ' Z');
      E.teeth.setAttribute('opacity', Math.min(0.9, Math.max(0, mo - 0.15) * 2.5).toFixed(2));
      E.hl.setAttribute('d', 'M' + (mx - hw * 0.4) + ' ' + (bot + 4 - smile * 2) + ' Q' + mx + ' ' + (bot + 6 - smile * 2) + ' ' + (mx + hw * 0.4) + ' ' + (bot + 4 - smile * 2));
      for (i = 0; i < E.cheeks.length; i++) E.cheeks[i].setAttribute('opacity', Math.max(0, smile * 0.9 + g('glow') * 0.15).toFixed(2));
      var glow = g('glow');
      E.circuit.setAttribute('stroke-opacity', (0.35 + glow * 0.6).toFixed(2));
      E.nodes.setAttribute('opacity', (0.45 + glow * 0.55 + Math.sin(t * 5) * 0.08 * glow).toFixed(2));
      E.bokeh.setAttribute('transform', 'translate(' + (Math.sin(t * 0.13) * 8).toFixed(1) + ' ' + (Math.cos(t * 0.11) * 6).toFixed(1) + ')');
      root.style.setProperty('--vf-flow', (stateName === 'thinking' ? 0.9 : stateName === 'speaking' ? 1.6 : 4) + 's');
    }
    function tick(now) {
      raf = requestAnimationFrame(tick);
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var t = (now - t0) / 1000;
      if (moodUntil && now > moodUntil) { moodUntil = 0; moodName = stateName === 'thinking' ? 'thinking' : stateName === 'listening' ? 'listening' : 'neutral'; applyMood(); }
      /* blinking: every 2–6 s, sometimes a double blink */
      if (blinkT < 0 && now - t0 > nextBlink) { blinkT = now; }
      if (blinkT >= 0) {
        var bt = (now - blinkT) / 130;
        P.blink.t = bt < 1 ? 1 : 0;
        if (bt > 2) { blinkT = -1; nextBlink = now - t0 + (Math.random() < 0.15 ? 180 : 2000 + Math.random() * 4000); }
      }
      /* gaze */
      if (pointer && now - pointer.at < 1800) { set('lx', pointer.x); set('ly', pointer.y); set('turn', pointer.x * 0.6); }
      else if (stateName === 'thinking') { if (now - lastSaccade > 900) { lastSaccade = now; set('lx', 0.55 + Math.random() * 0.3); set('ly', -0.7 - Math.random() * 0.2); set('turn', 0.4); set('tilt', -3); } }
      else if (stateName === 'listening') { if (now - lastSaccade > 700) { lastSaccade = now; set('lx', -0.2 + Math.random() * 0.4); set('ly', 0.55); set('turn', 0); set('tilt', 2); } }
      else if (now - lastSaccade > 900 + Math.random() * 2200) {
        lastSaccade = now;
        var r = Math.random();
        set('lx', r < 0.5 ? (Math.random() - 0.5) * 0.35 : (Math.random() - 0.5) * 1.1);
        set('ly', (Math.random() - 0.5) * (stateName === 'speaking' ? 0.3 : 0.6));
        set('turn', (Math.random() - 0.5) * 0.4); set('tilt', (Math.random() - 0.5) * 3);
      }
      /* speaking: the mouth chases the current sound and falls back between */
      if (stateName === 'speaking') { speakEnergy += (1 - speakEnergy) * 0.1; }
      else speakEnergy *= 0.9;
      mouthTarget *= Math.pow(0.02, dt);                 /* decays in ~0.25 s */
      set('mo', Math.min(1, mouthTarget));
      set('glow', stateName === 'thinking' ? 1 : stateName === 'speaking' ? 0.8 : stateName === 'listening' ? 0.55 : 0.35);
      set('pupil', stateName === 'thinking' ? 0.6 : moodName === 'happy' ? 1.2 : 1);
      P.nod.t *= Math.pow(0.001, dt);
      K.forEach(function (k) { spring(P[k], dt, k === 'blink' ? 40 : k === 'mo' || k === 'wide' || k === 'round' ? 26 : k === 'lx' || k === 'ly' ? 22 : 10); });
      render(t);
    }
    /* a sound → a mouth shape */
    function say(ch) {
      if (!ch) return;
      var c = ch.toLowerCase();
      if (/[㐀-鿿]/.test(ch)) { mouthTarget = 0.45 + Math.random() * 0.35; set('wide', Math.random() * 0.6); set('round', Math.random() < 0.3 ? 0.6 : 0); return; }
      if ('aáà'.indexOf(c) >= 0) { mouthTarget = 0.85; set('wide', 0.3); set('round', 0); }
      else if ('eéè'.indexOf(c) >= 0) { mouthTarget = 0.5; set('wide', 0.8); set('round', 0); }
      else if ('iy'.indexOf(c) >= 0) { mouthTarget = 0.32; set('wide', 1); set('round', 0); }
      else if ('o'.indexOf(c) >= 0) { mouthTarget = 0.7; set('wide', -0.2); set('round', 0.9); }
      else if ('uw'.indexOf(c) >= 0) { mouthTarget = 0.35; set('wide', -0.3); set('round', 1); }
      else if ('mbp'.indexOf(c) >= 0) { mouthTarget = 0; set('round', 0); }
      else if ('fv'.indexOf(c) >= 0) { mouthTarget = 0.15; set('wide', 0.3); }
      else if (/[.!?。！？]/.test(ch)) { mouthTarget = 0; P.nod.t = 0.6; }
      else if (/[,;:，；：\s]/.test(ch)) { mouthTarget *= 0.4; }
      else mouthTarget = Math.max(mouthTarget, 0.25 + Math.random() * 0.15);
    }
    function state(s) {
      stateName = s;
      if (!moodUntil) { moodName = s === 'thinking' ? 'thinking' : s === 'listening' ? 'listening' : 'neutral'; applyMood(); }
      if (s !== 'speaking') { set('wide', 0); set('round', 0); }
      host.setAttribute('data-state', s);
    }
    function mood(m, ms) { moodName = m; moodUntil = ms ? performance.now() + ms : 0; applyMood(); host.setAttribute('data-mood', m); }
    host.addEventListener('pointermove', function (e) {
      var r = host.getBoundingClientRect();
      pointer = { x: Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)), y: Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1.1)), at: performance.now() };
    });
    document.addEventListener('pointermove', function (e) {       /* glances toward the pointer anywhere nearby */
      if (pointer && performance.now() - pointer.at < 300) return;
      var r = host.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
      var dx = (e.clientX - cx) / (window.innerWidth * 0.6), dy = (e.clientY - cy) / (window.innerHeight * 0.8);
      if (Math.abs(dx) < 1.2 && Math.abs(dy) < 1.2 && Math.random() < 0.05) pointer = { x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, dy)), at: performance.now() - 900 };
    }, { passive: true });
    host.addEventListener('click', function () { mood('happy', 1400); P.nod.t = 0.8; blinkT = performance.now(); });
    state('idle'); applyMood();
    if (REDUCE) { render(0); } else raf = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!REDUCE && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    });
    return { state: state, mood: mood, say: say, nod: function () { P.nod.t = 0.8; }, look: function (x, y) { set('lx', x); set('ly', y); } };
  }
  window.VxFace = { mount: face };
})();

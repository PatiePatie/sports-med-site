/* ══════════════════════════════════════════════════════════════════════════════
   soft-fx.js — motion + texture for the "Soft Glass" layer (soft-glass.css)
   ------------------------------------------------------------------------------
     1 · grain      one fixed riso sheet (dark + light specks) over the page
     2 · theme sync html.os-dk follows body.dark so the root never flashes
     3 · sheen      a glassy highlight on cards that follows the pointer
     4 · fog        cards and sections come in out of a blur as they scroll in
     5 · splash     the loading screens keep the hospital and get the
                    airbrushed Vitalité icons floating around the mark
     8 · arrival    the whole page comes up out of a fog
     9 · swaps      dark/light spreads from the toggle; 中/EN fogs through
    10 · categories switching category washes through its colour + emblem

   Fails soft everywhere; nothing here owns content.
   Remove with: python3 tools/shapes_switch.py off
   ══════════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  var root = document.documentElement;
  if (root.classList.contains('sg-js')) return;
  var body = document.body;
  if (!body) return;

  /* read before anything clears them: is the whole page arriving through a fog? */
  var ARRIVE = root.classList.contains('sg-lf') || root.classList.contains('sg-catgo');
  var REDUCE = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var FINE = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn('[soft-fx]', e); } }
  function $$(sel, ctx) { try { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); } catch (e) { return []; } }

  /* ─── 1 · Grain ──────────────────────────────────────────────────────── */
  function mountGrain() {
    if (document.querySelector('.sg-grain')) return;
    var g = document.createElement('div');
    g.className = 'sg-grain';
    g.setAttribute('aria-hidden', 'true');
    body.appendChild(g);
    root.classList.add('sg-js');
  }

  /* ─── 2 · Theme sync ─────────────────────────────────────────────────── */
  function themeSync() {
    /* the head-first script painted the root inline; hand it to the stylesheet */
    root.style.removeProperty('background-color');
    root.style.removeProperty('color-scheme');
    function sync() {
      var dk = body.classList.contains('dark');
      root.classList.toggle('os-dk', dk);
      var m = document.querySelector('meta[name="color-scheme"]');
      if (m) m.setAttribute('content', dk ? 'dark' : 'light');
    }
    sync();
    new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ─── 3 · Sheen ──────────────────────────────────────────────────────── */
  var SHEEN = '.feature-card,.fork-card,.ch-card,.stat-card,.qo-card,.res-card,.dash-card,.for-topic,' +
              '.checkup-panel,.chat-window,.plan-card,.quiz-card,.acc-item';
  function sheen() {
    if (!FINE || FAB) return;
    var raf = 0, last = null, lx = 0, ly = 0;
    document.addEventListener('pointermove', function (e) {
      var t = e.target && e.target.closest ? e.target.closest(SHEEN) : null;
      if (!t) return;
      if (!t.classList.contains('sg-sheen')) t.classList.add('sg-sheen');
      last = t; lx = e.clientX; ly = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        if (!last) return;
        var r = last.getBoundingClientRect();
        last.style.setProperty('--sg-mx', (lx - r.left) + 'px');
        last.style.setProperty('--sg-my', (ly - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ─── 3b · Fabric: the page is cloth, the pointer presses into it ───── */
  /* Fallback without WebGL2 (or with FOLLOWS off): one dimple, built from still layers (a shaded bowl, a shadowed wall
     toward the light, a lit wall away from it, and folds). Per frame nothing
     moves: the whole thing is placed once, a third of the way down the
     viewport, and left there — so the skin keeps its paper grain and the
     page never wriggles.

     FOLLOWS switches between the two. It is on: the pointer presses the WebGL
     cloth (3c), which now tracks the arrow tightly (a 14 ms ease, no trailing)
     so it reads as a surface under the cursor, not a lagging cursor; only a
     pressed finger drags the cloth behind it. With it off, the dimple parks. */
  var FOLLOWS = true;
  var FAB = false;

  /* ─── 3c · Cloth: the same idea, simulated and lit ──────────────────── */
  /* A height field (one cell per 6 css px) is a damped membrane under
     tension. The pointer is a soft finger resting on it: the cloth sinks
     into a funnel, the surrounding fabric lifts into a low rim, and it never
     sits still (it breathes, and radial folds drift round the dimple).
     Pressing pushes the finger in deeper and wider, and holding keeps
     sinking. Dragging while pressed ploughs the cloth: a ridge piles up
     ahead, taut creases pull out behind, and the membrane leaves a wake.
     Letting go springs the cloth back up with a small wobble.
     Only the area around the finger is simulated and drawn (scissored), the
     loop stops once the cloth is flat, and it lights like the rest of the
     skin: shade on the walls facing away from the top-left light, a satin
     highlight on the walls facing it. No gradients pretending to be a hole.
     Returns false when WebGL2 isn't there, so the CSS dimple takes over.
     The dent is a funnel (height falls off with log r from a rounded tip, the
     way a taut sheet takes a point load) drawn exactly in the shader, with a
     soft cast shadow; the membrane only carries a shallow share of it for
     the wake and the wobble. Not used when FOLLOWS is off. */
  function cloth() {
    var cv = document.createElement('canvas');
    var gl = null;
    try { gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch (e) {}
    if (!gl) return false;
    var VS = '#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    var FS = [
      '#version 300 es',
      'precision highp float;',
      'uniform sampler2D uH;uniform vec2 uGrid;uniform float uCell;uniform vec2 uView;uniform float uRes;',
      'uniform vec2 uP;uniform float uDepth;uniform float uSig;uniform vec2 uDir;uniform float uDrag;uniform float uT;uniform float uOn;uniform float uDark;uniform vec3 uLp;',
      'out vec4 o;',
      'float sim(vec2 p){return texture(uH,(p/uCell+.5)/uGrid).r;}',
      /* a point pressed into a taut sheet makes a funnel, not a bowl: height falls
         off with log(r) from a rounded fingertip out to where the cloth is held.
         Drawn exactly here so the tip stays sharp; the sim adds wake and wobble */
      'float fun(vec2 p){float r=length(p-uP);float rc=uSig*.5,ro=uSig*3.6;',
      '  float q=sqrt(r*r+rc*rc);float f=max(log(ro/q),0.),m=log(ro/rc);',
      '  return -uDepth*(f*f/(f+.6))/(m*m/(m+.6));}',   /* eases out flat where the cloth is held */
      /* a few faint tension wrinkles run out of the tip; a drag swings them round behind */
      'float wrin(vec2 p){',
      '  vec2 d=p-uP;float r=length(d);float s=uSig;float a=atan(d.y,d.x);',
      '  float ba=atan(-uDir.y,-uDir.x);float h=0.;',
      '  float along0=smoothstep(.6*s,1.3*s,r);if(along0<=0.)return 0.;',
      '  for(int i=0;i<5;i++){float f=float(i);',
      '    float amp=.4+.6*(.5+.5*sin(f*4.3+.7));',
      '    float ang=f*1.2566+.4*sin(f*2.3+1.1)+.06*sin(uT*.23+f*1.9)+.18*sin(f*3.7)*tanh(r/s-1.);',
      '    float bk=ba+(fract(f*.618)-.5)*1.2;',
      '    ang+=atan(sin(bk-ang),cos(bk-ang))*uDrag*.7;float da=atan(sin(a-ang),cos(a-ang));',
      '    float w=s*(.16+.05*r/s);float cr=r*da;',
      '    float L=s*(1.3+1.6*(.5+.5*sin(f*5.1+2.))+uDrag*1.5);',
      '    h+=amp*exp(-cr*cr/(2.*w*w))*exp(-max(r-1.3*s,0.)/L);}',
      '  return h*along0*uDepth*.07*(1.+uDrag);}',
      'float br(vec2 p){float r=length(p-uP);',
      '  float b=sin(p.x*.019+uT*.8+1.7*sin(p.y*.012-uT*.45))*sin(p.y*.016-uT*.62+sin(p.x*.01+uT*.3));',
      '  return b*.9*exp(-r*r/(2.*5.*uSig*5.*uSig))*min(uDepth*.08,1.);}',
      'float HS(vec2 p){return sim(p)+fun(p);}',
      'float H(vec2 p){return HS(p)+wrin(p)+br(p);}',
      'void main(){',
      '  vec2 p=vec2(gl_FragCoord.x,uView.y*uRes-gl_FragCoord.y)/uRes;',
      '  float e=1.;float h0=H(p);',
      '  float dx=(H(p+vec2(e,0.))-H(p-vec2(e,0.)))/(2.*e);',
      '  float dy=(H(p+vec2(0.,e))-H(p-vec2(0.,e)))/(2.*e);',
      '  vec3 n=normalize(vec3(-dx,-dy,1.));',
      /* a lamp that drifts over the page: the light comes from where it is,
         so the dent's lit and shaded walls swing round as the pointer passes
         it (mixed with a little of the skin's fixed top-left light) */
      '  vec3 L=normalize(mix(normalize(vec3(-.5,-.62,.6)),normalize(vec3(uLp.xy-p,uLp.z)),.93));',
      '  float diff=dot(n,L)-L.z;',
      '  vec3 hv=normalize(L+vec3(0.,0.,1.));',
      '  float sp=pow(max(dot(n,hv),0.),48.)-pow(hv.z,48.);',
      /* soft cast shadow: walk toward the light, see whether the rim rises above the ray */
      '  vec2 ld=normalize(L.xy+vec2(1e-4));float tn=L.z/max(length(L.xy),.05),occ=0.,hs0=HS(p);',
      '  for(int k=1;k<11;k++){float t=float(k)*3.5;occ=max(occ,(HS(p+ld*t)-hs0)/t-tn);}',
      '  float csh=1.-exp(-occ*4.);',
      '  float dn=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)*.012;',
      '  vec3 sc=mix(vec3(.078,.157,.282),vec3(0.),uDark);',
      '  vec3 hc=mix(vec3(1.),vec3(.62,.76,.96),uDark);',
      /* shade and light roll off softly instead of clipping, so a deep press keeps its gradient */
      '  float mS=mix(.42,.62,uDark),mH=.5;',
      '  float ash=mS*(1.-exp(-max(-diff*mix(1.5,2.2,uDark)+csh*mix(.2,.3,uDark)+dn,0.)/mS));',
      '  float ahi=mH*(1.-exp(-max((diff*2.+max(sp,0.)*.6)*mix(1.,.5,uDark)+dn,0.)/mH));',
      '  o=vec4(hc*ahi+sc*ash,ahi+ash)*uOn;',
      '}'].join('\n');
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.bindAttribLocation(prog, 0, 'a'); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) { if (window.console) console.warn('[soft-fx] cloth', e); return false; }
    gl.useProgram(prog);
    var U = {};
    ['uH', 'uGrid', 'uCell', 'uView', 'uRes', 'uP', 'uDepth', 'uSig', 'uDir', 'uDrag', 'uT', 'uOn', 'uDark', 'uLp'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.uniform1i(U.uH, 0);
    gl.disable(gl.BLEND);

    cv.className = 'sg-cloth';
    cv.setAttribute('aria-hidden', 'true');
    body.appendChild(cv);
    root.classList.add('sg-fab', 'sg-clothed');
    FAB = true;

    var CELL = 6, RES = 1, VW = 0, VH = 0, GW = 0, GH = 0, hgt, vel;
    function size() {
      VW = window.innerWidth; VH = window.innerHeight;
      RES = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(VW * RES); cv.height = Math.round(VH * RES);
      cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
      GW = Math.ceil(VW / CELL) + 3; GH = Math.ceil(VH / CELL) + 3;
      hgt = new Float32Array(GW * GH); vel = new Float32Array(GW * GH);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, GW, GH, 0, gl.RED, gl.FLOAT, hgt);
      gl.viewport(0, 0, cv.width, cv.height);
      bx0 = GW; by0 = GH; bx1 = -1; by1 = -1;
    }
    var bx0 = 0, by0 = 0, bx1 = -1, by1 = -1;          /* cells that are still moving */
    size();

    var tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, dent = 0, want = 0;
    var down = false, downAt = 0, press = 0, drag = 0, ax = 1, ay = 0, hot = false;
    var raf = 0, last = 0, seen = false, bounce = 0, movedAt = 0, on = 0, present = false, t0 = performance.now();
    var HOT = 'a,button,[role=button],input,textarea,select,label,summary,.sidebar-link,.for-topic,.ch-card,.fork-card,.feature-card,.kv-site,.kv-el,.kn-card';
    var C2 = 0.2, KC = 0.34, KR = 0.0045, DAMP = 0.075;
    function ease(dt, tau) { return 1 - Math.exp(-dt / tau); }
    function rest() { return hot ? 0.74 : 0.5; }
    var dark = body.classList.contains('dark');
    new MutationObserver(function () { dark = body.classList.contains('dark'); kick(); }).observe(body, { attributes: true, attributeFilter: ['class'] });

    function step(px, py, depth, sig, ux, uy) {
      /* one membrane step over the finger's neighbourhood and whatever is still moving */
      var r = Math.ceil(sig * 3.4 / CELL) + 2;
      var cx = px / CELL, cy = py / CELL;
      var x0 = Math.max(1, Math.min(bx0, Math.floor(cx - r))), x1 = Math.min(GW - 2, Math.max(bx1, Math.ceil(cx + r)));
      var y0 = Math.max(1, Math.min(by0, Math.floor(cy - r))), y1 = Math.min(GH - 2, Math.max(by1, Math.ceil(cy + r)));
      if (depth < 0.01) {                              /* finger lifted: only relax what moves */
        if (bx1 < 0) return false;
        x0 = Math.max(1, bx0); x1 = Math.min(GW - 2, bx1); y0 = Math.max(1, by0); y1 = Math.min(GH - 2, by1);
      }
      var s = sig / CELL, is2 = 1 / (2 * s * s), rim = 2.05 * s, rw = 1 / (2 * 0.7 * s * 0.7 * s);
      var rg = 1.75 * s, gw = 1 / (2 * 0.55 * s * 0.55 * s);
      var nx0 = GW, ny0 = GH, nx1 = -1, ny1 = -1, W = GW;
      for (var yy = y0; yy <= y1; yy++) {
        for (var xx = x0, i = yy * W + x0; xx <= x1; xx++, i++) {
          var hi = hgt[i];
          var a = C2 * (hgt[i - 1] + hgt[i + 1] + hgt[i - W] + hgt[i + W] - 4 * hi) - KR * hi;
          if (depth > 0.01) {
            var dx = xx - cx, dy = yy - cy, d2 = dx * dx + dy * dy;
            if (d2 < r * r) {
              var q = d2 * is2, g = Math.exp(-q * (0.55 + 0.45 * Math.sqrt(q))), d = Math.sqrt(d2);   /* finger pad: flat bottom, steep wall */
              var ring = Math.exp(-(d - rim) * (d - rim) * rw);
              var tgt = -depth * g + depth * 0.09 * ring, w = Math.min(1, g * 1.7) + ring * 0.25;
              if (drag > 0.02 && d > 0.001) {           /* cloth piles up ahead of a dragging finger */
                var c = (dx * ux + dy * uy) / d;
                if (c > 0) { var ra = Math.exp(-(d - rg) * (d - rg) * gw) * c * c; tgt += depth * 0.5 * drag * ra; w += ra * 0.6 * drag; }
              }
              a += KC * w * (tgt - hi);
            }
          }
          vel[i] = (vel[i] + a) * (1 - DAMP);
        }
      }
      for (yy = y0; yy <= y1; yy++) {
        for (xx = x0, i = yy * W + x0; xx <= x1; xx++, i++) {
          var h = hgt[i] + vel[i];
          if (h > -0.015 && h < 0.015 && vel[i] > -0.004 && vel[i] < 0.004) { h = 0; vel[i] = 0; }
          else { if (xx < nx0) nx0 = xx; if (xx > nx1) nx1 = xx; if (yy < ny0) ny0 = yy; if (yy > ny1) ny1 = yy; }
          hgt[i] = h;
        }
      }
      bx0 = nx0; by0 = ny0; bx1 = nx1; by1 = ny1;
      return true;
    }

    function tick(now) {
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      var idle = now - movedAt;
      /* a resting finger lifts slowly: after 1.6 s of stillness the dent fades out over ~3 s */
      var still = down ? 1 : Math.max(0, Math.min(1, 1 - (idle - 1600) / 3000));
      still = still * still * (3 - 2 * still);
      var shown = present && (down || still > 0);
      on += ((present ? 1 : 0) - on) * ease(dt, present ? 120 : 260);
      if (down) want = 1 + Math.min((now - downAt) / 700, 1) * 0.28;
      else if (!shown) want = 0;
      else if (!bounce) want = rest() * still;
      press += ((down ? 1 : 0) - press) * ease(dt, down ? 70 : 140);
      var px = x, py = y, k = ease(dt, 14 + press * 50);   /* tight on the arrow; only a pressed finger drags heavy cloth */
      x += (tx - x) * k; y += (ty - y) * k;
      var kv = ease(dt, 60);
      vx += ((x - px) / dt * 16 - vx) * kv;
      vy += ((y - py) / dt * 16 - vy) * kv;
      dent += (want - dent) * ease(dt, down ? 90 : (want === 0 ? 400 : 120));
      var sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > 0.6) { var ka = ease(dt, 70); ax += (vx / sp - ax) * ka; ay += (vy / sp - ay) * ka; }
      drag += (press * Math.min(sp / 12, 1) - drag) * ease(dt, 90);
      var al = Math.sqrt(ax * ax + ay * ay) || 1, ux = ax / al, uy = ay / al;
      var t = (now - t0) / 1000;
      var breathe = 1 + 0.09 * Math.sin(t * 2.4) + 0.04 * Math.sin(t * 5.3 + 1.1);
      var depth = dent * 18 * (down ? 1 : breathe), sig = 12 + dent * 6 + press * 3;
      var fx = x - vx * press * 1.6, fy = y - vy * press * 1.6;   /* a pressed finger drags the cloth behind it */
      /* the funnel itself is drawn exactly in the shader; the membrane carries a
         shallower, wider share of it, so a drag leaves a wake and a release wobbles */
      var moving = step(fx, fy, depth * 0.2, sig * 1.2, ux, uy);
      moving = step(fx, fy, depth * 0.2, sig * 1.2, ux, uy) || moving;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, GW, GH, 0, gl.RED, gl.FLOAT, hgt);
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      /* draw only the patch that can differ from flat */
      var reach = sig * 4 + 40;
      var l = Math.min(fx - reach, bx1 >= 0 ? bx0 * CELL - 12 : 1e9), r = Math.max(fx + reach, bx1 >= 0 ? bx1 * CELL + 12 : -1e9);
      var tp = Math.min(fy - reach, by1 >= 0 ? by0 * CELL - 12 : 1e9), bt = Math.max(fy + reach, by1 >= 0 ? by1 * CELL + 12 : -1e9);
      if (depth > 0.02 || moving) {
        l = Math.max(0, l); tp = Math.max(0, tp); r = Math.min(VW, r); bt = Math.min(VH, bt);
        if (r > l && bt > tp) {
          gl.enable(gl.SCISSOR_TEST);
          gl.scissor(Math.floor(l * RES), Math.floor((VH - bt) * RES), Math.ceil((r - l) * RES), Math.ceil((bt - tp) * RES));
          gl.uniform2f(U.uGrid, GW, GH); gl.uniform1f(U.uCell, CELL); gl.uniform2f(U.uView, VW, VH); gl.uniform1f(U.uRes, RES);
          gl.uniform2f(U.uP, fx, fy); gl.uniform1f(U.uDepth, depth); gl.uniform1f(U.uSig, sig);
          gl.uniform2f(U.uDir, ux, uy); gl.uniform1f(U.uDrag, drag); gl.uniform1f(U.uT, t);
          gl.uniform1f(U.uOn, on); gl.uniform1f(U.uDark, dark ? 1 : 0);
          /* the lamp wanders a slow figure over the viewport, 240px above it */
          gl.uniform3f(U.uLp, VW * (0.5 + 0.45 * Math.sin(t * 0.23)), VH * (0.45 + 0.4 * Math.sin(t * 0.13 + 1.3)), 170);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }
      if (!moving && dent < 0.01 && want === 0 && !down && drag < 0.005) { raf = 0; last = 0; return; }
      raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf && !lost) raf = requestAnimationFrame(tick); }
    function at(e) {
      if (!seen) { x = tx = e.clientX; y = ty = e.clientY; seen = true; }
      tx = e.clientX; ty = e.clientY;
      present = true; movedAt = performance.now();
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      at(e);
      hot = !!(e.target && e.target.closest && e.target.closest(HOT));
      if (!e.buttons && down) up();                    /* released somewhere we never heard about */
      kick();
    }, { passive: true });
    /* native drags (links, images, selected text) swallow pointer events: keep following */
    document.addEventListener('dragover', function (e) { if (e.clientX || e.clientY) { at(e); kick(); } }, { passive: true });
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (e.button !== 0) return;
      at(e);
      down = true; downAt = performance.now(); clearTimeout(bounce); bounce = 0;
      kick();
    }, { passive: true, capture: true });
    function up() {
      if (!down) return;
      down = false; movedAt = performance.now();
      want = 0.2;                                      /* springs back up past rest… */
      clearTimeout(bounce);
      bounce = setTimeout(function () { bounce = 0; kick(); }, 140);   /* …and settles */
      kick();
    }
    ['pointerup', 'mouseup', 'dragend', 'drop'].forEach(function (t) { document.addEventListener(t, up, { passive: true, capture: true }); });
    window.addEventListener('blur', up);
    document.documentElement.addEventListener('pointerleave', function () { if (!down) { present = false; kick(); } });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { up(); present = false; } });
    window.addEventListener('resize', function () { size(); kick(); });
    var lost = false;
    cv.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0;
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      root.classList.remove('sg-clothed');
    });
    return true;
  }

  /* The parked dimple: placed once, then never touched again — no rAF loop,
     no pointer listeners, no transform churn. It sits a little above the
     middle of the viewport and is dimmed well under the old resting depth, so
     what is left reads as paper grain rather than as something following you.
     Sizing is read off the element so a change to the box in soft-glass.css
     (currently 340px square, margin -170 to recentre) needs no edit here. */
  function park(f) {
    function place() {
      var w = window.innerWidth || 0, h = window.innerHeight || 0;
      if (!w || !h) return;
      var s = f.offsetWidth || 340, m = s / 2;
      var x = (w - s) / 2 + m, y = (h - s) * 0.38 + m;
      f.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    }
    place();
    window.addEventListener('resize', place, { passive: true });
    window.addEventListener('orientationchange', place, { passive: true });
    f.style.setProperty('--sg-dent', '0.22');   /* .sg-f-bowl/.shade/.lit all read this; .sg-f-fold clamps to 0 */
    f.style.setProperty('--sg-drag', '0');      /* the drag ridge and its wake stay off for good */
    requestAnimationFrame(function () { f.classList.add('on'); });
  }

  function fabric() {
    if (!FINE || REDUCE) return;
    if (FOLLOWS) {                                        /* the old pointer-steered membrane */
      var ok = false;
      try { ok = cloth(); } catch (e) { if (window.console) console.warn('[soft-fx] cloth', e); }
      if (ok) return;
      FAB = true;
      root.classList.add('sg-fab');
    }
    var f = document.createElement('div');
    f.className = 'sg-fabric';
    f.setAttribute('aria-hidden', 'true');
    f.innerHTML = '<i class="sg-f-bowl"></i><i class="sg-f-shade"></i><i class="sg-f-lit"></i><i class="sg-f-fold"></i>' +
      '<b class="sg-f-drag"><i class="sg-f-wake"></i><i class="sg-f-bunch"></i></b>';
    body.appendChild(f);
    if (!FOLLOWS) return park(f);
    var dragEl = f.querySelector('.sg-f-drag');
    var tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, dent = 0.5, want = 0.5;
    var down = false, downAt = 0, press = 0, drag = 0, ax = 1, ay = 0, hot = false;
    var raf = 0, idle = 0, last = 0, seen = false, bounce = 0;
    var HOT = 'a,button,[role=button],input,textarea,select,label,summary,.sidebar-link,.for-topic,.ch-card,.fork-card,.feature-card';
    function ease(dt, tau) { return 1 - Math.exp(-dt / tau); }
    function rest() { return hot ? 0.74 : 0.5; }
    function tick(now) {
      var dt = last ? Math.min(50, now - last) : 16;
      last = now;
      if (down) want = 1 + Math.min((now - downAt) / 700, 1) * 0.28;   /* holding sinks it further */
      press += ((down ? 1 : 0) - press) * ease(dt, down ? 70 : 140);
      var px = x, py = y, k = ease(dt, 14 + press * 50);   /* tight on the arrow; only a pressed finger drags heavy cloth */               /* pressed cloth is heavier */
      x += (tx - x) * k; y += (ty - y) * k;
      var kv = ease(dt, 60);                           /* smoothed velocity, px per 16ms */
      vx += ((x - px) / dt * 16 - vx) * kv;
      vy += ((y - py) / dt * 16 - vy) * kv;
      dent += (want - dent) * ease(dt, down ? 90 : 110);
      var sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > 0.6) {                                  /* heading, only while really moving: no snap at rest */
        var ka = ease(dt, 70);
        ax += (vx / sp - ax) * ka; ay += (vy / sp - ay) * ka;
      }
      drag += (press * Math.min(sp / 14, 1) - drag) * ease(dt, 90);
      var cap = 40 + press * 20, div = 70 - press * 28;
      var s = 1 + Math.min(sp, cap) / div, q = 1 / Math.sqrt(s), d = s - q;
      var ux = sp > 0.01 ? vx / sp : 1, uy = sp > 0.01 ? vy / sp : 0;
      var g = 1.06 - Math.min(dent, 1.28) * 0.12;      /* deeper press = tighter dimple */
      var m11 = (q + d * ux * ux) * g, m12 = d * ux * uy * g, m22 = (q + d * uy * uy) * g;
      var lag = 0.9 + press * 1.4;                     /* the cloth trails the finger */
      f.style.transform = 'translate3d(' + (x - vx * lag).toFixed(1) + 'px,' + (y - vy * lag).toFixed(1) + 'px,0) matrix(' +
        m11.toFixed(4) + ',' + m12.toFixed(4) + ',' + m12.toFixed(4) + ',' + m22.toFixed(4) + ',0,0)';
      f.style.setProperty('--sg-dent', dent.toFixed(3));
      f.style.setProperty('--sg-drag', drag.toFixed(3));
      var al = Math.sqrt(ax * ax + ay * ay) || 1;
      dragEl.style.transform = 'rotate(' + Math.atan2(ay / al, ax / al).toFixed(3) + 'rad)';
      if (!down && Math.abs(tx - x) + Math.abs(ty - y) < 0.15 && sp < 0.04 && Math.abs(want - dent) < 0.003 && press < 0.01 && drag < 0.005) { raf = 0; last = 0; return; }
      raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (!seen) { x = tx = e.clientX; y = ty = e.clientY; seen = true; }
      tx = e.clientX; ty = e.clientY;
      hot = !!(e.target && e.target.closest && e.target.closest(HOT));
      if (!e.buttons && down) down = false;            /* released outside the window */
      if (!down && !bounce) want = rest();
      if (!f.classList.contains('on')) f.classList.add('on');
      clearTimeout(idle);
      idle = setTimeout(function () { if (!down) f.classList.remove('on'); }, 2600);   /* cloth relaxes when you stop */
      kick();
    }, { passive: true });
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      down = true; downAt = performance.now(); clearTimeout(bounce); bounce = 0;
      f.classList.add('on'); kick();
    }, { passive: true });
    function up() {
      if (!down) return;
      down = false;
      want = 0.26;                                     /* the cloth springs back up past rest… */
      clearTimeout(bounce);
      bounce = setTimeout(function () { bounce = 0; want = rest(); kick(); }, 150);   /* …and settles */
      kick();
    }
    document.addEventListener('pointerup', up, { passive: true });
    document.addEventListener('pointercancel', up, { passive: true });
    window.addEventListener('blur', up);
    document.documentElement.addEventListener('pointerleave', function () { if (!down) f.classList.remove('on'); });
  }

  /* ─── 4 · Fog-in reveals ─────────────────────────────────────────────── */
  var FOG = '.feature-card,.fork-card,.ch-card,.stat-card,.qo-card,.res-card,.dash-card,.chat-window,' +
            '.checkup-panel,.plan-card,.quiz-card,.callout,.rec-box,.acc-item,.forum-head,.forum-cats,' +
            '.section-head,.landing section h2,.landing .section-label,.lin-viewheader,.guide-hero,.ch-hero';
  function fog() {
    if (REDUCE || !('IntersectionObserver' in window)) return;
    var skip = '.sidebar,header,.lin-topbar,.forum-overlay,#v-splash,#v-loader,.os-mosaic,.hero,.landing-hero,.tut-card,.qna-panel';
    var whole = ARRIVE || !!document.getElementById('v-splash');
    var H = window.innerHeight;
    var els = $$(FOG).filter(function (el) {
      if (el.closest(skip)) return false;
      if (whole && el.getBoundingClientRect().top < H) return false;   /* the whole page is already fogging in */
      if (el.parentElement && el.parentElement.closest('.sg-fog')) return false;   /* no nested fogs */
      return true;
    });
    if (!els.length) return;
    function done(el) {
      el.classList.remove('sg-fog', 'sg-in');
      el.style.removeProperty('--sg-d');
    }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.style.setProperty('--sg-d', Math.min(k++ * 70, 420) + 'ms');
        el.classList.add('sg-in');
        var fin = function () { done(el); };
        el.addEventListener('animationend', function h(ev) {
          if (ev.target !== el || ev.animationName !== 'sg-fog-reveal') return;
          el.removeEventListener('animationend', h); fin();
        });
        setTimeout(fin, 1800);   /* belt and braces: never strand a blurred card */
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(function (el) { el.classList.add('sg-fog'); io.observe(el); });
  }

  /* ─── 5 · Loading screens: relevant icons around the hospital ────────── */
  /* [icon, left%, top%, width px, delay s] — kept to the sky above the skyline */
  var SPOTS = [
    ['heart',    14, 16, 118, 0.10],
    ['bone',     76, 14, 112, 0.22],
    ['dumbbell', 84, 42,  96, 0.34],
    ['apple',     7, 44,  86, 0.46],
    ['clinic',   19, 64,  74, 0.58],
    ['pulse',    76, 62, 150, 0.70]
  ];
  function dress(host) {
    if (!host || host.classList.contains('sg-dressed')) return;
    var I = window.VitaliteShapes && window.VitaliteShapes.icons;
    if (!I) return;
    var wrap = document.createElement('div');
    wrap.className = 'sg-icons';
    wrap.setAttribute('aria-hidden', 'true');
    SPOTS.forEach(function (s) {
      if (!I[s[0]]) return;
      var d = document.createElement('div');
      d.className = 'sg-ico sg-ico-' + s[0];
      d.style.left = s[1] + '%';
      d.style.top = s[2] + '%';
      d.style.setProperty('--w', s[3] + 'px');
      d.style.setProperty('--d', s[4] + 's');
      d.innerHTML = I[s[0]]();
      wrap.appendChild(d);
    });
    host.insertBefore(wrap, host.firstChild);
    host.classList.add('sg-dressed');
  }
  /* the landing splash gets a heartbeat drawn across it (the mark beats in
     time), the three parts of the site rising one by one, a fact typed out,
     and a warm-up bar that runs for exactly as long as the splash holds */
  var FACTS = [
    ['Tendons store elastic energy like springs: up to half the work of each running stride.', '肌腱像弹簧一样储存弹性能：跑步每一步多达一半的功由它提供。'],
    ['You get stronger while you rest, not while you train: training is the stress, recovery is the adaptation.', '变强发生在休息时而不是训练时：训练是压力，恢复才是适应。'],
    ['A resting heart pumps about 5 litres a minute; an athlete at full effort can move over 30.', '静息时心脏每分钟泵血约 5 升；运动员全力时可超过 30 升。'],
    ['Sleep is when growth hormone peaks: most muscle repair happens in deep sleep.', '生长激素在睡眠时达到峰值：大部分肌肉修复发生在深睡眠中。'],
    ['Early CPR with a defibrillator can double or triple the chance of surviving cardiac arrest.', '尽早心肺复苏并使用除颤器，可使心脏骤停的存活率提高两到三倍。'],
    ['Bone is living tissue: it remodels along the lines of the load you put through it.', '骨骼是活组织：它会沿着你施加的负荷方向重塑。'],
    ['Losing just 2% of body weight in sweat measurably slows endurance performance.', '出汗仅损失 2% 体重，耐力表现就会明显下降。'],
    ['An ankle sprain takes weeks, not days, to regain full ligament strength: balance training cuts re-injury.', '踝关节扭伤恢复韧带强度需要数周而非数天：平衡训练能降低再次受伤。']
  ];
  function splashExtras(host) {
    if (!host || host.id !== 'v-splash' || host.querySelector('.sg-parts')) return;
    var zh = false; try { zh = (localStorage.getItem('sm_lang') || '').toLowerCase() === 'zh'; } catch (e) {}
    var hold = parseInt(host.getAttribute('data-hold'), 10) || 4600;
    var S = window.VitaliteShapes && window.VitaliteShapes.splash;
    var tile = host.querySelector('.v-tile');
    if (tile) {
      var ecg = document.createElement('div');
      ecg.className = 'sg-ecg';
      ecg.setAttribute('aria-hidden', 'true');
      var beat = function (x) { return 'L' + (x - 30) + ' 60 L' + (x - 18) + ' 52 L' + (x - 8) + ' 64 L' + x + ' 14 L' + (x + 10) + ' 104 L' + (x + 20) + ' 50 L' + (x + 30) + ' 60 L' + (x + 44) + ' 56 L' + (x + 58) + ' 60'; };
      var dl = 'M0 60 ' + beat(160) + ' ' + beat(390) + ' L520 60', dr = 'M680 60 ' + beat(820) + ' ' + beat(1040) + ' L1200 60';
      ecg.innerHTML = '<svg viewBox="0 0 1200 120" preserveAspectRatio="none"><path class="sg-ecg-l" d="' + dl + '"/><path class="sg-ecg-r" d="' + dr + '"/></svg>';
      tile.appendChild(ecg);
      tile.classList.add('sg-beat');
    }
    if (S) {
      var parts = document.createElement('div');
      parts.className = 'sg-parts';
      [['know', 'Knowledge', '知识库'], ['clinic', 'Infirmary', '诊所'], ['social', 'Social', '社区']].forEach(function (p, i) {
        if (!S[p[0]]) return;
        var d = document.createElement('div');
        d.className = 'sg-part';
        d.style.setProperty('--i', i);
        d.innerHTML = '<span class="sg-part-i">' + S[p[0]]() + '</span><span class="sg-part-t">' + (zh ? p[2] : p[1]) + '</span>';
        parts.appendChild(d);
      });
      host.appendChild(parts);
    }
    /* vitals on a monitor either side of the mark; the heart rate ticks with the beat */
    if (tile) {
      var V = [['HR', '72', 'bpm', 'l'], ['SpO₂', '98', '%', 'l'], ['BP', '118/76', 'mmHg', 'r'], [zh ? '体温' : 'Temp', '36.8', '°C', 'r']];
      var vit = document.createElement('div');
      vit.className = 'sg-vitals';
      vit.setAttribute('aria-hidden', 'true');
      vit.innerHTML = V.map(function (v, i) {
        return '<div class="sg-vital sg-vital-' + v[3] + '" style="--i:' + i + '"><span class="k">' + v[0] + '</span><span class="v">' + v[1] + '</span><span class="u">' + v[2] + '</span></div>';
      }).join('');
      tile.appendChild(vit);
      var hr = vit.querySelector('.v'), bpm = 72;
      (function tick() {
        if (!host.isConnected) return;
        bpm = Math.max(66, Math.min(80, bpm + Math.round(Math.random() * 4 - 2)));
        hr.textContent = bpm;
        setTimeout(tick, 60000 / bpm * 1.5);
      })();
    }
    /* two facts, one after the other, typed out */
    /* tips come from vt-sources.js (cited); the short list here is only a fallback */
    var TIPS = (window.VT_TIPS && window.VT_TIPS.length) ? window.VT_TIPS.map(function (t) { return [t.en, t.zh, t.ref]; }) : FACTS;
    var pick = TIPS.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 2);
    var fact = document.createElement('div');
    fact.className = 'sg-fact';
    fact.innerHTML = '<b>' + (zh ? '你知道吗？' : 'Did you know?') + '</b> <span></span><i class="sg-caret"></i><cite></cite>';
    host.appendChild(fact);
    var sp = fact.querySelector('span'), ct = fact.querySelector('cite');
    function citeOf(p) { var C = window.VT_CITE; return p && p[2] && C ? '— ' + C.short(p[2]) : ''; }
    ct.textContent = citeOf(pick[0]);
    function typeFact(txt, at) {
      var k = 0;
      setTimeout(function type() {
        if (!host.isConnected || k >= txt.length) return;
        k += zh ? 1 : 2; sp.textContent = txt.slice(0, k);
        setTimeout(type, zh ? 40 : 20);
      }, at);
    }
    typeFact(zh ? pick[0][1] : pick[0][0], 1400);
    if (hold > 5000 && pick[1]) {
      setTimeout(function () { if (!host.isConnected) return; fact.classList.add('swap'); setTimeout(function () { sp.textContent = ''; ct.textContent = citeOf(pick[1]); fact.classList.remove('swap'); }, 380); }, hold * 0.52);
      typeFact(zh ? pick[1][1] : pick[1][0], hold * 0.52 + 420);
    }
    /* the last moment: a pulse of light off the mark and a shine across the name */
    setTimeout(function () {
      if (!host.isConnected) return;
      host.classList.add('sg-welcome');
      if (host.getAttribute('data-fin') === 'burst' && tile) {         /* the other finale: sparks off the mark */
        var b = document.createElement('div'); b.className = 'sg-burst';
        for (var q = 0; q < 16; q++) b.innerHTML += '<i style="--a:' + (q * 22.5) + 'deg;animation-delay:' + (q % 2 ? 0.06 : 0) + 's"></i>';
        tile.appendChild(b);
      }
    }, Math.max(0, hold - 1100));
    var STAGES = zh ? ['热身中', '拉伸中', '检查生命体征', '载入章节', '准备练习', '准备就绪'] : ['Warming up', 'Stretching', 'Checking vitals', 'Loading chapters', 'Preparing practice', 'Ready'];
    var prog = document.createElement('div');
    prog.className = 'sg-prog';
    prog.style.setProperty('--hold', hold + 'ms');
    prog.innerHTML = '<div class="sg-prog-bar"><i></i></div><div class="sg-prog-t">' + STAGES[0] + '</div>';
    host.appendChild(prog);
    var pt = prog.querySelector('.sg-prog-t');
    STAGES.forEach(function (st, i) { if (i) setTimeout(function () { pt.textContent = st; pt.classList.remove('flip'); void pt.offsetWidth; pt.classList.add('flip'); }, hold * i / STAGES.length); });
    var hint = document.createElement('div');
    hint.className = 'sg-skip';
    hint.textContent = zh ? '点击任意处跳过' : 'Tap anywhere to skip';
    host.appendChild(hint);
  }
  function posters() {
    safe(function () { splashExtras(document.getElementById('v-splash')); });
    dress(document.getElementById('v-splash'));
    dress(document.getElementById('v-loader'));
    /* loader.js appends #v-loader to <body> only when a page is slow */
    var mo = new MutationObserver(function (recs) {
      recs.forEach(function (r) {
        Array.prototype.forEach.call(r.addedNodes, function (n) {
          if (n.id === 'v-loader' || n.id === 'v-splash') safe(function () { dress(n); splashExtras(n); handoff(n); });
        });
      });
    });
    mo.observe(body, { childList: true });
    setTimeout(function () { mo.disconnect(); }, 12000);
    handoff(document.getElementById('v-splash'));
    handoff(document.getElementById('v-loader'));
  }
  /* a loading screen starts sharp; when it leaves it blurs away while the
     page underneath comes up out of the fog */
  function handoff(n) {
    if (!n || n._sgHand) return;
    n._sgHand = true;
    root.classList.remove('sg-lf');          /* never blur the splash itself on the way in */
    var mo = new MutationObserver(function () {
      if (!/-off\b/.test(n.className)) return;
      mo.disconnect();
      pageFogIn(true);
    });
    mo.observe(n, { attributes: true, attributeFilter: ['class'] });
  }

  /* ─── 6 · Mosaic tiles get the sprayed shading ───────────────────────── */
  function sprayMosaic() {
    $$('.os-mosaic > *').forEach(function (t) {
      t.classList.add('sg-spray');
      t.style.setProperty('--sg-spray-dk', 'rgba(4,10,22,.45)');
      t.style.setProperty('--sg-spray-lt', 'rgba(255,255,255,.35)');
    });
  }

  /* ─── 7 · Sidebar wheel ─────────────────────────────────────────────── */
  /* Every category open at once, a fixed gap between categories, each
     category marked by an airbrushed ribbon emblem. Inside the semicircle the
     list is a scroll wheel: each row is a ribbon as wide as the circle is at
     that height, and rows tilt away + fade as they leave the centre line. */
  var EMBLEM = { 'vitalite-knowledge': 'know', 'vitalite-infirmary': 'clinic', 'vitalite-social': 'social', 'vitalite-dev': 'dev' };
  /* ─── Reading bar: a sunk channel under the top bar with a lit fill and a
     raised bead where you are, instead of a hot line along the edge ───── */
  function readBar() {
    var old = document.getElementById('readingBar');
    if (!old) return;
    root.classList.add('sg-read-on');
    var bar = document.createElement('div');
    bar.className = 'sg-read';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i class="sg-read-fill"></i><b class="sg-read-bead"></b>';
    body.appendChild(bar);
    var raf = 0, p = -1;
    function place() {
      var tb = document.querySelector('.lin-topbar') || document.querySelector('body > header, .page-wrapper > header');
      var y = 6;
      if (tb) { var r = tb.getBoundingClientRect(); if (r.bottom > 0 && r.bottom < 140 && getComputedStyle(tb).position !== 'static') y = r.bottom - 3; }
      bar.style.top = y + 'px';
    }
    function draw() {
      raf = 0;
      var se = document.scrollingElement || document.documentElement;
      var max = se.scrollHeight - window.innerHeight;
      var q = max > 40 ? Math.min(1, Math.max(0, (window.scrollY || se.scrollTop) / max)) : 0;
      if (Math.abs(q - p) < 0.001) return;
      p = q;
      bar.style.setProperty('--p', q.toFixed(4));
      bar.classList.toggle('on', q > 0.004);
      bar.classList.toggle('end', q > 0.995);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(draw); }
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', function () { place(); kick(); });
    place(); draw();
    setTimeout(place, 800);
  }

  /* the category pills in the top bar get the same emblems, small */
  function pillEmblems() {
    var S = window.VitaliteShapes && window.VitaliteShapes.splash;
    if (!S) return;
    function paint() {
      $$('.sec-switcher .sec-pill').forEach(function (a) {
        var h = (a.getAttribute('href') || '').toLowerCase(), k = '';
        if (/infirmary|checkup|plan\.html/.test(h)) k = 'clinic';
        else if (/social|forum/.test(h)) k = 'social';
        else if (/guide|toc|knowledge|ib-sehs|g10|exam|home/.test(h)) k = 'know';
        else if (/admin/.test(h)) k = 'dev';
        var ico = a.querySelector('.sec-ico');
        if (!k || !ico || ico.getAttribute('data-emb') === k || !S[k]) return;
        ico.setAttribute('data-emb', k);
        ico.classList.add('sg-emb-sm');
        ico.innerHTML = S[k]();
      });
    }
    paint();
    var sw = document.querySelector('.sec-switcher');
    if (sw && sw.parentNode) new MutationObserver(function () { paint(); }).observe(sw.parentNode, { childList: true, subtree: true });
  }
  function wheel() {
    var sb = document.querySelector('.sidebar');
    if (!sb) return;
    var S = window.VitaliteShapes && window.VitaliteShapes.splash;
    $$('.sidebar-group.part', sb).forEach(function (g) {
      var t = g.querySelector('.part-toggle'), k = EMBLEM[g.getAttribute('data-part')];
      g.classList.add('sg-cat-' + (g.getAttribute('data-part') || '').replace('vitalite-', ''));
      if (t && S && k && S[k] && !t.querySelector('.sg-emb')) {
        var e = document.createElement('span');
        e.className = 'sg-emb';
        e.setAttribute('aria-hidden', 'true');
        e.innerHTML = S[k]();
        t.insertBefore(e, t.firstChild);
      }
    });
    /* study-tool rows open the tool in place on guide.html, deep-link elsewhere */
    sb.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-study]') : null;
      if (!a) return;
      var fn = window[a.getAttribute('data-study')];
      if (typeof fn === 'function') { e.preventDefault(); try { fn(); } catch (x) {} }
    });
    root.classList.add('sg-wheel');

    var rows = [], raf = 0;
    function collect() {
      rows = $$('.sidebar-logo, .part-toggle, .sidebar-link, .sidebar-label', sb).filter(function (r) { return r.offsetParent; });
    }
    function topIn(el) {           /* layout top inside the sidebar, ignoring transforms */
      var y = 0;
      while (el && el !== sb) { y += el.offsetTop; el = el.offsetParent; }
      return y;
    }
    function shape() {
      raf = 0;
      if (!root.classList.contains('os-semi')) return;
      var R = sb.clientHeight / 2, st = sb.scrollTop;
      var RV = R * 0.84;           /* the glass feathers out at ~0.86R: fit the ribbons to what you see */
      /* read every row's geometry first, then write: interleaving forced a layout per row */
      var geo = rows.map(function (row) { return topIn(row) + row.offsetHeight / 2; });
      rows.forEach(function (row, i) {
        var dy = geo[i] - st - R;
        var ad = Math.min(Math.abs(dy), RV * 0.999), k = ad / RV;
        var w = Math.sqrt(RV * RV - ad * ad);
        row.style.setProperty('--sg-w', Math.max(56, w - 6).toFixed(0) + 'px');
        row.style.setProperty('--sg-s', (1 - 0.12 * k * k).toFixed(3));
        row.style.setProperty('--sg-rx', (-(Math.max(-RV, Math.min(RV, dy)) / RV) * 34).toFixed(1) + 'deg');
        row.style.setProperty('--sg-o', (k < 0.7 ? 1 : Math.max(0, 1 - (k - 0.7) / 0.27)).toFixed(3));
      });
    }
    function kick() { if (!raf) raf = requestAnimationFrame(shape); }
    function centre() {            /* open on the page you're on */
      var a = sb.querySelector('.sb-sub.on') || sb.querySelector('.sidebar-link.active, .sidebar-link.on');
      if (a) sb.scrollTop = topIn(a) + a.offsetHeight / 2 - sb.clientHeight / 2;
    }
    collect(); centre(); shape();
    sb.addEventListener('scroll', kick, { passive: true });
    sb.addEventListener('mouseenter', function () { collect(); kick(); });
    window.addEventListener('resize', function () { collect(); kick(); });
    new MutationObserver(function () { collect(); kick(); }).observe(sb, { childList: true, subtree: true });
  }

  /* guide.html?study=flashcards|quiz|ai opens that tool once the page is up */
  function studyDeepLink() {
    var m = /[?&]study=(flashcards|quiz|ai)\b/.exec(location.search);
    if (!m) return;
    var fn = { flashcards: 'openFlashcards', quiz: 'openQuizMode', ai: 'openAiModal' }[m[1]];
    var go = function () { if (typeof window[fn] === 'function') { try { window[fn](); } catch (e) {} } };
    if (document.readyState === 'complete') setTimeout(go, 300);
    else window.addEventListener('load', function () { setTimeout(go, 300); });
  }

  /* ─── 8 · Page arrival: the whole page comes up out of a fog ────────── */
  /* The head-first script puts html.sg-lf on before first paint (not on the
     splash page, and not after a category switch — those hand off here). The
     blur lives on <html>, the one element whose filter doesn't break fixed
     children, and is dropped the moment it settles so scrolling stays cheap. */
  var fogT = 0;
  function settle() {
    clearTimeout(fogT);
    root.classList.remove('sg-lf', 'sg-lf-hand', 'sg-lf-go');
  }
  function armSettle() {
    clearTimeout(fogT);
    fogT = setTimeout(settle, 3000);
  }
  function pageFogIn(hand) {
    if (REDUCE) return;
    root.classList.remove('sg-lf', 'sg-lf-hand', 'sg-lf-go');
    void root.offsetWidth;                      /* restart the animation */
    root.classList.add(hand ? 'sg-lf-hand' : 'sg-lf', 'sg-lf-go');
    armSettle();
  }
  function pageFog() {
    root.addEventListener('animationend', function (e) {
      if (e.target === root && /^sg-page-/.test(e.animationName)) settle();
    });
    /* the fog holds, fully blurred, until the page has really painted: two
       frames after the deferred scripts ran. Starting it on a clock meant a
       slow load (CDN scripts, a long page) finished the animation before the
       first frame ever showed, so the page just appeared sharp. */
    if (root.classList.contains('sg-lf')) {
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        root.classList.add('sg-lf-go');
        armSettle();
      }); });
    }
    window.addEventListener('pageshow', function (e) { if (e.persisted) settle(); });
  }

  /* ─── 9 · Theme + language swaps ─────────────────────────────────────── */
  /* Dark/light spreads out of the toggle as a soft-edged circle; 中/EN fogs
     the old words out and the new ones in. Every page wires its own toggle
     handler, so this steps in front of the click, then replays it inside a
     view transition (or behind a fog overlay where there are none). */
  /* The sky that rides the theme wipe: going dark, a crescent moon rises out
     of the toggle and stars come on as the edge of the wipe reaches them;
     going light, a sun bursts out with turning rays, a warm glare sweeps the
     page and motes drift up. A thin ring of light rides the wipe's edge. It
     has its own view-transition-name so it animates live above the swap. */
  function sky(toDark, cx, cy, R) {
    var el = document.createElement('div');
    el.className = 'sg-sky ' + (toDark ? 'sg-sky-night' : 'sg-sky-day');
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--x', cx.toFixed(0) + 'px');
    el.style.setProperty('--y', cy.toFixed(0) + 'px');
    el.style.setProperty('--R', R.toFixed(0) + 'px');
    var W = innerWidth, H = innerHeight, h = '<i class="sg-sky-ring"></i>';
    el.style.setProperty('--mx', ((W / 2 - cx) * 0.55).toFixed(0) + 'px');      /* the moon/sun travels toward mid-sky */
    el.style.setProperty('--my', (H * 0.2).toFixed(0) + 'px');
    /* the wipe grows with cubic-bezier(.55,0,.25,1) over .75s: reaching distance d takes roughly this long */
    function when(d) { var f = Math.min(1, d / R); return (0.75 * (0.35 + 0.65 * Math.sqrt(f)) * f + 0.05).toFixed(2); }
    var n = toDark ? 34 : 22, i;
    for (i = 0; i < n; i++) {
      var x = Math.random() * W, y = Math.random() * H * (toDark ? 0.9 : 1);
      var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      var sz = toDark ? (Math.random() < 0.18 ? 3.2 : 1.4 + Math.random() * 1.4) : 2 + Math.random() * 3;
      h += '<b class="' + (toDark ? 'sg-star' : 'sg-mote') + '" style="left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px;width:' + sz.toFixed(1) +
        'px;height:' + sz.toFixed(1) + 'px;animation-delay:' + when(d) + 's;--dr:' + (Math.random() * 40 + 20).toFixed(0) + 'px"></b>';
    }
    h += toDark ? '<i class="sg-moon"></i>' : '<i class="sg-sun"><i></i></i><i class="sg-glare"></i>';
    el.innerHTML = h;
    body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2300);
  }

  function swapFx() {
    if (REDUCE) return;
    var busy = false, passing = false;
    document.addEventListener('click', function (e) {
      if (passing) return;
      var b = e.target && e.target.closest ? e.target.closest('#darkToggle,#langToggle') : null;
      if (!b) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      if (busy) return;
      busy = true;
      var theme = b.id === 'darkToggle';
      var r = b.getBoundingClientRect();
      var cx = r.width ? r.left + r.width / 2 : innerWidth - 40, cy = r.height ? r.top + r.height / 2 : 30;
      var far = Math.sqrt(Math.pow(Math.max(cx, innerWidth - cx), 2) + Math.pow(Math.max(cy, innerHeight - cy), 2));
      root.style.setProperty('--sg-tx', cx.toFixed(0) + 'px');
      root.style.setProperty('--sg-ty', cy.toFixed(0) + 'px');
      root.style.setProperty('--sg-tr', (far + 120).toFixed(0) + 'px');
      var toDark = theme && !body.classList.contains('dark');
      function run() {
        passing = true; try { b.click(); } finally { passing = false; }
        if (theme) sky(toDark, cx, cy, far + 120);
      }
      if (theme) { b.classList.remove('sg-tg-spin'); void b.offsetWidth; b.classList.add('sg-tg-spin'); setTimeout(function () { b.classList.remove('sg-tg-spin'); }, 900); }
      var cls = theme ? 'sg-vt-theme' : 'sg-vt-lang';
      function done() { root.classList.remove(cls); busy = false; }
      if (document.startViewTransition) {
        root.classList.add(cls);
        try {
          var vt = document.startViewTransition(run);
          vt.finished.then(done, done);
        } catch (x) { run(); done(); }
        return;
      }
      /* no view transitions: a fog (or the new theme's colour) sweeps over */
      var o = document.createElement('div');
      o.className = 'sg-swap ' + (theme ? 'sg-swap-theme' : 'sg-swap-lang');
      if (theme) o.style.background = body.classList.contains('dark') ? '#E4E9F0' : '#0B1628';
      body.appendChild(o);
      if (theme) sky(toDark, cx, cy, far + 120);
      requestAnimationFrame(function () { requestAnimationFrame(function () { o.classList.add('go'); }); });
      setTimeout(function () {
        passing = true; try { b.click(); } finally { passing = false; }
        o.classList.add('done');
        setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); busy = false; }, 480);
      }, theme ? 440 : 220);
    }, true);
  }

  /* ─── 10 · Switching category: a wash in the category's colour ───────── */
  /* Leaving Knowledge for the Infirmary (say) washes the page in the new
     category's ink with its emblem; the next page opens under the same wash
     (painted by the head script before first paint) and fogs it away. */
  function pageKey(h) {
    var s = String(h || '').split(/[?#]/)[0].replace(/^.*\//, '').replace(/\.html$/, '');
    return s || 'index';
  }
  function catMap() {
    var m = {};
    /* by each link's innermost group: on some pages an unclosed div nests
       the later groups inside Knowledge */
    $$('.sidebar-group.part a.sidebar-link[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || h.charAt(0) === '#' || /^[a-z]+:/i.test(h)) return;
      var pk = pageKey(h);
      if (m[pk]) return;
      var g = a.closest('.sidebar-group.part'), nm = g.querySelector('.part-name');
      var k = (g.getAttribute('data-part') || '').replace('vitalite-', '');
      m[pk] = { k: k, en: nm ? (nm.getAttribute('data-en') || nm.textContent) : k, zh: nm ? (nm.getAttribute('data-zh') || '') : '' };
    });
    return m;
  }
  function isZh() { try { return (localStorage.getItem('sm_lang') || '').toLowerCase() === 'zh'; } catch (e) { return false; } }
  function washEl(c) {
    var w = document.createElement('div');
    w.className = 'sg-catwash';
    w.setAttribute('data-cat', c.k);
    w.setAttribute('aria-hidden', 'true');
    var S = window.VitaliteShapes && window.VitaliteShapes.splash, e = EMBLEM['vitalite-' + c.k];
    var zh = isZh() && c.zh;
    w.innerHTML = '<div class="sg-cw-in"><div class="sg-cw-emb">' + (S && e && S[e] ? S[e]() : '') + '</div>' +
      '<div class="sg-cw-name"></div><div class="sg-cw-sub">Vitalité</div></div>';
    w.querySelector('.sg-cw-name').textContent = zh ? c.zh : c.en;
    return w;
  }
  function catWash() {
    /* arriving under a wash */
    if (root.classList.contains('sg-catgo')) {
      var c = null;
      try { c = JSON.parse(sessionStorage.getItem('sg-catgo') || 'null'); } catch (x) {}
      try { sessionStorage.removeItem('sg-catgo'); } catch (x) {}
      var w = washEl(c || { k: root.getAttribute('data-sg-cat') || '', en: '', zh: '' });
      body.appendChild(w);
      root.classList.remove('sg-catgo');
      setTimeout(function () {
        pageFogIn(false);
        w.classList.add('sg-cw-out');
        setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 1000);
      }, 380);
    }
    if (REDUCE) return;
    var map = catMap(), here = map[pageKey(location.pathname)];
    if (!here) return;
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var u;
      try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin || pageKey(u.pathname) === pageKey(location.pathname)) return;
      var to = map[pageKey(u.pathname)];
      if (!to || to.k === here.k) return;
      e.preventDefault();
      try { sessionStorage.setItem('sg-catgo', JSON.stringify({ k: to.k, en: to.en, zh: to.zh, t: Date.now() })); } catch (x) {}
      var w = washEl(to);
      w.classList.add('sg-cw-enter');
      root.classList.add('sg-leaving');
      body.appendChild(w);
      setTimeout(function () { location.href = u.href; }, 340);
      window.addEventListener('pageshow', function (ev) {
        if (!ev.persisted) return;             /* came back via bfcache: lift the wash */
        root.classList.remove('sg-leaving');
        if (w.parentNode) w.parentNode.removeChild(w);
      }, { once: true });
    });
  }

  /* ─── Mobile sidebar: a menu button and a drawer you can swipe ─────── */
  /* Below 1025px the rail is off-canvas (linear-theme), but the page's own
     #sidebarToggle is hidden by vitalite-skin and never reaches the top bar,
     so phones had no way in. This adds a soft menu pill to the top bar, a
     scrim, a close pill inside the drawer, swipe-from-the-left-edge to open
     (the drawer follows the thumb) and swipe-back to close. It only flips
     #sidebar.open, the same class the inline toggle and draft.js use. */
  function mobileNav() {
    var side = document.getElementById('sidebar');
    if (!side || !window.matchMedia) return;
    var mq = matchMedia('(max-width:1024px)');
    var zh = function () { return body.classList.contains('lang-zh'); };
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'sg-menu';
    btn.setAttribute('aria-controls', 'sidebar'); btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i></i><i></i><i></i>';
    var bar = document.querySelector('.lin-topbar-inner') || document.querySelector('header .header-inner');
    if (bar) bar.insertBefore(btn, bar.firstChild); else { btn.classList.add('sg-menu-float'); body.appendChild(btn); }
    var scrim = document.createElement('div');
    scrim.className = 'sg-scrim'; scrim.setAttribute('aria-hidden', 'true');
    body.appendChild(scrim);
    var x = document.createElement('button');
    x.type = 'button'; x.className = 'sg-menu-x';
    x.innerHTML = '<i></i><i></i>';
    side.insertBefore(x, side.firstChild);
    root.classList.add('sg-mnav');

    /* the top bar's category pills are hidden on phones: carry them into the drawer */
    function cats() {
      var sw = document.querySelector('.sec-switcher');
      if (!sw) return;
      var old = side.querySelector('.sg-dsec');
      if (old && old.getAttribute('data-src') === sw.innerHTML.length + '') return;
      var n = document.createElement('nav');
      n.className = 'sg-dsec';
      n.setAttribute('aria-label', sw.getAttribute('aria-label') || 'Sections');
      n.setAttribute('data-src', sw.innerHTML.length + '');
      $$('.sec-pill', sw).forEach(function (a) { n.appendChild(a.cloneNode(true)); });
      $$('.sec-pill-label', n).forEach(function (l) { var t = l.getAttribute(zh() ? 'data-zh' : 'data-en'); if (t) l.textContent = t; });
      if (old) side.replaceChild(n, old); else side.insertBefore(n, x.nextSibling);
    }
    function isOpen() { return side.classList.contains('open'); }
    function set(o) { side.classList.toggle('open', !!o); }
    function label() {
      btn.setAttribute('aria-label', zh() ? '打开菜单' : 'Open menu');
      x.setAttribute('aria-label', zh() ? '关闭菜单' : 'Close menu');
    }
    function sync() {
      var o = isOpen() && mq.matches;
      if (o && !root.classList.contains('sg-nav-open')) {
        cats();
        var i = 0;                                         /* rows float in one after another */
        $$('.sidebar-logo, .part-toggle, .sidebar-label, .sidebar-link', side).forEach(function (r) {
          if (r.offsetParent) r.style.setProperty('--sg-i', Math.min(i++, 18));
        });
      }
      root.classList.toggle('sg-nav-open', o);
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      label();
    }
    new MutationObserver(sync).observe(side, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(label).observe(body, { attributes: true, attributeFilter: ['class'] });
    btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); set(!isOpen()); });
    x.addEventListener('click', function (e) { e.preventDefault(); set(false); btn.focus({ preventScroll: true }); });
    scrim.addEventListener('click', function () { set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen() && mq.matches) { set(false); btn.focus({ preventScroll: true }); } });
    side.addEventListener('click', function (e) {
      if (!mq.matches) return;
      var a = e.target.closest ? e.target.closest('a[href], [data-study]') : null;
      if (a) setTimeout(function () { set(false); }, 60);
    });
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () { if (!mq.matches) set(false); sync(); });

    /* swipe: from the left edge to pull it out, on the drawer or scrim to push it back */
    var sx = 0, sy = 0, st = 0, dx = 0, mode = 0, W = 300, lastX = 0, lastT = 0, v = 0;   /* mode 0 idle, 1 undecided, 2 dragging */
    function begin(e, allow) {
      if (!mq.matches || e.touches.length !== 1) return;
      var t = e.touches[0];
      if (!allow(t)) return;
      sx = lastX = t.clientX; sy = t.clientY; st = lastT = e.timeStamp; dx = 0; v = 0; mode = 1;
      W = side.offsetWidth || 300;
    }
    function move(e) {
      if (!mode) return;
      var t = e.touches[0], ddx = t.clientX - sx, ddy = t.clientY - sy;
      if (mode === 1) {
        if (Math.abs(ddx) < 8 && Math.abs(ddy) < 8) return;
        if (Math.abs(ddy) > Math.abs(ddx) || (isOpen() ? ddx > 0 : ddx < 0)) { mode = 0; return; }
        mode = 2; root.classList.add('sg-nav-drag');
      }
      var dt = e.timeStamp - lastT;
      if (dt > 0) v = v * 0.4 + ((t.clientX - lastX) / dt) * 0.6;
      lastX = t.clientX; lastT = e.timeStamp;
      dx = ddx;
      var off = isOpen() ? Math.min(0, dx) : Math.min(0, -W + dx);
      side.style.transform = 'translateX(' + off.toFixed(1) + 'px)';
      scrim.style.opacity = String(Math.max(0, Math.min(1, 1 + off / W)));
      if (e.cancelable) e.preventDefault();
    }
    function end() {
      if (mode === 2) {
        root.classList.remove('sg-nav-drag');
        side.style.transform = ''; scrim.style.opacity = '';
        if (isOpen()) { if (dx < -W * 0.3 || v < -0.45) set(false); }
        else if (dx > W * 0.35 || v > 0.45) set(true);
      }
      mode = 0;
    }
    document.addEventListener('touchstart', function (e) {
      begin(e, function (t) {
        if (isOpen()) return true;                        /* anywhere: drawer or scrim */
        return t.clientX < 24;                            /* closed: only the left edge */
      });
    }, { passive: true });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', end, { passive: true });
    document.addEventListener('touchcancel', end, { passive: true });
    sync();
  }

  /* ─── Landing top bar for visitors who aren't signed in ────────────── */
  /* index.html is the signed-out front door (accounts are redirected to
     home.html unless they ask for ?landing=1). There the bar keeps only what
     a visitor needs: the wordmark, the page's own anchors, 中/EN, the theme,
     Log in and a Sign up pill. The category pills, Study Tools, search, the
     tutorial replay and the bell stay for people with an account. */
  function guestBar() {
    if (!body.classList.contains('landing')) return;
    var u = null;
    try { u = JSON.parse(localStorage.getItem('sm_user') || 'null'); } catch (e) {}
    if (u && u.email && !u.suspended) return;
    root.classList.add('sg-guestbar');
    function addSignup() {
      var login = document.getElementById('loginBtn');
      if (!login || document.querySelector('.sg-signup')) return !!login;
      var a = document.createElement('a');
      a.className = 'sg-signup';
      a.href = 'login.html?tab=signup';
      a.setAttribute('data-en', 'Sign up'); a.setAttribute('data-zh', '注册');
      a.textContent = body.classList.contains('lang-zh') ? '注册' : 'Sign up';
      (login.closest('#logWrap') || login).insertAdjacentElement('afterend', a);
      return true;
    }
    if (!addSignup()) {                                /* auth-widget may build the button later */
      var mo = new MutationObserver(function () { if (addSignup()) mo.disconnect(); });
      mo.observe(body, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 8000);
    }
    new MutationObserver(function () {
      var a = document.querySelector('.sg-signup');
      if (a) a.textContent = body.classList.contains('lang-zh') ? '注册' : 'Sign up';
    }).observe(body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ─── Boot ───────────────────────────────────────────────────────────── */
  function boot() {
    safe(mountGrain);
    safe(themeSync);
    safe(pageFog);
    safe(catWash);
    safe(posters);
    safe(fabric);
    safe(sheen);
    safe(swapFx);
    safe(wheel);
    safe(pillEmblems);
    safe(mobileNav);
    safe(guestBar);
    safe(readBar);
    safe(studyDeepLink);
    safe(fog);
    safe(sprayMosaic);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

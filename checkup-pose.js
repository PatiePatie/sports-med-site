/* checkup-pose.js — on-device body tracking for the Checkup live scan.
   Loaded on demand (import()) by checkup.js when the camera starts. Uses
   MediaPipe's pose landmarker, served from this site (vendor/mediapipe/),
   so nothing leaves the phone and nothing depends on Google or a CDN.

   The scan works by pointing: the person touches (or points right at) the
   sore spot with a fingertip; we find which body part that fingertip is on,
   ignoring the arm that is doing the pointing. Front view, so the back isn't
   offered. Returns { part, side, score, tip:{x,y}, at:{x,y} } in video pixels.

   MediaPipe Tasks Vision + model © Google LLC, Apache-2.0 (vendor/mediapipe/NOTICE). */
import { FilesetResolver, PoseLandmarker } from './vendor/mediapipe/vision_bundle.mjs';

const BASE = new URL('./vendor/mediapipe/', import.meta.url).href;

export async function createPose(mode) {
  const files = await FilesetResolver.forVisionTasks(BASE + 'wasm');
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath: BASE + 'pose_landmarker_lite.task', delegate },
    runningMode: mode || 'VIDEO', numPoses: 1,
    minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5
  });
  let lm;
  try { lm = await PoseLandmarker.createFromOptions(files, opts('GPU')); }
  catch (e) { lm = await PoseLandmarker.createFromOptions(files, opts('CPU')); }
  return {
    video(v, t) { const r = lm.detectForVideo(v, t); return r && r.landmarks && r.landmarks[0] ? r.landmarks[0] : null; },
    image(img) { const r = lm.detect(img); return r && r.landmarks && r.landmarks[0] ? r.landmarks[0] : null; },
    close() { try { lm.close(); } catch (e) {} }
  };
}

/* anchor points for every part, built from the landmarks (person's own left/right) */
const R = { head: .62, neck: .36, shoulder: .36, chest: .46, abdomen: .5, elbow: .32, wrist: .3, hand: .32, hip: .4, thigh: .46, knee: .36, shin: .4, ankle: .3, foot: .34 };
function P(l, i, W, H) { const p = l[i]; return p ? { x: p.x * W, y: p.y * H, v: p.visibility == null ? 1 : p.visibility } : null; }
function mid(a, b, t) { t = t == null ? .5 : t; return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, v: Math.min(a.v, b.v) }; }

export function anchors(l, W, H) {
  const g = (i) => P(l, i, W, H);
  const sL = g(11), sR = g(12), hL = g(23), hR = g(24);
  if (!sL || !sR) return null;
  const S = Math.hypot(sL.x - sR.x, sL.y - sR.y) || 1;
  const sM = mid(sL, sR), hM = hL && hR ? mid(hL, hR) : { x: sM.x, y: sM.y + 1.6 * S, v: 0 };
  const nose = g(0), eL = g(7), eR = g(8);
  const A = [];
  const add = (part, side, p, arm) => { if (p && p.v > 0.4) A.push({ part, side, x: p.x, y: p.y, arm }); };
  if (nose) add('head', '', { x: (nose.x + (eL ? eL.x : nose.x) + (eR ? eR.x : nose.x)) / 3, y: Math.min(nose.y, eL ? eL.y : nose.y) - 0.18 * S, v: nose.v });
  if (nose) add('neck', '', mid(sM, nose, 0.35));
  add('shoulder', 'L', sL, 'L'); add('shoulder', 'R', sR, 'R');
  add('chest', '', { x: sM.x, y: sM.y + 0.38 * S, v: sM.v });
  add('abdomen', '', mid(sM, hM, 0.68));
  [['L', 13, 15, 17, 21], ['R', 14, 16, 18, 22]].forEach(([s, el, wr, pk, th]) => {
    add('elbow', s, g(el), s); add('wrist', s, g(wr), s);
    const a = g(pk), b = g(th); if (a && b) add('hand', s, mid(a, b), s);
  });
  [['L', 23, 25, 27, 31], ['R', 24, 26, 28, 32]].forEach(([s, hp, kn, an, ft]) => {
    const H0 = g(hp), K = g(kn), An = g(an), F = g(ft);
    add('hip', s, H0); if (H0 && K) add('thigh', s, mid(H0, K, 0.45));
    add('knee', s, K); if (K && An) add('shin', s, mid(K, An, 0.5));
    add('ankle', s, An); add('foot', s, F);
  });
  return { A, S };
}

/* which part is a fingertip on? the closest anchor, scaled by that part's size */
export function pointing(l, W, H) {
  const an = anchors(l, W, H); if (!an) return null;
  let best = null;
  [['L', 19], ['R', 20]].forEach(([hand, i]) => {
    const tip = P(l, i, W, H); if (!tip || tip.v < 0.5) return;
    an.A.forEach((a) => {
      if (a.arm === hand) return;                       /* not your own pointing arm */
      if (a.part === 'shoulder' && a.side === hand) return;
      const d = Math.hypot(tip.x - a.x, tip.y - a.y) / (R[a.part] * an.S);
      if (d < 1 && (!best || d < best.score)) best = { part: a.part, side: a.side, score: d, tip: { x: tip.x, y: tip.y }, at: { x: a.x, y: a.y } };
    });
  });
  return best;
}

const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [27, 31], [28, 32], [15, 19], [16, 20]];
/* the skeleton, the fingertips and the part being touched, drawn over the video */
export function draw(ctx, l, W, H, hit, mirror, t) {
  ctx.clearRect(0, 0, W, H);
  if (!l) return;
  ctx.save();
  if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, W / 260);
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  BONES.forEach(([a, b]) => {
    const p = l[a], q = l[b]; if (!p || !q || (p.visibility || 1) < .4 || (q.visibility || 1) < .4) return;
    ctx.beginPath(); ctx.moveTo(p.x * W, p.y * H); ctx.lineTo(q.x * W, q.y * H); ctx.stroke();
  });
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach((i) => { const p = l[i]; if (p && (p.visibility || 1) > .4) { ctx.beginPath(); ctx.arc(p.x * W, p.y * H, W / 170, 0, 7); ctx.fill(); } });
  [19, 20].forEach((i) => { const p = l[i]; if (p && (p.visibility || 1) > .5) { ctx.fillStyle = '#8DB6E2'; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, W / 110, 0, 7); ctx.fill(); } });
  if (hit) {
    const r = W / 22 * (1 + 0.12 * Math.sin(t / 160));
    const g = ctx.createRadialGradient(hit.at.x, hit.at.y, 0, hit.at.x, hit.at.y, r * 1.8);
    g.addColorStop(0, 'rgba(224,98,106,.55)'); g.addColorStop(1, 'rgba(224,98,106,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hit.at.x, hit.at.y, r * 1.8, 0, 7); ctx.fill();
    ctx.strokeStyle = '#E0626A'; ctx.lineWidth = Math.max(2.5, W / 200);
    ctx.beginPath(); ctx.arc(hit.at.x, hit.at.y, r, 0, 7); ctx.stroke();
  }
  ctx.restore();
}

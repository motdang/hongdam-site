// shop.js — the front page, category pages and Buy page on hongdam.net (her ask 2026-10-23).
// Page data: <script type="application/json" id="shop"> written by tools/build_shop.py.
// Prices on the page are the last build's; this reads today's from /api/services, /api/php,
// /api/github and /api/bots. The Buy page posts to /api/buy, which works the price out again.
import { promptPayPayload } from '/pay/promptpay.js'
import { qrToSvg } from '/pay/qr.js'
// ฿ / $ / €: every .amt on the page shows in the reader's currency (her ask 2026-10-24); cur.js adds the switch.
import { amtH, setAmt, cur as payCur } from '/assets/cur.js'

const D = JSON.parse(document.getElementById('shop').textContent)
// The card list (names, prices, options, search words) is one file per language, shared by every page.
const cardsP = fetch(D.cardsUrl).then((r) => r.json()).catch(() => [])
const T = D.ui
const $ = (s, r = document) => r.querySelector(s)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const fmt = (n, cur = 'THB') => (cur === 'USD' ? 'US$' : '฿') + Number(n).toLocaleString('en-US')
// A price in its mark (her ask 2026-10-24): a flag before it, US$ and € in their own colours (shop.css .amt);
// amtH writes it in the reader's currency (cur.js).
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) } catch { return null } }

// Doodle dingbats: core.js, then the glyphs of this page's group (tools/dingbats.mjs). Words and buttons work before they arrive.
const loaded = {}
const script = (src) => loaded[src] || (loaded[src] = new Promise((ok, no) => {
  const s = document.createElement('script'); s.src = src; s.async = false; s.onload = ok; s.onerror = no; document.head.appendChild(s)
}))
async function glyphs(...groups) {
  try {
    if (D.db) { await script(D.db.core); await Promise.all(groups.filter((g) => g && D.db.groups[g]).map((g) => script(D.db.groups[g]))) }
  } catch { /* the lines still ride, with empty stops */ }
  lines()
}

// A job is a line with stops; when it comes into view the swan rides it and each stop plays as the swan reaches it.
const calm = matchMedia('(prefers-reduced-motion: reduce)')
const dbTag = (g, play = 'still') => `<doodle-dingbat class="db" name="${esc(g)}" play="${play}" aria-hidden="true"></doodle-dingbat>`
const jobHtml = (stops, o = {}) => `<div class="job${o.cls ? ' ' + o.cls : ''}"${o.to != null ? ` style="--to:${o.to}"` : ''}${o.caps ? (o.hide ? ' aria-hidden="true"' : '') : ` role="img" aria-label="${esc(stops.map((g) => D.glyphs[g] || g).join(', '))}"`}><ol>` +
  stops.map((g, i) => `<li class="stop">${dbTag(g)}${o.caps ? `<span class="cap">${o.caps[i]}</span>` : ''}</li>`).join('') +
  `</ol><span class="rider">${dbTag('hongsa-stand', 'loop')}</span></div>`
// What the swans do (her ask 2026-10-24: "more variety in what they do, and interact with each other ... and with
// the icons"). The swan goes stop by stop. At some stops it does something to the picture above it and the picture
// answers: [the swan's move, the picture's answer, when they touch as a part of the move]. A line walked to its end
// ends one of four ways: alone, it honks and the nearest resting swan on another line honks back; it rears and
// flaps; a mate waits at the end and their necks make a heart; or Dam follows, runs ahead and is nuzzled.
// Picked from the line's name, so a card does the same each visit and the next card something else.
const MOVES = [['peck', 'poke', 0.34], ['hop', 'bump', 0.42], ['flap', 'sway', 0.22], ['honk', 'startle', 0.28], ['bow', 'bow', 0.3], ['look', 'wink', 0.3]]
// afloat (a line that is water): [what it does, the picture's answer, when, seconds]
const WMOVES = [['dip', 'bow', 0.3, 2.2], ['rear', 'sway', 0.3, 1.8], ['honk', 'startle', 0.28, 1.5], ['look', 'wink', 0.3, 1.6]]
const ENDS = ['honk', 'honk', 'flap', 'mate', 'mate', 'dam', 'dam']
// a browser holding a bundle from before these moves has only hongsa-walk and hongsa-stand: it gets the plain walk
const has = (n) => !!(window.Dingbats && window.Dingbats.info(n))
const loopMs = (n) => Math.round(window.Dingbats.info(n).loop * 1000)
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms))
const rngOf = (key) => {
  let a = [...String(key)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
// swap what a swan (or Dam) is drawing; 'once' plays a move from its start and leaves it standing
function pose(el, name, play = 'loop') {
  if (!el || !has(name)) return false
  if (play !== 'once' && el.getAttribute('name') === name && el.getAttribute('play') === play) return true
  el.setAttribute('play', play); el.setAttribute('name', name)
  return true
}
// where a rider stands: at a share of the line, less an offset
const spot = (f, less = '0rem') => `calc((100% - var(--rw)) * ${f} - ${less})`
// a picture's answer to the swan: a CSS animation on the stop (shop.css .fx-…)
function fx(stop, kind) {
  stop.classList.remove(...MOVES.map((m) => 'fx-' + m[1]))
  void stop.offsetWidth
  stop.classList.add('fx-' + kind)
}
// Swans resting at the ends of their lines, so one can answer another: a honk at the end of a line, or a tap on
// a resting swan, and the nearest one on the screen honks back. One afloat answers with its own tap: looks, honks, flaps.
const resting = new Set()
function rest(el, water) {
  if (!el) return
  pose(el, water ? 'hongsa-float' : 'hongsa-idle')
  if (resting.has(el)) return
  resting.add(el); if (water) el.dataset.water = 1
  el.addEventListener('click', () => answer(el))
}
function answer(from) {
  const r0 = from.getBoundingClientRect()
  let best = null, bd = Infinity
  for (const el of resting) {
    if (!el.isConnected) { resting.delete(el); continue }
    if (el === from || el.dataset.busy) continue
    const r = el.getBoundingClientRect()
    if (r.bottom < 0 || r.top > innerHeight || !r.width) continue
    const d = Math.hypot(r.left - r0.left, r.top - r0.top)
    if (d < bd) { bd = d; best = el }
  }
  if (!best || !has('hongsa-honk')) return
  best.dataset.busy = 1
  setTimeout(() => {
    if (best.dataset.water) { if (best.__db) best.__db.onTap(); setTimeout(() => delete best.dataset.busy, 1600); return }
    pose(best, 'hongsa-honk', 'once'); setTimeout(() => { pose(best, 'hongsa-idle'); delete best.dataset.busy }, loopMs('hongsa-honk'))
  }, 650)
}
const lineKey = (job, stops) => { const c = job.closest('.card'); return (c && c.id) || job.style.viewTransitionName || stops.map((s) => s.querySelector('doodle-dingbat')?.getAttribute('name')).join('-') }

// ---------------------------------------------------------------- bodies in motion
// Her word 2026-10-24: "timeline swans somewhat improved, but still need to be more lifelike and follow physics better.
// Walking or swimming or flying." Each leg of the way is worked out before it starts: how the speed builds and falls,
// where each foot lands (a planted foot stays put until it lifts, so the body moves only as far as its steps carry it),
// when a paddle stroke pushes and the swan glides, the run and wingbeats that lift it, the flare and the feet that land
// it. The drawing (doodle-dingbats lanna.js hongsa-go, duckling-go) is posed from that every frame. Lengths are in a
// drawing's units, 100 to its height.
const cl = (v, a, b) => (v < a ? a : v > b ? b : v)
const sm = (u) => { u = cl(u, 0, 1); return u * u * (3 - 2 * u) }
const sg = (x, a, b) => cl((x - a) / (b - a), 0, 1)
const bp = (u) => (u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u))
const TAU = 2 * Math.PI
// a body's centre in its box, and where its feet stand from that centre (lanna.js SW_FN, SW_FF)
const SW = { cx: 54, RN: -1, RF: -11, name: 'hongsa-go' }, DAM = { cx: 46, RN: 0, RF: 0, name: 'duckling-go' }

// Footfalls from feet at n0, f0 (the body at X0) to standing at X1, each step about g0 long. all[i] = [0 near | 1 far, x]:
// all[0] the foot behind, all[1] the one in front, then one per step. XB[k]: where the body is when footfall k + 1 lands.
// w(x), when given, is the step's length there against the average: steps run longer where it goes faster.
function footPlan(n0, f0, X0, X1, g0, B, w) {
  const rear = n0 < f0 ? 0 : 1, all = [[rear, rear ? f0 : n0], [1 - rear, rear ? n0 : f0]], p0 = all[1][1], mid = -(B.RN + B.RF) / 2
  let best = null
  for (let K = 1; K <= 90; K++) {
    const last = K % 2 ? rear : 1 - rear, pL = X1 + (last ? B.RF : B.RN), pP = X1 + (last ? B.RN : B.RF)
    const g = K > 1 ? (pP - p0) / (K - 1) : 0
    if (K === 1 ? Math.abs(p0 - pP) > 0.5 : g < 2) continue
    const from = K === 1 ? all[0][1] : K === 2 ? p0 : pP - g
    if (pL - from < 0.5) continue
    const sc = Math.abs((K > 1 ? g : pL - from) - g0)
    if (!best || sc < best.sc) best = { sc, K, g, pL, pP, last }
  }
  if (!best) return null
  let at = (k) => p0 + k * best.g
  if (w && best.K > 2) {   // the same count of steps, spaced by w
    const N = 64, xs = [], cum = [0]
    for (let i = 0; i <= N; i++) xs.push(p0 + (best.pP - p0) * i / N)
    for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + (xs[i] - xs[i - 1]) / Math.max(0.3, w((xs[i] + xs[i - 1]) / 2)))
    at = (k) => { const T = cum[N] * k / (best.K - 1); let i = 1; while (i < N && cum[i] < T) i++; return xs[i - 1] + (xs[i] - xs[i - 1]) * cl((T - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1), 0, 1) }
  }
  for (let k = 1; k < best.K; k++) all.push([k % 2 ? rear : 1 - rear, at(k)])
  all.push([best.last, best.pL])
  const XB = [X0]
  for (let k = 2; k < all.length; k++) XB.push((all[k][1] + all[k - 1][1]) / 2 + mid)
  XB[XB.length - 1] = X1
  return { all, XB }
}
// footfalls for a take-off run: from standing, the steps open out as it gathers speed; xlo where the last foot leaves
function runPlan(d, g0, B) {
  const all = [[1, B.RF], [0, B.RN]], mid = -(B.RN + B.RF) / 2
  let p = B.RN, foot = 1
  while (p < d) { p += g0 + 22 * Math.min(1, p / d); all.push([foot, p]); foot = 1 - foot }
  const XB = [0]
  for (let k = 2; k < all.length; k++) XB.push((all[k][1] + all[k - 1][1]) / 2 + mid)
  return { all, XB, xlo: XB[XB.length - 1] + 6 }
}
// where both feet are with the body at X: the one standing, and the one swinging from where it was to where it lands
function feetAt(F, X, lift) {
  const { all, XB } = F
  let k = 0
  while (k < XB.length - 2 && X > XB[k + 1]) k++
  const v = cl((X - XB[k]) / ((XB[k + 1] - XB[k]) || 1), 0, 1), st = all[k + 1], sw = all[k + 2], from = all[k][1], out = []
  // her word 2026-10-24: "flappy pink/red feet". The planted foot slaps down wide and settles; the lifted one folds,
  // hangs toes down and flops as it swings, and opens flat again to land
  out[st[0]] = [st[1] - X, 0, 0, 1 + 0.25 * (1 - sm(sg(v, 0, 0.3)))]
  const len = sw[1] - from, b = bp(v)
  out[sw[0]] = [from + len * sm(v) - X, lift * cl(Math.abs(len) / 20, 0.4, 1.5) * b, 1.25 * Math.pow(b, 0.8) * (1 - sm(sg(v, 0.75, 1))) + 0.25 * Math.sin(TAU * 2 * v) * b, 1 - 0.85 * b]
  return { ft: out, v, k, side: st[0] ? -1 : 1 }
}
// The pace it wants at x on a leg of D: Vs, one for each stretch of the leg in turn, blended where they meet (her word
// 2026-10-24: "Should go at different speeds, even on their own trip").
const paceAt = (Vs, x, D) => { const n = Vs.length, f = x / D * n - 0.5, i = cl(Math.floor(f), 0, n - 1), j = Math.min(n - 1, i + 1); return f <= 0 ? Vs[0] : f >= n - 1 ? Vs[n - 1] : Vs[i] + (Vs[j] - Vs[i]) * sm(f - i) }
// on foot: speed builds from a stand (A, units/s²), follows the pace it wants, and brakes (B) to stop at D;
// [t, x, v, a] every 1/120 s, and vAt(x)
function drive(D, Vs, A, B) {
  const R = [], dt = 1 / 120
  let x = 0, v = 0, t = 0
  for (let k = 0; k < 6000; k++) {
    const vt = Math.max(Math.min(paceAt(Vs, x, D), Math.sqrt(2 * B * Math.max(0, D - x))), D - x > 0.5 ? 5 : 0), a = cl((vt - v) / 0.2, -1.5 * B, A)
    R.push([t, x, v, a])
    v = Math.max(0, v + a * dt); x += v * dt; t += dt
    if (D - x < 0.3 && v < 10) break
  }
  const k = D / Math.max(0.01, x); R.forEach((r) => { r[1] *= k; r[2] *= k; r[3] *= k }); R.push([t, D, 0, 0])
  const vAt = (X) => { let lo = 0, hi = R.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (R[m][1] < X) lo = m; else hi = m } return R[lo][2] }
  return { T: t, at: (tt) => samp(R, tt), vAt }
}
const samp = (R, t) => { const f = t * 120, i = cl(Math.floor(f), 0, R.length - 2), u = cl(f - i, 0, 1), A = R[i], B = R[i + 1] || A; return A.map((a, j) => a + (B[j] - a) * u) }

// walking: the waddle rolls it onto each foot in turn, lifts it over the foot, wags its tail and nods its head; its
// steps run longer and quicker as it speeds up; hurrying, its neck reaches out and its wings half open
function walkLeg(D, B, o) {
  const P = drive(D, o.Vs, o.A || 220, o.B || 160), vm = o.Vs.reduce((a, b) => a + b, 0) / o.Vs.length
  const F = footPlan(B.RN, B.RF, 0, D, o.g0 * Math.pow(vm / 60, 0.35), B, (x) => Math.pow(Math.max(15, P.vAt(x)) / vm, 0.4))
  return { T: P.T, at(t) {
    const [, x, v, a] = P.at(t), f = F && feetAt(F, x, o.lift), hurry = o.hurry ? cl((v - 75) / 35, 0, 1) : 0, b = f ? bp(f.v) : 0
    return { x, v, step: f ? f.k : 0, rig: { ft: f ? f.ft : null, bob: o.bob * b, roll: f ? o.roll * b * f.side : 0, tilt: 0.0006 * a, nod: f ? -0.8 * Math.sin(TAU * f.v) : 0,
      hurry, sway: f ? 0.12 * b * f.side - 0.0003 * a : 0 } }
  } }
}
// swimming: each paddle stroke pushes, the water drags (more the faster it goes), so it surges and slows between
// strokes; near the stop it stops paddling and glides in
// strokes, harder and quicker where it wants to go faster; slow strokes under the water, each a long push, so the feet
// move slower than the body (her word 2026-10-24)
function swimLeg(D, o) {
  const b = 1.4, c = 0.004, b2 = 4.5, dt = 1 / 120, R = []
  let x = 0, v = 0, ph = 0, t = 0, glide = false
  for (let i = 0; i < 6000; i++) {
    if (!glide && D - x <= Math.log(1 + c * v / b2) / c + 0.5) glide = true
    const V = paceAt(o.Vs, x, D), T0 = 2 * (b * V + c * V * V), f = o.f * Math.pow(V / o.V0, 0.6)
    const cs = Math.cos(TAU * ph), a = (glide ? 0 : T0 * cs * cs) - (glide ? b2 : b) * v - c * v * v
    R.push([t, x, v, a, ph])
    v = Math.max(0, v + a * dt); x += v * dt; ph += (glide ? 0.3 : f) * dt; t += dt
    if (glide && (v < 1.2 || x >= D)) break
  }
  const k = D / Math.max(1, x); R.forEach((r) => { r[1] *= k; r[2] *= k; r[3] *= k }); R.push([t, D, 0, 0, ph])
  return { T: t, at(tt) {
    const s = samp(R, tt)
    return { x: s[1], v: s[2], stroke: Math.floor(2 * s[4] + 0.25), rig: { w: 1, pad: s[4], v: s[2], tilt: 0.0005 * s[3], bob: 0.5 * Math.cos(TAU * 2 * s[4]), sway: 0.05 * Math.sin(TAU * s[4]) - 0.0002 * s[3] } }
  } }
}
// flying: a run with the wings beating hard (on water its feet slap the surface), off the ground once fast enough, low
// and level with the neck straight out, wings set high to glide down, feet forward to land; on land it runs on a few
// steps to a stop, on water it skis in on its feet and settles
function flyLeg(D, water, pace = 1) {
  const d1 = cl(0.28 * D, 70, 140), d3 = cl(0.17 * D, 45, 80), xtd = D - d3, run = runPlan(d1, water ? 13 : 15, SW), d2 = xtd - run.xlo
  const H = cl(0.07 * d2 + 12, 16, 30), Vto = 150, Vf = 230 * pace, Vl = 120, A1 = Vto * Vto / (2 * run.xlo), A3 = Vl * Vl / (2 * d3)
  const out = water ? null : footPlan(xtd + 15, xtd + 9, xtd, D, 22, SW), lo = feetAt(run, run.xlo, 6).ft
  const flareAt = (x) => sm(sg(x, xtd - 0.38 * d2, xtd - 0.08 * d2))
  const R = [], dt = 1 / 120
  let x = 0, v = 0, t = 0, ph = 0
  for (let i = 0; i < 6000; i++) {
    let a
    if (x < run.xlo) a = A1
    else if (x < xtd) a = (Vto + (Vf - Vto) * sm(sg(x, run.xlo, run.xlo + 0.35 * d2)) - (Vf - Vl) * sm(sg(x, xtd - 0.5 * d2, xtd)) - v) / 0.15
    else a = cl((Math.sqrt(2 * A3 * Math.max(0, D - x)) - v) / 0.05, -3 * A3, A3)
    R.push([t, x, v, a, ph])
    v = Math.max(0, v + a * dt); x += v * dt; t += dt; ph += (x < run.xlo ? 4.6 : 3.4) * (1 - flareAt(x)) * dt
    if (x >= D - 0.15 || (x > xtd && v < 1)) break
  }
  R.push([t, D, 0, 0, ph])
  return { T: t, xtd, at(tt) {
    const s = samp(R, tt), x = s[1], v = s[2], a = s[3]
    const fl = flareAt(x) * (1 - sm(sg(x, xtd + 4, xtd + 0.6 * d3)))
    const alt = H * sm(sg(x, run.xlo - 6, run.xlo + 0.45 * d2)) * (1 - sm(sg(x, xtd - 0.55 * d2, xtd)))
    const fly = sm(sg(x, 0.4 * d1, run.xlo + 20)) * (1 - sm(sg(x, xtd - 6, xtd + 25))), hurry = sm(sg(x, 0, 0.5 * d1)) * (1 - fly)
    const wo = sm(sg(x, 0, 30)) * (1 - sm(sg(x, xtd + 0.2 * d3, xtd + 0.8 * d3)))
    const beat = Math.cos(TAU * s[4]), we = (0.12 + 0.88 * beat) * (1 - fl) + (0.82 + 0.06 * Math.sin(TAU * 7 * tt)) * fl
    const tuck = sm(sg(x, run.xlo, run.xlo + 35)) * (1 - sm(sg(x, xtd - 0.42 * d2, xtd - 0.12 * d2)))
    let fwd = sm(sg(x, xtd - 0.32 * d2, xtd - 0.04 * d2)), ft = null, step = -1, bob = 1.6 * Math.sin(TAU * s[4]) * (1 - fl) * fly, w = 0, ski = 0
    if (x < run.xlo) { const f = feetAt(run, x, water ? 4 : 6); ft = f.ft; step = f.k; bob += 1.4 * bp(f.v) * (1 - hurry * 0.5) }
    else if (x < xtd || water) ft = lo.map((f) => [f[0], f[1] + alt, f[2], f[3]])
    else { const f = feetAt(out, x, 4); ft = f.ft; step = 100 + f.k }
    if (x >= xtd) fwd *= water ? 1 - sm(sg(x, xtd + 0.5 * d3, D)) : 1 - sm(sg(x, xtd, xtd + 18))
    if (water) { w = x < run.xlo ? 1 - sm(sg(x, 0, 0.7 * run.xlo)) : x >= xtd ? sm(sg(x, xtd, xtd + 0.6 * d3)) : 0; if (x >= xtd) { ski = 1 - sm(sg(x, xtd + 0.4 * d3, D)); ft = null } }
    return { x, v, step, ski, land: x >= xtd && x < xtd + 3, rig: { alt, fly, hurry, wo, we, wk: 1.12 - 0.16 * Math.max(0, Math.sin(TAU * s[4])) * (1 - fl), wsw: -0.15 * fl, tuck, fwd, ft, w, v,
      bob, tilt: x < run.xlo ? 0.08 * hurry + 0.0003 * a : x < xtd ? 0.02 - 0.32 * fl : 0.0005 * a - 0.32 * fl, sway: 0.06 * Math.sin(TAU * s[4]) * fly } }
  } }
}

// one swan or Dam on its line: its rider, its drawing, the ripples and splashes it has left (in px along the line)
function mover(job, rider, B, water) {
  const el = rider.querySelector('doodle-dingbat'), rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const u = () => (el.getBoundingClientRect().height || 32) / 100
  const cs = getComputedStyle(job), lw = parseFloat(cs.getPropertyValue('--line-w')) || 5, len = (v) => { v = String(v).trim(); return (parseFloat(v) || 0) * (v.endsWith('rem') ? rem : 1) }
  // the line's centre in the drawing's box, from how far the line and the rider stand off the job's foot
  const wy = () => 100 - (len(cs.getPropertyValue('--lineY')) - (parseFloat(getComputedStyle(rider).bottom) || 0)) / u()
  return { job, rider, el, B, water, rip: [], spl: [], L: rider.offsetLeft, u, wy, lw: () => lw / u(), t0: performance.now(), last: {} }
}
// draw a mover with the pose rig, adding what the water shows
function show(m, rig, now) {
  const u = m.u(), bx = m.L + m.B.cx * u
  m.rip = m.rip.filter((r) => now - r[1] < 1300); m.spl = m.spl.filter((r) => now - r[1] < 650)
  const R = Object.assign({ water: m.water ? 1 : 0, wy: m.wy(), lw: m.lw(), w: m.water ? 1 : 0 }, rig)
  R.rip = m.rip.map((r) => [(r[0] - bx) / u, (now - r[1]) / 1300])
  R.spl = m.spl.map((r) => [(r[0] - bx) / u, (now - r[1]) / 1000, r[2], r[3]])
  if (m.el.getAttribute('name') !== m.B.name) { m.el.setAttribute('play', 'still'); m.el.setAttribute('name', m.B.name) }
  if (m.el.__db && m.el.__db.puppet && m.el.__db.vis !== false) m.el.__db.puppet((now - m.t0) / 1000, R)   // drawn only on screen
}
// run a leg: the rider moves, the body is posed, ripples and splashes are left where they happen; onX hears where it is
function go(m, leg, onX) {
  const L0 = m.L, t0 = performance.now()
  m.last = {}
  return new Promise((ok) => {
    let prev = -1e9
    const tick = (now) => {
      if (!m.rider.isConnected) return ok(false)
      const tt = Math.min(leg.T, (now - t0) / 1000)
      if (now - prev < 31 && tt < leg.T) return requestAnimationFrame(tick)   // 30 frames a second, the rider and its pose together
      prev = now
      const f = leg.at(tt), u = m.u()
      m.L = L0 + f.x * u; m.rider.style.left = m.L + 'px'
      const bx = m.L + m.B.cx * u
      if (f.step != null && f.step !== m.last.step && f.step >= 0 && m.last.step != null && f.rig.ft) {   // a foot came down
        const ft = f.rig.ft.find((q) => q && q[1] === 0) || f.rig.ft[0]
        if (m.water && (f.rig.w || 0) < 0.9) { m.spl.push([bx + ft[0] * u, now, 0.7, 0]); m.rip.push([bx + ft[0] * u, now]) }
      }
      m.last.step = f.step
      if (f.stroke != null && f.stroke !== m.last.stroke) { if (m.last.stroke != null) m.rip.push([bx - 40 * u, now]); m.last.stroke = f.stroke }
      if (f.land && !m.last.land) { m.spl.push([bx + 14 * u, now, 1, m.water ? 0 : 1]); if (m.water) m.rip.push([bx + 10 * u, now]) }
      m.last.land = f.land
      if (f.ski && now - (m.last.ski || 0) > 70) { m.spl.push([bx + 18 * u, now, 0.5 + 0.5 * f.ski, 0]); m.rip.push([bx + 6 * u, now]); m.last.ski = now }
      if (onX) onX(m.L)
      show(m, f.rig, now)
      if (tt >= leg.T) return ok(true)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}
// something it does where it is (afloat): act k over secs, with at(u) called as it goes
function act(m, k, secs, at) {
  const t0 = performance.now()
  return new Promise((ok) => {
    let prev = -1e9
    const tick = (now) => {
      if (!m.rider.isConnected) return ok(false)
      const u = Math.min(1, (now - t0) / 1000 / secs)
      if (now - prev < 31 && u < 1) return requestAnimationFrame(tick)
      prev = now
      if (at) at(u)
      show(m, { w: 1, act: { k, u } }, now)
      if (u >= 1) return ok(true)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}
// a leg for a body over D units: flight if asked, else a swim or a walk. Its pace changes on the way: one to three
// stretches, each at a speed picked from R (a dawdle, a stroll, a trot, a hurry), times the swan's own pace
function legFor(m, D, kind, R, pace) {
  if (kind === 'fly') return flyLeg(D, m.water, 0.85 + 0.3 * R())
  const k = D > 150 ? 2 + (R() < 0.5 ? 1 : 0) : 1 + (R() < 0.7 ? 1 : 0), pick = (list) => Array.from({ length: k }, () => list[Math.floor(R() * list.length)] * pace)
  if (m.B === DAM) return m.water ? swimLeg(D, { Vs: pick([50, 70, 95]), f: 1.5, V0: 70 }) : walkLeg(D, DAM, { Vs: pick([32, 45, 60, 75]), g0: 9, A: 260, B: 200, lift: 5, bob: 2.6, roll: 0.15 })
  if (m.water) return swimLeg(D, { Vs: pick([55, 85, 115, 150]), f: 0.85, V0: 100 })
  return walkLeg(D, SW, { Vs: pick([30, 48, 68, 95, 120]), g0: 21, lift: 8, bob: 2.8, roll: 0.13, hurry: true })
}

async function ride(job) {
  const stops = [...job.querySelectorAll('.stop')], n = stops.length
  const to = parseFloat(getComputedStyle(job).getPropertyValue('--to')) || (job.style.getPropertyValue('--to') === '0' ? 0 : 1)
  const reach = Math.floor(to * (n - 1) + 1e-6), dur = 520 * Math.max(1, reach) + 300
  const rider = job.querySelector('.rider'), sw = rider && rider.querySelector('doodle-dingbat'), water = job.classList.contains('swim')
  const played = new Set()
  const play = (i) => {   // a picture plays as the swan reaches it; the end of the line plays its tap reaction, the job done
    const s = stops[i], g = s && s.querySelector('doodle-dingbat')
    if (!s || played.has(i)) return
    played.add(i); s.classList.add('hit')
    if (i === n - 1 && g && g.__db) g.__db.onTap()
    else if (g) g.setAttribute('play', 'once')
  }
  job.style.setProperty('--dur', dur + 'ms')
  if (calm.matches) { job.classList.add('go'); stops.slice(0, reach + 1).forEach((s) => s.classList.add('hit')); return }
  if (!sw || !has('hongsa-go') || !has('hongsa-idle') || !(sw.__db && sw.__db.puppet)) {   // the plain walk: it waddles along the line, then stands at its stop and looks round
    if (sw && reach > 0) { sw.setAttribute('name', 'hongsa-walk'); setTimeout(() => sw.setAttribute('name', 'hongsa-stand'), dur) }
    requestAnimationFrame(() => job.classList.add('go'))
    stops.slice(0, reach + 1).forEach((s, i) => setTimeout(() => play(i), reach ? i / reach * (dur - 300) + 150 : 150))
    return
  }
  const R = rngOf(lineKey(job, stops))
  const end = reach === n - 1 && n > 1 && !job.matches('.master, .track') ? ENDS[Math.floor(R() * ENDS.length)] : ''
  // the plan: a move at a stop, or going on past it; the last stop of a whole line belongs to its ending
  let prev = ''
  const plan = stops.slice(0, reach + 1).map((_, i) => {
    if (i === reach && end) return 'end'
    if (R() > 0.6) return null
    const list = water ? WMOVES : MOVES
    let m; do m = list[Math.floor(R() * list.length)]; while (m[0] === prev)
    prev = m[0]
    return m
  })
  const pace = 0.75 + 0.6 * R(), RD = rngOf('dam ' + lineKey(job, stops)), damPace = 0.8 + 0.4 * RD()   // each swan its own pace
  job.classList.add('riding', 'sim')
  job.dataset.end = end || 'stop'
  rider.style.left = spot(0)
  const S = mover(job, rider, SW, water)
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16, rw = rider.offsetWidth
  const stopL = (i) => (job.clientWidth - rw) * i / Math.max(1, n - 1)
  let mate = null, dam = null, damGo = Promise.resolve()
  if (end === 'mate') {
    rider.insertAdjacentHTML('afterend', `<span class="rider mate">${dbTag(water ? 'hongsa-float' : 'hongsa-stand', 'loop')}</span>`)
    mate = mover(job, rider.nextElementSibling, SW, water)
  }
  if (end === 'dam') {
    rider.insertAdjacentHTML('beforebegin', `<span class="rider dam" style="left:${spot(0, '1.5rem')}">${dbTag(water ? 'duckling-float' : 'duckling-wait', 'loop')}</span>`)
    dam = mover(job, rider.previousElementSibling, DAM, water)
  }
  // Dam sets off a moment after the swan, at its own pace, and gets there when it gets there
  const follow = (L1) => { const d = dam; damGo = damGo.then(async () => { await sleep(250); const D = (L1 - d.L) / d.u(); if (D > 1) await go(d, legFor(d, D, '', RD, damPace)); if (d.rider.isConnected) pose(d.el, water ? 'duckling-float' : 'duckling-wait') }) }
  requestAnimationFrame(() => job.classList.add('go'))
  show(S, {}, performance.now())
  const endL = end === 'mate' ? job.clientWidth - 2 * rw : end === 'dam' ? job.clientWidth - rw - 0.8 * rem : null
  // at a stop: its move and the picture's answer, or the picture plays as it is passed
  const atStop = async (j) => {
    const m = plan[j]
    if (m && water) { let hit = false; await act(S, m[0], m[3], (u) => { if (!hit && u >= m[2]) { hit = true; fx(stops[j], m[1]); play(j) } }); show(S, {}, performance.now()) }
    else if (m && pose(sw, 'hongsa-' + m[0], 'once')) {
      const L = loopMs('hongsa-' + m[0])
      await sleep(L * m[2]); fx(stops[j], m[1]); play(j); await sleep(L * (1 - m[2]) + 60)
      show(S, {}, performance.now())
    } else play(j)
  }
  let i = 0
  if (plan[0] !== 'end') await atStop(0)
  while (i < reach) {
    let j = i + 1
    while (j < reach && !plan[j]) j++
    const L1 = j === reach && endL != null ? endL : stopL(j), D = (L1 - S.L) / S.u()
    // a long way with nothing to stop for is flown, most times
    const kind = j - i >= 2 && D >= 330 && R() < 0.85 ? 'fly' : ''
    job.dataset.legs = ((job.dataset.legs || '') + ' ' + (kind || (water ? 'swim' : 'walk'))).trim()   // for the checks, as data-end
    if (dam) follow(j === reach ? job.clientWidth - 1.95 * rem : L1 - 1.5 * rem)
    let next = i + 1
    const ok = await go(S, legFor(S, D, kind, R, pace), (L) => { while (next < j && L >= stopL(next) - 2) { play(next); if (kind) fx(stops[next], 'sway'); next++ } })
    if (!ok) return
    i = j
    if (plan[j] === 'end') break
    await atStop(j)
    if (!job.isConnected) return
  }
  // the ending
  if (end === 'dam') await damGo   // Dam gets there
  if (!job.isConnected) return
  const at = { honk: 0.26, flap: 0.22, mate: 0.4, dam: 0.36 }[end]
  const done = () => { if (end === 'flap') fx(stops[n - 1], 'sway'); if (end === 'dam' && dam && dam.el.__db) dam.el.__db.onTap(); play(n - 1); if (end === 'honk') answer(sw) }
  if (end && water) {
    const k = { honk: 'honk', flap: 'rear', mate: 'court', dam: 'nuzzle' }[end], secs = { honk: 1.5, flap: 1.8, mate: 5, dam: 2.4 }[end]
    let hit = false
    await Promise.all([act(S, k, secs, (u) => { if (!hit && u >= at) { hit = true; done() } }), mate ? act(mate, k, secs) : null])
  } else if (end) {
    const E = { honk: 'hongsa-honk', flap: 'hongsa-flap', mate: 'hongsa-court', dam: 'hongsa-nuzzle' }[end]
    if (has(E)) {
      pose(sw, E, 'once')
      if (mate) pose(mate.el, E, 'once')
      const L = loopMs(E)
      await sleep(L * at); done(); await sleep(L * (1 - at))
    } else play(n - 1)
  } else play(reach)
  if (!job.isConnected) return
  // where they stand now, as shares of the line, so they stay put if the page is resized
  rider.style.left = end === 'mate' ? 'calc(100% - 2 * var(--rw))' : end === 'dam' ? 'calc(100% - var(--rw) - .8rem)' : spot(reach / Math.max(1, n - 1))
  if (dam) dam.rider.style.left = 'calc(100% - 1.95rem)'
  rest(sw, water)
  if (mate) rest(mate.el, water)
  if (dam) pose(dam.el, water ? 'duckling-float' : 'duckling-wait')
  // the job is done: the card's button points the way (its arrow steps forward twice)
  const btn = end && job.closest('.card')?.querySelector(':scope > .btn')
  if (btn) { btn.classList.add('nudge'); btn.addEventListener('animationend', () => btn.classList.remove('nudge'), { once: true }) }
}

// A picture's name and its place in the job, on hover or a tap (her ask 2026-10-24: "icons should have subtle tool
// tips"). A line with words under its pictures already says them.
const STEP = { en: 'Step {n} of {N}', th: 'ขั้นที่ {n} จาก {N}', my: 'အဆင့် {n} / {N}', zh: '第 {n} 步，共 {N} 步', de: 'Schritt {n} von {N}' }
function tips(job) {
  const stops = [...job.querySelectorAll('.stop')]
  if (!stops.length || job.querySelector('.cap')) return
  const said = T.step || STEP[D.lang] || STEP.en
  stops.forEach((s, i) => {
    const g = s.querySelector('doodle-dingbat'), nm = g && D.glyphs && D.glyphs[g.getAttribute('name')]
    if (nm) s.insertAdjacentHTML('beforeend', `<span class="tip" aria-hidden="true" data-n="${esc(nm)}"><small data-s="${esc(said.replace('{n}', i + 1).replace('{N}', stops.length))}"></small></span>`)
  })
  let shown = null, timer = 0
  job.addEventListener('click', (e) => {   // on a phone a tap shows it for a moment
    const s = e.target.closest('.stop')
    if (!s || !s.querySelector('.tip')) return
    if (shown) shown.classList.remove('tip-on')
    shown = s; s.classList.add('tip-on')
    clearTimeout(timer); timer = setTimeout(() => s.classList.remove('tip-on'), 2400)
  })
}
const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); ride(e.target) } }), { threshold: 0.55 }) : null
function lines(root = document) {
  root.querySelectorAll('.job:not([data-seen])').forEach((j) => { j.dataset.seen = 1; tips(j); way(j); if (io) io.observe(j); else ride(j) })
}
// Some lines are water (her word 2026-10-24: "Walking or swimming or flying"): the line is drawn over the swan as the
// water's surface and the swan swims it. Picked from the line's name, as its ending is.
function way(job) {
  if (job.matches('.master, .track') || !has('hongsa-float')) return
  const stops = [...job.querySelectorAll('.stop')]
  if (rngOf('way ' + lineKey(job, stops))() >= 0.4) return
  job.classList.add('swim')
  const g = job.querySelector('.rider > doodle-dingbat')
  if (g) g.setAttribute('name', 'hongsa-float')
}

// Language: a choice made by hand is kept; the English front page opens the phone's language once.
document.querySelectorAll('[data-setlang]').forEach((a) => a.addEventListener('click', () => store('hd-lang', a.dataset.setlang)))
if (D.front && D.lang === 'en' && !store('hd-lang')) {
  const want = (navigator.languages || [navigator.language || '']).map((x) => String(x).slice(0, 2).toLowerCase()).find((x) => D.langs.includes(x))
  if (want && want !== 'en') location.replace('/' + want + '/')
}

// Our work (front page): the Rotary cartoon lives on Google Drive. Its poster is a button; a press puts Drive's
// player in its place, so the page loads no Google script until someone wants the film.
document.querySelectorAll('.vid.drive').forEach((b) => b.addEventListener('click', () => {
  const f = document.createElement('iframe')
  f.src = b.dataset.src
  f.title = b.getAttribute('aria-label')
  f.allow = 'autoplay; fullscreen'
  f.allowFullscreen = true
  const box = document.createElement('div')
  box.className = 'vid'
  box.appendChild(f)
  b.replaceWith(box)
  f.focus()
}, { once: true }))
// one Mot Dang video plays at a time
document.querySelectorAll('.reels video').forEach((v) => v.addEventListener('play', () => {
  document.querySelectorAll('.reels video').forEach((o) => { if (o !== v) o.pause() })
}))

// Today's prices
const live = {}
// The walk's number for a price shown in cur, or undefined while the walk has none in that currency (functions/_shop.js walkNum).
const walkNum = (k, part, cur) => !k ? undefined : part === 'tail' ? (k.tail > 0 && (k.tail_unit || 'THB') === cur ? k.tail : undefined)
  : (k.cur || 'THB') === cur && (k.price ?? k.baht) > 0 ? (k.price ?? k.baht) : undefined
const walkOf = (id) => live.services && live.services[id]
function liveText(root = document) {
  root.querySelectorAll('[data-live]').forEach((e) => {
    const [a, id] = e.dataset.live.split('/'), k = live[a] && live[a][id]
    if (!k) return
    if (k.unit === '%') { e.textContent = k.price + '%'; return }
    const cur = e.dataset.cur || 'THB', v = walkNum(k, e.dataset.part, cur)
    if (v) e.textContent = fmt(v, cur)
  })
}
async function loadLive() {
  const apis = ['services', 'php', 'github', 'bots']
  await Promise.all(apis.map(async (a) => {
    try {
      const j = await (await fetch('/api/' + a)).json()
      live[a] = Object.fromEntries((j.kinds || []).map((k) => [k.id, k]))
    } catch { live[a] = {} }
  }))
  liveText()
  document.querySelectorAll('[data-min]').forEach((e) => {
    const ks = Object.values(live[e.dataset.min] || {}).filter((k) => k.baht > 0)
    if (ks.length) e.textContent = fmt(Math.min(...ks.map((k) => k.baht)))
  })
  ladders()
  if (buy) buy.redraw()
}

// The price ladder under a walking price: the steps it can take between its floor and ceiling, today's lit,
// this month's bookings as dots. Opens to one line on how prices move.
function ladders(root = document) {
  root.querySelectorAll('details.ladder[data-svc]').forEach((el) => {
    const k = live.services && live.services[el.dataset.svc]
    if (!k || !k.floor || !k.ceiling || !D.ladder) return
    const rungs = D.ladder.filter((v) => v >= k.floor && v <= k.ceiling), now = k.baht
    if (rungs.length < 2) return
    const bars = rungs.map((v, i) => `<i class="${v === now ? 'on' : v < now ? 'lo' : ''}" style="height:${28 + 72 * i / (rungs.length - 1)}%"></i>`).join('')
    const left = Math.max(0, (k.slots || 0) - (k.orders || 0))
    const dots = k.slots && k.slots <= 12 ? `<span class="slots" aria-hidden="true">${Array.from({ length: k.slots }, (_, i) => `<i class="${i < k.orders ? 'b' : ''}"></i>`).join('')}</span>` : ''
    // opened: the price now among its steps, lowest to highest, and why it moves
    el.innerHTML = `<summary><span class="bars" aria-hidden="true">${bars}</span>${dots}<span>${esc(T.slotsOpen.replace('{n}', left))}</span></summary>` +
      `<p><b>${esc(T.priceNow)} ${amtH(now)}</b> · ${esc(T.lo)} ${amtH(rungs[0])} · ${esc(T.hi)} ${amtH(rungs[rungs.length - 1])}</p><p>${esc(T.ladder)}</p>`
    el.hidden = false
  })
}

// Search, on any page that has the box: every language's words, whatever the page's language.
const cardHtml = (c) => `<li class="card" style="--line:var(--c-${esc(c.cat)})">${c.pic ? jobHtml(c.pic) : ''}<h3>${c.go ? `<a href="${esc(c.go)}">${esc(c.n)}</a>` : esc(c.n)}</h3><p class="price">${c.ph}</p><p class="l">${esc(c.l)}</p>` +
  (c.walk ? `<details class="ladder" data-svc="${esc(c.walk)}" hidden></details>` : '') +
  (c.go ? `<a class="btn" href="${esc(c.go)}">${esc(c.btn)}</a>` : '') + '</li>'
const q = $('#q')
if (q) {
  const out = $('#hits')
  const run = async () => {
    const cards = await cardsP
    const words = q.value.trim().toLowerCase().split(/\s+/).filter((w) => w.length > 1 || /[^\x00-\x7f]/.test(w))
    if (!words.length) { out.hidden = true; out.innerHTML = ''; return }
    const hits = cards.filter((c) => words.every((w) => c.kw.includes(w))).slice(0, 12)
    out.hidden = false
    out.innerHTML = hits.length ? hits.map(cardHtml).join('')
      : `<li class="card"><p>${esc(T.noresult)}</p><a class="btn" href="${esc(D.lineUrl)}">LINE</a></li>`
    ladders(out)
    glyphs(...new Set(hits.map((c) => c.cat)))
  }
  q.addEventListener('input', run)
  if (q.value) run()
}

// Pick → Pay → We start, the swan at where the buyer is (0 start, 0.5 paying, 1 started)
const howCap = (s) => { const i = s.indexOf(' '); return i > 0 ? `<b>${esc(s.slice(0, i))}</b> ${esc(s.slice(i + 1))}` : esc(s) }
const masterHtml = (to) => (D.master && D.master.length ? jobHtml(D.master.map((m) => m.db), { cls: 'master mini', to, caps: T.how.map(howCap) }) : '')

// The order tracker, /buy/?ref=HD-…: the job's line, and Ordered → Paid → Started → Done with the swan at the order's state.
async function track(root, ref, note = '') {
  let o
  try { o = await (await fetch('/api/buy/' + encodeURIComponent(ref))).json() } catch { o = { ok: false } }
  const card = o && o.ok && (await cardsP).find((c) => c.id === o.card)
  if (!card) { root.innerHTML = `<p>${esc(T.err.ref)}</p><p><a class="btn alt" href="${esc(D.lineUrl)}">${esc(T.msgUs)}</a></p>`; glyphs('front'); return }
  document.body.style.setProperty('--line', `var(--c-${card.cat})`)
  const at = { booked: 0, claimed: 0.5, paid: 1, started: 2, done: 3 }[o.state] || 0
  const said = { booked: T.tOrdered, claimed: T.tChecking, paid: T.tPaid, started: T.tStarted, done: T.tDone }
  const steps = D.track || []
  root.innerHTML = `<p class="kicker">${esc(T.trackH)} · <b>${esc(o.ref)}</b></p><h1>${esc(card.n)}</h1>` +
    (card.pic ? jobHtml(card.pic, { cls: 'big', caps: card.pic.map((g) => esc(D.glyphs[g] || g)), hide: true, to: o.state === 'done' ? 1 : o.state === 'started' ? 0.5 : 0 }) : '') +
    (note ? `<p class="note" role="alert">${esc(note)}</p>` : '') +
    `<p class="state" role="status">${esc(said[o.state] || T.tOrdered)}</p>` +
    (steps.length ? jobHtml(steps.map((s) => s.db), { cls: 'big track', to: at / (steps.length - 1), caps: [T.tOrdered, T.tPaid, T.tStarted, T.tDone].map(esc) }) : '') +
    `<p class="note">${esc(T.trackKeep)}</p><p><a class="btn alt" href="${esc(D.lineUrl)}">${esc(T.msgUs)} · ${esc(o.ref)}</a></p>`
  glyphs(card.cat)
}
// Back from PayPal's page (/buy/?ref=HD-…&pp=back&token=…): the server captures and checks it, then the tracker.
async function cardBack(root, P) {
  const ref = P.get('ref')
  history.replaceState(null, '', location.pathname + '?ref=' + encodeURIComponent(ref))
  if (P.get('pp') !== 'back') { await track(root, ref, T.cardCancel || ''); return }
  root.innerHTML = `<p class="state" role="status">${esc(T.cardBack || T.checking)}</p>`
  let r
  try { r = await (await fetch('/api/buy/card/done', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ref, token: P.get('token') || '' }) })).json() } catch { r = { ok: false, why: 'service' } }
  await track(root, ref, r.ok ? '' : (T.err[r.why] || T.err.paypal || T.err.service))
}
const trackLink = (ref) => `<p><a class="btn" href="${esc(location.pathname)}?ref=${encodeURIComponent(ref)}">${esc(T.trackH)} · ${esc(ref)}</a></p>`

// The Buy page
let buy = null
async function startBuy() {
  // only the Buy page (body.p-buy): the bots page has its own purchase section, also id="buy"
  const root = document.body.classList.contains('p-buy') && $('#buy')
  if (!root) return null
  const P = new URLSearchParams(location.search)
  if (P.get('ref') && P.get('pp')) { await cardBack(root, P); return null }
  if (P.get('ref')) { await track(root, P.get('ref')); return null }
  const card = (await cardsP).find((c) => c.id === P.get('c'))
  if (!card || card.act !== 'buy') { root.innerHTML = `<p>${esc(T.nocard)}</p><p><a class="btn" href="${esc(D.home)}">${esc(T.home)}</a></p>`; glyphs('front'); return null }
  document.body.style.setProperty('--line', `var(--c-${card.cat})`)
  let opt = card.opts.find((o) => o.id === P.get('o')) || card.opts[0]
  const base = (o) => {
    const p = o.price
    if (p.walk) return walkNum(walkOf(o.id), 'price', 'THB') || p.walk
    if (p.usd) return walkNum(walkOf(p.w), p.part, 'USD') ?? p.usd
    return walkNum(walkOf(p.w), p.part, 'THB') ?? p.fixed ?? 0
  }
  const totalOf = (o, n, add) => {
    const p = o.price, w = walkOf(p.w), a = addOn(o)
    let t = p.tier ? (walkNum(w, 'price', 'THB') ?? p.tier[0]) + Math.max(0, n - p.tier[1]) * (walkNum(w, 'tail', 'THB') ?? p.tier[2]) : base(o) * n
    if (add && a && !p.usd) t += (walkNum(walkOf(a.w), 'price', 'THB') ?? a.fixed) * (a.unit ? addN() : n)
    return t
  }
  const cur = (o) => (o.price.usd ? 'USD' : 'THB')
  const half = (t, c) => t >= (c === 'USD' ? 300 : 10000)
  root.innerHTML = `${masterHtml(0.5)}<h1>${esc(card.n)}</h1>
${card.pic ? jobHtml(card.pic, { cls: 'big', caps: card.pic.map((g) => esc(D.glyphs[g] || g)), hide: true }) : ''}<p class="lede">${esc(card.l)}</p>
<form id="bf">
${card.opts.length > 1 ? `<fieldset><legend>${esc(T.choose)}</legend>${card.opts.map((o) =>
    `<label class="opt"><input type="radio" name="opt" value="${esc(o.id)}"${o === opt ? ' checked' : ''}> <span>${esc(o.n)}</span> <b class="oprice" data-o="${esc(o.id)}">${o.ph}</b></label>`).join('')}</fieldset>` : ''}
<p id="odesc"></p>
<div class="qtyrow" hidden><span class="lab">${esc(T.qty)}</span>
 <button type="button" class="step" data-d="-1" aria-label="−">−</button><input name="qty" type="number" inputmode="numeric" min="1" value="1" aria-label="${esc(T.qty)}"><button type="button" class="step" data-d="1" aria-label="+">+</button>
 <span class="unit"></span></div>
${card.add ? `<label class="opt addon"><input type="checkbox" name="addon"> <span>${card.add.nh || esc(card.add.n)}</span></label>${card.add.unit ? `
<div class="qtyrow addq" hidden><span class="lab">${esc(T.qty)}</span><input name="addonQty" type="number" inputmode="numeric" min="1" max="${card.add.max || 8}" value="1" aria-label="${esc(card.add.unitMany || T.qty)}"> <span class="unit">${esc(card.add.unitMany || '')}</span></div>` : ''}` : ''}
<p class="tot"><span>${esc(T.total)}</span> <b id="total" class="amt"></b></p><p id="halfnote" class="note" hidden></p>
<label class="field">${esc(T.reach)}<input name="contact" required autocomplete="tel" maxlength="120"></label>
<label class="field">${esc(T.note)}<textarea name="note" rows="3" maxlength="600"></textarea></label>
<p class="note">${esc(T.payMethods)}</p>
<button class="btn big" type="submit">${esc(T.next)}</button>
<p id="bmsg" role="status"></p>
</form><div id="pay" hidden></div>`
  const f = $('#bf', root), qty = f.elements.qty
  // The add-on, when this option takes it; an add-on with a unit (hours of haggling) has its own count.
  const addOn = (o) => (card.add && (!card.add.for || card.add.for.includes(o.id)) ? card.add : null)
  const addN = () => Math.max(1, Math.min(card.add.max || 8, parseInt(f.elements.addonQty.value, 10) || 1))
  const n = () => (opt.unit ? Math.max(1, Math.min(opt.max || 99, parseInt(qty.value, 10) || 1)) : 1)
  function redraw() {
    $('#odesc', root).textContent = opt.d || ''
    $('.qtyrow', root).hidden = !opt.unit
    const ad = $('.addon', root), on = !!addOn(opt)
    if (ad) { ad.hidden = !on; if (!on) f.elements.addon.checked = false }
    if ($('.addq', root)) $('.addq', root).hidden = !(on && f.elements.addon.checked)
    if (opt.unit) { qty.max = opt.max || 99; $('.unit', root).textContent = opt.unitMany || '' }
    card.opts.forEach((o) => { const e = $(`.oprice[data-o="${o.id}"]`, root); if (e && o.price.walk) e.innerHTML = amtH(base(o)) + esc(o.per || '') })
    liveText(root)
    const c = cur(opt), t = totalOf(opt, n(), f.elements.addon && f.elements.addon.checked)
    setAmt($('#total', root), t, c)
    const h = $('#halfnote', root)
    h.hidden = !half(t, c)
    if (half(t, c)) h.innerHTML = esc(T.half).replace('{now}', amtH(Math.ceil(t / 2), c))
  }
  f.addEventListener('change', (e) => {
    if (e.target.name === 'opt') opt = card.opts.find((o) => o.id === e.target.value) || opt
    redraw()
  })
  f.addEventListener('input', redraw)
  root.addEventListener('click', (e) => {
    const b = e.target.closest('.step'); if (!b) return
    qty.value = Math.max(1, Math.min(opt.max || 99, (parseInt(qty.value, 10) || 1) + Number(b.dataset.d))); redraw()
  })
  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    const m = $('#bmsg', root), contact = f.elements.contact.value.trim()
    if (contact.length < 3) { m.textContent = T.err.contact; f.elements.contact.focus(); return }
    m.textContent = T.sending
    let j
    try {
      j = await (await fetch('/api/buy', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        card: card.id, opt: opt.id, qty: n(), addon: f.elements.addon && f.elements.addon.checked ? (card.add.unit ? addN() : true) : false, contact, note: f.elements.note.value, lang: D.lang, pay: payCur() }) })).json()
    } catch { j = { ok: false, why: 'service' } }
    if (!j.ok) { m.textContent = (j.retry ? T.err.service : T.err[j.why]) || T.err.service; return }
    m.textContent = ''
    f.hidden = true
    pay(j)
  })
  redraw()
  glyphs(card.cat)
  return { redraw }
}

// The order's amount in the currency the buyer picked (j.show), kept as it is if they flip the switch afterwards.
// PromptPay is in baht (j.pay.thb, converted when the price is in US$ or the buyer pays in $ or €); PayPal asks for
// the amount in the buyer's currency. Paying in baht puts PromptPay first; in $ or €, PayPal and Wise first.
function pay(j) {
  const box = $('#pay')
  box.hidden = false
  const s = j.show || { cur: j.cur, due: j.due }, thb = j.pay.thb ?? (j.cur === 'THB' ? j.due : null)
  const amount = amtH(s.due, s.cur, true)
  const qr = j.pay.promptpay && thb ? qrToSvg(promptPayPayload({ payeeId: j.pay.promptpay, satang: thb * 100, merchantName: 'NaNoBotCo', ref: j.ref }),
    { ecl: 'M', border: 4, scale: 6, dark: '#000', light: '#fff', title: `PromptPay ${thb} THB` }) : ''
  const pp = qr ? `<section class="way"><h3>${esc(T.pp)}</h3>${s.cur !== 'THB' ? `<p class="tot"><b>${amtH(thb, 'THB', true)}</b></p>` : ''}<div class="qr">${qr}</div><p>${esc(T.scan)}</p>
<form id="sf" hidden><label class="field">${esc(T.slip)}<input type="file" name="slip" accept="image/*" required></label><button class="btn" type="submit">${esc(T.slipBtn)}</button></form>
<p id="smsg" role="status"></p></section>` : ''
  const away = `<section class="way"><h3>PayPal · Wise</h3><p>${esc(T.abroad).replace(/\s*[(（][^)）]*\{usd\}[^)）]*[)）]/, '').replace('{amount}', amount).replace('{ref}', esc(j.ref))}</p>
<p><a class="btn" href="${esc(j.pay.paypal)}" target="_blank" rel="noopener">PayPal</a> <a class="btn" href="${esc(j.pay.wise)}" target="_blank" rel="noopener">Wise</a></p>
<p><button class="btn alt" type="button" data-claim="paypal">${esc(T.ipaid)} PayPal</button> <button class="btn alt" type="button" data-claim="wise">${esc(T.ipaid)} Wise</button></p>
<p id="cmsg" role="status"></p></section>`
  // Card or PayPal on PayPal's page, shown once /api/buy says it is on; it opens in a tab of its own (opened on the
  // click, so no pop-up blocker stops it) and this page keeps the other ways.
  const card = T.cardH ? `<section class="way" id="cardway" hidden><h3>${esc(T.cardH)}</h3><p>${esc(T.cardNote)}</p>
<p><button class="btn big" type="button" id="cardbtn">${esc(T.cardBtn).replace('{amount}', amount)}</button></p><p id="kmsg" role="status"></p></section>` : ''
  box.innerHTML = `<h2>${esc(T.order)} ${esc(j.ref)}</h2>
<p class="tot"><span>${esc(j.half ? T.payHalf : T.payNow)}</span> <b>${amount}</b></p>
${s.cur === 'THB' ? pp + card + away : card + away + pp}
<p><a class="btn alt" href="${esc(D.lineUrl)}">${esc(T.msgUs)} · ${esc(j.ref)}</a></p>`
  fetch('/api/buy').then((r) => r.json()).then((s) => {
    const cw = $('#cardway')
    if (s.card && cw) {
      cw.hidden = false
      $('#cardbtn').addEventListener('click', async () => {
        const m = $('#kmsg'), w = window.open('', '_blank')
        if (w) w.opener = null
        m.textContent = T.sending
        let r
        try { r = await (await fetch('/api/buy/card', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ref: j.ref, cur: (j.show || j).cur }) })).json() } catch { r = { ok: false, why: 'service' } }
        if (!r.ok) { if (w) w.close(); m.textContent = T.err[r.why] || T.err.service; return }
        m.textContent = ''
        if (w) w.location.href = r.url; else location.href = r.url
      })
    }
    const sf = $('#sf'); if (!s.slip || !sf) return
    sf.hidden = false
    sf.addEventListener('submit', async (e) => {
      e.preventDefault()
      const m = $('#smsg'), file = sf.elements.slip.files[0]
      if (!file) { m.textContent = T.err.nofile; return }
      m.textContent = T.checking
      const fd = new FormData(); fd.append('ref', j.ref); fd.append('slip', file)
      let r
      try { r = await (await fetch('/api/buy/slip', { method: 'POST', body: fd })).json() } catch { r = { ok: false, why: 'service' } }
      m.textContent = r.ok ? `${T.paid} ${j.ref}` : (T.err[r.why] || T.err.unread)
      if (r.ok) { sf.hidden = true; box.querySelectorAll('[data-claim]').forEach((b) => { b.disabled = true }); box.insertAdjacentHTML('beforeend', trackLink(j.ref)) }
    })
  }).catch(() => {})
  box.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-claim]'); if (!b) return
    const m = $('#cmsg'); m.textContent = T.sending
    let r
    try { r = await (await fetch('/api/buy/claim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ref: j.ref, how: b.dataset.claim }) })).json() } catch { r = { ok: false } }
    m.textContent = r.ok ? `${T.claimed} ${j.ref}` : T.err.service
    if (r.ok && !box.querySelector('a[href*="?ref="]')) box.insertAdjacentHTML('beforeend', trackLink(j.ref))
  })
  box.scrollIntoView({ block: 'start' })
}

// The ask form: one contact box (email or LINE ID, phone) and what they need.
const af = $('#af')
if (af) af.addEventListener('submit', async (e) => {
  e.preventDefault()
  const m = $('#amsg'), c = af.elements.contact.value.trim(), what = af.elements.message.value.trim()
  if (c.length < 3) { m.textContent = T.err.contact; return }
  if (what.length < 2) { m.textContent = T.err.what; return }
  m.textContent = T.sending
  const email = /@/.test(c) ? c : '', line = email ? '' : c
  let r
  try { r = await (await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, line, message: what, service: 'Ask', website: af.elements.website.value, page: location.pathname }) })).json() } catch { r = { ok: false } }
  m.textContent = r.ok ? T.asked : (r.error || T.err.service)
  if (r.ok) af.reset()
})

// "How is this translation?" on the Burmese and Chinese pages (her word 2026-10-24); answers go to /api/rate.
const rf = $('#rate')
if (rf) {
  const send = async (score, text = '') => {
    rf.querySelectorAll('button').forEach((b) => { b.disabled = true })
    try { await fetch('/api/rate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ page: (location.pathname + location.search).slice(0, 200), lang: D.lang, score, text }) }) } catch { /* the thanks shows either way */ }
    rf.querySelector('div').hidden = true
    rf.querySelector('.thanks').hidden = false
  }
  rf.querySelector('[data-score="good"]').addEventListener('click', () => send('good'))
  rf.querySelector('[data-score="better"]').addEventListener('click', () => { rf.querySelector('div').hidden = false; rf.elements.text.focus() })
  rf.addEventListener('submit', (e) => { e.preventDefault(); send('better', rf.elements.text.value.trim()) })
}

if (D.group) glyphs(D.group)
startBuy().then((b) => { buy = b; loadLive() })

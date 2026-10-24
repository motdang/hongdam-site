// swan404.js — the 404 page on hongdam.net: the black swan swims the river (her ask 2026-10-24).
// Fly over what floats, dive under what flies. Easy at first; new things join the river as you go.
// Every picture is a doodle dingbat drawn by its own code (Dingbats.draw, core.js + group p-404, loaded by shop.js).
// A dingbat is drawn once per frame of its loop and kept as a sprite; the river and the splash are drawn here with
// the same pen. Units: the canvas is 100 units high; the river's surface is at WL.

const box = document.querySelector('[data-swan404]')
if (box) main(box)

function main(box) {
  box.hidden = false   // without scripts the page keeps its words and links, and no empty river
  const cv = box.querySelector('canvas'), ui = box.querySelector('.sw-ui'), go = box.querySelector('.sw-go')
  const say = box.querySelector('.sw-say'), hint = box.querySelector('.sw-hint'), tip = box.querySelector('.sw-tip')
  const ctx = cv.getContext('2d')
  const calm = matchMedia('(prefers-reduced-motion: reduce)')
  const dark = matchMedia('(prefers-color-scheme: dark)')
  const touch = matchMedia('(pointer: coarse)').matches
  const DEBUG = /[?&]swan=debug/.test(location.search), TEST = DEBUG || /[?&]swan=test/.test(location.search)
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) } catch { return null } }

  // ---------------------------------------------------------------- the world
  const WL = 64            // the river's surface, units from the top
  const SW = 34            // the swan's box height in units (its box is 120 × 100)
  const SX = 26            // the swan's body, units from the left
  const SK = SW / 100
  const GRAV = 150, FLAP = 90, FLAP2 = 78, DIVE = 1.0, HOLD = 2.4, HURT = 1.4, GRACE = 1.7
  const FLOWERS_PER_HEART = 25

  // Each kind: g the dingbat, size its box height in units, base the box y that sits on the river's surface
  // (for things in the air: the box y of its lowest point), hit circles [dx, dy, r] from (x, surface + y),
  // from the count of things passed at which it joins (at), how often (w), and how it moves.
  const KINDS = {
    lotus:     { g: 'lotus', size: 19, base: 68, at: 0, w: 3, flower: true, hit: [[0, -3, 6]] },
    krathong:  { g: 'krathong', size: 21, base: 74, at: 0, w: 4, hit: [[-3, -4, 4.2], [3, -4, 4.2], [0, -9, 2.5]] },
    coconut:   { g: 'coconut', size: 14, base: 66, at: 0, w: 3, hit: [[0, -4, 4.4]] },
    ngob:      { g: 'ngob', size: 18, base: 70, at: 4, w: 3, hit: [[-3, -2.5, 3.6], [3, -2.5, 3.6]] },
    durian:    { g: 'durian', size: 15, base: 70, at: 6, w: 3, hit: [[0, -5, 5]] },
    kratip:    { g: 'kratip', size: 15, base: 78, at: 9, w: 2, hit: [[0, -4, 4.4]] },
    frangipani:{ g: 'frangipani', size: 10, base: 70, at: 6, w: 2, flower: true, air: true, arc: true, hit: [[0, -3, 5]] },
    malai:     { g: 'phuang-malai', size: 13, base: 92, at: 24, w: 1, flower: 3, air: true, hover: -26, bob: 2, hit: [[0, -6, 5]] },
    lantern:   { g: 'lantern', size: 19, base: 88, at: 12, w: 4, air: true, hover: -14, bob: 1.6, hit: [[0, -6, 4.6], [0, -12, 4.6]], first: true },
    buffalo:   { g: 'buffalo', size: 22, base: 58, at: 20, w: 2, hit: [[-5, -2.5, 4.2], [4, -2.5, 4.2], [9, -4.5, 3.2]] },
    bosang:    { g: 'bo-sang', size: 19, base: 90, at: 20, w: 2, air: true, hover: -14, fall: 26, hit: [[0, -12, 6], [0, -5, 2]] },
    koi:       { g: 'koi', size: 14, base: 60, at: 32, w: 2, leap: 26, front: true, hit: [[0, -2, 3.8]] },
    swallow:   { g: 'swallow', size: 14, base: 70, at: 32, w: 2, air: true, hover: -16, fly: 16, flip: true, hit: [[0, -2, 4.2]] },
    naga:      { g: 'naga', size: 30, base: 80, at: 45, w: 2, rise: true, flip: true, hit: [[8, -2, 3.5], [0, -4, 3.5], [-5, -9, 3], [-11, -12, 3.5]] }
  }
  // the far bank: g, size, how often; cars drive the bank road
  const BANK = [
    { g: 'chedi', size: 24, w: 3 }, { g: 'tree', size: 22, w: 4 }, { g: 'spirit-house', size: 15, w: 2 },
    { g: 'elephant', size: 15, w: 1 }, { g: 'rooster', size: 9, w: 1 }, { g: 'soi-dog', size: 9, w: 1 },
    { g: 'tuk-tuk', size: 10, w: 2, drive: 9 }, { g: 'songthaew', size: 11, w: 2, drive: 7 }, { g: 'scooter', size: 9, w: 2, drive: 11 }
  ]
  const SKY = [{ g: 'cloud', size: 13, w: 3 }, { g: 'birds', size: 6, w: 1 }, { g: 'kite', size: 11, w: 1 }]
  const NEED = ['hongsa', 'heart', ...new Set([...Object.values(KINDS), ...BANK, ...SKY].map((k) => k.g)), 'sun', 'moon']

  // ---------------------------------------------------------------- words
  const T = {
    play: 'Play <span lang="th">เล่น</span>', again: 'Again <span lang="th">อีกครั้ง</span>', on: 'Go on <span lang="th">ต่อ</span>',
    hint: touch ? 'Tap the sky: fly · Tap the water: dive<br><span lang="th">แตะฟ้า: บิน · แตะน้ำ: ดำน้ำ</span>'
      : 'Space or ↑: fly · ↓: dive<br><span lang="th">บิน · ดำน้ำ</span>',
    dive: touch ? 'Tap the water: dive · <span lang="th">แตะน้ำ: ดำน้ำ</span>' : '↓ dive · <span lang="th">ดำน้ำ</span>',
    m: (n) => n.toLocaleString('en-US') + ' m', best: (n) => 'best ' + n.toLocaleString('en-US') + ' m'
  }

  // ---------------------------------------------------------------- drawing
  let D = null, look = 'riso', ink = '#121212', paper = '#F1EDE4', font = 'system-ui'
  let W = 0, H = 0, U = 1, DPR = 1, Wu = 100
  function theme() {
    const cs = getComputedStyle(document.documentElement)
    look = (cs.getPropertyValue('--db-look') || 'riso').trim() || 'riso'
    ink = (cs.getPropertyValue('--fg') || '#121212').trim()
    paper = (cs.getPropertyValue('--bg') || '#F1EDE4').trim()
    font = (cs.getPropertyValue('--font-d') || 'system-ui').trim()
  }

  // The river is the game's: a dingbat's own water (its wide 'sky' marks) is left out when it is drawn here.
  let DRY = false
  function dryPen() {
    let PP = null
    D.add('swan404-probe', { fam: 'swan404', draw(p) { PP = Object.getPrototypeOf(p) } })
    D.ops('swan404-probe')
    if (!PP || typeof PP.mark !== 'function' || PP.mark.__dry) return
    const mark = PP.mark
    PP.mark = function (subs, o) {
      if (DRY && o) {
        const q = typeof o === 'string' ? { fill: o } : o
        if (q.fill === 'sky' || q.ink === 'sky') {
          const m = this.m; let a = 1e9, b = -1e9
          for (const s of subs) for (const pt of s.p) { const x = m[0] * pt[0] + m[2] * pt[1] + m[4]; if (x < a) a = x; if (x > b) b = x }
          if (b - a > this.W * 0.6) return this
        }
      }
      return mark.call(this, subs, o)
    }
    PP.mark.__dry = true
  }

  // The river tile and a splash, in the same pen as the dingbats.
  function ownGlyphs() {
    const TAU = Math.PI * 2
    // the water itself: one sheet as wide as any river here, still; what moves is drawn on it
    D.add('swan404-water', {
      fam: 'swan404', loop: 1, still: 0, ratio: 8, about: 'the river\'s water, a still sheet',
      draw(p) {
        const top = []
        for (let x = 0; x <= 800; x += 4) top.push([x, 6 + 1.5 * Math.sin(TAU * x / 400 * 6)])
        p.path('M' + top.map((q) => q[0] + ' ' + q[1].toFixed(2)).join(' L') + ' L800 104 L0 104 Z', { fill: 'sky', line: false, alpha: dark.matches ? 0.26 : 0.42, wob: 0 })
      }
    })
    D.add('swan404-river', {
      fam: 'swan404', loop: 1, still: 0, ratio: 4, about: 'the river: its surface and ripples, one tile',
      draw(p) {
        const top = []
        for (let x = 0; x <= 400; x += 4) top.push([x, 6 + 1.5 * Math.sin(TAU * x / 400 * 6)])
        p.curve(top, { ink: 'sky', w: 0.9, cap: 'round', wob: 0.3 })
        const R = D.math.rng(404)
        for (let i = 0; i < 14; i++) {
          const x = 10 + R() * 360, y = 24 + R() * 64, L = 10 + R() * 16
          p.curve([[x, y], [x + L / 2, y - 1.2], [x + L, y]], { ink: 'sky', w: 0.5, alpha: 0.9 })
        }
      }
    })
    D.add('swan404-splash', {
      fam: 'swan404', loop: 1, still: 0.3, ratio: 1, about: 'a splash: drops thrown up and falling back, t the time since',
      draw(p, t) {
        if (t <= 0 || t >= 0.999) return
        for (let j = 0; j < 9; j++) {
          const r = D.math.rng(31 + j * 7)(), vx = (j - 4) * 9 * (0.6 + r), vy = 44 * (0.6 + 0.6 * r)
          p.dot(50 + vx * t, 80 - vy * t + 2.4 * vy * t * t, 3 * (1 - 0.6 * t), 'sky')
        }
        p.ellipse(50, 82, 10 + 34 * t, 2 + 4 * t, { ink: 'sky', w: 0.8, fill: false, alpha: 1 - t })
      }
    })
  }

  // Sprites: one canvas per glyph frame, kept until the theme or the size changes.
  const CACHE = new Map(), BOUNDS = new Map()
  let cacheBytes = 0
  const BYTES = 56e6
  function bounds(name, o) {
    const key = name + (o.dry ? '|d' : '') + (o.taps ? '|t' : '')
    if (BOUNDS.has(key)) return BOUNDS.get(key)
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
    const eat = (subs) => { if (subs) for (const s of subs) for (const q of s) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1] } }
    DRY = !!o.dry
    const ts = o.ts || [0, 0.13, 0.25, 0.38, 0.5, 0.63, 0.75, 0.88]
    for (const t of ts) for (const tap of o.taps ? [-1, 0.2, 0.4, 0.6, 0.8] : [-1]) {
      const r = D.ops(name, { t, tap, taps: 1, px: 96, look })
      for (const op of r.ops) { eat(op.subs); eat(op.polys); eat(op.clip) }
    }
    DRY = false
    if (x0 > x1) { x0 = 0; y0 = 0; x1 = 100; y1 = 100 }
    const b = [x0 - 6, y0 - 6, x1 + 6, y1 + 6]
    BOUNDS.set(key, b)
    return b
  }
  // name at t (0..1), tap (−1 or 0..1); size = box height in units. Returns { cv, ox, oy, cw, ch } in box units.
  // A frame not drawn yet costs about a millisecond (more on a phone): past BUDGET ms in one frame, the last
  // frame of the same glyph stands in until the next.
  let spent = 0
  const BUDGET = 4, LAST = new Map()
  function sprite(name, t, o = {}) {
    const tap = o.tap == null ? -1 : o.tap, boil = o.boil || 0
    const px = o.size * U, k = Math.min(px * DPR, o.cap || 200) / 100
    const fam = name + '|' + k.toFixed(3) + (o.dry ? '|d' : '') + (tap >= 0 ? '|t' : '')
    const key = fam + '|' + t.toFixed(4) + '|' + tap.toFixed(3) + '|' + boil
    let s = CACHE.get(key)
    if (s) { CACHE.delete(key); CACHE.set(key, s); LAST.set(fam, s); return s }
    if (spent > BUDGET && !o.now && LAST.has(fam)) return LAST.get(fam)
    const t0 = performance.now()
    const b = bounds(name, o)
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.ceil((b[2] - b[0]) * k)); c.height = Math.max(1, Math.ceil((b[3] - b[1]) * k))
    const x = c.getContext('2d', { willReadFrequently: true })   // a sprite never changes: kept in memory, not on the GPU, where big ones went missing
    DRY = !!o.dry
    try { D.draw(x, name, { x: -b[0] * k, y: -b[1] * k, size: 100 * k, t, tap, taps: 1, boil, look, ink, bg: paper, dpr: 1, px: Math.max(40, px) }) } finally { DRY = false }
    s = { cv: c, ox: b[0], oy: b[1], cw: c.width / k, ch: c.height / k }
    CACHE.set(key, s); LAST.set(fam, s); cacheBytes += c.width * c.height * 4
    spent += performance.now() - t0
    while (cacheBytes > BYTES && CACHE.size > 1) { const [k0, v0] = CACHE.entries().next().value; CACHE.delete(k0); cacheBytes -= v0.cv.width * v0.cv.height * 4 }
    return s
  }
  // draw a sprite with its box origin at (x, y) units; s = units per box unit; flip mirrors it
  function put(sp, x, y, s, o = {}) {
    const X = (x + sp.ox * s) * U, Y = (y + sp.oy * s) * U, w = sp.cw * s * U, h = sp.ch * s * U
    ctx.save()
    if (o.alpha != null) ctx.globalAlpha = o.alpha
    if (o.op) ctx.globalCompositeOperation = o.op
    if (o.flip) { const ax = (o.fx == null ? x : o.fx) * U; ctx.translate(ax, 0); ctx.scale(-1, 1); ctx.translate(-ax, 0) }
    ctx.drawImage(sp.cv, Math.round(X * DPR) / DPR, Math.round(Y * DPR) / DPR, w, h)
    ctx.restore()
  }
  const frac = (v) => v - Math.floor(v)
  const loopOf = (g) => (D.info(g) || {}).loop || 2
  // a looping dingbat at time `time`, quantised to F frames, boil following the frame
  function glyph(g, time, size, F = 8, o = {}) {
    const f = Math.floor(frac(time / loopOf(g) + (o.ph || 0)) * F)
    return sprite(g, f / F, { size, boil: f % 3, dry: o.dry, cap: o.cap })
  }

  // ---------------------------------------------------------------- the game
  const S = { mode: 'load', time: 0, x: 0, x0: 0, v: 34, n: 0, hearts: 3, flowers: 0, y: 0, vy: 0, pose: 'swim', diveT: 0, underT: 0, hold: false, hurtT: -1, graceT: 0, flaps: 0, splashT: -1, splashX: 0, tipT: 0, dead: 0 }
  let things = [], bank = [], sky = [], nextAt = 0, bankAt = 0, skyAt = 0, seen = {}
  let best = +(store('hd-swan404-best') || 0) || 0

  function reset() {
    Object.assign(S, { x0: S.x, score: 0, v: 32, n: 0, hearts: 3, flowers: 0, y: 0, vy: 0, pose: 'swim', diveT: 0, underT: 0, hold: false, hurtT: -1, graceT: 0, flaps: 0, splashT: -1, tipT: 0, dead: 0 })
    things = []; nextAt = S.x + SX + 3.2 * S.v; seen = {}   // the first is 3 s away; the river ahead fills at once
  }
  function scenery(fromX) {
    // fill the bank and the sky to the right edge; positions are in each layer's own scrolled space
    const R = Math.random
    while (bankAt < fromX * 0.35 + Wu + 30) {
      const b = pick(BANK, R)
      bank.push({ ...b, x: bankAt, ph: R(), dir: b.drive ? (R() < 0.5 ? 1 : -1) : 0, flip: R() < 0.5 })
      bankAt += b.size * 1.2 + 6 + R() * 22
    }
    while (skyAt < fromX * 0.1 + Wu + 30) {
      const s = pick(SKY, R)
      sky.push({ ...s, x: skyAt, y: s.g === 'kite' ? 10 + R() * 14 : 4 + R() * 18, ph: R() })
      skyAt += 30 + R() * 60
    }
    bank = bank.filter((b) => b.x - fromX * 0.35 + (b.dir ? b.dir * b.drive * S.time : 0) > -60 || b.dir)
    if (bank.length > 80) bank.splice(0, bank.length - 80)
    sky = sky.filter((s) => s.x - fromX * 0.1 > -40)
  }
  function pick(list, R) {
    const tot = list.reduce((a, b) => a + b.w, 0)
    let r = R() * tot
    for (const it of list) { r -= it.w; if (r <= 0) return it }
    return list[list.length - 1]
  }

  // What comes next: easy for the first dozen, then each kind joins at its count; pairs late.
  function spawn() {
    const R = Math.random
    const open = Object.entries(KINDS).filter(([, k]) => S.n >= k.at)
    // a kind that has just joined comes first, alone and with room
    const fresh = open.find(([id, k]) => !seen[id] && k.at > 0)
    let id, k
    if (fresh) [id, k] = fresh
    else { const p = pick(open.map(([i, kk]) => ({ id: i, k: kk, w: kk.w })), R); id = p.id; k = p.k }
    seen[id] = 1
    const room = fresh ? 1.6 : 1
    if (k.arc) {
      // three flowers in an arc over the water: a flap takes them
      for (let j = 0; j < 3; j++) things.push({ id, k, x: nextAt + j * 9, y: -18 - 8 * Math.sin(Math.PI * (j + 0.5) / 3), ph: R() })
    } else {
      things.push({ id, k, x: nextAt, y: k.air ? k.hover : 0, ph: R(), tip: !!(k.first && fresh) })
    }
    // late: a pair, a thing in the air then one on the water, close together
    const pair = S.n >= 60 && !fresh && R() < 0.3
    if (pair) {
      const air = KINDS.lantern, flo = R() < 0.5 ? KINDS.krathong : KINDS.coconut
      if (!k.air) things.push({ id: 'lantern', k: air, x: nextAt + S.v * 1.35, y: air.hover, ph: R() })
      else things.push({ id: flo.g, k: flo, x: nextAt + S.v * 1.35, y: 0, ph: R() })
    }
    const gap = Math.max(1.1, 2.7 - 0.018 * S.n) + R() * 0.7
    nextAt += gap * S.v * room + (k.arc ? 18 : 0) + (pair ? 1.35 * S.v : 0)
  }

  function flap() {
    if (S.mode !== 'play' || S.dead) return
    if (S.pose === 'dive' && S.diveT < 0.35 * DIVE) return
    if (S.pose === 'dive') { S.splashT = 0; S.splashX = SX + 4 }   // up out of a dive and away
    if (S.pose === 'swim' || S.pose === 'dive') { S.vy = FLAP; S.pose = 'air'; S.flaps = 1; S.diveT = 0; return }
    if (S.flaps < 3) { S.vy = Math.max(S.vy, FLAP2 * (S.flaps === 1 ? 1 : 0.85)); S.flaps++ }
  }
  function dive() {
    if (S.mode !== 'play' || S.dead) return
    if (S.pose === 'swim') { S.pose = 'dive'; S.diveT = 0; S.underT = 0; S.splashT = 0; S.splashX = SX + 8 }
    else if (S.pose === 'air' && S.vy > -GRAV) S.vy = Math.min(S.vy, -60)   // in the air, ↓ brings it down
  }

  // the swan's circles [x, y, r] in units on the canvas
  function swanHits() {
    const bx = SX, by = WL - 1.4 - S.y
    if (S.pose === 'dive') return [[bx - 7, WL - 3, 3.2]]
    const tilt = S.pose === 'air' ? -0.38 : 0, c = Math.cos(tilt), s = Math.sin(tilt)
    return [[-4, 0, 4.4], [4, 0, 4.4], [10, -10.7, 2.4], [11.9, -17, 3]].map(([x, y, r]) => [bx + x * c - y * s, by + x * s + y * c, r])
  }
  function thingHits(o) {
    const sx = o.x - S.x, ty = WL + o.y
    return o.k.hit.map(([x, y, r]) => [sx + x, ty + y, r])
  }
  const touches = (A, B) => A.some((a) => B.some((b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 < (a[2] + b[2]) ** 2))

  function step(dt) {
    S.time += dt
    if (S.mode !== 'play') return
    if (S.dead) { S.dead += dt; S.hurtT += dt; S.v = Math.max(0, S.v - 40 * dt); S.x += S.v * dt; physics(dt); if (S.dead > 1.6) over(); return }
    S.v = Math.min(72, 32 + 24 * (1 - Math.exp(-S.n / 60)) + 0.12 * S.n)
    S.x += S.v * dt
    physics(dt)
    if (S.graceT > 0) S.graceT -= dt
    if (S.hurtT >= 0) { S.hurtT += dt; if (S.hurtT > HURT) S.hurtT = -1 }
    S.tipT = things.some((o) => o.tip && o.x - S.x < Wu - 4 && o.x - S.x > SX - 8) ? 1 : 0   // the first lantern brings its hint
    if (S.splashT >= 0) { S.splashT += dt; if (S.splashT > 0.7) S.splashT = -1 }
    while (S.x + Wu + 10 >= nextAt) spawn()
    // moving things
    for (const o of things) {
      const k = o.k, sx = o.x - S.x
      if (k.fly) o.x -= k.fly * dt
      if (k.bob) o.y = k.hover + k.bob * Math.sin((S.time + o.ph * 6) * 2.2)
      if (k.fall) { const u = Math.max(0, Math.min(1, (sx - SX) / 90)); o.y = k.hover - k.fall * u + 1.5 * Math.sin(S.time * 3 + o.ph * 6) }
      if (k.leap) { const u = frac(S.time / 2.2 + o.ph); o.y = u < 0.55 ? -k.leap * Math.sin(Math.PI * u / 0.55) + 6 : 6 + 4 * (u - 0.55) }
      if (k.rise) { const u = frac(S.time / 2.8 + o.ph); o.y = u < 0.5 ? 30 * (1 - Math.sin(Math.PI * u / 0.5)) : 30 }
    }
    // hits and flowers
    const me = swanHits()
    for (const o of things) {
      if (o.done) continue
      const sx = o.x - S.x
      if (sx < SX - 30 || sx > SX + 30) { if (sx < SX - 20 && !o.passed) { o.passed = 1; if (!o.k.flower) S.n++ } continue }
      if ((o.k.leap || o.k.rise) && o.y > -2) continue   // under the water: nothing to hit
      if (o.k.front && sx < SX - 2) continue   // a fish leaping up behind the swan misses it
      if (!touches(me, thingHits(o))) continue
      if (o.k.flower) { o.done = 1; o.gotT = S.time; const was = S.flowers; S.flowers += +o.k.flower; if (Math.floor(S.flowers / FLOWERS_PER_HEART) > Math.floor(was / FLOWERS_PER_HEART) && S.hearts < 3) S.hearts++ }
      else if (S.graceT <= 0 && !o.hitT) {
        o.hitT = S.time; S.hearts--; S.graceT = GRACE; S.hurtT = 0
        if (S.hearts <= 0) { S.score = metres(); S.dead = 0.0001; best = Math.max(best, S.score); store('hd-swan404-best', String(best)) }
      }
    }
    things = things.filter((o) => o.x - S.x > -40 && !(o.done && S.time - o.gotT > 0.5))
  }
  function physics(dt) {
    if (S.pose === 'air') {
      S.vy -= GRAV * dt; S.y += S.vy * dt
      if (S.y > 56) { S.y = 56; S.vy = Math.min(S.vy, 0) }
      if (S.y <= 0) { S.y = 0; S.vy = 0; S.pose = 'swim'; S.flaps = 0; S.splashT = 0; S.splashX = SX }
    } else if (S.pose === 'dive') {
      S.diveT += dt; S.underT += dt
      if (S.hold && S.underT < HOLD && S.diveT > 0.62 * DIVE) S.diveT -= 0.2 * DIVE   // held down: stays under, kicking
      if (S.diveT >= DIVE) { S.pose = 'swim'; S.diveT = 0 }
    }
  }
  const metres = () => S.dead || S.mode === 'over' ? S.score : Math.floor((S.x - S.x0) / 4)

  // ---------------------------------------------------------------- frames
  const SWAN = { size: SW, dry: true, cap: 240, ts: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9], taps: 1 }
  // the swan's frames: [t, tap] for frame f of each move
  const MOVE = {
    swim: (f) => [f / 20 * 0.2, -1], look: (f) => [0.28 + f / 20 * 0.2, -1], dive: (f) => [0.52 + f / 16 * 0.24, -1],
    flap: (f) => [0.785 + f / 8 * (0.1 / 3), -1], glide: () => [0.7933, -1], hurt: (f) => [0.12, f / 16]
  }
  const swanAt = (move, f) => { const [t, tap] = MOVE[move](f); return sprite('hongsa', t, { ...SWAN, tap, boil: f % 3 }) }
  function swanSprite() {
    const t = S.time
    let f = 0, sink = 0
    let move = 'swim'
    if (S.hurtT >= 0 && S.mode === 'play') { move = 'hurt'; f = Math.min(15, Math.floor(S.hurtT / HURT * 16)) }
    else if (S.mode === 'over' || S.dead) { move = 'look'; f = Math.floor(frac(t / 2) * 20) }
    else if (S.pose === 'dive') { move = 'dive'; f = Math.min(15, Math.floor(S.diveT / DIVE * 16)); sink = 3.5 * Math.sin(Math.PI * Math.min(1, S.diveT / DIVE)) }
    else if (S.pose === 'air') { if (S.vy > -25) { move = 'flap'; f = Math.floor(frac(t * 2.6) * 8) } else { move = 'glide'; f = 0 } sink = 13 * SK }
    else if ((S.mode === 'title' || S.mode === 'pause') && calm.matches) { move = 'swim'; f = 12 }
    else if (S.mode === 'title' || S.mode === 'pause') { const u = frac(t / 7); if (u < 0.7) f = Math.floor(frac(t / 2) * 20); else { move = 'look'; f = Math.min(19, Math.floor((u - 0.7) / 0.3 * 20)) } }
    else f = Math.floor(frac(t / 2) * 20)
    return { sp: swanAt(move, f), sink }
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const t = S.time, mul = look === 'riso' ? 'multiply' : null
    // sun or moon, the sky, the far bank (slower than the river)
    put(glyph(dark.matches ? 'moon' : 'sun', t, 13), Wu * 0.62, 3, 0.13, { op: mul })
    for (const s of sky) put(glyph(s.g, t, s.size, 8, { ph: s.ph }), s.x - S.x * 0.1, s.y, s.size / 100, { alpha: 0.55, op: mul })
    for (const b of bank.filter((q) => !q.dir).concat(bank.filter((q) => q.dir))) {
      const x = b.x - S.x * 0.35 + (b.dir ? b.dir * b.drive * t : 0)
      if (x < -40 || x > Wu + 40) continue
      const sp = glyph(b.g, t, b.size, 8, { ph: b.ph })
      put(sp, x, WL - 0.5 - b.size * 0.93, b.size / 100, { alpha: dark.matches ? 0.5 : 0.62, op: mul, flip: b.dir ? b.dir < 0 : b.flip })
    }
    // things on and over the river, the swan, then the river over all of them below its surface
    for (const o of things) {
      if (o.done && o.gotT != null) {
        const u = Math.min(1, (t - o.gotT) / 0.5), sp = glyph(o.k.g, t, o.k.size, 8, { ph: o.ph, dry: true })
        put(sp, (o.x - S.x) - 50 * o.k.size / 100 * (1 - u * 0.6), WL + o.y - o.k.base * o.k.size / 100 - 18 * u, o.k.size / 100 * (1 - 0.6 * u), { alpha: 1 - u })
        continue
      }
      const sx = o.x - S.x, k = o.k
      if (sx < -40 || sx > Wu + 40) continue
      const ratio = (D.info(k.g) || {}).ratio || 1
      const sp = glyph(k.g, t, k.size, 8, { ph: o.ph, dry: true })
      put(sp, sx - 50 * ratio * k.size / 100, WL + o.y - k.base * k.size / 100, k.size / 100, { op: k.air ? mul : null, flip: k.flip, fx: sx })
      if (o.hitT && t - o.hitT < 0.4) put(sprite('swan404-splash', Math.min(0.98, (t - o.hitT) / 0.4), { size: 16 }), sx - 8, WL - 13, 0.16)
    }
    const { sp, sink } = swanSprite()
    const blink = S.graceT > 0 && !S.dead && Math.floor(S.graceT * 9) % 2 === 0
    put(sp, SX - 54 * SK, WL - 72 * SK - S.y + sink, SK, { alpha: blink ? 0.35 : 1 })
    if (S.splashT >= 0) put(sprite('swan404-splash', Math.min(0.98, S.splashT / 0.7), { size: 20, boil: Math.floor(S.splashT * 8) % 3 }), S.splashX - 10, WL - 16.6, 0.2)
    // the river, tiled; it scrolls with the things on it
    const rs = (100 - WL + 6) / 100, tw = 400 * rs, wave = 400 / 6 * rs
    // the sheet slides by whole waves, so its surface keeps step with the lines on it
    put(sprite('swan404-water', 0, { size: 100 - WL + 6, cap: 600 }), -frac(S.x / wave) * wave, WL - 6 * rs, rs, { op: mul })
    const riv = sprite('swan404-river', 0, { size: 100 - WL + 6, boil: Math.floor(t * 8) % 3, cap: 600 })
    for (let x = -frac(S.x / tw) * tw; x < Wu; x += tw) put(riv, x, WL - 6 * rs, rs, { op: mul })
    // the count, flowers, hearts
    if (S.mode === 'play' || S.mode === 'over' || S.mode === 'pause') hud()
    if (DEBUG) debug()
  }
  function hud() {
    for (let i = 0; i < 3; i++) put(sprite('heart', 0.25, { size: 7 }), Wu - 10 - i * 8, 2.5, 0.07, { alpha: i < S.hearts ? 1 : 0.18 })
    ctx.save()
    ctx.fillStyle = ink
    ctx.font = `700 ${Math.round(5.4 * U)}px ${font}`
    ctx.textBaseline = 'middle'; ctx.textAlign = 'right'
    ctx.fillText(T.m(metres()), (Wu - 3) * U, 15 * U)
    ctx.fillText(String(S.flowers), (Wu - 3) * U, 23 * U)
    const w = ctx.measureText(String(S.flowers)).width / U
    ctx.restore()
    put(sprite('lotus', 0.25, { size: 8, dry: true }), Wu - 3 - w - 9.5, 18.6, 0.08)
  }
  function debug() {
    ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = 'red'
    const circ = (c) => { ctx.beginPath(); ctx.arc(c[0] * U, c[1] * U, c[2] * U, 0, Math.PI * 2); ctx.stroke() }
    swanHits().forEach(circ)
    ctx.strokeStyle = 'magenta'
    for (const o of things) thingHits(o).forEach(circ)
    ctx.strokeStyle = 'teal'; ctx.beginPath(); ctx.moveTo(0, WL * U); ctx.lineTo(W, WL * U); ctx.stroke()
    ctx.fillStyle = 'red'; ctx.font = '12px monospace'; ctx.fillText(`n ${S.n} v ${S.v.toFixed(0)} things ${things.length} sprites ${CACHE.size} ${(cacheBytes / 1e6).toFixed(0)}MB`, 6, H - 8)
    ctx.restore()
  }

  // ---------------------------------------------------------------- the page around it
  function size() {
    const r = cv.getBoundingClientRect()
    const nW = Math.round(r.width), nH = Math.round(r.height), nD = Math.min(2, window.devicePixelRatio || 1)
    if (nW === W && nH === H && nD === DPR) return
    W = nW; H = nH; DPR = nD; U = H / 100; Wu = W / U
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR)
    CACHE.clear(); cacheBytes = 0
    if (S.mode === 'title' || S.mode === 'load') reset()
    scenery(S.x)
  }
  function show(mode) {
    S.mode = mode
    box.dataset.mode = mode
    ui.hidden = mode === 'play'
    if (mode === 'title') { go.innerHTML = T.play; hint.innerHTML = T.hint; say.textContent = best ? T.best(best) : '' }
    if (mode === 'over') { go.innerHTML = T.again; hint.innerHTML = ''; say.textContent = T.m(metres()) + ' · ' + T.best(best) }
    if (mode === 'pause') { go.innerHTML = T.on; hint.innerHTML = T.hint; say.textContent = T.m(metres()) }
  }
  function over() { S.overAt = S.time; show('over'); go.focus({ preventScroll: true }) }
  function play() {
    if (S.mode === 'pause') { show('play'); last = performance.now(); kick(); return }
    reset(); show('play'); last = performance.now(); kick()
    cv.focus({ preventScroll: true })
  }
  function pause() { if (S.mode === 'play' && !S.dead) show('pause') }

  go.addEventListener('click', (e) => { e.preventDefault(); play() })
  cv.addEventListener('pointerdown', (e) => {
    if (S.mode === 'title' || S.mode === 'pause' || (S.mode === 'over' && S.time - S.overAt > 0.9)) { play(); return }
    if (S.mode !== 'play') return
    e.preventDefault()
    const y = (e.clientY - cv.getBoundingClientRect().top) / U
    if (y > WL + 1) { S.hold = true; dive() } else flap()
  })
  const up = () => { S.hold = false }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', up)
  window.addEventListener('keydown', (e) => {
    if (S.mode !== 'play' || e.altKey || e.ctrlKey || e.metaKey) return
    const k = e.key
    if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); if (!e.repeat) flap() }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); S.hold = true; if (!e.repeat) dive() }
    else if (k === 'Escape' || k === 'p' || k === 'P') { e.preventDefault(); pause() }
  })
  window.addEventListener('keyup', (e) => { if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') S.hold = false })
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else kick() })
  window.addEventListener('blur', pause)
  let inView = true
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { inView = e.isIntersecting; if (!inView) pause(); else kick() }), { threshold: 0.2 }).observe(cv)
  new ResizeObserver(() => { size(); kick() }).observe(cv)
  dark.addEventListener('change', () => { theme(); CACHE.clear(); BOUNDS.clear(); cacheBytes = 0; kick() })

  // one loop; it stops when nothing moves (the title under reduced motion, a paused game, off screen)
  let last = 0, running = false, warp = 1
  const PERF = []
  function kick() { if (!running && D) { running = true; last = performance.now(); requestAnimationFrame(frame) } }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000) * warp; last = now
    const moving = inView && !document.hidden && (S.mode === 'play' || (!calm.matches && (S.mode === 'title' || S.mode === 'over')))
    if (moving) {
      let left = dt
      while (left > 1e-6) { const h = Math.min(1 / 120, left); step(h); left -= h }
      if (S.mode !== 'play') S.x += (S.mode === 'title' ? 10 : 0) * dt
      scenery(S.x)
    }
    spent = 0
    const t0 = TEST ? performance.now() : 0
    try { draw() } catch (e) { running = false; box.dataset.mode = 'broken'; if (window.console) console.warn('swan404:', e); return }
    tip.hidden = !(S.tipT > 0 && S.mode === 'play')
    if (TEST) { PERF.push(performance.now() - t0); if (PERF.length > 600) PERF.shift() }
    if (moving) requestAnimationFrame(frame); else running = false
  }

  // While the title shows, draw ahead the frames the first minute needs, a few milliseconds at a time.
  function warm() {
    const jobs = [], o = (size) => ({ size, dry: true, now: 1 })
    const loop = (g, size) => { for (let f = 0; f < 8; f++) jobs.push(() => sprite(g, f / 8, { ...o(size), boil: f % 3 })) }
    for (let f = 0; f < 20; f++) jobs.push(() => swanAt('swim', f))
    for (const id of ['krathong', 'coconut', 'lotus', 'ngob']) loop(KINDS[id].g, KINDS[id].size)
    for (let f = 0; f < 8; f++) jobs.push(() => swanAt('flap', f))
    jobs.push(() => swanAt('glide', 0))
    for (let f = 0; f < 16; f++) jobs.push(() => swanAt('dive', f), () => swanAt('hurt', f))
    for (const id of ['durian', 'kratip', 'frangipani', 'lantern']) loop(KINDS[id].g, KINDS[id].size)
    const later = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 400 }) : setTimeout(fn, 50))
    const run = () => { const end = performance.now() + 6; try { while (jobs.length && performance.now() < end) jobs.shift()() } catch { return } if (jobs.length) later(run) }
    later(run)
  }

  // wait for the dingbats shop.js loads for this page
  let tries = 0
  ;(function wait() {
    D = window.Dingbats
    if (D && NEED.every((n) => D.has(n))) {
      theme(); dryPen(); ownGlyphs(); size(); reset(); scenery(0); tip.innerHTML = T.dive
      show('title'); box.classList.add('on'); kick(); warm()
      if (TEST) window.__swan404 = {
        S, KINDS, things: () => things, perf: () => { const a = [...PERF].sort((x, y) => x - y); return { n: a.length, p50: a[a.length >> 1], p95: a[Math.floor(a.length * 0.95)], max: a[a.length - 1], sprites: CACHE.size, mb: cacheBytes / 1e6 } }, set: (n) => { S.n = n }, flap, dive, warp: (k) => { warp = k },
        place: (id, dx, y) => { const k = KINDS[id]; things.push({ id, k, x: S.x + SX + dx, y: y != null ? y : k.air ? k.hover : 0, ph: 0 }); nextAt = Math.max(nextAt, S.x + SX + dx + 200) },
        sprites: (q = '') => [...CACHE].filter(([k]) => k.includes(q)).map(([k, v]) => { const d = v.cv.getContext('2d').getImageData(0, 0, v.cv.width, v.cv.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return [k, v.cv.width, v.cv.height, n, BOUNDS.get(k.split('|')[0]) || BOUNDS.get(k.split('|')[0] + '|d')] }),
        // one of each kind in a row, standing still, to check where each sits and what it hits
        line: (gap = 21, from = 0, n = 99, t = S.time) => { things = Object.entries(KINDS).slice(from, from + n).map(([id, k], i) => ({ id, k, x: S.x + 44 + i * gap, y: k.arc ? -22 : k.air ? k.hover : k.leap ? -10 : 0, ph: 0 })); S.mode = 'lineup'; S.time = t; draw() }
      }
      return
    }
    if (++tries < 150) setTimeout(wait, 100)
    else box.dataset.mode = 'broken'
  })()
}

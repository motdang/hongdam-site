// eggs.js — the easter eggs of hongdam.net and the story they tell (data/eggs.json, data/eggs-story.json).
// A small dyed egg hides on each page, in the Thai colour of the day, somewhere that changes with the day. Tap it,
// or type egg or swan: it cracks and Dam, the black swan's chick, peeps out; the page's show plays, then a card
// tells the next bit of Dam's story, which runs in the order this browser finds the eggs. A found egg leaves a
// feather. Written by tools/eggs.mjs; changes go in the two data files. Added to every page by functions/_middleware.js.
const DATA = /*DATA*/{}/*END*/
const ST = DATA.story
const doc = document
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const keep = (S) => (k, v) => { try { if (v === undefined) return S.getItem(k); S.setItem(k, v) } catch { return null } }
const store = keep(window.localStorage), sess = keep(window.sessionStorage)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const fnv = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0 } return h.toString(36) }

// The page: <body data-egg>, else the longest start of the path (language prefix dropped) that has an egg.
// Pages not listed anywhere public are kept under '#' + a hash of their path.
const LANG = (location.pathname.match(/^\/(th|my|zh)\//) || [])[1] || ''
const at = (k) => (DATA.pages[k] ? k : DATA.pages['#' + fnv(k)] ? '#' + fnv(k) : null)
function keyOf() {
  const b = doc.body && doc.body.dataset.egg
  if (b && DATA.pages[b]) return [b, b]
  const p = location.pathname.replace(/^\/(th|my|zh)(?=\/)/, '').replace(/index\.html$/, '').replace(/^\/+|\/+$/g, '')
  if (!p) return ['front', 'front']
  const parts = p.split('/')
  for (let i = parts.length; i > 0; i--) { const k = parts.slice(0, i).join('/'); if (at(k)) return [k, at(k)] }
  return [p, 'default']
}
const [KEY, AT] = keyOf()
const EGG = DATA.pages[AT]
const SCENE = ST.scenes[AT] || ST.scenes.default

// Bangkok time, the moon, the moment
const BKK = new Date(Date.now() + 7 * 3600e3)
const HOUR = BKK.getUTCHours() + BKK.getUTCMinutes() / 60, DOW = BKK.getUTCDay(), MONTH = BKK.getUTCMonth() + 1
const MD = String(MONTH).padStart(2, '0') + '-' + String(BKK.getUTCDate()).padStart(2, '0')
const MOON = ((((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) / 29.530588853) % 1 + 1) % 1
const within = (v, [a, b]) => (a <= b ? v >= a && v <= b : v >= a || v <= b)
const MOMENT = ST.moments.find((m) => {
  const w = m.when
  if (w.hours && !(w.hours[0] <= w.hours[1] ? HOUR >= w.hours[0] && HOUR < w.hours[1] : HOUR >= w.hours[0] || HOUR < w.hours[1])) return false
  if (w.moon && !(MOON >= w.moon[0] && MOON <= w.moon[1])) return false
  if (w.months && !w.months.includes(MONTH)) return false
  if (w.dates && !within(MD, w.dates)) return false
  return !(m.chance && Math.random() > m.chance)
})
const dayColour = () => { const d = ST.egg.day_colours[DOW]; return d.night && HOUR >= +d.night.from.slice(0, 2) ? d.night.a : d.a }

// What this browser has found: the pages in the order found, golden feathers, what the story has unlocked
const found = () => (store('hd-eggs') || '').split(' ').filter(Boolean)
const golds = () => +(store('hd-gold') || 0)
const unlocked = (u) => (store('hd-unlock') || '').split(' ').includes(u)
const REVEAL = (ST.chapters.find((c) => c.show === 'reveal') || { at: 9 }).at
const formAt = (n) => ST.character.forms[ST.chapters.filter((c) => c.at <= Math.max(1, n)).pop().form].glyph
const GF = KEY === 'front' && unlocked('golden-front') && !store('hd-gf')
const RARE = GF ? ST.rare.find((r) => r.id === 'golden-front') : found().includes(KEY) ? null
  : ST.rare.find((r) => !r.needs && (!r.pages_only || r.pages_only.includes(KEY)) && Math.random() < ((r.pages && r.pages[KEY]) ?? r.chance)) || null
const LATE = MOMENT && MOMENT.id === 'late'
const SHY = !found().includes(KEY) && !GF && Math.random() < ST.egg.shy.chance

// Pictures: the doodle dingbat core, the base file (egg, feather), the story file, the page's own
const loaded = {}
const script = (src) => loaded[src] || (loaded[src] = new Promise((ok, no) => {
  const s = doc.createElement('script'); s.src = src; s.async = false; s.onload = ok; s.onerror = no; doc.head.appendChild(s)
}))
const core = () => (window.Dingbats ? Promise.resolve() : script(DATA.core))
const pictures = async () => { try { await core(); await script(DATA.base); await script(DATA.storyB); if (EGG.b) await script(EGG.b) } catch { /* the words still show */ } }
const db = (name, o = {}) => `<doodle-dingbat name="${esc(name)}" play="${o.play || 'loop'}" look="${o.look || 'riso'}"${o.size ? ` size="${o.size}"` : ''}${o.a ? ` a="${o.a}"` : ''}${o.ink ? ` ink="${o.ink}"` : ''} aria-hidden="true"></doodle-dingbat>`
const lum = (c) => { const m = (c || '').match(/\d+(\.\d+)?/g); if (!m || (m[3] !== undefined && +m[3] === 0)) return null; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 }
const DARK = (() => { const b = lum(getComputedStyle(doc.body).backgroundColor); return (b === null ? lum(getComputedStyle(doc.documentElement).backgroundColor) ?? 1 : b) < 0.35 })()
const LOOK = DARK ? 'ink' : 'riso'   // riso prints by multiplying, which vanishes on a dark page
const picOf = (k) => (k === 'front' ? 'hongsa' : DATA.doors[k] || (DATA.pages[at(k) || 'default'] || DATA.pages.default).g[0])

const CSS = `
.hd-egg-spot{display:block;margin:10px 0 0;line-height:0}
.hd-egg-spot.inline{display:inline-block;margin:0 0 0 .4em;vertical-align:middle}
.hd-egg{all:unset;cursor:pointer;display:inline-block;padding:6px;line-height:0;border-radius:50%;transition:transform .3s}
.hd-egg:hover,.hd-egg:focus-visible{transform:rotate(-8deg) scale(1.15)}
.hd-egg:focus-visible{outline:3px solid currentColor;outline-offset:2px}
.hd-egg.knock{animation:hd-knock .7s}
.hd-egg.roll{animation:hd-roll .6s ease-in forwards}
@keyframes hd-knock{0%,30%,60%,100%{transform:none}15%,45%{transform:rotate(-9deg) translateY(-2px)}}
@keyframes hd-roll{to{transform:translateX(60px) rotate(220deg);opacity:0}}
.hd-show{position:fixed;inset:0;pointer-events:none;z-index:2147482000;overflow:hidden;color:inherit}
.hd-show .it{position:absolute;line-height:0;will-change:transform}
.hd-band{position:absolute;left:-2px;right:-2px;bottom:22vh;height:118px;background:#FFFDF8;border-block:4px solid #121212;color:#121212;box-shadow:0 8px 0 #121212}
.hd-band:before{content:"";position:absolute;left:0;right:0;bottom:24px;height:8px;background:var(--hd-line,#2B5BA8)}
.hd-band.water{background:#DDEBF7}
.hd-band.water:before{bottom:34px;height:4px;background:#2B5BA8;opacity:.6}
.hd-band.lake{height:220px;bottom:16vh;background:linear-gradient(#FFFDF8 0 50%,#CFE2F3 50%)}
.hd-band.lake:before{bottom:110px;height:3px;background:#2B5BA8;opacity:.7}
.hd-toast{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147482500;width:min(520px,calc(100vw - 32px));box-sizing:border-box;
 background:#FFFDF8;color:#121212;border:4px solid #121212;box-shadow:8px 8px 0 #121212;padding:12px 44px 12px 12px;
 font:600 17px/1.35 Futura,"Futura PT",Jost,"Avenir Next","Noto Sans Thai","Noto Sans Myanmar","PingFang SC",Thonburi,system-ui,sans-serif;display:flex;gap:10px;align-items:flex-start}
.hd-toast .fig{flex:none;line-height:0;margin-top:2px}
.hd-toast > div{flex:1;min-width:0}
.hd-toast p{margin:0 0 6px}
.hd-toast p.ch{font-weight:700}
.hd-toast p.m,.hd-toast p.n{font-weight:400;font-size:15px;color:#4A4640}
.hd-toast a{color:#121212}
.hd-toast button.x{all:unset;cursor:pointer;position:absolute;right:6px;top:6px;width:32px;height:32px;display:grid;place-items:center;font:700 22px/1 system-ui,sans-serif;color:#121212}
.hd-toast button.x:focus-visible{outline:3px solid #121212}
.hd-trip{position:relative;display:flex;align-items:flex-end;gap:2px;margin:4px 0 8px;padding-bottom:10px;line-height:0;overflow:hidden}
.hd-trip:after{content:"";position:absolute;left:8px;right:8px;bottom:3px;height:3px;background:#2B5BA8;border-radius:3px}
.hd-trip span{position:relative;flex:none}
.hd-trip span:after{content:"";position:absolute;left:50%;bottom:-11px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:#2B5BA8;box-shadow:0 0 0 2px #FFFDF8}
.hd-trip span.dam:after{display:none}
.hd-trip i{flex:none;font:400 14px/1 system-ui;color:#4A4640;align-self:center}
.hd-feathers{display:inline-flex;gap:0;vertical-align:middle;line-height:0;margin-right:6px}
`

let BTN, busy = false, taps = 0
function place() {
  if (!EGG || doc.querySelector('.hd-egg')) return
  const style = doc.createElement('style'); style.textContent = CSS; doc.head.appendChild(style)
  const wrap = doc.createElement('span'); wrap.className = 'hd-egg-spot'
  put(wrap, (EGG.at && doc.querySelector(EGG.at)) || spots()[0])
  BTN = doc.createElement('button'); BTN.className = 'hd-egg'; BTN.type = 'button'
  wrap.appendChild(BTN)
  dress(found().includes(KEY) && !GF)
  BTN.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); tap(e) })
}
// where the egg sits today: the day's hiding places on this page, else the foot of the page
const foot = () => doc.querySelector('footer') || doc.querySelector('main') || doc.body
function spots() { return (ST.egg.hiding[DOW] || []).map((s) => doc.querySelector(s)).filter(Boolean).concat([foot()]) }
function elsewhere(now) {
  const all = Object.keys(ST.egg.hiding).filter((k) => /^\d$/.test(k)).flatMap((d) => ST.egg.hiding[d]).map((s) => doc.querySelector(s)).concat([foot()])
  return [...new Set(all.filter(Boolean))].filter((s) => s !== now)
}
function put(wrap, spot) {
  wrap.__spot = spot
  const a = spot.closest('a, button') || (spot.matches('.qwrap') ? spot : null)
  if (a) a.after(wrap); else spot.appendChild(wrap)
  const block = spot === doc.body || /^(FOOTER|MAIN)$/.test(spot.tagName)
  wrap.classList.toggle('inline', !block)
  wrap.style.textAlign = block ? ['left', 'center', 'right'][[...KEY].reduce((a, c) => a + c.charCodeAt(0), 0) % 3] : ''
}
function dress(feather) {
  BTN.dataset.state = feather ? 'feather' : 'egg'
  BTN.setAttribute('aria-label', feather ? 'A feather' : 'An egg')
  BTN.innerHTML = feather ? db(ST.egg.found.glyph, { size: '26px', look: LOOK })
    : db(ST.egg.glyph, { play: LATE ? 'still' : 'hover', size: '30px', look: 'ink', a: RARE ? RARE.colors.a : dayColour() })
}

async function tap(e) {
  if (busy) return
  if (BTN.dataset.state === 'feather') return trail()
  taps++
  const late = LATE && ST.moments.find((m) => m.id === 'late')
  if (late && taps < late.taps_to_hatch) { BTN.classList.remove('knock'); void BTN.offsetWidth; BTN.classList.add('knock'); return }
  if (SHY && taps === 1) return roll()
  return hatch(e && e.target.closest && e.target.closest('doodle-dingbat'))
}
async function roll() {
  BTN.classList.add('roll')
  await sleep(calm() ? 0 : 600)
  const here = BTN.parentNode, next = elsewhere(here.__spot)
  put(here, next[(DOW + 1) % Math.max(1, next.length)] || foot())
  BTN.classList.remove('roll')
  BTN.focus({ preventScroll: true })
  note([ST.egg.shy.say])
}

let counted = false
async function hatch(tappedEgg) {
  busy = true
  const first = found().length === 0
  const pics = pictures()
  const egg = BTN && BTN.querySelector('doodle-dingbat')
  if (first && BTN && !calm()) { BTN.classList.add('knock'); await sleep(750); BTN.classList.remove('knock') }
  if (egg && egg.__db && !tappedEgg) egg.__db.onTap()   // the egg's own tap: it cracks and Dam peeps out
  await Promise.all([pics, sleep(calm() ? 0 : 1300)])
  const list = found(), fresh = !list.includes(KEY)
  if (fresh) list.push(KEY)
  store('hd-eggs', list.join(' '))
  if (RARE && RARE.gives === 'golden-feather') store('hd-gold', String(golds() + 1))
  if (GF) store('hd-gf', '1')
  const n = list.length, ch = fresh || GF ? ST.chapters.find((c) => c.at === n) : null
  if (ch && ch.unlocks && !unlocked(ch.unlocks)) store('hd-unlock', ((store('hd-unlock') || '') + ' ' + ch.unlocks).trim())
  if (!counted && window.hd) { window.hd('egg', KEY); counted = true }
  if (ch && window.hd) window.hd('story', ch.name)
  const form = formAt(n), swan = n >= REVEAL
  let show = EGG.show, g = EGG.g.slice()
  const m = MOMENT && MOMENT.id !== 'late' ? MOMENT : null
  if (m && m.replace) { g = m.replace.slice(); if (m.show) show = m.show } else if (m && m.add) g = g.concat(m.add)
  if (ch && ch.show) { show = ch.show; if (ch.g) g = ch.g.slice() }
  if (BTN) dress(true)
  if (!calm()) await SHOWS[show](g, BTN, form)
  card({ ch, line: GF ? null : swan ? SCENE.swan : SCENE.duckling, notes: [first && ST.egg.knock.say, LATE && MOMENT.say, m && m.say, RARE && RARE.say].filter(Boolean), list, form })
  busy = false
}

// A found egg's feather: how far Dam has come, and a category page whose egg is still waiting
function trail() {
  const list = found(), left = DATA.cats.filter((c) => !list.includes(c.id))
  const pick = left.length ? left[[...KEY].reduce((a, c) => a + c.charCodeAt(0), list.length) % left.length] : null
  const hint = pick ? ST.egg.found.hint.replace('{page}', `<a href="/${LANG ? LANG + '/' : ''}${pick.id}/">${esc(pick.n)}</a>`) : ''
  pictures().then(() => card({ line: ST.egg.found.say, html: hint, list, form: formAt(list.length) }))
}

// The shows: the swan (or Dam, as it is now) leads a line across, swims, the lake, or the pictures rise, rain or burst
const W = () => innerWidth, H = () => innerHeight
const rand = (a, b) => a + Math.random() * (b - a)
function stage() { const s = doc.createElement('div'); s.className = 'hd-show'; s.setAttribute('aria-hidden', 'true'); doc.body.appendChild(s); return s }
function item(s, name, size, play = 'loop', look) { const i = doc.createElement('span'); i.className = 'it'; i.innerHTML = db(name, { play, size: size + 'px', look: look || (s.classList.contains('hd-show') ? LOOK : 'riso') }); s.appendChild(i); return i }
const done = (anims, s) => Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(() => s.remove())
const stand = (form) => (form === 'hongsa-walk' ? 'hongsa-stand' : form)

const SHOWS = {
  parade(g, _, form, water, lineUp) {
    const s = stage(), band = doc.createElement('div'); band.className = 'hd-band' + (water ? ' water' : ''); s.appendChild(band)
    const size = W() < 480 ? 54 : 70, gap = size * 1.35, list = water ? [form === 'hongsa-walk' ? 'hongsa' : form] : [form, ...(lineUp || g)], ms = water ? 11000 : Math.max(6500, (list.length * gap + W()) * 6.5)
    const anims = list.map((name, i) => {
      const it = item(band, name, i || water ? size : size * 1.2)
      it.style.left = '0'; it.style.bottom = water ? '22px' : '30px'
      return it.animate([{ transform: `translateX(${-gap * (i + 1)}px)` }, { transform: `translateX(${W() + gap * (list.length - i)}px)` }], { duration: ms, easing: 'linear', fill: 'forwards' })
    })
    if (water) anims.push(...g.map((name, i) => {
      const it = item(band, name, size * 0.6, 'still'); it.style.left = '0'; it.style.bottom = '64px'
      const x = W() * (0.2 + 0.6 * i / g.length)
      return it.animate([{ transform: `translate(${-size}px,0)`, opacity: 0 }, { transform: `translate(${x}px,-6px)`, opacity: 1, offset: 0.4 }, { transform: `translate(${x}px,-6px)`, opacity: 0 }], { duration: ms, delay: 600 + i * 500, fill: 'forwards' })
    }))
    band.animate([{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none', offset: 0.06 }, { opacity: 1, transform: 'none', offset: 0.94 }, { opacity: 0, transform: 'translateY(30px)' }], { duration: ms + 400, fill: 'forwards' })
    return done(anims, s)
  },
  swim(g, from, form) { return SHOWS.parade(g, from, form, true) },
  // Konami: Dam walks the whole trip again, each stop a picture of a page where it found an egg
  journey(g, from, form) { return SHOWS.parade(g, from, form, false, found().map(picOf).slice(-14)) },
  rise(g, _, form) {
    const s = stage(), n = W() < 480 ? 12 : 18
    const anims = Array.from({ length: n }, (_, i) => {
      const it = item(s, g[i % g.length], rand(34, 64)), sw = rand(18, 40)
      it.style.left = rand(0, W() - 60) + 'px'; it.style.top = H() + 'px'
      return it.animate([{ transform: 'translate(0,0)', opacity: 0 }, { transform: `translate(${sw}px,-${H() * 0.4}px)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${-sw}px,-${H() * 0.8}px)`, opacity: 1, offset: 0.7 }, { transform: `translate(0,-${H() + 140}px)`, opacity: 0 }],
      { duration: rand(5200, 8200), delay: rand(0, 1600), easing: 'ease-in-out', fill: 'forwards' })
    })
    anims.push(figure(s, form, 6500))
    return done(anims, s)
  },
  rain(g, _, form) {
    const s = stage(), n = W() < 480 ? 16 : 26
    const anims = Array.from({ length: n }, (_, i) => {
      const it = item(s, g[i % g.length], rand(28, 56), 'still')
      it.style.left = rand(0, W() - 50) + 'px'; it.style.top = '-80px'
      return it.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: `translateY(${H() + 160}px) rotate(${rand(-200, 200)}deg)` }],
        { duration: rand(2400, 4600), delay: rand(0, 2200), easing: 'cubic-bezier(.45,0,.9,.6)', fill: 'forwards' })
    })
    anims.push(figure(s, form, 6000))
    return done(anims, s)
  },
  burst(g, from, form) {
    const r = from && from.getBoundingClientRect(), seen = r && r.top > 0 && r.bottom < H()
    const x = seen ? r.left + r.width / 2 : W() / 2, y = seen ? r.top + r.height / 2 : H() * 0.75
    if (window.Dingbats && window.Dingbats.burst) {
      window.Dingbats.burst(x, y, { names: g, n: 18, size: 38, life: 1.8 })
      setTimeout(() => window.Dingbats.burst(x, y, { names: [...g, stand(form)], n: 14, size: 46, life: 2 }), 500)
    }
    return sleep(1500)
  },
  // chapter 9: Dam walks to the water, looks down, the black swan looks back; Dam is the swan; it flaps; its feathers rise
  async reveal(g) {
    const s = stage(), band = doc.createElement('div'); band.className = 'hd-band lake'; s.appendChild(band)
    const size = W() < 480 ? 74 : 96, mid = W() / 2 - size * 0.6
    band.animate([{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 400, fill: 'forwards' })
    const dam = item(band, 'duckling-fledgling', size); dam.style.left = '0'; dam.style.bottom = '108px'
    const walk = dam.animate([{ transform: `translateX(${-size * 1.4}px)` }, { transform: `translateX(${mid}px)` }], { duration: 2600, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' })
    const mirror = item(band, 'hongsa-stand', size, 'still'); mirror.style.left = mid + 'px'; mirror.style.bottom = '-6px'
    mirror.animate([{ opacity: 0, transform: 'scaleY(-1)' }, { opacity: 0, transform: 'scaleY(-1)', offset: 0.45 }, { opacity: 0.5, transform: 'scaleY(-1)' }], { duration: 3600, fill: 'forwards' })
    await walk.finished.catch(() => {})
    await sleep(1400)
    const el = dam.querySelector('doodle-dingbat'); el.setAttribute('name', 'hongsa-stand')
    await sleep(120); if (el.__db) el.__db.onTap()
    const up = Array.from({ length: 9 }, (_, i) => {
      const f = item(band, 'feather', rand(18, 30)); f.style.left = (mid + size * 0.5 + rand(-40, 40)) + 'px'; f.style.bottom = '150px'
      return f.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${rand(-140, 140)}px,-${rand(160, 320)}px) rotate(${rand(-180, 180)}deg)`, opacity: 0 }], { duration: rand(2400, 3600), delay: 300 + i * 120, easing: 'ease-out', fill: 'forwards' })
    })
    await Promise.all(up.map((a) => a.finished.catch(() => {})))
    await sleep(500)
    await band.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(30px)' }], { duration: 400, fill: 'forwards' }).finished.catch(() => {})
    s.remove()
  },
}
// Dam (or the swan) comes up from the foot of the screen, stays a while, goes back down
function figure(s, form, ms) {
  const f = item(s, stand(form), 90); f.style.left = (W() / 2 - 45) + 'px'; f.style.top = H() + 'px'
  return f.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-110px)', offset: 0.18 }, { transform: 'translateY(-110px)', offset: 0.85 }, { transform: 'translateY(0)' }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' })
}

// The card: the chapter (when this egg starts one), the page's line, a moment or rare egg, the trip, the feathers
function card(o) {
  const old = doc.querySelector('.hd-toast'); if (old) old.remove()
  const list = o.list || found(), n = list.length, g = golds(), stops = list.slice(-12)
  const trip = n ? `<div class="hd-trip" aria-hidden="true">${list.length > stops.length ? '<i>…</i>' : ''}${stops.map((k) => `<span>${db(picOf(k), { play: 'still', size: '22px' })}</span>`).join('')}<span class="dam">${db(o.form, { size: '34px' })}</span></div>` : ''
  const fx = Array.from({ length: Math.min(9, n) }, (_, i) => db('feather', { play: 'still', size: '16px', ink: i < g ? ST.feathers.golden.ink : null })).join('')
  const t = doc.createElement('div')
  t.className = 'hd-toast'; t.setAttribute('role', 'status')
  t.innerHTML = `<span class="fig" aria-hidden="true">${db(stand(o.ch && o.ch.form ? ST.character.forms[o.ch.form].glyph : o.form), { size: '52px' })}</span><div>` +
    (o.ch ? `<p class="ch">${esc(o.ch.say)}</p>${o.ch.then ? `<p>${esc(o.ch.then)}</p>` : ''}` : '') +
    (o.line ? `<p>${esc(o.line)}</p>` : '') + (o.html ? `<p>${o.html}</p>` : '') +
    (o.notes || []).map((x) => `<p class="m">${esc(x)}</p>`).join('') + trip +
    `<p class="n"><span class="hd-feathers" aria-hidden="true">${fx}</span>${n} ${n === 1 ? 'egg' : 'eggs'} found on hongdam.net${g ? ` · ${g} golden` : ''}</p>` +
    `</div><button class="x" type="button" aria-label="Close">×</button>`
  doc.body.appendChild(t)
  const close = () => { t.remove(); removeEventListener('keydown', key) }
  const key = (e) => { if (e.key === 'Escape') close() }
  t.querySelector('button.x').addEventListener('click', close)
  addEventListener('keydown', key)
  setTimeout(close, o.ch ? 16000 : 11000)
}
// a short line on its own (the egg rolled; a typed word)
function note(lines) { card({ notes: lines, list: found(), form: formAt(found().length) }) }

// Typing: egg or swan hatches the page's egg; the story's words play once a visit; the Konami code walks the trip.
const WORDS = Object.entries(ST.words).filter(([k, v]) => k !== 'about' && !v.keys).flatMap(([k, v]) => [k, ...(v.also || [])].map((w) => [w.toLowerCase(), k]))
const KONAMI = ST.words.konami.keys.map((k) => k.toLowerCase())
let typed = '', keys = []
async function word(k) {
  const played = (sess('hd-words') || '').split(' ')
  if (played.includes(k) || busy) return
  sess('hd-words', played.concat(k).join(' ').trim())
  busy = true
  await pictures()
  const w = ST.words[k], g = w.n ? Array(w.n).fill(w.g[0]) : w.g, form = formAt(found().length)
  if (!calm()) await SHOWS[w.show](g, BTN, form)
  note([w.say])
  busy = false
}
addEventListener('keydown', (e) => {
  const el = e.target
  if (!EGG || e.metaKey || e.ctrlKey || e.altKey || (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))) return
  keys = keys.concat(e.key.toLowerCase()).slice(-KONAMI.length)
  if (keys.join(' ') === KONAMI.join(' ')) { keys = []; return word('konami') }
  if (e.key.length !== 1) return
  typed = (typed + e.key.toLowerCase()).slice(-12)
  if (/(egg|swan)$/.test(typed)) { typed = ''; if (BTN && !busy) return BTN.dataset.state === 'feather' ? trail() : hatch(false) }
  const hit = WORDS.find(([w]) => typed.endsWith(w))
  if (hit) { typed = ''; word(hit[1]) }
})

// The egg comes once the page has settled, so it never holds up the page.
const later = window.requestIdleCallback || ((f) => setTimeout(f, 1200))
const start = () => later(() => core().then(() => script(DATA.base)).catch(() => {}).then(place))
if (doc.readyState === 'complete') start(); else addEventListener('load', start)

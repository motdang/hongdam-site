// eggs.js — the easter egg each page of hongdam.net hides. Near the foot of the page sits a small egg;
// tap it (or type egg or swan) and it cracks, then the page's own show plays: the black swan leads a line of
// doodle dingbats across, swims, or the page's pictures rise, rain or burst; then one line, and a count of the
// eggs this browser has found. Written by tools/eggs.mjs from data/eggs.json; changes go there.
// Added to every page by functions/_middleware.js.
const DATA = /*DATA*/{"core":"/assets/db/core.js?v=31a5bb59","base":"/assets/eggs/5d85b772.js","pages":{"404":{"show":"parade","g":["footsteps","compass","search","home"],"say":"Lost? So was this swan.","b":"/assets/eggs/98ee9637.js"},"front":{"show":"swim","g":["manicule","scan","gears","done"],"say":"The black swan laid this one. More are hiding on other pages.","b":"/assets/eggs/f235f9a8.js"},"help":{"show":"parade","g":["telephone","chat","wrench","done"],"say":"Phoned, booked, fixed.","b":"/assets/eggs/ad892b6c.js"},"care":{"show":"rise","g":["heart","lotus","sun","frangipani"],"say":"Take it slow.","b":"/assets/eggs/396c95c7.js"},"outsource":{"show":"parade","g":["typewriter","page","clock","done"],"say":"Your inbox is empty. Rest now.","b":"/assets/eggs/47164a6c.js"},"translate":{"show":"parade","g":["translate","chat","stamp","done"],"say":"สวัสดี · Hello · မင်္ဂလာပါ · 你好","b":"/assets/eggs/a2115d11.js"},"translation":{"show":"parade","g":["translate","chat","stamp","done"],"say":"สวัสดี · Hello · မင်္ဂလာပါ · 你好","b":"/assets/eggs/a2115d11.js"},"shop":{"show":"rain","g":["khao-soi","som-tam","cha-yen","mango-rice","coin"],"say":"Your food is ready!","b":"/assets/eggs/c4644afd.js"},"stay":{"show":"rise","g":["moon","firefly","home","sleepy"],"say":"Sweet dreams.","b":"/assets/eggs/9aea7629.js"},"tours":{"show":"parade","g":["tuk-tuk","songthaew","elephant","chedi"],"say":"Hold on tight!","b":"/assets/eggs/f802c432.js"},"weddings":{"show":"rise","g":["lantern","krathong","balloon","heart"],"say":"Make a wish.","b":"/assets/eggs/39de2188.js"},"luck":{"show":"rain","g":["star","coin","crossed-fingers","dice"],"say":"Nine is the lucky number in Thailand: เก้า (kao) sounds like ก้าว, a step forward.","b":"/assets/eggs/67124465.js"},"merit":{"show":"rise","g":["lotus","candles","phuang-malai","chedi"],"say":"สาธุ — sathu, sathu, sathu.","b":"/assets/eggs/5e3095dc.js"},"web":{"show":"parade","g":["laptop","server","rocket","done"],"say":"The website works. Hooray!","b":"/assets/eggs/996e11c8.js"},"fix":{"show":"parade","g":["ladybug","wrench","lock","check"],"say":"The bug is gone.","b":"/assets/eggs/18156abf.js"},"ai":{"show":"parade","g":["robot","gears","lightbulb","chat"],"say":"Beep boop. The robots wave hello.","b":"/assets/eggs/92384390.js"},"data":{"show":"rain","g":["abacus","search","page","check"],"say":"We counted it two times.","b":"/assets/eggs/e97120bf.js"},"design":{"show":"burst","g":["pencil","scissors","camera","sparkle"],"say":"Drawn by hand, in code.","b":"/assets/eggs/6f384515.js"},"moving":{"show":"parade","g":["parcel","songthaew","airplane","home"],"say":"Box by box.","b":"/assets/eggs/26683f62.js"},"ship":{"show":"parade","g":["parcel","airplane","earth","mailbox"],"say":"A swan signed for your parcel.","b":"/assets/eggs/9344a4cd.js"},"charity":{"show":"rise","g":["balloon","gift","heart","clap"],"say":"Thank you.","b":"/assets/eggs/9b2190b9.js"},"money":{"show":"rain","g":["coin","abacus","check"],"say":"Money in, money out, all written down.","b":"/assets/eggs/c793d70f.js"},"visa":{"show":"parade","g":["passport","stamp","airplane","done"],"say":"Stamped.","b":"/assets/eggs/c5f75599.js"},"buy":{"show":"parade","g":["send","coin","gears","done"],"say":"Thank you for shopping with a swan.","b":"/assets/eggs/bb9a92b9.js"},"ask":{"show":"rise","g":["envelope","paper-boat","chat"],"say":"A message in a paper boat.","b":"/assets/eggs/e4f5e585.js"},"bots":{"show":"parade","g":["robot","rocket","coin","songthaew"],"say":"This bot hatched an egg.","b":"/assets/eggs/9a247d35.js"},"github":{"show":"rain","g":["octopus","star","rocket"],"say":"Starred.","b":"/assets/eggs/6911e2ad.js"},"php":{"show":"parade","g":["elephant","wrench","lock","check"],"say":"The PHP elephant says thank you.","b":"/assets/eggs/37f79c17.js"},"own":{"show":"parade","g":["robot","laptop","key","home"],"say":"Your own robot, on your own account.","b":"/assets/eggs/1e888112.js"},"redteam":{"show":"burst","g":["skull","lock","lightning","check"],"say":"Nice try.","b":"/assets/eggs/9c8d7f9a.js"},"market":{"show":"rain","g":["parcel","coin","cart"],"say":"Sold.","b":"/assets/eggs/b3115390.js"},"portfolio":{"show":"burst","g":["camera","star","sparkle","rocket"],"say":"Hung on the wall.","b":"/assets/eggs/07da89c1.js"},"tasks":{"show":"parade","g":["ants","gears","check"],"say":"Many people, one job.","b":"/assets/eggs/15d27b23.js"},"tasks/graph":{"show":"burst","g":["hilbert","link","dna"],"say":"Everything connects.","b":"/assets/eggs/ff1953e4.js"},"events":{"show":"parade","g":["mic","laptop","calendar"],"say":"See you there.","b":"/assets/eggs/5e11ea4e.js"},"#p4m9e8":{"show":"rain","g":["coin","check","heart"],"say":"Thank you.","b":"/assets/eggs/39d1db57.js"},"#tgpy3w":{"show":"rain","g":["abacus","coin","eye"],"say":"Counted.","b":"/assets/eggs/7af70ad2.js"},"#mzhnby":{"show":"rise","g":["note","music-box","bo-sang","lotus"],"say":"A song for the trip.","b":"/assets/eggs/660bb443.js"},"#vdfzt6":{"show":"rise","g":["heart","gift","lotus"],"say":"Thank you.","b":"/assets/eggs/db6c676c.js"},"#vcroji":{"show":"rise","g":["sprout","tree","sun","leaf"],"say":"Plant something.","b":"/assets/eggs/eade082a.js"},"#1frmsun":{"show":"parade","g":["pencil","page","bell","star"],"say":"Class dismissed.","b":"/assets/eggs/e531a953.js"},"#ykimqp":{"show":"parade","g":["clap","wai","heart","check"],"say":"Many people, one job.","b":"/assets/eggs/23416e0b.js"},"#pz6v62":{"show":"parade","g":["elephant","tree","clock","home"],"say":"Then and now.","b":"/assets/eggs/3c3c5cae.js"},"#1cs725h":{"show":"parade","g":["ants","pin","home"],"say":"The ants say hello.","b":"/assets/eggs/211b2f23.js"},"#iy27uy":{"show":"parade","g":["pin","earth","sprout"],"say":"Pinned.","b":"/assets/eggs/37777a58.js"},"#avf89j":{"show":"parade","g":["scooter","wrench","translate","done"],"say":"Driving again.","b":"/assets/eggs/c99e4ca8.js"},"default":{"show":"burst","g":["egg","sparkle","star"],"say":"Found one.","b":"/assets/eggs/5cb6b9d2.js"}}}/*END*/
const doc = document
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) } catch { return null } }

// The page's egg: <body data-egg>, else the longest start of the path (language prefix dropped) with an egg.
// Pages not listed anywhere public are kept under '#' + a hash of their path.
const fnv = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0 } return h.toString(36) }
function keyOf() {
  const b = doc.body && doc.body.dataset.egg
  if (b && DATA.pages[b]) return [b, b]
  const p = location.pathname.replace(/^\/(th|my|zh|de)(?=\/)/, '').replace(/index\.html$/, '').replace(/^\/+|\/+$/g, '')
  if (!p) return ['front', 'front']
  const parts = p.split('/')
  for (let i = parts.length; i > 0; i--) {
    const k = parts.slice(0, i).join('/')
    if (DATA.pages[k]) return [k, k]
    if (DATA.pages['#' + fnv(k)]) return [k, '#' + fnv(k)]
  }
  return [p, 'default']
}
const [KEY, AT] = keyOf()
const EGG = DATA.pages[AT]

const loaded = {}
const script = (src) => loaded[src] || (loaded[src] = new Promise((ok, no) => {
  const s = doc.createElement('script'); s.src = src; s.async = false; s.onload = ok; s.onerror = no; doc.head.appendChild(s)
}))
const core = () => (window.Dingbats ? Promise.resolve() : script(DATA.core))
const db = (name, o = {}) => `<doodle-dingbat name="${esc(name)}" play="${o.play || 'loop'}" look="riso"${o.size ? ` size="${o.size}"` : ''}${o.label ? ` label="${esc(o.label)}"` : ' aria-hidden="true"'}></doodle-dingbat>`

const CSS = `
.hd-egg-spot{display:block;margin:10px 0 0;line-height:0}
.hd-egg{all:unset;cursor:pointer;display:inline-block;padding:6px;line-height:0;border-radius:50%;opacity:.8;transition:opacity .3s,transform .3s}
.hd-egg:hover,.hd-egg:focus-visible{opacity:1;transform:rotate(-8deg) scale(1.15)}
.hd-egg:focus-visible{outline:3px solid currentColor;outline-offset:2px}
.hd-egg[data-found]{opacity:.55}
.hd-show{position:fixed;inset:0;pointer-events:none;z-index:2147482000;overflow:hidden}
.hd-show .it{position:absolute;line-height:0;will-change:transform}
.hd-band{position:absolute;left:-2px;right:-2px;bottom:22vh;height:118px;background:#FFFDF8;border-block:4px solid #121212;color:#121212;box-shadow:0 8px 0 #121212}
.hd-band:before{content:"";position:absolute;left:0;right:0;bottom:24px;height:8px;background:var(--hd-line,#2B5BA8)}
.hd-band.water{background:#DDEBF7}
.hd-band.water:before{bottom:34px;height:4px;background:#2B5BA8;opacity:.6}
.hd-toast{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147482500;width:max-content;max-width:calc(100vw - 32px);box-sizing:border-box;
 background:#FFFDF8;color:#121212;border:4px solid #121212;box-shadow:8px 8px 0 #121212;padding:12px 44px 12px 14px;
 font:600 18px/1.35 Futura,"Futura PT",Jost,"Avenir Next","Noto Sans Thai","Noto Sans Myanmar","PingFang SC",Thonburi,system-ui,sans-serif;display:flex;gap:12px;align-items:center}
.hd-toast p{margin:0}
.hd-toast small{display:block;font-weight:400;font-size:15px;color:#4A4640;margin-top:2px}
.hd-toast button{all:unset;cursor:pointer;position:absolute;right:6px;top:6px;width:32px;height:32px;display:grid;place-items:center;font:700 22px/1 system-ui,sans-serif;color:#121212}
.hd-toast button:focus-visible{outline:3px solid #121212}
.hd-toast .pics{display:flex;gap:4px;flex-wrap:wrap}
`

function place() {
  if (!EGG || doc.querySelector('.hd-egg')) return
  const style = doc.createElement('style'); style.textContent = CSS; doc.head.appendChild(style)
  const spot = (EGG.at && doc.querySelector(EGG.at)) || doc.querySelector('footer') || doc.querySelector('main') || doc.body
  const n = [...KEY].reduce((a, c) => a + c.charCodeAt(0), 0)
  const p = doc.createElement('span')
  p.className = 'hd-egg-spot'
  p.style.textAlign = ['left', 'center', 'right'][n % 3]
  p.innerHTML = `<button class="hd-egg" type="button" aria-label="An egg">${db('egg', { play: 'hover', size: '28px' })}</button>`
  spot.appendChild(p)
  const btn = p.firstChild
  if ((store('hd-eggs') || '').split(' ').includes(KEY)) btn.dataset.found = ''
  btn.addEventListener('click', (e) => {
    const egg = btn.querySelector('doodle-dingbat')
    if (!e.target.closest('doodle-dingbat') && egg && egg.__db) egg.__db.onTap()
    hatch(btn)
  })
}

let busy = false, counted = false
async function hatch(from) {
  if (busy) return
  busy = true
  try { await core(); await script(DATA.base); if (EGG.b) await script(EGG.b) } catch { /* the line still shows */ }
  await new Promise((r) => setTimeout(r, from && !calm() ? 900 : 0))
  const found = new Set((store('hd-eggs') || '').split(' ').filter(Boolean))
  found.add(KEY)
  store('hd-eggs', [...found].join(' '))
  if (!counted && window.hd) { window.hd('egg', KEY); counted = true }
  const b = doc.querySelector('.hd-egg'); if (b) b.dataset.found = ''
  if (!calm()) await SHOWS[EGG.show](EGG.g, from)
  toast(found.size)
  busy = false
}

const W = () => innerWidth, H = () => innerHeight
const rand = (a, b) => a + Math.random() * (b - a)
function stage() { const s = doc.createElement('div'); s.className = 'hd-show'; s.setAttribute('aria-hidden', 'true'); doc.body.appendChild(s); return s }
function item(s, name, size, play = 'loop') { const i = doc.createElement('span'); i.className = 'it'; i.innerHTML = db(name, { play, size: size + 'px' }); s.appendChild(i); return i }
const done = (anims, s) => Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(() => s.remove())

const SHOWS = {
  // the swan waddles in front, the page's pictures behind it, along a line across the screen
  parade(g, _, water) {
    const s = stage(), band = doc.createElement('div'); band.className = 'hd-band' + (water ? ' water' : ''); s.appendChild(band)
    const size = W() < 480 ? 54 : 70, gap = size * 1.35, list = water ? ['hongsa'] : ['hongsa-walk', ...g], span = list.length * gap + W()
    const ms = water ? 11000 : Math.max(6500, span * 6.5)
    const anims = list.map((name, i) => {
      const it = item(band, name, i || water ? size : size * 1.2)
      it.style.left = '0'; it.style.bottom = water ? '22px' : '30px'
      const x0 = -gap * (i + 1), x1 = W() + gap * (list.length - i)
      return it.animate([{ transform: `translateX(${x0}px)` }, { transform: `translateX(${x1}px)` }], { duration: ms, easing: 'linear', fill: 'forwards' })
    })
    if (water) anims.push(...g.map((name, i) => {
      const it = item(band, name, size * 0.6, 'still'); it.style.left = '0'; it.style.bottom = '64px'
      return it.animate([{ transform: `translate(${-size}px,0)`, opacity: 0 }, { transform: `translate(${W() * (0.2 + 0.6 * i / g.length)}px,-6px)`, opacity: 1, offset: 0.4 }, { transform: `translate(${W() * (0.2 + 0.6 * i / g.length)}px,-6px)`, opacity: 0 }], { duration: ms, delay: 600 + i * 500, fill: 'forwards' })
    }))
    band.animate([{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none', offset: 0.06 }, { opacity: 1, transform: 'none', offset: 0.94 }, { opacity: 0, transform: 'translateY(30px)' }], { duration: ms + 400, fill: 'forwards' })
    return done(anims, s)
  },
  // the swan on the water, the page's pictures surfacing behind it
  swim(g, from) { return SHOWS.parade(g, from, true) },
  // the pictures float up from the foot of the screen, swaying, like lanterns
  rise(g) {
    const s = stage(), n = W() < 480 ? 12 : 18
    const anims = Array.from({ length: n }, (_, i) => {
      const it = item(s, g[i % g.length], rand(34, 64)), x = rand(0, W() - 60)
      it.style.left = x + 'px'; it.style.top = H() + 'px'
      const sw = rand(18, 40)
      return it.animate([{ transform: 'translate(0,0)', opacity: 0 }, { transform: `translate(${sw}px,-${H() * 0.4}px)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${-sw}px,-${H() * 0.8}px)`, opacity: 1, offset: 0.7 }, { transform: `translate(0,-${H() + 140}px)`, opacity: 0 }],
      { duration: rand(5200, 8200), delay: rand(0, 1600), easing: 'ease-in-out', fill: 'forwards' })
    })
    const sw = item(s, 'hongsa-stand', 90); sw.style.left = (W() / 2 - 45) + 'px'; sw.style.top = H() + 'px'
    anims.push(sw.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-110px)', offset: 0.15 }, { transform: 'translateY(-110px)', offset: 0.85 }, { transform: 'translateY(0)' }], { duration: 6500, easing: 'ease-in-out', fill: 'forwards' }))
    return done(anims, s)
  },
  // the pictures fall from the top, turning
  rain(g) {
    const s = stage(), n = W() < 480 ? 16 : 26
    const anims = Array.from({ length: n }, (_, i) => {
      const it = item(s, g[i % g.length], rand(28, 56), 'still'), x = rand(0, W() - 50), r = rand(-200, 200)
      it.style.left = x + 'px'; it.style.top = '-80px'
      return it.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: `translateY(${H() + 160}px) rotate(${r}deg)` }],
        { duration: rand(2400, 4600), delay: rand(0, 2200), easing: 'cubic-bezier(.45,0,.9,.6)', fill: 'forwards' })
    })
    const sw = item(s, 'hongsa-stand', 90); sw.style.left = (W() / 2 - 45) + 'px'; sw.style.top = H() + 'px'
    anims.push(sw.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-110px)', offset: 0.2 }, { transform: 'translateY(-110px)', offset: 0.85 }, { transform: 'translateY(0)' }], { duration: 6000, easing: 'ease-in-out', fill: 'forwards' }))
    return done(anims, s)
  },
  // the pictures spray out of the egg
  burst(g, from) {
    // from the egg when it is on the screen, else from low in the middle; ink: the page's own text colour
    const r = from && from.getBoundingClientRect(), seen = r && r.top > 0 && r.bottom < H()
    const x = seen ? r.left + r.width / 2 : W() / 2, y = seen ? r.top + r.height / 2 : H() * 0.75
    if (window.Dingbats && window.Dingbats.burst) {
      window.Dingbats.burst(x, y, { names: g, n: 18, size: 38, life: 1.8 })
      setTimeout(() => window.Dingbats.burst(x, y, { names: [...g, 'hongsa-stand'], n: 14, size: 46, life: 2 }), 500)
    }
    return new Promise((r) => setTimeout(r, 1500))
  },
}

function toast(count) {
  const old = doc.querySelector('.hd-toast'); if (old) old.remove()
  const t = doc.createElement('div')
  t.className = 'hd-toast'; t.setAttribute('role', 'status')
  t.innerHTML = `<span aria-hidden="true">${db('hongsa-stand', { size: '44px' })}</span><p>${esc(EGG.say)}<small>${count} ${count === 1 ? 'egg' : 'eggs'} found on hongdam.net</small>` +
    (calm() ? `<span class="pics" aria-hidden="true">${EGG.g.map((n) => db(n, { play: 'still', size: '28px' })).join('')}</span>` : '') +
    `</p><button type="button" aria-label="Close">×</button>`
  doc.body.appendChild(t)
  const close = () => { t.remove(); removeEventListener('keydown', esc_) }
  const esc_ = (e) => { if (e.key === 'Escape') close() }
  t.querySelector('button').addEventListener('click', close)
  addEventListener('keydown', esc_)
  setTimeout(close, 9000)
}

// Typing egg, swan or หงส์ anywhere outside a field hatches it too.
let typed = ''
addEventListener('keydown', (e) => {
  const el = e.target
  if (!EGG || e.metaKey || e.ctrlKey || e.altKey || (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))) return
  if (e.key.length !== 1) return
  typed = (typed + e.key.toLowerCase()).slice(-8)
  if (/(egg|swan|หงส์)$/.test(typed)) { typed = ''; hatch(doc.querySelector('.hd-egg')) }
})

// The egg comes once the page has settled, so it never holds up the page.
const later = window.requestIdleCallback || ((f) => setTimeout(f, 1200))
const start = () => later(() => core().then(() => script(DATA.base)).catch(() => {}).then(place))
if (doc.readyState === 'complete') start(); else addEventListener('load', start)

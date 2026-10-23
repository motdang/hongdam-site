// shop.js — the front page, category pages and Buy page on hongdam.net (her ask 2026-10-23).
// Page data: <script type="application/json" id="shop"> written by tools/build_shop.py.
// Prices on the page are the last build's; this reads today's from /api/services, /api/php,
// /api/github and /api/bots. The Buy page posts to /api/buy, which works the price out again.
import { promptPayPayload } from '/pay/promptpay.js'
import { qrToSvg } from '/pay/qr.js'

const D = JSON.parse(document.getElementById('shop').textContent)
// The card list (names, prices, options, search words) is one file per language, shared by every page.
const cardsP = fetch(D.cardsUrl).then((r) => r.json()).catch(() => [])
const T = D.ui
const $ = (s, r = document) => r.querySelector(s)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const fmt = (n, cur = 'THB') => (cur === 'USD' ? 'US$' : '฿') + Number(n).toLocaleString('en-US')
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
function ride(job) {
  const stops = [...job.querySelectorAll('.stop')], n = stops.length
  const to = parseFloat(getComputedStyle(job).getPropertyValue('--to')) || (job.style.getPropertyValue('--to') === '0' ? 0 : 1)
  const reach = Math.floor(to * (n - 1) + 1e-6), dur = 520 * Math.max(1, reach) + 300
  job.style.setProperty('--dur', dur + 'ms')
  if (calm.matches) { job.classList.add('go'); stops.slice(0, reach + 1).forEach((s) => s.classList.add('hit')); return }
  // the swan waddles along the line, then stands at its stop and looks round
  const sw = job.querySelector('.rider doodle-dingbat')
  if (sw && reach > 0) { sw.setAttribute('name', 'hongsa-walk'); setTimeout(() => sw.setAttribute('name', 'hongsa-stand'), dur) }
  requestAnimationFrame(() => job.classList.add('go'))
  stops.slice(0, reach + 1).forEach((s, i) => setTimeout(() => {
    const g = s.querySelector('doodle-dingbat')
    s.classList.add('hit')
    if (i === n - 1 && g && g.__db) g.__db.onTap()   // the end of the line: its tap reaction, the job done
    else if (g) g.setAttribute('play', 'once')
  }, reach ? i / reach * (dur - 300) + 150 : 150))
}
const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); ride(e.target) } }), { threshold: 0.55 }) : null
function lines(root = document) {
  root.querySelectorAll('.job:not([data-seen])').forEach((j) => { j.dataset.seen = 1; if (io) io.observe(j); else ride(j) })
}

// Language: a choice made by hand is kept; the English front page opens the phone's language once.
document.querySelectorAll('[data-setlang]').forEach((a) => a.addEventListener('click', () => store('hd-lang', a.dataset.setlang)))
if (D.front && D.lang === 'en' && !store('hd-lang')) {
  const want = (navigator.languages || [navigator.language || '']).map((x) => String(x).slice(0, 2).toLowerCase()).find((x) => D.langs.includes(x))
  if (want && want !== 'en') location.replace('/' + want + '/')
}

// Today's prices
const live = {}
// The walk's number for a price shown in cur, or undefined while the walk has none in that currency (functions/_shop.js walkNum).
const walkNum = (k, part, cur) => !k ? undefined : part === 'tail' ? (k.tail > 0 ? k.tail : undefined)
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
    el.innerHTML = `<summary><span class="bars" aria-hidden="true">${bars}</span>${dots}<span>${esc(T.slotsOpen.replace('{n}', left))}</span></summary><p>${esc(T.ladder)}</p>`
    el.hidden = false
  })
}

// Search, on any page that has the box: every language's words, whatever the page's language.
const cardHtml = (c) => `<li class="card" style="--line:var(--c-${esc(c.cat)})">${c.pic ? jobHtml(c.pic) : ''}<h3>${esc(c.n)}</h3><p class="price">${c.ph}</p><p class="l">${esc(c.l)}</p>` +
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
async function track(root, ref) {
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
    `<p class="state" role="status">${esc(said[o.state] || T.tOrdered)}</p>` +
    (steps.length ? jobHtml(steps.map((s) => s.db), { cls: 'big track', to: at / (steps.length - 1), caps: [T.tOrdered, T.tPaid, T.tStarted, T.tDone].map(esc) }) : '') +
    `<p class="note">${esc(T.trackKeep)}</p><p><a class="btn alt" href="${esc(D.lineUrl)}">${esc(T.msgUs)} · ${esc(o.ref)}</a></p>`
  glyphs(card.cat)
}
const trackLink = (ref) => `<p><a class="btn" href="${esc(location.pathname)}?ref=${encodeURIComponent(ref)}">${esc(T.trackH)} · ${esc(ref)}</a></p>`

// The Buy page
let buy = null
async function startBuy() {
  const root = $('#buy')
  if (!root) return null
  const P = new URLSearchParams(location.search)
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
    const p = o.price, w = walkOf(p.w)
    let t = p.tier ? (walkNum(w, 'price', 'THB') ?? p.tier[0]) + Math.max(0, n - p.tier[1]) * (walkNum(w, 'tail', 'THB') ?? p.tier[2]) : base(o) * n
    if (add && card.add && !p.usd) t += (walkNum(walkOf(card.add.w), 'price', 'THB') ?? card.add.fixed) * n
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
${card.add ? `<label class="opt"><input type="checkbox" name="addon"> <span>${card.add.nh || esc(card.add.n)}</span></label>` : ''}
<p class="tot"><span>${esc(T.total)}</span> <b id="total"></b></p><p id="halfnote" class="note" hidden></p>
<label class="field">${esc(T.reach)}<input name="contact" required autocomplete="tel" maxlength="120"></label>
<label class="field">${esc(T.note)}<textarea name="note" rows="3" maxlength="600"></textarea></label>
<button class="btn big" type="submit">${esc(T.next)}</button>
<p id="bmsg" role="status"></p>
</form><div id="pay" hidden></div>`
  const f = $('#bf', root), qty = f.elements.qty
  const n = () => (opt.unit ? Math.max(1, Math.min(opt.max || 99, parseInt(qty.value, 10) || 1)) : 1)
  function redraw() {
    $('#odesc', root).textContent = opt.d || ''
    $('.qtyrow', root).hidden = !opt.unit
    if (opt.unit) { qty.max = opt.max || 99; $('.unit', root).textContent = opt.unitMany || '' }
    card.opts.forEach((o) => { const e = $(`.oprice[data-o="${o.id}"]`, root); if (e && o.price.walk) e.textContent = fmt(base(o)) + (o.per || '') })
    liveText(root)
    const c = cur(opt), t = totalOf(opt, n(), f.elements.addon && f.elements.addon.checked)
    $('#total', root).textContent = fmt(t, c)
    const h = $('#halfnote', root)
    h.hidden = !half(t, c)
    if (half(t, c)) h.textContent = T.half.replace('{now}', fmt(Math.ceil(t / 2), c))
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
        card: card.id, opt: opt.id, qty: n(), addon: !!(f.elements.addon && f.elements.addon.checked), contact, note: f.elements.note.value, lang: D.lang }) })).json()
    } catch { j = { ok: false, why: 'service' } }
    if (!j.ok) { m.textContent = T.err[j.why] || T.err.service; return }
    m.textContent = ''
    f.hidden = true
    pay(j)
  })
  redraw()
  glyphs(card.cat)
  return { redraw }
}

function pay(j) {
  const box = $('#pay')
  box.hidden = false
  const amount = fmt(j.due, j.cur)
  const qr = j.pay.promptpay ? qrToSvg(promptPayPayload({ payeeId: j.pay.promptpay, satang: j.due * 100, merchantName: 'NaNoBotCo', ref: j.ref }),
    { ecl: 'M', border: 4, scale: 6, dark: '#000', light: '#fff', title: `PromptPay ${j.due} THB` }) : ''
  box.innerHTML = `<h2>${esc(T.order)} ${esc(j.ref)}</h2>
<p class="tot"><span>${esc(j.half ? T.payHalf : T.payNow)}</span> <b>${amount}</b></p>
${qr ? `<section class="way"><h3>${esc(T.pp)}</h3><div class="qr">${qr}</div><p>${esc(T.scan)}</p>
<form id="sf" hidden><label class="field">${esc(T.slip)}<input type="file" name="slip" accept="image/*" required></label><button class="btn" type="submit">${esc(T.slipBtn)}</button></form>
<p id="smsg" role="status"></p></section>` : ''}
<section class="way"><h3>PayPal · Wise</h3><p>${esc(T.abroad.replace('{usd}', 'US$' + j.pay.usd).replace('{amount}', amount).replace('{ref}', j.ref))}</p>
<p><a class="btn" href="${esc(j.pay.paypal)}" target="_blank" rel="noopener">PayPal</a> <a class="btn" href="${esc(j.pay.wise)}" target="_blank" rel="noopener">Wise</a></p>
<p><button class="btn alt" type="button" data-claim="paypal">${esc(T.ipaid)} PayPal</button> <button class="btn alt" type="button" data-claim="wise">${esc(T.ipaid)} Wise</button></p>
<p id="cmsg" role="status"></p></section>
<p><a class="btn alt" href="${esc(D.lineUrl)}">${esc(T.msgUs)} · ${esc(j.ref)}</a></p>`
  fetch('/api/buy').then((r) => r.json()).then((s) => {
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

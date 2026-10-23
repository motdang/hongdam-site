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

// Language: a choice made by hand is kept; the English front page opens the phone's language once.
document.querySelectorAll('[data-setlang]').forEach((a) => a.addEventListener('click', () => store('hd-lang', a.dataset.setlang)))
if (D.front && D.lang === 'en' && !store('hd-lang')) {
  const want = (navigator.languages || [navigator.language || '']).map((x) => String(x).slice(0, 2).toLowerCase()).find((x) => D.langs.includes(x))
  if (want && want !== 'en') location.replace('/' + want + '/')
}

// Today's prices
const live = {}
async function loadLive() {
  const apis = ['services', 'php', 'github', 'bots']
  await Promise.all(apis.map(async (a) => {
    try {
      const j = await (await fetch('/api/' + a)).json()
      live[a] = Object.fromEntries((j.kinds || []).map((k) => [k.id, k]))
    } catch { live[a] = {} }
  }))
  document.querySelectorAll('[data-live]').forEach((e) => {
    const [a, id] = e.dataset.live.split('/'), k = live[a] && live[a][id]
    if (!k) return
    e.textContent = k.unit === '%' ? k.price + '%' : fmt(k.baht)
  })
  document.querySelectorAll('[data-min]').forEach((e) => {
    const ks = Object.values(live[e.dataset.min] || {}).filter((k) => k.baht > 0)
    if (ks.length) e.textContent = fmt(Math.min(...ks.map((k) => k.baht)))
  })
  if (buy) buy.redraw()
}

// Search, on any page that has the box: every language's words, whatever the page's language.
const cardHtml = (c) => `<li class="card"><h3>${esc(c.n)}</h3><p class="price">${c.ph}</p><p>${esc(c.l)}</p>` +
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
  }
  q.addEventListener('input', run)
  if (q.value) run()
}

// The Buy page
let buy = null
async function startBuy() {
  const root = $('#buy')
  if (!root) return null
  const P = new URLSearchParams(location.search)
  const card = (await cardsP).find((c) => c.id === P.get('c'))
  if (!card || card.act !== 'buy') { root.innerHTML = `<p>${esc(T.nocard)}</p><p><a class="btn" href="${esc(D.home)}">${esc(T.home)}</a></p>`; return null }
  let opt = card.opts.find((o) => o.id === P.get('o')) || card.opts[0]
  const base = (o) => {
    if (o.price.walk) { const k = live.services && live.services[o.id]; return k && k.baht ? k.baht : o.price.walk }
    return o.price.fixed || o.price.usd || 0
  }
  const totalOf = (o, n, add) => {
    const p = o.price
    let t = p.tier ? p.tier[0] + Math.max(0, n - p.tier[1]) * p.tier[2] : base(o) * n
    if (add && card.add && !p.usd) t += card.add.fixed * n
    return t
  }
  const cur = (o) => (o.price.usd ? 'USD' : 'THB')
  const half = (t, c) => t >= (c === 'USD' ? 300 : 10000)
  root.innerHTML = `<h1>${esc(card.n)}</h1><p>${esc(card.l)}</p>
<form id="bf">
${card.opts.length > 1 ? `<fieldset><legend>${esc(T.choose)}</legend>${card.opts.map((o) =>
    `<label class="opt"><input type="radio" name="opt" value="${esc(o.id)}"${o === opt ? ' checked' : ''}> <span>${esc(o.n)}</span> <b class="oprice" data-o="${esc(o.id)}">${o.ph}</b></label>`).join('')}</fieldset>` : ''}
<p id="odesc"></p>
<div class="qtyrow" hidden><span class="lab">${esc(T.qty)}</span>
 <button type="button" class="step" data-d="-1" aria-label="−">−</button><input name="qty" type="number" inputmode="numeric" min="1" value="1" aria-label="${esc(T.qty)}"><button type="button" class="step" data-d="1" aria-label="+">+</button>
 <span class="unit"></span></div>
${card.add ? `<label class="opt"><input type="checkbox" name="addon"> <span>${esc(card.add.n)}</span></label>` : ''}
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
      if (r.ok) { sf.hidden = true; box.querySelectorAll('[data-claim]').forEach((b) => { b.disabled = true }) }
    })
  }).catch(() => {})
  box.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-claim]'); if (!b) return
    const m = $('#cmsg'); m.textContent = T.sending
    let r
    try { r = await (await fetch('/api/buy/claim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ref: j.ref, how: b.dataset.claim }) })).json() } catch { r = { ok: false } }
    m.textContent = r.ok ? `${T.claimed} ${j.ref}` : T.err.service
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

startBuy().then((b) => { buy = b; loadLive() })

// cur.js — prices in baht, US dollars or euros (her ask 2026-10-24: "a toggle for dollars/euro/baht on hongdam.net").
// Every element with class "amt" is a price: data-n and data-c when a script wrote them, else its text (฿4,000,
// US$99), read again whenever another script changes it. The switch in the top bar shows every price in the
// reader's currency at today's rate (/api/fx), rounded up to a whole unit, with the price as set on hover.
// /api/buy works out the same numbers (functions/_fx.js). A price with data-keep stays as written: the amount of
// an order already placed, a PromptPay QR's baht. Shop pages load it through shop.js; any other page with
// <script type="module" src="/assets/cur.js"></script>, and it brings its own look when shop.css is not there.

export const CURS = ['THB', 'USD', 'EUR']
const SIGN = { THB: '฿', USD: 'US$', EUR: '€' }
const MARK = { THB: 'amt-th', USD: 'amt-us', EUR: 'amt-eu' }
const WORDS = {
  en: ['Currency', 'Thai baht', 'US dollars', 'Euros'],
  th: ['สกุลเงิน', 'บาท', 'ดอลลาร์สหรัฐ', 'ยูโร'],
  my: ['ငွေကြေး', 'ထိုင်းဘတ်', 'အမေရိကန်ဒေါ်လာ', 'ယူရို'],
  zh: ['货币', '泰铢', '美元', '欧元'],
  de: ['Währung', 'Baht', 'US-Dollar', 'Euro'],
}
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) } catch { return null } }

let fx = null   // {rates: {THB: 1, USD: baht per dollar, EUR: baht per euro}, at, suggest, t}
try { const c = JSON.parse(store('hd-fx') || 'null'); if (c && c.rates && c.t > Date.now() - 36e5) fx = c } catch { /* none kept */ }
let pick = CURS.includes(store('hd-cur')) ? store('hd-cur') : null
const subs = []

/** n in from, in to: through baht at today's rate, rounded up to a whole unit; null without rates. */
export function conv(n, from, to, rates = fx && fx.rates) {
  if (from === to || !n) return n
  if (!rates || !(rates[from] > 0) || !(rates[to] > 0)) return null
  return Math.ceil(n * rates[from] / rates[to] - 1e-9)
}
export const fmt = (n, c = 'THB') => SIGN[c] + Number(n).toLocaleString('en-US')
/** The reader's currency: their pick, else their country's, else baht. Baht until a rate is known. */
export const cur = () => (fx ? pick || fx.suggest || 'THB' : 'THB')
export const onCur = (fn) => subs.push(fn)

/** [number, currency] a price set as n in c shows as now. */
export function shown(n, c = 'THB') {
  const to = cur(), v = conv(n, c, to)
  return v == null ? [n, c] : [v, to]
}

/** A price in its mark, in the reader's currency; keep: as written, whatever the switch says. */
export function amtH(n, c = 'THB', keep = false) {
  const [v, to] = keep ? [n, c] : shown(n, c)
  return `<span class="amt ${MARK[to]}" data-n="${n}" data-c="${c}"${keep ? ' data-keep' : ''}${to !== c ? ` title="${fmt(n, c)}"` : ''}>${fmt(v, to)}</span>`
}

/** Set a price element to n in c, shown in the reader's currency. */
export function setAmt(el, n, c = 'THB') { el.dataset.n = n; el.dataset.c = c; delete el.dataset.shown; paintOne(el) }

const READ = /(US\$|฿|€)\s?(\d[\d,]*(?:\.\d+)?)/
function paintOne(el) {
  const t = el.textContent.trim()
  if (!el.dataset.n || (el.dataset.shown && t !== el.dataset.shown)) {   // first look, or another script wrote it
    const m = READ.exec(t)
    if (!m) return
    el.dataset.n = m[2].replace(/,/g, '')
    el.dataset.c = m[1] === 'US$' ? 'USD' : m[1] === '€' ? 'EUR' : 'THB'
  }
  if (el.hasAttribute('data-keep')) { el.dataset.shown = t; return }
  const n = Number(el.dataset.n), c = el.dataset.c, [v, to] = shown(n, c), s = fmt(v, to)
  if (t !== s) el.textContent = s
  el.dataset.shown = s
  for (const k of Object.values(MARK)) el.classList.toggle(k, k === MARK[to])
  if (to !== c) el.title = fmt(n, c); else el.removeAttribute('title')
}
export function paint(root = document) {
  if (root.nodeType === 1 && root.classList.contains('amt')) paintOne(root)
  root.querySelectorAll('.amt').forEach(paintOne)
}

// Prices other scripts write later (today's walked prices, search results, the Buy page) are shown in the pick too.
new MutationObserver((ms) => {
  const seen = new Set()
  for (const m of ms) {
    const el = m.target.nodeType === 1 ? m.target : m.target.parentElement
    const a = el && el.closest('.amt')
    if (a) seen.add(a)
    m.addedNodes.forEach((x) => { if (x.nodeType === 1) { if (x.classList.contains('amt')) seen.add(x); x.querySelectorAll('.amt').forEach((y) => seen.add(y)) } })
  }
  seen.forEach(paintOne)
}).observe(document.documentElement, { subtree: true, childList: true, characterData: true })

// Pages without shop.css: the flags and the switch, plainly.
const FLAGS = {
  th: "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 9 6' preserveAspectRatio='none'%3E%3Cpath fill='%23A51931' d='M0 0h9v6H0z'/%3E%3Cpath fill='%23F4F5F8' d='M0 1h9v4H0z'/%3E%3Cpath fill='%232D2A4A' d='M0 2h9v2H0z'/%3E%3C/svg%3E",
  us: "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 7' preserveAspectRatio='none'%3E%3Cpath fill='%23FFF' d='M0 0h10v7H0z'/%3E%3Cpath fill='%23B22234' d='M0 0h10v1H0zM0 2h10v1H0zM0 4h10v1H0zM0 6h10v1H0z'/%3E%3Cpath fill='%233C3B6E' d='M0 0h4.4v4H0z'/%3E%3C/svg%3E",
  eu: "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 10' preserveAspectRatio='none'%3E%3Cpath fill='%23039' d='M0 0h15v10H0z'/%3E%3Cg fill='%23FC0'%3E%3Ccircle cx='7.5' cy='1.9' r='.55'/%3E%3Ccircle cx='9.05' cy='2.32' r='.55'/%3E%3Ccircle cx='10.18' cy='3.45' r='.55'/%3E%3Ccircle cx='10.6' cy='5' r='.55'/%3E%3Ccircle cx='10.18' cy='6.55' r='.55'/%3E%3Ccircle cx='9.05' cy='7.68' r='.55'/%3E%3Ccircle cx='7.5' cy='8.1' r='.55'/%3E%3Ccircle cx='5.95' cy='7.68' r='.55'/%3E%3Ccircle cx='4.82' cy='6.55' r='.55'/%3E%3Ccircle cx='4.4' cy='5' r='.55'/%3E%3Ccircle cx='4.82' cy='3.45' r='.55'/%3E%3Ccircle cx='5.95' cy='2.32' r='.55'/%3E%3C/g%3E%3C/svg%3E",
}
if (!document.querySelector('link[href*="/assets/shop.css"]')) {
  const st = document.createElement('style')
  st.textContent = `.amt{white-space:nowrap}.amt-th::before,.amt-us::before,.amt-eu::before{content:"";display:inline-block;width:1.1em;height:.74em;margin-right:.28em;vertical-align:-.04em;border-radius:1.5px;background:center/100% 100% no-repeat}
${Object.entries(FLAGS).map(([k, v]) => `.amt-${k}::before{background-image:url("data:image/svg+xml,${v}")}`).join('\n')}
.amt-us{color:var(--usd,inherit)}.amt-eu{color:var(--eur,inherit)}
.curs{display:inline-flex;gap:0;border-radius:999px;box-shadow:inset 0 0 0 1px currentColor;overflow:hidden}.curs[hidden]{display:none}
.curs button{font:inherit;font-weight:700;color:inherit;background:none;border:0;min-height:2.5rem;min-width:2.75rem;padding:.3rem .65rem;cursor:pointer;display:inline-flex;align-items:center}
.curs button[aria-pressed="true"]{box-shadow:inset 0 0 0 2.5px currentColor;border-radius:999px;text-decoration:underline 2px;text-underline-offset:.2em}`
  document.head.appendChild(st)
}

// The switch: three buttons at the end of the language row in the top bar.
function toggle() {
  const top = document.querySelector('header.top')
  if (!top || top.querySelector('.curs')) return
  const w = WORDS[(document.documentElement.lang || 'en').slice(0, 2)] || WORDS.en
  const g = document.createElement('div')
  g.className = 'curs'
  g.setAttribute('role', 'group')
  g.setAttribute('aria-label', w[0])
  g.innerHTML = CURS.map((c, i) => `<button type="button" data-cur="${c}" aria-label="${w[i + 1]}" title="${w[i + 1]}" aria-pressed="false"><i class="${MARK[c]}" aria-hidden="true"></i><span>${c === 'USD' ? '$' : SIGN[c]}</span></button>`).join('')
  ;(top.querySelector('.langs') || top).appendChild(g)
  g.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cur]')
    if (!b) return
    pick = b.dataset.cur
    store('hd-cur', pick)
    show()
  })
}
function show() {
  const g = document.querySelector('header.top .curs')
  if (g) {
    g.hidden = !fx
    g.querySelectorAll('[data-cur]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cur === cur())))
  }
  paint()
  subs.forEach((fn) => { try { fn(cur()) } catch { /* one page's redraw */ } })
}

async function load() {
  try {
    const j = await (await fetch('/api/fx')).json()
    if (j && j.rates && j.rates.USD > 0 && j.rates.EUR > 0) {
      fx = { rates: { THB: 1, USD: j.rates.USD, EUR: j.rates.EUR }, at: j.at, suggest: j.suggest, t: Date.now() }
      store('hd-fx', JSON.stringify(fx))
    }
  } catch { /* prices stay as set */ }
  show()
}

toggle()
show()
if (!fx || fx.t < Date.now() - 6e5) load()

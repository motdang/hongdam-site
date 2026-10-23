// hd.js — what people do on hongdam.net, for Nan's /stats/ page: pages seen, searches and what they found,
// Buy, Book, Ask and LINE taps, language changes, orders, eggs. Events wait in a list and go to /api/hit in
// one beacon when the page is hidden or left. Added to every page by functions/_middleware.js.
// Other scripts note an event with window.hd(kind, what, number).
const P = location.pathname
const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
const ok = !/^\/stats\//.test(P) && (local || (location.protocol === 'https:' && !navigator.webdriver))
const lang = document.documentElement.lang || 'en'
const id = (() => {
  try {
    let s = sessionStorage.getItem('hd-s')
    if (!s) { s = Math.random().toString(36).slice(2, 12).padEnd(10, '0'); sessionStorage.setItem('hd-s', s) }
    return s
  } catch { return Math.random().toString(36).slice(2, 12).padEnd(10, '0') }
})()
const queue = []
const hd = (k, d, n) => { if (ok) queue.push({ k, p: P, l: lang, d: d == null ? undefined : String(d).slice(0, 120), n }) }
window.hd = hd

function send() {
  if (!queue.length) return
  const body = JSON.stringify({ s: id, ev: queue.splice(0, 40) })
  try { if (navigator.sendBeacon && navigator.sendBeacon('/api/hit', new Blob([body], { type: 'text/plain' }))) return } catch { /* fall through */ }
  fetch('/api/hit', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'text/plain' } }).catch(() => {})
}
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') send() })
addEventListener('pagehide', send)
setInterval(send, 30000)

// The page itself: where the visitor came from, and how wide the screen is.
let ref = ''
try { const r = document.referrer && new URL(document.referrer); if (r && r.host !== location.host) ref = r.host } catch { /* none */ }
const utm = new URLSearchParams(location.search).get('utm_source')
const QS = new URLSearchParams(location.search)
if (ok) queue.push({ k: 'view', p: P, l: lang, d: QS.get('c') || QS.get('about') || undefined, r: [utm, ref].filter(Boolean).join(' · ') || undefined, w: innerWidth })

// Taps, read from the link or button pressed.
const cardOf = (el) => {
  const c = el.closest('.card')
  if (c && c.id) return c.id
  const m = (el.getAttribute('href') || '').match(/[?&](?:c|about)=([\w-]+)/)
  return m ? m[1] : ''
}
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a, button')
  if (!a) return
  const href = a.getAttribute('href') || ''
  if (a.dataset.setlang) return hd('lang', a.dataset.setlang)
  if (a.dataset.claim) return hd('claim', a.dataset.claim)
  if (/^https:\/\/line\.me\//.test(href)) return hd('line', cardOf(a) || undefined)
  if (/^mailto:/.test(href)) return hd('mail')
  if (/\/buy\/\?c=/.test(href)) return hd('tap', 'buy:' + cardOf(a))
  if (/\/ask\/\?about=/.test(href)) return hd('tap', 'ask:' + cardOf(a))
  if (a.classList.contains('btn') && a.closest('.card')) return hd('tap', 'go:' + cardOf(a) + ':' + href.replace(/^https?:\/\//, '').slice(0, 60))
  if (/paypal\.|wise\.com/.test(href)) return hd('pay', /paypal/.test(href) ? 'paypal' : 'wise')
  if (/^https?:\/\//.test(href)) { try { const u = new URL(href); if (u.host !== location.host) hd('out', u.host + u.pathname.replace(/\/$/, '')) } catch { /* bad link */ } }
}, true)

// Forms: an order from the Buy page, a PromptPay slip, a note from the Ask page.
document.addEventListener('submit', (e) => {
  const f = e.target
  const c = new URLSearchParams(location.search).get('c')
  if (f.id === 'sf') hd('slip', c || undefined)
  else if (f.id === 'af') hd('ask', new URLSearchParams(location.search).get('about') || undefined)
  else if (f.closest && f.closest('#buy')) hd('order', c || undefined)
}, true)

// Search: the words, and how many cards came up, once the typing stops.
const q = document.getElementById('q')
if (q) {
  let t, last = ''
  const note = () => {
    const w = q.value.trim()
    if (!w || w === last) return
    last = w
    const hits = document.querySelectorAll('#hits .card h3').length
    hd('search', w.toLowerCase().slice(0, 60), hits)
  }
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(note, 1500) })
  q.addEventListener('blur', note)
}

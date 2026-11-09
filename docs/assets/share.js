// share.js — the Share buttons on hongdam.net: beside each service's Buy, and on the page that offers it.
// A phone opens its own share sheet. Elsewhere a small menu: copy the link, then the apps people share with,
// the most used in the page's language first. Taps are counted on /stats/ through hd.js.
//   <button class="share" data-share="/buy/?c=retire" data-t="Retiring in Thailand, handled">
// An empty data-share is the page itself (with its ?c= or ?about=). data-need="c": the button goes when the
// address has no c (or is an order's tracking address, ?ref=).
const SITE = 'https://hongdam.net'
const lang = document.documentElement.lang || 'en'
const W = {
  en: { copy: 'Copy link', copied: 'Copied', mail: 'Email' },
  th: { copy: 'คัดลอกลิงก์', copied: 'คัดลอกแล้ว', mail: 'อีเมล' },
  my: { copy: 'လင့်ခ် ကူးယူရန်', copied: 'ကူးယူပြီးပါပြီ', mail: 'အီးမေးလ်' },
  zh: { copy: '复制链接', copied: '已复制', mail: '邮件' },
  de: { copy: 'Link kopieren', copied: 'Kopiert', mail: 'E-Mail' },
}
const T = W[lang] || W.en
const ORDER = {
  en: ['copy', 'line', 'whatsapp', 'facebook', 'x', 'bluesky', 'mail'],
  th: ['line', 'facebook', 'copy', 'x', 'whatsapp', 'bluesky', 'mail'],
  my: ['facebook', 'copy', 'telegram', 'line', 'whatsapp', 'x', 'mail'],
  zh: ['copy', 'whatsapp', 'line', 'telegram', 'facebook', 'x', 'mail'],
  de: ['whatsapp', 'copy', 'mail', 'facebook', 'x', 'bluesky', 'line'],
}
const e = encodeURIComponent
const APPS = {
  line: ['LINE', (u, t) => `https://social-plugins.line.me/lineit/share?url=${e(u)}&text=${e(t)}`],
  facebook: ['Facebook', (u) => `https://www.facebook.com/sharer/sharer.php?u=${e(u)}`],
  whatsapp: ['WhatsApp', (u, t) => `https://wa.me/?text=${e(t + ' ' + u)}`],
  telegram: ['Telegram', (u, t) => `https://t.me/share/url?url=${e(u)}&text=${e(t)}`],
  x: ['X', (u, t) => `https://x.com/intent/post?text=${e(t)}&url=${e(u)}`],
  bluesky: ['Bluesky', (u, t) => `https://bsky.app/intent/compose?text=${e(t + ' ' + u)}`],
  mail: [T.mail, (u, t) => `mailto:?subject=${e(t)}&body=${e(u)}`],
}

const Q = new URLSearchParams(location.search)
for (const b of document.querySelectorAll('.share[data-need]')) {
  if (!Q.get(b.dataset.need) || Q.has('ref')) b.remove()
}

// What a button shares: its own address, or this page's with only the key that names the service.
function target(b) {
  if (b.dataset.share) return new URL(b.dataset.share, SITE).href
  const u = new URL(location.pathname, SITE)
  for (const k of ['c', 'about']) if (Q.get(k)) u.searchParams.set(k, Q.get(k))
  return u.href
}
const titleOf = (b) => b.dataset.t || document.querySelector('main h1')?.textContent.trim() || document.title
const what = (b) => b.closest('.card')?.id || 'page'
const count = (how, b) => window.hd?.('share', how + ':' + what(b))

let menu, opener
function build() {
  menu = document.createElement('div')
  menu.id = 'share-menu'
  menu.setAttribute('role', 'menu')
  if ('popover' in menu) menu.popover = 'auto'
  else menu.hidden = true
  menu.addEventListener('toggle', (ev) => { if (ev.newState === 'closed') shut(false) })
  menu.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') shut(true) })
  menu.addEventListener('click', (ev) => {
    const a = ev.target.closest('a, button')
    if (!a) return
    if (a.dataset.app === 'copy') {
      ev.preventDefault()
      const u = menu.dataset.url
      const done = () => { a.textContent = T.copied; setTimeout(() => shut(true), 900) }
      ;(navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(done, () => { window.prompt(T.copy, u); shut(true) })
    } else setTimeout(() => shut(false), 0)
    count(a.dataset.app, opener)
  })
  document.body.append(menu)
}
function open(b) {
  if (!menu) build()
  const u = target(b), t = titleOf(b)
  menu.dataset.url = u
  menu.innerHTML = (ORDER[lang] || ORDER.en).map((k) => k === 'copy'
    ? `<button type="button" role="menuitem" data-app="copy">${T.copy}</button>`
    : `<a role="menuitem" data-app="${k}" href="${APPS[k][1](u, t).replace(/"/g, '&quot;')}" target="_blank" rel="noopener">${APPS[k][0]}</a>`).join('')
  opener = b
  if (menu.popover) menu.showPopover()
  else { menu.hidden = false; setTimeout(() => document.addEventListener('click', outside), 0) }
  b.setAttribute('aria-expanded', 'true')
  place(b)
  menu.querySelector('a, button').focus({ preventScroll: true })
}
function place(b) {
  const r = b.getBoundingClientRect(), m = menu.getBoundingClientRect(), gap = 6
  const left = Math.max(8, Math.min(r.left, innerWidth - m.width - 8))
  const top = r.bottom + gap + m.height <= innerHeight - 8 ? r.bottom + gap : Math.max(8, r.top - gap - m.height)
  menu.style.left = left + 'px'
  menu.style.top = top + 'px'
}
let last = { b: null, at: 0 }   // the menu a tap on its own button just closed stays closed
function shut(focus) {
  if (!menu || !opener) return
  const b = opener
  opener = null
  last = { b, at: Date.now() }
  b.setAttribute('aria-expanded', 'false')
  if (menu.popover) { if (menu.matches(':popover-open')) menu.hidePopover() } else { menu.hidden = true; document.removeEventListener('click', outside) }
  if (focus) b.focus({ preventScroll: true })
}
const outside = (ev) => { if (!menu.contains(ev.target)) shut(false) }
addEventListener('scroll', () => shut(false), { passive: true })
addEventListener('resize', () => shut(false))

const phone = matchMedia('(pointer: coarse)')
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest && ev.target.closest('.share')
  if (!b) return
  ev.preventDefault()
  if (opener === b) return shut(true)
  if (last.b === b && Date.now() - last.at < 400) return
  if (phone.matches && navigator.share) {
    try {
      await navigator.share({ title: titleOf(b), url: target(b) })
      return count('native', b)
    } catch (err) {
      if (err && err.name === 'AbortError') return
    }
  }
  shut(false)
  open(b)
})
for (const b of document.querySelectorAll('.share')) b.setAttribute('aria-expanded', 'false')

// minisite.js — a service's own page (tools/build_minisites.py). shop.js already draws the dingbats, the swan's
// ride, today's prices and the ladder; this adds the Buy bar on phones, the counting numbers and the try-it toy.
const $ = (s, r = document) => r.querySelector(s)
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches

// The Buy bar: shown once the page's own Buy buttons are off screen.
const bar = $('.m-bar')
if (bar && 'IntersectionObserver' in window) {
  bar.hidden = false
  const seen = new Set()
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)))
    bar.classList.toggle('on', seen.size === 0 && scrollY > 200)
  })
  document.querySelectorAll('.acts, .toy .btn').forEach((a) => io.observe(a))
  addEventListener('scroll', () => bar.classList.toggle('on', seen.size === 0 && scrollY > 200), { passive: true })
}

// Numbers in the slab count up when they come into view; a tap counts them again.
function count(b) {
  const walker = document.createTreeWalker(b, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode())) {
    const m = node.textContent.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/s)
    if (!m) continue
    const end = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, t0 = performance.now(), dur = 1100
    if (calm || !end) return
    const n = node
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - k, 3))
      n.textContent = m[1] + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + m[3]
      if (k < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    return
  }
}
const slab = document.querySelectorAll('.m-slab b')
if (slab.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); count(e.target) } }), { threshold: 0.6 })
  slab.forEach((b) => { io.observe(b); b.addEventListener('click', () => count(b)) })
}

// Dingbats this page names that live in other categories' sets (the related services, the steps): the build lists
// those files on <body data-db-extra>; they load once the page's own set is in, and a glyph added later redraws.
const extra = (document.body.dataset.dbExtra || '').split(' ').filter(Boolean)
if (extra.length) {
  let tries = 0
  const later = () => extra.forEach((src) => { const s = document.createElement('script'); s.src = src; document.head.appendChild(s) })
  const wait = () => (window.Dingbats ? later() : ++tries < 60 && setTimeout(wait, 250))
  wait()
}

// The toy: its own module, by kind, with its words and numbers from the page.
const toy = $('.toy[data-kind]')
if (toy) {
  const data = JSON.parse($('#toy-data').textContent)
  import(`/assets/m/toy-${toy.dataset.kind}.js?v=${toy.dataset.v || 1}`).then((m) => m.default(toy, data)).catch(() => {})
}

// Board retreat (docs/retreat/, tools/build_retreat.py): the days open, the Troika timer runs, afternoons and little
// things are picked, a month is chosen, and every pick goes into the LINE message and the hold form. The form posts to
// /api/contact, which puts the question on the Team Wheel. shop.js draws the dingbats and runs the swan on the line.

const D = JSON.parse(document.getElementById('rt').textContent)
const U = D.ui
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const STILL = matchMedia('(prefers-reduced-motion: reduce)').matches
const lineUrl = (t) => `https://line.me/R/oaMessage/${encodeURIComponent(D.oa)}/?${encodeURIComponent(t)}`
const fill = (tpl, n) => tpl.replace('{n}', n)
const picks = { pm: new Set(), perks: new Set(), month: '' }

// ---------------------------------------------------------------- a picture answers a tap
function pop (el, cls = 'rt-pop') {
  if (!el || STILL) return
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls)
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true })
}
function burst (x, y, n = 6) {
  if (STILL) return
  for (let i = 0; i < n; i++) {
    const b = document.createElement('span'); b.className = 'rt-burst'
    b.style.left = x - 12 + 'px'; b.style.top = y - 10 + 'px'
    document.body.append(b)
    const a = (i / n) * Math.PI * 2 + Math.random() * .5, r = 40 + Math.random() * 40
    b.animate([{ transform: 'translate(0,0) scale(.4)', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r - 20}px) scale(1) rotate(${(Math.random() - .5) * 90}deg)`, opacity: 0 }],
      { duration: 900 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => b.remove()
  }
}
document.addEventListener('click', (e) => {
  const g = e.target.closest('.rt-mg, .rt-swan, .rt-duck, .rt-pmg, .rt-bk, .rt-swan2, .rt-facts li, .rt-dg')
  if (g) { pop(g.querySelector('.db') || g); if (g.matches('.rt-swan, .rt-duck')) burst(e.clientX, e.clientY, 4) }
})

// ---------------------------------------------------------------- the days
$$('.rt-dh').forEach((b) => b.addEventListener('click', () => {
  const open = b.getAttribute('aria-expanded') === 'true'
  b.setAttribute('aria-expanded', String(!open))
  $('#' + b.getAttribute('aria-controls')).hidden = open
  pop($('.rt-dg .db', b.parentElement))
}))

// ---------------------------------------------------------------- picks
function toggle (b, set) {
  const on = b.getAttribute('aria-pressed') !== 'true'
  b.setAttribute('aria-pressed', String(on))
  on ? set.add(b.dataset.n) : set.delete(b.dataset.n)
  return on
}
$$('.rt-pm').forEach((b) => b.addEventListener('click', (e) => {
  if (toggle(b, picks.pm)) { const r = $('.rt-tick', b).getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 5) }
  update()
}))

function fly (from, to) {
  if (STILL || !from || !to) return pop(to)
  const a = from.getBoundingClientRect(), z = to.getBoundingClientRect()
  const c = from.cloneNode(true); c.classList.add('rt-fly')
  Object.assign(c.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' })
  document.body.append(c)
  const dx = z.left + z.width / 2 - (a.left + a.width / 2), dy = z.top + z.height / 2 - (a.top + a.height / 2)
  c.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx / 2}px, ${dy / 2 - 60}px) scale(1.2)`, offset: .45 }, { transform: `translate(${dx}px, ${dy}px) scale(.35)`, opacity: .3 }],
    { duration: 750, easing: 'cubic-bezier(.45,.05,.25,1)' }).onfinish = () => { c.remove(); pop(to) }
}
$$('.rt-perk').forEach((b) => b.addEventListener('click', () => {
  if (toggle(b, picks.perks)) fly($('.db', b), $('.rt-bk .db'))
  update()
}))

// ---------------------------------------------------------------- months
const fm = $('#rtf')
function setMonth (name) {
  picks.month = name || ''
  $$('.rt-mo').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.n === picks.month)))
  if (fm) fm.elements.month.value = picks.month
  const cta = $('[data-month-cta]')
  if (cta) cta.textContent = picks.month ? `${cta.dataset.monthCta} · ${picks.month}` : cta.dataset.monthCta
  update()
}
$$('.rt-mo').forEach((b) => b.addEventListener('click', () => {
  if (b.getAttribute('aria-disabled') === 'true') return pop(b, 'rt-no')
  pop($('.db', b)); setMonth(b.dataset.n === picks.month ? '' : b.dataset.n)
}))
if (fm) fm.elements.month.addEventListener('change', () => setMonth(fm.elements.month.value))

// ---------------------------------------------------------------- what goes in the message
function message (extra) {
  const lines = [U.msgHold]
  if (fm) {
    lines.push(`${U.msgMonth} ${picks.month || '-'}`, `${U.msgSize} ${fm.elements.size.value}`, `${U.msgKind} ${(fm.querySelector('[name=kind]:checked') || {}).value || '-'}`)
  } else if (picks.month) lines.push(`${U.msgMonth} ${picks.month}`)
  if (picks.pm.size) lines.push(`${U.msgPm} ${[...picks.pm].join(', ')}`)
  if (picks.perks.size) lines.push(`${U.msgPerks} ${[...picks.perks].join(', ')}`)
  if (extra) lines.push('', extra)
  return lines.join('\n')
}
function update () {
  const c = $('.rt-count'); if (c) c.textContent = picks.pm.size ? fill(c.dataset.tpl, picks.pm.size) : ''
  const n = $('.rt-bn'); if (n) n.textContent = fill(n.dataset.tpl, picks.perks.size)
  const bl = $('[data-basket]')
  if (bl) bl.href = lineUrl(picks.perks.size ? `${U.msgBasket}\n${[...picks.perks].map((p) => '· ' + p).join('\n')}` : U.msgBasket)
  $$('[data-line="hold"]').forEach((a) => { a.href = lineUrl(message(fm ? fm.elements.note.value.trim() : '')) })
  const ch = $('.rt-chosen')
  if (ch) {
    ch.replaceChildren(...[picks.month, ...picks.pm, ...picks.perks].filter(Boolean).map((t) => Object.assign(document.createElement('span'), { textContent: t })))
  }
}
if (fm) ['size', 'note'].forEach((k) => fm.elements[k].addEventListener('change', update))
if (fm) $$('[name=kind]', fm).forEach((r) => r.addEventListener('change', update))
update()

// ---------------------------------------------------------------- the hold form
if (fm) fm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const m = $('.rt-msg', fm), c = fm.elements.contact.value.trim()
  m.classList.remove('bad')
  if (!c) { m.textContent = U.needContact; m.classList.add('bad'); fm.elements.contact.focus(); return }
  const email = /\S+@\S+\.\S+/.test(c) ? c : '', line = email ? '' : c
  const btn = $('button[type=submit]', fm); btn.disabled = true; m.textContent = U.sending
  let r
  try {
    r = await (await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, line, message: message(fm.elements.note.value.trim()), service: D.service, website: fm.elements.website.value, page: location.pathname }) })).json()
  } catch { r = { ok: false } }
  btn.disabled = false
  if (r && r.ok) {
    m.textContent = U.sent
    const b = btn.getBoundingClientRect(); burst(b.left + b.width / 2, b.top, 10)
  } else { m.textContent = U.fail; m.classList.add('bad') }
})

// ---------------------------------------------------------------- Troika: three people, four steps, twelve minutes
const T = $('#troika')
if (T) {
  const steps = $$('.rt-tp', T), clock = $('.rt-clock', T), mm = $('.rt-mm', T), now = $('.rt-now', T), go = $('[data-troika]', T), done = $('.rt-done', T)
  const mins = D.troika, total = mins.reduce((a, b) => a + b, 0) * 60
  const ends = mins.reduce((a, m) => [...a, (a.at(-1) || 0) + m * 60], [])
  let left = total, timer = null
  const at = () => total - left
  const show = () => {
    const s = at(), i = Math.min(ends.findIndex((e) => s < e), mins.length - 1)
    const k = i < 0 ? mins.length - 1 : i
    mm.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
    clock.style.setProperty('--p', (s / total).toFixed(4))
    steps.forEach((el, j) => el.classList.toggle('on', j === k && (timer || s > 0)))
    clock.classList.toggle('back', k === 2 && (timer || s > 0))
    now.textContent = timer || s > 0 ? `${k + 1} / ${mins.length}` : ''
  }
  const stop = (finished) => {
    clearInterval(timer); timer = null; go.textContent = U.start
    if (finished) { done.hidden = false; const r = clock.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 12) }
    show()
  }
  go.addEventListener('click', () => {
    if (timer) return stop(false)
    if (left <= 0) left = total
    done.hidden = true; go.textContent = U.stop
    timer = setInterval(() => {
      const before = Math.min(ends.findIndex((e) => at() < e), mins.length - 1)
      left -= 1
      const after = ends.findIndex((e) => at() < e)
      if (after !== before && navigator.vibrate) navigator.vibrate(120)
      if (left <= 0) { left = 0; stop(true) }
      show()
    }, 1000)
    show()
  })
  // a tap on a step jumps there: the clock shows how the round moves
  steps.forEach((el, j) => el.addEventListener('click', () => { left = total - (j ? ends[j - 1] : 0); show(); pop($('.db', el)) }))
  show()
}

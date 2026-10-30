// Five questions on hongdam.net/studio/crypto-safety/ (tools/build_crypto.py). Each question names a service and the
// answer that calls for it (data-on). Once all five are answered, the services they call for show, each linked to its row.
const qs = [...document.querySelectorAll('.cs-q')]
const res = document.querySelector('.cs-result')
if (qs.length && res) {
  const picks = [...res.querySelectorAll('li[data-svc]')]
  const none = res.querySelector('.cs-none')
  const ans = new Map()
  const show = () => {
    if (ans.size < qs.length) { res.hidden = true; return }
    const want = new Set(qs.filter((q) => ans.get(q) === q.dataset.on).map((q) => q.dataset.svc))
    picks.forEach((li) => { li.hidden = !want.has(li.dataset.svc) })
    none.hidden = want.size > 0
    res.hidden = false
  }
  qs.forEach((q) => q.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    ans.set(q, b.dataset.a)
    q.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
    q.classList.add('done')
    show()
    const next = qs.find((x) => !ans.has(x))
    if (next) next.querySelector('button').focus({ preventScroll: true })
    else res.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' })
  })))
  res.querySelector('.cs-again').addEventListener('click', () => {
    ans.clear()
    qs.forEach((q) => { q.classList.remove('done'); q.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false')) })
    res.hidden = true
    qs[0].querySelector('button').focus()
  })
}

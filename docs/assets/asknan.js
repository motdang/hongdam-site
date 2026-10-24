// Ask Nan (hongdam.net/ask-nan/): after shop.js. ?kind=life on the list shows that kind; the chips switch it
// without a reload.
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const chips = $$('.an-chips a')
if (chips.length) {
  const show = (kind) => {
    $$('.an-list .an-cc').forEach((li) => { li.hidden = !!kind && li.dataset.kind !== kind })
    chips.forEach((a) => { if (a.dataset.kind === (kind || '')) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current') })
  }
  chips.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault()
    const k = a.dataset.kind
    history.replaceState(null, '', k ? '?kind=' + k : location.pathname)
    show(k)
  }))
  const known = chips.map((a) => a.dataset.kind).filter(Boolean)
  const asked = new URLSearchParams(location.search).get('kind')
  show(known.includes(asked) ? asked : '')
}

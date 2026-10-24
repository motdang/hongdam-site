// Hongdam Studio (hongdam.net/studio/): after shop.js. The notes list filters by beat; code blocks get a copy
// button; the swan in the room dips when tapped.

const $$ = (s, r = document) => [...r.querySelectorAll(s)]

// ?beat=models on the notes list shows that beat's notes; the chips switch it without a reload
const chips = $$('.s-chips a')
if (chips.length) {
  const show = (beat) => {
    $$('.s-all .s-nc').forEach((li) => { li.hidden = !!beat && li.dataset.beat !== beat })
    chips.forEach((a) => { if (a.dataset.beat === (beat || '')) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current') })
  }
  chips.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault()
    const b = a.dataset.beat
    history.replaceState(null, '', b ? '?beat=' + b : location.pathname)
    show(b)
  }))
  show(new URLSearchParams(location.search).get('beat'))
}

// copy buttons on code
$$('.code').forEach((box) => {
  const pre = box.querySelector('pre')
  if (!pre || !navigator.clipboard) return
  const b = document.createElement('button')
  b.type = 'button'; b.className = 'copy'; b.textContent = 'Copy'
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText((pre.querySelector('code') || pre).innerText); b.textContent = 'Copied' } catch { b.textContent = 'Select it' }
    setTimeout(() => { b.textContent = 'Copy' }, 1600)
  })
  box.appendChild(b)
})

// the swan dips its head when tapped
const swan = document.querySelector('.s-swan')
if (swan) swan.addEventListener('click', () => {
  swan.classList.add('dip')
  const d = swan.querySelector('doodle-dingbat')
  if (d) { d.setAttribute('play', 'once'); setTimeout(() => d.setAttribute('play', 'loop'), 1400) }
  setTimeout(() => swan.classList.remove('dip'), 700)
})

// toy-picker.js — choose one, see what it means: title deed types, LINE plans, what to do after which accident.
// Each option carries a big label, a short paragraph, a few facts, and its source.
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }
const marks = (s) => esc(s).replace(/(US\$|฿)(\d[\d,]*(?:\.\d+)?)/g, (_, c, n) => `<span class="amt ${c === 'US$' ? 'amt-us' : 'amt-th'}">${c}${n}</span>`)

export default function picker(root, D) {
  const L = D.L
  let cur = D.start ?? D.options[0].id
  root.innerHTML = `<div class="row"><p class="lab">${esc(D.q)}</p><div class="seg pick" role="group" aria-label="${esc(D.q)}">${D.options.map((o) =>
    `<button type="button" data-v="${esc(o.id)}">${esc(o.n)}</button>`).join('')}</div></div><div class="card-out" aria-live="polite"></div>`
  const out = root.querySelector('.card-out')
  const today = () => (document.querySelector(`.opts [data-live="services/${D.ours.live}"]`) || {}).textContent || '฿' + Number(D.ours.n).toLocaleString('en-US')
  function draw() {
    root.querySelectorAll('[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === cur)))
    const o = D.options.find((x) => x.id === cur)
    out.innerHTML = `<div class="pick-card">${o.big ? `<p class="big">${marks(o.big)}</p>` : ''}<p>${marks(o.t)}</p>` +
      (o.facts && o.facts.length ? `<ul>${o.facts.map((f) => `<li>${marks(f)}</li>`).join('')}</ul>` : '') +
      (o.src ? `<p class="src-line"><a href="${esc(o.src)}" target="_blank" rel="noopener">${esc(host(o.src))}</a></p>` : '') + '</div>' +
      `<p class="ours">${esc(D.oursLine || L.ours)} <b class="amt amt-th">${esc(today())}</b></p>` +
      `<p class="acts"><a class="btn" href="${esc(D.ours.buy)}">${esc(L.buy)}</a> <a class="btn alt" style="color:inherit;box-shadow:inset 0 0 0 1.5px currentColor;background:transparent" href="${esc(D.ours.line)}">${esc(L.line)}</a></p>`
  }
  root.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { cur = b.dataset.v; draw() } })
  addEventListener('load', () => setTimeout(draw, 1500))
  draw()
}

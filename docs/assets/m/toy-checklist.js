// toy-checklist.js — tick what you have: a bank's list for a business plan, the slides investors look for, what Google
// and AI answers read. The count fills a bar; each item says why it is on the list and where that comes from.
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }

export default function checklist(root, D) {
  const L = D.L, have = new Set()
  root.innerHTML = `<ul class="ticks">${D.items.map((it) => `<li><label><input type="checkbox" data-i="${esc(it.id)}"><span><b>${esc(it.n)}</b>` +
    `${it.why ? `<i>${esc(it.why)}${it.src ? ` <a href="${esc(it.src)}" target="_blank" rel="noopener">${esc(host(it.src))}</a>` : ''}</i>` : ''}</span></label></li>`).join('')}</ul>` +
    `<div class="tally" aria-live="polite"></div>`
  const out = root.querySelector('.tally')
  const today = () => (document.querySelector(`.opts [data-live="services/${D.ours.live}"]`) || {}).textContent || '฿' + Number(D.ours.n).toLocaleString('en-US')
  function draw() {
    const n = have.size, all = D.items.length
    const msg = (D.result || []).filter((r) => n >= r.min).pop()
    out.innerHTML = `<div class="bar" aria-hidden="true"><i style="flex:${n} 1 0;background:var(--line, #7DD3A3)"></i><i style="flex:${all - n} 1 0;background:transparent"></i></div>` +
      `<div class="sum"><span>${esc((D.count || L.count || '{n} of {all}').replace('{n}', n).replace('{all}', all))}</span></div>` +
      (msg ? `<p class="mnote">${esc(msg.t)}</p>` : '') +
      `<p class="ours">${esc(D.oursLine || L.ours)} <b class="amt amt-th">${esc(today())}</b></p>` +
      `<p class="acts"><a class="btn" href="${esc(D.ours.buy)}">${esc(L.buy)}</a> <a class="btn alt" style="color:inherit;box-shadow:inset 0 0 0 1.5px currentColor;background:transparent" href="${esc(D.ours.line)}">${esc(L.line)}</a></p>`
  }
  root.addEventListener('change', (e) => { const i = e.target.dataset.i; if (!i) return; e.target.checked ? have.add(i) : have.delete(i); draw() })
  addEventListener('load', () => setTimeout(draw, 1500))
  draw()
}

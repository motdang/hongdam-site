// toy-bill.js — what something costs, or saves: sliders and choices on the left of the sum, lines with their sources
// on the right. A line is a range [lo, hi]; "per" multiplies it by sliders (guests, nights, months…); "pct" makes it a
// share of what the sliders multiply to; "when" shows it only for some choices; "save" lines count against the total.
// Every number comes from the page's data with its source; the Hongdam price is today's, read from the page.
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const round = (n) => { const a = Math.abs(n); return Math.sign(n) * (a >= 100000 ? Math.round(a / 5000) * 5000 : a >= 10000 ? Math.round(a / 1000) * 1000 : a >= 1000 ? Math.round(a / 100) * 100 : Math.round(a / 10) * 10) }
const fmt = (n) => Math.round(n).toLocaleString('en-US')
const money = (n) => (n < 0 ? '−' : '') + fmt(Math.abs(round(n)))
const range = (lo, hi) => `<span class="amt amt-th">${lo < 0 ? '−฿' + fmt(Math.abs(round(lo))) : '฿' + fmt(round(lo))}${round(hi) !== round(lo) ? '–' + money(hi) : ''}</span>`
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }
const INK = ['#E8B04A', '#7DD3A3', '#8FB8F0', '#E58C8A', '#C7A6F0', '#F2E07A', '#9AD7D9', '#F0A86B', '#B8B0A2']

export default function bill(root, D) {
  const L = D.L, st = {}
  ;(D.sliders || []).forEach((s) => { st[s.id] = s.start })
  ;(D.choices || []).forEach((c) => { st[c.id] = c.start ?? c.options[0].id })
  const fmtSlider = (s, v) => (s.money ? '฿' + fmt(v) : fmt(v)) + (s.unit ? ' ' + s.unit : '')
  root.innerHTML = (D.sliders || []).map((s) => `<div class="row"><p class="lab"><label for="ts-${esc(s.id)}">${esc(s.n)}</label><output data-o="${esc(s.id)}"></output></p>
      <input id="ts-${esc(s.id)}" data-s="${esc(s.id)}" type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.start}"></div>`).join('') +
    (D.choices || []).map((c) => `<div class="row"><p class="lab">${esc(c.n)}</p><div class="seg" role="group" aria-label="${esc(c.n)}">${c.options.map((o) =>
      `<button type="button" data-k="${esc(c.id)}" data-v="${esc(o.id)}">${esc(o.n)}</button>`).join('')}</div></div>`).join('') +
    `<div class="bill" aria-live="polite"></div>`
  const out = root.querySelector('.bill')
  // which of the card's options this choice buys (data.oursFor), and its price as the page shows it today
  const item = () => { for (const [c, m] of Object.entries(D.oursFor || {})) if (m[st[c]]) return m[st[c]]; return D.ours.live }
  const today = () => (document.querySelector(`.opts [data-live="services/${item()}"]`) || {}).textContent || '฿' + fmt(D.ours.n)
  const oursWords = () => { for (const [c, m] of Object.entries(D.oursLineFor || {})) if (m[st[c]]) return m[st[c]]; return D.oursLine || L.ours }

  function draw() {
    root.querySelectorAll('[data-o]').forEach((o) => { const s = D.sliders.find((x) => x.id === o.dataset.o); o.textContent = fmtSlider(s, st[s.id]) })
    root.querySelectorAll('[data-k]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === String(st[b.dataset.k]))))
    const rows = []
    for (const l of D.lines || []) {
      if (l.when && !Object.entries(l.when).every(([k, vs]) => vs.includes(st[k]))) continue
      const mult = (l.per || []).reduce((m, id) => m * (st[id] ?? 1), 1)
      const [lo, hi] = l.pct ? [l.pct[0] / 100 * mult, l.pct[1] / 100 * mult] : [l.range[0] * mult, l.range[1] * mult]
      rows.push({ n: l.n, lo, hi, src: l.src, save: !!l.save })
    }
    const sign = (r) => (r.save ? -1 : 1)
    let lo = rows.reduce((a, r) => a + sign(r) * (r.save ? r.hi : r.lo), 0), hi = rows.reduce((a, r) => a + sign(r) * (r.save ? r.lo : r.hi), 0)
    // "flip": the total reads as money kept (savings less costs) instead of money spent
    if (D.flip) [lo, hi] = [-hi, -lo]
    const mid = rows.reduce((a, r) => a + (r.lo + r.hi) / 2, 0) || 1
    out.innerHTML = `<table>${rows.map((r, i) => `<tr><td><span class="nm"><i style="background:${INK[i % INK.length]}"></i>${esc(r.n)}</span>` +
      `${r.src ? `<a href="${esc(r.src)}" target="_blank" rel="noopener">${esc(host(r.src))}</a>` : ''}</td><td>${r.save ? '−' : ''}${range(r.lo, r.hi)}</td></tr>`).join('')}</table>` +
      `<div class="bar" aria-hidden="true">${rows.map((r, i) => `<i style="flex:${((r.lo + r.hi) / 2 / mid).toFixed(4)} 1 0;background:${INK[i % INK.length]}"></i>`).join('')}</div>` +
      `<div class="sum"><span>${esc(D.total || L.total)}</span><b>${range(Math.min(lo, hi), Math.max(lo, hi))}</b></div>` +
      (D.note ? `<p class="mnote">${esc(D.note)}</p>` : '') +
      `<p class="ours">${esc(oursWords())} <b class="amt amt-th">${esc(today())}</b></p>` +
      `<p class="acts"><a class="btn" href="${esc(D.ours.buy + (item() !== D.ours.live ? '&o=' + encodeURIComponent(item()) : ''))}">${esc(L.buy)}</a> <a class="btn alt" style="color:inherit;box-shadow:inset 0 0 0 1.5px currentColor;background:transparent" href="${esc(D.ours.line)}">${esc(L.line)}</a></p>`
  }
  root.addEventListener('input', (e) => { const s = e.target.dataset.s; if (s) { st[s] = +e.target.value; draw() } })
  root.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { st[b.dataset.k] = b.dataset.v; draw() } })
  addEventListener('load', () => setTimeout(draw, 1500))
  draw()
}

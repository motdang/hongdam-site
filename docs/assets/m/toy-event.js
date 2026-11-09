// toy-event.js — what an event costs: guests (one Isotype figure for ten), where, what kind, which month.
// Every range comes from the page's own data with its source; the planning fee is today's price.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const baht = (n) => `<span class="amt amt-th">฿${Math.round(n).toLocaleString('en-US')}</span>`
// a range carries one flag: ฿60,000–120,000
const range = (lo, hi) => `<span class="amt amt-th">฿${round(lo).toLocaleString('en-US')}–${round(hi).toLocaleString('en-US')}</span>`
const round = (n) => n >= 100000 ? Math.round(n / 5000) * 5000 : n >= 10000 ? Math.round(n / 1000) * 1000 : Math.round(n / 100) * 100
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }
const FIG = '<svg viewBox="0 0 10 17" aria-hidden="true"><circle cx="5" cy="2.6" r="2.4"/><path d="M1.2 6.4h7.6l-.9 6.2H6.6V17H3.4v-4.4H2.1z"/></svg>'
// flat inks for the bar, one per line of the bill
const INK = ['#E8B04A', '#7DD3A3', '#8FB8F0', '#E58C8A', '#C7A6F0', '#F2E07A', '#9AD7D9', '#F0A86B', '#B8B0A2']

export default function event(root, D) {
  const L = D.L
  const st = { guests: D.guests.start, venue: D.venues[Math.min(1, D.venues.length - 1)].id, style: D.styles[0].id, month: 12 }
  const monthName = (m) => { try { return new Intl.DateTimeFormat(D.lang === 'my' ? 'my-MM' : D.lang, { month: 'short' }).format(new Date(2026, m - 1, 15)) } catch { return String(m) } }
  const seg = (key, list) => `<div class="seg" role="group" aria-label="${esc(L[key])}">${list.map((x) => `<button type="button" data-k="${key}" data-v="${esc(x.id)}">${esc(x.n)}</button>`).join('')}</div>`
  root.innerHTML = `
  <div class="row"><p class="lab"><label for="tg">${esc(L.guests)}</label><output id="tgo"></output></p>
    <input id="tg" type="range" min="${D.guests.min}" max="${D.guests.max}" step="${D.guests.step}" value="${st.guests}">
    <div class="crowd" aria-hidden="true"></div><p class="key">${esc(L.figure)}</p></div>
  <div class="row"><p class="lab">${esc(L.venue)}</p>${seg('venue', D.venues)}</div>
  <div class="row"><p class="lab">${esc(L.style)}</p>${seg('style', D.styles)}</div>
  <div class="row"><p class="lab">${esc(L.month)}</p><div class="months" role="group" aria-label="${esc(L.month)}">${D.months.map((x) =>
    `<button type="button" class="${esc(x.kind)}" data-k="month" data-v="${x.m}" aria-label="${esc(monthName(x.m) + ' · ' + x.t)}">${esc(monthName(x.m))}<i></i></button>`).join('')}</div>
    <p class="mnote" aria-live="polite"></p></div>
  <div class="bill" aria-live="polite"></div>`
  const tg = root.querySelector('#tg'), out = root.querySelector('#tgo'), crowd = root.querySelector('.crowd')
  const note = root.querySelector('.mnote'), bill = root.querySelector('.bill')

  // the planning fee as the page shows it now (shop.js puts today's walked price there)
  const today = () => (document.querySelector(`.opts [data-live="services/${D.ours.live}"]`) || {}).textContent || '฿' + Number(D.ours.n).toLocaleString('en-US')
  addEventListener('load', () => setTimeout(draw, 1500))
  function draw() {
    out.textContent = st.guests
    const full = Math.floor(st.guests / 10), half = st.guests % 10 >= 5
    crowd.innerHTML = FIG.repeat(full) + (half ? FIG.replace('<svg', '<svg class="half"') : '')
    root.querySelectorAll('[data-k]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === String(st[b.dataset.k]))))
    const mo = D.months.find((x) => x.m === st.month)
    note.innerHTML = mo ? `<b>${esc(monthName(mo.m))}</b> · ${esc(mo.t)}${D.months_src ? ` <a href="${esc(D.months_src)}" target="_blank" rel="noopener">${esc(host(D.months_src))}</a>` : ''}` : ''
    const v = D.venues.find((x) => x.id === st.venue)
    // a style with "nofood" (a morning rite on its own) has no meal for the guests
    const style = D.styles.find((x) => x.id === st.style) || {}
    const rows = style.nofood ? [] : [{ n: L.food.replace('{n}', st.guests), lo: v.per_head[0] * st.guests, hi: v.per_head[1] * st.guests, src: v.src }]
    D.items.filter((x) => !x.styles || x.styles.includes(st.style)).forEach((x) => rows.push({ n: x.n, lo: x.range[0], hi: x.range[1], src: x.src }))
    const lo = rows.reduce((a, r) => a + r.lo, 0), hi = rows.reduce((a, r) => a + r.hi, 0), mid = (lo + hi) / 2 || 1
    bill.innerHTML = `<table>${rows.map((r, i) => `<tr><td><span class="nm"><i style="background:${INK[i % INK.length]}"></i>${esc(r.n)}</span>` +
      `${r.src ? `<a href="${esc(r.src)}" target="_blank" rel="noopener">${esc(host(r.src))}</a>` : ''}</td><td>${range(r.lo, r.hi)}</td></tr>`).join('')}</table>` +
      `<div class="bar" aria-hidden="true">${rows.map((r, i) => `<i style="flex:${((r.lo + r.hi) / 2 / mid).toFixed(4)} 1 0;background:${INK[i % INK.length]}"></i>`).join('')}</div>` +
      `<div class="sum"><span>${esc(L.total)}</span><b>${range(lo, hi)}</b></div>` +
      `<p class="ours">${esc(L.ours)} <b class="amt amt-th">${esc(today())}</b> · ${esc(L.oursLine)}</p>` +
      `<p class="acts"><a class="btn" href="${esc(D.ours.buy)}">${esc(L.buy)}</a> <a class="btn alt" style="color:inherit;box-shadow:inset 0 0 0 1.5px currentColor;background:transparent" href="${esc(D.ours.line)}">${esc(L.line)}</a></p>`
  }
  tg.addEventListener('input', () => { st.guests = +tg.value; draw() })
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]')
    if (b) { st[b.dataset.k] = b.dataset.k === 'month' ? +b.dataset.v : b.dataset.v; draw(); return }
    const f = e.target.closest('.crowd svg')
    if (f) { f.classList.add('hop'); setTimeout(() => f.classList.remove('hop'), 320) }
  })
  draw()
}

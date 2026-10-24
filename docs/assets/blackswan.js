// Black Swan Event? (hongdam.net/studio/black-swan/ and hongdam.net/swan/<id>): the four toys, the prediction form,
// the list with its votes, and the picture a prediction is shared as. Words come from #bs-data (tools/build_blackswan.py);
// predictions from /api/swan (functions/api/swan/). The browser keeps the reader's own predictions (with the key that
// deletes them) and votes in localStorage under bs:*.

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const CFG = JSON.parse($('#bs-data').textContent)
const U = CFG.ui, L = CFG.lang
const API = '/api/swan'
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
const coarse = matchMedia('(pointer: coarse)')
const LOC = { en: 'en-US', th: 'th-TH', my: 'en-US', zh: 'zh-CN', de: 'de-CH' }[L] || 'en-US'
const fmt = (n) => Number(n || 0).toLocaleString(LOC)
const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ''))
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const hd = (what) => { try { window.hd?.('tap', 'swan:' + what) } catch { /* counting is optional */ } }
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem('bs:' + k)); return v == null ? d : v } catch { return d } },
  set(k, v) { try { localStorage.setItem('bs:' + k, JSON.stringify(v)) } catch { /* private window: kept for this visit only */ } },
}
const db = (name, play = 'still', extra = '') => `<doodle-dingbat name="${name}" play="${play}"${extra} aria-hidden="true"></doodle-dingbat>`

async function api(path, body) {
  const r = await fetch(API + path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {})
  let j = {}
  try { j = await r.json() } catch { /* not JSON */ }
  if (!r.ok || !j.ok) throw Object.assign(new Error(j.why || 'http ' + r.status), { why: j.why || 'any' })
  return j
}

// how dark the swan is: less likely and bigger is darker; and which of four words it earns
const shade = (k, z) => Math.min(1, (k / 4 + z / 3) / 1.4)
const kind = (k, z) => (k >= 2 && z >= 2 ? 3 : k >= 2 ? 1 : z >= 2 ? 2 : 0)
const grey = (s) => `hsl(0 0% ${Math.round(96 - s * 88)}%)`
const monthNow = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 7)
const phase = (due) => (monthNow() >= due ? 'r' : 'p')
function month(due) {
  try { return new Intl.DateTimeFormat(L === 'my' ? 'en-GB' : LOC, { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(due + '-01T00:00:00Z')) } catch { return due }
}
const urlOf = (id) => 'https://hongdam.net/swan/' + id
const shareText = (p) => `“${p.text}” — ${CFG.odds[p.odds]} · ${CFG.size[p.size]}. ${U.share}`

// press once to step, hold to keep stepping (faster the longer it is held); keyboard Enter or Space steps once
function holdable(els, step, faster) {
  let timer = 0, t0 = 0
  const stop = () => { clearInterval(timer); timer = 0 }
  const start = (e) => {
    if (e.button > 0) return
    e.preventDefault()
    if (step(1) === false) return
    t0 = performance.now()
    stop()
    timer = setInterval(() => { if (step(faster((performance.now() - t0) / 1000)) === false) stop() }, 100)
  }
  for (const el of els) {
    el.addEventListener('pointerdown', start)
    el.addEventListener('click', (e) => { if (e.detail === 0) step(1) })
    el.addEventListener('keydown', (e) => { if (el.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); step(1) } })
    el.addEventListener('contextmenu', (e) => e.preventDefault())
  }
  addEventListener('pointerup', stop)
  addEventListener('pointercancel', stop)
  addEventListener('blur', stop)
  return stop
}

// ── 01 all swans are white? ──────────────────────────────────────────────────
function toyCount() {
  const box = $('#t-count')
  if (!box) return
  const board = $('.bs-pond', box), swim = $('.bs-swim', box), out = $('.bs-n', box), over = $('.bs-over', box)
  let n = 0, target = 0, done = false, shown = []
  const place = (black) => {
    const el = document.createElement('span')
    el.className = 'sw ' + (black ? 'black' : 'white')
    el.style.left = (black ? 50 + (Math.random() - 0.5) * 30 : 10 + Math.random() * 80) + '%'
    el.style.top = (black ? 64 : 38 + Math.random() * 52) + '%'
    el.innerHTML = db(black ? 'hongsa' : 'hongsa-float', 'loop', ` seed="${(Math.random() * 999) | 0}"`)
    swim.append(el)
    if (!black) {
      shown.push(el)
      while (shown.length > 12) shown.shift().remove()
      shown.forEach((e, i) => e.classList.toggle('old', i < shown.length - 5))
    }
  }
  const reset = () => {
    n = 0; done = false; shown = []
    target = Math.round(9 * Math.pow(10, Math.random() * 2.75))   // anywhere from 9 to about 5,000: nobody can tell when
    swim.innerHTML = ''; out.textContent = '0'; over.hidden = true; board.classList.remove('done')
    for (let k = 0; k < 3; k++) step(1)
  }
  const step = (k) => {
    if (done) return false
    n = Math.min(target, n + k)
    out.textContent = fmt(n)
    place(false)
    if (n >= target) {
      done = true
      setTimeout(() => {
        place(true)
        hd('count:' + n)
        setTimeout(() => { board.classList.add('done'); over.hidden = false; $('.bs-again', over).focus({ preventScroll: true }) }, calm ? 200 : 1500)
      }, 300)
      return false
    }
  }
  holdable([board, $('.bs-look', box)], step, (s) => Math.max(1, Math.floor(Math.pow(s * 2.2, 2.2))))
  $('.bs-again', over).addEventListener('click', (e) => { e.stopPropagation(); reset() })
  over.addEventListener('pointerdown', (e) => e.stopPropagation())
  reset()
}

// ── 02 the swan meter ────────────────────────────────────────────────────────
const val = (root, name) => Number(($(`input[name="${name}"]:checked`, root) || {}).value || 0)
function setChip(root, name, v) { const i = $(`input[name="${name}"][value="${v}"]`, root); if (i) i.checked = true }
function toyMeter() {
  const box = $('#t-meter')
  if (!box) return
  const pair = $('.bs-pair', box), white = $('.bs-w', box), res = $('.bs-res', box)
  const show = (pop) => {
    const k = val(box, 'm-odds'), z = val(box, 'm-size')
    white.style.opacity = String(1 - shade(k, z))
    res.textContent = U.res[kind(k, z)]
    if (pop && !calm) { pair.classList.remove('pop'); void pair.offsetWidth; pair.classList.add('pop') }
  }
  box.addEventListener('change', () => show(true))
  $('.bs-carry', box).addEventListener('click', () => {
    const f = $('#bs-form')
    if (!f) return
    setChip(f, 'odds', val(box, 'm-odds'))
    setChip(f, 'size', val(box, 'm-size'))
    hd('meter')
    setTimeout(() => $('#bs-text').focus({ preventScroll: true }), 450)
  })
  show(false)
}

// ── 03 a hundred days ────────────────────────────────────────────────────────
function toyDays() {
  const box = $('#t-days')
  if (!box) return
  const board = $('.bs-chart', box), cv = $('canvas', board), x = cv.getContext('2d'), out = $('.bs-n', box)
  const mark = $('.bs-mark', board), over = $('.bs-over', board)
  let vals, day, jump, done
  const reset = () => { vals = [100]; day = 0; jump = -1; done = false; mark.hidden = true; over.hidden = true; for (let k = 0; k < 10; k++) step(); draw() }
  function size() {
    const r = board.getBoundingClientRect(), d = Math.min(3, devicePixelRatio || 1)
    cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d)
    x.setTransform(d, 0, 0, d, 0, 0)
    return r
  }
  function draw() {
    const r = size(), W = r.width, H = r.height, padT = 56, padB = 18
    const lo = Math.min(...vals), hi = Math.max(...vals), span = Math.max(45, hi - lo)
    const mid = (lo + hi) / 2, top = mid + span * 0.62, bot = mid - span * 0.62
    const X = (i) => 14 + (i / 100) * (W - 28), Y = (v) => padT + (top - v) / (top - bot) * (H - padT - padB)
    const ink = getComputedStyle(board).color
    x.clearRect(0, 0, W, H)
    x.globalAlpha = 0.25; x.strokeStyle = ink; x.lineWidth = 1; x.setLineDash([3, 5])
    x.beginPath(); x.moveTo(14, Y(100)); x.lineTo(W - 14, Y(100)); x.stroke(); x.setLineDash([]); x.globalAlpha = 1
    x.lineWidth = 3; x.lineJoin = 'round'; x.lineCap = 'round'
    for (let i = 1; i < vals.length; i++) {
      x.strokeStyle = i === jump ? '#FF5A3C' : ink
      x.lineWidth = i === jump ? 5 : 3
      x.beginPath(); x.moveTo(X(i - 1), Y(vals[i - 1])); x.lineTo(X(i), Y(vals[i])); x.stroke()
    }
    if (jump > 0) { mark.style.left = X(jump) + 'px'; mark.style.top = Math.max(60, Y(vals[jump])) + 'px' }
  }
  const step = () => {
    if (done) return false
    day++
    const v = vals[vals.length - 1]
    if (jump < 0 && ((day >= 12 && Math.random() < 1 / 40) || day === 100)) {
      vals.push(v * (Math.random() < 0.72 ? 0.3 + Math.random() * 0.25 : 1.9 + Math.random() * 0.9))
      jump = day; done = true
      draw()
      mark.hidden = false
      $('.bs-big', over).textContent = fill(U.t3end, { n: day })
      hd('days:' + day)
      setTimeout(() => { over.hidden = false; $('.bs-again', over).focus({ preventScroll: true }) }, calm ? 200 : 1200)
      return false
    }
    const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
    vals.push(v * (1 + g * 0.022))
    out.textContent = fmt(day)
    draw()
  }
  holdable([$('.bs-next', box)], step, () => 1)
  $('.bs-again', over).addEventListener('click', reset)
  addEventListener('resize', () => draw())
  reset()
}

// ── 04 black swan or not? ────────────────────────────────────────────────────
function toyQuiz() {
  const box = $('#t-quiz')
  if (!box) return
  const Q = CFG.quiz, mine = store.get('poll', {})
  const year = $('.bs-year', box), g = $('.bs-qg', box), what = $('.bs-what', box), poll = $('.bs-poll', box)
  const bar = $('.bs-bar i', box), pct = $('.bs-pct', box), note = $('.bs-note', box), next = $('.bs-nextq', box), stepEl = $('.bs-step', box)
  const btns = $$('[data-v]', box)
  let i = Math.max(0, Q.findIndex((q) => !mine[q.q])), counts = null
  const result = () => {
    const q = Q[i], c = (counts && counts[q.q]) || { y: 0, n: 0 }, tot = c.y + c.n
    const p = tot ? Math.round((100 * c.y) / tot) : 0
    poll.hidden = false
    bar.style.width = p + '%'
    pct.textContent = tot ? `${fill(U.t4res, { p })} · ${fill(U.votes, { n: fmt(tot) })}` : ''
    note.textContent = q.note || ''
  }
  const show = () => {
    const q = Q[i]
    year.textContent = q.y
    g.innerHTML = db(q.g, 'loop')
    what.textContent = q.t
    stepEl.textContent = `${i + 1} / ${Q.length}`
    btns.forEach((b) => b.setAttribute('aria-pressed', String(mine[q.q] === b.dataset.v)))
    poll.hidden = true; bar.style.width = '0'
    if (mine[q.q]) requestAnimationFrame(result)
  }
  btns.forEach((b) => b.addEventListener('click', async () => {
    const q = Q[i], v = b.dataset.v, was = mine[q.q]
    mine[q.q] = v; store.set('poll', mine)
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
    counts = counts || {}
    const c = counts[q.q] || (counts[q.q] = { y: 0, n: 0 })
    if (was !== v) { c[v]++; if (was) c[was] = Math.max(0, c[was] - 1) }
    result()
    hd('poll:' + q.q)
    try { const j = await api('/poll', { q: q.q, v }); counts[q.q] = j.poll; result() } catch { /* the vote is kept in localStorage only */ }
  }))
  next.addEventListener('click', () => { i = (i + 1) % Q.length; show(); btns[0].focus({ preventScroll: true }) })
  api('/poll').then((j) => { counts = j.poll; if (!poll.hidden) result() }).catch(() => {})
  show()
}

// ── the picture a prediction is shared as (1080 × 1350) ─────────────────────
let swanCv = null
function swanCanvas() {
  if (swanCv) return Promise.resolve(swanCv)
  return new Promise((ok) => {
    const s = document.createElement('span')
    s.style.cssText = 'position:fixed;left:-3000px;top:0;color:#F3F2EE;font-size:300px;line-height:0;--db-look:ink;background:#0E0E10'
    s.innerHTML = db('hongsa', 'still')
    document.body.append(s)
    let n = 0
    const look = () => {
      const c = $('canvas', s)
      if (c && c.width > 10) { swanCv = c; return ok(c) }
      if (++n > 40) return ok(null)
      setTimeout(look, 60)
    }
    look()
  })
}
function pieces(t) {
  try { if (Intl.Segmenter) return [...new Intl.Segmenter(L, { granularity: 'word' }).segment(t)].map((s) => s.segment) } catch { /* old browser */ }
  return t.split(/(\s+)/)
}
function wrap(x, t, max) {
  const lines = []
  let line = ''
  for (const w of pieces(t)) {
    const next = line + w
    if (x.measureText(next).width > max && line.trim()) { lines.push(line.trim()); line = w.trimStart() } else line = next
    while (x.measureText(line).width > max && line.length > 1) {   // one word wider than the line
      let k = line.length - 1
      while (k > 1 && x.measureText(line.slice(0, k)).width > max) k--
      lines.push(line.slice(0, k)); line = line.slice(k)
    }
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}
const SANS = 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", "Noto Sans Thai", Thonburi, "Noto Sans Myanmar", "Myanmar Text", "PingFang SC", "Microsoft YaHei", sans-serif'
const MONO = 'ui-monospace, Menlo, Consolas, monospace'
async function picture(p) {
  const W = 1080, H = 1350, c = document.createElement('canvas')
  c.width = W; c.height = H
  const x = c.getContext('2d')
  x.fillStyle = '#0E0E10'; x.fillRect(0, 0, W, H)
  x.strokeStyle = 'rgba(243,242,238,.07)'; x.lineWidth = 2
  for (let i = 0; i <= W; i += 60) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke() }
  for (let i = 0; i <= H; i += 60) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke() }
  x.fillStyle = '#FF5A3C'; x.beginPath(); x.arc(92, 112, 13, 0, 7); x.fill()
  x.fillStyle = '#ADACB3'; x.font = `600 34px ${L === 'en' || L === 'de' ? MONO : SANS}`; x.textBaseline = 'middle'
  x.fillText((L === 'en' || L === 'de' ? U.h1.toUpperCase() : U.h1), 124, 114)
  const t = `“${p.text}”`, len = [...t].length
  let fs = len < 30 ? 124 : len < 60 ? 104 : len < 110 ? 84 : 68, lines
  for (;;) {   // the largest size whose lines fit between the heading and the odds
    x.font = `760 ${fs}px ${SANS}`
    lines = wrap(x, t, W - 170)
    if (lines.length * fs * 1.16 <= 700 || fs <= 44) break
    fs -= 6
  }
  x.fillStyle = '#F3F2EE'; x.textBaseline = 'alphabetic'
  const top = 200 + Math.max(0, (720 - lines.length * fs * 1.16) / 2)
  lines.slice(0, 12).forEach((ln, i) => x.fillText(ln, 80, top + fs + i * fs * 1.16))
  x.fillStyle = '#FF7A60'; x.font = `800 92px ${SANS}`
  x.fillText(CFG.odds[p.odds], 80, H - 360)
  x.fillStyle = '#D7D6D2'; x.font = `600 44px ${SANS}`
  x.fillText(`${CFG.size[p.size]} · ${fill(U.check, { d: month(p.due) })}`, 80, H - 286)
  if (p.name) { x.fillStyle = '#ADACB3'; x.font = `500 38px ${SANS}`; x.fillText(fill(U.oneBy, { name: p.name }), 80, H - 226) }
  const sc = await swanCanvas()
  if (sc) {
    const w = parseFloat(sc.style.width) || sc.width, h = parseFloat(sc.style.height) || sc.height, k = 300 / h
    x.drawImage(sc, W - w * k - 40, H - h * k - 120, w * k, h * k)
  }
  x.fillStyle = '#F3F2EE'; x.font = `700 40px ${MONO}`
  x.fillText('hongdam.net/swan/', 80, H - 96)
  const wpre = x.measureText('hongdam.net/swan/').width
  x.fillStyle = '#FF7A60'; x.fillText(p.id, 80 + wpre, H - 96)
  x.fillStyle = '#ADACB3'; x.font = `600 30px ${SANS}`
  x.fillText(U.sub, 80, H - 48)
  return c
}
const blobOf = (c) => new Promise((ok) => c.toBlob(ok, 'image/png'))
async function savePicture(p, btn) {
  btn && (btn.disabled = true)
  try {
    const blob = await blobOf(await picture(p))
    const file = new File([blob], `black-swan-${p.id}.png`, { type: 'image/png' })
    if (coarse.matches && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: shareText(p) + ' ' + urlOf(p.id) }); hd('pic:share'); return } catch (e) { if (e && e.name === 'AbortError') return }
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = file.name
    document.body.append(a); a.click()
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1500)
    hd('pic:save')
  } finally { btn && (btn.disabled = false) }
}
async function copyLink(id, btn) {
  const u = urlOf(id)
  try { await navigator.clipboard.writeText(u); btn.textContent = U.copied; setTimeout(() => { btn.textContent = U.copy }, 1600) } catch { window.prompt(U.copy, u) }
  hd('copy')
}
function wireShare(root, p) {
  const s = $('.bs-share-it', root)
  if (s) { s.dataset.share = '/swan/' + p.id; s.dataset.t = shareText(p) }
  const pic = $('.bs-pic', root), copy = $('.bs-copy', root)
  if (pic) pic.onclick = () => savePicture(p, pic)
  if (copy) copy.onclick = () => copyLink(p.id, copy)
}

// ── one prediction in a list ────────────────────────────────────────────────
const mineList = () => store.get('mine', [])
const myVotes = store.get('votes', {})
function voteHtml(p) {
  const ph = phase(p.due), y = ph === 'p' ? p.yes : p.came, n = ph === 'p' ? p.no : p.nope, tot = (y || 0) + (n || 0), my = (myVotes[p.id] || {})[ph]
  return `<div class="bs-vote" data-ph="${ph}"><span>${esc(ph === 'p' ? U.will : U.did)}</span>` +
    `<button type="button" data-v="y" aria-pressed="${my === 'y'}">${esc(U.yes)} <b>${fmt(y)}</b></button>` +
    `<button type="button" data-v="n" aria-pressed="${my === 'n'}">${esc(U.no)} <b>${fmt(n)}</b></button>` +
    `<span class="bs-vbar" aria-hidden="true"><i class="y" style="width:${tot ? (100 * y) / tot : 0}%"></i><i class="n" style="width:${tot ? (100 * n) / tot : 0}%"></i></span></div>`
}
function metaHtml(p) {
  return `<span class="bs-dot" style="--s:${grey(shade(p.odds, p.size))}"></span><b>${esc(CFG.odds[p.odds])}</b>` +
    `<span>${db(CFG.sizeG[p.size])} ${esc(CFG.size[p.size])}</span><span>${esc(fill(U.check, { d: month(p.due) }))}</span>` +
    (p.name ? `<span>${esc(fill(U.oneBy, { name: p.name }))}</span>` : '')
}
function itemHtml(p, own) {
  const mineRow = own || mineList().find((m) => m.id === p.id)
  const text = p.text || (mineRow && mineRow.text) || ''
  const ok = p.state === 'ok'
  return `<li class="bs-item" data-id="${p.id}"><a class="bs-it" href="/swan/${p.id}${L === 'en' ? '' : '?l=' + L}">“${esc(text)}”</a>` +
    `<p class="bs-meta">${metaHtml(p)}</p>` +
    (ok ? voteHtml(p) : `<p class="bs-wait">${esc(U.wait)}</p>`) +
    `<p class="bs-tools">${ok ? `<button type="button" class="share" data-share="/swan/${p.id}" data-t="${esc(shareText({ ...p, text }))}">` +
      `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg><span>${esc(U.shareW)}</span></button>` : ''}` +
    (mineRow ? `<button type="button" data-act="del">${esc(U.del)}</button>` : ok ? `<button type="button" data-act="report">${esc(U.report)}</button>` : '') + '</p></li>'
}
async function onListClick(e) {
  const li = e.target.closest('.bs-item')
  if (!li) return
  const id = li.dataset.id, vb = e.target.closest('.bs-vote button'), act = e.target.closest('[data-act]')
  if (vb) {
    const ph = vb.closest('.bs-vote').dataset.ph, v = vb.dataset.v
    myVotes[id] = { ...(myVotes[id] || {}), [ph]: v }
    store.set('votes', myVotes)
    vb.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === vb)))
    hd('vote')
    try {
      const j = await api(`/${id}/vote`, { v })
      const box = vb.closest('.bs-vote'), p = { id, due: ph === 'r' ? '0000-00' : '9999-99', ...j.votes }
      box.outerHTML = voteHtml(p)
    } catch { /* kept on this phone */ }
  } else if (act && act.dataset.act === 'report') {
    if (!confirm(U.reportQ)) return
    act.disabled = true
    try { await api(`/${id}/report`, {}) } catch { /* counted or not, the button says thanks */ }
    act.textContent = U.reported
  } else if (act && act.dataset.act === 'del') {
    if (!confirm(U.delQ)) return
    const m = mineList().find((x) => x.id === id)
    try { if (m) await api(`/${id}/delete`, { key: m.key }) } catch (err) { if (err.why !== 'none') return }
    store.set('mine', mineList().filter((x) => x.id !== id))
    li.remove()
  }
}

// ── the list ─────────────────────────────────────────────────────────────────
function pond() {
  const sec = $('#pond')
  if (!sec) return null
  const list = $('.bs-list', sec), more = $('.bs-more', sec), mineL = $('.bs-mine-l', sec), count = $('.bs-count')
  let sort = 'new', o = 0
  async function load(reset) {
    if (reset) { o = 0; list.innerHTML = '' }
    mineL.hidden = sort !== 'mine'
    try {
      let rows, hasMore = false
      if (sort === 'mine') {
        const m = mineList()
        rows = m.length ? (await api('?ids=' + m.map((x) => x.id).join(','))).swans : []
      } else {
        const j = await api(`?sort=${sort}&o=${o}`)
        rows = j.swans; hasMore = j.more
        if (count && j.n) count.textContent = fill(U.count, { n: fmt(j.n) })
      }
      if (!rows.length && !o) list.innerHTML = `<li class="bs-none">${esc(U.none)}</li>`
      else list.insertAdjacentHTML('beforeend', rows.map((p) => itemHtml(p)).join(''))
      o += rows.length
      more.hidden = !hasMore
    } catch {
      if (!o) list.innerHTML = `<li class="bs-none">${esc(U.errAny)}</li>`
    }
  }
  $$('.bs-tabs button', sec).forEach((b) => b.addEventListener('click', () => {
    $$('.bs-tabs button', sec).forEach((x) => x.setAttribute('aria-selected', String(x === b)))
    sort = b.dataset.sort
    load(true)
  }))
  more.addEventListener('click', () => load(false))
  list.addEventListener('click', onListClick)
  load(true)
  return { add(p) { if (sort !== 'new' && sort !== 'mine') return; $('.bs-none', list)?.remove(); list.insertAdjacentHTML('afterbegin', itemHtml(p, p)); list.firstElementChild.classList.add('new') } }
}

// ── the form ─────────────────────────────────────────────────────────────────
function form(list) {
  const f = $('#bs-form')
  if (!f) return
  const ta = $('#bs-text'), left = $('.bs-left', f), err = $('.bs-err', f), btn = $('.bs-save', f), done = $('.bs-done')
  const max = 200
  ta.addEventListener('input', () => { left.textContent = String(max - [...ta.value].length) })
  let ex = 0
  if (!calm) setInterval(() => { if (!ta.value && document.activeElement !== ta) { ex = (ex + 1) % U.examples.length; ta.placeholder = U.examples[ex] } }, 3200)
  const why = { short: U.errShort, long: U.errShort, link: U.errLink, limit: U.errLimit }
  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    err.hidden = true
    const text = ta.value.trim()
    if ([...text].length < 4) { err.textContent = U.errShort; err.hidden = false; ta.focus(); return }
    const body = { text, odds: val(f, 'odds'), size: val(f, 'size'), years: val(f, 'years'), name: $('#bs-name').value.trim(), lang: L }
    btn.disabled = true
    try {
      const j = await api('', body)
      const p = { id: j.id, key: j.key, text, odds: body.odds, size: body.size, due: j.due, name: body.name || null, state: j.state, yes: 0, no: 0, came: 0, nope: 0, at: new Date().toISOString() }
      store.set('mine', [p, ...mineList()].slice(0, 50))
      hd('save')
      $('.bs-ok', done).textContent = j.state === 'ok' ? U.saved : U.held
      $('.bs-open', done).href = '/swan/' + p.id + (L === 'en' ? '' : '?l=' + L)
      wireShare(done, p)
      done.hidden = false
      picture(p).then((c) => { $('.bs-shot img', done).src = c.toDataURL('image/png'); $('.bs-shot img', done).alt = shareText(p) })
      done.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })
      f.reset(); left.textContent = String(max)
      list && list.add(p)
    } catch (x) {
      err.textContent = why[x.why] || U.errAny
      err.hidden = false
    } finally { btn.disabled = false }
  })
}

// ── the Predict button that follows on a phone ──────────────────────────────
function fab() {
  const b = $('.bs-fab'), room = $('.bs-room'), pr = $('#predict')
  if (!b || !room || !pr || !('IntersectionObserver' in window)) return
  b.hidden = false; b.classList.add('off')
  const seen = new Map()
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => seen.set(e.target, e.isIntersecting))
    b.classList.toggle('off', !!(seen.get(room) || seen.get(pr)))
  })
  io.observe(room); io.observe(pr)
  b.addEventListener('click', () => { hd('fab'); setTimeout(() => $('#bs-text').focus({ preventScroll: true }), 450) })
}

// ── /swan/<id>: one prediction ──────────────────────────────────────────────
function one() {
  const el = $('#bs-one-data')
  if (!el) return
  let p
  try { p = JSON.parse(el.textContent) } catch { return }
  if (!p || !p.id) return
  const h1 = $('.bs-one h1'), q = $('.bs-quote', h1)
  const own = mineList().find((m) => m.id === p.id)
  if (p.state !== 'ok') {
    q.textContent = own ? `“${own.text}”` : U.wait
    if (own) p = { ...p, text: own.text, name: own.name }
  }
  if ((p.text || '').length > 90) h1.classList.add('long')
  $('.bs-card .bs-meta').innerHTML = metaHtml(p)
  const v = $('.bs-vote1')
  if (p.state === 'ok') {
    v.innerHTML = voteHtml(p)
    v.addEventListener('click', async (e) => {
      const b = e.target.closest('button')
      if (!b) return
      const ph = b.closest('.bs-vote').dataset.ph
      myVotes[p.id] = { ...(myVotes[p.id] || {}), [ph]: b.dataset.v }
      store.set('votes', myVotes)
      hd('vote:one')
      try { const j = await api(`/${p.id}/vote`, { v: b.dataset.v }); Object.assign(p, j.votes) } catch { /* kept here */ }
      v.innerHTML = voteHtml(p)
    })
  } else if (own) v.innerHTML = `<p class="bs-by">${esc(U.wait)}</p>`
  if (p.text) wireShare(document, p)
  else $$('.bs-share-it, .bs-pic, .bs-copy').forEach((b) => { b.hidden = true })
  const few = $('.bs-few')
  if (few) {
    api('?sort=top').then((j) => {
      const rows = j.swans.filter((r) => r.id !== p.id).slice(0, 4)
      few.innerHTML = rows.map((r) => itemHtml(r)).join('') || `<li class="bs-none">${esc(U.none)}</li>`
    }).catch(() => {})
    few.addEventListener('click', onListClick)
  }
}

// her photo: a tap looks closer, another tap steps back
const frame = $('.bs-frame')
if (frame) frame.addEventListener('click', () => { frame.classList.toggle('zoom'); hd('photo') })

toyCount()
toyMeter()
toyDays()
toyQuiz()
form(pond())
fab()
one()

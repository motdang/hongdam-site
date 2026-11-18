// arrange.js — the request form on a job page (tools/build_arrange.py). The job's own questions, the reply channel and
// the contact go to /api/contact as one request with the job, its main service and the page's language; the answer is
// a request number, shown with what it is and is not. The words stay in the form when sending fails, with LINE and
// mail beside it, and stay in this browser until the request is sent. A second press of Send, or a resend of the same
// request, carries the same key, so the team gets one request.
const $ = (s, r = document) => r.querySelector(s)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const f = $('#jf')
const T = (() => { try { return JSON.parse($('#arrange').textContent) } catch { return {} } })()
const lang = document.documentElement.lang || 'en'
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v) } catch { return null } }
const newKey = () => Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => (b % 36).toString(36)).join('')
const mailOk = (v) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v)

if (f) {
  const job = f.dataset.job, draftKey = 'hd-job-' + job, msg = $('#jmsg')
  let key = newKey(), busy = false
  const fields = () => [...f.querySelectorAll('[name^="f_"]')]
  const reply = () => (f.querySelector('input[name="reply"]:checked') || {}).value || 'line'
  // the contact box asks for what the chosen reply channel needs
  const fit = () => {
    const c = f.elements.contact, r = reply()
    c.type = r === 'email' ? 'email' : r === 'phone' ? 'tel' : 'text'
    c.autocomplete = r === 'email' ? 'email' : r === 'phone' ? 'tel' : 'off'
    c.inputMode = r === 'phone' ? 'tel' : r === 'email' ? 'email' : 'text'
  }
  // a draft in this browser only: the job's answers, the reply channel, the free line; not the contact or name
  try {
    const d = JSON.parse(store(draftKey) || 'null')
    if (d) {
      fields().forEach((el) => { if (d[el.name] != null && !el.value) el.value = d[el.name] })
      if (d.more && !f.elements.more.value) f.elements.more.value = d.more
      const r = d.reply && f.querySelector(`input[name="reply"][value="${d.reply}"]`); if (r) r.checked = true
    }
  } catch { /* none kept */ }
  const save = () => {
    const d = { reply: reply(), more: f.elements.more.value }
    fields().forEach((el) => { d[el.name] = el.value })
    store(draftKey, JSON.stringify(d))
  }
  f.addEventListener('input', save)
  f.addEventListener('change', () => { fit(); save() })
  fit()

  const say = (html, focus) => { msg.innerHTML = html; if (focus) { msg.tabIndex = -1; msg.focus() } }
  const lineHref = (ref) => (T.lineUrl || 'https://line.me/R/ti/p/@964yxgnk')

  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (busy) return
    f.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'))
    const miss = fields().filter((el) => el.required && !el.value.trim())
    const contact = f.elements.contact.value.trim(), r = reply()
    if (miss.length) {
      miss.forEach((el) => el.setAttribute('aria-invalid', 'true'))
      const names = miss.map((el) => (el.closest('label') ? el.closest('label').firstChild.textContent.trim() : el.name))
      say(`<p>${esc((T.errMissing || '') + ': ' + names.join(', '))}</p>`)
      miss[0].focus(); return
    }
    if (contact.length < 3) { f.elements.contact.setAttribute('aria-invalid', 'true'); say(`<p>${esc(T.errContact)}</p>`); f.elements.contact.focus(); return }
    if (r === 'email' && !mailOk(contact)) { f.elements.contact.setAttribute('aria-invalid', 'true'); say(`<p>${esc(T.errMail)}</p>`); f.elements.contact.focus(); return }
    // the request in English labels for the team, whatever the page's language; the answers as typed
    const lines = fields().filter((el) => el.value.trim()).map((el) => `${el.dataset.en}: ${el.value.trim()}`)
    if (f.elements.more.value.trim()) lines.push('', f.elements.more.value.trim())
    const body = {
      job, service: f.dataset.name, lang, page: location.pathname, k: key, reply: r,
      name: f.elements.name.value.trim(), message: lines.join('\n'), website: f.elements.website.value,
      email: r === 'email' ? contact : '', line: r === 'line' ? contact : '', phone: r === 'phone' ? contact : '',
    }
    busy = true
    const btn = f.querySelector('button[type="submit"]'); btn.disabled = true
    say(`<p>${esc(T.sending)}</p>`)
    let j
    try { j = await (await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })).json() } catch { j = { ok: false } }
    busy = false; btn.disabled = false
    if (!j.ok || !j.ref) {
      say(`<p>${esc(lang === 'en' && j.error && j.error.length < 140 ? j.error : T.errSend)}</p><p><a class="btn alt" href="${esc(lineHref())}">LINE</a></p>`, true)
      return
    }
    store(draftKey, null)
    if (window.hd) window.hd('ask', 'job:' + job)
    say(`<p class="ref">${esc(T.gotRef).replace('{ref}', `<span class="nw">${esc(j.ref)}</span>`)}</p><p>${esc(T.notYet)}</p>` +
      `<p><a class="btn alt" href="${esc(lineHref(j.ref))}">${esc(T.lineRef.replace('{ref}', j.ref))}</a> <button class="btn alt" type="button" data-again>${esc(T.again)}</button></p>`, true)
    btn.hidden = true
  })
  // another request like the last: the same answers, a new key, Send again
  msg.addEventListener('click', (e) => {
    if (!e.target.closest('[data-again]')) return
    key = newKey()
    f.querySelector('button[type="submit"]').hidden = false
    msg.innerHTML = ''
    const first = fields()[0]; if (first) first.focus()
  })
}

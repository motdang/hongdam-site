// Card or PayPal on PayPal's page (functions/_paypal.js) for a Buy-button order, against a stand-in PayPal and a
// SQLite copy of the D1 tables (node:sqlite), so the SQL runs as written.
import assert from 'node:assert'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, readdirSync } from 'node:fs'

const sql = new DatabaseSync(':memory:')
for (const f of readdirSync(new URL('../migrations/', import.meta.url)).sort()) sql.exec(readFileSync(new URL('../migrations/' + f, import.meta.url), 'utf8'))
const stmt = (q, a = []) => ({ q, a, bind: (...b) => stmt(q, b),
  run: async () => { const r = sql.prepare(q).run(...a); return { meta: { changes: Number(r.changes) } } },
  first: async () => sql.prepare(q).get(...a) ?? null,
  all: async () => ({ results: sql.prepare(q).all(...a) }) })
const TASKS = { prepare: (q) => stmt(q), batch: async (list) => list.map((s) => ({ results: sql.prepare(s.q).all(...s.a) })) }

// stand-in PayPal and rates
const pp = { orders: {}, calls: [] }
globalThis.fetch = async (u, o = {}) => {
  const url = String(u?.url || u)
  if (url.startsWith('https://api.frankfurter.dev/')) return Response.json({ date: '2026-10-23', rates: { EUR: 0.8934, THB: 33.745 } })
  if (url.startsWith('https://pp.test/')) {
    const path = url.slice('https://pp.test'.length)
    pp.calls.push([o.method || 'GET', path])
    if (path === '/v1/oauth2/token') return Response.json({ access_token: 'T' })
    if (path === '/v2/checkout/orders') {
      const b = JSON.parse(o.body), id = 'PP' + (Object.keys(pp.orders).length + 1).toString().padStart(8, '0')
      pp.orders[id] = { b, paid: false }
      return Response.json({ id, status: 'PAYER_ACTION_REQUIRED', links: [{ rel: 'self', href: 'x' }, { rel: 'payer-action', href: 'https://www.paypal.com/checkoutnow?token=' + id }] })
    }
    const m = path.match(/^\/v2\/checkout\/orders\/(\w+)\/capture$/)
    if (m) {
      const ord = pp.orders[m[1]]
      if (!ord) return Response.json({ name: 'RESOURCE_NOT_FOUND' }, { status: 404 })
      const nx = pp.next; pp.next = null
      if (nx === 'down') return new Response('busy', { status: 503 })
      if (nx === 'declined') return Response.json({ details: [{ issue: 'INSTRUMENT_DECLINED' }] }, { status: 422 })
      if (ord.paid) return Response.json({ details: [{ issue: 'ORDER_ALREADY_CAPTURED' }] }, { status: 422 })
      ord.paid = true
      const pu = ord.b.purchase_units[0]
      return Response.json({ id: m[1], status: 'COMPLETED', purchase_units: [{ custom_id: pu.custom_id, payments: { captures: [{ id: 'CAP' + m[1], status: 'COMPLETED', custom_id: pu.custom_id, amount: pu.amount }] } }] })
    }
    const g = path.match(/^\/v2\/checkout\/orders\/(\w+)$/)
    if (g) { const pu = pp.orders[g[1]].b.purchase_units[0]; return Response.json({ id: g[1], status: 'COMPLETED', purchase_units: [{ custom_id: pu.custom_id, payments: { captures: [{ id: 'CAP' + g[1], status: 'COMPLETED', amount: pu.amount }] } }] }) }
  }
  throw new Error('unexpected fetch ' + url)
}

const { onRequest } = await import('../functions/api/buy/[[path]].js')
const told = []
const call = async (env, method, path, body) => (await onRequest({ env, params: { path }, waitUntil: (p) => told.push(p),
  request: new Request('https://hongdam.net/api/buy' + (path ? '/' + path.join('/') : ''), { method, headers: { 'content-type': 'application/json', origin: 'https://hongdam.net' }, body: body && JSON.stringify(body) }) })).json()

const off = { TASKS }
const on = { TASKS, PAYPAL_CLIENT_ID: 'id', PAYPAL_SECRET: 'sec', PAYPAL_API: 'https://pp.test' }
// off until the keys are set
assert.equal((await call(off, 'GET')).card, false)
assert.equal((await call(on, 'GET')).card, true)

// an order in euros, paid by card
const o = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 2, contact: 'line:abc', lang: 'de', pay: 'EUR' })
assert.equal(o.ok, true); assert.equal(o.show.cur, 'EUR')
assert.equal((await call(off, 'POST', ['card'], { ref: o.ref })).why, 'off')
const s = await call(on, 'POST', ['card'], { ref: o.ref })
assert.equal(s.ok, true); assert.match(s.url, /^https:\/\/www\.paypal\.com\/checkoutnow\?token=PP/)
const sent = Object.values(pp.orders)[0].b
assert.deepEqual(sent.purchase_units[0].amount, { currency_code: 'EUR', value: o.show.due.toFixed(2) })
assert.equal(sent.purchase_units[0].custom_id, o.ref)
assert.equal(sent.payment_source.paypal.experience_context.return_url, `https://hongdam.net/de/buy/?ref=${o.ref}&pp=back`)
assert.equal(sent.payment_source.paypal.experience_context.landing_page, 'GUEST_CHECKOUT')
assert.match(sql.prepare('SELECT pay FROM svc_buy WHERE ref = ?').get(o.ref).pay, /"pp":"PP00000001"/)
// back from PayPal: captured, checked, paid; a reload stays paid
let d = await call(on, 'POST', ['card', 'done'], { ref: o.ref, token: 'PP00000001' })
assert.deepEqual(d, { ok: true, ref: o.ref, state: 'paid' })
assert.equal(sql.prepare('SELECT state, paid_ref FROM svc_buy WHERE ref = ?').get(o.ref).paid_ref, 'paypal CAPPP00000001')
d = await call(on, 'POST', ['card', 'done'], { ref: o.ref, token: 'PP00000001' })
assert.equal(d.state, 'paid')
await Promise.all(told)
assert.equal(sql.prepare("SELECT count(*) n FROM svc_order WHERE src = 'paid'").get().n, 1)

// a PayPal order for another amount does not pay this one
const o2 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 1, contact: 'line:xyz', pay: 'USD' })
const s2 = await call(on, 'POST', ['card'], { ref: o2.ref })
const id2 = s2.url.split('token=')[1]
pp.orders[id2].b.purchase_units[0].amount.value = '1.00'   // the buyer paid a different amount
d = await call(on, 'POST', ['card', 'done'], { ref: o2.ref, token: id2 })
// money moved for the wrong amount: held for the team, not paid, not open to a second payment
assert.equal(d.ok, false); assert.equal(sql.prepare('SELECT state FROM svc_buy WHERE ref = ?').get(o2.ref).state, 'capturing')
// a token in the return address alone pays nothing: the PayPal order must be the one /api/buy/card kept
const o3 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 2, contact: 'line:q', pay: 'EUR' })
d = await call(on, 'POST', ['card', 'done'], { ref: o3.ref, token: 'PP00000001' })
assert.equal(d.ok, false); assert.equal(sql.prepare('SELECT state FROM svc_buy WHERE ref = ?').get(o3.ref).state, 'booked')

// a baht order: PromptPay slip check reads its baht; a US$ price paid in baht gets PromptPay too
const o4 = await call(on, 'POST', undefined, { card: 'ai-own', opt: 'ai-own-usd', contact: 'line:r', pay: 'THB' })
assert.equal(o4.show.cur, 'THB'); assert.equal(o4.pay.thb, o4.show.due); assert.ok(o4.pay.promptpay)
console.log('card ok')

// CodeRabbit on #76: an unknown card keeps its own message; a held order (capturing) cannot be paid by a slip or
// the team meanwhile; a failed capture lets it go; before 0011 the card page charges the pay box's currency.
let x = await call(on, 'POST', undefined, { card: 'no-such-card', contact: 'line:z' })
assert.equal(x.why, 'card')
const o5 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 1, contact: 'line:held', pay: 'EUR' })
const s5 = await call(on, 'POST', ['card'], { ref: o5.ref })
sql.prepare("UPDATE svc_buy SET state = 'capturing' WHERE ref = ?").run(o5.ref)
const adm = { ...on, TASKS_ADMIN: 'k' }
const mv = await (await onRequest({ env: adm, params: { path: ['state'] }, waitUntil: () => {}, request: new Request('https://hongdam.net/api/buy/state', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer k' }, body: JSON.stringify({ ref: o5.ref, state: 'paid' }) }) })).json()
assert.equal(mv.why, 'busy')
assert.equal((await call(on, 'GET', [o5.ref])).state, 'claimed')   // the tracker reads it as checking
x = await call(on, 'POST', ['card', 'done'], { ref: o5.ref, token: s5.url.split('token=')[1] })   // a held order finishes on its return
assert.equal(x.state, 'paid')
const o6 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 1, contact: 'line:fail', pay: 'USD' })
const s6 = await call(on, 'POST', ['card'], { ref: o6.ref })
pp.orders[s6.url.split('token=')[1]].b.purchase_units[0].amount.value = '2.00'
x = await call(on, 'POST', ['card', 'done'], { ref: o6.ref, token: s6.url.split('token=')[1] })
assert.equal(x.ok, false); assert.equal(sql.prepare('SELECT state FROM svc_buy WHERE ref = ?').get(o6.ref).state, 'capturing')
// the team, having checked PayPal, can move a held order on with force; without it, busy
const st = (body) => onRequest({ env: adm, params: { path: ['state'] }, waitUntil: () => {}, request: new Request('https://hongdam.net/api/buy/state', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer k' }, body: JSON.stringify(body) }) }).then((r) => r.json())
assert.equal((await st({ ref: o6.ref, state: 'paid' })).why, 'busy')
assert.equal((await st({ ref: o6.ref, state: 'paid', force: true })).state, 'paid')
// a declined card lets the order go; an unknown answer (PayPal down) keeps it held
const o8 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 1, contact: 'line:dec', pay: 'EUR' })
await call(on, 'POST', ['card'], { ref: o8.ref })
pp.next = 'declined'
x = await call(on, 'POST', ['card', 'done'], { ref: o8.ref })
assert.equal(x.why, 'paypal'); assert.equal(sql.prepare('SELECT state FROM svc_buy WHERE ref = ?').get(o8.ref).state, 'booked')
const o9 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 1, contact: 'line:down', pay: 'EUR' })
await call(on, 'POST', ['card'], { ref: o9.ref })
pp.next = 'down'
x = await call(on, 'POST', ['card', 'done'], { ref: o9.ref })
assert.equal(x.why, 'pending'); assert.equal(sql.prepare('SELECT state FROM svc_buy WHERE ref = ?').get(o9.ref).state, 'capturing')
x = await call(on, 'POST', ['card', 'done'], { ref: o9.ref })   // the buyer's next return finishes it
assert.equal(x.state, 'paid')
const o7 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 1, contact: 'line:old', pay: 'THB' })
sql.prepare('UPDATE svc_buy SET pay = NULL WHERE ref = ?').run(o7.ref)   // as before 0011
await call(on, 'POST', ['card'], { ref: o7.ref, cur: 'EUR' })
assert.equal(Object.values(pp.orders).at(-1).b.purchase_units[0].amount.currency_code, 'EUR')
console.log('card review fixes ok')

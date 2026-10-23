import assert from 'node:assert'
import { quote, payLinks, HALF_FROM } from '../functions/_shop.js'
import { CARDS } from '../functions/_shop_data.js'
import { onRequest } from '../functions/api/buy/[[path]].js'

const walked = { call: 300, 'interp-person': 3000, 'web-site': 30000, trades: 500 }
// walking price × quantity
assert.deepEqual(quote('call', 'call', 3, false, walked), { total: 900, due: 900, cur: 'THB', qty: 3, opt: 'call', addon: false })
// tiered translation, 8 pages, stamped: 1,500 + 3 × 500 + 8 × 100
assert.equal(quote('translate', 'lang-new', 8, true, walked).total, 3800)
assert.equal(quote('translate', 'lang-check', 2, false, walked).total, 500)
// from ฿10,000, half now
assert.deepEqual(quote('site', 'web-site', 1, false, walked), { total: 30000, due: 15000, cur: 'THB', qty: 1, opt: 'web-site', addon: false })
// US$ option: half from US$300, no PromptPay
const u = quote('ai-own', 'ai-own-usd', 1, false, walked)
assert.equal(u.cur, 'USD'); assert.equal(u.due, 12500)
assert.equal(payLinks('USD', 12500).promptpay, undefined)
assert.equal(payLinks('THB', 900).paypal, 'https://www.paypal.me/pfauhaus/900THB')
// a quantity is clamped; an option a card lacks, a card that is not for sale, and a missing price are refused
assert.equal(quote('call', 'call', 999, false, walked).qty, CARDS.call.opts[0].max)
assert.equal(quote('call', 'web-site', 1, false, walked).error, 'card')
assert.equal(quote('php', '', 1, false, walked).error, 'card')
assert.equal(quote('trades', 'trades', 1, false, {}).error, 'price')
assert.ok(HALF_FROM.THB === 10000)
// every buy card has options with a price rule
for (const [id, c] of Object.entries(CARDS)) if (c.act === 'buy') assert.ok(c.opts.length && c.opts.every((o) => o.price), id)

// the endpoint, with a stand-in database
const rows = []
const db = { prepare: (sql) => ({ bind: (...a) => ({ run: async () => { if (sql.startsWith('INSERT INTO svc_buy')) rows.push(a); return { meta: { changes: 1 } } },
  first: async () => (rows[0] ? { ref: rows[0][0], card: rows[0][1], opt: rows[0][2], qty: rows[0][3], addon: 0, total: rows[0][5], due: rows[0][6], cur: rows[0][7], contact: rows[0][8], state: 'booked' } : null),
  all: async () => ({ results: [] }) }), all: async () => ({ results: [] }) }) }
const told = []
const env = { TASKS: db }
const ctx = (method, path, body) => ({ env, params: { path }, waitUntil: (p) => told.push(p),
  request: new Request('https://hongdam.net/api/buy' + (path ? '/' + path.join('/') : ''), { method, headers: { 'content-type': 'application/json', origin: 'https://hongdam.net' }, body: body && JSON.stringify(body) }) })
let r = await (await onRequest(ctx('POST', undefined, { card: 'call', opt: 'call', qty: 2, contact: 'line:abc', lang: 'th' }))).json()
assert.equal(r.ok, true); assert.match(r.ref, /^HD-[0-9A-Z]{6}$/); assert.equal(r.total, 600); assert.equal(r.pay.promptpay, '0988239210')
assert.equal(rows.length, 1)
r = await (await onRequest(ctx('POST', undefined, { card: 'call', contact: 'x' }))).json()
assert.equal(r.why, 'contact')
r = await (await onRequest(ctx('POST', ['claim'], { ref: rows[0][0], how: 'wise' }))).json()
assert.equal(r.state, 'claimed')
const bad = await onRequest({ ...ctx('POST', undefined, { card: 'call', contact: 'abc' }), request: new Request('https://hongdam.net/api/buy', { method: 'POST', headers: { origin: 'https://evil.example' }, body: '{}' }) })
assert.equal(bad.status, 403)
console.log('buy ok')

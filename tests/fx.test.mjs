// The ฿ / $ / € switch (her ask 2026-10-24): rates, the arithmetic shared with docs/assets/cur.js, and /api/buy in $ and €.
import assert from 'node:assert'
import { readFileSync } from 'node:fs'

const real = globalThis.fetch
let feed = 'ok'
globalThis.fetch = async (u, o) => {
  const url = String(u?.url || u)
  if (url.startsWith('https://api.frankfurter.dev/')) {
    if (feed !== 'ok') return new Response('down', { status: 503 })
    return Response.json({ amount: 1, base: 'USD', date: '2026-10-23', rates: { EUR: 0.86, THB: 32.4 } })
  }
  if (url.startsWith('https://open.er-api.com/')) {
    if (feed === 'none') return new Response('down', { status: 503 })
    return Response.json({ result: 'success', time_last_update_unix: 1793145600, rates: { EUR: 0.87, THB: 32.5 } })
  }
  return real(u, o)
}

const { conv, rates, suggest } = await import('../functions/_fx.js')
// through baht, rounded up to a whole unit
const R = { THB: 1, USD: 32.4, EUR: 37.6744 }
assert.equal(conv(4000, 'THB', 'USD', R), 124)     // 123.46
assert.equal(conv(4000, 'THB', 'EUR', R), 107)     // 106.17
assert.equal(conv(99, 'USD', 'THB', R), 3208)      // 3207.6
assert.equal(conv(99, 'USD', 'EUR', R), 86)        // 85.1
assert.equal(conv(3240, 'THB', 'USD', R), 100)     // exactly 100, not 101
assert.equal(conv(500, 'THB', 'THB', R), 500)
assert.equal(conv(500, 'THB', 'EUR', null), null)
// the page does the same arithmetic
const src = readFileSync(new URL('../docs/assets/cur.js', import.meta.url), 'utf8')
const body = src.match(/export function conv\(n, from, to, rates = fx && fx.rates\) \{([\s\S]*?)\n\}/)[1]
const pageConv = new Function('n', 'from', 'to', 'rates', body)
for (const [n, f, t] of [[4000, 'THB', 'USD'], [4000, 'THB', 'EUR'], [99, 'USD', 'THB'], [99, 'USD', 'EUR'], [3240, 'THB', 'USD'], [12345, 'THB', 'EUR']])
  assert.equal(pageConv(n, f, t, R), conv(n, f, t, R), `${n} ${f}→${t}`)
// the reader's country picks the currency the page opens in
assert.deepEqual(['TH', 'MM', 'DE', 'CH', 'GB', 'US', 'AU', ''].map(suggest), ['THB', 'THB', 'EUR', 'EUR', 'EUR', 'USD', 'USD', 'THB'])

// feed → spare → last good answer kept in KV
const kv = new Map()
const RT_LIMIT = { put: async (k, v) => { kv.set(k, v) }, get: async (k, t) => (kv.has(k) ? (t === 'json' ? JSON.parse(kv.get(k)) : kv.get(k)) : null) }
let r = await rates({ RT_LIMIT }, 1e12)
assert.deepEqual(r.rates, { THB: 1, USD: 32.4, EUR: 37.6744 }); assert.equal(r.at, '2026-10-23')
feed = 'spare'
r = await rates({ RT_LIMIT }, 1e12 + 3600e3)
assert.equal(r.rates.USD, 32.5); assert.match(r.src, /Exchange Rate API/)
feed = 'none'
r = await rates({ RT_LIMIT }, 1e12 + 7200e3)
assert.equal(r.rates.USD, 32.5); assert.equal(r.stale, true)
r = await rates({}, 1e12 + 7500e3)   // the same isolate's answer within ten minutes
assert.equal(r.rates.USD, 32.5)
feed = 'ok'

// /api/fx
const { onRequestGet } = await import('../functions/api/fx.js')
const req = new Request('https://hongdam.net/api/fx'); Object.defineProperty(req, 'cf', { value: { country: 'FR' } })
const j = await (await onRequestGet({ request: req, env: { RT_LIMIT } })).json()
assert.equal(j.base, 'THB'); assert.ok(j.rates.USD > 30); assert.equal(j.suggest, 'EUR')

// /api/buy: the buyer pays in their currency; PromptPay in baht, also for a US$ price
const rows = []
const db = { batch: async (list) => list.map(() => ({ results: [{ n: 1 }] })),
  prepare: (sql) => ({ bind: (...a) => ({ sql, a, run: async () => { if (sql.startsWith('INSERT INTO svc_buy')) rows.push({ sql, a }); return { meta: { changes: 1 } } },
    first: async () => null, all: async () => ({ results: [] }) }), all: async () => ({ results: [] }) }) }
const { onRequest } = await import('../functions/api/buy/[[path]].js')
const post = async (body, env = { TASKS: db, RT_LIMIT }) => (await onRequest({ env, params: {}, waitUntil: () => {},
  request: new Request('https://hongdam.net/api/buy', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://hongdam.net' }, body: JSON.stringify(body) }) })).json()
const rt = (await rates({ RT_LIMIT })).rates
let o = await post({ card: 'call', opt: 'call', qty: 2, contact: 'line:abc', pay: 'EUR' })
assert.equal(o.ok, true); assert.equal(o.cur, 'THB'); assert.equal(o.total, 600)
assert.deepEqual(o.show, { cur: 'EUR', total: conv(600, 'THB', 'EUR', rt), due: conv(600, 'THB', 'EUR', rt) })
assert.equal(o.pay.paypal, `https://www.paypal.me/pfauhaus/${o.show.due}EUR`)
assert.equal(o.pay.thb, 600); assert.equal(o.pay.promptpay, '0988239210')
assert.match(rows.at(-1).sql, /, pay\)/); assert.equal(JSON.parse(rows.at(-1).a.at(-1)).cur, 'EUR')
// in baht: as before, no pay column
o = await post({ card: 'call', opt: 'call', qty: 2, contact: 'line:abc', pay: 'THB' })
assert.deepEqual(o.show, { cur: 'THB', total: 600, due: 600 }); assert.doesNotMatch(rows.at(-1).sql, /pay\)/)
// a US$ price paid in US$ still offers PromptPay, in baht
o = await post({ card: 'ai-own', opt: 'ai-own-usd', contact: 'line:abc', pay: 'USD' })
assert.equal(o.show.cur, 'USD'); assert.equal(o.pay.thb, conv(o.due, 'USD', 'THB', rt)); assert.ok(o.pay.promptpay)
// an unknown currency is the price's own
o = await post({ card: 'call', opt: 'call', qty: 1, contact: 'line:abc', pay: 'GBP' })
assert.equal(o.show.cur, 'THB')
// before migration 0011: the order goes through without the column
const old = { ...db, prepare: (sql) => ({ bind: (...a) => ({ run: async () => { if (/, pay\)/.test(sql)) throw new Error('D1_ERROR: table svc_buy has no column named pay'); rows.push({ sql, a }); return { meta: { changes: 1 } } }, first: async () => null, all: async () => ({ results: [] }) }), all: async () => ({ results: [] }) }) }
o = await post({ card: 'call', opt: 'call', qty: 1, contact: 'line:abc', pay: 'USD' }, { TASKS: old, RT_LIMIT })
assert.equal(o.ok, true); assert.equal(o.show.cur, 'USD'); assert.doesNotMatch(rows.at(-1).sql, /pay\)/)
const kv2 = new Map(), fresh = { put: async (k, v) => { kv2.set(k, v) }, get: async (k, t) => (kv2.has(k) ? (t === 'json' ? JSON.parse(kv2.get(k)) : kv2.get(k)) : null) }   // five orders a day per address
o = await post({ card: 'ai-own', opt: 'ai-own-usd', contact: 'line:abc', pay: 'USD' }, { TASKS: old, RT_LIMIT: fresh })
assert.equal(o.ok, true)
assert.equal(o.pay.promptpay, undefined)   // a US$ price: no PromptPay until the baht can be kept for the slip check
console.log('fx ok')

// Bitcoin by Lightning (functions/_lightning.js) for a Buy-button order, against a stand-in wallet behind a
// Lightning Address and a SQLite copy of the D1 tables (node:sqlite), so the SQL runs as written.
import assert from 'node:assert'
import { createHash } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, readdirSync } from 'node:fs'
import { decode, satsFor } from '../functions/_lightning.js'

// the BOLT11 example "1 cup coffee" (lightning/bolts, 11-payment-encoding.md)
const SPEC = 'lnbc2500u1pvjluezsp5zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygspp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpu9qrsgquk0rl77nj30yxdy8j9vdx85fkpmdla2087ne0xh8nhedh8w27kyke0lp53ut353s06fv3qfegext0eh0ymjpf39tuven09sam30g4vgpfna3rh'
assert.deepEqual(decode(SPEC), { pr: SPEC, msat: 250000000, hash: '0001020304050607080900010203040506070809000102030405060708090102', ts: 1496314658, expiry: 60 })
assert.equal(decode('LIGHTNING:' + SPEC.toUpperCase()).msat, 250000000)
assert.equal(decode(SPEC.slice(0, -1) + 'q'), null)              // checksum
assert.equal(decode(SPEC.replace('lnbc', 'lntb')), null)          // not mainnet
assert.equal(satsFor(100, 'USD', 100000, null), 100000)
assert.equal(satsFor(3374.5, 'THB', 100000, { THB: 1, USD: 33.745, EUR: 37.77 }), 100000)

// bills made here, as a wallet makes them (signature left as zeros: it is not checked)
const CH = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const polymod = (vs) => { const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]; let c = 1; for (const v of vs) { const b = c >>> 25; c = ((c & 0x1ffffff) << 5) ^ v; for (let i = 0; i < 5; i++) if ((b >>> i) & 1) c ^= G[i] } return c >>> 0 }
const hx = (h) => [...[...h].map((c) => c.charCodeAt(0) >> 5), 0, ...[...h].map((c) => c.charCodeAt(0) & 31)]
const words = (n, len) => Array.from({ length: len }, (_, i) => Math.floor(n / 32 ** (len - 1 - i)) % 32)
const five = (bytes) => { const o = []; let acc = 0, bits = 0; for (const b of bytes) { acc = (acc << 8) | b; bits += 8; while (bits >= 5) { bits -= 5; o.push((acc >> bits) & 31) } acc &= (1 << bits) - 1 } if (bits) o.push((acc << (5 - bits)) & 31); return o }
function bill(msat, hash, { ts = Math.floor(Date.now() / 1000), expiry = 600 } = {}) {
  const hrp = 'lnbc' + msat / 100 + 'n', ph = five(Buffer.from(hash, 'hex')), xw = words(expiry, 3)
  const data = [...words(ts, 7), 1, ...words(ph.length, 2), ...ph, 6, ...words(xw.length, 2), ...xw, ...new Array(104).fill(0)]
  const chk = polymod([...hx(hrp), ...data, 0, 0, 0, 0, 0, 0]) ^ 1
  return hrp + '1' + [...data, ...[0, 1, 2, 3, 4, 5].map((i) => (chk >>> (5 * (5 - i))) & 31)].map((w) => CH[w]).join('')
}
const pre = (n) => n.toString(16).padStart(64, '0')
const sha = (h) => createHash('sha256').update(Buffer.from(h, 'hex')).digest('hex')
const mine = bill(123400000, sha(pre(7)))
assert.equal(decode(mine).msat, 123400000); assert.equal(decode(mine).hash, sha(pre(7))); assert.equal(decode(mine).expiry, 600)

const sql = new DatabaseSync(':memory:')
for (const f of readdirSync(new URL('../migrations/', import.meta.url)).sort()) sql.exec(readFileSync(new URL('../migrations/' + f, import.meta.url), 'utf8'))
const stmt = (q, a = []) => ({ q, a, bind: (...b) => stmt(q, b),
  run: async () => { const r = sql.prepare(q).run(...a); return { meta: { changes: Number(r.changes) } } },
  first: async () => sql.prepare(q).get(...a) ?? null,
  all: async () => ({ results: sql.prepare(q).all(...a) }) })
const TASKS = { prepare: (q) => stmt(q), batch: async (list) => list.map((s) => ({ results: sql.prepare(s.q).all(...s.a) })) }

// the stand-in wallet: shop@ln.test; w.next shapes its next bill, w.bills[hash] = {preimage, paid}
const w = { bills: {}, calls: [], n: 0, verify: true, next: null }
globalThis.fetch = async (u) => {
  const url = new URL(String(u?.url || u))
  if (url.host === 'api.frankfurter.dev') return Response.json({ date: '2026-10-23', rates: { EUR: 0.8934, THB: 33.745 } })
  if (url.host === 'api.kraken.com') return Response.json({ error: [], result: { XXBTZUSD: { c: ['100000.0', '0.01'] } } })
  if (url.host !== 'ln.test') throw new Error('unexpected fetch ' + url)
  w.calls.push(url.pathname + url.search)
  if (url.pathname === '/.well-known/lnurlp/shop') return Response.json({ tag: 'payRequest', callback: 'https://ln.test/cb/shop', minSendable: 1000, maxSendable: 1e11, metadata: '[["text/plain","shop"]]', commentAllowed: 64 })
  if (url.pathname === '/cb/shop') {
    const msat = Number(url.searchParams.get('amount')), p = pre(++w.n), h = sha(p), nx = w.next || {}
    w.next = null
    w.bills[h] = { preimage: p, paid: false }
    return Response.json({ pr: bill(nx.msat || msat, h, nx), routes: [], ...(w.verify ? { verify: 'https://ln.test/verify/' + h } : {}) })
  }
  const v = url.pathname.match(/^\/verify\/(\w+)$/)
  if (v) {
    const b = w.bills[v[1]]
    if (!b) return Response.json({ status: 'ERROR', reason: 'Not found' })
    return Response.json({ status: 'OK', settled: b.paid, preimage: b.paid ? (b.fake || b.preimage) : null })
  }
  throw new Error('unexpected wallet path ' + url.pathname)
}

const { onRequest } = await import('../functions/api/buy/[[path]].js')
const told = []
const call = async (env, method, path, body) => (await onRequest({ env, params: { path }, waitUntil: (p) => told.push(p),
  request: new Request('https://hongdam.net/api/buy' + (path ? '/' + path.join('/') : ''), { method, headers: { 'content-type': 'application/json', origin: 'https://hongdam.net' }, body: body && JSON.stringify(body) }) })).json()
const row = (ref) => sql.prepare('SELECT state, paid_ref, pay FROM svc_buy WHERE ref = ?').get(ref)

const off = { TASKS }
const on = { TASKS, LN_ADDRESS: 'shop@ln.test' }
// off while there is no Lightning Address
assert.equal((await call(off, 'GET')).ln, false)
assert.equal((await call(on, 'GET')).ln, true)

// an order in euros, a bill in sats at this minute's price
const o = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 2, contact: 'line:ln', lang: 'de', pay: 'EUR' })
assert.equal(o.ok, true); assert.equal(o.show.cur, 'EUR')
assert.equal((await call(off, 'POST', ['ln'], { ref: o.ref })).why, 'off')
const b = await call(on, 'POST', ['ln'], { ref: o.ref })
const want = satsFor(o.show.due, 'EUR', 100000, { THB: 1, USD: 33.745, EUR: +(33.745 / 0.8934).toFixed(4) })
assert.equal(b.ok, true); assert.equal(b.sats, want); assert.equal(b.check, true)
assert.equal(decode(b.pr).msat, want * 1000)
assert.ok(w.calls.some((c) => c === `/cb/shop?amount=${want * 1000}&comment=Hongdam+${o.ref}`))
const kept = JSON.parse(row(o.ref).pay).ln
assert.equal(kept.pr, b.pr); assert.equal(kept.btc, 100000); assert.equal(JSON.parse(row(o.ref).pay).cur, 'EUR')
// a second press shows the same bill
assert.equal((await call(on, 'POST', ['ln'], { ref: o.ref })).pr, b.pr)
// not paid yet
assert.deepEqual(await call(on, 'POST', ['ln', 'check'], { ref: o.ref }), { ok: true, ref: o.ref, state: 'booked', exp: kept.exp })
// the wallet says settled, with a preimage that is not the bill's: not paid, the team told
w.bills[kept.hash].paid = true; w.bills[kept.hash].fake = pre(999)
assert.equal((await call(on, 'POST', ['ln', 'check'], { ref: o.ref })).state, 'booked')
assert.equal(row(o.ref).state, 'booked')
// settled with its own preimage: paid
delete w.bills[kept.hash].fake
assert.deepEqual(await call(on, 'POST', ['ln', 'check'], { ref: o.ref }), { ok: true, ref: o.ref, state: 'paid' })
assert.equal(row(o.ref).paid_ref, 'lightning ' + kept.hash)
assert.equal((await call(on, 'POST', ['ln', 'check'], { ref: o.ref })).state, 'paid')
assert.equal((await call(on, 'POST', ['ln'], { ref: o.ref })).state, 'paid')   // no new bill for a paid order
await Promise.all(told)
assert.equal(sql.prepare("SELECT count(*) n FROM svc_order WHERE src = 'paid'").get().n, 1)
console.log('lightning ok')

// a bill for another amount than the one asked for is refused
const o2 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 1, contact: 'line:ln2', pay: 'USD' })
w.next = { msat: 1000 }
assert.equal((await call(on, 'POST', ['ln'], { ref: o2.ref })).why, 'ln')
assert.equal(JSON.parse(row(o2.ref).pay).ln, undefined)
// a bill about to run out: checked once more, then a new one
w.next = { ts: Math.floor(Date.now() / 1000) - 590, expiry: 600 }
const b2 = await call(on, 'POST', ['ln'], { ref: o2.ref })
const b3 = await call(on, 'POST', ['ln'], { ref: o2.ref })
assert.notEqual(b2.pr, b3.pr)
// paid while running out: the next press finds it paid, no new bill
const h3 = JSON.parse(row(o2.ref).pay).ln.hash
sql.prepare("UPDATE svc_buy SET pay = json_set(pay, '$.ln.exp', ?) WHERE ref = ?").run(Math.floor(Date.now() / 1000) + 30, o2.ref)
w.bills[h3].paid = true
assert.equal((await call(on, 'POST', ['ln'], { ref: o2.ref })).state, 'paid')

// a baht order paid on the tracker: the buyer closed the pay page, then opened the order page
const o3 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 1, contact: 'line:ln3', pay: 'THB' })
await call(on, 'POST', ['ln'], { ref: o3.ref })
w.bills[JSON.parse(row(o3.ref).pay).ln.hash].paid = true
assert.equal((await call(on, 'GET', [o3.ref])).state, 'paid')

// a wallet with no way to check: the buyer says paid, the team checks the wallet
w.verify = false
const o4 = await call(on, 'POST', undefined, { card: 'call', opt: 'call', qty: 1, contact: 'line:ln4', pay: 'USD' })
const b4 = await call(on, 'POST', ['ln'], { ref: o4.ref })
assert.equal(b4.check, false)
assert.equal((await call(on, 'POST', ['ln', 'check'], { ref: o4.ref })).state, 'booked')
assert.equal((await call(on, 'POST', ['claim'], { ref: o4.ref, how: 'lightning' })).state, 'claimed')
assert.equal(row(o4.ref).paid_ref, 'lightning')
await Promise.all(told)
console.log('lightning edges ok')

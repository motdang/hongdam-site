// hongdam.net/php: the Shoup walk, the related prices, the booking endpoint.
//   node tests/php.test.mjs
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import assert from 'node:assert'
import { walk, slotWeek, pricesFrom, relate, usd, OPENED, KINDS } from '../functions/_php.js'
import { siteOf, phpOf, onRequest } from '../functions/api/php/[[path]].js'
import { onRequest as githubRequest } from '../functions/api/github/[[path]].js'
import { tell } from '../functions/_tasks.js'
import { weekOf, weekStart, L } from '../functions/_github.js'

// Every opening price, floor and ceiling sits on the ladder.
for (const [id, k] of Object.entries(KINDS)) for (const f of ['open', 'floor', 'ceiling']) assert.ok(L.includes(k[f]), `${id} ${f} off the ladder`)

const W = OPENED, now = weekStart(W + 6) + 3600e3
// server, 4 slots: full (up), quiet (down), 3 of 4 (hold), then full three weeks (up, capped at +3)
const s = KINDS.server.slots
const c = { [W]: s, [W + 1]: 0, [W + 2]: 3, [W + 3]: s, [W + 4]: s, [W + 5]: s }
const p = walk('server', c, W, now)
// server opens 5,000 with ceiling 20,000 (two rungs up) and floor 3,000 (one rung down)
assert.deepEqual(p.steps.map((x) => x.baht), [10000, 5000, 5000, 10000, 20000, 20000])
assert.equal(p.baht, 20000)
assert.equal(p.ceiling, 20000)
assert.equal(p.floor, 3000)
assert.equal(walk('server', {}, W, weekStart(W + 10)).baht, 3000) // ten quiet weeks stop at the floor
assert.equal(walk('fleet', {}, W, weekStart(W + 10)).baht, 10000)
assert.equal(walk('hosted', {}, W, weekStart(W + 10)).baht, 1500)
assert.equal(walk('fleet', {}, W, weekStart(W)).baht, KINDS.fleet.open) // no walk in the opening week
// 3 of 4 is 75%: between 60% and 80%, so no change; 2 of 4 is 50%: down
assert.equal(walk('server', { [W]: 3 }, W, weekStart(W + 1)).baht, KINDS.server.open)
assert.equal(walk('server', { [W]: 2 }, W, weekStart(W + 1)).baht, 3000)
assert.equal(slotWeek('fleet', { [W]: 1, [W + 1]: 1 }, weekStart(W) + 1), W + 2)
assert.equal(weekOf(Date.parse('2026-10-26T00:00:00+07:00')), W)
assert.equal(walk('server', { [W - 1]: 4 }, W, weekStart(W + 1)).baht, 3000) // the opening part-week is not walked

// next_check: the first Monday that can move a price is the one after the opening week
assert.equal(walk('server', {}, W, Date.parse('2026-10-22T09:00:00+07:00')).next_check, new Date(weekStart(W + 1)).toISOString())
assert.equal(walk('server', {}, W, weekStart(W + 2) + 1).next_check, new Date(weekStart(W + 3)).toISOString())
// next_slot: today with room, else the Monday of the first week with a slot
const wk = (kind, cs, t) => walk(kind, cs, W, t)
assert.equal(wk('fleet', {}, weekStart(W + 1) + 5 * 3600e3).next_slot, '2026-11-02')
assert.equal(wk('fleet', { [W + 1]: 1, [W + 2]: 1 }, weekStart(W + 1) + 5 * 3600e3).next_slot, '2026-11-16')

// Related prices: a hosted site never costs more than a server, an upgrade and five servers never less.
const quiet = { hosted: {}, server: {}, upgrade: {}, fleet: {} }
const t5 = weekStart(W + 5) + 3600e3
const full = (kind) => Object.fromEntries([0, 1, 2, 3, 4].map((i) => [W + i, KINDS[kind].slots]))
const busyServer = Object.fromEntries(pricesFrom({ ...quiet, server: full('server') }, t5).map((x) => [x.id, x]))
assert.equal(busyServer.server.baht, 20000)
assert.equal(busyServer.hosted.baht, 1500)
assert.equal(busyServer.upgrade.baht, 20000, 'upgrade owns 5,000 but a server costs 20,000')
assert.equal(busyServer.fleet.baht, 30000, 'five servers: the rung above a 20,000 server')
assert.ok(busyServer.fleet.baht > busyServer.server.baht)
const busyHosted = Object.fromEntries(pricesFrom({ ...quiet, hosted: full('hosted') }, t5).map((x) => [x.id, x]))
assert.equal(busyHosted.hosted.own, 10000)
assert.equal(busyHosted.server.baht, 3000)
assert.equal(busyHosted.hosted.baht, 3000, 'hosted capped at the server price')
for (const x of [busyServer, busyHosted]) {
  assert.ok(x.hosted.baht <= x.server.baht && x.upgrade.baht >= x.server.baht && x.fleet.baht > x.server.baht)
  for (const k of Object.values(x)) assert.equal(k.usd, usd(k.baht))
}
assert.equal(relate(pricesFrom(quiet, weekStart(W) + 1)).length, 4)

// US$ : within 3% of the baht at 33 to the dollar on every rung from 1,500
for (const r of L.filter((v) => v >= 1500)) {
  const err = Math.abs(usd(r) - r / 33) / (r / 33)
  assert.ok(err < 0.03, `${r} → US$${usd(r)} is ${(err * 100).toFixed(1)}% off`)
}
for (const k of Object.values(KINDS)) assert.ok(usd(k.open) > 0)

// Site names
assert.equal(siteOf('https://www.Example.com/shop?x=1'), 'www.example.com')
assert.equal(siteOf('example.co.th'), 'example.co.th')
assert.equal(siteOf('203.0.113.7:8080'), '203.0.113.7')
assert.equal(siteOf('user@host.example.com'), 'host.example.com')
assert.equal(siteOf('not a site'), '')
assert.equal(siteOf('localhost'), '')
assert.equal(siteOf('web01'), '')
assert.equal(siteOf('<script>.com'), '')
assert.equal(siteOf('ตัวอย่าง.ไทย'), 'xn--72c1a1bt4awk9o.xn--o3cw4h')
assert.equal(siteOf('a.example.com, b.example.com'), '')
for (const bad of ['127.0.0.1', '0.0.0.0', '10.1.2.3', '172.16.0.9', '172.31.255.1', '192.168.1.1', '169.254.169.254', '2130706433', '0x7f.1', '[::1]'])
  assert.equal(siteOf(bad), '', bad)
assert.equal(siteOf('172.32.0.1'), '172.32.0.1')
assert.equal(siteOf('8.8.8.8'), '8.8.8.8')
// PHP versions
assert.equal(phpOf('PHP 8.3.35 (cli)'), '8.3.35')
assert.equal(phpOf('7.4'), '7.4')
assert.equal(phpOf('no idea'), '')
assert.equal(phpOf('php8.3-fpm'), '8.3')
assert.equal(phpOf('PHP8.3'), '8.3')
assert.equal(phpOf('v8.3.35'), '8.3.35')
assert.equal(phpOf('1.8.3'), '')
assert.equal(phpOf('18.3'), '')

// The endpoint, against a real SQLite with the migration
const raw = new DatabaseSync(':memory:')
raw.exec(readFileSync(new URL('../migrations/0005_php.sql', import.meta.url), 'utf8'))
let fail = 0 // INSERTs to fail before one goes through
const stmt = (sql, args = []) => ({
  bind: (...a) => stmt(sql, a),
  all: async () => ({ results: raw.prepare(sql).all(...args) }),
  first: async () => raw.prepare(sql).get(...args) ?? null,
  run: async () => {
    if (/^INSERT/.test(sql) && fail > 0) { fail--; throw new Error('UNIQUE constraint failed: php_order.ref') }
    const r = raw.prepare(sql).run(...args); return { meta: { last_row_id: Number(r.lastInsertRowid), changes: r.changes } }
  },
})
const sent = []
const real = globalThis.fetch
globalThis.fetch = async (url, init) => { sent.push({ url: String(url), body: init?.body }); return new Response('{}') }
const env = { TASKS: { prepare: (sql) => stmt(sql) }, DISCORD_TASKS: 'https://discord.example/hook' }
const call = async (path, init = {}, e = env) => {
  const waits = []
  const request = new Request('https://hongdam.net/api/php' + path, init)
  const res = await onRequest({ request, env: e, params: { path: path.split('/').filter(Boolean) }, waitUntil: (p) => waits.push(p) })
  await Promise.all(waits)
  return res
}
const post = (b, headers = {}) => call('', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof b === 'string' ? b : JSON.stringify(b) })
const ok = { kind: 'server', site: 'example.com', php: '8.3.35', contact: 'me@example.com', owner: true }
const rows = () => raw.prepare('SELECT * FROM php_order').all()

let r = await call('')
assert.equal(r.status, 200)
assert.equal(r.headers.get('access-control-allow-origin'), '*')
let g = await r.json()
assert.deepEqual(g.kinds.map((k) => k.id), ['hosted', 'server', 'upgrade', 'fleet'])
assert.ok(g.kinds.every((k) => /^\d{4}-\d\d-\d\d$/.test(k.next_slot) && k.usd === usd(k.baht)))
const today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10)
assert.equal(g.kinds.find((k) => k.id === 'server').next_slot, today)

// S1: names that exist on every object are not kinds
for (const kind of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
  r = await post({ ...ok, kind })
  assert.equal(r.status, 400, kind)
  assert.match((await r.json()).error, /Pick one of the four kinds/)
}
assert.equal(rows().length, 0)
for (const kind of ['constructor', 'toString', '__proto__']) {
  const gh = await githubRequest({ request: new Request('https://hongdam.net/api/github', { method: 'POST', body: JSON.stringify({ kind, login: 'abc', contact: 'me@example.com' }) }), env, params: {}, waitUntil() {} })
  assert.equal(gh.status, 400, `github ${kind}`)
}

// A body that is not an object
for (const bad of ['null', '[]', '5', '"x"', '{nope']) {
  r = await post(bad)
  assert.equal(r.status, 400, bad)
  assert.equal((await r.json()).error, 'Could not read that booking.')
}

// Other origins cannot book
r = await post(ok, { origin: 'https://evil.example' })
assert.equal(r.status, 403)
assert.equal(r.headers.get('access-control-allow-origin'), null)
r = await call('', { method: 'OPTIONS', headers: { origin: 'https://evil.example' } })
assert.equal(r.status, 403)
r = await call('', { method: 'OPTIONS', headers: { origin: 'https://hongdam.net' } })
assert.equal(r.status, 204)
assert.equal(r.headers.get('access-control-allow-origin'), 'https://hongdam.net')
r = await call('', { method: 'OPTIONS', headers: { origin: 'http://localhost:8788' } })
assert.equal(r.status, 204)
assert.equal(rows().length, 0)

// PHP older than 7.4 on Upgrade: a LINE answer, no row
r = await post({ ...ok, kind: 'upgrade', php: '5.6.40' })
let j = await r.json()
assert.equal(j.ok, false); assert.equal(j.quote, true)
assert.match(j.error, /^PHP older than 7\.4 gets a price after a look\. Message us on LINE @964yxgnk\. · /)
assert.equal(rows().length, 0)
r = await post({ ...ok, kind: 'upgrade', php: '7.3' }); assert.equal((await r.json()).quote, true)
assert.equal(rows().length, 0)

// Errors
r = await post({ ...ok, site: '10.0.0.5' }); assert.match((await r.json()).error, /^One website address or server name, for example example\.com; put others in the note\./)
r = await post({ ...ok, owner: false }); assert.match((await r.json()).error, /I own this site or server, or its owner has said I may change it/)

// A booking: charged the related price, no IP stored, Bangkok date, contact and note in code spans, no pings
sent.length = 0
r = await post({ ...ok, kind: 'upgrade', php: '8.1', note: '@everyone ```boom``` <@&123>' })
j = await r.json()
assert.equal(j.ok, true)
assert.equal(r.headers.get('access-control-allow-origin'), null)
let row = rows()[0]
assert.equal(row.ip, null)
assert.equal(row.state, 'booked')
const quote = pricesFrom({ hosted: {}, server: {}, upgrade: {}, fleet: {} }, Date.now()).find((x) => x.id === 'upgrade')
assert.equal(j.baht, Math.max(quote.own, pricesFrom(quiet, Date.now()).find((x) => x.id === 'server').baht))
assert.equal(j.usd, usd(j.baht))
assert.ok(j.pay.paypal.endsWith(`/${usd(j.baht)}USD`))
const hook = sent.filter((x) => x.url.startsWith('https://discord.example'))
assert.ok(hook.length >= 1)
const body = JSON.parse(hook[0].body)
assert.deepEqual(body.allowed_mentions, { parse: [] })
assert.match(body.content, /Contact: `me@example\.com`/)
assert.match(body.content, /Note: `@everyone boom <@&123>`/)
assert.ok(!body.content.includes('```'))
assert.match(body.content, new RegExp(`Slot from ${new Date(Math.max(Date.now(), weekStart(row.week)) + 7 * 3600e3).toISOString().slice(0, 10)}`))

// tell(): both webhook bodies carry allowed_mentions
sent.length = 0
globalThis.fetch = async (url, init) => { sent.push(JSON.parse(init.body)); return new Response('{}', { status: sent.length === 1 ? 400 : 200 }) }
await tell({ DISCORD_TASKS: 'https://discord.example/hook' }, 'T', ['@everyone'])
assert.equal(sent.length, 2)
assert.ok(sent.every((x) => x.allowed_mentions?.parse?.length === 0))
globalThis.fetch = async (url, init) => { sent.push({ url: String(url), body: init?.body }); return new Response('{}') }

// Unpaid bookings count for 48 hours; paid ones always. Fleet has one slot.
raw.exec('DELETE FROM php_order')
const wNow = weekOf(Date.now())
const put = (ref, state, ago) => raw.prepare('INSERT INTO php_order (ref, kind, site, contact, baht, usd, week, state, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
  .run(ref, 'fleet', 'a.example.com', 'x@example.com', 20000, 605, wNow, state, new Date(Date.now() - ago).toISOString())
put('PHP-OLD', 'booked', 3 * 86400e3)
put('PHP-VOID', 'void', 1000)
g = await (await call('')).json()
assert.equal(g.kinds.find((k) => k.id === 'fleet').booked, 0, 'an old unpaid booking and a void one do not hold the slot')
put('PHP-NEW', 'booked', 3600e3)
g = await (await call('')).json()
assert.equal(g.kinds.find((k) => k.id === 'fleet').booked, 1)
assert.notEqual(g.kinds.find((k) => k.id === 'fleet').next_slot, today, 'full this week')
raw.exec("DELETE FROM php_order WHERE ref = 'PHP-NEW'")
put('PHP-PAID', 'paid', 9 * 86400e3)
g = await (await call('')).json()
assert.equal(g.kinds.find((k) => k.id === 'fleet').booked, 1, 'paid counts at any age')

// A ref that collides is tried again; three failures give JSON
raw.exec('DELETE FROM php_order')
fail = 2
r = await post(ok); assert.equal((await r.json()).ok, true)
fail = 3
r = await post(ok); assert.equal(r.status, 500); assert.equal((await r.json()).ok, false)
assert.equal(rows().length, 1)

// Slips: only a booked order takes one
raw.exec('DELETE FROM php_order')
put('PHP-VOID', 'void', 1000)
const slipPost = (ref) => { const fd = new FormData(); fd.append('ref', ref); fd.append('slip', new Blob(['x'], { type: 'image/jpeg' }), 's.jpg'); return call('/slip', { method: 'POST', body: fd }) }
assert.deepEqual(await (await slipPost('PHP-VOID')).json(), { ok: false, why: 'state' })
assert.equal((await (await slipPost('PHP-NOPE')).json()).why, 'ref')
assert.equal(raw.prepare("SELECT state FROM php_order WHERE ref = 'PHP-VOID'").get().state, 'void')
put('PHP-PAID', 'paid', 1000)
assert.equal((await (await slipPost('PHP-PAID')).json()).ok, true)
put('PHP-BOOK', 'booked', 1000)
assert.equal((await (await slipPost('PHP-BOOK')).json()).why, 'off') // no SlipOK key here: the check is off, the order stays booked
assert.equal(raw.prepare("SELECT state FROM php_order WHERE ref = 'PHP-BOOK'").get().state, 'booked')

globalThis.fetch = real
console.log('ok')

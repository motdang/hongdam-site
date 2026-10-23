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
// her prices on the walk (2026-10-24): the walk's number when it has one in the option's currency, else the set number
const wk = { ...walked, 'lang-new': { price: 2000, cur: 'THB', tail: 600 }, 'lang-stamp': { price: 150, cur: 'THB' },
  'reading-en': { price: 129, cur: 'USD' }, 'ai-own': { price: 30000, cur: 'THB', tail: 30000, tail_cur: 'USD' }, 'date-en': 59 }
assert.equal(quote('translate', 'lang-new', 8, true, wk).total, 2000 + 3 * 600 + 8 * 150)
assert.equal(quote('reading', 'reading-en', 1, false, wk).total, 129)
assert.equal(quote('ai-own', 'ai-own', 1, false, wk).total, 30000)
assert.deepEqual([quote('ai-own', 'ai-own-usd', 1, false, wk).total, quote('ai-own', 'ai-own-usd', 1, false, wk).cur], [30000, 'USD'])
// a walked number in baht never prices a US$ option; no walk at all keeps the set numbers
assert.equal(quote('date-pick', 'date-en', 1, false, wk).total, 59)
assert.equal(quote('date-pick', 'date-en', 1, false, { 'date-en': { price: 1500, cur: 'THB' } }).total, 59)
assert.equal(quote('translate', 'lang-new', 8, true, {}).total, 3800)
// a tail in baht is never read as US$ (CodeRabbit on #52)
assert.equal(quote('ai-own', 'ai-own-usd', 1, false, { 'ai-own': { price: 30000, cur: 'THB', tail: 30000 } }).total, 25000)
assert.equal(quote('translate', 'lang-new', 8, false, { 'lang-new': { price: 2000, cur: 'THB', tail: 9, tail_cur: 'USD' } }).total, 2000 + 3 * 500)
assert.equal(CARDS['ai-own'].opts[1].price.w, 'ai-own'); assert.equal(CARDS['ai-own'].opts[1].price.part, 'tail')
// every buy card has options with a price rule
for (const [id, c] of Object.entries(CARDS)) if (c.act === 'buy') assert.ok(c.opts.length && c.opts.every((o) => o.price), id)

// the endpoint, with a stand-in database
const rows = []
const tries = new Map()
const db = { batch: async (list) => list.map((st) => { const k = st.a.join('|'), n = (tries.get(k) || 0) + 1; tries.set(k, n); return { results: [{ n }] } }),
  prepare: (sql) => ({ bind: (...a) => ({ sql, a, run: async () => { if (sql.startsWith('INSERT INTO svc_buy')) rows.push(a); return { meta: { changes: 1 } } },
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
// the tracker: card, option and state, never the contact
r = await (await onRequest(ctx('GET', [rows[0][0]]))).json()
assert.equal(r.ok, true); assert.equal(r.card, 'call'); assert.equal(r.contact, undefined)
assert.equal((await onRequest(ctx('GET', ['nope']))).status, 404)
// moving an order on needs the team's key
env.TASKS_ADMIN = 'k'
assert.equal((await onRequest(ctx('POST', ['state'], { ref: rows[0][0], state: 'done' }))).status, 401)
const team = (body) => ({ ...ctx('POST', ['state'], body), request: new Request('https://hongdam.net/api/buy/state', { method: 'POST', headers: { authorization: 'Bearer k', 'content-type': 'application/json' }, body: JSON.stringify(body) }) })
r = await (await onRequest(team({ ref: rows[0][0], state: 'started' }))).json()
assert.equal(r.state, 'started')
r = await (await onRequest(team({ ref: rows[0][0], state: 'sideways' }))).json()
assert.equal(r.why, 'body')
// haggling by the hour (her word 2026-10-24): its own count, only on the options that take it
assert.equal(quote('vehicle', 'car-buy', 1, 3, { 'car-buy': 8000, dispute: 800 }).total, 8000 + 3 * 800)
assert.equal(quote('vehicle', 'moto-buy', 1, true, { 'moto-buy': 4000, dispute: 1000 }).total, 5000)
assert.equal(quote('vehicle', 'car-buy', 1, 99, { 'car-buy': 8000, dispute: 800 }).addon, CARDS.vehicle.add.max)
assert.equal(quote('amulet', 'amulet-buy', 1, 2, { 'amulet-buy': 1000, dispute: 800 }).total, 2600)
assert.equal(quote('amulet', 'amulet-check', 2, 2, { 'amulet-check': 500, dispute: 800 }).total, 1000)
assert.equal(quote('dispute', 'dispute', 3, false, { dispute: 800 }).total, 2400)
// the stamp is still per page
assert.equal(quote('translate', 'lang-new', 8, true, walked).addon, 8)

// her ฿2,000 plans (her word 2026-10-24, "Send them to me"): a mail to her alone, nothing in #help-desk
const calls = [], realFetch = globalThis.fetch
globalThis.fetch = async (u, o) => { calls.push([String(u), o && o.body]); return new Response('{}') }
const penv = { TASKS: db, DISCORD_TASKS: 'https://discord.test/hook', RESEND_API_KEY: 'x', ORDER_TO: 'desk@example.com' }
const pend = []
const pr = await (await onRequest({ env: penv, params: {}, waitUntil: (p) => pend.push(p),
  request: new Request('https://hongdam.net/api/buy', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://hongdam.net' }, body: JSON.stringify({ card: 'thai-plan', opt: 'thai-plan', contact: 'a@b.co' }) }) })).json()
await Promise.all(pend)
assert.equal(pr.ok, true)
assert.equal(calls.filter(([u]) => u.includes('discord')).length, 0)
const sent = calls.filter(([u]) => u.includes('resend'))
assert.equal(sent.length, 1); assert.deepEqual(JSON.parse(sent[0][1]).to, ['nan@motdang.net'])
// another card still posts in #help-desk and mails the desk
calls.length = 0
await (await onRequest({ env: penv, params: {}, waitUntil: (p) => pend.push(p),
  request: new Request('https://hongdam.net/api/buy', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://hongdam.net' }, body: JSON.stringify({ card: 'trades', opt: 'trades', contact: 'a@b.co' }) }) })).json()
await Promise.all(pend)
assert.equal(calls.filter(([u]) => u.includes('discord')).length, 1)
assert.deepEqual(JSON.parse(calls.find(([u]) => u.includes('resend'))[1]).to, ['desk@example.com'])
// slips and claims: five tries a day for one order, then 429 (CodeRabbit on #51)
const slipTry = () => onRequest({ env: { TASKS: db }, params: { path: ['slip'] }, waitUntil: () => {},
  request: new Request('https://hongdam.net/api/buy/slip', { method: 'POST', headers: { origin: 'https://hongdam.net' }, body: (() => { const f = new FormData(); f.set('ref', 'HD-TRY000'); return f })() }) })
for (let i = 0; i < 5; i++) assert.notEqual((await slipTry()).status, 429)
assert.equal((await slipTry()).status, 429); assert.equal((await (await slipTry()).json()).why, 'tries')
// no tries table, or D1 down: refused before SlipOK is asked
const noTries = { prepare: () => ({ bind: () => ({}) }), batch: async () => { throw new Error('no such table: tries') } }
assert.equal((await onRequest({ env: { TASKS: noTries }, params: { path: ['claim'] }, waitUntil: () => {},
  request: new Request('https://hongdam.net/api/buy/claim', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://hongdam.net' }, body: JSON.stringify({ ref: 'HD-TRY001', how: 'wise' }) }) })).status, 429)
// a payment marked by the team counts as paid demand, under the order's own who
const ins = []
const db2 = { prepare: (sql) => ({ bind: (...a) => ({ run: async () => { ins.push([sql, a]); return { meta: { changes: 1 } } },
  first: async () => ({ ref: 'HD-PAID00', card: 'vehicle', opt: 'car-buy', qty: 1, addon: 2, total: 9600, due: 9600, cur: 'THB', contact: 'line:abc', state: 'claimed' }) }) }) }
const wait = []
await onRequest({ env: { TASKS: db2, TASKS_ADMIN: 'k' }, params: { path: ['state'] }, waitUntil: (p) => wait.push(p),
  request: new Request('https://hongdam.net/api/buy/state', { method: 'POST', headers: { authorization: 'Bearer k', 'content-type': 'application/json' }, body: JSON.stringify({ ref: 'HD-PAID00', state: 'paid' }) }) })
await Promise.all(wait)
const paid = ins.filter(([q, a]) => q.startsWith('INSERT INTO svc_order') && a[3] === 'paid').map(([, a]) => a[0]).sort()
assert.deepEqual(paid, ['car-buy', 'dispute'])
globalThis.fetch = realFetch
console.log('buy ok')

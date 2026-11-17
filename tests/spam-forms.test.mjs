// Spam on the order and rating forms: a spam order is stored void and reaches no one (no #help-desk, wheel or mail);
// a plain one goes through as before. Black Swan refuses links itself (functions/_swan.js readNew).
//   node --experimental-sqlite tests/spam-forms.test.mjs
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, readdirSync } from 'node:fs'
import assert from 'node:assert'
import { onRequest as bots } from '../functions/api/bots/[[path]].js'
import { onRequest as github } from '../functions/api/github/[[path]].js'
import { onRequest as php } from '../functions/api/php/[[path]].js'
import { onRequest as buy } from '../functions/api/buy/[[path]].js'
import { onRequestPost as rate } from '../functions/api/rate.js'

const dir = new URL('../migrations/', import.meta.url)
const raw = new DatabaseSync(':memory:')
for (const f of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) raw.exec(readFileSync(new URL(f, dir), 'utf8'))
const stmt = (sql, args = []) => ({
  sql, a: args,
  bind: (...a) => stmt(sql, a),
  all: async () => ({ results: raw.prepare(sql).all(...args) }),
  first: async () => raw.prepare(sql).get(...args) ?? null,
  run: async () => { const r = raw.prepare(sql).run(...args); return { meta: { last_row_id: Number(r.lastInsertRowid), changes: r.changes } } },
})
const db = { prepare: (sql) => stmt(sql), batch: async (list) => Promise.all(list.map((s) => raw.prepare(s.sql).all(...s.a))).then((rs) => rs.map((results) => ({ results }))) }

const out = []
globalThis.fetch = async (url) => { out.push(String(url)); return new Response('{}') }
const env = { TASKS: db, DISCORD_TASKS: 'https://discord.test/hook', RESEND_API_KEY: 'k', ORDER_TO: 'orders@example.com' }
const send = async (fn, path, body, base) => {
  const waits = []
  const request = new Request(`https://hongdam.net/api/${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://hongdam.net', 'cf-connecting-ip': '1.2.3.' + (out.length % 250) }, body: JSON.stringify(body) })
  const res = await fn({ request, env, params: { path: path.split('/').filter(Boolean) }, waitUntil: (p) => waits.push(p) })
  await Promise.all(waits)
  return res.json()
}
const spamNote = '<a href="https://jackbit-casino-online.com/bonus/">bonus</a>'
const told = () => out.filter((u) => u.startsWith('https://discord.test') || u.includes('resend')).length
const state = (table, ref) => raw.prepare(`SELECT state FROM ${table} WHERE ref = ?`).get(ref).state

const cases = [
  ['bots', bots, 'bot_order', { kind: 'scout', site: 'example.com', contact: 'me@example.com' }, 'bought'],
  ['github', github, 'gh_order', { kind: Object.keys(await import('../functions/_github.js').then((m) => m.KINDS))[0], login: 'octocat', contact: 'me@example.com' }, 'booked'],
  ['php', php, 'php_order', { kind: 'server', site: 'example.com', contact: 'me@example.com', owner: true }, 'booked'],
  ['buy', buy, 'svc_buy', { card: 'call', opt: 'call', qty: 1, contact: 'line:abc', lang: 'en' }, 'booked'],
]
for (const [base, fn, table, ok, open] of cases) {
  let n = told()
  let r = await send(fn, '', ok, base)
  assert.equal(r.ok, true, base); assert.equal(state(table, r.ref), open, base); assert.ok(told() > n, `${base}: a plain order is told`)
  n = told()
  r = await send(fn, '', { ...ok, note: spamNote }, base)
  assert.equal(r.ok, true, base); assert.equal(state(table, r.ref), 'void', base); assert.equal(told(), n, `${base}: spam is told to no one`)
}

let n = told()
assert.equal((await send(rate, '', { page: '/my/', lang: 'my', score: 'better', text: 'should be ข' }, 'rate')).ok, true)
assert.equal(told(), n + 1)
assert.equal((await send(rate, '', { page: '/my/', lang: 'my', score: 'better', text: spamNote }, 'rate')).ok, true)
assert.equal(told(), n + 1, 'rate: spam is stored, told to no one')
assert.equal(raw.prepare('SELECT COUNT(*) n FROM svc_rate').get().n, 2)

console.log('spam forms ok')

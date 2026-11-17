// Spam on the task board: the three posts of 2026-11-17 are caught and told to no one; seeded tasks pass;
// a post Llama Guard catches reaches #help-desk without its links.
//   node --experimental-sqlite tests/spam.test.mjs
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import assert from 'node:assert'
import { spamWhy, defang } from '../functions/_spam.js'
import { createTask, createAnswer } from '../functions/_tasks.js'

const root = new URL('../', import.meta.url)
const raw = new DatabaseSync(':memory:')
raw.exec(readFileSync(new URL('migrations/0001_tasks.sql', root), 'utf8'))
raw.exec(readFileSync(new URL('data/tasks/seed.sql', root), 'utf8'))

// the three, as they arrived
const seen = [
  { title: 'Hi there! рџ\u0098Љ', what: 'http://kokoso.online/pharmcash/5.txt', name: 'PeavaSix', catNew: 'PeavaSix', known: true },
  { title: 'Responsible gaming serves as a rewarding habit toward betting that emphasizes confidence.', what: 'Safe gambling serves as a rewarding framework to sports betting which focuses on control. \n<a href="https://jackbit-casino-online.com/bonus/">jackbit-casino-online.com</a>', name: 'jackbit-casino-online.com', catNew: 'jackbit-casino-online.com', known: true },
  { title: "Hey there, hope you're having a wonderful day!", what: '<a href="https://darkstore.bz/product/vkcom-avtoreg?p=78104">VK.com ? Авторег</a>', name: 'PeavaSix', catNew: 'PeavaSix', known: true },
]
for (const s of seen) assert.ok(spamWhy(s), s.title)
// the same bots with the words and markup gone: the hidden box gives them away
assert.equal(spamWhy({ title: 'Hi there!', what: 'http://example.online/5.txt', name: 'PeavaSix', catNew: 'PeavaSix', known: true }), 'hidden box filled')
// a person who picks "Something else" and names the kind
assert.equal(spamWhy({ title: 'Fix my scooter seat', what: 'Torn seat, Nimman', name: 'Ploy', catNew: 'Upholstery', known: false }), '')

const rows = raw.prepare('SELECT id, title, what, poster, cat_new FROM task').all()
assert.ok(rows.length > 30)
for (const t of rows) assert.equal(spamWhy({ title: t.title, what: t.what || '', name: t.poster || '', catNew: t.cat_new || '', known: true }), '', `seed #${t.id} ${t.title}`)

assert.equal(defang('see <a href="https://darkstore.bz/x?p=1">VK</a> and www.casino.example/a'), 'see `darkstore.bz` VK and `www.casino.example`')

// through createTask and createAnswer, with D1, the rate limit, Llama Guard and the webhook stood in for
const stmt = (sql, args = []) => ({
  bind: (...a) => stmt(sql, a),
  all: async () => ({ results: raw.prepare(sql).all(...args) }),
  first: async () => raw.prepare(sql).get(...args) ?? null,
  run: async () => { const r = raw.prepare(sql).run(...args); return { meta: { last_row_id: Number(r.lastInsertRowid), changes: r.changes } } },
})
const sent = []
globalThis.fetch = async (url, init) => { sent.push(JSON.parse(init.body)); return new Response('', { status: 204 }) }
let guard = 'safe'
const env = { TASKS: { prepare: (sql) => stmt(sql) }, DISCORD_TASKS: 'https://discord.test/hook', AI: { run: async () => ({ response: guard }) } }
const ctx = () => { const w = []; return { env, waitUntil: (p) => w.push(p), done: () => Promise.all(w), request: new Request('https://hongdam.net/api/tasks', { method: 'POST', headers: { 'cf-connecting-ip': '1.2.3.4' } }) } }
const post = async (b) => { const c = ctx(); const r = await createTask(c, b); await c.done(); return r }

let r = await post({ title: seen[2].title, what: seen[2].what, cat: 'imp-floods', cat_new: 'PeavaSix', name: 'PeavaSix', contact: 'x@gmail.com', shoup: 'on' })
assert.equal(r.status, 201); assert.equal(r.held, true); assert.equal(sent.length, 0, 'spam is told to no one')
assert.equal(raw.prepare('SELECT state FROM task WHERE id = ?').get(r.id).state, 'held')

guard = 'unsafe\nS2'
r = await post({ title: 'Odd request', what: 'details at https://odd.example/page', cat: 'imp-floods', contact: 'odd@example.com' })
assert.equal(r.held, true); assert.equal(sent.length, 1)
assert.equal(sent[0].flags, 4); assert.ok(!/https?:/.test(sent[0].content), sent[0].content); assert.ok(sent[0].content.includes('`odd.example`'))
assert.ok(!sent[0].thread_name.includes('Odd request'))

guard = 'safe'
r = await post({ title: 'Translate a lease into Thai', what: 'Two pages, https://example.com/lease.pdf', cat: 'imp-floods', contact: 'line: ploy' })
assert.equal(r.held, false); assert.equal(sent.length, 2); assert.equal(sent[1].flags, 4); assert.ok(sent[1].content.includes('https://example.com/lease.pdf'))

const floods = raw.prepare("SELECT id FROM task WHERE cat = 'imp-floods' AND src = 'ours'").get().id
const c = ctx(); const a = await createAnswer(c, floods, { name: 'PeavaSix', note: '<a href="https://jackbit-casino-online.com/">bonus</a>', contact: 'x@gmail.com' }); await c.done()
assert.equal(a.held, true); assert.equal(sent.length, 2, 'spam answer told to no one')

console.log('spam ok')

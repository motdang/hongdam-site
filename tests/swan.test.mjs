// Black Swan predictions: functions/_swan.js, functions/api/swan/[[path]].js and functions/swan/[id].js against a
// real SQLite database (node:sqlite) holding migrations 0010 and 0012, with a small D1-shaped wrapper.
//   node tests/swan.test.mjs
import assert from 'node:assert'
import fs from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { onRequestGet, onRequestPost, net } from '../functions/api/swan/[[path]].js'
import { onRequestGet as page } from '../functions/swan/[id].js'
import { readNew, needsLook, hasLink, dueFrom, phaseOf, card, oddsWord, newId, ID_RE } from '../functions/_swan.js'

// ── helpers ─────────────────────────────────────────────────────────────────
assert.equal(readNew({ text: 'ab', odds: 1, size: 1, years: 1 }).why, 'short')
assert.equal(readNew({ text: '清莱下雪', odds: 1, size: 1, years: 1 }).ok, true)          // four characters is enough
assert.equal(readNew({ text: 'see www.spam.example now', odds: 1, size: 1, years: 1 }).why, 'link')
assert.equal(readNew({ text: 'buy at spam.com today', odds: 1, size: 1, years: 1 }).why, 'link')
assert.equal(readNew({ text: 'Snow in Chiang Rai', odds: 5, size: 1, years: 1 }).why, 'odds')
assert.equal(readNew({ text: 'Snow in Chiang Rai', odds: 1, size: 4, years: 1 }).why, 'size')
assert.equal(readNew({ text: 'Snow in Chiang Rai', odds: 1, size: 1, years: 3 }).why, 'years')
assert.equal(readNew({ text: 'x'.repeat(201), odds: 1, size: 1, years: 1 }).why, 'long')
const ok = readNew({ text: '  Snow\n in   Chiang Rai ', odds: 3, size: 2, years: 5, name: 'Ann https://x.co', lang: 'th' }, new Date('2026-10-24T12:00:00Z'))
assert.deepEqual(ok.row, { text: 'Snow in Chiang Rai', lang: 'th', due: '2031-10', odds: 3, size: 2, name: null })
assert.equal(dueFrom(1, new Date('2026-12-31T23:00:00Z')), '2027-12')
assert.ok(needsLook('The king abdicates') && needsLook('ในหลวงเสด็จ') && needsLook('泰王') && needsLook('Der König geht'))
assert.ok(!needsLook('Snow falls in Chiang Rai') && !needsLook('Making things'))
assert.ok(hasLink('@spammer_account') && !hasLink('Bitcoin hits 1,000,000'))
assert.equal(phaseOf('2026-10', Date.parse('2026-10-24T12:00:00Z')), 'r')
assert.equal(phaseOf('2026-11', Date.parse('2026-10-24T12:00:00Z')), 'p')
assert.equal(oddsWord(4, 'de'), '1 zu 10’000')
assert.equal(oddsWord(3, 'th'), '1 ใน 1,000')
assert.ok(ID_RE.test(newId()))
const c = card({ state: 'ok', text: 'Snow in Chiang Rai', odds: 3, size: 3, due: '2031-10' }, 'en', Date.parse('2026-10-24T00:00:00Z'))
assert.equal(c.title, '“Snow in Chiang Rai”')
assert.match(c.desc, /^1 in 1,000 · the world · check Oct 2031\. Will it happen\? Vote\./)
assert.equal(c.img, 'og/swan/o3.jpg')
assert.equal(card({ state: 'wait' }, 'th').img, 'og/swan/o4.jpg')

// ── a D1-shaped wrapper over SQLite ─────────────────────────────────────────
const sq = new DatabaseSync(':memory:')
for (const m of ['0010_tries', '0012_swan']) sq.exec(fs.readFileSync(new URL(`../migrations/${m}.sql`, import.meta.url), 'utf8'))
const norm = (v) => (v === undefined ? null : v)
function prep(sql) {
  const s = { sql, args: [] }
  s.bind = (...a) => ({ ...s, args: a.map(norm), bind: s.bind, run: s.run, first: s.first, all: s.all })
  s.run = async function () { const st = sq.prepare(this.sql); if (/RETURNING/i.test(this.sql)) return { results: st.all(...this.args), meta: {} }; const r = st.run(...this.args); return { meta: { changes: Number(r.changes) } } }
  s.first = async function () { return sq.prepare(this.sql).get(...this.args) || null }
  s.all = async function () { return { results: sq.prepare(this.sql).all(...this.args) } }
  return s
}
const db = { prepare: prep, batch: async (sts) => { const out = []; for (const st of sts) out.push(/^\s*(SELECT|INSERT[\s\S]*RETURNING)/i.test(st.sql) ? { results: (await st.all()).results } : await st.run()); return out } }
const told = []
const env = { TASKS: db, TASKS_ADMIN: 'adm', ASSETS: { fetch: async (u) => new Response(String(u).includes('one') ? '<title>%%SW_TITLE%%</title><meta content="%%SW_DESC%%"><link href="%%SW_URL%%"><meta content="%%SW_IMG%%">%%SW_NOINDEX%%<h1>%%SW_H1%%</h1><script>%%SW_DATA%%</script>' : 'not found', { status: String(u).includes('one') ? 200 : 404 }) } }
let ip = '1.1.1.1'
const req = (path, body, origin = 'https://hongdam.net', headers = {}) => new Request('https://hongdam.net/api/swan' + path, body === undefined ? { headers } : {
  method: 'POST', headers: { 'content-type': 'application/json', origin, 'cf-connecting-ip': ip, ...headers }, body: JSON.stringify(body) })
const post = async (path, body, extra = {}) => {
  const r = await onRequestPost({ env, waitUntil: (p) => told.push(p), params: { path: path.split('/').filter(Boolean) }, request: req(path, body, extra.origin, extra.headers) })
  return { status: r.status, j: await r.json() }
}
const get = async (path) => {
  const [p, q] = path.split('?')
  const r = await onRequestGet({ env, params: { path: p.split('/').filter(Boolean) }, request: req(path) })
  return { status: r.status, j: await r.json(), q }
}

// save
let r = await post('', { text: 'Snow falls in Chiang Rai', odds: 3, size: 2, years: 5, name: 'Nok', lang: 'en' })
assert.equal(r.status, 200); assert.equal(r.j.state, 'ok'); assert.ok(ID_RE.test(r.j.id)); assert.ok(r.j.key.length > 20)
const a = r.j
assert.equal((await post('', { text: 'hi', odds: 3, size: 2, years: 5 })).j.why, 'short')
assert.equal((await post('', { text: 'Snow falls', odds: 3, size: 2, years: 5 }, { origin: 'https://evil.example' })).status, 403)
// a prediction naming the royal family waits, and the team hears of it
r = await post('', { text: 'The king does something', odds: 1, size: 2, years: 1 })
assert.equal(r.j.state, 'wait'); assert.equal(told.length, 1)
const held = r.j
// list: only listed ones, newest first; waiting ones carry no words
let g = await get('?sort=new')
assert.equal(g.j.n, 1); assert.equal(g.j.swans[0].text, 'Snow falls in Chiang Rai')
g = await get(`?ids=${a.id},${held.id}`)
assert.equal(g.j.swans.length, 2); assert.equal(g.j.swans.find((s) => s.id === held.id).text, undefined)
// vote: one per address, a new vote replaces the old
r = await post(`/${a.id}/vote`, { v: 'y' }); assert.deepEqual([r.j.ph, r.j.votes.yes, r.j.votes.no], ['p', 1, 0])
r = await post(`/${a.id}/vote`, { v: 'n' }); assert.deepEqual([r.j.votes.yes, r.j.votes.no], [0, 1])
ip = '2.2.2.2'; r = await post(`/${a.id}/vote`, { v: 'y' }); assert.deepEqual([r.j.votes.yes, r.j.votes.no], [1, 1])
assert.equal((await post(`/${held.id}/vote`, { v: 'y' })).status, 409)
// three reports from three addresses take it off the list
for (const x of ['3.3.3.3', '4.4.4.4', '4.4.4.4', '5.5.5.5']) { ip = x; await post(`/${a.id}/report`, {}) }
g = await get('?sort=new'); assert.equal(g.j.n, 0)
// the team lists it again
assert.equal((await post(`/${a.id}/state`, { state: 'ok' })).status, 401)
assert.equal((await post(`/${a.id}/state`, { state: 'ok' }, { headers: { authorization: 'Bearer adm' } })).j.ok, true)
g = await get('?sort=top'); assert.equal(g.j.swans[0].yes, 1)
// one prediction's page and link card
let pg = await page({ env, params: { id: a.id }, request: new Request('https://hongdam.net/swan/' + a.id) })
let html = await pg.text()
assert.match(html, /<title>“Snow falls in Chiang Rai”<\/title>/)
assert.match(html, new RegExp(`https://hongdam.net/swan/${a.id}`))
assert.match(html, /og\/swan\/o3\.jpg/)
assert.ok(!html.includes('noindex'))
pg = await page({ env, params: { id: held.id }, request: new Request('https://hongdam.net/swan/' + held.id) })
html = await pg.text()
assert.ok(!html.includes('The king') && html.includes('noindex'))
assert.equal((await page({ env, params: { id: 'zzzzzz' }, request: new Request('https://hongdam.net/swan/zzzzzz') })).status, 404)
// listed again, its old reports are gone: one new report does not hide it
assert.equal(sq.prepare('SELECT COUNT(*) AS n FROM swan_report WHERE id = ?').get(a.id).n, 0)
ip = '8.8.8.8'; await post(`/${a.id}/report`, {})
assert.equal((await get('?sort=new')).j.n, 1)
// words that look like a mark or a replacement pattern stay as written
ip = '9.9.9.9'
r = await post('', { text: 'Gold $& silver %%SW_DATA%% and $1', odds: 2, size: 1, years: 1 })
pg = await page({ env, params: { id: r.j.id }, request: new Request('https://hongdam.net/swan/' + r.j.id) })
html = await pg.text()
assert.match(html, /<h1>“Gold \$&amp; silver %%SW_DATA%% and \$1”<\/h1>/)
assert.equal((html.match(/<script>/g) || []).length, 1)
// a refused address does not use up the site's count
ip = '10.10.10.10'
for (let i = 0; i < 8; i++) await post('', { text: 'Spam number ' + i, odds: 0, size: 0, years: 1 })
assert.equal(sq.prepare("SELECT n FROM tries WHERE k = 'swan:new:all'").get().n, 1 + 1 + 1 + 6)   // saved: the first, the held one, the $& one, six of eight
// a null body is a bad request, not a database fault
const nul = await onRequestPost({ env, waitUntil: () => {}, params: { path: ['poll'] }, request: new Request('https://hongdam.net/api/swan/poll', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://hongdam.net' }, body: 'null' }) })
assert.equal(nul.status, 400)
// IPv6 counts by /64; reports from one /64 count once
assert.equal(net('2001:db8:aa:bb:1:2:3:4'), '2001:0db8:00aa:00bb::/64')
assert.equal(net('2001:db8::1'), '2001:0db8:0000:0000::/64')
assert.equal(net('1.2.3.4'), '1.2.3.4')
// the maker deletes it with their key; a wrong key does nothing
assert.equal((await post(`/${a.id}/delete`, { key: 'nope' })).status, 403)
assert.equal((await post(`/${a.id}/delete`, { key: a.key })).j.ok, true)
assert.equal((await get('/' + a.id)).status, 404)
assert.equal(sq.prepare('SELECT COUNT(*) AS n FROM swan_vote WHERE id = ?').get(a.id).n, 0)
// black swan or not?
ip = '6.6.6.6'
r = await post('/poll', { q: 'covid20', v: 'n' }); assert.deepEqual(r.j.poll, { y: 0, n: 1 })
r = await post('/poll', { q: 'covid20', v: 'y' }); assert.deepEqual(r.j.poll, { y: 1, n: 0 })
assert.equal((await post('/poll', { q: 'nope', v: 'y' })).status, 400)
g = await get('/poll'); assert.deepEqual(g.j.poll.covid20, { y: 1, n: 0 }); assert.deepEqual(g.j.poll.baht97, { y: 0, n: 0 })
// six new predictions a day from one address
ip = '7.7.7.7'
const codes = []
for (let i = 0; i < 7; i++) codes.push((await post('', { text: 'Prediction number ' + i, odds: 0, size: 0, years: 1 })).status)
assert.deepEqual(codes, [200, 200, 200, 200, 200, 200, 429])
console.log('swan ok')

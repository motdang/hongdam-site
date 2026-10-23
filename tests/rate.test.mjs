import assert from 'node:assert'
import { onRequestPost, onRequestGet } from '../functions/api/rate.js'

const rows = []
const db = { prepare: (sql) => ({ bind: (...a) => ({ run: async () => { rows.push([sql, a]); return { meta: { changes: 1 } } } }), all: async () => ({ results: [{ lang: 'my', page: '/my/', good: 1, better: 1 }] }) }) }
const told = []
const env = { TASKS: db, TASKS_ADMIN: 'k' }
const post = (body, origin = 'https://hongdam.net') => onRequestPost({ env, waitUntil: (p) => told.push(p),
  request: new Request('https://hongdam.net/api/rate', { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(body) }) })

let r = await post({ page: '/my/care/', lang: 'my', score: 'good' })
assert.equal(r.status, 200); assert.equal(rows.length, 1); assert.equal(told.length, 0)
r = await post({ page: '/zh/buy/?c=translate', lang: 'zh', score: 'better', text: '  应该是“翻译” ' })
assert.equal(r.status, 200); assert.equal(rows[1][1][3], '应该是“翻译”'); assert.equal(told.length, 1)
assert.equal((await post({ page: 'x', lang: 'my', score: 'good' })).status, 400)
assert.equal((await post({ page: '/my/', lang: 'fr', score: 'good' })).status, 400)
assert.equal((await post({ page: '/my/', lang: 'my', score: 'meh' })).status, 400)
assert.equal((await post({ page: '/my/', lang: 'my', score: 'good' }, 'https://evil.example')).status, 403)
assert.equal((await onRequestGet({ env, request: new Request('https://hongdam.net/api/rate') })).status, 401)
const g = await (await onRequestGet({ env, request: new Request('https://hongdam.net/api/rate', { headers: { authorization: 'Bearer k' } }) })).json()
assert.equal(g.pages[0].lang, 'my')
console.log('rate ok')
// before migration 0009 reaches the database: the answer still reaches #help-desk
const broken = { TASKS: { prepare: () => ({ bind: () => ({ run: async () => { throw new Error('no such table: svc_rate') } }) }) } }
const late = []
const lr = await (await onRequestPost({ env: broken, waitUntil: (p) => late.push(p),
  request: new Request('https://hongdam.net/api/rate', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://hongdam.net' }, body: JSON.stringify({ page: '/my/', lang: 'my', score: 'good' }) }) })).json()
assert.deepEqual([lr.ok, lr.stored, late.length], [true, false, 1])
console.log('rate ok before 0009')

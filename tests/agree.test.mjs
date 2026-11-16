import assert from 'node:assert'
import { handle } from '../functions/api/agree.js'

// a D1 stand-in with one table, agree_sign
function fakeDb() {
  const rows = new Map()
  return {
    rows,
    prepare(sql) {
      return { bind: (...a) => ({
        first: async () => { const r = rows.get(a[0]); return r ? { name: r.name, title: r.title, at: r.at } : null },
        run: async () => {
          if (sql.startsWith('INSERT OR IGNORE')) {
            const [slug, name, title, at, sha, ip, country, ua] = a
            if (!rows.has(slug)) rows.set(slug, { name, title, at, sha, ip, country, ua })
          } else if (sql.startsWith('DELETE')) rows.delete(a[0])
        } }) }
    },
  }
}

const agreements = { 'ag-x': { title: 'Service agreement: X', signer: 'FERC', mail: ['beer@motdang.net', 'nan@motdang.net'], sha: 'abc', text: 'THE WORDS\n' } }
const db = fakeDb()
const env = { TASKS: db, RESEND_API_KEY: 'r', PAY_MAIL_FROM: 'pay@hongdam.net', TASKS_ADMIN: 'adm' }
const mails = []
const fetcher = async (url, init) => { mails.push([url, JSON.parse(init.body)]); return new Response('{}') }
let t = 0
const now = () => new Date(Date.UTC(2026, 10, 16, 7, 3, t++))
const get = (slug) => handle(new Request('https://hongdam.net/api/agree?slug=' + slug), env, { agreements }).then((r) => r.json())
const post = (fields) => {
  const fd = new FormData(); for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return handle(new Request('https://hongdam.net/api/agree', { method: 'POST', body: fd, headers: { 'cf-connecting-ip': '1.2.3.4' } }),
    env, { agreements, fetcher, now }).then((r) => r.json())
}

// unknown agreement, unsigned agreement
assert.equal((await get('nope')).why, 'ref')
assert.deepEqual(await get('ag-x'), { ok: true, signed: false })

// a signature needs a name and the tick
assert.equal((await post({ slug: 'ag-x', name: ' ', agree: 'yes' })).why, 'name')
assert.equal((await post({ slug: 'ag-x', name: 'Alberto Cosi' })).why, 'agree')
assert.equal((await post({ slug: 'nope', name: 'Alberto Cosi', agree: 'yes' })).why, 'ref')
assert.equal(mails.length, 0)

// the first signature is stored with the words' hash and mailed with the words
let r = await post({ slug: 'ag-x', name: 'Alberto  Cosi\n', title: 'Treasurer', agree: 'yes' })
assert.equal(r.signed, true); assert.equal(r.name, 'Alberto Cosi'); assert.equal(r.title, 'Treasurer')
assert.equal(db.rows.get('ag-x').sha, 'abc'); assert.equal(db.rows.get('ag-x').ip, '1.2.3.4')
assert.equal(mails.length, 1)
const [u, m] = mails[0]
assert.ok(u.includes('resend')); assert.deepEqual(m.to, ['beer@motdang.net', 'nan@motdang.net'])
assert.ok(m.subject.startsWith('Signed by FERC')); assert.ok(m.text.includes('THE WORDS')); assert.ok(m.text.includes('Alberto Cosi, Treasurer'))
assert.ok(m.text.includes('16 November 2026'))

// a second press shows the first signature and sends nothing
r = await post({ slug: 'ag-x', name: 'Somebody Else', agree: 'yes' })
assert.equal(r.again, true); assert.equal(r.name, 'Alberto Cosi'); assert.equal(mails.length, 1)
assert.equal((await get('ag-x')).name, 'Alberto Cosi')

// only the admin key undoes it
const del = (key) => handle(new Request('https://hongdam.net/api/agree?slug=ag-x', { method: 'DELETE', headers: key ? { authorization: 'Bearer ' + key } : {} }), env, { agreements }).then((x) => x.json())
assert.equal((await del('wrong')).why, 'key')
assert.equal((await get('ag-x')).signed, true)
assert.equal((await del('adm')).ok, true)
assert.equal((await get('ag-x')).signed, false)

console.log('agree: ok')

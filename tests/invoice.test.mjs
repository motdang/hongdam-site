import assert from 'node:assert'
import { handle } from '../functions/api/pay/invoice.js'

const invoices = { 'hd-x': { number: 'HD-X', baht: 9000, mail: 'beer@motdang.net' } }
const env = { SLIPOK_KEY: 'k', SLIPOK_BRANCH: 'b', RESEND_API_KEY: 'r', PAY_MAIL_TO: 'nan@motdang.net', PAY_MAIL_FROM: 'pay@hongdam.net' }
const calls = []
const slipok = (reply) => async (url, init) => {
  calls.push([url, init])
  if (url.includes('resend')) return new Response('{}')
  return new Response(JSON.stringify(reply))
}
const slip = () => new File([new Uint8Array(100)], 'slip.jpg', { type: 'image/jpeg' })
const post = (fields, fetcher) => {
  const fd = new FormData(); for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return handle(new Request('https://hongdam.net/api/pay/invoice', { method: 'POST', body: fd }), env, { fetcher, invoices }).then((r) => r.json())
}

// GET: on only for a known invoice
let g = await (await handle(new Request('https://hongdam.net/api/pay/invoice?slug=hd-x'), env, { invoices })).json()
assert.equal(g.on, true)
g = await (await handle(new Request('https://hongdam.net/api/pay/invoice?slug=nope'), env, { invoices })).json()
assert.equal(g.on, false)
g = await (await handle(new Request('https://hongdam.net/api/pay/invoice?slug=hd-x'), {}, { invoices })).json()
assert.equal(g.on, false)

// unknown invoice
assert.equal((await post({ slug: 'nope', slip: slip() }, slipok({}))).why, 'ref')

// SlipOK is asked for the invoice's own amount, not a browser's
let r = await post({ slug: 'hd-x', slip: slip(), amount: '1' }, slipok({ success: true, data: { success: true, transRef: 'T123456789', amount: 9000 } }))
assert.equal(r.ok, true); assert.equal(r.ref, 'HD-X')
const asked = calls.find(([u]) => u.includes('slipok'))[1].body
assert.equal(asked.get('amount'), '9000')
const mail = JSON.parse(calls.find(([u]) => u.includes('resend'))[1].body)
assert.deepEqual(mail.to, ['nan@motdang.net', 'beer@motdang.net'])

// a short payment is refused
calls.length = 0
r = await post({ slug: 'hd-x', slip: slip() }, slipok({ success: true, data: { success: true, transRef: 'T1', amount: 900 } }))
assert.equal(r.ok, false); assert.equal(calls.filter(([u]) => u.includes('resend')).length, 0)

// SlipOK's own refusals come through
r = await post({ slug: 'hd-x', slip: slip() }, slipok({ success: false, code: 1012 }))
assert.equal(r.why, 'used')
r = await post({ slug: 'hd-x', slip: slip() }, slipok({ success: false, code: 1014 }))
assert.equal(r.why, 'receiver')

console.log('invoice: ok')

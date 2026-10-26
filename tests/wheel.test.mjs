// functions/_wheel.js: each order or question as a Team Wheel ticket (NaN, 2026-10-26).
import test from 'node:test'
import assert from 'node:assert/strict'
import { toWheel, shopDraft, askDraft, payDraft, pageDraft, sizeOf, skillOf, trackUrl } from '../functions/_wheel.js'

const FIVE = ['title', 'goal', 'skill', 'size', 'done']

test('a shop order carries the five answers, its money and its order page', () => {
  const o = { ref: 'HD-ABC123', card: 'translate', opt: 'lang-new', qty: 7, addon: 1, contact: 'a@b.co', note: 'Birth certificate', lang: 'th' }
  const d = shopDraft(o, { cardName: 'Document translation', money: '฿3,200', link: trackUrl('https://hongdam.net', 'th', o.ref) })
  for (const k of FIVE) assert.ok(d[k], k)
  assert.equal(d.kind, 'buy'); assert.equal(d.pay, 'booked'); assert.equal(d.skill, 'content')
  assert.match(d.title, /^HD-ABC123 · Document translation$/)
  assert.match(d.body, /× 7 pages \+ Translator's stamp/); assert.match(d.body, /🌐 ไทย/)
  // the team's languages ride along: the wheel shows each person theirs
  assert.equal(d.words.card.th, 'แปลเอกสาร'); assert.equal(d.words.opt.my, 'ဘာသာပြန်အသစ်'); assert.ok(d.words.add.th)
  assert.ok(!/\{price\}/.test(JSON.stringify(d.words)), 'no price placeholders in names')
  assert.equal(d.link, 'https://hongdam.net/th/buy/?ref=HD-ABC123')
  assert.match(d.notes, /✉️ a@b\.co/)
  assert.ok(!d.body.includes('a@b.co'), 'the contact stays out of the first post')
  assert.ok(d.title.length <= 70)
})

test('a contact says what it is', async () => {
  const { contactLine } = await import('../functions/_wheel.js')
  assert.equal(contactLine('a@b.co'), '✉️ a@b.co'); assert.equal(contactLine('+66 81 234 5678'), '📞 +66 81 234 5678')
  assert.equal(contactLine('somchai_line'), '💬 LINE somchai_line'); assert.equal(contactLine('LINE ID: @shop'), '💬 LINE @shop')
})

test('sizes follow the main option hours; unknown cards are medium', () => {
  assert.equal(sizeOf('retire'), 'medium')     // 12 h
  assert.equal(sizeOf('crew'), 'large')      // 24 h
  assert.equal(sizeOf('lab-test'), 'small')      // 1.5 h
  assert.equal(sizeOf('no-such-card'), 'medium')
  assert.equal(skillOf('no-such-card'), 'people')
})

test('a question, a paid translation and a booking page each make a draft', () => {
  const q = askDraft({ ref: 'Q-AAAAAA', service: 'Peptides', message: 'How long?', contact: 'LINE x', lang: 'en', page: '' })
  for (const k of FIVE) assert.ok(q[k], k)
  assert.equal(q.kind, 'ask'); assert.equal(q.skill, 'sales')
  const p = payDraft({ ref: 'HD-R07890', baht: 1500, choice: { svc: 'new', pages: '4', stamp: true }, transRef: '016304153934BOR07890' })
  assert.equal(p.ref, 'TR-R07890'); assert.equal(p.pay, 'paid'); assert.match(p.body, /HD-R07890/)
  const g = pageDraft({ ref: 'GH-AAAAAA', kind: 'github', name: 'GitHub · Profile', what: 'Profile for github.com/x', baht: 2000, usd: 50, contact: 'c', skill: 'frontend', size: 'small', slot: '2026-11-02' })
  assert.match(g.body, /฿2,000 \(US\$50\)/); assert.match(g.body, /📅 2026-11-02/)
})

test('toWheel: no key, no call; a key, its header; a refusal or a dead wheel is false', async () => {
  const seen = []
  const real = globalThis.fetch
  try {
    globalThis.fetch = async (url, opt) => { seen.push({ url, opt }); return new Response(JSON.stringify({ ok: url.includes('good') }), { status: url.includes('good') ? 200 : 401 }) }
    assert.equal(await toWheel({}, { ref: 'HD-AAAAAA' }), false)
    assert.equal(seen.length, 0)
    assert.equal(await toWheel({ WHEEL_SHOP_KEY: 'k', WHEEL_URL: 'https://good.example' }, { ref: 'HD-AAAAAA' }), true)
    assert.equal(seen[0].url, 'https://good.example/api/shop/order'); assert.equal(seen[0].opt.headers['x-shop'], 'k')
    assert.equal(await toWheel({ WHEEL_SHOP_KEY: 'k', WHEEL_URL: 'https://bad.example' }, {}), false)
    globalThis.fetch = async () => { throw new Error('down') }
    assert.equal(await toWheel({ WHEEL_SHOP_KEY: 'k' }, {}), false)
  } finally { globalThis.fetch = real }
})

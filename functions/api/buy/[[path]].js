/**
 * /api/buy — orders from the Buy button on hongdam.net's service cards.
 *
 *   GET  /api/buy                                               {slip: true} when slips are checked by SlipOK
 *   POST /api/buy {card, opt, qty, addon, contact, note, lang}  an order; the price is worked out here
 *                                                               (addon: true, or a count for an add-on with its own unit)
 *   POST /api/buy/slip  form: ref, slip                         a PromptPay slip, checked by SlipOK → paid
 *   POST /api/buy/claim {ref, how: paypal|wise}                 the buyer says they paid; the team checks
 *   GET  /api/buy/HD-xxxxxx                                     the order tracker: card, option and state, nothing else
 *   POST /api/buy/state {ref, state: paid|started|done}         the team moves an order on   Authorization: Bearer TASKS_ADMIN
 *
 * Each order mails ORDER_TO (or CONTACT_TO) and posts in #help-desk (DISCORD_TASKS), and counts as
 * demand for that service's monthly price walk. The cards in HERS go to Nan alone (PLAN_TO, else
 * nan@motdang.net), by mail, never to #help-desk: her word 2026-10-24, "Send them to me", on the
 * ฿2,000 written plans, as CMVD sends its plans. POST answers hongdam.net, hongdam.pages.dev and
 * localhost. Bindings and secrets on the Pages project: TASKS (D1), RT_LIMIT, DISCORD_TASKS,
 * SLIPOK_KEY + SLIPOK_BRANCH, RESEND_API_KEY + ORDER_TO or CONTACT_TO. Table migrations/0007_buy.sql.
 */
import { CARDS } from '../../_shop_data.js'
import { quote, walkedPrices, payLinks } from '../../_shop.js'
import { record, whoHash } from '../../_services.js'
import { checkSlip, slipOn } from '../pay/_verify.js'
import { tell } from '../../_tasks.js'

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
})
const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const ORIGINS = ['https://hongdam.net', 'https://www.hongdam.net', 'https://hongdam.pages.dev']
const originOk = (o) => ORIGINS.includes(o) || /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(o)
const LANGS = ['en', 'th', 'my', 'zh']
const money = (n, cur) => (cur === 'USD' ? 'US$' : '฿') + Number(n).toLocaleString('en-US')
const code = (s) => '`' + String(s).replace(/`/g, '') + '`'
const newRef = () => 'HD-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, '0').slice(-6)

async function allowed(env, ip, now) {
  if (!env.RT_LIMIT) return true
  const k = `buy:${ip}:${new Date(now).toISOString().slice(0, 10)}`
  const n = Number(await env.RT_LIMIT.get(k)) || 0
  if (n >= 5) return false
  await env.RT_LIMIT.put(k, String(n + 1), { expirationTtl: 2 * 86400 })
  return true
}

// Slip checks and payment claims (CodeRabbit on PR #51: every slip goes to SlipOK, whose quota is shared):
// 10 a day from one address and 5 a day for one order, apart from the order quota. Without RT_LIMIT,
// 5 a day for one order, counted in this worker's memory.
const TRIES = new Map()
async function triesOk(env, ip, ref, now) {
  const day = new Date(now).toISOString().slice(0, 10)
  if (!env.RT_LIMIT) {
    if (TRIES.size > 5000) TRIES.clear()
    const k = `${ref}:${day}`, n = (TRIES.get(k) || 0) + 1
    TRIES.set(k, n)
    return n <= 5
  }
  const ki = `pay:ip:${ip}:${day}`, kr = `pay:ref:${ref}:${day}`
  const [ni, nr] = (await Promise.all([env.RT_LIMIT.get(ki), env.RT_LIMIT.get(kr)])).map((x) => Number(x) || 0)
  if (ni >= 10 || nr >= 5) return false
  await Promise.all([env.RT_LIMIT.put(ki, String(ni + 1), { expirationTtl: 2 * 86400 }), env.RT_LIMIT.put(kr, String(nr + 1), { expirationTtl: 2 * 86400 })])
  return true
}

// A confirmed payment counts in full for the price walk (412e47c: unpaid orders hold a price, paid ones move it).
// Same who as the order's 'buy' record, so a booked-then-paid order counts once.
async function paidDemand(db, o, now) {
  const who = await whoHash(o.contact || '')
  const add = o.addon ? CARDS[o.card]?.add?.id : null
  await Promise.all([record(db, o.opt, who, 'paid', now), add && record(db, add, who, 'paid', now)])
}

async function mail(env, subject, text, replyTo, only) {
  const to = (only || env.ORDER_TO || env.CONTACT_TO || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!env.RESEND_API_KEY || !to.length) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.CONTACT_FROM || 'Hongdam <hongdam@send.motdang.net>', to, subject, text,
      ...(/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(replyTo) ? { reply_to: replyTo } : {}) }),
  }).catch(() => {})
}

export const HERS = new Set(['thai-plan'])
/** An order's notice: #help-desk and ORDER_TO, or for her cards a mail to her alone. */
const notify = (env, card, title, lines, subject, replyTo) => (HERS.has(card)
  ? mail(env, subject, lines.join('\n'), replyTo, env.PLAN_TO || 'nan@motdang.net')
  : Promise.all([tell(env, title, lines), mail(env, subject, lines.join('\n'), replyTo)]))

const lineOf = (o) => [
  `${CARDS[o.card]?.en || o.card} · ${o.opt}${o.qty > 1 ? ` × ${o.qty}` : ''}${o.addon ? ` + ${CARDS[o.card]?.add?.id || 'add-on'}${CARDS[o.card]?.add?.unit ? ` × ${o.addon} ${CARDS[o.card].add.unit}` : ''}` : ''}`,
  `Total ${money(o.total, o.cur)} · due now ${money(o.due, o.cur)}`,
  `Contact: ${code(o.contact)}${o.lang ? ` · page ${o.lang}` : ''}`,
  o.note && `Note: ${code(o.note)}`,
  GRAB[o.opt] && `Once paid, log it on the Desk: /grab sold ${GRAB[o.opt]} <shop> — the Grab prices walk on those sales`,
  `Ref ${o.ref}`,
].filter(Boolean)
// Grab is priced by the Hongdam Desk bot from the sales logged there (hongdam-desk/grab.py).
const GRAB = { 'grab-start': 'start', 'grab-menu': 'refresh', 'grab-care': 'care' }

async function order(ctx, b, now) {
  const { request, env } = ctx
  const card = clean(b.card, 40), opt = clean(b.opt, 40)
  const contact = clean(b.contact, 120), note = clean(b.note, 600), lang = LANGS.includes(b.lang) ? b.lang : 'en'
  if (!CARDS[card] || CARDS[card].act !== 'buy') return json({ ok: false, why: 'card' }, 400)
  if (contact.length < 3) return json({ ok: false, why: 'contact' }, 400)
  const db = env.TASKS
  const q = quote(card, opt, b.qty, b.addon, await walkedPrices(db, now))
  if (q.error) return json({ ok: false, why: q.error }, 400)
  if (!(await allowed(env, request.headers.get('cf-connecting-ip') || '', now))) return json({ ok: false, why: 'limit' }, 429)
  if (!db) return json({ ok: false, why: 'off' }, 503)
  let ref = ''
  for (let i = 0; i < 3 && !ref; i++) {
    const r = newRef()
    try {
      await db.prepare('INSERT INTO svc_buy (ref, card, opt, qty, addon, total, due, cur, contact, note, lang, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(r, card, q.opt, q.qty, q.addon || 0, q.total, q.due, q.cur, contact, note || null, lang, new Date(now).toISOString()).run()
      ref = r
    } catch { /* a ref taken, or the database busy: try another */ }
  }
  if (!ref) return json({ ok: false, why: 'off' }, 500)
  const o = { ref, card, ...q, contact, note, lang }
  ctx.waitUntil(Promise.all([
    record(db, q.opt, await whoHash(contact), 'buy', now),
    q.addon && record(db, CARDS[card].add.id, await whoHash(contact), 'buy', now),
    notify(env, card, `Order ${ref} · ${CARDS[card].en}`, ['New order, not paid yet', ...lineOf(o)], `Order ${ref} — ${CARDS[card].en} — ${money(q.due, q.cur)} due`, contact),
  ]))
  return json({ ok: true, ref, total: q.total, due: q.due, cur: q.cur, qty: q.qty, half: q.due < q.total, pay: payLinks(q.cur, q.due) })
}

async function slip(ctx, now) {
  const { request, env } = ctx
  let form
  try { form = await request.formData() } catch { return json({ ok: false, why: 'nofile' }, 400) }
  const ref = clean(form.get('ref'), 12)
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  if (!(await triesOk(env, request.headers.get('cf-connecting-ip') || '', ref, now))) return json({ ok: false, why: 'tries' }, 429)
  const o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o) return json({ ok: false, why: 'ref' }, 404)
  if (o.state === 'paid' || o.state === 'done') return json({ ok: true, ref, amount: o.due })
  if (o.cur !== 'THB' || !['booked', 'claimed'].includes(o.state)) return json({ ok: false, why: 'state' })
  const r = await checkSlip(env, form.get('slip'), o.due)
  if (!r.ok) return json({ ok: false, why: r.why })
  const u = await env.TASKS.prepare("UPDATE svc_buy SET state = 'paid', paid_ref = ? WHERE ref = ? AND state IN ('booked','claimed')").bind(r.transRef, ref).run()
  if (u?.meta?.changes === 0) return json({ ok: false, why: 'state' })
  const lines = [`Paid ${money(o.due, 'THB')} by PromptPay · bank ref ${r.transRef}`, ...lineOf(o)]
  ctx.waitUntil(Promise.all([notify(env, o.card, `Order ${ref} paid`, lines, `Paid: ${money(o.due, 'THB')} · order ${ref}`), paidDemand(env.TASKS, o, now)]))
  return json({ ok: true, ref, amount: o.due })
}

async function claim(ctx, b, now) {
  const { request, env } = ctx
  const ref = clean(b.ref, 12), how = b.how === 'wise' ? 'wise' : 'paypal'
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  if (!(await triesOk(env, request.headers.get('cf-connecting-ip') || '', ref, now))) return json({ ok: false, why: 'tries' }, 429)
  const o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o) return json({ ok: false, why: 'ref' }, 404)
  if (o.state !== 'booked') return json({ ok: true, ref, state: o.state })
  await env.TASKS.prepare("UPDATE svc_buy SET state = 'claimed', paid_ref = ? WHERE ref = ? AND state = 'booked'").bind(how, ref).run()
  const lines = [`Buyer says paid ${money(o.due, o.cur)} by ${how === 'wise' ? 'Wise' : 'PayPal'}: check the account`, ...lineOf(o)]
  ctx.waitUntil(notify(env, o.card, `Order ${ref} says paid (${how})`, lines, `Check ${how}: ${money(o.due, o.cur)} · order ${ref}`))
  return json({ ok: true, ref, state: 'claimed' })
}

const REF = /^HD-[0-9A-Z]{6}$/
const STEPS = ['booked', 'claimed', 'paid', 'started', 'done']

// The tracker page reads this: no contact, no note, no money.
async function tracked(env, ref) {
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  if (!env.TASKS) return json({ ok: false, why: 'off' }, 503)
  const o = await env.TASKS.prepare('SELECT ref, card, opt, state FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o || o.state === 'void') return json({ ok: false, why: 'ref' }, 404)
  return json({ ok: true, ref: o.ref, card: o.card, opt: o.opt, state: o.state })
}

// The team (or the Desk bot) moves an order forward: paid for a PayPal or Wise payment it found, started, done.
async function moved(ctx, b, now) {
  const { request, env } = ctx
  const key = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!env.TASKS_ADMIN || key !== env.TASKS_ADMIN) return json({ ok: false, why: 'key' }, 401)
  const ref = clean(b.ref, 12), state = ['paid', 'started', 'done'].includes(b.state) ? b.state : ''
  if (!REF.test(ref) || !state) return json({ ok: false, why: 'body' }, 400)
  const o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o || o.state === 'void') return json({ ok: false, why: 'ref' }, 404)
  if (STEPS.indexOf(state) <= STEPS.indexOf(o.state)) return json({ ok: true, ref, state: o.state })
  await env.TASKS.prepare('UPDATE svc_buy SET state = ? WHERE ref = ?').bind(state, ref).run()
  if (STEPS.indexOf(o.state) < STEPS.indexOf('paid')) ctx.waitUntil(paidDemand(env.TASKS, o, now))
  const said = [`Marked ${state} ${new Date(now).toISOString().slice(0, 16)}Z`, ...lineOf(o)]
  ctx.waitUntil(HERS.has(o.card) ? mail(env, `Order ${ref} ${state}`, said.join('\n'), '', env.PLAN_TO || 'nan@motdang.net') : tell(env, `Order ${ref} ${state}`, said))
  return json({ ok: true, ref, state })
}

async function handle(ctx, now) {
  const { request, env, params } = ctx
  const path = [].concat(params.path || [])
  if (request.method === 'GET' && !path.length) return json({ slip: slipOn(env), cards: Object.keys(CARDS).filter((k) => CARDS[k].act === 'buy').length })
  if (request.method === 'GET' && path.length === 1) return tracked(env, clean(path[0], 12))
  if (request.method !== 'POST') return json({ ok: false, why: 'route' }, 404)
  if (!path.length) {
    let b
    try { b = await request.json() } catch { return json({ ok: false, why: 'body' }, 400) }
    if (!b || typeof b !== 'object' || Array.isArray(b)) return json({ ok: false, why: 'body' }, 400)
    return order(ctx, b, now)
  }
  if (!env.TASKS) return json({ ok: false, why: 'off' }, 503)
  if (path[0] === 'slip') return slip(ctx, now)
  if (path[0] === 'state') {
    let b
    try { b = await request.json() } catch { return json({ ok: false, why: 'body' }, 400) }
    return moved(ctx, b || {}, now)
  }
  if (path[0] === 'claim') {
    let b
    try { b = await request.json() } catch { return json({ ok: false, why: 'body' }, 400) }
    return claim(ctx, b || {}, now)
  }
  return json({ ok: false, why: 'route' }, 404)
}

export async function onRequest(ctx) {
  const { request } = ctx
  const origin = request.headers.get('origin')
  if (request.method === 'OPTIONS') {
    if (!origin || !originOk(origin)) return new Response(null, { status: 403 })
    return new Response(null, { status: 204, headers: { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET,POST', 'access-control-allow-headers': 'content-type', vary: 'origin' } })
  }
  if (request.method === 'POST' && origin && !originOk(origin)) return json({ ok: false, why: 'origin' }, 403)
  const res = await handle(ctx, Date.now())
  if (origin && originOk(origin)) { res.headers.set('access-control-allow-origin', origin); res.headers.set('vary', 'origin') }
  return res
}

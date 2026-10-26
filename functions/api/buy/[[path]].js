/**
 * /api/buy — orders from the Buy button on hongdam.net's service cards.
 *
 *   GET  /api/buy                                               {slip: true} when slips are checked by SlipOK
 *   POST /api/buy {card, opt, qty, addon, contact, note, lang, pay}  an order; the price is worked out here
 *                                                               (addon: true, or a count for an add-on with its own unit;
 *                                                               pay: THB, USD or EUR, the currency the buyer pays in)
 *   POST /api/buy/slip  form: ref, slip                         a PromptPay slip, checked by SlipOK → paid
 *   POST /api/buy/claim {ref, how: paypal|wise|lightning}       the buyer says they paid; the team checks
 *   POST /api/buy/card {ref, cur}                               card or PayPal on PayPal's page: {url} to send the buyer to
 *                                                               (cur: the pay box's currency, used before 0011 is applied)
 *   POST /api/buy/card/done {ref, token}                        back from PayPal: held (state capturing), captured, checked → paid
 *   POST /api/buy/ln {ref}                                      a bitcoin Lightning bill for the amount due: {pr, sats, exp, check}
 *   POST /api/buy/ln/check {ref}                                the bill paid? asks the wallet (check: true only) → paid
 *   GET  /api/buy/HD-xxxxxx                                     the order tracker: card, option and state, nothing else
 *   POST /api/buy/state {ref, state: paid|started|done, force?} the team moves an order on   Authorization: Bearer TASKS_ADMIN
 *                                                               (force: true moves one held while PayPal captures)
 *
 * Each order mails ORDER_TO (or CONTACT_TO), becomes a ticket on the Team Wheel (functions/_wheel.js; #help-desk,
 * DISCORD_TASKS, only when the wheel does not take it), and counts as demand for that service's monthly price walk. The cards in HERS go to Nan alone (PLAN_TO, else
 * nan@motdang.net), by mail, never to #help-desk: her word 2026-10-24, "Send them to me", on the
 * ฿2,000 written plans, as CMVD sends its plans. POST answers hongdam.net, hongdam.pages.dev and
 * localhost. Bindings and secrets on the Pages project: TASKS (D1), RT_LIMIT, DISCORD_TASKS,
 * SLIPOK_KEY + SLIPOK_BRANCH, RESEND_API_KEY + ORDER_TO or CONTACT_TO. Tables migrations/0007_buy.sql and
 * 0010_tries.sql (slip and claim tries).
 *
 * The ฿ / $ / € switch (her ask 2026-10-24): the price keeps its own currency in total, due and cur; the amount
 * the buyer pays in their currency, and the baht for PromptPay, are worked out at today's rate (functions/_fx.js)
 * and kept in the column pay as JSON {cur, total, due, thb, rate, at} (migrations/0011_pay.sql; orders still go
 * through before it is applied, with those numbers in the notice only). Card payments: functions/_paypal.js, on
 * when PAYPAL_CLIENT_ID and PAYPAL_SECRET are set; the PayPal order's id goes into pay as pp.
 *
 * Bitcoin by Lightning (her ask 2026-10-24): functions/_lightning.js, on while PAY.lightning holds a Lightning Address.
 * The bill goes into pay as ln {pr, hash, msat, sats, exp, verify, btc, at}; one bill per order at a time, kept until
 * it runs out (CodeRabbit on #91: a bill replaced early could still be paid, unseen).
 */
import { CARDS } from '../../_shop_data.js'
import { quote, walkedPrices, payLinks } from '../../_shop.js'
import { record, whoHash } from '../../_services.js'
import { checkSlip, slipOn } from '../pay/_verify.js'
import { tell } from '../../_tasks.js'
import { tryOnce, sweep } from '../../_tries.js'
import { rates, conv, CURS } from '../../_fx.js'
import { cardOn, startCard, finishCard } from '../../_paypal.js'
import { lnOn, btcUsd, satsFor, makeBill, settled } from '../../_lightning.js'
import { toWheel, shopDraft, trackUrl } from '../../_wheel.js'

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
})
const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const ORIGINS = ['https://hongdam.net', 'https://www.hongdam.net', 'https://hongdam.pages.dev']
const originOk = (o) => ORIGINS.includes(o) || /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(o)
const LANGS = ['en', 'th', 'my', 'zh', 'de']
const money = (n, cur) => ({ USD: 'US$', EUR: '€' }[cur] || '฿') + Number(n).toLocaleString('en-US')
/** What the buyer pays: {cur, total, due, thb, rate?, at?, pp?}, the price's own numbers unless the pay column says otherwise. */
const payOf = (o) => {
  let j = {}
  try { j = o.pay ? JSON.parse(o.pay) || {} : {} } catch { /* the price's own */ }
  return { cur: o.cur, total: o.total, due: o.due, thb: o.cur === 'THB' ? o.due : 0, ...j }
}
/** The baht a PromptPay slip must show for this order, or 0 when there is none. */
const bahtDue = (o) => payOf(o).thb || 0
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

// Slip checks and payment claims (CodeRabbit on #51 and #52: every slip goes to SlipOK, whose quota is
// shared): 10 tries a day from one address and 5 for one order, counted atomically in D1 (functions/_tries.js,
// table tries), apart from the order quota. No table or no D1: refused.
const triesOk = (env, kind, ip, ref, now) => tryOnce(env.TASKS, [[`${kind}:ip:${ip}`, 10], [`${kind}:ref:${ref}`, 5]], now)

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
/** An order's notice. Her cards: a mail to her alone. The rest: its ticket on the Team Wheel (w), or #help-desk when the
 * wheel does not take it, and ORDER_TO. An alert (a capture or bill that does not match) goes to #help-desk as well. */
async function notify(env, card, title, lines, subject, replyTo, w, alert = false) {
  if (HERS.has(card)) return mail(env, subject, lines.join('\n'), replyTo, env.PLAN_TO || 'nan@motdang.net')
  const took = w ? await toWheel(env, w) : false
  await Promise.all([took && !alert ? null : tell(env, title, lines), mail(env, subject, lines.join('\n'), replyTo)])
}

const SITE = 'https://hongdam.net'
const moneyLine = (o) => {
  const p = payOf(o)
  // ½: half now (from ฿10,000 / US$300); the buyer's own currency after it
  return `${money(o.total, o.cur)}${o.due < o.total ? ` · ½ ${money(o.due, o.cur)}` : ''}${p.cur !== o.cur ? ` = ${money(p.due, p.cur)}` : ''}`
}
/** The order as its wheel ticket, with what changed (pay, how, line). The whole draft rides along, so an order the
 * wheel missed when it was booked still lands, at its money. */
const wheelOf = (o, extra = {}) => ({
  ...shopDraft(o, {
    cardName: CARDS[o.card]?.en || o.card, money: moneyLine(o), link: trackUrl(SITE, o.lang, o.ref),
  }),
  pay: ['paid', 'started', 'done'].includes(o.state) ? 'paid' : o.state === 'claimed' || o.state === 'capturing' ? 'claimed' : 'booked',
  ...extra,
})

const lineOf = (o) => [
  `${CARDS[o.card]?.en || o.card} · ${o.opt}${o.qty > 1 ? ` × ${o.qty}` : ''}${o.addon ? ` + ${CARDS[o.card]?.add?.id || 'add-on'}${CARDS[o.card]?.add?.unit ? ` × ${o.addon} ${CARDS[o.card].add.unit}` : ''}` : ''}`,
  `Total ${money(o.total, o.cur)} · due now ${money(o.due, o.cur)}`,
  payOf(o).cur !== o.cur && `Buyer pays in ${payOf(o).cur}: ${money(payOf(o).due, payOf(o).cur)} now${payOf(o).total !== payOf(o).due ? ` of ${money(payOf(o).total, payOf(o).cur)}` : ''} (1 ${payOf(o).cur === 'THB' ? o.cur : payOf(o).cur} = ฿${payOf(o).rate}, ${payOf(o).at})`,
  o.cur !== 'THB' && payOf(o).thb && `PromptPay amount ${money(payOf(o).thb, 'THB')}`,
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
  let walked
  try { walked = await walkedPrices(db, now) } catch { return json({ ok: false, why: 'price', retry: true }, 503) }   // the walk unreadable (D1 down): no order, try again
  const q = quote(card, opt, b.qty, b.addon, walked)
  if (q.error) return json({ ok: false, why: q.error }, 400)
  if (!(await allowed(env, request.headers.get('cf-connecting-ip') || '', now))) return json({ ok: false, why: 'limit' }, 429)
  if (!db) return json({ ok: false, why: 'off' }, 503)
  const p = await payIn(env, q, CURS.includes(b.pay) ? b.pay : q.cur)
  const payCol = p.cur !== q.cur || p.thb !== (q.cur === 'THB' ? q.due : 0) ? JSON.stringify(p) : null
  let ref = '', cols = !!payCol
  for (let i = 0; i < 4 && !ref; i++) {
    const r = newRef()
    try {
      await db.prepare(`INSERT INTO svc_buy (ref, card, opt, qty, addon, total, due, cur, contact, note, lang, created_at${cols ? ', pay' : ''}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?${cols ? ',?' : ''})`)
        .bind(r, card, q.opt, q.qty, q.addon || 0, q.total, q.due, q.cur, contact, note || null, lang, new Date(now).toISOString(), ...(cols ? [payCol] : [])).run()
      ref = r
    } catch (e) {
      if (cols && /pay/.test(String(e && e.message))) cols = false   // 0011 not applied yet: the order without the column
      /* else a ref taken, or the database busy: try another */
    }
  }
  if (!ref) return json({ ok: false, why: 'off' }, 500)
  const o = { ref, card, ...q, contact, note, lang, pay: payCol }
  ctx.waitUntil(Promise.all([
    record(db, q.opt, await whoHash(contact), 'buy', now),
    q.addon && record(db, CARDS[card].add.id, await whoHash(contact), 'buy', now),
    notify(env, card, `Order ${ref} · ${CARDS[card].en}`, ['New order, not paid yet', ...lineOf(o)], `Order ${ref} — ${CARDS[card].en} — ${money(p.due, p.cur)} due`, contact, wheelOf(o)),
  ]))
  // a slip is checked against the baht kept in pay: no PromptPay for a US$ price until 0011 is applied
  const thb = q.cur === 'THB' ? q.due : cols ? p.thb : 0
  return json({ ok: true, ref, total: q.total, due: q.due, cur: q.cur, qty: q.qty, half: q.due < q.total,
    show: { cur: p.cur, total: p.total, due: p.due }, pay: payLinks(p.cur, p.due, thb) })
}

/** The order in the buyer's currency, and its baht for PromptPay, at today's rate. In the price's own currency
 * (and no PromptPay for a US$ price) while no rate can be read. */
async function payIn(env, q, cur) {
  const same = { cur: q.cur, total: q.total, due: q.due, thb: q.cur === 'THB' ? q.due : 0 }
  if (cur === q.cur && q.cur === 'THB') return same
  const r = await rates(env).catch(() => null)
  if (!r) return same
  const total = conv(q.total, q.cur, cur, r.rates), due = conv(q.due, q.cur, cur, r.rates), thb = conv(q.due, q.cur, 'THB', r.rates)
  if (!total || !due || !thb) return same
  return { cur, total, due, thb, rate: r.rates[cur === 'THB' ? q.cur : cur], at: r.at }
}

async function slip(ctx, now) {
  const { request, env } = ctx
  let form
  try { form = await request.formData() } catch { return json({ ok: false, why: 'nofile' }, 400) }
  const ref = clean(form.get('ref'), 12)
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  if (!(await triesOk(env, 'slip', request.headers.get('cf-connecting-ip') || '', ref, now))) return json({ ok: false, why: 'tries' }, 429)
  ctx.waitUntil(sweep(env.TASKS, now))
  const o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o) return json({ ok: false, why: 'ref' }, 404)
  if (o.state === 'paid' || o.state === 'done') return json({ ok: true, ref, amount: bahtDue(o) || o.due })
  const baht = bahtDue(o)
  if (!baht || !['booked', 'claimed'].includes(o.state)) return json({ ok: false, why: 'state' })
  const r = await checkSlip(env, form.get('slip'), baht)
  if (!r.ok) return json({ ok: false, why: r.why })
  const u = await env.TASKS.prepare("UPDATE svc_buy SET state = 'paid', paid_ref = ? WHERE ref = ? AND state IN ('booked','claimed')").bind(r.transRef, ref).run()
  if (u?.meta?.changes === 0) return json({ ok: false, why: 'state' })
  const lines = [`Paid ${money(baht, 'THB')} by PromptPay · bank ref ${r.transRef}`, ...lineOf(o)]
  ctx.waitUntil(Promise.all([notify(env, o.card, `Order ${ref} paid`, lines, `Paid: ${money(baht, 'THB')} · order ${ref}`, '', wheelOf(o, { pay: 'paid', how: 'promptpay', line: `💰 ${lines[0]}` })), paidDemand(env.TASKS, o, now)]))
  return json({ ok: true, ref, amount: baht })
}

async function claim(ctx, b, now) {
  const { request, env } = ctx
  const ref = clean(b.ref, 12), how = ['wise', 'lightning'].includes(b.how) ? b.how : 'paypal'
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  if (!(await triesOk(env, 'claim', request.headers.get('cf-connecting-ip') || '', ref, now))) return json({ ok: false, why: 'tries' }, 429)
  const o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o) return json({ ok: false, why: 'ref' }, 404)
  if (o.state !== 'booked') return json({ ok: true, ref, state: o.state })
  await env.TASKS.prepare("UPDATE svc_buy SET state = 'claimed', paid_ref = ? WHERE ref = ? AND state = 'booked'").bind(how, ref).run()
  const p = payOf(o)
  const by = { paypal: 'PayPal', wise: 'Wise', lightning: 'Lightning' }[how]
  const lines = [how === 'lightning' && p.ln
    ? `Buyer says paid ${p.ln.sats.toLocaleString('en-US')} sats (${money(p.due, p.cur)}) by Lightning: check the wallet for payment hash ${p.ln.hash}`
    : `Buyer says paid ${money(p.due, p.cur)} by ${by}: check the account`, ...lineOf(o)]
  ctx.waitUntil(notify(env, o.card, `Order ${ref} says paid (${how})`, lines, `Check ${by}: ${money(p.due, p.cur)} · order ${ref}`, '', wheelOf(o, { pay: 'claimed', how, line: `❓ ${lines[0]}` })))
  return json({ ok: true, ref, state: 'claimed' })
}

// Card or PayPal (functions/_paypal.js): the amount the buyer pays, in their currency, on PayPal's page.
async function card(ctx, b, now) {
  const { request, env } = ctx
  if (!cardOn(env)) return json({ ok: false, why: 'off' }, 503)
  const ref = clean(b.ref, 12)
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  if (!(await triesOk(env, 'card', request.headers.get('cf-connecting-ip') || '', ref, now))) return json({ ok: false, why: 'tries' }, 429)
  const o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o) return json({ ok: false, why: 'ref' }, 404)
  if (!['booked', 'claimed'].includes(o.state)) return json({ ok: false, why: 'state' })
  // the currency the pay box showed: kept in pay, or (before 0011) sent by the page and worked out again here
  let p = payOf(o)
  if (p.pp && p.ppUrl) return json({ ok: true, url: p.ppUrl })   // one PayPal order per order: a second press gets the same link
  if (!o.pay && CURS.includes(b.cur) && b.cur !== o.cur) p = { ...p, ...(await payIn(env, o, b.cur)) }
  const back = `${new URL(request.url).origin}/${o.lang && o.lang !== 'en' ? o.lang + '/' : ''}buy/?ref=${ref}`
  let r
  try { r = await startCard(env, { ref, amount: p.due, cur: p.cur, what: `${CARDS[o.card]?.en || o.card} · ${ref}`, back }) } catch { r = { error: 'paypal' } }
  if (r.error) return json({ ok: false, why: 'paypal' }, 502)
  // no link to PayPal unless this order keeps the PayPal order and the amount it asks for (CodeRabbit on #77)
  let kept = null
  try {
    kept = await env.TASKS.prepare("UPDATE svc_buy SET pay = ? WHERE ref = ? AND state IN ('booked','claimed') AND (pay IS NULL OR json_extract(pay, '$.pp') IS NULL)")
      .bind(JSON.stringify({ ...p, pp: r.id, ppUrl: r.url }), ref).run()
  } catch { /* no column yet */ }
  if (!kept) return json({ ok: false, why: 'off' }, 503)
  if (kept.meta?.changes === 0) {   // two presses at once: the first one's link; this PayPal order is never shown
    const again = payOf((await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()) || {})
    return again.ppUrl ? json({ ok: true, url: again.ppUrl }) : json({ ok: false, why: 'state' })
  }
  return json({ ok: true, url: r.url })
}

async function cardDone(ctx, b, now) {
  const { request, env } = ctx
  if (!cardOn(env)) return json({ ok: false, why: 'off' }, 503)
  const ref = clean(b.ref, 12)
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  if (!(await triesOk(env, 'cardok', request.headers.get('cf-connecting-ip') || '', ref, now))) return json({ ok: false, why: 'tries' }, 429)
  const o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o) return json({ ok: false, why: 'ref' }, 404)
  if (['paid', 'started', 'done'].includes(o.state)) return json({ ok: true, ref, state: o.state })
  if (!['booked', 'claimed', 'capturing'].includes(o.state)) return json({ ok: false, why: 'state' })
  const p = payOf(o)
  const id = p.pp   // kept by /api/buy/card; the token in the return address is not trusted (CodeRabbit on #77)
  if (!id) return json({ ok: false, why: 'paypal' })
  // Held while PayPal captures (CodeRabbit on #76): a slip or the team cannot pay it meanwhile. A second return (a
  // reload) finds it held and captures again, which PayPal answers for an order it has captured already.
  if (o.state !== 'capturing') {
    const h = await env.TASKS.prepare("UPDATE svc_buy SET state = 'capturing', pay = json_set(coalesce(pay, '{}'), '$.from', state) WHERE ref = ? AND state IN ('booked','claimed')").bind(ref).run()
    if (h?.meta?.changes === 0) return json({ ok: false, why: 'state' })
  }
  let r
  try { r = await finishCard(env, id, { ref, amount: p.due, cur: p.cur }) } catch { r = { ok: false, why: 'pending', final: false } }
  if (!r.ok) {
    // let go only when PayPal said no money moved; an unknown result stays held until the buyer's next return or the team
    if (r.final) await env.TASKS.prepare("UPDATE svc_buy SET state = coalesce(json_extract(pay, '$.from'), 'booked') WHERE ref = ? AND state = 'capturing'").bind(ref).run().catch(() => {})
    if (r.mismatch) { const al = `PayPal captured ${r.capture} for another ref, amount or currency than ${money(p.due, p.cur)}. The order stays held: check PayPal, then refund or mark it paid with force.`; ctx.waitUntil(notify(env, o.card, `Order ${ref}: PayPal capture does not match`, [al, ...lineOf(o)], `Check PayPal: order ${ref}`, '', wheelOf(o, { line: `⚠️ ${al}` }), true)) }
    return json({ ok: false, why: r.why || 'paypal' })
  }
  const lines = [`Paid ${money(p.due, p.cur)} by card or PayPal on PayPal's page · capture ${r.capture}`, ...lineOf(o)]
  let u = null
  try { u = await env.TASKS.prepare("UPDATE svc_buy SET state = 'paid', paid_ref = ? WHERE ref = ? AND state = 'capturing'").bind('paypal ' + r.capture, ref).run() } catch { /* below */ }
  if (!u) {   // captured, not written down: the team records it by hand (POST /api/buy/state)
    ctx.waitUntil(notify(env, o.card, `Order ${ref}: captured, not recorded`, ['PayPal captured this payment but the order could not be marked paid. Mark it paid: POST /api/buy/state {ref, state: "paid", force: true}', ...lines], `Record by hand: ${money(p.due, p.cur)} · order ${ref}`, '', wheelOf(o, { line: '⚠️ PayPal captured this payment, and the site could not mark it paid. NaN: 💰 Money is in on the wheel.' }), true))
    return json({ ok: false, why: 'pending' })
  }
  if (u.meta?.changes !== 0) ctx.waitUntil(Promise.all([notify(env, o.card, `Order ${ref} paid`, lines, `Paid: ${money(p.due, p.cur)} · order ${ref}`, '', wheelOf(o, { pay: 'paid', how: 'card', line: `💰 ${lines[0]}` })), paidDemand(env.TASKS, o, now)]))
  return json({ ok: true, ref, state: 'paid' })
}

// Bitcoin by Lightning (functions/_lightning.js): a bill from her wallet for the amount the buyer pays, in sats.
const billOut = (ln) => ({ ok: true, pr: ln.pr, sats: ln.sats, exp: ln.exp, check: !!ln.verify })

async function lightning(ctx, b, now) {
  const { request, env } = ctx
  if (!lnOn()) return json({ ok: false, why: 'off' }, 503)
  const ref = clean(b.ref, 12)
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  const o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o || o.state === 'void') return json({ ok: false, why: 'ref' }, 404)
  if (['paid', 'started', 'done'].includes(o.state)) return json({ ok: true, ref, state: o.state })
  if (!['booked', 'claimed'].includes(o.state)) return json({ ok: false, why: 'state' })
  const p = payOf(o)
  if (p.ln && p.ln.pr) {
    if (p.ln.exp > now / 1000) return json(billOut(p.ln))
    // the kept bill ran out: paid before it did? then no new one
    const s = await settled(p.ln).catch(() => ({}))
    if (s.paid) return lnPaid(ctx, o, p, now)
  }
  if (!(await triesOk(env, 'ln', request.headers.get('cf-connecting-ip') || '', ref, now))) return json({ ok: false, why: 'tries' }, 429)
  const [r, btc] = await Promise.all([rates(env).catch(() => null), btcUsd()])
  const sats = btc ? satsFor(p.due, p.cur, btc.usd, r && r.rates) : 0
  if (!sats) return json({ ok: false, why: 'ln' }, 502)
  let bill
  try { bill = await makeBill(env, { msat: sats * 1000, comment: `Hongdam ${ref}` }) } catch { bill = { error: 'ln' } }
  if (bill.error) return json({ ok: false, why: 'ln' }, 502)
  const ln = { ...bill, sats, btc: Math.round(btc.usd), at: new Date(now).toISOString() }
  // kept on the order unless another press kept a bill meanwhile; that one is shown instead
  const u = await env.TASKS.prepare("UPDATE svc_buy SET pay = json_set(coalesce(pay, '{}'), '$.ln', json(?)) WHERE ref = ? AND state IN ('booked','claimed') AND coalesce(json_extract(pay, '$.ln.pr'), '') = ?")
    .bind(JSON.stringify(ln), ref, (p.ln && p.ln.pr) || '').run().catch(() => null)
  if (!u) return json({ ok: false, why: 'off' }, 503)
  if (u.meta?.changes === 0) {
    // another press kept a bill, or the order moved on (CodeRabbit on #91): a bill only for an order still unpaid
    const o2 = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
    if (o2 && ['paid', 'started', 'done'].includes(o2.state)) return json({ ok: true, ref, state: o2.state })
    const again = o2 && ['booked', 'claimed'].includes(o2.state) ? payOf(o2) : {}
    return again.ln && again.ln.exp > now / 1000 ? json(billOut(again.ln)) : json({ ok: false, why: 'state' })
  }
  return json(billOut(ln))
}

async function lnCheck(ctx, b, now) {
  const { env } = ctx
  const ref = clean(b.ref, 12)
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  const o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o || o.state === 'void') return json({ ok: false, why: 'ref' }, 404)
  const shown = o.state === 'capturing' ? 'claimed' : o.state
  const p = payOf(o)
  if (!['booked', 'claimed'].includes(o.state) || !p.ln || !p.ln.verify) return json({ ok: true, ref, state: shown })
  const s = await settled(p.ln).catch(() => ({}))
  if (s.mismatch) { const al = `The wallet says bill ${p.ln.hash} is paid, with a preimage or bill that does not match it. The order stays unpaid: check the wallet.`; ctx.waitUntil(notify(env, o.card, `Order ${ref}: Lightning answer does not match`, [al, ...lineOf(o)], `Check the Lightning wallet: order ${ref}`, '', wheelOf(o, { line: `⚠️ ${al}` }), true)) }
  return s.paid ? lnPaid(ctx, o, p, now) : json({ ok: true, ref, state: shown, exp: p.ln.exp })
}

/** The wallet showed the bill paid: the order is paid, the team told, the price walk counts it. */
async function lnPaid(ctx, o, p, now) {
  const { env } = ctx
  const lines = [`Paid ${p.ln.sats.toLocaleString('en-US')} sats by Lightning (${money(p.due, p.cur)} at US$${p.ln.btc.toLocaleString('en-US')} a bitcoin) · payment hash ${p.ln.hash}`, ...lineOf(o)]
  const u = await env.TASKS.prepare("UPDATE svc_buy SET state = 'paid', paid_ref = ? WHERE ref = ? AND state IN ('booked','claimed')").bind('lightning ' + p.ln.hash, o.ref).run()
  if (u?.meta?.changes === 0) {
    const now2 = await env.TASKS.prepare('SELECT state, paid_ref FROM svc_buy WHERE ref = ?').bind(o.ref).first()
    // paid by this bill already (a second page asking), or moved on by the team: nothing to add
    if (now2 && ['paid', 'started', 'done'].includes(now2.state)) return json({ ok: true, ref: o.ref, state: now2.state })
    ctx.waitUntil(notify(env, o.card, `Order ${o.ref}: paid by Lightning while ${now2 ? now2.state : 'gone'}`, [`The Lightning bill was paid while the order was ${now2 ? now2.state : 'gone'}, so it is not marked paid. To record it: POST /api/buy/state {ref, state: "paid", force: true}`, ...lines], `Record by hand: Lightning · order ${o.ref}`, '', wheelOf(o, { line: `⚠️ A Lightning bill for this order was paid while it was ${now2 ? now2.state : 'gone'}: it is not marked paid. NaN: 💰 Money is in on the wheel.` }), true))
    return json({ ok: false, why: 'pending' })
  }
  ctx.waitUntil(Promise.all([notify(env, o.card, `Order ${o.ref} paid`, lines, `Paid: ${money(p.due, p.cur)} by Lightning · order ${o.ref}`, '', wheelOf(o, { pay: 'paid', how: 'lightning', line: `💰 ${lines[0]}` })), paidDemand(env.TASKS, o, now)]))
  return json({ ok: true, ref: o.ref, state: 'paid' })
}

const REF = /^HD-[0-9A-Z]{6}$/
const STEPS = ['booked', 'claimed', 'paid', 'started', 'done']

// The tracker page reads this: no contact, no note, no money. An unpaid order with a Lightning bill the wallet can
// be asked about is asked once more, so a buyer who closed the pay page finds it paid here.
async function tracked(ctx, ref, now) {
  const { env } = ctx
  if (!REF.test(ref)) return json({ ok: false, why: 'ref' }, 404)
  if (!env.TASKS) return json({ ok: false, why: 'off' }, 503)
  let o = await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()
  if (!o || o.state === 'void') return json({ ok: false, why: 'ref' }, 404)
  const p = payOf(o)
  if (['booked', 'claimed'].includes(o.state) && p.ln && p.ln.verify && lnOn()) {
    const s = await settled(p.ln).catch(() => ({}))
    if (s.paid) { await lnPaid(ctx, o, p, now); o = (await env.TASKS.prepare('SELECT * FROM svc_buy WHERE ref = ?').bind(ref).first()) || o }
  }
  return json({ ok: true, ref: o.ref, card: o.card, opt: o.opt, state: o.state === 'capturing' ? 'claimed' : o.state })
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
  // held while PayPal captures: busy, unless the team says force (it has checked PayPal)
  if (o.state === 'capturing' && b.force !== true) return json({ ok: false, why: 'busy', state: o.state }, 409)
  if (STEPS.indexOf(state) <= STEPS.indexOf(o.state)) return json({ ok: true, ref, state: o.state })
  const u = await env.TASKS.prepare('UPDATE svc_buy SET state = ? WHERE ref = ? AND state = ?').bind(state, ref, o.state).run()
  if (u?.meta?.changes === 0) return json({ ok: false, why: 'busy' }, 409)   // it moved meanwhile (a capture, a slip): read it again
  if (STEPS.indexOf(o.state) < STEPS.indexOf('paid')) ctx.waitUntil(paidDemand(env.TASKS, o, now))
  // the Team Wheel moved it (its ticket's 🔨, ✅ or 💰): the ticket says so already
  if (b.from === 'wheel') return json({ ok: true, ref, state })
  const said = [`Marked ${state} ${new Date(now).toISOString().slice(0, 16)}Z`, ...lineOf(o)]
  ctx.waitUntil(HERS.has(o.card) ? mail(env, `Order ${ref} ${state}`, said.join('\n'), '', env.PLAN_TO || 'nan@motdang.net')
    : toWheel(env, wheelOf(o, { ...(state === 'paid' ? { pay: 'paid', how: 'team' } : {}), line: `🧾 Marked ${state} on hongdam.net` })).then((took) => took || tell(env, `Order ${ref} ${state}`, said)))
  return json({ ok: true, ref, state })
}

async function handle(ctx, now) {
  const { request, env, params } = ctx
  const path = [].concat(params.path || [])
  if (request.method === 'GET' && !path.length) return json({ slip: slipOn(env), card: cardOn(env), ln: lnOn(), cards: Object.keys(CARDS).filter((k) => CARDS[k].act === 'buy').length })
  if (request.method === 'GET' && path.length === 1) return tracked(ctx, clean(path[0], 12), now)
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
  if (path[0] === 'card') {
    let b
    try { b = await request.json() } catch { return json({ ok: false, why: 'body' }, 400) }
    return path[1] === 'done' ? cardDone(ctx, b || {}, now) : card(ctx, b || {}, now)
  }
  if (path[0] === 'ln') {
    let b
    try { b = await request.json() } catch { return json({ ok: false, why: 'body' }, 400) }
    return path[1] === 'check' ? lnCheck(ctx, b || {}, now) : lightning(ctx, b || {}, now)
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

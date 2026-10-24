/**
 * /api/bots — purchases and Shoup prices for hongdam.net/bots (and its copies on GitHub Pages).
 *
 *   GET  /api/bots                       prices now, slots this week, the walk
 *   POST /api/bots {kind, site, contact, note?}   a purchase; the price is worked out here
 *   POST /api/bots/slip  form: ref, slip           a PromptPay slip, checked by SlipOK
 *
 * Bindings and secrets on the Pages project: TASKS (D1), RT_LIMIT, DISCORD_TASKS,
 * SLIPOK_KEY + SLIPOK_BRANCH, RESEND_API_KEY + ORDER_TO or CONTACT_TO.
 */
import { KINDS, prices, counts, slotWeek, weekStart, walk, OPENED } from '../../_bots.js'
import { checkSlip } from '../pay/_verify.js'
import { tell } from '../../_tasks.js'

const json = (body, status = 200) => new Response(JSON.stringify(body, null, 1), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
})
const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const PAY = { promptpay: '0988239210', paypal: 'https://www.paypal.me/pfauhaus', wise: 'https://wise.com/pay/me/annikahonorahp', line: '@964yxgnk' }

async function allowed(env, ip, now) {
  if (!env.RT_LIMIT) return true
  const k = `bots:${ip}:${new Date(now).toISOString().slice(0, 10)}`
  const n = Number(await env.RT_LIMIT.get(k)) || 0
  if (n >= 3) return false
  await env.RT_LIMIT.put(k, String(n + 1), { expirationTtl: 2 * 86400 })
  return true
}

async function mail(env, subject, text, replyTo) {
  const to = (env.ORDER_TO || env.CONTACT_TO || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!env.RESEND_API_KEY || !to.length) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.CONTACT_FROM || 'Hongdam <hongdam@send.motdang.net>', to, subject, text,
      ...(/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(replyTo) ? { reply_to: replyTo } : {}) }),
  }).catch(() => {})
}

async function book(ctx, b, now) {
  const { request, env } = ctx
  const kind = clean(b.kind, 20), site = clean(b.site, 160)
  const contact = clean(b.contact, 120), note = clean(b.note, 600)
  if (!Object.hasOwn(KINDS, kind)) return json({ ok: false, error: 'Pick one: ' + Object.keys(KINDS).join(', ') + '.' }, 400)
  if (site.length < 3) return json({ ok: false, error: 'Say which site, code project (repo) or subject the bot works on.' }, 400)
  if (contact.length < 3) return json({ ok: false, error: 'Give an email address or a LINE ID.' }, 400)
  const ip = request.headers.get('cf-connecting-ip') || ''
  if (!(await allowed(env, ip, now))) return json({ ok: false, error: 'Three purchases a day are allowed from one internet connection. Write to nan@motdang.net.' }, 429)
  const db = env.TASKS
  const c = await counts(db, kind)
  const price = walk(kind, c, OPENED, now)
  const week = slotWeek(kind, c, now)
  const ref = 'NB-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, '0').slice(-6)
  const pct = price.unit === '%' ? price.price : null
  await db.prepare('INSERT INTO bot_order (ref, kind, site, contact, note, baht, usd, pct, week, created_at, ip) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .bind(ref, kind, site, contact, note, price.baht, price.usd, pct, week, new Date(now).toISOString(), ip).run()
  const starts = Math.max(now, weekStart(week))
  const cost = pct ? `${pct}% of what it earns, first year, nothing to pay in advance` : `฿${price.baht.toLocaleString('en-US')} · US$${price.usd}${price.monthly ? ' a month' : ''}`
  const lines = [`${KINDS[kind].en} for ${site}`, cost,
    `Slot from ${new Date(starts).toISOString().slice(0, 10)}`, `Contact: ${contact}`, note && `Note: ${note}`, `Ref ${ref}`].filter(Boolean)
  ctx.waitUntil(Promise.all([tell(env, `Bots ${ref} · ${KINDS[kind].en}`, lines), mail(env, `Bots purchase ${ref} — ${KINDS[kind].en}`, lines.join('\n'), contact)]))
  return json({ ok: true, ref, kind, site, baht: price.baht, usd: price.usd, pct, monthly: price.monthly, slot_from: new Date(starts).toISOString(),
    pay: pct ? { line: PAY.line } : { ...PAY, paypal: `${PAY.paypal}/${price.usd}USD` } })
}

async function slip(ctx, now) {
  const { request, env } = ctx
  let form
  try { form = await request.formData() } catch { return json({ ok: false, why: 'nofile' }, 400) }
  const ref = clean(form.get('ref'), 12)
  const o = await env.TASKS.prepare('SELECT * FROM bot_order WHERE ref = ?').bind(ref).first()
  if (!o) return json({ ok: false, why: 'ref' }, 404)
  if (!o.baht) return json({ ok: false, why: 'off' })
  if (o.state === 'paid' || o.state === 'done') return json({ ok: true, ref, amount: o.baht })
  const r = await checkSlip(env, form.get('slip'), o.baht)
  if (!r.ok) return json({ ok: false, why: r.why })
  await env.TASKS.prepare("UPDATE bot_order SET state = 'paid', paid_ref = ? WHERE ref = ?").bind(r.transRef, ref).run()
  const lines = [`Paid ฿${o.baht} by PromptPay`, `${o.kind} for ${o.site}`, `Bank reference ${r.transRef}`, `Ref ${ref}`]
  ctx.waitUntil(Promise.all([tell(env, `Bots ${ref} paid · ${o.kind}`, lines), mail(env, `Paid: ฿${o.baht} · Bots ${ref}`, lines.join('\n'))]))
  return json({ ok: true, ref, amount: o.baht, at: now })
}

export async function onRequest(ctx) {
  const { request, env, params } = ctx
  const path = [].concat(params.path || [])
  const now = Date.now()
  if (request.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST', 'access-control-allow-headers': 'content-type' } })
  if (!env.TASKS) return json({ kinds: await prices(null, now), note: 'Purchases are not connected yet.' }, request.method === 'GET' ? 200 : 503)
  if (!path.length && request.method === 'GET')
    return json({ page: 'https://hongdam.net/bots/', rule: 'Weekly, Monday 00:00 Bangkok: purchases over 80% of slots, one rung up; under 60%, one rung down; at most three rungs from the opening price.', kinds: await prices(env.TASKS, now) })
  if (!path.length && request.method === 'POST') {
    let b
    try { b = await request.json() } catch { return json({ ok: false, error: 'Could not read that purchase.' }, 400) }
    return book(ctx, b, now)
  }
  if (path[0] === 'slip' && request.method === 'POST') return slip(ctx, now)
  return json({ error: 'Not found' }, 404)
}

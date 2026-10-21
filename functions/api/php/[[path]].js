/**
 * /api/php — bookings and Shoup prices for hongdam.net/php (PHP fix after PHP2Shell).
 *
 *   GET  /api/php                                         prices now, slots this week, the walk
 *   POST /api/php {kind, site, php?, contact, note?, owner}  a booking; the price is worked out here
 *   POST /api/php/slip  form: ref, slip                    a PromptPay slip, checked by SlipOK
 *
 * The booking form takes a site name and a contact; access is arranged after payment.
 * GET answers any origin; POST answers hongdam.net, hongdam.pages.dev and localhost.
 * Bindings and secrets on the Pages project: TASKS (D1), RT_LIMIT, DISCORD_TASKS,
 * SLIPOK_KEY + SLIPOK_BRANCH, RESEND_API_KEY + ORDER_TO or CONTACT_TO.
 */
import { KINDS, allCounts, pricesFrom, prices, slotWeek, RULE } from '../../_php.js'
import { weekStart, bkk } from '../../_github.js'
import { checkSlip } from '../pay/_verify.js'
import { tell } from '../../_tasks.js'

const json = (body, status = 200) => new Response(JSON.stringify(body, null, 1), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
})
const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const HOST = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,62}$/i
const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/
const PRIVATE = /^(?:0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/
const PAY = { promptpay: '0988239210', paypal: 'https://www.paypal.me/pfauhaus', wise: 'https://wise.com/pay/me/annikahonorahp', line: '@964yxgnk' }
const ORIGINS = ['https://hongdam.net', 'https://www.hongdam.net', 'https://hongdam.pages.dev']
const originOk = (o) => ORIGINS.includes(o) || /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(o)
const OLD = 'PHP older than 7.4 gets a price after a look. Message us on LINE @964yxgnk. · PHP เก่ากว่า 7.4 แจ้งราคาหลังจากดูเว็บแล้ว ทักไลน์ @964yxgnk'

// "https://www.example.com/shop?x=1" → "www.example.com"; a bare host, an IDN (to its xn-- form) or a public IPv4 stays as it is.
export function siteOf(v) {
  let s = clean(v, 300).toLowerCase().replace(/^[a-z][a-z0-9+.-]*:\/\//, '').replace(/^[^@/]*@/, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '').replace(/\.$/, '')
  if (!s) return ''
  try { s = new URL('http://' + s).hostname } catch { return '' }
  if (IPV4.test(s)) return PRIVATE.test(s) ? '' : s
  return HOST.test(s) ? s : ''
}
export const phpOf = (v) => (clean(v, 40).match(/(?<![\d.])[4-8]\.\d{1,2}(?:\.\d{1,3})?(?!\d)/) || [''])[0]
const oldPhp = (php) => { const [a, b] = php.split('.').map(Number); return a * 100 + b < 704 }

async function allowed(env, ip, now) {
  if (!env.RT_LIMIT) return true
  const k = `php:${ip}:${new Date(now).toISOString().slice(0, 10)}`
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

const code = (s) => '`' + s.replace(/`/g, '') + '`'
const newRef = () => 'PHP-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, '0').slice(-6)

async function book(ctx, b, now) {
  const { request, env } = ctx
  const kind = clean(b.kind, 20), site = siteOf(b.site), php = phpOf(b.php)
  const contact = clean(b.contact, 120), note = clean(b.note, 600)
  if (!Object.hasOwn(KINDS, kind)) return json({ ok: false, error: 'Pick one of the four kinds. · เลือกหนึ่งในสี่แบบ' }, 400)
  if (!site) return json({ ok: false, error: 'One website address or server name, for example example.com; put others in the note. · ใส่ชื่อเว็บหรือเซิร์ฟเวอร์เพียงหนึ่งชื่อ เช่น example.com ส่วนชื่ออื่นใส่ในช่องหมายเหตุ' }, 400)
  if (contact.length < 3) return json({ ok: false, error: 'Leave an email or a LINE ID. · ใส่อีเมลหรือไลน์ไอดี' }, 400)
  if (b.owner !== true) return json({ ok: false, error: 'Tick the box: I own this site or server, or its owner has said I may change it. · ติ๊กช่องยืนยัน: เป็นเจ้าของเว็บหรือเซิร์ฟเวอร์นี้ หรือเจ้าของอนุญาตให้แก้ไขได้' }, 400)
  if (kind === 'upgrade' && php && oldPhp(php)) return json({ ok: false, quote: true, error: OLD, line: PAY.line })
  const ip = request.headers.get('cf-connecting-ip') || ''
  if (!(await allowed(env, ip, now))) return json({ ok: false, error: 'Three bookings a day from one address. Write to nan@motdang.net. · จองได้วันละสามครั้งต่อหนึ่งไอพี (IP address) หากต้องการจองเพิ่ม เขียนมาที่ nan@motdang.net' }, 429)
  const db = env.TASKS
  const cs = await allCounts(db, now)
  const price = pricesFrom(cs, now).find((p) => p.id === kind)
  const week = slotWeek(kind, cs[kind], now)
  let ref = ''
  for (let i = 0; i < 3 && !ref; i++) {
    const r = newRef()
    try {
      await db.prepare('INSERT INTO php_order (ref, kind, site, php, contact, note, baht, usd, week, created_at, ip) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .bind(r, kind, site, php || null, contact, note, price.baht, price.usd, week, new Date(now).toISOString(), null).run()
      ref = r
    } catch { /* a ref taken, or the database busy: try another */ }
  }
  if (!ref) return json({ ok: false, error: 'The booking did not go through. Write to nan@motdang.net. · จองไม่สำเร็จ เขียนมาที่ nan@motdang.net' }, 500)
  const starts = Math.max(now, weekStart(week))
  const lines = [`${KINDS[kind].en}: ${site}`, php && `PHP reported: ${php}`, `฿${price.baht.toLocaleString('en-US')} · US$${price.usd}`,
    `Slot from ${bkk(starts)}`, `Contact: ${code(contact)}`, note && `Note: ${code(note)}`, `Ref ${ref}`].filter(Boolean)
  ctx.waitUntil(Promise.all([tell(env, `PHP ${ref} · ${site}`, lines), mail(env, `PHP fix booking ${ref} — ${site}`, lines.join('\n'), contact)]))
  return json({ ok: true, ref, kind, site, baht: price.baht, usd: price.usd, slot_from: new Date(starts).toISOString(),
    pay: { ...PAY, paypal: `${PAY.paypal}/${price.usd}USD` } })
}

async function slip(ctx, now) {
  const { request, env } = ctx
  let form
  try { form = await request.formData() } catch { return json({ ok: false, why: 'nofile' }, 400) }
  const ref = clean(form.get('ref'), 12)
  const o = await env.TASKS.prepare('SELECT * FROM php_order WHERE ref = ?').bind(ref).first()
  if (!o) return json({ ok: false, why: 'ref' }, 404)
  if (o.state === 'paid' || o.state === 'done') return json({ ok: true, ref, amount: o.baht })
  if (o.state !== 'booked') return json({ ok: false, why: 'state' })
  const r = await checkSlip(env, form.get('slip'), o.baht)
  if (!r.ok) return json({ ok: false, why: r.why })
  const u = await env.TASKS.prepare("UPDATE php_order SET state = 'paid', paid_ref = ? WHERE ref = ? AND state = 'booked'").bind(r.transRef, ref).run()
  if (u?.meta?.changes === 0) return json({ ok: false, why: 'state' })
  const lines = [`Paid ฿${o.baht} by PromptPay`, `${KINDS[o.kind]?.en || o.kind}: ${o.site}`, `Bank reference ${r.transRef}`, `Ref ${ref}`]
  ctx.waitUntil(Promise.all([tell(env, `PHP ${ref} paid · ${o.site}`, lines), mail(env, `Paid: ฿${o.baht} · PHP ${ref}`, lines.join('\n'))]))
  return json({ ok: true, ref, amount: o.baht, at: now })
}

async function handle(ctx, now) {
  const { request, env, params } = ctx
  const path = [].concat(params.path || [])
  if (!env.TASKS) return json({ kinds: await prices(null, now), note: 'Bookings are not connected yet.' }, request.method === 'GET' ? 200 : 503)
  if (!path.length && request.method === 'GET') return json({ page: 'https://hongdam.net/php/', rule: RULE, kinds: await prices(env.TASKS, now) })
  if (!path.length && request.method === 'POST') {
    let b
    try { b = await request.json() } catch { return json({ ok: false, error: 'Could not read that booking.' }, 400) }
    if (!b || typeof b !== 'object' || Array.isArray(b)) return json({ ok: false, error: 'Could not read that booking.' }, 400)
    return book(ctx, b, now)
  }
  if (path[0] === 'slip' && request.method === 'POST') return slip(ctx, now)
  return json({ error: 'Not here' }, 404)
}

export async function onRequest(ctx) {
  const { request } = ctx
  const origin = request.headers.get('origin')
  if (request.method === 'OPTIONS') {
    if (!origin || !originOk(origin)) return new Response(null, { status: 403 })
    return new Response(null, { status: 204, headers: { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET,POST', 'access-control-allow-headers': 'content-type', vary: 'origin' } })
  }
  if (request.method === 'POST' && origin && !originOk(origin)) return json({ ok: false, error: 'This booking form works from hongdam.net. · ฟอร์มจองใช้ได้จาก hongdam.net' }, 403)
  const res = await handle(ctx, Date.now())
  if (request.method === 'GET') res.headers.set('access-control-allow-origin', '*')
  else if (origin) { res.headers.set('access-control-allow-origin', origin); res.headers.set('vary', 'origin') }
  return res
}

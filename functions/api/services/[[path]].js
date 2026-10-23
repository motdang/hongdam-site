/**
 * /api/services — Shoup prices for the services list at hongdam.net/ and /th/.
 *
 *   GET  /api/services                       every walking service: price now, floor, ceiling, slots, orders this month, the walk
 *   POST /api/services/order {svc, note?}    an order the team took on LINE or the phone      Authorization: Bearer TASKS_ADMIN
 *   POST /api/services/price {svc, baht}     the Desk bot's price for a service it walks (Grab)  Authorization: Bearer TASKS_ADMIN
 *
 * Orders through the page's form are recorded by /api/contact. GET answers any origin.
 */
import { SERVICES, RULE, prices, record, OPENED_MONTH, monthName } from '../../_services.js'

const json = (body, status = 200) => new Response(JSON.stringify(body, null, 1), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
})
const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')

export async function onRequest({ request, env, params }) {
  const db = env.TASKS, now = Date.now()
  const path = (params.path || []).join('/')
  if (request.method === 'GET' && !path) {
    return json({ page: 'https://hongdam.net/', rule: RULE, first_month: monthName(OPENED_MONTH), kinds: await prices(db, now) })
  }
  if (request.method !== 'POST') return json({ error: 'No such route' }, 404)
  const key = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!env.TASKS_ADMIN || key !== env.TASKS_ADMIN) return json({ error: 'Key' }, 401)
  let b
  try { b = await request.json() } catch { return json({ error: 'JSON body' }, 400) }
  const svc = clean(b.svc, 40), s = SERVICES[svc]
  if (!s) return json({ error: 'No such service', services: Object.keys(SERVICES) }, 400)

  if (path === 'order') {
    if (s.walk === 'desk') return json({ error: 'The Desk bot counts this one' }, 400)
    const ok = await record(db, svc, 'team:' + (clean(b.note, 60) || now), 'desk', now)
    return json({ ok }, ok ? 200 : 500)
  }
  if (path === 'price') {
    const baht = Number(b.baht)
    if (s.walk !== 'desk') return json({ error: 'The site walks this one' }, 400)
    if (!Number.isInteger(baht) || baht < s.floor || baht > s.ceiling) return json({ error: `Between ${s.floor} and ${s.ceiling}` }, 400)
    try {
      await db.prepare('INSERT INTO svc_price (svc, baht, created_at) VALUES (?, ?, ?)').bind(svc, baht, new Date(now).toISOString()).run()
    } catch { return json({ error: 'Not stored' }, 500) }
    return json({ ok: true })
  }
  return json({ error: 'No such route' }, 404)
}

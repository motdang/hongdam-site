/**
 * /api/hit — what people do on hongdam.net's pages, for Nan's /stats/ page.
 *
 *   POST /api/hit {s, ev: [{k, p, l, d, n, r, w}]}   from /assets/hd.js (sendBeacon, text/plain)
 *   GET  /api/hit/stats?days=7                       the counts            Authorization: Bearer TASKS_ADMIN
 *
 * A row per event in D1 table `hit` (migrations/0008_hit.sql). Requests a robot sends, by
 * functions/_classify.js, are answered and not written. Orders are read from svc_buy (0007).
 *
 * D1's daily write allowance is shared with the orders in svc_buy, so a post is counted (functions/_tries.js)
 * against two daily caps, one per address and one for the whole site, before its rows are written: at most
 * EVENTS rows a post, PER_DAY posts a day. A count goes up even when it is refused, so each instance also
 * remembers, until the Bangkok day turns, the addresses it has refused and whether the site cap is spent, and
 * stops writing counts for them.
 */
import { classify } from '../../_classify.js'
import { tryOnce, sweep } from '../../_tries.js'

const EVENTS = 20, PER_ADDRESS = 150, PER_DAY = 1500
let shut = { day: '', all: false, ips: new Set() }

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
})
const KINDS = new Set(['view', 'search', 'tap', 'line', 'lang', 'mail', 'out', 'order', 'pay', 'claim', 'slip', 'ask', 'egg'])
const str = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : null)
const int = (v, max) => (Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : null)
const bkkDay = (t = Date.now()) => new Date(t + 7 * 3600e3).toISOString().slice(0, 10)
const ORIGINS = ['https://hongdam.net', 'https://www.hongdam.net', 'https://hongdam.pages.dev']
// Browsers send Origin with every POST, sendBeacon's included
const originOk = (o) => !!o && (ORIGINS.includes(o) || /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(o))

export async function onRequestPost({ request, env }) {
  if (!env.TASKS) return new Response(null, { status: 204 })
  if (!originOk(request.headers.get('origin'))) return new Response(null, { status: 204 })
  const { category } = classify(request.headers.get('user-agent') || '', { asn: request.cf?.asn, headers: request.headers })
  if (category !== 'human') return new Response(null, { status: 204 })
  let body
  try {
    const text = await request.text()
    if (text.length > 16000) return new Response(null, { status: 413 })
    body = JSON.parse(text)
  } catch {
    return new Response(null, { status: 400 })
  }
  const s = str(body && body.s, 16)
  const ev = Array.isArray(body && body.ev) ? body.ev.slice(0, EVENTS) : []
  if (!s || !/^[a-z0-9]{6,16}$/.test(s) || !ev.length) return new Response(null, { status: 400 })
  const at = new Date().toISOString(), day = bkkDay(), c = (request.cf && request.cf.country) || null
  const rows = []
  for (const e of ev) {
    const k = str(e && e.k, 12), p = str(e && e.p, 160)
    if (!k || !KINDS.has(k) || !p || p[0] !== '/') continue
    rows.push(env.TASKS.prepare('INSERT INTO hit (at, day, s, k, p, l, d, n, r, c, w) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(at, day, s, k, p, str(e.l, 5), str(e.d, 120), int(e.n, 999), str(e.r, 80), c, int(e.w, 9999)))
  }
  if (!rows.length) return new Response(null, { status: 204 })
  const ip = request.headers.get('cf-connecting-ip') || 'unknown'
  if (shut.day !== day) shut = { day, all: false, ips: new Set() }
  if (shut.all || shut.ips.has(ip)) return new Response(null, { status: 204 })
  if (!(await tryOnce(env.TASKS, [['hit:ip:' + ip, PER_ADDRESS], ['hit:all', PER_DAY]]))) {
    shut.ips.add(ip)
    try {   // a read, not a write: is it the site's cap that is spent?
      const r = await env.TASKS.prepare("SELECT n FROM tries WHERE k = 'hit:all' AND day = ?").bind(day).first()
      if (!r || r.n > PER_DAY) shut.all = true
    } catch { shut.all = true }
    return new Response(null, { status: 204 })
  }
  try {
    await env.TASKS.batch(rows)
    // A year and a bit is kept; the trim (and the counters' sweep) runs on about one post in a hundred.
    if (Math.random() < 0.01) { await env.TASKS.prepare('DELETE FROM hit WHERE day < ?').bind(bkkDay(Date.now() - 400 * 864e5)).run(); await sweep(env.TASKS) }
  } catch { /* table not there yet (0008): the visitor's page is not the place to say so */ }
  return new Response(null, { status: 204 })
}

export async function onRequestGet({ request, env, params }) {
  const what = (params.path || []).join('/')
  if (what !== 'stats') return json({ error: 'Not here' }, 404)
  const key = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!env.TASKS_ADMIN || key !== env.TASKS_ADMIN) return json({ error: 'Key' }, 401)
  if (!env.TASKS) return json({ error: 'No database' }, 503)
  const days = Math.max(1, Math.min(400, parseInt(new URL(request.url).searchParams.get('days') || '7', 10) || 7))
  const from = bkkDay(Date.now() - (days - 1) * 864e5)
  const q = (sql, ...b) => env.TASKS.prepare(sql).bind(from, ...b).all().then((r) => r.results || [])
  let parts
  try {
    parts = await Promise.all([
    q("SELECT day, SUM(k='view') views, COUNT(DISTINCT s) visits FROM hit WHERE day >= ? GROUP BY day ORDER BY day"),
    q("SELECT p, COUNT(*) views, COUNT(DISTINCT s) visits FROM hit WHERE day >= ? AND k='view' GROUP BY p ORDER BY views DESC LIMIT 40"),
    q("SELECT l, COUNT(*) views FROM hit WHERE day >= ? AND k='view' GROUP BY l ORDER BY views DESC"),
    q("SELECT c, COUNT(DISTINCT s) visits FROM hit WHERE day >= ? AND k='view' GROUP BY c ORDER BY visits DESC LIMIT 25"),
    q("SELECT r, COUNT(DISTINCT s) visits FROM hit WHERE day >= ? AND k='view' AND r IS NOT NULL AND r != '' GROUP BY r ORDER BY visits DESC LIMIT 25"),
    q("SELECT CASE WHEN w < 480 THEN 'phone' WHEN w < 1024 THEN 'tablet' ELSE 'computer' END kind, COUNT(DISTINCT s) visits FROM hit WHERE day >= ? AND k='view' AND w IS NOT NULL GROUP BY kind ORDER BY visits DESC"),
    q("SELECT lower(d) d, COUNT(*) times, ROUND(AVG(n), 1) found FROM hit WHERE day >= ? AND k='search' GROUP BY lower(d) ORDER BY times DESC LIMIT 40"),
    q("SELECT lower(d) d, COUNT(*) times FROM hit WHERE day >= ? AND k='search' AND n = 0 GROUP BY lower(d) ORDER BY times DESC LIMIT 40"),
    q("SELECT d, COUNT(*) times, COUNT(DISTINCT s) visits FROM hit WHERE day >= ? AND k='tap' GROUP BY d ORDER BY times DESC LIMIT 40"),
    q("SELECT p, COUNT(*) times FROM hit WHERE day >= ? AND k='line' GROUP BY p ORDER BY times DESC LIMIT 25"),
    q("SELECT d, COUNT(*) times FROM hit WHERE day >= ? AND k='lang' GROUP BY d ORDER BY times DESC"),
    q("SELECT d, COUNT(*) times FROM hit WHERE day >= ? AND k='out' GROUP BY d ORDER BY times DESC LIMIT 25"),
    q("SELECT d, COUNT(*) times FROM hit WHERE day >= ? AND k='egg' GROUP BY d ORDER BY times DESC"),
    q("SELECT k, COUNT(*) times, COUNT(DISTINCT s) visits FROM hit WHERE day >= ? AND k IN ('order','pay','claim','slip','ask','mail') GROUP BY k"),
    q("SELECT COUNT(DISTINCT s) visits, COUNT(DISTINCT CASE WHEN k IN ('tap','line','mail') THEN s END) tapped, COUNT(DISTINCT CASE WHEN k IN ('order','ask') THEN s END) ordered FROM hit WHERE day >= ?"),
    ])
  } catch (e) {
    return json({ error: 'The hit table is not there yet: apply migrations/0008_hit.sql to D1 hongdam-tasks.' }, 503)
  }
  const [byDay, pages, langs, countries, refs, widths, searches, empty, taps, lines, langSwitch, outs, eggs, steps, funnel] = parts
  let orders = { states: [], recent: [] }
  try {
    const since = from + 'T00:00:00'
    const o = (sql) => env.TASKS.prepare(sql).bind(since).all().then((r) => r.results || [])
    const [states, recent] = await Promise.all([
      o('SELECT state, cur, COUNT(*) n, SUM(due) due, SUM(total) total FROM svc_buy WHERE created_at >= ? GROUP BY state, cur ORDER BY n DESC'),
      o('SELECT ref, card, opt, qty, due, total, cur, lang, state, created_at FROM svc_buy WHERE created_at >= ? ORDER BY id DESC LIMIT 20'),
    ])
    orders = { states, recent }
  } catch { /* svc_buy not there yet (0007) */ }
  return json({ ok: true, days, from, byDay, funnel: funnel[0] || {}, pages, langs, countries, refs, widths, searches, empty, taps, lines, langSwitch, outs, steps, eggs, orders })
}

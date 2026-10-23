/**
 * Prices for the services list at hongdam.net/ and /th/, priced by Shoup.
 * Data: functions/_services_data.js, written by tools/build_services.py from data/services.json.
 * API: functions/api/services/[[path]].js. Table: migrations/0006_services.sql.
 *
 * SHOUP (Donald Shoup, The High Cost of Free Parking; SFpark's rule), monthly.
 * Each service has slots a month: the orders the team can take. On the 1st, 00:00 Bangkok,
 * the month just ended is checked: orders over slots. Over 80%: one step up the ladder.
 * Under 60%: one step down. Between: no change. Never past the service's floor or ceiling.
 * An order is a request for that service through the form on the page (one per contact per
 * service per month) or one the team logs from LINE or the phone. The walk starts with
 * the first whole month (OPENED); the first check reads that month. A service marked pct
 * (sourcing) is a share of the goods' value and walks on PCT_LADDER; one marked usd walks in US$ on
 * USD_LADDER. A tail is a second price that moves with the first ("฿1,500 up to 5 pages, then ฿500 a page").
 *
 * Services marked walk "desk" (Grab) are walked by the Hongdam Desk bot (hongdam-desk/grab.py);
 * the bot posts its price here and the page shows it.
 */
import { LADDER, PCT_LADDER, USD_LADDER, SERVICES, OPENED } from './_services_data.js'

export { SERVICES }
export const RULE = 'Monthly, on the 1st at 00:00 Bangkok: orders last month over 80% of the slots, one step up the ladder; under 60%, one step down; between, no change. Each service stays between its own floor and ceiling.'

// Months counted in Bangkok time: year * 12 + month (0-11).
export const monthOf = (t) => { const d = new Date(t + 7 * 3600e3); return d.getUTCFullYear() * 12 + d.getUTCMonth() }
export const monthStart = (m) => Date.UTC(Math.floor(m / 12), m % 12, 1) - 7 * 3600e3
export const monthName = (m) => new Date(monthStart(m) + 7 * 3600e3).toISOString().slice(0, 7)
export const ladderOf = (id) => (SERVICES[id].pct ? PCT_LADDER : SERVICES[id].usd ? USD_LADDER : LADDER)
// A two-part price (tail): the second number moves with the first, by the same ratio, on LADDER.
export const tailOf = (s, price) => (s.tail ? LADDER[rungOf((s.tail * price) / s.open, LADDER)] : undefined)
export const rungOf = (b, L = LADDER) => L.reduce((best, v, i) => (Math.abs(v - b) < Math.abs(L[best] - b) ? i : best), 0)
export const OPENED_MONTH = monthOf(Date.parse(OPENED + 'T00:00:00+07:00'))

/** The walk for one service. counts: {month number: orders}. */
export function walk(id, counts, now, from = OPENED_MONTH) {
  const s = SERVICES[id], L = ladderOf(id), r0 = rungOf(s.open, L), lo = rungOf(s.floor, L), hi = rungOf(s.ceiling, L)
  let r = r0
  const steps = []
  for (let m = from; m < monthOf(now); m++) {
    const n = counts[m] || 0, occ = n / s.slots
    const want = occ > 0.8 ? 1 : occ < 0.6 ? -1 : 0
    const nr = Math.max(lo, Math.min(hi, r + want))
    steps.push({ month: monthName(m), orders: n, slots: s.slots, move: nr - r, price: L[nr] })
    r = nr
  }
  const m = monthOf(now)
  return {
    id, ...(s.pct ? { unit: '%', price: L[r] } : s.usd ? { unit: 'USD', price: L[r] } : { baht: L[r], price: L[r] }),
    ...(s.tail ? { tail: tailOf(s, L[r]), tail_unit: s.tail_usd ? 'USD' : 'THB' } : {}), opened: L[r0], floor: L[lo], ceiling: L[hi],
    slots: s.slots, orders: counts[m] || 0,
    next_check: new Date(monthStart(Math.max(m, from) + 1)).toISOString(),
    steps: steps.slice(-12),
  }
}

/** {service: {month: orders}} from svc_order; one order per contact per service per month. */
export async function allCounts(db) {
  const out = {}
  if (!db) return out
  try {
    const rows = (await db.prepare("SELECT svc, month, COUNT(DISTINCT who) n FROM svc_order WHERE state != 'void' GROUP BY svc, month").all()).results
    for (const x of rows) (out[x.svc] ||= {})[x.month] = x.n
  } catch { /* no table yet: every month reads as no orders */ }
  return out
}

/** Prices the Desk bot posted for its own services (walk "desk"). */
export async function deskPrices(db) {
  if (!db) return {}
  try {
    const rows = (await db.prepare('SELECT svc, baht FROM svc_price WHERE id IN (SELECT MAX(id) FROM svc_price GROUP BY svc)').all()).results
    return Object.fromEntries(rows.map((x) => [x.svc, x.baht]))
  } catch { return {} }
}

export function pricesFrom(counts, desk, now) {
  return Object.keys(SERVICES).map((id) => {
    const s = SERVICES[id]
    if (s.walk === 'desk') { const b = desk[id] || s.open; return { id, baht: b, price: b, opened: s.open, walked_by: 'hongdam-desk grab.py' } }
    return walk(id, counts[id] || {}, now)
  })
}

export async function prices(db, now) {
  return pricesFrom(await allCounts(db), await deskPrices(db), now)
}

/** Record one order. src: form · desk. who: a short hash of the contact, or the team's note. */
export async function record(db, svc, who, src, now = Date.now()) {
  if (!db || !SERVICES[svc] || SERVICES[svc].walk === 'desk') return false
  try {
    await db.prepare('INSERT INTO svc_order (svc, month, who, src, state, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(svc, monthOf(now), who, src, 'asked', new Date(now).toISOString()).run()
    return true
  } catch { return false }
}

export async function whoHash(contact) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(contact.trim().toLowerCase()))
  return [...new Uint8Array(d)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('')
}

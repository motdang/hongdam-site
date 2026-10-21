/**
 * hongdam.net/php — PHP fix after PHP2Shell (CVE-2026-109618, CVE-2026-109619), priced by Shoup.
 * Page docs/php/index.html, JSON functions/api/php/[[path]].js, table migrations/0005_php.sql.
 *
 * SHOUP, the same rule as /github (functions/_github.js): each kind has slots a week.
 * Every Monday 00:00 Bangkok the week just ended is checked: bookings over its slots.
 * Over 80%: one rung up. Under 60%: one rung down. Between: no change. At most three
 * rungs either way from where it opened, and never past the kind's own floor and ceiling.
 * The four ranges overlap, so after the walk the prices are related (relate()): a hosted
 * site costs no more than a server; an upgrade costs at least a server; five servers cost
 * at least the rung above a server. Prices sit on the task board's ladder. The US$ price
 * is the baht at 33 to the dollar, rounded to the nearest US$5 (usd() here, not the one in
 * _github.js, which /github uses). Opening prices and slots are a session's picks under
 * Nan's standing Shoup word (2026-10-15), asked for on 2026-10-22:
 * "Add a Hongdam offer to patch PHP servers, with a price on a Shoup ladder."
 */
import { L, rungOf, weekOf, weekStart, bkk } from './_github.js'

const REACH = 3

export const KINDS = {
  hosted: { open: 3000, floor: 1500, ceiling: 10000, slots: 8, en: 'Hosted site', th: 'เว็บบนโฮสติ้ง' },
  server: { open: 5000, floor: 3000, ceiling: 20000, slots: 4, en: 'Server', th: 'เซิร์ฟเวอร์' },
  upgrade: { open: 10000, floor: 5000, ceiling: 30000, slots: 3, en: 'Upgrade', th: 'อัปเกรด PHP' },
  fleet: { open: 20000, floor: 10000, ceiling: 50000, slots: 1, en: 'Five servers', th: 'ห้าเซิร์ฟเวอร์' },
}

export const RULE = 'Weekly, Monday 00:00 Bangkok: bookings over 80% of slots, one rung up; under 60%, one rung down; each kind stays between its own floor and ceiling. A hosted site costs no more than a server, an upgrade at least a server, five servers at least the rung above a server.'

export const usd = (baht) => Math.round(baht / 33 / 5) * 5

/** The walk for one kind. counts: {week number: bookings}; `from` is the week the price opened. */
export function walk(kind, counts, from, now) {
  const k = KINDS[kind], r0 = rungOf(k.open)
  const lo = Math.max(0, r0 - REACH, rungOf(k.floor)), hi = Math.min(L.length - 1, r0 + REACH, rungOf(k.ceiling))
  let r = r0
  const steps = []
  for (let w = from; w < weekOf(now); w++) {
    const n = counts[w] || 0, occ = n / k.slots
    const want = occ > 0.8 ? 1 : occ < 0.6 ? -1 : 0
    const nr = Math.max(lo, Math.min(hi, r + want))
    steps.push({ week: bkk(weekStart(w)), booked: n, slots: k.slots, move: nr - r, baht: L[nr] })
    r = nr
  }
  const w = weekOf(now)
  return {
    id: kind, en: k.en, th: k.th, baht: L[r], usd: usd(L[r]), own: L[r], opened: L[r0],
    floor: L[lo], ceiling: L[hi],
    slots: k.slots, booked: counts[w] || 0, next_slot: bkk(Math.max(now, weekStart(slotWeek(kind, counts, now)))),
    next_check: new Date(weekStart(Math.max(w, OPENED) + 1)).toISOString(),
    steps: steps.slice(-12),
  }
}

/** Walked prices (an array from walk()) related to one another. Server first; the rest follow it. */
export function relate(list) {
  const by = Object.fromEntries(list.map((p) => [p.id, p]))
  const server = by.server.own
  const set = (p, baht) => { p.baht = baht; p.usd = usd(baht) }
  if (by.hosted) set(by.hosted, Math.min(by.hosted.own, server))
  if (by.upgrade) set(by.upgrade, Math.max(by.upgrade.own, server))
  if (by.fleet) set(by.fleet, Math.max(by.fleet.own, L[Math.min(L.length - 1, rungOf(server) + 1)]))
  return list
}

// The week a new booking lands in: this one if a slot is free, else the first that has one.
export function slotWeek(kind, counts, now) {
  let w = weekOf(now)
  while ((counts[w] || 0) >= KINDS[kind].slots) w++
  return w
}

// Opened Thursday 2026-10-22. The walk starts with the first whole week, from Monday 26 October,
// so the first check (Monday 2 November) reads seven days of bookings, not three and a half.
export const OPENED = weekOf(Date.parse('2026-10-26T00:00:00+07:00'))

const HOLD = 48 * 3600e3

// Paid and done bookings count; an unpaid one counts for 48 hours.
export async function counts(db, kind, now = Date.now()) {
  const rows = (await db.prepare("SELECT week, COUNT(*) n FROM php_order WHERE kind = ? AND (state IN ('paid','done') OR (state = 'booked' AND created_at > ?)) GROUP BY week")
    .bind(kind, new Date(now - HOLD).toISOString()).all()).results
  return Object.fromEntries(rows.map((x) => [x.week, x.n]))
}

export async function allCounts(db, now) {
  const out = {}
  for (const kind of Object.keys(KINDS)) out[kind] = db ? await counts(db, kind, now) : {}
  return out
}

export const pricesFrom = (cs, now) => relate(Object.keys(KINDS).map((kind) => walk(kind, cs[kind] || {}, OPENED, now)))

export async function prices(db, now) {
  return pricesFrom(await allCounts(db, now), now)
}

/**
 * hongdam.net/bots — the bots built the day a bot sold us a road. Priced by Shoup.
 * Page docs/bots/index.html, JSON functions/api/bots/[[path]].js, table migrations/0003_bots.sql.
 * Nan 2026-10-18: "Clear call to action is 'purchase this product(s)'. Pricing is fully
 * shoupified, all avenues to revenue explored."
 *
 * SHOUP, the same rule as /github (functions/_github.js): each kind has slots a week.
 * Every Monday 00:00 Bangkok the week just ended is checked: purchases over its slots.
 * Over 80%: one rung up. Under 60%: one rung down. Between: no change. At most three
 * rungs either way from where it opened. Baht prices sit on the task board's ladder;
 * the share kind walks a ladder of percentages instead. Opening prices and slots are
 * a session's picks under her standing Shoup word (2026-10-15).
 */
import { GRAPH } from './api/_taskgraph.js'

export const L = GRAPH.ladder
export const PCT = [5, 10, 15, 20, 25, 30, 40, 50]
const USD = [1, 2, 3, 5, 10, 20, 30, 50, 100, 150, 200, 300, 500, 1000, 1500, 2000, 3000, 5000, 10000]
const REACH = 3
const DAY = 864e5, WEEK = 7 * DAY
const MONDAY0 = Date.UTC(1970, 0, 5) - 7 * 3600e3

export const KINDS = {
  scout: { open: 5000, slots: 5, en: 'Scout', th: 'สเกาต์' },
  desk: { open: 10000, slots: 3, en: 'Bot Bounty Desk', th: 'โต๊ะค่าหัวบอท' },
  earner: { open: 30000, slots: 1, en: 'Earner', th: 'บอทหาเงิน' },
  run: { open: 3000, slots: 10, en: 'We run it for you, per month', th: 'เราดูแลให้ รายเดือน', monthly: true },
  share: { open: 20, slots: 2, en: 'Earner for a share of its income', th: 'บอทหาเงิน แบ่งรายได้', ladder: PCT, unit: '%' },
  crew: { open: 20000, slots: 2, en: 'One team day on an impossible problem', th: 'ทีมหนึ่งวัน กับโจทย์ที่เป็นไปไม่ได้' },
}

const ladderOf = (k) => KINDS[k].ladder || L
export const rungOf = (lad, b) => lad.reduce((best, v, i) => (Math.abs(v - b) < Math.abs(lad[best] - b) ? i : best), 0)
export const usd = (b) => USD.reduce((best, v) => (Math.abs(v - b / 33) < Math.abs(best - b / 33) ? v : best), USD[0])
export const weekOf = (t) => Math.floor((t - MONDAY0) / WEEK)
export const weekStart = (w) => MONDAY0 + w * WEEK
export const bkk = (t) => new Date(t + 7 * 3600e3).toISOString().slice(0, 10)

export function walk(kind, counts, from, now) {
  const k = KINDS[kind], lad = ladderOf(kind), r0 = rungOf(lad, k.open)
  let r = r0
  const steps = []
  for (let w = from; w < weekOf(now); w++) {
    const n = counts[w] || 0, occ = n / k.slots
    const want = occ > 0.8 ? 1 : occ < 0.6 ? -1 : 0
    const nr = Math.max(0, Math.min(lad.length - 1, Math.max(r0 - REACH, Math.min(r0 + REACH, r + want))))
    steps.push({ week: bkk(weekStart(w)), bought: n, slots: k.slots, move: nr - r, price: lad[nr] })
    r = nr
  }
  const w = weekOf(now), pct = k.unit === '%'
  return {
    id: kind, en: k.en, th: k.th, unit: pct ? '%' : 'THB', monthly: !!k.monthly,
    price: lad[r], baht: pct ? 0 : lad[r], usd: pct ? 0 : usd(lad[r]), opened: lad[r0],
    floor: lad[Math.max(0, r0 - REACH)], ceiling: lad[Math.min(lad.length - 1, r0 + REACH)],
    slots: k.slots, bought: counts[w] || 0, next_check: new Date(weekStart(w + 1)).toISOString(),
    steps: steps.slice(-12),
  }
}

export function slotWeek(kind, counts, now) {
  let w = weekOf(now)
  while ((counts[w] || 0) >= KINDS[kind].slots) w++
  return w
}

export const OPENED = weekOf(Date.parse('2026-10-19T00:00:00+07:00'))

export async function counts(db, kind) {
  const rows = (await db.prepare("SELECT week, COUNT(*) n FROM bot_order WHERE kind = ? AND state != 'void' GROUP BY week").bind(kind).all()).results
  return Object.fromEntries(rows.map((x) => [x.week, x.n]))
}

export async function prices(db, now) {
  const out = []
  for (const kind of Object.keys(KINDS)) out.push(walk(kind, db ? await counts(db, kind) : {}, OPENED, now))
  return out
}

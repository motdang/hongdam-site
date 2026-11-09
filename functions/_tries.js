/**
 * Daily try counters in D1 (table tries, migrations/0010_tries.sql), for routes that call paid
 * services: the PromptPay slip check and the PayPal/Wise payment claim on /api/buy. One statement per
 * key adds one and returns the new count, so two requests at once cannot both pass the same quota
 * (CodeRabbit on #52: KV read-then-write and an in-memory Map are not atomic).
 */

const day = (now) => new Date(now + 7 * 3600e3).toISOString().slice(0, 10)

/** Count one try against each [key, limit]; true while every count stays within its limit. */
export async function tryOnce(db, pairs, now = Date.now()) {
  if (!db) return false
  const d = day(now)
  try {
    const stmt = db.prepare('INSERT INTO tries (k, day, n) VALUES (?, ?, 1) ON CONFLICT(k, day) DO UPDATE SET n = n + 1 RETURNING n')
    const rows = await db.batch(pairs.map(([k]) => stmt.bind(k, d)))
    return rows.every((r, i) => (r.results?.[0]?.n ?? Infinity) <= pairs[i][1])
  } catch {
    return false // no table, or D1 unreachable: refuse rather than send the slip on unchecked
  }
}

/** Rows older than yesterday, removed now and then. */
export async function sweep(db, now = Date.now()) {
  try { await db.prepare('DELETE FROM tries WHERE day < ?').bind(day(now - 864e5)).run() } catch { /* next time */ }
}

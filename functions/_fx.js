/**
 * Exchange rates for prices shown in US dollars or euros (her ask 2026-10-24: "a toggle for dollars/euro/baht
 * on hongdam.net"). Baht per dollar and per euro come from the European Central Bank's daily reference rates
 * through Frankfurter (no key), with open.er-api.com as the spare. The answer is cached for an hour; the last
 * good one is kept in RT_LIMIT (KV) and used, marked stale, while both feeds are down.
 *
 * conv() is the arithmetic of docs/assets/cur.js: through baht, rounded up to a whole unit. The page and
 * /api/buy reach the same numbers from the same rates.
 */
export const CURS = ['THB', 'USD', 'EUR']
const FEED = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=THB,EUR'
const SPARE = 'https://open.er-api.com/v6/latest/USD'
const KEY = 'fx:last'
const HOUR = 3600e3

/** n in from, in to: through baht, rounded up to a whole unit. null when a rate is missing. */
export function conv(n, from, to, rates) {
  if (from === to || !n) return n
  if (!rates || !(rates[from] > 0) || !(rates[to] > 0)) return null
  return Math.ceil(n * rates[from] / rates[to] - 1e-9)
}

const sane = (r) => r && r.USD > 20 && r.USD < 60 && r.EUR > 20 && r.EUR < 70
const shape = (thbPerUsd, eurPerUsd, at, src) => {
  const rates = { THB: 1, USD: +thbPerUsd.toFixed(4), EUR: +(thbPerUsd / eurPerUsd).toFixed(4) }
  return sane(rates) ? { rates, at, src } : null
}

async function getJSON(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error(`${r.status} from ${new URL(url).host}`)
  return r.json()
}

async function fromFeed() {
  const j = await getJSON(FEED)
  return shape(j.rates.THB, j.rates.EUR, j.date, 'European Central Bank reference rates (frankfurter.dev)')
}

async function fromSpare() {
  const j = await getJSON(SPARE)
  if (j.result !== 'success') throw new Error('spare feed: ' + j.result)
  return shape(j.rates.THB, j.rates.EUR, new Date(j.time_last_update_unix * 1000).toISOString().slice(0, 10), 'Rates By Exchange Rate API (open.er-api.com)')
}

let memo = null   // this isolate's last answer, {t, r}

/** {rates: {THB: 1, USD, EUR}, at, src, stale?} or null when no rate has ever been read. */
export async function rates(env = {}, now = Date.now()) {
  if (memo && now - memo.t < HOUR / 6) return memo.r
  const cache = typeof caches !== 'undefined' ? caches.default : null
  const ck = 'https://hongdam.net/api/fx?cache=rates'
  if (cache) {
    const hit = await cache.match(ck).catch(() => null)
    if (hit) { const r = await hit.json(); memo = { t: now, r }; return r }
  }
  let r = null
  for (const get of [fromFeed, fromSpare]) {
    try { r = await get(); if (r) break } catch { /* the next feed */ }
  }
  if (r) {
    if (env.RT_LIMIT) await env.RT_LIMIT.put(KEY, JSON.stringify(r)).catch(() => {})
    if (cache) await cache.put(ck, new Response(JSON.stringify(r), { headers: { 'cache-control': 'max-age=3600', 'content-type': 'application/json' } })).catch(() => {})
  } else if (env.RT_LIMIT) {
    const last = await env.RT_LIMIT.get(KEY, 'json').catch(() => null)
    if (last && sane(last.rates)) r = { ...last, stale: true }
  }
  if (r) memo = { t: now, r }
  return r
}

// The currency a page opens in, by the reader's country (Cloudflare's request.cf.country): baht in Thailand and its
// neighbours, euros in Europe, dollars elsewhere. A choice made with the switch is kept in the browser and wins.
const EUROPE = new Set(('AD AL AT BA BE BG CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS SE SI SK SM UA VA XK').split(' '))
const NEAR = new Set(['TH', 'MM', 'LA', 'KH'])
export const suggest = (country) => (NEAR.has(country) ? 'THB' : EUROPE.has(country) ? 'EUR' : country ? 'USD' : 'THB')

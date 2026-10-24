/**
 * Bitcoin by Lightning for Buy-button orders (her ask 2026-10-24: "hongdam should allow lightning payment").
 *
 * The Lightning Address in PAY.lightning (functions/_shop.js; LN_ADDRESS on the Pages project overrides it, and an
 * empty one turns Lightning off) receives the money. For each order the address's wallet is asked for a bill
 * (LNURL-pay, LUD-06 and LUD-16) for the amount due in sats at this minute's bitcoin price (Kraken, Coinbase as
 * the spare) and the day's exchange rate (functions/_fx.js). A bill whose amount differs from the one asked for is
 * refused. When the wallet's answer carries a verify address (LUD-21), the order is marked paid once that address
 * reports the bill settled with a preimage whose SHA-256 is the bill's payment hash; without one, the buyer presses
 * "I paid" and the team checks the wallet.
 */
import { PAY } from './_shop.js'

/** The Lightning Address in use, or '' when Lightning is off. */
export function lnAddress(env = {}) {
  const a = String(env.LN_ADDRESS ?? PAY.lightning ?? '').trim().toLowerCase()
  return /^[a-z0-9._+-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(a) ? a : ''
}
export const lnOn = (env) => !!lnAddress(env)

async function getJSON(url, opts = {}) {
  const r = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { accept: 'application/json' }, ...opts })
  if (!r.ok) throw new Error(`${r.status} from ${new URL(url).host}`)
  return r.json()
}

const PRICE = [
  ['https://api.kraken.com/0/public/Ticker?pair=XBTUSD', (j) => Number(Object.values(j.result || {})[0]?.c?.[0])],
  ['https://api.coinbase.com/v2/prices/BTC-USD/spot', (j) => Number(j.data?.amount)],
]
/** {usd, src}: dollars for one bitcoin now, or null when neither feed answers. */
export async function btcUsd() {
  for (const [u, pick] of PRICE) {
    try {
      const p = pick(await getJSON(u))
      if (p > 1000 && p < 1e7) return { usd: p, src: new URL(u).host }
    } catch { /* the next feed */ }
  }
  return null
}

/** Sats for amount in cur (THB, USD or EUR), rounded up; rates as functions/_fx.js gives them (baht per unit). */
export function satsFor(amount, cur, btc, rates) {
  const usd = cur === 'USD' ? amount : rates && rates[cur] > 0 && rates.USD > 0 ? amount * rates[cur] / rates.USD : 0
  return usd > 0 && btc > 0 ? Math.ceil(usd / btc * 1e8 - 1e-6) : 0
}

/**
 * A bill from the address's wallet: {pr, hash, msat, exp, verify} or {error}. exp is in Unix seconds;
 * verify is '' when the wallet gives no way to check the payment.
 */
export async function makeBill(env, { msat, comment }) {
  const [user, host] = lnAddress(env).split('@')
  if (!host) return { error: 'off' }
  const meta = await getJSON(`https://${host}/.well-known/lnurlp/${encodeURIComponent(user)}`)
  if (meta.tag !== 'payRequest' || typeof meta.callback !== 'string') return { error: 'ln' }
  if (!(msat >= Number(meta.minSendable)) || !(msat <= Number(meta.maxSendable))) return { error: 'range' }
  const cb = new URL(meta.callback)
  if (cb.protocol !== 'https:') return { error: 'ln' }
  cb.searchParams.set('amount', String(msat))
  if (comment && Number(meta.commentAllowed) >= comment.length) cb.searchParams.set('comment', comment)
  const j = await getJSON(cb.toString())
  if (j.status === 'ERROR' || typeof j.pr !== 'string') return { error: 'ln' }
  const inv = decode(j.pr)
  if (!inv || inv.msat !== msat) return { error: 'ln' }
  const verify = typeof j.verify === 'string' && /^https:\/\//.test(j.verify) ? j.verify : ''
  return { pr: inv.pr, hash: inv.hash, msat, exp: inv.ts + inv.expiry, verify }
}

/**
 * Asks the bill's verify address whether it is paid: {paid: true} only for a settled bill whose preimage hashes
 * to its payment hash; {paid: false, mismatch: true} when the wallet says settled with a preimage that does not;
 * {known: false} when there is no verify address or no clear answer.
 */
export async function settled(bill) {
  if (!bill || !bill.verify) return { known: false }
  let j
  // a buyer's page asks every few seconds: the wallet is asked at most once every 3 seconds per bill
  try { j = await getJSON(bill.verify, { cf: { cacheTtl: 3, cacheEverything: true } }) } catch { return { known: false } }
  if (!j || j.status !== 'OK') return { known: false }
  if (j.settled !== true) return { paid: false }
  if (typeof j.pr === 'string' && j.pr.toLowerCase() !== bill.pr) return { paid: false, mismatch: true }
  if (typeof j.preimage !== 'string' || !/^[0-9a-f]{64}$/i.test(j.preimage)) return { known: false }
  const h = await sha256hex(j.preimage)
  return h === bill.hash ? { paid: true, preimage: j.preimage.toLowerCase() } : { paid: false, mismatch: true }
}

async function sha256hex(hex) {
  const bytes = new Uint8Array(hex.match(/../g).map((b) => parseInt(b, 16)))
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// BOLT11, the parts this needs: amount, timestamp, payment hash (p) and expiry (x). The signature is not checked:
// the bill comes straight from the wallet over HTTPS, and the preimage check above is what proves a payment.
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
function polymod(values) {
  const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (const v of values) {
    const b = chk >>> 25
    chk = ((chk & 0x1ffffff) << 5) ^ v
    for (let i = 0; i < 5; i++) if ((b >>> i) & 1) chk ^= G[i]
  }
  return chk >>> 0
}
const hrpExpand = (h) => [...[...h].map((c) => c.charCodeAt(0) >> 5), 0, ...[...h].map((c) => c.charCodeAt(0) & 31)]
const toInt = (w) => w.reduce((a, v) => a * 32 + v, 0)
function toBytes(w) {
  const out = []
  let acc = 0, bits = 0
  for (const v of w) {
    acc = (acc << 5) | v; bits += 5
    while (bits >= 8) { bits -= 8; out.push((acc >> bits) & 255) }
    acc &= (1 << bits) - 1
  }
  return out
}
const MULT = { '': 100000000000n, m: 100000000n, u: 100000n, n: 100n }

/** {pr, msat, hash, ts, expiry} for a mainnet bill with an amount, or null. */
export function decode(text) {
  if (typeof text !== 'string' || text.length > 2000) return null
  const pr = text.trim().toLowerCase().replace(/^lightning:/, '')
  const sep = pr.lastIndexOf('1')
  if (sep < 4) return null
  const hrp = pr.slice(0, sep), words = []
  for (const c of pr.slice(sep + 1)) { const v = CHARSET.indexOf(c); if (v < 0) return null; words.push(v) }
  if (words.length < 7 + 104 + 6 || polymod([...hrpExpand(hrp), ...words]) !== 1) return null
  const m = hrp.match(/^lnbc(\d+)([munp]?)$/)
  if (!m) return null
  const n = BigInt(m[1])
  let msat
  if (m[2] === 'p') { if (n % 10n) return null; msat = n / 10n } else msat = n * MULT[m[2]]
  const data = words.slice(0, -6 - 104)
  let i = 7, hash = '', expiry = 3600
  while (i + 3 <= data.length) {
    const t = data[i], len = data[i + 1] * 32 + data[i + 2], v = data.slice(i + 3, i + 3 + len)
    if (t === 1 && len === 52) hash = toBytes(v).slice(0, 32).map((b) => b.toString(16).padStart(2, '0')).join('')
    if (t === 6) expiry = toInt(v)
    i += 3 + len
  }
  if (!hash || msat <= 0n || msat > BigInt(Number.MAX_SAFE_INTEGER)) return null
  return { pr, msat: Number(msat), hash, ts: toInt(data.slice(0, 7)), expiry }
}

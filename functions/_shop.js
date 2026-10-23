/**
 * The Buy button behind every service card on hongdam.net (her ask 2026-10-23: "most importantly,
 * spend money"). Cards and options: functions/_shop_data.js, written by tools/build_shop.py from
 * data/shop.json and data/services.json. Prices: functions/_services.js (the monthly Shoup walk) for
 * walking items; a tier, a fixed price or a US$ price for the rest. The total is worked out here,
 * never taken from the browser.
 *
 * Under ฿10,000 (US$300) the buyer pays it all; from there, half now and half at delivery.
 */
import { CARDS } from './_shop_data.js'
import { prices } from './_services.js'

export const HALF_FROM = { THB: 10000, USD: 300 }
export const PAY = {
  promptpay: '0988239210',
  paypal: 'https://www.paypal.me/pfauhaus',
  wise: 'https://wise.com/pay/me/annikahonorahp',
  line: '@964yxgnk',
}

export const optionOf = (card, opt) => {
  const c = CARDS[card]
  if (!c || c.act !== 'buy') return null
  return c.opts.find((o) => o.id === opt) || (opt ? null : c.opts[0])
}

/** {total, due, cur, qty} for one choice, or {error}. walked: {item id: baht} from the walk. */
export function quote(card, opt, qty, addon, walked) {
  const c = CARDS[card], o = optionOf(card, opt)
  if (!o) return { error: 'card' }
  const n = o.unit ? Math.max(1, Math.min(o.max || 99, Math.floor(Number(qty)) || 1)) : 1
  const p = o.price
  let total, cur = 'THB'
  if (p.walk) {
    const b = walked[o.id]
    if (!b) return { error: 'price' }
    total = b * n
  } else if (p.tier) {
    const [base, upto, per] = p.tier
    total = base + Math.max(0, n - upto) * per
  } else if (p.fixed) total = p.fixed * n
  else if (p.usd) { total = p.usd * n; cur = 'USD' }
  else return { error: 'price' }
  if (addon && c.add && cur === 'THB') total += c.add.fixed * n
  const due = total >= HALF_FROM[cur] ? Math.ceil(total / 2) : total
  return { total, due, cur, qty: n, opt: o.id, addon: !!(addon && c.add) }
}

export async function walkedPrices(db, now) {
  return Object.fromEntries((await prices(db, now)).filter((p) => p.baht).map((p) => [p.id, p.baht]))
}

export function payLinks(cur, due) {
  return {
    ...(cur === 'THB' ? { promptpay: PAY.promptpay } : {}),
    paypal: `${PAY.paypal}/${due}${cur}`,
    wise: PAY.wise,
    line: PAY.line,
    usd: cur === 'USD' ? due : Math.max(1, Math.round(due / 33)),
  }
}

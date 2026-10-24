/**
 * The Buy button behind every service card on hongdam.net (her ask 2026-10-23: "most importantly,
 * spend money"). Cards and options: functions/_shop_data.js, written by tools/build_shop.py from
 * data/shop.json and data/services.json. Prices: functions/_services.js (the monthly Shoup walk) for
 * walking items. A tier, a fixed price or a US$ price is the set number; when its option names a walk
 * (price.w, her word 2026-10-24 "Put them on the walk"), the walk's number is used instead, in the
 * same currency, with price.part "tail" for an item's second price. The total is worked out here,
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
  // bitcoin by Lightning (functions/_lightning.js): her wallet's Lightning Address, '' while there is none
  lightning: 'g77kszun@pig.gy',
}

export const optionOf = (card, opt) => {
  const c = CARDS[card]
  if (!c || c.act !== 'buy') return null
  return c.opts.find((o) => o.id === opt) || (opt ? null : c.opts[0])
}

/** The walk's number for a price in cur, or undefined while the walk has none in that currency. */
export function walkNum(k, part, cur) {
  if (typeof k === 'number') k = { price: k, cur: 'THB' }
  if (!k) return undefined
  if (part === 'tail') return k.tail > 0 && (k.tail_cur || 'THB') === cur ? k.tail : undefined   // a ฿ tail is never read as US$
  return (k.cur || 'THB') === cur && k.price > 0 ? k.price : undefined
}

/** {total, due, cur, qty} for one choice, or {error}. walked: {item id: {price, cur, tail}} from the walk. */
export function quote(card, opt, qty, addon, walked) {
  const c = CARDS[card], o = optionOf(card, opt)
  if (!o) return { error: 'card' }
  const n = o.unit ? Math.max(1, Math.min(o.max || 99, Math.floor(Number(qty)) || 1)) : 1
  const p = o.price, w = p.w && walked[p.w]
  let total, cur = 'THB'
  if (p.walk) {
    const b = walkNum(walked[o.id], 'price', 'THB')
    if (!b) return { error: 'price' }
    total = b * n
  } else if (p.tier) {
    const [base, upto, per] = p.tier
    total = (walkNum(w, 'price', 'THB') ?? base) + Math.max(0, n - upto) * (walkNum(w, 'tail', 'THB') ?? per)
  } else if (p.fixed) total = (walkNum(w, p.part, 'THB') ?? p.fixed) * n
  else if (p.usd) { total = (walkNum(w, p.part, 'USD') ?? p.usd) * n; cur = 'USD' }
  else return { error: 'price' }
  // The add-on: per unit of the option (the translator's stamp, per page), or with its own count when it
  // has a unit (haggling, by the hour: her word 2026-10-24). add.for limits it to some options.
  const add = c.add && (!c.add.for || c.add.for.includes(o.id)) ? c.add : null
  let k = 0
  if (addon && add && cur === 'THB') {
    k = add.unit ? Math.max(1, Math.min(add.max || 8, Math.floor(Number(addon)) || 1)) : n
    total += (walkNum(add.w && walked[add.w], 'price', 'THB') ?? add.fixed) * k
  }
  const due = total >= HALF_FROM[cur] ? Math.ceil(total / 2) : total
  return { total, due, cur, qty: n, opt: o.id, addon: k }
}

/** {item id: {price, cur, tail, tail_cur}} for every walking price that is not a percentage. */
export async function walkedPrices(db, now) {
  return Object.fromEntries((await prices(db, now)).filter((k) => k.unit !== '%' && (k.price ?? k.baht) > 0)
    .map((k) => [k.id, { price: k.price ?? k.baht, cur: k.cur || 'THB', ...(k.tail > 0 ? { tail: k.tail, tail_cur: k.tail_unit || 'THB' } : {}) }]))
}

/** How to pay due in cur: PromptPay in baht when thb is known, PayPal asking for due in cur (THB, USD or EUR), Wise. */
export function payLinks(cur, due, thb) {
  return {
    ...(thb > 0 ? { promptpay: PAY.promptpay, thb } : {}),
    paypal: `${PAY.paypal}/${due}${cur}`,
    wise: PAY.wise,
    line: PAY.line,
  }
}

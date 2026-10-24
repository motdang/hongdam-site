/**
 * Card or PayPal on PayPal's own page, for a Buy-button order (her ask 2026-10-24: "as easy as possible to pay us
 * using any currency, from anywhere"). Orders v2 without PayPal's script: the server makes a PayPal order for the
 * amount the buyer pays (THB, USD or EUR), sends the buyer to its payer-action link (landing on the card form,
 * GUEST_CHECKOUT), and captures it when the buyer comes back; a capture that is COMPLETED, for this order's ref
 * (custom_id), amount and currency, pays the order. Money lands in the PayPal account behind paypal.me/pfauhaus.
 *
 * Off until PAYPAL_CLIENT_ID and PAYPAL_SECRET (a live REST app's credentials) are set on the Pages project;
 * PAYPAL_API = https://api-m.sandbox.paypal.com for a sandbox app.
 */
const LIVE = 'https://api-m.paypal.com'

export const cardOn = (env) => !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET)
const base = (env) => env.PAYPAL_API || LIVE

async function token(env) {
  const r = await fetch(base(env) + '/v1/oauth2/token', {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { authorization: 'Basic ' + btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`), 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  if (!r.ok) throw new Error('paypal token ' + r.status)
  return (await r.json()).access_token
}

async function call(env, path, body) {
  const r = await fetch(base(env) + path, {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { authorization: 'Bearer ' + (await token(env)), 'content-type': 'application/json', prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  return { status: r.status, j }
}

const value = (n) => Number(n).toFixed(2)

/** A PayPal order for ref: {id, url} to send the buyer to, or {error}. */
export async function startCard(env, { ref, amount, cur, what, back }) {
  const { status, j } = await call(env, '/v2/checkout/orders', {
    intent: 'CAPTURE',
    purchase_units: [{ custom_id: ref, description: `Hongdam ${what}`.slice(0, 127), soft_descriptor: 'HONGDAM',
      amount: { currency_code: cur, value: value(amount) } }],
    payment_source: { paypal: { experience_context: {
      brand_name: 'Hongdam', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW', landing_page: 'GUEST_CHECKOUT',
      return_url: `${back}&pp=back`, cancel_url: `${back}&pp=cancel` } } },
  })
  const url = (j.links || []).find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href
  if (status >= 300 || !j.id || !url) return { error: 'paypal' }
  return { id: j.id, url }
}

/** Capture PayPal order id; {ok, capture} only when it is COMPLETED for ref, amount and cur. On failure, final is true
 * only when PayPal has said no money moved (a refused capture, a declined card); otherwise the result is unknown. */
export async function finishCard(env, id, { ref, amount, cur }) {
  let { status, j } = await call(env, `/v2/checkout/orders/${encodeURIComponent(id)}/capture`)
  // captured already (a reload of the return page): read the order instead
  if (status === 422 && /ORDER_ALREADY_CAPTURED/.test(JSON.stringify(j))) {
    const r = await fetch(`${base(env)}/v2/checkout/orders/${encodeURIComponent(id)}`, { headers: { authorization: 'Bearer ' + (await token(env)) } })
    j = await r.json().catch(() => ({})); status = r.status
    if (status >= 300) return { ok: false, why: 'pending', final: false }   // captured already, details unread: still held
  }
  if (status >= 500 || status === 429 || status === 0) return { ok: false, why: 'pending', final: false }
  if (status >= 300) return { ok: false, why: 'paypal', final: true }
  const pu = (j.purchase_units || [])[0] || {}
  const c = ((pu.payments || {}).captures || [])[0] || {}
  const okRef = (pu.custom_id || c.custom_id) === ref
  const okAmt = c.amount && c.amount.currency_code === cur && value(c.amount.value) === value(amount)
  if (c.status === 'COMPLETED' && okRef && okAmt) return { ok: true, capture: c.id }
  // captured, but not this order's ref, amount or currency: money moved, so the team sorts it out
  if (c.status === 'COMPLETED') return { ok: false, why: 'pending', final: false, mismatch: true, capture: c.id }
  const no = ['DECLINED', 'FAILED'].includes(c.status)
  return { ok: false, why: no ? 'paypal' : 'pending', final: no, status: c.status || j.status }
}

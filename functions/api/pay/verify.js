/**
 * GET/POST /api/pay/verify — the translation payment box's slip check
 * (nanobotco-pay, Nan 2026-10-12). Secrets on the Pages project:
 *   SLIPOK_KEY, SLIPOK_BRANCH   the slip check (off without both)
 *   RESEND_API_KEY              shared with /api/contact
 *   PAY_MAIL_TO, PAY_MAIL_FROM  where a confirmed payment is mailed
 */
import { handle } from './_verify.js'
import { prices } from '../../_services.js'
import { toWheel, payDraft } from '../../_wheel.js'

// Translation prices walk monthly with the services list (functions/_services.js; her word
// 2026-10-24, "Put them on the walk"): new and checking are a price for up to 5 pages and a
// price for each page after; the stamp is a price a page.
export async function translationPrices(db, now = Date.now()) {
  const by = Object.fromEntries((await prices(db, now)).map((k) => [k.id, k]))
  return { new: [by['lang-new'].price, 5, by['lang-new'].tail], check: [by['lang-check'].price, 5, by['lang-check'].tail], stamp: by['lang-stamp'].price }
}

export async function onRequest({ request, env, waitUntil }) {
  return handle(request, env, { prices: await translationPrices(env.TASKS), refPrefix: 'HD', site: 'hongdam.net', after: (x) => toWheel(env, payDraft(x)) }, { waitUntil })
}

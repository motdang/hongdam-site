/**
 * functions/_wheel.js — every order and question on hongdam.net becomes a ticket on the Team Wheel (NaN, 2026-10-26:
 * "ticketing should be improved between a customer requesting a service on hongdam.net and getting it done by our
 * team"). The wheel's side is pm-desk src/shop.js.
 *
 *   A new order or question  → a draft under Michael's Hand out, in its own Orders list; he posts it and picks who.
 *   Paid, says paid, a line  → the same ref again: its money moves forward and its ticket gets the line.
 *   The holder's 🔨 / ✅      → the wheel moves the order here (POST /api/buy/state, from: "wheel"), and the
 *                              customer's order page says Started, then Done.
 *
 * #help-desk gets the notice only when the wheel did not take it (no key, the wheel down), so nothing is lost.
 * Pages project settings: WHEEL_SHOP_KEY (secret, = the wheel's SHOPKEY), WHEEL_URL (optional).
 */
import { SERVICES } from './_services_data.js'
import { WHEEL } from './_wheel_data.js'
import { tell } from './_tasks.js'

const WHEEL_URL = 'https://pm.nanobotco.workers.dev'

/** Sends one order to the wheel. True when the wheel took it. */
export async function toWheel(env, body) {
  if (!env.WHEEL_SHOP_KEY) return false
  try {
    const r = await fetch(`${env.WHEEL_URL || WHEEL_URL}/api/shop/order`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-shop': env.WHEEL_SHOP_KEY },
      body: JSON.stringify(body),
    })
    const j = await r.json().catch(() => ({}))
    return r.ok && !!j.ok
  } catch { return false }
}

/** The wheel, else #help-desk: a notice is never lost. */
export async function wheelOrTell(env, title, lines, w) {
  if (await toWheel(env, w)) return
  await tell(env, title, lines)
}

// Michael's five answers need a skill from the wheel's list and a size (small: under half a day, medium: a day or
// two, large: split it). A card's category gives the skill; its team hours for the main option (data/rank.json) the size.
const SKILL = {
  care: 'people', visa: 'admin', fix: 'backend', money: 'admin', web: 'frontend, backend', stay: 'people', ai: 'backend',
  moving: 'people', design: 'design, content', charity: 'content, admin', help: 'people', luck: 'people',
  translate: 'content', shop: 'people', ship: 'admin', data: 'backend', merit: 'people', tours: 'people',
  outsource: 'admin', weddings: 'people',
}
export const skillOf = (card) => SKILL[(WHEEL[card] || [])[0]] || 'people'
export function sizeOf(card) {
  const h = (WHEEL[card] || [])[1]
  return h == null ? 'medium' : h <= 4 ? 'small' : h <= 16 ? 'medium' : 'large'
}
const LANG = { en: 'English', th: 'Thai', my: 'Burmese', zh: 'Chinese', de: 'German' }
export const optName = (id) => (SERVICES[id] && SERVICES[id].en) || id
export const trackUrl = (origin, lang, ref) => `${origin}/${lang && lang !== 'en' ? lang + '/' : ''}buy/?ref=${ref}`

/**
 * A shop order as the wheel's first draft. o: the svc_buy row's fields (ref, card, opt, qty, addon, total, due, cur,
 * contact, note, lang); cardName, addName: the card's and add-on's English names; money: the price line as written.
 */
export function shopDraft(o, { cardName, addName, money, link }) {
  const what = `${optName(o.opt)}${o.qty > 1 ? ` × ${o.qty}` : ''}${o.addon ? ` + ${addName || 'add-on'}` : ''}`
  return {
    ref: o.ref, kind: 'buy', pay: 'booked',
    title: `${o.ref} · ${cardName}`.slice(0, 70),
    goal: `A customer ordered ${what}. They get it.`,
    skill: skillOf(o.card), size: sizeOf(o.card),
    done: 'The customer has it, their order page says Done, and a line in this ticket says how it reached them.',
    body: [`🛒 ${what}`, `💰 ${money}`, o.note && `✍️ The customer wrote: “${o.note}”`, `🌐 Ordered on the ${LANG[o.lang] || 'English'} page.`].filter(Boolean).join('\n'),
    notes: [`Customer: ${o.contact}`, `Their order page: ${link}`, `On the wheel, 🔨 I'm on it makes that page say Started; ✅ Finished, then Michael's check, makes it say Done. The page moves once the order is paid.`].join('\n'),
    what, money, contact: o.contact, lang: o.lang, link,
  }
}

/** A question from the order form: someone answers the customer. */
export function askDraft({ ref, service, message, contact, lang, page }) {
  const short = message.trim().slice(0, 1500)
  return {
    ref, kind: 'ask',
    title: `${ref} · Question${service ? ': ' + service : ''}`.slice(0, 70),
    goal: `A customer asked${service ? ` about ${service}` : ' a question'}. They get an answer: a price and when, or a no.`,
    skill: 'sales', size: 'small',
    done: 'The customer has an answer, and a line in this ticket says what it was.',
    body: [`💬 “${short}”`, page && `📄 Asked on ${page}`].filter(Boolean).join('\n'),
    notes: `Customer: ${contact}`,
    what: service || 'a question', money: '', contact, lang: lang || '', link: '',
  }
}

/** A translation paid in the pay box on /translation/: no order before it, no contact; the documents come with the ref. */
export function payDraft({ ref, baht, choice, transRef }) {
  const pages = Math.floor(Number(choice.pages)) || 1
  const what = `${choice.svc === 'check' ? 'Checking a translation' : 'A new translation'}, ${pages} page${pages > 1 ? 's' : ''}${choice.stamp ? ', stamped' : ''}`
  return {
    ref: 'TR-' + String(transRef).slice(-6).toUpperCase(), kind: 'pay', pay: 'paid', how: 'promptpay',
    title: `${ref} · Translation, paid`.slice(0, 70),
    goal: `A customer paid for ${what.toLowerCase()}. They get it.`,
    skill: 'content', size: pages <= 10 ? 'small' : 'medium',
    done: 'The customer has the translation, and a line in this ticket says how it reached them.',
    body: [`🛒 ${what}`, `💰 ฿${Number(baht).toLocaleString('en-US')} paid by PromptPay · bank ref ${transRef}`, `📇 The pay box gave them ref ${ref} and asked them to send it with their documents.`].join('\n'),
    notes: `No contact yet: the customer writes with ref ${ref}.`,
    what, money: `฿${Number(baht).toLocaleString('en-US')}`, contact: '', lang: '', link: '',
  }
}

/** An order from one of the booking pages (GitHub, PHP, bots): booked there, paid by slip there. */
export function pageDraft({ ref, kind, name, what, baht, usd, cost, slot, contact, note, link, skill, size }) {
  const money = cost || `฿${Number(baht).toLocaleString('en-US')}${usd ? ` (US$${usd})` : ''}`
  return {
    ref, kind, pay: 'booked',
    title: `${ref} · ${name}`.slice(0, 70),
    goal: `A customer booked ${what}. They get it.`,
    skill, size,
    done: 'The customer has it, and a line in this ticket says how it reached them.',
    body: [`🛒 ${what}`, `💰 ${money}`, slot && `📅 Slot from ${slot}`, note && `✍️ The customer wrote: “${note}”`].filter(Boolean).join('\n'),
    notes: `Customer: ${contact}${link ? `\nThe page they booked on: ${link}` : ''}`,
    what, money, contact, lang: 'en', link: link || '',
  }
}

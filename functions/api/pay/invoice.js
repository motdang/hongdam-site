/**
 * GET  /api/pay/invoice?slug=…   is the slip check on for this invoice
 * POST /api/pay/invoice {slug, slip}   asks SlipOK about the slip, for the invoice's own amount
 *
 * Baht invoice pages on hongdam.net/invoice/<slug>/ (tools/build_invoice.py, her ask 2026-11-05).
 * The amount comes from functions/_invoices_data.js, never from the browser. A confirmed payment is
 * mailed to PAY_MAIL_TO and to the invoice's own address. Secrets as /api/pay/verify.
 */
import { checkSlip, slipOn } from './_verify.js'
import { INVOICES } from '../../_invoices_data.js'

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

export async function handle(request, env, { fetcher = fetch, waitUntil = null, invoices = INVOICES } = {}) {
  if (request.method === 'GET') {
    const inv = invoices[new URL(request.url).searchParams.get('slug') || '']
    return json({ on: !!inv && slipOn(env) })
  }
  if (request.method !== 'POST') return json({ ok: false, why: 'unread' }, 405)
  let body
  try { body = await request.formData() } catch { return json({ ok: false, why: 'nofile' }, 400) }
  const inv = invoices[String(body.get('slug') || '')]
  if (!inv) return json({ ok: false, why: 'ref' }, 404)
  const r = await checkSlip(env, body.get('slip'), inv.baht, fetcher)
  if (!r.ok) return json({ ok: false, why: r.why })
  const key = env.RESEND_API_KEY || env.RESEND_KEY
  const to = [...(env.PAY_MAIL_TO || '').split(','), inv.mail].map((s) => s.trim()).filter(Boolean)
  if (key && env.PAY_MAIL_FROM && to.length) {
    const m = fetcher('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.PAY_MAIL_FROM, to: [...new Set(to)],
        subject: `Paid: ฿${r.amount.toLocaleString('en-US')} · invoice ${inv.number}`,
        text: `฿${r.amount} paid for invoice ${inv.number} (due ฿${inv.baht}).\nBank reference: ${r.transRef}\nConfirmed by SlipOK on hongdam.net.` }) }).catch(() => {})
    if (waitUntil) waitUntil(m); else await m
  }
  return json({ ok: true, ref: inv.number, amount: r.amount })
}

export const onRequest = ({ request, env, waitUntil }) => handle(request, env, { waitUntil })

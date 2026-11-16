/**
 * GET    /api/agree?slug=…                     {ok, signed, name, title, at}
 * POST   /api/agree {slug, name, title, agree=yes}   signs the agreement for the client, once
 * DELETE /api/agree?slug=…   Authorization: Bearer TASKS_ADMIN   undoes a signature made by mistake
 *
 * Agreement pages on hongdam.net/agreement/<slug>/ (tools/build_agreement.py, her ask 2026-11-16). The words and
 * their SHA-256 come from functions/_agreements_data.js, never from the browser. The first signature is stored in
 * agree_sign (migrations/0013_agree.sql) and mailed, with the words signed, to the agreement's own addresses.
 * Binding: TASKS (D1 hongdam-tasks). Mail: RESEND_API_KEY, PAY_MAIL_FROM.
 */
import { AGREEMENTS } from '../_agreements_data.js'

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

const clean = (v, n) => String(v || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n)

const read = (db, slug) => db.prepare('SELECT name, title, at FROM agree_sign WHERE slug = ?').bind(slug).first()

const ict = (at) => new Date(at).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'long',
  year: 'numeric', hour: '2-digit', minute: '2-digit' })

export async function handle(request, env, { fetcher = fetch, waitUntil = null, agreements = AGREEMENTS, now = () => new Date() } = {}) {
  const db = env.TASKS
  if (!db) return json({ ok: false, why: 'service' }, 503)
  const url = new URL(request.url)
  if (request.method === 'GET' || request.method === 'DELETE') {
    const slug = url.searchParams.get('slug') || ''
    if (!agreements[slug]) return json({ ok: false, why: 'ref' }, 404)
    if (request.method === 'DELETE') {
      if (!env.TASKS_ADMIN || request.headers.get('authorization') !== `Bearer ${env.TASKS_ADMIN}`) return json({ ok: false, why: 'key' }, 403)
      await db.prepare('DELETE FROM agree_sign WHERE slug = ?').bind(slug).run()
      return json({ ok: true, signed: false })
    }
    const r = await read(db, slug)
    return json(r ? { ok: true, signed: true, ...r } : { ok: true, signed: false })
  }
  if (request.method !== 'POST') return json({ ok: false, why: 'method' }, 405)
  let body
  try { body = await request.formData() } catch { return json({ ok: false, why: 'name' }, 400) }
  const slug = String(body.get('slug') || '')
  const ag = agreements[slug]
  if (!ag) return json({ ok: false, why: 'ref' }, 404)
  const name = clean(body.get('name'), 80)
  const title = clean(body.get('title'), 80)
  if (name.length < 2) return json({ ok: false, why: 'name' }, 400)
  if (body.get('agree') !== 'yes') return json({ ok: false, why: 'agree' }, 400)
  const at = now().toISOString()
  const cf = request.cf || {}
  const ip = request.headers.get('cf-connecting-ip') || ''
  const ua = clean(request.headers.get('user-agent'), 300)
  await db.prepare('INSERT OR IGNORE INTO agree_sign (slug, name, title, at, sha, ip, country, ua) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(slug, name, title, at, ag.sha, ip, cf.country || '', ua).run()
  const r = await read(db, slug)
  if (r.at !== at) return json({ ok: true, signed: true, again: true, ...r })
  const key = env.RESEND_API_KEY || env.RESEND_KEY
  const to = (ag.mail || []).filter(Boolean)
  if (key && env.PAY_MAIL_FROM && to.length) {
    const page = `https://hongdam.net/agreement/${slug}/`
    const m = fetcher('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.PAY_MAIL_FROM, to,
        subject: `Signed by ${ag.signer}: ${ag.title}`,
        text: `Signed for ${ag.signer} by ${name}${title ? ', ' + title : ''}\n` +
          `When: ${ict(at)} (Thailand time), ${at}\n` +
          `From: ${cf.country || 'country not given'}, ${ip || 'address not given'}\n` +
          `Words signed, SHA-256: ${ag.sha}\nPage: ${page}\n\n----\n\n${ag.text}` }) }).catch(() => {})
    if (waitUntil) waitUntil(m); else await m
  }
  return json({ ok: true, signed: true, ...r })
}

export const onRequest = ({ request, env, waitUntil }) => handle(request, env, { waitUntil })

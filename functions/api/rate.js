/**
 * /api/rate — "How is this translation?" on hongdam.net's Burmese and Chinese pages (her word 2026-10-24:
 * "publish now with a 'rate my translation' feature").
 *
 *   POST /api/rate {page, lang, score: good|better, text}   one reader's answer
 *   GET  /api/rate                                          answers counted by language and page, no text
 *                                                           Authorization: Bearer TASKS_ADMIN
 *
 * Each answer is a row in svc_rate (migrations/0009_rate.sql, D1 TASKS). "Could be better" also posts in
 * #help-desk (DISCORD_TASKS) with the reader's correction. Twenty answers a day from one address (atomic D1 counter, functions/_tries.js).
 * POST answers hongdam.net, hongdam.pages.dev and localhost.
 */
import { whoHash } from '../_services.js'
import { tell } from '../_tasks.js'
import { tryOnce } from '../_tries.js'

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
})
const ORIGINS = ['https://hongdam.net', 'https://www.hongdam.net', 'https://hongdam.pages.dev']
const originOk = (o) => ORIGINS.includes(o) || /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(o)
const LANGS = { my: 'Burmese', zh: 'Chinese', th: 'Thai', en: 'English' }
const code = (s) => '`' + String(s).replace(/`/g, '') + '`'

// Twenty answers a day from one address, counted atomically in D1 (functions/_tries.js; CodeRabbit on #57).
async function allowed(env, ip, now) {
  return tryOnce(env.TASKS, [['rate:ip:' + ip, 20]], now)
}

export async function onRequestPost(ctx) {
  const { request, env } = ctx
  if (!originOk(request.headers.get('origin') || '')) return json({ ok: false, why: 'origin' }, 403)
  if (!env.TASKS) return json({ ok: false, why: 'db' }, 503)
  let b
  try { b = await request.json() } catch { return json({ ok: false, why: 'json' }, 400) }
  const page = typeof b.page === 'string' && b.page.startsWith('/') ? b.page.replace(/\s+/g, '').slice(0, 200) : ''
  const lang = Object.hasOwn(LANGS, b.lang) ? b.lang : ''
  const score = b.score === 'good' || b.score === 'better' ? b.score : ''
  const text = typeof b.text === 'string' ? b.text.trim().slice(0, 2000) : ''
  if (!page || !lang || !score) return json({ ok: false, why: 'fields' }, 400)
  const now = Date.now(), ip = request.headers.get('cf-connecting-ip') || ''
  if (!(await allowed(env, ip, now))) return json({ ok: false, why: 'limit' }, 429)
  let stored = true
  try {
    await env.TASKS.prepare('INSERT INTO svc_rate (page, lang, score, text, who, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(page, lang, score, text || null, ip ? await whoHash(ip) : null, new Date(now).toISOString()).run()
  } catch { stored = false }   // svc_rate not on this database yet: the note to #help-desk still goes
  if (score === 'better' || text || !stored) {
    ctx.waitUntil(tell(env, `Translation · ${LANGS[lang]} · ${page}`.slice(0, 95), [
      score === 'better' && `A reader of the ${LANGS[lang]} page ${page} says the translation could be better.`,
      score === 'good' ? `A reader of the ${LANGS[lang]} page ${page} says the translation is good.` : text ? `Their correction: ${code(text)}` : 'No correction written.',
      !stored && 'The database did not store this answer: svc_rate (migrations/0009_rate.sql) was unreachable.',
    ].filter(Boolean)))
  }
  return json({ ok: true, stored })
}

export async function onRequestGet({ request, env }) {
  if (!env.TASKS_ADMIN || request.headers.get('authorization') !== `Bearer ${env.TASKS_ADMIN}`) return json({ ok: false, why: 'auth' }, 401)
  if (!env.TASKS) return json({ ok: false, why: 'db' }, 503)
  const rows = (await env.TASKS.prepare(
    "SELECT lang, page, SUM(score = 'good') AS good, SUM(score = 'better') AS better, SUM(text IS NOT NULL) AS corrections, MAX(created_at) AS last FROM svc_rate GROUP BY lang, page ORDER BY better DESC, last DESC",
  ).all()).results
  return json({ ok: true, pages: rows })
}

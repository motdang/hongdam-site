/**
 * Words a page's owner changes on the page itself (the /for/ demos).
 *
 *   GET  /api/page/:page                      {edits: {lang: {key: text}}}
 *   POST /api/page/:page  {edits: {lang: {key: text}}}   Authorization: Bearer <page key>
 *   POST /api/page/:page  {reset: true}                   back to the page as built
 *
 * lang is en, th or de; "*" holds numbers and dates (num.st1, date.ev1).
 * A page's key is stored as its SHA-256 in page_keys (migrations/0004_page_edits.sql);
 * the key itself travels once, in the edit link's #k=….
 * Every save is a row in page_edits; the newest row for a key wins, and a reset row
 * clears what came before it.
 *
 * Binding: TASKS (D1 hongdam-tasks).
 */
const PAGE = /^[a-z0-9-]{1,40}$/
const LANGS = new Set(['en', 'th', 'de', '*'])
const KEY = /^[A-Za-z0-9_.]{1,40}$/
const MAXV = 1500
const MAXN = 200

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

async function sha256(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export async function read(db, page) {
  const { results } = await db
    .prepare('SELECT lang, k, v FROM page_edits WHERE page = ? ORDER BY id')
    .bind(page)
    .all()
  let edits = {}
  for (const r of results) {
    if (r.k === '*reset') { edits = {}; continue }
    const o = (edits[r.lang] = edits[r.lang] || {})
    if (r.v === null) delete o[r.k]
    else o[r.k] = r.v
  }
  return edits
}

export function clean(body) {
  if (!body || typeof body !== 'object') return null
  if (body.reset === true) return { reset: true }
  const ed = body.edits
  if (!ed || typeof ed !== 'object') return null
  const rows = []
  for (const [lang, o] of Object.entries(ed)) {
    if (!LANGS.has(lang) || !o || typeof o !== 'object') return null
    for (const [k, v] of Object.entries(o)) {
      if (!KEY.test(k)) return null
      if (v !== null && typeof v !== 'string') return null
      const t = v === null ? null : v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, MAXV)
      if (lang === '*') {
        if (/^num\./.test(k) && !(t === null || /^\d{1,6}$/.test(t))) return null
        if (/^date\./.test(k) && !(t === null || /^\d{4}-\d{2}-\d{2}$/.test(t))) return null
        if (!/^(num|date)\./.test(k)) return null
      }
      rows.push([lang, k, t])
    }
  }
  if (!rows.length || rows.length > MAXN) return null
  return { rows }
}

export async function onRequest({ request, env, params }) {
  const page = (params.path || [])[0] || ''
  if (!PAGE.test(page) || (params.path || []).length !== 1) return json(404, { error: 'Page' })
  if (!env.TASKS) return json(503, { error: 'Store' })
  const db = env.TASKS

  if (request.method === 'GET') return json(200, { page, edits: await read(db, page) })
  if (request.method !== 'POST') return json(405, { error: 'Method' })

  const auth = request.headers.get('authorization') || ''
  const key = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const row = await db.prepare('SELECT key_hash FROM page_keys WHERE page = ?').bind(page).first()
  if (!row || !key || (await sha256(key)) !== row.key_hash) return json(401, { error: 'Key' })

  let body
  try { body = await request.json() } catch { return json(400, { error: 'Body' }) }
  const c = clean(body)
  if (!c) return json(400, { error: 'Edits' })

  const at = new Date().toISOString()
  const ins = db.prepare('INSERT INTO page_edits (page, lang, k, v, at) VALUES (?, ?, ?, ?, ?)')
  if (c.reset) await ins.bind(page, '*', '*reset', null, at).run()
  else await db.batch(c.rows.map(([l, k, v]) => ins.bind(page, l, k, v, at)))
  return json(200, { ok: true, page, edits: await read(db, page) })
}

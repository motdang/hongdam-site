/**
 * /api/swan — the predictions on hongdam.net/studio/black-swan/ (her ask 2026-10-24: "Give it toys and prediction storage").
 *
 *   POST /api/swan {text, odds, size, years, name, lang}   save one → {id, key, state}   key: the maker's, to delete it
 *   GET  /api/swan?sort=new|top|soon&o=0                   20 listed predictions, and how many are listed
 *   GET  /api/swan?ids=a,b,c                               these (the "Mine" tab), waiting ones without their words
 *   GET  /api/swan/<id>                                    one
 *   POST /api/swan/<id>/vote {v: y|n}                      "will it happen?" before the check month, "did it happen?" from it
 *   POST /api/swan/<id>/report                             three reports from three addresses hide it
 *   POST /api/swan/<id>/delete {key}                       its maker removes it, with its votes
 *   POST /api/swan/poll {q, v: y|n}  ·  GET /api/swan/poll "Black swan or not?" on past events
 *   GET  /api/swan/held  ·  POST /api/swan/<id>/state {state: ok|hidden}           Authorization: Bearer TASKS_ADMIN
 *
 * Tables in migrations/0012_swan.sql (D1 TASKS). A prediction naming the Thai royal family, or one the safety model
 * (Llama Guard on Workers AI) calls unsafe, waits for a person: it is saved, its maker can share it, and the team
 * hears of it in #help-desk (DISCORD_TASKS); it is listed once the team sets it to ok. Daily caps per address and
 * for the site are counted in D1 (functions/_tries.js). POSTs answer hongdam.net, hongdam.pages.dev and localhost.
 */
import { tell } from '../../_tasks.js'
import { tryOnce } from '../../_tries.js'
import { ID_RE, LIMITS, QUIZ, SORTS, newId, newKey, sha, readNew, needsLook, phaseOf, pub } from '../../_swan.js'

const json = (body, status = 200, cache = 'no-store') => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache },
})
const ORIGINS = ['https://hongdam.net', 'https://www.hongdam.net', 'https://hongdam.pages.dev']
const originOk = (o) => ORIGINS.includes(o) || /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(o)
const code = (s) => '`' + String(s).replace(/`/g, '') + '`'
const COLS = 'id, text, lang, due, odds, size, name, state, yes, no, came, nope, created_at'

async function unsafe(env, text) {
  if (!env.AI) return false
  try {
    const r = await env.AI.run('@cf/meta/llama-guard-3-8b', { messages: [{ role: 'user', content: text.slice(0, 1000) }] })
    const out = String(r?.response ?? r?.result ?? '')
    return /^\s*unsafe/i.test(out) || r?.response?.safe === false
  } catch { return false }
}

// The address, an IPv6 one cut to its /64 (one home or phone holds a whole /64), for counts and the identity hash
// (CodeRabbit on #115).
export function net(ip) {
  if (!ip || !ip.includes(':') || ip.includes('.')) return ip || '0'
  const [h, t = ''] = ip.toLowerCase().split('::')
  const hs = h ? h.split(':') : [], ts = t ? t.split(':') : []
  const full = [...hs, ...Array(Math.max(0, 8 - hs.length - ts.length)).fill('0'), ...ts]
  return full.slice(0, 4).map((x) => x.padStart(4, '0')).join(':') + '::/64'
}

// who voted or reported: an HMAC of the address keyed with the site's admin secret, so a copy of the table alone
// cannot be matched to addresses (CodeRabbit on #115); a plain hash where no secret is set (local runs)
async function who(env, ip) {
  const msg = new TextEncoder().encode('swan:' + ip)
  const out = env.TASKS_ADMIN
    ? await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', new TextEncoder().encode(env.TASKS_ADMIN), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), msg)
    : await crypto.subtle.digest('SHA-256', msg)
  return [...new Uint8Array(out)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const bodyOf = async (request) => { try { const b = await request.json(); return b && typeof b === 'object' ? b : {} } catch { return {} } }

async function counts(db, id) {
  await db.prepare(`UPDATE swan SET
      yes  = (SELECT COUNT(*) FROM swan_vote WHERE id = ?1 AND ph = 'p' AND v = 'y'),
      no   = (SELECT COUNT(*) FROM swan_vote WHERE id = ?1 AND ph = 'p' AND v = 'n'),
      came = (SELECT COUNT(*) FROM swan_vote WHERE id = ?1 AND ph = 'r' AND v = 'y'),
      nope = (SELECT COUNT(*) FROM swan_vote WHERE id = ?1 AND ph = 'r' AND v = 'n')
    WHERE id = ?1`).bind(id).run()
  return db.prepare('SELECT yes, no, came, nope FROM swan WHERE id = ?').bind(id).first()
}

const admin = (request, env) => env.TASKS_ADMIN && request.headers.get('authorization') === `Bearer ${env.TASKS_ADMIN}`

export async function onRequestGet({ request, env, params }) {
  const db = env.TASKS
  if (!db) return json({ ok: false, why: 'db' }, 503)
  const [a] = params.path || []
  const url = new URL(request.url)
  try {
    if (a === 'poll') {
      const rows = (await db.prepare('SELECT q, v, COUNT(*) AS n FROM swan_poll GROUP BY q, v').all()).results
      const out = Object.fromEntries(QUIZ.map((q) => [q, { y: 0, n: 0 }]))
      for (const r of rows) if (out[r.q]) out[r.q][r.v] = r.n
      return json({ ok: true, poll: out }, 200, 'public, max-age=20')
    }
    if (a === 'held') {
      if (!admin(request, env)) return json({ ok: false, why: 'auth' }, 401)
      const rows = (await db.prepare(`SELECT ${COLS}, why, reports FROM swan WHERE state IN ('wait', 'hidden') ORDER BY created_at DESC LIMIT 100`).all()).results
      return json({ ok: true, held: rows })
    }
    if (a) {
      if (!ID_RE.test(a)) return json({ ok: false, why: 'id' }, 404)
      const r = await db.prepare(`SELECT ${COLS} FROM swan WHERE id = ? AND state != 'gone'`).bind(a).first()
      return r ? json({ ok: true, swan: pub(r) }, 200, 'public, max-age=10') : json({ ok: false, why: 'none' }, 404)
    }
    const ids = (url.searchParams.get('ids') || '').split(',').filter((x) => ID_RE.test(x)).slice(0, 50)
    if (ids.length) {
      const rows = (await db.prepare(`SELECT ${COLS} FROM swan WHERE id IN (${ids.map(() => '?').join(',')}) AND state != 'gone'`).bind(...ids).all()).results
      rows.sort((x, y) => (x.created_at < y.created_at ? 1 : -1))
      return json({ ok: true, swans: rows.map(pub) })
    }
    const sort = Object.hasOwn(SORTS, url.searchParams.get('sort')) ? url.searchParams.get('sort') : 'new'
    const o = Math.max(0, Math.min(2000, parseInt(url.searchParams.get('o'), 10) || 0))
    const [list, n] = await db.batch([
      db.prepare(`SELECT ${COLS} FROM swan WHERE state = 'ok' ORDER BY ${SORTS[sort]} LIMIT 21 OFFSET ?`).bind(o),
      db.prepare("SELECT COUNT(*) AS n FROM swan WHERE state = 'ok'"),
    ])
    const rows = list.results
    return json({ ok: true, swans: rows.slice(0, 20).map(pub), more: rows.length > 20, n: n.results[0].n }, 200, 'public, max-age=10')
  } catch {
    return json({ ok: false, why: 'db' }, 503)
  }
}

export async function onRequestPost(ctx) {
  const { request, env, params } = ctx
  const db = env.TASKS
  const [a, b] = params.path || []
  if (a && ID_RE.test(a) && b === 'state') return setState(request, env, a)
  if (!originOk(request.headers.get('origin') || '')) return json({ ok: false, why: 'origin' }, 403)
  if (!db) return json({ ok: false, why: 'db' }, 503)
  const body = await bodyOf(request)
  const ip = net(request.headers.get('cf-connecting-ip') || '0'), now = Date.now()
  try {
    if (!a) return await create(ctx, body, ip, now)
    if (a === 'poll') {
      if (!QUIZ.includes(body.q) || !['y', 'n'].includes(body.v)) return json({ ok: false, why: 'fields' }, 400)
      if (!(await tryOnce(db, [['swan:poll:' + ip, LIMITS.polls]], now))) return json({ ok: false, why: 'limit' }, 429)
      const w = await who(env, ip)
      await db.prepare('INSERT INTO swan_poll (q, who, v, at) VALUES (?, ?, ?, ?) ON CONFLICT(q, who) DO UPDATE SET v = excluded.v, at = excluded.at')
        .bind(body.q, w, body.v, new Date(now).toISOString()).run()
      const rows = (await db.prepare('SELECT v, COUNT(*) AS n FROM swan_poll WHERE q = ? GROUP BY v').bind(body.q).all()).results
      const out = { y: 0, n: 0 }
      for (const r of rows) out[r.v] = r.n
      return json({ ok: true, q: body.q, poll: out })
    }
    if (!ID_RE.test(a)) return json({ ok: false, why: 'id' }, 404)
    const r = await db.prepare('SELECT id, text, due, state, key, reports FROM swan WHERE id = ?').bind(a).first()
    if (!r || r.state === 'gone') return json({ ok: false, why: 'none' }, 404)
    if (b === 'vote') {
      if (!['y', 'n'].includes(body.v)) return json({ ok: false, why: 'fields' }, 400)
      if (r.state !== 'ok') return json({ ok: false, why: 'state' }, 409)
      if (!(await tryOnce(db, [['swan:vote:' + ip, LIMITS.votes]], now))) return json({ ok: false, why: 'limit' }, 429)
      const ph = phaseOf(r.due, now)
      await db.prepare('INSERT INTO swan_vote (id, who, ph, v, at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id, who, ph) DO UPDATE SET v = excluded.v, at = excluded.at')
        .bind(a, await who(env, ip), ph, body.v, new Date(now).toISOString()).run()
      return json({ ok: true, ph, votes: await counts(db, a) })
    }
    if (b === 'report') {
      if (!(await tryOnce(db, [['swan:rep:' + ip, LIMITS.reports]], now))) return json({ ok: false, why: 'limit' }, 429)
      await db.prepare('INSERT OR IGNORE INTO swan_report (id, who, at) VALUES (?, ?, ?)').bind(a, await who(env, ip), new Date(now).toISOString()).run()
      const n = (await db.prepare('SELECT COUNT(*) AS n FROM swan_report WHERE id = ?').bind(a).first()).n
      const hide = r.state === 'ok' && n >= LIMITS.hide
      await db.prepare(`UPDATE swan SET reports = ?${hide ? ", state = 'hidden', why = 'reports'" : ''} WHERE id = ?`).bind(n, a).run()
      if (hide || n === 1) {
        ctx.waitUntil(tell(env, `Black swan · reported · ${a}`, [
          `A prediction on hongdam.net/swan/${a} has ${n} report${n === 1 ? '' : 's'}${hide ? ' and is now off the list' : ''}.`,
          `Its words: ${code(r.text)}`,
          hide ? `To list it again: POST https://hongdam.net/api/swan/${a}/state {"state":"ok"} with Bearer TASKS_ADMIN.` : '',
        ].filter(Boolean)))
      }
      return json({ ok: true })
    }
    if (b === 'delete') {
      if (typeof body.key !== 'string' || (await sha(body.key)) !== r.key) return json({ ok: false, why: 'key' }, 403)
      await db.batch([
        db.prepare('DELETE FROM swan_vote WHERE id = ?').bind(a),
        db.prepare('DELETE FROM swan_report WHERE id = ?').bind(a),
        db.prepare('DELETE FROM swan WHERE id = ?').bind(a),
      ])
      return json({ ok: true })
    }
    return json({ ok: false, why: 'path' }, 404)
  } catch {
    return json({ ok: false, why: 'db' }, 503)
  }
}

async function create(ctx, body, ip, now) {
  const { request, env } = ctx
  const db = env.TASKS
  const got = readNew(body, new Date(now))
  if (!got.ok) return json({ ok: false, why: got.why }, 400)
  // the address's own cap first; only a request inside it counts against the site's (CodeRabbit on #114)
  if (!(await tryOnce(db, [['swan:new:' + ip, LIMITS.perAddress]], now)) || !(await tryOnce(db, [['swan:new:all', LIMITS.perDay]], now))) {
    return json({ ok: false, why: 'limit' }, 429)
  }
  const row = got.row
  const words = needsLook(row.text + ' ' + (row.name || ''))
  const model = !words && (await unsafe(env, row.text + (row.name ? '\n' + row.name : '')))
  const state = words || model ? 'wait' : 'ok'
  const key = newKey(), keyHash = await sha(key), w = await who(env, ip), at = new Date(now).toISOString()
  let id = ''
  for (let i = 0; i < 4 && !id; i++) {
    const tryId = newId()
    const res = await db.prepare(`INSERT OR IGNORE INTO swan (id, text, lang, due, odds, size, name, state, why, key, who, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(tryId, row.text, row.lang, row.due, row.odds, row.size, row.name,
      state, words ? 'words' : model ? 'model' : null, keyHash, w, at).run()
    if (res.meta && res.meta.changes) id = tryId
  }
  if (!id) return json({ ok: false, why: 'db' }, 503)
  if (state === 'wait') {
    ctx.waitUntil(tell(env, `Black swan · waiting · ${id}`, [
      `A new prediction waits before it is listed on hongdam.net/studio/black-swan/ (${words ? 'it names the royal family or a word near it' : 'the safety model flagged it'}).`,
      `Its words: ${code(row.text)}${row.name ? ` · name ${code(row.name)}` : ''}`,
      `To list it: POST https://hongdam.net/api/swan/${id}/state {"state":"ok"} with Bearer TASKS_ADMIN. Its page: https://hongdam.net/swan/${id}`,
    ]))
  }
  return json({ ok: true, id, key, state, due: row.due })
}

async function setState(request, env, id) {
  if (!admin(request, env)) return json({ ok: false, why: 'auth' }, 401)
  const b = await bodyOf(request)
  if (!['ok', 'hidden'].includes(b.state)) return json({ ok: false, why: 'state' }, 400)
  const db = env.TASKS
  const up = db.prepare("UPDATE swan SET state = ?, why = CASE WHEN ? = 'ok' THEN NULL ELSE 'team' END, reports = CASE WHEN ? = 'ok' THEN 0 ELSE reports END WHERE id = ? AND state != 'gone'")
    .bind(b.state, b.state, b.state, id)
  // listed again by the team: its old reports go, so one new report does not hide it again (CodeRabbit on #114)
  const res = b.state === 'ok' ? (await db.batch([up, db.prepare('DELETE FROM swan_report WHERE id = ?').bind(id)]))[0] : await up.run()
  return json({ ok: !!res.meta?.changes })
}

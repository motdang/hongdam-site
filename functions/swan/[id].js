/**
 * hongdam.net/swan/<id> — one prediction from Black Swan Event? (functions/api/swan/), with its own link preview:
 * the prediction as the title, its odds, size and check month as the description, and the odds picture
 * (docs/og/swan/o<0–4>.jpg, tools/blackswan_cards.mjs). The page is docs/<lang>/studio/black-swan/one/index.html
 * (tools/build_blackswan.py) in the language it was written in, or ?l=<lang>; its %%SW_…%% marks are filled here.
 */
import { ID_RE, LANGS, card, esc, pub } from '../_swan.js'

const COLS = 'id, text, lang, due, odds, size, name, state, yes, no, came, nope, created_at'

export async function onRequestGet({ request, env, params }) {
  const url = new URL(request.url)
  const id = String(params.id || '').toLowerCase()
  let r = null
  if (ID_RE.test(id) && env.TASKS) {
    try { r = await env.TASKS.prepare(`SELECT ${COLS} FROM swan WHERE id = ? AND state != 'gone'`).bind(id).first() } catch { r = null }
  }
  if (!r) {
    const nf = await env.ASSETS.fetch(new URL('/404.html', url))
    return new Response(nf.body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } })
  }
  const want = url.searchParams.get('l')
  const lang = LANGS.includes(want) ? want : LANGS.includes(r.lang) ? r.lang : 'en'
  const tpl = await env.ASSETS.fetch(new URL(`/${lang === 'en' ? '' : lang + '/'}studio/black-swan/one/`, url))
  if (!tpl.ok) return new Response('Not found', { status: 404 })
  const c = card(r, lang)
  const here = `https://hongdam.net/swan/${id}`
  const data = JSON.stringify(pub(r)).replace(/</g, '\\u003c')
  const h1 = r.state === 'ok' ? esc(`“${r.text}”`) : ''
  const html = (await tpl.text())
    .replaceAll('%%SW_TITLE%%', esc(c.title)).replaceAll('%%SW_DESC%%', esc(c.desc)).replaceAll('%%SW_URL%%', here)
    .replaceAll('%%SW_IMG%%', `https://hongdam.net/${c.img}`).replaceAll('%%SW_ALT%%', esc(c.alt))
    .replaceAll('%%SW_H1%%', h1).replaceAll('%%SW_DATA%%', data).replaceAll('%%SW_NOINDEX%%', r.state === 'ok' ? '' : '<meta name="robots" content="noindex">')
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } })
}

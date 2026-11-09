/**
 * hongdam.net/swan/<id> — one prediction from Black Swan Event? (functions/api/swan/), with its own link preview:
 * the prediction as the title, its odds, size and check month as the description, and the odds picture
 * (docs/og/swan/o<0–4>.jpg, tools/blackswan_cards.mjs). The page is docs/<lang>/studio/black-swan/one/index.html
 * (tools/build_blackswan.py) in the language it was written in, or ?l=<lang>; its %%SW_…%% marks are filled here,
 * noindex: a prediction is a page to share, not to be listed by search engines;
 * in one pass, so a prediction's own words are never read as a mark or a replacement pattern (CodeRabbit on #114).
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
  if (!r) {   // the site's own 404 page (the swan game), as Pages serves it for any missing address
    const nf = await env.ASSETS.fetch(new URL('/swan-404-' + Date.now().toString(36), url))
    return new Response(nf.body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, notranslate' } })
  }
  const want = url.searchParams.get('l')
  const lang = LANGS.includes(want) ? want : LANGS.includes(r.lang) ? r.lang : 'en'
  const tpl = await env.ASSETS.fetch(new URL(`/${lang === 'en' ? '' : lang + '/'}studio/black-swan/one/`, url))
  if (!tpl.ok) return new Response('Not found', { status: 404 })
  const c = card(r, lang)
  const fill = {
    TITLE: esc(c.title), DESC: esc(c.desc), URL: `https://hongdam.net/swan/${id}`, IMG: `https://hongdam.net/${c.img}`, ALT: esc(c.alt),
    H1: r.state === 'ok' ? esc(`“${r.text}”`) : '', DATA: JSON.stringify(pub(r)).replace(/</g, '\\u003c'),
    NOINDEX: '<meta name="robots" content="noindex">',   // shared, not listed by search engines (CodeRabbit on #117)
  }
  const html = (await tpl.text()).replace(/%%SW_([A-Z0-9]+)%%/g, (m, k) => (Object.hasOwn(fill, k) ? fill[k] : m))
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60',
    'x-robots-tag': 'noindex, notranslate' } })
}

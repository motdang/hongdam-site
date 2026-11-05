/**
 * GET /api/fx — baht per US dollar and per euro, for the ฿ / $ / € switch (docs/assets/cur.js).
 *   {base: "THB", rates: {USD, EUR}, at, src, stale?, suggest}
 * suggest is the currency for the reader's country (functions/_fx.js). rates is null while no feed has answered yet.
 */
import { rates, suggest } from '../_fx.js'

export async function onRequestGet({ request, env }) {
  const r = await rates(env)
  const body = { base: 'THB', rates: r ? { USD: r.rates.USD, EUR: r.rates.EUR } : null, at: r?.at || null, src: r?.src || null,
    ...(r?.stale ? { stale: true } : {}), suggest: suggest(request.cf?.country || '') }
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, max-age=600', 'access-control-allow-origin': '*' },
  })
}

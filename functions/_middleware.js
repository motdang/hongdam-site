/**
 * Every request to hongdam.net passes through here. Four jobs:
 *
 * 1. THE EDGE COUNT. One row per request, in the blob order traffic-eye's
 *    src/collector.js uses, into the same `traffic_eye` dataset motdang.net
 *    writes to — host, category, agent, path, country, status, referrer host,
 *    method. The referring URL is reduced to its host before it is stored.
 *    (Why middleware and not the traffic-eye collector: on a hostname that is
 *    a Pages custom domain there is no origin behind the edge, so a Worker in
 *    front would fetch itself. Middleware hands on with `next()` instead.)
 *
 * 2. THE PAGE SCRIPTS. Every HTML page, static or written by a Function, gets
 *    /assets/hd.js (what people do on the page, sent to /api/hit and read on
 *    /stats/) and /assets/eggs.js (the easter egg each page hides), appended
 *    to <body> by HTMLRewriter. One place, so a page added later has them too.
 *
 * 3. ONE SERVICE'S LINK CARD. /buy/?c=<service> and /ask/?about=<service>, in any language, are one static
 *    page each; a link to one of them shows that service in a preview (her ask 2026-10-24): its name, line,
 *    price and picture from _share_data.js (tools/build_shop.py) replace the page's own in the head.
 *
 * 4. NO GOOGLE TRANSLATE. Every HTML page gets translate="no" and class "notranslate" on <html> and
 *    <meta name="google" content="notranslate"> in <head>, so Chrome offers no translation (her word
 *    2026-10-26: "google translate needs to be turned off everywhere on hongdam.net").
 *
 * THE CONTRACT
 * This runs on every request to a live site, so it must not be able to break
 * one. `next()` is called first; recording and the rewrite each sit in a
 * try/catch whose failure path hands back the page as it came.
 */
import { classify } from './_classify.js';
import { SHARE } from './_share_data.js';

const SCRIPTS = '<script type="module" src="/assets/hd.js"></script><script type="module" src="/assets/eggs.js"></script>';
const NO_TRANSLATE = '<meta name="google" content="notranslate">';

export function noTranslateClass(cls) {
  const words = (cls || '').split(/\s+/).filter(Boolean);
  return words.includes('notranslate') ? words.join(' ') : [...words, 'notranslate'].join(' ');
}

export async function onRequest(context) {
  const started = Date.now();
  const response = await context.next();
  try {
    context.waitUntil(record(context, response, Date.now() - started));
  } catch {
    // Recording is never worth an error page.
  }
  try {
    return withScripts(context.request, response);
  } catch {
    return response;
  }
}

function withScripts(request, response) {
  if (request.method !== 'GET' || (response.status !== 200 && response.status !== 404)) return response;
  if (!(response.headers.get('content-type') || '').includes('text/html')) return response;
  const rw = new HTMLRewriter()
    .on('html', { element(el) {
      el.setAttribute('translate', 'no');
      el.setAttribute('class', noTranslateClass(el.getAttribute('class')));
    } })
    .on('head', { element(el) { el.append(NO_TRANSLATE, { html: true }); } })
    .on('body', { element(el) { el.append(SCRIPTS, { html: true }); } });
  const card = serviceCard(new URL(request.url));
  if (card) {
    rw.on('title', { element(el) { el.setInnerContent(card.title); } })
      .on('meta', { element(el) {
        const v = card.meta[el.getAttribute('property') || el.getAttribute('name')];
        if (v) el.setAttribute('content', v);
      } });
  }
  return rw.transform(response);
}

const SITE = 'https://hongdam.net';
const ONE = /^\/(?:(th|my|zh|de)\/)?(buy|ask)\/$/;

export function serviceCard(url) {
  const m = url.pathname.match(ONE);
  if (!m || url.searchParams.has('ref')) return null;
  const key = m[2] === 'buy' ? 'c' : 'about';
  const id = url.searchParams.get(key);
  const s = id && Object.hasOwn(SHARE, id) ? SHARE[id] : null;
  if (!s || s.k !== m[2]) return null;
  const [title, desc, alt] = s[m[1] || 'en'] || s.en;
  const here = `${SITE}${url.pathname}?${key}=${encodeURIComponent(id)}`;
  const img = `${SITE}/${s.i}`;
  return { title, meta: {
    description: desc, 'og:title': title, 'og:description': desc, 'og:url': here, 'og:image': img, 'og:image:alt': alt,
    'twitter:title': title, 'twitter:description': desc, 'twitter:image': img, 'twitter:image:alt': alt,
  } };
}

async function record(context, response, ms) {
  const env = context.env;
  if (!env || !env.TRAFFIC) return; // binding not attached yet — nothing to do

  const request = context.request;
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent') || '';
  const { category, agent } = classify(ua, { asn: request.cf?.asn, headers: request.headers });

  let refHost = '';
  const ref = request.headers.get('referer');
  if (ref) {
    try {
      const r = new URL(ref);
      refHost = r.host === url.host ? '(same site)' : r.host;
    } catch {
      refHost = '(unparseable)';
    }
  }

  env.TRAFFIC.writeDataPoint({
    blobs: [
      url.host,
      category,
      agent,
      trimPath(url.pathname),
      request.cf?.country || 'XX',
      String(response.status),
      refHost,
      request.method,
    ],
    doubles: [1, response.status, ms],
    indexes: [url.host],
  });
}

function trimPath(pathname) {
  return pathname.length > 96 ? pathname.slice(0, 96) + '…' : pathname;
}

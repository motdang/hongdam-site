/**
 * Every request to hongdam.net passes through here. Two jobs:
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
 * THE CONTRACT
 * This runs on every request to a live site, so it must not be able to break
 * one. `next()` is called first; recording and the rewrite each sit in a
 * try/catch whose failure path hands back the page as it came.
 */
import { classify } from './_classify.js';

const SCRIPTS = '<script type="module" src="/assets/hd.js"></script><script type="module" src="/assets/eggs.js"></script>';

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
  return new HTMLRewriter()
    .on('body', { element(el) { el.append(SCRIPTS, { html: true }); } })
    .transform(response);
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

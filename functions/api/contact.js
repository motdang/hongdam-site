/**
 * POST /api/contact — relays the order form on hongdam.net/ (and /th/, /translation/)
 * to Nan. A writer gives an email address or a LINE ID; `service` names the row ordered and
 * `svc` its id, which counts as one order in that service's monthly Shoup walk (functions/_services.js).
 *
 * The destination address stays on the server: it lives here and in
 * the Pages environment. Requires two secrets on the Pages project:
 *   RESEND_API_KEY   full-access Resend key
 *   CONTACT_TO       destination mailbox
 * CONTACT_FROM is optional and defaults to a verified send.motdang.net sender.
 */

import { record, whoHash } from '../_services.js'

const LIMITS = { name: 120, email: 200, line: 80, service: 200, page: 200, message: 4000 };

const reply = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

// Single-line fields: collapse everything. Header injection dies here too.
const clean = (v, max) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

// Message body: keep the writer's paragraphs, tidy the rest.
const cleanBody = (v, max) =>
  typeof v === "string"
    ? v.replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ")
       .replace(/\n{3,}/g, "\n\n").trim().slice(0, max)
    : "";

// Deliberately permissive: one @, a dot in the domain, no spaces.
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v);

export async function onRequestPost({ request, env }) {
  let form;
  try {
    const ct = request.headers.get("content-type") || "";
    form = ct.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return reply(400, { ok: false, error: "Could not read that form." });
  }

  // Honeypot: a real person never fills a field they cannot see.
  if (clean(form.website, 80)) return reply(200, { ok: true });

  const name = clean(form.name, LIMITS.name);
  const email = clean(form.email, LIMITS.email);
  const line = clean(form.line, LIMITS.line);
  const service = clean(form.service, LIMITS.service);
  const svc = clean(form.svc, 40);
  const page = clean(form.page, LIMITS.page).replace(/[^\w\/.#-]/g, "");
  const message = cleanBody(form.message, LIMITS.message);

  if (email && !looksLikeEmail(email))
    return reply(400, { ok: false, error: "That email address does not look right." });
  if (!email && !line)
    return reply(400, { ok: false, error: "An email address or a LINE ID, please." });
  if (message.length < 2)
    return reply(400, { ok: false, error: "Please say what you need." });

  if (!env.RESEND_API_KEY || !env.CONTACT_TO)
    return reply(500, { ok: false, error: "Mail is not configured yet." });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM || "Hongdam <hongdam@send.motdang.net>",
      to: [env.CONTACT_TO],
      ...(email ? { reply_to: email } : {}),
      subject: `hongdam.net — ${service ? service + " — " : ""}${name || email || "LINE " + line}`,
      text: [
        `From: ${name || "(no name)"}${email ? ` <${email}>` : ""}`,
        ...(line ? [`LINE: ${line}`] : []),
        ...(service ? [`Service: ${service}`] : []),
        `Page: ${new URL(request.url).origin}${page || "/"}`,
        "",
        message,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("resend", res.status, await res.text());
    return reply(502, { ok: false, error: "Could not send that just now." });
  }
  if (svc && (await counted(env, request))) await record(env.TASKS, svc, await whoHash(email || "line:" + line), "form");
  return reply(200, { ok: true });
}

// At most three orders a day from one address count toward prices.
async function counted(env, request) {
  if (!env.RT_LIMIT) return true;
  const ip = request.headers.get("cf-connecting-ip") || "?";
  const k = `svc:${ip}:${new Date().toISOString().slice(0, 10)}`;
  const n = Number(await env.RT_LIMIT.get(k)) || 0;
  if (n >= 3) return false;
  await env.RT_LIMIT.put(k, String(n + 1), { expirationTtl: 2 * 86400 });
  return true;
}

// A bare GET on the endpoint should not look like a broken page.
export const onRequestGet = () => reply(405, { ok: false, error: "POST only." });

/**
 * POST /api/contact — relays the order form on hongdam.net/ (and /th/, /translation/), the Ask page and the request
 * form on each job page (/arrange/<job>/) to the team. A writer gives an email address, a LINE ID or a phone number,
 * and `reply` says which one to answer on; `service` names the row ordered and `svc` its id, which counts as one order
 * in that service's monthly Shoup walk (functions/_services.js); `job` names the job page.
 *
 * The answer carries the request's number (ref, Q-xxxxxx), the one on its Team Wheel ticket and its mail. A request
 * sent again with the same key `k` (a second press, a resend after a dropped answer) gets the first one's number and
 * goes to the team once: the key and its ref sit in RT_LIMIT for a day.
 *
 * The destination address stays on the server: it lives here and in
 * the Pages environment. Requires two secrets on the Pages project:
 *   RESEND_API_KEY   full-access Resend key
 *   CONTACT_TO       destination mailbox
 * CONTACT_FROM is optional and defaults to a verified send.motdang.net sender.
 */

import { record, whoHash } from '../_services.js'
import { tryOnce } from '../_tries.js'
import { toWheel, askDraft } from '../_wheel.js'

const LIMITS = { name: 120, email: 200, line: 80, phone: 40, service: 200, page: 200, message: 4000 };
const REPLY = { line: "LINE", email: "email", phone: "phone" };

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
  const phone = clean(form.phone, LIMITS.phone);
  const replyBy = Object.hasOwn(REPLY, form.reply) ? form.reply : "";
  const job = clean(form.job, 40).replace(/[^\w-]/g, "");
  const key = /^[a-z0-9]{8,24}$/.test(form.k || "") ? form.k : "";
  const service = clean(form.service, LIMITS.service);
  const svc = clean(form.svc, 40);
  const page = clean(form.page, LIMITS.page).replace(/[^\w\/.#-]/g, "");
  const message = cleanBody(form.message, LIMITS.message);

  if (email && !looksLikeEmail(email))
    return reply(400, { ok: false, error: "That email address does not look right." });
  if (!email && !line && !phone)
    return reply(400, { ok: false, error: "An email address, a LINE ID or a phone number, please." });
  if (message.length < 2)
    return reply(400, { ok: false, error: "Please say what you need." });

  if ((!env.RESEND_API_KEY || !env.CONTACT_TO) && !env.WHEEL_SHOP_KEY)
    return reply(500, { ok: false, error: "Mail is not configured yet." });

  // the same request again: the number it got the first time, and nothing sent twice
  const seen = key && env.RT_LIMIT ? await env.RT_LIMIT.get("ask:" + key).catch(() => null) : null;
  if (seen) return reply(200, { ok: true, ref: seen, again: true });

  // the question's ticket on the Team Wheel (functions/_wheel.js) first, and the same ref on the mail
  const ref = "Q-" + crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, "0").slice(-6);
  const lang = ["en", "th", "my", "zh", "de"].includes(form.lang) ? form.lang : (page.match(/^\/(th|my|zh|de)\//) || [])[1] || "en";
  const contact = replyBy === "phone" && phone ? phone : replyBy === "email" && email ? email : line ? "LINE " + line : email || phone;
  const ask = askDraft({ ref, service, message, contact, lang, page: page ? new URL(request.url).origin + page : "" });
  const ways = [email && `✉️ ${email}`, line && `💬 LINE ${line}`, phone && `📞 ${phone}`].filter(Boolean);
  if (ways.length > 1 || name || replyBy) ask.notes = `👤 ${ways.join(" · ")}${name ? ` · ${name}` : ""}${replyBy ? `\n↩️ Reply by ${REPLY[replyBy]}` : ""}`;
  const took = await toWheel(env, ask);

  const res = env.RESEND_API_KEY && env.CONTACT_TO && await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM || "Hongdam <hongdam@send.motdang.net>",
      to: [env.CONTACT_TO],
      ...(email ? { reply_to: email } : {}),
      subject: `hongdam.net — ${ref} — ${service ? service + " — " : ""}${name || email || (line ? "LINE " + line : phone)}`,
      text: [
        `From: ${name || "(no name)"}${email ? ` <${email}>` : ""}`,
        ...(line ? [`LINE: ${line}`] : []),
        ...(phone ? [`Phone: ${phone}`] : []),
        ...(replyBy ? [`Reply by: ${REPLY[replyBy]}`] : []),
        ...(service ? [`Service: ${service}${job ? ` (${job})` : ""}`] : []),
        `Page: ${new URL(request.url).origin}${page || "/"}`,
        "",
        message,
      ].join("\n"),
    }),
  });

  if (res && !res.ok) console.error("resend", res.status, await res.text());
  if (!(res && res.ok) && !took) return reply(502, { ok: false, error: "Could not send that just now." });
  if (key && env.RT_LIMIT) await env.RT_LIMIT.put("ask:" + key, ref, { expirationTtl: 86400 }).catch(() => {});
  if (svc && (await counted(env, request))) await record(env.TASKS, svc, await whoHash(email || (line ? "line:" + line : "tel:" + phone)), "form");
  return reply(200, { ok: true, ref });
}

// At most three form orders a day from one address count toward prices (atomic D1 counter, functions/_tries.js).
async function counted(env, request) {
  const ip = request.headers.get("cf-connecting-ip") || "?";
  return tryOnce(env.TASKS, [["form:ip:" + ip, 3]]);
}

// A bare GET on the endpoint should not look like a broken page.
export const onRequestGet = () => reply(405, { ok: false, error: "POST only." });

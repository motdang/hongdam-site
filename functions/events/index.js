/**
 * hongdam.net/events — tech and AI events in Chiang Mai and Chiang Rai, rendered on the server
 * from motdang.net/tech/events.json, which motdang reads from Luma, Meetup, its own calendars
 * and pages on sites.motdang.net every 30 minutes (NaN 2026-10-20: "I want the actual websites
 * of Motdang and Hongdam to do a better job featuring these events. Should always be updating").
 */
const ORIGIN = 'https://hongdam.net'
const FEED = 'https://motdang.net/tech/events.json?kind=tech&n=80&days=90'
const safe = (u) => { try { const x = new URL(String(u || '')); return /^https?:$/.test(x.protocol) ? x.href : '' } catch { return '' } }
// Monday 00:00 in Bangkok, `n` weeks on from this one, as UTC ms
const weekStart = (ms, n) => { const b = new Date(ms + 7 * 3600e3); return Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()) - ((b.getUTCDay() + 6) % 7) * 864e5 + n * 7 * 864e5 - 7 * 3600e3 }
const e = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const CSS = `
.go{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 26px}
.btn{display:inline-block;background:var(--gold);color:var(--lacquer);border-radius:999px;padding:9px 16px;font-size:15px;font-weight:600}
.btn.alt{background:transparent;color:var(--gold);border:1px solid var(--gold-deep)}
.btn:hover{color:var(--lacquer);background:var(--cream)} .btn.alt:hover{background:var(--lacquer-3);color:var(--cream)}
h2.wk{margin:30px 0 12px;font-size:20px;border-bottom:1px solid var(--line);padding-bottom:6px}
.ev{display:grid;grid-template-columns:62px 1fr;gap:14px;background:var(--lacquer-2);border:1px solid var(--line);border-radius:12px;padding:14px;margin:0 0 12px}
.d{border:1px solid var(--gold-deep);border-radius:10px;text-align:center;padding:6px 2px;color:var(--gold);font:600 22px/1.1 Georgia,serif;align-self:start}
.d small{display:block;font:500 12px/1.3 system-ui,sans-serif;color:var(--gold-deep);letter-spacing:.06em;text-transform:uppercase}
.ev h3{font-size:17px;line-height:1.35;color:var(--cream);font-weight:600} .ev h3 a{color:inherit}
.m{color:var(--cream-dim);font-size:15px}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.tag{font-size:12px;border:1px solid var(--line);border-radius:999px;padding:1px 9px;color:var(--cream-dim)}
.tag.free{border-color:var(--jade);color:var(--jade)}.tag.paid{border-color:var(--gold-deep);color:var(--gold)}
.acts{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px;font-size:15px}
.none{color:var(--cream-dim)} .src{margin-top:34px;color:var(--cream-dim);font-size:14px}
@media (max-width:420px){.ev{grid-template-columns:50px 1fr;gap:10px}.d{font-size:18px}}`

function weeks(list) {
  const wk = (n) => weekStart(Date.now(), n)
  const used = new Set()
  return [['This week · สัปดาห์นี้', (s) => s < wk(1)], ['Next week · สัปดาห์หน้า', (s) => s < wk(2)], ['Later · หลังจากนั้น', () => true]].map(([h, f]) => {
    const mine = list.filter((x) => !used.has(x.id) && f(Date.parse(x.start)))
    mine.forEach((x) => used.add(x.id))
    return mine.length ? `<h2 class="wk">${h}</h2>` + mine.map(card).join('') : ''
  }).join('')
}

function card(raw) {
  const x = { ...raw, url: safe(raw.url), hostUrl: safe(raw.hostUrl), ics: safe(raw.ics), place: raw.place && safe(raw.place.url) ? { name: raw.place.name, url: safe(raw.place.url) } : null }
  const dd = new Date(Date.parse(x.start) + 7 * 3600e3)
  const where = x.place ? `<a href="${e(x.place.url)}">${e(x.place.name)}</a>` : e(x.venue || x.area || '')
  const tags = [
    x.cost ? (/^free$/i.test(x.cost) ? '<span class="tag free">Free · ฟรี</span>' : `<span class="tag paid">${e(x.cost)}</span>`) : '',
    x.approval ? '<span class="tag">host approves guests</span>' : '',
  ].join('')
  return `<article class="ev"><div class="d">${dd.getUTCDate()}<small>${e(x.when.en.split(' ')[0])}</small></div><div>
<h3>${x.url ? `<a href="${e(x.url)}" rel="noopener">${e(x.title)}</a>` : e(x.title)}</h3>
<p class="m">${e(x.when.en)}${x.when.time ? ' · ' + e(x.when.time) : ''}${where ? ' · ' + where : ''}</p>
${x.host ? `<p class="m">Host: ${x.hostUrl ? `<a href="${e(x.hostUrl)}" rel="noopener">${e(x.host)}</a>` : e(x.host)}</p>` : ''}
${tags ? `<div class="tags">${tags}</div>` : ''}
<p class="acts">${x.url ? `<a href="${e(x.url)}" rel="noopener">Register / details ↗</a>` : ''}${x.ics ? `<a href="${e(x.ics)}">Add to calendar</a>` : ''}</p></div></article>`
}

export async function onRequestGet() {
  let list = [], ok = true
  try {
    const r = await fetch(FEED, { cf: { cacheTtl: 300, cacheEverything: true } })
    list = r.ok ? (await r.json()).events || [] : []
    ok = r.ok
  } catch { ok = false }
  const ld = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Tech & AI events in Chiang Mai and Chiang Rai', itemListElement: list.slice(0, 40).map((x, i) => ({
    '@type': 'ListItem', position: i + 1, item: { '@type': 'Event', name: x.title, startDate: x.start, ...(x.end ? { endDate: x.end } : {}), url: safe(x.url) || 'https://motdang.net/tech/',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', location: { '@type': 'Place', name: (x.place && x.place.name) || x.venue || x.area || 'Chiang Mai' } } })) }
  const title = 'Tech & AI events · Chiang Mai and Chiang Rai · Hongdam'
  const desc = 'Meetups, talks and workshops on AI, code and startups in northern Thailand, read from motdang.net every 30 minutes.'
  const body = `<h1>Tech &amp; AI events<span lang="th">งานเทคและ AI</span></h1>
<p class="lede">Meetups, talks and workshops on AI, code and startups in Chiang Mai and Chiang Rai. The list comes from <a href="https://motdang.net/tech/">motdang.net/tech</a>, read from Luma, Meetup and Mot Dang's calendars every 30 minutes.</p>
<div class="go"><a class="btn" href="webcal://motdang.net/tech/events.ics">Follow in your calendar</a><a class="btn alt" href="https://motdang.net/tech/">motdang.net/tech</a><a class="btn alt" href="/tasks">Bring a problem · Tasks</a><a class="btn alt" href="https://sites.motdang.net/make">List your event</a></div>
${list.length ? weeks(list) : `<p class="none">${ok ? 'Nothing listed for now.' : 'The list did not load just now. <a href="https://motdang.net/tech/">motdang.net/tech</a> has it.'}</p>`}
<p class="src">Check with the host before you go. Run a group or meetup? Make it a free page on <a href="https://sites.motdang.net/make">sites.motdang.net</a> with your Luma or Meetup link and its events show here.</p>`
  return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(title)}</title><meta name="description" content="${e(desc)}">
<meta property="og:type" content="website"><meta property="og:title" content="Tech & AI events · Chiang Mai and Chiang Rai"><meta property="og:description" content="${e(desc)}">
<meta property="og:url" content="${ORIGIN}/events"><meta property="og:image" content="${ORIGIN}/assets/card.jpg"><meta property="og:image:alt" content="Hongdam หงส์ดำ, Chiang Rai"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg"><link rel="canonical" href="${ORIGIN}/events"><link rel="alternate" type="text/calendar" href="https://motdang.net/tech/events.ics">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<link rel="stylesheet" href="/assets/rt.css"><style>${CSS}</style></head><body>
<header class="top"><a class="mark" href="/">HONGDAM <span lang="th">หงส์ดำ</span></a>
<nav><a href="/events" aria-current="page">Events</a><a href="/tasks">Tasks</a><a href="/bots/">Bots</a><a href="/translation/">Translation</a></nav></header>
<main>${body}</main>
<footer><span lang="th">หงส์ดำ</span> Hongdam · Chiang Rai · events from <a href="https://motdang.net/tech/">Mot Dang</a> · <a href="https://motdang.net/tech/events.json">events.json</a></footer>
</body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } })
}

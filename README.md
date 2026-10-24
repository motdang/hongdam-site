# Hongdam — hongdam.net

Services site for Hongdam, Chiang Rai. The front page lists every service with its price,
English at `/` and Thai at `/th/`: `data/services.json` → `python3 tools/build_services.py`
→ `docs/index.html`, `docs/th/index.html` and the services block of `docs/llms.txt`. A new
service is one more item in the JSON. GitHub, PHP fix and bot prices come from `/api/github`,
`/api/php` and `/api/bots` (at build time, and again in the page when it loads); `--offline`
uses `data/services.live.json`. The build stops when a price disagrees with its task-graph
node. `/services` redirects to `/` (`docs/_redirects`). Orders go to `/api/contact`, which
takes an email address or a LINE ID. The portfolio is at `/portfolio/`.

Prices walk monthly by Shoup's rule (her word 2026-10-15; monthly walk asked 2026-10-23): an item with
`baht` (or `pct`, for sourcing) and its floor, ceiling and slots a month is written by the build into
`functions/_services_data.js`; `functions/_services.js` walks it on the 1st, 00:00 Bangkok (over 80% of
slots ordered last month, one step up; under 60%, one down), first check 1 December 2026. Orders are
rows in `svc_order` (D1 hongdam-tasks, `migrations/0006_services.sql`): the page's form through
`/api/contact`, and team orders by `POST /api/services/order {svc, note}` with `Bearer TASKS_ADMIN`.
`GET /api/services` gives every price and its walk. Grab rows (`walk: "desk"`) are walked by the
Hongdam Desk bot (hongdam-desk/grab.py), which posts its price to `/api/services/price`.
`node tests/services.test.mjs`; `node tools/services_sim.mjs` runs a year under four demands.

## Publishing

Live at https://hongdam.net (Cloudflare Pages project `hongdam`). A merge to `main`
in github.com/motdang/hongdam-site goes live within about five minutes:
motdang-server runs `/srv/site-deploy/deploy_on_merge.sh` every five minutes and
deploys `docs/` and `functions/`. Ledger: `/srv/state/site-deploy.tsv` on the server.
Roll back by reverting the commit on `main`, or in the Cloudflare dashboard.
Bindings and secrets (`AI`, `RT_LIMIT`, Resend) live on the Pages project, not here.

## Contrast gate

Her word 2026-10-22: every page under `docs/` meets WCAG AA contrast (4.5 for body
text, 3 for large text) at phone and desktop width, in light and dark, in English and
Thai, at the top and scrolled, and on each tab. `node tools/contrast/run.mjs` checks
them all in about 80 seconds; `node tools/contrast/run.mjs for/cca` checks pages whose
path contains `for/cca`. Node 22+ and Chrome; nothing to install. Pages that read `/api/...` get their answers
from live hongdam.net (GET only), so the gate sees the content people see; a failed read
or a page that does not load fails the run.

The GitHub check "gate: contrast" (`.github/workflows/gate-contrast.yml`) runs it on
every pull request and every commit to `main`. `pr-push` waits for it and leaves the PR
open when it is red. The server's deploy holds a commit on `main` until it is green
(`held` in `/srv/state/site-deploy.tsv`).

What it measures: each visible run of text against the colours behind it. Over a
photograph, against the overlay gradient laid on the lightest tenth of the part of the
photo behind the text. Faded text counts at its faded strength. Gradient-filled text
counts at its weakest colour. A see-through fixed bar counts against what scrolls
under it. Text not shown yet (a fade-in that has not run), hidden text, and switched-off
controls (`disabled`, `aria-disabled="true"`) are left out, as WCAG leaves them out.

## What's in this build (v2, expanded per Nan's request)

- **Real screenshots, not mockups.** 12 pages were captured live with headless
  Chrome (`docs/assets/screens/`) — motdang.net, wichaa.net, poplucky.net,
  defiant.to, hakfarang.net, nanobotco.github.io/offramp, nanobotco.github.io,
  nanobotco.github.io/skipdjt, and three wichaa.net instrument pages (jovilabe,
  divination, moon — moon/redspot kept as parallax background art only, not
  listed as separate repos since they're pages inside the Lanna repo, not repos
  of their own). Each sits in a fake browser-chrome frame (dots + URL bar) so
  it reads as a genuine screenshot, not a photo.
- **All 38 public NaNoBotCo repos are represented** — verified live via
  `gh repo list` on 2026-07-30, cross-checked against the `project_git_repos`
  memory for which ones are deliberately private. The 8–10 with a real live
  URL got full screenshot treatment; the other ~28 (APIs, CLIs, crawlers, a
  text game, SMAPI mod, etc. — genuinely no "sight" to screenshot) got a
  designed icon-tile grid instead, grouped by category, each linking straight
  to its GitHub repo. Nothing fake-screenshotted.
- **Excluded on purpose:** `spec-hud`, `coucal-clock`, `catalog-pipeline`,
  `acr-hud`, `manuscript-crawler` (all private on GitHub already), plus
  anything never pushed at all — `khwan`, `tel`, `michael-go-court`/legal
  material, `photo-mine`, `rusty-chandelier` (client-owned). None of these
  appear anywhere on the page.
- **Hero graphics** are wichaa.net's own share-card art (`docs/assets/graphics/`
  — moon complication, red spot dial, jovilabe, atlas), used as a parallax
  background layer (JS `translateY` on scroll, `prefers-reduced-motion`
  respected) plus a drifting animated-gradient backdrop.
- **On the photo roll:** I didn't browse it. `photo-mine`'s own `BOTS.md` /
  `RABBIT_HOLES.md` document real passport, bank-card, financial, and medical
  hits mixed into that library — not something to page through for a business
  site's hero art. If there are specific photos you want used, export them
  (or point me to a folder) and I'll drop them in; otherwise wichaa.net's
  existing graphics are covering the "visual" ask safely.

## v3 — scroll-driven vertical animations (2026-07-30)

- **Top progress bar** fills across the viewport width as you scroll the page.
- **Continuous parallax inside each screenshot frame** — the captured page drifts
  slightly within its browser-chrome window as it passes through view (not just
  an entrance effect; keeps moving the whole time the card is on screen).
- **Staggered reveal** — cards/tiles fade + rise in with a slight cascade by
  column position, instead of all popping in at once.
- **Slow-rotating clock glyph** in the "offices overlooking the clocktower" card.
- All of it is one rAF-throttled scroll listener; geometry is measured once on
  load/resize, never inside the scroll handler itself (an earlier draft read
  `getBoundingClientRect()` per element on every scroll frame — real layout-
  thrashing risk, fixed before shipping).
- Tried native CSS `animation-timeline: view()/scroll()` first (the actual
  "scroll-driven animations" browser API) — pulled it back in favor of the
  plain JS version since it's more broadly predictable across engines, and the
  JS version already reuses a scroll-handler pattern proven earlier in this
  build. Visually the outcome is the same.
- The `.reveal` hidden state (`opacity:0`) is now gated behind an
  `html.reveal-ready` class JS adds right before wiring up the
  IntersectionObserver, plus a 1.5s force-reveal safety net — so content can
  never get stuck invisible if JS is slow, errors, or a browser lands straight
  on a scrolled anchor before the observer's first callback fires.

## v4 — lucky for Thai people and robots alike (2026-07-30)

**For people:**
- Bilingual title/description (`<title>` and meta description now carry Thai too).
- Favicon (`docs/assets/favicon.svg`) matching the nav mark.
- A permanent thin gold "gilt-edge" hairline across the very top of the page —
  a premium-print touch, not just the scroll-progress fill.
- A subtle grain-texture overlay (`feTurbulence` data-URI, `mix-blend-mode:overlay`,
  ~3.5% opacity) for a tactile, less flat-vector feel.
- Ornamental section dividers using ๛ (khomut) — the traditional Thai manuscript
  end-of-section mark. Chosen deliberately over generic decoration: it's real
  Thai typographic heritage, and it ties back to the Lanna-manuscript roots this
  whole body of work actually grew from.
- Footer closes with "ขอให้กิจการเจริญรุ่งเรือง" (a genuine, common Thai
  business-opening blessing — "may the business prosper") next to a small gold
  ๙ seal — เก้า/nine being a well-known auspicious number in Thai culture.
- Card/button hover states warmed from teal to gold, richer layered shadows.

**For robots:**
- JSON-LD structured data (`ProfessionalService` + an `ItemList` of the live
  portfolio) — both validated as parseable JSON.
- Full Open Graph / Twitter Card meta, canonical URL.
- `docs/robots.txt` explicitly welcomes named AI crawlers (GPTBot, ClaudeBot,
  anthropic-ai, Google-Extended, CCBot, PerplexityBot) — same stance Mot Dang
  and wichaa.net already take: crawlers are guests, not pests.
- `docs/llms.txt` — a short plain-language summary of what Hongdam is and does,
  for AI systems that read that convention.
- Footer explicitly links `/llms.txt` so human visitors can see the site means it.

## Still needed before this can go live

1. **Contact info** — email / LINE / phone. The contact section currently shows a
   visible "coming soon" placeholder instead of fake details.
2. **Friend's name** — for the "Built in partnership" credit line, currently generic.
3. **Confirm company name/spelling** — using "Hongdam" (EN) / ฮ่องดำ (rough Thai)
   as placeholders; correct if there's an official Thai name or logo.
4. **Repo + hosting** — per Nan's call, this will live under NaNoBotCo on GitHub for
   now (transfer to Hongdam's own account later). Needs:
   - `git init`, push to a new `NaNoBotCo/hongdam-site` (or similar) repo
   - GitHub Pages enabled on `docs/`, custom domain `hongdam.net` set in repo settings
   - a CNAME record (or A/ALIAS records per GitHub Pages docs) added at whichever
     registrar holds hongdam.net, pointing at NaNoBotCo's GitHub Pages
5. Once live, run the Mot Dang ad entry (already drafted, see below) through
   `build.py` and push, so the sponsor card goes live on motdang.net.

## Mot Dang ad entry (drafted, not yet built/pushed)

Added to `mot-dang/data/ads.json` locally:

```json
{
  "id": "hongdam",
  "th": "Hongdam — บริษัทเว็บดีไซน์เชียงราย เว็บสองภาษา แอปไลน์ ระบบข้อมูลจริง",
  "en": "Hongdam — Chiang Rai web studio: bilingual platforms, LINE-native apps, real data",
  "url": "https://hongdam.net"
}
```

This won't appear on the live site until `mot-dang`'s `build.py` is re-run and the
result is pushed — hold off until hongdam.net actually resolves, so the ad doesn't
link to a dead domain.

## Red team + market (built 2026-09-23, not deployed)

- `data/packs/*.json` → `python3 tools/build_market.py` → `docs/market/`, `functions/api/_packs.js`.
- `docs/redteam/` calls `functions/api/redteam.js`, which needs the Workers AI binding `AI`
  on the Pages project (optional KV `RT_LIMIT` for a per-address daily cap).
- Local: `.claude/rt-dev.sh` → http://localhost:8791/redteam (AI calls are remote and billed).

## Tasks — /tasks

A board for work done by people or bots, answered by Mot Dang, Hongdam and Chiang Mai
Visa Desk. Pages and the API are Pages Functions (`functions/tasks/`, `functions/api/tasks/`,
shared code in `functions/_tasks.js`) over D1 `hongdam-tasks` (binding `TASKS`,
schema `migrations/0001_tasks.sql`). Secrets on the Pages project: `TASKS_ADMIN`
(also `~/.tokens/HONGDAM_TASKS_ADMIN`), `DISCORD_TASKS` (#help-desk forum).

- Kinds of work: `data/tasks/graph.json`, one line per kind. `python3 tools/build_tasks.py`
  checks it and writes `functions/api/_taskgraph.js`, `docs/tasks/graph.json` and the drawn
  graph at `docs/tasks/graph/`. `--new` lists kinds posters named that the graph lacks.
- Our postings and the asks from other sites: `data/tasks/seed.json` → `seed.sql`;
  `--seed` loads new keys into D1 (existing keys are left alone).
- Shoup: `functions/_tasks.js` `shoup()` and `catBaht()`; `node tests/shoup.test.mjs`.
- Answer as one of ours: `POST /api/tasks/<id>/admin {"do":"answer","org":"hongdam","note","baht"}`
  with `Authorization: Bearer $TASKS_ADMIN`.

## PHP fix — /php

Bookings for PHP work after PHP2Shell (CVE-2026-109618, CVE-2026-109619), priced by Shoup the same way as /github. Page `docs/php/index.html`, prices and the weekly walk in `functions/_php.js` (KINDS, OPENED, relate), bookings and slips in `functions/api/php/[[path]].js`, table `php_order` in D1 `hongdam-tasks` (`migrations/0005_php.sql`, applied remote 2026-10-22). `node tests/php.test.mjs`.

The four kinds are Hosted site, Server, Upgrade and Five servers. After the walk a hosted site is priced at most as high as a server, an upgrade at least as high, and five servers at least the rung above a server. The US$ price is the baht at 33 to the dollar rounded to US$5 (`usd()` in `_php.js`). A booking counts toward slots and the walk when it is paid or done, or booked less than 48 hours ago. An Upgrade booking with PHP older than 7.4 is answered with a LINE message and no order.

The form takes a site name and a contact; server access is arranged on LINE after payment. GET `/api/php` answers any origin; POST answers hongdam.net, hongdam.pages.dev and localhost. The ip column of `php_order` is written null. nanobotco.github.io/php-patch links here and reads `/api/php`.
Upgrade scope (her pick 2026-10-22, option D): flat for WordPress, Drupal and Joomla; custom code gets 8 hours in the price, then a quote at ฿1,500 an hour, and the buyer can stop there with nothing more to pay.

## Studio

Hongdam Studio, the tech side (her ask 2026-10-24), is a site inside the shop: `/studio/` in five languages and the
notes under `/studio/notes/`, with Atom and JSON feeds at `/studio/feed.xml` and `/studio/feed.json`. Words, practices
and work: `data/studio/studio.json`; a practice sells shop cards at the shop's prices. Notes:
`data/studio/notes/<date>-<slug>.md`, written to `data/studio/brief.md`, checked by `tools/studio_check.py`.
`python3 tools/build_studio.py` builds the pages, feeds, sitemap block and llms.txt section; `node tools/studio_cards.mjs`
draws the link pictures; `tools/studio_publish.sh <note>` does all of it and publishes through pr-push. A scheduled task,
studio-notes, writes a note each morning in a clean clone, `../studio-desk`.

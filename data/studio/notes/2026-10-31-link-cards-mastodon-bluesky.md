{"title": "Link cards: each Mastodon server fetches your page, Bluesky freezes the card", "title_th": "การ์ดลิงก์: Mastodon ทุกเซิร์ฟเวอร์ดึงหน้าเว็บเอง ส่วน Bluesky เก็บการ์ดไว้ในโพสต์ตายตัว", "date": "2026-10-31", "beat": "last-mile",
 "dek": "Mastodon 4.7.4 reads only the first 1 MB of raw HTML, only og:image, and shows a wide picture only when it is wider than tall. Bluesky copies the card into the post once. What each needs, with three curl checks.",
 "dek_th": "Mastodon 4.7.4 อ่าน HTML แค่ 1 MB แรก ใช้รูปจาก og:image เท่านั้น และแสดงรูปใหญ่เฉพาะรูปที่กว้างกว่าสูง ส่วน Bluesky คัดลอกการ์ดลงในโพสต์ครั้งเดียวแล้วไม่เปลี่ยนอีก สรุปสิ่งที่แต่ละแห่งต้องการ พร้อมคำสั่ง curl สามบรรทัดไว้ตรวจเอง",
 "cards": ["vibe", "web-care"],
 "card": {"big": "Why your link card is blank", "sub": "What Mastodon and Bluesky read, from their code"},
 "sources": [
  {"t": "mastodon/app/services/fetch_link_card_service.rb at v4.7.4 · mastodon/mastodon", "u": "https://github.com/mastodon/mastodon/blob/v4.7.4/app/services/fetch_link_card_service.rb"},
  {"t": "mastodon/app/lib/link_details_extractor.rb at v4.7.4 · mastodon/mastodon", "u": "https://github.com/mastodon/mastodon/blob/v4.7.4/app/lib/link_details_extractor.rb"},
  {"t": "mastodon/app/lib/request.rb at v4.7.4 · mastodon/mastodon", "u": "https://github.com/mastodon/mastodon/blob/v4.7.4/app/lib/request.rb"},
  {"t": "mastodon/app/models/preview_card.rb at v4.7.4 · mastodon/mastodon", "u": "https://github.com/mastodon/mastodon/blob/v4.7.4/app/models/preview_card.rb"},
  {"t": "mastodon/app/javascript/mastodon/features/status/components/card.tsx at v4.7.4 · mastodon/mastodon", "u": "https://github.com/mastodon/mastodon/blob/v4.7.4/app/javascript/mastodon/features/status/components/card.tsx"},
  {"t": "mastodon/app/lib/activitypub/activity/create.rb at v4.7.4 · mastodon/mastodon", "u": "https://github.com/mastodon/mastodon/blob/v4.7.4/app/lib/activitypub/activity/create.rb"},
  {"t": "social-app/src/lib/link-meta/link-meta.ts at main · bluesky-social/social-app", "u": "https://github.com/bluesky-social/social-app/blob/main/src/lib/link-meta/link-meta.ts"},
  {"t": "atproto/packages/api/lexicons/app/bsky/embed/external.json at main · bluesky-social/atproto", "u": "https://github.com/bluesky-social/atproto/blob/main/packages/api/lexicons/app/bsky/embed/external.json"}
 ]}
---
A link card is the box with a picture, a title and a line of text that appears under a post when it contains a link. Mastodon and Bluesky build it in opposite ways. On Mastodon, every server that receives the post fetches your page itself. On Bluesky, the poster's app fetches it once and stores the card inside the post. A page that works on one can come out blank on the other, and the fixes differ.

Everything below comes from reading the code of Mastodon 4.7.4 (released 29 October 2026) and of the Bluesky app, not from their help pages. The measurements at the end come from five of our own notes, measured 31 October 2026.

## Mastodon reads raw HTML: no JavaScript runs

Mastodon asks for the page with `Accept: text/html` and a user agent (the name a program sends with each request) that ends in `Bot` [1]. It keeps the response only when the server answers 200 and the type is `text/html`, then parses the HTML as text [1][2]. No browser renders it, so tags that a single-page app (a site whose pages are drawn by JavaScript in the browser) adds after loading are invisible. A route that a static host serves through its 404 page, a common trick for such apps, answers 404 and gets no card at all.

It reads at most 1 megabyte of the response [3]. Tags placed after a large inline script or stylesheet can fall past that line.

## Mastodon's tag rules

| Card part | Where Mastodon reads it [2] |
|---|---|
| Title | JSON-LD `headline` first, then `og:title`, then `<title>` |
| Text | JSON-LD `description` first, then `og:description`, then `<meta name="description">` |
| Picture | `og:image` only; `twitter:image` is not read |
| Picture text | `og:image:alt` |
| Address | `<link rel="canonical">` or `og:url`, used only on the same domain as the page |
| Author byline | `fediverse:creator`, an account such as `@name@server` |

JSON-LD is structured data in a `<script type="application/ld+json">` block, mostly written for search engines. Mastodon uses it only when the top-level object is a `NewsArticle` or a `WebPage` [2]. The `@graph` form that many SEO plugins write is skipped, and the Open Graph tags win. A top-level `WebPage` block with its own `headline` replaces your `og:title` on the card.

The picture must be JPEG, PNG, GIF or WebP and under 8 MB [4]. An SVG or a larger file leaves the card without a picture: Mastodon saves the card anyway and drops the image [4]. Mastodon shrinks what it keeps to about 230,400 pixels, 640 × 360 [4].

## A wide picture needs to be wider than tall

The web interface shows the large, full-width card only when the stored picture's width is greater than its height, and crops it to 1.91 : 1 [5]. A square logo gets the small square thumbnail beside the text. A 1200 × 630 image, the usual Open Graph size, is 1.90 : 1 and fills the frame.

## Every server fetches, and caches for two weeks

When a post arrives from another server, Mastodon queues the card fetch at a random moment within the next minute [6]. Each server that receives the post does this on its own, so a post that reaches many servers brings one fetch from each, spread over about a minute, all with the `Bot` user agent. A firewall rule or bot filter that blocks them leaves those servers with no card.

Each server keeps a card per address and fetches it again only when it is more than two weeks old or lost its picture [1]. Mastodon does not build a card for a post that already has a photo or a quote attached [1].

## Bluesky freezes the card into the post

The Bluesky app asks a Bluesky service, cardyb.bsky.app, to read the page while the poster is writing [7]. The app uploads the picture into the post itself; the post format accepts at most 1,000,000 bytes for it [8]. After that the card is part of the post. A fixed `og:image` or a new title shows on new posts only; old posts keep what the page said when they were written.

## Measured: our five latest notes

| Note page | HTML | Position of first og:image tag | Picture | cardyb, median of 3 |
|---|---|---|---|---|
| DeepSeek Flash 1017 | 31.1 KB | byte 1,872 | 1200 × 630 JPEG, 94 KB | 1.27 s |
| Lovable agent tools | 31.9 KB | byte 1,854 | 1200 × 630 JPEG, 89 KB | 1.23 s |
| Magento PolyShell | 33.3 KB | byte 1,838 | 1200 × 630 JPEG, 93 KB | 1.23 s |
| GitHub Agentic Workflows | 31.1 KB | byte 1,842 | 1200 × 630 JPEG, 92 KB | 1.25 s |
| Thai tokens | 29.9 KB | byte 1,830 | 1200 × 630 JPEG, 92 KB | 1.20 s |

```chart
{"title": "Seconds for cardyb to read a page", "unit": " s", "lower_is_better": true,
 "rows": [["DeepSeek Flash 1017", 1.27], ["Lovable agent tools", 1.23], ["Magento PolyShell", 1.23], ["GitHub Agentic Workflows", 1.25], ["Thai tokens", 1.2]],
 "note": "Median of 3 requests per page, 4 seconds apart, measured 31 October 2026 from Chiang Rai."}
```

Each page answered 200 as `text/html` to a Mastodon-style request, and cardyb returned a title and a picture for each. Our pages carry their JSON-LD in an `@graph`, so Mastodon reads their Open Graph tags.

## Three checks before you post a link

Replace the address and run these in a terminal. The first prints the status code, the type and the size Mastodon gets. The second lists the tags inside Mastodon's first megabyte. The third shows what Bluesky's card service sees.

```bash
URL=https://example.com/your-page/
curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}\n' -A 'Mastodon/4.7.4 Bot' -H 'Accept: text/html' "$URL"
curl -s -A 'Mastodon/4.7.4 Bot' "$URL" | head -c 1048576 | grep -o '<meta[^>]*"\(og:[a-z:]*\|fediverse:creator\)"[^>]*>'
curl -s "https://cardyb.bsky.app/v1/extract?url=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=""))' "$URL")"
```

A first line other than `200 text/html`, an empty second command, or an empty `image` in the third each explains a blank card. For an app built in Lovable, Bolt or Replit, the usual fix is to write the Open Graph tags into the HTML the server sends, per page, rather than adding them with JavaScript after the page loads.

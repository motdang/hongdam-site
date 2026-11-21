{"title": "One Cloudflare Pages line moved a domain: 147 of 147 URLs in one hop, POSTs become GETs", "title_th": "ย้ายทั้งโดเมนด้วยบรรทัดเดียวใน Cloudflare Pages: 147 จาก 147 URL ถึงปลายทางในฮอปเดียว ส่วน POST ของฟอร์มกลายเป็น GET", "date": "2026-11-21", "beat": "last-mile",
 "dek": "One _redirects line sends each old path and its query string to the new address. Left without a code, the line is a 302. A 301 drops a form's POST. A 16-line check, and what Google's Change of Address tool asks for.",
 "dek_th": "ไฟล์ _redirects บรรทัดเดียวส่งทุกพาธเดิมพร้อม query string ไปยังที่อยู่ใหม่ ถ้าไม่ใส่รหัสท้ายบรรทัด Cloudflare จะตอบเป็น 302 ส่วน 301 ทำให้ POST ของฟอร์มกลายเป็น GET พร้อมสคริปต์ตรวจ 16 บรรทัด และเงื่อนไขของเครื่องมือ Change of Address ของ Google",
 "cards": ["web-move", "web-found", "web-dns"],
 "card": {"big": "A domain moved with one line", "sub": "147 of 147 URLs in one hop; forms need their own fix"},
 "sources": [
  {"t": "Redirects · Cloudflare Pages docs", "u": "https://developers.cloudflare.com/pages/configuration/redirects/"},
  {"t": "Pricing · Cloudflare Pages docs", "u": "https://developers.cloudflare.com/pages/functions/pricing/"},
  {"t": "docs/sitemap.xml · NaNoBotCo/defiant", "u": "https://github.com/NaNoBotCo/defiant/blob/main/docs/sitemap.xml"},
  {"t": "Site Moves and Migrations | Google Search Central", "u": "https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes"},
  {"t": "RFC 9110: HTTP Semantics", "u": "https://www.rfc-editor.org/rfc/rfc9110.html"},
  {"t": "Change of Address tool - Search Console Help", "u": "https://support.google.com/webmasters/answer/9370220?hl=en"},
  {"t": "GitHub Pages limits - GitHub Docs", "u": "https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits"},
  {"t": "Move your website to a new host · Hongdam", "u": "https://hongdam.net/web/web-move/"}
 ]}
---
A site that changes its address needs each old URL to answer with a redirect to the same page at the new address. On Cloudflare Pages that is one line in a text file. This week we moved a 147-page site of ours from its own domain, defiant.to, to a folder on GitHub Pages. Measured today: 147 of 147 old URLs reach their new page in one hop. The same line turns a form's POST into a GET, and the line's default status code is the temporary one.

## One line carries each path and its query string

Cloudflare Pages reads a file named `_redirects` in the published folder. Each line is a source, a destination and an optional status code [1]. An asterisk in the source matches the rest of the path, and `:splat` in the destination puts it back [1]:

```txt
/* https://example.github.io/newsite/:splat 301
```

A Pages project whose only file is this one, with the old domain attached as its custom domain, is the whole redirect server. Three facts from Cloudflare's page, read today [1]:

- The code is optional and defaults to 302, a temporary redirect. A line without `301` moves visitors and says the move is temporary.
- A file takes 2,000 static lines and 100 lines with a splat or placeholder. A whole-domain move uses one of the 100.
- Redirects in the file do not apply to requests that a Pages Function (server code inside the project) answers.

Cloudflare's pricing page says requests that invoke no Function are free and unlimited on the free and the paid plans [2]. A project with one text file invokes none.

What the line does with awkward requests, measured 21 November 2026 with curl, one request each:

| Request to the old domain | Answer |
|---|---|
| `/about/` | 301 to `/newsite/about/` |
| `/about/?utm_source=x&id=7` | 301, query string intact |
| `/a%20b/%E0%B8%81/` (a space and a Thai letter, encoded) | 301, encoding intact |
| `/no-such-page/` | 301; the new host then answers 404 |
| `//about/` | 301 to `/newsite/about/`, the double slash folded to one |
| `HEAD /about/` | 301 |
| `http://` in place of `https://` | 301 to `https://` on the old domain first, then the line |

The 301 carries no `Cache-Control` header. RFC 9110 lets a browser cache a 301 on its own judgement [5], so a wrong destination shipped for an hour can sit in visitors' browsers after the fix.

## 147 of 147 land in one hop; a missing slash costs a second hop

The new site's sitemap (its list of pages) has 147 URLs [3]. We requested each one on the old domain and followed the redirects: 147 answered 200 at the matching new URL after one hop. Then the 146 URLs other than the home page, with the final slash removed, as people type them: 146 answered 200 after two hops, because GitHub Pages adds the slash with a 301 of its own.

```chart
{"title": "Seconds to load /about/, redirects included", "unit": " s", "lower_is_better": true,
 "rows": [["New address, direct", 0.073], ["Old domain, one hop", 0.262], ["Old domain, no final slash, two hops", 0.283]],
 "note": "Median of 20 runs each, curl, measured 21 November 2026 from Thailand. The redirect answer alone: median 0.182 s."}
```

Google's page on site moves advises a redirect straight to the final URL, says Googlebot follows up to 10 hops, and says to leave the redirects in place for at least a year [4].

## A 301 turns a form's POST into a GET

A form or a webhook (a message one service posts to another) sends a POST: a request with data in its body. RFC 9110 says of the 301:

> a user agent MAY change the request method from POST to GET

and names the 308 as the code that forbids the change [5]. Measured today, a POST to a made-up path on the old domain:

| Client | After the 301 | Final answer |
|---|---|---|
| curl, following redirects | GET, body dropped | 404 |
| curl with `--post301` | POST | 405 from GitHub Pages |

GitHub Pages serves files and answers a POST with 405, so a 308 changes nothing when the new host is static. The form needs a receiver of its own and the page needs to post to it by full address. Our site's sign-up form posts to a Cloudflare Worker on a separate hostname; the redirect line plays no part in it. Before a move, the list to make is each place outside the site that posts to the old domain: payment webhooks, form services, apps.

## Google's tool accepts a folder as the destination, and takes each hostname separately

Search Console's Change of Address tool tells Google that a site moved. Its help page, read today [6]:

- The old site is a domain or subdomain. A folder cannot be the starting point, and a folder on another domain can be the destination.
- `www` does not move with the bare domain. Each hostname variant of the old site is filed on its own.
- The tool checks for 301s on a few pages before it accepts the request.
- Google forwards signals for 180 days. After that it treats the old site, if still up, as unrelated.
- The page recommends paying for the old domain for at least a year, so that nobody else buys it.

## What GitHub Pages allows

GitHub's limits page, read today: a published site of at most 1 GB, a soft limit of 100 GB of traffic a month, and a use policy against using it as free hosting for an online shop or a paid software service [7]. A shop or a paid app goes on a different host; the redirect line is the same there.

## The check, 16 lines

The script reads the new site's sitemap, requests each page at the old domain, and prints each URL that does not reach its new page with a 200 in one hop.

```python
import re, subprocess, sys, urllib.request

new, old = sys.argv[1].rstrip("/"), sys.argv[2].rstrip("/")
xml = urllib.request.urlopen(new + "/sitemap.xml").read().decode()
locs = re.findall(r"<loc>([^<]+)", xml)
bad = 0
for loc in locs:
    out = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-L", "-w",
         "%{num_redirects} %{http_code} %{url_effective}", old + loc[len(new):]],
        capture_output=True, text=True).stdout.split()
    if out != ["1", "200", loc]:
        bad += 1
        print("BAD", old + loc[len(new):], *out)
print(len(locs), "checked,", bad, "bad")
sys.exit(1 if bad else 0)
```

```bash
python3 move_check.py https://example.github.io/newsite https://old-domain.example
```

On our move it printed `147 checked, 0 bad` in 43 seconds. It reads the new sitemap, so an old URL that has no page on the new site is outside it; the old site's own sitemap or server log, saved before the switch, covers those. Moving a site between hosts, each page checked, is a service we sell [8].

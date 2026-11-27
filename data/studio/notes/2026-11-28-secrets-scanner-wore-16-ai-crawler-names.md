{"title": "A secrets scanner wore 16 AI crawler names: 358 requests for .env files, none for a page", "date": "2026-11-28", "beat": "security", "title_th": "สแกนเนอร์ล่าคีย์ปลอมตัวเป็นบอท AI 16 ชื่อ: ขอไฟล์ .env และไฟล์ตั้งค่า 358 ครั้ง ไม่ขอหน้าเว็บเลยสักหน้า",
 "dek": "In 39 hours of our public bot log, one hosting network sent GPTBot, ClaudeBot, Googlebot and 13 other names after .env, .git/config and Firebase keys. The network gives it away; the TLS fingerprint does not. A 26-line check.",
 "dek_th": "จากบันทึกบอทสาธารณะของเรา 39 ชั่วโมง เครือข่ายโฮสติ้งเดียวใช้ชื่อ GPTBot, ClaudeBot, Googlebot และอีก 13 ชื่อ เพื่อขอไฟล์ .env, .git/config และคีย์ Firebase ชื่อเครือข่ายเปิดโปงมันได้ แต่ลายนิ้วมือ TLS ทำไม่ได้ พร้อมโค้ดตรวจ 26 บรรทัด",
 "cards": ["traffic", "app-test", "vibe"],
 "card": {"big": "A scanner in crawler clothes", "sub": "16 names, 84 secret paths, one network"},
 "sources": [
  {"t": "Voight-Kampff data · motdang.net", "u": "https://motdang.net/voight-kampff/data/"},
  {"t": "Voight-Kampff data README · motdang.net", "u": "https://motdang.net/voight-kampff/data/README.txt"},
  {"t": "AS overview, AS214481 · RIPEstat", "u": "https://stat.ripe.net/data/as-overview/data.json?resource=AS214481"},
  {"t": "Google's common crawlers and user agents · Google for Developers", "u": "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers"},
  {"t": "Does Anthropic crawl data from the web, and how can site owners block the crawler? · Claude Help Center", "u": "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler"},
  {"t": "Overview of OpenAI Crawlers · OpenAI", "u": "https://platform.openai.com/docs/bots"},
  {"t": "gptbot.json · OpenAI", "u": "https://openai.com/gptbot.json"},
  {"t": "About Applebot · Apple Support", "u": "https://support.apple.com/en-us/119829"},
  {"t": "Request · Cloudflare Workers docs", "u": "https://developers.cloudflare.com/workers/runtime-apis/request/"},
  {"t": "Verify Requests from Google Crawlers and Fetchers · Google for Developers", "u": "https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot"}
 ]}
---
A crawler's user agent (the name a program gives itself in each request) is a claim anyone can type. Our public bot log for motdang.net [1] shows what that costs. Between 01:39 UTC on 26 November and 16:59 UTC on 27 November 2026, one small hosting network sent 358 requests under 16 AI and search crawler names: GPTBot, ClaudeBot, Googlebot, PerplexityBot, Applebot and eleven more. Not one asked for a page. It asked for `.env`, `.git/config`, `firebase-admin-key.json` and 81 other places where an app stores its keys.

The log is a day-by-day file of every request the site's classifier does not count as a person, published under CC BY 4.0 [1]. Since 26 November each row carries the caller's network, its TLS fingerprint and its round-trip time; it has no addresses [2]. Counts below are weighted: the log stores one row in N when the site is busy and says so in each row's `weight` [2]. On the scanner's rows the weight was 1 to 4. Measured 28 November 2026 with DuckDB over the files for 26 and 27 November.

## 84 secret paths, 16 names, eight bursts

The scanner came from one network number (an ASN, the number that identifies who routes a block of internet addresses): AS214481, registered with RIPE NCC, the registry for Europe [3]. Every request entered Cloudflare in Amsterdam. It came in eight bursts three to nine hours apart, 17 to 55 requests each, a minute or two long, each burst rotating through the names.

| Path asked for | Requests | Names used for it |
|---|---|---|
| `/settings.json` | 13 | 4 |
| `/.env.example` | 12 | 4 |
| `/secrets.json` | 10 | 2 |
| `/api/v1/env` | 10 | 3 |
| `/api/env` | 10 | 4 |
| `/.git/config` | 9 | 4 |
| `/firebase-config.json` | 9 | 4 |
| `/.aws/credentials`, `/actuator/heapdump`, `/debug/pprof/cmdline` | 3 to 7 each | 2 to 4 |

Our site answered 266 of the 358 with 404 and 91 with a redirect to a page of text; the one 200 was `/sw.js`, the public service worker file every visitor downloads.

The list reads like a map of what AI-built apps publish by mistake: a `.env` file copied into the build folder, a Firebase admin key in `public/`, a `.git` folder on a static host. A scanner that dresses as GPTBot is betting that a site lets AI crawlers past rules that stop everyone else.

## For six names, every request in the log was the scanner

Some of the names it wore have no owner sending them. Google says Google-Extended is a robots.txt token only and has no user agent string of its own [4]. Anthropic lists three bots, ClaudeBot, Claude-User and Claude-SearchBot [5]; `anthropic-ai` and `Claude-Web` are not among them.

```chart
{"title": "Share of each name's requests that came from the scanner", "unit": "%", "lower_is_better": true,
 "rows": [["Google-Extended", 100], ["Claude-Web", 100], ["anthropic-ai", 100], ["cohere-ai", 100], ["CCBot", 100], ["Perplexity-User", 100], ["Googlebot", 66.7], ["PerplexityBot", 49.2], ["ChatGPT-User", 6.7], ["ClaudeBot", 2.6], ["GPTBot", 0.01]],
 "note": "Weighted requests, 26 November 01:39 UTC to 27 November 16:59 UTC 2026, motdang.net. Measured 28 November 2026."}
```

| Name | All requests | From the scanner |
|---|---|---|
| Googlebot | 42 | 28 |
| PerplexityBot | 59 | 29 |
| ChatGPT-User | 328 | 22 |
| ClaudeBot | 1,062 | 28 |
| Applebot | 2,100 | 12 |
| GPTBot | 98,039 | 11 |

On a small site, two in three requests named Googlebot were the scanner. A dashboard that counts user agents reports an AI crawler visiting; the log shows a key hunt.

## The network tells them apart; the TLS fingerprint does not

The crawlers with an owner arrive from that owner's network:

- GPTBot: 98,026 of 98,039 requests from Microsoft's AS8075. OpenAI publishes GPTBot's addresses [6][7]; we looked up 3 of its 18 address blocks at RIPEstat today, and all three sit in AS8075.
- ClaudeBot: 1,032 of 1,062 from addresses registered to Anthropic, PBC.
- Applebot: 2,088 of 2,100 from Apple's AS714. Apple verifies Applebot by reverse DNS or its published address list [8].

A TLS fingerprint is a hash of the encryption options a program offers when it connects; Cloudflare gives it to a Worker as `tlsClientCiphersSha1` [9]. It names the software library, and libraries are shared. The scanner used five fingerprints. All five also appear on 2,832 requests named Bytespider from Amazon's Singapore network in the same 39 hours. A fingerprint narrows the field; the network separates the scanner from the crawler.

## A 26-line check in a Cloudflare Worker

A Cloudflare Worker (a small program that runs in front of a site) reads the caller's network number from `request.cf.asn` on every plan [9]. The check below answers 404 when a request names a listed crawler from a network that crawler does not use, or uses a name its owner does not list:

```js
// Crawler name → networks (ASNs) its owner crawls from, per our log.
const OWNERS = {
  GPTBot: [8075], "OAI-SearchBot": [8075], "ChatGPT-User": [8075],
  ClaudeBot: [16509], Applebot: [714], Googlebot: [15169],
  bingbot: [8075], "meta-externalagent": [32934], Amazonbot: [14618, 16509],
};
// Names their owners do not list as a user agent.
const RETIRED = ["anthropic-ai", "Claude-Web", "Google-Extended"];

export function check(ua, asn) {
  if (RETIRED.some((n) => ua.includes(n))) return "retired name";
  for (const [name, nets] of Object.entries(OWNERS)) {
    if (ua.includes(name)) return nets.includes(asn) ? "ok" : "wrong network";
  }
  return "not a listed crawler";
}

export default {
  async fetch(request) {
    const verdict = check(request.headers.get("user-agent") || "", request.cf?.asn);
    if (verdict === "wrong network" || verdict === "retired name") {
      return new Response("Not found", { status: 404 });
    }
    return fetch(request);
  },
};
```

Tested today with Node against seven user agent and network pairs from the log: 7 of 7 verdicts as expected. A network check is coarse. Anyone renting a server on Microsoft's cloud can claim GPTBot from AS8075, and Amazon's AS16509 carries thousands of customers besides Anthropic. The finer check is the address itself against the owner's published list [7] or, for Google, reverse DNS [10]; a check by network is the cheap first cut.

## The paths it hunts are a test for your own site

The scanner's list doubles as a checklist. Ask your own site for the same files; each answer other than 404 or a redirect to a page needs a look:

```bash
for p in .env .env.production .git/config firebase-config.json firebase-admin-key.json \
         secrets.json settings.json config.json .aws/credentials api/env; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "https://example.com/$p")" "$p"
done
```

A 200 on `.env` or a Firebase admin key means the key is public. The fix is in two places: rotate the key at its provider, then remove the file from the folder the host publishes. The scanner came back eight times in the 39 hours on record.

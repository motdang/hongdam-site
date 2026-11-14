{"title": "16 of 31 AI crawler names publish an address list, one signs; reverse DNS names 3 of 12", "title_th": "ชื่อบอท AI 31 ชื่อ มี 16 ชื่อที่เจ้าของประกาศรายการ IP และ 1 ชื่อที่เซ็นคำขอ ส่วน reverse DNS บอกเจ้าของได้แค่ 3 จาก 12 รายการ", "date": "2026-11-14", "beat": "security",
 "dek": "A user agent is a claim. Behind the 31 AI crawler names our traffic dashboard knows: 16 have a published address list, Exa signs, 6 give a name only. Reverse DNS fails on the AI companies' addresses. A 37-line checker.",
 "dek_th": "ชื่อ user agent เป็นแค่คำกล่าวอ้าง เราอ่านหน้าทางการของบอท AI ทั้ง 31 ชื่อที่แดชบอร์ดนับผู้เข้าชมของเรารู้จัก: 16 ชื่อมีรายการ IP ที่เจ้าของประกาศ Exa เซ็นคำขอด้วยกุญแจ ส่วนอีก 6 ชื่อให้แค่ชื่อ reverse DNS แบบที่ใช้ตรวจ Googlebot ใช้กับ IP ของบริษัท AI ไม่ได้ พร้อมสคริปต์ตรวจ 37 บรรทัด",
 "cards": ["traffic", "crawl-pay", "web-care"],
 "card": {"big": "Which AI crawler is it, really?", "sub": "16 address lists, one signature, a check under 1 ms"},
 "sources": [
  {"t": "src/classify.js · motdang/traffic-eye", "u": "https://github.com/motdang/traffic-eye/blob/main/src/classify.js"},
  {"t": "Does Anthropic crawl data from the web, and how can site owners block the crawler? · Claude Help Center", "u": "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler"},
  {"t": "Overview of OpenAI Crawlers · OpenAI Developers", "u": "https://developers.openai.com/api/docs/bots"},
  {"t": "Verifying Googlebot and Other Google Crawlers · Google Search Central", "u": "https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot"},
  {"t": "bingbot.json · Bing", "u": "https://www.bing.com/toolbox/bingbot.json"},
  {"t": "About Applebot · Apple Support", "u": "https://support.apple.com/en-us/119829"},
  {"t": "Perplexity Crawlers · Perplexity docs", "u": "https://docs.perplexity.ai/docs/resources/perplexity-crawlers"},
  {"t": "DuckAssistBot · DuckDuckGo Help Pages", "u": "https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot/"},
  {"t": "Frequently Asked Questions · Common Crawl", "u": "https://commoncrawl.org/faq"},
  {"t": "Amazonbot · Amazon Developer", "u": "https://developer.amazon.com/amazonbot"},
  {"t": "Mistral AI Robots · Mistral docs", "u": "https://docs.mistral.ai/robots"},
  {"t": "Reflectionbot · Reflection AI", "u": "https://reflection.ai/legal/reflectionbot"},
  {"t": "KeenableBot · Keenable", "u": "https://app.keenable.ai/bot"},
  {"t": "Exa Search Crawler", "u": "https://crawler.exa.ai/"},
  {"t": "Meta Web Crawlers · Meta for Developers", "u": "https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/"},
  {"t": "Cohere Web Crawlers · Cohere docs", "u": "https://docs.cohere.com/docs/cohere-web-crawlers"},
  {"t": "AI2 crawler · Allen Institute for AI", "u": "https://allenai.org/crawler"},
  {"t": "Bots · ElevenLabs docs", "u": "https://elevenlabs.io/docs/bots"},
  {"t": "Web Bot Auth · Cloudflare Bots docs", "u": "https://developers.cloudflare.com/bots/concepts/bot/verified-bots/web-bot-auth/"},
  {"t": "draft-meunier-webbotauth-httpsig-protocol · IETF Datatracker", "u": "https://datatracker.ietf.org/doc/draft-meunier-webbotauth-httpsig-protocol/"},
  {"t": "Verified bots · Cloudflare Bots docs", "u": "https://developers.cloudflare.com/bots/concepts/bot/verified-bots/"},
  {"t": "cf.bot_management.verified_bot · Cloudflare Ruleset Engine docs", "u": "https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/cf.bot_management.verified_bot/"},
  {"t": "AI Crawl Control · Cloudflare docs", "u": "https://developers.cloudflare.com/ai-crawl-control/"},
  {"t": "README · motdang/traffic-eye", "u": "https://github.com/motdang/traffic-eye/blob/main/README.md"}
 ]}
---
Every request to a website carries a user agent, a line of text in which the program asking names itself. Our traffic dashboard, traffic-eye, sorts visitors by that line; its classifier knows 31 AI crawler names, from ClaudeBot to MistralAI-User [1]. Its README says what that is: a claim, since anyone can type Googlebot into the line [24]. Today we read the operator page behind each of the 31 names to see which claims can be checked, and measured the two ways of checking.

## 16 names have a published address list, one has a signature, six have a name only

An address list is a file the operator publishes with the network ranges its crawler sends from, each range a prefix (a block of addresses written as a start and a size). Google publishes one for Googlebot. Read today, 14 November 2026, the AI operators have followed:

| Name in the classifier | Operator's page says | Prefixes in the list | List dated |
|---|---|---|---|
| ClaudeBot, Claude-User, Claude-SearchBot | one list for the three; an address on it "indicates that the crawler is coming from Anthropic" [2] | 14 | 20 October 2026 |
| GPTBot | list [3] | 18 | 22 September 2026 |
| ChatGPT-User | list [3] | 237 | 6 November 2026 |
| OAI-SearchBot | list [3] | 39 | 2 January 2026 |
| Google-Extended | a robots.txt token, not a crawler; Googlebot's list applies [4] | 317 | 13 November 2026 |
| Applebot-Extended | the same, for Applebot; list and reverse DNS under applebot.apple.com [6] | 24 | 15 September 2026 |
| PerplexityBot, Perplexity-User | a list each [7] | 13, 10 | 28 October 2026 |
| DuckAssistBot | list [8] | 486 | 1 September 2026 |
| CCBot | list, and reverse DNS under crawl.commoncrawl.org [9] | 5 | 11 August 2026 |
| Amazonbot | list [10] | 1,292 single addresses | 8 September 2026 |
| MistralAI-User | list; MistralAI-Training has none [11] | 4 | 19 February 2025 |
| Reflectionbot | list, and reverse DNS under reflection.ai [12] | 2 | 22 September 2026 |
| KeenableBot | list; "check the address, not the signature" [13] | 30 | 9 October 2026 |
| ExaSearchBot | no list; every request signed, keys published [14] | – | – |
| meta-externalagent | names the user agents; says addresses are "more secure" but lists none [15] | – | – |
| cohere-ai | the page's crawler table reads N/A: no crawler at present, no list [16] | – | – |
| AI2Bot | user agent only [17] | – | – |
| ElevenlabsCrawler | user agent only [18] | – | – |
| Claude-Web, anthropic-ai | older names, absent from Anthropic's page today [2] | – | – |

That is 16 names an address list covers, one that signs, six with a user agent and nothing to check it against. The eight remaining names (Bytespider, Diffbot, YouBot, Timpibot, Omgilibot, ImagesiftBot, Kangaroo Bot, Webzio) have no operator page we read today; their status is unknown.

Two things in the table are worth a second look. Bing's list carries a creation date of 3 January 2024, read from the file itself [5]; it is the oldest. And DuckDuckGo's DuckAssistBot list is byte-for-byte the DuckDuckBot list, 486 addresses, same date; the two bots share addresses.

## Reverse DNS names the operator for 3 lists of 12

The older check, the one Google documents, is reverse DNS: ask the address for its name, confirm the name ends in the operator's domain, then ask the name for its address and confirm it matches [4]. We ran that on three addresses from each of 12 lists, the first host of the first, middle and last prefix, measured today from Chiang Rai:

| List | Name the address gives back | Operator named |
|---|---|---|
| Googlebot | `crawl-…googlebot.com`, all three [4] | yes |
| bingbot | `msnbot-…search.msn.com`, all three | yes |
| CCBot | `…crawl.commoncrawl.org`, all three [9] | yes |
| Applebot | `…applebot.apple.com` for one of three, none for two [6] | partly |
| DuckDuckBot | `…crawl.duckduckgo.com` for one of three, none for two | partly |
| Anthropic | Google Cloud's generic `…googleusercontent.com` for two, none for one | no |
| PerplexityBot, Perplexity-User | Amazon's generic `ec2-…amazonaws.com`, all three | no |
| Amazonbot | the same Amazon names | no |
| GPTBot, ChatGPT-User, OAI-SearchBot | no name at all, nine of nine | no |

The AI companies crawl from rented cloud addresses, and the cloud's reverse DNS names the cloud, not the tenant. A name under `amazonaws.com` says Amazon rents the address to someone; it does not say who. For ClaudeBot, GPTBot and PerplexityBot, the published list is the only check there is. Reflection's page says its addresses resolve under reflection.ai [12]; its two prefixes were not in our sample.

## The list check costs under a millisecond, the DNS check 47

```chart
{"title": "Milliseconds to check one address", "unit": " ms", "lower_is_better": true,
 "rows": [["Match, address on a list", 0.12], ["Match, address on no list", 0.41], ["Reverse DNS lookup", 47]],
 "note": "Median of 20 runs each, 14 November 2026, from Chiang Rai. The match is a plain scan over the 1,714 prefixes in the checker's 15 lists, in Python; a tree would be faster."}
```

The classifier's own comment explains why it stops at the user agent: reverse DNS "costs a lookup on every request" [1]. The list check does not. The 15 lists the checker below reads are 1,714 prefixes and 105 kilobytes together, fetched once a day and loaded into memory; the match is arithmetic. For a Cloudflare Worker that means one scheduled fetch into KV (Cloudflare's key-value store) and a lookup per request that costs no network call.

This is the checker, 37 lines, tested today against Googlebot's and Anthropic's lists. Amazonbot is missing from it: Amazon's list is embedded in a web page, with no file address to fetch [10].

```python
#!/usr/bin/env python3
"""Is this request from the crawler it claims to be?  crawler_check.py <ip> "<user-agent>" """
import ipaddress, json, re, sys, urllib.request

LISTS = {  # user-agent token -> the operator's published address list
    r"ClaudeBot|Claude-User|Claude-SearchBot": "https://claude.com/crawling/bots.json",
    r"GPTBot": "https://openai.com/gptbot.json",
    r"ChatGPT-User": "https://openai.com/chatgpt-user.json",
    r"OAI-SearchBot": "https://openai.com/searchbot.json",
    r"Googlebot|Google-Extended": "https://developers.google.com/static/crawling/ipranges/common-crawlers.json",
    r"bingbot": "https://www.bing.com/toolbox/bingbot.json",
    r"Applebot": "https://search.developer.apple.com/applebot.json",
    r"PerplexityBot": "https://www.perplexity.com/perplexitybot.json",
    r"Perplexity-User": "https://www.perplexity.com/perplexity-user.json",
    r"DuckDuckBot": "https://duckduckgo.com/duckduckbot.json",
    r"DuckAssistBot": "https://duckduckgo.com/duckassistbot.json",
    r"CCBot": "https://index.commoncrawl.org/ccbot.json",
    r"MistralAI-User": "https://mistral.ai/mistralai-user-ips.json",
    r"Reflectionbot": "https://reflection.ai/bot/ips.json",
    r"KeenableBot": "https://app.keenable.ai/bot/keenablebot.json",
}

def prefixes(url):
    req = urllib.request.Request(url, headers={"User-Agent": "crawler-check/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.load(r)
    return [ipaddress.ip_network(p.get("ipv4Prefix") or p.get("ipv6Prefix"), strict=False) for p in data["prefixes"]]

def check(ip, ua):
    ip = ipaddress.ip_address(ip)
    for pat, url in LISTS.items():
        m = re.search(pat, ua, re.I)
        if m:
            hit = any(ip in n for n in prefixes(url))
            return "verified" if hit else "claims %s, address not on its list" % m.group(0)
    return "no published list for this user agent"

if __name__ == "__main__":
    print(check(sys.argv[1], sys.argv[2]))
```

A request that says Googlebot from an address outside Google's list is the case the check exists for: on a shop's logs that is a scraper wearing a costume, and the costume is the reason it gets past a robots.txt that blocks scrapers by name. A request that says meta-externalagent cannot be checked this way at all; Meta's page offers no list [15].

## The signature route: two key directories answer today, the draft that defines them has expired

Web Bot Auth is the newer idea: the crawler signs each request with a private key and names, in a `Signature-Agent` header, the site where its public key is published, at a fixed path, `/.well-known/http-message-signatures-directory` [19]. The site receiving the request fetches the key once and checks the signature; the address the request came from no longer matters. Exa's page says its crawler does this and that user-agent strings "can be spoofed, so don't trust the string alone" [14]. Fetched today, Exa's directory answers with one Ed25519 key (a signature algorithm) and is itself signed; so does the directory at chatgpt.com, one key, with a `purpose` field reading `ai` and an expiry a week out. Keenable's page says its requests carry no signature yet [13].

The protocol document is draft-meunier-webbotauth-httpsig-protocol, version 02 of 18 August 2026, an individual submission, expired and archived on the IETF's tracker [20]. The keys are live; the standard that would make them portable is not finished. Cloudflare validates these signatures for sites behind its proxy and accepts either a signature or an address list as the proof for its verified-bots directory [21]. The yes-or-no field that exposes the result to your own rules, `cf.bot_management.verified_bot`, "Requires a Cloudflare Enterprise plan with Bot Management enabled" [22]. What every plan gets is AI Crawl Control, a dashboard of AI crawler activity, "Available on all plans" [23]; the page does not say how it separates a verified crawler from a costume, so for a Worker of your own, the lists above are the check you can run.

## What to do with a crawler log this week

1. For each AI name in your logs, find it in the first table. A name with a list gets the checker; a name without one is a claim and stays labelled as one.
2. Fetch the lists once a day. Five of the lists in the first table carry a date inside the last four weeks (Anthropic, ChatGPT-User, Perplexity's two, Googlebot's on 13 November); a list a month old misses new ranges and flags the crawler itself as a costume.
3. Read the reverse DNS result only for Google, Bing, Common Crawl and the two partials; for the AI companies' addresses it says Amazon or Google Cloud, which is not an answer.
4. A `Signature-Agent` header in a request is worth logging now, before it is common: today it names Exa or chatgpt.com, and the count of signed requests on your site is a number nobody has for you.

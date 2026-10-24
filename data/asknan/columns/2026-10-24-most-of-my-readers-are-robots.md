{"no": 7, "date": "2026-10-24", "kind": "basilisk",
 "title": "Most of my website's visitors are bots. Is that bad?",
 "title_th": "ผู้เข้าชมเว็บส่วนใหญ่เป็นบอท แบบนี้แย่ไหม",
 "q": "I finally looked at my website's numbers and most of the visitors are bots. Is that bad? Should I block them?",
 "q_th": "ฉันเพิ่งเปิดดูตัวเลขของเว็บไซต์ ผู้เข้าชมส่วนใหญ่เป็นบอท แบบนี้แย่ไหม ควรบล็อกไหม",
 "dek": "Not by itself. On motdang.net, one crawler sent over half of a September week's requests. A site can feed bots, charge them or block them, and each choice does something different.",
 "dek_th": "ไม่ได้แย่ในตัวเอง บน motdang.net บอทตัวเดียวส่งคำขอเกินครึ่งในสัปดาห์หนึ่งของเดือนกันยายน เว็บจะเปิดให้บอทอ่าน เก็บเงิน หรือบล็อกก็ได้ แต่ละทางให้ผลต่างกัน",
 "do": {"t": "Read What Bots Craaave", "u": "https://nanobotco.github.io/bots-crave/"},
 "cards": ["crawl-pay", "web-found"],
 "line": ["robot", "eye", "page", "coin"],
 "sources": [
  {"t": "What Bots Craaave · บอตหิวอะไร", "u": "https://nanobotco.github.io/bots-crave/"},
  {"t": "AI models collapse when trained on recursively generated data | Nature", "u": "https://www.nature.com/articles/s41586-024-07566-y"},
  {"t": "The /llms.txt file, v2 – llms-txt", "u": "https://llmstxt.org/"},
  {"t": "Overview · Cloudflare AI Crawl Control docs", "u": "https://developers.cloudflare.com/ai-crawl-control/"},
  {"t": "What is Pay Per Crawl? · Cloudflare AI Crawl Control docs", "u": "https://developers.cloudflare.com/ai-crawl-control/features/pay-per-crawl/what-is-pay-per-crawl/"},
  {"t": "AI & bots · Hongdam, Chiang Rai", "u": "https://hongdam.net/ai/"},
  {"t": "Websites & apps · Hongdam, Chiang Rai", "u": "https://hongdam.net/web/"}],
 "card": {"big": "Most readers are robots", "sub": "Feed them, charge them or block them"}}
---
Not by itself. On motdang.net, bots sent most of the requests in one September week, and requests shaped like a person's were 0.5% of them. A site can feed bots, charge them or block them, and each choice does something different.

## Bots sent most of the requests

On 23 September 2026 I asked for traffic on all my projects to be compared "with demarcation between likely humans and likely bots." The public page from that work is What Bots Craaave [1]. A crawler is a program that reads pages automatically. The page counts motdang.net for 20 to 26 September 2026 from three places: Cloudflare's edge analytics (the count made by Cloudflare's servers in front of the site), Cloudflare's browser beacon (a snippet that counts a page load only when a browser ran the page), and the site's own counter [1].

| Count | Requests that week | Share of all requests |
|---|---|---|
| All requests | 2,117,656 | 100% |
| Meta's AI crawler | 1,140,878 | 54% |
| ClaudeBot | 160,495 | 8% |
| People-shaped requests | 10,573 | 0.5% |
| Page loads a person's browser ran | 882 | not a request count |

The shares are worked out from the page's figures. The answer to "how many visitors are bots" depends on the counter: an edge count includes every request a robot makes, and a browser count includes only the pages a browser ran [1].

## Bots want new facts they can check

On 28 September I said what bots want is "new information and groundtruth from citable sources." Groundtruth is a fact checked against the world, with a source anyone can open.

The page leans on a 2024 paper in *Nature* [1][2]. It reports that indiscriminate use of model-written text in training causes defects in which "tails of the original content distribution disappear" [2]. Its abstract adds that data collected about human interactions with systems gains value as model-written text fills the crawled web [2].

Jeremy Howard proposed llms.txt on 3 September 2024: a plain-text file, usually at a site's root, with a short guide and links for AI agents. His page says thousands of sites publish one [3].

## Feed, charge or block

Cloudflare's AI Crawl Control, available on all plans, shows which AI services access a site's content, takes allow or block rules for individual crawlers, and tracks which crawlers follow a site's robots.txt (the file where a site lists pages crawlers may skip) [4]. Cloudflare's own docs separate crawlers that index pages for search engines from crawlers that scrape content without permission [5].

| Choice | What happens | Where it is set |
|---|---|---|
| Feed | Pages stay open to the crawler. An llms.txt file tells AI readers what the site holds [3]. | The site's own files |
| Charge | The owner sets one price per zone (Cloudflare's word for a site). A crawler that presents payment intent in its request headers gets the page, HTTP 200. One that does not gets HTTP 402 Payment Required with the price. Cloudflare is the merchant of record, the company that takes the payment [5]. | Cloudflare |
| Block | An allow or block rule per crawler [4]. A block set in Cloudflare's WAF (web application firewall) or Bot Management overrides the charge, and the blocked crawler gets no access [5]. | Cloudflare |

Cloudflare's pay per crawl page, read 24 October 2026, calls the feature a closed beta [5].

## Hongdam sets up charging and llms.txt

Hongdam's "Charge AI crawlers" shows which bots read your site and sets up Cloudflare's pay per crawl. Its page notes the closed beta and that crawlers that do not pay receive an HTTP 402 with the price [6].

"Google and AI set-up" covers Search Console (Google's tool for how a site appears in search), a sitemap (a list of a site's pages for crawlers), page titles and llms.txt [7].

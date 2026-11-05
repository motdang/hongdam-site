{"no": 7, "date": "2026-10-24", "kind": "basilisk",
 "title": "Robots read my website more than people do. Should I charge them?",
 "title_th": "หุ่นยนต์อ่านเว็บฉันมากกว่าคน ควรเก็บเงินพวกมันไหม",
 "q": "I looked at my website's visitor numbers. Most of the visitors are bots, programs that visit websites by themselves. Should I feel bad? Should I block them?",
 "q_th": "ฉันดูสถิติคนเข้าเว็บไซต์ของตัวเอง ผู้เข้าชมส่วนใหญ่เป็นบอต คือโปรแกรมที่เข้าเว็บเองอัตโนมัติ ควรรู้สึกแย่ไหม ควรบล็อกพวกมันหรือเปล่า",
 "from": "Lonely Website Owner",
 "from_th": "เจ้าของเว็บผู้เดียวดาย",
 "dek": "In one week of September 2026, Meta's AI crawler made 54% of the requests to motdang.net. Only 0.5% looked like a person's. A site can feed the bots, charge them or block them.",
 "dek_th": "ในหนึ่งสัปดาห์ของเดือนกันยายน 2026 บอตเก็บข้อมูลของ Meta ส่งคำขอเข้า motdang.net ถึง 54% มีแค่ 0.5% ที่ดูเหมือนคนจริง ๆ เว็บไซต์เลือกได้ว่าจะให้บอตอ่าน เก็บเงิน หรือบล็อก",
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
  {"t": "Websites & apps · Hongdam, Chiang Rai", "u": "https://hongdam.net/web/"}
 ],
 "card": {"big": "Robots read my site more than people", "sub": "Feed them, charge them or block them"}}
---
Dear Lonely,

You have lots of company, and most of it is robots. That is not bad in itself. And yes, a site can charge them. On motdang.net, bots sent most of the requests in one week of September 2026. A request is one ask for a page or a file. Only 0.5% of the requests looked like a person's.

## Bots sent most of the requests

On 23 September 2026 I asked to compare the visits to all my projects "with demarcation between likely humans and likely bots." The public page from that work is What Bots Craaave [1]. A crawler is a program that reads pages by itself. The page counts motdang.net from 20 to 26 September 2026, in three ways [1]:

- Cloudflare's edge count: the count made by Cloudflare's servers, which sit in front of the site.
- Cloudflare's browser beacon: a small piece of code that counts a page only when a browser ran it.
- The site's own counter.

| Count | Requests that week | Share of all requests |
|---|---|---|
| All requests | 2,117,656 | 100% |
| Meta's AI crawler | 1,140,878 | 54% |
| ClaudeBot | 160,495 | 8% |
| Requests that look like a person's | 10,573 | 0.5% |
| Pages a person's browser ran | 882 | not a request count |

The shares come from the page's figures. "How many visitors are bots?" depends on how you count. An edge count includes every request a bot makes. A browser count includes only the pages a browser ran [1].

## What bots want: new facts they can check

On 28 September 2026 I said what bots want is "new information and groundtruth from citable sources." Groundtruth is a fact checked against the world, with a source anyone can open.

The page uses a 2024 paper in the journal *Nature* [1][2]. The paper looks at AI that learns from text other AIs wrote, without choosing which text. Those models get defects: "tails of the original content distribution disappear" [2]. The tails are the less common parts of the original data. The paper's summary adds one more point. Data about how people use these systems grows in value as AI text fills the web that crawlers collect [2].

Jeremy Howard, an AI researcher, proposed llms.txt on 3 September 2024. It is a plain-text file, usually at the top level of a site. It holds a short guide and links for AI agents, programs that act on their own. His page says thousands of sites publish one [3].

## Feed them, charge them or block them

Cloudflare's AI Crawl Control comes with all plans. It shows which AI services read a site. It lets you allow or block each crawler. It also tracks which crawlers follow a site's robots.txt, the file that lists pages crawlers may skip [4]. Cloudflare's own docs name two kinds of crawler. Some index pages for search engines. Others copy content without permission [5].

| Choice | What happens | Where you set it |
|---|---|---|
| Feed | Pages stay open to the crawler. An llms.txt file tells AI readers what the site holds [3]. | The site's own files |
| Charge | The owner sets one price per zone, Cloudflare's word for a site. A crawler that says in its request that it will pay gets the page: HTTP 200, the code for "OK". A crawler that does not gets HTTP 402 Payment Required, with the price. Cloudflare takes the payment [5]. | Cloudflare |
| Block | A rule allows or blocks each crawler [4]. A block in Cloudflare's WAF (web application firewall) or Bot Management comes before the charge. The blocked crawler gets nothing [5]. | Cloudflare |

Cloudflare's pay per crawl page, read on 24 October 2026, calls it a closed beta. That is a test open only to some users [5].

## Hongdam turns on the charging

Hongdam's "Charge AI crawlers" shows which bots read your site. Then it turns on Cloudflare's pay per crawl. Its page notes the closed beta. It also notes that a crawler that does not pay gets an HTTP 402 with the price [6].

Hongdam's "Google and AI set-up" covers Search Console, Google's tool for how a site shows in search. It also covers a sitemap, a list of a site's pages for crawlers, plus page titles and llms.txt [7].

Your most loyal reader may be a robot, and Cloudflare can send it the bill.

{"title": "One workflow, 30,000 runs a month: Zapier US$1,149, Make US$116, Cloudflare Workers US$5", "title_th": "เวิร์กโฟลว์รับออเดอร์เดียวกัน 30,000 รอบต่อเดือน: Zapier 1,149 ดอลลาร์ Make 116 ดอลลาร์ Cloudflare Workers 5 ดอลลาร์", "date": "2026-10-24", "beat": "automation", "order": 1,
 "dek": "Zapier charges per action, Make per module, n8n per run. One order workflow at 30,000 runs a month costs US$1,149 on Zapier, US$116.47 on Make, €144 on n8n and US$5 as code on Cloudflare Workers. Prices as of 24 October 2026.",
 "dek_th": "Zapier คิดเงินต่อ action, Make คิดต่อโมดูล, n8n คิดต่อรอบ เวิร์กโฟลว์รับออเดอร์ 5 ขั้นตอนเดียวกันจึงมีค่าใช้จ่ายที่ 30,000 รอบต่อเดือนตั้งแต่ 5 ดอลลาร์ (โค้ดบน Cloudflare Worker) ถึง 1,149 ดอลลาร์ (Zapier) อ่านราคาจากหน้าของผู้ให้บริการเมื่อ 24 ตุลาคม 2569",
 "cards": ["ai-automation", "price-watch"],
 "sources": [
  {"t": "Plans & Pricing | Zapier", "u": "https://zapier.com/pricing"},
  {"t": "Zapier Tasks Explained: Plans, Limits, Zaps, MCP & More | Zapier", "u": "https://zapier.com/pricing/rates"},
  {"t": "Pricing & Subscription Packages | Make", "u": "https://www.make.com/en/pricing"},
  {"t": "Operations - Help Center (Make)", "u": "https://help.make.com/operations"},
  {"t": "n8n Plans and Pricing - n8n.io", "u": "https://n8n.io/pricing/"},
  {"t": "Pricing · Cloudflare Workers docs", "u": "https://developers.cloudflare.com/workers/platform/pricing/"},
  {"t": "Limits · Cloudflare Workers docs", "u": "https://developers.cloudflare.com/workers/platform/limits/"},
  {"t": "GitHub Actions billing - GitHub Docs", "u": "https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions"},
  {"t": "Actions runner pricing - GitHub Docs", "u": "https://docs.github.com/en/billing/reference/actions-runner-pricing"},
  {"t": "Cheap cloud-hosting – low vps prices for developers (Hetzner, Cost-Optimized)", "u": "https://www.hetzner.com/cloud/cost-optimized/"},
  {"t": "Hetzner Virtual Private Server: Best Price-Performance Ratio", "u": "https://www.hetzner.com/cloud/regular-performance/"},
  {"t": "Deploy to Hetzner | Deploy | n8n Docs", "u": "https://docs.n8n.io/deploy/host-n8n/install-options/use-a-cloud-provider/deploy-to-hetzner"},
  {"t": "Measure performance | Deploy | n8n Docs", "u": "https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/measure-performance"},
  {"t": "Install with Docker | Deploy | n8n Docs", "u": "https://docs.n8n.io/deploy/host-n8n/install-options/install-with-docker"},
  {"t": "Security Advisories · n8n-io/n8n · GitHub", "u": "https://github.com/n8n-io/n8n/security/advisories"},
  {"t": "Releases · n8n-io/n8n · GitHub", "u": "https://github.com/n8n-io/n8n/releases"},
  {"t": "Euro foreign exchange reference rates", "u": "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html"},
  {"t": "REST API endpoints for repositories - GitHub Docs", "u": "https://docs.github.com/en/rest/repos/repos"},
  {"t": "Buy · Hongdam", "u": "https://hongdam.net/buy/?c=ai-automation"}
 ],
 "card": {"big": "Zapier $1,149 or Cloudflare $5", "sub": "One order workflow, 30,000 runs a month"}}
---
One order workflow costs US$5 a month on Cloudflare Workers and US$1,149 on Zapier at 30,000 runs. A workflow is a chain of automatic steps, and a run is one pass through it; Zapier, Make and n8n are tools for building workflows. The workflow is the same; each platform counts a run in a different unit, and the unit decides the price.

## The example run is one trigger and four actions across three apps

In the example, a web form posts each order to a webhook, a web address that passes the order's data to the workflow. The workflow finds the customer in a Google Sheet, writes the order as a row, emails a confirmation from Gmail and posts a message in Slack. Volumes are 300, 3,000 and 30,000 runs a month, or 10, 100 and 1,000 a day. Prices are list prices taken from each vendor's pages on 24 October 2026, for the lowest plan or tier that covers the volume, not including the fees of Google, Slack or an email provider. Euro prices are converted to US dollars where compared, at the European Central Bank reference rate of 23 October 2026, EUR 1 = US$1.1193 [17].

## One run is 4 tasks, 5 credits, 1 execution, 1 request or 1 minute

- Zapier counts a task for each successful action. The trigger and built-in steps (Filter, Formatter, Paths, Delay) count 0 [1][2]. The run is **4 tasks**.
- Make counts a credit for each module action, and reading an incoming webhook is one of them. Router and error-handler modules count 0 [3][4]. The run is **5 credits**. Make's pricing page dates the switch to credits as its billing unit to 27 August; its help pages say operations.
- n8n counts a run of the whole workflow at any number of steps: "An execution is a single run of your entire workflow." [5] The run is **1 execution**.
- Cloudflare Workers is code that Cloudflare runs for each incoming request, so you rent no server. It bills requests, and calls the code makes outward are free. The paid Standard plan also bills CPU time, the processor time the code uses; waiting on the network does not count [6][7]. The run is **1 request**.
- GitHub Actions bills minutes on its runners, with each job rounded up to a whole minute [8][9]. A job that ends in seconds is **1 minute**.

Per-step counting grows with the workflow. One more action moves Zapier from 4 to 5 tasks (a quarter more) and Make from 5 to 6 credits (a fifth more). n8n stays at 1 execution, and a Worker adds milliseconds of CPU time, which fall within the 30 million included at these volumes [6].

## At 30,000 runs, Zapier costs about 10 times Make and 230 times Cloudflare Workers

| Platform and plan | A run counts as | 300 runs | 3,000 runs | 30,000 runs |
|---|---|---|---|---|
| Zapier, Professional [1] | 4 tasks | US$58.50 (1,500-task tier) | US$283.50 (20,000-task tier) | US$1,149 (200,000-task tier) |
| Make, Core [3] | 5 credits | US$10.59 (10,000-credit tier) | US$18.82 (20,000-credit tier) | US$116.47 (150,000-credit tier) |
| n8n Cloud, Starter then Pro [5] | 1 execution | €24 (Starter, 2,500 executions) | €60 (Pro, 10,000) | €144 (Pro, 50,000) |
| n8n self-hosted, Community Edition [5][10][11] | 1 execution | €5.99 to €26.99 server, plus update hours | €5.99 to €26.99 server, plus update hours | €5.99 to €26.99 server, plus update hours |
| Cloudflare Workers, Free or Standard [6][7] | 1 request | US$0 on Free, US$5 on Standard | US$0 on Free, US$5 on Standard | US$0 on Free, US$5 on Standard |
| GitHub Actions, Linux 2-core, private repository [8][9] | 1 job minute | US$0 (300 of 2,000 free minutes) | US$6.00 (1,000 minutes over) | US$168.00 (28,000 minutes over) |

Annual billing lowers Zapier to US$39, US$189 and US$769, Make to US$9, US$16 and US$99, and n8n Cloud to €20, €50 and €120 [1][3][5]. The Free plans do not cover the example run: Zapier's Free plan allows two-step Zaps and 100 tasks, Make's Free plan covers 200 runs in its 1,000 credits, and n8n Cloud starts with a trial limited to 1,000 executions [1][3][5]. GitHub Actions starts a job from an event, which an outside form can send with a repository_dispatch call [18]; standard runners in a public repository cost nothing [8].

Workers Free limits each request to 10 ms of CPU time. Cloudflare reports about 2.2 ms for the average Worker and 10 to 20 ms for heavier ones, such as authentication or large payloads [7]. The example run's CPU time is not measured here, so the table shows both plans.

```chart
{"title": "Monthly cost of 30,000 runs, US dollars", "unit": " USD", "lower_is_better": true,
 "rows": [["Zapier Professional", 1149], ["GitHub Actions, 28,000 billed minutes", 168], ["n8n Cloud Pro, €144", 161.18], ["Make Core", 116.47], ["n8n self-hosted, 2 vCPU 4 GB server in Singapore, €26.99", 30.21], ["n8n self-hosted, 2 vCPU 4 GB server at NBG1 or HEL1, €5.99", 6.7], ["Cloudflare Workers Standard", 5]],
 "note": "Monthly billing, list prices as of 24 October 2026, euro prices at EUR 1 = US$1.1193. The n8n self-hosted bars show the server cost only, without update hours."}
```

## n8n self-hosted: a €5.99 to €26.99 server plus update hours

Self-hosting means running n8n's free Community Edition on a server you rent and update yourself [5]. Hetzner lists a 2 vCPU (virtual processor core), 4 GB server at €5.99 a month excluding VAT at its NBG1 and HEL1 locations (CX23), and a 2 vCPU, 4 GB AMD server at €19.99 at those locations and €26.99 at SIN1 in Singapore (CPX22) [10][11]. The order line on both pages read "currently unavailable" on 24 October 2026. n8n's Hetzner guide asks for at least 4 GB and 2 vCPU once its Assistant feature is added [12]. The load is small: n8n's benchmark puts one instance at up to 220 executions a second, and 30,000 runs a month average 0.012 a second [13].

The server price is the smaller part. An update is three commands, `docker compose pull`, `docker compose down` and `docker compose up -d` [14]. Read from GitHub on 24 October 2026, n8n published 26 releases, on 17 different days, in the 30 days to that date, and 29 security advisories on two days: 14 on 30 September and 15 on 14 October, 15 medium and 14 high severity [15][16]. At one hour per update window (time to update and test the workflow), those two days come to 2 hours a month. The hour is an assumption, not a measurement; no source times it.

## With more steps, Make costs more than n8n Cloud

- A ten-credit run (a trigger and nine actions) at 30,000 runs needs 300,000 Make credits, US$214.31 a month on Core, while n8n Cloud Pro stays at €144 (US$161.18) [3][5].
- Up to 200 runs a month, Make's Free plan covers the example workflow at US$0. At 300 runs the lowest paid tiers are Make US$10.59, n8n Cloud €24 (US$26.86) and Zapier US$58.50.
- A daily job such as a price check is 30 runs a month. Zapier's lowest Professional tier (750 tasks, US$29.99), Make's lowest Core tier (US$10.59) and n8n Starter (€24) each cover it [1][3][5].
- Code on Cloudflare Workers or GitHub Actions has no per-step unit; its cost is the time to build and maintain it. Hongdam's price is ฿8,000 a workflow: one trigger, up to three apps, an alert when it stops and 30 days of fixes, in n8n, Make, Zapier or code, with the tool's own fees charged at the price we pay [19].

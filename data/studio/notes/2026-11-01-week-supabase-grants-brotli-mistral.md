{"title": "The week: Supabase stops exposing new tables, Brotli exploited, Mistral Large 4 weights", "title_th": "สรุปสัปดาห์ 26 ตุลาคม: Supabase เลิกเปิดตารางใหม่ให้ API อัตโนมัติ, Brotli เข้ารายชื่อช่องโหว่ที่ถูกโจมตีจริง, Mistral Large 4 ปล่อยเวต", "date": "2026-11-01", "beat": "week",
 "dek": "Six notes this week: a faster DeepSeek, a cap for Lovable's agent tools, Magento PolyShell, GitHub's US$50 default, Thai tokens, link cards. Plus four outside changes that reach a builder's app this month.",
 "dek_th": "บันทึกหกชิ้นของสัปดาห์นี้: DeepSeek รุ่นที่เร็วขึ้น ตัวจำกัดการเรียกเครื่องมือเอเจนต์ของ Lovable ช่องโหว่ PolyShell ของ Magento เพดาน 50 ดอลลาร์ของ GitHub โทเคนภาษาไทย และการ์ดลิงก์ พร้อมความเปลี่ยนแปลงจากภายนอกสี่เรื่องที่กระทบแอปของคุณภายในเดือนนี้",
 "cards": ["vibe", "php", "ai-own"],
 "sources": [
  {"t": "Breaking Change: Tables not exposed to Data and GraphQL API automatically · supabase · Discussion #45329", "u": "https://github.com/orgs/supabase/discussions/45329"},
  {"t": "CISA Known Exploited Vulnerabilities catalog, JSON feed, version 2026.10.30", "u": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"},
  {"t": "Release v1.2.1 · google/brotli · GitHub", "u": "https://github.com/google/brotli/releases/tag/v1.2.1"},
  {"t": "Brotli · PyPI", "u": "https://pypi.org/project/Brotli/"},
  {"t": "mistralai/Mistral-Large-4-1T-A52B · Hugging Face", "u": "https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B"},
  {"t": "LICENSE · mistralai/Mistral-Large-4-1T-A52B at main", "u": "https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE"},
  {"t": "Mistral Large 4 (Le Chonk) is now open weight | Mistral", "u": "https://mistral.ai/news/mistral-large-4-oss/"}
 ],
 "card": {"big": "The week: six notes, four changes", "sub": "Supabase grants, Brotli, PHP, Mistral Large 4"}}
---
Since 30 October, a new table in a Supabase project is invisible to the app's API until someone grants access to it. Supabase announced the change in April and set Friday, 30 October, as the day it reaches every existing project [1]. For an app built with Lovable, Bolt or another AI tool, the first sign is a `42501` error on a table the tool created this weekend. That change leads the four outside links below. First, the week's six notes.

## Six notes, 26 to 31 October

**Monday, models.** [DeepSeek Flash 1017 on Workers AI](https://hongdam.net/studio/notes/deepseek-flash-1017-faster-not-shorter/): DeepSeek's 17 October update promised shorter answers. On 10 builder tasks, 3 runs each, it finished in 40% less time than V4 Flash 0731 but wrote 23% more tokens. The lower price per token kept the bill level, and both models answered all 120 runs correctly. An output cap set for 0731 needs headroom on 1017.

**Tuesday, last-mile.** [A per-user cap for Lovable's agent tools](https://hongdam.net/studio/notes/lovable-agent-tools-no-rate-limit/): Lovable's docs say its agent tools (the actions an AI assistant can call in your app) have no call quota and no call log. One Postgres table and one function cap calls per user, log each one, and turn a retried write into a no-op. Tested: 20 of 25 calls through, retries and calls with no signed-in user stopped.

**Wednesday, security.** [Magento PolyShell on CISA's exploited list](https://hongdam.net/studio/notes/magento-polyshell-on-cisa-kev/): CVE-2026-48356 lets a stranger upload a PHP file to a Magento shop through the guest cart. Attacks began in March, the fix for 2.4.8 and older came in July, and CISA listed it on 27 October. Patching does not remove a skimmer already in the shop's content blocks; the note gives four checks for that.

**Thursday, automation.** [GitHub Agentic Workflows' default cap](https://hongdam.net/studio/notes/github-agentic-workflows-default-cap/): the agent job gets a read-only token, and a separate job carries out the writes the workflow allows. A workflow with no cap of its own may spend US$10 a run and US$50 a day on AI, about US$1,500 a month. Three lines in the settings block lower it.

**Friday, models.** [Thai tokens cost by model](https://hongdam.net/studio/notes/thai-tokens-cost-by-model/): the same eight shop messages took 1.46 times the English token count in Thai on DeepSeek, 2.64 times on Kimi K2.7 Code and 2.94 times on GLM-5.3. That reorders the price list: GLM-5.3 Flash lists at half DeepSeek's input price and comes out level for Thai text.

**Saturday, last-mile.** [Link cards on Mastodon and Bluesky](https://hongdam.net/studio/notes/link-cards-mastodon-bluesky/): every Mastodon server that receives a post fetches the page itself, reads only raw HTML (no JavaScript runs), and shows a wide picture only when it is wider than tall. Bluesky copies the card into the post once and never refreshes it. Three curl commands show what each one sees.

## Supabase: a new table needs a grant before the API can see it

A grant is a Postgres permission that lets a role, such as `anon` (a visitor with no session) or `authenticated` (a signed-in user), touch a table at all. Row-level security, the rule that decides which rows a role sees, is a separate layer and works as before [1]. Until Friday a Supabase project granted `select`, `insert`, `update` and `delete` on every new `public` table to those roles automatically [1].

From 30 October, on every project, a new table needs explicit `grant` lines; tables that existed before keep their grants [1]. A missing grant returns error `42501`, "permission denied", with a hint that spells out the `GRANT` to run [1]. An app that talks to Postgres over a direct connection string is not affected [1].

The fix is three steps in the same migration: grant only what each role needs, turn on row-level security, then add the policies [1]. Pasting the hint's `GRANT` without the other two opens its rows to anyone with the public key, the failure our [24 October note](https://hongdam.net/studio/notes/supabase-public-key-open-tables/) measured. Supabase's own reason for the change: AI tools and scripts now create tables with no person reading the diff [1].

## Brotli 1.2.1 fixes a flaw attackers already use

Brotli is Google's compression library, the format behind `Content-Encoding: br` on the web [3]. CISA added CVE-2026-111497 to its exploited list on 27 October: a crafted compressed stream can corrupt the decoder's memory, leak it, crash it, or possibly run code, with no login [2]. The fix is release v1.2.1, published 21 October [3]; the Python package `Brotli` 1.2.1 reached PyPI on 22 October [4]. US federal agencies must act by 10 November [2].

To find it, search the lockfile (`requirements.txt`, `poetry.lock`, `package-lock.json`) for `brotli` and check the system package with your distribution's package manager. Anything that decompresses Brotli sent by strangers, such as an upload handler or a proxy, comes first.

## PHP2Shell now chains to root

The two PHP flaws from our [24 October note](https://hongdam.net/studio/notes/php2shell-fixed-releases-and-restart/), CVE-2026-109618 and CVE-2026-109619, joined CISA's list on 26 October with a three-day deadline [2]. On 28 October CISA added a Linux kernel flaw, CVE-2026-46300, and its entry says attackers chain it with the two PHP flaws to plant PHP webshells (a small program left behind to run commands later) and run commands as root [2]. The kernel deadline was 31 October [2]. A PHP host patched for PHP2Shell and not yet for the kernel holds half the fix; the CISA entry lists the kernel commits [2].

## Mistral Large 4 weights: free to run, a licence to resell

Mistral's 1-trillion-parameter model, about 50 billion active per token, with a 1-million-token context, now has its weights on Hugging Face; the files were last changed on 29 October [5][7]. The licence is a modified MIT licence with one condition: a company that runs a "Model as a Service" business, meaning it gives others API or hosted access with meaningful control over inputs or training, needs a separate commercial licence from Mistral before commercial use [6]. Internal use, and products that embed the model inside a specific feature, do not [6]. A quantised NVFP4 copy targets NVIDIA Blackwell GPUs [5]. A chatbot inside your own product reads as the embedded case; selling API access to the model is the case that needs Mistral's licence [6].

{"no": 4, "date": "2026-10-24", "kind": "basilisk",
 "title": "If my AI subscription ends, what do I still have?",
 "title_th": "ถ้าบริการ AI ที่ใช้อยู่หายไป ฉันยังเหลืออะไร",
 "q": "My whole business works through one paid AI service. What happens if the price rises, the company closes my account, or the company changes the AI model I use?",
 "q_th": "ธุรกิจของฉันทำงานผ่านบริการ AI แบบสมัครสมาชิกเจ้าเดียวทั้งหมด ถ้าราคาขึ้น บัญชีถูกปิด หรือบริษัทเปลี่ยนโมเดลที่ใช้อยู่ จะเกิดอะไรขึ้น",
 "dek": "The subscription is rented, but your chats and instructions are yours: data laws let you ask for a copy. A backup is an open model (an AI model anyone can download) on your own account or computer.",
 "dek_th": "บริการ AI เป็นของเช่า แต่แชท คำสั่ง และวิธีทำงานสำรองเป็นของคุณ กฎหมายให้ขอสำเนาข้อมูลได้ และโมเดลเปิด (โมเดล AI ที่ใครก็ดาวน์โหลดมาใช้ได้) ใช้ได้บนบัญชีหรือเครื่องของคุณเอง",
 "do": {"t": "Plan your move", "u": "https://nanobotco.github.io/moving-day/"},
 "cards": ["ai-own"],
 "line": ["robot", "key", "home", "laptop"],
 "sources": [
  {"t": "Moving Day", "u": "https://nanobotco.github.io/moving-day/"},
  {"t": "Personal Data Protection Act, B.E. 2562 (2019), unofficial translation", "u": "https://cc.kmutt.ac.th/Files/Act%20Eng/personal-data-protection-act-2019-en.pdf"},
  {"t": "Regulation (EU) 2016/679 (General Data Protection Regulation)", "u": "https://eur-lex.europa.eu/eli/reg/2016/679/oj"},
  {"t": "California Code, CIV 1798.130", "u": "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.130"},
  {"t": "Lei nº 13.709, de 14 de agosto de 2018 (LGPD)", "u": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm"},
  {"t": "Overview · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/"},
  {"t": "OpenCode | The open source AI coding agent", "u": "https://opencode.ai/"},
  {"t": "Workers AI Models · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/"},
  {"t": "Your own builder · Hongdam", "u": "https://hongdam.net/own/"}],
 "card": {"big": "If my AI service ends", "sub": "What you keep, and how to move"}}
---
A subscription is something you rent, not something you own. What stays yours is the data you typed into it, your instructions, and a backup way of working on another service or on your own computer.

## Moving to another AI service takes five steps and two prompts

On 29 September 2026 I asked for a guide to "how to move from one ai platform to another, for any reason whatsoever" and said "you have rights to your own data". That became Moving Day [1], a page in Thai and English.

You pick the old service and the new one from the same list: ChatGPT, Claude, Gemini, Copilot, Meta AI, Grok, Perplexity, DeepSeek, Le Chat / Vibe and Kimi, plus "my own computer". The page writes a plan that names the menus to open at each step [1]:

1. Pack: export (download a copy of) your chats. For ChatGPT the menu path is Settings → Data controls → Export data; a ZIP file (a compressed folder) arrives by email within 7 days and the link works for 24 hours.
2. Copy the memories and instructions the old service holds.
3. Start at the new service and give it what you copied.
4. Check the training setting there. Training means the company uses your chats to teach its future AI models.
5. Close the old account (optional).

Two prompts (texts you give an AI) carry the context. The moving letter asks the old AI to write down your instructions and saved memories word for word, your projects, how you like answers, and what you asked it to always or never do. The move-in prompt gives that letter to the new AI and asks for five short lines on what it will remember. The page was checked against each company's help pages on 29 September 2026, and it says menus change [1].

## A data law lets you ask the company for your file

Moving Day also builds a request letter, for an app with no export button or a file that comes back incomplete [1]. You choose the company and the country and add your name and account email. You copy the letter, in English, to the company's privacy contact.

The page's table lists four laws, which I checked against their texts. Thailand's is the Personal Data Protection Act (พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล, phor ror bor khumkhrong khomun suan bukkhon), PDPA for short.

| Where | Law | What it gives | Answer due |
|---|---|---|---|
| Thailand | PDPA, sections 30 and 31 [2] | A copy of your data, in a format a machine can read and another company can take | 30 days |
| European Union | GDPR (General Data Protection Regulation), Articles 15 and 20 [3] | Access, and a structured, machine-readable file to send to another company | One month, which can be extended by two more months (Article 12) |
| California, USA | CCPA (California Consumer Privacy Act), section 1798.130 [4] | The information in a format that is easy to use and that you can send to another company | 45 days |
| Brazil | LGPD (Brazil's general data protection law), Articles 18 and 19 [5] | Access, and a copy you can move to another company (portability), on a clear request | 15 days for the full statement of your data |

## An open model works wherever you put it

Open weights means AI whose model file anyone can download and use [1]. On 26 September 2026 I asked for instructions on open-weights models: "something Thai people can afford and learn to use right now." The same day I had a backup way of working installed on my own Cloudflare account (Cloudflare is a company that runs AI models on its own network of computers [6]): OpenCode, an open-source coding agent (a program that writes software code) [7], connected to open-weights models on Cloudflare Workers AI.

Workers AI runs models on Cloudflare's GPUs (computer chips made for AI), which your own program can call, and you pay by use [6]. Its catalog lists Llama, Gemma, DeepSeek, Qwen, Mistral, GLM, Kimi and OpenAI's gpt-oss [8]. Models are removed from that catalog too; the page has a notice for one that is "deprecated, removed, or not found" [8].

On your own computer, the model file and the chats are files on that machine, and moving means copying the folder [1]. Moving Day lists LM Studio, Jan and Ollama for Mac, Windows and Linux, PocketPal AI for iPhone and Android, and Typhoon, Thai-language models from SCB 10X that work in those apps. A small model on a phone is slower and knows less than the big ones on the web, and a computer with 16 GB of memory or more can use mid-size ones without trouble [1].

## Hongdam installs the backup way of working

Hongdam's "Your own AI website builder" puts OpenCode on your computer, connects your GitHub and Cloudflare accounts, and teaches you to use it [9]. The models are DeepSeek, Kimi, GLM and Qwen, used through Workers AI on your Cloudflare account, and Cloudflare bills you by use. The code is stored in your GitHub account, and the sites are published on GitHub Pages or Cloudflare Pages under your domain. Its example: nine pages in Thai and English, written and published from one written request in 10 minutes 21 seconds [9].

That service builds websites. Moving Day covers the chat services.

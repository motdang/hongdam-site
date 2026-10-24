{"no": 4, "date": "2026-10-24", "kind": "basilisk",
 "title": "If my AI subscription goes away, what do I still have?",
 "title_th": "ถ้าบริการ AI ที่ใช้อยู่หายไป ฉันยังเหลืออะไร",
 "q": "My whole business now runs through one AI subscription. What happens if the price goes up, my account gets shut, or the company changes the model under me?",
 "q_th": "ธุรกิจของฉันทำงานผ่านบริการ AI แบบสมัครสมาชิกเจ้าเดียวทั้งหมด ถ้าราคาขึ้น บัญชีถูกปิด หรือบริษัทเปลี่ยนโมเดลที่ใช้อยู่ จะเกิดอะไรขึ้น",
 "dek": "The subscription is rented. Your chats, instructions and a second way of working are yours: a data law lets you ask for a copy, and open models run on your own account or computer.",
 "dek_th": "บริการ AI เป็นของเช่า แต่แชท คำสั่ง และวิธีทำงานสำรองเป็นของคุณ กฎหมายให้ขอสำเนาข้อมูลได้ และโมเดลเปิดรันบนบัญชีหรือเครื่องของคุณเองได้",
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
 "card": {"big": "If my AI goes away", "sub": "What you keep, and how to move"}}
---
A subscription is rented. What stays yours is the data you typed into it, your instructions, and a second way of working that runs somewhere else.

## A move between services takes five steps and two prompts

On 29 September 2026 I asked for a guide to "how to move from one ai platform to another, for any reason whatsoever" and said "you have rights to your own data". That became Moving Day [1], a page in Thai and English.

You pick the old service and the new one from the same list: ChatGPT, Claude, Gemini, Copilot, Meta AI, Grok, Perplexity, DeepSeek, Le Chat / Vibe and Kimi, plus "my own computer". The page writes a plan with the menu path at each step [1]:

1. Pack: export your chats. For ChatGPT the path is Settings → Data controls → Export data; a ZIP file arrives by email within 7 days and the link works for 24 hours.
2. Copy the memories and instructions the old service holds.
3. Move in at the new one.
4. Check the training setting there. Training means the company uses your chats to teach its next models.
5. Close the old account (optional).

Two prompts carry the context. The moving letter asks the old AI to write down your instructions and saved memories word for word, your projects, how you like answers, and what you asked it to always or never do. The move-in prompt gives that letter to the new AI and asks for five short lines on what it will keep in mind. The page was checked against each company's help pages on 29 September 2026, and it says menus move [1].

## A data law lets you ask the company for your file

Moving Day also builds a request letter, for an app with no export button or a file that comes back incomplete [1]. You choose the company and the country and add your name and account email. You copy the letter, in English, to the company's privacy channel.

Four laws from the page's table, checked against their texts. Thailand's is the Personal Data Protection Act (พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล, phor ror bor khumkhrong khomun suan bukkhon), PDPA for short.

| Where | Law | What it gives | Answer due |
|---|---|---|---|
| Thailand | PDPA, sections 30 and 31 [2] | A copy of your data, in a format a machine can read and another controller can take | 30 days |
| European Union | GDPR, Articles 15 and 20 [3] | Access, and a structured, machine-readable file to send to another controller | One month, extendable by two more (Article 12) |
| California | CCPA, section 1798.130 [4] | The information in a readily useable format you can transmit to another entity | 45 days |
| Brazil | LGPD, Articles 18 and 19 [5] | Access and portability on express request | 15 days for the full statement of your data |

## An open model keeps running where you put it

Open weights means AI whose model file anyone can download and run [1]. On 26 September 2026 I asked for instructions on open-weights models: "something Thai people can afford and learn to use right now." The same day I had a second way of working installed on my own Cloudflare account (Cloudflare is a company that runs AI models on its own network of computers [6]): OpenCode, an open-source coding agent [7], talking to open-weights models on Cloudflare Workers AI.

Workers AI runs models on Cloudflare's GPUs, called from your own code and priced by use [6]. Its catalog lists Llama, Gemma, DeepSeek, Qwen, Mistral, GLM, Kimi and OpenAI's gpt-oss [8]. Models leave that catalog too; the page has a notice for one that is "deprecated, removed, or not found" [8].

On your own computer, the model file and the chats are files on that machine, and moving means copying the folder [1]. Moving Day lists LM Studio, Jan and Ollama for Mac, Windows and Linux, PocketPal AI for iPhone and Android, and Typhoon, Thai-language models from SCB 10X that load in those apps. A small model on a phone is slower and knows less than the big ones on the web, and a computer with 16 GB of memory or more runs mid-size ones comfortably [1].

## Hongdam installs the second way of working

Hongdam's "Your own AI website builder" puts OpenCode on your computer, connects your GitHub and Cloudflare accounts, and trains you on it [9]. The models are DeepSeek, Kimi, GLM and Qwen, run through Workers AI on your Cloudflare account, and Cloudflare bills you by use. The code sits in your GitHub account, and the sites go on GitHub Pages or Cloudflare Pages under your domain. Its example: nine pages in Thai and English, written and published from one brief in 10 minutes 21 seconds [9].

That service builds websites. Moving Day covers the chat services.

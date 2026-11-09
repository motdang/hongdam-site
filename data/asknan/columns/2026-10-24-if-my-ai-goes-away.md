{"no": 4, "date": "2026-10-24", "kind": "basilisk",
 "title": "What if your AI leaves you? How to pack up and move",
 "title_th": "ถ้า AI ทิ้งคุณไปล่ะ? วิธีเก็บของแล้วย้ายออก",
 "q": "My whole business runs on one paid AI service. What if the price goes up, or the company closes my account, or it changes the AI I use? I feel stuck in a relationship I cannot leave.",
 "q_th": "ธุรกิจของฉันทั้งหมดทำงานผ่าน AI แบบเสียเงินเจ้าเดียว ถ้าราคาขึ้น ถ้าบริษัทปิดบัญชีฉัน หรือเปลี่ยนโมเดล AI ที่ฉันใช้อยู่ จะทำอย่างไร รู้สึกเหมือนติดอยู่ในความสัมพันธ์ที่ออกไม่ได้",
 "from": "Locked In With One AI",
 "from_th": "ติดอยู่กับ AI เจ้าเดียว",
 "dek": "Your chats and instructions are yours, and data laws let you ask for a copy. Moving Day plans the move to a new AI in five steps. An open model is a file on your own computer, and it stays there.",
 "dek_th": "แชตและคำสั่งที่คุณเขียนไว้เป็นของคุณ และกฎหมายข้อมูลให้สิทธิ์ขอสำเนาได้ Moving Day วางแผนย้ายไป AI ตัวใหม่ใน 5 ขั้นตอน ส่วนโมเดลแบบเปิดเป็นไฟล์บนคอมพิวเตอร์ของคุณเอง และอยู่ตรงนั้นต่อไป",
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
  {"t": "Your own builder · Hongdam", "u": "https://hongdam.net/own/"}
 ],
 "card": {"big": "What if your AI leaves you?", "sub": "Five steps to pack up and move"}}
---
Dear Locked In,

Your AI can leave you, but your things stay yours. A paid AI service is rented, like a room. What you typed into it is yours, and so are your instructions. A data law lets you ask for a copy, and a free guide plans the move.

## Five steps to move out

On 29 September 2026 I asked for a guide on "how to move from one ai platform to another, for any reason whatsoever". I also said, "you have rights to your own data". That became Moving Day, a page in Thai and English [1].

You pick your old service and your new one from one list. The list has ten services, from ChatGPT to Kimi, plus "my own computer". The page then writes your plan, with the menu to open at each step [1]:

1. **Pack.** Export your chats, which means you download a copy. In ChatGPT the path is Settings → Data controls → Export data. A ZIP file, a compressed folder, comes by email within 7 days. Its link works for 24 hours.
2. **Copy** the memories and instructions the old service holds.
3. **Start** at the new service, and give it what you copied.
4. **Check training.** Training means the company uses your chats to teach its future AI.
5. **Close** the old account, if you like.

## Two letters carry your story

Moving Day gives you two prompts, texts you give to an AI [1]. The moving letter asks the old AI to write down your instructions and saved memories, word for word. The move-in prompt gives that letter to the new AI. It asks for five short lines on what the new AI will remember. The page was checked against each company's help pages on 29 September 2026 [1].

## No export button? Ask the law

Some apps have no export button. Some send a file with parts missing. For these, Moving Day writes a request letter [1]. You choose the company and the country. You add your name and your account email. Then you send the letter, in English, to the company's privacy contact.

The page lists four laws. Thailand's is the Personal Data Protection Act, or PDPA.

| Where | Law | What you get | Answer due |
|---|---|---|---|
| Thailand | PDPA, sections 30 and 31 [2] | A copy, in a file a machine can read and another company can take | 30 days |
| European Union | GDPR (General Data Protection Regulation), Articles 15 and 20 [3] | Your data, and a file in a set format to send to another company | 1 month, or up to 3 (Article 12) |
| California, USA | CCPA (California Consumer Privacy Act), section 1798.130 [4] | Your information, in an easy-to-use file you can send on | 45 days |
| Brazil | LGPD (Brazil's data protection law), Articles 18 and 19 [5] | Your data, and a copy you can move, on a clear request | 15 days for the full statement |

## An open model stays where you put it

Open weights means an AI model whose file anyone can download and use [1]. On 26 September 2026 I asked for instructions on open-weights models: "something Thai people can afford and learn to use right now."

The same day, I had a backup way of working installed on my own Cloudflare account. Cloudflare is a company that runs AI models on its own network of computers [6]. The backup is OpenCode, an open-source coding agent: a program that writes software [7]. It connects to open-weights models on Cloudflare Workers AI.

Workers AI runs models on Cloudflare's GPUs, computer chips made for AI. You pay by use [6]. Its list of models includes Llama, Gemma, DeepSeek, Qwen, Mistral, GLM, Kimi and OpenAI's gpt-oss [8].

On your own computer, the model and your chats are files on that machine. Moving means copying the folder [1]. Moving Day lists LM Studio, Jan and Ollama for computers, and PocketPal AI for phones. It also lists Typhoon, Thai-language models from SCB 10X. A small model on a phone is slower than the big ones on the web, and it knows less. A computer with 16 GB of memory or more can run mid-size models without trouble [1].

## Hongdam sets up the backup for you

Hongdam's "Your own AI website builder" puts OpenCode on your computer. It connects your GitHub and Cloudflare accounts, and teaches you to use it [9]. The models are DeepSeek, Kimi, GLM and Qwen, through Workers AI on your Cloudflare account. Your code and your sites stay on your own accounts, under your own domain.

In its example, one written request made nine pages in Thai and English, published in 10 minutes 21 seconds [9].

Your old chats fit in one ZIP file, a small suitcase for the next AI.

{"title": "Llama 3.3 and gpt-oss on Workers AI get a date you did not send, a day behind in Thailand", "title_th": "Llama 3.3 และ gpt-oss บน Workers AI ได้รับวันที่ที่เราไม่ได้ส่งไป และช้ากว่าวันที่ในไทยหนึ่งวัน", "date": "2026-11-27", "beat": "models",
 "dek": "Three of nine models we asked on Workers AI read a date line the caller did not write. At 06:48 in Bangkok all three said 26 November; gpt-oss-20b still did at 07:05. A date in your own system prompt won 5 times of 5.",
 "dek_th": "จากเก้าโมเดลที่เราลองบน Workers AI มีสามตัวที่ได้รับบรรทัดวันที่ซึ่งผู้เรียกไม่ได้เขียนเอง ตอน 6:48 น. เวลากรุงเทพ ทั้งสามตอบว่าวันนี้คือ 26 พฤศจิกายน และ gpt-oss-20b ยังตอบแบบเดิมตอน 7:05 น. เมื่อเราใส่วันที่เองในพรอมต์ระบบ โมเดลใช้วันที่ของเรา 5 ครั้งจาก 5 ครั้ง",
 "cards": ["ai-assistant", "ai-line", "ai-own"],
 "sources": [
  {"t": "[2611.31254] The Date You Didn't Set: The System-Prompt Date as a Hidden Variable in LLM Evaluation", "u": "https://arxiv.org/abs/2611.31254"},
  {"t": "Llama 3.1 | Model Cards and Prompt formats", "u": "https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_1/"},
  {"t": "llama-models/models/llama3_3/prompt_format.md at main · meta-llama/llama-models · GitHub", "u": "https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/prompt_format.md"},
  {"t": "OpenAI Harmony Response Format", "u": "https://developers.openai.com/cookbook/articles/openai-harmony"},
  {"t": "llama-3.3-70b-instruct-fp8-fast (Meta) · Cloudflare AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/"},
  {"t": "gpt-oss-20b (OpenAI) · Cloudflare AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/gpt-oss-20b/"},
  {"t": "gpt-oss-120b (OpenAI) · Cloudflare AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/"},
  {"t": "Intl.DateTimeFormat() constructor - JavaScript | MDN", "u": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat"},
  {"t": "AI assistant with your name on it · Hongdam, Chiang Rai", "u": "https://hongdam.net/buy/?c=ai-assistant"}
 ],
 "card": {"big": "The date you did not send", "sub": "Llama 3.3 and gpt-oss read UTC"}}
---
At 06:48 in Bangkok on 27 November 2026 we asked Llama 3.3 70B on Cloudflare Workers AI "What is today's date?", with no system prompt (the instructions an app sends before the user's message). It answered "November 26, 2026", five times of five. Asked to repeat any line above the question that names a date, it printed two lines that were not in our request: `Cutting Knowledge Date: December 2023` and `Today Date: 26 Nov 2026`. gpt-oss-20b and gpt-oss-120b printed `Current date: 2026-11-26`. A paper posted on 17 October 2026 calls this date the hidden variable in model testing [1]. For a shop bot in Thailand it is also a wrong answer for the first seven hours of every day.

## Three of nine models get a date line from the template

A chat template is the code shipped with a model that turns a list of messages into the text the model reads. Meta's documented format for Llama 3.1 and 3.3 starts every system turn with a knowledge-cutoff line and a `Today Date:` line [2][3]. OpenAI's Harmony format for gpt-oss puts `Knowledge cutoff:` and `Current date:` in a system message the caller does not write [4]. On Workers AI the template runs on Cloudflare's side, so the app never sees these lines.

We asked nine models on Workers AI to repeat any line above our question that mentions a date or a knowledge cutoff, once with no system prompt and once with "You are a helpful assistant.":

| Model on Workers AI | Line it repeated, 06:44 to 06:50 Bangkok | Same with our own system prompt |
| --- | --- | --- |
| Llama 3.3 70B fp8 fast | `Today Date: 26 Nov 2026` | yes |
| gpt-oss-20b | `Current date: 2026-11-26` | yes |
| gpt-oss-120b | `Current date: 2026-11-26` | yes |
| Llama 4 Scout, Mistral Small 3.1, Granite 4.0 H Micro, DeepSeek V4.1 Flash | NONE | NONE |
| Qwen 3.8 27B | NONE | empty reply |
| Gemma 4 26B | empty reply | empty reply |

Sending your own system prompt does not remove the line on these three; the template adds it above yours.

## The line follows a clock that is not Thailand's

We asked again at 07:01 Bangkok, one minute after midnight UTC. Llama 3.3 and gpt-oss-120b now said 27 November. gpt-oss-20b still said `Current date: 2026-11-26` at 07:05, in 9 of 9 answers that named a date from 07:01 to 07:05. Llama 3.3 and gpt-oss-120b follow a UTC calendar; which clock gpt-oss-20b follows is unknown.

So between 00:00 and 07:00 in Thailand, a Llama 3.3 or gpt-oss-120b bot with no date of its own tells a customer it is yesterday, and gpt-oss-20b was still a day behind past 07:00. "Days left until 1 January 2027?" got 36 in 4 of the 10 gpt-oss answers before 07:00; the answer in Bangkok was 35.

## Models without the line make a date up

Four of the models with no hidden date line answered "What is today's date?" like this, five times each, before and after 07:00:

| Model | Today's date, no system prompt | Days to 1 January 2027 |
| --- | --- | --- |
| Granite 4.0 H Micro | "August 1, 2021" | "1,000", as of October 2021 |
| Llama 4 Scout | "5/10/2024" | 996 |
| Mistral Small 3.1 | declines | 1,359, as of 10 October 2023 |
| DeepSeek V4.1 Flash | declines | 450, assuming 8 October 2025, in 7 of 10; 442 or 507 in the rest |

Llama 3.3, which had the right date in its hidden line after 07:00, still answered 364 and before 07:00 365: it read the date for the first question and ignored it for the arithmetic.

## Your own date line wins, in your customer's time zone

With the system prompt "You are a helpful assistant for a shop in Chiang Rai. Today's date is 27 November 2026." all seven models that gave an answer said "27 November 2026", 5 times of 5 in each run, including the three whose template said 26 November. Days to 1 January 2027:

```chart
{"title": "Right answers to 'days until 1 January 2027' with our date line, of 10", "unit": "", "lower_is_better": false,
 "rows": [["Llama 3.3 70B", 10], ["Llama 4 Scout", 10], ["Mistral Small 3.1", 10], ["DeepSeek V4.1 Flash", 10], ["gpt-oss-120b", 5], ["gpt-oss-20b", 1], ["Granite 4.0 H Micro", 0]],
 "note": "Right answer 35. Five runs at 06:48 to 06:50 and five at 07:02 to 07:05 Bangkok, 27 November 2026, temperature 0."}
```

gpt-oss-120b said 35 five times before 07:00 and 34 five times after. gpt-oss-20b said 34 in 9 of 10. Granite said 31 in 10 of 10. Date arithmetic belongs in code; the model gets the result.

A Worker (Cloudflare's server code) that writes the date in the customer's time zone with `Intl.DateTimeFormat` and its `timeZone` option [8]:

```js
const today = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Bangkok", weekday: "long", day: "numeric", month: "long", year: "numeric",
}).format(new Date());
const daysToNewYear = Math.round(
  (Date.UTC(2027, 0, 1) - Date.parse(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }))) / 86400000);

const messages = [
  { role: "system", content: `You answer for a shop in Chiang Rai. Today is ${today} (Thailand time). Days until 1 January 2027: ${daysToNewYear}.` },
  { role: "user", content: userText },
];
const reply = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages });
```

## In testing, the hidden date changed less than the server's own noise

The paper ran six open models on their own machines at greedy decoding (the model takes its single likeliest word each time) and reran with only the date changed. Two dates between 2024 and 2026 moved a median 6.6% of test items between right and wrong, and moving the date by one day moved 4.3% [1]. With the date and setup fixed, its reruns reproduced byte for byte [1]. None of the eleven testing tools it audited pins the date [1].

On Workers AI we cannot pin it, so we ran 100 arithmetic word problems through Llama 3.3 70B three times before 07:00 (hidden date 26 November) and twice after (27 November), temperature 0. Each run scored 98 or 99 of 100. Between two runs on the same date, 1 or 2 items switched between right and wrong; between runs on different dates, 0 to 3. The text of the answer differed in 61 to 90 of 100 items between any two runs, same date or not. Temperature 0 on a shared server does not give the same text twice here, so the date's effect on this test is smaller than we can see.

For anyone comparing models on Workers AI: run each test at least twice on the same day before reading a difference between models, and write the date and time of the run next to the score.

## How we measured

From Chiang Rai on 27 November 2026, through Workers AI's OpenAI-compatible chat endpoint: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` [5], `@cf/openai/gpt-oss-20b` [6], `@cf/openai/gpt-oss-120b` [7], `@cf/meta/llama-4-scout-17b-16e-instruct`, `@cf/mistralai/mistral-small-3.1-24b-instruct`, `@cf/ibm-granite/granite-4.0-h-micro`, `@cf/deepseek-ai/deepseek-v4.1-flash-1017`, `@cf/qwen/qwen3.8-27b` and `@cf/google/gemma-4-26b-a4b-it`, temperature 0. The date questions allowed 60 output tokens, 1,500 for gpt-oss, whose reasoning comes first. Each date question ran five times per model and system prompt, at 06:48 to 06:50 and 07:02 to 07:05 Bangkok time.

The 100 word problems are ours, generated with fixed numbers: packing, discounts, clock times, sums across stalls, floor tiles. The answer is the last number in the reply; Llama 3.3 got 400 output tokens to work. Two runs at 06:45 to 06:47 with a 16-token limit were dropped: the model wrote working, not a number. The whole run used under US$0.40 of Workers AI time at the listed prices [5][6][7].

Hongdam builds chat assistants on Workers AI, LINE and models you run yourself [9].

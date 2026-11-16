{"title": "Inkling 2 Small on Workers AI: reasoning_effort none still thinks, and bills for it", "title_th": "Inkling 2 Small บน Workers AI: ตั้ง reasoning_effort เป็น none แล้วโมเดลยังคิดต่อ และโทเค็นที่ใช้คิดก็ถูกเรียกเก็บเงิน", "date": "2026-11-16", "beat": "models",
 "dek": "Cloudflare added Thinking Machines' open model on 12 November. In 300 graded calls today, none still reasoned in 30 of 30 replies and used 16% more tokens than the default. minimal was the cheapest setting with every task right.",
 "dek_th": "Cloudflare เพิ่มโมเดลเปิดของ Thinking Machines เมื่อ 12 พฤศจิกายน เราทดสอบ 300 ครั้งวันนี้ ตั้งค่า none แล้วโมเดลยังเขียนขั้นตอนคิดทั้ง 30 จาก 30 คำตอบ และใช้โทเค็นมากกว่าค่าเริ่มต้น 16% ส่วน minimal ถูกที่สุดในบรรดาค่าที่ตอบถูกครบทุกข้อ",
 "cards": ["ai-assistant", "ai-batch", "ai-line"],
 "sources": [
  {"t": "Inkling 2 Small now available on Workers AI · Cloudflare changelog, 12 November 2026", "u": "https://developers.cloudflare.com/changelog/post/2026-11-12-inkling-2-small-workers-ai/"},
  {"t": "inkling-2-small · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/inkling-2-small/"},
  {"t": "Pricing · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/pricing/"},
  {"t": "Limits · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/limits/"},
  {"t": "thinkingmachines/Inkling-2-Small · Hugging Face", "u": "https://huggingface.co/thinkingmachines/Inkling-2-Small"},
  {"t": "chat_template.jinja · thinkingmachines/Inkling-2-Small · Hugging Face", "u": "https://huggingface.co/thinkingmachines/Inkling-2-Small/blob/main/chat_template.jinja"},
  {"t": "Introducing Inkling 2 Small · Thinking Machines Lab, 5 November 2026", "u": "https://thinkingmachines.ai/news/inkling-2-small/"},
  {"t": "Planned model deprecations on Workers AI · Cloudflare changelog, 5 November 2026", "u": "https://developers.cloudflare.com/changelog/post/2026-11-05-planned-model-deprecations/"},
  {"t": "Same text, Thai or English: 1.46 times the tokens on DeepSeek, 2.94 times on GLM-5.3 · Hongdam Studio", "u": "https://hongdam.net/studio/notes/thai-tokens-cost-by-model/"},
  {"t": "Buy · Hongdam", "u": "https://hongdam.net/buy/?c=ai-assistant"}
 ],
 "card": {"big": "reasoning_effort none still thinks", "sub": "Inkling 2 Small on Workers AI, 300 graded calls · 16 November 2026"}}
---
Cloudflare put Inkling 2 Small, the open-weights model from Thinking Machines Lab, on Workers AI on 12 November 2026 [1]. Its page lists six reasoning levels, and the changelog says to set `reasoning_effort` "to `none` to turn reasoning off" [1][2]. On 16 November 2026 we sent ten builder tasks, three runs each, at every level through Workers AI's OpenAI-compatible endpoint. At `none`, all 30 replies came back with reasoning, and the 30 runs billed 21,370 output tokens: 16% more than the default `high`, 76% more than `minimal`.

Reasoning is the working a model writes before its answer. Workers AI returns it in a separate `reasoning_content` field and bills it as output. A token is the unit a model reads and writes, about three quarters of an English word.

## US$0.30 in, US$1.00 out, on the paid plan only

Thinking Machines announced the model on 5 November and released the weights on 12 November under the Apache 2.0 licence [5][7]. It is a mixture-of-experts model, one that uses a small part of itself for each token: 594 billion parameters, 17 billion active [5][7] (Cloudflare's page says 18 [2]). The context window on Workers AI is 1,048,576 tokens [2].

Prices read 16 November 2026: US$0.30 per million input tokens, US$1.00 per million output, US$0.10 for cached input [3]. That is twice GLM-5.3 Flash (US$0.15 and US$0.50 [3]), which Workers AI stops serving on 20 November [8]. Inkling 2 Small needs the Workers Paid plan or prepaid AI Gateway credits, so the free 10,000 neurons a day do not cover it [2][3]. A neuron is Workers AI's billing unit; 1,000 cost US$0.011 [3]. The rate limit is 20 requests a minute on standard billing and 50 with prepaid credits [4]. We sent 18 a minute for twelve minutes and no call was refused.

## Five levels change the bill; `none` lands near the default

| `reasoning_effort` | Correct of 30 | Replies with reasoning | Output tokens | Seconds, median | Neurons | US$ at list price |
| --- | --- | --- | --- | --- | --- | --- |
| `none` | 30 | 30 | 21,370 | 1.4 | 2,030 | 0.0223 |
| `minimal` | 30 | 30 | 12,171 | 1.1 | 1,194 | 0.0131 |
| `low` | 29 | 30 | 14,580 | 1.1 | 1,413 | 0.0155 |
| `medium` | 30 | 30 | 18,373 | 1.3 | 1,758 | 0.0193 |
| `high` (default) | 30 | 30 | 18,401 | 1.3 | 1,761 | 0.0194 |
| `max` | 30 | 30 | 23,827 | 1.4 | 2,254 | 0.0248 |

```chart
{"title": "Output tokens for 30 runs, Inkling 2 Small", "unit": "", "lower_is_better": true,
 "rows": [["enable_thinking false", 2785], ["minimal", 12171], ["low", 14580], ["medium", 18373], ["high (default)", 18401], ["none", 21370], ["max", 23827]],
 "note": "Ten tasks, three runs each, measured 16 November 2026 on Workers AI. Correct answers: 19 of 30 with enable_thinking false, 29 at low, 30 at the other five."}
```

`minimal` wrote fewer tokens than `high` on all ten tasks, by median, and `low` on eight. `medium` and `high` came out 28 tokens apart over 30 runs. `none` sat between `high` and `max`.

The model's chat template, the file that turns a request into the text the model reads, maps the six names to numbers: `none` 0, `minimal` 0.1, `low` 0.2, `medium` 0.7, `high` 0.9, `max` 0.99. It writes the number into a system line that starts "Thinking effort level:" [6]. Our 30 prompts counted 3,216 input tokens at `none`, the same as at each of the other five names, and 3,156 with thinking switched off the other way (next section): 2 fewer per prompt. That fits `none` reaching the model as a number other than 0. Workers AI does not return the rendered prompt, so the cause is unknown. It does check the field: `"NONE"`, `"0"`, a bare number 0 and an invented word each returned HTTP 400.

## `enable_thinking: false` switches it off, and the arithmetic goes with it

Sending `{"chat_template_kwargs": {"enable_thinking": false}}` in place of `reasoning_effort` did what `none` did not. 28 of 30 replies carried no reasoning, and the 30 runs billed 2,785 output tokens, 85% fewer than `high`, for 339 neurons.

19 of 30 were correct. The crontab line, the SQL, the Thai order turned into JSON, both Python tasks and the date count passed three times of three. The VAT total failed twice, and the bill, the calendar count and the puzzle failed every time. In two puzzle replies the model wrote its working into the answer in front of the right JSON, so an app parsing the reply as JSON gets an error.

For an app on Inkling 2 Small today:

- Extraction, formatting, short code: `enable_thinking` false, about a fifth of the default bill.
- Anything with numbers or conditions: `minimal`. It got 30 of 30 with 34% fewer tokens than the default.
- `none`: read `reasoning_content` and `usage.completion_tokens` in one of your own replies before counting on it.

```python
import json, os, urllib.request

ACCOUNT, TOKEN = os.environ["CF_ACCOUNT_ID"], os.environ["CF_API_TOKEN"]
URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/ai/v1/chat/completions"

def ask(prompt, **setting):
    body = dict({"model": "@cf/thinkingmachines/inkling-2-small", "max_tokens": 8192,
                 "messages": [{"role": "user", "content": prompt}]}, **setting)
    req = urllib.request.Request(URL, json.dumps(body).encode(),
                                 {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
    reply = json.load(urllib.request.urlopen(req, timeout=600))
    msg, usage = reply["choices"][0]["message"], reply["usage"]
    return msg["content"], len(msg.get("reasoning_content") or ""), usage["completion_tokens"]

q = "37 mugs at 185 baht and 12 at 240 baht, 7% off the total. Baht to pay? Number only."
print(ask(q, reasoning_effort="none"))                           # reasoning length above 0 in our runs
print(ask(q, reasoning_effort="minimal"))
print(ask(q, chat_template_kwargs={"enable_thinking": False}))   # reasoning length 0
```

## Against GLM-5.3 Flash and Gemma 4 26B, the same hour

| 30 runs | Correct | Output tokens | Seconds, total | Seconds, median | Neurons |
| --- | --- | --- | --- | --- | --- |
| Inkling 2 Small, `minimal` | 30 | 12,171 | 36 | 1.1 | 1,194 |
| GLM-5.3 Flash, `low` | 27 | 9,519 | 166 | 1.7 | 474 |
| GLM-5.3 Flash, `max` | 29 | 27,027 | 248 | 4.5 | 1,270 |
| Gemma 4 26B, nothing set | 28 | 55,153 | 1,024 | 18.7 | 1,533 |

Inkling's 30 runs took 36 to 60 seconds of call time at each level. Counting the Friday the 13ths from 2027 to 2030 (six) separated the models: Inkling got it 18 times of 18 across the six levels, Flash at `low` twice of three, and Gemma once, with two replies that ran to the 8,192-token allowance and returned nothing. Three Flash replies at `low` carried their thinking in the answer text.

## Thai text takes 1.57 times the tokens of English

We counted input tokens for eight short shop texts in English and Thai, the method of our 30 October note with new texts [9].

| Model | English | Thai | Thai ÷ English | Input price × multiple, US$ per million |
| --- | --- | --- | --- | --- |
| Gemma 4 26B | 291 | 348 | 1.20 | 0.12 |
| DeepSeek V4.1 Flash 1017 | 282 | 397 | 1.41 | 0.42 |
| GLM-5.3 Flash | 285 | 816 | 2.86 | 0.43 |
| Inkling 2 Small | 310 | 486 | 1.57 | 0.47 |

List input prices read 16 November 2026 [3]. For Thai input, Inkling costs about what DeepSeek V4.1 Flash 1017 and GLM-5.3 Flash do.

## How we measured

Ten tasks a builder hands a model: an invoice with a service charge and VAT, days between two dates, Friday the 13ths in four years, a crontab line (the schedule format servers use) for a Bangkok time on a UTC server, an SQL query (a question to a database) run against a test table, a Thai LINE order turned into JSON (data in labelled fields), a Thai national ID check in Python run against test cases, a bug fixed in a median function, a three-server logic puzzle with one solution, and a 30-day token bill. A script graded each reply: the first number compared, SQL executed, JSON parsed, Python run. Each task ran three times at ten settings, 300 calls, through the chat completions endpoint between 13:35 and 13:47 Bangkok time on 16 November 2026, with a reply allowance of 8,192 tokens and temperature left at the platform's setting. No call failed. Token and neuron counts come from the replies; the 300 calls cost US$0.15 at list prices. The Thai count used 68 more calls with a one-line instruction in front, subtracted afterwards. We did not test the Workers binding (`env.AI.run()`), images, tools or long contexts. Hongdam picks the model and its settings for an assistant by running the customer's own tasks this way [10].

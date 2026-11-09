{"title": "GLM-5.3 Flash's replacements: Gemma 4 26B costs less per task, Qwen3.8 27B 3.6 times more", "title_th": "หาตัวแทน GLM-5.3 Flash: Gemma 4 26B ถูกกว่าต่อข้อ Qwen3.8 27B แพงกว่า 3.6 เท่า ทั้งคู่ตอบถูก 20 จาก 20 ข้อ", "date": "2026-11-09", "beat": "models",
 "dek": "Workers AI stops GLM-5.3 Flash on 20 November and names two small replacements. Ten builder tasks, two runs each: all four models 20 of 20 with thinking on; off, Gemma missed 2, Qwen 5. Both new ones run on the free allowance.",
 "dek_th": "Workers AI จะหยุดให้บริการ GLM-5.3 Flash วันที่ 20 พฤศจิกายน และแนะนำโมเดลเล็กสองตัวมาแทน เราวัดด้วยงานช่างสิบข้อ ข้อละสองรอบ เปิดโหมดคิดทุกโมเดลตอบถูกหมด ปิดโหมดคิด Gemma พลาดสองข้อ Qwen พลาดห้าข้อ และทั้งสองรุ่นใหม่ใช้ได้ในโควตาฟรีวันละ 10,000 neuron",
 "cards": ["ai-assistant", "ai-batch", "ai-line"],
 "sources": [
  {"t": "Planned model deprecations on Workers AI · Cloudflare changelog, 5 November 2026", "u": "https://developers.cloudflare.com/changelog/post/2026-11-05-planned-model-deprecations/"},
  {"t": "Pricing · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/pricing/"},
  {"t": "glm-5.3-flash · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/glm-5.3-flash/"},
  {"t": "gemma-4-26b-a4b-it · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/"},
  {"t": "qwen3.8-27b · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/"},
  {"t": "glm-5.3 · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/glm-5.3/"},
  {"t": "google/gemma-4-26B-A4B-it · Hugging Face", "u": "https://huggingface.co/google/gemma-4-26B-A4B-it"},
  {"t": "Qwen/Qwen3.8-27B · Hugging Face", "u": "https://huggingface.co/Qwen/Qwen3.8-27B"},
  {"t": "Thinking mode in Gemma · Google AI for Developers", "u": "https://ai.google.dev/gemma/docs/capabilities/thinking"},
  {"t": "Buy · Hongdam", "u": "https://hongdam.net/buy/?c=ai-assistant"}
 ],
 "card": {"big": "GLM-5.3 Flash's replacements, measured", "sub": "Gemma 4 26B and Qwen3.8 27B, 20 of 20 each · 9 November 2026"}}
---
Cloudflare's Workers AI stops serving GLM-5.3 Flash on 20 November 2026, and its deprecation notice names two small models to move to, Gemma 4 26B and Qwen3.8 27B, without saying which fits which job [1]. We ran the same ten builder tasks on all three, plus GLM-5.3, on 9 November 2026: two runs per task, 180 calls in all. With thinking on, every model got 20 of 20. The difference is the bill. Gemma 4 26B used 410 neurons for its 20 runs, GLM-5.3 Flash 531, Qwen3.8 27B 1,920 and GLM-5.3 5,195. A neuron is Workers AI's billing unit across models; 1,000 of them cost US$0.011, and every account gets 10,000 a day free [2].

## Two replacements named, and only the new ones run on the free allowance

The 5 November notice lists 16 language models that return HTTP 410 Gone with error code 5028 from 20 November, a date moved from 15 November [1]. For the frontier end it points at DeepSeek V4.1 Flash 1017 and GLM-5.3; for smaller jobs, at `@cf/google/gemma-4-26b-a4b-it` and `@cf/qwen/qwen3.8-27b` [1].

| Model, price read 9 November 2026 | Input, US$ per million tokens | Output, US$ per million tokens | On the free allowance |
| --- | --- | --- | --- |
| GLM-5.3 Flash (ends 20 November) | 0.15 | 0.50 | No: paid plan or AI Gateway credits [2][3] |
| Gemma 4 26B | 0.10 | 0.30 | Yes [2] |
| Qwen3.8 27B | 0.45 | 3.20 | Yes [2] |
| GLM-5.3 | 1.40 | 4.40 | No [2][6] |

The pricing page lists eight models that need a paid billing method; GLM-5.3 Flash and GLM-5.3 are on it, Gemma 4 26B and Qwen3.8 27B are not [2]. A prototype that today needs a paid plan for GLM-5.3 Flash runs on the free 10,000 neurons after the switch. At the rate we measured, that is about 488 tasks a day on Gemma 4 26B with thinking on, or 104 on Qwen3.8 27B at its default.

Qwen3.8 27B is a dense model, one that uses all of its parameters for every token, with 27 billion of them [5][8]. Gemma 4 26B is a mixture-of-experts model, one that uses a small part of itself for each token: 25.2 billion parameters in all, 3.8 billion active [7]. GLM-5.3 Flash is the same kind at 320 billion total and 18 billion active [3].

## With thinking on, all four answered 20 of 20

Thinking is the hidden reasoning a model writes before its answer. Workers AI returns it in a separate `reasoning_content` field and counts it in the output tokens it bills. A token is the unit a model reads and writes, about three quarters of an English word.

| 20 runs, model's default on Workers AI | Correct | Output tokens | Seconds, total | Seconds, median | Neurons | US$ at list price |
| --- | --- | --- | --- | --- | --- | --- |
| GLM-5.3 Flash, reasoning max | 20 | 11,261 | 164 | 5.3 | 531 | 0.0058 |
| Gemma 4 26B, thinking on | 20 | 14,561 | 256 | 11.6 | 410 | 0.0045 |
| Qwen3.8 27B, reasoning xhigh | 20 | 6,290 | 245 | 7.2 | 1,920 | 0.0211 |
| GLM-5.3, reasoning max | 20 | 12,545 | 87 | 3.3 | 5,195 | 0.0571 |

Gemma wrote 29% more tokens than GLM-5.3 Flash and took 56% longer, and still cost 23% less, because its price per token is lower. Qwen wrote the fewest tokens of the four and cost 3.6 times what Flash did, because its output price is 6.4 times Flash's. GLM-5.3 was the fastest and cost almost ten times Flash.

```chart
{"title": "Neurons for 20 runs, thinking on", "unit": "", "lower_is_better": true,
 "rows": [["Gemma 4 26B", 410], ["GLM-5.3 Flash", 531], ["Qwen3.8 27B", 1920], ["GLM-5.3", 5195]],
 "note": "Ten tasks, two runs each, measured 9 November 2026 on Workers AI. All four answered 20 of 20. 1,000 neurons cost US$0.011; 10,000 a day are free."}
```

The defaults differ. GLM-5.3 Flash and GLM-5.3 take `reasoning_effort` of `low`, `high` or `max`, default `max`, and their pages say reasoning cannot be turned off [3][6]. Qwen3.8 27B takes `low`, `medium` or `xhigh`, default `xhigh` [5]. Gemma's page lists reasoning as supported and names no default [4]; in our 20 runs with nothing set, every reply carried a reasoning block, so Workers AI serves it with thinking on. Setting `enable_thinking` to true explicitly gave the same result, 20 of 20 at 12,094 tokens.

## Thinking off cuts the tokens by 91 to 96% and fails the arithmetic

Both new models accept `{"chat_template_kwargs": {"enable_thinking": false}}` [7][8][9]. Workers AI passed it through, and the replies shrank to a line.

| 20 runs | Correct | Output tokens | Seconds, total | Neurons | Wrong answers |
| --- | --- | --- | --- | --- | --- |
| Gemma 4 26B, thinking off | 18 | 649 | 34 | 30 | The 30-day token bill, both runs: 102.60 and 111.60 for 6.30 |
| Qwen3.8 27B, thinking off | 15 | 539 | 31 | 214 | Sundays in 2027 once (53 for 52), the three-server puzzle both runs, the token bill both runs (13.23 and 89.70) |
| GLM-5.3 Flash, reasoning low | 20 | 1,310 | 31 | 78 | none |
| Qwen3.8 27B, reasoning low | 20 | 5,176 | 189 | 1,586 | none |

The code tasks, the SQL, the JSON and the cron line all passed with thinking off. What failed was multi-step arithmetic and the puzzle. GLM-5.3 Flash at `low` got all 20 for 78 neurons, the cheapest correct run of the day and a setting that goes away with the model. Neither replacement has a middle like it: Gemma is on or off, and Qwen at `low` still wrote four times the tokens of Flash at `low`.

For an app: leave thinking on for anything with numbers or conditions in it, and turn it off for extraction, formatting and short code, where it cut the Gemma bill by 93%.

## The change is the model id and one field

```python
import json, os, urllib.request

ACCOUNT, TOKEN = os.environ["CF_ACCOUNT_ID"], os.environ["CF_API_TOKEN"]
URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/ai/v1/chat/completions"

def ask(model, prompt, thinking=True):
    body = {"model": model, "max_tokens": 8192,
            "messages": [{"role": "user", "content": prompt}],
            "chat_template_kwargs": {"enable_thinking": thinking}}
    req = urllib.request.Request(URL, json.dumps(body).encode(),
                                 {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
    reply = json.load(urllib.request.urlopen(req, timeout=600))
    msg = reply["choices"][0]["message"]
    return msg["content"], msg.get("reasoning_content"), reply["usage"]["neurons"]

print(ask("@cf/google/gemma-4-26b-a4b-it", "How many Sundays are there in 2027? Number only."))
```

The `usage` block in every reply carries `neurons` next to the token counts, so a day's spend adds up from the replies themselves. For Qwen, `reasoning_effort` with `low`, `medium` or `xhigh` goes in the same body [5].

## How we measured

Ten tasks a builder hands a model: a VAT total in baht, days between two dates, Sundays in 2027, a crontab line (the schedule format servers use), an SQL query (a question to a database) run against a test table, a Thai LINE order turned into JSON (data in labelled fields), a Thai national ID checksum function in Python run against test cases, a bug fixed in a Fibonacci function, a three-server logic puzzle with one solution, and a 30-day token bill. A script graded each answer: numbers compared, SQL executed, JSON parsed, Python run. Each task ran twice per setting, nine settings, 180 calls, through Workers AI's chat completions endpoint, four at a time, between 06:43 and 06:50 Bangkok time on 9 November 2026, with a reply allowance of 8,192 tokens and temperature left at the platform's setting. No call failed and none was cut off. Prices and neuron counts come from the replies and the pricing page of the same day [2]; the 180 calls cost US$0.11 at list prices. The tasks are short, so the numbers say how the models spend tokens on small jobs, not how they do at long contexts. Hongdam picks the model for an assistant or a batch job by running the customer's own tasks this way [10].

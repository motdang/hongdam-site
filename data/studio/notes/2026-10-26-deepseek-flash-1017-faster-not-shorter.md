{"title": "DeepSeek Flash 1017 on Workers AI: 40% faster than 0731, 23% more tokens, same bill", "title_th": "DeepSeek V4.1 Flash 1017 บน Workers AI: เร็วกว่า 0731 ราว 40% ใช้โทเคนมากขึ้น 23% ค่าใช้จ่ายเท่าเดิม", "date": "2026-10-26", "beat": "models",
 "dek": "DeepSeek says its 17 October update writes shorter answers. On 10 builder tasks run 3 times each on Workers AI, 1017 finished in 40% less time than V4 Flash 0731 but wrote 23% more tokens; the lower price kept the bill level.",
 "dek_th": "DeepSeek บอกว่ารุ่นอัปเดต 17 ตุลาคมตอบสั้นลง เราลองงาน 10 ข้อ ข้อละ 3 รอบบน Workers AI พบว่า 1017 ใช้เวลาน้อยกว่า V4 Flash 0731 ราว 40% แต่เขียนโทเคนมากกว่า 23% ราคาต่อโทเคนที่ถูกลงทำให้ค่าใช้จ่ายรวมแทบเท่าเดิม ทั้งสองรุ่นตอบถูกครบทุกข้อ",
 "cards": ["ai-batch", "ai-assistant", "ai-own"],
 "sources": [
  {"t": "DeepSeek-V4.1-Flash-1017: Wish-Driven Programming Made Real | DeepSeek API Docs", "u": "https://api-docs.deepseek.com/news/news261017"},
  {"t": "deepseek-ai/DeepSeek-V4.1-Flash-1017 · Hugging Face", "u": "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017"},
  {"t": "deepseek-ai/DeepSeek-V4.1-Flash · Hugging Face", "u": "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash"},
  {"t": "Pricing · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/pricing/"},
  {"t": "deepseek-v4.1-flash-1017 (DeepSeek) · Cloudflare AI docs · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/deepseek-v4.1-flash-1017/"},
  {"t": "deepseek-v4-flash-0731 (DeepSeek) · Cloudflare AI docs · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/deepseek-v4-flash-0731/"},
  {"t": "Buy · Hongdam", "u": "https://hongdam.net/buy/?c=ai-batch"}
 ],
 "card": {"big": "DeepSeek 1017: faster, not shorter", "sub": "60 runs on Workers AI against V4 Flash 0731"}}
---
DeepSeek V4.1 Flash 1017 answers in less time than V4 Flash 0731 on Cloudflare Workers AI, but it does not write less. On 10 short builder tasks, run 3 times each on 26 October 2026, 1017 took 40% less time with thinking on and wrote 23% more tokens. A token is the unit a model reads and writes, about three quarters of an English word, and the unit both models are billed in. The bill came out level, because Cloudflare charges less per token for 1017.

## DeepSeek compares 1017 with a version Workers AI does not list

DeepSeek released V4.1 Flash 1017 on 17 October 2026 with open weights under the MIT licence. Its release note promises "faster task completion, and shorter outputs than the previous version" [1]. The model card calls 1017 a minor update to V4.1 Flash, the 10 September release, and its benchmark table compares those two [2]. V4.1 Flash is a mixture-of-experts model, one that uses a small part of itself for each token: 552 billion parameters in all, 8 billion active while reading the prompt and 16 billion while writing [3].

Cloudflare's Workers AI, a service that runs open models on Cloudflare's servers and bills per token, lists three DeepSeek V4 models: V4 Flash 0731, V4 Pro 0813 and V4.1 Flash 1017. It does not list the 10 September V4.1 Flash [5][6]. A Workers AI user who upgrades moves from 0731 to 1017, and DeepSeek's numbers do not cover that step. We measured it.

## Both models answered all 120 runs correctly

The 10 tasks are the small jobs a builder hands a model: a VAT total in baht, days between two dates, Sundays in 2027, a cron line (the schedule format servers use), an SQL query (a question to a database), a LINE order message turned into JSON (data in labelled fields), a Thai national ID check written in Python, a bug fixed in a Fibonacci function, a three-host logic puzzle and a monthly token bill. A script graded each answer: it compared numbers, ran the SQL against a test database, parsed the JSON and ran the Python against test cases.

Each task ran 3 times on each model, once with thinking off and once with it on: 120 runs. Thinking is the hidden reasoning a model writes before its answer; Workers AI counts those tokens in the output it reports and bills. With thinking on, both models used Workers AI's default effort, high [5][6]. The runs went through the Workers AI chat completions endpoint from Chiang Rai, two at a time, between 06:40 and 06:44 Bangkok time.

| 30 runs per model | 0731, thinking off | 1017, thinking off | 0731, thinking on | 1017, thinking on |
|---|---|---|---|---|
| Correct | 30 | 30 | 30 | 30 |
| Output tokens, total | 3,362 | 4,430 | 9,515 | 11,664 |
| Longest output, tokens | 534 | 544 | 992 | 1,835 |
| Seconds, total | 47 | 27 | 116 | 70 |
| Seconds, median run | 1 | 1 | 4 | 2 |
| Cost, US dollars | 0.00553 | 0.00606 | 0.01469 | 0.01497 |

Seconds are whole seconds per run, as the request log records them. Cost uses the Workers AI list prices of 26 October 2026, below.

```chart
{"title": "Seconds for 30 runs, thinking on", "unit": " s", "lower_is_better": true,
 "rows": [["V4 Flash 0731", 116], ["V4.1 Flash 1017", 70]],
 "note": "10 tasks, 3 runs each, measured 26 October 2026 on Workers AI. Both models answered 30 of 30 correctly."}
```

## 1017 writes faster, and writes more

With thinking on, 1017 wrote 2,149 more tokens than 0731 (23% more) and finished in 46 fewer seconds (40% less). With thinking off, it wrote 32% more and took 43% less time. Its longest output was 1,835 tokens, against 992 for 0731. The time saved comes from speed per token, not from fewer tokens. The model card describes speculative decoding, in which a small draft guesses several tokens ahead and the model checks them in one step [3]; whether that is the cause, we did not test.

On these tasks, then, the release note's "shorter outputs" claim did not hold against 0731. It may hold against the 10 September version, which we could not run, and on the long agent tasks DeepSeek measured [1].

One number is unexplained. With thinking on, Workers AI billed 4,848 input tokens for the 30 prompts on 0731 and 3,258 on 1017, for the same prompts. With thinking off, both were billed 2,478. The cause is unknown.

## The lower price absorbs the extra tokens

| Per million tokens, 26 October 2026 | Input | Cached input | Output |
|---|---|---|---|
| V4 Flash 0731 | US$0.44 | US$0.014 | US$1.32 |
| V4.1 Flash 1017 | US$0.30 | US$0.006 | US$1.20 |

Both need a paid Workers AI plan [4]. 1017 costs 32% less per input token and 9% less per output token. At our volumes that left the bill level: US$0.49 per 1,000 runs with thinking on for 0731 and US$0.50 for 1017; with thinking off, US$0.18 on 0731 and US$0.20 on 1017. A job that sends long prompts, such as an assistant that answers from a shop's web pages, gains more from the input price than these short prompts did.

## Switching is one line

The model name is the only change. The `chat_template_kwargs` field turned thinking off in our runs; it is a field on the Workers AI model page [5].

```bash
curl https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/ai/v1/chat/completions \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"model": "@cf/deepseek-ai/deepseek-v4.1-flash-1017",
       "messages": [{"role": "user", "content": "Days from 26 October 2026 to 14 February 2027?"}],
       "chat_template_kwargs": {"thinking": false}}'
```

- A job that waits on the answer (a chat reply, a form check) gets about 40% faster on 1017 at the same cost.
- A job billed in bulk, such as cleaning thousands of rows, costs about the same; with thinking off it costs 10% more on short prompts.
- A cap on output tokens set for 0731 needs headroom on 1017: its longest output here was 85% longer.

Hongdam's bulk file service cleans, sorts or summarises thousands of rows with an AI model [7].

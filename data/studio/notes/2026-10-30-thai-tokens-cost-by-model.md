{"title": "Same text, Thai or English: 1.46 times the tokens on DeepSeek, 2.94 times on GLM-5.3", "title_th": "ข้อความเดียวกัน ภาษาไทยใช้โทเคนมากกว่าภาษาอังกฤษ 1.46 เท่าบน DeepSeek และ 2.94 เท่าบน GLM-5.3", "date": "2026-10-30", "beat": "models",
 "dek": "We sent the same eight shop messages in English, Thai and Chinese to six open models on Workers AI. Thai took 1.46 times the English tokens on DeepSeek and 2.94 times on GLM, enough to change which model is cheapest.",
 "dek_th": "เราส่งข้อความร้านค้าแปดชิ้นชุดเดียวกัน ทั้งภาษาอังกฤษ ไทย และจีน ไปยังโมเดลโอเพนเวตหกตัวบน Workers AI ภาษาไทยใช้โทเคนมากกว่าภาษาอังกฤษ 1.46 เท่าบน DeepSeek และ 2.94 เท่าบน GLM มากพอจะสลับว่าโมเดลไหนถูกที่สุด",
 "cards": ["ai-assistant", "ai-line", "ai-batch"],
 "sources": [
  {"t": "Pricing · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/pricing/"},
  {"t": "Byte-Pair Encoding tokenization - Hugging Face LLM Course", "u": "https://huggingface.co/learn/llm-course/chapter6/5"},
  {"t": "[2305.15425] Language Model Tokenizers Introduce Unfairness Between Languages", "u": "https://arxiv.org/abs/2305.15425"},
  {"t": "OpenAI compatible API endpoints · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/"},
  {"t": "Buy · Hongdam", "u": "https://hongdam.net/buy/?c=ai-assistant"}
 ],
 "card": {"big": "Thai costs up to 2.9× the tokens", "sub": "Same eight messages, six open models, Workers AI"}}
---
A price list for language models quotes dollars per million tokens. A token is the piece of text a model reads or writes: a whole word, part of a word, or a single letter. The same Thai sentence breaks into a different number of tokens on each model, so the price list does not tell a Thai shop what a model costs. On 30 October 2026 we sent eight short shop messages, each in English, Thai and Chinese, to six open models on Cloudflare Workers AI and read the token count each model billed. Thai came out at 1.46 times the English count on the three DeepSeek models, 2.64 times on Kimi K2.7 Code, and 2.94 times on the two GLM-5.3 models.

## The tokenizer, not the model, sets the multiple

A tokenizer is the part of a model that cuts text into tokens before the model sees it. Many are built by byte-pair encoding: start from single characters, then keep merging the pair that appears most often in the training text until the vocabulary is full [2]. A language that was common in that text gets long merged pieces; a language that was rare stays in short pieces. Petrov and colleagues measured this across many languages in 2023 and found the same text taking up to 15 times as many tokens from one language to another [3].

Our numbers fit that picture. The three DeepSeek models (V4 Flash 0731, V4.1 Flash 1017, V4 Pro 0813) billed the same count for every one of the 24 texts, and so did the two GLM-5.3 models. Within a family the multiple does not change with model size.

| Model | English | Thai | Chinese | Thai ÷ English | Chinese ÷ English |
| --- | --- | --- | --- | --- | --- |
| DeepSeek V4 Flash 0731 | 428 | 623 | 374 | 1.46 | 0.87 |
| DeepSeek V4.1 Flash 1017 | 428 | 623 | 374 | 1.46 | 0.87 |
| DeepSeek V4 Pro 0813 | 428 | 623 | 374 | 1.46 | 0.87 |
| Kimi K2.7 Code | 428 | 1,132 | 345 | 2.64 | 0.81 |
| GLM-5.3 | 433 | 1,272 | 382 | 2.94 | 0.88 |
| GLM-5.3 Flash | 433 | 1,272 | 382 | 2.94 | 0.88 |

Tokens for all eight texts together, prompt instruction subtracted. Measured 30 October 2026.

Per text, Thai ran from 1.27 to 1.59 times English on DeepSeek, 2.40 to 3.00 on Kimi and 2.55 to 3.47 on GLM. Chinese took fewer tokens than English on every model. Thai is shorter than English on the page (1,410 characters against 1,815 for the same eight texts), so the extra tokens come from how the tokenizer cuts Thai, not from length.

## The Thai price reorders the price list

Multiply each model's input price [1] by its Thai multiple and you get what a million tokens' worth of English content costs once it is written in Thai.

```chart
{"title": "Input price for Thai text, US$ per million English-equivalent tokens", "unit": "", "lower_is_better": true,
 "rows": [["DeepSeek V4.1 Flash 1017", 0.44], ["GLM-5.3 Flash", 0.44], ["DeepSeek V4 Flash 0731", 0.64], ["DeepSeek V4 Pro 0813", 1.92], ["Kimi K2.7 Code", 2.51], ["GLM-5.3", 4.11]],
 "note": "Workers AI list price per million input tokens, read 30 October 2026, times the Thai ÷ English ratio we measured the same day."}
```

Three changes from the English price list:

- GLM-5.3 Flash lists at US$0.15 per million input tokens, half of DeepSeek V4.1 Flash 1017 at US$0.30 [1]. For Thai the two come out level at US$0.44.
- Kimi K2.7 Code lists below DeepSeek V4 Pro (US$0.95 against US$1.32 [1]). For Thai, Kimi costs more: US$2.51 against US$1.92.
- GLM-5.3 lists at US$1.40, close to DeepSeek V4 Pro [1]. For Thai it costs more than twice as much.

The reply is cut by the same tokenizer, so a Thai answer should carry a similar multiple on the output price, which is 3 to 4.2 times the input price on these six models [1]. We did not measure Thai replies today. Context windows shrink the same way: a GLM model holds about a third as much Thai as English.

## Count your own text before you pick a model

Workers AI takes requests in the OpenAI format [4], and every reply we read today carried `usage.prompt_tokens`, the input count. Send one of your own messages with a one-word instruction, then send the instruction alone, and subtract:

```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/ai/v1/chat/completions" \
  -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"model": "@cf/zai-org/glm-5.3-flash", "max_tokens": 1024,
       "messages": [{"role": "user", "content": "Reply with the single word OK.\n\nสวัสดีค่ะ อยากสั่งเมล็ดกาแฟคั่ว 2 ถุง"}]}' \
  | jq .usage.prompt_tokens
```

Leave `max_tokens` at 1,024 or more. Kimi and GLM-5.3 think before they answer, and with a 64-token allowance many of our first calls to them came back empty because the thinking used it all. An empty reply returned no count; we ran those again at 1,024.

Use a sample of the text your app handles: chat from your LINE account, product pages, support emails. The multiple moves with the kind of text: from 2.55 to 3.47 on GLM across our eight. Hongdam sets up chat assistants that answer customers from your own web pages [5].

## How we measured

Eight passages a Chiang Rai business writes: a coffee order, a returns policy, a password-reset reply, a scarf description, a room offer, meeting notes, a menu item and a job post, 352 English words in all. We wrote each in Thai and Chinese ourselves. Each went to the six models with the instruction "Reply with the single word OK." in front, and we subtracted the count for the instruction alone (11 tokens on DeepSeek, 15 on Kimi, 19 on GLM). That is 150 calls, on 30 October 2026, through Workers AI's chat endpoint. A repeated GLM-5.3 call returned the same count. We measured cost, not quality; which model answers Thai customers best is a separate test.

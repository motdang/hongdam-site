{"title": "Workers AI retired 16 models on 20 November: 14 answer 410, two still reply", "title_th": "Workers AI เลิกให้บริการ 16 โมเดลเมื่อ 20 พฤศจิกายน: 14 โมเดลตอบ HTTP 410 ภายใน 0.15 วินาที อีกสองโมเดลยังตอบตามปกติ", "date": "2026-11-23", "beat": "models",
 "dek": "We called each retired model on 23 November. Fourteen fail on every call with error code 5028, streamed or not. Llama 3.2 3B and Gemma 2B LoRA answered 14 of 14. A check that needs no token, and a spare model in the call.",
 "dek_th": "เราเรียกโมเดลที่ถูกเลิกให้บริการทุกตัวเมื่อ 23 พฤศจิกายน 14 โมเดลตอบ error code 5028 ทุกครั้ง ทั้งแบบ stream และไม่ stream ส่วน Llama 3.2 3B กับ Gemma 2B LoRA ยังตอบครบ 14 จาก 14 ครั้ง พร้อมสคริปต์ตรวจชื่อโมเดลในโค้ดโดยไม่ต้องใช้ token และโค้ดสลับไปโมเดลสำรอง",
 "cards": ["ai-assistant", "ai-line", "web-care"],
 "sources": [
  {"t": "Planned model deprecations on Workers AI · Cloudflare changelog, 5 November 2026", "u": "https://developers.cloudflare.com/changelog/post/2026-11-05-planned-model-deprecations/"},
  {"t": "Errors · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/errors/"},
  {"t": "llama-3.2-3b-instruct · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/llama-3.2-3b-instruct/"},
  {"t": "gemma-2b-it-lora · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/gemma-2b-it-lora/"},
  {"t": "Pricing · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/pricing/"},
  {"t": "openai-python README, Retries · GitHub", "u": "https://github.com/openai/openai-python/blob/main/README.md"},
  {"t": "Fallbacks · Cloudflare AI Gateway docs", "u": "https://developers.cloudflare.com/ai-gateway/configuration/fallbacks/"},
  {"t": "GLM-5.3 Flash's replacements: Gemma 4 26B costs less per task, Qwen3.8 27B 3.6 times more · Hongdam Studio", "u": "https://hongdam.net/studio/notes/glm-5-3-flash-replacements-gemma-4-qwen-3-8-measured/"},
  {"t": "Buy · Hongdam", "u": "https://hongdam.net/buy/?c=ai-assistant"}
 ],
 "card": {"big": "14 answer 410, two still reply", "sub": "Workers AI's 16 retired models, called 23 November 2026"}}
---
Cloudflare's Workers AI retired 16 language models on 20 November 2026 [1]. On 23 November we called each of them four times through the OpenAI-compatible endpoint. Fourteen answered HTTP 410 with error code 5028 on 56 of 56 calls, in a median of 0.15 seconds. Two answered every call with a normal reply: `@cf/meta/llama-3.2-3b-instruct` and `@cf/google/gemma-2b-it-lora`, 14 of 14 each, though both pages read "Deprecated 11/20/2026" [3][4].

An app that names one of the fourteen has failed on every model call since 20 November. The notice gives the date and no hour [1].

## The refusal names the model and the date

HTTP 410 is the web's status for a thing removed on purpose. The body for a retired model:

```json
{"errors":[{"message":"AiError: Model has been deprecated: @cf/zai-org/glm-5.3-flash was deprecated on 2026-11-20. See the model catalog for alternatives: https://developers.cloudflare.com/workers-ai/models/ (…request id…)","code":5028}],"success":false,"result":{},"messages":[]}
```

| Model id sent | HTTP status | Error code | Calls | Seconds |
| --- | --- | --- | --- | --- |
| One of 14 retired ids | 410 | 5028 | 56 of 56 | 0.15 median, 0.12 to 0.44 |
| Llama 3.2 3B, Gemma 2B LoRA (retired) | 200 | none | 28 of 28 | 0.23 to 1.33 |
| An invented id, a misspelt id | 400 | 5007 | 3 of 3 | 0.18 to 1.16 |

Both codes match Cloudflare's error table: 5028 "Model deprecated" with 410, 5007 "No such model" with 400 [2]. A retired id and a typing mistake get different answers, so a log line can tell them apart.

With `"stream": true` (the reply sent word by word), the 410 came as the HTTP status with the same JSON body, before any stream opened: 14 of 14. Code that checks the status before reading the stream catches it.

The OpenAI client libraries retry connection errors and statuses 408, 409, 429 and 500 and above, twice by default [6]. 410 is outside that list, so the first call raises the error. An app that catches every error and prints "try again later" now prints it on every request, and the cause sits in the log.

## Two retired models still answer

| Model | Calls answered | Time span, Bangkok | Docs page |
| --- | --- | --- | --- |
| `@cf/meta/llama-3.2-3b-instruct` | 14 of 14 | 10:13 to 10:18 | Deprecated 11/20/2026 [3] |
| `@cf/google/gemma-2b-it-lora` | 14 of 14 | 10:13 to 10:18 | Deprecated 11/20/2026 [4] |

The replies carried text and a usage block with token counts. Both models accept LoRA adapters (small add-on weights from fine-tuning). So do `gemma-7b-it-lora`, `llama-2-7b-chat-hf-lora` and `qwq-32b`, which returned 410, so the adapter flag does not explain it. The notice lists both among the 16 and names no exception [1]. The cause is unknown, and so is the day they stop. We called from one account in Thailand.

All 16 model pages show "Deprecated" and the date, and the pricing page still lists retired models with their prices [5]. A price on that page is not a sign that a model answers.

## Find retired ids without a token

The docs serve each model page as plain text at `…/models/<name>/index.md`. This script lists every Workers AI id in a project and reads its page:

```bash
grep -rhoE '@(cf|hf)/[A-Za-z0-9._/-]+' . --include='*.js' --include='*.ts' --include='*.py' \
  --include='*.toml' --include='*.json' --include='*.jsonc' --exclude-dir=node_modules | sort -u |
while read -r id; do
  page="https://developers.cloudflare.com/workers-ai/models/${id##*/}/index.md"
  when=$(curl -s "$page" | grep -m1 -oE 'Deprecated[^0-9]{0,12}[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}')
  echo "${when:-in service or no page}  $id"
done
```

Run on a test file with four ids on 23 November 2026:

```text
in service or no page  @cf/google/gemma-4-26b-a4b-it
Deprecated | 11/20/2026  @cf/meta/llama-3.2-3b-instruct
Deprecated | 11/20/2026  @cf/moonshotai/kimi-k2.6
Deprecated | 11/20/2026  @cf/zai-org/glm-5.3-flash
```

Ids stored in a dashboard variable or a database are outside its reach. Pages showed the date before 20 November too: our 20 November note read the Llama 3.2 pages as listed for retirement that day. Run weekly, the script reports the next round while its date is still ahead.

## A spare model in the call

```python
import json, os, urllib.request, urllib.error

URL = f"https://api.cloudflare.com/client/v4/accounts/{os.environ['CF_ACCOUNT_ID']}/ai/v1/chat/completions"
TOKEN = os.environ["CF_API_TOKEN"]
MODELS = ["@cf/zai-org/glm-5.3-flash", "@cf/google/gemma-4-26b-a4b-it"]   # first choice, then the spare

def ask(prompt):
    for model in MODELS:
        body = {"model": model, "max_tokens": 200, "messages": [{"role": "user", "content": prompt}]}
        req = urllib.request.Request(URL, json.dumps(body).encode(),
                                     {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
        try:
            reply = json.load(urllib.request.urlopen(req, timeout=120))
            return model, reply["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            errors = json.loads(e.read() or b"{}").get("errors") or [{}]
            if e.code == 410 and errors[0].get("code") == 5028:
                print("RETIRED:", errors[0].get("message"))    # send this line to your alerts
                continue
            raise
    raise RuntimeError("every model in MODELS is retired")
```

Tested 23 November 2026 with the retired GLM-5.3 Flash first: it printed the RETIRED line and returned Gemma 4 26B's answer. The spare costs one extra call of about 0.15 seconds per request until someone edits the list. The spare is a different model, and its answers differ; our 9 November note measured the two small replacements on ten tasks [8].

Cloudflare's AI Gateway has the same idea without code: its Universal endpoint takes a list of steps and by default moves to the next when a model request returns an error [7]. The page names no status codes, and we did not test it with a 410.

## One named replacement took 11 to 54 seconds for one word

The notice names four models to move to [1]. Each got the prompt "Reply with the one word: ok".

| Replacement | Calls | Seconds per call |
| --- | --- | --- |
| DeepSeek V4.1 Flash 1017 | 2 | 1.3, 1.0 (streamed) |
| GLM-5.3 | 1 | 1.0 |
| Gemma 4 26B | 1 | 1.5 |
| Qwen3.8 27B | 4 | 54.5, 28.4, 14.4, 11.5 |

Qwen3.8 27B wrote a line of reasoning (the working a model writes before its answer) and then "ok", 33 output tokens in the first call. Why that took 54 seconds is unknown; the four calls ran within four minutes and each was faster than the one before. A chat that moved to it on 20 November may feel slower for a reason outside the app's code. Time your own prompt before choosing.

## How we measured

97 calls between 10:13 and 10:18 Bangkok time on 23 November 2026, through Workers AI's chat completions endpoint, one account, from Thailand. Each of the 16 retired ids: three plain calls and one streamed. The two that answered: ten more plain calls each. Five calls to the four replacements, three to two invented ids, three more to Qwen3.8 27B, and two for the spare-model test. The prompt asked for one word, with 40 output tokens allowed. Seconds are whole-call times from our machine. The 97 calls cost under US$0.01 at list prices [5]. Not tested: the Workers binding (`env.AI.run()`), the `/ai/run/` path, AI Gateway, and the eight retired image, speech and embedding models in the same notice [1]. Hongdam moves an assistant to a new model by running the customer's own prompts on the candidates first [9].

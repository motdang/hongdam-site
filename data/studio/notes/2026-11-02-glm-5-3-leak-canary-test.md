{"title": "GLM-5.3 on Workers AI sent 155 replies with other customers' text, all with HTTP 200", "title_th": "GLM-5.3 บน Workers AI ส่งคำตอบ 155 ครั้งที่มีข้อความของลูกค้ารายอื่น ทุกครั้งตอบกลับด้วย HTTP 200", "date": "2026-11-02", "beat": "models",
 "dek": "Cloudflare's 26 October report: prompts over 681,280 tokens got answers built partly from other users' requests, with a normal status and token count. A canary test catches what a status code cannot; ours costs cents.",
 "dek_th": "รายงานของ Cloudflare วันที่ 26 ตุลาคม: พรอมต์ที่ยาวเกิน 681,280 โทเคนได้คำตอบที่ปนข้อมูลจากคำขอของผู้ใช้คนอื่น โดยสถานะและจำนวนโทเคนดูปกติทุกอย่าง การทดสอบแบบ canary จับสิ่งที่รหัสสถานะจับไม่ได้ และของเราใช้เงินไม่กี่เซนต์",
 "cards": ["ai-assistant", "ai-batch", "redteam"],
 "sources": [
  {"t": "Cross-request KV cache exposure in the GLM-5.3 Workers AI model, and our remediation with SGLang", "u": "https://blog.cloudflare.com/kv-cache-exposure-remediation/"},
  {"t": "SGLang security update: improving request isolation | LMSYS Org", "u": "https://www.lmsys.org/blog/2026-10-26-cf-security"},
  {"t": "[Bug] PD disaggregation: aborted prefill requests (input too long) cause decode to generate garbage from incomplete KV cache · sgl-project/sglang #30233", "u": "https://github.com/sgl-project/sglang/issues/30233"},
  {"t": "Release v0.5.22 · sgl-project/sglang", "u": "https://github.com/sgl-project/sglang/releases/tag/v0.5.22"},
  {"t": "glm-5.3 · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/glm-5.3/"},
  {"t": "Pricing · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/pricing/"},
  {"t": "Buy · Hongdam", "u": "https://hongdam.net/buy/?c=redteam"}
 ],
 "card": {"big": "155 replies held other users' text", "sub": "GLM-5.3 on Workers AI, 27 Aug to 9 Sep 2026"}}
---
From 27 August to 9 September 2026, Cloudflare's hosted copy of the GLM-5.3 model answered 155 requests with text that belonged to other customers' requests [1]. Every one of those prompts was longer than 681,280 tokens. The replies came back with HTTP 200, a token count that matched the long prompt, and coherent text [1]. Nothing in the response said anything was wrong. Cloudflare and the maintainers of SGLang, the open-source engine that runs the model, published the details together on 26 October [1][2].

## Two settings that disagreed, and an engine that did not object

A language model keeps a working memory of the prompt it is reading, called the KV cache. On a shared server that memory is a pool of fixed-size pages, handed to one request and then reused by the next. Pages are not wiped between requests; the next request writes over them [1].

Cloudflare runs GLM-5.3 in disaggregated mode: one set of GPUs reads the prompt and fills the cache (prefill), then sends the pages to a second set that writes the answer (decode) [1]. The model page advertised a 1,048,576-token context window [5], but the prefill pool had room for 681,280 tokens. Cloudflare knew about the gap before launch and expected the engine to refuse anything that did not fit [1].

The engine did refuse it, on paper. It marked the long request as rejected and swapped the prompt for a one-token placeholder. The admission queues checked whether a request had finished, not whether it had been rejected, so the request went ahead. Prefill wrote one page and reported the transfer complete. Decode had reserved pages for the full prompt and read all of them: one fresh page, the rest still holding earlier users' prompts and answers [1].

On a single server the same rejection returned an error; the leak needed the split between prefill and decode [2].

## The bug was public before the model launched

| Date (2026) | Event |
| --- | --- |
| 6 July | Issue #30233 opened on SGLang: over-long prompts in disaggregated mode produce garbage from an incomplete cache [3] |
| 27 August | GLM-5.3 launches on Workers AI with the smaller prefill pool [1] |
| 5 September | Issue #30233 closed by a bot for inactivity [3] |
| 8 September, 23:11 UTC | Researcher Gadi Evron of Knostic reports the leak through HackerOne [1] |
| 9 September, 14:00 UTC | Model set to private; requests return HTTP 400 [1] |
| 9 September, 19:40 UTC | Model restored with a larger pool and a patched engine [1] |
| 19 October | SGLang v0.5.22 released [4] |
| 26 October | Coordinated publication [1][2] |

Cloudflare's fix was to make the pool hold about 2.04 million tokens, twice the context window, so a valid prompt cannot reach the rejection path, and to patch the engine so a rejected request stops before any transfer [1]. Cloudflare reports no other Workers AI model affected and no sign of deliberate exploitation [1].

## The same family of bug is wider than one model

The SGLang post describes a second, related flaw: a request cancelled while its cache pages are still in flight between machines can leave writes landing in pages already given to someone else [2]. It affected default disaggregated setups from the v0.4 line, early 2025, until v0.5.21 (v0.5.22 for the MORI transfer backend), and the fixes were not backported to older release branches [2]. The corruption is silent, so an operator cannot tell afterwards whether it happened [2].

If you run SGLang yourself with prefill and decode on separate machines:

1. Read the KV pool size from each node's startup log and compare it with the context length you advertise, after every change to weights, quantization or parallelism. If the pool is smaller, lower the context length [1].
2. Upgrade to v0.5.22 or later [1][4].
3. Turn on `--disaggregation-enable-kv-checksum` on both prefill and decode where your model supports it. It is off by default because it adds work to every transfer [2]. Cloudflare says it does not yet cover GLM-5.3, GLM-5.3 Flash or DeepSeek V4 [1].

A single-server deployment without cross-machine transfer is outside this particular race [2].

## A status code cannot catch this; a canary can

Cloudflare's own pre-launch tests passed because they checked status codes and speed at long contexts, not whether the answer matched the prompt [1]. A canary test checks the answer: hide strings in a long prompt that only you know, ask for them back, and compare. In the GLM-5.3 bug only the first cache page held the request's own prompt, so strings placed further in would have gone missing from the reply.

We ran one on 2 November 2026 through Workers AI. Three random codes sat at 10%, 50% and 90% of a filler text, with a made-up final word, and the model was asked to return all four. Three prompt sizes, three models, 26 calls.

| Model | Prompt tokens billed | Runs | Codes returned | Final word returned |
| --- | --- | --- | --- | --- |
| GLM-5.3 | 1,632 to 1,645 | 3 | 9 of 9 | 3 of 3 |
| GLM-5.3 | 15,526 to 15,607 | 3 | 9 of 9 | 3 of 3 |
| GLM-5.3 | 77,463 to 77,561 | 2 | 6 of 6 | 2 of 2 |
| GLM-5.3 Flash | 1,632 to 77,508 | 8 | 24 of 24 | 7 of 8 |
| DeepSeek V4 Flash 0731 | 1,580 to 75,081 | 9 | 27 of 27 | 8 of 9 |

All 78 codes came back. The two misses were at about 77,000 tokens: each model returned only the tail "zz" of the final word, a reading slip, not someone else's text. The 26 calls cost US$0.46. They stop at 77,000 tokens, far below the 681,280 where GLM-5.3 broke, so they show the method, not that long prompts are safe today; one canary at 700,000 tokens on GLM-5.3 would cost about US$0.98 at its list price of US$1.40 per million input tokens, read 2 November 2026 [6].

```python
import json, os, random, urllib.request

ACCOUNT, TOKEN = os.environ["CF_ACCOUNT_ID"], os.environ["CF_API_TOKEN"]
URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/ai/v1/chat/completions"

def canary(model, n_words):
    words = [random.choice("river lamp stone rice bridge paper".split()) for _ in range(n_words)]
    codes = [f"{random.randint(0, 99999):05d}-{random.choice('ABCDEFGH')}" for _ in range(3)]
    for pos, code in zip((0.1, 0.5, 0.9), codes):
        words.insert(int(len(words) * pos), f". The code is {code}. ")
    prompt = "Reply with one line: the three codes in order.\n\n" + " ".join(words)
    body = json.dumps({"model": model, "max_tokens": 4096,
                       "messages": [{"role": "user", "content": prompt}]}).encode()
    req = urllib.request.Request(URL, body, {"Authorization": f"Bearer {TOKEN}",
                                             "Content-Type": "application/json"})
    reply = json.load(urllib.request.urlopen(req, timeout=600))
    text = reply["choices"][0]["message"]["content"] or ""
    return all(c in text for c in codes), reply["usage"]["prompt_tokens"]

print(canary("@cf/zai-org/glm-5.3", 15000))
```

Run it at the prompt sizes your app sends, on each model you use, after the host announces a new model or a new context window. A wrong answer with a 200 status is the signal to stop sending long prompts to that model and write to the host. Hongdam tests chatbots for weak points like this and writes the fixes [7].

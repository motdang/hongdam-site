{"title": "Order tickets from four open models: symbol codes silently wrong 186 times in 660, JSON 46", "title_th": "ใบสั่งเครื่องดื่มจากโมเดลโอเพนเวตสี่ตัว: แบบรหัสสัญลักษณ์ผิดแบบเงียบ 186 จาก 660 ใบ แบบ JSON 46 ใบ", "date": "2026-11-20", "beat": "models",
 "dek": "An ITMO paper says a ticket's format changes how often a small model writes a valid, wrong order. Prompting four models on Workers AI, symbol codes did worst on all four and JSON best; a word check caught 28 of JSON's 46.",
 "dek_th": "งานวิจัยจาก ITMO พบว่ารูปแบบของใบสั่งมีผลต่อจำนวนใบที่โปรแกรมอ่านผ่านแต่ไม่ตรงกับที่ลูกค้าสั่ง เราทดสอบด้วยพรอมต์กับโมเดลสี่ตัวบน Workers AI แบบรหัสสัญลักษณ์ผิดมากที่สุดในทุกโมเดล ส่วน JSON ผิดน้อยที่สุด และโค้ดเทียบคำสั้น ๆ จับใบ JSON ที่ผิดได้ 28 จาก 46 ใบ",
 "cards": ["ai-automation", "ai-assistant", "ai-line"],
 "sources": [
  {"t": "[2611.17169] Parsed, Plausible, Wrong: Output Format Controls Silent Errors in Small-Model Semantic Parsing", "u": "https://arxiv.org/abs/2611.17169"},
  {"t": "[2611.18284] Clean Tickets, Wrong Orders: Catching Silent Errors with a Language Model in Your Browser Tab", "u": "https://arxiv.org/abs/2611.18284"},
  {"t": "Clean Tickets, Wrong Orders", "u": "https://wrong.cuyor.com"},
  {"t": "GitHub - UmarGit/coffee-llm: Parsed, Plausible, Wrong.", "u": "https://github.com/UmarGit/coffee-llm"},
  {"t": "llama-4-scout-17b-16e-instruct (Meta) · Cloudflare AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/llama-4-scout-17b-16e-instruct/"},
  {"t": "Pricing · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/pricing/"},
  {"t": "Limits · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/limits/"},
  {"t": "llama-3.2-3b-instruct (Meta) · Cloudflare AI docs", "u": "https://developers.cloudflare.com/workers-ai/models/llama-3.2-3b-instruct/"},
  {"t": "Automation · Hongdam, Chiang Rai", "u": "https://hongdam.net/buy/?c=ai-automation"}
 ],
 "card": {"big": "Valid ticket, wrong order", "sub": "Symbol codes 186 of 660, JSON 46"}}
---
Asked to turn "five small lattes please, all hot" into a ticket for the bar, DeepSeek V4.1 Flash wrote `1 small hot latte` on one of two tries. The ticket has the right form, a program reading it finds no fault, and four lattes are missing. A paper from ITMO University, posted on 12 November 2026, calls this a silent error and reports that the format of the ticket changes how often it happens [1]. On 20 November 2026 we ran a small version on four open models (models whose weights are published) on Cloudflare Workers AI. With the ticket in symbol codes, 186 of 660 tickets were valid and wrong. In JSON, 46 of 660.

## In the paper, plain words beat JSON on models under a billion parameters

The authors fine-tuned (trained further, on examples of the task) two small models, Qwen3.5-0.8B and LFM2.5-350M, to write pizza orders in six formats that carry the same information. They scored 1,357 orders written by people [1]. On Qwen, 4.5% of the tickets in plain words were silent errors, 8.3% in a symbol format of the same length, and 14.9% in JSON, the text format of braces and quoted names that most software reads. A words ticket took 10.9 output tokens against 44.1 for JSON [1]. A token is the piece of text a model reads or writes: a word or part of one.

The paper's own limits: both models are under a billion parameters, and the effect may shrink with larger ones [1]. A shop building an order bot today is more likely to send a prompt (written instructions and a few examples) to a larger hosted model. We measured that case.

A companion demo runs the fine-tuned 0.8B model inside a browser tab: type an order and read the ticket it writes [2][3]. The code is on GitHub; the repository names no licence [4].

## With a prompt, symbols did worst on all four models and JSON best

One order, "two large iced lattes with oat milk, no sugar", in our four formats:

| Format | Ticket |
| --- | --- |
| Words | `2 large iced latte with oat milk no sugar` |
| Symbols | `2 latte L I oat_milk !sugar` |
| JSON | `{"orders":[{"n":2,"drink":"latte","size":"large","temp":"iced","attrs":[{"thing":"oat milk"},{"thing":"sugar","not":true}]}]}` |
| JSON, words inside | the same, with `"attrs":["with oat milk","no sugar"]` |

In the symbol format `!` means none, `+` extra and `-` less, as in the paper's [1]. Each reply lands in one of the paper's four outcomes [1]: right; silent (a program reads it as a ticket, and the order is wrong); broken (a program cannot read it); refused. Silent tickets, with broken ones in brackets:

| Model | Words | Symbols | JSON | JSON, words inside |
| --- | --- | --- | --- | --- |
| Granite 4.0 H Micro, of 180 | 38 (24) | 97 (7) | 36 (7) | 34 (3) |
| Llama 4 Scout, of 180 | 3 (6) | 44 (1) | 0 (0) | 0 (0) |
| Mistral Small 3.1, of 180 | 21 (0) | 29 (1) | 9 (0) | 12 (0) |
| DeepSeek V4.1 Flash, of 120 | 15 (0) | 16 (0) | 1 (0) | 5 (0) |
| All four, of 660 | 77 (30) | 186 (9) | 46 (7) | 51 (3) |

Mistral also refused one order three times in each JSON format. Llama 4 Scout, a 17-billion-parameter model [5], wrote 360 of 360 JSON tickets right.

```chart
{"title": "Valid tickets with the wrong order, per 100", "unit": "", "lower_is_better": true,
 "rows": [["JSON", 7.0], ["JSON, words inside", 7.7], ["Words", 11.7], ["Symbols", 28.2]],
 "note": "660 tickets per format from four models on Workers AI, measured 20 November 2026."}
```

The paper's first result repeated: words had fewer silent errors than symbols on all four models, by one ticket on DeepSeek. Its second did not: one of the two JSON formats had the fewest silent errors on all four.

We did not turn on JSON mode, the setting that forces a reply to be valid JSON. The paper's point about it: forcing the form removes broken tickets and leaves the silent ones [1].

## Symbols got misread, lines lost counts, words broke in view

**Symbols.** Of the 170 silent symbol tickets from the three smaller models, 81 mixed up "has", "extra" and "less", and 74 had a wrong size or temperature. "a medium cappuccino with cinnamon on top" came back from Granite and from Llama 4 Scout as `1 cappuccino M +cinnamon`, three times of three each: extra cinnamon.

**Lines.** 31 of the 77 silent words tickets had the wrong number of drinks, against 5 of JSON's 46. In JSON the count has a name, `"n"`. On a line it is a bare number at the start.

**Words.** Granite wrote `3 iced thai tea with extra ice`, the customer's phrase in place of the format's `extra ice`. 24 of its 180 words tickets did not parse (a program could not read them). A broken ticket is in view: the program asks again.

**"No".** The paper traces much of its gain to negation [1]. Here, writing "none" as a flag (`"not":true`) or as a word (`"no sugar"`) made no difference: the three smaller models made 4 negation errors in 540 tickets with the flag and 6 in 540 with the word, and DeepSeek made none.

## A word check caught 28 of the 46 silent JSON tickets

A size or temperature on the ticket that the customer did not type, one the customer typed that the ticket lacks, or a drink or topping whose name is not in the message:

```python
import re
SIZES_TEMPS = ["small", "medium", "large", "hot", "iced"]

def disagrees(message, orders):
    msg = message.lower()
    said = {w for w in SIZES_TEMPS if re.search(rf"\b{w}\b", msg)}
    on_ticket = set()
    for o in orders:
        on_ticket |= {o[k] for k in ("size", "temp") if o.get(k)}
        names = [o["drink"]] + [a["thing"] for a in o.get("attrs", [])]
        if any(n.split()[0] not in msg for n in names):
            return True
    return on_ticket != said
```

Run on the 650 JSON tickets that parsed, it flagged 28 of the 46 silent ones and 19 of the 604 right ones. The right ones it flags are corrections: "a large latte, wait, make that a medium" names two sizes. The check does not read counts: of the 5 JSON tickets with a wrong number of drinks it flagged 3, each for another fault.

## For a shop that takes orders by chat

1. Ask the model for JSON with named fields and plain-word values. Where the kitchen screen wants codes, map to them in code afterwards.
2. Count the four outcomes on 50 of your own past messages before choosing a model. Here Granite cost US$0.009 per 1,000 tickets and got 36 of 180 silently wrong in JSON; Llama 4 Scout cost US$0.13 per 1,000 and got 0 of 180 wrong (prices read 20 November 2026 [6]).
3. Run a word check like the one above and send a ticket that disagrees back to the customer as a question.
4. Read the ticket back before the bar starts: "2 large iced lattes, oat milk, no sugar. Right?" A wrong count passes the format check and the word check; the customer sees it.

Hongdam builds automations in n8n, Make, Zapier or code [9].

## Run it yourself

The JSON prompt, as the system message, with the customer's text as the user message:

```text
You turn a customer's drink order into a ticket for the bar.

Menu
Drinks: latte, americano, cappuccino, mocha, thai tea, green tea, cocoa
Sizes: small, medium, large
Temperature: hot, iced
Things a drink can have, have none of, have extra of, or have less of:
sugar, ice, milk, oat milk, whipped cream, honey, cinnamon, shot

Write only what the customer asked for: no size or temperature the customer
did not say. Apply any correction the customer makes. Drinks that differ go
on separate lines of the ticket. If the message is not a drink order, reply
with {"reject":true}
Reply with the ticket only, no other text.

Ticket format
One JSON object on one line: {"orders":[...]}. Each order: "n" (count),
"drink", optional "size", optional "temp" ("hot" or "iced"), optional "attrs".
Each attr: {"thing":"<thing>"} (has it), {"thing":"<thing>","not":true}
(none of it), {"thing":"<thing>","qty":"extra"} or {"thing":"<thing>","qty":"less"}.

Examples

Customer: three americanos, one without milk
Ticket:
{"orders":[{"n":2,"drink":"americano"},{"n":1,"drink":"americano","attrs":[{"thing":"milk","not":true}]}]}
```

Our prompt had four examples; the other formats got the same four, rewritten.

## How we measured

We wrote 60 orders: 20 plain, 25 with a negation or a decoy ("no rush, but could i get…"), 15 with a correction or a split ("four americanos, two with milk and two without"). The paper's benchmark, PIZZA, is under a non-commercial licence [1], so its orders are not in our test. Each right ticket is our reading of the order.

Models: `@cf/ibm-granite/granite-4.0-h-micro`, `@cf/meta/llama-4-scout-17b-16e-instruct`, `@cf/mistralai/mistral-small-3.1-24b-instruct` and `@cf/deepseek-ai/deepseek-v4.1-flash-1017`, through Workers AI's chat endpoint on 20 November 2026, temperature (the randomness setting) left at the platform's value, 200 output tokens allowed. Each order ran three times per format on the first three models and twice on DeepSeek, 2,640 tickets in all. A call was about 420 input tokens and 20 output tokens. DeepSeek's limit is 20 requests a minute on standard billing [7]; 26 of its first 240 calls came back HTTP 429 (too many requests) and were sent again.

Some replies ran on into an invented next customer. We cut each reply at the first line starting "Customer:", as a stop sequence (a string that ends the reply) would, and removed code fences. Each parser accepts what its prompt describes. Two tickets match when they list the same drinks in any order; `2 latte` equals two lines of `1 latte`.

Not measured: output tokens per format. In characters, the right tickets average 31 in words, 23 in symbols, 101 in JSON and 85 in JSON with words inside.

Left out of the tables: three older Llama models. Llama 3.2 1B and 3B are listed for retirement on 20 November 2026 [8], and we found no model page for Llama 3.1 8B fast. On the 3B and the 8B, symbols were again the worst format. On the 3B, words had fewer silent tickets than JSON, 59 against 86 of 180, the paper's direction. The 1B wrote broken tickets at least 152 times of 180 in each format.

{"title": "Running totals over 32 changes: 0 of 10 in one go, 10 of 10 writing each step", "title_th": "ยอดสะสมหลังเปลี่ยน 32 ครั้ง: ตอบรวดเดียวถูก 0 จาก 10 เขียนทีละขั้นถูก 10 จาก 10", "date": "2026-11-06", "beat": "models",
 "dek": "Ai2's StateBench paper says language models lose values that change over a long text. In our small version on two open models, set and overwritten values came back right; running totals and swaps only with every step written.",
 "dek_th": "งานวิจัย StateBench ของ Ai2 ชี้ว่าโมเดลภาษาตามค่าที่เปลี่ยนไปเรื่อย ๆ ในข้อความยาวไม่ทัน เราทดสอบชุดเล็กกับโมเดลโอเพนเวตสองตัว ค่าที่ตั้งครั้งเดียวหรือถูกเขียนทับตอบถูก ส่วนยอดสะสมและการสลับค่าตอบถูกก็ต่อเมื่อโมเดลเขียนค่าออกมาทุกขั้น",
 "cards": ["ai-assistant", "ai-line", "ai-automation"],
 "sources": [
  {"t": "[2611.03094] A Fine-Grained Hierarchy and Benchmark for State Tracking in Language Models", "u": "https://arxiv.org/abs/2611.03094"},
  {"t": "StateBench: Testing how language models track state changes over long documents", "u": "https://huggingface.co/blog/allenai/statebench"},
  {"t": "allenai/state-bench · GitHub", "u": "https://github.com/allenai/state-bench"},
  {"t": "[2404.08819] The Illusion of State in State-Space Models", "u": "https://arxiv.org/abs/2404.08819"},
  {"t": "[2310.07923] The Expressive Power of Transformers with Chain of Thought", "u": "https://arxiv.org/abs/2310.07923"},
  {"t": "Pricing · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/pricing/"},
  {"t": "Limits · Cloudflare Workers AI docs", "u": "https://developers.cloudflare.com/workers-ai/platform/limits/"},
  {"t": "Buy · Hongdam", "u": "https://hongdam.net/buy/?c=ai-assistant"}
 ],
 "card": {"big": "32 changes: 0 of 10 in one go", "sub": "10 of 10 when the model writes each step"}}
---
Asked for the end of a running total after 32 changes, DeepSeek V4 Flash got 0 answers right in 10. Told to write the values after every change, the same model got 10 of 10. We measured this on 6 November 2026 on two open models on Cloudflare Workers AI, with a small version of StateBench, a test that three researchers at Ai2 (the Allen Institute for AI) published on 2 November 2026 [1][2].

StateBench tests state tracking: a model reads a list of changes and says what each value is at the end. In the paper, Gemini 3.8 Flash, Claude Opus 5.5, GPT-6 Sol and GPT-6 Luna did well when values were set or overwritten. On running totals and swaps they did no better than guessing once inputs reached 10,000 to 64,000 tokens [1], and scored 13% or lower on the longest swap problems [2]. A token is the piece of text a model reads or writes: a word, part of a word, or one character. Our logs are far shorter: 115 to 7,263 tokens.

## Two kinds of change are look-ups; two need every line

The paper sorts changes into four levels [1]. Our test has four kinds of line; in a shop's message log they look like this:

| Kind | A line in our test | In a shop |
| --- | --- | --- |
| Set once | `a <- 7;` and the same line again later | an order number |
| Overwritten | `a <- 3;` | "the delivery address is now…" |
| Running total | `a <- (a + 3) mod 10;` | "add two more bags" |
| Swap | `TMP <- a; a <- b; b <- TMP;` | two guests trade rooms |

`mod 10` drops the tens, so each value stays one digit. For the first two kinds, one line answers the question: the last line that names the variable. For the last two there is no such line. Each change builds on the one before, and a reader that skips one ends on the wrong value.

The paper's hardest level is a chain of swaps among five values [1][2]. An earlier paper by the same three authors argues that a transformer (the design behind today's language models) reading its input in one pass cannot solve it [4]. Our swaps use four variables, which the paper's maths places one level lower, beside running totals. The one-go answers failed there all the same.

Our test follows the paper's design: one random sequence written four ways, with the same variable changed at the same position in each [3].

## In one go: look-ups right, the rest guessed

DeepSeek V4 Flash 0731 answers without thinking first; each reply was 13 tokens. Whole answers right, out of 10:

| Kind | 8 changes | 32 | 128 | 512 |
| --- | --- | --- | --- | --- |
| Set once | 10 | 10 | 10 | 10 |
| Overwritten | 10 | 10 | 10 | 8 |
| Running total | 9 | 0 | 0 | 0 |
| Swap | 0 | 1 | 1 | 0 |

From 32 changes on, 8 of its 120 running-total values were right; picking digits blind gets about 12. On swaps, 31 of the 38 wrong replies gave the right four values in the wrong places; 7 of those were the starting values, untouched. A wrong reply has the same form as a right one: `a=5 b=7 c=4 d=0`.

## Written steps get it right, at 30 to 46 output tokens a change

A model gets room to work in two ways: the prompt tells it to write the values after every change, or the model thinks before it answers, writing working that is billed as output tokens. GLM-5.3 Flash thinks unasked. Theory backs both: a transformer allowed to write a number of steps in proportion to its input's length can, on paper, do every task of this kind [5].

| Whole answers right, of 10 | 8 changes | 32 | 128 | 512 |
| --- | --- | --- | --- | --- |
| Running total, DeepSeek writing steps | 10 | 10 | 10 | 2 of 3 |
| Swap, DeepSeek writing steps | 10 | 10 | 7 | 1 of 3 |
| Running total, GLM thinking | 10 | 9 | 9 | not run |
| Swap, GLM thinking | 10 | 10 | 2; 7 timed out | not run |

The room is paid for in output tokens: about 30 per running-total line and 46 per swap on DeepSeek, 60 and 77 in GLM's thinking. On the two look-up kinds GLM, thinking, got 80 of 80 right.

```chart
{"title": "Output tokens to answer one log of 128 swaps", "unit": "", "lower_is_better": true,
 "rows": [["DeepSeek V4 Flash, one go (1 of 10 right)", 13], ["DeepSeek V4 Flash, written steps (7 of 10 right)", 5854], ["GLM-5.3 Flash, thinking (2 of 10 right)", 12964]],
 "note": "Median billed output tokens per call, measured 6 November 2026 on Workers AI. GLM: the 3 logs of 10 that got an answer."}
```

At Workers AI's prices on 6 November 2026 (DeepSeek V4 Flash 0731: US$0.44 per million input tokens, US$1.32 per million output [6]), one log of 128 swaps cost US$0.0008 to answer in one go and US$0.0086 with written steps, and took 55 seconds in place of 1.

Three things went wrong as the logs grew:

- **The model stops writing steps.** Two of the three wrong 128-swap answers opened by saying the list was long, then wrote only the two values each swap touched. At 512 swaps one reply skipped the steps altogether.
- **Values appear twice.** All three wrong 128-swap answers named one value twice (`a=3 b=4 c=3 d=4`). No chain of swaps does that.
- **The call runs out of time.** Every call still running at about 235 seconds came back as HTTP 408, "Request timeout": 15 of GLM's 18 calls on 128-swap logs (7 logs timed out twice) and one of DeepSeek's three 512-change running totals. The limits page gives no time limit; it gives 20 requests a minute for each paid model on standard billing [7].

## For an app that reads a log

1. Log the value, not the change. "Stock: 7" in place of "sold 3" turns a running total into an overwrite, which the one-go model answered right 30 times of 30 up to 128 lines.
2. Apply the changes in code and hand the model the result:

```python
def apply(state, e):
    if e["do"] == "set":  state[e["key"]] = e["to"]
    if e["do"] == "add":  state[e["key"]] += e["by"]
    if e["do"] == "swap": state[e["a"]], state[e["b"]] = state[e["b"]], state[e["a"]]
    return state

state = {"bags": 2, "room_101": "guest A", "room_102": "guest B"}
for e in events:              # each message that changes the order
    state = apply(state, e)
prompt = f"Current order: {state}\n\nCustomer: {last_message}"
```

3. Where the model has to read the changes itself, ask for the values after each one, allow 50 output tokens per change, and check the answer in code. After swaps the same set of values comes back; a reply with a value twice is wrong.

Hongdam sets up chat assistants that answer from your own pages [8].

## Run it yourself

```python
import random
VARS = "abcd"

def problem(kind, n, seed):
    r = random.Random(seed)
    st = dict(zip(VARS, r.sample(range(10), 4)))
    lines = [f"{v} <- {st[v]};" for v in VARS]
    for _ in range(n):
        t, s = r.sample(VARS, 2)
        delta, const = r.randint(1, 9), r.randint(0, 9)
        if kind == "once":
            lines.append(f"{t} <- {st[t]};")
        elif kind == "overwrite":
            st[t] = const
            lines.append(f"{t} <- {const};")
        elif kind == "increment":
            st[t] = (st[t] + delta) % 10
            lines.append(f"{t} <- ({t} + {delta}) mod 10;")
        else:
            st[t], st[s] = st[s], st[t]
            lines.append(f"TMP <- {t}; {t} <- {s}; {s} <- TMP;")
    return "\n".join(lines), st   # the text for the model, the right answer
```

The one-go prompt: "Track the current value of each variable after executing the assignments in order. TMP is a scratch variable." then the lines, then "Reply with only the final values of a, b, c and d, in this form and nothing else: a=_ b=_ c=_ d=_". The written-steps prompt swaps the last sentence for "Work through the assignments one at a time. After each one, write the current values as a=_ b=_ c=_ d=_ on a line. Then end with one last line in this form: FINAL a=_ b=_ c=_ d=_".

## How we measured

Four variables with digit values, four lines that set them, then 8, 32, 128 or 512 changes. Ten random sequences per length, each written the four ways; three per kind for written steps at 512. We read the last `a=_ b=_ c=_ d=_` in each reply and counted an answer right when all four values matched. Models: `@cf/deepseek-ai/deepseek-v4-flash-0731` and `@cf/zai-org/glm-5.3-flash` through Workers AI's chat endpoint on 6 November 2026, temperature left at the platform's setting. Reply allowance: 512 tokens for DeepSeek in one go, 8,192 with written steps (28,000 at 512 changes), 32,768 for GLM. That is 366 prompts, 358 of them answered. Calls refused with HTTP 429 were sent again, and the GLM calls that timed out were sent once more. Our counts are of 10, and we did not test the paper's four models.

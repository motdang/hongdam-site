# Writing a Hongdam Studio note

Hongdam Studio is the tech side of hongdam.net, in Chiang Rai: last-mile fixes for vibe-coded apps, security, the
newest language models and machine learning, workflow automation. Its notes are at hongdam.net/studio/notes/, one a
day. The reader builds things or pays for them: a founder whose Lovable app is half done, an engineer choosing a model,
a shop owner whose WordPress was hacked. They read the note to learn something they did not know this morning, and
they can act on it today.

## What a note is

One finding, with its evidence and what to do about it. 600 to 1,200 words is the usual size (the check allows 350 to
1,900). It earns its place with at least one of:

- a measurement we made today, with its method: what, how many runs, which day, the median, the raw numbers in a table
- a change in the world this week (a release, an advisory, a price, a paper), read at its source, with what it means
  for someone shipping software
- a fix, with the code or the commands, tested where it can be tested

Never a roundup of headlines, never an opinion piece, never "10 tips". The Sunday note (beat "week") is the one
exception: the week's notes in a paragraph each, and up to five outside links worth a builder's time, each with one line.

Beat by weekday (Asia/Bangkok): Monday models · Tuesday last-mile · Wednesday security · Thursday automation · Friday
models (machine learning: a technique, a paper, a toy you can run) · Saturday any beat, from our own work · Sunday week.

## Sources

- Every fact comes from a source read today, cited in the body as [1], [2] … in the order of `sources` in the head.
  Primary first: the vendor's docs or changelog, the advisory (NVD, GitHub Security Advisories, the project's own),
  the paper, the pricing page. A news story only for what only it reports.
- Dates in ISO or "24 October 2026". Versions exactly. Prices with currency and the day read.
- Quote at most one sentence from any source, under 15 words, in quotation marks. Everything else in your own words.
- A number we measured says so: "measured 24 October 2026, 20 runs, median". Never a number from memory.
- Unknown is written as unknown. Never fill a gap with a likely value.

## First-party material

Allowed: what is published on motdang.net, hongdam.net, wichaa.net, demo.motdang.net, the public search endpoint
https://ai.motdang.net/api/search?q=…&n=…, the public repositories of the NaNoBotCo and motdang GitHub organisations,
and measurements you run today (curl timings of public endpoints, `~/.claude/bin/ow` runs within its daily cap, local
scripts). Not allowed: anything under ~/Desktop (case material, the queue), private repositories, the team's chat,
clients, the team's names, money, servers' addresses, keys. `tools/studio_check.py` refuses the obvious leaks; you
refuse the rest.

## Style

Read ~/.claude/STYLE.md first and follow it. In particular:

- Silence-first. No opening throat-clearing, no closing summary, no "in this note". Start with the finding.
- Banned words (§2) and every assurance form (§1): never "we never", "always", "guaranteed", "nothing leaves", "no
  tracking", a future promise, or a completeness claim about ourselves. Describe, present tense.
- Facts, not warnings: state what a flaw does and the fix. No "be careful", no "make sure", no "don't forget".
- Active voice, short sentences, nouns that stay nouns.
- Define each technical term in a clause the first time (row-level security, embedding, CVE …): a founder who is not
  an engineer reads these too.
- Headings (##) state their finding, not their topic.

## The file

`data/studio/notes/<yyyy-mm-dd>-<slug>.md`, slug in lowercase words and dashes, 60 characters at most. A JSON head on
one or more lines, a line of three dashes, then the body:

```
{"title": "…", "title_th": "…", "date": "2026-10-25", "beat": "models",
 "dek": "One or two sentences: the finding and why it matters. 230 characters at most.",
 "dek_th": "The dek in Thai, written by you (no machine translation tool), plain and natural.",
 "cards": ["ai-assistant", "ai-own"],
 "sources": [{"t": "Title of the page, as its site gives it", "u": "https://…"}, …],
 "card": {"big": "Short title for the link picture", "sub": "One short line under it"}}
---
Body.
```

- beat: last-mile, security, models, automation, week.
- cards: one to four Hongdam services this note is about, by id. Ids and what they sell: data/studio/studio.json,
  "practices" (and data/shop.json for the rest).
- card: optional; `big` 40 characters at most reads best on the link picture.
- title_th and dek_th: Thai a Thai engineer would write. English product names stay in English.

The body: ## and ### headings, paragraphs, - lists, 1. lists, > quotes, | tables | with a --- line under the header,
``` fenced code with its language ```, **bold**, *italic*, `code`, [words](https://…) links, [n] source marks.
A chart, when there are numbers to compare:

````
```chart
{"title": "Seconds to the first word", "unit": " s", "lower_is_better": true,
 "rows": [["Llama 3.3 70B", 2.1], ["GPT-OSS 120B", 6.4]],
 "note": "Median of 20 runs, measured 24 October 2026 from Chiang Rai."}
```
````

## Before it goes in

1. `python3 tools/studio_check.py data/studio/notes/<file>` passes (head, words, every source cited and answering,
   style, privacy).
2. Read the last 30 titles in data/studio/notes/ first; a topic already covered gets a new finding or waits.
3. Read the note once more as the founder who is not an engineer, and once as the engineer who knows more than you.
   Cut what either would skip.

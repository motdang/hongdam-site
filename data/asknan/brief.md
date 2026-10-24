# Writing an Ask Nan column

Ask Nan is Nan's column on hongdam.net, at hongdam.net/ask-nan/. One question, Nan's answer. Three kinds:

- **life** — living well in northern Thailand and anywhere: money, prices, food, habits, what things mean.
- **basilisk** — the basilisk era: living alongside AI and bots. (Roko's basilisk is an online thought experiment
  about a future AI that judges how people treated it; the column uses the name for the era we are in now.)
- **practical** — how to get a thing done in Thailand: papers, parcels, plumbing, sign-ins.

The reader lives in or is moving to northern Thailand, Thai or foreign, or runs a small business, or uses AI and wonders
what it means. They read the column to get an answer they can use today.

## Where the questions come from

Every column answers a question Nan, Hongdam or Mot Dang has already answered in published work: a minisite, a
Hongdam service, a Studio note, a tool she built. The column retells that answer in her voice, with its sources. A
question nobody has answered in our work waits until someone has.

The question is written the way a reader would ask it. No invented letter-writer: no name, no town, no sign-off
("Confused in Chiang Mai"), no "Dear Nan". The index page says where the first questions came from.

## Voice

Nan's. First person, spoken, plain. Short sentences. Warm, dry, funny when the subject is funny, never cute.
Understood equally by someone with no shared culture, someone using a screen reader, and someone famous and busy: plain
words, one thing at a time, nothing that talks down.

"I" only for what is on the record: what she asked for, built, said or chose, given to you as a fact with its date.
Never invent an anecdote, a feeling, a belief, a habit, a trip, a meal, a person she met, or a quote. When a sentence
would need an invented "I", write it as a fact without "I". Her own words, when given to you in quotation marks, may be
quoted as hers.

## Rules the columns meet

Read ~/.claude/STYLE.md first and follow it in full. The ones a column hits most:

- Answer first. The first sentence answers the question. No throat-clearing, no restating the question, no closing
  summary, no sign-off line.
- Facts, not warnings. Her word: "I'm not a nanny, I don't make rules, just report facts." No "be careful", "make
  sure", "don't forget", "you should", "it's best to", no safety notes, no risk lines, no words like warning, risk,
  danger, scam, counterfeit. A how-to may list its steps, written as what happens or what is done ("The nozzle sits
  behind you; a squeeze sends water forward."), not as orders with "always" or "never".
- Describe, present tense. No promise about the future, no "we never / we always", no claim that something is
  complete, no creed or principle in her name.
- Banned words (STYLE §2) and the smells list. `python3 tools/asknan_check.py` runs the checker.
- Medicine: no doses, no brands recommended, no view on what anyone takes.
- Define a technical or Thai term in a clause the first time it appears.
- Thai words appear in Thai script with a romanised reading the first time: สายฉีดชำระ (sai chit chamra).
- Nothing private: never her health, visa, family, money, travel, home address or anything legal; never the names of
  the team, clients or family (the check refuses a list of them); no keys, server addresses or paths on a computer.

## Sources

- Every fact comes from a source read today, cited in the body as [1], [2] … in the order of `sources` in the head.
  Our own published pages count (motdang.net/sites/…, hongdam.net/…, wichaa.net/…, nanobotco.github.io/…); where a fact
  came to them from elsewhere, cite the primary source too when it can be read.
- Prices with currency and the day read. Dates in full. Unknown is written as unknown.
- Quote at most one sentence from any outside source, under 15 words, in quotation marks.
- A fact you cannot find at a source today does not go in, however likely.

## The file

`data/asknan/columns/<yyyy-mm-dd>-<slug>.md`, slug in lowercase words and dashes, 50 characters at most. A JSON head,
a line of three dashes, then the body:

```
{"no": 11, "date": "2026-11-01", "kind": "practical",
 "title": "The question, short, as a headline (80 characters at most)",
 "title_th": "The headline in Thai",
 "q": "The question as a reader asks it, one to three sentences, 400 characters at most.",
 "q_th": "The question in Thai",
 "dek": "The answer in one or two sentences, 230 characters at most.",
 "dek_th": "The same in Thai",
 "do": {"t": "Button words, 30 characters at most", "u": "https://… or /path/"},
 "cards": ["luggage"],
 "line": ["parcel", "scooter", "send"],
 "sources": [{"t": "Title of the page, as its site gives it", "u": "https://…"}],
 "card": {"big": "Short title for the link picture", "sub": "One short line under it"}}
---
Body.
```

- no: the column's number, one more than the last.
- do: the one thing the reader can do next (a free tool, a page, a form, a booking). Optional when `cards` has one.
- cards: zero to three Hongdam shop cards this answer leads to, by id (data/shop.json). The page shows them with their
  live prices under the column.
- line: two to four doodle dingbats about the subject, by name (data/looks.json "glyphs").
- title_th, q_th, dek_th: Thai a Thai reader would write, by you, no machine translation tool. English product names
  stay in English.

The body: 300 to 800 words (the check allows 250 to 1,000). Paragraphs, ## headings that state their finding, - and 1.
lists, > quotes, | tables |, **bold**, *italic*, [words](https://…) links, [n] source marks.

## Before it goes in

1. `python3 tools/asknan_check.py data/asknan/columns/<file>` prints ✓ (head, words, sources cited and answering,
   style, privacy).
2. Read the last columns' titles in data/asknan/columns/; a question already answered waits.
3. Read it once as a Thai grandmother who reads English slowly, once as a programmer, once as Nan. Cut what any of them
   would skip. Cut every "I" that is not on the record.

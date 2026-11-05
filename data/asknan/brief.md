# Writing an Ask Nan column

Ask Nan is Nan's column on hongdam.net, at hongdam.net/ask-nan/. One question, Nan's answer. Three kinds:

- **life** — living well in northern Thailand and anywhere: money, prices, food, habits, what things mean.
- **basilisk** — the basilisk era: living alongside AI and bots. (Roko's basilisk is an online thought experiment
  about a future AI that judges how people treated it; the column uses the name for the era we are in now.)
- **practical** — how to get a thing done in Thailand: papers, parcels, plumbing, sign-ins.

The reader lives in or is moving to northern Thailand, Thai or foreign, or runs a small business, or uses AI and wonders
what it means. They read the column to get an answer they can use today.

## Where the questions come from

Every column answers a question Nan, Hongdam or Mot Dang has already answered in published work: a minisite, a Hongdam service, a Studio note, a tool she built. The column retells that answer in her voice, with its sources. A question nobody has answered in our work waits until someone has. The index page says the letters are written from questions Hongdam has already answered.

## Voice: an advice column, in plain English

Her word, 2026-10-26: "more compelling headlines and blurbs. A little more clickbaity. Add a bit of agony aunt fun to my columns and make them easier for ESL to read, even though they're about serious tech subject quite often."

Most readers read English as a second language, often through a translation app. Every part of a column is written for them first.

**The headline** (title, 80 characters at most) is a hook: the most surprising fact in the answer, the reader's fear or wish, a number, or a question with a twist. "Press 4 is not 4 minutes: the 7-Eleven microwave code, explained." "Is your water pump haunted?" The column delivers what the headline promises in its first lines. Plain words a translation app keeps; no "you won't believe", no capitals for shouting. The Thai headline makes the same promise in Thai, not a word-for-word copy.

**The blurb** (dek, 230 characters at most): two or three short sentences. The first teases, the rest give the answer. A reader who reads only the blurb still leaves with the answer.

**The letter** (q): the page puts "Dear Nan," above it. The reader's problem in their own words, with a little feeling (embarrassed, worried, confused, fed up), in one to four short sentences. It ends with a pen-name in `from`: two to five plain words that name the problem, with a place in Thailand when it fits ("Wet Trousers in Chiang Mai", "Rich in Paint, Poor in Baht"). The pen-name never names or describes a real person.

**The answer** opens "Dear <pen-name>," and answers the question in that sentence or the next. Warm, a little cheeky, on the reader's side. The fun comes from the situation and the facts (the gecko on the ceiling, the burned sweet potato), never from laughing at the reader. A sad or serious letter (a death, money trouble, health) gets warmth and no jokes. The last line is a short send-off: a fact or a picture the reader keeps, not a summary and not an order.

**Plain English, all through:**

- Sentences of 20 words or fewer, most under 15. One idea in each.
- Everyday words. A word a learner may not know gets a short meaning the first time, and only one bracket in a sentence.
- No idioms, slang or puns that a translation app would break. A headline may play with words only when its plain meaning still works.
- A plain verb before a phrasal verb: "start" and "stop", not "cut in" and "cut out".
- Numbers as digits. Prices with ฿ and the day they were checked.
- Headings: short and plain, fun allowed.

"I" only for what is on the record: what she asked for, built, said or chose, given to you as a fact with its date. Never invent an anecdote, a feeling, a belief, a habit, a trip, a meal, a person she met, or a quote. When a sentence would need an invented "I", write it as a fact without "I". Her own words, when given to you in quotation marks, may be quoted as hers. The letter-writer is the one who has feelings; Nan's answer has facts and warmth.

## Rules the columns meet

Read ~/.claude/STYLE.md first and follow it in full. The ones a column hits most:

- Answer first: "Dear <pen-name>," and then the answer. No throat-clearing, no restating the question, no closing summary.
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
 "q": "The letter, without Dear Nan (the page adds it), one to four short sentences, 400 characters at most.",
 "q_th": "The letter in Thai",
 "from": "Pen-name, two to five plain words",
 "from_th": "The pen-name in Thai",
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
- from, from_th: the letter's pen-name; the page shows it under the letter after a dash.
- title_th, q_th, dek_th, from_th: Thai a Thai reader would write, by you, no machine translation tool. English product names
  stay in English.

The body: 300 to 800 words (the check allows 250 to 1,000). Paragraphs, ## headings that state their finding, - and 1.
lists, > quotes, | tables |, **bold**, *italic*, [words](https://…) links, [n] source marks.

## Before it goes in

1. `python3 tools/asknan_check.py data/asknan/columns/<file>` prints ✓ (head, words, sources cited and answering,
   style, privacy).
2. Read the last columns' titles in data/asknan/columns/; a question already answered waits.
3. Read it once as a Thai grandmother who reads English slowly, once as a programmer, once as Nan. Cut what any of them
   would skip. Cut every "I" that is not on the record.

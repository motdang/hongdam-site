{"no": 13, "date": "2026-11-08", "kind": "basilisk",
 "title": "AI built your app in two weekends. Three things are usually still missing",
 "title_th": "AI สร้างแอปให้คุณในสองสุดสัปดาห์ แต่สามอย่างนี้มักยังไม่เสร็จ",
 "q": "I built a booking app for my guesthouse with an AI tool in two weekends. It works on my phone and my first guests have used it. Then a friend who writes code asked, \"Who can read your database?\" I did not know. Is my app finished or not?",
 "q_th": "ฉันใช้เครื่องมือ AI สร้างแอปจองห้องพักให้เกสต์เฮาส์ของตัวเอง ใช้เวลาสองสุดสัปดาห์ เปิดบนมือถือได้ แขกกลุ่มแรกก็ใช้แล้ว แต่เพื่อนที่เขียนโปรแกรมถามว่า \"ใครอ่านฐานข้อมูลของเธอได้บ้าง\" ฉันตอบไม่ได้เลย ตกลงแอปของฉันเสร็จหรือยังคะ",
 "from": "Almost Done in Chiang Rai",
 "from_th": "เกือบเสร็จที่เชียงราย",
 "dek": "Usually three things, and none of them shows on the screen. The database often lets any visitor read every row. The app's AI tools have no limit on how often they run. And the packages ran their own scripts on your laptop.",
 "dek_th": "ส่วนใหญ่เหลือสามอย่าง และไม่มีอย่างไหนมองเห็นบนหน้าจอ ฐานข้อมูลมักเปิดให้ใครก็อ่านได้ทุกแถว เครื่องมือ AI ในแอปไม่มีขีดจำกัดจำนวนครั้งที่เรียกใช้ และแพ็กเกจที่ติดตั้งได้รันสคริปต์ของตัวเองบนโน้ตบุ๊กของคุณไปแล้ว",
 "do": {"t": "Run the two-minute check", "u": "https://hongdam.net/studio/notes/supabase-public-key-open-tables/"},
 "cards": ["vibe"],
 "line": ["robot", "lock", "laptop", "key"],
 "sources": [
  {"t": "16,326 Supabase databases let anyone read their tables: check yours in two minutes · Hongdam Studio", "u": "https://hongdam.net/studio/notes/supabase-public-key-open-tables/"},
  {"t": "API keys | Supabase Docs", "u": "https://supabase.com/docs/guides/getting-started/api-keys"},
  {"t": "Everything Everywhere: Systemic Data Exposure in Supabase Apps | UpGuard", "u": "https://www.upguard.com/blog/everything-everywhere-systemic-data-exposure-in-supabase-apps"},
  {"t": "Breaking Change: Tables not exposed to Data and GraphQL API automatically · Changelog | Supabase", "u": "https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically"},
  {"t": "Agent integrations - Lovable Documentation", "u": "https://docs.lovable.dev/features/agent-integrations"},
  {"t": "Lovable's agent tools have no rate limit: a Postgres cap that also stops double writes · Hongdam Studio", "u": "https://hongdam.net/studio/notes/lovable-agent-tools-no-rate-limit/"},
  {"t": "Blocking malicious npm packages before and during installation - Vercel", "u": "https://vercel.com/changelog/blocking-malicious-npm-packages-before-and-during-installation"},
  {"t": "npm/cli CHANGELOG.md", "u": "https://github.com/npm/cli/blob/latest/CHANGELOG.md"},
  {"t": "Node.js Releases", "u": "https://nodejs.org/en/about/previous-releases"},
  {"t": "Vercel now blocks bad npm packages; the npm in every Node LTS still runs install scripts · Hongdam Studio", "u": "https://hongdam.net/studio/notes/npm-install-scripts-before-vercel/"},
  {"t": "Websites & apps · Hongdam, Chiang Rai", "u": "https://hongdam.net/web/"}
 ],
 "card": {"big": "AI says the app is done. Is it?", "sub": "Three checks for an app an AI tool built"}}
---
Dear Almost Done,

Your app works, and that is the visible half. The other half is three things that never show on the screen. Tools such as Lovable, Bolt, Replit and Cursor write the pages a guest taps. The database rules, the limits and the install step are where the work is usually left [11]. Your friend asked the first of the three.

## 1. Who can read your database?

Most apps built this way store their data in Supabase, a hosted database. The app's browser code carries a public key, which Supabase calls the publishable key. Supabase says anyone can read that key, "so it only reaches what Row Level Security allows" [2]. Row-level security (RLS) is the rule inside the database that says which rows each person may see. With RLS off, the public key reads every row: every booking, every guest's name.

UpGuard, a security company, looked at about 300,000 websites that showed signs of Supabase. It found 16,326 databases where anyone with that key could read the tables. Over half showed signs of personal data [3]. The cause is how the tables were made. Supabase turns RLS on for tables made by hand in its Table Editor. Tables made through the API, which is how coding agents make them, start with RLS off [3].

The check takes two minutes. In the Supabase dashboard, the SQL Editor runs one query that lists every table with RLS off that the public role can read. The Studio note has the query, and the lines that turn RLS on and let each user read only their own rows [1].

One date matters for an app made this year. On 30 October 2026 Supabase changed the default: a new table is not reachable through the API until a grant allows it. Tables made before that day stay as they were [4]. A table your AI made in September is as open today as it was then.

## 2. How often may the AI tools run?

Many builders let an assistant such as ChatGPT call the app's actions, so a guest can book by talking to a bot. Lovable's documentation says: "Agent integrations do not include a built-in rate limit or spending cap." Tool errors appear in the app's logs. Successful calls do not. The page also says an assistant may retry a call after a timeout, so a tool that writes can write twice [5]. Two bookings for one guest, and every AI call spends your balance.

The fix is one table and one function in the database. It counts each user's calls per hour, records each one, and does nothing on a repeated request. Tested on 27 October 2026: 20 of 25 calls went through, 5 were stopped at the limit, a repeat did nothing, and a call with no signed-in user was refused [6].

## 3. Where did the packages install themselves?

A web app pulls in hundreds of npm packages, pieces of code other people wrote. A package may carry an install script, a program that runs on your computer the moment the package lands, with your access to files and saved sign-ins. Since 2 November 2026 Vercel, a company that hosts apps, fails a build that contains a package version on its list of harmful ones [7]. That protects the build. The first install happened earlier, on your laptop or inside the AI tool.

npm 12, released 8 July 2026, blocks a package's install scripts unless the project approves them [8]. The npm that comes with Node.js 26 and 24, the current long-term releases, is npm 11, which runs them [9]. Two lines in a file named `.npmrc` in the project folder change that on npm 11.10 or newer [10]:

```ini
min-release-age=7
strict-allow-scripts=true
```

The first line installs only versions published more than 7 days ago. The second stops the install when a package wants to run a script, and names the package [10]. The packages that need their scripts, such as `esbuild` and `sharp`, get a yes one at a time, pinned to the exact version [10].

## Then it is finished

| Check | Where | Time |
|---|---|---|
| Who reads the database | Supabase SQL Editor [1] | 2 minutes |
| A cap on AI tool calls | One table, one function [6] | 1 hour |
| Install scripts | `.npmrc`, two lines [10] | 10 minutes |

Hongdam's Finish my vibe code service reads an app like yours and writes down what is broken, from ฿5,000. Finishing is 15 hours of work. Prices read on 8 November 2026 [11].

Your friend asked the right question. The answer is one query away, and your guests see nothing of it.

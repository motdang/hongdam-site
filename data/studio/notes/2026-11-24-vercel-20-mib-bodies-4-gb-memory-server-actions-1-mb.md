{"title": "Vercel's 20 MiB uploads need 4 GB of memory; Next.js Server Actions still stop at 1 MB", "title_th": "Vercel Functions รับไฟล์ได้ถึง 20 MiB แล้ว แต่ต้องตั้งหน่วยความจำ 4 GB และ Server Actions ยังหยุดที่ 1 MB", "date": "2026-11-24", "beat": "last-mile",
 "dek": "Vercel raised the request body limit from 4.5 MB to 20 MiB on 20 November, in beta. It takes three switches and a paid plan, and the Edge runtime keeps the old limit. A photo sent as base64 JSON loses a quarter of the room.",
 "dek_th": "Vercel ขยายขนาด request body จาก 4.5 MB เป็น 20 MiB เมื่อ 20 พฤศจิกายน (ยังเป็นเบต้า) ต้องเปิดสามอย่าง ใช้แพ็กเกจแบบเสียเงิน และ Edge runtime ยังจำกัดที่เดิม ส่วนรูปที่ส่งเป็น JSON แบบ base64 เสียพื้นที่ไปหนึ่งในสี่",
 "cards": ["vibe", "web-care", "app-test"],
 "card": {"big": "20 MiB uploads on Vercel", "sub": "Three switches, 4 GB memory, Next.js limits apart"},
 "sources": [
  {"t": "Vercel Functions now support request bodies up to 20MiB · Vercel changelog", "u": "https://vercel.com/changelog/vercel-functions-now-support-request-bodies-up-to-20mib"},
  {"t": "Vercel Functions Limits", "u": "https://vercel.com/docs/functions/limitations"},
  {"t": "Configuring Memory and CPU for Vercel Functions", "u": "https://vercel.com/docs/functions/configuring-functions/memory"},
  {"t": "Usage and pricing for Vercel Functions", "u": "https://vercel.com/docs/functions/usage-and-pricing"},
  {"t": "FUNCTION_PAYLOAD_TOO_LARGE", "u": "https://vercel.com/docs/errors/function_payload_too_large"},
  {"t": "next.config.js: serverActions | Next.js", "u": "https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions"},
  {"t": "API Routes | Next.js", "u": "https://nextjs.org/docs/pages/building-your-application/routing/api-routes"},
  {"t": "Client Uploads with Vercel Blob", "u": "https://vercel.com/docs/vercel-blob/client-upload"},
  {"t": "Fluid compute", "u": "https://vercel.com/docs/fluid-compute"},
  {"t": "Finish an app an AI tool wrote · Hongdam", "u": "https://hongdam.net/web/vibe/"}
 ]}
---
An upload form on a Vercel app fails above 4.5 MB with a 413, the HTTP code for "payload too large". On 20 November 2026 Vercel raised that ceiling to 20 MiB (20,971,520 bytes) as a public beta [1]. The new limit is off until a project turns on three settings, one of them only on paid plans, and it does nothing for the 1 MB limits that Next.js sets on its own.

## Three switches, and the Hobby plan has no way in

Vercel's limits page, read today, lists the steps [2]:

1. Fluid compute on. Fluid compute is Vercel's newer way of running functions, where one instance serves several requests at once. It is on by default for projects created since 23 April 2025 [9]; older projects turn it on in Settings or with `"fluid": true` in `vercel.json`.
2. Function memory set to Performance, 4 GB with 2 vCPUs. The memory page says this is set in the dashboard under Settings, Functions, and not in `vercel.json` [3].
3. An environment variable, then a redeploy:

```bash
vercel env add VERCEL_SUPPORT_LARGE_REQUEST_BODY preview
# value: 1
vercel deploy
```

The variable works per environment, so Preview can try it before Production [1].

The limits page gives Hobby a maximum of 2 GB of memory; Pro and Enterprise go to 4 GB [2]. A Hobby project cannot meet step 2, so it stays at 4.5 MB.

The beta covers the Node.js, Python and Bun runtimes [2]. A function or Routing Middleware on the Edge runtime stays at 4.5 MB and answers 413; the changelog's fix is `runtime: 'nodejs'` on the route [1]. Responses stay at 4.5 MB unless streamed [2].

## Middleware stops seeing the body

With the variable set, Routing Middleware (code that runs before every request reaches its route) receives the headers and no body, for the whole project [1]. Vercel's reason is to avoid sending a 20 MiB body twice [1]. Middleware that reads the body, such as a webhook signature check or a bot filter that inspects a form, stops working on the first deploy with the flag. The check moves into the route handler, which still gets the full body.

## Performance memory doubles one line of the bill

Vercel bills functions on fluid compute by Active CPU, Provisioned Memory and invocations [3]. Provisioned Memory is charged per GB-hour while an instance is up. The pricing page's rate for the Washington D.C. region, read today, is US$0.0106 per GB-hour [4]. At 2 GB an instance-hour costs US$0.0212 in memory; at 4 GB, US$0.0424. The setting applies to every function in the project, not only the upload route [3]. Twice the CPU can shorten CPU-bound work, which offsets part of it [3].

## A base64 JSON upload fits 3.37 MB, multipart fits 4.50 MB

The limit counts the request body, not the file. Apps that AI tools write often read the file in the browser, turn it into base64 text (a way of writing bytes as letters, which takes 4 characters for every 3 bytes) and post it inside JSON. A multipart form, the browser's own way of sending a file, adds a few hundred bytes.

Measured 24 November 2026 on a local server that reports each body's length: random files from 1 MB to 16 MB, posted with curl once as multipart (`-F file=@…`) and once as JSON carrying a `data:image/jpeg;base64,…` string. Every multipart body was the file plus 195 bytes. Every JSON body was 1.3333 times the file plus 52 bytes.

| File | Multipart body | Base64 JSON body | Under 4.5 MB? | Under 20 MiB? |
|---|---|---|---|---|
| 3,000,000 bytes | 3,000,195 | 4,000,052 | both | both |
| 3,400,000 bytes | 3,400,195 | 4,533,388 | multipart only | both |
| 4,400,000 bytes | 4,400,195 | 5,866,720 | multipart only | both |
| 15,000,000 bytes | 15,000,195 | 20,000,052 | neither | both |
| 16,000,000 bytes | 16,000,195 | 21,333,388 | neither | multipart only |

From those overheads, the largest file each way fits:

```chart
{"title": "Largest file that fits, in MB", "unit": " MB", "lower_is_better": false,
 "rows": [["Base64 JSON, 4.5 MB limit", 3.37], ["Multipart, 4.5 MB limit", 4.50], ["Base64 JSON, 20 MiB limit", 15.73], ["Multipart, 20 MiB limit", 20.97]],
 "note": "Measured 24 November 2026: 8 file sizes, curl, local server, 1 run each (body sizes are exact). 4.5 MB taken as 4,500,000 bytes; Vercel's page does not say which."}
```

Sending the file as multipart (`FormData` in the browser) buys a third more room under either limit, with no Vercel setting changed.

## Next.js sets 1 MB of its own

Vercel's limit is the outer wall. Next.js has two inner ones, from its docs read today:

| Where the upload lands | Next.js default | Raised with |
|---|---|---|
| A Server Action (a function the form calls directly, App Router) | 1 MB [6] | `experimental.serverActions.bodySizeLimit` in `next.config.js` |
| A Pages Router API route | 1 MB [7] | `export const config = { api: { bodyParser: { sizeLimit: '20mb' } } }` |

```js
// next.config.js
module.exports = {
  experimental: {
    serverActions: { bodySizeLimit: '20mb' },
  },
}
```

The Server Actions page counts multipart boundaries in the limit and suggests 10 to 20 KB of room over the largest file [6]. An app that sets Vercel's flag and leaves these alone fails at 1 MB with a Next.js error, not Vercel's 413.

## Larger files skip the function

Vercel's error page for `FUNCTION_PAYLOAD_TOO_LARGE` lists the other routes: compress, split, or upload straight to storage [5]. With Vercel Blob, `upload()` from `@vercel/blob/client` sends the file from the browser to the store, and a small route running `handleUpload()` hands out the token [8]. The body never passes through a function, so neither limit applies. The client-upload page says the route that issues tokens has to check who is asking, or anyone can fill the store [8].

## Which to use

- Under 3.37 MB as JSON or 4.5 MB as multipart: nothing to change.
- Up to 20 MiB, on Pro, with no body-reading middleware: the three switches, plus the Next.js limit raised to match.
- On Hobby, past 20 MiB, or with middleware that reads bodies: upload to storage from the browser.

Finding which of these an AI-written app needs, and wiring it, is part of the last-mile work we sell [10].

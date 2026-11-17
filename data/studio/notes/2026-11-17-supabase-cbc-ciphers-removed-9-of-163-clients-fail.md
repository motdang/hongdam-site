{"title": "Supabase turned off four TLS 1.2 ciphers: 9 of 163 recorded clients now fail to connect", "title_th": "Supabase ปิด cipher ของ TLS 1.2 สี่ชุดแล้ว: ไคลเอนต์ที่บันทึกไว้ 9 จาก 163 ตัวเชื่อมต่อไม่ได้", "date": "2026-11-17", "beat": "last-mile",
 "dek": "The removal announced for 10 November is in effect on project APIs. Safari 5 to 8, Chrome 30 and Opera 17 fail at the handshake; IE 11 connects through the ECDSA certificate. Measured 17 November 2026.",
 "dek_th": "การถอด cipher ที่ประกาศไว้สำหรับ 10 พฤศจิกายน มีผลแล้วบน API ของโปรเจกต์ Safari 5 ถึง 8, Chrome 30 และ Opera 17 ล้มเหลวตั้งแต่ขั้น handshake ส่วน IE 11 ยังเชื่อมต่อได้เพราะใบรับรองแบบ ECDSA วัดเมื่อ 17 พฤศจิกายน 2569",
 "cards": ["vibe", "web-care"],
 "card": {"big": "Supabase: four TLS ciphers are off", "sub": "9 of 163 recorded clients now fail"},
 "sources": [
  {"t": "An outdated subset of TLS 1.2 ciphers will be disabled on project HTTP APIs · Changelog", "u": "https://supabase.com/changelog/cbc-tls-ciphers-deprecated"},
  {"t": "TLS for project APIs | Supabase Docs", "u": "https://supabase.com/docs/guides/security/tls"},
  {"t": "TLS handshake failures after removal of CBC-mode ciphers | Supabase Knowledge Base", "u": "https://supabase.com/kb/troubleshooting/tls-handshake-failures-after-cbc-cipher-removal"},
  {"t": "Qualys SSL Labs - Projects / User Agent Capabilities", "u": "https://www.ssllabs.com/ssltest/clients.html"},
  {"t": "Java Cryptography Architecture Oracle Providers", "u": "https://docs.oracle.com/javase/7/docs/technotes/guides/security/SunProviders.html"},
  {"t": "Supported cipher suites · Cloudflare SSL/TLS docs", "u": "https://developers.cloudflare.com/ssl/edge-certificates/additional-options/cipher-suites/supported-cipher-suites/"},
  {"t": "Build Options | Vite", "u": "https://vite.dev/config/build-options"}
 ]}
---
Supabase's changelog and docs, read 17 November 2026, still speak in the future tense: four TLS 1.2 cipher suites leave project APIs "on November 10, 2026, at the earliest" [1][2]. The removal is in effect. TLS is the encryption under HTTPS, and a cipher suite is one of the methods a client and a server can agree on for it. On 17 November all four suites fail on `<project_ref>.supabase.co` and still connect on `api.supabase.com`, the Management API, which the change leaves out [1].

A client that fails does so in the handshake, the exchange that opens the connection, before it sends a request. The request does not appear in the project's API logs [3].

## The four suites fail on project hosts and still connect on the Management API

OpenSSL 3.6.4, `s_client`, TLS 1.2, one suite offered at a time, against three project hosts named in Supabase's public repositories and against `api.supabase.com`. Measured 17 November 2026, 06:42 Bangkok time. The three project hosts answered alike.

| Offered | Project host | `api.supabase.com` |
|---|---|---|
| `ECDHE-ECDSA-AES128-SHA256` | handshake failure | connects |
| `ECDHE-RSA-AES128-SHA256` | handshake failure | connects |
| `ECDHE-ECDSA-AES256-SHA384` | handshake failure | connects |
| `ECDHE-RSA-AES256-SHA384` | handshake failure | connects |
| the six GCM and ChaCha20 suites Supabase lists as staying [2] | connects, each one | connects, each one |
| TLS 1.3 | connects | connects |
| TLS 1.0, TLS 1.1 | protocol version alert | protocol version alert |

## 9 of 163 recorded clients are cut off: Safari 5 to 8, Chrome 30, Opera 17

SSL Labs publishes the ClientHello of 163 clients it recorded, from Android 2.3.7 to Chrome 131 [4]. The ClientHello is the first message a client sends: the TLS versions and cipher suites it can use. Its API at `api.ssllabs.com/api/v3/getClients` returns the bytes. A script put a project's host name and a fresh random value into each one, sent it, and read the reply: a ServerHello naming the chosen suite, or an alert. Each client went once to three project hosts and once to `api.supabase.com`. The three project hosts gave the same 163 answers.

```chart
{"title": "163 recorded clients against a Supabase project host", "unit": "",
 "rows": [["Connect on TLS 1.2", 91], ["Connect on TLS 1.3", 18], ["Fail here, connect on the Management API", 9], ["Refused on both", 45]],
 "note": "SSL Labs' recorded ClientHello bytes, replayed 17 November 2026."}
```

| Result on a project host | Clients | Which |
|---|---|---|
| Connect, TLS 1.3 | 18 | |
| Connect, TLS 1.2 | 91 | 90 on `ECDHE-ECDSA-AES128-GCM-SHA256`; Chrome 49 on XP SP3 on the RSA form |
| Fail; connect on the Management API | 9 | Safari 5 on iOS 5.1.1, 6 on iOS 6.0.1, 7 on iOS 7.1 and OS X 10.9, 8 on iOS 8.0 beta, iOS 8.4 and OS X 10.10; Chrome 30 and Opera 17 on Windows 7 |
| Refused on both, protocol version | 36 | clients that stop at TLS 1.0 or 1.1 |
| Refused on both, handshake failure | 9 | Android 2.3.7, IE 6 and IE 8 on XP, Java 6u45, three crawlers from 2013 and 2014 |

On the Management API all nine chose `ECDHE-ECDSA-AES128-SHA256`, one of the four removed. The oldest recorded versions that connect to a project: Safari 9 (iOS 9, OS X 10.11), Chrome 31, Firefox 27, Android 4.4.2, IE 11 on Windows 7, Java 8, OpenSSL 1.0.1h.

Two limits. The replay reads the server's answer to the first message and does not finish the handshake. And the recorded list is browsers, a few runtimes and crawlers; it has no smart TV or set-top box, the devices Supabase names first [2].

## IE 11 on Windows 7 and 8.1 connects because one certificate is ECDSA

A certificate proves the server's identity, and its key is one of two kinds, RSA or ECDSA. A project host presents either: OpenSSL received a 2048-bit RSA certificate when it offered an RSA suite and a 256-bit ECDSA one when it offered an ECDSA suite. Twelve recorded IE 11 clients, on Windows 7, Windows 8.1 and Windows Phone 8.1, list no GCM or ChaCha20 suite for RSA. They connect on `ECDHE-ECDSA-AES128-GCM-SHA256`. With an RSA certificate alone they would have failed with the nine.

A custom domain was not measured. Whether it presents an ECDSA certificate decides those twelve.

## Java 7 with TLS 1.2 switched on is cut off too

By default Java 7 enables TLS 1.0 alone for clients, and its cipher list has no GCM suite; the SHA256 and SHA384 suites on it are CBC ones [5]. The recorded Java 7u25 hello stops at TLS 1.0 and was refused before the change. An OpenSSL hello restricted to TLS 1.2 and 16 CBC suites from Java 7's list failed on the project host and connected on the Management API. A server integration written on Java 7 and set to TLS 1.2 by hand is that client. Java reports `SSLHandshakeException: Received fatal alert: handshake_failure` [3].

## A web app built with Vite's defaults targets browsers far newer than the nine

Vite's default build target is Chrome 111, Edge 111, Firefox 114, Safari 16.4 and iOS 16.4 [7]. Safari 8 and Chrome 30 sit far below that target, so a site built that way is unlikely to have worked in the nine before this week. The clients to look for are the ones that call the project without loading the site: older releases of a mobile or desktop app, devices, and scripts or servers on old runtimes [2].

## Two commands show where a project or custom domain stands

```bash
HOST=<project_ref>.supabase.co   # or the custom domain
openssl s_client -connect $HOST:443 -servername $HOST -tls1_2 \
  -cipher ECDHE-RSA-AES128-SHA256 </dev/null 2>&1 | grep -E "Cipher is|alert"
openssl s_client -connect $HOST:443 -servername $HOST -tls1_2 \
  -cipher ECDHE-ECDSA-AES128-GCM-SHA256 </dev/null 2>&1 | grep -E "Cipher is|alert"
```

After the removal the first prints `alert handshake failure`. The second prints the suite when an ECDSA certificate is there. To test a client, run `curl -v https://$HOST/rest/v1/` on the old machine: HTTP 401 with "No API key found in request" means TLS worked; curl exit code 35 means the handshake failed.

## A proxy on workers.dev lets the nine back in, and 30 TLS 1.0 and 1.1 clients with them

For a client that cannot be updated, Supabase's guide names a proxy under your control that accepts the old suites and forwards to the project [3]. Cloudflare's edge lists CBC suites among those it supports by default [6]. The same 163 hellos against a `workers.dev` host: 147 connect, 18 on TLS 1.3, 99 on TLS 1.2, 5 on TLS 1.1 and 25 on TLS 1.0. The nine all connect, on `ECDHE-ECDSA-AES128-SHA`, a CBC suite with SHA-1 that is older than the four Supabase removed.

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    url.protocol = "https:";
    url.hostname = env.SUPABASE_HOST; // <project_ref>.supabase.co
    url.port = "";
    return fetch(new Request(url, request));
  },
};
```

Run under `wrangler dev` (wrangler 4.163.0) on 17 November, this Worker returned the same 401 and body for `/rest/v1/` as the project did directly. It was not deployed, and Realtime's WebSocket and Auth redirects were not tested. Pointing the old clients alone at the proxy leaves every other client on the direct route and the stronger suites.

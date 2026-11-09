{"title": "Cloudflare's DNS scan is a list of common names; generated DKIM names fall outside it", "title_th": "สแกนระเบียน DNS ของ Cloudflare ทำงานจากรายชื่อที่พบบ่อย ระเบียน DKIM ที่ชื่อถูกสร้างขึ้นจึงหลุดจากสแกน", "date": "2026-11-07", "beat": "last-mile",
 "dek": "Cloudflare's quick scan adds records whose type and name match a list from other zones. Amazon SES's DKIM names are generated. A 92-query check before the switch, and the 48-hour registry TTL behind Cloudflare's 24 hours.",
 "dek_th": "สแกนด่วนของ Cloudflare เพิ่มเฉพาะระเบียนที่ชนิดและชื่อตรงกับรายการที่เก็บจากโซนอื่น ระเบียน DKIM ของ Amazon SES ใช้ชื่อที่ระบบสร้างให้ จึงต้องถามทีละชื่อเอง พร้อมสคริปต์ตรวจ 92 คำถามก่อนสลับเนมเซิร์ฟเวอร์ และ TTL 48 ชั่วโมงที่รีจิสทรี ซึ่งอยู่เบื้องหลังตัวเลข 24 ชั่วโมงของ Cloudflare",
 "cards": ["web-dns", "sec-mail", "web-move"],
 "card": {"big": "What Cloudflare's DNS scan misses", "sub": "Generated DKIM names, and a 92-query check"},
 "sources": [
  {"t": "Records quick scan · Cloudflare DNS docs", "u": "https://developers.cloudflare.com/dns/zone-setups/reference/dns-quick-scan/"},
  {"t": "Full setup · Cloudflare DNS docs", "u": "https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/"},
  {"t": "Set up DKIM · Google Workspace Admin Help", "u": "https://knowledge.workspace.google.com/admin/security/set-up-dkim"},
  {"t": "How to use DKIM for email in your custom domain · Microsoft Learn", "u": "https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dkim-configure"},
  {"t": "Creating and verifying identities in Amazon SES", "u": "https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html"},
  {"t": "tools/dns_move_check.py · motdang/hongdam-site", "u": "https://github.com/motdang/hongdam-site/blob/main/tools/dns_move_check.py"},
  {"t": "Proxied DNS records · Cloudflare DNS docs", "u": "https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/"},
  {"t": "Email records · Cloudflare DNS docs", "u": "https://developers.cloudflare.com/dns/manage-dns-records/how-to/email-records/"},
  {"t": "Time to Live (TTL) · Cloudflare DNS docs", "u": "https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/"},
  {"t": "Move your domain's settings to Cloudflare · Hongdam", "u": "https://hongdam.net/web/web-dns/"}
 ]}
---
Moving a domain to Cloudflare means changing its nameservers (the servers that answer where the website and the email live) at the registrar. Cloudflare offers to copy the existing records first, with a quick scan. Its reference page, read today, says what the scan is: a list of record types and names that recur across other zones (a zone is the set of records for one domain), matched against yours [1]. It is not a copy of your zone. Records whose names exist only on your domain are the ones that fall through, and on a working domain those are mostly email records.

Yesterday we published a service that does this move with a check on both sides of the switch [10]. This note is the reasoning behind that check, with the script and today's measurements.

## The scan matches type and name, not your zone

Cloudflare builds the scan from pairs of record **Type** and **Name** that it sees in active zones [1]. The content of the records plays no part, since content differs for every domain; a name like `www` or `mail` repeats across millions of zones, and that repetition is the list. The page gives the pairs it usually finds: an `A` record at the apex (the bare domain), a `CNAME` or `A` named `www`, an `MX` at the apex, a `CNAME` named `mail`, an `A` named `webmail` [1].

The same page names what the scan does not find: a hostname specific to one zone, its example `my-store1900`, and a DKIM record under a custom name, its example `this._domainkey` where `default._domainkey` would be found [1]. Cloudflare's setup page puts the consequence in one line: review the apex, `www` and the email records yourself before changing the nameservers [2].

The full list of names is not published. Whether a fixed name such as `google._domainkey` is on it is unknown; the page says only that custom names are expected to be missed.

## Which mail providers use fixed names, and which generate them

DKIM is a signature on outgoing mail; the receiving server checks it against a public key published in your DNS under `<selector>._domainkey.<domain>`. The selector is the provider's choice.

| Provider | Record name | Type | Fixed or generated |
|---|---|---|---|
| Google Workspace | `google._domainkey` | TXT | Fixed default prefix `google`; a different prefix can be typed in [3] |
| Microsoft 365 | `selector1._domainkey`, `selector2._domainkey` | CNAME | Fixed, the same for every organisation [4] |
| Amazon SES, Easy DKIM | three records, each `<token>._domainkey`, the page's example `abc123._domainkey` | CNAME | Generated per domain and per AWS Region [5] |
| Resend, measured on motdang.net today | `resend._domainkey` | TXT | Fixed |

A generated token appears in no list of common names, so the three SES records fall outside any scan built the way Cloudflare describes. Microsoft's two fixed names may or may not be on the list; Cloudflare's page does not say. Microsoft's page says signing of a custom domain starts once it detects the two CNAME records in DNS [4]. A DKIM record that did not come across leaves receivers unable to check the signature; whether the mail still arrives then rests on the SPF record and the domain's DMARC policy.

## Ask Cloudflare's nameservers before the registrar points at them

Cloudflare assigns two nameservers when the zone is created [2]. A query sent to one of them by name is answered from the new zone, whichever nameservers the registrar still lists. That allows a comparison before the switch: snapshot what the old nameservers answer, ask the two new ones the same questions, and diff.

Our script does that [6]. It asks 92 questions per domain: the apex and `www` as A, AAAA and CNAME; `mail`, `webmail`, `smtp`, `imap`, `pop`, `autodiscover` and `autoconfig`; the Outlook `_autodiscover._tcp` SRV; the apex TXT (where SPF lives), `_dmarc`, `_mta-sts`, `_smtp._tls`; and 32 common DKIM selectors, each as TXT and as CNAME. It also asks the registry (the operator of `.com`, `.net` or another ending) for DS records, the sign that DNSSEC (signatures on DNS answers) is on.

```bash
python3 tools/dns_move_check.py before example.com
python3 tools/dns_move_check.py compare example.com <ns1>.ns.cloudflare.com <ns2>.ns.cloudflare.com
python3 tools/dns_move_check.py after example.com
```

`compare` exits 1 on any mail record that differs. Website records are allowed to differ, since Cloudflare's proxy answers them with its own addresses. Measured 7 November 2026 from Chiang Rai, one run per domain, on four domains already on Cloudflare:

| | motdang.net |
|---|---|
| Questions asked | 92 |
| Records found | 8 |
| Of which mail | 4: MX, SPF in the apex TXT, `_dmarc`, `resend._domainkey` |
| DKIM selectors answering, of 32 | 1 |
| Time | 4.0 s |

The other three domains took 2.8 s to 4.0 s each. The limit is the one the scan has, in smaller form: a DKIM name outside the 32 is not found by asking. The SES tokens, the one case where the name cannot be guessed, come from the provider's settings page, and that page is read for every domain regardless of what the script finds.

## Mail hosts stay DNS only

Only A, AAAA and CNAME records can go through Cloudflare's proxy; MX and TXT are always DNS only [7]. The proxy answers web requests; a `mail` host whose A record is proxied answers with Cloudflare's own addresses [9], and Cloudflare's email-records page shows that host as DNS only in its example and says port 25, the mail port, is not proxied by default [8]. One more rule from the proxy page: when one A record on a name is proxied, every A record on that name is treated as proxied [7]. The quick-scan page does not say which proxy status it sets on what it finds; the orange cloud beside each mail host is read after the scan.

## Cloudflare's 24 hours, the registry's 48

Cloudflare's setup page says to wait up to 24 hours while the registrar updates the nameservers, that online checkers lag because they use cached results, and to confirm with `dig ns <domain> @1.1.1.1` [2]. The 24 hours is the registrar's side. On the other side sit the resolvers (the servers that look names up for phones and laptops), and they cache the old delegation for the registry's TTL, the time-to-live on the record. Measured today at the registries' own servers:

```chart
{"title": "Seconds a resolver may keep the old nameservers", "unit": " s", "lower_is_better": true,
 "rows": [[".com", 172800], [".net", 172800], [".dev", 10800], [".org", 3600]],
 "note": "NS record TTL at each registry's nameservers, measured 7 November 2026 with dig +norecurse."}
```

For a `.com` or `.net` domain that is 48 hours. Four public resolvers asked for one of our `.net` domains today reported remaining TTLs of 86,252 s (Cloudflare's resolver), 86,400 s (OpenDNS), 43,200 s (Quad9) and 21,600 s (Google Public DNS): what each reported as remaining, lower than the registry's figure and none below six hours. A resolver that looked the domain up just before the switch answers the old nameservers until its copy expires, so the old host's DNS stays as it was, records intact, for two days after the switch, and the old hosting is cancelled after that, not on the day.

Once the zone is on Cloudflare, later changes move faster: proxied records carry a fixed TTL of 300 seconds, and Auto on an unproxied record is 300 seconds too [9].

## Order of the day

1. Create the zone, run the scan, then read the mail provider's settings page and add every record named there, SES tokens included [1][5].
2. Run `before` against the old nameservers and `compare` against the two new ones; a `GAP` line is a record to add [6].
3. DNSSEC off at the registrar if `before` printed DS records; Cloudflare's page says changing nameservers with it on can make the domain unreachable [2].
4. Change the nameservers; `dig ns <domain> @1.1.1.1` until it answers the new pair [2].
5. Run `after`, send one mail from the domain to an outside inbox and read its authentication headers, and leave the old host's DNS alone for two days.

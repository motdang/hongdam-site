{"title": "WordPress's upgrade-window flaw: partial updates carry no installer, full ones do", "title_th": "ช่องโหว่ช่วงอัปเดตของ WordPress: แพ็กเกจอัปเดตย่อยไม่มีตัวติดตั้ง แต่แพ็กเกจเต็มมี", "date": "2026-11-04", "beat": "security",
 "dek": "CVE-2026-119977 lets a stranger run code while WordPress unpacks a full update; CISA listed it on 3 November. Measured today: the automatic point update is a 50-file partial with no installer; a branch jump unpacks 3,338 files.",
 "dek_th": "CVE-2026-119977 เปิดให้คนนอกรันโค้ดได้ระหว่างที่ WordPress แตกไฟล์อัปเดตแบบเต็ม CISA ขึ้นบัญชีเมื่อ 3 พฤศจิกายน เราวัดวันนี้: อัปเดตอัตโนมัติในสายเดียวกันเป็นแพ็กเกจย่อย 50 ไฟล์ ไม่มีตัวติดตั้ง ส่วนการข้ามสายแตกไฟล์ 3,338 ไฟล์",
 "cards": ["sec-hacked", "web-care", "php", "forensics"],
 "sources": [
  {"t": "CISA Adds One Known Exploited Vulnerability to Catalog (3 November 2026)", "u": "https://www.cisa.gov/news-events/alerts/2026/11/03/cisa-adds-one-known-exploited-vulnerability-catalog"},
  {"t": "CISA Known Exploited Vulnerabilities catalog, JSON feed, version 2026.11.03", "u": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"},
  {"t": "WordPress 7.1.4 Security Release (WordPress News)", "u": "https://wordpress.org/news/2026/10/wordpress-7-1-4/"},
  {"t": "GHSA-4w3m-c66w-69mg: A race condition during core updates that could lead to remote code execution", "u": "https://github.com/WordPress/wordpress-develop/security/advisories/GHSA-4w3m-c66w-69mg"},
  {"t": "CVE-2026-119977 (CVE record, assigned by Wordfence)", "u": "https://www.cve.org/CVERecord?id=CVE-2026-119977"},
  {"t": "NVD: CVE-2026-119977", "u": "https://nvd.nist.gov/vuln/detail/CVE-2026-119977"},
  {"t": "WordPress 7.1.4 Patches Unauthenticated Upgrade-Window RCE; Exploitation Attempts Detected After Release (Wordfence)", "u": "https://www.wordfence.com/blog/2026/10/wordpress-7-1-4-security-release-rce/"},
  {"t": "WordPress 7.1.4 Security Release (Patchstack)", "u": "https://patchstack.com/articles/wordpress-7-1-4-security-release/"},
  {"t": "wp-admin/includes/class-wp-upgrader.php, WordPress 7.1.3", "u": "https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/class-wp-upgrader.php"},
  {"t": "wp-admin/includes/file.php, WordPress 7.1.3 (wp_tempnam)", "u": "https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/file.php"},
  {"t": "wp-admin/includes/class-wp-upgrader.php, WordPress 7.1.4", "u": "https://github.com/WordPress/WordPress/blob/7.1.4/wp-admin/includes/class-wp-upgrader.php"},
  {"t": "wp-admin/includes/update-core.php, WordPress 7.1.4", "u": "https://github.com/WordPress/WordPress/blob/7.1.4/wp-admin/includes/update-core.php"},
  {"t": "wp-admin/includes/class-core-upgrader.php, WordPress 7.1.3", "u": "https://github.com/WordPress/WordPress/blob/7.1.3/wp-admin/includes/class-core-upgrader.php"},
  {"t": "WordPress.org core version-check API, version 1.7", "u": "https://api.wordpress.org/core/version-check/1.7/?version=7.0.7"},
  {"t": "WordPress.org statistics API: share of sites by WordPress version", "u": "https://api.wordpress.org/stats/wordpress/1.0/"}],
 "card": {"big": "WordPress update: partial or full?", "sub": "CVE-2026-119977, on CISA's exploited list since 3 November 2026"}}
---
On 3 November 2026 CISA (the US government's cybersecurity agency) added CVE-2026-119977, a flaw in the WordPress core updater, to its Known Exploited Vulnerabilities catalog, the list of flaws it has evidence attackers use [1]. US federal agencies have until 6 November to act [2]. WordPress fixed the flaw on 28 October in 7.1.4 and in a release for every branch back to 4.7 [3][4]. The flaw is a race: while WordPress unpacks a full update package, a complete copy of WordPress, installer included, sits for a few seconds in a folder the web server can serve, and a stranger who requests that installer in time can point the copy at a database they own [4][5][7].

A CVE number is the public ID of one flaw. A race condition is a flaw that only works when an attacker's request lands between two steps of a program. A branch is a release line such as 7.1 or 6.8; a point release is a fix inside it.

The window opens only when the update is a full package. Today we asked WordPress.org's update API which package it serves for each starting version and opened each zip [14]. The automatic point update inside a branch is a partial package of about 50 files with no installer in it. A jump between branches from the dashboard's Update now unpacks a complete copy, 3,338 files or more.

## Four readers rate one flaw from Low to 8.1

| Who | Rating | Source |
|---|---|---|
| WordPress, in its GitHub advisory | Low | [4] |
| Wordfence, the CVE numbering authority | 8.1, High; over the network, high complexity, needs neither an account nor a click | [5] |
| NVD, the US vulnerability database | "Undergoing Analysis", no score on 4 November | [6] |
| Patchstack | high complexity, would not "call it practical to exploit" | [8] |
| CISA | exploitation active, not automatable | [1][5] |

Wordfence put a firewall rule out on 28 October at 20:30 UTC, about three hours after the release, and saw the first matching request nine minutes later; in the first 21 hours it counted more than 18,500 requests aimed at staged `setup-config.php` paths, two of them polling small groups of sites for about 14.5 hours [7]. Wordfence Free users get that rule on 27 November 2026 [7]. The GitHub advisory went up on 29 October and the CVE record on 31 October [4][5].

## The staged copy carries the installer; the fix hides the folder and blocks one promotion

In 7.1.3 the updater empties `wp-content/upgrade/`, `index.php` included, names a working folder after the package and unzips into it [9]. A package downloaded from WordPress.org is saved under its own name plus six random characters, so the folder is `wordpress-7.1.4-` and six characters [10]. On a server that lists folders, the name is in the listing: the cleanup deletes any `index.php` in that folder, and the package ships none [9]. The staged copy's `wp-admin/setup-config.php` is the ordinary installer: it takes a database host, name, user and password from whoever posts them and writes a `wp-config.php` beside itself [4][7]. The CVE record calls the path predictable; Wordfence saw attackers try many folder and version name variations [5][7].

The 7.1.4 code makes three changes [11][12]. The working folder gets 16 random characters on its name. `wp-content/upgrade/` gets an `index.php` that the cleanup now keeps. And `update-core.php` skips any `wp-config.php` found in the working folder when it copies files into the site. The updater copies `update-core.php` from the new package into place before it runs the update [13], so the third guard is already in force on the update that brings a site to 7.1.4; the first two are not, because the unpacking runs under the old code.

## The automatic point update carries no installer

| From | To | Package | Files | Installer inside |
|---|---|---|---|---|
| 7.1.3 | 7.1.4, automatic | partial-3 | 50 | no |
| 7.1.2 | 7.1.4, automatic | partial-2 | 63 | no |
| 7.0.7 | 7.0.8, automatic | partial-7 | 49 | no |
| 7.0.7 | 7.1.4, dashboard Update now | no-content | 3,338 | yes |
| any, reinstall or an edited core file | full or new-bundled | 3,782 or 3,733 | yes |

Measured 4 November 2026: the API's offers for each version and the file list of each zip [14]. The chooser in the code takes the partial package when the API offers one for the exact installed version and the core files pass their checksum check; otherwise it takes new-bundled when the update crosses a bundled-theme version, otherwise no-content, otherwise full [13]. A site with an edited core file, common on a site that was hacked once, loses the partial route and unpacks the installer.

How long the window stays open depends on the server. Unpacking the full 7.1.4 package (37.2 MB, 3,782 files) with Python's zipfile took 0.82 seconds, median of 5 runs, and copying the files 0.98 seconds, measured 4 November 2026 on an Apple laptop. A shared host is slower by an amount we do not know. Wordfence's lab saw seconds [7].

## A third of sites are on a branch older than 7.1

```chart
{"title": "Share of WordPress sites by branch", "unit": "%", "lower_is_better": false,
 "rows": [["7.1", 65.2], ["7.0", 6.8], ["6.9", 6.4], ["6.8", 5.0], ["6.7", 2.5], ["6.6 and older", 14.1]],
 "note": "WordPress.org statistics API, read 4 November 2026. Branches older than 7.1 add up to 34.8%; 4.6 and older, 0.96%, get no fix."}
```

Every branch from 4.7 up has its own fixed point release [3][4], and for each version we asked about (7.1.3, 7.1.2, 7.0.7, 7.0.6, 6.8.11 and 6.8.10) the automatic update inside the branch is a partial package [14]. Sites on 4.6 and older, 0.96% in the same count, have no fix, and a jump to a fixed branch is a full package [7][14][15].

## Block the folder, then update, then look

The updater reads and writes the folder through the file system, not over the web [9], so a web rule on it does not touch the update. nginx, inside the server block and before the PHP location:

```nginx
location ^~ /wp-content/upgrade/ { deny all; }
```

Apache, in the site root's `.htaccess`, not inside the folder, which the updater empties [8][9]:

```apache
RedirectMatch 403 ^/wp-content/upgrade/
```

Check it:

```bash
curl -sI https://example.com/wp-content/upgrade/ | head -1
```

A 403 is the answer wanted. On a host where the server is out of reach, a rule at the firewall or CDN in front of the site that blocks the path does the same job, and the host's support can say whether the folder is already blocked. Then Dashboard › Updates, or `wp core version`, shows 7.1.4 or the branch's own fixed release [3].

If the site ran a full update after 28 October without the block, the marks of an attempt are in the web log and on disk [7]:

```bash
grep 'wp-content/upgrade/.*setup-config.php' access.log
wp core verify-checksums
wp user list --role=administrator --fields=ID,user_login,user_registered
find . -name '*.php' -newermt 2026-10-28 -not -path './wp-content/cache/*'
```

A request to `setup-config.php` under the upgrade folder that got a 200 is the mark; the second step of the installer is a POST with database details. Wordfence lists the rest to look for: administrator accounts you did not make, plugins you did not install, PHP files you did not place [7].

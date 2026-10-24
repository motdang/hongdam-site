{"title": "PHP2Shell: PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35 close two remote-code flaws", "title_th": "PHP2Shell: PHP 8.5.12, 8.4.27, 8.3.36 และ 8.2.35 ปิดช่องโหว่สั่งรันโค้ดจากระยะไกล 2 รายการ", "date": "2026-10-24", "beat": "security", "order": 2,
 "dek": "Two PHP flaws, CVE-2026-109618 and CVE-2026-109619, let a stranger run code on a web server without logging in. Fixes shipped 21 October; attacks began 17 October; patched servers still need a restart.",
 "dek_th": "ช่องโหว่ PHP 2 รายการ (CVE-2026-109618 และ CVE-2026-109619) ให้คนแปลกหน้าสั่งรันโค้ดบนเว็บเซิร์ฟเวอร์ได้โดยไม่ต้องล็อกอิน แพตช์ออก 21 ตุลาคม 2569 แต่การโจมตีเริ่มตั้งแต่ 17 ตุลาคม และหลังอัปเดตต้องรีสตาร์ตโปรเซส PHP ด้วย",
 "cards": ["php", "sec-hacked", "web-care"],
 "sources": [
  {"t": "PHP: News Archive 2026 (security advisory of 21 October, session upload progress advisory of 23 October)", "u": "https://www.php.net/archive/2026.php"},
  {"t": "GHSA-w8hw-w9fx-j79w: RCE via OOM corruption", "u": "https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w"},
  {"t": "GHSA-6wmf-4rv5-p3rp: RCE via stale global state", "u": "https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp"},
  {"t": "NVD: CVE-2026-109618", "u": "https://nvd.nist.gov/vuln/detail/CVE-2026-109618"},
  {"t": "Today's PHP security release, and how we're strengthening PHP security (The PHP Foundation)", "u": "https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/"},
  {"t": "Amazon Threat Intelligence identifies PHP2Shell exploitation prior to public disclosure in MadPot (AWS Security Blog)", "u": "https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/"},
  {"t": "CISA alert: critical vulnerabilities in PHP require immediate patching", "u": "https://www.cisa.gov/news-events/alerts/2026/10/21/critical-vulnerabilities-php-require-immediate-patching"},
  {"t": "CISA Known Exploited Vulnerabilities catalog, JSON feed, version 2026.10.23", "u": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"},
  {"t": "USN-8948-1: PHP vulnerabilities (Ubuntu)", "u": "https://ubuntu.com/security/notices/USN-8948-1"},
  {"t": "php2shell vulnerability fixes available (Ubuntu blog)", "u": "https://ubuntu.com/blog/php2shell-vulnerability-fixes-available"},
  {"t": "CVE-2026-109618 (Debian security tracker)", "u": "https://security-tracker.debian.org/tracker/CVE-2026-109618"},
  {"t": "RHSB-2026-013 (Red Hat security bulletin)", "u": "https://access.redhat.com/security/vulnerabilities/RHSB-2026-013"},
  {"t": "CVE-2026-109618 (Red Hat Security Data API)", "u": "https://access.redhat.com/hydra/rest/securitydata/cve/CVE-2026-109618.json"},
  {"t": "CloudLinux status: PHP2Shell incident", "u": "https://cloudlinux.statuspage.io/incidents/zl0vt1yq3dj5"},
  {"t": "PHP2Shell research (Sansec)", "u": "https://sansec.io/research/php2shell"},
  {"t": "PHP2Shell (Calif)", "u": "https://calif.io/php2shell"},
  {"t": "PHP vulnerabilities: Cloudflare WAF protection (Cloudflare blog)", "u": "https://blog.cloudflare.com/php-vulnerabilities-waf-protection"},
  {"t": "Site Health screen (WordPress documentation)", "u": "https://wordpress.org/documentation/article/site-health-screen/"},
  {"t": "needrestart(1) manual page (Ubuntu)", "u": "https://manpages.ubuntu.com/manpages/noble/man1/needrestart.1.html"},
  {"t": "needs-restarting (DNF plugins core documentation)", "u": "https://dnf-plugins-core.readthedocs.io/en/latest/needs_restarting.html"},
  {"t": "proc_pid_exe(5) manual page (Linux man-pages)", "u": "https://man7.org/linux/man-pages/man5/proc_pid_exe.5.html"},
  {"t": "PHP manual: Predefined Constants", "u": "https://www.php.net/manual/en/reserved.constants.php"},
  {"t": "PHP manual: php_sapi_name", "u": "https://www.php.net/manual/en/function.php-sapi-name.php"},
  {"t": "PHP: Supported Versions", "u": "https://www.php.net/supported-versions.php"}],
 "card": {"big": "PHP2Shell: update, then restart", "sub": "Two PHP flaws, fixed 21 October 2026"}}
---
Two flaws in PHP's core let a stranger run commands on a web server without logging in. PHP shipped fixes on 21 October 2026 [1], four days after Amazon recorded the first attack attempt [6]. Sansec credits the exploit that chains both flaws, named PHP2Shell, to the research firm Calif [15].

A CVE (Common Vulnerabilities and Exposures) number is the public ID of one flaw. A SAPI (server API) is the way PHP connects to a web server. php-fpm is a pool of PHP worker processes that nginx or Apache hands requests to; mod_php runs PHP inside Apache's own processes.

## Two CVEs, both rated 9.2 of 10, end in code execution as the web user

CVE-2026-109618: a request that exhausts `memory_limit` makes PHP abort partway through setting up, and the cleanup that follows treats half-built data as valid [2]. CVE-2026-109619: state from one request keeps pointing at memory that request owned, and a later request on the same worker (the process that handles requests) uses the freed memory [3]. Both lead to remote code execution (RCE: an outsider runs commands on the server) with the web worker's privileges [2][3].

PHP scores each 9.2 on CVSS v4, a 0-to-10 severity scale, with attack complexity rated high [2][3]. NVD adds a CVSS 3.1 score of 9.8 for CVE-2026-109618 [4]. The PHP Foundation states that a 10.0 circulating during the leak was wrong [5].

## mod_php is the exposed case; php-fpm depends on the application

PHP's advisory lists five affected setups: Apache mod_php, php-fpm, php-cgi, FrankenPHP and LiteSpeed. It rates mod_php highest, because an unauthenticated request reaches the first flaw before any application code runs [1], and the advisory demonstrated it with default memory and input limits [2].

For php-fpm the sources differ:

- CVE-2026-109618: the advisory's source analysis calls FPM susceptible but shows no full exploit; FPM exits the worker when startup fails [2].
- CVE-2026-109619: FPM is exposed through a frontend that passes `PHP_VALUE` settings, or through session upload progress, which was validated [3].
- Calif demonstrated FPM behind nginx where the application decodes data after startup (`session_start()`, `unserialize()`) and lists pre-login code execution on WordPress 7.1.2, Drupal 11.4.3 and Joomla 6.1.4 [16].
- Red Hat: reliable exploitation needs precise heap manipulation, and FPM workers exit on early failure [12]. Sansec: a researcher found public proofs of concept fail on default installs and mostly need a separate file-inclusion bug in the target [15].

Outside the advisory's scope: servers without PHP, and machines that run PHP only for command-line scripts; the scope is PHP that serves web requests [1]. RHEL 7 is not affected by CVE-2026-109618, only by CVE-2026-109619 [12].

## Attacks began on 17 October, four days before the fix

Amazon's honeypot network logged the first attempt on 17 October from an anonymization network. On 21 October between 02:00 and 08:00 UTC more attempts arrived with varied payloads, which points to several actors; Amazon cannot say whether any would have worked on a real system [6]. Cloudflare saw attack traffic against customers before the release and switched on managed WAF rules (web application firewall rules, which filter requests) for Free and paid plans at 03:02 UTC on 21 October [17].

The PHP team: the CVE ids leaked about 15:00 UTC on 20 October, a demonstration video that evening, and the release moved from 22 October to 21 October, 14:00 UTC; it found no functional public exploit at release [5]. CISA's alert, published 21 October and revised 23 October, reports no successful exploitation observed [7]. The Known Exploited Vulnerabilities catalog, version 2026.10.23, lists neither CVE (read 24 October 2026) [8].

## `php -v` reads the command-line PHP; the web server can run another

The web build shows itself when a file prints it. `PHP_VERSION` holds the version string and `PHP_SAPI` the server API name [22]; `fpm-fcgi` is php-fpm, `apache2handler` is the Apache module, `cgi-fcgi` is FastCGI and `litespeed` is LiteSpeed [23]. Red Hat points to a temporary `phpinfo()` page for web settings, because `php -i` reports the command-line configuration [12].

```bash
php -v                                              # command-line build only
echo '<?php echo PHP_VERSION, " ", PHP_SAPI, "\n";' | sudo tee /var/www/html/ver-check.php
curl -s https://example.com/ver-check.php           # e.g. 8.3.36 fpm-fcgi
sudo rm /var/www/html/ver-check.php
```

On the server itself:

```bash
ps -eo pid,lstart,user,args | grep -E 'php-fpm|apache2|httpd|lsphp|frankenphp|php-cgi' | grep -v grep
sudo apachectl -M | grep php            # mod_php loaded into Apache
grep -rn fastcgi_pass /etc/nginx/       # which php-fpm socket nginx uses
```

Distribution packages keep an older upstream number with a new suffix, so a printed version can read lower than the release table below while the package carries the fix; CloudLinux names alt-php85 8.5.11-5 and ea-php84 8.4.26-2.el8.cloudlinux.1 as fixed builds [14]. Package versions decide.

```bash
apt list '?installed ?name(^php[0-9.]+$)'                                  # Debian, Ubuntu
zgrep CVE-2026-109618 /usr/share/doc/php8.3-common/changelog.Debian.gz    # Debian, Ubuntu
rpm -q --changelog php-common | grep CVE-2026-109618                       # RHEL family
```

The changelog checks come from Sansec [15]. CloudLinux notes its native PHP 8.2 and 8.3 changelogs omit the CVE ids; there `rpm -q php-cli` reads 8.2.35 or 8.3.36 or later [14].

## Four branches have a fixed release; 8.1 and older depend on the vendor

| PHP branch | Fixed release (21 October 2026) | Upstream security support ends |
|---|---|---|
| 8.5 | 8.5.12 | 31 Dec 2029 |
| 8.4 | 8.4.27 | 31 Dec 2028 |
| 8.3 | 8.3.36 | 31 Dec 2027 |
| 8.2 | 8.2.35 | 31 Dec 2026 |
| 8.1, 8.0, 7.4 | none; a source patch branch for each | ended |
| 7.3 and older | none listed | ended |
| 8.6.0 | RC4 carries the fix; earlier 8.6.0 builds do not | not released |

Sources: [1][2][3][24]. The patch replaces the jump PHP used for out-of-memory errors with a soft stop at the next safe point and a hard process exit at a higher threshold [2].

Distribution packages carry the fix on their own numbers:

| System | Package | Fixed version or erratum |
|---|---|---|
| Ubuntu 26.10 | php8.5 | 8.5.9-0ubuntu2.1 |
| Ubuntu 26.04 | php8.5 | 8.5.4-0ubuntu1.5 |
| Ubuntu 24.04 | php8.3 | 8.3.6-0ubuntu0.24.04.13 |
| Ubuntu 22.04 | php8.1 | 8.1.2-1ubuntu2.28 |
| Ubuntu 20.04, 18.04 (Ubuntu Pro) | php7.4, php7.2 | 7.4.3-4ubuntu2.29+esm5, 7.2.24-0ubuntu0.18.04.17+esm14 |
| Debian 13 | php8.4 | 8.4.27-1~deb13u1 (DSA-6574-1) |
| Debian 12 | php8.2 | 8.2.35-1~deb12u1 (DLA-4848-1) |
| RHEL 10 | php, php8.4 | 8.3.36-1.el10_2, 8.4.27-1.el10_2 |
| RHEL 9 | php:8.2, php:8.3, php 8.0 | RHSA-2026:87072, 87079, 87151 |
| RHEL 8 | php:8.2, php:7.4 | RHSA-2026:87073, 87080 |

Sources: Ubuntu [9], Debian [11], Red Hat [13]. Red Hat's data lists the RHEL 9 php:8.4 stream as affected with no erratum when read on 24 October 2026 [13]. On cPanel hosts, ea-php82 to ea-php85 builds with the fix reached stable on 21 October, and builds numbered 8.2.35-1, 8.3.36-1, 8.4.27-1 and 8.5.12-1 followed on 23 October [14].

## The update is the fix; the restart is what makes it apply

PHP's advisory calls the update the only complete fix [1]; a running worker keeps the code it started with. Ubuntu states that updating the packages is not enough on its own; unattended-upgrades (on by default since Ubuntu 16.04) applies security updates within about 24 hours, and applications still need a restart or the system a reboot afterward [10]. Red Hat states a reload is not enough and a container is replaced, not restarted in place [12].

```bash
# Debian, Ubuntu
sudo apt update && sudo apt install --only-upgrade '?name(^php[0-9.]+$)'
sudo systemctl restart php8.3-fpm       # php-fpm; unit name follows the branch
sudo systemctl restart apache2          # mod_php
# RHEL family
sudo dnf upgrade 'php*'
sudo systemctl restart php-fpm          # php-fpm
sudo systemctl restart httpd            # mod_php
```

The apt upgrade and the apache2 restart follow Ubuntu's notice [10]; the Red Hat unit names follow Red Hat's bulletin [12]. On cPanel hosts CloudLinux names `/scripts/restartsrv_httpd` and `/scripts/restartsrv_apache_php_fpm` [14].

Where an update has to wait, PHP lists partial measures it says do not make an install safe: `session.upload_progress.enabled=0` and, on 8.5, `fatal_error_backtraces=0`, set in php.ini or the pool config (not `ini_set()` or `.user.ini`) with a restart; `memory_limit=-1` through `php_admin_value`; a lower `post_max_size` [1].

## Checking that no process still runs the old code

```bash
sudo needrestart -r l                   # Debian, Ubuntu: lists services on outdated code, changes nothing
sudo dnf needs-restarting -s            # RHEL family: services started before an updated package
for p in $(pgrep -f php-fpm); do sudo ls -l /proc/$p/exe; done
ps -o pid,lstart,args -C php-fpm8.3     # start times later than the upgrade
```

`needrestart -r l` reports services that need a restart and makes no change [19]. `needs-restarting -s` limits its report to systemd services whose process predates an updated package [20]. A `/proc/PID/exe` link ending in `(deleted)` marks a process started from a binary that has since been replaced [21]; php-fpm and php-cgi are their own binaries, while mod_php lives inside Apache, so the Apache service is the one that carries it.

## CVE-2026-115560 reaches patched builds in one configuration

PHP's 23 October notice names a third CVE, in session upload progress, that Cloudflare states affects patched versions including 8.5.12 [17]. It needs `session.serialize_handler` set to `php_binary` or `php_serialize`, an application that switches it to `php` with `ini_set()` before `session_start()`, and upload progress left on. The stopgap is `session.upload_progress.enabled=0` until the next regular release, which carries the full advisory [1]; Red Hat states the setting fully addresses it [12].

## Signs of a break-in: the sources list few

- PHP's advisories list no indicators of compromise, and state that clean logs do not prove safety [3].
- CISA names PHP worker processes launching shells or downloading tools, and points to its SIGMA detection rule [7].
- Amazon names the string `PHP_SESSION_UPLOAD_PROGRESS` in multipart POST bodies and lists six source addresses on shared anonymization networks [6].
- The advisory's log audit looks for repeated warnings before target scripts run, fatal errors, and "Maximum execution time exceeded" [3].
- Sansec reports a path that returns freed worker memory in a `PHPSESSID` cookie; that memory can hold passwords, session tokens, API keys and TLS private keys [15].

## On hosted sites the host applies the fix

- The version: WordPress lists the server setup under Tools, Site Health, Info, Server [18]; the `ver-check.php` file above works through a host's file manager; a hosting control panel's PHP setting shows the branch it serves.
- The fix is the host's build. CloudLinux's builds for cPanel hosts keep old numbers while carrying the fix, so a panel reading 8.4.26 can be patched [14]. Cloudflare states that patching means the vendor's PHP update, not only site code or plugin updates, and that a host which manages PHP applies it [17].
- Branches: 8.2.35 is the oldest fixed upstream release, and 8.2 security support ends 31 December 2026 [1][24]. PHP 8.1 and older receive no upstream update; vendors backport or the site moves to a newer branch [1]. CISA lists taking PHP systems offline when they cannot be updated or run 8.1 or earlier [7].
- Cloudflare's managed WAF rules for both CVEs run by default on Free and paid plans, as an added layer beside the update [17].

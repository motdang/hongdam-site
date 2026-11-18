{"title": "OpenSSH 10.6p2 shut the 300-byte password bypass on Alpine sshd: fixed in every branch", "title_th": "OpenSSH 10.6p2 ปิดช่องรหัสผ่าน 300 ไบต์ที่ล็อกอิน sshd บน Alpine ได้: แก้แล้วทุกสาขา", "date": "2026-11-18", "beat": "security",
 "dek": "A password 256 to 1024 bytes long logged into Alpine accounts whose shadow field was *, because musl's crypt() returned the single character * on overflow. OpenSSH 10.6p2, released 5 November, blocks it.",
 "dek_th": "รหัสผ่านยาว 256 ถึง 1024 ไบต์ ล็อกอินเข้าบัญชี Alpine ที่ช่อง shadow เป็น * ได้ เพราะ crypt() ของ musl ตอบกลับเป็นอักขระ * เมื่อรหัสผ่านยาวเกิน OpenSSH 10.6p2 ที่ออก 5 พฤศจิกายน ปิดช่องนี้",
 "cards": ["sec-hacked", "web-care"],
 "card": {"big": "Alpine: a 300-byte password got in", "sub": "OpenSSH 10.6p2 fixes the musl crypt bypass"},
 "sources": [
  {"t": "CISA Known Exploited Vulnerabilities catalog (JSON feed)", "u": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"},
  {"t": "OpenSSH Release Notes", "u": "https://www.openssh.org/releasenotes.html"},
  {"t": "GHSA-4fcc-vm97-gx3x · OpenSSH password authentication bypass", "u": "https://github.com/advisories/GHSA-4fcc-vm97-gx3x"},
  {"t": "openssh-portable commit 4353fdc · avoid password authn bypass", "u": "https://github.com/openssh/openssh-portable/commit/4353fdc43ef646c43a8dda7025cc1a898caf1482"},
  {"t": "Alpine Linux v3.21 security database (main.json)", "u": "https://secdb.alpinelinux.org/v3.21/main.json"},
  {"t": "Alpine Linux v3.22 package index (main)", "u": "https://dl-cdn.alpinelinux.org/alpine/v3.22/main/x86_64/"},
  {"t": "Red Hat CVE-2026-123158", "u": "https://access.redhat.com/security/cve/CVE-2026-123158"}
 ]}
---
OpenSSH 10.6p2 shipped on 5 November 2026 with one change marked security: "avoid password authentication bypass that is exploitable through sshd(8) that affects some Linux systems when built and run with PAM support disabled" [2]. PAM, Pluggable Authentication Modules, is the chain of authentication steps most Linux distributions put between sshd and the password file; a build without PAM compares the submitted password to the shadow entry directly. The GitHub Security Advisory names the condition precisely: "sshd in OpenSSH before 10.6p2 on Linux, when musl libc is used without PAM, lacks a workaround for a password authentication bypass" [3]. musl is the small C library Alpine Linux ships; the default Alpine sshd build uses musl and no PAM. On 9 November CISA added CVE-2026-123158 to the Known Exploited Vulnerabilities catalog with a 12 November deadline [1]. The CVSS score is 8.1 (High), vector `AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H` [3].

For some accounts, any password between 256 and 1024 characters succeeded [3]. The "some" matters: musl's crypt() returns the string `*` on overflow, and when the shadow entry is also `*`, OpenSSH compared `*` to `*` and accepted the login.

## The patch requires the stored hash to be at least four characters

The OpenSSH portable commit 4353fdc adds `#define MIN_PASSWORD_HASH_LEN 4` and refuses to compare a candidate against a stored hash shorter than that [4]. A full crypt() hash is dozens of characters — a modern yescrypt or SHA-512 entry starts with `$y$` or `$6$` and runs to about eighty. A shadow field of `*`, `!` or `!!` is one or two characters and signals a locked account: no password login allowed. The old code treated the one-character `*` returned by musl's failing crypt() as if it were a hash, matched it against the one-character `*` in shadow, and let the attacker in. The new code refuses the comparison. The same commit also replaces raw `pw->pw_passwd` pointers with `xstrdup` copies and frees them in `pick_salt`, so the fallback path for unknown users owns its own memory [4]. The release notes say the root cause lies outside sshd but sshd can avoid it [2]: the underlying bug is musl returning `*` for an oversized input, and the OpenSSH change is the workaround.

## Which Alpine containers have sshd and no PAM by default

A base `alpine:*` image has neither openssh-server nor PAM. The ones to look at are:

- the official Alpine cloud images and ISOs, which run sshd during install and on first boot
- the `linuxserver.io/openssh-server` image and hobby-server images derived from it
- a Dockerfile that installs `openssh-server` on top of `alpine:*` (and no PAM)
- devcontainer and CI base images built the same way
- Alpine on OpenWrt, Buildroot, Yocto and embedded gadgets with sshd enabled [3]

`apk info openssh-server` prints the installed version. The default Alpine package does not pull PAM in. A rule of thumb on a fresh install: if `apk info -q openssh-server-pam` prints nothing, PAM is off and the bypass path applies.

## Every supported Alpine branch has the fix in its repository

Measured 18 November 2026, 06:35 Bangkok time. `APKINDEX.tar.gz` was pulled from `dl-cdn.alpinelinux.org` for each branch and the `openssh-server` version read out. The secdb entry for each branch was then checked against the `CVE-2026-123158` row [5].

```chart
{"title": "openssh-server in each Alpine branch's main repository on 18 November 2026",
 "rows": [["v3.18 — 9.3_p2-r4", 1], ["v3.19 — 9.6_p1-r3", 1], ["v3.20 — 9.7_p1-r6", 1], ["v3.21 — 9.9_p2-r1", 1], ["v3.22 — 10.0_p1-r11", 1], ["v3.23 — 10.2_p1-r1", 1], ["v3.24 — 10.3_p1-r2", 1], ["edge — 10.6_p2-r0", 1]],
 "unit": "",
 "note": "All eight branches read out the version that secdb lists against CVE-2026-123158. Measured 18 November 2026."}
```

Only edge ships OpenSSH 10.6p2 itself; stable branches carry the fix as a backport on the version of OpenSSH they already shipped, so `ssh -V` still prints the older number after `apk upgrade`. The secdb file for each branch names the fixed version against `CVE-2026-123158` [5]; the current package in the branch's index on `dl-cdn.alpinelinux.org` matches that number [6].

## Two commands show where an Alpine host stands

```sh
# Installed version — compare against the table above.
apk info -v openssh-server 2>/dev/null
# PAM state. Empty output means PAM is not installed, so the bypass path applied before the patch.
apk info -q openssh-server-pam 2>/dev/null
# Accounts whose shadow field was the attacker's target.
# These are locked system accounts: login was never meant to work on them.
awk -F: '$2=="*" || $2=="!" || $2=="!!" {print $1}' /etc/shadow
```

To apply the fix: `apk update && apk upgrade openssh-server && rc-service sshd restart`. sshd must restart; running `sshd` processes run the old code until they do. A container image rebuild pulls the patched package on the next `apk add openssh-server` from a branch whose index now points at the fixed version [6].

Three settings make the bypass path unreachable without an upgrade. `PasswordAuthentication no` in `/etc/ssh/sshd_config` switches sshd to public keys only; a keyless home-lab host is the usual case for `yes`. Installing `openssh-server-pam` switches the authentication chain to PAM, which goes through glibc-style password handling even on musl. `UsePAM yes` then takes effect. Any one of the three closes the path the GHSA describes [3]; combined with the upgrade, they are belts around a belt.

## The research named it SSHole; CISA names it CVE-2026-123158

A password `openssl rand -base64 384 | tr -d '\n'` is 512 characters. On an unpatched Alpine sshd with a locked `root` account whose shadow field is `*`, that password logged in as root. The CWE is 394, Unexpected Status Code or Return Value [3] — the status code musl's crypt() returned (`*`) was mistaken for a hash.

Red Hat's advisory records the mechanism in one sentence: on Linux with musl and no PAM, "the SSH server can misinterpret input strings as password hashes" [7]. Red Hat Enterprise Linux and Fedora use glibc and ship PAM, so they are not affected [7]. The same is true of Debian, Ubuntu, Arch and openSUSE out of the box. The exposed hosts are the ones the GHSA names: Alpine, and musl builds on OpenWrt, Buildroot and Yocto [3].

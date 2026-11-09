{"title": "Magento PolyShell joins CISA's exploited list, seven months after the first attacks", "title_th": "ช่องโหว่ PolyShell ของ Magento เข้ารายชื่อช่องโหว่ที่ถูกโจมตีจริงของ CISA หลังการโจมตีครั้งแรก 7 เดือน", "date": "2026-10-28", "beat": "security",
 "dek": "CVE-2026-48356 lets anyone upload a PHP file to a Magento store through the guest cart. Attacks began in March; the fix for 2.4.8 and older came in July; CISA listed it on 27 October. Four checks find a break-in.",
 "dek_th": "CVE-2026-48356 เปิดให้ใครก็ได้อัปโหลดไฟล์ PHP เข้าร้าน Magento ผ่านตะกร้าสินค้าของผู้ใช้ที่ไม่ได้ล็อกอิน การโจมตีเริ่มตั้งแต่มีนาคม แพตช์สำหรับ 2.4.8 ลงไปออกเดือนกรกฎาคม และ CISA เพิ่งขึ้นบัญชีเมื่อ 27 ตุลาคม มีวิธีตรวจ 4 ข้อว่าร้านถูกเจาะหรือยัง",
 "cards": ["sec-hacked", "forensics", "php", "web-care"],
 "sources": [
  {"t": "CISA Adds Two Known Exploited Vulnerabilities to Catalog (27 October 2026)", "u": "https://www.cisa.gov/news-events/alerts/2026/10/27/cisa-adds-two-known-exploited-vulnerabilities-catalog"},
  {"t": "CISA Known Exploited Vulnerabilities catalog, JSON feed, version 2026.10.27", "u": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"},
  {"t": "Adobe Security Bulletin APSB26-73: Security update available for Adobe Commerce", "u": "https://www.adobe.com/trust/security/products/commerce/apsb26-73.html"},
  {"t": "Security update available for Adobe Commerce - APSB26-73 (Adobe Experience League, KA-37421)", "u": "https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-37421"},
  {"t": "NVD: CVE-2026-48356", "u": "https://nvd.nist.gov/vuln/detail/CVE-2026-48356"},
  {"t": "PolyShell: unrestricted file upload in Magento and Adobe Commerce (Sansec)", "u": "https://sansec.io/research/magento-polyshell"},
  {"t": "Mass PolyShell attack wave hits 471 stores in one hour (Sansec)", "u": "https://sansec.io/research/polyshell-mass-attack-wave"},
  {"t": "deepveindrilling.com: Magento CMS block loader hits 953 stores (Sansec)", "u": "https://sansec.io/research/magento-cms-block-loader-deepveindrilling"}],
 "card": {"big": "Magento PolyShell: patch, then look", "sub": "On CISA's exploited list since 27 October 2026"}}
---
On 27 October 2026 CISA (the US government's cybersecurity agency) added CVE-2026-48356 to its Known Exploited Vulnerabilities catalog, the list of flaws it has evidence attackers use [1]. The flaw, which the security firm Sansec named PolyShell, lets a stranger who has not logged in upload a file of their choosing to a Magento or Adobe Commerce shop [6]. Sansec recorded the first attacks on 19 March 2026 [6]. Read this morning, 28 October, Adobe's bulletin still says Adobe is "not aware of any exploits in the wild" [3].

Magento Open Source is the free shop software; Adobe Commerce is the paid edition of the same code. A CVE number is the public ID of one flaw. A webshell is a small program an attacker leaves on a server to run commands on it later.

## The guest cart accepts a PHP file dressed as a picture

Magento lets a product carry a "file" option, such as a logo for a printed mug. Its REST API (the address apps use to talk to the shop) takes that file inside a cart request, as base64 text with a name and a type, and writes it to `pub/media/custom_options/quote/` [6]. Two routes for guest carts, `POST /V1/guest-carts/:cartId/items` and `PUT /V1/guest-carts/:cartId/items/:itemId`, need no login. GraphQL, the shop's other API, takes a different path and is not affected [6].

Sansec lists three missing checks: the option ID is not matched to the product, the upload runs whether or not the product has a file option, and `.php`, `.phtml` and `.phar` names pass. The only test is whether the bytes start like an image, and a polyglot (a file that is a valid GIF and valid PHP at once) passes it [6]. Whether the uploaded PHP then runs depends on the web server: stock nginx setups for Magento 2.0 to 2.2, nginx configured to hand every `.php` request to PHP, and Apache before 2.3.5 without `php_flag engine 0` [6].

## Seven months from first attack to the exploited list

| Date (2026) | Event | Source |
|---|---|---|
| 17 March | Sansec publishes its warning | [6] |
| 19 March | First attacks seen | [6] |
| 30 March | 471 stores compromised in one hour | [7] |
| 14 April | Sansec: 82% of all stores hit with malicious uploads | [6] |
| 12 May | Magento 2.4.9 released; Sansec states it carries the fix | [6] |
| 14 July | APSB26-73 brings fixes to 2.4.4 to 2.4.9 | [3][6] |
| 24 October | Sansec ties the flaw to a skimmer campaign | [8] |
| 27 October | CISA adds CVE-2026-48356; US federal agencies must act by 10 November | [1][2] |

Between 12 May and 14 July, a shop on 2.4.8 or older had no fix from Adobe short of a move to 2.4.9 [6]. Sansec does not say which set of stores its 82% is a share of [6].

Adobe's bulletin rates the flaw Critical, priority 2, with a CVSS 3.1 score of 9.6 out of 10 [3]; NVD, the US vulnerability database, lists 9.3 with the same attack path but no harm to uptime [5]. Both mark it as needing no login [3][5]. The CISA feed marks ransomware use as unknown [2].

## A patched store can still carry the attacker

Patching closes the door; it does not remove what came through it. Sansec found an attacker's script in the content blocks of 83 stores in October, loaded from deepveindrilling.com, and counts 953 stores hit by the same operator since July 2025 [8]. The script lives in the database table `cms_block`, the static blocks Magento prints into shop pages, and keeps a copy of itself in the shopper's browser storage, so it runs again even when its home domain goes down [8]. On 23 October it began collecting details of each visitor's device and sending nothing to automated browsers, which hides it from many scanners [8]. Of 169 infected Magento 2 installs missing at least one core patch, 102 also held files uploaded through PolyShell or SessionReaper, an older Magento flaw fixed in APSB25-88 [8].

## Four checks, then the patch

Run these from the shop's root folder. The first two look for files, the third for the script in the database, the fourth for admin accounts you did not make [6][8].

```bash
find pub/media/custom_options/ pub/media/customer_address/ -type f ! -name '.htaccess'
find . -name 'accesson.php' -type f
```

Any `.php`, `.phtml` or `.phar` file in `pub/media/custom_options/` marks a break-in [6]. `accesson.php` is a backdoor the March attackers planted under `assets/images/` in many top folders (`app/`, `lib/`, `pub/`, `vendor/` and others) [6].

```sql
SELECT block_id, identifier, update_time FROM cms_block
WHERE content LIKE '%fpCode%' OR content LIKE '%se_referrer%'
   OR content LIKE '%localStorage.getItem%';
SELECT user_id, username, email, created FROM admin_user ORDER BY created DESC;
```

Run the first query on `cms_page` too, and add your table prefix if the shop uses one; `update_time` shows the attacker's last write [8]. If any check finds something, deleting the script is not the end: Sansec states the attacker keeps database access, and lists new database, admin and API integration passwords as the next step [8].

The patch: APSB26-73 ships a zip per version line, and each applies only to the newest security release of its line, so a shop first moves to 2.4.8-p5, 2.4.7-p10, 2.4.6-p15, 2.4.5-p17 or 2.4.4-p18 [4]. The bulletin fixes 14 flaws, not only this one, and its list of affected versions includes 2.4.9; the zip for 2.4.9 is `2-4-9-jul-2026.zip` [3][4]. On Adobe Commerce Cloud the fix also comes in the latest cloud-patches update, and Adobe notes that applying the isolated patch on top can make installation fail [4].

## Until the patch is in, block the upload folder

Sansec's server rules stop an uploaded PHP file from running; they do not stop the upload, which only a firewall rule on the API call itself does [6]. For nginx, placed before any `\.php$` block:

```nginx
location ~* ^/pub/media/custom_options/ {
    deny all;
    return 403;
}
```

For Apache, `pub/media/custom_options/.htaccess` holds:

```apache
<IfModule mod_php.c>
    php_flag engine 0
</IfModule>
Deny from all
```

On a hosted shop, the host or agency runs these steps; the questions to send them are the Magento version with its `-p` number, whether APSB26-73 is applied, and what the four checks returned.

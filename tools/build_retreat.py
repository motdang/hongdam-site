#!/usr/bin/env python3
"""Board retreat, five nights near Chiang Rai — a Hongdam minisite (her ask 2026-11-02: "a delightful hongdam minisite
that stirs up anticipation of how great the retreat will be. Lots of calls to action, few words").

    python3 tools/build_retreat.py      # docs/retreat/ and docs/th/retreat/, their sitemap and llms.txt blocks (RETREAT markers)
    node tools/retreat_card.mjs         # their link-preview pictures, docs/og/retreat-<lang>.jpg

Words, days, methods, afternoons, perks, months and prices: data/retreat.json. Photos: docs/retreat/img/<name>.webp
(wide ones also <name>-s.webp), their credits in docs/retreat/img/credits.json. Look: docs/assets/retreat.css after
shop.css and pond.css; moves: docs/assets/retreat.js after shop.js (which draws the dingbats, group p-retreat, and runs the
swan on the job line, the share button and the currency switch). The hold form posts to /api/contact, which puts the
question on the Team Wheel. The resort is not named until it agrees.
"""
import hashlib
import html
import json
import os
import re
import sys
import urllib.parse
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_shop as B  # noqa: E402
import seo  # noqa: E402

E = html.escape
HERE, DOCS, SITE = B.HERE, B.DOCS, B.SITE
D = json.load(open(os.path.join(HERE, "data", "retreat.json"), encoding="utf-8"))
LANGS, PATH, GROUP = D["langs"], D["path"], "p-retreat"
IMG = os.path.join(DOCS, PATH, "img")
_A = [os.path.join(DOCS, "assets", "retreat." + x) for x in ("css", "js")]
V = hashlib.sha1(b"".join(open(p, "rb").read() for p in _A if os.path.exists(p))).hexdigest()[:8]
CRED = os.path.join(IMG, "credits.json")
CREDITS = json.load(open(CRED, encoding="utf-8")) if os.path.exists(CRED) else []
BYNAME = {c["name"]: c for c in CREDITS}
USED = {D["hero"]["img"], "khom", "forage", "tea", "mekong", "balloon"} | {a["img"] for a in D["afternoons"]}
MONTHS = {"en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          "th": ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]}
MONTHS_LONG = {"en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
               "th": ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]}


def ui(lang):
    return D["ui"][lang]


def tr(d, lang):
    return (d.get(lang) or d["en"]) if isinstance(d, dict) else d


def baht(n):
    return "฿{:,}".format(n)


def line_link(text):
    return "https://line.me/R/oaMessage/%s/?%s" % (urllib.parse.quote(D["oa"]), urllib.parse.quote(text))


def mail_link(lang):
    u = ui(lang)
    return "mailto:%s?subject=%s&body=%s" % (B.MAIL, urllib.parse.quote(u["shareT"]), urllib.parse.quote(u["msgHold"] + "\n\n"))


_SIZES = {}


def size_of(name):
    """The photo's own width and height, so the page keeps its place while it loads."""
    if name not in _SIZES:
        f = os.path.join(IMG, name + ".webp")
        try:
            from PIL import Image
            with Image.open(f) as im:
                _SIZES[name] = im.size
        except Exception:
            _SIZES[name] = (1800, 1200)
    return _SIZES[name]


def share(lang):
    """Hongdam's share button (assets/share.js) with this page's own word."""
    u = ui(lang)
    return '<button class="share rt-btn rt-ghost" type="button" data-share="" data-t="%s" aria-label="%s">%s<span>%s</span></button>' % (
        E(u["shareT"]), E(u["share"]), B.SHARE_ICON, E(u["share"]))


def pic(name, sizes="100vw", cls="", alt="", eager=False):
    """A photo from docs/retreat/img: wide ones carry a 900 px copy for phones."""
    src = "/%simg/%s.webp" % (PATH, name)
    small = os.path.exists(os.path.join(IMG, name + "-s.webp"))
    w, h = size_of(name)
    srcset = ' srcset="/%simg/%s-s.webp 900w, %s 1800w" sizes="%s"' % (PATH, name, src, sizes) if small else ""
    return '<img%s src="%s"%s width="%d" height="%d" alt="%s"%s decoding="async">' % (
        ' class="%s"' % cls if cls else "", src, srcset, w, h, E(alt), "" if eager else ' loading="lazy"')


# ---------------------------------------------------------------- parts

def top(lang):
    langs = " ".join('<a href="%s" lang="%s" hreflang="%s" data-setlang="%s"%s>%s</a>' % (
        B.url(l, PATH), l, l, l, ' aria-current="true"' if l == lang else "", E(B.SHOP["lang_names"][l])) for l in LANGS)
    return ('<header class="top"><a class="brand" href="%s">%s<span class="wm">Hongdam</span> <span class="wm-th" lang="th">หงส์ดำ</span></a>'
            '<nav class="langs" aria-label="%s">%s</nav><a class="line" href="%s">LINE</a></header>\n'
            % (B.url(lang), B.db("hongsa", "mark", "loop"), E(B.SHOP["ui"][lang]["language"]), langs, line_link(ui(lang)["msgAsk"])))


def ctas(lang, see=True):
    u = ui(lang)
    out = ('<a class="rt-btn" href="#hold">%s</a> <a class="rt-btn rt-line" href="%s" data-hit="line" data-line="hold">%s</a> %s' % (
        E(u["hold"]), E(line_link(u["msgHold"])), E(u["line"]), share(lang)))
    if see:
        out += ' <a class="rt-btn rt-ghost" href="#nights">%s</a>' % E(u["see"])
    return '<p class="rt-cta">%s</p>\n' % out


def hero(lang):
    u = ui(lang)
    ducks = "".join('<button class="rt-duck" type="button" aria-label="duckling" style="--i:%d">%s</button>' % (i, B.db("duckling-float", play="loop")) for i in range(5))
    return ('<section class="rt-scene rt-hero" aria-labelledby="rt-h1" style="background-image:url(/%simg/%s-s.webp)">\n<div class="rt-bg">%s</div>\n'
            '<div class="rt-over">\n<p class="rt-kicker">%s</p>\n<h1 id="rt-h1"><span>%s</span> <span class="rt-b">%s</span></h1>\n'
            '<p class="rt-lede">%s</p>\n<p class="rt-pilot"><span class="rt-dot" aria-hidden="true"></span>%s</p>\n%s'
            '<div class="rt-pond"><button class="rt-swan" type="button" aria-label="Hongdam">%s</button>%s</div>\n</div>\n</section>\n' % (
                PATH, D["hero"]["img"], pic(D["hero"]["img"], eager=True), E(u["kicker"]), E(u["h1a"]), E(u["h1b"]), E(u["lede"]), E(u["pilot"]), ctas(lang),
                B.db("hongsa-float", play="loop"), ducks))


def nights(lang):
    u = ui(lang)
    line = B.job([d["g"] for d in D["days"]], lang, caps=[E(u["day"].replace("{n}", str(i + 1))) for i in range(len(D["days"]))], cls="rt-job")
    rows = ""
    for i, d in enumerate(D["days"]):
        parts = "".join('<li class="rt-k-%s"><b>%s</b> %s</li>' % (k, E(u[k]), E(tr(d[k], lang))) for k in ("dawn", "am", "pm", "eve") if d.get(k))
        msg = "%s %s · %s" % (u["msgDay"], u["day"].replace("{n}", str(i + 1)), tr(d["n"], lang))
        rows += ('<li class="rt-day" id="%s" style="--i:%d">\n<button class="rt-dh" type="button" aria-expanded="%s" aria-controls="%s-b">'
                 '<span class="rt-dg">%s</span><span class="rt-dn">%s</span><span class="rt-dt">%s</span></button>\n'
                 '<div class="rt-db" id="%s-b"%s><ul>%s</ul><a class="rt-want" href="%s" data-hit="line">%s</a></div>\n</li>\n' % (
                     d["id"], i, "true" if i == 0 else "false", d["id"], B.db(d["g"]), E(u["day"].replace("{n}", str(i + 1))), E(tr(d["n"], lang)),
                     d["id"], "" if i == 0 else " hidden", parts, E(line_link(msg)), E(u["want"])))
    return ('<section id="nights" class="rt-sec rt-paper">\n<h2>%s</h2>\n<p class="rt-sub">%s</p>\n%s<ol class="rt-thread">\n%s</ol>\n</section>\n' % (
        E(u["daysH"]), E(u["daysL"]), line, rows))


def mornings(lang):
    u = ui(lang)
    cards = ""
    for m in D["methods"]:
        cards += ('<li class="rt-m" id="m-%s"><button class="rt-mg" type="button" aria-label="%s">%s</button>'
                  '<p class="rt-mday">%s</p><h3>%s</h3><p class="rt-mr">%s</p><p class="rt-mf">%s</p></li>\n' % (
                      m["id"], E(tr(m["n"], lang)), B.db(m["g"]), E(u["dayN"].replace("{n}", str(m["day"]))), E(tr(m["n"], lang)),
                      E(tr(m["r"], lang)), E(tr(m["f"], lang))))
    steps = "".join('<li class="rt-tp" data-m="%d"><span class="rt-tpg">%s</span><b>%d %s</b><span>%s</span></li>' % (
        t["m"], B.db(t["g"]), t["m"], E(u["min"]), E(tr(t["t"], lang))) for t in D["troika"])
    toy = ('<div class="rt-troika rt-card" id="troika">\n<h3>%s</h3>\n<p class="rt-sub">%s</p>\n<div class="rt-clock" aria-live="polite">'
           '<span class="rt-swan2">%s</span><b class="rt-mm">12:00</b><span class="rt-now"></span></div>\n<ol class="rt-tps">%s</ol>\n'
           '<p class="rt-cta"><button class="rt-btn" type="button" data-troika="go">%s</button> <a class="rt-btn rt-ghost" href="#hold">%s</a></p>\n'
           '<p class="rt-done" hidden>%s</p>\n</div>\n' % (
               E(u["trH"]), E(u["trL"]), B.db("hongsa-stand", play="loop"), steps, E(u["start"]), E(u["hold"]), E(u["trDone"])))
    return ('<section class="rt-scene" id="mornings">\n<div class="rt-bg">%s</div>\n<div class="rt-over">\n<div class="rt-card rt-head"><h2>%s</h2><p class="rt-sub">%s</p></div>\n'
            '<ol class="rt-ms">\n%s</ol>\n%s</div>\n</section>\n' % (pic("khom"), E(u["amH"]), E(u["amL"]), cards, toy))


def afternoons(lang):
    u = ui(lang)
    tiles = ""
    for a in D["afternoons"]:
        c = BYNAME.get(a["img"], {})
        tiles += ('<li><button class="rt-pm" type="button" aria-pressed="false" data-id="%s" data-n="%s">%s'
                  '<span class="rt-pmg">%s</span><span class="rt-pmt"><b>%s</b><span>%s</span></span><span class="rt-tick" aria-hidden="true"></span></button></li>\n' % (
                      a["id"], E(tr(a["n"], lang)), pic(a["img"], sizes="(min-width: 46rem) 15rem, 45vw", alt=c.get("alt_" + lang) or tr(a["n"], lang)),
                      B.db(a["g"]), E(tr(a["n"], lang)), E(tr(a["l"], lang))))
    return ('<section class="rt-scene" id="afternoons">\n<div class="rt-bg">%s</div>\n<div class="rt-over">\n<div class="rt-card rt-head"><h2>%s</h2>'
            '<p class="rt-sub">%s</p><p class="rt-count" data-tpl="%s" aria-live="polite"></p></div>\n<ul class="rt-pms">\n%s</ul>\n%s</div>\n</section>\n' % (
                pic("forage"), E(u["pmH"]), E(u["pmL"]), E(u["picked"]), tiles, ctas(lang, see=False)))


def perks(lang):
    u = ui(lang)
    items = "".join('<li><button class="rt-perk" type="button" aria-pressed="false" data-id="%s" data-n="%s">%s<span>%s</span></button></li>\n' % (
        p["id"], E(tr(p["n"], lang)), B.db(p["g"]), E(tr(p["n"], lang))) for p in D["perks"])
    return ('<section class="rt-scene" id="perks">\n<div class="rt-bg">%s</div>\n<div class="rt-over">\n<div class="rt-card"><h2>%s</h2>\n<p class="rt-sub">%s</p>\n<ul class="rt-perks">\n%s</ul></div>\n'
            '<div class="rt-basket"><span class="rt-bk">%s</span><b class="rt-bn" data-tpl="%s" aria-live="polite"></b>'
            '<a class="rt-btn rt-line" href="%s" data-hit="line" data-basket="%s">%s</a></div>\n</div>\n</section>\n' % (
                pic("balloon"), E(u["perkH"]), E(u["perkL"]), items, B.db("kratip"), E(u["basket"]), E(line_link(u["msgBasket"])), E(u["msgBasket"]), E(u["sendBasket"])))


def when(lang):
    u = ui(lang)
    pads = ""
    for m in D["months"]:
        s = D["season"][m["s"]]
        closed = m["s"] == "smoke"
        pads += ('<li><button class="rt-mo rt-%s" type="button" data-m="%d" data-n="%s" aria-pressed="false"%s>%s<b>%s</b><span>%s</span></button></li>' % (
            m["s"], m["m"], E(MONTHS_LONG[lang][m["m"] - 1]), ' aria-disabled="true"' if closed else "", B.db(s["g"]),
            E(MONTHS[lang][m["m"] - 1]), E(s[lang])))
    return ('<section class="rt-scene" id="when">\n<div class="rt-bg">%s</div>\n<div class="rt-over">\n<div class="rt-card"><h2>%s</h2><p class="rt-sub">%s</p>'
            '<ol class="rt-months">%s</ol>\n<p class="rt-cta"><a class="rt-btn" href="#hold" data-month-cta="%s">%s</a></p></div>\n</div>\n</section>\n' % (
                pic("tea"), E(u["whenH"]), E(u["whenL"]), pads, E(u["hold"]), E(u["hold"])))


def where_price(lang):
    u, p = ui(lang), D["price"]
    facts = "".join('<li>%s<span>%s</span></li>' % (B.db(w["g"]), E(w[lang].replace("{usd}", "US$%d" % p["per_diem_usd"]))) for w in D["where"])
    rows = ""
    for k in ("np", "co"):
        rows += ('<li class="rt-lane"><p class="rt-ln">%s</p><p class="rt-amt"><span class="amt">%s</span></p>'
                 '<p class="rt-pl">%s: <span class="amt">%s</span></p></li>\n' % (E(u[k]), baht(p[k]), E(u["pilotP"]), baht(p[k + "_pilot"])))
    return ('<section id="where" class="rt-sec rt-paper">\n<h2>%s</h2>\n<ul class="rt-facts know">%s</ul>\n</section>\n'
            '<section id="price" class="rt-sec rt-paper">\n<h2>%s</h2>\n<p class="rt-sub">%s</p>\n<ul class="rt-lanes">\n%s</ul>\n'
            '<p class="rt-note">%s</p>\n<p class="rt-note">%s</p>\n%s</section>\n' % (
                E(u["whereH"]), facts, E(u["priceH"]), E(u["perBoard"]), rows,
                E(u["hotel"]).replace("{pp}", '<span class="amt">%s</span>' % baht(p["hotel_pp"])), E(u["shoup"]), ctas(lang, see=False)))


def form(lang):
    u = ui(lang)
    months = '<option value="">%s</option>' % E(u["any"]) + "".join(
        '<option value="%s">%s</option>' % (E(MONTHS_LONG[lang][m["m"] - 1]), E(MONTHS_LONG[lang][m["m"] - 1])) for m in D["months"] if m["s"] != "smoke")
    sizes = "".join('<option%s>%d</option>' % (" selected" if n == 10 else "", n) for n in range(8, 15))
    kinds = "".join('<label class="rt-kind"><input type="radio" name="kind" value="%s"%s><span>%s</span></label>' % (
        E(u[k]), " checked" if k == "np" else "", E(u[k])) for k in ("np", "co"))
    return ('<section class="rt-scene" id="hold">\n<div class="rt-bg">%s</div>\n<div class="rt-over">\n<form class="rt-card rt-form" id="rtf" novalidate>\n'
            '<h2>%s</h2>\n<p class="rt-sub">%s</p>\n'
            '<label class="rt-f"><span>%s</span><input name="contact" autocomplete="email" required></label>\n'
            '<div class="rt-row"><label class="rt-f"><span>%s</span><select name="month">%s</select></label>'
            '<label class="rt-f"><span>%s</span><select name="size">%s</select></label></div>\n'
            '<fieldset class="rt-f"><legend>%s</legend>%s</fieldset>\n'
            '<p class="rt-chosen" aria-live="polite"></p>\n'
            '<label class="rt-f"><span>%s</span><textarea name="note" rows="2"></textarea></label>\n'
            '<label class="rt-hp" aria-hidden="true">Website <input name="website" tabindex="-1" autocomplete="off"></label>\n'
            '<p class="rt-cta"><button class="rt-btn" type="submit">%s</button> <a class="rt-btn rt-line" href="%s" data-hit="line" data-line="hold">%s</a></p>\n'
            '<p class="rt-msg" role="status"></p>\n</form>\n</div>\n</section>\n' % (
                pic("mekong"), E(u["formH"]), E(u["formL"]), E(u["fContact"]), E(u["fMonth"]), months, E(u["fSize"]), sizes,
                E(u["fKind"]), kinds, E(u["fNote"]), E(u["send"]), E(line_link(u["msgHold"])), E(u["line"])))


def credit_line(c):
    lic = '<a href="%s">%s</a>' % (E(c["license_url"]), E(c["license"])) if c.get("license_url") else E(c.get("license", ""))
    return '<li><a href="%s">%s</a>: %s, %s</li>' % (E(c["source_url"]), E(c.get("subject") or c["name"]), E(c.get("author", "")), lic)


def end(lang):
    u = ui(lang)
    more = "".join("<li>%s</li>" % E(x) for x in u["more"])
    creds = "".join(credit_line(c) for c in CREDITS if c["name"] in USED)
    return ('<section class="rt-sec rt-end" id="end">\n<h2>%s</h2>\n<p class="rt-cta"><a class="rt-btn rt-line" href="%s" data-hit="line">%s</a> '
            '<a class="rt-btn" href="%s">%s</a> %s</p>\n'
            '<details><summary>%s</summary><ul class="know">%s</ul></details>\n'
            '<details><summary>%s</summary><p>%s</p></details>\n'
            '<details><summary>%s</summary><p>%s</p></details>\n'
            '<details><summary>%s</summary><ul class="rt-creds">%s</ul><p>%s</p></details>\n</section>\n' % (
                E(u["endH"]), E(line_link(u["msgAsk"])), E(u["line"]), E(mail_link(lang)), E(u["email"]), share(lang),
                E(u["moreH"]), more, E(u["billH"]), E(u["bill"]), E(u["langH"]), E(u["lang"]), E(u["credH"]), creds, E(D["credits_methods"][lang])))


# ---------------------------------------------------------------- page

def head(lang):
    u, p = ui(lang), D["price"]
    here = SITE + B.url(lang, PATH)
    alts = "".join('<link rel="alternate" hreflang="%s" href="%s%s">\n' % (l, SITE, B.url(l, PATH)) for l in LANGS)
    og = "og/retreat-%s.jpg" % lang
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "@id": here, "url": here, "name": u["title"], "description": u["desc"], "inLanguage": lang,
         "isPartOf": {"@id": SITE + "/#site"}},
        {"@type": "Service", "name": u["shareT"], "description": u["desc"], "areaServed": "Chiang Rai, Thailand",
         "provider": {"@type": "Organization", "name": "Hongdam", "alternateName": "หงส์ดำ", "url": SITE + "/",
                      "parentOrganization": {"@type": "Organization", "name": "motdang.net Co., Ltd."}},
         "offers": [{"@type": "Offer", "name": u[k], "price": p[k], "priceCurrency": "THB", "url": here} for k in ("np", "co")]}]}
    return ('<!doctype html>\n<html lang="%s">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<meta name="color-scheme" content="light dark">\n<title>%s</title>\n<meta name="description" content="%s">\n'
            '<link rel="canonical" href="%s">\n%s<link rel="alternate" hreflang="x-default" href="%s%s">\n<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">\n'
            '<link rel="stylesheet" href="/assets/shop.css?v=%s">\n%s\n<link rel="stylesheet" href="/assets/retreat.css?v=%s">\n'
            '<link rel="preload" as="image" href="/%simg/%s-s.webp" media="(max-width: 900px)">\n'
            '<meta property="og:type" content="website">\n<meta property="og:site_name" content="Hongdam หงส์ดำ">\n<meta property="og:locale" content="%s">\n'
            '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:url" content="%s">\n'
            '<meta property="og:image" content="%s/%s">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            '<meta property="og:image:alt" content="%s">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="%s/%s">\n'
            '<meta name="theme-color" content="#F1EDE4" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">\n'
            '<script type="application/ld+json">%s</script>\n</head>\n' % (
                lang, E(u["title"]), E(u["desc"]), here, alts, SITE, B.url("en", PATH), B.CSS_V, B.POND_CSS, V, PATH, D["hero"]["img"],
                seo.LOCALE[lang], E(u["title"]), E(u["desc"]), here, SITE, og, E(u["cardAlt"]), SITE, og,
                json.dumps(ld, ensure_ascii=False).replace("</", "<\\/")))


def foot(lang):
    u = ui(lang)
    data = {"lang": lang, "oa": D["oa"], "ui": {k: u[k] for k in (
        "sending", "sent", "fail", "needContact", "msgHold", "msgBasket", "msgPerks", "msgPm", "msgMonth", "msgSize", "msgKind", "start", "stop", "trDone", "hold", "shareT")},
        "troika": [t["m"] for t in D["troika"]], "service": "Board retreat, five nights"}
    j = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    f = B.foot(lang, group=GROUP, pay=False)
    return f.replace("</body>", '<script type="application/json" id="rt">%s</script>\n<script type="module" src="/assets/retreat.js?v=%s"></script>\n</body>' % (j, V))


def page(lang):
    out = head(lang) + '<body class="rt">\n' + top(lang)
    out += hero(lang) + '<main id="main">\n' + nights(lang) + mornings(lang) + afternoons(lang) + perks(lang) + when(lang)
    out += where_price(lang) + form(lang) + end(lang) + '</main>\n'
    return out + foot(lang)


def check():
    bad = []
    for lang in LANGS:
        for k in ui("en"):
            if k not in ui(lang):
                bad.append("%s: no %s" % (lang, k))
    names = {D["hero"]["img"], "khom", "forage", "tea", "mekong", "balloon"} | {a["img"] for a in D["afternoons"]}
    for n in sorted(names):
        if not os.path.exists(os.path.join(IMG, n + ".webp")):
            bad.append("no photo docs/%simg/%s.webp" % (PATH, n))
        if n not in BYNAME:
            bad.append("no credit for %s in docs/%simg/credits.json" % (n, PATH))
    for c in CREDITS:
        for f in ("source_url", "author", "license"):
            if not c.get(f):
                bad.append("credit %s has no %s" % (c.get("name"), f))
    if bad:
        print("retreat: " + "\n  ".join([""] + sorted(set(bad))), file=sys.stderr)
        if "--draft" not in sys.argv:
            raise SystemExit(1)


def sitemap():
    """docs/sitemap.xml between RETREAT markers: each language's page with the others as alternates."""
    p = os.path.join(DOCS, "sitemap.xml")
    xml = open(p, encoding="utf-8").read()
    was = dict(re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml))
    alts = "".join('    <xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>\n' % (l, SITE, B.url(l, PATH)) for l in LANGS)
    alts += '    <xhtml:link rel="alternate" hreflang="x-default" href="%s%s"/>\n' % (SITE, B.url("en", PATH))
    rows = []
    for l in LANGS:
        loc = SITE + B.url(l, PATH)
        day = date.today().isoformat() if (B.pre(l) + PATH + "index.html") in B.CHANGED or loc not in was else was[loc]
        rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n%s  </url>\n" % (loc, day, alts))
    block = "<!-- RETREAT:START -->\n" + "".join(rows) + "  <!-- RETREAT:END -->"
    if "<!-- RETREAT:START -->" in xml:
        a, b = xml.index("<!-- RETREAT:START -->"), xml.index("<!-- RETREAT:END -->") + len("<!-- RETREAT:END -->")
        xml = xml[:a] + block + xml[b:]
    else:
        i = xml.rindex("</urlset>")
        xml = xml[:i] + "  " + block + "\n" + xml[i:]
    open(p, "w", encoding="utf-8").write(xml)


def llms():
    """docs/llms.txt between RETREAT markers, beside the Black Swan block."""
    p = os.path.join(DOCS, "llms.txt")
    s = open(p, encoding="utf-8").read()
    u, pr = ui("en"), D["price"]
    days = "; ".join("%s: %s" % (tr(d["n"], "en"), ", ".join(x for x in (tr(d.get(k, ""), "en") for k in ("dawn", "am", "pm", "eve")) if x))
                     for d in D["days"])
    block = ("<!-- RETREAT:START -->\n## Board retreat: five nights near Chiang Rai\n\n"
             "- [%s](%s%s): %s Days: %s. Prices for one board: %s for nonprofits and foundations, %s for companies; "
             "the pilot board pays %s or %s. Rooms and meals are billed by the resort, about %s a person for five nights. "
             "No retreats in the smoke season (March to May). Hold dates or ask: LINE %s, %s, or the form on the page. Also: %s\n<!-- RETREAT:END -->" % (
                 u["title"], SITE, B.url("en", PATH), u["desc"], days, baht(pr["np"]), baht(pr["co"]), baht(pr["np_pilot"]),
                 baht(pr["co_pilot"]), baht(pr["hotel_pp"]), D["oa"], B.MAIL,
                 " · ".join("%s %s%s" % (B.SHOP["lang_names"][l], SITE, B.url(l, PATH)) for l in LANGS[1:])))
    if "<!-- RETREAT:START -->" in s:
        a, b = s.index("<!-- RETREAT:START -->"), s.index("<!-- RETREAT:END -->") + len("<!-- RETREAT:END -->")
        s = s[:a] + block + s[b:]
    else:
        anchor = next((m for m in ("<!-- BLACKSWAN:START -->", "<!-- QUESTIONS:START -->", "<!-- SERVICES:START -->") if m in s), None)
        s = s.replace(anchor, block + "\n\n" + anchor, 1) if anchor else s.rstrip("\n") + "\n\n" + block + "\n"
    open(p, "w", encoding="utf-8").write(s)


def main():
    check()
    for lang in LANGS:
        B.write(B.pre(lang) + PATH + "index.html", page(lang))
    sitemap()
    llms()
    print("retreat: %d pages, %d photos credited, assets v=%s" % (len(LANGS), len(CREDITS), V))
    return 0


if __name__ == "__main__":
    sys.exit(main())

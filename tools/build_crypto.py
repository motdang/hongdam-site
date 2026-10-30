#!/usr/bin/env python3
"""Crypto safety: plan for worse — a Hongdam Studio minisite (her ask 2026-10-30, the day after the Binance theft:
"a minisite tailored uniquely … paid service on hongdam, link from offrampt to hongdam, link from hongdam to offrampt";
"plan for something even worse than that").

    python3 tools/build_crypto.py      # the pages, five languages, with the sitemap and llms.txt blocks
    node tools/crypto_card.mjs         # their link-preview pictures, docs/og/studio/crypto-<lang>.jpg

Reads data/studio/crypto.json (the news of the day with sources, the eight steps, five questions, the service lines,
how we work) and data/shop.json (the cards crypto-safe and crypto-team, their options and prices). Writes
docs/<lang>/studio/crypto-safety/. Look: docs/assets/crypto.css; the questions: docs/assets/crypto.js. Dingbats: the
fix group's bundle (the cards' own category).
"""
import hashlib
import html
import json
import os
import re
import sys
from datetime import date
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_shop as B  # noqa: E402
import build_studio as S  # noqa: E402

E = html.escape
HERE, DOCS, SITE = B.HERE, B.DOCS, B.SITE
D = json.load(open(os.path.join(HERE, "data", "studio", "crypto.json"), encoding="utf-8"))
LANGS = D["langs"]
PATH = D["path"]
GROUP = "fix"
_A = [os.path.join(DOCS, "assets", "crypto." + x) for x in ("css", "js")]
V = hashlib.sha1(b"".join(open(p, "rb").read() for p in _A if os.path.exists(p))).hexdigest()[:8]
CARDS = {c["id"]: c for c in B.SHOP["cards"] if c["id"] in D["cards"]}


def ui(lang):
    return D["ui"][lang]


def tr(d, lang):
    return d.get(lang) or d["en"] if isinstance(d, dict) else d


def host(u):
    return urlparse(u).netloc.replace("www.", "")


def src(u, lang):
    return ' <a class="cs-src" href="%s" rel="noopener">%s · %s</a>' % (E(u), E(ui(lang)["src"]), E(host(u)))


def options():
    """(card, option) for every option on the page's cards, in order."""
    return [(CARDS[cid], o) for cid in D["cards"] for o in CARDS[cid]["opts"]]


def opt_name(c, o, lang):
    return tr(o["n"], lang) if o.get("n") else tr(c["n"], lang)


# ---------------------------------------------------------------- parts

def hero(lang):
    u = ui(lang)
    gloss = "".join('<div><dt>%s</dt><dd>%s</dd></div>' % (E(a), E(b)) for a, b in u["gloss"])
    return ('<div class="s-room">\n%s<section class="s-hero s-wrap cs-hero">\n<p class="s-kicker">%s</p>\n<h1>%s</h1>\n<p class="s-lede">%s</p>\n'
            '<dl class="cs-gloss">%s</dl>\n<p class="s-cta"><a class="s-btn" href="%s">%s</a> <a class="s-btn alt" href="#ladder">%s</a></p>\n'
            '<button class="s-swan" type="button" aria-label="Hongdam">%s</button>\n</section>\n</div>\n' % (
                S.bar(lang), E(u["kicker"]), E(u["h1"]), E(u["lede"]), gloss, E(B.url(lang, "buy/?c=crypto-safe")), E(u["btnBuy"]),
                E(u["btnLadder"]), B.db("hongsa", play="loop")))


def today(lang):
    u = ui(lang)
    rows = "".join('<li>%s%s</li>\n' % (E(tr(x["t"], lang)), src(x["src"], lang)) for x in D["today"])
    return ('<section id="today" class="s-wrap"><h2 class="s-h">%s</h2>\n<p class="s-sub">%s</p>\n<ul class="cs-today">\n%s</ul></section>\n' % (
        E(u["todayH"]), E(u["todaySub"]), rows))


def ladder(lang):
    u = ui(lang)
    rows = ""
    for i, r in enumerate(D["rungs"], 1):
        rows += ('<li class="cs-rung" style="--i:%d"><b class="cs-n">%d</b><div><h3>%s</h3><p>%s%s</p></div></li>\n' % (
            i, i, E(tr(r["n"], lang)), E(tr(r["l"], lang)), src(r["src"], lang) if r.get("src") else ""))
    off = tr(D["offrampt"], lang)
    return ('<section id="ladder" class="s-wrap"><h2 class="s-h">%s</h2>\n<p class="s-sub">%s</p>\n<ol class="cs-ladder">\n%s</ol>\n'
            '<a class="cs-off" href="%s"><span><b>%s</b> %s</span><span class="s-go">%s</span></a>\n</section>\n' % (
                E(u["ladderH"]), E(u["ladderSub"]), rows, E(off), E(u["offH"]), E(u["offL"]), E(u["offBtn"])))


def check(lang):
    u = ui(lang)
    qs = ""
    for i, q in enumerate(D["questions"]):
        qs += ('<li class="cs-q" data-on="%s" data-svc="%s"><p>%s</p><span class="cs-yn">'
               '<button type="button" data-a="yes" aria-pressed="false">%s</button><button type="button" data-a="no" aria-pressed="false">%s</button>'
               '</span></li>\n' % (q["on"], q["svc"], E(tr(q["q"], lang)), E(u["yes"]), E(u["no"])))
    names = {o["i"]: (c, o) for c, o in options()}
    picks = "".join('<li data-svc="%s" hidden><a href="#svc-%s">%s</a></li>' % (
        q["svc"], q["svc"], E(opt_name(*names[q["svc"]], lang))) for q in D["questions"])
    return ('<section id="check" class="s-wrap"><h2 class="s-h">%s</h2>\n<p class="s-sub">%s</p>\n<ol class="cs-qs">\n%s</ol>\n'
            '<div class="cs-result" aria-live="polite" hidden><h3>%s</h3><ul>%s</ul><p class="cs-none" hidden>%s</p>'
            '<button class="cs-again" type="button">%s</button></div>\n</section>\n' % (
                E(u["checkH"]), E(u["checkSub"]), qs, E(u["resultH"]), picks, E(u["resultNone"]), E(u["again"])))


def services(lang):
    u = ui(lang)
    btn = B.SHOP["ui"][lang]["buy"]
    rows = ""
    for c, o in options():
        price = B.opt_price(o, lang)[0]
        rows += ('<li class="s-row" id="svc-%s"><a href="%s"><span class="s-rn">%s</span><span class="s-rl">%s</span>'
                 '<span class="s-rp">%s</span><span class="s-go">%s</span></a></li>\n' % (
                     o["i"], E(B.url(lang, "buy/?c=" + c["id"])), E(opt_name(c, o, lang)), E(tr(D["svc"][o["i"]], lang)), price, E(btn)))
    return ('<section id="services" class="s-wrap"><h2 class="s-h">%s</h2>\n<p class="s-sub">%s</p>\n<ul class="s-svc">\n%s</ul></section>\n' % (
        E(u["svcH"]), E(u["svcSub"]), rows))


def how(lang):
    rows = "".join('<li>%s%s</li>\n' % (E(tr(x["t"], lang)), src(x["src"], lang) if x.get("src") else "") for x in D["how"])
    return '<section id="how" class="s-wrap"><h2 class="s-h">%s</h2>\n<ul class="cs-how">\n%s</ul></section>\n' % (E(ui(lang)["howH"]), rows)


def talk(lang):
    u = ui(lang)
    return ('<section id="talk" class="s-room cs-talk"><div class="s-wrap"><h2 class="s-h">%s</h2><p class="s-sub">%s</p>'
            '<p class="s-cta"><a class="s-btn line" href="%s">LINE</a> <a class="s-btn alt" href="mailto:%s">%s</a></p></div></section>\n' % (
                E(u["talkH"]), E(u["talkL"]), B.LINE_URL, B.MAIL, E(u["email"])))


def ld(lang):
    u = ui(lang)
    here = SITE + "/" + B.pre(lang) + PATH
    offers = []
    for c, o in options():
        it = B.ITEMS.get(o["i"], {})
        if "baht" in it:
            offers.append({"@type": "Offer", "name": opt_name(c, o, lang), "price": it["baht"], "priceCurrency": "THB",
                           "url": SITE + B.url(lang, "buy/?c=" + c["id"]), "availability": "https://schema.org/InStock"})
    return [S.org_ld(),
            {"@type": "WebPage", "@id": here, "url": here, "name": u["title"], "description": u["desc"], "inLanguage": lang,
             "datePublished": D["asof"], "isPartOf": {"@id": SITE + "/#site"}, "publisher": {"@id": SITE + "/studio/#org"}},
            {"@type": "Service", "name": u["h1"], "description": u["desc"], "provider": {"@id": SITE + "/studio/#org"},
             "areaServed": ["Chiang Rai", "Chiang Mai", "Thailand"], "url": here,
             "offers": {"@type": "AggregateOffer", "offerCount": len(offers), "priceCurrency": "THB",
                        "lowPrice": min(x["price"] for x in offers), "offers": offers}}]


def head(lang):
    u = ui(lang)
    alts = {l: B.pre(l) + PATH for l in LANGS}
    out = S.head(lang, u["title"], u["desc"], B.pre(lang) + PATH, alts, og="og/studio/crypto-%s.jpg" % lang, og_alt=u["cardAlt"],
                 ld=ld(lang), kind="article")
    return out.replace("</head>", '<link rel="stylesheet" href="/assets/crypto.css?v=%s">\n</head>' % V)


def foot(lang):
    f = B.foot(lang, group=GROUP)
    return f.replace("</body>", '<script type="module" src="/assets/studio.js?v=%s"></script>\n<script type="module" src="/assets/crypto.js?v=%s"></script>\n</body>' % (S.V_JS, V))


def page(lang):
    out = head(lang) + '<body class="studio cs">\n' + S.top(lang, [(l, B.url(l, PATH)) for l in LANGS])
    out += hero(lang) + '<main id="main">\n' + today(lang) + ladder(lang) + check(lang) + services(lang) + how(lang) + talk(lang) + '</main>\n'
    return out + foot(lang)


def band(lang):
    """The link on the Studio front page (tools/build_studio.py front())."""
    u = ui(lang)
    return ('<section class="s-wrap cs-band"><a class="cs-off" href="%s"><span><b>%s</b> %s</span><span class="s-go">%s</span></a></section>\n' % (
        B.url(lang, PATH), E(u["band"]), E(u["bandSub"]), E(u["bandGo"])))


# ---------------------------------------------------------------- sitemap, llms.txt

def _swap(text, tag, block, anchor_fn):
    a_, b_ = "<!-- %s:START -->" % tag, "<!-- %s:END -->" % tag
    if a_ in text:
        return text[:text.index(a_)] + block + text[text.index(b_) + len(b_):]
    return anchor_fn(text, block)


def sitemap():
    p = os.path.join(DOCS, "sitemap.xml")
    xml = open(p, encoding="utf-8").read()
    was = dict(re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml))
    alts = "".join('    <xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>\n' % (l, SITE, B.url(l, PATH)) for l in LANGS)
    alts += '    <xhtml:link rel="alternate" hreflang="x-default" href="%s%s"/>\n' % (SITE, B.url("en", PATH))
    rows = []
    for l in LANGS:
        loc = SITE + B.url(l, PATH)
        day = date.today().isoformat() if (B.pre(l) + PATH + "index.html") in B.CHANGED or loc not in was else was[loc]
        rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>daily</changefreq>\n%s  </url>\n" % (loc, day, alts))
    block = "<!-- CRYPTO:START -->\n" + "".join(rows) + "  <!-- CRYPTO:END -->"
    xml = _swap(xml, "CRYPTO", block, lambda t, b: t[:t.rindex("</urlset>")] + "  " + b + "\n" + t[t.rindex("</urlset>"):])
    open(p, "w", encoding="utf-8").write(xml)


def llms():
    p = os.path.join(DOCS, "llms.txt")
    s = open(p, encoding="utf-8").read()
    u = ui("en")
    svc = "; ".join("%s (%s%s)" % (opt_name(c, o, "en"), SITE, B.url("en", "buy/?c=" + c["id"])) for c, o in options())
    block = ("<!-- CRYPTO:START -->\n## Crypto safety: plan for worse\n\n- [%s](%s%s): %s The news of %s with sources, eight steps from a "
             "paused exchange to a family that cannot reach the coins, five questions, and the services: %s. The exchange board and "
             "calculator: https://offrampt.net/frozen/. Also: %s\n<!-- CRYPTO:END -->" % (
                 u["title"], SITE, B.url("en", PATH), u["desc"], D["asof"], svc,
                 " · ".join("%s %s%s" % (B.SHOP["lang_names"][l], SITE, B.url(l, PATH)) for l in LANGS[1:])))

    def anchor(t, b):
        a = "<!-- BLACKSWAN:START -->" if "<!-- BLACKSWAN:START -->" in t else "<!-- SERVICES:START -->"
        return t.replace(a, b + "\n\n" + a, 1) if a in t else t.rstrip("\n") + "\n\n" + b + "\n"
    open(p, "w", encoding="utf-8").write(_swap(s, "CRYPTO", block, anchor))


def check_data():
    bad = []
    for lang in LANGS:
        for k, v in ui("en").items():
            if k not in ui(lang):
                bad.append("%s: no %s" % (lang, k))
        for x in D["today"] + D["how"]:
            if lang not in x["t"]:
                bad.append("%s: %s" % (lang, x["t"]["en"][:40]))
        for x in D["rungs"]:
            if lang not in x["n"] or lang not in x["l"]:
                bad.append("%s: step %s" % (lang, x["n"]["en"]))
        for x in D["questions"]:
            if lang not in x["q"]:
                bad.append("%s: question %s" % (lang, x["svc"]))
    for cid in D["cards"]:
        if cid not in CARDS:
            bad.append("no card %s in data/shop.json" % cid)
    on_page = {o["i"] for c, o in options()} if len(CARDS) == len(D["cards"]) else set()
    for q in D["questions"]:
        if on_page and q["svc"] not in on_page:
            bad.append("question points at %s, not an option on the cards" % q["svc"])
    for i in on_page:
        for lang in LANGS:
            if lang not in D["svc"].get(i, {}):
                bad.append("%s: no line for %s" % (lang, i))
    if bad:
        raise SystemExit("data/studio/crypto.json:\n  " + "\n  ".join(sorted(set(bad))))


def main():
    check_data()
    for lang in LANGS:
        B.write(B.pre(lang) + PATH + "index.html", page(lang))
    sitemap()
    llms()
    print("crypto safety: %d pages · %d services" % (len(LANGS), len(options())))
    return 0


if __name__ == "__main__":
    sys.exit(main())

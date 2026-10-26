#!/usr/bin/env python3
"""DJ, meet the company — a Hongdam Studio minisite for DJ, NaN's advisor (her ask 2026-10-26: "a portfolio and
introduction to the company for her, as my trusted advisor"; DJ "admires simplicity in design and universality. Not a fan
of reading lots of words").

    python3 tools/build_dj.py          # the pages, English and Thai
    node tools/dj_card.mjs             # their link-preview pictures

Reads data/studio/dj.json (words, the four names, the work, the crew, the papers), data/studio/counts.json
(tools/studio_counts.py: Mot Dang pages, public repositories) and data/shop.json (the services in the shop). The Visa
Desk's services are counted from chiangmaivisadesk.com when the build runs; data/studio/dj.counts.json keeps the last
count for a build without the network. Writes docs/studio/dj/ and docs/th/studio/dj/. The pages are noindex and stay
out of the sitemap and llms.txt: a page for one person. Thumbnails: docs/studio/dj/img/<name>.webp, each site's own
link-preview picture. Dingbats: group p-dj (tools/dingbats.mjs).
"""
import datetime
import hashlib
import html
import json
import os
import re
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_shop as B  # noqa: E402
import build_studio as S  # noqa: E402

E = html.escape
HERE, DOCS, SITE = B.HERE, B.DOCS, B.SITE
D = json.load(open(os.path.join(HERE, "data", "studio", "dj.json"), encoding="utf-8"))
LANGS = D["langs"]
PATH = D["path"]
GROUP = "p-dj"
_A = [os.path.join(DOCS, "assets", "dj." + x) for x in ("css", "js")]
V = hashlib.sha1(b"".join(open(p, "rb").read() for p in _A if os.path.exists(p))).hexdigest()[:8]
_CF = os.path.join(HERE, "data", "studio", "dj.counts.json")


def ui(lang):
    return D["ui"][lang]


def tr(d, lang):
    return d.get(lang) or d["en"] if isinstance(d, dict) else d


def href(h, lang):
    """A link on hongdam.net goes to the same page in the reader's language."""
    return B.url(lang, h.lstrip("/")) if h.startswith("/") else h


# ---------------------------------------------------------------- counts

def cmvd_services():
    """The service cards on chiangmaivisadesk.com's front page (its #services section)."""
    req = urllib.request.Request("https://chiangmaivisadesk.com/", headers={"User-Agent": "hongdam-build"})
    page = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "replace")
    i = page.index('id="services"')
    return page[i:page.index("</section>", i)].count('<article class="card')


def counts():
    last = json.load(open(_CF, encoding="utf-8")) if os.path.exists(_CF) else {}
    try:
        n = cmvd_services()
        if n:
            last = {"cmvd": n, "day": datetime.date.today().isoformat()}
            json.dump(last, open(_CF, "w", encoding="utf-8"), indent=1)
            open(_CF, "a").write("\n")
    except Exception as e:   # no network: the last count
        print("  visa desk not read (%s); using %s from %s" % (e, last.get("cmvd"), last.get("day")))
    if not last.get("cmvd"):
        raise SystemExit("no count of Visa Desk services: run once with the network")
    return {"motdang": S.COUNTS["motdang"], "repos": S.COUNTS["repos"], "cmvd": last["cmvd"],
            "services": sum(1 for c in B.SHOP["cards"] if B.ready(c))}


# ---------------------------------------------------------------- parts

def iso(nm, n, lang):
    """One Isotype row: one picture for every `per` of the count, the last one cut to what is left."""
    per = nm["per"]
    whole, rest = divmod(n, per)
    part = round(rest / per, 1)
    pics = B.db(nm["iso"]) * whole
    if part >= .1:
        pics += '<span class="dj-part" style="--f:%s">%s</span>' % (part, B.db(nm["iso"]))
    unit = tr(nm["u"], lang)
    label = "%s %s · %s = %s %s" % (S.num(n, lang), unit, "1", S.num(per, lang), unit)
    return ('<div class="dj-iso" role="img" aria-label="%s">%s</div>\n'
            '<p class="dj-count"><b>%s</b> %s <span class="dj-key">%s = %s</span></p>\n' % (
                E(label), pics, S.num(n, lang), E(unit), B.db(nm["iso"]), S.num(per, lang)))


def names(lang, c):
    u = ui(lang)
    out = '<section id="names" class="s-wrap"><h2 class="s-h">%s</h2>\n<ol class="dj-names">\n' % E(u["namesH"])
    for nm in D["names"]:
        name, other = tr(nm["n"], lang), nm["n"]["en" if lang != "en" else "th"]
        alt = ' <span class="dj-alt" lang="%s">%s</span>' % ("en" if lang != "en" else "th", E(other)) if other != name else ""
        out += ('<li class="dj-name" id="%s" style="--h:%d">\n<p class="dj-v">%s</p>\n'
                '<button class="dj-big" type="button" aria-label="%s">%s</button>\n<h3>%s%s</h3>\n<p class="dj-l">%s</p>\n%s'
                '<p class="dj-go"><a href="%s">%s →</a></p></li>\n' % (
                    nm["id"], nm["hue"], E(tr(nm["v"], lang)), E(name), B.db(nm["glyph"], play="loop"), E(name), alt,
                    E(tr(nm["l"], lang)), iso(nm, c[nm["count"]], lang), E(href(nm["href"], lang)), E(nm["host"])))
    out += '</ol>\n<p class="dj-co">%s <a href="https://motdang.net/sites/motdang/">%s →</a></p>\n</section>\n' % (E(u["company"]), E(u["companyA"]))
    return out


def tile(w, lang):
    return ('<li><a class="dj-w" href="%s"><img src="/%simg/%s.webp" width="720" height="378" loading="lazy" decoding="async" alt="%s">'
            '<span class="dj-wt"><span class="dj-wn">%s</span><span class="dj-wl">%s</span><span class="s-host">%s</span></span></a></li>\n' % (
                E(href(w["href"], lang)), PATH, w["img"], E(tr(w["alt"], lang)), E(tr(w["n"], lang)), E(tr(w["l"], lang)), E(w["host"])))


def work(lang):
    return ('<section id="work" class="s-wrap"><h2 class="s-h">%s</h2>\n<ul class="dj-tiles">\n%s</ul></section>\n' % (
        E(ui(lang)["workH"]), "".join(tile(w, lang) for w in D["work"])))


def crew(lang):
    u = ui(lang)
    rows = ""
    for p in D["crew"]:
        rows += ('<li class="dj-p%s"><button class="dj-pg" type="button" aria-label="%s">%s</button><b>%s</b><span>%s</span>%s</li>\n' % (
            " you" if p.get("you") else "", E(tr(p["who"], lang)), B.db(p["glyph"], play="loop"), E(tr(p["who"], lang)), E(tr(p["r"], lang)),
            '<em>%s</em>' % E(u["you"]) if p.get("you") else ""))
    return '<section id="crew" class="s-wrap"><h2 class="s-h">%s</h2>\n<ul class="dj-crew">\n%s</ul></section>\n' % (E(u["crewH"]), rows)


def papers(lang):
    return ('<section id="papers" class="s-wrap"><h2 class="s-h">%s</h2>\n<ul class="dj-tiles dj-three">\n%s</ul></section>\n' % (
        E(ui(lang)["papersH"]), "".join(tile(w, lang) for w in D["papers"])))


def talk(lang):
    u = ui(lang)
    return ('<section id="talk" class="s-room dj-talk"><div class="s-wrap"><h2 class="s-h">%s</h2><p class="s-sub">%s</p>'
            '<p class="s-cta"><a class="s-btn line" href="%s">LINE</a> <a class="s-btn alt" href="mailto:%s">%s</a></p></div></section>\n' % (
                E(u["talkH"]), E(u["talkL"]), B.LINE_URL, B.MAIL, E(u["email"])))


def hero(lang):
    u = ui(lang)
    gloss = "".join('<div><dt>%s</dt><dd><span lang="th">%s</span> = %s</dd></div>' % (E(a), E(b), E(c)) for a, b, c in u["gloss"])
    return ('<div class="s-room">\n%s<section class="s-hero s-wrap dj-hero">\n<p class="s-kicker">%s</p>\n<h1>%s</h1>\n<p class="s-lede">%s</p>\n'
            '<dl class="dj-gloss">%s</dl>\n<p class="s-cta"><a class="s-btn" href="#work">%s</a> <a class="s-btn alt" href="mailto:%s">%s</a></p>\n'
            '<button class="s-swan" type="button" aria-label="Hongdam">%s</button>\n</section>\n</div>\n' % (
                S.bar(lang), E(u["kicker"]), E(u["h1"]), E(u["lede"]), gloss, E(u["seeWork"]), B.MAIL, E(u["write"]), B.db("hongsa", play="loop")))


def head(lang):
    u = ui(lang)
    alts = {l: B.pre(l) + PATH for l in LANGS}
    here = SITE + "/" + B.pre(lang) + PATH
    ld = [S.org_ld(), {"@type": "WebPage", "@id": here, "url": here, "name": u["title"], "description": u["desc"], "inLanguage": lang,
                       "isPartOf": {"@id": SITE + "/#site"}, "publisher": {"@id": SITE + "/studio/#org"},
                       "about": {"@type": "Organization", "name": "motdang.net Co., Ltd.", "alternateName": "บริษัท มดแดง.เน็ท จำกัด",
                                 "url": "https://motdang.net/sites/motdang/"}}]
    out = S.head(lang, u["title"], u["desc"], B.pre(lang) + PATH, alts, og="og/studio/dj-%s.jpg" % lang, og_alt=u["cardAlt"], ld=ld)
    out = out.replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n<meta name="viewport"', 1)
    return out.replace("</head>", '<link rel="stylesheet" href="/assets/dj.css?v=%s">\n</head>' % V)


def foot(lang):
    f = B.foot(lang, group=GROUP, pay=False)
    return f.replace("</body>", '<script type="module" src="/assets/studio.js?v=%s"></script>\n<script type="module" src="/assets/dj.js?v=%s"></script>\n</body>' % (S.V_JS, V))


def page(lang, c):
    out = head(lang) + '<body class="studio dj">\n' + S.top(lang, [(l, B.url(l, PATH)) for l in LANGS])
    out += hero(lang) + '<main id="main">\n' + names(lang, c) + work(lang) + crew(lang) + papers(lang) + talk(lang) + '</main>\n'
    return out + foot(lang)


def check():
    bad = []
    for lang in LANGS:
        for k in ui("en"):
            if k not in ui(lang):
                bad.append("%s: no %s" % (lang, k))
        for w in D["work"] + D["papers"]:
            for f in ("n", "l", "alt"):
                if lang not in w[f]:
                    bad.append("%s: %s has no %s" % (lang, w["img"], f))
            if not os.path.exists(os.path.join(DOCS, PATH, "img", w["img"] + ".webp")):
                bad.append("no picture docs/%simg/%s.webp" % (PATH, w["img"]))
    if bad:
        raise SystemExit("data/studio/dj.json:\n  " + "\n  ".join(sorted(set(bad))))


def main():
    check()
    c = counts()
    for lang in LANGS:
        B.write(B.pre(lang) + PATH + "index.html", page(lang, c))
    print("dj: %d pages · Mot Dang %s pages · %s services · Visa Desk %s · %s repositories" % (
        len(LANGS), c["motdang"], c["services"], c["cmvd"], c["repos"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())

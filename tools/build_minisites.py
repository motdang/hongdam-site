#!/usr/bin/env python3
"""Build a minisite for each service that has one in data/minisites/<card id>.json (her ask 2026-10-24: big pages for
the top 25 services, modest pages for the rest; plan go/hongdam-minisites-plan).

    python3 tools/build_minisites.py [id ...]

Writes docs/<prefix><category>/<card id>/index.html for English, Thai, Burmese, Chinese and German. Names, prices,
options and the job line come from data/shop.json and data/services.json through tools/build_shop.py, so a page shows
what the shop sells at the shop's price; the page file adds the words around them. Every fact, number and outside
price carries its source address. A page file:

  {"id": "<card id>", "tier": "big" | "modest",
   "n": {lang: name}, "l": {lang: line}      (optional: the card's own words otherwise; German lives here until the shop has it)
   "why": {lang: one line under the name},
   "pic": {"src": "/assets/m/<file>", "credit": "...", "href": "<source page>", "alt": {lang}},       (big: the fixed picture)
   "pic2": {...}                              (big: a second fixed picture, with "say": {lang} over it)
   "slab": [{"n": "฿800,000", "t": {lang}, "src": url}],                                              (big: numbers)
   "toy": {"js": "/assets/m/<id>.js", "h": {lang}, "html": {lang} | "", "noscript": {lang}},       (big: the try-it panel)
   "steps": [{"db": "<dingbat>", "t": {lang}, "who": {lang}, "time": {lang}}],
   "facts": [{"t": {lang}, "src": url}],
   "costs": [{"t": {lang}, "p": {lang}, "src": url}],
   "faq": [{"q": {lang}, "a": {lang}, "src": url}],
   "proof": [{"t": {lang}, "href": url, "img": "/assets/screens/<x>.webp"}],
   "related": ["<card id>", ...],
   "out": [{"t": {lang}, "href": url}],
   "read": "2026-10-24"}
"""
import glob
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_shop as B  # noqa: E402  (loads the shop: SHOP, ITEMS, LOOKS, prices, dingbat lines)

E = html.escape
HERE = B.HERE
DOCS = B.DOCS
SITE = B.SITE
MUI = json.load(open(os.path.join(HERE, "data", "minisite_ui.json"), encoding="utf-8"))
LANGS = MUI["langs"]
CARDS = {c["id"]: c for c in B.SHOP["cards"]}
CATS = {c["id"]: c for c in B.SHOP["cats"]}
PAGES = {}
for f in sorted(glob.glob(os.path.join(HERE, "data", "minisites", "*.json"))):
    p = json.load(open(f, encoding="utf-8"))
    PAGES[p["id"]] = p

# German joins the shop's words for the frame (header, footer, prices) until data/shop.json carries it.
# Where the shop has its own German (branch de-lang), the shop's words win; these fill only the gaps.
_de = B.SHOP["ui"].setdefault("de", {})
for _k, _v in list(B.SHOP["ui"]["en"].items()) + list(MUI["de_shop"].items()):
    if _k not in _de or (_k in MUI["de_shop"] and _de.get(_k) == B.SHOP["ui"]["en"].get(_k)):
        _de[_k] = _v
for u, (one, many) in MUI["de_units"].items():
    if u in B.SHOP["units"]:
        B.SHOP["units"][u]["one"].setdefault("de", one)
        B.SHOP["units"][u]["many"].setdefault("de", many)
B.SHOP["lang_names"].update(MUI["lang_names"])


def t(d, lang):
    return B.tr(d, lang) if d else ""


def pre(lang):
    return "" if lang == "en" else lang + "/"


def href(lang, path=""):
    return "/" + pre(lang) + path


def path_of(cid):
    return "%s/%s/" % (CARDS[cid]["cat"], cid)


def name(cid, lang):
    """The shop's name for the card; the page file's own only where the shop has none in this language."""
    c, p = CARDS[cid]["n"], PAGES.get(cid, {}).get("n") or {}
    return c.get(lang) or p.get(lang) or t(c, lang)


def line(cid, lang):
    c, p = CARDS[cid]["l"], PAGES.get(cid, {}).get("l") or {}
    return c.get(lang) or p.get(lang) or t(c, lang)


def mu(lang, k, **kw):
    s = MUI["m"][lang].get(k) or MUI["m"]["en"][k]
    for a, b in kw.items():
        s = s.replace("{%s}" % a, b)
    return s


def src_link(u, lang):
    from urllib.parse import quote, urlsplit
    host = urlsplit(u).netloc.removeprefix("www.")
    return ' <a class="src" href="%s" target="_blank" rel="noopener" title="%s">%s</a>' % (E(quote(u, safe=":/?=&#%~+,;@!$*'()")), E(mu(lang, "src")), E(host))


def text(s):
    """Escaped running text with each baht and US$ amount in its money mark."""
    return B.mark_money(E(s))


# ---------------------------------------------------------------------------------------------------- frame
def head(lang, cid, title, desc, og):
    path = path_of(cid)
    alts = "".join('<link rel="alternate" hreflang="%s" href="%s%s">\n' % (l, SITE, href(l, path)) for l in LANGS)
    alts += '<link rel="alternate" hreflang="x-default" href="%s%s">\n' % (SITE, href("en", path))
    loc = MUI["locale"]
    ogl = '<meta property="og:locale" content="%s">\n' % loc[lang] + "".join('<meta property="og:locale:alternate" content="%s">\n' % loc[l] for l in LANGS if l != lang)
    alt = "Hongdam หงส์ดำ · %s · hongdam.net" % title
    return ('<!doctype html>\n<html lang="%s">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<meta name="color-scheme" content="light dark">\n<title>%s</title>\n<meta name="description" content="%s">\n'
            '<link rel="canonical" href="%s%s">\n%s<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">\n'
            '<link rel="stylesheet" href="/assets/shop.css?v=%s">\n<link rel="stylesheet" href="/assets/minisite.css?v=%s">\n'
            '<meta property="og:type" content="website">\n<meta property="og:site_name" content="Hongdam หงส์ดำ">\n%s'
            '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:url" content="%s%s">\n'
            '<meta property="og:image" content="%s/%s">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            '<meta property="og:image:type" content="image/jpeg">\n<meta property="og:image:alt" content="%s">\n'
            '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="%s">\n<meta name="twitter:description" content="%s">\n'
            '<meta name="twitter:image" content="%s/%s">\n<meta name="twitter:image:alt" content="%s">\n'
            '<meta name="theme-color" content="#F1EDE4" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">\n'
            '%s</head>\n'
            % (lang, E(title), E(desc), SITE, href(lang, path), alts, B.CSS_V, CSS_M, ogl, E(title), E(desc), SITE, href(lang, path),
               SITE, og, E(alt), E(title), E(desc), SITE, og, E(alt), ld(lang, cid, title, desc, og)))


def top(lang, cid):
    path = path_of(cid)
    ui = B.SHOP["ui"][lang]
    langs = " ".join('<a href="%s" lang="%s" hreflang="%s" data-setlang="%s"%s>%s</a>' % (
        href(l, path), l, l, l, ' aria-current="true"' if l == lang else "", E(MUI["lang_names"][l])) for l in LANGS)
    return ('<header class="top"><a class="brand" href="%s">%s<span class="wm">Hongdam</span> <span class="wm-th" lang="th">หงส์ดำ</span></a>'
            '<nav class="langs" aria-label="%s">%s</nav><a class="line" href="%s">LINE</a></header>\n'
            % (href(lang), B.db("hongsa", "mark", "loop"), E(ui["language"]), langs, B.LINE_URL))


def foot(lang, cid):
    ui = B.SHOP["ui"][lang]
    cat = CARDS[cid]["cat"]
    data = {"lang": lang, "langs": LANGS, "front": False, "home": href(lang), "lineUrl": B.LINE_URL, "ui": ui,
            "cardsUrl": "/assets/shop-%s.json?v=%s" % (lang if lang in B.LANGS else "en", B.VERSION),
            "group": cat, "ladder": B.LADDER, "track": B.LOOKS["track"], "master": B.LOOKS["master"],
            "glyphs": {g: B.glyph_name(g, lang) for g in B.LOOKS["glyphs"]}}
    if B.DBM:
        data["db"] = {"core": "/assets/db/" + B.DBM["core"], "groups": {g: "/assets/db/" + f for g, f in B.DBM["groups"].items()}}
    j = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    rate = ""
    if lang in ("my", "zh", "de"):
        rate = ('<form id="rate" class="rate"><p>%s</p><p><button type="button" class="btn alt" data-score="good">%s</button> '
                '<button type="button" class="btn alt" data-score="better">%s</button></p>\n'
                '<div hidden><label class="field">%s<textarea name="text" rows="3" maxlength="2000"></textarea></label>'
                '<button class="btn" type="submit">%s</button></div><p class="thanks" role="status" hidden>%s</p></form>\n'
                % tuple(E(ui[k]) for k in ("rateQ", "rateGood", "rateBetter", "rateText", "rateSend", "rateThanks")))
    return rate + ('<footer><p>%s</p><p>%s · <a href="mailto:%s">%s</a> · <a href="%s">LINE @964yxgnk</a></p>'
                   '<p><a href="%s">%s</a> · <a href="/portfolio/">%s</a> · <a href="/llms.txt">llms.txt</a></p></footer>\n'
                   '<script type="application/json" id="shop">%s</script>\n<script type="module" src="/assets/shop.js"></script>\n'
                   '<script type="module" src="/assets/minisite.js?v=%s"></script>\n'
                   % (E(ui["payMethods"]), E(ui["where"]), B.MAIL, B.MAIL, B.LINE_URL, href(lang), E(mu(lang, "all")), E(ui["portfolio"]), j, JS_M))


# ---------------------------------------------------------------------------------------------------- search markup
def ld(lang, cid, title, desc, og):
    c, p = CARDS[cid], PAGES[cid]
    here = SITE + href(lang, path_of(cid))
    cat = CATS[c["cat"]]
    svc = {"@type": "Service", "@id": here + "#service", "name": name(cid, lang), "description": line(cid, lang),
           "provider": {"@type": "Organization", "@id": SITE + "/#org", "name": "Hongdam", "url": SITE + "/"},
           "areaServed": ["Chiang Rai", "Chiang Mai", "Thailand"], "url": here, "image": SITE + "/" + og,
           "serviceType": t(cat["n"], "en")}
    offers = [x for x in (offer(lang, c, o) for o in c.get("opts", [])) if x]
    if len(offers) == 1:
        svc["offers"] = offers[0]
    elif offers:
        svc["offers"] = {"@type": "AggregateOffer", "offerCount": len(offers), "offers": offers}
        thb = [x["price"] for x in offers if x["priceCurrency"] == "THB"]
        if thb:
            svc["offers"].update(lowPrice=min(thb), highPrice=max(thb), priceCurrency="THB")
    g = [svc, {"@type": "WebPage", "@id": here, "url": here, "name": title, "description": desc, "inLanguage": lang,
               "mainEntity": {"@id": here + "#service"},
               "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [
                   {"@type": "ListItem", "position": 1, "name": "Hongdam", "item": SITE + href(lang)},
                   {"@type": "ListItem", "position": 2, "name": t(cat["n"], lang), "item": SITE + href(lang, cat["id"] + "/")},
                   {"@type": "ListItem", "position": 3, "name": name(cid, lang), "item": here}]}}]
    if p.get("faq"):
        g.append({"@type": "FAQPage", "@id": here + "#faq", "mainEntity": [
            {"@type": "Question", "name": t(f["q"], lang), "acceptedAnswer": {"@type": "Answer", "text": t(f["a"], lang)}} for f in p["faq"]]})
    j = json.dumps({"@context": "https://schema.org", "@graph": g}, ensure_ascii=False, separators=(",", ":"))
    return '<script type="application/ld+json">%s</script>\n' % j.replace("</", "<\\/")


def offer(lang, c, o):
    try:
        _, n, cur = B.opt_price(o, lang)
    except SystemExit:
        return None
    if cur == "USD":
        n = (o.get("price") or {}).get("usd")
    if n is None or cur == "PCT":
        return None
    of = {"@type": "Offer", "price": n, "priceCurrency": "USD" if cur == "USD" else "THB", "url": SITE + href(lang, "buy/?c=" + c["id"]),
          "availability": "https://schema.org/InStock"}
    if o.get("n"):
        of["name"] = t(o["n"], lang)
    return of


# ---------------------------------------------------------------------------------------------------- page parts
def buttons(lang, cid, cls=""):
    go, btn = B.go_of(CARDS[cid], lang if lang in B.LANGS else "en")
    if lang not in B.LANGS and go.startswith("/"):
        go = "/" + go.lstrip("/")   # German has no Buy page yet; the English one takes the order
    return '<p class="acts%s"><a class="btn big-cta" href="%s">%s</a> <a class="btn alt" href="%s">%s</a></p>\n' % (
        (" " + cls) if cls else "", E(go), E(B.SHOP["ui"][lang]["buy"] if CARDS[cid]["act"] == "buy" else btn), B.LINE_URL, E(mu(lang, "line")))


def price_line(lang, cid):
    c = CARDS[cid]
    return '<p class="m-price"><span class="k">%s</span> <b>%s</b></p>\n' % (E(mu(lang, "today")), B.card_price(c, lang))


def options(lang, cid):
    c = CARDS[cid]
    rows = []
    for o in c.get("opts", []):
        try:
            ph, _, _ = B.opt_price(o, lang)
        except SystemExit:
            continue
        it = B.ITEMS.get(o["i"], {})
        d = it.get("d_" + lang) if lang in ("en", "th") else ""
        rows.append('<li><span class="on">%s</span><b>%s</b>%s</li>' % (E(t(o.get("n") or c["n"], lang)), ph, '<span class="d">%s</span>' % E(d) if d else ""))
    walk = '<details class="ladder" data-svc="%s" hidden></details>' % E(B.walks(c)) if B.walks(c) else ""
    return '<section class="m-get"><h2>%s</h2><ul class="opts">%s</ul>%s%s</section>\n' % (E(mu(lang, "get")), "".join(rows), walk, buttons(lang, cid))


def steps(lang, p):
    if not p.get("steps"):
        return ""
    s = p["steps"]
    caps = []
    for x in s:
        sub = " · ".join(E(t(x[k], lang)) for k in ("who", "time") if x.get(k) and t(x[k], lang))
        caps.append("%s%s" % (E(t(x["t"], lang)), ("<i>%s</i>" % sub) if sub else ""))
    line_ = B.job([x["db"] for x in s], lang, caps=caps, cls="big steps")
    def sub(x):
        bits = [E(t(x[k], lang)) for k in ("who", "time") if x.get(k) and t(x[k], lang)]
        return "<span>%s</span>" % " · ".join(bits) if bits else ""
    lis = "".join('<li><b>%s</b>%s</li>' % (E(t(x["t"], lang)), sub(x)) for x in s)
    return '<section class="m-how"><h2>%s</h2>%s<ol class="howlist">%s</ol></section>\n' % (E(mu(lang, "how")), line_, lis)


def facts(lang, p):
    if not p.get("facts"):
        return ""
    return '<section class="m-facts"><h2>%s</h2><ul>%s</ul></section>\n' % (
        E(B.SHOP["ui"][lang].get("know") or B.SHOP["ui"]["en"]["know"]), "".join("<li>%s%s</li>" % (text(t(f["t"], lang)), src_link(f["src"], lang)) for f in p["facts"]))


def costs(lang, cid, p):
    if not p.get("costs"):
        return ""
    rows = "".join('<tr><th scope="row">%s</th><td>%s%s</td></tr>' % (text(t(k["t"], lang)), text(t(k["p"], lang)), src_link(k["src"], lang)) for k in p["costs"])
    rows += '<tr class="ours"><th scope="row">%s · %s</th><td>%s</td></tr>' % (E(mu(lang, "ours")), E(name(cid, lang)), B.card_price(CARDS[cid], lang))
    return '<section class="m-costs"><h2>%s</h2><table>%s</table></section>\n' % (E(mu(lang, "others")), rows)


def faq(lang, p):
    if not p.get("faq"):
        return ""
    return '<section class="m-faq"><h2>%s</h2>%s</section>\n' % (E(mu(lang, "asks")), "".join(
        '<details><summary>%s</summary><p>%s%s</p></details>' % (E(t(f["q"], lang)), text(t(f["a"], lang)), src_link(f["src"], lang) if f.get("src") else "")
        for f in p["faq"]))


def related(lang, cid, p):
    ids = [r for r in p.get("related", []) if r in CARDS and r != cid]
    if not ids:
        return ""
    lis = []
    for r in ids:
        c = CARDS[r]
        own = MUI.get("own_pages", {}).get(r)
        to = ("/" + own) if own else href(lang, path_of(r)) if r in PAGES else href(lang if lang in B.LANGS else "en", c["cat"] + "/") + "#" + r
        lis.append('<li class="card" style="--line:var(--c-%s)">%s<h3><a href="%s">%s</a></h3><p class="price">%s</p><p class="l">%s</p></li>' % (
            E(c["cat"]), B.job(B.pic_of(c), lang), E(to), E(name(r, lang)), B.card_price(c, lang), E(line(r, lang))))
    cat = CATS[CARDS[cid]["cat"]]
    more = '<p class="more"><a href="%s">%s →</a></p>' % (href(lang if lang in B.LANGS else "en", cat["id"] + "/"), E(mu(lang, "cat", cat=t(cat["n"], lang))))
    return '<section class="m-rel"><h2>%s</h2><ul class="cards rel">%s</ul>%s</section>\n' % (E(mu(lang, "related")), "".join(lis), more)


def elsewhere(lang, p):
    if not p.get("out"):
        return ""
    return '<section class="m-out"><h2>%s</h2><ul>%s</ul></section>\n' % (E(mu(lang, "elsewhere")), "".join(
        '<li><a href="%s"%s>%s</a></li>' % (E(o["href"]), ' target="_blank" rel="noopener"' if o["href"].startswith("http") else "", E(t(o["t"], lang))) for o in p["out"]))


def small(lang, cid, p):
    bits = []
    if B.walks(CARDS[cid]) or any(B.walk_of(o)[0] for o in CARDS[cid].get("opts", [])):
        bits.append("<p>%s</p>" % E(mu(lang, "walk")))
    for k in ("pic", "pic2"):
        if p.get(k):
            bits.append('<p>%s: <a href="%s" target="_blank" rel="noopener">%s</a></p>' % (E(mu(lang, "pics")), E(p[k]["href"]), E(p[k]["credit"])))
    if p.get("read"):
        bits.append("<p>%s</p>" % E(mu(lang, "read", date=p["read"])))
    return '<details class="m-small"><summary>%s</summary>%s</details>\n' % (E(mu(lang, "small")), "".join(bits)) if bits else ""


def bar(lang, cid):
    """The Buy button that stays at the foot of a phone screen."""
    c = CARDS[cid]
    go, _ = B.go_of(c, lang if lang in B.LANGS else "en")
    return '<div class="m-bar" hidden><span class="n">%s</span><b>%s</b><a class="btn" href="%s">%s</a></div>\n' % (
        E(name(cid, lang)), B.card_price(c, lang), E(go), E(B.SHOP["ui"][lang]["buy"]))


# ---------------------------------------------------------------------------------------------------- big parts
def picture(p, k, lang, inner=""):
    x = p.get(k)
    if not x:
        return ""
    return ('<div class="m-pic" style="--pic:url(%s)"><div class="m-pin" role="img" aria-label="%s"></div>%s</div>\n'
            % (E(x["src"]), E(t(x.get("alt"), lang)), inner))


def slab(lang, p):
    if not p.get("slab"):
        return ""
    return '<section class="m-slab" aria-label="%s"><ul>%s</ul></section>\n' % (E(mu(lang, "numbers")), "".join(
        '<li><b>%s</b><span>%s%s</span></li>' % (text(s["n"] if isinstance(s["n"], str) else t(s["n"], lang)), E(t(s["t"], lang)), src_link(s["src"], lang)) for s in p["slab"]))


def loc(o, lang):
    """A toy's data in one language: every {lang: words} becomes the words."""
    if isinstance(o, dict):
        if "en" in o and set(o) <= set(LANGS):
            return t(o, lang)
        return {k: loc(v, lang) for k, v in o.items()}
    if isinstance(o, list):
        return [loc(v, lang) for v in o]
    return o


def toy(lang, p):
    x = p.get("toy")
    if not x:
        return ""
    c = CARDS[p["id"]]
    kind = x.get("kind", "event")
    data = loc(x.get("data", {}), lang)
    data["lang"] = lang
    data["L"] = dict(MUI.get(kind, {}).get(lang) or MUI.get(kind, {}).get("en", {}), buy=B.SHOP["ui"][lang]["buy"], line=mu(lang, "line"))
    for k, v in (x.get("labels") or {}).items():   # a page's own words for a toy row ("Kind of event" where "Ceremony" reads wrong)
        data["L"][k] = t(v, lang)
    o = c["opts"][0]
    it = B.ITEMS.get(o["i"], {})
    go, _ = B.go_of(c, lang if lang in B.LANGS else "en")
    data["ours"] = {"n": it.get("baht", 0), "live": o["i"], "buy": go, "line": B.LINE_URL}
    j = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return ('<section class="m-toy" id="try"><h2>%s</h2><h3>%s</h3><div class="toy" data-kind="%s" data-v="%s"><noscript><p>%s</p></noscript></div>'
            '<script type="application/json" id="toy-data">%s</script></section>\n'
            % (E(mu(lang, "try")), E(t(x["h"], lang)), E(kind), TOY_V.get(kind, "1"), E(t(x.get("noscript"), lang)), j))


def proof(lang, p):
    if not p.get("proof"):
        return ""
    return '<section class="m-proof"><h2>%s</h2><ul>%s</ul></section>\n' % (E(mu(lang, "proof")), "".join(
        '<li><a href="%s"%s>%s<span>%s</span></a></li>' % (E(x["href"]), ' target="_blank" rel="noopener"' if x["href"].startswith("http") else "",
                                                       '<img src="%s" alt="" loading="lazy" width="580" height="408">' % E(x["img"]) if x.get("img") else "", E(t(x["t"], lang)))
        for x in p["proof"]))


def glyphs_of(cid):
    """Three of the service's own doodle dingbats for its picture: the page file's "glyphs", else its steps', else the card's line."""
    p, c = PAGES[cid], CARDS[cid]
    gs = p.get("glyphs") or [s["db"] for s in p.get("steps", []) if s.get("db")] or B.pic_of(c)
    out = []
    for gname in gs:
        if gname not in out and gname not in ("done", "check"):
            out.append(gname)
    return (out or B.pic_of(c))[:3]


def glyph_box(cid, lang, cls="m-glyphs"):
    """The page's picture until a drawn one comes: its dingbats large on the category's colour; each plays when tapped."""
    gs = glyphs_of(cid)
    alt = ", ".join(B.glyph_name(g, lang) for g in gs)
    return '<figure class="%s" role="img" aria-label="%s">%s</figure>' % (cls, E(alt), "".join(
        '<span class="g g%d">%s</span>' % (i, B.db(g, play="loop" if i == 0 else "still")) for i, g in enumerate(gs)))


# ---------------------------------------------------------------------------------------------------- links in
def links():
    """Every service page in docs/sitemap.xml (MINISITES block, each language with its hreflang alternates) and in
    docs/llms.txt (MINISITES block: one line per service with its line, its price and its addresses in the other
    languages). The blocks sit between MINISITES markers; everything else in both files is kept as it is."""
    import re as _re
    from datetime import date
    today = date.today().isoformat()
    ids = [cid for cid in PAGES if cid in CARDS and cid not in MUI.get("own_pages", {})]
    # sitemap
    sp = os.path.join(DOCS, "sitemap.xml")
    xml = open(sp, encoding="utf-8").read()
    was = dict(_re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml))
    rows = []
    for cid in ids:
        path = path_of(cid)
        alts = "".join('    <xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>\n' % (l, SITE, href(l, path)) for l in LANGS)
        alts += '    <xhtml:link rel="alternate" hreflang="x-default" href="%s%s"/>\n' % (SITE, href("en", path))
        for l in LANGS:
            loc = SITE + href(l, path)
            day = today if (pre(l) + path + "index.html") in B.CHANGED or loc not in was else was[loc]
            rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n%s  </url>\n" % (loc, day, alts))
    block = "<!-- MINISITES:START -->\n" + "".join(rows) + "  <!-- MINISITES:END -->"
    if "<!-- MINISITES:START -->" in xml:
        a, b = xml.index("<!-- MINISITES:START -->"), xml.index("<!-- MINISITES:END -->") + len("<!-- MINISITES:END -->")
        xml = xml[:a] + block + xml[b:]
    else:
        xml = xml.replace("</urlset>", "  " + block + "\n</urlset>")
    open(sp, "w", encoding="utf-8").write(xml)
    # llms.txt
    lp = os.path.join(DOCS, "llms.txt")
    txt = open(lp, encoding="utf-8").read()
    lines = ["<!-- MINISITES:START -->", "## The service pages", "",
             "One page per service, in English, Thai, Burmese, Chinese and German: what you get and its price, how it goes, "
             "facts and what others charge with their sources, and the questions people ask. %d pages." % len(ids), ""]
    for cat in B.SHOP["cats"]:
        here = [cid for cid in ids if CARDS[cid]["cat"] == cat["id"]]
        if not here:
            continue
        lines.append("### " + t(cat["n"], "en"))
        for cid in here:
            price = _re.sub(r"<[^>]+>", "", B.card_price(CARDS[cid], "en"))
            where = " · ".join("%s %s%s" % (MUI["lang_names"][l], SITE, href(l, path_of(cid))) for l in LANGS[1:])
            lines.append("- [%s](%s%s) — %s %s. Also: %s" % (name(cid, "en"), SITE, href("en", path_of(cid)), line(cid, "en"), price, where))
        lines.append("")
    block = "\n".join(lines).rstrip("\n") + "\n<!-- MINISITES:END -->"
    if "<!-- MINISITES:START -->" in txt:
        a, b = txt.index("<!-- MINISITES:START -->"), txt.index("<!-- MINISITES:END -->") + len("<!-- MINISITES:END -->")
        txt = txt[:a] + block + txt[b:]
    else:
        txt = txt.replace("<!-- SERVICES:START -->", block + "\n\n<!-- SERVICES:START -->", 1)
    open(lp, "w", encoding="utf-8").write(txt)
    return len(ids)


# ---------------------------------------------------------------------------------------------------- pages
def page(lang, cid):
    c, p = CARDS[cid], PAGES[cid]
    cat = CATS[c["cat"]]
    nm = name(cid, lang)
    big = p.get("tier") == "big"
    title = "%s · Hongdam" % nm
    desc = t(p.get("why"), lang) or line(cid, lang)
    og = "og/s/%s.jpg" % cid
    out = head(lang, cid, title, desc, og)
    out += '<body class="p-m %s" style="--line:var(--c-%s)">\n' % ("m-big" if big else "m-modest", c["cat"]) + top(lang, cid)
    crumbs = '<p class="back"><a href="%s">%s</a> / <a href="%s">%s</a></p>\n' % (
        href(lang if lang in B.LANGS else "en"), E(mu(lang, "all")), href(lang if lang in B.LANGS else "en", cat["id"] + "/"), E(t(cat["n"], lang)))
    drawn = ('<figure class="m-draw"><img src="%s" alt="%s" width="520" height="630"></figure>' % (E(p["draw"]["src"]), E(t(p["draw"].get("alt"), lang)))) if p.get("draw") else glyph_box(cid, lang)
    # a title never breaks inside a word: in spaced scripts its longest word sets how small it may go
    longest = max((len(w) for w in nm.split()), default=0) if lang in ("en", "de") else 0
    fit = ' style="font-size:calc(clamp(2.4rem, 11vw, 4.4rem) * %.2f)"' % (11 / longest) if longest > 11 else ""
    hero = ('<div class="m-hero-in">%s<h1%s>%s</h1>%s%s<p class="lede">%s</p>%s%s%s</div>'
            % (crumbs, fit, E(nm), '<p class="m-th" lang="th">%s</p>' % E(t(c["n"], "th")) if lang != "th" else "", drawn, E(desc),
               price_line(lang, cid), buttons(lang, cid), B.job(B.pic_of(c), lang, cls="big")))
    out += "<main>\n"
    if big and p.get("pic"):
        out += '<section class="m-hero has-pic">%s</section>\n' % picture(p, "pic", lang, hero)
    elif big:
        # until its drawn picture comes: a full-width band of the service's dingbats on its colour, the name card over it
        hero_b = hero.replace(glyph_box(cid, lang), "", 1)
        out += '<section class="m-hero has-pic"><div class="m-gband">%s%s</div></section>\n' % (glyph_box(cid, lang, "m-gbig"), hero_b)
    else:
        out += '<section class="m-hero">%s</section>\n' % hero
    if big:
        out += slab(lang, p) + toy(lang, p) + steps(lang, p)
        if p.get("pic2"):
            out += '<section class="m-band">%s</section>\n' % picture(p, "pic2", lang, '<p class="say">%s</p>' % text(t(p["pic2"].get("say"), lang)))
        out += options(lang, cid) + costs(lang, cid, p) + facts(lang, p) + faq(lang, p) + proof(lang, p)
    else:
        out += options(lang, cid) + steps(lang, p) + facts(lang, p) + costs(lang, cid, p) + faq(lang, p)
    out += related(lang, cid, p) + elsewhere(lang, p) + small(lang, cid, p) + "</main>\n" + bar(lang, cid) + foot(lang, cid)
    return out + "</body>\n</html>\n"


def own_glyphs(cat):
    """The glyphs the category's own set draws: docs/assets/db/<group>.js registers each with X.add("name", ...)."""
    import re as _re
    if not B.DBM or cat not in B.DBM["groups"]:
        return set()
    fn = os.path.join(DOCS, "assets", "db", B.DBM["groups"][cat].split("?")[0])
    return set(_re.findall(r'\.add\("([a-z0-9-]+)"', open(fn, encoding="utf-8").read())) if os.path.exists(fn) else set()


def needed(html, cat):
    import re as _re
    return sorted(set(_re.findall(r'<doodle-dingbat[^>]* name="([a-z0-9-]+)"', html)) - own_glyphs(cat))


def main(argv):
    global CSS_M, JS_M
    import hashlib
    CSS_M = hashlib.sha1(open(os.path.join(DOCS, "assets", "minisite.css"), "rb").read()).hexdigest()[:8]
    JS_M = hashlib.sha1(open(os.path.join(DOCS, "assets", "minisite.js"), "rb").read()).hexdigest()[:8]
    for f in glob.glob(os.path.join(DOCS, "assets", "m", "toy-*.js")):
        TOY_V[os.path.basename(f)[4:-3]] = hashlib.sha1(open(f, "rb").read()).hexdigest()[:8]
    ids = argv or list(PAGES)
    need, out = {}, {}
    n = 0
    for cid in ids:
        if cid not in CARDS:
            print("  ! no card", cid)
            continue
        if cid in MUI.get("own_pages", {}):
            print("  · %s has its own page at /%s; none written" % (cid, MUI["own_pages"][cid]))
            continue
        for lang in LANGS:
            h = page(lang, cid)
            need.setdefault(cid, set()).update(needed(h, CARDS[cid]["cat"]))
            out[pre(lang) + path_of(cid) + "index.html"] = (cid, h)
            n += 1
    # one small file of the extra drawings each page needs (tools/minisite_dingbats.mjs), named on <body data-db-extra>
    import subprocess
    gf = os.path.join(HERE, "data", "minisite_glyphs.json")
    old = json.load(open(gf, encoding="utf-8")) if os.path.exists(gf) else {}
    old.update({k: sorted(v) for k, v in need.items()})
    json.dump(old, open(gf, "w", encoding="utf-8"), indent=0)
    subprocess.run(["node", os.path.join(HERE, "tools", "minisite_dingbats.mjs")], check=True)
    files = json.load(open(os.path.join(HERE, "data", "minisite_glyph_files.json"), encoding="utf-8"))
    for path, (cid, h) in out.items():
        if files.get(cid):
            h = h.replace('<body class="p-m', '<body data-db-extra="%s" class="p-m' % E(files[cid]), 1)
        B.write(path, h)
    # what tools/share_cards_minisites.mjs draws on each page's link preview
    import re as _re
    cards = []
    for cid in ids:
        if cid not in CARDS:
            continue
        c, p = CARDS[cid], PAGES[cid]
        price = _re.sub(r"<[^>]+>", "", B.card_price(c, "en"))
        cards.append({"id": cid, "cat": c["cat"], "catn": t(CATS[c["cat"]]["n"], "en"), "tier": p.get("tier"), "en": name(cid, "en"), "th": t(c["n"], "th"),
                      "sub": t(p.get("why"), "en") or line(cid, "en"), "price": price, "stops": B.pic_of(c),
                      "door": B.LOOKS["doors"].get(c["cat"]), "pic": (p.get("pic") or {}).get("src"), "draw": (p.get("draw") or {}).get("src"), "glyphs": glyphs_of(cid)})
    os.makedirs(os.path.join(DOCS, "og", "s"), exist_ok=True)
    json.dump(cards, open(os.path.join(HERE, "data", "minisite_cards.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print("%d pages for %d services" % (n, len(ids)))
    print("%d services in docs/sitemap.xml and docs/llms.txt (MINISITES blocks)" % links())
    miss = sorted(B.MISSING)
    if miss:
        print("  · %d words fall back to English, e.g." % len(miss), "; ".join("%s: %s" % m for m in miss[:6]))


CSS_M = JS_M = "0"
TOY_V = {}
if __name__ == "__main__":
    main(sys.argv[1:])

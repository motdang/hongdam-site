#!/usr/bin/env python3
"""Build hongdam.net's shop pages from data/shop.json (cards, words in each language) and
data/services.json (the price list, read only).

    python3 tools/build_shop.py

Writes, for each language prefix ('' English, th/, my/, zh/, de/): docs/<prefix>index.html (front
page), docs/<prefix><category>/index.html (one minisite per category), docs/<prefix>buy/ and
docs/<prefix>ask/; and functions/_shop_data.js (cards and options for /api/buy). Lists every
priced item in services.json that no card carries, so a new service is not left off the shop.
Prices on the pages are today's from data/services.live.json (tools/build_services.py) or the
opening price; shop.js reads the live ones when the page opens.
"""
import html
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import seo  # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(HERE, "docs")
SHOP = json.load(open(os.path.join(HERE, "data", "shop.json"), encoding="utf-8"))
SVC = json.load(open(os.path.join(HERE, "data", "services.json"), encoding="utf-8"))
GRAPH = json.load(open(os.path.join(HERE, "data", "tasks", "graph.json"), encoding="utf-8"))
LIVE_F = os.path.join(HERE, "data", "services.live.json")
LIVE = json.load(open(LIVE_F, encoding="utf-8")) if os.path.exists(LIVE_F) else {}
ITEMS = {it["id"]: it for s in SVC["sections"] for it in s.get("items", [])}
NODES = {n["id"]: n for n in GRAPH["nodes"]}
LANGS = SHOP["langs"]
SITE = "https://hongdam.net"
LINE_URL = "https://line.me/R/ti/p/@964yxgnk"
MAIL = "nan@motdang.net"
E = html.escape

# The looks layer: which doodle dingbat each door, card line, master line and tracker stop draws
# (data/looks.json), and the bundles tools/dingbats.mjs built for them (data/dingbats.json).
LOOKS_F = os.path.join(HERE, "data", "looks.json")
LOOKS = json.load(open(LOOKS_F, encoding="utf-8")) if os.path.exists(LOOKS_F) else {"doors": {}, "pics": {}, "master": [], "track": [], "glyphs": {}, "ui": {}}
for _l, _u in LOOKS["ui"].items():
    SHOP["ui"].setdefault(_l, {}).update(_u)
DBM_F = os.path.join(HERE, "data", "dingbats.json")
DBM = json.load(open(DBM_F, encoding="utf-8")) if os.path.exists(DBM_F) else None
import re as _re
LADDER = json.loads(_re.search(r"export const LADDER = (\[[^\]]*\])", open(os.path.join(HERE, "functions", "_services_data.js"), encoding="utf-8").read()).group(1))


def pre(lang):
    return "" if lang == "en" else lang + "/"


def url(lang, path=""):
    return "/" + pre(lang) + path


def money(n, cur="THB"):
    return ("US$" if cur == "USD" else "฿") + "{:,}".format(n)


def amt_cls(cur):
    """A price's mark (her ask 2026-10-24): a Thai flag before baht, a US flag and its own colour for US$ (shop.css)."""
    return "amt amt-us" if cur == "USD" else "amt amt-th"


def money_h(n, cur="THB"):
    return '<span class="%s">%s</span>' % (amt_cls(cur), E(money(n, cur)))


MONEY_RE = _re.compile(r"(US\$|฿)(\d[\d,]*(?:\.\d+)?)")


def mark_money(html):
    """฿ and US$ amounts in escaped running text, each in its mark."""
    return MONEY_RE.sub(lambda m: '<span class="%s">%s%s</span>' % (amt_cls("USD" if m.group(1) == "US$" else "THB"), m.group(1), m.group(2)), html)


def tr(d, lang):
    """A word in this language; English when a translation is missing (the build lists those)."""
    if isinstance(d, str):
        return d
    if lang not in d or not d[lang]:
        MISSING.add((lang, d.get("en", "?")[:40]))
    return d.get(lang) or d.get("en", "")


MISSING = set()
# Changes when the shop data changes, so a phone fetches the new card list.
import hashlib
VERSION = hashlib.sha1(json.dumps([SHOP, LIVE, LOOKS], sort_keys=True).encode()).hexdigest()[:8]
_CSS = os.path.join(DOCS, "assets", "shop.css")
CSS_V = hashlib.sha1(open(_CSS, "rb").read()).hexdigest()[:8] if os.path.exists(_CSS) else "0"
# shop.js gets its own, so a browser holding yesterday's copy (kept 4 h) fetches the new one at once.
_JS = os.path.join(DOCS, "assets", "shop.js")
JS_V = hashlib.sha1(open(_JS, "rb").read()).hexdigest()[:8] if os.path.exists(_JS) else "0"


def db(name, cls="", play="still"):
    """A doodle dingbat; drawn by /assets/db/core.js once it loads, its box held by shop.css until then."""
    return '<doodle-dingbat class="db%s" name="%s" play="%s" aria-hidden="true"></doodle-dingbat>' % ((" " + cls) if cls else "", E(name), play)


def glyph_name(g, lang):
    return tr(LOOKS["glyphs"].get(g, {"en": g}), lang)


def job(stops, lang, caps=None, cls="", name=None):
    """A job as a line of stops, the swan riding it. caps: words under the stops (the master line, the Buy page)."""
    lis = "".join('<li class="stop">%s%s</li>' % (db(g), '<span class="cap">%s</span>' % caps[i] if caps else "") for i, g in enumerate(stops))
    # alt text: a line without words under it is one picture, named by its stops in the page's language
    alt = "" if caps else ' role="img" aria-label="%s"' % E(", ".join(glyph_name(g, lang) for g in stops))
    return '<div class="job%s"%s%s><ol>%s</ol><span class="rider">%s</span></div>' % (
        (" " + cls) if cls else "", ' style="view-transition-name:%s"' % name if name else "", alt,
        lis, db("hongsa-stand", play="loop"))


def pic_of(c):
    """A card's line; a card with none yet draws its door, the work starting, and done."""
    return LOOKS["pics"].get(c["id"]) or [g for g in (LOOKS["doors"].get(c["cat"]), "gears", "done") if g]


def walks(c):
    """The service id whose monthly price a card shows, when it has one option that walks."""
    opts = c.get("opts", [])
    if c["act"] != "buy" or len(opts) != 1 or opts[0].get("price"):
        return None
    it = ITEMS.get(opts[0]["i"], {})
    return it["id"] if "baht" in it and "floor" in it else None


def walk_of(o):
    """(service id, part) for an option with a set price that now walks on data/services.json: its own
    item, or the one named in o["w"] (part "tail" is the item's second price). (None, None) otherwise."""
    if o.get("w"):
        return o["w"]["of"], o["w"].get("part", "price")
    it = ITEMS.get(o["i"], {})
    return (it["id"], "price") if o.get("price") and "floor" in it else (None, None)


def walk_num(sid, part, cur, fallback):
    """Today's opening number of a walking price, in cur; shop.js and /api/buy read the walk's own."""
    it = ITEMS.get(sid, {})
    return it.get("tail", fallback) if part == "tail" else it.get("usd" if cur == "USD" else "baht", fallback)


def live_span(sid, part, cur, n):
    return '<span class="%s" data-live="services/%s"%s%s>%s</span>' % (
        amt_cls(cur), E(sid), ' data-part="tail"' if part == "tail" else "", ' data-cur="USD"' if cur == "USD" else "", E(money(n, cur)))


def price_rule(o):
    """An option's price rule for the Buy button: its set numbers, and w (+ part) naming the walk that moves them."""
    p = dict(o.get("price") or {"walk": True})
    sid, part = walk_of(o)
    if sid:
        p["w"] = sid
        if part == "tail":
            p["part"] = "tail"
    return p


def add_rule(c, lang=None):
    a = c["add"]
    r = {"id": a["i"], "fixed": a["fixed"]}
    if "floor" in ITEMS.get(a["i"], {}):
        r["w"] = a["i"]
    if a.get("u"):   # its own count, e.g. hours of haggling
        r["unit"], r["max"] = a["u"], a.get("max", 8)
        if lang:
            r["unitMany"] = tr(SHOP["units"][a["u"]]["many"], lang)
    if a.get("for"):
        r["for"] = a["for"]
    if lang:
        n = walk_num(a["i"], "price", "THB", a["fixed"])
        r["n"] = tr(a["n"], lang).replace("{price}", money(n))
        r["nh"] = E(tr(a["n"], lang)).replace("{price}", live_span(a["i"], "price", "THB", n) if r.get("w") else money_h(n))
    return r


def unit_one(u, lang):
    return tr(SHOP["units"][u]["one"], lang) if u else ""


def opt_price(o, lang):
    """(html for the price, number for 'from', currency) of one option."""
    ui = SHOP["ui"][lang]
    it = ITEMS.get(o["i"], {})
    per = (" / " + unit_one(o.get("u"), lang)) if o.get("u") else ""
    p = o.get("price")
    sid, part = walk_of(o)
    if o.get("show"):
        n = p.get("tier", [0])[0] if p else 0
        s = E(tr(o["show"], lang))
        if "{price}" in s:
            n, t = walk_num(sid, "price", "THB", p["tier"][0]), walk_num(sid, "tail", "THB", p["tier"][2])
            s = s.replace("{price}", live_span(sid, "price", "THB", n) if sid else money_h(n))
            s = s.replace("{tail}", live_span(sid, "tail", "THB", t) if sid else money_h(t))
        return s, n, "THB"
    if p and "usd" in p:
        if sid:
            return live_span(sid, part, "USD", walk_num(sid, part, "USD", p["usd"])) + E(per), None, "USD"
        return money_h(p["usd"], "USD") + E(per), None, "USD"
    if p and "fixed" in p:
        if sid:
            n = walk_num(sid, part, "THB", p["fixed"])
            return live_span(sid, part, "THB", n) + E(per), n, "THB"
        return money_h(p["fixed"]) + E(per), p["fixed"], "THB"
    if "pct" in it:
        v = LIVE.get("services/" + it["id"]) or "%d%%" % it["pct"]
        return '<span data-live="services/%s">%s</span>%s' % (E(it["id"]), E(v), E(per)), None, "PCT"
    if "baht" in it:
        v = LIVE.get("services/" + it["id"]) or money(it["baht"])
        n = int(v.replace("฿", "").replace(",", "")) if v.startswith("฿") else it["baht"]
        return '<span class="amt amt-th" data-live="services/%s">%s</span>%s' % (E(it["id"]), E(v), E(per)), n, "THB"
    if o.get("free"):
        return E(ui["free"]), 0, "THB"
    raise SystemExit("no price for option %s" % o["i"])


# A rate per month or per hour is not a card's "from" price: ฿600 for an extra hour beside a ฿25,000 set-up
# reads as the price of the job (CodeRabbit on #55). tools/seo.py reads the same options.
TIME_UNITS = {"month", "hour"}


def from_options(c):
    """The options of a card that can stand as its "from" price: none priced per month or per hour.
    Add-ons are never among them. Empty when every option runs by time."""
    return [o for o in c.get("opts", []) if o.get("u") not in TIME_UNITS]


def card_price(c, lang):
    ui = SHOP["ui"][lang]
    if c.get("pshow"):
        return mark_money(E(tr(c["pshow"], lang)))
    if c.get("live"):
        v = LIVE.get(c["live"], "")
        return '<span%s data-live="%s">%s</span>' % (' class="amt amt-th"' if v.startswith("฿") else "", E(c["live"]), E(v))
    if c["act"] == "book":
        lowest = min(int(v.replace("฿", "").replace(",", "")) for k, v in LIVE.items() if k.startswith(c["min"] + "/") and v.startswith("฿") and v != "฿0") if any(k.startswith(c["min"] + "/") for k in LIVE) else c.get("from", 0)
        return ui["from"].replace("{p}", '<span class="amt amt-th" data-min="%s">%s</span>' % (E(c["min"]), E(money(lowest))))
    if c["act"] == "open":
        return E(ui["free"])
    opts = c.get("opts", [])
    if not opts:
        return ""
    if len(opts) == 1 or c["act"] == "list":
        if c["act"] == "list":
            return ""
        return opt_price(opts[0], lang)[0]
    elig = from_options(c)
    nums = [opt_price(o, lang) for o in (elig or opts)]
    thb = sorted((n, h) for h, n, cur in nums if cur == "THB" and n)
    if not thb:
        return nums[0][0]
    # every option runs by time: the lowest, with its unit ("from ฿2,000 / month")
    return ui["from"].replace("{p}", money_h(thb[0][0]) if elig else thb[0][1])


def go_of(c, lang):
    ui = SHOP["ui"][lang]
    a = c["act"]
    if a == "buy":
        return url(lang, "buy/?c=" + c["id"]), ui["buy"]
    if a == "book":
        return c["href"], ui["book"]
    if a == "open":
        return c["href"], ui["open"]
    if a == "link":   # a dict gives each language its own address, English where one is missing
        return (tr(c["href"], lang) if isinstance(c["href"], dict) else c["href"]), ui["go"]
    if a == "ask":
        return url(lang, "ask/?about=" + c["id"]), ui["askBtn"]
    return "", ""


def card_html(c, lang):
    go, btn = go_of(c, lang)
    pic = pic_of(c)
    # the card's name opens what its button opens
    name = '<a href="%s">%s</a>' % (E(go), E(tr(c["n"], lang))) if go else E(tr(c["n"], lang))
    out = '<li class="card" id="%s" style="--line:var(--c-%s)">%s<h3>%s</h3><p class="price">%s</p><p class="l">%s</p>' % (
        E(c["id"]), E(c["cat"]), job(pic, lang, name="job-" + c["id"]) if pic else "", name, card_price(c, lang), E(tr(c["l"], lang)))
    if walks(c):
        out += '<details class="ladder" data-svc="%s" hidden></details>' % E(walks(c))
    if c["act"] == "list":
        out += "<ul>" + "".join("<li>%s · <b>%s</b></li>" % (E(tr(o["n"], lang)), opt_price(o, lang)[0]) for o in c["opts"]) + "</ul>"
    if c.get("list"):
        out += "<ul>" + "".join("<li>%s</li>" % E(visa_name(k, lang)) for k in c["list"]) + "</ul>"
    if go:
        out += '<a class="btn" href="%s">%s</a>' % (E(go), E(btn))
    return out + "</li>"


def visa_name(k, lang):
    names = SHOP.get("visa_names", {}).get(k, {})
    return names.get(lang) or NODES[k].get(lang if lang in ("en", "th") else "en") or k


def search_words(c):
    parts = [c.get("kw", ""), c["id"]]
    for lang in LANGS:
        parts += [tr(c["n"], lang), tr(c["l"], lang)]
        parts += [tr(o["n"], lang) for o in c.get("opts", []) if o.get("n")]
    cat = next(x for x in SHOP["cats"] if x["id"] == c["cat"])
    parts += [tr(cat["n"], lang) for lang in LANGS]
    return " ".join(parts).lower()


def client_cards(lang):
    out = []
    for c in SHOP["cards"]:
        go, btn = go_of(c, lang)
        d = {"id": c["id"], "act": c["act"], "n": tr(c["n"], lang), "l": tr(c["l"], lang), "ph": card_price(c, lang),
             "go": go, "btn": btn, "kw": search_words(c)}
        if c["act"] == "buy":
            d["opts"] = []
            for o in c["opts"]:
                it = ITEMS.get(o["i"], {})
                ph, _, _ = opt_price(o, lang)
                p = price_rule(o)
                if p.get("walk"):
                    p["walk"] = it.get("baht")
                od = {"id": o["i"], "n": tr(o.get("n") or c["n"], lang), "ph": ph, "price": p,
                      "unit": bool(o.get("u")), "max": o.get("max", 99),
                      "unitMany": tr(SHOP["units"][o["u"]]["many"], lang) if o.get("u") else "",
                      "per": (" / " + unit_one(o.get("u"), lang)) if o.get("u") else ""}
                if lang in ("en", "th") and it.get("d_" + lang):
                    od["d"] = it["d_" + lang]
                d["opts"].append(od)
            if c.get("add"):
                d["add"] = add_rule(c, lang)
        d["cat"] = c["cat"]
        if pic_of(c):
            d["pic"] = pic_of(c)
        if walks(c):
            d["walk"] = walks(c)
        out.append(d)
    return out


def head(lang, title, desc, path, noindex=False, og="og/shop/front.jpg"):
    # tools/seo.py: the town in a category's title, its lowest price in the description, link-preview and schema.org tags
    title, desc = seo.title_of(globals(), lang, path, title), seo.desc_of(globals(), lang, path, desc)
    alts = "".join('<link rel="alternate" hreflang="%s" href="%s%s">\n' % (l, SITE, url(l, path)) for l in LANGS)
    return ('<!doctype html>\n<html lang="%s">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<meta name="color-scheme" content="light dark">\n<title>%s</title>\n<meta name="description" content="%s">\n'
            '%s<link rel="canonical" href="%s%s">\n%s<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">\n'
            '<link rel="stylesheet" href="/assets/shop.css?v=%s">\n'
            '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:url" content="%s%s">\n'
            '<meta property="og:image" content="%s/%s">\n<meta name="twitter:card" content="summary_large_image">\n%s</head>\n'
            % (lang, E(title), E(desc), '<meta name="robots" content="noindex">\n' if noindex else "", SITE, url(lang, path), alts,
               CSS_V, E(title), E(desc), SITE, url(lang, path), SITE, og, seo.tags(globals(), lang, path, title, desc, og, noindex)))


def top(lang, path):
    ui = SHOP["ui"][lang]
    langs = " ".join('<a href="%s" lang="%s" hreflang="%s" data-setlang="%s"%s>%s</a>' % (
        url(l, path), l, l, l, ' aria-current="true"' if l == lang else "", E(SHOP["lang_names"][l])) for l in LANGS)
    return ('<header class="top"><a class="brand" href="%s">%s<span class="wm">Hongdam</span> <span class="wm-th" lang="th">หงส์ดำ</span></a>'
            '<nav class="langs" aria-label="%s">%s</nav><a class="line" href="%s">LINE</a></header>\n'
            % (url(lang), db("hongsa", "mark", "loop"), E(ui["language"]), langs, LINE_URL))


def foot(lang, front=False, group=None, pay=True):
    """pay: the line on how to pay; the Buy page says it above its own button instead."""
    ui = SHOP["ui"][lang]
    data = {"lang": lang, "langs": LANGS, "front": front, "home": url(lang), "lineUrl": LINE_URL,
            "ui": ui, "cardsUrl": "/assets/shop-%s.json?v=%s" % (lang, VERSION),
            "group": group, "ladder": LADDER, "track": LOOKS["track"], "master": LOOKS["master"],
            "glyphs": {g: glyph_name(g, lang) for g in LOOKS["glyphs"]}}
    if DBM:
        data["db"] = {"core": "/assets/db/" + DBM["core"], "groups": {g: "/assets/db/" + f for g, f in DBM["groups"].items()}}
    j = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    return rate_box(lang) + ('<footer>%s<p>%s · <a href="mailto:%s">%s</a> · <a href="%s">LINE @964yxgnk</a></p>'
            '<p><a href="/portfolio/">%s</a> · <a href="/tasks">%s</a> · <a href="/llms.txt">llms.txt</a></p></footer>\n'
            '<script type="application/json" id="shop">%s</script>\n<script type="module" src="/assets/shop.js?v=%s"></script>\n</body>\n</html>\n'
            % ('<p>%s</p>' % E(ui["payMethods"]) if pay else "", E(ui["where"]), MAIL, MAIL, LINE_URL, E(ui["portfolio"]), E(ui["tasks"]), j, JS_V))


RATE_LANGS = ("my", "zh", "de")


def rate_box(lang):
    """Her word 2026-10-24: the Burmese and Chinese pages go out with a way for readers to rate the
    translation; the German pages, written the same way, carry it too. shop.js posts the answer to /api/rate."""
    if lang not in RATE_LANGS:
        return ""
    ui = SHOP["ui"][lang]
    return ('<form id="rate" class="rate"><p>%s</p><p><button type="button" class="btn alt" data-score="good">%s</button> '
            '<button type="button" class="btn alt" data-score="better">%s</button></p>\n'
            '<div hidden><label class="field">%s<textarea name="text" rows="3" maxlength="2000"></textarea></label>'
            '<button class="btn" type="submit">%s</button></div><p class="thanks" role="status" hidden>%s</p></form>\n'
            % tuple(E(ui[k]) for k in ("rateQ", "rateGood", "rateBetter", "rateText", "rateSend", "rateThanks")))


def search_box(lang):
    ui = SHOP["ui"][lang]
    return ('<label for="q" class="field">%s</label><div class="qwrap"><span class="qi">%s</span><input id="q" class="q" type="search" placeholder="%s" autocomplete="off"></div>\n'
            '<ul id="hits" class="cards" hidden aria-live="polite"></ul>\n' % (E(ui["search"]), db("search", play="loop") if LOOKS["master"] else "", E(ui["searchPh"])))


def not_here(lang):
    ui = SHOP["ui"][lang]
    return ('<h2>%s</h2><p><a class="btn" href="%s">LINE</a> <a class="btn alt" href="%s">%s</a></p>\n'
            % (E(ui["notHere"]), LINE_URL, url(lang, "ask/"), E(ui["askBtn"])))


def front(lang):
    ui = SHOP["ui"][lang]
    out = head(lang, ui["title"], ui["desc"], "")
    # under the tagline: where Hongdam works, then what it does, the first sentence of the site's description
    # (her asks 2026-10-24: where "here" is; "everything should be fully self-explanatory")
    out += '<body class="p-front">\n' + top(lang, "") + '<main>\n<h1>%s</h1>\n' % E(ui["tagline"])
    out += '<p class="lede">%s</p>\n' % "<br>".join(E(ui[k]) for k in ("place", "lede") if ui.get(k))
    if LOOKS["master"]:
        caps = []
        for s in ui["how"]:
            n, _, w = s.partition(" ")
            caps.append('<b>%s</b> %s' % (E(n), E(w)) if w else E(s))
        out += job([m["db"] for m in LOOKS["master"]], lang, caps=caps, cls="master") + "\n"
    else:
        out += '<ol class="steps3">%s</ol>\n' % "".join("<li>%s</li>" % E(s) for s in ui["how"])
    out += search_box(lang)
    pop = sorted((c for c in SHOP["cards"] if c.get("pop")), key=lambda c: c["pop"])
    out += '<h2>%s</h2>\n<ul class="cards">%s</ul>\n' % (E(ui["popular"]), "".join(card_html(c, lang) for c in pop))
    out += studio_band(lang)
    count = {}
    for c in SHOP["cards"]:
        count[c["cat"]] = count.get(c["cat"], 0) + 1
    out += '<h2>%s</h2>\n<ul class="doors">%s</ul>\n' % (E(ui["cats"]), "".join(
        '<li><a href="%s" style="--line:var(--c-%s);view-transition-name:cat-%s">%s<span class="dn">%s</span><span class="dc" aria-hidden="true">%d</span></a></li>' % (
            url(lang, c["id"] + "/"), c["id"], c["id"],
            db(LOOKS["doors"][c["id"]], play="hover") if LOOKS["doors"].get(c["id"]) else '<span class="e" aria-hidden="true">%s</span>' % c["emoji"],
            E(tr(c["n"], lang)), count.get(c["id"], 0))
        for c in SHOP["cats"]))
    out += not_here(lang) + '</main>\n' + foot(lang, front=True, group="front")
    return out


STUDIO_F = os.path.join(HERE, "data", "studio", "studio.json")
STUDIO = json.load(open(STUDIO_F, encoding="utf-8")) if os.path.exists(STUDIO_F) else None


def studio_band(lang, cat=None):
    """Hongdam Studio, the tech side (tools/build_studio.py): a card on the front page, a line on the categories its
    practices sell from."""
    if not STUDIO or lang not in STUDIO["ui"]:
        return ""
    su = STUDIO["ui"][lang]
    if cat:
        if cat not in {p["cat"] for p in STUDIO["practices"]}:
            return ""
        return '<p class="lede"><a href="%s">%s →</a> %s</p>\n' % (url(lang, "studio/"), E(su["name"]), E(su["band"]))
    return ('<h2>%s</h2>\n<ul class="cards"><li class="card" id="studio" style="--line:var(--c-web)">%s<h3>%s</h3><p class="l">%s</p>'
            '<a class="btn" href="%s">%s</a></li></ul>\n' % (
                E(su["name"]), job(["robot", "laptop", "wrench", "lock"], lang, name="job-studio"), E(su["h1"]), E(su["band"]),
                url(lang, "studio/"), E(SHOP["ui"][lang]["open"])))


def category(lang, cat):
    ui = SHOP["ui"][lang]
    name = tr(cat["n"], lang)
    out = head(lang, "%s · Hongdam" % name, tr(cat["l"], lang), cat["id"] + "/", og="og/shop/%s.jpg" % cat["id"])
    out += '<body class="p-cat" style="--line:var(--c-%s)">\n' % cat["id"] + top(lang, cat["id"] + "/") + '<main>\n<p class="back"><a href="%s">← %s</a></p>\n' % (url(lang), E(ui["home"]))
    door = LOOKS["doors"].get(cat["id"])
    out += '<h1 class="cat-h" style="view-transition-name:cat-%s">%s<span>%s</span></h1>\n<p class="lede">%s</p>\n' % (
        cat["id"], db(door, play="loop") if door else '<span aria-hidden="true">%s</span>' % cat["emoji"], E(name), E(tr(cat["l"], lang)))
    if cat.get("note"):
        out += '<p><b>%s</b></p>\n' % E(tr(cat["note"], lang))
    out += studio_band(lang, cat["id"])
    out += '<ul class="cards">%s</ul>\n' % "".join(card_html(c, lang) for c in SHOP["cards"] if c["cat"] == cat["id"])
    out += know(lang, cat)
    out += search_box(lang) + not_here(lang) + '</main>\n' + foot(lang, group=cat["id"])
    return out


def know(lang, cat):
    """Facts and other people's fees for a category, each with its source, from cats[].facts and cats[].costs."""
    from urllib.parse import quote, urlsplit
    ui = SHOP["ui"][lang]
    if not cat.get("facts") and not cat.get("costs"):
        return ""

    def src(u):
        host = urlsplit(u).netloc.removeprefix("www.")
        return ' <a class="src" href="%s" target="_blank" rel="noopener">%s</a>' % (E(quote(u, safe=":/?=&#%~+,;@!$*'()")), E(host))
    out = '<section class="know">\n<h2>%s</h2>\n<ul>%s</ul>\n' % (
        E(ui["know"]), "".join("<li>%s%s</li>" % (mark_money(E(tr(f["t"], lang))), src(f["src"])) for f in cat.get("facts", [])))
    if cat.get("costs"):
        out += '<h3>%s</h3>\n<table>%s</table>\n' % (E(ui["costs"]), "".join(
            '<tr><th scope="row">%s</th><td>%s%s</td></tr>' % (E(tr(k["t"], lang)), mark_money(E(tr(k["p"], lang))), src(k["src"])) for k in cat["costs"]))
    return out + '<p class="read">%s</p>\n</section>\n' % E(ui["read"].replace("{date}", SHOP.get("facts_read", "")))


def buy_page(lang):
    ui = SHOP["ui"][lang]
    out = head(lang, "%s · Hongdam" % ui["buy"], ui["desc"], "buy/", noindex=True, og="og/shop/buy.jpg")
    out += '<body class="p-buy">\n' + top(lang, "buy/") + '<main>\n<p class="back"><a href="%s">← %s</a></p>\n' % (url(lang), E(ui["home"]))
    out += '<div id="buy"><noscript><p>%s</p><p><a class="btn" href="%s">LINE</a></p></noscript></div>\n</main>\n' % (E(ui["noscript"]), LINE_URL)
    return out + foot(lang, pay=False)


def ask_page(lang):
    ui = SHOP["ui"][lang]
    out = head(lang, "%s · Hongdam" % ui["askBtn"], ui["desc"], "ask/", noindex=True, og="og/shop/ask.jpg")
    out += '<body class="p-ask">\n' + top(lang, "ask/") + '<main>\n<p class="back"><a href="%s">← %s</a></p>\n<h1>%s</h1>\n' % (url(lang), E(ui["home"]), E(ui["askH"]))
    out += ('<form id="af"><label class="field">%s<textarea name="message" rows="5" maxlength="4000" required></textarea></label>\n'
            '<label class="field">%s<input name="contact" required maxlength="120" autocomplete="email"></label>\n'
            '<label class="hp" aria-hidden="true">website<input name="website" tabindex="-1" autocomplete="off"></label>\n'
            '<button class="btn big" type="submit">%s</button><p id="amsg" role="status"></p></form>\n'
            '<p><a class="btn alt" href="%s">LINE @964yxgnk</a></p>\n</main>\n'
            % (E(ui["askWhat"]), E(ui["reach"]), E(ui["send"]), LINE_URL))
    return out + foot(lang, group="front")


def shop_js_data():
    cards = {}
    for c in SHOP["cards"]:
        e = {"act": c["act"], "en": tr(c["n"], "en")}
        if c["act"] == "buy":
            e["opts"] = [{"id": o["i"], "price": price_rule(o), "unit": bool(o.get("u")), "max": o.get("max", 99)} for o in c["opts"]]
            if c.get("add"):
                e["add"] = add_rule(c)
        cards[c["id"]] = e
    return ("// Written by tools/build_shop.py from data/shop.json; changes go there.\nexport const CARDS = %s\n"
            % json.dumps(cards, ensure_ascii=False, indent=1))


def sitemap():
    """The shop's pages in docs/sitemap.xml between SHOP markers, each with its other languages (hreflang) and
    the day its page last changed. The pages outside the markers are kept as they are."""
    import re
    from datetime import date
    p = os.path.join(DOCS, "sitemap.xml")
    xml = open(p, encoding="utf-8").read()
    today = date.today().isoformat()
    was = dict(re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml))
    paths = [""] + [c["id"] + "/" for c in SHOP["cats"]]
    rows = []
    for path in paths:
        alts = "".join('    <xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>\n' % (l, SITE, url(l, path)) for l in LANGS)
        alts += '    <xhtml:link rel="alternate" hreflang="x-default" href="%s%s"/>\n' % (SITE, url("en", path))
        for l in LANGS:
            loc = SITE + url(l, path)
            day = today if (pre(l) + path + "index.html") in CHANGED or loc not in was else was[loc]
            rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n%s%s  </url>\n"
                        % (loc, day, "    <priority>1.0</priority>\n" if path == "" else "", alts))
    block = "<!-- SHOP:START -->\n" + "".join(rows) + "  <!-- SHOP:END -->"
    if "<!-- SHOP:START -->" in xml:
        a, b = xml.index("<!-- SHOP:START -->"), xml.index("<!-- SHOP:END -->") + len("<!-- SHOP:END -->")
        xml = xml[:a] + block + xml[b:]
    else:
        i = xml.index("</url>") + len("</url>")
        xml = xml[:i] + "\n  " + block + xml[i:]
    # the front page lives inside the block now, with its languages
    xml = re.sub(r"\n  <url>\n    <loc>https://hongdam\.net/</loc>(?:(?!</url>).)*</url>(?=\n  <!-- SHOP:START -->)", "", xml, flags=re.S)
    if "xmlns:xhtml" not in xml:
        xml = xml.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">')
    open(p, "w", encoding="utf-8").write(xml)


CHANGED = set()


def write(path, text):
    full = os.path.join(DOCS, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if not os.path.exists(full) or open(full, encoding="utf-8").read() != text:
        CHANGED.add(path)
    open(full, "w", encoding="utf-8").write(text)


def ready(c):
    return all(o["i"] in ITEMS or o.get("price") for o in c.get("opts", []))


def main():
    waiting = [c["id"] for c in SHOP["cards"] if not ready(c)]
    SHOP["cards"] = [c for c in SHOP["cards"] if ready(c)]
    on_cards = {o["i"] for c in SHOP["cards"] for o in c.get("opts", [])} | {c["add"]["i"] for c in SHOP["cards"] if c.get("add")}
    on_cards |= {i for c in SHOP["cards"] for i in c.get("covers", [])}
    left = [i for i in ITEMS if i not in on_cards]
    n = 0
    for lang in LANGS:
        write(pre(lang) + "index.html", front(lang)); n += 1
        for cat in SHOP["cats"]:
            write(pre(lang) + cat["id"] + "/index.html", category(lang, cat)); n += 1
        write(pre(lang) + "buy/index.html", buy_page(lang)); n += 1
        write(pre(lang) + "ask/index.html", ask_page(lang)); n += 1
    for lang in LANGS:
        write("assets/shop-%s.json" % lang, json.dumps(client_cards(lang), ensure_ascii=False, separators=(",", ":")))
    open(os.path.join(HERE, "functions", "_shop_data.js"), "w", encoding="utf-8").write(shop_js_data())
    sitemap()
    print("%d pages · %d cards in %d categories · %d languages" % (n, len(SHOP["cards"]), len(SHOP["cats"]), len(LANGS)))
    if left:
        print("  ! on the price list but on no card:", ", ".join(left))
    if waiting:
        print("  ! cards left off until their item is on the price list:", ", ".join(waiting))
    for lang, w in sorted(MISSING):
        print("  · no %s for: %s" % (lang, w))
    return 0


if __name__ == "__main__":
    sys.exit(main())

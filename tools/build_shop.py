#!/usr/bin/env python3
"""Build hongdam.net's shop pages from data/shop.json (cards, words in four languages) and
data/services.json (the price list, read only).

    python3 tools/build_shop.py

Writes, for each language prefix ('' English, th/, my/, zh/): docs/<prefix>index.html (front
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


def pre(lang):
    return "" if lang == "en" else lang + "/"


def url(lang, path=""):
    return "/" + pre(lang) + path


def money(n, cur="THB"):
    return ("US$" if cur == "USD" else "฿") + "{:,}".format(n)


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
VERSION = hashlib.sha1(json.dumps([SHOP, LIVE], sort_keys=True).encode()).hexdigest()[:8]


def unit_one(u, lang):
    return tr(SHOP["units"][u]["one"], lang) if u else ""


def opt_price(o, lang):
    """(html for the price, number for 'from', currency) of one option."""
    ui = SHOP["ui"][lang]
    it = ITEMS.get(o["i"], {})
    per = (" / " + unit_one(o.get("u"), lang)) if o.get("u") else ""
    p = o.get("price")
    if o.get("show"):
        n = p.get("tier", [0])[0] if p else 0
        return E(tr(o["show"], lang)), n, "THB"
    if p and "usd" in p:
        return E(money(p["usd"], "USD") + per), None, "USD"
    if p and "fixed" in p:
        return E(money(p["fixed"]) + per), p["fixed"], "THB"
    if "pct" in it:
        v = LIVE.get("services/" + it["id"]) or "%d%%" % it["pct"]
        return '<span data-live="services/%s">%s</span>%s' % (E(it["id"]), E(v), E(per)), None, "PCT"
    if "baht" in it:
        v = LIVE.get("services/" + it["id"]) or money(it["baht"])
        n = int(v.replace("฿", "").replace(",", "")) if v.startswith("฿") else it["baht"]
        return '<span data-live="services/%s">%s</span>%s' % (E(it["id"]), E(v), E(per)), n, "THB"
    if o.get("free"):
        return E(ui["free"]), 0, "THB"
    raise SystemExit("no price for option %s" % o["i"])


def card_price(c, lang):
    ui = SHOP["ui"][lang]
    if c.get("pshow"):
        return E(tr(c["pshow"], lang))
    if c.get("live"):
        v = LIVE.get(c["live"], "")
        return '<span data-live="%s">%s</span>' % (E(c["live"]), E(v))
    if c["act"] == "book":
        lowest = min(int(v.replace("฿", "").replace(",", "")) for k, v in LIVE.items() if k.startswith(c["min"] + "/") and v.startswith("฿") and v != "฿0") if any(k.startswith(c["min"] + "/") for k in LIVE) else c.get("from", 0)
        return ui["from"].replace("{p}", '<span data-min="%s">%s</span>' % (E(c["min"]), E(money(lowest))))
    if c["act"] == "open":
        return E(ui["free"])
    opts = c.get("opts", [])
    if not opts:
        return ""
    if len(opts) == 1 or c["act"] == "list":
        if c["act"] == "list":
            return ""
        return opt_price(opts[0], lang)[0]
    nums = [opt_price(o, lang) for o in opts]
    thb = [n for _, n, cur in nums if cur == "THB" and n]
    if not thb:
        return nums[0][0]
    return ui["from"].replace("{p}", E(money(min(thb))))


def go_of(c, lang):
    ui = SHOP["ui"][lang]
    a = c["act"]
    if a == "buy":
        return url(lang, "buy/?c=" + c["id"]), ui["buy"]
    if a == "book":
        return c["href"], ui["book"]
    if a == "open":
        return c["href"], ui["open"]
    if a == "link":
        return c["href"], ui["go"]
    if a == "ask":
        return url(lang, "ask/?about=" + c["id"]), ui["askBtn"]
    return "", ""


def card_html(c, lang):
    go, btn = go_of(c, lang)
    out = '<li class="card" id="%s"><h3>%s</h3><p class="price">%s</p><p>%s</p>' % (
        E(c["id"]), E(tr(c["n"], lang)), card_price(c, lang), E(tr(c["l"], lang)))
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
                p = o.get("price") or {"walk": it.get("baht")}
                od = {"id": o["i"], "n": tr(o.get("n") or c["n"], lang), "ph": ph, "price": p,
                      "unit": bool(o.get("u")), "max": o.get("max", 99),
                      "unitMany": tr(SHOP["units"][o["u"]]["many"], lang) if o.get("u") else "",
                      "per": (" / " + unit_one(o.get("u"), lang)) if o.get("u") else ""}
                if lang in ("en", "th") and it.get("d_" + lang):
                    od["d"] = it["d_" + lang]
                d["opts"].append(od)
            if c.get("add"):
                d["add"] = {"n": tr(c["add"]["n"], lang), "fixed": c["add"]["fixed"]}
        out.append(d)
    return out


def head(lang, title, desc, path, noindex=False):
    alts = "".join('<link rel="alternate" hreflang="%s" href="%s%s">\n' % (l, SITE, url(l, path)) for l in LANGS)
    return ('<!doctype html>\n<html lang="%s">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<meta name="color-scheme" content="light dark">\n<title>%s</title>\n<meta name="description" content="%s">\n'
            '%s<link rel="canonical" href="%s%s">\n%s<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">\n'
            '<link rel="stylesheet" href="/assets/shop.css">\n'
            '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:url" content="%s%s">\n'
            '<meta property="og:image" content="%s/assets/card.jpg">\n<meta name="twitter:card" content="summary_large_image">\n</head>\n'
            % (lang, E(title), E(desc), '<meta name="robots" content="noindex">\n' if noindex else "", SITE, url(lang, path), alts,
               E(title), E(desc), SITE, url(lang, path), SITE))


def top(lang, path):
    ui = SHOP["ui"][lang]
    langs = " ".join('<a href="%s" lang="%s" hreflang="%s" data-setlang="%s"%s>%s</a>' % (
        url(l, path), l, l, l, ' aria-current="true"' if l == lang else "", E(SHOP["lang_names"][l])) for l in LANGS)
    return ('<header class="top"><a class="brand" href="%s">Hongdam หงส์ดำ</a><nav class="langs" aria-label="%s">%s</nav>'
            '<a href="%s">LINE</a></header>\n' % (url(lang), E(ui["language"]), langs, LINE_URL))


def foot(lang, front=False):
    ui = SHOP["ui"][lang]
    data = {"lang": lang, "langs": LANGS, "front": front, "home": url(lang), "lineUrl": LINE_URL,
            "ui": ui, "cardsUrl": "/assets/shop-%s.json?v=%s" % (lang, VERSION)}
    j = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    return ('<footer><p>%s</p><p>%s · <a href="mailto:%s">%s</a> · <a href="%s">LINE @964yxgnk</a></p>'
            '<p><a href="/portfolio/">%s</a> · <a href="/tasks">%s</a> · <a href="/llms.txt">llms.txt</a></p></footer>\n'
            '<script type="application/json" id="shop">%s</script>\n<script type="module" src="/assets/shop.js"></script>\n</body>\n</html>\n'
            % (E(ui["payMethods"]), E(ui["where"]), MAIL, MAIL, LINE_URL, E(ui["portfolio"]), E(ui["tasks"]), j))


def search_box(lang):
    ui = SHOP["ui"][lang]
    return ('<label for="q" class="field">%s</label><input id="q" class="q" type="search" placeholder="%s" autocomplete="off">\n'
            '<ul id="hits" class="cards" hidden aria-live="polite"></ul>\n' % (E(ui["search"]), E(ui["searchPh"])))


def not_here(lang):
    ui = SHOP["ui"][lang]
    return ('<h2>%s</h2><p><a class="btn" href="%s">LINE</a> <a class="btn alt" href="%s">%s</a></p>\n'
            % (E(ui["notHere"]), LINE_URL, url(lang, "ask/"), E(ui["askBtn"])))


def front(lang):
    ui = SHOP["ui"][lang]
    out = head(lang, ui["title"], ui["desc"], "")
    out += '<body>\n' + top(lang, "") + '<main>\n<h1>%s</h1>\n' % E(ui["tagline"])
    out += '<ol class="steps3">%s</ol>\n' % "".join("<li>%s</li>" % E(s) for s in ui["how"])
    out += search_box(lang)
    pop = sorted((c for c in SHOP["cards"] if c.get("pop")), key=lambda c: c["pop"])
    out += '<h2>%s</h2>\n<ul class="cards">%s</ul>\n' % (E(ui["popular"]), "".join(card_html(c, lang) for c in pop))
    out += '<h2>%s</h2>\n<ul class="doors">%s</ul>\n' % (E(ui["cats"]), "".join(
        '<li><a href="%s"><span class="e" aria-hidden="true">%s</span>%s</a></li>' % (url(lang, c["id"] + "/"), c["emoji"], E(tr(c["n"], lang)))
        for c in SHOP["cats"]))
    out += not_here(lang) + '</main>\n' + foot(lang, front=True)
    return out


def category(lang, cat):
    ui = SHOP["ui"][lang]
    name = tr(cat["n"], lang)
    out = head(lang, "%s · Hongdam" % name, tr(cat["l"], lang), cat["id"] + "/")
    out += '<body>\n' + top(lang, cat["id"] + "/") + '<main>\n<p><a href="%s">← %s</a></p>\n' % (url(lang), E(ui["home"]))
    out += '<h1><span aria-hidden="true">%s</span> %s</h1>\n<p>%s</p>\n' % (cat["emoji"], E(name), E(tr(cat["l"], lang)))
    if cat.get("note"):
        out += '<p><b>%s</b></p>\n' % E(tr(cat["note"], lang))
    out += '<ul class="cards">%s</ul>\n' % "".join(card_html(c, lang) for c in SHOP["cards"] if c["cat"] == cat["id"])
    out += search_box(lang) + not_here(lang) + '</main>\n' + foot(lang)
    return out


def buy_page(lang):
    ui = SHOP["ui"][lang]
    out = head(lang, "%s · Hongdam" % ui["buy"], ui["desc"], "buy/", noindex=True)
    out += '<body>\n' + top(lang, "buy/") + '<main>\n<p><a href="%s">← %s</a></p>\n' % (url(lang), E(ui["home"]))
    out += '<div id="buy"><noscript><p>%s</p><p><a class="btn" href="%s">LINE</a></p></noscript></div>\n</main>\n' % (E(ui["noscript"]), LINE_URL)
    return out + foot(lang)


def ask_page(lang):
    ui = SHOP["ui"][lang]
    out = head(lang, "%s · Hongdam" % ui["askBtn"], ui["desc"], "ask/", noindex=True)
    out += '<body>\n' + top(lang, "ask/") + '<main>\n<p><a href="%s">← %s</a></p>\n<h1>%s</h1>\n' % (url(lang), E(ui["home"]), E(ui["askH"]))
    out += ('<form id="af"><label class="field">%s<textarea name="message" rows="5" maxlength="4000" required></textarea></label>\n'
            '<label class="field">%s<input name="contact" required maxlength="120" autocomplete="email"></label>\n'
            '<label class="hp" aria-hidden="true">website<input name="website" tabindex="-1" autocomplete="off"></label>\n'
            '<button class="btn big" type="submit">%s</button><p id="amsg" role="status"></p></form>\n'
            '<p><a class="btn alt" href="%s">LINE @964yxgnk</a></p>\n</main>\n'
            % (E(ui["askWhat"]), E(ui["reach"]), E(ui["send"]), LINE_URL))
    return out + foot(lang)


def shop_js_data():
    cards = {}
    for c in SHOP["cards"]:
        e = {"act": c["act"], "en": tr(c["n"], "en")}
        if c["act"] == "buy":
            e["opts"] = [{"id": o["i"], "price": o.get("price") or {"walk": True}, "unit": bool(o.get("u")), "max": o.get("max", 99)} for o in c["opts"]]
            if c.get("add"):
                e["add"] = {"id": c["add"]["i"], "fixed": c["add"]["fixed"]}
        cards[c["id"]] = e
    return ("// Written by tools/build_shop.py from data/shop.json; changes go there.\nexport const CARDS = %s\n"
            % json.dumps(cards, ensure_ascii=False, indent=1))


def sitemap():
    """The shop's pages in docs/sitemap.xml, between SHOP markers (added once, after the front page)."""
    p = os.path.join(DOCS, "sitemap.xml")
    xml = open(p, encoding="utf-8").read()
    from datetime import date
    today = date.today().isoformat()
    urls = [url(l) for l in LANGS if l != "en"] + [url(l, c["id"] + "/") for l in LANGS for c in SHOP["cats"]]
    block = "<!-- SHOP:START -->\n" + "".join(
        "  <url>\n    <loc>%s%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>\n" % (SITE, u, today)
        for u in urls) + "  <!-- SHOP:END -->"
    if "<!-- SHOP:START -->" in xml:
        a, b = xml.index("<!-- SHOP:START -->"), xml.index("<!-- SHOP:END -->") + len("<!-- SHOP:END -->")
        xml = xml[:a] + block + xml[b:]
    else:
        import re
        xml = re.sub(r"\s*<url>\s*<loc>https://hongdam.net/th/</loc>.*?</url>", "", xml, count=1, flags=re.S)
        i = xml.index("</url>") + len("</url>")
        xml = xml[:i] + "\n  " + block + xml[i:]
    open(p, "w", encoding="utf-8").write(xml)


def write(path, text):
    full = os.path.join(DOCS, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
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

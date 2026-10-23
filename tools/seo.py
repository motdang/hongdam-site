"""Search and link-preview tags for the shop pages, called from head() in tools/build_shop.py.

    tags(B, lang, path, title, desc, og, noindex)  ->  extra <head> lines
    title_of(B, lang, path, title)                 ->  the <title>, with the town on a category page
    desc_of(B, lang, path, desc)                   ->  the description, with the lowest price on a category page

B is build_shop.py's globals(): SHOP, ITEMS, SITE, LANGS, url(), tr(), opt_price(), card_price(), go_of(),
unit_one(), pic_of(), glyph_name(). Page kinds come from the path: "" front, "<category>/", "buy/", "ask/".
"""
import html
import json
import re

E = html.escape
LOCALE = {"en": "en_US", "th": "th_TH", "my": "my_MM", "zh": "zh_CN"}
TOWN = {"en": "Hongdam, Chiang Rai", "th": "หงส์ดำ เชียงราย"}
CARD_W, CARD_H = 1200, 630


def kind(B, path):
    if path == "":
        return "front", None
    p = path.strip("/")
    cat = next((c for c in B["SHOP"]["cats"] if c["id"] == p), None)
    return ("cat", cat) if cat else (p, None)


def title_of(B, lang, path, title):
    k, cat = kind(B, path)
    if k == "cat" and lang in TOWN:
        return "%s · %s" % (B["tr"](cat["n"], lang), TOWN[lang])
    return title


def low_price(B, lang, cat):
    """The lowest baht price on a category's cards, as today's page shows it."""
    low = None
    for c in B["SHOP"]["cards"]:
        if c["cat"] != cat["id"] or c["act"] != "buy":
            continue
        for o in c.get("opts", []):
            _, n, cur = B["opt_price"](o, lang)
            if cur == "THB" and n:
                low = n if low is None else min(low, n)
    return low


def desc_of(B, lang, path, desc):
    k, cat = kind(B, path)
    if k != "cat":
        return desc
    low = low_price(B, lang, cat)
    if not low:
        return desc
    end = "" if desc.endswith((".", "。", "။")) else ("。" if lang == "zh" else "။" if lang == "my" else "" if lang == "th" else ".")
    frm = B["SHOP"]["ui"][lang]["from"].replace("{p}", "฿{:,}".format(low))
    return "%s%s %s" % (desc, end, frm[0].upper() + frm[1:] if lang == "en" else frm)


def card_alt(B, lang, path, title):
    """Words for the link-preview picture: what tools/share_cards.mjs draws on it."""
    k, cat = kind(B, path)
    if k == "cat":
        first = next((c for c in B["SHOP"]["cards"] if c["cat"] == cat["id"]), None)
        stops = B["pic_of"](first) if first else []
        pics = ", ".join(B["glyph_name"](g, lang) for g in stops if g in B["LOOKS"]["glyphs"])
        return "Hongdam · %s%s · hongdam.net" % (B["tr"](cat["n"], lang), (" — " + pics) if pics else "")
    return "Hongdam หงส์ดำ · %s · hongdam.net" % title


def num(v):
    return int(v) if float(v).is_integer() else v


def offer(B, lang, c, o):
    """One option of a card as a schema.org Offer, or None when it has no plain price."""
    _, n, cur = B["opt_price"](o, lang)
    if n is None and cur != "USD":
        return None
    if cur == "USD":
        n = (o.get("price") or {}).get("usd")
    if n is None or cur == "PCT":
        return None
    go, _ = B["go_of"](c, lang)
    of = {"@type": "Offer", "price": num(n), "priceCurrency": "USD" if cur == "USD" else "THB",
          "url": B["SITE"] + go if go.startswith("/") else go, "availability": "https://schema.org/InStock"}
    if o.get("u"):
        of["priceSpecification"] = {"@type": "UnitPriceSpecification", "price": num(n), "priceCurrency": of["priceCurrency"],
                                    "unitText": B["unit_one"](o["u"], lang)}
    if o.get("n"):
        of["name"] = B["tr"](o["n"], lang)
    return of


def services(B, lang, cat):
    org = {"@id": B["SITE"] + "/#org"}
    out = []
    for c in B["SHOP"]["cards"]:
        if c["cat"] != cat["id"]:
            continue
        s = {"@type": "Service", "name": B["tr"](c["n"], lang), "description": B["tr"](c["l"], lang), "provider": org,
             "areaServed": ["Chiang Rai", "Chiang Mai", "Thailand"]}
        go, _ = B["go_of"](c, lang)
        if go:
            s["url"] = B["SITE"] + go if go.startswith("/") else go
        offers = [x for x in (offer(B, lang, c, o) for o in c.get("opts", [])) if x] if c["act"] in ("buy", "list") else []
        if c["act"] == "open":
            offers = [{"@type": "Offer", "price": 0, "priceCurrency": "THB", "url": s.get("url", "")}]
        if c["act"] == "book":
            m = re.search(r"([\d,]+)", re.sub(r"<[^>]+>", "", B["card_price"](c, lang)))
            if m:
                offers = [{"@type": "AggregateOffer", "lowPrice": int(m.group(1).replace(",", "")), "priceCurrency": "THB", "url": s.get("url", "")}]
        if len(offers) == 1:
            s["offers"] = offers[0]
        elif offers:
            thb = [x["price"] for x in offers if x["priceCurrency"] == "THB"]
            s["offers"] = {"@type": "AggregateOffer", "offerCount": len(offers), "offers": offers}
            if thb:
                s["offers"].update(lowPrice=min(thb), highPrice=max(thb), priceCurrency="THB")
        out.append(s)
    return out


def org(B):
    return {"@type": "Organization", "@id": B["SITE"] + "/#org", "name": "Hongdam", "alternateName": "หงส์ดำ", "url": B["SITE"] + "/",
            "image": B["SITE"] + "/og/shop/front.jpg", "email": B["MAIL"],
            "address": {"@type": "PostalAddress", "addressLocality": "Chiang Rai", "addressCountry": "TH"},
            "areaServed": ["Chiang Rai", "Chiang Mai", "Thailand"],
            "contactPoint": {"@type": "ContactPoint", "contactType": "customer service", "url": B["LINE_URL"], "email": B["MAIL"],
                             "availableLanguage": ["English", "Thai", "Burmese", "Chinese"]},
            "sameAs": [B["LINE_URL"]]}


def ld(B, lang, path, title, desc):
    k, cat = kind(B, path)
    here = B["SITE"] + B["url"](lang, path)
    if k == "front":
        g = [org(B), {"@type": "WebSite", "@id": B["SITE"] + "/#site", "name": "Hongdam", "url": B["SITE"] + "/",
                      "inLanguage": B["LANGS"], "publisher": {"@id": B["SITE"] + "/#org"}},
             {"@type": "WebPage", "@id": here, "url": here, "name": title, "description": desc, "inLanguage": lang,
              "isPartOf": {"@id": B["SITE"] + "/#site"}}]
    elif k == "cat":
        name = B["tr"](cat["n"], lang)
        g = [{"@type": "CollectionPage", "@id": here, "url": here, "name": title, "description": desc, "inLanguage": lang,
              "isPartOf": {"@id": B["SITE"] + "/#site"},
              "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [
                  {"@type": "ListItem", "position": 1, "name": "Hongdam", "item": B["SITE"] + B["url"](lang)},
                  {"@type": "ListItem", "position": 2, "name": name, "item": here}]},
              "mainEntity": {"@type": "OfferCatalog", "name": name, "itemListElement": services(B, lang, cat)}}]
    else:
        return ""
    j = json.dumps({"@context": "https://schema.org", "@graph": g}, ensure_ascii=False, separators=(",", ":"))
    return '<script type="application/ld+json">%s</script>\n' % j.replace("</", "<\\/")


def tags(B, lang, path, title, desc, og, noindex=False):
    langs = B["LANGS"]
    alt = card_alt(B, lang, path, title)
    out = ['<link rel="alternate" hreflang="x-default" href="%s%s">' % (B["SITE"], B["url"]("en", path)),
           '<meta name="theme-color" content="#F1EDE4" media="(prefers-color-scheme: light)">',
           '<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">',
           '<meta property="og:type" content="website">', '<meta property="og:site_name" content="Hongdam หงส์ดำ">',
           '<meta property="og:locale" content="%s">' % LOCALE[lang]]
    out += ['<meta property="og:locale:alternate" content="%s">' % LOCALE[l] for l in langs if l != lang]
    out += ['<meta property="og:image:width" content="%d">' % CARD_W, '<meta property="og:image:height" content="%d">' % CARD_H,
            '<meta property="og:image:type" content="image/jpeg">', '<meta property="og:image:alt" content="%s">' % E(alt),
            '<meta name="twitter:title" content="%s">' % E(title), '<meta name="twitter:description" content="%s">' % E(desc),
            '<meta name="twitter:image" content="%s/%s">' % (B["SITE"], og), '<meta name="twitter:image:alt" content="%s">' % E(alt)]
    return "\n".join(out) + "\n" + ("" if noindex else ld(B, lang, path, title, desc))

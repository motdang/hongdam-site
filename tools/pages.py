#!/usr/bin/env python3
"""The pages outside the shop, in the shop's look: the shop's head, top bar and footer around each page's own
words and scripts.

    python3 tools/pages.py

Writes the pages kept as data/pages/<id>.html (own, red team, bots, GitHub, 404, stats) into docs/, the frame
around the portfolio (whose words stay in docs/portfolio/index.html, between <!-- page --> marks), and
functions/_frame.js, the same frame for the pages functions draw (/tasks, /events). data/pages.json names each
page's address, language, line colour (a shop category), the dingbat beside its heading, the stops of its picture
and its link card. tools/build_market.py, build_translation.py, build_invoice.py and build_tasks.py call head(),
top(), lead(), body() and foot() from here for their pages. Run tools/dingbats.mjs first when a mark or stop changes.
"""
import hashlib
import html
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_shop as B  # noqa: E402  (loads the shop's data; builds nothing until its main())

HERE = B.HERE
DOCS = B.DOCS
SITE = B.SITE
E = html.escape
PAGES = json.load(open(os.path.join(HERE, "data", "pages.json"), encoding="utf-8"))["pages"]
_PCSS = os.path.join(DOCS, "assets", "pages.css")
PCSS_V = hashlib.sha1(open(_PCSS, "rb").read()).hexdigest()[:8] if os.path.exists(_PCSS) else "0"
LOCALE = {"en": "en_US", "th": "th_TH", "my": "my_MM", "zh": "zh_CN", "de": "de_DE"}


def card(pid, lang="en"):
    """The page's link card for this language: {og, big, small, sub}."""
    c = PAGES[pid]["card"]
    return c if "og" in c else (c.get(lang) or c["en"])


def card_alt(pid, lang="en"):
    """Words for the link-preview picture: what tools/share_cards_pages.mjs draws on it."""
    c, p = card(pid, lang), PAGES[pid]
    pics = ", ".join(B.glyph_name(g, lang) for g in [p["mark"]] + [s for s in p["stops"] if s != p["mark"]])
    return "Hongdam · %s, %s — %s · hongdam.net" % (c["big"], c["small"], pics)


def head(pid, lang, title, desc, path=None, alternates=None, noindex=False, ld=None, extra=""):
    """<!doctype> to </head>. path: the page's address under hongdam.net/ (None for a page with no one address,
    as the 404). alternates: {lang: path} for a page in more than one language."""
    c = card(pid, lang)
    og = "%s/%s" % (SITE, c["og"])
    alt = card_alt(pid, lang)
    here = "%s/%s" % (SITE, path) if path is not None else None
    out = ['<!doctype html>', '<html lang="%s">' % lang, '<head>', '<meta charset="utf-8">',
           '<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="color-scheme" content="light dark">',
           '<title>%s</title>' % E(title), '<meta name="description" content="%s">' % E(desc)]
    if noindex:
        out.append('<meta name="robots" content="noindex">')
    if here and not noindex:
        out.append('<link rel="canonical" href="%s">' % here)
    for l, p in (alternates or {}).items():
        out.append('<link rel="alternate" hreflang="%s" href="%s/%s">' % (l, SITE, p))
    if alternates:
        out.append('<link rel="alternate" hreflang="x-default" href="%s/%s">' % (SITE, alternates.get("en", path)))
    out += ['<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
            '<link rel="stylesheet" href="/assets/shop.css?v=%s">' % B.CSS_V,
            '<link rel="stylesheet" href="/assets/pages.css?v=%s">' % PCSS_V,
            '<meta name="theme-color" content="#F1EDE4" media="(prefers-color-scheme: light)">',
            '<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">',
            '<meta property="og:type" content="website">', '<meta property="og:site_name" content="Hongdam หงส์ดำ">',
            '<meta property="og:locale" content="%s">' % LOCALE[lang],
            '<meta property="og:title" content="%s">' % E(title), '<meta property="og:description" content="%s">' % E(desc)]
    if here:
        out.append('<meta property="og:url" content="%s">' % here)
    out += ['<meta property="og:image" content="%s">' % og, '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">', '<meta property="og:image:type" content="image/jpeg">',
            '<meta property="og:image:alt" content="%s">' % E(alt), '<meta name="twitter:card" content="summary_large_image">',
            '<meta name="twitter:title" content="%s">' % E(title), '<meta name="twitter:description" content="%s">' % E(desc),
            '<meta name="twitter:image" content="%s">' % og, '<meta name="twitter:image:alt" content="%s">' % E(alt)]
    if extra:
        out.append(extra.strip())
    if ld:
        out.append('<script type="application/ld+json">%s</script>' % json.dumps(ld, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/"))
    return "\n".join(out) + "\n</head>\n"


def body(pid):
    """egg: the easter egg eggs.js plays here when the address does not name it (the 404 answers any address)."""
    p = PAGES[pid]
    return '<body class="pg pg-%s"%s%s>\n' % (pid, ' style="--line:var(--c-%s)"' % p["cat"] if p.get("cat") else "",
                                           ' data-egg="%s"' % E(p["egg"]) if p.get("egg") else "")


def top(lang, langs=None):
    """The shop's top bar: the swan and the name (home), the page's languages when it has more than one, LINE.
    langs: [(lang, href, name)]."""
    ui = B.SHOP["ui"][lang]
    nav = ""
    if langs:
        nav = '<nav class="langs" aria-label="%s">%s</nav>' % (E(ui["language"]), " ".join(
            '<a href="%s" lang="%s" hreflang="%s" data-setlang="%s"%s>%s</a>' % (h, l, l, l, ' aria-current="true"' if l == lang else "", E(n))
            for l, h, n in langs))
    return ('<header class="top"><a class="brand" href="%s">%s<span class="wm">Hongdam</span> <span class="wm-th" lang="th">หงส์ดำ</span></a>'
            '%s<a class="line" href="%s">LINE</a></header>\n' % (B.url(lang), B.db("hongsa", "mark", "loop"), nav, B.LINE_URL))


def back(pid, lang):
    """← the shop category the page belongs to (its cat in data/pages.json), or the front page."""
    cat = next((c for c in B.SHOP["cats"] if c["id"] == PAGES[pid].get("cat")), None)
    ui = B.SHOP["ui"][lang]
    if cat:
        return '<p class="back"><a href="%s">← %s</a></p>\n' % (B.url(lang, cat["id"] + "/"), E(B.tr(cat["n"], lang)))
    return '<p class="back"><a href="%s">← %s</a></p>\n' % (B.url(lang), E(ui["home"]))


def lead(pid, lang, h1=None, sub=None, sub_lang="th", with_back=True, h1_html=None):
    """The back link, the heading with the page's mark, and its picture (a job line of its stops)."""
    p = PAGES[pid]
    h1 = h1 if h1 is not None else p.get("h1", "")
    sub = sub if sub is not None else p.get("h1_th")
    words = h1_html if h1_html is not None else E(h1)
    if sub:
        words += '<small%s>%s</small>' % (' lang="%s"' % sub_lang if sub_lang and sub_lang != lang else "", E(sub))
    return ((back(pid, lang) if with_back else "") +
            '<h1 class="cat-h">%s<span>%s</span></h1>\n' % (B.db(p["mark"], play="loop"), words) +
            B.job(p["stops"], lang, cls="page") + "\n")


def foot(pid, lang, bare=False):
    """The shop's footer, its page data and shop.js, which draws this page's dingbats (group p-<id>).
    bare: only the address line, for a page made for one reader (an invoice)."""
    out = B.foot(lang, group="p-" + pid)
    if bare:
        ui = B.SHOP["ui"][lang]
        a = out.index("<footer>")
        b = out.index("</footer>")
        out = out[:a] + '<footer><p>%s · <a href="mailto:%s">%s</a> · <a href="%s">LINE @964yxgnk</a></p>' % (
            E(ui["where"]), B.MAIL, B.MAIL, B.LINE_URL) + out[b:]
    return out


import re  # noqa: E402
LIVE_RE = re.compile(r"\{\{live:([a-z0-9-]+)(:tail)?(:USD)?\}\}")


def live(m):
    """{{live:<service>}}, {{live:<service>:tail}}, {{live:<service>:tail:USD}}: a price that walks monthly, at
    today's opening number; shop.js puts the walk's number in when the page opens."""
    sid, part, cur = m.group(1), "tail" if m.group(2) else "price", "USD" if m.group(3) else "THB"
    if "floor" not in B.ITEMS.get(sid, {}):
        raise SystemExit("not a walking price: " + sid)
    return B.live_span(sid, part, cur, B.walk_num(sid, part, cur, 0))


def build(pid):
    """A page kept as data/pages/<id>.html: what goes between the top bar and the footer, {{lead}} where the
    heading and picture go. Its address, words for the head, and JSON-LD (data/pages/<id>.ld.json) beside it."""
    p = PAGES[pid]
    src = open(os.path.join(HERE, "data", "pages", pid + ".html"), encoding="utf-8").read()
    ldf = os.path.join(HERE, "data", "pages", pid + ".ld.json")
    ld = json.load(open(ldf, encoding="utf-8")) if os.path.exists(ldf) else None
    lang = p["lang"]
    src = LIVE_RE.sub(live, src.replace("{{lead}}", lead(pid, lang, sub_lang=p.get("sub_lang", "th")).rstrip("\n")))
    page = (head(pid, lang, p["title"], p["desc"], p["path"], noindex=p.get("noindex", False), ld=ld) +
            body(pid) + top(lang) + src.rstrip("\n") + "\n" + foot(pid, lang))
    out = "404.html" if pid == "404" else p["path"] + "index.html"
    B.write(out, page)
    return out


def frame_js():
    """functions/_frame.js: the same head links, top bar, heading and footer for the pages functions draw."""
    parts = {}
    for pid in ("tasks", "events"):
        parts[pid] = {"body": body(pid), "top": top("en"), "lead": lead(pid, "en", h1="{{h1}}", sub="{{sub}}"), "foot": foot(pid, "en"),
                      "alt": card_alt(pid), "og": SITE + "/" + card(pid)["og"]}
    links = ('<meta name="color-scheme" content="light dark">'
             '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">'
             '<link rel="stylesheet" href="/assets/shop.css?v=%s"><link rel="stylesheet" href="/assets/pages.css?v=%s">'
             '<meta name="theme-color" content="#F1EDE4" media="(prefers-color-scheme: light)">'
             '<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">' % (B.CSS_V, PCSS_V))
    js = ("// Written by tools/pages.py: the shop's frame for the pages functions draw. Change it there.\n"
          "export const LINKS = %s\nexport const FRAME = %s\n" % (json.dumps(links, ensure_ascii=False), json.dumps(parts, ensure_ascii=False, indent=1)))
    open(os.path.join(HERE, "functions", "_frame.js"), "w", encoding="utf-8").write(js)


def reframe(pid):
    """A page whose words stay in its own file in docs/, between <!-- page --> and <!-- /page --> (the portfolio,
    its pictures inlined): the frame is written again around them, and the heading between <!-- lead --> marks."""
    p = PAGES[pid]
    out = p["path"] + "index.html"
    s = open(os.path.join(DOCS, out), encoding="utf-8").read()
    a, b = s.index("<!-- page -->"), s.index("<!-- /page -->") + len("<!-- /page -->")
    block = re.sub(r"<!-- lead -->.*?<!-- /lead -->", lambda m: "<!-- lead -->\n%s<!-- /lead -->" % lead(pid, p["lang"], sub_lang=p.get("sub_lang", "th")),
                   s[a:b], count=1, flags=re.S)
    lang = p["lang"]
    page = (head(pid, lang, p["title"], p["desc"], p["path"], noindex=p.get("noindex", False)) +
            body(pid) + top(lang) + block + "\n" + foot(pid, lang))
    B.write(out, page)
    return out


HAND = ("own", "redteam", "bots", "github", "404", "stats")
REFRAME = ("portfolio",)


def main():
    for pid in sys.argv[1:] or HAND + REFRAME:
        print("wrote docs/" + (reframe(pid) if pid in REFRAME else build(pid)))
    frame_js()
    print("wrote functions/_frame.js")
    return 0


if __name__ == "__main__":
    sys.exit(main())

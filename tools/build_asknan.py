#!/usr/bin/env python3
"""Ask Nan, Nan's column on hongdam.net (her ask 2026-10-24): one question, her answer.

    python3 tools/build_asknan.py            # pages, feeds, sitemap block, llms.txt section, card list, front-page band
    node tools/asknan_cards.mjs              # then the link-preview pictures it lists

Reads data/asknan/asknan.json (words in English and Thai, the kinds, the front-page band in five languages) and the
columns in data/asknan/columns/<date>-<slug>.md (tools/studio_md.py reads them; tools/asknan_check.py checks one
before it goes in; data/asknan/brief.md says how one is written). Writes:

    docs/ask-nan/                      every column, newest first, in English; docs/th/ask-nan/ in Thai
    docs/ask-nan/<slug>/               one column, in English with its Thai headline, question and summary
    docs/ask-nan/feed.xml, feed.json   Atom and JSON Feed, the newest 30 in full
    docs/sitemap.xml                   between ASKNAN markers
    docs/llms.txt                      the "## Ask Nan" section
    docs/index.html and its languages  the front page again, with its Ask Nan band (build_shop.front)
    data/asknan/cards.json             the pictures tools/asknan_cards.mjs draws

The shop cards under a column are the shop's own, with the prices shop.js keeps current.
"""
import datetime
import glob
import hashlib
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_shop as B  # noqa: E402
import studio_md as M  # noqa: E402

E = html.escape
HERE, DOCS, SITE = B.HERE, B.DOCS, B.SITE
A = json.load(open(os.path.join(HERE, "data", "asknan", "asknan.json"), encoding="utf-8"))
LANGS = A["langs"]
KINDS = A["kinds"]
CARDS = {c["id"]: c for c in B.SHOP["cards"] if B.ready(c)}
_CSS = os.path.join(DOCS, "assets", "asknan.css")
_JS = os.path.join(DOCS, "assets", "asknan.js")
V_CSS = hashlib.sha1(open(_CSS, "rb").read()).hexdigest()[:8] if os.path.exists(_CSS) else "0"
V_JS = hashlib.sha1(open(_JS, "rb").read()).hexdigest()[:8] if os.path.exists(_JS) else "0"
FEED_N = 30
BASE = "ask-nan/"
MONTHS = {"en": "January February March April May June July August September October November December".split(),
          "th": "ม.ค. ก.พ. มี.ค. เม.ย. พ.ค. มิ.ย. ก.ค. ส.ค. ก.ย. ต.ค. พ.ย. ธ.ค.".split()}
LINE = ["chat", "nib", "done"]   # the list's line, also the front-page band's (glyphs the front group carries)
KIND_CAT = {"life": "luck", "basilisk": "ai", "practical": "help"}   # the shop colour each kind borrows


def ui(lang):
    return A["ui"][lang]


def tr(d, lang):
    return d.get(lang) or d["en"]


def day(iso, lang):
    d = datetime.date.fromisoformat(iso)
    if lang == "th":
        return "%d %s %d" % (d.day, MONTHS["th"][d.month - 1], d.year + 543)
    return "%d %s %d" % (d.day, MONTHS["en"][d.month - 1], d.year)


def no(n, lang):
    return ui(lang)["no"].replace("{n}", str(n))


# ---------------------------------------------------------------- columns

def columns():
    """Every column, newest first: its head, body, slug and the HTML of its body."""
    out = []
    for f in sorted(glob.glob(os.path.join(HERE, "data", "asknan", "columns", "*.md"))):
        name = os.path.basename(f)[:-3]
        m = re.match(r"(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)$", name)
        if not m:
            raise SystemExit("column file name is not <date>-<slug>.md: " + name)
        head, body = M.read(f)
        if head.get("draft"):
            continue
        if head["date"] != m.group(1):
            raise SystemExit("%s: date %s in its head" % (name, head["date"]))
        c = {"slug": m.group(2), "file": f, "body": body, **head}
        c["html"] = M.html(body, len(head.get("sources", [])))
        c["min"] = max(1, round(M.words(body) / 220))
        out.append(c)
    for k in ("slug", "no"):
        vals = [c[k] for c in out]
        dup = {v for v in vals if vals.count(v) > 1}
        if dup:
            raise SystemExit("two columns share a %s: %s" % (k, ", ".join(sorted(map(str, dup)))))
    out.sort(key=lambda c: (c["date"], c["no"]), reverse=True)
    return out


def col_path(c):
    return BASE + c["slug"] + "/"


def index_path(lang):
    return B.pre(lang) + BASE


# ---------------------------------------------------------------- frame

def person_ld():
    return {"@type": "Person", "@id": SITE + "/ask-nan/#nan", "name": "Nan Peacock", "alternateName": "Nan",
            "worksFor": {"@id": SITE + "/#org"}, "url": SITE + "/ask-nan/"}


def head(lang, title, desc, path, alternates=None, og="og/ask-nan/front.jpg", og_alt="", ld=None, kind="website"):
    here = SITE + "/" + path
    out = ['<!doctype html>', '<html lang="%s">' % lang, '<head>', '<meta charset="utf-8">',
           '<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="color-scheme" content="light dark">',
           '<title>%s</title>' % E(title), '<meta name="description" content="%s">' % E(desc),
           '<link rel="canonical" href="%s">' % here]
    for l, p in (alternates or {}).items():
        out.append('<link rel="alternate" hreflang="%s" href="%s/%s">' % (l, SITE, p))
    if alternates:
        out.append('<link rel="alternate" hreflang="x-default" href="%s/%s">' % (SITE, alternates["en"]))
    out += ['<link rel="alternate" type="application/atom+xml" title="Ask Nan" href="/ask-nan/feed.xml">',
            '<link rel="alternate" type="application/feed+json" title="Ask Nan" href="/ask-nan/feed.json">',
            '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
            '<link rel="stylesheet" href="/assets/shop.css?v=%s">' % B.CSS_V,
            '<link rel="stylesheet" href="/assets/asknan.css?v=%s">' % V_CSS, B.POND_CSS,
            '<meta property="og:type" content="%s">' % kind, '<meta property="og:site_name" content="Hongdam">',
            '<meta property="og:locale" content="%s">' % ("th_TH" if lang == "th" else "en_US"),
            '<meta property="og:title" content="%s">' % E(title), '<meta property="og:description" content="%s">' % E(desc),
            '<meta property="og:url" content="%s">' % here, '<meta property="og:image" content="%s/%s">' % (SITE, og),
            '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
            '<meta property="og:image:type" content="image/jpeg">', '<meta property="og:image:alt" content="%s">' % E(og_alt or title),
            '<meta name="twitter:card" content="summary_large_image">', '<meta name="twitter:title" content="%s">' % E(title),
            '<meta name="twitter:description" content="%s">' % E(desc), '<meta name="twitter:image" content="%s/%s">' % (SITE, og),
            '<meta name="twitter:image:alt" content="%s">' % E(og_alt or title)]
    if ld:
        out.append('<script type="application/ld+json">%s</script>' % json.dumps(
            {"@context": "https://schema.org", "@graph": ld}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/"))
    return "\n".join(out) + "\n</head>\n"


def top(lang, langs):
    """The shop's top bar: the swan home, this page's languages [(lang, href)], LINE."""
    nav = ""
    if len(langs) > 1:
        nav = '<nav class="langs" aria-label="%s">%s</nav>' % (E(B.SHOP["ui"][lang]["language"]), " ".join(
            '<a href="%s" lang="%s" hreflang="%s" data-setlang="%s"%s>%s</a>' % (
                h, l, l, l, ' aria-current="true"' if l == lang else "", E(B.SHOP["lang_names"][l])) for l, h in langs))
    return ('<header class="top"><a class="brand" href="%s">%s<span class="wm">Hongdam</span> <span class="wm-th" lang="th">หงส์ดำ</span></a>'
            '%s<a class="line" href="%s">LINE</a></header>\n' % (B.url(lang), B.db("hongsa", "mark", "loop"), nav, B.LINE_URL))


def foot(lang):
    f = B.foot(lang, group="p-asknan" if B.DBM and "p-asknan" in B.DBM["groups"] else "front")
    return f.replace("</body>", '<script type="module" src="/assets/asknan.js?v=%s"></script>\n</body>' % V_JS)


def ask_box(lang):
    """The shop's ask form (shop.js sends it to /api/contact with this page's path, so it reaches Nan marked Ask Nan)."""
    u, su = ui(lang), B.SHOP["ui"][lang]
    return ('<section class="an-ask" id="ask"><h2>%s</h2><p class="lede">%s</p>\n'
            '<form id="af" method="post" action="/api/contact"><input type="hidden" name="service" value="Ask Nan">'
            '<label class="field">%s<textarea name="message" rows="4" maxlength="4000" required></textarea></label>\n'
            '<label class="field">%s<input name="contact" required maxlength="120" autocomplete="email"></label>\n'
            '<label class="hp" aria-hidden="true">website<input name="website" tabindex="-1" autocomplete="off"></label>\n'
            '<button class="btn" type="submit">%s</button><p id="amsg" role="status"></p></form></section>\n' % (
                E(u["askH"]), E(u["askL"]), E(u["askWhat"]), E(su["reach"]), E(su["send"])))


def kind_label(c, lang):
    return tr(KINDS[c["kind"]], lang)


def col_card(c, lang, hx="h3"):
    """A column in a list: number, kind and date, the question, its Thai or English twin, the answer in brief."""
    th = lang == "th"
    title = c["title_th"] if th else c["title"]
    other = c["title"] if th else c["title_th"]
    dek = c["dek_th"] if th else c["dek"]
    return ('<li class="an-cc" data-kind="%s" style="--line:var(--c-%s)"><a href="/%s">%s<p class="an-meta"><b>%s</b> · %s · '
            '<time datetime="%s">%s</time></p><%s>%s</%s><p class="an-tw" lang="%s">%s</p><p class="an-dek">%s</p></a></li>' % (
                c["kind"], KIND_CAT[c["kind"]], col_path(c), B.job(c["line"], lang, cls="an-mini"), E(no(c["no"], lang)),
                E(kind_label(c, lang)), c["date"], E(day(c["date"], lang)), hx, E(title), hx, "en" if th else "th", E(other), E(dek)))


# ---------------------------------------------------------------- pages

def index(lang, cs):
    u = ui(lang)
    path = index_path(lang)
    alts = {l: index_path(l) for l in LANGS}
    ld = [person_ld(), {"@type": "Blog", "@id": SITE + "/ask-nan/#blog", "name": "Ask Nan", "alternateName": "ถามแนน",
                        "url": SITE + "/" + path, "inLanguage": lang, "author": {"@id": SITE + "/ask-nan/#nan"},
                        "publisher": {"@id": SITE + "/#org"}, "isPartOf": {"@id": SITE + "/#site"},
                        "blogPost": [{"@type": "BlogPosting", "headline": c["title"], "datePublished": c["date"],
                                      "url": SITE + "/" + col_path(c)} for c in cs[:50]]}]
    out = head(lang, u["title"], u["desc"], path, alts, og="og/ask-nan/front.jpg", og_alt=card_alt("front"), ld=ld)
    out += '<body class="asknan an-index">\n' + top(lang, [(l, "/" + p) for l, p in alts.items()])
    out += '<main id="main">\n<p class="an-kicker">%s</p>\n<h1>%s</h1>\n<p class="lede">%s</p>\n' % (E(u["kicker"]), E(u["name"]), E(u["lede"]))
    out += B.job(LINE, lang, cls="an-line") + "\n"
    out += '<p class="an-cta"><a class="btn" href="#ask">%s</a> <a class="btn alt" href="/%s">%s</a></p>\n' % (
        E(u["askH"]), col_path(cs[0]) if cs else path, E(u["read"]))
    out += '<p class="an-small">%s</p>\n<p class="an-small">%s</p>\n' % (E(u["basilisk"]), E(u["origin"]))
    if lang != "en":
        out += '<p class="an-small">%s</p>\n' % E(u["langNote"])
    present = [k for k in KINDS if any(c["kind"] == k for c in cs)]
    out += '<nav class="an-chips" aria-label="%s"><a href="?" data-kind="" aria-current="true">%s</a>%s</nav>\n' % (
        E(u["name"]), E(u["all"]), "".join('<a href="?kind=%s" data-kind="%s" style="--line:var(--c-%s)">%s</a>' % (
            k, k, KIND_CAT[k], E(tr(KINDS[k], lang))) for k in present))
    out += '<p class="an-count">%s · <a href="/ask-nan/feed.xml">Atom</a> · <a href="/ask-nan/feed.json">JSON Feed</a></p>\n' % E(
        u["count"].replace("{n}", str(len(cs))))
    out += '<ul class="an-list">%s</ul>\n' % "".join(col_card(c, lang, "h2") for c in cs)
    out += ask_box(lang) + '</main>\n' + foot(lang)
    return out


def money_text(h):
    """The shop's baht and dollar marks (build_shop.mark_money) on the text between tags only, so an amount inside an
    attribute (a table cell's data-h) stays plain."""
    return "".join(part if part.startswith("<") else B.mark_money(part) for part in re.split(r"(<[^>]*>)", h))


def sources_html(c, lang="en"):
    srcs = c.get("sources", [])
    if not srcs:
        return ""
    return '<section class="an-src" id="sources"><h2>%s</h2><ol>%s</ol></section>\n' % (E(ui(lang)["sources"]), "".join(
        '<li id="s%d"><a href="%s" rel="noopener">%s</a> <span class="an-host">%s</span></li>' % (
            k, E(s["u"]), E(s["t"]), E(src_host(s["u"]))) for k, s in enumerate(srcs, 1)))


def letter(c, lang):
    """The reader's letter: Dear Nan, the letter, and its pen-name after a dash."""
    th = lang == "th"
    q, frm = (c["q_th"], c.get("from_th")) if th else (c["q"], c.get("from"))
    return '<span class="an-dear">%s</span> %s%s' % (
        E(ui(lang)["dear"]), E(q), ' <span class="an-from">— %s</span>' % E(frm) if frm else "")


def feed_body(c):
    """A feed entry: the question, the answer, and its sources, so the [n] marks have their list."""
    return '<blockquote><p>%s</p></blockquote>\n%s\n%s' % (letter(c, "en"), c["html"], sources_html(c))


def src_host(u):
    return re.sub(r"^www\.", "", re.sub(r"^https?://([^/]+).*", r"\1", u))


def column_page(c, cs):
    lang = "en"
    u = ui(lang)
    i = cs.index(c)
    newer, older = (cs[i - 1] if i > 0 else None), (cs[i + 1] if i + 1 < len(cs) else None)
    path = col_path(c)
    srcs = c.get("sources", [])
    ld = [person_ld(), {"@type": "BlogPosting", "@id": SITE + "/" + path, "url": SITE + "/" + path, "headline": c["title"],
                        "alternativeHeadline": c.get("title_th", ""), "description": c["dek"], "datePublished": c["date"],
                        "dateModified": c.get("updated", c["date"]), "inLanguage": "en", "wordCount": M.words(c["body"]),
                        "author": {"@id": SITE + "/ask-nan/#nan"}, "publisher": {"@id": SITE + "/#org"},
                        "image": SITE + "/og/ask-nan/c/%s.jpg" % c["slug"], "isPartOf": {"@id": SITE + "/ask-nan/#blog"},
                        "articleSection": kind_label(c, "en"), "citation": [s["u"] for s in srcs],
                        "about": {"@type": "Question", "name": c["q"]}}]
    title = "%s · Ask Nan" % c["title"]
    out = head(lang, title, c["dek"], path, og="og/ask-nan/c/%s.jpg" % c["slug"], og_alt=card_alt("col", c), ld=ld, kind="article")
    out = out.replace("</head>", '<meta property="article:published_time" content="%s">\n</head>' % c["date"])
    out += '<body class="asknan an-col">\n' + top(lang, [])
    out += '<main id="main"><article class="an-c" style="--line:var(--c-%s)">\n' % KIND_CAT[c["kind"]]
    out += '<p class="back"><a href="/%s">← %s</a> · <a href="/%s" lang="th">%s</a></p>\n' % (BASE, E(u["name"]), index_path("th"), E(ui("th")["name"]))
    out += '<p class="an-meta"><b>%s</b> · <a href="/%s?kind=%s">%s</a> · <time datetime="%s">%s</time> · %s</p>\n' % (
        E(no(c["no"], lang)), BASE, c["kind"], E(kind_label(c, lang)), c["date"], E(day(c["date"], lang)),
        E(u["minRead"].replace("{n}", str(c["min"]))))
    out += '<h1>%s</h1>\n<p class="an-tw" lang="th">%s</p>\n' % (E(c["title"]), E(c["title_th"]))
    out += '<blockquote class="an-q"><p>%s</p><p lang="th">%s</p></blockquote>\n' % (letter(c, "en"), letter(c, "th"))
    out += B.job(c["line"], lang, cls="an-line") + "\n"
    do = c.get("do")
    first = CARDS.get((c.get("cards") or [None])[0])
    if do:
        out += '<p class="an-cta"><a class="btn" href="%s"%s>%s</a></p>\n' % (
            E(do["u"]), ' rel="noopener"' if do["u"].startswith("http") else "", E(do["t"]))
    elif first:
        go, btn = B.go_of(first, lang)
        out += '<p class="an-cta"><a class="btn" href="%s">%s · %s</a></p>\n' % (E(go), E(btn), E(B.tr(first["n"], lang)))
    out += '<p class="an-by"><span class="an-nan">%s</span></p>\n' % E(u["by"])
    out += '<div class="an-body">\n%s\n</div>\n' % money_text(c["html"])
    out += '<aside class="an-thsum" lang="th"><h2>%s</h2><p>%s</p></aside>\n' % (E(u["thsum"]), E(c["dek_th"]))
    rows = "".join(B.card_html(CARDS[k], lang) for k in c.get("cards", []) if k in CARDS)
    if rows:
        out += '<section class="an-buy"><h2>%s</h2><ul class="cards">%s</ul></section>\n' % (E(u["does"]), rows)
    out += sources_html(c, lang)
    pn = ""
    if older:
        pn += '<a class="an-old" href="/%s"><span>← %s</span>%s</a>' % (col_path(older), E(u["older"]), E(older["title"]))
    if newer:
        pn += '<a class="an-new" href="/%s"><span>%s →</span>%s</a>' % (col_path(newer), E(u["newer"]), E(newer["title"]))
    out += '<nav class="an-pn" aria-label="%s">%s</nav>\n' % (E(u["allCols"]), pn)
    out += '<p class="an-cta"><a class="btn alt" href="/%s">%s</a> <a href="/ask-nan/feed.xml">Atom</a> · <a href="/ask-nan/feed.json">JSON Feed</a></p>\n' % (
        BASE, E(u["allCols"]))
    out += '</article>\n' + ask_box(lang) + '</main>\n' + foot(lang)
    return out


# ---------------------------------------------------------------- feeds, sitemap, llms.txt, cards

def stamp(c):
    return c["date"] + "T07:00:00+07:00"


def atom(cs):
    x = E
    upd = max(c.get("updated", c["date"]) for c in cs) + "T07:00:00+07:00" if cs else datetime.date.today().isoformat() + "T07:00:00+07:00"
    out = ['<?xml version="1.0" encoding="utf-8"?>', '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">',
           '<title>Ask Nan</title>', '<subtitle>%s</subtitle>' % x(ui("en")["lede"]),
           '<link rel="alternate" type="text/html" href="%s/ask-nan/"/>' % SITE, '<link rel="self" href="%s/ask-nan/feed.xml"/>' % SITE,
           '<id>%s/ask-nan/</id>' % SITE, '<updated>%s</updated>' % upd, '<icon>%s/assets/favicon.svg</icon>' % SITE,
           '<author><name>Nan Peacock</name><uri>%s/ask-nan/</uri></author>' % SITE]
    for c in cs[:FEED_N]:
        u = SITE + "/" + col_path(c)
        body = feed_body(c)
        out += ['<entry>', '<title>%s</title>' % x(c["title"]), '<link rel="alternate" type="text/html" href="%s"/>' % u,
                '<id>tag:hongdam.net,%s:ask-nan/%s</id>' % (c["date"], c["slug"]), '<published>%s</published>' % stamp(c),
                '<updated>%s</updated>' % (c.get("updated", c["date"]) + "T07:00:00+07:00"),
                '<category term="%s" label="%s"/>' % (c["kind"], x(kind_label(c, "en"))),
                '<summary>%s</summary>' % x(c["dek"]), '<content type="html">%s</content>' % x(body), '</entry>']
    return "\n".join(out + ["</feed>"]) + "\n"


def jsonfeed(cs):
    items = [{"id": SITE + "/" + col_path(c), "url": SITE + "/" + col_path(c), "title": c["title"], "summary": c["dek"],
              "content_html": feed_body(c), "date_published": stamp(c),
              "date_modified": c.get("updated", c["date"]) + "T07:00:00+07:00",
              "tags": [c["kind"]], "language": "en", "image": SITE + "/og/ask-nan/c/%s.jpg" % c["slug"],
              "_hongdam": {"no": c["no"], "question": c["q"], "title_th": c["title_th"], "question_th": c["q_th"], "from": c.get("from", ""), "from_th": c.get("from_th", ""),
                           "summary_th": c["dek_th"], "sources": c.get("sources", [])}}
             for c in cs[:FEED_N]]
    return json.dumps({"version": "https://jsonfeed.org/version/1.1", "title": "Ask Nan", "home_page_url": SITE + "/ask-nan/",
                       "feed_url": SITE + "/ask-nan/feed.json", "description": ui("en")["lede"], "icon": SITE + "/og/ask-nan/front.jpg",
                       "favicon": SITE + "/assets/favicon.svg", "language": "en",
                       "authors": [{"name": "Nan Peacock", "url": SITE + "/ask-nan/"}], "items": items}, ensure_ascii=False, indent=1) + "\n"


def sitemap(cs):
    p = os.path.join(DOCS, "sitemap.xml")
    xml = open(p, encoding="utf-8").read()
    was = dict(re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml))
    today = datetime.date.today().isoformat()
    rows = []

    def row(loc, file, alts, lastmod=None):
        day_ = lastmod or (today if file in B.CHANGED or loc not in was else was[loc])
        a = "".join('    <xhtml:link rel="alternate" hreflang="%s" href="%s/%s"/>\n' % (l, SITE, q) for l, q in alts.items())
        if alts:
            a += '    <xhtml:link rel="alternate" hreflang="x-default" href="%s/%s"/>\n' % (SITE, alts["en"])
        rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n%s  </url>\n" % (loc, day_, a))
    alts = {l: index_path(l) for l in LANGS}
    for l, q in alts.items():
        row(SITE + "/" + q, q + "index.html", alts)
    for c in cs:
        row(SITE + "/" + col_path(c), col_path(c) + "index.html", {}, c.get("updated", c["date"]))
    block = "<!-- ASKNAN:START -->\n" + "".join(rows) + "  <!-- ASKNAN:END -->"
    if "<!-- ASKNAN:START -->" in xml:
        a, b = xml.index("<!-- ASKNAN:START -->"), xml.index("<!-- ASKNAN:END -->") + len("<!-- ASKNAN:END -->")
        xml = xml[:a] + block + xml[b:]
    else:
        i = xml.rindex("</urlset>")
        xml = xml[:i] + "  " + block + "\n" + xml[i:]
    open(p, "w", encoding="utf-8").write(xml)


def llms(cs):
    p = os.path.join(DOCS, "llms.txt")
    txt = open(p, encoding="utf-8").read()
    lines = ["## Ask Nan", "",
             "Ask Nan is the column of Nan, who runs Hongdam in Chiang Rai, Thailand. Each column answers one question, lists its sources at the foot and gives one thing to do",
             "next. Kinds: life in Thailand; living with AI (Nan's name for it is the basilisk era); how-to guides. In English, with",
             "the headline, the question and a summary in Thai. Index: https://hongdam.net/ask-nan/ (Thai: https://hongdam.net/th/ask-nan/)",
             "· Atom https://hongdam.net/ask-nan/feed.xml · JSON Feed https://hongdam.net/ask-nan/feed.json.", ""]
    for c in cs[:20]:
        lines.append("- No. %d · %s · %s — https://hongdam.net/%s" % (c["no"], kind_label(c, "en"), c["title"], col_path(c)))
    block = "\n".join(lines) + "\n\n"
    m = re.search(r"^## Ask Nan\n.*?(?=^## )", txt, flags=re.S | re.M)
    if m:
        txt = txt[:m.start()] + block + txt[m.end():]
    else:
        i = txt.find("\n## Hongdam Studio")
        txt = (txt[:i + 1] + block + txt[i + 1:]) if i >= 0 else txt.rstrip("\n") + "\n\n" + block
    open(p, "w", encoding="utf-8").write(txt)


def card_alt(kind, c=None):
    if kind == "col":
        return "Ask Nan · Column %d · %s · %s — hongdam.net/ask-nan" % (c["no"], kind_label(c, "en"), c["title"])
    return "Ask Nan · Life in Thailand, living with AI, how-to guides · hongdam.net/ask-nan"


def cards_list(cs):
    hue = {"life": 72, "basilisk": 205, "practical": 32}
    out = [{"out": "og/ask-nan/front", "kicker": "Hongdam · Ask Nan", "title": "Ask Nan.", "th": "ถามแนน",
            "sub": "Life in Thailand · living with AI · how-to guides", "line": LINE, "hue": 32}]
    for c in cs:
        k = c.get("card", {})
        out.append({"out": "og/ask-nan/c/" + c["slug"], "kicker": "Ask Nan · Column %d · %s" % (c["no"], kind_label(c, "en")),
                    "title": k.get("big", c["title"]), "th": k.get("th", c["title_th"]), "sub": k.get("sub", ""),
                    "line": c["line"], "hue": hue.get(c["kind"], 32)})
    # the drawings' versions go into the hash too, so new dingbats redraw the pictures
    dbv = [B.DBM["core"], B.DBM["groups"].get("p-asknan", B.DBM["groups"].get("front", ""))] if B.DBM else []
    for c in out:
        c["hash"] = hashlib.sha1(json.dumps([c, dbv], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:10]
    json.dump(out, open(os.path.join(HERE, "data", "asknan", "cards.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return out


def main():
    cs = columns()
    n = 0
    for lang in LANGS:
        B.write(index_path(lang) + "index.html", index(lang, cs)); n += 1
    for c in cs:
        B.write(col_path(c) + "index.html", column_page(c, cs)); n += 1
    keep = {col_path(x) for x in cs}
    for d in glob.glob(os.path.join(DOCS, "ask-nan", "*", "")):
        rel = os.path.relpath(d, DOCS) + "/"
        if rel not in keep and os.path.exists(os.path.join(d, "index.html")):
            os.remove(os.path.join(d, "index.html"))
            print("  removed", rel)
    B.write("ask-nan/feed.xml", atom(cs))
    B.write("ask-nan/feed.json", jsonfeed(cs))
    for lang in B.LANGS:   # the front page carries the Ask Nan band (build_shop.asknan_band)
        B.write(B.pre(lang) + "index.html", B.front(lang))
    sitemap(cs)
    llms(cs)
    cards_list(cs)
    print("%d Ask Nan pages · %d columns · feeds · front-page band · sitemap · llms.txt" % (n, len(cs)))
    return 0


if __name__ == "__main__":
    sys.exit(main())

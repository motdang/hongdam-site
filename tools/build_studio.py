#!/usr/bin/env python3
"""Hongdam Studio, the tech side of hongdam.net (her ask 2026-10-24): a site inside the shop.

    python3 tools/build_studio.py            # pages, feeds, sitemap block, llms.txt section, card list
    node tools/studio_cards.mjs              # then the link-preview pictures it lists

Reads data/studio/studio.json (words in five languages, the practices and the shop cards each sells, the work),
data/studio/counts.json (tools/studio_counts.py) and the notes in data/studio/notes/<date>-<slug>.md
(tools/studio_md.py reads them; tools/studio_check.py checks one before it goes in). Writes:

    docs/studio/                      the Studio page, English; docs/<lang>/studio/ for th, my, zh, de
    docs/studio/notes/                every note, newest first; docs/th/studio/notes/ in Thai
    docs/studio/notes/<slug>/         one note, in English with its Thai title and summary
    docs/studio/feed.xml, feed.json   Atom and JSON Feed, the newest 30 notes in full
    docs/sitemap.xml                  between STUDIO markers
    docs/llms.txt                     the "## Hongdam Studio" section
    data/studio/cards.json            the pictures tools/studio_cards.mjs draws

Prices are the shop's: each service row is the shop card's own price markup, which shop.js keeps current.
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
import seo  # noqa: E402
import studio_md as M  # noqa: E402

E = html.escape
HERE, DOCS, SITE = B.HERE, B.DOCS, B.SITE
S = json.load(open(os.path.join(HERE, "data", "studio", "studio.json"), encoding="utf-8"))
_CF = os.path.join(HERE, "data", "studio", "counts.json")
COUNTS = json.load(open(_CF, encoding="utf-8")) if os.path.exists(_CF) else {"repos": 0, "pages": 0, "motdang": 0}
LANGS = S["langs"]
NOTE_LANGS = ("en", "th")
CARDS = {c["id"]: c for c in B.SHOP["cards"] if B.ready(c)}
CATS = {c["id"]: c for c in B.SHOP["cats"]}
BEATS = S["beats"]
PRACTICE = {p["id"]: p for p in S["practices"]}
_SCSS = os.path.join(DOCS, "assets", "studio.css")
_SJS = os.path.join(DOCS, "assets", "studio.js")
V_CSS = hashlib.sha1(open(_SCSS, "rb").read()).hexdigest()[:8] if os.path.exists(_SCSS) else "0"
V_JS = hashlib.sha1(open(_SJS, "rb").read()).hexdigest()[:8] if os.path.exists(_SJS) else "0"
FEED_N = 30
SHOW = 4   # service rows shown under a practice; the rest open under "n more"
MONTHS = {
    "en": "January February March April May June July August September October November December".split(),
    "th": "ม.ค. ก.พ. มี.ค. เม.ย. พ.ค. มิ.ย. ก.ค. ส.ค. ก.ย. ต.ค. พ.ย. ธ.ค.".split(),
    "de": "Jan. Feb. März Apr. Mai Juni Juli Aug. Sept. Okt. Nov. Dez.".split(),
}


def ui(lang):
    return S["ui"][lang]


def tr(d, lang):
    return d.get(lang) or d["en"]


def num(n, lang):
    s = "{:,}".format(n)
    return s.replace(",", "’") if lang == "de" else s


def day(iso, lang):
    d = datetime.date.fromisoformat(iso)
    if lang == "th":
        return "%d %s %d" % (d.day, MONTHS["th"][d.month - 1], d.year + 543)
    if lang == "zh":
        return "%d年%d月%d日" % (d.year, d.month, d.day)
    if lang == "de":
        return "%d. %s %d" % (d.day, MONTHS["de"][d.month - 1], d.year)
    if lang == "my":
        return iso
    return "%d %s %d" % (d.day, MONTHS["en"][d.month - 1], d.year)


def fill(s, lang, notes_n=0):
    pages = COUNTS.get("pages", 0)
    return (s.replace("{notes}", num(notes_n, lang)).replace("{repos}", num(COUNTS.get("repos", 0), lang))
             .replace("{pages}+", num(pages // 1000 * 1000, lang) + "+").replace("{pages}", num(pages, lang))
             .replace("{motdang}", num(COUNTS.get("motdang", 0), lang)).replace("{start}", ui(lang)["start"]))


def beat_line(beat):
    return S.get("beat_lines", {}).get(beat) or PRACTICE[beat]["line"]


def beat_cat(beat):
    return PRACTICE[beat]["cat"] if beat in PRACTICE else "design"


# ---------------------------------------------------------------- notes

def notes():
    """Every note, newest first: its head, body, slug and the HTML of its body."""
    out = []
    for f in sorted(glob.glob(os.path.join(HERE, "data", "studio", "notes", "*.md"))):
        name = os.path.basename(f)[:-3]
        m = re.match(r"(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)$", name)
        if not m:
            raise SystemExit("note file name is not <date>-<slug>.md: " + name)
        head, body = M.read(f)
        if head.get("draft"):
            continue
        if head["date"] != m.group(1):
            raise SystemExit("%s: date %s in its head" % (name, head["date"]))
        n = {"slug": m.group(2), "file": f, "body": body, **head}
        n["html"] = M.html(body, len(head.get("sources", [])))
        n["min"] = max(1, round(M.words(body) / 220))
        out.append(n)
    slugs = [n["slug"] for n in out]
    dup = {s for s in slugs if slugs.count(s) > 1}
    if dup:
        raise SystemExit("two notes share a slug: " + ", ".join(sorted(dup)))
    out.sort(key=lambda n: (n["date"], n.get("order", 0), n["slug"]), reverse=True)
    return out


def note_path(n):
    return "studio/notes/%s/" % n["slug"]


# ---------------------------------------------------------------- frame

def head(lang, title, desc, path, alternates=None, og="og/studio/front.jpg", og_alt="", ld=None, kind="website"):
    here = SITE + "/" + path
    out = ['<!doctype html>', '<html lang="%s">' % lang, '<head>', '<meta charset="utf-8">',
           '<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="color-scheme" content="light dark">',
           '<title>%s</title>' % E(title), '<meta name="description" content="%s">' % E(desc),
           '<link rel="canonical" href="%s">' % here]
    for l, p in (alternates or {}).items():
        out.append('<link rel="alternate" hreflang="%s" href="%s/%s">' % (l, SITE, p))
    if alternates:
        out.append('<link rel="alternate" hreflang="x-default" href="%s/%s">' % (SITE, alternates["en"]))
    out += ['<link rel="alternate" type="application/atom+xml" title="Hongdam Studio notes" href="/studio/feed.xml">',
            '<link rel="alternate" type="application/feed+json" title="Hongdam Studio notes" href="/studio/feed.json">',
            '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
            '<link rel="stylesheet" href="/assets/shop.css?v=%s">' % B.CSS_V,
            '<link rel="stylesheet" href="/assets/studio.css?v=%s">' % V_CSS, B.POND_CSS,
            '<meta name="theme-color" content="#0E0E10">',
            '<meta property="og:type" content="%s">' % kind, '<meta property="og:site_name" content="Hongdam Studio">',
            '<meta property="og:locale" content="%s">' % seo.LOCALE[lang],
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


def bar(lang, here=""):
    """The Studio's own bar, in the black room: its name and its four parts."""
    u = ui(lang)
    base = B.url(lang, "studio/")
    notes_url = B.url(lang if lang in NOTE_LANGS else "en", "studio/notes/")
    links = [("practices", base + "#practices"), ("notes", notes_url), ("work", base + "#work"), ("contact", base + "#contact")]
    return ('<nav class="s-bar" aria-label="%s"><a class="s-name" href="%s"><b>Hongdam</b> <span>Studio</span></a><ul>%s</ul></nav>\n' % (
        E(u["name"]), base, "".join('<li><a href="%s"%s>%s</a></li>' % (h, ' aria-current="page"' if k == here else "", E(u["nav"][k]))
                                    for k, h in links)))


def foot(lang):
    """The shop's footer and shop.js (prices, dingbats of the front group), then studio.js."""
    f = B.foot(lang, group="front")
    return f.replace("</body>", '<script type="module" src="/assets/studio.js?v=%s"></script>\n</body>' % V_JS)


def svc_row(c, lang):
    go, btn = B.go_of(c, lang)
    price = B.card_price(c, lang)
    return ('<li class="s-row"><a href="%s"><span class="s-rn">%s</span><span class="s-rl">%s</span>'
            '<span class="s-rp">%s</span><span class="s-go">%s</span></a></li>' % (
                E(go), E(B.tr(c["n"], lang)), E(B.tr(c["l"], lang)), price, E(btn)))


def note_card(n, lang, hx="h3"):
    th = lang == "th" and n.get("title_th")
    title = n["title_th"] if th else n["title"]
    other = n["title"] if th else n.get("title_th")
    dek = n.get("dek_th") if th and n.get("dek_th") else n["dek"]
    return ('<li class="s-nc" data-beat="%s" style="--line:var(--c-%s)"><a href="/%s"><p class="s-meta"><span class="s-beat">%s</span> · '
            '<time datetime="%s">%s</time></p><%s%s>%s</%s>%s<p class="s-dek">%s</p></a></li>' % (
                E(n["beat"]), beat_cat(n["beat"]), note_path(n), E(tr(BEATS[n["beat"]], lang)), n["date"], E(day(n["date"], lang)),
                hx, '' if th or lang == "en" else ' lang="en"', E(title), hx,
                '<p class="s-th" lang="%s">%s</p>' % ("en" if th else "th", E(other)) if other else "",
                E(dek)))


# ---------------------------------------------------------------- pages

def org_ld():
    return {"@type": "Organization", "@id": SITE + "/studio/#org", "name": "Hongdam Studio", "alternateName": "หงส์ดำ สตูดิโอ",
            "url": SITE + "/studio/", "parentOrganization": {"@id": SITE + "/#org"}, "email": B.MAIL,
            "address": {"@type": "PostalAddress", "addressLocality": "Chiang Rai", "addressCountry": "TH"},
            "knowsAbout": ["vibe coding", "web security", "large language models", "machine learning", "workflow automation"]}


def practice_ld(lang):
    out = []
    g = vars(B)
    for p in S["practices"]:
        items = []
        for cid in p["cards"]:
            c = CARDS.get(cid)
            if not c:
                continue
            s = {"@type": "Service", "name": B.tr(c["n"], lang), "description": B.tr(c["l"], lang), "provider": {"@id": SITE + "/studio/#org"}}
            go, _ = B.go_of(c, lang)
            if go:
                s["url"] = SITE + go if go.startswith("/") else go
            offers = [x for x in (seo.offer(g, lang, c, o) for o in c.get("opts", [])) if x] if c["act"] == "buy" else []
            if len(offers) == 1:
                s["offers"] = offers[0]
            elif offers:
                s["offers"] = offers
            items.append(s)
        out.append({"@type": "OfferCatalog", "name": tr(p["n"], lang), "itemListElement": items})
    return out


def front(lang, ns):
    u = ui(lang)
    path = B.pre(lang) + "studio/"
    alts = {l: B.pre(l) + "studio/" for l in LANGS}
    ld = [org_ld(), {"@type": "WebPage", "@id": SITE + "/" + path, "url": SITE + "/" + path, "name": u["title"], "inLanguage": lang,
                     "isPartOf": {"@id": SITE + "/#site"}, "about": {"@id": SITE + "/studio/#org"},
                     "mainEntity": {"@type": "OfferCatalog", "name": u["name"], "itemListElement": practice_ld(lang)}}]
    out = head(lang, u["title"], u["desc"], path, alts, og="og/studio/front.jpg", og_alt=card_alt("front"), ld=ld)
    out += '<body class="studio s-front">\n' + top(lang, [(l, "/" + p) for l, p in alts.items()])
    out += '<div class="s-room">\n' + bar(lang) + '<section class="s-hero s-wrap">\n'
    out += '<p class="s-kicker">%s</p>\n<h1>%s</h1>\n<p class="s-lede">%s</p>\n' % (E(u["kicker"]), E(u["h1"]), E(u["lede"]))
    notes_url = B.url(lang if lang in NOTE_LANGS else "en", "studio/notes/")
    out += '<p class="s-cta"><a class="s-btn" href="#contact">%s</a> <a class="s-btn alt" href="%s">%s</a></p>\n' % (
        E(B.SHOP["ui"][lang]["askBtn"]), notes_url, E(u["ctaNotes"]))
    out += '<p class="s-counts">%s</p>\n' % E(fill(u["counts"], lang, len(ns)))
    out += '<button class="s-swan" type="button" aria-label="Hongdam">%s</button>\n' % B.db("hongsa", play="loop")
    out += '</section>\n</div>\n<main id="main">\n'
    # practices
    out += '<section id="practices" class="s-wrap"><h2 class="s-h">%s</h2>\n<ol class="s-practices">\n' % E(u["practicesH"])
    for i, p in enumerate(S["practices"], 1):
        cs = [CARDS[cid] for cid in p["cards"] if cid in CARDS]
        rows = "".join(svc_row(c, lang) for c in cs[:SHOW])
        if len(cs) > SHOW:
            rows += '<li class="s-rest"><details><summary>%s</summary><ul class="s-svc">%s</ul></details></li>' % (
                E(u["more"].replace("{n}", str(len(cs) - SHOW))), "".join(svc_row(c, lang) for c in cs[SHOW:]))
        cat = CATS[p["cat"]]
        out += ('<li class="s-pr" id="%s" style="--line:var(--c-%s)"><p class="s-idx">%02d</p><h3>%s</h3>%s<p class="s-pl">%s</p>'
                '<ul class="s-svc">%s</ul><p class="s-more"><a href="%s">%s</a></p></li>\n' % (
                    p["id"], p["cat"], i, E(tr(p["n"], lang)), B.job(p["line"], lang, cls="s-line"), E(tr(p["l"], lang)), rows,
                    B.url(lang, cat["id"] + "/"), E(u["allIn"].replace("{cat}", B.tr(cat["n"], lang)))))
    out += '</ol></section>\n'
    # notes
    out += '<section id="notes" class="s-wrap"><h2 class="s-h">%s</h2>\n<p class="s-sub">%s</p>\n' % (E(u["notesH"]), E(u["notesL"]))
    if u.get("notesLang"):
        out += '<p class="s-sub s-small">%s</p>\n' % E(u["notesLang"])
    out += '<ul class="s-notes">%s</ul>\n' % "".join(note_card(n, lang) for n in ns[:3])
    out += '<p class="s-links"><a class="s-btn alt" href="%s">%s</a> <a href="/studio/feed.xml">Atom feed</a> · <a href="/studio/feed.json">JSON Feed</a></p></section>\n' % (
        notes_url, E(u["notesAll"]))
    # work
    out += '<section id="work" class="s-wrap"><h2 class="s-h">%s</h2>\n<ul class="s-work">' % E(u["workH"])
    for w in S["work"]:
        out += '<li><a href="%s"%s>%s<h3>%s</h3><p>%s</p><p class="s-host">%s</p></a></li>' % (
            E(w["href"]), ' rel="noopener"' if w["href"].startswith("http") else "", B.job(w["line"], lang, cls="s-line s-mini"),
            E(tr(w["n"], lang)), E(fill(tr(w["l"], lang), lang)), E(w["host"]))
    out += '</ul>\n<p class="s-links"><a class="s-btn alt" href="/portfolio/">%s</a></p></section>\n' % E(u["workAll"])
    # who
    out += '<section id="who" class="s-room s-who"><div class="s-wrap"><h2 class="s-h">%s</h2><blockquote><p>%s</p></blockquote></div></section>\n' % (
        E(u["whoH"]), E(fill(u["who"], lang)))
    # contact
    crew = CARDS.get(S.get("contact_card"))
    out += '<section id="contact" class="s-wrap"><h2 class="s-h">%s</h2>\n<p class="s-sub">%s</p>\n' % (E(u["contactH"]), E(u["contactL"]))
    out += '<p class="s-cta"><a class="s-btn line" href="%s">LINE @964yxgnk</a> <a class="s-btn alt" href="mailto:%s">%s</a> <a class="s-btn alt" href="%s">%s</a></p>\n' % (
        B.LINE_URL, B.MAIL, B.MAIL, B.url(lang, "ask/?about=studio"), E(B.SHOP["ui"][lang]["askBtn"]))
    if crew:
        out += '<ul class="s-svc s-crew">%s</ul>\n' % svc_row(crew, lang)
    out += '</section>\n</main>\n' + foot(lang)
    return out


def notes_index(lang, ns):
    u = ui(lang)
    path = B.pre(lang) + "studio/notes/"
    alts = {l: B.pre(l) + "studio/notes/" for l in NOTE_LANGS}
    title = "%s · %s" % (u["notesH"], u["name"])
    desc = "%s %s" % (u["notesL"], fill(u["counts"].split(" · ")[0], lang, len(ns)))
    ld = [org_ld(), {"@type": "Blog", "@id": SITE + "/studio/notes/#blog", "name": "Hongdam Studio notes", "url": SITE + "/" + path,
                     "inLanguage": "en", "publisher": {"@id": SITE + "/studio/#org"},
                     "blogPost": [{"@type": "BlogPosting", "headline": n["title"], "datePublished": n["date"], "url": SITE + "/" + note_path(n)} for n in ns[:50]]}]
    out = head(lang, title, desc, path, alts, og="og/studio/notes.jpg", og_alt=card_alt("notes"), ld=ld)
    out += '<body class="studio s-index">\n' + top(lang, [(l, "/" + p) for l, p in alts.items()])
    out += '<div class="s-room">\n' + bar(lang, "notes") + '<section class="s-hero s-wrap s-short">\n'
    out += '<p class="s-kicker">%s</p>\n<h1>%s</h1>\n<p class="s-lede">%s</p>\n' % (E(u["kicker"]), E(u["notesH"]), E(u["notesL"]))
    out += '<p class="s-counts">%s · <a href="/studio/feed.xml">Atom feed</a> · <a href="/studio/feed.json">JSON Feed</a></p>\n' % E(
        fill(u["counts"].split(" · ")[0], lang, len(ns)))
    out += '</section>\n</div>\n<main id="main" class="s-wrap">\n'
    if u.get("notesLang"):
        out += '<p class="s-sub s-small">%s</p>\n' % E(u["notesLang"])
    present = [b for b in BEATS if any(n["beat"] == b for n in ns)]
    out += '<nav class="s-chips" aria-label="%s"><a href="?" data-beat="" aria-current="true">%s</a>%s</nav>\n' % (
        E(u["notesH"]), E(u["beatAll"]), "".join(
            '<a href="?beat=%s" data-beat="%s" style="--line:var(--c-%s)">%s</a>' % (b, b, beat_cat(b), E(tr(BEATS[b], lang))) for b in present))
    out += '<ul class="s-notes s-all">%s</ul>\n' % "".join(note_card(n, lang, "h2") for n in ns)
    out += '</main>\n' + foot(lang)
    return out


def note_page(n, ns):
    lang = "en"
    u = ui(lang)
    i = ns.index(n)
    newer, older = (ns[i - 1] if i > 0 else None), (ns[i + 1] if i + 1 < len(ns) else None)
    path = note_path(n)
    srcs = n.get("sources", [])
    ld = [org_ld(), {"@type": "BlogPosting", "@id": SITE + "/" + path, "url": SITE + "/" + path, "headline": n["title"],
                     "alternativeHeadline": n.get("title_th", ""), "description": n["dek"], "datePublished": n["date"],
                     "dateModified": n.get("updated", n["date"]), "inLanguage": "en", "wordCount": M.words(n["body"]),
                     "author": {"@id": SITE + "/studio/#org"}, "publisher": {"@id": SITE + "/studio/#org"},
                     "image": SITE + "/og/studio/n/%s.jpg" % n["slug"], "isPartOf": {"@id": SITE + "/studio/notes/#blog"},
                     "articleSection": tr(BEATS[n["beat"]], "en"), "citation": [s["u"] for s in srcs]}]
    out = head(lang, "%s · Hongdam Studio" % n["title"], n["dek"], path, og="og/studio/n/%s.jpg" % n["slug"],
               og_alt=card_alt("note", n), ld=ld, kind="article")
    out = out.replace("</head>", '<meta property="article:published_time" content="%s">\n</head>' % n["date"])
    out += '<body class="studio s-notepage">\n' + top(lang, [])
    out += '<div class="s-room">\n' + bar(lang, "notes") + '</div>\n'
    out += '<main id="main" class="s-wrap"><article class="s-note" style="--line:var(--c-%s)">\n' % beat_cat(n["beat"])
    out += '<p class="s-meta"><a class="s-beat" href="/studio/notes/?beat=%s">%s</a> · <time datetime="%s">%s</time> · %s</p>\n' % (
        n["beat"], E(tr(BEATS[n["beat"]], "en")), n["date"], E(day(n["date"], "en")), E(u["minRead"].replace("{n}", str(n["min"]))))
    out += '<h1>%s</h1>\n' % E(n["title"])
    if n.get("title_th"):
        out += '<p class="s-th" lang="th">%s</p>\n' % E(n["title_th"])
    out += '<p class="s-dek">%s</p>\n' % E(n["dek"])
    out += B.job(beat_line(n["beat"]), lang, cls="s-line") + "\n"
    out += '<div class="s-body">\n%s\n</div>\n' % n["html"]
    if n.get("dek_th"):
        out += '<aside class="s-thsum" lang="th"><h2>สรุปภาษาไทย</h2><p>%s</p></aside>\n' % E(n["dek_th"])
    if srcs:
        out += '<section class="s-src" id="sources"><h2>Sources</h2><ol>%s</ol></section>\n' % "".join(
            '<li id="s%d"><a href="%s" rel="noopener">%s</a> <span class="s-host">%s</span></li>' % (
                k, E(s["u"]), E(s["t"]), E(re.sub(r"^www\.", "", re.sub(r"^https?://([^/]+).*", r"\1", s["u"])))) for k, s in enumerate(srcs, 1))
    rows = "".join(svc_row(CARDS[c], lang) for c in n.get("cards", []) if c in CARDS)
    if rows:
        out += '<section class="s-buy"><h2>Hongdam Studio services on this topic</h2><ul class="s-svc">%s</ul></section>\n' % rows
    pn = ""
    if older:
        pn += '<a class="s-old" href="/%s"><span>← Older note</span>%s</a>' % (note_path(older), E(older["title"]))
    if newer:
        pn += '<a class="s-new" href="/%s"><span>Newer note →</span>%s</a>' % (note_path(newer), E(newer["title"]))
    out += '<nav class="s-pn" aria-label="More notes">%s</nav>\n' % pn
    out += '<p class="s-links"><a class="s-btn alt" href="/studio/notes/">%s</a> <a href="/studio/feed.xml">Atom feed</a> · <a href="/studio/feed.json">JSON Feed</a></p>\n' % E(u["notesAll"])
    out += '</article></main>\n' + foot(lang)
    return out


# ---------------------------------------------------------------- feeds, sitemap, llms.txt, cards

def stamp(n):
    return n["date"] + "T06:00:00+07:00"


def atom(ns):
    x = E
    upd = stamp(ns[0]) if ns else datetime.date.today().isoformat() + "T06:00:00+07:00"
    out = ['<?xml version="1.0" encoding="utf-8"?>', '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">',
           '<title>Hongdam Studio notes</title>', '<subtitle>%s</subtitle>' % x(ui("en")["notesL"]),
           '<link rel="alternate" type="text/html" href="%s/studio/notes/"/>' % SITE, '<link rel="self" href="%s/studio/feed.xml"/>' % SITE,
           '<id>%s/studio/notes/</id>' % SITE, '<updated>%s</updated>' % upd, '<icon>%s/assets/favicon.svg</icon>' % SITE,
           '<author><name>Hongdam Studio</name><uri>%s/studio/</uri></author>' % SITE]
    for n in ns[:FEED_N]:
        u = SITE + "/" + note_path(n)
        out += ['<entry>', '<title>%s</title>' % x(n["title"]), '<link rel="alternate" type="text/html" href="%s"/>' % u,
                '<id>tag:hongdam.net,%s:studio/%s</id>' % (n["date"], n["slug"]), '<published>%s</published>' % stamp(n),
                '<updated>%s</updated>' % (n.get("updated", n["date"]) + "T06:00:00+07:00"),
                '<category term="%s" label="%s"/>' % (n["beat"], x(tr(BEATS[n["beat"]], "en"))),
                '<summary>%s</summary>' % x(n["dek"]), '<content type="html">%s</content>' % x(n["html"]), '</entry>']
    return "\n".join(out + ["</feed>"]) + "\n"


def jsonfeed(ns):
    items = [{"id": SITE + "/" + note_path(n), "url": SITE + "/" + note_path(n), "title": n["title"], "summary": n["dek"],
              "content_html": n["html"], "date_published": stamp(n), "tags": [n["beat"]], "language": "en",
              "image": SITE + "/og/studio/n/%s.jpg" % n["slug"],
              "_hongdam": {"title_th": n.get("title_th", ""), "summary_th": n.get("dek_th", ""), "sources": n.get("sources", [])}}
             for n in ns[:FEED_N]]
    return json.dumps({"version": "https://jsonfeed.org/version/1.1", "title": "Hongdam Studio notes", "home_page_url": SITE + "/studio/notes/",
                       "feed_url": SITE + "/studio/feed.json", "description": ui("en")["notesL"], "icon": SITE + "/og/studio/front.jpg",
                       "favicon": SITE + "/assets/favicon.svg", "language": "en",
                       "authors": [{"name": "Hongdam Studio", "url": SITE + "/studio/"}], "items": items}, ensure_ascii=False, indent=1) + "\n"


def sitemap(ns):
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
    alts = {l: B.pre(l) + "studio/" for l in LANGS}
    for l, q in alts.items():
        row(SITE + "/" + q, q + "index.html", alts)
    alts = {l: B.pre(l) + "studio/notes/" for l in NOTE_LANGS}
    for l, q in alts.items():
        row(SITE + "/" + q, q + "index.html", alts)
    for n in ns:
        row(SITE + "/" + note_path(n), note_path(n) + "index.html", {}, n.get("updated", n["date"]))
    block = "<!-- STUDIO:START -->\n" + "".join(rows) + "  <!-- STUDIO:END -->"
    if "<!-- STUDIO:START -->" in xml:
        a, b = xml.index("<!-- STUDIO:START -->"), xml.index("<!-- STUDIO:END -->") + len("<!-- STUDIO:END -->")
        xml = xml[:a] + block + xml[b:]
    else:
        i = xml.rindex("</urlset>")
        xml = xml[:i] + "  " + block + "\n" + xml[i:]
    open(p, "w", encoding="utf-8").write(xml)


def llms(ns):
    p = os.path.join(DOCS, "llms.txt")
    txt = open(p, encoding="utf-8").read()
    lines = ["## Hongdam Studio", "",
             "Hongdam Studio is the technology part of Hongdam, a small company in Chiang Rai, Thailand. It finishes and publishes apps that AI tools wrote (vibe-coded apps), closes security holes, and works with AI language models, machine learning and workflow automation. Page: https://hongdam.net/studio/ (also in Thai, Burmese, Chinese and German under /th/studio/, /my/studio/, /zh/studio/ and /de/studio/).",
             "Prices are the prices in Hongdam's shop and change when the shop changes them.", ""]
    for pr in S["practices"]:
        lines.append("- %s: %s Services: %s." % (pr["n"]["en"], pr["l"]["en"], ", ".join(
            "%s (https://hongdam.net%s)" % (B.tr(CARDS[c]["n"], "en"), B.go_of(CARDS[c], "en")[0]) for c in pr["cards"] if c in CARDS and B.go_of(CARDS[c], "en")[0].startswith("/"))))
    lines += ["", "Notes on our work, newest first: https://hongdam.net/studio/notes/ · Atom https://hongdam.net/studio/feed.xml ·",
              "JSON Feed https://hongdam.net/studio/feed.json. A note lists its sources at the end.", ""]
    for n in ns[:12]:
        lines.append("- %s · %s — https://hongdam.net/%s" % (n["date"], n["title"], note_path(n)))
    block = "\n".join(lines) + "\n\n"
    m = re.search(r"^## Hongdam Studio\n.*?(?=^## )", txt, flags=re.S | re.M)
    if m:
        txt = txt[:m.start()] + block + txt[m.end():]
    else:
        i = txt.find("\n## The work")
        txt = (txt[:i + 1] + block + txt[i + 1:]) if i >= 0 else txt.rstrip("\n") + "\n\n" + block
    open(p, "w", encoding="utf-8").write(txt)


def card_alt(kind, n=None):
    if kind == "note":
        return "Hongdam Studio · %s · %s — hongdam.net/studio" % (tr(BEATS[n["beat"]], "en"), n["title"])
    if kind == "notes":
        return "Hongdam Studio · Notes — AI models, security, finishing AI-written apps, automation · hongdam.net/studio"
    return "Hongdam Studio · The last mile — finishing AI-written apps, security, AI models, automation · hongdam.net/studio"


def cards_list(ns):
    hue = lambda cat: {"web": 258, "fix": 292, "ai": 205, "data": 225, "design": 322}.get(cat, 258)  # noqa: E731
    out = [{"out": "og/studio/front", "kicker": "Hongdam Studio · Chiang Rai", "title": "The last mile.",
            "th": "งานเทคที่ค้างอยู่ เราปิดให้จบ", "sub": "AI-written apps finished · security · AI models · automation",
            "line": ["robot", "laptop", "wrench", "lock"], "hue": 258},
           {"out": "og/studio/notes", "kicker": "Hongdam Studio · Notes", "title": "Notes on our work.",
            "th": "บันทึกเกี่ยวกับงานของเรา", "sub": "We test AI models, find security holes, publish fixes with code.",
            "line": ["typewriter", "page", "send"], "hue": 205}]
    for n in ns:
        c = n.get("card", {})
        out.append({"out": "og/studio/n/" + n["slug"], "kicker": "Hongdam Studio · %s · %s" % (tr(BEATS[n["beat"]], "en"), day(n["date"], "en")),
                    "title": c.get("big", n["title"]), "th": c.get("th", n.get("title_th", "")), "sub": c.get("sub", ""),
                    "line": beat_line(n["beat"]), "hue": hue(beat_cat(n["beat"]))})
    for c in out:
        c["hash"] = hashlib.sha1(json.dumps(c, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:10]
    json.dump(out, open(os.path.join(HERE, "data", "studio", "cards.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return out


def main():
    ns = notes()
    n = 0
    for lang in LANGS:
        B.write(B.pre(lang) + "studio/index.html", front(lang, ns)); n += 1
    for lang in NOTE_LANGS:
        B.write(B.pre(lang) + "studio/notes/index.html", notes_index(lang, ns)); n += 1
    for note in ns:
        B.write(note_path(note) + "index.html", note_page(note, ns)); n += 1
    keep = {note_path(x) for x in ns}
    for d in glob.glob(os.path.join(DOCS, "studio", "notes", "*", "")):
        rel = os.path.relpath(d, DOCS) + "/"
        if rel not in keep and os.path.exists(os.path.join(d, "index.html")):
            os.remove(os.path.join(d, "index.html"))
            print("  removed", rel)
    B.write("studio/feed.xml", atom(ns))
    B.write("studio/feed.json", jsonfeed(ns))
    sitemap(ns)
    llms(ns)
    cards_list(ns)
    print("%d Studio pages · %d notes · feeds · sitemap · llms.txt" % (n, len(ns)))
    return 0


if __name__ == "__main__":
    sys.exit(main())

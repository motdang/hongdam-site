#!/usr/bin/env python3
"""Questions: what was asked on a move to Chiang Mai, 2025–26, each linked to the Hongdam card closest to it.

    python3 tools/build_questions.py

Her ask 2026-10-24: her own ChatGPT questions about Chiang Mai and Lanna, her name taken off, spicy and legal ones
in, as a quiet scroll on hongdam.net with each question linked to the service that answers it. Questions naming
people or the facts of her cases, and questions about the royal family, were left out.

data/questions.json holds the questions in the five languages and the card each one links to. This writes
docs/<lang>/questions/ (every question, by category, with a find box), docs/assets/questions-<lang>.json (the
scroll's full list), the QUESTIONS blocks of docs/sitemap.xml and docs/llms.txt, and then the shop's pages again
(tools/build_shop.py), whose front pages draw the scroll from band() here. The scroll is docs/assets/questions.css
and questions.js. A question pointing at a card the shop does not have stops the build.
"""
import hashlib
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(HERE, "docs")
DATA = json.load(open(os.path.join(HERE, "data", "questions.json"), encoding="utf-8"))
E = html.escape
PATH = "questions/"
SHOWN = 24     # questions in the front page's own HTML; questions.js swaps in the full list
_A = [os.path.join(DOCS, "assets", "questions." + x) for x in ("css", "js")]
ASSET_V = hashlib.sha1(b"".join(open(p, "rb").read() for p in _A if os.path.exists(p))).hexdigest()[:8]


def cards(B):
    return {c["id"]: c for c in B.SHOP["cards"]}


def check(B):
    have, bad = cards(B), []
    for i, q in enumerate(DATA["qs"]):
        if q["c"] not in have:
            bad.append("%d %s → no card %s" % (i, q["q"]["en"], q["c"]))
        for lang in B.LANGS:
            if not q["q"].get(lang):
                bad.append("%d %s → no %s" % (i, q["q"]["en"], lang))
    if bad:
        raise SystemExit("data/questions.json:\n  " + "\n  ".join(bad))


def href(B, lang, c):
    return B.url(lang, "%s/#%s" % (c["cat"], c["id"]))


def item(B, lang, q, c):
    return ('<li style="--line:var(--c-%s)"><a href="%s"><span class="qt">%s</span><span class="sv">%s</span></a></li>'
            % (c["cat"], href(B, lang, c), E(q["q"][lang]), E(B.tr(c["n"], lang))))


def spread(qs, n):
    """n questions taken evenly through the list, so the front page's few cover its range."""
    if len(qs) <= n:
        return qs
    return [qs[i * len(qs) // n] for i in range(n)]


def band(lang, B):
    """The scroll on a front page: a short window the questions drift up through, a pause, and the full list."""
    ui, have = DATA["ui"][lang], cards(B)
    qs = [q for q in DATA["qs"] if q["c"] in have]
    if not qs or lang not in DATA["ui"]:
        return ""
    data = "/assets/questions-%s.json?v=%s" % (lang, list_v(B, lang))
    return ('<link rel="stylesheet" href="/assets/questions.css?v=%s">\n'
            '<section class="qs-band" aria-labelledby="qs-h"><h2 id="qs-h">%s</h2>\n<p class="lede">%s</p>\n'
            '<div class="qs-scroll" data-qs="%s" tabindex="0" aria-label="%s"><ul class="qs-list">%s</ul></div>\n'
            '<p class="qs-ctl"><button type="button" class="btn alt qs-pause" aria-pressed="false" data-pause="%s" data-play="%s" hidden>%s</button>'
            ' <a href="%s">%s →</a></p></section>\n'
            '<script defer src="/assets/questions.js?v=%s"></script>\n'
            % (ASSET_V, E(ui["h"]), E(ui["lede"]), data, E(ui["h"]),
               "".join(item(B, lang, q, have[q["c"]]) for q in spread(qs, SHOWN)),
               E(ui["pause"]), E(ui["play"]), E(ui["pause"]), B.url(lang, PATH), E(ui["all"].replace("{n}", str(len(qs)))), ASSET_V))


def full_list(B, lang):
    have = cards(B)
    return [[q["q"][lang], href(B, lang, have[q["c"]]), B.tr(have[q["c"]]["n"], lang), have[q["c"]]["cat"]]
            for q in DATA["qs"] if q["c"] in have]


def list_v(B, lang):
    return hashlib.sha1(json.dumps(full_list(B, lang), ensure_ascii=False).encode()).hexdigest()[:8]


def page(lang, B, F):
    ui, have = DATA["ui"][lang], cards(B)
    qs = [q for q in DATA["qs"] if q["c"] in have]
    n = str(len(qs))
    alts = {l: B.pre(l) + PATH for l in B.LANGS}
    langs = [(l, B.url(l, PATH), B.SHOP["lang_names"][l]) for l in B.LANGS]
    sub, sub_lang = (DATA["ui"]["en"]["h1"], "en") if lang == "th" else (DATA["ui"]["th"]["h1"], "th")
    out = F.head("questions", lang, ui["title"], ui["desc"].replace("{n}", n), B.pre(lang) + PATH, alternates=alts,
                 extra='<link rel="stylesheet" href="/assets/questions.css?v=%s">' % ASSET_V)
    out += F.body("questions") + F.top(lang, langs) + "<main>\n"
    out += F.lead("questions", lang, h1=ui["h1"], sub=sub, sub_lang=sub_lang)
    out += '<p class="lede">%s</p>\n' % E(ui["lede"])
    out += ('<div class="qs-find"><label for="qf" class="field">%s</label><div class="qwrap"><span class="qi">%s</span>'
            '<input id="qf" class="q" type="search" placeholder="%s" autocomplete="off"></div>'
            '<p class="qs-n" role="status" aria-live="polite" data-of="%s" data-none="%s"></p></div>\n'
            % (E(ui["find"]), B.db("search", play="loop"), E(ui["findPh"]), E(ui["of"]), E(ui["none"])))
    for cat in B.SHOP["cats"]:
        mine = [q for q in qs if have[q["c"]]["cat"] == cat["id"]]
        if not mine:
            continue
        out += ('<section class="kind qs-cat" id="c-%s" style="--line:var(--c-%s)"><h2><a href="%s">%s</a></h2><ul class="qs-page">%s</ul></section>\n'
                % (cat["id"], cat["id"], B.url(lang, cat["id"] + "/"), E(B.tr(cat["n"], lang)),
                   "".join(item(B, lang, q, have[q["c"]]) for q in mine)))
    out += B.not_here(lang) + "</main>\n"
    out += '<script defer src="/assets/questions.js?v=%s"></script>\n' % ASSET_V
    return out + B.foot(lang, group="front")    # its glyphs are all in the front page's bundle


def sitemap(B):
    p = os.path.join(DOCS, "sitemap.xml")
    xml = open(p, encoding="utf-8").read()
    alts = "".join('    <xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>\n' % (l, B.SITE, B.url(l, PATH)) for l in B.LANGS)
    alts += '    <xhtml:link rel="alternate" hreflang="x-default" href="%s%s"/>\n' % (B.SITE, B.url("en", PATH))
    import re
    was = dict(re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml))
    from datetime import date
    rows = []
    for l in B.LANGS:
        loc = B.SITE + B.url(l, PATH)
        day = date.today().isoformat() if (B.pre(l) + PATH + "index.html") in B.CHANGED or loc not in was else was[loc]
        rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n%s  </url>\n" % (loc, day, alts))
    block = "<!-- QUESTIONS:START -->\n" + "".join(rows) + "  <!-- QUESTIONS:END -->"
    if "<!-- QUESTIONS:START -->" in xml:
        a, b = xml.index("<!-- QUESTIONS:START -->"), xml.index("<!-- QUESTIONS:END -->") + len("<!-- QUESTIONS:END -->")
        xml = xml[:a] + block + xml[b:]
    else:
        xml = xml.replace("</urlset>", "  " + block + "\n</urlset>")
    open(p, "w", encoding="utf-8").write(xml)


def llms(B, n):
    p = os.path.join(DOCS, "llms.txt")
    s = open(p, encoding="utf-8").read()
    ui = DATA["ui"]["en"]
    block = ("<!-- QUESTIONS:START -->\n## Questions\n\n- [%s](%s%s): %s Also: %s\n<!-- QUESTIONS:END -->" % (
        ui["h1"], B.SITE, B.url("en", PATH), ui["desc"].replace("{n}", str(n)),
        " · ".join("%s %s%s" % (B.SHOP["lang_names"][l], B.SITE, B.url(l, PATH)) for l in B.LANGS[1:])))
    if "<!-- QUESTIONS:START -->" in s:
        a, b = s.index("<!-- QUESTIONS:START -->"), s.index("<!-- QUESTIONS:END -->") + len("<!-- QUESTIONS:END -->")
        s = s[:a] + block + s[b:]
    else:
        s = s.replace("<!-- SERVICES:START -->", block + "\n\n<!-- SERVICES:START -->", 1)
    open(p, "w", encoding="utf-8").write(s)


def main():
    sys.path.insert(0, os.path.join(HERE, "tools"))
    import build_shop as B
    import pages as F
    B.SHOP["cards"] = [c for c in B.SHOP["cards"] if B.ready(c)]
    check(B)
    for lang in B.LANGS:
        B.write(B.pre(lang) + PATH + "index.html", page(lang, B, F))
        B.write("assets/questions-%s.json" % lang, json.dumps(full_list(B, lang), ensure_ascii=False, separators=(",", ":")))
    sitemap(B)
    llms(B, len([q for q in DATA["qs"] if q["c"] in cards(B)]))
    print("%d questions · %d pages" % (len(DATA["qs"]), len(B.LANGS)))
    B.main()    # the front pages carry the scroll
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Black Swan Event? Hongdam Studio is all ears — a minisite inside Hongdam Studio (her ask 2026-10-24: "create a minisite
on hongdam for black swans and black swan predictions. Give it toys and prediction storage. Make it super shareable.
Use very few words. Explain the ones you do use. ESL. ADHD.")

    python3 tools/build_blackswan.py          # pages, sitemap block, llms.txt block, then the Studio pages (their band)
    node tools/blackswan_cards.mjs            # link-preview pictures

Reads data/blackswan.json (words in five languages, the odds and size steps, the past events to vote on). Writes:

    docs/studio/black-swan/            the page, English; docs/<lang>/studio/black-swan/ for th, my, zh, de
    docs/studio/black-swan/one/        one prediction's page, with %%SW_…%% marks that functions/swan/[id].js fills
    docs/sitemap.xml, docs/llms.txt    between BLACKSWAN markers

The toys, the form and the list are docs/assets/blackswan.js and blackswan.css; the predictions are kept by
functions/api/swan/ (D1, migrations/0012_swan.sql). Dingbats: group p-blackswan (data/pages.json "blackswan").
"""
import hashlib
import html
import json
import os
import re
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_shop as B  # noqa: E402
import build_studio as S  # noqa: E402

E = html.escape
HERE, DOCS, SITE = B.HERE, B.DOCS, B.SITE
D = json.load(open(os.path.join(HERE, "data", "blackswan.json"), encoding="utf-8"))
LANGS = D["langs"]
PATH = "studio/black-swan/"
ONE = PATH + "one/"
_A = [os.path.join(DOCS, "assets", "blackswan." + x) for x in ("css", "js")]
V = hashlib.sha1(b"".join(open(p, "rb").read() for p in _A if os.path.exists(p))).hexdigest()[:8]
GROUP = "p-blackswan"


def ui(lang):
    return D["ui"][lang]


def num(n, lang):
    s = "{:,}".format(n)
    return s.replace(",", "’") if lang == "de" else s


def odds_word(k, lang):
    return D["odds_fmt"][lang].replace("{n}", num(D["odds"][k], lang))


def year_word(n, lang):
    u = ui(lang)
    return u["year1"] if n == 1 else u["yearN"].replace("{n}", str(n))


def chips(name, items, checked, legend, cls=""):
    """A row of choices (radio buttons that look like chips). items: [(value, inner html)]."""
    return ('<fieldset class="bs-chips %s"><legend>%s</legend><div>%s</div></fieldset>' % (
        cls, E(legend), "".join('<label><input type="radio" name="%s" value="%s"%s><span>%s</span></label>' % (
            name, v, " checked" if v == checked else "", inner) for v, inner in items)))


def odds_chips(lang, name, checked=3):
    return chips(name, [(str(k), E(odds_word(k, lang))) for k in range(len(D["odds"]))], str(checked), ui(lang)["likely"], "bs-odds")


def size_chips(lang, name, checked=2):
    return chips(name, [(str(k), B.db(g) + "<b>%s</b>" % E(D["size"][lang][k])) for k, g in enumerate(D["size_glyphs"])],
                 str(checked), ui(lang)["big"], "bs-size")


def config(lang):
    u = ui(lang)
    keep = ("t1end", "t3end", "t4res", "votes", "next", "saved", "held", "copy", "copied", "pic", "open", "errShort", "errLink",
            "errLimit", "errAny", "will", "did", "yes", "no", "check", "none", "more", "report", "reportQ", "reported", "del",
            "delQ", "wait", "mineL", "count", "res", "examples", "share", "oneBy", "yesSwan", "notSwan", "h1", "sub", "kicker")
    return {"lang": lang, "ui": {k: u[k] for k in keep}, "odds": [odds_word(k, lang) for k in range(len(D["odds"]))],
            "size": D["size"][lang], "sizeG": D["size_glyphs"], "years": D["years"],
            "quiz": [{"q": q["q"], "y": q["y"], "g": q["g"], "t": u["quiz"][q["q"]], "note": u["notes"].get(q["q"], "")} for q in D["quiz"]],
            "page": B.url(lang, PATH)} | {"ui": {**{k: u[k] for k in keep}, "shareW": B.SHOP["ui"][lang]["share"]}}


def data_script(lang):
    return '<script type="application/json" id="bs-data">%s</script>\n' % json.dumps(config(lang), ensure_ascii=False).replace("</", "<\\/")


def langs_nav(lang, path):
    return [(l, B.url(l, path)) for l in LANGS]


def hero(lang, h1_html, gloss=True, kicker=None):
    u = ui(lang)
    out = '<div class="s-room bs-room">\n' + S.bar(lang) + '<section class="s-hero s-wrap bs-hero">\n'
    out += '<p class="s-kicker">%s</p>\n<h1>%s</h1>\n' % (E(kicker or u["kicker"]), h1_html)
    if gloss:
        out += '<dl class="bs-gloss">%s</dl>\n' % "".join('<div><dt>%s</dt><dd>%s</dd></div>' % (E(t), E(d)) for t, d in u["gloss"])
    return out


def share_big(lang):
    """The Share button after a prediction is saved and on its page: share.js shares data-share, which blackswan.js sets
    to /swan/<id> (empty: the page it is on)."""
    return '<button type="button" class="s-btn share bs-share-it" data-share="">%s<span>%s</span></button>' % (B.SHARE_ICON, E(B.SHOP["ui"][lang]["share"]))


def photo(lang):
    """Her photo of a bronze hongsa (data/blackswan.json "photo"), CC BY 4.0 with her name; tap to look closer."""
    P = D["photo"]
    sizes = "(min-width: 68rem) 64rem, calc(100vw - 2rem)"
    pre, post = P["credit"][lang]
    return ('<figure class="s-wrap bs-photo" id="photo"><div class="bs-frame"><picture>'
            '<source type="image/webp" srcset="%s-900.webp 900w, %s.webp 1600w" sizes="%s">'
            '<img src="%s-900.jpg" srcset="%s-900.jpg 900w, %s.jpg 1600w" sizes="%s" width="%d" height="%d" alt="%s" decoding="async"></picture></div>'
            '<figcaption><span class="bs-cap">%s</span> <span class="bs-credit">%s <a href="%s">%s</a> · <a href="%s" rel="license">%s</a> %s</span></figcaption></figure>\n' % (
                P["src"], P["src"], sizes, P["src"], P["src"], P["src"], sizes, P["w"], P["h"], E(P["alt"][lang]),
                E(P["cap"][lang]), E(pre), P["by_url"], E(P["by"]), P["license"], E(P["license_name"]), E(post)))


def photo_ld(lang):
    P = D["photo"]
    return {"@type": "ImageObject", "@id": SITE + "/assets/photo/hongsa-weight.jpg", "contentUrl": SITE + P["src"] + ".jpg",
            "url": SITE + P["src"] + ".jpg", "width": P["w"], "height": P["h"], "caption": P["cap"][lang], "description": P["alt"][lang],
            "inLanguage": lang, "creator": {"@type": "Person", "name": P["by"], "url": SITE + P["by_url"]},
            "creditText": "Photo: " + P["by"], "copyrightNotice": "© " + P["by"], "copyrightHolder": {"@type": "Person", "name": P["by"]},
            "license": P["license"], "acquireLicensePage": SITE + B.url(lang, PATH) + "#photo"}


def toy(n, tid, title, line, inner):
    return ('<article class="bs-toy" id="%s"><header><p class="s-idx">%02d</p><h3>%s</h3><p class="bs-line">%s</p></header>\n%s</article>\n'
            % (tid, n, E(title), E(line), inner))


def toys(lang):
    u = ui(lang)
    t1 = ('<div class="bs-board bs-pond" tabindex="0" role="button" aria-label="%s"><div class="bs-swim" aria-hidden="true"></div>'
          '<p class="bs-tally"><output class="bs-n" aria-live="polite">0</output> <span>%s</span></p>'
          '<div class="bs-over" hidden><p class="bs-big">%s</p><p>%s</p><p class="bs-why">%s</p><button type="button" class="s-btn bs-again">%s</button></div></div>\n'
          '<p class="bs-ctl"><button type="button" class="s-btn bs-look">%s</button></p>\n' % (
              E(u["t1btn"]), E(u["t1n"]), E(u["t1end"]), E(u["t1hist"]), E(u["t1why"]), E(u["again"]), E(u["t1btn"])))
    t2 = ('<div class="bs-board bs-meter"><button type="button" class="bs-pair" aria-label="Hongdam"><span class="bs-w">%s</span><span class="bs-b">%s</span></button>'
          '<p class="bs-res" aria-live="polite">%s</p></div>\n%s%s'
          '<p class="bs-ctl"><a class="s-btn bs-carry" href="#predict">%s →</a></p>\n' % (
              B.db("hongsa", play="loop"), B.db("hongsa", play="loop"), E(u["res"][3]),
              odds_chips(lang, "m-odds"), size_chips(lang, "m-size"), E(u["t2btn"])))
    t3 = ('<div class="bs-board bs-chart"><canvas aria-hidden="true"></canvas><span class="bs-mark" hidden>%s</span>'
          '<p class="bs-tally"><output class="bs-n" aria-live="polite">0</output> <span>%s</span></p><div class="bs-over" hidden><p class="bs-big"></p>'
          '<button type="button" class="s-btn bs-again">%s</button></div></div>\n'
          '<p class="bs-ctl"><button type="button" class="s-btn bs-next">%s</button> <span class="bs-hint">%s</span></p>\n' % (
              B.db("hongsa", play="loop"), E(u["t3n"]), E(u["again"]), E(u["t3btn"]), E(u["t3hold"])))
    q0 = D["quiz"][0]
    t4 = ('<div class="bs-board bs-quiz"><p class="bs-year">%s</p><span class="bs-qg">%s</span><p class="bs-what">%s</p>'
          '<div class="bs-poll" hidden><div class="bs-bar"><i></i></div><p class="bs-pct" aria-live="polite"></p><p class="bs-note"></p></div></div>\n'
          '<p class="bs-ctl"><button type="button" class="s-btn" data-v="y">%s</button> <button type="button" class="s-btn alt" data-v="n">%s</button>'
          ' <button type="button" class="s-btn alt bs-nextq">%s →</button> <span class="bs-step">1 / %d</span></p>\n' % (
              E(q0["y"]), B.db(q0["g"], play="loop"), E(u["quiz"][q0["q"]]), E(u["yesSwan"]), E(u["notSwan"]), E(u["next"]), len(D["quiz"])))
    return ('<section id="toys" class="s-wrap"><h2 class="s-h">%s</h2>\n<div class="bs-toys">\n%s%s%s%s</div></section>\n' % (
        E(u["toysH"]), toy(1, "t-count", u["t1"], u["t1l"], t1), toy(2, "t-meter", u["t2"], u["t2l"], t2),
        toy(3, "t-days", u["t3"], u["t3l"], t3), toy(4, "t-quiz", u["t4"], u["t4l"], t4)))


def form(lang):
    u = ui(lang)
    years = chips("years", [(str(n), E(year_word(n, lang))) for n in D["years"]], "5", u["when"], "bs-years")
    return ('<section id="predict" class="s-wrap"><h2 class="s-h">%s</h2>\n<p class="s-sub">%s</p>\n'
            '<form id="bs-form" class="bs-form" novalidate>\n'
            '<label class="bs-lab" for="bs-text">%s</label>\n<div class="bs-tw"><textarea id="bs-text" name="text" rows="3" maxlength="200" required placeholder="%s"></textarea>'
            '<span class="bs-left" aria-hidden="true">200</span></div>\n%s%s%s<p class="bs-hint">%s</p>\n'
            '<label class="bs-lab" for="bs-name">%s</label>\n<input id="bs-name" name="name" maxlength="40" autocomplete="nickname">\n'
            '<p class="bs-err" role="alert" hidden></p>\n<p><button class="s-btn bs-save" type="submit">%s</button></p>\n</form>\n'
            '<div class="bs-done" hidden><p class="bs-ok" aria-live="polite"></p><div class="bs-shot"><img alt=""></div>'
            '<p class="bs-acts">%s <button type="button" class="s-btn alt bs-pic">%s</button>'
            ' <button type="button" class="s-btn alt bs-copy">%s</button> <a class="s-btn alt bs-open" href="#">%s</a></p></div>\n</section>\n' % (
                E(u["formH"]), E(u["formL"]), E(u["what"]), E(u["examples"][0]),
                odds_chips(lang, "odds"), size_chips(lang, "size"), years, E(u["whenL"]), E(u["name"]), E(u["save"]),
                share_big(lang), E(u["pic"]), E(u["copy"]), E(u["open"])))


def pond(lang):
    u = ui(lang)
    tabs = "".join('<button type="button" role="tab" data-sort="%s" aria-selected="%s">%s</button>' % (k, "true" if k == "new" else "false", E(v))
                   for k, v in u["tabs"].items())
    return ('<section id="pond" class="s-wrap"><h2 class="s-h">%s</h2>\n<div class="bs-tabs" role="tablist">%s</div>\n'
            '<p class="bs-mine-l" hidden>%s</p>\n<ol class="bs-list" aria-live="polite"></ol>\n'
            '<p><button type="button" class="s-btn alt bs-more" hidden>%s</button></p></section>\n' % (
                E(u["pondH"]), tabs, E(u["mineL"]), E(u["more"])))


def words(lang):
    u = ui(lang)
    return ('<section id="words" class="s-wrap"><h2 class="s-h">%s</h2>\n<dl class="bs-words">%s</dl></section>\n' % (
        E(u["wordsH"]), "".join("<div><dt>%s</dt><dd>%s</dd></div>" % (E(t), E(d)) for t, d in u["words"])))


def studio_band(lang):
    u = ui(lang)
    return ('<section class="s-room bs-studio"><div class="s-wrap"><h2>%s</h2><p>%s</p>'
            '<p class="s-cta"><a class="s-btn" href="%s">%s</a> <a class="s-btn alt" href="%s">%s</a> <a class="s-btn line" href="%s">LINE</a></p></div></section>\n' % (
                E(u["studioH"]), E(u["studioL"]), B.url(lang, "ask/?about=studio"), E(u["write"]), B.url(lang, "studio/"), E(u["studio"]), B.LINE_URL))


def foot(lang):
    f = B.foot(lang, group=GROUP)
    return f.replace("</body>", '<script type="module" src="/assets/studio.js?v=%s"></script>\n<script type="module" src="/assets/blackswan.js?v=%s"></script>\n</body>' % (S.V_JS, V))


def head(lang, title, desc, path, og, og_alt, ld=None):
    alts = {l: B.pre(l) + path for l in LANGS}
    out = S.head(lang, title, desc, B.pre(lang) + path, alts, og=og, og_alt=og_alt, ld=ld)
    return out.replace("</head>", '<link rel="stylesheet" href="/assets/blackswan.css?v=%s">\n</head>' % V)


def card_alt(lang):
    return "%s — Hongdam Studio · hongdam.net/studio/black-swan" % ui(lang)["title"]


def page(lang):
    u = ui(lang)
    here = SITE + "/" + B.pre(lang) + PATH
    ld = [S.org_ld(), {"@type": "WebPage", "@id": here, "url": here, "name": u["title"], "description": u["desc"], "inLanguage": lang,
                       "isPartOf": {"@id": SITE + "/#site"}, "about": {"@type": "Thing", "name": "Black swan theory",
                                                                     "sameAs": "https://en.wikipedia.org/wiki/Black_swan_theory"},
                       "publisher": {"@id": SITE + "/studio/#org"}, "primaryImageOfPage": {"@id": SITE + "/assets/photo/hongsa-weight.jpg"}},
          photo_ld(lang)]
    out = head(lang, u["title"], u["desc"], PATH, "og/studio/black-swan-%s.jpg" % lang, card_alt(lang), ld)
    out += '<body class="studio bs">\n' + S.top(lang, langs_nav(lang, PATH))
    out += hero(lang, '%s<small>%s</small>' % (E(u["h1"]).replace("หงส์ดำ", '<span class="nw">หงส์ดำ</span>'), E(u["sub"])))
    out += ('<p class="s-cta"><a class="s-btn" href="#predict">%s</a> <a class="s-btn alt" href="#toys">%s</a> %s</p>\n'
            '<p class="s-counts bs-count" aria-live="polite"></p>\n'
            '<button class="s-swan bs-ears" type="button" aria-label="Hongdam">%s<span class="bs-wave" aria-hidden="true">%s</span></button>\n'
            '</section>\n</div>\n<main id="main">\n' % (
                E(u["predict"]), E(u["play"]), B.share_btn(lang, title=u["share"]), B.db("hongsa", play="loop"), B.db("sound", play="loop")))
    out += photo(lang) + toys(lang) + form(lang) + pond(lang) + words(lang) + studio_band(lang)
    out += '</main>\n<a class="bs-fab" href="#predict" hidden>＋ %s</a>\n' % E(u["predict"])
    out += data_script(lang)
    return out + foot(lang)


def one(lang):
    """One prediction's page; functions/swan/[id].js fills the marks."""
    u = ui(lang)
    out = head(lang, "%%SW_TITLE%%", "%%SW_DESC%%", ONE, "og/swan/o4.jpg", "%%SW_ALT%%")
    out = out.replace('<link rel="canonical" href="%s">' % (SITE + "/" + B.pre(lang) + ONE), '<link rel="canonical" href="%%SW_URL%%">')
    out = out.replace('content="%s"' % (SITE + "/" + B.pre(lang) + ONE), 'content="%%SW_URL%%"')
    out = out.replace('content="%s/og/swan/o4.jpg"' % SITE, 'content="%%SW_IMG%%"')
    out = re.sub(r'<link rel="alternate" hreflang="[^"]+" href="[^"]+">\n', "", out)
    out = out.replace("</head>", "%%SW_NOINDEX%%\n</head>")
    out += '<body class="studio bs bs-one">\n' + S.top(lang, [(l, "?l=" + l) for l in LANGS])
    out += hero(lang, '<span class="bs-quote">%%SW_H1%%</span>', gloss=False, kicker="%s · %s" % (u["h1"], u["sub"]))
    out += ('<div class="bs-card" id="bs-one"><p class="bs-meta"></p><p class="bs-by"></p></div>\n'
            '<div class="bs-vote1"></div>\n'
            '<p class="s-cta">%s <button type="button" class="s-btn alt bs-pic">%s</button>'
            ' <button type="button" class="s-btn alt bs-copy">%s</button></p>\n'
            '</section>\n</div>\n<main id="main">\n'
            '<section class="s-wrap bs-make"><h2 class="s-h">%s</h2><p class="s-sub">%s</p><p class="s-cta"><a class="s-btn" href="%s#predict">%s →</a> <a class="s-btn alt" href="%s#toys">%s</a></p></section>\n'
            '<section class="s-wrap"><h2 class="s-h">%s</h2><ol class="bs-list bs-few" aria-live="polite"></ol><p><a class="s-btn alt" href="%s#pond">%s →</a></p></section>\n' % (
                share_big(lang), E(u["pic"]), E(u["copy"]),
                E(u["sub"]), E(u["gloss"][0][0] + " = " + u["gloss"][0][1]), B.url(lang, PATH), E(u["oneMake"]), B.url(lang, PATH), E(u["play"]),
                E(u["oneMore"]), B.url(lang, PATH), E(u["oneMore"])))
    out += studio_band(lang) + '</main>\n'
    out += '<script type="application/json" id="bs-one-data">%%SW_DATA%%</script>\n' + data_script(lang)
    return out + foot(lang)


def band(lang):
    """The Black Swan link on the Studio front page (tools/build_studio.py front())."""
    u = ui(lang)
    return ('<section class="s-wrap bs-band"><a class="bs-band-a" href="%s"><span class="bs-band-s">%s</span><span><b>%s</b> %s</span><span class="s-go">%s</span></a></section>\n' % (
        B.url(lang, PATH), B.db("hongsa", play="loop"), E(u["h1"]), E(u["sub"]), E(u["play"])))


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
    block = "<!-- BLACKSWAN:START -->\n" + "".join(rows) + "  <!-- BLACKSWAN:END -->"
    if "<!-- BLACKSWAN:START -->" in xml:
        a, b = xml.index("<!-- BLACKSWAN:START -->"), xml.index("<!-- BLACKSWAN:END -->") + len("<!-- BLACKSWAN:END -->")
        xml = xml[:a] + block + xml[b:]
    else:
        i = xml.rindex("</urlset>")
        xml = xml[:i] + "  " + block + "\n" + xml[i:]
    open(p, "w", encoding="utf-8").write(xml)


def llms():
    p = os.path.join(DOCS, "llms.txt")
    s = open(p, encoding="utf-8").read()
    u = ui("en")
    block = ("<!-- BLACKSWAN:START -->\n## Black Swan Event? Hongdam Studio is all ears\n\n"
             "- [%s](%s%s): %s Four toys (counting swans, a swan meter, 100 days, black swan or not), a form to save a prediction "
             "with its odds, size and check date, and the list of saved predictions with votes. One prediction: https://hongdam.net/swan/<id>. "
             "Predictions as JSON: https://hongdam.net/api/swan?sort=new (also top, soon). The photo of a bronze hongsa "
             "(https://hongdam.net/assets/photo/hongsa-weight.jpg) is by Nan Peacock, licensed CC BY 4.0 "
             "(https://creativecommons.org/licenses/by/4.0/): free to use, also commercially, with credit to Nan Peacock. Also: %s\n<!-- BLACKSWAN:END -->" % (
                 u["title"], SITE, B.url("en", PATH), u["desc"],
                 " · ".join("%s %s%s" % (B.SHOP["lang_names"][l], SITE, B.url(l, PATH)) for l in LANGS[1:])))
    if "<!-- BLACKSWAN:START -->" in s:
        a, b = s.index("<!-- BLACKSWAN:START -->"), s.index("<!-- BLACKSWAN:END -->") + len("<!-- BLACKSWAN:END -->")
        s = s[:a] + block + s[b:]
    else:   # beside the Questions block; tools/build_studio.py rewrites its own section up to the next heading
        anchor = "<!-- QUESTIONS:START -->" if "<!-- QUESTIONS:START -->" in s else "<!-- SERVICES:START -->"
        s = s.replace(anchor, block + "\n\n" + anchor, 1) if anchor in s else s.rstrip("\n") + "\n\n" + block + "\n"
    s = re.sub(r"\n## Black Swan Event\? Hongdam Studio is all ears\n\n- \[Black Swan[^\n]*\n<!-- BLACKSWAN:END -->\n?", "\n", s) if s.count("<!-- BLACKSWAN:END -->") > 1 else s
    open(p, "w", encoding="utf-8").write(s)


def check():
    bad = []
    for lang in LANGS:
        u = ui(lang)
        for k, v in ui("en").items():
            if k not in u:
                bad.append("%s: no %s" % (lang, k))
            elif isinstance(v, dict) and set(v) - set(u[k]):
                bad.append("%s: %s lacks %s" % (lang, k, sorted(set(v) - set(u[k]))))
        if len(D["size"][lang]) != len(D["size_glyphs"]):
            bad.append("%s: size steps" % lang)
    for q in D["quiz"]:
        for lang in LANGS:
            if q["q"] not in ui(lang)["quiz"]:
                bad.append("%s: quiz %s" % (lang, q["q"]))
    if bad:
        raise SystemExit("data/blackswan.json:\n  " + "\n  ".join(bad))


def main():
    check()
    for lang in LANGS:
        B.write(B.pre(lang) + PATH + "index.html", page(lang))
        B.write(B.pre(lang) + ONE + "index.html", one(lang))
    sitemap()
    llms()
    print("black swan: %d pages + %d prediction templates" % (len(LANGS), len(LANGS)))
    return 0


if __name__ == "__main__":
    sys.exit(main())

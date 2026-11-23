#!/usr/bin/env python3
"""The five job pages, the software page, and the parts of the front page that come from data/arrange.json.

    python3 tools/build_arrange.py        # job and software pages; then tools/build_shop.py draws the front page

Writes docs/<prefix>arrange/<job>/index.html and docs/<prefix>software/index.html for every language of the shop, and
the ARRANGE block of docs/sitemap.xml and docs/llms.txt. tools/build_shop.py imports this file for the front page
(hero, jobs, who, first, software). A job page puts the decision first: our fee, what it includes, what is paid
separately, time, who, where and when it is done, then Buy at a set price and a request form, then the background
pages. {p:<item>} in the words is the item's price this month (data/services.json), drawn with its live mark so
shop.js shows the walk's number and cur.js the reader's currency. The request form posts to /api/contact with the
job, its main item, the chosen reply channel and the page's language (docs/assets/arrange.js).
"""
import hashlib
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_shop as B  # noqa: E402

E = html.escape
HERE, DOCS, SITE = B.HERE, B.DOCS, B.SITE
A = json.load(open(os.path.join(HERE, "data", "arrange.json"), encoding="utf-8"))
JOBS = A["jobs"]
SOFT = A["software"]
LANGS = B.LANGS
CARDS = {c["id"]: c for c in B.SHOP["cards"]}


def tr(d, lang):
    return B.tr(d, lang)


def ui(lang, k):
    return A["ui"].get(lang, {}).get(k) or A["ui"]["en"][k]


def _v(p):
    f = os.path.join(DOCS, "assets", p)
    return hashlib.sha1(open(f, "rb").read()).hexdigest()[:8] if os.path.exists(f) else "0"


CSS = '<link rel="stylesheet" href="/assets/arrange.css?v=%s">\n' % _v("arrange.css")
JS = '<script type="module" src="/assets/arrange.js?v=%s"></script>\n' % _v("arrange.js")
TOKEN = re.compile(r"\{p:([\w-]+)\}")


def price_span(item):
    it = B.ITEMS[item]
    n = B.walk_num(item, "price", "THB", it.get("baht"))
    return B.live_span(item, "price", "THB", n) if "floor" in it else B.money_h(n)


def words(d, lang):
    """A line of words with its {p:item} prices drawn, and other baht amounts marked."""
    s = E(tr(d, lang))
    s = TOKEN.sub(lambda m: "\x00%s\x00" % m.group(1), s)
    s = B.mark_money(s)
    return re.sub("\x00([\\w-]+)\x00", lambda m: price_span(m.group(1)), s)


def plain(d, lang):
    """The same line as text, for a link preview or a page description."""
    return TOKEN.sub(lambda m: B.money(B.walk_num(m.group(1), "price", "THB", B.ITEMS[m.group(1)].get("baht"))), tr(d, lang))


def path(lang, job=None):
    return B.url(lang, "arrange/%s/" % job["id"] if job else "software/")


def opt_of(ref):
    c = CARDS[ref["c"]]
    return c, next(o for o in c["opts"] if o["i"] == ref["o"])


def job_price(job, lang):
    """What a job's card shows: the quote line for a job priced by asking, its one option's price, or from the lowest."""
    if job.get("card"):
        return words(job["card"], lang)
    if job["rule"] == "quote":
        return E(ui(lang, "quoted"))
    opts = [opt_of(r) for r in job["opts"]]
    if len(opts) == 1:
        return B.opt_price(opts[0][1], lang)[0]
    nums = [B.opt_price(o, lang) for _, o in opts if o.get("u") not in B.TIME_UNITS]
    low = min((n, h) for h, n, cur in nums if cur == "THB" and n)
    return B.SHOP["ui"][lang]["from"].replace("{p}", B.money_h(low[0]))


def job_card(job, lang):
    to = path(lang, job)
    return ('<li class="card job-card" id="job-%s" style="--line:var(--c-%s)">%s<h3><a href="%s">%s</a></h3><p class="price">%s</p>'
            '<p class="l">%s</p>%s<a class="btn" href="%s">%s</a></li>' % (
                job["id"], job["line"], B.job(job["pic"], lang, name="job-a-" + job["id"]), to, E(tr(job["n"], lang)),
                job_price(job, lang), E(tr(job["l"], lang)), B.share_btn(lang, to, tr(job["n"], lang)), to, E(ui(lang, "details"))))


def search_cards(lang):
    """The five jobs in the site's search (docs/assets/shop-<lang>.json), first, found by their names in every language
    and the words customers type (kw: dentist, taxi, plumber, ส่งของ, 代购 …)."""
    out = []
    for j in JOBS:
        words = [j.get("kw", ""), j["id"]] + [tr(j["n"], l) for l in LANGS] + [tr(j["l"], l) for l in LANGS]
        to = path(lang, j)
        out.append({"id": "job-" + j["id"], "act": "open", "n": tr(j["n"], lang), "l": tr(j["l"], lang), "ph": job_price(j, lang),
                    "go": to, "btn": ui(lang, "details"), "kw": " ".join(words).lower(), "page": to, "cat": j["line"], "pic": j["pic"]})
    return out


# ---------------------------------------------------------------- the front page's parts (tools/build_shop.py front())

def hero(lang):
    """The question, the two opening actions (side by side on a phone, arrange.css), and where we work."""
    su = B.SHOP["ui"][lang]
    return ('<h1 class="ask-h1">%s</h1>\n<p class="acts"><a class="btn" href="#jobs">%s</a> <a class="btn alt" href="#software">%s</a></p>\n'
            '<p class="lede">%s</p>\n' % (E(ui(lang, "h1")), E(ui(lang, "act1")), E(ui(lang, "act2")), E(su["place"])))


def jobs_band(lang):
    return '<h2 id="jobs">%s</h2>\n<ul class="cards jobs">%s</ul>\n' % (E(ui(lang, "jobsH")), "".join(job_card(j, lang) for j in JOBS))


def who_band(lang):
    """The people, role first (her word 2026-10-24), with the cartoon still of both of them."""
    pp = A["people"]
    alt = next(g["alt"] for g in B.WORK["groups"] if g.get("alt")) if B.WORK else {"en": ""}
    return ('<h2 id="who">%s</h2>\n<div class="who"><img src="%s" width="%d" height="%d" alt="%s" loading="lazy" decoding="async">'
            '<p>%s</p><p>%s</p></div>\n' % (E(ui(lang, "whoH")), pp["pic"], pp["w"], pp["h"], E(tr(alt, lang)), E(ui(lang, "beer")), E(ui(lang, "nan"))))


def first_band(lang):
    """One purchase with a set fee: scope, what we need, fee, when it is done, and what comes after paying, then Buy."""
    f = A["first"]
    c, o = opt_of({"c": f["card"], "o": f["opt"]})
    go = B.url(lang, "buy/?c=%s&o=%s" % (c["id"], o["i"]))
    rows = [("fee", words(f["fee"], lang)), ("needs", E(tr(f["needs"], lang))), ("done", E(tr(f["done"], lang))), ("after", E(tr(f["after"], lang)))]
    return ('<h2 id="first">%s</h2>\n<div class="first card" style="--line:var(--c-%s)">%s<h3><a href="%s">%s</a></h3><p class="l">%s</p>'
            '<dl class="facts">%s</dl><p class="note">%s</p>%s<a class="btn" href="%s">%s</a></div>\n' % (
                E(ui(lang, "firstH")), c["cat"], B.job(B.pic_of(c), lang, name="job-first"), B.page_of(c, lang) or go, E(tr(c["n"], lang)),
                E(tr(f["scope"], lang)), "".join("<dt>%s</dt><dd>%s</dd>" % (E(ui(lang, k)), v) for k, v in rows),
                E(ui(lang, "feeNote")), B.share_btn(lang, go, tr(c["n"], lang)), go, E(B.SHOP["ui"][lang]["buy"])))


def soft_card(s, lang, full=False):
    to = path(lang) + "#" + s["id"]
    rows = [("sFor", E(tr(s["for"], lang))), ("sPrice", E(tr(s["price"], lang))), ("sAccess", E(tr(s["access"], lang)))]
    if full:
        rows += [("sFirst", E(tr(s["first"], lang))), ("sHelp", E(tr(s["help"], lang))), ("sSetup", E(tr(s["setup"], lang)))]
    head = '<h3><a href="%s">%s</a></h3>' % (to, E(tr(s["n"], lang))) if not full else '<h2 class="soft-h">%s</h2>' % E(tr(s["n"], lang))
    out = '<%s class="card soft" id="%s" style="--line:var(--c-%s)">%s%s<p class="l">%s</p>' % (
        "li" if not full else "section", s["id"], s["line"], B.job(s["pic"], lang, name="job-s-" + s["id"]), head, E(tr(s["l"], lang)))
    if full:
        out += '<h3>%s</h3><ol class="steps">%s</ol>' % (E(ui(lang, "sSteps")), "".join("<li>%s</li>" % E(tr(x, lang)) for x in s["steps"]))
    out += '<dl class="facts">%s</dl>' % "".join("<dt>%s</dt><dd>%s</dd>" % (E(ui(lang, k)), v) for k, v in rows)
    btns = []
    if s.get("try"):
        site = ui(lang, "sOpens").replace("{site}", s["site"])
        btns.append('<a class="btn alt" href="%s" rel="noopener">%s<span class="vh"> (%s)</span></a>' % (E(s["try"]["href"]), E(tr(s["try"]["n"], lang)), E(site)))
    if s.get("get"):
        site = ui(lang, "sOpens").replace("{site}", s["site"])
        btns.append('<a class="btn" href="%s" rel="noopener">%s<span class="vh"> (%s)</span></a>' % (E(s["get"]["href"]), E(tr(s["get"]["n"], lang)), E(site)))
    if s.get("ask"):
        btns.append('<a class="btn" href="%s">%s</a>' % (B.url(lang, "ask/?about=" + s["ask"]), E(B.SHOP["ui"][lang]["askBtn"])))
    if not full:
        btns = ['<a class="btn" href="%s">%s</a>' % (to, E(ui(lang, "details")))]
    if full and s.get("site"):
        out += '<p class="note">%s</p>' % E(ui(lang, "sOpens").replace("{site}", s["site"]))
    out += B.share_btn(lang, to, tr(s["n"], lang)) + '<p class="btns">%s</p>' % " ".join(btns)
    return out + ("</section>" if full else "</li>")


def soft_band(lang):
    return ('<h2 id="software">%s</h2>\n<p class="lede">%s</p>\n<ul class="cards soft-list">%s</ul>\n<p class="thumbs-go"><a href="%s">%s →</a></p>\n'
            % (E(ui(lang, "softH")), E(ui(lang, "softL")), "".join(soft_card(s, lang) for s in SOFT), path(lang), E(ui(lang, "softAll"))))


# ---------------------------------------------------------------- pages

def head(lang, title, desc, p, og):
    h = B.head(lang, title, desc, p, og=og)
    return h.replace("</head>\n", CSS + "</head>\n")


def strings(lang):
    """The words arrange.js needs, beside the shop's own (#shop)."""
    keys = ("gotRef", "notYet", "again", "lineRef", "errSend", "errMail", "sendReq", "errMissing")
    d = {k: ui(lang, k) for k in keys}
    d["errContact"] = B.SHOP["ui"][lang]["err"]["contact"]
    d["sending"] = B.SHOP["ui"][lang]["sending"]
    return d


def form(job, lang):
    """The request: the job's own questions, the reply channel, the contact, and a free line. The labels carry their
    English (data-en) so the team reads the request in English whatever the page's language."""
    out = ['<form id="jf" class="jf" data-job="%s" data-svc="%s" data-name="%s" novalidate>' % (
        job["id"], job["main"], E(tr(job["n"], "en")))]
    for f in job["form"]:
        lab = E(tr(f["n"], lang))
        req = ' required aria-required="true"' if f.get("req") else ""
        name = 'name="f_%s" data-en="%s"' % (f["k"], E(tr(f["n"], "en")))
        if f.get("t") == "select":
            opts = "".join('<option value="%s">%s</option>' % (E(tr(o, "en")), E(tr(o, lang))) for o in f["o"])
            out.append('<label class="field">%s<select %s aria-label="%s"%s><option value="">%s</option>%s</select></label>' % (lab, name, lab, req, E(ui(lang, "pick")), opts))
        elif f.get("t") == "area":
            out.append('<label class="field">%s<textarea %s rows="3" maxlength="600"%s></textarea></label>' % (lab, name, req))
        else:
            t = f.get("t") if f.get("t") in ("date", "time", "number") else "text"
            v = ' value="%s"' % E(tr(f["v"], lang)) if f.get("v") else ""
            extra = ' min="1" max="60" inputmode="numeric"' if t == "number" else ' maxlength="200"'
            out.append('<label class="field">%s<input type="%s" %s%s%s%s></label>' % (lab, t, name, v, extra, req))
    out.append('<fieldset class="reply"><legend>%s</legend>%s</fieldset>' % (E(ui(lang, "replyBy")), "".join(
        '<label class="opt"><input type="radio" name="reply" value="%s"%s> <span>%s</span></label>' % (v, " checked" if v == "line" else "", E(ui(lang, k)))
        for v, k in (("line", "rLine"), ("email", "rMail"), ("phone", "rPhone")))))
    out.append('<label class="field">%s<input name="contact" required aria-required="true" maxlength="120" autocomplete="email"></label>' % E(B.SHOP["ui"][lang]["reach"]))
    out.append('<label class="field">%s<input name="name" maxlength="120" autocomplete="name"></label>' % E(ui(lang, "name")))
    out.append('<label class="field">%s<textarea name="more" rows="3" maxlength="2000"></textarea></label>' % E(ui(lang, "more")))
    out.append('<label class="hp" aria-hidden="true">website<input name="website" tabindex="-1" autocomplete="off"></label>')
    out.append('<button class="btn big" type="submit">%s</button>' % E(ui(lang, "sendReq")))
    out.append('<div id="jmsg" class="jmsg" role="status" aria-live="polite"></div>')
    out.append('<p class="alt-way"><a class="line-alt" href="%s">%s</a> · <a href="mailto:%s">%s</a></p>' % (
        B.LINE_URL, E(ui(lang, "orLine")), B.MAIL, B.MAIL))
    out.append("</form>")
    data = dict(strings(lang), notYet=tr(job["notYet"], lang) if job.get("notYet") else ui(lang, "notYet"), lineUrl=B.LINE_URL)
    out.append('<script type="application/json" id="arrange">%s</script>' % json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
    return "\n".join(out)


def research(job, lang):
    lis = []
    for cid in job["research"]:
        c = CARDS.get(cid)
        if not c:
            continue
        go, _ = B.go_of(c, lang)
        to = B.page_of(c, lang) or go
        if not to:
            continue
        ext = to.startswith("http")
        host = re.sub(r"^https?://(www\.)?([^/]+).*", r"\2", to) if ext else ""
        lis.append('<li><a href="%s"%s>%s</a>%s</li>' % (E(to), ' rel="noopener"' if ext else "", E(tr(c["n"], lang)),
                                                         ' <span class="src">%s</span>' % E(host) if ext else ""))
    return '<section class="bg"><h2>%s</h2><p class="lede">%s</p><ul>%s</ul></section>\n' % (E(ui(lang, "research")), E(ui(lang, "researchL")), "".join(lis))


def job_page(job, lang):
    su = B.SHOP["ui"][lang]
    p = "arrange/%s/" % job["id"]
    og = "og/arrange/%s.jpg" % job["id"]
    if not os.path.exists(os.path.join(DOCS, og)):
        og = "og/svc/%s.jpg" % job["main"] if os.path.exists(os.path.join(DOCS, "og/svc/%s.jpg" % job["main"])) else "og/shop/front.jpg"
    title = "%s · Hongdam" % tr(job["n"], lang)
    out = head(lang, title, "%s %s" % (tr(job["l"], lang), plain(job["fee"], lang)), p, og)
    out += '<body class="p-job" style="--line:var(--c-%s)">\n' % job["line"] + B.top(lang, p)
    out += '<main>\n<p class="back"><a href="%s">← %s</a>%s</p>\n' % (B.url(lang), E(su["home"]), B.share_btn(lang))
    out += B.job(job["pic"], lang, cls="master", name="job-a-" + job["id"]) + "\n"
    out += '<h1>%s</h1>\n<p class="lede">%s</p>\n' % (E(tr(job["n"], lang)), E(tr(job["l"], lang)))
    if job.get("brandL"):
        out += '<p class="brand-note">%s</p>\n' % E(tr(job["brandL"], lang))
    rows = [("fee", words(job["fee"], lang)), ("inc", E(tr(job["inc"], lang))), ("sep", E(tr(job["sep"], lang)))]
    if job.get("time"):
        rows.append(("time", E(tr(job["time"], lang))))
    rows += [("who", E(ui(lang, "whoAll"))), ("where", E(tr(job["where"], lang)) if job.get("where") else E(su["place"])),
             ("done", E(tr(job["done"], lang)))]
    out += '<dl class="facts decide">%s</dl>\n<p class="note">%s</p>\n' % (
        "".join("<dt>%s</dt><dd>%s</dd>" % (E(ui(lang, k)), v) for k, v in rows), E(ui(lang, "feeNote")))
    # Buy at a set price, each option with its Buy button
    lis = []
    for r in job["opts"]:
        c, o = opt_of(r)
        go = B.url(lang, "buy/?c=%s&o=%s" % (c["id"], o["i"]))
        it = B.ITEMS.get(o["i"], {})
        d = it.get("d_" + lang, "")
        name = tr(o["n"], lang) if o.get("n") else tr(c["n"], lang)
        x = B.ex_text(o["i"], lang)
        lis.append('<li class="card" style="--line:var(--c-%s)"><h3>%s</h3><p class="price">%s</p>%s%s<a class="btn" href="%s">%s</a></li>' % (
            c["cat"], E(name), B.opt_price(o, lang)[0], '<p class="l">%s</p>' % E(d) if d else "",
            '<p class="ex">%s</p>' % B.ex_html(x, lang) if x else "", go, E(su["buy"])))
    out += '<h2>%s</h2>\n<ul class="cards opts">%s</ul>\n' % (E(ui(lang, "optsH")), "".join(lis))
    out += '<h2 id="details">%s</h2>\n<p class="lede">%s</p>\n%s\n' % (E(ui(lang, "askH")), E(ui(lang, "askL")), form(job, lang))
    out += research(job, lang)
    out += '<h2>%s</h2>\n<ul class="cards jobs">%s</ul>\n' % (E(ui(lang, "otherJobs")), "".join(job_card(j, lang) for j in JOBS if j is not job))
    out += "</main>\n" + JS + B.foot(lang, group="p-arrange")
    return out


def soft_page(lang):
    su = B.SHOP["ui"][lang]
    p = "software/"
    out = head(lang, "%s · Hongdam" % ui(lang, "softTitle"), ui(lang, "softL"), p, "og/arrange/software.jpg" if os.path.exists(os.path.join(DOCS, "og/arrange/software.jpg")) else "og/shop/front.jpg")
    out += '<body class="p-soft" style="--line:var(--c-web)">\n' + B.top(lang, p)
    out += '<main>\n<p class="back"><a href="%s">← %s</a>%s</p>\n' % (B.url(lang), E(su["home"]), B.share_btn(lang))
    out += '<h1>%s</h1>\n<p class="lede">%s</p>\n' % (E(ui(lang, "softTitle")), E(ui(lang, "softL")))
    out += "".join(soft_card(s, lang, full=True) for s in SOFT)
    out += B.studio_band(lang)
    out += "</main>\n" + B.foot(lang, group="p-arrange")
    return out


def sitemap_and_llms():
    from datetime import date
    sm = os.path.join(DOCS, "sitemap.xml")
    xml = open(sm, encoding="utf-8").read()
    was = dict(re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml))
    today = date.today().isoformat()
    paths = ["arrange/%s/" % j["id"] for j in JOBS] + ["software/"]
    rows = []
    for pth in paths:
        alts = "".join('    <xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>\n' % (l, SITE, B.url(l, pth)) for l in LANGS)
        alts += '    <xhtml:link rel="alternate" hreflang="x-default" href="%s%s"/>\n' % (SITE, B.url("en", pth))
        for l in LANGS:
            loc = SITE + B.url(l, pth)
            day = today if (B.pre(l) + pth + "index.html") in B.CHANGED or loc not in was else was[loc]
            rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n%s  </url>\n" % (loc, day, alts))
    block = "<!-- ARRANGE:START -->\n" + "".join(rows) + "  <!-- ARRANGE:END -->"
    if "<!-- ARRANGE:START -->" in xml:
        a, b = xml.index("<!-- ARRANGE:START -->"), xml.index("<!-- ARRANGE:END -->") + len("<!-- ARRANGE:END -->")
        xml = xml[:a] + block + xml[b:]
    else:
        xml = xml.replace("</urlset>", "  " + block + "\n</urlset>")
    open(sm, "w", encoding="utf-8").write(xml)
    lt = os.path.join(DOCS, "llms.txt")
    txt = open(lt, encoding="utf-8").read()
    lines = ["## Five jobs we arrange", ""]
    for j in JOBS:
        lines.append("- [%s](%s%s): %s %s" % (tr(j["n"], "en"), SITE, B.url("en", "arrange/%s/" % j["id"]), tr(j["l"], "en"), plain(j["fee"], "en")))
    lines += ["", "## Software", ""]
    for s in SOFT:
        lines.append("- [%s](%s/software/#%s): %s %s" % (tr(s["n"], "en"), SITE, s["id"], tr(s["l"], "en"), tr(s["price"], "en")))
    block = "<!-- ARRANGE:START -->\n" + "\n".join(lines) + "\n<!-- ARRANGE:END -->"
    if "<!-- ARRANGE:START -->" in txt:
        a, b = txt.index("<!-- ARRANGE:START -->"), txt.index("<!-- ARRANGE:END -->") + len("<!-- ARRANGE:END -->")
        txt = txt[:a] + block + txt[b:]
    else:
        i = txt.index("<!-- SHOP:START -->")
        txt = txt[:i] + block + "\n\n" + txt[i:]
    open(lt, "w", encoding="utf-8").write(txt)


def main():
    n = 0
    for lang in LANGS:
        for j in JOBS:
            B.write(B.pre(lang) + "arrange/%s/index.html" % j["id"], job_page(j, lang)); n += 1
        B.write(B.pre(lang) + "software/index.html", soft_page(lang)); n += 1
    sitemap_and_llms()
    print("%d job and software pages · %d jobs · %d products · %d languages" % (n, len(JOBS), len(SOFT), len(LANGS)))
    for lang, w in sorted(B.MISSING):
        print("  · no %s for: %s" % (lang, w))
    return 0


if __name__ == "__main__":
    sys.exit(main())

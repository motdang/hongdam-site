#!/usr/bin/env python3
"""Every public route on hongdam.net, in every language, with the template that writes it, the service it sells,
whether that service can be bought, its first action and where that action goes.

    python3 tools/inventory.py            # writes data/inventory/routes.tsv and data/inventory/summary.json
    python3 tools/inventory.py --check    # the same, and exit 1 when a route has no template, a sitemap address
                                          # has no page, or a page names a language version that does not exist

Reads docs/ (the pages as published), docs/sitemap.xml, docs/_redirects, functions/ (routes written by code),
data/shop.json and docs/assets/shop-<lang>.json (the catalog and what search finds). The template of a page is
read from its <body> class; TEMPLATES says which tool writes each one.
"""
import glob
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(HERE, "docs")
OUT = os.path.join(HERE, "data", "inventory")
LANGS = ("th", "my", "zh", "de")

# body class (first word, or the page's own mark) → the tool that writes the page
TEMPLATES = {
    "p-front": "tools/build_shop.py front()",
    "p-cat": "tools/build_shop.py category()",
    "p-buy": "tools/build_shop.py buy_page() + assets/shop.js",
    "p-ask": "tools/build_shop.py ask_page() + assets/shop.js",
    "p-m": "tools/build_minisites.py",
    "p-job": "tools/build_arrange.py",
    "p-soft": "tools/build_arrange.py software",
    "studio": "tools/build_studio.py",
    "asknan": "tools/build_asknan.py",
    "p-page": "tools/pages.py (words written by hand in data/pages/)",
    "p-retreat": "tools/build_retreat.py",
    "p-swan": "tools/build_blackswan.py",
    "p-questions": "tools/build_questions.py",
    "p-agree": "tools/build_agreement.py",
    "p-invoice": "tools/build_invoice.py",
    "p-tasks": "tools/build_tasks.py",
    "p-wheel": "tools/build_wheel.py",
    "p-trans": "tools/build_translation.py",
    "p-market": "tools/build_market.py",
    "p-dj": "tools/build_dj.py",
    "p-crypto": "tools/build_crypto.py",
}
# pages with no body class: where they come from
BY_PATH = [
    (r"^404\.html$", "docs/404.html (the swan game, by hand)"),
    (r"^for/", "docs/for/ (client pages, by hand)"),
    (r"^portfolio/", "tools/build_work.py (data/work.json)"),
    (r"^stats/", "docs/stats/ (by hand; reads /api/hit)"),
    (r"^studio/black-swan/", "tools/build_blackswan.py"),
    (r"^studio/dj/", "tools/build_dj.py"),
    (r"^studio/crypto-safety/", "tools/build_crypto.py"),
    (r"^(?:(?:th|my|zh|de)/)?studio/", "tools/build_studio.py"),
    (r"^(?:(?:th|my|zh|de)/)?ask-nan/", "tools/build_asknan.py"),
    (r"^(?:(?:th|my|zh|de)/)?retreat/", "tools/build_retreat.py"),
    (r"^(?:(?:th|my|zh|de)/)?questions/", "tools/build_questions.py"),
    (r"^(?:(?:th|my|zh|de)/)?translation/", "tools/build_translation.py"),
    (r"^agreement/", "tools/build_agreement.py"),
    (r"^invoice/", "tools/build_invoice.py"),
    (r"^tasks/", "tools/build_tasks.py"),
    (r"^market/", "tools/build_market.py"),
    (r"^(?:own|redteam|bots|github|php|web|visa|money|moving|stay|care|ai|fix|help|luck|merit|design|charity|ship|tours|translate|outsource|weddings|data|shop|media)/", "tools/pages.py"),
]


def read(p):
    return open(p, encoding="utf-8", errors="replace").read()


def route_of(rel):
    """docs-relative file → the address people use."""
    if rel.endswith("index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def lang_of(route):
    m = re.match(r"^/(th|my|zh|de)/", route)
    return m.group(1) if m else "en"


def template_of(rel, h):
    m = re.search(r"<body[^>]*\bclass=\"([^\"]+)\"", h)
    if m:
        for w in m.group(1).split():
            if w in TEMPLATES:
                return w, TEMPLATES[w]
    for rx, t in BY_PATH:
        if re.match(rx, rel):
            return "-", t
    return "-", ""


SHOP = json.load(open(os.path.join(HERE, "data", "shop.json"), encoding="utf-8"))
CARDS = {c["id"]: c for c in SHOP["cards"]}
CATS = {c["id"] for c in SHOP["cats"]}
SVC = json.load(open(os.path.join(HERE, "data", "services.json"), encoding="utf-8"))
ITEMS = {it["id"]: it for s in SVC["sections"] for it in s.get("items", [])}
JOBS_F = os.path.join(HERE, "data", "arrange.json")
JOBS = {j["id"]: j for j in json.load(open(JOBS_F, encoding="utf-8"))["jobs"]} if os.path.exists(JOBS_F) else {}


def service_of(route):
    """(service id, kind) a page sells: a card's own page, a category, a job page, or none."""
    p = re.sub(r"^/(th|my|zh|de)/", "/", route).strip("/").split("/")
    if len(p) == 2 and p[0] == "arrange" and p[1] in JOBS:
        return p[1], "job"
    if len(p) == 2 and p[0] in CATS and p[1] in CARDS:
        return p[1], "card"
    if len(p) == 1 and p[0] in CATS:
        return p[0], "category"
    return "", ""


def readiness(sid, kind):
    """buy: a Buy button at a set or walking price · quote: priced by asking · link/open: on another page or site ·
    waiting: on a card whose item is not on the price list yet."""
    if kind == "job":
        return JOBS[sid].get("rule", "")
    if kind != "card":
        return ""
    c = CARDS[sid]
    if c["act"] == "buy":
        return "buy" if all(o["i"] in ITEMS or o.get("price") for o in c.get("opts", [])) else "waiting"
    return {"ask": "quote"}.get(c["act"], c["act"])


def first_action(h):
    """The first button in <main>: its words and where it goes."""
    main = h[h.find("<main"):] if "<main" in h else h
    m = re.search(r"<a class=\"btn[^\"]*\" href=\"([^\"]*)\"[^>]*>(.*?)</a>", main, re.S)
    if not m:
        return "", ""
    return html.unescape(re.sub(r"<[^>]+>", "", m.group(2))).strip()[:60], html.unescape(m.group(1))


def main(check=False):
    os.makedirs(OUT, exist_ok=True)
    files = sorted(os.path.relpath(p, DOCS) for p in glob.glob(os.path.join(DOCS, "**", "*.html"), recursive=True))
    routes = {route_of(f): f for f in files}
    sitemap = read(os.path.join(DOCS, "sitemap.xml"))
    locs = set(re.findall(r"<loc>https://hongdam\.net([^<]*)</loc>", sitemap))
    redirects = [l.split() for l in read(os.path.join(DOCS, "_redirects")).splitlines() if l.strip() and not l.startswith("#")]
    rows, problems = [], []
    for route, rel in sorted(routes.items()):
        h = read(os.path.join(DOCS, rel))
        mark, tmpl = template_of(rel, h)
        sid, kind = service_of(route)
        act_n, act_to = first_action(h)
        noindex = bool(re.search(r"<meta name=\"robots\" content=\"[^\"]*noindex", h))
        canon = (re.search(r"<link rel=\"canonical\" href=\"https://hongdam\.net([^\"]*)\"", h) or [None, ""])[1]
        alts = re.findall(r"<link rel=\"alternate\" hreflang=\"([a-z-]+)\" href=\"https://hongdam\.net([^\"]*)\"", h)
        missing_alt = [a for l, a in alts if l != "x-default" and a.split("?")[0] not in routes]
        row = {
            "route": route, "lang": lang_of(route), "file": "docs/" + rel, "mark": mark, "template": tmpl,
            "service": sid, "kind": kind, "ready": readiness(sid, kind), "action": act_n, "to": act_to,
            "sitemap": "yes" if route in locs else ("noindex" if noindex else "no"), "canonical": canon,
            "langs": ",".join(sorted({l for l, _ in alts if l != "x-default"})), "note": "",
        }
        if not tmpl:
            problems.append("no template known: " + route)
            row["note"] = "no template"
        if missing_alt:
            problems.append("%s names language versions that do not exist: %s" % (route, ", ".join(missing_alt)))
            row["note"] = (row["note"] + " missing alternates").strip()
        if canon and canon != route and not noindex:
            row["note"] = (row["note"] + " canonical elsewhere").strip()
        rows.append(row)
    for loc in sorted(locs):
        if loc not in routes and loc.rstrip("/") + "/" not in routes and not any(r[0] == loc for r in redirects):
            base = os.path.join(HERE, "functions", loc.strip("/"))
            if not any(os.path.exists(base + s) for s in (".js", "/index.js", "/[[path]].js")):
                problems.append("sitemap address with no page: " + loc)
    # routes written by code (Pages Functions), not files
    fn = []
    for p in sorted(glob.glob(os.path.join(HERE, "functions", "**", "*.js"), recursive=True)):
        rel = os.path.relpath(p, os.path.join(HERE, "functions"))
        if os.path.basename(rel).startswith("_"):
            continue
        r = "/" + re.sub(r"(index)?\.js$", "", rel).replace("[[path]]", "*").replace("[id]", ":id")
        doc = re.search(r"/\*\*?(.*?)\*/", read(p), re.S)
        fn.append({"route": r, "file": "functions/" + rel, "what": re.sub(r"\s*\*\s*", " ", doc.group(1)).strip()[:140] if doc else ""})
    # what search finds: every card in each language's search list
    search = {}
    for lang in ("en",) + LANGS:
        f = os.path.join(DOCS, "assets", "shop-%s.json" % lang)
        if os.path.exists(f):
            ids = {c["id"] for c in json.load(open(f, encoding="utf-8"))}
            lost = sorted(set(CARDS) - ids)
            search[lang] = {"cards": len(ids), "not_in_search": lost}
            if lost:
                problems.append("cards search does not find in %s: %s" % (lang, ", ".join(lost[:12])))
    cols = ["route", "lang", "file", "mark", "template", "service", "kind", "ready", "action", "to", "sitemap", "canonical", "langs", "note"]
    with open(os.path.join(OUT, "routes.tsv"), "w", encoding="utf-8") as f:
        f.write("\t".join(cols) + "\n")
        for r in rows:
            f.write("\t".join(str(r[c]).replace("\t", " ").replace("\n", " ") for c in cols) + "\n")
    with open(os.path.join(OUT, "functions.tsv"), "w", encoding="utf-8") as f:
        f.write("route\tfile\twhat\n")
        for r in fn:
            f.write("%s\t%s\t%s\n" % (r["route"], r["file"], r["what"].replace("\t", " ")))
    by_t, by_l, by_r = {}, {}, {}
    for r in rows:
        by_t[r["template"] or "(none)"] = by_t.get(r["template"] or "(none)", 0) + 1
        by_l[r["lang"]] = by_l.get(r["lang"], 0) + 1
        if r["ready"]:
            by_r[r["ready"]] = by_r.get(r["ready"], 0) + 1
    summary = {"pages": len(rows), "by_language": by_l, "by_template": dict(sorted(by_t.items(), key=lambda x: -x[1])),
               "service_pages_by_readiness": by_r, "sitemap_addresses": len(locs), "redirects": [" ".join(r) for r in redirects],
               "function_routes": len(fn), "search": search, "problems": problems,
               "payment": ["functions/api/buy/[[path]].js (order, PromptPay slip by SlipOK, PayPal card, Lightning, claims, tracker, team moves)",
                           "functions/_shop.js (quote: the total is worked out on the server; half now from ฿10,000 / US$300)",
                           "functions/api/pay/ (invoice and agreement payments)", "functions/_fx.js (฿ / $ / € at the day's rate)"],
               "work_queue": ["functions/_wheel.js → Team Wheel Hand out › Orders (pm.nanobotco.workers.dev/api/shop/order)",
                              "functions/_tasks.js tell() → Discord #help-desk when the wheel does not take it",
                              "Resend mail to ORDER_TO / CONTACT_TO"],
               "analytics": ["docs/assets/hd.js → /api/hit (functions/api/hit) → /stats/", "functions/_middleware.js → Analytics Engine traffic_eye",
                             "Cloudflare Web Analytics beacon (people only, functions/_middleware.js keepOffBeacon)"]}
    json.dump(summary, open(os.path.join(OUT, "summary.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("%d pages (%s) · %d function routes · %d sitemap addresses · %d problems" % (
        len(rows), ", ".join("%s %d" % kv for kv in sorted(by_l.items())), len(fn), len(locs), len(problems)))
    for p in problems[:40]:
        print("  !", p)
    return 1 if (check and problems) else 0


if __name__ == "__main__":
    sys.exit(main("--check" in sys.argv))

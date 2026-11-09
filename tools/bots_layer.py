#!/usr/bin/env python3
"""What machines read on hongdam.net, written and checked after tools/build_shop.py.

    python3 tools/bots_layer.py           # write llms.txt's SHOP block, then check every page
    python3 tools/bots_layer.py --check   # only check

Writes the SHOP part of docs/llms.txt (between SHOP markers): each category page with its addresses in its
other languages, its line, how many cards, and its lowest price. Then reads every page in docs/ and lists what a
link preview or a search engine would miss: no title, description or canonical on an indexed page; no
og:image, or one that is relative, missing on disk, not 1200 x 630 or not a JPEG or PNG; no twitter:card,
twitter:image or image alt; a picture with no alt; og:url and canonical that disagree; a page that borrows
another page's picture (the language versions of one page excepted). Exit 1 when something is listed.
"""
import os
import re
import struct
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(HERE, "docs")
SITE = "https://hongdam.net"
LANG_DIRS = ("th/", "my/", "zh/", "de/")


def shop_block():
    sys.path.insert(0, os.path.join(HERE, "tools"))
    import build_shop as B  # loads the data; builds nothing until main()
    import seo
    G = vars(B)
    rows = []
    for cat in B.SHOP["cats"]:
        cards = [c for c in B.SHOP["cards"] if c["cat"] == cat["id"] and B.ready(c)]
        low = seo.low_price(G, "en", cat)
        where = " · ".join("%s %s%s" % (B.SHOP["lang_names"][l], SITE, B.url(l, cat["id"] + "/")) for l in B.LANGS[1:])
        rows.append("- [%s](%s%s) — %s %d card%s%s. Also: %s" % (
            B.tr(cat["n"], "en"), SITE, B.url("en", cat["id"] + "/"), B.tr(cat["l"], "en"), len(cards), "" if len(cards) == 1 else "s",
            ", from ฿{:,}".format(low) if low else "", where))
    return "<!-- SHOP:START -->\n## The category pages\n\n" + "\n".join(rows) + "\n<!-- SHOP:END -->"


def write_llms():
    p = os.path.join(DOCS, "llms.txt")
    s = open(p, encoding="utf-8").read()
    block = shop_block()
    if "<!-- SHOP:START -->" in s:
        a, b = s.index("<!-- SHOP:START -->"), s.index("<!-- SHOP:END -->") + len("<!-- SHOP:END -->")
        s = s[:a] + block + s[b:]
    else:
        s = s.replace("<!-- SERVICES:START -->", block + "\n\n<!-- SERVICES:START -->", 1)
    open(p, "w", encoding="utf-8").write(s)


def image_size(path):
    with open(path, "rb") as f:
        head = f.read(26)
        if head[:8] == b"\x89PNG\r\n\x1a\n":
            return "png", struct.unpack(">II", head[16:24])
        if head[:2] != b"\xff\xd8":
            return "other", (0, 0)
        f.seek(2)
        while True:
            m = f.read(4)
            if len(m) < 4:
                return "jpeg", (0, 0)
            ln = struct.unpack(">H", m[2:])[0]
            if m[1] in (0xC0, 0xC1, 0xC2):
                h, w = struct.unpack(">HH", f.read(5)[1:])
                return "jpeg", (w, h)
            f.seek(ln - 2, 1)


def meta(head, name):
    m = re.search(r'<meta (?:property|name)="%s" content="([^"]*)"' % re.escape(name), head)
    return m.group(1) if m else None


def check():
    problems, owners = [], {}
    for root, _, files in os.walk(DOCS):
        for f in files:
            if not f.endswith(".html") or "/assets/" in root + "/" or f.startswith("_"):
                continue
            path = os.path.join(root, f)
            rel = os.path.relpath(path, DOCS)
            s = open(path, encoding="utf-8", errors="replace").read()
            head = s.split("</head>")[0]
            say = lambda m: problems.append("%s: %s" % (rel, m))
            noindex = bool(re.search(r'<meta name="robots" content="[^"]*noindex', head)) or rel.startswith(("for/", "invoice/"))
            if not noindex:
                for what, pat in (("title", r"<title>[^<]+</title>"), ("description", r'<meta name="description" content="[^"]+"'), ("canonical", r'<link rel="canonical" href="https://')):
                    if not re.search(pat, head):
                        say("no " + what)
                can = re.search(r'<link rel="canonical" href="([^"]+)"', head)
                if can and meta(head, "og:url") and can.group(1) != meta(head, "og:url"):
                    say("og:url %s, canonical %s" % (meta(head, "og:url"), can.group(1)))
            img = meta(head, "og:image")
            if not img:
                say("no og:image")
            elif not img.startswith(SITE + "/"):
                say("og:image not on https://hongdam.net: " + img)
            else:
                disk = os.path.join(DOCS, img[len(SITE) + 1:])
                if not os.path.exists(disk):
                    say("og:image missing on disk: " + img)
                else:
                    kind, (w, h) = image_size(disk)
                    if kind not in ("jpeg", "png") or (w, h) != (1200, 630):
                        say("og:image %s is %s %dx%d" % (img, kind, w, h))
                page = rel.replace("index.html", "")
                for l in LANG_DIRS:
                    page = page[len(l):] if page.startswith(l) else page
                owners.setdefault(img, set()).add(re.sub(r"^translation/(th|my|de)/", "translation/", page))
            for t in ("twitter:card", "twitter:image", "og:image:alt"):
                if not meta(head, t):
                    say("no " + t)
            for tag in re.findall(r"<img\b[^>]*>", s):
                if "alt=" not in tag:
                    say("picture with no alt: " + tag[:80])
    for img, pages in owners.items():
        if len(pages) > 1:
            problems.append("%s shared by %s" % (img, ", ".join(sorted(pages))))
    return problems


if __name__ == "__main__":
    if "--check" not in sys.argv:
        write_llms()
    found = check()
    for p in found:
        print("  ! " + p)
    print("bots layer:", "%d to fix" % len(found) if found else "nothing to fix")
    sys.exit(1 if found else 0)

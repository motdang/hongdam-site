#!/usr/bin/env python3
"""Check the minisite page files (data/minisites/*.json) before they are built: every text in five languages, every
source an address, dingbat and card names that exist, a toy in the shape its kind reads, no photos, the style guide.

    python3 tools/minisite_check.py [id ...]      # prints one line per problem; exit 1 if any
"""
import glob
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ["en", "th", "my", "zh", "de"]
SHOP = json.load(open(os.path.join(HERE, "data", "shop.json"), encoding="utf-8"))
CARDS = {c["id"]: c for c in SHOP["cards"]}
GLYPHS = set(json.load(open(os.path.join(HERE, "data", "looks.json"), encoding="utf-8"))["glyphs"])
PLAN = json.load(open(os.path.join(HERE, "data", "minisite_plan.json"), encoding="utf-8"))
BIG = {b["id"]: b["kind"] for b in PLAN["big"]}
COUNTS = {"modest": {"steps": (3, 4), "facts": (3, 5), "costs": (1, 4), "faq": (3, 5), "related": (6, 6), "out": (2, 2)},
          "big": {"steps": (4, 6), "facts": (5, 7), "costs": (4, 6), "faq": (6, 8), "related": (6, 6), "out": (3, 4), "slab": (3, 4)}}
SCRIPT = {"th": r"[฀-๿]", "my": r"[က-႟]", "zh": r"[一-鿿]"}


def texts(o, path=""):
    """Every {lang: words} in a file, with where it sits."""
    if isinstance(o, dict):
        if "en" in o and set(o) <= set(LANGS):
            yield path, o
            return
        for k, v in o.items():
            yield from texts(v, path + "." + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from texts(v, "%s[%d]" % (path, i))


def srcs(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ("src", "months_src", "href") and isinstance(v, str):
                yield v
            else:
                yield from srcs(v)
    elif isinstance(o, list):
        for v in o:
            yield from srcs(v)


def check(f):
    out = []
    try:
        p = json.load(open(f, encoding="utf-8"))
    except ValueError as e:
        return ["does not parse: %s" % e]
    cid = p.get("id")
    if cid not in CARDS:
        return ["no card called %r" % cid]
    tier = p.get("tier")
    want = "big" if cid in BIG else "modest"
    if tier != want:
        out.append("tier %s, the plan says %s" % (tier, want))
    for path, d in texts(p):
        if path.startswith(".n") or path.startswith(".l"):
            continue
        for lang in LANGS:
            v = d.get(lang)
            if not v or not str(v).strip():
                out.append("%s: no %s" % (path, lang))
            elif lang in SCRIPT and not re.search(SCRIPT[lang], str(v)) and re.search(r"[A-Za-z]{4,}", str(v)) and str(v) == d.get("en") \
                    and not (len(str(v)) <= 24 and all(w[:1].isupper() or not w[:1].isalpha() for w in str(v).split()) and "Hongdam" not in str(v)):   # a brand name (Shopee, TikTok Shop) is the same in every script
                out.append("%s: %s is the English words" % (path, lang))
        if d.get("de") and "ß" in d["de"]:
            out.append("%s: German has ß (Swiss spelling uses ss)" % path)
    for u in srcs(p):
        if not u.startswith("https://") and not u.startswith("/"):
            out.append("source is not an address: %s" % u[:60])
    for k in ("pic", "pic2", "draw"):
        if k in p:
            out.append("has %s (pictures are glyphs until Marcus draws)" % k)
    g = p.get("glyphs") or []
    if len(g) != 3:
        out.append("glyphs: %d, want 3" % len(g))
    for x in g + [s.get("db") for s in p.get("steps", [])]:
        if x and x not in GLYPHS:
            out.append("no dingbat called %r" % x)
    for r in p.get("related", []):
        if r not in CARDS:
            out.append("related: no card %r" % r)
    for k, (lo, hi) in COUNTS[want].items():
        n = len(p.get(k, []))
        if not lo <= n <= hi:
            out.append("%s: %d, want %d–%d" % (k, n, lo, hi))
    if want == "big":
        t = p.get("toy") or {}
        kind = t.get("kind", "event")
        if kind != BIG[cid]:
            out.append("toy kind %s, the plan says %s" % (kind, BIG[cid]))
        d = t.get("data") or {}
        need = {"event": ["guests", "venues", "styles", "items", "months"], "bill": ["lines"], "picker": ["q", "options"], "checklist": ["items", "result"]}.get(kind, [])
        for k in need:
            if not d.get(k):
                out.append("toy.data.%s missing" % k)
        if kind == "bill":
            ids = {s["id"] for s in d.get("sliders", [])}
            chs = {c["id"]: {o["id"] for o in c["options"]} for c in d.get("choices", [])}
            for i, l in enumerate(d.get("lines", [])):
                if not (l.get("range") or l.get("pct")):
                    out.append("toy line %d: no range or pct" % i)
                for s in l.get("per", []):
                    if s not in ids:
                        out.append("toy line %d: per %r is no slider" % (i, s))
                for c, vs in (l.get("when") or {}).items():
                    if c not in chs or not set(vs) <= chs[c]:
                        out.append("toy line %d: when %r names no such choice/option" % (i, c))
                if not l.get("src"):
                    out.append("toy line %d: no source" % i)
        if kind == "picker":
            for o in d.get("options", []):
                if not o.get("src"):
                    out.append("picker option %s: no source" % o.get("id"))
    r = subprocess.run([sys.executable, os.path.expanduser("~/.claude/bin/stylecheck.py"), f], capture_output=True, text=True)
    if "clean" not in r.stdout:
        out += ["style: " + x.strip() for x in r.stdout.strip().splitlines()[:6]]
    return out


NAME = {"th": "หงส์ดำ", "my": "ဟုန်ဒမ်", "zh": "鸿丹"}


def fix(f):
    """Mechanical fixes: Hongdam's name in each script, one flag per price range (฿350–600), Swiss ss."""
    p = json.load(open(f, encoding="utf-8"))
    n = 0

    def walk(o):
        nonlocal n
        if isinstance(o, dict):
            if "en" in o and set(o) <= set(LANGS):
                for lang in LANGS:
                    v = o.get(lang)
                    if not isinstance(v, str):
                        continue
                    w = re.sub(r"(฿[\d,]+)\s*[–-]\s*฿", r"\1–", v)
                    if lang in NAME:
                        w = re.sub(r"\bHongdam\b", NAME[lang], w)
                    if lang == "de":
                        w = w.replace("ß", "ss")
                    if w != v:
                        o[lang] = w
                        n += 1
                return
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(p)
    if n:
        json.dump(p, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return n


def main(argv):
    if argv and argv[0] == "--fix":
        argv = argv[1:]
        for f in ([os.path.join(HERE, "data", "minisites", i + ".json") for i in argv] if argv else sorted(glob.glob(os.path.join(HERE, "data", "minisites", "*.json")))):
            k = fix(f)
            if k:
                print("fixed %d in %s" % (k, os.path.basename(f)))
    files = [os.path.join(HERE, "data", "minisites", i + ".json") for i in argv] if argv else sorted(glob.glob(os.path.join(HERE, "data", "minisites", "*.json")))
    bad = 0
    for f in files:
        probs = check(f)
        name = os.path.basename(f)[:-5]
        if probs:
            bad += 1
            print("✗ %s" % name)
            for x in probs[:20]:
                print("    " + x)
        else:
            print("✓ %s" % name)
    total = len(files)
    print("%d of %d clean" % (total - bad, total))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

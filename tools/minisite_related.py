#!/usr/bin/env python3
"""A first list of six related services for each buyable card: three from its own category, three from others,
picked by shared search words (rare words count more) (data/shop.json kw) and the card's demand rank (../demand/demand.json). The page files
in data/minisites/ start from it and may change it. Writes data/minisite_related.json.

    python3 tools/minisite_related.py
"""
import json
import os
import re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOP = json.load(open(os.path.join(HERE, "data", "shop.json"), encoding="utf-8"))
DEM_F = os.path.join(os.path.dirname(HERE), "demand", "demand.json")
RANK = {r["id"]: r["rank"] for r in json.load(open(DEM_F, encoding="utf-8"))["rows"]} if os.path.exists(DEM_F) else {}
STOP = set("a an and the of for to in on at your you our with by from or is are be it this that we us".split())
CARDS = [c for c in SHOP["cards"] if c["act"] in ("buy", "book")]


def words(c):
    s = " ".join([c.get("kw", ""), c["n"]["en"], c["l"]["en"]] + [o.get("n", {}).get("en", "") for o in c.get("opts", [])]).lower()
    return {w for w in re.findall(r"[a-z]{3,}|[฀-๿]{2,}", s) if w not in STOP}


W = {c["id"]: words(c) for c in CARDS}
# a word shared by many cards ("thai", "page") says little; a rare one says a lot
import math
DF = {}
for ws in W.values():
    for w in ws:
        DF[w] = DF.get(w, 0) + 1
IDF = {w: math.log(len(W) / n) for w, n in DF.items()}


def sim(a, b):
    x, y = W[a], W[b]
    return sum(IDF[w] for w in x & y) / (sum(IDF[w] for w in x | y) or 1)


def main():
    out = {}
    for c in CARDS:
        others = [d for d in CARDS if d["id"] != c["id"]]
        key = lambda d: (sim(c["id"], d["id"]), -RANK.get(d["id"], 999) / 1000)
        same = sorted((d for d in others if d["cat"] == c["cat"]), key=key, reverse=True)[:3]
        far = sorted((d for d in others if d["cat"] != c["cat"]), key=key, reverse=True)[: 6 - len(same)]
        out[c["id"]] = [d["id"] for d in same + far]
    json.dump(out, open(os.path.join(HERE, "data", "minisite_related.json"), "w", encoding="utf-8"), indent=0)
    print(len(out), "cards, six related each")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Order data/shop.json by margin and need (data/rank.json): cards inside each category best first,
categories by their three best cards, the front page's featured cards the best one from each of the
top categories, and `feat` on the two best cards of each category. Writes a plain-text report.

    python3 tools/rank_shop.py [report.txt]
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(HERE, "data", "shop.json")
SHOP = json.load(open(P, encoding="utf-8"))
SVC = json.load(open(os.path.join(HERE, "data", "services.json"), encoding="utf-8"))
RANK = json.load(open(os.path.join(HERE, "data", "rank.json"), encoding="utf-8"))["cards"]
ITEMS = {it["id"]: it for s in SVC["sections"] for it in s.get("items", [])}
USD = 33


def price(c):
    r = RANK.get(c["id"], [])
    if len(r) > 3:
        return r[3]
    o = (c.get("opts") or [{}])[0]
    p = o.get("price") or {}
    it = ITEMS.get(o.get("i"), {})
    return it.get("baht") or p.get("fixed") or p.get("usd", 0) * USD or (p.get("tier") or [0])[0] or 0


def score(c):
    if c["id"] not in RANK or c["act"] not in ("buy", "book"):
        return None
    h, x, n = RANK[c["id"]][:3]
    return (price(c) - x) / h * (n / 2) ** 2


def main():
    sc = {c["id"]: score(c) for c in SHOP["cards"]}
    last = {"ask": 1, "list": 2, "open": 3, "link": 4}
    key = lambda c: (0, -sc[c["id"]]) if sc[c["id"]] is not None else (last.get(c["act"], 5), 0)
    cats = [k["id"] for k in SHOP["cats"]]
    by = {k: sorted([c for c in SHOP["cards"] if c["cat"] == k], key=key) for k in cats}
    for k, cs in by.items():
        for i, c in enumerate(cs):
            c.pop("feat", None)
            if i < 2 and sc[c["id"]] is not None:
                c["feat"] = True
    def cat_score(k):
        top = [sc[c["id"]] for c in by[k] if sc[c["id"]] is not None][:3]
        return sum(top) / len(top) if top else 0
    order = sorted(cats, key=cat_score, reverse=True)
    if "visa" in order and "care" in order:  # visas sit with the people who need them
        order.remove("visa"); order.insert(order.index("care") + 1, "visa")
    SHOP["cats"] = [next(k for k in SHOP["cats"] if k["id"] == i) for i in order]
    SHOP["cards"] = [c for k in order for c in by[k]]
    for c in SHOP["cards"]:
        c.pop("pop", None)
    n = 0
    for k in order:
        best = next((c for c in by[k] if sc[c["id"]] is not None), None)
        if best and n < 8:
            n += 1
            best["pop"] = n
    json.dump(SHOP, open(P, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    from datetime import date
    out = ["SHOP ORDER — margin and need · %s" % date.today().isoformat(), "",
           "Score = (price − what we pay others) ÷ team hours × (need ÷ 2)², so need counts for more than margin. Need: 3 essential, 2 runs a business or life, 1 optional. Hours and costs are estimates in data/rank.json; change a number there and run tools/rank_shop.py again.", "",
           "FRONT PAGE, FEATURED: " + " · ".join(c["n"]["en"] for c in sorted((c for c in SHOP["cards"] if c.get("pop")), key=lambda c: c["pop"])), ""]
    for k in order:
        cat = next(x for x in SHOP["cats"] if x["id"] == k)
        out.append("%s  (category score %d)" % (cat["n"]["en"].upper(), cat_score(k)))
        for c in by[k]:
            s = sc[c["id"]]
            if s is None:
                out.append("   %-46s %s" % (c["n"]["en"], c["act"]))
            else:
                h, x, n = RANK[c["id"]][:3]
                out.append("   %s %-44s ฿%s · %sh · ฿%d/h · need %d · score %d" % ("★" if c.get("feat") else " ", c["n"]["en"][:44], format(int(price(c)), ","), h, (price(c) - x) / h, n, s))
        out.append("")
    rep = sys.argv[1] if len(sys.argv) > 1 else None
    if rep:
        open(rep, "w", encoding="utf-8").write("\n".join(out) + "\n")
    print("\n".join(out[:6]))


if __name__ == "__main__":
    main()

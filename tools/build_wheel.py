#!/usr/bin/env python3
"""functions/_wheel_data.js: what the Team Wheel needs to know about each card (functions/_wheel.js): its category and
team hours (the ticket's skill and size) and its names in every language, so the team reads an order in their own.
From data/shop.json and data/rank.json; build_shop.py runs it too."""
import json, os, re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ("en", "th", "my", "de")   # the wheel's languages


def names(n):
    return {l: n[l] for l in LANGS if n.get(l)}


def add_names(n):
    """An add-on's name without its price: "Translator's stamp, {price} a page" → "Translator's stamp"."""
    out = {}
    for l in LANGS:
        s = n.get(l) or ""
        s = re.sub(r"\s*[,，၊]\s*[^,，၊]*\{price\}[^,，၊]*", "", s)
        s = re.sub(r"\s*\S*\{price\}\S*", "", s)
        s = re.sub(r"\s+\S*ละ\s*$", "", s).strip(" ,，၊·")
        if s:
            out[l] = s
    return out


def main():
    shop = json.load(open(os.path.join(HERE, "data", "shop.json"), encoding="utf-8"))
    rank = json.load(open(os.path.join(HERE, "data", "rank.json"), encoding="utf-8"))["cards"]
    data, used = {}, set()
    for c in shop["cards"]:
        opts = {o["i"]: [names(o.get("n") or {}), o.get("u") or ""] for o in c.get("opts") or [] if o.get("i")}
        used.update(u for _, u in opts.values() if u)
        add = c.get("add") or {}
        data[c["id"]] = [c["cat"], rank[c["id"]][0] if c["id"] in rank else None, names(c.get("n") or {}), opts, add_names(add.get("n") or {}) if add else None]
    units = {u: {k: names(v) for k, v in shop["units"][u].items()} for u in sorted(used) if u in shop["units"]}
    out = ("// Written by tools/build_wheel.py from data/shop.json and data/rank.json.\n"
           "// card → [category, team hours, names, {option: [names, unit]}, add-on names]\n"
           "export const WHEEL = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n"
           "export const UNITS = " + json.dumps(units, ensure_ascii=False, separators=(",", ":")) + "\n"
           "export const LANG_NAMES = " + json.dumps(shop["lang_names"], ensure_ascii=False) + "\n")
    open(os.path.join(HERE, "functions", "_wheel_data.js"), "w", encoding="utf-8").write(out)
    print("wheel data: %d cards, %d KB" % (len(data), len(out.encode()) // 1024))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

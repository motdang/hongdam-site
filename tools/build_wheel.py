#!/usr/bin/env python3
"""functions/_wheel_data.js: each card's category and team hours, for the Team Wheel's tickets (functions/_wheel.js
picks the skill and the size from them). From data/shop.json and data/rank.json; build_shop.py runs it too."""
import json, os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    shop = json.load(open(os.path.join(HERE, "data", "shop.json"), encoding="utf-8"))
    rank = json.load(open(os.path.join(HERE, "data", "rank.json"), encoding="utf-8"))["cards"]
    data = {c["id"]: [c["cat"], rank[c["id"]][0] if c["id"] in rank else None] for c in shop["cards"]}
    out = ("// Written by tools/build_wheel.py from data/shop.json and data/rank.json: card → [category, team hours].\n"
           "export const WHEEL = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
    open(os.path.join(HERE, "functions", "_wheel_data.js"), "w", encoding="utf-8").write(out)
    print("wheel data: %d cards" % len(data))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

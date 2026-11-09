#!/usr/bin/env python3
"""Counts for the Studio page, written to data/studio/counts.json with the day they were taken.

    python3 tools/studio_counts.py

repos: public repositories in the NaNoBotCo and motdang GitHub organisations (gh).
pages: addresses in the sitemaps of motdang.net, wichaa.net and hongdam.net, following sitemap indexes.
motdang: motdang.net's share of those pages.
A count that cannot be taken keeps its last value; the day moves only when every count was taken.
"""
import datetime
import json
import os
import re
import subprocess
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "data", "studio", "counts.json")
ORGS = ("NaNoBotCo", "motdang")
SITES = ("https://motdang.net/sitemap.xml", "https://wichaa.net/sitemap.xml", "https://hongdam.net/sitemap.xml")


def get(u):
    req = urllib.request.Request(u, headers={"User-Agent": "hongdam-studio-counts (+https://hongdam.net/studio/)"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read().decode("utf-8", "replace")


def locs(u, seen=None):
    """Every page address under a sitemap; an index's children are read in turn."""
    seen = set() if seen is None else seen
    xml = get(u)
    found = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)
    if "<sitemapindex" in xml:
        for child in found:
            locs(child, seen)
    else:
        seen.update(found)
    return seen


def repos():
    n = 0
    for org in ORGS:
        out = subprocess.run(["gh", "repo", "list", org, "--visibility", "public", "--limit", "2000", "--json", "name", "--jq", "length"],
                             capture_output=True, text=True, timeout=120)
        if out.returncode:
            raise RuntimeError(out.stderr.strip())
        n += int(out.stdout.strip())
    return n


def main():
    was = json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {}
    now = dict(was)
    ok = True
    try:
        now["repos"] = repos()
    except Exception as e:  # noqa: BLE001
        ok = False
        print("repos: kept", was.get("repos"), "—", e)
    try:
        md = locs(SITES[0])
        rest = set()
        for s in SITES[1:]:
            rest |= locs(s)
        now["motdang"] = len(md)
        now["pages"] = len(md | rest)
    except Exception as e:  # noqa: BLE001
        ok = False
        print("pages: kept", was.get("pages"), "—", e)
    if ok:
        now["day"] = datetime.date.today().isoformat()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(now, open(OUT, "w", encoding="utf-8"), indent=1)
    print(json.dumps(now))


if __name__ == "__main__":
    main()

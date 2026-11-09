#!/usr/bin/env python3
"""Checks a Studio note before it goes in. Exit 0 when it passes, 1 with a list of what to fix.

    python3 tools/studio_check.py data/studio/notes/2026-10-25-some-slug.md [--offline]

Head: title (90 characters at most), title_th, date (the file's), beat, dek (230 at most), dek_th, cards (1 to 4 shop
cards), sources (2 or more, https). Body: renders, 350 to 1,900 words, every [n] names a source and every source is cited.
The words pass ~/.claude/bin/stylecheck.py. Nothing private: no addresses on the network, keys, paths on this Mac,
email addresses but the studio's, names of the team or of clients (the list stays on this Mac, ~/.claude/state/studio-private.txt).
Sources answer (a 401, 403 or 429 from a site that refuses robots is allowed; --offline skips the fetch).
"""
import json
import os
import re
import subprocess
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import studio_md as M  # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STUDIO = json.load(open(os.path.join(HERE, "data", "studio", "studio.json"), encoding="utf-8"))
SHOP = json.load(open(os.path.join(HERE, "data", "shop.json"), encoding="utf-8"))
CARD_IDS = {c["id"] for c in SHOP["cards"]}
PRIV_F = os.environ.get("STUDIO_PRIVATE", os.path.expanduser("~/.claude/state/studio-private.txt"))
NAMES = [ln.strip() for ln in open(PRIV_F, encoding="utf-8") if ln.strip() and not ln.startswith("#")] if os.path.exists(PRIV_F) else []
SECRET = [
    (r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "an IP address"),
    (r"/Users/|~/\.|\.tokens|/srv/", "a path on our machines"),
    (r"\b(?:sk|pk|rk)-[A-Za-z0-9_-]{16,}|\bghp_[A-Za-z0-9]{20,}|\bAKIA[0-9A-Z]{16}\b|\bxox[bp]-", "something shaped like a key"),
    (r"[A-Za-z0-9._%+-]+@(?!example\.(?:com|org))[A-Za-z0-9.-]+\.[a-z]{2,}", "an email address"),
]
OK_MAIL = {"nan@motdang.net"}


def fetch_ok(u):
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (compatible; hongdam-studio-check; +https://hongdam.net/studio/)"})
        with urllib.request.urlopen(req, timeout=25) as r:
            return r.status < 400, r.status
    except urllib.error.HTTPError as e:
        return e.code in (401, 403, 405, 429), e.code
    except Exception as e:  # noqa: BLE001
        return False, type(e).__name__


def check(path, offline=False):
    bad = []
    name = os.path.basename(path)
    m = re.match(r"(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$", name)
    if not m:
        return ["file name: <yyyy-mm-dd>-<slug>.md, slug in lowercase letters, digits and dashes"]
    if len(m.group(2)) > 60:
        bad.append("slug longer than 60 characters")
    try:
        head, body = M.read(path)
    except Exception as e:  # noqa: BLE001
        return ["head: %s" % e]
    for k in ("title", "title_th", "date", "beat", "dek", "dek_th", "cards", "sources"):
        if not head.get(k):
            bad.append("head: %s is missing" % k)
    if head.get("date") and head["date"] != m.group(1):
        bad.append("head: date %s, file name %s" % (head["date"], m.group(1)))
    if len(head.get("title", "")) > 90:
        bad.append("title longer than 90 characters")
    if len(head.get("dek", "")) > 230:
        bad.append("dek longer than 230 characters")
    if head.get("beat") and head["beat"] not in STUDIO["beats"]:
        bad.append("beat %s: one of %s" % (head["beat"], ", ".join(STUDIO["beats"])))
    cards = head.get("cards", [])
    if not 1 <= len(cards) <= 4:
        bad.append("cards: 1 to 4")
    bad += ["card %s is not in data/shop.json" % c for c in cards if c not in CARD_IDS]
    srcs = head.get("sources", [])
    if len(srcs) < 2:
        bad.append("sources: 2 or more")
    for i, s in enumerate(srcs, 1):
        if not s.get("t") or not str(s.get("u", "")).startswith("https://"):
            bad.append("source %d: needs t and an https u" % i)
    try:
        M.html(body, len(srcs))
    except Exception as e:  # noqa: BLE001
        bad.append("body: %s" % e)
    cited = {int(x) for x in re.findall(r"\[(\d{1,2})\](?!\()", re.sub(r"```.*?```", "", body, flags=re.S))}
    for i in range(1, len(srcs) + 1):
        if i not in cited:
            bad.append("source %d is never cited in the body" % i)
    w = M.words(body)
    if not 350 <= w <= 1900:
        bad.append("body: %d words (350 to 1,900)" % w)
    text = json.dumps(head, ensure_ascii=False) + "\n" + body
    scan = re.sub(r"https?://\S+", " ", text)
    for rx, what in SECRET:
        for hit in set(re.findall(rx, scan)):
            if what == "an email address" and hit in OK_MAIL:
                continue
            if what == "an IP address" and re.match(r"^(?:\d+\.){3}\d+$", hit) and all(int(p) < 10 for p in hit.split(".")):
                continue  # a version number like 1.2.3.4
            bad.append("private: %s (%s)" % (what, hit))
    for nm in NAMES:
        if re.search(r"(?<![\w])%s(?![\w])" % re.escape(nm), scan, flags=re.I):
            bad.append("private: names %s (studio-private.txt)" % nm)
    out = subprocess.run([sys.executable, os.path.expanduser("~/.claude/bin/stylecheck.py"), path], capture_output=True, text=True)
    if out.returncode or (out.stdout.strip() and out.stdout.strip() != "clean"):
        bad.append("stylecheck: " + (out.stdout.strip() or out.stderr.strip()).replace("\n", " | ")[:600])
    if not offline:
        for i, s in enumerate(srcs, 1):
            ok, st = fetch_ok(s.get("u", ""))
            if not ok:
                bad.append("source %d does not answer (%s): %s" % (i, st, s.get("u")))
    return bad


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    fails = 0
    for p in args:
        bad = check(p, "--offline" in sys.argv)
        if bad:
            fails += 1
            print("✗ %s" % p)
            for b in bad:
                print("  - " + b)
        else:
            print("✓ %s" % p)
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

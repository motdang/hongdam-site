#!/usr/bin/env python3
"""Checks an Ask Nan column before it goes in. Exit 0 when it passes, 1 with a list of what to fix.

    python3 tools/asknan_check.py data/asknan/columns/2026-11-01-some-slug.md [--offline]

Head: no, date (the file's), kind, title (80 at most), title_th, q (400 at most), q_th, dek (230 at most), dek_th,
line (2 to 4 dingbats), cards (0 to 3 shop cards), do (button words 30 at most, a link) or a card, sources (1 or
more, https). Body: renders, 250 to 1,000 words, every [n] names a source and every source is cited. The words pass
~/.claude/bin/stylecheck.py, advice included. Nothing private: no addresses on the network, keys, paths on this Mac,
email addresses but the shop's, names of the team, clients, family or case (the lists stay on this Mac,
~/.claude/state/studio-private.txt and ~/.claude/state/asknan-private.txt). Sources answer (a 401, 403 or 429 from a
site that refuses robots is allowed; --offline skips the fetch).
"""
import glob
import json
import os
import re
import subprocess
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import studio_md as M  # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = json.load(open(os.path.join(HERE, "data", "asknan", "asknan.json"), encoding="utf-8"))
SHOP = json.load(open(os.path.join(HERE, "data", "shop.json"), encoding="utf-8"))
LOOKS = json.load(open(os.path.join(HERE, "data", "looks.json"), encoding="utf-8"))
CARD_IDS = {c["id"] for c in SHOP["cards"]}
NAMES = []
for f in (os.path.expanduser("~/.claude/state/studio-private.txt"), os.path.expanduser("~/.claude/state/asknan-private.txt")):
    if os.path.exists(f):
        NAMES += [ln.strip() for ln in open(f, encoding="utf-8") if ln.strip() and not ln.startswith("#")]
SECRET = [
    (r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "an IP address"),
    (r"/Users/|~/\.|\.tokens|/srv/", "a path on our machines"),
    (r"\b(?:sk|pk|rk)-[A-Za-z0-9_-]{16,}|\bghp_[A-Za-z0-9]{20,}|\bAKIA[0-9A-Z]{16}\b|\bxox[bp]-", "something shaped like a key"),
    (r"[A-Za-z0-9._%+-]+@(?!example\.(?:com|org))[A-Za-z0-9.-]+\.[a-z]{2,}", "an email address"),
]
OK_MAIL = {"nan@motdang.net"}


def fetch_ok(u):
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (compatible; hongdam-asknan-check; +https://hongdam.net/ask-nan/)"})
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
    if len(m.group(2)) > 50:
        bad.append("slug longer than 50 characters")
    try:
        head, body = M.read(path)
    except Exception as e:  # noqa: BLE001
        return ["head: %s" % e]
    for k in ("no", "date", "kind", "title", "title_th", "q", "q_th", "dek", "dek_th", "line", "sources"):
        if not head.get(k):
            bad.append("head: %s is missing" % k)
    if head.get("date") and head["date"] != m.group(1):
        bad.append("head: date %s, file name %s" % (head["date"], m.group(1)))
    if not isinstance(head.get("no"), int):
        bad.append("head: no is a whole number")
    else:
        for other in glob.glob(os.path.join(os.path.dirname(os.path.abspath(path)), "*.md")):
            if os.path.abspath(other) == os.path.abspath(path):
                continue
            try:
                oh, _ = M.read(other)
            except Exception:  # noqa: BLE001
                continue
            if oh.get("no") == head["no"]:
                bad.append("no %d is taken by %s" % (head["no"], os.path.basename(other)))
    for k, n in (("title", 80), ("q", 400), ("dek", 230)):
        if len(head.get(k, "")) > n:
            bad.append("%s longer than %d characters" % (k, n))
    if head.get("kind") and head["kind"] not in A["kinds"]:
        bad.append("kind %s: one of %s" % (head["kind"], ", ".join(A["kinds"])))
    line = head.get("line", [])
    if not 2 <= len(line) <= 4:
        bad.append("line: 2 to 4 dingbats")
    bad += ["line: %s is not a dingbat in data/looks.json" % g for g in line if g not in LOOKS["glyphs"]]
    cards = head.get("cards", [])
    if len(cards) > 3:
        bad.append("cards: 0 to 3")
    bad += ["card %s is not in data/shop.json" % c for c in cards if c not in CARD_IDS]
    do = head.get("do")
    if do:
        if not do.get("t") or len(do["t"]) > 30 or not re.match(r"^(https://|/)", do.get("u", "")):
            bad.append("do: needs t (30 characters at most) and u (https:// or /path)")
    elif not cards:
        bad.append("do or cards: the reader needs one thing to do next")
    srcs = head.get("sources", [])
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
    bad += ["[%d] in the body names no source" % i for i in sorted(cited) if i > len(srcs)]
    w = M.words(body)
    if not 250 <= w <= 1000:
        bad.append("body: %d words (250 to 1,000)" % w)
    text = json.dumps(head, ensure_ascii=False) + "\n" + body
    scan = re.sub(r"https?://\S+", " ", text)
    for rx, what in SECRET:
        for hit in set(re.findall(rx, scan)):
            if what == "an email address" and hit in OK_MAIL:
                continue
            if what == "an IP address" and all(int(p) < 10 for p in hit.split(".")):
                continue  # a version number like 1.2.3.4
            bad.append("private: %s (%s)" % (what, hit))
    for nm in NAMES:   # as written: "Beer" the name, not beer the drink
        if re.search(r"(?<![\w])%s(?![\w])" % re.escape(nm), scan):
            bad.append("private: names %s" % nm)
    out = subprocess.run([sys.executable, os.path.expanduser("~/.claude/bin/stylecheck.py"), path], capture_output=True, text=True)
    if out.returncode or (out.stdout.strip() and out.stdout.strip() != "clean"):
        bad.append("stylecheck: " + (out.stdout.strip() or out.stderr.strip()).replace("\n", " | ")[:900])
    if not offline:
        for i, s in enumerate(srcs, 1):
            ok, st = fetch_ok(s.get("u", ""))
            if not ok:
                bad.append("source %d does not answer (%s): %s" % (i, st, s.get("u")))
        if do and do.get("u", "").startswith("https://"):
            ok, st = fetch_ok(do["u"])
            if not ok:
                bad.append("do link does not answer (%s): %s" % (st, do["u"]))
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

#!/usr/bin/env python3
"""The copies of hongdam.net/bots on GitHub Pages: motdang.github.io/bots and nanobotco.github.io/bots.

Nan 2026-10-18: "Put a minisite on github motdang, nanobotco, and hongdam." The page is
written once, in docs/bots/index.html; this writes a copy into each repo folder with its
links pointed at hongdam.net and the stylesheet beside it. The page's script already
reaches hongdam.net/api/bots from anywhere. The canonical stays hongdam.net/bots/.

    python3 tools/bots_copies.py <repo folder>...
"""
import pathlib, re, shutil, sys

DOCS = pathlib.Path(__file__).resolve().parent.parent / "docs"
src = (DOCS / "bots" / "index.html").read_text(encoding="utf-8")
page = src.replace('href="/assets/rt.css"', 'href="rt.css"')
page = page.replace('<script src="/ticker.js" defer></script>\n', "")
page = re.sub(r'(href|src)="/(?!/)', r'\1="https://hongdam.net/', page)
for out in sys.argv[1:]:
    o = pathlib.Path(out)
    o.mkdir(parents=True, exist_ok=True)
    (o / "index.html").write_text(page, encoding="utf-8")
    shutil.copyfile(DOCS / "assets" / "rt.css", o / "rt.css")
    (o / ".nojekyll").write_text("")
    print("wrote", o / "index.html")

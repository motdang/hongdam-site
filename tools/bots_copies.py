#!/usr/bin/env python3
"""The copies of hongdam.net/bots on GitHub Pages: motdang.github.io/bots and nanobotco.github.io/bots.

Nan 2026-10-18: "Put a minisite on github motdang, nanobotco, and hongdam." The page is
written once, in docs/bots/index.html (tools/pages.py); this writes a copy into each repo folder with its
links pointed at hongdam.net and the two stylesheets beside it. The page's script already
reaches hongdam.net/api/bots from anywhere. The dingbats come from hongdam.net as plain scripts
(shop.js, a module, stays home: hongdam.net/assets/ sends no cross-origin header). The canonical
stays hongdam.net/bots/.

    python3 tools/bots_copies.py <repo folder>...
"""
import json, pathlib, re, shutil, sys

DOCS = pathlib.Path(__file__).resolve().parent.parent / "docs"
DBM = json.loads((DOCS.parent / "data" / "dingbats.json").read_text(encoding="utf-8"))
src = (DOCS / "bots" / "index.html").read_text(encoding="utf-8")
page = re.sub(r'href="/assets/(shop|pages)\.css\?v=[^"]*"', r'href="\1.css"', src)
page = re.sub(r'<script type="application/json" id="shop">.*?</script>\n<script type="module" src="/assets/shop.js"></script>\n',
              '<script src="https://hongdam.net/assets/db/%s"></script>\n<script src="https://hongdam.net/assets/db/%s"></script>\n'
              % (DBM["core"], DBM["groups"]["p-bots"]), page, flags=re.S)
assert "/assets/shop.js" not in page
page = re.sub(r'(href|src)="/(?!/)', r'\1="https://hongdam.net/', page)
for out in sys.argv[1:]:
    o = pathlib.Path(out)
    o.mkdir(parents=True, exist_ok=True)
    (o / "index.html").write_text(page, encoding="utf-8")
    for css in ("shop.css", "pages.css"):
        shutil.copyfile(DOCS / "assets" / css, o / css)
    (o / ".nojekyll").write_text("")
    print("wrote", o / "index.html")

#!/usr/bin/env python3
"""docs/for/eveline/demo/ — the giving desk with editing on the page (edit.js).
Built from docs/for/eveline/index.html; run after changing that page.
Usage: python3 tools/build_eveline_demo.py"""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'for', 'eveline')
h = open(os.path.join(ROOT, 'index.html')).read()
for a, b in (('url(img/', 'url(../img/'), ('src="img/', 'src="../img/')):
    h = h.replace(a, b)
head = '<head>'
assert h.count(head) == 1 and h.count('</body>') == 1
h = h.replace(head, head + "\n<script>window.EV_PAGE='eveline-demo';</script>", 1)
h = h.replace('</body>', '<script src="../edit.js"></script>\n</body>', 1)
os.makedirs(os.path.join(ROOT, 'demo'), exist_ok=True)
open(os.path.join(ROOT, 'demo', 'index.html'), 'w').write(h)
print('docs/for/eveline/demo/index.html', len(h))

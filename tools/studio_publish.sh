#!/bin/sh
# One Studio note to hongdam.net: check it, take the counts, build the Studio pages, draw the link pictures, run the
# contrast gate on the Studio pages, commit, and publish through a pull request (pr-push waits for CodeRabbit and
# the GitHub gates, then merges; the server deploys main within about five minutes).
#   tools/studio_publish.sh data/studio/notes/<yyyy-mm-dd>-<slug>.md
# Run on main in a clean clone (the studio desk). Exit codes are pr-push's when it gets that far (6: left open).
set -e
cd "$(dirname "$0")/.."
f="$1"
[ -f "$f" ] || { echo "usage: tools/studio_publish.sh data/studio/notes/<file>.md" >&2; exit 2; }
[ "$(git symbolic-ref --short HEAD)" = main ] || { echo "studio_publish: not on main" >&2; exit 2; }
python3 tools/studio_check.py "$f"
python3 tools/studio_counts.py >/dev/null || echo "studio_publish: counts kept from last time"
python3 tools/build_studio.py
node tools/studio_cards.mjs
node tools/contrast/run.mjs studio
title=$(python3 -c 'import sys; sys.path.insert(0, "tools"); import studio_md as M; print(M.read(sys.argv[1])[0]["title"])' "$f")
git add -A data/studio docs/studio docs/th/studio docs/my/studio docs/zh/studio docs/de/studio docs/og/studio docs/sitemap.xml docs/llms.txt
git diff --cached --quiet && { echo "studio_publish: nothing changed"; exit 0; }
git commit -q -m "Studio note: $title" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
"$HOME/.claude/bin/pr-push" . "Studio note: $title"

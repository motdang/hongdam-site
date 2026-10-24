#!/bin/sh
# Ask Nan columns to hongdam.net: check them, draw the dingbat group, build the pages, draw the link pictures, run the
# contrast gate on the Ask Nan pages, commit, and publish through a pull request (pr-push waits for CodeRabbit and the
# GitHub gates, then merges; the server deploys main within about five minutes).
#   tools/asknan_publish.sh data/asknan/columns/<yyyy-mm-dd>-<slug>.md [more columns]
# Run on main in a clean clone (the ask-nan desk). Exit codes are pr-push's when it gets that far (6: left open).
set -e
cd "$(dirname "$0")/.."
[ $# -ge 1 ] || { echo "usage: tools/asknan_publish.sh data/asknan/columns/<file>.md [...]" >&2; exit 2; }
[ "$(git symbolic-ref --short HEAD)" = main ] || { echo "asknan_publish: not on main" >&2; exit 2; }
for f in "$@"; do [ -f "$f" ] || { echo "asknan_publish: no file $f" >&2; exit 2; }; done
# every new or changed column must be one named here (and so checked): the build reads the whole folder
for f in $(git status --porcelain --untracked-files=all -- data/asknan/columns | sed 's/^...//'); do
  case " $* " in *" $f "*) ;; *) echo "asknan_publish: $f is new or changed but not named; publish it too or move it out" >&2; exit 2 ;; esac
done
python3 tools/asknan_check.py "$@"
tools/asknan_dingbats.sh
python3 tools/build_asknan.py
node tools/asknan_cards.mjs
node tools/contrast/run.mjs ask-nan
if [ $# -eq 1 ]; then
  title=$(python3 -c 'import sys; sys.path.insert(0, "tools"); import studio_md as M; h = M.read(sys.argv[1])[0]; print("No. %d: %s" % (h["no"], h["title"]))' "$1")
else
  title="$# columns"
fi
git add -A "$@" data/asknan/ideas.txt data/asknan/cards.json data/asknan/cards.done.json data/dingbats.json docs/assets/db docs/ask-nan docs/th/ask-nan docs/og/ask-nan docs/index.html docs/th/index.html \
  docs/my/index.html docs/zh/index.html docs/de/index.html docs/sitemap.xml docs/llms.txt
git diff --cached --quiet && { echo "asknan_publish: nothing changed"; exit 0; }
git commit -q -m "Ask Nan $title" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
"$HOME/.claude/bin/pr-push" . "Ask Nan $title"

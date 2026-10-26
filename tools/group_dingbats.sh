#!/bin/sh
# One page group's dingbats and nothing else (tools/blackswan_dingbats.sh, for any group): tools/dingbats.mjs draws
# every group, then every file but <group>.js goes back to the committed copy, and data/dingbats.json keeps its lines
# with the <group> line added.
#   DINGBATS_SRC=<doodle-dingbats checkout>/src tools/group_dingbats.sh p-dj
set -e
G="$1"
[ -n "$G" ] || { echo "usage: tools/group_dingbats.sh <group>" >&2; exit 2; }
cd "$(dirname "$0")/.."
# it puts every other bundle back to the committed copy, so it stops when one has edits of its own
if [ -n "$(git status --porcelain -- docs/assets/db data/dingbats.json docs/assets/favicon.svg | grep -v "/$G.js")" ]; then
  echo "group_dingbats: docs/assets/db, data/dingbats.json or the favicon has uncommitted edits; commit or set them aside first" >&2
  exit 1
fi
node tools/dingbats.mjs >/dev/null
for f in $(git diff --name-only -- docs/assets/db data/dingbats.json docs/assets/favicon.svg); do
  case "$f" in */"$G".js) ;; *) git show "HEAD:$f" > "$f" ;; esac
done
# files the full run made for groups the committed set lacks go too
for f in $(git ls-files --others --exclude-standard -- docs/assets/db); do
  case "$f" in */"$G".js) ;; *) rm -f "$f" ;; esac
done
G="$G" python3 - <<'PY'
import json, os, hashlib
g = os.environ["G"]
head = json.loads(os.popen("git show HEAD:data/dingbats.json").read())
js = open("docs/assets/db/%s.js" % g, "rb").read()
head["groups"][g] = "%s.js?v=%s" % (g, hashlib.sha1(js).hexdigest()[:8])
open("data/dingbats.json", "w").write(json.dumps(head, indent=1) + "\n")
PY
echo "$G dingbats: $(grep -o "$G.js?v=[0-9a-f]*" data/dingbats.json)"

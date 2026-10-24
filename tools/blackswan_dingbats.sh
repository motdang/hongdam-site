#!/bin/sh
# The Black Swan dingbat group (p-blackswan) and nothing else: tools/dingbats.mjs draws every group, then every file but
# p-blackswan.js goes back to the committed copy, and data/dingbats.json keeps its lines with the p-blackswan line added.
#   DINGBATS_SRC=<doodle-dingbats checkout>/src tools/blackswan_dingbats.sh
set -e
cd "$(dirname "$0")/.."
node tools/dingbats.mjs >/dev/null
for f in $(git diff --name-only -- docs/assets/db data/dingbats.json docs/assets/favicon.svg); do
  case "$f" in *p-blackswan.js) ;; *) git show "HEAD:$f" > "$f" ;; esac
done
python3 - <<'PY'
import json, os, hashlib
head = json.loads(os.popen("git show HEAD:data/dingbats.json").read())
js = open("docs/assets/db/p-blackswan.js", "rb").read()
head["groups"]["p-blackswan"] = "p-blackswan.js?v=" + hashlib.sha1(js).hexdigest()[:8]
open("data/dingbats.json", "w").write(json.dumps(head, indent=1) + "\n")
PY
echo "black swan dingbats: $(grep -o 'p-blackswan.js?v=[0-9a-f]*' data/dingbats.json)"

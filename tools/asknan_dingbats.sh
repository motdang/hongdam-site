#!/bin/sh
# The Ask Nan dingbat group (p-asknan) and nothing else: tools/dingbats.mjs draws every group from the doodle-dingbats
# source, then every file but p-asknan.js goes back to main's copy, and data/dingbats.json keeps main's lines with the
# p-asknan line added. A column never changes the core or another page's drawings.
#   tools/asknan_dingbats.sh
set -e
cd "$(dirname "$0")/.."
node tools/dingbats.mjs >/dev/null
for f in $(git diff --name-only -- docs/assets/db data/dingbats.json); do
  case "$f" in *p-asknan.js) ;; *) git show "HEAD:$f" > "$f" ;; esac
done
python3 - <<'PY'
import json, re, os
head = json.loads(os.popen("git show HEAD:data/dingbats.json").read())
js = open("docs/assets/db/p-asknan.js", "rb").read()
import hashlib
head["groups"]["p-asknan"] = "p-asknan.js?v=" + hashlib.sha1(js).hexdigest()[:8]
open("data/dingbats.json", "w").write(json.dumps(head, indent=1) + "\n")
PY
echo "asknan dingbats: $(grep -o 'p-asknan.js?v=[0-9a-f]*' data/dingbats.json)"

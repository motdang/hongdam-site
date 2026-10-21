#!/usr/bin/env bash
# A new edit key for a /for/ page that edits itself (functions/api/page/[[path]].js).
# Stores the key's SHA-256 in page_keys on D1 hongdam-tasks (run migrations/0004 first),
# saves the key to ~/.tokens/PAGE_EDIT_<PAGE>, and prints the edit link.
# A new key replaces the old one; the old edit link stops saving.
# Usage: tools/page_key.sh eveline-demo /for/eveline/demo/
set -euo pipefail
page=${1:?page id, e.g. eveline-demo}; path=${2:?page path, e.g. /for/eveline/demo/}
[[ $page =~ ^[a-z0-9-]{1,40}$ ]] || { echo "page id: a-z, 0-9, -" >&2; exit 2; }
cd "$(dirname "$0")/.."
eval "$("$HOME/.claude/bin/cfenv")"
key=$(python3 -c "import secrets;print(secrets.token_urlsafe(24))")
hash=$(printf %s "$key" | shasum -a 256 | cut -d' ' -f1)
npx --yes wrangler@latest d1 execute hongdam-tasks --remote \
  --command "INSERT OR REPLACE INTO page_keys (page, key_hash, made) VALUES ('$page', '$hash', '$(date -u +%FT%TZ)')" >/dev/null
name="PAGE_EDIT_$(echo "$page" | tr 'a-z-' 'A-Z_')"
umask 077; mkdir -p "$HOME/.tokens"; printf %s "$key" > "$HOME/.tokens/$name"
echo "key saved: ~/.tokens/$name"
echo "edit link: https://hongdam.net$path#k=$key"

#!/usr/bin/env node
// The doodle dingbats a service minisite draws beyond its own category's set (the steps, the related services), as one
// small file per set of glyphs: docs/assets/m/db/<hash>.js. Reads data/minisite_glyphs.json ({page: [glyph names]})
// written by tools/build_minisites.py, which calls this and then names each page's file on <body data-db-extra>.
// The glyphs are cut from the family files in ../../doodle-dingbats/src, the same way tools/eggs.mjs cuts them.
//   node tools/minisite_dingbats.mjs   → data/minisite_glyph_files.json
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const SRC = path.resolve(ROOT, '../../doodle-dingbats/src')
const OUT = path.join(ROOT, 'docs/assets/m/db')
const ESB = path.resolve(ROOT, '../../anidoodle-motdang/node_modules/.bin/esbuild')
const NEEDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/minisite_glyphs.json'), 'utf8'))

function split(text) {
  const lines = text.replace(/\s+$/, '').split('\n')
  const open = lines.findIndex((l) => l.startsWith('(function (D)'))
  const close = lines.length - 1
  if (open < 0 || !lines[close].startsWith('})(Dingbats);')) throw new Error('not a family file')
  const head = lines.slice(0, open + 1), chunks = []
  let cur = null, pending = []
  for (const l of lines.slice(open + 1, close)) {
    const starts = /^[^\s})\]]/.test(l)
    if (starts && (l.startsWith('/*') || l.startsWith('//'))) { pending.push(l); continue }
    if (starts) {
      cur = { lines: pending.concat([l]), name: (l.match(/^D\.add\('([a-z0-9-]+)'/) || [])[1] || null }
      pending = []
      chunks.push(cur)
      continue
    }
    if (cur) cur.lines.push(...pending, l)
    pending = []
  }
  return { head, chunks }
}
const fams = {}, owner = {}
for (const f of fs.readdirSync(path.join(SRC, 'fam')).filter((f) => f.endsWith('.js')).sort()) {
  fams[f] = split(fs.readFileSync(path.join(SRC, 'fam', f), 'utf8'))
  for (const c of fams[f].chunks) if (c.name) owner[c.name] = f
}
function bundle(names) {
  const want = new Set(names.filter((n) => owner[n])), out = []
  for (const F of Object.values(fams)) {
    if (!F.chunks.some((c) => c.name && want.has(c.name))) continue
    out.push(F.head.join('\n'), ...F.chunks.filter((c) => !c.name || want.has(c.name)).map((c) => c.lines.join('\n')), '})(Dingbats);')
  }
  return out.join('\n')
}
const minify = (code) => execFileSync(ESB, ['--minify', '--loader=js', '--log-level=warning'], { input: code }).toString()
const ver = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10)

fs.mkdirSync(OUT, { recursive: true })
const made = {}, map = {}
let bytes = 0
for (const [page, names] of Object.entries(NEEDS)) {
  const known = [...new Set(names)].filter((n) => owner[n]).sort()
  if (!known.length) continue
  const key = known.join(' ')
  if (!made[key]) {
    const code = minify(bundle(known)), f = ver(code) + '.js'
    fs.writeFileSync(path.join(OUT, f), code)
    made[key] = '/assets/m/db/' + f
    bytes += code.length
  }
  map[page] = made[key]
}
const keep = new Set(Object.values(made).map((u) => path.basename(u)))
for (const f of fs.readdirSync(OUT)) if (!keep.has(f) && Object.keys(NEEDS).length) { /* an older bundle another page may still name: left in place */ }
fs.writeFileSync(path.join(ROOT, 'data/minisite_glyph_files.json'), JSON.stringify(map, null, 0))
console.log(Object.keys(map).length, 'pages ·', Object.keys(made).length, 'files ·', (bytes / 1024).toFixed(0), 'KB')

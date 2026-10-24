#!/usr/bin/env node
// The doodle dingbats for hongdam.net: docs/assets/db/core.js, then one small file per page group
// holding only the glyphs its pages draw, read from data/shop.json (the master line, the doors,
// each card's line). Source: ../../doodle-dingbats/src. Run after shop.json or the set changes.
//   node tools/dingbats.mjs
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const SRC = path.resolve(ROOT, '../../doodle-dingbats/src')
const OUT = path.join(ROOT, 'docs/assets/db')
const ESB = path.resolve(ROOT, '../../anidoodle-motdang/node_modules/.bin/esbuild')
const SHOP = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/shop.json'), 'utf8'))

// A family file is an IIFE whose statements start at column 0: helpers, constants, and one D.add per glyph.
function split(text) {
  const lines = text.replace(/\s+$/, '').split('\n')
  const open = lines.findIndex((l) => l.startsWith('(function (D)'))
  const close = lines.length - 1
  if (open < 0 || !lines[close].startsWith('})(Dingbats);')) throw new Error('not a family file')
  const head = lines.slice(0, open + 1), chunks = []
  let cur = null, pendingComments = []
  for (const l of lines.slice(open + 1, close)) {
    const starts = /^[^\s})\]]/.test(l)
    if (starts && (l.startsWith('/*') || l.startsWith('//')) && !(cur && cur.open)) { pendingComments.push(l); continue }
    if (starts && !l.startsWith('/*') && !l.startsWith('//')) {
      cur = { lines: pendingComments.concat([l]), name: (l.match(/^D\.add\('([a-z0-9-]+)'/) || [])[1] || null }
      pendingComments = []
      chunks.push(cur)
      continue
    }
    if (cur) cur.lines.push(...pendingComments, l)
    pendingComments = []
  }
  return { head, chunks }
}

const fams = {}, owner = {}
for (const f of fs.readdirSync(path.join(SRC, 'fam')).filter((f) => f.endsWith('.js')).sort()) {
  const fam = f.slice(0, -3)
  fams[fam] = split(fs.readFileSync(path.join(SRC, 'fam', f), 'utf8'))
  for (const c of fams[fam].chunks) if (c.name) owner[c.name] = fam
}

function bundle(names) {
  const want = new Set(names), out = []
  for (const n of want) if (!owner[n]) throw new Error('no dingbat called ' + n)
  for (const [fam, F] of Object.entries(fams)) {
    const mine = F.chunks.filter((c) => c.name && want.has(c.name))
    if (!mine.length) continue
    out.push(F.head.join('\n'), ...F.chunks.filter((c) => !c.name || want.has(c.name)).map((c) => c.lines.join('\n')), '})(Dingbats);')
  }
  return out.join('\n')
}

const minify = (code) => execFileSync(ESB, ['--minify', '--loader=js', '--log-level=warning'], { input: code }).toString()
const ver = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8)

// data/looks.json: which glyph each door, card line, master line and tracker stop draws
const LOOKS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/looks.json'), 'utf8'))
// a card with no line of its own draws its door, the work starting, and done
const pic = (c) => LOOKS.pics[c.id] || [LOOKS.doors[c.cat], 'gears', 'done'].filter(Boolean)
// the swans on every job line: walking, standing, their moves at a stop and at the end, and Dam (shop.js ride)
const SWANS = ['hongsa', 'hongsa-walk', 'hongsa-stand', 'hongsa-idle', 'hongsa-peck', 'hongsa-hop', 'hongsa-flap', 'hongsa-honk', 'hongsa-bow', 'hongsa-look', 'hongsa-court', 'hongsa-nuzzle', 'duckling-walk', 'duckling-wait']
const always = [...SWANS, 'search', ...LOOKS.master.map((m) => m.db), ...LOOKS.track.map((m) => m.db)]
const groups = { front: [...always, ...Object.values(LOOKS.doors)] }
for (const c of SHOP.cards) if (c.pop) groups.front.push(...pic(c))
for (const cat of SHOP.cats) groups[cat.id] = [...always, ...(LOOKS.doors[cat.id] ? [LOOKS.doors[cat.id]] : []), ...SHOP.cards.filter((c) => c.cat === cat.id).flatMap(pic)]

fs.mkdirSync(OUT, { recursive: true })
for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f))
const core = minify(fs.readFileSync(path.join(SRC, 'core.js'), 'utf8'))
fs.writeFileSync(path.join(OUT, 'core.js'), core)
const manifest = { core: 'core.js?v=' + ver(core), groups: {} }
let total = 0
for (const [g, names] of Object.entries(groups)) {
  const code = minify(bundle([...new Set(names)]))
  fs.writeFileSync(path.join(OUT, g + '.js'), code)
  manifest.groups[g] = g + '.js?v=' + ver(code)
  total += code.length
}
fs.writeFileSync(path.join(ROOT, 'data/dingbats.json'), JSON.stringify(manifest, null, 1) + '\n')
const gz = (s) => execFileSync('gzip', ['-9c'], { input: s }).length
console.log('core', (gz(core) / 1024).toFixed(1), 'KB gz ·', Object.keys(groups).length, 'groups, front', (gz(fs.readFileSync(path.join(OUT, 'front.js'))) / 1024).toFixed(1), 'KB gz')

// The favicon: the black swan on paper, drawn by the same code as the glyph (still frame, small-size detail).
{
  const { createRequire } = await import('node:module')
  const req = createRequire(import.meta.url)
  req(path.join(SRC, 'core.js')); req(path.join(SRC, 'fam/lanna.js'))
  const svg = globalThis.Dingbats.svg('hongsa-stand', { t: 0.12, size: 28, ink: '#121212', bg: '#F1EDE4', margin: 6 })
  const vb = svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number)
  const icon = svg.replace(/width="\d+" height="\d+"/, 'width="64" height="64"').replace(/(<svg[^>]*>)/, `$1<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" rx="${vb[3] * 0.22}" fill="#F1EDE4"/>`)
  fs.writeFileSync(path.join(ROOT, 'docs/assets/favicon.svg'), icon + '\n')
  console.log('favicon', (icon.length / 1024).toFixed(1), 'KB')
}

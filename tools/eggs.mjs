#!/usr/bin/env node
// The easter eggs: data/eggs.json → docs/assets/eggs.js (tools/eggs.src.js with the list filled in), the doodle
// dingbats each egg draws in docs/assets/eggs/ (a base file loaded once the page settles, one per egg loaded when it
// hatches), and the "Hidden things" part of docs/llms.txt. Its own folder, because tools/dingbats.mjs empties
// docs/assets/db/ each run. Source of the drawings: ../../doodle-dingbats/src.
//   node tools/eggs.mjs
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const SRC = path.resolve(ROOT, '../../doodle-dingbats/src')
const OUT = path.join(ROOT, 'docs/assets/eggs')
const ESB = path.resolve(ROOT, '../../anidoodle-motdang/node_modules/.bin/esbuild')
const EGGS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/eggs.json'), 'utf8'))
const STORY = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/eggs-story.json'), 'utf8'))
const LOOKS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/looks.json'), 'utf8'))
const SHOP = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/shop.json'), 'utf8'))
const DBM = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/dingbats.json'), 'utf8'))

// A family file is an IIFE whose statements start at column 0: helpers, constants, and one D.add per glyph
// (the same reading as tools/dingbats.mjs).
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
  const fam = f.slice(0, -3)
  fams[fam] = split(fs.readFileSync(path.join(SRC, 'fam', f), 'utf8'))
  for (const c of fams[fam].chunks) if (c.name) owner[c.name] = fam
}
function bundle(names) {
  const want = new Set(names), out = []
  for (const n of want) if (!owner[n]) throw new Error('no dingbat called ' + n)
  for (const F of Object.values(fams)) {
    if (!F.chunks.some((c) => c.name && want.has(c.name))) continue
    out.push(F.head.join('\n'), ...F.chunks.filter((c) => !c.name || want.has(c.name)).map((c) => c.lines.join('\n')), '})(Dingbats);')
  }
  return out.join('\n')
}
const minify = (code) => execFileSync(ESB, ['--minify', '--loader=js', '--log-level=warning'], { input: code }).toString()
const ver = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8)

fs.mkdirSync(OUT, { recursive: true })
for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f))
const write = (names) => {
  const code = minify(bundle(names))
  const f = ver(code) + '.js'
  fs.writeFileSync(path.join(OUT, f), code)
  return { url: '/assets/eggs/' + f, bytes: code.length }
}
// Pages not listed anywhere public (noindex): the client pages, invoices, the stats page. eggs.js names them by a
// hash of the path (FNV-1a, the same as in eggs.src.js), and llms.txt leaves them out.
const PRIVATE = /^(for\/|invoice|stats)/
const fnv = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0 } return h.toString(36) }
const base = write(EGGS.base)
const pages = {}, files = {}
let bytes = base.bytes
for (const [key, e] of Object.entries(EGGS.pages)) {
  if (!['parade', 'swim', 'rise', 'rain', 'burst'].includes(e.show)) throw new Error(key + ': no show called ' + e.show)
  const own = e.g.filter((g) => !EGGS.base.includes(g))
  const id = own.slice().sort().join(' ')
  if (own.length && !files[id]) { files[id] = write(own); bytes += files[id].bytes }
  pages[PRIVATE.test(key) ? '#' + fnv(key) : key] = { show: e.show, g: e.g, say: e.say, ...(e.at ? { at: e.at } : {}), ...(own.length ? { b: files[id].url } : {}) }
}
// The story (data/eggs-story.json): Dam's forms, the duck, the feather, the doors of the trip line, and the
// pictures of the moments and words, in one file loaded at the first tap. Its scenes for pages not listed in
// public are kept under the same hash as their eggs.
const doors = Object.fromEntries(Object.entries(LOOKS.doors).filter(([c]) => SHOP.cats.some((x) => x.id === c)))
const storyNames = new Set(['hongsa', 'hongsa-walk', 'hongsa-stand', 'sparkle', 'duck', 'feather', ...Object.values(STORY.character.forms).map((f) => f.glyph), ...Object.values(doors)])
for (const c of STORY.chapters) (c.g || []).forEach((g) => storyNames.add(g))
for (const m of STORY.moments) [...(m.add || []), ...(m.replace || [])].forEach((g) => storyNames.add(g))
for (const [k, w] of Object.entries(STORY.words)) if (k !== 'about') (w.g || []).forEach((g) => storyNames.add(g))
for (const g of EGGS.base) storyNames.delete(g)
const storyB = write([...storyNames])
bytes += storyB.bytes
const scenes = Object.fromEntries(Object.entries(STORY.scenes).map(([k, v]) => [PRIVATE.test(k) ? '#' + fnv(k) : k, v]))
const story = { character: STORY.character, chapters: STORY.chapters, scenes, feathers: { golden: STORY.feathers.golden }, egg: STORY.egg, rare: STORY.rare, moments: STORY.moments, words: STORY.words }
const cats = SHOP.cats.map((c) => ({ id: c.id, n: c.n.en }))
const data = { core: '/assets/db/' + DBM.core, base: base.url, storyB: storyB.url, doors, cats, pages, story }
const src = fs.readFileSync(path.join(ROOT, 'tools/eggs.src.js'), 'utf8')
if (!src.includes('/*DATA*/{}/*END*/')) throw new Error('tools/eggs.src.js lost its /*DATA*/ marker')
fs.writeFileSync(path.join(ROOT, 'docs/assets/eggs.js'), src.replace('/*DATA*/{}/*END*/', '/*DATA*/' + JSON.stringify(data) + '/*END*/'))

// Tell the bots: the eggs in llms.txt, between EGGS markers.
const LL = path.join(ROOT, 'docs/llms.txt')
let ll = fs.readFileSync(LL, 'utf8')
const label = (k) => (k === 'front' ? 'https://hongdam.net/' : k === 'default' ? 'any other page' : k === '404' ? 'a missing page' : 'https://hongdam.net/' + k + '/')
const block = '<!-- EGGS:START -->\n## Hidden things\n\nThe pages hide easter eggs: a small dyed egg in the Thai colour of the day, somewhere on the page. Tap it, or type egg or swan, and it cracks and a chick peeps out. The eggs tell one story in the order a visitor finds them: Dam (ดำ, \'black\'), a chick the ducks of a Chiang Rai paddy take for an odd duckling, wanders the pages, and at the ninth egg sees itself in a lake: a black swan, Hong Dam, หงส์ดำ. The pages and their first lines:\n\n' +
  Object.entries(EGGS.pages).filter(([k]) => !PRIVATE.test(k)).map(([k, e]) => `- ${label(k)} — ${(STORY.scenes[k] || STORY.scenes.default).duckling}`).join('\n') + '\n<!-- EGGS:END -->'
if (ll.includes('<!-- EGGS:START -->')) ll = ll.slice(0, ll.indexOf('<!-- EGGS:START -->')) + block + ll.slice(ll.indexOf('<!-- EGGS:END -->') + '<!-- EGGS:END -->'.length)
else ll = ll.replace(/\n*$/, '\n\n' + block + '\n')
fs.writeFileSync(LL, ll)

const gz = (f) => execFileSync('gzip', ['-9c', f]).length
console.log(Object.keys(pages).length, 'eggs ·', Object.keys(files).length + 1, 'picture files,', (bytes / 1024).toFixed(0), 'KB ·',
  'eggs.js', (gz(path.join(ROOT, 'docs/assets/eggs.js')) / 1024).toFixed(1), 'KB gz · base', (gz(path.join(ROOT, 'docs' + base.url)) / 1024).toFixed(1), 'KB gz')

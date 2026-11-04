#!/usr/bin/env node
// Link-preview pictures (1200 × 630) for the service minisites: docs/og/s/<card id>.jpg, in the shop's Isotype look.
// A big page's card carries its own photo in two inks on the right; a modest page's carries its category's door.
// Reads data/minisite_cards.json (written by tools/build_minisites.py). Run after it:
//   node tools/share_cards_minisites.mjs [id ...]
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const LOCAL_PW = path.join(process.env.HOME || '', 'Developer/claude code projects/anidoodle-motdang/node_modules/playwright-core/index.mjs')
const { chromium } = await import(process.env.PLAYWRIGHT_CORE || 'playwright-core').catch(() => import(url.pathToFileURL(LOCAL_PW).href))
function chromeExe() {
  if (process.env.CHROME) return process.env.CHROME
  const cache = path.join(process.env.HOME || '', 'Library/Caches/ms-playwright')
  const shell = fs.existsSync(cache) && fs.readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop()
  return shell ? path.join(cache, shell, 'chrome-headless-shell-mac-arm64/chrome-headless-shell') : undefined
}

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const DOCS = path.join(ROOT, 'docs'), OUT = path.join(DOCS, 'og/s')
const CARDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/minisite_cards.json'), 'utf8'))
const DBM = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/dingbats.json'), 'utf8'))
const HUE = Object.fromEntries([...fs.readFileSync(path.join(DOCS, 'assets/shop.css'), 'utf8').matchAll(/--c-([a-z]+): oklch\(var\(--lL\) var\(--lC\) (\d+)\)/g)].map((m) => [m[1], +m[2]]))
HUE.weddings ??= HUE.events   // the shop renamed events to weddings; the colour stayed
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const db = (g) => `<doodle-dingbat name="${esc(g)}" play="still"></doodle-dingbat>`
const want = process.argv.slice(2)

const page = (c0) => {
  // the right-hand panel: the service's drawing or photo when it has one, else its own dingbats large on its colour
  const c = { ...c0, pic: c0.draw || c0.pic || (!(c0.draw || c0.pic) && (c0.glyphs || []).length ? 'glyphs' : ''), gl: !(c0.draw || c0.pic) && (c0.glyphs || []).length ? c0.glyphs : null }
  const hue = HUE[c.cat] ?? 32, ink = `oklch(.6 .17 ${hue})`
  // the card's picture is about this service: its own drawing (tools: anidoodle-motdang hdCards), else the page's photo
  const drawn = !!c.draw, pic = c.draw ? url.pathToFileURL(path.join(DOCS, c.draw)).href : c.pic && c.pic !== 'glyphs' ? url.pathToFileURL(path.join(DOCS, c.pic)).href : ''
  const words = c.en.split(/\s+/), longest = Math.max(...words.map((w) => w.length))
  // the name fits its box without breaking a word: size by the longest word and the whole length
  const size = Math.min(c.pic ? 84 : 104, Math.floor((c.pic ? 530 : 760) / (longest * 0.6)), c.en.length > 26 ? 62 : c.en.length > 16 ? 76 : 104)
  return `<!doctype html><meta charset="utf-8">
<style>
*{box-sizing:border-box} body{margin:0;width:1200px;height:630px;overflow:hidden;background:#F1EDE4;color:#121212;font-family:Futura,"Futura PT",Jost,"Avenir Next","Noto Sans Thai",Thonburi,sans-serif;--db-look:riso}
.ph{position:absolute;top:0;right:0;bottom:0;width:520px;background:${drawn ? '#f5efe2' : ink}}
.ph i{position:absolute;inset:0;background:url("${pic}") center/cover;${drawn ? '' : 'filter:grayscale(1) contrast(1.15) brightness(1.08);mix-blend-mode:multiply'}}
.ph b{position:absolute;inset:0;${drawn ? 'display:none' : 'background:radial-gradient(circle,rgba(18,18,18,.28) 0 1.1px,transparent 1.6px) 0 0/7px 7px'}}
.f{position:absolute;left:34px;top:34px;bottom:34px;width:${c.pic ? 630 : 1132}px;border:4px solid #121212;box-shadow:12px 12px 0 #121212;background:#FFFDF8;padding:44px 50px}
.f:before{content:"";position:absolute;left:0;right:0;top:0;height:12px;background:${ink}}
.k{margin:0 0 10px;font:700 ${('hongdam · ' + (c.catn || c.cat)).length > 26 ? 17 : 22}px/1 Futura,sans-serif;white-space:nowrap;letter-spacing:.2em;text-transform:uppercase;color:#4A4640}
h1{margin:0;font-size:${size}px;line-height:.98;letter-spacing:-.035em;text-transform:lowercase;max-width:${c.pic ? 530 : 760}px;overflow-wrap:normal;word-break:keep-all;hyphens:none}
.th{margin:12px 0 0;font:600 36px/1.25 Thonburi,"Noto Sans Thai",sans-serif;color:#4A4640}
.p{position:absolute;left:50px;bottom:44px;font:700 46px/1 Futura,sans-serif;letter-spacing:-.02em}
.p:before{content:"";display:inline-block;width:42px;height:28px;margin-right:12px;vertical-align:2px;border:1.5px solid rgba(18,18,18,.25);border-radius:3px;background:linear-gradient(#A51931 0 16.6%,#F4F5F8 16.6% 33.3%,#2D2A4A 33.3% 66.6%,#F4F5F8 66.6% 83.3%,#A51931 83.3%)}
.line{position:absolute;right:${c.pic ? 50 : 300}px;bottom:${c.pic ? 130 : 46}px;display:flex;gap:26px;font-size:62px;line-height:0}
.door{position:absolute;right:62px;top:46px;font-size:170px;line-height:0}
.gp{position:absolute;top:0;right:0;bottom:0;width:520px;background:radial-gradient(circle,oklch(.6 .17 ${hue} / .55) 0 1.4px,transparent 1.9px) 0 0/9px 9px,oklch(.9 .06 ${hue})}
.gp span{position:absolute;line-height:0}.gp .g0{left:46px;top:28px;font-size:330px}.gp .g1{right:26px;top:250px;font-size:250px}.gp .g2{left:60px;bottom:30px;font-size:230px}
.url{position:absolute;right:62px;bottom:48px;font:700 24px/1 Futura,sans-serif;letter-spacing:.06em}
.url.on-ph{right:34px;bottom:34px;padding:12px 16px;background:#FFFDF8;border:4px solid #121212;box-shadow:6px 6px 0 #121212}
</style>
${c.pic && !c.gl ? '<div class="ph"><i></i><b></b></div>' : ''}${c.gl ? `<div class="gp">${c.gl.map((g, i) => `<span class="g${i}">${db(g)}</span>`).join('')}</div>` : ''}
<div class="f"><p class="k">hongdam · ${esc(c.catn || c.cat)}</p><h1>${esc(c.en)}</h1><p class="th">${esc(c.th)}</p>
<p class="p">${esc(c.price)}</p>${c.pic ? '' : `<span class="door">${db(c.door || 'hongsa')}</span>`}${c.pic ? '' : `<span class="line">${[...c.stops.slice(0, 3), 'hongsa-stand'].map(db).join('')}</span>`}
${c.pic ? '' : '<span class="url">hongdam.net</span>'}</div>${c.pic ? '<span class="url on-ph">hongdam.net</span>' : ''}
<script src="file://${DOCS}/assets/db/${DBM.core.split('?')[0]}"></script>${Object.values(DBM.groups).map((f) => `<script src="file://${DOCS}/assets/db/${f.split('?')[0]}"></script>`).join('')}`
}

fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: chromeExe() })
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
let n = 0
for (const c of CARDS) {
  if (want.length && !want.includes(c.id)) continue
  const f = path.join(OUT, '_card.html')
  fs.writeFileSync(f, page(c))
  await tab.goto(url.pathToFileURL(f).href, { waitUntil: 'load' })
  await tab.waitForTimeout(600)
  // a name that still overflows its box shrinks until it fits (no word is broken)
  await tab.evaluate(() => { const h = document.querySelector('h1'); let s = parseFloat(getComputedStyle(h).fontSize); while ((h.scrollWidth > h.clientWidth || h.getBoundingClientRect().bottom > 400) && s > 40) { s -= 4; h.style.fontSize = s + 'px' } })
  await tab.screenshot({ path: path.join(OUT, c.id + '.jpg'), type: 'jpeg', quality: 86 })
  n++
}
fs.rmSync(path.join(OUT, '_card.html'), { force: true })
await browser.close()
console.log(n, 'cards in docs/og/s/')

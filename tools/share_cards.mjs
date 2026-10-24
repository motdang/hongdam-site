#!/usr/bin/env node
// Link-preview pictures (1200 × 630) for the shop: docs/og/shop/front.jpg and one per category, in the Isotype look,
// drawn with the same dingbats the pages use; and docs/og/svc/<id>.jpg, one per service people buy or ask about
// (its name, Thai name, line and its own job line), which a link to its Buy or Ask page shows (functions/_middleware.js).
// Run after tools/dingbats.mjs, then tools/build_shop.py again so functions/_share_data.js names the new pictures.
//   node tools/share_cards.mjs              everything
//   node tools/share_cards.mjs retire ...   those services only
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

// Playwright (CodeRabbit on #56): PLAYWRIGHT_CORE (a path or module name), else an installed playwright-core,
// else this Mac's copy beside anidoodle. The browser: CHROME, else this Mac's Playwright cache, else Playwright's own.
const LOCAL_PW = path.join(process.env.HOME || '', 'Developer/claude code projects/anidoodle-motdang/node_modules/playwright-core/index.mjs')
const { chromium } = await import(process.env.PLAYWRIGHT_CORE || 'playwright-core').catch(() => import(url.pathToFileURL(LOCAL_PW).href))
function chromeExe() {
  if (process.env.CHROME) return process.env.CHROME
  const cache = path.join(process.env.HOME || '', 'Library/Caches/ms-playwright')
  const shell = fs.existsSync(cache) && fs.readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop()
  return shell ? path.join(cache, shell, 'chrome-headless-shell-mac-arm64/chrome-headless-shell') : undefined
}

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const DOCS = path.join(ROOT, 'docs'), OUT = path.join(DOCS, 'og/shop')
const SHOP = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/shop.json'), 'utf8'))
const LOOKS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/looks.json'), 'utf8'))
const DBM = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/dingbats.json'), 'utf8'))
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const pic = (c) => LOOKS.pics[c.id] || [LOOKS.doors[c.cat], 'gears', 'done'].filter(Boolean)
const HUE = Object.fromEntries([...fs.readFileSync(path.join(DOCS, 'assets/shop.css'), 'utf8').matchAll(/--c-([a-z]+): oklch\(var\(--lL\) var\(--lC\) (\d+)\)/g)].map((m) => [m[1], +m[2]]))
const db = (g, cls = '') => `<doodle-dingbat class="${cls}" name="${esc(g)}" play="still"></doodle-dingbat>`
const line = (stops, hue) => `<div class="line" style="--l:oklch(.6 .17 ${hue})">${stops.map((g) => `<span class="st">${db(g)}<i></i></span>`).join('')}<span class="sw">${db('hongsa-stand')}</span></div>`

const page = (big, small, sub, stops, hue, mark, group) => `<!doctype html><meta charset="utf-8">
<style>
*{box-sizing:border-box} body{margin:0;width:1200px;height:630px;background:#F1EDE4;color:#121212;font-family:Futura,"Futura PT",Jost,"Avenir Next","Noto Sans Thai",Thonburi,sans-serif;--db-look:riso}
.f{position:absolute;inset:34px;border:4px solid #121212;box-shadow:12px 12px 0 #121212;background:#FFFDF8;padding:46px 54px}
h1{margin:0;font-size:${big.length > 16 ? 76 : 104}px;line-height:.98;letter-spacing:-.035em;text-transform:lowercase;max-width:760px}
.th{margin:14px 0 0;font:600 40px/1.2 Thonburi,"Noto Sans Thai",sans-serif;color:#4A4640}
.sub{margin:18px 0 0;font-size:28px;color:#4A4640;max-width:700px}
.mark{position:absolute;right:58px;top:40px;font-size:190px;line-height:0}
.line{position:absolute;left:54px;right:300px;bottom:58px;height:120px;display:flex;justify-content:space-between;align-items:flex-start}
.line:before{content:"";position:absolute;left:36px;right:36px;bottom:16px;height:8px;background:var(--l);border-radius:8px}
.st{position:relative;font-size:72px;line-height:0;display:flex;flex-direction:column;align-items:center}
.st i{position:absolute;bottom:-46px;width:26px;height:26px;border-radius:50%;background:var(--l);box-shadow:0 0 0 4px #FFFDF8}
.sw{position:absolute;right:-120px;bottom:6px;font-size:100px;line-height:0}
.url{position:absolute;right:58px;bottom:44px;font:700 26px/1 Futura,sans-serif;letter-spacing:.06em}
</style>
<div class="f"><h1>${esc(big)}</h1><p class="th">${esc(small)}</p><p class="sub">${esc(sub)}</p>
<span class="mark">${db(mark)}</span>${line(stops, hue)}<span class="url">hongdam.net</span></div>
<script src="file://${DOCS}/assets/db/${DBM.core.split('?')[0]}"></script><script src="file://${DOCS}/assets/db/${DBM.groups[group].split('?')[0]}"></script>`

fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: chromeExe() })
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const shoot = async (name, html, dir = OUT) => {
  const f = path.join(OUT, '_card.html')
  fs.writeFileSync(f, html)
  await tab.goto(url.pathToFileURL(f).href, { waitUntil: 'load' })
  await tab.waitForTimeout(500)
  await tab.screenshot({ path: path.join(dir, name + '.jpg'), type: 'jpeg', quality: 86 })
}
// A service's name runs longer than a category's: the words shrink together until they clear the job line.
const FIT = `<style>.th,.sub{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}.th{margin-top:10px}</style>
<script>addEventListener('load',()=>{const h=document.querySelector('h1'),t=document.querySelector('.th'),s=document.querySelector('.sub'),l=document.querySelector('.line')
for(let k=1;k>=.5;k-=.04){h.style.fontSize=104*k+'px';t.style.fontSize=Math.max(28,40*k)+'px';s.style.fontSize=Math.max(22,28*k)+'px'
if(s.getBoundingClientRect().bottom<=l.getBoundingClientRect().top-18&&h.scrollWidth<=h.clientWidth)break}})</script>`
const svcPage = (c) => page(c.n.en, c.n.th || '', c.l.en, pic(c), HUE[c.cat] ?? 32, LOOKS.doors[c.cat] || 'hongsa', c.cat) + FIT
const ui = SHOP.ui
const only = process.argv.slice(2)
if (!only.length) {
  await shoot('front', page('hongdam', 'หงส์ดำ · เราทำให้', ui.en.tagline, LOOKS.master.map((m) => m.db), 32, 'hongsa', 'front'))
  for (const cat of SHOP.cats) {
    const first = SHOP.cards.find((c) => c.cat === cat.id)
    await shoot(cat.id, page(cat.n.en, cat.n.th, cat.l.en, first ? pic(first) : LOOKS.master.map((m) => m.db), HUE[cat.id] ?? 32, LOOKS.doors[cat.id] || 'hongsa', cat.id))
  }
  console.log(1 + SHOP.cats.length, 'cards in docs/og/shop/')
}
const SVC = path.join(DOCS, 'og/svc'), svcs = SHOP.cards.filter((c) => ['buy', 'ask'].includes(c.act) && (!only.length || only.includes(c.id)))
fs.mkdirSync(SVC, { recursive: true })
for (const c of svcs) await shoot(c.id, svcPage(c), SVC)
console.log(svcs.length, 'cards in docs/og/svc/')
fs.unlinkSync(path.join(OUT, '_card.html'))
await browser.close()

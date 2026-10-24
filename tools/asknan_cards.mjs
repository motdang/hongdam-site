#!/usr/bin/env node
// Link-preview pictures (1200 × 630) for Ask Nan, in the shop's card look (tools/share_cards.mjs): the list and each
// column. tools/build_asknan.py writes the list (data/asknan/cards.json); a picture is drawn again only when its words
// change (the hash beside it in data/asknan/cards.done.json) or its file is missing. --all draws every one.
//   node tools/asknan_cards.mjs [--all]
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
const DOCS = path.join(ROOT, 'docs')
const DBM = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/dingbats.json'), 'utf8'))
const GROUP = DBM.groups['p-asknan'] ? 'p-asknan' : 'front'
const LIST = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/asknan/cards.json'), 'utf8'))
const DONE_F = path.join(ROOT, 'data/asknan/cards.done.json')
const done = fs.existsSync(DONE_F) ? JSON.parse(fs.readFileSync(DONE_F, 'utf8')) : {}
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const db = (g) => `<doodle-dingbat name="${esc(g)}" play="still"></doodle-dingbat>`

const page = (c) => {
  const n = c.title.length
  const size = n > 62 ? 50 : n > 46 ? 58 : n > 30 ? 68 : n > 16 ? 84 : 104
  return `<!doctype html><meta charset="utf-8">
<style>
*{box-sizing:border-box} body{margin:0;width:1200px;height:630px;background:#F1EDE4;color:#121212;font-family:Futura,"Futura PT",Jost,"Avenir Next","Noto Sans Thai",Thonburi,sans-serif;--db-look:riso}
.f{position:absolute;inset:34px;border:4px solid #121212;box-shadow:12px 12px 0 #121212;background:#FFFDF8;padding:40px 54px}
.k{margin:0 0 18px;font:700 22px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:#4A4640}
h1{margin:0;font-size:${size}px;line-height:1.02;letter-spacing:-.03em;max-width:${n > 30 ? 860 : 760}px;font-weight:700}
.th{margin:14px 0 0;font:600 30px/1.3 Thonburi,"Noto Sans Thai",sans-serif;color:#4A4640;max-width:860px}
.sub{margin:10px 0 0;font-size:26px;color:#4A4640;max-width:820px}
.mark{position:absolute;right:52px;top:34px;font-size:120px;line-height:0}
.line{position:absolute;left:54px;right:420px;bottom:54px;height:100px;display:flex;justify-content:space-between;align-items:flex-start;--l:oklch(.6 .17 ${c.hue})}
.line:before{content:"";position:absolute;left:30px;right:30px;bottom:14px;height:8px;background:var(--l);border-radius:8px}
.st{position:relative;font-size:60px;line-height:0;display:flex;flex-direction:column;align-items:center}
.st i{position:absolute;bottom:-40px;width:24px;height:24px;border-radius:50%;background:var(--l);box-shadow:0 0 0 4px #FFFDF8}
.url{position:absolute;right:58px;bottom:44px;font:700 26px/1 Futura,sans-serif;letter-spacing:.04em}
.url b{color:#B23A22}
</style>
<div class="f"><p class="k">${esc(c.kicker)}</p><h1>${esc(c.title)}</h1>
${c.th ? `<p class="th">${esc(c.th)}</p>` : ''}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}
<span class="mark">${db('hongsa')}</span>
<div class="line">${c.line.map((g) => `<span class="st">${db(g)}<i></i></span>`).join('')}</div>
<span class="url">hongdam.net/<b>ask-nan</b></span></div>
<script src="${url.pathToFileURL(path.join(DOCS, 'assets/db', DBM.core.split('?')[0])).href}"></script>
<script src="${url.pathToFileURL(path.join(DOCS, 'assets/db', DBM.groups[GROUP].split('?')[0])).href}"></script>`
}

const all = process.argv.includes('--all')
const todo = LIST.filter((c) => all || done[c.out] !== c.hash || !fs.existsSync(path.join(DOCS, c.out + '.jpg')))
if (!todo.length) { console.log('ask nan cards: nothing to draw'); process.exit(0) }
const browser = await chromium.launch({ executablePath: chromeExe() })
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const tmp = path.join(DOCS, 'og', '_asknan_card.html')
fs.mkdirSync(path.dirname(tmp), { recursive: true })
for (const c of todo) {
  fs.writeFileSync(tmp, page(c))
  await tab.goto(url.pathToFileURL(tmp).href, { waitUntil: 'load' })
  await tab.waitForTimeout(700)
  const out = path.join(DOCS, c.out + '.jpg')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  await tab.screenshot({ path: out, type: 'jpeg', quality: 86 })
  done[c.out] = c.hash
}
fs.unlinkSync(tmp)
await browser.close()
// pictures of columns no longer listed go with them
const keep = new Set(LIST.map((c) => c.out))
for (const k of Object.keys(done)) if (!keep.has(k)) { fs.rmSync(path.join(DOCS, k + '.jpg'), { force: true }); delete done[k] }
fs.writeFileSync(DONE_F, JSON.stringify(done, null, 1) + '\n')
console.log('ask nan cards:', todo.length, 'drawn')

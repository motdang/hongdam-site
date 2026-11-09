#!/usr/bin/env node
// Link-preview pictures (1200 × 630) for Hongdam Studio, in the black room's look: the Studio page, the notes list and
// each note. tools/build_studio.py writes the list (data/studio/cards.json); a picture is drawn again only when its
// words change (the hash beside it in data/studio/cards.done.json) or its file is missing. --all draws every one.
//   node tools/studio_cards.mjs [--all]
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
const ALL = path.resolve(ROOT, '../../doodle-dingbats/dingbats.min.js')
const LIST = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/studio/cards.json'), 'utf8'))
const DONE_F = path.join(ROOT, 'data/studio/cards.done.json')
const done = fs.existsSync(DONE_F) ? JSON.parse(fs.readFileSync(DONE_F, 'utf8')) : {}
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const db = (g, play = 'still') => `<doodle-dingbat name="${esc(g)}" play="${play}"></doodle-dingbat>`

const page = (c) => {
  const n = c.title.length
  const size = n > 64 ? 54 : n > 44 ? 64 : n > 26 ? 78 : n > 16 ? 104 : 132
  return `<!doctype html><meta charset="utf-8">
<style>
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0E0E10;color:#F3F2EE;--db-look:ink;
  font-family:system-ui,-apple-system,"Helvetica Neue","Noto Sans Thai",Thonburi,sans-serif;
  background-image:linear-gradient(rgba(243,242,238,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(243,242,238,.07) 1px,transparent 1px);
  background-size:48px 48px;background-position:-1px -1px}
.k{position:absolute;left:64px;top:58px;display:flex;align-items:center;gap:14px;font:600 22px/1 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;color:#ADACB3}
.k:before{content:"";width:14px;height:14px;border-radius:50%;background:#FF5A3C;box-shadow:0 0 0 6px rgba(255,90,60,.2)}
h1{position:absolute;left:64px;top:118px;margin:0;max-width:870px;font-size:${size}px;line-height:1.02;font-weight:760;letter-spacing:-.045em}
.th{position:absolute;left:64px;bottom:200px;margin:0;max-width:900px;font:600 30px/1.35 Thonburi,"Noto Sans Thai",sans-serif;color:#ADACB3}
.sub{position:absolute;left:64px;bottom:150px;margin:0;max-width:900px;font-size:26px;color:#D7D6D2}
.swan{position:absolute;right:58px;top:44px;font-size:150px;line-height:0}
.line{position:absolute;left:64px;bottom:58px;width:520px;height:66px;display:flex;justify-content:space-between;align-items:flex-start;--l:oklch(.76 .15 ${c.hue})}
.line:before{content:"";position:absolute;left:22px;right:22px;bottom:4px;height:6px;border-radius:6px;background:var(--l)}
.st{position:relative;font-size:46px;line-height:0;display:flex;flex-direction:column;align-items:center}
.st i{position:absolute;bottom:-30px;width:18px;height:18px;border-radius:50%;background:var(--l);box-shadow:0 0 0 4px #0E0E10}
.url{position:absolute;right:64px;bottom:58px;font:700 24px/1 ui-monospace,Menlo,monospace;letter-spacing:.06em;color:#F3F2EE}
.url b{color:#FF7A60;font-weight:700}
</style>
<p class="k">${esc(c.kicker)}</p><h1>${esc(c.title)}</h1>
${c.th ? `<p class="th">${esc(c.th)}</p>` : ''}${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}
<span class="swan">${db('hongsa')}</span>
<div class="line">${c.line.map((g) => `<span class="st">${db(g)}<i></i></span>`).join('')}</div>
<span class="url">hongdam.net/<b>studio</b></span>
<script src="${url.pathToFileURL(ALL).href}"></script>`
}

const all = process.argv.includes('--all')
const todo = LIST.filter((c) => all || done[c.out] !== c.hash || !fs.existsSync(path.join(DOCS, c.out + '.jpg')))
if (!todo.length) { console.log('studio cards: nothing to draw'); process.exit(0) }
const browser = await chromium.launch({ executablePath: chromeExe() })
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const tmp = path.join(DOCS, 'og', '_studio_card.html')
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
// pictures of notes no longer listed go with them
const keep = new Set(LIST.map((c) => c.out))
for (const k of Object.keys(done)) if (!keep.has(k)) { fs.rmSync(path.join(DOCS, k + '.jpg'), { force: true }); delete done[k] }
fs.writeFileSync(DONE_F, JSON.stringify(done, null, 1) + '\n')
console.log('studio cards:', todo.length, 'drawn')

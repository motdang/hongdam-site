#!/usr/bin/env node
// Link-preview pictures (1200 × 630) for the board retreat page (tools/build_retreat.py):
//   docs/og/retreat-<lang>.jpg   the hero photo, the heading, the pilot line, the swan and five ducklings
//   node tools/retreat_card.mjs
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const LOCAL_PW = path.join(process.env.HOME || '', 'Developer/claude code projects/anidoodle-motdang/node_modules/playwright-core/index.mjs')
const { chromium } = await import(process.env.PLAYWRIGHT_CORE || 'playwright-core').catch(() => import(url.pathToFileURL(LOCAL_PW).href))
function chromeExe () {
  if (process.env.CHROME) return process.env.CHROME
  const cache = path.join(process.env.HOME || '', 'Library/Caches/ms-playwright')
  const shell = fs.existsSync(cache) && fs.readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop()
  return shell ? path.join(cache, shell, 'chrome-headless-shell-mac-arm64/chrome-headless-shell') : undefined
}

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const DOCS = path.join(ROOT, 'docs')
const ALL = process.env.DINGBATS_ALL || path.resolve(ROOT, '../../doodle-dingbats/dingbats.min.js')
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/retreat.json'), 'utf8'))
const HERO = path.join(DOCS, D.path, 'img', D.hero.img + '.webp')
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const card = (lang) => {
  const u = D.ui[lang], th = lang === 'th'
  const ducks = Array.from({ length: 5 }, () => '<doodle-dingbat name="duckling-float" play="still"></doodle-dingbat>').join('')
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;overflow:hidden;color:#fff;--db-c:#fff;--db-look:ink;
  font-family:Futura,"Futura PT","Avenir Next",system-ui,"Noto Sans Thai",Thonburi,sans-serif;
  background:#111 url("${url.pathToFileURL(HERO).href}") center/cover}
.s{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,18,.92) 0%,rgba(8,10,18,.75) 48%,rgba(8,10,18,.15) 100%)}
.k{position:absolute;left:64px;top:58px;margin:0;font:700 22px/1 Futura,system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase}
.th .k{letter-spacing:0;font-family:system-ui,"Noto Sans Thai",Thonburi,sans-serif;font-size:26px}
h1{position:absolute;left:64px;top:110px;margin:0;width:760px;font-size:${th ? 74 : 92}px;line-height:1.04;font-weight:700;letter-spacing:${th ? '0' : '-.035em'}}
.th h1{font-family:system-ui,"Noto Sans Thai",Thonburi,sans-serif;line-height:1.25}
h1 b{display:block;color:#F2C14E}
.p{position:absolute;left:64px;bottom:130px;display:flex;align-items:center;gap:14px;margin:0;padding:12px 22px;border:3px solid #fff;border-radius:999px;font:700 28px/1 Futura,system-ui,"Noto Sans Thai",sans-serif;background:rgba(8,10,18,.6)}
.p:before{content:"";width:16px;height:16px;border-radius:50%;background:#06C755;box-shadow:0 0 0 7px rgba(6,199,85,.3)}
.pond{position:absolute;left:64px;bottom:44px;display:flex;align-items:flex-end;gap:6px;line-height:0}
.pond .sw{font-size:76px}.pond .d{font-size:40px;display:flex;gap:4px}
.url{position:absolute;right:56px;bottom:52px;font:700 28px/1 Futura,system-ui,sans-serif;letter-spacing:.02em}
.url b{color:#F2C14E}
</style>
<div class="s"></div><div class="${th ? 'th' : ''}"><p class="k">${esc(u.kicker)}</p>
<h1>${esc(u.h1a)}<b>${esc(u.h1b)}</b></h1>
<p class="p">${esc(u.pilot)}</p></div>
<div class="pond"><span class="sw"><doodle-dingbat name="hongsa-float" play="still"></doodle-dingbat></span><span class="d">${ducks}</span></div>
<span class="url">hongdam.net/${lang === 'en' ? '' : lang + '/'}<b>retreat</b></span>
<script src="${url.pathToFileURL(ALL).href}"></script>`
}

if (!fs.existsSync(HERO)) { console.error('retreat_card: no hero photo at ' + HERO); process.exit(1) }
const browser = await chromium.launch({ executablePath: chromeExe() })
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const tmp = path.join(DOCS, 'og', '_retreat_card.html')
try {
  for (const lang of D.langs) {
    fs.writeFileSync(tmp, card(lang))
    await tab.goto(url.pathToFileURL(tmp).href, { waitUntil: 'load' })
    await tab.waitForTimeout(900)
    await tab.screenshot({ path: path.join(DOCS, 'og', `retreat-${lang}.jpg`), type: 'jpeg', quality: 86 })
  }
} finally {
  fs.rmSync(tmp, { force: true })
  await browser.close()
}
console.log('retreat cards:', D.langs.length, 'drawn')

#!/usr/bin/env node
// Link-preview pictures (1200 × 630) for DJ, meet the company (tools/build_dj.py), in the Studio's black room:
//   docs/og/studio/dj-<lang>.jpg   the heading, then the four names, each with its picture
//   node tools/dj_card.mjs
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
const ALL = process.env.DINGBATS_ALL || path.resolve(ROOT, '../../doodle-dingbats/dingbats.min.js')
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/studio/dj.json'), 'utf8'))
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const tr = (d, l) => (d && (d[l] || d.en)) || ''

const card = (lang) => {
  const u = D.ui[lang]
  const names = D.names.map((n) => `<div class="n" style="--c:oklch(.72 .15 ${n.hue})"><span class="g${n.glyph === 'ants' ? ' wide' : ''}"><doodle-dingbat name="${n.glyph}" play="still"></doodle-dingbat></span>`
    + `<b>${esc(tr(n.n, lang))}</b><i>${esc(tr(n.v, lang))}</i></div>`).join('')
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0E0E10;color:#F3F2EE;--db-look:ink;
  font-family:system-ui,-apple-system,"Helvetica Neue","Noto Sans Thai",Thonburi,sans-serif;
  background-image:linear-gradient(rgba(243,242,238,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(243,242,238,.07) 1px,transparent 1px);
  background-size:48px 48px;background-position:-1px -1px}
.k{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:14px;margin:0;font:600 22px/1 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;color:#ADACB3}
.k:before{content:"";width:14px;height:14px;border-radius:50%;background:#FF5A3C;box-shadow:0 0 0 6px rgba(255,90,60,.2)}
h1{position:absolute;left:64px;top:104px;margin:0;width:900px;font-size:${lang === 'th' ? 76 : 92}px;line-height:1.05;font-weight:780;letter-spacing:${lang === 'th' ? '0' : '-.045em'}}
.swan{position:absolute;right:60px;top:40px;font-size:120px;line-height:0}
.row{position:absolute;left:64px;right:64px;bottom:96px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.n{min-height:190px;padding:20px 20px 18px;border-top:6px solid var(--c);border-radius:8px;background:#17171B;display:flex;flex-direction:column}
.g{font-size:72px;line-height:0;color:var(--c);--db-c:var(--c);height:80px}
.g.wide doodle-dingbat{width:5em;font-size:44px;margin-top:22px}
.n b{margin-top:auto;font-size:${lang === 'th' ? 28 : 26}px;line-height:1.15;font-weight:760}
.n i{margin-top:8px;font:700 17px/1.2 ui-monospace,Menlo,monospace;font-style:normal;letter-spacing:.16em;text-transform:uppercase;color:#ADACB3}
.th .n i,.th .k{font-family:system-ui,"Noto Sans Thai",Thonburi,sans-serif;letter-spacing:0;font-size:20px}
.url{position:absolute;left:64px;bottom:42px;font:700 24px/1 ui-monospace,Menlo,monospace;letter-spacing:.04em}
.url b{color:#FF7A60;font-weight:700}
</style>
<div class="${lang === 'th' ? 'th' : ''}"><p class="k">${esc(u.kicker)}</p><h1>${esc(u.card.title)}</h1>
<span class="swan"><doodle-dingbat name="hongsa" play="still"></doodle-dingbat></span>
<div class="row">${names}</div>
</div><span class="url">hongdam.net/${lang === 'en' ? '' : lang + '/'}<b>studio/dj</b></span>
<script src="${url.pathToFileURL(ALL).href}"></script>`
}

const browser = await chromium.launch({ executablePath: chromeExe() })
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const tmp = path.join(DOCS, 'og', '_dj_card.html')
try {
  for (const lang of D.langs) {
    fs.writeFileSync(tmp, card(lang))
    await tab.goto(url.pathToFileURL(tmp).href, { waitUntil: 'load' })
    await tab.waitForTimeout(800)
    const file = path.join(DOCS, 'og', 'studio', `dj-${lang}.jpg`)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    await tab.screenshot({ path: file, type: 'jpeg', quality: 86 })
  }
} finally {
  fs.rmSync(tmp, { force: true })
  await browser.close()
}
console.log('dj cards:', D.langs.length, 'drawn')

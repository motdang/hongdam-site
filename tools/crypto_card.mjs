#!/usr/bin/env node
// Link-preview pictures (1200 × 630) for Crypto safety: plan for worse (tools/build_crypto.py), in the Studio's black room:
//   docs/og/studio/crypto-<lang>.jpg   the heading, the line under it, then the eight steps, each redder than the last
//   node tools/crypto_card.mjs        (DINGBATS_ALL=<doodle-dingbats>/dingbats.min.js from a clone outside the projects folder)
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
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/studio/crypto.json'), 'utf8'))
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const tr = (d, l) => (d && (d[l] || d.en)) || ''
const BIG = { th: 64, my: 54, zh: 74, de: 70, en: 82 }

const card = (lang) => {
  const u = D.ui[lang]
  const steps = D.rungs.map((r, i) => `<div class="s" style="--p:${(i + 1) * 12.5}%"><b>${i + 1}</b><i>${esc(tr(r.n, lang))}</i></div>`).join('')
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0E0E10;color:#F3F2EE;--db-look:ink;
  font-family:system-ui,-apple-system,"Helvetica Neue","Noto Sans Thai",Thonburi,"Noto Sans Myanmar","Myanmar Text","PingFang SC",sans-serif;
  background-image:linear-gradient(rgba(243,242,238,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(243,242,238,.07) 1px,transparent 1px);
  background-size:48px 48px;background-position:-1px -1px}
.k{position:absolute;left:64px;top:52px;display:flex;align-items:center;gap:14px;margin:0;font:600 22px/1 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;color:#ADACB3}
.k:before{content:"";width:14px;height:14px;border-radius:50%;background:#FF5A3C;box-shadow:0 0 0 6px rgba(255,90,60,.2)}
h1{position:absolute;left:64px;top:96px;margin:0;width:930px;font-size:${BIG[lang] || 80}px;line-height:1.08;font-weight:780;letter-spacing:${lang === 'en' || lang === 'de' ? '-.04em' : '0'}}
p.sub{position:absolute;left:64px;top:${lang === 'en' || lang === 'zh' ? 300 : 330}px;margin:0;width:900px;font-size:30px;line-height:1.3;color:#D6D5D0}
.swan{position:absolute;right:60px;top:36px;font-size:120px;line-height:0}
.row{position:absolute;left:64px;right:64px;bottom:84px;display:grid;grid-template-columns:repeat(8,1fr);gap:12px}
.s{height:132px;padding:12px 12px 10px;border-radius:8px;background:#17171B;border-top:8px solid color-mix(in oklch,#FF5A3C var(--p),#3A3A40);display:flex;flex-direction:column}
.s b{font-size:36px;line-height:1;font-weight:800}
.s i{margin-top:auto;font-style:normal;font-size:${lang === 'en' ? 15 : 16}px;line-height:1.2;color:#CFCED4;overflow:hidden;max-height:3.8em}
.url{position:absolute;left:64px;bottom:40px;font:700 24px/1 ui-monospace,Menlo,monospace;letter-spacing:.04em}
.url b{color:#FF7A60;font-weight:700}
.th .k,.my .k,.zh .k{font-family:inherit;letter-spacing:0;font-size:22px}
</style>
<div class="${lang}"><p class="k">${esc(u.kicker)}</p><h1>${esc(u.card.title)}</h1><p class="sub">${esc(u.card.sub)}</p>
<span class="swan"><doodle-dingbat name="hongsa" play="still"></doodle-dingbat></span>
<div class="row">${steps}</div>
</div><span class="url">hongdam.net/${lang === 'en' ? '' : lang + '/'}<b>studio/crypto-safety</b></span>
<script src="${url.pathToFileURL(ALL).href}"></script>`
}

const browser = await chromium.launch({ executablePath: chromeExe() })
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const tmp = path.join(DOCS, 'og', '_crypto_card.html')
try {
  for (const lang of D.langs) {
    fs.writeFileSync(tmp, card(lang))
    await tab.goto(url.pathToFileURL(tmp).href, { waitUntil: 'load' })
    await tab.waitForTimeout(800)
    const file = path.join(DOCS, 'og', 'studio', `crypto-${lang}.jpg`)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    await tab.screenshot({ path: file, type: 'jpeg', quality: 86 })
  }
} finally {
  fs.rmSync(tmp, { force: true })
  await browser.close()
}
console.log('crypto cards:', D.langs.length, 'drawn')

#!/usr/bin/env node
// Link-preview pictures (1200 × 630) for Black Swan Event? (tools/build_blackswan.py), in the Studio's black room:
//   docs/og/studio/black-swan-<lang>.jpg   the page, in each of its five languages, with her photo of the bronze hongsa
//   docs/og/swan/o0.jpg … o4.jpg           one prediction (hongdam.net/swan/<id>), by its odds: 1 in 2 … 1 in 10,000,
//                                          the swan whiter or blacker; the prediction's own words are the preview's title
//   node tools/blackswan_cards.mjs
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
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/blackswan.json'), 'utf8'))
const PHOTO = url.pathToFileURL(path.join(DOCS, D.photo.src.slice(1) + '-900.jpg')).href
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const num = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const FRAME = `*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0E0E10;color:#F3F2EE;--db-look:ink;
  font-family:system-ui,-apple-system,"Helvetica Neue","Noto Sans Thai",Thonburi,"Noto Sans Myanmar","Myanmar Text","PingFang SC",sans-serif;
  background-image:linear-gradient(rgba(243,242,238,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(243,242,238,.07) 1px,transparent 1px);
  background-size:48px 48px;background-position:-1px -1px}
.k{position:absolute;left:64px;top:58px;display:flex;align-items:center;gap:14px;font:600 22px/1 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;color:#ADACB3}
.k:before{content:"";width:14px;height:14px;border-radius:50%;background:#FF5A3C;box-shadow:0 0 0 6px rgba(255,90,60,.2)}
.url{position:absolute;left:64px;bottom:54px;font:700 26px/1 ui-monospace,Menlo,monospace;letter-spacing:.04em}
.url b{color:#FF7A60;font-weight:700}`

const pageCard = (lang) => {
  const u = D.ui[lang], big = u.h1.length > 14 ? 76 : 96
  return `<!doctype html><meta charset="utf-8"><style>${FRAME}
h1{position:absolute;left:64px;top:116px;margin:0;width:560px;font-size:${big}px;line-height:1.02;font-weight:780;letter-spacing:${lang === 'en' || lang === 'de' ? '-.045em' : '0'}}
.sub{position:absolute;left:64px;top:${116 + big * 2.2}px;margin:0;width:560px;font-size:36px;line-height:1.2;font-weight:650;color:#FF7A60}
.toys{position:absolute;left:64px;bottom:118px;display:flex;gap:26px;font-size:54px;line-height:0}
.ph{position:absolute;right:56px;top:54px;width:460px;height:522px;border-radius:14px;overflow:hidden;background:url(${PHOTO}) 56% 62%/auto 104% no-repeat;box-shadow:0 30px 60px -30px #000}
.cr{position:absolute;right:68px;bottom:64px;font:600 17px/1 system-ui;color:#F3F2EE;background:rgba(14,14,16,.7);padding:6px 10px;border-radius:6px}
</style>
<p class="k">Hongdam Studio</p><h1>${esc(u.h1).replace('หงส์ดำ', '<span style="white-space:nowrap">หงส์ดำ</span>')}</h1><p class="sub">${esc(u.sub)}</p>
<div class="toys"><doodle-dingbat name="hongsa" play="still"></doodle-dingbat><doodle-dingbat name="dice" play="still"></doodle-dingbat><doodle-dingbat name="galton" play="still"></doodle-dingbat><doodle-dingbat name="earth" play="still"></doodle-dingbat></div>
<div class="ph"></div><span class="cr">Photo: ${esc(D.photo.by)} · CC BY 4.0</span>
<span class="url">hongdam.net/<b>studio/black-swan</b></span>
<script src="${url.pathToFileURL(ALL).href}"></script>`
}

const oddsCard = (k) => {
  const white = 1 - k / 4
  return `<!doctype html><meta charset="utf-8"><style>${FRAME}
.q{position:absolute;left:64px;top:120px;margin:0;font:800 64px/1.1 system-ui;letter-spacing:-.03em;color:#D7D6D2}
.o{position:absolute;left:58px;top:190px;margin:0;font:820 ${k >= 3 ? 124 : 170}px/1 system-ui;letter-spacing:-.05em;color:#FF7A60}
.t{position:absolute;left:64px;top:420px;margin:0;font:650 34px/1.2 system-ui;color:#ADACB3}
.sw{position:absolute;right:90px;top:150px;width:340px;height:300px;font-size:250px;line-height:0}
.sw span{position:absolute;inset:0}
.sw .w{opacity:${white.toFixed(2)};z-index:2} .sw .w doodle-dingbat{color:#F3F2EE;filter:invert(1) hue-rotate(180deg)}
.water{position:absolute;right:40px;top:430px;width:440px;height:16px;border-radius:16px;background:#17323F}
</style>
<p class="k">Black Swan Event? · หงส์ดำ</p><p class="o">1 in ${num(D.odds[k])}</p>
<p class="t">Hongdam Studio is all ears · ตั้งใจฟัง</p>
<div class="water"></div><div class="sw"><span class="b"><doodle-dingbat name="hongsa" play="still"></doodle-dingbat></span><span class="w"><doodle-dingbat name="hongsa" play="still"></doodle-dingbat></span></div>
<span class="url">hongdam.net/<b>swan</b></span>
<script src="${url.pathToFileURL(ALL).href}"></script>`
}

const jobs = [...D.langs.map((l) => [`og/studio/black-swan-${l}`, pageCard(l)]), ...D.odds.map((_, k) => [`og/swan/o${k}`, oddsCard(k)])]
const browser = await chromium.launch({ executablePath: chromeExe() })
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const tmp = path.join(DOCS, 'og', '_bs_card.html')
try {
  for (const [out, html] of jobs) {
    fs.writeFileSync(tmp, html)
    await tab.goto(url.pathToFileURL(tmp).href, { waitUntil: 'load' })
    await tab.waitForTimeout(800)
    const file = path.join(DOCS, out + '.jpg')
    fs.mkdirSync(path.dirname(file), { recursive: true })
    await tab.screenshot({ path: file, type: 'jpeg', quality: 86 })
  }
} finally {   // the browser closes even when a card fails (CodeRabbit on #117)
  fs.rmSync(tmp, { force: true })
  await browser.close()
}
console.log('black swan cards:', jobs.length, 'drawn')

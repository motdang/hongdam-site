#!/usr/bin/env node
// Link-preview pictures (1200 × 630) for the pages tools/share_cards.mjs does not draw: Buy, Ask, the missing
// page, the stats page and invoices in the Isotype look of the shop; and two client pages in their own look, by
// ../../share-cards/render.mjs with the page's own photograph. Run after tools/build_shop.py.
//   node tools/share_cards_pages.mjs
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
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const DOCS = path.join(ROOT, 'docs')
const ALL = path.resolve(ROOT, '../../doodle-dingbats/dingbats.min.js')   // every glyph; only the card renderer loads it
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const db = (g) => `<doodle-dingbat name="${esc(g)}" play="still"></doodle-dingbat>`
const line = (stops, hue) => `<div class="line" style="--l:oklch(.6 .17 ${hue})">${stops.map((g) => `<span class="st">${db(g)}<i></i></span>`).join('')}<span class="sw">${db('hongsa-stand')}</span></div>`

// the same card as tools/share_cards.mjs draws for the front page and the categories
const page = (big, small, sub, stops, hue, mark) => `<!doctype html><meta charset="utf-8">
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
<script src="file://${ALL}"></script>`

const CARDS = [
  ['og/shop/buy', 'buy', 'ซื้อ · 购买', 'Pick it, pay, we start. PromptPay, PayPal or Wise.', ['send', 'coin', 'gears', 'done'], 145, 'cart'],
  ['og/shop/ask', 'write to us', 'เขียนถึงเรา · 给我们留言', 'Something not on the list? Write what you need.', ['chat', 'envelope', 'paper-boat'], 250, 'mailbox'],
  ['og/404', 'not found', 'ไม่พบหน้านี้', 'No page at this address. The shop is one tap away.', ['footsteps', 'compass', 'search', 'home'], 60, 'hongsa'],
  ['og/stats', 'stats', 'ตัวเลข', 'What people did on hongdam.net.', ['abacus', 'eye', 'check'], 300, 'abacus'],
  ['og/invoice', 'invoice', 'ใบแจ้งหนี้', 'Hongdam · Chiang Rai, Thailand', ['page', 'coin', 'done'], 32, 'coin'],
]

const EXE = chromeExe()
const browser = await chromium.launch({ executablePath: EXE })
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const tmp = path.join(DOCS, 'og', '_card.html')
for (const [out, ...a] of CARDS) {
  fs.writeFileSync(tmp, page(...a))
  await tab.goto(url.pathToFileURL(tmp).href, { waitUntil: 'load' })
  await tab.waitForTimeout(600)
  fs.mkdirSync(path.dirname(path.join(DOCS, out)), { recursive: true })
  await tab.screenshot({ path: path.join(DOCS, out + '.jpg'), type: 'jpeg', quality: 86 })
}
fs.unlinkSync(tmp)
await browser.close()

// Two client pages that borrowed their parent page's card, now each with its own, in that page's look.
const KIT = path.resolve(ROOT, '../../share-cards')
const jobs = [
  { out: path.join(DOCS, 'for/cca/give/og.jpg'), title: 'Giving desk', sub: 'Gifts from anywhere · รับเงินบริจาคจากทุกที่', kicker: 'Cultural Crossroads Asia',
    url: 'hongdam.net/for/cca/give/', image: path.join(DOCS, 'for/cca/img/weaver.jpg'), accent: '#1d2b8f' },
  { out: path.join(DOCS, 'for/eveline/demo/og.jpg'), title: '34 schools, one province', sub: 'The page to edit · FERC, Chiang Mai', kicker: 'For Eveline Willi',
    url: 'hongdam.net/for/eveline/demo/', image: path.join(DOCS, 'for/eveline/img/school.jpg'), focus: '50% 40%' },
]
const jf = path.join(DOCS, 'og', '_jobs.json')
fs.writeFileSync(jf, JSON.stringify(jobs))
execFileSync('node', [path.join(KIT, 'render.mjs'), jf], { stdio: 'inherit', cwd: KIT, env: { ...process.env, CHROME: EXE } })
fs.unlinkSync(jf)
console.log(CARDS.length + jobs.length, 'cards')

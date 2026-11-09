#!/usr/bin/env node
// Phone sheets of Studio pages: each page at 390 px wide, light and dark, whole length, side by side in one picture.
//   node tools/studio_sheet.mjs <base url> <out.png> <path> [<path> ...]
//   node tools/studio_sheet.mjs http://127.0.0.1:9041 /tmp/sheet.png studio/ th/studio/ studio/notes/
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

const [base, out, ...paths] = process.argv.slice(2)
if (!base || !out || !paths.length) { console.error('usage: studio_sheet.mjs <base url> <out.png> <path>...'); process.exit(2) }
const W = Number(process.env.SHEET_W || 390), MAXH = Number(process.env.SHEET_MAXH || 5200)
const browser = await chromium.launch({ executablePath: chromeExe() })
const shots = []
for (const p of paths) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: W, height: 844 }, deviceScaleFactor: 1, colorScheme: scheme, reducedMotion: 'reduce' })
    const tab = await ctx.newPage()
    const errs = []
    tab.on('pageerror', (e) => errs.push(String(e)))
    await tab.goto(base.replace(/\/$/, '') + '/' + p, { waitUntil: 'networkidle' }).catch(() => {})
    await tab.waitForTimeout(900)
    const wide = await tab.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
    const h = Math.min(MAXH, await tab.evaluate(() => document.documentElement.scrollHeight))
    await tab.setViewportSize({ width: W, height: h })
    await tab.waitForTimeout(400)
    const buf = await tab.screenshot({ type: 'png' })
    shots.push({ p, scheme, buf, h, wide, errs })
    await ctx.close()
  }
}
const sheet = await browser.newPage({ viewport: { width: 400, height: 400 } })
const cells = shots.map((s) => `<figure><figcaption>${s.p} · ${s.scheme}${s.wide ? ' · WIDE' : ''}${s.errs.length ? ' · JS ERROR' : ''}</figcaption><img src="data:image/png;base64,${s.buf.toString('base64')}"></figure>`).join('')
await sheet.setContent(`<style>body{margin:0;display:flex;gap:16px;padding:16px;background:#777;font:600 14px system-ui;align-items:flex-start}figure{margin:0}figcaption{color:#fff;margin-bottom:6px}img{display:block;width:${W}px}</style>${cells}`)
await sheet.setViewportSize({ width: shots.length * (W + 16) + 16, height: Math.max(...shots.map((s) => s.h)) + 60 })
await sheet.waitForTimeout(300)
await sheet.screenshot({ path: out, fullPage: true })
await browser.close()
for (const s of shots) console.log(`${s.p} ${s.scheme}: ${s.h}px${s.wide ? ' — wider than the screen' : ''}${s.errs.length ? ' — ' + s.errs.join('; ') : ''}`)
console.log('sheet:', out)

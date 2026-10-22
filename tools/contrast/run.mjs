#!/usr/bin/env node
// Contrast gate for hongdam.net: every page under docs/, at phone and desktop
// width, light and dark, in each language the page offers (English, Thai),
// at the top and scrolled, and on each tab of a page with tabs. Any text below
// WCAG AA fails the run.
//
//   node tools/contrast/run.mjs                 all pages
//   node tools/contrast/run.mjs for/cca/land    pages whose path contains this
//   CHROME=/path/to/chrome node tools/contrast/run.mjs
//
// Needs Node 22+ (built-in WebSocket) and Chrome or Chromium. No npm install.
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync, readdirSync, mkdtempSync, rmSync } from 'node:fs'
import { join, extname, resolve, relative, sep } from 'node:path'
import { tmpdir } from 'node:os'

const ROOT = resolve(import.meta.dirname, '../..')
const DOCS = join(ROOT, 'docs')
const PAGE_JS = readFileSync(join(import.meta.dirname, 'page.js'), 'utf8')
const filter = process.argv[2] || ''

const SIZES = [
  { name: 'phone', width: 375, height: 812, deviceScaleFactor: 2, mobile: true },
  { name: 'desktop', width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
]
const SCHEMES = ['light', 'dark']
const LANGS = ['en', 'th']
const MAX_TABS = 8

function findChrome() {
  const c = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']
  const hit = c.find((p) => p && existsSync(p))
  if (!hit) { console.error('contrast: no Chrome found; set CHROME=/path/to/chrome'); process.exit(2) }
  return hit
}

function pages() {
  const out = []
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f)
      if (statSync(p).isDirectory()) walk(p)
      else if (f.endsWith('.html')) out.push('/' + relative(DOCS, p).split(sep).join('/'))
    }
  }
  walk(DOCS)
  // share-card templates and fragments are not pages people read
  return out.filter((p) => !/\/(card|og)[^/]*\.html$/.test(p) && p.includes(filter)).sort()
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain' }

// /api/... reads come from the live site so pages render the content people see.
// Only GET is passed through; a failed read is a scan error.
const LIVE = process.env.CONTRAST_LIVE || 'https://hongdam.net'
const apiErrors = []
const inFlight = new Set()
async function proxy(req, res) {
  if (req.method !== 'GET') { res.writeHead(405); return res.end() }
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(LIVE + req.url, { signal: AbortSignal.timeout(15000), headers: { accept: req.headers.accept || '*/*' } })
      const body = Buffer.from(await r.arrayBuffer())
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      res.writeHead(r.status, { 'content-type': r.headers.get('content-type') || 'application/json', 'access-control-allow-origin': '*' })
      return res.end(body)
    } catch (e) { if (i) { apiErrors.push(`${req.url}: ${e.message}`); res.writeHead(502); return res.end() } }
  }
}

function serve() {
  return new Promise((ok) => {
    const s = createServer((req, res) => {
      if (req.url.startsWith('/api/')) {
        const p = proxy(req, res).finally(() => inFlight.delete(tag))
        const tag = { url: req.url, p }
        inFlight.add(tag)
        return
      }
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
      let f = join(DOCS, p)
      if (!f.startsWith(DOCS)) { res.writeHead(403); return res.end() }
      if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html')
      if (!existsSync(f)) {
        res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('not found')
      }
      res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'access-control-allow-origin': '*' })
      res.end(readFileSync(f))
    })
    s.listen(0, '127.0.0.1', () => ok(s))
  })
}

async function launch() {
  const dir = mkdtempSync(join(tmpdir(), 'contrast-'))
  const ch = spawn(findChrome(), ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--hide-scrollbars', '--mute-audio',
    // GitHub's Ubuntu runners block Chrome's sandbox
    ...(process.env.CI ? ['--no-sandbox'] : []), 'about:blank'],
  { stdio: ['ignore', 'ignore', 'pipe'] })
  const ws = await new Promise((ok, no) => {
    let buf = ''
    const t = setTimeout(() => no(new Error('Chrome did not start')), 30000)
    ch.stderr.on('data', (d) => {
      buf += d
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/)
      if (m) { clearTimeout(t); ok(m[1]) }
    })
  })
  return { ch, ws, dir }
}

class CDP {
  constructor(url) { this.id = 0; this.wait = new Map(); this.ev = []; this.sock = new WebSocket(url) }
  open() {
    return new Promise((ok, no) => {
      this.sock.onopen = ok; this.sock.onerror = no
      this.sock.onmessage = (m) => {
        const d = JSON.parse(m.data)
        if (d.id && this.wait.has(d.id)) {
          const { ok: k, no: n } = this.wait.get(d.id); this.wait.delete(d.id)
          d.error ? n(new Error(d.error.message)) : k(d.result)
        } else if (d.method) this.ev.forEach((f) => f(d))
      }
    })
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id
    this.sock.send(JSON.stringify({ id, method, params, sessionId }))
    return new Promise((ok, no) => this.wait.set(id, { ok, no }))
  }
  once(method, sessionId, ms = 20000) {
    return new Promise((ok) => {
      const t = setTimeout(() => { this.ev = this.ev.filter((x) => x !== f); ok(null) }, ms)
      const f = (d) => { if (d.method === method && d.sessionId === sessionId) { clearTimeout(t); this.ev = this.ev.filter((x) => x !== f); ok(d) } }
      this.ev.push(f)
    })
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const list = pages()
  if (!list.length) { console.error(`contrast: no pages match "${filter}"`); process.exit(2) }
  const server = await serve()
  const base = `http://127.0.0.1:${server.address().port}`
  const { ch, ws, dir } = await launch()
  const cdp = new CDP(ws); await cdp.open()
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId: s } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
  const S = (m, p) => cdp.send(m, p, s)
  await S('Page.enable'); await S('Runtime.enable')
  const evalIn = async (expr) => {
    const r = await S('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }

  const fails = new Map(); let checked = 0, states = 0, errors = []
  for (const path of list) {
    for (const size of SIZES) {
      await S('Emulation.setDeviceMetricsOverride', size)
      await S('Emulation.setTouchEmulationEnabled', { enabled: size.mobile })
      for (const scheme of SCHEMES) {
        await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] })
        try {
          const loaded = cdp.once('Page.loadEventFired', s)
          const nav = await S('Page.navigate', { url: base + path })
          if (nav.errorText) throw new Error(`navigation failed: ${nav.errorText}`)
          if (!(await loaded)) throw new Error('page did not finish loading in 20 s')
          await sleep(400)
          await evalIn('try{localStorage.clear()}catch(e){};1')
          // scroll the length of the page once so fade-ins and counters run
          await evalIn(`(async function(){var h=document.documentElement.scrollHeight,v=innerHeight;for(var y=0;y<h;y+=v*0.6){window.scrollTo({top:y,behavior:'instant'});window.dispatchEvent(new Event('scroll'));await new Promise(r=>setTimeout(r,40))}await new Promise(r=>setTimeout(r,300));window.scrollTo({top:0,behavior:'instant'});return 1})()`)
          const langs = await evalIn(`(function(){var b=[...document.querySelectorAll('button[data-set],button[data-lang],a[data-set]')].map(x=>x.getAttribute('data-set')||x.getAttribute('data-lang'));return ${JSON.stringify(LANGS)}.filter(l=>b.includes(l))})()`)
          for (const lang of langs.length ? langs : ['page']) {
            if (lang !== 'page') await evalIn(`(function(){var b=document.querySelector('button[data-set="${lang}"],button[data-lang="${lang}"],a[data-set="${lang}"]');b&&b.click();return 1})()`)
            const tabs = await evalIn(`document.querySelectorAll('[role=tab]').length`)
            for (let ti = -1; ti < Math.min(tabs, MAX_TABS); ti++) {
              if (ti >= 0) await evalIn(`(function(){var t=document.querySelectorAll('[role=tab]')[${ti}];t&&t.click();return 1})()`)
              for (const y of [0, 700]) {
                await evalIn(`window.scrollTo({top:${y},behavior:'instant'});window.dispatchEvent(new Event('scroll'));1`)
                await sleep(60)
                const r = await evalIn(PAGE_JS)
                states++; checked += r.checked
                const state = `${size.name} ${scheme} ${lang}${ti >= 0 ? ' tab' + (ti + 1) : ''}${y ? ' scrolled' : ''}`
                for (const f of r.fails) {
                  const k = `${path} | ${f.where} | ${f.ratio}`
                  if (!fails.has(k)) fails.set(k, { path, ...f, states: [] })
                  fails.get(k).states.push(state)
                }
              }
            }
          }
        } catch (e) { errors.push(`${path} (${size.name} ${scheme}): ${e.message}`) }
      }
    }
  }
  await cdp.send('Browser.close').catch(() => {})
  const gone = new Promise((r) => ch.once('exit', r)); ch.kill(); await Promise.race([gone, sleep(3000)])
  server.close()
  try { rmSync(dir, { recursive: true, force: true, maxRetries: 3 }) } catch { /* Chrome's profile folder; the OS clears temp */ }

  // reads still in flight when the last state finished: wait up to 35 s, then count them
  if (inFlight.size) await Promise.race([Promise.allSettled([...inFlight].map((t) => t.p)), sleep(35000)])
  for (const t of inFlight) apiErrors.push(`${t.url}: no answer`)
  for (const a of new Set(apiErrors)) errors.push(`live API read failed: ${a}`)
  console.log(`contrast: ${list.length} page${list.length === 1 ? '' : 's'}, ${states} states, ${checked} text checks`)
  for (const e of errors) console.log(`  ERROR ${e}`)
  const byPage = {}
  for (const f of fails.values()) (byPage[f.path] ||= []).push(f)
  for (const [path, fs] of Object.entries(byPage)) {
    console.log(`\n✗ ${path}`)
    for (const f of fs) console.log(`  ${f.ratio} < ${f.need}${f.photo ? ' (over photo)' : ''}  ${f.where}  "${f.text}"  ${f.fg} on ${f.bg}${f.op < 1 ? ` at opacity ${f.op}` : ''}  [${f.states.length} state${f.states.length === 1 ? '' : 's'}, e.g. ${f.states[0]}]`)
  }
  if (fails.size || errors.length) { console.log(`\ncontrast: ✗ ${fails.size} failing text run${fails.size === 1 ? '' : 's'}${errors.length ? `, ${errors.length} error${errors.length === 1 ? '' : 's'}` : ''}`); process.exit(1) }
  console.log('contrast: ✓ every page passes WCAG AA')
}
main().catch((e) => { console.error('contrast:', e.message); process.exit(2) })

// keepOffBeacon: pages sent to machines or to our own looking carry no-transform (2026-11-02).
import assert from 'node:assert/strict'
import { keepOffBeacon } from '../functions/_middleware.js'

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
const HEADLESS = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36'
const FETCH = { 'sec-fetch-mode': 'navigate', 'sec-fetch-site': 'none', 'sec-fetch-dest': 'document' }
const page = () => new Response('<html><body>hi</body></html>', {
  headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate' },
})
const req = (h) => new Request('https://hongdam.net/', { headers: h })
const cc = (r) => r.headers.get('cache-control')

assert.equal(cc(keepOffBeacon(req({ 'user-agent': CHROME, ...FETCH }), page())), 'public, max-age=0, must-revalidate')
assert.equal(cc(keepOffBeacon(req({ 'user-agent': HEADLESS }), page())), 'public, max-age=0, must-revalidate, no-transform')
assert.equal(cc(keepOffBeacon(req({ 'user-agent': CHROME, ...FETCH, cookie: 'nb_ours=1' }), page())), 'public, max-age=0, must-revalidate, no-transform')
assert.equal(cc(keepOffBeacon(req({ 'user-agent': CHROME, ...FETCH, 'cf-worker': 'example.com' }), page())), 'public, max-age=0, must-revalidate, no-transform')
const twice = keepOffBeacon(req({ 'user-agent': HEADLESS }), keepOffBeacon(req({ 'user-agent': HEADLESS }), page()))
assert.equal(cc(twice), 'public, max-age=0, must-revalidate, no-transform')
assert.equal(await keepOffBeacon(req({ 'user-agent': HEADLESS }), page()).text(), '<html><body>hi</body></html>')
console.log('beacon ok')

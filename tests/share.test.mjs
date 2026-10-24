import { serviceCard } from '../functions/_middleware.js'
import { SHARE } from '../functions/_share_data.js'
import assert from 'node:assert'
import fs from 'node:fs'
const at = (u) => serviceCard(new URL(u, 'https://hongdam.net'))
// a service's Buy or Ask address, in any language, gets that service's card
const en = at('/buy/?c=retire&o=retire-month')
assert.match(en.title, /^Retiring in Thailand, handled · /)
assert.equal(en.meta['og:url'], 'https://hongdam.net/buy/?c=retire')
assert.equal(en.meta['og:image'], 'https://hongdam.net/og/svc/retire.jpg')
assert.equal(en.meta['twitter:image'], en.meta['og:image'])
assert.match(at('/th/buy/?c=retire').title, /เกษียณ/)
const ask = Object.keys(SHARE).find((k) => SHARE[k].k === 'ask')
assert.ok(at('/de/ask/?about=' + ask))
// anything else keeps the page's own
for (const u of ['/buy/', '/buy/?c=nope', '/buy/?c=constructor', '/buy/?c=retire&ref=HD-1', '/ask/?about=retire', '/buy/?about=retire', '/fr/buy/?c=retire', '/care/'])
  assert.equal(at(u), null, u)
// every picture named is on disk
for (const [id, s] of Object.entries(SHARE)) assert.ok(fs.existsSync(new URL('../docs/' + s.i, import.meta.url)), id)
console.log('share cards ok')

import { clean, read } from '../functions/api/page/[[path]].js'
import assert from 'node:assert'
// words, numbers, dates pass; anything else is refused whole
assert.deepEqual(clean({ edits: { de: { h1: ' 34 Schulen ' }, '*': { 'num.st1': '35', 'date.ev1': '2026-12-05' } } }).rows,
  [['de', 'h1', '34 Schulen'], ['*', 'num.st1', '35'], ['*', 'date.ev1', '2026-12-05']])
assert.equal(clean({ edits: { fr: { h1: 'x' } } }), null)
assert.equal(clean({ edits: { de: { 'h1<x>': 'x' } } }), null)
assert.equal(clean({ edits: { '*': { 'num.st1': '3 4' } } }), null)
assert.equal(clean({ edits: { '*': { h1: 'x' } } }), null)
assert.equal(clean({ edits: {} }), null)
assert.deepEqual(clean({ reset: true }), { reset: true })
assert.equal(clean({ edits: { de: { h1: 'x'.repeat(5000) } } }).rows[0][2].length, 1500)
// newest row wins; a reset clears what came before it
const db = (rows) => ({ prepare: () => ({ bind: () => ({ all: async () => ({ results: rows }) }) }) })
assert.deepEqual(await read(db([
  { lang: 'de', k: 'h1', v: 'A' }, { lang: 'de', k: 'h1', v: 'B' }, { lang: 'en', k: 'h1', v: 'X' },
  { lang: '*', k: '*reset', v: null }, { lang: 'de', k: 'strap', v: 'C' },
])), { de: { strap: 'C' } })
console.log('page edits ok')

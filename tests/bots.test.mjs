import { walk, slotWeek, weekStart, OPENED, usd, KINDS } from '../functions/_bots.js'
import assert from 'node:assert'
const W = OPENED, now = weekStart(W + 6) + 3600e3
// scout, 5 slots: full (up), quiet (down), 3 of 5 (hold), full ×3 (up, capped at +3)
const c = { [W]: 5, [W + 1]: 0, [W + 2]: 3, [W + 3]: 5, [W + 4]: 5, [W + 5]: 5 }
const p = walk('scout', c, W, now)
console.log(p.steps.map((s) => `${s.week}:${s.bought}→${s.price}`).join(' '), '| now', p.baht, 'US$' + p.usd)
assert.deepEqual(p.steps.map((s) => s.price), [10000, 5000, 5000, 10000, 20000, 30000])
assert.equal(walk('scout', {}, W, weekStart(W + 10)).baht, 1500)
// share walks percentages: 2 slots, both taken → 20% to 25%
const s = walk('share', { [W]: 2 }, W, weekStart(W + 1))
assert.equal(s.price, 25); assert.equal(s.unit, '%'); assert.equal(s.baht, 0)
assert.equal(walk('share', {}, W, weekStart(W + 9)).price, 5)
assert.equal(walk('earner', {}, W, weekStart(W)).baht, 30000)
assert.equal(slotWeek('earner', { [W]: 1 }, weekStart(W) + 1), W + 1)
assert.deepEqual(['scout', 'desk', 'earner', 'run', 'crew'].map((k) => usd(KINDS[k].open)), [150, 300, 1000, 100, 500])
console.log('ok')

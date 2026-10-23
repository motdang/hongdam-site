import assert from 'node:assert'
import { SERVICES, walk, pricesFrom, monthOf, monthStart, OPENED_MONTH, rungOf, ladderOf } from '../functions/_services.js'
import { LADDER, PCT_LADDER } from '../functions/_services_data.js'

const at = (m, day = 15) => monthStart(m) + (day - 1) * 864e5
const site = Object.keys(SERVICES).filter((id) => SERVICES[id].walk !== 'desk')
assert.ok(site.length > 20)

// months in Bangkok: 1 Nov 00:30 Bangkok is still 31 Oct in UTC
assert.equal(monthOf(Date.parse('2026-11-01T00:30:00+07:00')), 2026 * 12 + 10)
assert.equal(monthOf(Date.parse('2026-10-31T23:59:00+07:00')), 2026 * 12 + 9)

for (const id of site) {
  const s = SERVICES[id]
  // before the first check the opening price holds
  assert.equal(walk(id, {}, at(OPENED_MONTH)).price, s.open, id)
  // no orders: one step down a month, then the floor
  let prev = s.open
  for (let k = 1; k <= 12; k++) {
    const p = walk(id, {}, at(OPENED_MONTH + k)).price
    assert.ok(p <= prev && p >= s.floor, id)
    if (prev > s.floor) assert.equal(rungOf(p, ladderOf(id)), rungOf(prev, ladderOf(id)) - 1, id)
    prev = p
  }
  assert.equal(prev, s.floor, id)
  // every slot taken: one step up a month, then the ceiling
  const full = {}
  for (let k = 0; k < 24; k++) full[OPENED_MONTH + k] = s.slots
  assert.equal(walk(id, full, at(OPENED_MONTH + 24)).price, s.ceiling, id)
  // 70% of the slots: no change
  const mid = {}
  for (let k = 0; k < 6; k++) mid[OPENED_MONTH + k] = Math.round(s.slots * 0.7)
  if (Math.round(s.slots * 0.7) / s.slots > 0.6 && Math.round(s.slots * 0.7) / s.slots <= 0.8) {
    assert.equal(walk(id, mid, at(OPENED_MONTH + 6)).price, s.open, id)
  }
  const L = s.pct ? PCT_LADDER : LADDER
  assert.ok(L.includes(s.open) && L.includes(s.floor) && L.includes(s.ceiling), id)
}

// the Desk bot's services show its posted price, or the opening one
const desk = Object.keys(SERVICES).filter((id) => SERVICES[id].walk === 'desk')
for (const id of desk) {
  const p = pricesFrom({}, { [id]: SERVICES[id].floor }, Date.now()).find((x) => x.id === id)
  assert.equal(p.baht, SERVICES[id].floor)
  assert.equal(pricesFrom({}, {}, Date.now()).find((x) => x.id === id).price, SERVICES[id].open)
}
console.log(`services ok · ${site.length} walk monthly, ${desk.length} by the Desk bot`)

// node tools/services_sim.mjs — each walking service's price over a year under four demands,
// run through the real walk (functions/_services.js). Plain text, one line per service.
import { SERVICES, walk, monthStart, OPENED_MONTH, monthName } from '../functions/_services.js'

const SCENES = [['none', 0], ['slow', 0.3], ['steady', 0.7], ['busy', 1]]
const SHOW = [1, 2, 3, 6, 12]
const at = (m) => monthStart(m) + 14 * 864e5
let pct = false
const fmt = (b) => (pct ? b + '%' : '฿' + b.toLocaleString('en-US'))
const pad = (s, n) => String(s).padEnd(n)

const lines = []
lines.push(`Price in ${SHOW.map((k) => monthName(OPENED_MONTH + k)).join(', ')}. The first check is on the 1st of ${monthName(OPENED_MONTH + 1)} and reads ${monthName(OPENED_MONTH)}.`)
lines.push('Demand: none = no orders; slow = 30% of slots; steady = 70%; busy = every slot taken.')
lines.push('')
for (const id of Object.keys(SERVICES)) {
  const s = SERVICES[id]
  if (s.walk === 'desk') continue
  pct = !!s.pct
  lines.push(`${id} · opens ${fmt(s.open)} · floor ${fmt(s.floor)} · ceiling ${fmt(s.ceiling)} · ${s.slots} slots a month`)
  for (const [name, share] of SCENES) {
    const counts = {}
    for (let k = 0; k < 12; k++) counts[OPENED_MONTH + k] = Math.round(s.slots * share)
    const path = SHOW.map((k) => fmt(walk(id, counts, at(OPENED_MONTH + k)).price))
    lines.push(`   ${pad(name, 7)} ${path.join(' → ')}`)
  }
}
console.log(lines.join('\n'))

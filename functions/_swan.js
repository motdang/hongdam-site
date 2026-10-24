/**
 * Black Swan Event? (hongdam.net/studio/black-swan/): what the prediction API and the prediction pages share.
 * Tables in migrations/0012_swan.sql (D1 TASKS). Pure helpers first, so tests/swan.test.mjs can run them in Node.
 */

export const LANGS = ['en', 'th', 'my', 'zh', 'de']
export const ODDS = [2, 10, 100, 1000, 10000]
export const SIZES = 4
export const YEARS = [1, 2, 5, 10, 25]
export const QUIZ = ['baht97', 'tsunami04', 'banks08', 'flood11', 'covid20', 'chatgpt22', 'internet']
export const LIMITS = { text: 200, name: 40, min: 4, perAddress: 6, perDay: 400, votes: 300, reports: 20, polls: 60, hide: 3 }
const ABC = '23456789abcdefghjkmnpqrstuvwxyz'
export const ID_RE = /^[2-9a-hjkmnp-z]{6}$/

export function newId(rand = (n) => crypto.getRandomValues(new Uint8Array(n))) {
  return [...rand(6)].map((b) => ABC[b % ABC.length]).join('')
}

export function newKey() {
  const b = crypto.getRandomValues(new Uint8Array(18))
  return btoa(String.fromCharCode(...b)).replace(/[+/=]/g, (c) => ({ '+': '-', '/': '_', '=': '' })[c])
}

export async function sha(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f​-‏‪-‮]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '')

const LINK = /https?:|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|co|me|ly|xyz|th|info|biz|app|site|link|club|top|shop|gg|tv|cc|ru|cn)\b|@[a-z0-9_]{3,}\b/i
export const hasLink = (s) => LINK.test(s)

// Words that send a prediction to a person before it is listed: the Thai royal family (Thai law), in the five languages.
const HOLD = [
  /\b(?:kings?|queens?|monarch(?:y|s)?|royals?|royalty|princes?|princess(?:es)?|lese[- ]?majeste|vajiralongkorn|bhumibol|sirikit|suthida|chakri|rama\s*(?:ix|x|9|10))\b/i,
  /lèse|majesté|\b112\b/i,
  /กษัตริย์|ในหลวง|พระราชา|ราชินี|ราชวงศ์|สถาบัน|เจ้าฟ้า|รัชกาล|ร\.\s*(?:10|๑๐|9|๙)|วชิราลงกรณ์|ภูมิพล|พระบรม|เจ้าหญิง|เจ้าชาย|ราชา|พระองค์/,
  /国王|王室|泰王|皇室|王后|王子|公主|君主/,
  /\bk(?:ö|oe)nig(?:in|s|e|tum)?\b|monarchie/i,
  /ဘုရင်|မိဖုရား/,
]
export const needsLook = (s) => HOLD.some((r) => r.test(s))

/** The check date: this month plus the years chosen, as YYYY-MM. */
export function dueFrom(years, now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear() + years, now.getUTCMonth(), 1))
  return d.toISOString().slice(0, 7)
}

export const monthNow = (now = Date.now()) => new Date(now + 7 * 3600e3).toISOString().slice(0, 7)   // Bangkok

/** p while people vote "will it happen?", r once the check month has come ("did it happen?"). */
export const phaseOf = (due, now = Date.now()) => (monthNow(now) >= due ? 'r' : 'p')

/** A new prediction from a request body: {ok, row} or {ok: false, why}. */
export function readNew(b, now = new Date()) {
  const text = clean(b && b.text, LIMITS.text + 1)
  if ([...text].length < LIMITS.min || !/\p{L}/u.test(text)) return { ok: false, why: 'short' }
  if ([...text].length > LIMITS.text) return { ok: false, why: 'long' }
  if (hasLink(text)) return { ok: false, why: 'link' }
  const odds = Number(b.odds), size = Number(b.size), years = Number(b.years)
  if (!Number.isInteger(odds) || odds < 0 || odds >= ODDS.length) return { ok: false, why: 'odds' }
  if (!Number.isInteger(size) || size < 0 || size >= SIZES) return { ok: false, why: 'size' }
  if (!YEARS.includes(years)) return { ok: false, why: 'years' }
  const lang = LANGS.includes(b.lang) ? b.lang : 'en'
  let name = clean(b.name, LIMITS.name)
  if (name && hasLink(name)) name = ''
  return { ok: true, row: { text, lang, due: dueFrom(years, now), odds, size, name: name || null } }
}

/** What the pages are given about one prediction. */
export function pub(r) {
  if (!r) return null
  if (r.state === 'wait' || r.state === 'hidden') return { id: r.id, state: r.state, lang: r.lang, due: r.due, odds: r.odds, size: r.size }
  return { id: r.id, state: r.state, text: r.text, lang: r.lang, due: r.due, odds: r.odds, size: r.size, name: r.name,
    yes: r.yes, no: r.no, came: r.came, nope: r.nope, at: r.created_at }
}

export const SORTS = {
  new: 'created_at DESC',
  top: '(yes + no + came + nope) DESC, created_at DESC',
  soon: 'due ASC, created_at DESC',
}

// ── the link card of one prediction (functions/swan/[id].js) ──────────────────
export const ODDS_FMT = { en: '1 in {n}', th: '1 ใน {n}', my: '{n} မှာ 1', zh: '{n} 分之 1', de: '1 zu {n}' }
export const SIZE_W = {
  en: ['my life', 'my town', 'my country', 'the world'], th: ['ชีวิตฉัน', 'เมืองฉัน', 'ประเทศฉัน', 'ทั้งโลก'],
  my: ['ကျွန်ုပ်ဘဝ', 'ကျွန်ုပ်မြို့', 'ကျွန်ုပ်နိုင်ငံ', 'ကမ္ဘာတစ်ခုလုံး'], zh: ['我的生活', '我的城市', '我的国家', '全世界'],
  de: ['mein Leben', 'meine Stadt', 'mein Land', 'die ganze Welt'],
}
const CHECK = { en: 'check', th: 'ตรวจ', my: 'စစ်ဆေး', zh: '检查', de: 'prüfen' }
const ASK = { en: 'Will it happen? Vote.', th: 'จะเกิดไหม? โหวตเลย', my: 'ဖြစ်လာမလား? မဲပေးပါ။', zh: '会发生吗？来投票。', de: 'Wird es passieren? Stimm ab.' }
const ASKED = { en: 'Did it happen? Vote.', th: 'เกิดขึ้นจริงไหม? โหวตเลย', my: 'ဖြစ်ခဲ့လား? မဲပေးပါ။', zh: '发生了吗？来投票。', de: 'Ist es passiert? Stimm ab.' }
const TAG = { en: 'Black Swan Event? Hongdam Studio is all ears', th: 'เหตุการณ์หงส์ดำ? Hongdam Studio ตั้งใจฟัง',
  my: 'ဟင်္သာနက် ဖြစ်ရပ်လား? Hongdam Studio က နားထောင်နေပါတယ်', zh: '黑天鹅事件？Hongdam Studio 洗耳恭听', de: 'Schwarzer Schwan? Hongdam Studio ist ganz Ohr' }
const WAIT = { en: 'A prediction waiting for a check', th: 'คำทำนายที่รอตรวจ', my: 'စစ်ဆေးဖို့ စောင့်နေတဲ့ ခန့်မှန်းချက်', zh: '等待检查的预测', de: 'Eine Vorhersage wartet auf Prüfung' }

export function num(n, lang) {
  const s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return lang === 'de' ? s.replace(/,/g, '’') : s
}
export const oddsWord = (k, lang) => (ODDS_FMT[lang] || ODDS_FMT.en).replace('{n}', num(ODDS[k], lang))

export function monthWord(due, lang) {
  try {
    const loc = { en: 'en-GB', th: 'th-TH', my: 'my-MM', zh: 'zh-CN', de: 'de-CH' }[lang] || 'en-GB'
    return new Intl.DateTimeFormat(loc, { year: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(due + '-01T00:00:00Z'))
  } catch {
    return due
  }
}

/** title, description and picture of a prediction's link preview, in its page's language. */
export function card(r, lang, now = Date.now()) {
  const L = LANGS.includes(lang) ? lang : 'en'
  if (!r || r.state !== 'ok') return { title: TAG[L], desc: WAIT[L], img: 'og/swan/o4.jpg', alt: TAG[L] }
  const line = `${oddsWord(r.odds, L)} · ${(SIZE_W[L] || SIZE_W.en)[r.size]} · ${CHECK[L]} ${monthWord(r.due, L)}`
  const title = `“${r.text}”`
  const desc = `${line}. ${phaseOf(r.due, now) === 'r' ? ASKED[L] : ASK[L]} ${TAG[L]}`
  return { title, desc, img: `og/swan/o${r.odds}.jpg`, alt: `${TAG[L]} · ${line} · hongdam.net` }
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/**
 * Spam on the task board. On 2026-11-17 three link-spam posts (a casino, a pharmacy link, VK accounts for sale)
 * landed on the flood task and each opened a thread in #help-desk with its links.
 *
 * spamWhy names the first sign it finds, or '' for none. A post or answer it names is stored held and
 * told to no one. defang turns links and tags into plain text for the notes about held posts Llama Guard catches.
 */
const MARKUP = /<a\s[^>]*href|\[url[=\]]|\[link[=\]]/i
const WORDS = /\b(casinos?|gambl\w*|betting|jackpots?|viagra|cialis|porn\w*|escorts?|avtoreg|pharmcash)\b/i
const DOMAIN = /^[\w-]+(\.[\w-]+)*\.[a-z]{2,}$/i
const LINK = /\b(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi

// known: the poster picked an existing kind, so the "New kind of work" box was hidden on the form
export function spamWhy({ title = '', what = '', name = '', catNew = '', known = false } = {}) {
  const all = `${title}\n${what}\n${name}\n${catNew}`
  if (MARKUP.test(all)) return 'link markup'
  if (WORDS.test(all)) return 'spam words'
  if (catNew && known && (catNew === name || DOMAIN.test(catNew))) return 'hidden box filled'
  return ''
}

export function defang(s) {
  return String(s || '').replace(/<a\s[^>]*href=["']?([^"'\s>]+)[^>]*>/gi, ' $1 ').replace(/<[^>]*>/g, ' ').replace(LINK, (u) => {
    try { return `\`${new URL(u.startsWith('www.') ? 'http://' + u : u).hostname}\`` } catch { return '`link`' }
  }).replace(/[ \t]+/g, ' ').trim()
}

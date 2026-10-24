// pond.js: what moves on hongdam.net, and what for (her ask 2026-10-24; the look is in pond.css).
// A card below the fold rises into view as it is reached. A point in a list opens its lotus as it is read. A tap rings
// out like water. Until it is touched, the search box types the names of things people order here. A price meter fills
// when it is seen. The Buy total drops in when a choice changes it. With reduced motion none of this runs.
// Prices tick when the ฿ / $ / € switch changes them. The "write to us" buttons at the end of a list ring once when
// a reader scrolls down to them.
// A plain script, so the copies of /bots on GitHub Pages can load it from hongdam.net too.
(function () {
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  var IO = 'IntersectionObserver' in window
  var LISTS = '.know ul > li, .card > ul > li, .pg .kind ul > li, .s-body ul > li'
  if (calm || !IO) {
    document.querySelectorAll(LISTS).forEach(function (li) { li.classList.add('pond-up') })
    return
  }

  // what comes into view together goes in order, a beat apart
  function inOrder(base, step, most) {
    return function (es, ob) {
      var k = 0
      es.forEach(function (e) {
        if (!e.isIntersecting) return
        ob.unobserve(e.target)
        e.target.style.setProperty('--d', base + Math.min(k++, most) * step + 'ms')
        e.target.classList.add('pond-up')
      })
    }
  }

  // cards and blocks below the fold rise as they are reached; the first screen is there at once
  var SINK = '.cards > li, .doors > li, .know, .pg .kind, .pg .panel, .pg .pack, .pg .col, .s-practices > li, .s-notes > li, .s-work > li'
  var sink = new IntersectionObserver(inOrder(0, 90, 5), { rootMargin: '0px 0px -8% 0px' })
  document.querySelectorAll(SINK).forEach(function (el) {
    var r = el.getBoundingClientRect()
    if (!r.height || r.top < innerHeight || el.closest('#hits')) return
    el.classList.add('pond-sink')
    sink.observe(el)
  })
  // risen, it is its plain self again (a card's hover lift has its own transition)
  document.addEventListener('transitionend', function (e) {
    var el = e.target
    if (e.propertyName !== 'translate' || !el.classList.contains('pond-sink') || !el.classList.contains('pond-up')) return
    el.classList.remove('pond-sink', 'pond-up')
    el.style.removeProperty('--d')
  })

  // a point in a list: its lotus opens once it is on the screen, one after another down the list
  var bloom = new IntersectionObserver(inOrder(250, 260, 8), { threshold: 0.6, rootMargin: '0px 0px -12% 0px' })
  document.querySelectorAll(LISTS).forEach(function (li) { bloom.observe(li) })

  // a tap rings out from the finger, in the colour of the card it is on
  function ring(x, y, t) {
    var cs = getComputedStyle(t), col = cs.getPropertyValue('--line').trim() || cs.color
    for (var i = 0; i < 2; i++) {
      var r = document.createElement('span')
      r.className = 'pond-ring'
      r.setAttribute('aria-hidden', 'true')
      r.style.left = x + 'px'
      r.style.top = y + 'px'
      r.style.setProperty('--rc', col)
      r.addEventListener('animationend', function () { this.remove() })
      document.body.appendChild(r)
    }
  }
  var TAP = 'a, button, summary, label, .stop'
  document.addEventListener('pointerdown', function (e) {
    if (e.button) return
    var t = e.target.closest && e.target.closest(TAP)
    if (t) ring(e.clientX, e.clientY, t)
  }, { capture: true, passive: true })

  // the end of a list: someone who scrolled this far without finding their thing sees where to write
  var end = document.querySelector('main a.btn[href^="https://line.me"]')
  if (end) {
    var atLoad = true
    var endIO = new IntersectionObserver(function (es) {
      var e = es[es.length - 1]
      if (atLoad) { atLoad = false; if (e.isIntersecting) { endIO.disconnect(); return } }
      if (!e.isIntersecting) return
      endIO.disconnect()
      setTimeout(function () {
        end.parentNode.querySelectorAll('a.btn').forEach(function (b, i) {
          setTimeout(function () { var r = b.getBoundingClientRect(); ring(r.left + r.width / 2, r.top + r.height / 2, document.body) }, i * 380)
        })
      }, 500)
    }, { threshold: 1 })
    endIO.observe(end)
  }

  // ฿ / $ / €: the prices on the screen tick over as the switch changes them
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.curs [data-cur]')) return
    document.querySelectorAll('.amt').forEach(function (a) {
      var r = a.getBoundingClientRect()
      if (r.bottom < 0 || r.top > innerHeight || !r.width) return
      a.classList.remove('pond-tick'); void a.offsetWidth; a.classList.add('pond-tick')
    })
  })

  // the price meter under a walking price (shop.js draws it when today's prices arrive): when it is seen, its steps rise
  // to today's and this month's bookings fill in
  var meter = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var el = e.target
      if (!e.isIntersecting || el.hidden || !el.querySelector('.bars')) return
      meter.unobserve(el)
      el.querySelectorAll('.bars i, .slots i').forEach(function (b) { b.style.setProperty('--i', [].indexOf.call(b.parentNode.children, b)) })
      el.classList.add('lit')
    })
  }, { threshold: 1 })
  document.querySelectorAll('details.ladder').forEach(function (d) { d.classList.add('pond-wait'); meter.observe(d) })

  // the search box types what people order here, until it is touched: this kind's on its own page, one of each on the front
  var q = document.getElementById('q'), data = document.getElementById('shop')
  if (q && data && q.placeholder) {
    var D = JSON.parse(data.textContent), first = q.placeholder, done = false, seen = true
    var quit = function () { if (!done) { done = true; q.placeholder = first } }
    q.addEventListener('focus', quit)
    q.addEventListener('input', quit)
    new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting }).observe(q)
    var parts = function (s) {
      if (window.Intl && Intl.Segmenter) return Array.from(new Intl.Segmenter(D.lang, { granularity: 'grapheme' }).segment(s), function (x) { return x.segment })
      return Array.from(s)
    }
    var wait = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms) }) }
    var type = async function (names) {
      await wait(2600)
      for (var n = 0; !done; n++) {
        if (!seen || document.hidden) { await wait(700); n--; continue }
        var w = parts(names[n % names.length]), k
        for (k = 1; k <= w.length && !done; k++) { q.placeholder = w.slice(0, k).join(''); await wait(60 + Math.random() * 70) }
        await wait(1900)
        for (k = w.length - 1; k >= 0 && !done; k--) { q.placeholder = w.slice(0, k).join(''); await wait(26) }
        await wait(420)
      }
      q.placeholder = first
    }
    fetch(D.cardsUrl).then(function (r) { return r.json() }).then(function (cards) {
      var mine = cards.filter(function (c) { return c.cat === D.group })
      var cats = {}
      var pick = mine.length > 3 ? mine : cards.filter(function (c) { return cats[c.cat] ? false : (cats[c.cat] = 1) })
      var names = pick.map(function (c) { return c.n }).filter(function (s) { return parts(s).length <= 26 })
      if (names.length > 2 && !done) type(names)
    }).catch(function () {})
  }

  // the Buy page: when a choice changes the total, the new total drops in
  var buy = document.body.classList.contains('p-buy') && document.getElementById('buy')
  if (buy) {
    var last = ''
    new MutationObserver(function () {
      var t = document.getElementById('total')
      if (!t) return
      var now = t.textContent
      if (last && now !== last) { t.classList.remove('pond-tick'); void t.offsetWidth; t.classList.add('pond-tick') }
      last = now
    }).observe(buy, { childList: true, subtree: true, characterData: true })
  }
})()

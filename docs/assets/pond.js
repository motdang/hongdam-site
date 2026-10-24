// pond.js: what moves on hongdam.net, and what for (her ask 2026-10-24; the look is in pond.css).
// A card below the fold rises into view as it is reached. A point in a list opens its lotus as it is read. A tap rings
// out like water. Until it is touched, the search box types the names of things people order here. A price meter fills
// when it is seen. The Buy total drops in when a choice changes it. With reduced motion none of this runs.
// Prices tick when the ฿ / $ / € switch changes them. The "write to us" buttons at the end of a list ring once when
// a reader scrolls down to them.
// Mixed media (her ask 2026-10-24): a swan on a line that is water has its reflection under the surface, and now and
// then a drop of water falls: on a line that is water it rings it and rocks the pad beside it, on the paper it leaves a
// spot that dries. No drops with reduced motion; the reflection then holds still.
// A plain script, so the copies of /bots on GitHub Pages can load it from hongdam.net too.
(function () {
  var still = matchMedia('(prefers-reduced-motion: reduce)'), calm = still.matches
  var IO = 'IntersectionObserver' in window
  var LISTS = '.know ul > li, .card > ul > li, .pg .kind ul > li, .s-body ul > li'
  var quiet = false, hush = []
  var rem = function () { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 }
  // a job line's measures (shop.css .job): where its line sits above the foot of the job, and how thick it is
  var lineOf = function (job) {
    var cs = getComputedStyle(job), r = rem(), len = function (v) { v = String(v).trim(); return (parseFloat(v) || 0) * (/rem$/.test(v) ? r : 1) }
    return { y: len(cs.getPropertyValue('--lineY')), w: len(cs.getPropertyValue('--line-w')) || 5 }
  }

  // the swan's reflection: what of it is above the surface, upside down under it, fading with depth and rippling
  if (IO) (function () {
    var swims = new Set(), raf = 0, last = 0
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) swims.add(e.target); else swims.delete(e.target) })
      kick()
    }, { rootMargin: '40px' })
    var watch = function () { document.querySelectorAll('.job:not([data-refl])').forEach(function (j) { j.dataset.refl = 1; seen.observe(j) }) }
    watch()
    var n = 0, w = setInterval(function () { watch(); if (++n > 20) clearInterval(w) }, 1500)   // lines drawn after load (the Buy page)
    function kick() { if (!raf && swims.size) raf = requestAnimationFrame(tick) }
    function tick(now) {
      raf = 0
      if (document.hidden) return
      if (now - last >= 40) {
        last = now
        swims.forEach(function (j) { if (j.classList.contains('swim')) j.querySelectorAll('.rider').forEach(function (r) { mirror(j, r, now) }) })
      }
      if (!calm && !quiet) kick()
      else setTimeout(kick, 1000)   // held still: drawn again now and then, as the swan settles
    }
    document.addEventListener('visibilitychange', kick)
    function mirror(job, rider, now) {
      var g = rider.querySelector('doodle-dingbat'), src = g && g.querySelector('canvas.db-cv')
      if (!src || !src.width || !rider.offsetHeight) return
      var c = rider.querySelector(':scope > canvas.pond-refl')
      if (!c) { c = document.createElement('canvas'); c.className = 'pond-refl'; c.setAttribute('aria-hidden', 'true'); rider.appendChild(c) }
      // in the rider's own box, so a mate drawn mirrored (scaleX(-1)) gets its reflection mirrored too
      var L = lineOf(job), cssW = parseFloat(src.style.width) || src.width, k = src.width / cssW
      var top = g.offsetTop + (parseFloat(src.style.top) || 0), left = g.offsetLeft + (parseFloat(src.style.left) || 0)
      var surf = rider.offsetHeight + (parseFloat(getComputedStyle(rider).bottom) || 0) - L.y - L.w / 2
      var above = surf - top
      if (above < 4) return
      var depth = Math.min(above, (job.querySelector('.cap') ? 0.5 : 1.4) * rem()), W = src.width, H = Math.max(1, Math.round(depth * k)), sy = Math.round(above * k)
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H }
      c.style.width = cssW + 'px'; c.style.height = depth + 'px'; c.style.left = left + 'px'; c.style.top = surf + 'px'
      var x = c.getContext('2d'), t = now / 1000, strip = Math.max(1, Math.round(k))
      x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H)
      for (var y = 0; y < H; y += strip) {
        var row = sy - y - strip
        if (row < 0) break
        var dx = calm || quiet ? 0 : Math.sin(y / k * 0.6 + t * 3.1) * (0.5 + 1.5 * y / H) * k
        x.drawImage(src, 0, row, W, strip, dx, y, W, strip)
      }
      var f = x.createLinearGradient(0, 0, 0, H); f.addColorStop(0, 'rgba(0,0,0,1)'); f.addColorStop(1, 'rgba(0,0,0,0)')
      x.globalCompositeOperation = 'destination-in'; x.fillStyle = f; x.fillRect(0, 0, W, H)
    }
  })()

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

  // reduced motion switched on while the page is open: everything shows as it is at once (cards up, lotus open,
  // meters filled) and the rings and the typing stop, for the rest of the visit
  var onStill = function () {
    if (!still.matches || quiet) return
    quiet = true
    sink.disconnect(); bloom.disconnect(); meter.disconnect()
    document.querySelectorAll('.pond-sink').forEach(function (el) { el.classList.remove('pond-sink', 'pond-up'); el.style.removeProperty('--d') })
    document.querySelectorAll(LISTS).forEach(function (li) { li.classList.add('pond-up') })
    document.querySelectorAll('.ladder.pond-wait').forEach(function (d) { d.classList.add('lit') })
    document.querySelectorAll('.pond-ring').forEach(function (r) { r.remove() })
    hush.forEach(function (f) { f() })
  }
  if (still.addEventListener) still.addEventListener('change', onStill)
  else if (still.addListener) still.addListener(onStill)

  // a tap rings out from the finger, in the colour of the card it is on
  function ring(x, y, t) {
    if (quiet) return
    var cs = getComputedStyle(t), col = cs.getPropertyValue('--line').trim() || cs.color
    for (var i = 0; i < 2; i++) {
      var r = document.createElement('span')
      r.className = 'pond-ring'
      r.setAttribute('aria-hidden', 'true')
      r.style.left = x + 'px'
      r.style.top = y + 'px'
      r.style.setProperty('--rc', col)
      r.addEventListener('animationend', function () { this.remove() })
      setTimeout(r.remove.bind(r), 1500)
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
    hush.push(quit)
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

  // now and then a drop of water falls, every 7 to 17 seconds and never while the tab is hidden: onto a line that is
  // water when one is in view (two rings, and the pad nearest it rocks), else onto the bare paper (a spot that spreads,
  // then dries lighter and goes)
  var mk = function (cls, host) { var e = document.createElement('i'); e.className = cls; e.setAttribute('aria-hidden', 'true'); (host || document.body).appendChild(e); return e }
  var gone = function (e, ms) { e.addEventListener('animationend', function () { e.remove() }); setTimeout(function () { e.remove() }, ms) }
  function waterAt() {
    var js = [].filter.call(document.querySelectorAll('.job.swim'), function (j) { var r = j.getBoundingClientRect(); return r.width && r.top > innerHeight * 0.12 && r.bottom < innerHeight * 0.9 })
    if (!js.length || Math.random() < 0.3) return null
    var j = js[Math.floor(Math.random() * js.length)], r = j.getBoundingClientRect(), f = 0.1 + 0.8 * Math.random()
    return { job: j, f: f, x: r.left + f * r.width, y: r.bottom - lineOf(j).y }
  }
  function paperAt() {
    for (var i = 0; i < 10; i++) {
      var x = 16 + Math.random() * (innerWidth - 32), y = innerHeight * (0.28 + 0.6 * Math.random()), el = document.elementFromPoint(x, y)
      if (el && /^(HTML|BODY|MAIN)$/.test(el.tagName)) return { x: x, y: y }
    }
    return null
  }
  function land(t) {
    if (t.job) {
      var j = t.job, L = lineOf(j), lx = t.f * j.clientWidth, top = j.clientHeight - L.y
      for (var i = 0; i < 2; i++) { var s = mk('pond-splash', j); s.style.left = lx + 'px'; s.style.top = top + 'px'; gone(s, 2600) }
      var r = j.getBoundingClientRect(), best = null, bd = 3 * rem()
      j.querySelectorAll('.stop').forEach(function (st) { var q = st.getBoundingClientRect(), d = Math.abs(q.left + q.width / 2 - (r.left + lx)); if (d < bd) { bd = d; best = st } })
      if (best) { best.classList.remove('pond-rock'); void best.offsetWidth; best.classList.add('pond-rock'); setTimeout(function () { best.classList.remove('pond-rock') }, 2100) }
      return
    }
    var p = mk('pond-spot'); p.style.left = t.x + scrollX + 'px'; p.style.top = t.y + scrollY + 'px'; gone(p, 13000)
  }
  function drop() {
    if (quiet) return
    if (document.hidden) { document.addEventListener('visibilitychange', function back() { if (document.hidden) return; document.removeEventListener('visibilitychange', back); later() }); return }
    var t = waterAt() || paperAt()
    if (t && document.body.animate) {
      var d = mk('pond-drop'), ms = 360 + 460 * Math.sqrt(Math.max(0, t.y) / innerHeight)
      d.style.left = t.x + 'px'
      var a = d.animate([{ transform: 'translateY(-1.2rem)' }, { transform: 'translateY(' + t.y + 'px)' }], { duration: ms, easing: 'cubic-bezier(.55, 0, 1, .55)', fill: 'forwards' })
      a.onfinish = function () { d.remove(); if (!quiet) land(t) }
    }
    later()
  }
  function later() { setTimeout(drop, 7000 + Math.random() * 10000) }
  later()

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

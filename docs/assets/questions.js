// questions.js (tools/build_questions.py): the scroll of questions on the front pages, and the find box on /questions/.
// The scroll drifts up slowly and loops. It stops while a pointer is over it, while something in it has focus, for a
// few seconds after a hand scrolls it, and when the Pause button is pressed. With reduced motion it stays still and
// scrolls by hand. The page's HTML holds a few questions; the full list comes from /assets/questions-<lang>.json.
(function () {
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches

  // the find box on /questions/
  var f = document.getElementById('qf')
  if (f) {
    var out = document.querySelector('.qs-n'), cats = [].slice.call(document.querySelectorAll('.qs-cat'))
    var find = function () {
      var w = f.value.trim().toLowerCase(), k = 0, all = 0
      cats.forEach(function (c) {
        var any = 0
        c.querySelectorAll('li').forEach(function (li) {
          all++
          var hit = !w || li.textContent.toLowerCase().indexOf(w) >= 0
          li.hidden = !hit
          if (hit) { any++; k++ }
        })
        c.hidden = !any
      })
      out.textContent = !w ? '' : k ? out.dataset.of.replace('{k}', k).replace('{n}', all) : out.dataset.none
    }
    f.addEventListener('input', find)
    if (f.value) find()
  }

  var box = document.querySelector('.qs-scroll')
  if (!box) return
  var list = box.querySelector('.qs-list'), btn = document.querySelector('.qs-pause')
  var SPEED = 20 / 1000   // px a millisecond
  var paused = false, over = false, held = 0, seen = false, inView = false, loopH = 0, acc = 0, last = 0, ticking = false

  function li(r, copy) {
    var l = document.createElement('li'), a = document.createElement('a'), q = document.createElement('span'), s = document.createElement('span')
    l.style.setProperty('--line', 'var(--c-' + r[3] + ')')
    a.href = r[1]; q.className = 'qt'; q.textContent = r[0]; s.className = 'sv'; s.textContent = r[2]
    a.append(q, s); l.append(a)
    if (copy) { l.setAttribute('aria-hidden', 'true'); a.tabIndex = -1 }
    return l
  }
  // the day's order: the same for everyone today, different tomorrow
  function shuffle(rows) {
    var d = new Date(), s = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate()
    var rnd = function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648 }
    for (var i = rows.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = rows[i]; rows[i] = rows[j]; rows[j] = t }
    return rows
  }
  function fill(rows) {
    var frag = document.createDocumentFragment()
    rows.forEach(function (r) { frag.append(li(r)) })
    if (!calm) rows.forEach(function (r) { frag.append(li(r, true)) })   // a second run, so the loop has no seam
    list.replaceChildren(frag)
    box.scrollTop = acc = 0
    measure()
    if (!calm && btn) btn.hidden = false
    go()
  }
  function measure() {
    var copy = list.querySelector('[aria-hidden]')
    loopH = copy ? copy.offsetTop - list.firstElementChild.offsetTop : 0
  }
  function moving() { return !calm && !paused && !over && inView && loopH && Date.now() > held && !document.hidden }
  function tick(t) {
    ticking = false
    var dt = last ? Math.min(t - last, 50) : 0
    last = t
    if (moving()) {
      acc += SPEED * dt
      if (acc >= loopH) acc -= loopH
      box.scrollTop = acc
    } else {
      acc = box.scrollTop
      if (loopH && acc >= loopH) { acc -= loopH; box.scrollTop = acc }
    }
    if (inView) { ticking = true; requestAnimationFrame(tick) }   // the next frame carries on from this one
  }
  function go() { if (!ticking) { ticking = true; last = 0; requestAnimationFrame(tick) } }

  // a hand on it: the scroll waits, then carries on from where the hand left it
  function hold() { held = Date.now() + 4000 }
  ;['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(function (e) { box.addEventListener(e, hold, { passive: true }) })
  box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') over = true })
  box.addEventListener('pointerleave', function () { over = false })
  box.addEventListener('focusin', function () { over = true })
  box.addEventListener('focusout', function () { over = false })
  if (btn) btn.addEventListener('click', function () {
    paused = !paused
    btn.setAttribute('aria-pressed', paused)
    btn.textContent = paused ? btn.dataset.play : btn.dataset.pause
  })
  addEventListener('resize', measure)
  document.addEventListener('visibilitychange', go)

  new IntersectionObserver(function (es) {
    inView = es[0].isIntersecting
    if (inView && !seen) {
      seen = true
      fetch(box.dataset.qs).then(function (r) { return r.json() }).then(function (rows) { fill(shuffle(rows)) })
        .catch(function () { if (!calm) { [].slice.call(list.children).forEach(function (l) { list.append(l.cloneNode(true)) })
          list.querySelectorAll('li').forEach(function (l, i, a) { if (i >= a.length / 2) { l.setAttribute('aria-hidden', 'true'); l.querySelector('a').tabIndex = -1 } })
          measure(); if (btn) btn.hidden = false; go() } })
    } else if (inView) go()
  }, { rootMargin: '300px 0px' }).observe(box)
})()

// questions.js (tools/build_questions.py): the crawl of questions on the front pages, and the list on /questions/.
// Both come in a new random order on every visit. The crawl is one line moving slowly sideways, in a loop. It stops
// while a pointer is over it, while something in it has focus, for a few seconds after a hand scrolls it, and when the
// Pause button is pressed. With reduced motion it stays still and scrolls by hand. The page's HTML holds a few
// questions; the full list comes from /assets/questions-<lang>.json.
(function () {
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t }
    return a
  }

  // the list on /questions/: a new order, and the find box
  var f = document.getElementById('qf')
  if (f) {
    var ul = document.querySelector('.qs-page'), out = document.querySelector('.qs-n')
    shuffle([].slice.call(ul.children)).forEach(function (li) { ul.append(li) })
    var find = function () {
      var w = f.value.trim().toLowerCase(), k = 0
      ul.querySelectorAll('li').forEach(function (li) {
        var hit = !w || li.textContent.toLowerCase().indexOf(w) >= 0
        li.hidden = !hit
        if (hit) k++
      })
      out.textContent = w && !k ? out.dataset.none : ''
    }
    f.addEventListener('input', find)
    if (f.value) find()
  }

  var box = document.querySelector('.qs-scroll')
  if (!box) return
  var list = box.querySelector('.qs-list'), btn = document.querySelector('.qs-pause')
  var SPEED = 30 / 1000   // px a millisecond
  var paused = false, over = false, held = 0, seen = false, inView = false, loopW = 0, acc = 0, last = 0, ticking = false

  function li(r, copy) {
    var l = document.createElement('li'), a = document.createElement('a'), q = document.createElement('span'), s = document.createElement('span')
    l.style.setProperty('--line', 'var(--c-' + r[3] + ')')
    a.href = r[1]; q.className = 'qt'; q.textContent = r[0]; s.className = 'sv'; s.textContent = r[2]
    a.append(q, s); l.append(a)
    if (copy) { l.setAttribute('aria-hidden', 'true'); a.tabIndex = -1 }
    return l
  }
  function fill(rows) {
    var frag = document.createDocumentFragment()
    rows.forEach(function (r) { frag.append(li(r)) })
    if (!calm) rows.forEach(function (r) { frag.append(li(r, true)) })   // a second run, so the loop has no seam
    list.replaceChildren(frag)
    box.scrollLeft = acc = 0
    measure()
    if (!calm && btn) btn.hidden = false
    go()
  }
  function measure() {
    var copy = list.querySelector('[aria-hidden]')
    loopW = copy ? copy.offsetLeft - list.firstElementChild.offsetLeft : 0
  }
  function moving() { return !calm && !paused && !over && inView && loopW && Date.now() > held && !document.hidden }
  function tick(t) {
    ticking = false
    var dt = last ? Math.min(t - last, 50) : 0
    last = t
    if (moving()) {
      acc += SPEED * dt
      if (acc >= loopW) acc -= loopW
      box.scrollLeft = acc
    } else {
      acc = box.scrollLeft
      if (loopW && acc >= loopW) { acc -= loopW; box.scrollLeft = acc }
    }
    if (inView) { ticking = true; requestAnimationFrame(tick) }   // the next frame carries on from this one
  }
  function go() { if (!ticking) { ticking = true; last = 0; requestAnimationFrame(tick) } }

  // a hand on it: the crawl waits, then carries on from where the hand left it
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
        .catch(function () {
          fill(shuffle([].slice.call(list.children).map(function (l) {
            var a = l.querySelector('a')
            return [a.querySelector('.qt').textContent, a.getAttribute('href'), a.querySelector('.sv').textContent, (l.style.getPropertyValue('--line').match(/--c-([a-z]+)/) || [])[1] || 'help']
          })))
        })
    } else if (inView) go()
  }, { rootMargin: '300px 0px' }).observe(box)
})()

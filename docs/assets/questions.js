// questions.js (tools/build_questions.py): the crawl of questions on the front pages, and the list on /questions/.
// Both come in a new random order on every visit. The crawl is one line moving slowly sideways, in a loop, and stops
// under a pointer or focus; with reduced motion it stays still and scrolls by hand. The page's HTML holds a few
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

  // the crawl, like Mot Dang's gold prices: the full list, twice over, moving at 30 px a second; it stops under a
  // pointer or focus (questions.css)
  var a = document.querySelector('.qs-crawl')
  if (!a || !window.fetch) return
  var r = a.querySelector('.qs-r')
  function item(q, copy) {
    var i = document.createElement('a'), b = document.createElement('b'), s = document.createElement('span')
    i.className = 'qs-i'; i.href = q[1]; i.style.setProperty('--line', 'var(--c-' + q[3] + ')')
    b.textContent = q[0]; s.className = 'sv'; s.textContent = q[2]
    i.append(b, ' ', s)
    if (copy) { i.setAttribute('aria-hidden', 'true'); i.tabIndex = -1 }
    return i
  }
  function run(rows) {
    r.textContent = ''
    rows.forEach(function (q) { r.append(item(q)) })
    rows.forEach(function (q) { r.append(item(q, true)) })
    a.style.setProperty('--qd', Math.max(60, Math.round(r.scrollWidth / 2 / 30)) + 's')
    a.classList.add('go')
  }
  fetch(a.dataset.qs).then(function (x) { return x.ok ? x.json() : null }).catch(function () { return null }).then(function (rows) {
    if (!rows) rows = [].slice.call(r.children).map(function (i) {
      return [i.querySelector('b').textContent, i.getAttribute('href'), i.querySelector('.sv').textContent, (i.style.getPropertyValue('--line').match(/--c-([a-z]+)/) || [])[1]]
    })
    run(shuffle(rows))
  })
})()

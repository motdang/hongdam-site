// DJ, meet the company (tools/build_dj.py): each Isotype row fills in, one picture after another, when it comes into view.
// Without this file, or with reduced motion, the rows show whole.
const rows = document.querySelectorAll('.dj-iso')
if (rows.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  rows.forEach((r) => [...r.children].forEach((c, i) => c.style.setProperty('--i', i)))
  document.documentElement.classList.add('dj-js')
  const io = new IntersectionObserver((seen) => seen.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
  }), { threshold: 0.4 })
  rows.forEach((r) => io.observe(r))
}

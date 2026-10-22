// Runs inside a page. Returns every visible text run below WCAG AA contrast.
// AA: 4.5 for body text, 3 for large text (24px, or 18.66px bold).
// Background: solid colours are layered up the tree. Text over a photo is
// checked against the section's overlay gradient laid on the photo's
// 90th-percentile-light colour. Text in a fixed bar is checked against
// whatever the page shows underneath it.
(async function () {
  var style = document.getElementById('__contrast_freeze');
  if (!style) {
    style = document.createElement('style');
    style.id = '__contrast_freeze';
    style.textContent = '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';
    document.head.appendChild(style);
  }

  // photo pixels, read once per page (400 px wide is enough to judge a region)
  if (!window.__px) {
    window.__px = {};
    var urls = new Set();
    document.querySelectorAll('*').forEach(function (n) {
      var m = (getComputedStyle(n).backgroundImage || '').match(/url\("?([^")]+)"?\)/);
      if (m) urls.add(m[1]);
    });
    for (var u of urls) {
      await new Promise(function (res) {
        var im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = function () {
          try {
            var c = document.createElement('canvas'), w = (c.width = 400), h = (c.height = Math.max(1, Math.round((400 * im.height) / im.width))), x = c.getContext('2d');
            x.drawImage(im, 0, 0, w, h);
            window.__px[u] = { w: w, h: h, nw: im.naturalWidth, nh: im.naturalHeight, d: x.getImageData(0, 0, w, h).data };
          } catch (e) { /* cross-origin photo: white is assumed */ }
          res();
        };
        im.onerror = res;
        im.src = u;
      });
    }
  }
  // the 90th-percentile-light colour of the part of the photo behind the text
  function photoBehind(u, host, el, cs) {
    var P = window.__px[u];
    if (!P) return { r: 255, g: 255, b: 255, a: 1 };
    var fixed = cs.backgroundAttachment === 'fixed';
    var box = fixed ? { left: 0, top: 0, width: innerWidth, height: innerHeight } : host.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    var x0 = 0, y0 = 0, x1 = P.w, y1 = P.h;
    if (/cover/.test(cs.backgroundSize)) {
      var sc = Math.max(box.width / P.nw, box.height / P.nh), dw = P.nw * sc, dh = P.nh * sc;
      var pos = (cs.backgroundPosition || '50% 50%').split(/\s+/);
      function off(v, free) { return /%$/.test(v) ? (free * parseFloat(v)) / 100 : parseFloat(v) || 0; }
      var ox = off(pos[0] || '50%', box.width - dw), oy = off(pos[1] || '50%', box.height - dh);
      var k = P.w / dw;
      x0 = (r.left - box.left - ox) * k; x1 = (r.right - box.left - ox) * k;
      y0 = (r.top - box.top - oy) * k; y1 = (r.bottom - box.top - oy) * k;
      x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
      x1 = Math.min(P.w, Math.ceil(x1)); y1 = Math.min(P.h, Math.ceil(y1));
      if (x1 - x0 < 1 || y1 - y0 < 1) { x0 = 0; y0 = 0; x1 = P.w; y1 = P.h; }
    }
    var px = [];
    for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) {
      var i = (yy * P.w + xx) * 4, d = P.d;
      px.push([d[i], d[i + 1], d[i + 2], 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]]);
    }
    px.sort(function (a, b) { return a[3] - b[3]; });
    var q = px[Math.floor(px.length * 0.9)] || [255, 255, 255];
    return { r: q[0], g: q[1], b: q[2], a: 1 };
  }

  function parse(c) {
    var m = c && c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function over(top, bot) {
    var a = top.a + bot.a * (1 - top.a);
    if (!a) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (top.r * top.a + bot.r * bot.a * (1 - top.a)) / a,
      g: (top.g * top.a + bot.g * bot.a * (1 - top.a)) / a,
      b: (top.b * top.a + bot.b * bot.a * (1 - top.a)) / a,
      a: a,
    };
  }
  function lum(c) {
    function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  // every linear-gradient layer of an overlay, sampled at the element's centre
  function gradAt(img, el, sec) {
    var r = el.getBoundingClientRect(), s = sec.getBoundingClientRect(), out = { r: 0, g: 0, b: 0, a: 0 };
    img.split(/,\s*(?=linear-gradient)/).reverse().forEach(function (L) {
      if (!/linear-gradient/.test(L)) return;
      var deg = 180, m = L.match(/linear-gradient\((-?\d+)deg/);
      if (m) deg = +m[1];
      var horiz = deg === 90 || deg === 270;
      var t = horiz ? (r.left + r.width / 2 - s.left) / s.width : (r.top + r.height / 2 - s.top) / s.height;
      if (deg === 270 || deg === 0) t = 1 - t;
      t = Math.max(0, Math.min(1, t));
      var stops = [], re = /rgba?\([^)]+\)\s*(-?[\d.]+)?(%|px)?/g, k;
      while ((k = re.exec(L))) {
        var pos = k[1] != null ? (k[2] === 'px' ? +k[1] / (horiz ? s.width : s.height) : +k[1] / 100) : null;
        stops.push({ c: parse(k[0]), p: pos });
      }
      if (!stops.length) return;
      stops.forEach(function (st, j) { if (st.p == null) st.p = j / Math.max(1, stops.length - 1); });
      var c = t <= stops[0].p ? stops[0].c : stops[stops.length - 1].c;
      for (var j = 0; j < stops.length - 1; j++) {
        var A = stops[j], B = stops[j + 1];
        if (t >= A.p && t <= B.p) {
          var u = (t - A.p) / (B.p - A.p || 1);
          c = { r: A.c.r + (B.c.r - A.c.r) * u, g: A.c.g + (B.c.g - A.c.g) * u, b: A.c.b + (B.c.b - A.c.b) * u, a: A.c.a + (B.c.a - A.c.a) * u };
        }
      }
      out = over(c, out);
    });
    return out;
  }

  var WHITE = { r: 255, g: 255, b: 255, a: 1 };
  function bgOf(el, depth) {
    var layers = [], n = el, fixedRoot = null;
    while (n && n.nodeType === 1) {
      var cs = getComputedStyle(n);
      if (cs.position === 'fixed' && !fixedRoot) fixedRoot = n;
      var bi = cs.backgroundImage || 'none';
      if (/url\(/.test(bi)) {
        var u = (bi.match(/url\("?([^")]+)"?\)/) || [])[1];
        var base = photoBehind(u, n, el, cs);
        var b = getComputedStyle(n, '::before').backgroundImage;
        if (b && b !== 'none') base = over(gradAt(b, el, n), base);
        var res = base;
        for (var i = layers.length - 1; i >= 0; i--) res = over(layers[i], res);
        return { c: res, photo: true };
      }
      if (/gradient/.test(bi)) {
        var g = parse((bi.match(/rgba?\([^)]+\)/) || [''])[0]);
        if (g) layers.push(g);
      }
      var bc = parse(cs.backgroundColor);
      if (bc && bc.a > 0) { layers.push(bc); if (bc.a >= 0.999) break; }
      if (n === fixedRoot && !(depth > 0)) { n = null; break; } // the page under a fixed bar scrolls; look beneath it
      n = n.parentElement;
    }
    var under = WHITE, photo = false;
    if (!n && fixedRoot && !(depth > 0)) {
      // a see-through fixed bar: look at what sits beneath its centre
      var r = el.getBoundingClientRect();
      var stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2) || [];
      var below = stack.find(function (x) { return !fixedRoot.contains(x) && x !== document.documentElement && x !== document.body; });
      if (below) { var b2 = bgOf(below, 1); under = b2.c; photo = b2.photo; }
    }
    var out = under;
    for (var j = layers.length - 1; j >= 0; j--) out = over(layers[j], out);
    return { c: out, photo: photo };
  }
  function opacity(el) {
    var o = 1, n = el;
    while (n && n.nodeType === 1) { o *= +getComputedStyle(n).opacity; n = n.parentElement; }
    return o;
  }
  function hidden(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.contentVisibility === 'hidden') return true;
      if (n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true') return true;
    }
    return false;
  }
  function describe(el) {
    var cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : '';
    var host = el.closest('[id]');
    return el.tagName.toLowerCase() + cls + (host ? ' in #' + host.id : '');
  }

  var fails = [], checked = 0;
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function (t) { return t.nodeValue.trim() ? 1 : 2; },
  });
  var t;
  while ((t = walker.nextNode())) {
    var el = t.parentElement;
    if (!el || el.closest('script,style,noscript,template,svg title')) continue;
    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    if (hidden(el)) continue;
    if (el.closest(':disabled,[aria-disabled="true"]')) continue; // switched-off controls are exempt in WCAG
    var cs = getComputedStyle(el);
    if (parseFloat(cs.fontSize) < 1) continue;
    if (cs.clip === 'rect(0px, 0px, 0px, 0px)' || (rect.width <= 1 && rect.height <= 1)) continue; // screen-reader only
    checked++;
    var fg = parse(cs.color);
    if (!fg) continue;
    var op = opacity(el);
    if (op < 0.05) continue; // not shown yet (a fade-in that has not run)
    var size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    var need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    var bg, cr, seen;
    // gradient-filled text (background-clip: text): judged by its weakest colour
    var clipHost = null;
    for (var ch = el; ch && ch.nodeType === 1 && !clipHost; ch = ch.parentElement) {
      var cc = getComputedStyle(ch);
      if (/text/.test(cc.webkitBackgroundClip || cc.backgroundClip || '') && /gradient/.test(cc.backgroundImage)) clipHost = ch;
    }
    if (clipHost) {
      var stops = (getComputedStyle(clipHost).backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(parse).filter(Boolean);
      if (!stops.length) continue;
      bg = bgOf(clipHost.parentElement || clipHost, 0);
      cr = Infinity;
      stops.forEach(function (c) { c.a *= op; var sv = over(c, bg.c), r0 = ratio(sv, bg.c); if (r0 < cr) { cr = r0; seen = sv; fg = c; } });
    } else {
      bg = bgOf(el, 0);
      fg.a *= op;
      seen = over(fg, bg.c);
      cr = ratio(seen, bg.c);
    }
    if (cr < need) {
      fails.push({
        text: t.nodeValue.trim().slice(0, 48),
        where: describe(el),
        ratio: Math.round(cr * 100) / 100,
        need: need,
        photo: bg.photo,
        fg: clipHost ? 'gradient, weakest rgb(' + [fg.r, fg.g, fg.b].map(Math.round).join(', ') + ')' : cs.color,
        bg: 'rgb(' + [bg.c.r, bg.c.g, bg.c.b].map(Math.round).join(', ') + ')',
        op: Math.round(op * 100) / 100,
      });
    }
  }
  return { checked: checked, fails: fails };
})()

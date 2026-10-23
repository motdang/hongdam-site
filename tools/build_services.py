#!/usr/bin/env python3
"""Build the services list at hongdam.net/ (English) and /th/ (Thai) from data/services.json.

    python3 tools/build_services.py            prices for GitHub, PHP and bots read from live /api/*
    python3 tools/build_services.py --offline  those prices from data/services.live.json

Also writes functions/_services_data.js (the monthly Shoup walk's ladder, prices, floors,
ceilings and slots) and the services block of docs/llms.txt (between SERVICES markers).
An item with `baht` walks: its page price is {price}, read from /api/services. Items with a
fixed price (Nan's own, free, or the US$ call list) keep their text. `walk: "desk"` items are
walked by the Hongdam Desk bot, which posts its price to /api/services/price.
"""
import html
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(HERE, "data", "services.json")
LIVE_CACHE = os.path.join(HERE, "data", "services.live.json")
GRAPH = os.path.join(HERE, "data", "tasks", "graph.json")
WALK_JS = os.path.join(HERE, "functions", "_services_data.js")
DOCS = os.path.join(HERE, "docs")
LLMS = os.path.join(DOCS, "llms.txt")
SITE = "https://hongdam.net"
LINE_ID = "@964yxgnk"
LINE_URL = "https://line.me/R/ti/p/" + LINE_ID
MAIL = "nan@motdang.net"
E = html.escape

T = {
    "en": {
        "title": "Hongdam — services, Chiang Rai",
        "desc": "Errands and phone calls in Thai, translation, websites, servers, bots, data, design and writing, each with its price. Chiang Rai, Chiang Mai and online.",
        "other": ("th", "/th/", "ไทย"),
        "lead": "Errands, translation, websites, servers, bots, data, design and writing. In person in Chiang Rai and Chiang Mai; online anywhere.",
        "prices": "Prices in baht. A price with no unit is for one job. Most prices move on the 1st of each month with demand: a busy service goes up a step, a quiet one down. Pay by PromptPay from a Thai bank app, or by PayPal or Wise from anywhere.",
        "how": "Order: the form below · LINE <a href=\"{line}\">{lid}</a> · <a href=\"mailto:{mail}\">{mail}</a>",
        "contents": "Contents",
        "order": "Order", "book": "Book", "open": "Open", "buy": "Buy",
        "more": "More",
        "else_h": "Anything else",
        "else": "A job not on this page: post it on the <a href=\"/tasks\">task board</a>, or send the form. Sites and apps we have built: the <a href=\"/portfolio/\">portfolio</a>.",
        "order_h": "Order",
        "steps": ["Send the form, or write on LINE or by email.",
                  "We reply with the total and a date.",
                  "You pay by PromptPay, PayPal or Wise.",
                  "We do the work."],
        "f_service": "Service", "f_other": "Something else", "f_name": "Name", "f_email": "Email",
        "f_line": "LINE ID", "f_what": "What you need", "f_hp": "Leave this empty", "f_send": "Send",
        "f_need": "An email address or a LINE ID, please.",
        "f_ok": "Sent. We reply by email or LINE.", "f_fail": "Did not send. Write to " + MAIL + " or LINE " + LINE_ID + ".",
        "f_busy": "Sending…",
        "foot": "Hongdam หงส์ดำ · Chiang Rai",
    },
    "th": {
        "title": "หงส์ดำ — บริการ เชียงราย",
        "desc": "ธุระและโทรแทน แปลภาษา เว็บไซต์ เซิร์ฟเวอร์ บอท ข้อมูล ออกแบบ และงานเขียน พร้อมราคาทุกงาน เชียงราย เชียงใหม่ และออนไลน์",
        "other": ("en", "/", "English"),
        "lead": "ธุระ แปลภาษา เว็บไซต์ เซิร์ฟเวอร์ บอท ข้อมูล ออกแบบ และงานเขียน ไปถึงที่ในเชียงรายและเชียงใหม่ งานออนไลน์ทำได้ทุกที่",
        "prices": "ราคาเป็นบาท ราคาที่ไม่มีหน่วยคือราคาต่องาน ราคาส่วนใหญ่ปรับทุกวันที่ 1 ตามความต้องการ บริการที่มีคนสั่งมากขึ้นหนึ่งขั้น บริการที่เงียบลงหนึ่งขั้น จ่ายด้วยพร้อมเพย์จากแอปธนาคารไทย หรือ PayPal หรือ Wise จากที่ไหนก็ได้",
        "how": "สั่งงาน: แบบฟอร์มด้านล่าง · ไลน์ <a href=\"{line}\">{lid}</a> · <a href=\"mailto:{mail}\">{mail}</a>",
        "contents": "สารบัญ",
        "order": "สั่ง", "book": "จอง", "open": "เปิด", "buy": "ซื้อ",
        "more": "อ่านต่อ",
        "else_h": "งานอื่น ๆ",
        "else": "งานที่ไม่มีในหน้านี้ ลงประกาศใน<a href=\"/tasks\">กระดานงาน</a> หรือส่งแบบฟอร์ม เว็บและแอปที่เราสร้าง: <a href=\"/portfolio/\">ผลงาน</a>",
        "order_h": "สั่งงาน",
        "steps": ["ส่งแบบฟอร์ม หรือทักทางไลน์หรืออีเมล",
                  "เราตอบกลับพร้อมยอดรวมและวันที่",
                  "คุณจ่ายด้วยพร้อมเพย์ PayPal หรือ Wise",
                  "เราลงมือทำงาน"],
        "f_service": "บริการ", "f_other": "อย่างอื่น", "f_name": "ชื่อ", "f_email": "อีเมล",
        "f_line": "ไลน์ไอดี", "f_what": "ต้องการอะไร", "f_hp": "เว้นช่องนี้ว่างไว้", "f_send": "ส่ง",
        "f_need": "กรุณาใส่อีเมลหรือไลน์ไอดี",
        "f_ok": "ส่งแล้ว เราตอบกลับทางอีเมลหรือไลน์", "f_fail": "ส่งไม่สำเร็จ เขียนถึง " + MAIL + " หรือไลน์ " + LINE_ID,
        "f_busy": "กำลังส่ง…",
        "foot": "หงส์ดำ Hongdam · เชียงราย",
    },
}

CSS = """
body{font:1.125rem/1.55 system-ui,-apple-system,"Segoe UI","Noto Sans Thai","Thonburi",sans-serif;max-width:44rem;margin:0 auto;padding:1rem;background:Canvas;color:CanvasText}
h1{font-size:1.6rem;margin:.5rem 0}
h2{font-size:1.3rem;margin:2.5rem 0 .5rem}
ul.s{list-style:none;margin:0;padding:0}
ul.s li{padding:.7rem 0;border-top:1px solid GrayText}
ul.s p{margin:.2rem 0 0}
.p{font-weight:700}
nav ul{padding-left:1.2rem}
label{display:block;margin:.8rem 0 0}
input,select,textarea{display:block;width:100%;box-sizing:border-box;font:inherit;padding:.4rem}
button{font:inherit;padding:.5rem 1.5rem;margin-top:1rem}
.hp{position:absolute;left:-9999px}
"""

SCRIPT = """
(function(){
var live=[].slice.call(document.querySelectorAll('[data-live]')),seen={};
live.forEach(function(e){var a=e.getAttribute('data-live').split('/')[0];if(seen[a])return;seen[a]=1;
fetch('/api/'+a).then(function(r){return r.ok?r.json():null}).then(function(j){if(!j||!j.kinds)return;var by={};j.kinds.forEach(function(k){by[k.id]=k});
live.forEach(function(x){var p=x.getAttribute('data-live').split('/');if(p[0]!==a||!by[p[1]])return;var k=by[p[1]];
x.textContent=k.unit==='%'?k.price+'%':'\\u0e3f'+Number(k.baht).toLocaleString('en-US')})}).catch(function(){})});
var f=document.getElementById('f'),sel=f.elements.service,msg=document.getElementById('msg');
document.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('a[data-s]');if(a)sel.value=a.getAttribute('data-s')});
var q=(location.search.match(/[?&]s=([\\w-]+)/)||[])[1];if(q)sel.value=q;
f.addEventListener('submit',function(ev){ev.preventDefault();var d=f.elements;
if(!d.email.value.trim()&&!d.line.value.trim()){msg.textContent=f.getAttribute('data-need');return}
msg.textContent=f.getAttribute('data-busy');
fetch('/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
service:sel.options[sel.selectedIndex].text,svc:sel.value==='other'?'':sel.value,name:d.name.value,email:d.email.value,line:d.line.value,message:d.message.value,website:d.website.value,page:location.pathname})})
.then(function(r){return r.json()}).then(function(j){msg.textContent=j.ok?f.getAttribute('data-ok'):(j.error||f.getAttribute('data-fail'));if(j.ok)f.reset()})
.catch(function(){msg.textContent=f.getAttribute('data-fail')})});
})();
"""


def money(n):
    return "฿{:,}".format(n)


def walking(data):
    return [it for s in data["sections"] for it in s.get("items", []) if "baht" in it or "pct" in it]


def opening_of(it):
    return "%d%%" % it["pct"] if "pct" in it else money(it["baht"])


def live_prices(data, offline):
    opening = {"services/" + it["id"]: opening_of(it) for it in walking(data)}
    if offline:
        cache = json.load(open(LIVE_CACHE, encoding="utf-8"))
        return {**opening, **cache}
    out = {}
    try:
        with urllib.request.urlopen(urllib.request.Request(SITE + "/api/services", headers={"user-agent": "hongdam-build"}), timeout=20) as r:
            for k in json.load(r)["kinds"]:
                if "services/" + k["id"] in opening:
                    out["services/" + k["id"]] = ("%d%%" % k["price"]) if k.get("unit") == "%" else money(k["baht"])
    except Exception as e:  # not published yet: opening prices
        print("  · /api/services not read (%s); opening prices" % e)
    for api in ("github", "php", "bots"):
        req = urllib.request.Request(SITE + "/api/" + api, headers={"user-agent": "hongdam-build"})
        with urllib.request.urlopen(req, timeout=20) as r:
            for k in json.load(r)["kinds"]:
                out[api + "/" + k["id"]] = (str(k["price"]) + "%") if k.get("unit") == "%" else money(k["baht"])
    json.dump(out, open(LIVE_CACHE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return {**opening, **out}


def check(data, graph):
    nodes = {n["id"]: n for n in graph["nodes"]}
    bad = []
    for it in walking(data):
        pct = "pct" in it
        ladder, o = (data["pct_ladder"], "pct") if pct else (data["ladder"], "baht")
        for f in (o, "floor", "ceiling"):
            if it.get(f) not in ladder:
                bad.append("%s: %s %s is not on the ladder" % (it["id"], f, it.get(f)))
        if not it.get("floor", 0) <= it[o] <= it.get("ceiling", 0):
            bad.append("%s: opening price outside floor and ceiling" % it["id"])
        if not isinstance(it.get("slots"), int) or it["slots"] < 1:
            bad.append("%s: slots a month missing" % it["id"])
        if "{price}" not in it["p_en"] or "{price}" not in it["p_th"]:
            bad.append("%s: walks but its price text has no {price}" % it["id"])
    for s in data["sections"]:
        for k in s.get("list", []):
            if k not in nodes:
                bad.append("%s: no task-graph node %s" % (s["id"], k))
        for it in s.get("items", []):
            k = it.get("kind")
            if not k:
                continue
            if k not in nodes:
                bad.append("%s: no task-graph node %s" % (it["id"], k))
                continue
    return bad


def walk_js(data):
    svcs = {it["id"]: {"open": it.get("baht", it.get("pct")), "floor": it["floor"], "ceiling": it["ceiling"], "slots": it["slots"],
                       **({"pct": True} if "pct" in it else {}),
                       **({"walk": it["walk"]} if it.get("walk") else {})} for it in walking(data)}
    return ("// Written by tools/build_services.py from data/services.json; changes go there.\n"
            "export const LADDER = %s\nexport const PCT_LADDER = %s\nexport const OPENED = %s\nexport const SERVICES = %s\n"
            % (json.dumps(data["ladder"]), json.dumps(data["pct_ladder"]), json.dumps(data["opened"]), json.dumps(svcs, indent=1)))


def price_html(it, lang, live):
    p = it["p_" + lang]
    if "{price}" in p:
        key = it.get("live") or "services/" + it["id"]
        p = E(p).replace("{price}", '<span data-live="%s">%s</span>' % (E(key), E(live[key])))
        return p
    return E(p)


def item_html(it, lang, live):
    t = T[lang]
    name = E(it[lang])
    act = it.get("act")
    if it.get("href") and not act:
        name = '<a href="%s">%s</a>' % (E(it["href"]), name)
    if act:
        action = '<a href="%s">%s</a>' % (E(it["href"]), t[act])
    else:
        action = '<a href="#order" data-s="%s">%s</a>' % (E(it["id"]), t["order"])
    return ('<li id="%s"><b>%s</b> · <span class="p">%s</span><p>%s %s</p></li>'
            % (E(it["id"]), name, price_html(it, lang, live), E(it["d_" + lang]), action))


def page(data, graph, lang, live):
    t = T[lang]
    nodes = {n["id"]: n for n in graph["nodes"]}
    olang, ohref, olabel = t["other"]
    canon = SITE + ("/" if lang == "en" else "/th/")
    out = []
    w = out.append
    w('<!doctype html>\n<html lang="%s">\n<head>\n<meta charset="utf-8">\n'
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
      '<meta name="color-scheme" content="light dark">\n' % lang)
    w('<title>%s</title>\n<meta name="description" content="%s">\n' % (E(t["title"]), E(t["desc"])))
    w('<link rel="canonical" href="%s">\n' % canon)
    w('<link rel="alternate" hreflang="en" href="%s/">\n<link rel="alternate" hreflang="th" href="%s/th/">\n' % (SITE, SITE))
    w('<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">\n')
    w('<meta property="og:type" content="website">\n<meta property="og:url" content="%s">\n'
      '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n'
      '<meta property="og:image" content="%s/assets/card.jpg">\n<meta name="twitter:card" content="summary_large_image">\n'
      % (canon, E(t["title"]), E(t["desc"]), SITE))
    w('<style>%s</style>\n</head>\n<body>\n' % CSS.strip())
    w('<header>\n<p><a href="%s" lang="%s" hreflang="%s">%s</a></p>\n' % (ohref, olang, olang, olabel))
    w('<h1>Hongdam หงส์ดำ</h1>\n<p>%s</p>\n<p>%s</p>\n<p>%s</p>\n'
      % (E(t["lead"]), E(t["prices"]), t["how"].format(line=LINE_URL, lid=LINE_ID, mail=MAIL)))
    w('<nav aria-label="%s"><ul>\n' % t["contents"])
    for s in data["sections"]:
        w('<li><a href="#%s">%s</a></li>\n' % (s["id"], E(s[lang])))
    w('<li><a href="#else">%s</a></li>\n<li><a href="#order">%s</a></li>\n</ul></nav>\n</header>\n<main>\n'
      % (E(t["else_h"]), E(t["order_h"])))
    for s in data["sections"]:
        w('<section>\n<h2 id="%s">%s</h2>\n' % (s["id"], E(s[lang])))
        if s.get("list"):
            w('<p>%s <a href="%s">%s</a></p>\n<ul>\n' % (E(s["note_" + lang]), E(s["href"]), E(s["href"].split("//")[1].rstrip("/"))))
            for k in s["list"]:
                w('<li>%s</li>\n' % E(nodes[k][lang]))
            w('</ul>\n')
        else:
            if s.get("note_" + lang):
                w('<p>%s</p>\n' % E(s["note_" + lang]))
            w('<ul class="s">\n')
            for it in s["items"]:
                w(item_html(it, lang, live) + "\n")
            w('</ul>\n')
        w('</section>\n')
    w('<section>\n<h2 id="else">%s</h2>\n<p>%s</p>\n</section>\n' % (E(t["else_h"]), t["else"]))
    w('<section>\n<h2 id="order">%s</h2>\n<ol>\n' % E(t["order_h"]))
    for st in t["steps"]:
        w('<li>%s</li>\n' % E(st))
    w('</ol>\n')
    w('<form id="f" action="/api/contact" method="post" data-need="%s" data-busy="%s" data-ok="%s" data-fail="%s">\n'
      % (E(t["f_need"]), E(t["f_busy"]), E(t["f_ok"]), E(t["f_fail"])))
    w('<label>%s<select name="service">\n' % E(t["f_service"]))
    for s in data["sections"]:
        if not s.get("items"):
            continue
        w('<optgroup label="%s">\n' % E(s[lang]))
        for it in s["items"]:
            w('<option value="%s">%s</option>\n' % (E(it["id"]), E(it[lang])))
        w('</optgroup>\n')
    w('<option value="other">%s</option>\n</select></label>\n' % E(t["f_other"]))
    w('<label>%s<input name="name" autocomplete="name" maxlength="120"></label>\n' % E(t["f_name"]))
    w('<label>%s<input name="email" type="email" autocomplete="email" maxlength="200"></label>\n' % E(t["f_email"]))
    w('<label>%s<input name="line" maxlength="80"></label>\n' % E(t["f_line"]))
    w('<label>%s<textarea name="message" rows="5" maxlength="4000" required></textarea></label>\n' % E(t["f_what"]))
    w('<label class="hp" aria-hidden="true">%s<input name="website" tabindex="-1" autocomplete="off"></label>\n' % E(t["f_hp"]))
    w('<button type="submit">%s</button>\n<p id="msg" role="status"></p>\n</form>\n</section>\n</main>\n' % E(t["f_send"]))
    w('<footer>\n<p>%s · <a href="/portfolio/">%s</a> · <a href="/llms.txt">llms.txt</a></p>\n</footer>\n'
      % (E(t["foot"]), "Portfolio" if lang == "en" else "ผลงาน"))
    w('<script>%s</script>\n</body>\n</html>\n' % SCRIPT.strip())
    return "".join(out)


def llms_block(data, graph, live):
    nodes = {n["id"]: n for n in graph["nodes"]}
    out = ["<!-- SERVICES:START -->", "## Services", "",
           "Prices in Thai baht; a price with no unit is for one job. Order through the form at",
           "https://hongdam.net/#order, LINE %s, or %s." % (LINE_ID, MAIL)]
    for s in data["sections"]:
        out += ["", "### " + s["en"]]
        if s.get("note_en") and not s.get("list"):
            out.append(s["note_en"])
        if s.get("list"):
            out.append(s["note_en"] + " " + s["href"])
            out += ["- " + nodes[k]["en"] for k in s["list"]]
            continue
        for it in s["items"]:
            p = it["p_en"].replace("{price}", live.get(it.get("live") or "services/" + it["id"], ""))
            line = "- %s — %s. %s" % (it["en"], p, it["d_en"])
            if it.get("href"):
                href = it["href"] if it["href"].startswith("http") else SITE + it["href"]
                line += " " + href
            out.append(line)
    out += ["", "Prices move with demand (Donald Shoup's rule for parking). The services list moves",
            "monthly: on the 1st, a service ordered over 80% of its slots last month goes one step up",
            "the ladder, under 60% one step down, within its floor and ceiling; current prices at",
            "https://hongdam.net/api/services. GitHub, PHP fix and bot prices move each Monday by",
            "bookings: /api/github, /api/php, /api/bots.", "<!-- SERVICES:END -->"]
    return "\n".join(out)


def main():
    offline = "--offline" in sys.argv
    data = json.load(open(DATA, encoding="utf-8"))
    graph = json.load(open(GRAPH, encoding="utf-8"))
    bad = check(data, graph)
    if bad:
        for b in bad:
            print("  !", b)
        return 1
    live = live_prices(data, offline)
    open(WALK_JS, "w", encoding="utf-8").write(walk_js(data))
    missing = [it["live"] for s in data["sections"] for it in s.get("items", []) if it.get("live") and it["live"] not in live]
    if missing:
        print("  ! no live price for", ", ".join(missing))
        return 1
    os.makedirs(os.path.join(DOCS, "th"), exist_ok=True)
    for lang, path in (("en", "index.html"), ("th", os.path.join("th", "index.html"))):
        open(os.path.join(DOCS, path), "w", encoding="utf-8").write(page(data, graph, lang, live))
    txt = open(LLMS, encoding="utf-8").read()
    a, b = txt.index("<!-- SERVICES:START -->"), txt.index("<!-- SERVICES:END -->") + len("<!-- SERVICES:END -->")
    open(LLMS, "w", encoding="utf-8").write(txt[:a] + llms_block(data, graph, live) + txt[b:])
    n = sum(len(s.get("items", [])) for s in data["sections"])
    print("%d services in %d groups · docs/index.html, docs/th/index.html, llms.txt" % (n, len(data["sections"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())

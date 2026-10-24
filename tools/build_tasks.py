#!/usr/bin/env python3
"""Build the task board's graph and seed from data/tasks/.

    python3 tools/build_tasks.py            # write the files below
    python3 tools/build_tasks.py --seed     # also load seed.sql into D1 (remote)
    python3 tools/build_tasks.py --new      # categories posters named that the graph lacks

Writes:
  functions/api/_taskgraph.js   the graph the board's functions read
  docs/tasks/graph.json         nodes and typed edges, for anyone
  docs/tasks/graph/index.html   the graph, drawn
  data/tasks/seed.sql           our postings and the asks from elsewhere, by key

data/tasks/fb-groups.json holds job posts copied from Facebook groups by the
fb-groups reader (~/Developer/claude code projects/fb-groups); they load with the
asks from elsewhere and close 30 days after the post.

A new kind of work is one line in data/tasks/graph.json; this checks it.
"""
import html
import json
import math
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "tasks"
DOCS = ROOT / "docs" / "tasks"
FN = ROOT / "functions" / "api" / "_taskgraph.js"
DB = "hongdam-tasks"
SEED_DAY = "2026-10-16T00:00:00.000Z"
BY = {"robot", "human", "both"}


def load():
    g = json.loads((DATA / "graph.json").read_text())
    ids = [n["id"] for n in g["nodes"]]
    assert len(ids) == len(set(ids)), "duplicate node id"
    known = set(ids)
    for n in g["nodes"]:
        assert n.get("up") is None or n["up"] in known, f"{n['id']}: no group {n.get('up')}"
        assert n["by"] in BY, n
        assert n.get("en") and n.get("th"), n
        for o in n["who"]:
            assert o in g["orgs"], f"{n['id']}: no org {o}"
        for r in n.get("rel", []):
            assert r in known, f"{n['id']}: related to unknown {r}"
        p = n.get("price")
        if n.get("up"):
            assert p and len(p) == 1 and next(iter(p)) in {"baht", "her", "quote", "free", "trade"}, n
            if "baht" in p:
                assert p["baht"] in g["ladder"], f"{n['id']}: ฿{p['baht']} is not a rung"
    return g


def edges(g):
    out = []
    for n in g["nodes"]:
        if n.get("up"):
            out.append({"s": n["id"], "t": n["up"], "type": "part_of"})
        for o in n["who"]:
            out.append({"s": n["id"], "t": o, "type": "answered_by"})
        out.append({"s": n["id"], "t": n["by"], "type": "done_by"})
        for r in n.get("rel", []):
            out.append({"s": n["id"], "t": r, "type": "related"})
    return out


def write_js(g):
    slim = {"orgs": g["orgs"], "ladder": g["ladder"], "nodes": g["nodes"]}
    FN.write_text("// Written by tools/build_tasks.py from data/tasks/graph.json. Edit the JSON.\n"
                  f"export const GRAPH = {json.dumps(slim, ensure_ascii=False)}\n")


def write_json(g):
    DOCS.mkdir(parents=True, exist_ok=True)
    nodes = [{"id": k, "type": "org", "en": v["en"], "th": v["th"], "href": v["href"]} for k, v in g["orgs"].items()]
    nodes += [{"id": k, "type": "worker", "en": k} for k in sorted(BY)]
    for n in g["nodes"]:
        nodes.append({"id": n["id"], "type": "category" if n.get("up") else "group", "en": n["en"], "th": n["th"],
                      "price": n.get("price"), "href": n.get("href"),
                      "page": f"https://hongdam.net/tasks/c/{n['id']}"})
    doc = {"name": "Hongdam task graph", "ladder_baht": g["ladder"],
           "grows": "POST https://hongdam.net/api/tasks with a category the graph lacks; new names are listed at /api/tasks/new",
           "nodes": nodes, "edges": edges(g)}
    (DOCS / "graph.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1))


# ── the drawing ─────────────────────────────────────────────────────────────
# a dot's colour comes from its class (by-robot, by-human, by-both) in docs/assets/pages.css, light and dark


def svg(g):
    e = html.escape
    roots = [n for n in g["nodes"] if not n.get("up")]
    kids = {r["id"]: [n for n in g["nodes"] if n.get("up") == r["id"]] for r in roots}
    total = sum(len(v) + 2 for v in kids.values())
    W, C, R1, R2 = 1800, 900, 470, 720
    pos, parts, a = {}, [], -math.pi / 2
    for r in roots:
        span = 2 * math.pi * (len(kids[r["id"]]) + 2) / total
        mid = a + span / 2
        pos[r["id"]] = (C + R1 * math.cos(mid), C + R1 * math.sin(mid), mid)
        ks = kids[r["id"]]
        for i, k in enumerate(ks):
            t = a + span * (i + 1.5) / (len(ks) + 2)
            pos[k["id"]] = (C + R2 * math.cos(t), C + R2 * math.sin(t), t)
        a += span
    for n in g["nodes"]:
        for rel in n.get("rel", []):
            (x1, y1, _), (x2, y2, _) = pos[n["id"]], pos[rel]
            parts.append(f'<path class="rel" d="M{x1:.0f},{y1:.0f} Q{C},{C} {x2:.0f},{y2:.0f}"/>')
    for r in roots:
        x, y, _ = pos[r["id"]]
        parts.append(f'<line class="up" x1="{C}" y1="{C}" x2="{x:.0f}" y2="{y:.0f}"/>')
        for k in kids[r["id"]]:
            kx, ky, _ = pos[k["id"]]
            parts.append(f'<line class="up" x1="{x:.0f}" y1="{y:.0f}" x2="{kx:.0f}" y2="{ky:.0f}"/>')
    for n in g["nodes"]:
        x, y, t = pos[n["id"]]
        href = f"/tasks/c/{n['id']}"
        if n.get("up"):
            deg = math.degrees(t)
            flip = 90 < (deg % 360) < 270
            rot = deg + 180 if flip else deg
            anchor = "end" if flip else "start"
            dx = -12 if flip else 12
            parts.append(f'<a href="{href}"><circle class="by-{n["by"]}" cx="{x:.0f}" cy="{y:.0f}" r="7"/>'
                         f'<text class="leaf" transform="translate({x:.0f},{y:.0f}) rotate({rot:.1f})" x="{dx}" dy="5" '
                         f'text-anchor="{anchor}">{e(n["en"])}</text><title>{e(n["th"])}</title></a>')
        else:
            deg = math.degrees(t)
            flip = 90 < (deg % 360) < 270
            rot = deg + 180 if flip else deg
            parts.append(f'<a href="{href}"><circle class="root by-{n["by"]}" cx="{x:.0f}" cy="{y:.0f}" r="14"/>'
                         f'<text class="root" transform="translate({x:.0f},{y:.0f}) rotate({rot:.1f})" x="{18 if flip else -18}" dy="7" '
                         f'text-anchor="{"start" if flip else "end"}">{e(n["en"])}</text><title>{e(n["th"])}</title></a>')
    parts.append(f'<circle class="hub" cx="{C}" cy="{C}" r="44"/>'
                 f'<text class="leaf" x="{C}" y="{C + 6}" text-anchor="middle">งาน · Tasks</text>')
    js_pos = {k: [round(v[0]), round(v[1]), round(v[2], 3)] for k, v in pos.items()}
    return (f'<svg id="g" viewBox="-260 -60 {W + 520} {W + 120}" role="img" aria-label="Task graph">'
            + "".join(parts) + '<g id="new"></g></svg>', js_pos)


def write_page(g):
    e = html.escape
    drawing, js_pos = svg(g)
    roots = [n for n in g["nodes"] if not n.get("up")]
    groups = []
    for r in roots:
        ks = [n for n in g["nodes"] if n.get("up") == r["id"]]
        lis = "".join(f'<li><a href="/tasks/c/{k["id"]}">{e(k["en"])}</a> <span lang="th">{e(k["th"])}</span>'
                      f' <i class="by-{k["by"]}">{k["by"]}</i></li>' for k in ks)
        groups.append(f'<section class="grp"><h2><a href="/tasks/c/{r["id"]}">{e(r["en"])}</a> <span lang="th">{e(r["th"])}</span></h2><ul>{lis}</ul></section>')
    n_cat = sum(1 for n in g["nodes"] if n.get("up"))
    import sys
    sys.path.insert(0, str(ROOT / "tools"))
    import pages as F
    desc = f"{len(roots)} groups and {n_cat} kinds of work that Mot Dang, Hongdam and Chiang Mai Visa Desk can do, as a graph that grows when people who post tasks name new kinds of work."
    main = f"""<main>
{F.lead("tasks-graph", "en", h1="Task graph", sub="กราฟงาน").rstrip()}
<p class="lede">{len(roots)} groups, {n_cat} kinds of work. Tap a dot to see the tasks of that kind.<br><span lang="th">{len(roots)} กลุ่ม {n_cat} ประเภทงาน แตะจุดเพื่อดูงาน</span></p>
<div class="acts"><a class="btn" href="/tasks#post">Post a task · ลงงาน</a><a class="btn alt" href="/tasks#ours">Take a task · รับงาน</a></div>
{drawing}
<div class="key"><span><b class="by-robot"></b>done by a bot · บอท</span><span><b class="by-human"></b>done by a person · คน</span><span><b class="by-both"></b>done by either · ทั้งสอง</span><span>dashed line: related kinds · เกี่ยวข้อง</span><span>◌ a kind named by someone who posted a task · ผู้ลงงานตั้งชื่อ</span></div>
<p id="newlist"></p>
<div class="grps">{''.join(groups)}</div>
<p class="note"><a href="/tasks/graph.json">graph.json</a> · this graph as data, for programmers (nodes and typed edges: part_of, answered_by, done_by, related)</p>
</main>
<script>
(function () {{
  var P = {json.dumps(js_pos)}, NS = 'http://www.w3.org/2000/svg';
  fetch('/api/tasks/new').then(function (r) {{ return r.json() }}).then(function (d) {{
    var g = document.getElementById('new'), seen = {{}}, names = [];
    (d.new || []).forEach(function (n, i) {{
      var p = P[n.up] || [900, 900, 0], k = (seen[n.up] = (seen[n.up] || 0) + 1);
      var t = p[2] + 0.06 * k, x = 900 + 820 * Math.cos(t), y = 900 + 820 * Math.sin(t);
      var a = document.createElementNS(NS, 'a'); a.setAttribute('href', '/tasks/' + n.task); a.setAttribute('class', 'new');
      a.innerHTML = '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + x + '" y2="' + y + '" stroke-dasharray="4 4"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="7"/>';
      var tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', x + 12); tx.setAttribute('y', y + 5); tx.textContent = n.name;
      a.appendChild(tx); g.appendChild(a); names.push(n.name);
    }});
    if (names.length) document.getElementById('newlist').textContent = 'Kinds named by people who posted tasks · ผู้ลงงานตั้งชื่อ: ' + names.join(' · ');
  }}).catch(function () {{}});
}})();
</script>
"""
    page = (F.head("tasks-graph", "en", "Task graph · Hongdam", desc, "tasks/graph/",
                   extra='<link rel="alternate" type="application/json" href="/tasks/graph.json">') +
            F.body("tasks-graph") + F.top("en") + main + F.foot("tasks-graph", "en"))
    (DOCS / "graph").mkdir(parents=True, exist_ok=True)
    (DOCS / "graph" / "index.html").write_text(page)


# ── the seed ────────────────────────────────────────────────────────────────
def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def write_seed(g):
    s = json.loads((DATA / "seed.json").read_text())
    cats = {n["id"]: n for n in g["nodes"]}
    names = {k: v["en"] for k, v in g["orgs"].items()}
    rows = []
    cols = ("key,src,org,poster,cat,by,title,title_th,what,what_th,place,href,site,price_kind,baht,"
            "price_note,unit,slots,state,created_at,shoup_at,ends_at")
    for o in s["ours"]:
        assert o["cat"] in cats, o["key"]
        mirror = o.get("mirror")
        assert mirror or o["baht"] in g["ladder"], f"{o['key']}: ฿{o['baht']} is not a rung"
        by = {"both": "either"}.get(o["by"], o["by"])
        note = json.dumps({"en": mirror, "th": o.get("mirror_th")}, ensure_ascii=False) if mirror else None
        rows.append((o["key"], "ours", o["org"], names[o["org"]], o["cat"], by, o["en"], o["th"], o["what_en"],
                     o["what_th"], o.get("where"), o.get("href"), None, "mirror" if mirror else "shoup",
                     o["baht"], note, o.get("unit"), o.get("slots", 3), "open", SEED_DAY, SEED_DAY,
                     (o["ends"] + "T23:59:59.000Z") if o.get("ends") else None))
    fb = DATA / "fb-groups.json"
    s["elsewhere"] += json.loads(fb.read_text()) if fb.exists() else []
    for o in s["elsewhere"]:
        assert o["cat"] in cats, o["key"]
        by = {"both": "either"}.get(o["by"], o["by"])
        at = (o["at"] + "T00:00:00.000Z") if o.get("at") else SEED_DAY
        rows.append((o["key"], "elsewhere", None, o.get("poster") or o["site"], o["cat"], by, o["en"], o.get("th"),
                     o.get("what_en"), o.get("what_th"), o.get("where"), o["href"], o["site"], "none", None, None,
                     None, 3, "open", at, None, (o["ends"] + "T23:59:59.000Z") if o.get("ends") else None))
    sql = ["-- Written by tools/build_tasks.py from data/tasks/seed.json."]
    for r in rows:
        sql.append(f"INSERT OR IGNORE INTO task ({cols}) VALUES ({','.join(q(v) for v in r)});")
    for o in s["elsewhere"]:
        c = cats[o["cat"]]
        baht = c["price"].get("baht")
        for org in c["who"]:
            sql.append("INSERT INTO answer (task_id, org, kind, name, baht, created_at) "
                       f"SELECT id, {q(org)}, 'offer', {q(names[org])}, {q(baht)}, {q(SEED_DAY)} FROM task "
                       f"WHERE key = {q(o['key'])} AND NOT EXISTS (SELECT 1 FROM answer a WHERE a.task_id = task.id AND a.org = {q(org)});")
    (DATA / "seed.sql").write_text("\n".join(sql) + "\n")
    return len(rows)


def main():
    g = load()
    write_js(g)
    write_json(g)
    write_page(g)
    n = write_seed(g)
    cats = sum(1 for x in g["nodes"] if x.get("up"))
    print(f"graph: {len(g['nodes']) - cats} groups, {cats} categories, {len(edges(g))} edges · seed: {n} tasks")
    if "--seed" in sys.argv:
        subprocess.run(["npx", "wrangler@3", "d1", "execute", DB, "--remote", "--file", str(DATA / "seed.sql")], check=True)
    if "--new" in sys.argv:
        import urllib.request
        print(urllib.request.urlopen("https://hongdam.net/api/tasks/new").read().decode())


if __name__ == "__main__":
    main()

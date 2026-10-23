"""Local preview of the new hongdam.net shop: serves docs/ and answers /api/* with stand-ins,
so the Buy, pay and order-tracker steps can be tried before /api/services and /api/buy are live.
Live GitHub, PHP and bot prices are fetched from hongdam.net. Orders here are not real;
/buy/?ref=HD-DEMO1 shows a paid order.

    python3 dev/mock_server.py 8988      then open http://localhost:8988
"""
import json
import os
import random
import sys
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, "..")
DOCS = os.path.join(SITE, "docs")
SVC = json.load(open(os.path.join(SITE, "data", "services.json"), encoding="utf-8"))
SHOP = json.load(open(os.path.join(SITE, "data", "shop.json"), encoding="utf-8"))
ITEMS = {it["id"]: it for s in SVC["sections"] for it in s.get("items", [])}
OPTS = {c["id"]: c for c in SHOP["cards"]}
ORDERS = {}


def kinds():
    out = []
    for i, it in ITEMS.items():
        if "pct" in it:
            out.append({"id": i, "unit": "%", "price": it["pct"]})
        elif "baht" in it:
            k = {"id": i, "baht": it["baht"], "price": it["baht"]}
            if "floor" in it:   # stand-in bookings this month, the same on every load
                k.update(floor=it["floor"], ceiling=it["ceiling"], slots=it.get("slots", 0), orders=sum(map(ord, i)) % (it.get("slots", 0) + 1))
            out.append(k)
    return out


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=DOCS, **k)

    def send(self, obj, code=200):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        p = self.path.split("?")[0]
        if p == "/api/services":
            return self.send({"kinds": kinds()})
        if p in ("/api/php", "/api/github", "/api/bots"):
            try:
                with urllib.request.urlopen("https://hongdam.net" + p, timeout=10) as r:
                    return self.send(json.load(r))
            except Exception:
                return self.send({"kinds": []})
        if p == "/api/buy":
            return self.send({"slip": True})
        if p.startswith("/api/buy/HD-"):   # the order tracker; HD-DEMO… shows a paid Plumber order
            ref = p.rsplit("/", 1)[1]
            o = ORDERS.get(ref) or ({"card": "trades", "opt": "trades", "state": "paid"} if ref.startswith("HD-DEMO") else None)
            if not o:
                return self.send({"ok": False, "why": "ref"}, 404)
            return self.send({"ok": True, "ref": ref, "card": o["card"], "opt": o["opt"], "state": o["state"]})
        return super().do_GET()

    def do_POST(self):
        p = self.path.split("?")[0]
        n = int(self.headers.get("content-length") or 0)
        body = self.rfile.read(n)
        if p == "/api/buy":
            b = json.loads(body or b"{}")
            c = OPTS.get(b.get("card"))
            if not c or c.get("act") != "buy":
                return self.send({"ok": False, "why": "card"}, 400)
            if len(str(b.get("contact", "")).strip()) < 3:
                return self.send({"ok": False, "why": "contact"}, 400)
            o = next((x for x in c["opts"] if x["i"] == b.get("opt")), c["opts"][0])
            q = max(1, int(b.get("qty") or 1)) if o.get("u") else 1
            pr = o.get("price") or {}
            cur = "THB"
            if "tier" in pr:
                t = pr["tier"][0] + max(0, q - pr["tier"][1]) * pr["tier"][2]
            elif "usd" in pr:
                t, cur = pr["usd"] * q, "USD"
            else:
                t = (pr.get("fixed") or ITEMS[o["i"]]["baht"]) * q
            if b.get("addon") and c.get("add"):
                t += c["add"]["fixed"] * q
            due = -(-t // 2) if t >= (300 if cur == "USD" else 10000) else t
            ref = "HD-%06X" % random.randrange(16 ** 6)
            ORDERS[ref] = {"due": due, "card": c["id"], "opt": o["i"], "state": "booked"}
            print("order", ref, b, t, due, cur, flush=True)
            return self.send({"ok": True, "ref": ref, "total": t, "due": due, "cur": cur, "qty": q, "half": due < t,
                              "pay": {**({"promptpay": "0988239210"} if cur == "THB" else {}),
                                      "paypal": "https://www.paypal.me/pfauhaus/%d%s" % (due, cur),
                                      "wise": "https://wise.com/pay/me/annikahonorahp", "line": "@964yxgnk",
                                      "usd": due if cur == "USD" else max(1, round(due / 33))}})
        if p == "/api/buy/slip":
            return self.send({"ok": False, "why": "unread"})
        if p == "/api/buy/claim":
            ref = json.loads(body or b"{}").get("ref")
            if ref in ORDERS:
                ORDERS[ref]["state"] = "claimed"
            return self.send({"ok": True, "state": "claimed"})
        if p == "/api/contact":
            return self.send({"ok": True})
        return self.send({"ok": False}, 404)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8988
    ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()

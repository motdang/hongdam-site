#!/usr/bin/env python3
"""Hongdam invoice pages: docs/invoice/<slug>/index.html, one per entry in data/invoices.json.

    python3 tools/build_invoice.py

Each page is unlisted (random slug, noindex) and carries its own pay links. It wears the shop's frame
(tools/pages.py), with the link card named in data/pages.json.
"""
import html, json, pathlib, segno, io

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "invoices.json"
OUT = ROOT / "docs" / "invoice"

PAYPAL = "https://www.paypal.me/pfauhaus"
BTC = "bc1qtgkvch2dgf9q5dwl2xfuseckyv6cqd2mlefjzz"
WISE = "https://wise.com/pay/me/annikahonorahp"

e = html.escape


def qr_svg(data):
    buf = io.BytesIO()
    segno.make(data, error="m").save(buf, kind="svg", scale=5, border=2,
                                    dark="#000", light="#fff", xmldecl=False, svgns=True)
    return buf.getvalue().decode()


def money(v):
    return f"US${v:,.2f}"


def page(inv):
    total = sum(i["amount"] for i in inv["items"])
    rows = "".join(
        f'<tr><td><b>{e(i["name"])}</b><span>{e(i.get("detail", ""))}</span></td>'
        f'<td class="n">{"no charge" if i["amount"] == 0 else money(i["amount"])}</td></tr>'
        for i in inv["items"])
    bill = "<br>".join(e(l) for l in inv["bill_to"])
    notes = "".join(f"<p>{e(n)}</p>" for n in inv.get("notes", []))
    ways = [f'<div class="way"><p><a class="btn big" href="{PAYPAL}" target="_blank" rel="noopener">Pay with PayPal</a></p>'
            f'<p>Enter {money(total)} and write <code>{e(inv["number"])}</code> as the reference.</p></div>']
    ln = inv.get("lightning")
    if ln:
        ways.append(
            f'<div class="way"><h3>Lightning</h3><div class="qr">{qr_svg("lightning:" + ln)}</div>'
            f'<p>{money(total)} in sats (small bitcoin units) at the exchange rate on the day you pay, to</p>'
            f'<p><code>{e(ln)}</code> <button data-copy="{e(ln)}">Copy</button></p>'
            f'<p><a class="btn alt" href="lightning:{e(ln)}">Open in a Lightning wallet</a></p></div>')
    ways.append(
        f'<div class="way"><h3>Bitcoin</h3><div class="qr">{qr_svg("bitcoin:" + BTC)}</div>'
        f'<p>{money(total)} in BTC (bitcoin) at the exchange rate on the day you pay, to</p>'
        f'<p><code>{BTC}</code> <button data-copy="{BTC}">Copy</button></p></div>')
    ways.append(
        f'<div class="way"><h3>Wise</h3><p>Pay by card or bank transfer, in most currencies: '
        f'<a href="{WISE}" target="_blank" rel="noopener">{WISE.removeprefix("https://")}</a></p></div>')
    import sys
    sys.path.insert(0, str(ROOT / "tools"))
    import pages as F
    title = f'Invoice {inv["number"]} · Hongdam'
    main = f"""<main class="inv">
{F.lead("invoice", "en", h1="Invoice " + inv["number"], sub="", with_back=False).rstrip()}
<div class="inv-head">
  <div><p class="label">Bill to</p><p>{bill}</p></div>
  <dl><dt>Invoice date</dt><dd>{e(inv["issued"])}</dd><dt>Pay by</dt><dd>{e(inv["due"])}</dd>
  <dt>From</dt><dd>Hongdam · beer@motdang.net</dd></dl>
</div>
<table class="lines">{rows}<tr class="total"><td>Total to pay</td><td class="n">{money(total)}</td></tr></table>
<div class="notes">{notes}</div>
<section>
<p class="label">Pay</p>
{"".join(ways)}
<p class="note">Reference <code>{e(inv["number"])}</code></p>
</section>
</main>
<script>
document.querySelectorAll('button[data-copy]').forEach(b=>b.onclick=()=>{{
  navigator.clipboard.writeText(b.dataset.copy).then(()=>{{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1500)}});
}});
</script>
"""
    return (F.head("invoice", "en", title, f'Invoice {inv["number"]} from Hongdam, Chiang Rai.',
                   extra='<meta name="robots" content="noindex,nofollow">') +
            F.body("invoice") + F.top("en") + main + F.foot("invoice", "en", bare=True))


def main():
    for inv in json.loads(DATA.read_text()):
        d = OUT / inv["slug"]
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(page(inv))
        print(f"https://hongdam.net/invoice/{inv['slug']}/")


if __name__ == "__main__":
    main()

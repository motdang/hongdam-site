#!/usr/bin/env python3
"""Hongdam invoice pages: docs/invoice/<slug>/index.html, one per entry in data/invoices.json.

    python3 tools/build_invoice.py

Each page is unlisted (random slug, noindex) and carries its own pay links. It wears the shop's frame
(tools/pages.py), with the link card named in data/pages.json.

A baht invoice ("currency": "THB", "promptpay": "<id>") shows a PromptPay QR for the exact amount and takes
the payment slip; /api/pay/invoice asks SlipOK about it, with the amount read from
functions/_invoices_data.js, which this build writes (her ask 2026-11-05, FERC's HD-FERC-2026-01).
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


def tlv(tag, v):
    return f"{tag}{len(v):02d}{v}"


def crc16(s):
    c = 0xFFFF
    for b in s.encode():
        c ^= b << 8
        for _ in range(8):
            c = ((c << 1) ^ 0x1021) if c & 0x8000 else (c << 1)
            c &= 0xFFFF
    return f"{c:04X}"


def promptpay(payee, baht):
    """EMVCo PromptPay payload for a phone number or a 13-digit tax ID, with the amount fixed."""
    acct = tlv("02", payee) if len(payee) == 13 else tlv("01", "0066" + payee.lstrip("0"))
    p = (tlv("00", "01") + tlv("01", "12") + tlv("29", tlv("00", "A000000677010111") + acct) +
         tlv("53", "764") + tlv("54", f"{baht:.2f}") + tlv("58", "TH") + "6304")
    return p + crc16(p)


CUR = "USD"


def money(v):
    return f"฿{v:,.2f}" if CUR == "THB" else f"US${v:,.2f}"


def baht_ways(inv, total):
    """PromptPay QR + slip upload, checked by SlipOK through /api/pay/invoice."""
    return [f'''<div class="way"><h3>PromptPay</h3><div class="qr">{qr_svg(promptpay(inv["promptpay"], total))}</div>
<p>Scan with any Thai banking app. The amount, {money(total)}, fills itself in, and the app shows the name the money goes to before you pay.</p>
<form id="slipf" data-slug="{e(inv["slug"])}" hidden><p><label>After paying, upload the payment slip (the receipt) from your banking app:<br>
<input type="file" name="slip" accept="image/*" required></label></p>
<p><button type="submit" class="btn big">Check my payment</button></p><p class="msg" role="status" aria-live="polite"></p></form>
<p id="slipmail">Then email the slip to <a href="mailto:{e(inv["mail"])}?subject={e(inv["number"])}">{e(inv["mail"])}</a> with <code>{e(inv["number"])}</code> in the subject.</p>
</div>''']


SLIP_JS = """
(()=>{const f=document.getElementById('slipf'),api='/api/pay/invoice',slug=f&&f.dataset.slug;if(!f)return;
const E={nofile:'Choose the picture of your payment slip first.',unread:'We cannot read a bank slip in that picture.',
amount:'The slip shows a different amount.',receiver:'The slip shows a different receiver.',used:'That slip was already used for a payment.',
late:'That slip is too old to check.',service:'The slip check is not answering. Try again in a minute, or email the slip.',ref:'We do not have this invoice.'};
fetch(api+'?slug='+encodeURIComponent(slug)).then(r=>r.json()).then(j=>{if(!j.on)return;f.hidden=false;
document.getElementById('slipmail').hidden=true;
f.onsubmit=async ev=>{ev.preventDefault();const m=f.querySelector('.msg'),file=f.slip.files[0];
if(!file){m.textContent=E.nofile;return}m.textContent='Checking…';const fd=new FormData();fd.append('slug',slug);fd.append('slip',file);
try{const r=await(await fetch(api,{method:'POST',body:fd})).json();
m.textContent=r.ok?'Paid. Thank you. Hongdam has the payment for '+r.ref+'.':(E[r.why]||E.unread)}catch{m.textContent=E.service}}}).catch(()=>{})})();
"""


def page(inv):
    global CUR
    CUR = inv.get("currency", "USD")
    total = sum(i["amount"] for i in inv["items"])
    rows = "".join(
        f'<tr><td><b>{e(i["name"])}</b><span>{e(i.get("detail", ""))}</span></td>'
        f'<td class="n">{"no charge" if i["amount"] == 0 else money(i["amount"])}</td></tr>'
        for i in inv["items"])
    bill = "<br>".join(e(l) for l in inv["bill_to"])
    notes = "".join(f"<p>{e(n)}</p>" for n in inv.get("notes", []))
    if CUR == "THB":
        ways = baht_ways(inv, total)
    else:
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
  <dt>From</dt><dd>{FROM_THB if CUR == "THB" else "Hongdam · beer@motdang.net"}</dd></dl>
</div>
<table class="lines">{rows}<tr class="total"><td>Total to pay</td><td class="n">{money(total)}</td></tr></table>
<div class="notes">{notes}</div>
<section>
<p class="label">Pay</p>
{"".join(ways)}
<p class="note">Reference <code>{e(inv["number"])}</code></p>
</section>
</main>
<script>{SLIP_JS if CUR == "THB" else ""}
document.querySelectorAll('button[data-copy]').forEach(b=>b.onclick=()=>{{
  navigator.clipboard.writeText(b.dataset.copy).then(()=>{{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1500)}});
}});
</script>
"""
    return (F.head("invoice", "en", title, f'Invoice {inv["number"]} from Hongdam, Chiang Rai.',
                   extra='<meta name="robots" content="noindex,nofollow">') +
            F.body("invoice") + F.top("en") + main + F.foot("invoice", "en", bare=True))


FROM_THB = "motdang.net Co., Ltd., trading as Hongdam · juristic person no. 0575569006139 · beer@motdang.net"


def main():
    invs = json.loads(DATA.read_text())
    thb = {i["slug"]: {"number": i["number"], "baht": sum(x["amount"] for x in i["items"]), "mail": i.get("mail", "")}
           for i in invs if i.get("currency") == "THB"}
    (ROOT / "functions" / "_invoices_data.js").write_text(
        "// Written by tools/build_invoice.py from data/invoices.json: baht invoices the slip check knows.\n"
        f"export const INVOICES = {json.dumps(thb, indent=2, ensure_ascii=False)}\n")
    for inv in invs:
        d = OUT / inv["slug"]
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(page(inv))
        print(f"https://hongdam.net/invoice/{inv['slug']}/")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Hongdam agreement pages: docs/agreement/<slug>/index.html, one per entry in data/agreements.json.

    python3 tools/build_agreement.py            pages + functions/_agreements_data.js
    python3 tools/build_agreement.py --txt <slug> <out.txt>    the same words as plain text

One link to read, sign and pay (her ask 2026-11-16, FERC's Myriad exit, ฿9,000 paid half and half). The client
signs on the page (POST /api/agree, functions/api/agree.js, table agree_sign); the page then shows who signed and
when. The second half is paid by PromptPay QR and slip upload against the agreement's invoice in
data/invoices.json, checked by /api/pay/invoice. Unlisted: random slug, noindex.

functions/_agreements_data.js carries each agreement's plain text and its SHA-256, so a signature names the
exact words signed.
"""
import hashlib
import html
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import build_invoice as I  # noqa: E402

DATA = ROOT / "data" / "agreements.json"
INVOICES = ROOT / "data" / "invoices.json"
OUT = ROOT / "docs" / "agreement"
e = html.escape
ABC = "abcdefghijklmnopqrstuvwxyz"


def plain(ag):
    out = [ag["title"].upper(), ag["about"], ""]
    for s in ag["sections"]:
        out += ["", s["h"].upper(), ""]
        for b in s["blocks"]:
            if isinstance(b, list):
                out += ["%s. %s" % (ABC[i], t) for i, t in enumerate(b)]
            else:
                out.append(b)
            out.append("")
    h, s = ag["hongdam"], ag["signer"]
    out += ["", "SIGNED", "", "For %s: %s, %s" % (s["for"], s["name"], s["title"]),
            "For Hongdam: %s, %s. %s." % (h["name"], h["title"], h["how"])]
    return "\n".join(out).rstrip() + "\n"


CSS = """
.agr .steps{list-style:none;margin:1rem 0 1.6rem;padding:0;display:grid;gap:.6rem}
.agr .steps li{padding:.8rem 1rem;border:var(--card-bd);border-radius:var(--r);background:var(--bg2)}
.agr .steps b{display:block;font-size:1.15rem}
.agr .steps .ok b::before{content:"✓ "}
.agr section{margin:1.4rem 0}
.agr ol.abc{list-style:lower-alpha;padding-left:1.6rem}
.agr ol.abc li{margin:.35rem 0}
.agr .sig{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));margin:1rem 0}
.agr .sig>div{padding:1rem 1.1rem;border:var(--card-bd);border-radius:var(--r);background:var(--bg2)}
.agr input[type=text]{width:100%;max-width:24rem;font:inherit;padding:.5rem .6rem;border:2px solid var(--fg);border-radius:8px;background:var(--bg);color:var(--fg)}
.agr label.tick{display:flex;gap:.6rem;align-items:flex-start}
.agr label.tick input{width:1.4rem;height:1.4rem;flex:none;margin-top:.15rem}
.agr .signed{font-size:1.15rem}
@media print{.top,.foot,.no-print,#signf,form{display:none!important}.agr .steps li,.agr .sig>div{background:none}}
"""

AGREE_JS = """
(()=>{const f=document.getElementById('signf'),box=document.getElementById('ferc-sig'),st=document.getElementById('st-sign');if(!f)return;
const slug=f.dataset.slug,api='/api/agree';
const when=at=>new Date(at).toLocaleString('en-GB',{timeZone:'Asia/Bangkok',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
const E={name:'Type your full name first.',agree:'Tick the box to agree first.',ref:'This agreement is not on hongdam.net.',service:'Signing is not answering. Try again in a minute, or reply "I agree" to Beer\\'s email.'};
const show=r=>{const p=document.createElement('p');p.className='signed';
p.textContent='Signed for FERC by '+r.name+(r.title?', '+r.title:'')+', '+when(r.at)+' (Thailand time).';
f.replaceWith(p);const n=document.createElement('p');n.textContent='Hongdam has a copy by email.';p.after(n);
st.classList.add('ok');st.querySelector('span').textContent='Signed '+when(r.at)+' by '+r.name+'.'};
fetch(api+'?slug='+encodeURIComponent(slug)).then(r=>r.json()).then(r=>{if(r.signed)show(r)}).catch(()=>{});
f.onsubmit=async ev=>{ev.preventDefault();const m=f.querySelector('.msg');
const el=f.elements;if(!el.namedItem('name').value.trim()){m.textContent=E.name;return}if(!el.namedItem('agree').checked){m.textContent=E.agree;return}
m.textContent='Signing…';const fd=new FormData(f);fd.append('slug',slug);
try{const r=await(await fetch(api,{method:'POST',body:fd})).json();if(r.signed)show(r);else m.textContent=E[r.why]||E.service}catch{m.textContent=E.service}}})();
document.querySelectorAll('button[data-print]').forEach(b=>b.onclick=()=>print());
"""


def blocks_html(blocks):
    out = []
    for b in blocks:
        if isinstance(b, list):
            out.append('<ol class="abc">' + "".join("<li>%s</li>" % e(t) for t in b) + "</ol>")
        else:
            out.append("<p>%s</p>" % e(b))
    return "".join(out)


def page(ag, inv):
    import pages as F
    I.CUR = "THB"
    s, h = ag["signer"], ag["hongdam"]
    paid, due = ag["paid"], ag["due"]
    secs = "\n".join('<section><h2>%s</h2>%s</section>' % (e(x["h"]), blocks_html(x["blocks"])) for x in ag["sections"])
    main = f"""<main class="inv agr">
{F.lead("agreement", "en", h1=ag["title"], sub="", with_back=False).rstrip()}
<p><b>{e(ag["about"])}</b><br>FERC and Hongdam (motdang.net Co., Ltd.)</p>
<ol class="steps">
<li class="ok"><b>First half paid</b><span>{e(paid["words"])}</span></li>
<li id="st-sign"><b>FERC signs</b><span><a href="#sign">Sign for FERC</a>, at the end of the agreement.</span></li>
<li><b>Second half on completion</b><span>฿{due["baht"]:,}, <a href="#pay">paid here</a> when Hongdam emails that the work is finished.</span></li>
</ol>
{secs}
<section id="sign"><h2>Signed</h2>
<div class="sig">
<div id="ferc-sig"><p class="label">For {e(s["for"])}</p>
<form id="signf" data-slug="{e(ag["slug"])}">
<p><label>Full name<br><input type="text" name="name" value="{e(s["name"])}" autocomplete="name" maxlength="80" required></label></p>
<p><label>Role<br><input type="text" name="title" value="{e(s["title"])}" maxlength="80"></label></p>
<p><label class="tick"><input type="checkbox" name="agree" value="yes" required> <span>I have read this agreement and I agree to it for {e(s["for"])}.</span></label></p>
<p><button type="submit" class="btn big">Sign for {e(s["for"])}</button></p>
<p class="msg" role="status" aria-live="polite"></p>
<p class="note">Or reply "I agree" to Beer's email (clause 11).</p>
</form></div>
<div><p class="label">For Hongdam</p><p class="signed">{e(h["name"])}, {e(h["title"])}</p><p>{e(h["how"])}.</p></div>
</div>
<p class="no-print"><button type="button" class="btn alt" data-print>Print or save a copy</button></p>
</section>
<section id="pay"><h2>Second half: {I.money(due["baht"])}</h2>
<p>Due when Hongdam emails the Treasurer that the work is finished. FERC has 14 days from that email (clause 5).</p>
{"".join(I.baht_ways(inv, due["baht"]))}
<p>Invoice <a href="/invoice/{e(inv["slug"])}/">{e(inv["number"])}</a>. {" ".join(e(n) for n in inv.get("notes", []))}</p>
</section>
</main>
<script>{I.SLIP_JS}{AGREE_JS}</script>
"""
    return (F.head("agreement", "en", "%s · FERC and Hongdam" % ag["title"], ag["about"] + ". FERC and Hongdam.",
                   extra='<meta name="robots" content="noindex,nofollow"><style>%s</style>' % CSS) +
            F.body("agreement") + F.top("en") + main + F.foot("agreement", "en", bare=True))


def main():
    ags = json.loads(DATA.read_text())
    invs = {i["slug"]: i for i in json.loads(INVOICES.read_text())}
    if sys.argv[1:2] == ["--txt"]:
        ag = next(a for a in ags if a["slug"] == sys.argv[2])
        pathlib.Path(sys.argv[3]).write_text(plain(ag))
        return
    data = {}
    for ag in ags:
        inv = invs[ag["due"]["invoice"]]
        assert sum(x["amount"] for x in inv["items"]) == ag["due"]["baht"], "invoice and agreement disagree on the amount"
        text = plain(ag)
        data[ag["slug"]] = {"title": "%s: %s" % (ag["title"], ag["about"]), "signer": ag["signer"]["for"],
                            "mail": ag["mail"], "sha": hashlib.sha256(text.encode()).hexdigest(), "text": text}
        d = OUT / ag["slug"]
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(page(ag, inv))
        print(f"https://hongdam.net/agreement/{ag['slug']}/")
    (ROOT / "functions" / "_agreements_data.js").write_text(
        "// Written by tools/build_agreement.py from data/agreements.json: the words each agreement page asks to sign.\n"
        f"export const AGREEMENTS = {json.dumps(data, indent=2, ensure_ascii=False)}\n")


if __name__ == "__main__":
    main()

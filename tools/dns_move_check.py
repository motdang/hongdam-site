#!/usr/bin/env python3
"""Before-and-after check for moving a domain's DNS to Cloudflare (card web-dns, her yes 2026-11-06).

    python3 tools/dns_move_check.py before <domain>                 saves what the old nameservers answer
    python3 tools/dns_move_check.py compare <domain> <ns1> [<ns2>]  asks Cloudflare's nameservers the same
                                                                    questions, before the switch; exit 1 on a gap
    python3 tools/dns_move_check.py after <domain>                  the same, through the public internet, after

The snapshot is dns-move/<domain>.json. Mail records (MX, SPF, DMARC, DKIM under common selectors,
autodiscover and mail hosts) and the website names are compared answer by answer. Records under DKIM
selectors not in the list are not found by name: read the owner's mail provider's settings for those.
`before` also reports DNSSEC at the registry (DS records): it is turned off before the nameservers change.
Needs `dig`.
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "dns-move")

DKIM = ["google", "selector1", "selector2", "default", "k1", "k2", "k3", "s1", "s2", "mail", "dkim",
        "smtp", "mx", "zoho", "protonmail", "protonmail2", "protonmail3", "resend", "mandrill", "everlytickey1",
        "everlytickey2", "cm", "sig1", "fm1", "fm2", "fm3", "mxvault", "hs1", "hs2", "sendgrid", "s1024", "x"]
NAMES = [("@", "MX"), ("@", "TXT"), ("@", "A"), ("@", "AAAA"), ("@", "CNAME"), ("@", "CAA"),
         ("www", "A"), ("www", "AAAA"), ("www", "CNAME"),
         ("mail", "A"), ("mail", "CNAME"), ("webmail", "A"), ("webmail", "CNAME"),
         ("smtp", "A"), ("smtp", "CNAME"), ("imap", "A"), ("imap", "CNAME"), ("pop", "A"), ("pop", "CNAME"),
         ("autodiscover", "A"), ("autodiscover", "CNAME"), ("_autodiscover._tcp", "SRV"),
         ("autoconfig", "A"), ("autoconfig", "CNAME"),
         ("_dmarc", "TXT"), ("_mta-sts", "TXT"), ("_smtp._tls", "TXT"), ("_domainkey", "TXT")]
NAMES += [(f"{s}._domainkey", "TXT") for s in DKIM] + [(f"{s}._domainkey", "CNAME") for s in DKIM]
MAILY = ("MX", "SRV")


def fq(name, domain):
    return domain if name == "@" else f"{name}.{domain}"


def dig(qname, rtype, server=None):
    cmd = ["dig", "+short", "+time=3", "+tries=2", rtype, qname]
    if server:
        cmd.insert(1, "@" + server)
    r = subprocess.run(cmd, capture_output=True, text=True)
    lines = [ln.strip() for ln in r.stdout.splitlines() if ln.strip() and not ln.startswith(";")]
    if rtype in ("A", "AAAA"):  # +short follows a CNAME: keep only the addresses
        lines = [ln for ln in lines if not ln.endswith(".")]
    return sorted(set(lines))


def nameservers(domain):
    return dig(domain, "NS")


def ask_all(domain, server):
    got = {}
    for name, rtype in NAMES:
        a = dig(fq(name, domain), rtype, server)
        if a:
            got[f"{name} {rtype}"] = a
    return got


def is_mail(key):
    name, rtype = key.split(" ")
    return rtype in MAILY or "_domainkey" in name or name in ("_dmarc", "_mta-sts", "_smtp._tls", "mail", "webmail",
                                                            "smtp", "imap", "pop", "autodiscover", "autoconfig") \
        or (name == "@" and rtype == "TXT")


def before(domain):
    ns = nameservers(domain)
    if not ns:
        sys.exit(f"{domain}: no nameservers found")
    server = ns[0].rstrip(".")
    got = ask_all(domain, server)
    ds = dig(domain, "DS")
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, domain + ".json")
    json.dump({"domain": domain, "ns": ns, "asked": server, "ds": ds, "records": got}, open(path, "w"), indent=1)
    print(f"{domain}: nameservers {', '.join(ns)}")
    for k, v in got.items():
        print(f"  {'MAIL ' if is_mail(k) else '     '}{k:32} {' | '.join(v)}")
    if ds:
        print("DNSSEC is on at the registry (DS records). Turn it off at the registrar before changing nameservers.")
    print(f"saved {os.path.relpath(path, HERE)}")


def compare(domain, servers, label):
    path = os.path.join(OUT, domain + ".json")
    if not os.path.exists(path):
        sys.exit(f"run `before {domain}` first")
    snap = json.load(open(path))
    gaps = 0
    for server in servers or [None]:
        got = ask_all(domain, server)
        print(f"{domain} via {server or 'public resolver'} ({label})")
        for k, old in snap["records"].items():
            new = got.get(k, [])
            if old == new:
                continue
            # the website names are meant to change; mail answers are not
            web = not is_mail(k)
            flag = "web  " if web else "GAP  "
            if not web:
                gaps += 1
            print(f"  {flag}{k:32} was {' | '.join(old) or '-'}  now {' | '.join(new) or '-'}")
        for k in sorted(set(got) - set(snap["records"])):
            print(f"  new  {k:32} {' | '.join(got[k])}")
    print(f"{gaps} mail gap(s)" if gaps else "mail records match")
    sys.exit(1 if gaps else 0)


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == "before":
        before(a[1].lower())
    elif len(a) >= 3 and a[0] == "compare":
        compare(a[1].lower(), a[2:], "before the switch")
    elif len(a) >= 2 and a[0] == "after":
        compare(a[1].lower(), [], "after the switch")
    else:
        sys.exit(__doc__)

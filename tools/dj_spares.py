#!/usr/bin/env python3
"""Count the spares and their monthly cost for DJ's page (tools/build_dj.py, "Spares"). Runs on the Mac, which holds the
keys; writes data/studio/dj.spares.json, which the build reads. Run it again to refresh the numbers.

    eval "$(~/.claude/bin/cfenv)"; python3 tools/dj_spares.py

- admins: members of the GitHub org motdang (base role admin on every repository) and its repository count (gh)
- r2: Cloudflare R2 storage over all buckets (yesterday's size, first 10 GB free, US$0.015 a GB-month) and this
  month's class A requests (first million free, US$4.50 a million), scaled to a 30.4-day month (GraphQL Analytics API)
- ow: open-model jobs this month from ~/.claude/state/ow.tsv, scaled to a 30.4-day month
- server, box, workers: the plan prices as bought (Hetzner CX23 US$7.09, Storage Box BX21 US$13.00, Workers Paid US$5)
"""
import datetime
import json
import os
import subprocess
import sys
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "data", "studio", "dj.spares.json")
FIXED = {"server": 7.09, "box": 13.00, "workers": 5.00}
USD_THB = 33          # the rate ~/.claude/bin/state.py uses for the cash line
MONTH = 30.4
CLASS_A = {"ListBuckets", "PutBucket", "ListObjects", "PutObject", "CopyObject", "CompleteMultipartUpload",
           "CreateMultipartUpload", "LifecycleStorageTierTransition", "ListMultipartUploads", "UploadPart",
           "UploadPartCopy", "ListParts", "PutBucketEncryption", "PutBucketCors", "PutBucketLifecycleConfiguration"}


def gh(path):
    return json.loads(subprocess.run(["gh", "api", "--paginate", path], capture_output=True, text=True, check=True).stdout)


def graphql(query):
    tok, acct = os.environ["CLOUDFLARE_API_TOKEN"], os.environ["CLOUDFLARE_ACCOUNT_ID"]
    req = urllib.request.Request("https://api.cloudflare.com/client/v4/graphql", data=json.dumps({"query": query % acct}).encode(),
                                 headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=30))
    if d.get("errors"):
        raise SystemExit("Cloudflare: %s" % d["errors"][0].get("message"))
    return d["data"]["viewer"]["accounts"][0]


def main():
    today = datetime.date.today()
    first = today.replace(day=1)
    days = max(1, (today - first).days)
    y = today - datetime.timedelta(days=1)
    store = graphql('{ viewer { accounts(filter:{accountTag:"%%s"}) { r2StorageAdaptiveGroups(limit:200, filter:{datetime_geq:"%sT00:00:00Z", datetime_leq:"%sT00:00:00Z"}) { max { payloadSize metadataSize } dimensions { bucketName } } } } }' % (y, today))
    gb = sum(r["max"]["payloadSize"] + r["max"]["metadataSize"] for r in store["r2StorageAdaptiveGroups"]) / 1e9
    ops = graphql('{ viewer { accounts(filter:{accountTag:"%%s"}) { r2OperationsAdaptiveGroups(limit:500, filter:{datetime_geq:"%sT00:00:00Z", datetime_leq:"%sT00:00:00Z"}) { sum { requests } dimensions { actionType } } } } }' % (first, today))
    a = sum(r["sum"]["requests"] for r in ops["r2OperationsAdaptiveGroups"] if r["dimensions"]["actionType"] in CLASS_A) * MONTH / days
    r2 = max(0, gb - 10) * 0.015 + max(0, a - 1e6) / 1e6 * 4.5
    ow = 0.0
    for line in open(os.path.expanduser("~/.claude/state/ow.tsv"), encoding="utf-8").read().splitlines()[1:]:
        f = line.split("\t")
        if f[0].startswith(first.strftime("%Y-%m")) and len(f) > 9:
            try:
                ow += float(f[9])
            except ValueError:
                pass
    ow = ow * MONTH / days
    members = [m["login"] for m in gh("orgs/motdang/members")]
    repos = len(gh("orgs/motdang/repos"))
    usd = {**FIXED, "r2": round(r2, 2), "ow": round(ow, 2)}
    out = {"day": today.isoformat(), "usd_thb": USD_THB, "usd": usd, "r2_gb": round(gb), "admins": sorted(members, key=str.lower), "repos": repos}
    json.dump(out, open(OUT, "w", encoding="utf-8"), indent=1)
    open(OUT, "a").write("\n")
    total = sum(usd.values())
    print("spares: %d admins on %d repositories · R2 %d GB · US$%.2f a month (฿%s)" % (len(members), repos, gb, total, format(round(total * USD_THB), ",")))
    return 0


if __name__ == "__main__":
    sys.exit(main())

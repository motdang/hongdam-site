#!/usr/bin/env python3
"""A share card for each group and kind of work on hongdam.net/tasks/c/.

Reads data/tasks/graph.json, draws docs/og/tasks/<id>.jpg (1200x630) in the shop's Isotype look with
tools/share_cards_pages.mjs: the kind's name, its Thai, its group, and its group's mark and stops (data/pages.json,
task_groups) in the group's line colour. Writes functions/_task_cards.js, the list the task pages read to use a
kind's own card, each with words for the picture.

    python3 tools/build_task_cards.py            # draw the missing ones
    python3 tools/build_task_cards.py --all      # redraw every card
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
OUT = HERE / "docs" / "og" / "tasks"
LIST = HERE / "functions" / "_task_cards.js"
LOOKS = json.loads((HERE / "data" / "looks.json").read_text(encoding="utf-8"))["glyphs"]
GROUPS = json.loads((HERE / "data" / "pages.json").read_text(encoding="utf-8"))["task_groups"]
HUE = {m.group(1): int(m.group(2)) for m in re.finditer(r"--c-([a-z]+): oklch\(var\(--lL\) var\(--lC\) (\d+)\)",
                                                       (HERE / "docs" / "assets" / "shop.css").read_text(encoding="utf-8"))}


def name(g):
    return LOOKS.get(g, {}).get("en", g.replace("-", " "))


def main():
    redo = "--all" in sys.argv
    graph = json.loads((HERE / "data" / "tasks" / "graph.json").read_text(encoding="utf-8"))
    nodes = {n["id"]: n for n in graph["nodes"]}
    kids = {}
    for n in graph["nodes"]:
        if n.get("up"):
            kids.setdefault(n["up"], []).append(n)
    OUT.mkdir(parents=True, exist_ok=True)
    jobs, alts = [], {}
    for n in graph["nodes"]:
        group = nodes[n["up"]] if n.get("up") else n
        look = GROUPS[group["id"]]
        if n.get("up"):
            sub = "%s · for people or bots" % group["en"]
        else:
            sub = "%d kinds of work, for people or bots" % len(kids.get(n["id"], []))
        alts[n["id"]] = "Hongdam tasks · %s, %s — %s · hongdam.net" % (
            n["en"], n.get("th") or "", ", ".join(name(g) for g in [look["mark"]] + [s for s in look["stops"] if s != look["mark"]]))
        if (OUT / f"{n['id']}.jpg").exists() and not redo:
            continue
        jobs.append(["og/tasks/" + n["id"], n["en"], n.get("th") or "", sub, look["stops"], HUE[look["cat"]], look["mark"]])
    if jobs:
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
            json.dump(jobs, f, ensure_ascii=False)
        subprocess.run(["node", str(HERE / "tools" / "share_cards_pages.mjs"), "--jobs", f.name], check=True)
    have = sorted(i for i in alts if (OUT / f"{i}.jpg").exists())
    LIST.write_text("// Written by tools/build_task_cards.py: kinds of work with their own card in docs/og/tasks/, and words for it.\n"
                    f"export const TASK_CARDS = {json.dumps({i: alts[i] for i in have}, ensure_ascii=False, indent=0)}\n", encoding="utf-8")
    print(f"{len(jobs)} drawn, {len(have)} of {len(alts)} kinds have a card")


if __name__ == "__main__":
    main()

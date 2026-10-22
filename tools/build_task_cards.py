#!/usr/bin/env python3
"""A share card for each group and kind of work on hongdam.net/tasks/c/.

Reads docs/tasks/graph.json, draws docs/og/tasks/<id>.jpg (1200x630) with
share-cards/render.mjs in the look of docs/og/tasks.jpg, and writes
functions/_task_cards.js, the list the task pages read to use a kind's own card.

    python3 tools/build_task_cards.py            # draw the missing ones
    python3 tools/build_task_cards.py --all      # redraw every card
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
CARDS = HERE.parent / "share-cards"
OUT = HERE / "docs" / "og" / "tasks"
LIST = HERE / "functions" / "_task_cards.js"


def main():
    redo = "--all" in sys.argv
    graph = json.loads((HERE / "docs" / "tasks" / "graph.json").read_text(encoding="utf-8"))
    kinds = [n for n in graph["nodes"] if n.get("type") in ("group", "category")]
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = []
    for n in kinds:
        out = OUT / f"{n['id']}.jpg"
        if out.exists() and not redo:
            continue
        jobs.append({
            "out": str(out), "title": n["en"], "sub": n.get("th") or "",
            "kicker": "Hongdam หงส์ดำ · Tasks", "url": f"hongdam.net/tasks/c/{n['id']}",
            "accent": "#e7be6a", "bg": "#171009", "ink": "#f3e7cf", "font": "Libre Baskerville",
            "glyph": n["en"][:1],
        })
    if jobs:
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
            json.dump(jobs, f, ensure_ascii=False)
        subprocess.run(["node", "render.mjs", f.name], cwd=CARDS, check=True)
    have = sorted(n["id"] for n in kinds if (OUT / f"{n['id']}.jpg").exists())
    alts = {n["id"]: f"Card: {n['en']} · {n.get('th') or ''}, Hongdam tasks" for n in kinds if n["id"] in have}
    LIST.write_text("// Written by tools/build_task_cards.py: kinds of work with their own card in docs/og/tasks/.\n"
                    f"export const TASK_CARDS = {json.dumps(alts, ensure_ascii=False, indent=0)}\n", encoding="utf-8")
    print(f"{len(jobs)} drawn, {len(have)} of {len(kinds)} kinds have a card")


if __name__ == "__main__":
    main()

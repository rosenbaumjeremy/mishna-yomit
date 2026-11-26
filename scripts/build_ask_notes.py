#!/usr/bin/env python3
"""Build notes.json for the "Ask Claude · משנה יומית" page from site/data.

Usage: python3 scripts/build_ask_notes.py OUT.json
Writes every perek that has a brief (ids like berakhot-1), in the format the Ask page reads.
"""
import json, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site" / "data"
MAX = 9000  # the page never reads past this
SKIP = {"ref", "era", "date"}


def heb(n):
    out = ""
    for v, c in ((400, "ת"), (300, "ש"), (200, "ר"), (100, "ק")):
        while n >= v:
            out += c; n -= v
    if n == 15: return out + "טו"
    if n == 16: return out + "טז"
    tens = "יכלמנסעפצ"; ones = "אבגדהוזחט"
    if n >= 10: out += tens[n // 10 - 1]; n %= 10
    if n: out += ones[n - 1]
    return out


def flat(v, out):
    if isinstance(v, str):
        if v.strip(): out.append(v)
    elif isinstance(v, list):
        for i in v: flat(i, out)
    elif isinstance(v, dict):
        for k, i in v.items():
            if k in SKIP: continue
            if k == "title" and isinstance(i, str): out.append("## " + i)
            else: flat(i, out)
    return out


def main(out_path):
    names = {m["slug"]: m for s in json.loads((ROOT / "masechtot.json").read_text(encoding="utf-8"))["sedarim"]
             for m in s["masechtot"]}
    briefs = []
    for f in (ROOT / "perakim").glob("*.json"):
        d = json.loads(f.read_text(encoding="utf-8"))
        if "hebrew" in d or "english" in d:
            briefs.append(d)
    briefs.sort(key=lambda d: (d["masechet"], d["perek"]))
    notes = []
    for d in briefs:
        m, p = names[d["masechet"]], d["perek"]
        pid = f'{d["masechet"]}-{p}'
        notes.append({"id": pid,
                      "w": {"he": f'{m["he"]} פרק {heb(p)}', "en": f'{m["en"]} {p}'},
                      "t": {"he": f'{m["he"]} פרק {heb(p)}', "en": f'{m["en"]}, chapter {p}'},
                      "x": {"he": "\n".join(flat(d.get("hebrew"), []))[:MAX],
                            "en": "\n".join(flat(d.get("english"), []))[:MAX]},
                      "h": pid})
    pathlib.Path(out_path).write_text(
        "[\n" + ",\n".join(json.dumps(n, ensure_ascii=False) for n in notes) + "\n]\n", encoding="utf-8")
    print(f"{len(notes)} notes -> {out_path}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "notes.json")

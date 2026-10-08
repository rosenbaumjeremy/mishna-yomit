"""Check the parts of a Mishnah brief that verify_brief.py does not: the
topics (musagim) and the links from each item to the words of the mishnah.

    python3 scripts/check_perek.py BRIEF.json "<Sefaria ref of the perek>" [--min-topics 4]

Run it after verify_brief.py. It rewrites the brief in place:

  * a topic whose source quote is not word for word in its ref is removed;
  * every topic must say which mishnah it belongs to ("mishnah": n) and give
    "anchors": phrases copied from that mishnah's text; anchors not found in
    that mishnah are removed, and a topic left with none is removed;
  * every question's pasuk.ref must be a mishnah of this perek.

English and Hebrew topics are kept in the same order; a topic that fails in
either language is removed from both. Exits 1 if fewer than --min-topics
topics survive. Uses the same comparison as verify_brief.py (ignores nikud,
punctuation, and the vowel letters ו and י).
"""

import argparse
import json
import sys
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import verify_brief as vb  # noqa: E402


def mishnayot(ref):
    url = ("https://www.sefaria.org/api/v3/texts/"
           + urllib.parse.quote(ref.replace(" ", "_"), safe="_.:,-") + "?version=hebrew")
    return [vb.norm(vb.flatten(t)) for t in vb.json.load(vb.urllib.request.urlopen(url, timeout=30))["versions"][0]["text"]]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    parser.add_argument("ref")
    parser.add_argument("--min-topics", type=int, default=4)
    args = parser.parse_args()

    brief = json.loads(Path(args.path).read_text(encoding="utf-8"))
    texts = mishnayot(args.ref)
    report = []

    for lang in ("english", "hebrew"):
        for i, q in enumerate(brief[lang]["questions"], 1):
            ref = q["pasuk"]["ref"]
            if not ref.startswith(args.ref + ":"):
                sys.exit(f"Q{i} {lang}: pasuk.ref {ref!r} is not a mishnah of {args.ref}")

    en, he = brief["english"].get("topics", []), brief["hebrew"].get("topics", [])
    if len(en) != len(he):
        sys.exit("english and hebrew must have the same topics in the same order")
    keep = []
    for i, (te, th) in enumerate(zip(en, he), 1):
        ok = True
        for lang, t in (("english", te), ("hebrew", th)):
            s = t.get("source") or {}
            if not vb.found(s.get("quote"), s.get("ref")):
                report.append(f"T{i} {lang}: source quote not found in {s.get('ref')!r}")
                ok = False
            n = t.get("mishnah")
            if not isinstance(n, int) or not 1 <= n <= len(texts):
                report.append(f"T{i} {lang}: bad mishnah number {n!r}")
                ok = False
                continue
            good = [a for a in t.get("anchors", []) if vb.norm(a) and vb.norm(a) in texts[n - 1]]
            for a in t.get("anchors", []):
                if a not in good:
                    report.append(f"T{i} {lang}: anchor {a!r} not in mishnah {n}")
            t["anchors"] = good
            if not good:
                ok = False
        if ok:
            keep.append((te, th))
        else:
            report.append(f"T{i} REMOVED: {te.get('term')!r}")
    brief["english"]["topics"] = [te for te, _ in keep]
    brief["hebrew"]["topics"] = [th for _, th in keep]

    # sources_consulted also lists the works the topics cite
    for lang in ("english", "hebrew"):
        names = brief[lang].setdefault("sources_consulted", [])
        for t in brief[lang]["topics"]:
            if t["source"]["name"] not in names:
                names.append(t["source"]["name"])

    Path(args.path).write_text(json.dumps(brief, ensure_ascii=False, indent=1), encoding="utf-8")
    print("\n".join(report) or "every topic and anchor found")
    print(f"{len(keep)} of {len(en)} topics verified")
    if len(keep) < args.min_topics:
        print(f"FEWER THAN {args.min_topics} VERIFIED TOPICS", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

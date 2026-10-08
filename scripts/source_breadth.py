"""Report which sources a verified Mishnah brief draws on, and fail if it leans
on too few of them or cites anything other than the mefarshim on the Mishnah.

    python3 scripts/source_breadth.py <brief.json> "<Sefaria ref of the perek>"

Run it after verify_brief.py and check_perek.py. Allowed: works Sefaria links
to the perek under category "Commentary" that are commentaries on this
masechet of Mishnah (Rambam, Bartenura, Tosafot Yom Tov, Tiferet Yisrael,
Melekhet Shelomoh, Rash, Ra'avad, Mishnah Rishonah, Tosafot Rabbi Akiva Eiger,
Rashash, Lechem Shamayim…). Not allowed: Gemara, Tosefta, halakha, Tanach
commentaries, and the modern English and German explanations. Exit 1 means the
brief needs fixing (see ROUTINE.md step 5).
"""
import collections
import json
import sys
import time
import urllib.parse
import urllib.request

MIN_WORKS = 5          # distinct works cited, askers, answers and topics together
MAX_ASKS = 3           # questions any one work may be the (sole) asker of
MAX_SHARE = 0.4        # share of all citations any one work may take
EXCLUDED = ("English Explanation of", "German Commentary on")


def links(ref):
    url = ("https://www.sefaria.org/api/links/"
           + urllib.parse.quote(ref.replace(" ", "_"), safe="_.:,-") + "?with_text=0")
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as response:
                return json.load(response)
        except Exception:
            time.sleep(3)
    return []


def main():
    brief = json.load(open(sys.argv[1], encoding="utf-8"))
    perek = sys.argv[2]
    book = perek.rsplit(" ", 1)[0]                       # "Mishnah Berakhot"
    allowed = {l["index_title"] for l in links(perek)
               if l.get("category") == "Commentary"
               and l.get("index_title", "").endswith(" on " + book)
               and not l["index_title"].startswith(EXCLUDED)}

    def work(ref):
        return max((t for t in allowed if ref.startswith(t)), key=len, default="")

    english = brief["english"]
    cites, asks, outside = collections.Counter(), collections.Counter(), []
    who_all = [t["source"] for t in english.get("topics", [])]
    for q in english["questions"]:
        askers = {a["name"] for a in q["asked_by"]}
        if len(askers) == 1:
            asks.update(askers)
        who_all += q["asked_by"] + [s for a in q["answers"] for s in a["sources"]]
    for who in who_all:
        cites[who["name"]] += 1
        if not work(who["ref"]):
            outside.append(who["ref"])

    total = sum(cites.values()) or 1
    print("works:", ", ".join(f"{n} ({c})" for n, c in cites.most_common()))
    print("allowed on this perek:", ", ".join(sorted(allowed)))

    problems = [f"not a mefaresh on {book}: {o}" for o in outside]
    if len(cites) < MIN_WORKS:
        problems.append(f"only {len(cites)} distinct works cited (need {MIN_WORKS})")
    for name, n in asks.items():
        if n > MAX_ASKS:
            problems.append(f"{name} is the only asker of {n} questions (max {MAX_ASKS})")
    for name, n in cites.items():
        if n / total > MAX_SHARE:
            problems.append(f"{name} has {n} of {total} citations (max {MAX_SHARE:.0%})")

    print("\n".join(problems) or "source breadth ok")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()

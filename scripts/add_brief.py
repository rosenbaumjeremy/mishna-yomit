"""Work out a day's perek of Mishnah, and file that day's brief into the site.

    python3 scripts/add_brief.py --info YYYY-MM-DD
        Print the day's perek as JSON: masechet (en/he/slug), perek number,
        Sefaria ref, number of mishnayot, the site file it will be filed under,
        and whether that file already holds this date's brief. The daily
        routine uses this so it researches exactly what the site will file.

    python3 scripts/add_brief.py brief.json
        brief.json = {"date", "hebrew_date", "english": {...}, "hebrew": {...}}
        Fetches the perek's text from Sefaria, writes
        site/data/perakim/<slug>-<perek>.json and adds it to index.json.

The schedule is one perek a day straight through Shas in Sefaria's order
(site/data/masechtot.json, 525 perakim, Pirkei Avot with its sixth perek),
starting with Berakhot 1 on START and beginning again when it is finished.
"""

import datetime
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "site" / "data"
START = datetime.date(2026, 10, 9)   # Berakhot 1


def fetch(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                return json.load(response)
        except Exception:  # Sefaria returns the odd transient 504
            if attempt == 3:
                raise
            time.sleep(3)


def perakim():
    data = json.loads((DATA / "masechtot.json").read_text(encoding="utf-8"))
    return [(s, m, p) for s in data["sedarim"] for m in s["masechtot"] for p in range(1, m["perakim"] + 1)]


def info(date_text):
    day = datetime.date.fromisoformat(date_text)
    order = perakim()
    seder, m, perek = order[(day - START).days % len(order)]
    key = f"{m['slug']}-{perek}"
    path = DATA / "perakim" / f"{key}.json"
    done = path.exists() and json.loads(path.read_text(encoding="utf-8")).get("date") == date_text
    return {
        "date": date_text,
        "seder": {"en": seder["en"], "he": seder["he"]},
        "masechet": {"slug": m["slug"], "en": m["en"], "he": m["he"], "perakim": m["perakim"]},
        "perek": perek,
        "ref": f"{m['title']} {perek}",
        "file": f"site/data/perakim/{key}.json",
        "site_url": f"https://mishna-yomit.rosenbaum-jeremy.workers.dev/#{key}",
        "already_published": done,
    }


def add(brief_path):
    brief = json.loads(Path(brief_path).read_text(encoding="utf-8"))
    day = info(brief["date"])
    text = fetch("https://www.sefaria.org/api/v3/texts/"
                 + urllib.parse.quote(day["ref"].replace(" ", "_"), safe="_.:,-")
                 + "?version=hebrew&version=english")
    versions = text["versions"]
    he = versions[0]["text"]
    en = versions[1]["text"] if len(versions) > 1 else [""] * len(he)

    record = {"date": day["date"], "hebrew_date": brief["hebrew_date"],
              "masechet": day["masechet"]["slug"], "perek": day["perek"], "ref": day["ref"],
              "mishnayot": [{"he": h, "en": e} for h, e in zip(he, en)],
              "english": brief["english"], "hebrew": brief["hebrew"]}
    for lang in ("english", "hebrew"):
        section = record[lang]
        if not section.get("questions"):
            sys.exit(f"brief has no {lang} questions")
        # each question is linked to the words of the mishnah it quotes
        for q in section["questions"]:
            q["mishnah"] = int(q["pasuk"]["ref"].rsplit(":", 1)[1].split("-")[0])
            q["anchors"] = [q["pasuk"]["text"]]
        section.setdefault("topics", [])

    folder = DATA / "perakim"
    folder.mkdir(exist_ok=True)
    key = f"{day['masechet']['slug']}-{day['perek']}"
    (folder / f"{key}.json").write_text(json.dumps(record, ensure_ascii=False, indent=1), encoding="utf-8")

    index_path = folder / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {"days": []}
    # one brief per perek: the next cycle's run replaces this one in the index
    index["days"] = [d for d in index["days"] if (d["masechet"], d["perek"]) != (day["masechet"]["slug"], day["perek"])]
    index["days"].append({"date": day["date"], "masechet": day["masechet"]["slug"],
                          "perek": day["perek"], "ref": day["ref"]})
    index["days"].sort(key=lambda d: d["date"])
    index_path.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"filed {day['ref']} for {day['date']}")


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--info":
        print(json.dumps(info(sys.argv[2]), ensure_ascii=False, indent=1))
    elif len(sys.argv) == 2:
        add(sys.argv[1])
    else:
        sys.exit(__doc__)

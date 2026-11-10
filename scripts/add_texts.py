"""Put the text of every perek of Mishnah on the site, ahead of its brief.

    python3 scripts/add_texts.py

For each perek in site/data/masechtot.json that has no file yet, fetches the
Hebrew and English text from Sefaria and writes
site/data/perakim/<slug>-<perek>.json with just the text:

    {"masechet", "perek", "ref", "mishnayot": [{"he", "en"}]}

No "date", "english" or "hebrew": the site shows such a perek's text and the
date its brief is due. When the routine files the brief (add_brief.py), it
overwrites the file with the full record. Files that already exist, text-only
or with a brief, are never touched, so this is safe to run again.
"""

import json
import sys
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_brief import DATA, fetch, perakim  # noqa: E402


def text_record(m, perek):
    ref = f"{m['title']} {perek}"
    data = fetch("https://www.sefaria.org/api/v3/texts/"
                 + urllib.parse.quote(ref.replace(" ", "_"), safe="_.:,-")
                 + "?version=hebrew&version=english")
    versions = data["versions"]
    he = next(v for v in versions if v.get("actualLanguage", v.get("language")) == "he")["text"]
    en_v = next((v for v in versions if v.get("actualLanguage", v.get("language")) == "en"), None)
    en = en_v["text"] if en_v else [""] * len(he)
    en = list(en) + [""] * (len(he) - len(en))
    if not he or not all(isinstance(h, str) and h.strip() for h in he):
        raise ValueError(f"no Hebrew text for {ref}")
    return {"masechet": m["slug"], "perek": perek, "ref": ref,
            "mishnayot": [{"he": h, "en": e} for h, e in zip(he, en)]}


def main():
    folder = DATA / "perakim"
    folder.mkdir(exist_ok=True)
    todo = [(m, p) for _, m, p in perakim() if not (folder / f"{m['slug']}-{p}.json").exists()]
    print(f"{len(todo)} perakim to add")

    def one(job):
        m, p = job
        path = folder / f"{m['slug']}-{p}.json"
        try:
            record = text_record(m, p)
        except Exception as e:  # report and carry on; a re-run picks it up
            return f"FAILED {m['title']} {p}: {e}"
        path.write_text(json.dumps(record, ensure_ascii=False, indent=1), encoding="utf-8")
        return None

    with ThreadPoolExecutor(max_workers=4) as pool:
        failures = [r for r in pool.map(one, todo) if r]
    for f in failures:
        print(f)
    print(f"added {len(todo) - len(failures)}, failed {len(failures)}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()

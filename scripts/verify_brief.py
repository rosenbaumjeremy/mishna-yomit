"""Check a brief against the texts it cites, and drop anything that isn't in them.

    python3 scripts/verify_brief.py BRIEF.json [--min 5]

Works on any file with "english" and "hebrew" sections in the brief shape (a
day file of either site, or the routine's /tmp/brief.json), and rewrites it in
place. For every question, in both languages:

  * pasuk.text must appear, word for word, in the verse pasuk.ref names;
  * every asked_by entry needs a "quote" that appears word for word in the
    commentary its "ref" names;
  * every answer needs at least one source whose "quote" appears in its ref;
    sources that fail are removed, and answers left with none are removed;
  * answers marked "synthesis" are removed: only what a source says is kept.

A question that loses its pasuk, all its askers, or all its answers is removed
from BOTH languages (they are kept in the same order). "sources_consulted" is
rebuilt from the sources actually cited. Comparison ignores nikud, te'amim,
punctuation, quote marks and HTML, nothing else.

Exits 1 if fewer than --min questions survive, so the caller can research
more instead of publishing a thin brief. A report of every removal is printed.
"""

import argparse
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request

MARKS = re.compile(r"[֑-ׇ]")            # te'amim and nikud
NOISE = re.compile(r"[^\w\s]|_")                  # punctuation, quote marks, geresh
_cache = {}


# the divine name, bare or after a one-letter prefix (לה', וה', לַיהוָה...)
DIVINE = re.compile(r"(?<![א-ת])([ובלכמשה]?)(יהוה|יקוק|ה׳|ה'|ה״)(?![א-ת])")
BLOCK_TAGS = re.compile(r"<\s*/?\s*(br|p|div|li)\b[^>]*>", re.I)
ELOKIM = re.compile(r"אלק(ים|יך|יכם|ינו|י)\b")


def norm(text):
    """Strip everything but the words, and the spelling differences that don't
    change a word: ktiv male / chaser (ו and י as vowel letters) and the ways
    the divine names are written. Word order and every other letter count."""
    # inline tags (Sefaria's large ב of בראשית, small ה of בהבראם) sit inside
    # words, so they vanish; block tags separate words
    text = BLOCK_TAGS.sub(" ", text)
    text = html.unescape(re.sub(r"<[^>]+>", "", text))
    text = text.replace("־", " ")            # maqaf joins words; treat as a space
    text = MARKS.sub("", text)
    text = DIVINE.sub(lambda m: m.group(1) + "ה", text)
    text = ELOKIM.sub(lambda m: "אלה" + m.group(1), text)
    text = NOISE.sub(" ", text)
    text = re.sub(r"[וי]", "", text)              # vowel letters: עבור == עבר
    return " ".join(text.split()).lower()


def flatten(value):
    if isinstance(value, list):
        return " ".join(flatten(v) for v in value)
    return value or ""


def source_text(ref):
    """All Hebrew and English text Sefaria has for a ref, normalised."""
    if ref in _cache:
        return _cache[ref]
    url = ("https://www.sefaria.org/api/v3/texts/"
           + urllib.parse.quote(ref.replace(" ", "_"), safe="_.:,-")
           + "?version=hebrew&version=english&version=source")
    text = ""
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                data = json.load(response)
            text = " ".join(flatten(v.get("text")) for v in data.get("versions", []))
            break
        except Exception:
            time.sleep(3)
    _cache[ref] = norm(text)
    return _cache[ref]


def found(quote, ref):
    """Every part of the quote (parts joined by "..." or "…") appears in the
    source, in order. Parts must be at least two words; the whole quote three."""
    if not quote or not ref:
        return False
    parts = [norm(p) for p in re.split(r"\.\.\.|…", quote)]
    parts = [p for p in parts if p]
    if sum(len(p.split()) for p in parts) < 3 or any(len(p.split()) < 2 for p in parts):
        return False
    text, at = source_text(ref), 0
    for part in parts:
        at = text.find(part, at)
        if at < 0:
            return False
        at += len(part)
    return True


def check_question(q, report, tag):
    pasuk = q.get("pasuk") or {}
    if not found(pasuk.get("text"), pasuk.get("ref")):
        report.append(f"{tag}: pasuk text not found in {pasuk.get('ref')!r}")
        return False

    askers = [a for a in q.get("asked_by", []) if found(a.get("quote"), a.get("ref"))]
    for a in q.get("asked_by", []):
        if a not in askers:
            report.append(f"{tag}: asker {a.get('name')!r} quote not found in {a.get('ref')!r}")
    if not askers:
        return False
    q["asked_by"] = askers

    answers = []
    for answer in q.get("answers", []):
        if answer.get("synthesis"):
            report.append(f"{tag}: dropped an unsourced (synthesis) answer")
            continue
        sources = [s for s in answer.get("sources", []) if found(s.get("quote"), s.get("ref"))]
        for s in answer.get("sources", []):
            if s not in sources:
                report.append(f"{tag}: answer source {s.get('name')!r} quote not found in {s.get('ref')!r}")
        if sources:
            answer["sources"] = sources
            answer.pop("synthesis", None)
            answers.append(answer)
    if not answers:
        report.append(f"{tag}: no answer survived")
        return False
    q["answers"] = answers
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    parser.add_argument("--min", type=int, default=5)
    args = parser.parse_args()

    with open(args.path, encoding="utf-8") as f:
        brief = json.load(f)
    english, hebrew = brief["english"], brief["hebrew"]
    if len(english["questions"]) != len(hebrew["questions"]):
        sys.exit("english and hebrew must have the same questions in the same order")

    report, keep = [], []
    for i, (qe, qh) in enumerate(zip(english["questions"], hebrew["questions"]), 1):
        ok_e = check_question(qe, report, f"Q{i} english")
        ok_h = check_question(qh, report, f"Q{i} hebrew")
        if ok_e and ok_h:
            keep.append((qe, qh))
        else:
            report.append(f"Q{i} REMOVED: {qe.get('title')!r}")

    english["questions"] = [qe for qe, _ in keep]
    hebrew["questions"] = [qh for _, qh in keep]
    for section in (english, hebrew):
        names = []
        for q in section["questions"]:
            for who in q["asked_by"] + [s for a in q["answers"] for s in a["sources"]]:
                if who["name"] not in names:
                    names.append(who["name"])
        section["sources_consulted"] = names

    with open(args.path, "w", encoding="utf-8") as f:
        json.dump(brief, f, ensure_ascii=False, indent=1)

    print("\n".join(report) or "every quote found")
    print(f"{len(keep)} of {len(keep) + sum(1 for r in report if 'REMOVED' in r)} questions verified")
    if len(keep) < args.min:
        print(f"FEWER THAN {args.min} VERIFIED QUESTIONS", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

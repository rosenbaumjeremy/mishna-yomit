#!/usr/bin/env python3
"""Perek quizzes: check a draft quiz against the text of the perek and publish it.

    python3 scripts/quiz.py draft.json [more.json ...]   check, then write site/data/quiz/<slug>-<perek>.json
    python3 scripts/quiz.py --check draft.json           check only, write nothing

A draft is
    {"masechet": "shabbat", "perek": 1, "questions": [
       {"q": "לדברי מי: “לא ישב אדם לפני הספר סמוך למנחה”?",
        "o": ["the right answer", "wrong", "wrong", "wrong"],     # right answer first
        "e": "why, quoting the mishnah: “...”",
        "r": "2",                                               # the mishnah, or a range "2-3"
        "h": "optional hint"}]}

Every “quote” in the question and the explanation may be typed without nikud; it must be
found word for word (letters only) in the mishnayot of "r" (site/data/perakim), and is
replaced by the mishnah's own words with nikud. "..." skips words and "___" leaves a blank.
"r" must be mishnayot of this perek. A perek gets 12 to 15 questions; only a very short
perek (two or three short mishnayot) gets fewer, never under 6.
The answers are shuffled (a fixed order per question) and the right one is recorded in "a".
"""
import hashlib
import json
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "site" / "data"
OUT = DATA / "quiz"
MIN_Q, MAX_Q = 6, 15

MARK = "[\u0591-\u05C7]"   # nikud and te'amim
TEAMIM = re.compile("[\u0591-\u05AF\u05BD\u05C0\u05C3]")   # te'amim, meteg, paseq, sof pasuk
FINALS = str.maketrans("ךםןףץ", "כמנפצ")
QUOTE = re.compile("“([^”]+)”")


def order():
    data = json.loads((DATA / "masechtot.json").read_text(encoding="utf-8"))
    return [(m, p) for s in data["sedarim"] for m in s["masechtot"] for p in range(1, m["perakim"] + 1)]


def letters(s):
    return re.sub("[^א-ת]", "", s).translate(FINALS)


def tokens(text):
    """the mishnah's words with nikud, each with the separator after it"""
    text = TEAMIM.sub("", re.sub(r"<[^>]+>", "", text))
    return [(m.group(1), "־" if "־" in m.group(2) else " ")
            for m in re.finditer(r"([^\s־]+)([\s־]*)", text.strip())]


def holy(word):
    word = re.sub(f"י{MARK}*ה{MARK}*ו{MARK}*ה{MARK}*", "ה׳", word)
    return re.sub(f"(א{MARK}*ל{MARK}*)ה({MARK}*י{MARK}*ם)", r"\1ק\2", word)


def vocalize(quote, words):
    if "___" in quote:
        said = [vocalize(p, words) if letters(p) else "" for p in quote.split("___")]
        return None if None in said else " ___ ".join(s.strip() for s in said).strip()
    parts = [p for p in re.split(r"\.\.\.|…", quote) if letters(p)]
    if len(parts) > 1:
        said = [vocalize_part(p, words) for p in parts]
        return None if None in said else "... ".join(said)
    return vocalize_part(quote, words)


def vocalize_part(quote, words):
    want = [letters(w) for w in re.split(r"[\s־]+", quote) if letters(w)]
    have = [letters(w) for w, _ in words]
    for i in range(len(have) - len(want) + 1):
        if want and have[i:i + len(want)] == want:
            text = "".join(holy(w) + sep for w, sep in words[i:i + len(want)]).rstrip(" ־")
            # keep the mishnah's commas inside a quote, not its closing punctuation
            return re.sub(r"[\s.,:;]+$", "", text)
    return None


def check(draft, masechtot):
    m = masechtot.get(draft["masechet"])
    perek = draft["perek"]
    where0 = f'{draft["masechet"]} {perek}'
    if not m or not 1 <= perek <= m["perakim"]:
        return [f"{where0}: no such perek"], None
    text = json.loads((DATA / "perakim" / f'{m["slug"]}-{perek}.json').read_text(encoding="utf-8"))["mishnayot"]
    problems, out = [], []
    n_q = len(draft["questions"])
    if not MIN_Q <= n_q <= MAX_Q:
        problems.append(f"{where0}: {n_q} questions (want {MIN_Q}-{MAX_Q})")
    for n, q in enumerate(draft["questions"], 1):
        where = f"{where0} #{n}"
        try:
            a, _, b = str(q["r"]).partition("-")
            start, end = int(a), int(b or a)
            if not 1 <= start <= end <= len(text):
                raise ValueError(f"the perek has {len(text)} mishnayot")
        except (ValueError, KeyError) as error:
            problems.append(f"{where}: bad r {q.get('r')!r}: {error}")
            continue
        words = [w for i in range(start - 1, end) for w in tokens(text[i]["he"])]
        if len(q["o"]) != 4 or len(set(q["o"])) != 4:
            problems.append(f"{where}: needs 4 different answers")
        fixed = {}
        for field in ("q", "e"):
            def sub(mo):
                said = vocalize(mo.group(1), words)
                if said is None:
                    problems.append(f"{where} ({field}): “{mo.group(1)}” is not in mishnah {q['r']}")
                    return mo.group(0)
                return f"“{said}”"
            fixed[field] = QUOTE.sub(sub, q[field])
        rng = random.Random(hashlib.sha256(f'{m["slug"]}{perek}#{n}'.encode()).hexdigest())
        shuffle = list(range(4))
        rng.shuffle(shuffle)
        ref = f'{m["title"]} {perek}:{start}' + (f"-{end}" if end != start else "")
        item = {"q": fixed["q"], "o": [q["o"][i] for i in shuffle], "a": shuffle.index(0),
                "e": fixed["e"], "ref": ref, "mishnah": start}
        if q.get("h"):
            item["h"] = q["h"]
        out.append(item)
    return problems, {"masechet": m["slug"], "perek": perek, "ref": f'{m["title"]} {perek}', "questions": out}


def main(args):
    only_check = "--check" in args
    files = [a for a in args if not a.startswith("--")]
    perakim = order()
    masechtot = {m["slug"]: m for m, _ in perakim}
    failed = False
    for path in files:
        draft = json.loads(Path(path).read_text(encoding="utf-8"))
        problems, quiz = check(draft, masechtot)
        for p in problems:
            print("✗", p)
        if problems:
            failed = True
            continue
        print(f"✓ {quiz['ref']}: {len(quiz['questions'])} questions")
        if not only_check:
            OUT.mkdir(parents=True, exist_ok=True)
            (OUT / f"{quiz['masechet']}-{quiz['perek']}.json").write_text(
                json.dumps(quiz, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if not only_check:
        have = {p.stem for p in OUT.glob("*.json") if p.stem != "index"}
        days = [{"masechet": m["slug"], "perek": p} for m, p in perakim if f'{m["slug"]}-{p}' in have]
        (OUT / "index.json").write_text(json.dumps({"days": days}) + "\n", encoding="utf-8")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main(sys.argv[1:])

# Mishnah Yomit routine

Instructions for the cloud routine that runs every morning at 03:00 Israel time.
It studies the day's perek of Mishnah with the mefarshim on Sefaria, emails the
user a brief (a summary of the perek, the key terms and topics explained, and
5–8 questions of the mefarshim with their answers) and publishes it to this
site.

## The rule

**Only quote a source that you link to on Sefaria, and only with words that
are actually in it.** Every question, asker, answer and topic is tied to a
Sefaria ref plus the exact words quoted from that ref. `scripts/verify_brief.py`
and `scripts/check_perek.py` download each ref and remove anything whose quote
is not there. Nothing you did not read goes in: no answers of your own, no
paraphrased "quotes", no sources you did not open.

**Only the mefarshim on the Mishnah.** Use only commentaries on this masechet
of Mishnah (Sefaria category "Commentary", titled "<work> on Mishnah <Masechet>"):
Rambam (Peirush HaMishnayot), Bartenura, Tosafot Yom Tov and Ikar Tosafot Yom
Tov, Tiferet Yisrael (Yachin and Boaz), Melekhet Shelomoh, Rash and Ra'avad
(Zeraim and Taharot), Mishnah Rishonah, Tosafot Rabbi Akiva Eiger, Rashash,
Lechem Shamayim, Hon Ashir, Mishnat Eretz Yisrael, Yesh Seder LaMishnah, and any
other such commentary Sefaria has. **Not**: Gemara (Bavli or Yerushalmi),
Tosefta, Midrash, halakha, Tanach commentaries, or the modern "English
Explanation of Mishnah" and "German Commentary".

## Modes

- **Daily** (the normal run): steps 0–7 for today's date.
- **Backfill** (when the prompt lists dates): steps 1–5 and 7 for each listed
  date in turn, one commit per date. No time guard, and **no email**.

## Step 0 – time guard (daily only)

The schedule fires at 00:00 and 01:00 UTC so one firing lands at 03:00 in
Israel year-round. Run `TZ=Asia/Jerusalem date +%H`; if it is `02` or `04`,
print "Off-hour scheduled firing – skipping" and stop. Any other hour, continue.

## Step 1 – the day's perek

1. Date: `TZ=Asia/Jerusalem date +%Y-%m-%d` (or the backfill date).
2. `python3 scripts/add_brief.py --info <date>` prints the masechet (en/he),
   the perek, its Sefaria `ref` (e.g. "Mishnah Berakhot 2"), the `file` it
   will be filed under, the `site_url` of its page, and `already_published`.
   Study exactly that `ref`.
3. If `already_published` is true, this date's brief is already on the site:
   skip to step 6 and email it from that file, then stop (no commit).
4. Hebrew date: `curl -s "https://www.hebcal.com/converter?cfg=json&date=YYYY-MM-DD&g2h=1"`
   (`hebrew`, and an English form like "28 Tishrei 5787" from hd/hm/hy).

## Step 2 – read the text

`curl -s "https://www.sefaria.org/api/v3/texts/<ref with underscores>?version=hebrew&version=english"`
gives each mishnah of the perek (Hebrew with nikud, and an English translation).
Read every mishnah.

## Step 3 – read the mefarshim

`curl -s "https://www.sefaria.org/api/links/<ref>?with_text=0"` lists every
linked source (category, collectiveTitle, index_title, ref). Retry transient
504s. Print a count of links per category and collectiveTitle first. Keep only
category "Commentary" whose `index_title` ends with " on <Mishnah Masechet>"
(e.g. "Bartenura on Mishnah Berakhot"), minus the English and German
explanations.

Fetch the text of each one
(`https://www.sefaria.org/api/v3/texts/Bartenura_on_Mishnah_Berakhot.2.1?version=hebrew`;
the link's `ref` gives the exact ref). Read every comment of Rambam, Bartenura,
Tosafot Yom Tov, Tiferet Yisrael (Yachin and Boaz) and Rabbi Akiva Eiger on
the perek, and of the others at least the passages that ask something. Look for
קשה, יש לשאול, צריך עיון, תימה, למה, מדוע, ואם תאמר, הקשה, לכאורה, צ"ע,
איכא למידק, יש לדקדק, ק"ל. When one mefaresh asks, look for whether another
answers differently or reads the mishnah differently: that is the machlokes
worth showing.

## Step 4 – write the brief as JSON

**Summary**: 4–6 sentences going through the perek mishnah by mishnah, from
the text itself.

**Topics (musagim)**: 6–12 terms, institutions, people or concepts a learner
needs to understand this perek (e.g. tevul yom, the watches of the night,
seasonal hours, Beit Shammai and Beit Hillel). Each one: a plain explanation in
2–4 sentences, the mishnah it belongs to, the exact words in that mishnah it
explains (`anchors`, copied from the Sefaria Hebrew text, without nikud is
fine), and one mefaresh that explains it, with a quote.

**Questions**: the 5–8 strongest questions the mefarshim actually ask on this
perek (prefer ones several of them raise, or that drive a machlokes), in the
order of the mishnayot. Spread them across sources: no single work may be the
only asker of more than 3 questions, and wherever another mefaresh answers
differently, give that answer too (two or three answers from different works
is the goal). Include the Rambam/Bartenura level and the acharonim.

Write `/tmp/brief.json` with python `json.dump(..., ensure_ascii=False)`:

```
{"date": "YYYY-MM-DD",
 "hebrew_date": {"hebrew": "…", "english": "…"},
 "english": {
   "summary": "…",
   "topics": [{
     "term": "Tevul yom and mechusar kippurim",
     "explanation": "…",
     "mishnah": 1,
     "anchors": ["לאכול בתרומתן"],
     "source": {"name": "Bartenura", "ref": "Bartenura on Mishnah Berakhot 1:1:1",
                "quote": "<the mefaresh's own words, copied exactly from that ref>"}}],
   "questions": [{
     "title": "short title",
     "pasuk": {"text": "<exact words from the mishnah>", "ref": "Mishnah Berakhot 1:1", "label": "Mishnah Berakhot 1:1"},
     "question": "the question, clearly stated",
     "asked_by": [{"name": "Tosafot Yom Tov", "ref": "Tosafot Yom Tov on Mishnah Berakhot 1:1:2", "era": "acharon",
                   "quote": "<the asker's own words, copied exactly from that ref>"}],
     "answers": [{"text": "the answer, as that mefaresh gives it",
                  "sources": [{"name": "Bartenura", "ref": "Bartenura on Mishnah Berakhot 1:1:1",
                               "quote": "<the words in that ref that give this answer>"}]}],
     "why": "one line on why it matters"}]},
 "hebrew": { the same topics and questions in the same order, written as natural
             Hebrew study prose; names in Hebrew (רמב"ם, ברטנורא, תוספות יום טוב,
             תפארת ישראל (יכין), תוספות רבי עקיבא איגר…); pasuk.label like
             "משנה ברכות א, א"; every ref, quote, mishnah number and anchor
             identical to the English }
}
```

Quotes: copy them from the Sefaria text you fetched, at least three words in a
row (two excerpts may be joined with "…", each at least two words, in the order
they appear). `pasuk.text` and every anchor must be words of that mishnah, and
`pasuk.ref` must be that single mishnah. `era` is `rishon` or `acharon` (the
Rambam, Rash and Ra'avad are rishonim). Plain text only: no Markdown, no HTML.
Do not write answers or explanations that no source gives.

## Step 5 – verify

```sh
python3 scripts/verify_brief.py /tmp/brief.json
python3 scripts/check_perek.py /tmp/brief.json "<ref>"
python3 scripts/source_breadth.py /tmp/brief.json "<ref>"
```

`verify_brief.py` removes every question, asker or answer whose quote is not in
its source, and exits 1 under 5 verified questions. `check_perek.py` removes
topics whose quote or anchors are not found, and exits 1 under 4 topics.
`source_breadth.py` exits 1 if anything cited is not a mefaresh on this
masechet, fewer than 5 distinct works are cited, one work is the only asker of
more than 3 questions, or one work holds more than 40% of citations.

On any exit 1: go back to steps 3–4, read more, fix quotes by copying them
exactly, remove what is not allowed, and run all three again. If a second full
pass still fails because Sefaria truly has little on this perek, continue, and
say so in the final line. Never edit the file after the checks pass, except by
re-running them.

## Step 6 – email (daily only)

Send the English brief built from the **verified** JSON to
rosenbaum.jeremy@gmail.com with the Gmail connector:

- Subject: `Mishnah Yomit: <Masechet> <perek> – <date>`
- HTML body (inline styles only): title with masechet and perek (Hebrew /
  English), Hebrew and Gregorian date, a link "Open on the site" to
  `site_url`, and the Sefaria link of the perek; the summary; "Key terms &
  topics", each with its explanation and source quote; "Questions of the
  mefarshim", each with the words of the mishnah, the question, who asks it
  with their quote, each answer with its source and quote, and why it matters;
  then "Sources consulted". Hebrew in `<span dir="rtl" lang="he">`; every ref a
  link to `https://www.sefaria.org/<ref with spaces as underscores>`.
- One email per run; retry once on failure. A failed email must not stop step 7.

## Step 7 – publish

1. `git pull --rebase origin main`.
2. `python3 scripts/add_brief.py /tmp/brief.json` — fetches the perek's text,
   writes `site/data/perakim/<masechet>-<perek>.json` and updates `index.json`.
3. `git add site/data/perakim` — nothing else — and commit as
   `git -c user.name="Mishnah Yomit routine" -c user.email="rosenbaum.jeremy@gmail.com" commit -m "Mishnah: <Masechet> <perek> (<date>)"`.
4. `git push origin main`; if rejected because main moved, pull --rebase and
   retry (3 tries). If refused for permission, push to `claude/mishnah-<date>`
   and say so.

Finish with one line per date: how many questions and topics passed
verification, how many distinct works were cited and whether the breadth check
passed, whether the email was sent, and whether the commit was pushed. Do not
change any other file, open PRs, or send any other email.

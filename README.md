# משנה יומית — Mishnah Yomit

A static site with one perek of Mishnah a day: a summary, the key terms and
topics explained, and the questions of the mefarshim on the Mishnah with their
answers. The Mishnah text is on the right; every term and question is linked to
its words in the text and opens in a collapsible panel on the left. Browse the
six sedarim and every masechet's perakim from the home page.

Linked from the לימוד יומי home page (`../home-site`).

## Where the content comes from

The "Mishnah Yomit" cloud routine runs at 03:00 Israel time and follows
[ROUTINE.md](ROUTINE.md). `scripts/add_brief.py --info <date>` gives the day's
perek: one a day straight through Shas in Sefaria's order (525 perakim,
Berakhot 1 on 2026-10-08, then starting again). The routine reads the
mefarshim on Sefaria, files the brief with
`scripts/add_brief.py brief.json`, then commits and pushes. Cloudflare deploys
on push.

Every perek's Mishnah text is on the site from the start
(`scripts/add_texts.py` wrote a text-only file for each one; safe to re-run).
A perek without its brief yet shows the text and the date the routine will
study it; filing the brief replaces the file with the full record.

```
site/
  index.html, app.css, app.js, icon.svg
  data/masechtot.json                 sedarim, masechtot, number of perakim
  data/perakim/index.json             {"days": [{date, masechet, perek, ref}]}
  data/quiz/<masechet>-<perek>.json   one perek's quiz; data/quiz/index.json lists them
  data/perakim/<masechet>-<perek>.json  one perek's brief, with the Mishnah text
                                      (text only until its brief is filed)
```

## Quizzes

Each perek can have a multiple-choice quiz (חידון) on the words of the Mishnah, and each
masechet a quiz drawn from all its perakim' questions — the same game as the parasha
quizzes on aliyah-yomit. `scripts/quiz.py` checks every quote against the text and
publishes to `site/data/quiz/`; [ROUTINE-QUIZ.md](ROUTINE-QUIZ.md) says how to write them.
Masechet Shabbat has its quizzes.

## Grounding

Every question, asker, answer and topic carries the exact words it quotes from
a linked Sefaria ref. `scripts/verify_brief.py` (the same file as in
aliyah-yomit and tanach-summaries) checks the questions, `scripts/check_perek.py`
checks the topics and their links into the text, and
`scripts/source_breadth.py` makes sure only the mefarshim on the Mishnah are
cited, and enough of them.

## Running locally

```sh
python -m http.server 8130 --directory site
```

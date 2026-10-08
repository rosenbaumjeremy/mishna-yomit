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
Berakhot 1 on 2026-10-09, then starting again). The routine reads the
mefarshim on Sefaria, files the brief with
`scripts/add_brief.py brief.json`, then commits and pushes. Cloudflare deploys
on push.

```
site/
  index.html, app.css, app.js, icon.svg
  data/masechtot.json                 sedarim, masechtot, number of perakim
  data/perakim/index.json             {"days": [{date, masechet, perek, ref}]}
  data/perakim/<masechet>-<perek>.json  one perek's brief, with the Mishnah text
```

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

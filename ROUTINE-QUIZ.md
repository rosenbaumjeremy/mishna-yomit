# Perek quizzes

How to write the multiple-choice quizzes (חידונים) for a masechet — the same game as the
parasha quizzes on aliyah-yomit. Each perek gets its own quiz (the חידון button on the
perek page), and the masechet's חידון chip on the home page draws a quiz of any size from
all of its perakim.

Masechet Shabbat was the first (2026-11-10). Do one masechet at a time.

## Steps

1. **Which perakim.** Every perek of the masechet that has no file in `site/data/quiz/`.
   The text is in `site/data/perakim/<slug>-<perek>.json` (`mishnayot[i].he`), for every
   perek, published or not.
2. **Read the whole perek** before writing its questions.
3. **Write one draft per perek**, `/tmp/quiz/<slug>-<perek>.json`, with python
   `json.dump(..., ensure_ascii=False)`:

   ```
   {"masechet": "shabbat", "perek": 2, "questions": [
     {"r": "1",
      "q": "לדברי נחום המדי, במה מדליקין?",
      "o": ["בחלב מבושל", "בשמן קיק", "בזפת", "בשעוה"],
      "e": "“נחום המדי אומר, מדליקין בחלב מבשל”.",
      "h": "optional hint"}]}
   ```

   - **12–15 questions a perek**, in the order of the mishnayot and spread over all of them.
     Only a very short perek (two or three short mishnayot) gets fewer, never under 6.
   - Answerable from the words of the Mishnah alone, not from the Gemara or the mefarshim.
   - Mix: who says what (לדברי מי / מי מתיר / מי מחייב), the shiurim and the rulings
     (מה דינו / מה שיעורו / מתי), reasons the Mishnah gives (מדוע / מפני מה), and a few
     "השלימו" with a ___ blank.
   - `"o"`: exactly 4 different answers, **the right one first** (the script shuffles them).
     Distractors are plausible — often the ruling of the other tanna, or of the case next to
     it — and clearly wrong by the text for what is asked. None of them may also be true.
     When the mishnah has a machlokes, say whose view the question asks about.
   - `"r"`: the mishnah (`"3"`) or mishnayot (`"3-4"`) that answer it.
   - `"e"`: the answer in the Mishnah's own words, in “ ”.
   - Quotes go between “ ” and are typed without nikud, **spelled exactly as in the text**
     (חיב, מתר, כלן, חל…). Each must appear word for word in the mishnayot of `"r"`
     (`...` skips words, `___` leaves a blank); the script replaces it with the text's own
     words with nikud.
   - A hint (`"h"`) on a few of the harder questions.
4. **Check:** `python3 scripts/quiz.py --check /tmp/quiz/<slug>-*.json`. It refuses a quote
   that is not in its mishnayot, a bad `"r"`, or the wrong number of questions; fix and rerun.
   Then reread every question with its mishnah and make sure the answer is right and no
   distractor is also true.
5. **Publish:** `python3 scripts/quiz.py /tmp/quiz/<slug>-*.json` writes
   `site/data/quiz/<slug>-<perek>.json` and `site/data/quiz/index.json`.
6. **Commit and push** to `main` (Cloudflare deploys on push):
   `git add site/data/quiz && git commit -m "Quizzes: Masechet <Name>" && git push`.

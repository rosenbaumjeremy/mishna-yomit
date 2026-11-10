"use strict";

/* Mishnah Yomit: a perek a day with the mefarshim. Browse the six sedarim, open
   a perek, read the Mishnah on the right; the terms and the questions of the
   mefarshim sit on the left, each linked to the words in the text. */

const UI = {
  hebrew: {
    dir: "rtl",
    title: "משנה יומית",
    subtitle: "פרק ליום – מושגים וקושיות המפרשים",
    docTitle: "משנה יומית — פרק ליום עם המפרשים",
    latest: "הפרק האחרון",
    open: "לפרק",
    back: "→ כל המסכתות",
    perek: "פרק",
    perakim: (n) => `${n} פרקים`,
    sefaria: "הטקסט בספריא",
    summary: "סיכום הפרק",
    summaries: "סיכומים",
    summariesOf: (m) => `סיכומי מסכת ${m}`,
    backMasechet: "→ לכל המסכתות",
    noSummaries: "עדיין לא פורסמו פרקים במסכת זו.",
    text: "לשון המשנה",
    topics: "מושגים ונושאים",
    questions: "קושיות המפרשים",
    askedBy: "המקשה",
    answer: (i) => `תירוץ ${"אבגדהוזח"[i]}`,
    why: "למה זה חשוב",
    sources: "מקורות שנבדקו",
    mishnah: (n) => `משנה ${"אבגדהוזחטיכלמנ"[n - 1] || n}`,
    legendQ: "קושיה",
    legendT: "מושג",
    expand: "פתח הכל",
    collapse: "סגור הכל",
    translation: "תרגום (אנגלית)",
    loading: "טוען…",
    failed: "לא ניתן היה לטעון את הפרק.",
    published: "פורסם",
    quiz: "חידון",
    quizPerek: (name) => `חידון — ${name}`,
    quizMasechet: (name) => `חידון — מסכת ${name}`,
    quizSub: "שאלות אמריקאיות על לשון המשנה",
    quizMasechetSub: "שאלות מכל פרקי המסכת, מתוך מאגר השאלות של החידונים על הפרקים",
    quizNone: "עדיין אין חידון על פרק זה.",
    quizRules: (p, from, bonus) => `${p} נקודות על כל תשובה נכונה, ועוד ${bonus} נקודות בונוס מהתשובה ה־${from} ברצף.`,
    quizPoints: (n) => `${n} נק׳`,
    quizCount: (right, done, total) => `${right}/${done} נכונות · ${done} מתוך ${total}`,
    quizStreakToast: (n, total) => (n === total ? `🏆 ${n} ברצף — בלי אף טעות!` : n >= 10 ? `🔥🔥 ${n} ברצף! מדהים!` : `🔥 ${n} ברצף!`),
    quizRank: (right, total, all) => { const w = all ? "במסכת" : "בפרק"; return right === total ? `מושלם! בקיא ${w} כמו תלמיד חכם` : right / total >= 0.9 ? "תלמיד חכם!" : right / total >= 0.7 ? `בקיא ${w}!` : right / total >= 0.5 ? "בדרך הנכונה" : `כדאי לחזור על ${all ? "המסכת" : "הפרק"} ולנסות שוב`; },
    quizLongest: (n) => `הרצף הארוך ביותר: ${n}`,
    quizBest: "השיא שלך",
    quizBestShort: (right, total) => `${right} מתוך ${total}`,
    quizNewBest: "🎉 שיא אישי חדש!",
    quizReview: "לחזרה על הטעויות:",
    quizAgain: "לשחק שוב",
    quizRight: ["נכון!", "יפה מאוד!", "מצוין!", "בדיוק!", "כל הכבוד!", "אלוף!"],
    quizWrong: ["לא בדיוק.", "כמעט.", "לא הפעם.", "טעות קטנה."],
    quizHintBtn: (n) => `רמז (השאלה תהיה שווה ${n} נק׳)`,
    quizReset: "התחל מחדש",
    quizMishnah: "למשנה בספריא",
    quizNote: "",
    quizBack: "→ לפרק",
    mHowMany: "כמה שאלות?",
    mFrom: "מאילו פרקים?",
    mAll: "כולם",
    mClear: "נקה",
    mPick: "בחרו לפחות פרק אחד.",
    mWillDraw: (n, k, max) => `ייבחרו ${n} שאלות באקראי, מחולקות באופן שווה בין ${k === 1 ? "פרק אחד" : `${k} פרקים`} (יש במאגר ${max}).`,
    mPartial: (have, all) => `יש חידון ל־${have} מתוך ${all} הפרקים במסכת; השאר יתווספו כשיתפרסמו.`,
    mNone: "עדיין אין חידונים על פרקי המסכת הזאת.",
    mStart: "התחילו את החידון",
    mOrder: "סדר השאלות",
    mInOrder: "לפי סדר הפרקים",
    mMixed: "מעורבב",
    mAgain: "שאלות חדשות",
    mChange: "שינוי ההגדרות",
    pending: (d) => `הסיכום, המושגים וקושיות המפרשים על פרק זה יתפרסמו ${d}.`,
    pendingToday: "היום",
    pendingOn: (heb, greg) => `ב${heb} (${greg})`,
    era: { rishon: "ראשון", acharon: "אחרון", chazal: "חז״ל" },
  },
  english: {
    dir: "ltr",
    title: "Mishnah Yomit",
    subtitle: "A perek a day – key terms and the questions of the mefarshim",
    docTitle: "Mishnah Yomit — a perek a day with the mefarshim",
    latest: "Latest perek",
    open: "Open the perek",
    back: "← All masechtot",
    perek: "Perek",
    perakim: (n) => `${n} perakim`,
    sefaria: "Text on Sefaria",
    summary: "Summary of the perek",
    summaries: "Summaries",
    summariesOf: (m) => `Masechet ${m}: summaries`,
    backMasechet: "← All masechtot",
    noSummaries: "No perakim of this masechet have been published yet.",
    text: "The Mishnah",
    topics: "Key terms & topics",
    questions: "Questions of the mefarshim",
    askedBy: "Asked by",
    answer: (i) => `Answer ${i + 1}`,
    why: "Why it matters",
    sources: "Sources consulted",
    mishnah: (n) => `Mishnah ${n}`,
    legendQ: "question",
    legendT: "term",
    expand: "Expand all",
    collapse: "Collapse all",
    translation: "English translation",
    loading: "Loading…",
    failed: "Couldn't load the perek.",
    published: "Published",
    quiz: "Quiz",
    quizPerek: (name) => `Quiz — ${name}`,
    quizMasechet: (name) => `Quiz — Masechet ${name}`,
    quizSub: "Multiple-choice questions on the words of the Mishnah",
    quizMasechetSub: "Questions from every perek of the masechet, drawn from the perek quizzes' question bank",
    quizNone: "There is no quiz on this perek yet.",
    quizRules: (p, from, bonus) => `${p} points for each right answer, plus a ${bonus}-point bonus from the ${from}rd in a row.`,
    quizPoints: (n) => `${n} pts`,
    quizCount: (right, done, total) => `${right}/${done} right · ${done} of ${total}`,
    quizStreakToast: (n, total) => (n === total ? `🏆 ${n} in a row — not a single mistake!` : n >= 10 ? `🔥🔥 ${n} in a row! Amazing!` : `🔥 ${n} in a row!`),
    quizRank: (right, total, all) => { const w = all ? "the masechet" : "the perek"; return right === total ? `Perfect! You know ${w} like a talmid chacham` : right / total >= 0.9 ? "Talmid chacham!" : right / total >= 0.7 ? `You know ${w}!` : right / total >= 0.5 ? "On the right track" : `Worth reviewing ${w} and trying again`; },
    quizLongest: (n) => `Longest streak: ${n}`,
    quizBest: "Your best",
    quizBestShort: (right, total) => `${right} of ${total}`,
    quizNewBest: "🎉 New personal best!",
    quizReview: "Review your mistakes:",
    quizAgain: "Play again",
    quizRight: ["Correct!", "Very good!", "Excellent!", "Exactly!", "Well done!", "Champion!"],
    quizWrong: ["Not quite.", "Almost.", "Not this time.", "A small slip."],
    quizHintBtn: (n) => `Hint (this question will be worth ${n} pts)`,
    quizReset: "Start over",
    quizMishnah: "The mishnah on Sefaria",
    quizNote: "The questions are in Hebrew.",
    quizBack: "← Back to the perek",
    mHowMany: "How many questions?",
    mFrom: "From which perakim?",
    mAll: "All",
    mClear: "Clear",
    mPick: "Choose at least one perek.",
    mWillDraw: (n, k, max) => `${n} questions will be drawn at random, spread evenly over ${k === 1 ? "1 perek" : `${k} perakim`} (${max} in the bank).`,
    mPartial: (have, all) => `${have} of the ${all} perakim in this masechet have a quiz so far; the rest are added as they are published.`,
    mNone: "There are no quizzes on this masechet's perakim yet.",
    mStart: "Start the quiz",
    mOrder: "Order of the questions",
    mInOrder: "In perek order",
    mMixed: "Mixed",
    mAgain: "New questions",
    mChange: "Change settings",
    pending: (d) => `The summary, key terms and questions of the mefarshim on this perek will be published ${d}.`,
    pendingToday: "later today",
    pendingOn: (heb, greg) => `on ${greg} (${heb})`,
    era: { rishon: "Rishon", acharon: "Acharon", chazal: "Chazal" },
  },
};

const state = { lang: "hebrew", sedarim: [], days: [], perek: null, summaries: null, cache: new Map(),
  quiz: null,            // the open quiz: {slug, perek} for a perek, {slug} for the whole masechet
  quizzes: new Set() };  // "<slug>-<perek>" of every perek with a quiz (data/quiz/index.json)

const el = (id) => document.getElementById(id);
const t = () => UI[state.lang];
const node = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const sefariaUrl = (ref) => "https://www.sefaria.org/" + encodeURIComponent(ref.replace(/ /g, "_")).replace(/%3A/g, ":");
const HEB_NUM = (n) => {
  const ones = "אבגדהוזחט", tens = "יכלמנ";
  if (n === 15) return "טו"; if (n === 16) return "טז";
  return (n >= 10 ? tens[Math.floor(n / 10) - 1] : "") + (n % 10 ? ones[(n % 10) - 1] : "");
};
const fileFor = (slug, perek) => `data/perakim/${slug}-${perek}.json`;
const published = (slug, perek) => state.days.some((d) => d.masechet === slug && d.perek === perek);
const masechetBySlug = (slug) => {
  for (const s of state.sedarim) for (const m of s.masechtot) if (m.slug === slug) return m;
  return null;
};

// The routine studies one perek a day straight through Shas in this order,
// Berakhot 1 on START, then begins again (scripts/add_brief.py).
const START = Date.UTC(2026, 9, 8);
const DAY = 864e5;
const israelToday = () => {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
  const [y, mo, d] = s.split("-").map(Number);
  return Date.UTC(y, mo - 1, d);
};
// The next date (today or later) whose routine run studies this perek.
function dueDate(slug, perek) {
  const order = [];
  for (const s of state.sedarim) for (const m of s.masechtot) for (let p = 1; p <= m.perakim; p++) order.push(`${m.slug}-${p}`);
  const i = order.indexOf(`${slug}-${perek}`);
  if (i < 0) return null;
  const today = israelToday();
  let at = START + i * DAY;
  while (at < today) at += order.length * DAY;
  return { ms: at, today: at === today };
}
// 1 -> א׳, 15 -> ט״ו, 787 -> תשפ״ז
function gematria(n) {
  const vals = [[400, "ת"], [300, "ש"], [200, "ר"], [100, "ק"], [90, "צ"], [80, "פ"], [70, "ע"], [60, "ס"], [50, "נ"],
    [40, "מ"], [30, "ל"], [20, "כ"], [10, "י"], [9, "ט"], [8, "ח"], [7, "ז"], [6, "ו"], [5, "ה"], [4, "ד"], [3, "ג"], [2, "ב"], [1, "א"]];
  let s = "";
  for (const [v, ch] of vals) {
    while (n >= v) {
      if (n === 15 || n === 16) { s += "ט" + (n === 15 ? "ו" : "ז"); n = 0; break; }
      s += ch; n -= v;
    }
  }
  return s.length > 1 ? `${s.slice(0, -1)}״${s.slice(-1)}` : `${s}׳`;
}
function dueText(due) {
  if (due.today) return t().pendingToday;
  const date = new Date(due.ms);
  const greg = date.toISOString().slice(0, 10);
  let heb = greg;
  try {
    const he = state.lang === "hebrew";
    const parts = new Intl.DateTimeFormat(he ? "he-IL-u-ca-hebrew-nu-latn" : "en-u-ca-hebrew-nu-latn",
      { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).formatToParts(date);
    const get = (k) => (parts.find((x) => x.type === k) || {}).value;
    const day = +get("day"), year = +get("year"), month = get("month");
    heb = he ? `${gematria(day)} ב${month.replace(/^ב/, "")} ${gematria(year % 1000)}` : `${day} ${month} ${year}`;
  } catch {}
  return t().pendingOn(heb, greg);
}

/* ---------- matching anchor phrases in the vocalised text ---------- */

// Drop nikud/te'amim, the vowel letters ו and י, spaces and punctuation, keeping
// a map back to the original characters, so "לאכול" finds "לֶאֱכֹל".
const isMark = (c) => c >= "֑" && c <= "ׇ";
function squash(text) {
  const chars = [], map = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (isMark(c) || c === "ו" || c === "י" || !/[א-תa-z0-9]/i.test(c)) continue;
    chars.push(c); map.push(i);
  }
  return { s: chars.join(""), map };
}

function ranges(text, anchors) {
  const { s, map } = squash(text), out = [];
  for (const a of anchors) {
    const needle = squash(a).s;
    if (!needle) continue;
    let at = s.indexOf(needle);
    while (at >= 0) {
      let end = map[at + needle.length - 1] + 1;
      while (end < text.length && isMark(text[end])) end++;
      out.push([map[at], end]);
      at = s.indexOf(needle, at + needle.length);
    }
  }
  return out;
}

// Split the text at every range boundary; each piece knows which items cover it.
function highlighted(text, items) {
  const spans = [];
  items.forEach((it) => ranges(text, it.anchors || []).forEach(([a, b]) => spans.push({ a, b, it })));
  const cuts = new Set([0, text.length]);
  spans.forEach((r) => { cuts.add(r.a); cuts.add(r.b); });
  const points = [...cuts].sort((x, y) => x - y);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const piece = text.slice(a, b);
    const covering = spans.filter((r) => r.a <= a && r.b >= b).map((r) => r.it);
    if (!covering.length) { frag.append(piece); continue; }
    const m = node("mark", "hl", piece);
    if (covering.some((x) => x.kind === "q")) m.classList.add("q");
    if (covering.some((x) => x.kind === "t")) m.classList.add("t");
    m.dataset.items = covering.map((x) => x.id).join(" ");
    m.title = covering.map((x) => x.title).join(" · ");
    frag.append(m);
  }
  return frag;
}

/** Where pdf.js puts the PDF and Print buttons. */
const pdfTools = () => { const d = document.createElement("div"); d.dataset.pdfTools = ""; return d; };

/* ---------- data ---------- */

async function load() {
  const [m, d, q] = await Promise.all([
    fetch("data/masechtot.json").then((r) => r.json()),
    fetch("data/perakim/index.json").then((r) => r.json()).catch(() => ({ days: [] })),
    fetch("data/quiz/index.json").then((r) => r.json()).catch(() => ({ days: [] })),
  ]);
  state.quizzes = new Set(q.days.map((x) => `${x.masechet}-${x.perek}`));
  state.sedarim = m.sedarim;
  state.days = d.days.sort((a, b) => a.date.localeCompare(b.date));
}

function getPerek(slug, perek) {
  const key = `${slug}-${perek}`;
  if (!state.cache.has(key)) state.cache.set(key, fetch(fileFor(slug, perek)).then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }));
  return state.cache.get(key);
}

/* ---------- summaries: one paragraph per mishnah, its number in bold ---------- */

// "Mishnah 2", "Mishnayot 3–4"; "משנה ב", "משניות ג-ד" (Hebrew numerals only, so
// "משנה זו" is not taken for a number).
const HEB_N = "(?:טו|טז|י?[א-ט]|י|כ[א-ט]?|ל)['׳]?";
const MISHNAH_RE = new RegExp(
  String.raw`\bMishna(?:h|yot)\s+\d+(?:\s*(?:[–-]|and)\s*\d+)?|(?:משנה|משניות)\s+${HEB_N}(?:\s*[–-]\s*${HEB_N})?(?=[\s:,.;)]|$)`, "g");

function summaryParas(text) {
  const frag = document.createDocumentFragment();
  const marks = [...(text || "").matchAll(MISHNAH_RE)];
  const para = (from, to, m) => {
    const p = node("p", "sum-para");
    if (m) {
      p.append(node("b", "mnum", m[0]));
      p.append(text.slice(from + m[0].length, to));
    } else p.append(text.slice(from, to));
    if (p.textContent.trim()) frag.append(p);
  };
  marks.forEach((m, i) => {
    if (i === 0 && m.index > 0) para(0, m.index);
    para(m.index, i + 1 < marks.length ? marks[i + 1].index : text.length, m);
  });
  if (!marks.length) para(0, (text || "").length);
  return frag;
}

/* ---------- views ---------- */

function renderChrome() {
  const u = t();
  document.documentElement.lang = state.lang === "hebrew" ? "he" : "en";
  document.documentElement.dir = u.dir;
  document.documentElement.style.setProperty("--dir", u.dir);
  document.title = u.docTitle;
  el("title").textContent = u.title;
  el("subtitle").textContent = u.subtitle;
  document.querySelectorAll(".langswitch button").forEach((b) => b.classList.toggle("on", b.dataset.lang === state.lang));
}

const masechetName = (m) => (state.lang === "hebrew" ? m.he : m.en);
const perekName = (m, p) => state.lang === "hebrew" ? `${m.he}, פרק ${HEB_NUM(p)}` : `${m.en}, Perek ${p}`;

function renderLatest() {
  const box = el("latest");
  box.replaceChildren();
  const last = state.days[state.days.length - 1];
  if (!last || state.perek || state.summaries || state.quiz) return;
  const m = masechetBySlug(last.masechet);
  const card = node("div", "latest");
  card.append(node("p", "label", t().latest), node("h2", null, perekName(m, last.perek)),
    node("p", "range", `${t().published} ${last.date}`));
  const b = node("button", "button", t().open);
  b.onclick = () => go(last.masechet, last.perek);
  card.append(b);
  box.append(card);
}

function renderSedarim() {
  const box = el("sedarim");
  box.replaceChildren();
  box.hidden = !!(state.perek || state.summaries || state.quiz);
  if (state.perek || state.summaries || state.quiz) return;
  for (const s of state.sedarim) {
    const sec = node("section", "seder");
    sec.append(node("h2", null, state.lang === "hebrew" ? `סדר ${s.he}` : `Seder ${s.en}`));
    const grid = node("div", "masechtot");
    for (const m of s.masechtot) {
      const card = node("div", "masechet");
      const h = node("h3", null, masechetName(m));
      h.append(node("small", null, t().perakim(m.perakim)));
      const chips = node("div", "chips");
      let any = false;
      for (let p = 1; p <= m.perakim; p++) {
        const label = state.lang === "hebrew" ? HEB_NUM(p) : String(p);
        // every perek has its text; the published ones also have their brief
        const done = published(m.slug, p);
        any = any || done;
        const a = node("a", done ? "chip" : "chip soon", label);
        a.href = `#${m.slug}-${p}`;
        chips.append(a);
      }
      const sumLabel = t().summaries;
      if (any) {
        card.classList.add("has");
        const a = node("a", "chip sum", sumLabel);
        a.href = `#${m.slug}-summaries`;
        chips.append(a);
      } else chips.append(node("span", "chip sum", sumLabel));
      if (quizPerakim(m).length) {
        card.classList.add("has");
        const a = node("a", "chip sum quiz", t().quiz);
        a.href = `#${m.slug}-quiz`;
        chips.append(a);
      }
      card.append(h, chips);
      grid.append(card);
    }
    sec.append(grid);
    box.append(sec);
  }
}

function cite(who) {
  const p = node("div", "cite");
  const b = node("b", null, who.name);
  p.append(b);
  if (who.era) p.append(node("span", "era", t().era[who.era] || who.era));
  p.append(" (");
  const a = node("a", null, t().sefaria);
  a.href = sefariaUrl(who.ref); a.target = "_blank"; a.rel = "noopener";
  p.append(a, "): ");
  p.append(node("span", "quote", `"${who.quote}"`));
  return p;
}

function mref(n) {
  const b = node("button", "mref", t().mishnah(n));
  b.type = "button";
  b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); focusMishnah(n); };
  return b;
}

function itemBox(it, idx) {
  const d = node("details", `item ${it.kind === "q" ? "question" : "topic"}`);
  d.id = it.id;
  const s = node("summary");
  s.append(node("span", "n", it.kind === "q" ? `${idx + 1}.` : "◆"), node("span", "ttl", it.title), mref(it.mishnah));
  const body = node("div", "body");
  if (it.kind === "t") {
    body.dataset.pdfDetail = "explain";   // the PDF can keep just the term (pdf.js)
    body.append(node("p", null, it.data.explanation), cite(it.data.source));
  } else {
    const q = it.data;
    body.append(node("p", "anchor", `"${q.pasuk.text}"`), node("p", null, q.question));
    const askers = node("div", "askers");
    askers.dataset.pdfDetail = "answers";   // printed only together with the answers (pdf.js)
    askers.append(node("div", "label", t().askedBy));
    q.asked_by.forEach((w) => askers.append(cite(w)));
    body.append(askers);
    q.answers.forEach((a, i) => {
      const box = node("div", "answer");
      box.dataset.pdfDetail = "answers";   // the PDF can keep just the questions (pdf.js)
      box.append(node("div", "label", t().answer(i)), node("p", null, a.text));
      a.sources.forEach((w) => box.append(cite(w)));
      body.append(box);
    });
    if (q.why) {
      const why = node("p", "why", `${t().why}: ${q.why}`);
      why.dataset.pdfDetail = "answers";
      body.append(why);
    }
  }
  d.append(s, body);
  d.addEventListener("mouseenter", () => light(it.id, true));
  d.addEventListener("mouseleave", () => light(it.id, false));
  return d;
}

function group(title, items, open) {
  const d = node("details", "box");
  d.dataset.pdf = title;
  d.open = open;
  const s = node("summary", null, title);
  s.append(node("span", "count", String(items.length)));
  const body = node("div", "body");
  const bar = node("div", "toolbar");
  const ex = node("button", null, t().expand), co = node("button", null, t().collapse);
  ex.type = co.type = "button";
  ex.onclick = () => body.querySelectorAll("details.item").forEach((x) => (x.open = true));
  co.onclick = () => body.querySelectorAll("details.item").forEach((x) => (x.open = false));
  bar.append(ex, co);
  body.append(bar);
  items.forEach((it, i) => body.append(itemBox(it, i)));
  d.append(s, body);
  return d;
}

function light(id, on) {
  document.querySelectorAll("mark.hl").forEach((m) => {
    if (m.dataset.items.split(" ").includes(id)) m.classList.toggle("lit", on);
  });
}

// Bring a node into view: inside its own scrolling column on wide screens,
// in the page when the columns are stacked.
function reveal(target) {
  const col = target.closest(".text-col, .side-col");
  if (col && col.scrollHeight > col.clientHeight + 1) {
    const top = target.getBoundingClientRect().top - col.getBoundingClientRect().top + col.scrollTop - 8;
    col.scrollTo({ top });
    const lay = col.closest(".layout").getBoundingClientRect().top;
    if (lay > 120 || lay < 60) window.scrollBy({ top: lay - 78 });
  } else {
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 86 });
  }
}

function focusMishnah(n) {
  const m = el(`m${n}`);
  if (!m) return;
  reveal(m);
  m.classList.remove("flash"); void m.offsetWidth; m.classList.add("flash");
}

function openItems(ids) {
  let first = null;
  ids.forEach((id) => {
    const d = el(id);
    if (!d) return;
    d.closest("details.box").open = true;
    d.open = true;
    d.classList.add("lit");
    setTimeout(() => d.classList.remove("lit"), 1600);
    first = first || d;
  });
  if (first) reveal(first);
}

async function renderSummaries() {
  const box = el("perek");
  const slug = state.summaries;
  const m = masechetBySlug(slug);
  const back = node("button", "back", t().backMasechet);
  back.onclick = () => { location.hash = ""; };
  const head = node("div", "perek-head");
  head.dataset.pdfHead = "";
  head.append(node("h2", null, t().summariesOf(masechetName(m))));
  if (quizPerakim(m).length) {
    const qb = node("a", "button quizlink", t().quiz);
    qb.href = `#${slug}-quiz`;
    head.append(qb);
  }
  head.append(pdfTools());
  box.append(back, head);
  const perakim = [...new Set(state.days.filter((d) => d.masechet === slug).map((d) => d.perek))].sort((a, b) => a - b);
  if (!perakim.length) { box.append(node("p", "muted", t().noSummaries)); return; }
  const wait = node("p", "muted", t().loading);
  box.append(wait);
  const all = await Promise.all(perakim.map((p) => getPerek(slug, p).catch(() => null)));
  if (state.summaries !== slug) return;
  wait.remove();
  all.forEach((data, i) => {
    if (!data) return;
    const p = perakim[i];
    const d = node("details", "box");
    d.open = true;
    d.dataset.pdf = perekName(m, p);
    const s = node("summary");
    const a = node("a", null, perekName(m, p));
    a.href = `#${slug}-${p}`;
    a.onclick = (e) => e.stopPropagation();
    s.append(a, node("span", "count", data.date));
    const b = node("div", "body");
    b.append(summaryParas(data[state.lang].summary));
    d.append(s, b);
    box.append(d);
  });
}

async function renderPerek() {
  const box = el("perek");
  box.hidden = !state.perek && !state.summaries && !state.quiz;
  box.replaceChildren();
  if (state.quiz) return renderQuiz(box);
  if (state.summaries) return renderSummaries();
  if (!state.perek) return;
  const { slug, perek } = state.perek;
  const m = masechetBySlug(slug);
  const back = node("button", "back", t().back);
  back.onclick = () => { location.hash = ""; };
  box.append(back, node("p", "muted", t().loading));

  let data;
  try { data = await getPerek(slug, perek); }
  catch { box.lastChild.textContent = t().failed; return; }
  if (!state.perek || state.perek.slug !== slug || state.perek.perek !== perek) return;
  box.lastChild.remove();

  const sec = data[state.lang];   // absent until the routine files this perek's brief
  const ref = `${m.title} ${perek}`;
  const head = node("div", "perek-head");
  head.dataset.pdfHead = "";
  head.append(node("h2", null, perekName(m, perek)));
  const meta = node("p");
  if (sec) meta.append(`${data.hebrew_date[state.lang === "hebrew" ? "hebrew" : "english"]} · ${data.date} · `);
  const a = node("a", null, t().sefaria);
  a.href = sefariaUrl(ref); a.target = "_blank"; a.rel = "noopener";
  meta.append(a);
  if (state.quizzes.has(`${slug}-${perek}`)) {
    const qb = node("a", "button quizlink", t().quiz);
    qb.href = `#${slug}-${perek}-quiz`;
    head.append(qb);
  }
  head.append(meta, pdfTools());
  box.append(head);

  if (!sec) {
    const due = dueDate(slug, perek);
    if (due) box.append(node("p", "pending", t().pending(dueText(due))));
    box.append(textColumn(data, []));
    return;
  }

  const sum = node("details", "box");
  sum.open = true;
  sum.dataset.pdf = t().summary;
  sum.append(node("summary", null, t().summary));
  const sb = node("div", "body");
  sb.append(summaryParas(sec.summary));
  sum.append(sb);
  box.append(sum);

  const items = [
    ...sec.topics.map((x, i) => ({ kind: "t", id: `t${i}`, title: x.term, mishnah: x.mishnah, anchors: x.anchors, data: x })),
    ...sec.questions.map((x, i) => ({ kind: "q", id: `q${i}`, title: x.title, mishnah: x.mishnah, anchors: x.anchors, data: x })),
  ];

  const layout = node("div", "layout");
  const textCol = textColumn(data, items);

  // left: terms and questions
  const side = node("div", "side-col");
  side.append(group(t().topics, items.filter((x) => x.kind === "t"), false));
  side.append(group(t().questions, items.filter((x) => x.kind === "q"), false));
  const src = node("details", "box");
  src.dataset.pdf = t().sources;
  src.append(node("summary", null, t().sources));
  const srcBody = node("div", "body");
  srcBody.append(node("p", "sources", (sec.sources_consulted || []).join(" · ")));
  src.append(srcBody);
  side.append(src);

  layout.append(textCol, side);
  box.append(layout);
}

// The Mishnah text, with the words each term and question explains marked.
function textColumn(data, items) {
  const textCol = node("div", "text-col");
  textCol.dataset.pdf = t().text;
  const card = node("div", "mishnah-card");
  data.mishnayot.forEach((mm, i) => {
    const n = i + 1;
    const p = node("div", "mishnah");
    p.id = `m${n}`;
    p.append(node("span", "num", HEB_NUM(n)));
    p.append(highlighted(mm.he, items.filter((x) => x.mishnah === n)));
    if (state.lang === "english" && mm.en) {
      const det = node("details", "en");
      det.append(node("summary", null, t().translation));
      const div = node("div");
      div.innerHTML = mm.en.replace(/<(?!\/?(b|i|br)\b)[^>]*>/gi, "");
      det.append(div);
      p.append(det);
    }
    card.append(p);
  });
  card.addEventListener("click", (e) => {
    const mk = e.target.closest("mark.hl");
    if (mk) openItems(mk.dataset.items.split(" "));
  });
  textCol.append(card);
  if (items.length) {
    const legend = node("p", "legend");
    legend.append(node("span", "lq", t().legendQ), node("span", "lt", t().legendT));
    textCol.append(legend);
  }
  return textCol;
}

/* ---------- quiz: multiple-choice questions on a perek, or a whole masechet (scripts/quiz.py) ----------
   The same game as the parasha quizzes on aliyah-yomit: a perek is a parasha, a masechet a sefer. */

// Scoring: 10 points for a right answer (5 if the hint was opened), +5 for every right answer
// that is the 3rd or more in a row.
const QUIZ_POINTS = 10, QUIZ_HINTED = 5, QUIZ_STREAK_BONUS = 5, QUIZ_STREAK_FROM = 3;
// A masechet quiz draws its questions from the perakim's question banks; these are the sizes offered.
const MASECHET_SIZES = [10, 20, 30, 50, 100];
const MASECHET_DEFAULT = 20;

const quizFiles = new Map();     // "<slug>-<perek>" -> fetch promise
const quizRuns = new Map();      // quiz key -> this visit's run: {chosen: Map(i -> option), hinted: Set(i), questions?, size?}
const masechetSetups = new Map();// slug -> {count, perakim: Set, mix} last chosen on this visit

const quizKey = (q) => (q.perek ? `${q.slug}-${q.perek}` : `masechet:${q.slug}`);
const quizPerakim = (m) => {
  const out = [];
  for (let p = 1; p <= m.perakim; p++) if (state.quizzes.has(`${m.slug}-${p}`)) out.push(p);
  return out;
};

function loadQuiz(slug, perek) {
  const key = `${slug}-${perek}`;
  if (!quizFiles.has(key)) {
    quizFiles.set(key, fetch(`data/quiz/${key}.json`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch((error) => { quizFiles.delete(key); throw error; }));
  }
  return quizFiles.get(key);
}

/* the best result on this device (only a convenience: it may be missing) */
function quizBest(key) {
  try { return JSON.parse(localStorage.getItem(`quiz-best:${key}`)) || null; } catch { return null; }
}
function saveQuizBest(key, result) {
  try { localStorage.setItem(`quiz-best:${key}`, JSON.stringify(result)); } catch { /* not saved */ }
}

const calm = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const shuffled = (list) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Draw `count` questions spread evenly over the perakim, each tagged with its perek:
 *  in the order of the perakim, or all mixed together. */
function drawMasechet(banks, count, mix) {
  const want = banks.map(() => 0);
  let left = Math.min(count, banks.reduce((s, b) => s + b.questions.length, 0));
  const order = shuffled(banks.map((_, i) => i));
  while (left > 0) {
    for (const i of order) {
      if (left > 0 && want[i] < banks[i].questions.length) { want[i]++; left--; }
    }
  }
  const out = [];
  banks.forEach((bank, i) => {
    const picks = shuffled(bank.questions.map((_, k) => k)).slice(0, want[i]).sort((x, y) => x - y);
    picks.forEach((k) => out.push({ ...bank.questions[k], perek: bank.perek }));
  });
  return mix ? shuffled(out) : out;
}

/** Score a run: points, right answers, current and longest streak, the questions missed. */
function quizTally(questions, run) {
  let points = 0, right = 0, streak = 0, longest = 0;
  const missed = [];
  questions.forEach((q, i) => {
    if (!run.chosen.has(i)) return;
    if (run.chosen.get(i) === q.a) {
      right++; streak++; longest = Math.max(longest, streak);
      points += run.hinted.has(i) ? QUIZ_HINTED : QUIZ_POINTS;
      if (streak >= QUIZ_STREAK_FROM) points += QUIZ_STREAK_BONUS;
    } else { streak = 0; missed.push(i); }
  });
  return { points, right, streak, longest, missed, done: run.chosen.size };
}

/** a burst of confetti over the page */
function confetti() {
  if (calm()) return;
  const layer = node("div", "confetti");
  layer.setAttribute("aria-hidden", "true");
  const colors = ["#b8924a", "#16305c", "#2e7d4f", "#d0675c", "#6f93cf", "#e8c46a"];
  for (let n = 0; n < 90; n++) {
    const bit = node("i");
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[n % colors.length];
    bit.style.animationDelay = `${Math.random() * 0.6}s`;
    bit.style.animationDuration = `${2.2 + Math.random() * 1.6}s`;
    bit.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    bit.style.setProperty("--spin", `${(Math.random() - 0.5) * 1440}deg`);
    layer.appendChild(bit);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4600);
}

/** a short line that floats up from an element: "+15" */
function floatUp(anchor, text, cls) {
  if (calm()) return;
  const tag = node("span", `quizfloat ${cls || ""}`, text);
  tag.dir = "ltr";
  anchor.appendChild(tag);
  setTimeout(() => tag.remove(), 1300);
}

/** a banner under the score bar for a moment: "🔥 5 in a row!" */
function quizToast(host, text) {
  const old = host.querySelector(".quiztoast");
  if (old) old.remove();
  const toast = node("div", "quiztoast", text);
  toast.setAttribute("role", "status");
  host.appendChild(toast);
  setTimeout(() => toast.classList.add("out"), 1800);
  setTimeout(() => toast.remove(), 2400);
}

function renderQuiz(box) {
  const ui = t();
  const { slug, perek } = state.quiz;
  const m = masechetBySlug(slug);
  const key = quizKey(state.quiz);
  const back = node("button", "back", perek ? ui.quizBack : ui.backMasechet);
  back.onclick = () => { location.hash = perek ? `${slug}-${perek}` : ""; };
  const head = node("div", "perek-head quizhead");
  const host = node("div");
  box.append(back, head, host);

  if (!perek) {
    head.append(node("h2", null, ui.quizMasechet(masechetName(m))), node("p", "muted", ui.quizMasechetSub));
    const run = quizRuns.get(key);
    if (run && run.questions) renderQuizRun(host, key, run.questions, { masechet: m });
    else renderMasechetSetup(host, m);
    return;
  }

  head.append(node("h2", null, ui.quizPerek(perekName(m, perek))), node("p", "muted", ui.quizSub));
  if (!state.quizzes.has(key)) { host.append(node("p", "muted", ui.quizNone)); return; }
  const slot = node("p", "muted", ui.loading);
  host.append(slot);
  const lang = state.lang, wanted = key;
  loadQuiz(slug, perek).then((record) => {
    if (state.lang !== lang || !state.quiz || quizKey(state.quiz) !== wanted) return;
    const inner = node("div");
    slot.replaceWith(inner);
    renderQuizRun(inner, wanted, record.questions || [], {});
  }).catch(() => { slot.textContent = ui.failed; });
}

/** The masechet quiz's first screen: how many questions, and from which perakim. */
function renderMasechetSetup(host, m) {
  const ui = t();
  const key = `masechet:${m.slug}`;
  const available = quizPerakim(m);
  if (!available.length) { host.append(node("p", "muted", ui.mNone)); return; }
  if (!masechetSetups.has(m.slug)) masechetSetups.set(m.slug, { count: MASECHET_DEFAULT, perakim: new Set(available), mix: false });
  const setup = masechetSetups.get(m.slug);
  setup.perakim = new Set([...setup.perakim].filter((p) => available.includes(p)));

  const form = node("div", "quizsetup");
  if (ui.quizNote) form.append(node("p", "muted", ui.quizNote));
  form.append(node("p", "quizintro", ui.quizRules(QUIZ_POINTS, QUIZ_STREAK_FROM, QUIZ_STREAK_BONUS)));

  // how many questions
  form.append(node("div", "label", ui.mHowMany));
  const sizes = node("div", "qchips");
  const input = node("input");
  input.type = "number";
  input.min = "1";
  input.inputMode = "numeric";
  input.setAttribute("aria-label", ui.mHowMany);
  const sizeButtons = [];
  const counts = new Map();   // questions in each perek's bank, once its file loads
  const bankSize = () => available.filter((p) => setup.perakim.has(p)).reduce((n, p) => n + (counts.get(p) ?? 12), 0);
  const syncSizes = () => {
    sizeButtons.forEach((b) => b.classList.toggle("on", Number(b.dataset.n) === setup.count));
    if (Number(input.value) !== setup.count) input.value = String(setup.count);
  };
  for (const n of MASECHET_SIZES) {
    const b = node("button", "qchip", String(n));
    b.type = "button";
    b.dataset.n = n;
    b.onclick = () => { setup.count = n; syncSizes(); refresh(); };
    sizeButtons.push(b);
    sizes.append(b);
  }
  input.oninput = () => { const n = Math.floor(Number(input.value)); if (n > 0) { setup.count = n; syncSizes(); refresh(); } };
  sizes.append(input);
  form.append(sizes);

  // from which perakim
  const head = node("div", "label qhead");
  head.append(node("span", null, ui.mFrom));
  const all = node("button", "linkish", ui.mAll);
  all.type = "button";
  const none = node("button", "linkish", ui.mClear);
  none.type = "button";
  head.append(all, none);
  form.append(head);
  const chips = node("div", "qchips");
  const chipButtons = available.map((p) => {
    const b = node("button", "qchip", state.lang === "hebrew" ? HEB_NUM(p) : String(p));
    b.type = "button";
    b.title = perekName(m, p);
    b.onclick = () => { setup.perakim.has(p) ? setup.perakim.delete(p) : setup.perakim.add(p); refresh(); };
    chips.append(b);
    return [p, b];
  });
  all.onclick = () => { setup.perakim = new Set(available); refresh(); };
  none.onclick = () => { setup.perakim = new Set(); refresh(); };
  form.append(chips);
  if (available.length < m.perakim) form.append(node("p", "muted small", ui.mPartial(available.length, m.perakim)));

  // the order of the questions
  form.append(node("div", "label", ui.mOrder));
  const orders = node("div", "qchips");
  const orderButtons = [[false, ui.mInOrder], [true, ui.mMixed]].map(([mix, label]) => {
    const b = node("button", "qchip", label);
    b.type = "button";
    b.onclick = () => { setup.mix = mix; refresh(); };
    orders.append(b);
    return [mix, b];
  });
  form.append(orders);

  const note = node("p", "qnote");
  const start = node("button", "button", ui.mStart);
  start.type = "button";
  const refresh = () => {
    chipButtons.forEach(([p, b]) => b.classList.toggle("on", setup.perakim.has(p)));
    orderButtons.forEach(([mix, b]) => b.classList.toggle("on", setup.mix === mix));
    const max = bankSize();
    start.disabled = !max;
    note.textContent = !max ? ui.mPick : ui.mWillDraw(Math.min(setup.count, max), setup.perakim.size, max);
  };
  form.append(note, start);
  host.append(form);
  syncSizes();
  refresh();
  available.forEach((p) => loadQuiz(m.slug, p).then((r) => { counts.set(p, (r.questions || []).length); if (start.isConnected) refresh(); }).catch(() => {}));

  const best = quizBest(`${key}:${setup.count}`);
  if (best) form.insertBefore(node("p", "quizbestline", `${ui.quizBest} (${setup.count}): ${ui.quizBestShort(best.right, best.total)} · ${ui.quizPoints(best.points)}`), note);

  start.onclick = () => {
    const chosen = available.filter((p) => setup.perakim.has(p));
    if (!chosen.length) return;
    start.disabled = true;
    note.textContent = ui.loading;
    Promise.all(chosen.map((p) => loadQuiz(m.slug, p).then((r) => ({ perek: p, questions: r.questions || [] }))))
      .then((banks) => {
        if (!state.quiz || quizKey(state.quiz) !== key) return;
        quizRuns.set(key, { chosen: new Map(), hinted: new Set(), questions: drawMasechet(banks, setup.count, setup.mix), size: setup.count });
        render();
        window.scrollTo(0, 0);
      })
      .catch(() => { note.textContent = ui.failed; start.disabled = false; });
  };
}

/** One quiz, question after question, with the score bar and the results card. */
function renderQuizRun(host, key, questions, { masechet }) {
  if (!quizRuns.has(key)) quizRuns.set(key, { chosen: new Map(), hinted: new Set() });
  const run = quizRuns.get(key);
  const total = questions.length;
  const bestKey = masechet ? `${key}:${run.size}` : key;
  const ui = t();
  const wrap = node("div", "quizwrap");
  if (ui.quizNote) wrap.append(node("p", "muted", ui.quizNote));

  const intro = node("div", "quizintro");
  intro.append(node("p", null, ui.quizRules(QUIZ_POINTS, QUIZ_STREAK_FROM, QUIZ_STREAK_BONUS)));
  const best = quizBest(bestKey);
  if (best) intro.append(node("p", "quizbestline", `${ui.quizBest}: ${ui.quizBestShort(best.right, best.total)} · ${ui.quizPoints(best.points)}`));
  wrap.append(intro);

  // the score bar: progress, points, streak
  const bar = node("div", "quizbar");
  const stats = node("div", "quizstats");
  const pointsBox = node("span", "quizpts");
  const streakBox = node("span", "quizstreak");
  const countBox = node("span", "quizcount");
  stats.append(pointsBox, streakBox, countBox);
  const restart = () => { quizRuns.delete(key); render(); window.scrollTo(0, 0); };
  const reset = node("button", null, masechet ? ui.mChange : ui.quizReset);
  reset.type = "button";
  reset.onclick = restart;
  const track = node("div", "quizprogress");
  const fill = node("div", "fill");
  track.append(fill);
  bar.append(stats, reset, track);
  wrap.append(bar);

  const list = node("ol", "quizlist");
  list.dir = "rtl";
  list.lang = "he";
  const items = [];
  const results = node("div", "quizresults");
  results.hidden = true;

  const update = () => {
    const tally = quizTally(questions, run);
    pointsBox.textContent = ui.quizPoints(tally.points);
    streakBox.textContent = tally.streak >= 2 ? `🔥 ${tally.streak}` : "";
    streakBox.classList.toggle("hot", tally.streak >= QUIZ_STREAK_FROM);
    countBox.textContent = ui.quizCount(tally.right, tally.done, total);
    fill.style.width = `${(tally.done / total) * 100}%`;
    return tally;
  };

  const finish = (fresh) => {
    const tally = quizTally(questions, run);
    const prior = quizBest(bestKey);
    const record = !prior || tally.points > prior.points;
    if (fresh && record) saveQuizBest(bestKey, { right: tally.right, total, points: tally.points });
    results.replaceChildren();
    results.hidden = false;
    results.append(node("h3", null, ui.quizRank(tally.right, total, !!masechet)));
    results.append(node("p", "quizfinal", `${ui.quizBestShort(tally.right, total)} · ${ui.quizPoints(tally.points)}`));
    results.append(node("p", "quizfacts", ui.quizLongest(tally.longest)));
    if (fresh && record && prior) results.append(node("p", "quizrecord", ui.quizNewBest));
    else if (prior && !record) results.append(node("p", "muted", `${ui.quizBest}: ${ui.quizPoints(prior.points)}`));
    if (tally.missed.length) {
      const again = node("div", "quizmissed");
      again.append(node("span", null, ui.quizReview));
      tally.missed.forEach((i) => {
        const b = node("button", null, String(i + 1));
        b.type = "button";
        b.onclick = () => items[i].scrollIntoView({ behavior: calm() ? "auto" : "smooth", block: "center" });
        again.append(b);
      });
      results.append(again);
    }
    const replay = node("button", "button", masechet ? ui.mAgain : ui.quizAgain);
    replay.type = "button";
    // a masechet quiz plays again with a fresh draw of the same size from the same perakim
    replay.onclick = masechet ? () => {
      const setup = masechetSetups.get(masechet.slug);
      const chosen = quizPerakim(masechet).filter((p) => !setup || setup.perakim.has(p));
      Promise.all(chosen.map((p) => loadQuiz(masechet.slug, p).then((r) => ({ perek: p, questions: r.questions || [] }))))
        .then((banks) => {
          quizRuns.set(key, { chosen: new Map(), hinted: new Set(), questions: drawMasechet(banks, run.size, !!(setup && setup.mix)), size: run.size });
          render();
          window.scrollTo(0, 0);
        });
    } : restart;
    results.append(replay);
    if (masechet) {
      const change = node("button", "button ghost", ui.mChange);
      change.type = "button";
      change.onclick = restart;
      results.append(change);
    }
    if (fresh) {
      if (tally.right / total >= 0.7) confetti();
      setTimeout(() => results.scrollIntoView({ behavior: calm() ? "auto" : "smooth", block: "center" }), 350);
    }
  };

  questions.forEach((q, i) => {
    const li = node("li", "quizq");
    items.push(li);
    if (q.perek) li.append(node("span", "quiztag", `פרק ${HEB_NUM(q.perek)}`));
    li.append(node("p", "quizprompt", q.q));
    const opts = node("div", "quizopts");
    const after = node("div", "quizafter");
    const buttons = q.o.map((text, k) => {
      const b = node("button", "quizopt", text);
      b.type = "button";
      b.onclick = () => {
        if (run.chosen.has(i)) return;
        run.chosen.set(i, k);
        show(true);
        const tally = update();
        if (k === q.a) {
          let gained = run.hinted.has(i) ? QUIZ_HINTED : QUIZ_POINTS;
          if (tally.streak >= QUIZ_STREAK_FROM) gained += QUIZ_STREAK_BONUS;
          floatUp(b, `+${gained}`, "good");
          if (tally.streak === total || [3, 5, 10, 15, 20, 25, 50].includes(tally.streak)) quizToast(bar, ui.quizStreakToast(tally.streak, total));
        }
        if (tally.done === total) finish(true);
      };
      opts.append(b);
      return b;
    });
    let hint = null;
    if (q.h) {
      hint = node("button", "quizhint", ui.quizHintBtn(QUIZ_HINTED));
      hint.type = "button";
      hint.onclick = () => { run.hinted.add(i); hint.replaceWith(node("p", "quizhinttext", q.h)); };
    }
    const show = (fresh) => {
      const pick = run.chosen.get(i);
      const good = pick === q.a;
      buttons.forEach((b, k) => {
        b.disabled = true;
        b.classList.toggle("right", k === q.a);
        b.classList.toggle("wrong", k === pick && !good);
      });
      li.classList.add(good ? "got" : "missed");
      if (fresh && !calm()) {
        li.classList.add(good ? "pop" : "shake");
        setTimeout(() => li.classList.remove("pop", "shake"), 600);
      }
      if (hint && hint.isConnected) hint.remove();
      after.replaceChildren();
      const verdict = node("p", "quizverdict " + (good ? "ok" : "no"));
      verdict.append(node("b", null, good ? ui.quizRight[i % ui.quizRight.length] : ui.quizWrong[i % ui.quizWrong.length]));
      verdict.append(" ", q.e);
      after.append(verdict);
      const ref = node("p", "quizref");
      const a = node("a", null, `${q.ref.replace(/^Mishnah /, "")} — ${ui.quizMishnah}`);
      a.href = sefariaUrl(q.ref); a.target = "_blank"; a.rel = "noopener";
      a.dir = "ltr";
      ref.append(a);
      after.append(ref);
    };
    li.append(opts);
    if (hint) li.append(hint);
    li.append(after);
    if (run.chosen.has(i)) show(false);
    list.append(li);
  });
  wrap.append(list, results);
  const tally = update();
  if (tally.done === total) finish(false);
  host.append(wrap);
}

function render() {
  renderChrome();
  renderLatest();
  renderSedarim();
  renderPerek();
}

function route() {
  const qp = location.hash.match(/^#([a-z-]+)-(\d+)-quiz$/);
  const qm = location.hash.match(/^#([a-z-]+)-quiz$/);
  state.quiz = qp && masechetBySlug(qp[1]) ? { slug: qp[1], perek: +qp[2] }
    : qm && masechetBySlug(qm[1]) ? { slug: qm[1] } : null;
  const m = location.hash.match(/^#([a-z-]+)-(\d+)$/);
  state.perek = m && masechetBySlug(m[1]) ? { slug: m[1], perek: +m[2] } : null;
  const sm = location.hash.match(/^#([a-z-]+)-summaries$/);
  state.summaries = sm && masechetBySlug(sm[1]) ? sm[1] : null;
  render();
  window.scrollTo(0, 0);
}

function go(slug, perek) { location.hash = `${slug}-${perek}`; }

document.querySelectorAll(".langswitch button").forEach((b) => b.addEventListener("click", () => {
  state.lang = b.dataset.lang;
  try { localStorage.setItem("mishnah-lang", state.lang); } catch {}
  render();
}));

try { state.lang = localStorage.getItem("mishnah-lang") || "hebrew"; } catch {}
window.addEventListener("hashchange", route);
load().then(route);

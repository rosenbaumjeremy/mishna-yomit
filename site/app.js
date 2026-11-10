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
    pending: (d) => `The summary, key terms and questions of the mefarshim on this perek will be published ${d}.`,
    pendingToday: "later today",
    pendingOn: (heb, greg) => `on ${greg} (${heb})`,
    era: { rishon: "Rishon", acharon: "Acharon", chazal: "Chazal" },
  },
};

const state = { lang: "hebrew", sedarim: [], days: [], perek: null, summaries: null, cache: new Map() };

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
  const [m, d] = await Promise.all([
    fetch("data/masechtot.json").then((r) => r.json()),
    fetch("data/perakim/index.json").then((r) => r.json()).catch(() => ({ days: [] })),
  ]);
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
  if (!last || state.perek || state.summaries) return;
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
  box.hidden = !!(state.perek || state.summaries);
  if (state.perek || state.summaries) return;
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
  head.append(node("h2", null, t().summariesOf(masechetName(m))), pdfTools());
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
  box.hidden = !state.perek && !state.summaries;
  box.replaceChildren();
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

function render() {
  renderChrome();
  renderLatest();
  renderSedarim();
  renderPerek();
}

function route() {
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

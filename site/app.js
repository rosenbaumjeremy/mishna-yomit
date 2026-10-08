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
    era: { rishon: "Rishon", acharon: "Acharon", chazal: "Chazal" },
  },
};

const state = { lang: "hebrew", sedarim: [], days: [], perek: null, cache: new Map() };

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
  if (!last || state.perek) return;
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
  box.hidden = !!state.perek;
  if (state.perek) return;
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
        if (published(m.slug, p)) {
          any = true;
          const a = node("a", "chip", label);
          a.href = `#${m.slug}-${p}`;
          chips.append(a);
        } else chips.append(node("span", "chip", label));
      }
      if (any) card.classList.add("has");
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
    body.append(node("p", null, it.data.explanation), cite(it.data.source));
  } else {
    const q = it.data;
    body.append(node("p", "anchor", `"${q.pasuk.text}"`), node("p", null, q.question));
    body.append(node("div", "label", t().askedBy));
    q.asked_by.forEach((w) => body.append(cite(w)));
    q.answers.forEach((a, i) => {
      const box = node("div", "answer");
      box.append(node("div", "label", t().answer(i)), node("p", null, a.text));
      a.sources.forEach((w) => box.append(cite(w)));
      body.append(box);
    });
    if (q.why) body.append(node("p", "why", `${t().why}: ${q.why}`));
  }
  d.append(s, body);
  d.addEventListener("mouseenter", () => light(it.id, true));
  d.addEventListener("mouseleave", () => light(it.id, false));
  return d;
}

function group(title, items, open) {
  const d = node("details", "box");
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

async function renderPerek() {
  const box = el("perek");
  box.hidden = !state.perek;
  box.replaceChildren();
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

  const sec = data[state.lang];
  const ref = `${m.title} ${perek}`;
  const head = node("div", "perek-head");
  head.append(node("h2", null, perekName(m, perek)));
  const meta = node("p");
  meta.append(`${data.hebrew_date[state.lang === "hebrew" ? "hebrew" : "english"]} · ${data.date} · `);
  const a = node("a", null, t().sefaria);
  a.href = sefariaUrl(ref); a.target = "_blank"; a.rel = "noopener";
  meta.append(a);
  head.append(meta);
  box.append(head);

  const sum = node("details", "box");
  sum.open = true;
  sum.append(node("summary", null, t().summary));
  const sb = node("div", "body");
  sb.append(node("p", null, sec.summary));
  sum.append(sb);
  box.append(sum);

  const items = [
    ...sec.topics.map((x, i) => ({ kind: "t", id: `t${i}`, title: x.term, mishnah: x.mishnah, anchors: x.anchors, data: x })),
    ...sec.questions.map((x, i) => ({ kind: "q", id: `q${i}`, title: x.title, mishnah: x.mishnah, anchors: x.anchors, data: x })),
  ];

  const layout = node("div", "layout");
  // right: the text
  const textCol = node("div", "text-col");
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
  const legend = node("p", "legend");
  legend.append(node("span", "lq", t().legendQ), node("span", "lt", t().legendT));
  textCol.append(card, legend);

  // left: terms and questions
  const side = node("div", "side-col");
  side.append(group(t().topics, items.filter((x) => x.kind === "t"), true));
  side.append(group(t().questions, items.filter((x) => x.kind === "q"), true));
  const src = node("details", "box");
  src.append(node("summary", null, t().sources));
  const srcBody = node("div", "body");
  srcBody.append(node("p", "sources", (sec.sources_consulted || []).join(" · ")));
  src.append(srcBody);
  side.append(src);

  layout.append(textCol, side);
  box.append(layout);
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

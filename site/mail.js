"use strict";

/* "Get by email": the reader chooses which sections of each day's brief to get,
   as in the PDF dialog, and signs up. The same file is in every study site that
   has daily emails (aliyah-yomit, tanach-summaries, mishna-yomit) — change it in
   one, copy it to the others. The site is named on the script tag:
     <script src="mail.js" data-site="aliyah"></script>
   The button goes into every [data-pdf-tools] spot, after PDF and Print.
   Sign-ups and sending are the daily-mail worker (its own repo); its address
   must be in the sites' Content-Security-Policy connect-src (site/_headers).
   Styles: mail.css plus the dialog styles in pdf.css. */

(() => {
  const API = "https://daily-mail.dailylearning.workers.dev";
  const SITE = document.currentScript.dataset.site;

  const TEXT = {
    he: {
      button: "במייל", title: "קבלה במייל בכל בוקר",
      ask: "אילו חלקים לקבל?", lang: "שפת המייל", email: "כתובת מייל",
      make: "הרשמה", cancel: "ביטול", close: "סגירה", loading: "טוען…",
      done: (e) => `שלחנו מייל אישור אל ${e}. לחצו על הקישור שבו כדי להתחיל לקבל. לא הגיע? בדקו בתיקיית הספאם.`,
      errors: { email: "כתובת המייל אינה תקינה.", sections: "בחרו לפחות חלק אחד.",
        "too many": "נשלחו כבר כמה מיילי אישור לכתובת הזאת היום. נסו שוב מחר.",
        other: "משהו השתבש. נסו שוב מאוחר יותר." },
      note: "בכל מייל יש קישור לשינוי הבחירות ולהסרה.",
    },
    en: {
      button: "Email", title: "Get it by email every morning",
      ask: "Which sections do you want?", lang: "Email language", email: "Email address",
      make: "Sign up", cancel: "Cancel", close: "Close", loading: "Loading…",
      done: (e) => `We sent a confirmation email to ${e}. Press the link in it to start. Not there? Check your spam folder.`,
      errors: { email: "That email address does not look right.", sections: "Choose at least one section.",
        "too many": "Several confirmation emails were already sent to this address today. Try again tomorrow.",
        other: "Something went wrong. Please try again later." },
      note: "Every email has a link to change your choices or unsubscribe.",
    },
  };
  const lang = () => ((document.documentElement.lang || "he").startsWith("en") ? "en" : "he");
  const tx = () => TEXT[lang()];
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  async function choose() {
    const t = tx();
    const dlg = el("dialog", "pdfdlg maildlg");
    dlg.dir = getComputedStyle(document.body).direction;
    dlg.append(el("h2", null, t.title));
    const ask = el("p", "ask", t.loading);
    dlg.append(ask);
    document.body.append(dlg);
    dlg.addEventListener("close", () => dlg.remove());
    dlg.showModal();

    const cancel = el("button", null, t.cancel);
    cancel.type = "button";
    cancel.onclick = () => dlg.close();
    const row = el("div", "pdfrow");

    let options;
    try {
      const res = await fetch(`${API}/options?site=${SITE}&lang=${lang()}`);
      if (!res.ok) throw new Error(res.status);
      options = (await res.json()).options;
    } catch {
      ask.textContent = t.errors.other;
      row.append(cancel);
      dlg.append(row);
      return;
    }
    ask.textContent = t.ask;

    const list = el("div", "pdflist");
    const boxes = [];
    const checkbox = (key, text, cls) => {
      const label = el("label", cls);
      const box = el("input");
      box.type = "checkbox";
      box.checked = true;
      box.value = key;
      label.append(box, text);
      list.append(label);
      boxes.push(box);
      return box;
    };
    for (const o of options) {
      const box = checkbox(o.key, o.label);
      if (!o.sub) continue;
      const sub = checkbox(o.sub.key, o.sub.label, "sub");
      // an option belongs to its section: greyed out while the section is not chosen
      box.addEventListener("change", () => {
        sub.disabled = !box.checked;
        sub.parentElement.classList.toggle("off", !box.checked);
      });
    }

    const langs = el("div", "maillang");
    langs.append(el("span", null, t.lang));
    for (const [value, text] of [["he", "עברית"], ["en", "English"]]) {
      const label = el("label");
      const radio = el("input");
      radio.type = "radio";
      radio.name = "maillang";
      radio.value = value;
      radio.checked = value === lang();
      label.append(radio, text);
      langs.append(label);
    }

    const email = el("input", "mailaddr");
    email.type = "email";
    email.autocomplete = "email";
    email.placeholder = t.email;
    email.setAttribute("aria-label", t.email);
    email.dir = "ltr";
    const msg = el("p", "mailmsg");
    msg.hidden = true;

    const go = el("button", "go", t.make);
    go.type = "button";
    go.onclick = async () => {
      const sections = boxes.filter((b) => b.checked && !b.disabled).map((b) => b.value);
      const address = email.value.trim();
      const show = (text) => { msg.textContent = text; msg.hidden = false; };
      if (!sections.length) return show(t.errors.sections);
      if (!email.checkValidity() || !address) return show(t.errors.email);
      go.disabled = true;
      try {
        const res = await fetch(`${API}/subscribe`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: address, site: SITE, sections,
            lang: (dlg.querySelector("input[name=maillang]:checked") || {}).value || lang() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { go.disabled = false; return show(t.errors[data.error] || t.errors.other); }
        // done: just the message and a close button
        [list, langs, email, ask, row, note].forEach((x) => x.remove());
        msg.classList.add("ok");
        show(t.done(address));
        const close = el("button", "go", t.close);
        close.type = "button";
        close.onclick = () => dlg.close();
        const end = el("div", "pdfrow");
        end.append(close);
        dlg.append(end);
      } catch {
        go.disabled = false;
        show(t.errors.other);
      }
    };
    email.addEventListener("keydown", (e) => { if (e.key === "Enter") go.click(); });

    const note = el("p", "mailnote", t.note);
    row.append(cancel, go);
    dlg.append(list, langs, email, msg, note, row);
    email.focus();
  }

  const ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="1.5" y="3.5" width="13" height="9" rx="1.2"/><path d="M2 4l6 5 6-5"/></g></svg>';

  // a button in every [data-pdf-tools] spot, once pdf.js has put PDF and Print
  // there (pdf.js shows or hides the spot)
  function refresh() {
    document.querySelectorAll("[data-pdf-tools]").forEach((spot) => {
      if (spot.querySelector(".mailbtn") || !spot.querySelector(".pdfbtn")) return;
      const b = el("button", "mailbtn");
      b.type = "button";
      b.innerHTML = ICON + "<span></span>";
      b.onclick = choose;
      spot.append(b);
    });
    document.querySelectorAll(".mailbtn").forEach((b) => {
      if (b.lastChild.textContent !== tx().button) b.lastChild.textContent = tx().button;
      b.title = tx().title;
    });
  }
  let queued = false;
  const later = () => { if (!queued) { queued = true; setTimeout(() => { queued = false; refresh(); }, 0); } };
  new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
  new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  refresh();
})();

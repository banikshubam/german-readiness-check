// ---------- CONFIG (change these to change what "ready" means) ----------
const CONFIG = {
  readyAt: 80,     // overall score needed for "Ready"
  almostAt: 60,    // overall score needed for "Almost ready" (60 is the real pass mark of the A1 exam)
  minPerSkill: 50  // a skill below this stops the verdict from being "Ready"
};

const SKILLS = { vocabulary: "Vocabulary", grammar: "Grammar", reading: "Reading" };

// What to practise for each topic a learner gets wrong
const TOPIC_TIPS = {
  greetings: "Review everyday polite phrases: danke, bitte, entschuldigung, tschüss.",
  places: "Learn the 20 most common places (der Bahnhof, die Apotheke, das Krankenhaus) together with their article.",
  numbers: "Practise numbers 1–100, especially 13–19 versus 30–90 (siebzehn vs. siebzig).",
  calendar: "Revise days of the week and months, and how they are written in German.",
  "verb endings": "Practise present-tense endings: ich komme, du kommst, er kommt, wir kommen.",
  articles: "Learn every noun with its article (der/die/das) and practise ein/eine/einen.",
  "word order": "Practise sentences where the verb stays in second position: Heute gehe ich ins Kino.",
  "messages": "Read short messages and underline the day, time and place before answering.",
  "signs": "Practise reading opening hours and notices; look for days, times and the word geschlossen."
};

// ---------- QUESTIONS ----------
const QUESTIONS = [
  { skill: "vocabulary", topic: "greetings", text: "How do you say “Thank you” in German?",
    options: ["Bitte", "Danke", "Tschüss", "Entschuldigung"], answer: 1 },
  { skill: "vocabulary", topic: "places", text: "What does “der Bahnhof” mean?",
    options: ["airport", "bakery", "train station", "hospital"], answer: 2 },
  { skill: "vocabulary", topic: "numbers", text: "Which number is “siebzehn”?",
    options: ["70", "7", "27", "17"], answer: 3 },
  { skill: "vocabulary", topic: "calendar", text: "Which word does not belong with the others: Montag, Dienstag, Juli, Freitag?",
    options: ["Montag", "Dienstag", "Juli", "Freitag"], answer: 2 },

  { skill: "grammar", topic: "verb endings", text: "Ich ___ aus Indien.",
    options: ["kommst", "kommt", "komme", "kommen"], answer: 2 },
  { skill: "grammar", topic: "articles", text: "___ Buch ist interessant. (das Buch)",
    options: ["Der", "Die", "Das", "Den"], answer: 2 },
  { skill: "grammar", topic: "word order", text: "Which sentence is correct?",
    options: ["Heute ich gehe ins Kino.", "Heute gehe ich ins Kino.", "Ich heute gehe ins Kino.", "Gehe heute ich ins Kino."], answer: 1 },
  { skill: "grammar", topic: "articles", text: "Ich habe ___ Bruder.",
    options: ["ein", "eine", "einem", "einen"], answer: 3 },

  { skill: "reading", topic: "messages",
    passage: "Hallo Anna,\nich bin am Samstag nicht zu Hause. Wir treffen uns am Sonntag um 15 Uhr im Café am Markt.\nLiebe Grüße, Tom",
    text: "When do Tom and Anna meet?",
    options: ["Saturday at 15:00", "Sunday at 15:00", "Sunday at 5:00", "Saturday at 5:00"], answer: 1 },
  { skill: "reading", topic: "messages",
    passage: "Hallo Anna,\nich bin am Samstag nicht zu Hause. Wir treffen uns am Sonntag um 15 Uhr im Café am Markt.\nLiebe Grüße, Tom",
    text: "Where do they meet?",
    options: ["At Tom's home", "At the station", "At the café at the market", "At Anna's home"], answer: 2 },
  { skill: "reading", topic: "signs",
    passage: "Praxis Dr. Weber\nSprechzeiten: Mo–Fr 8–12 Uhr\nMontag und Donnerstag auch 15–18 Uhr\nMittwochnachmittag geschlossen",
    text: "You want to come on Wednesday at 16:00. Is that possible?",
    options: ["Yes, the practice is open.", "No, it is closed on Wednesday afternoon.", "No, it is closed all day Wednesday.", "Yes, but only until 17:00."], answer: 1 },
  { skill: "reading", topic: "signs",
    passage: "Praxis Dr. Weber\nSprechzeiten: Mo–Fr 8–12 Uhr\nMontag und Donnerstag auch 15–18 Uhr\nMittwochnachmittag geschlossen",
    text: "On which days is the practice also open in the afternoon?",
    options: ["Tuesday and Wednesday", "Every day", "Monday and Thursday", "Only Friday"], answer: 2 }
];

// ---------- SCORING ----------
function score(answers) {
  const by = {};
  Object.keys(SKILLS).forEach(s => by[s] = { right: 0, total: 0 });
  const missed = {}; // topic -> number missed
  QUESTIONS.forEach((q, i) => {
    by[q.skill].total++;
    if (answers[i] === q.answer) by[q.skill].right++;
    else missed[q.topic] = (missed[q.topic] || 0) + 1;
  });
  const skills = {};
  Object.keys(by).forEach(s => skills[s] = Math.round(100 * by[s].right / by[s].total));
  const vals = Object.values(skills);
  const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);

  let level = overall >= CONFIG.readyAt ? "ready" : overall >= CONFIG.almostAt ? "almost" : "notyet";
  const weakSkill = Object.keys(skills).some(s => skills[s] < CONFIG.minPerSkill);
  if (level === "ready" && weakSkill) level = "almost";

  // top 3 topics to practise: most missed first, weaker skill first on ties
  const topicSkill = {};
  QUESTIONS.forEach(q => topicSkill[q.topic] = q.skill);
  const todo = Object.keys(missed)
    .sort((a, b) => missed[b] - missed[a] || skills[topicSkill[a]] - skills[topicSkill[b]])
    .slice(0, 3);
  return { skills, overall, level, todo, weakSkill };
}

// ---------- UI ----------
if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  let step = -1; // -1 intro, 0..n-1 questions, n results
  const answers = new Array(QUESTIONS.length).fill(null);

  function intro() {
    app.innerHTML = `
      <div class="card">
        <h1>Am I exam-ready?</h1>
        <p>Finished A1 German and thinking of booking your Goethe or ÖSD exam? Answer ${QUESTIONS.length} short questions on vocabulary, grammar and reading. You will see how ready you are for each skill and what to practise first.</p>
        <p class="muted">Takes about 5 minutes. This check does not cover listening, writing or speaking.</p>
        <button class="btn" id="start">Start the check</button>
      </div>`;
    document.getElementById("start").onclick = () => { step = 0; render(); };
  }

  function question() {
    const q = QUESTIONS[step];
    const pct = Math.round(100 * step / QUESTIONS.length);
    app.innerHTML = `
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="card">
        <div class="tag">${SKILLS[q.skill]} · Question ${step + 1} of ${QUESTIONS.length}</div>
        ${q.passage ? `<div class="passage">${q.passage}</div>` : ""}
        <h2>${q.text}</h2>
        ${q.options.map((o, i) => `<button class="option ${answers[step] === i ? "selected" : ""}" data-i="${i}">${o}</button>`).join("")}
        <div class="row">
          <button class="btn ghost" id="back" ${step === 0 ? "disabled" : ""}>Back</button>
          <button class="btn" id="next" ${answers[step] === null ? "disabled" : ""}>${step === QUESTIONS.length - 1 ? "See my result" : "Next"}</button>
        </div>
      </div>`;
    document.querySelectorAll(".option").forEach(b => b.onclick = () => { answers[step] = Number(b.dataset.i); question(); });
    document.getElementById("back").onclick = () => { step--; render(); };
    document.getElementById("next").onclick = () => { step++; render(); };
  }

  function colour(p) { return p >= CONFIG.readyAt ? "var(--good)" : p >= CONFIG.almostAt ? "var(--warn)" : "var(--bad)"; }

  function results() {
    const r = score(answers);
    const text = {
      ready: ["Ready", "Your result is strong across all three skills. Take one full practice test, including listening and speaking, before you book."],
      almost: ["Almost ready", "You are close, but one or more areas need work. Fix the points below, then retake this check before booking."],
      notyet: ["Not ready yet", "Booking now would be a risk. Work through the points below first; a few weeks of focused practice can change this."]
    }[r.level];
    app.innerHTML = `
      <div class="card">
        <div class="verdict ${r.level}">${text[0]} · ${r.overall}%</div>
        <p>${text[1]}</p>
        ${Object.keys(r.skills).map(s => `
          <div class="bar"><div class="label"><span>${SKILLS[s]}</span><span>${r.skills[s]}%</span></div>
          <div class="track"><div class="fill" style="width:${r.skills[s]}%;background:${colour(r.skills[s])}"></div></div></div>`).join("")}
        ${r.weakSkill && r.overall >= CONFIG.readyAt ? `<p class="muted">Your overall score is high, but one skill is weak, so we marked you “Almost ready”.</p>` : ""}
      </div>
      <div class="card">
        <h2>What to practise before booking</h2>
        ${r.todo.length ? `<ol class="todo">${r.todo.map(t => `<li><strong>${t[0].toUpperCase() + t.slice(1)}.</strong> ${TOPIC_TIPS[t]}</li>`).join("")}</ol>`
          : `<p>You answered everything correctly. Next step: do a full practice test that includes listening, writing and speaking.</p>`}
      </div>
      <p class="muted">${QUESTIONS.length} questions give an estimate, not a guarantee. One answer moves a skill score by 25 points. The real exam also tests listening, writing and speaking.</p>
      <button class="btn ghost" id="retry">Retake the check</button>`;
    document.getElementById("retry").onclick = () => { answers.fill(null); step = -1; render(); };
  }

  function render() {
    if (step < 0) intro();
    else if (step < QUESTIONS.length) question();
    else results();
    window.scrollTo(0, 0);
  }
  render();
}

if (typeof module !== "undefined") module.exports = { QUESTIONS, score, CONFIG };

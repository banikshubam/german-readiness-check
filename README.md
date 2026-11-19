# Am I exam-ready? – A1 German readiness check

A small web app for learners who have finished A1 German and are about to book a Goethe or ÖSD exam. The learner answers 12 short questions (4 vocabulary, 4 grammar, 4 reading). The app shows a readiness verdict, a score per skill, and the 2–3 topics to practise first.

No build step, no dependencies. Open `index.html` in a browser.

## How "ready" is calculated
- Each skill score = share of that skill's 4 questions answered correctly.
- Overall score = average of the three skill scores.
- **Ready** at 80% or more. **Almost ready** at 60–79%. **Not ready yet** below 60%.
- The real A1 pass mark is 60%. The bar for "Ready" is 80% because this check is short (one answer moves a skill by 25 points) and does not test listening, writing or speaking.
- If any skill is below 50%, the verdict cannot be "Ready", even when the average is high.
- "What to practise": the topics the learner missed most, weakest skill first, up to 3.

All thresholds are in `CONFIG` at the top of `app.js`. Questions and practice tips are plain data in the same file.

## Files
- `index.html` – page shell
- `style.css` – styling
- `app.js` – questions, scoring, screens

## Publish on GitHub Pages
1. Create a public repository and upload these files.
2. Settings → Pages → Deploy from a branch → `main` / root.
3. The site goes live at `https://<username>.github.io/<repository>/`.

## Limits (version 1)
- 12 questions give an estimate, not a guarantee.
- Reading is tested with two short texts only.
- Listening, writing and speaking are not covered.
